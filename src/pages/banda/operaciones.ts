/**
 * Operations on the crew sheet: pure functions `(doc, ctx) => doc` that validate (throwing `ErrorBanda` with the text the page shows) and
 * write their movement in the ledger, with who did it (`Actor`). `useBanda` applies them optimistically and, after a 409, again on the
 * sheet stored on the server, so the same operation must work on any version of the document. Operations a player may run (gastar,
 * contratar, construirMejora, cancelarObra, the store's entrarMercancia, ponerALaVenta, cambiarPrecio, retirarDeLaVenta,
 * sacarDelAlmacen and the board's aceptarAviso, rechazarAviso, anadirPista) only touch the public sheet: a player never has the
 * director's private part.
 * Spec: docs/banda/propuesta.md (§2, §4.5). The contribution of money from a character's purse is done by the server (crewApi.aportar).
 */
import type { Era } from '../../types'
import { enEra, type CatalogoBanda } from '../../lib/banda/tipos'
import {
  MAX_REGISTRO, avisoCerrado, bandaNueva, juntarEnAlmacen, loteCerrado, nombreLote, nuevoId, recortarCartel,
  type Actor, type Aviso, type AvisoPrivado, type BandaEstado, type TipoAviso, type BandaSecretos, type Conservacion, type Contacto, type EstadoRefugio, type MejoraRefugio, type Mercancia,
  type Movimiento, type Refugio, type ReputacionConocida, type Trabajador, type TrabajadorPrivado, type VisibilidadFaccion,
} from './estado'

/** The sheet and the director's private part, written together (a player's private part is always empty and never saved) */
export interface DocBanda {
  banda: BandaEstado
  secretos: BandaSecretos
}

export interface CtxBanda {
  /** Display name of the user who acts */
  autor: string
  /** ISO date of the operation */
  ahora: string
  catalogo: CatalogoBanda
  era: Era | null
  /** Writes an amount with the world's currency («50 ar») */
  dinero: (valor: number) => string
}

export type OpBanda = (doc: DocBanda, ctx: CtxBanda) => DocBanda

/** A refused operation: its message is shown as is */
export class ErrorBanda extends Error {}

// ─── Helpers ───────────────────────────────────────────────────────────────

const redondear = (v: number) => Math.round(v * 100) / 100

export function anotar(b: BandaEstado, ctx: CtxBanda, mov: Omit<Movimiento, 'id' | 'en' | 'autor'>): BandaEstado {
  return { ...b, registro: [{ id: nuevoId(), en: ctx.ahora, autor: ctx.autor, ...mov }, ...b.registro].slice(0, MAX_REGISTRO) }
}

/** A movement only the director sees: it goes to the private ledger */
export function anotarPrivado(s: BandaSecretos, ctx: CtxBanda, mov: Omit<Movimiento, 'id' | 'en' | 'autor'>): BandaSecretos {
  return { ...s, registro: [{ id: nuevoId(), en: ctx.ahora, autor: ctx.autor, ...mov }, ...s.registro].slice(0, MAX_REGISTRO) }
}

function pagar(b: BandaEstado, ctx: CtxBanda, coste: number): BandaEstado {
  const tesoreria = redondear(b.tesoreria - coste)
  if (tesoreria < 0) throw new ErrorBanda(`La tesorería no llega: faltan ${ctx.dinero(-tesoreria)}.`)
  return { ...b, tesoreria }
}

const conBanda = (doc: DocBanda, banda: BandaEstado): DocBanda => ({ ...doc, banda })

const exigirTexto = (texto: string, campo: string) => {
  if (!texto.trim()) throw new ErrorBanda(`Falta ${campo}.`)
  return texto.trim()
}

const exigirActor = (actor: Actor | null): Actor => {
  if (!actor) throw new ErrorBanda('Elige qué personaje lo hace.')
  return actor
}

/** Upgrades that take room in a refuge: Movilidad is the vehicle itself and Mobiliario selecto counts once whatever its level */
export const capacidadUsada = (r: Refugio) => r.mejoras.filter((m) => m.mejora !== 'movilidad').length

/** Workers who take a place in the crew: everyone still with it (fired, dead or gone do not) */
export const ocupaPlaza = (t: Trabajador) => t.enBanda

export const topeTrabajadores = (b: BandaEstado, cat: CatalogoBanda) => cat.trabajadoresPorEscala * b.escala

export const nombreMejora = (m: MejoraRefugio, cat: CatalogoBanda) =>
  m.mejora === 'propia' ? (m.nombre ?? 'Mejora propia') : (cat.mejorasRefugio.find((d) => d.id === m.mejora)?.nombre ?? m.mejora)

export const nombreOficio = (t: Pick<Trabajador, 'oficio' | 'oficioNombre'>, cat: CatalogoBanda) =>
  t.oficio === 'propio' ? (t.oficioNombre ?? 'Oficio propio') : (cat.oficios.find((o) => o.id === t.oficio)?.nombre ?? t.oficio)

/** Name of a faction: the catalog's, one of the director's own or, for a player, one the director showed with its name; null when unknown */
export const nombreFaccion = (id: string, doc: DocBanda, cat: CatalogoBanda): string | null =>
  cat.facciones.find((f) => f.id === id)?.nombre
  ?? doc.secretos.faccionesPropias.find((f) => f.id === id)?.nombre
  ?? doc.banda.reputacionConocida.find((f) => f.id === id && f.nombre)?.nombre
  ?? null

/** Factions added by the director: all of them for the director; for a player, only the ones shown with their name */
export function faccionesPropiasDe(doc: DocBanda, cat: CatalogoBanda): { id: string; nombre: string }[] {
  const conocidas = doc.banda.reputacionConocida
    .filter((f) => f.nombre && !cat.facciones.some((d) => d.id === f.id) && !doc.secretos.faccionesPropias.some((p) => p.id === f.id))
    .map((f) => ({ id: f.id, nombre: f.nombre as string }))
  return [...doc.secretos.faccionesPropias, ...conocidas]
}

/** The real reputation with a faction (the director's): enemy factions are always −2 */
export const valorReputacion = (id: string, secretos: BandaSecretos, cat: CatalogoBanda) =>
  cat.facciones.find((f) => f.id === id)?.enemiga ? -2 : (secretos.reputacion[id] ?? 0)

export type ModoVisibilidad = 'oculta' | VisibilidadFaccion['modo']

export const modoVisibilidad = (id: string, secretos: BandaSecretos): ModoVisibilidad => secretos.visibilidad[id]?.modo ?? 'oculta'

/** Wage the catalog suggests for a tier (plus the metalborn surcharge) in the campaign's era */
export const sueldoSugerido = (cat: CatalogoBanda, era: Era | null, rango: TrabajadorPrivado['rango'], nacidoDelMetal: boolean) =>
  (enEra(cat.sueldoPorRango[rango], era) ?? 0) + (nacidoDelMetal ? (enEra(cat.sueldoNacidoDelMetal, era) ?? 0) : 0)

/**
 * The private data of a worker: what the director saved, or what a fresh hire starts with (the trade's tier and metal); someone a
 * player hired and fired before the director saved anything about them starts as gone
 */
export function privadoDe(t: Pick<Trabajador, 'id' | 'oficio'> & { enBanda?: boolean }, secretos: BandaSecretos, cat: CatalogoBanda): TrabajadorPrivado {
  const guardado = secretos.trabajadores[t.id]
  if (guardado) return guardado
  const oficio = cat.oficios.find((o) => o.id === t.oficio)
  return {
    rango: oficio?.rango ?? 'secuaz', nacidoDelMetal: oficio?.metal ?? null, lealtad: 1, estado: t.enBanda === false ? 'baja' : 'activo', puesto: null,
    notas: '', fasesSinCobrar: 0,
  }
}

// ─── The crew ──────────────────────────────────────────────────────────────

/** The first save: a new sheet (whatever was there, an empty `{}`, is replaced) */
export const crearBanda = (datos: { nombre: string; concepto: string; tipoOrganizacion: string | null }): OpBanda => (doc, ctx) => {
  const nombre = exigirTexto(datos.nombre, 'el nombre de la banda')
  const tipo = datos.tipoOrganizacion ? ctx.catalogo.tiposOrganizacion.find((t) => t.id === datos.tipoOrganizacion) : null
  const b = bandaNueva({ nombre, concepto: datos.concepto, tipoOrganizacion: tipo ? tipo.id : null })
  return conBanda(doc, anotar(b, ctx, { tipo: 'banda', motivo: `Nace la banda: ${nombre}${tipo ? ` · ${tipo.nombre}` : ''}` }))
}

