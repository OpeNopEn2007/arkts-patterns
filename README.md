# ArkTS Patterns - Claude Code Skill

[中文文档 (README-zh)](./README-zh.md)

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

## v3 Architecture Direction

`arkts-patterns` v3 positions the skill as an ArkTS/HarmonyOS agent-development orchestrator:

- `SKILL.md` routes tasks between stable references, live tooling, verification, and fallback paths.
- `references/` stores persistent engineering memory: stable ArkTS patterns, common mistakes, template rules, and offline fallback guidance.
- DevEco MCP is the recommended live-tooling enhancement for current API lookup, ETS checks, project sync, build, app launch, UI tree inspection, UI actions, and UI verification.

DevEco MCP is not a hard dependency for basic use. If MCP tools are unavailable, the skill should keep working from `references/` and clearly mark live checks, builds, or UI verification as not executed.

When configuring or troubleshooting DevEco MCP, agents should first check the npm package page: [@deveco-codegenie/mcp](https://www.npmjs.com/package/@deveco-codegenie/mcp). The package README and current dist-tags take precedence over summarized guidance in this repository.

### v3 Layers

| Layer | Role |
|-------|------|
| Layer 1: `SKILL.md` orchestrator | Routes tasks, keeps the shortest safe path, and defines side-effect boundaries. |
| Layer 2: DevEco MCP live tooling | Provides current SDK/API lookup and optional project/UI verification. |
| Layer 3: `references/` engineering memory | Holds curated stable patterns and offline fallback guidance. |

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
│   └── plugin.json              # Plugin manifest (v2.3.1)
├── skills/arkts-patterns/       # Skill directory (standard layout)
│   ├── SKILL.md                 # Main skill file (~490 lines)
│   ├── references/              # Layer 3: 27 topic docs + templates + RESOURCES
│   │   ├── README.md            # Topic index
│   │   ├── RESOURCES.md         # External learning resources
│   │   ├── 01-getting-started.md ~ 27-api-references.md
│   │   └── templates/           # EmptyAbility template docs
│   ├── scripts/
│   │   └── scaffold.sh          # Quick project scaffolding tool
│   └── empty-ability-template/  # Complete Stage Model project template
├── README.md                    # This file
├── CHANGELOG.md
├── CONTRIBUTING.md
├── SECURITY.md
├── benchmark.md
└── LICENSE                      # MIT License
```

Reference docs live in `skills/arkts-patterns/references/` and are indexed by [skills/arkts-patterns/references/README.md](skills/arkts-patterns/references/README.md).

## Minimal Usage Example

When a task is small, use the shortest path: identify the core topic, open the matching reference, then generate one focused ArkTS skeleton.

| Requirement | Reference Path | Expected Output |
|-------------|----------------|-----------------|
| Build a deletable todo list where a child component updates parent state | `references/04-state-management.md` + `references/05-ui-components.md` | Single-file `@Entry` page using `@State`, `@Link`, `List`, and immutable array updates |

Prompt example:

```text
Create a HarmonyOS NEXT ArkTS todo list where each row is a child component and the child can delete itself from the parent list.
```

## Requirements

- HarmonyOS NEXT (API 12+)
- DevEco Studio 4.0+
- Claude Code CLI

## Maintenance Check

Run a quick docs integrity check before release:

```powershell
pwsh ./scripts/validate-docs.ps1
```

For command-line HarmonyOS build verification on Windows, make sure `DEVECO_SDK_HOME` points to the DevEco SDK root, for example `D:\DevEco Studio\sdk`, then stop the Hvigor daemon before retrying failed builds.

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
