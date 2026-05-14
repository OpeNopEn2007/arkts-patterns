# ArkTS 语言

> HarmonyOS NEXT (API 12) ArkTS 编程语言参考

---

## 1. 声明式 UI 基本语法

### 1.1 ArkTS 声明式 UI 概述

ArkTS 基于 TypeScript 扩展，提供了声明式 UI 编程范式。核心特征：

- **UI = f(State)**: UI 是状态的函数，状态变化自动驱动 UI 更新
- **组件化**: UI 由组件树构成
- **链式调用**: 通过 `.` 操作符链式配置组件属性

### 1.2 基本语法结构

```typescript
@Entry
@Component
struct MyComponent {
  // 1. 状态变量
  @State message: string = 'Hello';

  // 2. 计算属性 (build 函数外)
  get reversedMessage(): string {
    return this.message.split('').reverse().join('');
  }

  // 3. 组件方法
  aboutToAppear(): void {
    console.info('Component will appear');
  }

  // 4. 构建函数 (必须)
  build() {
    // 根节点必须是容器组件
    Column() {
      Text(this.message)
        .fontSize(24)
        .fontColor(Color.Blue)

      Button('点击更新')
        .onClick(() => {
          this.message = 'Updated!';
        })
    }
    .width('100%')
    .height('100%')
  }
}
```

### 1.3 语法规则总结

| 规则 | 说明 |
|------|------|
| `build()` 必须 | 每个组件必须实现 `build()` 方法 |
| 单一根节点 | `build()` 内必须有且仅有一个根容器组件 |
| 无 `new` 关键字 | 组件直接通过构造函数创建 |
| 链式配置 | 通过 `.attribute(value)` 配置属性和事件 |
| 自定义事件 | `on + EventName` 命名模式 |
| 条件渲染 | 使用 `if` / `else` / `else if` |
| 循环渲染 | 使用 `ForEach` / `LazyForEach` |
| @State 驱动 | 状态变量变化自动触发 UI 刷新 |

### 1.4 条件渲染和循环渲染

```typescript
// 条件渲染
@State isVisible: boolean = true;

build() {
  Column() {
    if (this.isVisible) {
      Text('可见的文本')
    } else {
      Text('隐藏的文本')
    }

    Button('切换').onClick(() => {
      this.isVisible = !this.isVisible;
    })
  }
}

// 循环渲染
@State fruits: string[] = ['苹果', '香蕉', '橘子'];

build() {
  Column() {
    ForEach(this.fruits, (item: string, index: number) => {
      Text(`${index + 1}. ${item}`)
        .fontSize(20)
    }, (item: string) => item)  // key generator
  }
}
```

---

## 2. 创建自定义组件

### 2.1 @Component 装饰器

`@Component` 装饰器将一个 struct 声明为自定义组件，使其具备组件化能力。

**组件结构约束**：

```typescript
@Component
struct MyComponent {
  // 1. 成员变量 (可选的 状态变量/普通变量)
  @State count: number = 0;
  private title: string = '';

  // 2. build 方法 (必须)
  build() {
    // UI 描述
  }

  // 3. 生命周期回调 (可选)
  aboutToAppear(): void { }
  aboutToDisappear(): void { }

  // 4. 自定义方法 (可选)
  private handleClick(): void {
    this.count++;
  }
}
```

**组件成员变量类型**：

| 变量类型 | 装饰器 | 用途 |
|---------|--------|------|
| 状态变量 | `@State` | 组件内部状态，变化触发 UI 刷新 |
| 状态变量 | `@Prop` | 父组件传入的单向数据 |
| 状态变量 | `@Link` | 父组件传入的双向数据 |
| 状态变量 | `@Provide/@Consume` | 跨组件层级的数据传递 |
| 普通变量 | 无装饰器 | 不触发 UI 刷新的数据 |

### 2.2 @Entry 装饰器

`@Entry` 装饰器标记组件的页面入口，使组件成为页面的根组件。

```typescript
@Entry
@Component
struct Index {
  // @Entry 标记的组件可以访问页面生命周期
  onPageShow(): void { console.info('Page show'); }
  onPageHide(): void { console.info('Page hide'); }
  onBackPress(): boolean {
    console.info('Back press');
    return false; // true 表示拦截返回事件
  }

  build() {
    // ...
  }
}
```

### 2.3 @Reusable 装饰器

`@Reusable` 装饰器标记自定义组件为可复用组件，用于列表等场景中提高性能。

