# 分布式 (Distributed Capabilities)

## 概述

HarmonyOS 分布式能力允许应用在多设备间无缝协同，实现数据同步、文件共享、服务迁移和跨端交互。

---

## 1. 分布式数据对象 (跨设备同步)

**用途**：在同账号下的多设备之间实时同步内存数据对象。

**特性**：
- 以对象为粒度进行数据同步
- 支持自动冲突解决策略
- 监听数据变更事件
- 零拷贝，内存级同步

**典型场景**：
- 跨设备协同编辑
- 多屏联动的状态同步
- 分布式游戏状态共享

> 官方文档：[分布式数据对象同步](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/data-sync-of-distributed-data-object-V5)

---

## 2. 分布式文件系统

**用途**：让同账号设备间共享文件，像访问本地文件一样访问远端文件。

**特性**：
- 分布式虚拟文件系统（DVFS）
- 统一命名空间，路径透明
- 支持标准的文件 I/O 接口

**典型场景**：
- 跨设备文档浏览
- 多设备相册共享
- 分布式存储扩展

> 官方文档：[分布式文件系统](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/distributed-fs-overview-V5)

---

## 3. Service Collaboration Kit (同账号多端协同)

**用途**：同账号下的设备发现、连接、服务跨端迁移与调用。

**关键能力**：
- **设备发现**：发现附近的同账号设备
- **服务迁移**：将当前服务无缝迁移到另一设备
- **多设备协同**：一个应用在多设备上同时运行，共享状态

**典型场景**：
- 手机视频通话迁移到平板
- 手机上编辑文档，大屏上演示
- 跨设备剪贴板共享

> 官方文档：[Service Collaboration Kit](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/servicecollaborationkit-introduction-V5) | [跨设备互通](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/servicecollaboration-dev-guides-V5)

---

## 4. 碰一碰跨端分享

**用途**：通过 NFC 碰触快速在设备间分享内容（图片、视频、链接、文件）。

**流程**：
1. 选择要分享的内容
2. 碰触目标设备（NFC 触发）
3. 目标设备弹出接收确认
4. 开始传输

> 官方文档：[碰一碰分享](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/share-mobilephone-harmony-share-V5)

---

## 5. 跨设备互通

利用 Service Collaboration Kit 实现更复杂的跨设备业务逻辑，包括：
- 设备认证与信任建立
- 安全通道加密通信
- 服务发现与调用

> 官方文档：[跨设备互通](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/servicecollaboration-dev-guides-V5)

---

## 总结

| 能力 | 实时性 | 数据粒度 | 依赖条件 |
|------|--------|----------|----------|
| 分布式数据对象 | 高 | 内存对象 | 同账号、同网络 |
| 分布式文件系统 | 中 | 文件 | 同账号、同网络 |
| Service Collaboration Kit | 高 | 服务/状态 | 同账号、同网络 |
| 碰一碰分享 | 高 | 文件/内容 | NFC 碰触 |
