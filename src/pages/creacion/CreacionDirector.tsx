/**
 * The director's view of «Creación de personajes»: the steps of the world with the ones released, the characters in creation with what
 * each one has answered (the thread of their session 0 scene), «Añadir personaje», «Liberar paso», «Volver al paso anterior» and
 * «Personaje creado». A created character is followed from its sheet, which can send it back here («Pasar a creación»). Every write
 * answers with the whole state; the hub event refreshes the other clients.
 */
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronDown, ChevronUp, Circle, Lock, LockOpen, Minus, Plus, Undo2, UserCheck, UserX, Users } from 'lucide-react'
import { creacionApi } from '../../api/creacion'
import { Button, ConfirmDialog, EmptyState, PageHeader, Sheet } from '../../components/ui'
import { useCampaignStore } from '../../store/campaignStore'
import { buttonReset, c, card, eyebrow, fs, page, pill, radius, titleText, tone, type Tone } from '../../theme'
import type { CampaignDetail, CreacionEstado, CreacionPersonaje, Member } from '../../types'
import type { PasoCreacion } from '../../worlds/types'
import { etiquetaDato, useLegados, useOpcionesPaso } from './hooks'
import { estadoPaso, pasoAplica, pasoHecho, pasosCoinciden, pasosResueltos, type EstadoPaso } from './pasos'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const TONO_ESTADO: Record<EstadoPaso, Tone> = { bloqueado: tone.cuarzo, pendiente: tone.topacio, hecho: tone.esmeralda, omitido: tone.cuarzo }
const TEXTO_ESTADO: Record<EstadoPaso, string> = { bloqueado: 'bloqueado', pendiente: 'pendiente', hecho: 'hecho', omitido: 'no aplica' }
const ICONO_ESTADO = { bloqueado: Lock, pendiente: Circle, hecho: Check, omitido: Minus } as const

const numeroPaso = (t: Tone): CSSProperties => ({
  width: 28, height: 28, flexShrink: 0, borderRadius: radius.md,
  background: t.bg, color: t.fg, border: `1px solid ${t.border}`,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, fontSize: fs.sm, fontVariantNumeric: 'tabular-nums',
})

type Confirmacion =
  | { tipo: 'liberar' | 'retroceder'; paso: number; titulo: string }
  | { tipo: 'completar'; id: number; name: string }

export interface CreacionDirectorProps {
  cId: number
  estado: CreacionEstado
  pasos: PasoCreacion[]
}

