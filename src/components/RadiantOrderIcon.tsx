/**
 * RadiantOrderIcon  — circular glyph cropped from the official placard image
 * RadiantOrderPlacard — full placard (circle + name + tagline)
 */

const BLASON_MAP: Record<string, string> = {
  windrunners:   '/blason/01_windrunner_placard.webp',
  skybreakers:   '/blason/02_skybreaker_placard.webp',
  dustbringers:  '/blason/03_dustbringer_placard.webp',
  edgedancers:   '/blason/04_edgedancer_placard.webp',
  truthwatchers: '/blason/05_truthwatcher_placard.webp',
  lightweavers:  '/blason/06_lightweaver_placard.webp',
  elsecallers:   '/blason/07_elsecaller_placard.webp',
  willshapers:   '/blason/08_willshaper_placard.webp',
  stonewards:    '/blason/09_stoneward_placard.webp',
  bondsmiths:    '/blason/10_bondsmith_placard.webp',
}

interface IconProps {
  orderId: string
  size?: number
}

/**
 * Shows only the circular glyph portion of the placard.
 * The circle sits in the leftmost ~30% of the image.
 */
export function RadiantOrderIcon({ orderId, size = 24 }: IconProps) {
  const src = BLASON_MAP[orderId]
  if (!src) return null

  // background-size: auto 100% scales the image to fill the height,
  // background-position: left center aligns to show only the circle (left portion).
  return (
    <div
      role="img"
      aria-label={orderId}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        flexShrink: 0,
        backgroundImage: `url(${src})`,
        backgroundSize: 'auto 100%',
        backgroundPosition: 'left center',
        backgroundRepeat: 'no-repeat',
      }}
    />
  )
}

interface PlacardProps {
  orderId: string
  /** max-width of the placard, defaults to 320px */
  maxWidth?: number
}

/**
 * Full placard image — circle + decorative name + tagline.
 */
export function RadiantOrderPlacard({ orderId, maxWidth = 320 }: PlacardProps) {
  const src = BLASON_MAP[orderId]
  if (!src) return null

  return (
    <img
      src={src}
      alt={orderId}
      style={{
        width: '100%',
        maxWidth,
        height: 'auto',
        display: 'block',
        borderRadius: 12,
      }}
    />
  )
}
