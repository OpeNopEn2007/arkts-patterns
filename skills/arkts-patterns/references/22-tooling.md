# 开发工具 (Development Tools)

## 概述

HarmonyOS 应用开发工具链以 DevEco Studio 为核心，配合 Hvigor 编译构建系统、构建配置文件和签名工具，提供完整的开发体验。

---

## 1. DevEco Studio 使用

基于 IntelliJ IDEA 的 IDE，提供一站式开发体验。

**主要功能**：
- 代码编辑（ArkTS/TS/JS、CSS、C++）
- 智能补全与语法高亮
- 实时预览（Previewer）
- 编译运行与调试
- 性能分析（Profiler）
- 设备管理（Device File Browser）
- 日志查看（HiLog）

---

## 2. Hvigor 编译构建系统

**Hvigor** 是 HarmonyOS 的自动化构建工具，基于 Gradle 类似的任务编排机制。

**核心概念**：
- **Task**：构建任务单元，如编译、打包、签名
- **Plugin**：扩展构建能力的插件
- **生命周期**：初始化 -> 配置 -> 执行

**常用操作**：
```bash
# 构建 Debug 包
hvigor assembleHap --mode module -p product=default

# 构建 Release 包
hvigor assembleApp --mode module -p product=default
```

### 命令行环境诊断

DevEco Studio IDE 可以自动带上 SDK 环境，但终端里的 Hvigor 不一定有同样的环境变量。做命令行构建验证时，先确认：

- 项目路径不包含中文或其他非 ASCII 字符；部分 DevEco Studio 版本会拒绝打开这类路径。
- `DEVECO_SDK_HOME` 指向 DevEco SDK 根目录，例如 `D:\DevEco Studio\sdk`。
- 修正环境变量后先停止 Hvigor daemon，再重新构建。

Windows PowerShell 示例：

```powershell
$env:DEVECO_SDK_HOME = 'D:\DevEco Studio\sdk'

& 'D:\DevEco Studio\tools\node\node.exe' `
  'D:\DevEco Studio\tools\hvigor\bin\hvigorw.js' `
  --stop-daemon

& 'D:\DevEco Studio\tools\node\node.exe' `
  'D:\DevEco Studio\tools\hvigor\bin\hvigorw.js' `
  --mode module `
  -p module=entry@default `
  -p product=default `
  PreviewBuild `
  --analyze=normal `
  --parallel `
  --incremental
```

如果出现：

```text
Invalid value of 'DEVECO_SDK_HOME' in the system environment path.
```

处理方式：

1. 查找真实 SDK 根目录（常见位置：`D:\DevEco Studio\sdk`、`%LOCALAPPDATA%\Huawei\Sdk`）。
2. 将 `DEVECO_SDK_HOME` 设置到 SDK 根目录，不要设置到 `default/openharmony` 子目录。
3. 执行 `hvigorw --stop-daemon`，避免旧 daemon 继续使用错误环境。
4. 重新构建，以 `BUILD SUCCESSFUL` 和退出码 `0` 作为通过标准。

`wmic` 缺失等警告不一定会导致失败，最终以 Hvigor 是否 `BUILD FAILED` 为准。

> 官方文档：[Hvigor 构建](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-hvigor-task-V5)

---

## 3. DevEco MCP 实时工具

v3 中，DevEco MCP 是推荐的实时工具增强，用于把智能体生成的 ArkTS 代码放回真实工程中验证。它不是基础使用的强依赖；未配置时，应继续使用本目录中的稳定模式，并明确哪些验证没有执行。

配置或排查 DevEco MCP 前，智能体应先联网查看 npm 包页：<https://www.npmjs.com/package/@deveco-codegenie/mcp>。包页 README 和当前 dist-tag 优先于本文件的转述；如果网页不可抓取，可使用 `npm view @deveco-codegenie/mcp@beta version dist-tags description --json` 获取当前版本与标签信息。

可从占位符示例开始配置：[`deveco-mcp.example.json`](./deveco-mcp.example.json)。不要把真实安装路径、工程路径、设备信息、账号、证书或 token 提交到仓库。

