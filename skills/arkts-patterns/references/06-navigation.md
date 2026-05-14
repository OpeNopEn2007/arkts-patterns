# 导航路由

> HarmonyOS NEXT (API 12) 导航路由参考文档

---

## 目录

- [Navigation 组件（推荐替代 @ohos.router）](#navigation-组件推荐替代-ohosrouter)
- [NavPathStack 页面栈管理器](#navpathstack-页面栈管理器)
- [NavDestination 子页面容器](#navdestination-子页面容器)
- [@Provide/@Consume 跨组件共享路由栈](#provideconsume-跨组件共享路由栈)
- [路由操作 API](#路由操作-api)
- [NavDestination 生命周期](#navdestination-生命周期)
- [页面传参](#页面传参)
- [系统路由表配置](#系统路由表配置)
- [Router 迁移到 Navigation 指南](#router-迁移到-navigation-指南)
- [常见配置](#常见配置)
- [避坑指南](#避坑指南)
- [路由服务封装 (RouterService 单例)](#路由服务封装-routerservice-单例)
- [Tab 导航 (Tabs + TabContent)](#tab-导航-tabs--tabcontent)

---

## Navigation 组件（推荐替代 @ohos.router）

**Navigation** 是 HarmonyOS 推荐的页面导航组件，替代传统的 `@ohos.router` API。

### 为什么选择 Navigation？

| 对比项 | Navigation | @ohos.router |
|--------|-----------|-------------|
| 组件化 | 组件级，自然集成 | API 级，跳转独立 |
| 页面栈 | NavPathStack 精细控制 | Router 全局控制 |
| 生命周期 | 丰富生命周期（8个钩子） | 有限生命周期 |
| 类型安全 | 编译时校验 | 运行时校验 |
| 传参 | 强类型 | object 传递 |
| 动画 | 自定义转场 | 有限选项 |
| 深层链接 | 原生支持 | 需额外处理 |
| 跨设备 | 原生支持 | 需额外适配 |

### 基础结构

```typescript
@Entry
@Component
struct Index {
  @Provide navPathStack: NavPathStack = new NavPathStack()

  build() {
    Navigation(this.navPathStack) {
      // 首页内容
      Column() {
        Button('跳转到详情')
          .onClick(() => {
            this.navPathStack.pushPathByName('Detail', { id: 1 })
          })
      }
    }
    .navDestination(this.PagesMap)   // 绑定子页面映射
    .title('首页')                    // 设置标题
    .mode(NavigationMode.Stack)      // 栈模式
  }
}

@Builder
function PagesMap(name: string, param?: Object) {
  if (name === 'Detail') {
    Detail({ param: param })
  }
  if (name === 'Login') {
    Login({ param: param })
  }
}
```

---

## NavPathStack 页面栈管理器

**NavPathStack** 是 Navigation 的路由栈管理器，用于控制页面的压栈、出栈等操作。

### 创建实例

```typescript
// 在 @Entry 组件中 provide，让子组件可以 consume
@Provide navPathStack: NavPathStack = new NavPathStack()
```

### 栈操作 API

| 方法 | 说明 |
|------|------|
| pushPathByName | 根据名称压栈 |
| pop | 出栈（返回） |
| popToName | 返回至指定页面 |
| popToIndex | 返回至指定索引 |
| replacePathByName | 替换当前页面 |
| removeByName | 移除指定页面 |
| removeByIndexes | 移除指定索引范围 |
| clear | 清空栈 |
| getParamByName | 获取指定页面参数 |
| getAllPathName | 获取所有页面名称 |
| size | 获取栈大小 |

---

## NavDestination 子页面容器

**NavDestination** 是 Navigation 的子页面容器，用于承载跳转后的页面内容。

### 基础用法

```typescript
@Component
struct Detail {
  @Consume navPathStack: NavPathStack;
  private param?: Record<string, Object>;

  aboutToAppear() {
    // 获取传入参数
    const params = this.navPathStack.getParamByName('Detail');
    console.log('Detail params:', JSON.stringify(params));
  }

  build() {
    NavDestination() {
      Column() {
        Text('详情页面')
          .fontSize(24)
          .fontWeight(FontWeight.Bold)

        Button('返回')
          .onClick(() => {
            this.navPathStack.pop()
          })
      }
      .width('100%')
      .height('100%')
      .justifyContent(FlexAlign.Center)
    }
    .title('详情')          // 页面标题
    .mode(NavDestinationMode.STANDARD)  // STANDARD 标准模式 / DIALOG 弹窗模式
    .onBackPressed(() => {
      // 自定义返回逻辑，返回 true 阻止默认行为
      this.showConfirmExit()
      return true
    })
  }
}
```

### 页面映射模式

在 Navigation 中通过 `navDestination` 属性绑定页面映射函数：

```typescript
Navigation(this.navPathStack) {
  // 首页内容
}
.navDestination(this.PagesMap)

@Builder
PagesMap(name: string, param?: Object) {
  if (name === 'Home') {
    HomePage()
  } else if (name === 'Detail') {
    DetailPage({ param: param })
  } else if (name === 'Profile') {
    ProfilePage({ param: param })
  } else if (name === 'Settings') {
    SettingsPage()
  }
}
```

---

## @Provide/@Consume 跨组件共享路由栈

通过 `@Provide` 和 `@Consume` 装饰器实现跨组件层级共享路由栈。

### 在 @Entry 组件中提供

```typescript
@Entry
@Component
struct App {
  @Provide navPathStack: NavPathStack = new NavPathStack()

  build() {
    Navigation(this.navPathStack) {
      MainContent()
    }
    .navDestination(this.PagesMap)
  }
}
```

### 在子组件中消费

```typescript
@Component
struct MainContent {
  @Consume navPathStack: NavPathStack;

  build() {
    Column() {
      Button('跳转')
        .onClick(() => {
          this.navPathStack.pushPathByName('Detail', { from: 'MainContent' })
        })
    }
  }
}
```

### 多层嵌套传递

`@Provide` 和 `@Consume` 可以跨越多层组件嵌套，无需逐层传递：

```typescript
@Component
struct GrandChild {
  @Consume navPathStack: NavPathStack;  // 直接消费顶级提供的路由栈

  build() {
    Button('深层跳转')
      .onClick(() => this.navPathStack.pushPathByName('NestedPage', {}))
  }
}

@Component
struct Child {
  build() {
    Column() {
      GrandChild()
    }
  }
}
```

---

## 路由操作 API

### pushPathByName - 压栈

```typescript
// 基础跳转
this.navPathStack.pushPathByName('Detail', { id: 1, type: 'article' })

// 带动画
this.navPathStack.pushPathByName('Detail', { id: 1 }, {
  animated: true,
  duration: 300,
  curve: Curve.EaseInOut
})
```

### pop - 返回

```typescript
// 返回上一页
this.navPathStack.pop()

// 返回上一页并传递数据
this.navPathStack.pop({ result: 'success' })

// 返回多级
this.navPathStack.pop(2)  // 返回两级

// 带动画返回
this.navPathStack.pop(undefined, { animated: true })
```

### replacePathByName - 替换

```typescript
// 替换当前页面（登录后替换首页）
this.navPathStack.replacePathByName('Login', {})
this.navPathStack.replacePathByName('Home', { token: 'xxx' })
```

### popToName - 返回至指定页面

```typescript
// 返回至指定名称的页面
this.navPathStack.popToName('Home')

// 返回至指定名称并传递数据
this.navPathStack.popToName('Home', { refreshed: true })
```

### clear - 清空栈

```typescript
// 清空整个页面栈
this.navPathStack.clear()
```

### removeByName - 移除指定页面

```typescript
// 从栈中移除指定名称的页面
this.navPathStack.removeByName('IntermediatePage')

// 移除多个
this.navPathStack.removeByName(['PageA', 'PageB'])
```

### getParamByName - 获取参数

```typescript
// 获取指定页面的参数
const params = this.navPathStack.getParamByName('Detail')

// 获取指定页面的索引
const index = this.navPathStack.getIndexByName('Detail')
```

---

## NavDestination 生命周期

NavDestination 提供 8 个生命周期钩子，按顺序排列如下：

```
aboutToAppear → onWillAppear → onAppear → onWillShow → onShown
                                         ↓
                                   页面交互中...
                                         ↓
                                   onWillHide → onHidden → onWillDisappear → onDisappear
```

### 生命周期钩子一览

| 钩子 | 触发时机 | 说明 |
|------|---------|------|
| aboutToAppear | 页面即将创建 | 初始化数据，获取参数 |
| onWillAppear | 页面即将显示（创建时） | 配置页面动画 |
| onAppear | 页面已创建 | 页面已创建完毕 |
| onWillShow | 页面即将显示（每次可见） | 每次页面变为可见时触发 |
| onShown | 页面已显示（每次可见） | 页面已完全可见 |
| onWillHide | 页面即将隐藏 | 新页面进入，当前页即将不可见 |
| onHidden | 页面已隐藏 | 页面已完全不可见 |
| onWillDisappear | 页面即将销毁 | 执行清理工作 |
| onDisappear | 页面已销毁 | 页面已完全销毁 |

### 完整示例

```typescript
@Component
struct DetailPage {
  @Consume navPathStack: NavPathStack;

  aboutToAppear(): void {
    console.log('DetailPage aboutToAppear');
    const params = this.navPathStack.getParamByName('Detail');
    // 初始化数据
  }

  onWillAppear(): void {
    console.log('DetailPage onWillAppear');
  }

  onAppear(): void {
    console.log('DetailPage onAppear');
  }

  onWillShow(): void {
    console.log('DetailPage onWillShow');
    // 每次页面可见时刷新数据
  }

  onShown(): void {
    console.log('DetailPage onShown');
  }

  onWillHide(): void {
    console.log('DetailPage onWillHide');
    // 保存页面状态
  }

  onHidden(): void {
    console.log('DetailPage onHidden');
  }

  onWillDisappear(): void {
    console.log('DetailPage onWillDisappear');
    // 清理定时器、取消订阅
  }

  onDisappear(): void {
    console.log('DetailPage onDisappear');
  }

  build() {
    NavDestination() {
      // 页面内容
    }
  }
}
```

### 生命周期典型用例

```typescript
// 页面可见时刷新数据，隐藏时取消请求
@Component
struct FeedPage {
  private requestTask?: Promise<void>;

  onWillShow(): void {
    this.refreshData();  // 从其他页面返回时刷新
  }

  onWillHide(): void {
    this.cancelRequests();  // 页面隐藏时取消网络请求
  }

  onWillDisappear(): void {
    this.cleanup();  // 页面销毁时清理资源
  }

  private refreshData(): void { /* ... */ }
  private cancelRequests(): void { /* ... */ }
  private cleanup(): void { /* ... */ }
}
```

---

## 页面传参

### pushPathByName 传递参数

```typescript
// 定义参数类型
interface DetailParams {
  id: number;
  type: string;
  extra?: Record<string, Object>;
}

// 传递参数
this.navPathStack.pushPathByName('Detail', {
  id: 1001,
  type: 'article',
  extra: { source: 'homepage' }
} as DetailParams)
```

### getParamByName 获取参数

```typescript
@Component
struct Detail {
  @Consume navPathStack: NavPathStack;

  aboutToAppear() {
    // 获取当前页面的参数
    const params = this.navPathStack.getParamByName('Detail');
    if (params && params.length > 0) {
      const data = params[0] as Record<string, Object>;
      console.log('Received params:', JSON.stringify(data));
      // 处理参数...
    }
  }
}
```

### 从子页面返回数据

```typescript
// 子页面返回时传递数据
@Component
struct EditPage {
  @Consume navPathStack: NavPathStack;

  private saveAndReturn(): void {
    const result = {
      updated: true,
      data: { name: 'new name', age: 25 }
    };
    this.navPathStack.pop(result);
  }
}

// 父页面接收返回数据
@Component
struct MainPage {
  @Consume navPathStack: NavPathStack;

  onWillShow(): void {
    // 当从 EditPage 返回时，在这里处理返回数据
    const params = this.navPathStack.getParamByName('MainPage');
    if (params && params.length > 0) {
      const result = params[0] as Record<string, Object>;
      if (result['updated']) {
        this.refreshData();
      }
    }
  }
}
```

---

## 系统路由表配置

### route_map.json

在项目的 `resources/base/profile/` 目录下创建 `route_map.json` 文件：

```json
{
  "routerMap": [
    {
      "name": "Detail",
      "pageSourceFile": "src/main/ets/pages/DetailPage.ets",
      "buildFunction": "PagesMap",
      "data": {
        "description": "详情页面"
      }
    },
    {
      "name": "Login",
      "pageSourceFile": "src/main/ets/pages/LoginPage.ets",
      "buildFunction": "PagesMap",
      "data": {
        "description": "登录页面"
      }
    },
    {
      "name": "Profile",
      "pageSourceFile": "src/main/ets/pages/ProfilePage.ets",
      "buildFunction": "PagesMap",
      "data": {
        "description": "个人中心"
      }
    }
  ]
}
```

### module.json5 配置

在 `src/main/module.json5` 中注册路由配置：

```json5
{
  module: {
    name: "entry",
    type: "entry",
    description: "$string:module_desc",
    mainElement: "EntryAbility",
    deviceTypes: ["phone", "tablet"],
    pages: "$profile:route_map",  // 引用 route_map.json
    abilities: [
      {
        name: "EntryAbility",
        srcEntry: "./ets/entryability/EntryAbility.ets",
        description: "$string:entryability_desc",
        icon: "$media:icon",
        label: "$string:app_name",
        startWindowIcon: "$media:icon",
        startWindowBackground: "$color:start_window_background",
        export: true,
        // 声明 Navigation 路由
        removeRouterPage: true,
        routerCapabilities: [
          {
            "name": "Detail",
            "target": "Detail"
          },
          {
            "name": "Login",
            "target": "Login"
          }
        ]
      }
    ]
  }
}
```

### 页面映射 @Builder 适配

路由表配置后，页面映射函数名称需要与 `route_map.json` 中的 `buildFunction` 字段匹配：

```typescript
// buildFunction 字段指定为 "PagesMap"
@Builder
export function PagesMap(name: string, param?: Object) {
  if (name === 'Detail') {
    DetailPage({ param: param })
  } else if (name === 'Login') {
    LoginPage({ param: param })
  } else if (name === 'Profile') {
    ProfilePage({ param: param })
  }
}
```

---

## Router 迁移到 Navigation 指南

### API 对照表

| Router API | Navigation 对应 API |
|-----------|-------------------|
| router.pushUrl() | navPathStack.pushPathByName() |
| router.replaceUrl() | navPathStack.replacePathByName() |
| router.back() | navPathStack.pop() |
| router.clear() | navPathStack.clear() |
| router.getLength() | navPathStack.size() |
| router.getState() | navPathStack.getAllPathName() |
| router.getParams() | navPathStack.getParamByName() |

### 迁移步骤

**步骤 1: 替换页面跳转**

```typescript
// 旧: Router
import { router } from '@kit.ArkUI';
router.pushUrl({
  url: 'pages/Detail',
  params: { id: 1 }
})

// 新: Navigation
@Consume navPathStack: NavPathStack;
this.navPathStack.pushPathByName('Detail', { id: 1 })
```

**步骤 2: 替换返回操作**

```typescript
// 旧: Router
router.back()

// 新: Navigation
this.navPathStack.pop()
```

**步骤 3: 替换获取参数**

```typescript
// 旧: Router
const params = router.getParams() as Record<string, Object>;

// 新: Navigation
aboutToAppear() {
  const params = this.navPathStack.getParamByName('Detail');
}
```

**步骤 4: 替换信息方法**

```typescript
// 旧: Router
router.showAlertDialog({ ... })

// 新: Navigation
// 使用自定义弹窗或系统 AlertDialog
AlertDialog.show({ ... })
```

### 迁移检查清单

- [ ] 替换 `import { router } from '@kit.ArkUI';` 为 `@Consume navPathStack: NavPathStack;`
- [ ] 替换所有 `router.pushUrl()` 为 `navPathStack.pushPathByName()`
- [ ] 替换所有 `router.back()` 为 `navPathStack.pop()`
- [ ] 替换所有 `router.replaceUrl()` 为 `navPathStack.replacePathByName()`
- [ ] 替换所有 `router.getParams()` 为 `navPathStack.getParamByName()`
- [ ] 在 Entry 组件中 `@Provide navPathStack: NavPathStack`
- [ ] 添加 `Navigation` 组件和 `@Builder PagesMap`
- [ ] 添加 `NavDestination` 容器

---

## 常见配置

### mode - 导航模式

```typescript
Navigation(this.navPathStack) {
  // ...
}
.mode(NavigationMode.Stack)
```

| NavigationMode | 说明 |
|---------------|------|
| Stack | 标准堆栈模式（默认） |
| Split | 分屏模式 |

导航模式又分为以下两种布局：

- **Stack mode**: 标准栈模式，跳转时新页面覆盖旧页面
- **Split mode**: 分屏模式，左右同时显示主页面和子页面

### titleMode - 标题栏模式

```typescript
Navigation(this.navPathStack) {
  // ...
}
.titleMode(NavigationTitleMode.Mini)
```

| NavigationTitleMode | 说明 |
|--------------------|------|
| Full | 全尺寸标题栏 |
| Mini | 迷你模式（仅显示返回按钮和标题） |
| Free | 自由模式（可在 Mini 和 Full 之间过渡） |

### hideTitleBar - 隐藏标题栏

```typescript
NavDestination() {
  // ...
}
.hideTitleBar(true)  // 隐藏 NavDestination 的标题栏
```

### onBackPressed - 拦截返回

```typescript
Navigation(this.navPathStack) {
  // ...
}
.onBackPressed(() => {
  // 返回 true 阻止默认返回行为，false 执行默认返回
  if (this.hasUnsavedChanges) {
    this.showConfirmExit()
    return true
  }
  return false
})
```

### 转场动画

```typescript
// 设置页面转场动画
Navigation(this.navPathStack) {
  // ...
}
.navDestination(this.PagesMap)

@Builder
function PagesMap(name: string, param?: Object) {
  if (name === 'Detail') {
    Detail({ param: param })
      .transition({
        type: TransitionType.Push,
        duration: 300,
        curve: Curve.EaseInOut,
        translate: { x: '100%', y: 0 }
      })
  }
}
```

### 完整配置示例

```typescript
@Entry
@Component
struct App {
  @Provide navPathStack: NavPathStack = new NavPathStack()

  @Builder
  PagesMap(name: string, param?: Object) {
    if (name === 'Home') {
      HomePage({ param: param })
        .transition(TransitionEffect.slide)
    } else if (name === 'Detail') {
      DetailPage({ param: param })
        .transition(TransitionEffect.push)
    }
  }

  build() {
    Navigation(this.navPathStack) {
      Column() {
        Text('首页').fontSize(24)
      }
    }
    .navDestination(this.PagesMap)
    .title('应用')
    .titleMode(NavigationTitleMode.Full)
    .mode(NavigationMode.Stack)
    .onBackPressed(() => {
      // 全局返回拦截
      return false
    })
  }
}
```

---

## 避坑指南

### 1. 不要在 @Entry 外部创建 NavPathStack

```typescript
// 错误: 在组件外部创建
const globalNavStack = new NavPathStack();

// 正确: 在 @Entry 组件内部创建
@Entry
@Component
struct App {
  @Provide navPathStack: NavPathStack = new NavPathStack();
}
```

### 2. NavPathStack 必须配 @Provide

```typescript
// 错误: 没有 Provide，子组件无法 Consume
@Component
struct App {
  private navPathStack: NavPathStack = new NavPathStack();
  // ...
}

// 正确
@Component
struct App {
  @Provide navPathStack: NavPathStack = new NavPathStack();
  // ...
}
```

### 3. NavDestination 必须包含在 Navigation 内

```typescript
// 错误: NavDestination 单独使用
build() {
  NavDestination() { ... }
}

// 正确: 通过 navDestination 属性绑定
build() {
  Navigation(this.navPathStack) { ... }
    .navDestination(this.PagesMap)
}
```

### 4. @Builder PagesMap 中不要遗漏页面映射

```typescript
// 容易遗漏：新增页面后忘记在 PagesMap 中添加
@Builder
PagesMap(name: string, param?: Object) {
  if (name === 'Home') { ... }     // ✅
  else if (name === 'Detail') { ... } // ✅
  // else if (name === 'Profile') { ... } // 忘记添加，跳转后会白屏
}
```

### 5. 不要在 onWillShow 中重复 push

```typescript
// 错误: onWillShow 中 push 导致无限循环
onWillShow(): void {
  this.navPathStack.pushPathByName('Detail', {}); // 每次显示都会跳转！
}

// 正确: 使用条件判断
onWillShow(): void {
  if (this.shouldRedirect) {
    this.shouldRedirect = false;
    this.navPathStack.pushPathByName('Detail', {});
  }
}
```

### 6. 页面参数类型注意

```typescript
// getParamByName 返回的是数组
const params = this.navPathStack.getParamByName('Detail');
// params 是 Array<Object>，可能有多个同名页面参数

// 安全获取
if (params && params.length > 0) {
  const data = params[params.length - 1] as Record<string, Object>;
  // 使用 data...
}
```

### 7. NavPathStack 的 size 与预期不符

```typescript
// Navigation 初始时 size 包含首页，调用 clear 后 size 为 0
// 但 Navigation 组件依然存在
console.log(this.navPathStack.size()); // 包含首页时为 1

// 调用 clear 后重新 push 才能显示新页面
this.navPathStack.clear();
this.navPathStack.pushPathByName('Home', {});
```

### 8. 系统路由表配置后仍需 PagesMap

```typescript
// 即使配置了 route_map.json，Navigation 的 navDestination 绑定仍然需要
Navigation(this.navPathStack) { ... }
  .navDestination(this.PagesMap) // 这一句不能省略！
```

---

## 路由服务封装 (RouterService 单例)

将 NavPathStack 操作封装为全局单例服务，提供类型安全、集中管理的路由调用入口。

### 路由表常量定义

```typescript
// router/RouterTable.ets
// 路由名称常量 — 统一管理，避免字符串硬编码
export const ROUTES = {
  HOME: 'Home',
  DETAIL: 'Detail',
  SETTINGS: 'Settings',
  PROFILE: 'Profile'
} as const

// 路由参数类型 — 编译时类型校验
export interface DetailParam {
  id: number
  title?: string
}

export interface SettingsParam {
  section?: string
}
```

### RouterService 单例类

```typescript
// services/RouterService.ets
import { NavPathStack } from '@ohos.arkui'
import { ROUTES } from '../router/RouterTable'

export class RouterService {
  private static instance: RouterService
  private navPathStack: NavPathStack | null = null

  static getInstance(): RouterService {
    if (!RouterService.instance) {
      RouterService.instance = new RouterService()
    }
    return RouterService.instance
  }

  // 设置导航栈（在 AppRouter 初始化时调用一次）
  setNavPathStack(stack: NavPathStack): void {
    this.navPathStack = stack
  }

  // 推入页面
  push(name: string, param?: Object): void {
    this.navPathStack?.pushPath({ name, param })
  }

  // 替换当前页面
  replace(name: string, param?: Object): void {
    this.navPathStack?.replacePath({ name, param })
  }

  // 返回上一页
  pop(): void {
    this.navPathStack?.pop()
  }

  // 返回到指定页面
  popTo(name: string): void {
    this.navPathStack?.popToName(name)
  }

  // 返回到首页
  popToRoot(): void {
    this.navPathStack?.clear()
  }

  // 获取当前页面数量
  getSize(): number {
    return this.navPathStack?.size() || 0
  }

  // 检查是否能返回
  canGoBack(): boolean {
    return (this.navPathStack?.size() || 0) > 1
  }

  // --- 便捷方法：封装具体业务路由 ---
  goToDetail(id: number, title?: string): void {
    this.push(ROUTES.DETAIL, { id, title })
  }

  goToSettings(section?: string): void {
    this.push(ROUTES.SETTINGS, { section })
  }

  goToProfile(): void {
    this.push(ROUTES.PROFILE)
  }
}

// 导出全局单例
export const routerService = RouterService.getInstance()
```

### 在 AppRouter 中注入 NavPathStack

```typescript
// router/AppRouter.ets
import { routerService } from '../services/RouterService'

@Entry
@Component
struct AppRouter {
  navPathStack: NavPathStack = new NavPathStack()

  aboutToAppear(): void {
    // 将 Navigation 的栈实例注入 RouterService
    routerService.setNavPathStack(this.navPathStack)
  }

  build() {
    Navigation(this.navPathStack) {
      HomePage()
    }
    .navDestination(this.buildNavDestination)
    .hideTitleBar(true)
  }

  @Builder
  buildNavDestination(name: string, param: Object) {
    switch (name) {
      case ROUTES.DETAIL:
        DetailPage({ param: param as DetailParam })
        break
      case ROUTES.SETTINGS:
        SettingsPage({ param: param as SettingsParam })
        break
      case ROUTES.PROFILE:
        ProfilePage()
        break
      default:
        Text(`Unknown route: ${name}`)
    }
  }
}
```

### 使用 RouterService 进行导航

```typescript
// 任意组件中直接使用单例，无需 @Consume
import { routerService } from '../services/RouterService'

@Component
struct ProductCard {
  @Prop productId: number = 0

  build() {
    Button('查看详情')
      .onClick(() => {
        routerService.goToDetail(this.productId, '商品详情')
      })
  }
}
```

> **设计要点**: RouterService 单例解耦了路由操作与组件层级关系。任意深度的组件无需 `@Consume` 即可调用路由，但需确保 `setNavPathStack` 已在 AppRouter 的 `aboutToAppear` 中完成注入。

---

## Tab 导航 (Tabs + TabContent)

HarmonyOS 使用 `Tabs` + `TabContent` 组件实现底部 Tab 导航，可与 `Navigation` 配合使用将 Tab 放置为首页内容。

### 底部 Tab 导航示例

```typescript
@Entry
@Component
struct TabPage {
  @State currentIndex: number = 0
  private tabsController: TabsController = new TabsController()

  build() {
    Column() {
      Tabs({ barPosition: BarPosition.End, controller: this.tabsController }) {
        TabContent() {
          HomePage()
        }
        .tabBar(this.tabBuilder('首页', 0, $r('app.media.ic_home')))

        TabContent() {
          CategoryPage()
        }
        .tabBar(this.tabBuilder('分类', 1, $r('app.media.ic_category')))

        TabContent() {
          CartPage()
        }
        .tabBar(this.tabBuilder('购物车', 2, $r('app.media.ic_cart')))

        TabContent() {
          ProfilePage()
        }
        .tabBar(this.tabBuilder('我的', 3, $r('app.media.ic_profile')))
      }
      .barHeight(56)
      .onChange((index: number) => {
        this.currentIndex = index
      })
    }
  }

  @Builder
  tabBuilder(title: string, index: number, icon: Resource) {
    Column() {
      Image(icon)
        .width(24)
        .height(24)
        .fillColor(this.currentIndex === index ? '#007DFF' : '#999999')

      Text(title)
        .fontSize(12)
        .fontColor(this.currentIndex === index ? '#007DFF' : '#999999')
        .margin({ top: 4 })
    }
  }
}
```

### Tab + Navigation 结合

```typescript
@Entry
@Component
struct MainTabNav {
  @Provide navPathStack: NavPathStack = new NavPathStack()
  @State currentIndex: number = 0
  private tabsController: TabsController = new TabsController()

  @Builder
  PagesMap(name: string, param?: Object) {
    if (name === 'Detail') {
      DetailPage({ param: param })
    }
  }

  build() {
    Navigation(this.navPathStack) {
      Tabs({ barPosition: BarPosition.End, controller: this.tabsController }) {
        TabContent() { HomeTab() }.tabBar(this.tabBuilder('首页', 0, $r('app.media.ic_home')))
        TabContent() { CategoryTab() }.tabBar(this.tabBuilder('分类', 1, $r('app.media.ic_category')))
        TabContent() { ProfileTab() }.tabBar(this.tabBuilder('我的', 2, $r('app.media.ic_profile')))
      }
      .barHeight(56)
      .onChange((index: number) => { this.currentIndex = index })
    }
    .navDestination(this.PagesMap)
    .title('首页')
    .mode(NavigationMode.Stack)
  }

  @Builder
  tabBuilder(title: string, index: number, icon: Resource) {
    Column() {
      Image(icon)
        .width(24).height(24)
        .fillColor(this.currentIndex === index ? '#007DFF' : '#999999')
      Text(title)
        .fontSize(12)
        .fontColor(this.currentIndex === index ? '#007DFF' : '#999999')
        .margin({ top: 4 })
    }
  }
}
```

> **注意**: 当 Tab 内容中也需要页面跳转时，将 Tabs 放在 Navigation 内部作为首页内容，Tab 子页面通过 `@Consume navPathStack` 访问同一个路由栈。

---

> **参考链接汇总**
>
> - [Navigation 导航](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-navigation-navigation-V5)
> - [Navigation 组件入门](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-navigation-introduction-V5)
> - [Router 迁移到 Navigation](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-router-to-navigation-V5)
> - [Navigation 组件使用](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/cta-usage-of-the-navigation-component-V5)
