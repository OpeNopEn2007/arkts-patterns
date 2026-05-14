# 状态管理

> HarmonyOS NEXT (API 12) ArkTS 状态管理完整参考

---

## 1. V1 装饰器总览

### 1.1 装饰器分类总览

| 装饰器 | 类型 | 作用范围 | 数据流向 | 说明 |
|--------|------|---------|---------|------|
| `@State` | 组件内部 | 组件自身 | 内部驱动 | 组件内部状态，变化自动刷新 UI |
| `@Prop` | 父子传递 | 子组件 | 单向 (父->子) | 父组件传入，子组件不能修改后同步回父组件 |
| `@Link` | 父子传递 | 子组件 | 双向 | 父组件传入，子组件修改同步回父组件 |
| `@Provide` | 跨层级 | 提供者 | 向下提供 | 向子孙组件提供数据 |
| `@Consume` | 跨层级 | 消费者 | 向上接收 | 接收祖先组件提供的数据 |
| `@Observed` | 装饰类 | 类定义 | - | 标记类为可观察，配合 @ObjectLink 使用 |
| `@ObjectLink` | 跨层级 | 子组件 | 双向 | 接收 @Observed 装饰类的嵌套对象 |
| `@Watch` | 监听器 | 任意状态变量 | - | 监听状态变量变化，触发回调 |
| `@Track` | 装饰类字段 | 类字段 | - | 精确控制 @State 装饰类的哪些字段触发 UI 刷新 |

### 1.2 装饰器选择决策流程图

```
                  需要状态管理?
                        │
                   ┌─────┴─────┐
                   │           │
                是 (状态)    否 (普通变量)
                   │           │
          状态是组件内部可见?    不装饰
              ┌┴┐
            是  否 (需跨组件)
             │     │
           @State 需要跨几层?
             │     ├────────┬─────────┐
             │     │        │         │
             │    1层       │ 多层 (提供/消费)
             │     │        │         │
             │ 单向还是双向?  │  @Provide
             │  ┌┴┐        │  @Consume
             │  │ │        │
             │ 是  否       │
             │  │   │      │
             │ @Link @Prop  │
             │              │
        需要监听变化?
         ┌┴┐
        是 否
         │  │
      @Watch 结束
```

---

## 2. 各装饰器详细说明

### 2.1 @State

组件内部状态变量，变化时自动触发 UI 重新渲染。

```typescript
@Component
struct Counter {
  @State count: number = 0;          // 基本类型
  @State message: string = 'Hello';  // 字符串
  @State isActive: boolean = true;   // 布尔
  @State items: number[] = [1, 2, 3]; // 数组
  @State config: Config = {          // 对象（仅装饰类会触发深层次刷新）
    theme: 'light',
    fontSize: 14
  };

  build() {
    Column() {
      Text(`计数: ${this.count}`)
      Text(`消息: ${this.message}`)
      Text(`状态: ${this.isActive ? '活跃' : '非活跃'}`)

      ForEach(this.items, (item: number) => {
        Text(`项目: ${item}`)
      })

      Button('增加').onClick(() => {
        this.count++;  // 直接修改触发 UI 刷新
        this.items = [...this.items, 4];  // 数组需重新赋值
      })
    }
  }
}
```

**@State 规则**:
- 支持的类型: `number`, `string`, `boolean`, `enum`, `object`, `array`, `class`
- 不支持 `undefined` 和 `null` (必须赋初始值)
- 对象类型只有重新赋值才会触发刷新 (除非使用了 `@Observed`)
- 数组修改必须通过重新赋值方式 (不可变更新)

### 2.2 @Prop

父组件向子组件传递数据的单向数据流。

```typescript
// 父组件
@Component
struct ParentComponent {
  @State parentCount: number = 10;

  build() {
    Column() {
      Text(`父组件计数: ${this.parentCount}`)
      ChildComponent({ count: this.parentCount })
      Button('修改父组件值').onClick(() => {
        this.parentCount++;
      })
    }
  }
}

// 子组件
@Component
struct ChildComponent {
  @Prop count: number;  // 从父组件接收

  build() {
    Column() {
      Text(`子组件收到: ${this.count}`)
      Button('修改子组件值')
        .onClick(() => {
          // 可以修改，但不会同步回父组件
          // this.count = 100; // 子组件可以修改，但不影响父组件
        })
    }
  }
}
```

