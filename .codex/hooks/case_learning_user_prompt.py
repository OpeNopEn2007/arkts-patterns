#!/usr/bin/env python3
"""Inject Case Learning Iterator context for experiment-like prompts."""

from __future__ import annotations

import json
import re
import sys


TRIGGERS = re.compile(
    r"(exam[\\/]|clean[- ]?room|case[- ]?learning|iterator|iteration|"
    r"experiment|arktscheck|warning learning|skill test|"
    r"\u5b9e\u9a8c|\u8fed\u4ee3\u5668|\u6c89\u6dc0|\u8b66\u544a|\u6d4b\u8bd5skill|\u5b50\u667a\u80fd\u4f53)",
    re.IGNORECASE,
)


MESSAGE = (
    "Case Learning Iterator reminder: this prompt looks like an ArkTS/HarmonyOS "
    "experiment or skill-learning case. Use docs/iterations/ITERATOR.md, define "
    "workflow-level acceptance criteria before implementation, prefer a clean-room "
    "runner for skill-effectiveness claims, and record verification plus promotion "
    "decisions under docs/iterations/."
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
