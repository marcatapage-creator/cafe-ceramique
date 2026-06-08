import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b border-gray-200 bg-white px-6 py-3 flex items-center gap-6">
        <span className="font-black italic text-gray-900 text-lg tracking-tight">mimo</span>
        <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">Dashboard</a>
        <a href="/dashboard/reservations" className="text-sm text-gray-500 hover:text-gray-900">Réservations</a>
        <a href="/dashboard/pieces" className="text-sm text-gray-500 hover:text-gray-900">Pièces</a>
        <a href="/dashboard/sessions" className="text-sm text-gray-500 hover:text-gray-900">Sessions</a>
        <a href="/dashboard/commandes" className="text-sm text-gray-500 hover:text-gray-900">Commandes</a>
        <a href="/dashboard/tables" className="text-sm text-gray-500 hover:text-gray-900">Tables</a>
        <div className="ml-auto">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-sm text-gray-400 hover:text-gray-900">
              Déconnexion
            </button>
          </form>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
