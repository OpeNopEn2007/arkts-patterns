# 应用模型 (Ability Kit)

> HarmonyOS NEXT (API 12) 应用模型与 Ability 架构参考

---

## 1. Stage 模型概述

### 1.1 什么是应用模型

应用模型是 HarmonyOS 应用开发的整体框架，定义了应用的开发方式、运行机制和组件化架构。从 API 11 开始，HarmonyOS 主推 **Stage 模型**，FA 模型已逐步废弃。

### 1.2 Stage 模型 vs FA 模型

| 对比维度 | Stage 模型 | FA 模型 (已废弃) |
|---------|-----------|-----------------|
| **设计思想** | 面向复杂应用，多实例多窗口 | 面向简单应用，PageAbility 概念 |
| **Ability 类型** | UIAbility + ExtensionAbility | PageAbility + ServiceAbility + DataAbility |
| **多实例** | 支持，一个应用可多个 UIAbility 实例 | 有限支持 |
| **窗口管理** | 每个 UIAbility 绑定独立的 WindowStage | 窗口管理较弱 |
| **Context 分离** | AbilityContext 和 ApplicationContext 分离 | 上下文管理简单 |
| **后台任务** | ExtensionAbility 统一管理 | ServiceAbility |
| **包结构** | `.app` (App Pack) 包含多个 HAP | `.hap` |
| **模块化** | 支持多 HAP 和 HSP | 不原生支持 |
| **推荐状态** | **当前主推** | **已废弃** (API 11+) |

### 1.3 Stage 模型核心概念

```
┌─────────────────────────────────────────────────┐
│                    Application                    │
│  ┌─────────────────────────────────────────────┐ │
│  │           AbilityStage (module)              │ │
│  │  ┌─────────────┐  ┌─────────────┐          │ │
│  │  │  UIAbility   │  │  UIAbility   │          │ │
│  │  │  (Launch)    │  │  (Launch)    │          │ │
│  │  │  ┌─────────┐ │  │  ┌─────────┐ │          │ │
│  │  │  │WindowStage│ │  │  │WindowStage│ │          │ │
│  │  │  │ ┌───────┐│ │  │  │ ┌───────┐│ │          │ │
│  │  │  │ │Window  ││ │  │  │ │Window  ││ │          │ │
│  │  │  │ └───────┘│ │  │  │ └───────┘│ │          │ │
│  │  │  └─────────┘ │  │  └─────────┘ │          │ │
│  │  └─────────────┘  └─────────────┘          │ │
│  └─────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────┐ │
│  │           ExtensionAbility                   │ │
│  │  ┌──────────┐┌──────────┐┌──────────┐       │ │
│  │  │ Service   ││  Widget  ││ Backup   │  ...  │ │
│  │  │ WkExt     ││  ArkUI   ││ Ext      │       │ │
│  │  └──────────┘└──────────┘└──────────┘       │ │
│  └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

---

## 2. UIAbility 组件概述

**UIAbility** 是 Stage 模型中包含 UI 界面的应用组件，是系统调度和用户交互的基本单元。每个 UIAbility 实例对应一个独立的 WindowStage 和任务。

### 2.1 核心特性

- **多实例**: 同一 UIAbility 可以创建多个实例
- **独立窗口**: 每个实例拥有独立的 WindowStage
- **生命周期管理**: 由系统统一管理
- **前后台切换**: 通过生命周期回调感知前后台状态
- **Want 通信**: 通过 Want 启动和传递数据

### 2.2 基本代码结构

```typescript
// entryability/EntryAbility.ts
import { UIAbility, AbilityConstant, Want } from '@kit.AbilityKit';
import { window, UIContext } from '@kit.ArkUI';

export default class EntryAbility extends UIAbility {
  // UIAbility 上下文
  // - this.context: AbilityContext
  // - this.context.applicationInfo: 应用信息

  onCreate(want: Want, param: AbilityConstant.LaunchParam): void {
    // Ability 创建时调用（冷启动）
    // want: 启动参数
    // param.launchReason: 启动原因
    console.info('EntryAbility onCreate');
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    // WindowStage 创建时调用
    // 在此设置主页面加载
    console.info('EntryAbility onWindowStageCreate');

    // 加载主页面
    windowStage.loadContent('pages/Index', (err, data) => {
      if (err.code) {
        console.error('Failed to load content');
        return;
      }
      console.info('Succeeded in loading content');
    });
  }

  onForeground(): void {
    // Ability 进入前台时调用
    console.info('EntryAbility onForeground');
  }