export const editarDatos = (datos: { nombre: string; concepto: string; tipoOrganizacion: string | null }): OpBanda => (doc, ctx) => {
  const nombre = exigirTexto(datos.nombre, 'el nombre de la banda')
  const tipo = datos.tipoOrganizacion ? ctx.catalogo.tiposOrganizacion.find((t) => t.id === datos.tipoOrganizacion) : null
  const b = { ...doc.banda, nombre, concepto: datos.concepto.trim(), tipoOrganizacion: tipo ? tipo.id : null }
  return conBanda(doc, anotar(b, ctx, { tipo: 'banda', motivo: `Datos de la banda: ${nombre}${tipo ? ` · ${tipo.nombre}` : ''}` }))
}

export const cambiarEscala = (delta: number, motivo: string): OpBanda => (doc, ctx) => {
  const escala = Math.min(ctx.catalogo.escalaMaxima, Math.max(1, doc.banda.escala + delta))
  if (escala === doc.banda.escala) throw new ErrorBanda(`La escala ya está en ${escala}.`)
  return conBanda(doc, anotar({ ...doc.banda, escala }, ctx, { tipo: 'escala', cantidad: escala - doc.banda.escala, motivo: exigirTexto(motivo, 'el motivo') }))
}

export const cambiarNotoriedad = (delta: number, motivo: string): OpBanda => (doc, ctx) => {
  const notoriedad = Math.min(ctx.catalogo.notoriedadMaxima, Math.max(0, doc.banda.notoriedad + delta))
  if (notoriedad === doc.banda.notoriedad) throw new ErrorBanda(`La notoriedad ya está en ${notoriedad}.`)
  return conBanda(doc, anotar({ ...doc.banda, notoriedad }, ctx, {
    tipo: 'notoriedad', cantidad: notoriedad - doc.banda.notoriedad, motivo: exigirTexto(motivo, 'el motivo'),
  }))
}

// ─── Money (the contribution from a purse is done by the server) ──────────

/** A character spends the crew's money: it leaves the treasury, in their name */
export const gastar = (cantidad: number, motivo: string, actor: Actor | null): OpBanda => (doc, ctx) => {
  const quien = exigirActor(actor)
  if (!Number.isFinite(cantidad) || cantidad <= 0) throw new ErrorBanda('Indica una cantidad mayor que 0.')
  const valor = redondear(cantidad)
  const b = pagar(doc.banda, ctx, valor)
  return conBanda(doc, anotar(b, ctx, { tipo: 'tesoreria', actor: quien, dinero: -valor, motivo: exigirTexto(motivo, 'el motivo del gasto') }))
}

/** The director fixes the treasury (a mistake, money that comes from the story): it says so in the ledger */
export const corregirTesoreria = (cantidad: number, motivo: string): OpBanda => (doc, ctx) => {
  if (!Number.isFinite(cantidad) || cantidad === 0) throw new ErrorBanda('Indica una cantidad distinta de 0.')
  const valor = redondear(cantidad)
  const b = valor < 0 ? pagar(doc.banda, ctx, -valor) : { ...doc.banda, tesoreria: redondear(doc.banda.tesoreria + valor) }
  return conBanda(doc, anotar(b, ctx, {
    tipo: 'tesoreria', actor: { tipo: 'director', nombre: ctx.autor }, dinero: valor, motivo: `Corrección: ${exigirTexto(motivo, 'el motivo')}`,
  }))
}

// ─── Reputation, factions, perks and notes (director) ──────────────────────

/** How the public ledger names a shown faction: «Alguien» when the players do not know who it is */
export const ALGUIEN = 'Alguien'

/**
 * The reputation the players know, made again from the private part: the factions the director shows, in the catalog's order, with
 * their real value (and no name nor real id when shown without its name)
 */
function publicarReputacion(doc: DocBanda, cat: CatalogoBanda): DocBanda {
  const orden = [...cat.facciones.map((f) => f.id), ...doc.secretos.faccionesPropias.map((f) => f.id)]
  const reputacionConocida = orden.flatMap((id): ReputacionConocida[] => {
    const vis = doc.secretos.visibilidad[id]
    if (!vis) return []
    const valor = valorReputacion(id, doc.secretos, cat)
    return vis.modo === 'visible'
      ? [{ id, nombre: nombreFaccion(id, doc, cat) ?? id, valor }]
      : [{ id: vis.idPublico, nombre: null, valor }]
  })
  return { ...doc, banda: { ...doc.banda, reputacionConocida } }
}

/**
 * The director changes the real reputation with a faction. A hidden faction's change goes to the private ledger; a shown one's to the
 * crew's ledger (as «Alguien» when shown without its name), and the players see the new value
 */
export const fijarReputacion = (faccion: string, valor: number, motivo: string): OpBanda => (doc, ctx) => {
  const def = ctx.catalogo.facciones.find((f) => f.id === faccion)
  if (def?.enemiga) throw new ErrorBanda(`${def.nombre} es enemiga de la banda: su reputación está fija en −2.`)
  const antes = doc.secretos.reputacion[faccion] ?? 0
  const despues = Math.min(2, Math.max(-2, Math.round(valor)))
  if (antes === despues) return doc
  const nombre = nombreFaccion(faccion, doc, ctx.catalogo) ?? faccion
  const texto = motivo.trim() || 'ajuste de reputación'
  const secretos = { ...doc.secretos, reputacion: { ...doc.secretos.reputacion, [faccion]: despues } }
  const modo = modoVisibilidad(faccion, doc.secretos)
  if (modo === 'oculta') {
    const mov = { tipo: 'reputacion', cantidad: despues - antes, objetivo: nombre, motivo: `${nombre}: ${texto}` } as const
    return { ...doc, secretos: anotarPrivado(secretos, ctx, mov) }
  }
  const publico = modo === 'visible' ? nombre : ALGUIEN
  const banda = anotar(doc.banda, ctx, { tipo: 'reputacion', cantidad: despues - antes, objetivo: publico, motivo: `${publico}: ${texto}` })
  return publicarReputacion({ ...doc, banda, secretos }, ctx.catalogo)
}

const VISTA: Record<ModoVisibilidad, string> = {
  oculta: 'los jugadores ya no la ven',
  visible: 'los jugadores la ven',
  anonima: 'los jugadores la ven sin su nombre',
}

/** The director shows a faction's reputation to the players (with or without its name) or hides it again. Only the private ledger says so */
export const fijarVisibilidad = (faccion: string, modo: ModoVisibilidad): OpBanda => {
  const idPublico = `alguien-${nuevoId()}`
  return (doc, ctx) => {
    if (modoVisibilidad(faccion, doc.secretos) === modo) return doc
    const resto = Object.fromEntries(Object.entries(doc.secretos.visibilidad).filter(([id]) => id !== faccion))
    const visibilidad: Record<string, VisibilidadFaccion> = modo === 'oculta'
      ? resto
      : { ...resto, [faccion]: modo === 'visible' ? { modo } : { modo, idPublico } }
    const nombre = nombreFaccion(faccion, doc, ctx.catalogo) ?? faccion
    const secretos = anotarPrivado({ ...doc.secretos, visibilidad }, ctx, { tipo: 'reputacion', objetivo: nombre, motivo: `${nombre}: ${VISTA[modo]}` })
    return publicarReputacion({ ...doc, secretos }, ctx.catalogo)
  }
}

// New ids are fixed when the operation is built, not when it runs: the copy on screen and the saved one (applied again after a 409)
// must name the same item, or a tap on it right after creating it would not find it

export const anadirFaccion = (nombre: string): OpBanda => {
  const id = `propia-${nuevoId()}`
  return (doc, ctx) => {
    const limpio = exigirTexto(nombre, 'el nombre de la facción')
    const existe = [...ctx.catalogo.facciones, ...doc.secretos.faccionesPropias].some((f) => f.nombre.toLowerCase() === limpio.toLowerCase())
    if (existe) throw new ErrorBanda(`Ya existe la facción «${limpio}».`)
    // It starts hidden, so only the private ledger knows it
    const s = { ...doc.secretos, faccionesPropias: [...doc.secretos.faccionesPropias, { id, nombre: limpio }] }
    return { ...doc, secretos: anotarPrivado(s, ctx, { tipo: 'reputacion', objetivo: limpio, motivo: `Nueva facción: ${limpio}` }) }
  }
}

