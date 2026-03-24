# HarmonyOS Ability 架构详解

> 适用版本: HarmonyOS NEXT (API 12+)

## 概述

HarmonyOS 采用 **Stage 模型** 作为应用架构，核心组件是 **Ability**。理解 Ability 架构是开发 HarmonyOS 应用的基础。

---

## Stage 模型核心概念

### 架构层次

```
┌─────────────────────────────────────────────────────────────┐
│                      Application                             │
│  (应用进程，包含多个 UIAbility 和 ExtensionAbility)          │
├─────────────────────────────────────────────────────────────┤
│                    AbilityStage                              │
│  (Module 级别生命周期管理，每个 HAP 一个)                     │
├─────────────────────────────────────────────────────────────┤
│          UIAbility              ExtensionAbility             │
│  (有 UI 界面，用户交互)         (无 UI，特定场景服务)          │
├─────────────────────────────────────────────────────────────┤
│                    WindowStage                               │
│  (窗口舞台，承载 UI 页面)                                     │
├─────────────────────────────────────────────────────────────┤
│                      Page                                    │
│  (ArkTS 页面组件，@Entry + @Component)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## UIAbility - 有界面的应用组件

### 完整生命周期

```
┌──────────────┐
│   onCreate   │  ← Ability 实例创建
└──────┬───────┘
       │
┌──────▼───────┐
│onWindowStage │
│   Create     │  ← 窗口舞台创建，加载 UI
└──────┬───────┘
       │
┌──────▼───────┐
│ onForeground │  ← 进入前台，用户可见
└──────┬───────┘
       │
       │   ┌────────────┐
       ├───► onBackground ◄───┐  ← 进入后台
       │   └────────────┘     │
       │                      │
       │   ┌────────────┐     │
       ├───► onForeground ◄───┘  ← 多次切换
       │
┌──────▼───────┐
│onWindowStage │
│   Destroy    │  ← 窗口舞台销毁
└──────┬───────┘
       │
┌──────▼───────┐
│  onDestroy   │  ← Ability 实例销毁
└──────────────┘
```

### 生命周期回调详解

| 回调 | 触发时机 | 典型用途 |
|------|----------|----------|
| `onCreate` | Ability 创建时 | 初始化全局资源、恢复状态 |
| `onWindowStageCreate` | 窗口舞台创建 | 加载首个页面、初始化窗口 |
| `onForeground` | 进入前台 | 恢复暂停的任务、获取焦点 |
| `onBackground` | 进入后台 | 释放资源、保存状态 |
| `onWindowStageDestroy` | 窗口舞台销毁 | 释放 UI 相关资源 |
| `onDestroy` | Ability 销毁 | 最终清理、注销监听 |

### 标准实现

```typescript
// entry/src/main/ets/entryability/EntryAbility.ets
import UIAbility from '@ohos.app.ability.UIAbility'
import window from '@ohos.window'
import hilog from '@ohos.hilog'

const DOMAIN = 0xFF00
const TAG = 'EntryAbility'

export default class EntryAbility extends UIAbility {

  // ===== 1. onCreate: Ability 创建 =====
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    hilog.info(DOMAIN, TAG, 'onCreate called')

    // 获取启动参数
    const launchType = launchParam.launchReason
    if (launchType === AbilityConstant.LaunchReason.START_ABILITY) {
      hilog.info(DOMAIN, TAG, 'Launched by user')
    }

    // 初始化全局状态
    AppStorage.setOrCreate('isAppForeground', false)
    AppStorage.setOrCreate('launchTime', Date.now())

