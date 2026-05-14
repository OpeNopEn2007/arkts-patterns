# NDK 开发 (Native C/C++ Development)

## 概述

HarmonyOS NDK（Native Development Kit）允许开发者使用 C/C++ 编写高性能模块，通过 Node-API 或 JSVM-API 与 ArkTS 层交互。

---

## 1. NDK 工程构建概述

### 构建配置
在 `build-profile.json5` 中配置 native 模块：
```json5
{
  "modules": [
    {
      "name": "entry",
      "srcPath": "./entry",
      "targets": [
        {
          "name": "default",
          "cppSrcPath": "./src/main/cpp",
          "cppBuildConfig": {
            "abiFilters": ["arm64-v8a", "x86_64"]
          }
        }
      ]
    }
  ]
}
```

### CMakeLists.txt
NDK 模块使用 CMake 构建：
```cmake
cmake_minimum_required(VERSION 3.4.0)
project("MyNativeLib")
add_library(mynative SHARED native.cpp)
target_link_libraries(mynative PUBLIC libace_napi.z.so)
```

### 支持的 ABI
| ABI | 说明 |
|-----|------|
| arm64-v8a | 64 位 ARM 设备（主流） |
| armeabi-v7a | 32 位 ARM 设备 |
| x86_64 | 模拟器 |

---

## 2. NDK 嵌入 ArkTS 组件

**用途**：在 C++ 层创建 UI 组件，直接参与渲染管线。

**能力**：
- 通过 NDK 接口构建 UI 组件树
- 设置组件属性和样式
- 绑定事件回调
- 与 Canvas 结合实现高性能自定义绘制

**典型场景**：
- 游戏引擎渲染
- 高性能自定义组件
- 复杂动画效果

> 官方文档：[NDK 嵌入 ArkTS 组件](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ndk-embed-arkts-components-V5)

---

## 3. JSVM-API

**用途**：在 Native 层操作 ArkTS 虚拟机，创建和调用 JavaScript 对象。

**能力**：
- 创建 JS 值和对象
- 调用 JS 函数
- 捕获和处理 JS 异常
- 创建 JS 类并在 Native 中实现其方法

**典型场景**：
- 自定义 JS 引擎封装
- 元编程能力扩展
- 动态代码执行

---

## 4. Node-API

**用途**：类似 Node.js 的 N-API，提供 C/C++ 与 ArkTS/JS 互相调用。

**能力**：
- Native 函数导出到 ArkTS
- 异步回调（AsyncCallback / Promise）
- 线程安全（TSFN - ThreadSafe Function）
- 类型转换（JS <-> C++）

**典型场景**：
- 高性能计算模块暴露给 ArkTS
- 多媒体编解码
- 加密解密算法
- 图片处理

**示例**：
```cpp
// Native 侧
napi_value MyFunction(napi_env env, napi_callback_info info) {
  // ...
  return result;
}

// ArkTS 侧
import native from 'libmynative.so';
native.myFunction();
```

---

## 5. WebAssembly 编译

**用途**：将现有的 C/C++ 库编译为 WebAssembly，在 HarmonyOS 中运行。

**优点**：
- 复用已有的 C/C++ 代码
- 沙箱执行，安全性高
- 接近 Native 性能

**典型场景**：
- 移植第三方库（ffmpeg、opencv 等）
- 跨平台代码复用

---

## 总结

| 技术 | 交互方向 | 适用场景 |
|------|----------|----------|
| Node-API | ArkTS <-> C++ | 通用 Native 功能暴露 |
| JSVM-API | C++ 操作 JSVM | 引擎定制、元编程 |
| NDK 嵌入组件 | C++ 创建 UI 组件 | 高性能 UI/游戏 |
| WebAssembly | 沙箱执行 | 第三方库移植 |
