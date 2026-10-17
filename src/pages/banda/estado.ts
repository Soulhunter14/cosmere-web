/**
 * «La banda»: the crew sheet of a campaign, owned by this file and stored as is by the server. Two documents:
 * - `BandaEstado` (CrewSheets.State): what everyone with access reads, and what a player with access may save.
 * - `BandaSecretos` (CrewSheets.GmState): the director's private part (notes, secrets, the private data of each worker, the events of
 *   «Pasar semanas» and their internal value, the real reputation with each faction and its private ledger); the server never sends it
 *   to a player. The players only get the reputation the director shows (`reputacionConocida`).
 * Spec: docs/banda/propuesta.md §4.2. `normalizarBanda` / `normalizarSecretos` accept anything (an empty `{}`, an old or partial document)
 * and return valid documents, so a bad document never breaks the page; the private data of workers saved in the public sheet by the
 * first version move to the private part (`necesitaMigrar`). A document with a higher `version` than `VERSION_BANDA` opens read-only.
 */
import type { RangoPnj } from '../../lib/banda/tipos'
import type { ListaInventario } from '../../types'

export const VERSION_BANDA = 1

/** Cap of the ledger: the most recent movements are kept (the server keeps the same number when it writes a contribution) */
export const MAX_REGISTRO = 400

export type EstadoRefugio = 'seguro' | 'comprometido' | 'perdido'
export type EstadoMejora = 'en-obra' | 'lista' | 'danada'
export type EstadoTrabajador = 'activo' | 'herido' | 'preso' | 'desaparecido' | 'muerto' | 'baja'
export type Relacion = 'hostil' | 'tensa' | 'neutral' | 'aliada' | 'leal'
export type PapelContacto = 'contacto' | 'patrocinador' | 'companero'

/** Who did something in the story: a character, or the director acting as the world */
export type Actor = { tipo: 'pj'; characterId: number; nombre: string } | { tipo: 'director'; nombre: string }

export interface MejoraRefugio {
  id: string
  /** Id of the catalog's upgrade, or 'propia' */
  mejora: string
  /** Only own upgrades */
  nombre?: string
  efecto?: string
  /** Mobiliario selecto 1..3; the rest 1 */
  nivel: number
  estado: EstadoMejora
  /** 0 once it is ready */
  semanasRestantes: number
  /** Weeks of work when it started (what cancelling it refunds is proportional to the weeks left) */
  semanasTotales: number
  /** What was paid for it (0 when it was a reward) */
  coste: number
  /** Who applied it; null in sheets older than this field */
  aplicadaPor: Actor | null
  /** An artisan already shortened this work by one week */
  bonoArtesano: boolean
  /** While it is being repaired (estado 'en-obra' with the weeks of the repair): what the repair cost, refunded in part if it is
   *  cancelled; null otherwise */
  reparacion: { coste: number } | null
}

export interface Refugio {
  id: string
  /** Id of the catalog's refuge type */
  tipo: string
  nombre: string
  ubicacion: string
  principal: boolean
  estado: EstadoRefugio
  mejoras: MejoraRefugio[]
  notas: string
}

/** The public part of a worker: what the players see (name, trade, wage, faction and who hired them) */
export interface Trabajador {
  id: string
  nombre: string
  /** Id of the catalog's trade, or 'propio' */
  oficio: string
  oficioNombre?: string
  /** Per week */
  sueldo: number
  faccion: string | null
  /** ISO date of hiring */
  desde: string
  contratadoPor: Actor | null
  /** Still with the crew (fired, dead or gone = false) */
  enBanda: boolean
  /** The trait everyone saw when they were a candidate («Bebe más de la cuenta») */
  rasgo?: string
}

/**
 * A worker the director generated and published: everyone with access sees it and a character may hire it. Its private part (rank,
 * metal, loyalty, secret) already waits in the director's, under the same id, and becomes the worker's when hired
 */
export interface Candidato {
  id: string
  nombre: string
  /** Id of the catalog's trade, or 'propio' */
  oficio: string
  oficioNombre?: string
  /** Per week */
  sueldo: number
  faccion: string | null
  /** A trait everyone sees */
  rasgo: string
  /** ISO date it was published */
  desde: string
}

/** The private part of a worker, in the director's document */
export interface TrabajadorPrivado {
  rango: RangoPnj
  /** Metal id (official glyph) or null */
  nacidoDelMetal: string | null
  /** 0..3 */
  lealtad: number
  estado: EstadoTrabajador
  /** Refuge (and upgrade) where they work; null = no post */
  puesto: { refugio: string; mejora: string | null } | null
  notas: string
  /** Phases in a row without being paid (a loyal worker takes the first without losing loyalty) */
  fasesSinCobrar: number
}

