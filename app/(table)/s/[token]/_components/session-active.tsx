'use client'

import { useEffect, useState } from 'react'
import { differenceInSeconds } from 'date-fns'
import type { GroupSession } from '@/types/database'

interface Props {
  session: GroupSession
  tables: Array<{ id: number; label: string; seats: number }>
}

export function SessionActive({ session, tables }: Props) {
  const endsAt = new Date(session.ends_at!)
  const tableLabel = tables.map(t => t.label).join(' + ') || 'Table'

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col">
      <SessionTimer endsAt={endsAt} />
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="text-center">
          <p className="text-sm text-[#8B6914] font-medium uppercase tracking-widest mb-1">
            {tableLabel}
          </p>
          <h1 className="text-3xl font-bold text-[#3D2B1F]">Bienvenue ! 🎨</h1>
          <p className="text-[#6B5344] mt-2 text-sm">
            Chaque participant complète son flow individuellement.
          </p>
        </div>
        <a
          href={`/s/${session.qr_token}/flow`}
          className="block w-full max-w-sm bg-[#C17F24] hover:bg-[#A66A1A] text-white font-semibold py-4 rounded-xl text-lg text-center transition-colors"
        >
          Commencer ma session →
        </a>
        <p className="text-xs text-[#8B8080] text-center max-w-xs">
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
    secondsLeft < 30 * 60 ? 'text-orange-500' :
    'text-[#3D2B1F]'

  return (
    <div className="bg-white/80 px-6 py-3 flex flex-col items-center gap-2 sticky top-0 z-10 shadow-sm">
      <p className={`font-mono text-2xl font-bold tabular-nums ${color}`}>
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </p>
      <div className="w-full max-w-xs h-1.5 bg-[#E8DDD0] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            secondsLeft < 10 * 60 ? 'bg-red-500' :
            secondsLeft < 30 * 60 ? 'bg-orange-400' :
            'bg-[#C17F24]'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
