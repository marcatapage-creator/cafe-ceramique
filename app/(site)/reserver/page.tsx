import { createClient } from '@/lib/supabase/server'
import { ReservationWizard } from './_components/reservation-wizard'
import type { OpeningHours } from '@/types/database'

export const metadata = {
  title: 'Réserver — mimo',
  description: 'Réservez votre session de peinture sur céramique en quelques secondes.',
}

export default async function ReserverPage() {
  const supabase = await createClient()

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const maxDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const [{ data: openingHours }, { data: closedDates }] = await Promise.all([
    supabase.from('opening_hours').select('*').eq('is_active', true),
    supabase.from('closed_dates').select('date').gte('date', today).lte('date', maxDate),
  ])

  const openDays = (openingHours ?? []).map((oh: OpeningHours) => oh.day_of_week)
  const closedDatesList = (closedDates ?? []).map((cd: { date: string }) => cd.date)

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-lg mx-auto">
        <div className="px-6 pt-8 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Réserver une session</h1>
          <p className="text-gray-500 text-sm mt-1">2h30 de peinture sur céramique · jusqu&apos;à 29 personnes</p>
        </div>
        <ReservationWizard openDays={openDays} closedDates={closedDatesList} />
      </div>
    </div>
  )
}
