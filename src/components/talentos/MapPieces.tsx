/**
 * Small presentational pieces of the talent map: the SVG edge layer, the state marks of a cell,
 * the activation glyph, the glyph of a metal (goal badge, power bands) and the route step badge.
 * Pure presentation: geometry comes from talentMap.ts.
 */
import type { CSSProperties } from 'react'
import { Anvil, Check, Flame, Plus, Target } from 'lucide-react'
import { CosmereIcon } from '../CosmereIcon'
import type { ActivationType } from '../TalentActivation'
import { c, fs } from '../../theme'
import type { CellMark, EdgeDraw, EdgeStatus, JoinDraw } from './talentMap'
import { ACTIVATION, type Accent } from './talentStyle'

const STATUS_ORDER: EdgeStatus[] = ['pending', 'met', 'hl', 'route']

/** Requirement lines of a plate or lámina. Decorative: every relation is also in the cells' accessible names. */
export function EdgeLayer({ edges, joins, width, height, accent, widths, hlId }: {
  edges: EdgeDraw[]
  joins: JoinDraw[]
  width: number
  height: number
  accent: Accent
  widths: { stroke: number; strokeMet: number; strokeRoute: number }
  /** hovered / focused node: its real parent and child lines are highlighted */
  hlId?: string | null
}) {
  const colour = (s: EdgeStatus) => (s === 'route' ? c.brand : s === 'met' ? accent.ink : s === 'hl' ? c.text : c.subtle)
  const w = (s: EdgeStatus) => (s === 'route' ? widths.strokeRoute : s === 'hl' ? widths.strokeMet + 0.4 : s === 'met' ? widths.strokeMet : widths.stroke)
  const touched = (e: EdgeDraw) => !!hlId && (e.childId === hlId || e.parentId === hlId)
  const eff = (e: EdgeDraw): EdgeStatus => (e.status !== 'route' && touched(e) ? 'hl' : e.status)
  const joinEff = (j: JoinDraw): EdgeStatus => (j.status !== 'route' && hlId && (j.childId === hlId || j.parentIds.includes(hlId)) ? 'hl' : j.status)
  return (
    <svg
      aria-hidden
      focusable="false"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none' }}
    >
      {STATUS_ORDER.map((s) => {
        const list = edges.filter((e) => eff(e) === s)
        if (!list.length) return null
        return (
          <g key={s} stroke={colour(s)} strokeWidth={w(s)} fill="none" strokeLinejoin="round" strokeLinecap="round">
            {list.map((e) => <path key={e.key} d={e.d} />)}
            {list.filter((e) => e.arrow).map((e) => <path key={`${e.key}-a`} d={e.arrow} fill={colour(s)} stroke="none" />)}
          </g>
        )
      })}
      {joins.map((j) => {
        const s = joinEff(j)
        return (
          <g key={j.key}>
            <circle cx={j.x} cy={j.y} r={j.r} fill="var(--surface-1)" stroke={colour(s)} strokeWidth={w(s)} />
            <text x={j.x} y={j.y} dy="0.33em" textAnchor="middle" fontSize={fs.eyebrow} fontWeight={750} fill={c.muted} style={{ fontFamily: 'var(--font-ui)' }}>o</text>
          </g>
        )
      })}
    </svg>
  )
}

/** Dotted check: «lo tienes en otra rama» */
export function DottedCheck({ size = 14 }: { size?: number }) {
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeDasharray="3.2 2.6" strokeLinecap="butt" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

/** Official activation glyph in its tone (decorative: the label lives in the accessible name) */
export function ActIcon({ type, size = 11, style }: { type: ActivationType; size?: number; style?: CSSProperties }) {
  const cfg = ACTIVATION[type]
  const box = size + 8
  return (
    <span
      aria-hidden
      title={cfg.label}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        minWidth: box + 4, height: box, borderRadius: 999, padding: '0 4px',
        background: cfg.tone.bg, border: `1px solid ${cfg.tone.border}`, color: cfg.tone.fg, pointerEvents: 'none', ...style,
      }}
    >
      <CosmereIcon name={cfg.icon} size={type === 'passive' ? size - 2 : size} />
    </span>
  )
}

/** Radiant glyph used for «jurar un Ideal» */
export function IdealGlyph({ size = 12 }: { size?: number }) {
  return <CosmereIcon name="caballeros-radiantes" size={size} style={{ color: 'var(--amatista)', pointerEvents: 'none' }} />
}

/**
 * Glyph of the metal of a power: the goal badge of a locked cell and the band of a power plate (§7.7 #4). `poderId` is `${arte}:${metal}`.
 * Provisional, as `GlifoProvisional` of MetalPicker: the Lucide icon of the art (Anvil for feruchemy, Flame for the rest). T46 replaces its
 * body with `MetalGlyph` (the official glyph of each metal), which takes the same `poderId`.
 */
export function MetalMark({ poderId, size = 12, style }: { poderId?: string | null; size?: number; style?: CSSProperties }) {
  const Icon = poderId?.startsWith('feruquimia:') ? Anvil : Flame
  return <Icon size={size} aria-hidden style={{ flexShrink: 0, pointerEvents: 'none', ...style }} />
}

/** The state mark of a cell: symbol + word/number, never colour alone. */
export function CellMarkView({ mark, accent, compact }: { mark: CellMark; accent: Accent; compact: boolean }) {
  const num: CSSProperties = { fontSize: compact ? 13.5 : 13, fontWeight: 750, color: c.muted, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }
  const tag: CSSProperties = { fontSize: fs.eyebrow, fontWeight: 750, letterSpacing: '0.01em', color: c.muted, lineHeight: 1 }
  switch (mark.kind) {
    case 'learned':
      return <Check size={compact ? 15 : 14} strokeWidth={3} aria-hidden style={{ color: accent.fg }} />
    case 'elsewhere':
      return <span style={{ display: 'inline-flex', color: accent.fg }}><DottedCheck size={compact ? 15 : 14} /></span>
    case 'available':
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, color: accent.fg }}>
          <Plus size={compact ? 15 : 14} strokeWidth={3} aria-hidden />
          {mark.dj && <span style={{ ...tag, color: accent.fg }}>DJ</span>}
        </span>
      )
    default:
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
          <span style={num}>{mark.distance ?? '✗'}</span>
          {mark.badge === 'nivel' && <span style={tag}>NV{mark.minLevel}</span>}
          {mark.badge === 'ideal' && <IdealGlyph size={compact ? 11 : 12} />}
          {mark.badge === 'dj' && <span style={tag}>DJ</span>}
          {mark.badge === 'meta' && <MetalMark poderId={mark.poderId} size={12} style={{ color: c.muted }} />}
        </span>
      )
  }
}

/** Numbered ring of the goal route (or the target mark) on a cell's corner */
export function StepBadge({ step, target, size = 16, style }: { step?: number; target?: boolean; size?: number; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        position: 'absolute', left: -7, top: -7, minWidth: size, height: size, padding: '0 3px', borderRadius: 999,
        background: c.brand, color: c.onBrand, fontSize: fs.eyebrow, fontWeight: 800, lineHeight: 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 1.5px var(--surface-1)', zIndex: 2,
        ...style,
      }}
    >
      {target ? <Target size={size - 5} strokeWidth={2.75} /> : step}
    </span>
  )
}
