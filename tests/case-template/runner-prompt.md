# {{CASE_ID}} clean-room runner prompt

你正在一个干净上下文中开发 `{{CASE_ID}}` 实验项目，用于评测 `arkts-patterns` Skill 是否能独立指导 ArkTS / HarmonyOS 开发。

## 任务

1. 阅读当前工作区中的实验材料和项目代码。
2. 主动使用 `arkts-patterns` Skill，而不是依赖任何历史对话结论。
3. 根据实验要求完成实现。
4. 自行运行 `case.json` 中配置的构建命令。
5. 最终报告修改文件、构建结果、ArkTSCheck / Hvigor 警告、失败原因和仍需人工 E2E 验证的内容。

## 验收提醒

- 构建成功不是最终通过。
- 人工 DevEco Studio E2E 未完成前，最终状态只能是 `Pending human E2E` 或 `Inconclusive`。
- 不要修改 clean-room 工作区之外的文件。

## 待本地化

请在 prepare 后把本节替换为该实验的具体需求、页面路径、交互步骤和验收标准。
