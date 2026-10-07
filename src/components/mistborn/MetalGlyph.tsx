/**
 * Official glyph of the metal of a power of Nacidos de la bruma (§7.8 Iconos): the allomantic symbols of Era 1 and Era 2 and the feruchemical
 * ones of the Terris alphabet («Alfabeto de acero y alfabeto de Terris», L.405 / PDF 411), extracted as vectors by T45. A square box of `size`
 * px that takes the colour of the text around it (`currentColor`): the caller tints it with the tokens of the design (`toneFrom(metal.color)`,
 * `c.muted`…), never with a literal colour.
 *
 * The 50 glyphs and the component that draws them live in ONE lazy module (src/lib/mistbornAssets.ts, risk 6), requested the first time a
 * glyph is drawn and shared by every glyph after it: a campaign that never draws one (Stormlight) never requests the chunk. While it loads,
 * the glyph is an empty box of its own size (no flash of another icon). The lazy module draws the Lucide icon of the art (Flame for alomancy,
 * Anvil for feruchemy) for a metal the book has no glyph for, so a missing SVG never breaks a screen; if the chunk itself cannot be loaded
 * (offline with nothing precached, a stale hash after a deploy) the box stays empty and nothing breaks either.
 *
 * This file travels in the main chunk (the talent map and the world configuration draw it, and the main chunk must not grow: §8 risk 6), so
 * it is as small as it can be: it imports no data of the world, no store (a world configuration must not import the campaign store: the era
 * of the campaign is read by the lazy module) and nothing but types.
 */
import { lazy, Suspense, type CSSProperties } from 'react'
import type { Era } from '../../types'
import type { ArteMetal } from '../../data/mistborn/metales'

export interface MetalGlyphProps {
  /** Metal id (`MetalId`, §2); a metal without a glyph gets the Lucide icon of its art */
  metal: string
  arte: ArteMetal
  /** Era of the allomantic glyph (it has one version per era). Default: the era of the campaign, and Era 1 when it has none */
  era?: Era | null
  /** Side of the box in px */
  size?: number
  style?: CSSProperties
}

/** The box of a glyph: decorative, the same size whatever it holds. It is what is on screen while the chunk loads, and for good if it fails */
const caja = ({ size = 18, style }: MetalGlyphProps) => <span aria-hidden style={{ display: 'inline-flex', width: size, height: size, flexShrink: 0, ...style }} />

// The import() has a function of its own: written as `import(…).then(…)`, Vite would move the handlers INSIDE its preload helper and the
// helper would never see a failure, so the reload-once guard of src/main.tsx (`vite:preloadError`, stale hash after a deploy) could not act.
// A failure ends in the empty box instead of throwing into the page: with the guard's preventDefault() the import resolves to undefined
// (and the page reloads); without it, it rejects
const cargar = () => import('../../lib/mistbornAssets')
const Glifo = lazy(() => cargar().then((m) => m ?? { default: caja }, () => ({ default: caja })))

export function MetalGlyph(props: MetalGlyphProps) {
  return <Suspense fallback={caja(props)}><Glifo {...props} /></Suspense>
}
