# 14 - 国际化 (i18n / Localization)

> HarmonyOS NEXT (API 12) 国际化与本地化开发完整指南

---

## 1. 国际化开发总指南 (i18n + l10n)

HarmonyOS 提供了完整的国际化（i18n, Internationalization）和本地化（l10n, Localization）支持框架，帮助应用适配不同语言、地区和文化习惯。

### 1.1 i18n vs l10n

| 概念 | 说明 | 开发阶段 |
|------|------|----------|
| **i18n (国际化)** | 应用框架层面支持多语言和地区适应 | 设计开发阶段 |
| **l10n (本地化)** | 针对特定语言/地区提供翻译和资源配置 | 发布部署阶段 |

### 1.2 国际化能力总览

```
国际化能力
├── 多语言支持（资源文件 + 翻译）
├── 区域文化适配
│   ├── 日期/时间格式
│   ├── 数字/货币格式
│   ├── 排序规则
│   ├── 日历系统（公历、农历、伊斯兰历等）
│   ├── 时区
│   └── 文本方向（LTR/RTL）
├── 系统环境订阅（语言、区域变化监听）
└── UI 自适应布局
```

### 1.3 基本使用

```typescript
import { i18n } from '@kit.LocalizationKit';

// 获取系统语言
const systemLanguage = i18n.System.getSystemLanguage();
console.log('System language:', systemLanguage);

// 获取系统区域
const systemRegion = i18n.System.getSystemRegion();
console.log('System region:', systemRegion);

// 获取系统时区
const systemTimezone = i18n.System.getSystemTimezone();
console.log('System timezone:', systemTimezone);

// 创建 locale 实例
const locale = new i18n.Locale('zh-Hans-CN');
// 或从系统当前语言获取
const currentLocale = new i18n.Locale(systemLanguage);

// 获取本地化显示名称
console.log('Language display name:', locale.getDisplayLanguage('en-US'));
console.log('Region display name:', locale.getDisplayRegion('en-US'));
```

### 1.4 日期和时间格式化

```typescript
// 日期格式化
function formatDates(): void {
  // 创建日期时间格式化器
  const dateFormatter = new i18n.DateTimeFormat('zh-Hans-CN', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const now = new Date();
  const formattedDate = dateFormatter.format(now);
  console.log('Formatted date (zh-CN):', formattedDate);

  // 不同 locale 的对比
  const usFormatter = new i18n.DateTimeFormat('en-US', {
    dateStyle: 'full',
  });
  console.log('US format:', usFormatter.format(now));

  const jpFormatter = new i18n.DateTimeFormat('ja-JP', {
    dateStyle: 'full',
  });
  console.log('JP format:', jpFormatter.format(now));

  // 相对时间
  const relativeFormatter = new i18n.RelativeTimeFormat('zh-Hans-CN');
  console.log(relativeFormatter.format(-1, 'day'));    // "昨天"
  console.log(relativeFormatter.format(3, 'hour'));    // "3小时后"
  console.log(relativeFormatter.format(-30, 'minute')); // "30分钟前"
}
```

### 1.5 数字和货币格式化

```typescript
function formatNumbers(): void {
  // 数字格式化
  const numberFormatter = new i18n.NumberFormat('zh-Hans-CN', {
    style: 'decimal',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  console.log('Formatted number:', numberFormatter.format(1234567.89));
  // 输出: "1,234,567.89"（中文环境）或 "1.234.567,89"（某些欧洲语言）

  // 货币格式化
  const cnyFormatter = new i18n.NumberFormat('zh-Hans-CN', {
    style: 'currency',
    currency: 'CNY',
  });
  console.log('CNY:', cnyFormatter.format(1234.56)); // "¥1,234.56"

  const usdFormatter = new i18n.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  console.log('USD:', usdFormatter.format(1234.56)); // "$1,234.56"

  // 百分比格式化
  const percentFormatter = new i18n.NumberFormat('zh-Hans-CN', {
    style: 'percent',
  });
  console.log('Percent:', percentFormatter.format(0.856)); // "85.6%"
}
```

### 1.6 排序

