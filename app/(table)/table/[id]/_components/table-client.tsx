'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { PhysicalTable, Session, TablePageState } from '@/types/database'

interface Props {
  table: PhysicalTable
  state: TablePageState
  session: Session | null
  nextSession: Session | null
}

export function TableClient({ table, state, session, nextSession }: Props) {
  const router = useRouter()

  // Si session inactive et token en localStorage → rediriger vers le suivi
  useEffect(() => {
    if (state === 'active') return
    const stored = localStorage.getItem(`ceramic_token_t${table.id}`)
    if (stored) router.replace(`/suivi/${stored}`)
  }, [table.id, state, router])

  if (state === 'active' && session) {
    return <ActiveSession table={table} session={session} />
  }

  return <WaitingState table={table} nextSession={nextSession} />
}

function ActiveSession({ table, session }: { table: PhysicalTable; session: Session }) {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="text-5xl">🎨</div>
        <div>
          <p className="text-sm text-[#8B6914] font-medium uppercase tracking-widest mb-1">
            {table.label}
          </p>
          <h1 className="text-3xl font-bold text-[#3D2B1F]">
            Bienvenue !
          </h1>
          <p className="text-[#6B5344] mt-2">
            Session {session.start_time.slice(0, 5)} – {session.end_time.slice(0, 5)}
          </p>
        </div>
        <a
          href={`/table/${table.id}/flow`}
          className="block w-full bg-[#C17F24] hover:bg-[#A66A1A] text-white font-semibold py-4 rounded-xl text-lg transition-colors"
        >
          Commencer ma session →
        </a>
        <p className="text-xs text-[#8B8080]">
          Chaque participant scanne individuellement
        </p>
      </div>
    </div>
  )
}

function WaitingState({
  table,
  nextSession,
}: {
  table: PhysicalTable
  nextSession: Session | null
}) {
  const nextLabel = nextSession
    ? (() => {
        const d = new Date(`${nextSession.date}T${nextSession.start_time}`)
        return format(d, "EEEE d MMMM 'à' HH'h'mm", { locale: fr })
      })()
    : null

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="text-5xl">☕</div>
        <div>
          <p className="text-sm text-[#8B6914] font-medium uppercase tracking-widest mb-1">
            {table.label}
          </p>
          <h1 className="text-2xl font-bold text-[#3D2B1F]">
            Aucune session en cours
          </h1>
          {nextLabel ? (
            <p className="text-[#6B5344] mt-2">
              Prochaine session :<br />
              <span className="font-semibold capitalize">{nextLabel}</span>
            </p>
          ) : (
            <p className="text-[#6B5344] mt-2">
              Aucune session planifiée prochainement.
            </p>
          )}
        </div>
        <div className="bg-white/60 rounded-xl p-4 text-sm text-[#6B5344]">
          Réservez votre session sur notre site pour garantir votre place.
        </div>
      </div>
    </div>
  )
}
