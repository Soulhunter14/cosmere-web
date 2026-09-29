/**
 * Shared style helpers and small hooks for the talent map (no components here, so Fast Refresh stays happy).
 */
import { useSyncExternalStore } from 'react'
import type { ActivationType } from '../TalentActivation'
import { c, ink, tint, tone, type Tone } from '../../theme'
import { contentWidthFor } from './talentMap'

/** Theme-aware accent from a data colour (heroic path, radiant order, singer). ink() keeps it AA per theme. */
export interface Accent {
  /** text / icon colour: ink() nudged towards --text so it stays AA even on its own tinted wash */
  fg: string
  /** the clamped data colour itself (lines, base for tints) */
  ink: string
  wash: (pct: number, base?: string) => string
  border: string
  borderStrong: string
}
export function accentOf(color: string): Accent {
  const base = ink(color)
  return {
    fg: `color-mix(in oklab, ${base} 78%, var(--text))`,
    ink: base,
    wash: (pct, surface = c.s1) => `color-mix(in srgb, ${base} ${pct}%, ${surface})`,
    border: tint(base, 55),
    borderStrong: tint(base, 72),
  }
}

/** Official activation glyph + label + tone (same table as components/TalentActivation). */
export const ACTIVATION: Record<ActivationType, { icon: string; label: string; tone: Tone }> = {
  action1: { icon: 'accion-1', label: '1 acción', tone: tone.zafiro },
  action2: { icon: 'accion-2', label: '2 acciones', tone: tone.zafiro },
  action3: { icon: 'accion-3', label: '3 acciones', tone: tone.zafiro },
  free: { icon: 'accion-gratuita', label: 'Acción gratuita', tone: tone.esmeralda },
  reaction: { icon: 'reaccion', label: 'Reacción', tone: tone.topacio },
  special: { icon: 'activacion-especial', label: 'Especial', tone: tone.amatista },
  passive: { icon: 'siempre-activo', label: 'Siempre activo', tone: tone.cuarzo },
}

/** Gold plate band (book style): official ornament gold with deep navy letters (≥ 7:1 in both themes). */
export const BAND_BG = 'var(--gold-ornament)'
export const BAND_FG = 'var(--navy-deep)'

// ── localStorage (every access in try/catch: private windows, blocked storage…) ──

export function readStore<T>(key: string, fallback: T, valid?: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    const v: unknown = JSON.parse(raw)
    return valid ? (valid(v) ? v : fallback) : (v as T)
  } catch {
    return fallback
  }
}
export function writeStore(key: string, value: unknown) {
  try {
    if (value === null || value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable: the preference simply is not remembered */
  }
}

// ── Viewport → page column width (no DOM measuring of the map itself) ──

const subscribe = (cb: () => void) => {
  window.addEventListener('resize', cb)
  window.addEventListener('orientationchange', cb)
  return () => {
    window.removeEventListener('resize', cb)
    window.removeEventListener('orientationchange', cb)
  }
}
const snapshot = () => contentWidthFor(document.documentElement.clientWidth || window.innerWidth)
/** Width of the 680 px page column's content for the current viewport. */
export function useContentWidth(): number {
  return useSyncExternalStore(subscribe, snapshot, () => 358)
}

const rmQuery = '(prefers-reduced-motion: reduce)'
const subscribeRm = (cb: () => void) => {
  const mq = window.matchMedia(rmQuery)
  mq.addEventListener('change', cb)
  return () => mq.removeEventListener('change', cb)
}
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribeRm, () => window.matchMedia(rmQuery).matches, () => false)
}