```typescript
function sortStrings(): void {
  // 创建排序比较器
  const zhCollator = new i18n.Collator('zh-Hans-CN');
  const enCollator = new i18n.Collator('en-US');

  const names = ['张飞', '关羽', '刘备', '赵云'];

  // 中文排序（按拼音）
  const sortedZh = names.sort((a, b) => zhCollator.compare(a, b));
  console.log('Sorted (zh):', sortedZh);

  // 英文排序对比
  const enNames = ['Zhang', 'Guan', 'Liu', 'Zhao'];
  const sortedEn = enNames.sort((a, b) => enCollator.compare(a, b));
  console.log('Sorted (en):', sortedEn);

  // 不区分大小写排序
  const caseInsensitive = new i18n.Collator('en-US', { sensitivity: 'base' });
  console.log(caseInsensitive.compare('apple', 'Apple')); // 0 (相等)
}
```

### 1.7 文本方向 (RTL 支持)

```typescript
function checkTextDirection(): void {
  // 检查语言是否为 RTL（从右到左）
  const isRTL = new i18n.Locale('ar-SA').isRTL();
  console.log('Arabic is RTL:', isRTL); // true

  const isCNSRTL = new i18n.Locale('zh-CN').isRTL();
  console.log('Chinese is RTL:', isCNSRTL); // false

  // 根据方向应用布局
  if (isRTL) {
    // 使用 RTL 布局
    console.log('Apply RTL layout');
  } else {
    // 使用 LTR 布局
    console.log('Apply LTR layout');
  }
}
```

> **官方文档：** [国际化开发指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/i18n-l10n-V5)

---

## 2. i18n UI 设计

国际化 UI 设计是从框架层面确保应用 UI 能够适应不同语言和地区的设计规范。

### 2.1 UI 自适应原则

| 原则 | 说明 | 实现方式 |
|------|------|----------|
| 弹性布局 | UI 元素不依赖固定文本长度 | 使用百分比/自适应布局 |
| 文本截断 | 长文本优雅截断 | `textOverflow` 属性 |
| 图标国际 | 避免使用文化特定图标 | 使用通用图标或替换 |
| 方向适配 | 支持 LTR/RTL 布局 | `direction` 属性 |

### 2.2 ArkUI 中的国际化布局

```typescript
@Entry
@Component
struct I18nUIPage {
  @Localized currentLanguage: string = 'zh-CN';

  build() {
    Column() {
      // 使用弹性布局，不依赖文本宽度
      Row() {
        Text($r('app.string.welcome_message'))
          .layoutWeight(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
          .maxLines(2);

        Button($r('app.string.submit'))
          .constraintSize({ minWidth: 80 })
      }
      .width('100%')
      .padding(12)

      // 支持 RTL 方向
      Column() {
        Text($r('app.string.email_label'))
        TextInput({ placeholder: $r('app.string.email_placeholder') })
      }
      .direction(this.isRTL ? Direction.Rtl : Direction.Ltr)
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .padding(16)
  }

  get isRTL(): boolean {
    const locale = new i18n.Locale(this.currentLanguage);
    return locale.isRTL();
  }
}
```

### 2.3 字符串资源引用

```typescript
// 在代码中使用资源引用
@Entry
@Component
struct ResourceDemo {
  build() {
    Column() {
      // 使用 $r 引用资源
      Text($r('app.string.app_name'))
        .fontSize(24)

      // 带参数的字符串
      Text($r('app.string.welcome_user', 'Harmony'))
        .fontSize(16)

      // 图片资源
      Image($r('app.media.ic_launcher'))
        .width(48)
        .height(48)
    }
  }
}
```

> **官方文档：** [i18n UI 设计](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/i18n-ui-design-V5)

---

## 3. 多语言资源配置

多语言资源文件是本地化的核心，通过资源文件管理不同语言的字符串、图片等。

### 3.1 资源目录结构

```
resources/
├── base/                    # 默认资源（必选）
│   ├── element/
│   │   ├── string.json      # 字符串定义
│   │   ├── color.json       # 颜色定义
│   │   ├── float.json       # 浮点数定义
│   │   └── boolean.json     # 布尔值定义
│   ├── media/               # 默认媒体资源
│   ├── profile/             # 资源配置文件
│   └── rawfile/             # 原始文件
│
├── en_US/                   # 美式英语
│   ├── element/
│   │   └── string.json
│   └── media/
│
├── zh_CN/                   # 简体中文
│   ├── element/
│   │   └── string.json
│   └── media/
│
├── zh_HK/                   # 繁体中文（香港）
│   ├── element/
│   │   └── string.json
│   └── media/
│
├── ja_JP/                   # 日语
│   ├── element/
│   │   └── string.json
│   └── media/
│
└── ar_SA/                   # 阿拉伯语（RTL）
    ├── element/
    │   └── string.json
    └── media/
```

