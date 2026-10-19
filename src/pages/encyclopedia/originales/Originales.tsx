/**
 * «Originales del libro» of the encyclopedia: the book's text and a mini-PDF of each entry of a section (one per heroic path, metalborn
 * path, power…), generated from the director's own PDF by `scripts/enciclopedia/generar_originales.py` and kept out of git. The
 * director uploads them here; once uploaded, every campaign of the world reads them and downloads the PDFs.
 * - `OriginalesDelLibro`: the panel of the section, under the page header: every entry with its downloads, and the director's upload.
 * - `OriginalEntrada`: the block inside the detail of one entry (a path's sheet, a power's page).
 */
import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Check, Download, FileText, FileUp, Trash2, Upload, X } from 'lucide-react'
import { encyclopediaApi } from '../../../api/encyclopedia'
import { useWorld } from '../../../store/campaignStore'
import { Button, ConfirmDialog, Disclosure, Sheet, Spinner } from '../../../components/ui'
import { c, eyebrow, font, fs, radius, tone } from '../../../theme'
import type { EntradaOriginal, ManifiestoOriginales, SeccionOriginales } from '../../../data/originales/tipos'
import { MAX_MD, MAX_PDF, claveListaOriginales, descargarPdf, paginasDe, peso, useOriginales, type EstadoOriginales } from './useOriginales'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }

// ── Download and read buttons of one entry ──

function BotonesEntrada({ o, seccion, e, compacto = false }: { o: EstadoOriginales; seccion: SeccionOriginales; e: EntradaOriginal; compacto?: boolean }) {
  const [leyendo, setLeyendo] = useState(false)
  const [bajando, setBajando] = useState(false)
  const [fallo, setFallo] = useState(false)
  const s = o.subido(e.clave)
  if (!s || !o.manifiesto || o.cId == null) return null
  const man = o.manifiesto
  const cId = o.cId

  const bajar = async () => {
    setBajando(true)
    setFallo(false)
    try {
      await descargarPdf(cId, seccion, e, man)
    } catch {
      setFallo(true)
    } finally {
      setBajando(false)
    }
  }

  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {s.textLength != null && (
          <Button size="sm" variant="secondary" icon={<BookOpen size={15} aria-hidden />} onClick={() => setLeyendo(true)} aria-label={`Leer el texto original de ${e.titulo}`}>
            {compacto ? 'Texto' : 'Leer el original'}
          </Button>
        )}
        {s.pdfBytes != null && (
          <Button size="sm" variant="secondary" icon={<Download size={15} aria-hidden />} loading={bajando} onClick={bajar} aria-label={`Descargar el PDF de ${e.titulo} (${peso(s.pdfBytes)})`}>
            {compacto ? 'PDF' : 'Descargar PDF'} · {peso(s.pdfBytes)}
          </Button>
        )}
      </div>
      {fallo && <p role="alert" style={{ fontSize: fs.xs, color: tone.rubi.fg }}>No se pudo descargar el PDF. Vuelve a intentarlo.</p>}
      {leyendo && <HojaTexto cId={cId} seccion={seccion} e={e} man={man} onClose={() => setLeyendo(false)} />}
    </>
  )
}

// ── The block inside the detail of an entry ──

/** «Del libro» inside the detail of an entry: read its original text and download its PDF. Nothing when nothing is uploaded */
export function OriginalEntrada({ seccion, clave, style }: { seccion: SeccionOriginales; clave: string; style?: CSSProperties }) {
  const o = useOriginales(seccion)
  const e = o.entradas.find((x) => x.clave === clave)
  if (!e || !o.manifiesto || !o.subido(clave)) return null
  return (
    <section
      aria-label="Original del libro"
      style={{ ...stack(10), padding: '12px 14px', borderRadius: radius.md, background: tone.gold.bg, border: `1px solid ${tone.gold.border}`, ...style }}
    >
      <div>
        <p style={{ ...eyebrow, color: tone.gold.fg }}>Del libro</p>
        <p style={{ fontSize: fs.xs, color: c.muted, marginTop: 2 }}>{o.manifiesto.libro} · {paginasDe(e, o.manifiesto)}</p>
      </div>
      <BotonesEntrada o={o} seccion={seccion} e={e} />
    </section>
  )
}

// ── The panel of the section ──

/**
 * «Originales del libro» under the header of a section page: every entry with what is uploaded (text, PDF). Players only see it when
 * something is uploaded; the director also gets «Subir originales» and «Quitar originales».
 */
