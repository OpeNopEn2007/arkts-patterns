# Smart Device Control Case

- **Date**: 2026-05-17
- **Case ID**: smart-device-control
- **Project Type**: HarmonyOS NEXT ArkTS experiment app
- **HarmonyOS / API Version**: Template target SDK `6.0.2(22)`
- **DevEco Studio Version**: 6.1 Beta1
- **Primary Goal**: Use a real classroom-style ArkTS experiment to validate whether `arkts-patterns` can produce a usable, previewable, and compilable app.
- **Relevant Files / Modules**:
  - `exam/smart-device-control/SmartDeviceApp/entry/src/main/ets/pages/Index.ets`
  - `exam/smart-device-control/SmartDeviceApp/entry/src/main/ets/models/`
  - `skills/arkts-patterns/SKILL.md`
  - `skills/arkts-patterns/references/22-tooling.md`
- **Initial Prompt / User Need**: Use the smart-device-control experiment as a real test case for the skill.

## Observed Problem

DevEco Studio could not open the first generated project because the project path contained Chinese characters. Later, the IDE preview build succeeded, but running Hvigor from a terminal initially failed because `DEVECO_SDK_HOME` was not set correctly for the shell environment.

## Root Cause

Some DevEco Studio versions reject project paths containing Chinese or other non-ASCII characters. DevEco Studio also supplies SDK environment context internally, while a standalone terminal may not have `DEVECO_SDK_HOME` pointed at the DevEco SDK root.

## Solution Applied

The experiment project was moved to an ASCII-only path:

```text
E:\Study\CodingWorkSpace\arkts-patterns\exam\smart-device-control\SmartDeviceApp
```

For terminal compilation, the SDK root was set explicitly:

```powershell
$env:DEVECO_SDK_HOME = 'D:\DevEco Studio\sdk'
```

The Hvigor daemon was stopped and the preview build was rerun with DevEco Studio's bundled Node and Hvigor.

## Verification Performed

- DevEco Studio opened the ASCII-only project path.
- Preview rendered the app UI.
- Normal interaction worked: setting light brightness and air-conditioner temperature updated device info.
- Invalid input was rejected with user-facing messages.
- Hvigor PreviewBuild completed with `BUILD SUCCESSFUL`.
- Repository validation passed with `pwsh ./scripts/validate-docs.ps1`.

## Reusable Learning

- Generated DevEco Studio test projects should use ASCII-only paths.
- IDE build success does not prove terminal Hvigor is configured correctly.
- CLI verification should explicitly check `DEVECO_SDK_HOME`, stop the Hvigor daemon after environment changes, and require `BUILD SUCCESSFUL` plus exit code `0`.
- `wmic` warnings are not necessarily fatal; final Hvigor status is the source of truth.

## Recommended Plugin Update

- **Target**: `SKILL.md`, `references/22-tooling.md`, `CLAUDE.md`, `AGENTS.md`, README files, `CHANGELOG.md`
- **Update Type**: Documentation and process rules
- **Proposed Change**: Add ASCII-path guidance and CLI Hvigor environment verification steps.
- **Evidence**: DevEco Studio open-path error, initial terminal Hvigor `DEVECO_SDK_HOME` failure, successful rebuild after setting the SDK root.
- **Scope**: DevEco Studio / Hvigor workflows on Windows, especially generated experiment and template projects.
- **Risk / Overfitting Check**: Although observed in one case, this is a high-risk environment trap with clear failure evidence, so it is suitable for immediate documentation.

## Accepted Learnings

- Add ASCII-only project path guidance.
- Add `DEVECO_SDK_HOME` setup and daemon restart guidance for CLI Hvigor builds.
- Add the Case Learning Iterator so future cases produce structured learning records.

## Rejected Learnings

- Do not promote the smart-device-control business logic into `SKILL.md`; it is an experiment-specific domain example.
- Do not add the experiment app to the reusable EmptyAbility template.

## Follow-Up Needed

- Use future cases to test whether the same path and CLI environment rules apply across other DevEco Studio versions.
- Consider adding a lightweight script for local Hvigor environment checks if this failure repeats.
