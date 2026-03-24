# ArkTS 动画与手势模式

> 适用版本: HarmonyOS NEXT (API 12+)

## 概述

ArkUI 提供丰富的动画和手势能力，包括属性动画、显式动画、转场动画和手势识别。

---

## 动画类型概览

| 类型 | 说明 | 使用场景 |
|------|------|----------|
| 属性动画 | 组件属性变化时自动动画 | 简单状态变化 |
| 显式动画 (animateTo) | 显式触发的动画 | 复杂动画控制 |
| 组件转场动画 | 组件出现/消失动画 | 列表项增删 |
| 路径动画 | 沿路径运动 | 特殊轨迹动画 |
| 骨架动画 | 加载占位 | 数据加载中 |

---

## 属性动画 (.animation)

### 基本使用

```typescript
@Component
struct PropertyAnimationDemo {
  @State scale: number = 1
  @State opacity: number = 1
  @State rotate: number = 0

  build() {
    Column() {
      Image($r('app.media.icon'))
        .width(100)
        .height(100)
        .scale({ x: this.scale, y: this.scale })
        .opacity(this.opacity)
        .rotate({ angle: this.rotate })
        .animation({
          duration: 300,
          curve: Curve.EaseInOut
        })

      Button('Scale')
        .onClick(() => {
          this.scale = this.scale === 1 ? 1.5 : 1
        })

      Button('Rotate')
        .onClick(() => {
          this.rotate += 45
        })

      Button('Fade')
        .onClick(() => {
          this.opacity = this.opacity === 1 ? 0.3 : 1
        })
    }
  }
}
```

### 动画参数

```typescript
.animation({
  duration: 300,           // 动画时长（ms）
  tempo: 1.0,              // 播放速度倍率
  curve: Curve.EaseInOut,  // 动画曲线
  delay: 0,                // 延迟时间（ms）
  iterations: 1,           // 播放次数，-1 为无限
  playMode: PlayMode.Normal // 播放模式
})

// 动画曲线
Curve.Linear        // 线性
Curve.Ease          // 开始和结束慢，中间快
Curve.EaseIn        // 开始慢
Curve.EaseOut       // 结束慢
Curve.EaseInOut     // 开始和结束慢
Curve.FastOutSlowIn // 快出慢入
Curve.Spring        // 弹性效果
```

---

## 显式动画 (animateTo)

### 基本使用

```typescript
@Component
struct AnimateToDemo {
  @State width: number = 100
  @State height: number = 100

  build() {
    Column() {
      Box()
        .width(this.width)
        .height(this.height)
        .backgroundColor(Color.Blue)

      Button('Animate')
        .onClick(() => {
          // 显式动画
          animateTo({
            duration: 500,
            curve: Curve.Spring,
            onFinish: () => {
              console.log('Animation finished')
            }
          }, () => {
            // 状态变化
            this.width = this.width === 100 ? 200 : 100
            this.height = this.height === 100 ? 200 : 100
          })
        })
    }
  }
}
```

### 动画回调

```typescript
animateTo({
  duration: 1000,
  curve: Curve.EaseInOut,
  delay: 100,
  iterations: 1,
  playMode: PlayMode.Normal,
  onFinish: () => {
    console.log('Animation completed')
  }
}, () => {
  // 状态变化
})
```

### 嵌套动画

```typescript
async playSequentialAnimation() {
  // 第一阶段动画
  await new Promise<void>(resolve => {
    animateTo({
      duration: 300,
      onFinish: resolve
    }, () => {
      this.scale = 1.5
    })
  })

  // 第二阶段动画
  await new Promise<void>(resolve => {
    animateTo({
      duration: 300,
      onFinish: resolve
    }, () => {
      this.opacity = 0.5
    })
  })

  // 第三阶段动画
  animateTo({ duration: 300 }, () => {
    this.scale = 1
    this.opacity = 1
  })
}
```

---

## 组件转场动画

### transition 属性

```typescript
@Component
struct TransitionDemo {
  @State isShow: boolean = true

  build() {
    Column() {
      Button('Toggle')
        .onClick(() => {
          animateTo({ duration: 300 }, () => {
            this.isShow = !this.isShow
          })
        })

      if (this.isShow) {
        Text('Hello World')
          .transition({
            type: TransitionType.All,
            opacity: 0,
            translate: { y: -50 }
          })
      }
    }
  }
}
```

### TransitionEffect

```typescript
// 淡入淡出
.transition(TransitionEffect.OPACITY)

// 滑动
.transition(TransitionEffect.translate({ y: 100 }))

// 缩放
.transition(TransitionEffect.scale({ x: 0, y: 0 }))

// 组合效果
.transition(
  TransitionEffect.OPACITY
    .combine(TransitionEffect.scale({ x: 0, y: 0 }))
    .combine(TransitionEffect.translate({ y: 50 }))
)
```

### 列表项动画

```typescript
@Component
struct ListAnimationDemo {
  @State items: string[] = ['Item 1', 'Item 2', 'Item 3']

  build() {
    Column() {
      Button('Add Item')
        .onClick(() => {
          animateTo({ duration: 300 }, () => {
            this.items.push(`Item ${this.items.length + 1}`)
          })
        })

      List() {
        ForEach(this.items, (item: string, index: number) => {
          ListItem() {
            Text(item)
              .width('100%')
              .height(50)
              .backgroundColor(Color.White)
          }
          .transition({
            type: TransitionType.Insert,
            opacity: 0,
            translate: { x: -100 }
          })
        })
      }
    }
  }
}
```

---

## 手势识别

### 手势类型

