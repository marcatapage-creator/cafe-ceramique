import { LoginForm } from './_components/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">☕</div>
          <h1 className="text-2xl font-bold text-[#3D2B1F]">Café Céramique</h1>
          <p className="text-[#6B5344] text-sm mt-1">Espace gérant</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