**@Prop 规则**:
- 父组件变量变化会自动同步到子组件
- 子组件内可以修改，但不会同步回父组件
- 支持类型: 同 `@State`，但不能是 `Map`, `Set` 等
- 子组件的 `@Prop` 变量是父组件的副本，非引用

### 2.3 @Link

父子组件之间的双向数据同步。

```typescript
// 父组件
@Component
struct ParentComponent {
  @State count: number = 0;

  build() {
    Column() {
      Text(`父组件计数: ${this.count}`)
      // $ 语法传递引用
      ChildComponent({ count: $count })
      Button('父组件增加').onClick(() => {
        this.count++;
      })
    }
  }
}

// 子组件
@Component
struct ChildComponent {
  @Link count: number;  // 通过 $ 语法建立双向绑定

  build() {
    Column() {
      Text(`子组件计数: ${this.count}`)
      Button('子组件增加').onClick(() => {
        this.count++;  // 修改会同步回父组件
      })
    }
  }
}
```

**@Link 规则**:
- 父组件必须使用 `$` 语法传递（如 `{ count: $count }`）
- 子组件修改会同步回父组件
- 支持类型: 同 `@State`
- 不能用于 `@Entry` 组件的入口页面
- 不能修饰 `Map`, `Set`, `Date` 类型

**`$` 语法详解**:

```
$ 语法用于创建状态变量的引用，主要用于:
1. @Link 传递: { count: $count }
2. 组件双向绑定: TextInput({ text: $name })
3. $$ 运算符: 系统组件双向同步
```

### 2.4 @Provide 和 @Consume

跨组件层级的状态共享，不需要逐层传递。

```typescript
// 祖先组件 (提供者)
@Component
struct GrandParent {
  @Provide("themeColor") themeColor: string = '#007DFF';
  @Provide count: number = 0;  // 使用变量名作为 key

  build() {
    Column() {
      ChildComp()
      Button('修改主题色')
        .onClick(() => {
          this.themeColor = '#FF6B00';
        })
    }
  }
}

// 中间组件 (不需要消费，自动透传)
@Component
struct ChildComp {
  build() {
    Column() {
      GrandChildComp()
    }
  }
}

// 后代组件 (消费者)
@Component
struct GrandChildComp {
  @Consume("themeColor") themeColor: string;  // 按 key 消费
  @Consume count: number;                      // 按变量名消费

  build() {
    Column() {
      Text(`主题色: ${this.themeColor}`)
        .fontColor(Color.Blue)
      Text(`计数: ${this.count}`)
      Button('增加计数')
        .onClick(() => {
          this.count++;  // 修改会同步回提供者
        })
    }
  }
}
```

**@Provide/@Consume 规则**:
- 可以指定 key (字符串) 或使用变量名作为 key
- `@Consume` 必须能在祖先组件中找到对应的 `@Provide`
- 消费者修改会同步回提供者
- 支持跨任意层级

### 2.5 @Observed 和 @ObjectLink

用于深层嵌套对象的双向同步。

```typescript
// 定义可观察类
@Observed
class Person {
  name: string;
  age: number;

  constructor(name: string, age: number) {
    this.name = name;
    this.age = age;
  }
}

// 列表组件
@Component
struct PersonList {
  @State persons: Person[] = [];

  aboutToAppear(): void {
    this.persons = [
      new Person('张三', 25),
      new Person('李四', 30)
    ];
  }

  build() {
    Column() {
      ForEach(this.persons, (person: Person, index: number) => {
        PersonCard({ person: person })
      })
    }
  }
}

// 子组件接收 @Observed 对象的引用
@Component
struct PersonCard {
  @ObjectLink person: Person;  // 必须配合 @Observed 类

  build() {
    Row() {
      Text(`${this.person.name} - ${this.person.age}岁`)
        .fontSize(18)

      Button('年龄+1')
        .onClick(() => {
          this.person.age++;  // 直接修改属性，自动触发刷新
        })
    }
    .margin(10)
  }
}
```

