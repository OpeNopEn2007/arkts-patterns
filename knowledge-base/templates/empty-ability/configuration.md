# 项目配置文件详解

HarmonyOS 项目包含多个配置文件，用于定义应用信息、构建选项和代码规范。

---

## app.json5 - 应用级配置

位置: `AppScope/app.json5`

```json5
{
  "app": {
    "bundleName": "com.example.emptyability",
    "vendor": "example",
    "versionCode": 1000000,
    "versionName": "1.0.0",
    "icon": "$media:layered_image",
    "label": "$string:app_name"
  }
}
```

### 字段说明

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `bundleName` | string | ✅ | 应用唯一标识，需与签名证书匹配 |
| `vendor` | string | ❌ | 开发者名称 |
| `versionCode` | number | ✅ | 版本号，更新时必须递增 |
| `versionName` | string | ✅ | 用户可见的版本名称 |
| `icon` | string | ✅ | 应用图标资源引用 |
| `label` | string | ✅ | 应用名称资源引用 |

### 版本号规则

```json5
// versionCode 格式: AAABBBCCC (A: 主版本, B: 次版本, C: 修订号)
// 例: 1.2.3 → 1002003
"versionCode": 1000000,  // 1.0.0
"versionName": "1.0.0"
```

---

## module.json5 - 模块配置

位置: `entry/src/main/module.json5`

```json5
{
  "module": {
    "name": "entry",
    "type": "entry",
    "description": "$string:module_desc",
    "mainElement": "EntryAbility",
    "deviceTypes": ["phone"],
    "deliveryWithInstall": true,
    "installationFree": false,
    "pages": "$profile:main_pages",
    "abilities": [...],
    "extensionAbilities": [...]
  }
}
```

### 模块类型

| type | 说明 |
|------|------|
| `entry` | 主模块，安装到设备 |
| `feature` | 动态特性模块 |
| `shared` | 共享库模块 |

### abilities 配置

```json5
{
  "abilities": [
    {
      "name": "EntryAbility",
      "srcEntry": "./ets/entryability/EntryAbility.ets",
      "description": "$string:EntryAbility_desc",
      "icon": "$media:layered_image",
      "label": "$string:EntryAbility_label",
      "startWindowIcon": "$media:startIcon",
      "startWindowBackground": "$color:start_window_background",
      "exported": true,
      "skills": [
        {
          "entities": ["entity.system.home"],
          "actions": ["ohos.want.action.home"]
        }
      ]
    }
  ]
}
```

| 字段 | 说明 |
|------|------|
| `name` | Ability 类名 |
| `srcEntry` | 源文件路径 |
| `exported` | 是否可被其他应用调用 |
| `skills` | 可响应的 Intent |
| `startWindowIcon` | 启动窗口图标 |
| `startWindowBackground` | 启动窗口背景色 |

### extensionAbilities 配置

```json5
{
  "extensionAbilities": [
    {
      "name": "EntryBackupAbility",
      "srcEntry": "./ets/entrybackupability/EntryBackupAbility.ets",
      "type": "backup",
      "exported": false,
      "metadata": [
        {
          "name": "ohos.extension.backup",
          "resource": "$profile:backup_config"
        }
      ]
    }
  ]
}
```

---

## build-profile.json5 - 构建配置

### 项目级配置

位置: 根目录 `build-profile.json5`

```json5
{
  "app": {
    "signingConfigs": [],
    "products": [
      {
        "name": "default",
        "signingConfig": "default",
        "targetSdkVersion": "6.0.2(22)",
        "compatibleSdkVersion": "6.0.2(22)",
        "runtimeOS": "HarmonyOS",
        "buildOption": {
          "strictMode": {
            "caseSensitiveCheck": true,
            "useNormalizedOHMUrl": true
          }
        }
      }
    ],
    "buildModeSet": [
      { "name": "debug" },
      { "name": "release" }
    ]
  },
  "modules": [
    {
      "name": "entry",
      "srcPath": "./entry",
      "targets": [
        {
          "name": "default",
          "applyToProducts": ["default"]
        }
      ]
    }
  ]
}
```

### 模块级配置

位置: `entry/build-profile.json5`

```json5
{
  "apiType": "stageMode",
  "buildOption": {
    "resOptions": {
      "copyCodeResource": { "enable": false }
    }
  },
  "buildOptionSet": [
    {
      "name": "release",
      "arkOptions": {
        "obfuscation": {
          "ruleOptions": {
            "enable": false,
            "files": ["./obfuscation-rules.txt"]
          }
        }
      }
    }
  ],
  "targets": [
    { "name": "default" },
    { "name": "ohosTest" }
  ]
}
```

### 关键配置项

| 配置 | 说明 |
|------|------|
| `apiType` | API 类型，`stageMode` 表示 Stage 模型 |
| `targetSdkVersion` | 目标 SDK 版本 |
| `compatibleSdkVersion` | 兼容的最低 SDK 版本 |
| `strictMode` | 严格模式，启用大小写敏感检查 |

---

## code-linter.json5 - 代码规范

位置: 根目录 `code-linter.json5`

```json5
{
  "files": ["**/*.ets"],
  "ignore": [
    "**/src/ohosTest/**/*",
    "**/src/test/**/*",
    "**/src/mock/**/*",
    "**/node_modules/**/*",
    "**/oh_modules/**/*",
    "**/build/**/*",
    "**/.preview/**/*"
  ],
  "ruleSet": [
    "plugin:@performance/recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "@security/no-unsafe-aes": "error",
    "@security/no-unsafe-hash": "error",
    "@security/no-unsafe-mac": "warn",
    "@security/no-unsafe-dh": "error",
    "@security/no-unsafe-dsa": "error",
    "@security/no-unsafe-ecdsa": "error",
    "@security/no-unsafe-rsa-encrypt": "error",
    "@security/no-unsafe-rsa-sign": "error",
    "@security/no-unsafe-rsa-key": "error",
    "@security/no-unsafe-dsa-key": "error",
    "@security/no-unsafe-dh-key": "error",
    "@security/no-unsafe-3des": "error"
  }
}
```

### 安全规则

| 规则 | 说明 |
|------|------|
| `no-unsafe-aes` | 禁止使用不安全的 AES 模式 |
| `no-unsafe-hash` | 禁止使用不安全的哈希算法 |
| `no-unsafe-rsa-*` | 禁止使用不安全的 RSA 操作 |
| `no-unsafe-3des` | 禁止使用 3DES 加密 |

---

## oh-package.json5 - 依赖配置

### 项目级

```json5
{
  "name": "emptyability",
  "version": "1.0.0",
  "description": "Please describe the basic information.",
  "main": "",
  "author": "",
  "license": "Apache-2.0"
}
```

### 模块级

```json5
{
  "name": "entry",
  "version": "1.0.0",
  "description": "Please describe the basic information.",
  "main": "",
  "author": "",
  "license": "",
  "dependencies": {}
}
```

---

## 配置文件关系图

```
app.json5 (应用级)
    │
    ├── module.json5 (模块级)
    │       │
    │       ├── abilities[]
    │       └── extensionAbilities[]
    │
    ├── build-profile.json5 (构建)
    │       │
    │       └── modules[]
    │
    └── code-linter.json5 (规范)
```