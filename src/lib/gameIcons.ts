import {
  BookOpenText, BowArrow, Crown, Dices, Eye, Footprints, Handshake, Heart, HeartPulse,
  ScanSearch, ScrollText, Swords, Target, Focus, ArrowLeftRight, Flame, Gem,
  type LucideIcon,
} from 'lucide-react'

/* Concept → Lucide icon maps for concepts without official iconography (see components/GameIcons.tsx). */

/** Heroic paths: the rulebooks have no official path emblems */
export const HEROIC_PATH_ICONS: Record<string, LucideIcon> = {
  agente: ScanSearch,
  cazador: BowArrow,
  enviado: Handshake,
  erudito: BookOpenText,
  guerrero: Swords,
  lider: Crown,
}
export const FALLBACK_GAME_ICON: LucideIcon = Dices

/** Stats & resources. Render as <StatIcons.salud size={16} aria-hidden /> */
export const StatIcons = {
  salud: Heart,
  concentracion: Focus,
  investidura: Gem,
  movimiento: Footprints,
  sentidos: Eye,
  recuperacion: HeartPulse,
} satisfies Record<string, LucideIcon>

/** Dice roller modes */
export const RollModeIcons = {
  combat: Swords,
  skill: Target,
  damage: Flame,
  recovery: HeartPulse,
  contested: ArrowLeftRight,
  free: Dices,
  registro: ScrollText,
} satisfies Record<string, LucideIcon>

/** 'Adhesión' / 'adhesion' → 'adhesion' (ids of the potencia-* glyphs) */
export const surgeSlug = (nameOrId: string) =>
  nameOrId.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/\s+/g, '-')