### 3.2 字符串资源文件格式

**`resources/base/element/string.json`** (默认/中文):

```json5
{
  "string": [
    {
      "name": "app_name",
      "value": "我的应用"
    },
    {
      "name": "welcome_message",
      "value": "欢迎使用 HarmonyOS 应用"
    },
    {
      "name": "welcome_user",
      "value": "你好，%s！"  // %s: 格式化参数
    },
    {
      "name": "item_count",
      "value": "共 %d 个项目"  // %d: 数字参数
    },
    {
      "name": "login_title",
      "value": "登录"
    },
    {
      "name": "logout",
      "value": "退出登录"
    }
  ]
}
```

**`resources/en_US/element/string.json`** (英文):

```json5
{
  "string": [
    {
      "name": "app_name",
      "value": "My App"
    },
    {
      "name": "welcome_message",
      "value": "Welcome to HarmonyOS App"
    },
    {
      "name": "welcome_user",
      "value": "Hello, %s!"
    },
    {
      "name": "item_count",
      "value": "%d items"
    },
    {
      "name": "login_title",
      "value": "Sign In"
    },
    {
      "name": "logout",
      "value": "Sign Out"
    }
  ]
}
```

### 3.3 复数处理 (Plural)

```typescript
// 某些语言（如英语）有单复数形式
// resources/en_US/element/string.json (复数条目)
{
  "string": [
    {
      "name": "message_count",
      "value": {
        "zero": "No messages",
        "one": "1 message",
        "other": "%d messages"
      }
    }
  ]
}

// 使用复数资源
function getMessageCountText(count: number): Resource {
  // 系统会根据当前 locale 和 count 自动选择合适的复数形式
  return $r('app.string.message_count', count);
}
```

### 3.4 媒体资源本地化

```typescript
// 为不同语言提供不同的图片
// resources/zh_CN/media/welcome_banner.png
// resources/en_US/media/welcome_banner.png

// 代码中引用（系统自动选择对应语言的资源）
Image($r('app.media.welcome_banner'))
  .width('100%')
  .height(200)
```

> **官方文档：** [多语言资源配置](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/l10n-multilingual-resources-V5)

---

## 4. 订阅系统环境变量变化

应用需要监听系统语言、区域等环境变量的变化，并及时更新界面。

### 4.1 订阅语言和区域变化

```typescript
import { i18n } from '@kit.LocalizationKit';
import { common } from '@kit.AbilityKit';

class LanguageMonitor {
  private callbackId: number = -1;

  // 开始监听系统语言变化
  startMonitoring(): void {
    this.callbackId = i18n.on('language', (language: string) => {
      console.log(`Language changed to: ${language}`);
      // 刷新 UI（通知状态管理）
      AppStorage.set('currentLanguage', language);
    });

    // 监听区域变化
    i18n.on('region', (region: string) => {
      console.log(`Region changed to: ${region}`);
      AppStorage.set('currentRegion', region);
    });

    // 监听时区变化
    i18n.on('timezone', (timezone: string) => {
      console.log(`Timezone changed to: ${timezone}`);
      AppStorage.set('currentTimezone', timezone);
    });
  }

  // 停止监听
  stopMonitoring(): void {
    if (this.callbackId >= 0) {
      i18n.off('language', this.callbackId);
    }
  }
}
```

### 4.2 配置变更监听

```typescript
import { common } from '@kit.AbilityKit';
import { i18n } from '@kit.LocalizationKit';

// 在 Ability 中监听配置变化
class EntryAbility extends UIAbility {
  // 系统配置发生变化时回调
  onConfigurationUpdate(config: Configuration): void {
    console.log('Configuration updated:', JSON.stringify(config));

    // 获取最新语言
    const newLanguage = i18n.System.getSystemLanguage();
    console.log('New language:', newLanguage);

    // 获取最新区域
    const newRegion = i18n.System.getSystemRegion();
    console.log('New region:', newRegion);

    // 通知 UI 刷新
    AppStorage.set('systemLanguage', newLanguage);
    AppStorage.set('systemRegion', newRegion);
  }
}
```

### 4.3 UI 响应语言变化

