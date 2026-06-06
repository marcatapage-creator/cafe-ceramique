'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markOrderServed(orderId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status: 'served', served_at: new Date().toISOString() })
    .eq('id', orderId)

  if (error) return { error: 'Erreur lors de la mise à jour.' }
  revalidatePath('/dashboard/commandes')
  return { success: true }
}
