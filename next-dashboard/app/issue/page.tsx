'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Modal from '@/components/Modal'
import { toast } from '@/components/Toaster'
import { Batch, getBatches, issue } from '@/lib/api'

const defaultBackend = 'http://127.0.0.1:8000'

export default function IssuePage() {
  const backend = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL || defaultBackend, [])
  const [batches, setBatches] = useState<Batch[]>([])
  const [confirm, setConfirm] = useState<Batch | null>(null)
  const [busy, setBusy] = useState(false)

  const loadBatches = useCallback(async () => {
    try {
      const data = await getBatches(backend)
      setBatches(data.filter((batch) => batch.status === 'verified'))
    } catch (err) {
      toast.error((err as Error).message || 'Unable to load batches')
    }
  }, [backend])

  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  const handleIssue = async (batch: Batch) => {
    setBusy(true)
    try {
      await issue(backend, batch.batch_id)
      toast.success(`Issued ${batch.h2_mass_kg} kg`)
      setConfirm(null)
      loadBatches()
    } catch (err) {
      toast.error((err as Error).message || 'Issue failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Issue credits</h1>
        <p className="text-sm text-gray-600">
          Select a verified batch to issue GH2 production credits.
        </p>
      </div>
      {batches.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-6 text-sm text-gray-500">
          No verified batches available right now. Run the verification flow first.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {batches.map((batch) => (
            <div key={batch.batch_id} className="space-y-2 rounded-xl bg-white p-4 shadow">
              <div className="font-mono text-sm">{batch.batch_id}</div>
              <div className="text-sm text-gray-600">
                H2: {batch.h2_mass_kg} kg &middot; kWh: {batch.elec_kWh} &middot; Water: {batch.water_L}
              </div>
              <button
                onClick={() => setConfirm(batch)}
                className="rounded bg-black px-3 py-2 text-white hover:bg-gray-900"
              >
                Issue
              </button>
            </div>
          ))}
        </div>
      )}
      {confirm && (
        <Modal
          title="Confirm issue"
          onClose={() => setConfirm(null)}
          actions={
            <>
              <button
                onClick={() => setConfirm(null)}
                className="rounded border px-3 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                disabled={busy}
                onClick={() => handleIssue(confirm)}
                className="rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-60"
              >
                {busy ? 'Issuing…' : 'Confirm'}
              </button>
            </>
          }
        >
          <p>
            Batch <span className="font-mono">{confirm.batch_id}</span> — Issue{' '}
            <strong>{confirm.h2_mass_kg} kg</strong>?
          </p>
        </Modal>
      )}
    </div>
  )
}
