# arkts-patterns v3 Skill + DevEco MCP 架构重设计规格计划书

## 1. 背景

`arkts-patterns` 当前是面向 HarmonyOS NEXT / ArkTS 开发的 Claude Code skill/plugin，核心资产包括：

- `.claude-plugin/plugin.json`
- `skills/arkts-patterns/SKILL.md`
- `skills/arkts-patterns/references/01-*.md` 至 `27-*.md`
- `skills/arkts-patterns/empty-ability-template/`
- `skills/arkts-patterns/scripts/scaffold.sh`

v3 的方向是将插件从“离线 HarmonyOS 文档镜像”重定位为“鸿蒙应用智能体开发能力插件”。Skill 负责把稳定的 ArkTS/HarmonyOS 工程模式注入智能体的持久上下文；DevEco MCP 负责实时查询最新规范，并借用本机 DevEco Studio / HarmonyOS SDK 工具链完成检查、同步、构建、运行和 UI 验证。

## 2. 问题陈述

现有架构存在以下问题：

- `references/` 容易滑向维护官方文档副本，成本高且容易过期。
- 华为官方文档有动态渲染和版本变化，静态抓取不能长期可靠覆盖最新 API。
- `SKILL.md` 对“何时读 references、何时查官方资料、何时验证真实项目”缺少明确编排。
- 智能体生成 ArkTS 代码后，缺少标准化的检查、同步、构建、运行和 UI 验证闭环。
- DevEco MCP 已经提供本地实时工具能力，但当前插件尚未明确纳入方式。

## 3. 设计目标

- 将 `SKILL.md` 重定位为 orchestrator：负责任务识别、工具路由、验证策略和降级路径。
- 将 `references/` 重定位为 persistent memory：保留稳定、高价值、模型容易出错的 ArkTS/HarmonyOS 工程模式。
- 将 DevEco MCP 作为 live tooling：用于最新知识查询、ETS 检查、项目同步、构建、启动、UI 树、UI 操作和 UI 验证。
- 降低维护完整官方文档镜像的负担。
- 保证 DevEco MCP 不可用时，插件仍能通过 references 提供基础开发能力。
- 明确 MCP 有副作用工具的调用边界。
- 保持当前仓库结构兼容，减少破坏性迁移。

## 4. 非目标

- 不复制完整 HarmonyOS 官方文档。
- 不把 `references/` 当作官方 API 的完整替代品。
- 不强制所有用户必须安装 DevEco MCP。
- 不在仓库中保存用户本机 `DEVECO_PATH`、设备信息、账号、证书或 token。
- 不把插件做成 DevEco Studio 替代品。
- 不默认自动执行有明显副作用的 MCP 工具。
- 不重命名或删除 `references/01-*.md` 至 `27-*.md` 文件。

## 5. 目标用户

主要用户：

- 使用 Claude Code / AI 编程智能体开发 HarmonyOS NEXT 应用的开发者。
- 需要 ArkTS、ArkUI、Stage Model、Navigation、状态管理、数据持久化等模式辅助的开发者。
- 希望智能体能调用 DevEco MCP 完成真实工程验证的高级用户。

次要用户：

- 插件维护者。
- 希望学习 ArkTS/HarmonyOS 工程模式的开发者。
- 在 CI 或本地自动化流程中验证 ArkTS 项目的用户。

## 6. 核心架构

```text
arkts-patterns v3
├── Layer 1: SKILL.md Orchestrator
│   ├── 任务识别
│   ├── references 路由
│   ├── DevEco MCP 调用策略
│   ├── MCP 可用性判断
│   ├── 验证策略
│   └── 降级策略
│
├── Layer 2: references Persistent Memory
│   ├── 稳定 ArkTS/HarmonyOS 工程模式
│   ├── 高频错误规避
│   ├── 代码生成约束
│   ├── 模板说明
│   └── MCP 不可用时的离线兜底
│
└── Layer 3: DevEco MCP Live Tooling
    ├── harmonyos_knowledge_search
    ├── check_ets_files
    ├── project_sync
    ├── build_project
    ├── start_app
    ├── get_app_ui_tree
    ├── perform_ui_action
    └── verify_ui
```

核心原则：

```text
SKILL.md teaches the agent when to use each layer.
references teach the agent how to think and code.
DevEco MCP lets the agent check what is true now and operate the project.
```

## 7. 任务路由策略

