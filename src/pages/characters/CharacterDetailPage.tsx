import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  AudioWaveform, Check, ChevronDown, Info, Pencil, Save, Sparkle, Swords, TriangleAlert, UserRound, X, Zap,
} from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import {
  Button, Card, ConfirmDialog, IconButton, Input, SectionTitle, Select, Sheet, Spinner, TabPanel, Tabs, Textarea,
} from '../../components/ui'
import type { Character, StatDesglose, UpdateCharacterRequest } from '../../types'
import type { HabilidadDef } from '../../worlds/types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { POTENCIAS } from '../../data/potencias'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'
import { CharacterHero } from '../../components/CharacterHero'
import { CosmereIcon } from '../../components/CosmereIcon'
import { HeroicPathIcon, SurgeIcon } from '../../components/GameIcons'
import { heroButton, heroPill, onGemSoft } from '../../lib/hero'
import { StatIcons } from '../../lib/gameIcons'
import { hasCosmereIcon } from '../../lib/cosmereAssets'
import {
  buttonReset, c, eyebrow, font, fs, numeral, pill, radius, shadow, titleText, tone, toneFrom, type Tone,
} from '../../theme'
import {
  getFormaActiva, withFormaActiva, getFormasDisponibles,
  CANTOR_COLOR, FORMA_ACTIVA_PREFIX,
  type FormaBonusKey, type FormaBonusMap,
} from '../../data/cantores'

/* ─── Typed field access (the sheet reads many fields by computed key) ─── */
type FieldBag = Record<string, unknown>
const numField = (o: object | null | undefined, k: string): number => ((o as FieldBag | null | undefined)?.[k] as number | undefined) ?? 0
const strField = (o: object | null | undefined, k: string): string => (o as FieldBag | null | undefined)?.[k] as string

/* ─── Styling on top of the CharacterHero gradient (white text is ≥ 7:1 there) ─── */
const HERO_TEXT = heroPill.color as string
const HERO_SOFT = onGemSoft
/** Gold ornament focus ring: the global brand ring is too dark on the deep gradient in the paper theme */
const heroFocus: CSSProperties = { outlineColor: 'var(--gold-ornament)' }
const heroAction: CSSProperties = { ...heroButton, ...heroFocus, minHeight: 44, padding: '0 16px', fontSize: fs.sm + 1 }

/** Input on the hero gradient: same field, but its focus ring is gold so it stays visible on the deep gradient */
function HeroInput({ style, onFocus, onBlur, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  const [focused, setFocused] = useState(false)
  return (
    <Input
      {...props}
      onFocus={(e) => { setFocused(true); onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); onBlur?.(e) }}
      style={{
        ...style,
        ...(focused ? { borderColor: 'var(--gold-ornament)', boxShadow: '0 0 0 2px var(--gold-ornament)' } : null),
      }}
    />
  )
}

/** 0 below 640px, `px` from 640px: rounded, detached hero on tablet/desktop, full-bleed on phones */
const fromTablet = (px: number) => `clamp(0px, calc((100vw - 640px) * 999), ${px}px)`

/** Responsive grids without media queries */
const GRID_3_OR_1 = 'repeat(auto-fit, minmax(max(200px, calc((100% - 16px) / 3)), 1fr))'
const GRID_3_OR_2 = 'repeat(auto-fit, minmax(max(148px, calc((100% - 16px) / 3)), 1fr))'

const tile: CSSProperties = {
  background: c.s1,
  border: `1px solid ${c.border}`,
  borderRadius: radius.md,
  boxShadow: shadow[1],
  minWidth: 0,
}

const FORMA_TONE = toneFrom(CANTOR_COLOR)

/* ─── Local primitives ──────────────────────────────────────────────────── */

interface PickerOption { id: string; label: string; sublabel?: string; tone: Tone; icon?: ReactNode }

/** Single-choice picker in the shared Sheet (bottom sheet on phones, dialog from 640px) */
function OptionPicker({ open, title, description, options, value, onChange, onClose }: {
  open: boolean
  title: string
  description?: string
  options: PickerOption[]
  value: string
  onChange: (id: string) => void
  onClose: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title={title} description={description} maxWidth={480}>
      <IconButton label="Cerrar" size={44} onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <X size={20} aria-hidden />
      </IconButton>
      {/* The Sheet has no footer here, so the list itself clears the home indicator (safe area) */}
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 'var(--sab)' }}>
        <li>
          <PickerRow
            label="— Sin selección —"
            selected={value === ''}
            t={tone.cuarzo}
            muted
            onClick={() => { onChange(''); onClose() }}
          />
        </li>
        {options.map((opt) => (
          <li key={opt.id}>
            <PickerRow
              label={opt.label}
              sublabel={opt.sublabel}
              icon={opt.icon}
              selected={value === opt.id}
              t={opt.tone}
              onClick={() => { onChange(opt.id); onClose() }}
            />
          </li>
        ))}
      </ul>
    </Sheet>
  )
}

function PickerRow({ label, sublabel, icon, selected, t, muted, onClick }: {
  label: string
  sublabel?: string
  icon?: ReactNode
  selected: boolean
  t: Tone
  muted?: boolean
  onClick: () => void
}) {
  // The sheet focuses the selected option on open (data-autofocus, without scrolling). Bring it into view
  // inside the sheet's own scroll area only, so the page behind the overlay never moves.
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!selected || !el) return
    let scroller = el.parentElement
    while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) scroller = scroller.parentElement
    if (!scroller) return
    const top = el.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    if (top < 0 || top + el.offsetHeight > scroller.clientHeight) {
      scroller.scrollTop += top - (scroller.clientHeight - el.offsetHeight) / 2
    }
  }, [selected])
  return (
    <button
      ref={ref}
      type="button"
      aria-pressed={selected}
      data-autofocus={selected || undefined}
      onClick={onClick}
      className="ui-card ui-card--interactive"
      style={{
        ...buttonReset,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        minHeight: 56,
        padding: '10px 14px',
        borderRadius: radius.md,
        background: selected ? t.bg : c.s2,
        border: `1px solid ${selected ? t.border : c.border}`,
      }}
    >
      {icon && (
        <span aria-hidden style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, flexShrink: 0, color: t.fg }}>
          {icon}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: fs.base, fontWeight: 600, lineHeight: 1.3, color: selected ? t.fg : muted ? c.muted : c.text }}>
          {label}
        </span>
        {sublabel && (
          <span style={{ display: 'block', fontSize: fs.sm, color: c.muted, marginTop: 2, lineHeight: 1.4 }}>{sublabel}</span>
        )}
      </span>
      {selected && <Check size={18} aria-hidden style={{ color: t.fg }} />}
    </button>
  )
}

/** Tinted square that holds a game icon */
function IconBox({ t, children }: { t?: Tone; children: ReactNode }) {
  return (
    <span
      aria-hidden
      style={{
        width: 40, height: 40, flexShrink: 0, borderRadius: radius.sm,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: t ? t.bg : c.s2, border: `1px solid ${t ? t.border : c.border}`, color: t ? t.fg : c.subtle,
      }}
    >
      {children}
    </span>
  )
}

