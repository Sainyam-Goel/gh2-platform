'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Toaster, toast } from '@/components/Toaster'

export default function Layout({ children }:{children:React.ReactNode}){
  const r = useRouter()
  const [role, setRole] = useState<string>('')
  useEffect(()=>{
    const k = localStorage.getItem('apiKey')
    if(!k){ r.push('/login'); return }
    fetch((process.env.NEXT_PUBLIC_BACKEND_URL||'http://127.0.0.1:8000') + '/me', { headers: { 'x-api-key': k } })
      .then(r=>r.json()).then(j=> setRole(j.role || 'producer')).catch(()=>setRole('producer'))
  },[])
  return (<html lang="en"><body className="min-h-screen bg-gray-50">
    <nav className="bg-white border-b">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="space-x-4">
          <Link href="/" className="font-medium">Dashboard</Link>
          {role==='producer' && <Link href="/issue">Issue</Link>}
          <Link href="/retire">Retire</Link>
        </div>
        <div className="text-sm text-gray-500">Role: {role}</div>
      </div>
    </nav>
    <Toaster/>
    <div className="p-6 max-w-6xl mx-auto">{children}</div>
  </body></html>)
}
