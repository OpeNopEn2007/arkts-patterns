# 10 - 并发 (TaskPool / Worker)

> HarmonyOS NEXT (API 12) 并发编程完整指南：Promise、async/await、TaskPool、Worker

---

## 1. 异步并发概览 (Promise, async/await)

ArkTS 基于 JavaScript/TypeScript，提供了完善的异步编程支持。异步编程是实现非阻塞操作的核心手段，特别适用于 I/O 操作、网络请求、定时任务等场景。

### 1.1 Promise

Promise 是异步操作的基础容器，表示一个尚未完成但预期会完成的操作。

```typescript
// 创建一个 Promise
function fetchData(url: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // 模拟异步操作
    setTimeout(() => {
      if (url) {
        resolve(`Data from ${url}`);
      } else {
        reject(new Error('Invalid URL'));
      }
    }, 1000);
  });
}

// 使用 Promise
fetchData('https://api.example.com/data')
  .then((data: string) => {
    console.log('Received:', data);
  })
  .catch((error: Error) => {
    console.error('Error:', error.message);
  });
```

### 1.2 async / await

async/await 是 Promise 的语法糖，使异步代码看起来像同步代码，提高可读性。

```typescript
// 声明异步函数
async function loadData(): Promise<void> {
  try {
    const data = await fetchData('https://api.example.com/data');
    console.log('Received:', data);

    const moreData = await fetchData('https://api.example.com/more');
    console.log('More data:', moreData);
  } catch (error) {
    console.error('Failed to load data:', error);
  }
}

// 并行执行
async function loadMultipleData(): Promise<void> {
  try {
    const [data1, data2, data3] = await Promise.all([
      fetchData('https://api.example.com/data1'),
      fetchData('https://api.example.com/data2'),
      fetchData('https://api.example.com/data3'),
    ]);
    console.log('All data loaded:', data1, data2, data3);
  } catch (error) {
    console.error('One or more requests failed:', error);
  }
}

// 竞速执行
async function raceRequests(): Promise<void> {
  try {
    const fastest = await Promise.race([
      fetchData('https://api.example.com/server1'),
      fetchData('https://api.example.com/server2'),
    ]);
    console.log('Fastest response:', fastest);
  } catch (error) {
    console.error('All requests failed:', error);
  }
}
```

### 1.3 错误处理

```typescript
async function safeOperation(): Promise<string | null> {
  try {
    return await fetchData('https://api.example.com/data');
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Operation failed: ${error.message}`);
    }
    return null;
  }
}
```

> **官方文档：** [异步并发概览](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/async-concurrency-overview-V5)

---

## 2. 多线程并发概览 (TaskPool vs Worker 对比)

HarmonyOS 的 ArkTS 提供了两种多线程并发方案：TaskPool 和 Worker。选择合适的方案取决于任务的特性。

### 2.1 对比表格

| 特性 | TaskPool | Worker |
|------|----------|--------|
| 任务类型 | CPU 密集型、短时任务 | 长时运行的后台任务 |
| 生命周期 | 自动管理线程池 | 手动创建和销毁 |
| 线程复用 | 支持（线程池复用） | 每个 Worker 独立线程 |
| 任务优先级 | 支持设置优先级 | 不支持 |
| 通信方式 | 函数式调用（序列化参数/返回值） | 消息传递（postMessage/onMessage） |
| 并发数量 | 系统自动管理 | 开发者控制 |
| 适用场景 | 计算密集型、数据处理 | 复杂后台服务、持续运行任务 |

### 2.2 选择指南

```
任务特征分析
    |
    ├── 短时计算任务（< 3分钟）---> TaskPool
    |   ├── 图片处理
    |   ├── 数据排序/搜索
    |   ├── 加密/解密
    |   └── JSON 序列化/反序列化
    |
    ├── 长时运行任务 ------------> Worker
    |   ├── 后台下载/上传
    |   ├── 音视频处理流
    |   ├── 传感器数据采集
    |   └── WebSocket 长连接
    |
    └── I/O 密集型任务 ----------> async/await + 系统API
        ├── 文件读写
        ├── 网络请求
        └── 数据库操作
