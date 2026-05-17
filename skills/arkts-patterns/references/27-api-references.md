# API 参考 (API References)

> 本索引基于 2026-05-14 华为官方最新版文档提取。核心 Kit 包含完整 API 模块列表（模块名 + 中文描述 + 页码）。
> v3 中本文件仅作为 API 模块定位索引。最新签名、参数、错误码和 SDK 差异应优先使用 DevEco MCP `harmonyos_knowledge_search` 或官方文档确认。
> 官方入口: <https://developer.huawei.com/consumer/cn/doc/harmonyos-references/development-intro-api>

---

## 预备

## MCP 优先查询策略

本文件用于把 API 需求定位到 Kit、模块名和官方页面，不作为最终签名来源。需要最新 API 签名、参数、错误码、权限或 SDK 差异时：

1. 优先调用 DevEco MCP `harmonyos_knowledge_search` 查询当前 SDK/API 知识。
2. 若 MCP 不可用，使用本文件定位模块名和官方页面，再通过浏览器、Playwright 或 DevEco Studio 离线文档确认。
3. 如果只能离线生成代码，明确标注 API 细节未实时验证，并请求用户在 DevEco Studio 中执行 ETS 检查或构建。

---

| 文档 | 说明 |
|------|------|
| [API参考概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/development-intro-api) | 版本说明、系统能力、接口导入、权限、错误码等总览 |
| [系统能力SystemCapability使用指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/syscap) | SysCap 机制，判断设备是否支持某接口 |
| [通用错误码](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/errorcode-universal) | 所有 Kit 公用的错误码 |

---

## 应用框架 — Ability Kit（程序框架服务）

> 入口: [ability-api](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ability-api)
> ArkTS API: [ability-arkts](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ability-arkts)

### Stage模型能力的接口 → [stage-model](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/stage-model)

| 模块名 | 说明 |
|--------|------|
| `@ohos.app.ability.UIAbility` | 带界面的应用组件 |
| `@ohos.app.ability.AbilityStage` | AbilityStage 组件管理器 |
| `@ohos.app.ability.Ability` | Ability 基类 |
| `@ohos.app.ability.AbilityConstant` | Ability 相关常量 |
| `@ohos.app.ability.abilityLifecycleCallback` | UIAbility 生命周期回调监听器 |
| `@ohos.app.ability.common` | Ability 公共模块 |
| `@ohos.app.ability.contextConstant` | Context 相关常量 |
| `@ohos.app.ability.application` | 应用工具类 |
| `@ohos.app.ability.StartOptions` | startAbility 的可选参数 |
| `@ohos.app.ability.OpenLinkOptions` | openLink 的可选参数 |
| `@ohos.app.ability.CompletionHandler` | 拉起应用结果的操作类 |
| `@ohos.app.ability.EmbeddableUIAbility` | 可嵌入式 UIAbility 组件 |
| `@ohos.app.ability.UIExtensionAbility` | 带界面的 ExtensionAbility 组件 |
| `@ohos.app.ability.UIExtensionContentSession` | 带界面扩展能力的界面操作类 |
| `@ohos.app.ability.ExtensionAbility` | 扩展能力基类 |
| `@ohos.app.ability.ActionExtensionAbility` | 支持业务操作自定义的 ExtensionAbility |
| `@ohos.app.ability.EmbeddedUIExtensionAbility` | 跨进程界面嵌入的 ExtensionAbility |
| `@ohos.app.ability.ShareExtensionAbility` | 支持分享详情页接入的 ExtensionAbility |
| `@ohos.app.ability.PhotoEditorExtensionAbility` | 支持图片编辑能力的 ExtensionAbility |
| `@ohos.app.ability.AppServiceExtensionAbility` | 应用后台服务扩展组件 |
| `@ohos.app.ability.EnvironmentCallback` | 系统环境变化监听器 |
| `@ohos.app.ability.ApplicationStateChangeCallback` | 应用进程状态变化监听器 |
| `@ohos.app.ability.ChildProcess` | 子进程基类 |
| `@ohos.app.ability.ChildProcessArgs` | 子进程参数 |
| `@ohos.app.ability.childProcessManager` | 子进程管理 |
| `@ohos.app.ability.insightIntent` | 意图框架基础定义 |
| `@ohos.app.ability.InsightIntentContext` | 意图执行上下文 |
| `@ohos.app.ability.InsightIntentExecutor` | 意图执行基类 |
| `@ohos.app.ability.InsightIntentDecorator` | 意图装饰器定义 |
| `@ohos.app.ability.systemConfiguration` | 系统环境模块 |
| `@ohos.app.ability.autoFillManager` | 自动填充框架 |
| `@ohos.app.ability.autoStartupManager` | 开机自启管理能力 |
| `@ohos.app.ability.AtomicServiceOptions` | openAtomicService 可选参数 |
| `@ohos.app.ability.sendableContextManager` | sendable 上下文管理 |
| `@ohos.app.appstartup.StartupConfig` | 启动框架配置信息 |
| `@ohos.app.appstartup.StartupTask` | 启动框架任务 |
| `@ohos.app.appstartup.startupManager` | 启动框架管理能力 |
| `@ohos.app.agent.AgentExtensionAbility` | 智能体扩展组件 |
| `@ohos.app.ability.AgentUIExtensionAbility` | 带界面的智能体拓展组件 |
| `@ohos.continuation.continuationManager` | 流转/协同管理 |

