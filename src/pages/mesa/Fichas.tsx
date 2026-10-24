import { marcaDe } from '../pantalla/estado'
import { c, font, shadow } from '../../theme'
import { useImagenMesa } from './imagenes'
import type { FichaMesa } from './publica'
import { tonoDeFicha } from './tonos'

/** A token being dragged on the director's editor: it follows the pointer until it is dropped */
export interface ArrastreFicha { id: string; x: number; y: number }

/**
 * The tokens over a projected image, laid over its box (a `position: relative` parent), above the fog. Each one sits at its
 * centre in fractions of the map and measures `tamano` of the map's width (container units), so every phone and the director's
 * tablet agree on where it is. Round, like the book's tokens, with the initial (or the enemy's number) on the character's gem
 * colour, or the enemy's book portrait. `interactiva`: the director's editor, where a token takes pointer events (it carries
 * `data-ficha-id`) and the one being dragged follows `arrastre`
 */
export function CapaFichas({
  fichas, tamano, nombres, cId, interactiva = false, arrastre = null,
}: {
  fichas: FichaMesa[]
  tamano: number
  nombres: boolean
  cId: number
  interactiva?: boolean
  arrastre?: ArrastreFicha | null
}) {
  if (fichas.length === 0) return null
  return (
    <div aria-hidden={!interactiva} style={{ position: 'absolute', inset: 0, containerType: 'inline-size', pointerEvents: 'none' }}>
      {fichas.map((f) => {
        const pos = arrastre?.id === f.id ? arrastre : f
        return <Ficha key={f.id} f={f} x={pos.x} y={pos.y} tamano={tamano} nombre={nombres} cId={cId} interactiva={interactiva} arrastrada={arrastre?.id === f.id} />
      })}
    </div>
  )
}

function Ficha({
  f, x, y, tamano, nombre, cId, interactiva, arrastrada,
}: { f: FichaMesa; x: number; y: number; tamano: number; nombre: boolean; cId: number; interactiva: boolean; arrastrada: boolean }) {
  const t = tonoDeFicha(f)
  const { url } = useImagenMesa(cId, f.bando === 'pnj' && f.adversarioId !== null ? { tipo: 'retrato', adversarioId: f.adversarioId } : null)
  return (
    <div
      data-ficha-id={interactiva ? f.id : undefined}
      role={interactiva ? 'button' : undefined}
      aria-label={interactiva ? `Ficha de ${f.nombre}: arrastra para moverla, fuera del mapa para quitarla` : undefined}
      title={f.nombre}
      style={{
        position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, width: `${tamano * 100}%`, aspectRatio: '1 / 1',
        transform: 'translate(-50%, -50%)', pointerEvents: interactiva ? 'auto' : 'none', cursor: interactiva ? (arrastrada ? 'grabbing' : 'grab') : 'default',
        touchAction: 'none', zIndex: arrastrada ? 2 : 1,
      }}
    >
      <span
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
          background: `color-mix(in srgb, ${t.fg} 85%, var(--bg))`, border: `2px solid ${t.fg}`, boxShadow: shadow[2],
          color: 'var(--bg)', fontFamily: font.title, fontWeight: 700, fontSize: `clamp(6px, ${tamano * 48}cqw, 28px)`, lineHeight: 1, userSelect: 'none',
          opacity: arrastrada ? 0.85 : 1,
        }}
      >
        {url ? <img src={url} alt="" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} /> : marcaDe({ nombre: f.nombre, bando: f.bando })}
      </span>
      {nombre && (
        <span
          style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', marginTop: 2, padding: '0 4px', borderRadius: 4,
            background: 'color-mix(in srgb, var(--bg) 78%, transparent)', color: c.text, fontSize: `clamp(8px, ${tamano * 22}cqw, 14px)`, fontWeight: 650,
            lineHeight: 1.3, whiteSpace: 'nowrap', pointerEvents: 'none',
          }}
        >
          {f.nombre}
        </span>
      )}
    </div>
  )
}
