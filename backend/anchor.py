from __future__ import annotations

import time
from typing import Tuple
from uuid import uuid4


def anchor_to_chain(content_hash: str) -> Tuple[str, str]:
    """Mock anchoring helper that fabricates a blockchain transaction reference."""

    suffix = uuid4().hex[:12]
    txid = f"tx-{int(time.time())}-{suffix}"
    anchor_id = f"anchor-{suffix}"
    return txid, anchor_id
