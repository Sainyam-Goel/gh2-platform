'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Modal from '@/components/Modal'
import { toast } from '@/components/Toaster'
import { getBalance, retire } from '@/lib/api'

const defaultBackend = 'http://127.0.0.1:8000'

export default function RetirePage() {
  const backend = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL || defaultBackend, [])
  const [siteId, setSiteId] = useState('IN-HRY-SON-PLANT-001')
  const [balance, setBalance] = useState(0)
  const [amountKg, setAmountKg] = useState(1)
  const [purpose, setPurpose] = useState('Demo retirement')
  const [confirm, setConfirm] = useState(false)
  const [busy, setBusy] = useState(false)

  const loadBalance = useCallback(async () => {
    try {
      const value = await getBalance(backend, siteId)
      setBalance(value)
      if (value === 0) {
        setAmountKg(0)
      }
    } catch (err) {
      toast.error((err as Error).message || 'Unable to load balance')
    }
  }, [backend, siteId])

  useEffect(() => {
    loadBalance()
  }, [loadBalance])

  const onConfirm = async () => {
    setBusy(true)
    try {
      const ok = await retire(backend, siteId, amountKg, purpose)
      if (ok) {
        toast.success(`Retired ${amountKg} kg`)
        await loadBalance()
      }
    } catch (err) {
      toast.error((err as Error).message || 'Retirement failed')
    } finally {
      setBusy(false)
      setConfirm(false)
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Retire credits</h1>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Site ID</label>
        <input
          value={siteId}
          onChange={(event) => setSiteId(event.target.value)}
          className="w-full rounded border px-3 py-2"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow">
          Balance: <strong>{balance.toFixed(2)}</strong> kg
        </div>
        <div className="space-y-2 rounded-xl bg-white p-4 shadow">
          <label className="block text-sm font-medium text-gray-700">Amount (kg)</label>
          <input
            type="number"
            min={0}
            max={balance}
            value={amountKg}
            onChange={(event) => {
              const next = parseFloat(event.target.value)
              setAmountKg(Number.isFinite(next) ? next : 0)
            }}
            className="w-full rounded border px-3 py-2"
          />
        </div>
        <div className="space-y-2 rounded-xl bg-white p-4 shadow">
          <label className="block text-sm font-medium text-gray-700">Purpose (optional)</label>
          <input
            value={purpose}
            onChange={(event) => setPurpose(event.target.value)}
            className="w-full rounded border px-3 py-2"
          />
        </div>
      </div>
      <button
        disabled={amountKg <= 0 || amountKg > balance}
        onClick={() => setConfirm(true)}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        Retire
      </button>

      {confirm && (
        <Modal
          title="Confirm retirement"
          onClose={() => setConfirm(false)}
          actions={
            <>
              <button onClick={() => setConfirm(false)} className="rounded border px-3 py-2 text-sm">
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={onConfirm}
                className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                {busy ? 'Retiring…' : 'Confirm'}
              </button>
            </>
          }
        >
          <p>
            Retire <strong>{amountKg} kg</strong> from <span className="font-mono">{siteId}</span>?
          </p>
        </Modal>
      )}
    </div>
  )
}
