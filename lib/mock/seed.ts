import type {
  PhysicalTable, GroupSession, CeramicPiece, Client,
  Reservation, Order, CatalogPiece, MenuItem, OpeningHours,
} from '@/types/database'

// Seed mutable — les writes (insert/upsert/update) modifient ces tableaux
// en mémoire pour la durée de la session de dev.

const TODAY = '2026-06-06'
const NOW   = `${TODAY}T10:00:00.000Z`

// ── Physical tables ──────────────────────────────────────────────────────────
export const mockTables: (PhysicalTable & { is_active: boolean })[] = Array.from({ length: 15 }, (_, i) => ({
  id:        i + 1,
  label:     `T${String(i + 1).padStart(2, '0')}`,
  seats:     2,
  is_active: true,
  pos_x:     (i % 5) * 2,
  pos_y:     Math.floor(i / 5) * 2,
}))

// ── Clients ──────────────────────────────────────────────────────────────────
export const mockClients: Client[] = [
  { id: 'client-001', first_name: 'Marie',   last_name: 'Dupont',  email: 'marie@example.com',  phone: null, stripe_customer_id: null, created_at: NOW, updated_at: NOW },
  { id: 'client-002', first_name: 'Jean',    last_name: 'Martin',  email: 'jean@example.com',   phone: null, stripe_customer_id: null, created_at: NOW, updated_at: NOW },
  { id: 'client-003', first_name: 'Sophie',  last_name: 'Bernard', email: 'sophie@example.com', phone: null, stripe_customer_id: null, created_at: NOW, updated_at: NOW },
  { id: 'client-004', first_name: 'Lucas',   last_name: null,      email: 'lucas@example.com',  phone: null, stripe_customer_id: null, created_at: NOW, updated_at: NOW },
  { id: 'client-005', first_name: 'Emma',    last_name: 'Leroy',   email: 'emma@example.com',   phone: null, stripe_customer_id: null, created_at: NOW, updated_at: NOW },
]

// ── Group sessions (avec group_session_tables pré-jointé) ────────────────────
type GroupSessionWithJoin = GroupSession & {
  group_session_tables: Array<{ physical_table_id: number }>
}

export const mockGroupSessions: GroupSessionWithJoin[] = [
  {
    id: 'gs-t01-active', status: 'active',  qr_token: 'mock-qr-t01',
    starts_at: `${TODAY}T10:00:00`, ends_at: `${TODAY}T12:30:00`, closed_at: null,
    nb_participants: 2, notes: null, created_at: `${TODAY}T10:00:00`,
    group_session_tables: [{ physical_table_id: 1 }],
  },
  {
    id: 'gs-t03-active', status: 'active',  qr_token: 'mock-qr-t03',
    starts_at: `${TODAY}T11:30:00`, ends_at: `${TODAY}T14:00:00`, closed_at: null,
    nb_participants: 2, notes: null, created_at: `${TODAY}T11:30:00`,
    group_session_tables: [{ physical_table_id: 3 }],
  },
  {
    id: 'gs-t05-active', status: 'active',  qr_token: 'mock-qr-t05',
    starts_at: `${TODAY}T09:00:00`, ends_at: `${TODAY}T11:30:00`, closed_at: null,
    nb_participants: 1, notes: null, created_at: `${TODAY}T09:00:00`,
    group_session_tables: [{ physical_table_id: 5 }],
  },
  {
    id: 'gs-t07-active', status: 'active',  qr_token: 'mock-qr-t07',
    starts_at: `${TODAY}T10:30:00`, ends_at: `${TODAY}T13:00:00`, closed_at: null,
    nb_participants: 2, notes: null, created_at: `${TODAY}T10:30:00`,
    group_session_tables: [{ physical_table_id: 7 }],
  },
  {
    id: 'gs-t02-closed', status: 'closed', qr_token: 'mock-qr-t02',
    starts_at: `${TODAY}T08:00:00`, ends_at: `${TODAY}T10:00:00`,
    closed_at: `${TODAY}T10:05:00`,
    nb_participants: 2, notes: null, created_at: `${TODAY}T08:00:00`,
    group_session_tables: [{ physical_table_id: 2 }],
  },
]