/** Identity row (Ascendencia / Camino / Orden). A button that opens its picker while editing. */
function IdentityItem({ label, value, t, media, onPick, index }: {
  label: string
  value?: string
  t?: Tone
  media: ReactNode
  onPick?: () => void
  index: number
}) {
  const body: CSSProperties = {
    ...tile,
    display: 'flex', alignItems: 'center', gap: 12,
    width: '100%', minHeight: 68, padding: '12px 14px', textAlign: 'left',
  }
  const inner = (
    <>
      {media}
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ ...eyebrow, display: 'block' }}>{label}</span>
        <span
          style={{
            display: 'block', marginTop: 2,
            fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.25,
            color: value && t ? t.fg : c.subtle,
          }}
        >
          {value ?? '—'}
        </span>
      </span>
      {onPick && <ChevronDown size={18} aria-hidden style={{ color: c.subtle }} />}
    </>
  )
  const rise = { '--i': index } as CSSProperties
  return onPick ? (
    <button
      type="button"
      onClick={onPick}
      aria-haspopup="dialog"
      className="ui-card ui-card--interactive rise"
      style={{ ...buttonReset, ...body, ...rise }}
    >
      {inner}
    </button>
  ) : (
    <div className="rise" style={{ ...body, ...rise }}>{inner}</div>
  )
}

/**
 * Derived stat tile: icon + eyebrow label, big value, 12px breakdown.
 * Each tile spans three rows of STAT_GRID and reuses them (subgrid), so labels, values and breakdowns
 * line up across a row even when one label wraps ("Dado de recuperación").
 */
function StatCard({ label, icon, t, children, sub, index }: {
  label: string
  icon: ReactNode
  t: Tone
  children: ReactNode
  sub?: ReactNode
  index: number
}) {
  return (
    <div
      className="rise"
      style={{
        ...tile, '--i': index, padding: '12px 14px', marginBottom: 8,
        display: 'grid', gridRow: 'span 3', gridTemplateRows: 'subgrid', rowGap: 0, alignContent: 'start',
      } as CSSProperties}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, ...eyebrow, lineHeight: 1.35, marginBottom: 8 }}>
        <span aria-hidden style={{ display: 'flex', color: t.fg, marginTop: 1 }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div>{children}</div>
      {sub && <div style={{ fontSize: fs.xs, color: c.subtle, marginTop: 6, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  )
}

/** Parent grid for StatCard: 3 columns (2 on phones); vertical spacing comes from the cards' margin */
const STAT_GRID: CSSProperties = { display: 'grid', gridTemplateColumns: GRID_3_OR_2, columnGap: 8, rowGap: 0, marginBottom: -8 }

const statValue = (t: Tone, size: number = fs.xl + 2): CSSProperties => ({ ...numeral, fontSize: size, color: t.fg })

/** Official defence shield frame with the value on top */
function DefenseShield({ value, t, size = 60, valueSize = fs.xl + 2 }: { value: number; t: Tone; size?: number; valueSize?: number }) {
  const width = Math.round(size * 0.842)
  const hasFrame = hasCosmereIcon('marco-defensa')
  return (
    <span
      style={{
        position: 'relative', width, height: size, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        ...(hasFrame ? null : { border: `1.5px solid ${t.fg}`, borderRadius: `${radius.xs}px ${radius.xs}px ${radius.lg}px ${radius.lg}px` }),
      }}
    >
      {hasFrame && (
        <CosmereIcon name="marco-defensa" size={size} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: t.fg }} />
      )}
      <span style={{ position: 'relative', ...numeral, fontSize: valueSize, color: c.text, marginTop: -Math.round(size * 0.04) }}>{value}</span>
    </span>
  )
}

