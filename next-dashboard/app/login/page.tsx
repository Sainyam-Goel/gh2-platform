'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Login(){
  const [k, setK] = useState('')
  const r = useRouter()
  useEffect(()=>{
    const existing = localStorage.getItem('apiKey')
    if(existing){ r.push('/') }
  },[])
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Enter API Key</h1>
        <input value={k} onChange={e=>setK(e.target.value)} placeholder="API key" className="w-full rounded border px-3 py-2"/>
        <button onClick={()=>{ localStorage.setItem('apiKey', k); r.push('/') }} className="w-full rounded bg-black text-white px-4 py-2">Save</button>
      </div>
    </main>
  )
}
