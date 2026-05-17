# 13 - 文件管理 (File Management)

> HarmonyOS NEXT (API 12) 文件系统、沙箱目录、文件分享与备份完整指南

---

## 1. 应用沙箱目录

HarmonyOS 对每个应用提供了独立的沙箱文件系统。应用只能访问自己的沙箱目录内的文件，无法直接访问其他应用的沙箱，确保了数据隔离和安全。

### 1.1 沙箱目录结构

```
应用沙箱根目录
├── /data/storage/el1/database/     # 数据库文件（EL1 加密级）
├── /data/storage/el1/base/         # EL1 基础目录
├── /data/storage/el2/database/     # 数据库文件（EL2 加密级）
├── /data/storage/el2/base/         # EL2 基础目录
├── /data/storage/el2/distributedfiles/  # 分布式文件目录
└── /data/storage/el2/share/        # 共享文件目录
```

**加密级别说明：**

| 加密级 | 说明 | 解锁要求 |
|--------|------|----------|
| EL1 (EL1) | 设备级加密 | 设备开机后可访问 |
| EL2 (EL2) | 用户级加密 | 用户解锁后可访问 |
| EL3 (EL3) | 增强型用户数据 | 特定场景 |
| EL4 (EL4) | 最高安全级 | 用户认证后 |

### 1.2 访问沙箱目录

```typescript
import { common } from '@kit.AbilityKit';
import { fileIo } from '@kit.CoreFileKit';

// 获取上下文
const context = getContext() as common.UIAbilityContext;

// 获取关键目录路径
const databaseDir = context.databaseDir;   // 数据库目录
const tempDir = context.tempDir;            // 临时文件目录
const filesDir = context.filesDir;          // 文件目录
const cacheDir = context.cacheDir;          // 缓存目录
const bundleCodeDir = context.bundleCodeDir; // 代码目录
const distributedFilesDir = context.distributedFilesDir; // 分布式文件目录

console.log('Files dir:', filesDir);
console.log('Cache dir:', cacheDir);
console.log('Temp dir:', tempDir);
```

### 1.3 沙箱内文件操作

```typescript
import { fileIo } from '@kit.CoreFileKit';
import { util } from '@kit.ArkTS';

// 1. 创建文件
async function createFile(): Promise<void> {
  const context = getContext();
  const filePath = `${context.filesDir}/my_data.txt`;

  // 方式一：fileIo.open
  const file = fileIo.openSync(filePath, fileIo.OpenMode.CREATE | fileIo.OpenMode.READ_WRITE);
  fileIo.writeSync(file.fd, 'Hello, HarmonyOS!');
  fileIo.closeSync(file);
  console.log('File created at:', filePath);

  // 方式二：fileIo.createStream
  const stream = fileIo.createStreamSync(filePath, 'w+');
  stream.writeSync('Stream write example');
  stream.closeSync();
}

// 2. 读取文件
async function readFile(): Promise<void> {
  const context = getContext();
  const filePath = `${context.filesDir}/my_data.txt`;

  if (fileIo.accessSync(filePath)) {
    const stat = fileIo.statSync(filePath);
      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);
      let content = '';

      try {
        const buffer = new ArrayBuffer(stat.size);
        const bytesRead = fileIo.readSync(file.fd, buffer);
        const decoder = util.TextDecoder.create('utf-8');
        content = decoder.decodeToString(new Uint8Array(buffer.slice(0, bytesRead)));
      } finally {
        fileIo.closeSync(file);
      }

    console.log('File content:', content);
  } else {
    console.error('File does not exist');
  }
}

// 3. 文件和目录操作
async function fileOperations(): Promise<void> {
  const context = getContext();
  const sourcePath = `${context.filesDir}/source.txt`;
  const destPath = `${context.cacheDir}/backup.txt`;
  const dirPath = `${context.filesDir}/my_folder`;

  // 创建目录
  fileIo.mkdirSync(dirPath);

  // 复制文件
  fileIo.copyFileSync(sourcePath, destPath);

  // 移动/重命名文件
  fileIo.renameSync(sourcePath, `${context.filesDir}/renamed.txt`);

  // 删除文件
  fileIo.unlinkSync(destPath);

  // 删除目录
  fileIo.rmdirSync(dirPath);

  // 列出目录内容
  const files = fileIo.listFileSync(context.filesDir);
  console.log('Files in directory:', files);
}

// 4. 文件信息
async function getFileInfo(): Promise<void> {
  const context = getContext();
  const stat = fileIo.statSync(`${context.filesDir}/my_data.txt`);

  console.log('File size:', stat.size);
  console.log('Last modified:', stat.mtime);
  console.log('Is directory:', stat.isDirectory());
  console.log('Is file:', stat.isFile());
}
```