/** Attribute code chip (FUE, VEL…) with the full name as tooltip */
function AttrCode({ code, name, t }: { code: string; name?: string; t: Tone }) {
  return (
    <abbr
      title={name}
      style={{
        ...pill(t),
        justifyContent: 'center',
        minWidth: 40,
        padding: '2px 6px',
        borderRadius: radius.xs,
        fontSize: fs.eyebrow,
        letterSpacing: '0.06em',
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      {code}
    </abbr>
  )
}

/* ─── Rules helpers ─────────────────────────────────────────────────────── */

// ── Salud máxima calculada (espejo del backend, para preview en edición) ──────
function getSaludMaxima(level: number, fuerza: number): number {
  let flat = 10
  let fueCount = 1
  if (level >= 2)  flat += (Math.min(level, 5)  - 1) * 5
  if (level >= 6)  { flat += (Math.min(level, 10) - 5)  * 4; fueCount++ }
  if (level >= 11) { flat += (Math.min(level, 15) - 10) * 3; fueCount++ }
  if (level >= 16) { flat += (Math.min(level, 20) - 15) * 2; fueCount++ }
  if (level >= 21) flat += level - 20
  return flat + fueCount * fuerza
}

// ── Desgloses del servidor ───────────────────────────────────────────────────
// Las líneas «base» de un desglose son las que la previsualización en edición recalcula localmente
// (Base, atributos y «Forma: X»); el resto son talentos y se conservan tal cual.
const ATRIBUTO_RE = /^(Fuerza|Velocidad|Intelecto|Voluntad|Discernimiento|Presencia)\b/
const esLineaBase = (concepto: string) => concepto === 'Base' || concepto.startsWith('Forma:') || ATRIBUTO_RE.test(concepto)
const lineasTalento = (s: StatDesglose | undefined) => (s?.lineas ?? []).filter((l) => !esLineaBase(l.concepto))
const sumaLineas = (ls: StatDesglose['lineas']) => ls.reduce((acc, l) => acc + l.valor, 0)
const fmtLinea = (l: StatDesglose['lineas'][number]) => `${l.valor} (${l.concepto})`
const desgloseStr = (s: StatDesglose | undefined) => (s?.lineas ?? []).map(fmtLinea).join(' + ')
const RANGO_MAX = 5
const rangoDe = (level: number) => Math.min(RANGO_MAX, Math.max(1, Math.ceil(level / 5)))

// ── Attribute point allowance per level ──────────────────────────────────────
// Starting pool: 12 points. +1 at levels 3, 6, 9, 12, 15, 18 (table p.29)
function getPuntosAtributoEsperados(level: number): number {
  let total = 12
  for (const hito of [3, 6, 9, 12, 15, 18]) {
    if (level >= hito) total += 1
  }
  return total
}

const ATTR_MAP: Record<string, string> = {
  VEL: 'velocidad', FUE: 'fuerza', INT: 'intelecto',
  VOL: 'voluntad', PRE: 'presencia', DIS: 'discernimiento',
}
const ATRIBUTO_CODE: Record<string, string> = {
  'Velocidad': 'VEL', 'Fuerza': 'FUE', 'Intelecto': 'INT',
  'Voluntad': 'VOL', 'Presencia': 'PRE', 'Discernimiento': 'DIS',
}
// Primary and secondary slots per attribute code (no cross-section fallback)
const ATRIBUTO_SLOTS: Record<string, [number, number]> = {
  VEL: [1, 4], FUE: [1, 4], INT: [2, 5], VOL: [2, 5], DIS: [3, 6], PRE: [3, 6],
}
/** Full attribute names (tooltips and input labels) */
const ATTR_NAMES: Record<string, string> = {
  fuerza: 'Fuerza', velocidad: 'Velocidad', intelecto: 'Intelecto',
  voluntad: 'Voluntad', discernimiento: 'Discernimiento', presencia: 'Presencia',
}

type DefKey = 'defensaFisica' | 'defensaCognitiva' | 'defensaEspiritual'

/** The three columns of the sheet: attributes, defense and custom slots follow the Cosmere rules; their skills come from the world's table */
const COLUMNAS = [
  {
    key: 'fisico', label: 'Físico',
    tone: tone.granate,
    attrs: [['fuerza', 'FUE'], ['velocidad', 'VEL']] as [string, string][],
    defKey: 'defensaFisica' as DefKey,
    customNs: [1, 4] as [number, number],
  },
  {
    key: 'cognitivo', label: 'Cognitivo',
    tone: tone.zafiro,
    attrs: [['intelecto', 'INT'], ['voluntad', 'VOL']] as [string, string][],
    defKey: 'defensaCognitiva' as DefKey,
    customNs: [2, 5] as [number, number],
  },
  {
    key: 'espiritual', label: 'Espiritual',
    tone: tone.amatista,
    attrs: [['discernimiento', 'DIS'], ['presencia', 'PRE']] as [string, string][],
    defKey: 'defensaEspiritual' as DefKey,
    customNs: [3, 6] as [number, number],
  },
]

/** Sections of the sheet for a skills table (`WorldConfig.habilidades`): each column takes, in the table's order, the skills whose `columna` is its `key` */
const buildSections = (habilidades: HabilidadDef[]) => COLUMNAS.map((col) => ({
  ...col,
  skills: habilidades
    .filter((h) => h.columna === col.key)
    .map((h): [string, string, string, string] => [h.field, h.label, h.atributo, h.codigo]),
}))

const ASCENDENCIAS: { id: string; label: string; tone: Tone; icon: ReactNode }[] = [
  { id: 'Humano', label: 'Humano', tone: tone.cuarzo, icon: <UserRound size={20} /> },
  { id: 'Oyente', label: 'Oyente', tone: tone.amatista, icon: <AudioWaveform size={20} /> },
]

const BACKGROUND_FIELDS = [
  ['proposito', 'Propósito'], ['obstaculo', 'Obstáculo'],
  ['apariencia', 'Apariencia'], ['notas', 'Notas'],
]

type Tab = 'caracteristicas' | 'atributos' | 'background'
const TAB_PREFIX = 'ficha'
const TABS: { id: Tab; label: string }[] = [
  { id: 'caracteristicas', label: 'Características' },
  { id: 'atributos', label: 'Atributos' },
  { id: 'background', label: 'Trasfondo' },
]

export function CharacterDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId), chId = Number(characterId)
  const qc = useQueryClient()
  const location = useLocation()
  const { isGm, currentCampaign } = useCampaignStore()
  const cfg = useWorldConfig()
  const sections = useMemo(() => buildSections(cfg.habilidades), [cfg.habilidades])
  const { user: currentUser } = useAuthStore()
  const [editing, setEditing] = useState(!!(location.state as { editing?: boolean } | null)?.editing)
  const [form, setForm] = useState<Character | null>(null)
  const [tab, setTab] = useState<Tab>('caracteristicas')
  const [picker, setPicker] = useState<'heroico' | 'radiante' | 'ascendencia' | 'forma' | null>(null)
  const [enCombate, setEnCombate] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const nameId = useId()
  const levelId = useId()
  const fieldId = useId()

  const { data: char, isLoading } = useQuery<Character>({
    queryKey: ['character', cId, chId, enCombate],
    queryFn: () => charactersApi.getById(cId, chId, enCombate),
  })

  // Keep the edit form in sync with every new server copy of the character
  const [syncedChar, setSyncedChar] = useState<Character | undefined>(undefined)
  if (char !== syncedChar) {
    setSyncedChar(char)
    if (char) setForm({ ...char })
  }

  const updateMutation = useMutation({
    mutationFn: () => charactersApi.update(cId, chId, (form ?? char) as UpdateCharacterRequest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['character', cId, chId] })
      setEditing(false)
    },
  })

  const formaMutation = useMutation({
    mutationFn: (newTalentos: string[]) =>
      charactersApi.update(cId, chId, { ...char, talentos: JSON.stringify(newTalentos) } as UpdateCharacterRequest),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, chId] }),
  })

  if (isLoading || !char) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <h1 className="sr-only">Ficha de personaje</h1>
        <Spinner />
      </div>
    )
  }

  const isOwner = char.ownerId === currentUser?.id
  const canEdit = isGm || isOwner

  const f = (editing && form ? form : char) as Character

  // ── Forma (Oyente/Cantor) ──────────────────────────────────────────────────
  const isCantor = char.ascendencia === 'Oyente'
  const rawTalentos: string[] = (() => { try { return JSON.parse(char.talentos || '[]') } catch { return [] } })()
  const formasDisponibles = isCantor ? getFormasDisponibles(rawTalentos) : []
  const formaActiva = isCantor ? getFormaActiva(rawTalentos) : null
  const formaActivaData = formaActiva ? (formasDisponibles.find((fo) => fo.nombre === formaActiva) ?? null) : null
  const formaBonus: FormaBonusMap = formaActivaData?.bonusAtributos ?? {}
  const fbOf = (k: string) => formaBonus[k as FormaBonusKey] ?? 0
  const set = (k: keyof UpdateCharacterRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => prev ? { ...prev, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value } : prev)

  const radiantOrder = RADIANT_ORDERS.find((o) => o.id === f.caminoRadiante)

  const discardEdits = () => { setEditing(false); setForm({ ...char }) }
  const hasUnsavedChanges = !!form && JSON.stringify(form) !== JSON.stringify(char)
  const requestCancel = () => { if (hasUnsavedChanges) setConfirmDiscard(true); else discardEdits() }

  const playerName =
    currentCampaign?.members?.find((m) => m.userId === char.ownerId)?.displayName
    || char.playerName
    || 'Sin jugador'

  // Salud máxima: la calcula el servidor (tabla de progreso con la Fuerza efectiva, forma incluida, más talentos
  // como Robusto). En edición se previsualiza recalculando la parte base con el nivel y la Fuerza del formulario
  // y conservando las líneas de talentos que devolvió el servidor.
  const fbFuerza = formaBonus.fuerza ?? 0
  const saludTotal = editing
    ? getSaludMaxima(f.level ?? 1, (f.fuerza ?? 0) + fbFuerza) + sumaLineas(lineasTalento(char.salud))
    : (char.salud?.total ?? getSaludMaxima(char.level ?? 1, (char.fuerza ?? 0) + fbFuerza))

  const cardRise = (i: number) => ({ '--i': i }) as CSSProperties

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Hero header ───────────────────────────────── */}
      <CharacterHero
        characterId={char.id}
        padding="16px 16px 20px"
        style={{ borderRadius: fromTablet(radius.lg), marginTop: fromTablet(16), borderBottom: 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 44 }}>
          <p style={{ ...eyebrow, color: HERO_SOFT }}>{editing ? 'Modo edición' : 'Ficha de personaje'}</p>

          {/* Edit / Save buttons */}
          {canEdit && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button type="button" className="ui-btn" onClick={requestCancel} style={heroAction}>
                    <X size={16} aria-hidden />
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="ui-btn"
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    aria-busy={updateMutation.isPending || undefined}
                    style={{ ...heroAction, border: '1px solid var(--gold-ornament)' }}
                  >
                    <Save size={16} aria-hidden />
                    {updateMutation.isPending ? 'Guardando…' : 'Guardar'}
                  </button>
                </>
              ) : (
                <button type="button" className="ui-btn" onClick={() => { setForm({ ...char }); setEditing(true) }} style={heroAction}>
                  <Pencil size={16} aria-hidden />
                  Editar
                </button>
              )}
            </div>
          )}
        </div>

        {editing && isGm ? (
          <>
            <h1 className="sr-only">{char.name}</h1>
            <label htmlFor={nameId} style={{ ...eyebrow, color: HERO_SOFT, display: 'block', marginTop: 12, marginBottom: 6 }}>
              Nombre
            </label>
            <HeroInput
              id={nameId}
              value={form?.name ?? ''}
              onChange={set('name')}
              autoComplete="off"
              style={{ maxWidth: 380, fontFamily: font.display, fontSize: fs.xl, fontWeight: 600 }}
            />
          </>
        ) : (
          <h1 style={{ ...titleText, fontSize: fs['2xl'], color: HERO_TEXT, marginTop: 8, overflowWrap: 'anywhere' }}>
            {char.name}
          </h1>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          {editing ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {/* Accessible name "Nv. (nivel)" keeps the visible "Nv." in it (label in name) */}
              <label htmlFor={levelId} style={{ ...eyebrow, color: HERO_SOFT }}>
                Nv.<span className="sr-only"> (nivel)</span>
              </label>
              <HeroInput
                id={levelId}
                type="number" min={1} max={30}
                value={form?.level ?? 1}
                onChange={set('level')}
                style={{ width: 76, minHeight: 40, padding: '6px 10px', textAlign: 'center', ...numeral, fontSize: fs.md }}
              />
            </div>
          ) : (
            <span style={heroPill}>{`Nv. ${char.level}`}</span>
          )}
          <span style={heroPill}>
            <CosmereIcon name="ornamento-rombo" size={9} style={{ color: 'var(--gold-ornament)' }} />
            {`Rango ${rangoDe(editing ? (form?.level ?? 1) : char.level)}`}
          </span>
        </div>

        <p style={{ fontSize: fs.sm + 1, color: HERO_SOFT, marginTop: 10, lineHeight: 1.4 }}>
          {char.ascendencia || 'Sin ascendencia'} · {playerName}
        </p>

        {/* Salud máxima in the book's resource frame */}
        <div
          style={{
            position: 'relative', width: 224, height: 69, marginTop: 16,
            display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px',
          }}
        >
          {hasCosmereIcon('marco-recurso') && (
            <CosmereIcon
              name="marco-recurso"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', color: 'var(--gold-ornament)' }}
            />
          )}
          <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: 6, ...eyebrow, color: HERO_SOFT }}>
            <StatIcons.salud size={15} aria-hidden />
            Salud máx
          </span>
          <span style={{ position: 'relative', marginLeft: 'auto', ...numeral, fontSize: fs['2xl'], color: HERO_TEXT }}>
            {saludTotal}
          </span>
        </div>
      </CharacterHero>

      {/* ── Tab bar ───────────────────────────────────── */}
      <div className="sticky-under-topbar glass" style={{ padding: '10px 16px', borderBottom: `1px solid ${c.border}` }}>
        <Tabs<Tab>
          tabs={TABS}
          value={tab}
          onChange={setTab}
          ariaLabel="Secciones de la ficha"
          idPrefix={TAB_PREFIX}
          stretch
          size="sm"
        />
      </div>

      {/* ── Tab content ──────────────────────────────── */}
      <div style={{ padding: '20px 16px 48px' }}>

        {/* CARACTERÍSTICAS TAB */}
        {tab === 'caracteristicas' && (
          <TabPanel idPrefix={TAB_PREFIX} id="caracteristicas" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Combat toggle + Forma toggle */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button
                variant={enCombate ? 'danger' : 'secondary'}
                aria-pressed={enCombate}
                icon={<Swords size={16} aria-hidden />}
                onClick={() => setEnCombate((v) => !v)}
              >
                {enCombate ? 'En combate' : 'Fuera de combate'}
              </Button>

              {isCantor && (
                <Button
                  variant="secondary"
                  aria-haspopup="dialog"
                  aria-busy={formaMutation.isPending || undefined}
                  icon={formaActivaData?.esPoder ? <Zap size={16} aria-hidden /> : <Sparkle size={16} aria-hidden />}
                  onClick={() => setPicker('forma')}
                  style={formaActiva ? { background: FORMA_TONE.bg, border: `1px solid ${FORMA_TONE.border}`, color: FORMA_TONE.fg } : undefined}
                >
                  <span className="sr-only">Forma: </span>
                  {formaActiva ?? 'Sin forma'}
                  {formaActivaData?.esPoder && (
                    <span style={{ ...pill(tone.rubi), padding: '1px 8px', fontSize: fs.eyebrow, letterSpacing: '0.08em' }}>PODER</span>
                  )}
                </Button>
              )}
            </div>

            {/* Identity — Ascendencia · Camino Heroico · Camino Radiante */}
            {(() => {
              const asc = ASCENDENCIAS.find((a) => a.id === f.ascendencia)
              const path = HEROIC_PATHS.find((p) => p.id === f.caminoHeroico)
              const order = RADIANT_ORDERS.find((o) => o.id === f.caminoRadiante)
              const pathTone = path ? toneFrom(path.color) : undefined
              const orderTone = order ? toneFrom(order.color) : undefined
              return (
                <div>
                  <SectionTitle>Identidad</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: GRID_3_OR_1, gap: 8 }}>
                    <IdentityItem
                      index={0}
                      label="Ascendencia"
                      value={asc?.label}
                      t={asc?.tone}
                      media={<IconBox t={asc?.tone}>{asc ? asc.icon : <UserRound size={20} />}</IconBox>}
                      onPick={editing ? () => setPicker('ascendencia') : undefined}
                    />
                    <IdentityItem
                      index={1}
                      label="Camino"
                      value={path?.name}
                      t={pathTone}
                      media={<IconBox t={pathTone}><HeroicPathIcon id={path?.id} size={20} /></IconBox>}
                      onPick={editing && isGm ? () => setPicker('heroico') : undefined}
                    />
                    <IdentityItem
                      index={2}
                      label="Orden"
                      value={order?.name}
                      t={orderTone}
                      media={order
                        ? <RadiantOrderIcon orderId={order.id} size={40} decorative />
                        : <IconBox><CosmereIcon name="cosmere-emblem" size={20} /></IconBox>}
                      onPick={editing && isGm ? () => setPicker('radiante') : undefined}
                    />
                  </div>
                </div>
              )
            })()}

            {/* Concentración · Investidura · Desvío · Movimiento · Recuperación · Sentidos */}
            {(() => {
              const vacio: StatDesglose = { total: 0, lineas: [], situacional: [] }
              const conc = f.concentracion ?? vacio
              const inv  = f.investidura  ?? vacio
              const mov  = f.movimiento   ?? vacio
              const formaInk = FORMA_TONE.fg
              const formaLabel = (v: number) => `${v} (Forma: ${formaActiva})`

              // Líneas situacionales (reacciones, infusiones…): visibles pero fuera del total.
              const situacional = (s: StatDesglose) => s.situacional.length > 0 ? (
                <div style={{ marginTop: 4 }}>
                  {s.situacional.map((l, i) => (
                    <div key={i} style={{ color: c.muted }}>
                      {l.valor >= 0 ? '+' : ''}{l.valor}{s.unidad === 'm' ? ' m' : ''} {l.concepto}
                      {l.descripcionCondicion ? ` · ${l.descripcionCondicion}` : ''}
                    </div>
                  ))}
                </div>
              ) : null

              // Concentración — la calcula el servidor: 2 + VOL + forma (VOL y concentración directa) + talentos.
              // En edición se previsualiza con la Voluntad del formulario, conservando las líneas de talentos.
              const concVol = f.voluntad ?? 0
              const concFb  = (formaBonus.voluntad ?? 0) + (formaBonus.concentracion ?? 0)
              const concTalentos = lineasTalento(conc)
              const concShown = editing ? 2 + concVol + concFb + sumaLineas(concTalentos) : conc.total
              const concSub = editing
                ? [`2 (Base)`, `${concVol} (Voluntad)`, ...(concFb !== 0 ? [formaLabel(concFb)] : []), ...concTalentos.map(fmtLinea)].join(' + ')
                : desgloseStr(conc)

              // Investidura — para Radiantes: 2 + mayor de DIS/PRE (con forma) + talentos. Misma previsualización.
              const esRadiante = !!f.caminoRadiante
              const fbDis = formaBonus.discernimiento ?? 0
              const fbPre = formaBonus.presencia ?? 0
              const invDis = f.discernimiento ?? 0
              const invPre = f.presencia ?? 0
              const usaDis = invDis + fbDis >= invPre + fbPre
              const invBase = usaDis ? invDis : invPre
              const invFb   = usaDis ? fbDis : fbPre
              const invTalentos = lineasTalento(inv)
              const invShown = editing ? 2 + invBase + invFb + sumaLineas(invTalentos) : inv.total
              const invSub = editing
                ? [`2 (Base)`, `${invBase} (${usaDis ? 'Discernimiento' : 'Presencia'})`, ...(invFb !== 0 ? [formaLabel(invFb)] : []), ...invTalentos.map(fmtLinea)].join(' + ')
                : desgloseStr(inv)

              // Desvío — el servidor toma el mayor entre armadura y forma (no se acumulan, Manual pp. 33–37)
              // y añade los talentos situacionales (Réplica fulminante = grados en Disciplina).
              const desv = f.desvioCalculado ?? { ...vacio, total: Math.max(f.desvio ?? 0, formaBonus.desvio ?? 0) }
              const desvSub = (desv.lineas.length > 0 && !(desv.lineas.length === 1 && desv.lineas[0].concepto === 'Base')) || desv.situacional.length > 0 ? (
                <>
                  {desv.lineas.length > 0 && !(desv.lineas.length === 1 && desv.lineas[0].concepto === 'Base') && (
                    <span style={desv.lineas.some(l => l.concepto.startsWith('Forma:')) ? { color: formaInk } : undefined}>{desgloseStr(desv)}</span>
                  )}
                  {situacional(desv)}
                </>
              ) : undefined

              const vel = f.velocidad ?? 0
              const vol = f.voluntad ?? 0
              const dis = f.discernimiento ?? 0
              // Effective values include forma bonuses (view only)
              const velEff = vel + (formaBonus.velocidad ?? 0)
              const volEff = vol + (formaBonus.voluntad ?? 0)
              const disEff = dis + (formaBonus.discernimiento ?? 0)
              const movTotal = mov.total
              const movStr = movTotal % 1 === 0
                ? `${movTotal} m`
                : `${movTotal.toString().replace('.', ',')} m`
              const dadoRec    = volEff === 0 ? '1d4'  : volEff <= 2 ? '1d6'  : volEff <= 4 ? '1d8'  : volEff <= 6 ? '1d10' : volEff <= 8 ? '1d12' : '1d20'
              const alcance    = disEff === 0 ? '1,5 m' : disEff <= 2 ? '3 m' : disEff <= 4 ? '6 m' : disEff <= 6 ? '15 m' : disEff <= 8 ? '30 m' : 'Sin límite'
              // La línea base del movimiento es «Velocidad (N)»; el resto son bonos de talentos que sí suman.
              const movBonus = mov.lineas.filter(l => !l.concepto.startsWith('Velocidad'))

              return (
                <div>
                  <SectionTitle>Estadísticas</SectionTitle>
                  <div style={STAT_GRID}>
                    <StatCard index={0} label="Concentración" icon={<StatIcons.concentracion size={14} />} t={tone.heliodoro} sub={concSub || undefined}>
                      <div style={statValue(tone.heliodoro)}>{concShown}</div>
                    </StatCard>

                    <StatCard index={1} label="Investidura" icon={<StatIcons.investidura size={14} />} t={tone.amatista} sub={esRadiante ? (invSub || undefined) : undefined}>
                      {esRadiante ? (
                        <div style={statValue(tone.amatista)}>{invShown}</div>
                      ) : (
                        <div style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.4 }}>Solo disponible para Radiantes</div>
                      )}
                    </StatCard>

                    <StatCard
                      index={2}
                      label="Desvío"
                      icon={<CosmereIcon name="marco-desvio" size={13} />}
                      t={tone.topacio}
                      sub={desvSub}
                    >
                      <div style={statValue(tone.topacio)}>{desv.total}</div>
                    </StatCard>

                    <StatCard
                      index={3}
                      label="Movimiento"
                      icon={<StatIcons.movimiento size={14} />}
                      t={tone.esmeralda}
                      sub={<>
                        {movBonus.length > 0
                          ? `+${sumaLineas(movBonus)} m bonus · `
                          : 'por acción · '}
                        VEL {velEff}{velEff !== vel ? <span style={{ color: formaInk }}> (+{formaBonus.velocidad})</span> : null}
                        {situacional(mov)}
                      </>}
                    >
                      <div style={statValue(tone.esmeralda)}>{movStr}</div>
                    </StatCard>

                    <StatCard
                      index={4}
                      label="Dado de recuperación"
                      icon={<StatIcons.recuperacion size={14} />}
                      t={tone.granate}
                      sub={<>VOL {volEff}{volEff !== vol ? <span style={{ color: formaInk }}> (+{formaBonus.voluntad})</span> : null}</>}
                    >
                      <div style={{ ...statValue(tone.granate), fontFamily: font.mono, letterSpacing: 0 }}>{dadoRec}</div>
                    </StatCard>

                    <StatCard
                      index={5}
                      label="Alcance sentidos"
                      icon={<StatIcons.sentidos size={14} />}
                      t={tone.circon}
                      sub={<>DIS {disEff}{disEff !== dis ? <span style={{ color: formaInk }}> (+{formaBonus.discernimiento})</span> : null}</>}
                    >
                      <div style={statValue(tone.circon, disEff >= 9 ? fs.lg : fs.xl + 2)}>{alcance}</div>
                    </StatCard>
                  </div>
                </div>
              )
            })()}

            {/* ── Defensas ─────────────────────────────────────────────── */}
            <div>
              <SectionTitle>Defensas</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: GRID_3_OR_1, gap: 8 }}>
                {sections.map((section, i) => {
                  const t = section.tone
                  const defStat = f[section.defKey] as StatDesglose | undefined
                  const defValue = defStat?.total ?? 0
                  return (
                    <div
                      key={section.key}
                      className="rise"
                      style={{ ...tile, ...cardRise(i), padding: '14px 14px', display: 'flex', alignItems: 'center', gap: 14 }}
                    >
                      <DefenseShield value={defValue} t={t} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...eyebrow, color: t.fg }}>Def. {section.label}</div>
                        {defStat && defStat.lineas.length > 0 && (
                          <div style={{ fontSize: fs.xs, color: c.subtle, marginTop: 4, lineHeight: 1.4 }}>
                            {defStat.lineas.map((l) => `${l.valor} (${l.concepto})`).join(' + ')}
                          </div>
                        )}
                        {defStat && defStat.situacional.length > 0 && (
                          <ul style={{ listStyle: 'none', marginTop: 6, paddingTop: 6, borderTop: `1px solid ${t.border}` }}>
                            {defStat.situacional.map((s, si) => (
                              <li key={si} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, marginTop: si > 0 ? 2 : 0, fontSize: fs.xs }}>
                                <span style={{ color: c.muted }}>{s.concepto}</span>
                                <span style={{ fontWeight: 700, color: t.fg, fontVariantNumeric: 'tabular-nums' }}>{s.valor >= 0 ? '+' : ''}{s.valor}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

          </TabPanel>
        )}

        {/* ATRIBUTOS TAB */}
        {tab === 'atributos' && (
          <TabPanel idPrefix={TAB_PREFIX} id="atributos" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Warning: puntos de atributo ──────────────────────────── */}
            {(() => {
              // Sum of raw attribute values (forma bonuses are temporary, excluded)
              const totalAttr = (f.fuerza ?? 0) + (f.velocidad ?? 0) + (f.intelecto ?? 0)
                + (f.voluntad ?? 0) + (f.discernimiento ?? 0) + (f.presencia ?? 0)
              const esperados = getPuntosAtributoEsperados(f.level ?? 1)
              const diff = totalAttr - esperados
              if (diff === 0) return null

              const exceso = diff > 0
              const bt = exceso ? tone.topacio : tone.zafiro
              return (
                <div
                  role="status"
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 12,
                    background: bt.bg, border: `1px solid ${bt.border}`,
                    borderRadius: radius.md, padding: '12px 14px',
                  }}
                >
                  <span aria-hidden style={{ display: 'flex', color: bt.fg, marginTop: 1 }}>
                    {exceso ? <TriangleAlert size={18} /> : <Info size={18} />}
                  </span>
                  <div>
                    <p style={{ fontSize: fs.sm + 1, fontWeight: 700, color: bt.fg, lineHeight: 1.35 }}>
                      {exceso ? 'Exceso de puntos de atributo' : 'Puntos de atributo por asignar'}
                    </p>
                    <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45, marginTop: 2 }}>
                      {exceso
                        ? `${totalAttr} puntos asignados, pero a nivel ${f.level} corresponden ${esperados}. Retira ${diff} punto${diff > 1 ? 's' : ''}.`
                        : `${totalAttr} puntos asignados de ${esperados} disponibles a nivel ${f.level}. Quedan ${-diff} punto${-diff > 1 ? 's' : ''} por repartir.`}
                    </p>
                  </div>
                </div>
              )
            })()}

            {/* Físico / Cognitivo / Espiritual sections */}
            {sections.map((section, sectionIdx) => {
              const t = section.tone
              const defStat = f[section.defKey] as StatDesglose | undefined
              const defValue = defStat?.total ?? 0

              return (
                <Card
                  key={section.key}
                  as="section"
                  padding={0}
                  className="rise"
                  aria-labelledby={`${fieldId}-sec-${section.key}`}
                  style={{ ...cardRise(sectionIdx), overflow: 'hidden' }}
                >
                  {/* Section header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                    padding: '10px 16px',
                    background: t.bg,
                    borderBottom: `1px solid ${t.border}`,
                  }}>
                    <h2
                      id={`${fieldId}-sec-${section.key}`}
                      style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, color: c.text }}
                    >
                      <CosmereIcon name="ornamento-rombo" size={10} style={{ color: t.fg }} />
                      {section.label}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={eyebrow}>Defensa</span>
                      <DefenseShield value={defValue} t={t} size={40} valueSize={fs.md} />
                    </div>
                  </div>

                  {/* Attributes row */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 1, borderBottom: `1px solid ${c.border}`,
                    background: c.border,
                  }}>
                    {section.attrs.map(([k, label]) => {
                      const attrBase = numField(f, k)
                      const attrFb = fbOf(k)
                      const attrTotal = attrBase + attrFb
                      return (
                        <div key={k} style={{ background: c.s1, padding: '14px 12px 12px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {editing ? (
                            <Input
                              type="number" min={0} max={5}
                              aria-label={`${ATTR_NAMES[k]} (${label})`}
                              value={numField(form, k)}
                              onChange={set(k as keyof UpdateCharacterRequest)}
                              style={{ width: 88, textAlign: 'center', ...numeral, fontSize: fs.xl, padding: '6px 8px' }}
                            />
                          ) : (
                            <div style={{ ...numeral, fontSize: fs['2xl'] + 2, color: c.text }}>
                              {attrTotal}
                              {attrFb > 0 && (
                                <sup style={{ fontSize: fs.xs, fontWeight: 700, color: FORMA_TONE.fg, marginLeft: 3 }}>
                                  +{attrFb}<span className="sr-only"> por forma</span>
                                </sup>
                              )}
                            </div>
                          )}
                          <abbr title={ATTR_NAMES[k]} style={{ ...eyebrow, color: t.fg, marginTop: 8, textDecoration: 'none' }}>
                            {label}
                          </abbr>
                        </div>
                      )
                    })}
                  </div>

                  {/* Skills list */}
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column' }}>
                    {section.skills.map(([k, label, attrKey2, attrLabel], idx) => {
                      const base = numField(f, k)
                      const attrRaw = numField(f, attrKey2)
                      const attrFb = fbOf(attrKey2)
                      const bonus = attrRaw + attrFb
                      const total = base + bonus
                      const pct = Math.min(100, (base / 5) * 100)
                      return (
                        <li key={k} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          minHeight: 48, padding: '6px 16px',
                          borderTop: idx === 0 ? 'none' : `1px solid ${c.border}`,
                        }}>
                          <AttrCode code={attrLabel} name={ATTR_NAMES[attrKey2]} t={t} />
                          <span style={{ fontSize: fs.base - 1, color: c.text, fontWeight: 500, flex: 1, minWidth: 0 }}>
                            {label}
                          </span>
                          {editing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                              <Input
                                type="number" min={0} max={10}
                                aria-label={`${label}, rango`}
                                value={base}
                                onChange={set(k as keyof UpdateCharacterRequest)}
                                style={{ width: 64, minHeight: 40, padding: '6px 8px', textAlign: 'center', fontSize: fs.base, fontVariantNumeric: 'tabular-nums' }}
                              />
                              <span style={{ fontSize: fs.xs, color: c.subtle, minWidth: 22, fontVariantNumeric: 'tabular-nums' }}>+{attrRaw}</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                              <span aria-hidden style={{ display: 'block', width: 48, height: 4, borderRadius: 4, background: c.track, overflow: 'hidden' }}>
                                <span style={{ display: 'block', height: '100%', borderRadius: 4, background: t.fg, width: `${pct}%` }} />
                              </span>
                              <span style={{ fontSize: fs.xs, color: c.subtle, minWidth: 30, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                {base}+{bonus}
                              </span>
                              <span style={{
                                ...numeral, fontSize: fs.md,
                                color: total > 0 ? c.text : c.subtle,
                                minWidth: 20, textAlign: 'right',
                              }}>
                                {total}
                              </span>
                            </div>
                          )}
                        </li>
                      )
                    })}

                    {/* Custom skills for this section (slots n1 and n2) */}
                    {section.customNs.map((n) => {
                      const nameKey = `habilidadPersonalizada${n}`
                      const valorKey = `habilidadPersonalizada${n}Valor`
                      const attrKey = `habilidadPersonalizada${n}Atributo`
                      const customName = strField(f, nameKey)
                      const customBase = numField(f, valorKey)
                      const customAttrCode = (strField(f, attrKey) ?? '').toUpperCase()
                      const customAttrKey = customAttrCode && ATTR_MAP[customAttrCode] ? ATTR_MAP[customAttrCode] : null
                      const customBonus = customAttrKey
                        ? numField(f, customAttrKey) + fbOf(customAttrKey)
                        : 0
                      const customTotal = customBase + customBonus
                      const isPotencia = !!radiantOrder?.surges.includes(customName)

                      if (!editing && !customName) return null

                      return (
                        <li key={n} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          minHeight: 52, padding: '6px 16px',
                          borderTop: `1px dashed ${t.border}`,
                        }}>
                          {editing ? (
                            <>
                              {isPotencia ? (
                                <AttrCode code={customAttrCode} name={customAttrKey ? ATTR_NAMES[customAttrKey] : undefined} t={t} />
                              ) : (
                                <Select
                                  aria-label={`Atributo de habilidad personalizada ${n}`}
                                  value={strField(form, attrKey) ?? ''}
                                  onChange={(e) => setForm((prev) => prev ? { ...prev, [attrKey]: e.target.value } : prev)}
                                  style={{ width: 76, flexShrink: 0, minHeight: 40, padding: '6px 26px 6px 10px', fontSize: fs.sm, fontWeight: 650, backgroundPosition: 'right 7px center' }}
                                >
                                  <option value="">—</option>
                                  {['VEL','FUE','INT','VOL','PRE','DIS'].map((a) => <option key={a} value={a}>{a}</option>)}
                                </Select>
                              )}
                              {isPotencia ? (
                                <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.base - 1, fontWeight: 600, color: c.text }}>
                                  <SurgeIcon surge={customName} size={18} style={{ color: t.fg }} />
                                  {customName}
                                </span>
                              ) : (
                                <Input
                                  aria-label={`Nombre de habilidad personalizada ${n}`}
                                  value={strField(form, nameKey) ?? ''}
                                  onChange={(e) => setForm((prev) => prev ? { ...prev, [nameKey]: e.target.value } : prev)}
                                  placeholder="Habilidad personalizada..."
                                  style={{ flex: 1, minWidth: 0, minHeight: 40, padding: '6px 10px', fontSize: fs.sm + 1, textOverflow: 'ellipsis' }}
                                />
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                                <Input
                                  type="number" min={0} max={10}
                                  aria-label={`Valor de ${customName || 'habilidad personalizada'}`}
                                  value={customBase}
                                  onChange={set(valorKey as keyof UpdateCharacterRequest)}
                                  style={{ width: 64, minHeight: 40, padding: '6px 8px', textAlign: 'center', fontSize: fs.base, fontVariantNumeric: 'tabular-nums' }}
                                />
                                <span style={{ fontSize: fs.xs, color: c.subtle, minWidth: 22, fontVariantNumeric: 'tabular-nums' }}>+{customBonus}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              {customAttrCode
                                ? <AttrCode code={customAttrCode} name={customAttrKey ? ATTR_NAMES[customAttrKey] : undefined} t={t} />
                                : <AttrCode code="—" t={t} />}
                              <span style={{ fontSize: fs.base - 1, color: c.text, fontWeight: 500, flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                {isPotencia && <SurgeIcon surge={customName} size={18} style={{ color: t.fg }} />}
                                {customName}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                <span style={{ fontSize: fs.xs, color: c.subtle, fontVariantNumeric: 'tabular-nums' }}>{customBase}+{customBonus}</span>
                                <span style={{ ...numeral, fontSize: fs.md, color: customTotal > 0 ? c.text : c.subtle, minWidth: 20, textAlign: 'right' }}>
                                  {customTotal}
                                </span>
                              </div>
                            </>
                          )}
                        </li>
                      )
                    })}
                  </ul>

                  {/* Situacional bonuses (talents that conditionally affect this defense) */}
                  {defStat && defStat.situacional.length > 0 && (
                    <div style={{
                      padding: '12px 16px',
                      borderTop: `1px solid ${t.border}`,
                      background: t.bg,
                    }}>
                      <p style={{ ...eyebrow, marginBottom: 6 }}>Bonos situacionales</p>
                      <ul style={{ listStyle: 'none' }}>
                        {defStat.situacional.map((s, i) => (
                          <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8, marginTop: i > 0 ? 4 : 0 }}>
                            <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4 }}>
                              {s.concepto}
                              {s.descripcionCondicion && <span style={{ color: c.subtle }}> · {s.descripcionCondicion}</span>}
                            </span>
                            <span style={{ fontSize: fs.sm, fontWeight: 700, color: s.valor >= 0 ? t.fg : tone.rubi.fg, fontVariantNumeric: 'tabular-nums' }}>
                              {s.valor >= 0 ? '+' : ''}{s.valor}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )
            })}
          </TabPanel>
        )}

        {/* BACKGROUND TAB */}
        {tab === 'background' && (
          <TabPanel idPrefix={TAB_PREFIX} id="background" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {!editing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="secondary"
                  icon={<Pencil size={16} aria-hidden />}
                  onClick={() => { setForm({ ...char }); setEditing(true) }}
                >
                  Editar trasfondo
                </Button>
              </div>
            )}
            {BACKGROUND_FIELDS.map(([k, label], i) => {
              const inputId = `${fieldId}-${k}`
              const value = strField(f, k)
              return (
                <Card key={k} padding="16px 18px" className="rise" style={cardRise(i)}>
                  <h2 style={{ fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, color: c.text, marginBottom: 8 }}>
                    {editing ? <label htmlFor={inputId}>{label}</label> : label}
                  </h2>
                  {editing ? (
                    <Textarea
                      id={inputId}
                      rows={3}
                      value={strField(form, k) ?? ''}
                      onChange={set(k as keyof UpdateCharacterRequest)}
                      placeholder={`${label}...`}
                    />
                  ) : (
                    <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: value ? c.text : c.subtle, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                      {value || '—'}
                    </p>
                  )}
                </Card>
              )
            })}
          </TabPanel>
        )}
      </div>


      {/* Path pickers */}
      <OptionPicker
        open={picker === 'ascendencia'}
        title="Ascendencia"
        value={form?.ascendencia ?? ''}
        options={ASCENDENCIAS.map((a) => ({ id: a.id, label: a.label, tone: a.tone, icon: a.icon }))}
        onChange={(id) => setForm((prev) => prev ? { ...prev, ascendencia: id } : prev)}
        onClose={() => setPicker(null)}
      />
      <OptionPicker
        open={picker === 'heroico'}
        title="Camino Heroico"
        description="Puedes tener varios caminos heroicos: se conservan los talentos del anterior y se añade el talento principal del nuevo."
        value={form?.caminoHeroico ?? ''}
        options={HEROIC_PATHS.map((p) => ({
          id: p.id, label: p.name, tone: toneFrom(p.color), icon: <HeroicPathIcon id={p.id} size={22} />,
        }))}
        onChange={(id) => {
          const oldPath = HEROIC_PATHS.find((p) => p.id === (form?.caminoHeroico ?? char.caminoHeroico))
          const newPath = HEROIC_PATHS.find((p) => p.id === id)
          const current: string[] = (() => { try { return JSON.parse((form?.talentos ?? char.talentos) || '[]') } catch { return [] } })()
          // Several heroic paths are allowed now: never remove the previous path's talents.
          // The old starting path's main talent was auto-granted (never stored) — store it explicitly
          // so it survives now that it stops being the auto-granted one. Then add the new path's main talent.
          let next = current
          if (oldPath && !next.includes(oldPath.mainTalent)) next = [oldPath.mainTalent, ...next]
          if (newPath && !next.includes(newPath.mainTalent)) next = [newPath.mainTalent, ...next]
          setForm((prev) => prev ? { ...prev, caminoHeroico: id, talentos: JSON.stringify(next) } : prev)
        }}
        onClose={() => setPicker(null)}
      />
      <OptionPicker
        open={picker === 'forma' && isCantor}
        title="Cambiar de forma"
        description="El cambio de forma se guarda al momento."
        value={formaActiva ?? ''}
        options={formasDisponibles.map((fo) => ({
          id: fo.nombre,
          label: fo.nombre,
          sublabel: fo.esPoder ? `vacíospren (${fo.spren})` : fo.spren,
          tone: fo.esPoder ? tone.rubi : FORMA_TONE,
          icon: fo.esPoder ? <Zap size={20} /> : <Sparkle size={20} />,
        }))}
        onChange={(id) => {
          const next = id
            ? withFormaActiva(rawTalentos, id)
            : rawTalentos.filter((t) => !t.startsWith(FORMA_ACTIVA_PREFIX))
          formaMutation.mutate(next)
        }}
        onClose={() => setPicker(null)}
      />
      <OptionPicker
        open={picker === 'radiante'}
        title="Camino Radiante"
        description="Al guardar, los talentos y potencias de la orden anterior se sustituyen por los de la nueva."
        value={form?.caminoRadiante ?? ''}
        options={RADIANT_ORDERS.map((o) => ({
          id: o.id, label: o.name, sublabel: o.surges.join(' · '),
          tone: toneFrom(o.color), icon: <RadiantOrderIcon orderId={o.id} size={36} decorative />,
        }))}
        onChange={(id) => {
          const oldOrder = RADIANT_ORDERS.find((o) => o.id === (form?.caminoRadiante ?? char.caminoRadiante))
          const newOrder = RADIANT_ORDERS.find((o) => o.id === id)
          const current: string[] = (() => { try { return JSON.parse((form?.talentos ?? char.talentos) || '[]') } catch { return [] } })()
          // Remove old spren bond talentos + old potencia names + old potencia sub-talentos
          const oldSprenNames = oldOrder ? oldOrder.talentos.map((t) => t.name) : []
          const oldPotenciaNames = oldOrder
            ? oldOrder.surges.flatMap((s) => {
                const p = POTENCIAS.find((p) => p.name === s)
                if (!p) return []
                return [p.name, ...p.talentos.map((t) => t.name)]
              })
            : []
          const filtered = current.filter((n) => !oldSprenNames.includes(n) && !oldPotenciaNames.includes(n))
          const mainName = newOrder?.talentos[0]?.name
          // Also auto-add the potencia name itself (base activation) for each surge
          const potenciaMainNames = (newOrder?.surges ?? []).filter((s): s is string => !!POTENCIAS.find((p) => p.name === s))
          const autoAdd = [mainName, ...potenciaMainNames].filter((n): n is string => !!n)
          const base = filtered.filter((n) => !autoAdd.includes(n))
          const next = [...autoAdd, ...base]
          // Update habilidadPersonalizada slots for new surges
          const surgeUpdates: Record<string, string | number> = {}
          const oldSurges = (oldOrder?.surges ?? []) as string[]
          // Clear old surge slots (check all 6 slots)
          for (let i = 1; i <= 6; i++) {
            const curName = strField(form ?? char, `habilidadPersonalizada${i}`)
            if (oldSurges.includes(curName)) {
              surgeUpdates[`habilidadPersonalizada${i}`] = ''
              surgeUpdates[`habilidadPersonalizada${i}Valor`] = 0
              surgeUpdates[`habilidadPersonalizada${i}Atributo`] = ''
            }
          }
          // Assign each surge to its correct section slots (no cross-section fallback)
          for (const surge of newOrder?.surges ?? []) {
            const potencia = POTENCIAS.find((p) => p.name === surge)
            const code = potencia ? (ATRIBUTO_CODE[potencia.atributo] ?? '') : ''
            const sectionSlots: number[] = code ? (ATRIBUTO_SLOTS[code] ?? []) : []
            for (const slot of sectionSlots) {
              const curInSlot = (surgeUpdates[`habilidadPersonalizada${slot}`] as string | undefined)
                ?? strField(form ?? char, `habilidadPersonalizada${slot}`)
              if (!curInSlot) {
                surgeUpdates[`habilidadPersonalizada${slot}`] = surge
                surgeUpdates[`habilidadPersonalizada${slot}Valor`] = 1
                surgeUpdates[`habilidadPersonalizada${slot}Atributo`] = code
                break
              }
            }
          }
          setForm((prev) => prev ? { ...prev, caminoRadiante: id, talentos: JSON.stringify(next), ...(surgeUpdates as unknown as Partial<Character>) } : prev)
        }}
        onClose={() => setPicker(null)}
      />

      <ConfirmDialog
        open={confirmDiscard}
        title="¿Descartar los cambios?"
        message="Los cambios que no has guardado en la ficha se perderán."
        confirmLabel="Descartar"
        cancelLabel="Seguir editando"
        onConfirm={() => { setConfirmDiscard(false); discardEdits() }}
        onCancel={() => setConfirmDiscard(false)}
      />
    </div>
  )
}