```typescript
@Reusable
@Component
struct ReusableItem {
  @State itemText: string = '';

  // 复用时的初始化回调
  aboutToReuse(params: Record<string, Object>): void {
    this.itemText = params.text as string;
  }

  build() {
    Row() {
      Text(this.itemText)
        .fontSize(20)
    }
    .padding(10)
  }
}

// 使用
@Entry
@Component
struct MyList {
  @State items: string[] = Array(100).fill('').map((_, i) => `Item ${i}`);

  build() {
    List() {
      // 使用 reusableComponent 标识复用
      ForEach(this.items, (item: string) => {
        ListItem() {
          ReusableItem({ itemText: item })
            .reuseId('reusable_item')  // 可选：指定复用组 ID
        }
      }, (item: string) => item)
    }
  }
}
```

### 2.4 组件生命周期

```
aboutToAppear() → build() → onPageShow() ↔ onPageHide() → aboutToDisappear()

详细流程:
┌────────────────┐
│ aboutToAppear  │ 组件即将挂载 (初始化状态变量后)
└───────┬────────┘
        │
┌───────▼────────┐
│     build()     │ 组件构建 UI
└───────┬────────┘
        │
┌───────▼────────┐
│   onPageShow    │ 页面显示 (仅 @Entry 组件)
└───────┬────────┘
        │
  ┌─────┴─────┐
  │           │
  ▼           ▼
(onPageHide) │  页面隐藏
  │           │
  └─────┬─────┘
        │
┌───────▼────────┐
│aboutToDisappear│ 组件即将销毁
└────────────────┘
```

---

## 3. @Builder 和 @BuilderParam 装饰器

### 3.1 @Builder 装饰器

`@Builder` 用于定义组件内的 UI 构建函数，可以抽离重复 UI 结构。

**全局 Builder**:

```typescript
// 全局复用 UI 片段
@Builder function GlobalText(text: string) {
  Text(text)
    .fontSize(20)
    .fontColor(Color.Blue)
    .margin(5)
}

@Entry
@Component
struct MyComponent {
  build() {
    Column() {
      GlobalText('第一行')   // 调用全局 Builder
      GlobalText('第二行')
    }
  }
}
```

**组件内 Builder**:

```typescript
@Component
struct MyComponent {
  @State count: number = 0;

  // 组件内 Builder，可以访问组件状态
  @Builder CustomText(text: string) {
    Text(`[${text}]: ${this.count}`)
      .fontSize(18)
      .padding(10)
  }

  build() {
    Column() {
      // 使用 this 调用
      this.CustomText('当前计数')
      Button('增加').onClick(() => {
        this.count++;
      })
    }
  }
}
```

**@Builder 传参规则**：

```typescript
// 支持按值传递和按引用传递
@Builder function PriceLabel({ price: number, discount: number }) {
  Text(`原价: ${price}, 折后: ${price * discount}`)
}

// 按引用传递 (对象)
@Builder function renderItem(item: Item) {
  Text(item.name)
}

// 调用
// 传值: PriceLabel({ price: 100, discount: 0.8 })
// 对象: renderItem({ item: this.currentItem })
```

### 3.2 @BuilderParam 装饰器

`@BuilderParam` 用于接收外部传入的 Builder 函数，实现类似 "插槽" 的效果。

```typescript
@Component
struct CustomContainer {
  // 接收外部传入的 Builder
  @BuilderParam content: () => void;

  // 可选：提供默认 Builder
  @Builder defaultContent() {
    Text('默认内容')
      .fontSize(16)
  }

  build() {
    Column() {
      // 渲染 BuilderParam
      this.content()
    }
    .padding(10)
    .backgroundColor(Color.Gray)
  }
}

// 使用
@Entry
@Component
struct Parent {
  @Builder customText() {
    Column() {
      Text('自定义内容行1')
      Text('自定义内容行2')
    }
  }

  build() {
    Column() {
      // 传入 Builder 引用
      CustomContainer({ content: this.customText })
    }
  }
}
```

**@BuilderParam 传参变体**：

```typescript
@Component
struct ListContainer {
  @BuilderParam itemBuilder: (item: string, index: number) => void;
  @State items: string[] = ['A', 'B', 'C'];

  build() {
    Column() {
      ForEach(this.items, (item: string, index: number) => {
        this.itemBuilder(item, index)
      })
    }
  }
}

// 带参数的 Builder
@Builder function itemTemplate(item: string, index: number) {
  Row() {
    Text(`${index}. ${item}`)
    Button('详情').onClick(() => {
      console.info('Selected: ' + item);
    })
  }
}
```

