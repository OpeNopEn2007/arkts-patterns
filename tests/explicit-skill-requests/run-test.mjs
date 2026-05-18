#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..', '..');
const [skillName, promptFile, maxTurns = '3'] = process.argv.slice(2);

if (!skillName || !promptFile) {
  console.error('Usage: node tests/explicit-skill-requests/run-test.mjs <skill-name> <prompt-file> [max-turns]');
  process.exit(1);
}

const promptPath = resolve(repoRoot, promptFile);
if (!existsSync(promptPath)) {
  console.error(`Prompt file not found: ${promptPath}`);
  process.exit(1);
}

const runRoot = resolve(repoRoot, 'tmp', 'explicit-skill-requests', skillName, Date.now().toString());
mkdirSync(runRoot, { recursive: true });
const outputPath = resolve(runRoot, 'claude-output.ndjson');
const prompt = readFileSync(promptPath, 'utf8');

const result = spawnSync('claude', [
  '-p',
  prompt,
  '--plugin-dir',
  repoRoot,
  '--dangerously-skip-permissions',
  '--max-turns',
  maxTurns,
  '--output-format',
  'stream-json',
], {
  cwd: runRoot,
  encoding: 'utf8',
  maxBuffer: 20 * 1024 * 1024,
});

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
writeFileSync(outputPath, output, 'utf8');
const pattern = new RegExp(`"skill":"([^"]*:)?${escapeRegExp(skillName)}"`);
const triggered = output.includes('"name":"Skill"') && pattern.test(output);
const firstSkillLine = output.split(/\r?\n/).findIndex((line) => line.includes('"name":"Skill"'));
const prematureTool = firstSkillLine > 0
  ? output.split(/\r?\n/).slice(0, firstSkillLine).some((line) => line.includes('"type":"tool_use"') && !line.includes('"name":"TodoWrite"'))
  : false;

console.log(`Output: ${outputPath}`);
console.log(triggered ? `PASS: ${skillName} triggered` : `FAIL: ${skillName} not triggered`);
if (prematureTool) console.log('WARNING: non-Skill tool use occurred before first Skill invocation.');
process.exit(triggered ? 0 : 1);

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
