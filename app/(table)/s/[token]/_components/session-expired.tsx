import Link from 'next/link'

export function SessionExpired({ reason }: { reason: 'not_found' | 'closed' }) {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="text-5xl">{reason === 'closed' ? '✅' : '🔍'}</div>
        <div>
          <h1 className="text-2xl font-bold text-[#3D2B1F]">
            {reason === 'closed' ? 'Session terminée' : 'QR code invalide'}
          </h1>
          <p className="text-[#6B5344] mt-2 text-sm">
            {reason === 'closed'
              ? "Cette session est terminée. Vous pouvez retrouver votre pièce via le token reçu par email."
              : "Ce QR code ne correspond à aucune session active."}
          </p>
        </div>
        {reason === 'closed' && (
          <Link
            href="/"
            className="text-sm text-[#C17F24] underline underline-offset-2"
          >
            Retour à l&apos;accueil
          </Link>
        )}
      </div>
    </div>
  )
}
