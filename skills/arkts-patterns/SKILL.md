---
name: arkts-patterns
description: 编写、审查、重构或讨论 HarmonyOS NEXT / ArkTS 代码时必须使用本 Skill。覆盖 ArkUI declarative UI（@Component, @State, @Prop, @Link）、状态管理（@Provide/@Consume, AppStorage, LocalStorage, V2）、组件生命周期（aboutToAppear, aboutToDisappear）、TaskPool/Worker 并发、UIAbility/ExtensionAbility 架构、Navigation（NavPathStack + NavDestination）、HTTP networking、数据持久化（Preferences, RDB, Repository）、动画、手势，以及官方 EmptyAbility 项目模板和 scaffold 工具。触发关键词包括 HarmonyOS, ArkTS, ArkUI, @Component, @State, UIAbility, Navigation, TaskPool, ohos, Huawei apps。
---

# ArkTS 开发模式

用于构建 HarmonyOS NEXT 应用的 ArkTS 开发模式与最佳实践。

## 最短路径（最快用法）

默认走这条最短路径：

1. 解析需求关键词（state/navigation/networking/persistence/concurrency）。
2. 只打开一个匹配的核心 reference（优先 04/06/08/09/10）。
3. 生成单文件 ArkTS 骨架，包含必要装饰器、生命周期，以及业务逻辑 TODO 区域。

如果不确定，从 `references/01-getting-started.md` 开始，然后只跳转到一个核心主题。

### 最小示例（需求 -> 查阅章节 -> 输出代码骨架）

- 需求: "做一个可删除待办列表，子组件可修改父组件列表"
- 查阅章节: `references/04-state-management.md`（@Link、不可变数组更新）+ `references/05-ui-components.md`（List/ForEach）
- 输出骨架:

```typescript
@Component
struct TodoItem {
  @Link items: string[]
  @Prop title: string
  @Prop index: number

  build() {
    Row() {
      Text(this.title)
      Button('Delete').onClick(() => {
        this.items = this.items.filter((_, i) => i !== this.index)
      })
    }
  }
}

@Entry
@Component
struct TodoPage {
  @State items: string[] = ['Task A', 'Task B']

  build() {
    List() {
      ForEach(this.items, (item: string, index: number) => {
        ListItem() {
          TodoItem({ items: $items, title: item, index })
        }
      }, (item: string) => item)
    }
  }
}
```

---

## 项目模板（EmptyAbility）

`empty-ability-template/` 目录包含完整的 HarmonyOS NEXT Stage Model 项目模板（API 22 / SDK 6.0.2）。**创建新项目时优先使用该模板。**

### 快速开始

```bash
# 方法 1：脚手架脚本（推荐）
bash scripts/scaffold.sh ./my-new-app com.yourcompany.yourapp

# 方法 2：手动复制
cp -r empty-ability-template/ ./my-new-app/
cd my-new-app && ohpm install
```

### 核心文件

| 文件 | 用途 |
|------|---------|
| `entry/.../EntryAbility.ets` | 应用入口，包含完整 UIAbility 生命周期 |
| `entry/.../EntryBackupAbility.ets` | 数据备份/恢复扩展 |
| `entry/.../pages/Index.ets` | 主页面，演示 @Entry/@Component/@State |
| `AppScope/app.json5` | 应用级配置（`bundleName`、`version`、`icon`） |
| `entry/.../module.json5` | 模块配置（`abilities`、`extensionAbilities`） |
| `build-profile.json5` | 构建配置（`targetSdkVersion`） |

### 创建后检查清单

1. 更新 `AppScope/app.json5` 中的 `bundleName` 和 `vendor`。
2. 打开 DevEco Studio 前，确保项目路径只包含 ASCII 字符；部分 DevEco Studio 版本无法打开包含中文或其他非 ASCII 字符的路径。
3. 运行 `ohpm install` 安装依赖。
4. 在 DevEco Studio 中打开项目进行开发。
5. 做 CLI 验证时，运行 Hvigor 前确保 `DEVECO_SDK_HOME` 指向 DevEco SDK 根目录。