```typescript
@Entry
@Component
struct LanguageAwarePage {
  @StorageLink('systemLanguage') currentLanguage: string = 'zh-CN';
  @StorageLink('systemRegion') currentRegion: string = 'CN';

  aboutToAppear(): void {
    // 初始化时获取当前语言设置
    this.currentLanguage = i18n.System.getSystemLanguage();
    this.currentRegion = i18n.System.getSystemRegion();

    // 注册语言变化监听
    i18n.on('language', (lang: string) => {
      this.currentLanguage = lang;
    });
  }

  build() {
    Column() {
      // 文本使用 $r 自动跟随语言切换
      Text($r('app.string.welcome_message'))
        .fontSize(20)

      // 动态显示当前语言
      Text(`Current: ${this.currentLanguage}_${this.currentRegion}`)
        .fontSize(14)
        .fontColor(Color.Gray)

      // 使用 i18n API 格式化数据（需要根据语言变化重新格式化）
      Text(this.getFormattedDate(new Date()))
        .fontSize(16)
    }
    .width('100%')
    .height('100%')
    .padding(16)
  }

  getFormattedDate(date: Date): string {
    const formatter = new i18n.DateTimeFormat(this.currentLanguage, {
      dateStyle: 'long',
    });
    return formatter.format(date);
  }
}
```

> **官方文档：** [订阅系统环境变量](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/subscribe-system-environment-variable-changes-V5)

---

## 5. 区域文化习惯适配

不同地区有不同的文化习惯，包括日期格式、货币符号、度量衡、排序规则等。

### 5.1 地区差异速查表

| 地区 | 日期格式 | 时间格式 | 货币 | 温度 | 分隔符 |
|------|----------|----------|------|------|--------|
| 中国 (zh-CN) | 2024年1月15日 | 24小时 | CNY (元) | 摄氏度 | 千分位逗号 |
| 美国 (en-US) | 1/15/2024 | 12小时 (AM/PM) | USD ($) | 华氏度 | 千分位逗号 |
| 德国 (de-DE) | 15.1.2024 | 24小时 | EUR (€) | 摄氏度 | 千分位点 |
| 日本 (ja-JP) | 2024/1/15 | 24小时 | JPY (円) | 摄氏度 | 无分隔符 |
| 阿拉伯 (ar-SA) | 15/1/2024 | 12小时 (ص/م) | SAR (﷼) | 摄氏度 | RTL 布局 |

### 5.2 文化和地域适配

```typescript
function culturalAdaptation(): void {
  // 1. 日历系统
  const chineseLocale = new i18n.Locale('zh-Hans-CN');
  console.log('Calendar:', chineseLocale.getCalendar()); // "gregorian"

  // 2. 一周起始日
  console.log('First day of week:', chineseLocale.getFirstDayOfWeek()); // 1 (周一)
  const usLocale = new i18n.Locale('en-US');
  console.log('US first day:', usLocale.getFirstDayOfWeek()); // 7 (周日)

  // 3. 工作时间
  console.log('Work days:', chineseLocale.getWorkDays()); // [1,2,3,4,5] (周一到周五)

  // 4. 时区
  const timezone = i18n.System.getSystemTimezone();
  console.log('Timezone:', timezone); // "Asia/Shanghai"

  // 5. 度量衡系统
  const measureFormatter = new i18n.MeasureFormatter('zh-Hans-CN');
  console.log('Temperature:', measureFormatter.format(25, 'celsius'));
  // "25摄氏度"

  const usMeasure = new i18n.MeasureFormatter('en-US');
  console.log('US temperature:', usMeasure.format(77, 'fahrenheit'));
  // "77°F"
}
```

### 5.3 区域感知排序

```typescript
// 不同语言的排序规则不同
function regionAwareSorting(): void {
  const words = ['apple', 'Banana', 'äpfel', 'Zebra'];

  // 英文排序（不区分大小写）
  const enCollator = new i18n.Collator('en-US', { sensitivity: 'base' });
  const sortedEn = [...words].sort((a, b) => enCollator.compare(a, b));
  console.log('EN sort:', sortedEn);
  // 可能结果: ['apple', 'äpfel', 'Banana', 'Zebra']

  // 德文排序（ä 排在 a 之后）
  const deCollator = new i18n.Collator('de-DE', { sensitivity: 'base' });
  const sortedDe = [...words].sort((a, b) => deCollator.compare(a, b));
  console.log('DE sort:', sortedDe);
  // 可能结果: ['apple', 'äpfel', 'Banana', 'Zebra']

  // 瑞典语排序（ä 排在 z 之后）
  const svCollator = new i18n.Collator('sv-SE', { sensitivity: 'base' });
  const sortedSv = [...words].sort((a, b) => svCollator.compare(a, b));
  console.log('SV sort:', sortedSv);
  // 可能结果: ['apple', 'Banana', 'Zebra', 'äpfel']
}
```

