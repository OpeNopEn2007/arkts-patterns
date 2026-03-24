# 资源文件配置

HarmonyOS 使用资源文件管理字符串、颜色、尺寸等，支持多语言和主题切换。

---

## 资源目录结构

```
entry/src/main/resources/
├── base/                           # 基础资源 (必选)
│   ├── element/
│   │   ├── string.json            # 字符串资源
│   │   ├── color.json             # 颜色资源
│   │   └── float.json             # 尺寸资源
│   ├── media/                      # 媒体资源
│   │   ├── startIcon.png
│   │   └── ...
│   └── profile/                    # 配置文件
│       ├── main_pages.json        # 页面路由
│       └── backup_config.json     # 备份配置
│
└── dark/                           # 暗黑模式资源 (可选)
    └── element/
        └── color.json
```

---

## string.json - 字符串资源

位置: `resources/base/element/string.json`

```json
{
  "string": [
    {
      "name": "module_desc",
      "value": "module description"
    },
    {
      "name": "EntryAbility_desc",
      "value": "description"
    },
    {
      "name": "EntryAbility_label",
      "value": "label"
    }
  ]
}
```

### 引用方式

```typescript
// 在代码中
$string:module_desc

// 在 JSON5 配置中
"description": "$string:module_desc"
```

### 多语言支持

```
resources/
├── base/element/string.json      # 默认语言
├── en_US/element/string.json     # 英语
├── zh_CN/element/string.json     # 简体中文
└── zh_TW/element/string.json     # 繁体中文
```

---

## color.json - 颜色资源

位置: `resources/base/element/color.json`

```json
{
  "color": [
    {
      "name": "start_window_background",
      "value": "#FFFFFF"
    }
  ]
}
```

### 引用方式

```typescript
// 在代码中
.backgroundColor($color:start_window_background)

// 在 JSON5 配置中
"startWindowBackground": "$color:start_window_background"
```

### 暗黑模式

`resources/dark/element/color.json`:

```json
{
  "color": [
    {
      "name": "start_window_background",
      "value": "#000000"
    }
  ]
}
```

---

## float.json - 尺寸资源

位置: `resources/base/element/float.json`

```json
{
  "float": [
    {
      "name": "page_text_font_size",
      "value": "50fp"
    }
  ]
}
```

### 单位说明

| 单位 | 说明 |
|------|------|
| `px` | 物理像素 |
| `vp` | 密度无关像素 (推荐) |
| `fp` | 字体像素，跟随系统字体缩放 |
| `lpx` | 逻辑像素 |

### 引用方式

```typescript
// 在代码中
.fontSize($r('app.float.page_text_font_size'))
```

---

## main_pages.json - 页面路由

位置: `resources/base/profile/main_pages.json`

```json
{
  "src": [
    "pages/Index"
  ]
}
```

### 添加新页面

```json
{
  "src": [
    "pages/Index",
    "pages/SecondPage",
    "pages/user/ProfilePage"
  ]
}
```

**命名规范**:
- 页面文件放在 `ets/pages/` 目录
- 路径相对于 `ets/`
- 多级目录使用 `/` 分隔

---

## backup_config.json - 备份配置

位置: `resources/base/profile/backup_config.json`

```json
{
  "allowToBackupRestore": true
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `allowToBackupRestore` | boolean | 是否允许备份恢复 |

---

## $r() 资源引用

### 语法格式

```typescript
$r('app.<type>.<name>')
```

| 类型 | 示例 |
|------|------|
| string | `$r('app.string.app_name')` |
| color | `$r('app.color.primary')` |
| float | `$r('app.float.page_text_font_size')` |
| media | `$r('app.media.icon')` |
| profile | `$r('app.profile.main_pages')` |

### 使用示例

```typescript
@Entry
@Component
struct ResourceExample {
  build() {
    Column() {
      // 字符串
      Text($r('app.string.app_name'))

      // 颜色
      Text('Colored Text')
        .fontColor($r('app.color.primary'))

      // 尺寸
      Text('Sized Text')
        .fontSize($r('app.float.page_text_font_size'))

      // 图片
      Image($r('app.media.startIcon'))
    }
  }
}
```

---

## 资源最佳实践

### ✅ Good: 使用资源引用

```typescript
Text('Hello')
  .fontSize($r('app.float.title_size'))
  .fontColor($r('app.color.text_primary'))
```

### ❌ Bad: 硬编码值

```typescript
Text('Hello')
  .fontSize(18)
  .fontColor('#333333')
```

### 资源命名规范

| 类型 | 命名格式 | 示例 |
|------|----------|------|
| 颜色 | `color_<scope>_<name>` | `color_text_primary` |
| 字符串 | `<scope>_<name>` | `login_button_text` |
| 尺寸 | `<scope>_<element>_<property>` | `title_text_size` |