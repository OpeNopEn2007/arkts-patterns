# Codex 项目自动化

这个目录存放用于构建和改进 `arkts-patterns` 插件的 Codex 项目自动化配置。

## 仓库级 Skill 位置

Codex 从 `.agents/skills/` 发现仓库级 Skill，因此工程级迭代器 Skill 的权威位置是：

```text
.agents/skills/iterate/SKILL.md
```

`.codex/` 只保留 Codex Hook、配置和说明，不作为 Codex Skill 自动发现入口。

## Hooks

`hooks.json` 把非变更型提醒接入：

- `UserPromptSubmit`：当 prompt 看起来像实验、clean-room 运行或经验沉淀请求时，提醒使用 `iterate`。
- `Stop`：当回答看起来已经完成时，提醒按 `iterate` 的工程护栏检查再收尾。

Hook 脚本只输出 JSON 上下文或提醒。它们不会编辑文件，也不会自动提升经验。