export interface Contacto {
  id: string
  nombre: string
  faccion: string | null
  relacion: Relacion
  papel: PapelContacto
  /** What a sponsor offers */
  beneficio: string
  notas: string
}

export type Conservacion = 'nuevo' | 'usado'
export type SituacionMercancia = 'guardada' | 'en-venta' | 'vendida' | 'retirada' | 'requisada'
/** Price table the item comes from (the world's catalog: weapons, armor, gear) */
export type TipoCatalogo = 'arma' | 'armadura' | 'equipo'

/** A lot of the crew's store: its units are sold together */
export interface Mercancia {
  id: string
  nombre: string
  /** Price-table item it comes from, with the book price it was valued with; null = something else, valued by the director */
  deCatalogo: { tipo: TipoCatalogo; id: number; precioLibro: number | null } | null
  /**
   * Inventory list its units go back to when a character takes it out (the one they came from); absent = the list of its price-table
   * item, or the gear (see the API: CrewSheetService.ListaDelLote)
   */
  lista?: ListaInventario
  cantidad: number
  conservacion: Conservacion
  /** Market price of one unit (book price × conservation, or the director's valuation); null = waiting to be valued */
  valor: number | null
  /** Asking price of one unit while on sale; null = not on sale */
  precio: number | null
  /** Weeks on sale so far (each «Pasar semanas» adds the weeks it stays unsold) */
  semanasALaVenta: number
  situacion: SituacionMercancia
  traidaPor: Actor | null
  /** ISO date */
  entradaEn: string
  /** Who put it on sale (or last set its price) */
  puestaPor: Actor | null
  /** ISO date it left the store (sold, taken out, seized) */
  cerradaEn: string | null
  /** What the whole lot was sold for */
  importeVenta: number | null
  notas: string
}

export type TipoAviso = 'encargo' | 'rumor' | 'amenaza'
/**
 * publicado → aceptado (in progress) → cumplido | fallido; publicado → rechazado | caducado | descartado.
 * Drafts have no public state: they live in BandaSecretos.borradores until the director publishes them
 */
export type EstadoAviso = 'publicado' | 'aceptado' | 'cumplido' | 'fallido' | 'rechazado' | 'caducado' | 'descartado'
export type VerdadRumor = 'cierto' | 'falso' | 'a-medias'

/**
 * A notice of the crew's mission board («Cartel»): a job, a rumour or a threat the director publishes. The crew as a whole accepts or
 * rejects it (no character: the ledger says which user did it). Spec: docs/banda/propuesta-cartel-misiones.md
 */
export interface Aviso {
  id: string
  tipo: TipoAviso
  titulo: string
  /** The hook, as whoever offers it tells it */
  texto: string
  /** Who offers it: a contact of the crew, or null and `origenTexto` («Un apostador del Foso») */
  origenContacto: string | null
  origenTexto: string
  lugar: string
  /** Announced reward, as text («150 ar y un favor de Hob») */
  recompensa: string
  /** Money paid into the treasury when it is fulfilled; null = no automatic payment */
  pago: number | null
  estado: EstadoAviso
  /** What the crew has found out, in order */
  pistas: string[]
  /** ISO dates */
  publicadoEn: string
  /** When the crew accepted or rejected it */
  decididoEn: string | null
  cerradoEn: string | null
  /** How it ended, seen by everyone («Brannoc pagó la mitad») */
  desenlace: string
}

/** The private part of a notice, in BandaSecretos.cartel under the same id (like candidates) */
export interface AvisoPrivado {
  /** Rumours only: whether it is true; null = not decided yet */
  verdad: VerdadRumor | null
  /** What is really behind it, the real reward… */
  notas: string
  /** What happens if it expires or the crew rejects it; shown to the director when it does */
  siCaduca: string
  /** Weeks left before it expires, only the director knows them; null = no deadline. «Pasar semanas» counts them down */
  semanasRestantes: number | null
}

export type TipoMovimiento = 'tesoreria' | 'notoriedad' | 'reputacion' | 'escala' | 'banda' | 'refugio' | 'mejora'
  | 'trabajador' | 'contacto' | 'semanas' | 'almacen' | 'mercado' | 'cartel' | 'nota'

export interface Movimiento {
  id: string
  /** ISO date */
  en: string
  /** Display name of the user who did it */
  autor: string
  tipo: TipoMovimiento
  /** Who did it in the story (a character or the director) */
  actor?: Actor
  /** Delta of the track it changed (notoriety, reputation, scale) */
  cantidad?: number
  /** Delta of the treasury, when the movement moved money */
  dinero?: number
  /** Faction, worker, upgrade… */
  objetivo?: string
  motivo: string
}

