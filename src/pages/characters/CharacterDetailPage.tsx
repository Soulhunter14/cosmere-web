import { lazy, Suspense, useEffect, useId, useMemo, useRef, useState, type CSSProperties, type InputHTMLAttributes, type ReactNode } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient, type QueryKey } from '@tanstack/react-query'
import {
  Check, ChevronDown, Info, Pencil, Save, Sparkle, Swords, TriangleAlert, UserRound, X, Zap, type LucideIcon,
} from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { metasApi } from '../../api/metas'
import { useCampaignStore, useEra, useWorldConfig } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import {
  Button, Card, ConfirmDialog, ErrorMessage, IconButton, Input, Segmented, SectionTitle, Select, Sheet, Spinner, Stepper, TabPanel, Tabs, Textarea,
} from '../../components/ui'
import type { EntornoCaminoMetal, MetalPickerProps, SeleccionCaminoMetal } from '../../components/mistborn'
// Tiny on purpose (it imports only types): the page loads it eagerly for the vial's optimistic copy and for the visibility of its button (§8, risk 6)
import { conVialBebido, esPoderDelVial } from '../../components/mistborn/vial'
import type { Character, PoderPersonaje, RecursosPatch, StatDesglose, StatLinea, UpdateCharacterRequest } from '../../types'
import type { AttrField, HabilidadDef } from '../../worlds/types'
import { isAvailable } from '../../worlds'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { POTENCIAS } from '../../data/potencias'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'
import { CharacterHero } from '../../components/CharacterHero'
import { CosmereIcon } from '../../components/CosmereIcon'
import { MetalGlyph } from '../../components/mistborn/MetalGlyph'
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

// Components of Nacidos de la bruma: lazy, so neither they nor the data they import by file (caminosNacidosDelMetal, origenes)
// reach the main chunk (§7.4 rule 4, §8 risk 6). Each one is rendered only while its picker is open.
const CaminoMetalPicker = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.CaminoMetalPicker })))
const BendicionPicker = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.BendicionPicker })))
const MetalPicker = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.MetalPicker })))
// The «Artes metálicas» tab (T30): rendered only while that tab is open
const ArtesMetalicasTab = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.ArtesMetalicasTab })))
// «Beber vial» (T31): the sheet of the vial, mounted only while it is open
const BeberVialSheet = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.BeberVialSheet })))

/** A metalborn path chosen in CaminoMetalPicker that waits for its metals (MetalPicker, §7.4 step 4) */
interface CaminoPendiente { camino: string; caminoInicial: 'heroico' | 'metal'; arte: MetalPickerProps['arte']; modo: MetalPickerProps['modo'] }

/** What the sheet asks of the table state of the world (§5.2): a PATCH …/recursos, the start of a scene, or a vial that is drunk (T31) */
type AccionMesa =
  | { tipo: 'recursos'; cuerpo: RecursosPatch }
  | { tipo: 'inicio-escena'; sorprendido: boolean }
  | { tipo: 'beber-vial'; metales: string[] }

/**
 * The cached character as the server will leave it after an `AccionMesa`, as far as the sheet can tell without repeating the rules of the
 * world (clamps, Desprovisto…): the refetch that follows brings the rest. Written into every cached copy of the character (§2)
 */
function conAccionMesa(old: Character, accion: AccionMesa): Character {
  if (accion.tipo === 'inicio-escena') {
    const total = old.investidura?.total ?? 0
    return { ...old, recursos: { ...old.recursos, investiduraActual: accion.sorprendido ? Math.min(1, total) : total } }
  }
  if (accion.tipo === 'beber-vial') return conVialBebido(old, accion.metales) // the rule of the vial lives in vial.ts, next to its sheet
  const { recursos, poderes } = accion.cuerpo
  return {
    ...old,
    recursos: recursos ? { ...old.recursos, ...recursos } : old.recursos,
    poderes: poderes
      ? old.poderes.map((p) => {
        const cambio = poderes.find((x) => x.arte === p.arte && x.metal === p.metal)
        if (!cambio) return p
        return {
          ...p,
          ...(cambio.cargas !== undefined && { cargas: cambio.cargas }),
          ...(cambio.viales !== undefined && { viales: cambio.viales }),
          ...(cambio.desprovisto !== undefined && { desprovisto: cambio.desprovisto }),
          ...(cambio.completo !== undefined && { completo: cambio.completo }),
          ...(cambio.ajusteCargasMax !== undefined && { ajusteCargasMax: cambio.ajusteCargasMax }),
        }
      })
      : old.poderes,
  }
}

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

/** A Lucide icon that arrives as a component reference from the configuration of the world */
function Glifo({ icon: Icono, size, style }: { icon: LucideIcon; size: number; style?: CSSProperties }) {
  return <Icono size={size} style={style} />
}

/** Notice of the attributes tab, tinted by severity: icon, bold title and one line of explanation */
function AvisoAtributos({ t, icon, title, children }: { t: Tone; icon: ReactNode; title: string; children: ReactNode }) {
  return (
    <div
      role="status"
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        background: t.bg, border: `1px solid ${t.border}`,
        borderRadius: radius.md, padding: '12px 14px',
      }}
    >
      <span aria-hidden style={{ display: 'flex', color: t.fg, marginTop: 1 }}>{icon}</span>
      <div>
        <p style={{ fontSize: fs.sm + 1, fontWeight: 700, color: t.fg, lineHeight: 1.35 }}>{title}</p>
        <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45, marginTop: 2 }}>{children}</p>
      </div>
    </div>
  )
}

/**
 * «Investidura actual»: the table state of a world whose characters track it (`WorldConfig.recursos`, §5.2). A counter between 0 and the
 * maximum of the sheet, and the action that starts a scene: the maximum, or 1 if the character is Sorprendido (L.129 / PDF 135).
 * Both save at once. Neither moves while the sheet is being edited (a refetch would wipe what is typed in the form) nor for whoever
 * cannot edit the character. «Beber vial» (T31) sits next to «Inicio de escena» for a character with alomantic powers to drink for: it opens
 * the sheet of the vial, which restores the Investiture too.
 */