| 任务类型 | 首选路径 | 兜底路径 |
| --- | --- | --- |
| ArkTS 稳定模式、代码骨架、最佳实践 | references | `SKILL.md` 内置最小模式 |
| 最新 HarmonyOS API / 规范查询 | DevEco MCP `harmonyos_knowledge_search` | references + 官方文档查询流程 |
| 编写或修改 `.ets` 文件 | references + DevEco MCP 检查 | references 手工规则检查 |
| 检查 ETS 语法/规范 | DevEco MCP `check_ets_files` | 静态审阅 + 用户提供日志 |
| 项目同步 | DevEco MCP `project_sync` | 提示用户在 DevEco Studio 中同步 |
| 项目构建 | DevEco MCP `build_project` | 提示用户本地构建并提供日志 |
| 启动应用 | DevEco MCP `start_app` | 提示用户手动启动 |
| UI 树检查 | DevEco MCP `get_app_ui_tree` | 代码审查 + 截图/日志 |
| UI 操作 | DevEco MCP `perform_ui_action` | 用户手动操作反馈 |
| UI 验证 | DevEco MCP `verify_ui` | 截图审查或人工验收 |

`SKILL.md` 应明确：

- 当 DevEco MCP 工具可用时，优先用于实时 API 查询、ETS 验证、工程同步、构建、启动、UI 树检查、UI 操作和 UI 验证。
- 当 DevEco MCP 工具不可用时，使用 references 作为稳定记忆，并明确哪些实时验证没有执行。

## 8. references 重定位方案

`references/` 保留，但从“文档镜像层”转为“精选工程记忆层”。

保留原因：

- Skill 的核心价值是把技术文档学习成果转化为持久上下文。
- references 能稳定约束模型行为，避免过期训练数据导致错误。
- DevEco MCP 依赖本机环境，不能作为唯一入口。
- references 适合沉淀长期稳定的工程判断，而不是追逐每个 API 细节。

应重点保留：

- ArkTS 装饰器和状态管理规则。
- ArkUI 组件组合模式。
- Stage Model / UIAbility 生命周期。
- Navigation 推荐模式。
- 网络、持久化、并发、权限、安全等稳定工程模式。
- 模型高频错误与正确写法。
- EmptyAbility template 使用说明。
- MCP 使用策略与降级策略说明。

不应继续重点维护：

- 大规模 API 索引。
- 易过期的官方参数表。
- 需要实时确认的 SDK 版本差异。
- 可由 DevEco MCP 实时查询的工具链细节。

仓库约束：

- 保留 `references/01-*.md` 至 `27-*.md` 文件名。
- 保持 `references/README.md` 与实际文件一致。
- 不删除、重命名或重构 `empty-ability-template/`，除非另行明确批准。
- 文档或 template 改动后必须运行 `pwsh ./scripts/validate-docs.ps1`。

## 9. DevEco MCP 配置与调用策略

v3 第一阶段采用“指导配置 + example”，不立即自动内置 MCP。

理由：

- DevEco MCP 依赖本机 DevEco Studio / HarmonyOS SDK 工具链。
- `DEVECO_PATH` 是用户机器私有路径，不应写死进插件。
- 自动内置 MCP 可能导致未配置用户出现启动失败或信任提示。
- 先通过 example 验证真实使用体验，再决定是否内置。

推荐配置示例：

```json
{
  "mcpServers": {
    "deveco": {
      "command": "npx",
      "args": ["-y", "@deveco-codegenie/mcp@beta"],
      "env": {
        "DEVECO_PATH": "path/to/DevEco Studio",
        "PROJECT_PATH": "path/to/HarmonyOS project"
      }
    }
  }
}
```

配置或排查时应优先联网查看 npm 包页：<https://www.npmjs.com/package/@deveco-codegenie/mcp>。包页 README 和当前 dist-tag 优先于本规格中的转述；网页不可抓取时，可使用 `npm view @deveco-codegenie/mcp@beta version dist-tags description --json` 获取当前版本与标签信息。

MCP 调用策略：

- 最新规范/API 查询：优先 `harmonyos_knowledge_search`
- ETS 代码检查：优先 `check_ets_files`
- 项目同步：优先 `project_sync`
- 构建验证：优先 `build_project`
- 启动验证：优先 `start_app`
- UI 结构检查：优先 `get_app_ui_tree`
- UI 操作：谨慎使用 `perform_ui_action`
- UI 验证：优先 `verify_ui`

## 10. 降级策略

当 DevEco MCP 不可用时，智能体必须：