export interface BandaEstado {
  version: 1
  nombre: string
  concepto: string
  /** Id of the catalog's organization type */
  tipoOrganizacion: string | null
  escala: number
  /** In the world's currency (WorldConfig.moneda), 2 decimals */
  tesoreria: number
  notoriedad: number
  /**
   * The reputation the players know: only what the director showed (the real values live in BandaSecretos). Kept up to date by the
   * reputation operations; a faction shown without its name has a random id and `nombre: null`
   */
  reputacionConocida: ReputacionConocida[]
  refugios: Refugio[]
  trabajadores: Trabajador[]
  /** Who the crew may hire: the director publishes them, a character hires them */
  candidatos: Candidato[]
  contactos: Contacto[]
  /** Ids of «once per session» perks already used */
  ventajasUsadas: string[]
  /** What the crew keeps and puts on the black market: every open lot and the most recent closed ones */
  almacen: Mercancia[]
  /** The mission board: every open notice and the most recent closed ones */
  cartel: Aviso[]
  /** Scarcity context chosen the last time weeks passed (the next time starts from it, and the store's market values use it) */
  escasez: string | null
  /** Most recent first, at most MAX_REGISTRO */
  registro: Movimiento[]
}

/** A reputation the director showed to the players */
export interface ReputacionConocida {
  /** The faction's id, or a random one when it is shown without its name (the real id would give it away) */
  id: string
  /** null: shown without its name («Alguien») */
  nombre: string | null
  valor: number
}

/** How the director shows a faction's reputation (a faction with no entry is hidden) */
export type VisibilidadFaccion = { modo: 'visible' } | { modo: 'anonima'; idPublico: string }

export type DecisionSuceso = 'jugado' | 'omitido'

/** An event that came up while weeks passed: only the director knows it and its dice */
export interface SucesoTirado {
  id: string
  /** ISO date */
  en: string
  /** Display name of the user who passed the weeks */
  autor: string
  /** Week of that time it came in (1 = the first one) */
  semana: number
  /** Weeks the director wanted to pass that time */
  deSemanas: number
  /** «¿Pasa algo?»: the roll and the number it needed */
  tirada: number
  umbral: number
  /** «¿Qué pasa?»: the roll on the table and the row it gave */
  tiradaTabla: number
  titulo: string
  texto: string
  provisional: boolean
  /** Played (the weeks stopped there) or skipped (they went on) */
  decision: DecisionSuceso
  /** What it did, once the director validated it («Armería (La Garza): dañada») */
  efectos: string[]
}

export interface BandaSecretos {
  version: 1
  notas: string
  /** Worker or contact id → secret («Informa a Delina») */
  secretos: Record<string, string>
  /** Worker id → private data */
  trabajadores: Record<string, TrabajadorPrivado>
  /** Weeks in a row without an event: the internal value that makes the next one more likely (an event, played or skipped, sets it to 0) */
  semanasSinSuceso: number
  /** Events that came up while weeks passed, most recent first, at most MAX_SUCESOS */
  sucesos: SucesoTirado[]
  /** Faction id → -2..+2: the real reputation (enemy factions are always −2 and not stored) */
  reputacion: Record<string, number>
  /** Factions the director added: their names are private too */
  faccionesPropias: { id: string; nombre: string }[]
  /** Faction id → how the players see it; hidden when it has no entry (the default) */
  visibilidad: Record<string, VisibilidadFaccion>
  /** Movements only the director sees (changes of hidden factions), most recent first, at most MAX_REGISTRO */
  registro: Movimiento[]
  /** Notice id → its private part (drafts and published notices) */
  cartel: Record<string, AvisoPrivado>
  /** Notices the director has not published yet */
  borradores: Aviso[]
}

/** Whether the stored sheet exists: version 0 on the server = never saved */
export const existeBanda = (version: number) => version > 0

// ─── Normalisation ─────────────────────────────────────────────────────────

const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : {})
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : [])
const str = (v: unknown, d = ''): string => (typeof v === 'string' ? v : d)
const num = (v: unknown, d = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : d)
const entre = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const uno = <T extends string>(v: unknown, opciones: readonly T[], d: T): T => (opciones.includes(v as T) ? (v as T) : d)
const strONull = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)

