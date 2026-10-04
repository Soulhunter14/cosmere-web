import { useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, LogIn, Trash2, ArrowRight, LogOut, CalendarDays, TriangleAlert, X } from 'lucide-react'
import { campaignsApi } from '../../api/campaigns'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { Button, ConfirmDialog, ErrorMessage, Field, IconButton, Input, PageHeader, Segmented, Sheet, Spinner } from '../../components/ui'
import { BrandGlyph, BrandMark } from '../../components/BrandMark'
import { CosmereIcon } from '../../components/CosmereIcon'
import { WorldBadge } from '../../components/WorldBadge'
import { WORLDS } from '../../worlds'
import type { Era, WorldId } from '../../types'
import { characterHeroBackground, characterPalette } from '../../lib/avatar'
import { heroPill, onGem } from '../../lib/hero'
import bandaUrl from '../../assets/cosmere/ornamento-banda.svg?url'
import { buttonReset, c, card, eyebrow, font, fs, radius, shadow, tint, titleText, tone } from '../../theme'

// ─── Inline form component (joining with an invite code) ──────────────────────
function InlineForm({
  id,
  title,
  placeholder,
  value,
  onChange,
  onSubmit,
  onClose,
  submitLabel,
  isPending,
  error,
  mono = false,
}: {
  id: string
  title: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  onSubmit: () => void
  onClose: () => void
  submitLabel: string
  isPending: boolean
  error: boolean
  /** Monospaced, tracked input (invite codes) */
  mono?: boolean
}) {
  const titleId = `${id}-title`
  const inputId = `${id}-input`
  const canSubmit = !!value.trim() && !isPending
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      className="pop-in"
      style={{ ...card, borderColor: 'var(--border-bright)', boxShadow: shadow[2], padding: '14px 16px 18px', marginBottom: 24 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
        <h2 id={titleId} style={{ fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>
          {title}
        </h2>
        <IconButton label="Cerrar" size={40} onClick={onClose} style={{ marginRight: -8 }}>
          <X size={18} aria-hidden />
        </IconButton>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) onSubmit()
        }}
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
      >
        <label htmlFor={inputId} className="sr-only">{title}</label>
        <Input
          id={inputId}
          placeholder={placeholder}
          value={value}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: '1 1 220px',
            minWidth: 0,
            ...(mono ? { fontFamily: font.mono, letterSpacing: '0.12em' } : null),
          }}
        />
        <Button type="submit" disabled={!canSubmit} style={{ flex: '0 0 auto', minWidth: 96 }}>
          {isPending ? '...' : submitLabel}
        </Button>
      </form>

      {error && <ErrorMessage message="Algo salió mal. Inténtalo de nuevo." style={{ marginTop: 12 }} />}
    </section>
  )
}

// ─── Official chapter frieze (ornamento-banda, tiled) ─────────────────────────
/* Mask layers only use alpha: the gradient fades both ends of the frieze */
const fadeEdges = 'linear-gradient(90deg, transparent, var(--text) 18%, var(--text) 82%, transparent)'
const bandMask: CSSProperties = {
  height: 18,
  /* Official gold on ink; leaning to antique gold on paper so the frieze stays visible there */
  backgroundColor: 'color-mix(in srgb, var(--gold-ornament) 55%, var(--gold))',
  opacity: 0.5,
  WebkitMaskImage: `url(${bandaUrl}), ${fadeEdges}`,
  maskImage: `url(${bandaUrl}), ${fadeEdges}`,
  WebkitMaskRepeat: 'repeat-x, no-repeat',
  maskRepeat: 'repeat-x, no-repeat',
  WebkitMaskSize: 'auto 100%, 100% 100%',
  maskSize: 'auto 100%, 100% 100%',
  WebkitMaskPosition: 'center',
  maskPosition: 'center',
  WebkitMaskComposite: 'source-in',
  maskComposite: 'intersect',
}

// ─── «Nueva campaña»: name, setting and (where the setting has eras) era ──────
/* The settings offered come from the registry, so a new world shows up here on its own (P8): no world or era literals */
const WORLD_LIST = Object.values(WORLDS)

function CreateCampaignSheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const setCurrentCampaign = useCampaignStore((s) => s.setCurrentCampaign)
  const [name, setName] = useState('')
  const [world, setWorld] = useState<WorldId>(WORLD_LIST[0].id)
  const [era, setEra] = useState<Era | null>(null)
  const cfg = WORLDS[world]
  const eraDef = cfg.eras?.find((e) => e.id === era)
  const formId = 'campaign-create-form'

  const createMutation = useMutation({
    mutationFn: () => campaignsApi.create({ name: name.trim(), world, era: cfg.eras ? era : null }),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ['campaigns'] })
      setCurrentCampaign(campaign)
      navigate(`/campaigns/${campaign.id}/home`)
    },
  })

  // Where the world has eras the era is required; world and era are fixed once the campaign exists
  const canSubmit = !!name.trim() && !(cfg.eras && !era) && !createMutation.isPending

  const chooseWorld = (id: WorldId) => {
    if (id === world) return
    setWorld(id)
    setEra(null)
  }

  return (
    <Sheet
      open
      onClose={() => { if (!createMutation.isPending) onClose() }}
      title="Nueva campaña"
      maxWidth={480}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} size="lg" style={{ flex: 2 }} disabled={!canSubmit} loading={createMutation.isPending}>
            Crear campaña
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault()
          if (canSubmit) createMutation.mutate()
        }}
        style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        <Field label="Nombre de la campaña">
          <Input
            data-autofocus
            placeholder="El nombre de tu campaña..."
            value={name}
            autoComplete="off"
            spellCheck={false}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <div>
          <p style={{ ...eyebrow, marginBottom: 8 }}>Ambientación</p>
          <Segmented<WorldId>
            ariaLabel="Ambientación"
            value={world}
            onChange={chooseWorld}
            options={WORLD_LIST.map((w) => ({
              value: w.id,
              label: (
                <>
                  <CosmereIcon name={w.emblema} size={16} />
                  {w.nombreCorto}
                </>
              ),
              ariaLabel: w.nombre,
            }))}
          />
          {/* Preview of the choice: announced when the setting (or its era) changes */}
          <div
            aria-live="polite"
            style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 12, padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}
          >
            <span
              aria-hidden
              style={{
                width: 56, height: 56, flexShrink: 0, borderRadius: radius.md,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: tone.brand.bg, border: `1px solid ${tone.brand.border}`, color: c.brandLight,
              }}
            >
              <CosmereIcon name={cfg.emblema} size={40} />
            </span>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>{cfg.nombre}</p>
              <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2 }}>
                Ambientada en {cfg.planeta}
                {eraDef && ` · ${eraDef.label}`}
              </p>
            </div>
          </div>
        </div>

        {cfg.eras && (
          <div>
            <p style={{ ...eyebrow, marginBottom: 8 }}>Era</p>
            <Segmented<Era | ''>
              ariaLabel="Era"
              value={era ?? ''}
              onChange={(v) => { if (v) setEra(v) }}
              options={cfg.eras.map((e) => ({
                value: e.id,
                label: (
                  <>
                    <span aria-hidden style={{ width: 8, height: 8, flexShrink: 0, borderRadius: '50%', background: e.tone.fg }} />
                    {e.label}
                  </>
                ),
              }))}
            />
            <p aria-live="polite" style={{ fontSize: fs.xs, color: c.subtle, marginTop: 8, lineHeight: 1.45 }}>
              {eraDef ? eraDef.aviso : 'Elige la era para poder crear la campaña.'}
            </p>
          </div>
        )}

        <div
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px',
            borderRadius: radius.md, background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`,
          }}
        >
          <TriangleAlert size={17} aria-hidden style={{ color: tone.topacio.fg, marginTop: 1, flexShrink: 0 }} />
          <p style={{ fontSize: fs.sm + 1, color: tone.topacio.fg, lineHeight: 1.4 }}>
            La ambientación y la era no se pueden cambiar después de crear la campaña.
          </p>
        </div>

        {createMutation.isError && <ErrorMessage message="Algo salió mal. Inténtalo de nuevo." />}
      </form>
    </Sheet>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export function CampaignListPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const setCurrentCampaign = useCampaignStore((s) => s.setCurrentCampaign)
  const { logout } = useAuthStore()

  const [joinCode, setJoinCode] = useState('')
  // Joining stays an inline form; creating opens the «Nueva campaña» sheet (setting and era need room)
  const [mode, setMode] = useState<'join' | null>(null)
  const [creating, setCreating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: number | null; name: string }>({ open: false, id: null, name: '' })
  const [openingId, setOpeningId] = useState<number | null>(null)

  const { data: campaigns, isLoading, error } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.getAll,
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
    setOpeningId(id)
    try {
      const detail = await campaignsApi.getById(id)
      setCurrentCampaign(detail)
      navigate(`/campaigns/${id}/home`)
    } finally {
      setOpeningId(null)
    }
  }

  const subtitle = isLoading
    ? 'Cargando...'
    : campaigns?.length
    ? `${campaigns.length} campaña${campaigns.length !== 1 ? 's' : ''} · selecciona para continuar`
    : 'Crea tu primera campaña para empezar'

  return (
    <div style={{ minHeight: '100dvh' }}>
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          padding:
            'calc(clamp(12px, 3vw, 32px) + var(--sat)) calc(clamp(16px, 3vw, 32px) + var(--sar)) calc(56px + var(--sab)) calc(clamp(16px, 3vw, 32px) + var(--sal))',
        }}
      >
        {/* ── Top bar ──────────────────────────────────── */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 }}>
          <BrandMark size={24} subtitle="RPG" />
          <IconButton label="Cerrar sesión" variant="danger" size={44} onClick={() => { logout(); navigate('/login') }}>
            <LogOut size={19} aria-hidden />
          </IconButton>
        </header>

        <div aria-hidden style={{ ...bandMask, margin: '14px 0 28px' }} />

        <main id="main">
          {/* ── Page heading ─────────────────────────────── */}
          <PageHeader
            title="Mis campañas"
            subtitle={subtitle}
            actions={
              <>
                <Button
                  variant="secondary"
                  icon={<LogIn size={16} aria-hidden />}
                  aria-expanded={mode === 'join'}
                  aria-controls={mode === 'join' ? 'campaign-join-form' : undefined}
                  onClick={() => setMode(mode === 'join' ? null : 'join')}
                  /* Full `border` shorthand: overriding only borderColor would wipe the variant's colour when it is removed */
                  style={mode === 'join' ? { background: 'var(--brand-bg)', border: '1px solid var(--brand-border)', color: c.brandLight } : undefined}
                >
                  Unirse
                </Button>
                <Button
                  icon={<Plus size={16} aria-hidden />}
                  aria-haspopup="dialog"
                  onClick={() => { setMode(null); setCreating(true) }}
                >
                  Nueva campaña
                </Button>
              </>
            }
          />

          {/* ── Join form (creating opens the sheet below) ── */}
          {mode === 'join' && (
            <InlineForm
              id="campaign-join-form"
              title="Unirse con código de invitación"
              placeholder="Código (ej: XK9P2M)"
              value={joinCode}
              onChange={(v) => setJoinCode(v.toUpperCase())}
              onSubmit={() => joinMutation.mutate()}
              onClose={() => { setMode(null); setJoinCode('') }}
              submitLabel="Unirse"
              isPending={joinMutation.isPending}
              error={!!joinMutation.error}
              mono
            />
          )}

          {error && <ErrorMessage message="Error al cargar las campañas." style={{ marginBottom: 24 }} />}

          {/* ── Content ──────────────────────────────────── */}
          {isLoading ? (
            <Spinner />
          ) : campaigns?.length === 0 ? (
            <section
              aria-labelledby="campaigns-empty-title"
              className="rise"
              style={{
                border: `1px dashed ${c.borderBright}`,
                borderRadius: radius.xl,
                padding: '48px 24px',
                textAlign: 'center',
                background: 'color-mix(in srgb, var(--surface-1) 70%, transparent)',
              }}
            >
              <div
                aria-hidden
                style={{
                  width: 64, height: 64, margin: '0 auto 16px', borderRadius: radius.md,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--brand-bg)', border: '1px solid var(--brand-border)',
                }}
              >
                <BrandGlyph size={34} glow={false} />
              </div>
              <h2 id="campaigns-empty-title" style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, color: c.text }}>
                Sin campañas todavía
              </h2>
              <p style={{ fontSize: fs.sm + 1, color: c.muted, maxWidth: 340, margin: '8px auto 24px' }}>
                Crea tu primera campaña o únete a una existente con un código de invitación.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button variant="secondary" icon={<LogIn size={16} aria-hidden />} onClick={() => setMode('join')}>
                  Unirse con código
                </Button>
                <Button icon={<Plus size={16} aria-hidden />} aria-haspopup="dialog" onClick={() => { setMode(null); setCreating(true) }}>
                  Nueva campaña
                </Button>
              </div>
            </section>
          ) : (
            <ul
              role="list"
              aria-label="Campañas"
              style={{
                listStyle: 'none',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))',
                gap: 16,
              }}
            >
              {(campaigns ?? []).map((cmp, i) => (
                <CampaignCard
                  key={cmp.id}
                  id={cmp.id}
                  index={i}
                  name={cmp.name}
                  role={cmp.role}
                  world={cmp.world}
                  era={cmp.era}
                  createdAt={cmp.createdAt}
                  nextSessionDate={cmp.nextSessionDate}
                  nextSessionTitle={cmp.nextSessionTitle}
                  opening={openingId === cmp.id}
                  onOpen={() => openCampaign(cmp.id)}
                  onDelete={cmp.role === 'gm' ? () => setConfirmDelete({ open: true, id: cmp.id, name: cmp.name }) : undefined}
                />
              ))}
            </ul>
          )}
        </main>
      </div>

      {/* Mounted only while open: its fields and its mutation start from scratch every time */}
      {creating && <CreateCampaignSheet onClose={() => setCreating(false)} />}

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
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/* Role dot on the (always deep) cover gradient: the role tone, lifted to a fixed lightness so it glows in both themes */
const roleDot = (token: string) => `oklch(from var(${token}) 0.8 c h)`

function CampaignCard({
  id,
  index,
  name,
  role,
  world,
  era,
  createdAt,
  nextSessionDate,
  nextSessionTitle,
  opening,
  onOpen,
  onDelete,
}: {
  id: number
  index: number
  name: string
  role: string
  world: WorldId
  era: Era | null
  createdAt: string
  nextSessionDate?: string
  nextSessionTitle?: string
  opening: boolean
  onOpen: () => void
  onDelete?: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const isGm = role === 'gm'
  const titleId = `campaign-${id}-title`
  const chipsId = `campaign-${id}-chips`
  const metaId = `campaign-${id}-meta`
  const accent = characterPalette(id).accent
  const dot = roleDot(isGm ? '--rubi' : '--brand')

  return (
    <li
      className="rise"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        '--i': index,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: radius.lg + 2,
        overflow: 'hidden',
        background: c.s1,
        border: `1px solid ${hovered ? c.borderStrong : c.border}`,
        boxShadow: hovered ? `0 22px 44px -20px ${tint(accent, 60)}, ${shadow[2]}` : shadow[1],
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'transform var(--dur-2) var(--ease-out), box-shadow var(--dur-2), border-color var(--dur-2)',
      } as CSSProperties}
    >
      {/* ── Cover art (deep gemstone gradient: white text is ≥ 10:1 on it) ── */}
      <div style={{ position: 'relative', height: 168, background: characterHeroBackground(id), color: onGem, overflow: 'hidden' }}>
        <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', backgroundImage: GRAIN }} />

        {/* Watermark initial */}
        <span
          aria-hidden
          style={{
            ...titleText,
            position: 'absolute', right: 14, top: -6,
            fontSize: 136, lineHeight: 1, opacity: 0.1,
            userSelect: 'none', pointerEvents: 'none',
          }}
        >
          {name.charAt(0).toUpperCase()}
        </span>

        {/* Chips: role, world and (where the world has eras) era */}
        <div id={chipsId} style={{ position: 'absolute', top: 14, left: 14, right: 14, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <span style={{ ...heroPill, textTransform: 'uppercase', letterSpacing: '0.08em', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}` }} />
            {isGm ? 'Director' : 'Jugador'}
          </span>
          <WorldBadge variant="hero" world={world} era={era} />
        </div>

        {/* Title */}
        <h2
          id={titleId}
          style={{
            ...titleText,
            position: 'absolute', left: 16, right: 16, bottom: 14,
            fontSize: fs.xl, color: onGem,
            overflowWrap: 'anywhere',
          }}
        >
          {name}
        </h2>
      </div>

      {/* Stretched primary action: the whole card opens the campaign */}
      <button
        type="button"
        onClick={onOpen}
        aria-labelledby={titleId}
        aria-describedby={`${chipsId} ${metaId}`}
        aria-busy={opening || undefined}
        style={{ ...buttonReset, position: 'absolute', inset: 0, zIndex: 1, borderRadius: 'inherit', outlineOffset: -3 }}
      />

      {/* ── Footer ──────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 56, padding: '6px 8px 6px 16px', borderTop: `1px solid ${c.border}` }}>
        <p id={metaId} style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted }}>
          {nextSessionDate ? (
            <>
              <CalendarDays size={15} aria-hidden style={{ color: tone.esmeralda.fg }} />
              <span className="sr-only">Próxima sesión: </span>
              <span style={{ color: tone.esmeralda.fg, fontWeight: 650, whiteSpace: 'nowrap' }}>
                {new Date(nextSessionDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
              {nextSessionTitle && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', minWidth: 0 }}>
                  · {nextSessionTitle}
                </span>
              )}
            </>
          ) : (
            <>
              <span className="sr-only">Creada: </span>
              <span style={{ whiteSpace: 'nowrap', color: c.subtle }}>
                {new Date(createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </>
          )}
        </p>

        {onDelete && (
          <IconButton
            label={`Eliminar ${name}`}
            variant="danger"
            size={40}
            onClick={(e) => { e.stopPropagation(); onDelete() }}
            style={{ position: 'relative', zIndex: 2 }}
          >
            <Trash2 size={17} aria-hidden />
          </IconButton>
        )}

        <span
          aria-hidden
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 4, paddingRight: 8,
            fontSize: fs.sm, fontWeight: 650,
            color: hovered ? c.brandLight : c.muted,
            transition: 'color var(--dur-1)',
          }}
        >
          Abrir
          {opening ? (
            <span style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--brand-bg)', borderTopColor: 'var(--brand)', animation: 'spin 0.8s linear infinite' }} />
          ) : (
            <ArrowRight size={15} style={{ transform: hovered ? 'translateX(3px)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }} />
          )}
        </span>
      </div>
    </li>
  )
}
