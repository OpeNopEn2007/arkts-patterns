# ArkTS 装饰器系统详解

> 适用版本: HarmonyOS NEXT (API 12+)

## 概述

ArkTS 采用声明式 UI 范式，通过装饰器 (Decorators) 实现状态管理和组件定义。装饰器是 ArkTS 的核心特性，理解它们是构建高性能 HarmonyOS 应用的基础。

---

## 组件定义装饰器

### @Component

标记一个 struct 为自定义组件。每个自定义组件必须有 `build()` 方法。

```typescript
// ✅ Good: 正确定义组件
@Component
struct MyComponent {
  build() {
    Text('Hello ArkTS')
  }
}

// ❌ Bad: 忘记 build() 方法
@Component
struct InvalidComponent {
  // 缺少 build() 方法，编译错误
}
```

### @Entry

标记页面入口组件，一个页面只能有一个 `@Entry` 组件。

```typescript
// ✅ Good: 正确定义页面入口
@Entry
@Component
struct HomePage {
  build() {
    Column() {
      Text('Home Page')
    }
  }
}
```

### @Reusable (API 12+)

标记可复用组件，启用组件复用机制，提升性能。

```typescript
// ✅ Good: 可复用的列表项组件
@Reusable
@Component
struct ListItemComponent {
  @Prop item: string = ''

  build() {
    Text(this.item)
  }
}
```

---

## 状态管理装饰器

### @State - 组件内状态

定义组件内部状态，状态变化触发 UI 重新渲染。

```typescript
@Component
struct Counter {
  @State count: number = 0

  build() {
    Column() {
      Text(`Count: ${this.count}`)
      Button('Increment')
        .onClick(() => {
          this.count++ // 状态变化，UI 自动更新
        })
    }
  }
}
```

**注意事项**:
- `@State` 变量必须初始化
- 嵌套对象属性变化不会触发更新（使用 `@Observed` + `@ObjectLink`）
- 数组元素变化需要整体赋值

```typescript
// ❌ Bad: 直接修改数组元素不触发更新
@State list: number[] = [1, 2, 3]
this.list[0] = 10 // UI 不会更新

// ✅ Good: 整体赋值触发更新
this.list = [...this.list] // 或使用特定方法
```

### @Prop - 父子单向同步

父组件向子组件单向传递数据。子组件修改不影响父组件。

```typescript
// 父组件
@Entry
@Component
struct Parent {
  @State message: string = 'Hello'

  build() {
    Column() {
      Child({ text: this.message })
      Text(`Parent: ${this.message}`)
    }
  }
}

// 子组件
@Component
struct Child {
  @Prop text: string = ''

  build() {
    Column() {
      Text(`Child: ${this.text}`)
      Button('Modify')
        .onClick(() => {
          this.text = 'Modified' // 不影响父组件
        })
    }
  }
}
```

### @Link - 父子双向同步

实现父子组件双向数据绑定。传递时使用 `$` 语法。

```typescript
// 父组件
@Entry
@Component
struct Parent {
  @State count: number = 0

  build() {
    Column() {
      Text(`Parent count: ${this.count}`)
      Child({ value: $this.count }) // 使用 $ 传递
    }
  }
}

// 子组件
@Component
struct Child {
  @Link value: number

  build() {
    Column() {
      Text(`Child count: ${this.value}`)
      Button('+1')
        .onClick(() => {
          this.value++ // 双向同步，父组件也会更新
        })
    }
  }
}
```

### @Watch - 监听状态变化

监听状态变量变化，执行回调函数。

```typescript
@Component
struct WatchDemo {
  @State @Watch('onCountChange') count: number = 0
  @State log: string = ''

  onCountChange(newValue: number, oldValue: number) {
    this.log = `Changed from ${oldValue} to ${newValue}`
  }

  build() {
    Column() {
      Text(this.log)
      Button('Increment')
        .onClick(() => this.count++)
    }
  }
}
```