**@Observed/@ObjectLink 规则**:
- `@Observed` 用于 class 定义，使类实例可观察
- `@ObjectLink` 用于接收 `@Observed` 实例
- 修改 `@ObjectLink` 对象的属性会触发 UI 刷新
- 不能用于 `@Entry` 组件
- 只能接收类实例，不能用于普通对象字面量

### 2.6 @Watch

监听状态变量变化，变化时执行回调函数。

```typescript
@Component
struct WatchExample {
  @State @Watch('onCountChanged') count: number = 0;
  @State @Watch('onNameChanged') name: string = '';

  // @Watch 回调函数
  onCountChanged(): void {
    console.info(`count 从旧值变为: ${this.count}`);
    if (this.count > 10) {
      console.info('count 超过阈值');
    }
  }

  onNameChanged(): void {
    console.info(`name 变为: ${this.name}`);
    this.validateName();
  }

  private validateName(): void {
    if (this.name.length > 20) {
      console.warn('名称过长');
    }
  }

  build() {
    Column() {
      Text(`计数: ${this.count}`)
      Button('增加').onClick(() => this.count++)
      TextInput({ text: $$this.name })
        .margin({ top: 20 })
    }
  }
}
```

**@Watch 规则**:
- 不能获取旧值，只能访问当前值
- 回调在状态变量变化后触发
- 多个 `@Watch` 回调按装饰顺序执行
- 回调中不要做耗时操作
- 可以同时使用 `@Watch` 和其他状态装饰器

### 2.7 @Track

精确控制 `@State` 装饰的类中哪些字段触发 UI 刷新。

```typescript
class Person {
  @Track name: string;   // 只有 name 变化才触发刷新
  @Track age: number;    // 只有 age 变化才触发刷新
  phone: string;          // phone 变化不会触发刷新

  constructor(name: string, age: number, phone: string) {
    this.name = name;
    this.age = age;
    this.phone = phone;
  }
}

@Component
struct TrackExample {
  @State person: Person = new Person('张三', 25, '1380000000');

  build() {
    Column() {
      Text(`姓名: ${this.person.name}`)
      Text(`年龄: ${this.person.age}`)
      Text(`电话: ${this.person.phone}`)

      Button('修改姓名').onClick(() => {
        this.person.name = '李四';  // 触发 UI 刷新
      })
      Button('修改电话').onClick(() => {
        this.person.phone = '1390000000';  // 不触发 UI 刷新
      })
    }
  }
}
```

**@Track 规则**:
- 只能用于 `@State` 变量的类字段
- 只有被 `@Track` 标记的字段变化才会触发 UI 刷新
- 未标记的字段修改不影响渲染性能
- 用于优化大数据对象的渲染性能

---

## 3. @Link + `$` 语法详解

### 3.1 `$` 语法基础

`$` 前缀用于获取状态变量的引用，实现双向绑定。

```typescript
@Component
struct Parent {
  @State text: string = '初始值';
  @State switchOn: boolean = false;
  @State sliderValue: number = 50;

  build() {
    Column() {
      // 1. 系统组件双向绑定
      TextInput({ text: $$this.text })
        .height(40)

      // 2. Switch 双向绑定
      Switch({ isOn: $$this.switchOn })

      // 3. Slider 双向绑定
      Slider({ value: $$this.sliderValue })

      // 4. @Link 传递
      ChildComponent({ value: $this.text })

      Text(`当前文本: ${this.text}`)
      Text(`开关状态: ${this.switchOn}`)
    }
    .padding(20)
  }
}

@Component
struct ChildComponent {
  @Link value: string;

  build() {
    TextInput({ text: $$this.value })
      .height(40)
  }
}
```

### 3.2 `$` 的使用场景总结

