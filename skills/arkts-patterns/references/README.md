# HarmonyOS NEXT 工程模式参考

> 本目录是 `arkts-patterns` 的持久工程记忆层，保留稳定、高价值、模型容易出错的 ArkTS/HarmonyOS 工程模式。
> 它不是完整官方文档镜像；最新 API、SDK 行为和工具链差异应优先通过 DevEco MCP 或官方文档实时确认。
> 原始文档来源: [HarmonyOS 应用开发导读 V5](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)

## 定位

`references/` 是 v3 三层架构中的 Layer 3：精选工程记忆层。它用于沉淀稳定模式、反复踩坑点、模板约束和离线兜底，而不是追逐所有最新 API 细节。

使用优先级：

1. 实现模式、代码骨架、常见反模式：优先读取本目录对应主题。
2. 最新 API 签名、SDK 差异、工具链行为：优先使用 DevEco MCP；不可用时再用 `27-api-references.md` 定位官方文档。
3. 构建、启动、UI 检查：优先使用 DevEco MCP；不可用时记录未执行项，并请求用户提供 DevEco Studio/Hvigor 输出或截图。

## 目录

> 导航约定：主导航以本文件为准；`SKILL.md` 中的章节编号与文件名（`01`-`27`）必须与这里保持一致。

| 编号 | 分类 | 说明 |
|------|------|------|
| 01 | [入门指南](./01-getting-started.md) | 开发准备、快速入门、基本概念 |
| 02 | [应用模型 (Ability Kit)](./02-application-model.md) | Stage 模型、UIAbility 生命周期、ExtensionAbility |
| 03 | [ArkTS 语言](./03-arkts-language.md) | 声明式 UI、自定义组件、语法规范 |
| 04 | [状态管理](./04-state-management.md) | @State/@Prop/@Link/@Provide/@Consume/@Observed/@ObjectLink, V2 装饰器 |
| 05 | [UI 组件与布局](./05-ui-components.md) | 布局、List、ForEach、@Builder、弹窗 |
| 06 | [导航路由](./06-navigation.md) | Navigation、NavPathStack、NavDestination、系统路由表 |
| 07 | [动画与手势](./07-animation-gestures.md) | 属性动画、animateTo、转场、手势绑定 |
| 08 | [网络通信](./08-networking.md) | HTTP、WebSocket、Socket、RCP |
| 09 | [数据持久化](./09-data-persistence.md) | Preferences、RDB、KV Store、分布式数据对象 |
| 10 | [并发 (TaskPool/Worker)](./10-concurrency.md) | 异步并发、多线程、TaskPool、Worker |
| 11 | [权限与安全](./11-permissions-security.md) | 权限管控、访问控制、Universal Keystore Kit |
| 12 | [窗口与屏幕](./12-window-screen.md) | 窗口管理、沉浸式、多窗口 |
| 13 | [文件管理](./13-file-management.md) | 沙箱目录、用户文件、备份恢复 |
| 14 | [国际化](./14-i18n-localization.md) | i18n、多语言资源配置、本地化 |
| 15 | [后台任务](./15-background-tasks.md) | 短时/长时/延迟任务、代理提醒、推送 |
| 16 | [短距通信](./16-connectivity.md) | WLAN、蓝牙、NFC |
| 17 | [分布式](./17-distributed.md) | 分布式数据对象、分布式文件系统、跨设备协同 |
| 18 | [媒体](./18-media.md) | Audio Kit、Media Library Kit |
| 19 | [无障碍](./19-accessibility.md) | Accessibility Kit、屏幕朗读 |
| 20 | [性能优化](./20-performance.md) | 功耗优化、渲染控制、预加载 |
| 21 | [调试与测试](./21-debugging-testing.md) | 设备调试、源码调试、Hypium 测试、HDC、热重载 |
| 22 | [开发工具](./22-tooling.md) | DevEco Studio、Hvigor 构建、应用签名 |
| 23 | [自适应布局 (一多开发)](./23-adaptive-layout.md) | 多端部署、多窗口适配 |
| 24 | [发布](./24-publishing.md) | 应用签名、打包、上架 AppGallery |
| 25 | [应用包结构](./25-app-package.md) | Stage 模型包结构、HAP 打包 |
| 26 | [NDK 开发](./26-ndk.md) | JSVM-API、Node-API、C/C++ 集成 |
| 27 | [API 参考](./27-api-references.md) | 核心 API 参考链接 |

## 模板

| 模板 | 说明 |
|------|------|
| [EmptyAbility 模板](./templates/empty-ability/README.md) | HarmonyOS Stage 模型标准空白模板 (API 22 / SDK 6.0.2) |
| [模板索引](./templates/README.md) | 模板库总览与使用指南 |

## 资源

| 资源 | 说明 |
|------|------|
| [外部学习资源](./RESOURCES.md) | 开源项目推荐、学习路径、官方资源汇总 |

---

> **注意**: 华为开发者文档网站使用动态 JavaScript 加载内容，以下链接需在浏览器中打开查看完整内容。
> 本目录中的内容摘要仅用于稳定模式指导。涉及最新 API、SDK 版本、构建工具或设备行为时，请以 DevEco MCP 查询结果或官方文档为准。
