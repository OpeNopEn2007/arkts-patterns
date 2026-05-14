# 11 - 权限与安全 (Permissions & Security)

> HarmonyOS NEXT (API 12) 权限管控与安全体系完整指南

---

## 1. 应用权限管控概述

HarmonyOS 采用了分层权限管控机制，确保应用只能访问其被明确授权的能力和数据。

### 1.1 权限分类

| 权限类型 | 说明 | 授权方式 |
|----------|------|----------|
| **normal (normalPermissions)** | 对用户隐私和数据安全影响低 | 安装时自动授予 |
| **system_basic (systemBasicPermissions)** | 对用户隐私有中等程度影响 | 需要用户授权 |
| **system_core (systemCorePermissions)** | 对系统核心功能有影响 | 仅系统应用可获取 |

### 1.2 权限等级

```
system_core (最高, 仅系统应用)
      |
system_basic (需要用户确认)
      |
normal (安装即授权)
```

### 1.3 权限声明

在 `module.json5` 文件中声明所需权限：

```json5
// module.json5
{
  module: {
    // ...
    requestPermissions: [
      {
        name: "ohos.permission.CAMERA",
        reason: "用于扫码和拍照功能",
        usedScene: {
          abilities: ["EntryAbility"],
          when: "inuse"
        }
      },
      {
        name: "ohos.permission.MICROPHONE",
        reason: "用于录音和语音输入",
        usedScene: {
          abilities: ["EntryAbility", "RecordAbility"],
          when: "always"
        }
      },
      {
        name: "ohos.permission.INTERNET",
        // normal 级别权限，无需 reason 和 usedScene
      }
    ]
  }
}
```

### 1.4 动态授权（运行时权限）

```typescript
import { abilityAccessCtrl } from '@kit.AbilityKit';
import { common } from '@kit.AbilityKit';
import { BusinessError } from '@kit.BasicServicesKit';

async function requestCameraPermission(): Promise<void> {
  const atManager = abilityAccessCtrl.createAtManager();
  const context = getContext() as common.UIAbilityContext;

  try {
    // 检查权限状态
    const grantStatus = abilityAccessCtrl.GrantStatus;
    const currentStatus = await atManager.checkAccessToken(
      context.tokenId,
      'ohos.permission.CAMERA'
    );

    if (currentStatus !== grantStatus.PERMISSION_GRANTED) {
      // 请求权限（弹窗向用户申请）
      const result = await atManager.requestPermissionsFromUser(
        context,
        ['ohos.permission.CAMERA']
      );

      if (result.authResults[0] === grantStatus.PERMISSION_GRANTED) {
        console.log('Camera permission granted');
      } else {
        console.error('Camera permission denied');
      }
    }
  } catch (error) {
    const err: BusinessError = error as BusinessError;
    console.error(`Permission request failed: ${err.message}`);
  }
}
```

> **官方文档：** [应用权限管控](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/app-permission-mgmt-overview-V5)

---

## 2. 访问控制概述 (ACL)

HarmonyOS 的访问控制框架（Access Control Framework）基于能力（Ability）和权限（Permission）的断言和验证机制。

### 2.1 ACL 访问控制

ACL（Access Control List，访问控制列表）定义了哪些应用或组件可以访问特定的系统资源。

### 2.2 权限校验流程

```
应用请求操作
    │
    ▼
访问控制框架检查权限
    │
    ├── 已授权 ──► 允许操作
    │
    └── 未授权
        │
        ├── normal 级别 ──► 安装时授权
        │
        ├── system_basic ──► 弹窗请求用户授权
        │
        └── system_core ──► 仅系统应用可用
```

> **官方文档：** [访问控制概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/access-token-overview-V5)

---

## 3. 基于设备分类和数据分级的访问控制

HarmonyOS 根据设备类型和数据等级提供精细化的访问控制。

### 3.1 设备分类

| 设备类型 | 安全等级 | 示例 |
|----------|----------|------|
| 智能手表/手环 | 低 | 运动手环 |
| 平板/手机 | 中 | 手机、平板 |
| 智慧屏/车机 | 中 | 电视、车载 |
| 桌面/笔记本 | 高 | PC、笔记本 |

### 3.2 数据分级

| 数据等级 | 说明 | 示例 |
|----------|------|------|
| S0 | 公开数据 | 应用列表、天气信息 |
| S1 | 个人非敏感 | 日程、设置偏好 |
| S2 | 个人敏感 | 联系人、短信、位置 |
| S3 | 重要隐私 | 支付信息、健康数据 |
| S4 | 关键数据 | 密码、生物特征 |