详见 [模板文档](references/templates/empty-ability/README.md)。

---

## 核心架构

### HarmonyOS 应用结构

```
Application
├── AbilityStage (Module lifecycle)
├── UIAbility (UI components, user interaction)
│   ├── WindowStage (Window management)
│   └── Pages (ArkTS @Entry components)
└── ExtensionAbility (Background services)
```

**关键概念**：HarmonyOS 使用 **Stage Model**，其中 UIAbility 是主要 UI 组件。
📖 [应用模型（Ability Kit）](references/02-application-model.md)

---

## 快速参考

### 状态装饰器

| 装饰器 | 作用域 | 数据方向 | 使用场景 |
|-----------|-------|-----------|----------|
| `@State` | Component | 本地 | 组件内部状态 |
| `@Prop` | Parent → Child | 单向 | 来自父组件的只读数据 |
| `@Link` | Parent ↔ Child | 双向 | 双向绑定 |
| `@Provide/@Consume` | Ancestor ↔ Descendant | 双向 | 跨层级通信 |
| `@Observed/@ObjectLink` | 嵌套对象 | 双向 | 深层对象观测 |
| `@StorageLink` | 应用级 | 双向 | 全局应用状态 |
| `@LocalStorageLink` | 页面级 | 双向 | 页面共享状态 |
| `@Watch` | - | - | 监听状态变化 |

### 关键模式

```typescript
// 组件定义
@Component
struct MyComponent {
  @State count: number = 0

  build() {
    Text(`${this.count}`)
  }
}

// @Link 双向绑定（必须使用 $ 语法）
Child({ value: $this.count })

// 深层观测
@Observed
class Task {
  title: string = ''
  completed: boolean = false
}

@Component
struct TaskItem {
  @ObjectLink task: Task  // 观测 @Observed 类
}
```

### @Link 与 @Prop + Callback 决策矩阵

**关键默认规则：子组件需要同步父组件数据时，优先使用 @Link + $ 语法。**

当需求出现“子组件可修改父组件数据”或“双向绑定”时，默认使用 @Link + $ 语法；只有存在明确理由（校验、协调更新、审计记录）时才考虑 callback。

| 场景 | 模式 | 原因 |
|----------|---------|--------|
| **子组件修改父组件数据（默认）** | `@Link` + `$` 语法 | 双向同步，代码更少 |
| 简单数据同步（计数器、开关） | `@Link` + `$` 语法 | 代码更少，绑定直接 |
| 子组件修改数组元素 | `@Link` + `$` 语法 | 需要双向同步 |
| 父组件需要在更新前校验 | `@Prop` + callback | 父组件控制变更 |
| 多个子组件共享同一数据 | `@Prop` + callback | 便于协调更新 |
| 需要追踪变更内容 | `@Prop` + callback | callback 可提供审计信息 |

**模式选择流程：**
```
子组件需要修改父组件数据？
├── 是 → 是否存在明确的校验/协调需求？
│       ├── 否 → 使用 @Link + $ 语法（默认）
│       └── 是 → 考虑 @Prop + callback
└── 否 → 使用 @Prop（只读）
```

**示例：列表修改时正确使用 @Link**
```typescript
// 父组件：必须使用 $ 语法
@Component
struct Parent {
  @State items: Item[] = []

  build() {
    Child({ items: $items })  // @Link 必须使用 $
  }
}

// 子组件：@Link + 不可变更新
@Component
struct Child {
  @Link items: Item[]  // 双向绑定

  private deleteItem(id: number): void {
    // 必须使用不可变更新，filter 会创建新数组
    this.items = this.items.filter(item => item.id !== id)
  }
}
```

### Ability 生命周期

```
onCreate → onWindowStageCreate → onForeground ↔ onBackground → onWindowStageDestroy → onDestroy
```

### Navigation（推荐）

