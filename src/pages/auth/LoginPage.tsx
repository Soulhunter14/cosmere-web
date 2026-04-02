import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Input, ErrorMessage } from '../../components/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [pwVisible, setPwVisible] = useState(false)

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => authApi.login({ username: username.toLowerCase(), password }),
    onSuccess: (data) => {
      setAuth(data.token, data.user)
      navigate('/campaigns')
    },
  })

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
      padding: '24px 16px',
    }}>

      {/* Ambient glows */}
      <div style={{
        position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
        width: 700, height: 500, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(124,58,237,0.18) 0%, transparent 65%)',
        filter: 'blur(2px)',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '10%',
        width: 400, height: 350, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', bottom: '20%', right: '5%',
        width: 300, height: 300, pointerEvents: 'none',
        background: 'radial-gradient(ellipse, rgba(167,139,250,0.07) 0%, transparent 70%)',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 10 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', width: 68, height: 68, borderRadius: 22,
            alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
            boxShadow: '0 8px 40px rgba(124,58,237,0.45), 0 0 0 1px rgba(124,58,237,0.3)',
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </div>
          <h1 style={{
            fontSize: 28, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1,
            background: 'linear-gradient(135deg, #c4b5fd, #e0d7ff)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: 6,
          }}>
            Cosmere RPG
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }}>
            Companion App
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--border-bright)',
          borderRadius: 24,
          padding: '32px 28px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.03)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 24, letterSpacing: '-0.02em' }}>
            Iniciar sesión
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Username */}
            <div>
              <label style={{
                display: 'block', fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--text-subtle)', marginBottom: 8,
              }}>
                Usuario
              </label>
              <Input
                placeholder="tu_usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase())}
                onKeyDown={(e) => e.key === 'Enter' && mutate()}
                autoComplete="username"
                autoCapitalize="none"
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block', fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                color: 'var(--text-subtle)', marginBottom: 8,
              }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <Input
                  type={pwVisible ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && mutate()}
                  autoComplete="current-password"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setPwVisible((v) => !v)}
                  style={{
                    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-subtle)', padding: 4, display: 'flex', alignItems: 'center',
                  }}
                >
                  {pwVisible ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <ErrorMessage message="Usuario o contraseña incorrectos." />}

            {/* Submit */}
            <button
              onClick={() => mutate()}
              disabled={isPending || !username || !password}
              style={{
                marginTop: 4,
                width: '100%', padding: '13px',
                background: isPending || !username || !password
                  ? 'rgba(124,58,237,0.4)'
                  : 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                color: 'white', border: 'none', borderRadius: 12,
                fontSize: 15, fontWeight: 700, cursor: isPending || !username || !password ? 'not-allowed' : 'pointer',
                boxShadow: isPending || !username || !password ? 'none' : '0 4px 20px rgba(124,58,237,0.4)',
                transition: 'opacity 0.15s, box-shadow 0.15s',
                letterSpacing: '-0.01em',
              }}
            >
              {isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