优先调用策略：

| 目标 | 推荐 MCP 工具 | 兜底方式 |
|------|---------------|----------|
| 查询最新 API / SDK 规范 | `harmonyos_knowledge_search` | 查阅 `27-api-references.md` 后让用户打开官方文档 |
| 检查 `.ets` 文件 | `check_ets_files` | 按 references 静态审阅并请求用户提供 DevEco 日志 |
| 同步工程 | `project_sync` | 提醒用户在 DevEco Studio 中同步 |
| 构建工程 | `build_project` | 使用 Hvigor CLI 或请求构建日志 |
| 启动应用 | `start_app` | 请求用户手动启动 |
| 检查 UI 树 | `get_app_ui_tree` | 使用截图或代码审查 |
| 执行 UI 操作 | `perform_ui_action` | 仅在用户明确要求交互验证时调用 |
| 验证 UI | `verify_ui` | 截图审查或人工验收 |

安全边界：

- 不把用户本机 `DEVECO_PATH`、设备信息、账号、证书或 token 写入仓库。
- `perform_ui_action`、`start_app` 等高副作用操作必须有明确任务上下文。
- 项目同步、构建、启动和 UI 验证的结果必须反馈给用户，不能声称未执行的检查已经通过。

---

## 4. 构建配置文件 (build-profile.json5)

位于工程根目录 `build-profile.json5`，配置构建相关参数。

**关键配置项**：

```json5
{
  "app": {
    "products": ["default", "tablet"]
  },
  "modules": [
    {
      "name": "entry",
      "srcPath": "./entry",
      "targets": [
        {
          "name": "default",
          "applyToProducts": ["default"]
        }
      ]
    }
  ]
}
```

| 配置项 | 说明 |
|--------|------|
| `app.products` | 定义产品形态（手机、平板、车机等） |
| `modules` | 模块列表 |
| `targets` | 每个模块的目标产物配置 |
| `buildOption` | 编译选项（混淆、压缩等） |

> 官方文档：[构建配置文件](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-hvigor-build-profile-0000001778834297-V5)

---

## 5. 应用签名 (自动 / 手动)

### 自动签名
- DevEco Studio 在调试时自动签名
- 自动生成调试证书和 Profile
- 无需手动操作

### 手动签名
- 在 AppGallery Connect 上创建应用
- 生成正式证书（.cer）
- 生成 Profile 文件（.p7b）
- 在 IDE 中配置签名信息

**签名配置位置**：`build-profile.json5` 或 IDE 的 Signing Config 面板

---

## 6. 工程模板介绍

DevEco Studio 提供多种工程模板：

| 模板 | 说明 |
|------|------|
| Empty Ability | 空白应用，单 Ability |
| List Detail | 列表+详情页 |
| Tab | 底部 Tab 导航 |
| Navigation | 导航布局模板 |
| Grid | 网格布局模板 |
| DFA| 多设备自适应模板 |

选择模板时考虑目标设备形态和一多适配需求。

---

## 7. 多目标产物配置

**用途**：一套代码同时构建适用于不同设备（手机、平板、车机、手表）的 HAP/APP 包。

**实现方式**：
1. 在 `build-profile.json5` 的 `app.products` 中定义产品
2. 每个 `product` 可指定不同的应用名称、图标、权限
3. 使用 `@Builder` 和运行时 API 区分设备形态
4. 各产品独立构建出对应 HAP 包

**示例**：
```json5
{
  "app": {
    "products": ["phone", "tablet", "car"]
  }
}
```

---

## 总结

| 工具/配置 | 用途 | 阶段 |
|-----------|------|------|
| DevEco Studio | 代码编辑、预览、调试 | 全流程 |
| Hvigor | 编译、打包、构建 | 构建阶段 |
| build-profile.json5 | 构建参数配置 | 配置阶段 |
| 签名 | 应用身份认证 | 调试/发布 |
| 工程模板 | 快速项目初始化 | 开发起始 |
| 多目标产物 | 一次开发多设备部署 | 构建阶段 |
