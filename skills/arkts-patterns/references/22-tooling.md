# 开发工具 (Development Tools)

## 概述

HarmonyOS 应用开发工具链以 DevEco Studio 为核心，配合 Hvigor 编译构建系统、构建配置文件和签名工具，提供完整的开发体验。

---

## 1. DevEco Studio 使用

基于 IntelliJ IDEA 的 IDE，提供一站式开发体验。

**主要功能**：
- 代码编辑（ArkTS/TS/JS、CSS、C++）
- 智能补全与语法高亮
- 实时预览（Previewer）
- 编译运行与调试
- 性能分析（Profiler）
- 设备管理（Device File Browser）
- 日志查看（HiLog）

---

## 2. Hvigor 编译构建系统

**Hvigor** 是 HarmonyOS 的自动化构建工具，基于 Gradle 类似的任务编排机制。

**核心概念**：
- **Task**：构建任务单元，如编译、打包、签名
- **Plugin**：扩展构建能力的插件
- **生命周期**：初始化 -> 配置 -> 执行

**常用操作**：
```bash
# 构建 Debug 包
hvigor assembleHap --mode module -p product=default

# 构建 Release 包
hvigor assembleApp --mode module -p product=default
```

> 官方文档：[Hvigor 构建](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-hvigor-task-V5)

---

## 3. 构建配置文件 (build-profile.json5)

位于工程根目录 `build-profile.json5`，配置构建相关参数。

**关键配置项**：

```json5
{
  "app": {
    "products": ["default", "tablet"]
  },
  "modules": [
    {
      "name": "entry",
      "srcPath": "./entry",
      "targets": [
        {
          "name": "default",
          "applyToProducts": ["default"]
        }
      ]
    }
  ]
}
```

| 配置项 | 说明 |
|--------|------|
| `app.products` | 定义产品形态（手机、平板、车机等） |
| `modules` | 模块列表 |
| `targets` | 每个模块的目标产物配置 |
| `buildOption` | 编译选项（混淆、压缩等） |

> 官方文档：[构建配置文件](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/ide-hvigor-build-profile-0000001778834297-V5)

---

## 4. 应用签名 (自动 / 手动)

### 自动签名
- DevEco Studio 在调试时自动签名
- 自动生成调试证书和 Profile
- 无需手动操作

### 手动签名
- 在 AppGallery Connect 上创建应用
- 生成正式证书（.cer）
- 生成 Profile 文件（.p7b）
- 在 IDE 中配置签名信息

**签名配置位置**：`build-profile.json5` 或 IDE 的 Signing Config 面板

---

## 5. 工程模板介绍

DevEco Studio 提供多种工程模板：

| 模板 | 说明 |
|------|------|
| Empty Ability | 空白应用，单 Ability |
| List Detail | 列表+详情页 |
| Tab | 底部 Tab 导航 |
| Navigation | 导航布局模板 |
| Grid | 网格布局模板 |
| DFA| 多设备自适应模板 |

选择模板时考虑目标设备形态和一多适配需求。

---

## 6. 多目标产物配置

**用途**：一套代码同时构建适用于不同设备（手机、平板、车机、手表）的 HAP/APP 包。

**实现方式**：
1. 在 `build-profile.json5` 的 `app.products` 中定义产品
2. 每个 `product` 可指定不同的应用名称、图标、权限
3. 使用 `@Builder` 和运行时 API 区分设备形态
4. 各产品独立构建出对应 HAP 包

**示例**：
```json5
{
  "app": {
    "products": ["phone", "tablet", "car"]
  }
}
```

---

## 总结

| 工具/配置 | 用途 | 阶段 |
|-----------|------|------|
| DevEco Studio | 代码编辑、预览、调试 | 全流程 |
| Hvigor | 编译、打包、构建 | 构建阶段 |
| build-profile.json5 | 构建参数配置 | 配置阶段 |
| 签名 | 应用身份认证 | 调试/发布 |
| 工程模板 | 快速项目初始化 | 开发起始 |
| 多目标产物 | 一次开发多设备部署 | 构建阶段 |
