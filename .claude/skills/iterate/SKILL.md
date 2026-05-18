---
name: iterate
description: arkts-patterns 仓库工程级插件迭代工具。用于 @exam/<case>、exam/<case>、新的 ArkTS/HarmonyOS 实验案例、clean-room ClaudeCode runner、人类 DevEco Studio E2E、反馈回填、失败后二轮循环，以及把验证过的通用经验沉淀回插件开发过程。不是发布插件功能。
argument-hint: "@exam/<case> 或 exam/<case>"
---

# iterate

这是 `arkts-patterns` 仓库的工程级开发 Skill，用于迭代和验证插件本身。它不是 `skills/arkts-patterns/` 发布给用户的 ArkTS Skill 功能。

## 触发场景

当用户提出以下请求时使用本 Skill：

- `@exam/<case>/，新的实验案例，进行测试和迭代`
- `exam/<case>` 下出现新的 ArkTS / HarmonyOS 实验案例
- 需要用 clean-room ClaudeCode runner 验证 `arkts-patterns` 是否有效
- 人类开发者回填 DevEco Studio E2E 结果
- 某个实验失败后，需要判断是否进入二轮循环
- 需要从案例中提炼可迁移经验并优化插件

## 总原则

- 这是插件开发工具，不是插件用户功能。
- `.agents/skills/iterate/SKILL.md` 是本 Skill 的单一事实来源。
- `.claude/skills/iterate/SKILL.md` 是 Claude Code 适配副本或链接，用于 `/iterate`。
- `.codex/` 只放 Codex Hook / 配置适配，不作为 Codex Skill 自动发现入口。
- 不要把本工程迭代机制写入 `skills/arkts-patterns/`，除非某条经验已经被验证为通用 ArkTS 开发规则。
- 文档、prompt、检查清单、问卷和报告默认中文；路径、命令、JSON 字段名保留英文。

## 标准链路

1. **识别案例**
   - 从用户输入中提取 `@exam/<case>` 或 `exam/<case>`。
   - 如果没有明确 case，先定位最近的 `exam/` 新目录；仍不明确时再询问。

2. **读取案例**
   - 检查 `exam/<case>/` 是否存在。
   - 读取需求材料，例如 `README.md`、`requirement.md`、图片、压缩包或已有 DevEco 项目。
   - 如果需求不足，生成待补充项并停止，不启动 runner。

3. **构建案例级测试资产**
   - 从全局 `tests/case-template/` 生成或更新 `exam/<case>/tests/`。
   - 本地化以下资产：
     - `case.json`
     - `runner-prompt.md`
     - `human-e2e-checklist.md`
     - `human-e2e-response.md`
     - `review-rubric.md`
     - `runbook.md`
   - 资产必须围绕该案例需求，不照搬其他案例答案。

4. **运行 clean-room ClaudeCode**
   - 最新 App 产物输出到 `tmp/newApp/`。
   - 如果 `exam/<case>/` 有 DevEco 项目，复制为起点。
   - 如果只有需求包，从 `skills/arkts-patterns/empty-ability-template/` 创建起点。
   - 启动 ClaudeCode runner：
     ```powershell
     claude --bare -p <runner-prompt> --plugin-dir <repo-root> --dangerously-skip-permissions --output-format json --no-session-persistence --max-turns 20
     ```
   - Claude 必须自己使用 `arkts-patterns`、自己实现、自己构建、自己报告。
   - Claude 运行期间，Codex 不查看、不修复、不提示、不补充隐藏结论。

5. **Reviewer 阶段**
   - Claude 结束后，Codex 才收集：
     - Claude 输出
     - `tmp/newApp/` 文件摘要
     - 构建日志或 Claude 自报构建证据
     - diff / 修改摘要
   - 生成 `exam/<case>/tests/result.md` 和 `reviewer-notes.md`。
   - 在人类 E2E 前，状态只能是 `PendingHumanE2E` 或 `Inconclusive`。

6. **人类 DevEco Studio E2E**
   - 要求人类开发者在 DevEco Studio 打开：
     ```text
     tmp/newApp/
     ```
   - 暴露 `exam/<case>/tests/human-e2e-checklist.md`。
   - 人类可填写 `human-e2e-response.md`，也可直接把反馈贴回对话。
   - 未收到人类反馈时，不得标记 `Pass`。

7. **插件迭代**
   - 基于 Claude 产物、reviewer 审查、人类反馈和失败分类，决定是否更新：
     - `skills/arkts-patterns/SKILL.md`
     - `skills/arkts-patterns/references/`
     - `skills/arkts-patterns/empty-ability-template/`
     - `tests/case-template/`
     - `docs/iterations/`
   - 只有验证过的通用经验才能提升到发布插件内容。
   - 业务特定逻辑、私有细节、未验证猜测只保留在案例资产或迭代记录中。

8. **迭代报告和二轮循环**
   - 将迭代报告写入 `docs/iterations/<case>.md`。
   - 多轮迭代使用 `<case>-v2.md`、`<case>-v3.md`。
   - 如果任务未通过，先总结失败原因和拟议修复，再询问人类开发者是否进入二轮。
   - 进入下一轮前清理旧 `tmp/newApp/`，并把上一轮证据归档到 `exam/<case>/tests/runs/round-N/`。

## 护栏

- dangerous permission bypass 只能用于 `tmp/*App/` 这类临时 App 目录。
- clean-room runner prompt 不能泄露历史修复结论。
- Claude 运行期间 Codex 不介入。
- 构建成功不等于功能验收成功。
- 人工 E2E 未完成，不得标记 `Pass`。
- `tmp/` 不进 git。
- `exam/<case>/tests/` 可以被 git 追踪，用于保留实验资产。
- `docs/iterations/ITERATOR.md` 是设计记录，不是执行规范权威；执行以本 Skill 为准。

## 完成前检查

- 运行 `pwsh ./scripts/validate-docs.ps1`。
- 确认 `CLAUDE.md` 与 `AGENTS.md` 对齐。
- 确认 `.claude/settings.json` 与 `.codex/hooks.json` 可解析。
- 确认 `.claude/skills/iterate/SKILL.md` 与 `.agents/skills/iterate/SKILL.md` 同步。
- 确认 `skills/arkts-patterns/` 没有写入工程迭代器机制。

