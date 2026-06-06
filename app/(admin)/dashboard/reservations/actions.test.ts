import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MOCK_STORE } from '@/lib/mock/seed'
import type { Reservation } from '@/types/database'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/supabase/server', async () => {
  const { createMockClient } = await import('@/lib/mock/client')
  return { createClient: async () => createMockClient() }
})

const { updateReservationStatus } = await import('./actions')
const { revalidatePath } = await import('next/cache')

describe('updateReservationStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    const resa = (MOCK_STORE.reservations as Reservation[]).find(r => r.id === 'resa-001')!
    resa.status = 'confirmed'
  })

  it('updates reservation to no_show', async () => {
    const result = await updateReservationStatus('resa-001', 'no_show')
    expect(result).toEqual({ success: true })

    const resa = (MOCK_STORE.reservations as Reservation[]).find(r => r.id === 'resa-001')!
    expect(resa.status).toBe('no_show')
  })

  it('updates reservation to cancelled', async () => {
    const result = await updateReservationStatus('resa-001', 'cancelled')
    expect(result).toEqual({ success: true })

    const resa = (MOCK_STORE.reservations as Reservation[]).find(r => r.id === 'resa-001')!
    expect(resa.status).toBe('cancelled')
  })

  it('calls revalidatePath for dashboard and reservations', async () => {
    await updateReservationStatus('resa-001', 'confirmed')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/reservations')
  })

  // ── Validation (chemins d'erreur) ─────────────────────────────────────────

  it('returns error when reservationId is empty', async () => {
    const result = await updateReservationStatus('', 'confirmed')
    expect(result).toHaveProperty('error')
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('returns error when status is invalid', async () => {
    // @ts-expect-error -- valeur hors enum, test de validation runtime
    const result = await updateReservationStatus('resa-001', 'invalid_status')
    expect(result).toHaveProperty('error')
    expect(revalidatePath).not.toHaveBeenCalled()
  })

  it('does not mutate reservation on validation failure', async () => {
    // @ts-expect-error -- valeur hors enum, test de validation runtime
    await updateReservationStatus('resa-001', 'bad_status')
    const resa = (MOCK_STORE.reservations as Reservation[]).find(r => r.id === 'resa-001')!
    expect(resa.status).toBe('confirmed')
  })
})