> **官方文档：** [应用沙箱目录](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/app-sandbox-directory-V5)

---

## 2. 保存用户文件

用户文件的保存涉及选择公共目录或应用沙箱目录。

### 2.1 保存到应用沙箱

```typescript
import { fileIo } from '@kit.CoreFileKit';
import { common } from '@kit.AbilityKit';

async function saveToSandbox(content: string, fileName: string): Promise<string> {
  const context = getContext();
  const filePath = `${context.filesDir}/${fileName}`;

  try {
    if (fileIo.accessSync(filePath)) {
      fileIo.unlinkSync(filePath);
    }

    const file = fileIo.openSync(filePath, fileIo.OpenMode.CREATE | fileIo.OpenMode.READ_WRITE);
    try {
      fileIo.writeSync(file.fd, content);
    } finally {
      fileIo.closeSync(file);
    }
    console.log('File saved to sandbox:', filePath);
    return filePath;
  } catch (error) {
    console.error('Failed to save file:', error);
    throw error;
  }
}
```

### 2.2 保存到媒体库

```typescript
import { photoAccessHelper } from '@kit.MediaLibraryKit';
import { common } from '@kit.AbilityKit';
import { fileIo } from '@kit.CoreFileKit';

async function saveToGallery(fileName: string): Promise<void> {
  const context = getContext();
  const helper = photoAccessHelper.getPhotoAccessHelper(context);

  try {
    // 创建图片/视频保存请求
    const uri = await helper.createAsset(photoAccessHelper.PhotoType.IMAGE, 'jpg');

    // 写入文件数据
    const file = fileIo.openSync(uri, fileIo.OpenMode.WRITE_ONLY);
    const imageBuffer = new ArrayBuffer(1024); // 实际文件数据
    fileIo.writeSync(file.fd, imageBuffer);
    fileIo.closeSync(file);

    console.log('File saved to gallery:', uri);
  } catch (error) {
    console.error('Failed to save to gallery:', error);
  }
}
```

### 2.3 保存到 Downloads 目录

```typescript
import { fileIo } from '@kit.CoreFileKit';

async function saveToDownloads(): Promise<void> {
  // 使用 Download API 保存到系统下载目录
  const downloadPath = '/data/storage/el2/base/haps/entry/files/Download';
  // 实际应用中需要通过 SAF (Storage Access Framework) 选择目录
  // 或使用 DownloadAgent API

  const context = getContext();
  const sandboxPath = `${context.filesDir}/downloaded_file.pdf`;

  // 写入到沙箱后，通过文件分享输出
  fileIo.writeTextSync(sandboxPath, 'File content');
  console.log('Ready to share:', sandboxPath);
}
```

> **官方文档：** [保存用户文件](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/save-user-file-V5)

---

## 3. 文件分享

HarmonyOS 提供了多种文件分享机制。

### 3.1 通过 UI 分享文件

```typescript
import { common } from '@kit.AbilityKit';
import { fileIo } from '@kit.CoreFileKit';
import { picker } from '@kit.CoreFileKit';

async function shareFile(filePath: string): Promise<void> {
  const context = getContext();

  // 使用文件选择器分享
  const documentPicker = new picker.DocumentViewPicker(context);

  try {
    // 分享文件（调用系统分享面板）
    const uris = await documentPicker.startQuickShare(
      [filePath],
      {
        // 分享选项
        confirmMode: picker.ConfirmMode.CONFIRM_MODE_DEFAULT,
      }
    );
    console.log('Shared URIs:', uris);
  } catch (error) {
    console.error('Share failed:', error);
  }
}
```

### 3.2 发送文件到其他应用

```typescript
import { common } from '@kit.AbilityKit';
import { wantConstant } from '@kit.AbilityKit';
import { UIAbility } from '@kit.AbilityKit';
import { fileUri } from '@kit.CoreFileKit';

function sendFileToOtherApp(): void {
  const context = getContext();
  const filePath = `${context.filesDir}/shareable_file.pdf`;

  // 构建 Want 对象
  const want = {
    type: 'application/pdf',
    parameters: {
      [wantConstant.Params.FILE_PARAM]: filePath,
      [wantConstant.Params.ACTION]: 'ohos.want.action.sendData',
    },
  };

  // 启动系统分享
  context.startAbility(want).then(() => {
    console.log('Share ability started');
  }).catch((err) => {
    console.error('Failed to start share:', err);
  });
}
```

