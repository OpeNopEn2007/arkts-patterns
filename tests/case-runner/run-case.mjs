#!/usr/bin/env node
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, cpSync, writeFileSync, readdirSync } from 'node:fs';
import { basename, dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, '..', '..');

const args = parseArgs(process.argv.slice(2));

main().catch((error) => {
  console.error(`[cleanroom] ${error.message}`);
  process.exit(error.exitCode ?? 1);
});

async function main() {
  if (args.prepare) {
    prepareCaseAssets(args);
    return;
  }

  const configPath = resolveConfigPath(args);
  const config = readJson(configPath);
  const caseId = requiredString(config.caseId, 'caseId');
  const timestamp = args.timestamp ?? makeTimestamp();
  const sourceProject = resolveInsideRepo(config.sourceProject, 'sourceProject');
  const promptPath = resolveInsideRepo(config.prompt, 'prompt');
  const runRoot = resolve(repoRoot, 'tmp', 'cleanroom-runs', caseId, timestamp);
  const workspace = resolve(repoRoot, args.appOutputDir ?? config.appOutputDir ?? 'tmp/newApp');
  const permission = args.permission ?? config.permission ?? 'dangerously-skip';
  const maxTurns = String(args.maxTurns ?? config.maxTurns ?? 20);
  const outputFormat = args.outputFormat ?? config.outputFormat ?? 'json';

  preflight({ configPath, caseId, sourceProject, promptPath, permission, runRoot, workspace });

  prepareWorkspace({ sourceProject, workspace, runRoot });

  const runnerPrompt = buildRunnerPrompt({ config, promptPath, workspace, permission });
  const runnerPromptPath = join(runRoot, 'runner-prompt.md');
  writeFileSync(runnerPromptPath, runnerPrompt, 'utf8');

  const humanChecklistPath = join(runRoot, 'human-e2e-checklist.md');
  const humanResponsePath = join(runRoot, 'human-e2e-response.md');
  writeFileSync(humanChecklistPath, buildHumanChecklist({ config, workspace, humanResponsePath }), 'utf8');
  writeFileSync(humanResponsePath, buildHumanResponse({ config }), 'utf8');
  mirrorHumanAssets({ configPath, config, workspace });

  const claudeCommand = buildClaudeCommand({ runnerPrompt, permission, maxTurns, outputFormat });

  if (args.dryRun) {
    writeFileSync(join(runRoot, 'dry-run.json'), JSON.stringify({
      mode: 'dry-run',
      caseId,
      configPath,
      sourceProject,
      workspace,
      runnerPromptPath,
      humanChecklistPath,
      humanResponsePath,
      claudeCommand: redactPromptArg(claudeCommand),
    }, null, 2), 'utf8');
    console.log(`[cleanroom] dry run prepared: ${runRoot}`);
    console.log(`[cleanroom] claude command: ${redactPromptArg(claudeCommand).join(' ')}`);
    return;
  }

  let claudeExitCode = 0;
  const outputPath = join(runRoot, outputFormat === 'stream-json' ? 'claude-stream.ndjson' : 'claude-output.json');

  if (args.fakeCompletedRun) {
    writeFileSync(join(workspace, 'CLEANROOM_FAKE_RESULT.txt'), 'fake completed run\n', 'utf8');
    writeFileSync(outputPath, JSON.stringify({
      type: 'result',
      subtype: 'success',
      result: 'Fake completed run. The arkts-patterns skill was invoked. Hvigor BUILD SUCCESSFUL.',
    }, null, 2), 'utf8');
  } else {
    claudeExitCode = await runClaude({ command: claudeCommand, cwd: workspace, outputPath });
  }

  const diffPath = join(runRoot, 'diff.patch');
  const diffSummary = writeDiff({ sourceProject, workspace, diffPath, config });
  const claudeOutput = safeRead(outputPath);
  const review = buildReview({ config, claudeExitCode, claudeOutput, diffSummary, outputPath, humanChecklistPath });
  writeFileSync(join(runRoot, 'result.md'), review, 'utf8');
  mirrorReviewAssets({ configPath, review, diffPath });

  console.log(`[cleanroom] run complete: ${runRoot}`);
  console.log(`[cleanroom] result: ${join(runRoot, 'result.md')}`);
  console.log(`[cleanroom] human E2E checklist: ${humanChecklistPath}`);

  if (claudeExitCode !== 0) {
    process.exit(2);
  }
}

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--dry-run') parsed.dryRun = true;
    else if (arg === '--fake-completed-run') parsed.fakeCompletedRun = true;
    else if (arg === '--prepare') parsed.prepare = true;
    else if (arg === '--force') parsed.force = true;
    else if (arg.startsWith('--')) {
      const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
      const value = argv[i + 1];
      if (!value || value.startsWith('--')) {
        throw Object.assign(new Error(`Missing value for ${arg}`), { exitCode: 1 });
      }
      parsed[key] = value;
      i += 1;
    }
  }
  return parsed;
}

