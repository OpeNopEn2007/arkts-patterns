# EntryBackupAbility 数据备份扩展

EntryBackupAbility 是数据备份恢复扩展能力，继承自 BackupExtensionAbility。

---

## 完整代码模板

```typescript
import { hilog } from '@kit.PerformanceAnalysisKit';
import { BackupExtensionAbility, BundleVersion } from '@kit.CoreFileKit';

const DOMAIN = 0x0000;

export default class EntryBackupAbility extends BackupExtensionAbility {
  async onBackup() {
    hilog.info(DOMAIN, 'testTag', 'onBackup ok');
    await Promise.resolve();
  }

  async onRestore(bundleVersion: BundleVersion) {
    hilog.info(DOMAIN, 'testTag', 'onRestore ok %{public}s',
      JSON.stringify(bundleVersion));
    await Promise.resolve();
  }
}
```

---

## 生命周期方法

### onBackup

数据备份时调用。

```typescript
async onBackup(): Promise<void>
```

**用途**: 准备需要备份的数据，确保数据一致性。

```typescript
// ✅ Good: 完整的备份逻辑
async onBackup() {
  try {
    // 1. 保存当前状态
    await this.saveCurrentState();

    // 2. 确保数据已持久化
    await this.flushData();

    hilog.info(DOMAIN, 'testTag', 'onBackup ok');
  } catch (err) {
    hilog.error(DOMAIN, 'testTag', 'Backup failed: %{public}s', JSON.stringify(err));
    throw err;  // 抛出异常表示备份失败
  }
}
```

### onRestore

数据恢复时调用。

```typescript
async onRestore(bundleVersion: BundleVersion): Promise<void>
```

**参数说明**:
| 字段 | 类型 | 说明 |
|------|------|------|
| `name` | string | 应用名称 |
| `versionCode` | number | 版本号 |
| `versionName` | string | 版本名 |

```typescript
// ✅ Good: 完整的恢复逻辑
async onRestore(bundleVersion: BundleVersion) {
  hilog.info(DOMAIN, 'testTag', 'Restoring from version %{public}s',
    JSON.stringify(bundleVersion));

  try {
    // 1. 检查版本兼容性
    if (bundleVersion.versionCode > CURRENT_VERSION) {
      hilog.warn(DOMAIN, 'testTag', 'Restoring from newer version');
    }

    // 2. 恢复数据
    await this.restoreData();

    hilog.info(DOMAIN, 'testTag', 'onRestore ok');
  } catch (err) {
    hilog.error(DOMAIN, 'testTag', 'Restore failed: %{public}s', JSON.stringify(err));
    throw err;
  }
}
```

---

## module.json5 配置

在 `module.json5` 中声明备份扩展：

```json5
{
  "module": {
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
}
```

**关键字段**:
| 字段 | 值 | 说明 |
|------|------|------|
| `type` | `"backup"` | 扩展类型为备份 |
| `exported` | `false` | 不对外暴露 |
| `metadata` | `ohos.extension.backup` | 备份配置引用 |

---

## backup_config.json

备份配置文件，位于 `resources/base/profile/backup_config.json`：

```json
{
  "allowToBackupRestore": true
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `allowToBackupRestore` | boolean | 是否允许备份恢复 |

---

## 使用场景

### 1. 自动备份

系统自动备份应用数据到云端。

### 2. 跨设备恢复

用户在新设备登录时自动恢复数据。

### 3. 版本迁移

应用升级时迁移用户数据。

---

## 最佳实践

### 错误处理

```typescript
// ✅ Good: 完整的错误处理
async onBackup() {
  try {
    await this.performBackup();
    hilog.info(DOMAIN, 'testTag', 'Backup successful');
  } catch (err) {
    hilog.error(DOMAIN, 'testTag', 'Backup failed: %{public}s', JSON.stringify(err));
    throw err;
  }
}

// ❌ Bad: 忽略错误
async onBackup() {
  this.performBackup();  // 未等待 Promise
  hilog.info(DOMAIN, 'testTag', 'onBackup ok');
}
```

### 版本兼容

```typescript
async onRestore(bundleVersion: BundleVersion) {
  // 检查版本，处理数据迁移
  if (bundleVersion.versionCode < MIN_SUPPORTED_VERSION) {
    hilog.warn(DOMAIN, 'testTag', 'Unsupported version');
    return;
  }

  // 根据版本执行不同的恢复逻辑
  if (bundleVersion.versionCode < DATA_FORMAT_V2) {
    await this.migrateFromV1ToV2();
  }

  await this.restoreData();
}
```