| 手势 | 说明 | 使用场景 |
|------|------|----------|
| TapGesture | 点击手势 | 单击、双击 |
| LongPressGesture | 长按手势 | 长按触发操作 |
| PanGesture | 平移手势 | 拖动、滑动 |
| PinchGesture | 捏合手势 | 缩放图片 |
| RotationGesture | 旋转手势 | 旋转图片 |
| SwipeGesture | 滑动手势 | 快速滑动 |
| GestureGroup | 手势组合 | 多手势组合 |

### 点击手势

```typescript
@Component
struct TapGestureDemo {
  @State tapCount: number = 0

  build() {
    Column() {
      Text(`Tap count: ${this.tapCount}`)
        .fontSize(20)

      Text('Single Tap')
        .padding(20)
        .backgroundColor('#007DFF')
        .gesture(
          TapGesture({ count: 1 })
            .onAction(() => {
              this.tapCount++
            })
        )

      Text('Double Tap')
        .padding(20)
        .backgroundColor('#FF6B6B')
        .gesture(
          TapGesture({ count: 2 })
            .onAction(() => {
              this.tapCount += 10
            })
        )
    }
  }
}
```

### 长按手势

```typescript
@Component
struct LongPressDemo {
  @State isLongPressed: boolean = false

  build() {
    Column() {
      Text('Long Press Me')
        .padding(30)
        .backgroundColor(this.isLongPressed ? '#FF6B6B' : '#007DFF')
        .gesture(
          LongPressGesture({ repeat: true })
            .onAction(() => {
              this.isLongPressed = true
            })
            .onActionEnd(() => {
              this.isLongPressed = false
            })
        )
    }
  }
}
```

### 拖动手势

```typescript
@Component
struct PanGestureDemo {
  @State offsetX: number = 0
  @State offsetY: number = 0
  private lastOffsetX: number = 0
  private lastOffsetY: number = 0

  build() {
    Column() {
      Text('Drag Me')
        .width(80)
        .height(80)
        .backgroundColor('#007DFF')
        .borderRadius(40)
        .translate({ x: this.offsetX, y: this.offsetY })
        .gesture(
          PanGesture()
            .onActionStart(() => {
              this.lastOffsetX = this.offsetX
              this.lastOffsetY = this.offsetY
            })
            .onActionUpdate((event) => {
              this.offsetX = this.lastOffsetX + event.offsetX
              this.offsetY = this.lastOffsetY + event.offsetY
            })
        )

      Button('Reset')
        .onClick(() => {
          this.offsetX = 0
          this.offsetY = 0
        })
    }
    .width('100%')
    .height('100%')
  }
}
```

### 缩放手势

```typescript
@Component
struct PinchGestureDemo {
  @State scale: number = 1
  private lastScale: number = 1

  build() {
    Column() {
      Image($r('app.media.sample'))
        .width(300)
        .height(200)
        .scale({ x: this.scale, y: this.scale })
        .gesture(
          PinchGesture()
            .onActionStart(() => {
              this.lastScale = this.scale
            })
            .onActionUpdate((event) => {
              this.scale = this.lastScale * event.scale
              // 限制缩放范围
              this.scale = Math.max(0.5, Math.min(3, this.scale))
            })
        )

      Text(`Scale: ${this.scale.toFixed(2)}`)

      Button('Reset')
        .onClick(() => {
          this.scale = 1
        })
    }
  }
}
```

### 旋转手势

```typescript
@Component
struct RotationGestureDemo {
  @State angle: number = 0
  private lastAngle: number = 0

  build() {
    Column() {
      Image($r('app.media.sample'))
        .width(200)
        .height(200)
        .rotate({ angle: this.angle })
        .gesture(
          RotationGesture()
            .onActionStart(() => {
              this.lastAngle = this.angle
            })
            .onActionUpdate((event) => {
              this.angle = this.lastAngle + event.angle
            })
        )

      Text(`Angle: ${this.angle.toFixed(0)}°`)

      Button('Reset')
        .onClick(() => {
          this.angle = 0
        })
    }
  }
}
```

### 手势组合

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

## 手势冲突处理

### 优先级设置

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

### 滑动方向判断

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

## 最佳实践

### 1. 避免在 aboutToAppear 中调用动画

```typescript
// ❌ Bad: 组件还未创建
aboutToAppear() {
  animateTo({ duration: 300 }, () => {
    this.scale = 1.5  // 无效
  })
}

// ✅ Good: 在 onAppear 中调用
Text('Hello')
  .onAppear(() => {
    animateTo({ duration: 300 }, () => {
      this.scale = 1.5
    })
  })
```

### 2. 使用 duration: 0 停止动画

```typescript
// 立即停止当前动画
animateTo({ duration: 0 }, () => {
  this.scale = 1  // 立即生效
})
```

### 3. 性能优化

```typescript
// ✅ Good: 使用 Transform 属性
.scale({ x: this.scale, y: this.scale })
.rotate({ angle: this.angle })
.translate({ x: this.offsetX, y: this.offsetY })

// ❌ Bad: 直接修改宽高（性能较差）
.width(this.width)
.height(this.height)
```

---

## 快速参考

### 动画

| 方法 | 用途 |
|------|------|
| `.animation()` | 属性动画 |
| `animateTo()` | 显式动画 |
| `.transition()` | 转场动画 |
| `TransitionEffect` | 预设转场效果 |
| `Curve` | 动画曲线 |

### 手势

| 手势 | 触发条件 |
|------|----------|
| `TapGesture` | 点击 |
| `LongPressGesture` | 长按 |
| `PanGesture` | 拖动 |
| `PinchGesture` | 双指缩放 |
| `RotationGesture` | 双指旋转 |
| `SwipeGesture` | 快速滑动 |
| `GestureGroup` | 手势组合 |