const ESTADOS_REFUGIO = ['seguro', 'comprometido', 'perdido'] as const
const ESTADOS_MEJORA = ['en-obra', 'lista', 'danada'] as const
const ESTADOS_TRABAJADOR = ['activo', 'herido', 'preso', 'desaparecido', 'muerto', 'baja'] as const
const RANGOS = ['secuaz', 'rival', 'jefe'] as const
const RELACIONES = ['hostil', 'tensa', 'neutral', 'aliada', 'leal'] as const
const PAPELES = ['contacto', 'patrocinador', 'companero'] as const
const TIPOS_MOVIMIENTO = [
  'tesoreria', 'notoriedad', 'reputacion', 'escala', 'banda', 'refugio', 'mejora', 'trabajador', 'contacto', 'semanas', 'almacen', 'mercado',
  'cartel', 'nota',
] as const
const TIPOS_AVISO = ['encargo', 'rumor', 'amenaza'] as const
const ESTADOS_AVISO = ['publicado', 'aceptado', 'cumplido', 'fallido', 'rechazado', 'caducado', 'descartado'] as const
const VERDADES = ['cierto', 'falso', 'a-medias'] as const
/** Closed notices the board keeps in its archive (the open ones are always kept) */
export const MAX_HISTORIAL_CARTEL = 100
const SITUACIONES = ['guardada', 'en-venta', 'vendida', 'retirada', 'requisada'] as const
const CONSERVACIONES = ['nuevo', 'usado'] as const
const TIPOS_CATALOGO = ['arma', 'armadura', 'equipo'] as const
const LISTAS_INVENTARIO = ['weapons', 'armor', 'equipment'] as const
/** Closed lots the store keeps in its history (the open ones are always kept) */
export const MAX_HISTORIAL_ALMACEN = 100
const DECISIONES = ['jugado', 'omitido'] as const
/** Events the director's private part keeps */
export const MAX_SUCESOS = 100
/** Fields of a worker that are private: the first version kept them in the public sheet */
const CAMPOS_PRIVADOS = ['rango', 'nacidoDelMetal', 'lealtad', 'estado', 'puesto', 'notas', 'fasesSinCobrar'] as const

const conId = (r: Record<string, unknown>) => str(r.id) || nuevoId()

export function normalizarActor(v: unknown): Actor | null {
  const r = obj(v)
  if (r.tipo === 'pj' && typeof r.characterId === 'number') return { tipo: 'pj', characterId: r.characterId, nombre: str(r.nombre) }
  if (r.tipo === 'director') return { tipo: 'director', nombre: str(r.nombre) }
  return null
}

function normalizarMejora(v: unknown): MejoraRefugio {
  const r = obj(v)
  const semanasRestantes = Math.max(0, Math.round(num(r.semanasRestantes)))
  const estado = uno(r.estado, ESTADOS_MEJORA, 'lista')
  const reparacion = obj(r.reparacion)
  return {
    id: conId(r),
    mejora: str(r.mejora, 'propia'),
    ...(typeof r.nombre === 'string' ? { nombre: r.nombre } : {}),
    ...(typeof r.efecto === 'string' ? { efecto: r.efecto } : {}),
    nivel: Math.max(1, Math.round(num(r.nivel, 1))),
    estado,
    semanasRestantes,
    semanasTotales: Math.max(semanasRestantes, Math.round(num(r.semanasTotales, semanasRestantes))),
    coste: Math.max(0, num(r.coste)),
    aplicadaPor: normalizarActor(r.aplicadaPor),
    bonoArtesano: r.bonoArtesano === true,
    // Only a work in progress can be a repair
    reparacion: estado === 'en-obra' && typeof reparacion.coste === 'number' ? { coste: Math.max(0, num(reparacion.coste)) } : null,
  }
}

function normalizarRefugio(v: unknown): Refugio {
  const r = obj(v)
  return {
    id: conId(r),
    tipo: str(r.tipo, 'basico'),
    nombre: str(r.nombre),
    ubicacion: str(r.ubicacion),
    principal: r.principal === true,
    estado: uno(r.estado, ESTADOS_REFUGIO, 'seguro'),
    mejoras: arr(r.mejoras).map(normalizarMejora),
    notas: str(r.notas),
  }
}

function normalizarTrabajador(v: unknown): Trabajador {
  const r = obj(v)
  // The first version kept `estado` in the public sheet: someone fired or dead is no longer with the crew
  const enBanda = typeof r.enBanda === 'boolean' ? r.enBanda : !(r.estado === 'baja' || r.estado === 'muerto')
  return {
    id: conId(r),
    nombre: str(r.nombre),
    oficio: str(r.oficio, 'propio'),
    ...(typeof r.oficioNombre === 'string' ? { oficioNombre: r.oficioNombre } : {}),
    sueldo: Math.max(0, num(r.sueldo)),
    faccion: strONull(r.faccion),
    desde: str(r.desde, new Date().toISOString()),
    contratadoPor: normalizarActor(r.contratadoPor),
    enBanda,
    ...(typeof r.rasgo === 'string' && r.rasgo ? { rasgo: r.rasgo } : {}),
  }
}

