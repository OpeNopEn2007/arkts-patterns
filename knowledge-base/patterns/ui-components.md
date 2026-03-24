# ArkTS UI 组件模式

> 适用版本: HarmonyOS NEXT (API 12+)

## 概述

构建高质量的 ArkTS 应用需要掌握组件封装、组合和复用的模式。本文档介绍常用的 UI 组件设计模式。

---

## 组件设计原则

### 1. 单一职责

每个组件只做一件事，保持组件功能单一、可预测。

```typescript
// ❌ Bad: 组件承担过多职责
@Component
struct UserCard {
  @Prop user: User

  build() {
    Column() {
      // 头像、信息、操作按钮、统计图表...
      // 200+ 行代码
    }
  }
}

// ✅ Good: 拆分为职责单一的组件
@Component
struct UserCard {
  @Prop user: User

  build() {
    Column() {
      UserAvatar({ url: this.user.avatar })
      UserInfo({ user: this.user })
      UserStats({ stats: this.user.stats })
      UserActions({ userId: this.user.id })
    }
  }
}
```

### 2. 组件粒度

| 组件类型 | 说明 | 示例 |
|----------|------|------|
| 基础组件 | 最小可复用单元 | Icon, Badge, Avatar |
| 组合组件 | 多个基础组件组合 | Card, ListItem, SearchBar |
| 布局组件 | 负责布局结构 | PageContainer, ScrollList |
| 页面组件 | 完整页面 | HomePage, DetailPage |

---

## 常用组件封装模式

### 1. 可复用按钮组件

```typescript
// components/Button.ets
export type ButtonType = 'primary' | 'secondary' | 'outline' | 'text'
export type ButtonSize = 'small' | 'medium' | 'large'

@Component
export struct Button {
  @Prop text: string = ''
  @Prop type: ButtonType = 'primary'
  @Prop size: ButtonSize = 'medium'
  @Prop disabled: boolean = false
  @Prop loading: boolean = false
  onClick?: () => void

  // 根据类型获取样式
  private getTypeStyle(): Record<string, ResourceColor> {
    const styles: Record<ButtonType, Record<string, ResourceColor>> = {
      primary: { bg: '#007DFF', text: Color.White },
      secondary: { bg: '#E8E8E8', text: '#333333' },
      outline: { bg: Color.Transparent, text: '#007DFF' },
      text: { bg: Color.Transparent, text: '#007DFF' }
    }
    return styles[this.type]
  }

  // 根据尺寸获取样式
  private getSizeStyle(): Record<string, number | string> {
    const sizes: Record<ButtonSize, Record<string, number | string>> = {
      small: { height: 32, fontSize: 12, padding: 8 },
      medium: { height: 44, fontSize: 14, padding: 16 },
      large: { height: 56, fontSize: 16, padding: 24 }
    }
    return sizes[this.size]
  }

  build() {
    Row() {
      if (this.loading) {
        LoadingProgress()
          .width(20)
          .height(20)
          .color(this.getTypeStyle().text)
      } else {
        Text(this.text)
          .fontSize(this.getSizeStyle().fontSize as number)
          .fontColor(this.getTypeStyle().text)
      }
    }
    .width('100%')
    .height(this.getSizeStyle().height as number)
    .backgroundColor(this.getTypeStyle().bg)
    .borderRadius(8)
    .justifyContent(FlexAlign.Center)
    .opacity(this.disabled ? 0.5 : 1)
    .border(this.type === 'outline' ? {
      width: 1,
      color: '#007DFF'
    } : undefined)
    .onClick(() => {
      if (!this.disabled && !this.loading && this.onClick) {
        this.onClick()
      }
    })
  }
}

// 使用
@Component
struct Demo {
  build() {
    Column({ space: 12 }) {
      Button({ text: 'Primary Button', type: 'primary' })
        .onClick(() => console.log('clicked'))

      Button({ text: 'Loading...', loading: true })

      Button({ text: 'Disabled', disabled: true })
    }
  }
}
```

### 2. 列表项组件

