# 09 - 数据持久化 (Data Persistence)

> HarmonyOS NEXT (API 12) 数据持久化方案全面指南：Preferences、RDB、KV Store、分布式数据对象

---

## 1. 应用数据持久化概述

应用数据持久化的目的是将内存中的数据保存到本地存储设备中，确保应用退出或设备重启后数据不会丢失。HarmonyOS 提供了多种数据持久化方案，以适应不同场景下的需求。

| 方案 | 特点 | 适用场景 |
|------|------|----------|
| Preferences | 轻量级键值存储，非关系型 | 用户偏好、应用配置、少量数据 |
| RDB (关系型数据库) | SQLite 引擎，支持 SQL 语句 | 结构化数据、复杂查询、大量数据 |
| KV Store (键值型数据库) | 分布式键值数据库 | 需要跨设备同步的键值数据 |
| 分布式数据对象 | 跨设备数据同步的 JS 对象 | 实时跨设备数据共享 |

**核心能力：**

- 数据持久化存储与读取
- 数据加密存储（安全等级保护）
- 跨设备数据同步（分布式场景）
- 备份与恢复支持

> **官方文档：** [应用数据持久化概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/app-data-persistence-overview-V5)

---

## 2. Preferences (用户首选项)

Preferences 是一个轻量级的键值对存储系统，适用于存储应用的配置信息和用户偏好设置。它通过键（Key）来访问值（Value），支持多种数据类型。

### 2.1 特性

- **轻量级**：适合存储少量数据（建议 < 100 条）
- **非关系型**：纯键值对存储结构
- **同步/异步读取**：支持同步和异步两种读取方式
- **数据持久化**：flush 操作确保数据写入磁盘
- **数据隔离**：每个应用拥有独立的 Preferences 实例

### 2.2 支持的数据类型

| 类型 | 说明 |
|------|------|
| `string` | 字符串 |
| `number` | 数字 |
| `boolean` | 布尔值 |
| `undefined` | 未定义（删除键） |

### 2.3 基本使用

```typescript
import { preferences } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';

// 1. 获取 Preferences 实例
async function getPreferences(context: common.Context): Promise<preferences.Preferences> {
  return await preferences.getPreferences(context, 'my_preferences');
}

// 2. 写入数据
async function writeData(pref: preferences.Preferences): Promise<void> {
  await pref.put('username', 'harmony_user');
  await pref.put('isLoggedIn', true);
  await pref.put('fontSize', 16);
  // flush 将数据写入磁盘
  await pref.flush();
}

// 3. 读取数据
async function readData(pref: preferences.Preferences): Promise<void> {
  const username: string = await pref.get('username', 'default_name');
  const isLoggedIn: boolean = await pref.get('isLoggedIn', false);
  const fontSize: number = await pref.get('fontSize', 14);
  console.log(`username: ${username}, isLoggedIn: ${isLoggedIn}, fontSize: ${fontSize}`);
}

// 4. 删除数据
async function deleteData(pref: preferences.Preferences): Promise<void> {
  await pref.delete('temporary_key');
  await pref.flush();
}
```

### 2.4 监听数据变化

```typescript
// 订阅数据变化
pref.on('change', (key: string) => {
  console.log(`Preference ${key} has changed`);
});

// 取消订阅
pref.off('change');
```

### 2.5 最佳实践

- 使用 `flush()` 批量写入，避免频繁 IO 操作
- 为不同模块使用不同的 Preferences 实例（不同的名称）
- 不要在 UI 主线程执行大量 Preferences 读取操作
- 包含敏感数据时，使用加密存储

> **官方文档：** [Preferences 开发指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/data-persistence-by-preferences-V5)

---

## 3. RDB (关系型数据库)

RDB 基于 SQLite 引擎，提供完整的关系型数据库能力。支持 SQL 语句、事务、约束和索引，适用于存储结构化数据。

### 3.1 核心概念

- **Store (数据库)**：一个 RDB 文件对应一个数据库实例
- **Table (表)**：数据以表的形式组织
- **SQL (结构化查询语言)**：标准 SQL 操作
- **ResultSet (结果集)**：查询结果集合

