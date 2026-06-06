'use client'

import { useState } from 'react'
import { StepParticipants } from './step-participants'
import { StepDate } from './step-date'
import { StepSlots } from './step-slots'
import { StepDetails } from './step-details'
import { StepConfirmed } from './step-confirmed'

export interface ReservationState {
  nbParticipants: number
  date: string | null
  slotStart: string | null
  slotLabel: string | null
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface Props {
  openDays: number[]
  closedDates: string[]
}

const STEPS = [
  { n: 1, label: 'Groupe' },
  { n: 2, label: 'Date' },
  { n: 3, label: 'Créneau' },
  { n: 4, label: 'Vous' },
]

export function ReservationWizard({ openDays, closedDates }: Props) {
  const [step, setStep] = useState(1)
  const [confirmed, setConfirmed] = useState(false)
  const [state, setState] = useState<ReservationState>({
    nbParticipants: 2, date: null, slotStart: null, slotLabel: null,
    firstName: '', lastName: '', email: '', phone: '',
  })

  function patch(partial: Partial<ReservationState>) {
    setState(prev => ({ ...prev, ...partial }))
  }

  if (confirmed) {
    return <StepConfirmed state={state} />
  }

  return (
    <div>
      <div className="px-6 pb-6">
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.n} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s.n ? 'bg-black text-white' :
                  step > s.n   ? 'bg-gray-200 text-gray-600' :
                                 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.n ? '✓' : s.n}
                </div>
                <span className="text-[9px] text-gray-400 whitespace-nowrap">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-1 mb-4 rounded transition-colors ${
                  step > s.n ? 'bg-gray-400' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {step === 1 && (
        <StepParticipants
          value={state.nbParticipants}
          onNext={(n) => { patch({ nbParticipants: n }); setStep(2) }}
        />
      )}
      {step === 2 && (
        <StepDate
          openDays={openDays}
          closedDates={closedDates}
          selected={state.date}
          onNext={(date) => { patch({ date, slotStart: null, slotLabel: null }); setStep(3) }}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <StepSlots
          date={state.date!}
          nbParticipants={state.nbParticipants}
          onNext={(slotStart, slotLabel) => { patch({ slotStart, slotLabel }); setStep(4) }}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <StepDetails
          initialData={{ firstName: state.firstName, lastName: state.lastName, email: state.email, phone: state.phone }}
          state={state}
          onDone={(details) => { patch(details); setConfirmed(true) }}
          onBack={() => setStep(3)}
        />
      )}
    </div>
  )
}
