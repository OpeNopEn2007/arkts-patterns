# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Repositioned v3 documentation around `SKILL.md` orchestration, persistent `references/` engineering memory, and optional DevEco MCP live tooling with explicit fallback behavior.
- Documented the v3 three-layer architecture: `SKILL.md` orchestrator, DevEco MCP live tooling, and curated `references/` engineering memory.
- Updated tooling/API references to prefer DevEco MCP for current SDK/API and project verification, with offline references as fallback.
- Added npm package-page lookup guidance for DevEco MCP so agents check the latest package README and dist-tags before configuring or troubleshooting.
- Documented DevEco Studio/Hvigor CLI verification: ASCII-only project paths, `DEVECO_SDK_HOME` setup, daemon restart, and `BUILD SUCCESSFUL` acceptance criteria.
- Added the DevEco Studio ASCII-path and Hvigor CLI environment requirements to the agent contract.
- Corrected file-management guidance for DevEco Studio 6.1 by preferring fd-based text read/write with explicit UTF-8 decoding.
- Added reusable ArkTSCheck warning guidance for throwing file cleanup APIs and resource-based UI colors.

### Added
- Added `skills/arkts-patterns/references/deveco-mcp.example.json` with placeholder-only DevEco MCP configuration using `@deveco-codegenie/mcp@beta`.
- Added `docs/iterations/` as the case-learning dataset for real ArkTS/HarmonyOS experiments, including the first smart-device-control case record.
- Added `docs/iterations/ITERATOR.md` as the standalone Case Learning Iterator guide, including clean-room skill experiments and acceptance-criteria discipline.

## [2.3.1] - 2026-05-16

### Changed
- Bumped the plugin manifest to `2.3.1`
- Aligned README structure notes with actual repository layout under `skills/arkts-patterns/`
- Added a minimal README usage example that maps a user requirement to reference lookup and expected ArkTS output
- Added a "Minimal Path (Fastest Usage)" section in `SKILL.md` to make the shortest execution path explicit
- Added a minimal end-to-end example in `SKILL.md`: requirement -> reference lookup -> ArkTS skeleton output
- Clarified references navigation contract in `references/README.md` to keep numbering and filenames consistent with `SKILL.md`
- Added `scripts/validate-docs.ps1` to validate references numbering and required template/docs files
- Documented pre-release docs validation command in README and templates index

## [2.3.0] - 2026-05-14

### Added
- **`scripts/scaffold.sh`** - Quick project scaffolding tool that copies `empty-ability-template/` and replaces `bundleName`
- **Anti-patterns & best practices** injected into all 10 core reference documents (02-10)
- **RouterService singleton pattern** - Practical NavPathStack wrapper for centralized navigation
- **PreferencesUtil singleton + RDB Repository pattern** - Production-ready data persistence patterns
- **Practical component patterns** - LoadingContainer, Skeleton, FormField, SearchBar, EmptyState
- **Gesture conflict resolution** - GestureMask priority, directional swipe, Parallel gesture combinations
- **ErrorHandler + API service patterns** - HTTP error code mapping and domain-specific service classes
- **State management hierarchy** - Visual pyramid diagram from AppStorage down to @State

### Changed
- **Merged knowledge-base into references/** - Eliminated ~20,000 lines of overlap; `references/` is now the single source of truth
- **Moved templates to references/templates/** - Template docs consolidated under references
- **Renamed resources.md → RESOURCES.md** in references/
- **Promoted `empty-ability-template/` in SKILL.md** - Now appears right after "When to Activate"
- **SKILL.md links updated** - All `knowledge-base/` links changed to `references/`
- **Added references/ quick index** - All 27 topics listed in SKILL.md for easy discovery
- **Updated Project Structure** in README.md and CONTRIBUTING.md

### Removed
- **knowledge-base/ directory** - Entirely removed after content merged into references/

## [2.2.0] - 2026-03-24

### Added
- **EmptyAbility Project Template** - Complete HarmonyOS project template with source code
  - EntryAbility.ets with full lifecycle management
  - EntryBackupAbility.ets for data backup/restore
  - Index.ets demonstrating @Entry/@Component/@State decorators
  - All configuration files (app.json5, module.json5, build-profile.json5, code-linter.json5)
  - Hypium test framework setup
  - Hvigor build system configuration
- **Template Documentation** - Comprehensive guides for the EmptyAbility template
  - entry-ability.md - Ability lifecycle documentation
  - entry-backup-ability.md - Backup extension documentation
  - index-page.md - Page template documentation
  - configuration.md - Configuration files reference
  - resources.md - Resource management guide
  - build-system.md - Hvigor build system guide
  - testing.md - Hypium testing framework guide

### Changed
- **Refactored to Claude Code Plugin Specification** - Restructured directory layout
  - Created `.claude-plugin/plugin.json` (required plugin manifest)
  - Moved `SKILL.md` to `skills/arkts-patterns/SKILL.md`
  - Removed incorrect `marketplace.json` file
  - Updated all relative paths in SKILL.md
- Updated README.md with new installation instructions and project structure
- Reorganized directory structure to follow Claude Code plugin specification

## [2.1.0] - 2026-03-24

### Added
- Initial production release
- 10 core ArkTS patterns with 100% benchmark pass rate
- State management patterns (@State, @Prop, @Link, @Observed/@ObjectLink)
- Component lifecycle patterns (aboutToAppear, aboutToDisappear, UIAbility)
- Concurrency patterns (TaskPool, Worker)
- Navigation patterns (NavPathStack + NavDestination)
- HTTP client patterns with interceptors and retry
- Data persistence patterns (Preferences, RDB)
- Animation and gesture patterns
- Error recovery with exponential backoff

### Changed
- Improved @Link vs @Prop decision matrix with "CRITICAL DEFAULT" guidance
- Added single file generation preference
- Strengthened immutable array update guidance

### Benchmark
- With Skill: 100% (50/50 assertions)
- Without Skill: 96% (48/50 assertions)

## [2.0.0] - 2026-03-23

### Added
- Initial skill structure
- Basic ArkTS patterns documentation
- Knowledge base organization

## [1.0.0] - 2026-03-17

### Added
- Project initialization
- Basic skill template

---

[2.3.1]: https://github.com/OpeNopEn2007/arkts-patterns/compare/v2.3.0...v2.3.1
[2.3.0]: https://github.com/OpeNopEn2007/arkts-patterns/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/OpeNopEn2007/arkts-patterns/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/OpeNopEn2007/arkts-patterns/releases/tag/v2.1.0
[2.0.0]: https://github.com/OpeNopEn2007/arkts-patterns/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/OpeNopEn2007/arkts-patterns/releases/tag/v1.0.0
