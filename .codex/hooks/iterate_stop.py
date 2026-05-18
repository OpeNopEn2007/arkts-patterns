#!/usr/bin/env python3
"""输出非阻塞的 iterate 收尾提醒。"""

from __future__ import annotations

import json
import re
import sys


CASE_TERMS = re.compile(
    r"(docs/iterations|exam[\\/]|case[- ]?learning|iterator|iterate|clean[- ]?room|case-learning-iterator|"
    r"\u5b9e\u9a8c|\u8fed\u4ee3\u5668|\u6c89\u6dc0)",
    re.IGNORECASE,
)

DONE_TERMS = re.compile(
    r"(complete|completed|done|fixed|verified|build successful|pass|"
    r"\u5b8c\u6210|\u4fee\u590d|\u9a8c\u8bc1|\u901a\u8fc7)",
    re.IGNORECASE,
)


MESSAGE = (
    "iterate 收尾检查：最终回复前，请确认本次工作没有把工程迭代器机制写入发布 Skill；"
    "如涉及案例实验，请确认记录了验收标准、runner 独立性、reviewer 验证、人类 E2E 状态、"
    "失败分类和经验提升决策。人工 E2E 未完成时不要标记 Pass。"
)


def main() -> int:
    try:
        payload = json.load(sys.stdin)
    except Exception:
        return 0

    text = str(payload.get("last_assistant_message", ""))
    if CASE_TERMS.search(text) and DONE_TERMS.search(text):
        print(json.dumps({"continue": True, "systemMessage": MESSAGE}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

