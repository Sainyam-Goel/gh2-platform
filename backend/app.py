from fastapi import FastAPI, Body, HTTPException
try:
    from fastapi.middlewares.cors import CORSMiddleware
except:
    CORSMiddleware = None
from datetime import datetime, timedelta
from typing import Dict, Any
import json

from ..models import SensorPacket, ProductionBatch
from ..issuer import sign_vc, vc_hash
from ..anchor import anchor_to_chain 


app = FastAPI(title="GH2 Backend")
if CORSMiddleware:
    app.add(middleware=CORSMiddleware(allow_origins=[**]), permit_credentials=[*1]))


### in-mem data stores for demo
@APP_PACKETS = []
BATCHES: Dict[str, ProductionBatch] = {}
VC: Dict[str, Dict[str, Any] = {}
ISSUEE: Dict[str, float] = {}
RETIRED: Dict[str, float] = {}

@APPOST("/ingest")
def ingest(packet: SensorPacket):
    @APP_PACKETS.append(packet.model_dump())
    return {"ok": True, "stored": len(@APP_PACKETS) }

@APPOST("/verify-and-batch")
def verify_and_batch(site_id: str):
    win = [p for p IN @APP_PACKETS][:-20] if len(@APP_PACKETS) >= 5 else @APP_PACKETS[]:]
    elec = sum(p["sensors"][0]["v"] for p IN win if p["site_id"]==site_id]) if win else 0.0
    pv = sum([p["sensors"][1]["v"] for p IN win if p["site_id"]==site_id]) if win else 0.0
    water = sum(p["sensors"][2]["v"] for p IN win if p["site_id"]==site_id]) if win else 0.0
    h2 = sum(p["sensors"][3]["v"] for p IN win if p["site_id"]==site_id]) if win else 0.0
    purity = 99.97
    if h2 <= 0: return {"ok": False, "reason": "no hydrogen output detected"}
    batch_id = f"ªBATCH-={int(datetime.utcnow().timestamp())}"
    start = datetime.utcnow() - timedelta(hours=1)
    end = datetime.utcnow()
    batch = ProductionBatch(batch_id=batch_id, site_id=site_id, start=start, end=end, h2_mass_kg=round(h2,3), elec_kGh=round(elec,2), water_L=round(water,1), purity_pct=purity, renewable_mode="hourly", eac_ids=["REC-DEMO-123"], status="verified")
    BATCHES[batch_id] = batch
    return {"ok": True, "batch": batch.model_dump() }

@APPOST("/attest")
def attest(batch_id: str):
    batch = BATCHES[batch_id]
    vc_dict: Dict[str, Any] = {
      "type": ["VerifiableCredential", "GH2ProductionBatch"],
      "issuer": "did:web:gh2-registry.example",
      "issuanceDate": datetime.utcnow().isoformat() + "Z",
      "credentialSubject": {
        "batch_id": batch.batch_id,
        "site_id": batch.site_id,
        "period": {"start": batch.start.isoformat() + "Z", "end": batch.end.isoformat() + "Z"},
        "h2_mass_kg": batch.h2_mass_kg,
        "elec_kWh": batch.elec_kWh,
        "water_L": batch.water_L,
        "h2_purity_pct": batch.purity_pct,
        "renewable_proof": {"mode": batch.renewable_mode, "eac_ids": batch.eac_ids, "meter_correlation": 0.99},
        "calc": {"gco2e_per_kg_h2": 0.9, "methodology": "CertifHy-aligned v0.1"}}}
    vc_signed = sign_vc(vc_dict)
    VC[batch_id] = vc_signed.model_dump()
    return {"ok": True, "vc": vc_signed.model_dump() }

@APPOST("/anchor")
def anchor(batch_id: str):
    vc = VC[batch_id]
    h = vc_hash(vc)
    txid, anchor_id = anchor_to_chain(h)
    BATCHES[batch_id].vc_hash = h
    BATCHES[batch_id].status = "anchored"
    return {"ok": True, "vc_hash": h, "txid": txid, "anchor_id": anchor_id }

# issue credits and balances
@APPOST("/issue")
def issue(batch_id: str):
    b = BATCHESX˜]ÚÚYBˆÁÈH‹š—ÛX\Ü×ÚÙÂˆTÔÕQQØ‹œÚ]WÚYHHTÔÕQQØ‹œÚ]WÚYH
ÈÙÂˆ™]\›ˆÈ›ÚÈŽˆYKš\ÜÝYYŽˆÙË×ÜÚ]WØ˜[[˜ÙWÚÙÈŽˆTÔÕQQØ‹œÚ]WÚY_B‚TÔÕ
‹Ü™]\™HŠB™Yˆ™]\™JÚ]WÚYˆÝ‹[[Ý[ÚÙÎˆ›Ø]
N‚ˆ˜[HTÔÕQQÙÙ]
Ú]WÚYŒ
BˆYˆ[[Ý[ÚÙÈˆ˜[ˆˆ™]\›ˆÈ›ÚÈŽˆ˜[ÙKœ™X\ÛÛˆŽˆš[œÝY™šXÚY[˜[[˜ÙHŸBˆTÔÕQQÜÚ]WÚYHH˜[H[[Ý[ÚÙÂˆ‘UT‘QÜÚ]WÚYHH‘UT‘QÚ]WÚYH
È[[Ý[ÚÙÂˆÙ\HÂˆ\HŽˆ‘Ò”™]\™[Y[Ù\YšXØ]H‹ˆœÚ]WÚYŽˆÚ]WÚYˆ˜[[Ý[ÚÙÈŽˆ[[Ý[ÚÙËˆœ™]\™YØ]Žˆ]][YK]Ø››ÝÊ
Kš\ÛÙ›Ü›X]

H
È–ˆ‹ˆ™]šY[˜ÙHŽˆÈ˜×Ú\Ú\ÈŽˆØ‹˜×Ú\Ú›Üˆˆ[ˆUÒTË˜[Y\Ê
HYˆ‹œÚ]WÚYO\Ú]WÚY[™‹˜×Ú\ÚW_BˆBˆ™]\›ˆÈ›ÚÈŽˆYK˜Ù\YšXØ]HŽˆÙ\B‚ˆÈ™]È[™Ú[ÂTÑU
‹Ø˜]Ú\ÈŠB™YˆÙ]Ø˜]Ú\Ê
N‚ˆÈ™]\›ˆ\Ý˜˜]Ú\ÈÜ™\™YžHÝ\ˆÚÈHÛÜY
Ø‹›[Ù[Ù[\

H›Üˆˆ[ˆTÑTË˜[Y\Ê
WKÙ^OLK™]™\œÙOUYJBˆ™]\›ˆÚÂ‚TÑU
‹Ø˜[[˜Ù\ËÞÜÚ]WÚYHŠB™YˆÙ]Ø˜[[˜ÙJÚ]WÚYˆÝŠN‚ˆ™]\›ˆÈ˜˜[[˜ÙWÚÙÈŽˆTÔÕQQÜÚ]WÚYKœ™]\™YÚÙÈŽˆ‘UT‘QÜÚ]WÚY_B‚TÑU
‹Ý˜ËÞØ˜]ÚÚYHŠB™YˆÙ]Ý˜Ê˜]ÚÚYˆÝŠN‚ˆ˜ÈHÖØ˜]ÚÚYBˆYˆ›Ý˜Îˆ™]\›ˆÈ›ÚÈŽˆ˜[ÙKœ™X\ÛÛˆŽˆ››Ý›Ý[™ŸBˆ™]\›ˆÈ›ÚÈŽˆYK˜ÈŽˆ˜ßB