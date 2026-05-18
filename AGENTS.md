# Agent Contract

This file is the shared project contract for AI coding agents in this repository.
It is intended to serve both `CLAUDE.md` and `AGENTS.md` from one source of truth.

## Project Snapshot

- Project: `arkts-patterns`
- Type: Claude Code skill/plugin for HarmonyOS NEXT ArkTS development
- Primary deliverables:
  - `skills/arkts-patterns/SKILL.md`
  - `skills/arkts-patterns/references/`
  - `skills/arkts-patterns/empty-ability-template/`

## Repository Map

```text
.claude-plugin/plugin.json                    plugin metadata + version
skills/arkts-patterns/SKILL.md                main skill behavior and triggers
skills/arkts-patterns/references/             canonical topic references (01-27)
skills/arkts-patterns/references/templates/   template documentation
skills/arkts-patterns/empty-ability-template/ HarmonyOS Stage Model template project
skills/arkts-patterns/scripts/scaffold.sh     project scaffold helper
scripts/validate-docs.ps1                     docs/template integrity checks
```

## Working Rules

- Keep changes minimal, specific, and reviewable.
- Preserve references numbering and filenames: `01-*.md` through `27-*.md`.
- Keep `references/README.md` index consistent with actual files.
- Do not remove, rename, or restructure `empty-ability-template/` files unless explicitly requested.
- Do not add secrets, tokens, or credentials to any tracked file.
- Prefer updating existing docs over creating parallel competing docs.
- 项目文档、提示词、检查清单、问卷和迭代记录默认使用中文，面向中国开发者；代码标识符、路径、命令和 schema 字段名保留原始英文形式。
- Keep DevEco Studio test projects and generated experiment projects under ASCII-only paths; some DevEco Studio versions cannot open project paths containing Chinese or other non-ASCII characters.
- Before CLI Hvigor builds, ensure `DEVECO_SDK_HOME` points to the DevEco SDK root, for example `D:\DevEco Studio\sdk`; after correcting it, stop the Hvigor daemon before retrying.
- Before configuring or troubleshooting DevEco MCP, check the npm package page at `https://www.npmjs.com/package/@deveco-codegenie/mcp`; if the page is unavailable to tooling, use `npm view @deveco-codegenie/mcp@beta version dist-tags description --json` for current package metadata.

## Execution Commands

Run from repository root:

```powershell
pwsh ./scripts/validate-docs.ps1
```

Optional template bootstrap test:

```bash
bash skills/arkts-patterns/scripts/scaffold.sh ./tmp-demo-app com.example.demoapp
```

Optional Windows DevEco CLI preview build:

```powershell
$env:DEVECO_SDK_HOME = 'D:\DevEco Studio\sdk'
& 'D:\DevEco Studio\tools\node\node.exe' 'D:\DevEco Studio\tools\hvigor\bin\hvigorw.js' --stop-daemon
& 'D:\DevEco Studio\tools\node\node.exe' 'D:\DevEco Studio\tools\hvigor\bin\hvigorw.js' --mode module -p module=entry@default -p product=default PreviewBuild --analyze=normal --parallel --incremental
```

Passing criteria: Hvigor prints `BUILD SUCCESSFUL` and exits with code `0`.

## Case Learning Iterator

Use `.agents/skills/iterate/SKILL.md` as the execution authority for the engineering-level plugin iteration loop. `.claude/` and `.codex/` are only adapter layers for hooks/configuration. `docs/iterations/ITERATOR.md` records design background, and `docs/iterations/<case>.md` stores case iteration reports. Do not put this engineering iterator into the published `skills/arkts-patterns/` skill unless a verified general ArkTS lesson is being promoted.

## Change Checklist

Before finalizing documentation or template-related work:

1. Run `pwsh ./scripts/validate-docs.ps1`.
2. Ensure links/paths in edited markdown files resolve.
3. Add or update a `docs/iterations/` record when the work comes from a real case.
4. Ensure `README.md` and `README-zh.md` stay aligned for any user-facing behavior change.
5. Update `CHANGELOG.md` when behavior, structure, or release-facing docs changed.

## Release Notes

- Releases are tag-driven via `.github/workflows/release.yml` (`v*` tags).
- Keep plugin version in `.claude-plugin/plugin.json` and release notes/changelog coherent.
- Use conventional commits (`feat:`, `fix:`, `docs:`, `refactor:`) for traceable history.
