/**
 * What a character has answered, as the director reads it: one row per step of the guided creation (the step's title or the legacy's
 * question, and the answer) and the decisions the table took in the director's script, by table session and scene (the record the API
 * keeps, `RespuestaPersonaje`). Shared by the director's view of «Creación» and the director's screen (the creation session).
 */
import type { CSSProperties } from 'react'
import { c, eyebrow, fs, pill, tone } from '../../theme'
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
const capitalizar = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/** «Atributo +1 Fuerza · Camino Guerrero · Prueba Atletismo CD 10: superada», from the detail of a decision */
function resumenDetalle(d: Record<string, unknown>): string {
  const partes: string[] = []
  if (Array.isArray(d.efectos)) {
    for (const e of d.efectos as unknown[]) {
      if (e && typeof e === 'object' && 'clave' in e && 'valor' in e) {
        partes.push(`${capitalizar(texto((e as { clave: unknown }).clave))} ${texto((e as { valor: unknown }).valor)}`.trim())
      }
    }
  }
  const prueba = texto(d.prueba)
  if (prueba) partes.push(`Prueba ${prueba}${d.resultado === 'exito' ? ': superada' : d.resultado === 'fallo' ? ': fallada' : ''}`)
  return partes.join(' · ')
}

/** What the table decided for this character in the director's script, by table session and scene (only the director sees it) */
export function DecisionesMesa({ respuestas }: { respuestas: RespuestaPersonaje[] }) {
  const decisiones = respuestas.filter((r) => r.tipoPregunta === 'decision')
  if (decisiones.length === 0) return null
  const sesiones = agrupar(decisiones, (r) => r.sesionTitulo || (r.origen === 'sesion-creacion' ? 'Sesión de creación' : 'Sesión'))
  return (
    <div style={{ ...stack(10), paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
      <p style={eyebrow}>Decisiones de la mesa</p>
      {sesiones.map(([titulo, lista]) => (
        <div key={titulo} style={stack(8)}>
          <p style={{ fontSize: fs.sm, color: c.text, fontWeight: 600, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            {titulo}
            {lista[0].origen !== 'sesion-creacion' && <span style={pill(tone.cuarzo)}>Fuera de la sesión de creación</span>}
          </p>
          {agrupar(lista, (r) => [texto(r.detalle.grupo), texto(r.detalle.escena)].filter(Boolean).join(' · ')).map(([escena, filas]) => (
            <div key={escena} style={{ ...stack(6), paddingLeft: 10, borderLeft: `2px solid ${c.border}` }}>
              {escena && <p style={{ fontSize: fs.xs, color: c.muted, fontWeight: 600 }}>{escena}</p>}
              <dl style={{ ...stack(6), margin: 0 }}>
                {filas.map((r) => {
                  const resumen = resumenDetalle(r.detalle)
                  return (
                    <div key={r.id}>
                      <dt style={{ fontSize: fs.xs, color: c.muted, lineHeight: 1.4 }}>{r.pregunta}</dt>
                      <dd style={{ margin: 0, fontSize: fs.sm, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                        {r.respuesta}
                        {resumen && <span style={{ display: 'block', fontSize: fs.xs, color: c.muted }}>{resumen}</span>}
                      </dd>
                    </div>
                  )
                })}
              </dl>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
