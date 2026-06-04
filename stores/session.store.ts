import { create } from 'zustand'
import type { Session } from '@/types/database'

// État du tunnel de réservation (site public, 3 étapes)
interface ReservationFlowState {
  selectedSession: Session | null
  nbParticipants: number
  clientInfo: { firstName: string; email: string; phone: string } | null

  setSelectedSession: (session: Session | null) => void
  setNbParticipants: (n: number) => void
  setClientInfo: (info: ReservationFlowState['clientInfo']) => void
  reset: () => void
}

export const useReservationFlow = create<ReservationFlowState>((set) => ({
  selectedSession: null,
  nbParticipants: 1,
  clientInfo: null,

  setSelectedSession: (session) => set({ selectedSession: session }),
  setNbParticipants: (n) => set({ nbParticipants: n }),
  setClientInfo: (info) => set({ clientInfo: info }),
  reset: () => set({ selectedSession: null, nbParticipants: 1, clientInfo: null }),
}))