// ── Ceramic pieces ───────────────────────────────────────────────────────────
export const mockCeramicPieces: CeramicPiece[] = [
  {
    id: 'piece-001', token: 'CER-0606-T01-001', status: 'painted',
    client_id: 'client-001', group_session_id: 'gs-t01-active',
    piece_name: 'Bol medium', piece_price: 14,
    painted_at: `${TODAY}T10:30:00`, queued_at: null, fired_at: null,
    ready_at: null, collected_at: null, firing_batch_id: null,
    created_at: `${TODAY}T10:30:00`,
  },
  {
    id: 'piece-002', token: 'CER-0606-T01-002', status: 'painted',
    client_id: 'client-002', group_session_id: 'gs-t01-active',
    piece_name: 'Tasse à café', piece_price: 10,
    painted_at: `${TODAY}T10:45:00`, queued_at: null, fired_at: null,
    ready_at: null, collected_at: null, firing_batch_id: null,
    created_at: `${TODAY}T10:45:00`,
  },
  {
    id: 'piece-003', token: 'CER-0606-T03-001', status: 'queued',
    client_id: 'client-003', group_session_id: 'gs-t03-active',
    piece_name: 'Assiette', piece_price: 16,
    painted_at: `${TODAY}T11:45:00`, queued_at: `${TODAY}T12:30:00`,
    fired_at: null, ready_at: null, collected_at: null, firing_batch_id: null,
    created_at: `${TODAY}T11:45:00`,
  },
  {
    id: 'piece-004', token: 'CER-0606-T05-001', status: 'firing',
    client_id: 'client-004', group_session_id: 'gs-t05-active',
    piece_name: 'Vase petit', piece_price: 18,
    painted_at: `${TODAY}T09:30:00`, queued_at: `${TODAY}T10:00:00`,
    fired_at: `${TODAY}T10:30:00`, ready_at: null, collected_at: null,
    firing_batch_id: 'batch-001', created_at: `${TODAY}T09:30:00`,
  },
  {
    id: 'piece-005', token: 'CER-0606-T07-001', status: 'ready',
    client_id: 'client-005', group_session_id: 'gs-t07-active',
    piece_name: 'Mug large', piece_price: 12,
    painted_at: `2026-06-05T14:00:00`, queued_at: `2026-06-05T15:00:00`,
    fired_at: `2026-06-05T16:00:00`, ready_at: `2026-06-06T09:00:00`,
    collected_at: null, firing_batch_id: 'batch-001',
    created_at: `2026-06-05T14:00:00`,
  },
  {
    id: 'piece-006', token: 'CER-0605-T02-001', status: 'collected',
    client_id: 'client-001', group_session_id: 'gs-t02-closed',
    piece_name: 'Bol small', piece_price: 10,
    painted_at: `2026-06-05T08:30:00`, queued_at: `2026-06-05T09:30:00`,
    fired_at: `2026-06-05T10:30:00`, ready_at: `2026-06-06T08:00:00`,
    collected_at: `2026-06-06T09:30:00`, firing_batch_id: 'batch-001',
    created_at: `2026-06-05T08:30:00`,
  },
]

// ── Orders ───────────────────────────────────────────────────────────────────
export const mockOrders: Order[] = [
  {
    id: 'order-001', client_id: 'client-001', group_session_id: 'gs-t01-active',
    items: [{ name: 'Thé vert', price: 3.50, qty: 1 }, { name: 'Croissant', price: 2.50, qty: 1 }],
    total: 6, notes: null, status: 'pending',
    ordered_at: `${TODAY}T10:15:00`, served_at: null,
  },
  {
    id: 'order-002', client_id: 'client-003', group_session_id: 'gs-t03-active',
    items: [{ name: 'Café latte', price: 4, qty: 2 }],
    total: 8, notes: 'Sans sucre', status: 'served',
    ordered_at: `${TODAY}T11:35:00`, served_at: `${TODAY}T11:50:00`,
  },
]

// ── Reservations ─────────────────────────────────────────────────────────────
export const mockReservations: Reservation[] = [
  {
    id: 'resa-001', client_id: 'client-001',
    starts_at: `${TODAY}T14:00:00`, ends_at: `${TODAY}T16:00:00`,
    nb_participants: 2, status: 'confirmed',
    notes: null, cancel_token: 'cancel-001', cancellation_fee_charged: false,
    cancelled_at: null, created_at: `2026-06-05T18:00:00`,
    stripe_payment_method_id: null,
  },
  {
    id: 'resa-002', client_id: 'client-002',
    starts_at: `${TODAY}T16:00:00`, ends_at: `${TODAY}T18:00:00`,
    nb_participants: 3, status: 'confirmed',
    notes: 'Anniversaire', cancel_token: 'cancel-002', cancellation_fee_charged: false,
    cancelled_at: null, created_at: `2026-06-05T20:00:00`,
    stripe_payment_method_id: null,
  },
  {
    id: 'resa-003', client_id: 'client-003',
    starts_at: `2026-06-07T10:00:00`, ends_at: `2026-06-07T12:00:00`,
    nb_participants: 1, status: 'pending',
    notes: null, cancel_token: 'cancel-003', cancellation_fee_charged: false,
    cancelled_at: null, created_at: `${TODAY}T09:00:00`,
    stripe_payment_method_id: null,
  },
]

