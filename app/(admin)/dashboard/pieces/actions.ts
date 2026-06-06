'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PieceStatus } from '@/types/database'

const NEXT_STATUS: Record<PieceStatus, PieceStatus | null> = {
  painted:   'queued',
  queued:    'firing',
  firing:    'ready',
  ready:     'collected',
  collected: null,
}

const TIMESTAMP_FIELD: Record<PieceStatus, string | null> = {
  painted:   'queued_at',
  queued:    'fired_at',
  firing:    'ready_at',
  ready:     'collected_at',
  collected: null,
}

export async function advancePieceStatus(pieceId: string, currentStatus: PieceStatus) {
  const next = NEXT_STATUS[currentStatus]
  if (!next) return { error: 'Statut final — aucune transition possible.' }

  const field = TIMESTAMP_FIELD[currentStatus]
  const supabase = await createClient()

  const { error } = await supabase
    .from('ceramic_pieces')
    .update({ status: next, ...(field ? { [field]: new Date().toISOString() } : {}) })
    .eq('id', pieceId)

  if (error) return { error: 'Erreur lors de la mise à jour.' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/pieces')
  return { success: true, next }
}
