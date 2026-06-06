'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const schema = z.object({
  firstName: z.string().min(1, 'Prénom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  initialData: FormData
  onNext: (data: FormData) => void
}

export function StepIdentification({ initialData, onNext }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="p-6 space-y-6 max-w-sm mx-auto">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Commençons par vous</h2>
        <p className="text-sm text-gray-500 mt-1">
          Ces infos servent uniquement à vous envoyer votre token céramique.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input id="firstName" {...register('firstName')} placeholder="Marie" autoFocus />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" {...register('email')} placeholder="marie@email.com" />
          {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          <p className="text-xs text-gray-400">Vous recevrez votre token de suivi céramique ici.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Téléphone <span className="text-gray-400">(optionnel)</span></Label>
          <Input id="phone" type="tel" {...register('phone')} placeholder="+33 6 12 34 56 78" />
        </div>
      </div>

      <Button type="submit" className="w-full bg-black hover:bg-gray-800 py-4 text-base">
        Choisir ma pièce →
      </Button>
    </form>
  )
}
