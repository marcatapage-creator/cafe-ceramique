import { create } from 'zustand'
import type { AvailableSlot } from '@/types/database'

// État du tunnel de réservation (site public, 3 étapes)
interface ReservationFlowState {
  selectedDate: string | null         // ISO date string 'YYYY-MM-DD'
  selectedSlot: AvailableSlot | null
  nbParticipants: number
  clientInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
  } | null

  setSelectedDate: (date: string | null) => void
  setSelectedSlot: (slot: AvailableSlot | null) => void
  setNbParticipants: (n: number) => void
  setClientInfo: (info: ReservationFlowState['clientInfo']) => void
  reset: () => void
}

export const useReservationFlow = create<ReservationFlowState>((set) => ({
  selectedDate: null,
  selectedSlot: null,
  nbParticipants: 1,
  clientInfo: null,

  setSelectedDate: (date) => set({ selectedDate: date, selectedSlot: null }),
  setSelectedSlot: (slot) => set({ selectedSlot: slot }),
  setNbParticipants: (n) => set({ nbParticipants: n }),
  setClientInfo: (info) => set({ clientInfo: info }),
  reset: () => set({ selectedDate: null, selectedSlot: null, nbParticipants: 1, clientInfo: null }),
}))
