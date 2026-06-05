'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { createReservation } from '../actions'
import type { ReservationState } from './reservation-wizard'

const schema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  lastName:  z.string().min(1, 'Nom requis'),
  email:     z.string().email('Email invalide'),
  phone:     z.string().min(8, 'Téléphone requis'),
  policy:    z.literal(true, { message: 'Vous devez accepter la politique d\'annulation' }),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData: Pick<ReservationState, 'firstName' | 'lastName' | 'email' | 'phone'>
  state: ReservationState
  onDone: (details: Pick<ReservationState, 'firstName' | 'lastName' | 'email' | 'phone'>) => void
  onBack: () => void
}

export function StepDetails({ initialData, state, onDone, onBack }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...initialData, policy: undefined },
  })

  const dateLabel = state.date
    ? format(parseISO(state.date), 'EEEE d MMMM', { locale: fr })
    : ''

  async function onSubmit(form: FormData) {
    setLoading(true)
    setError(null)

    const result = await createReservation({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      nbParticipants: state.nbParticipants,
      startsAt: state.slotStart!,
    })

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    onDone({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-6 space-y-6 pb-8">
      <div>
        <h2 className="text-xl font-bold text-[#3D2B1F]">Vos coordonnées</h2>
        <div className="mt-2 bg-white rounded-xl px-4 py-3 text-sm text-[#6B5344] flex flex-wrap gap-x-4 gap-y-1">
          <span className="capitalize">{dateLabel}</span>
          <span>·</span>
          <span>{state.slotLabel}</span>
          <span>·</span>
          <span>{state.nbParticipants} {state.nbParticipants > 1 ? 'personnes' : 'personne'}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input id="firstName" {...register('firstName')} placeholder="Marie" />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lastName">Nom *</Label>
          <Input id="lastName" {...register('lastName')} placeholder="Dupont" />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" {...register('email')} placeholder="marie@email.com" />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
        <p className="text-xs text-[#8B8080]">Confirmation de réservation envoyée ici.</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phone">Téléphone *</Label>
        <Input id="phone" type="tel" {...register('phone')} placeholder="+33 6 12 34 56 78" />
        {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
        <p className="text-xs text-[#8B8080]">Utilisé uniquement pour vous contacter si besoin.</p>
      </div>

      {/* Politique d'annulation */}
      <div className="bg-[#FFF8F0] border border-[#E8DDD0] rounded-xl p-4 space-y-3">
        <p className="text-sm font-semibold text-[#3D2B1F]">Politique d&apos;annulation</p>
        <ul className="text-xs text-[#6B5344] space-y-1">
          <li>✅ Annulation gratuite jusqu&apos;à 24h avant votre session</li>
          <li>❌ Annulation moins de 24h avant : 20 € prélevés</li>
        </ul>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            {...register('policy')}
            className="mt-0.5 w-4 h-4 accent-[#C17F24]"
          />
          <span className="text-xs text-[#6B5344]">
            J&apos;ai lu et j&apos;accepte la politique d&apos;annulation.
          </span>
        </label>
        {errors.policy && <p className="text-xs text-red-500">{errors.policy.message}</p>}
      </div>

      {error && <p className="text-sm text-red-600 text-center">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading} className="flex-1">
          ← Retour
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 bg-[#C17F24] hover:bg-[#A66A1A]"
        >
          {loading ? 'Réservation…' : 'Confirmer →'}
        </Button>
      </div>
    </form>
  )
}
