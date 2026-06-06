import { vi, describe, it, expect, beforeEach } from 'vitest'
import { MOCK_STORE } from '@/lib/mock/seed'
import type { CeramicPiece } from '@/types/database'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

vi.mock('@/lib/supabase/server', async () => {
  const { createMockClient } = await import('@/lib/mock/client')
  return { createClient: async () => createMockClient() }
})

// Import after mocks are set up
const { advancePieceStatus } = await import('./actions')
const { revalidatePath } = await import('next/cache')

describe('advancePieceStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the painted piece to a known state
    const piece = (MOCK_STORE.ceramic_pieces as CeramicPiece[]).find(p => p.id === 'piece-001')!
    piece.status = 'painted'
    piece.queued_at = null
    piece.fired_at = null
    piece.ready_at = null
    piece.collected_at = null
  })

  it('advances painted → queued and sets queued_at', async () => {
    const result = await advancePieceStatus('piece-001', 'painted')
    expect(result).toEqual({ success: true, next: 'queued' })

    const piece = (MOCK_STORE.ceramic_pieces as CeramicPiece[]).find(p => p.id === 'piece-001')!
    expect(piece.status).toBe('queued')
    expect(piece.queued_at).toBeTruthy()
  })

  it('advances queued → firing and sets fired_at', async () => {
    const piece = (MOCK_STORE.ceramic_pieces as CeramicPiece[]).find(p => p.id === 'piece-001')!
    piece.status = 'queued'

    const result = await advancePieceStatus('piece-001', 'queued')
    expect(result).toEqual({ success: true, next: 'firing' })
    expect(piece.status).toBe('firing')
    expect(piece.fired_at).toBeTruthy()
  })

  it('returns error when piece is already collected', async () => {
    const result = await advancePieceStatus('piece-001', 'collected')
    expect(result).toEqual({ error: 'Statut final — aucune transition possible.' })
  })

  it('calls revalidatePath for dashboard and pieces', async () => {
    await advancePieceStatus('piece-001', 'painted')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/pieces')
  })

  it('does not mutate the piece on final status', async () => {
    const piece = (MOCK_STORE.ceramic_pieces as CeramicPiece[]).find(p => p.id === 'piece-001')!
    piece.status = 'collected'

    await advancePieceStatus('piece-001', 'collected')
    expect(piece.status).toBe('collected')
  })
})
