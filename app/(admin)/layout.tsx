import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      <nav className="border-b border-[#E8DDD0] bg-white px-6 py-3 flex items-center gap-6">
        <span className="font-bold text-[#3D2B1F] text-lg">☕ Café Céramique</span>
        <a href="/dashboard" className="text-sm text-[#6B5344] hover:text-[#3D2B1F]">Dashboard</a>
        <a href="/dashboard/tables" className="text-sm text-[#6B5344] hover:text-[#3D2B1F]">Tables</a>
        <div className="ml-auto">
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="text-sm text-[#8B8080] hover:text-[#3D2B1F]">
              Déconnexion
            </button>
          </form>
        </div>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  )
}
