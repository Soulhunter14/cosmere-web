/**
 * The player's view of «Creación de personajes»: the steps of the world, locked until the director releases them, each one answered
 * from here (the name, the legacy, the ancestry, the questions of the legacy, the choices); the server checks the released steps too.
 * Once the director marks «Personaje creado», a card sends the player to the sheet.
 */
import { lazy, Suspense, useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Check, Circle, Lock, Minus, Pencil, Save, Users } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { Button, ConfirmDialog, EmptyState, ErrorMessage, Input, PageHeader, Spinner } from '../../components/ui'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { type Tone, buttonReset, c, card, eyebrow, fs, page, pill, radius, titleText, tone } from '../../theme'
import type { Character, CreacionEstado, CreacionPersonaje, RespuestaPasoRequest, UpdateCharacterRequest } from '../../types'
import type { OpcionCreacion, PasoCreacion } from '../../worlds/types'
import { etiquetaDato, useLegados, useOpcionesPaso } from './hooks'
import { conRespuesta, esNombreProvisional, estadoPaso, pasoAplica, pasoHecho, type EstadoPaso } from './pasos'

// Mistborn-only pieces (they import the legacies BY FILE): lazy, like the rest of components/mistborn
const PasoLegado = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.PasoLegado })))
const PreguntaLegado = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.PreguntaLegado })))

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const TONO_ESTADO: Record<EstadoPaso, Tone> = { bloqueado: tone.cuarzo, pendiente: tone.topacio, hecho: tone.esmeralda, omitido: tone.cuarzo }
const TEXTO_ESTADO: Record<EstadoPaso, string> = { bloqueado: 'Bloqueado', pendiente: 'Pendiente', hecho: 'Hecho', omitido: 'No aplica' }
const ICONO_ESTADO = { bloqueado: Lock, pendiente: Circle, hecho: Check, omitido: Minus } as const

type Cambio = Partial<Pick<UpdateCharacterRequest, 'name' | 'legado' | 'ascendencia' | 'legadoRespuestas' | 'creacionDatos'>>
type LegadoDef = ReturnType<typeof useLegados>[number]

/** The question the player saw in the step, for the record of answers the API keeps (`RespuestaPersonaje`: what was asked, as asked) */
function preguntaDePaso(paso: PasoCreacion, cambio: Cambio, def: LegadoDef | undefined): RespuestaPasoRequest {
  if ('indice' in paso) return { paso: paso.id, pregunta: def?.preguntas[paso.indice] ?? paso.titulo, tipoRespuesta: 'texto' }
  if ('clave' in paso) {
    const valor = cambio.creacionDatos?.[paso.clave] ?? ''
    return { paso: paso.id, pregunta: paso.titulo, tipoRespuesta: valor === 'si' || valor === 'no' ? 'si-no' : 'eleccion' }
  }
  return { paso: paso.id, pregunta: paso.titulo, tipoRespuesta: paso.id === 'name' ? 'texto' : 'eleccion' }
}

/** The server's message of a refused save (a step not released yet), or a generic one */
function mensajeDe(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { error?: unknown } | undefined
    if (typeof data?.error === 'string') return data.error
  }
  return e instanceof Error && e.message ? e.message : 'No se ha podido guardar.'
}

export interface CreacionJugadorProps {
  cId: number
  estado: CreacionEstado
  pasos: PasoCreacion[]
  userId: number | null
}