```typescript
// 使用 Navigation + NavDestination，不使用 @ohos.router
Navigation(this.navPathStack) {
  // 内容
}
.navDestination((name, param) => {
  // 路由到页面
})

// 导航
navPathStack.pushPath({ name: 'Detail', param: { id: 1 } })
navPathStack.pop()
```

---

## 模式模块

### 1. 状态管理
- **装饰器**：@State、@Prop、@Link、@Provide/@Consume、@Observed/@ObjectLink
- **全局状态**：AppStorage、LocalStorage、PersistentStorage
- **V2 装饰器（API 12+）**：@ComponentV2、@Local、@Param、@Event、@ObservedV2、@Trace
- **最佳实践**：减少状态数量，选择正确装饰器，使用 @Track 做精确观测

📖 [状态管理](references/04-state-management.md)

### 2. 应用模型（Ability Kit）
- **UIAbility**：主要 UI 组件，包含生命周期和启动模式（singleton/standard/multiton）
- **ExtensionAbility**：后台服务（Form、Service、Backup、DataShare 等）
- **AbilityStage**：模块生命周期管理
- **Context**：访问应用资源和目录（filesDir、cacheDir 等）

📖 [应用模型](references/02-application-model.md)

### 3. ArkTS 语言
- **声明式 UI**：@Component、@Entry、@Reusable、build()
- **生命周期**：aboutToAppear、aboutToDisappear、onPageShow、onPageHide
- **UI 构建器**：@Builder、@BuilderParam（插槽）、@Styles、@Extend
- **编码规范**：命名约定、代码组织、从 TypeScript 迁移

📖 [ArkTS 语言](references/03-arkts-language.md)

### 4. UI 组件
- **布局**：Row/Column、Stack、Flex、RelativeContainer、GridRow/GridCol
- **常用组件**：Button、Text、TextInput、Image、List
- **列表渲染**：ForEach、LazyForEach、ListItemGroup
- **设计模式**：单一职责、LoadingContainer、Skeleton、FormField、EmptyState
- **组件封装**：CustomButton（type/size 变体）、SearchBar、FormValidator

📖 [UI 组件与布局](references/05-ui-components.md)

### 5. Navigation
- **Navigation 组件**：推荐导航系统
- **NavPathStack**：页面栈操作（pushPathByName、pop、replacePathByName）
- **NavDestination**：页面目的地，包含 8 个生命周期钩子
- **RouterService 模式**：导航操作的单例封装
- **Tab 导航**：Tabs + TabContent 构建底部标签栏
- **系统路由表**：route_map.json 配置

📖 [导航路由](references/06-navigation.md)

### 6. 动画与手势
- **属性动画**：`.animation()` 修饰器与 Curve 选项
- **显式动画**：`animateTo()`，可通过 Promise 串行动画
- **转场**：组件进入/退出、TransitionEffect 预设
- **手势**：Tap、LongPress、Pan、Pinch、Rotation、Swipe、GestureGroup
- **手势冲突处理**：priorityGesture、parallelGesture、GestureMask
- **性能**：优先使用 transform 属性（scale/rotate），避免频繁改 width/height

📖 [动画与手势](references/07-animation-gestures.md)

### 7. 网络通信
- **HTTP Client**：@ohos.net.http 封装与拦截器
- **模式**：请求/响应拦截器、Token 注入、签名
- **错误处理**：ErrorHandler 错误码映射、ErrorCodeInterceptor
- **重试机制**：带抖动的指数退避
- **缓存**：带 TTL 的内存缓存、CachedHttpClient
- **API 服务**：领域服务类（UserApi、DataApi）
- **WebSocket**：指数退避重连
- **RCP**：Remote Communication Protocol（下一代网络 API）

📖 [网络通信](references/08-networking.md)

### 8. 数据持久化
- **Preferences**：轻量级键值存储、PreferencesUtil 单例
- **RDB**：SQLite 关系型数据库、Repository 模式（CRUD 操作）
- **KV Store**：分布式键值数据库
- **文件存储**：文本/二进制文件操作、JSON 序列化
- **迁移**：使用 PRAGMA 管理数据库版本

