'use server'

import { createClient } from '@/lib/supabase/server'
import { generateCeramicToken } from '@/lib/tokens'

interface SubmitFlowInput {
  sessionId: string
  sessionToken: string
  referenceTableId: number
  startsAt: string
  client: { firstName: string; email: string; phone?: string }
  piece: { id: string; name: string; price: number }
  orderItems: Array<{ name: string; price: number; qty: number }>
}

interface SubmitFlowResult {
  token?: string
  error?: string
}

export async function submitFlow(input: SubmitFlowInput): Promise<SubmitFlowResult> {
  const supabase = await createClient()

  try {
    // 1. Upsert client
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .upsert(
        {
          first_name: input.client.firstName,
          email: input.client.email,
          phone: input.client.phone || null,
        },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (clientErr || !client) {
      return { error: 'Erreur lors de la création de votre profil.' }
    }

    // 2. Générer le token CER-MMDD-T00-XXX
    const sessionDate = new Date(input.startsAt)
    const mm = String(sessionDate.getMonth() + 1).padStart(2, '0')
    const dd = String(sessionDate.getDate()).padStart(2, '0')
    const tableStr = String(input.referenceTableId).padStart(2, '0')
    const prefix = `CER-${mm}${dd}-T${tableStr}-`

    const { count } = await supabase
      .from('ceramic_pieces')
      .select('*', { count: 'exact', head: true })
      .like('token', `${prefix}%`)

    const ceramicToken = generateCeramicToken(
      sessionDate,
      input.referenceTableId,
      (count ?? 0) + 1
    )

    // 3. Créer la pièce céramique
    const { error: pieceErr } = await supabase.from('ceramic_pieces').insert({
      token: ceramicToken,
      client_id: client.id,
      group_session_id: input.sessionId,
      piece_name: input.piece.name,
      piece_price: input.piece.price,
      status: 'painted',
    })

    if (pieceErr) {
      return { error: 'Erreur lors de la génération de votre token.' }
    }

    // 4. Créer la commande (si des items)
    if (input.orderItems.length > 0) {
      const total = input.orderItems.reduce((s, i) => s + i.price * i.qty, 0)
      await supabase.from('orders').insert({
        client_id: client.id,
        group_session_id: input.sessionId,
        items: input.orderItems,
        total,
        status: 'pending',
      })
    }

    return { token: ceramicToken }
  } catch {
    return { error: 'Une erreur inattendue est survenue.' }
  }
}