export function OriginalesDelLibro({ seccion, style }: { seccion: SeccionOriginales; style?: CSSProperties }) {
  const o = useOriginales(seccion)
  const [subiendo, setSubiendo] = useState(false)
  const [quitando, setQuitando] = useState(false)
  if (!o.manifiesto || !o.listo || o.entradas.length === 0) return null
  const man = o.manifiesto
  const conAlgo = o.entradas.filter((e) => o.subido(e.clave))
  if (conAlgo.length === 0 && !o.isGm) return null
  const pdfs = o.entradas.filter((e) => o.subido(e.clave)?.pdfBytes != null).length

  return (
    <div style={style}>
      <Disclosure
        title="Originales del libro"
        summary={conAlgo.length === 0 ? 'Aún no hay ninguno subido' : `${pdfs} PDF de ${o.entradas.length} · ${man.libro}`}
        icon={<FileText size={18} aria-hidden style={{ color: tone.gold.fg }} />}
        accent="var(--gold)"
      >
        <div style={stack(12)}>
          {o.isGm && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <Button size="sm" variant="ghost" icon={<Upload size={15} aria-hidden />} onClick={() => setSubiendo(true)}>Subir originales</Button>
              {conAlgo.length > 0 && (
                <Button size="sm" variant="ghost" icon={<Trash2 size={15} aria-hidden />} onClick={() => setQuitando(true)}>Quitar originales</Button>
              )}
            </div>
          )}
          <ul aria-label="Originales de la sección" style={{ ...listReset, ...stack(8) }}>
            {o.entradas.map((e) => {
              const s = o.subido(e.clave)
              if (!s && !o.isGm) return null
              return (
                <li key={e.clave} style={{ ...stack(8), padding: '10px 12px', borderRadius: radius.md, background: c.s1, border: `1px solid ${c.border}` }}>
                  <div>
                    <p style={{ fontFamily: font.display, fontSize: fs.md, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>{e.titulo}</p>
                    <p style={{ fontSize: fs.xs, color: c.subtle }}>{paginasDe(e, man)}{!s && ' · sin subir'}</p>
                  </div>
                  {s && <BotonesEntrada o={o} seccion={seccion} e={e} compacto />}
                </li>
              )
            })}
          </ul>
        </div>
      </Disclosure>
      {subiendo && <HojaSubir o={o} seccion={seccion} onClose={() => setSubiendo(false)} />}
      <QuitarOriginales abierto={quitando} o={o} seccion={seccion} onCerrar={() => setQuitando(false)} />
    </div>
  )
}

// ── Reader of the original text ──

function HojaTexto({ cId, seccion, e, man, onClose }: { cId: number; seccion: SeccionOriginales; e: EntradaOriginal; man: ManifiestoOriginales; onClose: () => void }) {
  const q = useQuery({
    queryKey: ['encyclopedia-original-text', cId, seccion, e.clave],
    queryFn: () => encyclopediaApi.getText(cId, seccion, e.clave),
    staleTime: Infinity,
  })
  return (
    <Sheet open onClose={onClose} title={e.titulo} description={`${man.libro} · ${paginasDe(e, man)} · texto original`} maxWidth={640}>
      {q.isLoading && <Spinner label="Cargando el texto…" />}
      {q.isError && <p role="alert" style={{ fontSize: fs.sm, color: tone.rubi.fg }}>No se pudo cargar el texto. Vuelve a intentarlo.</p>}
      {q.data && <TextoMd md={q.data.md} titulo={e.titulo} />}
    </Sheet>
  )
}

/** Inline Markdown of the generated texts: only **bold** and *italics* */
function enLinea(t: string): ReactNode[] {
  return t.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g).map((p, i) =>
    p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <strong key={i} style={{ color: c.text, fontWeight: 650 }}>{p.slice(2, -2)}</strong>
      : p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em>
        : p,
  )
}

