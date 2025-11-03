'use client'
import { createContext, useContext, useState } from 'react'

const Ctx = createContext<{push:(t:Msg)=>void}>({push:()=>{}})
type Msg = { type: 'success'|'error'|'info', text: string }

export function Toaster(){
  const [list, setList] = useState<Msg[]>([])
  return (<Ctx.Provider value={{ push:(m)=>{ setList(l=>[...l, m]); setTimeout(()=> setList(l=>l.slice(1)), 2500) } }}>
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {list.map((m,i)=> (<div key={i} className="rounded bg-black text-white px-4 py-2 shadow">{m.text}</div>))}
    </div>
  </Ctx.Provider>)
}

export const toast = {
  success:(t:string)=>{ const {push} = useContext(Ctx) as any; push({type:'success', text:t}) },
  error:(t:string)=>{ const {push} = useContext(Ctx) as any; push({type:'error', text:t}) },
  info:(t:string)=>{ const {push} = useContext(Ctx) as any; push({type:'info', text:t}) },
}
