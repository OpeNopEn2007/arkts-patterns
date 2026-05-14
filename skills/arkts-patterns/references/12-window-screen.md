# 12 - 窗口与屏幕 (Window & Screen)

> HarmonyOS NEXT (API 12) 窗口管理与屏幕适配完整指南

---

## 1. 窗口指南 (Stage 模型)

在 Stage 模型中，窗口管理是应用开发的核心部分。窗口承载了应用的 UI 内容，开发者可以通过窗口 API 控制窗口的创建、布局、属性和交互行为。

### 1.1 窗口类型

| 窗口类型 | 说明 | 使用场景 |
|----------|------|----------|
| **应用窗口 (App Window)** | 应用主窗口 | 大多数应用的主界面 |
| **子窗口 (Sub Window)** | 应用内的附加窗口 | 弹窗、悬浮窗、侧边栏 |
| **系统窗口 (System Window)** | 系统级窗口 | 状态栏、导航栏、Toast |
| **悬浮窗 (Floating Window)** | 浮于应用之上的窗口 | 画中画、悬浮球 |

### 1.2 窗口阶段

窗口生命周期包含以下阶段：

```
CREATE ──► SHOW ──► ACTIVE ──► INACTIVE ──► HIDDEN ──► DESTROY
  │                                              │
  └──────────────────────────────────────────────┘
          (可重新进入 SHOW 阶段)
```

### 1.3 获取窗口实例

```typescript
import { window } from '@kit.ArkUI';
import { UIAbility } from '@kit.AbilityKit';

class EntryAbility extends UIAbility {
  onWindowStageCreate(windowStage: window.WindowStage): void {
    // 获取主窗口
    const mainWindow = windowStage.getMainWindowSync();

    // 设置窗口属性
    mainWindow.setWindowLayoutFullScreen(true);

    // 加载页面内容
    windowStage.loadContent('pages/Index', (err) => {
      if (err) {
        console.error(`Failed to load content: ${err.code}`);
        return;
      }
      console.log('Content loaded successfully');
    });
  }
}

// 通过 context 获取窗口
async function getWindowFromContext(): Promise<void> {
  const context = getContext();
  const windowClass = await window.getLastWindow(context);
  console.log('Got window:', windowClass);
}
```

> **官方文档：** [窗口指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-window-stage-V5)

---

## 2. 沉浸式效果

沉浸式效果让应用内容可以延伸到状态栏和导航栏区域，提供更大的显示面积和更好的视觉体验。

### 2.1 启用沉浸式

```typescript
import { window } from '@kit.ArkUI';

async function enableImmersiveMode(): Promise<void> {
  const context = getContext();
  const windowClass = await window.getLastWindow(context);

  // 1. 设置全屏布局（内容延伸到状态栏和导航栏区域）
  windowClass.setWindowLayoutFullScreen(true);

  // 2. 设置状态栏和导航栏的可见性
  // 隐藏状态栏和导航栏（完全沉浸）
  // 窗口标志位：
  //   WINDOW_FLAG_NEED_AVOID: 自动避让（默认）
  //   WINDOW_FLAG_SHOW_WHEN_LOCKED: 锁屏时显示
  const flags = windowClass.getWindowProperties().flags;
  // 自定义导航栏/状态栏样式（保留功能但内容穿透）
  windowClass.setWindowSystemBarEnable(['navigationBar', 'statusBar']);
}

// 设置系统栏（状态栏、导航栏）的样式
async function setSystemBarStyle(): Promise<void> {
  const context = getContext();
  const windowClass = await window.getLastWindow(context);

  // 1. 设置状态栏属性
  await windowClass.setWindowSystemBarProperties({
    statusBarColor: '#00000000',           // 透明背景
    statusBarContentColor: '#FF000000',     // 黑色内容
    navigationBarColor: '#00000000',        // 透明导航栏
    navigationBarContentColor: '#FF000000', // 黑色导航按钮
  });

  // 2. 窗口全屏布局（内容延伸到系统栏区域）
  await windowClass.setWindowLayoutFullScreen(true);
}
```

### 2.2 避让区域处理

当启用沉浸式后，需要处理系统栏（状态栏、导航栏、挖孔屏）等避让区域。

