import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Hourglass } from 'iconoir-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TableRedirectPage({ params }: PageProps) {
  const { id } = await params
  const tableId = Number(id)

  if (isNaN(tableId)) redirect('/')

  const supabase = await createClient()

  // Cherche d'abord le lien table → session, puis récupère le qr_token
  const { data: tableLinks } = await supabase
    .from('group_session_tables')
    .select('group_session_id')
    .eq('physical_table_id', tableId)
    .limit(1)

  const sessionId = (tableLinks as unknown as Array<{ group_session_id: string }> | null)?.[0]?.group_session_id

  if (sessionId) {
    const { data: sessionRow } = await supabase
      .from('group_sessions')
      .select('qr_token')
      .eq('id', sessionId)
      .eq('status', 'active')
      .maybeSingle()

    const qrToken = (sessionRow as unknown as { qr_token: string } | null)?.qr_token
    if (qrToken) redirect(`/s/${qrToken}`)
  }

  // Aucune session active — page d'attente
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <Hourglass className="size-12 mb-6" />
      <h1 className="text-xl font-bold text-gray-900">Session pas encore ouverte</h1>
      <p className="text-gray-500 text-sm mt-2 max-w-xs">
        Le gérant n&apos;a pas encore démarré la session pour cette table.
        Installez-vous, il arrive !
      </p>
      <p className="text-xs text-gray-300 mt-8 font-mono">Table {String(tableId).padStart(2, '0')}</p>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  return { title: `Table ${id} — Café Céramique` }
}