function normalizarCandidato(v: unknown): Candidato {
  const r = obj(v)
  return {
    id: conId(r),
    nombre: str(r.nombre),
    oficio: str(r.oficio, 'propio'),
    ...(typeof r.oficioNombre === 'string' ? { oficioNombre: r.oficioNombre } : {}),
    sueldo: Math.max(0, num(r.sueldo)),
    faccion: strONull(r.faccion),
    rasgo: str(r.rasgo),
    desde: str(r.desde, new Date().toISOString()),
  }
}

function normalizarPrivado(v: unknown): TrabajadorPrivado {
  const r = obj(v)
  const p = obj(r.puesto)
  return {
    rango: uno(r.rango, RANGOS, 'secuaz'),
    nacidoDelMetal: strONull(r.nacidoDelMetal),
    lealtad: entre(Math.round(num(r.lealtad, 1)), 0, 3),
    estado: uno(r.estado, ESTADOS_TRABAJADOR, 'activo'),
    puesto: typeof p.refugio === 'string' && p.refugio ? { refugio: p.refugio, mejora: strONull(p.mejora) } : null,
    notas: str(r.notas),
    fasesSinCobrar: Math.max(0, Math.round(num(r.fasesSinCobrar))),
  }
}

function normalizarContacto(v: unknown): Contacto {
  const r = obj(v)
  return {
    id: conId(r),
    nombre: str(r.nombre),
    faccion: strONull(r.faccion),
    relacion: uno(r.relacion, RELACIONES, 'neutral'),
    papel: uno(r.papel, PAPELES, 'contacto'),
    beneficio: str(r.beneficio),
    notas: str(r.notas),
  }
}

function normalizarMovimiento(v: unknown): Movimiento {
  const r = obj(v)
  const actor = normalizarActor(r.actor)
  return {
    id: conId(r),
    en: str(r.en, new Date(0).toISOString()),
    autor: str(r.autor),
    tipo: uno(r.tipo, TIPOS_MOVIMIENTO, 'nota'),
    ...(actor ? { actor } : {}),
    ...(typeof r.cantidad === 'number' && Number.isFinite(r.cantidad) ? { cantidad: r.cantidad } : {}),
    ...(typeof r.dinero === 'number' && Number.isFinite(r.dinero) ? { dinero: r.dinero } : {}),
    ...(typeof r.objetivo === 'string' ? { objetivo: r.objetivo } : {}),
    motivo: str(r.motivo),
  }
}

/** An amount of money (≥ 0, 2 decimals), or null */
const importe = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.round(v * 100) / 100 : null)

function normalizarMercancia(v: unknown): Mercancia {
  const r = obj(v)
  const cat = obj(r.deCatalogo)
  const precio = importe(r.precio)
  // A lot on sale without a price goes back to the shelf
  const situacion = r.situacion === 'en-venta' && precio === null ? 'guardada' : uno(r.situacion, SITUACIONES, 'guardada')
  return {
    id: conId(r),
    nombre: str(r.nombre),
    deCatalogo: typeof cat.id === 'number' ? { tipo: uno(cat.tipo, TIPOS_CATALOGO, 'equipo'), id: cat.id, precioLibro: importe(cat.precioLibro) } : null,
    ...(LISTAS_INVENTARIO.includes(r.lista as ListaInventario) ? { lista: r.lista as ListaInventario } : {}),
    cantidad: entre(Math.round(num(r.cantidad, 1)), 1, 999),
    conservacion: uno(r.conservacion, CONSERVACIONES, 'nuevo'),
    valor: importe(r.valor),
    precio: situacion === 'en-venta' ? precio : null,
    semanasALaVenta: Math.max(0, Math.round(num(r.semanasALaVenta))),
    situacion,
    traidaPor: normalizarActor(r.traidaPor),
    entradaEn: str(r.entradaEn, new Date().toISOString()),
    puestaPor: normalizarActor(r.puestaPor),
    cerradaEn: strONull(r.cerradaEn),
    importeVenta: importe(r.importeVenta),
    notas: str(r.notas),
  }
}

