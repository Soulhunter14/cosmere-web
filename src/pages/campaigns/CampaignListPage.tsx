import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, LogIn, Trash2, ArrowRight, LogOut, CalendarDays } from 'lucide-react'
import { campaignsApi } from '../../api/campaigns'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { Input, Spinner, ErrorMessage, ConfirmDialog } from '../../components/ui'

// ─── Palette ───────────────────────────────────────────────────────────────────
const PALETTES = [
  { bg: 'linear-gradient(145deg,#5b21b6 0%,#1e40af 100%)', glow: 'rgba(91,33,182,0.45)' },
  { bg: 'linear-gradient(145deg,#1e40af 0%,#0e7490 100%)', glow: 'rgba(30,64,175,0.45)' },
  { bg: 'linear-gradient(145deg,#9d174d 0%,#6d28d9 100%)', glow: 'rgba(157,23,77,0.45)'  },
  { bg: 'linear-gradient(145deg,#92400e 0%,#991b1b 100%)', glow: 'rgba(146,64,14,0.45)'  },
  { bg: 'linear-gradient(145deg,#064e3b 0%,#1e3a8a 100%)', glow: 'rgba(6,78,59,0.45)'    },
  { bg: 'linear-gradient(145deg,#4c1d95 0%,#be185d 100%)', glow: 'rgba(76,29,149,0.45)'  },
]