### 通用能力的接口(推荐) → [both-models](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/both-models)
### FA模型能力的接口 → [fa-model](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/fa-model)
### 接口依赖的元素及定义 → [ability-api-interface-depend](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ability-api-interface-depend)
### 已停止维护的接口 → [ability-arkts-dep](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ability-arkts-dep)

---

## 应用框架 — ArkUI（方舟UI框架）

> 入口: [arkui-api](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkui-api)
> ArkTS API: [arkui-arkts](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkui-arkts)

### UI界面 → [ui](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ui)

| 模块名 | 说明 |
|--------|------|
| `@ohos.arkui.StateManagement` | 状态管理（@State/@Prop/@Link/@Observed 等） |
| `@ohos.arkui.UIContext` | UI 上下文 |
| `@ohos.arkui.inspector` | 布局回调 |
| `@ohos.arkui.node` | 自定义节点 |
| `@ohos.arkui.shape` | 形状 |
| `@ohos.arkui.componentSnapshot` | 组件截图 |
| `@ohos.arkui.componentUtils` | componentUtils |
| `@ohos.arkui.dragController` | DragController |
| `@ohos.arkui.drawableDescriptor` | DrawableDescriptor |
| `@ohos.arkui.observer` | 无感监听 |
| `@ohos.arkui.Prefetcher` | Prefetching |
| `@ohos.arkui.theme` | 主题换肤 |
| `@ohos.arkui.uiExtension` | uiExtension |
| `@ohos.animator` | 动画 |
| `@ohos.curves` | 插值计算 |
| `@ohos.font` | 注册自定义字体 |
| `@ohos.matrix4` | 矩阵变换 |
| `@ohos.measure` | 文本计算 |
| `@ohos.mediaquery` | 媒体查询 |
| `@ohos.pluginComponent` | PluginComponentManager |
| `@ohos.promptAction` | 弹窗 |
| `@ohos.router` | 页面路由（不推荐，建议用 Navigation） |
| `@ohos.uiAppearance` | 用户界面外观 |
| `getContext` | 获取上下文 |
| `postCardAction` | 卡片操作 |

另外包含所有 ArkUI 内置组件和属性参考（[ui-interface-arkui](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ui-interface-arkui)），详见每个组件的 API 页面。

### 窗口管理 → [window-manager-api](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/window-manager-api)
### 屏幕管理 → [display-manager-api](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/display-manager-api)

---

## 应用框架 — ArkTS（方舟编程语言）

> 入口: [arkts-api](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkts-api)
> ArkTS API: [arkts-arkts](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkts-arkts)