    // 注意：此时 UI 还未创建，不能操作界面元素
  }

  // ===== 2. onWindowStageCreate: 窗口舞台创建 =====
  onWindowStageCreate(windowStage: window.WindowStage): void {
    hilog.info(DOMAIN, TAG, 'onWindowStageCreate called')

    // 设置窗口事件监听
    windowStage.on('windowStageEvent', (data) => {
      hilog.info(DOMAIN, TAG, `WindowStage event: ${data}`)
    })

    // 加载主页面
    windowStage.loadContent('pages/Index', (err, data) => {
      if (err.code) {
        hilog.error(DOMAIN, TAG, `Failed to load content: ${err.message}`)
        return
      }
      hilog.info(DOMAIN, TAG, 'Successfully loaded main page')
    })
  }

  // ===== 3. onForeground: 进入前台 =====
  onForeground(): void {
    hilog.info(DOMAIN, TAG, 'onForeground called')

    // 更新全局状态
    AppStorage.setOrCreate('isAppForeground', true)

    // 恢复暂停的任务
    // 例如：恢复音乐播放、恢复定位服务

    // 刷新数据
    this.refreshDataIfNeeded()
  }

  // ===== 4. onBackground: 进入后台 =====
  onBackground(): void {
    hilog.info(DOMAIN, TAG, 'onBackground called')

    // 更新全局状态
    AppStorage.setOrCreate('isAppForeground', false)

    // 保存当前状态
    this.saveCurrentState()

    // 释放不必要的资源
    // 例如：暂停音乐、停止定位
  }

  // ===== 5. onWindowStageDestroy: 窗口舞台销毁 =====
  onWindowStageDestroy(): void {
    hilog.info(DOMAIN, TAG, 'onWindowStageDestroy called')

    // 释放 UI 相关资源
    // 例如：取消图片加载、释放媒体资源
  }

  // ===== 6. onDestroy: Ability 销毁 =====
  onDestroy(): void {
    hilog.info(DOMAIN, TAG, 'onDestroy called')

    // 最终清理
    // 例如：注销事件监听、释放全局资源
    this.cleanup()
  }

  // ===== 辅助方法 =====
  private refreshDataIfNeeded(): void {
    // 检查是否需要刷新数据
    const lastUpdate = AppStorage.get<number>('lastDataUpdate') || 0
    const now = Date.now()
    if (now - lastUpdate > 5 * 60 * 1000) { // 5 分钟
      // 触发数据刷新
    }
  }

  private saveCurrentState(): void {
    // 保存应用状态到 Preferences
  }

  private cleanup(): void {
    // 清理资源
  }
}
```

### 启动模式

UIAbility 支持三种启动模式：

| 模式 | 配置 | 行为 |
|------|------|------|
| `singleton` | 默认 | 单实例，已存在则复用 |
| `specified` | 指定 | 根据 key 决定是否复用 |
| `multiton` | 标准 | 多实例，每次创建新的 |

```json5
// module.json5
{
  "module": {
    "abilities": [
      {
        "name": "EntryAbility",
        "srcEntry": "./ets/entryability/EntryAbility.ets",
        "launchType": "singleton",  // 启动模式
        // ...
      }
    ]
  }
}
```

---

## ExtensionAbility - 无界面的扩展组件

### 类型与用途

| 类型 | 用途 | 场景 |
|------|------|------|
| `FormExtensionAbility` | 服务卡片 | 桌面小组件 |
| `WorkSchedulerExtensionAbility` | 延时任务 | 后台同步 |
| `BackgroundTaskExtensionAbility` | 长时任务 | 后台音乐播放 |
| `InputMethodExtensionAbility` | 输入法 | 自定义键盘 |
| `AccessibilityExtensionAbility` | 无障碍 | 辅助功能 |
| `ShareExtensionAbility` | 分享 | 系统分享面板 |
| `DataShareExtensionAbility` | 数据共享 | 跨应用数据访问 |

### FormExtensionAbility 示例（服务卡片）

```typescript
// forms/FormAbility.ets
import FormExtensionAbility from '@ohos.app.ability.FormExtensionAbility'
import formProvider from '@ohos.app.form.formProvider'

export default class FormAbility extends FormExtensionAbility {