function resolveConfigPath(parsed) {
  if (parsed.config) return resolve(repoRoot, parsed.config);
  if (parsed.case) {
    const normalized = parsed.case.replaceAll('\\', '/').replace(/\/$/, '');
    if (normalized.startsWith('exam/')) {
      return resolve(repoRoot, normalized, 'tests', 'case.json');
    }
    return resolve(repoRoot, 'tests', 'arkts-cases', `${parsed.case}.json`);
  }
  throw Object.assign(new Error('Use --case <case-id> or --config <path>.'), { exitCode: 1 });
}

function prepareCaseAssets(parsed) {
  if (!parsed.case) {
    throw Object.assign(new Error('Use --case exam/<case-id> with --prepare.'), { exitCode: 1 });
  }

  const caseRoot = resolveCaseRoot(parsed.case);
  if (!existsSync(caseRoot)) {
    throw Object.assign(new Error(`Case directory not found: ${caseRoot}`), { exitCode: 1 });
  }

  const caseId = basename(caseRoot);
  const testsDir = join(caseRoot, 'tests');
  mkdirSync(testsDir, { recursive: true });
  const sourceProject = detectSourceProject(caseRoot, testsDir);
  const replacements = {
    CASE_ID: caseId,
    CASE_TESTS_DIR: toRepoRelative(testsDir),
    SOURCE_PROJECT: toRepoRelative(sourceProject),
  };

  const templateDir = resolve(repoRoot, 'tests', 'case-template');
  const files = [
    'case.json',
    'runner-prompt.md',
    'human-e2e-checklist.md',
    'human-e2e-response.md',
    'review-rubric.md',
    'runbook.md',
  ];

  const written = [];
  const skipped = [];
  for (const file of files) {
    const target = join(testsDir, file);
    if (existsSync(target) && !parsed.force) {
      skipped.push(toRepoRelative(target));
      continue;
    }
    const rendered = renderTemplate(readFileSync(join(templateDir, file), 'utf8'), replacements);
    writeFileSync(target, rendered, 'utf8');
    written.push(toRepoRelative(target));
  }

  console.log(`[cleanroom] prepared case assets: ${toRepoRelative(testsDir)}`);
  console.log(`[cleanroom] source project: ${toRepoRelative(sourceProject)}`);
  for (const file of written) console.log(`[cleanroom] wrote: ${file}`);
  for (const file of skipped) console.log(`[cleanroom] skipped existing: ${file}`);
}

function resolveCaseRoot(caseArg) {
  const normalized = caseArg.replaceAll('\\', '/').replace(/\/$/, '');
  if (!normalized.startsWith('exam/')) {
    throw Object.assign(new Error('Prepare mode expects --case exam/<case-id>.'), { exitCode: 1 });
  }
  const resolved = resolveInsideRepo(normalized, 'case');
  if (!relative(repoRoot, resolved).replaceAll('\\', '/').startsWith('exam/')) {
    throw Object.assign(new Error('case must stay under exam/.'), { exitCode: 1 });
  }
  return resolved;
}