  onBackground(): void {
    // Ability 进入后台时调用
    console.info('EntryAbility onBackground');
  }

  onWindowStageDestroy(): void {
    // WindowStage 销毁时调用
    console.info('EntryAbility onWindowStageDestroy');
  }

  onDestroy(): void {
    // Ability 销毁时调用
    console.info('EntryAbility onDestroy');
  }

  onNewWant(want: Want, param: AbilityConstant.LaunchParam): void {
    // Ability 已存在但重新启动时调用（热启动）
    console.info('EntryAbility onNewWant');
  }
}
```

---

## 3. UIAbility 生命周期

### 3.1 生命周期状态及回调

```
                         ┌──────────┐
                         │  onCreate │
                         └────┬─────┘
                              │
                    ┌─────────▼──────────┐
                    │ onWindowStageCreate │
                    └─────────┬──────────┘
                              │
                    ┌─────────▼──────────┐
                    │    onForeground     │
                    └─────────┬──────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
    ┌─────────▼──────────┐   │   ┌─────────▼──────────┐
    │    onBackground     │◄──┘   │    onForeground     │
    └─────────┬──────────┘       └─────────┬──────────┘
              │                            │
              │                   ┌─────────▼──────────┐
              │                   │   onWindowStage     │
              │                   │   WillDestroy       │
              │                   └─────────┬──────────┘
              │                             │
              │                   ┌─────────▼──────────┐
              │                   │ onWindowStageDestroy│
              │                   └─────────┬──────────┘
              │                             │
              │                   ┌─────────▼──────────┐
              │                   │     onDestroy       │
              │                   └────────────────────┘
              │
              │  (可多次前后台切换)
              └─────────────────────────────────────────
```

### 3.2 各场景生命周期流程

| 场景 | 生命周期回调序列 | 说明 |
|------|-----------------|------|
| **冷启动** | `onCreate()` -> `onWindowStageCreate()` -> `onForeground()` | 进程不存在时首次启动 |
| **热启动** | `onNewWant()` -> `onForeground()` | 进程已存在，Ability 从后台切回前台 |
| **Home 键** | `onBackground()` | 按 Home 键将应用切到后台 |
| **退出** | `onBackground()` -> `onWindowStageWillDestroy()` -> `onWindowStageDestroy()` -> `onDestroy()` | 应用被销毁 |
| **切回** | `onForeground()` | 从其他应用/后台切回 |

```
冷启动: onCreate() → onWindowStageCreate() → onForeground() → Page: aboutToAppear() → Page: onPageShow()
Home键: UIAbility: onBackground() → Page: onPageHide()
热启动: onNewWant() → onForeground() → Page: onPageShow()
退出: onBackground() → onWindowStageWillDestroy() → onWindowStageDestroy() → onDestroy()
```

### 3.3 生命周期详细说明

**onCreate(want, param)**:
- 调用时机: UIAbility 实例首次创建时
- 参数: `want` 包含启动参数; `param.launchReason` 含启动原因
- 典型操作: 初始化数据、读取持久化配置
- 注意: 仅在冷启动时调用一次

**onWindowStageCreate(windowStage)**:
- 调用时机: WindowStage 创建完成时
- 典型操作: `windowStage.loadContent()` 加载页面、设置窗口属性
- 注意: 窗口属性在此设置（全屏、方向等）

**onForeground()**:
- 调用时机: Ability 进入前台（用户可见）时
- 典型操作: 恢复动画、注册广播、获取焦点

**onBackground()**:
- 调用时机: Ability 进入后台（用户不可见）时
- 典型操作: 释放资源、保存临时状态、取消广播注册
- 注意: 系统可能在后台终止进程，需在此保存重要数据

**onWindowStageWillDestroy()**:
- 调用时机: WindowStage 将要销毁时 (API 12+)
- 典型操作: 执行窗口销毁前的清理

**onWindowStageDestroy()**:
- 调用时机: WindowStage 销毁时
- 典型操作: 释放窗口相关资源

**onDestroy()**:
- 调用时机: UIAbility 实例销毁时
- 典型操作: 释放所有资源、保存持久化数据

**onNewWant(want, param)**:
- 调用时机: Ability 已存在但被重新启动时
- 典型操作: 处理新意图、更新页面数据

### 3.4 启动模式

| 启动模式 | 说明 | 配置方式 |
|---------|------|---------|
| **singleton** (默认) | 单实例，同一 Ability 只有一个实例 | `"launchType": "singleton"` |
| **standard** | 多实例，每次启动创建新实例 | `"launchType": "standard"` |
| **multiton** | 多实例，但相同标识的 Want 复用实例 | `"launchType": "multiton"` |
| **specified** | 由开发者决定是否复用实例 | 覆写 `onAcceptWant()` |

在 `module.json5` 中配置启动模式：

```json5
{
  abilities: [
    {
      name: "EntryAbility",
      // singleton | standard | multiton
      launchType: "singleton",
      // ...
    }
  ]
}
```

---

## 4. WindowStage 事件

WindowStage 是窗口管理器在应用侧的抽象，每个 UIAbility 绑定唯一的 WindowStage。

### 4.1 WindowStage 事件类型

| 事件 | 回调时机 | 说明 |
|------|---------|------|
| `onWindowStageCreate` | WindowStage 创建时 | 加载主页面、设置窗口属性 |
| `onWindowStageWillDestroy` | WindowStage 销毁前 (API 12+) | 执行窗口销毁前清理 |
| `onWindowStageDestroy` | WindowStage 销毁时 | 释放窗口资源 |
| `onWindowStageRestore` | WindowStage 恢复时 | 窗口状态恢复 |

### 4.2 窗口属性设置

```typescript
onWindowStageCreate(windowStage: window.WindowStage): void {
  // 1. 获取主窗口
  windowStage.getMainWindow().then(mainWindow => {
    // 设置窗口全屏
    mainWindow.setWindowLayoutFullScreen(true);

    // 设置窗口是否可调整大小
    mainWindow.setWindowResizable(true);

    // 获取窗口属性
    let properties = mainWindow.getWindowProperties();
    console.info('Window width: ' + properties.windowRect.width);
  });

  // 2. 订阅窗口可见性变化
  windowStage.on('windowStageVisible', (data) => {
    console.info('WindowStage visible: ' + data.visible);
  });

  // 3. 加载页面
  windowStage.loadContent('pages/Index', (err) => {
    if (err.code) {
      console.error('loadContent failed');
      return;
    }
  });
}
```

---

## 5. AbilityStage 组件容器

**AbilityStage** 是 HAP 模块级别的组件容器。每个 Entry/Feature 类型的 HAP 在运行时都有一个 AbilityStage 实例。同一模块内的多个 UIAbility 共享一个 AbilityStage。

### 5.1 AbilityStage 生命周期

```
onCreate() → onAcceptWant(want) → onConfigurationUpdated(config)
```

### 5.2 代码示例

```typescript
// MyAbilityStage.ts
import { AbilityStage, Want } from '@kit.AbilityKit';

