// Génération du token céramique : CER-MMDD-T00-XXX
// Appelée côté serveur à la validation du flow table.

export function generateCeramicToken(
  sessionDate: Date,
  tableNumber: number,
  increment: number
): string {
  const mm = String(sessionDate.getMonth() + 1).padStart(2, '0')
  const dd = String(sessionDate.getDate()).padStart(2, '0')
  const t = String(tableNumber).padStart(2, '0')
  const xxx = String(increment).padStart(3, '0')
  return `CER-${mm}${dd}-T${t}-${xxx}`
}

// Retourne l'incrément suivant pour une session + table donnée
export async function getNextTokenIncrement(
  supabase: ReturnType<typeof import('@/lib/supabase/server').createClient> extends Promise<infer T> ? T : never,
  sessionId: string,
  tableNumber: number,
  sessionDate: Date
): Promise<number> {
  const mm = String(sessionDate.getMonth() + 1).padStart(2, '0')
  const dd = String(sessionDate.getDate()).padStart(2, '0')
  const prefix = `CER-${mm}${dd}-T${String(tableNumber).padStart(2, '0')}-`

  const { count } = await supabase
    .from('ceramic_pieces')
    .select('*', { count: 'exact', head: true })
    .like('token', `${prefix}%`)

  return (count ?? 0) + 1
}
