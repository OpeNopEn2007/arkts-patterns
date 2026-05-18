# Reviewer 评分准则：{{CASE_ID}}

自动 reviewer 在 Claude runner 结束后执行，不能替代人工 E2E。

## 自动评分维度

- `skill_triggered`：是否有证据表明 Claude 使用了 `arkts-patterns`。
- `build_result`：Claude 自己运行的构建是否成功。
- `diff_quality`：修改是否集中，是否污染无关文件，是否包含硬编码或危险逻辑。
- `requirement_coverage`：静态审查下是否覆盖主要验收标准。
- `warning_handling`：是否解释或消除 DevEco / ArkTSCheck 警告。
- `runner_independence`：是否存在 Codex 介入或主对话上下文泄露。
- `human_e2e_pending`：人工 E2E 是否仍待完成。

## 状态规则

- 人工 E2E 未完成：`Pending human E2E`。
- 自动 reviewer 无法判断：`Inconclusive`。
- 人工 E2E 完成且主要验收标准通过：才允许 `Pass` 或 `Pass with warnings`。
- 关键路径失败、无法构建或无法打开 Previewer：`Fail`。
