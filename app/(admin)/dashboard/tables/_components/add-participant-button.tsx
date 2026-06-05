'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { generateCeramicToken } from '@/lib/tokens'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const schema = z.object({
  first_name: z.string().min(1, 'Prénom requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  piece_name: z.string().min(1, 'Pièce requise'),
  order_notes: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  tableId: number
  tableLabel: string
}

export function AddParticipantButton({ tableId, tableLabel }: Props) {
  const [open, setOpen] = useState(false)
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    setError(null)

    const supabase = createClient()

    // 1. Session active sur cette table
    const { data: sessionRows } = await supabase
      .from('group_sessions')
      .select('id, starts_at, qr_token, group_session_tables!inner(physical_table_id)')
      .eq('status', 'active')
      .eq('group_session_tables.physical_table_id', tableId)
      .limit(1)

    const session = sessionRows?.[0] ?? null
    if (!session) {
      setError('Aucune session active sur cette table.')
      setLoading(false)
      return
    }

    // 2. Upsert client
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .upsert(
        { first_name: data.first_name, email: data.email || `noemail-t${tableId}-${crypto.randomUUID()}@local` },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (clientErr || !client) {
      setError('Erreur lors de la création du profil.')
      setLoading(false)
      return
    }

    // 3. Générer token
    const sessionDate = new Date(session.starts_at)
    const { count: existingCount } = await supabase
      .from('ceramic_pieces')
      .select('*', { count: 'exact', head: true })
      .like('token', `CER-${String(sessionDate.getMonth() + 1).padStart(2,'0')}${String(sessionDate.getDate()).padStart(2,'0')}-T${String(tableId).padStart(2,'0')}-%`)

    const token = generateCeramicToken(sessionDate, tableId, (existingCount ?? 0) + 1)

    // 4. Créer la pièce céramique
    const { error: pieceErr } = await supabase.from('ceramic_pieces').insert({
      token,
      client_id: client.id,
      group_session_id: session.id,
      piece_name: data.piece_name,
      status: 'painted',
    })

    if (pieceErr) {
      setError('Erreur lors de la création du token.')
      setLoading(false)
      return
    }

    // 5. Commande boissons si renseignée
    if (data.order_notes) {
      await supabase.from('orders').insert({
        client_id: client.id,
        group_session_id: session.id,
        items: [],
        total: 0,
        notes: data.order_notes,
      })
    }

    setGeneratedToken(token)
    setLoading(false)
    reset()
  }

  function handleClose() {
    setOpen(false)
    setGeneratedToken(null)
    setError(null)
    reset()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="text-xs text-[#C17F24] hover:underline mt-1 bg-transparent border-0 p-0 cursor-pointer">
        + Sans mobile
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Participant sans mobile — {tableLabel}</DialogTitle>
        </DialogHeader>

        {generatedToken ? (
          <div className="space-y-4 text-center py-4">
            <div className="text-4xl">✅</div>
            <p className="text-[#3D2B1F] font-semibold">Token généré</p>
            <p className="text-2xl font-mono font-bold text-[#C17F24] bg-[#F5F0E8] py-3 rounded-lg">
              {generatedToken}
            </p>
            <p className="text-sm text-[#6B5344]">
              Notez ce token sur la fiche du participant.
            </p>
            <Button onClick={handleClose} className="w-full">Fermer</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="first_name">Prénom *</Label>
              <Input id="first_name" {...register('first_name')} placeholder="Marie" />
              {errors.first_name && <p className="text-xs text-red-500">{errors.first_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email <span className="text-[#8B8080]">(optionnel)</span></Label>
              <Input id="email" type="email" {...register('email')} placeholder="marie@email.com" />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              <p className="text-xs text-[#8B8080]">Si renseigné, la confirmation sera envoyée par email.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="piece_name">Pièce choisie *</Label>
              <Input id="piece_name" {...register('piece_name')} placeholder="Bol medium, Tasse..." />
              {errors.piece_name && <p className="text-xs text-red-500">{errors.piece_name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="order_notes">Boisson / pâtisserie</Label>
              <Input id="order_notes" {...register('order_notes')} placeholder="Thé, croissant..." />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Annuler
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#C17F24] hover:bg-[#A66A1A]"
                disabled={loading}
              >
                {loading ? 'Génération…' : 'Générer le token'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
