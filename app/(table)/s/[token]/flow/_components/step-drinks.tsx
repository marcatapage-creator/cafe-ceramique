'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import type { MenuItem } from '@/types/database'

interface OrderItem { item: MenuItem; qty: number }

interface Props {
  drinks: MenuItem[]
  selected: OrderItem[]
  onNext: (items: OrderItem[]) => void
  onBack: () => void
}

export function StepDrinks({ drinks, selected, onNext, onBack }: Props) {
  const [items, setItems] = useState<OrderItem[]>(selected)

  function getQty(id: string) {
    return items.find(i => i.item.id === id)?.qty ?? 0
  }

  function adjust(item: MenuItem, delta: number) {
    setItems(prev => {
      const existing = prev.find(i => i.item.id === item.id)
      if (!existing) return delta > 0 ? [...prev, { item, qty: 1 }] : prev
      const newQty = existing.qty + delta
      if (newQty <= 0) return prev.filter(i => i.item.id !== item.id)
      return prev.map(i => i.item.id === item.id ? { ...i, qty: newQty } : i)
    })
  }

  const total = items.reduce((sum, i) => sum + i.item.price * i.qty, 0)

  const CATEGORY_ORDER = ['café', 'spécials', 'not café', 'froid', 'salée', 'sucrée']
  const CATEGORY_LABELS: Record<string, string> = {
    'café': 'Café',
    'spécials': 'Spécials',
    'not café': 'Not Café',
    'froid': 'Froid',
    'salée': 'Salée',
    'sucrée': 'Sucrée',
  }

  const categories = CATEGORY_ORDER
    .map(cat => ({ cat, list: drinks.filter(d => d.category === cat && d.is_available) }))
    .filter(({ list }) => list.length > 0)

  return (
    <div className="p-6 space-y-6 max-w-sm mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Boissons & snacks</h2>
        <p className="text-sm text-gray-500 mt-1">Ajoutez ce qui vous fait envie — facultatif.</p>
      </div>

      {categories.map(({ cat, list }) => (
        <div key={cat}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
            {CATEGORY_LABELS[cat] ?? cat}
          </p>
          <div className="space-y-2">
            {list.map(item => (
              <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
                  )}
                  {item.price > 0 && (
                    <p className="text-xs text-gray-500">{item.price % 1 === 0 ? item.price : item.price.toFixed(2)} €</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => adjust(item, -1)}
                    disabled={getQty(item.id) === 0}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 disabled:opacity-30 hover:border-black"
                  >
                    −
                  </button>
                  <span className="w-4 text-center text-sm font-medium tabular-nums">
                    {getQty(item.id)}
                  </span>
                  <button
                    type="button"
                    onClick={() => adjust(item, 1)}
                    className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-black"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {total > 0 && (
        <div className="bg-gray-100 rounded-xl px-4 py-2 flex justify-between items-center">
          <span className="text-sm text-gray-600">Sous-total commande</span>
          <span className="font-bold text-gray-900">{total.toFixed(2)} €</span>
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">← Retour</Button>
        <Button
          type="button"
          onClick={() => onNext(items)}
          className="flex-1 bg-black hover:bg-gray-800"
        >
          {items.length > 0 ? 'Continuer →' : 'Passer →'}
        </Button>
      </div>
    </div>
  )
}
