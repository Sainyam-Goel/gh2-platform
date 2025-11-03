'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Toaster } from '@/components/Toaster'

const defaultBackend = 'http://127.0.0.1:8000'

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const backend = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL || defaultBackend, [])
  const [role, setRole] = useState('producer')

  useEffect(() => {
    if (pathname === '/login') {
      return
    }
    const apiKey = window.localStorage.getItem('apiKey')
    if (!apiKey) {
      router.replace('/login')
      return
    }
    const headers = apiKey === '__none__' ? undefined : { 'x-api-key': apiKey }
    fetch(`${backend}/me`, headers ? { headers } : undefined)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setRole(data.role || 'producer'))
      .catch(() => setRole('producer'))
  }, [backend, pathname, router])

  const handleLogout = () => {
    window.localStorage.removeItem('apiKey')
    router.replace('/login')
  }

  if (pathname === '/login') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Toaster />
        <main className="flex min-h-screen items-center justify-center p-6">{children}</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <div className="space-x-4">
            <Link href="/" className="font-medium">
              Dashboard
            </Link>
            {role === 'producer' && (
              <Link href="/issue" className="hover:text-sky-600">
                Issue
              </Link>
            )}
            <Link href="/retire" className="hover:text-sky-600">
              Retire
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Role: {role}</span>
            <button onClick={handleLogout} className="text-xs text-sky-600 hover:underline">
              Log out
            </button>
          </div>
        </div>
      </nav>
      <Toaster />
      <main className="mx-auto max-w-6xl p-6">{children}</main>
    </div>
  )
}