📖 [数据持久化](references/09-data-persistence.md)

### 9. 并发
- **TaskPool**：CPU 密集型并行任务，自动线程池管理
- **Worker**：长时间后台任务，独立线程
- **选择指南**：TaskPool（少于 3 分钟、CPU-bound）vs Worker（长时间、持续运行）
- **反模式**：阻塞 UI 线程、任务粒度不合理、缺少取消/错误处理

📖 [并发 (TaskPool/Worker)](references/10-concurrency.md)

---

## References 索引（第 3 层）

具体主题的详细参考文档位于 `references/` 目录：

| # | 主题 | # | 主题 |
|---|-------|---|-------|
| 01 | [入门指南](references/01-getting-started.md) | 15 | [后台任务](references/15-background-tasks.md) |
| 02 | [应用模型](references/02-application-model.md) | 16 | [连接能力](references/16-connectivity.md) |
| 03 | [ArkTS 语言](references/03-arkts-language.md) | 17 | [分布式能力](references/17-distributed.md) |
| 04 | [状态管理](references/04-state-management.md) | 18 | [媒体](references/18-media.md) |
| 05 | [UI 组件](references/05-ui-components.md) | 19 | [无障碍](references/19-accessibility.md) |
| 06 | [Navigation](references/06-navigation.md) | 20 | [性能](references/20-performance.md) |
| 07 | [动画与手势](references/07-animation-gestures.md) | 21 | [调试与测试](references/21-debugging-testing.md) |
| 08 | [网络通信](references/08-networking.md) | 22 | [工具链](references/22-tooling.md) |
| 09 | [数据持久化](references/09-data-persistence.md) | 23 | [自适应布局](references/23-adaptive-layout.md) |
| 10 | [并发](references/10-concurrency.md) | 24 | [发布](references/24-publishing.md) |
| 11 | [权限与安全](references/11-permissions-security.md) | 25 | [应用包](references/25-app-package.md) |
| 12 | [窗口与屏幕](references/12-window-screen.md) | 26 | [NDK 开发](references/26-ndk.md) |
| 13 | [文件管理](references/13-file-management.md) | 27 | [API 参考](references/27-api-references.md) |
| 14 | [国际化与本地化](references/14-i18n-localization.md) | | |

附加资源：
- [Templates](references/templates/README.md) - EmptyAbility 模板文档
- [Learning Resources](references/RESOURCES.md) - 外部开源项目与教程

---

## 常见反模式

### 1. 不可变数组更新（关键）

ArkTS 状态观测需要**新的数组引用**。原地修改不会触发 UI 更新。

```typescript
// 错误：splice 原地修改，不会触发 UI 更新
this.items.splice(index, 1)

// 正确：filter 创建新数组
this.items = this.items.filter((_, i) => i !== index)

// 错误：push 原地修改
this.items.push(newItem)

// 正确：展开运算符创建新数组
this.items = [...this.items, newItem]

// 错误：直接索引赋值
this.items[0] = updatedItem

// 正确：map 创建新数组
this.items = this.items.map((item, i) =>
  i === 0 ? updatedItem : item
)
```

### 2. @Link 缺少 $ 语法
```typescript
// 错误：缺少 $
Child({ value: this.count })

// 正确：@Link 使用 $
Child({ value: $this.count })
```

### 3. 深层嵌套缺少 @Observed
```typescript
// 错误：嵌套属性变化不会触发更新
this.user.profile.name = 'New'

// 正确：使用 @Observed/@ObjectLink
@Observed
class Profile { name: string = '' }
```

### 4. 在 aboutToAppear 中启动动画
```typescript
// 错误：组件尚未创建
aboutToAppear() {
  animateTo({ duration: 300 }, () => { this.scale = 1.5 })
}

// 正确：使用 onAppear
Text('Hello')
  .onAppear(() => {
    animateTo({ duration: 300 }, () => { this.scale = 1.5 })
  })
```

