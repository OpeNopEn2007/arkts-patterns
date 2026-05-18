---
name: case-learning-iterator
description: Use for real ArkTS/HarmonyOS experiment cases, exam projects, clean-room skill tests, DevEco/ArkTSCheck warning learning, or preserving lessons back into arkts-patterns without contaminating the published skill.
---

# Case Learning Iterator

Use this project-local development skill to run real cases as learning iterations for `arkts-patterns`.

## Required Source

Read `docs/iterations/ITERATOR.md` before implementing, delegating, reviewing, or promoting lessons from a case.

## Workflow

1. Create or update one case record under `docs/iterations/YYYY-MM-DD-<case-id>.md`.
2. Define workflow-level acceptance criteria before the runner starts. Build success alone is not enough.
3. Prefer a clean-room runner for skill-effectiveness claims. Give it only the case directory, relevant `arkts-patterns` context, and acceptance criteria.
4. Keep the main conversation as reviewer: verify the result, review diffs, run applicable commands, and classify failures.
5. Record DevEco Studio, Hvigor, and ArkTSCheck warnings as training data when they affect generated-code quality.
6. Promote only generalized, verified lessons into `skills/arkts-patterns/`, references, templates, scripts, README files, or CHANGELOG.
7. Label non-clean-room work as diagnostic or manual repair evidence.

## Guardrails

- Do not put internal iterator workflow into `skills/arkts-patterns/` unless it changes the published ArkTS skill behavior.
- Do not leak prior debugging conclusions into a clean-room runner prompt.
- Do not treat a successful Hvigor build as functional acceptance without workflow checks.
- Do not promote business-specific logic, private details, or one-off workarounds.
