import { createClient } from '@/lib/supabase/server'
import { QrGeneratorClient } from './_components/qr-generator-client'
import { AddParticipantButton } from './_components/add-participant-button'

export default async function TablesPage() {
  const supabase = await createClient()
  const { data: tables } = await supabase
    .from('physical_tables')
    .select('*')
    .eq('is_active', true)
    .order('id')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cafe-ceramique.fr'

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#3D2B1F]">Configuration des tables</h1>
          <p className="text-[#6B5344] text-sm mt-1">
            {tables?.length ?? 0} tables actives · QR codes permanents
          </p>
        </div>
        <QrGeneratorClient tables={tables ?? []} appUrl={appUrl} />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {(tables ?? []).map(table => (
          <div key={table.id} className="bg-white rounded-xl p-4 border border-[#E8DDD0] space-y-2">
            <p className="font-semibold text-[#3D2B1F] text-sm">{table.label}</p>
            <p className="text-xs text-[#8B8080]">{table.seats} places</p>
            <p className="text-xs text-[#C17F24] font-mono">/table/{table.id}</p>
            <AddParticipantButton tableId={table.id} tableLabel={table.label} />
          </div>
        ))}
      </div>
    </div>
  )
}
