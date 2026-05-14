# UI 组件与布局

> HarmonyOS NEXT (API 12) UI 组件与布局参考文档

---

## 目录

- [布局简介和布局能力总览](#布局简介和布局能力总览)
- [创建列表 (List + ListItem + LazyForEach)](#创建列表-list--listitem--lazyforeach)
- [ForEach 和 LazyForEach 渲染控制](#foreach-和-lazyforeach-渲染控制)
- [@Builder 和 @BuilderParam](#builder-和-builderparam)
- [自定义弹窗 API](#自定义弹窗-api)
- [WaterFlow 组件](#waterflow-组件)
- [常用组件](#常用组件)
- [组件命名规范](#组件命名规范)
- [组件设计原则与反模式](#组件设计原则与反模式)
- [实用组件封装模式](#实用组件封装模式)
- [表单组件模式](#表单组件模式)

---

## 布局简介和布局能力总览

HarmonyOS 提供了多种布局容器，开发者可根据界面设计需求选择合适的布局方式。

### 线性布局 (LinearLayout) - Row / Column

线性布局通过 **Row**（水平排列）和 **Column**（垂直排列）实现子组件沿单一方向排列。

```typescript
// 垂直排列
Column() {
  Text('Item 1')
  Text('Item 2')
  Text('Item 3')
}
.width('100%')
.justifyContent(FlexAlign.Center)  // 主轴对齐
.alignItems(HorizontalAlign.Center) // 交叉轴对齐

// 水平排列
Row() {
  Text('A')
  Text('B')
  Text('C')
}
```

### 层叠布局 (StackLayout) - Stack

**Stack** 允许子组件在 Z 轴上堆叠，后添加的组件默认出现在上方。

```typescript
Stack() {
  Rect().width(200).height(200).fill('#FFB6C1')
  Text('上层文字').fontSize(20).fontColor('#333')
}
.alignContent(Alignment.Center)
```

### 弹性布局 (FlexLayout) - Flex

**Flex** 提供更灵活的排列方式，支持 `wrap` 换行和 `FlexAlign` 对齐。

```typescript
Flex({
  direction: FlexDirection.Row,
  wrap: FlexWrap.Wrap,
  justifyContent: FlexAlign.SpaceBetween,
  alignItems: ItemAlign.Center
}) {
  Text('1').width(80).height(80)
  Text('2').width(80).height(80)
  Text('3').width(80).height(80)
  Text('4').width(80).height(80)
}
```

### 相对布局 (RelativeLayout) - RelativeContainer

**RelativeContainer** 允许子组件之间的相对定位，通过 `alignRules` 设置依赖关系。

```typescript
RelativeContainer() {
  Text('标题')
    .id('title')
    .alignRules({
      center: { anchor: '__container__', align: VerticalAlign.Center },
      middle: { anchor: '__container__', align: HorizontalAlign.Center }
    })
  Text('副标题')
    .id('subtitle')
    .alignRules({
      top: { anchor: 'title', align: VerticalAlign.Bottom },
      left: { anchor: 'title', align: HorizontalAlign.Start }
    })
}
```

### 栅格布局 (GridLayout) - GridCol / GridRow

栅格布局将屏幕划分为等宽的列，便于多设备适配。

```typescript
GridRow({
  columns: { sm: 4, md: 8, lg: 12 },
  gutter: { x: 16, y: 16 }
}) {
  GridCol({ span: { sm: 2, md: 4, lg: 6 } }) {
    Text('左栏')
  }
  GridCol({ span: { sm: 2, md: 4, lg: 6 } }) {
    Text('右栏')
  }
}
```

### 布局能力对比

| 布局类型 | 容器组件 | 适用场景 |
|---------|---------|---------|
| 线性布局 | Row / Column | 列表、表单、导航栏 |
| 层叠布局 | Stack | 悬浮按钮、徽章、遮罩层 |
| 弹性布局 | Flex | 多行标签、自适应排列 |
| 相对布局 | RelativeContainer | 复杂定位、仪表盘 |
| 栅格布局 | GridRow / GridCol | 媒体查询、多端适配 |

> **参考**: [布局简介](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/layout-intro-V5) | [布局能力总览](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/layout-V5)

---

## 创建列表 (List + ListItem + LazyForEach)

列表是 ArkTS 中最常用的可滚动容器，使用 **List** 配合 **ListItem** 或 **LazyForEach** 实现。

### 基础列表

```typescript
List({ space: 12, initialIndex: 0 }) {
  ForEach(this.dataArray, (item: string) => {
    ListItem() {
      Text(item)
        .width('100%')
        .height(80)
        .backgroundColor('#FFF')
        .borderRadius(12)
    }
  })
}
.listDirection(Axis.Vertical)   // 排列方向
.edgeEffect(EdgeEffect.Spring)  // 边缘效果
.scrollBar(BarState.Auto)       // 滚动条
.divider({                      // 分割线
  strokeWidth: 1,
  color: '#E8E8E8',
  startMargin: 16,
  endMargin: 16
})
```

### 黏性标题 (Sticky)

```typescript
List() {
  // 带分组的列表
  ForEach(this.groupedData, (group: Group) => {
    ListItemGroup({ header: this.GroupHeader(group.title) }) {
      ForEach(group.items, (item: string) => {
        ListItem() { Text(item) }
      })
    }
  })
}
.sticky(StickyStyle.Header) // 分组标题黏滞
```

### 横向滑动列表

```typescript
List({ space: 8 }) {
  ForEach(this.banners, (banner: BannerItem) => {
    ListItem() {
      Image(banner.url).width(300).height(160).borderRadius(12)
    }
  })
}
.listDirection(Axis.Horizontal)
.width('100%')
.height(180)
```

### 获取滚动位置

```typescript
@State private listPosition: number = 0;
private listScroller: Scroller = new Scroller();

List({ scroller: this.listScroller }) { ... }
.onScroll((x: number, y: number) => {
  this.listPosition = y;
})
```

> **参考**: [创建列表](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/arkts-layout-development-create-list-V5)

---

## ForEach 和 LazyForEach 渲染控制

### ForEach

**ForEach** 遍历数组并为每个元素渲染组件，适用于短列表。

```typescript
ForEach(
  arr: Array<any>,
  itemGenerator: (item: any, index?: number) => void,
  keyGenerator?: (item: any, index?: number) => string
)
```

- `arr` -- 源数据数组
- `itemGenerator` -- 生成组件的回调
- `keyGenerator` -- (可选) 键值生成函数，用于优化 diff 更新

```typescript
@State private items: Array<string> = ['A', 'B', 'C'];

build() {
  ForEach(this.items, (item: string) => {
    Text(item).fontSize(20)
  }, (item: string) => item) // keyGenerator 传入唯一标识
}
```

### LazyForEach

**LazyForEach** 支持懒加载，只渲染可见区域的组件，适用于长列表和无限滚动场景。

**基本用法**:

```typescript
// 1. 定义数据源
class MyDataSource implements IDataSource {
  private dataArray: Array<string> = [];

  constructor(data: Array<string>) {
    this.dataArray = data;
  }

  totalCount(): number {
    return this.dataArray.length;
  }

  getData(index: number): string {
    return this.dataArray[index];
  }

  registerDataChangeListener(listener: DataChangeListener): void {
    // 注册监听器
  }

  unregisterDataChangeListener(listener: DataChangeListener): void {
    // 注销监听器
  }
}

// 2. 更新数据源方法
class MyDataSource extends BasicDataSource {
  // 添加数据
  pushData(data: string): void {
    this.dataArray.push(data);
    this.notifyDataAdd(this.dataArray.length - 1);
  }

  // 删除数据
  deleteData(index: number): void {
    this.dataArray.splice(index, 1);
    this.notifyDataDelete(index);
  }

  // 重新加载
  reloadData(data: Array<string>): void {
    this.dataArray = data;
    this.notifyDataReload();
  }
}

// 3. 组件中使用
@Component
struct MyList {
  private dataSource: MyDataSource = new MyDataSource(['Item1', 'Item2']);

  build() {
    List() {
      LazyForEach(this.dataSource, (item: string) => {
        ListItem() {
          Text(item).width('100%').height(60)
        }
      })
    }
  }
}
```

### 性能对比

| 特性 | ForEach | LazyForEach |
|------|---------|-------------|
| 渲染方式 | 全量渲染 | 懒加载（按需渲染） |
| 数据量 | 适合 < 100 条 | 适合大规模数据 |
| 数据变更 | 差量更新 | 支持增删改通知 |
| 内存占用 | 高 | 低 |
| 适用场景 | 静态短列表 | 长列表、无限滚动 |

**注意**: LazyForEach 的数据源必须实现 `IDataSource` 接口，变更后需调用对应 `notify` 方法。

---

## @Builder 和 @BuilderParam

### @Builder 装饰器

`@Builder` 用于定义可复用的 UI 片段，类似于函数式组件。

```typescript
@Component
struct MyComponent {
  @State message: string = 'Hello';

  @Builder
  MyBuilder() {
    Text(this.message)
      .fontSize(24)
      .fontColor('#FF6B00')
  }

  build() {
    Column() {
      this.MyBuilder()
      this.MyBuilder() // 可多次调用
    }
  }
}
```

**带参数 @Builder**:

```typescript
@Builder
function CardBuilder(title: string, desc: string) {
  Column() {
    Text(title).fontSize(18).fontWeight(FontWeight.Bold)
    Text(desc).fontSize(14).fontColor('#666')
  }
  .width('100%')
  .padding(16)
  .backgroundColor('#FFF')
  .borderRadius(12)
}

// 使用
build() {
  Column() {
    CardBuilder('标题1', '描述1')
    CardBuilder('标题2', '描述2')
  }
}
```

### @BuilderParam 装饰器

`@BuilderParam` 用于接收外部传入的 `@Builder` 片段，类似于 Vue 插槽或 React children。

```typescript
@Component
struct CardContainer {
  @BuilderParam headerBuilder?: () => void;
  @BuilderParam contentBuilder: () => void;

  build() {
    Column() {
      // 头部
      if (this.headerBuilder) {
        this.headerBuilder()
      }
      // 内容
      this.contentBuilder()
    }
    .width('100%')
    .padding(16)
    .backgroundColor('#F5F5F5')
    .borderRadius(16)
  }
}

@Entry
@Component
struct ParentPage {
  @Builder
  customHeader() {
    Row() {
      Text('自定义头部').fontSize(20).fontWeight(FontWeight.Bold)
      Blank()
      Button('更多').fontSize(14)
    }
    .width('100%')
  }

  @Builder
  customContent() {
    Column() {
      Text('内容区域').fontSize(16)
      Image($r('app.media.demo')).width('100%').height(200)
    }
  }

  build() {
    CardContainer({
      headerBuilder: this.customHeader.bind(this),
      contentBuilder: this.customContent.bind(this)
    })
  }
}
```

**@BuilderParam 默认值**:

```typescript
@Component
struct ButtonComponent {
  @BuilderParam contentBuilder: () => void = this.defaultContent;

  @Builder
  defaultContent() {
    Text('默认按钮')
      .fontColor('#FFF')
  }

  build() {
    Button() {
      this.contentBuilder()
    }
    .backgroundColor('#007AFF')
    .borderRadius(8)
  }
}
```

---

## 自定义弹窗 API

自定义弹窗通过 `@CustomDialog` 和 `CustomDialogController` 实现。

### 定义弹窗

```typescript
@CustomDialog
struct ConfirmDialog {
  controller?: CustomDialogController;
  title: string = '提示';
  message: string = '';
  cancelText: string = '取消';
  confirmText: string = '确定';
  onCancel?: () => void;
  onConfirm?: () => void;

  build() {
    Column() {
      Text(this.title)
        .fontSize(20)
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 16 })

      Text(this.message)
        .fontSize(16)
        .fontColor('#666')

      Row({ space: 16 }) {
        Button(this.cancelText)
          .onClick(() => {
            this.onCancel?.();
            this.controller?.close();
          })
        Button(this.confirmText)
          .type(ButtonType.Normal)
          .backgroundColor('#007AFF')
          .fontColor('#FFF')
          .onClick(() => {
            this.onConfirm?.();
            this.controller?.close();
          })
      }
      .margin({ top: 24 })
    }
    .padding(24)
    .width('80%')
  }
}
```

### 使用弹窗

```typescript
@Entry
@Component
struct DemoPage {
  private dialogController: CustomDialogController = new CustomDialogController({
    builder: ConfirmDialog({
      title: '确认删除',
      message: '确定要删除这条记录吗？',
      cancelText: '取消',
      confirmText: '删除',
      onCancel: () => { console.log('取消删除'); },
      onConfirm: () => { console.log('确认删除'); }
    }),
    alignment: DialogAlignment.Center,
    customStyle: true,
    cornerRadius: 16,
    maskColor: '#66000000'
  });

  build() {
    Button('显示弹窗')
      .onClick(() => {
        this.dialogController.open();
      })
  }
}
```

### 弹窗配置选项

| 参数 | 类型 | 说明 |
|------|------|------|
| alignment | DialogAlignment | 弹窗对齐方式 |
| offset | Offset | 对齐后的偏移量 |
| customStyle | boolean | 是否使用自定义样式 |
| cornerRadius | number | 弹窗圆角 |
| maskColor | ResourceColor | 遮罩层颜色 |
| openAnimation | AnimateParam | 打开动画参数 |
| closeAnimation | AnimateParam | 关闭动画参数 |
| autoCancel | boolean | 点击遮罩是否关闭 |
| onDidAppear | () => void | 弹窗显示后回调 |
| onDidDisappear | () => void | 弹窗消失后回调 |
| onWillAppear | () => void | 弹窗即将显示回调 |
| onWillDisappear | () => void | 弹窗即将消失回调 |

> **参考**: [自定义弹窗 API](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/ts-methods-custom-dialog-box-V5)

---

## WaterFlow 组件

**WaterFlow** 是瀑布流容器组件，适用于图文混排、商品展示等场景。

### 基础用法

```typescript
WaterFlow() {
  LazyForEach(this.dataSource, (item: WaterFlowItem) => {
    FlowItem() {
      Column() {
        Image(item.image)
          .width('100%')
          .objectFit(ImageFit.Cover)
        Text(item.title)
          .fontSize(14)
          .margin({ top: 4 })
      }
      .padding(4)
      .backgroundColor('#FFF')
      .borderRadius(8)
    }
  })
}
.columnsTemplate('1fr 1fr')  // 两列等宽
.rowsTemplate('1fr')          // 行模板
.columnsGap(8)                // 列间距
.rowsGap(8)                   // 行间距
.nestedScroll({
  scrollForward: NestedScrollMode.SELF_FIRST,
  scrollBackward: NestedScrollMode.SELF_FIRST
})
```

### 列数控制

```typescript
// 固定三列
WaterFlow() { ... }
  .columnsTemplate('1fr 1fr 1fr')

// 自适应列宽
WaterFlow() { ... }
  .columnsTemplate('repeat(auto-fill, 150px)')

// 根据屏幕宽度动态调整
getColumnsTemplate(): string {
  const display = display.getDefaultDisplaySync();
  const width = vp2px(display.width);
  if (width >= 840) return '1fr 1fr 1fr 1fr'; // 四列（平板）
  if (width >= 600) return '1fr 1fr 1fr';       // 三列
  return '1fr 1fr';                             // 两列（手机）
}
```

### 性能优化

- 配合 **LazyForEach** 实现懒加载
- 避免高度频繁变化的图片，使用固定高度占位
- 合理设置 `columnsGap` 和 `rowsGap`

---

## 常用组件

### Button - 按钮

```typescript
// 文本按钮
Button('确定')
  .type(ButtonType.Normal)
  .backgroundColor('#007AFF')
  .fontColor('#FFF')
  .borderRadius(8)
  .width(200)
  .height(44)
  .onClick(() => { /* 点击事件 */ })

// 自定义内容按钮
Button() {
  Row({ space: 8 }) {
    Image($r('app.media.icon'))
      .width(20)
      .height(20)
    Text('保存')
  }
}
.align(Alignment.Center)
.width(160)
.height(44)
.backgroundColor('#34C759')
.borderRadius(22)

// 加载状态
@State isLoading: boolean = false;

Button(this.isLoading ? '加载中...' : '提交')
  .enabled(!this.isLoading)
  .backgroundColor(this.isLoading ? '#CCC' : '#007AFF')
  .onClick(() => { this.isLoading = true; })
```

| ButtonType | 样式 |
|-----------|------|
| Capsule | 胶囊形（全圆角） |
| Circle | 圆形 |
| Normal | 常规（可自定义圆角） |

### Text - 文本

```typescript
Text('Hello HarmonyOS')
  .fontSize(24)                          // 字体大小
  .fontColor('#333')                     // 字体颜色
  .fontWeight(FontWeight.Bold)           // 字体粗细
  .fontFamily('HarmonyOS Sans')          // 字体
  .textAlign(TextAlign.Center)           // 对齐
  .lineHeight(32)                        // 行高
  .maxLines(2)                           // 最大行数
  .textOverflow({ overflow: TextOverflow.Ellipsis })  // 溢出省略
  .letterSpacing(1)                      // 字间距
  .decoration({ type: TextDecorationType.Underline, color: '#007AFF' })

// 多个 Text 组合
Text() {
  Span('普通文字')
  Span('高亮文字')
    .fontColor('#FF6B00')
    .fontWeight(FontWeight.Bold)
  Span('')
    .textSpan('链接文字')
    .fontColor('#007AFF')
    .decoration({ type: TextDecorationType.Underline })
}
```

### TextInput - 文本输入

```typescript
@State private inputValue: string = '';

TextInput({ placeholder: '请输入内容...', text: this.inputValue })
  .onChange((value: string) => { this.inputValue = value; })
  .type(InputType.Normal)              // 输入类型
  .backgroundColor('#F5F5F5')
  .borderRadius(8)
  .padding({ left: 16, right: 16 })
  .height(48)
  .placeholderColor('#999')
  .placeholderFont({ size: 16 })
  .maxLength(100)                       // 最大长度
  .showCountText(true)                  // 显示字数统计

// 密码输入
TextInput({ placeholder: '请输入密码' })
  .type(InputType.Password)
  .showPasswordIcon(true)               // 显示密码切换图标

// 搜索框
TextInput({ placeholder: '搜索' })
  .type(InputType.Normal)
  .backgroundColor('#F0F0F0')
  .borderRadius(20)
  .height(40)
```

| InputType | 说明 |
|-----------|------|
| Normal | 普通文本 |
| Password | 密码（隐藏输入） |
| Email | 邮箱地址 |
| Number | 数字键盘 |
| PhoneNumber | 电话号码 |
| NumberDecimal | 带小数点的数字 |

### Image - 图片

```typescript
// 本地资源
Image($r('app.media.photo'))
  .width(200)
  .height(200)
  .objectFit(ImageFit.Cover)           // 填充模式
  .borderRadius(12)
  .interpolation(ImageInterpolation.High) // 插值算法

// 网络图片
Image('https://example.com/image.png')
  .width('100%')
  .aspectRatio(16 / 9)
  .objectFit(ImageFit.Contain)
  .autoResize(true)                     // 自适应
  .syncLoad(false)                      // 异步加载

// 占位图 + 错误图
Image($r('app.media.avatar'))
  .width(80)
  .height(80)
  .borderRadius(40)
  .objectFit(ImageFit.Cover)
  .alt($r('app.media.default_avatar')) // 加载失败占位
```

| ImageFit | 说明 |
|----------|------|
| Cover | 等比缩放，裁剪多余部分 |
| Contain | 等比缩放，全部显示 |
| Fill | 拉伸填满，可能变形 |
| None | 原始大小 |
| ScaleDown | 等比缩小（仅缩小） |
| FitWidth | 宽度适配 |
| FitHeight | 高度适配 |

### Column - 列容器

```typescript
Column({ space: 12 }) {
  Text('元素1')
  Text('元素2')
  Text('元素3')
}
.width('100%')
.justifyContent(FlexAlign.Start)     // 主轴（垂直）对齐
.alignItems(HorizontalAlign.Center)  // 交叉轴（水平）对齐
.padding(16)
.backgroundColor('#F5F5F5')
```

### Row - 行容器

```typescript
Row({ space: 8 }) {
  Text('左')
  Blank()                              // 弹性空白，撑开剩余空间
  Text('中')
  Blank()
  Text('右')
}
.width('100%')
.justifyContent(FlexAlign.SpaceBetween) // 主轴（水平）对齐
.alignItems(VerticalAlign.Center)       // 交叉轴（垂直）对齐
.padding({ left: 16, right: 16 })
```

### Stack - 层叠容器

```typescript
Stack({ alignContent: Alignment.BottomEnd }) {
  Image($r('app.media.background'))
    .width('100%')
    .height(200)
  Text('右下角文字')
    .fontColor('#FFF')
    .padding(8)
    .backgroundColor('#66000000')
    .borderRadius(4)
}
```

### RelativeContainer - 相对容器

```typescript
RelativeContainer() {
  Text('头像')
    .id('avatar')
    .alignRules({
      top: { anchor: '__container__', align: VerticalAlign.Top },
      left: { anchor: '__container__', align: HorizontalAlign.Start },
      width: 60, height: 60
    })
    .borderRadius(30)

  Text('用户名')
    .id('username')
    .alignRules({
      top: { anchor: 'avatar', align: VerticalAlign.Top },
      left: { anchor: 'avatar', align: HorizontalAlign.End },
      margin: { left: 12 }
    })

  Text('简介信息...')
    .id('bio')
    .alignRules({
      top: { anchor: 'username', align: VerticalAlign.Bottom },
      left: { anchor: 'username', align: HorizontalAlign.Start },
      margin: { top: 4 }
    })
}
.width('100%')
.height(100)
```

---

## 组件命名规范

HarmonyOS 项目开发中，建议按以下约定对文件进行命名分类，以保持项目结构清晰。

| 后缀 | 说明 | 示例 |
|------|------|------|
| **Page** | 页面级组件（带 @Entry 装饰器） | `HomePage.ets`, `LoginPage.ets` |
| **Component** | 非页面、可复用组件 | `HeaderComponent.ets`, `CardComponent.ets` |
| **Service** | 业务逻辑/数据服务 | `UserService.ets`, `HttpService.ets` |
| **Model** | 数据模型/类型定义 | `UserModel.ets`, `OrderModel.ets` |

### 完整示例

```
src/main/ets/
├── pages/
│   ├── HomePage.ets           // 首页
│   ├── LoginPage.ets          // 登录页
│   └── ProfilePage.ets        // 个人中心
├── components/
│   ├── HeaderComponent.ets    // 头部组件
│   ├── CardComponent.ets      // 卡片组件
│   └── LoadingComponent.ets   // 加载组件
├── services/
│   ├── HttpService.ets        // HTTP 服务
│   └── UserService.ets        // 用户服务
└── models/
    ├── UserModel.ets          // 用户模型
    └── OrderModel.ets         // 订单模型
```

### 内部命名约定

```typescript
// 组件结构体：使用文件同名
@Component
struct CardComponent {
  // 对外暴露的 @Link/@Prop 放在前面
  @Prop title: string = '';
  @Prop desc: string = '';

  // 私有状态放在其后
  @State private isExpanded: boolean = false;

  // 构建方法
  build() {
    // ...
  }

  // 私有方法放在 build 之后
  private toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
}
```

---

## 组件设计原则与反模式

### 单一职责原则

每个组件只做一件事，保持组件功能单一、可预测。避免在一个组件中堆砌过多职责。

```typescript
// ❌ Bad: 组件承担过多职责（头像、信息、操作、统计等）
@Component
struct UserCard {
  @Prop user: User

  build() {
    Column() {
      Image(this.user.avatar).width(60).height(60).borderRadius(30)
      Text(this.user.name).fontSize(18).fontWeight(FontWeight.Bold)
      Text(this.user.bio).fontSize(14).fontColor('#666')
      // 操作按钮
      Row({ space: 8 }) {
        Button('关注').onClick(() => { /* 关注逻辑 */ })
        Button('私信').onClick(() => { /* 私信逻辑 */ })
      }
      // 统计图表
      Chart({ data: this.user.stats }) // 混合了图表渲染逻辑
    }
    // 200+ 行代码...
  }
}

// ✅ Good: 拆分为职责单一的子组件
@Component
struct UserCard {
  @Prop user: User

  build() {
    Column() {
      UserAvatar({ url: this.user.avatar })
      UserInfo({ user: this.user })
      UserActions({ userId: this.user.id })
      UserStats({ stats: this.user.stats })
    }
  }
}

@Component
struct UserAvatar {
  @Prop url: string
  build() {
    Image(this.url)
      .width(60).height(60).borderRadius(30)
  }
}

@Component
struct UserInfo {
  @Prop user: User
  build() {
    Column() {
      Text(this.user.name).fontSize(18).fontWeight(FontWeight.Bold)
      Text(this.user.bio).fontSize(14).fontColor('#666')
    }
  }
}
```

### 组件粒度划分

| 组件类型 | 说明 | 示例 |
|----------|------|------|
| 基础组件 | 最小可复用单元，无业务逻辑 | Icon, Badge, Avatar |
| 组合组件 | 多个基础组件组合，可含少量交互逻辑 | Card, ListItem, SearchBar |
| 布局组件 | 负责布局结构和状态管理 | PageContainer, ScrollList |
| 页面组件 | 完整页面，带 @Entry 装饰器 | HomePage, DetailPage |

---

## 实用组件封装模式

### 1. 可复用按钮组件（多类型/多尺寸）

将 Button 封装为支持 type（primary/secondary/outline/text）和 size（small/medium/large）变体的通用组件，并内置 loading 和 disabled 状态。

```typescript
// components/CustomButton.ets
export type ButtonType = 'primary' | 'secondary' | 'outline' | 'text'
export type ButtonSize = 'small' | 'medium' | 'large'

@Component
export struct CustomButton {
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

// 使用示例
@Component
struct ButtonDemo {
  build() {
    Column({ space: 12 }) {
      CustomButton({ text: 'Primary Button', type: 'primary' })
        .onClick(() => console.log('clicked'))

      CustomButton({ text: 'Loading...', loading: true })

      CustomButton({ text: 'Disabled', disabled: true })

      CustomButton({ text: 'Outline', type: 'outline', size: 'large' })
    }
    .padding(16)
  }
}
```

### 2. 列表项组件 (ListItem)

封装通用列表项，支持图标、标题/副标题、右侧附加文字和箭头指示。

```typescript
// components/CommonListItem.ets
export interface ListItemData {
  id: string | number
  title: string
  subtitle?: string
  icon?: Resource
  trailing?: string
}

@Component
export struct CommonListItem {
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
        Text('>')
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

### 3. 搜索栏组件（@Link 双向绑定）

通过 `@Link` 实现搜索文本与父组件的双向同步，内置清除按钮和搜索提交回调。

```typescript
// components/SearchBar.ets
@Component
export struct SearchBar {
  @Link searchText: string
  @Prop placeholder: string = '搜索'
  onSearch?: (query: string) => void
  onClear?: () => void

  build() {
    Row() {
      // 搜索图标
      Image($r('sys.media.ohos_ic_public_search'))
        .width(20)
        .height(20)
        .margin({ right: 8 })

      // 输入框
      TextInput({ text: this.searchText, placeholder: this.placeholder })
        .layoutWeight(1)
        .backgroundColor(Color.Transparent)
        .onChange((value: string) => {
          this.searchText = value
        })
        .onSubmit(() => {
          if (this.onSearch) {
            this.onSearch(this.searchText)
          }
        })

      // 清除按钮
      if (this.searchText.length > 0) {
        Text('X')
          .fontSize(18)
          .fontColor('#999999')
          .padding({ left: 8, right: 8 })
          .onClick(() => {
            this.searchText = ''
            this.onClear?.()
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

// 使用示例
@Component
struct SearchDemo {
  @State query: string = ''

  build() {
    Column() {
      SearchBar({
        searchText: $query,
        placeholder: '搜索联系人...'
      })
        .onSearch((q) => console.log('搜索:', q))
        .onClear(() => console.log('已清除'))
    }
  }
}
```

### 4. 空状态组件 (EmptyState)

封装统一的空状态展示，支持图标、标题、描述文字和操作按钮。

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

// 使用示例
@Component
struct EmptyDemo {
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

### 5. 骨架屏组件 (Skeleton)

轻量骨架屏作为加载占位，支持自定义宽高和圆角。

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

// 组合骨架屏示例
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

### 6. 加载状态容器 (LoadingContainer)

统一管理 loading / success / error / empty 四种视图状态的容器组件，通过 `@BuilderParam` 传入成功态内容。

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
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
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
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
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
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}

// 使用示例
@Component
struct LoadingDemo {
  @State state: LoadingState = 'loading'

  build() {
    Column() {
      LoadingContainer({
        state: this.state,
        errorMessage: '网络异常，请检查网络连接',
        emptyMessage: '暂无数据'
      }) {
        // 成功态内容（任意自定义 UI）
        Column() {
          Text('数据加载成功!').fontSize(24)
        }
      }
      .onRetry(() => {
        this.state = 'loading'
        // 重新获取数据...
      })
    }
    .width('100%')
    .height('100%')
  }
}
```

---

## 表单组件模式

### 1. 表单字段封装 (FormField + @BuilderParam)

通过 `@BuilderParam` 将表单字段的标签、必填标记、错误提示、帮助文字等 UI 与具体输入控件解耦，实现统一的表单项布局。

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
      // 标签 + 必填标记
      Row() {
        Text(this.config.label)
          .fontSize(16)
        if (this.config.required) {
          Text(' *')
            .fontColor(Color.Red)
        }
      }

      // 输入控件（由外部通过 @BuilderParam 传入）
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

// 使用示例：登录表单
@Component
struct LoginForm {
  @State username: string = ''
  @State usernameError: string = ''
  @State password: string = ''
  @State passwordError: string = ''

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

      FormField({
        config: {
          label: '密码',
          required: true,
          error: this.passwordError,
          helpText: '密码长度6-20位'
        }
      }) {
        TextInput({ text: this.password, placeholder: '请输入密码' })
          .type(InputType.Password)
          .onChange((value) => {
            this.password = value
            if (value.length > 0 && value.length < 6) {
              this.passwordError = '密码不能少于6位'
            } else {
              this.passwordError = value.length > 0 ? '' : '密码不能为空'
            }
          })
      }
    }
    .padding(16)
  }
}
```

### 2. 表单验证器 (FormValidator)

独立的验证工具类，支持 required / minLength / maxLength / 正则 pattern 等多种验证规则。

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
  /**
   * 对值执行多条规则验证，返回第一条错误信息，全部通过返回 null
   */
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

  /**
   * 对多个字段批量验证，返回所有错误信息
   */
  static validateAll(
    fields: Record<string, { value: string; rules: ValidatorRule[] }>
  ): Record<string, string> {
    const errors: Record<string, string> = {}
    for (const key of Object.keys(fields)) {
      const error = this.validate(fields[key].value, fields[key].rules)
      if (error) {
        errors[key] = error
      }
    }
    return errors
  }
}

// 使用示例
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
      FormField({
        config: {
          label: '邮箱',
          required: true,
          error: this.emailError
        }
      }) {
        TextInput({ text: this.email, placeholder: '请输入邮箱地址' })
          .type(InputType.Email)
          .onChange((value) => {
            this.email = value
            this.validateEmail()
          })
      }
    }
    .padding(16)
  }
}
```

---

> **参考链接汇总**
>
> - [布局简介](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/layout-intro-V5)
> - [布局能力总览](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/layout-V5)
> - [创建列表](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/arkts-layout-development-create-list-V5)
> - [LazyForEach](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/arkts-rendering-control-lazyforeach-V5)
> - [自定义弹窗 API](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/ts-methods-custom-dialog-box-V5)
