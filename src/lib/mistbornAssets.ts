/* ═══════════════════════════════════════════════════════════════════════════
   The 50 official glyphs of the metals of Scadrial (Nacidos de la bruma, «Alfabeto de acero y alfabeto de Terris», L.405 / PDF 411),
   extracted as vectors by T45 (scripts/mistborn_glyphs/extract.py) into src/assets/cosmere/mistborn/:
     alomancia-era1-<metal>.svg (17), alomancia-era2-<metal>.svg (16, atium only exists in Era 1), feruquimia-<metal>.svg (17).
   Square 1000×1000, `fill="currentColor"`: they take the colour of the text around them.

   ONE lazy module for the 50 (§7.8 Iconos, risk 6): `import.meta.glob(…, { eager: true })` bundles them together, so Rolldown emits
   a single chunk `mistbornAssets-*.js` (a glob that is not eager would make 50 micro-chunks and 50 precache entries). Its default
   export is the component that draws one of them. The only importer is `import('../../lib/mistbornAssets')` in
   components/mistborn/MetalGlyph.tsx, which runs the first time a glyph is drawn: a Stormlight campaign never draws one, so it never
   requests the chunk. NEVER import this module statically (it would drag the 50 glyphs into the chunk of the importer). The PWA
   precaches it in the background all the same (§7.8, accepted).
   Private table use only: the artwork belongs to Brotherwise Games / Dragonsteel (see components/CosmereIcon.tsx).
   ═══════════════════════════════════════════════════════════════════════════ */
import { createElement } from 'react'
import { Anvil, Flame } from 'lucide-react'
import type { MetalGlyphProps } from '../components/mistborn/MetalGlyph'
import { useEra } from '../store/campaignStore'

const RAW = import.meta.glob('../assets/cosmere/mistborn/*.svg', { query: '?raw', import: 'default', eager: true }) as Record<string, string>

// The same attributes lib/cosmereAssets.ts gives the SVGs of the main registry: the glyph fills the box of its component
const GLIFOS: Record<string, string> = {}
for (const [path, svg] of Object.entries(RAW)) {
  GLIFOS[path.split('/').pop()!.replace(/\.svg$/, '')] = svg.replace('<svg ', '<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" focusable="false" aria-hidden="true" ')
}

/**
 * The glyph of a power. Feruchemy has one per metal. Alomancy has one per metal and era (`era`, else the era of the campaign, else Era 1);
 * the atium of Era 2 does not exist (the metal is only found in Era 1, L.176 / PDF 182), so it takes the glyph of Era 1, the only one the
 * book prints for it. A metal the book has no glyph for gets the Lucide icon of its art, so a missing SVG never breaks a screen.
 */
export default function Glifo({ metal, arte, era, size = 18, style }: MetalGlyphProps) {
  const eraCampana = useEra()
  const e = era ?? eraCampana ?? 'era1'
  const svg = arte === 'feruquimia' ? GLIFOS[`feruquimia-${metal}`] : (GLIFOS[`alomancia-${e}-${metal}`] ?? GLIFOS[`alomancia-era1-${metal}`])
  const caja = { 'aria-hidden': true, style: { display: 'inline-flex', width: size, height: size, flexShrink: 0, lineHeight: 0, ...style } }
  return svg
    ? createElement('span', { ...caja, dangerouslySetInnerHTML: { __html: svg } })
    : createElement('span', caja, createElement(arte === 'alomancia' ? Flame : Anvil, { size }))
}
