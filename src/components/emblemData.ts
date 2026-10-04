/* ═══════════════════════════════════════════════════════════════════════════
   Data of the encyclopedia tile emblems (T06c). They used to be module constants of EncyclopediaPage and the
   per-world topic lists (src/worlds/*.topics.tsx) need them too.
   A .ts file on purpose: it holds no components (see EncyclopediaEmblems.tsx) and cannot hold JSX, so the
   Aventuras glyphs are built with createElement.
   ═══════════════════════════════════════════════════════════════════════════ */
import { createElement, type ReactNode } from 'react'
import { Activity, Compass, HeartCrack, Tent } from 'lucide-react'
import { PlotIcon } from './GameIcons'
import type { ActivationType } from './TalentActivation'
import { RADIANT_ORDERS } from '../data/radiantOrders'

/* The ten surges, in the order they appear on the orders (Adhesión … Transportación) */
export const SURGES = Array.from(new Set(RADIANT_ORDERS.flatMap((o) => o.surges)))

/* Action economy of a combat turn, drawn with the official activation glyphs */
export const COMBAT_ACTIVATIONS: ActivationType[] = ['action1', 'action2', 'action3', 'reaction']

/* One glyph per Aventuras tab: Escenas · Reposo · Sucesos (official Oportunidad plot symbol) · Estados · Daño */
export const AVENTURAS_EMBLEMS: ReactNode[] = [
  createElement(Compass, { size: 17 }),
  createElement(Tent, { size: 17 }),
  createElement(PlotIcon, { result: 'oportunidad', size: 17 }),
  createElement(Activity, { size: 17 }),
  createElement(HeartCrack, { size: 17 }),
]