export default class MyAbilityStage extends AbilityStage {
  onCreate(): void {
    // HAP 模块初始化时调用
    // 适合执行模块级的初始化操作
    console.info('AbilityStage onCreate');
  }

  onAcceptWant(want: Want): string {
    // 当 UIAbility 的 launchType 为 "specified" 时
    // 返回一个字符串标识，系统根据该标识决定是否复用实例
    console.info('AbilityStage onAcceptWant');
    // 根据 want 参数返回唯一 key
    return want.parameters?.key as string ?? '';
  }

  onConfigurationUpdated(config: Configuration): void {
    // 系统配置更新时回调（如语言、主题切换）
    console.info('AbilityStage onConfigurationUpdated');
  }
}
```

### 5.3 注册 AbilityStage

在 `module.json5` 中配置：

```json5
{
  module: {
    // srcEntry 指向 AbilityStage 实现文件
    srcEntry: "./ets/abilitystage/MyAbilityStage.ts",
    abilities: [
      // ...
    ]
  }
}
```

### 5.4 AbilityStage 的能力

| 能力 | 方法 | 说明 |
|------|------|------|
| 全局初始化 | `onCreate()` | 模块级初始化逻辑 |
| 指定模式分发 | `onAcceptWant()` | 为 specified 模式的 UIAbility 决定实例标识 |
| 配置更新通知 | `onConfigurationUpdated()` | 监听系统配置变更 |
| 上下文获取 | `this.context` | 获取 ApplicationContext |
| 环境回调 | `onMemoryLevel()`, `onTrimMemory()` | 内存管理回调 |

---

## 6. ExtensionAbility 概述

**ExtensionAbility** 是无界面的应用组件，用于提供后台服务能力。Stage 模型提供了多种预定义的 ExtensionAbility 类型。

### 6.1 ExtensionAbility 类型

| 类型 | 类名 | 用途 |
|------|------|------|
| **Service Widget** | `FormExtensionAbility` | 服务卡片/元服务卡片 |
| **Service** | `ServiceExtensionAbility` | 后台长时间运行的服务 |
| **Data Share** | `DataShareExtensionAbility` | 跨应用数据共享 |
| **Static Subscriber** | `StaticSubscriberExtensionAbility` | 静态事件订阅 |
| **Backup** | `BackupExtensionAbility` | 应用数据备份恢复 |
| **Window** | `WindowExtensionAbility` | 窗口扩展（多屏协同） |
| **Input Method** | `InputMethodExtensionAbility` | 输入法扩展 |
| **Accessibility** | `AccessibilityExtensionAbility` | 无障碍扩展 |
| **File Picker** | `FilePickerExtensionAbility` | 文件选择器 |
| **Push Service** | `PushServiceExtensionAbility` | 推送服务 |

### 6.2 ServiceExtensionAbility 示例

```typescript
import { ServiceExtensionAbility, Want } from '@kit.AbilityKit';

