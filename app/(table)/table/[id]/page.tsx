import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TableClient } from './_components/table-client'
import type { Session } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TablePage({ params }: PageProps) {
  const { id } = await params
  const tableId = parseInt(id, 10)

  if (isNaN(tableId) || tableId < 1 || tableId > 15) notFound()

  const supabase = await createClient()

  const [{ data: table }, { data: rawState }] = await Promise.all([
    supabase
      .from('physical_tables')
      .select('*')
      .eq('id', tableId)
      .single(),
    supabase.rpc('get_table_page_state', { p_table_id: tableId }),
  ])

  if (!table) notFound()

  const stateData = rawState as { state: string; session: Session | null; next_session: Session | null } | null
  const state = (stateData?.state ?? 'waiting') as 'active' | 'waiting'
  const session = stateData?.session ?? null
  const nextSession = stateData?.next_session ?? null

  return (
    <TableClient
      table={table}
      state={state}
      session={session}
      nextSession={nextSession}
    />
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return { title: `Table ${id} — Café Céramique` }
}
