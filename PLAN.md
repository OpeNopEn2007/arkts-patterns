# 基于官方机制校准的 `.agents` 权威 `iterate` 计划

## Summary

先按官方机制重新定锚：

- **Codex**：仓库级 Skill 的官方位置是 `.agents/skills/<skill-name>/SKILL.md`，并且 Codex 明确支持 symlinked skill folders。
- **Claude Code**：项目 Skill 的官方位置是 `.claude/skills/<skill-name>/SKILL.md`，Skill 可直接通过 `/skill-name` 调用；`.claude/commands/` 仍可用，但官方当前建议 Skill 可覆盖这类自定义命令场景。
- **Codex Hooks**：仓库 Hook 官方位置是 `<repo>/.codex/hooks.json` 或 `.codex/config.toml`。
- **Claude Code Hooks**：项目 Hook 官方位置是 `.claude/settings.json`，也支持 Skill frontmatter hooks，但本项目继续用项目级 settings 管理工程护栏。

因此，最终结构采用：`.agents` 管理 `iterate` Skill 权威内容，`.claude` 只做 Claude Code 适配，`.codex` 只做 Codex Hook / 配置适配；不把 `.codex/skills` 当作 Codex 自动发现入口。

参考：  
[Claude Code Skills](https://code.claude.com/docs/en/slash-commands)、[Claude Code Hooks](https://code.claude.com/docs/en/hooks)、[Codex Skills](https://developers.openai.com/codex/skills)、[Codex Hooks](https://developers.openai.com/codex/hooks)

## Key Changes

- 权威 Skill：
  ```text
  .agents/skills/iterate/SKILL.md
  ```
- Claude Code 适配：
  ```text
  .claude/skills/iterate/SKILL.md
  .claude/settings.json
  .claude/hooks/
  ```
  `.claude/skills/iterate/SKILL.md` 优先链接或同步自 `.agents/skills/iterate/SKILL.md`，用于支持 Claude Code `/iterate`。
- Codex 适配：
  ```text
  .codex/hooks.json
  .codex/hooks/
  .codex/README.md
  ```
  Codex 不依赖 `.codex/skills/` 自动发现 Skill；`.codex/README.md` 只说明 `.agents/skills/iterate/` 才是入口。
- 旧路径迁移：
  ```text
  .agents/skills/case-learning-iterator/ -> .agents/skills/iterate/
  .claude/skills/case-learning-iterator/ -> .claude/skills/iterate/
  .codex/skills/case-learning-iterator/  -> 删除或改为短说明
  ```

## Implementation Details

- `.agents/skills/iterate/SKILL.md` 是唯一允许手工编辑的 Skill 源。
- Claude Code 侧优先使用链接：
  - 如果 Windows/Git 环境允许，`.claude/skills/iterate/SKILL.md` 链接到 `.agents/skills/iterate/SKILL.md`。
  - 如果链接不稳定，则复制一份，并增加校验脚本保证两者一致。
- Codex 侧不做 `.codex/skills/iterate` 权威副本：
  - 因为官方 Codex 扫描 `.agents/skills`，不是 `.codex/skills`。
  - 如果保留 `.codex/skills/iterate/`，只能是 README/指针，不参与自动发现。
- `iterate` frontmatter：
  - `name: iterate`
  - `description`: 明确它是 `arkts-patterns` 仓库工程级插件迭代工具，用于 `@exam/<case>`、新实验案例、clean-room runner、人类 E2E、反馈后迭代。
  - Claude Code 可考虑 `argument-hint: "@exam/<case> 或 exam/<case>"`。
- 暂不新增 `.claude/commands/iterate.md`：
  - 官方当前 Skill 支持 `/skill-name` 调用。
  - 如果实测 `/iterate` 不可用，再加一个极薄 commands 兜底。

## Skill 权威内容

`iterate` Skill 承载完整工程链路：

1. 识别 `@exam/<case>` 或 `exam/<case>`。
2. 明确这是开发 `arkts-patterns` 插件的工程工具，不是发布插件功能。
3. 读取案例目录。
4. 从全局 `tests/case-template/` 生成 `exam/<case>/tests/`。
5. 生成中文 runner prompt、人类 E2E 清单、评分准则和回填表。
6. 运行 clean-room ClaudeCode，最新 App 输出到 `tmp/newApp/`。
7. Claude 运行期间 Codex 不介入。
8. Claude 结束后进入 reviewer 阶段。
9. 要求人类开发者打开 `tmp/newApp/` 并填写反馈。
10. 根据反馈决定是否提升通用经验到 `skills/arkts-patterns/`。
11. 写入 `docs/iterations/` 开发记录。
12. 失败时先询问人类是否进入二轮循环。

## Docs 与 Hook 调整

- `docs/iterations/ITERATOR.md`：
  - 改为设计背景、设计思想和设计原理。
  - 明确执行权威是 `.agents/skills/iterate/SKILL.md`。
- `docs/iterations/DEVELOPMENT-SKILL-SPEC.md`：
  - 可合并进 `ITERATOR.md`，避免第三份权威。
- `CLAUDE.md` / `AGENTS.md`：
  - 指向 `.agents/skills/iterate/SKILL.md`。
  - 明确 `.claude/` 和 `.codex/` 是适配层。
- `{date}-<case>.md`：
  - 更名为 `<case>.md`，如 `2026-05-17-smart-device-control.md` -> `smart-device-control.md`。
  - 每个 <case> 的迭代报告记录。
  - 如果有二次或多次对一个 <case> 的迭代，命名为 `<case>-v2.md` 等。
- 各层 `README.md` `AGENTS.md` `CLAUDE.md`：
  - 需要同步更新到最新状态。
  - 使用技能 `/neat-freak`。
- Hook：
  - Codex Hook 使用 `.codex/hooks.json`。
  - Claude Code Hook 使用 `.claude/settings.json`。
  - Hook 文案从 `case-learning-iterator` 改为 `iterate`。
  - 保留旧关键词识别，但提示使用 `iterate`。

## Test Plan

- 官方机制校验：
  - Codex：确认 `.agents/skills/iterate/SKILL.md` 可被发现。
  - Claude Code：确认 `.claude/skills/iterate/SKILL.md` 可通过 `/iterate` 调用。
  - Codex Hook：`python -m json.tool .codex/hooks.json`。
  - Claude Hook：`python -m json.tool .claude/settings.json`。
- 链接 / 同步校验：
  - 如果用链接，确认 `.claude/skills/iterate/SKILL.md` 可读且内容等于 `.agents/skills/iterate/SKILL.md`。
  - 如果用复制，新增校验命令比较两者一致。
- 迁移校验：
  - 旧 `case-learning-iterator` 目录不存在，或只保留迁移说明。
  - 所有文档引用改为 `iterate`。
- 边界校验：
  - `skills/arkts-patterns/` 不包含工程迭代器机制。
  - `.codex/skills/` 不被描述为 Codex Skill 自动发现位置。
- 项目校验：
  - `pwsh ./scripts/validate-docs.ps1`
  - `Compare-Object (Get-Content .\CLAUDE.md) (Get-Content .\AGENTS.md)`

## Assumptions

- `.agents/skills/iterate/` 是工程 Skill 单一事实来源。
- Claude Code 仍需要 `.claude/skills/iterate/` 适配入口才能项目内 `/iterate`。
- Codex 通过 `.agents/skills/iterate/` 发现 Skill，不依赖 `.codex/skills/`。
- 链接优先；链接不可用时采用复制 + 校验。
- 当前阶段只完善迭代器闭环，不做 LSP / DevEco MCP 实时诊断增强。
