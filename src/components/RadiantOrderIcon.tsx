/**
 * RadiantOrderIcon    — official order glyph (tinted with the order colour) when available,
 *                       otherwise the circular glyph cropped from the official placard image
 * RadiantOrderPlacard — full official placard (circle + name + tagline)
 */
import { RADIANT_ORDERS } from '../data/radiantOrders'
import { CosmereIcon } from './CosmereIcon'
import { hasCosmereIcon } from '../lib/cosmereAssets'
import { tint } from '../theme'

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

const orderName = (orderId: string) => RADIANT_ORDERS.find((o) => o.id === orderId)?.name ?? orderId
const orderColor = (orderId: string) => RADIANT_ORDERS.find((o) => o.id === orderId)?.color ?? 'var(--amatista)'

interface IconProps {
  orderId: string
  size?: number
  /** decorative: hide from assistive tech when the order name is already shown next to it */
  decorative?: boolean
  /** force the placard crop instead of the vector glyph */
  variant?: 'auto' | 'placard'
}

export function RadiantOrderIcon({ orderId, size = 24, decorative = false, variant = 'auto' }: IconProps) {
  const glyph = `orden-${orderId}`
  const label = decorative ? undefined : `Orden: ${orderName(orderId)}`

  if (variant === 'auto' && hasCosmereIcon(glyph)) {
    const color = orderColor(orderId)
    return (
      <span
        role={label ? 'img' : undefined}
        aria-label={label}
        aria-hidden={label ? undefined : true}
        title={orderName(orderId)}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: `radial-gradient(circle at 50% 35%, ${tint(color, 26)}, ${tint(color, 8)})`,
          boxShadow: `inset 0 0 0 1px ${tint(color, 40)}`,
          color,
        }}
      >
        <CosmereIcon name={glyph} size={Math.round(size * 0.62)} square />
      </span>
    )
  }

  const src = BLASON_MAP[orderId]
  if (!src) return null
  // background-size: auto 100% scales the image to fill the height,
  // background-position: left center shows only the circle (left portion of the placard).
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{
        display: 'inline-block',
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

/** Full placard image — circle + decorative name + tagline. */
export function RadiantOrderPlacard({ orderId, maxWidth = 320 }: PlacardProps) {
  const src = BLASON_MAP[orderId]
  if (!src) return null
  return (
    <img
      src={src}
      alt={`Blasón de la orden: ${orderName(orderId)}`}
      loading="lazy"
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
