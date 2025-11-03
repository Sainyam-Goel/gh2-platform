'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Batch, exportCSV, getBatches, getBalance } from '@/lib/api'
import { toast } from '@/components/Toaster'

const defaultSiteId = 'IN-HRY-SON-PLANT-001'
const defaultBackend = 'http://127.0.0.1:8000'

export default function Dashboard() {
  const backend = useMemo(() => process.env.NEXT_PUBLIC_BACKEND_URL || defaultBackend, [])
  const [siteId, setSiteId] = useState(defaultSiteId)
  const [batches, setBatches] = useState<Batch[]>([])
  const [balanceKg, setBalanceKg] = useState(0)
  const [loading, setLoading] = useState(true)

  const refreshBatches = useCallback(async () => {
    try {
      const data = await getBatches(backend)
      setBatches(data)
    } catch (err) {
      toast.error((err as Error).message || 'Unable to load batches')
    } finally {
      setLoading(false)
    }
  }, [backend])

  const refreshBalance = useCallback(async () => {
    try {
      const amount = await getBalance(backend, siteId)
      setBalanceKg(amount)
    } catch (err) {
      toast.error((err as Error).message || 'Unable to load balance')
    }
  }, [backend, siteId])

  useEffect(() => {
    refreshBatches()
  }, [refreshBatches])

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  const latest = batches[0]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">GH₂ Production Overview</h1>
        <button
          onClick={refreshBatches}
          className="rounded border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100"
        >
          Refresh
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl bg-white p-5 shadow">
          <div className="text-xs uppercase text-gray-500">Total batches</div>
          <div className="mt-2 text-2xl font-semibold">{batches.length}</div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow">
          <div className="text-xs uppercase text-gray-500">Selected site</div>
          <div className="mt-2 text-sm font-mono">{siteId}</div>
          <div className="mt-3 text-xs text-gray-500">Balance</div>
          <div className="text-xl font-semibold">{balanceKg.toFixed(2)} kg</div>
        </div>
        <div className="rounded-xl bg-white p-5 shadow space-y-2">
          <label className="text-xs uppercase text-gray-500">Change site</label>
          <input
            value={siteId}
            onChange={(event) => setSiteId(event.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Site identifier"
          />
          <button
            onClick={refreshBalance}
            className="w-full rounded bg-black px-3 py-2 text-sm text-white hover:bg-gray-900"
          >
            Update balance
          </button>
        </div>
      </section>

      <section className="rounded-xl bg-white p-5 shadow">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Recent batches</h2>
          <div className="space-x-2 text-sm">
            <button
              onClick={() => {
                exportCSV(backend, 'batches', siteId).catch((err) =>
                  toast.error((err as Error).message || 'Failed to export batches'),
                )
              }}
              className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100"
            >
              Export CSV
            </button>
            <button
              onClick={() => {
                exportCSV(backend, 'wallet', siteId).catch((err) =>
                  toast.error((err as Error).message || 'Failed to export wallet'),
                )
              }}
              className="rounded border border-gray-300 px-3 py-2 hover:bg-gray-100"
            >
              Wallet CSV
            </button>
          </div>
        </div>
        {loading ? (
          <p className="mt-4 text-sm text-gray-500">Loading batches…</p>
        ) : batches.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">
            No batches verified yet. Use the ingestion flow to create one.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {batches.slice(0, 5).map((batch) => (
              <div key={batch.batch_id} className="rounded border border-gray-100 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-mono">{batch.batch_id}</span>
                  <span className="text-gray-500">{batch.status}</span>
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  {batch.h2_mass_kg} kg &middot; {batch.elec_kWh} kWh &middot; {batch.water_L} L
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {latest && (
        <section className="rounded-xl bg-white p-5 shadow">
          <h2 className="text-lg font-medium">Latest batch detail</h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase text-gray-500">Batch ID</dt>
              <dd className="font-mono text-sm">{latest.batch_id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-500">Site</dt>
              <dd className="text-sm">{latest.site_id}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-500">Status</dt>
              <dd className="text-sm capitalize">{latest.status}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-500">Purity</dt>
              <dd className="text-sm">{latest.purity_pct}%</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-500">Window start</dt>
              <dd className="text-sm">{new Date(latest.start).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-gray-500">Window end</dt>
              <dd className="text-sm">{new Date(latest.end).toLocaleString()}</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  )
}
