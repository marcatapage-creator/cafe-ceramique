import { LoginForm } from './_components/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Café Céramique</h1>
          <p className="text-gray-500 text-sm mt-1">Espace gérant</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
