# arkts-patterns 工程评测工具

这个目录存放用于迭代 `arkts-patterns` 插件的工程级评测工具。它不是发布插件的用户功能。

边界约定：

- `tests/` 保存全局模板和 harness 源。
- `exam/<case>/tests/` 保存某个案例的本地化测试资产。
- `docs/iterations/` 保存案例学习记录和迭代报告。
- `tmp/` 保存临时 App 产物，不进 git。

## 当前目录

- `case-runner/`：运行 clean-room ClaudeCode runner，并生成 result / 人工 E2E 资产。
- `case-template/`：新实验案例的测试资产模板，用于生成 `exam/<case>/tests/`。
- `docs-check/`：封装仓库文档完整性校验。
- `arkts-cases/`：兼容早期中心化 case 配置；新案例优先使用 `exam/<case>/tests/case.json`。
- `skill-triggering/` 与 `explicit-skill-requests/`：早期 Skill 触发实验资产，暂不作为核心流程扩展。

## 推荐命令

新实验进入 `exam/<case>/` 后，先生成案例级测试资产：

```powershell
node tests/case-runner/run-case.mjs --case exam/<case> --prepare
```

如果 `exam/<case>/` 下没有 DevEco 项目，prepare 会从 `skills/arkts-patterns/empty-ability-template/` 创建：

```text
exam/<case>/tests/starter-app/
```

随后本地化 `exam/<case>/tests/` 下的 prompt、清单和评分准则，再运行：

```powershell
node tests/case-runner/run-case.mjs --case exam/<case> --dry-run
node tests/case-runner/run-case.mjs --case exam/<case> --fake-completed-run
node tests/docs-check/validate-docs-wrapper.mjs
```

真实 clean-room 评测会调用 Claude Code，可能需要数分钟：

```powershell
node tests/case-runner/run-case.mjs --case exam/<case>
```

早期中心化配置仍兼容：

```powershell
node tests/case-runner/run-case.mjs --case file-operation --dry-run
```