export function CreacionJugador({ cId, estado, pasos, userId }: CreacionJugadorProps) {
  const qc = useQueryClient()
  const mio = estado.personajes.find((p) => p.ownerId === userId && !p.completada) ?? null
  const creado = estado.personajes.find((p) => p.ownerId === userId && p.completada) ?? null
  const chId = mio?.id ?? 0
  // The whole character, because the save is the usual PUT of the sheet with one field changed
  const { data: char } = useQuery<Character>({
    queryKey: ['character', cId, chId, false],
    queryFn: () => charactersApi.getById(cId, chId),
    enabled: chId > 0,
  })
  const [error, setError] = useState<string | null>(null)
  const legados = useLegados()
  // A done step folds to what was chosen; while the director permits changing a `cambiable` step, «Cambiar» opens its editor again until the next save
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({})
  const abrir = (pasoId: string, abierto: boolean) => setAbiertos((cur) => ({ ...cur, [pasoId]: abierto }))
  const guardar = useMutation({
    mutationFn: ({ cambio, pasoId }: { cambio: Cambio; pasoId: string }) => {
      if (!char) return Promise.reject(new Error('Tu personaje aún no se ha cargado. Vuelve a intentarlo.'))
      // The question as the player saw it goes with the answer: the API records what was asked, not only what was answered
      const paso = pasos.find((p) => p.id === pasoId)
      const def = legados.find((l) => l.id === (cambio.legado ?? mio?.legado ?? ''))
      const respuestas = paso ? [preguntaDePaso(paso, cambio, def)] : []
      return charactersApi.update(cId, chId, { ...char, ...cambio, respuestas } as UpdateCharacterRequest)
    },
    onMutate: () => setError(null),
    onError: (e) => setError(mensajeDe(e)),
    onSuccess: (actualizado, { pasoId }) => {
      qc.setQueryData(['character', cId, chId, false], actualizado)
      qc.invalidateQueries({ queryKey: ['creacion', cId] })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
      abrir(pasoId, false)
    },
  })

  if (!mio) {
    return (
      <div style={{ ...page, paddingBottom: 48 }}>
        <PageHeader title="Creación de personajes" />
        {creado ? (
          <section style={{ ...card, padding: 18, ...stack(10), alignItems: 'flex-start' }}>
            <p style={{ ...titleText, fontSize: fs.lg + 2, color: c.text }}>Personaje creado</p>
            <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
              El director ha dado por creado a <strong style={{ color: c.text }}>{creado.name}</strong>. Su ficha ya está en «Personaje».
            </p>
            <Link to={`/campaigns/${cId}/characters/${creado.id}`} style={{ fontSize: fs.base, fontWeight: 600, color: tone.brand.fg }}>Ir a mi personaje</Link>
          </section>
        ) : (
          <EmptyState
            icon={<Users size={22} aria-hidden />}
            title="Sin personaje todavía"
            description="El director aún no te ha asignado un personaje. Cuando lo haga, aquí aparecerán sus pasos."
          />
        )}
      </div>
    )
  }

  const soloLectura = estado.iniciada
  // «Cambiar» on an answered step: only the steps the table marks as `cambiable`, and only while the director permits it
  const puedeCambiar = (paso: PasoCreacion) => !!paso.cambiable && estado.cambiables.includes(paso.id) && !soloLectura
  const ocupado = guardar.isPending
  return (
    <div style={{ ...page, paddingBottom: 48 }}>
      <PageHeader
        title="Creación de personajes"
        subtitle={esNombreProvisional(mio.name) ? 'Tu personaje, paso a paso' : mio.name}
      />
      {soloLectura && (
        <p role="status" style={{ ...card, padding: '10px 14px', marginBottom: 16, background: tone.topacio.bg, borderColor: tone.topacio.border, fontSize: fs.sm, color: c.text }}>
          La campaña ya está iniciada: la creación queda en solo lectura.
        </p>
      )}
      {error && <ErrorMessage message={error} style={{ marginBottom: 12 }} />}

      <ol style={{ listStyle: 'none', ...stack(12) }}>
        {pasos.map((paso, i) => {
          const aplica = pasoAplica(paso, mio)
          const e = estadoPaso(i, estado.paso, pasoHecho(paso, mio), aplica)
          const Icono = ICONO_ESTADO[e]
          // The step that this one waits for (its title, for the notice)
          const requerido = 'requiere' in paso && paso.requiere ? pasos.find((x) => 'clave' in x && x.clave === paso.requiere!.clave) : undefined
          return (
            <li key={paso.id} style={{ ...card, padding: 14, opacity: e === 'bloqueado' ? 0.7 : 1 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span aria-hidden style={numeroPaso(TONO_ESTADO[e])}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <h2 style={{ ...titleText, fontSize: fs.md + 1, color: c.text }}>{paso.titulo}</h2>
                    <span style={pill(TONO_ESTADO[e])}><Icono size={12} aria-hidden /> {TEXTO_ESTADO[e]}</span>
                  </div>
                  <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45, marginTop: 2 }}>{paso.ayuda}</p>
                </div>
              </div>
              {e === 'bloqueado' ? (
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted, marginTop: 10 }}>
                  <Lock size={14} aria-hidden /> El director aún no ha liberado este paso.
                </p>
              ) : e === 'omitido' ? (
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted, marginTop: 10 }}>
                  <Minus size={14} aria-hidden /> {'requiere' in paso && paso.requiere ? paso.requiere.siNo : 'Este paso no aplica a tu personaje.'}
                </p>
              ) : aplica === 'espera' ? (
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.sm, color: c.muted, marginTop: 10 }}>
                  <Circle size={14} aria-hidden /> Responde antes «{requerido?.titulo ?? 'el paso anterior'}».
                </p>
              ) : e === 'hecho' && !(abiertos[paso.id] && puedeCambiar(paso)) ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginTop: 10 }}>
                  <ResumenPaso paso={paso} mio={mio} elegidos={estado.legadosElegidos} />
                  {puedeCambiar(paso) && (
                    <Button size="sm" variant="ghost" icon={<Pencil size={14} aria-hidden />} onClick={() => abrir(paso.id, true)} style={{ flexShrink: 0 }}>
                      Cambiar
                    </Button>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: 12 }}>
                  <CuerpoPaso
                    key={`${mio.id}:${mio.legado}`}
                    paso={paso}
                    mio={mio}
                    elegidos={estado.legadosElegidos}
                    disabled={soloLectura || ocupado}
                    onGuardar={(cambio) => guardar.mutate({ cambio, pasoId: paso.id })}
                  />
                  {e === 'hecho' && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                      <Button size="sm" variant="ghost" onClick={() => abrir(paso.id, false)}>Dejarlo como está</Button>
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const numeroPaso = (t: Tone): CSSProperties => ({
  width: 28, height: 28, flexShrink: 0, borderRadius: radius.md,
  background: t.bg, color: t.fg, border: `1px solid ${t.border}`,
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  fontWeight: 700, fontSize: fs.sm, fontVariantNumeric: 'tabular-nums',
})

/** A done step, folded: only what was chosen (the question of the legacy as a small label when it is an answer) */
function ResumenPaso({ paso, mio, elegidos }: { paso: PasoCreacion; mio: CreacionPersonaje; elegidos: Record<string, number> }) {
  const cfg = useWorldConfig()
  const legados = useLegados()
  const opciones = useOpcionesPaso(paso)
  const def = legados.find((l) => l.id === mio.legado)
  let etiqueta: string | null = null
  let valor = ''
  if (paso.id === 'name') valor = mio.name
  else if (paso.id === 'legado') valor = def?.nombre ?? mio.legado
  else if (paso.id === 'ascendencia') valor = cfg.ascendencias.find((a) => a.id === mio.ascendencia)?.label ?? mio.ascendencia
  else if ('indice' in paso) {
    etiqueta = def?.preguntas[paso.indice] ?? null
    valor = mio.legadoRespuestas[paso.indice] ?? ''
  } else if ('clave' in paso) {
    valor = etiquetaDato(opciones, mio.creacionDatos[paso.clave] ?? '')
  }
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      {etiqueta && <p style={{ fontSize: fs.xs, color: c.muted, lineHeight: 1.4, marginBottom: 2 }}>{etiqueta}</p>}
      <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: fs.base, color: c.text, lineHeight: 1.5, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
        <Check size={16} aria-hidden style={{ color: tone.esmeralda.fg, flexShrink: 0, marginTop: 3 }} />
        <span>{valor}</span>
        {/* The legacy others also have: the same notice as in the list, so the folded step keeps saying it */}
        {paso.id === 'legado' && (elegidos[mio.legado] ?? 0) > 0 && (
          <span style={{ ...pill(tone.topacio), flexShrink: 0, marginTop: 1 }}>
            <Users size={12} aria-hidden /> {elegidos[mio.legado] === 1 ? 'También lo tiene 1 compañero' : `También lo tienen ${elegidos[mio.legado]} compañeros`}
          </span>
        )}
      </p>
    </div>
  )
}

