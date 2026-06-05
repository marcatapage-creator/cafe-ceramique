import { createClient } from '@/lib/supabase/server'
import { SessionActive } from './_components/session-active'
import { SessionExpired } from './_components/session-expired'
import type { GroupSessionWithTables } from '@/types/database'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function SessionPage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createClient()

  const { data: raw } = await supabase.rpc('get_group_session_by_token', { p_token: token })
  const data = raw as unknown as GroupSessionWithTables | null

  if (!data?.found) {
    return <SessionExpired reason="not_found" />
  }

  if (data.expired || data.session?.status === 'closed') {
    return <SessionExpired reason="closed" />
  }

  return <SessionActive session={data.session!} tables={data.tables ?? []} />
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params
  return { title: `Session — Café Céramique`, description: `Session ${token.slice(0, 8)}` }
}
