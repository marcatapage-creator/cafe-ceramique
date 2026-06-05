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
  // Sauvegarder le token en localStorage pour le rescan
  useEffect(() => {
    const tableMatch = token.match(/T(\d+)/)
    if (tableMatch) {
      localStorage.setItem(`ceramic_token_t${parseInt(tableMatch[1])}`, token)
    }
    // Sauvegarde globale par email pour retrouver facilement
    localStorage.setItem(`ceramic_token_${data.email}`, token)
  }, [token, data.email])

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="text-6xl">🎨</div>

        <div>
          <h1 className="text-2xl font-bold text-[#3D2B1F]">
            C&apos;est parti, {data.firstName} !
          </h1>
          <p className="text-[#6B5344] mt-2 text-sm">
            Votre session est lancée. Voici votre token de suivi céramique.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 space-y-2 shadow-sm">
          <p className="text-xs text-[#8B8080] uppercase tracking-widest">Votre token</p>
          <p className="text-2xl font-mono font-bold text-[#C17F24] tracking-wider">{token}</p>
          <p className="text-xs text-[#8B8080]">
            Vous recevrez un email à <strong>{data.email}</strong> avec ce token et les détails de votre commande.
          </p>
        </div>

        <div className="bg-white/60 rounded-xl p-4 text-sm text-[#6B5344] text-left space-y-2">
          <div className="flex justify-between">
            <span>Pièce :</span>
            <span className="font-medium text-[#3D2B1F]">{data.piece?.name}</span>
          </div>
          {data.orderItems.length > 0 && (
            <div className="flex justify-between">
              <span>Commande :</span>
              <span className="font-medium text-[#3D2B1F]">
                {data.orderItems.map(i => `${i.item.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', ')}
              </span>
            </div>
          )}
        </div>

        <Link
          href={`/suivi/${token}`}
          className="block w-full border border-[#C17F24] text-[#C17F24] font-medium py-3 rounded-xl text-sm hover:bg-[#C17F24]/5 transition-colors"
        >
          Suivre ma pièce →
        </Link>

        <p className="text-xs text-[#8B8080]">
          Bonne session à {tableLabel} ! 🏺
        </p>
      </div>
    </div>
  )
}
