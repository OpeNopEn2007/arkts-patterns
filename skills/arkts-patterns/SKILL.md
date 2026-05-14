---
name: arkts-patterns
description: MUST use this skill whenever writing, reviewing, refactoring, or discussing any HarmonyOS NEXT or ArkTS code. Covers declarative UI (@Component, @State, @Prop, @Link), state management (@Provide/@Consume, AppStorage, LocalStorage, V2), component lifecycle (aboutToAppear, aboutToDisappear), TaskPool/Worker concurrency, UIAbility/ExtensionAbility architecture, Navigation routing (NavPathStack + NavDestination), HTTP networking with interceptors, data persistence (Preferences, RDB, Repository), animations, gestures, and the official EmptyAbility project template with scaffold tool. Triggers on keywords like HarmonyOS, ArkTS, ArkUI, @Component, @State, UIAbility, Navigation, TaskPool, ohos, or any request to build HarmonyOS/Huawei apps.
---

# ArkTS Development Patterns

Development patterns and best practices for building HarmonyOS NEXT applications with ArkTS.

---

## Project Template (EmptyAbility)

The `empty-ability-template/` directory contains a complete HarmonyOS NEXT Stage Model project template (API 22 / SDK 6.0.2). **Use this template when creating new projects.**

### Quick Start

```bash
# Method 1: Scaffold script (recommended)
bash scripts/scaffold.sh ./my-new-app com.yourcompany.yourapp

# Method 2: Manual copy
cp -r empty-ability-template/ ./my-new-app/
cd my-new-app && ohpm install
```

### Core Files

| File | Purpose |
|------|---------|
| `entry/.../EntryAbility.ets` | Application entry with full UIAbility lifecycle |
| `entry/.../EntryBackupAbility.ets` | Data backup/restore extension |
| `entry/.../pages/Index.ets` | Main page demonstrating @Entry/@Component/@State |
| `AppScope/app.json5` | App-level config (`bundleName`, `version`, `icon`) |
| `entry/.../module.json5` | Module config (`abilities`, `extensionAbilities`) |
| `build-profile.json5` | Build config (`targetSdkVersion`) |

### Post-Creation Checklist

1. Update `bundleName` and `vendor` in `AppScope/app.json5`
2. Run `ohpm install` to fetch dependencies
3. Open in DevEco Studio for development

See [Template Documentation](references/templates/empty-ability/README.md) for detailed file-by-file reference.

---

## Core Architecture

### HarmonyOS Application Structure

```
Application
├── AbilityStage (Module lifecycle)
├── UIAbility (UI components, user interaction)
│   ├── WindowStage (Window management)
│   └── Pages (ArkTS @Entry components)
└── ExtensionAbility (Background services)
```

**Key Concept**: HarmonyOS uses **Stage Model** where UIAbility is the primary UI component.
📖 [应用模型 (Ability Kit)](references/02-application-model.md)

---

## Quick Reference

### State Decorators

| Decorator | Scope | Direction | Use Case |
|-----------|-------|-----------|----------|
| `@State` | Component | Local | Component-internal state |
| `@Prop` | Parent → Child | One-way | Read-only data from parent |
| `@Link` | Parent ↔ Child | Two-way | Bidirectional binding |
| `@Provide/@Consume` | Ancestor ↔ Descendant | Two-way | Cross-level communication |
| `@Observed/@ObjectLink` | Nested objects | Two-way | Deep object observation |
| `@StorageLink` | App-level | Two-way | Global app state |
| `@LocalStorageLink` | Page-level | Two-way | Page-shared state |
| `@Watch` | - | - | Monitor state changes |

### Key Patterns

```typescript
// Component definition
@Component
struct MyComponent {
  @State count: number = 0

  build() {
    Text(`${this.count}`)
  }
}

// Two-way binding with @Link (MUST use $ syntax)
Child({ value: $this.count })

// Deep observation
@Observed
class Task {
  title: string = ''
  completed: boolean = false
}

@Component
struct TaskItem {
  @ObjectLink task: Task  // Observe @Observed class
}
```

### @Link vs @Prop + Callback Decision Matrix

**🔴 CRITICAL DEFAULT: Use @Link + $ syntax for child-to-parent data sync**

