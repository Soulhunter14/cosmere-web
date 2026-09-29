import type { CSSProperties, ReactNode } from 'react'
import { characterHeroBackground } from '../lib/avatar'

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

/**
 * Shared shell for the character hero header (CharacterDetail, Metas, Talentos, Bolsa…):
 * gemstone gradient by character id, film grain, and a soft fade into the page.
 * Put the page-specific content (name, badges, actions, stats) as children.
 * Text on it should use #fff / rgba(255,255,255,0.8) (≥ 7:1 on every palette).
 */
export function CharacterHero({
  characterId,
  children,
  style,
  padding = '24px 20px 22px',
}: {
  characterId: number
  children: ReactNode
  style?: CSSProperties
  padding?: string | number
}) {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: characterHeroBackground(characterId),
        padding,
        borderBottom: '1px solid var(--border)',
        ...style,
      }}
    >
      <div aria-hidden style={{ position: 'absolute', inset: 0, opacity: 0.1, mixBlendMode: 'overlay', pointerEvents: 'none', backgroundImage: GRAIN }} />
      <div aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)' }} />
      <div style={{ position: 'relative' }}>{children}</div>
    </section>
  )
}