function detectSourceProject(caseRoot, testsDir) {
  if (looksLikeDevEcoProject(caseRoot)) return caseRoot;

  const children = readdirSync(caseRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== 'tests')
    .map((entry) => join(caseRoot, entry.name));
  const matches = children.filter(looksLikeDevEcoProject);
  if (matches.length === 1) return matches[0];
  if (matches.length > 1) {
    throw Object.assign(new Error(`Multiple DevEco projects found under ${caseRoot}. Use --force after editing case.json manually.`), { exitCode: 1 });
  }

  return createStarterProject(testsDir);
}

function looksLikeDevEcoProject(path) {
  return existsSync(join(path, 'AppScope', 'app.json5'))
    && existsSync(join(path, 'entry', 'src', 'main', 'module.json5'));
}

function createStarterProject(testsDir) {
  const starterProject = join(testsDir, 'starter-app');
  if (!existsSync(starterProject)) {
    cpSync(resolve(repoRoot, 'skills', 'arkts-patterns', 'empty-ability-template'), starterProject, {
      recursive: true,
      filter: (source) => {
        const normalized = source.replaceAll('\\', '/');
        return !/(^|\/)(\.hvigor|\.preview|oh_modules|build|\.git)(\/|$)/.test(normalized);
      },
    });
  }
  return starterProject;
}

function renderTemplate(text, replacements) {
  return text.replace(/\{\{([A-Z0-9_]+)\}\}/g, (match, key) => replacements[key] ?? match);
}

function toRepoRelative(path) {
  return relative(repoRoot, path).replaceAll('\\', '/');
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    throw Object.assign(new Error(`Cannot read JSON ${path}: ${error.message}`), { exitCode: 1 });
  }
}

function requiredString(value, field) {
  if (typeof value !== 'string' || value.length === 0) {
    throw Object.assign(new Error(`Config field ${field} must be a non-empty string.`), { exitCode: 1 });
  }
  return value;
}

function resolveInsideRepo(value, field) {
  const resolved = isAbsolute(value) ? resolve(value) : resolve(repoRoot, value);
  const rel = relative(repoRoot, resolved);
  if (rel.startsWith('..') || isAbsolute(rel)) {
    throw Object.assign(new Error(`${field} must stay inside repository root.`), { exitCode: 1 });
  }
  return resolved;
}

function preflight({ configPath, caseId, sourceProject, promptPath, permission, runRoot, workspace }) {
  if (!existsSync(configPath)) throw Object.assign(new Error(`Config not found: ${configPath}`), { exitCode: 1 });
  if (!existsSync(sourceProject)) throw Object.assign(new Error(`Source project not found: ${sourceProject}`), { exitCode: 1 });
  if (!existsSync(promptPath)) throw Object.assign(new Error(`Prompt not found: ${promptPath}`), { exitCode: 1 });
  if (!existsSync(resolve(repoRoot, '.claude-plugin', 'plugin.json'))) {
    throw Object.assign(new Error('Missing .claude-plugin/plugin.json.'), { exitCode: 1 });
  }
  readJson(resolve(repoRoot, '.claude-plugin', 'plugin.json'));
  if (!relative(repoRoot, sourceProject).replaceAll('\\', '/').startsWith('exam/')) {
    throw Object.assign(new Error('sourceProject must be under exam/ for dangerous clean-room runs.'), { exitCode: 1 });
  }
  if (!relative(repoRoot, runRoot).replaceAll('\\', '/').startsWith(`tmp/cleanroom-runs/${caseId}/`)) {
    throw Object.assign(new Error('runRoot must stay under tmp/cleanroom-runs/<case-id>/.'), { exitCode: 1 });
  }
  const workspaceRel = relative(repoRoot, workspace).replaceAll('\\', '/');
  if (!/^tmp\/[^/]+App(\/|$)/.test(workspaceRel)) {
    throw Object.assign(new Error('app output workspace must stay under tmp/*App/.'), { exitCode: 1 });
  }
  if (!['dangerously-skip', 'acceptEdits'].includes(permission)) {
    throw Object.assign(new Error('permission must be dangerously-skip or acceptEdits.'), { exitCode: 1 });
  }
  const claudeVersion = spawnSync('claude', ['--version'], { cwd: repoRoot, encoding: 'utf8' });
  if (claudeVersion.status !== 0) {
    throw Object.assign(new Error('Claude Code CLI is not available as claude.'), { exitCode: 1 });
  }
}

