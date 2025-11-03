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
export async function issue(base:string, batchId:string){
  const r = await fetch(base + '/issue?batch_id=' + batchId, { method:'POST', headers: apiHeaders() })
  return (await r.json()).ok
}
export async function getBalance(base:string, siteId:string){
  const r = await fetch(base + '/balances/' + siteId, { headers: apiHeaders() })
  const j = await r.json()
  return j.balance_kg || 0
}
export async function retire(base:string, siteId:string, amount:number, purpose?:string){
  const r = await fetch(base + '/retire?site_id=' + siteId + '&amount_kg=' + amount + (purpose?('&purpose='+encodeURIComponent(purpose)):'') , { method: 'POST', headers: apiHeaders() })
  const j = await r.json()
  return j.ok
}
export async function exportCSV(base:string, kind:'batches'|'wallet', siteId?:string){
  const url = kind==='batches' ? base + '/export/batches.csv' + (siteId?('?site_id='+siteId):'') : base + '/export/wallet.csv?site_id=' + (siteId||'')
  const r = await fetch(url, { headers: apiHeaders() })
  const blob = await r.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = kind + '.csv'
  document.body.appendChild(a); a.click(); a.remove()
}
