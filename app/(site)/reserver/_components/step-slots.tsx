'use client'

import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { AvailableSlot } from '@/types/database'

interface Props {
  date: string
  nbParticipants: number
  onNext: (slotStart: string, slotLabel: string) => void
  onBack: () => void
}

export function StepSlots({ date, nbParticipants, onNext, onBack }: Props) {
  const [fetchState, setFetchState] = useState<{
    slots: AvailableSlot[]
    loading: boolean
    forDate: string
  }>({ slots: [], loading: true, forDate: '' })
  const [picked, setPicked] = useState<AvailableSlot | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .rpc('get_available_slots', { p_date: date })
      .then(({ data }) => {
        setFetchState({
          slots: (data as unknown as AvailableSlot[]) ?? [],
          loading: false,
          forDate: date,
        })
      })
  }, [date])

  // Dériver loading et slots depuis fetchState (pas de setState synchrone dans l'effet)
  const loading = fetchState.loading || fetchState.forDate !== date
  const slots = fetchState.forDate === date ? fetchState.slots : []

  // Invalider picked si le slot n'est plus disponible pour ce nombre de participants
  const validPicked = picked && slots.find(
    s => s.slot_start === picked.slot_start && s.available_seats >= nbParticipants
  ) ? picked : null

  const dateLabel = format(parseISO(date), 'EEEE d MMMM', { locale: fr })

  return (
    <div className="px-6 space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold text-[#3D2B1F]">Choisissez un créneau</h2>
        <p className="text-sm text-[#6B5344] mt-1 capitalize">{dateLabel}</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-[#E8DDD0] animate-pulse" />
          ))}
        </div>
      ) : slots.length === 0 ? (
        <div className="text-center py-8 text-[#6B5344]">
          <p className="text-4xl mb-2">😕</p>
          <p className="font-medium">Aucun créneau ce jour.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {slots.map(slot => {
            const available = slot.available_seats >= nbParticipants
            const isSelected = validPicked?.slot_start === slot.slot_start
            return (
              <button
                key={slot.slot_start}
                type="button"
                disabled={!available}
                onClick={() => available && setPicked(slot)}
                className={`rounded-xl py-3 px-2 flex flex-col items-center gap-1 border-2 transition-all ${
                  isSelected
                    ? 'border-[#C17F24] bg-[#C17F24] text-white'
                    : available
                    ? 'border-[#E8DDD0] bg-white text-[#3D2B1F] hover:border-[#C17F24]/50'
                    : 'border-transparent bg-[#F5F0E8] text-[#C8C0B8] cursor-not-allowed'
                }`}
              >
                <span className="font-bold text-base">{slot.slot_time_label}</span>
                <span className={`text-xs ${
                  isSelected ? 'text-white/80' :
                  available   ? 'text-[#C17F24]' : 'text-[#C8C0B8]'
                }`}>
                  {available
                    ? `${slot.available_seats} place${slot.available_seats > 1 ? 's' : ''}`
                    : 'Complet'
                  }
                </span>
              </button>
            )
          })}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">← Retour</Button>
        <Button
          type="button"
          onClick={() => validPicked && onNext(validPicked.slot_start, validPicked.slot_time_label)}
          disabled={!validPicked}
          className="flex-1 bg-[#C17F24] hover:bg-[#A66A1A]"
        >
          Continuer →
        </Button>
      </div>
    </div>
  )
}
