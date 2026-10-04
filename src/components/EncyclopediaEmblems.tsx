/* ═══════════════════════════════════════════════════════════════════════════
   Building blocks of the encyclopedia tile emblems, extracted from EncyclopediaPage (T06c) so that the
   per-world topic lists (src/worlds/*.topics.tsx) can compose them. Components only: the data they use
   (SURGES, COMBAT_ACTIVATIONS, AVENTURAS_EMBLEMS) lives in emblemData.ts, because a file that exports
   components and constants together breaks fast refresh (react-refresh/only-export-components).
   ═══════════════════════════════════════════════════════════════════════════ */
import type { CSSProperties, ReactNode } from 'react'
import { RadiantOrderIcon } from './RadiantOrderIcon'
import { CosmereIcon } from './CosmereIcon'
import type { RadiantOrder } from '../data/radiantOrders'
import { hasCosmereIcon } from '../lib/cosmereAssets'
import { ink, radius, tint, type Tone } from '../theme'

/**
 * A row of small emblems split in two halves that never break inside: the row either fits whole
 * or wraps as a balanced 5 + 5 (instead of 8 + 2 on a phone).
 */
export function BalancedRow({ children, gap }: { children: ReactNode[]; gap: number }) {
  const mid = Math.ceil(children.length / 2)
  return (
    <span aria-hidden style={{ display: 'flex', flexWrap: 'wrap', gap }}>
      <span style={{ display: 'flex', gap }}>{children.slice(0, mid)}</span>
      <span style={{ display: 'flex', gap }}>{children.slice(mid)}</span>
    </span>
  )
}

/**
 * Official order glyph in its identity colour. Same look as the shared RadiantOrderIcon, but the colour
 * goes through ink() so the glyph stays readable on the light "pergamino" paper too
 * (RadiantOrderIcon paints the raw data colour). Falls back to RadiantOrderIcon (placard crop).
 */
export function OrderGlyph({ order, size }: { order: RadiantOrder; size: number }) {
  const glyph = `orden-${order.id}`
  if (!hasCosmereIcon(glyph)) return <RadiantOrderIcon orderId={order.id} size={size} decorative />
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(circle at 50% 35%, ${tint(order.color, 26)}, ${tint(order.color, 8)})`,
        boxShadow: `inset 0 0 0 1px ${tint(ink(order.color), 40)}`,
        color: ink(order.color),
      }}
    >
      <CosmereIcon name={glyph} size={Math.round(size * 0.62)} square />
    </span>
  )
}

/** Horizontal strip that holds a row of small icons (48px high, like the single-icon tiles) */
export function EmblemStrip({ t, children, style }: { t: Tone; children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 12, height: 48, padding: '0 14px',
        borderRadius: radius.md, background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/** Small tinted square for one glyph */
export function MiniTile({ bg, border, color, children }: { bg: string; border: string; color: string; children: ReactNode }) {
  return (
    <span
      style={{
        width: 32, height: 32, borderRadius: radius.sm, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: bg, border: `1px solid ${border}`, color,
      }}
    >
      {children}
    </span>
  )
}