### 5. 缺少 HTTP 清理
```typescript
// 错误：没有清理
let httpRequest = http.createHttp()
await httpRequest.request(...)

// 正确：始终 destroy
try {
  await httpRequest.request(...)
} finally {
  httpRequest.destroy()
}
```

### 6. 在 onCreate 中执行 UI 操作
```typescript
// 错误：onCreate 时 UI 尚未创建
onCreate(): void {
  AppStorage.setOrCreate('uiReady', true)
}

// 正确：等待 onWindowStageCreate
onWindowStageCreate(windowStage: window.WindowStage): void {
  windowStage.loadContent('pages/Index', () => {
    AppStorage.setOrCreate('uiReady', true)
  })
}
```

### 7. onBackground 中忘记释放资源
```typescript
// 错误：后台仍占用资源
onBackground(): void {
  // 未处理
}

// 正确：释放后台资源
onBackground(): void {
  this.mediaPlayer?.pause()
  this.locationService?.stop()
  this.saveCurrentState()
}
```

---

## 代码生成规则

### 单文件优先

**默认：每个任务生成一个完整的单文件实现。**

理由：
- 更容易审查和测试
- 避免评测时断言分散
- 相关代码保持在一起
- 依赖管理更简单

**需要拆分多文件的情况：**
- 存在清晰职责边界（例如 model + service + component）
- 工具函数会被其他文件复用
- 生成代码超过 500 行
- 用户明确要求多文件结构

### 组件命名约定

| 类型 | 模式 | 示例 |
|------|---------|---------|
| 页面 | `XxxPage` | `UserListPage`, `SettingsPage` |
| 组件 | `Xxx` 或 `XxxComponent` | `UserCard`, `LoadingSpinner` |
| 服务 | `XxxService` | `UserService`, `HttpService` |
| 模型 | `Xxx`（PascalCase） | `User`, `Task`, `TodoItem` |

---

## 项目结构

完整参考项目见 `empty-ability-template/`。关键目录：

```
MyApp/
├── AppScope/app.json5        # 应用配置（必须设置 bundleName）
├── entry/src/main/
│   ├── ets/
│   │   ├── entryability/     # UIAbility 入口
│   │   ├── pages/            # @Entry 页面
│   │   ├── components/       # @Component 组件
│   │   ├── models/           # 数据模型
│   │   ├── services/         # API/HTTP 服务
│   │   ├── repositories/     # 数据访问（RDB）
│   │   └── utils/            # 工具函数
│   └── resources/            # 模块资源
├── build-profile.json5       # 构建配置
└── module.json5              # 模块声明
```

---

## 构建命令

```bash
# 创建新项目
bash scripts/scaffold.sh <target-dir> <bundle-name>

# 安装依赖
ohpm install

# 构建项目
hvigorw assembleHap

# 清理构建
hvigorw clean

# 运行测试
hvigorw test
```

### CLI 构建环境检查

同一个项目可能在 DevEco Studio IDE 中编译成功，但在终端中失败，因为 shell 缺少 SDK 环境变量。声称 HarmonyOS 项目可从 CLI 构建前，必须显式检查终端环境。

**Windows PowerShell 示例：**

