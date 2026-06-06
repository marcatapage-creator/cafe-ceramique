'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/guard'
import { MarkOrderServedSchema } from '@/lib/validation/schemas'
import { revalidatePath } from 'next/cache'

export async function markOrderServed(orderId: string) {
  const user = await requireAdmin()
  if (!user) return { error: 'Non autorisé.' }

  const parsed = MarkOrderServedSchema.safeParse({ orderId })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status: 'served', served_at: new Date().toISOString() })
    .eq('id', parsed.data.orderId)

  if (error) return { error: 'Erreur lors de la mise à jour.' }
  revalidatePath('/dashboard/commandes')
  return { success: true }
}