/** The lot left the store: sold, taken out or seized */
export const loteCerrado = (m: Pick<Mercancia, 'situacion'>) => m.situacion === 'vendida' || m.situacion === 'retirada' || m.situacion === 'requisada'

/**
 * What makes two open lots the same goods, whoever brought each: the item (its price-table entry, or its inventory list and name), the
 * conservation, the value and the situation, and the price when on sale. The API joins lots with the same rule
 * (CrewSheetService.ClaveMercancia)
 */
export function claveMercancia(m: Mercancia): string {
  const item = m.deCatalogo ? `${m.deCatalogo.tipo}:${m.deCatalogo.id}` : `${m.lista ?? 'otra'}:${m.nombre}`
  return [item, m.nombre, m.conservacion, m.valor ?? '-', m.situacion, m.situacion === 'en-venta' ? (m.precio ?? '-') : '-'].join('|')
}

const mismoActor = (a: Actor | null, b: Actor | null) =>
  !!a && !!b && (a.tipo === 'pj' ? b.tipo === 'pj' && a.characterId === b.characterId : b.tipo === 'director')

/**
 * Puts a lot in the store, joined to the open lot of the same goods when there is one (the ledger says who brought each): that lot keeps
 * its id and its weeks on sale, adds the units (up to 999) and the notes, and keeps who brought it only when it is the same
 */
export function juntarEnAlmacen(almacen: Mercancia[], nuevo: Mercancia): Mercancia[] {
  const clave = loteCerrado(nuevo) ? null : claveMercancia(nuevo)
  const i = clave === null ? -1 : almacen.findIndex((m) => !loteCerrado(m) && claveMercancia(m) === clave && m.cantidad + nuevo.cantidad <= 999)
  if (i < 0) return [...almacen, nuevo]
  return almacen.map((m, j) => (j !== i ? m : {
    ...m,
    cantidad: m.cantidad + nuevo.cantidad,
    traidaPor: mismoActor(m.traidaPor, nuevo.traidaPor) ? m.traidaPor : null,
    puestaPor: m.puestaPor && nuevo.puestaPor && !mismoActor(m.puestaPor, nuevo.puestaPor) ? null : (m.puestaPor ?? nuevo.puestaPor),
    notas: [m.notas, nuevo.notas].filter((t, k, todas) => t && todas.indexOf(t) === k).join(' · '),
  }))
}

/** Every open lot, and the MAX_HISTORIAL_ALMACEN closed ones that left the store last */
function recortarAlmacen(lotes: Mercancia[]): Mercancia[] {
  const cerrados = lotes.filter(loteCerrado)
  if (cerrados.length <= MAX_HISTORIAL_ALMACEN) return lotes
  const quedan = new Set([...cerrados].sort((a, b) => (b.cerradaEn ?? '').localeCompare(a.cerradaEn ?? '')).slice(0, MAX_HISTORIAL_ALMACEN).map((m) => m.id))
  return lotes.filter((m) => !loteCerrado(m) || quedan.has(m.id))
}

/** The notice left the board's open part: fulfilled, failed, rejected, expired or withdrawn */
export const avisoCerrado = (a: Pick<Aviso, 'estado'>) => a.estado !== 'publicado' && a.estado !== 'aceptado'

/** Weeks left of a deadline (≥ 0), or null */
const semanasPlazo = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : null)

export function normalizarAviso(v: unknown): Aviso {
  const r = obj(v)
  return {
    id: conId(r),
    tipo: uno(r.tipo, TIPOS_AVISO, 'encargo'),
    titulo: str(r.titulo),
    texto: str(r.texto),
    origenContacto: strONull(r.origenContacto),
    origenTexto: str(r.origenTexto),
    lugar: str(r.lugar),
    recompensa: str(r.recompensa),
    pago: importe(r.pago),
    estado: uno(r.estado, ESTADOS_AVISO, 'publicado'),
    pistas: arr(r.pistas).filter((p): p is string => typeof p === 'string' && !!p),
    publicadoEn: str(r.publicadoEn, new Date().toISOString()),
    decididoEn: strONull(r.decididoEn),
    cerradoEn: strONull(r.cerradoEn),
    desenlace: str(r.desenlace),
  }
}

function normalizarAvisoPrivado(v: unknown): AvisoPrivado {
  const r = obj(v)
  return {
    verdad: VERDADES.includes(r.verdad as VerdadRumor) ? (r.verdad as VerdadRumor) : null, notas: str(r.notas), siCaduca: str(r.siCaduca),
    semanasRestantes: semanasPlazo(r.semanasRestantes),
  }
}

