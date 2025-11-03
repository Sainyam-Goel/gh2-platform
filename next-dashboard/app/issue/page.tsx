'use client'
import { useEffect, useState } from 'react'
import { getBatches, getVC, issue } from '@/lib/api'
import Modal from '@/components/Modal'
import { toast } from '@/components/Toaster'

export default function Issue(){
  const [siteId, setSiteId] = useState('IN-HRY-SON-PLANT-001')
  const [batches, setBatches] = useState<any[]>([])
  const [confirm, setConfirm] = useState<any|null>(null)
  const [busy, setBusy] = useState(false)
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

  useEffect(()=>{ (async()=>{ setBatches(await getBatches(backend)) })() },[])

  return (<div className="space-y-4">
    <h1 className="text-xl font-semibold">Issue Credits</h1>
    <p className="text-sm text-gray-600">Select a verified batch to issue GH₂ credits.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {batches.map((b:any)=> (
        <div key={b.batch_id} className="bg-white rounded-xl shadow p-4 space-y-2">
          <div className="font-mono text-sm">{b.batch_id}</div>
          <div className="text-sm">H₂: {b.h2_mass_kg} kg • kWh: {b.elec_kWh} • Water: {b.water_L}</div>
          <button onClick={()=>setConfirm(b)} className="rounded bg-black text-white px-3 py-2">Issue</button>
        </div>))}
    </div>
    {confirm && (<Modal title="Confirm Issue" onClose={()=>setConfirm(null)} actions={<>
      <button onClick={()=>setConfirm(null)} className="rounded border px-3 py-2">Cancel</button>
      <button disabled={busy} onClick={async()=>{
        setBusy(true)
        try{
          const ok = await issue(backend, confirm.batch_id)
          toast.success('Issued ' + confirm.h2_mass_kg + ' kg')
        } finally { setBusy(false); setConfirm(null) }
      }} className="rounded bg-black text-white px-3 py-2">Confirm</button></>} >
      <p>Batch <span className="font-mono">{confirm.batch_id}</span> — Issue <b>{confirm.h2_mass_kg} kg</b>?</p>
    </Modal>)}
  </div>)
}
