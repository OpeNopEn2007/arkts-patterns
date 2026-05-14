# 后台任务 (Background Tasks & Notifications)

## 概述

HarmonyOS 后台任务机制用于在应用退至后台后，继续执行有限时长的任务、长时间运行的任务，或推迟到特定条件满足时执行的任务。配合通知和推送服务，保障关键业务不被系统挂起。

---

## 1. Background Tasks Kit

按业务场景分为三类：

| 类型 | 适用场景 | 说明 |
|------|----------|------|
| **短时任务** | 数据压缩、文件下载（小文件） | 应用退后台后，系统提供 3 分钟窗口继续执行；超时会被挂起 |
| **长时任务** | 音乐播放、导航、录音、通话 | 必须在后台持续运行，需向用户显示常驻通知 |
| **延迟任务** | 数据预取、日志上传、垃圾清理 | 由 Work Scheduler 触发，满足条件（充电、联网、空闲）时执行 |

> 官方文档：[Background Tasks Kit](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-v5/background-task-overview-V5)

---

## 2. 长时任务 (ContinuousTask)

**用途**：需要长时间在后台运行的任务，例如音乐播放、地图导航、VoIP 通话、录音等。

**关键概念**：
- 调用 `continuousTask.start()` 申请长时任务
- 必须同时发布一个**持续通知**，告知用户应用正在运行后台任务
- 系统会检查应用是否按规范使用长时任务，否则可能被限制

**支持的类型**：
- `AUDIO_PLAYBACK`：音频播放
- `LOCATION`：导航/定位
- `VOIP`：网络通话
- `TASK_KEEPING`：类似白名单保活

> 官方文档：[长时任务](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/continuous-task-V5)

---

## 3. 代理提醒 (Agent Powered Reminder)

**用途**：在应用不活跃或进程被回收的情况下，系统代理发出提醒（闹钟、日历、定时任务）。

**特性**：
- 提醒由系统服务代为触发，与应用生命周期解耦
- 支持定时提醒、倒计时提醒、日历提醒
- 即使应用被销毁，提醒仍然有效

> 官方文档：[代理提醒](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/agent-powered-reminder-V5)

---

## 4. 延迟任务 (Work Scheduler)

**用途**：不紧急的后台任务，例如定期数据同步、日志上报。

**关键概念**：
- 使用 `WorkScheduler` API 注册任务
- 可设置触发条件：网络状态、充电状态、空闲状态、时间间隔
- 系统会根据资源状况批量调度，降低功耗

> 官方文档：[延迟任务](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/work-scheduler-V5)

---

## 5. Notification Kit 概述

提供本地通知发布能力，包括：
- **普通文本通知**
- **进度条通知**（下载进度）
- **长文本通知**
- **图片通知**
- **多媒体通知**
- **分组通知**
- **交互式通知**（ActionButton）

> 官方文档：[Notification Kit](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/notification-overview-V5)

---

## 6. 推送后台消息与推送通知

### 推送后台消息
- 系统推送通道将消息直接送达应用，无需应用保持前台
- 应用可在后台接收并处理消息，用于数据同步、状态更新
- 需申请 `ohos.permission.PUSH_BACKGROUND` 权限

> 官方文档：[推送后台](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/push-background-V5) | [推送权限](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/push-apply-right-V5)

### 推送通知
- 通过推送服务向用户展示通知栏消息
- 支持扩展通知样式（按钮、输入框、大图等）
- 点击通知可跳转到指定页面

> 官方文档：[推送扩展](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/push-send-extend-noti-V5)

---

## 总结

| 能力 | 适用阶段 | 用户感知 | 典型场景 |
|------|----------|----------|----------|
| 短时任务 | 退后台后 3 分钟内 | 无 | 保存草稿、压缩文件 |
| 长时任务 | 持续运行 | 常驻通知 | 音乐、导航、通话 |
| 代理提醒 | 进程不存在时 | 通知栏提醒 | 闹钟、日历事件 |
| 延迟任务 | 条件满足时 | 无 | 日志上报、数据预取 |
| 推送消息 | 任何时候 | 通知/静默 | 即时消息、数据同步 |