```typescript
// components/ListItem.ets
export interface ListItemData {
  id: string | number
  title: string
  subtitle?: string
  icon?: Resource
  trailing?: string
}

@Component
export struct ListItem {
  @Prop item: ListItemData
  @Prop showArrow: boolean = true
  onItemTap?: (item: ListItemData) => void

  build() {
    Row() {
      // 左侧图标
      if (this.item.icon) {
        Image(this.item.icon)
          .width(24)
          .height(24)
          .margin({ right: 12 })
      }

      // 中间内容
      Column() {
        Text(this.item.title)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)

        if (this.item.subtitle) {
          Text(this.item.subtitle)
            .fontSize(14)
            .fontColor('#999999')
            .margin({ top: 4 })
        }
      }
      .alignItems(HorizontalAlign.Start)
      .layoutWeight(1)

      // 右侧内容
      if (this.item.trailing) {
        Text(this.item.trailing)
          .fontSize(14)
          .fontColor('#999999')
          .margin({ right: 8 })
      }

      // 箭头
      if (this.showArrow) {
        Text('›')
          .fontSize(20)
          .fontColor('#CCCCCC')
      }
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 12, bottom: 12 })
    .backgroundColor(Color.White)
    .onClick(() => {
      if (this.onItemTap) {
        this.onItemTap(this.item)
      }
    })
  }
}
```

### 3. 搜索栏组件

```typescript
// components/SearchBar.ets
@Component
export struct SearchBar {
  @Link searchText: string
  @Prop placeholder: string = '搜索'
  @Prop showCancelButton: boolean = false
  onSearch?: (query: string) => void
  onCancel?: () => void

  build() {
    Row() {
      // 搜索图标
      Text('🔍')
        .fontSize(16)
        .margin({ right: 8 })

      // 输入框
      TextInput({ text: this.searchText, placeholder: this.placeholder })
        .layoutWeight(1)
        .backgroundColor(Color.Transparent)
        .onChange((value) => {
          this.searchText = value
        })
        .onSubmit(() => {
          if (this.onSearch) {
            this.onSearch(this.searchText)
          }
        })

      // 清除按钮
      if (this.searchText.length > 0) {
        Text('✕')
          .fontSize(16)
          .fontColor('#999999')
          .onClick(() => {
            this.searchText = ''
          })
      }
    }
    .width('100%')
    .height(40)
    .padding({ left: 12, right: 12 })
    .backgroundColor('#F5F5F5')
    .borderRadius(20)
  }
}
```

### 4. 空状态组件

```typescript
// components/EmptyState.ets
export interface EmptyStateConfig {
  icon?: Resource | string
  title: string
  description?: string
  actionText?: string
  onAction?: () => void
}

@Component
export struct EmptyState {
  @Prop config: EmptyStateConfig

  build() {
    Column({ space: 16 }) {
      // 图标
      if (this.config.icon) {
        if (typeof this.config.icon === 'string') {
          Text(this.config.icon)
            .fontSize(64)
        } else {
          Image(this.config.icon)
            .width(80)
            .height(80)
        }
      }

      // 标题
      Text(this.config.title)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .fontColor('#333333')

      // 描述
      if (this.config.description) {
        Text(this.config.description)
          .fontSize(14)
          .fontColor('#999999')
          .textAlign(TextAlign.Center)
      }

      // 操作按钮
      if (this.config.actionText && this.config.onAction) {
        Button(this.config.actionText)
          .onClick(() => this.config.onAction?.())
      }
    }
    .width('100%')
    .padding(32)
    .justifyContent(FlexAlign.Center)
  }
}

// 使用
@Component
struct Demo {
  build() {
    Column() {
      EmptyState({
        config: {
          icon: '📭',
          title: '暂无数据',
          description: '还没有任何内容，点击添加',
          actionText: '添加数据',
          onAction: () => console.log('add')
        }
      })
    }
    .width('100%')
    .height('100%')
  }
}
```

---

## 列表渲染模式

### 1. 基础列表

```typescript
@Component
struct BasicList {
  @State items: Item[] = []

  build() {
    List({ space: 1 }) {
      ForEach(this.items, (item: Item) => {
        ListItem() {
          ItemCard({ item: item })
        }
      }, (item: Item) => item.id.toString())
    }
    .width('100%')
    .height('100%')
    .divider({ strokeWidth: 1, color: '#F0F0F0' })
  }
}
```

### 2. 分组列表

```typescript
interface Section {
  title: string
  items: Item[]
}

@Component
struct GroupedList {
  @State sections: Section[] = []

  build() {
    List({ space: 1 }) {
      ForEach(this.sections, (section: Section, sectionIndex: number) => {
        ListItemGroup({
          header: this.sectionHeader(section.title),
          items: section.items.map((item, itemIndex) => ({
            item: item,
            index: `${sectionIndex}-${itemIndex}`
          }))
        }) {
          ItemCard({ item: $item.item })
        }
      })
    }
  }

  @Builder
  sectionHeader(title: string) {
    Text(title)
      .fontSize(14)
      .fontColor('#999999')
      .padding({ left: 16, top: 8, bottom: 8 })
      .backgroundColor('#F5F5F5')
      .width('100%')
  }
}
```

