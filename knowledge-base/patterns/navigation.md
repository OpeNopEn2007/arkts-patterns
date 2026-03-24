# ArkTS 路由与导航模式

> 适用版本: HarmonyOS NEXT (API 12+)

## 概述

HarmonyOS 提供两种路由方案：
- **@ohos.router**：传统页面路由（不推荐）
- **Navigation + NavDestination**：组件导航（推荐）

本文档重点介绍推荐的 Navigation 导航模式。

---

## Navigation vs Router

| 特性 | Navigation | Router |
|------|------------|--------|
| 推荐度 | ✅ 推荐 | ❌ 不推荐 |
| 页面管理 | 栈管理，灵活 | 固定页面 |
| 转场动画 | 自定义 | 系统 |
| 传参方式 | 对象传参 | Want 参数 |
| 适用场景 | 单 Ability 多页面 | 传统多 Ability |

---

## Navigation 基础

### 基本结构

```typescript
import { NavPathStack } from '@ohos.arkui'

@Entry
@Component
struct MainPage {
  // 导航栈
  navPathStack: NavPathStack = new NavPathStack()

  build() {
    // Navigation 作为根容器
    Navigation(this.navPathStack) {
      // 首页内容
      Column() {
        Text('Home Page')
        Button('Go to Detail')
          .onClick(() => {
            this.navPathStack.pushPath({ name: 'Detail', param: { id: 1 } })
          })
      }
    }
    .title('My App')
    .titleMode(NavigationTitleMode.Mini)
  }
}
```

### NavDestination 目标页

```typescript
@Component
struct DetailPage {
  // 获取导航栈
  private navPathStack: NavPathStack = new NavPathStack()
  // 接收参数
  @State itemId: number = 0

  build() {
    NavDestination() {
      Column() {
        Text(`Detail Page - Item ${this.itemId}`)
        Button('Back')
          .onClick(() => {
            this.navPathStack.pop()
          })
      }
    }
    .title('Detail')
    .onReady((context: NavDestinationContext) => {
      // 获取导航栈
      this.navPathStack = context.pathStack
      // 获取参数
      const param = context.getParameter('id')
      this.itemId = param as number
    })
  }
}
```

---

## 路由表配置

### 创建路由表

```typescript
// router/RouterTable.ets
import { NavPathStack } from '@ohos.arkui'

// 路由名称常量
export const ROUTES = {
  HOME: 'Home',
  DETAIL: 'Detail',
  SETTINGS: 'Settings',
  PROFILE: 'Profile'
} as const

// 路由参数类型
export interface DetailParam {
  id: number
  title?: string
}

export interface SettingsParam {
  section?: string
}
```

### 注册路由

```typescript
// router/AppRouter.ets
import { NavPathStack } from '@ohos.arkui'
import { ROUTES } from './RouterTable'

@Entry
@Component
struct AppRouter {
  navPathStack: NavPathStack = new NavPathStack()

  build() {
    Navigation(this.navPathStack) {
      // 首页
      HomePage({ navPathStack: this.navPathStack })
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

### 路由服务封装

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

  // 设置导航栈
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

  // 便捷方法
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

export const routerService = RouterService.getInstance()
```

---

## 页面传参与接收

### 传递参数

```typescript
// 简单参数
navPathStack.pushPath({
  name: 'Detail',
  param: { id: 123 }
})

// 复杂对象
navPathStack.pushPath({
  name: 'Detail',
  param: {
    id: 123,
    title: 'Product Title',
    data: {
      price: 99.99,
      category: 'Electronics'
    }
  }
})
```

### 接收参数

```typescript
@Component
struct DetailPage {
  private navPathStack: NavPathStack = new NavPathStack()
  @State param: DetailParam = { id: 0 }

  build() {
    NavDestination() {
      Column() {
        Text(`Item ID: ${this.param.id}`)
        Text(`Title: ${this.param.title || 'N/A'}`)
      }
    }
    .title('Detail')
    .onReady((context: NavDestinationContext) => {
      this.navPathStack = context.pathStack
      // 获取完整参数对象
      this.param = context.getParameter() as DetailParam
    })
  }
}
```

### 返回结果

```typescript
// 页面 A：启动并等待结果
@Component
struct PageA {
  navPathStack: NavPathStack = new NavPathStack()
  @State selectedValue: string = ''

  build() {
    Navigation(this.navPathStack) {
      Column() {
        Text(`Selected: ${this.selectedValue}`)
        Button('Select Item')
          .onClick(() => {
            // 推入页面并设置结果回调
            this.navPathStack.pushPath({
              name: 'Selector',
              param: { mode: 'single' },
              onPop: (result: Object) => {
                this.selectedValue = result as string
              }
            })
          })
      }
    }
  }
}

// 页面 B：返回结果
@Component
struct SelectorPage {
  private navPathStack: NavPathStack = new NavPathStack()

  build() {
    NavDestination() {
      Column() {
        ForEach(['Apple', 'Banana', 'Orange'], (item: string) => {
          Button(item)
            .onClick(() => {
              // 返回结果
              this.navPathStack.pop(item)
            })
        })
      }
    }
  }
}
```

