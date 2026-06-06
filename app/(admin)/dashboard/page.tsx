import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { Reservation, Client } from '@/types/database'
import Link from 'next/link'

const STATUS_RESA: Record<string, { label: string; cls: string }> = {
  confirmed: { label: 'Confirmée', cls: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: 'En attente', cls: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Annulée',   cls: 'bg-gray-100 text-gray-500' },
  no_show:   { label: 'No-show',   cls: 'bg-red-100 text-red-600' },
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const today = new Date().toISOString().slice(0, 10)
  const todayStart = `${today}T00:00:00`
  const todayEnd   = `${today}T23:59:59`

  const [
    { data: tables },
    { data: activeSessions },
    { count: paintedCount },
    { count: readyCount },
    { data: todayResas },
    { data: clients },
  ] = await Promise.all([
    supabase.from('physical_tables').select('*').eq('is_active', true).order('id'),
    supabase.from('group_sessions').select('*').eq('status', 'active'),
    supabase.from('ceramic_pieces').select('*', { count: 'exact', head: true }).eq('status', 'painted'),
    supabase.from('ceramic_pieces').select('*', { count: 'exact', head: true }).eq('status', 'ready'),
    supabase.from('reservations').select('*').gte('starts_at', todayStart).lte('starts_at', todayEnd).neq('status', 'cancelled').order('starts_at'),
    supabase.from('clients').select('id, first_name, last_name'),
  ])

  const clientMap = new Map((clients ?? []).map((c: Pick<Client, 'id' | 'first_name' | 'last_name'>) => [c.id, c]))

  // Map tableId → session active
  const tableSessionMap = new Map<number, typeof activeSessions extends Array<infer T> ? T : never>()
  ;(activeSessions ?? []).forEach((s: Record<string, unknown>) => {
    const gst = s.group_session_tables as Array<{ physical_table_id: number }> | undefined
    gst?.forEach(t => tableSessionMap.set(t.physical_table_id, s as never))
  })

  type ResaRow = Reservation & { client: Pick<Client, 'id' | 'first_name' | 'last_name'> | undefined }
  const todayResasWithClient: ResaRow[] = (todayResas ?? []).map((r: Reservation) => ({
    ...r,
    client: clientMap.get(r.client_id) as ResaRow['client'],
  }))

  const dateLabel = format(new Date(), "EEEE d MMMM yyyy", { locale: fr })

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-0.5 capitalize">{dateLabel}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Sessions actives"    value={activeSessions?.length ?? 0} icon="🎨" href="/dashboard" />
        <StatCard label="Pièces peintes"       value={paintedCount ?? 0}           icon="🖌️" href="/dashboard/pieces?status=painted" />
        <StatCard label="Prêtes à récupérer"  value={readyCount ?? 0}             icon="✅" href="/dashboard/pieces?status=ready" accent />
        <StatCard label="Réservations / jour" value={todayResasWithClient.length}  icon="📅" href="/dashboard/reservations" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Plan de salle */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Plan de salle</h2>
            <Link href="/dashboard/tables" className="text-xs text-gray-400 hover:text-gray-700">
              Config →
            </Link>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {(tables ?? []).map((table: { id: number; label: string; seats: number }) => {
              const session = tableSessionMap.get(table.id) as (Record<string, unknown> & { ends_at?: string; nb_participants?: number }) | undefined
              const active = !!session
              return (
                <div
                  key={table.id}
                  className={`rounded-xl p-2.5 text-center border transition-colors ${
                    active
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-gray-50 border-gray-100'
                  }`}
                >
                  <p className={`text-xs font-bold ${active ? 'text-emerald-700' : 'text-gray-400'}`}>
                    {table.label}
                  </p>
                  {active && session?.ends_at ? (
                    <p className="text-[10px] text-emerald-600 mt-0.5">
                      {format(parseISO(session.ends_at as string), 'HH:mm')}
                    </p>
                  ) : (
                    <p className="text-[10px] text-gray-300 mt-0.5">libre</p>
                  )}
                </div>
              )
            })}
          </div>
          <p className="text-xs text-gray-400">
            {tableSessionMap.size} table{tableSessionMap.size > 1 ? 's' : ''} occupée{tableSessionMap.size > 1 ? 's' : ''} · {(tables?.length ?? 0) - tableSessionMap.size} libre{((tables?.length ?? 0) - tableSessionMap.size) > 1 ? 's' : ''}
          </p>
        </section>

        {/* Réservations du jour */}
        <section className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Réservations du jour</h2>
            <Link href="/dashboard/reservations" className="text-xs text-gray-400 hover:text-gray-700">
              Tout voir →
            </Link>
          </div>

          {todayResasWithClient.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">Aucune réservation aujourd&apos;hui.</p>
          ) : (
            <div className="space-y-2">
              {todayResasWithClient.map((r) => {
                const s = STATUS_RESA[r.status] ?? STATUS_RESA.pending
                return (
                  <div key={r.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
                    <div className="w-12 text-center">
                      <p className="text-sm font-bold text-gray-900">{format(parseISO(r.starts_at), 'HH:mm')}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {r.client?.first_name} {r.client?.last_name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {r.nb_participants} pers.{r.notes ? ` · ${r.notes}` : ''}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>
                      {s.label}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>
    </div>
  )
}

function StatCard({
  label, value, icon, href, accent,
}: {
  label: string; value: number; icon: string; href: string; accent?: boolean
}) {
  return (
    <Link href={href} className={`block rounded-2xl border p-4 hover:shadow-sm transition-shadow ${
      accent ? 'bg-black border-black text-white' : 'bg-white border-gray-200'
    }`}>
      <p className="text-2xl">{icon}</p>
      <p className={`text-3xl font-bold mt-2 ${accent ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-xs mt-1 ${accent ? 'text-white/70' : 'text-gray-400'}`}>{label}</p>
    </Link>
  )
}
