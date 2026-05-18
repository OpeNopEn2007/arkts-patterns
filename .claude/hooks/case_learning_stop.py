#!/usr/bin/env python3
"""Surface a non-blocking Case Learning Iterator completion reminder."""

from __future__ import annotations

import json
import re
import sys


CASE_TERMS = re.compile(
    r"(docs/iterations|exam[\\/]|case[- ]?learning|iterator|clean[- ]?room|"
    r"\u5b9e\u9a8c|\u8fed\u4ee3\u5668|\u6c89\u6dc0)",
    re.IGNORECASE,
)

DONE_TERMS = re.compile(
    r"(complete|completed|done|fixed|verified|build successful|"
    r"\u5b8c\u6210|\u4fee\u590d|\u9a8c\u8bc1|\u901a\u8fc7)",
    re.IGNORECASE,
)


MESSAGE = (
    "Case Learning Iterator completion check: before finalizing, make sure the "
    "matching docs/iterations record includes acceptance criteria, commands or "
    "manual checks run, reviewer verification, failure classification, and any "
    "accepted or rejected promotion decisions."
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