  onAddForm(want: Want): formBindingData.FormBindingData {
    // 创建卡片时调用
    const formData = {
      title: 'Weather',
      temperature: '25°C',
      city: 'Shanghai'
    }

    return formBindingData.createFormBindingData(formData)
  }

  onUpdateForm(formId: string): void {
    // 更新卡片数据
    const newData = {
      title: 'Weather',
      temperature: '26°C',
      city: 'Shanghai'
    }

    formProvider.updateForm(formId, formBindingData.createFormBindingData(newData))
  }

  onRemoveForm(formId: string): void {
    // 卡片被删除
  }
}
```

---

## AbilityStage - Module 生命周期

每个 HAP 模块有一个 AbilityStage，用于管理该模块内 Ability 的生命周期。

```typescript
// entry/src/main/ets/myabilitystage/MyAbilityStage.ets
import AbilityStage from '@ohos.app.ability.AbilityStage'

export default class MyAbilityStage extends AbilityStage {

  onCreate(): void {
    // HAP 首次加载时调用
    console.log('AbilityStage onCreate')
  }

  onAcceptWant(want: Want): string {
    // 处理 specified 启动模式的 key
    if (want.action === 'com.example.ACTION_DETAIL') {
      return `Detail_${want.parameters?.id || 'default'}`
    }
    return ''
  }
}
```

---

## Ability 间通信

### 启动另一个 Ability

```typescript
import common from '@ohos.app.ability.common'
import Want from '@ohos.app.ability.Want'

// 在 UIAbility 或组件中启动
async function startDetailAbility(context: common.UIAbilityContext, itemId: string) {
  const want: Want = {
    bundleName: 'com.example.myapp',
    abilityName: 'DetailAbility',
    parameters: {
      itemId: itemId
    }
  }

  try {
    await context.startAbility(want)
  } catch (err) {
    console.error(`Failed to start ability: ${err.message}`)
  }
}
```

### 获取启动参数

```typescript
// 在目标 Ability 中获取参数
export default class DetailAbility extends UIAbility {
  private itemId: string = ''

  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    // 获取传递的参数
    this.itemId = want.parameters?.itemId as string || ''
    console.log(`DetailAbility onCreate, itemId: ${this.itemId}`)
  }

  onNewWant(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    // singleton 模式下，已有实例时调用
    this.itemId = want.parameters?.itemId as string || ''
    console.log(`DetailAbility onNewWant, itemId: ${this.itemId}`)
  }
}
```

### 返回结果

```typescript
// 启动方
async function startForResult(context: common.UIAbilityContext) {
  const want: Want = {
    bundleName: 'com.example.myapp',
    abilityName: 'SelectorAbility'
  }

  try {
    const result = await context.startAbilityForResult(want)
    if (result.resultCode === 0) {
      const selectedId = result.want?.parameters?.selectedId
      console.log(`Selected: ${selectedId}`)
    }
  } catch (err) {
    console.error(`Failed: ${err.message}`)
  }
}

// 被启动方返回结果
function finishWithResult(context: common.UIAbilityContext, selectedId: string) {
  const resultWant: Want = {
    parameters: {
      selectedId: selectedId
    }
  }
  context.terminateSelfWithResult({
    resultCode: 0,
    want: resultWant
  })
}
```

---

## Context 使用指南

### 获取 Context

```typescript
// 在 UIAbility 中
export default class EntryAbility extends UIAbility {
  onCreate(): void {
    // this.context 就是 UIAbilityContext
    const cacheDir = this.context.cacheDir
    const filesDir = this.context.filesDir
  }
}

// 在页面组件中
@Entry
@Component
struct MyPage {
  private context: common.UIAbilityContext = getContext(this) as common.UIAbilityContext

