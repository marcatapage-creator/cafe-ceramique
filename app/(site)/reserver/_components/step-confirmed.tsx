import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import Link from 'next/link'
import type { ReservationState } from './reservation-wizard'

export function StepConfirmed({ state }: { state: ReservationState }) {
  const dateLabel = state.date
    ? format(parseISO(state.date), 'EEEE d MMMM yyyy', { locale: fr })
    : ''

  return (
    <div className="px-6 pb-12 space-y-6 text-center">
      <div className="pt-4 text-6xl">🎉</div>

      <div>
        <h2 className="text-2xl font-bold text-[#3D2B1F]">Réservation confirmée !</h2>
        <p className="text-[#6B5344] text-sm mt-1">
          À bientôt, {state.firstName} !
        </p>
      </div>

      <div className="bg-white rounded-2xl divide-y divide-[#F5F0E8] text-left shadow-sm">
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-[#8B8080]">Date</span>
          <span className="font-semibold text-[#3D2B1F] capitalize">{dateLabel}</span>
        </div>
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-[#8B8080]">Heure</span>
          <span className="font-semibold text-[#3D2B1F]">{state.slotLabel} · 2h30</span>
        </div>
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-[#8B8080]">Participants</span>
          <span className="font-semibold text-[#3D2B1F]">
            {state.nbParticipants} {state.nbParticipants > 1 ? 'personnes' : 'personne'}
          </span>
        </div>
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-[#8B8080]">Confirmation</span>
          <span className="font-medium text-[#3D2B1F] text-sm">{state.email}</span>
        </div>
      </div>

      <div className="bg-[#F5F0E8] rounded-xl px-4 py-3 text-xs text-[#6B5344]">
        Un email de confirmation avec le lien d&apos;annulation vous a été envoyé.
        Annulation gratuite jusqu&apos;à 24h avant votre session.
      </div>

      <Link
        href="/"
        className="block w-full border border-[#C17F24] text-[#C17F24] font-medium py-3 rounded-xl text-sm hover:bg-[#C17F24]/5 transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