| 场景 | 语法 | 示例 |
|------|------|------|
| @Link 传递 | `$变量` | `Child({ count: $count })` |
| 系统组件双向绑定 | `$$变量` | `TextInput({ text: $$name })` |
| 组件内 $$ 语法 | `$$this.变量` | `$$this.switchOn` |

---

## 4. 不可变数组更新规则

ArkTS 状态管理中，数组必须以不可变方式更新，即必须创建新数组重新赋值。

### 4.1 数组更新规则

```typescript
@Component
struct ArrayExample {
  @State items: number[] = [1, 2, 3, 4, 5];

  build() {
    Column() {
      Text(`数组长度: ${this.items.length}`)
      ForEach(this.items, (item: number) => {
        Text(`Item: ${item}`)
      })

      Button('添加元素').onClick(() => this.addItem(6))
      Button('删除元素').onClick(() => this.removeItem(2))
      Button('过滤').onClick(() => this.filterItems())
      Button('映射').onClick(() => this.mapItems())
      Button('排序').onClick(() => this.sortItems())
      Button('替换').onClick(() => this.replaceItem(0, 99))
    }
  }

  // ✅ 添加元素: 使用展开运算符
  private addItem(newItem: number): void {
    this.items = [...this.items, newItem];
  }

  // ✅ 删除元素: 使用 filter
  private removeItem(index: number): void {
    this.items = this.items.filter((_, i) => i !== index);
  }

  // ✅ 过滤元素
  private filterItems(): void {
    this.items = this.items.filter(item => item > 2);
  }

  // ✅ 映射转换
  private mapItems(): void {
    this.items = this.items.map(item => item * 10);
  }

  // ✅ 排序
  private sortItems(): void {
    this.items = [...this.items].sort((a, b) => b - a);
  }

  // ✅ 替换指定位置
  private replaceItem(index: number, newValue: number): void {
    this.items = this.items.map((item, i) => i === index ? newValue : item);
  }
}
```

### 4.2 禁止的操作

```typescript
// ❌ 禁止: 直接调用修改方法
this.items.push(6);        // 不触发 UI 刷新
this.items.splice(1, 1);   // 不触发 UI 刷新
this.items[0] = 99;        // 不触发 UI 刷新
this.items.length = 0;     // 不触发 UI 刷新

// ✅ 正确: 创建新数组重新赋值
this.items = [...this.items, 6];                    // 添加
this.items = this.items.filter((_, i) => i !== 1);  // 删除
this.items = this.items.map((item, i) => i === 0 ? 99 : item);  // 替换
this.items = [];                                     // 清空
```

### 4.3 常用不可变操作速查表

| 操作 | 不可变写法 |
|------|-----------|
| 末尾添加 | `[...arr, item]` |
| 开头添加 | `[item, ...arr]` |
| 删除指定索引 | `arr.filter((_, i) => i !== idx)` |
| 替换指定索引 | `arr.map((item, i) => i === idx ? newVal : item)` |
| 更新对象数组中某项 | `arr.map(item => item.id === id ? {...item, ...updates} : item)` |
| 排序 | `[...arr].sort(compareFn)` |
| 反转 | `[...arr].reverse()` |
| 截取前 N 个 | `arr.slice(0, n)` |

---

## 5. 双向同步运算符 `$$`

### 5.1 $$ 运算符概述

`$$` 是 ArkTS 提供的双向同步运算符，主要用于系统组件和自定义组件的双向数据绑定。

```typescript
@Component
struct TwoWayBindingExample {
  @State text: string = '';
  @State fontSize: number = 16;
  @State isChecked: boolean = false;

  build() {
    Column() {
      // 系统组件双向绑定
      TextInput({ text: $$this.text })
        .placeholder('请输入文字')

      Slider({ value: $$this.fontSize, min: 12, max: 32 })
        .blockColor(Color.Blue)

      Checkbox({ name: 'agree', group: 'terms' })
        .select($$this.isChecked)

      // 展示绑定值
      Text(this.text)
        .fontSize(this.fontSize)

      Text(`选中: ${this.isChecked}`)
    }
    .padding(20)
  }
}
```