### 3.2 基本使用

```typescript
import { relationalStore } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';

// 1. 数据库配置
const STORE_CONFIG: relationalStore.StoreConfig = {
  name: 'MyApp.db',
  securityLevel: relationalStore.SecurityLevel.S1,
  encrypt: false, // 是否加密
};

// 2. 创建/打开数据库
async function createDb(context: common.Context): Promise<relationalStore.RdbStore> {
  return await relationalStore.getRdbStore(context, STORE_CONFIG);
}

// 3. 创建表
async function createTable(store: relationalStore.RdbStore): Promise<void> {
  const SQL_CREATE_TABLE = `
    CREATE TABLE IF NOT EXISTS user (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      age INTEGER,
      email TEXT UNIQUE,
      created_at TEXT DEFAULT (datetime('now', 'localtime'))
    )
  `;
  await store.executeSql(SQL_CREATE_TABLE);
}

// 4. 插入数据
async function insertData(store: relationalStore.RdbStore): Promise<number> {
  const user = {
    name: 'Alice',
    age: 28,
    email: 'alice@example.com',
  };
  return await store.insert('user', user); // 返回 rowId
}

// 5. 查询数据
async function queryData(store: relationalStore.RdbStore): Promise<void> {
  const predicates = new relationalStore.RdbPredicates('user');
  predicates.equalTo('name', 'Alice');
  predicates.orderByAsc('created_at');

  const resultSet: relationalStore.ResultSet = await store.query(predicates, ['id', 'name', 'age', 'email']);

  while (resultSet.goToNextRow()) {
    const id = resultSet.getLong(resultSet.getColumnIndex('id'));
    const name = resultSet.getString(resultSet.getColumnIndex('name'));
    const age = resultSet.getLong(resultSet.getColumnIndex('age'));
    console.log(`user: ${id}, ${name}, ${age}`);
  }

  resultSet.close(); // 必须关闭资源
}

// 6. 更新数据
async function updateData(store: relationalStore.RdbStore): Promise<number> {
  const predicates = new relationalStore.RdbPredicates('user');
  predicates.equalTo('id', 1);

  const updatedUser = { age: 29, name: 'Alice Updated' };
  return await store.update(updatedUser, predicates); // 返回影响行数
}

// 7. 删除数据
async function deleteData(store: relationalStore.RdbStore): Promise<number> {
  const predicates = new relationalStore.RdbPredicates('user');
  predicates.lessThan('id', 10);
  return await store.delete(predicates);
}
```

### 3.3 事务处理

```typescript
async function transactionalWrite(store: relationalStore.RdbStore): Promise<void> {
  // 开启事务
  await store.beginTransaction();

  try {
    const predicates = new relationalStore.RdbPredicates('user');
    predicates.equalTo('id', 1);

    await store.executeSql('UPDATE user SET age = age + 1 WHERE id = ?', ['1']);

    // 提交事务
    await store.commit();
  } catch (error) {
    // 回滚事务
    await store.rollback();
    console.error(`Transaction failed: ${error}`);
  }
}
```

### 3.4 安全等级说明

| 等级 | 说明 | 适用数据 |
|------|------|----------|
| S1 | 低安全级 | 公开数据、天气信息 |
| S2 | 中安全级 | 用户个人信息 |
| S3 | 较高安全级 | 联系人、短信 |
| S4 | 高安全级 | 支付信息、生物特征 |

### 3.5 最佳实践

- 为数据库设置合适的安全等级（`securityLevel`）
- 敏感数据启用数据库加密（`encrypt: true`）
- 使用事务处理批量写入操作
- 及时关闭 ResultSet 释放资源
- 使用参数化查询防止 SQL 注入
- 为常用查询字段建立索引

> **官方文档：** [关系型数据库 API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/js-apis-data-relationalstore-V5)

---

## 4. 键值型数据库 (KV Store)

