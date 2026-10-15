/** Sheets of the crew header: the crew's data, money (a character contributes or spends), scale and notoriety, sharing and the director's notes. */
import { useState } from 'react'
import { Button, ErrorMessage, Field, Input, Segmented, Select, Sheet, Stepper, Switch, Textarea } from '../../components/ui'
import type { CatalogoBanda, Definicion } from '../../lib/banda/tipos'
import { textoEra } from '../../lib/banda/tipos'
import type { Character, Era, Member } from '../../types'
import { c, fs } from '../../theme'
import type { Actor, BandaEstado } from './estado'
import {
  cambiarEscala, cambiarNotoriedad, corregirTesoreria, crearBanda, editarDatos, gastar, type OpBanda,
} from './operaciones'
import { leerCantidad, textoSuave, useEjecutar } from './etiquetas'
import { CampoCantidad, SelectorActor, TextoRegla } from './piezas'
import type { AporteDatos } from './useBanda'

const pie = (onCancel: () => void, label: string, onOk: () => void, disabled = false) => (
  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
    <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
    <Button onClick={onOk} disabled={disabled}>{label}</Button>
  </div>
)

/** A definition of the header (scale, treasury, notoriety) with how this table plays it and where it comes from */
export function DefinicionTexto({ def, era }: { def: Definicion; era: Era | null }) {
  return <TextoRegla texto={def.texto} casero={def.casero} origen={def.origen} cita={def.cita} era={era} />
}