function prepareWorkspace({ sourceProject, workspace, runRoot }) {
  if (existsSync(runRoot)) rmSync(runRoot, { recursive: true, force: true });
  if (existsSync(workspace)) rmSync(workspace, { recursive: true, force: true });
  mkdirSync(runRoot, { recursive: true });
  mkdirSync(dirname(workspace), { recursive: true });
  cpSync(sourceProject, workspace, {
    recursive: true,
    filter: (source) => {
      const normalized = source.replaceAll('\\', '/');
      return !/(^|\/)(\.hvigor|\.preview|oh_modules|build|\.git)(\/|$)/.test(normalized);
    },
  });
}

function buildRunnerPrompt({ config, promptPath, workspace }) {
  const basePrompt = readFileSync(promptPath, 'utf8').trim();
  const build = config.build;
  const buildText = build?.command
    ? [
        '## 你必须自己运行的构建命令',
        '',
        `工作目录：${build.cwd ?? '.'}`,
        '',
        '```powershell',
        build.command,
        '```',
        '',
        build.successText ? `成功标志文本：\`${build.successText}\`。` : '',
      ].join('\n')
    : '未配置构建命令。请在报告中明确说明。';

  return [
    '# clean-room arkts-patterns Runner 任务',
    '',
    '你是一个独立的 Claude Code runner，目标是评测本地 `arkts-patterns` 插件能否指导完成这个任务。',
    '',
    '硬性规则：',
    '- 实现前必须使用已加载插件中的 `arkts-patterns` Skill。',
    '- 只能在下面给出的项目工作区内工作。',
    '- 不要向协调员索要提示。',
    '- 不要假设存在来自历史对话的隐藏修复或调试结论。',
    '- 完成实现后，必须自己运行配置中的构建命令。',
    '- 最终报告必须包含修改文件、构建结果、警告、失败原因，以及尚未验证的验收标准。',
    '',
    `项目工作区：${workspace}`,
    '',
    '## 用户任务',
    '',
    basePrompt,
    '',
    '## 验收标准',
    '',
    ...(config.acceptanceCriteria ?? []).map((item) => `- ${item}`),
    '',
    buildText,
  ].join('\n');
}

function buildHumanChecklist({ config, workspace, humanResponsePath }) {
  const human = config.humanE2E ?? {};
  const checklist = human.checklist ?? [];
  const setup = human.setup ?? [];
  const blockers = [
    'clean-room 项目无法在 DevEco Studio 中打开。',
    'Previewer 无法渲染目标页面。',
    '执行任一必测检查项时应用崩溃。',
    '存在无法测试的必需验收标准。',
  ];

  return [
    `# 人工 E2E 验收清单：${config.caseId}`,
    '',
    `工具：${human.tool ?? 'DevEco Studio Previewer'}`,
    '',
    '请在 DevEco Studio 中打开这个 clean-room 项目路径：',
    '',
    '```text',
    workspace,
    '```',
    '',
    '## 准备步骤',
    '',
    ...setup.map((item, index) => `${index + 1}. ${item}`),
    '',
    '## 检查清单',
    '',
    ...checklist.flatMap((item, index) => [
      `### ${index + 1}. ${item.id}`,
      '',
      `操作：${item.action}`,
      '',
      `预期结果：${item.expected}`,
      '',
      `评分：${item.score ?? '0-2'}。0 = 失败，1 = 部分通过，2 = 完全通过。`,
      '',
    ]),
    '## 阻塞失败',
    '',
    ...blockers.map((item) => `- ${item}`),
    '',
    '## 回填方式',
    '',
    `请填写 ${humanResponsePath}，或者把答案直接粘贴回主对话。`,
  ].join('\n');
}

