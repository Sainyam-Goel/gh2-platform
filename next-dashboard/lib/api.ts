type HeadersRecord = Record<string, string>

export type Batch = {
  batch_id: string
  site_id: string
  start: string
  end: string
  h2_mass_kg: number
  elec_kWh: number
  water_L: number
  purity_pct: number
  renewable_mode: string
  eac_ids: string[]
  status: string
  vc_hash?: string | null
}

export function apiHeaders(): HeadersRecord {
  const headers: HeadersRecord = {}
  if (typeof window !== 'undefined') {
    const apiKey = window.localStorage.getItem('apiKey')
    if (apiKey && apiKey !== '__none__') headers['x-api-key'] = apiKey
  }
  return headers
}

function mergeHeaders(init?: RequestInit): HeadersRecord {
  const base = apiHeaders()
  if (!init?.headers) {
    return base
  }
  const extra = init.headers as HeadersRecord
  return { ...base, ...extra }
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { ...init, headers: mergeHeaders(init) })
  if (!res.ok) {
    const message = (await res.text()) || res.statusText || 'Request failed'
    throw new Error(message)
  }
  return (await res.json()) as T
}

export async function getBatches(base: string): Promise<Batch[]> {
  return fetchJson<Batch[]>(`${base}/batches`)
}

export async function getVC(base: string, batchId: string): Promise<Record<string, unknown>> {
  return fetchJson<Record<string, unknown>>(`${base}/vc/${batchId}`)
}

export async function issue(base: string, batchId: string): Promise<boolean> {
  const data = await fetchJson<{ ok: boolean }>(`${base}/issue?batch_id=${batchId}`, { method: 'POST' })
  return data.ok
}

export async function getBalance(base: string, siteId: string): Promise<number> {
  const data = await fetchJson<{ balance_kg: number }>(`${base}/balances/${siteId}`)
  return data.balance_kg || 0
}

export async function retire(base: string, siteId: string, amount: number, purpose?: string): Promise<boolean> {
  const search = new URLSearchParams({ site_id: siteId, amount_kg: amount.toString() })
  if (purpose) search.set('purpose', purpose)
  const data = await fetchJson<{ ok: boolean }>(`${base}/retire?${search.toString()}`, { method: 'POST' })
  return data.ok
}

export async function exportCSV(base: string, kind: 'batches' | 'wallet', siteId?: string): Promise<void> {
  const url =
    kind === 'batches'
      ? `${base}/export/batches.csv${siteId ? `?site_id=${encodeURIComponent(siteId)}` : ''}`
      : `${base}/export/wallet.csv?site_id=${encodeURIComponent(siteId || '')}`
  const res = await fetch(url, { headers: apiHeaders() })
  if (!res.ok) {
    const message = (await res.text()) || res.statusText || 'Unable to export data'
    throw new Error(message)
  }
  const blob = await res.blob()
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${kind}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
}
