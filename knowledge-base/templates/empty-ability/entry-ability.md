# EntryAbility 应用入口

EntryAbility 是应用的入口能力，继承自 UIAbility，管理应用的完整生命周期。

---

## 完整代码模板

```typescript
import { AbilityConstant, ConfigurationConstant, UIAbility, Want } from '@kit.AbilityKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { window } from '@kit.ArkUI';

const DOMAIN = 0x0000;

export default class EntryAbility extends UIAbility {
  onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
    try {
      this.context.getApplicationContext().setColorMode(
        ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET
      );
    } catch (err) {
      hilog.error(DOMAIN, 'testTag', 'Failed to set colorMode. Cause: %{public}s',
        JSON.stringify(err));
    }
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onCreate');
  }

  onDestroy(): void {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onDestroy');
  }

  onWindowStageCreate(windowStage: window.WindowStage): void {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onWindowStageCreate');

    windowStage.loadContent('pages/Index', (err) => {
      if (err.code) {
        hilog.error(DOMAIN, 'testTag', 'Failed to load the content. Cause: %{public}s',
          JSON.stringify(err));
        return;
      }
      hilog.info(DOMAIN, 'testTag', 'Succeeded in loading the content.');
    });
  }

  onWindowStageDestroy(): void {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onWindowStageDestroy');
  }

  onForeground(): void {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onForeground');
  }

  onBackground(): void {
    hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onBackground');
  }
}
```

---

## 生命周期详解

### onCreate

Ability 创建时调用，执行应用初始化。

```typescript
onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void
```

**参数说明**:
| 参数 | 类型 | 说明 |
|------|------|------|
| `want` | Want | 启动信息 |
| `launchParam` | LaunchParam | 启动参数 |

**最佳实践**:

```typescript
// ✅ Good: 完整的错误处理
onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
  try {
    this.context.getApplicationContext().setColorMode(
      ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET
    );
  } catch (err) {
    hilog.error(DOMAIN, 'testTag', 'Failed to set colorMode. Cause: %{public}s',
      JSON.stringify(err));
  }
  hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onCreate');
}

// ❌ Bad: 忽略错误处理
onCreate(want: Want, launchParam: AbilityConstant.LaunchParam): void {
  this.context.getApplicationContext().setColorMode(
    ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET
  ); // 可能抛出异常
}
```

### onWindowStageCreate

窗口阶段创建时调用，加载主页面。

```typescript
onWindowStageCreate(windowStage: window.WindowStage): void
```

**最佳实践**:

```typescript
// ✅ Good: 完整的错误处理
onWindowStageCreate(windowStage: window.WindowStage): void {
  windowStage.loadContent('pages/Index', (err) => {
    if (err.code) {
      hilog.error(DOMAIN, 'testTag', 'Failed to load content: %{public}s',
        JSON.stringify(err));
      return;
    }
    hilog.info(DOMAIN, 'testTag', 'Succeeded in loading content.');
  });
}

// ❌ Bad: 未处理加载失败
onWindowStageCreate(windowStage: window.WindowStage): void {
  windowStage.loadContent('pages/Index', () => {}); // 忽略错误
}
```

### onForeground / onBackground

应用切换到前台/后台时调用。

```typescript
onForeground(): void {
  // 应用进入前台，恢复资源、重新连接
  hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onForeground');
}

onBackground(): void {
  // 应用进入后台，释放资源、断开连接
  hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onBackground');
}
```

### onDestroy

Ability 销毁时调用，释放所有资源。

```typescript
onDestroy(): void {
  // 释放所有资源
  hilog.info(DOMAIN, 'testTag', '%{public}s', 'Ability onDestroy');
}
```

---

## 日志规范

### DOMAIN 常量

```typescript
const DOMAIN = 0x0000;  // 日志域，用于过滤
```

### hilog 用法

```typescript
import { hilog } from '@kit.PerformanceAnalysisKit';

// 日志级别
hilog.debug(DOMAIN, 'tag', 'debug message');
hilog.info(DOMAIN, 'tag', 'info message');
hilog.warn(DOMAIN, 'tag', 'warn message');
hilog.error(DOMAIN, 'tag', 'error message');

// 格式化输出
hilog.info(DOMAIN, 'tag', 'User: %{public}s', userName);  // 公开
hilog.info(DOMAIN, 'tag', 'Data: %{private}s', secretData);  // 私有，输出 ***
```

---

## Context 使用

通过 `this.context` 访问应用上下文：

```typescript
// 获取应用上下文
let applicationContext = this.context.getApplicationContext();

// 设置颜色模式
applicationContext.setColorMode(ConfigurationConstant.ColorMode.COLOR_MODE_NOT_SET);

// 获取缓存目录
let cacheDir = this.context.cacheDir;

// 获取文件目录
let filesDir = this.context.filesDir;
```

---

## module.json5 配置

在 `module.json5` 中声明 EntryAbility：

```json5
{
  "module": {
    "abilities": [
      {
        "name": "EntryAbility",
        "srcEntry": "./ets/entryability/EntryAbility.ets",
        "description": "$string:EntryAbility_desc",
        "icon": "$media:layered_image",
        "label": "$string:EntryAbility_label",
        "startWindowIcon": "$media:startIcon",
        "startWindowBackground": "$color:start_window_background",
        "exported": true,
        "skills": [
          {
            "entities": ["entity.system.home"],
            "actions": ["ohos.want.action.home"]
          }
        ]
      }
    ]
  }
}
```

**关键字段**:
| 字段 | 说明 |
|------|------|
| `name` | Ability 名称 |
| `srcEntry` | 源文件路径 |
| `exported` | 是否可被其他应用调用 |
| `skills` | Ability 可以响应的 Intent |