```

> **官方文档：** [多线程并发概览](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/multi-thread-concurrency-overview-V5)

---

## 3. TaskPool: CPU 密集型并行任务

TaskPool 提供了一个由系统管理的线程池，用于执行短时间的 CPU 密集型任务。它封装了线程的创建、复用和销毁，开发者只需关注任务逻辑。

### 3.1 核心概念

- **Task**：可执行的任务单元
- **TaskPool**：管理任务执行和线程复用的调度器
- **Priority**：任务优先级（HIGH, MEDIUM, LOW）
- **TaskGroup**：任务组，可以一组任务统一回调

### 3.2 基本使用

```typescript
import { taskpool } from '@kit.ArkTS';

// 1. 定义计算函数（必须使用 @Concurrent 装饰器）
@Concurrent
function computePrimes(limit: number): number[] {
  const primes: number[] = [];
  for (let i = 2; i <= limit; i++) {
    let isPrime = true;
    for (let j = 2; j * j <= i; j++) {
      if (i % j === 0) {
        isPrime = false;
        break;
      }
    }
    if (isPrime) {
      primes.push(i);
    }
  }
  return primes;
}

// 2. 创建并执行任务
async function runTask(): Promise<void> {
  try {
    // 方式一：直接执行
    const result: number[] = await taskpool.execute(computePrimes, [100000]);
    console.log(`Found ${result.length} primes`);

    // 方式二：创建 Task 对象（可复用）
    const task = new taskpool.Task(computePrimes, 50000);
    const result2: number[] = await taskpool.execute(task);
    console.log(`Found ${result2.length} primes in second task`);
  } catch (error) {
    console.error(`Task execution failed: ${error}`);
  }
}
```

### 3.3 任务优先级

```typescript
async function prioritizedTasks(): Promise<void> {
  const highTask = new taskpool.Task(computePrimes, 10000);
  const lowTask = new taskpool.Task(computePrimes, 5000);

  // 设置优先级
  highTask.setPriority(taskpool.Priority.HIGH);
  lowTask.setPriority(taskpool.Priority.LOW);

  // 高优先级任务将优先获得线程资源
  const [highResult, lowResult] = await Promise.all([
    taskpool.execute(highTask),
    taskpool.execute(lowTask),
  ]);
}
```

### 3.4 任务组

```typescript
async function taskGroupExample(): Promise<void> {
  const group = new taskpool.TaskGroup();

  group.addTask(new taskpool.Task(computePrimes, 10000));
  group.addTask(new taskpool.Task(computePrimes, 20000));
  group.addTask(new taskpool.Task(computePrimes, 30000));

  // 等待所有任务完成
  const results = await taskpool.execute(group);
  console.log('All tasks completed:', results);
}
```

### 3.5 限制与注意事项

- TaskPool 函数必须使用 `@Concurrent` 装饰器
- 函数参数和返回值必须是序列化类型
- 不建议在 TaskPool 中执行 I/O 操作（文件、网络等）
- 单次任务执行时间建议不超过 3 分钟
- 不能在 TaskPool 中访问 UI 对象

> **官方文档：** [TaskPool/Worker 开发](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/sync-task-development-V5)

---

## 4. Worker: 长时运行的后台任务

Worker 在独立的线程中运行脚本，适用于需要长时间运行的后台任务。每个 Worker 拥有独立的 JS 运行时环境。

### 4.1 Worker 架构

```
┌──────────────────┐         postMessage          ┌──────────────────┐
│   Main Thread    │ ◄──────────────────────────►  │   Worker Thread  │
│                  │         onMessage             │                  │
│  - UI Rendering  │                               │  - Heavy Calc    │
│  - Event Handling│                               │  - Data Process  │
│  - System API    │                               │  - Background I/O│
└──────────────────┘                               └──────────────────┘
```

### 4.2 Worker 脚本创建

**Worker 文件：`workers/DataWorker.ets`**

```typescript
// workers/DataWorker.ets
import { worker, ThreadWorkerGlobalScope } from '@kit.ArkTS';

const workerPort: ThreadWorkerGlobalScope = worker.workerPort;