```powershell
# DevEco Studio 安装在 D:\ 时的常见 SDK 根目录
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

**如果 Hvigor 报错 `Invalid value of 'DEVECO_SDK_HOME' in the system environment path`：**

1. 找到 SDK 根目录，通常是 `D:\DevEco Studio\sdk` 或 `%LOCALAPPDATA%\Huawei\Sdk`。
2. 将 `DEVECO_SDK_HOME` 设置到该根目录，不要设置到 `default/openharmony`。
3. 运行 `hvigorw --stop-daemon`，让 daemon 读取修正后的环境。
4. 重新构建，并以 `BUILD SUCCESSFUL` 和退出码 `0` 作为通过标准。

`wmic` 缺失等警告不一定致命，最终以 Hvigor 是否 `BUILD FAILED` 为准。

---

## v3 编排器：References + DevEco MCP

将本 Skill 作为 HarmonyOS NEXT 开发任务的编排器：

1. 使用 `references/` 获取稳定的 ArkTS/HarmonyOS 工程模式。
2. 当 DevEco MCP 工具可用时，用它获取最新 API 知识、检查 ETS、同步工程、构建、启动应用、检查 UI 树、执行 UI 操作和验证 UI。
3. 如果 DevEco MCP 不可用，继续使用 `references/`，并明确标注实时检查、构建检查或 UI 检查未执行。

### 三层架构

| 层级 | 职责 | 使用时机 |
|-------|----------------|-------------|
| Layer 1：`SKILL.md` 编排器 | 路由任务，选择最短安全路径，执行副作用边界，并报告哪些内容已验证/未验证。 | 所有 HarmonyOS NEXT 或 ArkTS 任务。 |
| Layer 2：DevEco MCP 实时工具层 | 查询当前 SDK/API 知识，检查 ETS，同步/构建/启动项目，检查 UI，执行明确的 UI 操作，并验证 UI 行为。 | 会话中暴露 DevEco MCP 工具，且任务需要真实项目或 SDK 反馈时。 |
| Layer 3：`references/` 工程记忆层 | 提供精选、稳定的 ArkTS 模式、反模式、模板规则和离线兜底指导。 | 实现模式总是参考；MCP 不可用时作为兜底。 |

小任务仍保留前面的最短路径。v3 架构只增加路由与验证纪律，不应拖慢简单模式生成。

### 任务路由

| 任务类型 | 首选路径 | 兜底路径 |
|-----------|------------|---------------|
| 稳定 ArkTS 模式、代码骨架、最佳实践 | `references/` | 本 `SKILL.md` 快速参考 |
| 最新 HarmonyOS API 或 SDK 行为 | DevEco MCP `harmonyos_knowledge_search` | `references/27-api-references.md` + 官方文档查询 |
| 编写或修改 `.ets` 文件 | `references/` + DevEco MCP `check_ets_files` | 按 references 手动审查 |
| ETS 语法/规范检查 | DevEco MCP `check_ets_files` | 请求用户提供 DevEco/Hvigor 日志 |
| 项目同步 | DevEco MCP `project_sync` | 请求用户在 DevEco Studio 中同步 |
| 项目构建 | DevEco MCP `build_project` | Hvigor CLI 构建或用户提供构建日志 |
| 启动应用 | DevEco MCP `start_app` | 请求用户手动启动 |
| UI 树检查 | DevEco MCP `get_app_ui_tree` | 截图或代码审查 |
| UI 操作 | 仅在任务明确需要交互时使用 DevEco MCP `perform_ui_action` | 用户手动执行操作 |
| UI 验证 | DevEco MCP `verify_ui` | 截图审查或人工验收 |

### DevEco MCP 可用性

在声称项目已检查、已构建、已启动或已完成 UI 验证前，先检查当前会话是否有 DevEco MCP 工具。如果没有，直接说明：

```text
当前未检测到 DevEco MCP，因此无法执行 ETS 检查、项目同步、构建或 UI 验证。
我会基于 arkts-patterns references 给出实现，并标注需要你本地验证的步骤。
```

不要因为缺少 DevEco MCP 就阻塞普通代码生成。DevEco MCP 是推荐的实时工具增强，不是使用本 Skill 的强依赖。

### DevEco MCP 配置引导

当用户希望启用 DevEco MCP，但当前会话未检测到相关工具时，按以下顺序引导配置：

1. 先联网查看 npm 包页 <https://www.npmjs.com/package/@deveco-codegenie/mcp>，以包页 README 和当前 dist-tag 为准；不要只依赖本 Skill 中的转述。
2. 如果网页不可抓取，可用 `npm view @deveco-codegenie/mcp@beta version dist-tags description --json` 获取版本与标签元数据。
3. **确认本机已安装 DevEco Studio**，因为该 MCP 会通过 `DEVECO_PATH` 借用本地 DevEco Studio / HarmonyOS SDK 工具链。
4. 确认 HarmonyOS 工程根目录；优先使用当前工作区根目录或用户明确给出的工程目录作为 `PROJECT_PATH`。
5. 读取 [`references/deveco-mcp.example.json`](references/deveco-mcp.example.json) 作为通用 JSON 示例。
6. 根据用户使用的客户端生成对应配置：Claude/Cursor/Cline 通常使用 `mcpServers` JSON；Codex 使用 `config.toml` 的 `[mcp_servers.<name>]` 结构。
7. 只使用占位符或用户明确确认的本机路径；不要把真实 `DEVECO_PATH`、工程路径、设备信息、账号、证书、token 或签名凭据写入仓库文件。
8. 配置完成后提示用户重启对应 AI 客户端或新开会话，再验证是否能看到 `harmonyos_knowledge_search`、`check_ets_files`、`project_sync`、`build_project` 等工具。

通用 JSON 形态如下，具体位置取决于 MCP 客户端：

```json
{
  "mcpServers": {
    "deveco-codegenie": {
      "command": "npx",
      "args": [
        "-y", "@deveco-codegenie/mcp@beta"
      ],
      "env": {
        "DEVECO_PATH": "<DEV_ECO_STUDIO_INSTALL_DIR>",
        "DEVECO_SDK_HOME": "<DEV_ECO_SDK_ROOT>",
        "PROJECT_PATH": "${workspaceFolder}"
      }
    }
  }
}

