import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { CeramicPiece, Client, PieceStatus } from '@/types/database'
import { PieceAdvanceButton } from './_components/piece-advance-button'

const STATUS_META: Record<PieceStatus, { label: string; icon: string; cls: string }> = {
  painted:   { label: 'Peinte',         icon: '🖌️', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  queued:    { label: 'File de cuisson', icon: '⏳', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  firing:    { label: 'En cuisson',      icon: '🔥', cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  ready:     { label: 'Prête',           icon: '✅', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  collected: { label: 'Récupérée',       icon: '🎁', cls: 'bg-gray-50 text-gray-400 border-gray-100' },
}

const STATUS_ORDER: PieceStatus[] = ['painted', 'queued', 'firing', 'ready', 'collected']

type PieceWithClient = CeramicPiece & {
  client: Pick<Client, 'id' | 'first_name' | 'last_name'> | undefined
}

export default async function PiecesPage() {
  const supabase = await createClient()

  const [{ data: rawPieces }, { data: rawClients }] = await Promise.all([
    supabase.from('ceramic_pieces').select('*').order('created_at'),
    supabase.from('clients').select('id, first_name, last_name'),
  ])

  const clientMap = new Map(
    (rawClients ?? []).map((c: Pick<Client, 'id' | 'first_name' | 'last_name'>) => [c.id, c])
  )

  const pieces: PieceWithClient[] = (rawPieces ?? []).map((p: CeramicPiece) => ({
    ...p,
    client: clientMap.get(p.client_id) as PieceWithClient['client'],
  }))

  const byStatus = Object.fromEntries(
    STATUS_ORDER.map(s => [s, pieces.filter(p => p.status === s)])
  ) as Record<PieceStatus, PieceWithClient[]>

  const activeStatuses = STATUS_ORDER.filter(s => s !== 'collected' || byStatus.collected.length > 0)

  return (
    <div className="max-w-4xl mx-auto space-y-8">

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pièces céramiques</h1>
        <p className="text-gray-400 text-sm mt-0.5">{pieces.filter(p => p.status !== 'collected').length} pièce(s) en cours</p>
      </div>

      {/* Résumé rapide */}
      <div className="flex gap-3 flex-wrap">
        {STATUS_ORDER.map(s => {
          const m = STATUS_META[s]
          const count = byStatus[s].length
          return (
            <a key={s} href={`#${s}`} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-opacity ${m.cls} ${count === 0 ? 'opacity-40' : ''}`}>
              <span>{m.icon}</span>
              <span>{m.label}</span>
              <span className="font-bold">{count}</span>
            </a>
          )
        })}
      </div>

      {/* Sections par statut */}
      {activeStatuses.map(status => {
        const m = STATUS_META[status]
        const list = byStatus[status]
        return (
          <section key={status} id={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <span>{m.icon}</span>
              <h2 className="font-semibold text-gray-900">{m.label}</h2>
              <span className="text-sm text-gray-400">({list.length})</span>
            </div>

            {list.length === 0 ? (
              <p className="text-sm text-gray-300 py-1">Aucune pièce.</p>
            ) : (
              <div className="space-y-2">
                {list.map(piece => (
                  <PieceRow key={piece.id} piece={piece} status={status} />
                ))}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}

function PieceRow({ piece, status }: { piece: PieceWithClient; status: PieceStatus }) {
  const timestampField = {
    painted:   piece.painted_at,
    queued:    piece.queued_at,
    firing:    piece.fired_at,
    ready:     piece.ready_at,
    collected: piece.collected_at,
  }[status]

  return (
    <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex items-center gap-4">
      {/* Token */}
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-semibold text-gray-900">{piece.token}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {piece.piece_name ?? '—'}
          {piece.client && ` · ${piece.client.first_name} ${piece.client.last_name ?? ''}`}
        </p>
      </div>

      {/* Timestamp */}
      {timestampField && (
        <p className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
          {format(parseISO(timestampField), "d MMM HH:mm", { locale: fr })}
        </p>
      )}

      {/* Action */}
      <PieceAdvanceButton pieceId={piece.id} status={status} />
    </div>
  )
}