---

## 导航栏配置

### 标题栏

```typescript
NavDestination() {
  // 内容
}
.title('Page Title')
.titleMode(NavigationTitleMode.Mini)  // Mini 或 Full
.hideTitleBar(false)  // 是否隐藏标题栏
.hideBackButton(false)  // 是否隐藏返回按钮
```

### 自定义标题栏

```typescript
NavDestination() {
  // 内容
}
.customTitle(() => {
  Row() {
    Image($r('app.media.icon'))
      .width(24)
      .height(24)
    Text('Custom Title')
      .fontSize(18)
      .fontWeight(FontWeight.Bold)
  }
})
```

### 菜单项

```typescript
NavDestination() {
  // 内容
}
.title('Page Title')
.menus([
  {
    value: 'Edit',
    icon: $r('app.media.ic_edit'),
    action: () => {
      console.log('Edit clicked')
    }
  },
  {
    value: 'Share',
    icon: $r('app.media.ic_share'),
    action: () => {
      console.log('Share clicked')
    }
  }
])
```

---

## 转场动画

### 页面转场

```typescript
NavDestination() {
  // 内容
}
.transition(TransitionEffect.OPACITY)
  // 或自定义
.mode(NavigationMode.Stack)

// 在 Navigation 上配置
Navigation(this.navPathStack) {
  // 首页内容
}
.navBarStyle(NavigationBarStyle.NORMAL)
.hideToolBar(true)
```

### 共享元素转场

```typescript
// 列表页
@Component
struct ListPage {
  build() {
    List() {
      ForEach(this.items, (item: Item) => {
        ListItem() {
          Image(item.cover)
            .width(100)
            .height(100)
            .sharedTransition(`image_${item.id}`, { duration: 300 })
        }
        .onClick(() => {
          this.navPathStack.pushPath({
            name: 'Detail',
            param: { id: item.id }
          })
        })
      })
    }
  }
}

// 详情页
@Component
struct DetailPage {
  @State item: Item | null = null

  build() {
    NavDestination() {
      if (this.item) {
        Image(this.item.cover)
          .width('100%')
          .height(300)
          .sharedTransition(`image_${this.item.id}`, { duration: 300 })
      }
    }
  }
}
```

---

## Deep Link

### 配置 Deep Link

```json5
// module.json5
{
  "module": {
    "abilities": [
      {
        "name": "EntryAbility",
        "skills": [
          {
            "actions": ["ohos.want.action.viewData"],
            "entities": ["entity.system.browsable"],
            "uris": [
              {
                "scheme": "myapp",
                "host": "detail",
                "path": "/item"
              },
              {
                "scheme": "https",
                "host": "www.example.com",
                "path": "/item"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 处理 Deep Link

```typescript
// EntryAbility.ets
export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    // 处理 Deep Link
    if (want.uri) {
      this.handleDeepLink(want.uri)
    }
  }

  onNewWant(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    // 已存在实例时处理新的 Deep Link
    if (want.uri) {
      this.handleDeepLink(want.uri)
    }
  }

  private handleDeepLink(uri: string): void {
    // myapp://detail/item?id=123
    const url = new URL(uri)
    const path = url.pathname
    const params = new URLSearchParams(url.search)

    if (path === '/item') {
      const id = params.get('id')
      if (id) {
        // 通知导航到详情页
        AppStorage.setOrCreate('deepLinkId', parseInt(id))
      }
    }
  }
}
```

---

## Tab 导航

### 底部 Tab 导航

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
      .onChange((index) => {
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

---

## 快速参考

### Navigation API

| 方法 | 用途 |
|------|------|
| `pushPath()` | 推入新页面 |
| `replacePath()` | 替换当前页面 |
| `pop()` | 返回上一页 |
| `popToName()` | 返回到指定页面 |
| `clear()` | 清空栈，回到首页 |
| `size()` | 获取栈大小 |
| `getAllPathName()` | 获取所有页面名 |

### NavDestination 属性

| 属性 | 用途 |
|------|------|
| `title` | 标题 |
| `titleMode` | Mini / Full |
| `hideTitleBar` | 隐藏标题栏 |
| `hideBackButton` | 隐藏返回按钮 |
| `menus` | 菜单项 |
| `customTitle` | 自定义标题栏 |

### 路由模式选择

| 场景 | 推荐 |
|------|------|
| 单 Ability 多页面 | Navigation |
| 复杂页面栈管理 | Navigation |
| 自定义转场 | Navigation |
| 传统多 Ability | Router（不推荐）|