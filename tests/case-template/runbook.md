# 案例运行手册：{{CASE_ID}}

## 准备

```powershell
node tests/case-runner/run-case.mjs --case exam/{{CASE_ID}} --prepare
```

检查并本地化：

- `case.json`
- `runner-prompt.md`
- `human-e2e-checklist.md`
- `human-e2e-response.md`
- `review-rubric.md`

## Dry Run

```powershell
node tests/case-runner/run-case.mjs --case exam/{{CASE_ID}} --dry-run
```

## Clean-Room 运行

```powershell
node tests/case-runner/run-case.mjs --case exam/{{CASE_ID}}
```

Claude runner 运行期间，Codex 不介入、不读取中间文件、不修复临时工作区。

## 人工 E2E

在 DevEco Studio 中打开：

```text
tmp/newApp/
```

按 `human-e2e-checklist.md` 测试，并填写 `human-e2e-response.md`。
