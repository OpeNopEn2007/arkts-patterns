# ArkTS 数据持久化模式

> 适用版本: HarmonyOS NEXT (API 12+)

## 概述

HarmonyOS 提供多种数据持久化方案，根据数据量和复杂度选择合适的存储方式。

---

## 存储方案对比

| 方案 | 适用场景 | 数据量 | 复杂度 |
|------|----------|--------|--------|
| Preferences | 配置项、用户偏好 | < 1KB | 简单 |
| 键值数据库 (KV-Store) | 简单结构数据 | < 几MB | 中等 |
| 关系型数据库 (RDB) | 复杂结构数据 | 无限制 | 复杂 |
| 文件存储 | 大文件、二进制 | 无限制 | 灵活 |

---

## Preferences - 用户首选项

### 基本使用

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

### 在 Ability 中初始化

```typescript
// entry/src/main/ets/entryability/EntryAbility.ets
import { preferencesUtil } from '../utils/PreferencesUtil'

export default class EntryAbility extends UIAbility {
  async onCreate(): Promise<void> {
    // 初始化 Preferences
    await preferencesUtil.init(this.context)
  }
}
```

### 使用示例

```typescript
// 存储用户偏好
await preferencesUtil.put('isDarkMode', true)
await preferencesUtil.put('fontSize', 16)
await preferencesUtil.put('lastLoginTime', Date.now())

// 读取用户偏好
const isDarkMode = await preferencesUtil.get('isDarkMode', false)
const fontSize = await preferencesUtil.get('fontSize', 14)

// 删除
await preferencesUtil.delete('tempData')

// 检查是否存在
const hasToken = await preferencesUtil.has('userToken')
```

---

## 关系型数据库 (RDB)

### 数据库管理器

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

### 实体类与 Repository

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

### 在组件中使用

```typescript
// pages/TaskPage.ets
import { taskRepository } from '../repositories/TaskRepository'
import { Task, TASK_PRIORITY } from '../models/Task'

@Entry
@Component
struct TaskPage {
  @State tasks: Task[] = []
  @State loading: boolean = true

  async aboutToAppear() {
    await this.loadTasks()
  }

  async loadTasks() {
    this.loading = true
    try {
      this.tasks = await taskRepository.getAll()
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      this.loading = false
    }
  }

  async addTask(title: string) {
    const now = Date.now()
    await taskRepository.insert({
      title,
      completed: false,
      priority: TASK_PRIORITY.MEDIUM,
      createdAt: now,
      updatedAt: now
    })
    await this.loadTasks()
  }

  async toggleTask(task: Task) {
    await taskRepository.toggleComplete(task.id!)
    await this.loadTasks()
  }

  async deleteTask(id: number) {
    await taskRepository.delete(id)
    await this.loadTasks()
  }

  build() {
    Column() {
      if (this.loading) {
        LoadingProgress()
      } else {
        List() {
          ForEach(this.tasks, (task: Task) => {
            ListItem() {
              Row() {
                Checkbox()
                  .select(task.completed)
                  .onChange(() => this.toggleTask(task))
                Text(task.title)
                  .layoutWeight(1)
                  .decoration({ type: task.completed ? TextDecorationType.LineThrough : TextDecorationType.None })
                Button('删除')
                  .onClick(() => this.deleteTask(task.id!))
              }
            }
          }, (task: Task) => task.id!.toString())
        }
      }
    }
  }
}
```

---

## 文件存储

### 文件操作工具

