/**
 * The creation session on the director's screen: the session 0 of a campaign with guided creation, played once. The campaign keeps
 * its state (`CreacionEstado.sesion`: pendiente → preparando → en-curso → jugada, kept by the API); the screen prepares it (every
 * character in creation with its answers and the director's notes to run its scene), starts it (a table session numbered 0, whose
 * id the API records), can send it back to the preparation and ends it (`sesionCreacionAcciones`). Everything lives in the Creación
 * panel (`PanelCreacion`); the Bitácora only closes the table session. While the session is prepared or played the Grupo panel shows
 * each character's «Creación» card (`TarjetaCreacion`).
 */
import { useState, type CSSProperties, type ReactNode } from 'react'
import { Check, Circle, Film, Play, Sparkles, Square, Undo2 } from 'lucide-react'
import { Button, ConfirmDialog, Disclosure, Switch, Textarea } from '../../components/ui'
import { c, eyebrow, font, fs, pill, radius, shadow, tone } from '../../theme'
import type { CreacionPersonaje } from '../../types'
import type { PasoCreacion } from '../../worlds/types'
import { FilasRespuestas } from '../creacion/Respuestas'
import { pasosResueltos } from '../creacion/pasos'
import { usePantalla } from './contexto'
import { personajesEnCreacion, useCreacionPantalla } from './creacionPantalla'
import { escenasJugadas } from './estado'
import type { AccionesSesionCreacion } from './sesionCreacionAcciones'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const tarjeta: CSSProperties = { padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }

const TEXTO_ESTADO: Record<string, string> = { pendiente: 'Pendiente', preparando: 'En preparación', 'en-curso': 'En curso', jugada: 'Jugada' }

/**
 * The creation session as the Creación panel shows it: pending («Preparar»), being prepared (requirements, the characters with their
 * answers and the notes, «Empezar»), running (the characters, «Volver a la preparación», «Terminar»). Nothing once the campaign started
 * or the session was played
 */
export function SeccionSesionCreacion({ acc }: { acc: AccionesSesionCreacion }) {
  const { cId, estado, actualizar } = usePantalla()
  const { creacion, pasos } = useCreacionPantalla(cId)
  const [confirmando, setConfirmando] = useState(false)
  const [volviendo, setVolviendo] = useState(false)
  const [terminando, setTerminando] = useState(false)
  if (!creacion || creacion.iniciada) return null
  const s = creacion.sesion
  if (s.estado === 'jugada') return null
  const enCreacion = personajesEnCreacion(creacion)
  const escenas = estado.escenasPropias.length
  const jugadas = escenasJugadas(estado).length
  // What the director prepares before starting: the script, the players' answers to the released steps, the notes
  const alDia = enCreacion.filter((p) => pasosResueltos(pasos, p) >= creacion.paso).length
  const conNotas = enCreacion.filter((p) => (estado.preparacionCreacion[String(p.id)] ?? '').trim() !== '').length

  const tarjetas = (abiertas: boolean) => enCreacion.length === 0 ? (
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
            abierta={abiertas}
          />
        </li>
      ))}
    </ul>
  )

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
        Se juega una sola vez: es la sesión 0. Mientras dure, cada decisión de la mesa se guarda en su personaje y se escribe en su ficha según se elige.
        {s.estado === 'pendiente' && ' Prepárala antes de empezar: tendrás a mano lo que ha respondido cada jugador y podrás apuntar cómo dirigir su escena.'}
      </p>

      {s.estado === 'pendiente' && (
        <Button variant="secondary" icon={<Sparkles size={16} aria-hidden />} onClick={() => { void acc.preparar() }} disabled={acc.ocupado} style={{ alignSelf: 'flex-start' }}>
          Preparar la sesión de creación
        </Button>
      )}

      {s.estado === 'preparando' && (
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
          {tarjetas(true)}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <Button icon={<Play size={16} aria-hidden />} onClick={() => setConfirmando(true)} disabled={acc.ocupado || escenas === 0} aria-haspopup="dialog">
              Empezar la sesión de creación
            </Button>
            {escenas === 0 && <span style={{ fontSize: fs.xs, color: c.subtle }}>Carga antes el guion: la sesión se juega con él.</span>}
          </div>
          <ConfirmDialog
            open={confirmando}
            tone="brand"
            icon="warning"
            title="¿Empezar la sesión de creación?"
            message={`Se juega una sola vez. Se abre la sesión de mesa 0 con «${estado.guionTitulo || 'el guion cargado'}» y, desde ese momento, cada decisión de la mesa se escribe en la ficha de su personaje (${enCreacion.length} en creación).`}
            confirmLabel="Empezar"
            onConfirm={() => { setConfirmando(false); void acc.empezar() }}
            onCancel={() => setConfirmando(false)}
          />
        </>
      )}

      {s.estado === 'en-curso' && (
        <>
          {tarjetas(false)}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button size="sm" variant="ghost" icon={<Undo2 size={14} aria-hidden />} onClick={() => setVolviendo(true)} disabled={acc.ocupado}>Volver a la preparación</Button>
            <Button size="sm" variant="secondary" icon={<Square size={14} aria-hidden />} onClick={() => setTerminando(true)} disabled={acc.ocupado} style={{ marginLeft: 'auto' }}>
              Terminar la sesión de creación
            </Button>
          </div>
          <ConfirmDialog
            open={volviendo}
            tone="brand"
            icon="warning"
            title="¿Volver a la preparación?"
            message={`La sesión de creación vuelve a «en preparación» y la sesión de mesa 0 se descarta${estado.sesion?.eventos.length ? ` con sus ${estado.sesion.eventos.length} anotaciones` : ''}. Lo ya escrito en las fichas se queda tal cual.`}
            confirmLabel="Volver a la preparación"
            onConfirm={() => { void acc.volver().then((ok) => { if (ok) setVolviendo(false) }) }}
            onCancel={() => setVolviendo(false)}
          />
          <DialogoTerminarSesion
            open={terminando}
            esCreacion
            sinCrear={acc.sinCrear}
            jugadas={jugadas}
            pendientes={escenas - jugadas}
            ocupado={acc.ocupado}
            onConfirm={(todas) => { void acc.terminar(todas).then((ok) => { if (ok) setTerminando(false) }) }}
            onCancel={() => setTerminando(false)}
          />
        </>
      )}
      {acc.aviso && <p role="status" style={{ fontSize: fs.sm, color: c.muted }}>{acc.aviso}</p>}
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

