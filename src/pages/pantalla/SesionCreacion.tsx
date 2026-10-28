/**
 * The creation session on the director's screen: the session 0 of a campaign with guided creation, played once. The campaign keeps
 * its state (`CreacionEstado.sesion`: pendiente → preparando → en-curso → jugada, kept by the API); the screen prepares it (every
 * character in creation with its answers and the director's notes to run its scene), starts it (a table session numbered 0, whose
 * id the API records) and ends it, from the Bitácora panel (`PanelBitacora`). While it is prepared or played the Grupo panel shows
 * each character's «Creación» card (`TarjetaCreacion`). The decisions of the script go to each character through `sincronizacion`.
 */
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Circle, Film, Play, Sparkles } from 'lucide-react'
import { creacionApi } from '../../api/creacion'
import { Button, ConfirmDialog, Disclosure, Textarea } from '../../components/ui'
import { c, eyebrow, font, fs, pill, radius, shadow, tone } from '../../theme'
import type { CreacionPersonaje } from '../../types'
import type { PasoCreacion } from '../../worlds/types'
import { FilasRespuestas } from '../creacion/Respuestas'
import { pasosResueltos } from '../creacion/pasos'
import { usePantalla } from './contexto'
import { personajesEnCreacion, useCreacionPantalla } from './creacionPantalla'
import { mensajeDe } from './sincronizacion'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const tarjeta: CSSProperties = { padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }

const TEXTO_ESTADO: Record<string, string> = { pendiente: 'Pendiente', preparando: 'En preparación', 'en-curso': 'En curso', jugada: 'Jugada' }

/**
 * Bitácora, with no table session open: the creation session while it is pending («Preparar») or being prepared (the characters with
 * their answers and the notes, and «Empezar la sesión de creación»). Nothing once the campaign started or the session was played
 */
export function SeccionSesionCreacion({ onEmpezar, ocupado }: { onEmpezar: () => void; ocupado: boolean }) {
  const { cId, estado, actualizar } = usePantalla()
  const qc = useQueryClient()
  const { creacion, pasos } = useCreacionPantalla(cId)
  const [error, setError] = useState<string | null>(null)
  const [preparando, setPreparando] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  if (!creacion || creacion.iniciada) return null
  const s = creacion.sesion
  if (s.estado !== 'pendiente' && s.estado !== 'preparando') return null
  const enCreacion = personajesEnCreacion(creacion)
  const escenas = estado.escenasPropias.length
  // What the director prepares before starting: the script, the players' answers to the released steps, the notes
  const alDia = enCreacion.filter((p) => pasosResueltos(pasos, p) >= creacion.paso).length
  const conNotas = enCreacion.filter((p) => (estado.preparacionCreacion[String(p.id)] ?? '').trim() !== '').length

  const preparar = async () => {
    setPreparando(true)
    setError(null)
    try {
      qc.setQueryData(['creacion', cId], await creacionApi.sesion(cId, 'preparar'))
    } catch (e) {
      setError(mensajeDe(e))
    } finally {
      setPreparando(false)
    }
  }

  return (
    <section aria-label="Sesión de creación" style={{ ...tarjeta, ...stack(12), borderColor: tone.topacio.border }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Film size={18} aria-hidden style={{ color: tone.topacio.fg, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...eyebrow, color: 'var(--gold)' }}>Sesión de creación</p>
          <h2 style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, color: c.text, lineHeight: 1.2 }}>{TEXTO_ESTADO[s.estado] ?? s.estado}</h2>
        </div>
        <span style={pill(tone.topacio)}>{enCreacion.length} en creación</span>
      </div>
      <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>
        Se juega una sola vez: es la sesión 0. Mientras dure, lo que decida la mesa se guarda en la creación de cada personaje.
        {s.estado === 'pendiente' && ' Prepárala antes de empezar: tendrás a mano lo que ha respondido cada jugador y podrás apuntar cómo dirigir su escena.'}
      </p>
      {s.estado === 'pendiente' ? (
        <Button variant="secondary" icon={<Sparkles size={16} aria-hidden />} onClick={() => { void preparar() }} disabled={preparando} style={{ alignSelf: 'flex-start' }}>
          Preparar la sesión de creación
        </Button>
      ) : (
        <>
          <ul aria-label="Preparación" style={{ listStyle: 'none', margin: 0, padding: 0, ...stack(4) }}>
            <Requisito ok={escenas > 0}>
              {escenas > 0
                ? <>Guion cargado: <strong style={{ color: c.text }}>{estado.guionTitulo || 'sin título'}</strong> · {escenas} escena{escenas === 1 ? '' : 's'}</>
                : <>Guion sin cargar: impórtalo en Escena (el de la sesión 0 de tu mundo)</>}
            </Requisito>
            <Requisito ok={enCreacion.length > 0 && alDia === enCreacion.length}>
              {enCreacion.length === 0
                ? 'Nadie en creación'
                : `Respuestas: ${alDia} de ${enCreacion.length} personajes al día con los ${creacion.paso} pasos liberados`}
            </Requisito>
            <Requisito ok={enCreacion.length > 0 && conNotas === enCreacion.length}>
              {`Notas para dirigir: ${conNotas} de ${enCreacion.length}`}
            </Requisito>
          </ul>
          {enCreacion.length === 0 ? (
            <p style={{ fontSize: fs.sm, color: c.subtle, fontStyle: 'italic' }}>Nadie en creación: añade los personajes en Creación.</p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, ...stack(10) }}>
              {enCreacion.map((p) => (
                <li key={p.id}>
                  <TarjetaCreacion
                    p={p}
                    pasos={pasos}
                    notas={estado.preparacionCreacion[String(p.id)] ?? ''}
                    onNotas={(t) => actualizar((b) => { b.preparacionCreacion[String(p.id)] = t })}
                    abierta
                  />
                </li>
              ))}
            </ul>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button icon={<Play size={16} aria-hidden />} onClick={() => setConfirmando(true)} disabled={ocupado || escenas === 0} aria-haspopup="dialog">
              Empezar la sesión de creación
            </Button>
            {escenas === 0 && <span style={{ fontSize: fs.xs, color: c.subtle }}>Carga antes el guion: la sesión se juega con él.</span>}
          </div>
          <ConfirmDialog
            open={confirmando}
            tone="brand"
            icon="warning"
            title="¿Empezar la sesión de creación?"
            message={`Se juega una sola vez. Se abre la sesión de mesa 0 con «${estado.guionTitulo || 'el guion cargado'}» y, desde ese momento, lo que decida la mesa se guarda en la creación de cada personaje (${enCreacion.length} en creación).`}
            confirmLabel="Empezar"
            onConfirm={() => { setConfirmando(false); onEmpezar() }}
            onCancel={() => setConfirmando(false)}
          />
        </>
      )}
      {error && <p role="alert" style={{ fontSize: fs.sm, color: tone.rubi.fg }}>{error}</p>}
    </section>
  )
}