function InvestiduraActual({ label, icon, actual, max, enEdicion, puedeActuar, error, errorVial, index, onCambiar, onInicioEscena, onBeberVial }: {
  label: string
  icon: ReactNode
  actual: number
  max: number
  enEdicion: boolean
  /** The owner and the director; for anyone else the counter is read-only and there is no scene action */
  puedeActuar: boolean
  error: boolean
  /** The save that failed was the vial: the message says so instead of naming the counter */
  errorVial: boolean
  index: number
  /** One step up or down from the latest value (not from the one rendered), so that taps in quick succession all count */
  onCambiar: (delta: number) => void
  onInicioEscena: (sorprendido: boolean) => void
  /** Opens the sheet of the vial; absent when the character has no alomantic power a vial acts on (no button) */
  onBeberVial?: () => void
}) {
  const [sorprendido, setSorprendido] = useState(false)
  const t = tone.amatista
  return (
    <div className="rise" style={{ ...tile, '--i': index, marginTop: 16, padding: '12px 14px' } as CSSProperties}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, ...eyebrow, lineHeight: 1.35 }}>
        <span aria-hidden style={{ display: 'flex', color: t.fg }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{ marginTop: 10 }}>
        <Stepper
          label={label}
          value={actual}
          min={0}
          max={max}
          disabled={enEdicion || !puedeActuar}
          onChange={(v) => onCambiar(v - actual)}
          format={(v) => <>{v}<span style={{ fontSize: fs.base, fontWeight: 500, color: c.subtle }}> / {max}</span></>}
        />
      </div>
      {puedeActuar && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <Segmented
            ariaLabel="Estado al empezar la escena"
            stretch={false}
            value={sorprendido ? 'sorprendido' : 'normal'}
            onChange={(v) => setSorprendido(v === 'sorprendido')}
            options={[
              { value: 'normal', label: 'Normal', disabled: enEdicion },
              { value: 'sorprendido', label: 'Sorprendido', disabled: enEdicion },
            ]}
          />
          <Button
            variant="secondary"
            disabled={enEdicion}
            onClick={() => { onInicioEscena(sorprendido); setSorprendido(false) }}
          >
            Inicio de escena
          </Button>
          {onBeberVial && (
            <Button variant="secondary" disabled={enEdicion} aria-haspopup="dialog" onClick={onBeberVial}>
              Beber vial
            </Button>
          )}
        </div>
      )}
      {error && (
        <ErrorMessage
          message={errorVial ? 'No se ha podido beber el vial. Inténtalo de nuevo.' : `No se ha podido guardar la ${label.toLowerCase()}. Inténtalo de nuevo.`}
          style={{ marginTop: 10 }}
        />
      )}
    </div>
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
// Las líneas «base» de un desglose son las que la previsualización en edición recalcula localmente: «Base», los atributos y
// los bonos de atributo de cualquier origen (forma de cantor, Bendición, talento…), que el servidor marca con `esBono` (§5.1);
// el resto son talentos y se conservan tal cual.
const ATRIBUTO_RE = /^(Fuerza|Velocidad|Intelecto|Voluntad|Discernimiento|Presencia)\b/
const esLineaBase = (l: StatLinea) => l.concepto === 'Base' || l.esBono || ATRIBUTO_RE.test(l.concepto)
const lineasTalento = (s: StatDesglose | undefined) => (s?.lineas ?? []).filter((l) => !esLineaBase(l))
const sumaLineas = (ls: StatDesglose['lineas']) => ls.reduce((acc, l) => acc + l.valor, 0)
const fmtLinea = (l: StatDesglose['lineas'][number]) => `${l.valor} (${l.concepto})`
const desgloseStr = (s: StatDesglose | undefined) => (s?.lineas ?? []).map(fmtLinea).join(' + ')
const RANGO_MAX = 5
const rangoDe = (level: number) => Math.min(RANGO_MAX, Math.max(1, Math.ceil(level / 5)))

// ── Attribute point allowance per level ──────────────────────────────────────
// Starting pool: the ancestry's `puntosAtributoBase` (12; kandra 6, L.34 / PDF 40). +1 at levels 3, 6, 9, 12, 15, 18 (table p.29; L.27 / PDF 33)
function getPuntosAtributoEsperados(level: number, base: number): number {
  let total = base
  for (const hito of [3, 6, 9, 12, 15, 18]) {
    if (level >= hito) total += 1
  }
  return total
}

const ATTR_KEYS: AttrField[] = ['fuerza', 'velocidad', 'intelecto', 'voluntad', 'discernimiento', 'presencia']

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

const BACKGROUND_FIELDS = [
  ['proposito', 'Propósito'], ['obstaculo', 'Obstáculo'],
  ['apariencia', 'Apariencia'], ['notas', 'Notas'],
]

type Tab = 'caracteristicas' | 'atributos' | 'background' | 'artesMetalicas'
const TAB_PREFIX = 'ficha'
const TABS: { id: Tab; label: string }[] = [
  { id: 'caracteristicas', label: 'Características' },
  { id: 'atributos', label: 'Atributos' },
  { id: 'background', label: 'Trasfondo' },
]
/**
 * The tab of a world with metallic arts (`features.artesMetalicas`, §7.4). It goes before «Trasfondo», the tab a player opens least at the table.
 * Its id is also what a link from another page passes in `navigate(…, { state: { tab: 'artesMetalicas' } })` (the Bolsa: «Cargas en Artes metálicas →»)
 */
const TAB_ARTES: { id: Tab; label: string } = { id: 'artesMetalicas', label: 'Artes metálicas' }