### 3.3 分级访问控制策略

```typescript
// 数据库安全等级设置
import { relationalStore } from '@kit.ArkData';

const STORE_CONFIG: relationalStore.StoreConfig = {
  name: 'secure_app.db',
  securityLevel: relationalStore.SecurityLevel.S2, // 根据数据等级选择
  encrypt: true,
};
```

| 存储方案 | 支持的安全等级 |
|----------|---------------|
| Preferences | S1 - S4 |
| RDB | S1 - S4 |
| KV Store | S1 - S4 |

> **官方文档：** [设备和数据分级访问控制](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/access-control-by-device-and-data-level-V5)

---

## 4. Universal Keystore Kit (密钥全生命周期管理)

Universal Keystore Kit（HUKS）为应用提供密钥的全生命周期管理能力，包括密钥生成、导入、使用、存储和销毁。

### 4.1 功能架构

```
┌──────────────────────────────────────────┐
│            Universal Keystore Kit         │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 密钥生成  │ │ 密钥导入  │ │ 密钥使用  │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 密钥派生  │ │ 密钥协商  │ │ 密钥证明  │ │
│  └──────────┘ └──────────┘ └──────────┘ │
│                                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ 签名验签  │ │ 加密解密  │ │ HMAC     │ │
│  └──────────┘ └──────────┘ └──────────┘ │
└──────────────────────────────────────────┘
```

> **官方文档：** [Universal Keystore Kit 概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-overview-V5)

---

## 5. 加解密算法框架

HarmonyOS HUKS 支持多种主流加密算法，包括国密算法和国际标准算法。

### 5.1 支持的算法概览

| 算法类型 | 算法 | 用途 | 密钥长度 |
|----------|------|------|----------|
| RSA | RSA | 非对称加密/签名 | 1024, 2048, 3072, 4096 |
| ECC | ECDSA | 数字签名 | 224, 256, 384, 521 |
| ECC | ECDH | 密钥协商 | 224, 256, 384, 521 |
| AES | AES | 对称加密 | 128, 192, 256 |
| SM2 | SM2 | 国密非对称加密/签名 | 256 |
| SM3 | SM3 | 国密哈希 | 256 |
| SM4 | SM4 | 国密对称加密 | 128 |
| HMAC | HMAC-SHAx | 消息认证码 | 任意 |

> **算法支持随 API 版本更新，以官方文档为准。**

### 5.2 使用示例

```typescript
import { huks } from '@kit.UniversalKeystoreKit';

// AES 加密示例
async function aesEncrypt(): Promise<void> {
  // 1. 生成密钥
  const genKeyProperties: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_AES },
      { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_AES_KEY_SIZE_256 },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_ENCRYPT | huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_DECRYPT },
    ],
  };

  const keyAlias = 'aes_key_001';
  await huks.generateKey(keyAlias, genKeyProperties);

  // 2. 加密
  const plainText = 'Hello, HarmonyOS!';
  const encryptOptions: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_AES },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_ENCRYPT },
      { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_AES_KEY_SIZE_256 },
    ],
  };

  const cipherText = await huks.init(keyAlias, encryptOptions);
  // ... 后续操作（update, finish）

  // 3. 删除密钥
  await huks.deleteKey(keyAlias);
}
```

---

## 6. 密钥生成、导入、使用、签名/验签、证明

### 6.1 密钥生成

```typescript
// 生成 RSA 密钥对
async function generateRSAKeyPair(): Promise<void> {
  const properties: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_RSA },
      { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_RSA_KEY_SIZE_2048 },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_SIGN | huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_VERIFY },
      { tag: huks.HuksTag.HUKS_TAG_DIGEST, value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256 },
      { tag: huks.HuksTag.HUKS_TAG_PADDING, value: huks.HuksKeyPadding.HUKS_PADDING_PSS },
    ],
  };

  await huks.generateKey('rsa_key_sign', properties);
  console.log('RSA key pair generated');
}
```

> **官方文档：** [密钥生成](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-key-generation-overview-V5)

### 6.2 密钥导入

