import { useState, type CSSProperties } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Copy, Download, NotebookPen, Pencil, Play, Square, Trash2 } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import { Button, ConfirmDialog, Disclosure, EmptyState, Field, IconButton, Input, Sheet, Stepper, Textarea } from '../../components/ui'
import { c, eyebrow, font, fs, numeral, pill, radius, shadow } from '../../theme'
import { duracion, useAhora, usePantalla } from './contexto'
import { anotar, nuevaSesion, numeroSiguiente, terminarSesion, type EventoBitacora, type SesionMesa } from './estado'
import { copiarTexto, descargarTexto, hora, fecha, nombreArchivoSesion, notasMarkdown, promptCronica, tituloSesion } from './exportar'
import { nombreBase } from './encuentro'
import { ETIQUETAS_APUNTE, EVENTO_META } from './meta'
import { Tesela } from './piezas'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }
const tarjeta: CSSProperties = { padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }

type Etiqueta = (typeof ETIQUETAS_APUNTE)[number]

export function PanelBitacora() {
  const { cId, estado, actualizar, ultimoDiario } = usePantalla()
  const cfg = useWorldConfig()
  const campana = useCampaignStore((s) => s.currentCampaign)
  const ahora = useAhora()
  const { data: personajes = [] } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId) })

  const [numeroElegido, setNumeroElegido] = useState<number | null>(null)
  const [tituloNuevo, setTituloNuevo] = useState('')
  const [texto, setTexto] = useState('')
  const [etiqueta, setEtiqueta] = useState<Etiqueta>('Apunte')
  const [terminando, setTerminando] = useState(false)
  const [editando, setEditando] = useState(false)
  const [borrandoEvento, setBorrandoEvento] = useState<EventoBitacora | null>(null)
  const [borrandoSesion, setBorrandoSesion] = useState<SesionMesa | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)

  const sesion = estado.sesion
  const sugerido = numeroSiguiente(estado, ultimoDiario)
  const numero = numeroElegido ?? sugerido

  const empezar = () => {
    actualizar((b) => { b.sesion = nuevaSesion(numero, tituloNuevo.trim()) })
    setNumeroElegido(null)
    setTituloNuevo('')
  }

  const anotarApunte = () => {
    const t = texto.trim()
    if (!t) return
    actualizar((b) => anotar(b, { tipo: 'apunte', etiqueta, texto: t }, ultimoDiario))
    setTexto('')
  }

  const exportar = async (s: SesionMesa, como: 'prompt' | 'md') => {
    const mundo = cfg.nombre
    const nombreCampana = campana?.name ?? 'Campaña'
    if (como === 'md') {
      descargarTexto(nombreArchivoSesion(s), notasMarkdown(s, nombreCampana, mundo))
      return
    }
    const pnjs = [...new Set(estado.encuentros.flatMap((e) => e.combatientes).filter((x) => x.bando === 'pnj' && x.adversarioId !== null).map((x) => nombreBase(x.nombre.replace(/\s+\d+$/, ''))))]
    const ok = await copiarTexto(promptCronica(s, { campana: nombreCampana, mundo, pjs: personajes.map((p) => p.name), pnjs }))
    setAviso(ok ? 'Prompt copiado: pégalo en tu IA y sube la crónica en Partida → Diario.' : 'No se pudo copiar. Descarga las notas en su lugar.')
  }

  return (
    <div style={stack(18)}>
      {/* ── Session ── */}
      {sesion ? (
        <section aria-label="Sesión de juego" style={{ ...tarjeta, ...stack(10) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ ...eyebrow, color: 'var(--gold)' }}>Sesión en curso</p>
              <h2 style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, color: c.text, lineHeight: 1.2 }}>{tituloSesion(sesion)}</h2>
              <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2 }}>
                Desde las {hora(sesion.iniciadaEn)} · {duracion(sesion.iniciadaEn, ahora)} · {sesion.eventos.length} anotacion{sesion.eventos.length === 1 ? '' : 'es'}
              </p>
            </div>
            <IconButton label="Cambiar número o título de la sesión" variant="surface" size={40} onClick={() => setEditando(true)}>
              <Pencil size={16} aria-hidden />
            </IconButton>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button size="sm" variant="secondary" icon={<Copy size={15} aria-hidden />} onClick={() => exportar(sesion, 'prompt')}>Copiar prompt de crónica</Button>
            <Button size="sm" variant="secondary" icon={<Download size={15} aria-hidden />} onClick={() => exportar(sesion, 'md')}>Descargar notas</Button>
            <Button size="sm" variant="ghost" icon={<Square size={14} aria-hidden />} onClick={() => setTerminando(true)} style={{ marginLeft: 'auto' }}>Terminar sesión</Button>
          </div>
        </section>
      ) : (
        <section aria-label="Empezar sesión" style={{ ...tarjeta, ...stack(12) }}>
          <div>
            <h2 style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, color: c.text }}>Sesión de juego</h2>
            <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 2 }}>
              Agrupa los apuntes y eventos de la partida de hoy. El número es el de la crónica del diario.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <span style={{ ...eyebrow, display: 'block', marginBottom: 8 }}>Número</span>
              <Stepper label="Número de sesión" size="sm" value={numero} min={1} max={999} onChange={setNumeroElegido} />
            </div>
            <Field label="Título (opcional)" style={{ flex: '1 1 200px' }}>
              <Input value={tituloNuevo} onChange={(e) => setTituloNuevo(e.target.value)} placeholder="La fortaleza Hasting" />
            </Field>
            <Button icon={<Play size={16} aria-hidden />} onClick={empezar}>Empezar sesión</Button>
          </div>
        </section>
      )}

      {/* Always in the DOM (a live region must exist before it changes); out of the flow while empty */}
      <p role="status" className={aviso ? undefined : 'sr-only'} style={{ fontSize: fs.sm, color: c.muted }}>{aviso}</p>

      {/* ── Quick note ── */}
      <section aria-labelledby="bitacora-apunte" style={stack(8)}>
        <h2 id="bitacora-apunte" style={{ ...eyebrow }}>Apunte rápido</h2>
        <div role="group" aria-label="Etiqueta del apunte" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {ETIQUETAS_APUNTE.map((e) => (
            <button
              key={e}
              type="button"
              aria-pressed={e === etiqueta}
              onClick={() => setEtiqueta(e)}
              className="ui-btn"
              style={{
                minHeight: 34, padding: '0 12px', borderRadius: radius.full, cursor: 'pointer', fontSize: fs.sm, fontWeight: e === etiqueta ? 700 : 550,
                background: e === etiqueta ? 'var(--gold-bg)' : c.s2, border: `1px solid ${e === etiqueta ? 'var(--gold-border)' : c.border}`,
                color: e === etiqueta ? 'var(--gold)' : c.muted,
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <Textarea
          aria-label="Texto del apunte"
          rows={3}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); anotarApunte() } }}
          placeholder="Lo que ha pasado, una pista, una decisión del grupo…"
        />
        <Button icon={<NotebookPen size={16} aria-hidden />} onClick={anotarApunte} disabled={!texto.trim()} style={{ alignSelf: 'flex-end' }}>
          Anotar
        </Button>
      </section>

      {/* ── Timeline of the open session ── */}
      {sesion && (
        sesion.eventos.length === 0 ? (
          <p style={{ fontSize: fs.sm, color: c.subtle }}>Aún no hay anotaciones en esta sesión.</p>
        ) : (
          <ListaEventos eventos={sesion.eventos} onBorrar={setBorrandoEvento} />
        )
      )}

      {/* ── Closed sessions ── */}
      <section aria-labelledby="bitacora-historial" style={stack(8)}>
        <h2 id="bitacora-historial" style={{ fontFamily: font.display, fontVariantCaps: 'all-small-caps', fontSize: fs.lg + 1, fontWeight: 600, letterSpacing: '0.05em', color: c.text }}>
          Sesiones anteriores
        </h2>
        {estado.historial.length === 0 ? (
          <EmptyState title="Ninguna todavía" description="Al terminar una sesión se guarda aquí con sus anotaciones." style={{ padding: '24px 16px' }} />
        ) : (
          <ul style={{ ...listReset, ...stack(8) }}>
            {estado.historial.map((s) => (
              <li key={s.id}>
                <Disclosure
                  headingLevel={3}
                  title={tituloSesion(s)}
                  summary={`${fecha(s.iniciadaEn)} · ${s.eventos.length} anotacion${s.eventos.length === 1 ? '' : 'es'}`}
                >
                  <div style={stack(12)}>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <Button size="sm" variant="secondary" icon={<Copy size={15} aria-hidden />} onClick={() => exportar(s, 'prompt')}>Copiar prompt de crónica</Button>
                      <Button size="sm" variant="secondary" icon={<Download size={15} aria-hidden />} onClick={() => exportar(s, 'md')}>Descargar notas</Button>
                      <Button size="sm" variant="danger" icon={<Trash2 size={15} aria-hidden />} onClick={() => setBorrandoSesion(s)} style={{ marginLeft: 'auto' }}>Eliminar</Button>
                    </div>
                    {s.eventos.length > 0 && <ListaEventos eventos={s.eventos} />}
                  </div>
                </Disclosure>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editando && sesion && <HojaSesion sesion={sesion} onClose={() => setEditando(false)} />}
      <ConfirmDialog
        open={terminando}
        tone="brand"
        icon="warning"
        title="¿Terminar la sesión?"
        message="Se guarda en «Sesiones anteriores» con sus anotaciones; desde allí puedes copiar el prompt de la crónica."
        confirmLabel="Terminar sesión"
        onConfirm={() => { actualizar((b) => terminarSesion(b)); setTerminando(false); setAviso(null) }}
        onCancel={() => setTerminando(false)}
      />
      <ConfirmDialog
        open={!!borrandoEvento}
        title="¿Eliminar la anotación?"
        message={borrandoEvento?.texto}
        onConfirm={() => {
          const id = borrandoEvento?.id
          actualizar((b) => { if (b.sesion) b.sesion.eventos = b.sesion.eventos.filter((e) => e.id !== id) })
          setBorrandoEvento(null)
        }}
        onCancel={() => setBorrandoEvento(null)}
      />
      <ConfirmDialog
        open={!!borrandoSesion}
        title={`¿Eliminar ${borrandoSesion ? tituloSesion(borrandoSesion) : 'la sesión'}?`}
        message="Se borran sus anotaciones de la pantalla. La crónica del diario, si existe, no cambia."
        onConfirm={() => {
          const id = borrandoSesion?.id
          actualizar((b) => { b.historial = b.historial.filter((s) => s.id !== id) })
          setBorrandoSesion(null)
        }}
        onCancel={() => setBorrandoSesion(null)}
      />
    </div>
  )
}

function ListaEventos({ eventos, onBorrar }: { eventos: EventoBitacora[]; onBorrar?: (e: EventoBitacora) => void }) {
  return (
    <ol aria-label="Anotaciones" style={{ ...listReset, ...stack(6) }}>
      {[...eventos].reverse().map((e) => {
        const meta = EVENTO_META[e.tipo]
        const Icon = meta.icon
        return (
          <li key={e.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px', borderRadius: radius.md, background: c.s1, border: `1px solid ${c.border}` }}>
            <time dateTime={e.en} style={{ ...numeral, fontSize: fs.sm, fontWeight: 600, color: c.subtle, minWidth: 42, paddingTop: 7 }}>{hora(e.en)}</time>
            <Tesela t={meta.tone} tam={30}><Icon size={15} /></Tesela>
            <div style={{ flex: 1, minWidth: 0, paddingTop: 4 }}>
              {e.etiqueta && <span style={{ ...pill(meta.tone), marginRight: 6, verticalAlign: '1px' }}>{e.etiqueta}</span>}
              <span style={{ fontSize: fs.sm + 1, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-line' }}>{e.texto}</span>
            </div>
            {onBorrar && (
              <IconButton label="Eliminar la anotación" variant="danger" size={36} onClick={() => onBorrar(e)}>
                <Trash2 size={15} aria-hidden />
              </IconButton>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function HojaSesion({ sesion, onClose }: { sesion: SesionMesa; onClose: () => void }) {
  const { actualizar } = usePantalla()
  const [numero, setNumero] = useState(sesion.numero ?? 1)
  const [titulo, setTitulo] = useState(sesion.titulo)
  const guardar = () => {
    actualizar((b) => { if (b.sesion) { b.sesion.numero = numero; b.sesion.titulo = titulo.trim() } })
    onClose()
  }
  return (
    <Sheet
      open
      onClose={onClose}
      title="Sesión de juego"
      maxWidth={440}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} onClick={guardar}>Guardar</Button>
        </>
      }
    >
      <div style={stack(14)}>
        <div>
          <span style={{ ...eyebrow, display: 'block', marginBottom: 8 }}>Número (el de la crónica)</span>
          <Stepper label="Número de sesión" value={numero} min={1} max={999} onChange={setNumero} />
        </div>
        <Field label="Título">
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </Field>
      </div>
    </Sheet>
  )
}
