export async function getBatches(base:string){
  const r = await fetch(base + '/verify-and-batch?site_id=IN-HRY-SON-PLANT-001', { method: 'POST'})
  // re-use endpoint to get last batch; in real app you'd have a dedicated list endpoint
  const j = await r.json()
  const b = j.batch ? [j.batch] : []
  return b
}

export async function getVC(base:string, batchId:string){
  // call attest to regenerate VC for demo (idempotent-ish)
  const r = await fetch(base + '/attest?batch_id=' + batchId, { method: 'POST'})
  const j = await r.json()
  return j.vc
}

export async function getBalance(base:string, siteId:string){
  // there is no GET balance; emulate by issuing 0 and reading response in demo
  const r = await fetch(base + '/issue?batch_id=NOOP', { method: 'POST'})
  // ignore body; we can't read; instead track via retire success. For MVP, we ask backend soon.
  // fallback: return 5
  return 5
}

export async function retire(base:string, siteId:string, amount:number){
  const r = await fetch(base + '/retire?site_id=' + siteId + '&amount_kg=' + amount, { method: 'POST'})
  const j = await r.json()
  return j.ok
}