/** Create the crew, or edit its name, concept and organization type */
export function DatosBandaSheet({ open, onClose, banda, catalogo, era, aplicar }: {
  open: boolean
  onClose: () => void
  /** null = creating it */
  banda: BandaEstado | null
  catalogo: CatalogoBanda
  era: Era | null
  aplicar: (op: OpBanda) => void
}) {
  const [nombre, setNombre] = useState(banda?.nombre ?? '')
  const [concepto, setConcepto] = useState(banda?.concepto ?? '')
  const [tipo, setTipo] = useState(banda?.tipoOrganizacion ?? '')
  const { error, ejecutar } = useEjecutar(aplicar)
  const def = catalogo.tiposOrganizacion.find((t) => t.id === tipo)
  const guardar = () => {
    const datos = { nombre, concepto, tipoOrganizacion: tipo || null }
    ejecutar(banda ? editarDatos(datos) : crearBanda(datos), onClose)
  }
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={banda ? 'Datos de la banda' : 'Crear la hoja de banda'}
      description={banda ? undefined : 'La banda es un personaje más: tendrá su refugio, sus trabajadores y sus contactos.'}
      footer={pie(onClose, banda ? 'Guardar' : 'Crear la banda', guardar, !nombre.trim())}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Field label="Nombre">
          <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Los del canal" autoFocus maxLength={80} />
        </Field>
        <Field label="Concepto" hint="Quiénes son y a qué se dedican, en una frase.">
          <Input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Contrabandistas al servicio de quien pague" maxLength={160} />
        </Field>
        <Field label="Tipo de organización" hint="Da a la banda unas ventajas según su escala (Manual · Cap. 8 › Organizaciones).">
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
            <option value="">Sin decidir</option>
            {catalogo.tiposOrganizacion.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
          </Select>
        </Field>
        {def && <TextoRegla texto={def.resumen} origen={def.origen} cita={def.cita} era={era} />}
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

export type Pista = 'escala' | 'notoriedad'

/** Adjust scale or notoriety (director), with what it means and a reason for the ledger */
export function AjusteSheet({ pista, onClose, banda, catalogo, era, aplicar }: {
  pista: Pista
  onClose: () => void
  banda: BandaEstado
  catalogo: CatalogoBanda
  era: Era | null
  aplicar: (op: OpBanda) => void
}) {
  const [delta, setDelta] = useState(1)
  const [motivo, setMotivo] = useState('')
  const { error, ejecutar } = useEjecutar(aplicar)
  const actual = pista === 'escala' ? banda.escala : banda.notoriedad
  const max = pista === 'escala' ? catalogo.escalaMaxima : catalogo.notoriedadMaxima
  const min = pista === 'escala' ? 1 : 0
  const def = catalogo.definiciones[pista]

  return (
    <Sheet
      open
      onClose={onClose}
      title={def.titulo}
      footer={pie(onClose, 'Guardar', () => ejecutar(pista === 'escala' ? cambiarEscala(delta, motivo) : cambiarNotoriedad(delta, motivo), onClose), !motivo.trim() || delta === 0)}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <DefinicionTexto def={def} era={era} />
        <p style={textoSuave}>Ahora: <strong style={{ color: c.text }}>{actual}</strong> de {max}.</p>
        <Stepper
          label={pista === 'escala' ? 'Cambio de escala' : 'Cambio de notoriedad'}
          value={delta}
          onChange={setDelta}
          min={min - actual}
          max={max - actual}
          format={(v) => (v > 0 ? `+${v}` : String(v))}
        />
        <p style={{ ...textoSuave, fontSize: fs.xs }}>Quedará en {Math.min(max, Math.max(min, actual + delta))}.</p>
        <Field label="Motivo" hint="Queda en el registro de la banda.">
          <Input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={pista === 'escala' ? 'Meta de banda: Reclutamiento' : 'Testigos en el golpe'}
            maxLength={160}
          />
        </Field>
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

type ModoDinero = 'aporte' | 'gasto' | 'correccion'

/**
 * Money of the crew: a character contributes from their purse (the server moves it) or spends from the treasury, always in their
 * name; the director may also correct the treasury, which the ledger says
 */
export function DineroSheet({ onClose, banda, catalogo, era, esDirector, actores, personajes, dinero, aplicar, aportar }: {
  onClose: () => void
  banda: BandaEstado
  catalogo: CatalogoBanda
  era: Era | null
  esDirector: boolean
  actores: Actor[]
  personajes: Character[]
  dinero: (v: number) => string
  aplicar: (op: OpBanda) => void
  aportar: (a: AporteDatos) => void
}) {
  const pjs = actores.filter((a): a is Extract<Actor, { tipo: 'pj' }> => a.tipo === 'pj')
  const [modo, setModo] = useState<ModoDinero>('aporte')
  const [actor, setActor] = useState<Actor | null>(pjs.length === 1 ? pjs[0] : null)
  const [sentido, setSentido] = useState<'suma' | 'resta'>('suma')
  const [cantidadTexto, setCantidadTexto] = useState('')
  const [motivo, setMotivo] = useState('')
  const { error, setError, ejecutar } = useEjecutar(aplicar)

  const cantidad = leerCantidad(cantidadTexto)
  const elegido = actor?.tipo === 'pj' ? personajes.find((p) => p.id === actor.characterId) : undefined
  const bolsa = elegido?.recursos?.[catalogo.claveDinero] ?? 0
  const valida = Number.isFinite(cantidad) && cantidad > 0

  const guardar = () => {
    if (modo === 'aporte') {
      if (!elegido || actor?.tipo !== 'pj') return setError('Elige qué personaje aporta.')
      if (cantidad > bolsa) return setError(`${elegido.name} solo lleva ${dinero(bolsa)}.`)
      try {
        aportar({ characterId: elegido.id, nombre: elegido.name, cantidad, motivo })
        onClose()
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se ha podido aportar.')
      }
    } else if (modo === 'gasto') {
      ejecutar(gastar(cantidad, motivo, actor), onClose)
    } else {
      ejecutar(corregirTesoreria(sentido === 'suma' ? cantidad : -cantidad, motivo), onClose)
    }
  }

  const modos = [
    { value: 'aporte' as const, label: 'Aporte' },
    { value: 'gasto' as const, label: 'Gasto' },
    ...(esDirector ? [{ value: 'correccion' as const, label: 'Corrección' }] : []),
  ]

  return (
    <Sheet
      open
      onClose={onClose}
      title="Tesorería de la banda"
      description={`Hay ${dinero(banda.tesoreria)}.`}
      footer={pie(onClose, modo === 'aporte' ? 'Aportar' : modo === 'gasto' ? 'Gastar' : 'Corregir', guardar, !valida || (modo !== 'aporte' && !motivo.trim()))}
    >
      <div style={{ display: 'grid', gap: 14 }}>
        <Segmented<ModoDinero> ariaLabel="Tipo de movimiento" value={modo} onChange={(m) => { setModo(m); setError(null) }} options={modos} />
        <p style={textoSuave}>
          {modo === 'aporte' && 'El dinero sale de la bolsa del personaje y entra en la tesorería.'}
          {modo === 'gasto' && 'El personaje gasta dinero de la banda: sale de la tesorería y queda apuntado a su nombre.'}
          {modo === 'correccion' && 'Solo para arreglar un error o meter dinero que viene de la historia; el registro lo marca como corrección del director.'}
        </p>
        {modo !== 'correccion' && (
          <SelectorActor actores={actores} valor={actor} onChange={setActor} conDirector={false} etiqueta={modo === 'aporte' ? '¿Quién aporta?' : '¿Quién gasta?'} />
        )}
        {modo === 'aporte' && elegido && (
          <p style={textoSuave}>En su bolsa: <strong style={{ color: c.text }}>{dinero(bolsa)}</strong></p>
        )}
        {modo === 'correccion' && (
          <Segmented<'suma' | 'resta'>
            ariaLabel="Sentido de la corrección"
            value={sentido}
            onChange={setSentido}
            options={[{ value: 'suma', label: 'Sumar' }, { value: 'resta', label: 'Restar' }]}
          />
        )}
        <Field label="Cantidad" hint="Hasta 2 decimales.">
          <CampoCantidad valor={cantidadTexto} onCambio={setCantidadTexto} placeholder="100" autoFocus />
        </Field>
        <Field label="Motivo" hint={modo === 'aporte' ? 'Opcional; queda en el registro.' : 'Queda en el registro de la banda.'}>
          <Input
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            placeholder={modo === 'aporte' ? 'Parte de la paga del encargo' : modo === 'gasto' ? 'Soborno al guardia del muelle' : 'Error al anotar el aporte'}
            maxLength={160}
          />
        </Field>
        {error && <ErrorMessage message={error} />}
        <p style={{ ...textoSuave, fontSize: fs.xs }}>{textoEra(catalogo.definiciones.tesoreria.texto, era)}</p>
      </div>
    </Sheet>
  )
}

/** Who, besides the director, can see the crew sheet and act on it as their character */
export function CompartirSheet({ open, onClose, jugadores, compartidaCon, compartir }: {
  open: boolean
  onClose: () => void
  jugadores: Member[]
  compartidaCon: number[]
  compartir: (ids: number[]) => Promise<void>
}) {
  const [elegidos, setElegidos] = useState<number[]>(compartidaCon)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const alternar = (id: number, si: boolean) => setElegidos((prev) => (si ? [...prev.filter((x) => x !== id), id] : prev.filter((x) => x !== id)))
  const guardar = async () => {
    setGuardando(true)
    setError(null)
    try {
      await compartir(elegidos)
      onClose()
    } catch {
      setError('No se ha podido guardar. Vuelve a intentarlo.')
    } finally {
      setGuardando(false)
    }
  }
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Compartir la banda"
      description="Por defecto solo la ves tú. Los jugadores que marques la verán en su menú y podrán aportar, gastar, contratar y construir como su personaje; tus datos privados nunca les llegan."
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={guardar} loading={guardando}>Guardar</Button>
        </div>
      }
    >
      <div style={{ display: 'grid', gap: 4 }}>
        {jugadores.length === 0 && <p style={textoSuave}>La campaña aún no tiene jugadores.</p>}
        {jugadores.map((j) => (
          <label
            key={j.userId}
            className="ui-row"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 4px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: fs.base, color: c.text }}>{j.displayName}</span>
            <Switch checked={elegidos.includes(j.userId)} onChange={(si) => alternar(j.userId, si)} label={`Compartir con ${j.displayName}`} />
          </label>
        ))}
        {jugadores.length > 1 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <Button size="sm" variant="secondary" onClick={() => setElegidos(jugadores.map((j) => j.userId))}>Todos</Button>
            <Button size="sm" variant="ghost" onClick={() => setElegidos([])}>Ninguno</Button>
          </div>
        )}
        {error && <ErrorMessage message={error} />}
      </div>
    </Sheet>
  )
}

/** The director's private notes about the crew: they never reach a player */
export function NotasSecretasSheet({ open, onClose, notas, guardar }: {
  open: boolean
  onClose: () => void
  notas: string
  guardar: (texto: string) => void
}) {
  const [texto, setTexto] = useState(notas)
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Notas del director"
      description="Solo las ves tú, aunque compartas la banda."
      footer={pie(onClose, 'Guardar', () => { guardar(texto); onClose() })}
    >
      <Field label="Notas">
        <Textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={8} placeholder="Qué sabe el enemigo de la banda, quién traicionará a quién…" />
      </Field>
    </Sheet>
  )
}
