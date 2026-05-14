# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[2.3.0]: https://github.com/OpeNopEn2007/arkts-patterns/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/OpeNopEn2007/arkts-patterns/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/OpeNopEn2007/arkts-patterns/releases/tag/v2.1.0
[2.0.0]: https://github.com/OpeNopEn2007/arkts-patterns/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/OpeNopEn2007/arkts-patterns/releases/tag/v1.0.0