When a task requires "child can modify parent data" or "two-way binding", ALWAYS use @Link + $ syntax unless there's an explicit reason to use callbacks (validation, coordinated updates, audit trail).

| Scenario | Pattern | Reason |
|----------|---------|--------|
| **Child modifies parent data (DEFAULT)** | `@Link` + `$` syntax | Two-way sync, less code |
| Simple data sync (counter, toggle) | `@Link` + `$` syntax | Less code, direct binding |
| Child modifies array elements | `@Link` + `$` syntax | Two-way sync required |
| Parent needs validation before update | `@Prop` + callback | Parent controls mutation |
| Multiple children share same data | `@Prop` + callback | Coordinated updates |
| Need to track what changed | `@Prop` + callback | Callback provides audit trail |

**Pattern Selection Flow:**
```
Child needs to modify parent data?
├── Yes → Is there explicit validation/coordination requirement?
│         ├── No → USE @Link + $ syntax (DEFAULT)
│         └── Yes → Consider @Prop + callback
└── No → Use @Prop (read-only)
```

**Example - Correct @Link Usage for List Modification:**
```typescript
// Parent - MUST use $ syntax
@Component
struct Parent {
  @State items: Item[] = []

  build() {
    Child({ items: $items })  // $ is REQUIRED for @Link
  }
}

// Child - @Link with immutable update
@Component
struct Child {
  @Link items: Item[]  // Two-way binding

  private deleteItem(id: number): void {
    // MUST use immutable update - filter creates new array
    this.items = this.items.filter(item => item.id !== id)
  }
}
```

### Ability Lifecycle

```
onCreate → onWindowStageCreate → onForeground ↔ onBackground → onWindowStageDestroy → onDestroy
```

### Navigation (Recommended)

```typescript
// Use Navigation + NavDestination, NOT @ohos.router
Navigation(this.navPathStack) {
  // Content
}
.navDestination((name, param) => {
  // Route to pages
})

// Navigate
navPathStack.pushPath({ name: 'Detail', param: { id: 1 } })
navPathStack.pop()
```

---

## Pattern Modules

### 1. State Management
- **Decorators**: @State, @Prop, @Link, @Provide/@Consume, @Observed/@ObjectLink
- **Global State**: AppStorage, LocalStorage, PersistentStorage
- **V2 Decorators (API 12+)**: @ComponentV2, @Local, @Param, @Event, @ObservedV2, @Trace
- **Best Practices**: Minimize state, choose correct decorator, use @Track for precision

📖 [状态管理](references/04-state-management.md)

### 2. Application Model (Ability Kit)
- **UIAbility**: Main UI component with lifecycle, launch modes (singleton/standard/multiton)
- **ExtensionAbility**: Background services (Form, Service, Backup, DataShare, etc.)
- **AbilityStage**: Module lifecycle management
- **Context**: Access app resources and directories (filesDir, cacheDir, etc.)

📖 [应用模型](references/02-application-model.md)

### 3. ArkTS Language
- **Declarative UI**: @Component, @Entry, @Reusable, build()
- **Lifecycle**: aboutToAppear, aboutToDisappear, onPageShow, onPageHide
- **UI Builders**: @Builder, @BuilderParam (slots), @Styles, @Extend
- **Coding Standards**: Naming conventions, code organization, migration from TypeScript

📖 [ArkTS 语言](references/03-arkts-language.md)

### 4. UI Components
- **Layouts**: Row/Column, Stack, Flex, RelativeContainer, GridRow/GridCol
- **Common Components**: Button, Text, TextInput, Image, List
- **List Rendering**: ForEach, LazyForEach, ListItemGroup
- **Design Patterns**: Single responsibility, LoadingContainer, Skeleton, FormField, EmptyState
- **Component Encapsulation**: CustomButton (type/size variants), SearchBar, FormValidator

📖 [UI 组件与布局](references/05-ui-components.md)

### 5. Navigation
- **Navigation Component**: Recommended navigation system
- **NavPathStack**: Page stack operations (pushPathByName, pop, replacePathByName)
- **NavDestination**: Page destination with 8 lifecycle hooks
- **RouterService Pattern**: Singleton wrapper for navigation operations
- **Tab Navigation**: Tabs + TabContent for bottom tab bars
- **System Route Table**: route_map.json configuration

📖 [导航路由](references/06-navigation.md)

