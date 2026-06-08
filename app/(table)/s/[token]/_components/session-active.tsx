'use client'

import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import type { GroupSession } from '@/types/database'

interface Props {
  session: GroupSession
  tables: Array<{ id: number; label: string; seats: number }>
}

export function SessionActive({ session, tables }: Props) {
  const endsAt = session.ends_at ? new Date(session.ends_at) : null
  const tableLabel = tables.map(t => t.label).join(' + ') || 'Table'

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {endsAt !== null && <SessionTimer endsAt={endsAt} />}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest mb-1">
            {tableLabel}
          </p>
          <h1 className="text-3xl font-bold text-gray-900">Bienvenue !</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Chaque participant complète son flow individuellement.
          </p>
        </div>
        <a
          href={`/s/${session.qr_token}/flow`}
          className="block w-full max-w-sm bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-xl text-lg text-center transition-colors"
        >
          Commencer ma session →
        </a>
        <p className="text-xs text-gray-400 text-center max-w-xs">
          Choisissez votre pièce et passez votre commande en moins de 2 minutes.
        </p>
      </div>
    </div>
  )
}

function SessionTimer({ endsAt }: { endsAt: Date }) {
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, differenceInSeconds(endsAt, new Date()))
  )

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft(Math.max(0, differenceInSeconds(endsAt, new Date())))
    }, 1000)
    return () => clearInterval(id)
  }, [endsAt])

  const hours = Math.floor(secondsLeft / 3600)
  const minutes = Math.floor((secondsLeft % 3600) / 60)
  const seconds = secondsLeft % 60
  const progress = Math.max(0, Math.min(100, (secondsLeft / (150 * 60)) * 100))

  const color =
    secondsLeft < 10 * 60 ? 'text-red-600' :
    secondsLeft < 30 * 60 ? 'text-gray-700' :
    'text-gray-900'

  return (
    <div className="bg-white px-6 py-3 flex flex-col items-center gap-2 sticky top-0 z-10 border-b border-gray-100">
      <p className={`font-mono text-2xl font-bold tabular-nums ${color}`}>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
      <div className="w-full max-w-xs h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            secondsLeft < 10 * 60 ? 'bg-black' :
            secondsLeft < 30 * 60 ? 'bg-gray-500' :
            'bg-black'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