export const usarVentaja = (id: string, usada: boolean): OpBanda => (doc) => {
  const otras = doc.banda.ventajasUsadas.filter((v) => v !== id)
  return conBanda(doc, { ...doc.banda, ventajasUsadas: usada ? [...otras, id] : otras })
}

export const reiniciarVentajas = (): OpBanda => (doc, ctx) =>
  conBanda(doc, anotar({ ...doc.banda, ventajasUsadas: [] }, ctx, { tipo: 'nota', motivo: 'Nueva sesión: ventajas de organización disponibles' }))

export const anotarNota = (texto: string): OpBanda => (doc, ctx) =>
  conBanda(doc, anotar(doc.banda, ctx, { tipo: 'nota', motivo: exigirTexto(texto, 'el texto de la nota') }))

export const guardarNotasSecretas = (notas: string): OpBanda => (doc) => ({ ...doc, secretos: { ...doc.secretos, notas } })

export const guardarSecreto = (id: string, secreto: string): OpBanda => (doc) => {
  const secretos = { ...doc.secretos.secretos }
  if (secreto.trim()) secretos[id] = secreto.trim()
  else delete secretos[id]
  return { ...doc, secretos: { ...doc.secretos, secretos } }
}

/** Saves the sheet as it is now: a sheet of the first version is stored again with the private data of its workers moved out */
export const migrar = (): OpBanda => (doc) => doc

// ─── Refuges and upgrades ──────────────────────────────────────────────────

export interface DatosRefugio {
  id?: string
  tipo: string
  nombre: string
  ubicacion: string
  principal: boolean
  estado: EstadoRefugio
  notas: string
}

export const guardarRefugio = (datos: DatosRefugio): OpBanda => {
  const idNuevo = nuevoId()
  const idMovilidad = nuevoId()
  return (doc, ctx) => guardarRefugioCon(datos, idNuevo, idMovilidad, doc, ctx)
}

function guardarRefugioCon(datos: DatosRefugio, idNuevo: string, idMovilidad: string, doc: DocBanda, ctx: CtxBanda): DocBanda {
  const tipo = ctx.catalogo.tiposRefugio.find((t) => t.id === datos.tipo)
  if (!tipo) throw new ErrorBanda('Elige el tipo de refugio.')
  const nombre = exigirTexto(datos.nombre, 'el nombre del refugio')
  const previo = datos.id ? doc.banda.refugios.find((r) => r.id === datos.id) : undefined
  if (datos.id && !previo) throw new ErrorBanda('Ese refugio ya no existe.')

  // The first refuge is the main one; marking one as main unmarks the others
  const principal = datos.principal || doc.banda.refugios.filter((r) => r.id !== datos.id).length === 0
  let refugios = doc.banda.refugios.map((r) => (principal && r.id !== datos.id ? { ...r, principal: false } : r))
  let b = doc.banda

  if (previo) {
    const mejoras = tipo.movil || previo.tipo === tipo.id ? previo.mejoras : previo.mejoras.filter((m) => m.mejora !== 'movilidad')
    refugios = refugios.map((r) => (r.id === previo.id
      ? { ...r, tipo: tipo.id, nombre, ubicacion: datos.ubicacion.trim(), principal, estado: datos.estado, notas: datos.notas.trim(), mejoras }
      : r))
    const motivo = previo.estado !== datos.estado ? `${nombre}: ${datos.estado}` : `Refugio editado: ${nombre}`
    b = anotar({ ...b, refugios }, ctx, { tipo: 'refugio', objetivo: nombre, motivo })
  } else {
    // A refuge that moves (a barge) comes with Movilidad, already in place
    const mejoras: MejoraRefugio[] = tipo.movil
      ? [{ id: idMovilidad, mejora: 'movilidad', nivel: 1, estado: 'lista', semanasRestantes: 0, semanasTotales: 0, coste: 0, aplicadaPor: null, bonoArtesano: false, reparacion: null }]
      : []
    const nuevo: Refugio = {
      id: idNuevo, tipo: tipo.id, nombre, ubicacion: datos.ubicacion.trim(), principal, estado: datos.estado, mejoras, notas: datos.notas.trim(),
    }
    b = anotar({ ...b, refugios: [...refugios, nuevo] }, ctx, { tipo: 'refugio', objetivo: nombre, motivo: `Nuevo refugio: ${nombre} (${tipo.nombre})` })
    if (tipo.notoriedadAlInstalarse) {
      const notoriedad = Math.min(ctx.catalogo.notoriedadMaxima, b.notoriedad + tipo.notoriedadAlInstalarse)
      if (notoriedad !== b.notoriedad) {
        b = anotar({ ...b, notoriedad }, ctx, { tipo: 'notoriedad', cantidad: notoriedad - b.notoriedad, motivo: `Instalarse en ${nombre} llama la atención` })
      }
    }
  }
  return conBanda(doc, b)
}

export const quitarRefugio = (id: string): OpBanda => (doc, ctx) => {
  const r = doc.banda.refugios.find((x) => x.id === id)
  if (!r) return doc
  let refugios = doc.banda.refugios.filter((x) => x.id !== id)
  if (r.principal && refugios.length) refugios = refugios.map((x, i) => (i === 0 ? { ...x, principal: true } : x))
  // Whoever worked there is left without a post (private data)
  const trabajadores = { ...doc.secretos.trabajadores }
  for (const [tid, p] of Object.entries(trabajadores)) if (p.puesto?.refugio === id) trabajadores[tid] = { ...p, puesto: null }
  return {
    banda: anotar({ ...doc.banda, refugios }, ctx, { tipo: 'refugio', objetivo: r.nombre, motivo: `Refugio borrado: ${r.nombre}` }),
    secretos: { ...doc.secretos, trabajadores },
  }
}

export interface OpcionesMejora {
  /** Received as a reward (an organization upgrade, a goal, the book): nothing is paid */
  gratis: boolean
  /** Already built (no weeks of work) */
  yaHecha: boolean
  motivo: string
  /** Who applies it: a character, or the director */
  actor: Actor | null
  /** Only own upgrades */
  nombre?: string
  efecto?: string
}

export const construirMejora = (refugioId: string, mejoraId: string, op: OpcionesMejora): OpBanda => {
  const idNuevo = nuevoId()
  return (doc, ctx) => construirMejoraCon(refugioId, mejoraId, op, idNuevo, doc, ctx)
}

function construirMejoraCon(refugioId: string, mejoraId: string, op: OpcionesMejora, idNuevo: string, doc: DocBanda, ctx: CtxBanda): DocBanda {
  const actor = exigirActor(op.actor)
  const refugio = doc.banda.refugios.find((r) => r.id === refugioId)
  if (!refugio) throw new ErrorBanda('Ese refugio ya no existe.')
  const tipo = ctx.catalogo.tiposRefugio.find((t) => t.id === refugio.tipo)
  const capacidad = tipo?.capacidad ?? 0

  let mejoras: MejoraRefugio[]
  let nombre: string
  let coste = 0
  let semanas = 0

  if (mejoraId === 'propia') {
    nombre = exigirTexto(op.nombre ?? '', 'el nombre de la mejora')
    if (capacidadUsada(refugio) >= capacidad) throw new ErrorBanda(`El refugio no tiene sitio para más mejoras (${capacidadUsada(refugio)}/${capacidad}).`)
    mejoras = [...refugio.mejoras, {
      id: idNuevo, mejora: 'propia', nombre, efecto: (op.efecto ?? '').trim(), nivel: 1, estado: 'lista', semanasRestantes: 0, semanasTotales: 0,
      coste: 0, aplicadaPor: actor, bonoArtesano: false, reparacion: null,
    }]
  } else {
    const def = ctx.catalogo.mejorasRefugio.find((m) => m.id === mejoraId)
    if (!def) throw new ErrorBanda('Esa mejora no está en el catálogo.')
    nombre = def.nombre
    const existente = refugio.mejoras.find((m) => m.mejora === mejoraId)
    const nivel = existente ? existente.nivel + 1 : 1
    if (existente && nivel > Math.max(1, def.coste.length)) throw new ErrorBanda(`${refugio.nombre} ya tiene ${def.nombre}${def.coste.length > 1 ? ' al máximo' : ''}.`)
    if (existente && existente.estado === 'en-obra') throw new ErrorBanda(`${def.nombre} aún está en obra.`)
    if (existente && existente.estado === 'danada') throw new ErrorBanda(`${def.nombre} está dañada: primero hay que repararla.`)
    if (!existente && capacidadUsada(refugio) >= capacidad) {
      throw new ErrorBanda(`El refugio no tiene sitio para más mejoras (${capacidadUsada(refugio)}/${capacidad}).`)
    }
    if (!op.gratis) {
      const precio = enEra(def.coste[nivel - 1], ctx.era)
      if (precio === null) throw new ErrorBanda(`${def.nombre} no se compra: llega como recompensa o con el refugio.`)
      coste = precio
    }
    semanas = op.yaHecha ? 0 : def.semanas
    const estado = semanas > 0 ? 'en-obra' as const : 'lista' as const
    const nueva = { nivel, estado, semanasRestantes: semanas, semanasTotales: semanas, coste, aplicadaPor: actor, bonoArtesano: false, reparacion: null }
    mejoras = existente
      ? refugio.mejoras.map((m) => (m.id === existente.id ? { ...m, ...nueva } : m))
      : [...refugio.mejoras, { id: idNuevo, mejora: def.id, ...nueva }]
    if (existente) nombre = `${def.nombre} (nivel ${nivel})`
  }

  let b = coste > 0 ? pagar(doc.banda, ctx, coste) : doc.banda
  b = { ...b, refugios: b.refugios.map((r) => (r.id === refugioId ? { ...r, mejoras } : r)) }
  const detalle = semanas > 0 ? ` · ${semanas} ${semanas === 1 ? 'semana' : 'semanas'} de obra` : ''
  return conBanda(doc, anotar(b, ctx, {
    tipo: 'mejora', actor, objetivo: nombre, ...(coste > 0 ? { dinero: -coste } : {}),
    motivo: `${op.motivo.trim() || (op.gratis ? 'Mejora recibida' : 'Mejora comprada')}: ${nombre} en ${refugio.nombre}${detalle}`,
  }))
}

