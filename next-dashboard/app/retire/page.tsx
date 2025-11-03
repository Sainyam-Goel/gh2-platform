'use client'
import { useEffect, useState } from 'react'
import { getBalance, retire } from '@/lib/api'
import Modal from '@/components/Modal'
import { toast } from '@/components/Toaster'

export default function Retire(){
  const [siteId, setSiteId] = useState('IN-HRY-SON-PLANT-001')
  const [bal, setBal] = useState(0)
  const [amt, setAmt] = useState(1)
  const [purpose, setPurpose] = useState('Demo retirement')
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

  useEffect(()=>{ (async()=>{ setBal(await getBalance(backend, siteId)) })() },[siteId])

  return (<div className="space-y-4">
    <h1 className="text-xl font-semibold">Retire Credits</h1>
    <div className="space-y-2">
      <label className="block text-sm">Site ID</label>
      <input value={siteId} onChange={e=>setSiteId(e.target.value)} className="rounded border px-3 py-2"/>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-xl shadow p-4">Balance: <b>{bal.toFixed(2)}</b> kg</div>
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <label className="block text-sm">Amount (kg)</label>
        <input type="number" min="0" max={bal} value={amt} onChange={e=>setAmt(parseFloat(e.target.value))} className="w-full rounded border px-3 py-2"/>
      </div>
      <div className="bg-white rounded-xl shadow p-4 space-y-2">
        <label className="block text-sm">Purpose (optional)</label>
        <input value={purpose} onChange={e=>setPurpose(e.target.value)} className="w-full rounded border px-3 py-2"/>
      </div>
    </div>
    <button disabled={amt<=0 || amt>bal} onClick={()=>setConfirm(true)} className="rounded bg-black text-white px-4 py-2 disabled:opacity-50">Retire</button>

    {confirm && (<Modal title="Confirm Retirement" onClose={()=>setConfirm(false)} actions={<>
      <button onClick={()=>setConfirm(false)} className="rounded border px-3 py-2">Cancel</button>
      <button disabled={busy} onClick={async()=>{
        setBusy(true)
        try{
          const ok = await retire(backend, siteId, amt, purpose)
          if(ok){ toast.success('Retired ' + amt + ' kg'); setBal(await getBalance(backend, siteId)) }
        } finally { setBusy(false); setConfirm(false) }
      }} className="rounded bg-black text-white px-3 py-2">Confirm</button></>}>
      <p>Retire <b>{amt} kg</b> from <span className="font-mono">{siteId}</span>?</p>
    </Modal>)}
  </div>)
}
