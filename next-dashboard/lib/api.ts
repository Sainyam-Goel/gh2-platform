export function apiHeaders(){
  const h:Record<string,string> = {}
  if(typeof window !== 'undefined'){
    const k = localStorage.getItem('apiKey')
    if(k) h['x-api-key'] = k
  }
  return h
}

export async function getBatches(base:string){
  const r = await fetch(base + '/batches', { headers: apiHeaders() })
  return await r.json()
}

export async function getVC(base:string, batchId:string){
  const r = await fetch(base + '/vc/' + batchId, { headers: apiHeaders() })
  return await r.json()
}

export async function getBalance(base:string, siteId:string){
  const r = await fetch(base + '/balances/' + siteId, { headers: apiHeaders() })
  const j = await r.json()
  return j.balance_kg || 0
}

export async function retire(base:string, siteId:string, amount:number){
  const r = await fetch(base + '/retire?site_id=' + siteId + '&amount_kg=' + amount, { method: 'POST', headers: apiHeaders() })
  const j = await r.json()
  return j.ok
}