export default class MyServiceExtension extends ServiceExtensionAbility {
  onCreate(want: Want): void {
    console.info('ServiceExtension onCreate');
  }

  onRequest(want: Want, startId: number): void {
    // 接收到启动请求
    console.info('ServiceExtension onRequest, startId: ' + startId);
  }

  onConnect(want: Want): object {
    // 其他组件绑定到此 Service 时回调
    console.info('ServiceExtension onConnect');
    return new MyServiceStub();
  }

  onDisconnect(want: Want): void {
    console.info('ServiceExtension onDisconnect');
  }

  onDestroy(): void {
    console.info('ServiceExtension onDestroy');
  }
}
```

### 6.3 BackupExtensionAbility 实现

```typescript
import { BackupExtensionAbility, BundleVersion } from '@kit.CoreFileKit';

export default class MyBackupExtension extends BackupExtensionAbility {
  async onBackup(): Promise<void> {
    console.info('BackupExtension onBackup');
    // 自定义备份逻辑
  }

  async onRestore(bundleVersion: BundleVersion): Promise<void> {
    console.info('BackupExtension onRestore');
    // 自定义恢复逻辑
  }
}
```

---

## 7. 进程模型 (Stage)

### 7.1 进程分类

| 进程类型 | 优先级 | 说明 |
|---------|--------|------|
| **前台进程** | 最高 | 当前用户正在交互的进程 |
| **可见进程** | 高 | 用户可见但不在前台交互的进程 |
| **服务进程** | 中 | 通过 `startAbility()` 启动的服务 |
| **后台进程** | 低 | 进入后台的进程 |
| **空进程** | 最低 | 没有任何活跃组件的进程 |

### 7.2 Stage 模型进程架构

```
┌──────────────────────────────────────────────┐
│              Process A (App)                   │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐ │
│  │ UIAbility│  │ UIAbility│  │ Service     │ │
│  │ (Main)   │  │ (Second) │  │ Extension   │ │
│  └──────────┘  └──────────┘  └─────────────┘ │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│              Process B (App)                   │
│  ┌──────────┐  ┌──────────┐                   │
│  │ UIAbility│  │ Widget   │                   │
│  │          │  │ Extension│                   │
│  └──────────┘  └──────────┘                   │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│          System Service Process                │
│  ┌────────────┐ ┌────────────┐ ┌───────────┐  │
│  │ AccountSvc │ │ BundleMgr  │ │ AbilityMgr│  │
│  └────────────┘ └────────────┘ └───────────┘  │
└──────────────────────────────────────────────┘
```

### 7.3 进程保活策略

| 策略 | 适用场景 | 实现方式 |
|------|---------|---------|
| 前台 Service | 音乐播放、定位导航 | 使用 `ServiceExtensionAbility` 并显示通知 |
| 长时任务 | 文件下载、数据同步 | 使用 `TaskPool` 或长时任务 API |
| 短时任务 | 小数据量后台处理 | 使用 `WorkSchedulerExtensionAbility` |
| 定时任务 | 周期性同步 | 使用 `WorkSchedulerExtensionAbility` |

---

## 8. 线程模型

### 8.1 主线程 (UI 线程)

每个进程有一个主线程，负责：

- UI 渲染和更新
- 事件分发和处理
- Ability 生命周期管理
- 系统回调分发

**主线程限制**：
- 禁止执行耗时操作（超过 6ms 会触发卡顿检测）
- 禁止阻塞（超过 6s 会触发 ANR）

### 8.2 子线程方案

| 方案 | 适用场景 | 特点 |
|------|---------|------|
| **TaskPool** (推荐) | CPU 密集型任务、并发计算 | 自动管理线程池、支持优先级 |
| **Worker** | 长时后台任务 | 独立线程、消息机制通信 |
| **setInterval/定时器** | 延迟执行、周期性任务 | 基于主线程事件循环 |

### 8.3 TaskPool 示例

```typescript
import { taskpool } from '@kit.ArkTS';