```typescript
// 导入外部密钥
async function importKey(keyAlias: string, keyData: Uint8Array): Promise<void> {
  const properties: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_AES },
      { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_AES_KEY_SIZE_256 },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_ENCRYPT },
      { tag: huks.HuksTag.HUKS_TAG_IMPORT_KEY_TYPE, value: huks.HuksImportKeyType.HUKS_IMPORT_KEY_TYPE_PUBLIC_KEY },
    ],
    inData: keyData,
  };

  await huks.importKey(keyAlias, properties);
  console.log(`Key ${keyAlias} imported`);
}
```

> **官方文档：** [密钥导入](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-key-import-overview-V5)

### 6.3 签名与验签

```typescript
// 数字签名
async function signAndVerify(): Promise<void> {
  const dataToSign = 'Important transaction data';

  // 使用生成的 RSA 密钥签名
  const signProperties: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_RSA },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_SIGN },
      { tag: huks.HuksTag.HUKS_TAG_DIGEST, value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256 },
      { tag: huks.HuksTag.HUKS_TAG_PADDING, value: huks.HuksKeyPadding.HUKS_PADDING_PSS },
    ],
    inData: new TextEncoder().encode(dataToSign),
  };

  // sign
  const signResult = await huks.init('rsa_key_sign', signProperties);
  // ... update, finish 操作

  // verify
  const verifyProperties: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_RSA },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_VERIFY },
      { tag: huks.HuksTag.HUKS_TAG_DIGEST, value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256 },
      { tag: huks.HuksTag.HUKS_TAG_PADDING, value: huks.HuksKeyPadding.HUKS_PADDING_PSS },
    ],
    inData: new TextEncoder().encode(dataToSign),
  };

  await huks.init('rsa_key_sign', verifyProperties);
  console.log('Signature verified');
}
```

> **官方文档：** [签名验签](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-signing-signature-verification-overview-V5) | [密钥使用](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-key-use-overview-V5)

### 6.4 密钥证明 (Key Attestation)

密钥证明用于向远程服务器证明密钥确实是在安全硬件（如 TEE）中生成和存储的。

```typescript
async function attestKey(): Promise<void> {
  const challenge = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const attestProperties: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_RSA },
      { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_RSA_KEY_SIZE_2048 },
      { tag: huks.HuksTag.HUKS_TAG_ATTESTATION_CHALLENGE, value: challenge },
    ],
  };

  const certChain = await huks.attestKey('rsa_key_sign', attestProperties);
  console.log('Certificate chain:', certChain);
  // 将证书链发送到服务器进行验证
}
```

> **官方文档：** [密钥证明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-key-attestation-overview-V5)

### 6.5 HMAC

```typescript
// 使用 HMAC 进行消息认证
async function hmacExample(): Promise<void> {
  const properties: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_HMAC },
      { tag: huks.HuksTag.HUKS_TAG_KEY_SIZE, value: huks.HuksKeySize.HUKS_AES_KEY_SIZE_256 },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_MAC },
      { tag: huks.HuksTag.HUKS_TAG_DIGEST, value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256 },
    ],
  };

  await huks.generateKey('hmac_key', properties);

  // 计算 HMAC
  const macProperties: huks.HuksOptions = {
    properties: [
      { tag: huks.HuksTag.HUKS_TAG_ALGORITHM, value: huks.HuksKeyAlg.HUKS_ALG_HMAC },
      { tag: huks.HuksTag.HUKS_TAG_PURPOSE, value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_MAC },
      { tag: huks.HuksTag.HUKS_TAG_DIGEST, value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256 },
    ],
    inData: new TextEncoder().encode('Message to authenticate'),
  };

  // ... init, update, finish
}
```

> **官方文档：** [HMAC](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/huks-hmac-overview-V5)

---

## 7. 关键资产存储 (Asset Store Kit)

Asset Store Kit 提供安全的关键资产存储能力，用于保存密码、令牌、证书等敏感信息。

### 7.1 特性

- **安全存储**：使用 TEE/安全芯片加密存储
- **访问控制**：支持指纹、人脸等生物认证限制
- **数据隔离**：不同应用间资产隔离
- **持久化**：设备重启后数据不丢失

### 7.2 基本使用

```typescript
import { asset } from '@kit.AssetStoreKit';

// 存储关键资产
async function storeAsset(): Promise<void> {
  await asset.add({
    accessType: asset.AccessType.ACCESS_TYPE_PASSWORD,
    secret: 'user_password_hash', // 敏感数据
    alias: 'com.example.app.password',
    // 可选：生物认证保护
    requireBiometric: true,
  });
}

// 查询资产
async function queryAsset(): Promise<void> {
  const result = await asset.query({
    alias: 'com.example.app.password',
  });
  console.log('Asset retrieved:', result);
}

// 删除资产
async function removeAsset(): Promise<void> {
  await asset.remove({
    alias: 'com.example.app.password',
  });
}
```

