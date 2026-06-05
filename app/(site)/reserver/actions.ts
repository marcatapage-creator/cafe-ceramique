'use server'

import { createClient } from '@/lib/supabase/server'
import { sendEmail, buildReservationEmail } from '@/lib/email'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

interface CreateReservationInput {
  firstName: string
  lastName: string
  email: string
  phone: string
  nbParticipants: number
  startsAt: string   // TIMESTAMPTZ ISO
}

interface CreateReservationResult {
  reservationId?: string
  cancelToken?: string
  error?: string
}

export async function createReservation(
  input: CreateReservationInput
): Promise<CreateReservationResult> {
  const supabase = await createClient()

  try {
    // 1. Upsert client
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .upsert(
        {
          first_name: input.firstName,
          email: input.email,
          phone: input.phone,
        },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (clientErr || !client) {
      return { error: 'Erreur lors de la création de votre profil.' }
    }

    // 2. Créer la réservation via RPC (avec advisory lock anti race-condition)
    const { data: resa, error: resaErr } = await supabase.rpc('create_reservation', {
      p_client_id:       client.id,
      p_starts_at:       input.startsAt,
      p_nb_participants: input.nbParticipants,
      p_notes:           undefined,
    })

    if (resaErr) {
      if (resaErr.message.includes('NOT_ENOUGH_SEATS')) {
        return { error: 'Ce créneau vient d\'être complet. Veuillez en choisir un autre.' }
      }
      if (resaErr.message.includes('SLOT_UNAVAILABLE')) {
        return { error: 'Ce créneau n\'est pas disponible.' }
      }
      return { error: 'Erreur lors de la réservation. Réessayez.' }
    }

    const reservation = resa as { id: string; cancel_token: string }

    // 3. Mettre à jour le last_name (non géré dans le schéma client actuel — champ optionnel)
    // TODO Sprint suivant : ajouter last_name sur clients

    // Email de confirmation (non-bloquant)
    const startsAtDate = parseISO(input.startsAt)
    const { subject, html } = buildReservationEmail({
      firstName: input.firstName,
      date: format(startsAtDate, 'EEEE d MMMM yyyy', { locale: fr }),
      time: format(startsAtDate, 'HH\'h\'mm'),
      nbParticipants: input.nbParticipants,
      cancelToken: reservation.cancel_token,
    })
    await sendEmail({ to: input.email, subject, html })

    return {
      reservationId: reservation.id,
      cancelToken: reservation.cancel_token,
    }
  } catch {
    return { error: 'Une erreur inattendue est survenue. Réessayez.' }
  }
}
