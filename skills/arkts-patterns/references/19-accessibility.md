# 无障碍 (Accessibility)

## 概述

HarmonyOS Accessibility Kit（无障碍套件）为视障、听障、肢体障碍等用户提供辅助使用设备的能?，帮助开发者构建对所有用户友好的应用。

> 官方文档：[Accessibility Kit](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/accessibility-kit-V5) | [Accessibility Kit Overview (EN)](https://developer.huawei.com/consumer/en/doc/harmonyos-guides-V5/accessibilitykit-overview-V5)

---

## 1. Accessibility Kit 简介

**核心目标**：让所有用户（包括残障人士）都能方便地使用 HarmonyOS 应用。

**提供的能力**：
- 屏幕朗读（TalkBack）：为视障用户朗读界面内容
- 放大手势：局部放大屏幕内容
- 色彩校正：为色盲用户调整屏幕颜色
- 字幕服务：为听障用户显示音频字幕
- 无障碍焦点：让用户通过 Tab/方向键导航界面元素

---

## 2. AccessibilityExtensionAbility 开发指导

**用途**：开发者可以通过扩展服务实现自定义的无障碍功能。

**核心概念**：
- **AccessibilityExtensionAbility**：继承该类实现自定义无障碍服务
- **无障碍事件监听**：监听界面变化（内容变更、焦点移动、点击等）
- **节点操作**：获取界面节点信息、模拟点击、滚动等
- **屏幕内容读取**：获取当前屏幕的 UI 元素树

**开发步骤**：
1. 创建 ExtensionAbility 子类
2. 注册要监听的事件类型
3. 在事件回调中处理无障碍逻辑
4. 在 `module.json5` 中声明无障碍扩展

> 官方文档：[AccessibilityExtensionAbility](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/accessibilityextensionability-V5)

---

## 3. 无障碍适配

开发者需要为应用添加无障碍支持，主要工作包括：

**语义化标签**：
- 为图片、按钮等非文本元素添加 `accessibilityText`
- 为自定义组件设置 `accessibilityDescription`
- 合理设置 `accessibilityLevel`（是/否/仅子节点可聚焦）

**焦点管理**：
- 确保所有可交互元素可获得无障碍焦点
- 合理设置 `tabIndex` 控制导航顺序
- 使用 `accessibilityGroup` 整合相关元素

**事件通知**：
- 动态内容变化时发送无障碍事件
- 页面切换时更新无障碍焦点

**示例**：
```typescript
Button()
  .accessibilityText("提交订单")
  .accessibilityDescription("点击后提交当前购物车中的所有商品")
  .accessibilityLevel("yes")
```

---

## 4. 屏幕朗读 (TalkBack)

**系统级服务**，为视障用户朗读屏幕内容。

**使用方式**：
- 用户在设置中开启"屏幕朗读"
- 系统自动朗读焦点所在的元素内容
- 支持手势导航（滑动、双击确认）

**开发者注意事项**：
- 确保所有元素都设置了有意义的无障碍文本
- 避免使用纯图片作为交互元素
- 动态刷新的内容需要发送无障碍事件通知
- 测试时应开启屏幕朗读进行全面体验

---

## 总结

| 能力 | 面向用户 | 集成方式 |
|------|----------|----------|
| 屏幕朗读 | 视障用户 | 系统内置，开发者适配语义标签 |
| 无障碍扩展服务 | 开发者/高级用户 | 通过 AccessibilityExtensionAbility 实现 |
| 无障碍适配 | 所有用户 | 为 UI 组件添加无障碍属性 |
