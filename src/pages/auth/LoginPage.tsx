import { useState, type CSSProperties, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Eye, EyeOff } from 'lucide-react'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'
import { Button, ErrorMessage, Field, IconButton, Input, Label, SectionTitle } from '../../components/ui'
import { BrandGlyph } from '../../components/BrandMark'
import { CosmereIcon } from '../../components/CosmereIcon'
import { c, card, eyebrow, fs, radius, shadow, titleText } from '../../theme'

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

  const disabled = isPending || !username || !password

  return (
    <AuthShell>
      <SectionTitle>Iniciar sesión</SectionTitle>

      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          if (!disabled) mutate()
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 6 }}
      >
        <Field label="Usuario">
          <Input
            id="login-username"
            name="username"
            placeholder="tu_usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
          />
        </Field>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Label htmlFor="login-password">Contraseña</Label>
          <div style={{ position: 'relative' }}>
            <Input
              id="login-password"
              name="password"
              type={pwVisible ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              style={{ paddingRight: 52 }}
            />
            <IconButton
              label={pwVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={pwVisible}
              aria-controls="login-password"
              size={40}
              onClick={() => setPwVisible((v) => !v)}
              style={passwordToggle}
            >
              {pwVisible ? <EyeOff size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
            </IconButton>
          </div>
        </div>

        {error && <ErrorMessage message="Usuario o contraseña incorrectos." />}

        <Button type="submit" size="lg" fullWidth disabled={disabled} aria-busy={isPending || undefined} style={{ marginTop: 4 }}>
          {isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </AuthShell>
  )
}

/* ─── Local shell shared in spirit with RegisterPage (candidate for a shared AuthShell) ─── */

const passwordToggle: CSSProperties = { position: 'absolute', right: 2, top: '50%', transform: 'translateY(-50%)' }

function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'calc(32px + var(--sat)) calc(16px + var(--sar)) calc(32px + var(--sab)) calc(16px + var(--sal))',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ width: '100%', maxWidth: 400, position: 'relative' }}>
        <header className="rise" style={{ textAlign: 'center', marginBottom: 28 }}>
          <AuthEmblem />
          <h1 style={{ ...titleText, fontSize: fs['3xl'], color: c.text, letterSpacing: '0.08em' }}>Cosmere RPG</h1>
          <OrnamentRule />
          <p style={{ ...eyebrow, color: c.gold, marginTop: 10 }}>Compañero de mesa</p>
        </header>

        <div
          className="rise"
          style={{ ...card, '--i': 1, borderRadius: radius.xl, boxShadow: shadow[2], padding: '24px 22px 26px' } as CSSProperties}
        >
          {children}
        </div>
      </div>
    </main>
  )
}

/** Official Cosmere emblem inside the gold chapter medallion, with a soft Stormlight halo */
function AuthEmblem() {
  return (
    <div
      aria-hidden
      style={{ position: 'relative', width: 116, height: 116, margin: '0 auto 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <span style={{ position: 'absolute', inset: -36, borderRadius: '50%', background: 'radial-gradient(closest-side, var(--brand-glow), transparent)' }} />
      <CosmereIcon name="ornamento-medallon" size={116} square style={{ position: 'absolute', inset: 0, color: 'var(--gold-ornament)' }} />
      <BrandGlyph size={60} />
    </div>
  )
}

/** Gold hairline with the official rhombus at its centre */
function OrnamentRule() {
  return (
    <div aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 }}>
      <span style={{ width: 64, height: 1, background: 'linear-gradient(90deg, transparent, var(--gold-ornament))' }} />
      <CosmereIcon name="ornamento-rombo" size={8} square style={{ color: 'var(--gold-ornament)' }} />
      <span style={{ width: 64, height: 1, background: 'linear-gradient(90deg, var(--gold-ornament), transparent)' }} />
    </div>
  )
}
