import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import type { Order, Client, GroupSession } from '@/types/database'
import { ServeButton } from './_components/serve-button'

type OrderItem = { name: string; price: number; qty: number }

export default async function CommandesPage() {
  const supabase = await createClient()

  const [{ data: ordersRaw }, { data: clientsRaw }, { data: sessionsRaw }] = await Promise.all([
    supabase.from('orders').select('*').in('status', ['pending', 'served']).order('ordered_at', { ascending: false }),
    supabase.from('clients').select('id, first_name, last_name, email'),
    supabase.from('group_sessions').select('id, qr_token, starts_at, group_session_tables(physical_table_id)'),
  ])

  const orders  = (ordersRaw  ?? []) as Order[]
  const clients = (clientsRaw ?? []) as Pick<Client, 'id' | 'first_name' | 'last_name' | 'email'>[]
  const sessions = (sessionsRaw ?? []) as (Pick<GroupSession, 'id' | 'qr_token' | 'starts_at'> & {
    group_session_tables: Array<{ physical_table_id: number }>
  })[]

  const clientMap  = new Map(clients.map(c => [c.id, c]))
  const sessionMap = new Map(sessions.map(s => [s.id, s]))

  const pending = orders.filter(o => o.status === 'pending')
  const served  = orders.filter(o => o.status === 'served')

  function sessionLabel(sessionId: string | null) {
    if (!sessionId) return '—'
    const s = sessionMap.get(sessionId)
    if (!s) return sessionId.slice(0, 8)
    const tables = s.group_session_tables?.map(t => `T${String(t.physical_table_id).padStart(2, '0')}`).join(' + ') ?? '?'
    return `${tables} · ${format(parseISO(s.starts_at), 'HH:mm')}`
  }

  function clientLabel(clientId: string | null) {
    if (!clientId) return '—'
    const c = clientMap.get(clientId)
    if (!c) return clientId.slice(0, 8)
    return c.first_name ? `${c.first_name} ${c.last_name ?? ''}`.trim() : c.email
  }

  function OrderCard({ order }: { order: Order }) {
    const items = (order.items ?? []) as OrderItem[]
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{clientLabel(order.client_id)}</span>
              <span className="text-xs text-gray-400">· {sessionLabel(order.group_session_id)}</span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              {format(parseISO(order.ordered_at), 'HH:mm')}
              {order.notes ? ` · ${order.notes}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-bold text-gray-900">{order.total.toFixed(2)} €</span>
            {order.status === 'pending' && <ServeButton orderId={order.id} />}
          </div>
        </div>
        <ul className="text-xs text-gray-600 space-y-0.5 pl-1">
          {items.map((item, i) => (
            <li key={i} className="flex justify-between gap-4">
              <span>{item.qty > 1 ? `${item.qty}× ` : ''}{item.name}</span>
              <span className="text-gray-400">{(item.price * item.qty).toFixed(2)} €</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
        <p className="text-gray-400 text-sm mt-0.5">
          {pending.length} en attente · {served.length} servie{served.length > 1 ? 's' : ''}
        </p>
      </div>

      {pending.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">En attente</h2>
          <div className="space-y-3">
            {pending.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}

      {pending.length === 0 && (
        <p className="text-sm text-gray-400 py-4">Aucune commande en attente.</p>
      )}

      {served.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Servies aujourd&apos;hui</h2>
          <div className="space-y-3 opacity-60">
            {served.map(o => <OrderCard key={o.id} order={o} />)}
          </div>
        </section>
      )}
    </div>
  )
}
