import { createClient } from '@/lib/supabase/server'
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Reservation, Client, ReservationStatus } from '@/types/database'
import { ReservationActions } from './_components/reservation-actions'

const STATUS_META: Record<ReservationStatus, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmée', cls: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Annulée',   cls: 'bg-gray-100 text-gray-400' },
  no_show:   { label: 'No-show',   cls: 'bg-red-100 text-red-500' },
}

type ResaWithClient = Reservation & { client: Pick<Client, 'id' | 'first_name' | 'last_name' | 'email' | 'phone'> | undefined }

function dayLabel(dateStr: string): string {
  const d = parseISO(dateStr)
  if (isToday(d))    return "Aujourd'hui"
  if (isTomorrow(d)) return 'Demain'
  return format(d, 'EEEE d MMMM', { locale: fr })
}

export default async function ReservationsPage() {
  const supabase = await createClient()

  const [{ data: rawResas }, { data: rawClients }] = await Promise.all([
    supabase.from('reservations').select('*').order('starts_at'),
    supabase.from('clients').select('id, first_name, last_name, email, phone'),
  ])

  const clientMap = new Map(
    (rawClients ?? []).map((c: Pick<Client, 'id' | 'first_name' | 'last_name' | 'email' | 'phone'>) => [c.id, c])
  )

  const resas: ResaWithClient[] = (rawResas ?? []).map((r: Reservation) => ({
    ...r,
    client: clientMap.get(r.client_id) as ResaWithClient['client'],
  }))

  // Grouper par date
  const groups = new Map<string, ResaWithClient[]>()
  resas.forEach(r => {
    const day = r.starts_at.slice(0, 10)
    if (!groups.has(day)) groups.set(day, [])
    groups.get(day)!.push(r)
  })

  const todayStr = new Date().toISOString().slice(0, 10)
  const todayResas  = resas.filter(r => r.starts_at.startsWith(todayStr) && r.status !== 'cancelled')
  const upcomingResas = resas.filter(r => r.starts_at > `${todayStr}T23:59` && r.status !== 'cancelled')
  const pastResas   = resas.filter(r => r.starts_at < `${todayStr}T00:00` || r.status === 'cancelled' || r.status === 'no_show')

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Réservations</h1>
        <p className="text-gray-400 text-sm mt-0.5">{resas.filter(r => !isPast(parseISO(r.starts_at)) && r.status !== 'cancelled').length} réservation(s) à venir</p>
      </div>

      {/* Aujourd'hui */}
      <ResaSection title="Aujourd'hui" resas={todayResas} emptyMsg="Aucune réservation aujourd'hui." />

      {/* À venir */}
      <ResaSection title="À venir" resas={upcomingResas} emptyMsg="Aucune réservation à venir." />

      {/* Passées / annulées */}
      {pastResas.length > 0 && (
        <ResaSection title="Passées & annulées" resas={pastResas} muted />
      )}

    </div>
  )
}

function ResaSection({
  title, resas, emptyMsg, muted,
}: {
  title: string
  resas: ResaWithClient[]
  emptyMsg?: string
  muted?: boolean
}) {
  return (
    <section className="space-y-3">
      <h2 className={`text-sm font-semibold uppercase tracking-wide ${muted ? 'text-gray-300' : 'text-gray-500'}`}>
        {title}
      </h2>

      {resas.length === 0 && emptyMsg ? (
        <p className="text-sm text-gray-400 py-2">{emptyMsg}</p>
      ) : (
        <div className="space-y-2">
          {resas.map(r => {
            const s = STATUS_META[r.status as ReservationStatus] ?? STATUS_META.pending
            return (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border p-4 space-y-3 ${muted ? 'border-gray-100 opacity-60' : 'border-gray-200'}`}
              >
                {/* Ligne principale */}
                <div className="flex items-start gap-3">
                  <div className="min-w-[52px] text-center pt-0.5">
                    <p className="text-base font-bold text-gray-900">{format(parseISO(r.starts_at), 'HH:mm')}</p>
                    <p className="text-[10px] text-gray-400 capitalize">{dayLabel(r.starts_at)}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900">
                        {r.client?.first_name} {r.client?.last_name}
                      </p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {r.nb_participants} personne{r.nb_participants > 1 ? 's' : ''}
                      {r.client?.email ? ` · ${r.client.email}` : ''}
                    </p>
                    {r.notes && (
                      <p className="text-xs text-amber-600 mt-1 bg-amber-50 px-2 py-1 rounded-lg inline-block">
                        {r.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {!muted && (
                  <ReservationActions
                    reservationId={r.id}
                    currentStatus={r.status as ReservationStatus}
                  />
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
