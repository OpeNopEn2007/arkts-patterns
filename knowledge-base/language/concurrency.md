# ArkTS 并发模型

> 适用版本: HarmonyOS NEXT (API 12+)

## 概述

ArkTS 基于 Actor 并发模型，提供 TaskPool 和 Worker 两种并发机制。正确使用并发是构建高性能 HarmonyOS 应用的关键。

---

## TaskPool - 任务池

TaskPool 适用于 CPU 密集型任务，提供自动负载均衡和优先级调度。

### 基本使用

```typescript
import taskpool from '@ohos.taskpool'

// 定义并发任务
@Concurrent
function computeHeavy(n: number): number {
  let result = 0
  for (let i = 0; i < n; i++) {
    result += Math.sqrt(i)
  }
  return result
}

@Entry
@Component
struct TaskPoolDemo {
  @State result: number = 0

  async runTask() {
    const task = new taskpool.Task(computeHeavy, 1000000)
    this.result = await taskpool.execute(task)
  }

  build() {
    Column() {
      Text(`Result: ${this.result}`)
      Button('Run Task')
        .onClick(() => this.runTask())
    }
  }
}
```

### 任务优先级

```typescript
// 设置任务优先级
const task = new taskpool.Task(computeHeavy, 1000000)
await taskpool.execute(task, taskpool.Priority.HIGH)

// 优先级选项
// taskpool.Priority.HIGH - 高优先级
// taskpool.Priority.MEDIUM - 中优先级（默认）
// taskpool.Priority.LOW - 低优先级
```

### 任务组

并行执行多个任务并等待所有结果。

```typescript
@Concurrent
function processData(data: number[]): number {
  return data.reduce((sum, val) => sum + val, 0)
}

async function runTaskGroup() {
  const taskgroup = new taskpool.TaskGroup()

  // 添加多个任务到任务组
  taskgroup.addTask(new taskpool.Task(processData, [1, 2, 3]))
  taskgroup.addTask(new taskpool.Task(processData, [4, 5, 6]))
  taskgroup.addTask(new taskpool.Task(processData, [7, 8, 9]))

  // 执行任务组
  const results = await taskpool.execute(taskgroup)
  console.log('All results:', results) // [6, 15, 24]
}
```

### 任务依赖

API 12+ 支持设置任务依赖关系。

```typescript
async function runWithDependency() {
  const task1 = new taskpool.Task(() => {
    console.log('Task 1 executed')
    return 'Result 1'
  })

  const task2 = new taskpool.Task(() => {
    console.log('Task 2 executed after Task 1')
    return 'Result 2'
  })

  // Task2 依赖 Task1
  task2.addDependency(task1)

  // 并行提交
  taskpool.execute(task1)
  taskpool.execute(task2)
}
```

### 长时任务

对于执行时间超过 3 分钟的任务，需要声明为长时任务。

```typescript
@Concurrent
function longRunningTask(): void {
  // 长时间运行的任务
}

async function runLongTask() {
  const task = new taskpool.Task(longRunningTask)
  taskpool.execute(task, taskpool.Priority.DEFAULT, true) // true = 长时任务
}
```

---

## Worker - 独立线程

Worker 适用于长时间后台任务，拥有独立线程。

### 创建 Worker

```typescript
// worker.ts
import worker from '@ohos.worker'

const workerPort = worker.workerPort

workerPort.onmessage = (e) => {
  const data = e.data
  // 处理数据
  const result = heavyComputation(data)
  // 返回结果
  workerPort.postMessage(result)
}

function heavyComputation(data: any): any {
  // 复杂计算
  return data
}
```

### 主线程使用 Worker