/** Every open notice, and the MAX_HISTORIAL_CARTEL closed ones that closed last */
export function recortarCartel(avisos: Aviso[]): Aviso[] {
  const cerrados = avisos.filter(avisoCerrado)
  if (cerrados.length <= MAX_HISTORIAL_CARTEL) return avisos
  const quedan = new Set([...cerrados].sort((a, b) => (b.cerradoEn ?? '').localeCompare(a.cerradoEn ?? '')).slice(0, MAX_HISTORIAL_CARTEL).map((a) => a.id))
  return avisos.filter((a) => !avisoCerrado(a) || quedan.has(a.id))
}

const normalizarReputacion = (v: unknown): Record<string, number> => {
  const reputacion: Record<string, number> = {}
  for (const [k, n] of Object.entries(obj(v))) {
    if (typeof n === 'number' && Number.isFinite(n)) reputacion[k] = entre(Math.round(n), -2, 2)
  }
  return reputacion
}

const normalizarFaccionesPropias = (v: unknown) =>
  arr(v).map(obj).filter((f) => typeof f.id === 'string' && typeof f.nombre === 'string').map((f) => ({ id: f.id as string, nombre: f.nombre as string }))

function normalizarVisibilidad(v: unknown): Record<string, VisibilidadFaccion> {
  const visibilidad: Record<string, VisibilidadFaccion> = {}
  for (const [k, x] of Object.entries(obj(v))) {
    const r = obj(x)
    if (r.modo === 'visible') visibilidad[k] = { modo: 'visible' }
    else if (r.modo === 'anonima' && typeof r.idPublico === 'string' && r.idPublico) visibilidad[k] = { modo: 'anonima', idPublico: r.idPublico }
  }
  return visibilidad
}

/** A valid public sheet from whatever the server stored (private fields of old workers and the old public reputation are left out: see normalizarSecretos) */
export function normalizarBanda(raw: unknown): BandaEstado {
  const r = obj(raw)
  return {
    version: VERSION_BANDA,
    nombre: str(r.nombre),
    concepto: str(r.concepto),
    tipoOrganizacion: strONull(r.tipoOrganizacion),
    escala: Math.max(1, Math.round(num(r.escala, 1))),
    tesoreria: Math.round(num(r.tesoreria) * 100) / 100,
    notoriedad: Math.max(0, Math.round(num(r.notoriedad))),
    reputacionConocida: arr(r.reputacionConocida).map(obj).filter((f) => typeof f.id === 'string' && f.id)
      .map((f) => ({ id: f.id as string, nombre: strONull(f.nombre), valor: entre(Math.round(num(f.valor)), -2, 2) })),
    refugios: arr(r.refugios).map(normalizarRefugio),
    trabajadores: arr(r.trabajadores).map(normalizarTrabajador),
    candidatos: arr(r.candidatos).map(normalizarCandidato),
    contactos: arr(r.contactos).map(normalizarContacto),
    ventajasUsadas: arr(r.ventajasUsadas).filter((v): v is string => typeof v === 'string'),
    // Lots of the same goods saved apart (before they were joined) become one
    almacen: recortarAlmacen(arr(r.almacen).map(normalizarMercancia).reduce<Mercancia[]>(juntarEnAlmacen, [])),
    cartel: recortarCartel(arr(r.cartel).map(normalizarAviso)),
    escasez: strONull(r.escasez),
    registro: arr(r.registro).map(normalizarMovimiento).slice(0, MAX_REGISTRO),
  }
}

/**
 * The director's private part. `rawEstado` is the public sheet: the private fields its workers still carry (first version) and the
 * reputation and own factions it kept before they became private are taken from there when the private part has nothing for them yet
 */
