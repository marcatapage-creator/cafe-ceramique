import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { CeramicPiece, Client, PieceStatus } from '@/types/database'
import { PieceAdvanceButton } from './_components/piece-advance-button'
import { DesignPencil, Hourglass, FireFlame, Sparks, Home } from 'iconoir-react'

const PAGE_SIZE = 20

const STATUS_META: Record<PieceStatus, { label: string; icon: React.ReactNode; cls: string }> = {
  painted:   { label: 'Peinte',         icon: <DesignPencil className="size-3.5" />, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  queued:    { label: 'File de cuisson', icon: <Hourglass className="size-3.5" />,   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  firing:    { label: 'En cuisson',      icon: <FireFlame className="size-3.5" />,   cls: 'bg-orange-50 text-orange-700 border-orange-200' },
  ready:     { label: 'Prête',           icon: <Sparks className="size-3.5" />,      cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  collected: { label: 'Récupérée',       icon: <Home className="size-3.5" />,        cls: 'bg-gray-50 text-gray-400 border-gray-100' },
}

const STATUS_ORDER: PieceStatus[] = ['painted', 'queued', 'firing', 'ready', 'collected']

type PieceWithClient = CeramicPiece & {
  client: Pick<Client, 'id' | 'first_name' | 'last_name'> | undefined
}

type Props = {
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function PiecesPage({ searchParams }: Props) {
  const params = await searchParams
  const filterStatus = STATUS_ORDER.includes(params.status as PieceStatus)
    ? (params.status as PieceStatus)
    : null
  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const offset = (page - 1) * PAGE_SIZE

  const supabase = await createClient()

  const [piecesResult, { data: rawClients }] = await Promise.all([
    filterStatus
      ? supabase
          .from('ceramic_pieces')
          .select('*', { count: 'exact' })
          .eq('status', filterStatus)
          .order('created_at')
          .limit(PAGE_SIZE)
      : supabase
          .from('ceramic_pieces')
          .select('*', { count: 'exact' })
          .order('created_at')
          .range(offset, offset + PAGE_SIZE - 1),
    supabase.from('clients').select('id, first_name, last_name'),
  ])

  const { data: rawPieces, count: totalCount } = piecesResult

  const clientMap = new Map(
    (rawClients ?? []).map((c: Pick<Client, 'id' | 'first_name' | 'last_name'>) => [c.id, c])
  )

  const pieces: PieceWithClient[] = (rawPieces ?? []).map((p: CeramicPiece) => ({
    ...p,
    client: clientMap.get(p.client_id) as PieceWithClient['client'],
  }))

  const total = totalCount ?? pieces.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const byStatus = Object.fromEntries(
    STATUS_ORDER.map(s => [s, pieces.filter(p => p.status === s)])
  ) as Record<PieceStatus, PieceWithClient[]>

  const activeStatuses = filterStatus
    ? [filterStatus]
    : STATUS_ORDER.filter(s => s !== 'collected' || byStatus.collected.length > 0)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pièces céramiques</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {pieces.filter(p => p.status !== 'collected').length} en cours
            {total > PAGE_SIZE && ` · ${total} au total`}
          </p>
        </div>

        {/* Filtre statut */}
        <div className="flex gap-2 flex-wrap">
          <a
            href="/dashboard/pieces"
            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
              !filterStatus
                ? 'bg-black text-white border-black'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
            }`}
          >
            Tous
          </a>
          {STATUS_ORDER.map(s => (
            <a
              key={s}
              href={`/dashboard/pieces?status=${s}`}
              className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${
                filterStatus === s
                  ? 'bg-black text-white border-black'
                  : `${STATUS_META[s].cls} hover:opacity-80`
              }`}
            >
              <span className="flex items-center gap-1">{STATUS_META[s].icon} {STATUS_META[s].label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Sections par statut */}
      {activeStatuses.map(status => {
        const m = STATUS_META[status]
        const list = byStatus[status]
        return (
          <section key={status} id={status} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center">{m.icon}</span>
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

      {/* Pagination (mode vue globale uniquement) */}
      {!filterStatus && totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          {page > 1 && (
            <a href={`/dashboard/pieces?page=${page - 1}`} className="text-sm text-gray-500 hover:text-gray-900">
              ← Précédent
            </a>
          )}
          <span className="text-xs text-gray-400">Page {page} / {totalPages}</span>
          {page < totalPages && (
            <a href={`/dashboard/pieces?page=${page + 1}`} className="text-sm text-gray-500 hover:text-gray-900">
              Suivant →
            </a>
          )}
        </div>
      )}
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
      <div className="min-w-0 flex-1">
        <p className="font-mono text-sm font-semibold text-gray-900">{piece.token}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {piece.piece_name ?? '—'}
          {piece.client && ` · ${piece.client.first_name} ${piece.client.last_name ?? ''}`}
        </p>
      </div>

      {timestampField && (
        <p className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
          {format(parseISO(timestampField), 'd MMM HH:mm', { locale: fr })}
        </p>
      )}

      <PieceAdvanceButton pieceId={piece.id} status={status} />
    </div>
  )
}