// 监听主线程消息
workerPort.onmessage = (message: worker.ThreadWorkerMessage): void => {
  const { type, data } = message.data;

  switch (type) {
    case 'processArray':
      const processed = data.map((item: number) => item * 2);
      workerPort.postMessage({ type: 'result', data: processed });
      break;

    case 'heavyCalculation':
      // 执行长时间计算
      let result = 0;
      for (let i = 0; i < data.iterations; i++) {
        result += Math.sqrt(i);
      }
      workerPort.postMessage({ type: 'calcResult', data: result });
      break;

    default:
      workerPort.postMessage({ type: 'error', data: 'Unknown command' });
  }
};

// 错误处理
workerPort.onerror = (error: ErrorEvent): void => {
  console.error(`Worker error: ${error.message}`);
};
```

### 4.3 主线程使用 Worker

```typescript
import { worker } from '@kit.ArkTS';

// 1. 创建 Worker 实例
const dataWorker: worker.ThreadWorker = new worker.ThreadWorker(
  'workers/DataWorker.ets',
  { name: 'Data Processing Worker' }
);

// 2. 接收 Worker 消息
dataWorker.onmessage = (message: worker.MessageEvents): void => {
  const { type, data } = message.data;
  switch (type) {
    case 'result':
      console.log('Processed result:', data);
      break;
    case 'calcResult':
      console.log('Calculation result:', data);
      break;
    case 'error':
      console.error('Worker error:', data);
      break;
  }
};

// 3. 发送消息到 Worker
function sendTaskToWorker(): void {
  // 发送数组处理任务
  dataWorker.postMessage({
    type: 'processArray',
    data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  });

  // 发送计算任务
  dataWorker.postMessage({
    type: 'heavyCalculation',
    data: { iterations: 10000000 },
  });
}

// 4. 关闭 Worker
function destroyWorker(): void {
  dataWorker.onmessage = null; // 清除消息监听
  dataWorker.terminate();      // 终止 Worker
}
```

### 4.4 错误与调试

```typescript
// 监听 Worker 错误
dataWorker.onerror = (error: ErrorEvent): void => {
  console.error(`Worker error: ${error.message}`);
  console.error(`Error at: ${error.filename}:${error.lineno}`);
};

// 监听 Worker 退出
dataWorker.onmessageerror = (): void => {
  console.error('Received unserializable message');
};
```

### 4.5 Worker 的最佳实践

- **资源管理**：不再使用时及时调用 `terminate()`
- **消息大小**：避免传输大数据对象（建议分段传输）
- **错误处理**：必须处理 onerror 事件
- **数量控制**：避免创建过多 Worker（建议不超过 CPU 核心数 - 1）
- **状态管理**：Worker 内不依赖外部状态，通过消息传递

---

## 5. 同步任务开发

虽然 ArkTS 以异步为主，但某些场景下需要同步操作。

### 5.1 同步锁

```typescript
// 使用锁确保共享资源的互斥访问
import { ArkTSUtils } from '@kit.ArkTS';

class SharedCounter {
  private count: number = 0;
  private lock: ArkTSUtils.lock = new ArkTSUtils.lock();

  async increment(): Promise<void> {
    await this.lock.lockAsync();
    try {
      this.count++;
    } finally {
      this.lock.unlock();
    }
  }

