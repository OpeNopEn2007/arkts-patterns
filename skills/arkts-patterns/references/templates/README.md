# ArkTS 模板库

HarmonyOS NEXT 项目模板集合，提供官方标准模板和最佳实践。

---

## 官方模板

### EmptyAbility (空白模板)

HarmonyOS Stage 模型标准空白模板 (API 22 / SDK 6.0.2)。

**完整源码位置**: `../../empty-ability-template/` (skill 目录下)

**脚手架脚本**: 使用 `scripts/scaffold.sh` 快速创建新项目：
```bash
bash scripts/scaffold.sh ./my-new-app com.yourcompany.yourapp
```

**适用场景**:
- 新项目起步
- 学习 Stage 模型架构
- 理解 Ability 生命周期
- 掌握项目标准结构

**包含内容**:
- 完整的项目目录结构
- EntryAbility 入口能力
- EntryBackupAbility 数据备份扩展
- 标准配置文件体系
- Hypium 测试框架配置

**详细文档**: [EmptyAbility 模板详解](./empty-ability/README.md)

---

## 快速创建项目

### 方式一：使用 scaffold.sh 脚本（推荐）

```bash
# 一键创建并配置
bash scripts/scaffold.sh ./my-new-app com.yourcompany.yourapp

cd my-new-app
ohpm install
```

### 方式二：手动复制

```bash
cp -r empty-ability-template/ ./my-new-app/
cd my-new-app
ohpm install
```

创建后记得修改 `AppScope/app.json5` 中的 `bundleName`。

### 1. 选择模板

根据项目需求选择合适的模板：

| 模板 | 适用场景 |
|------|----------|
| EmptyAbility | 新项目、学习、原型开发 |

### 2. 应用模板

```bash
# 方式一: DevEco Studio 创建项目时选择 EmptyAbility 模板
# 方式二: 复制模板目录结构，修改 bundleName
```

### 3. 自定义配置

创建项目后需要修改的关键配置：

```json5
// AppScope/app.json5
{
  "app": {
    "bundleName": "com.yourcompany.yourapp",  // 修改为你的包名
    "vendor": "yourcompany",                   // 修改为你的公司名
    "versionCode": 1000000,
    "versionName": "1.0.0"
  }
}
```

---

## 核心文件对照表

| 文件 | 用途 | 重要程度 |
|------|------|----------|
| `EntryAbility.ets` | 应用入口，生命周期管理 | ⭐⭐⭐ |
| `EntryBackupAbility.ets` | 数据备份恢复 | ⭐⭐ |
| `Index.ets` | 主页面，UI 入口 | ⭐⭐⭐ |
| `module.json5` | 模块配置，Ability 声明 | ⭐⭐⭐ |
| `app.json5` | 应用级配置 | ⭐⭐⭐ |
| `build-profile.json5` | 构建配置 | ⭐⭐ |
| `code-linter.json5` | 代码规范 | ⭐⭐ |

---

## 扩展阅读

- [应用模型 (Ability Kit)](../02-application-model.md)
- [ArkTS 语言与装饰器](../03-arkts-language.md)
- [状态管理](../04-state-management.md)
- [UI 组件与布局](../05-ui-components.md)
- [导航路由](../06-navigation.md)
- [并发 (TaskPool/Worker)](../10-concurrency.md)