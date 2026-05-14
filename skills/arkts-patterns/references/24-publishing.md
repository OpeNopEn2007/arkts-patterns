# 发布 (Publishing HarmonyOS Apps)

## 概述

将 HarmonyOS 应用发布到 AppGallery Connect，让用户下载使用。发布流程包括签名配置、包构建和上传发布。

---

## 1. 应用签名配置

发布前必须对应用进行正式签名。

### 步骤
1. 在 [AppGallery Connect](https://developer.huawei.com/consumer/cn/service/josp/agc/index.html) 创建应用
2. 生成发布证书（`.cer`）
3. 生成发布 Profile（`.p7b`）
4. 在 DevEco Studio 中配置签名信息

### 签名信息
| 配置项 | 说明 |
|--------|------|
| Store File (P12) | 密钥库文件 |
| Key Alias | 密钥别名 |
| CertPath (CER) | 证书文件 |
| Profile (P7B) | 发布 Profile 文件 |
| SignMode | debug / release |

两种方式：
- **自动签名**：IDE 自动生成调试证书（仅限调试）
- **手动签名**：开发者自行管理证书（正式发布必须用此方式）

---

## 2. 构建 HAP/APP 包

### 构建类型
| 类型 | 格式 | 用途 |
|------|------|------|
| Debug | `.hap` | 调试阶段，未混淆 |
| Release | `.app` / `.hap` | 上架发布，已混淆并签名 |

### Hvigor 构建命令
```bash
# 构建 HAP 包
hvigor assembleHap --mode module -p product=default

# 构建 APP 包（含多个 HAP）
hvigor assembleApp --mode module -p product=default
```

### APP 包结构
APP 包是发布格式，内部包含多个 HAP 包：
- `entry.hap`：主模块
- `feature.hap`：Feature 模块
- `shared.hap`：共享库（如果有）

---

## 3. 发布到 AppGallery Connect

### 流程
1. **登录 AGC**：进入"我的项目" -> 选择应用
2. **上传包**：上传构建好的 `.app` 文件
3. **填写应用信息**：应用名称、描述、截图、分类等
4. **设置版本信息**：版本号、更新说明
5. **提交审核**：华为审核团队审核应用
6. **审核通过**：应用上架，用户可下载

### 审核注意事项
- 确保应用符合《HarmonyOS 应用审核规范》
- 应用图标尺寸和格式要求
- 隐私政策和权限声明清晰
- 功能完整，无严重崩溃

### 分发方式
| 分发类型 | 说明 |
|----------|------|
| 公开上架 | 所有用户可见 |
| 内部测试 | 仅限指定测试用户 |
| 定向分发 | 面向特定企业/机构 |

---

## 总结

| 阶段 | 操作 | 工具 |
|------|------|------|
| 签名 | 生成证书和 Profile | AGC + DevEco Studio |
| 构建 | 编译打包 | Hvigor |
| 发布 | 上传上架 | AppGallery Connect |
