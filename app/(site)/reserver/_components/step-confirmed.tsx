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
        <h2 className="text-2xl font-bold text-gray-900">Réservation confirmée !</h2>
        <p className="text-gray-500 text-sm mt-1">
          À bientôt, {state.firstName} !
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-100 text-left">
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-400">Date</span>
          <span className="font-semibold text-gray-900 capitalize">{dateLabel}</span>
        </div>
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-400">Heure</span>
          <span className="font-semibold text-gray-900">{state.slotLabel} · 2h30</span>
        </div>
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-400">Participants</span>
          <span className="font-semibold text-gray-900">
            {state.nbParticipants} {state.nbParticipants > 1 ? 'personnes' : 'personne'}
          </span>
        </div>
        <div className="px-5 py-4 flex justify-between items-center">
          <span className="text-sm text-gray-400">Confirmation</span>
          <span className="font-medium text-gray-900 text-sm">{state.email}</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500">
        Un email de confirmation avec le lien d&apos;annulation vous a été envoyé.
        Annulation gratuite jusqu&apos;à 24h avant votre session.
      </div>

      <Link
        href="/"
        className="block w-full border border-gray-900 text-gray-900 font-medium py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
