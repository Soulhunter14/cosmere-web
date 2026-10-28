/**
 * What a character has answered, as the director reads it: one row per step of the guided creation (the step's title or the legacy's
 * question, and the answer) and the decisions the table took in the director's script, by table session and scene, each with what it
 * gave to the sheet (the record the API keeps, `RespuestaPersonaje`). Shared by the director's view of «Creación» and the director's
 * screen (the creation session).
 */
import type { CSSProperties } from 'react'
import { Check } from 'lucide-react'
import { c, eyebrow, fs, pill, radius, tone, type Tone } from '../../theme'
import type { CreacionPersonaje, RespuestaPersonaje } from '../../types'
import type { PasoCreacion } from '../../worlds/types'
import { etiquetaDato, useLegados, useOpcionesPaso } from './hooks'
import { pasoAplica } from './pasos'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

/** Every step of the character, as rows of a `<dl>` */
export function FilasRespuestas({ pasos, p }: { pasos: PasoCreacion[]; p: CreacionPersonaje }) {
  return <>{pasos.map((paso) => <FilaRespuesta key={paso.id} paso={paso} p={p} />)}</>
}

/** One step of a character as the director reads it: the title (or the legacy's question) and the answer */
export function FilaRespuesta({ paso, p }: { paso: PasoCreacion; p: CreacionPersonaje }) {
  const legados = useLegados()
  const opciones = useOpcionesPaso(paso)
  const def = legados.find((l) => l.id === p.legado)
  let etiqueta: string = paso.titulo
  let valor = ''
  if (paso.id === 'name') valor = p.name
  else if (paso.id === 'legado') valor = def?.nombre ?? p.legado
  else if (paso.id === 'ascendencia') valor = p.ascendencia
  else if ('indice' in paso) {
    etiqueta = def?.preguntas[paso.indice] ?? paso.titulo
    valor = p.legadoRespuestas[paso.indice] ?? ''
  } else if ('clave' in paso) {
    valor = etiquetaDato(opciones, p.creacionDatos[paso.clave] ?? '')
  }
  const noAplica = pasoAplica(paso, p) === 'no'
  return (
    <div>
      <dt style={{ fontSize: fs.xs, color: c.muted, lineHeight: 1.4 }}>{etiqueta}</dt>
      <dd style={{ margin: 0, fontSize: fs.sm, color: valor ? c.text : c.subtle, fontStyle: valor ? 'normal' : 'italic', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
        {valor || (noAplica ? 'No aplica' : 'Sin responder')}
      </dd>
    </div>
  )
}

// ── The decisions of the table ───────────────────────────────────────────────

function agrupar<T>(lista: T[], clave: (x: T) => string): [string, T[]][] {
  const out = new Map<string, T[]>()
  for (const x of lista) {
    const k = clave(x)
    const l = out.get(k)
    if (l) l.push(x)
    else out.set(k, [x])
  }
  return [...out.entries()]
}

const texto = (v: unknown): string => (typeof v === 'string' ? v : '')

/** The label and tone of each kind of effect, as the screen's record paints them */
const EFECTO: Record<string, { etiqueta: string; t: Tone }> = {
  atributo: { etiqueta: 'Atributo', t: tone.gold },
  habilidad: { etiqueta: 'Habilidad', t: tone.zafiro },
  pericia: { etiqueta: 'Pericia', t: tone.esmeralda },
  meta: { etiqueta: 'Meta', t: tone.heliodoro },
  objeto: { etiqueta: 'Objeto', t: tone.cuarzo },
  camino: { etiqueta: 'Camino', t: tone.amatista },
  metal: { etiqueta: 'Metal', t: tone.amatista },
  eco: { etiqueta: 'Eco', t: tone.cuarzo },
}

/** The effects of a decision as the script wrote them (`detalle.efectos`: clave + valor) */
function efectosDe(d: Record<string, unknown>): { clave: string; valor: string }[] {
  if (!Array.isArray(d.efectos)) return []
  return (d.efectos as unknown[]).flatMap((e) => {
    if (!e || typeof e !== 'object') return []
    const clave = texto((e as { clave?: unknown }).clave)
    const valor = texto((e as { valor?: unknown }).valor)
    return clave && valor ? [{ clave, valor }] : []
  })
}

/** What the table decided for this character in the director's script, by table session and scene (only the director sees it) */
export function DecisionesMesa({ respuestas }: { respuestas: RespuestaPersonaje[] }) {
  const decisiones = respuestas.filter((r) => r.tipoPregunta === 'decision')
  if (decisiones.length === 0) return null
  const sesiones = agrupar(decisiones, (r) => r.sesionTitulo || (r.origen === 'sesion-creacion' ? 'Sesión de creación' : 'Sesión'))
  return (
    <div style={{ ...stack(12), paddingTop: 12, borderTop: `1px solid ${c.border}` }}>
      <p style={eyebrow}>Decisiones de la mesa</p>
      {sesiones.map(([titulo, lista]) => (
        <div key={titulo} style={stack(10)}>
          <p style={{ fontSize: fs.base, color: c.text, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {titulo}
            {lista[0].origen !== 'sesion-creacion' && <span style={pill(tone.cuarzo)}>Fuera de la sesión de creación</span>}
          </p>
          {agrupar(lista, (r) => [texto(r.detalle.grupo), texto(r.detalle.escena)].filter(Boolean).join(' · ')).map(([escena, filas]) => (
            <section key={escena} aria-label={escena || 'Escena'} style={{ ...stack(10), padding: '12px 14px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}` }}>
              {escena && <p style={{ ...eyebrow, color: tone.topacio.fg }}>{escena}</p>}
              {filas.map((r, i) => {
                const efectos = efectosDe(r.detalle)
                const prueba = texto(r.detalle.prueba)
                const resultado = r.detalle.resultado
                return (
                  <div key={r.id} style={{ ...stack(6), paddingTop: i === 0 ? 0 : 10, borderTop: i === 0 ? 'none' : `1px solid ${c.border}` }}>
                    <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.4 }}>{r.pregunta}</p>
                    <p style={{ fontSize: fs.base, color: c.text, fontWeight: 600, lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>{r.respuesta}</p>
                    {(efectos.length > 0 || prueba || r.aplicadaEn) && (
                      <p style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {efectos.map((e, j) => {
                          const def = EFECTO[e.clave] ?? { etiqueta: e.clave, t: tone.cuarzo }
                          return <span key={j} style={pill(def.t)}>{def.etiqueta} {e.valor}</span>
                        })}
                        {prueba && (
                          <span style={pill(resultado === 'exito' ? tone.esmeralda : resultado === 'fallo' ? tone.rubi : tone.cuarzo)}>
                            Prueba {prueba}: {resultado === 'exito' ? 'superada' : resultado === 'fallo' ? 'fallada' : 'sin marcar'}
                          </span>
                        )}
                        {r.aplicadaEn && <span style={pill(tone.esmeralda)}><Check size={12} aria-hidden /> En la ficha</span>}
                      </p>
                    )}
                  </div>
                )
              })}
            </section>
          ))}
        </div>
      ))}
    </div>
  )
}
