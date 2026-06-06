'use client'

import { useTransition } from 'react'
import { advancePieceStatus } from '../actions'
import type { PieceStatus } from '@/types/database'

const NEXT_LABEL: Record<PieceStatus, string | null> = {
  painted:   '→ File de cuisson',
  queued:    '→ En cuisson',
  firing:    '→ Prête',
  ready:     '→ Récupérée',
  collected: null,
}

export function PieceAdvanceButton({ pieceId, status }: { pieceId: string; status: PieceStatus }) {
  const [pending, startTransition] = useTransition()
  const label = NEXT_LABEL[status]
  if (!label) return null

  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => { advancePieceStatus(pieceId, status) })}
      className="text-xs px-3 py-1.5 rounded-lg bg-black text-white hover:bg-gray-800 disabled:opacity-40 transition-colors whitespace-nowrap"
    >
      {pending ? '…' : label}
    </button>
  )
}
