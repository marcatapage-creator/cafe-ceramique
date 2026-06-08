import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FlowWizard } from './_components/flow-wizard'
import type { GroupSessionWithTables } from '@/types/database'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function FlowPage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createClient()

  const [{ data: rawSession }, { data: pieces }, { data: drinks }] = await Promise.all([
    supabase.rpc('get_group_session_by_token', { p_token: token }),
    supabase.from('catalog_pieces').select('*').eq('is_available', true).order('sort_order'),
    supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order'),
  ])

  const sessionData = rawSession as unknown as GroupSessionWithTables | null

  if (!sessionData?.found) redirect(`/s/${token}`)
  if (sessionData.expired || sessionData.session?.status === 'closed') redirect(`/s/${token}`)

  return (
    <FlowWizard
      sessionToken={token}
      session={sessionData.session!}
      tables={sessionData.tables ?? []}
      pieces={pieces ?? []}
      drinks={drinks ?? []}
    />
  )
}

export async function generateMetadata() {
  return { title: 'Ma session — mimo' }
}
