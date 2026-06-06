'use client'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-gray-900 font-semibold">Erreur d&apos;accès</p>
        <p className="text-sm text-gray-500">{error.message || 'Une erreur inattendue est survenue.'}</p>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
