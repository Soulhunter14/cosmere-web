import { useRef, useState, type CSSProperties } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { BookOpen, FileUp, Trash2 } from 'lucide-react'
import { globalNpcsApi } from '../../api/global-npcs'
import { Button, ConfirmDialog, EmptyState, ErrorMessage } from '../../components/ui'
import { FichaLibro } from '../../components/FichaLibro'
import { ETIQUETA_IMAGEN_LIBRO, ORDEN_IMAGENES_LIBRO } from '../../lib/fichasLibro'
import { c, fs } from '../../theme'
import type { BookImageKind, GlobalNpc } from '../../types'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

/**
 * «Libro» tab of an adversary (GM): its page as the book prints it, and the controls to upload, replace or remove each image.
 * They belong to the world's catalog, so a change is seen by every campaign of the world.
 */
export function LibroDelAdversario({ cId, npc }: { cId: number; npc: GlobalNpc }) {
  const qc = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const [destino, setDestino] = useState<BookImageKind>('ficha')
  const [quitando, setQuitando] = useState<BookImageKind | null>(null)

  const refrescar = async (kind: BookImageKind) => {
    qc.removeQueries({ queryKey: ['global-npc-image', npc.id, kind] })
    await Promise.all([qc.invalidateQueries({ queryKey: ['global-npc', npc.id] }), qc.invalidateQueries({ queryKey: ['global-npcs'] })])
  }
  const subir = useMutation({
    mutationFn: ({ kind, file }: { kind: BookImageKind; file: File }) => globalNpcsApi.saveBookImage(npc.id, kind, file, cId),
    onSuccess: (_, { kind }) => refrescar(kind),
  })
  const quitar = useMutation({
    mutationFn: (kind: BookImageKind) => globalNpcsApi.deleteBookImage(npc.id, kind, cId),
    onSuccess: (_, kind) => refrescar(kind),
  })

  const elegir = (kind: BookImageKind) => {
    setDestino(kind)
    input.current?.click()
  }
  const tiene = (kind: BookImageKind) => npc.bookImages.includes(kind)

  return (
    <div style={stack(16)}>
      <input
        ref={input}
        type="file"
        accept="image/webp,image/png,image/jpeg"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) subir.mutate({ kind: destino, file })
          e.target.value = ''
        }}
        style={{ display: 'none' }}
      />
      {npc.bookImages.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={22} aria-hidden />}
          title="Sin la página del libro"
          description="Recórtala de tu PDF con scripts/aventura/fichas_libro.py y súbela aquí o, de varias a la vez, con «Subir fichas del libro» en la lista de NPCs."
        />
      ) : (
        <FichaLibro cId={cId} npc={npc} />
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {ORDEN_IMAGENES_LIBRO.map((k) => (
          <Button key={k} variant="secondary" size="sm" icon={<FileUp size={15} aria-hidden />} loading={subir.isPending && destino === k} onClick={() => elegir(k)}>
            {tiene(k) ? `Sustituir ${ETIQUETA_IMAGEN_LIBRO[k].toLowerCase()}` : `Subir ${ETIQUETA_IMAGEN_LIBRO[k].toLowerCase()}`}
          </Button>
        ))}
        {ORDEN_IMAGENES_LIBRO.filter(tiene).map((k) => (
          <Button key={`quitar-${k}`} variant="ghost" size="sm" icon={<Trash2 size={15} aria-hidden />} onClick={() => setQuitando(k)}>
            Quitar {ETIQUETA_IMAGEN_LIBRO[k].toLowerCase()}
          </Button>
        ))}
      </div>
      <p style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.5 }}>
        Las imágenes son del catálogo del mundo: cualquier cambio lo ven todas sus campañas.
      </p>
      {(subir.isError || quitar.isError) && (
        <ErrorMessage message="No se pudo guardar el cambio de la página del libro. Comprueba que la imagen sea WebP, PNG o JPEG de menos de 3 MB." />
      )}
      <ConfirmDialog
        open={quitando !== null}
        title={`¿Quitar ${quitando === 'tacticas' ? 'las tácticas' : quitando === 'retrato' ? 'el retrato' : 'la ficha'} del libro de ${npc.name}?`}
        message="Se quita del catálogo para todas las campañas del mundo. La ficha de la app (Stats) no cambia."
        confirmLabel="Quitar"
        onConfirm={() => { if (quitando) quitar.mutate(quitando); setQuitando(null) }}
        onCancel={() => setQuitando(null)}
      />
    </div>
  )
}