function buildHumanResponse({ config }) {
  const questions = config.humanE2E?.questionnaire ?? [];
  return [
    `# 人工 E2E 回填表：${config.caseId}`,
    '',
    '## 检查项评分',
    '',
    ...(config.humanE2E?.checklist ?? []).map((item) => `- ${item.id}: `),
    '',
    '## 问卷',
    '',
    ...questions.map((item) => `- ${item}: `),
    '',
    '## 总体结论',
    '',
    '- Final Acceptance Status: Pending human E2E',
    '- Plugin Effectiveness Judgment: Inconclusive',
  ].join('\n');
}

function mirrorHumanAssets({ configPath, config, workspace }) {
  const caseTestsDir = getCaseTestsDir(configPath);
  if (!caseTestsDir) return;

  const checklistPath = join(caseTestsDir, 'human-e2e-checklist.md');
  const responsePath = join(caseTestsDir, 'human-e2e-response.md');
  writeFileSync(checklistPath, buildHumanChecklist({ config, workspace, humanResponsePath: responsePath }), 'utf8');
  if (!existsSync(responsePath)) {
    writeFileSync(responsePath, buildHumanResponse({ config }), 'utf8');
  }
}

function mirrorReviewAssets({ configPath, review, diffPath }) {
  const caseTestsDir = getCaseTestsDir(configPath);
  if (!caseTestsDir) return;

  writeFileSync(join(caseTestsDir, 'result.md'), review, 'utf8');
  writeFileSync(join(caseTestsDir, 'reviewer-notes.md'), [
    '# Reviewer 记录',
    '',
    review,
    '',
    `Diff 证据：${diffPath}`,
  ].join('\n'), 'utf8');
}

function getCaseTestsDir(configPath) {
  const rel = relative(repoRoot, configPath).replaceAll('\\', '/');
  if (!/^exam\/[^/]+\/tests\/case\.json$/.test(rel)) return null;
  return dirname(configPath);
}

function buildClaudeCommand({ runnerPrompt, permission, maxTurns, outputFormat }) {
  const command = [
    'claude',
    '--bare',
    '-p',
    runnerPrompt,
    '--plugin-dir',
    repoRoot,
    '--output-format',
    outputFormat,
    '--no-session-persistence',
    '--max-turns',
    maxTurns,
  ];
  if (permission === 'dangerously-skip') {
    command.push('--dangerously-skip-permissions');
  } else {
    command.push('--permission-mode', 'acceptEdits');
  }
  return command;
}

async function runClaude({ command, cwd, outputPath }) {
  return new Promise((resolvePromise) => {
    const child = spawn(command[0], command.slice(1), {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      output += chunk.toString();
    });
    child.on('close', (code) => {
      writeFileSync(outputPath, output, 'utf8');
      resolvePromise(code ?? 1);
    });
  });
}

