# Case Learning Iterator

This document defines the learning loop for improving `arkts-patterns` through real ArkTS/HarmonyOS cases.

The goal is to treat each case as training data: raw requirement, runner output, reviewer verification, failures, fixes, and reusable lessons. Only generalized, verified lessons should be promoted into `SKILL.md`, `references/`, templates, scripts, or README files.

## Dataset

Use `docs/iterations/` as the project learning dataset. Each real or high-fidelity ArkTS/HarmonyOS case gets one dated record:

```text
docs/iterations/YYYY-MM-DD-<case-id>.md
```

## Trigger Conditions

Start an iteration record when:

- A case uses `arkts-patterns` to solve a real ArkTS/HarmonyOS development task.
- The case exposes a missing, unclear, stale, or misleading skill/reference/template instruction.
- A DevEco Studio, Hvigor, SDK, scaffold, template, or project-structure issue is discovered.
- DevEco Studio or ArkTSCheck emits warnings that affect generated-code quality.
- The user asks to preserve a lesson for future plugin improvement.

## Standard Iteration Loop

For each iteration:

1. Record the case background, environment, goal, relevant files, observed problem, solution, verification, and reusable learning.
2. Classify the learning target: `SKILL.md`, `references/`, `empty-ability-template/`, `scripts/scaffold.sh`, README files, CHANGELOG, or case-only.
3. Treat each learning as an update candidate before editing core docs. Include evidence, scope, and risk.
4. Apply the smallest useful patch only when the lesson has general value.
5. Keep business-specific logic, private details, unverified guesses, and one-off workarounds out of `SKILL.md` and `references/`.
6. Prefer the three-case rule for ordinary patterns: unless the lesson is an obvious bug, official rule, or high-risk trap, keep it as a candidate until repeated evidence appears.
7. After docs/template updates, run `pwsh ./scripts/validate-docs.ps1`; after template/scaffold/build changes, run the relevant scaffold or Hvigor verification.
8. Record both accepted and rejected learnings, with the reason.

## Clean-Room Skill Experiment

Use clean-room runs as the preferred way to test whether `arkts-patterns` itself is effective.

In a clean-room run, the main conversation acts as experiment coordinator and reviewer, not the implementer:

1. Define the case directory, raw requirement assets, and explicit acceptance criteria before implementation starts.
2. Spawn a fresh subagent without forking the current long conversation context.
3. Give the subagent only the experiment directory, the relevant `arkts-patterns` skill/references, and the acceptance criteria.
4. Do not leak prior debugging conclusions, hidden fixes, or lessons from the current conversation into the runner prompt.
5. The subagent develops the case independently and reports files changed, assumptions, commands run, failures, and verification results.
6. The main conversation then runs verification, reviews the diff, performs manual DevEco/Preview checks when needed, and records the outcome in `docs/iterations/`.
7. Classify failures by cause: missing skill guidance, stale reference, ambiguous requirement, runner mistake, or environment issue.
8. Only promote learnings to `SKILL.md`, `references/`, templates, or README files after reviewer-side evidence confirms the root cause.

Non-clean-room work is still useful for diagnosis and repair, but it does not by itself prove the skill works for a fresh agent.

## Acceptance Criteria Discipline

Before a runner starts, write workflow-level acceptance criteria. Build success alone is not enough.

Good AC example:

```text
Input `123我爱南开`.
Click save.
Click read.
The file-content area must display exactly `123我爱南开`.
Chinese text must not be garbled.
Hvigor PreviewBuild must finish with BUILD SUCCESSFUL.
```

Avoid vague AC such as "implement file read/write" or "make the page work".

## Warning Learning Format

DevEco/ArkTSCheck warnings are useful training data. Record:

- Warning text.
- Triggering file and line.
- Code pattern that caused it.
- Fix applied.
- Rebuild result.
- Whether the warning disappeared.
- Whether the lesson should be promoted or kept as case-only.

## Record Template

```markdown
# <Case Title>

- **Date**:
- **Case ID**:
- **Project Type**:
- **HarmonyOS / API Version**:
- **DevEco Studio Version**:
- **Primary Goal**:
- **Relevant Files / Modules**:
- **Initial Prompt / User Need**:
- **Experiment Mode**: Clean-room / Main-thread diagnostic / Manual repair
- **Runner Context**:
- **Acceptance Criteria Given To Runner**:

## Clean-Room Run

- **Runner Type**:
- **Prompt Given To Runner**:
- **Skill / References Provided**:
- **Runner Output Summary**:
- **Runner Files Changed**:
- **Runner Verification Claimed**:
- **Reviewer Verification Result**:
- **Failure Classification**:

## Observed Problem

## Root Cause

## Solution Applied

## Verification Performed

## Reusable Learning

## Recommended Plugin Update

- **Target**:
- **Update Type**:
- **Proposed Change**:
- **Evidence**:
- **Scope**:
- **Risk / Overfitting Check**:

## Accepted Learnings

## Rejected Learnings

## Follow-Up Needed
```

## Promotion Rules

- Promote obvious bugs, official rules, and high-risk traps immediately when evidence is strong.
- For ordinary patterns, prefer repeated evidence from multiple cases before turning them into strong rules.
- Keep business-specific logic, private details, and unverified guesses in the case record only.
- `SKILL.md` should contain orchestration and decision rules; detailed technique belongs in `references/`.
- Prefer clean-room runs for skill effectiveness claims. Main-thread diagnostic work can repair cases and discover lessons, but should be labeled as non-clean-room evidence.
