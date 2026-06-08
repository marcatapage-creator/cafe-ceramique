import Link from 'next/link'
import { CheckCircle, Search } from 'iconoir-react'

export function SessionExpired({ reason }: { reason: 'not_found' | 'closed' }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex justify-center">
          {reason === 'closed' ? <CheckCircle className="size-12" /> : <Search className="size-12" />}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {reason === 'closed' ? 'Session terminée' : 'QR code invalide'}
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            {reason === 'closed'
              ? "Cette session est terminée. Vous pouvez retrouver votre pièce via le token reçu par email."
              : "Ce QR code ne correspond à aucune session active."}
          </p>
        </div>
        {reason === 'closed' && (
          <Link
            href="/"
            className="text-sm text-gray-900 underline underline-offset-2"
          >
            Retour à l&apos;accueil
          </Link>
        )}
      </div>
    </div>
  )
}
