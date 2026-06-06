import { createClient } from '@/lib/supabase/server'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import type { PhysicalTable } from '@/types/database'
import { CloseSessionButton, OpenSessionPanel } from './_components/session-controls'
import Link from 'next/link'


export default async function SessionsPage() {
  const supabase = await createClient()

  const [{ data: allTables }, { data: activeSessions }, { data: pieces }] = await Promise.all([
    supabase.from('physical_tables').select('*').eq('is_active', true).order('id'),
    supabase.from('group_sessions').select('*').eq('status', 'active').order('starts_at'),
    supabase.from('ceramic_pieces').select('id, group_session_id, status'),
  ])

  type Session = {
    id: string; qr_token: string; starts_at: string; ends_at: string | null
    nb_participants: number; notes: string | null
    group_session_tables: Array<{ physical_table_id: number }>
  }

  const sessions = (activeSessions ?? []) as Session[]
  const tables   = (allTables ?? []) as PhysicalTable[]

  const occupiedIds = new Set<number>()
  sessions.forEach(s => s.group_session_tables?.forEach(t => occupiedIds.add(t.physical_table_id)))
  const freeTables = tables.filter(t => !occupiedIds.has(t.id))

  const piecesBySession = new Map<string, number>()
  ;(pieces ?? []).forEach((p: { group_session_id: string; status: string }) => {
    if (p.status === 'painted') {
      piecesBySession.set(p.group_session_id, (piecesBySession.get(p.group_session_id) ?? 0) + 1)
    }
  })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sessions</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {sessions.length} active{sessions.length > 1 ? 's' : ''} · {freeTables.length} table{freeTables.length > 1 ? 's' : ''} libre{freeTables.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Sessions actives */}
      {sessions.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Sessions actives</h2>
          <div className="space-y-3">
            {sessions.map(s => {
              const tableLabels = s.group_session_tables
                ?.map(t => tables.find(tb => tb.id === t.physical_table_id)?.label ?? `T${t.physical_table_id}`)
                .join(' + ') ?? '—'
              const elapsed = differenceInMinutes(new Date(), parseISO(s.starts_at))
              const piecesCount = piecesBySession.get(s.id) ?? 0
              return (
                <div key={s.id} className="bg-white rounded-2xl border border-gray-200 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
                        <p className="font-semibold text-gray-900">{tableLabels}</p>
                        <span className="text-xs text-gray-400">{elapsed}min</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Débutée à {format(parseISO(s.starts_at), 'HH:mm')}
                        {s.ends_at ? ` · fin prévue ${format(parseISO(s.ends_at), 'HH:mm')}` : ''}
                        {piecesCount > 0 ? ` · ${piecesCount} pièce${piecesCount > 1 ? 's' : ''} peinte${piecesCount > 1 ? 's' : ''}` : ''}
                      </p>
                      <p className="text-xs font-mono text-gray-300">
                        <Link href={`/s/${s.qr_token}`} className="hover:text-gray-600 underline" target="_blank">
                          /s/{s.qr_token.slice(0, 16)}…
                        </Link>
                      </p>
                    </div>
                    <CloseSessionButton sessionId={s.id} />
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {sessions.length === 0 && (
        <p className="text-sm text-gray-400 py-4">Aucune session active en ce moment.</p>
      )}

      {/* Ouvrir une session */}
      <OpenSessionPanel freeTables={freeTables} />
    </div>
  )
}
