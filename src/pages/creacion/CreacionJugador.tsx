/**
 * The player's view of «Creación de personajes»: the steps of the world, locked until the director releases them, each one answered
 * from here (the name, the legacy, the ancestry, the questions of the legacy, the choices); the server checks the released steps too.
 * Once the director marks «Personaje creado», a card sends the player to the sheet.
 */
import { lazy, Suspense, useState, type CSSProperties, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { Check, Circle, Lock, Save, Users } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { Button, ConfirmDialog, EmptyState, ErrorMessage, Input, PageHeader, Select, Spinner } from '../../components/ui'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { buttonReset, c, card, fs, page, pill, radius, titleText, tone, type Tone } from '../../theme'
import type { Character, CreacionEstado, CreacionPersonaje, UpdateCharacterRequest } from '../../types'
import type { PasoCreacion } from '../../worlds/types'
import { useLegados, useOpcionesPaso } from './hooks'
import { conRespuesta, esNombreProvisional, estadoPaso, pasoHecho, type EstadoPaso } from './pasos'

// Mistborn-only pieces (they import the legacies BY FILE): lazy, like the rest of components/mistborn
const PasoLegado = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.PasoLegado })))
const PreguntaLegado = lazy(() => import('../../components/mistborn').then((m) => ({ default: m.PreguntaLegado })))

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const TONO_ESTADO: Record<EstadoPaso, Tone> = { bloqueado: tone.cuarzo, pendiente: tone.topacio, hecho: tone.esmeralda }
const TEXTO_ESTADO: Record<EstadoPaso, string> = { bloqueado: 'Bloqueado', pendiente: 'Pendiente', hecho: 'Hecho' }
const ICONO_ESTADO = { bloqueado: Lock, pendiente: Circle, hecho: Check } as const

type Cambio = Partial<Pick<UpdateCharacterRequest, 'name' | 'legado' | 'ascendencia' | 'legadoRespuestas' | 'creacionDatos'>>

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
  const guardar = useMutation({
    mutationFn: (cambio: Cambio) => {
      if (!char) return Promise.reject(new Error('Tu personaje aún no se ha cargado. Vuelve a intentarlo.'))
      return charactersApi.update(cId, chId, { ...char, ...cambio } as UpdateCharacterRequest)
    },
    onMutate: () => setError(null),
    onError: (e) => setError(mensajeDe(e)),
    onSuccess: (actualizado) => {
      qc.setQueryData(['character', cId, chId, false], actualizado)
      qc.invalidateQueries({ queryKey: ['creacion', cId] })
      qc.invalidateQueries({ queryKey: ['characters', cId] })
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
          const e = estadoPaso(i, estado.paso, pasoHecho(paso, mio))
          const Icono = ICONO_ESTADO[e]
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
              ) : (
                <div style={{ marginTop: 12 }}>
                  <CuerpoPaso
                    key={`${mio.id}:${mio.legado}`}
                    paso={paso}
                    mio={mio}
                    disabled={soloLectura || ocupado}
                    onGuardar={(cambio) => guardar.mutate(cambio)}
                  />
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

/** The editor of one released step, by its kind. The editors with a draft are keyed by the saved value: a save or a change from elsewhere starts them afresh */
function CuerpoPaso({ paso, mio, disabled, onGuardar }: { paso: PasoCreacion; mio: CreacionPersonaje; disabled: boolean; onGuardar: (cambio: Cambio) => void }) {
  if (paso.id === 'name') return <PasoNombre key={mio.name} valor={mio.name} disabled={disabled} onGuardar={(name) => onGuardar({ name })} />
  if (paso.id === 'legado') return <PasoTrasfondo mio={mio} disabled={disabled} onGuardar={onGuardar} />
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

/** The legacy; changing it with answers written asks first, because the next legacy's questions are different */
function PasoTrasfondo({ mio, disabled, onGuardar }: { mio: CreacionPersonaje; disabled: boolean; onGuardar: (cambio: Cambio) => void }) {
  const [pendiente, setPendiente] = useState<string | null>(null)
  const hayRespuestas = mio.legadoRespuestas.some((r) => r.trim() !== '')
  const elegir = (id: string) => {
    if (id === mio.legado) return
    if (hayRespuestas) setPendiente(id)
    else onGuardar({ legado: id })
  }
  return (
    <>
      <Suspense fallback={<Spinner />}>
        <PasoLegado value={mio.legado} disabled={disabled} onChange={elegir} />
      </Suspense>
      <ConfirmDialog
        open={pendiente !== null}
        title="¿Cambiar de trasfondo?"
        message="Las preguntas del nuevo trasfondo son otras: se borrarán las respuestas que escribiste para el anterior."
        confirmLabel="Cambiar"
        onConfirm={() => { if (pendiente !== null) onGuardar({ legado: pendiente, legadoRespuestas: [] }); setPendiente(null) }}
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

/** A step that is a choice among the world's options (the ones the table hides are left out) */
function PasoDato({ paso, valor, disabled, onChange }: { paso: PasoCreacion; valor: string; disabled: boolean; onChange: (id: string) => void }) {
  const opciones = useOpcionesPaso(paso)
  const elegida = opciones.find((o) => o.id === valor)
  return (
    <div style={stack(8)}>
      <Select value={valor} disabled={disabled || opciones.length === 0} aria-label={paso.titulo} onChange={(e) => onChange(e.target.value)}>
        <option value="">Elige…</option>
        {opciones.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </Select>
      {elegida?.descripcion && <Descripcion>{elegida.descripcion}</Descripcion>}
    </div>
  )
}

function Descripcion({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>{children}</p>
}