### 6. Animation & Gestures
- **Property Animation**: .animation() modifier with Curve options
- **Explicit Animation**: animateTo() with chain animations via Promise
- **Transitions**: Component enter/exit, TransitionEffect presets
- **Gestures**: Tap, LongPress, Pan, Pinch, Rotation, Swipe, GestureGroup
- **Gesture Conflict Resolution**: priorityGesture, parallelGesture, GestureMask
- **Performance**: Use transform properties (scale/rotate) over width/height

📖 [动画与手势](references/07-animation-gestures.md)

### 7. Networking
- **HTTP Client**: @ohos.net.http encapsulation with interceptors
- **Patterns**: Request/Response interceptors, Token injection, Signing
- **Error Handling**: ErrorHandler with code mapping, ErrorCodeInterceptor
- **Retry Mechanism**: Exponential backoff with jitter
- **Cache**: Memory cache with TTL, CachedHttpClient
- **API Services**: Domain-specific service classes (UserApi, DataApi)
- **WebSocket**: Reconnection with exponential backoff
- **RCP**: Remote Communication Protocol (next-gen networking API)

📖 [网络通信](references/08-networking.md)

### 8. Data Persistence
- **Preferences**: Light-weight key-value storage, PreferencesUtil singleton
- **RDB**: SQLite relational database, Repository pattern (CRUD operations)
- **KV Store**: Distributed key-value database
- **File Storage**: Text/binary file operations, JSON serialization
- **Migration**: Database version management with PRAGMA

📖 [数据持久化](references/09-data-persistence.md)

### 9. Concurrency
- **TaskPool**: CPU-intensive parallel tasks, auto thread pool management
- **Worker**: Long-running background tasks, independent thread
- **Selection Guide**: TaskPool (< 3 min, CPU-bound) vs Worker (long-running, continuous)
- **Anti-patterns**: Blocking UI thread, task granularity, missing cancellation/error handling

📖 [并发 (TaskPool/Worker)](references/10-concurrency.md)

---

## References Index (Layer 3)

For detailed reference documentation on specific topics, consult the `references/` directory:

| # | Topic | # | Topic |
|---|-------|---|-------|
| 01 | [Getting Started](references/01-getting-started.md) | 15 | [Background Tasks](references/15-background-tasks.md) |
| 02 | [Application Model](references/02-application-model.md) | 16 | [Connectivity](references/16-connectivity.md) |
| 03 | [ArkTS Language](references/03-arkts-language.md) | 17 | [Distributed](references/17-distributed.md) |
| 04 | [State Management](references/04-state-management.md) | 18 | [Media](references/18-media.md) |
| 05 | [UI Components](references/05-ui-components.md) | 19 | [Accessibility](references/19-accessibility.md) |
| 06 | [Navigation](references/06-navigation.md) | 20 | [Performance](references/20-performance.md) |
| 07 | [Animation & Gestures](references/07-animation-gestures.md) | 21 | [Debugging & Testing](references/21-debugging-testing.md) |
| 08 | [Networking](references/08-networking.md) | 22 | [Tooling](references/22-tooling.md) |
| 09 | [Data Persistence](references/09-data-persistence.md) | 23 | [Adaptive Layout](references/23-adaptive-layout.md) |
| 10 | [Concurrency](references/10-concurrency.md) | 24 | [Publishing](references/24-publishing.md) |
| 11 | [Permissions & Security](references/11-permissions-security.md) | 25 | [App Package](references/25-app-package.md) |
| 12 | [Window & Screen](references/12-window-screen.md) | 26 | [NDK Development](references/26-ndk.md) |
| 13 | [File Management](references/13-file-management.md) | 27 | [API References](references/27-api-references.md) |
| 14 | [I18n & Localization](references/14-i18n-localization.md) | | |

Additional resources:
- [Templates](references/templates/README.md) - EmptyAbility template documentation
- [Learning Resources](references/RESOURCES.md) - External open-source projects and tutorials

---

## Common Anti-Patterns

### 1. Immutable Array Updates (CRITICAL)

ArkTS state observation requires **new array references**. Mutating in-place will NOT trigger UI updates.