// 定义计算函数
@Concurrent
function computePrimes(max: number): number[] {
  const primes: number[] = [];
  for (let i = 2; i <= max; i++) {
    let isPrime = true;
    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(i);
    }
  }
  return primes;
}

// 使用 TaskPool 执行耗时计算
async function runComputeTask(): Promise<void> {
  try {
    const task = new taskpool.Task(computePrimes, 100000);
    const result = await taskpool.execute(task);
    console.info('Primes count: ' + result.length);
  } catch (err) {
    console.error('TaskPool error: ' + JSON.stringify(err));
  }
}
```

### 8.4 Worker 示例

```typescript
// Main thread
import { Worker } from '@kit.ArkTS';

const workerInstance = new Worker('entry/ets/workers/MyWorker.ts');

workerInstance.postMessage({ type: 'process', data: 'hello' });

workerInstance.onmessage = (event) => {
  console.info('Received from worker: ' + event.data);
};

workerInstance.onerror = (err) => {
  console.error('Worker error: ' + err.message);
};

// Worker thread (entry/src/main/ets/workers/MyWorker.ts)
import { worker, ThreadWorkerGlobalScope } from '@kit.ArkTS';

const workerPort: ThreadWorkerGlobalScope = worker.workerPort;

workerPort.onmessage = (event) => {
  const { type, data } = event.data;
  if (type === 'process') {
    const result = data.toUpperCase();
    workerPort.postMessage({ type: 'result', data: result });
  }
};
```

### 8.5 线程模型总结

```
┌─────────────────────────────────────────────────────┐
│                   Process                            │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │              Main Thread (UI Thread)          │   │
│  │  ┌─────────┐ ┌──────────┐ ┌──────────────┐  │   │
│  │  │ UI      │ │ Ability  │ │ Event        │  │   │
│  │  │ Render  │ │ Lifecycle│ │ Dispatch     │  │   │
│  │  └─────────┘ └──────────┘ └──────────────┘  │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           TaskPool (Thread Pool)              │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐│   │
│  │  │Thread 1│ │Thread 2│ │Thread 3│ │...     ││   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘│   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │             Worker Thread(s)                  │   │
│  │  ┌──────────┐                                │   │
│  │  │ Worker 1 │  (独立线程, 消息通信)           │   │
│  │  └──────────┘                                │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 9. 应用状态管理最佳实践

### 9.1 AppStateManager 单例模式

使用单例模式集中管理应用级状态，在 UIAbility 生命周期中统一调度，避免状态散落在各处。

```typescript
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

### 9.2 在 EntryAbility 中使用

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

## 10. Context 使用指南

### 10.1 常用 Context 属性

| 属性 | 说明 | 用途 |
|------|------|------|
| `filesDir` | 应用文件目录 | 存储应用数据 |
| `cacheDir` | 缓存目录 | 临时文件、缓存 |
| `tempDir` | 临时目录 | 临时文件 |
| `resourceDir` | 资源目录 | 访问 rawfile |
| `databaseDir` | 数据库目录 | RDB 文件存储 |

### 10.2 获取 Context

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

---

## 11. 常见反模式

### 11.1 在 onCreate 中操作 UI

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

### 11.2 忘记在 onBackground 中释放资源

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

### 11.3 在 onForeground 中执行耗时操作

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

## 12. 快速参考

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

---

## 参考资料

- [应用模型](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/application-models-V5)
- [UIAbility 组件概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/uiability-overview-V5)
- [UIAbility 生命周期 (EN)](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/uiability-lifecycle-V5)
- [AbilityStage](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/abilitystage-V5)
- [Stage 模型开发概述 (EN)](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/stage-model-development-overview-V5)
- [进程模型 (Stage)](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/process-model-stage-V5)
- [线程模型 (EN)](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/thread-model-stage-V5)
- [BackupExtensionAbility 实现](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/backupextensionability-implementation-V5)