### 3.3 文件 URI 转换

```typescript
// 将沙箱路径转换为可分享的 URI
import { fileUri } from '@kit.CoreFileKit';

function getFileUri(sandboxPath: string): string {
  const uri = fileUri.getUriFromPath(sandboxPath);
  console.log('File URI:', uri);
  return uri;
}

// 从 URI 恢复路径
function getPathFromUri(uri: string): string {
  const path = fileUri.getPathFromUri(uri);
  console.log('Sandbox path:', path);
  return path;
}
```

---

## 4. PDF 格式转换

HarmonyOS 支持各种文档格式的转换，包括 PDF 生成和转换。

### 4.1 PDF 生成

```typescript
import { pdf } from '@kit.CoreFileKit';

async function createPdfFromText(): Promise<void> {
  const context = getContext();
  const outputPath = `${context.filesDir}/output.pdf`;

  try {
    // 创建 PDF 文档
    const pdfDocument = await pdf.PDFDocument.createNewPdfDocument(outputPath);

    // 添加页面
    const page = await pdfDocument.newPage({
      width: 595.28,  // A4 宽度 (点)
      height: 841.89, // A4 高度 (点)
    });

    // 绘制文本内容
    page.drawText('Hello HarmonyOS PDF', {
      x: 50,
      y: 750,
      fontSize: 24,
      color: '#FF000000',
    });

    page.drawText('This is a sample PDF document generated in HarmonyOS.', {
      x: 50,
      y: 700,
      fontSize: 12,
      color: '#FF333333',
    });

    // 保存文档
    await pdfDocument.save();
    await pdfDocument.close();

    console.log('PDF created at:', outputPath);
  } catch (error) {
    console.error('Failed to create PDF:', error);
  }
}
```

### 4.2 文档格式转换

```typescript
// 利用预设转换，将其他格式转换为 PDF
async function convertToPdf(inputPath: string, outputPath: string): Promise<void> {
  try {
    // 使用系统提供的转换服务
    // 支持从图片、文本等格式转换为 PDF
    const result = await pdf.PDFDocument.convertToPdf(inputPath, outputPath);
    if (result) {
      console.log('Conversion successful:', outputPath);
    }
  } catch (error) {
    console.error('Conversion failed:', error);
  }
}
```

> **官方文档：** [PDF 格式转换](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/pdf-format-change-V5)

---

## 5. Core File Kit 简介 (文件基础服务)

Core File Kit 提供了核心的文件管理能力，是 HarmonyOS 文件系统的基础服务框架。

### 5.1 能力总览

| 能力分类 | 模块 | 说明 |
|----------|------|------|
| 文件操作 | `fileIo` | 创建、读写、删除、重命名等 |
| 流操作 | `fileIo.Stream` | 文件流式读写 |
| 目录操作 | `fileIo` | 目录创建、遍历、删除 |
| 文件信息 | `fileIo.Stat` | 大小、时间、权限等 |
| 文件监听 | `fileIo.Watcher` | 文件变化事件通知 |
| 文件 URI | `fileUri` | 路径与 URI 互转 |
| 选择器 | `picker` | 文件选择、保存对话框 |
| 压缩解压 | `zlib` | 文件压缩与解压缩 |

### 5.2 常用操作

> **DevEco Studio 6.1 note:** for small sandbox text files, prefer `openSync()` + `writeSync()` / `readSync()` with explicit file descriptors. Some SDKs do not expose `fileIo.writeTextSync()` / `fileIo.readTextSync()` even though older examples may mention them. Decode bytes with `util.TextDecoder.create('utf-8')` to avoid Chinese text garbling.

**ArkTSCheck cleanup pattern:** file APIs such as `fileIo.closeSync()` may still be reported as "Function may throw exceptions" when called inside `finally`. Wrap cleanup in a tiny helper with its own `try/catch` instead of calling throwing cleanup APIs bare in `finally`.

```typescript
function closeFile(file: fileIo.File): void {
  try {
    fileIo.closeSync(file);
  } catch (error) {
    console.error(`Close file failed: ${JSON.stringify(error)}`);
  }
}
```