```typescript
import { window } from '@kit.ArkUI';
import { componentUtils } from '@kit.ArkUI';

@Entry
@Component
struct ImmersivePage {
  @State topAvoidHeight: number = 0;
  @State bottomAvoidHeight: number = 0;

  aboutToAppear(): void {
    this.registerWindowCallback();
  }

  registerWindowCallback(): void {
    const context = getContext();
    window.getLastWindow(context).then((windowClass) => {
      // 监听窗口避让区域变化
      windowClass.on('avoidAreaChange', (data) => {
        const { type, area } = data;
        if (type === window.AvoidAreaType.TYPE_SYSTEM) {
          this.topAvoidHeight = area.topRect.height;
          this.bottomAvoidHeight = area.bottomRect.height;
        } else if (type === window.AvoidAreaType.TYPE_CUTOUT) {
          // 挖孔屏避让区域
          console.log('Cutout area:', JSON.stringify(area));
        }
      });
    });
  }

  build() {
    Column() {
      // 实际内容区域
      Column() {
        Text('沉浸式内容区域')
          .fontSize(24)
          .fontColor(Color.White);
      }
      .width('100%')
      .height('100%')

      // 安全区占位（顶部）
      .padding({ top: this.topAvoidHeight })
      // 安全区占位（底部）
      .padding({ bottom: this.bottomAvoidHeight })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.Blue)
  }
}
```

### 2.3 窗口静默模式

```typescript
// 设置窗口静默模式（不接收触摸事件）
async function setMuteMode(mute: boolean): Promise<void> {
  const context = getContext();
  const windowClass = await window.getLastWindow(context);
  await windowClass.setWindowTouchable(!mute);
}
```

> **官方文档：** [沉浸式效果](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-develop-apply-immersive-effects-V5)

---

## 3. 窗口 API 参考

### 3.1 核心 API

```typescript
import { window } from '@kit.ArkUI';

// 获取窗口
const context = getContext();
const windowClass = await window.getLastWindow(context);

// 窗口属性
interface WindowProperties {
  windowRect: {        // 窗口位置和大小
    left: number;
    top: number;
    width: number;
    height: number;
  };
  type: window.WindowType;        // 窗口类型
  isLayoutFullScreen: boolean;    // 是否全屏布局
  isKeepScreenOn: boolean;        // 是否常亮
  brightness: number;             // 亮度 (0-1)
  flags: number;                  // 窗口标志位
}

// 常用 API
interface WindowClass {
  // 窗口属性
  setWindowLayoutFullScreen(isFullScreen: boolean): Promise<void>;
  setWindowSystemBarEnable(names: string[]): Promise<void>;
  setWindowSystemBarProperties(properties: SystemBarProperties): Promise<void>;
  setWindowKeepScreenOn(isKeepOn: boolean): Promise<void>;
  setWindowBrightness(brightness: number): Promise<void>;
  setWindowTouchable(isTouchable: boolean): Promise<void>;

  // 窗口大小和位置
  moveWindowTo(x: number, y: number): Promise<void>;
  resize(width: number, height: number): Promise<void>;
  setWindowRect(left: number, top: number, width: number, height: number): Promise<void>;

  // 窗口可见性
  showWindow(): Promise<void>;
  hideWindow(): Promise<void>;
  destroyWindow(): Promise<void>;

  // 窗口属性获取
  getWindowProperties(): WindowProperties;
  getWindowAvoidArea(type: AvoidAreaType): AvoidArea;

  // 事件监听
  on(type: 'windowSizeChange', callback: (data: { width: number; height: number }) => void): void;
  on(type: 'avoidAreaChange', callback: (data: { type: AvoidAreaType; area: AvoidArea }) => void): void;
  on(type: 'touchableChange', callback: (data: boolean) => void): void;
  off(type: string, callback?: Function): void;

  // 子窗口
  createSubWindow(name: string): Promise<Window>;
  bindDialogContent(controller: dialogController): Promise<void>;
}
```

### 3.2 窗口事件监听

```typescript
// 窗口大小变化
windowClass.on('windowSizeChange', (data: { width: number; height: number }) => {
  console.log(`Window resized to ${data.width}x${data.height}`);
});

// 窗口避让区域变化
windowClass.on('avoidAreaChange', (data) => {
  console.log('Avoid area changed:', data.type);
});

// 窗口可触摸状态变化
windowClass.on('touchableChange', (data: boolean) => {
  console.log('Window touchable:', data);
});

// 窗口事件取消监听
windowClass.off('windowSizeChange');
```

