import { font } from '../theme'
import { CosmereIcon } from './CosmereIcon'

/** Official Cosmere emblem, tinted with Stormlight. Decorative (aria-hidden). */
export function BrandGlyph({ size = 28, glow = true, color = 'var(--brand)' }: { size?: number; glow?: boolean; color?: string }) {
  return (
    <CosmereIcon
      name="cosmere-emblem"
      size={size}
      style={{ color, filter: glow ? 'drop-shadow(0 0 8px var(--brand-glow))' : undefined }}
    />
  )
}

/** Emblem + wordmark */
export function BrandMark({ size = 28, subtitle }: { size?: number; subtitle?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
      <BrandGlyph size={size + 4} />
      <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: font.title, fontSize: Math.round(size * 0.74), letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text)' }}>
          Cosmere
        </span>
        {subtitle && (
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', marginTop: 4 }}>
            {subtitle}
          </span>
        )}
      </span>
    </span>
  )
}
