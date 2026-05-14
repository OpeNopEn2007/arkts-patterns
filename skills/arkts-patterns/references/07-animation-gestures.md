# 动画与手势

> HarmonyOS NEXT (API 12) 动画与手势参考文档

---

## 目录

- [属性动画 (.animation() modifier)](#属性动画-animation-modifier)
- [显式动画 (animateTo())](#显式动画-animateto)
- [转场动画（组件进入/退出）](#转场动画组件进入退出)
- [手势类型](#手势类型)
- [手势绑定方式](#手势绑定方式)
- [触摸事件处理](#触摸事件处理)
- [hitTestBehavior](#hittestbehavior)
- [常见反模式](#常见反模式)
- [手势冲突处理进阶](#手势冲突处理进阶)
- [手势组合模式](#手势组合模式)
- [性能优化建议](#性能优化建议)

---

## 属性动画 (.animation() modifier)

属性动画通过 `.animation()` 修饰器为组件的属性变化添加平滑过渡效果。

### 基础用法

```typescript
@Component
struct AnimationDemo {
  @State private width: number = 200;
  @State private height: number = 200;
  @State private rotateAngle: number = 0;

  build() {
    Column() {
      Rect()
        .width(this.width)
        .height(this.height)
        .fill('#007AFF')
        .borderRadius(16)
        .rotate({ angle: this.rotateAngle })
        .animation({
          duration: 500,
          curve: Curve.EaseInOut,
          delay: 0,
          iterations: 1,
          playMode: PlayMode.Normal
        })

      Button('展开')
        .onClick(() => {
          this.width = 300;
          this.height = 300;
        })

      Button('旋转')
        .onClick(() => {
          this.rotateAngle = 180;
        })
    }
  }
}
```

### animation() 参数说明

```typescript
.animation({
  duration: number,        // 动画时长（毫秒）
  curve: Curve | string,   // 动画曲线
  delay: number,           // 延迟（毫秒）
  iterations: number,      // 播放次数（-1 为无限循环）
  playMode: PlayMode,      // 播放模式（Normal / Reverse / Alternate / AlternateReverse）
  onFinish?: () => void    // 动画结束回调
})
```

### 常用动画曲线

```typescript
// 系统内置曲线
Curve.Linear         // 线性
Curve.Ease           // 慢-快-慢（默认）
Curve.EaseIn         // 慢-快
Curve.EaseOut        // 快-慢
Curve.EaseInOut      // 慢-快-慢（更平滑）
Curve.FastOutSlowIn  // 快速进入，缓慢退出
Curve.LinearOutSlowIn // 线性进入，缓慢退出
Curve.FastOutLinearIn // 快速进入，线性退出
Curve.Spring         // 弹簧效果
```

### 多属性动画

多个属性变化会合并为一个动画：

```typescript
Rect()
  .width(this.size)
  .height(this.size)
  .rotate({ angle: this.angle })
  .backgroundColor(this.color)
  .borderRadius(this.radius)
  .animation({ duration: 300, curve: Curve.EaseOut })
```

### 为不同属性设置不同动画

```typescript
Rect()
  .width(this.size)
  .animation({ duration: 300, curve: Curve.EaseOut })  // 宽高动画
  .rotate({ angle: this.angle })
  .animation({ duration: 500, curve: Curve.Spring })    // 旋转动画
  .backgroundColor(this.color)
  .animation({ duration: 200 })                          // 颜色动画
```

### 禁用动画

```typescript
Rect()
  .width(this.size)
  .animation(null) // 取消该属性的动画效果
```

---

## 显式动画 (animateTo())

显式动画通过 `animateTo()` 函数将状态变化包裹在闭包内执行。

### 基础用法

```typescript
import { animateTo } from '@kit.ArkUI';

@Component
struct ExplicitAnimationDemo {
  @State private scale: number = 1;
  @State private opacity: number = 1;
  @State private x: number = 0;

  build() {
    Column() {
      Rect()
        .width(100)
        .height(100)
        .fill('#FF6B00')
        .borderRadius(16)
        .scale({ x: this.scale, y: this.scale })
        .opacity(this.opacity)
        .offset({ x: this.x })
        .margin({ bottom: 32 })

      Button('缩放动画')
        .onClick(() => {
          animateTo({
            duration: 300,
            curve: Curve.Spring,
            onFinish: () => {
              console.log('动画完成');
            }
          }, () => {
            this.scale = this.scale === 1 ? 1.5 : 1;
          })
        })
    }
  }
}
```

### animateTo() 参数

```typescript
animateTo(
  param: AnimateParam,      // 动画参数
  event: () => void,        // 状态变更闭包
  listener?: () => void     // 动画完成回调（可选）
)

interface AnimateParam {
  duration: number;          // 动画时长（毫秒）
  curve: Curve | string;     // 动画曲线
  delay?: number;            // 延迟（毫秒）
  playMode?: PlayMode;       // 播放模式
  tempo?: number;            // 播放速度（1.0 为正常）
  onFinish?: () => void;     // 动画结束回调
}
```

### 链式动画

```typescript
async function chainAnimation(self: ExplicitAnimationDemo) {
  // 第一步：放大
  await new Promise<void>((resolve) => {
    animateTo({ duration: 300, curve: Curve.EaseOut, onFinish: resolve }, () => {
      self.scale = 1.5;
    });
  });

  // 第二步：旋转（第一步完成后执行）
  await new Promise<void>((resolve) => {
    animateTo({ duration: 200, curve: Curve.Spring, onFinish: resolve }, () => {
      self.scale = 1;
      self.x = 100;
    });
  });
}
```

### 属性动画 vs 显式动画

| 对比项 | 属性动画 (.animation()) | 显式动画 (animateTo()) |
|--------|------------------------|----------------------|
| 声明方式 | 修饰器 | 函数调用 |
| 触发方式 | 自动跟随状态变化 | 手动调用 |
| 控制粒度 | 针对特定属性 | 针对状态变更块 |
| 多属性同步 | 各属性独立设置 | 统一控制 |
| 链式/序列 | 较难实现 | 结合 Promise 实现 |

---

## 转场动画（组件进入/退出）

转场动画控制组件在页面进入和退出时的动画效果。

### 组件转场

```typescript
@Component
struct TransitionDemo {
  @State private show: boolean = false;

  build() {
    Column() {
      Button('切换')
        .onClick(() => {
          this.show = !this.show;
        })

      if (this.show) {
        Text('Hello')
          .fontSize(24)
          .padding(20)
          .backgroundColor('#007AFF')
          .fontColor('#FFF')
          .borderRadius(12)
          .transition({
            type: TransitionType.Insert,  // 进入动画
            scale: { x: 0, y: 0 },
            opacity: 0
          })
          .transition({
            type: TransitionType.Delete,  // 退出动画
            translate: { x: 200, y: 0 },
            opacity: 0
          })
      }
    }
  }
}
```

### TransitionType

```typescript
TransitionType.Insert  // 组件插入时动画
TransitionType.Delete  // 组件移除时动画
TransitionType.All     // 同时生效
TransitionType.Push    // Navigation push 动画
TransitionType.Pop     // Navigation pop 动画
```

### TransitionEffect

```typescript
// 使用 TransitionEffect 简写
import { TransitionEffect } from '@kit.ArkUI';

Text('内容')
  .transition(TransitionEffect.OPACITY)  // 透明过渡
  .transition(TransitionEffect.SLIDE)    // 滑入滑出
  .transition(TransitionEffect.SCALE)    // 缩放过渡
  .transition(TransitionEffect.translate({ x: 100, y: 0 }).combine(
    TransitionEffect.opacity(0)
  ))
```

### 页面转场（Navigation）

```typescript
Navigation(this.navPathStack) { ... }
  .navDestination(this.PagesMap)

@Builder
PagesMap(name: string, param?: Object) {
  if (name === 'Detail') {
    DetailPage()
      .transition(TransitionEffect.create(
        TransitionType.Push,
        { duration: 300, curve: Curve.EaseInOut }
      ).translate({ x: '100%', y: 0 }))
  }
}
```

---

## 手势类型

HarmonyOS NEXT 支持多种手势类型，用于实现丰富的交互。

### TapGesture - 点击

```typescript
// 单击
TapGesture({ count: 1 })
  .onAction((event: GestureEvent) => {
    console.log('单击', event.fingerList.length);
  })

// 双击
TapGesture({ count: 2 })
  .onAction(() => {
    console.log('双击');
  })
```

| GestureEvent 属性 | 类型 | 说明 |
|------------------|------|------|
| fingerList | FingerInfo[] | 触手指信息 |
| timestamp | number | 事件时间戳 |
| source | SourceType | 事件来源 |
| repeat | boolean | 是否重复点击 |

### LongPressGesture - 长按

```typescript
LongPressGesture({
  fingers: 1,          // 触手指数
  repeat: false,       // 是否重复触发
  duration: 500        // 长按触发时长（毫秒）
})
  .onAction((event: GestureEvent) => {
    console.log('长按触发');
  })
  .onActionEnd(() => {
    console.log('长按结束');
    // 弹出菜单等操作
  })
```

### PanGesture - 拖拽

```typescript
PanGesture({
  fingers: 1,           // 触手指数
  direction: PanDirection.All,  // 拖拽方向
  distance: 5           // 最小滑动距离（触发阈值）
})
  .onActionStart(() => {
    console.log('开始拖拽');
  })
  .onActionUpdate((event: GestureEvent) => {
    // 实时获取偏移量
    this.offsetX += event.offsetX;
    this.offsetY += event.offsetY;
  })
  .onActionEnd(() => {
    console.log('拖拽结束');
  })
  .onActionCancel(() => {
    console.log('拖拽取消');
  })
```

| PanDirection | 说明 |
|-------------|------|
| All | 所有方向 |
| Horizontal | 仅水平 |
| Vertical | 仅垂直 |
| None | 无方向 |
| Left | 向左 |
| Right | 向右 |
| Up | 向上 |
| Down | 向下 |

### PinchGesture - 缩放

```typescript
@State private scale: number = 1;

PinchGesture({ fingers: 2 })
  .onActionStart((event: GestureEvent) => {
    this.scale = 1;
  })
  .onActionUpdate((event: GestureEvent) => {
    this.scale = event.scale; // 缩放比例
  })
  .onActionEnd(() => {
    console.log('缩放结束, scale:', this.scale);
  })
```

### RotationGesture - 旋转

```typescript
@State private rotation: number = 0;

RotationGesture({ fingers: 2 })
  .onActionUpdate((event: GestureEvent) => {
    this.rotation = event.angle; // 旋转角度
  })
  .onActionEnd(() => {
    console.log('旋转结束, angle:', this.rotation);
  })
```

### SwipeGesture - 滑动

```typescript
SwipeGesture({
  fingers: 1,
  direction: SwipeDirection.Horizontal,  // 滑动方向
  speed: 100    // 最小滑动速度 (vp/s)
})
  .onAction((event: GestureEvent) => {
    const velocity = event.velocity; // 滑动速度
    const direction = event.direction; // 滑动方向
    if (velocity > 500) {
      console.log('快速滑动');
    }
  })
```

---

## 手势绑定方式

### .gesture() - 常规绑定

绑定手势事件，与组件默认事件并行处理：

```typescript
Column() {
  Text('手势绑定')
}
.gesture(
  TapGesture().onAction(() => {
    console.log('通过 gesture 绑定的点击');
  })
)
```

### .priorityGesture() - 优先手势

覆盖组件默认事件，优先级高于组件自带手势：

```typescript
Button('优先手势')
  .priorityGesture(
    TapGesture().onAction(() => {
      console.log('优先手势，覆盖 Button 默认点击');
    })
  )
// 此按钮的默认点击不会触发
```

### .parallelGesture() - 并行手势

允许多个手势同时触发，互不干扰：

```typescript
Column() {
  Text('并行手势区域')
}
.gesture(
  TapGesture().onAction(() => {
    console.log('单击');
  })
)
.parallelGesture(
  TapGesture({ count: 2 }).onAction(() => {
    console.log('双击（与单击并行）');
  })
)
```

### 手势冲突处理规则

```
优先级: priorityGesture > 组件默认手势 > gesture > parallelGesture

- priorityGesture: 完全覆盖组件默认手势
- gesture: 与组件默认手势并存，组件默认手势优先
- parallelGesture: 与所有手势并行触发
```

### 组合手势

```typescript
Column() {
  Image($r('app.media.photo'))
    .width(200)
    .height(200)
}
.gesture(
  GestureGroup(GestureMode.Exclusive,
    TapGesture({ count: 1 }),
    TapGesture({ count: 2 }),
    LongPressGesture()
  )
  .onAction((event: GestureEvent) => {
    // 互斥触发：只会触发其中一个
  })
)
```

| GestureMode | 说明 |
|-------------|------|
| Sequence | 顺序识别，依次触发 |
| Simultaneous | 同时识别，同时触发 |
| Exclusive | 互斥识别，仅触发一个 |

---

## 触摸事件处理

触摸事件提供更原始的事件处理能力，可以获取详细的触摸点信息。

### onTouch 事件

```typescript
@Component
struct TouchDemo {
  build() {
    Column() {
      Text('触摸区域')
        .width(200)
        .height(200)
        .backgroundColor('#007AFF')
        .onTouch((event: TouchEvent) => {
          switch (event.type) {
            case TouchType.Down:
              console.log('手指按下');
              break;
            case TouchType.Move:
              console.log(`移动: x=${event.x}, y=${event.y}`);
              break;
            case TouchType.Up:
              console.log('手指抬起');
              break;
            case TouchType.Cancel:
              console.log('触摸取消');
              break;
          }
        })
    }
  }
}
```

### TouchEvent 属性

| 属性 | 类型 | 说明 |
|------|------|------|
| type | TouchType | 触摸事件类型 |
| x | number | 触摸点 x 坐标 |
| y | number | 触摸点 y 坐标 |
| id | number | 触摸点 ID |
| screenX | number | 屏幕 x 坐标 |
| screenY | number | 屏幕 y 坐标 |
| timestamp | number | 事件时间戳 |
| source | SourceType | 事件来源 |
| touches | TouchObject[] | 所有触摸点信息 |
| changedTouches | TouchObject[] | 变化的触摸点 |

### 多点触摸

```typescript
.onTouch((event: TouchEvent) => {
  if (event.touches.length >= 2) {
    // 多点触摸
    const touch1 = event.touches[0];
    const touch2 = event.touches[1];
    const distance = Math.sqrt(
      Math.pow(touch2.x - touch1.x, 2) +
      Math.pow(touch2.y - touch1.y, 2)
    );
    console.log('两指距离:', distance);
  }
})
```

---

## hitTestBehavior

**hitTestBehavior** 控制组件对触摸事件的响应方式，决定组件是否"透传"触摸事件。

### 属性值

```typescript
enum HitTestMode {
  Default,       // 默认：自身响应，不阻断传递给子组件
  None,          // 不响应事件，不阻断传递
  Block,         // 响应事件，阻断传递
  Transparent,   // 不响应事件，但阻断传递
  Self           // 自身和子组件响应，阻断事件传递
}
```

### 用法示例

```typescript
// 点击遮罩层，让下层组件响应
Stack() {
  // 下层内容
  Column() {
    Text('可点击内容')
      .onClick(() => { console.log('内容被点击'); })
  }

  // 遮罩层
  Column()
    .width('100%')
    .height('100%')
    .backgroundColor('#66000000')
    .hitTestBehavior(HitTestMode.Transparent) // 穿透点击到下层
}
```

### 常用场景

```typescript
// 场景1: 悬浮按钮不遮挡下层点击
Button('悬浮')
  .position({ x: 0, y: 0 })
  .hitTestBehavior(HitTestMode.None) // 不阻断事件传递
  .onClick(() => { console.log('悬浮按钮点击'); })

// 场景2: 背景透明的容器拦截事件
Row()
  .width('100%')
  .height('100%')
  .hitTestBehavior(HitTestMode.Block) // 拦截所有触摸事件
  .onTouch(() => {}) // 空的触摸处理器

// 场景3: 列表项中的按钮，阻止列表滑动
Button('阻止滑动')
  .hitTestBehavior(HitTestMode.Block) // 阻断触摸，阻止列表滚动
  .onTouch((event: TouchEvent) => {
    // 处理触摸
  })

// 场景4: 使用 onTouch 完全自定义手势
Column()
  .hitTestBehavior(HitTestMode.Block) // 阻断系统手势
  .onTouch((event: TouchEvent) => {
    // 完全自定义的手势处理
  })
```

---

## 常见反模式

### 反模式 1: 不要在 aboutToAppear 中启动动画

```typescript
// 错误: aboutToAppear 中启动动画
@Component
struct BadPractice {
  @State private isVisible: boolean = false;

  aboutToAppear(): void {
    animateTo({ duration: 300 }, () => {
      this.isVisible = true; // 组件尚未挂载，动画不会生效
    });
  }
}

// 正确: 使用 onAppear 或者 onPageShow
@Component
struct GoodPractice {
  @State private isVisible: boolean = false;

  onAppear(): void {
    animateTo({ duration: 300 }, () => {
      this.isVisible = true;
    });
  }
}
```

### 反模式 2: 频繁创建 animateTo 导致性能问题

```typescript
// 错误: 每一帧都调用 animateTo
.onTouch((event: TouchEvent) => {
  animateTo({ duration: 0 }, () => {
    this.x = event.x; // 大量动画对象创建，性能低下
  });
})

// 正确: 使用状态更新，配合 .animation() 修饰器
// 或者直接赋值不需要 animateTo
.onTouch((event: TouchEvent) => {
  this.x = event.x; // 属性动画会自动过渡
})
```

### 反模式 3: animation() 参数频繁变化

```typescript
// 错误: 每次状态变更都改变 animation 参数
Rect()
  .animation({
    duration: Math.random() * 1000, // 随机变化，导致动画参数重建
  })

// 正确: 固定动画参数
Rect()
  .animation({
    duration: 300,
    curve: Curve.EaseInOut
  })
```

### 反模式 4: 手势与滚动容器冲突

```typescript
// 错误: PanGesture 和 List 水平滑动冲突
List({ space: 8 }) {
  ForEach(items, (item: string) => {
    ListItem() {
      Text(item)
        .gesture(
          PanGesture({ direction: PanDirection.Horizontal }) // 与 List 滚动冲突
        )
    }
  })
}

// 正确: 明确手势方向，或使用 exclusive 组合
ListItem() {
  Text(item)
    .gesture(
      PanGesture({ direction: PanDirection.Vertical }) // 与水平滚动不冲突
    )
}
```

### 反模式 5: 忽略动画结束时资源清理

```typescript
// 错误: 页面销毁时动画仍在执行
@Component
struct BadAnimation {
  @State private scale: number = 1;

  aboutToDisappear(): void {
    // 动画还在运行中...
  }

  build() {
    Rect()
      .scale({ x: this.scale, y: this.scale })
      .animation({
        iterations: -1, // 无限循环
        duration: 1000,
        curve: Curve.Spring
      })

    Button('开始动画')
      .onClick(() => {
        this.scale = 1.5;
      })
  }
}

// 正确: 页面销毁前停止动画
@Component
struct GoodAnimation {
  @State private scale: number = 1;
  @State private isActive: boolean = false;

  onDisappear(): void {
    this.isActive = false;
    this.scale = 1;
  }

  build() {
    Rect()
      .scale({ x: this.scale, y: this.scale })
      .animation(this.isActive ? {
        iterations: -1,
        duration: 1000,
        curve: Curve.Spring
      } : null)

    Button('开始动画')
      .onClick(() => {
        this.isActive = true;
        this.scale = 1.5;
      })
  }
}
```

### 反模式 6: 隐式动画与显式动画混用导致冲突

```typescript
// 错误: animation() 和 animateTo() 同时操作同一属性
Rect()
  .width(this.size)
  .animation({ duration: 300 }) // 隐式动画

// 某处调用
animateTo({ duration: 500 }, () => {
  this.size = 200; // 冲突：animation() 先拦截，animateTo() 效果被覆盖
})

// 正确: 统一使用一种动画方式
```

---

## 手势冲突处理进阶

### 优先级设置 (GestureMask)

通过 `.gesture()` 的第二个参数控制手势掩码，解决父子组件手势冲突：

```typescript
// 优先级：GestureMask.IgnoreInternal < GestureMask.Normal < GestureMask.Ignore
Column() {
  // 父组件手势
}
.gesture(
  TapGesture()
    .onAction(() => {
      console.log('Parent tapped')
    }),
  GestureMask.IgnoreInternal  // 忽略子组件手势
)

// 子组件
Text('Child')
  .gesture(
    TapGesture()
      .onAction(() => {
        console.log('Child tapped')
      })
  )
```

| GestureMask | 说明 |
|-------------|------|
| Normal | 默认：自身和子组件手势均可响应 |
| IgnoreInternal | 忽略子组件手势，仅自身手势响应 |
| Ignore | 忽略自身和子组件手势 |

### 滑动方向判断

通过 PanGesture 的偏移量比较，动态判断滑动方向：

```typescript
@Component
struct DirectionalSwipeDemo {
  @State direction: string = ''

  build() {
    Column() {
      Text('Swipe in any direction')
        .width(200)
        .height(200)
        .backgroundColor('#F0F0F0')
        .gesture(
          PanGesture()
            .onActionEnd((event) => {
              const dx = Math.abs(event.offsetX)
              const dy = Math.abs(event.offsetY)

              if (dx > dy) {
                this.direction = event.offsetX > 0 ? 'Right' : 'Left'
              } else {
                this.direction = event.offsetY > 0 ? 'Down' : 'Up'
              }
            })
        )

      Text(`Direction: ${this.direction}`)
    }
  }
}
```

---

## 手势组合模式

### GestureGroup 并行模式（Pinch + Rotation 组合）

同时支持缩放和旋转，常用于图片查看器：

```typescript
@Component
struct GestureGroupDemo {
  @State scale: number = 1
  @State angle: number = 0
  private lastScale: number = 1
  private lastAngle: number = 0

  build() {
    Column() {
      Image($r('app.media.sample'))
        .width(200)
        .height(200)
        .scale({ x: this.scale, y: this.scale })
        .rotate({ angle: this.angle })
        .gesture(
          GestureGroup(GestureMode.Parallel,
            PinchGesture()
              .onActionStart(() => { this.lastScale = this.scale })
              .onActionUpdate((event) => {
                this.scale = Math.max(0.5, Math.min(3, this.lastScale * event.scale))
              }),
            RotationGesture()
              .onActionStart(() => { this.lastAngle = this.angle })
              .onActionUpdate((event) => {
                this.angle = this.lastAngle + event.angle
              })
          )
        )
    }
  }
}
```

---

## 性能优化建议

### 1. 使用 Transform 属性代替宽高属性

```typescript
// ✅ Good: 使用 Transform 属性（仅触发合成，性能更好）
.scale({ x: this.scale, y: this.scale })
.rotate({ angle: this.angle })
.translate({ x: this.offsetX, y: this.offsetY })

// ❌ Bad: 直接修改宽高（触发重新布局，性能较差）
.width(this.width)
.height(this.height)
```

### 2. 使用 duration: 0 立即停止动画

```typescript
// 立即停止当前动画，让状态值直接生效
animateTo({ duration: 0 }, () => {
  this.scale = 1  // 立即生效，无过渡动画
})
```

---

> **参考链接汇总**
>
> - [属性动画概述 (EN)](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/arkts-attribute-animation-overview-V5)
> - [手势绑定 (EN)](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/arkts-gesture-events-binding-V5)
> - [触摸事件 API](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/ts-universal-events-touch-V5)
> - [hitTestBehavior](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/ts-universal-attributes-hit-test-behavior-V5)
> - [手势设置](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/ts-gesture-settings-V5)
> - [旋转手势](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/ts-basic-gestures-rotationgesture-V5)
