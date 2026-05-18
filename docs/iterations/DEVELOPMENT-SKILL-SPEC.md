# Case Learning Development Skill Spec

This document defines the project-local development skill and hook layer that supports the Case Learning Iterator.

The goal is to make real ArkTS/HarmonyOS experiments repeatable, reviewable, and transferable without mixing internal plugin-building workflow into the published `arkts-patterns` skill.

## Concept

Treat each real case as a supervised-learning sample for this repository:

- The runner receives a clean task, acceptance criteria, and the relevant skill context.
- The reviewer verifies the result, classifies failures, and records evidence.
- Only generalized, verified lessons are promoted into `skills/arkts-patterns/`, references, templates, scripts, or release-facing docs.

The development skill is an internal orchestration aid. It should remind agents to use `docs/iterations/ITERATOR.md`, but the iterator document remains the source of truth.

## Scope

Included:

- Clean-room experiment setup.
- Acceptance criteria before implementation.
- Runner/reviewer separation.
- Warning and failure learning records.
- Promotion rules for reusable lessons.
- Hook reminders when prompts or stopping points look like case-learning work.

Excluded:

- Product-facing ArkTS guidance.
- Published plugin skill behavior.
- Automatic mutation of iteration records.
- Automatic promotion of lessons into references.

## Platform Mapping

Claude Code:

- Project skill: `.claude/skills/case-learning-iterator/SKILL.md`.
- Project hooks: `.claude/settings.json` plus scripts in `.claude/hooks/`.
- Trigger: natural-language relevance or direct skill invocation.

Codex:

- Repository skill: `.agents/skills/case-learning-iterator/SKILL.md`.
- Codex hooks/config: `.codex/hooks.json` plus scripts in `.codex/hooks/`.
- Project-local mirror: `.codex/skills/case-learning-iterator/SKILL.md` documents the intended Codex-facing workflow, but official Codex repository skill discovery uses `.agents/skills`.

## Hook Behavior

`UserPromptSubmit`:

- Detects prompts mentioning `exam/`, `exam\`, clean-room runs, iterator work, skill tests, experiments, warning learning, or lesson promotion.
- Adds context reminding the agent to use the Case Learning Iterator and define acceptance criteria before delegating or implementing.
- Does not block the prompt.

`Stop`:

- Detects completion-like assistant messages that also mention case-learning or experiment work.
- Surfaces a reminder to record verification, failure classification, and promotion decisions before claiming final completion.
- Does not block stopping.

Hooks must be deterministic, dependency-free, and safe to run repeatedly. They must not edit files.

## Acceptance Criteria

- Claude Code has a project skill under `.claude/skills/case-learning-iterator/`.
- Codex has a repository skill under `.agents/skills/case-learning-iterator/`.
- `.codex/` contains hook configuration, hook scripts, and a short README explaining the Codex mapping.
- Hook config JSON files parse successfully.
- Hook scripts accept representative JSON on stdin and return valid JSON or no output.
- `docs/iterations/ITERATOR.md` points to the platform-specific skill/hook locations.
- `CLAUDE.md` and `AGENTS.md` stay aligned and point to the iterator, not duplicate it.
- `pwsh ./scripts/validate-docs.ps1` passes.

## Development Plan

1. Add this spec to `docs/iterations/`.
2. Add thin project skills for Claude Code and Codex.
3. Add non-mutating reminder hooks for prompt submission and stopping.
4. Update iterator and project contract pointers.
5. Validate JSON, hook scripts, docs integrity, and CLAUDE/AGENTS alignment.
