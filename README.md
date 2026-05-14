# ArkTS Patterns - Claude Code Skill

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Claude Code](https://img.shields.io/badge/Claude_Code-Plugin-blue.svg)](https://claude.ai/code)
[![HarmonyOS](https://img.shields.io/badge/HarmonyOS-NEXT_API_12+-red.svg)](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/application-dev-guide-V5)

> Production-ready ArkTS development patterns for HarmonyOS NEXT applications. **100% benchmark pass rate.**

## Features

- **State Management** - @State, @Prop, @Link, @Provide/@Consume, @Observed/@ObjectLink, V2 decorators
- **Component Lifecycle** - aboutToAppear, aboutToDisappear, UIAbility lifecycle
- **Concurrency** - TaskPool for CPU-intensive tasks, Worker for background processing
- **Navigation** - NavPathStack + NavDestination (recommended over @ohos.router), RouterService pattern
- **Networking** - HTTP client with interceptors, error handling, retry mechanism, RCP
- **Data Persistence** - Preferences (light-weight), RDB (SQLite), Repository pattern
- **Animation & Gestures** - animateTo, PinchGesture, RotationGesture, PanGesture, gesture combinations
- **Project Scaffolding** - EmptyAbility template + `scaffold.sh` script for rapid project creation

## Installation

### Method 1: From Marketplace (Recommended)

```bash
# Add the marketplace
/plugin marketplace add OpeNopEn2007/opencc-plugins

# Install the plugin
/plugin install arkts-patterns@opencc-plugins
```

### Method 2: Clone to Plugins Directory

```bash
git clone https://github.com/OpeNopEn2007/arkts-patterns.git ~/.claude/plugins/arkts-patterns
```

### Method 3: Development Mode

```bash
claude --plugin-dir /path/to/arkts-patterns
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
| **EmptyAbility Template** | Official project template | ✅ |

## Benchmark Results

| Metric | With Skill | Without Skill |
|--------|-----------|---------------|
| Pass Rate | **100%** (50/50) | 96% (48/50) |

See [benchmark.md](./benchmark.md) for detailed results.

## Project Structure

```
arkts-patterns/
├── .claude-plugin/
│   └── plugin.json              # Plugin manifest (v2.3.0)
├── skills/arkts-patterns/       # Skill directory (standard layout)
│   ├── SKILL.md                 # Main skill file (~490 lines)
│   ├── references/              # Layer 3: 27 topic docs + templates + RESOURCES
│   │   ├── README.md            # Topic index
│   │   ├── RESOURCES.md         # External learning resources
│   │   ├── 01-getting-started.md ~ 27-api-references.md
│   │   └── templates/           # EmptyAbility template docs
│   ├── scripts/
│   │   └── scaffold.sh          # Quick project scaffolding tool
│   └── empty-ability-template/  # Complete Stage Model project template (35 files)
├── README.md                    # This file
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── benchmark.md
└── LICENSE                      # MIT License
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