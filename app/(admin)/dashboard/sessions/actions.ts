'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function openSession(tableIds: number[]) {
  if (tableIds.length === 0) return { error: 'Sélectionnez au moins une table.' }

  const supabase = await createClient()

  // Vérifie qu'aucune table sélectionnée n'a déjà une session active
  const { data: existing } = await supabase
    .from('group_sessions')
    .select('id, group_session_tables(physical_table_id)')
    .eq('status', 'active')

  const occupiedIds = new Set<number>()
  ;(existing ?? []).forEach((s: Record<string, unknown>) => {
    const gst = s.group_session_tables as Array<{ physical_table_id: number }> | undefined
    gst?.forEach(t => occupiedIds.add(t.physical_table_id))
  })

  const conflict = tableIds.find(id => occupiedIds.has(id))
  if (conflict) {
    return { error: `La table T${String(conflict).padStart(2, '0')} a déjà une session active.` }
  }

  const now = new Date().toISOString()
  const qrToken = `${tableIds.map(id => `t${id}`).join('-')}-${Date.now()}`

  // Crée la session
  const { data: session, error: sessionErr } = await supabase
    .from('group_sessions')
    .insert({
      qr_token:        qrToken,
      starts_at:       now,
      status:          'active',
      nb_participants: 0,
    })
    .select()
    .single()

  if (sessionErr || !session) return { error: 'Erreur lors de la création de la session.' }

  // Lie les tables
  for (const tableId of tableIds) {
    await supabase
      .from('group_session_tables')
      .insert({ group_session_id: (session as Record<string, unknown>).id as string, physical_table_id: tableId })
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/sessions')
  return { success: true, qrToken }
}

export async function closeSession(sessionId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('group_sessions')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) return { error: 'Erreur lors de la clôture.' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/sessions')
  return { success: true }
}