### 3.3 子窗口管理

```typescript
// 创建子窗口（悬浮窗、弹窗等）
async function createSubWindow(): Promise<void> {
  const context = getContext();
  const mainWindow = await window.getLastWindow(context);

  // 创建子窗口
  const subWindow = await mainWindow.createSubWindow('mySubWindow');

  // 设置窗口属性
  await subWindow.setWindowRect(100, 100, 400, 300);
  await subWindow.setWindowLayoutFullScreen(false);
  await subWindow.setWindowKeepScreenOn(false);

  // 绑定内容
  await subWindow.bindDialogContent('pages/SubWindowContent');

  // 显示子窗口
  await subWindow.showWindow();

  // 销毁子窗口
  // await subWindow.destroyWindow();
}

// 获取所有子窗口
async function listSubWindows(): Promise<void> {
  const context = getContext();
  const mainWindow = await window.getLastWindow(context);
  const subWindows = await mainWindow.getSubWindow();
  subWindows.forEach((win, index) => {
    console.log(`Sub window ${index}: ${win.getWindowProperties()}`);
  });
}
```

> **官方文档：** [窗口 API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/js-apis-window-V5)

---

## 4. 模块配置文件中的窗口设置

窗口相关的配置主要在 `module.json5` 中设置。

### 4.1 module.json5 窗口配置

```json5
{
  module: {
    // ...
    abilities: [
      {
        name: "EntryAbility",
        srcEntry: "./ets/entryability/EntryAbility.ets",
        // 窗口相关配置
        window: {
          // 是否支持多窗口
          "supportMultiWindow": true,
          // 窗口设计宽高（参考尺寸，用于布局适配）
          "designWidth": 720,
          "designHeight": 1280,
          // 是否启用沉浸式
          "isLayoutFullScreen": false,
          // 是否保持屏幕常亮
          "keepScreenOn": false,
          // 窗口背景色
          "windowBackgroundColor": "#FFFFFF",
        },
        // 页面的 meta 信息
        metaData: {
          customizeData: [
            {
              name: "hwc-theme",
              value: "android:hwtTheme.EMUI_LIGHT"
            },
            {
              name: "WindowLayoutType",
              value: "OVERLAY"
            }
          ]
        }
      }
    ]
  }
}
```

### 4.2 窗口设计宽度适配

```typescript
// 根据 module.json5 中的 designWidth 进行自适应布局
@Entry
@Component
struct AdaptiveLayout {
  @State currentScale: number = 1.0;

  aboutToAppear(): void {
    // 获取显示密度
    const displayInfo = window.getLastWindow(getContext())
      .then((win) => {
        const properties = win.getWindowProperties();
        const designWidth = 720; // 与 module.json5 配置一致
        const scale = properties.windowRect.width / designWidth;
        this.currentScale = scale;
      });
  }

  build() {
    Column() {
      // 使用 scale 进行自适应
      Text('自适应布局内容')
        .fontSize(Math.floor(16 * this.currentScale))
    }
    .width('100%')
    .height('100%')
  }
}
```

> **官方文档：** [模块配置文件](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/module-configuration-file-V5)

---

## 5. 多窗口适配

多窗口适配确保应用在不同窗口大小和形态下都能提供良好的用户体验。

### 5.1 多窗口形态

| 形态 | 说明 | 适配要点 |
|------|------|----------|
| 全屏 (Fullscreen) | 应用占据整个屏幕 | 默认行为 |
| 分屏 (Split Screen) | 两个应用并列显示 | 响应式布局 |
| 悬浮窗 (Floating) | 窗口可拖动和缩放 | 最小尺寸限制 |
| 自由形态 (Freeform) | 窗口任意调整大小 | 弹性布局 |

### 5.2 响应式窗口适配

