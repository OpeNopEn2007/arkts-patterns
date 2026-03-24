# ArkTS 状态管理最佳实践

> 适用版本: HarmonyOS NEXT (API 12+)

## 概述

状态管理是 ArkTS 开发的核心。正确的状态管理能提升应用性能、降低维护成本。

---

## 状态管理层次架构

```
┌─────────────────────────────────────────┐
│            AppStorage                   │  ← 应用级状态
│  (跨页面、跨模块共享)                    │
├─────────────────────────────────────────┤
│            LocalStorage                 │  ← 页面级状态
│  (页面内组件共享)                        │
├─────────────────────────────────────────┤
│         @Provide/@Consume               │  ← 组件树状态
│  (跨层级传递)                            │
├─────────────────────────────────────────┤
│         @Link/@Prop                     │  ← 父子组件状态
│  (父子通信)                              │
├─────────────────────────────────────────┤
│            @State                       │  ← 组件内状态
│  (本地状态)                              │
└─────────────────────────────────────────┘
```

---

## 状态变量选择指南

### 组件内状态 (@State)

用于组件私有的、需要触发 UI 更新的数据。

```typescript
// ✅ Good: 合理使用 @State
@Component
struct SearchBar {
  @State searchText: string = ''  // 输入框内容
  @State isLoading: boolean = false  // 加载状态

  build() {
    Column() {
      TextInput({ text: this.searchText })
        .onChange((value) => {
          this.searchText = value
        })

      if (this.isLoading) {
        LoadingProgress()
      }
    }
  }
}

// ❌ Bad: 不需要响应式的数据使用 @State
@Component
struct BadExample {
  @State constantValue: string = 'Never changes'  // 浪费性能

  build() {
    Text(this.constantValue)
  }
}
```

### 父子通信 (@Prop / @Link)

```typescript
// ✅ Good: 单向数据流优先使用 @Prop
@Component
struct UserCard {
  @Prop userName: string  // 只读，父组件控制
  @Prop avatar: string

  build() {
    Row() {
      Image(this.avatar)
      Text(this.userName)
    }
  }
}

// ✅ Good: 双向绑定使用 @Link
@Component
struct QuantitySelector {
  @Link quantity: number

  build() {
    Row() {
      Button('-').onClick(() => this.quantity--)
      Text(`${this.quantity}`)
      Button('+').onClick(() => this.quantity++)
    }
  }
}

// 使用示例
@Entry
@Component
struct ProductPage {
  @State quantity: number = 1

  build() {
    Column() {
      QuantitySelector({ quantity: $this.quantity })
      Text(`Total: ${this.quantity * 100}`)
    }
  }
}
```

### 跨层级状态 (@Provide/@Consume)

避免 prop drilling（逐层传递）。

```typescript
// ❌ Bad: 逐层传递
@Entry
@Component
struct App {
  @State theme: string = 'dark'
  build() {
    Parent({ theme: this.theme })
  }
}

@Component
struct Parent {
  @Prop theme: string  // 只是为了传递给子组件
  build() {
    Child({ theme: this.theme })
  }
}

@Component
struct Child {
  @Prop theme: string  // 最终使用
  build() {
    Text(this.theme)
  }
}

// ✅ Good: 使用 @Provide/@Consume
@Entry
@Component
struct App {
  @Provide theme: string = 'dark'
  build() {
    Column() {
      Parent()  // 无需传递
    }
  }
}

@Component
struct Child {
  @Consume theme: string  // 直接获取
  build() {
    Text(this.theme)
  }
}
```

### 嵌套对象 (@Observed/@ObjectLink)

```typescript
// 定义可观察的数据类
@Observed
class TodoItem {
  id: number
  title: string
  completed: boolean

  constructor(id: number, title: string) {
    this.id = id
    this.title = title
    this.completed = false
  }
}

// 列表项组件
@Component
struct TodoListItem {
  @ObjectLink item: TodoItem  // 深度观察

  build() {
    Row() {
      Checkbox()
        .select(this.item.completed)
        .onChange((value) => {
          this.item.completed = value  // 直接修改属性
        })
      Text(this.item.title)
    }
  }
}

// 列表组件
@Entry
@Component
struct TodoList {
  @State items: TodoItem[] = [
    new TodoItem(1, 'Learn ArkTS'),
    new TodoItem(2, 'Build App')
  ]

  build() {
    List() {
      ForEach(this.items, (item: TodoItem) => {
        ListItem() {
          TodoListItem({ item: item })
        }
      })
    }
  }
}
```