```typescript
// utils/FileUtil.ets
import fs from '@ohos.file.fs'

export class FileUtil {
  // 写入文件
  static async writeText(context: Context, fileName: string, content: string): Promise<void> {
    const filePath = `${context.filesDir}/${fileName}`

    try {
      const file = fs.openSync(filePath, fs.OpenMode.CREATE | fs.OpenMode.WRITE_ONLY)
      fs.writeSync(file.fd, content)
      fs.closeSync(file)
    } catch (error) {
      console.error('Failed to write file:', error)
      throw error
    }
  }

  // 读取文件
  static async readText(context: Context, fileName: string): Promise<string> {
    const filePath = `${context.filesDir}/${fileName}`

    try {
      const file = fs.openSync(filePath, fs.OpenMode.READ_ONLY)
      const stat = fs.statSync(filePath)
      const buffer = new ArrayBuffer(stat.size)
      fs.readSync(file.fd, buffer)
      fs.closeSync(file)

      const decoder = new util.TextDecoder('utf-8')
      return decoder.decodeToString(new Uint8Array(buffer))
    } catch (error) {
      console.error('Failed to read file:', error)
      throw error
    }
  }

  // 删除文件
  static async delete(context: Context, fileName: string): Promise<void> {
    const filePath = `${context.filesDir}/${fileName}`

    try {
      if (fs.accessSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  }

  // 检查文件是否存在
  static exists(context: Context, fileName: string): boolean {
    const filePath = `${context.filesDir}/${fileName}`

    try {
      return fs.accessSync(filePath)
    } catch {
      return false
    }
  }

  // 获取文件大小
  static getSize(context: Context, fileName: string): number {
    const filePath = `${context.filesDir}/${fileName}`

    try {
      const stat = fs.statSync(filePath)
      return stat.size
    } catch {
      return 0
    }
  }
}
```

### JSON 文件存储

```typescript
// utils/JsonStorage.ets
import { FileUtil } from './FileUtil'

export class JsonStorage {
  static async save<T>(context: Context, fileName: string, data: T): Promise<void> {
    const json = JSON.stringify(data, null, 2)
    await FileUtil.writeText(context, fileName, json)
  }

  static async load<T>(context: Context, fileName: string, defaultValue: T): Promise<T> {
    if (!FileUtil.exists(context, fileName)) {
      return defaultValue
    }

    try {
      const json = await FileUtil.readText(context, fileName)
      return JSON.parse(json) as T
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      return defaultValue
    }
  }
}
```

---

## 数据迁移

### 版本管理

```typescript
// utils/DatabaseMigration.ets
import relationalStore from '@ohos.data.relationalStore'

export class DatabaseMigration {
  private static readonly VERSION_KEY = 'db_version'
  private static readonly CURRENT_VERSION = 2

  static async migrate(store: relationalStore.RdbStore): Promise<void> {
    const currentVersion = await this.getCurrentVersion(store)

    if (currentVersion < 1) {
      await this.migrateToV1(store)
    }
    if (currentVersion < 2) {
      await this.migrateToV2(store)
    }
    // 添加更多版本迁移...
  }

  private static async getCurrentVersion(store: relationalStore.RdbStore): Promise<number> {
    try {
      const resultSet = await store.querySql('PRAGMA user_version')
      if (resultSet.goToNextRow()) {
        return resultSet.getLong(0)
      }
      return 0
    } catch {
      return 0
    }
  }

  private static async migrateToV1(store: relationalStore.RdbStore): Promise<void> {
    await store.executeSql(`
      CREATE TABLE IF NOT EXISTS task (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        completed INTEGER DEFAULT 0
      )
    `)
    await store.executeSql('PRAGMA user_version = 1')
  }

  private static async migrateToV2(store: relationalStore.RdbStore): Promise<void> {
    await store.executeSql(`
      ALTER TABLE task ADD COLUMN priority INTEGER DEFAULT 0
    `)
    await store.executeSql(`
      ALTER TABLE task ADD COLUMN created_at INTEGER
    `)
    await store.executeSql('PRAGMA user_version = 2')
  }
}
```

---

## 快速参考

### Preferences

| 方法 | 用途 |
|------|------|
| `getPreferences()` | 获取 Preferences 实例 |
| `put()` | 存储数据 |
| `get()` | 获取数据 |
| `delete()` | 删除数据 |
| `has()` | 检查是否存在 |
| `clear()` | 清空所有数据 |
| `flush()` | 持久化到磁盘 |

### RDB

| 方法 | 用途 |
|------|------|
| `getRdbStore()` | 获取数据库实例 |
| `executeSql()` | 执行 SQL |
| `insert()` | 插入数据 |
| `update()` | 更新数据 |
| `delete()` | 删除数据 |
| `query()` | 查询数据 |
| `RdbPredicates` | 查询条件构建器 |

### 文件存储

| 路径 | 说明 |
|------|------|
| `context.filesDir` | 应用文件目录 |
| `context.cacheDir` | 缓存目录 |
| `context.tempDir` | 临时目录 |

### 存储选择

| 场景 | 推荐方案 |
|------|----------|
| 用户设置、开关 | Preferences |
| 简单键值数据 | KV-Store |
| 复杂关联数据 | RDB |
| 大文件、媒体 | 文件存储 |