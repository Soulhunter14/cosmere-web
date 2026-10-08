import { useMemo, useState, type CSSProperties } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, FileUp, Trash2, Upload, X } from 'lucide-react'
import { bookApi } from '../../api/book'
import { useWorldConfig } from '../../store/campaignStore'
import { Button, ConfirmDialog, Select, Sheet, Spinner } from '../../components/ui'
import { c, eyebrow, fs, radius, tone } from '../../theme'
import type { BookChapterSummary } from '../../types'
import { usePantalla } from './contexto'
import { dividirGuion, leerEscena } from './guion'
import { NavegadorEscenas } from './piezas'
import { leerCapituloSubido } from './libro'
import { BotonAnadirASesion, DetalleEscenaLibro } from './PanelGuion'

/**
 * «Libro original»: the adventure book with its original text, uploaded by the director to their campaign one chapter at a
 * time (`/campaigns/{id}/book`, director only). The chapters are Markdown files in the screen's scene format, generated from
 * the PDF by `scripts/aventura/parsear_libro.py` and kept out of git. Once uploaded, the Libro shows them instead of the
 * summary of `WorldConfig.libro`; «A la sesión» copies a scene as it is into the session, where the director adapts it.
 */

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }

/** The Libro with the uploaded original: chapter, index and the scene, read only */
export function GuiaOriginal({
  capitulos, numero, escenaId, escala, onCapitulo, onEscena, onEscala,
}: {
  capitulos: BookChapterSummary[]
  numero: number | null
  escenaId: string | null
  escala: number
  onCapitulo: (n: number) => void
  onEscena: (id: string) => void
  onEscala: (v: number) => void
}) {
  const { cId } = usePantalla()
  const cfg = useWorldConfig()
  const [subiendo, setSubiendo] = useState(false)
  const [quitando, setQuitando] = useState(false)
  const cap = capitulos.find((x) => x.number === numero) ?? capitulos[0]
  const q = useQuery({ queryKey: ['book', cId, cap.number], queryFn: () => bookApi.get(cId, cap.number), staleTime: Infinity })
  const escenas = useMemo(
    () => (q.data ? dividirGuion(q.data.md).escenas.map((md, i) => ({ id: `libro-${cap.number}-${i}`, md })) : []),
    [q.data, cap.number],
  )
  const sel = escenas.find((e) => e.id === escenaId) ?? escenas[0] ?? null

  return (
    <div style={stack(14)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: -6 }}>
        <p style={{ ...eyebrow, color: tone.gold.fg, flex: 1, minWidth: 0 }}>{cfg.libro?.titulo ?? 'Libro'} · texto original</p>
        <Button size="sm" variant="ghost" icon={<Upload size={15} aria-hidden />} onClick={() => setSubiendo(true)}>Subir capítulos</Button>
        <Button size="sm" variant="ghost" icon={<Trash2 size={15} aria-hidden />} onClick={() => setQuitando(true)}>Quitar el original</Button>
      </div>
      <Select
        aria-label="Capítulo del libro original"
        value={cap.number}
        onChange={(e) => onCapitulo(Number(e.target.value))}
        style={{ fontWeight: 650 }}
      >
        {capitulos.map((x) => <option key={x.number} value={x.number}>Capítulo {x.number} · {x.title}</option>)}
      </Select>

      {q.isLoading && <Spinner label="Cargando el capítulo…" />}
      {q.isError && <p role="alert" style={{ fontSize: fs.sm, color: tone.rubi.fg }}>No se pudo cargar el capítulo. Vuelve a intentarlo.</p>}
      {sel && (
        <>
          <NavegadorEscenas
            titulo={`Capítulo ${cap.number} · ${cap.title}`}
            ancla="escena-aventura"
            progreso={false}
            escenas={escenas.map((e) => {
              const x = leerEscena(e.md)
              return { id: e.id, titulo: x.titulo, tipo: x.tipo, grupo: x.apartado || x.grupo, jugada: false, actual: false }
            })}
            seleccion={sel.id}
            onElegir={onEscena}
            accion={<BotonAnadirASesion md={sel.md} compacto />}
          />
          <DetalleEscenaLibro esc={sel} escala={escala} onEscala={onEscala} />
        </>
      )}

      {subiendo && <HojaSubirLibro onClose={() => setSubiendo(false)} />}
      <QuitarOriginal abierto={quitando} capitulos={capitulos} onCerrar={() => setQuitando(false)} />
    </div>
  )
}

/** «Subir el libro original» while the Libro shows the summary */
export function BotonSubirLibro() {
  const [abierto, setAbierto] = useState(false)
  return (
    <>
      <Button size="sm" variant="ghost" icon={<Upload size={15} aria-hidden />} onClick={() => setAbierto(true)} style={{ alignSelf: 'flex-start' }}>
        Subir el libro original
      </Button>
      {abierto && <HojaSubirLibro onClose={() => setAbierto(false)} />}
    </>
  )
}

type Archivo = { nombre: string } & ({ numero: number; titulo: string; md: string } | { error: string })
type Estado = 'pendiente' | 'subiendo' | 'subido' | 'fallo'