  build() {
    Column() {
      Button('Get Resource Path')
        .onClick(() => {
          const resourceDir = this.context.resourceDir
        })
    }
  }
}
```

### 常用 Context 属性

| 属性 | 说明 | 用途 |
|------|------|------|
| `filesDir` | 应用文件目录 | 存储应用数据 |
| `cacheDir` | 缓存目录 | 临时文件、缓存 |
| `tempDir` | 临时目录 | 临时文件 |
| `resourceDir` | 资源目录 | 访问 rawfile |
| `databaseDir` | 数据库目录 | RDB 文件存储 |

---

## 应用生命周期最佳实践

### 状态管理架构

```typescript
// 应用级状态管理
// entry/src/main/ets/common/AppStateManager.ets

export class AppStateManager {
  private static instance: AppStateManager

  static getInstance(): AppStateManager {
    if (!AppStateManager.instance) {
      AppStateManager.instance = new AppStateManager()
    }
    return AppStateManager.instance
  }

  // 初始化应用状态
  initAppState(): void {
    // 设置默认值
    AppStorage.setOrCreate('isAppForeground', false)
    AppStorage.setOrCreate('networkStatus', 'unknown')
    AppStorage.setOrCreate('userToken', '')
  }

  // 进入前台
  onAppForeground(): void {
    AppStorage.setOrCreate('isAppForeground', true)

    // 刷新网络状态
    this.checkNetworkStatus()

    // 同步数据
    this.syncData()
  }

  // 进入后台
  onAppBackground(): void {
    AppStorage.setOrCreate('isAppForeground', false)

    // 保存状态
    this.saveAppState()
  }

  private checkNetworkStatus(): void {
    // 检查网络状态
  }

  private syncData(): void {
    // 同步数据
  }

  private saveAppState(): void {
    // 保存应用状态
  }
}
```

### 在 Ability 中使用

```typescript
import { AppStateManager } from '../common/AppStateManager'

export default class EntryAbility extends UIAbility {
  private appStateManager: AppStateManager = AppStateManager.getInstance()

  onCreate(): void {
    this.appStateManager.initAppState()
  }

  onForeground(): void {
    this.appStateManager.onAppForeground()
  }

  onBackground(): void {
    this.appStateManager.onAppBackground()
  }
}
```

---

## 常见反模式

### 1. 在 onCreate 中操作 UI

```typescript
// ❌ Bad: onCreate 时 UI 还未创建
onCreate(): void {
  // 无法访问 UI 组件
  AppStorage.setOrCreate('uiReady', true)  // 没意义
}

// ✅ Good: 在 onWindowStageCreate 后操作
onWindowStageCreate(windowStage: window.WindowStage): void {
  windowStage.loadContent('pages/Index', () => {
    AppStorage.setOrCreate('uiReady', true)
  })
}
```

### 2. 忘记在 onBackground 中释放资源

```typescript
// ❌ Bad: 后台仍占用资源
onBackground(): void {
  // 什么都没做
}

// ✅ Good: 释放后台不需要的资源
onBackground(): void {
  this.mediaPlayer?.pause()
  this.locationService?.stop()
  this.saveCurrentState()
}
```

### 3. 在 onForeground 中执行耗时操作

```typescript
// ❌ Bad: 阻塞 UI 显示
onForeground(): void {
  this.syncLargeData()  // 耗时操作
}

// ✅ Good: 异步执行
onForeground(): void {
  setTimeout(() => {
    this.syncLargeData()  // 不阻塞 UI
  }, 100)
}
```

---

## 快速参考

| 概念 | 说明 |
|------|------|
| Stage 模型 | HarmonyOS 应用架构模型 |
| UIAbility | 有界面的应用组件 |
| ExtensionAbility | 无界面的扩展服务 |
| AbilityStage | Module 生命周期管理 |
| WindowStage | 窗口舞台，承载页面 |
| launchType | singleton / specified / multiton |
| onCreate | Ability 创建 |
| onForeground | 进入前台 |
| onBackground | 进入后台 |
| onDestroy | Ability 销毁 |
| Context | 应用上下文，访问资源 |