| 模块名 | 说明 |
|--------|------|
| `@ohos.taskpool` | 启动任务池（TaskPool） |
| `@ohos.worker` | 启动一个 Worker |
| `@ohos.util` | util 工具函数 |
| `@ohos.util.ArrayList` | 线性容器 ArrayList |
| `@ohos.util.Deque` | 线性容器 Deque |
| `@ohos.util.HashMap` | 非线性容器 HashMap |
| `@ohos.util.HashSet` | 非线性容器 HashSet |
| `@ohos.util.LightWeightMap` | 非线性容器 LightWeightMap |
| `@ohos.util.LightWeightSet` | 非线性容器 LightWeightSet |
| `@ohos.util.LinkedList` | 线性容器 LinkedList |
| `@ohos.util.List` | 线性容器 List |
| `@ohos.util.PlainArray` | 非线性容器 PlainArray |
| `@ohos.util.Queue` | 线性容器 Queue |
| `@ohos.util.Stack` | 线性容器 Stack |
| `@ohos.util.TreeMap` | 非线性容器 TreeMap |
| `@ohos.util.TreeSet` | 非线性容器 TreeSet |
| `@ohos.util.json` | JSON 解析与生成 |
| `@ohos.util.stream` | 数据流基类 stream |
| `@ohos.buffer` | Buffer |
| `@ohos.convertxml` | xml 转换 JavaScript |
| `@ohos.fastbuffer` | FastBuffer |
| `@ohos.process` | 获取进程相关的信息 |
| `@ohos.uri` | URI 字符串解析 |
| `@ohos.url` | URL 字符串解析 |
| `@ohos.xml` | XML 解析与生成 |
| `@arkts.collections` | ArkTS 容器集 |
| `@arkts.lang` | ArkTS 语言基础能力 |
| `@arkts.math.Decimal` | 高精度数学库 Decimal |
| `@arkts.utils` | ArkTS 工具库 |

---

## 应用框架 — ArkData（方舟数据管理）

> 入口: [arkdata-api](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkdata-api)
> ArkTS API: [arkdata-arkts](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkdata-arkts)

| 模块名 | 说明 |
|--------|------|
| `@ohos.data.preferences` | 用户首选项 |
| `@ohos.data.relationalStore` | 关系型数据库 (SQLite) |
| `@ohos.data.distributedKVStore` | 分布式键值数据库 |
| `@ohos.data.distributedDataObject` | 分布式数据对象 |
| `@ohos.data.sendablePreferences` | 共享用户首选项 |
| `@ohos.data.sendableRelationalStore` | 共享关系型数据库 |
| `@ohos.data.dataShare` | 数据共享 |
| `@ohos.data.dataSharePredicates` | 数据共享谓词 |
| `@ohos.data.commonType` | 数据通用类型 |
| `@ohos.data.ValuesBucket` | 数据集 |
| `@ohos.data.unifiedDataChannel` | 标准化数据通路 |
| `@ohos.data.uniformDataStruct` | 标准化数据结构 |
| `@ohos.data.uniformTypeDescriptor` | 标准化数据定义与描述 |
| `@ohos.data.intelligence` | 智慧数据平台 |
| `@ohos.data.cloudData` | 端云服务 |
| `@ohos.data.dataAbility` | DataAbility 谓词 |

---

## 应用框架 — 其他 Kit

| Kit | 入口 |
|-----|------|
| [Accessibility Kit（无障碍服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/accessibility-api) | 无障碍服务 API |
| [ArkWeb（方舟Web）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkweb-api) | Web 组件能力 |
| [Background Tasks Kit（后台任务开发服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/background-tasks-api) | 短时/长时/延迟任务 |
| [Content Embed Kit（内容嵌入服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/content-embed-api) | 内容嵌入 |
| [Core File Kit（文件基础服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/core-file-api) | 沙箱文件、备份恢复 |
| [Data Augmentation Kit（数据增强服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/data-augmentation-api) | 数据增强 |
| [Form Kit（卡片开发服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/form-api) | 服务卡片/元服务卡片 |
| [IME Kit（输入法开发服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ime-api) | 输入法框架 |
| [IPC Kit（进程间通信服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ipc-api) | 进程间通信 |
| [Localization Kit（本地化开发服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/localization-api) | i18n 本地化 |
| [UI Design Kit（UI设计套件）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ui-design-api) | UI 设计 |