function writeDiff({ sourceProject, workspace, diffPath, config }) {
  const diffPaths = config.diffPaths ?? [
    'entry/src',
    'entry/src/main/module.json5',
    'AppScope/app.json5',
    'build-profile.json5',
    'entry/build-profile.json5',
    'oh-package.json5',
    'entry/oh-package.json5',
  ];
  let combined = '';
  for (const item of diffPaths) {
    const left = join(sourceProject, item);
    const right = join(workspace, item);
    if (!existsSync(left) && !existsSync(right)) continue;
    const diff = spawnSync('git', ['diff', '--no-index', '--', left, right], {
      cwd: repoRoot,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
    const text = diff.stdout && diff.stdout.trim().length > 0
      ? diff.stdout
      : diff.status && diff.status > 1
        ? `${diff.stdout ?? ''}${diff.stderr ?? ''}`
        : '';
    if (text.trim().length > 0) {
      combined += `\n# Diff for ${item}\n${text}\n`;
    }
  }
  writeFileSync(diffPath, combined || 'No diff detected in configured diff paths.\n', 'utf8');
  return summarizeDiff(combined);
}

function summarizeDiff(diffText) {
  if (!diffText.trim()) return { changed: false, files: [], hash: null };
  const files = [...diffText.matchAll(/^\+\+\+ b\/(.+)$/gm)].map((match) => match[1]);
  return {
    changed: true,
    files: [...new Set(files)].slice(0, 50),
    hash: createHash('sha256').update(diffText).digest('hex').slice(0, 12),
  };
}

function buildReview({ config, claudeExitCode, claudeOutput, diffSummary, outputPath, humanChecklistPath }) {
  const outputLower = claudeOutput.toLowerCase();
  const successText = config.build?.successText ?? 'BUILD SUCCESSFUL';
  const buildPassed = claudeOutput.includes(successText);
  const skillTriggered = outputLower.includes('arkts-patterns') || outputLower.includes('"skill":"arkts-patterns"');
  const warningsMentioned = /warning|arktscheck|hvigor|警告/i.test(claudeOutput);

  return [
    `# Clean-Room 结果：${config.caseId}`,
    '',
    '## 状态',
    '',
    `- Claude runner 退出码：${claudeExitCode}`,
    `- Final Acceptance Status: Pending human E2E`,
    `- Plugin Effectiveness Judgment: Inconclusive`,
    '',
    '## 自动 reviewer 评分',
    '',
    `- skill_triggered: ${skillTriggered ? '发现证据' : '未发现明确证据'}`,
    `- build_result: ${buildPassed ? `发现 ${successText}` : `未发现 ${successText}`}`,
    `- diff_quality: ${diffSummary.changed ? `需要审查；diff hash ${diffSummary.hash}` : '配置的 diff 路径未检测到变更'}`,
    '- requirement_coverage: 静态审查待完成；必须进行人工 E2E',
    `- warning_handling: ${warningsMentioned ? 'runner 输出提到了警告或工具链信息' : '未发现警告证据'}`,
    '- runner_independence: runner 执行期间没有 Codex 介入',
    '- human_e2e_pending: 是',
    '',
    '## 文件',
    '',
    `- Claude 输出：${outputPath}`,
    `- 人工 E2E 清单：${humanChecklistPath}`,
    '',
    '## 配置 diff 路径中的变更文件',
    '',
    ...(diffSummary.files.length > 0 ? diffSummary.files.map((file) => `- ${file}`) : ['- 未检测到']),
    '',
    '## Reviewer 备注',
    '',
    '- 人工 DevEco Studio E2E 回填完成前，不要把该案例标记为 Pass。',
    '- 最终结果需要记录到对应的 docs/iterations 案例记录中。',
  ].join('\n');
}

function safeRead(path) {
  try {
    return readFileSync(path, 'utf8');
  } catch {
    return '';
  }
}

function redactPromptArg(command) {
  const redacted = [...command];
  const promptIndex = redacted.indexOf('-p');
  if (promptIndex >= 0 && redacted[promptIndex + 1]) {
    redacted[promptIndex + 1] = `<runner prompt: ${redacted[promptIndex + 1].length} chars>`;
  }
  return redacted;
}

function makeTimestamp() {
  return new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, 'Z');
}