const conMejora = (doc: DocBanda, refugioId: string, mejoraId: string) => {
  const refugio = doc.banda.refugios.find((r) => r.id === refugioId)
  const mejora = refugio?.mejoras.find((m) => m.id === mejoraId)
  if (!refugio || !mejora) throw new ErrorBanda('Esa mejora ya no existe.')
  return { refugio, mejora }
}

const cambiarMejora = (b: BandaEstado, refugioId: string, mejoraId: string, cambio: Partial<MejoraRefugio>): BandaEstado => ({
  ...b,
  refugios: b.refugios.map((r) => (r.id === refugioId
    ? { ...r, mejoras: r.mejoras.map((m) => (m.id === mejoraId ? { ...m, ...cambio } : m)) }
    : r)),
})

/** What cancelling a work in progress gives back: the share of its price (of a repair, of what the repair cost) for the weeks still left */
export const devolucionObra = (m: MejoraRefugio) =>
  m.estado !== 'en-obra' || m.semanasTotales <= 0
    ? 0
    : redondear(((m.reparacion ? m.reparacion.coste : m.coste) * m.semanasRestantes) / m.semanasTotales)

/** «faltaban 2 de 3 semanas», «faltaba 1 de 1 semana» */
const faltaban = (m: MejoraRefugio) =>
  `${m.semanasRestantes === 1 ? 'faltaba' : 'faltaban'} ${m.semanasRestantes} de ${m.semanasTotales} ${m.semanasTotales === 1 ? 'semana' : 'semanas'}`

/** Weeks a repair takes: half the weeks of work of the upgrade, rounded up (our rule); 0 = it is repaired at once */
export const semanasReparacion = (m: MejoraRefugio, cat: CatalogoBanda) =>
  Math.ceil((cat.mejorasRefugio.find((d) => d.id === m.mejora)?.semanas ?? 0) / 2)

/** What repairing costs: half the price of its level (our rule); 0 when it has none (a reward, an own upgrade) */
export const costeReparacion = (m: MejoraRefugio, cat: CatalogoBanda, era: Era | null) => {
  const def = cat.mejorasRefugio.find((d) => d.id === m.mejora)
  const precio = def ? enEra(def.coste[m.nivel - 1], era) : null
  return precio === null ? 0 : redondear(precio / 2)
}

/**
 * A work in progress is cancelled and the weeks left are refunded: the refuge loses it (a higher level of Mobiliario goes back to the
 * previous one); a repair leaves the upgrade damaged
 */
export const cancelarObra = (refugioId: string, mejoraId: string, actor: Actor | null): OpBanda => (doc, ctx) => {
  const quien = exigirActor(actor)
  const { refugio, mejora } = conMejora(doc, refugioId, mejoraId)
  if (mejora.estado !== 'en-obra') throw new ErrorBanda('Solo se cancela una obra que no ha terminado.')
  const devolucion = devolucionObra(mejora)
  const nombre = nombreMejora(mejora, ctx.catalogo)
  if (mejora.reparacion) {
    const b = cambiarMejora(doc.banda, refugioId, mejoraId, { estado: 'danada', semanasRestantes: 0, semanasTotales: 0, reparacion: null })
    return conBanda(doc, anotar({ ...b, tesoreria: redondear(b.tesoreria + devolucion) }, ctx, {
      tipo: 'mejora', actor: quien, objetivo: nombre, ...(devolucion > 0 ? { dinero: devolucion } : {}),
      motivo: `Reparación cancelada: ${nombre} en ${refugio.nombre} sigue dañada (${faltaban(mejora)})`,
    }))
  }
  const b0 = mejora.nivel > 1
    ? cambiarMejora(doc.banda, refugioId, mejoraId, { nivel: mejora.nivel - 1, estado: 'lista', semanasRestantes: 0, semanasTotales: 0, coste: 0 })
    : { ...doc.banda, refugios: doc.banda.refugios.map((r) => (r.id === refugioId ? { ...r, mejoras: r.mejoras.filter((m) => m.id !== mejoraId) } : r)) }
  const b = { ...b0, tesoreria: redondear(b0.tesoreria + devolucion) }
  return conBanda(doc, anotar(b, ctx, {
    tipo: 'mejora', actor: quien, objetivo: nombre, ...(devolucion > 0 ? { dinero: devolucion } : {}),
    motivo: `Obra cancelada: ${nombre} en ${refugio.nombre} (${faltaban(mejora)})`,
  }))
}

export const terminarObra = (refugioId: string, mejoraId: string): OpBanda => (doc, ctx) => {
  const { refugio, mejora } = conMejora(doc, refugioId, mejoraId)
  const nombre = nombreMejora(mejora, ctx.catalogo)
  const b = cambiarMejora(doc.banda, refugioId, mejoraId, { estado: 'lista', semanasRestantes: 0, reparacion: null })
  return conBanda(doc, anotar(b, ctx, {
    tipo: 'mejora', objetivo: nombre, motivo: `${mejora.reparacion ? 'Reparada' : 'Obra terminada'}: ${nombre} en ${refugio.nombre}`,
  }))
}

export const danarMejora = (refugioId: string, mejoraId: string, motivo: string): OpBanda => (doc, ctx) => {
  const { refugio, mejora } = conMejora(doc, refugioId, mejoraId)
  const b = cambiarMejora(doc.banda, refugioId, mejoraId, { estado: 'danada' })
  return conBanda(doc, anotar(b, ctx, {
    tipo: 'mejora', objetivo: nombreMejora(mejora, ctx.catalogo), motivo: `${motivo.trim() || 'Dañada'}: ${nombreMejora(mejora, ctx.catalogo)} en ${refugio.nombre}`,
  }))
}

/**
 * Repairing (our rules) costs half the price of its level and takes half its weeks of work, rounded up: meanwhile it is a work in
 * progress that does not work and «Pasar semanas» advances; an upgrade without weeks is repaired at once
 */
export const repararMejora = (refugioId: string, mejoraId: string, gratis: boolean): OpBanda => (doc, ctx) => {
  const { refugio, mejora } = conMejora(doc, refugioId, mejoraId)
  if (mejora.estado !== 'danada') throw new ErrorBanda('Solo se repara una mejora dañada.')
  const nombre = nombreMejora(mejora, ctx.catalogo)
  const coste = gratis ? 0 : costeReparacion(mejora, ctx.catalogo, ctx.era)
  const semanas = semanasReparacion(mejora, ctx.catalogo)
  let b = coste > 0 ? pagar(doc.banda, ctx, coste) : doc.banda
  b = cambiarMejora(b, refugioId, mejoraId, semanas > 0
    ? { estado: 'en-obra', semanasRestantes: semanas, semanasTotales: semanas, bonoArtesano: false, reparacion: { coste } }
    : { estado: 'lista', semanasRestantes: 0, reparacion: null })
  return conBanda(doc, anotar(b, ctx, {
    tipo: 'mejora', objetivo: nombre, ...(coste > 0 ? { dinero: -coste } : {}),
    motivo: semanas > 0
      ? `En reparación: ${nombre} en ${refugio.nombre} · ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`
      : `Reparada: ${nombre} en ${refugio.nombre}`,
  }))
}