1. 明确说明 MCP 不可用或未配置。
2. 继续使用 `references/` 提供稳定模式指导。
3. 对最新 API 或 SDK 行为保持谨慎，不声称已实时验证。
4. 对构建、同步、UI 验证等无法执行的动作明确标注“未验证”。
5. 必要时请求用户提供 DevEco 构建日志、ETS 检查结果、运行截图、UI 层级信息、目标 SDK / API 版本。

示例降级声明：

```text
当前未检测到 DevEco MCP，因此无法执行 ETS 检查和项目构建。
我会基于 arkts-patterns references 给出实现，并标注需要你本地验证的步骤。
```

## 11. 安全 / 副作用边界

| 工具 | 副作用等级 | 策略 |
| --- | --- | --- |
| `harmonyos_knowledge_search` | 低 | 可直接使用 |
| `check_ets_files` | 低 | 可直接使用 |
| `get_app_ui_tree` | 低到中 | 可在 UI 验证任务中使用 |
| `project_sync` | 中 | 明确开发任务中可用，必要时说明 |
| `build_project` | 中 | 明确验证任务中可用 |
| `start_app` | 中到高 | 应说明会启动应用或连接设备 |
| `perform_ui_action` | 高 | 应在用户明确需要 UI 操作时使用 |
| `verify_ui` | 中 | 可在 UI 验证任务中使用，但需说明验证范围 |

安全原则：

- 不保存用户本机路径和设备信息。
- 不把 `DEVECO_PATH` 写入 tracked 文件。
- 不自动执行 UI 操作，除非任务明确要求。
- 不在无上下文情况下启动应用或操作设备。
- 对项目同步、构建、启动、UI 操作等动作，最终结果必须反馈给用户。

## 12. 分阶段实施计划

### Phase 0：规格锁定

交付：

- 本规格计划书。
- 用户拍板关键事项。
- 不修改功能代码。

完成标准：

- 用户确认 v3 定位。
- 用户确认 MCP 配置策略。
- 用户确认 references 保留和重定位方案。

### Phase 1：`SKILL.md` Orchestrator 改造

交付：

- 调整 `skills/arkts-patterns/SKILL.md` 中的任务路由策略。
- 增加 DevEco MCP 可用性判断说明。
- 增加 MCP 优先调用规则。
- 增加 MCP 不可用时的降级规则。
- 增加安全/副作用边界说明。

验收：

- 小任务仍能按 references 最短路径工作。
- 最新 API 查询任务会优先建议或调用 MCP。
- 项目验证任务会优先走 MCP 检查/构建/验证。
- MCP 不可用时不会阻断基础使用。

### Phase 2：README / README-zh 同步更新

交付：

- `README.md` 增加 v3 架构说明。
- `README-zh.md` 同步中文说明。
- 增加 DevEco MCP 配置说明。
- 明确 DevEco MCP 是推荐增强，不是基础使用强依赖。

约束：

- README.md 与 README-zh.md 对用户行为变更必须同步。

### Phase 3：references 重定位

交付：

- 保留 `01-27` 文件名。
- 调整 references 内容重心。
- 融入 MCP workflow、API lookup policy、fallback policy。
- 保持 `references/README.md` 索引一致。

约束：

- 不删除、不重命名 `01-27` 文件。
- 不破坏现有链接。
- 文档改动后运行 `pwsh ./scripts/validate-docs.ps1`。

### Phase 4：MCP example 配置

交付：

- 增加 DevEco MCP 配置示例。
- 明确 `DEVECO_PATH` 必需。
- 明确 `PROJECT_PATH` 可选或可由项目目录推导。
- 明确推荐版本策略。

注意：

- 不提交用户本机路径。
- 不默认启用自动 MCP，除非后续拍板。

### Phase 5：真实项目验证

交付：

- 使用真实 HarmonyOS 项目验证 API 查询、ETS 检查、项目同步、构建、UI 树获取和 UI 验证。

验收：

- MCP 可用时，智能体能形成开发闭环。
- MCP 不可用时，Skill 仍能离线指导。
- references 维护压力下降。

### Phase 6：决定是否内置 MCP 或拆分插件

根据验证结果选择：

- 继续 example + 指导配置。
- 在插件根目录内置 `.mcp.json`。
- 拆出 `arkts-patterns-deveco-mcp` 增强插件。

## 13. 验收标准

