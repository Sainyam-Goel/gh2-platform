from fastapi import FastAPI, Body, HTTPException, Response
try:
    from fastapi.middleware.cors import CORSMiddleware
except:
    CORSMiddleware = None
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import os, io, csv

from .models import SensorPacket, ProductionBatch
from .issuer import sign_vc, vc_hash
from .anchor import anchor_to_chain 

API_KEY = os.getenv('API_KEY')
API_ROLE_DEFAULT = os.getenv('API_ROLE', 'producer')  # demo-only role

app = FastAPI(title="GH2 Backend")
if CORSMiddleware:
    app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_headers=['*'], allow_methods=['*'])

# in-memory stores for demo
PACKETS: List[dict] = []
BATCHES: Dict[str, ProductionBatch] = {}
VCS: Dict[str, Dict[str, Any]] = {}
ISSUED: Dict[str, float] = {}  # site_id -> kg issued
RETIRED: Dict[str, float] = {} # site_id -> kg retired

# --- helpers ---
def _auth(x_api_key: Optional[str]):
    if API_KEY and x_api_key != API_KEY:
        raise HTTPException(status_code=401, detail="invalid api key")

# --- endpoints ---
@app.get('/me')
def me(x_api_key: Optional[str] = None, x_role: Optional[str] = None):
    _auth(x_api_key)
    return {"role": x_role or API_ROLE_DEFAULT}

@app.post('/ingest')
def ingest(packet: SensorPacket, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    PACKETS.append(packet.model_dump())
    return {"ok": True, "stored": len(PACKETS)}

@app.post('/verify-and-batch')
def verify_and_batch(site_id: str, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    window = PACKETS[-20:] if len(PACKETS) >= 5 else PACKETS[:]
    elec = sum([p['sensors'][0]['v'] for p in window if p['site_id']==site_id]) if window else 0.0
    pv = sum([p['sensors'][1]['v'] for p in window if p['site_id']==site_id]) if window else 0.0
    water = sum([p['sensors'][2]['v'] for p in window if p['site_id']==site_id]) if window else 0.0
    h2 = sum([p['sensors'][3]['v'] for p in window if p['site_id']==site_id]) if window else 0.0
    purity = 99.97

    if h2 <= 0:
        return {"ok": False, "reason": "no hydrogen output detected"}

    batch_id = f"BATCH-{int(datetime.utcnow().timestamp())}"
    start = datetime.utcnow() - timedelta(hours=1)
    end = datetime.utcnow()
    batch = ProductionBatch(
        batch_id=batch_id, site_id=site_id, start=start, end=end,
        h2_mass_kg=round(h2,3), elec_kWh=round(elec,2), water_L=round(water,1),
        purity_pct=purity, renewable_mode="hourly", eac_ids=["REC-DEMO-123"], status="verified")
    BATCHES[batch_id] = batch
    return {"ok": True, "batch": batch.model_dump()}

@app.get('/batches')
def get_batches(x_api_key: Optional[str] = None):
    _auth(x_api_key)
    items = [b.model_dump() for b in BATCHES.values()]
    items.sort(key=lambda x: x['start'], reverse=True)
    return items

@app.post('/attest')
def attest(batch_id: str, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    batch = BATCHES[batch_id]
    vc_dict: Dict[str, Any] = {
        "type": ["VerifiableCredential", "GH2ProductionBatch"],
        "issuer": "did:web:gh2-registry.example",
        "issuanceDate": datetime.utcnow().isoformat() + "Z",
        "credentialSubject": {
            "batch_id": batch.batch_id,
            "site_id": batch.site_id,
            "period": {"start": batch.start.isoformat()+"Z", "end": batch.end.isoformat()+"Z"},
            "h2_mass_kg": batch.h2_mass_kg,
            "elec_kWh": batch.elec_kWh,
            "water_L": batch.water_L,
            "h2_purity_pct": batch.purity_pct,
            "renewable_proof": {"mode": batch.renewable_mode, "eac_ids": batch.eac_ids, "meter_correlation": 0.99},
            "calc": {"gco2e_per_kg_h2": 0.9, "methodology": "CertifHy-aligned v0.1"}
        }
    }
    vc_signed = sign_vc(vc_dict)
    VCS[batch_id] = vc_signed.model_dump()
    return {"ok": True, "vc": vc_signed.model_dump()}

@app.get('/vc/{batch_id}')
def get_vc(batch_id: str, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    v = VCS.get(batch_id)
    if not v:
        raise HTTPException(status_code=404, detail="vc not found")
    return v

@app.post('/anchor')
def anchor(batch_id: str, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    vc = VCS[batch_id]
    h = vc_hash(vc)
    txid, anchor_id = anchor_to_chain(h)
    BATCHES[batch_id].vc_hash = h
    BATCHES[batch_id].status = "anchored"
    return {"ok": True, "vc_hash": h, "txid": txid, "anchor_id": anchor_id}

@app.post('/issue')
def issue(batch_id: str, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    batch = BATCHES[batch_id]
    kg = batch.h2_mass_kg
    ISSUED[batch.site_id] = ISSUED.get(batch.site_id, 0.0) + kg
    return {"ok": True, "issued": kg, "to_site_balance_kg": ISSUED[batch.site_id]}

@app.get('/balances/{site_id}')
def get_balance(site_id: str, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    return {"balance_kg": ISSUED.get(site_id, 0.0), "retired_kg": RETIRED.get(site_id, 0.0)}

@app.post('/retire')
def retire(site_id: str, amount_kg: float, purpose: Optional[str] = None, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    bal = ISSUED.get(site_id, 0.0)
    if amount_kg > bal:
        return {"ok": False, "reason": "insufficient balance"}
    ISSUED[site_id] = bal - amount_kg
    RETIRED[site_id] = RETIRED.get(site_id, 0.0) + amount_kg
    cert = {
        "type": "GH2RetirementCertificate",
        "site_id": site_id,
        "amount_kg": amount_kg,
        "purpose": purpose,
        "retired_at": datetime.utcnow().isoformat()+"Z",
        "evidence": {"vc_hashes": [b.vc_hash for b in BATCHES.values() if b.site_id==site_id and b.vc_hash]}
    }
    return {"ok": True, "certificate": cert}

@app.get('/export/batches.csv')
def export_batches_csv(site_id: Optional[str] = None, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    output = io.StringIO()
    w = csv.writer(output)
    w.writerow(['batch_id','site_id','start','end','h2_mass_kg','elec_kWh','water_L','status','vc_hash'])
    for b in sorted(BATCHES.values(), key=lambda x: x.start):
        if site_id and b.site_id != site_id: continue
        w.writerow([b.batch_id, b.site_id, b.start.isoformat(), b.end.isoformat(), b.h2_mass_kg, b.elec_kWh, b.water_L, b.status, b.vc_hash or ''])
    return Response(content=output.getvalue(), media_type='text/csv')

@app.get('/export/wallet.csv')
def export_wallet_csv(site_id: str, x_api_key: Optional[str] = None):
    _auth(x_api_key)
    output = io.StringIO()
    w = csv.writer(output)
    w.writerow(['site_id','issued_kg','retired_kg','balance_kg'])
    issued = ISSUED.get(site_id, 0.0)
    retired = RETIRED.get(site_id, 0.0)
    balance = issued
    w.writerow([site_id, issued, retired, balance])
    return Response(content=output.getvalue(), media_type='text/csv')
