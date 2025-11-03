'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/components/Toaster'

const defaultBackend = 'http://127.0.0.1:8000'

export default function LoginPage() {
  const router = useRouter()
  const backend = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL || defaultBackend, [])
  const [apiKey, setApiKey] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking'>('idle')

  useEffect(() => {
    const existing = window.localStorage.getItem('apiKey')
    if (existing) {
      router.replace('/')
    }
  }, [router])

  const handleSkip = () => {
    window.localStorage.setItem('apiKey', '__none__')
    toast.info('Continuing without API key')
    router.replace('/')
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!apiKey.trim()) {
      handleSkip()
      return
    }
    try {
      setStatus('checking')
      const res = await fetch(`${backend}/me`, { headers: { 'x-api-key': apiKey.trim() } })
      if (!res.ok) {
        throw new Error('API key rejected')
      }
      window.localStorage.setItem('apiKey', apiKey.trim())
      toast.success('API key saved')
      router.replace('/')
    } catch (err) {
      toast.error((err as Error).message)
    } finally {
      setStatus('idle')
    }
  }

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow">
      <h1 className="text-xl font-semibold">GH₂ Dashboard Login</h1>
      <p className="mt-2 text-sm text-gray-600">
        Enter the API key provisioned by the backend to explore the dashboard.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">API key</label>
          <input
            type="text"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="Paste your API key"
            className="w-full rounded border px-3 py-2"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={status === 'checking'}
          className="w-full rounded bg-black px-3 py-2 text-white hover:bg-gray-900 disabled:opacity-60"
        >
          {status === 'checking' ? 'Verifying…' : 'Continue'}
        </button>
      </form>
      <button
        type="button"
        onClick={handleSkip}
        className="mt-3 w-full rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
      >
        Continue without API key
      </button>
    </div>
  )
}
