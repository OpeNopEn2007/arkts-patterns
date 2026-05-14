# 入门指南

> HarmonyOS NEXT (API 12) 应用开发入门指南

---

## 1. 开发准备

### 1.1 基本概念

**UI 框架 (ArkUI)**
ArkUI 是 HarmonyOS 的声明式 UI 开发框架，使用 ArkTS 语言（基于 TypeScript 的扩展）构建用户界面。核心特点包括：

- **声明式 UI**: 通过状态驱动视图更新，开发者只需描述 UI 状态而非操作步骤
- **跨平台**: 支持手机、平板、智慧屏、手表、车机等多种设备形态
- **高性能**: 自研渲染引擎，提供流畅的用户体验

**应用模型 (Stage 模型)**
Stage 模型是 HarmonyOS 从 API 9 开始主推的应用开发模型，从 API 11 开始 FA 模型已不再推荐使用。Stage 模型的核心概念包括：

- **UIAbility**: 应用的能力单元，一个应用可以包含多个 UIAbility
- **AbilityStage**: 模块级别的容器，同一模块的 UIAbility 共享一个 AbilityStage
- **ExtensionAbility**: 扩展能力单元，用于提供后台任务、Widget、数据分享等能力
- **Context**: 上下文对象，提供访问应用资源和系统服务的能力
- **Want**: 用于组件间通信的载体

### 1.2 DevEco Studio 开发环境搭建

| 步骤 | 说明 |
|------|------|
| 1. 下载安装 | 从华为开发者官网下载 DevEco Studio (最新版本)，支持 Windows/Mac |
| 2. 配置 SDK | 安装 HarmonyOS SDK，建议选择 API 12 (HarmonyOS NEXT) |
| 3. 配置 Node.js | 需要 Node.js 18.x 或更高版本 |
| 4. 配置 ohpm | OpenHarmony Package Manager，用于管理三方依赖 |
| 5. 创建模拟器 | 在 DevEco Studio 中创建本地模拟器或使用远程真机 |

**运行环境要求**:

- 操作系统: Windows 10/11 (x86_64), macOS 12+
- 内存: 建议 16GB 以上
- 磁盘空间: 建议 30GB 以上
- 分辨率: 建议 1920x1080 以上

---

## 2. 构建第一个 ArkTS 应用 (Stage 模型)

### 2.1 创建项目

1. 打开 DevEco Studio，点击 "Create Project"
2. 选择模板: **Empty Ability** (Stage 模型)
3. 配置项目:
   - Project Name: `MyFirstApp`
   - Bundle Name: `com.example.myfirstapp`
   - Save Location: 自定义
   - Compile SDK: API 12
   - Device Type: Phone
4. 点击 "Finish" 完成创建

### 2.2 目录结构

```
MyFirstApp/
├── AppScope/                        # 应用全局配置
│   └── app.json5                    # 应用级配置（名称、图标、版本等）
├── entry/                           # 应用模块（entry 类型）
│   ├── src/
│   │   ├── main/
│   │   │   ├── ets/                 # ArkTS 源码目录
│   │   │   │   ├── entryability/    # UIAbility 入口
│   │   │   │   │   └── EntryAbility.ts
│   │   │   │   ├── pages/           # 页面组件
│   │   │   │   │   └── Index.ets
│   │   │   │   └── resources/       # 资源引用
│   │   │   ├── resources/           # 模块资源目录
│   │   │   └── module.json5         # 模块配置文件
│   │   └── ohosTest/                # 测试代码
│   ├── build-profile.json5          # 模块构建配置
│   └── hvigorfile.ts                # 模块级构建脚本
├── oh_modules/                      # 依赖模块
├── build-profile.json5              # 项目级构建配置
├── hvigor/
│   └── hvigor-config.json5          # 编译构建配置
├── hvigorfile.ts                    # 项目级构建脚本
├── package.json                     # 依赖配置
├── oh-package.json5                 # ohpm 依赖配置
└── local.properties                 # 本地 SDK 路径配置
```

### 2.3 构建第一个页面

默认的 `Index.ets` 文件内容如下：

```typescript
// entry/src/main/ets/pages/Index.ets
import { router } from '@kit.ArkUI';

@Entry
@Component
struct Index {
  @State message: string = 'Hello HarmonyOS';

  build() {
    Row() {
      Column() {
        Text(this.message)
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .textAlign(TextAlign.Center)

        Button('跳转下一页')
          .type(ButtonType.Capsule)
          .margin({ top: 20 })
          .onClick(() => {
            router.pushUrl({
              url: 'pages/Second'
            });
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}
```

