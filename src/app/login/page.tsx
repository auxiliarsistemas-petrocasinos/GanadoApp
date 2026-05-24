'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Login exitoso -> ir a dashboard
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-primary">
      <form onSubmit={handleLogin} className="w-full max-w-md p-10 rounded-2xl bg-white shadow-xl flex flex-col items-center">
        
        <div className="mb-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight">
            <span className="text-primary">Ganado</span>
            <span className="text-secondary">App</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Ingresa a tu portal de gestión
          </p>
        </div>

        {error && (
          <div className="w-full bg-destructive/10 border border-destructive text-destructive p-3 rounded-md mb-4 text-sm mt-4">
            {error}
          </div>
        )}

        <div className="w-full space-y-5 mt-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-primary/80">Nombre de Usuario</label>
            <input
              type="email"
              placeholder="Ej: usuario1@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex h-11 w-full rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-primary/80">Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="flex h-11 w-full rounded-md border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary disabled:cursor-not-allowed disabled:opacity-50"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-secondary hover:bg-secondary/90 text-white font-medium rounded-md mt-2 transition-colors"
          >
            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
          </Button>
        </div>

        <div className="mt-8 text-xs text-muted-foreground/60 tracking-widest uppercase font-medium">
          INTERNAL SYSTEMS ONLY
        </div>
      </form>
    </div>
  )
}
