'use client'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 text-center">
      <p className="text-gray-900 font-semibold">Une erreur est survenue</p>
      <p className="text-sm text-gray-500 max-w-sm">{error.message || 'Impossible de charger cette page.'}</p>
      <button
        onClick={reset}
        className="px-4 py-2 rounded-xl bg-black text-white text-sm hover:bg-gray-800 transition-colors"
      >
        Réessayer
      </button>
    </div>
  )
}