/** An upgrade an event can damage: a built one (ready, damaged or being repaired) of a refuge not lost; Movilidad is the vehicle itself */
export const puedeDanarse = (m: MejoraRefugio) =>
  m.mejora !== 'movilidad' && (m.estado === 'lista' || m.estado === 'danada' || (m.estado === 'en-obra' && !!m.reparacion))

/**
 * An event damages upgrades, the ones the director validated: a ready one becomes damaged; one already damaged, or being repaired, breaks
 * and is lost (whoever worked at it stays in the refuge without that post). The public ledger says what broke, never why. It returns
 * what happened to each, for the director's history of events
 */
export function danarMejoras(doc: DocBanda, ctx: CtxBanda, objetivos: { refugio: string; mejora: string }[]): { doc: DocBanda; efectos: string[] } {
  let banda = doc.banda
  const trabajadores = { ...doc.secretos.trabajadores }
  const efectos: string[] = []
  for (const o of objetivos) {
    const refugio = banda.refugios.find((r) => r.id === o.refugio)
    const mejora = refugio?.mejoras.find((m) => m.id === o.mejora)
    if (!refugio || refugio.estado === 'perdido' || !mejora || !puedeDanarse(mejora)) continue
    const nombre = nombreMejora(mejora, ctx.catalogo)
    if (mejora.estado === 'lista') {
      banda = anotar(cambiarMejora(banda, refugio.id, mejora.id, { estado: 'danada' }), ctx, {
        tipo: 'mejora', objetivo: nombre, motivo: `Dañada: ${nombre} en ${refugio.nombre}`,
      })
      efectos.push(`${nombre} (${refugio.nombre}): dañada`)
      continue
    }
    banda = {
      ...banda,
      refugios: banda.refugios.map((r) => (r.id === refugio.id ? { ...r, mejoras: r.mejoras.filter((m) => m.id !== mejora.id) } : r)),
    }
    for (const [tid, p] of Object.entries(trabajadores)) {
      if (p.puesto?.refugio === refugio.id && p.puesto.mejora === mejora.id) trabajadores[tid] = { ...p, puesto: { refugio: refugio.id, mejora: null } }
    }
    banda = anotar(banda, ctx, { tipo: 'mejora', objetivo: nombre, motivo: `Se rompe: ${nombre} en ${refugio.nombre} (ya estaba dañada) y se pierde` })
    efectos.push(`${nombre} (${refugio.nombre}): rota, se pierde`)
  }
  return { doc: { banda, secretos: { ...doc.secretos, trabajadores } }, efectos }
}

export const quitarMejora = (refugioId: string, mejoraId: string): OpBanda => (doc, ctx) => {
  const { refugio, mejora } = conMejora(doc, refugioId, mejoraId)
  const banda = {
    ...doc.banda,
    refugios: doc.banda.refugios.map((r) => (r.id === refugioId ? { ...r, mejoras: r.mejoras.filter((m) => m.id !== mejoraId) } : r)),
  }
  // A worker posted at that upgrade stays in the refuge without a specific post
  const trabajadores = { ...doc.secretos.trabajadores }
  for (const [tid, p] of Object.entries(trabajadores)) {
    if (p.puesto?.refugio === refugioId && p.puesto.mejora === mejoraId) trabajadores[tid] = { ...p, puesto: { refugio: refugioId, mejora: null } }
  }
  return {
    banda: anotar(banda, ctx, { tipo: 'mejora', objetivo: nombreMejora(mejora, ctx.catalogo), motivo: `Mejora quitada: ${nombreMejora(mejora, ctx.catalogo)} de ${refugio.nombre}` }),
    secretos: { ...doc.secretos, trabajadores },
  }
}

// ─── Workers ───────────────────────────────────────────────────────────────

/** What a player fills in when hiring (the public part) */
export interface DatosContratacion {
  nombre: string
  oficio: string
  oficioNombre?: string
  sueldo: number
  faccion: string | null
}

const limpiarPublico = (d: DatosContratacion) => {
  const nombre = exigirTexto(d.nombre, 'el nombre')
  if (d.oficio === 'propio' && !d.oficioNombre?.trim()) throw new ErrorBanda('Falta el nombre del oficio.')
  if (!Number.isFinite(d.sueldo) || d.sueldo < 0) throw new ErrorBanda('El sueldo no es válido.')
  return {
    nombre, oficio: d.oficio, ...(d.oficio === 'propio' ? { oficioNombre: d.oficioNombre?.trim() } : {}),
    sueldo: redondear(d.sueldo), faccion: d.faccion,
  }
}

/**
 * A character (or the director) hires a worker. A player only fills in the public part; the director may also give the private part
 * (otherwise it starts with the trade's tier and metal, loyalty 1, active, without a post)
 */
export const contratar = (datos: DatosContratacion, actor: Actor | null, privado: TrabajadorPrivado | null, idNuevo: string = nuevoId()): OpBanda => (doc, ctx) => {
  const quien = exigirActor(actor)
  const publico = limpiarPublico(datos)
  const tope = topeTrabajadores(doc.banda, ctx.catalogo)
  if (doc.banda.trabajadores.filter(ocupaPlaza).length >= tope) {
    throw new ErrorBanda(`Con escala ${doc.banda.escala}, la banda tiene como máximo ${tope} trabajadores.`)
  }
  if (privado?.puesto && !doc.banda.refugios.some((r) => r.id === privado.puesto?.refugio)) throw new ErrorBanda('Ese refugio ya no existe.')
  const nuevo: Trabajador = { ...publico, id: idNuevo, desde: ctx.ahora, contratadoPor: quien, enBanda: true }
  const banda = anotar({ ...doc.banda, trabajadores: [...doc.banda.trabajadores, nuevo] }, ctx, {
    tipo: 'trabajador', actor: quien, objetivo: publico.nombre,
    motivo: `Contratado: ${publico.nombre}, ${nombreOficio(nuevo, ctx.catalogo).toLowerCase()} (${ctx.dinero(publico.sueldo)} por semana)`,
  })
  return privado ? { banda, secretos: { ...doc.secretos, trabajadores: { ...doc.secretos.trabajadores, [idNuevo]: privado } } } : conBanda(doc, banda)
}

/** The director edits a worker: the public part and the private one */
export const editarTrabajador = (id: string, datos: DatosContratacion, privado: TrabajadorPrivado): OpBanda => (doc, ctx) => {
  const previo = doc.banda.trabajadores.find((t) => t.id === id)
  if (!previo) throw new ErrorBanda('Ese trabajador ya no existe.')
  const publico = limpiarPublico(datos)
  if (privado.puesto && !doc.banda.refugios.some((r) => r.id === privado.puesto?.refugio)) throw new ErrorBanda('Ese refugio ya no existe.')
  const enBanda = privado.estado !== 'baja' && privado.estado !== 'muerto'
  // Bringing back someone who had left takes a place again
  if (enBanda && !previo.enBanda && doc.banda.trabajadores.filter(ocupaPlaza).length >= topeTrabajadores(doc.banda, ctx.catalogo)) {
    throw new ErrorBanda(`Con escala ${doc.banda.escala}, la banda tiene como máximo ${topeTrabajadores(doc.banda, ctx.catalogo)} trabajadores.`)
  }
  const antes = privadoDe(previo, doc.secretos, ctx.catalogo)
  const editado: Trabajador = { id, desde: previo.desde, contratadoPor: previo.contratadoPor, ...publico, enBanda }
  const banda = { ...doc.banda, trabajadores: doc.banda.trabajadores.map((t) => (t.id === id ? editado : t)) }
  const cambioEstado = antes.estado !== privado.estado ? ` (${privado.estado})` : ''
  return {
    // The ledger is public: it names the worker, never their private data
    banda: anotar(banda, ctx, { tipo: 'trabajador', objetivo: publico.nombre, motivo: `Trabajador editado: ${publico.nombre}${previo.enBanda !== enBanda ? cambioEstado : ''}` }),
    secretos: { ...doc.secretos, trabajadores: { ...doc.secretos.trabajadores, [id]: privado } },
  }
}

