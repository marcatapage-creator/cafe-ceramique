'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateReservationStatus(
  reservationId: string,
  status: 'confirmed' | 'no_show' | 'cancelled',
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('reservations')
    .update({ status })
    .eq('id', reservationId)

  if (error) return { error: 'Erreur lors de la mise à jour.' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/reservations')
  return { success: true }
}
