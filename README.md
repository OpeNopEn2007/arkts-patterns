# ArkTS Patterns - Claude Code Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Skill-blue.svg)](https://claude.ai/code)
[![HarmonyOS](https://img.shields.io/badge/HarmonyOS-NEXT_API_12+-red.svg)](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)

> Production-ready ArkTS development patterns for HarmonyOS NEXT applications. **100% benchmark pass rate.**

## Features

- **State Management** - @State, @Prop, @Link, @Provide/@Consume, @Observed/@ObjectLink
- **Component Lifecycle** - aboutToAppear, aboutToDisappear, UIAbility lifecycle
- **Concurrency** - TaskPool for CPU-intensive tasks, Worker for background processing
- **Navigation** - NavPathStack + NavDestination (recommended over @ohos.router)
- **Networking** - HTTP client with interceptors, error handling, retry mechanism
- **Data Persistence** - Preferences (light-weight), RDB (SQLite)
- **Animation & Gestures** - animateTo, PinchGesture, RotationGesture, PanGesture

## Installation

### Method 1: Claude Code Plugin (Recommended)

```bash
# In Claude Code
/plugin

# Navigate to Marketplaces → Add Marketplace
# Enter: github.com/your-username/arkts-patterns
```

### Method 2: Manual Installation

```bash
# Clone to skills directory
mkdir -p ~/.claude/skills/
git clone https://github.com/your-username/arkts-patterns.git ~/.claude/skills/arkts-patterns
```

### Method 3: Direct Path

```bash
claude --skill-path /path/to/arkts-patterns
```

## Usage

The skill automatically activates when:
- Writing ArkTS/HarmonyOS code
- Reviewing or refactoring ArkTS code
- Designing component state management
- Implementing Ability architecture
- Setting up Navigation routing

### Example Prompts

```
"Create a counter component with @State"
"Implement parent-child communication using @Link"
"Set up Navigation routing with NavPathStack"
"Create HTTP client with retry mechanism"
```

## Pattern Coverage

| Pattern | Description | Status |
|---------|-------------|--------|
| @State Counter | Basic state management | ✅ |
| @Link Parent-Child | Two-way binding | ✅ |
| TaskPool Async | Background processing | ✅ |
| UIAbility Lifecycle | App lifecycle management | ✅ |
| Navigation Routing | NavPathStack patterns | ✅ |
| HTTP Client | Network requests | ✅ |
| RDB Persistence | SQLite storage | ✅ |
| Animation & Gestures | Interactive UI | ✅ |
| @Observed/@ObjectLink | Nested object observation | ✅ |
| Error Recovery | Retry with backoff | ✅ |

## Benchmark Results

| Metric | With Skill | Without Skill |
|--------|-----------|---------------|
| Pass Rate | **100%** (50/50) | 96% (48/50) |

See [benchmark.md](./benchmark.md) for detailed results.

## Project Structure

```
arkts-patterns/
├── SKILL.md                    # Main skill file
├── README.md                   # This file
├── LICENSE                     # MIT License
├── .claude-plugin/
│   └── marketplace.json        # Marketplace config
└── knowledge-base/             # Reference documentation
    ├── architecture/
    │   └── ability.md
    ├── language/
    │   ├── decorators.md
    │   └── concurrency.md
    └── patterns/
        ├── state-management.md
        ├── ui-components.md
        ├── networking.md
        ├── persistence.md
        ├── navigation.md
        └── animation.md
```

## Requirements

- HarmonyOS NEXT (API 12+)
- DevEco Studio 4.0+
- Claude Code CLI

## Contributing

Contributions welcome! Please read our contributing guidelines before submitting PRs.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-pattern`)
3. Commit your changes (`git commit -m 'feat: add amazing pattern'`)
4. Push to the branch (`git push origin feature/amazing-pattern`)
5. Open a Pull Request

## Resources

- [HarmonyOS Developer Documentation](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)
- [ArkTS API Reference](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/arkts-apis-overview-V5)
- [ArkUI Component Reference](https://developer.huawei.com/consumer/cn/doc/harmonyos-references-V5/arkui-overview-V5)

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Anthropic for Claude Code and the Skills framework
- Huawei for HarmonyOS NEXT and ArkTS
- The open-source community for pattern inspiration