### 3. 懒加载列表

```typescript
import { LazyDataSource } from '@ohos.data'

@Component
struct LazyList {
  @State dataSource: LazyDataSource<Item> = new LazyDataSource()
  @State isLoading: boolean = false

  build() {
    List() {
      LazyForEach(
        this.dataSource,
        (item: Item) => {
          ListItem() {
            ItemCard({ item: item })
          }
        },
        (item: Item) => item.id.toString()
      )
    }
    .onReachEnd(() => {
      this.loadMore()
    })
  }

  private async loadMore() {
    if (this.isLoading) return
    this.isLoading = true

    try {
      const newItems = await this.fetchMoreItems()
      this.dataSource.pushData(...newItems)
    } finally {
      this.isLoading = false
    }
  }

  private async fetchMoreItems(): Promise<Item[]> {
    // 模拟 API 调用
    return []
  }
}
```

---

## 表单组件模式

### 1. 表单字段封装

```typescript
// components/FormField.ets
export interface FormFieldConfig {
  label: string
  required?: boolean
  error?: string
  helpText?: string
}

@Component
export struct FormField {
  @Prop config: FormFieldConfig
  @BuilderParam content: () => void

  build() {
    Column({ space: 8 }) {
      // 标签
      Row() {
        Text(this.config.label)
        if (this.config.required) {
          Text(' *')
            .fontColor(Color.Red)
        }
      }

      // 内容
      this.content()

      // 错误信息
      if (this.config.error) {
        Text(this.config.error)
          .fontSize(12)
          .fontColor(Color.Red)
      }

      // 帮助文本
      if (this.config.helpText && !this.config.error) {
        Text(this.config.helpText)
          .fontSize(12)
          .fontColor('#999999')
      }
    }
    .alignItems(HorizontalAlign.Start)
    .width('100%')
  }
}

// 使用
@Component
struct LoginForm {
  @State username: string = ''
  @State usernameError: string = ''

  build() {
    Column({ space: 16 }) {
      FormField({
        config: {
          label: '用户名',
          required: true,
          error: this.usernameError
        }
      }) {
        TextInput({ text: this.username, placeholder: '请输入用户名' })
          .onChange((value) => {
            this.username = value
            this.usernameError = value.length > 0 ? '' : '用户名不能为空'
          })
      }
    }
  }
}
```

### 2. 表单验证

```typescript
// utils/FormValidator.ets
export type ValidatorRule = {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  message: string
}

export class FormValidator {
  static validate(value: string, rules: ValidatorRule[]): string | null {
    for (const rule of rules) {
      if (rule.required && !value) {
        return rule.message
      }
      if (rule.minLength && value.length < rule.minLength) {
        return rule.message
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        return rule.message
      }
      if (rule.pattern && !rule.pattern.test(value)) {
        return rule.message
      }
    }
    return null
  }
}

// 使用
@Component
struct ValidatedForm {
  @State email: string = ''
  @State emailError: string = ''

  private emailRules: ValidatorRule[] = [
    { required: true, message: '请输入邮箱' },
    { pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: '邮箱格式不正确' }
  ]

  validateEmail(): void {
    this.emailError = FormValidator.validate(this.email, this.emailRules) || ''
  }

  build() {
    Column() {
      TextInput({ text: this.email, placeholder: '邮箱' })
        .onChange((value) => {
          this.email = value
          this.validateEmail()
        })

      if (this.emailError) {
        Text(this.emailError)
          .fontColor(Color.Red)
          .fontSize(12)
      }
    }
  }
}
```

---

## 弹窗组件模式

### 1. 自定义弹窗

