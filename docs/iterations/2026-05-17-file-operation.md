# File Operation Case

- **Date**: 2026-05-17
- **Case ID**: file-operation
- **Project Type**: HarmonyOS NEXT ArkTS experiment app
- **HarmonyOS / API Version**: Template target SDK `6.0.2(22)`
- **DevEco Studio Version**: 6.1 Beta1 assumed from current environment
- **Primary Goal**: Use a file-management experiment to validate whether `arkts-patterns` can guide ArkTS file read/write, Chinese text handling, and public-file image display behavior.
- **Relevant Files / Modules**:
  - `exam/file-operation/requirement.png`
  - `exam/file-operation/FileOperationApp/entry/src/main/ets/pages/Index.ets`
  - `skills/arkts-patterns/references/13-file-management.md`
- **Initial Prompt / User Need**: Use `exam/file-operation` as the next real exam case for the Case Learning Iterator.
- **Iteration Status**: Implemented and CLI-verified

## Observed Problem

The requirement image shows two target issues:

1. Fix Chinese garbling when saving and reading text content.
2. After clicking the public-file tab, display an image from the system album.

During implementation, the existing file-management reference suggested `fileIo.writeTextSync()` / `fileIo.readTextSync()`, but DevEco Studio 6.1 reported that `writeTextSync` does not exist on `fileIo`.

Manual Preview interaction then showed a planning gap: saving displayed a success message, but reading immediately after still reported that no file existed. The original acceptance criteria did not explicitly require "save text -> read text -> same content appears in 文件内容", so the build passed while the core user workflow was still broken.

## Root Cause

Chinese text garbling usually comes from treating text bytes with the wrong encoding or reading raw bytes without UTF-8 decoding. For this SDK, text convenience APIs are not available on `fileIo`. The first stream-based implementation compiled but did not reliably satisfy the Preview save/read workflow, so the safer small-text implementation is fd-based `openSync` + `writeSync/readSync` plus explicit UTF-8 decoding with `util.TextDecoder`.

## Solution Applied

- Created `exam/file-operation/FileOperationApp` from the EmptyAbility template under an ASCII-only path.
- Implemented two views in `Index.ets`:
  - `应用文件`: save text to `context.filesDir` using `fileIo.openSync(filePath, CREATE | READ_WRITE)` and `fileIo.writeSync(fd, text)`.
  - `应用文件`: read text with `openSync(READ_ONLY)`, `readSync(fd)`, and `util.TextDecoder.create('utf-8').decodeToString(...)`.
  - `公共文件`: use `photoAccessHelper.PhotoViewPicker` to select one system-album image and display it via `Image(uri)`.
- Used `this.getUIContext().getHostContext()` for the page context to avoid deprecated `getContext` warnings in component code.
- Wrapped `fileIo.closeSync()` and UTF-8 decoding in helper methods with local error handling to satisfy ArkTSCheck exception requirements.
- Moved repeated hardcoded surface/accent colors into resource colors to satisfy DevEco layered-parameter guidance.
- Updated `references/13-file-management.md` to avoid stale `writeTextSync/readTextSync` guidance for DevEco Studio 6.1.

## Verification Performed

- Ran Hvigor PreviewBuild with `DEVECO_SDK_HOME=D:\DevEco Studio\sdk`.
- Result after final warning cleanup: `BUILD SUCCESSFUL in 20 s 441 ms`.
- Ran repository docs validation.
- Manual Preview check found the initial save/read workflow was insufficient; implementation was revised to fd-based file APIs.

## Reusable Learning

- For current DevEco Studio 6.1 SDK, prefer fd-based file text APIs over `fileIo.writeTextSync/readTextSync`; for small experiment files this is also clearer to verify than stream mode.
- Decode read bytes explicitly with `util.TextDecoder.create('utf-8')` for Chinese text.
- `photoAccessHelper.PhotoViewPicker` is a low-friction way to let users choose a public album image for display without hardcoding public file paths.
- ArkTSCheck may warn on file APIs inside `finally`; wrap cleanup calls such as `closeSync()` in their own safe helper.
- Repeated literal colors in ArkUI components should move to resource colors for theme/layered-parameter compatibility.
- DevEco warning output is useful training data: record warning text, triggering code, fix, and whether the warning disappeared after rebuild.

## Recommended Plugin Update

- **Target**: `skills/arkts-patterns/references/13-file-management.md`, `skills/arkts-patterns/references/05-ui-components.md`
- **Update Type**: Reference correction
- **Proposed Change**: Replace convenience text API examples with fd-based read/write and UTF-8 decode guidance; document warning cleanup patterns for throwing file cleanup APIs and repeated literal colors.
- **Evidence**: Hvigor compiler error: `Property 'writeTextSync' does not exist on type 'typeof fileIo'. Did you mean 'writeSync'?`; DevEco warnings for `Function may throw exceptions` and layered color parameters.
- **Scope**: DevEco Studio 6.1 / SDK 6.0.2 file text operations.
- **Risk / Overfitting Check**: This is a compile-time SDK mismatch, so correcting the reference is appropriate after one case.

## Accepted Learnings

- File text examples should use `openSync`, `writeSync(fd)`, `readSync(fd)`, and `util.TextDecoder` for this SDK.
- Case specs must include workflow-level AC, not only build-level AC. For this case: after clicking save, clicking read must display the exact saved Chinese text in the file-content area.
- Public album image selection should use `photoAccessHelper.PhotoViewPicker` instead of hardcoded public paths.
- Safe cleanup helpers reduce ArkTSCheck exception warnings around file stream closing.
- Repeated inline UI colors should be promoted to `color.json` resources when generating experiment apps meant to pass DevEco checks cleanly.

## Rejected Learnings

- Do not promote this experiment's exact UI layout into `SKILL.md`; it is case-specific.
- Do not add file-management business UI to `empty-ability-template`.

## Follow-Up Needed

- Manually verify on a device or DevEco Preview that selected album images render correctly.
- If more file cases appear, consider adding a compact `FileTextUtil` pattern to `references/13-file-management.md`.