---

## 跨层级状态装饰器

### @Provide / @Consume - 跨层级传递

祖先组件提供数据，后代组件消费数据，无需逐层传递。

```typescript
// 祖先组件
@Entry
@Component
struct GrandParent {
  @Provide theme: string = 'light'

  build() {
    Column() {
      Parent()
      Button('Toggle Theme')
        .onClick(() => {
          this.theme = this.theme === 'light' ? 'dark' : 'light'
        })
    }
  }
}

// 中间组件（无需传递）
@Component
struct Parent {
  build() {
    Child()
  }
}

// 后代组件
@Component
struct Child {
  @Consume theme: string // 自动获取祖先的 theme

  build() {
    Text(`Current theme: ${this.theme}`)
      .fontColor(this.theme === 'dark' ? Color.White : Color.Black)
  }
}
```

### @Observed / @ObjectLink - 嵌套对象观察

深度观察嵌套对象的属性变化。

```typescript
// 定义可观察的类
@Observed
class User {
  name: string = ''
  age: number = 0

  constructor(name: string, age: number) {
    this.name = name
    this.age = age
  }
}

// 父组件
@Entry
@Component
struct Parent {
  @State user: User = new User('John', 25)

  build() {
    Column() {
      Child({ userObj: this.user })
      Button('Change Age')
        .onClick(() => {
          this.user.age = 26 // 需要配合 @ObjectLink
        })
    }
  }
}

// 子组件
@Component
struct Child {
  @ObjectLink userObj: User // 观察 @Observed 类的实例

  build() {
    Text(`${this.userObj.name}: ${this.userObj.age}`)
  }
}
```

---

## 存储装饰器

### @StorageLink / @StorageProp - AppStorage 绑定

应用级状态管理，跨页面共享数据。

```typescript
// 初始化 AppStorage
AppStorage.setOrCreate('isDarkMode', false)

@Entry
@Component
struct Settings {
  @StorageLink('isDarkMode') isDark: boolean = false

  build() {
    Column() {
      Toggle({ isOn: this.isDark })
        .onChange((isOn) => {
          this.isDark = isOn // 所有绑定的组件都会更新
        })
    }
    .backgroundColor(this.isDark ? Color.Black : Color.White)
  }
}
```

### @LocalStorageLink / @LocalStorageProp - LocalStorage 绑定

页面级状态管理，页面内共享数据。

```typescript
// 页面入口
let storage = LocalStorage.create()

@Entry(storage)
@Component
struct Page {
  @LocalStorageLink('token') token: string = ''

  build() {
    Column() {
      // ...
    }
  }
}
```

---

## 装饰器选择指南

| 场景 | 推荐装饰器 |
|------|-----------|
| 组件内部状态 | `@State` |
| 父→子单向传递 | `@Prop` |
| 父子双向同步 | `@Link` |
| 跨层级传递 | `@Provide/@Consume` |
| 嵌套对象观察 | `@Observed/@ObjectLink` |
| 应用级状态 | `@StorageLink/@StorageProp` |
| 页面级状态 | `@LocalStorageLink/@LocalStorageProp` |
| 监听状态变化 | `@Watch` |

---

## 最佳实践

1. **状态最小化**: 只将需要触发 UI 更新的数据声明为状态变量
2. **单向数据流优先**: 优先使用 `@Prop`，仅在必要时使用 `@Link`
3. **避免深层嵌套**: 使用 `@Observed/@ObjectLink` 处理复杂数据结构
4. **合理使用 @Watch**: 避免在回调中执行耗时操作

```typescript
// ❌ Bad: 不必要的状态变量
@Component
struct Bad {
  @State constant: string = 'Never changes' // 不应该是状态

  build() {
    Text(this.constant)
  }
}

// ✅ Good: 常量作为普通成员
@Component
struct Good {
  constant: string = 'Never changes'

  build() {
    Text(this.constant)
  }
}
```