KV Store 是一种非关系型数据库，以键值对（Key-Value）的方式存储数据。HarmonyOS 的 KV Store 支持单设备版本和分布式版本。

### 4.1 特性

- **高性能**：键值对读写效率高
- **分布式**：支持跨设备数据同步
- **多类型**：支持多种值类型（string, number, boolean, Uint8Array 等）
- **数据加密**：支持加密存储

### 4.2 基本使用

```typescript
import { distributedKVStore } from '@kit.ArkData';
import { common } from '@kit.AbilityKit';

const kvManagerConfig: distributedKVStore.KVManagerConfig = {
  context: getContext() as common.Context,
  bundleName: 'com.example.myapp',
};

// 1. 创建 KV Manager
const kvManager = distributedKVStore.createKVManager(kvManagerConfig);

// 2. 创建/打开 KV Store
async function openKVStore(): Promise<distributedKVStore.SingleKVStore> {
  const options: distributedKVStore.Options = {
    createIfMissing: true,
    encrypt: true,
    backup: false,
    autoSync: true,
    kvStoreType: distributedKVStore.KVStoreType.SINGLE_VERSION, // 单版本
    securityLevel: distributedKVStore.SecurityLevel.S1,
  };

  return await kvManager.getKVStore('my_kv_store', options);
}

// 3. 读写数据
async function kvStoreOperations(store: distributedKVStore.SingleKVStore): Promise<void> {
  // 写入
  await store.put('key1', 'value1');
  await store.put('key2', 123);
  await store.put('key3', true);

  // 读取
  const value1 = await store.get('key1');
  console.log(`key1 = ${value1}`);

  // 删除
  await store.delete('key3');
}

// 4. 批量操作
async function batchOperations(store: distributedKVStore.SingleKVStore): Promise<void> {
  const entries: distributedKVStore.Entry[] = [
    { key: 'batch1', value: { type: distributedKVStore.ValueType.STRING, value: 'data1' } },
    { key: 'batch2', value: { type: distributedKVStore.ValueType.INTEGER, value: 42 } },
  ];

  // 批量写入
  await store.putBatch(entries);

  // 批量获取
  const results = await store.getBatch(['batch1', 'batch2']);
}
```

### 4.3 分布式同步

```typescript
// 启用自动同步（在 Options 中设置 autoSync: true）
// 或手动触发同步
async function manualSync(store: distributedKVStore.SingleKVStore): Promise<void> {
  try {
    await store.sync(
      ['remote_device_id'],
      distributedKVStore.SyncMode.PUSH_PULL
    );
    console.log('Sync completed');
  } catch (err) {
    console.error(`Sync failed: ${err}`);
  }
}

// 监听数据变更（包括来自其他设备的变更）
store.on('dataChange', distributedKVStore.SubscribeType.SUBSCRIBE_TYPE_ALL, (data) => {
  console.log('Data changed:', JSON.stringify(data));
});
```

> **官方文档：** [键值型数据库 API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/js-apis-distributedkvstore-V5)

---

## 5. 分布式数据对象 (跨设备同步)

分布式数据对象（DistributedDataObject）是一种用于跨设备数据共享的机制。它通过将 JS 对象标记为分布式，使多个设备上的同一对象数据保持同步。

### 5.1 特性

- **实时同步**：数据变化实时同步到其他设备
- **对象化操作**：像操作本地对象一样操作分布式数据
- **自动合并**：内置冲突解决策略
- **会话管理**：支持会话机制管理分布式生命周期

### 5.2 基本使用

