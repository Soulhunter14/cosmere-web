import type { CSSProperties } from 'react'

/* ═══════════════════════════════════════════════════════════════════════════
   Design tokens for inline styles (two themes: "Pergamino de tormenta" light / "Luz tormentosa" dark).
   The source of truth is src/index.css (:root). These helpers only reference those CSS variables,
   so they switch with the theme. Never hard-code colours: use `tone.*`, `c.*`, `ink()` or var(--…).
   ═══════════════════════════════════════════════════════════════════════════ */

export type ToneName =
  | 'brand' | 'gold'
  | 'rubi' | 'granate' | 'topacio' | 'heliodoro' | 'esmeralda'
  | 'zafiro' | 'amatista' | 'circon' | 'cuarzo'

export interface Tone {
  /** Foreground: text / icon colour (AA on every surface) */
  fg: string
  /** Tinted background (~12%) */
  bg: string
  /** Outline (~32%) */
  border: string
}

const mk = (n: string): Tone => ({ fg: `var(--${n})`, bg: `var(--${n}-bg)`, border: `var(--${n}-border)` })

/** Gemstone tones. Semantics: rubi=peligro/daño/GM · topacio=aviso/rango · esmeralda=éxito ·
 *  zafiro=info/cognitivo · amatista=investidura/espiritual · heliodoro=concentración ·
 *  circon=sentidos · granate=rosa/físico · cuarzo=neutro · brand=luz tormentosa · gold=oro de esfera */
export const tone: Record<ToneName, Tone> = {
  brand: mk('brand'),
  gold: mk('gold'),
  rubi: mk('rubi'),
  granate: mk('granate'),
  topacio: mk('topacio'),
  heliodoro: mk('heliodoro'),
  esmeralda: mk('esmeralda'),
  zafiro: mk('zafiro'),
  amatista: mk('amatista'),
  circon: mk('circon'),
  cuarzo: mk('cuarzo'),
}

/** Semantic aliases */
export const semantic = {
  danger: tone.rubi,
  success: tone.esmeralda,
  warning: tone.topacio,
  info: tone.zafiro,
  gm: tone.rubi,
} as const

/** Tint any colour (hex, rgb or var()) — for data-driven colours such as radiant orders or heroic paths. */
export const tint = (color: string, pct = 12) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
/**
 * Make a DATA-DRIVEN colour (RADIANT_ORDERS[i].color, heroic path colours…) readable as text/icon in the
 * current theme: its OKLCH lightness is clamped (≥0.72 on dark, ≤0.5 on light), hue and chroma kept.
 * Use it for every data colour used as foreground; use tint() for its backgrounds/borders.
 */
export const ink = (color: string) =>
  `oklch(from ${color} clamp(var(--data-l-min), l, var(--data-l-max)) c h)`
/** Build a Tone from a data-driven colour (e.g. RADIANT_ORDERS[i].color) */
export const toneFrom = (color: string): Tone => ({ fg: ink(color), bg: tint(color, 12), border: tint(color, 32) })

export const c = {
  bg: 'var(--bg)',
  mantle: 'var(--mantle)',
  s1: 'var(--surface-1)',
  s2: 'var(--surface-2)',
  s3: 'var(--surface-3)',
  s4: 'var(--surface-4)',
  overlay: 'var(--overlay)',
  border: 'var(--border)',
  borderBright: 'var(--border-bright)',
  borderStrong: 'var(--border-strong)',
  text: 'var(--text)',
  muted: 'var(--text-muted)',
  subtle: 'var(--text-subtle)',
  disabled: 'var(--text-disabled)',
  brand: 'var(--brand)',
  brandLight: 'var(--brand-light)',
  brandFill: 'var(--brand-fill)',
  onBrand: 'var(--on-brand)',
  hover: 'var(--hover)',
  hoverStrong: 'var(--hover-strong)',
  track: 'var(--track)',
  gold: 'var(--gold)',
  goldOrnament: 'var(--gold-ornament)',
  navy: 'var(--navy)',
} as const

export const font = {
  /** Marcellus: page titles and names, UPPERCASE (like the rulebook's chapter titles) */
  title: 'var(--font-title)',
  /** Crimson Pro: section/card headings and long reading text */
  display: 'var(--font-display)',
  ui: 'var(--font-ui)',
  mono: 'var(--font-mono)',
} as const

/** Font sizes. 11px (eyebrow) is the floor and only for uppercase labels. */
export const fs = {
  eyebrow: 11,
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 22,
  '2xl': 28,
  '3xl': 34,
} as const

export const radius = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24, full: 999 } as const

export const shadow = {
  1: 'var(--shadow-1)',
  2: 'var(--shadow-2)',
  3: 'var(--shadow-3)',
  glow: 'var(--glow-brand)',
} as const

export const z = { sticky: 10, nav: 40, fab: 45, sheet: 60, dialog: 100 } as const

/* ─── Reusable style fragments ───────────────────────────────────────────── */

/** Page wrapper: mobile-first, 680px max */
export const page: CSSProperties = {
  maxWidth: 680,
  margin: '0 auto',
  padding: '20px 16px 32px',
}

/** Small uppercase label above a section or a value */
export const eyebrow: CSSProperties = {
  fontSize: fs.eyebrow,
  fontWeight: 650,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: c.subtle,
}

/** Standard surface card */
export const card: CSSProperties = {
  background: c.s1,
  border: `1px solid ${c.border}`,
  borderRadius: radius.lg,
  boxShadow: shadow[1],
}

/** Large numeric value (stats) — sans like the book's stat blocks */
export const numeral: CSSProperties = {
  fontFamily: font.ui,
  fontWeight: 700,
  fontVariantNumeric: 'tabular-nums lining-nums',
  letterSpacing: '-0.02em',
  lineHeight: 1,
}

/** Page / hero title: the book's chapter-title look */
export const titleText: CSSProperties = {
  fontFamily: font.title,
  fontWeight: 400,
  textTransform: 'uppercase',
  letterSpacing: '0.045em',
  lineHeight: 1.15,
}

/** Pill / chip */
export const pill = (t: Tone): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '3px 10px',
  borderRadius: radius.full,
  background: t.bg,
  border: `1px solid ${t.border}`,
  color: t.fg,
  fontSize: fs.xs,
  fontWeight: 650,
  lineHeight: 1.4,
  whiteSpace: 'nowrap',
})

/** Reset for <button> used as a clickable surface (cards, rows) */
export const buttonReset: CSSProperties = {
  appearance: 'none',
  background: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  font: 'inherit',
  color: 'inherit',
  textAlign: 'inherit',
  cursor: 'pointer',
}