```

如果用户要求智能体代为配置，应先读取目标客户端现有配置，合并新增 `deveco-codegenie` 条目，避免覆盖其他 MCP server。

### 副作用边界

| 工具 | 副作用等级 | 策略 |
|------|-------------------|--------|
| `harmonyos_knowledge_search` | 低 | 可直接用于查询当前 API 或 SDK 知识。 |
| `check_ets_files` | 低 | 检查 `.ets` 文件时可直接使用。 |
| `get_app_ui_tree` | 低到中 | UI 验证任务中使用。 |
| `project_sync` | 中 | 用于明确的项目验证或开发任务。 |
| `build_project` | 中 | 用于明确的构建验证任务。 |
| `start_app` | 中到高 | 说明这可能启动应用或触碰设备/模拟器。 |
| `perform_ui_action` | 高 | 仅在用户请求 UI 交互，或验证必须交互时使用。 |
| `verify_ui` | 中 | 报告已验证内容和仍未验证内容。 |

绝不把用户本机 `DEVECO_PATH`、设备标识、账号信息、证书、token 或签名凭据写入受版本控制的文件。

### 官方文档兜底

华为官方 API 文档是动态渲染的。如果 DevEco MCP 不可用，但仍需要实时 API 查询，优先使用 Playwright 或 DevEco Studio 离线文档，不要依赖原始 HTTP 抓取。

每个 API 模块都有对应文档页：

```
https://developer.huawei.com/consumer/cn/doc/harmonyos-references/{page-name}
```

`{page-name}` 的生成方式：移除 `@ohos.`/`@arkts.` 前缀，转小写，将点号替换为连字符，并添加 `js-apis-` 前缀：
- `@ohos.data.preferences` -> `js-apis-data-preferences`
- `@ohos.taskpool` -> `js-apis-taskpool`

模块索引见 `references/27-api-references.md`。如果 Playwright 不可用，请用户在浏览器中打开 URL，或在目标 API 符号上使用 DevEco Studio 内置离线文档。

---

## 资源

- [HarmonyOS 开发文档](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)
- [ArkTS API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/arkts-apis-overview-V5)
- [ArkUI 组件参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/arkui-overview-V5)
- [学习资源](references/RESOURCES.md) - 开源项目和教程
