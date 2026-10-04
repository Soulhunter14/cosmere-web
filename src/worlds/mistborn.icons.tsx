/**
 * JSX helpers of the Mistborn world config (the .tsx twin of stormlight.icons.tsx).
 * Provisional Lucide icons (Q18): the book has no icons for ancestries or metalborn paths, so these stay unless an
 * official glyph can be extracted. The official metal glyphs and the emblem arrive with T45/T46.
 */
import type { ReactNode } from 'react'
import { CloudFog, Container, Flame, Merge, Mountain, Package, UserRound, VenetianMask, type LucideIcon } from 'lucide-react'

export const iconoHumano = (size: number): ReactNode => <UserRound size={size} />
export const iconoKandra = (size: number): ReactNode => <VenetianMask size={size} />
export const iconoSangreKoloss = (size: number): ReactNode => <Mountain size={size} />

/** Metalborn path id (§2) → provisional icon, in the book's order of the five paths */
const ICONOS_CAMINO_METAL: Record<string, LucideIcon> = {
  'brumoso': Flame,
  'nacido-de-la-bruma': CloudFog,
  'feruquimista': Container,
  'ferrin': Package,
  'nacidoble': Merge,
}

/** `null` for '' (no path) and for any unknown id; hasOwn so that ids such as 'constructor' never hit the prototype */
export const iconoCaminoMetal = (id: string, size: number): ReactNode => {
  if (!Object.hasOwn(ICONOS_CAMINO_METAL, id)) return null
  const Icono = ICONOS_CAMINO_METAL[id]
  return <Icono size={size} />
}
