import { useState } from 'react'
import { ExternalLink, Maximize2, Minimize2 } from 'lucide-react'
import { ETIQUETA_IMAGEN_LIBRO, ORDEN_IMAGENES_LIBRO, useImagenLibro } from '../lib/fichasLibro'
import { Button, Spinner } from './ui'
import { c, eyebrow, fs, radius, tone } from '../theme'
import type { BookImageKind, GlobalNpc } from '../types'

/**
 * The adversary as its book prints it (`scripts/aventura/fichas_libro.py`, uploaded to the catalog): its illustration, its stat
 * block and its tactics. Each image fits the width; «Ampliar» doubles it to pan the small print, and «Abrir aparte» opens it in a tab
 * of its own, where the tablet zooms it with two fingers.
 */
export function FichaLibro({ cId, npc }: { cId: number; npc: Pick<GlobalNpc, 'id' | 'name' | 'bookImages'> }) {
  if (npc.bookImages.length === 0) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {ORDEN_IMAGENES_LIBRO.filter((k) => npc.bookImages.includes(k)).map((k) => <ImagenLibro key={k} cId={cId} npcId={npc.id} kind={k} nombre={npc.name} />)}
    </div>
  )
}

function ImagenLibro({ cId, npcId, kind, nombre }: { cId: number; npcId: number; kind: BookImageKind; nombre: string }) {
  const { data: url, isLoading, isError } = useImagenLibro(cId, npcId, kind)
  const [grande, setGrande] = useState(false)
  const etiqueta = ETIQUETA_IMAGEN_LIBRO[kind]
  return (
    <section aria-label={`${etiqueta} de ${nombre} en el libro`} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <h3 style={{ ...eyebrow, color: tone.rubi.fg, flex: 1 }}>{etiqueta}</h3>
        {url && (
          <>
            <Button size="sm" variant="ghost" icon={grande ? <Minimize2 size={15} aria-hidden /> : <Maximize2 size={15} aria-hidden />} onClick={() => setGrande(!grande)} aria-pressed={grande}>
              {grande ? 'Ajustar' : 'Ampliar'}
            </Button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-btn ui-btn--ghost"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 36, padding: '0 10px', borderRadius: radius.md, color: c.muted, fontSize: fs.sm, fontWeight: 650, textDecoration: 'none' }}
            >
              <ExternalLink size={15} aria-hidden />
              Abrir aparte
            </a>
          </>
        )}
      </div>
      {isLoading ? (
        <Spinner label={`Cargando ${etiqueta.toLowerCase()} del libro…`} />
      ) : isError || !url ? (
        <p style={{ fontSize: fs.sm, color: tone.rubi.fg }}>No se pudo cargar la imagen del libro.</p>
      ) : (
        <div
          style={{
            overflow: grande ? 'auto' : 'hidden', maxHeight: grande ? '75vh' : undefined,
            borderRadius: radius.md, border: `1px solid ${c.border}`, background: c.s2,
          }}
        >
          <img
            src={url}
            alt={`${etiqueta} de ${nombre}, tal como la imprime el libro`}
            decoding="async"
            style={{ display: 'block', width: grande ? '200%' : '100%', maxWidth: 'none', height: 'auto' }}
          />
        </div>
      )}
    </section>
  )
}