export function normalizarSecretos(raw: unknown, rawEstado?: unknown): BandaSecretos {
  const r = obj(raw)
  const viejo = obj(rawEstado)
  const secretos: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj(r.secretos))) if (typeof v === 'string' && v) secretos[k] = v
  const trabajadores: Record<string, TrabajadorPrivado> = {}
  for (const [k, v] of Object.entries(obj(r.trabajadores))) trabajadores[k] = normalizarPrivado(v)
  const cartel: Record<string, AvisoPrivado> = {}
  for (const [k, v] of Object.entries(obj(r.cartel))) cartel[k] = normalizarAvisoPrivado(v)
  // The first version kept the deadline in the public notice: it moves here (the director's next save takes it out of the public one)
  for (const a of arr(viejo.cartel).map(obj)) {
    const id = str(a.id)
    const semanas = semanasPlazo(a.semanasRestantes)
    if (id && semanas !== null && !('semanasRestantes' in obj(obj(r.cartel)[id]))) {
      cartel[id] = { ...(cartel[id] ?? normalizarAvisoPrivado({})), semanasRestantes: semanas }
    }
  }
  for (const t of arr(obj(rawEstado).trabajadores).map(obj)) {
    const id = str(t.id)
    if (id && !trabajadores[id] && CAMPOS_PRIVADOS.some((c) => c in t)) trabajadores[id] = normalizarPrivado(t)
    // A player who fires only saves the public sheet: whoever left the crew there is gone, without a post, here too
    const p = trabajadores[id]
    if (p && !normalizarTrabajador(t).enBanda && p.estado !== 'baja' && p.estado !== 'muerto') trabajadores[id] = { ...p, estado: 'baja', puesto: null }
  }
  return {
    version: 1, notas: str(r.notas), secretos, trabajadores,
    semanasSinSuceso: Math.max(0, Math.round(num(r.semanasSinSuceso))),
    sucesos: arr(r.sucesos).map(normalizarSuceso).slice(0, MAX_SUCESOS),
    reputacion: normalizarReputacion('reputacion' in r ? r.reputacion : viejo.reputacion),
    faccionesPropias: normalizarFaccionesPropias('faccionesPropias' in r ? r.faccionesPropias : viejo.faccionesPropias),
    visibilidad: normalizarVisibilidad(r.visibilidad),
    registro: arr(r.registro).map(normalizarMovimiento).slice(0, MAX_REGISTRO),
    cartel,
    // A draft has no public state yet: it is always saved as 'publicado' (what it becomes when published)
    borradores: arr(r.borradores).map(normalizarAviso).map((a) => ({ ...a, estado: 'publicado' as const })),
  }
}

function normalizarSuceso(v: unknown): SucesoTirado {
  const r = obj(v)
  const semana = Math.max(1, Math.round(num(r.semana, 1)))
  return {
    id: conId(r),
    en: str(r.en, new Date(0).toISOString()),
    autor: str(r.autor),
    semana,
    deSemanas: Math.max(semana, Math.round(num(r.deSemanas, semana))),
    tirada: Math.round(num(r.tirada)),
    umbral: Math.round(num(r.umbral)),
    tiradaTabla: Math.round(num(r.tiradaTabla)),
    titulo: str(r.titulo, 'Suceso'),
    texto: str(r.texto),
    provisional: r.provisional === true,
    decision: uno(r.decision, DECISIONES, 'jugado'),
    efectos: arr(r.efectos).filter((e): e is string => typeof e === 'string'),
  }
}

/**
 * The stored public sheet still carries private fields of its workers (first version) or the reputation and own factions it kept before
 * they became private: the director's next save cleans it
 */
export const necesitaMigrar = (raw: unknown): boolean =>
  arr(obj(raw).trabajadores).some((t) => CAMPOS_PRIVADOS.some((c) => c in obj(t)))
  || 'reputacion' in obj(raw) || 'faccionesPropias' in obj(raw)
  || arr(obj(raw).cartel).some((a) => 'semanasRestantes' in obj(a))

/** An empty private part, for whoever cannot read the real one (a player) */
export const secretosVacios = (): BandaSecretos => ({
  version: 1, notas: '', secretos: {}, trabajadores: {}, semanasSinSuceso: 0, sucesos: [], reputacion: {}, faccionesPropias: [], visibilidad: {}, registro: [],
  cartel: {}, borradores: [],
})

/** Version of the stored document: a newer app saved it, so this one must not overwrite it */
export const versionDocumento = (raw: unknown): number => num(obj(raw).version, VERSION_BANDA)

/** The sheet of a new crew */
export function bandaNueva(datos: { nombre: string; concepto: string; tipoOrganizacion: string | null }): BandaEstado {
  return {
    ...normalizarBanda({}),
    nombre: datos.nombre.trim(),
    concepto: datos.concepto.trim(),
    tipoOrganizacion: datos.tipoOrganizacion,
  }
}

/** Short unique id for the items of the sheet */
export function nuevoId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 12)
    : Math.random().toString(36).slice(2, 14)
}

/** «2 × Catalejo», «Cuenta de atium» */
export const nombreLote = (m: Pick<Mercancia, 'cantidad' | 'nombre'>) => (m.cantidad > 1 ? `${m.cantidad} × ${m.nombre}` : m.nombre)

/** «Kelsier», «el director (Xavi)» */
export const nombreActor = (a: Actor | null | undefined) => (!a ? '' : a.tipo === 'pj' ? a.nombre : `el director${a.nombre ? ` (${a.nombre})` : ''}`)
