# EmptyAbility 官方空白模板

HarmonyOS NEXT Stage 模型标准空白模板，由 DevEco Studio 生成。

**SDK 版本**: 6.0.2(22)
**模型**: Stage Model
**语言**: ArkTS

---

## 直接使用模板

完整的项目源码位于 skill 根目录的 `../../empty-ability-template/` 目录，可以直接复制使用：

```bash
# 复制模板到目标目录
cp -r ~/.claude/skills/arkts-patterns/empty-ability-template/ /path/to/your-new-project/

# 进入项目目录
cd /path/to/your-new-project

# 安装依赖
ohpm install

# 在 DevEco Studio 中打开项目
```

### 创建新项目后必须修改

1. **修改包名** - `AppScope/app.json5`:
   ```json5
   {
     "app": {
       "bundleName": "com.yourcompany.yourapp"  // 改为你的包名
     }
   }
   ```

2. **修改模块描述** - `entry/src/main/resources/base/element/string.json`

3. **配置签名** - 在 DevEco Studio 中配置

---

## 目录结构

```
EmptyAbility/
├── AppScope/                              # 应用全局范围
│   ├── app.json5                         # 应用配置
│   └── resources/                        # 全局资源
│       └── base/
│           ├── element/
│           │   └── string.json           # 应用名称
│           └── media/
│               ├── background.png        # 背景图
│               ├── foreground.png        # 前景图
│               └── layered_image.json    # 分层图标
│
├── entry/                                 # 主模块 (HAP)
│   ├── src/main/
│   │   ├── ets/
│   │   │   ├── entryability/
│   │   │   │   └── EntryAbility.ets     # 主入口 Ability
│   │   │   ├── entrybackupability/
│   │   │   │   └── EntryBackupAbility.ets # 备份扩展
│   │   │   └── pages/
│   │   │       └── Index.ets            # 主页面
│   │   ├── resources/                    # 模块资源
│   │   │   └── base/
│   │   │       ├── element/
│   │   │       │   ├── string.json
│   │   │       │   ├── color.json
│   │   │       │   └── float.json
│   │   │       ├── media/
│   │   │       └── profile/
│   │   │           ├── main_pages.json  # 页面路由
│   │   │           └── backup_config.json
│   │   └── module.json5                  # 模块配置
│   ├── src/ohosTest/                     # 仪器测试
│   └── src/test/                         # 本地单元测试
│
├── hvigor/                                # 构建系统
│   └── hvigor-config.json5
├── build-profile.json5                    # 项目构建配置
├── code-linter.json5                      # 代码规范
├── oh-package.json5                       # 依赖配置
└── hvigorfile.ts                          # 项目构建脚本
```

---

## 核心文件说明

| 文件 | 说明 | 详细文档 |
|------|------|----------|
| `EntryAbility.ets` | 应用入口，管理完整生命周期 | [入口能力详解](./entry-ability.md) |
| `EntryBackupAbility.ets` | 数据备份恢复扩展 | [备份扩展详解](./entry-backup-ability.md) |
| `Index.ets` | 主页面，展示装饰器用法 | [页面模板详解](./index-page.md) |
| `module.json5` | 模块配置，Ability 声明 | [配置文件详解](./configuration.md) |
| `app.json5` | 应用级配置 | [配置文件详解](./configuration.md) |
| 资源文件 | string/color/float | [资源配置详解](./resources.md) |
| Hvigor 构建配置 | 构建系统配置 | [构建系统详解](./build-system.md) |
| 测试配置 | Hypium 测试框架 | [测试配置详解](./testing.md) |

---

## 生命周期概览

```
┌─────────────────────────────────────────────────────────────┐
│                      UIAbility 生命周期                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   onCreate ──► onWindowStageCreate ──► onForeground        │
│       │              │                    │                 │
│       │              │                    ▼                 │
│       │              │              onBackground            │
│       │              │                    │                 │
│       │              ▼                    │                 │
│       │      onWindowStageDestroy ◄───────┘                 │
│       │                    │                                 │
│       ▼                    │                                 │
│   onDestroy ◄──────────────┘                                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 快速开始

### 1. 创建项目

在 DevEco Studio 中选择 "Empty Ability" 模板创建新项目。

### 2. 修改包名

```json5
// AppScope/app.json5
{
  "app": {
    "bundleName": "com.yourcompany.yourapp"  // 修改为你的包名
  }
}
```

### 3. 配置签名

在 DevEco Studio 中配置应用签名。

### 4. 开始开发

在 `entry/src/main/ets/pages/` 下添加新页面。

---

## 关键导入

```typescript
// Ability 相关
import { UIAbility, AbilityConstant, Want } from '@kit.AbilityKit';

// 窗口管理
import { window } from '@kit.ArkUI';

// 日志
import { hilog } from '@kit.PerformanceAnalysisKit';

// 配置
import { ConfigurationConstant } from '@kit.AbilityKit';

// 备份扩展
import { BackupExtensionAbility, BundleVersion } from '@kit.CoreFileKit';
```