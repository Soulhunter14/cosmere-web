import type { CSSProperties } from 'react'

/* ═══════════════════════════════════════════════════════════════════════════
   Official Cosmere RPG iconography (Brotherwise Games / Dragonsteel), extracted as vectors
   from the rulebooks in cosmere-api/Resources/CaminaPiedras.
   - src/assets/cosmere/*.svg       vector icons in currentColor (take the text/tone colour)
   - src/assets/cosmere/mask/*.png  raster glyphs used as a CSS mask, also tinted with currentColor
   Icons keep their natural proportions: `size` is the height, width follows the viewBox.
   Private table use only: the artwork and the Cosmere® mark belong to their owners.
   ═══════════════════════════════════════════════════════════════════════════ */

import { ICONS } from '../lib/cosmereAssets'

/**
 * <CosmereIcon name="trama-oportunidad" size={20} />
 * Pass `title` when the icon carries meaning on its own (role="img" + aria-label);
 * otherwise it is decorative (aria-hidden).
 */
export function CosmereIcon({
  name,
  size = 20,
  title,
  style,
  className,
  square = false,
}: {
  name: string
  /** Height in px (width follows the icon's proportions unless `square`) */
  size?: number
  title?: string
  style?: CSSProperties
  className?: string
  /** Force a square box (icon centred inside) */
  square?: boolean
}) {
  const icon = ICONS[name]
  if (!icon) {
    if (import.meta.env.DEV) console.warn(`[CosmereIcon] unknown icon "${name}"`)
    return null
  }
  const width = square ? size : Math.round(size * icon.ratio * 100) / 100
  const common: CSSProperties = { display: 'inline-flex', width, height: size, flexShrink: 0, lineHeight: 0, ...style }
  const a11y = { role: title ? 'img' : undefined, 'aria-label': title, 'aria-hidden': title ? undefined : true, title } as const
  if (icon.kind === 'svg') {
    return <span className={className} {...a11y} style={common} dangerouslySetInnerHTML={{ __html: icon.html }} />
  }
  return (
    <span
      className={className}
      {...a11y}
      style={{
        ...common,
        backgroundColor: 'currentColor',
        WebkitMaskImage: `url(${icon.url})`,
        maskImage: `url(${icon.url})`,
        WebkitMaskRepeat: 'no-repeat',
        maskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
        maskPosition: 'center',
        WebkitMaskSize: 'contain',
        maskSize: 'contain',
      }}
    />
  )
}
