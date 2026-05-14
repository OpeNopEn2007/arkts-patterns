# Index 主页面模板

主页面展示了 ArkTS 声明式 UI 的核心用法：@Entry、@Component、@State 装饰器。

---

## 完整代码模板

```typescript
@Entry
@Component
struct Index {
  @State message: string = 'Hello World';

  build() {
    RelativeContainer() {
      Text(this.message)
        .id('HelloWorld')
        .fontSize($r('app.float.page_text_font_size'))
        .fontWeight(FontWeight.Bold)
        .alignRules({
          center: { anchor: '__container__', align: VerticalAlign.Center },
          middle: { anchor: '__container__', align: HorizontalAlign.Center }
        })
        .onClick(() => {
          this.message = 'Welcome';
        })
    }
    .height('100%')
    .width('100%')
  }
}
```

---

## 装饰器详解

### @Entry

标记组件为页面入口，可通过路由访问。

```typescript
// ✅ Good: 页面入口组件
@Entry
@Component
struct Index {
  build() {
    // 页面内容
  }
}

// ❌ Bad: 非页面组件不应使用 @Entry
@Entry  // 移除，改为普通组件
@Component
struct UserCard {
  build() {
    // 组件内容
  }
}
```

### @Component

声明为自定义组件，具备生命周期。

```typescript
@Component
struct MyComponent {
  build() {
    Text('Hello')
  }
}
```

### @State

声明状态变量，变化时自动刷新 UI。

```typescript
// ✅ Good: 使用 @State 驱动 UI
@State message: string = 'Hello World';

build() {
  Text(this.message)
    .onClick(() => {
      this.message = 'Welcome';  // 自动触发 UI 更新
    })
}

// ❌ Bad: 普通变量无法触发刷新
message: string = 'Hello World';  // 缺少 @State

build() {
  Text(this.message)
    .onClick(() => {
      this.message = 'Welcome';  // UI 不会更新
    })
}
```

---

## RelativeContainer 布局

RelativeContainer 是相对布局容器，通过 `alignRules` 定位子组件。

### 基本用法

```typescript
RelativeContainer() {
  Text('Center')
    .alignRules({
      center: { anchor: '__container__', align: VerticalAlign.Center },
      middle: { anchor: '__container__', align: HorizontalAlign.Center }
    })
}
.height('100%')
.width('100%')
```

### alignRules 参数

| 参数 | 说明 |
|------|------|
| `anchor` | 锚点，`'__container__'` 表示父容器 |
| `align` | 对齐方式 |

**对齐类型**:
- `top`, `bottom`, `center` (垂直)
- `left`, `right`, `middle` (水平)

### 居中布局

```typescript
// ✅ Good: 使用 alignRules 实现居中
Text('Center')
  .alignRules({
    center: { anchor: '__container__', align: VerticalAlign.Center },
    middle: { anchor: '__container__', align: HorizontalAlign.Center }
  })

// ❌ Bad: 硬编码位置（不响应屏幕尺寸）
Text('Center')
  .position({ x: 100, y: 200 })
```

---

## 资源引用

### $r() 语法

使用 `$r()` 引用资源，支持多语言和主题。

```typescript
// ✅ Good: 使用资源引用
.fontSize($r('app.float.page_text_font_size'))
.fontColor($r('app.color.primary'))

// ❌ Bad: 硬编码值
.fontSize(50)
.fontColor('#007DFF')
```

### 资源格式

```typescript
// 格式: $r('app.<type>.<name>')
$r('app.float.page_text_font_size')  // float 资源
$r('app.color.primary')              // color 资源
$r('app.string.app_name')            // string 资源
```

### $string / $color 快捷方式

```typescript
// 字符串资源
$string:app_name

// 颜色资源
$color:start_window_background
```

---

## 事件处理

### onClick

```typescript
Text('Click Me')
  .onClick(() => {
    this.message = 'Clicked!';
  })
```

### 带参数的事件

```typescript
@State items: string[] = ['A', 'B', 'C'];

build() {
  Column() {
    ForEach(this.items, (item: string, index: number) => {
      Text(item)
        .onClick(() => {
          console.log(`Clicked: ${item} at ${index}`);
        })
    })
  }
}
```

---

## 页面模板扩展

### 带加载状态的页面

```typescript
@Entry
@Component
struct UserListPage {
  @State loading: boolean = true;
  @State users: User[] = [];

  aboutToAppear() {
    this.loadUsers();
  }

  async loadUsers() {
    this.loading = true;
    this.users = await fetchUsers();
    this.loading = false;
  }

  build() {
    if (this.loading) {
      LoadingProgress()
    } else {
      List() {
        ForEach(this.users, (user: User) => {
          ListItem() {
            Text(user.name)
          }
        })
      }
    }
  }
}
```

### 表单页面

```typescript
@Entry
@Component
struct FormPage {
  @State username: string = '';
  @State password: string = '';

  build() {
    Column({ space: 16 }) {
      TextInput({ placeholder: 'Username' })
        .onChange((value) => {
          this.username = value;
        })

      TextInput({ placeholder: 'Password' })
        .type(InputType.Password)
        .onChange((value) => {
          this.password = value;
        })

      Button('Submit')
        .onClick(() => {
          this.submit();
        })
    }
    .padding(16)
  }

  submit() {
    console.log(`Submit: ${this.username}`);
  }
}
```

---

## 页面注册

在 `main_pages.json` 中注册页面：

```json
{
  "src": [
    "pages/Index",
    "pages/SecondPage"
  ]
}
```