export const despedir = (id: string, motivo: string): OpBanda => (doc, ctx) => {
  const t = doc.banda.trabajadores.find((x) => x.id === id)
  if (!t) return doc
  const privado = privadoDe(t, doc.secretos, ctx.catalogo)
  return {
    banda: anotar({ ...doc.banda, trabajadores: doc.banda.trabajadores.map((x) => (x.id === id ? { ...x, enBanda: false } : x)) }, ctx, {
      tipo: 'trabajador', objetivo: t.nombre, motivo: `${motivo.trim() || 'Despedido'}: ${t.nombre}`,
    }),
    secretos: { ...doc.secretos, trabajadores: { ...doc.secretos.trabajadores, [id]: { ...privado, estado: 'baja', puesto: null } } },
  }
}

export const borrarTrabajador = (id: string): OpBanda => (doc, ctx) => {
  const t = doc.banda.trabajadores.find((x) => x.id === id)
  if (!t) return doc
  const secretos = { ...doc.secretos.secretos }
  delete secretos[id]
  const trabajadores = { ...doc.secretos.trabajadores }
  delete trabajadores[id]
  return {
    banda: anotar({ ...doc.banda, trabajadores: doc.banda.trabajadores.filter((x) => x.id !== id) }, ctx, {
      tipo: 'trabajador', objetivo: t.nombre, motivo: `Borrado de la hoja: ${t.nombre}`,
    }),
    secretos: { ...doc.secretos, secretos, trabajadores },
  }
}

// ─── Contacts ──────────────────────────────────────────────────────────────

export type DatosContacto = Omit<Contacto, 'id'> & { id?: string }

/** Adds (no `datos.id`; the new contact takes `idNuevo`) or edits a contact */
export const guardarContacto = (datos: DatosContacto, idNuevo: string = nuevoId()): OpBanda => (doc, ctx) => {
  const nombre = exigirTexto(datos.nombre, 'el nombre')
  const previo = datos.id ? doc.banda.contactos.find((c) => c.id === datos.id) : undefined
  if (datos.id && !previo) throw new ErrorBanda('Ese contacto ya no existe.')
  const limpio = { ...datos, nombre, beneficio: datos.beneficio.trim(), notas: datos.notas.trim() }
  if (previo) {
    const b = { ...doc.banda, contactos: doc.banda.contactos.map((c) => (c.id === previo.id ? { ...limpio, id: previo.id } : c)) }
    const motivo = previo.relacion !== limpio.relacion ? `${nombre}: relación ${previo.relacion} → ${limpio.relacion}` : `Contacto editado: ${nombre}`
    return conBanda(doc, anotar(b, ctx, { tipo: 'contacto', objetivo: nombre, motivo }))
  }
  const nuevo: Contacto = { ...limpio, id: idNuevo }
  return conBanda(doc, anotar({ ...doc.banda, contactos: [...doc.banda.contactos, nuevo] }, ctx, {
    tipo: 'contacto', objetivo: nombre, motivo: `Nuevo contacto: ${nombre} (${limpio.relacion})`,
  }))
}

export const quitarContacto = (id: string): OpBanda => (doc, ctx) => {
  const c = doc.banda.contactos.find((x) => x.id === id)
  if (!c) return doc
  const secretos = { ...doc.secretos.secretos }
  delete secretos[id]
  return {
    banda: anotar({ ...doc.banda, contactos: doc.banda.contactos.filter((x) => x.id !== id) }, ctx, {
      tipo: 'contacto', objetivo: c.nombre, motivo: `Contacto borrado: ${c.nombre}`,
    }),
    secretos: { ...doc.secretos, secretos },
  }
}

// ─── Store and black market (docs/banda/propuesta-mercado-negro.md) ────────
// Players enter goods, put them on sale at their price, change it, withdraw them and take them out, as their character; the director
// also values, sells by hand, seizes and deletes. The sales of the black market are rolled by «Pasar semanas» (economia.ts). The ledger
// is public: it says what was entered, priced or sold, never the black market's numbers

/** What is entered in the store (the value of a price-table item comes from its book price and its conservation) */
export interface DatosMercancia {
  nombre: string
  deCatalogo: Mercancia['deCatalogo']
  cantidad: number
  conservacion: Conservacion
  /** Market price of one unit; null = the director values it later */
  valor: number | null
  notas: string
}

const limpiarMercancia = (d: DatosMercancia) => {
  const nombre = exigirTexto(d.nombre, 'el nombre')
  if (!Number.isInteger(d.cantidad) || d.cantidad < 1 || d.cantidad > 999) throw new ErrorBanda('La cantidad va de 1 a 999.')
  if (d.valor !== null && (!Number.isFinite(d.valor) || d.valor <= 0)) throw new ErrorBanda('El valor tiene que ser mayor que 0.')
  return {
    nombre, deCatalogo: d.deCatalogo, cantidad: d.cantidad, conservacion: d.conservacion, valor: d.valor === null ? null : redondear(d.valor),
    notas: d.notas.trim(),
  }
}

const exigirPrecio = (precio: number) => {
  if (!Number.isFinite(precio) || precio <= 0) throw new ErrorBanda('Indica un precio mayor que 0.')
  return redondear(precio)
}

/** An open lot of the store (one sold, taken out or seized cannot change any more) */
const loteAbierto = (doc: DocBanda, id: string) => {
  const m = doc.banda.almacen.find((x) => x.id === id)
  if (!m || loteCerrado(m)) throw new ErrorBanda('Ese lote ya no está en el almacén.')
  return m
}

const cambiarLote = (b: BandaEstado, id: string, cambio: Partial<Mercancia>): BandaEstado =>
  ({ ...b, almacen: b.almacen.map((m) => (m.id === id ? { ...m, ...cambio } : m)) })

const textoValor = (m: Pick<Mercancia, 'valor' | 'conservacion'>, ctx: CtxBanda) =>
  `${m.conservacion === 'usado' ? ', usado' : ''}${m.valor !== null ? `, ${ctx.dinero(m.valor)} por unidad` : ', sin tasar'}`

/** A character (or the director) enters goods in the store; with a price, they go on sale at once */
export const entrarMercancia = (datos: DatosMercancia, actor: Actor | null, precio: number | null): OpBanda => {
  const id = nuevoId()
  return (doc, ctx) => {
    const quien = exigirActor(actor)
    const d = limpiarMercancia(datos)
    const venta = precio === null ? null : exigirPrecio(precio)
    if (venta !== null && d.valor === null) throw new ErrorBanda('Primero hay que tasarlo: la DJ pone su valor.')
    const lote: Mercancia = {
      id, ...d, precio: venta, semanasALaVenta: 0, situacion: venta === null ? 'guardada' : 'en-venta', traidaPor: quien, entradaEn: ctx.ahora,
      puestaPor: venta === null ? null : quien, cerradaEn: null, importeVenta: null,
    }
    // Joined to the open lot of the same goods, if there is one; the ledger says who brought these units
    let b = anotar({ ...doc.banda, almacen: juntarEnAlmacen(doc.banda.almacen, lote) }, ctx, {
      tipo: 'almacen', actor: quien, objetivo: d.nombre, motivo: `Entra en el almacén: ${nombreLote(lote)}${textoValor(lote, ctx)}`,
    })
    if (venta !== null) {
      b = anotar(b, ctx, { tipo: 'almacen', actor: quien, objetivo: d.nombre, motivo: `A la venta: ${nombreLote(lote)} a ${ctx.dinero(venta)} por unidad` })
    }
    return conBanda(doc, b)
  }
}

/** The director corrects a lot that is not on sale (name, quantity, conservation, value, notes) */
export const editarMercancia = (id: string, datos: DatosMercancia): OpBanda => (doc, ctx) => {
  const m = loteAbierto(doc, id)
  if (m.situacion !== 'guardada') throw new ErrorBanda('Retíralo de la venta antes de cambiarlo.')
  const d = limpiarMercancia(datos)
  return conBanda(doc, anotar(cambiarLote(doc.banda, id, d), ctx, {
    tipo: 'almacen', objetivo: d.nombre, motivo: `Lote corregido: ${nombreLote({ ...m, ...d })}${textoValor(d, ctx)}`,
  }))
}