/** Picks the chapter files (.md), checks them and uploads them one by one; each replaces the chapter of its number */
function HojaSubirLibro({ onClose }: { onClose: () => void }) {
  const { cId } = usePantalla()
  const qc = useQueryClient()
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [estados, setEstados] = useState<Record<string, Estado>>({})
  const [enCurso, setEnCurso] = useState(false)
  const validos = archivos.filter((a): a is Archivo & { numero: number; titulo: string; md: string } => !('error' in a))
  const terminado = validos.length > 0 && validos.every((a) => estados[a.nombre] === 'subido')

  const elegir = async (lista: FileList | null) => {
    const leidos = await Promise.all([...(lista ?? [])].map(async (f): Promise<Archivo> => ({ nombre: f.name, ...leerCapituloSubido(await f.text()) })))
    leidos.sort((a, b) => ('numero' in a ? a.numero : 999) - ('numero' in b ? b.numero : 999))
    setArchivos(leidos)
    setEstados({})
  }

  const subir = async () => {
    setEnCurso(true)
    for (const a of validos) {
      setEstados((e) => ({ ...e, [a.nombre]: 'subiendo' }))
      try {
        await bookApi.save(cId, a.numero, { title: a.titulo, md: a.md })
        setEstados((e) => ({ ...e, [a.nombre]: 'subido' }))
      } catch {
        setEstados((e) => ({ ...e, [a.nombre]: 'fallo' }))
      }
    }
    await qc.invalidateQueries({ queryKey: ['book', cId] })
    setEnCurso(false)
  }

  return (
    <Sheet
      open
      onClose={enCurso ? () => {} : onClose}
      title="Subir el libro original"
      description="Elige los capítulos (.md) generados desde el PDF. Cada uno sustituye al capítulo de su número; el Libro mostrará el texto original en lugar del resumen. Solo los ve el director de esta campaña."
      maxWidth={560}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} disabled={enCurso} onClick={onClose}>{terminado ? 'Cerrar' : 'Cancelar'}</Button>
          {!terminado && (
            <Button size="lg" style={{ flex: 2 }} icon={<Upload size={16} aria-hidden />} disabled={enCurso || validos.length === 0} loading={enCurso} onClick={subir}>
              Subir {validos.length || ''} capítulo{validos.length === 1 ? '' : 's'}
            </Button>
          )}
        </>
      }
    >
      <div style={stack(14)}>
        <label className="ui-btn ui-btn--secondary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: '0 14px', borderRadius: radius.md, cursor: 'pointer', fontWeight: 650, fontSize: fs.sm }}>
          <FileUp size={16} aria-hidden /> Elegir archivos .md
          <input type="file" accept=".md,text/markdown,text/plain" multiple className="sr-only" onChange={(e) => elegir(e.target.files)} disabled={enCurso} />
        </label>
        {archivos.length > 0 && (
          <ul aria-label="Capítulos elegidos" style={{ ...listReset, ...stack(6) }}>
            {archivos.map((a) => {
              const est = estados[a.nombre]
              const mal = 'error' in a || est === 'fallo'
              return (
                <li key={a.nombre} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: radius.md, background: c.s1, border: `1px solid ${mal ? tone.rubi.border : c.border}` }}>
                  <span aria-hidden style={{ color: mal ? tone.rubi.fg : est === 'subido' ? tone.esmeralda.fg : c.subtle, paddingTop: 2 }}>
                    {mal ? <X size={16} /> : <Check size={16} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 650, color: c.text, fontSize: fs.sm + 1 }}>
                      {'error' in a ? a.nombre : `Capítulo ${a.numero} · ${a.titulo}`}
                    </p>
                    <p style={{ fontSize: fs.xs, color: mal ? tone.rubi.fg : c.subtle }}>
                      {'error' in a
                        ? a.error
                        : est === 'fallo' ? 'No se pudo subir: vuelve a intentarlo.'
                          : est === 'subido' ? 'Subido.'
                            : est === 'subiendo' ? 'Subiendo…'
                              : `${a.nombre} · ${dividirGuion(a.md).escenas.length} escenas · ${Math.round(a.md.length / 1024)} KB`}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </Sheet>
  )
}

/** Removes every uploaded chapter (with confirmation): the Libro goes back to the summary */
function QuitarOriginal({ abierto, capitulos, onCerrar }: { abierto: boolean; capitulos: BookChapterSummary[]; onCerrar: () => void }) {
  const { cId } = usePantalla()
  const qc = useQueryClient()
  const [quitando, setQuitando] = useState(false)
  const quitar = async () => {
    setQuitando(true)
    try {
      for (const x of capitulos) await bookApi.remove(cId, x.number)
    } finally {
      await qc.invalidateQueries({ queryKey: ['book', cId] })
      setQuitando(false)
      onCerrar()
    }
  }
  return (
    <ConfirmDialog
      open={abierto}
      title="¿Quitar el libro original?"
      message={`Se ${capitulos.length === 1 ? 'borra de esta campaña el capítulo subido' : `borran de esta campaña los ${capitulos.length} capítulos subidos`} y el Libro vuelve al resumen. Tu sesión no cambia; puedes volver a subirlo${capitulos.length === 1 ? '' : 's'} cuando quieras.`}
      confirmLabel="Quitar"
      loading={quitando}
      onConfirm={quitar}
      onCancel={onCerrar}
    />
  )
}
