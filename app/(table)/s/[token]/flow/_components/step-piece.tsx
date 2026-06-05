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
        <h2 className="text-xl font-bold text-[#3D2B1F]">Votre pièce 🏺</h2>
        <p className="text-sm text-[#6B5344] mt-1">Choisissez la pièce que vous allez peindre aujourd&apos;hui.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {pieces.map(piece => (
          <button
            key={piece.id}
            type="button"
            onClick={() => setPicked(piece)}
            className={`rounded-xl border-2 p-3 text-left transition-all ${
              picked?.id === piece.id
                ? 'border-[#C17F24] bg-[#C17F24]/5'
                : 'border-[#E8DDD0] bg-white hover:border-[#C17F24]/40'
            }`}
          >
            <div className="w-full aspect-square rounded-lg bg-[#F5F0E8] flex items-center justify-center text-3xl mb-2">
              🏺
            </div>
            <p className="font-semibold text-sm text-[#3D2B1F] leading-tight">{piece.name}</p>
            {piece.description && (
              <p className="text-xs text-[#8B8080] mt-0.5 leading-tight">{piece.description}</p>
            )}
            <p className="text-[#C17F24] font-bold text-sm mt-1">{piece.price.toFixed(2)} €</p>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">← Retour</Button>
        <Button
          type="button"
          onClick={() => picked && onNext(picked)}
          disabled={!picked}
          className="flex-1 bg-[#C17F24] hover:bg-[#A66A1A]"
        >
          Continuer →
        </Button>
      </div>
    </div>
  )
}
