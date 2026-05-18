# iterate 设计记录

本文记录 `arkts-patterns` 仓库工程级迭代器的设计背景、讨论结论和机制演进。

执行权威不是本文，而是：

```text
.agents/skills/iterate/SKILL.md
```

Claude Code 通过 `.claude/skills/iterate/SKILL.md` 适配 `/iterate`；Codex 通过 `.agents/skills/iterate/` 自动发现仓库级 Skill。`.codex/` 只保留 Hook 和配置适配。

## 定位

`iterate` 是开发 `arkts-patterns` 插件的工程工具，不是发布插件功能。

它服务插件开发者，用来把真实 ArkTS/HarmonyOS 实验案例转化为可验证、可审查、可沉淀的学习样本。它不应被写入 `skills/arkts-patterns/` 的用户使用流程。

## 设计动机

我们希望用类似监督学习的方式迭代插件：

1. 用户把真实实验案例放到 `exam/<case>/`。
2. Codex 触发 `iterate`。
3. 系统生成案例级测试资产。
4. 干净 ClaudeCode runner 独立开发和构建。
5. 人类开发者在 DevEco Studio 中做 E2E 验收。
6. Codex 根据 runner 产物、人类反馈和审查结果判断是否改进插件。
7. 只有验证过的通用经验才进入发布 Skill 或 references。

这样可以避免主对话上下文污染，真实衡量 `arkts-patterns` 对干净 agent 的指导效果。

## 最终结构

```text
.agents/skills/iterate/SKILL.md      iterate Skill 权威源
.claude/skills/iterate/SKILL.md      Claude Code /iterate 适配副本
.claude/settings.json                Claude Code Hook 配置
.claude/hooks/                       Claude Code Hook 脚本
.codex/hooks.json                    Codex Hook 配置
.codex/hooks/                        Codex Hook 脚本
tests/                               全局模板和 harness 源
exam/<case>/tests/                   某个案例的本地化测试资产
docs/iterations/<case>.md            案例迭代报告
tmp/newApp/                          最新 App 临时产物
```

## 关键决策

- `.agents/skills/iterate/SKILL.md` 是唯一允许手工编辑的 Skill 源。
- `.claude/skills/iterate/SKILL.md` 与 `.agents` 同步，用于 Claude Code 项目 Skill 和 `/iterate`。
- `.codex/skills/` 不作为 Codex 自动发现入口；Codex 使用 `.agents/skills/`。
- `docs/iterations/` 记录设计背景和案例报告，不再承载执行规范权威。
- 本阶段不做 LSP、DevEco MCP 或实时 ArkTSCheck 诊断增强，先把迭代闭环做扎实。
- 文档、prompt、检查清单、问卷和报告默认中文。

## 标准案例流

用户在新对话中说：

```text
@exam/new/，新的实验案例，进行测试和迭代
```

`iterate` 的目标链路：

1. 识别 `exam/new/`。
2. 读取需求资料和可用项目资产。
3. 从 `tests/case-template/` 生成 `exam/new/tests/`。
4. 生成中文 runner prompt、人类 E2E 清单和评分准则。
5. 启动 clean-room ClaudeCode runner。
6. 将最新 App 输出到 `tmp/newApp/`。
7. Claude 运行期间 Codex 不介入。
8. Claude 完成后 Codex 进入 reviewer 阶段。
9. 人类开发者在 DevEco Studio 中打开 `tmp/newApp/` 并填写反馈。
10. Codex 根据反馈决定是否提升经验到 `skills/arkts-patterns/`。
11. 写入 `docs/iterations/<case>.md`。
12. 如果失败，先询问是否进入二轮循环。

## 经验提升规则

- 明显 bug、官方规则和高风险陷阱，在证据充分时可以立即提升。
- 普通模式优先等待多个案例的重复证据，再变成强规则。
- 业务特定逻辑、隐私细节和未经验证的猜测，只保留在案例记录或 `exam/<case>/tests/`。
- `SKILL.md` 应包含编排和决策规则；详细技术内容放在 `references/`。
- clean-room 运行优先用于 Skill 有效性声明；主线程诊断只能作为辅助证据。

## 历史说明

本机制最初以 `case-learning-iterator` 命名，并由 `docs/iterations/ITERATOR.md` 承载完整操作流程。后续为了更好利用 Skill 触发机制，改为短名 `iterate`，并将执行权威迁移到 `.agents/skills/iterate/SKILL.md`。

