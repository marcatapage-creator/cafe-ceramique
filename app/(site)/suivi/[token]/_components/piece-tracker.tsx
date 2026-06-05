'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

type PieceStatus = 'painted' | 'queued' | 'firing' | 'ready' | 'collected'

interface PieceData {
  token: string
  piece_name: string | null
  status: PieceStatus
  painted_at: string
  queued_at: string | null
  fired_at: string | null
  ready_at: string | null
  collected_at: string | null
  client_first_name: string
}

const STEPS: Array<{
  key: PieceStatus
  label: string
  desc: string
  icon: string
}> = [
  { key: 'painted',   label: 'Déposée',     desc: 'Votre pièce est prête pour la cuisson.', icon: '🎨' },
  { key: 'queued',    label: 'En attente',   desc: 'En file d\'attente pour le prochain four.', icon: '📋' },
  { key: 'firing',    label: 'En cuisson',   desc: 'Votre pièce est dans le four !', icon: '🔥' },
  { key: 'ready',     label: 'Prête !',      desc: 'Votre pièce est cuite. Venez la récupérer.', icon: '✨' },
  { key: 'collected', label: 'Récupérée',    desc: 'Pièce récupérée. Merci de votre visite !', icon: '🏡' },
]

const STATUS_INDEX: Record<PieceStatus, number> = {
  painted: 0, queued: 1, firing: 2, ready: 3, collected: 4,
}

interface Props {
  piece: PieceData
  token: string
}

export function PieceTracker({ piece, token }: Props) {
  const router = useRouter()
  const currentIndex = STATUS_INDEX[piece.status]
  const currentStep = STEPS[currentIndex]
  const isDone = piece.status === 'collected'

  // Rafraîchir toutes les 60s si la pièce n'est pas encore récupérée
  useEffect(() => {
    if (isDone) return
    const id = setInterval(() => router.refresh(), 60_000)
    return () => clearInterval(id)
  }, [isDone, router])

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-sm space-y-8">

        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-sm text-[#8B6914] font-medium uppercase tracking-widest">
            Café Céramique
          </p>
          <h1 className="text-2xl font-bold text-[#3D2B1F]">
            Bonjour {piece.client_first_name} !
          </h1>
          {piece.piece_name && (
            <p className="text-[#6B5344] text-sm">{piece.piece_name}</p>
          )}
        </div>

        {/* Token */}
        <div className="bg-white rounded-2xl px-5 py-4 text-center shadow-sm">
          <p className="text-xs text-[#8B8080] uppercase tracking-widest mb-1">Votre token</p>
          <p className="font-mono font-bold text-lg text-[#C17F24] tracking-wider">{token}</p>
        </div>

        {/* Statut actuel */}
        <div className={`rounded-2xl px-5 py-5 text-center space-y-2 ${
          piece.status === 'ready'
            ? 'bg-green-50 border-2 border-green-300'
            : piece.status === 'firing'
            ? 'bg-orange-50 border-2 border-orange-200'
            : 'bg-white border border-[#E8DDD0]'
        }`}>
          <div className="text-5xl">{currentStep.icon}</div>
          <p className="font-bold text-xl text-[#3D2B1F]">{currentStep.label}</p>
          <p className="text-sm text-[#6B5344]">{currentStep.desc}</p>
          {piece.status === 'ready' && (
            <div className="mt-2 bg-green-100 rounded-xl px-4 py-2 text-sm text-green-800 font-medium">
              Présentez ce token à l&apos;accueil pour récupérer votre pièce.
            </div>
          )}
        </div>

        {/* Stepper */}
        <div className="relative">
          {/* Ligne de progression */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#E8DDD0]" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-[#C17F24] transition-all duration-700"
            style={{ width: currentIndex === 0 ? '0%' : `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />

          <div className="relative flex justify-between">
            {STEPS.map((step, i) => {
              const done = i < currentIndex
              const active = i === currentIndex
              return (
                <div key={step.key} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors z-10 bg-[#F5F0E8] ${
                    done   ? 'border-[#C17F24] bg-[#C17F24] text-white' :
                    active ? 'border-[#C17F24] text-[#C17F24]' :
                             'border-[#E8DDD0] text-[#C8C0B8]'
                  }`}>
                    {done ? '✓' : step.icon}
                  </div>
                  <p className={`text-[10px] text-center leading-tight max-w-[52px] ${
                    active ? 'font-semibold text-[#C17F24]' :
                    done   ? 'text-[#8B6914]' : 'text-[#C8C0B8]'
                  }`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {!isDone && (
          <p className="text-center text-xs text-[#8B8080]">
            Cette page se met à jour automatiquement.
          </p>
        )}
      </div>
    </div>
  )
}