```typescript
import worker from '@ohos.worker'

@Entry
@Component
struct WorkerDemo {
  @State result: string = ''
  private worker?: worker.ThreadWorker

  aboutToAppear() {
    // 创建 Worker
    this.worker = new worker.ThreadWorker('entry/ets/workers/worker.ts')

    // 接收 Worker 消息
    this.worker.onmessage = (e) => {
      this.result = e.data
    }

    this.worker.onerror = (e) => {
      console.error('Worker error:', e.message)
    }
  }

  aboutToDisappear() {
    // 销毁 Worker
    this.worker?.terminate()
  }

  build() {
    Column() {
      Text(this.result)
      Button('Send Task')
        .onClick(() => {
          this.worker?.postMessage({ task: 'compute', data: 100 })
        })
    }
  }
}
```

---

## TaskPool vs Worker 选择指南

| 特性 | TaskPool | Worker |
|------|----------|--------|
| 适用场景 | CPU 密集型、短时任务 | 长时后台任务、独立线程 |
| 线程管理 | 自动管理线程池 | 手动创建销毁 |
| 任务时长 | < 3 分钟（默认） | 无限制 |
| 通信方式 | 任务参数传递 | postMessage |
| 负载均衡 | 自动 | 手动 |
| 优先级 | 支持 | 不支持 |

### 选择建议

```typescript
// ✅ Good: CPU 密集型任务使用 TaskPool
async function processImage(imageData: ImageData) {
  const task = new taskpool.Task(imageFilter, imageData)
  return await taskpool.execute(task)
}

// ✅ Good: 长时间后台同步使用 Worker
function startFileSync() {
  const worker = new worker.ThreadWorker('workers/sync.ts')
  worker.postMessage({ command: 'start' })
}

// ❌ Bad: 简单计算使用并发（过度设计）
async function add(a: number, b: number) {
  const task = new taskpool.Task((x, y) => x + y, a, b) // 不必要
  return await taskpool.execute(task)
}
```

---

## 并发最佳实践

### 1. 避免阻塞 UI 线程

```typescript
// ❌ Bad: 在 UI 线程执行耗时操作
Button('Process')
  .onClick(() => {
    const result = heavyComputation(1000000) // 阻塞 UI
  })

// ✅ Good: 使用 TaskPool
Button('Process')
  .onClick(async () => {
    const task = new taskpool.Task(heavyComputation, 1000000)
    this.result = await taskpool.execute(task)
  })
```

### 2. 合理设置任务大小

```typescript
// ❌ Bad: 任务粒度太小，调度开销大
for (let i = 0; i < 10000; i++) {
  const task = new taskpool.Task(smallTask, i)
  taskpool.execute(task)
}

// ✅ Good: 批量处理
const task = new taskpool.Task(batchProcess, dataArray)
await taskpool.execute(task)
```

### 3. 正确处理任务取消

```typescript
async function runCancellableTask() {
  const task = new taskpool.Task(longTask)

  // 设置超时
  const timeout = setTimeout(() => {
    taskpool.cancel(task)
  }, 5000)

  try {
    const result = await taskpool.execute(task)
    clearTimeout(timeout)
    return result
  } catch (e) {
    if (e.message.includes('cancelled')) {
      console.log('Task was cancelled')
    }
  }
}
```

### 4. 错误处理

```typescript
@Concurrent
function mightFailTask(): string {
  if (Math.random() > 0.5) {
    throw new Error('Task failed')
  }
  return 'Success'
}

async function runWithErrorHandling() {
  try {
    const task = new taskpool.Task(mightFailTask)
    const result = await taskpool.execute(task)
    return result
  } catch (error) {
    console.error('Task failed:', error)
    // 降级处理
    return 'Fallback result'
  }
}
```

---

## 性能优化技巧

1. **任务分片**: 大任务拆分成多个小任务并行执行
2. **优先级调度**: 关键任务设置高优先级
3. **资源复用**: Worker 保持活跃避免重复创建
4. **避免数据复制**: 使用 Transferable 对象减少序列化开销

```typescript
// 使用 ArrayBuffer 传输数据（零拷贝）
@Concurrent
function processBuffer(buffer: ArrayBuffer): ArrayBuffer {
  // 直接操作 buffer
  return buffer
}
```