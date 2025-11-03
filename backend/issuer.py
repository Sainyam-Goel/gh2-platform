from __future__ import annotations

import json
from datetime import datetime, timezone
from hashlib import sha256
from typing import Any, Dict, Mapping, Union

from pydantic import BaseModel, ConfigDict, Field


class VCProof(BaseModel):
    """Lightweight proof object to mimic credential signing."""

    type: str = "DataIntegrityProof"
    created: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    proofPurpose: str = "assertionMethod"
    verificationMethod: str = "did:key:z6MkjGH2DemoSigningKey"
    signatureValue: str


class SignedVC(BaseModel):
    """Container for a signed verifiable credential."""

    model_config = ConfigDict(extra="allow")

    proof: VCProof


def _normalise_payload(payload: Union[BaseModel, Mapping[str, Any], Dict[str, Any]]) -> Dict[str, Any]:
    if isinstance(payload, BaseModel):
        data = payload.model_dump()
    else:
        data = dict(payload)
    return data


def sign_vc(vc_dict: Mapping[str, Any]) -> SignedVC:
    """Attach a deterministic pseudo-signature to the credential payload."""

    normalized = _normalise_payload(vc_dict)
    digest = sha256(json.dumps(normalized, sort_keys=True).encode("utf-8")).hexdigest()
    proof = VCProof(signatureValue=digest)
    return SignedVC(**normalized, proof=proof)


def vc_hash(vc: Union[BaseModel, Mapping[str, Any]]) -> str:
    """Return a stable content hash for anchoring."""

    normalized = _normalise_payload(vc)
    return sha256(json.dumps(normalized, sort_keys=True).encode("utf-8")).hexdigest()
