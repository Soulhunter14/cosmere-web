import type { CSSProperties } from 'react'
import { CosmereIcon } from './CosmereIcon'
import { getWorld } from '../worlds'
import type { Era } from '../types'
import { heroPill } from '../lib/hero'
import { c, fs, pill, tone, type Tone } from '../theme'

/**
 * Setting insignia of a campaign: the world's official emblem plus «Nacidos de la bruma · Era 2» (spec §7.2).
 * Everything (names, emblem, era label and tone) comes from the world's configuration, so a new world needs no change
 * here (P4, P8). Variants:
 * - `text` (default): emblem + one line of text, for the sidebar and the phone top bar (`short` uses `nombreCorto`).
 * - `chip`: the same line as a pill on a regular surface, tinted with the era's tone (neutral where the world has no eras).
 * - `hero`: the world chip and the era chip as two pills for the gemstone cover of a campaign card (white text on ink).
 * - `emblem`: only the glyph, named for assistive technology; for the 80px tablet rail.
 */
type Variant = 'text' | 'chip' | 'hero' | 'emblem'

/** The pills of the card covers: like the role chip, on top of the deep gradient */
const heroChip: CSSProperties = {
  ...heroPill,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
}

/** Era tone as a dot on the (always deep) cover gradient: lifted to a fixed lightness so it glows in both themes */
const dotColor = (t: Tone) => `oklch(from ${t.fg} 0.8 c h)`

export function WorldBadge({
  world,
  era,
  variant = 'text',
  short = false,
  iconSize,
  style,
}: {
  /** `world` of the campaign; `''`, `null`, `undefined` and unknown ids resolve to Stormlight, as `getWorld` does everywhere */
  world?: string | null
  era?: Era | null
  variant?: Variant
  /** `nombreCorto` («Bruma») instead of `nombre` («Nacidos de la bruma») */
  short?: boolean
  /** Emblem height in px */
  iconSize?: number
  style?: CSSProperties
}) {
  const cfg = getWorld(world)
  // An era the world does not declare is not shown (the server only stores the eras of a world that has them)
  const eraDef = era ? cfg.eras?.find((e) => e.id === era) : undefined
  const fullName = eraDef ? `${cfg.nombre} · ${eraDef.label}` : cfg.nombre

  if (variant === 'emblem') {
    return (
      <span role="img" aria-label={fullName} title={fullName} style={{ display: 'inline-flex', color: c.brandLight, ...style }}>
        <CosmereIcon name={cfg.emblema} size={iconSize ?? 16} />
      </span>
    )
  }

  if (variant === 'hero') {
    return (
      <>
        <span style={{ ...heroChip, ...style }}>
          <CosmereIcon name={cfg.emblema} size={iconSize ?? 12} />
          {cfg.nombreCorto}
        </span>
        {eraDef && (
          <span style={{ ...heroChip, ...style }}>
            <span aria-hidden style={{ width: 7, height: 7, borderRadius: '50%', background: dotColor(eraDef.tone), boxShadow: `0 0 8px ${dotColor(eraDef.tone)}` }} />
            {eraDef.label}
          </span>
        )}
      </>
    )
  }

  const name = short ? cfg.nombreCorto : cfg.nombre

  if (variant === 'chip') {
    return (
      <span style={{ ...pill(eraDef?.tone ?? tone.cuarzo), minWidth: 0, ...style }} title={fullName}>
        <CosmereIcon name={cfg.emblema} size={iconSize ?? 14} />
        {name}
        {eraDef && ` · ${eraDef.label}`}
      </span>
    )
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0, fontSize: fs.xs, fontWeight: 600, color: c.muted, lineHeight: 1.4, ...style }}>
      <CosmereIcon name={cfg.emblema} size={iconSize ?? 14} style={{ color: c.brandLight }} />
      <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={fullName}>
        {name}
        {eraDef && (
          <>
            {' · '}
            <span style={{ color: eraDef.tone.fg, fontWeight: 700 }}>{eraDef.label}</span>
          </>
        )}
      </span>
    </span>
  )
}
