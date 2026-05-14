# 媒体 (Media Capabilities)

## 概述

HarmonyOS 提供全面的媒体能力，涵盖音频、视频、图片的采集、编辑、播放和管理。主要涉及 Audio Kit 和 Media Library Kit。

---

## 1. Audio Kit (音频服务)

**用途**：提供音频的采集（录音）和播放能力。

**主要能力**：
- **音频播放**：支持多种格式（MP3、AAC、FLAC、WAV 等）
- **音频采集**：麦克风录音，支持 PCM、AAC 编码
- **音频焦点管理**：多应用音频播放的冲突处理
- **音频路由**：扬声器、耳机、蓝牙设备切换
- **音量管理**：媒体音量、通话音量、闹钟音量独立控制

**典型场景**：
- 音乐播放器
- 语音录制与通话
- 游戏音效

> 官方文档：[Media Kit](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/media-kit-intro-V5)

---

## 2. Media Library Kit (媒体文件管理)

**用途**：访问和管理设备上的媒体文件（图片、音频、视频）。

**主要能力**：
- 媒体资源查询（按类型、日期、文件夹）
- 媒体资源增删改
- 相册管理
- 获取媒体文件的详细信息（时长、尺寸、编码格式等）
- 沙箱内外文件路径映射

**典型场景**：
- 相册应用
- 文件管理器
- 媒体编辑应用

---

## 3. NDK 音频播放

**用途**：通过 C/C++ NDK 接口实现高性能音频播放，降低延迟。

**优势**：
- 更低的音频延迟（适合实时场景）
- 更高效的内存管理
- 支持自定义音频处理链路（混音、特效）

**接口**：
- `OH_AudioRenderer`：音频渲染器
- `OH_AudioCapturer`：音频采集器
- 支持 PCM 原始数据输入

> 官方文档：[NDK 音频播放](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/using-ohaudio-for-playback-V5)

---

## 4. 音频播放并发

**用途**：管理多个音频源同时播放时的策略。

**关键概念**：
- **音频焦点**（Audio Focus）：同一时刻仅允许一个应用播放媒体音频
- **焦点请求**：应用在播放前请求焦点
- **焦点释放**：播放结束后释放焦点
- **音频打断策略**：新播放请求可打断当前播放（暂停或降低音量）
- **并发播放场景**：导航语音提示 + 音乐播放（闪避 Ducking）

> 官方文档：[音频播放并发](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/audio-playback-concurrency-V5)

---

## 总结

| 能力 | API 层级 | 性能 | 适用场景 |
|------|----------|------|----------|
| Audio Kit (JS/ArkTS) | 应用框架层 | 中 | 通用播放/录音 |
| NDK 音频 | Native 层 | 高 | 低延迟/专业音频 |
| Media Library Kit | 数据管理 | - | 媒体文件查询与管理 |