---

## 4. @Styles 和 @Extend 装饰器

### 4.1 @Styles 装饰器 (通用样式复用)

`@Styles` 用于定义可复用的样式函数，避免代码重复。

**全局 @Styles**:

```typescript
// 定义全局样式
@Styles function globalCardStyle() {
  .padding(16)
  .backgroundColor(Color.White)
  .borderRadius(12)
  .shadow({ radius: 4, color: '#1A000000', offsetX: 0, offsetY: 2 })
}

@Entry
@Component
struct MyPage {
  build() {
    Column() {
      Text('卡片1')
        .globalCardStyle()   // 应用全局样式

      Text('卡片2')
        .globalCardStyle()
    }
  }
}
```

**组件内 @Styles**:

```typescript
@Component
struct CardComponent {
  // 组件内样式函数
  @Styles cardStyle() {
    .padding(16)
    .backgroundColor(Color.White)
    .borderRadius(8)
  }

  @Styles titleStyle() {
    .fontSize(20)
    .fontWeight(FontWeight.Bold)
  }

  build() {
    Column() {
      Text('卡片标题')
        .titleStyle()

      Text('卡片内容')
        .fontSize(14)
        .fontColor('#666666')

      Button('确认')
        .cardStyle()
    }
    .cardStyle()
  }
}
```

**@Styles 使用规则**：

| 规则 | 说明 |
|------|------|
| 仅支持通用属性 | 不支持 `width`、`height` 等独有属性 |
| 无参数 | 不能定义入参 |
| 可全局/局部 | `@Styles` 修饰 function 或组件内方法 |
| 不支持条件 | 不能包含 `if` 等逻辑控制 |

### 4.2 @Extend 装饰器 (特定组件样式扩展)

`@Extend` 用于为特定组件类型扩展样式方法。

```typescript
// 为 Text 组件扩展样式
@Extend(Text) function headingStyle(level: number = 1) {
  .fontSize(level === 1 ? 28 : 24)
  .fontWeight(FontWeight.Bold)
  .fontColor('#1A1A1A')
  .lineHeight(level === 1 ? 40 : 36)
}

// 为 Button 组件扩展样式
@Extend(Button) function primaryButton() {
  .width('100%')
  .height(48)
  .backgroundColor('#007DFF')
  .borderRadius(24)
  .fontColor(Color.White)
  .fontSize(16)
}

@Entry
@Component
struct MyPage {
  build() {
    Column() {
      Text('一级标题')
        .headingStyle(1)   // 适用于 Text 组件

      Text('二级标题')
        .headingStyle(2)

      Button('主按钮')
        .primaryButton()   // 适用于 Button 组件
    }
    .padding(20)
  }
}
```

**@Extend 与 @Styles 对比**：

| 对比维度 | @Extend | @Styles |
|---------|---------|--------|
| 目标组件 | 指定特定组件类型 | 任意组件 |
| 参数支持 | 支持参数 | 不支持参数 |
| 独有属性 | 支持组件的独有属性 | 仅通用属性 |
| 定义方式 | 全局定义 | 全局/组件内 |

---

## 5. ArkTS 编程规范

### 5.1 命名规范

| 项 | 规范 | 示例 |
|----|------|------|
| 组件名 | PascalCase | `struct MyComponent` |
| 文件名 | PascalCase (组件文件), camelCase (工具文件) | `Index.ets`, `stringUtils.ts` |
| 变量/属性 | camelCase | `userName`, `isVisible` |
| 方法/函数 | camelCase | `getUserInfo()`, `handleClick()` |
| 常量 | UPPER_SNAKE_CASE | `MAX_COUNT`, `API_BASE_URL` |
| 枚举 | PascalCase | `enum ColorType` |
| 接口 | PascalCase (I 前缀可选) | `UserInfo`, `IUserInfo` |
| 类型别名 | PascalCase | `type UserMap = Map<string, User>` |

### 5.2 代码组织