- AC-01: 当用户请求 ArkTS/HarmonyOS 稳定模式代码生成时，skill 应优先使用 `references/` 中的稳定模式并生成符合 ArkTS 约束的代码。
- AC-02: 当用户请求最新 HarmonyOS API 或 SDK 规范时，skill 应优先使用 DevEco MCP `harmonyos_knowledge_search`，若 MCP 不可用则启用降级路径。
- AC-03: 当用户请求检查 `.ets` 代码时，skill 应优先使用 DevEco MCP `check_ets_files`，并在不可用时说明未执行真实检查。
- AC-04: 当用户请求项目级验证时，skill 应优先考虑 `project_sync` 与 `build_project`。
- AC-05: 当用户请求 UI 行为验证时，skill 应使用 `get_app_ui_tree`、`perform_ui_action`、`verify_ui` 中合适工具，并标注副作用。
- AC-06: 当 DevEco MCP 不可用且用户继续请求开发支持时，skill 应使用 references 兜底并明确哪些步骤未实时验证。
- AC-07: 当修改 README 用户行为说明时，仓库应同步更新 `README.md` 与 `README-zh.md`。
- AC-08: 当修改 references 或 template 相关文件时，维护者应运行 `pwsh ./scripts/validate-docs.ps1`。
- AC-09: 当 references 发生调整时，仓库应保留 `01-27` 文件名和 `references/README.md` 索引一致性。
- AC-10: 当引入 DevEco MCP 配置示例时，仓库不得包含用户私有路径、token、证书或设备信息。

## 14. 风险与缓解

| 风险 | 影响 | 缓解 |
| --- | --- | --- |
| DevEco MCP 版本变化 | 工具名或行为不稳定 | 使用 `@stable` 或固定版本；文档标注版本 |
| 用户未配置 DevEco MCP | live tooling 不可用 | references 兜底；明确配置指南 |
| 自动内置 MCP 导致启动失败 | 插件体验变差 | 第一阶段只提供 example，不自动启用 |
| references 继续膨胀 | 维护成本高 | 明确 references 只保存稳定工程记忆 |
| 最新 API 与 references 冲突 | 智能体判断混乱 | 最新规范以 MCP 查询为准，references 作为模式层 |
| 有副作用工具误调用 | 修改或运行用户项目 | 工具分级；高副作用操作需明确任务上下文 |
| README 中英文不同步 | 用户行为说明不一致 | 将同步更新列为验收标准 |
| 文档链接或编号损坏 | 插件可用性下降 | 运行 `pwsh ./scripts/validate-docs.ps1` |

## 15. 当前仓库约束

实施时必须遵守：

- 保留 `skills/arkts-patterns/references/01-*.md` 至 `27-*.md` 文件名。
- 保持 `skills/arkts-patterns/references/README.md` 与实际 references 文件一致。
- 不删除、重命名或重构 `skills/arkts-patterns/empty-ability-template/`，除非用户明确要求。
- README 用户行为变更必须同步更新 `README.md` 与 `README-zh.md`。
- 行为、结构或 release-facing 文档变化必须更新 `CHANGELOG.md`。
- 文档或 template 相关改动后必须运行 `pwsh ./scripts/validate-docs.ps1`。

## 16. 需要用户拍板事项

1. DevEco MCP 在 v3 中是否正式定义为“推荐增强”而非“强依赖”？
   - 建议：是，定义为推荐增强。
2. 第一阶段 MCP 配置是否采用“指导配置 + example”，暂不自动内置？
   - 建议：是。
3. DevEco MCP npm 版本策略使用 `@beta` 还是固定版本号？
   - 当前默认：使用 `@beta`，发布前如需可再拍板固定具体版本。
4. references 是否允许从“广覆盖文档库”逐步收敛为“精选工程记忆层”？
   - 建议：允许，但保留 `01-27` 文件名。
5. 是否允许后续根据验证结果拆分 `arkts-patterns-deveco-mcp` 独立插件？
   - 建议：保留该选项，但当前不立即拆分。
6. 对 `perform_ui_action`、`start_app` 等高副作用工具，是否要求 Skill 在调用前明确说明？
   - 建议：是。

## 17. 建议结论

`arkts-patterns v3` 应锁定为：

```text
ArkTS/HarmonyOS 智能体开发能力插件
= SKILL.md 编排策略
+ references 持久工程记忆
+ DevEco MCP 实时工具增强
```

第一阶段不自动内置 DevEco MCP，而是让 Skill 会识别、会指导配置、会优先使用、会安全降级。这样既能保留当前插件的稳定价值，又能逐步把最新规范查询、代码检查、构建和 UI 验证交给 DevEco MCP。
