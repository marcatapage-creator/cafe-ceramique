'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/guard'
import { OpenSessionSchema, CloseSessionSchema } from '@/lib/validation/schemas'
import { revalidatePath } from 'next/cache'

export async function openSession(tableIds: number[]) {
  const user = await requireAdmin()
  if (!user) return { error: 'Non autorisé.' }

  const parsed = OpenSessionSchema.safeParse({ tableIds })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()

  const { data: existing } = await supabase
    .from('group_sessions')
    .select('id, group_session_tables(physical_table_id)')
    .eq('status', 'active')

  const occupiedIds = new Set<number>()
  ;(existing ?? []).forEach((s: { group_session_tables?: Array<{ physical_table_id: number }> }) => {
    s.group_session_tables?.forEach(t => occupiedIds.add(t.physical_table_id))
  })

  const conflict = parsed.data.tableIds.find(id => occupiedIds.has(id))
  if (conflict) {
    return { error: `La table T${String(conflict).padStart(2, '0')} a déjà une session active.` }
  }

  const now = new Date().toISOString()
  const qrToken = `${parsed.data.tableIds.map(id => `t${id}`).join('-')}-${Date.now()}`

  const { data: sessionData, error: sessionErr } = await supabase
    .from('group_sessions')
    .insert({ qr_token: qrToken, starts_at: now, status: 'active', nb_participants: 0 })
    .select('id')
    .single()

  if (sessionErr || !sessionData) return { error: 'Erreur lors de la création de la session.' }

  const session = sessionData as { id: string }

  const tableInserts = await Promise.all(
    parsed.data.tableIds.map(tableId =>
      supabase
        .from('group_session_tables')
        .insert({ group_session_id: session.id, physical_table_id: tableId })
    )
  )

  const failed = tableInserts.find(r => r.error)
  if (failed) {
    await supabase.from('group_sessions').delete().eq('id', session.id)
    return { error: 'Erreur lors de la liaison des tables. Session annulée.' }
  }

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/sessions')
  return { success: true, qrToken }
}

export async function closeSession(sessionId: string) {
  const user = await requireAdmin()
  if (!user) return { error: 'Non autorisé.' }

  const parsed = CloseSessionSchema.safeParse({ sessionId })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()

  const { error } = await supabase
    .from('group_sessions')
    .update({ status: 'closed', closed_at: new Date().toISOString() })
    .eq('id', parsed.data.sessionId)

  if (error) return { error: 'Erreur lors de la clôture.' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/sessions')
  return { success: true }
}
