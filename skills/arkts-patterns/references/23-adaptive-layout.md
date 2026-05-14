# 自适应布局 (一多开发)

## 概述

"一多"（一次开发，多端部署）是 HarmonyOS 的核心设计理念，旨在通过一套代码适配手机、平板、折叠屏、车机、手表等多种设备形态。

---

## 1. 应用架构最佳实践

**设计原则**：
- **分层架构**：UI 层与业务逻辑层分离，业务逻辑可复用
- **设备感知**：通过 `window.getWindowProperties()` 获取窗口信息，动态调整布局
- **能力分级**：根据设备能力（屏幕尺寸、输入方式、硬件特性）提供不同体验
- **渐进式增强**：基础功能全设备可用，高级功能按能力渐进式提供

**推荐架构**：
```
UI Layer (ArkTS 组件)
    |
Business Logic Layer (Service/ViewModel)
    |
Data Layer (Repository/DataSource)
```

> 官方文档：[应用架构最佳实践 (EN)](https://developer.huawei.com/consumer/en/doc/best-practices-V5/bpta-app-architecture-overview-V5)

---

## 2. 一多窗口适配开发实践

**关键适配策略**：

### 布局自适应
- 使用 `MediaQuery` 监听窗口尺寸变化
- 使用 `GridRow` / `GridCol` 栅格布局
- 使用 `Breakpoint` 断点系统（sm/md/lg）
- 避免硬编码尺寸，使用相对单位和百分比

### 交互适配
- 小屏点击，大屏支持键盘/鼠标/手写笔
- 折叠屏展开/折叠时动态调整布局
- 自由窗口模式下支持拖拽调整大小

### 设置断点
```typescript
@State @Watch('onBreakpointChange') currentBreakpoint: string = 'sm';

aboutToAppear() {
  window.getLastWindow(getContext(), (err, win) => {
    win.on('windowSizeChange', (size) => {
      if (size.width >= 840) this.currentBreakpoint = 'lg';
      else if (size.width >= 600) this.currentBreakpoint = 'md';
      else this.currentBreakpoint = 'sm';
    });
  });
}
```

> 官方文档：[一多窗口适配](https://developer.huawei.com/consumer/cn/doc/best-practices-V5/bpta-multi-window-V5)

---

## 3. 一多开发实例

### 地图导航
- 手机端：单屏显示，操作与地图同屏
- 平板端：左侧菜单 + 右侧地图分屏显示
- 车机端：全屏地图，精简操作栏

> 官方文档：[一多地图导航](https://developer.huawei.com/consumer/cn/doc/best-practices-V5/multi-travel-navigation-V5)

### 图片美化
- 手机端：工具面板 + 预览区上下或左右布局
- 平板端：工具面板 + 大预览区 + 图层管理并排

> 官方文档：[一多图片美化](https://developer.huawei.com/consumer/cn/doc/best-practices-V5/multi-picture-app-V5)

---

## 4. 应用并发设计

**原则**：
- 主线程只做 UI 渲染，耗时操作放到子线程
- 使用 TaskPool / Worker 实现多线程并发
- 避免过多的线程创建，使用线程池复用

**推荐方案**：

| 场景 | 推荐方案 |
|------|----------|
| 计算密集型 | TaskPool（线程池） |
| I/O 密集型 | 异步 I/O + TaskPool |
| 长时间运行 | Worker |
| 短时异步 | Promise / async/await |

> 官方文档：[并发设计 (EN)](https://developer.huawei.com/consumer/en/doc/best-practices-V5/bpta-app-concurrency-design-V5) | [使用并发能力 (EN)](https://developer.huawei.com/consumer/en/doc/best-practices-V5/bpta-concurrency-capability-V5)

---

## 总结

| 维度 | 核心策略 | 关键 API/组件 |
|------|----------|---------------|
| 布局 | 栅格系统 + 断点 | GridRow/Col, MediaQuery, Breakpoint |
| 交互 | 输入方式自适应 | mouse, touch, keyboard 事件 |
| 窗口 | 尺寸变化响应 | window.on('windowSizeChange') |
| 并发 | 线程池 + 异步 | TaskPool, Worker, Promise |
