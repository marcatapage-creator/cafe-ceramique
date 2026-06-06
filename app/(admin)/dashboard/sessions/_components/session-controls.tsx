'use client'

import { useState, useTransition } from 'react'
import { openSession, closeSession } from '../actions'
import type { PhysicalTable } from '@/types/database'

export function CloseSessionButton({ sessionId }: { sessionId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => { closeSession(sessionId) })}
      className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 transition-colors"
    >
      {pending ? '…' : 'Clore'}
    </button>
  )
}

export function OpenSessionPanel({ freeTables }: { freeTables: PhysicalTable[] }) {
  const [selected, setSelected] = useState<number[]>([])
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function toggle(id: number) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  function handleOpen() {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const res = await openSession(selected)
      if ('error' in res) { setError(res.error ?? 'Erreur inconnue'); return }
      setSuccess(`Session ouverte · QR: ${res.qrToken}`)
      setSelected([])
    })
  }

  if (freeTables.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
      <h2 className="font-semibold text-gray-900">Ouvrir une nouvelle session</h2>
      <p className="text-xs text-gray-400">Sélectionnez une ou plusieurs tables à fusionner.</p>

      <div className="grid grid-cols-5 gap-2">
        {freeTables.map(t => (
          <button
            key={t.id}
            onClick={() => toggle(t.id)}
            className={`rounded-xl py-2 text-xs font-bold border transition-colors ${
              selected.includes(t.id)
                ? 'bg-black text-white border-black'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error   && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-emerald-600">{success}</p>}

      <button
        disabled={selected.length === 0 || pending}
        onClick={handleOpen}
        className="w-full py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-gray-800 disabled:opacity-30 transition-colors"
      >
        {pending ? 'Ouverture…' : `Ouvrir session (${selected.length} table${selected.length > 1 ? 's' : ''})`}
      </button>
    </div>
  )
}