```typescript
// components/Dialog.ets
@CustomDialog
export struct Dialog {
  controller: CustomDialogController
  @Prop title: string = ''
  @Prop message: string = ''
  @Prop confirmText: string = '确定'
  @Prop cancelText: string = '取消'
  onConfirm?: () => void
  onCancel?: () => void

  build() {
    Column({ space: 16 }) {
      // 标题
      if (this.title) {
        Text(this.title)
          .fontSize(18)
          .fontWeight(FontWeight.Medium)
      }

      // 内容
      Text(this.message)
        .fontSize(14)
        .fontColor('#666666')

      // 按钮
      Row({ space: 12 }) {
        Button(this.cancelText)
          .layoutWeight(1)
          .backgroundColor('#F5F5F5')
          .fontColor('#333333')
          .onClick(() => {
            this.controller.close()
            this.onCancel?.()
          })

        Button(this.confirmText)
          .layoutWeight(1)
          .onClick(() => {
            this.controller.close()
            this.onConfirm?.()
          })
      }
    }
    .padding(24)
    .backgroundColor(Color.White)
    .borderRadius(12)
  }
}

// 使用
@Component
struct Demo {
  dialogController: CustomDialogController = new CustomDialogController({
    builder: Dialog({
      title: '确认删除',
      message: '删除后无法恢复，确定要删除吗？',
      onConfirm: () => console.log('confirmed'),
      onCancel: () => console.log('cancelled')
    }),
    autoCancel: true,
    alignment: DialogAlignment.Center
  })

  build() {
    Button('显示弹窗')
      .onClick(() => this.dialogController.open())
  }
}
```

### 2. Toast 提示

```typescript
// utils/Toast.ets
import promptAction from '@ohos.promptAction'

export class Toast {
  static show(message: string, duration: number = 2000): void {
    promptAction.showToast({
      message: message,
      duration: duration
    })
  }

  static showLong(message: string): void {
    this.show(message, 3500)
  }
}

// 使用
Button('保存')
  .onClick(() => {
    this.saveData()
    Toast.show('保存成功')
  })
```

---

## 加载状态模式

### 1. 加载骨架屏

```typescript
// components/Skeleton.ets
@Component
export struct Skeleton {
  @Prop width: number | string = '100%'
  @Prop height: number | string = 20
  @Prop borderRadius: number = 4

  build() {
    Row()
      .width(this.width)
      .height(this.height)
      .backgroundColor('#F0F0F0')
      .borderRadius(this.borderRadius)
  }
}

@Component
export struct UserCardSkeleton {
  build() {
    Row({ space: 12 }) {
      Skeleton({ width: 48, height: 48, borderRadius: 24 })

      Column({ space: 8 }) {
        Skeleton({ width: 120, height: 16 })
        Skeleton({ width: 80, height: 12 })
      }
      .alignItems(HorizontalAlign.Start)
    }
    .padding(16)
  }
}
```

### 2. 加载状态组件

```typescript
// components/LoadingContainer.ets
export type LoadingState = 'loading' | 'success' | 'error' | 'empty'

@Component
export struct LoadingContainer {
  @Prop state: LoadingState = 'loading'
  @Prop errorMessage: string = '加载失败'
  @Prop emptyMessage: string = '暂无数据'
  @BuilderParam content: () => void
  onRetry?: () => void

  build() {
    Stack() {
      if (this.state === 'loading') {
        this.loadingView()
      } else if (this.state === 'error') {
        this.errorView()
      } else if (this.state === 'empty') {
        this.emptyView()
      } else {
        this.content()
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  private loadingView() {
    Column() {
      LoadingProgress()
        .width(48)
        .height(48)
      Text('加载中...')
        .fontSize(14)
        .fontColor('#999999')
        .margin({ top: 12 })
    }
  }

  @Builder
  private errorView() {
    Column() {
      Text('❌')
        .fontSize(48)
      Text(this.errorMessage)
        .fontSize(14)
        .fontColor('#999999')
        .margin({ top: 12 })
      Button('重试')
        .margin({ top: 16 })
        .onClick(() => this.onRetry?.())
    }
  }

  @Builder
  private emptyView() {
    Column() {
      Text('📭')
        .fontSize(48)
      Text(this.emptyMessage)
        .fontSize(14)
        .fontColor('#999999')
        .margin({ top: 12 })
    }
  }
}
```

---

## 快速参考

| 模式 | 用途 |
|------|------|
| 单一职责组件 | 每个组件只做一件事 |
| @Prop 传递 | 父→子单向数据流 |
| @Link 双向绑定 | 父↔子双向同步 |
| @BuilderParam | 插槽，允许外部传入 UI |
| ForEach | 渲染列表 |
| LazyForEach | 大列表懒加载 |
| @CustomDialog | 自定义弹窗 |
| LoadingProgress | 加载指示器 |
| Skeleton | 骨架屏 |
| EmptyState | 空状态 |