'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import type { FlowData } from './flow-wizard'

interface Props {
  token: string
  data: FlowData
  tableLabel: string
}

export function StepDone({ token, data, tableLabel }: Props) {
  useEffect(() => {
    const tableMatch = token.match(/T(\d+)/)
    if (tableMatch) {
      localStorage.setItem(`ceramic_token_t${parseInt(tableMatch[1])}`, token)
    }
    localStorage.setItem(`ceramic_token_${data.email}`, token)
  }, [token, data.email])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="text-6xl">🎨</div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            C&apos;est parti, {data.firstName} !
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Votre session est lancée. Voici votre token de suivi céramique.
          </p>
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-widest">Votre token</p>
          <p className="text-2xl font-mono font-bold text-gray-900 tracking-wider">{token}</p>
          <p className="text-xs text-gray-400">
            Vous recevrez un email à <strong>{data.email}</strong> avec ce token et les détails de votre commande.
          </p>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 text-left space-y-2">
          <div className="flex justify-between">
            <span>Pièce :</span>
            <span className="font-medium text-gray-900">{data.piece?.name}</span>
          </div>
          {data.orderItems.length > 0 && (
            <div className="flex justify-between">
              <span>Commande :</span>
              <span className="font-medium text-gray-900">
                {data.orderItems.map(i => `${i.item.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', ')}
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/suivi/${token}`}
          className="block w-full border border-gray-900 text-gray-900 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
        >
          Suivre ma pièce →
        </Link>

        <p className="text-xs text-gray-400">
          Bonne session à {tableLabel} !
        </p>
      </div>
    </div>
  )
}