### 5.2 $$ 支持的系统组件

| 组件 | $$ 绑定属性 | 说明 |
|------|-----------|------|
| `TextInput` | `text` | 文本输入 |
| `TextArea` | `text` | 多行文本输入 |
| `Checkbox` | `select` | 复选框选中状态 |
| `Switch` | `isOn` | 开关状态 |
| `Slider` | `value` | 滑动条值 |
| `Rating` | `rating` | 评分组件 |
| `Search` | `value` | 搜索框 |
| `DatePicker` | `selectedDate` | 日期选择 |
| `TimePicker` | `selectedTime` | 时间选择 |

### 5.3 V2 中的 `!!` 双向绑定

在 V2 装饰器 (API 12+) 中，使用 `!!` 前缀代替 `$$`：

```typescript
// V2 装饰器中的双向绑定语法
@Entry
@ComponentV2
struct V2Example {
  @Local text: string = 'Hello';

  build() {
    Column() {
      // V2 中使用 !! 前缀实现双向绑定
      TextInput({ text: !!this.text })
    }
  }
}
```

**对比总结**:

| 版本 | 语法 | 适用装饰器 |
|------|------|-----------|
| V1 | `$$变量` | `@State`, `@Link`, `@Prop` |
| V2 | `!!变量` | `@Local`, `@Param` |

---

## 6. PersistentStorage (持久化 UI 状态)

### 6.1 PersistentStorage 概述

`PersistentStorage` 用于将选定的状态持久化到本地存储，应用重启后自动恢复。

```typescript
import { PersistentStorage } from '@kit.ArkUI';

// 1. 初始化持久化存储
PersistentStorage.persistProp('userName', '默认用户');
PersistentStorage.persistProp('themeMode', 'light');
PersistentStorage.persistProp('count', 0);

@Entry
@Component
struct PersistentExample {
  // 2. 使用 @StorageLink 或 @StorageProp 读取
  @StorageLink('userName') userName: string = '';  // 双向同步
  @StorageProp('themeMode') themeMode: string = ''; // 单向读取
  @StorageLink('count') count: number = 0;

  build() {
    Column() {
      Text(`用户名: ${this.userName}`)
      Text(`主题: ${this.themeMode}`)
      Text(`计数: ${this.count}`)

      Button('修改用户名')
        .onClick(() => {
          this.userName = '新的用户名';  // 修改时自动持久化
        })

      Button('增加计数')
        .onClick(() => {
          this.count++;
        })
    }
  }
}
```

### 6.2 存储范围对比

| 存储方案 | 作用域 | 生命周期 | 特点 |
|---------|--------|---------|------|
| `PersistentStorage` | 应用全局 | 应用卸载前持久 | UI 状态持久化 |
| `AppStorage` | 应用进程 | 进程内全局共享 | 单例状态存储 |
| `LocalStorage` | 页面级 | 页面内共享 | 页面级状态共享 |
| Preferences | 应用全局 | 永久保持 | 通用 Key-Value 存储 |
| KV-Store | 应用全局 | 永久保持 | 分布式数据库 |

### 6.3 AppStorage (应用全局 UI 状态)

```typescript
// AppStorage 不需要持久化，随进程生命周期
AppStorage.setOrCreate('isLogin', false);
AppStorage.setOrCreate('userInfo', {});

@Component
struct AppStorageExample {
  @StorageLink('isLogin') isLogin: boolean = false;

  build() {
    Column() {
      if (this.isLogin) {
        Text('已登录')
      } else {
        Text('未登录')
      }
      Button('登录')
        .onClick(() => {
          this.isLogin = true;  // 同步到 AppStorage
        })
    }
  }
}
```

### 6.4 LocalStorage (页面级状态共享)

```typescript
// 创建页面级存储
let pageStorage = new LocalStorage();

@Entry(pageStorage)  // 关联 LocalStorage
@Component
struct LocalStorageExample {
  @LocalStorageProp('pageTitle') pageTitle: string = '默认标题';
  @LocalStorageLink('pageCount') pageCount: number = 0;

  build() {
    Column() {
      Text(this.pageTitle)
        .fontSize(24)

      Text(`页面计数: ${this.pageCount}`)

      Button('增加页面计数')
        .onClick(() => {
          this.pageCount++;
        })
    }
  }
}
```

