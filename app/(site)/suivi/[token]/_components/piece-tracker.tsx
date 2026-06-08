'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Palette, Hourglass, FireFlame, Sparks, Home, Check } from 'iconoir-react'

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
  icon: React.ReactNode
}> = [
  { key: 'painted',   label: 'Déposée',     desc: 'Votre pièce est prête pour la cuisson.',         icon: <Palette className="size-4" /> },
  { key: 'queued',    label: 'En attente',   desc: 'En file d\'attente pour le prochain four.',      icon: <Hourglass className="size-4" /> },
  { key: 'firing',    label: 'En cuisson',   desc: 'Votre pièce est dans le four !',                 icon: <FireFlame className="size-4" /> },
  { key: 'ready',     label: 'Prête !',      desc: 'Votre pièce est cuite. Venez la récupérer.',    icon: <Sparks className="size-4" /> },
  { key: 'collected', label: 'Récupérée',    desc: 'Pièce récupérée. Merci de votre visite !',      icon: <Home className="size-4" /> },
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

  useEffect(() => {
    if (isDone) return
    const id = setInterval(() => router.refresh(), 60_000)
    return () => clearInterval(id)
  }, [isDone, router])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-6">
      <div className="w-full max-w-sm space-y-8">

        <div className="text-center space-y-1">
          <p className="text-sm text-gray-500 font-medium uppercase tracking-widest">
            mimo
          </p>
          <h1 className="text-2xl font-bold text-gray-900">
            Bonjour {piece.client_first_name} !
          </h1>
          {piece.piece_name && (
            <p className="text-gray-500 text-sm">{piece.piece_name}</p>
          )}
        </div>

        <div className="bg-gray-50 rounded-2xl px-5 py-4 text-center">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Votre token</p>
          <p className="font-mono font-bold text-lg text-gray-900 tracking-wider">{token}</p>
        </div>

        <div className={`rounded-2xl px-5 py-5 text-center space-y-2 ${
          piece.status === 'ready'
            ? 'bg-gray-50 border-2 border-black'
            : piece.status === 'firing'
            ? 'bg-gray-50 border-2 border-gray-300'
            : 'bg-white border border-gray-200'
        }`}>
          <div className="flex justify-center [&>svg]:size-12">{currentStep.icon}</div>
          <p className="font-bold text-xl text-gray-900">{currentStep.label}</p>
          <p className="text-sm text-gray-500">{currentStep.desc}</p>
          {piece.status === 'ready' && (
            <div className="mt-2 bg-gray-100 rounded-xl px-4 py-2 text-sm text-gray-800 font-medium">
              Présentez ce token à l&apos;accueil pour récupérer votre pièce.
            </div>
          )}
        </div>

        <div className="relative">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-black transition-all duration-700"
            style={{ width: currentIndex === 0 ? '0%' : `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
          />

          <div className="relative flex justify-between">
            {STEPS.map((step, i) => {
              const done = i < currentIndex
              const active = i === currentIndex
              return (
                <div key={step.key} className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors z-10 bg-white ${
                    done   ? 'border-black bg-black text-white' :
                    active ? 'border-black text-black' :
                             'border-gray-200 text-gray-300'
                  }`}>
                    {done ? <Check className="size-3" /> : step.icon}
                  </div>
                  <p className={`text-[10px] text-center leading-tight max-w-13 ${
                    active ? 'font-semibold text-black' :
                    done   ? 'text-gray-500' : 'text-gray-300'
                  }`}>
                    {step.label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {!isDone && (
          <p className="text-center text-xs text-gray-400">
            Cette page se met à jour automatiquement.
          </p>
        )}
      </div>
    </div>
  )
}
