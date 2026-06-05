'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval,
         getDay, addMonths, subMonths, isBefore, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

interface Props {
  openDays: number[]       // 0=dim … 6=sam
  closedDates: string[]
  selected: string | null
  onNext: (date: string) => void
  onBack: () => void
}

export function StepDate({ openDays, closedDates, selected, onNext, onBack }: Props) {
  const [month, setMonth] = useState(() => {
    const d = new Date()
    return new Date(d.getFullYear(), d.getMonth(), 1)
  })
  const [picked, setPicked] = useState<string | null>(selected)

  const today = startOfDay(new Date())
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })

  // Ajuster pour que lundi = colonne 0 (getDay retourne 0=dim)
  const firstDow = getDay(days[0])
  const offset = firstDow === 0 ? 6 : firstDow - 1

  function isAvailable(d: Date) {
    if (isBefore(d, today)) return false
    const iso = format(d, 'yyyy-MM-dd')
    if (closedDates.includes(iso)) return false
    // day_of_week Postgres : 0=dim, 1=lun … 6=sam
    const dow = getDay(d)
    return openDays.includes(dow)
  }

  return (
    <div className="px-6 space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold text-[#3D2B1F]">Choisissez une date</h2>
      </div>

      {/* Navigation mois */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(m => subMonths(m, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E8DDD0] text-[#3D2B1F]"
        >
          ‹
        </button>
        <p className="font-semibold text-[#3D2B1F] capitalize">
          {format(month, 'MMMM yyyy', { locale: fr })}
        </p>
        <button
          type="button"
          onClick={() => setMonth(m => addMonths(m, 1))}
          className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#E8DDD0] text-[#3D2B1F]"
        >
          ›
        </button>
      </div>

      {/* Calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {DAY_LABELS.map(l => (
          <div key={l} className="text-center text-xs text-[#8B8080] font-medium py-1">{l}</div>
        ))}

        {Array.from({ length: offset }).map((_, i) => <div key={`e-${i}`} />)}

        {days.map(d => {
          const iso = format(d, 'yyyy-MM-dd')
          const avail = isAvailable(d)
          const isSelected = picked === iso
          const isToday = iso === format(today, 'yyyy-MM-dd')

          return (
            <button
              key={iso}
              type="button"
              disabled={!avail}
              onClick={() => avail && setPicked(iso)}
              className={`aspect-square rounded-full text-sm font-medium transition-all flex items-center justify-center ${
                isSelected
                  ? 'bg-[#C17F24] text-white'
                  : isToday && avail
                  ? 'border-2 border-[#C17F24] text-[#C17F24]'
                  : avail
                  ? 'text-[#3D2B1F] hover:bg-[#E8DDD0]'
                  : 'text-[#D0C8C0] cursor-not-allowed'
              }`}
            >
              {format(d, 'd')}
            </button>
          )
        })}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1">← Retour</Button>
        <Button
          type="button"
          onClick={() => picked && onNext(picked)}
          disabled={!picked}
          className="flex-1 bg-[#C17F24] hover:bg-[#A66A1A]"
        >
          Voir les créneaux →
        </Button>
      </div>
    </div>
  )
}
