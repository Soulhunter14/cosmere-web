/* ═══════════════════════════════════════════════════════════════════════════
   Game-concept icons. Priority: OFFICIAL Cosmere iconography (CosmereIcon) → Lucide.
   Never emojis, never home-made drawings. Lucide maps live in lib/gameIcons.ts.
   ═══════════════════════════════════════════════════════════════════════════ */
import type { CSSProperties } from 'react'
import { Zap } from 'lucide-react'
import { CosmereIcon } from './CosmereIcon'
import { hasCosmereIcon } from '../lib/cosmereAssets'
import { FALLBACK_GAME_ICON, HEROIC_PATH_ICONS, surgeSlug } from '../lib/gameIcons'

type IconProps = { size?: number; title?: string; style?: CSSProperties }

/** Heroic path icon (Lucide; the books have no official path emblems) */
export function HeroicPathIcon({ id, size = 18, title, style }: IconProps & { id: string | null | undefined }) {
  const Icon = (id && HEROIC_PATH_ICONS[id]) || FALLBACK_GAME_ICON
  return <Icon size={size} aria-hidden={title ? undefined : true} aria-label={title} role={title ? 'img' : undefined} style={style} />
}

/** Official surge (potencia) glyph, by Spanish name ('Adhesión') or id ('adhesion') */
export function SurgeIcon({ surge, size = 20, title, style }: IconProps & { surge: string }) {
  const name = `potencia-${surgeSlug(surge)}`
  if (!hasCosmereIcon(name)) return <Zap size={size} aria-hidden style={style} />
  return <CosmereIcon name={name} size={size} title={title} style={style} square />
}

/** Official plot die symbol */
export function PlotIcon({ result, size = 18, title, style }: IconProps & { result: 'oportunidad' | 'complicacion' }) {
  return <CosmereIcon name={`trama-${result}`} size={size} title={title} style={style} square />
}