---

## AppStorage 最佳实践

### 初始化

```typescript
// 在应用启动时初始化
// EntryAbility.ets
import UIAbility from '@ohos.app.ability.UIAbility'

export default class EntryAbility extends UIAbility {
  onCreate() {
    // 初始化全局状态
    AppStorage.setOrCreate('isDarkMode', false)
    AppStorage.setOrCreate('language', 'zh-CN')
    AppStorage.setOrCreate('token', '')
  }
}
```

### 使用示例

```typescript
// 设置页面
@Entry
@Component
struct SettingsPage {
  @StorageLink('isDarkMode') isDarkMode: boolean = false
  @StorageLink('language') language: string = 'zh-CN'

  build() {
    Column() {
      Toggle({ isOn: this.isDarkMode })
        .onChange((value) => {
          this.isDarkMode = value
        })

      Select([
        { value: '中文' },
        { value: 'English' }
      ])
        .selected(this.language === 'zh-CN' ? 0 : 1)
        .onSelect((index) => {
          this.language = index === 0 ? 'zh-CN' : 'en-US'
        })
    }
  }
}

// 其他页面自动响应变化
@Component
struct ThemeAwareComponent {
  @StorageProp('isDarkMode') isDarkMode: boolean = false  // 只读

  build() {
    Text('Hello')
      .fontColor(this.isDarkMode ? Color.White : Color.Black)
  }
}
```

---

## 状态 V2 (API 12+)

API 12 引入了新的状态管理 V2 系统。

### @ComponentV2 + @Local

```typescript
@ComponentV2
struct NewStyleComponent {
  @Local message: string = 'Hello'
  @Local count: number = 0

  build() {
    Column() {
      Text(this.message)
      Button(`Count: ${this.count}`)
        .onClick(() => this.count++)
    }
  }
}
```

### 状态 V2 优势

- 更好的性能
- 更简洁的语法
- 支持更多类型的状态管理

---

## 常见反模式

### 1. 状态滥用

```typescript
// ❌ Bad: 所有变量都用 @State
@Component
struct BadComponent {
  @State name: string = 'Test'
  @State age: number = 18
  @State id: string = '123'
  @State description: string = '...'
  // 大量不必要的状态变量

  build() {
    Text(this.name)
  }
}

// ✅ Good: 只保留需要响应式的变量
@Component
struct GoodComponent {
  @State name: string = 'Test'  // 需要更新
  age: number = 18  // 常量
  id: string = '123'  // 不变

  build() {
    Text(this.name)
  }
}
```

### 2. 深层嵌套状态

```typescript
// ❌ Bad: 深层嵌套无法触发更新
interface User {
  profile: {
    settings: {
      theme: string
    }
  }
}

@Component
struct BadComponent {
  @State user: User = {
    profile: { settings: { theme: 'dark' } }
  }

  changeTheme() {
    this.user.profile.settings.theme = 'light'  // 不会触发更新
  }
}

// ✅ Good: 使用 @Observed/@ObjectLink
@Observed
class Settings {
  theme: string = 'dark'
}

@Observed
class Profile {
  settings: Settings = new Settings()
}

@Observed
class User {
  profile: Profile = new Profile()
}
```

### 3. 过度使用全局状态

```typescript
// ❌ Bad: 所有状态都放 AppStorage
AppStorage.setOrCreate('buttonText', 'Click me')  // 不应该是全局状态

// ✅ Good: 全局状态只用于真正需要共享的数据
AppStorage.setOrCreate('userToken', 'xxx')  // 合理的全局状态
AppStorage.setOrCreate('theme', 'dark')  // 合理的全局状态
```

---

## 性能优化建议

1. **最小化状态范围**: 状态变量越少越好
2. **选择正确的装饰器**: 根据数据流向选择
3. **避免不必要的响应式**: 常量不要用状态装饰器
4. **合理使用 @Watch**: 避免在回调中执行耗时操作
5. **批量更新**: 多个状态更新尽量合并

```typescript
// ✅ Good: 批量更新
@Component
struct OptimizedComponent {
  @State user: User = new User()

  updateUser(name: string, age: number) {
    // 批量更新，只触发一次渲染
    this.user = Object.assign(this.user, { name, age })
  }
}
```