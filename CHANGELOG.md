# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[2.1.0]: https://github.com/OpeNopEn2007/arkts-patterns/releases/tag/v2.1.0
[2.0.0]: https://github.com/OpeNopEn2007/arkts-patterns/compare/v1.0.0...v2.0.0
[1.0.0]: https://github.com/OpeNopEn2007/arkts-patterns/releases/tag/v1.0.0