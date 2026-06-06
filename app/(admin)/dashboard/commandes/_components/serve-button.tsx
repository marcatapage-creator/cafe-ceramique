'use client'

import { useTransition } from 'react'
import { markOrderServed } from '../actions'

export function ServeButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => { markOrderServed(orderId) })}
      className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-40 transition-colors whitespace-nowrap"
    >
      {pending ? '…' : 'Servi ✓'}
    </button>
  )
}
