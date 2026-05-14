# 调试与测试 (Debugging & Testing)

## 概述

HarmonyOS 提供从设备调试、源码调试到自动化测试、性能分析的全链路调试测试工具链。

---

## 1. 设备调试

### USB 调试
- 使用 USB 数据线连接设备与电脑
- 在 DevEco Studio 中选择设备运行
- 适用于开发和调试阶段

### Wi-Fi 调试
- 通过无线网络连接设备调试
- 方便调试无 USB 接口的设备（如手表、电视）

> 官方文档：[设备调试](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-debug-device-V5)

---

## 2. 源码调试

在 DevEco Studio 中设置断点，逐步执行 ArkTS/JS 代码。

**特性**：
- 条件断点、日志断点
- 变量监视与表达式求值
- 调用堆栈查看
- 支持 ArkTS 和 C/C++ 混合调试

> 官方文档：[源码调试](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-source-code-debugging-V5)

---

## 3. Hot Reload 热重载

**用途**：修改代码后无需重新编译安装，即时预览效果。

**支持范围**：
- UI 布局修改
- 样式和资源变更
- 部分业务逻辑变更

**限制**：
- 涉及模块结构变更（新增/删除文件）需重新编译
- 原生代码修改需重新编译

> 官方文档：[Hot Reload](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-hot-reload-V5)

---

## 4. HDC 调试工具

**HDC (HarmonyOS Device Connector)** 是命令行设备管理工具。

**常用命令**：
```bash
hdc list targets           # 列出已连接的设备
hdc shell                  # 进入设备 shell
hdc file send              # 发送文件到设备
hdc file recv              # 从设备拉取文件
hdc install <hap_path>     # 安装 HAP 包
hdc uninstall <bundle>     # 卸载应用
hdc hilog                  # 查看日志
```

> 官方文档：[HDC](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/hdc-0000001815246474)

---

## 5. Hypium 自动化测试 (Python)

**Hypium** 是 HarmonyOS 的自动化测试框架，使用 Python 编写测试脚本。

**特点**：
- 跨设备自动化测试
- 支持 UI 元素定位（id、text、class）
- 支持截图比对
- 兼容 Appetizer 等测试管理平台

> 官方文档：[Hypium 自动化](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/hypium-python-guidelines-V5)

---

## 6. Hypium 性能测试

针对应用性能指标的自动化采集与分析。

**采集指标**：
- 启动耗时
- 帧率（FPS）
- CPU 占用率
- 内存占用
- 网络流量

> 官方文档：[Hypium 性能](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/hypium-perf-python-guidelines-V5)

---

## 7. 内存分析 (Profiler)

**Insight Profiler** 提供实时内存分配分析。

**功能**：
- 内存分配追踪（Allocation Tracking）
- 对象引用分析
- 堆转储（Heap Dump）
- 内存泄漏检测

> 官方文档：[内存分析](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-insight-session-allocations-memory-0000001481465958-V5)

---

## 8. 内存泄漏分析

专门检测 ArkTS 对象的内存泄漏问题。

**检测方法**：
- 使用 DevEco Studio 的 ArkTS 内存泄漏检测工具
- 分析对象引用链，找出未能释放的对象
- 常见泄漏源：未取消的监听器、闭包引用、单例持有

> 官方文档：[内存泄漏](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-arkts-memory-leak-analysis-0000001883411885-V5)

---

## 9. Web DevTools 调试

调试 Web 组件中加载的 H5 页面。

**能力**：
- DOM 元素检查
- Console 控制台
- 网络请求分析
- Source 源码调试

> 官方文档：[Web DevTools](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/web-debugging-with-devtools-V5)

---

## 10. 代码测试 (单元测试 / UI 测试)

### 单元测试
- 使用 `@ohos.unittest` 或第三方框架（Jest）
- 测试独立的函数、类和方法
- 支持 Mock 和 Stub

### UI 测试
- 使用 `@ohos.UiTest` API
- 模拟用户点击、输入、滑动操作
- 断言界面元素状态

> 官方文档：[代码测试](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-code-test-V5) | [应用测试](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/app-testing-overview-V5)

---

## 11. 测试服务

华为提供的云端测试平台服务，包括：
- 兼容性测试
- 稳定性测试（Monkey 测试）
- 性能测试
- 安全测试

> 官方文档：[测试服务](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/test-service-V5)

---

## 12. 混淆配置

**用途**：对发布包进行代码混淆，增加逆向难度。

**配置方式**：
- 在 `build-profile.json5` 中配置混淆规则
- 支持保留特定类/方法的名称（白名单）
- 支持字符串加密

> 官方文档：[混淆](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/source-obfuscation-V5)

---

## 13. 应用签名

调试和发布都需要对应用进行签名。

**两种方式**：
- **自动签名**：DevEco Studio 自动管理调试证书
- **手动签名**：在 AppGallery Connect 生成正式证书和 Profile

> 官方文档：[应用签名](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-signing-V5)

---

## 总结

| 阶段 | 工具 | 用途 |
|------|------|------|
| 开发 | HDC、源码调试、Hot Reload | 快速迭代验证 |
| 测试 | Hypium、单元测试、UI 测试 | 自动化质量保障 |
| 分析 | Profiler、内存泄漏检测 | 性能与内存优化 |
| 发布 | 混淆、签名 | 安全加固 |
