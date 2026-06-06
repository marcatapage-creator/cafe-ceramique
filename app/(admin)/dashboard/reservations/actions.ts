'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/guard'
import { UpdateReservationSchema } from '@/lib/validation/schemas'
import { revalidatePath } from 'next/cache'

export async function updateReservationStatus(
  reservationId: string,
  status: 'confirmed' | 'no_show' | 'cancelled',
) {
  const user = await requireAdmin()
  if (!user) return { error: 'Non autorisé.' }

  const parsed = UpdateReservationSchema.safeParse({ reservationId, status })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { error } = await supabase
    .from('reservations')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.reservationId)

  if (error) return { error: 'Erreur lors de la mise à jour.' }
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/reservations')
  return { success: true }
}