```
// 1. 模块导入
import { router } from '@kit.ArkUI';
import { BusinessConstants } from '../common/constants';

// 2. 常量定义
const PAGE_SIZE: number = 20;
const DEFAULT_ICON: Resource = $r('app.media.icon');

// 3. 接口/类型定义
interface UserData {
  name: string;
  age: number;
}

// 4. 组件定义
@Entry
@Component
struct UserPage {
  // 4.1 状态变量
  @State users: UserData[] = [];

  // 4.2 普通变量
  private pageTitle: string = '用户列表';

  // 4.3 生命周期
  aboutToAppear(): void {
    this.loadUsers();
  }

  // 4.4 构建函数
  build() {
    // ...
  }

  // 4.5 私有方法
  private loadUsers(): void {
    // ...
  }
}
```

### 5.3 组件最佳实践

**推荐**:
- 单一职责：每个组件只做一件事
- 状态提升：共享状态提升到公共父组件
- 合理拆分：组件超过 200 行考虑拆分
- 命名语义化：组件名、事件名语义清晰
- 类型安全：避免使用 `any`

**避免**:
- 在 `build()` 中执行复杂计算
- 过度使用 `@State`，优先使用普通变量
- 在组件内直接修改 `@Prop` 修饰的变量
- 在子组件中直接调用 `router` API

### 5.4 性能优化建议

```typescript
// 推荐：使用 LazyForEach 代替 ForEach 处理大量数据
// 推荐：使用 @Reusable 复用列表项组件
// 推荐：使用 if/else 代替 visibility 控制显隐
// 推荐：使用常量 Builder 抽取重复 UI 结构

// 避免：
// ❌ build() 中创建函数对象或数组字面量
build() {
  Column() {
    ForEach(
      [1, 2, 3],  // ❌ 每次 build 都创建新数组
      (item) => Text(`${item}`)
    )
  }
}

// ✅ 将数据提取为状态变量
@State numbers: number[] = [1, 2, 3];

build() {
  Column() {
    ForEach(this.numbers, (item) => Text(`${item}`))
  }
}
```

---

## 6. 语法适配背景

### 6.1 ArkTS 与 TypeScript 的关系

ArkTS 是基于 TypeScript 的子集，对 TypeScript 进行了裁剪和增强：

| 方面 | TypeScript | ArkTS |
|------|-----------|-------|
| 类型系统 | 强类型 | 强类型 (更严格) |
| `any` 类型 | 允许 | **禁止** |
| 动态操作 | 允许 | **禁止** (如 `obj.prop = val` 动态添加属性) |
| 装饰器 | 实验性 | **原生支持** |
| 函数重载 | 支持 | 有限支持 |
| JSX/TSX | 支持 | 不支持 (使用自定义语法) |
| 声明式 UI | 无 | **原生声明式 UI** |
| 运算符 | 标准 TS | 新增 `??`, `?.`, `!` 等 |

### 6.2 适配规则

**基本规则**：
- 禁止使用 `any`，使用特定类型或 `Object` / `unknown`
- 禁止在运行时通过赋值修改变量类型
- 禁止使用 `var`，使用 `let` / `const`
- 禁止动态添加对象属性

**从 JS/TS 迁移**：

```typescript
// ❌ JS 动态风格
const obj = {};
obj.name = 'test';  // 不允许

// ✅ ArkTS 静态风格
interface Data {
  name: string;
}
const obj: Data = { name: 'test' };

// ❌ 使用 any
function process(data: any) { }  // 不允许

// ✅ 使用具体类型
function process(data: string | number) { }
```

### 6.3 类型约束增强

ArkTS 对类型系统做了以下增强：

```typescript
// 严格空检查
let value: string | null = null;  // 必须显式声明 null

// 类型守卫
function process(value: string | number): void {
  if (typeof value === 'string') {
    // 这里 value 被自动推导为 string
    console.info(value.length);
  }
}

// 字面量类型
type Direction = 'left' | 'right' | 'top' | 'bottom';
function move(direction: Direction): void {
  // direction 只能是四种值之一
}

// 只读数组
@State items: ReadonlyArray<string> = ['a', 'b', 'c'];
// 不能调用 items.push(), items.splice() 等修改方法
// 必须通过重新赋值来更新
```

---

## 参考资料

- [ArkTS 编程规范](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/arkts-coding-style-guide-V5)
- [声明式 UI 基本语法](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-ui-paradigm-basic-syntax-V5)
- [创建自定义组件](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-create-custom-components-V5)
- [@Builder](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-builder-V5)
- [@BuilderParam](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-builderparam-V5)
- [语法适配背景](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-migration-background-V5)