/** The editor of one released step, by its kind. The editors with a draft are keyed by the saved value: a save or a change from elsewhere starts them afresh */
function CuerpoPaso({ paso, mio, elegidos, disabled, onGuardar }: { paso: PasoCreacion; mio: CreacionPersonaje; elegidos: Record<string, number>; disabled: boolean; onGuardar: (cambio: Cambio) => void }) {
  if (paso.id === 'name') return <PasoNombre key={mio.name} valor={mio.name} disabled={disabled} onGuardar={(name) => onGuardar({ name })} />
  if (paso.id === 'legado') return <PasoTrasfondo mio={mio} elegidos={elegidos} disabled={disabled} onGuardar={onGuardar} />
  if (paso.id === 'ascendencia') return <PasoAscendencia valor={mio.ascendencia} disabled={disabled} onChange={(ascendencia) => onGuardar({ ascendencia })} />
  if ('indice' in paso) {
    const guardado = mio.legadoRespuestas[paso.indice] ?? ''
    return (
      <PasoPregunta
        key={`${paso.indice}:${guardado}`}
        indice={paso.indice}
        mio={mio}
        disabled={disabled}
        onGuardar={(texto) => onGuardar({ legadoRespuestas: conRespuesta(mio.legadoRespuestas, paso.indice, texto) })}
      />
    )
  }
  if ('clave' in paso) {
    return (
      <PasoDato
        paso={paso}
        valor={mio.creacionDatos[paso.clave] ?? ''}
        disabled={disabled}
        onChange={(id) => onGuardar({ creacionDatos: { ...mio.creacionDatos, [paso.clave]: id } })}
      />
    )
  }
  return null
}