export const ponerALaVenta = (id: string, precio: number, actor: Actor | null): OpBanda => (doc, ctx) => {
  const quien = exigirActor(actor)
  const m = loteAbierto(doc, id)
  if (m.situacion === 'en-venta') throw new ErrorBanda('Ya está a la venta.')
  if (m.valor === null) throw new ErrorBanda('Primero hay que tasarlo: la DJ pone su valor.')
  const p = exigirPrecio(precio)
  return conBanda(doc, anotar(cambiarLote(doc.banda, id, { situacion: 'en-venta', precio: p, semanasALaVenta: 0, puestaPor: quien }), ctx, {
    tipo: 'almacen', actor: quien, objetivo: m.nombre, motivo: `A la venta: ${nombreLote(m)} a ${ctx.dinero(p)} por unidad`,
  }))
}

/** A new price keeps the weeks it has been on sale */
export const cambiarPrecio = (id: string, precio: number, actor: Actor | null): OpBanda => (doc, ctx) => {
  const quien = exigirActor(actor)
  const m = loteAbierto(doc, id)
  if (m.situacion !== 'en-venta' || m.precio === null) throw new ErrorBanda('No está a la venta.')
  const p = exigirPrecio(precio)
  if (p === m.precio) return doc
  return conBanda(doc, anotar(cambiarLote(doc.banda, id, { precio: p, puestaPor: quien }), ctx, {
    tipo: 'almacen', actor: quien, objetivo: m.nombre, motivo: `Nuevo precio de ${nombreLote(m)}: ${ctx.dinero(m.precio)} → ${ctx.dinero(p)} por unidad`,
  }))
}

/** Back to the shelf: the weeks on sale start again from 0 */
export const retirarDeLaVenta = (id: string, actor: Actor | null): OpBanda => (doc, ctx) => {
  const quien = exigirActor(actor)
  const m = loteAbierto(doc, id)
  if (m.situacion !== 'en-venta') throw new ErrorBanda('No está a la venta.')
  return conBanda(doc, anotar(cambiarLote(doc.banda, id, { situacion: 'guardada', precio: null, semanasALaVenta: 0, puestaPor: null }), ctx, {
    tipo: 'almacen', actor: quien, objetivo: m.nombre, motivo: `Retirado de la venta: ${nombreLote(m)}`,
  }))
}

/** A character takes the lot out of the store: it stays in the history */
export const sacarDelAlmacen = (id: string, actor: Actor | null, motivo: string): OpBanda => (doc, ctx) => {
  const quien = exigirActor(actor)
  const m = loteAbierto(doc, id)
  return conBanda(doc, anotar(cambiarLote(doc.banda, id, { situacion: 'retirada', precio: null, cerradaEn: ctx.ahora }), ctx, {
    tipo: 'almacen', actor: quien, objetivo: m.nombre, motivo: `Sale del almacén: ${nombreLote(m)}${motivo.trim() ? ` (${motivo.trim()})` : ''}`,
  }))
}

/** The director values a lot that is not on the price table (or corrects its value) */
export const tasarMercancia = (id: string, valor: number): OpBanda => (doc, ctx) => {
  const m = loteAbierto(doc, id)
  if (!Number.isFinite(valor) || valor <= 0) throw new ErrorBanda('Indica un valor mayor que 0.')
  const v = redondear(valor)
  return conBanda(doc, anotar(cambiarLote(doc.banda, id, { valor: v }), ctx, {
    tipo: 'almacen', objetivo: m.nombre, motivo: `Tasado: ${nombreLote(m)}, ${ctx.dinero(v)} por unidad`,
  }))
}

/** A sale agreed at the table, for the amount the director says: it goes to the treasury */
export const venderEnMano = (id: string, total: number, motivo: string): OpBanda => (doc, ctx) => {
  const m = loteAbierto(doc, id)
  if (!Number.isFinite(total) || total <= 0) throw new ErrorBanda('Indica un importe mayor que 0.')
  const importe = redondear(total)
  const b = cambiarLote({ ...doc.banda, tesoreria: redondear(doc.banda.tesoreria + importe) }, id, {
    situacion: 'vendida', precio: null, cerradaEn: ctx.ahora, importeVenta: importe,
  })
  return conBanda(doc, anotar(b, ctx, {
    tipo: 'mercado', actor: { tipo: 'director', nombre: ctx.autor }, objetivo: m.nombre, dinero: importe,
    motivo: `Vendido en mano: ${nombreLote(m)} por ${ctx.dinero(importe)}${motivo.trim() ? ` (${motivo.trim()})` : ''}`,
  }))
}

/** The goods are lost (a search, a theft…): the lot stays in the history */
export const requisarMercancia = (id: string, motivo: string): OpBanda => (doc, ctx) => {
  const m = loteAbierto(doc, id)
  return conBanda(doc, anotar(cambiarLote(doc.banda, id, { situacion: 'requisada', precio: null, cerradaEn: ctx.ahora }), ctx, {
    tipo: 'mercado', objetivo: m.nombre, motivo: `Requisado: ${nombreLote(m)}${motivo.trim() ? ` (${motivo.trim()})` : ''}`,
  }))
}

/** A lot entered by mistake disappears (open or in the history); no money moves */
export const borrarMercancia = (id: string): OpBanda => (doc, ctx) => {
  const m = doc.banda.almacen.find((x) => x.id === id)
  if (!m) return doc
  return conBanda(doc, anotar({ ...doc.banda, almacen: doc.banda.almacen.filter((x) => x.id !== id) }, ctx, {
    tipo: 'almacen', objetivo: m.nombre, motivo: `Lote borrado: ${nombreLote(m)}`,
  }))
}

// ─── Mission board (docs/banda/propuesta-cartel-misiones.md) ───────────────
// The director writes notices as drafts (private) and publishes them; the crew as a whole (any player it is shared with, or the
// director) accepts or rejects a published one and adds clues to one in progress; the director closes it (fulfilled or failed, with
// the payment into the treasury), withdraws or deletes it. A rumour's truth, the notes and what happens if it expires stay private

/** What the director writes in a notice */
export interface DatosAviso {
  tipo: TipoAviso
  titulo: string
  texto: string
  origenContacto: string | null
  origenTexto: string
  lugar: string
  recompensa: string
  pago: number | null
  /** Weeks before it expires (private: only the director knows it); null = no deadline */
  semanasRestantes: number | null
}

/** What the director writes in a notice, only for him */
export type DatosPrivadosAviso = Omit<AvisoPrivado, 'semanasRestantes'>

export const ETIQUETA_AVISO: Record<TipoAviso, string> = { encargo: 'Encargo', rumor: 'Rumor', amenaza: 'Amenaza' }

const limpiarAviso = (d: DatosAviso) => {
  const titulo = exigirTexto(d.titulo, 'el título')
  if (d.pago !== null && (!Number.isFinite(d.pago) || d.pago < 0)) throw new ErrorBanda('El pago no puede ser negativo.')
  if (d.semanasRestantes !== null && (!Number.isInteger(d.semanasRestantes) || d.semanasRestantes < 1)) {
    throw new ErrorBanda('El plazo es de 1 semana o más (déjalo vacío si no tiene).')
  }
  return {
    tipo: d.tipo, titulo, texto: d.texto.trim(), origenContacto: d.origenContacto, origenTexto: d.origenContacto ? '' : d.origenTexto.trim(),
    lugar: d.lugar.trim(), recompensa: d.recompensa.trim(), pago: d.pago === null || d.pago === 0 ? null : redondear(d.pago),
  }
}

/** The private part of a notice: what only the director wrote, and the deadline */
const limpiarPrivadoAviso = (p: DatosPrivadosAviso, d: DatosAviso): AvisoPrivado =>
  ({ verdad: d.tipo === 'rumor' ? p.verdad : null, notas: p.notas.trim(), siCaduca: p.siCaduca.trim(), semanasRestantes: d.semanasRestantes })

const conPrivado = (s: BandaSecretos, id: string, p: AvisoPrivado): BandaSecretos => ({ ...s, cartel: { ...s.cartel, [id]: p } })

const cambiarAviso = (b: BandaEstado, id: string, cambio: Partial<Aviso>): BandaEstado =>
  ({ ...b, cartel: recortarCartel(b.cartel.map((a) => (a.id === id ? { ...a, ...cambio } : a))) })

/** «Encargo: Cobrar a Brannoc» */
export const nombreAviso = (a: Pick<Aviso, 'tipo' | 'titulo'>) => `${ETIQUETA_AVISO[a.tipo]}: ${a.titulo}`

/** A notice of the public board that the crew may still decide on or is working on */
const avisoAbierto = (doc: DocBanda, id: string) => {
  const a = doc.banda.cartel.find((x) => x.id === id)
  if (!a || avisoCerrado(a)) throw new ErrorBanda('Ese aviso ya no está en el cartel.')
  return a
}

