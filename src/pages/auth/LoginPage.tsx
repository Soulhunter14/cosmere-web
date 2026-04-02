import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Button, Input, ErrorMessage } from '../../components/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authApi.login({ username, password }),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      navigate('/campaigns')
    },
  })

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Ambient glows */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
          filter: 'blur(1px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '-10%',
          left: '20%',
          width: '400px',
          height: '300px',
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm px-4 relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{
              background: 'linear-gradient(135deg, #b4befe, #cba6f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Cosmere RPG
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Companion App
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{
            background: 'var(--surface-1)',
            border: '1px solid var(--border-bright)',
            boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          }}
        >
          <h2 className="text-base font-semibold mb-5" style={{ color: 'var(--text)' }}>
            Iniciar sesión
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-subtle)' }}
              >
                Usuario
              </label>
              <Input
                placeholder="tu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div>
              <label
                className="block text-[10px] font-bold uppercase tracking-widest mb-2"
                style={{ color: 'var(--text-subtle)' }}
              >
                Contraseña
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && mutate()}
                autoComplete="current-password"
              />
            </div>

            {error && <ErrorMessage message="Usuario o contraseña incorrectos." />}

            <Button
              className="w-full justify-center mt-1"
              onClick={() => mutate()}
              disabled={isPending || !username || !password}
              size="lg"
            >
              {isPending ? 'Entrando...' : 'Entrar'}
            </Button>
          </div>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--text-muted)' }}>
            ¿No tienes cuenta?{' '}
            <Link
              to="/register"
              className="font-medium transition-colors"
              style={{ color: 'var(--brand-light)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--brand-light)')}
            >
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
