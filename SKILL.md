---
name: arkts-patterns
description: ArkTS development patterns for HarmonyOS NEXT (API 12+) - declarative UI (@Component, @State, @Prop, @Link), state management (@Provide/@Consume, AppStorage, LocalStorage), component lifecycle (aboutToAppear, aboutToDisappear), TaskPool/Worker concurrency, Ability architecture, Navigation routing, HTTP networking, data persistence, animations and gestures. Use when writing HarmonyOS applications, ArkTS components, reviewing ArkTS code, refactoring HarmonyOS apps, or discussing any ArkTS/HarmonyOS development topic.
---

# ArkTS Development Patterns

Development patterns and best practices for building HarmonyOS NEXT applications with ArkTS.

## When to Activate

- Writing new ArkTS/HarmonyOS code
- Reviewing or refactoring ArkTS code
- Designing ArkTS components and state management
- Implementing Ability architecture
- Setting up Navigation routing
- Creating network requests or data persistence
- Adding animations or gestures
- Debugging ArkTS state synchronization issues

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

**Key Concept**: HarmonyOS uses **Stage Model** where UIAbility is the primary UI component. See [Ability Architecture](../knowledge-base/architecture/ability.md) for details.

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
- **Global State**: AppStorage, LocalStorage
- **Best Practices**: Minimize state, choose correct decorator

📖 [State Management Details](../knowledge-base/patterns/state-management.md)

### 2. Decorators Reference
- **Component**: @Component, @Entry, @Reusable
- **State**: @State, @Prop, @Link, @Watch
- **Cross-level**: @Provide/@Consume, @Observed/@ObjectLink
- **Storage**: @StorageLink, @LocalStorageLink

📖 [Decorators Reference](../knowledge-base/language/decorators.md)

### 3. Ability Architecture
- **UIAbility**: Main UI component with lifecycle
- **ExtensionAbility**: Background services (Form, WorkScheduler, etc.)
- **AbilityStage**: Module lifecycle management
- **Context**: Access app resources and directories

📖 [Ability Architecture](../knowledge-base/architecture/ability.md)

### 4. UI Components
- **Design Principles**: Single responsibility, proper granularity
- **Common Patterns**: Buttons, Lists, Forms, Dialogs, Loading states
- **List Rendering**: ForEach, LazyForEach, List, ListItemGroup

📖 [UI Components](../knowledge-base/patterns/ui-components.md)

### 5. Networking
- **HTTP Client**: @ohos.net.http encapsulation
- **Patterns**: Interceptors, Error handling, Retry, Caching
- **API Services**: Domain-specific API encapsulation

📖 [Networking Patterns](../knowledge-base/patterns/networking.md)

### 6. Data Persistence
- **Preferences**: Light-weight key-value storage
- **RDB**: SQLite-based relational database
- **Files**: Document storage and binary data

📖 [Data Persistence](../knowledge-base/patterns/persistence.md)

### 7. Navigation
- **Navigation Component**: Recommended navigation system
- **NavDestination**: Page destinations
- **Deep Link**: URL-based navigation

📖 [Navigation Patterns](../knowledge-base/patterns/navigation.md)

### 8. Concurrency
- **TaskPool**: CPU-intensive parallel tasks
- **Worker**: Long-running background tasks

📖 [Concurrency Patterns](../knowledge-base/language/concurrency.md)

### 9. Animation & Gestures
- **Property Animation**: .animation() modifier
- **Explicit Animation**: animateTo() function
- **Transitions**: Component enter/exit animations
- **Gestures**: Tap, LongPress, Pan, Pinch, Rotation

📖 [Animation & Gestures](../knowledge-base/patterns/animation.md)

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

**Example - Single File with All Patterns:**
```typescript
// Single file containing: Model + Service + Component + Usage
// UserModel.ets

// 1. Model
@Observed
export class User {
  id: number = 0
  name: string = ''
  email: string = ''
}

// 2. Service
export class UserService {
  private static instance: UserService
  static getInstance(): UserService { ... }

  async fetchUsers(): Promise<User[]> { ... }
}

// 3. Component
@Component
export struct UserList {
  @State users: User[] = []
  @State loading: boolean = false

  aboutToAppear() {
    this.loadUsers()
  }

  private async loadUsers() { ... }

  build() {
    // UI implementation
  }
}

// 4. Page Entry (if needed)
@Entry
@Component
struct UserListPage {
  build() {
    UserList()
  }
}
```

### Component Naming Convention

| Type | Pattern | Example |
|------|---------|---------|
| Page | `XxxPage` | `UserListPage`, `SettingsPage` |
| Component | `Xxx` or `XxxComponent` | `UserCard`, `LoadingSpinner` |
| Service | `XxxService` | `UserService`, `HttpService` |
| Model | `Xxx` (PascalCase) | `User`, `Task`, `TodoItem` |

---

## Project Structure

```
MyApp/
├── AppScope/
│   ├── app.json5              # App config
│   └── resources/             # Global resources
├── entry/                     # Main module
│   ├── src/main/
│   │   ├── ets/
│   │   │   ├── entryability/
│   │   │   │   └── EntryAbility.ets
│   │   │   ├── pages/         # @Entry pages
│   │   │   ├── components/    # @Component widgets
│   │   │   ├── models/        # Data models
│   │   │   ├── services/      # API services
│   │   │   ├── repositories/  # Data access
│   │   │   └── utils/         # Utilities
│   │   └── resources/
│   ├── build-profile.json5
│   └── module.json5
├── features/                  # Feature modules
├── commons/                   # Shared modules
└── hvigor/                    # Build scripts
```

---

## Build Commands

```bash
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
- [Learning Resources](../knowledge-base/resources.md)