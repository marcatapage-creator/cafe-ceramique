import { createClient } from '@/lib/supabase/server'
import { PieceTracker } from './_components/piece-tracker'
import { notFound } from 'next/navigation'
import type { PieceStatus } from '@/types/database'

interface PageProps {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { token } = await params
  return {
    title: `Suivi pièce ${token} — Café Céramique`,
    description: 'Suivez l\'état de cuisson de votre pièce céramique.',
  }
}

export default async function SuiviPage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createClient()

  const { data } = await supabase.rpc('get_piece_by_token', { p_token: token })
  const raw = Array.isArray(data) ? data[0] : null

  if (!raw) notFound()

  const piece = { ...raw, status: raw.status as PieceStatus }

  return <PieceTracker piece={piece} token={token} />
}
