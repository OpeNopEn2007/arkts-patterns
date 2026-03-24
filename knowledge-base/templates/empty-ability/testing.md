# 测试配置 (Hypium 框架)

Hypium 是 HarmonyOS 官方测试框架，支持单元测试和仪器测试。

---

## 测试目录结构

```
entry/
├── src/test/                    # 本地单元测试
│   ├── List.test.ets           # 测试列表
│   └── LocalUnit.test.ets      # 单元测试
│
└── src/ohosTest/               # 仪器测试
    ├── ets/test/
    │   ├── Ability.test.ets    # Ability 测试
    │   └── List.test.ets       # 测试列表
    └── module.json5            # 测试模块配置
```

---

## 测试代码模板

### 基本结构

```typescript
import { describe, beforeAll, beforeEach, afterEach, afterAll, it, expect } from '@ohos/hypium';

export default function localUnitTest() {
  describe('localUnitTest', () => {
    beforeAll(() => {
      // 所有测试前执行一次
    });

    beforeEach(() => {
      // 每个测试前执行
    });

    afterEach(() => {
      // 每个测试后执行
    });

    afterAll(() => {
      // 所有测试后执行一次
    });

    it('assertContain', 0, () => {
      let a = 'abc';
      let b = 'b';
      expect(a).assertContain(b);
      expect(a).assertEqual(a);
    });
  });
}
```

### 测试函数

| 函数 | 说明 |
|------|------|
| `describe(name, fn)` | 定义测试套件 |
| `it(name, filter, fn)` | 定义测试用例 |
| `beforeAll(fn)` | 所有测试前执行一次 |
| `beforeEach(fn)` | 每个测试前执行 |
| `afterEach(fn)` | 每个测试后执行 |
| `afterAll(fn)` | 所有测试后执行一次 |

---

## 断言方法

### 相等性断言

```typescript
expect(value).assertEqual(expected)      // 相等
expect(value).notEqual(expected)         // 不相等
expect(value).assertNull()               // 为 null
expect(value).assertNotNull()            // 不为 null
expect(value).assertUndefined()          // 为 undefined
expect(value).assertNotUndefined()       // 不为 undefined
```

### 包含断言

```typescript
expect(string).assertContain(substring)  // 包含子串
expect(array).assertContain(element)     // 数组包含元素
```

### 类型断言

```typescript
expect(value).assertInstanceOf(Class)    // 是某类的实例
expect(value).assertTypeOf('string')     // 是某类型
```

### 数值断言

```typescript
expect(value).assertLessThan(threshold)  // 小于
expect(value).assertGreaterThan(threshold)  // 大于
expect(value).assertNear(target, delta)  // 接近
```

### 布尔断言

```typescript
expect(value).assertTrue()               // 为 true
expect(value).assertFalse()              // 为 false
```

---

## 测试示例

### 字符串测试

```typescript
describe('String Tests', () => {
  it('should contain substring', 0, () => {
    let str = 'Hello World';
    expect(str).assertContain('World');
  });

  it('should have correct length', 0, () => {
    let str = 'Hello';
    expect(str.length).assertEqual(5);
  });
});
```

### 数组测试

```typescript
describe('Array Tests', () => {
  let arr: number[] = [];

  beforeEach(() => {
    arr = [1, 2, 3];
  });

  it('should contain element', 0, () => {
    expect(arr).assertContain(2);
  });

  it('should have correct length', 0, () => {
    expect(arr.length).assertEqual(3);
  });
});
```

### 异步测试

```typescript
describe('Async Tests', () => {
  it('should handle async operation', 0, async () => {
    const result = await fetchData();
    expect(result).assertEqual('success');
  });

  it('should handle Promise', 0, () => {
    return fetchData().then(result => {
      expect(result).assertEqual('success');
    });
  });
});
```

---

## 依赖配置

### oh-package.json5

```json5
{
  "devDependencies": {
    "@ohos/hypium": "1.0.25",
    "@ohos/hamock": "1.0.0"
  }
}
```

### 测试框架版本

| 包 | 版本 | 说明 |
|------|------|------|
| `@ohos/hypium` | 1.0.25 | 测试框架 |
| `@ohos/hamock` | 1.0.0 | Mock 框架 |

---

## 运行测试

### 本地单元测试

```bash
# 运行所有测试
hvigorw test

# 运行指定模块测试
hvigorw test --module entry
```

### 仪器测试

```bash
# 需要连接设备
hdc shell aa test -p com.example.emptyability -m entry_test -s unittest
```

---

## 测试最佳实践

### ✅ Good: 清晰的测试描述

```typescript
it('should return correct sum when adding two numbers', 0, () => {
  expect(add(1, 2)).assertEqual(3);
});
```

### ❌ Bad: 不清晰的测试描述

```typescript
it('test1', 0, () => {
  expect(add(1, 2)).assertEqual(3);
});
```

### ✅ Good: 测试边界条件

```typescript
describe('divide function', () => {
  it('should return correct result for positive numbers', 0, () => {
    expect(divide(10, 2)).assertEqual(5);
  });

  it('should throw error when dividing by zero', 0, () => {
    expect(() => divide(10, 0)).throw();
  });
});
```

### ✅ Good: 使用 beforeEach 重置状态

```typescript
describe('Counter', () => {
  let counter: Counter;

  beforeEach(() => {
    counter = new Counter();  // 每个测试前重置
  });

  it('should start at zero', 0, () => {
    expect(counter.value).assertEqual(0);
  });

  it('should increment correctly', 0, () => {
    counter.increment();
    expect(counter.value).assertEqual(1);
  });
});
```

---

## 测试覆盖率

### 启用覆盖率

```bash
hvigorw test --coverage
```

### 覆盖率报告

```
entry/build/test/coverage/
├── index.html
└── ...
```

### 覆盖率目标

- 行覆盖率: ≥ 80%
- 分支覆盖率: ≥ 70%
- 函数覆盖率: ≥ 90%