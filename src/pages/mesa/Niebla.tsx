import { useId } from 'react'
import type { Niebla, ZonaNiebla } from './publica'

/**
 * Fog of war over a projected map, laid over its <img> (the parent is `position: relative`). An SVG in image fractions
 * (`viewBox 0 0 1 1`, stretched to the image) with the uncovered zones cut out of the cover. Opaque black for the players
 * (nothing of the map shows through); a veil for the director, who keeps seeing the whole map with the zones outlined.
 * The cover is black whatever the theme: it hides, it is not chrome.
 */
export function CapaNiebla({ niebla, opaca, borrador = null }: { niebla: Niebla; opaca: boolean; borrador?: ZonaNiebla | null }) {
  const mascara = useId()
  if (!niebla.activa) return null
  return (
    <svg
      aria-hidden
      viewBox="0 0 1 1"
      preserveAspectRatio="none"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
    >
      <defs>
        <mask id={mascara}>
          <rect x={0} y={0} width={1} height={1} fill="white" />
          {niebla.zonas.map((z, i) => <rect key={i} x={z.x} y={z.y} width={z.w} height={z.h} fill="black" />)}
        </mask>
      </defs>
      <rect x={0} y={0} width={1} height={1} fill="#000" fillOpacity={opaca ? 1 : 0.6} mask={`url(#${mascara})`} />
      {/* Theme tokens go through `style`: a presentation attribute does not take var() */}
      {!opaca && niebla.zonas.map((z, i) => (
        <rect key={i} x={z.x} y={z.y} width={z.w} height={z.h} fill="none" strokeWidth={2} vectorEffect="non-scaling-stroke" style={{ stroke: 'var(--zafiro)' }} />
      ))}
      {!opaca && borrador && borrador.w > 0 && borrador.h > 0 && (
        <rect
          x={borrador.x} y={borrador.y} width={borrador.w} height={borrador.h} fillOpacity={0.25} strokeWidth={2} strokeDasharray="6 4" vectorEffect="non-scaling-stroke"
          style={{ fill: 'var(--zafiro)', stroke: 'var(--zafiro)' }}
        />
      )}
    </svg>
  )
}