### 5.4 RTL 布局适配

对于阿拉伯语（ar-SA）、希伯来语（he-IL）等 RTL 语言，UI 布局需要镜像翻转。

```typescript
// 检测并使用 RTL 布局
function applyRTLIfNeeded(): Direction {
  const currentLang = i18n.System.getSystemLanguage();
  const locale = new i18n.Locale(currentLang);
  return locale.isRTL() ? Direction.Rtl : Direction.Ltr;
}

// 在组件中使用
@Entry
@Component
struct RTLDemo {
  @StorageLink('systemLanguage') currentLanguage: string = 'zh-CN';

  build() {
    Column() {
      // 文本方向自动适配
      Text($r('app.string.hello'))
        .direction(this.isRTL ? Direction.Rtl : Direction.Ltr)

      // Row 布局方向
      Row() {
        Image($r('app.media.icon_back'))
          .width(24)
          .height(24)
        Text($r('app.string.back'))
      }
      .direction(this.isRTL ? Direction.Rtl : Direction.Ltr)
    }
  }

  get isRTL(): boolean {
    return new i18n.Locale(this.currentLanguage).isRTL();
  }
}
```

---

## 6. 国际化最佳实践

### 6.1 资源管理

| 实践 | 说明 |
|------|------|
| 所有字符串使用 $r 引用 | 避免硬编码字符串 |
| 字符串参数化 | 使用 %s, %d 等占位符 |
| 图片避免含文字 | 文字应使用 Text 组件渲染 |
| 留足文本空间 | 不同语言文本长度不同（英文通常比中文长 30-50%） |
| 复数形式 | 英语等语言需要处理单复数 |

### 6.2 代码规范

```typescript
// 正确：使用资源引用
@Entry
@Component
struct GoodPractice {
  build() {
    Column() {
      Text($r('app.string.welcome'))
      Button($r('app.string.submit'))
    }
  }
}

// 错误：硬编码字符串
// @Entry
// @Component
// struct BadPractice {
//   build() {
//     Column() {
//       Text('Welcome')  // 无法本地化
//       Button('Submit') // 无法本地化
//     }
//   }
// }
```

### 6.3 翻译管理

- 使用 key-value 形式的资源文件
- 维护翻译术语表保持一致性
- 为翻译人员提供上下文说明（在 resource 中添加注释）
- 使用伪本地化（Pseudolocalization）测试 UI 布局

### 6.4 测试清单

| 测试项 | 说明 |
|--------|------|
| 所有语言的 UI 布局 | 确认文本完整可见，无截断 |
| RTL 语言的布局 | 确认布局镜像正确 |
| 日期/时间/货币格式 | 确认格式符合当地习惯 |
| 排序/搜索 | 确认按照当地语言规则排序 |
| 系统语言切换 | 确认应用能实时响应语言变化 |
| 特殊字符 | 确认各种字符集显示正常（中文、日文、阿拉伯文） |

---

## 7. 常见问题与解决方案

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 资源找不到 | 资源名称拼写错误或目录结构不对 | 检查资源 JSON 文件格式 |
| 文本显示不全 | 不同语言文本长度差异大 | 使用弹性布局 + textOverflow |
| 切换语言后界面未更新 | 未监听语言变化事件 | 使用 `i18n.on('language')` |
| RTL 布局错乱 | 未处理 RTL 方向 | 检查 `locale.isRTL()` 并设置 `Direction` |
| 日期格式错误 | 未使用 `DateTimeFormat` | 禁止手动拼接日期字符串 |

---

## 参考链接

- [国际化开发指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/i18n-l10n-V5)
- [i18n UI 设计](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/i18n-ui-design-V5)
- [订阅系统环境变量](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/subscribe-system-environment-variable-changes-V5)
- [多语言资源配置](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/l10n-multilingual-resources-V5)
