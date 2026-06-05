'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { submitFlow } from '../actions'
import type { GroupSession } from '@/types/database'
import type { FlowData } from './flow-wizard'

interface Props {
  data: FlowData
  session: GroupSession
  referenceTableId: number
  sessionToken: string
  onDone: (token: string) => void
  onBack: () => void
}

export function StepRecap({ data, session, referenceTableId, sessionToken, onDone, onBack }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pieceTotal = data.piece?.price ?? 0
  const drinksTotal = data.orderItems.reduce((s, i) => s + i.item.price * i.qty, 0)
  const grandTotal = pieceTotal + drinksTotal

  async function handleConfirm() {
    if (!data.piece) return
    setLoading(true)
    setError(null)

    const result = await submitFlow({
      sessionId: session.id,
      sessionToken,
      referenceTableId,
      startsAt: session.starts_at!,
      client: { firstName: data.firstName, email: data.email, phone: data.phone },
      piece: { id: data.piece.id, name: data.piece.name, price: data.piece.price },
      orderItems: data.orderItems.map(i => ({ name: i.item.name, price: i.item.price, qty: i.qty })),
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    onDone(result.token!)
  }

  return (
    <div className="p-6 space-y-6 max-w-sm mx-auto">
      <div>
        <h2 className="text-xl font-bold text-[#3D2B1F]">Récapitulatif ✅</h2>
        <p className="text-sm text-[#6B5344] mt-1">Tout est correct ?</p>
      </div>

      <div className="bg-white rounded-xl divide-y divide-[#F5F0E8]">
        <div className="px-4 py-3">
          <p className="text-xs text-[#8B8080] uppercase tracking-widest mb-0.5">Participant</p>
          <p className="font-semibold text-[#3D2B1F]">{data.firstName}</p>
          <p className="text-sm text-[#6B5344]">{data.email}</p>
        </div>

        <div className="px-4 py-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-[#8B8080] uppercase tracking-widest mb-0.5">Pièce céramique</p>
            <p className="font-semibold text-[#3D2B1F]">{data.piece?.name}</p>
          </div>
          <p className="font-bold text-[#C17F24]">{pieceTotal.toFixed(2)} €</p>
        </div>

        {data.orderItems.length > 0 && (
          <div className="px-4 py-3">
            <p className="text-xs text-[#8B8080] uppercase tracking-widest mb-2">Commande</p>
            {data.orderItems.map(i => (
              <div key={i.item.id} className="flex justify-between text-sm py-0.5">
                <span className="text-[#3D2B1F]">{i.item.name} × {i.qty}</span>
                <span className="text-[#6B5344]">{(i.item.price * i.qty).toFixed(2)} €</span>
              </div>
            ))}
          </div>
        )}

        <div className="px-4 py-3 flex justify-between items-center">
          <p className="font-semibold text-[#3D2B1F]">Total</p>
          <p className="text-xl font-bold text-[#C17F24]">{grandTotal.toFixed(2)} €</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading} className="flex-1">
          ← Modifier
        </Button>
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 bg-[#C17F24] hover:bg-[#A66A1A]"
        >
          {loading ? 'Envoi…' : 'Valider 🎨'}
        </Button>
      </div>

      <p className="text-xs text-center text-[#8B8080]">
        Le paiement s&apos;effectue en fin de session.
      </p>
    </div>
  )
}