```typescript
import { fileIo } from '@kit.CoreFileKit';
import { zlib } from '@kit.CoreFileKit';

// 文件监听
function watchFile(filePath: string): void {
  const watcher = fileIo.createWatcher(filePath, (event) => {
    console.log(`File event: ${event.eventType}, file: ${event.fileName}`);
  });
  watcher.start();

  // 停止监听
  // watcher.stop();
}

// 文件压缩
async function compressFile(srcPath: string, destPath: string): Promise<void> {
  try {
    await zlib.compressFile(srcPath, destPath);
    console.log('File compressed to:', destPath);
  } catch (error) {
    console.error('Compression failed:', error);
  }
}

// 文件解压
async function decompressFile(srcPath: string, destPath: string): Promise<void> {
  try {
    await zlib.decompressFile(srcPath, destPath);
    console.log('File decompressed to:', destPath);
  } catch (error) {
    console.error('Decompression failed:', error);
  }
}

// 文件哈希
async function getFileHash(filePath: string): Promise<string> {
  const hash = fileIo.hashSync(filePath, 'sha256');
  console.log('File hash:', hash);
  return hash;
}
```

### 5.3 流式读写

```typescript
// 大文件流式读取
async function readLargeFile(filePath: string): Promise<void> {
  const stream = fileIo.createStreamSync(filePath, 'r');
  const bufferSize = 1024 * 1024; // 1MB buffer
  let totalBytes = 0;

  try {
    while (true) {
      const buffer = new ArrayBuffer(bufferSize);
      const bytesRead = stream.readSync(buffer);
      if (bytesRead <= 0) break;
      totalBytes += bytesRead;
      console.log(`Read ${totalBytes} bytes so far`);
    }
  } finally {
    stream.closeSync();
  }
}
```

> **官方文档：** [Core File Kit 简介](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/core-file-kit-intro-V5)

---

## 6. 备份恢复

HarmonyOS 提供了 BackupExtensionAbility 框架，支持应用数据的备份和恢复。

### 6.1 备份架构

```
┌────────────────────┐
│   Backup Service    │  ← 系统备份服务
├────────────────────┤
│  BackupExtAbility   │  ← 应用实现的备份扩展
├────────────────────┤
│   应用沙箱目录      │  ← 需要备份的应用数据
└────────────────────┘
```

### 6.2 实现备份扩展

```typescript
// BackupExtensionAbility.ets
import { BackupExtensionAbility, BundleVersion } from '@kit.CoreFileKit';

class MyBackupExtension extends BackupExtensionAbility {
  // 备份前回调
  async onBackup(): Promise<void> {
    console.log('Backup started');
    // 执行备份前的准备（如关闭数据库连接）
  }

  // 恢复前回调
  async onRestore(): Promise<void> {
    console.log('Restore started');
    // 执行恢复前的准备
  }

  // 恢复完成后回调
  async onRestoreFinished(): Promise<void> {
    console.log('Restore finished');
    // 重新初始化应用数据
  }
}
```

### 6.3 配置备份范围

```json5
// module.json5 中配置
{
  module: {
    abilities: [
      {
        name: "MyBackupExtension",
        srcEntry: "./ets/backup/MyBackupExtension.ets",
        type: "backup",
        // 需要备份的文件目录
        metadata: {
          customizeData: [
            {
              name: "BackupDir",
              value: "/data/storage/el2/base/files"
            },
            {
              name: "BackupDir",
              value: "/data/storage/el2/database"
            }
          ]
        }
      }
    ]
  }
}
```

### 6.4 手动备份与恢复

```typescript
// 应用内触发备份
async function triggerBackup(): Promise<void> {
  try {
    // 备份关键文件到备份目录
    const context = getContext();
    const backupDir = `${context.filesDir}/backup`;
    const sourceFile = `${context.filesDir}/important_data.db`;

    // 创建备份目录
    if (!fileIo.accessSync(backupDir)) {
      fileIo.mkdirSync(backupDir);
    }

    // 备份文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = `${backupDir}/data_backup_${timestamp}.db`;
    fileIo.copyFileSync(sourceFile, backupFile);

    console.log('Backup created:', backupFile);
  } catch (error) {
    console.error('Backup failed:', error);
  }
}

// 恢复备份
async function restoreFromBackup(backupFilePath: string): Promise<void> {
  try {
    const context = getContext();
    const targetFile = `${context.filesDir}/important_data.db`;

    if (fileIo.accessSync(backupFilePath)) {
      fileIo.copyFileSync(backupFilePath, targetFile);
      console.log('Restored from backup:', backupFilePath);
    } else {
      console.error('Backup file not found');
    }
  } catch (error) {
    console.error('Restore failed:', error);
  }
}
```

