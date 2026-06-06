'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { CatalogPiece } from '@/types/database'

interface Props {
  pieces: CatalogPiece[]
  selected: CatalogPiece | null
  onNext: (piece: CatalogPiece) => void
  onBack: () => void
}

export function StepPiece({ pieces, selected, onNext, onBack }: Props) {
  const [picked, setPicked] = useState<CatalogPiece | null>(selected)

  return (
    <div className="p-6 space-y-6 max-w-sm mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Votre pièce</h2>
        <p className="text-sm text-gray-500 mt-1">Choisissez la pièce que vous allez peindre aujourd&apos;hui.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {pieces.map(piece => (
          <button
            key={piece.id}
            type="button"
            onClick={() => setPicked(piece)}
            className={`rounded-xl border-2 p-3 text-left transition-all ${
              picked?.id === piece.id
                ? 'border-black bg-gray-50'
                : 'border-gray-200 bg-white hover:border-gray-400'
            }`}
          >
            <div className="w-full aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-3xl mb-2">
              🏺
            </div>
            <p className="font-semibold text-sm text-gray-900 leading-tight">{piece.name}</p>
            {piece.description && (
              <p className="text-xs text-gray-400 mt-0.5 leading-tight">{piece.description}</p>
            )}
            <p className="text-gray-900 font-bold text-sm mt-1">{piece.price.toFixed(2)} €</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">← Retour</Button>
        <Button
          type="button"
          onClick={() => picked && onNext(picked)}
          disabled={!picked}
          className="flex-1 bg-black hover:bg-gray-800"
        >
          Continuer →
        </Button>
      </div>
    </div>
  )
}
