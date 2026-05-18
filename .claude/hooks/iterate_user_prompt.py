#!/usr/bin/env python3
"""为实验类 prompt 注入 iterate 工程 Skill 上下文。"""

from __future__ import annotations

import json
import re
import sys


TRIGGERS = re.compile(
    r"(exam[\\/]|clean[- ]?room|case[- ]?learning|iterator|iterate|iteration|"
    r"experiment|arktscheck|warning learning|skill test|case-learning-iterator|"
    r"\u5b9e\u9a8c|\u8fed\u4ee3\u5668|\u6c89\u6dc0|\u8b66\u544a|\u6d4b\u8bd5skill|\u5b50\u667a\u80fd\u4f53)",
    re.IGNORECASE,
)


MESSAGE = (
    "iterate 提醒：这个 prompt 看起来像 ArkTS/HarmonyOS 实验或插件迭代案例。"
    "请使用 /iterate 或 Codex 仓库 Skill `iterate`，并以 .agents/skills/iterate/SKILL.md 为执行权威；"
    "在实现前定义工作流级验收标准，避免向 clean-room runner 泄露历史修复结论；"
    "人类 DevEco Studio E2E 完成前不要标记 Pass。"
)


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    prompt = str(payload.get("prompt", ""))
    if not TRIGGERS.search(prompt):
        return 0

    event_name = str(payload.get("hook_event_name") or "UserPromptSubmit")
    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": event_name,
                    "additionalContext": MESSAGE,
                }
            },
            ensure_ascii=False,
        )
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

