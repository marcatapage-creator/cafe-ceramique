import { redirect } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ShortTableUrl({ params }: PageProps) {
  const { id } = await params
  redirect(`/table/${id}`)
}
