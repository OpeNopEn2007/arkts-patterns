# 应用包结构 (Application Package Structure)

## 概述

HarmonyOS 应用以 HAP（HarmonyOS Ability Package）为基本交付单元，多个 HAP 组合为 APP 包用于发布。不同模型（Stage / FA）的包结构有所不同。

> 官方文档：[应用程序包概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-package-overview-V5)

---

## 1. 应用程序包概述

### 基本概念
| 概念 | 说明 |
|------|------|
| **HAP** | 应用的基本交付单元，包含代码、资源和配置文件 |
| **APP** | 发布格式，一个或多个 HAP 打包而成 |
| **Bundle** | 应用的唯一标识（bundleName） |

### 包类型
| 类型 | 说明 |
|------|------|
| **Entry HAP** | 主模块，有且仅有一个 |
| **Feature HAP** | 功能模块，可有多个 |
| **Shared HAP** | 共享库模块 |

---

## 2. Stage 模型包结构

Stage 模型是 HarmonyOS 推荐的应用开发模型。

### 开发态目录结构
```
MyApp/
├── AppScope/              # 应用整体配置
│   └── app.json5          # 应用名称、版本、图标等
├── entry/                 # Entry 模块
│   ├── src/
│   │   └── main/
│   │       ├── ets/       # ArkTS 源码
│   │       ├── resources/ # 资源文件
│   │       └── module.json5  # 模块配置
│   └── build-profile.json5   # 模块构建配置
├── feature/               # Feature 模块（可选）
└── build-profile.json5    # 工程构建配置
```

### 编译态
- ArkTS 编译为 ABC（Ark Bytecode）
- 资源编译为二进制资源索引
- 生成 `*.hap`

### 发布态
- 多个 HAP 打包为 `*.app`
- APP 包使用正式签名
- 上传到 AppGallery Connect

> 官方文档：[Stage 模型包结构](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/application-package-structure-stage-V5)

---

## 3. FA 模型包结构

FA 模型是 HarmonyOS 早期支持的开发模型（当前仍兼容）。

### 结构特点
- 每个 Ability 对应一个独立 `config.json`
- 无 `module.json5`，使用 `config.json` 配置模块
- 资源和代码结构类似 Stage 模型

### 对比 Stage 模型
| 维度 | Stage 模型 | FA 模型 |
|------|------------|---------|
| 配置文件 | app.json5 + module.json5 | config.json |
| Ability 定义 | 类声明 + module.json5 | config.json |
| 共享包 | 支持 HSP | 支持 HAR |
| 推荐度 | 推荐 | 旧项目兼容 |

> 官方文档：[FA 模型包结构](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/application-package-structure-fa-V5)

---

## 4. HAP 打包发布

完整的 HAP 打包流程：

### 构建产物
```
entry-default-unsigned.hap    # 未签名的 HAP
entry-default-signed.hap      # 已签名的 HAP（调试包）
entry-default.app             # APP 包（发布包）
```

### 打包过程
1. **编译**：ArkTS -> ABC
2. **资源处理**：资源编译为二进制格式
3. **打包**：代码 + 资源 -> HAP
4. **签名**：对 HAP 进行数字签名
5. **聚合**：多个 HAP -> APP 包

> 官方文档：[HAP 打包发布](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/hap-package-V5)

---

## 总结

| 模型 | 配置文件 | 状态 |
|------|----------|------|
| Stage | app.json5 + module.json5 | 当前推荐模型 |
| FA | config.json | 兼容，不推荐新项目 |

| 阶段 | 产物 | 说明 |
|------|------|------|
| 开发态 | 源码目录 | ets + resources + json5 |
| 编译态 | HAP | 字节码 + 资源索引 |
| 发布态 | APP | 签名后的多 HAP 聚合 |
