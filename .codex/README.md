# Codex Project Automation

This directory contains Codex-specific project automation for building and improving the `arkts-patterns` plugin.

## Repository Skill Location

Codex discovers repository skills from `.agents/skills/`, so the active project development skill lives at:

```text
.agents/skills/case-learning-iterator/SKILL.md
```

`.codex/skills/case-learning-iterator/SKILL.md` is a local mirror and pointer for people who expect Codex-related material under `.codex/`.

## Hooks

`hooks.json` wires non-mutating reminders into:

- `UserPromptSubmit`: when a prompt looks like an experiment, clean-room run, or lesson-preservation request.
- `Stop`: when a response looks complete and should be checked against the iterator before finalizing.

The hook scripts only emit JSON context/reminders. They do not edit files or promote lessons automatically.