/** One line of the preparation list: done (check) or pending (circle) */
function Requisito({ ok, children }: { ok: boolean; children: ReactNode }) {
  const Icono = ok ? Check : Circle
  return (
    <li style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: fs.sm, color: ok ? c.text : c.muted, lineHeight: 1.45 }}>
      <Icono size={15} aria-hidden style={{ color: ok ? tone.esmeralda.fg : c.subtle, flexShrink: 0, marginTop: 3 }} />
      <span><span className="sr-only">{ok ? 'Hecho: ' : 'Pendiente: '}</span>{children}</span>
    </li>
  )
}

/** A character in creation: what the player answered, step by step, and the director's notes to run its scene (only the director sees them) */
export function TarjetaCreacion({ p, pasos, notas, onNotas, abierta = false, headingLevel = 3 }: {
  p: CreacionPersonaje
  pasos: PasoCreacion[]
  notas: string
  onNotas: (texto: string) => void
  abierta?: boolean
  headingLevel?: 2 | 3 | 4
}) {
  const id = `creacion-notas-${p.id}`
  return (
    <Disclosure
      defaultOpen={abierta}
      headingLevel={headingLevel}
      icon={<Film size={16} aria-hidden />}
      accent={tone.topacio.fg}
      title={abierta ? p.name : 'Creación'}
      summary={`${p.ownerName ?? 'Sin jugador'} · ${pasosResueltos(pasos, p)} de ${pasos.length} pasos`}
      style={{ boxShadow: 'none' }}
    >
      <div style={stack(10)}>
        <dl style={{ ...stack(8), margin: 0 }}>
          <FilasRespuestas pasos={pasos} p={p} />
        </dl>
        <div style={stack(6)}>
          <label htmlFor={id} style={eyebrow}>Notas para dirigir su escena</label>
          <Textarea id={id} value={notas} onChange={(e) => onNotas(e.target.value)} rows={3} placeholder="La escena de su obstáculo, la escena pico de su metal, el PNJ de su vínculo…" />
          <p style={{ fontSize: fs.xs, color: c.subtle }}>Solo las ves tú; se guardan con la pantalla.</p>
        </div>
      </div>
    </Disclosure>
  )
}