// ─── Inline form component ────────────────────────────────────────────────────
function InlineForm({
  title,
  placeholder,
  value,
  onChange,
  onSubmit,
  onClose,
  submitLabel,
  isPending,
  error,
}: {
  title: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onClose: () => void
  submitLabel: string
  isPending: boolean
  error: boolean
}) {
  return (
    <div
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border-bright)',
        borderRadius: 18,
        padding: '20px 24px 24px',
        marginBottom: 28,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '-0.01em' }}>
          {title}
        </span>
        <button
          onClick={onClose}
          style={{
            color: 'var(--text-subtle)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <Input
          placeholder={placeholder}
          value={value}
          autoFocus
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && value.trim() && onSubmit()}
          style={{ flex: 1 }}
        />
        <button
          onClick={onSubmit}
          disabled={!value.trim() || isPending}
          style={{
            background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
            color: 'white',
            border: 'none',
            borderRadius: 12,
            padding: '0 20px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            opacity: !value.trim() || isPending ? 0.45 : 1,
            transition: 'opacity 0.15s, transform 0.1s',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
          }}
          onMouseEnter={(e) => { if (value.trim() && !isPending) e.currentTarget.style.transform = 'scale(1.02)' }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = '' }}
        >
          {isPending ? '...' : submitLabel}
        </button>
      </div>

      {error && <ErrorMessage message="Algo salió mal. Inténtalo de nuevo." className="mt-3" />}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function CampaignListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const setCurrentCampaign = useCampaignStore((s) => s.setCurrentCampaign)
  const { logout } = useAuthStore()

  const [newName, setNewName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [mode, setMode] = useState<'create' | 'join' | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: '' })

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.getAll,
  })

  const createMutation = useMutation({
    mutationFn: () => campaignsApi.create(newName),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      setCurrentCampaign(campaign)
      navigate(`/campaigns/${campaign.id}/characters`)
    },
  })

  const joinMutation = useMutation({
    mutationFn: () => campaignsApi.join(joinCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      setMode(null)
      setJoinCode('')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => campaignsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['campaigns'] }),
  })

  const openCampaign = async (id: number) => {
    const detail = await campaignsApi.getById(id)
    setCurrentCampaign(detail)
    navigate(`/campaigns/${id}/characters`)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Subtle ambient top glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: 400,
        background: 'radial-gradient(ellipse 80% 300px at 50% -60px, rgba(139,92,246,0.07), transparent)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: 'calc(40px + var(--sat)) calc(28px + var(--sar)) calc(80px + var(--sab)) calc(28px + var(--sal))', position: 'relative', zIndex: 1 }}>

        {/* ── Nav bar ──────────────────────────────────── */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 56 }}>
          {/* Wordmark */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
            <span style={{
              fontSize: 17, fontWeight: 800, letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg,#c4b5fd,#8b5cf6)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              Cosmere
            </span>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 500, letterSpacing: '0.01em' }}>
              RPG
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => setMode(mode === 'join' ? null : 'join')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: mode === 'join' ? 'var(--surface-2)' : 'transparent',
                border: '1px solid var(--border-bright)',
                color: 'var(--text-subtle)',
                borderRadius: 8, padding: '5px 12px',
                fontSize: 12, fontWeight: 500,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'var(--surface-1)' }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-subtle)'
                e.currentTarget.style.background = mode === 'join' ? 'var(--surface-2)' : 'transparent'
              }}
            >
              <LogIn size={11} />
              Unirse
            </button>

            <button
              onClick={() => setMode(mode === 'create' ? null : 'create')}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                color: 'white', border: 'none',
                borderRadius: 8, padding: '5px 14px',
                fontSize: 12, fontWeight: 600,
                cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
                boxShadow: '0 2px 10px rgba(139,92,246,0.35)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(139,92,246,0.45)' }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 10px rgba(139,92,246,0.35)' }}
            >
              <Plus size={11} />
              Nueva campaña
            </button>

            <button
              onClick={() => { logout(); navigate('/login') }}
              title="Cerrar sesión"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: '1px solid var(--border-bright)',
                color: 'var(--text-subtle)', borderRadius: 8,
                padding: '5px 8px', cursor: 'pointer', transition: 'color 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              <LogOut size={13} />
            </button>
          </div>
        </nav>

        {/* ── Page heading ─────────────────────────────── */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontSize: 34, fontWeight: 800, letterSpacing: '-0.04em',
            color: 'var(--text)', marginBottom: 6, lineHeight: 1.15,
          }}>
            Mis campañas
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            {isLoading
              ? 'Cargando...'
              : campaigns?.length
              ? `${campaigns.length} campaña${campaigns.length !== 1 ? 's' : ''} · selecciona para continuar`
              : 'Crea tu primera campaña para empezar'}
          </p>
        </div>

        {/* ── Inline forms ─────────────────────────────── */}
        {mode === 'create' && (
          <InlineForm
            title="Nueva campaña"
            placeholder="El nombre de tu campaña..."
            value={newName}
            onChange={setNewName}
            onSubmit={() => createMutation.mutate()}
            onClose={() => { setMode(null); setNewName('') }}
            submitLabel="Crear"
            isPending={createMutation.isPending}
            error={!!createMutation.error}
          />
        )}
        {mode === 'join' && (
          <InlineForm
            title="Unirse con código de invitación"
            placeholder="Código (ej: XK9P2M)"
            value={joinCode}
            onChange={(v) => setJoinCode(v.toUpperCase())}
            onSubmit={() => joinMutation.mutate()}
            onClose={() => { setMode(null); setJoinCode('') }}
            submitLabel="Unirse"
            isPending={joinMutation.isPending}
            error={!!joinMutation.error}
          />
        )}

        {error && <ErrorMessage message="Error al cargar las campañas." className="mb-6" />}

        {/* ── Content ──────────────────────────────────── */}
        {isLoading ? (
          <Spinner />
        ) : campaigns?.length === 0 ? (
          // Empty state
          <div style={{
            border: '1.5px dashed var(--border-bright)',
            borderRadius: 24,
            padding: '64px 32px',
            textAlign: 'center',
            background: 'var(--surface-1)',
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16, margin: '0 auto 20px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border-bright)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-subtle)' }}>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              Sin campañas todavía
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-subtle)', marginBottom: 28, maxWidth: 320, margin: '0 auto 28px' }}>
              Crea tu primera campaña o únete a una existente con un código de invitación.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={() => setMode('join')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
                  color: 'var(--text-muted)', borderRadius: 12, padding: '9px 18px',
                  fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'color 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              >
                <LogIn size={13} /> Unirse con código
              </button>
              <button
                onClick={() => setMode('create')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
                  color: 'white', border: 'none', borderRadius: 12, padding: '9px 20px',
                  fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(139,92,246,0.3)',
                }}
              >
                <Plus size={13} /> Nueva campaña
              </button>
            </div>
          </div>
        ) : (
          // Campaign grid
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 18,
          }}>
            {campaigns.map((c) => {
              const pal = PALETTES[c.id % PALETTES.length]
              return (
                <CampaignCard
                  key={c.id}
                  name={c.name}
                  role={c.role}
                  createdAt={c.createdAt}
                  gradient={pal.bg}
                  glow={pal.glow}
                  nextSessionDate={c.nextSessionDate}
                  nextSessionTitle={c.nextSessionTitle}
                  onOpen={() => openCampaign(c.id)}
                  onDelete={c.role === 'gm' ? () => setConfirmDelete({ open: true, id: c.id, name: c.name }) : undefined}
                />
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmDelete.open}
        title={`¿Eliminar "${confirmDelete.name}"?`}
        message="Se eliminarán todos los personajes, sesiones y misiones de esta campaña."
        onConfirm={() => { deleteMutation.mutate(confirmDelete.id!); setConfirmDelete({ open: false, id: null, name: '' }) }}
        onCancel={() => setConfirmDelete({ open: false, id: null, name: '' })}
      />
    </div>
  )
}

// ─── Campaign card ────────────────────────────────────────────────────────────
function CampaignCard({
  name,
  role,
  createdAt,
  gradient,
  glow,
  nextSessionDate,
  nextSessionTitle,
  onOpen,
  onDelete,
}: {
  name: string
  role: string
  createdAt: string
  gradient: string
  glow: string
  nextSessionDate?: string
  nextSessionTitle?: string
  onOpen: () => void
  onDelete?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isGm = role === 'gm'

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        background: 'var(--surface-1)',
        transition: 'transform 0.2s cubic-bezier(.22,.68,0,1.2), box-shadow 0.2s ease, border-color 0.2s ease',
        transform: hovered ? 'translateY(-5px) scale(1.01)' : 'translateY(0) scale(1)',
        boxShadow: hovered ? `0 24px 56px -8px ${glow}, 0 0 0 1px var(--border-bright)` : 'none',
        borderColor: hovered ? 'var(--border-bright)' : 'var(--border)',
      }}
    >
      {/* ── Cover art ──────────────────────────────────── */}
      <div style={{ position: 'relative', height: 188, background: gradient, overflow: 'hidden' }}>

        {/* Noise texture overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.15, mixBlendMode: 'overlay',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />

        {/* Watermark letter — centered, subtle */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 120, fontWeight: 900, lineHeight: 1,
          color: 'rgba(255,255,255,0.08)', letterSpacing: '-0.04em',
          userSelect: 'none', pointerEvents: 'none',
        }}>
          {name[0].toUpperCase()}
        </div>

        {/* Role chip — top left */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 20, padding: '4px 10px',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: isGm ? '#fbbf24' : '#a78bfa',
            boxShadow: isGm ? '0 0 8px rgba(251,191,36,0.8)' : '0 0 8px rgba(167,139,250,0.8)',
            flexShrink: 0,
          }} />
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'white',
            letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            {isGm ? 'Game Master' : 'Jugador'}
          </span>
        </div>

        {/* Bottom gradient + title */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)',
          padding: '52px 16px 16px',
        }}>
          <h3 style={{
            color: 'white', fontSize: 18, fontWeight: 700,
            letterSpacing: '-0.025em', lineHeight: 1.25,
            textShadow: '0 2px 8px rgba(0,0,0,0.4)',
          }}>
            {name}
          </h3>
        </div>

        {/* Hover shimmer */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04), transparent 60%)',
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.2s',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ── Footer ──────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 16px',
        borderTop: '1px solid var(--border)',
      }}>
        {nextSessionDate ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
            <CalendarDays size={11} style={{ color: '#86efac', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#86efac', fontWeight: 600, whiteSpace: 'nowrap' }}>
              {new Date(nextSessionDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
            </span>
            {nextSessionTitle && (
              <span style={{ fontSize: 11, color: 'var(--text-subtle)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                · {nextSessionTitle}
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-subtle)', fontWeight: 500 }}>
            {new Date(createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete() }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-subtle)', padding: '4px 6px', borderRadius: 8,
                opacity: hovered ? 1 : 0.4,
                transition: 'opacity 0.15s, color 0.15s',
                display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              <Trash2 size={13} />
            </button>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 500,
            color: hovered ? 'var(--brand-light)' : 'var(--text-subtle)',
            transition: 'color 0.15s',
          }}>
            Abrir
            <ArrowRight
              size={13}
              style={{
                transform: hovered ? 'translateX(3px)' : 'translateX(0)',
                transition: 'transform 0.2s cubic-bezier(.22,.68,0,1.2)',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
