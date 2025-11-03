'use client'

import { useEffect, useState } from 'react'

type Msg = { id: string; type: 'success' | 'error' | 'info'; text: string }

const subscribers = new Set<(msg: Msg) => void>()

function emit(type: Msg['type'], text: string) {
  const payload: Msg = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, type, text }
  subscribers.forEach((fn) => fn(payload))
}

export const toast = {
  success: (text: string) => emit('success', text),
  error: (text: string) => emit('error', text),
  info: (text: string) => emit('info', text),
}

export function Toaster() {
  const [list, setList] = useState<Msg[]>([])

  useEffect(() => {
    const handler = (msg: Msg) => {
      setList((prev) => [...prev, msg])
      setTimeout(() => {
        setList((prev) => prev.filter((entry) => entry.id !== msg.id))
      }, 2500)
    }
    subscribers.add(handler)
    return () => {
      subscribers.delete(handler)
    }
  }, [])

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {list.map((m) => (
        <div
          key={m.id}
          className="rounded bg-slate-900 px-4 py-2 text-sm text-white shadow"
        >
          {m.text}
        </div>
      ))}
    </div>
  )
}
