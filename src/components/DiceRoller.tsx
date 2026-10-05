import { useState, useCallback, useEffect, useId, useMemo, useRef, useSyncExternalStore, type CSSProperties, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { ArrowDown, ArrowUp, Check, ChevronDown, History, X, type LucideIcon } from 'lucide-react'
import {
  rollSkill, rollDamage, rollRecovery, rollContested, rollFree, rollCombat,
  recoveryDieFaces, buildRollLabel,
  type AnyRollResult, type TramaDieResult, type AdvantageMode,
} from '../utils/dice'
import { diceRollsApi, type DiceRollResponse } from '../api/diceRolls'
import { charactersApi } from '../api/characters'
import { useCampaignHub } from '../hooks/useCampaignHub'
import { useDialogA11y } from '../hooks/useDialogA11y'
import { useCampaignStore, useWorldConfig } from '../store/campaignStore'
import { useAuthStore } from '../store/authStore'
import type { Character } from '../types'
import type { SkillField } from '../lib/talentGraph'
import type { AttrField, HabilidadDef, WorldConfig } from '../worlds/types'
import { Avatar, Button, EmptyState, Field, IconButton, Input, Segmented, Select, Stepper, Tabs, type TabItem } from './ui'
import { PlotIcon } from './GameIcons'
import { cosmereImage } from '../lib/cosmereAssets'
import { RollModeIcons } from '../lib/gameIcons'
import { characterPalette } from '../lib/avatar'
import { c, eyebrow, font, fs, pill, radius, shadow, tint, tone, z, type Tone } from '../theme'

// ── Constantes ─────────────────────────────────────────────────────────────

const DAMAGE_DICE = [4, 6, 8, 10, 12, 20]

// Weapon skills of the Combate tab. They are looked up by FIELD in the skill table of the world (T43) because their label changes
// from one world to another («Armas ligeras» / «Armamento ligero»)
const ARMAS: SkillField[] = ['armasLigeras', 'armasPesadas', 'agilidad']

// Mapa código de atributo (guardado en habilidades personalizadas) → campo del Character
const ATTR_CODE_TO_FIELD: Record<string, AttrField> = {
  FUE: 'fuerza',
  VEL: 'velocidad',
  INT: 'intelecto',
  VOL: 'voluntad',
  DIS: 'discernimiento',
  PRE: 'presencia',
}

/** What the roller reads from the world of the campaign: its `WorldConfig`, never a world id (P4) */
interface RollerWorld {
  /** Skill table of the roller: `habilidadesTirador ?? habilidades` (Stormlight keeps its legacy table until T50) */
  habilidades: HabilidadDef[]
  /** Labels of that table, in its order: what the skill selectors list */
  skills: string[]
  /** Labels of the weapon skills of the Combate tab, found by field in that table */
  armas: string[]
  /** Investida skills that can attack (Alomancia) */
  ataquesInvestidos: WorldConfig['habilidadesInvestidas']
  /** `features.bonosServidor`: add the attribute bonus the server computes (`character.bonosAtributos`) to every modifier */
  bonosAtributos: boolean
  /** `features.artesMetalicas`: the Investiture does not come back with rest */
  artesMetalicas: boolean
}

function useRollerWorld(): RollerWorld {
  const cfg = useWorldConfig()
  return useMemo(() => {
    const habilidades = cfg.habilidadesTirador ?? cfg.habilidades
    return {
      habilidades,
      skills: habilidades.map((h) => h.label),
      armas: ARMAS.flatMap((field) => habilidades.find((h) => h.field === field)?.label ?? []),
      ataquesInvestidos: cfg.habilidadesInvestidas.filter((h) => h.ataque),
      bonosAtributos: cfg.features.bonosServidor,
      artesMetalicas: cfg.features.artesMetalicas,
    }
  }, [cfg])
}

/** Prefix of the `derivadosSet` keys of an Investida skill: its name without accents and in lower case («Alomancia» → `alomancia`, as the `grupo` of `WorldConfig.derivados`) */
const arteDe = (nombre: string) => nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

/** «dado d8»; the table of the arts (L.163 / PDF 169) gives 1 = «sin tirada» with no degrees */
const formatDado = (caras: number) => (caras > 1 ? `dado d${caras}` : 'sin dado')

/**
 * Devuelve el modificador del personaje para la habilidad dada: habilidad + atributo asociado.
 * `bonosAtributos` (`features.bonosServidor`) suma además el bono de atributo que calcula el servidor (`character.bonosAtributos`:
 * Bendiciones kandra, Tamaño desmedido…) al atributo de la habilidad, estándar o personalizada. `habilidades` = tabla del tirador del mundo.
 */
function getCharMod(char: Character, skillName: string, bonosAtributos: boolean, habilidades: HabilidadDef[]): number | null {
  const bono = (attr: AttrField) => (bonosAtributos ? (char.bonosAtributos?.[attr] ?? 0) : 0)
  const hab = habilidades.find((h) => h.label === skillName)
  if (hab) {
    const skillVal = (char[hab.field] as number) ?? 0
    const attrVal  = (char[hab.atributo] as number) ?? 0
    return skillVal + attrVal + bono(hab.atributo)
  }
  // Habilidades personalizadas
  for (let i = 1; i <= 6; i++) {
    const nombre = char[`habilidadPersonalizada${i}` as keyof Character] as string
    const valor  = char[`habilidadPersonalizada${i}Valor` as keyof Character] as number
    const attrCode = char[`habilidadPersonalizada${i}Atributo` as keyof Character] as string
    if (nombre && nombre.trim().toLowerCase() === skillName.trim().toLowerCase()) {
      const attrField = ATTR_CODE_TO_FIELD[attrCode?.toUpperCase?.() ?? '']
      const attrVal = attrField ? ((char[attrField] as number) ?? 0) : 0
      return (valor ?? 0) + attrVal + (attrField ? bono(attrField) : 0)
    }
  }
  return null
}

/** Lista de habilidades del personaje (las del tirador del mundo + personalizadas no vacías) */
function getCharSkills(char: Character, skills: string[]): string[] {
  const custom: string[] = []
  for (let i = 1; i <= 6; i++) {
    const nombre = char[`habilidadPersonalizada${i}` as keyof Character] as string
    if (nombre?.trim()) custom.push(nombre.trim())
  }
  return [...skills, ...custom.filter((s) => !skills.includes(s))]
}

/* Dado de trama: Oportunidad is the book's blue (brand), Complicación climbs topacio → heliodoro → rubí. */
const TRAMA_STYLE: Record<TramaDieResult, { tone: Tone; label: string; plot: 'oportunidad' | 'complicacion' | null }> = {
  blank: { tone: tone.cuarzo, label: '—', plot: null },
  O:     { tone: tone.brand, label: 'Oportunidad', plot: 'oportunidad' },
  C1:    { tone: tone.topacio, label: 'Complicación 1', plot: 'complicacion' },
  C2:    { tone: tone.heliodoro, label: 'Complicación 2', plot: 'complicacion' },
  C3:    { tone: tone.rubi, label: 'Complicación 3', plot: 'complicacion' },
  // C4 = worst: a full-strength rubí outline (a stronger fill would drop the text under 4.5:1 on paper)
  C4:    { tone: { fg: tone.rubi.fg, bg: tint('var(--rubi)', 14), border: 'var(--rubi)' }, label: 'Complicación 4', plot: 'complicacion' },
}

/** Official full-colour illustrations */
const D20_IMG = cosmereImage('dado-d20')
const TRAMA_IMG = cosmereImage('dado-trama')

const ADVANTAGE_OPTIONS: { value: AdvantageMode; label: ReactNode }[] = [
  { value: 'normal', label: 'Normal' },
  { value: 'ventaja', label: <><ArrowUp size={15} aria-hidden /> Ventaja</> },
  { value: 'desventaja', label: <><ArrowDown size={15} aria-hidden /> Desventaja</> },
]

const faceOptions = (list: number[]) => list.map((d) => ({ value: d, label: `d${d}` }))

// ── Estilos compartidos ────────────────────────────────────────────────────

/** From 640px the sheet is a centred dialog: the tabs stack icon over label so all seven fit without scrolling */
const WIDE_QUERY = '(min-width: 640px)'
const subscribeWide = (cb: () => void) => {
  const m = window.matchMedia(WIDE_QUERY)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const getWide = () => window.matchMedia(WIDE_QUERY).matches
const useWide = () => useSyncExternalStore(subscribeWide, getWide, () => false)

const stack: CSSProperties = { display: 'flex', flexDirection: 'column', gap: 20 }
const captionStyle: CSSProperties = { ...eyebrow, display: 'block', marginBottom: 8 }
const helperStyle: CSSProperties = { fontSize: fs.xs, color: c.subtle, marginTop: 8, lineHeight: 1.45 }
const numberInput: CSSProperties = { textAlign: 'center', fontFamily: font.mono, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }
const breakdownStyle: CSSProperties = { fontFamily: font.mono, fontSize: fs.xs, color: c.muted, marginTop: 6, fontVariantNumeric: 'tabular-nums' }
const unitStyle: CSSProperties = { fontSize: fs.sm, color: c.muted, fontWeight: 550 }

/** Dice results: Geist Mono, tabular */
const bigNumber = (color: string, size = 44): CSSProperties => ({
  fontFamily: font.mono,
  fontSize: size,
  fontWeight: 700,
  lineHeight: 1,
  letterSpacing: '-0.03em',
  fontVariantNumeric: 'tabular-nums',
  color,
})

const dieChip = (discarded = false): CSSProperties => ({
  minWidth: 34,
  height: 34,
  padding: '0 6px',
  borderRadius: radius.xs + 2,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: font.mono,
  fontSize: fs.sm,
  fontWeight: 600,
  fontVariantNumeric: 'tabular-nums',
  color: discarded ? c.subtle : c.text,
  background: discarded ? 'transparent' : c.s1,
  border: `1px ${discarded ? 'dashed' : 'solid'} ${c.borderBright}`,
})

/** Visible caption above a radiogroup / stepper (their accessible name comes from ariaLabel / label) */
function Caption({ children }: { children: ReactNode }) {
  return <p aria-hidden style={captionStyle}>{children}</p>
}

/** Diagonal strike (╱, corner to corner of its box) over discarded dice */
function Strike({ inset = 0 }: { inset?: number | string }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute', inset, pointerEvents: 'none',
        background: `linear-gradient(to bottom right, transparent calc(50% - 1px), ${c.muted} calc(50% - 1px), ${c.muted} calc(50% + 1px), transparent calc(50% + 1px))`,
      }}
    />
  )
}