export function CreacionDirector({ cId, estado, pasos }: CreacionDirectorProps) {
  const qc = useQueryClient()
  const { currentCampaign } = useCampaignStore()
  const jugadores: Member[] = ((currentCampaign as CampaignDetail | null)?.members ?? []).filter((m) => m.role === 'player')
  const [confirmacion, setConfirmacion] = useState<Confirmacion | null>(null)
  const [anadir, setAnadir] = useState(false)
  const [ownerId, setOwnerId] = useState<number | null>(null)

  // Every write answers with the whole state: keep it and refresh the lists that show names and chips
  const aplicar = (nuevo: CreacionEstado) => {
    qc.setQueryData(['creacion', cId], nuevo)
    qc.invalidateQueries({ queryKey: ['characters', cId] })
  }
  const pasoMutation = useMutation({
    mutationFn: (paso: number) => creacionApi.setPaso(cId, paso),
    onSuccess: (nuevo) => { aplicar(nuevo); setConfirmacion(null) },
  })
  const anadirMutation = useMutation({
    mutationFn: (owner: number) => creacionApi.addPersonaje(cId, owner),
    onSuccess: (nuevo) => { aplicar(nuevo); setAnadir(false); setOwnerId(null) },
  })
  const completarMutation = useMutation({
    mutationFn: (id: number) => creacionApi.completar(cId, id),
    onSuccess: (nuevo) => { aplicar(nuevo); setConfirmacion(null) },
  })
  const ocupado = pasoMutation.isPending || completarMutation.isPending
  const soloLectura = estado.iniciada
  const enCreacion = estado.personajes.filter((p) => !p.completada)
  const siguiente = estado.paso < pasos.length ? pasos[estado.paso] : null

  const confirmar = () => {
    if (!confirmacion) return
    if ('paso' in confirmacion) pasoMutation.mutate(confirmacion.paso)
    else completarMutation.mutate(confirmacion.id)
  }
  const textoConfirmacion = (x: Confirmacion): { title: string; message: ReactNode; confirmLabel: string; tone: 'brand' | 'danger' } => {
    switch (x.tipo) {
      case 'liberar':
        return { title: `¿Liberar el paso ${x.paso}?`, message: <>Los jugadores podrán responder <strong>{x.titulo}</strong>. Los pasos anteriores siguen abiertos.</>, confirmLabel: 'Liberar', tone: 'brand' }
      case 'retroceder':
        return { title: 'Volver al paso anterior', message: <>El paso <strong>{x.paso + 1}</strong> queda bloqueado otra vez. Lo que ya escribieron no se borra.</>, confirmLabel: 'Volver', tone: 'brand' }
      case 'completar':
        return { title: '¿Personaje creado?', message: <><strong>{x.name}</strong> pasa a «Personajes» y su ficha se rige por las reglas de siempre. Desde su ficha puedes devolverlo a la creación.</>, confirmLabel: 'Personaje creado', tone: 'brand' }
    }
  }
  const tc = confirmacion ? textoConfirmacion(confirmacion) : null

  return (
    <div style={{ ...page, paddingBottom: 48 }}>
      <PageHeader
        title="Creación de personajes"
        subtitle={`${estado.paso} de ${pasos.length} pasos liberados · ${enCreacion.length} en creación`}
        actions={(
          <Button icon={<Plus size={16} aria-hidden />} onClick={() => setAnadir(true)} disabled={soloLectura} aria-haspopup="dialog">
            <span className="hide-mobile">Añadir personaje</span>
            <span className="only-mobile">Añadir</span>
          </Button>
        )}
      />

      {soloLectura && (
        <Aviso>La campaña ya está iniciada: la creación queda en solo lectura. Para seguir con ella, reabre la preparación en Ajustes.</Aviso>
      )}
      {!pasosCoinciden(pasos, estado.pasos) && (
        <Aviso>Los pasos de la app y los del servidor no coinciden: actualiza la app o el servidor antes de seguir.</Aviso>
      )}

      {/* The steps and the buttons that release them */}
      <section aria-labelledby="creacion-pasos" style={{ ...card, padding: 16, ...stack(12), marginBottom: 20 }}>
        <p id="creacion-pasos" style={eyebrow}>Pasos</p>
        <ol style={{ listStyle: 'none', ...stack(10) }}>
          {pasos.map((paso, i) => {
            const liberado = i < estado.paso
            const esSiguiente = i === estado.paso
            return (
              <li key={paso.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', opacity: liberado || esSiguiente ? 1 : 0.65 }}>
                <span aria-hidden style={numeroPaso(liberado ? tone.esmeralda : esSiguiente ? tone.brand : tone.cuarzo)}>{i + 1}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: c.text }}>{paso.titulo}</span>
                    <span style={pill(liberado ? tone.esmeralda : tone.cuarzo)}>
                      {liberado ? <><LockOpen size={12} aria-hidden /> Liberado</> : <><Lock size={12} aria-hidden /> Bloqueado</>}
                    </span>
                  </span>
                  <span style={{ display: 'block', fontSize: fs.sm, color: c.muted, lineHeight: 1.45, marginTop: 2 }}>{paso.ayuda}</span>
                </span>
              </li>
            )
          })}
        </ol>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {siguiente ? (
            <Button
              icon={<LockOpen size={16} aria-hidden />}
              disabled={soloLectura || ocupado}
              onClick={() => setConfirmacion({ tipo: 'liberar', paso: estado.paso + 1, titulo: siguiente.titulo })}
            >
              Liberar paso {estado.paso + 1}: {siguiente.titulo}
            </Button>
          ) : (
            <span style={{ fontSize: fs.sm, color: c.muted }}>Todos los pasos están liberados.</span>
          )}
          {estado.paso > 0 && (
            <Button
              variant="ghost"
              icon={<Undo2 size={16} aria-hidden />}
              disabled={soloLectura || ocupado}
              onClick={() => setConfirmacion({ tipo: 'retroceder', paso: estado.paso - 1, titulo: pasos[estado.paso - 1].titulo })}
            >
              Volver al paso anterior
            </Button>
          )}
        </div>
      </section>

      {/* The characters still walking the steps, with what each one answered */}
      <section aria-labelledby="creacion-en-curso" style={{ ...stack(12), marginBottom: 20 }}>
        <p id="creacion-en-curso" style={eyebrow}>En creación</p>
        {enCreacion.length === 0 ? (
          <EmptyState
            icon={<Users size={22} aria-hidden />}
            title="Nadie en creación"
            description="Añade un personaje y asígnalo a un jugador: ponerle nombre será su primer paso."
          />
        ) : (
          <ul style={{ listStyle: 'none', ...stack(12) }}>
            {enCreacion.map((p) => (
              <TarjetaPersonaje
                key={p.id}
                p={p}
                pasos={pasos}
                pasoLiberado={estado.paso}
                disabled={soloLectura || ocupado}
                onCompletar={() => setConfirmacion({ tipo: 'completar', id: p.id, name: p.name })}
              />
            ))}
          </ul>
        )}
      </section>

      <Sheet
        open={anadir}
        onClose={() => setAnadir(false)}
        title="Añadir personaje"
        description="Elige al jugador. La ficha nace sin nombre: ponérselo es su primer paso."
        footer={(
          <>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={() => setAnadir(false)}>Cancelar</Button>
            <Button
              size="lg"
              style={{ flex: 2 }}
              disabled={ownerId === null || anadirMutation.isPending}
              aria-busy={anadirMutation.isPending || undefined}
              onClick={() => ownerId !== null && anadirMutation.mutate(ownerId)}
            >
              {anadirMutation.isPending ? 'Creando…' : 'Crear personaje'}
            </Button>
          </>
        )}
      >
        {jugadores.length === 0 ? (
          <p style={{ fontSize: fs.sm, color: c.muted }}>La campaña no tiene jugadores todavía: añádelos desde Ajustes.</p>
        ) : (
          <ul style={{ listStyle: 'none', ...stack(8) }}>
            {jugadores.map((j) => {
              const tiene = enCreacion.some((p) => p.ownerId === j.userId)
              const selected = ownerId === j.userId
              return (
                <li key={j.userId}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setOwnerId(j.userId)}
                    className={selected ? 'ui-card ui-card--interactive' : 'ui-card ui-card--interactive'}
                    style={{
                      ...buttonReset, width: '100%', display: 'flex', alignItems: 'center', gap: 12, minHeight: 52, padding: '10px 14px',
                      borderRadius: radius.lg, border: `1px solid ${selected ? tone.brand.border : c.border}`, background: selected ? tone.brand.bg : c.s1,
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontWeight: 600, color: c.text }}>{j.displayName}</span>
                    {tiene && <span style={pill(tone.topacio)}>Ya tiene uno en creación</span>}
                    {selected && <Check size={18} aria-hidden style={{ color: tone.brand.fg }} />}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {anadirMutation.isError && <p role="alert" style={{ marginTop: 10, fontSize: fs.sm, color: tone.rubi.fg }}>No se ha podido crear el personaje.</p>}
      </Sheet>

      <ConfirmDialog
        open={confirmacion !== null}
        title={tc?.title ?? ''}
        message={tc?.message}
        confirmLabel={tc?.confirmLabel ?? 'Confirmar'}
        tone={tc?.tone ?? 'brand'}
        loading={ocupado}
        onConfirm={confirmar}
        onCancel={() => setConfirmacion(null)}
      />
    </div>
  )
}

function Aviso({ children }: { children: ReactNode }) {
  return (
    <p role="status" style={{ ...card, padding: '10px 14px', marginBottom: 16, background: tone.topacio.bg, borderColor: tone.topacio.border, fontSize: fs.sm, color: c.text, lineHeight: 1.45 }}>
      {children}
    </p>
  )
}

function PillJugador({ nombre }: { nombre?: string | null }) {
  return (
    <span style={pill(nombre ? tone.esmeralda : tone.cuarzo)}>
      {nombre ? <><UserCheck size={13} aria-hidden />{nombre}</> : <><UserX size={13} aria-hidden />Sin asignar</>}
    </span>
  )
}

/** A character in creation: its progress step by step and, unfolded, what it answered */
function TarjetaPersonaje({ p, pasos, pasoLiberado, disabled, onCompletar }: {
  p: CreacionPersonaje
  pasos: PasoCreacion[]
  pasoLiberado: number
  disabled: boolean
  onCompletar: () => void
}) {
  const [abierto, setAbierto] = useState(false)
  const hechos = pasosResueltos(pasos, p)
  return (
    <li style={{ ...card, padding: 14, ...stack(10) }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ flex: 1, minWidth: 140, ...titleText, fontSize: fs.md + 1, color: c.text, overflowWrap: 'anywhere' }}>{p.name}</span>
        <PillJugador nombre={p.ownerName} />
        <span style={{ fontSize: fs.sm, color: c.muted, fontVariantNumeric: 'tabular-nums' }}>{hechos} de {pasos.length}</span>
      </div>
      <ol aria-label="Pasos" style={{ listStyle: 'none', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {pasos.map((paso, i) => {
          const e = estadoPaso(i, pasoLiberado, pasoHecho(paso, p), pasoAplica(paso, p))
          const Icono = ICONO_ESTADO[e]
          return (
            <li key={paso.id}>
              <span title={`${i + 1}. ${paso.titulo}: ${TEXTO_ESTADO[e]}`} style={{ ...pill(TONO_ESTADO[e]), minWidth: 34, justifyContent: 'center' }}>
                <Icono size={12} aria-hidden /> {i + 1}
                <span className="sr-only">{paso.titulo}: {TEXTO_ESTADO[e]}</span>
              </span>
            </li>
          )
        })}
      </ol>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          aria-expanded={abierto}
          style={{ ...buttonReset, display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: fs.sm, color: tone.brand.fg }}
        >
          {abierto ? <ChevronUp size={14} aria-hidden /> : <ChevronDown size={14} aria-hidden />}
          {abierto ? 'Ocultar respuestas' : 'Ver respuestas'}
        </button>
        <span style={{ flex: 1 }} />
        <Button size="sm" variant="secondary" icon={<Check size={14} aria-hidden />} disabled={disabled} onClick={onCompletar}>Personaje creado</Button>
      </div>
      {abierto && (
        <dl style={{ ...stack(8), margin: 0, paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
          {pasos.map((paso) => <FilaRespuesta key={paso.id} paso={paso} p={p} />)}
        </dl>
      )}
    </li>
  )
}

/** One step of a character as the director reads it: the title (or the legacy's question) and the answer */
function FilaRespuesta({ paso, p }: { paso: PasoCreacion; p: CreacionPersonaje }) {
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