---

## 7. V2 装饰器 (API 12)

### 7.1 V2 装饰器总览

| V2 装饰器 | 对应 V1 | 说明 |
|-----------|---------|------|
| `@ComponentV2` | `@Component` | V2 组件装饰器 |
| `@ObservedV2` | `@Observed` | V2 可观察类 |
| `@Trace` | - | 装饰类中需要跟踪的字段 |
| `@Local` | `@State` | 组件本地状态 |
| `@Param` | `@Prop` / `@Link` | 父组件传入参数 |
| `@Once` | - | 仅初始化时接收一次 |
| `@Event` | - | 回调事件传递给父组件 |
| `@Monitor` | `@Watch` | 监听状态变化 |

### 7.2 V2 与 V1 对比

| 对比维度 | V1 | V2 |
|---------|-----|-----|
| 组件装饰 | `@Component` | `@ComponentV2` |
| 本地状态 | `@State` | `@Local` |
| 父传参数 | `@Prop` / `@Link` | `@Param` |
| 类追踪 | `@Observed` | `@ObservedV2` `+ @Trace` |
| 字段追踪 | 整个对象 | `@Trace` 精确追踪 |
| 回调传递 | 自行定义 | `@Event` |
| 初始化限制 | 无 | `@Once` 限制初始化 |
| 双向绑定 | `$$` | `!!` |
| 监听器 | `@Watch` | `@Monitor` |

### 7.3 V2 代码示例

```typescript
// V2 可观察类
@ObservedV2
class User {
  @Trace name: string = '';      // 只追踪 name
  @Trace age: number = 0;        // 只追踪 age
  email: string = '';            // 不追踪，变化不触发 UI
}

// V2 组件
@ComponentV2
struct UserCard {
  @Local localCount: number = 0;              // 本地状态
  @Param user: User;                           // 父组件传入
  @Param @Once title: string = '默认标题';      // 仅初始化接收一次
  @Event onClick: () => void = (() => {});     // 回调事件

  // 状态监听
  @Monitor('user.name')
  onNameChange(monitor: IMonitor): void {
    console.info(`name changed from ${monitor.dirty()[0]} to ${this.user.name}`);
  }

  build() {
    Column() {
      Text(`${this.title}: ${this.user.name}, ${this.user.age}岁`)
        .fontSize(20)

      Button('年龄+1')
        .onClick(() => {
          this.user.age++;   // 触发 UI 刷新
          this.onClick();    // 触发父组件回调
        })
    }
  }
}

// 使用 V2
@Entry
@ComponentV2
struct V2Page {
  @Local users: User[] = [
    new User('张三', 25),
    new User('李四', 30)
  ];

  build() {
    Column() {
      ForEach(this.users, (user: User) => {
        UserCard({
          user: user,
          title: '用户信息',
          onClick: () => {
            console.info('点击了用户卡片');
          }
        })
      })

      TextInput({ text: !!this.users[0].name })  // V2 !! 语法双向绑定
    }
  }
}
```

### 7.4 何时使用 V2

| 场景 | 推荐版本 | 原因 |
|------|---------|------|
| 新项目 (API 12+) | V2 | 更精确的性能追踪 |
| 嵌套对象频繁修改 | V2 | `@Trace` 精确控制字段刷新 |
| 需要 @Event 模式 | V2 | `@Event` 简化回调传递 |
| 兼容旧版本 | V1 | API 11 及以下仅 V1 |
| 与三方库兼容 | V1 | 多数三方库基于 V1 |

---

## 8. 状态管理最佳实践

### 8.1 状态设计原则

1. **最小化状态**：只将需要触发 UI 刷新的变量标记为状态
2. **适当提升状态**：多个组件共享的状态提升到最近公共父组件
3. **单向数据流优先**：优先使用单向数据流 (`@Prop`)，仅在必要时使用 `@Link`
4. **避免过度观察**：使用 `@Track` / `@Trace` 精确控制观察范围

