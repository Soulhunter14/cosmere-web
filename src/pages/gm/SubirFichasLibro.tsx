import { useRef, useState, type CSSProperties } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, FileUp, Upload } from 'lucide-react'
import { globalNpcsApi } from '../../api/global-npcs'
import { Button, ErrorMessage, Sheet } from '../../components/ui'
import { c, eyebrow, fs, radius, tone } from '../../theme'
import type { BookImageKind, GlobalNpc } from '../../types'
import { ETIQUETA_IMAGEN_LIBRO, ORDEN_IMAGENES_LIBRO, emparejarFichas } from '../../lib/fichasLibro'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

/** «retrato, ficha y tácticas», «ficha» */
const queLleva = (kinds: BookImageKind[]) => {
  const nombres = ORDEN_IMAGENES_LIBRO.filter((k) => kinds.includes(k)).map((k) => ETIQUETA_IMAGEN_LIBRO[k].toLowerCase())
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0] ?? ''
}

/**
 * «Subir fichas del libro»: the images `scripts/aventura/fichas_libro.py` cut from the GM's PDF, several at once. Each file goes
 * to the adversary of its name in this campaign's catalog, which is the world's: every campaign of the world sees them. Before
 * uploading, the sheet says what goes where and what is left out.
 */
export function SubirFichasLibro({ cId, catalogo, onClose }: { cId: number; catalogo: GlobalNpc[]; onClose: () => void }) {
  const qc = useQueryClient()
  const input = useRef<HTMLInputElement>(null)
  const [plan, setPlan] = useState<ReturnType<typeof emparejarFichas> | null>(null)
  const [hechas, setHechas] = useState(0)
  const [subiendo, setSubiendo] = useState(false)
  const [fallos, setFallos] = useState<string[]>([])
  const [terminado, setTerminado] = useState(false)

  const elegir = (files: FileList | null) => {
    if (!files?.length) return
    setPlan(emparejarFichas([...files], catalogo))
    setHechas(0)
    setFallos([])
    setTerminado(false)
  }

  const subir = async () => {
    if (!plan) return
    setSubiendo(true)
    const mal: string[] = []
    for (const s of plan.subidas) {
      try {
        await globalNpcsApi.saveBookImage(s.npc.id, s.kind, s.file, cId)
      } catch {
        mal.push(`${s.npc.name} (${ETIQUETA_IMAGEN_LIBRO[s.kind].toLowerCase()})`)
      }
      setHechas((n) => n + 1)
    }
    setFallos(mal)
    setSubiendo(false)
    setTerminado(true)
    // The lists say which adversaries have their page; the images already seen are read again
    qc.removeQueries({ queryKey: ['global-npc-image'] })
    await Promise.all([qc.invalidateQueries({ queryKey: ['global-npcs'] }), qc.invalidateQueries({ queryKey: ['global-npc'] })])
  }

  // One line per adversary, in the catalog's order
  const porAdversario = plan
    ? catalogo
      .map((npc) => ({ npc, kinds: plan.subidas.filter((s) => s.npc.id === npc.id).map((s) => s.kind) }))
      .filter((x) => x.kinds.length > 0)
    : []
  const fuera = plan ? [...plan.sinAdversario, ...plan.deOtroLibro, ...plan.noValidos].length : 0

  return (
    <Sheet
      open
      onClose={() => { if (!subiendo) onClose() }}
      title="Subir fichas del libro"
      description="Las fichas que recorta scripts/aventura/fichas_libro.py de tu PDF. Se guardan en el catálogo del mundo: las ven todas sus campañas."
      maxWidth={560}
      footer={
        terminado ? (
          <Button size="lg" style={{ flex: 1 }} onClick={onClose}>Cerrar</Button>
        ) : (
          <>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} disabled={subiendo} onClick={onClose}>Cancelar</Button>
            <Button
              size="lg"
              style={{ flex: 2 }}
              icon={<Upload size={16} aria-hidden />}
              disabled={!plan?.subidas.length}
              loading={subiendo}
              onClick={() => void subir()}
            >
              {subiendo ? `Subiendo ${hechas} de ${plan?.subidas.length ?? 0}…` : `Subir ${plan?.subidas.length ?? 0} imágenes`}
            </Button>
          </>
        )
      }
    >
      <div style={stack(16)}>
        <input
          ref={input}
          type="file"
          multiple
          accept="image/webp,image/png,image/jpeg"
          onChange={(e) => { elegir(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }}
        />
        {!terminado && (
          <Button variant="secondary" icon={<FileUp size={16} aria-hidden />} disabled={subiendo} onClick={() => input.current?.click()} style={{ alignSelf: 'flex-start' }}>
            {plan ? 'Elegir otros archivos' : 'Elegir archivos'}
          </Button>
        )}
        {!plan && (
          <p style={{ fontSize: fs.sm + 1, color: c.muted, lineHeight: 1.55 }}>
            Elige todas las imágenes de una carpeta del script (por ejemplo, <code>fichas/legado</code>). Cada una va al adversario de
            su nombre; si un adversario sale en los dos libros, se queda con la de su fuente.
          </p>
        )}

        {plan && (
          <>
            <p style={{ fontSize: fs.md, color: c.text }}>
              {plan.subidas.length
                ? `${plan.subidas.length} imágenes para ${porAdversario.length} adversarios del catálogo.`
                : 'Ninguna imagen encaja con un adversario de este catálogo.'}
            </p>
            {porAdversario.length > 0 && (
              <ul style={{ listStyle: 'none', margin: 0, ...stack(4), maxHeight: 260, overflowY: 'auto', borderRadius: radius.md, border: `1px solid ${c.border}`, padding: '8px 12px' }}>
                {porAdversario.map(({ npc, kinds }) => (
                  <li key={npc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.sm + 1, color: c.text }}>
                    {terminado && <Check size={14} aria-hidden style={{ color: tone.esmeralda.fg, flexShrink: 0 }} />}
                    <span style={{ flex: 1, minWidth: 0 }}>{npc.name}</span>
                    <span style={{ fontSize: fs.xs, color: c.subtle }}>{queLleva(kinds)}</span>
                  </li>
                ))}
              </ul>
            )}
            {fuera > 0 && (
              <section style={stack(6)}>
                <h3 style={{ ...eyebrow, color: c.subtle }}>Se quedan fuera</h3>
                {plan.sinAdversario.length > 0 && (
                  <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
                    <strong>{plan.sinAdversario.length} sin adversario en este catálogo</strong> (de otra era o que no está en la app):{' '}
                    {plan.sinAdversario.join(', ')}.
                  </p>
                )}
                {plan.deOtroLibro.length > 0 && (
                  <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
                    <strong>{plan.deOtroLibro.length} repetidas de otro libro</strong> (va la del libro de su fuente): {plan.deOtroLibro.join(', ')}.
                  </p>
                )}
                {plan.noValidos.length > 0 && (
                  <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
                    <strong>{plan.noValidos.length} que no son del script</strong>: {plan.noValidos.join(', ')}.
                  </p>
                )}
              </section>
            )}
          </>
        )}

        {terminado && (
          fallos.length
            ? <ErrorMessage message={`No se pudieron subir ${fallos.length}: ${fallos.join(', ')}. Vuelve a elegirlas para reintentarlo.`} />
            : <p style={{ fontSize: fs.sm + 1, color: tone.esmeralda.fg }}>Hecho: {hechas} imágenes subidas.</p>
        )}
      </div>
    </Sheet>
  )
}