export function CharacterDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId), chId = Number(characterId)
  const qc = useQueryClient()
  const location = useLocation()
  const { isGm, currentCampaign } = useCampaignStore()
  const cfg = useWorldConfig()
  const era = useEra()
  const sections = useMemo(() => buildSections(cfg.habilidades), [cfg.habilidades])
  // Ancestries of the world that exist in the era of the campaign (the era only filters options, §3 b)
  const ascendencias = useMemo(() => cfg.ascendencias.filter((a) => isAvailable(a, era)), [cfg.ascendencias, era])
  const { user: currentUser } = useAuthStore()
  const [editing, setEditing] = useState(!!(location.state as { editing?: boolean } | null)?.editing)
  const [form, setForm] = useState<Character | null>(null)
  // A link may ask for the «Artes metálicas» tab (`location.state.tab`); if the character has no such tab (`tabActiva`, below) the sheet opens the first one
  const [tab, setTab] = useState<Tab>(() => ((location.state as { tab?: string } | null)?.tab === TAB_ARTES.id ? TAB_ARTES.id : 'caracteristicas'))
  const [picker, setPicker] = useState<'heroico' | 'radiante' | 'ascendencia' | 'forma' | 'caminoMetal' | 'metal' | 'bendicion' | 'vial' | null>(null)
  const [enCombate, setEnCombate] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  // Flow «al elegir camino» (§7.4): the path that waits for its metals, and the confirmation of a removal or of a change of path
  const [caminoPendiente, setCaminoPendiente] = useState<CaminoPendiente | null>(null)
  const [confirmarCamino, setConfirmarCamino] = useState<{ tipo: 'quitar' } | { tipo: 'cambiar'; camino: string; seleccion: SeleccionCaminoMetal } | null>(null)
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

  // Immediate identity changes, outside edit mode (§7.4 rule 5): one PUT with the whole character plus the change, optimistic by prefix
  // so that every cached copy of it (with or without `enCombate`, §2) moves together. The base is the copy fetched out of combat, never
  // `form`. These three helpers are shared by the mutations below: snapshot (before), optimistic merge and restore (if it fails)
  const prefijoFicha = ['character', cId, chId]
  const instantanea = async () => {
    await qc.cancelQueries({ queryKey: prefijoFicha })
    return { previas: qc.getQueriesData<Character>({ queryKey: prefijoFicha }) }
  }
  const optimista = (cambio: Partial<Character>) => qc.setQueriesData<Character>({ queryKey: prefijoFicha }, (old) => old && { ...old, ...cambio })
  const restaurar = (ctx: { previas: [QueryKey, Character | undefined][] } | undefined) => ctx?.previas.forEach(([key, data]) => qc.setQueryData(key, data))

  // The Blessings (T27). The metalborn path has its own mutations below: it also writes talents, skills and powers and creates goals
  const identidadMutation = useMutation({
    mutationFn: (cambio: Partial<Pick<Character, 'bendiciones'>>) => {
      const base = qc.getQueryData<Character>(['character', cId, chId, false]) ?? char
      if (!base) return Promise.reject(new Error('The character is not loaded'))
      return charactersApi.update(cId, chId, { ...base, ...cambio } as UpdateCharacterRequest)
    },
    onMutate: async (cambio) => {
      const ctx = await instantanea()
      optimista(cambio)
      return ctx
    },
    onError: (_error, _cambio, ctx) => restaurar(ctx),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['character', cId, chId] })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
    },
  })

  // What the metalborn-path flow needs from the sheet: where the custom skills of each attribute go (the cognitive ones, 2 and 5) and
  // the attribute of each Investida skill of the world (§7.4 step 3)
  const entornoCamino: EntornoCaminoMetal = { huecos: ATRIBUTO_SLOTS, investidas: cfg.habilidadesInvestidas }

  // «Al elegir camino de nacido del metal» (§7.4, T28): steps 1-3 and 5-6; step 4 is the MetalPicker, whose choice arrives in `seleccion`.
  // A different path first undoes the current one in the same PUT; the same path with `seleccion.poderes === null` only changes its
  // starting role. Only outside edit mode. The plan is computed ONCE from the copy out of combat (never `form`) before the optimistic
  // merge, so writing it into the cached copies and into the PUT gives the same character. The flow and its data load lazily, with the
  // pickers (§7.4 rule 4, §8 risk 6)
  const aplicarCaminoMetal = useMutation({
    mutationFn: async ({ camino, seleccion }: { camino: string; seleccion: SeleccionCaminoMetal }) => {
      const base = qc.getQueryData<Character>(['character', cId, chId, false]) ?? char
      if (!base) throw new Error('The character is not loaded')
      const { planAplicarCaminoMetal, enlazarMetas } = await import('../../components/mistborn')
      const plan = planAplicarCaminoMetal(base, camino, seleccion, entornoCamino)
      if (plan.faltan.length > 0) throw new Error(`No free cognitive slot for ${plan.faltan.join(', ')}`)
      // Optimistic update by prefix (§2): the sheet moves at once, also with ?enCombate=true; the goal ids arrive with the refetch
      optimista(plan.cambio)
      // 5. The goals of the path, whose ids go into `metaId` of the powers they train; 6. one PUT. If it fails, the goals go away too
      const creadas: number[] = []
      try {
        for (const meta of plan.metas) creadas.push((await metasApi.create(cId, chId, { titulo: meta.titulo, descripcion: meta.descripcion })).id)
        const cambio = plan.cambio.poderes ? { ...plan.cambio, poderes: enlazarMetas(plan.cambio.poderes, plan.metas, creadas) } : plan.cambio
        return await charactersApi.update(cId, chId, { ...base, ...cambio } as UpdateCharacterRequest)
      } catch (error) {
        await Promise.allSettled(creadas.map((metaId) => metasApi.delete(cId, chId, metaId)))
        throw error
      }
    },
    onMutate: instantanea,
    onError: (_error, _vars, ctx) => restaurar(ctx),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['character', cId, chId] })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
      // The new goals show up in Metas at once, not after the 30 s of staleTime
      qc.invalidateQueries({ queryKey: ['metas', cId, chId] })
    },
  })

  // «Quitar camino» (§7.4): the inverse cleanup, the same kind of immediate change (the sheet confirms it first with a ConfirmDialog)
  const quitarCaminoMetal = useMutation({
    mutationFn: async () => {
      const base = qc.getQueryData<Character>(['character', cId, chId, false]) ?? char
      if (!base) throw new Error('The character is not loaded')
      const { planQuitarCaminoMetal } = await import('../../components/mistborn')
      const cambio = planQuitarCaminoMetal(base)
      optimista(cambio)
      return charactersApi.update(cId, chId, { ...base, ...cambio } as UpdateCharacterRequest)
    },
    onMutate: instantanea,
    onError: (_error, _vars, ctx) => restaurar(ctx),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['character', cId, chId] })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
    },
  })
  const caminoOcupado = aplicarCaminoMetal.isPending || quitarCaminoMetal.isPending

  // «Añadir poder» (T30, the director): a power the character gets as a reward (spike, lerasium alloy, medallion). One PUT with the whole character
  // plus the new power and, if it brings an Investida skill the sheet lacks, its slot (`planAnadirPoder`, §7.4 step 3); optimistic by prefix like the
  // ones above, from the copy out of combat. The table state of the powers that already exist is kept by the server (§5.1)
  const anadirPoder = useMutation({
    mutationFn: async (poder: PoderPersonaje) => {
      const base = qc.getQueryData<Character>(['character', cId, chId, false]) ?? char
      if (!base) throw new Error('The character is not loaded')
      const { planAnadirPoder } = await import('../../components/mistborn')
      const plan = planAnadirPoder(base, poder, entornoCamino)
      if (plan.faltan.length > 0) throw new Error(`No free cognitive slot for ${plan.faltan.join(', ')}`)
      optimista(plan.cambio)
      return charactersApi.update(cId, chId, { ...base, ...plan.cambio } as UpdateCharacterRequest)
    },
    onMutate: instantanea,
    onError: (_error, _poder, ctx) => restaurar(ctx),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: prefijoFicha })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
    },
  })

  // Table state of the world (Investidura actual, §5.2): PATCH …/recursos and the scene action. Optimistic by prefix like the mutations above,
  // but built for a counter that gets tapped fast: the change is written into every cached copy at the call (`mesa`, synchronously), the
  // requests go out one after the other in the order they were tapped (`colaMesa`), and only the LAST one to settle refetches, so a slow
  // answer never puts an old value back on screen. The answers are never written into the cache (§2: they are computed out of combat): the
  // refetch brings them. T30 and T31 reuse it for the powers (charges, vials, Desprovisto, Completo) and for the vial.
  // The queue is a plain promise chain and not the `scope` of TanStack: a scoped mutation only continues while the tab is in the foreground,
  // so someone who taps three times and puts the phone away would keep only the first tap
  const colaMesa = useRef<Promise<unknown>>(Promise.resolve())
  const mesaClave = ['mesa', cId, chId]
  const mesaMutation = useMutation({
    mutationKey: mesaClave,
    mutationFn: ({ accion }: { accion: AccionMesa; previas: [QueryKey, Character | undefined][] }) => {
      const enviar = () => accion.tipo === 'inicio-escena'
        ? charactersApi.inicioEscena(cId, chId, accion.sorprendido)
        : accion.tipo === 'beber-vial'
          ? charactersApi.beberVial(cId, chId, accion.metales)
          : charactersApi.patchRecursos(cId, chId, accion.cuerpo)
      const turno = colaMesa.current.then(enviar, enviar) // after the previous one, whether it worked or not
      colaMesa.current = turno.catch(() => undefined)
      return turno
    },
    onError: (_error, { previas }) => restaurar({ previas }),
    onSettled: () => {
      if (qc.isMutating({ mutationKey: mesaClave }) > 1) return // another one is still on its way: it refreshes when it settles
      qc.invalidateQueries({ queryKey: prefijoFicha })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
    },
  })
  const mesa = (accion: AccionMesa) => {
    void qc.cancelQueries({ queryKey: prefijoFicha }) // starts cancelling at once: a refetch in flight must not overwrite the change
    const previas = qc.getQueriesData<Character>({ queryKey: prefijoFicha })
    qc.setQueriesData<Character>({ queryKey: prefijoFicha }, (old) => old && conAccionMesa(old, accion))
    mesaMutation.mutate({ accion, previas })
  }

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

  // «Artes metálicas» (T30): whoever has a path or powers sees the tab, and the director always does, because «Añadir poder» lives there and a
  // character with neither (a human who gets a spike) would have no way to receive it. If the tab goes away under the user (the powers were
  // removed from another device) the sheet falls back to the first tab
  const hayArtes = cfg.features.artesMetalicas && (isGm || char.poderes.length > 0 || !!char.caminoMetal)
  const tabs = hayArtes ? [...TABS.slice(0, 2), TAB_ARTES, ...TABS.slice(2)] : TABS
  const tabActiva: Tab = tabs.some((t) => t.id === tab) ? tab : 'caracteristicas'
  // The latest copy of the character in the cache, which already holds the steps tapped before (what the counters of the powers are counted from)
  const vivo = () => qc.getQueryData<Character>(['character', cId, chId, enCombate]) ?? char

  const f = (editing && form ? form : char) as Character

  // ── Forma (Oyente/Cantor) ──────────────────────────────────────────────────
  const isCantor = cfg.features.formasCantor && char.ascendencia === 'Oyente'
  const rawTalentos: string[] = (() => { try { return JSON.parse(char.talentos || '[]') } catch { return [] } })()
  const formasDisponibles = isCantor ? getFormasDisponibles(rawTalentos) : []
  const formaActiva = isCantor ? getFormaActiva(rawTalentos) : null
  const formaActivaData = formaActiva ? (formasDisponibles.find((fo) => fo.nombre === formaActiva) ?? null) : null
  const formaBonus: FormaBonusMap = formaActivaData?.bonusAtributos ?? {}
  // Attribute bonus of any origin: from the server when the world says so (a cantor's form, Blessings, Tamaño desmedido…, §5.1) and from the cantor form otherwise.
  // `bonoInk`/`bonoSr` tell them apart on screen: a cantor's bonuses are its form's, which keeps its own colour and the «por forma» of always;
  // the server's other bonuses (Blessings, Tamaño desmedido…) are not forms
  const fbOf = (k: string) => cfg.features.bonosServidor
    ? (char.bonosAtributos?.[k as AttrField] ?? 0)
    : (formaBonus[k as FormaBonusKey] ?? 0)
  const bonoInk = isCantor ? FORMA_TONE.fg : c.brand
  const bonoSr = isCantor ? ' por forma' : ' por bonos'
  // What the server calls those bonuses («Bendición de la Consciencia, Tamaño desmedido»): every bonus line of every breakdown carries the
  // same text (§6.3), so the previews in edit mode name them the way the saved breakdowns do
  const nombreBonos = [char.salud, char.concentracion, char.investidura, char.defensaFisica, char.defensaCognitiva, char.defensaEspiritual]
    .flatMap((s) => s?.lineas ?? []).find((l) => l.esBono)?.concepto ?? 'Bonos'
  const set = (k: keyof UpdateCharacterRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => prev ? { ...prev, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value } : prev)

  // The ancestry on the form (it changes while editing) sets the attribute points to hand out and the highest value an attribute may take
  const ascActual = cfg.ascendencias.find((a) => a.id === f.ascendencia)
  const topeAtributo = (k: string) => ascActual?.topeAtributo?.[k as AttrField] ?? 5

  const radiantOrder = RADIANT_ORDERS.find((o) => o.id === f.caminoRadiante)

  // «Investidura actual» (T29): one step from the LATEST value in the cache, which already holds the steps tapped before it
  const cambiarInvestidura = (delta: number) => {
    const vivo = qc.getQueryData<Character>(['character', cId, chId, enCombate]) ?? char
    const total = vivo.investidura?.total ?? 0
    const actual = Math.min(total, Math.max(0, vivo.recursos.investiduraActual ?? 0))
    const siguiente = Math.min(total, Math.max(0, actual + delta))
    if (siguiente !== actual) mesa({ tipo: 'recursos', cuerpo: { recursos: { investiduraActual: siguiente } } })
  }

  const discardEdits = () => { setEditing(false); setForm({ ...char }) }
  const hasUnsavedChanges = !!form && JSON.stringify(form) !== JSON.stringify(char)
  const requestCancel = () => { if (hasUnsavedChanges) setConfirmDiscard(true); else discardEdits() }

  const playerName =
    currentCampaign?.members?.find((m) => m.userId === char.ownerId)?.displayName
    || char.playerName
    || 'Sin jugador'

  // Salud máxima: la calcula el servidor (tabla de progreso con la Fuerza efectiva, forma incluida, más talentos
  // como Robusto). En edición se previsualiza recalculando la parte base con el nivel y la Fuerza del formulario
  // y conservando las líneas de talentos que devolvió el servidor. El bono de Fuerza es el de la forma o, en un mundo con
  // `bonosServidor`, el que manda el servidor (Bendiciones, Tamaño desmedido…): sus líneas no se vuelven a sumar, son «base».
  const fbFuerza = fbOf('fuerza')
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
          tabs={tabs}
          value={tabActiva}
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
        {tabActiva === 'caracteristicas' && (
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

            {/* Identity — Ascendencia · Camino Heroico · Camino Investido del mundo (Orden / Camino de nacido del metal) · Bendición */}
            {(() => {
              const asc = ascActual
              const path = HEROIC_PATHS.find((p) => p.id === f.caminoHeroico)
              // The Investida path of the world: the character field that holds it, its name, colour and icon come from the configuration (P4)
              const caminoInv = cfg.caminoInvestido
              const invDef = caminoInv?.caminos.find((p) => p.id === f[caminoInv.field])
              const pathTone = path ? toneFrom(path.color) : undefined
              const invTone = invDef ? toneFrom(invDef.color) : undefined
              // A radiant order is changed by the director in edit mode, with the rest of the form. A metalborn path is assigned by the
              // director OUTSIDE edit mode, with an immediate save (§7.4 rule 5, Q6); not again while the previous save is running
              const invPick = caminoInv?.field === 'caminoMetal'
                ? (!editing && isGm ? () => {
                    if (caminoOcupado) return
                    aplicarCaminoMetal.reset()
                    quitarCaminoMetal.reset()
                    setPicker('caminoMetal')
                  } : undefined)
                : (editing && isGm ? () => setPicker('radiante') : undefined)
              // Blessings (kandra): the owner or the director pick them outside edit mode, with an immediate save. For anyone but the
              // director, once one is saved the picker opens read-only (Q16)
              const bendiciones = asc?.bendiciones
              return (
                <div>
                  <SectionTitle>Identidad</SectionTitle>
                  <div style={{ display: 'grid', gridTemplateColumns: GRID_3_OR_1, gap: 8 }}>
                    <IdentityItem
                      index={0}
                      label="Ascendencia"
                      value={asc?.label}
                      t={asc?.tone}
                      media={<IconBox t={asc?.tone}>{asc ? asc.icono(20) : <UserRound size={20} />}</IconBox>}
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
                    {caminoInv && (
                      <IdentityItem
                        index={2}
                        label={caminoInv.label}
                        value={invDef?.nombre}
                        t={invTone}
                        media={invDef
                          ? (caminoInv.insignia
                            ? cfg.iconos.caminoInvestido(invDef.id, 40)
                            : <IconBox t={invTone}>{f.poderes.length === 1 ? <MetalGlyph metal={f.poderes[0].metal} arte={f.poderes[0].arte} size={26} /> : cfg.iconos.caminoInvestido(invDef.id, 20)}</IconBox>)
                          : <IconBox><CosmereIcon name="cosmere-emblem" size={20} /></IconBox>}
                        onPick={invPick}
                      />
                    )}
                    {bendiciones && (
                      <div style={{ gridColumn: '1 / -1' }}>
                        <IdentityItem
                          index={3}
                          label={f.bendiciones.length > 1 ? 'Bendiciones' : 'Bendición'}
                          value={f.bendiciones.length > 0 ? f.bendiciones.map((id) => bendiciones.find((b) => b.id === id)?.nombre ?? id).join(' · ') : undefined}
                          t={asc?.tone}
                          media={<IconBox t={asc?.tone}>{asc?.icono(20)}</IconBox>}
                          onPick={!editing && canEdit ? () => setPicker('bendicion') : undefined}
                        />
                      </div>
                    )}
                  </div>
                  {/* The immediate save of the Investida path failed: the optimistic copy was already rolled back */}
                  {caminoInv && (aplicarCaminoMetal.isError || quitarCaminoMetal.isError) && (
                    <ErrorMessage
                      message={`No se ha podido guardar el ${caminoInv.label.toLowerCase()}. Inténtalo de nuevo.`}
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>
              )
            })()}

            {/* Concentración · Investidura · Desvío · Movimiento · Recuperación · Sentidos */}
            {(() => {
              const vacio: StatDesglose = { total: 0, lineas: [], situacional: [] }
              const conc = f.concentracion ?? vacio
              const inv  = f.investidura  ?? vacio
              const mov  = f.movimiento   ?? vacio
              // Preview line of an attribute bonus: «Forma: X» for a cantor, the server's own name for the bonuses it sends (§6.3)
              const bonoLabel = (v: number) => isCantor ? `${v} (Forma: ${formaActiva})` : `${v} (${nombreBonos})`

              // Líneas situacionales (reacciones, infusiones…): visibles pero fuera del total.
              const situacional = (s: StatDesglose) => s.situacional.length > 0 ? (
                <div style={{ marginTop: 4 }}>
                  {s.situacional.map((l, i) => (
                    <div key={i} style={{ color: c.muted }}>
                      {!l.sinValor && <>{l.valor >= 0 ? '+' : ''}{l.valor}{s.unidad === 'm' ? ' m' : ''} </>}{l.concepto}
                      {l.descripcionCondicion ? ` · ${l.descripcionCondicion}` : ''}
                    </div>
                  ))}
                </div>
              ) : null

              // Concentración — la calcula el servidor: 2 + VOL + forma (VOL y concentración directa) + talentos.
              // En edición se previsualiza con la Voluntad del formulario, conservando las líneas de talentos.
              // La Voluntad suma el bono de atributo (forma o servidor); la concentración directa de la forma sigue saliendo de `formaBonus`.
              const concVol = f.voluntad ?? 0
              const concFb  = fbOf('voluntad') + (formaBonus.concentracion ?? 0)
              const concTalentos = lineasTalento(conc)
              const concShown = editing ? 2 + concVol + concFb + sumaLineas(concTalentos) : conc.total
              const concSub = editing
                ? [`2 (Base)`, `${concVol} (Voluntad)`, ...(concFb !== 0 ? [bonoLabel(concFb)] : []), ...concTalentos.map(fmtLinea)].join(' + ')
                : desgloseStr(conc)

              // Investidura — 2 + mayor de DIS/PRE (con bono) + talentos. Misma previsualización. Quién la tiene lo decide el mundo: en
              // Tormentas el director elige la Orden en el formulario y la tarjeta se enciende al instante (`f.caminoRadiante`); en un mundo
              // sin Orden la decide el servidor, que da un total mayor que 0 solo a quien tiene Investidura (alomantes).
              const tieneInv = cfg.features.caminoRadiante ? !!f.caminoRadiante : inv.total > 0
              const fbDis = fbOf('discernimiento')
              const fbPre = fbOf('presencia')
              const invDis = f.discernimiento ?? 0
              const invPre = f.presencia ?? 0
              const usaDis = invDis + fbDis >= invPre + fbPre
              const invBase = usaDis ? invDis : invPre
              const invFb   = usaDis ? fbDis : fbPre
              const invTalentos = lineasTalento(inv)
              const invShown = editing ? 2 + invBase + invFb + sumaLineas(invTalentos) : inv.total
              const invSub = editing
                ? [`2 (Base)`, `${invBase} (${usaDis ? 'Discernimiento' : 'Presencia'})`, ...(invFb !== 0 ? [bonoLabel(invFb)] : []), ...invTalentos.map(fmtLinea)].join(' + ')
                : desgloseStr(inv)
              // Estado de mesa del mundo: «Investidura actual» (T29), solo si el mundo la lleva y el personaje tiene Investidura
              const recursoInv = cfg.recursos.find((r) => r.clave === 'investiduraActual')
              const invMax = char.investidura?.total ?? 0
              const invActual = Math.min(invMax, Math.max(0, char.recursos.investiduraActual ?? 0))

              // Desvío — el servidor toma el mayor entre armadura y forma (no se acumulan, Manual pp. 33–37)
              // y añade los talentos situacionales (Réplica fulminante = grados en Disciplina).
              const desv = f.desvioCalculado ?? { ...vacio, total: Math.max(f.desvio ?? 0, formaBonus.desvio ?? 0) }
              const desvSub = (desv.lineas.length > 0 && !(desv.lineas.length === 1 && desv.lineas[0].concepto === 'Base')) || desv.situacional.length > 0 ? (
                <>
                  {desv.lineas.length > 0 && !(desv.lineas.length === 1 && desv.lineas[0].concepto === 'Base') && (
                    <span style={desv.lineas.some((l) => l.esBono) ? { color: bonoInk } : undefined}>{desgloseStr(desv)}</span>
                  )}
                  {situacional(desv)}
                </>
              ) : undefined

              const vel = f.velocidad ?? 0
              const vol = f.voluntad ?? 0
              const dis = f.discernimiento ?? 0
              // Effective values include the attribute bonuses (cantor form, or the server's bonuses in worlds that use them), view only
              const velEff = vel + fbOf('velocidad')
              const volEff = vol + fbOf('voluntad')
              const disEff = dis + fbOf('discernimiento')
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

                    <StatCard index={1} label="Investidura" icon={<Glifo icon={cfg.iconos.investidura} size={14} />} t={tone.amatista} sub={tieneInv ? (invSub || undefined) : undefined}>
                      {tieneInv ? (
                        <div style={statValue(tone.amatista)}>{invShown}</div>
                      ) : (
                        <div style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.4 }}>{cfg.textos.sinInvestidura}</div>
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
                        VEL {velEff}{velEff !== vel ? <span style={{ color: bonoInk }}> (+{fbOf('velocidad')})</span> : null}
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
                      sub={<>VOL {volEff}{volEff !== vol ? <span style={{ color: bonoInk }}> (+{fbOf('voluntad')})</span> : null}</>}
                    >
                      <div style={{ ...statValue(tone.granate), fontFamily: font.mono, letterSpacing: 0 }}>{dadoRec}</div>
                    </StatCard>

                    <StatCard
                      index={5}
                      label="Alcance sentidos"
                      icon={<StatIcons.sentidos size={14} />}
                      t={tone.circon}
                      sub={<>DIS {disEff}{disEff !== dis ? <span style={{ color: bonoInk }}> (+{fbOf('discernimiento')})</span> : null}</>}
                    >
                      <div style={statValue(tone.circon, disEff >= 9 ? fs.lg : fs.xl + 2)}>{alcance}</div>
                    </StatCard>
                  </div>

                  {recursoInv && tieneInv && (
                    <InvestiduraActual
                      key={char.id}
                      index={6}
                      label={recursoInv.label}
                      icon={<Glifo icon={cfg.iconos.investidura} size={14} />}
                      actual={invActual}
                      max={invMax}
                      enEdicion={editing}
                      puedeActuar={canEdit}
                      error={mesaMutation.isError}
                      errorVial={mesaMutation.variables?.accion.tipo === 'beber-vial'}
                      onCambiar={cambiarInvestidura}
                      onInicioEscena={(sorprendido) => mesa({ tipo: 'inicio-escena', sorprendido })}
                      onBeberVial={char.poderes.some(esPoderDelVial) ? () => setPicker('vial') : undefined}
                    />
                  )}
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
                                {!s.sinValor && <span style={{ fontWeight: 700, color: t.fg, fontVariantNumeric: 'tabular-nums' }}>{s.valor >= 0 ? '+' : ''}{s.valor}</span>}
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
        {tabActiva === 'atributos' && (
          <TabPanel idPrefix={TAB_PREFIX} id="atributos" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ── Warning: puntos de atributo ──────────────────────────── */}
            {(() => {
              // Sum of raw attribute values (bonuses of any origin are not part of the allowance: the form's are temporary, the server's come as lines)
              const totalAttr = (f.fuerza ?? 0) + (f.velocidad ?? 0) + (f.intelecto ?? 0)
                + (f.voluntad ?? 0) + (f.discernimiento ?? 0) + (f.presencia ?? 0)
              const esperados = getPuntosAtributoEsperados(f.level ?? 1, ascActual?.puntosAtributoBase ?? 12)
              const diff = totalAttr - esperados
              const exceso = diff > 0
              const puntos = diff === 0 ? null : (
                <AvisoAtributos
                  t={exceso ? tone.topacio : tone.zafiro}
                  icon={exceso ? <TriangleAlert size={18} /> : <Info size={18} />}
                  title={exceso ? 'Exceso de puntos de atributo' : 'Puntos de atributo por asignar'}
                >
                  {exceso
                    ? `${totalAttr} puntos asignados, pero a nivel ${f.level} corresponden ${esperados}. Retira ${diff} punto${diff > 1 ? 's' : ''}.`
                    : `${totalAttr} puntos asignados de ${esperados} disponibles a nivel ${f.level}. Quedan ${-diff} punto${-diff > 1 ? 's' : ''} por repartir.`}
                </AvisoAtributos>
              )

              // Creation (level 1), only in a world that declares a limit per attribute (L.20 / PDF 26): no attribute takes more than `tope`
              // points when the character is made, and some ancestries raise one (sangre koloss, Fuerza 4: L.38 / PDF 44). A notice, never a block
              const tope = cfg.topeCreacionAtributo
              const limiteDe = (k: AttrField) => ascActual?.topeCreacion?.[k] ?? tope ?? Infinity
              const pasados = tope !== undefined && (f.level ?? 1) <= 1 ? ATTR_KEYS.filter((k) => numField(f, k) > limiteDe(k)) : []
              const salvo = Object.entries(ascActual?.topeCreacion ?? {}).map(([k, v]) => `${ATTR_NAMES[k]} (hasta ${v})`)
              const creacion = pasados.length === 0 ? null : (
                <AvisoAtributos t={tone.topacio} icon={<TriangleAlert size={18} />} title="Atributos por encima del límite de creación">
                  {`Al crear el personaje, ningún atributo puede tener más de ${tope} puntos asignados${salvo.length > 0 ? `, salvo ${salvo.join(' y ')}` : ''}. `
                    + `Ahora superan el límite: ${pasados.map((k) => `${ATTR_NAMES[k]} ${numField(f, k)}`).join(', ')}.`}
                </AvisoAtributos>
              )
              return <>{puntos}{creacion}</>
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
                              type="number" min={0} max={topeAtributo(k)}
                              aria-label={`${ATTR_NAMES[k]} (${label})`}
                              value={numField(form, k)}
                              onChange={set(k as keyof UpdateCharacterRequest)}
                              style={{ width: 88, textAlign: 'center', ...numeral, fontSize: fs.xl, padding: '6px 8px' }}
                            />
                          ) : (
                            <div style={{ ...numeral, fontSize: fs['2xl'] + 2, color: c.text }}>
                              {attrTotal}
                              {attrFb > 0 && (
                                <sup style={{ fontSize: fs.xs, fontWeight: 700, color: bonoInk, marginLeft: 3 }}>
                                  +{attrFb}<span className="sr-only">{bonoSr}</span>
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

                    {/* Custom skills for this section (slots n1 and n2). The Investida skills of the world (Alomancia, Feruquimia) sit in a slot
                        by exact name and have a block of their own: the rows after it are the free slots */}
                    {(() => {
                      const investidaDe = (n: number) => cfg.habilidadesInvestidas.find((h) => h.nombre === strField(f, `habilidadPersonalizada${n}`))
                      const investidas = section.customNs.filter((n) => investidaDe(n))
                      const libres = section.customNs.filter((n) => !investidaDe(n))
                      const fila = (n: number, primera = false) => {
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
                        const investida = investidaDe(n)
                        // A surge or an Investida skill: its name and attribute are fixed, only its ranks are edited
                        const bloqueada = isPotencia || !!investida
                        const glifo = isPotencia
                          ? <SurgeIcon surge={customName} size={18} style={{ color: t.fg }} />
                          : investida ? <Glifo icon={investida.icono} size={18} style={{ color: t.fg }} /> : null

                        if (!editing && !customName) return null

                        return (
                          <li key={n} style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            minHeight: 52, padding: '6px 16px',
                            borderTop: primera ? 'none' : `1px dashed ${t.border}`,
                          }}>
                            {editing ? (
                              <>
                                {bloqueada ? (
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
                                {bloqueada ? (
                                  <span style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.base - 1, fontWeight: 600, color: c.text }}>
                                    {glifo}
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
                                  {glifo}
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
                      }
                      return (
                        <>
                          {investidas.length > 0 && (
                            <li style={{ borderTop: `1px dashed ${t.border}` }}>
                              <p id={`${fieldId}-inv-${section.key}`} style={{ ...eyebrow, padding: '10px 16px 0' }}>Habilidades Investidas</p>
                              <ul aria-labelledby={`${fieldId}-inv-${section.key}`} style={{ listStyle: 'none' }}>
                                {investidas.map((n, i) => fila(n, i === 0))}
                              </ul>
                            </li>
                          )}
                          {libres.map((n) => fila(n))}
                        </>
                      )
                    })()}
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
                            {!s.sinValor && (
                              <span style={{ fontSize: fs.sm, fontWeight: 700, color: s.valor >= 0 ? t.fg : tone.rubi.fg, fontVariantNumeric: 'tabular-nums' }}>
                                {s.valor >= 0 ? '+' : ''}{s.valor}
                              </span>
                            )}
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

        {/* ARTES METÁLICAS TAB (worlds with metallic arts): lazy, rendered only while the tab is open */}
        {tabActiva === 'artesMetalicas' && (
          <TabPanel idPrefix={TAB_PREFIX} id="artesMetalicas" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <Suspense fallback={<Spinner />}>
              <ArtesMetalicasTab
                character={char}
                isGm={isGm}
                editing={editing}
                puedeActuar={canEdit}
                entorno={entornoCamino}
                vivo={vivo}
                onPatch={(cuerpo) => mesa({ tipo: 'recursos', cuerpo })}
                onAnadirPoder={(poder) => anadirPoder.mutate(poder)}
                errorMesa={mesaMutation.isError}
                errorAnadir={anadirPoder.isError}
                anadiendo={anadirPoder.isPending}
              />
            </Suspense>
          </TabPanel>
        )}

        {/* BACKGROUND TAB */}
        {tabActiva === 'background' && (
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
        options={ascendencias.map((a) => ({ id: a.id, label: a.label, tone: a.tone, icon: a.icono(20) }))}
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

      {/* Nacidos de la bruma: lazy pickers, mounted only while open (§7.4 rule 4). They save at once and are never opened in edit mode */}
      {picker === 'caminoMetal' && (
        <Suspense fallback={<Sheet open onClose={() => setPicker(null)} title="Cargando…" maxWidth={480}><Spinner /></Sheet>}>
          <CaminoMetalPicker
            open
            onClose={() => setPicker(null)}
            era={era}
            ascendencia={char.ascendencia}
            caminoMetal={char.caminoMetal}
            caminoInicial={char.caminoInicial}
            tieneCaminoHeroico={!!char.caminoHeroico}
            personaje={char}
            entorno={entornoCamino}
            onQuitar={() => { setPicker(null); setConfirmarCamino({ tipo: 'quitar' }) }}
            onConfirm={(camino, caminoInicial, metales) => {
              if (editing) return
              if (camino === char.caminoMetal) {
                // The same path: only its starting role changes (main talent and free degree); there are no metals to choose
                setPicker(null)
                aplicarCaminoMetal.mutate({ camino, seleccion: { caminoInicial, poderes: null, paraMeta: [] } })
              } else {
                // Step 4 of the flow: the metals of the new path
                setCaminoPendiente({ camino, caminoInicial, ...metales })
                setPicker('metal')
              }
            }}
          />
        </Suspense>
      )}
      {picker === 'metal' && caminoPendiente && (
        <Suspense fallback={<Sheet open onClose={() => setPicker(null)} title="Cargando…" maxWidth={560}><Spinner /></Sheet>}>
          <MetalPicker
            open
            onClose={() => { setPicker(null); setCaminoPendiente(null) }}
            arte={caminoPendiente.arte}
            modo={caminoPendiente.modo}
            era={era}
            caminoMetal={caminoPendiente.camino}
            // Powers the character keeps from another origin (spike, lerasium alloy, medallion); those of the current path go away with it
            yaElegidos={char.poderes.filter((p) => p.origen !== 'camino').map((p) => `${p.arte}:${p.metal}`)}
            onConfirm={(poderes, paraMeta) => {
              const { camino, caminoInicial } = caminoPendiente
              const seleccion: SeleccionCaminoMetal = { caminoInicial, poderes, paraMeta }
              setPicker(null)
              setCaminoPendiente(null)
              if (editing) return
              // Changing an assigned path removes what the previous one gave, so it asks first (every removal is confirmed)
              if (char.caminoMetal) setConfirmarCamino({ tipo: 'cambiar', camino, seleccion })
              else aplicarCaminoMetal.mutate({ camino, seleccion })
            }}
          />
        </Suspense>
      )}
      <ConfirmDialog
        open={confirmarCamino?.tipo === 'quitar'}
        title={`¿Quitar el ${(cfg.caminoInvestido?.label ?? 'camino').toLowerCase()}?`}
        message="Se quitarán el talento principal, la habilidad Investida y los poderes obtenidos por el camino. Los poderes de otro origen y las metas ya creadas se conservan."
        confirmLabel="Quitar camino"
        tone="danger"
        icon="trash"
        onConfirm={() => { setConfirmarCamino(null); if (!editing) quitarCaminoMetal.mutate() }}
        onCancel={() => setConfirmarCamino(null)}
      />
      <ConfirmDialog
        open={confirmarCamino?.tipo === 'cambiar'}
        title="¿Cambiar de camino?"
        message={(() => {
          const nombre = (id: string) => cfg.caminoInvestido?.caminos.find((p) => p.id === id)?.nombre ?? id
          const nuevo = confirmarCamino?.tipo === 'cambiar' ? nombre(confirmarCamino.camino) : ''
          return `Se quitarán el talento principal, la habilidad Investida y los poderes obtenidos por el camino de ${nombre(char.caminoMetal)}, y se aplicará el de ${nuevo}. Los poderes de otro origen y las metas ya creadas se conservan.`
        })()}
        confirmLabel="Cambiar camino"
        tone="danger"
        icon="warning"
        onConfirm={() => {
          const pendiente = confirmarCamino
          setConfirmarCamino(null)
          if (pendiente?.tipo === 'cambiar' && !editing) aplicarCaminoMetal.mutate({ camino: pendiente.camino, seleccion: pendiente.seleccion })
        }}
        onCancel={() => setConfirmarCamino(null)}
      />
      {picker === 'bendicion' && (
        <Suspense fallback={<Sheet open onClose={() => setPicker(null)} title="Cargando…" maxWidth={480}><Spinner /></Sheet>}>
          <BendicionPicker
            open
            onClose={() => setPicker(null)}
            value={char.bendiciones}
            isGm={isGm}
            onConfirm={(bendiciones) => { identidadMutation.mutate({ bendiciones }); setPicker(null) }}
          />
        </Suspense>
      )}
      {/* The vial (T31): the same kind of lazy sheet; the metals it holds go up as `beber-vial` and the page closes it, like the pickers above */}
      {picker === 'vial' && (
        <Suspense fallback={<Sheet open onClose={() => setPicker(null)} title="Cargando…" maxWidth={480}><Spinner /></Sheet>}>
          <BeberVialSheet
            open
            onClose={() => setPicker(null)}
            character={char}
            isGm={isGm}
            onBeber={(metales) => { setPicker(null); mesa({ tipo: 'beber-vial', metales }) }}
          />
        </Suspense>
      )}

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
