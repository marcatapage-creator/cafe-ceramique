import { MockQueryBuilder } from './builder'
import { mockGroupSessions, mockCeramicPieces } from './seed'
import type { AvailableSlot } from '@/types/database'

const MOCK_USER = {
  id:    'mock-admin-id',
  email: 'admin@cafe-ceramique.fr',
  role:  'authenticated',
  app_metadata:  { provider: 'email' },
  user_metadata: { role: 'admin' },
  aud: 'authenticated',
  created_at: '2026-01-01T00:00:00.000Z',
}

const MOCK_SESSION = {
  access_token:  'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_in:    3600,
  token_type:    'bearer',
  user: MOCK_USER,
}

function mockRpc(name: string, args?: Record<string, unknown>): { data: unknown; error: null } {
  if (name === 'get_available_slots') {
    const date = (args?.p_date as string) ?? new Date().toISOString().slice(0, 10)
    const slots: AvailableSlot[] = [
      { slot_start: `${date}T10:00:00`, slot_time_label: '10:00', available_seats: 24, is_available: true },
      { slot_start: `${date}T12:00:00`, slot_time_label: '12:00', available_seats: 20, is_available: true },
      { slot_start: `${date}T14:00:00`, slot_time_label: '14:00', available_seats: 28, is_available: true },
      { slot_start: `${date}T16:00:00`, slot_time_label: '16:00', available_seats: 30, is_available: true },
    ]
    return { data: slots, error: null }
  }

  if (name === 'get_piece_by_token') {
    const token = args?.p_token as string
    const piece = mockCeramicPieces.find(p => p.token === token)
    if (!piece) return { data: [], error: null }
    return {
      data: [{
        token:             piece.token,
        status:            piece.status,
        piece_name:        piece.piece_name,
        painted_at:        piece.painted_at,
        queued_at:         piece.queued_at,
        fired_at:          piece.fired_at,
        ready_at:          piece.ready_at,
        collected_at:      piece.collected_at,
        client_first_name: 'Client',
      }],
      error: null,
    }
  }

  if (name === 'get_group_session_by_token') {
    const token = args?.p_token as string
    const session = mockGroupSessions.find(s => s.qr_token === token)
    if (!session) return { data: { found: false }, error: null }

    const isExpired = session.status === 'closed'
    return {
      data: {
        found:   true,
        expired: isExpired,
        session,
        tables: (session.group_session_tables ?? []).map(t => ({
          id:     t.physical_table_id,
          label:  `T${String(t.physical_table_id).padStart(2, '0')}`,
          seats:  2,
        })),
      },
      error: null,
    }
  }

  if (name === 'create_reservation') {
    return { data: null, error: null }
  }

  if (name === 'cancel_reservation') {
    return { data: { success: true }, error: null }
  }

  return { data: null, error: null }
}

export function createMockClient() {
  return {
    from: (table: string) => new MockQueryBuilder(table),

    rpc: async (name: string, args?: Record<string, unknown>) =>
      mockRpc(name, args),

    auth: {
      getUser: async () => ({
        data: { user: MOCK_USER },
        error: null,
      }),
      getSession: async () => ({
        data: { session: MOCK_SESSION },
        error: null,
      }),
      signInWithPassword: async (_creds: { email: string; password: string }) => ({
        data: { user: MOCK_USER, session: MOCK_SESSION },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      onAuthStateChange: (_cb: unknown) => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    },

    channel: (_name: string) => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),

    removeChannel: (_ch: unknown) => {},
  }
}
