'use client'

import { useState } from 'react'
import type { GroupSession, CatalogPiece, MenuItem } from '@/types/database'
import { StepIdentification } from './step-identification'
import { StepPiece } from './step-piece'
import { StepDrinks } from './step-drinks'
import { StepRecap } from './step-recap'
import { StepDone } from './step-done'

export interface FlowData {
  firstName: string
  email: string
  phone: string
  piece: CatalogPiece | null
  orderItems: Array<{ item: MenuItem; qty: number }>
}

interface Props {
  sessionToken: string
  session: GroupSession
  tables: Array<{ id: number; label: string; seats: number }>
  pieces: CatalogPiece[]
  drinks: MenuItem[]
}

export function FlowWizard({ sessionToken, session, tables, pieces, drinks }: Props) {
  const [step, setStep] = useState(1)
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [data, setData] = useState<FlowData>({
    firstName: '', email: '', phone: '',
    piece: null, orderItems: [],
  })

  const tableLabel = tables.map(t => t.label).join(' + ')
  const referenceTableId = Math.min(...tables.map(t => t.id))

  const steps = [
    { n: 1, label: 'Moi' },
    { n: 2, label: 'Pièce' },
    { n: 3, label: 'Commande' },
    { n: 4, label: 'Récap' },
  ]

  if (generatedToken) {
    return <StepDone token={generatedToken} data={data} tableLabel={tableLabel} />
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 sticky top-0 z-10 border-b border-gray-100">
        <span className="text-sm font-medium text-gray-500">{tableLabel}</span>
        <div className="flex-1" />
        <div className="flex gap-1">
          {steps.map(s => (
            <div key={s.n} className="flex flex-col items-center gap-0.5">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s.n ? 'bg-black text-white' :
                step > s.n  ? 'bg-gray-200 text-gray-600' :
                              'bg-gray-100 text-gray-400'
              }`}>
                {step > s.n ? '✓' : s.n}
              </div>
              <span className="text-[9px] text-gray-400">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto">
        {step === 1 && (
          <StepIdentification
            initialData={{ firstName: data.firstName, email: data.email, phone: data.phone }}
            onNext={(d) => { setData(prev => ({ ...prev, ...d })); setStep(2) }}
          />
        )}
        {step === 2 && (
          <StepPiece
            pieces={pieces}
            selected={data.piece}
            onNext={(piece) => { setData(prev => ({ ...prev, piece })); setStep(3) }}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && (
          <StepDrinks
            drinks={drinks}
            selected={data.orderItems}
            onNext={(items) => { setData(prev => ({ ...prev, orderItems: items })); setStep(4) }}
            onBack={() => setStep(2)}
          />
        )}
        {step === 4 && (
          <StepRecap
            data={data}
            session={session}
            referenceTableId={referenceTableId}
            sessionToken={sessionToken}
            onDone={(token) => setGeneratedToken(token)}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  )
}