---

## 8. 用户认证 (User Authentication Kit)

User Authentication Kit 提供统一的用户身份认证能力，包括锁屏密码、指纹、人脸识别等。

### 8.1 认证方式

| 认证类型 | 说明 |
|----------|------|
| PIN/密码 | 锁屏密码验证 |
| 指纹识别 | 指纹生物识别 |
| 人脸识别 | 3D 人脸识别 |
| 复合认证 | 多种方式组合 |

### 8.2 基本使用

```typescript
import { userAuth } from '@kit.UserAuthenticationKit';

async function authenticateUser(): Promise<void> {
  try {
    // 创建认证实例
    const authInstance = userAuth.createUserAuthInstance(
      userAuth.UserAuthType.FINGERPRINT,
      userAuth.UserAuthTrustLevel.L1
    );

    // 开始认证
    const result = await authInstance.auth();

    if (result.result === userAuth.AuthResultCode.SUCCESS) {
      console.log('User authentication successful');
      // 执行敏感操作
    } else {
      console.error('User authentication failed');
    }
  } catch (error) {
    console.error(`Authentication error: ${error}`);
  }

  // 检查设备支持的认证方式
  const availableTypes = userAuth.getAvailableUserAuthTypes();
  console.log('Available auth types:', availableTypes);
}
```

---

## 9. 安全编码规范

### 9.1 通用原则

1. **最小权限原则**：只申请应用必需的最小权限集
2. **数据最小化**：只收集和使用必要的数据
3. **加密优先**：存储和传输敏感数据必须加密
4. **安全默认**：默认使用最安全的配置
5. **纵深防御**：多层安全防护机制

### 9.2 数据安全

```typescript
// 正确：敏感数据加密后存储
async function storeSensitiveData(data: string): Promise<void> {
  // 使用 HUKS 加密
  const encryptedData = await encryptWithHuks(data);
  await preferences.put('sensitive_data', encryptedData);
  await preferences.flush();
}

// 错误：明文存储敏感数据
async function badPractice(data: string): Promise<void> {
  await preferences.put('sensitive_data', data); // 不安全！
  await preferences.flush();
}
```

### 9.3 网络安全

- 使用 HTTPS 而非 HTTP
- 服务器证书校验
- 避免在 URL 中传递敏感参数
- 使用安全的 WebSocket（WSS）

### 9.4 本地安全

- 使用 HUKS 管理密钥而非硬编码
- 数据库启用加密
- 及时清除内存中的敏感数据
- 避免将敏感数据写入日志

### 9.5 权限安全

| 检查项 | 说明 |
|--------|------|
| 权限声明最小化 | 只声明应用必需权限 |
| 动态权限请求 | 使用时再申请，提供原因说明 |
| 权限状态检查 | 每次使用前检查权限状态 |
| 降级处理 | 用户拒绝权限时的优雅降级 |

---

## 10. 安全方案选择矩阵

| 安全需求 | 推荐方案 | 说明 |
|----------|----------|------|
| 密钥管理 | HUKS | 安全的密钥全生命周期管理 |
| 敏感数据存储 | Asset Store Kit | 关键资产安全存储 |
| 数据传输加密 | TLS/HUKS | 网络传输+端到端加密 |
| 数据库加密 | RDB/KV Store 加密 | 透明加密存储 |
| 用户认证 | User Auth Kit | 生物/PIN 认证 |
| 权限控制 | ACL + 动态权限 | 细粒度访问控制 |

---

## 参考链接

- [应用权限管控](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/app-permission-mgmt-overview-V5)
- [访问控制概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/access-token-overview-V5)
- [Universal Keystore Kit 概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-overview-V5)
- [密钥生成](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-key-generation-overview-V5)
- [密钥导入](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-key-import-overview-V5)
- [密钥使用](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-key-use-overview-V5)
- [签名验签](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-signing-signature-verification-overview-V5)
- [密钥证明](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/huks-key-attestation-overview-V5)
- [HMAC](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/huks-hmac-overview-V5)
- [设备和数据分级访问控制](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/access-control-by-device-and-data-level-V5)