/** The Markdown of `generar_originales.py`: front matter, `<!-- PDF n · L.m -->` page marks, `##`/`###` headings and paragraphs */
function TextoMd({ md, titulo }: { md: string; titulo: string }) {
  const bloques = useMemo(() => {
    const cuerpo = md.replace(/\r\n?/g, '\n').replace(/^---\n[\s\S]*?\n---\n/, '')
    return cuerpo.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  }, [md])
  return (
    <div style={{ ...stack(10), fontFamily: font.display, fontSize: fs.md, lineHeight: 1.6, color: c.muted }}>
      {bloques.map((b, i) => {
        const pagina = /^<!--\s*(.+?)\s*-->$/.exec(b)
        if (pagina) {
          return (
            <p key={i} aria-label={`Página ${pagina[1]}`} style={{ ...eyebrow, display: 'flex', alignItems: 'center', gap: 8, marginTop: i ? 8 : 0 }}>
              <span aria-hidden style={{ flex: 1, height: 1, background: c.border }} />
              {pagina[1]}
              <span aria-hidden style={{ flex: 1, height: 1, background: c.border }} />
            </p>
          )
        }
        const h = /^(#{1,4})\s+(.+)$/.exec(b)
        if (h) {
          if (h[1].length === 1 && h[2].trim() === titulo) return null
          const nivel = Math.min(h[1].length + 1, 5)
          const H = `h${nivel}` as 'h2' | 'h3' | 'h4' | 'h5'
          return (
            <H key={i} style={{ fontFamily: font.display, fontWeight: 600, color: c.text, lineHeight: 1.25, fontSize: nivel <= 3 ? fs.lg + 2 : fs.md + 1, marginTop: 6 }}>
              {h[2]}
            </H>
          )
        }
        return <p key={i}>{enLinea(b.replace(/\n/g, ' '))}</p>
      })}
    </div>
  )
}

// ── Director: upload ──

type Archivo = { nombre: string; tipo: 'texto' | 'pdf'; entrada?: EntradaOriginal; error?: string; md?: string; pdf?: File }
type Estado = 'subiendo' | 'subido' | 'fallo'

const campo = (md: string, k: string) => new RegExp(`^${k}\\s*:\\s*(.+)$`, 'mi').exec(/^---\n([\s\S]*?)\n---/.exec(md)?.[1] ?? '')?.[1].trim() ?? ''

/** Picks the generated files of the section (`<clave>.md`, `<clave>.pdf`), checks them and uploads them one by one */
function HojaSubir({ o, seccion, onClose }: { o: EstadoOriginales; seccion: SeccionOriginales; onClose: () => void }) {
  const qc = useQueryClient()
  const mundo = useWorld()
  const [archivos, setArchivos] = useState<Archivo[]>([])
  const [estados, setEstados] = useState<Record<string, Estado>>({})
  const [enCurso, setEnCurso] = useState(false)
  const validos = archivos.filter((a) => !a.error && a.entrada)
  const terminado = validos.length > 0 && validos.every((a) => estados[a.nombre] === 'subido')

  const leer = async (f: File): Promise<Archivo> => {
    const ext = /\.(md|pdf)$/i.exec(f.name)?.[1].toLowerCase()
    const clave = f.name.replace(/\.[^.]+$/, '')
    const entrada = o.entradas.find((e) => e.clave === clave)
    if (ext !== 'md' && ext !== 'pdf') return { nombre: f.name, tipo: 'texto', error: 'Solo se suben archivos .md y .pdf.' }
    const tipo = ext === 'md' ? 'texto' : 'pdf'
    if (!entrada) return { nombre: f.name, tipo, error: 'No es de esta sección: el nombre debe ser la clave de una entrada (p. ej. «agente.pdf»).' }
    if (tipo === 'pdf') {
      if (f.size > MAX_PDF) return { nombre: f.name, tipo, entrada, error: `Pesa ${peso(f.size)}: el máximo es ${peso(MAX_PDF)}.` }
      const cabecera = new TextDecoder().decode(await f.slice(0, 5).arrayBuffer())
      if (cabecera !== '%PDF-') return { nombre: f.name, tipo, entrada, error: 'No es un PDF.' }
      return { nombre: f.name, tipo, entrada, pdf: f }
    }
    const md = (await f.text()).replace(/\r\n?/g, '\n').trim()
    if (!md) return { nombre: f.name, tipo, entrada, error: 'Está vacío.' }
    if (md.length > MAX_MD) return { nombre: f.name, tipo, entrada, error: 'Es demasiado grande (más de 300 000 caracteres).' }
    const s = campo(md, 'seccion')
    const m = campo(md, 'mundo')
    if ((s && s !== seccion) || (m && m !== mundo)) return { nombre: f.name, tipo, entrada, error: 'Su cabecera es de otra sección o de otro mundo.' }
    return { nombre: f.name, tipo, entrada, md }
  }

  const elegir = async (lista: FileList | null) => {
    const leidos = await Promise.all([...(lista ?? [])].map(leer))
    const orden = (a: Archivo) => (a.entrada ? o.entradas.indexOf(a.entrada) : 999)
    leidos.sort((a, b) => orden(a) - orden(b) || a.nombre.localeCompare(b.nombre))
    setArchivos(leidos)
    setEstados({})
  }

  const subir = async () => {
    if (o.cId == null) return
    setEnCurso(true)
    for (const a of validos) {
      const e = a.entrada!
      setEstados((x) => ({ ...x, [a.nombre]: 'subiendo' }))
      try {
        if (a.pdf) await encyclopediaApi.savePdf(o.cId, seccion, e.clave, e.titulo, a.pdf)
        else await encyclopediaApi.saveText(o.cId, seccion, e.clave, { title: e.titulo, md: a.md! })
        setEstados((x) => ({ ...x, [a.nombre]: 'subido' }))
      } catch {
        setEstados((x) => ({ ...x, [a.nombre]: 'fallo' }))
      }
    }
    await qc.invalidateQueries({ queryKey: claveListaOriginales(o.cId) })
    await qc.invalidateQueries({ queryKey: ['encyclopedia-original-text', o.cId, seccion] })
    setEnCurso(false)
  }

  return (
    <Sheet
      open
      onClose={enCurso ? () => {} : onClose}
      title="Subir originales"
      description="Elige los archivos de esta sección generados desde el PDF (cada entrada tiene su .md y su .pdf, con la clave como nombre). Cada uno sustituye al que hubiera. Los verán todas las campañas de este mundo."
      maxWidth={560}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} disabled={enCurso} onClick={onClose}>{terminado ? 'Cerrar' : 'Cancelar'}</Button>
          {!terminado && (
            <Button size="lg" style={{ flex: 2 }} icon={<Upload size={16} aria-hidden />} disabled={enCurso || validos.length === 0} loading={enCurso} onClick={subir}>
              Subir {validos.length || ''} archivo{validos.length === 1 ? '' : 's'}
            </Button>
          )}
        </>
      }
    >
      <div style={stack(14)}>
        <label className="ui-btn ui-btn--secondary" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 40, padding: '0 14px', borderRadius: radius.md, cursor: 'pointer', fontWeight: 650, fontSize: fs.sm }}>
          <FileUp size={16} aria-hidden /> Elegir archivos .md y .pdf
          <input type="file" accept=".md,.pdf,text/markdown,text/plain,application/pdf" multiple className="sr-only" onChange={(ev) => elegir(ev.target.files)} disabled={enCurso} />
        </label>
        {archivos.length > 0 && (
          <ul aria-label="Archivos elegidos" style={{ ...listReset, ...stack(6) }}>
            {archivos.map((a) => {
              const est = estados[a.nombre]
              const mal = !!a.error || est === 'fallo'
              return (
                <li key={a.nombre} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: radius.md, background: c.s1, border: `1px solid ${mal ? tone.rubi.border : c.border}` }}>
                  <span aria-hidden style={{ color: mal ? tone.rubi.fg : est === 'subido' ? tone.esmeralda.fg : c.subtle, paddingTop: 2 }}>
                    {mal ? <X size={16} /> : <Check size={16} />}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 650, color: c.text, fontSize: fs.sm + 1 }}>
                      {a.entrada ? `${a.entrada.titulo} · ${a.tipo === 'pdf' ? 'PDF' : 'texto'}` : a.nombre}
                    </p>
                    <p style={{ fontSize: fs.xs, color: mal ? tone.rubi.fg : c.subtle }}>
                      {a.error
                        ?? (est === 'fallo' ? 'No se pudo subir: vuelve a intentarlo.'
                          : est === 'subido' ? 'Subido.'
                            : est === 'subiendo' ? 'Subiendo…'
                              : `${a.nombre} · ${a.pdf ? peso(a.pdf.size) : `${Math.round((a.md?.length ?? 0) / 1024)} KB de texto`}`)}
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

// ── Director: remove ──

/** Removes every uploaded text and PDF of the section, after confirmation */
function QuitarOriginales({ abierto, o, seccion, onCerrar }: { abierto: boolean; o: EstadoOriginales; seccion: SeccionOriginales; onCerrar: () => void }) {
  const qc = useQueryClient()
  const [quitando, setQuitando] = useState(false)
  const [fallo, setFallo] = useState(false)
  const quitar = async () => {
    if (o.cId == null) return
    setQuitando(true)
    setFallo(false)
    try {
      for (const e of o.entradas) {
        const s = o.subido(e.clave)
        if (s?.textLength != null) await encyclopediaApi.removeText(o.cId, seccion, e.clave)
        if (s?.pdfBytes != null) await encyclopediaApi.removePdf(o.cId, seccion, e.clave)
      }
      onCerrar()
    } catch {
      setFallo(true)
    } finally {
      await qc.invalidateQueries({ queryKey: claveListaOriginales(o.cId) })
      qc.removeQueries({ queryKey: ['encyclopedia-original-text', o.cId, seccion] })
      setQuitando(false)
    }
  }
  return (
    <ConfirmDialog
      open={abierto}
      title="Quitar los originales de esta sección"
      message={
        <>
          Se quitarán los textos y los PDF subidos de esta sección para todas las campañas de este mundo. Podrás volver a subirlos desde
          los archivos generados.{fallo && <strong style={{ display: 'block', marginTop: 8, color: tone.rubi.fg }}>No se pudieron quitar todos. Vuelve a intentarlo.</strong>}
        </>
      }
      confirmLabel="Quitar"
      loading={quitando}
      onConfirm={quitar}
      onCancel={onCerrar}
    />
  )
}