/**
 * Saves a draft and its private part: a new one when no draft has that id (the sheet fixes the id when it opens, so applying it again
 * after a 409 saves the same draft), or the draft with that id edited
 */
export const guardarBorrador = (datos: DatosAviso, privado: DatosPrivadosAviso, id: string): OpBanda => (doc, ctx) => {
  if (doc.banda.cartel.some((a) => a.id === id)) throw new ErrorBanda('Ese aviso ya está publicado.')
  const d = limpiarAviso(datos)
  const previo = doc.secretos.borradores.find((a) => a.id === id)
  const aviso: Aviso = previo
    ? { ...previo, ...d }
    : { id, ...d, estado: 'publicado', pistas: [], publicadoEn: ctx.ahora, decididoEn: null, cerradoEn: null, desenlace: '' }
  const borradores = previo ? doc.secretos.borradores.map((a) => (a.id === id ? aviso : a)) : [...doc.secretos.borradores, aviso]
  return { ...doc, secretos: conPrivado({ ...doc.secretos, borradores }, id, limpiarPrivadoAviso(privado, datos)) }
}

/** A draft goes up on the board for everyone with access */
export const publicarAviso = (id: string): OpBanda => (doc, ctx) => {
  const borrador = doc.secretos.borradores.find((a) => a.id === id)
  if (!borrador) {
    if (doc.banda.cartel.some((a) => a.id === id)) return doc
    throw new ErrorBanda('Ese borrador ya no existe.')
  }
  const aviso: Aviso = { ...borrador, estado: 'publicado', publicadoEn: ctx.ahora }
  return {
    banda: anotar({ ...doc.banda, cartel: [...doc.banda.cartel, aviso] }, ctx, {
      tipo: 'cartel', objetivo: aviso.titulo, motivo: `Nuevo en el cartel: ${nombreAviso(aviso)}`,
    }),
    secretos: { ...doc.secretos, borradores: doc.secretos.borradores.filter((a) => a.id !== id) },
  }
}

/** The director corrects a notice still on the board (published or in progress) and its private part */
export const editarAviso = (id: string, datos: DatosAviso, privado: DatosPrivadosAviso): OpBanda => (doc) => {
  avisoAbierto(doc, id)
  const d = limpiarAviso(datos)
  return { banda: cambiarAviso(doc.banda, id, d), secretos: conPrivado(doc.secretos, id, limpiarPrivadoAviso(privado, datos)) }
}

/** The crew takes it on: it is in progress until the director closes it */
export const aceptarAviso = (id: string): OpBanda => (doc, ctx) => {
  const a = avisoAbierto(doc, id)
  if (a.estado === 'aceptado') throw new ErrorBanda('La banda ya lo ha aceptado.')
  return conBanda(doc, anotar(cambiarAviso(doc.banda, id, { estado: 'aceptado', decididoEn: ctx.ahora }), ctx, {
    tipo: 'cartel', objetivo: a.titulo, motivo: `La banda acepta: ${nombreAviso(a)}`,
  }))
}

/** The crew turns it down: it goes to the archive */
export const rechazarAviso = (id: string): OpBanda => (doc, ctx) => {
  const a = avisoAbierto(doc, id)
  if (a.estado === 'aceptado') throw new ErrorBanda('La banda ya lo ha aceptado: ahora solo el director puede cerrarlo.')
  return conBanda(doc, anotar(cambiarAviso(doc.banda, id, { estado: 'rechazado', decididoEn: ctx.ahora, cerradoEn: ctx.ahora }), ctx, {
    tipo: 'cartel', objetivo: a.titulo, motivo: `La banda rechaza: ${nombreAviso(a)}`,
  }))
}

/** Something the crew found out about a notice in progress */
export const anadirPista = (id: string, texto: string): OpBanda => (doc) => {
  const a = avisoAbierto(doc, id)
  if (a.estado !== 'aceptado') throw new ErrorBanda('Solo se apuntan pistas en lo que la banda tiene entre manos.')
  const pista = exigirTexto(texto, 'la pista')
  return conBanda(doc, cambiarAviso(doc.banda, id, { pistas: [...a.pistas, pista] }))
}

/** The director closes a notice in progress; a fulfilled one pays `pago` into the treasury */
export const cerrarAviso = (id: string, resultado: 'cumplido' | 'fallido', desenlace: string, pago: number | null): OpBanda => (doc, ctx) => {
  const a = avisoAbierto(doc, id)
  if (a.estado !== 'aceptado') throw new ErrorBanda('Solo se cierra lo que la banda ha aceptado.')
  if (pago !== null && (!Number.isFinite(pago) || pago < 0)) throw new ErrorBanda('El pago no puede ser negativo.')
  const cobro = resultado === 'cumplido' && pago ? redondear(pago) : 0
  const b = cambiarAviso({ ...doc.banda, tesoreria: redondear(doc.banda.tesoreria + cobro) }, id, {
    estado: resultado, cerradoEn: ctx.ahora, desenlace: desenlace.trim(),
  })
  return conBanda(doc, anotar(b, ctx, {
    tipo: 'cartel', objetivo: a.titulo, ...(cobro ? { dinero: cobro } : {}),
    motivo: `${resultado === 'cumplido' ? 'Cumplido' : 'Fallido'}: ${nombreAviso(a)}${cobro ? ` (cobra ${ctx.dinero(cobro)})` : ''}`,
  }))
}

/** The director takes a published notice off the board: it stays in the archive */
export const descartarAviso = (id: string, motivo: string): OpBanda => (doc, ctx) => {
  const a = avisoAbierto(doc, id)
  if (a.estado !== 'publicado') throw new ErrorBanda('La banda ya lo ha aceptado: ciérralo como cumplido o fallido.')
  return conBanda(doc, anotar(cambiarAviso(doc.banda, id, { estado: 'descartado', cerradoEn: ctx.ahora, desenlace: motivo.trim() }), ctx, {
    tipo: 'cartel', objetivo: a.titulo, motivo: `Retirado del cartel: ${nombreAviso(a)}${motivo.trim() ? ` (${motivo.trim()})` : ''}`,
  }))
}

/** A notice (published or a draft) disappears with its private part; no money moves */
export const borrarAviso = (id: string): OpBanda => (doc, ctx) => {
  const publico = doc.banda.cartel.find((a) => a.id === id)
  const cartel = { ...doc.secretos.cartel }
  delete cartel[id]
  const secretos = { ...doc.secretos, cartel, borradores: doc.secretos.borradores.filter((a) => a.id !== id) }
  if (!publico) return { ...doc, secretos }
  return {
    banda: anotar({ ...doc.banda, cartel: doc.banda.cartel.filter((a) => a.id !== id) }, ctx, {
      tipo: 'cartel', objetivo: publico.titulo, motivo: `Aviso borrado: ${nombreAviso(publico)}`,
    }),
    secretos,
  }
}

/**
 * Weeks pass for the board (the director: the deadlines are in his private part): open notices with a deadline count down; a published
 * one that reaches 0 expires (it goes to the archive and the public ledger says so), one in progress stays at 0 («Fuera de plazo», only
 * for him). Returns the expired ones and the ones in progress that ran out of time now, for his summary
 */
export function pasarSemanasCartel(doc: DocBanda, semanas: number, ctx: CtxBanda): { doc: DocBanda; caducados: Aviso[]; fueraDePlazo: Aviso[] } {
  const caducados: Aviso[] = []
  const fueraDePlazo: Aviso[] = []
  const privados = { ...doc.secretos.cartel }
  const cartel = doc.banda.cartel.map((a) => {
    const p = privados[a.id]
    if (avisoCerrado(a) || !p || p.semanasRestantes === null) return a
    const quedan = Math.max(0, p.semanasRestantes - semanas)
    privados[a.id] = { ...p, semanasRestantes: quedan }
    if (quedan > 0 || p.semanasRestantes === 0) return a
    if (a.estado === 'aceptado') {
      fueraDePlazo.push(a)
      return a
    }
    const caducado: Aviso = { ...a, estado: 'caducado', cerradoEn: ctx.ahora }
    caducados.push(caducado)
    return caducado
  })
  let banda: BandaEstado = { ...doc.banda, cartel }
  for (const a of caducados) banda = anotar(banda, ctx, { tipo: 'cartel', objetivo: a.titulo, motivo: `Caducado: ${nombreAviso(a)}` })
  return { doc: { banda: { ...banda, cartel: recortarCartel(banda.cartel) }, secretos: { ...doc.secretos, cartel: privados } }, caducados, fueraDePlazo }
}
