/**
 * CharacterIdentityPills — the identity pills of a character: its heroic path and the Investida path of its world (radiant
 * order in Stormlight, metalborn path in Mistborn). One component for the list rows ('card': tinted pills) and for the hero
 * headers ('hero': translucent pills over the CharacterHero gradient), so no screen repeats the lookups.
 *
 * P8: the heroic paths are Cosmere (src/data/heroicPaths.ts, same six in both worlds); the Investida path is the world's. Which
 * character field holds it, its name and colour (`caminoInvestido`) and its icon (`iconos.caminoInvestido`) come from the
 * world configuration of the campaign, never from a world id. The ancestry is not a pill here: the lists that show it keep
 * their own meta line.
 */
import type { CSSProperties, ReactNode } from 'react'
import { HEROIC_PATHS } from '../data/heroicPaths'
import { useWorldConfig } from '../store/campaignStore'
import { heroPill } from '../lib/hero'
import { pill, toneFrom } from '../theme'
import type { Character } from '../types'
import { HeroicPathIcon } from './GameIcons'

/** The identity fields the pills read: a structural subset of `Character`, so a list row typed more narrowly fits too */
export type IdentityPathsCharacter = Pick<Character, 'caminoHeroico' | 'caminoRadiante' | 'caminoMetal'>

interface CharacterIdentityPillsProps {
  character: IdentityPathsCharacter
  /** 'card': tinted pills of the list rows · 'hero': translucent pills over the hero gradient */
  variant?: 'card' | 'hero'
  /** Rendered first in the same row: the «Nv. N» pill of the hero headers */
  leading?: ReactNode
  /** Rendered between the heroic path and the Investida path: the extra paths of the Talentos hero */
  between?: ReactNode
  /** Merged into the row (e.g. a top margin) */
  style?: CSSProperties
  /**
   * Only for a world whose path icon is a round badge (`caminoInvestido.insignia`): the Investida pill pulls it 4 px closer to the
   * left edge. Every list row and some heroes do; the hero of PersonajesPage and of MetasDetailPage never did and keep the regular
   * padding (`false`), so Stormlight draws the same pixels as before (P1). A plain glyph never gets the inset
   */
  insetIcon?: boolean
}

const CARD_ROW: CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }
const HERO_ROW: CSSProperties = { display: 'flex', gap: 6, flexWrap: 'wrap' }

/** Renders nothing when the character has neither path (and no `leading`): the row only exists if there is something in it */
export function CharacterIdentityPills({ character, variant = 'card', leading, between, style, insetIcon = true }: CharacterIdentityPillsProps) {
  const cfg = useWorldConfig()
  const hero = variant === 'hero'
  const heroico = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
  const camino = cfg.caminoInvestido
  const investido = camino?.caminos.find((p) => p.id === character[camino.field])
  // A badge icon is drawn at 16 px and, optionally, pulled to the edge; a plain glyph matches the 13 px heroic-path icon beside it
  const insignia = camino?.insignia ?? false

  if (!heroico && !investido && !leading) return null

  const pills = (
    <>
      {leading}
      {heroico && (
        <span style={hero ? heroPill : pill(toneFrom(heroico.color))}>
          <HeroicPathIcon id={heroico.id} size={13} />
          {heroico.name}
        </span>
      )}
      {between}
      {investido && (
        <span style={{ ...(hero ? heroPill : pill(toneFrom(investido.color))), ...(insignia && insetIcon ? { paddingLeft: 4 } : null) }}>
          {cfg.iconos.caminoInvestido(investido.id, insignia ? 16 : 13)}
          {investido.nombre}
        </span>
      )}
    </>
  )

  return hero
    ? <div style={{ ...HERO_ROW, ...style }}>{pills}</div>
    : <span style={{ ...CARD_ROW, ...style }}>{pills}</span>
}