/** ↑ / ↓ between the two dice of a roll with ventaja / desventaja */
function AdvArrow({ mode }: { mode: AdvantageMode }) {
  const up = mode === 'ventaja'
  return (
    <span style={{ display: 'inline-flex', color: c.subtle }}>
      {up ? <ArrowUp size={18} aria-hidden /> : <ArrowDown size={18} aria-hidden />}
      <span className="sr-only">{up ? 'con ventaja' : 'con desventaja'}</span>
    </span>
  )
}

function DiceList({ dice, label = 'Dados', discarded = false }: { dice: number[]; label?: string; discarded?: boolean }) {
  return (
    <ul role="list" aria-label={label} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', listStyle: 'none', justifyContent: 'inherit' }}>
      {dice.map((v, i) => <li key={i} style={dieChip(discarded)}>{v}</li>)}
    </ul>
  )
}

// ── Grupo de dados de daño (con soporte ventaja) ──────────────────────────

function DiceGroup({ dice, modifier, dimmed }: { dice: number[]; modifier: number; dimmed?: boolean }) {
  const sum = dice.reduce((a, b) => a + b, 0)
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative' }}>
        <DiceList dice={dice} label={dimmed ? 'Dados descartados' : 'Dados elegidos'} discarded={dimmed} />
        {dimmed && <Strike inset="2px 4px" />}
      </div>
      <span style={{ fontFamily: font.mono, fontSize: fs.sm, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: dimmed ? c.subtle : tone.rubi.fg }}>
        {sum}{modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier} = ${Math.max(0, sum + modifier)}` : ''}
      </span>
    </div>
  )
}

// ── Badge de personaje activo ──────────────────────────────────────────────

function CharacterBadge({ char }: { char: Character }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap',
        padding: '8px 12px', borderRadius: radius.md,
        background: tone.esmeralda.bg, border: `1px solid ${tone.esmeralda.border}`,
      }}
    >
      <Avatar name={char.name} size={30} tone={characterPalette(char.id).tone} />
      <span style={{ fontSize: fs.sm, fontWeight: 650, color: c.text }}>{char.name}</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: fs.xs, fontWeight: 600, color: tone.esmeralda.fg }}>
        <Check size={14} aria-hidden /> valores auto-rellenados
      </span>
    </div>
  )
}

/** Read-only modifier shown when the character fills it in (the editable input stays hidden, as before) */
function AutoModifier({ label, value, style }: { label: string; value: number; style?: CSSProperties }) {
  return (
    <div style={style}>
      <p style={captionStyle}>{label}</p>
      <p
        style={{
          minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: radius.sm, border: `1px solid ${tone.esmeralda.border}`, background: tone.esmeralda.bg,
          fontFamily: font.mono, fontSize: fs.md, fontWeight: 700, color: c.text, fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value >= 0 ? '+' : ''}{value}
      </p>
    </div>
  )
}

// ── Toggle de dado de trama ────────────────────────────────────────────────

function TramaToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      title={value ? 'Desactivar dado de trama' : 'Activar dado de trama'}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, width: '100%', minHeight: 56,
        padding: '8px 14px', borderRadius: radius.md, cursor: 'pointer', textAlign: 'left',
        border: `1px solid ${value ? tone.brand.border : c.borderBright}`,
        background: value ? tone.brand.bg : 'transparent',
        color: c.text,
        transition: 'background var(--dur-1), border-color var(--dur-1)',
      }}
    >
      {TRAMA_IMG && (
        <img
          src={TRAMA_IMG}
          alt=""
          width={28}
          height={32}
          draggable={false}
          style={{ objectFit: 'contain', filter: value ? undefined : 'grayscale(1)', opacity: value ? 1 : 0.6, transition: 'filter var(--dur-2), opacity var(--dur-2)' }}
        />
      )}
      <span style={{ flex: 1, minWidth: 0, fontSize: fs.base, fontWeight: 650 }}>Dado de trama</span>
      {/* pill switch */}
      <span
        aria-hidden
        style={{
          position: 'relative', width: 44, height: 26, flexShrink: 0, borderRadius: radius.full,
          background: value ? c.brandFill : c.s3,
          border: `1px solid ${value ? 'transparent' : c.borderStrong}`,
          transition: 'background var(--dur-2)',
        }}
      >
        <span
          style={{
            position: 'absolute', top: 3, left: value ? 21 : 3, width: 18, height: 18, borderRadius: '50%',
            background: value ? c.onBrand : c.subtle,
            transition: 'left var(--dur-2) var(--ease-out), background var(--dur-2)',
          }}
        />
      </span>
    </button>
  )
}

// ── Subcomponentes de resultado ────────────────────────────────────────────

function TramaBadge({ result }: { result: TramaDieResult }) {
  const s = TRAMA_STYLE[result]
  return (
    // The tint sits on an opaque surface so the text keeps AA on any bubble or card behind it
    <span style={{ ...pill(s.tone), background: `linear-gradient(${s.tone.bg}, ${s.tone.bg}), ${c.s1}`, letterSpacing: '0.02em' }}>
      {s.plot && <PlotIcon result={s.plot} size={14} />}
      <span className="sr-only">Dado de trama: </span>
      {result === 'blank' ? <><span aria-hidden>—</span><span className="sr-only">sin resultado</span></> : s.label}
    </span>
  )
}

/** Plot die result: official illustration + official symbol */
function TramaResult({ result }: { result: TramaDieResult }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {TRAMA_IMG && <img src={TRAMA_IMG} alt="" width={26} height={30} draggable={false} style={{ objectFit: 'contain' }} />}
      <TramaBadge result={result} />
    </div>
  )
}

function D20Display({ value, discarded = false }: { value: number; discarded?: boolean }) {
  const t = discarded ? tone.cuarzo : value === 20 ? tone.gold : value === 1 ? tone.rubi : tone.brand
  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <div
        style={{
          width: 64, height: 64, borderRadius: radius.md,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          ...bigNumber(t.fg, 28),
          background: discarded ? 'transparent' : t.bg,
          border: `2px ${discarded ? 'dashed' : 'solid'} ${t.border}`,
        }}
      >
        <span className="sr-only">d20: </span>
        {value}
        {discarded && <span className="sr-only"> (descartado)</span>}
      </div>
      {discarded && <Strike inset={14} />}
    </div>
  )
}

/** One d20, or both dice with the discarded one struck through */
function D20Pair({ d20a, d20b, finalD20, advantage }: { d20a: number; d20b: number | null; finalD20: number; advantage: AdvantageMode }) {
  if (d20b === null) return <D20Display value={finalD20} />
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <D20Display value={d20a} discarded={finalD20 !== d20a} />
      <AdvArrow mode={advantage} />
      <D20Display value={d20b} discarded={finalD20 !== d20b} />
    </div>
  )
}

function NaturalNote({ d20 }: { d20: number }) {
  if (d20 !== 20 && d20 !== 1) return null
  const crit = d20 === 20
  const t = crit ? tone.gold : tone.rubi
  return (
    <p
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, textAlign: 'center',
        padding: '8px 12px', borderRadius: radius.sm,
        background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
        fontSize: fs.xs, fontWeight: 700, letterSpacing: '0.04em',
      }}
    >
      <PlotIcon result={crit ? 'oportunidad' : 'complicacion'} size={14} />
      {crit ? '¡NATURAL 20! — Oportunidad garantizada' : 'NATURAL 1 — Complicación garantizada'}
    </p>
  )
}

/** Result card: announces a short summary to screen readers, scrolls itself into view and pops in on every roll */
function ResultArea({ result, accent, children }: { result: AnyRollResult | null; accent?: Tone; children?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!result || !el) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' })
    if (!reduce && typeof el.animate === 'function') {
      el.animate(
        [{ opacity: 0, transform: 'translateY(8px) scale(0.98)' }, { opacity: 1, transform: 'none' }],
        { duration: 260, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' },
      )
    }
  }, [result])
  return (
    <>
      <p role="status" className="sr-only">{result ? buildRollLabel(result) : ''}</p>
      {result && (
        <div
          ref={ref}
          style={{
            display: 'flex', flexDirection: 'column', gap: 14,
            padding: 16, borderRadius: radius.lg,
            background: c.s2, border: `1px solid ${accent?.border ?? c.border}`,
            boxShadow: shadow[1],
          }}
        >
          {children}
        </div>
      )}
    </>
  )
}

function RollButton({ onClick, label, icon: Icon = RollModeIcons.free }: { onClick: () => void; label: string; icon?: LucideIcon }) {
  return (
    <Button size="lg" fullWidth onClick={onClick} icon={<Icon size={18} aria-hidden />}>
      {label}
    </Button>
  )
}

/** "DAÑO" divider inside the Combate tab */
function SectionDivider({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div aria-hidden className="hairline" style={{ flex: 1 }} />
      <h3 style={{ ...eyebrow, fontFamily: font.ui, color: c.gold, lineHeight: 1.2 }}>{children}</h3>
      <div aria-hidden className="hairline" style={{ flex: 1 }} />
    </div>
  )
}

// ── Historial ──────────────────────────────────────────────────────────────

function TramaInline({ result }: { result: TramaDieResult }) {
  const s = TRAMA_STYLE[result]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontFamily: font.ui, fontSize: fs.xs, fontWeight: 700, color: s.tone.fg }}>
      {s.plot && <PlotIcon result={s.plot} size={12} />}
      {s.label}
    </span>
  )
}

function HistoryRow({ type, label, children }: { type: AnyRollResult['type']; label: ReactNode; children: ReactNode }) {
  const Icon = RollModeIcons[type]
  return (
    <li style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 34, borderBottom: `1px solid ${c.border}` }}>
      <Icon size={14} aria-hidden style={{ color: c.subtle }} />
      <span style={{ fontSize: fs.xs, color: c.muted, minWidth: 92, fontWeight: 600 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontFamily: font.mono, fontSize: fs.sm, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
        {children}
      </span>
    </li>
  )
}

function HistoryEntry({ r }: { r: AnyRollResult }) {
  if (r.type === 'skill') {
    return (
      <HistoryRow type="skill" label={r.skillName}>
        <span style={{ color: tone.brand.fg }}>{r.total}</span>
        {r.trama !== 'blank' && <TramaInline result={r.trama} />}
      </HistoryRow>
    )
  }
  if (r.type === 'damage') {
    return (
      <HistoryRow type="damage" label={<>{r.dice.length}d{r.dieFaces}</>}>
        <span style={{ color: tone.rubi.fg }}>{r.total} daño</span>
      </HistoryRow>
    )
  }
  if (r.type === 'recovery') {
    return (
      <HistoryRow type="recovery" label="Recuperación">
        <span style={{ color: tone.esmeralda.fg }}>+{r.result}</span>
      </HistoryRow>
    )
  }
  if (r.type === 'contested') {
    const w = r.winner === 'attacker' ? r.attackerName : r.winner === 'defender' ? r.defenderName : 'Empate'
    return (
      <HistoryRow type="contested" label="Enfrentada">
        <span style={{ color: tone.brand.fg }}>
          {r.attacker.total} vs {r.defender.total} — {w}
        </span>
      </HistoryRow>
    )
  }
  if (r.type === 'free') {
    return (
      <HistoryRow type="free" label={<>{r.count}d{r.faces}</>}>
        <span style={{ color: c.text }}>{r.total}</span>
      </HistoryRow>
    )
  }
  if (r.type === 'combat') {
    return (
      <HistoryRow type="combat" label={r.skillName}>
        <span style={{ color: tone.brand.fg }}>{r.attackTotal}</span>
        <span style={{ color: tone.rubi.fg }}>{r.damageTotal} daño</span>
        {r.trama !== 'blank' && <TramaInline result={r.trama} />}
      </HistoryRow>
    )
  }
  return null
}

// ── Pestañas de tirada ─────────────────────────────────────────────────────

// Tab: Habilidad
function SkillTab({ onRoll, char }: { onRoll: (r: AnyRollResult) => void; char?: Character | null }) {
  const world = useRollerWorld()
  const skills = char ? getCharSkills(char, world.skills) : world.skills
  const [skillName, setSkillName] = useState(skills[0])
  const [modifier, setModifier] = useState(0)
  const [advantage, setAdvantage] = useState<AdvantageMode>('normal')
  const [useTrama, setUseTrama] = useState(true)
  const [result, setResult] = useState<ReturnType<typeof rollSkill> | null>(null)

  // Auto-rellenar modificador desde el personaje
  useEffect(() => {
    if (!char) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- existing auto-fill behaviour, kept as-is in the rebrand
    setModifier(getCharMod(char, skillName, world.bonosAtributos, world.habilidades) ?? 0)
  }, [char, skillName, world])

  const handleRoll = () => {
    const effectiveMod = char ? (getCharMod(char, skillName, world.bonosAtributos, world.habilidades) ?? 0) : modifier
    const r = rollSkill({ skillName, modifier: effectiveMod, advantage, useTrama })
    setResult(r)
    onRoll(r)
  }

  return (
    <div style={stack}>
      {char && <CharacterBadge char={char} />}

      {/* Skill selector + modifier (oculto cuando hay personaje: se auto-rellena) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 108px', gap: 12, alignItems: 'end' }}>
        <Field label="Habilidad">
          <Select value={skillName} onChange={(e) => setSkillName(e.target.value)}>
            {skills.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        {!char ? (
          <Field label="Modificador">
            <Input
              type="number"
              value={modifier}
              onChange={(e) => setModifier(Number(e.target.value))}
              style={numberInput}
            />
          </Field>
        ) : (
          <AutoModifier label="Modificador" value={getCharMod(char, skillName, world.bonosAtributos, world.habilidades) ?? 0} />
        )}
      </div>

      {/* Advantage */}
      <div>
        <Caption>Ventaja / Desventaja</Caption>
        <Segmented<AdvantageMode> ariaLabel="Ventaja / Desventaja" options={ADVANTAGE_OPTIONS} value={advantage} onChange={setAdvantage} />
      </div>

      {/* Dado de trama */}
      <TramaToggle value={useTrama} onChange={setUseTrama} />

      <RollButton onClick={handleRoll} label={`Tirar ${skillName}`} icon={RollModeIcons.skill} />

      <ResultArea result={result}>
        {result && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <D20Pair d20a={result.d20a} d20b={result.d20b} finalD20={result.finalD20} advantage={result.advantage} />
              <div style={{ flex: 1, minWidth: 96 }}>
                <span style={bigNumber(c.text)}>
                  <span className="sr-only">Total: </span>{result.total}
                </span>
                {result.modifier !== 0 && (
                  <p style={breakdownStyle}>
                    d20 ({result.finalD20}) {result.modifier >= 0 ? '+' : ''}{result.modifier} = {result.total}
                  </p>
                )}
              </div>
            </div>
            <TramaResult result={result.trama} />
            <NaturalNote d20={result.finalD20} />
          </>
        )}
      </ResultArea>
    </div>
  )
}

// Tab: Daño
function DamageTab({ onRoll }: { onRoll: (r: AnyRollResult) => void }) {
  const [count, setCount] = useState(1)
  const [faces, setFaces] = useState(6)
  const [modifier, setModifier] = useState(0)
  const [advantage, setAdvantage] = useState<AdvantageMode>('normal')
  const [result, setResult] = useState<ReturnType<typeof rollDamage> | null>(null)

  const handleRoll = () => {
    const r = rollDamage({ count, faces, modifier, advantage })
    setResult(r)
    onRoll(r)
  }

  return (
    <div style={stack}>
      {/* Dice config */}
      <div>
        <Caption>Dados</Caption>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Stepper value={count} onChange={setCount} min={1} max={10} label="Número de dados" />
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <Segmented<number> ariaLabel="Caras del dado" options={faceOptions(DAMAGE_DICE)} value={faces} onChange={setFaces} />
          </div>
        </div>
        <p style={helperStyle}>Tirando {count}d{faces}</p>
      </div>

      <Field label="Modificador">
        <Input
          type="number"
          value={modifier}
          onChange={(e) => setModifier(Number(e.target.value))}
          style={{ ...numberInput, maxWidth: 160 }}
        />
      </Field>

      {/* Ventaja / Desventaja */}
      <div>
        <Caption>Ventaja / Desventaja</Caption>
        <Segmented<AdvantageMode> ariaLabel="Ventaja / Desventaja" options={ADVANTAGE_OPTIONS} value={advantage} onChange={setAdvantage} />
      </div>

      <RollButton onClick={handleRoll} label={`Tirar ${count}d${faces}`} icon={RollModeIcons.damage} />

      <ResultArea result={result} accent={tone.rubi}>
        {result && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={bigNumber(tone.rubi.fg)}>{result.total}</span>
              <span style={unitStyle}>daño</span>
            </div>
            {result.diceAlt ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <DiceGroup dice={result.dice}    modifier={result.modifier} />
                <AdvArrow mode={result.advantage} />
                <DiceGroup dice={result.diceAlt} modifier={result.modifier} dimmed />
              </div>
            ) : (
              <div>
                <DiceList dice={result.dice} />
                {result.modifier !== 0 && (
                  <p style={breakdownStyle}>
                    Dados ({result.dice.reduce((a, b) => a + b, 0)}) {result.modifier >= 0 ? '+' : ''}{result.modifier} = {result.total}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </ResultArea>
    </div>
  )
}

// Tab: Recuperación
/** Voluntad for the recovery die: with `features.bonosServidor` it adds the bonus the server computes (a kandra's Blessing of Stability), as the sheet does */
function voluntadRecuperacion(char: Character, bonosAtributos: boolean): number {
  return char.voluntad + (bonosAtributos ? (char.bonosAtributos?.voluntad ?? 0) : 0)
}

function RecoveryTab({ onRoll, char }: { onRoll: (r: AnyRollResult) => void; char?: Character | null }) {
  const world = useRollerWorld()
  const [voluntad, setVoluntad] = useState(char?.voluntad != null ? voluntadRecuperacion(char, world.bonosAtributos) : 3)
  const [medicineBonus, setMedicineBonus] = useState(0)
  const [result, setResult] = useState<ReturnType<typeof rollRecovery> | null>(null)

  // Sincronizar voluntad si cambia el personaje
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- existing sync behaviour, kept as-is in the rebrand
    if (char?.voluntad != null) setVoluntad(voluntadRecuperacion(char, world.bonosAtributos))
  }, [char, world.bonosAtributos])

  const faces = recoveryDieFaces(voluntad)

  const handleRoll = () => {
    const r = rollRecovery({ voluntad, medicineBonus })
    setResult(r)
    onRoll(r)
  }

  const VOLUNTAD_TABLE = [
    { range: '0', die: 'd4' }, { range: '1–2', die: 'd6' },
    { range: '3–4', die: 'd8' }, { range: '5–6', die: 'd10' },
    { range: '7–8', die: 'd12' }, { range: '9+', die: 'd20' },
  ]

  return (
    <div style={stack}>
      {char && <CharacterBadge char={char} />}

      {/* Voluntad */}
      <div>
        <Caption>Voluntad del personaje</Caption>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Stepper value={voluntad} onChange={setVoluntad} min={0} label="Voluntad del personaje" />
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 44, padding: '0 14px',
              borderRadius: radius.sm, background: tone.esmeralda.bg, border: `1px solid ${tone.esmeralda.border}`,
            }}
          >
            <span style={{ fontSize: fs.xs, fontWeight: 600, color: c.muted }}>Dado:</span>
            <span style={{ fontFamily: font.mono, fontSize: fs.lg, fontWeight: 700, color: tone.esmeralda.fg }}>d{faces}</span>
          </div>
        </div>
      </div>

      {/* Voluntad table */}
      <ul role="list" aria-label="Dado de recuperación según Voluntad" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6, listStyle: 'none' }}>
        {VOLUNTAD_TABLE.map(({ range, die }) => {
          const isActive = die === `d${faces}`
          return (
            <li
              key={range}
              aria-current={isActive || undefined}
              style={{
                padding: '8px 6px', borderRadius: radius.sm, textAlign: 'center',
                background: isActive ? tone.esmeralda.bg : 'transparent',
                border: `1px solid ${isActive ? tone.esmeralda.border : c.border}`,
              }}
            >
              <div style={{ ...eyebrow, color: isActive ? tone.esmeralda.fg : c.subtle }}>VOL {range}</div>
              <div style={{ fontFamily: font.mono, fontSize: fs.md, fontWeight: 700, marginTop: 2, color: isActive ? tone.esmeralda.fg : c.muted }}>{die}</div>
            </li>
          )
        })}
      </ul>

      {/* Medicine bonus */}
      <Field label="Bonus Medicina (aliado)" hint="Un aliado puede añadir su modificador de Medicina a tu tirada durante el descanso.">
        <Input
          type="number"
          value={medicineBonus}
          onChange={(e) => setMedicineBonus(Number(e.target.value))}
          placeholder="0"
          style={{ ...numberInput, maxWidth: 160 }}
        />
      </Field>

      <RollButton onClick={handleRoll} label={`Tirar d${faces}`} icon={RollModeIcons.recovery} />

      <ResultArea result={result} accent={tone.esmeralda}>
        {result && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={bigNumber(tone.esmeralda.fg, 48)}>
                +{result.result}
              </span>
              <span style={unitStyle}>puntos</span>
            </div>
            <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
              Distribuye entre <strong style={{ color: c.text }}>Salud</strong> y/o <strong style={{ color: c.text }}>Concentración</strong> como prefieras.
              {world.artesMetalicas && <> La Investidura no se recupera con el descanso: usa <strong style={{ color: c.text }}>Beber vial</strong>.</>}
            </p>
            {result.medicineBonus !== 0 && (
              <p style={{ ...breakdownStyle, marginTop: 0 }}>
                Tirada ({result.result - result.medicineBonus}) + Medicina ({result.medicineBonus}) = {result.result}
              </p>
            )}
          </>
        )}
      </ResultArea>
    </div>
  )
}

const sideBox = (accent: Tone | null): CSSProperties => ({
  minWidth: 0,
  margin: 0,
  padding: 12,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  borderRadius: radius.md,
  border: `1px solid ${accent ? accent.border : c.borderBright}`,
  background: accent ? accent.bg : 'transparent',
})

// Floated legend = a normal flex item inside the fieldset (still names the group)
const legendStyle = (color: string): CSSProperties => ({ ...eyebrow, float: 'left', width: '100%', padding: 0, color })

// Tab: Enfrentada
function ContestedTab({ onRoll, char }: { onRoll: (r: AnyRollResult) => void; char?: Character | null }) {
  const world = useRollerWorld()
  const charSkills = char ? getCharSkills(char, world.skills) : world.skills
  const [atkName, setAtkName] = useState(char?.name ?? 'Atacante')
  const [atkSkill, setAtkSkill] = useState(charSkills[0])
  const [defName, setDefName] = useState('Defensor')
  const [atkMod, setAtkMod] = useState(0)
  const [defMod, setDefMod] = useState(0)
  const [useTrama, setUseTrama] = useState(true)
  const [result, setResult] = useState<ReturnType<typeof rollContested> | null>(null)

  // Sincronizar lado atacante con el personaje
  useEffect(() => {
    if (!char) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- existing sync behaviour, kept as-is in the rebrand
    setAtkName(char.name)
    setAtkMod(getCharMod(char, atkSkill, world.bonosAtributos, world.habilidades) ?? 0)
  }, [char, atkSkill, world])

  const handleRoll = () => {
    const effectiveAtkMod = char ? (getCharMod(char, atkSkill, world.bonosAtributos, world.habilidades) ?? 0) : atkMod
    const r = rollContested({ attackerName: atkName, defenderName: defName, attackerMod: effectiveAtkMod, defenderMod: defMod, useTrama })
    setResult(r)
    onRoll(r)
  }

  return (
    <div style={stack}>
      {char && <CharacterBadge char={char} />}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        {/* Attacker */}
        <fieldset style={sideBox(tone.brand)}>
          <legend style={legendStyle(tone.brand.fg)}>ATACANTE</legend>
          <Field label="Nombre">
            <Input value={atkName} onChange={(e) => setAtkName(e.target.value)} placeholder="Nombre" />
          </Field>
          {char ? (
            <Field label="Habilidad">
              <Select value={atkSkill} onChange={(e) => setAtkSkill(e.target.value)} style={{ fontSize: fs.sm }}>
                {charSkills.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
          ) : null}
          {/* With a character the attacker modifier is auto-filled (the typed value was ignored on roll): read-only */}
          {!char ? (
            <Field label="Modificador">
              <Input type="number" value={atkMod} onChange={(e) => setAtkMod(Number(e.target.value))} style={numberInput} />
            </Field>
          ) : (
            <AutoModifier label="Modificador" value={getCharMod(char, atkSkill, world.bonosAtributos, world.habilidades) ?? 0} />
          )}
        </fieldset>

        {/* Defender */}
        <fieldset style={sideBox(null)}>
          <legend style={legendStyle(c.subtle)}>DEFENSOR</legend>
          <Field label="Nombre">
            <Input value={defName} onChange={(e) => setDefName(e.target.value)} placeholder="Nombre" />
          </Field>
          <Field label="Modificador">
            <Input type="number" value={defMod} onChange={(e) => setDefMod(Number(e.target.value))} style={numberInput} />
          </Field>
        </fieldset>
      </div>

      {/* Dado de trama */}
      <TramaToggle value={useTrama} onChange={setUseTrama} />

      <RollButton onClick={handleRoll} label="Tirar enfrentada" icon={RollModeIcons.contested} />

      <ResultArea result={result}>
        {result && (() => {
          const atkWin = result.winner === 'attacker'
          const tie = result.winner === 'tie'
          const banner = tie ? tone.cuarzo : atkWin ? tone.brand : tone.rubi
          return (
            <>
              {/* Winner banner */}
              <p
                style={{
                  textAlign: 'center', padding: '8px 12px', borderRadius: radius.sm,
                  fontSize: fs.sm, fontWeight: 700,
                  background: banner.bg, border: `1px solid ${banner.border}`, color: banner.fg,
                }}
              >
                {tie ? 'Empate' : `${result.winner === 'attacker' ? result.attackerName : result.defenderName} gana`}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)', gap: 8, alignItems: 'center' }}>
                {/* Attacker side */}
                <div style={{ textAlign: 'center', minWidth: 0 }}>
                  <p style={{ ...eyebrow, color: tone.brand.fg, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {result.attackerName.toUpperCase()}
                  </p>
                  <p style={{ ...bigNumber(atkWin ? tone.brand.fg : c.muted, 40), marginTop: 8 }}>
                    {result.attacker.total}
                  </p>
                  <p style={breakdownStyle}>
                    d20 ({result.attacker.d20}) {result.attacker.modifier >= 0 ? '+' : ''}{result.attacker.modifier}
                  </p>
                </div>

                <span style={{ fontFamily: font.display, fontStyle: 'italic', fontSize: fs.lg, color: c.subtle }}>vs</span>

                {/* Defender side */}
                <div style={{ textAlign: 'center', minWidth: 0 }}>
                  <p style={{ ...eyebrow, color: c.subtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {result.defenderName.toUpperCase()}
                  </p>
                  <p style={{ ...bigNumber(!atkWin && !tie ? tone.rubi.fg : c.muted, 40), marginTop: 8 }}>
                    {result.defender.total}
                  </p>
                  <p style={breakdownStyle}>
                    d20 ({result.defender.d20}) {result.defender.modifier >= 0 ? '+' : ''}{result.defender.modifier}
                  </p>
                </div>
              </div>

              {result.attacker.trama !== 'blank' && (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <TramaResult result={result.attacker.trama} />
                </div>
              )}
            </>
          )
        })()}
      </ResultArea>
    </div>
  )
}

// Tab: Libre
function FreeTab({ onRoll }: { onRoll: (r: AnyRollResult) => void }) {
  const [count, setCount] = useState(1)
  const [faces, setFaces] = useState(20)
  const [result, setResult] = useState<ReturnType<typeof rollFree> | null>(null)
  const otherId = useId()
  const wide = useWide()
  const facesGroupRef = useRef<HTMLDivElement>(null)

  const handleRoll = () => {
    const r = rollFree(count, faces)
    setResult(r)
    onRoll(r)
  }

  const QUICK_DICE = [4, 6, 8, 10, 12, 20, 100]
  const isQuickFace = QUICK_DICE.includes(faces)

  // Segmented only makes the checked radio tabbable. With a custom face count ("Otro") none is checked,
  // so the whole group dropped out of the Tab order: keep the first radio reachable, as the WAI-ARIA radio pattern does.
  useEffect(() => {
    const radios = facesGroupRef.current?.querySelectorAll<HTMLElement>('[role="radio"]')
    radios?.forEach((r, i) => {
      r.tabIndex = r.getAttribute('aria-checked') === 'true' || (!isQuickFace && i === 0) ? 0 : -1
    })
  }, [faces, isQuickFace])

  return (
    <div style={stack}>
      {/* Count */}
      <div>
        <Caption>Número de dados</Caption>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Stepper value={count} onChange={setCount} min={1} max={20} label="Número de dados" />
          <span style={{ fontFamily: font.mono, fontSize: fs.xl, fontWeight: 500, color: c.muted }}>d{faces}</span>
        </div>
      </div>

      {/* Faces */}
      <div>
        <Caption>Caras del dado</Caption>
        {/* Seven faces: compact on phones so d100 fits in the 390px row */}
        <div ref={facesGroupRef}>
          <Segmented<number> ariaLabel="Caras del dado" options={faceOptions(QUICK_DICE)} value={faces} onChange={setFaces} size={wide ? 'md' : 'sm'} />
        </div>
        {/* Custom faces */}
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <label htmlFor={otherId} style={{ fontSize: fs.sm, fontWeight: 600, color: c.muted }}>Otro:</label>
          <Input
            id={otherId}
            type="number"
            value={faces}
            min={2}
            onChange={(e) => setFaces(Math.max(2, Number(e.target.value)))}
            style={{ ...numberInput, width: 96 }}
          />
        </div>
      </div>

      <RollButton onClick={handleRoll} label={`Tirar ${count}d${faces}`} icon={RollModeIcons.free} />

      <ResultArea result={result}>
        {result && (
          <>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={bigNumber(c.text)}>{result.total}</span>
              {result.count > 1 && <span style={unitStyle}>total</span>}
            </div>
            {result.count > 1 && <DiceList dice={result.results} />}
          </>
        )}
      </ResultArea>
    </div>
  )
}

// With more than three attack skills (Mistborn adds Alomancia) the selector takes two columns at every width: labels such as
// «Armamento pesado» do not fit four in a row, not even in the 600px of the dialog; with three (Stormlight) it keeps its single row
const attackSkillsGrid: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }

// Tab: Combate (ataque + daño simultáneos)
function CombatTab({ onRoll, char }: { onRoll: (r: AnyRollResult) => void; char?: Character | null }) {
  const world = useRollerWorld()
  // The weapon skills of the world's table, then the Investida skills that attack (Alomancia) the character has; the director with no
  // character picked gets them all and types the modifier. A skill that is no longer on offer (another character picked) falls back to the first
  const investidas = world.ataquesInvestidos.filter((h) => !char || getCharMod(char, h.nombre, world.bonosAtributos, world.habilidades) !== null)
  const WEAPON_SKILLS = [...world.armas, ...investidas.map((h) => h.nombre)]
  const [pickedSkill, setSkillName] = useState(world.armas[0])
  const skillName = WEAPON_SKILLS.includes(pickedSkill) ? pickedSkill : WEAPON_SKILLS[0]
  const [attackMod, setAttackMod] = useState(0)
  const [advantage, setAdvantage] = useState<AdvantageMode>('normal')
  const [diceCount, setDiceCount] = useState(1)
  const [diceFaces, setDiceFaces] = useState(6)
  const [damageMod, setDamageMod] = useState(0)
  const [damageAdvantage, setDamageAdvantage] = useState<AdvantageMode>('normal')
  const [useTrama, setUseTrama] = useState(true)
  const [result, setResult] = useState<ReturnType<typeof rollCombat> | null>(null)

  // Die and reach of an Investida attack: the server computes them for the character (`derivadosSet`, L.163 / PDF 169)
  const investida = investidas.find((h) => h.nombre === skillName)
  const dado = investida ? char?.derivadosSet[`${arteDe(investida.nombre)}.dado`]?.total : undefined
  const alcance = investida ? char?.derivadosSet[`${arteDe(investida.nombre)}.alcance`] : undefined
  const detalleInvestida = investida && [dado !== undefined && formatDado(dado), alcance && `alcance ${alcance.total} ${alcance.unidad ?? 'm'}`].filter(Boolean).join(' · ')

  // Auto-rellenar modificador de ataque desde el personaje
  useEffect(() => {
    if (!char) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- existing auto-fill behaviour, kept as-is in the rebrand
    setAttackMod(getCharMod(char, skillName, world.bonosAtributos, world.habilidades) ?? 0)
  }, [char, skillName, world])

  // Preselect the die of the Investida attack; the damage dice stay free to change afterwards
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- same auto-fill from the character as the modifier above
    if (dado !== undefined && DAMAGE_DICE.includes(dado)) setDiceFaces(dado)
  }, [dado])

  const handleRoll = () => {
    const effectiveAttackMod = char ? (getCharMod(char, skillName, world.bonosAtributos, world.habilidades) ?? 0) : attackMod
    const r = rollCombat({ skillName, attackModifier: effectiveAttackMod, advantage, diceCount, diceFaces, damageModifier: damageMod, damageAdvantage, useTrama })
    setResult(r)
    onRoll(r)
  }

  return (
    <div style={stack}>
      {char && <CharacterBadge char={char} />}

      {/* Arma */}
      <div>
        <Caption>Habilidad de ataque</Caption>
        <Segmented<string>
          ariaLabel="Habilidad de ataque"
          options={WEAPON_SKILLS.map((s) => ({ value: s, label: s }))}
          value={skillName}
          onChange={setSkillName}
          style={WEAPON_SKILLS.length > 3 ? attackSkillsGrid : undefined}
        />
        {detalleInvestida && <p style={helperStyle}>{skillName}: {detalleInvestida}</p>}
      </div>

      {/* Modificador ataque — oculto cuando hay personaje (se auto-rellena) */}
      {!char ? (
        <Field label="Mod. ataque">
          <Input type="number" value={attackMod} onChange={(e) => setAttackMod(Number(e.target.value))} style={{ ...numberInput, maxWidth: 160 }} />
        </Field>
      ) : (
        <AutoModifier label="Mod. ataque" value={getCharMod(char, skillName, world.bonosAtributos, world.habilidades) ?? 0} style={{ maxWidth: 160 }} />
      )}

      {/* Ventaja */}
      <div>
        <Caption>Ventaja / Desventaja</Caption>
        <Segmented<AdvantageMode> ariaLabel="Ventaja / Desventaja" options={ADVANTAGE_OPTIONS} value={advantage} onChange={setAdvantage} />
      </div>

      {/* Separador visual daño */}
      <SectionDivider>Daño</SectionDivider>

      {/* Dados de daño */}
      <div>
        <Caption>Dados</Caption>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <Stepper value={diceCount} onChange={setDiceCount} min={1} max={10} label="Dados de daño" />
          <div style={{ flex: '1 1 240px', minWidth: 0 }}>
            <Segmented<number> ariaLabel="Caras del dado de daño" options={faceOptions(DAMAGE_DICE)} value={diceFaces} onChange={setDiceFaces} />
          </div>
        </div>
      </div>

      {/* Ventaja daño */}
      <div>
        <Caption>Ventaja / Desventaja daño</Caption>
        <Segmented<AdvantageMode> ariaLabel="Ventaja / Desventaja daño" options={ADVANTAGE_OPTIONS} value={damageAdvantage} onChange={setDamageAdvantage} />
      </div>

      {/* Mod. daño */}
      <Field label="Mod. daño">
        <Input type="number" value={damageMod} onChange={(e) => setDamageMod(Number(e.target.value))} style={{ ...numberInput, maxWidth: 160 }} />
      </Field>

      {/* Dado de trama */}
      <TramaToggle value={useTrama} onChange={setUseTrama} />

      <RollButton onClick={handleRoll} label={`Atacar con ${skillName}`} icon={RollModeIcons.combat} />

      {/* Resultado combinado */}
      <ResultArea result={result}>
        {result && (
          <>
            {/* Ataque */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <D20Pair d20a={result.d20a} d20b={result.d20b} finalD20={result.finalD20} advantage={result.advantage} />
              <div style={{ flex: 1, minWidth: 96 }}>
                <span style={bigNumber(c.text, 40)}>
                  <span className="sr-only">Ataque: </span>{result.attackTotal}
                </span>
                {result.attackModifier !== 0 && (
                  <p style={breakdownStyle}>
                    d20 ({result.finalD20}) {result.attackModifier >= 0 ? '+' : ''}{result.attackModifier} = {result.attackTotal}
                  </p>
                )}
              </div>
            </div>
            <TramaResult result={result.trama} />

            {/* Separador */}
            <div aria-hidden className="hairline" />

            {/* Daño */}
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 10 }}>
                <span style={bigNumber(tone.rubi.fg, 40)}>{result.damageTotal}</span>
                <span style={unitStyle}>daño</span>
              </div>
              {result.diceAlt ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <DiceGroup dice={result.dice}    modifier={result.damageModifier} />
                  <AdvArrow mode={result.damageAdvantage} />
                  <DiceGroup dice={result.diceAlt} modifier={result.damageModifier} dimmed />
                </div>
              ) : (
                <>
                  <DiceList dice={result.dice} />
                  {result.damageModifier !== 0 && (
                    <p style={breakdownStyle}>
                      Dados ({result.dice.reduce((a, b) => a + b, 0)}) {result.damageModifier >= 0 ? '+' : ''}{result.damageModifier} = {result.damageTotal}
                    </p>
                  )}
                </>
              )}
            </div>

            <NaturalNote d20={result.finalD20} />
          </>
        )}
      </ResultArea>
    </div>
  )
}

// ── Tab: Registro (tiradas compartidas en tiempo real) ─────────────────────

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
}

const ROLL_TYPE_ICONS: Record<string, LucideIcon> = {
  skill: RollModeIcons.skill,
  damage: RollModeIcons.damage,
  recovery: RollModeIcons.recovery,
  contested: RollModeIcons.contested,
  free: RollModeIcons.free,
  combat: RollModeIcons.combat,
}

function RollTypeIcon({ type, style }: { type: string; style?: CSSProperties }) {
  const Icon = ROLL_TYPE_ICONS[type] ?? RollModeIcons.free
  return <Icon size={15} aria-hidden style={style} />
}

function RegistroEntry({ roll, myUserId }: { roll: DiceRollResponse; myUserId: number }) {
  const isMe = roll.userId === myUserId
  const parsed: AnyRollResult | null = (() => {
    try { return JSON.parse(roll.rollData) } catch { return null }
  })()

  const trama: TramaDieResult | null =
    parsed && 'trama' in parsed ? (parsed as { trama: TramaDieResult }).trama : null

  // Nombre principal a mostrar: personaje si existe, si no el usuario
  const displayName = roll.characterName ?? roll.userDisplayName
  // Si el GM está personificando a un personaje, mostrar "(GM)" como aclaración
  const gmSuffix = roll.characterName && isMe ? ' (GM)' : ''

  return (
    <li
      className="rise"
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: isMe ? 'flex-end' : 'flex-start',
        gap: 4,
      }}
    >
      {/* Name + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.xs }}>
        {!isMe && (
          <span style={{ fontWeight: 700, color: roll.characterName ? tone.amatista.fg : tone.brand.fg }}>
            {displayName}
          </span>
        )}
        <time dateTime={roll.createdAt} style={{ color: c.subtle, fontVariantNumeric: 'tabular-nums' }}>
          {formatTime(roll.createdAt)}
        </time>
        {isMe && (
          <span style={{ fontWeight: 700, color: roll.characterName ? tone.amatista.fg : c.subtle }}>
            {roll.characterName ? `${roll.characterName}${gmSuffix}` : 'Tú'}
          </span>
        )}
      </div>

      {/* Bubble */}
      <div
        style={{
          maxWidth: '90%', padding: '10px 14px', borderRadius: radius.lg,
          borderBottomRightRadius: isMe ? 4 : radius.lg,
          borderBottomLeftRadius: isMe ? radius.lg : 4,
          background: isMe ? tone.brand.bg : c.s2,
          border: `1px solid ${isMe ? tone.brand.border : c.border}`,
          display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <RollTypeIcon type={roll.rollType} style={{ color: isMe ? tone.brand.fg : c.muted, marginTop: 2 }} />
          <span style={{ fontSize: fs.sm, fontWeight: 650, color: c.text, lineHeight: 1.4 }}>
            {roll.rollLabel}
          </span>
        </div>
        {trama && trama !== 'blank' && <TramaBadge result={trama} />}
      </div>
    </li>
  )
}

function RegistroTab({ campaignId }: { campaignId: number }) {
  const [rolls, setRolls] = useState<DiceRollResponse[]>([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const myUserId = useAuthStore((s) => s.user?.id ?? 0)

  // Load initial rolls
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- existing loading flow, kept as-is in the rebrand
    setLoading(true)
    diceRollsApi.getRecent(campaignId, 50)
      .then(setRolls)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [campaignId])

  // Listen for new rolls via SignalR (passed from parent via context / prop)
  // Parent registers the handler and passes new rolls down
  // → handled by the addRoll callback below, exposed via window event for simplicity
  useEffect(() => {
    const handler = (e: Event) => {
      const roll = (e as CustomEvent<DiceRollResponse>).detail
      setRolls((prev) => [...prev, roll])
    }
    window.addEventListener('diceRollReceived', handler)
    return () => window.removeEventListener('diceRollReceived', handler)
  }, [])

  // Auto-scroll to bottom when new rolls arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [rolls])

  if (loading) {
    return (
      <div role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '40px 0', color: c.muted, fontSize: fs.sm }}>
        <span
          aria-hidden
          style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--brand-bg)', borderTopColor: c.brand, animation: 'spin 0.8s linear infinite' }}
        />
        Cargando...
      </div>
    )
  }

  if (rolls.length === 0) {
    return (
      <EmptyState
        icon={D20_IMG ? <img src={D20_IMG} alt="" width={32} height={31} draggable={false} /> : <RollModeIcons.free size={24} aria-hidden />}
        title="Aún no hay tiradas en esta campaña."
        description="Las tiradas de todos los jugadores aparecerán aquí en tiempo real."
        style={{ marginTop: 8 }}
      />
    )
  }

  return (
    <div role="log" aria-live="polite" aria-label="Registro de tiradas">
      <ul role="list" style={{ display: 'flex', flexDirection: 'column', gap: 14, listStyle: 'none' }}>
        {rolls.map((r) => (
          <RegistroEntry key={r.id} roll={r} myUserId={myUserId} />
        ))}
      </ul>
      <div ref={bottomRef} />
    </div>
  )
}

// ── Componente principal ───────────────────────────────────────────────────

type TabId = 'combat' | 'skill' | 'damage' | 'recovery' | 'contested' | 'free' | 'registro'

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: 'combat',    label: 'Combate',      icon: RollModeIcons.combat },
  { id: 'skill',     label: 'Habilidad',    icon: RollModeIcons.skill },
  { id: 'damage',    label: 'Daño',         icon: RollModeIcons.damage },
  { id: 'recovery',  label: 'Recuperación', icon: RollModeIcons.recovery },
  { id: 'contested', label: 'Enfrentada',   icon: RollModeIcons.contested },
  { id: 'free',      label: 'Libre',        icon: RollModeIcons.free },
  { id: 'registro',  label: 'Registro',     icon: RollModeIcons.registro },
]

const TABS_ID = 'dados'

const countBadge: CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  minWidth: 20, height: 20, padding: '0 6px', borderRadius: radius.full,
  background: c.brandFill, color: c.onBrand,
  fontFamily: font.ui, fontSize: fs.xs, fontWeight: 800, lineHeight: 1, fontVariantNumeric: 'tabular-nums',
}

/** Edge fades on the horizontally scrolling tab strip, so the hidden tabs are discoverable */
function useScrollFades(wrapRef: RefObject<HTMLDivElement | null>, active: boolean) {
  const [fades, setFades] = useState({ start: false, end: false })
  useEffect(() => {
    if (!active) return
    const el = wrapRef.current?.querySelector<HTMLElement>('[role="tablist"]')
    if (!el) return
    const update = () => {
      const start = el.scrollLeft > 2
      const end = el.scrollLeft + el.clientWidth < el.scrollWidth - 2
      setFades((f) => (f.start === start && f.end === end ? f : { start, end }))
    }
    const ro = new ResizeObserver(update)
    ro.observe(el)
    el.addEventListener('scroll', update, { passive: true })
    return () => { ro.disconnect(); el.removeEventListener('scroll', update) }
  }, [wrapRef, active])
  return fades
}

const fadeEdge = (side: 'left' | 'right', r: number = radius.full): CSSProperties => ({
  position: 'absolute', top: 1, bottom: 1, [side]: 1, width: 32, pointerEvents: 'none',
  borderRadius: side === 'left' ? `${r}px 0 0 ${r}px` : `0 ${r}px ${r}px 0`,
  background: `linear-gradient(${side === 'left' ? '90deg' : '270deg'}, var(--surface-1) 30%, transparent)`,
})

export function DiceRoller() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<TabId>('combat')
  const [history, setHistory] = useState<AnyRollResult[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [pendingRolls, setPendingRolls] = useState(0)
  const [playerCharacter, setPlayerCharacter] = useState<Character | null>(null)
  const [campaignChars, setCampaignChars] = useState<Character[]>([])
  const [gmSelectedChar, setGmSelectedChar] = useState<Character | null>(null)

  const { currentCampaign, isGm } = useCampaignStore()
  const campaignId = currentCampaign?.id ?? null
  const { user } = useAuthStore()

  const titleId = useId()
  const historyId = useId()
  const asCharId = useId()
  const badgeId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  const tabsWrapRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Cargar personajes según el rol
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- existing reset behaviour, kept as-is in the rebrand
    if (!campaignId) { setPlayerCharacter(null); setCampaignChars([]); return }
    charactersApi.getAll(campaignId)
      .then((chars) => {
        if (isGm) {
          setCampaignChars(chars)
        } else {
          const mine = chars.find((c) => c.ownerId === user?.id) ?? null
          setPlayerCharacter(mine)
        }
      })
      .catch(() => { setPlayerCharacter(null); setCampaignChars([]) })
  }, [campaignId, isGm, user?.id])

  // El personaje efectivo: GM usa el seleccionado, jugador usa el suyo
  const effectiveChar = isGm ? gmSelectedChar : playerCharacter

  // ── SignalR: escuchar tiradas de otros jugadores ──
  const hubHandlers = useCallback(() => ({
    DiceRollReceived: (data: unknown) => {
      const roll = data as DiceRollResponse
      // Dispatch a custom event so RegistroTab can update without prop drilling
      window.dispatchEvent(new CustomEvent('diceRollReceived', { detail: roll }))
      // If registro tab is not open, show badge
      if (activeTab !== 'registro' || !open) {
        setPendingRolls((n) => n + 1)
      }
    },
  }), [activeTab, open])

  useCampaignHub(campaignId, hubHandlers())

  // Clear badge when registro tab is opened
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- existing badge logic, kept as-is in the rebrand
    if (activeTab === 'registro' && open) setPendingRolls(0)
  }, [activeTab, open])

  // ── After each local roll: save to API (fire-and-forget) ──
  const handleRoll = useCallback((r: AnyRollResult) => {
    setHistory((prev) => [r, ...prev].slice(0, 15))
    if (!campaignId) return
    const label = buildRollLabel(r)
    const charName = effectiveChar?.name ?? null
    diceRollsApi.create(campaignId, r.type, r, label, charName).catch(() => {})
    // Note: the server will broadcast DiceRollReceived back to us too,
    // so RegistroTab will update automatically via SignalR
  }, [campaignId, effectiveChar])

  // ── Dialog a11y: focus trap, Escape, scroll lock, focus back to the FAB ──
  const closeSheet = useCallback(() => setOpen(false), [])
  useDialogA11y(sheetRef, open, closeSheet)
  const fades = useScrollFades(tabsWrapRef, open)

  // Keep the active tab visible inside the scrolling tab strip
  useEffect(() => {
    if (!open) return
    const list = tabsWrapRef.current?.querySelector<HTMLElement>('[role="tablist"]')
    const tab = list?.querySelector<HTMLElement>('[aria-selected="true"]')
    if (!list || !tab) return
    const lr = list.getBoundingClientRect()
    const tr = tab.getBoundingClientRect()
    const behavior: ScrollBehavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    if (tr.left < lr.left + 28) list.scrollBy({ left: tr.left - lr.left - 28, behavior })
    else if (tr.right > lr.right - 28) list.scrollBy({ left: tr.right - lr.right + 28, behavior })
  }, [open, activeTab])

  // The panel element is shared by every tab: start each newly selected tab at its top
  useEffect(() => {
    if (panelRef.current) panelRef.current.scrollTop = 0
  }, [activeTab])

  const pendingLabel = pendingRolls > 9 ? '9+' : pendingRolls

  const wide = useWide()

  const tabItems: TabItem<TabId>[] = TABS.map((t) => {
    const showBadge = t.id === 'registro' && pendingRolls > 0
    const Icon = t.icon
    const badge = showBadge ? <span aria-hidden style={countBadge}>{pendingLabel}</span> : null
    return {
      id: t.id,
      icon: wide ? undefined : <Icon size={16} aria-hidden />,
      label: wide ? (
        // Stacked: icon over label, the unread count pinned to the icon
        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '8px 0' }}>
          <span style={{ position: 'relative', display: 'flex' }}>
            <Icon size={18} aria-hidden />
            {badge && <span style={{ position: 'absolute', top: -7, left: 12 }}>{badge}</span>}
          </span>
          {t.label}
        </span>
      ) : (
        <>{t.label}{badge}</>
      ),
      ariaLabel: showBadge ? `${t.label}, ${pendingRolls} tiradas nuevas` : undefined,
    }
  })

  return (
    <>
      {/* ── FAB ─────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        title="Lanzador de dados"
        aria-label="Lanzador de dados"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={pendingRolls > 0 ? badgeId : undefined}
        className="above-bottomnav ui-btn ui-btn--secondary"
        style={{
          position: 'fixed',
          right: 'calc(20px + var(--sar))',
          zIndex: z.fab,
          width: 58,
          height: 58,
          padding: 0,
          borderRadius: '50%',
          isolation: 'isolate',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: c.text,
          background: 'radial-gradient(circle at 50% 30%, var(--sheet-top), var(--surface-1) 75%)',
          border: `1px solid ${tone.brand.border}`,
          boxShadow: `0 0 0 5px var(--brand-bg), ${shadow.glow}`,
        }}
      >
        {D20_IMG ? (
          <img src={D20_IMG} alt="" width={38} height={37} draggable={false} style={{ filter: 'drop-shadow(0 3px 6px var(--brand-glow))' }} />
        ) : (
          <RollModeIcons.free size={24} aria-hidden />
        )}
        {pendingRolls > 0 && (
          <>
            <span aria-hidden style={{ ...countBadge, position: 'absolute', top: -3, right: -3, minWidth: 22, height: 22, boxShadow: '0 0 0 2px var(--bg)' }}>
              {pendingLabel}
            </span>
            <span id={badgeId} className="sr-only">{pendingRolls} tiradas nuevas</span>
          </>
        )}
      </button>

      {/* ── Overlay + sheet (bottom sheet on phones, centred dialog from 640px) ── */}
      {open && createPortal(
        <div className="ui-sheet-wrap" style={{ zIndex: z.sheet }}>
          <div
            className="fade-in"
            aria-hidden
            onClick={() => setOpen(false)}
            style={{
              position: 'absolute', inset: 0,
              background: c.overlay,
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
            }}
          />

          <div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="ui-sheet"
            style={{ maxWidth: 640, height: 'min(820px, 92dvh)' }}
          >
            <div aria-hidden className="ui-sheet-handle" />

            {/* Header (a div, not <header>: inside a portalled dialog it would be a second banner landmark) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '0 12px 16px 20px', flexShrink: 0 }}>
              <span
                aria-hidden
                style={{
                  width: 48, height: 48, flexShrink: 0, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'radial-gradient(circle at 50% 40%, var(--brand-bg), transparent 72%)',
                  boxShadow: shadow.glow,
                }}
              >
                {D20_IMG ? <img src={D20_IMG} alt="" width={34} height={33} draggable={false} /> : <RollModeIcons.free size={22} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                {currentCampaign?.name && (
                  <p style={{ ...eyebrow, color: c.gold, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentCampaign.name}
                  </p>
                )}
                <h2 id={titleId} style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.15, color: c.text }}>
                  Lanzador de dados
                </h2>
              </div>
              <IconButton label="Cerrar lanzador de dados" size={44} onClick={() => setOpen(false)}>
                <X size={20} aria-hidden />
              </IconButton>
            </div>

            {/* History collapsible */}
            {history.length > 0 && (
              <div style={{ padding: '0 20px 12px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => setHistoryOpen(!historyOpen)}
                  aria-expanded={historyOpen}
                  aria-controls={historyOpen ? historyId : undefined}
                  className="ui-row"
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    minHeight: 44, padding: '0 14px', borderRadius: radius.md, cursor: 'pointer',
                    fontSize: fs.sm, fontWeight: 650, color: c.muted,
                    background: 'transparent', border: `1px solid ${c.borderBright}`,
                  }}
                >
                  <History size={16} aria-hidden />
                  <span style={{ flex: 1, textAlign: 'left' }}>Historial ({history.length})</span>
                  <ChevronDown
                    size={16}
                    aria-hidden
                    style={{ transform: historyOpen ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}
                  />
                </button>
                {historyOpen && (
                  <ul
                    id={historyId}
                    role="list"
                    tabIndex={0}
                    aria-label="Historial de tiradas"
                    className="fade-in"
                    style={{
                      listStyle: 'none', marginTop: 8, padding: '2px 14px',
                      borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`,
                      maxHeight: 160, overflowY: 'auto',
                    }}
                  >
                    {history.map((r, i) => <HistoryEntry key={i} r={r} />)}
                  </ul>
                )}
              </div>
            )}

            {/* Selector "Tirar como" — solo visible para el GM */}
            {isGm && campaignChars.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px 12px', flexShrink: 0 }}>
                <label htmlFor={asCharId} style={{ ...eyebrow, whiteSpace: 'nowrap' }}>
                  Tirar como
                </label>
                <Select
                  id={asCharId}
                  value={gmSelectedChar?.id ?? ''}
                  onChange={(e) => {
                    const id = Number(e.target.value)
                    setGmSelectedChar(id ? (campaignChars.find((c) => c.id === id) ?? null) : null)
                  }}
                  style={{
                    flex: 1, minWidth: 0, fontSize: fs.sm, fontWeight: 650,
                    ...(gmSelectedChar
                      ? { backgroundColor: tone.amatista.bg, borderColor: tone.amatista.border, color: tone.amatista.fg }
                      : null),
                  }}
                >
                  <option value="">GM (yo mismo)</option>
                  {campaignChars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}{c.playerName ? ` — ${c.playerName}` : ''}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Tab bar */}
            <div style={{ padding: '0 20px 12px', flexShrink: 0, borderBottom: `1px solid ${c.border}` }}>
              <div ref={tabsWrapRef} style={{ position: 'relative' }}>
                <Tabs<TabId>
                  tabs={tabItems}
                  value={activeTab}
                  onChange={setActiveTab}
                  ariaLabel="Tipo de tirada"
                  idPrefix={TABS_ID}
                  size={wide ? 'sm' : 'md'}
                  stretch={wide}
                  style={wide ? { borderRadius: radius.lg } : undefined}
                />
                {fades.start && <span aria-hidden style={fadeEdge('left', wide ? radius.lg : radius.full)} />}
                {fades.end && <span aria-hidden style={fadeEdge('right', wide ? radius.lg : radius.full)} />}
              </div>
            </div>

            {/* Tab content: the only scroll area */}
            <div
              ref={panelRef}
              role="tabpanel"
              id={`${TABS_ID}-panel-${activeTab}`}
              aria-labelledby={`${TABS_ID}-tab-${activeTab}`}
              tabIndex={activeTab === 'registro' ? 0 : undefined}
              style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '20px 20px calc(24px + var(--sab))' }}
            >
              {activeTab === 'combat'    && <CombatTab    onRoll={handleRoll} char={effectiveChar} />}
              {activeTab === 'skill'     && <SkillTab     onRoll={handleRoll} char={effectiveChar} />}
              {activeTab === 'damage'    && <DamageTab    onRoll={handleRoll} />}
              {activeTab === 'recovery'  && <RecoveryTab  onRoll={handleRoll} char={effectiveChar} />}
              {activeTab === 'contested' && <ContestedTab onRoll={handleRoll} char={effectiveChar} />}
              {activeTab === 'free'      && <FreeTab      onRoll={handleRoll} />}
              {activeTab === 'registro'  && campaignId && <RegistroTab campaignId={campaignId} />}
              {activeTab === 'registro'  && !campaignId && (
                <p style={{ textAlign: 'center', padding: '40px 16px', color: c.muted, fontSize: fs.sm }}>
                  Selecciona una campaña para ver el registro de tiradas.
                </p>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}