```typescript
import { distributedObject } from '@kit.ArkData';

// 1. 创建分布式数据对象
class MyDataModel {
  public count: number = 0;
  public message: string = '';
  public dataList: string[] = [];
}

async function createDistributedObject(): Promise<void> {
  // 创建分布式对象管理器
  const objectManager = distributedObject.createDistributedObjectManager();

  // 创建分布式对象实例
  const myObject = objectManager.genCreate<MyDataModel>('com.example.dataobject', MyDataModel);

  // 2. 监听数据变更
  myObject.on('change', (data: distributedObject.ChangeNotification) => {
    console.log(`Property ${data.changedProperties} changed`);
    console.log(`New count: ${myObject.count}`);
  });

  // 3. 监听状态变更（设备上线/离线）
  myObject.on('status', (data: distributedObject.StatusNotification) => {
    console.log(`Device ${data.deviceId} status: ${data.status}`);
  });

  // 4. 修改数据（会自动同步到其他设备）
  myObject.count = 42;
  myObject.message = 'Hello from device A';
  myObject.dataList = ['item1', 'item2'];

  // 5. 设置会话（同步范围）
  myObject.setSession([
    { deviceId: 'device_1', role: distributedObject.Role.HOLDER },
    { deviceId: 'device_2', role: distributedObject.Role.ACTIVE },
  ]);

  // 6. 保存对象（持久化）
  myObject.save('my_object_key');
}
```

### 5.3 使用场景

- 跨设备的实时协作编辑
- 分布式游戏状态同步
- 多设备间的配置同步
- 跨设备数据共享（如剪贴板、通知）

### 5.4 注意事项

- 分布式数据对象的同步依赖网络条件
- 每个对象的大小应控制在合理范围内
- 高频变更的场景需考虑性能开销
- 需要在设备间建立可信组网关系

> **官方文档：** [分布式数据对象 API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/js-apis-data-distributedobject-V5)

---

## 6. 数据存储方案选择指南

### 6.1 选型决策流程

```
数据特征分析
    |
    ├── 键值对数据 ---> 数据量小？---> Preferences
    |                     数据量大？---> KV Store
    |
    ├── 结构化数据 ---> 简单查询？---> KV Store
    |                     复杂查询？---> RDB
    |
    └── 需要跨设备同步？
                        ├── 键值数据 ---> KV Store (分布式)
                        └── 对象数据 ---> 分布式数据对象
```

### 6.2 方案对比

| 维度 | Preferences | RDB | KV Store | 分布式数据对象 |
|------|-------------|-----|----------|----------------|
| 存储结构 | 键值对 | 关系型表 | 键值对 | JS 对象 |
| 数据量 | 小（< 100条） | 大 | 大 | 中等 |
| 查询能力 | 键查询 | 复杂 SQL | 键查询 | 属性访问 |
| 跨设备同步 | 不支持 | 不支持 | 支持 | 支持 |
| 加密存储 | 支持 | 支持 | 支持 | 无 |
| 事务支持 | 不支持 | 支持 | 不支持 | 不适用 |
| 性能 | 高 | 中 | 高 | 中 |
| 复杂度 | 低 | 高 | 中 | 中 |

---

## 7. 加密存储最佳实践

### 7.1 加密等级选择

```typescript
// RDB 加密
const ENCRYPTED_STORE_CONFIG: relationalStore.StoreConfig = {
  name: 'secure_db.db',
  securityLevel: relationalStore.SecurityLevel.S3,
  encrypt: true, // 启用加密
};

// KV Store 加密
const kvOptions: distributedKVStore.Options = {
  encrypt: true,
  securityLevel: distributedKVStore.SecurityLevel.S3,
  kvStoreType: distributedKVStore.KVStoreType.SINGLE_VERSION,
};
```

### 7.2 安全编码规范

1. **最小数据原则**：仅存储必要数据，避免存储敏感信息
2. **分类分级**：根据数据敏感度设置不同的安全等级
3. **加密优先**：所有用户相关数据优先使用加密存储
4. **密码不落盘**：用户密码不应明文存储，应使用 hash 后存储
5. **定期清理**：定期清理不再需要的缓存和临时数据
6. **错误处理**：正确处理数据库异常，防止信息泄露

### 7.3 数据库备份