### 2.4 页面导航

创建第二个页面 `entry/src/main/ets/pages/Second.ets`：

```typescript
@Entry
@Component
struct Second {
  build() {
    Row() {
      Column() {
        Text('第二个页面')
          .fontSize(28)
          .fontWeight(FontWeight.Bold)

        Button('返回')
          .type(ButtonType.Capsule)
          .margin({ top: 20 })
          .onClick(() => {
            router.back();
          })
      }
      .width('100%')
    }
    .height('100%')
  }
}
```

**路由配置** (`entry/src/main/resources/base/profile/main_pages.json`):

```json
{
  "src": [
    "pages/Index",
    "pages/Second"
  ]
}
```

### 2.5 在设备上运行

1. **模拟器运行**: 在 DevEco Studio 中创建模拟器 -> 选择设备 -> 点击运行按钮
2. **真机运行**: 使用 USB 连接设备 -> 开启开发者模式 -> 点击运行按钮
3. **HAP 包运行**: 构建 HAP (`Build > Build Hap(s)`) -> 通过 DevEco Studio 或命令行安装

---

## 3. 应用程序包基础知识

### 3.1 Stage 模型包结构

HarmonyOS 应用发布时以 **App Pack** (`.app` 后缀) 形式发布，内部包含一个或多个 **HAP** (Harmony Ability Package) 文件。

```
.app (App Pack)
├── Entry HAP             # 应用主入口模块（entry 类型）
│   ├── .abc              # 编译后的 ArkTS 字节码
│   ├── resources.index   # 资源索引
│   ├── resources/        # 资源文件
│   ├── module.json       # 模块配置
│   └── ...
├── Feature HAP           # 应用特性模块（feature 类型）
│   └── ...
├── pack.info             # 应用包描述文件
└── ...
```

### 3.2 包结构阶段

| 阶段 | 说明 | 产物 |
|------|------|------|
| **开发阶段** | 源码编写（ets、ts 文件）、资源配置、配置文件编写 | 源码目录 |
| **编译阶段** | ArkTS 编译为字节码 (.abc)、资源编译为 resources.index、配置文件编译 | HAP 包 (.hap) |
| **发布阶段** | 多个 HAP 合成为一个 App Pack | App Pack (.app) |

### 3.3 module.json5 配置

```json5
{
  module: {
    name: "entry",
    type: "entry",                     // entry: 主入口, feature: 特性模块
    srcEntry: "./ets/entryability/EntryAbility.ts",
    description: "应用主模块",
    mainElement: "EntryAbility",
    deviceTypes: ["phone", "tablet"],
    pages: "resources/base/profile/main_pages.json",
    abilities: [
      {
        name: "EntryAbility",
        srcEntry: "./ets/entryability/EntryAbility.ts",
        description: "应用主Ability",
        icon: "$media:icon",
        label: "$string:app_name",
        startWindowIcon: "$media:icon",
        startWindowBackground: "$color:start_window_background",
        exported: true,
        skills: [
          {
            entities: ["entity.system.home"],
            actions: ["action.system.home"]
          }
        ]
      }
    ]
  }
}
```

---

## 4. 资源分类与访问

### 4.1 资源目录结构

资源文件位于模块的 `resources` 目录下，按照限定词和类型组织：

```
resources/
├── base/                          # 默认资源（必选）
│   ├── element/                   # 基础元素资源（颜色、字符串、数字等）
│   │   ├── string.json
│   │   ├── color.json
│   │   ├── float.json
│   │   └── boolean.json
│   ├── media/                     # 媒体资源（图片、音频、视频）
│   │   ├── icon.png
│   │   └── background.png
│   └── profile/                   # 配置文件（路由、配置等）
│       └── main_pages.json
├── en_US/                         # 限定词资源（英文美国）
│   ├── element/
│   │   └── string.json
│   └── media/
├── zh_CN/                         # 限定词资源（中文简体）
│   ├── element/
│   │   └── string.json
│   └── media/
├── dark/                          # 深色模式资源
│   └── element/
│       └── color.json
├── rawfile/                       # 原始文件（按原样打包，不编译）
│   └── data.json
└── resfile/                       # 运行时文件（应用运行时创建/读取）
```

### 4.2 资源限定词

资源目录命名格式: `_<限定词1>_<限定词2>...`

