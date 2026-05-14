# Hvigor 构建系统

Hvigor 是 HarmonyOS 官方构建工具，基于 TypeScript 开发。

---

## 构建配置文件

### 项目级 hvigorfile.ts

位置: 根目录 `hvigorfile.ts`

```typescript
import { appTasks } from '@ohos/hvigor-ohos-plugin';

export default {
  system: appTasks,  /* 内置插件，不可修改 */
  plugins: []        /* 自定义插件扩展 */
}
```

### 模块级 hvigorfile.ts

位置: `entry/hvigorfile.ts`

```typescript
import { hapTasks } from '@ohos/hvigor-ohos-plugin';

export default {
  system: hapTasks,  /* HAP 构建任务 */
  plugins: []        /* 自定义插件 */
}
```

### 内置任务

| 任务 | 说明 |
|------|------|
| `appTasks` | 应用级构建任务 |
| `hapTasks` | HAP 模块构建任务 |
| `harTasks` | HAR 共享库构建任务 |

---

## hvigor-config.json5

位置: `hvigor/hvigor-config.json5`

```json5
{
  "modelVersion": "6.0.2",
  "dependencies": {},
  "execution": {
    // "analyze": "normal",           // 分析模式: normal | advanced | ultrafine | false
    // "daemon": true,                // 守护进程编译
    // "incremental": true,           // 增量编译
    // "parallel": true,              // 并行编译
    // "typeCheck": false,            // 类型检查
    // "optimizationStrategy": "memory"  // 优化策略: memory | performance
  },
  "logging": {
    // "level": "info"                // 日志级别: debug | info | warn | error
  },
  "debugging": {
    // "stacktrace": false            // 堆栈追踪
  },
  "nodeOptions": {
    // "maxOldSpaceSize": 8192        // Node 内存限制 (MB)
    // "exposeGC": true               // 显式触发 GC
  }
}
```

### 执行配置

| 配置 | 默认值 | 说明 |
|------|--------|------|
| `daemon` | true | 启用守护进程，加速后续构建 |
| `incremental` | true | 增量编译，只编译修改的文件 |
| `parallel` | true | 并行编译，利用多核 CPU |
| `typeCheck` | false | 编译时类型检查 |

---

## 常用构建命令

### 基本命令

```bash
# 安装依赖
ohpm install

# 构建 HAP
hvigorw assembleHap

# 清理构建
hvigorw clean

# 运行测试
hvigorw test
```

### 构建变体

```bash
# Debug 构建
hvigorw assembleHap --mode debug

# Release 构建
hvigorw assembleHap --mode release
```

### 其他命令

```bash
# 构建所有模块
hvigorw assembleHap --no-daemon

# 显示帮助
hvigorw --help

# 查看任务列表
hvigorw tasks
```

---

## 构建配置详解

### build-profile.json5

```json5
{
  "app": {
    "products": [
      {
        "name": "default",
        "targetSdkVersion": "6.0.2(22)",
        "compatibleSdkVersion": "6.0.2(22)",
        "buildOption": {
          "strictMode": {
            "caseSensitiveCheck": true,
            "useNormalizedOHMUrl": true
          }
        }
      }
    ]
  }
}
```

### 构建选项

| 选项 | 说明 |
|------|------|
| `targetSdkVersion` | 目标 SDK 版本 |
| `compatibleSdkVersion` | 兼容的最低版本 |
| `strictMode.caseSensitiveCheck` | 大小写敏感检查 |
| `strictMode.useNormalizedOHMUrl` | 规范化 OHM URL |

---

## 混淆配置

### obfuscation-rules.txt

位置: `entry/obfuscation-rules.txt`

```
# 保留选项
-keep
-keep-class
-keep-method
-keep-field
-keep-name

# 混淆选项
-obfuscate
-rename-package
```

### 启用混淆

在 `entry/build-profile.json5`:

```json5
{
  "buildOptionSet": [
    {
      "name": "release",
      "arkOptions": {
        "obfuscation": {
          "ruleOptions": {
            "enable": true,
            "files": ["./obfuscation-rules.txt"]
          }
        }
      }
    }
  ]
}
```

---

## 构建产物

### HAP 文件

```
entry/build/default/outputs/default/
└── entry-default-signed.hap
```

### HAP 结构

```
entry.hap
├── classes.abc          # 编译后的字节码
├── resources.index      # 资源索引
├── resources/           # 资源文件
└── module.json          # 模块配置
```

---

## 多模块构建

### 项目结构

```
MyApp/
├── entry/               # 主模块
├── feature1/            # 特性模块
├── feature2/            # 特性模块
└── common/              # 共享模块
```

### build-profile.json5

```json5
{
  "modules": [
    { "name": "entry", "srcPath": "./entry" },
    { "name": "feature1", "srcPath": "./feature1" },
    { "name": "feature2", "srcPath": "./feature2" },
    { "name": "common", "srcPath": "./common" }
  ]
}
```

---

## 构建最佳实践

### ✅ Good: 使用增量编译

```bash
# 首次构建后，后续构建自动增量
hvigorw assembleHap
```

### ✅ Good: Release 构建启用混淆

```json5
{
  "arkOptions": {
    "obfuscation": {
      "ruleOptions": {
        "enable": true
      }
    }
  }
}
```

### ❌ Bad: 每次都清理构建

```bash
# 不推荐，会丢失增量编译优势
hvigorw clean && hvigorw assembleHap
```