/** What the closing session takes with it: the played scenes, and the pending ones too when the director marks them as played */
function textoEscenas(jugadas: number, pendientes: number, todas: boolean): string {
  const lasJugadas = jugadas === 1 ? 'la escena jugada' : `las ${jugadas} escenas jugadas`
  if (pendientes === 0) return jugadas ? `Se lleva ${lasJugadas}.` : 'No tiene escenas.'
  if (todas) {
    const total = jugadas + pendientes
    return `Se lleva ${total === 1 ? 'la escena' : `las ${total} escenas`}: ${pendientes === 1 ? 'la que quedaba sin jugar queda marcada' : `las ${pendientes} sin jugar quedan marcadas`} como jugadas.`
  }
  return `${jugadas ? `Se lleva ${lasJugadas}` : 'No tiene escenas jugadas'}; ${pendientes === 1 ? 'la que queda sin jugar pasa' : `las ${pendientes} sin jugar pasan`} a la siguiente sesión.`
}

/** «¿Terminar la sesión?», for any table session: what it takes with it, the pending scenes it may mark as played, and the creation session's warning */
export function DialogoTerminarSesion({ open, esCreacion, sinCrear, jugadas, pendientes, ocupado, onConfirm, onCancel }: {
  open: boolean
  esCreacion: boolean
  sinCrear: string[]
  jugadas: number
  pendientes: number
  ocupado: boolean
  onConfirm: (marcarTodas: boolean) => void
  onCancel: () => void
}) {
  const [marcarTodas, setMarcarTodas] = useState(false)
  const cerrar = () => { setMarcarTodas(false); onCancel() }
  return (
    <ConfirmDialog
      open={open}
      tone="brand"
      icon="warning"
      title={esCreacion ? '¿Terminar la sesión de creación?' : '¿Terminar la sesión?'}
      message={(
        <>
          {esCreacion && `Termina también la sesión de creación, que no se puede volver a jugar.${sinCrear.length ? ` ${sinCrear.join(', ')} ${sinCrear.length === 1 ? 'sigue' : 'siguen'} en creación: márcalos creados en Creación.` : ''} `}
          Se guarda en «Sesiones anteriores» con sus anotaciones; desde allí puedes copiar el prompt de la crónica.{' '}
          {textoEscenas(jugadas, pendientes, marcarTodas)}
          {pendientes > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
              <Switch checked={marcarTodas} onChange={setMarcarTodas} label="Marcar todas las escenas como jugadas" />
              Marcar {pendientes === 1 ? 'la escena pendiente' : `las ${pendientes} escenas pendientes`} como jugadas
            </label>
          )}
        </>
      )}
      confirmLabel={esCreacion ? 'Terminar la sesión de creación' : 'Terminar sesión'}
      onConfirm={() => { if (!ocupado) onConfirm(marcarTodas) }}
      onCancel={cerrar}
    />
  )
}
