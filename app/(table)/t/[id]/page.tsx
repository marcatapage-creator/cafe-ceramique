import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TableRedirectPage({ params }: PageProps) {
  const { id } = await params
  const tableId = Number(id)

  if (isNaN(tableId)) redirect('/')

  const supabase = await createClient()

  // Cherche la session active pour cette table physique
  const { data: sessions } = await supabase
    .from('group_sessions')
    .select('qr_token, group_session_tables(physical_table_id)')
    .eq('status', 'active')
    .eq('group_session_tables.physical_table_id', tableId)
    .limit(1)

  const session = (sessions as unknown as Array<{ qr_token: string }> | null)?.[0]

  if (session?.qr_token) {
    redirect(`/s/${session.qr_token}`)
  }

  // Aucune session active — page d'attente
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <p className="text-5xl mb-6">⏳</p>
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
