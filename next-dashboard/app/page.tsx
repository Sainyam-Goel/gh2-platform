import { useEffect, useMemo, useState } from 'react'
import { getBatches, getVC, getBalance, retire } from '@/lib/api'
import BatchTable from '@/components/BatchTable'
import Stat from '@/components/Stat'
import MetricChart from '@/components/MetricChart'

export default function Page(){
  const [siteId, setSiteId] = useState('IN-HRY-SON-PLANT-001')
  const [batches, setBatches] = useState<any[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [vc, setVc] = useState<any | null>(null)
  const [balance, setBalance] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

  useEffect(()=>{
    (async()=>{
      const bs = await getBatches(backend)
      setBatches(bs)
      const bal = await getBalance(backend, siteId)
      setBalance(bal)
    })()
  },[siteId])

  useEffect(()=>{
    (async()=>{
      if(!selected) return
      const v = await getVC(backend, selected)
      setVc(v)
    })()
  },[selected])

  const series = useMemo(()=>({
    h2: batches.map((b:any)=>({ t: new Date(b.start), v: b.h2_mass_kg })),
    kwh: batches.map((b:any)=>({ t: new Date(b.start), v: b.elec_kWh })),
    water: batches.map((b:any)=>({ t: new Date(b.start), v: b.water_L })),
  }),[batches])

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">GH₂ Dashboard</h1>
        <input value={siteId} onChange={e=>setSiteId(e.target.value)} className="rounded border px-3 py-2"/>
      </header>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Stat label="Batches" value={batches.length.toString()} />
        <Stat label="Balance (kg)" value={balance.toFixed(2)} />
        <button
          onClick={async()=>{
            setLoading(true)
            try{
              const ok = await retire(backend, siteId, Math.min(balance, 1))
              const bal = await getBalance(backend, siteId)
              setBalance(bal)
              alert('Retired 1 kg (demo)')
            } finally { setLoading(false) }
          }}
          className="rounded bg-black text-white px-4 py-2 disabled:opacity-50" disabled={loading || balance<=0}
        >Retire 1 kg (demo)</button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricChart title="H₂ (kg)" data={series.h2} />
        <MetricChart title="Electricity (kWh)" data={series.kwh} />
        <MetricChart title="Water (L)" data={series.water} />
      </section>

      <BatchTable batches={batches} onSelect={setSelected} />
      {vc && (<pre className="bg-white p-4 rounded shadow overflow-auto">{JSON.stringify(vc,null,2)}</pre>)}
    </main>
  )
}
