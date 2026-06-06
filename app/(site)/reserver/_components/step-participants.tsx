'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

const MAX = 29
const MIN = 1

interface Props {
  value: number
  onNext: (n: number) => void
}

export function StepParticipants({ value, onNext }: Props) {
  const [n, setN] = useState(value)

  const presets = [1, 2, 3, 4, 6, 8]

  return (
    <div className="px-6 space-y-8 pb-8">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Vous êtes combien ?</h2>
        <p className="text-sm text-gray-500 mt-1">Maximum 29 personnes.</p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() => setN(prev => Math.max(MIN, prev - 1))}
          disabled={n <= MIN}
          className="w-14 h-14 rounded-full border-2 border-gray-200 text-2xl font-light text-gray-900 hover:border-black disabled:opacity-30 transition-colors"
        >
          −
        </button>
        <div className="text-center">
          <p className="text-7xl font-bold text-gray-900 tabular-nums leading-none">{n}</p>
          <p className="text-sm text-gray-400 mt-1">{n === 1 ? 'personne' : 'personnes'}</p>
        </div>
        <button
          type="button"
          onClick={() => setN(prev => Math.min(MAX, prev + 1))}
          disabled={n >= MAX}
          className="w-14 h-14 rounded-full border-2 border-gray-200 text-2xl font-light text-gray-900 hover:border-black disabled:opacity-30 transition-colors"
        >
          +
        </button>
      </div>

      <div>
        <p className="text-xs text-gray-400 text-center mb-3">Sélection rapide</p>
        <div className="flex justify-center gap-2 flex-wrap">
          {presets.map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setN(p)}
              className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                n === p
                  ? 'bg-black text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-black'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {n > 8 && (
        <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-600">
          Pour les groupes de plus de 8, nous pourrons fusionner plusieurs tables.
          Contactez-nous si vous avez des questions.
        </div>
      )}

      <Button
        onClick={() => onNext(n)}
        className="w-full bg-black hover:bg-gray-800 py-4 text-base"
      >
        Choisir une date →
      </Button>
    </div>
  )
}