### 8.2 性能优化

```typescript
// ✅ 推荐：使用 @Track 减少不必要的刷新
@Observed
class LargeData {
  @Track id: number;
  @Track name: string;
  description: string;  // 不跟踪，变化不刷新

  constructor(id: number, name: string, desc: string) {
    this.id = id;
    this.name = name;
    this.description = desc;
  }
}

// ✅ 推荐：数组不可变更新
this.items = [...this.items, newItem];

// ✅ 推荐：大数据列表使用 LazyForEach
// LazyForEach(this.dataSource, (item) => {
//   ListItem() { ItemComponent({ data: item }) }
// })

// ❌ 避免：频繁修改 @State 对象属性
// this.obj.key = value; // 不触发刷新
// ✅ 应该: this.obj = { ...this.obj, key: value };
```

### 8.3 常见模式

**模式 1: 状态提升**

```typescript
// 将共享状态提升到父组件
@Component
struct Parent {
  @State sharedValue: string = '';

  build() {
    Column() {
      ChildA({ value: $sharedValue })
      ChildB({ value: $sharedValue })
    }
  }
}
```

**模式 2: 容器-展示组件分离**

```typescript
// 容器组件 (管理状态)
@Component
struct UserContainer {
  @State users: User[] = [];

  build() {
    Column() {
      UserList({ users: this.users })
    }
  }
}

// 展示组件 (接收 props, 回调)
@Component
struct UserList {
  @Prop users: User[];

  build() {
    ForEach(this.users, (user: User) => {
      Text(user.name)
    })
  }
}
```

**模式 3: 可观察数据模型**

```typescript
// 统一的数据模型层
@Observed
export class AppModel {
  @Track isLoggedIn: boolean = false;
  @Track userName: string = '';

  login(name: string): void {
    this.isLoggedIn = true;
    this.userName = name;
  }

  logout(): void {
    this.isLoggedIn = false;
    this.userName = '';
  }
}
```

### 8.4 状态管理选择速查表

| 场景 | 推荐方案 |
|------|---------|
| 组件内部简单状态 | `@State` |
| 父子组件单向传递 | `@Prop` |
| 父子组件双向同步 | `@Link` + `$` |
| 跨多层组件共享 | `@Provide` / `@Consume` |
| 深层嵌套对象追踪 | `@Observed` + `@ObjectLink` |
| 监听状态变化 | `@Watch` / `@Monitor` |
| 大数据对象精确追踪 | `@Track` / `@Trace` |
| 应用全局状态 | `AppStorage` |
| 持久化 UI 状态 | `PersistentStorage` + `@StorageLink` |
| 页面级共享 | `LocalStorage` |
| 系统组件双向绑定 | `$$` / `!!` |

---

## 9. 常见反模式

### 反模式 1: 状态滥用（所有变量都用 @State）

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

### 反模式 2: 深层嵌套对象未使用 @Observed

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

### 反模式 3: 过度使用全局状态（AppStorage 用于本地关注点）

```typescript
// ❌ Bad: 所有状态都放 AppStorage
AppStorage.setOrCreate('buttonText', 'Click me')  // 不应该是全局状态

// ✅ Good: 全局状态只用于真正需要共享的数据
AppStorage.setOrCreate('userToken', 'xxx')  // 合理的全局状态
AppStorage.setOrCreate('theme', 'dark')  // 合理的全局状态
```

---

## 10. 状态管理层次架构

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

原则：按作用域逐层选择，能小不大。优先使用低层级状态方案，避免将所有状态提升到 AppStorage。

---

## 参考资料

- [状态管理指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-state-management-V5)
- [状态管理最佳实践 (EN)](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/arkts-state-management-best-practices-V5)
- [$$ 双向同步](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-two-way-sync-V5)
- [PersistentStorage](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-persiststorage-V5)
- [V2 !! 语法双向绑定](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/arkts-new-binding-V5)