function PasoNombre({ valor, disabled, onGuardar }: { valor: string; disabled: boolean; onGuardar: (name: string) => void }) {
  const provisional = esNombreProvisional(valor)
  const [nombre, setNombre] = useState(provisional ? '' : valor)
  const limpio = nombre.trim()
  const cambiado = limpio !== '' && limpio !== valor.trim()
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); if (cambiado) onGuardar(limpio) }}
      style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}
    >
      <label htmlFor="creacion-nombre" className="sr-only">Nombre del personaje</label>
      <Input
        id="creacion-nombre"
        value={nombre}
        maxLength={80}
        disabled={disabled}
        placeholder="Nombre de tu personaje"
        onChange={(e) => setNombre(e.target.value)}
        style={{ flex: '1 1 220px' }}
      />
      <Button type="submit" icon={<Save size={16} aria-hidden />} disabled={disabled || !cambiado}>Guardar</Button>
      {provisional && <p style={{ flexBasis: '100%', fontSize: fs.xs, color: c.muted }}>Tu personaje aún no tiene nombre.</p>}
    </form>
  )
}

/**
 * The legacy. Changing it starts every later step afresh (ancestry, the choices and the three answers), so they open again for the
 * player; when any of them is answered, it asks first and says so
 */
function PasoTrasfondo({ mio, elegidos, disabled, onGuardar }: { mio: CreacionPersonaje; elegidos: Record<string, number>; disabled: boolean; onGuardar: (cambio: Cambio) => void }) {
  const [pendiente, setPendiente] = useState<string | null>(null)
  const hayPosteriores = mio.ascendencia !== ''
    || Object.values(mio.creacionDatos).some((v) => v !== '')
    || mio.legadoRespuestas.some((r) => r.trim() !== '')
  const reiniciar = (legado: string): Cambio => ({ legado, ascendencia: '', creacionDatos: {}, legadoRespuestas: [] })
  const elegir = (id: string) => {
    if (id === mio.legado) return
    if (hayPosteriores) setPendiente(id)
    else onGuardar({ legado: id })
  }
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <PasoLegado value={mio.legado} disabled={disabled} onChange={elegir} elegidos={elegidos} />
      </Suspense>
      <ConfirmDialog
        open={pendiente !== null}
        title="¿Cambiar de trasfondo?"
        message="Cambiar el trasfondo reinicia todo lo que viene después: la ascendencia, la alomancia y las tres preguntas (origen, impulso y meta). Esos pasos vuelven a quedar pendientes y tendrás que responderlos de nuevo. El nombre se conserva."
        confirmLabel="Cambiar"
        onConfirm={() => { if (pendiente !== null) onGuardar(reiniciar(pendiente)); setPendiente(null) }}
        onCancel={() => setPendiente(null)}
      />
    </>
  )
}