---

## 系统

| 分类 | 入口 |
|------|------|
| [安全](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/system-security-api) | Universal Keystore Kit、Asset Store Kit 等 |
| [网络](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/system-network-api) | Network Kit（HTTP、Socket、WebSocket、RCP） |
| [基础功能](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/system-basicfun-api) | 基础服务 Kit（时间时区、公共事件等） |
| [硬件](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/system-hardware-api) | 传感器、USB、电源管理 |
| [调测调优](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/system-debug-optimize-api) | HiLog、HiTrace、性能监测 |

---

## 媒体

| Kit | 入口 |
|-----|------|
| [Audio Kit（音频服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/audio-api) | 音频播放/录制 |
| [AVCodec Kit（音视频编解码服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/avcodec-api) | 音视频编解码 |
| [AVSession Kit（音视频播控服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/avsession-api) | 音视频会话管理 |
| [Camera Kit（相机服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/camera-api) | 相机预览、拍照、录像 |
| [DRM Kit（数字版权保护服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/drm-api) | 数字版权保护 |
| [Image Kit（图片处理服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/image-api) | PixelMap、图像编解码 |
| [Media Kit（媒体服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/media-api) | AVPlayer、AVRecorder |
| [Media Library Kit（媒体文件管理服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/media-library-api) | PhotoPicker、相册 |
| [Ringtone Kit（铃声服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ringtone-api) | 铃声管理 |
| [Scan Kit（统一扫码服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/scan-api) | 扫码 |

---

## 图形

| Kit | 入口 |
|-----|------|
| [AR Engine（AR引擎服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ar-engine-api) | AR 引擎 |
| [ArkGraphics 2D（方舟2D图形服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkgraphics-api) | 2D 绘制、字体 |
| [ArkGraphics 3D（方舟3D图形）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/arkgraphics-3d-api) | 3D 图形 |
| [Graphics Accelerate Kit（图形加速服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/graphics-accelerate-api) | Vulkan、OpenGL、ABR |
| [Spatial Recon Kit（空间建模服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/spatial-recon-api) | 空间建模 |
| [XEngine Kit（GPU加速引擎服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/xengine-api) | GPU 加速 |

---

## 应用服务

| Kit | 入口 |
|-----|------|
| [Account Kit（华为账号服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/account-api) | 华为账号一键登录 |
| [Ads Kit（广告服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/ads-api) | 广告 |
| [AppGallery Kit（应用市场服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/store-api) | 应用市场 |
| [App Linking Kit（应用链接服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/app-linking-api) | 应用链接 |
| [Calendar Kit（日历服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/calendar-api) | 日历 |
| [Call Service Kit（通话服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/call-api) | 通话 |
| [Cloud Foundation Kit（云开发服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/cloud-foundation-api) | 云开发 |
| [Contacts Kit（联系人服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/contacts-api) | 联系人 |
| [Enterprise Space Kit（企业数字空间服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/enterprise-space-api) | 企业空间 |
| [File Manager Service Kit（文件管理服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/file-manager-service-api) | 文件管理 |
| [Game Controller Kit（游戏控制器服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/game-controller-api) | 游戏控制器 |
| [Game Service Kit（游戏服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/game-service-api) | 游戏服务 |
| [Health Service Kit（运动健康服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/health-service-api) | 运动健康 |
| [IAP Kit（应用内支付服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/iap-api) | 应用内支付 |
| [Live View Kit（实况窗服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/live-view-api) | 实况窗 |
| [Location Kit（位置服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/location-api) | 位置服务 |
| [Map Kit（地图服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/map-api) | 地图 |
| [Notification Kit（用户通知服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/notification-api) | 通知 |
| [Payment Kit（鸿蒙支付服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/payment-api) | 鸿蒙支付 |
| [PDF Kit（PDF服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/pdf-api) | PDF |
| [Preview Kit（文件预览服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/preview-api) | 文件预览 |
| [Push Kit（推送服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/push-api) | 推送 |
| [Reader Kit（阅读服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/reader-api) | 阅读 |
| [Scenario Fusion Kit（融合场景服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/scenario-fusion-api) | 融合场景 |
| [Screen Time Guard Kit（屏幕时间守护服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/screen-time-guard-api) | 屏幕时间 |
| [Share Kit（分享服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/share-api) | 分享 |
| [Wallet Kit（钱包服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/wallet-api) | 钱包 |
| [Weather Service Kit（天气服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/weather-service-api) | 天气 |