```typescript
// ❌ WRONG: splice mutates in-place, no UI update
this.items.splice(index, 1)

// ✅ CORRECT: filter creates new array
this.items = this.items.filter((_, i) => i !== index)

// ❌ WRONG: push mutates in-place
this.items.push(newItem)

// ✅ CORRECT: spread creates new array
this.items = [...this.items, newItem]

// ❌ WRONG: direct index assignment
this.items[0] = updatedItem

// ✅ CORRECT: map creates new array
this.items = this.items.map((item, i) =>
  i === 0 ? updatedItem : item
)
```

### 2. Missing $ Syntax for @Link
```typescript
// ❌ Bad: Missing $
Child({ value: this.count })

// ✅ Good: Use $ for @Link
Child({ value: $this.count })
```

### 3. Deep Nesting Without @Observed
```typescript
// ❌ Bad: Nested property change won't trigger update
this.user.profile.name = 'New'

// ✅ Good: Use @Observed/@ObjectLink
@Observed
class Profile { name: string = '' }
```

### 4. Animation in aboutToAppear
```typescript
// ❌ Bad: Component not yet created
aboutToAppear() {
  animateTo({ duration: 300 }, () => { this.scale = 1.5 })
}

// ✅ Good: Use onAppear
Text('Hello')
  .onAppear(() => {
    animateTo({ duration: 300 }, () => { this.scale = 1.5 })
  })
```

### 5. Missing HTTP Cleanup
```typescript
// ❌ Bad: No cleanup
let httpRequest = http.createHttp()
await httpRequest.request(...)

// ✅ Good: Always destroy
try {
  await httpRequest.request(...)
} finally {
  httpRequest.destroy()
}
```

### 6. UI Operation in onCreate
```typescript
// ❌ Bad: UI not yet created in onCreate
onCreate(): void {
  AppStorage.setOrCreate('uiReady', true)
}

// ✅ Good: Wait for onWindowStageCreate
onWindowStageCreate(windowStage: window.WindowStage): void {
  windowStage.loadContent('pages/Index', () => {
    AppStorage.setOrCreate('uiReady', true)
  })
}
```

### 7. Forgetting Resource Cleanup in onBackground
```typescript
// ❌ Bad: Resources still occupied in background
onBackground(): void {
  // Nothing done
}

// ✅ Good: Release background resources
onBackground(): void {
  this.mediaPlayer?.pause()
  this.locationService?.stop()
  this.saveCurrentState()
}
```

---

## Code Generation Guidelines

### Single File Preference

**Default: Generate a single comprehensive file for each task.**

Rationale:
- Easier to review and test
- Avoids assertion fragmentation in evaluations
- Keeps related code together
- Simpler dependency management

**When to split into multiple files:**
- Clear separation of concerns (e.g., model + service + component)
- Reusable utilities that will be imported elsewhere
- Generated code exceeds 500 lines
- Explicit multi-file structure requested

### Component Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Page | `XxxPage` | `UserListPage`, `SettingsPage` |
| Component | `Xxx` or `XxxComponent` | `UserCard`, `LoadingSpinner` |
| Service | `XxxService` | `UserService`, `HttpService` |
| Model | `Xxx` (PascalCase) | `User`, `Task`, `TodoItem` |

---

## Project Structure

See `empty-ability-template/` for the complete reference project. Key directories:

```
MyApp/
├── AppScope/app.json5        # App config (bundleName required)
├── entry/src/main/
│   ├── ets/
│   │   ├── entryability/     # UIAbility entry
│   │   ├── pages/            # @Entry pages
│   │   ├── components/       # @Component widgets
│   │   ├── models/           # Data models
│   │   ├── services/         # API/HTTP services
│   │   ├── repositories/     # Data access (RDB)
│   │   └── utils/            # Utilities
│   └── resources/            # Module resources
├── build-profile.json5       # Build config
└── module.json5              # Module declaration
```

---

## Build Commands

```bash
# Scaffold new project
bash scripts/scaffold.sh <target-dir> <bundle-name>

# Install dependencies
ohpm install

# Build project
hvigorw assembleHap

# Clean build
hvigorw clean

# Run tests
hvigorw test
```

---

## Resources

- [HarmonyOS Developer Documentation](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)
- [ArkTS API Reference](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/arkts-apis-overview-V5)
- [ArkUI Component Reference](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/arkui-overview-V5)
- [Learning Resources](references/RESOURCES.md) - Open-source projects and tutorials