> **官方文档：** [BackupExtensionAbility 实现](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/backupextensionability-implementation-V5)

---

## 7. 文件管理最佳实践

### 7.1 性能优化

| 场景 | 最佳实践 |
|------|----------|
| 大文件读写 | 使用流式读取 (`createStreamSync`)，避免一次性加载到内存 |
| 高频小文件写入 | 合并写入操作，减少 IO 次数 |
| 文件存在检查 | 使用 `accessSync()` 而非捕获异常 |
| 批量文件操作 | 使用 `listFileSync` 配合循环操作 |
| 缓存管理 | 定期清理 `cacheDir` 中的临时文件 |

### 7.2 安全规范

```typescript
// 正确：使用安全路径
function safeFilePath(): void {
  const context = getContext();
  // 使用系统提供的路径接口
  const safePath = `${context.filesDir}/user_data.txt`;
  // 不要使用硬编码的绝对路径
}

// 正确：路径校验
function validateFilePath(filePath: string): boolean {
  const context = getContext();
  // 确保路径在沙箱范围内
  return filePath.startsWith(context.filesDir) ||
         filePath.startsWith(context.cacheDir) ||
         filePath.startsWith(context.databaseDir);
}

// 正确：文件存在检查
function safeReadFile(filePath: string): string | null {
  try {
    if (fileIo.accessSync(filePath)) {
      const stat = fileIo.statSync(filePath);
      const file = fileIo.openSync(filePath, fileIo.OpenMode.READ_ONLY);

      try {
        const buffer = new ArrayBuffer(stat.size);
        const bytesRead = fileIo.readSync(file.fd, buffer);
        const decoder = util.TextDecoder.create('utf-8');
        return decoder.decodeToString(new Uint8Array(buffer.slice(0, bytesRead)));
      } finally {
        fileIo.closeSync(file);
      }
    }
    return null;
  } catch (error) {
    console.error('File access error:', error);
    return null;
  }
}
```

### 7.3 文件生命周期管理

```typescript
// 自动清理临时文件
function cleanupTempFiles(): void {
  const context = getContext();
  const files = fileIo.listFileSync(context.tempDir);
  const oneDayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();

  files.forEach((file) => {
    const filePath = `${context.tempDir}/${file}`;
    const stat = fileIo.statSync(filePath);
    if (now - stat.mtime > oneDayMs) {
      fileIo.unlinkSync(filePath);
      console.log('Cleaned up:', filePath);
    }
  });
}
```

---

## 文件管理 API 速查

| 操作 | API | 同步/异步 |
|------|-----|-----------|
| 打开文件 | `fileIo.open()` / `fileIo.openSync()` | 都支持 |
| 读取文本 | `openSync(READ_ONLY)` + `readSync(fd)` + `util.TextDecoder` | 同步 |
| 写入文本 | `openSync(CREATE \| READ_WRITE)` + `writeSync(fd)` | 同步 |
| 创建流 | `fileIo.createStream()` / `fileIo.createStreamSync()` | 都支持 |
| 复制文件 | `fileIo.copyFile()` / `fileIo.copyFileSync()` | 都支持 |
| 移动文件 | `fileIo.moveFile()` / `fileIo.moveFileSync()` | 都支持 |
| 删除文件 | `fileIo.unlink()` / `fileIo.unlinkSync()` | 都支持 |
| 创建目录 | `fileIo.mkdir()` / `fileIo.mkdirSync()` | 都支持 |
| 删除目录 | `fileIo.rmdir()` / `fileIo.rmdirSync()` | 都支持 |
| 文件是否存在 | `fileIo.access()` / `fileIo.accessSync()` | 都支持 |
| 文件信息 | `fileIo.stat()` / `fileIo.statSync()` | 都支持 |
| 列出目录 | `fileIo.listFile()` / `fileIo.listFileSync()` | 都支持 |
| 创建监听器 | `fileIo.createWatcher()` | 异步 |
| 文件哈希 | `fileIo.hash()` / `fileIo.hashSync()` | 都支持 |
| 文件压缩 | `zlib.compressFile()` | 异步 |
| 文件解压 | `zlib.decompressFile()` | 异步 |

---

## 参考链接

- [应用沙箱目录](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/app-sandbox-directory-V5)
- [保存用户文件](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/save-user-file-V5)
- [PDF 格式转换](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/pdf-format-change-V5)
- [Core File Kit 简介](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/core-file-kit-intro-V5)
- [BackupExtensionAbility 实现](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/backupextensionability-implementation-V5)