---

## AI

| Kit | 入口 |
|-----|------|
| [Agent Framework Kit（智能体框架服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/harmony-agent-framework-api) | 智能体框架 |
| [CANN Kit（CANN异构计算框架服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/cann-api) | CANN |
| [Core Speech Kit（基础语音服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/core-speech-api) | 基础语音 |
| [Core Vision Kit（基础视觉服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/core-vision-api) | 基础视觉 |
| [Intents Kit（意图框架服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/intents-api) | 意图框架 |
| [Natural Language Kit（自然语言理解服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/natural-language-api) | 自然语言 |
| [MindSpore Lite Kit（昇思推理框架服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/mindspore-lite-api) | 昇思推理 |
| [Neural Network Runtime Kit](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/neural-network-runtime-api) | Neural Network Runtime |
| [Speech Kit（场景化语音服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/speech-api) | 场景化语音 |
| [Vision Kit（场景化视觉服务）](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/vision-api) | 场景化视觉 |

---

## 公共基础能力

| 分类 | 入口 |
|------|------|
| [ArkTS API](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/common-basic-arkts) | 公共基础 ARTS API |
| [C API](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/common-basic-c) | 公共基础 C API |

---

## 标准库 (NDK / C++)

| 库 | 入口 |
|----|------|
| [libc 标准库 (musl)](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/musl) | C 标准库 |
| [c++ 标准库](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/cpp) | C++ 标准库 |
| [Node-API](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/napi) | C/C++ 与 ArkTS 互调 |
| [libuv](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/libuv) | 事件驱动库 |
| [OpenSL ES](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/opensles) | 音频 |
| [OpenGL ES](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/opengles) | 3D 图形 |
| [OpenGL](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/opengl) | 3D 图形 |
| [EGL](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/egl) | OpenGL ES 接口 |
| [ICU4C](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/icu4c) | 国际化 |
| [zlib](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/zlib) | 压缩 |
| [Vulkan](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/vulkan-guide) | 3D 图形 API |
| [HiTSS](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/hitss-api-ref) | 设备调测 |
| [附录](https://developer.huawei.com/consumer/cn/doc/harmonyos-references/appendixes) | 附录 |

---

## 使用说明

华为 API 文档页面全部为 Angular 动态渲染，`WebFetch` 无法读取。Agent 获取 API 细节使用以下两种途径：

### 途径 1: DevEco Studio 离线文档（推荐）

DevEco Studio 自带离线 API 文档，为纯 HTML 文件，Agent 可直接 Read：

```
<DevEco Studio 安装目录>/sdk/<版本>/docs/
```

在 IDE 中选中模块名（如 `@ohos.data.preferences`）按 `Ctrl+Q` 即可查看接口签名。

### 途径 2: Playwright MCP（无需 DevEco Studio）

每个模块名对应一个官方文档 URL，规则为：

```
https://developer.huawei.com/consumer/cn/doc/harmonyos-references/js-apis-{模块名去掉@和/ohos./app.，替换为kebab-case}
```

例：
| 模块名 | 文档 URL |
|--------|----------|
| `@ohos.data.preferences` | `js-apis-data-preferences` |
| `@ohos.app.ability.UIAbility` | `js-apis-app-ability-uiability` |
| `@ohos.taskpool` | `js-apis-taskpool` |
| `@ohos.arkui.StateManagement` | `js-apis-statemanagement` |

使用 Playwright MCP 打开并提取 `#mark` 元素内容即可获得完整 API 文档。

### 途径 3: 直接浏览官网

在浏览器中打开 <https://developer.huawei.com/consumer/cn/doc/harmonyos-references/development-intro-api>，左侧导航树可逐级展开到任意模块。页面支持 API version/设备筛选。
