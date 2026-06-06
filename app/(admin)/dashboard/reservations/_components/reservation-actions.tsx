'use client'

import { useTransition } from 'react'
import { updateReservationStatus } from '../actions'
import type { ReservationStatus } from '@/types/database'

interface Props {
  reservationId: string
  currentStatus: ReservationStatus
}

export function ReservationActions({ reservationId, currentStatus }: Props) {
  const [pending, startTransition] = useTransition()

  function act(status: 'confirmed' | 'no_show' | 'cancelled') {
    startTransition(() => { updateReservationStatus(reservationId, status) })
  }

  if (currentStatus === 'cancelled' || currentStatus === 'no_show') return null

  return (
    <div className="flex gap-2 flex-wrap">
      {currentStatus === 'pending' && (
        <button
          onClick={() => act('confirmed')}
          disabled={pending}
          className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          Confirmer
        </button>
      )}
      <button
        onClick={() => act('no_show')}
        disabled={pending}
        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors"
      >
        No-show
      </button>
      <button
        onClick={() => act('cancelled')}
        disabled={pending}
        className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
      >
        Annuler
      </button>
    </div>
  )
}
