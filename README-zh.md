# ArkTS Patterns - Claude Code Skill（中文）

[English README](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Plugin-blue.svg)](https://claude.ai/code)
[![HarmonyOS](https://img.shields.io/badge/HarmonyOS-NEXT_API_12+-red.svg)](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)

> 面向 HarmonyOS NEXT 的生产级 ArkTS 开发模式库。**基准测试通过率 100%。**

## 功能特性

- **状态管理** - `@State`、`@Prop`、`@Link`、`@Provide/@Consume`、`@Observed/@ObjectLink`、V2 装饰器
- **组件生命周期** - `aboutToAppear`、`aboutToDisappear`、`UIAbility` 生命周期
- **并发能力** - `TaskPool`（CPU 密集任务）、`Worker`（后台处理）
- **导航路由** - `NavPathStack + NavDestination`（推荐替代 `@ohos.router`）、`RouterService` 模式
- **网络通信** - HTTP 客户端拦截器、错误处理、重试机制、RCP
- **数据持久化** - Preferences（轻量 KV）、RDB（SQLite）、Repository 模式
- **动画与手势** - `animateTo`、`PinchGesture`、`RotationGesture`、`PanGesture`、组合手势
- **项目脚手架** - `EmptyAbility` 模板 + `scaffold.sh` 快速初始化

## v3 架构方向

`arkts-patterns` v3 将 Skill 定位为 ArkTS/HarmonyOS 智能体开发编排层：

- `SKILL.md` 负责在稳定 references、实时工具、验证流程和降级路径之间路由任务。
- `references/` 保存持久工程记忆：稳定 ArkTS 模式、高频错误、模板规则和离线兜底指导。
- DevEco MCP 是推荐的实时工具增强，用于最新 API 查询、ETS 检查、项目同步、构建、启动应用、UI 树检查、UI 操作和 UI 验证。

DevEco MCP 不是基础使用的强依赖。若 MCP 工具不可用，Skill 应继续基于 `references/` 工作，并明确标注实时检查、构建或 UI 验证尚未执行。

配置或排查 DevEco MCP 时，智能体应优先查看 npm 包页：[@deveco-codegenie/mcp](https://www.npmjs.com/package/@deveco-codegenie/mcp)。包页 README 和当前 dist-tags 优先于本仓库中的摘要说明。

### v3 分层

| 层级 | 职责 |
|------|------|
| Layer 1: `SKILL.md` 编排层 | 路由任务、保持最短安全路径、定义副作用边界。 |
| Layer 2: DevEco MCP 实时工具层 | 提供当前 SDK/API 查询，以及可选的工程和 UI 验证。 |
| Layer 3: `references/` 工程记忆层 | 保存精选稳定模式和离线兜底指导。 |

## 安装方式

### 方式一：从 Marketplace 安装（推荐）

```bash
# 添加 marketplace
/plugin marketplace add OpeNopEn2007/opencc-plugins

# 安装插件
/plugin install arkts-patterns@opencc-plugins
```

### 方式二：克隆到插件目录

```bash
git clone https://github.com/OpeNopEn2007/arkts-patterns.git ~/.claude/plugins/arkts-patterns
```

### 方式三：开发模式加载

```bash
claude --plugin-dir /path/to/arkts-patterns
```

## 使用方式

当以下场景出现时，Skill 会自动激活：
- 编写 ArkTS/HarmonyOS 代码
- Review 或重构 ArkTS 代码
- 设计组件状态管理方案
- 实现 Ability 架构
- 搭建 Navigation 路由

### 示例提示词

```text
"Create a counter component with @State"
"Implement parent-child communication using @Link"
"Set up Navigation routing with NavPathStack"
"Create HTTP client with retry mechanism"
```

## 模式覆盖

| 模式 | 说明 | 状态 |
|------|------|------|
| @State Counter | 基础状态管理 | ✅ |
| @Link Parent-Child | 双向绑定 | ✅ |
| TaskPool Async | 后台并发处理 | ✅ |
| UIAbility Lifecycle | 应用生命周期管理 | ✅ |
| Navigation Routing | NavPathStack 路由模式 | ✅ |
| HTTP Client | 网络请求 | ✅ |
| RDB Persistence | SQLite 持久化 | ✅ |
| Animation & Gestures | 交互动画与手势 | ✅ |
| @Observed/@ObjectLink | 嵌套对象响应式 | ✅ |
| Error Recovery | 重试与退避恢复 | ✅ |
| **EmptyAbility Template** | 官方模板工程 | ✅ |

## 基准结果

| 指标 | 使用 Skill | 不使用 Skill |
|------|-----------|--------------|
| 通过率 | **100%** (50/50) | 96% (48/50) |

详见 [benchmark.md](./benchmark.md)。

## 项目结构

```text
arkts-patterns/
├── .claude-plugin/
│   └── plugin.json              # 插件清单（v2.3.1）
├── skills/arkts-patterns/       # Skill 目录（标准布局）
│   ├── SKILL.md                 # 主 Skill 文件
│   ├── references/              # 第三层知识：27 个主题 + templates + RESOURCES
│   │   ├── README.md            # 主题索引
│   │   ├── RESOURCES.md         # 外部学习资源
│   │   ├── 01-getting-started.md ~ 27-api-references.md
│   │   └── templates/           # EmptyAbility 模板文档
│   ├── scripts/
│   │   └── scaffold.sh          # 快速脚手架工具
│   └── empty-ability-template/  # Stage Model 完整模板工程
├── README.md
├── README-zh.md
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── benchmark.md
└── LICENSE
```

参考文档位于 `skills/arkts-patterns/references/`，索引见 [references/README.md](./skills/arkts-patterns/references/README.md)。

## 最小使用示例

小任务默认走最短路径：先识别核心主题，再打开对应 reference，最后生成聚焦的 ArkTS 代码骨架。

| 需求 | 参考路径 | 预期输出 |
|------|----------|----------|
| 构建一个可删除待办列表，子组件可更新父组件状态 | `references/04-state-management.md` + `references/05-ui-components.md` | 单文件 `@Entry` 页面，使用 `@State`、`@Link`、`List` 与不可变数组更新 |

示例提示词：

```text
Create a HarmonyOS NEXT ArkTS todo list where each row is a child component and the child can delete itself from the parent list.
```

## 环境要求

- HarmonyOS NEXT（API 12+）
- DevEco Studio 4.0+
- Claude Code CLI

## 维护校验

发布前建议执行一次文档一致性校验：

```powershell
pwsh ./scripts/validate-docs.ps1
```

在 Windows 上做 HarmonyOS 命令行构建验证时，请先确认 `DEVECO_SDK_HOME` 指向 DevEco SDK 根目录，例如 `D:\DevEco Studio\sdk`，修正后先停止 Hvigor daemon 再重试构建。

## 贡献指南

欢迎贡献，提交前请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md)。

1. Fork 仓库
2. 创建分支（`git checkout -b feature/amazing-pattern`）
3. 提交改动（`git commit -m 'feat: add amazing pattern'`）
4. 推送分支（`git push origin feature/amazing-pattern`）
5. 创建 Pull Request

## 资源链接

- [HarmonyOS 开发文档](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)
- [ArkTS API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/arkts-apis-overview-V5)
- [ArkUI 组件参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/arkui-overview-V5)

## 许可证

MIT License，详见 [LICENSE](./LICENSE)。

## 致谢

- Anthropic 提供 Claude Code 与 Skills 框架
- Huawei 提供 HarmonyOS NEXT 与 ArkTS
- 开源社区提供模式设计灵感
