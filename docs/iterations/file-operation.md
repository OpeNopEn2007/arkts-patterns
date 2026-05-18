# 文件操作案例

- **日期**: 2026-05-17
- **Case ID**: file-operation
- **项目类型**: HarmonyOS NEXT ArkTS 实验应用
- **HarmonyOS / API 版本**: 模板目标 SDK `6.0.2(22)`
- **DevEco Studio 版本**: 根据当前环境推定为 6.1 Beta1
- **主要目标**: 使用文件管理实验验证 `arkts-patterns` 是否能指导 ArkTS 文件读写、中文文本处理和公共文件图片展示。
- **相关文件 / 模块**:
  - `exam/file-operation/requirement.png`
  - `exam/file-operation/FileOperationApp/entry/src/main/ets/pages/Index.ets`
  - `skills/arkts-patterns/references/13-file-management.md`
- **初始 Prompt / 用户需求**: 使用 `exam/file-operation` 作为 Case Learning Iterator 的下一个真实 exam 案例。
- **迭代状态**: 已实现并完成 CLI 验证

## 观察到的问题

需求图显示两个目标问题：

1. 修复保存和读取文本内容时的中文乱码。
2. 点击公共文件标签页后，从系统相册展示一张图片。

实现过程中，现有 file-management reference 建议使用 `fileIo.writeTextSync()` / `fileIo.readTextSync()`，但 DevEco Studio 6.1 报告 `fileIo` 上不存在 `writeTextSync`。

手工 Preview 交互随后暴露了规划缺口：保存会显示成功消息，但紧接着点击读取仍提示没有文件。原始验收标准没有明确要求“保存文本 -> 读取文本 -> 文件内容区域显示同样内容”，因此构建通过了，但核心用户工作流仍然有问题。

## 根因

中文乱码通常来自用错误编码处理文本字节，或读取原始字节后没有显式按 UTF-8 解码。当前 SDK 中，`fileIo` 不提供文本便捷 API。第一个 stream 版实现可以编译，但没有稳定满足 Preview 保存 / 读取工作流；对小文本实验来说，更安全的实现是 fd-based `openSync` + `writeSync/readSync`，再用 `util.TextDecoder` 显式 UTF-8 解码。

## 应用的解决方案

- 在 ASCII-only 路径下，从 EmptyAbility 模板创建 `exam/file-operation/FileOperationApp`。
- 在 `Index.ets` 中实现两个视图：
  - `应用文件`: 使用 `fileIo.openSync(filePath, CREATE | READ_WRITE)` 和 `fileIo.writeSync(fd, text)` 把文本保存到 `context.filesDir`。
  - `应用文件`: 使用 `openSync(READ_ONLY)`、`readSync(fd)` 和 `util.TextDecoder.create('utf-8').decodeToString(...)` 读取文本。
  - `公共文件`: 使用 `photoAccessHelper.PhotoViewPicker` 选择一张系统相册图片，并通过 `Image(uri)` 显示。
- 使用 `this.getUIContext().getHostContext()` 获取页面上下文，避免组件代码中 deprecated `getContext` 警告。
- 将 `fileIo.closeSync()` 和 UTF-8 解码包装到带局部错误处理的 helper 中，满足 ArkTSCheck 异常处理要求。
- 将重复硬编码 surface / accent 颜色移动到资源颜色中，满足 DevEco layered-parameter 建议。
- 更新 `references/13-file-management.md`，避免在 DevEco Studio 6.1 中继续推荐过时的 `writeTextSync/readTextSync`。

## 执行的验证

- 使用 `DEVECO_SDK_HOME=D:\DevEco Studio\sdk` 运行 Hvigor PreviewBuild。
- 最终 warning 清理后结果：`BUILD SUCCESSFUL in 20 s 441 ms`。
- 运行仓库文档校验。
- 手工 Preview 检查发现初始保存 / 读取工作流不足；随后改为 fd-based 文件 API。

## 可复用经验

- 当前 DevEco Studio 6.1 SDK 中，文本文件操作优先使用 fd-based API，而不是 `fileIo.writeTextSync/readTextSync`；对小实验文件来说也更容易验证。
- 读取字节后，应使用 `util.TextDecoder.create('utf-8')` 显式解码中文文本。
- `photoAccessHelper.PhotoViewPicker` 是让用户选择公共相册图片并显示的低摩擦方案，不需要硬编码公共文件路径。
- ArkTSCheck 可能对 `finally` 中的文件 API 发出异常警告；将 `closeSync()` 等清理调用包装到安全 helper 中。
- ArkUI 组件中的重复字面量颜色，应移动到资源颜色中，以兼容主题和 layered-parameter 检查。
- DevEco warning 输出是有价值的训练数据：记录 warning 文本、触发代码、修复方式，以及重建后 warning 是否消失。

## 推荐插件更新

- **目标**: `skills/arkts-patterns/references/13-file-management.md`、`skills/arkts-patterns/references/05-ui-components.md`
- **更新类型**: Reference 修正
- **拟议变更**: 用 fd-based 读写和 UTF-8 解码指导替换文本便捷 API 示例；记录抛异常文件清理 API 和重复字面量颜色的 warning 处理模式。
- **证据**: Hvigor 编译错误：`Property 'writeTextSync' does not exist on type 'typeof fileIo'. Did you mean 'writeSync'?`；DevEco 对 `Function may throw exceptions` 和 layered color parameters 的警告。
- **适用范围**: DevEco Studio 6.1 / SDK 6.0.2 文件文本操作。
- **风险 / 过拟合检查**: 这是编译期 SDK 不匹配，单案例证据足以修正文档。

## 已接受经验

- 文件文本示例应使用 `openSync`、`writeSync(fd)`、`readSync(fd)` 和 `util.TextDecoder`。
- 案例规格必须包含工作流级 AC，而不只是构建级 AC。本案例中：点击保存后，再点击读取，必须在文件内容区域显示完全一致的中文文本。
- 公共相册图片选择应使用 `photoAccessHelper.PhotoViewPicker`，而不是硬编码公共路径。
- 安全清理 helper 可以减少文件关闭相关的 ArkTSCheck 异常警告。
- 如果实验应用需要干净通过 DevEco 检查，重复 inline UI 颜色应提升到 `color.json` 资源。

## 已拒绝经验

- 不把该实验的具体 UI 布局提升到 `SKILL.md`；它是案例特定内容。
- 不把文件管理业务 UI 加入 `empty-ability-template`。

## 后续事项

- 在真机或 DevEco Preview 中手工验证选中的相册图片能否正确渲染。
- 如果出现更多文件案例，可以考虑在 `references/13-file-management.md` 中加入紧凑的 `FileTextUtil` 模式。