```typescript
@Entry
@Component
struct ResponsiveLayout {
  @StorageLink('windowWidth') windowWidth: number = 720;
  @StorageLink('windowHeight') windowHeight: number = 1280;

  // 根据宽度判断布局模式
  get layoutMode(): 'phone' | 'tablet' | 'desktop' {
    if (this.windowWidth <= 520) return 'phone';
    if (this.windowWidth <= 840) return 'tablet';
    return 'desktop';
  }

  aboutToAppear(): void {
    // 注册窗口大小变化监听
    window.getLastWindow(getContext()).then((win) => {
      win.on('windowSizeChange', (data) => {
        this.windowWidth = data.width;
        this.windowHeight = data.height;
      });
    });
  }

  build() {
    Column() {
      if (this.layoutMode === 'phone') {
        // 手机布局：单列
        this.phoneLayout();
      } else {
        // 平板/桌面布局：多列
        this.tabletLayout();
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  phoneLayout() {
    List() {
      ForEach(this.menuItems, (item: string) => {
        ListItem() {
          Text(item).padding(12)
        }
      })
    }
    .width('100%')

    // 详情区域
    Stack() { /* ... */ }
      .width('100%')
  }

  @Builder
  tabletLayout() {
    Row() {
      // 左侧导航
      Column() {
        ForEach(this.menuItems, (item: string) => {
          Text(item).padding(16)
        })
      }
      .width('30%')
      .height('100%')

      // 右侧详情
      Column() {
        // 内容区域
      }
      .width('70%')
      .height('100%')
    }
    .width('100%')
    .height('100%')
  }

  menuItems: string[] = ['首页', '发现', '消息', '我的'];
}
```

### 5.3 窗口状态管理

```typescript
// 多窗口状态变化监听
async function monitorMultiWindowState(): Promise<void> {
  const context = getContext();
  const windowClass = await window.getLastWindow(context);

  // 窗口焦点变化
  windowClass.on('windowEvent', (eventType: window.WindowEventType) => {
    switch (eventType) {
      case window.WindowEventType.WINDOW_EVENT_SHOWN:
        console.log('Window shown');
        break;
      case window.WindowEventType.WINDOW_EVENT_HIDDEN:
        console.log('Window hidden');
        break;
      case window.WindowEventType.WINDOW_EVENT_ACTIVE:
        console.log('Window active');
        break;
      case window.WindowEventType.WINDOW_EVENT_INACTIVE:
        console.log('Window inactive');
        break;
      case window.WindowEventType.WINDOW_EVENT_DESTROY:
        console.log('Window destroyed');
        break;
    }
  });
}
```

### 5.4 最小窗口尺寸

```typescript
// 设置窗口的最小尺寸（自由形态窗口）
async function setMinWindowSize(): Promise<void> {
  const context = getContext();
  const windowClass = await window.getLastWindow(context);

  // 设置最小窗口尺寸
  await windowClass.setWindowMinimumSize(320, 480); // 宽度 320vp，高度 480vp
}
```

### 5.5 适配检查清单

| 检查项 | 说明 | 验证方式 |
|--------|------|----------|
| 布局弹性 | 使用百分比和 flex 布局而非固定尺寸 | 调整窗口大小验证 |
| 内容重排 | 窄屏时内容纵向排列 | 切换分屏模式验证 |
| 触摸区域 | 按钮和交互元素大小满足规范 | 多尺寸设备验证 |
| 字体缩放 | 字体跟随系统设置缩放 | 切换字体大小验证 |
| 键盘避让 | 输入框在键盘弹出时可见 | 键盘弹出验证 |
| 横竖屏切换 | 内容自适应横竖屏 | 旋转设备验证 |

---

## 6. 窗口开发最佳实践

### 6.1 性能优化

- 避免频繁调用 `setWindowRect()`、`resize()` 等操作
- `windowSizeChange` 监听中不执行高耗时操作
- 使用 `windowClass.off()` 及时取消不再需要的监听

### 6.2 用户体验

- 沉浸式模式下清晰标识避让区域
- 多窗口模式提供合理的默认窗口尺寸
- 窗口失去焦点时暂停动画和视频播放
- 避免窗口尺寸过小导致交互困难

### 6.3 常见问题

| 问题 | 可能原因 | 解决方案 |
|------|----------|----------|
| 内容被状态栏遮挡 | 未处理避让区域 | 监听 `avoidAreaChange` |
| 多窗口布局异常 | 未实现响应式布局 | 使用弹性/栅格布局 |
| 窗口无法缩放 | 未设置最小/最大尺寸 | 设置 `setWindowMinimumSize` |
| 沉浸式后内容不可见 | 未正确处理安全区 | `padding` 避让区域 |

---

## 参考链接

- [窗口指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-window-stage-V5)
- [沉浸式效果](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-develop-apply-immersive-effects-V5)
- [模块配置文件](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/module-configuration-file-V5)
- [窗口 API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/js-apis-window-V5)