// ── Catalog pieces ───────────────────────────────────────────────────────────
export const mockCatalogPieces: CatalogPiece[] = [
  { id: 'cat-001', name: 'Bol small',     price: 10, description: 'Bol 15 cm',   is_available: true, sort_order: 1, photo_url: null, created_at: NOW },
  { id: 'cat-002', name: 'Bol medium',    price: 14, description: 'Bol 20 cm',   is_available: true, sort_order: 2, photo_url: null, created_at: NOW },
  { id: 'cat-003', name: 'Bol large',     price: 18, description: 'Bol 25 cm',   is_available: true, sort_order: 3, photo_url: null, created_at: NOW },
  { id: 'cat-004', name: 'Tasse à café',  price: 10, description: null,          is_available: true, sort_order: 4, photo_url: null, created_at: NOW },
  { id: 'cat-005', name: 'Mug large',     price: 12, description: null,          is_available: true, sort_order: 5, photo_url: null, created_at: NOW },
  { id: 'cat-006', name: 'Assiette',      price: 16, description: 'Assiette 24cm', is_available: true, sort_order: 6, photo_url: null, created_at: NOW },
  { id: 'cat-007', name: 'Vase petit',    price: 18, description: null,          is_available: true, sort_order: 7, photo_url: null, created_at: NOW },
  { id: 'cat-008', name: 'Coupelle',      price: 8,  description: null,          is_available: true, sort_order: 8, photo_url: null, created_at: NOW },
]

// ── Menu items ───────────────────────────────────────────────────────────────
export const mockMenuItems: MenuItem[] = [
  { id: 'menu-001', name: 'Café expresso', category: 'boissons', price: 2.50, description: null, is_available: true, sort_order: 1, photo_url: null, created_at: NOW },
  { id: 'menu-002', name: 'Café latte',    category: 'boissons', price: 4.00, description: null, is_available: true, sort_order: 2, photo_url: null, created_at: NOW },
  { id: 'menu-003', name: 'Thé vert',      category: 'boissons', price: 3.50, description: null, is_available: true, sort_order: 3, photo_url: null, created_at: NOW },
  { id: 'menu-004', name: 'Chocolat chaud',category: 'boissons', price: 4.50, description: null, is_available: true, sort_order: 4, photo_url: null, created_at: NOW },
  { id: 'menu-005', name: 'Croissant',     category: 'patisseries', price: 2.50, description: null, is_available: true, sort_order: 5, photo_url: null, created_at: NOW },
  { id: 'menu-006', name: 'Pain au choc.', category: 'patisseries', price: 2.50, description: null, is_available: true, sort_order: 6, photo_url: null, created_at: NOW },
]

// ── Opening hours ────────────────────────────────────────────────────────────
export const mockOpeningHours: OpeningHours[] = [
  { id: 'oh-1', day_of_week: 1, opens_at: '10:00', closes_at: '19:00', is_active: true },
  { id: 'oh-2', day_of_week: 2, opens_at: '10:00', closes_at: '19:00', is_active: true },
  { id: 'oh-3', day_of_week: 3, opens_at: '10:00', closes_at: '19:00', is_active: true },
  { id: 'oh-4', day_of_week: 4, opens_at: '10:00', closes_at: '19:00', is_active: true },
  { id: 'oh-5', day_of_week: 5, opens_at: '10:00', closes_at: '20:00', is_active: true },
  { id: 'oh-6', day_of_week: 6, opens_at: '10:00', closes_at: '20:00', is_active: true },
  { id: 'oh-0', day_of_week: 0, opens_at: '11:00', closes_at: '18:00', is_active: true },
]

// ── Index par nom de table ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const MOCK_STORE: Record<string, any[]> = {
  physical_tables:          mockTables,
  clients:                  mockClients,
  group_sessions:           mockGroupSessions,
  ceramic_pieces:           mockCeramicPieces,
  orders:                   mockOrders,
  reservations:             mockReservations,
  catalog_pieces:           mockCatalogPieces,
  menu_items:               mockMenuItems,
  opening_hours:            mockOpeningHours,
  firing_batches:           [],
  notifications_log:        [],
  closed_dates:             [],
  group_session_tables: mockGroupSessions.flatMap(s =>
    s.group_session_tables.map(t => ({ group_session_id: s.id, physical_table_id: t.physical_table_id }))
  ),
  group_session_reservations: [],
}