| 限定词类型 | 可取值 | 说明 |
|-----------|--------|------|
| 语言 | `zh`, `en`, `fr` 等 | ISO 639-1 语言码 |
| 地区 | `CN`, `US`, `GB` 等 | ISO 3166-1 国家码 |
| 屏幕方向 | `land`, `port` | 横屏/竖屏 |
| 设备类型 | `phone`, `tablet`, `car` 等 | 设备形态 |
| 颜色模式 | `dark`, `light` | 深色/浅色模式 |
| 屏幕密度 | `sdpi`, `mdpi`, `ldpi`, `xldpi` 等 | 像素密度 |
| 夜间模式 | `night` | 夜间模式 |

**匹配优先级**: 精确匹配 > 模糊匹配 > base 默认资源

### 4.3 资源分组

| 资源组 | 文件类型 | 说明 | 示例 |
|--------|---------|------|------|
| **element** | `.json` | 基础元素: 字符串、颜色、浮点数、布尔值、数组、整数 | `string.json`, `color.json` |
| **media** | 图片/音频/视频文件 | 媒体资源: 可直接引用图标、背景图等 | `icon.png`, `bg.svg` |
| **profile** | `.json` | 配置文件: 路由配置、配置信息 | `main_pages.json` |

### 4.4 资源访问方式

**应用资源访问**（使用 `$r()` / `$rawfile()` 语法）：

```typescript
// 在 .ets 文件中
Text($r('app.string.app_name'))              // 引用字符串
Image($r('app.media.icon'))                   // 引用图片
Text($r('app.string.greeting', 'World'))      // 带参数的字符串
Image($rawfile('data.json'))                  // 引用 rawfile

// 资源引用语法
// app.type.name     --- 应用资源
// sys.type.name     --- 系统资源

// 示例: $r('app.string.app_name')
// app    - 资源类型（应用级）
// string - 资源分组（element 文件中的键）
// app_name - 资源名称
```

---

## 5. 工程目录结构 (ArkTS Stage 模型)

### 5.1 项目级目录

```
ProjectRoot/
├── AppScope/                  # 应用全局配置目录
│   └── app.json5              # 应用级配置信息
├── entry/                     # 应用模块（默认 entry 模块）
├── feature/                   # 可选特性模块
├── library/                   # 共享库模块（har 类型）
├── oh_modules/                # ohpm 依赖缓存目录
├── build-profile.json5        # 项目级构建配置
├── hvigor/
│   └── hvigor-config.json5    # hvigor 编译构建配置
├── hvigorfile.ts              # 项目级构建脚本
├── package.json               # 项目依赖描述
├── oh-package.json5           # ohpm 依赖配置
└── local.properties           # 本地 SDK 路径等配置
```

### 5.2 模块级目录

```
entry/
├── src/
│   ├── main/                  # 主源码目录
│   │   ├── ets/               # ArkTS 代码
│   │   │   ├── entryability/
│   │   │   ├── pages/
│   │   │   └── ...
│   │   ├── resources/         # 模块资源
│   │   │   ├── base/
│   │   │   ├── en_US/
│   │   │   └── ...
│   │   └── module.json5       # 模块配置
│   └── ohosTest/              # 测试代码
├── build-profile.json5        # 模块构建配置
├── hvigorfile.ts              # 模块构建脚本
├── consumer-rules.txt         # 混淆规则
└── obfuscation-rules.txt      # 混淆规则
```

### 5.3 关键配置文件说明

| 文件 | 路径 | 作用 |
|------|------|------|
| `app.json5` | `AppScope/` | 应用级配置: 包名、图标、版本号、API 版本等 |
| `module.json5` | `entry/src/main/` | 模块级配置: Ability、权限、设备类型等 |
| `main_pages.json` | `resources/base/profile/` | 页面路由配置 |
| `build-profile.json5` | 项目根/模块根 | 构建配置: 签名、编译选项等 |
| `hvigor-config.json5` | `hvigor/` | Hvigor 构建工具配置 |
| `oh-package.json5` | 项目根 | ohpm 三方依赖配置 |

---

## 参考资料

- [应用开发导读](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)
- [开发准备](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/start-overview-V5)
- [构建第一个 ArkTS 应用](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/start-with-ets-stage-V5)
- [资源分类与访问](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/resource-categories-and-access-V5)
- [工程目录结构](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-project-structure-V5)
- [应用开发准备](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-overview-V5)
- [Stage 模型应用程序包结构](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/application-package-structure-stage-V5)
