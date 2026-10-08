import { useState, type CSSProperties, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Check, Pencil, Plus, Target, Trash2 } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { metasApi } from '../../api/metas'
import { CHAPTERS, type AdventureChapter } from '../../data/caminapiedras'
import { useWorldConfig } from '../../store/campaignStore'
import { Button, ConfirmDialog, Disclosure, EmptyState, ErrorMessage, Field, IconButton, Input, Segmented, Sheet, Textarea } from '../../components/ui'
import { c, eyebrow, font, fs, numeral, pill, radius, shadow, tone } from '../../theme'
import type { Character, Meta } from '../../types'
import { useAlternarMarca, usePantalla } from './contexto'
import { anotar, claveAventura, nuevoId, type EstadoTrama, type Trama } from './estado'
import { TRAMA_META } from './meta'
import { FilaMarca } from './piezas'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }
const titulo2: CSSProperties = { fontFamily: font.display, fontVariantCaps: 'all-small-caps', fontSize: fs.lg + 1, fontWeight: 600, letterSpacing: '0.05em', color: c.text }
const TOTAL_HITOS = 3

export function PanelAvances() {
  const cfg = useWorldConfig()
  const conAventura = cfg.features.pestanaAventura && CHAPTERS.length > 0
  return (
    <div style={stack(24)}>
      {conAventura && <AvanceAventura />}
      <Tramas />
      <MetasDelGrupo />
    </div>
  )
}

// ── Book adventure ───────────────────────────────────────────────────────────

/** Every markable item of a chapter: checklist, progression, scenes and combats */
const itemsDe = (cap: AdventureChapter) => [
  ...cap.prepChecklist.map((_, i) => claveAventura(cap.id, 'lista', i)),
  ...cap.progressionItems.map((_, i) => claveAventura(cap.id, 'progresion', i)),
  ...cap.scenes.map((s) => claveAventura(cap.id, 'escena', s.id)),
  ...cap.combats.map((cb) => claveAventura(cap.id, 'combate', cb.id)),
]