function PasoAscendencia({ valor, disabled, onChange }: { valor: string; disabled: boolean; onChange: (id: string) => void }) {
  const cfg = useWorldConfig()
  const era = useEra()
  const opciones = cfg.ascendencias.filter((a) => !a.eras || !era || a.eras.includes(era))
  return (
    <ul style={{ listStyle: 'none', ...stack(8) }}>
      {opciones.map((a) => {
        const selected = valor === a.id
        return (
          <li key={a.id}>
            <button
              type="button"
              aria-pressed={selected}
              disabled={disabled}
              onClick={() => onChange(a.id)}
              className="ui-card ui-card--interactive"
              style={{
                ...buttonReset, width: '100%', display: 'flex', alignItems: 'center', gap: 12, minHeight: 52, padding: '10px 14px',
                borderRadius: radius.lg, border: `1px solid ${selected ? a.tone.border : c.border}`, background: selected ? a.tone.bg : c.s1,
              }}
            >
              <span aria-hidden style={{ display: 'inline-flex', color: selected ? a.tone.fg : c.muted }}>{a.icono(20)}</span>
              <span style={{ flex: 1, minWidth: 0, textAlign: 'left', fontWeight: 600, color: c.text }}>{a.label}</span>
              {selected && <Check size={18} aria-hidden style={{ color: a.tone.fg }} />}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

/** One question of the legacy with its examples; it needs the legacy chosen first */
function PasoPregunta({ indice, mio, disabled, onGuardar }: { indice: number; mio: CreacionPersonaje; disabled: boolean; onGuardar: (texto: string) => void }) {
  const legados = useLegados()
  const def = legados.find((l) => l.id === mio.legado)
  const guardado = mio.legadoRespuestas[indice] ?? ''
  const [texto, setTexto] = useState(guardado)
  if (!def) {
    return <p style={{ fontSize: fs.sm, color: c.muted }}>Elige antes tu trasfondo: la pregunta depende de él.</p>
  }
  const cambiado = texto.trim() !== guardado.trim()
  return (
    <div style={stack(10)}>
      <Suspense fallback={<Spinner />}>
        <PreguntaLegado
          id={`creacion-pregunta-${indice}`}
          pregunta={def.preguntas[indice] ?? ''}
          ejemplos={def.ejemplos?.[indice]}
          value={texto}
          disabled={disabled}
          onChange={setTexto}
        />
      </Suspense>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button icon={<Save size={16} aria-hidden />} disabled={disabled || !cambiado} onClick={() => onGuardar(texto.trim())}>Guardar respuesta</Button>
      </div>
    </div>
  )
}

/** A step that is a choice among the world's options (the ones the table hides are left out), every option with its short definition */
function PasoDato({ paso, valor, disabled, onChange }: { paso: PasoCreacion; valor: string; disabled: boolean; onChange: (id: string) => void }) {
  const opciones = useOpcionesPaso(paso)
  return <ListaOpciones nombre={paso.titulo} opciones={opciones} valor={valor} disabled={disabled} onChange={onChange} />
}

/**
 * Option cards: the label and, under it, the short definition; the chosen one takes the brand tone. Options with a `grupo` are listed
 * under its heading (groups in order of first appearance), so a long list reads in parts
 */
function ListaOpciones({ nombre, opciones, valor, disabled, onChange }: { nombre: string; opciones: OpcionCreacion[]; valor: string; disabled: boolean; onChange: (id: string) => void }) {
  return (
    <div role="group" aria-label={nombre} style={stack(14)}>
      {agrupar(opciones).map((g) => (
        <div key={g.titulo ?? ''} style={stack(8)}>
          {g.titulo && <p style={eyebrow}>{g.titulo}</p>}
          <ul aria-label={g.titulo ? `${nombre}: ${g.titulo}` : nombre} style={{ listStyle: 'none', ...stack(8) }}>
            {g.opciones.map((o) => {
              const selected = valor === o.id
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => onChange(o.id)}
                    className="ui-card ui-card--interactive"
                    style={{
                      ...buttonReset, width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, minHeight: 52, padding: '10px 14px',
                      borderRadius: radius.lg, border: `1px solid ${selected ? tone.brand.border : c.border}`, background: selected ? tone.brand.bg : c.s1,
                    }}
                  >
                    <span style={{ flex: 1, minWidth: 0, textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontWeight: 600, color: c.text }}>{o.label}</span>
                      {o.descripcion && <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>{o.descripcion}</span>}
                    </span>
                    {selected && <Check size={18} aria-hidden style={{ color: tone.brand.fg, flexShrink: 0, marginTop: 2 }} />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}

/** The options split by `grupo`, keeping the order in which each group first appears (the ungrouped ones form a group without heading) */
function agrupar(opciones: OpcionCreacion[]): { titulo?: string; opciones: OpcionCreacion[] }[] {
  const grupos: { titulo?: string; opciones: OpcionCreacion[] }[] = []
  for (const o of opciones) {
    let g = grupos.find((x) => x.titulo === o.grupo)
    if (!g) {
      g = { titulo: o.grupo, opciones: [] }
      grupos.push(g)
    }
    g.opciones.push(o)
  }
  return grupos
}