```typescript
// 备份 RDB 数据库
async function backupDatabase(): Promise<void> {
  const store = await relationalStore.getRdbStore(getContext(), STORE_CONFIG);
  const backupPath = `${getContext().databaseDir}/backup/MyApp_backup.db`;
  await store.backup(backupPath);
  console.log(`Database backed up to ${backupPath}`);
}

// 恢复 RDB 数据库
async function restoreDatabase(): Promise<void> {
  const store = await relationalStore.getRdbStore(getContext(), STORE_CONFIG);
  const backupPath = `${getContext().databaseDir}/backup/MyApp_backup.db`;
  await store.restore(backupPath);
  console.log('Database restored successfully');
}
```

---

## 8. FAQ 与常见问题

- **Preferences 数据丢失？**：确保调用 `flush()` 写入磁盘
- **RDB 数据库损坏？**：使用 `backup()` 定期备份，避免崩溃时写入
- **跨设备同步失败？**：检查设备是否在同一信任网络，确认设备在线
- **性能问题？**：主线程避免大量数据操作，使用 TaskPool 异步处理

> **官方文档：** [数据存储 FAQ](https://developer.huawei.com/consumer/cn/doc/harmonyos-faqs-V5/faqs-local-database-management-38-V5)

---

## 9. PreferencesUtil 单例封装

以下是一个经过工程化封装的 Preferences 单例工具类，适用于生产环境。

```typescript
// utils/PreferencesUtil.ets
import preferences from '@ohos.data.preferences'

export class PreferencesUtil {
  private static instance: PreferencesUtil
  private preferences: preferences.Preferences | null = null
  private readonly STORE_NAME = 'app_preferences'

  static getInstance(): PreferencesUtil {
    if (!PreferencesUtil.instance) {
      PreferencesUtil.instance = new PreferencesUtil()
    }
    return PreferencesUtil.instance
  }

  // 初始化
  async init(context: Context): Promise<void> {
    try {
      this.preferences = await preferences.getPreferences(context, this.STORE_NAME)
    } catch (error) {
      console.error('Failed to init preferences:', error)
    }
  }

  // 存储数据
  async put(key: string, value: preferences.ValueType): Promise<void> {
    if (!this.preferences) return
    await this.preferences.put(key, value)
    await this.preferences.flush()
  }

  // 获取数据
  async get<T extends preferences.ValueType>(key: string, defaultValue: T): Promise<T> {
    if (!this.preferences) return defaultValue
    return await this.preferences.get(key, defaultValue) as T
  }

  // 删除数据
  async delete(key: string): Promise<void> {
    if (!this.preferences) return
    await this.preferences.delete(key)
    await this.preferences.flush()
  }

  // 检查是否存在
  async has(key: string): Promise<boolean> {
    if (!this.preferences) return false
    return await this.preferences.has(key)
  }

  // 清空所有数据
  async clear(): Promise<void> {
    if (!this.preferences) return
    await this.preferences.clear()
    await this.preferences.flush()
  }
}

export const preferencesUtil = PreferencesUtil.getInstance()
```

### 初始化与使用

```typescript
// 在 EntryAbility 中初始化
export default class EntryAbility extends UIAbility {
  async onCreate(): Promise<void> {
    await preferencesUtil.init(this.context)
  }
}

// 使用示例
await preferencesUtil.put('isDarkMode', true)
await preferencesUtil.put('fontSize', 16)
const isDarkMode = await preferencesUtil.get('isDarkMode', false)
const hasToken = await preferencesUtil.has('userToken')
```

**设计要点：**

- **单例模式**：通过 `getInstance()` 确保全局唯一实例，避免重复创建
- **空安全**：每个方法开头检查 `preferences` 是否已初始化
- **自动持久化**：`put()` / `delete()` / `clear()` 内部自动调用 `flush()`
- **泛型 get**：`get<T>()` 利用泛型避免调用方手动类型转换

---

## 10. RDB Repository 模式

以下展示完整的三层架构模式：DatabaseManager（数据源管理层） + Model（实体定义层） + Repository（数据访问层）。

### 10.1 DatabaseManager 单例

```typescript
// utils/DatabaseManager.ets
import relationalStore from '@ohos.data.relationalStore'

export class DatabaseManager {
  private static instance: DatabaseManager
  private rdbStore: relationalStore.RdbStore | null = null

  private readonly DB_CONFIG: relationalStore.StoreConfig = {
    name: 'MyApp.db',
    securityLevel: relationalStore.SecurityLevel.S1
  }

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager()
    }
    return DatabaseManager.instance
  }

  // 初始化数据库
  async init(context: Context): Promise<void> {
    try {
      this.rdbStore = await relationalStore.getRdbStore(context, this.DB_CONFIG)
      await this.createTables()
    } catch (error) {
      console.error('Failed to init database:', error)
    }
  }

  // 创建表
  private async createTables(): Promise<void> {
    if (!this.rdbStore) return

    const createTaskTable = `
      CREATE TABLE IF NOT EXISTS task (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        completed INTEGER DEFAULT 0,
        priority INTEGER DEFAULT 0,
        created_at INTEGER,
        updated_at INTEGER
      )
    `

    await this.rdbStore.executeSql(createTaskTable)
  }

  // 获取数据库实例
  getStore(): relationalStore.RdbStore | null {
    return this.rdbStore
  }
}

export const dbManager = DatabaseManager.getInstance()
```

### 10.2 实体定义

```typescript
// models/Task.ets
export interface Task {
  id?: number
  title: string
  description?: string
  completed: boolean
  priority: number
  createdAt: number
  updatedAt: number
}

export const TASK_PRIORITY = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2
} as const
```

### 10.3 TaskRepository

```typescript
// repositories/TaskRepository.ets
import relationalStore from '@ohos.data.relationalStore'
import { dbManager } from '../utils/DatabaseManager'
import { Task, TASK_PRIORITY } from '../models/Task'

export class TaskRepository {
  private tableName = 'task'

  // 插入任务
  async insert(task: Omit<Task, 'id'>): Promise<number> {
    const store = dbManager.getStore()
    if (!store) throw new Error('Database not initialized')

    const valueBucket: relationalStore.ValuesBucket = {
      title: task.title,
      description: task.description || '',
      completed: task.completed ? 1 : 0,
      priority: task.priority,
      created_at: task.createdAt,
      updated_at: task.updatedAt
    }

    return await store.insert(this.tableName, valueBucket)
  }

  // 更新任务
  async update(task: Task): Promise<number> {
    const store = dbManager.getStore()
    if (!store) throw new Error('Database not initialized')

    const valueBucket: relationalStore.ValuesBucket = {
      title: task.title,
      description: task.description || '',
      completed: task.completed ? 1 : 0,
      priority: task.priority,
      updated_at: Date.now()
    }

    const predicates = new relationalStore.RdbPredicates(this.tableName)
    predicates.equalTo('id', task.id)

    return await store.update(valueBucket, predicates)
  }

  // 删除任务
  async delete(id: number): Promise<number> {
    const store = dbManager.getStore()
    if (!store) throw new Error('Database not initialized')

    const predicates = new relationalStore.RdbPredicates(this.tableName)
    predicates.equalTo('id', id)

    return await store.delete(predicates)
  }

  // 查询所有任务
  async getAll(): Promise<Task[]> {
    const store = dbManager.getStore()
    if (!store) throw new Error('Database not initialized')

    const predicates = new relationalStore.RdbPredicates(this.tableName)
    predicates.orderByDesc('priority')
    predicates.orderByDesc('created_at')

    const resultSet = await store.query(predicates)
    const tasks: Task[] = []

    while (resultSet.goToNextRow()) {
      tasks.push(this.mapResultSetToTask(resultSet))
    }

    resultSet.close()
    return tasks
  }

  // 根据条件查询
  async getByCompleted(completed: boolean): Promise<Task[]> {
    const store = dbManager.getStore()
    if (!store) throw new Error('Database not initialized')

    const predicates = new relationalStore.RdbPredicates(this.tableName)
    predicates.equalTo('completed', completed ? 1 : 0)
    predicates.orderByDesc('priority')

    const resultSet = await store.query(predicates)
    const tasks: Task[] = []

    while (resultSet.goToNextRow()) {
      tasks.push(this.mapResultSetToTask(resultSet))
    }

    resultSet.close()
    return tasks
  }

  // 根据 ID 查询
  async getById(id: number): Promise<Task | null> {
    const store = dbManager.getStore()
    if (!store) throw new Error('Database not initialized')

    const predicates = new relationalStore.RdbPredicates(this.tableName)
    predicates.equalTo('id', id)

    const resultSet = await store.query(predicates)

    if (resultSet.goToNextRow()) {
      const task = this.mapResultSetToTask(resultSet)
      resultSet.close()
      return task
    }

    resultSet.close()
    return null
  }

  // 切换完成状态
  async toggleComplete(id: number): Promise<void> {
    const task = await this.getById(id)
    if (task) {
      task.completed = !task.completed
      await this.update(task)
    }
  }

  // 结果集映射
  private mapResultSetToTask(resultSet: relationalStore.ResultSet): Task {
    return {
      id: resultSet.getLong(resultSet.getColumnIndex('id')),
      title: resultSet.getString(resultSet.getColumnIndex('title')),
      description: resultSet.getString(resultSet.getColumnIndex('description')),
      completed: resultSet.getLong(resultSet.getColumnIndex('completed')) === 1,
      priority: resultSet.getLong(resultSet.getColumnIndex('priority')),
      createdAt: resultSet.getLong(resultSet.getColumnIndex('created_at')),
      updatedAt: resultSet.getLong(resultSet.getColumnIndex('updated_at'))
    }
  }
}

export const taskRepository = new TaskRepository()
```

**架构要点：**

| 层级 | 职责 | 关键模式 |
|------|------|----------|
| DatabaseManager | 管理数据库连接和表创建 | 单例 + 延迟初始化 |
| Model (Task) | 定义数据结构 | TypeScript interface |
| TaskRepository | 封装 CRUD 操作 | Repository 模式 |

- **DatabaseManager** 单例管理 `RdbStore` 生命周期
- **TaskRepository** 不直接持有 store，通过 `dbManager.getStore()` 获取
- **mapResultSetToTask** 统一处理 ResultSet 到实体对象的映射，避免代码重复
- **toggleComplete** 演示了基于 `getById` + `update` 的组合操作

---

## 11. 快速参考

### Preferences API

| 方法 | 用途 |
|------|------|
| `getPreferences()` | 获取 Preferences 实例 |
| `put()` | 存储数据 |
| `get()` | 获取数据 |
| `delete()` | 删除数据 |
| `has()` | 检查是否存在 |
| `clear()` | 清空所有数据 |
| `flush()` | 持久化到磁盘 |

### RDB API

| 方法 | 用途 |
|------|------|
| `getRdbStore()` | 获取数据库实例 |
| `executeSql()` | 执行 SQL |
| `insert()` | 插入数据 |
| `update()` | 更新数据 |
| `delete()` | 删除数据 |
| `query()` | 查询数据 |
| `RdbPredicates` | 查询条件构建器 |

### 文件存储路径

| 路径 | 说明 |
|------|------|
| `context.filesDir` | 应用文件目录 |
| `context.cacheDir` | 缓存目录 |
| `context.tempDir` | 临时目录 |

### 存储方案选择

| 场景 | 推荐方案 |
|------|----------|
| 用户设置、开关 | Preferences |
| 简单键值数据 | KV-Store |
| 复杂关联数据 | RDB |
| 大文件、媒体 | 文件存储 |

---

## 参考链接

- [应用数据持久化概述](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/app-data-persistence-overview-V5)
- [Preferences 开发指南](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/data-persistence-by-preferences-V5)
- [关系型数据库 API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/js-apis-data-relationalstore-V5)
- [键值型数据库 API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/js-apis-distributedkvstore-V5)
- [分布式数据对象 API 参考](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/js-apis-data-distributedobject-V5)
- [数据存储 FAQ](https://developer.huawei.com/consumer/cn/doc/harmonyos-faqs-V5/faqs-local-database-management-38-V5)