  getCount(): number {
    return this.count;
  }
}
```

### 5.2 任务执行模式总结

| 模式 | 关键字/API | 用途 |
|------|-----------|------|
| 异步回调 | Callback | 传统异步模式 |
| Promise | `.then()`, `.catch()` | 链式异步 |
| async/await | `async`, `await` | 同步风格异步 |
| TaskPool | `taskpool.execute()` | 短时并行计算 |
| Worker | `worker.postMessage()` | 长时后台任务 |
| 同步 | `synchronized`, `lock` | 互斥访问 |

---

## 6. 线程模型 (Stage 模型)

HarmonyOS NEXT 的 Stage 模型定义了应用进程和线程的架构。

### 6.1 Stage 模型的线程结构

```
┌──────────────────────────────────────────┐
│              Application Process          │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │        Main Thread (UI)          │   │
│  │  - ArkUI 渲染引擎                 │   │
│  │  - 事件分发                      │   │
│  │  - Ability 生命周期              │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │    TaskPool (线程池)             │   │
│  │  - 自动管理线程                  │   │
│  │  - 任务队列调度                  │   │
│  │  - 线程复用                      │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │    Worker 1 (独立线程)           │   │
│  │  - 独立运行环境                  │   │
│  │  - 消息通信                      │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │    Worker 2 (独立线程)           │   │
│  │  - 独立运行环境                  │   │
│  │  - 消息通信                      │   │
│  └──────────────────────────────────┘   │
└──────────────────────────────────────────┘
```

### 6.2 关键说明

- **主线程**：负责 UI 渲染和事件处理，是 ArkTS 应用的唯一 UI 线程
- **TaskPool**：系统管理的线程池，自动调度和复用线程
- **Worker**：开发者创建和管理的独立线程，有独立的 ArkTS 运行环境
- **线程隔离**：Worker 之间、TaskPool 任务之间互不干扰

---

## 7. 主线程限制和最佳实践

### 7.1 主线程限制

主线程（UI 线程）负责界面渲染和用户交互，任何耗时操作都会阻塞 UI：

- **禁止在主线程执行**：
  - 超过 5ms 的同步计算
  - 大数据量的 JSON 序列化/反序列化
  - 复杂的数据排序/搜索
  - 图片处理、音视频编解码
- **始终异步执行**：
  - 文件读写操作
  - 网络请求
  - 数据库查询
  - 复杂的数学计算

### 7.2 最佳实践清单

```typescript
// 正确做法：异步 + 多线程

// 1. I/O 操作使用 async/await
async function loadFileCorrectly(filePath: string): Promise<string> {
  return await fs.readText(filePath); // 系统 API 已经是异步的
}

// 2. CPU 密集型使用 TaskPool
@Concurrent
function processLargeData(data: number[]): number[] {
  return data.map(item => item * 2).sort();
}

// 3. 长时间任务使用 Worker
function startBackendTask(): void {
  const bgWorker = new worker.ThreadWorker('workers/BackgroundWorker.ets');
  bgWorker.postMessage({ command: 'start' });
}

// 4. UI 更新回到主线程
async function updateUIAfterTask(): Promise<void> {
  const result = await taskpool.execute(heavyCalculation, [data]);
  // 这里的 await 已经让执行回到主线程，可以直接更新 UI
  this.uiData = result;
}
```

### 7.3 性能监测

```typescript
// 检测主线程是否被阻塞
function checkMainThreadBlocked(): void {
  const start = Date.now();
  // 如果是主线程，这里应该立即执行
  setTimeout(() => {
    const elapsed = Date.now() - start;
    if (elapsed > 16) { // 超过 16ms 约 60fps 的一帧
      console.warn(`Main thread blocked for ${elapsed}ms`);
    }
  }, 0);
}
```

### 7.4 常见陷阱

| 陷阱 | 说明 | 解决方案 |
|------|------|----------|
| 主线程计算 | 在主线程执行耗时计算 | 使用 TaskPool |
| 忘记 await | Promise 未等待直接使用 | 使用 `await` 或 `.then()` |
| 过度创建 Worker | 创建大量 Worker 消耗资源 | 使用线程池或 TaskPool |
| 内存泄露 | Worker 未正确关闭 | 在生命周期结束时 `terminate()` |
| 大数据传输 | 在并发间频繁传递大数据 | 分片处理或使用共享内存 |

> **官方文档：** [TaskPool/Worker 开发](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/sync-task-development-V5)

---

## 8. 常见反模式与最佳实践

以下是并发编程中容易犯的错误以及推荐的修正方式。

### 8.1 阻塞 UI 线程

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

### 8.2 任务粒度太小

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

### 8.3 未处理任务取消

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

### 8.4 缺少错误处理

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

### 8.5 性能优化技巧

1. **任务分片**：大任务拆分成多个小任务并行执行
2. **优先级调度**：关键任务设置高优先级
3. **资源复用**：Worker 保持活跃避免重复创建
4. **避免数据复制**：使用 Transferable 对象减少序列化开销

```typescript
// 使用 ArrayBuffer 传输数据（零拷贝）
@Concurrent
function processBuffer(buffer: ArrayBuffer): ArrayBuffer {
  // 直接操作 buffer
  return buffer
}
```

---

## 参考链接

- [异步并发概览](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/async-concurrency-overview-V5)
- [多线程并发概览](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/multi-thread-concurrency-overview-V5)
- [TaskPool/Worker (EN)](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/sync-task-development-V5)