function AvanceAventura() {
  const { estado } = usePantalla()
  const alternar = useAlternarMarca()
  const capActual = estado.escenaActual?.capituloId ?? null

  return (
    <section aria-labelledby="avances-aventura" style={stack(10)}>
      <h2 id="avances-aventura" style={titulo2}>Aventura</h2>
      <ul style={{ ...listReset, ...stack(8) }}>
        {CHAPTERS.map((cap) => {
          const claves = itemsDe(cap)
          const hechos = claves.filter((k) => estado.marcas[k]).length
          const pct = claves.length ? Math.round((hechos / claves.length) * 100) : 0
          const fila = (clave: string, texto: string, etiqueta: string, extra?: ReactNode) => (
            <li key={clave}>
              <FilaMarca marcada={!!estado.marcas[clave]} onCambiar={() => alternar(clave, texto, etiqueta)} extra={extra}>{texto}</FilaMarca>
            </li>
          )
          return (
            <li key={cap.id}>
              <Disclosure
                headingLevel={3}
                defaultOpen={cap.id === capActual}
                accent={tone.gold.fg}
                title={`Capítulo ${cap.number} · ${cap.title}`}
                summary={
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
                    <span aria-hidden style={{ flex: 1, maxWidth: 220, height: 6, borderRadius: 6, background: c.track, overflow: 'hidden' }}>
                      <span style={{ display: 'block', width: `${pct}%`, height: '100%', background: pct === 100 ? tone.esmeralda.fg : tone.gold.fg }} />
                    </span>
                    <span style={{ ...numeral, fontSize: fs.sm, color: c.muted }}>{hechos}/{claves.length}</span>
                  </span>
                }
              >
                <div style={stack(14)}>
                  <Grupo titulo="Lista de verificación DJ">
                    {cap.prepChecklist.map((t, i) => fila(claveAventura(cap.id, 'lista', i), t, 'Avance'))}
                  </Grupo>
                  <Grupo titulo="Progresión de personajes">
                    {cap.progressionItems.map((p, i) => fila(claveAventura(cap.id, 'progresion', i), p.text, 'Progresión'))}
                  </Grupo>
                  <Grupo titulo="Escenas jugadas">
                    {cap.scenes.map((s) => fila(claveAventura(cap.id, 'escena', s.id), s.title, 'Escena jugada'))}
                  </Grupo>
                  {cap.combats.length > 0 && (
                    <Grupo titulo="Combates superados">
                      {cap.combats.map((cb) => fila(claveAventura(cap.id, 'combate', cb.id), cb.title, 'Combate superado'))}
                    </Grupo>
                  )}
                </div>
              </Disclosure>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section style={stack(6)}>
      <h4 style={eyebrow}>{titulo}</h4>
      <ul style={{ ...listReset, ...stack(6) }}>{children}</ul>
    </section>
  )
}

// ── Plot threads ─────────────────────────────────────────────────────────────

const ORDEN_TRAMA: Record<EstadoTrama, number> = { 'en-curso': 0, abierta: 1, resuelta: 2 }

function Tramas() {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  const [editando, setEditando] = useState<Trama | 'nueva' | null>(null)
  const [borrando, setBorrando] = useState<Trama | null>(null)
  const tramas = [...estado.tramas].sort((a, b) => ORDEN_TRAMA[a.estado] - ORDEN_TRAMA[b.estado])

  const cambiarEstado = (t: Trama, nuevo: EstadoTrama) =>
    actualizar((b) => {
      const x = b.tramas.find((y) => y.id === t.id)
      if (!x || x.estado === nuevo) return
      x.estado = nuevo
      anotar(b, { tipo: 'trama', etiqueta: `Trama ${TRAMA_META[nuevo].label.toLowerCase()}`, texto: x.titulo }, ultimoDiario)
    })

  return (
    <section aria-labelledby="avances-tramas" style={stack(10)}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <h2 id="avances-tramas" style={{ ...titulo2, flex: 1 }}>Tramas</h2>
        <Button size="sm" icon={<Plus size={15} aria-hidden />} onClick={() => setEditando('nueva')}>Nueva trama</Button>
      </div>
      {tramas.length === 0 ? (
        <p style={{ fontSize: fs.sm, color: c.muted }}>Los hilos de vuestra historia: misterios abiertos, promesas, enemigos pendientes.</p>
      ) : (
        <ul style={{ ...listReset, ...stack(8) }}>
          {tramas.map((t) => {
            const meta = TRAMA_META[t.estado]
            return (
              <li key={t.id} style={{ ...stack(8), padding: 12, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: `inset 3px 0 0 ${meta.tone.fg}, ${shadow[1]}`, opacity: t.estado === 'resuelta' ? 0.75 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text, lineHeight: 1.25 }}>{t.titulo}</h3>
                    {t.detalle && <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5, marginTop: 2, whiteSpace: 'pre-line' }}>{t.detalle}</p>}
                  </div>
                  <IconButton label={`Editar la trama ${t.titulo}`} size={36} onClick={() => setEditando(t)}><Pencil size={15} aria-hidden /></IconButton>
                  <IconButton label={`Eliminar la trama ${t.titulo}`} variant="danger" size={36} onClick={() => setBorrando(t)}><Trash2 size={15} aria-hidden /></IconButton>
                </div>
                <Segmented<EstadoTrama>
                  ariaLabel={`Estado de ${t.titulo}`}
                  size="sm"
                  tone={t.estado === 'resuelta' ? 'esmeralda' : t.estado === 'en-curso' ? 'topacio' : 'zafiro'}
                  value={t.estado}
                  onChange={(v) => cambiarEstado(t, v)}
                  options={(Object.keys(TRAMA_META) as EstadoTrama[]).map((k) => ({ value: k, label: TRAMA_META[k].label }))}
                />
              </li>
            )
          })}
        </ul>
      )}
      {editando && <HojaTrama trama={editando === 'nueva' ? null : editando} onClose={() => setEditando(null)} />}
      <ConfirmDialog
        open={!!borrando}
        title={`¿Eliminar la trama «${borrando?.titulo ?? ''}»?`}
        message="Esta acción no se puede deshacer."
        onConfirm={() => {
          const id = borrando?.id
          actualizar((b) => { b.tramas = b.tramas.filter((x) => x.id !== id) })
          setBorrando(null)
        }}
        onCancel={() => setBorrando(null)}
      />
    </section>
  )
}

function HojaTrama({ trama, onClose }: { trama: Trama | null; onClose: () => void }) {
  const { actualizar, ultimoDiario } = usePantalla()
  const [titulo, setTitulo] = useState(trama?.titulo ?? '')
  const [detalle, setDetalle] = useState(trama?.detalle ?? '')
  const guardar = () => {
    actualizar((b) => {
      const x = trama ? b.tramas.find((y) => y.id === trama.id) : null
      if (x) {
        x.titulo = titulo.trim()
        x.detalle = detalle.trim()
      } else {
        b.tramas.push({ id: nuevoId(), titulo: titulo.trim(), detalle: detalle.trim(), estado: 'abierta' })
        anotar(b, { tipo: 'trama', etiqueta: 'Trama abierta', texto: titulo.trim() }, ultimoDiario)
      }
    })
    onClose()
  }
  return (
    <Sheet
      open
      onClose={onClose}
      title={trama ? 'Editar trama' : 'Nueva trama'}
      maxWidth={520}
      footer={
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} disabled={!titulo.trim()} onClick={guardar}>Guardar</Button>
        </>
      }
    >
      <div style={stack(14)}>
        <Field label="Título">
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="¿Quién envió la carta sin firma?" data-autofocus />
        </Field>
        <Field label="Detalle">
          <Textarea rows={4} value={detalle} onChange={(e) => setDetalle(e.target.value)} />
        </Field>
      </div>
    </Sheet>
  )
}

// ── Goals of the characters (existing metas API) ─────────────────────────────

function MetasDelGrupo() {
  const { cId, anotar: anotarEvento } = usePantalla()
  const qc = useQueryClient()
  const { data: personajes = [], isLoading } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId) })

  const mut = useMutation({
    mutationFn: ({ ch, meta, hitos }: { ch: Character; meta: Meta; hitos: number }) =>
      metasApi.update(cId, ch.id, meta.id, { titulo: meta.titulo, descripcion: meta.descripcion, hitos }),
    onSuccess: (_r, { ch, meta, hitos }) => {
      if (hitos > meta.hitos) anotarEvento({ tipo: 'meta', etiqueta: 'Meta', texto: `${ch.name}: ${meta.titulo} (${hitos}/${TOTAL_HITOS})` })
      return Promise.all([
        qc.invalidateQueries({ queryKey: ['characters', cId] }),
        qc.invalidateQueries({ queryKey: ['character', cId, ch.id] }),
        qc.invalidateQueries({ queryKey: ['metas', cId, ch.id] }),
      ])
    },
  })

  const conMetas = personajes.filter((ch) => ch.metas?.some((m) => m.estado === 'activa'))

  return (
    <section aria-labelledby="avances-metas" style={stack(10)}>
      <h2 id="avances-metas" style={titulo2}>Metas de los personajes</h2>
      {mut.isError && <ErrorMessage message="No se pudo guardar el hito. Inténtalo de nuevo." />}
      {isLoading ? null : conMetas.length === 0 ? (
        <EmptyState icon={<Target size={22} aria-hidden />} title="Sin metas activas" description="Las metas de los personajes aparecen aquí para marcar sus hitos durante la partida." style={{ padding: '24px 16px' }} />
      ) : (
        <ul style={{ ...listReset, ...stack(10) }}>
          {conMetas.map((ch) => (
            <li key={ch.id} style={{ ...stack(8), padding: 12, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }}>
              <h3 style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, color: c.text }}>{ch.name}</h3>
              <ul style={{ ...listReset, ...stack(8) }}>
                {ch.metas.filter((m) => m.estado === 'activa').map((m) => (
                  <li key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ flex: '1 1 180px', minWidth: 0, fontSize: fs.sm + 1, color: c.text, lineHeight: 1.45 }}>
                      {m.titulo}
                      {m.hitos >= TOTAL_HITOS && <span style={{ ...pill(tone.esmeralda), marginLeft: 8 }}>Lista para concluir</span>}
                    </span>
                    <Hitos
                      hitos={m.hitos}
                      ocupado={mut.isPending}
                      etiqueta={`${ch.name}: ${m.titulo}`}
                      onChange={(n) => mut.mutate({ ch, meta: m, hitos: n })}
                    />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** Three milestone buttons (0-3), like the goals page */
function Hitos({ hitos, onChange, etiqueta, ocupado }: { hitos: number; onChange: (n: number) => void; etiqueta: string; ocupado: boolean }) {
  return (
    <div role="group" aria-label={`Hitos de ${etiqueta}: ${hitos} de ${TOTAL_HITOS}`} style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3].map((n) => {
        const hecho = hitos >= n
        return (
          <IconButton
            key={n}
            label={`Hito ${n} de ${TOTAL_HITOS}, ${hecho ? 'completado' : 'pendiente'}`}
            size={44}
            disabled={ocupado}
            onClick={() => onChange(hitos >= n ? n - 1 : n)}
            style={{ borderRadius: radius.full }}
          >
            <span
              aria-hidden
              style={{
                width: 30, height: 30, borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                background: hecho ? c.brandFill : c.s2, border: `1.5px solid ${hecho ? c.brandFill : c.borderStrong}`,
                color: hecho ? c.onBrand : c.muted, ...numeral, fontSize: fs.sm,
              }}
            >
              {hecho ? <Check size={16} strokeWidth={3} /> : n}
            </span>
          </IconButton>
        )
      })}
    </div>
  )
}
