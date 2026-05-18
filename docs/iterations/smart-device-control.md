# 智能设备控制案例

- **日期**: 2026-05-17
- **Case ID**: smart-device-control
- **项目类型**: HarmonyOS NEXT ArkTS 实验应用
- **HarmonyOS / API 版本**: 模板目标 SDK `6.0.2(22)`
- **DevEco Studio 版本**: 6.1 Beta1
- **主要目标**: 使用一个真实课堂风格 ArkTS 实验，验证 `arkts-patterns` 是否能产出可用、可预览、可编译的应用。
- **相关文件 / 模块**:
  - `exam/smart-device-control/SmartDeviceApp/entry/src/main/ets/pages/Index.ets`
  - `exam/smart-device-control/SmartDeviceApp/entry/src/main/ets/models/`
  - `skills/arkts-patterns/SKILL.md`
  - `skills/arkts-patterns/references/22-tooling.md`
- **初始 Prompt / 用户需求**: 把智能设备控制实验作为 Skill 的真实测试案例。

## 观察到的问题

DevEco Studio 无法打开最初生成的项目，因为项目路径包含中文字符。随后 IDE 预览构建可以成功，但从终端运行 Hvigor 时，由于 shell 环境中的 `DEVECO_SDK_HOME` 没有正确指向 DevEco SDK 根目录，最初构建失败。

## 根因

部分 DevEco Studio 版本会拒绝包含中文或其他非 ASCII 字符的项目路径。DevEco Studio IDE 内部会提供 SDK 环境上下文，而独立终端不一定配置了指向 DevEco SDK 根目录的 `DEVECO_SDK_HOME`。

## 应用的解决方案

实验项目移动到 ASCII-only 路径：

```text
E:\Study\CodingWorkSpace\arkts-patterns\exam\smart-device-control\SmartDeviceApp
```

终端编译前显式设置 SDK 根目录：

```powershell
$env:DEVECO_SDK_HOME = 'D:\DevEco Studio\sdk'
```

停止 Hvigor daemon 后，使用 DevEco Studio 自带 Node 和 Hvigor 重新运行 PreviewBuild。

## 执行的验证

- DevEco Studio 可以打开 ASCII-only 项目路径。
- Preview 可以渲染应用 UI。
- 常规交互可用：设置灯光亮度和空调温度会更新设备信息。
- 非法输入会被拒绝，并显示用户可见提示。
- Hvigor PreviewBuild 输出 `BUILD SUCCESSFUL`。
- 仓库校验 `pwsh ./scripts/validate-docs.ps1` 通过。

## 可复用经验

- 生成的 DevEco Studio 测试项目应使用 ASCII-only 路径。
- IDE 构建成功不代表终端 Hvigor 环境配置正确。
- CLI 验证应显式检查 `DEVECO_SDK_HOME`，环境变化后停止 Hvigor daemon，并要求 `BUILD SUCCESSFUL` 和退出码 `0`。
- `wmic` 警告不一定是致命错误；最终 Hvigor 状态才是判断依据。

## 推荐插件更新

- **目标**: `SKILL.md`、`references/22-tooling.md`、`CLAUDE.md`、`AGENTS.md`、README、`CHANGELOG.md`
- **更新类型**: 文档和流程规则
- **拟议变更**: 添加 ASCII 路径指导和 CLI Hvigor 环境验证步骤。
- **证据**: DevEco Studio 打开路径错误、终端 Hvigor 初始 `DEVECO_SDK_HOME` 失败、设置 SDK 根目录后成功重建。
- **适用范围**: Windows 上的 DevEco Studio / Hvigor 工作流，尤其是生成的实验项目和模板项目。
- **风险 / 过拟合检查**: 虽然只在一个案例中观察到，但这是有明确失败证据的高风险环境陷阱，适合立即写入文档。

## 已接受经验

- 添加 ASCII-only 项目路径指导。
- 为 CLI Hvigor 构建添加 `DEVECO_SDK_HOME` 设置和 daemon 重启指导。
- 添加案例学习迭代器，让未来案例产出结构化学习记录。

## 已拒绝经验

- 不把智能设备控制业务逻辑提升到 `SKILL.md`；它只是实验特定领域示例。
- 不把该实验应用加入可复用 EmptyAbility 模板。

## 后续事项

- 用未来案例验证相同路径和 CLI 环境规则是否适用于其他 DevEco Studio 版本。
- 如果该失败重复出现，可以考虑添加一个轻量本地 Hvigor 环境检查脚本。

