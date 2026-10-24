/**
 * «La mesa» seen from the director's screen: `proyectarMesa` is the WHITELIST of what the players get (the public document the
 * provider saves next to the screen), and the operations that show or hide images, uncover the fog and move the tokens. Pure,
 * like estado.ts: the panels change the document through `usePantalla().actualizar`.
 */
import {
  MAX_FICHAS, MAX_PROYECCIONES, MAX_ZONAS, TAMANO_FICHA, VERSION_MESA, colorDeFicha, enZonaDestapada, mismaImagen, nieblaCerrada, pistaSalud, sinNiebla,
  tamanoFicha as acotarTamano, zonaNiebla,
  type AliadoMesa, type EncuentroMesa, type EnemigoMesa, type FichaDirector, type FichaMesa, type MesaPublica, type Niebla, type OrigenImagen, type Proyeccion,
  type ProyeccionDirector, type ZonaNiebla,
} from '../mesa/publica'
import { ahoraIso, anotar, encuentroEnPantalla, nuevoId, type Combatiente, type Encuentro, type PantallaEstado } from './estado'

const copiaRecurso = (r: { actual: number; max: number }) => ({ actual: r.actual, max: r.max })
const copiaEstados = (c: Combatiente) => c.estados.map((e) => ({ id: e.id, valor: e.valor }))

/** Everything the director tracks of an ally, field by field (never a spread of the combatant) */
const aliadoMesa = (c: Combatiente): AliadoMesa => ({
  id: c.id,
  nombre: c.nombre,
  characterId: c.characterId,
  turno: c.turno,
  actuoRapido: c.actuoRapido,
  actuoLento: c.actuoLento,
  reaccionUsada: c.reaccionUsada,
  salud: copiaRecurso(c.salud),
  concentracion: copiaRecurso(c.concentracion),
  investidura: copiaRecurso(c.investidura),
  estados: copiaEstados(c),
  derrotado: c.derrotado,
})

/**
 * Of an enemy: name, conditions, fallen, the health hint only when the director shows it, and its turn only once the director
 * revealed it or the enemy acted (acting gives it away anyway). No numbers, no stat block
 */
const enemigoMesa = (c: Combatiente): EnemigoMesa => ({
  id: c.id,
  nombre: c.nombre,
  adversarioId: c.adversarioId,
  turno: c.turnoVisible || c.actuoRapido || c.actuoLento ? c.turno : null,
  actuoRapido: c.actuoRapido,
  actuoLento: c.actuoLento,
  estados: copiaEstados(c),
  derrotado: c.derrotado,
  pistaSalud: c.mostrarSalud ? pistaSalud(c.salud, c.derrotado) : null,
})

const encuentroMesa = (e: Encuentro): EncuentroMesa => ({
  id: e.id,
  titulo: e.titulo,
  ronda: e.ronda,
  fase: e.fase,
  aliados: e.combatientes.filter((c) => c.bando === 'pj').map(aliadoMesa),
  enemigos: e.combatientes.filter((c) => c.bando === 'pnj' && !c.oculto).map(enemigoMesa),
  retirados: e.retirados.map((r) => ({ nombre: r.nombre, motivo: r.motivo })),
})

const copiaNiebla = (n: Niebla): Niebla => ({ activa: n.activa, zonas: n.zonas.map((z) => ({ x: z.x, y: z.y, w: z.w, h: z.h })) })
const copiaFicha = (f: FichaDirector): FichaDirector => ({ ...f })
/** A projection as the director keeps it (the history holds copies) */
const copiaDirector = (p: ProyeccionDirector): ProyeccionDirector => ({
  id: p.id, imagen: { ...p.imagen }, titulo: p.titulo, pie: p.pie, en: p.en, niebla: copiaNiebla(p.niebla),
  tamanoFicha: p.tamanoFicha, nombresFichas: p.nombresFichas, fichas: p.fichas.map(copiaFicha),
})

/** The combatant a token stands for, in whichever open fight */
const combatienteDeFicha = (b: PantallaEstado, f: FichaDirector): Combatiente | null =>
  f.combatienteId ? b.encuentros.flatMap((e) => e.combatientes).find((c) => c.id === f.combatienteId) ?? null : null

/**
 * The projection the players get: its tokens resolved. A hidden token, or an enemy's token whose enemy is «Oculto a la mesa»,
 * never leaves the screen; with the fog on, an enemy's token in a covered part of the map does not either. A companion's token
 * is always published (it is the player). The name follows the combatant (renamed, numbered «Guardia 1»); the id of the
 * combatant stays on the screen
 */
const proyeccionMesa = (b: PantallaEstado, p: ProyeccionDirector): Proyeccion => {
  const fichas: FichaMesa[] = []
  for (const f of p.fichas) {
    if (!f.visible) continue
    const cb = combatienteDeFicha(b, f)
    if (f.bando === 'pnj' && (cb?.oculto || !enZonaDestapada(f, p.niebla))) continue
    fichas.push({ id: f.id, nombre: cb?.nombre ?? f.nombre, bando: f.bando, adversarioId: cb?.adversarioId ?? f.adversarioId, x: f.x, y: f.y, color: colorDeFicha(f) })
  }
  return {
    id: p.id, imagen: { ...p.imagen }, titulo: p.titulo, pie: p.pie, en: p.en, niebla: copiaNiebla(p.niebla),
    tamanoFicha: p.tamanoFicha, nombresFichas: p.nombresFichas, fichas,
  }
}

/** A map («Mapa 1.3: …», the book's and the script's titles) starts covered by the fog; anything else is shown whole */
export const esMapa = (titulo: string) => /^\s*mapa\b/i.test(titulo)
export const nieblaInicial = (titulo: string, mapa = esMapa(titulo)): Niebla => (mapa ? nieblaCerrada() : sinNiebla())

/**
 * The public document: the shown encounters (the one on screen first), the session and what is projected right now. The
 * history of images (`mesa.proyecciones`) never leaves the screen: once the director takes an image off the table, the
 * players see nothing of it
 */
export function proyectarMesa(b: PantallaEstado): MesaPublica {
  const activo = encuentroEnPantalla(b)
  const visibles = b.encuentros.filter((e) => e.enMesa)
  const ordenados = activo && visibles.includes(activo) ? [activo, ...visibles.filter((e) => e !== activo)] : visibles
  return {
    version: VERSION_MESA,
    sesion: b.sesion ? { numero: b.sesion.numero, titulo: b.sesion.titulo, iniciadaEn: b.sesion.iniciadaEn } : null,
    encuentros: ordenados.map(encuentroMesa),
    proyeccion: b.mesa.proyeccion ? proyeccionMesa(b, b.mesa.proyeccion) : null,
  }
}

/** What a projection starts with: the fog of a map, and tokens, size and names from the history when it is shown again */
export interface OpcionesProyeccion {
  niebla?: Niebla
  fichas?: FichaDirector[]
  tamanoFicha?: number
  nombresFichas?: boolean
}

/**
 * Shows an image to the players: it becomes the projection and goes first in the session's history (an image shown before moves
 * up instead of repeating). The log notes it, so the chronicle knows what the table saw.
 */
export function mostrarEnMesa(
  b: PantallaEstado, imagen: OrigenImagen, titulo: string, pie: string, ultimoDiario: number | null, opciones: OpcionesProyeccion = {},
): ProyeccionDirector {
  const p: ProyeccionDirector = {
    id: nuevoId(), imagen, titulo: titulo.trim(), pie: pie.trim(), en: ahoraIso(),
    niebla: copiaNiebla(opciones.niebla ?? nieblaInicial(titulo)),
    fichas: (opciones.fichas ?? []).map(copiaFicha).slice(0, MAX_FICHAS),
    tamanoFicha: acotarTamano(opciones.tamanoFicha ?? TAMANO_FICHA.def),
    nombresFichas: opciones.nombresFichas ?? true,
  }
  b.mesa.proyeccion = p
  b.mesa.proyecciones = [p, ...b.mesa.proyecciones.filter((q) => !mismaImagen(q.imagen, imagen))].slice(0, MAX_PROYECCIONES)
  anotar(b, { tipo: 'apunte', etiqueta: 'Mesa', texto: `Se muestra a la mesa: ${p.titulo || 'una imagen'}` }, ultimoDiario)
  return p
}

/** Shows again an image of the session's history, with its fog and its tokens as they were left */
export function volverAMostrar(b: PantallaEstado, id: string, ultimoDiario: number | null): ProyeccionDirector | null {
  const p = b.mesa.proyecciones.find((q) => q.id === id)
  return p ? mostrarEnMesa(b, p.imagen, p.titulo, p.pie, ultimoDiario, { niebla: p.niebla, fichas: p.fichas, tamanoFicha: p.tamanoFicha, nombresFichas: p.nombresFichas }) : null
}

/** Changes the current projection (the recipe mutates it) and refreshes its copy in the history. Nothing happens without one */
export function cambiarProyeccion(b: PantallaEstado, receta: (p: ProyeccionDirector) => void): boolean {
  const p = b.mesa.proyeccion
  if (!p) return false
  receta(p)
  p.niebla.zonas.splice(MAX_ZONAS)
  p.fichas.splice(MAX_FICHAS)
  const i = b.mesa.proyecciones.findIndex((q) => q.id === p.id)
  if (i >= 0) b.mesa.proyecciones[i] = copiaDirector(p)
  return true
}

/** Changes the fog of the current projection (and of its copy in the history): the recipe mutates it */
export const cambiarNiebla = (b: PantallaEstado, receta: (n: Niebla) => void) => { cambiarProyeccion(b, (p) => receta(p.niebla)) }

/** Uncovers a zone of the map for the players (clipped to the image; one too small to see is ignored). Returns whether it was added */
export function destaparZona(b: PantallaEstado, z: ZonaNiebla): boolean {
  const zona = zonaNiebla(z)
  if (!zona) return false
  cambiarNiebla(b, (n) => { n.zonas.push(zona) })
  return true
}

/** Takes the image off the players' screens (it stays in the history) */
export function quitarDeMesa(b: PantallaEstado) {
  b.mesa.proyeccion = null
}

/** Changes the title or the caption of the current projection (and of its copy in the history) */
export function anotarProyeccion(b: PantallaEstado, cambios: { titulo?: string; pie?: string }) {
  cambiarProyeccion(b, (p) => {
    if (cambios.titulo !== undefined) p.titulo = cambios.titulo.trim()
    if (cambios.pie !== undefined) p.pie = cambios.pie.trim()
  })
}

/** Enemies of a fight the players do not see */
export const enemigosOcultos = (e: Encuentro) => e.combatientes.filter((c) => c.bando === 'pnj' && c.oculto).length

// ── Tokens on the map ────────────────────────────────────────────────────────

const acotar = (v: number) => Math.min(1, Math.max(0, v))

/** Who a token stands for: a combatant of an open fight, or a campaign character outside any fight */
export type OrigenFicha = { combatiente: Combatiente } | { personaje: { id: number; name: string } }

/** The token of the projection that stands for this combatant or character, if any */
export function fichaDe(p: ProyeccionDirector, origen: OrigenFicha): FichaDirector | undefined {
  return 'combatiente' in origen
    ? p.fichas.find((f) => f.combatienteId === origen.combatiente.id || (origen.combatiente.characterId !== null && f.characterId === origen.combatiente.characterId))
    : p.fichas.find((f) => f.characterId === origen.personaje.id)
}

/** Spots around the centre of the map, so tokens placed one after another do not pile up */
const LUGARES: [number, number][] = [
  [0.5, 0.5], [0.56, 0.5], [0.44, 0.5], [0.5, 0.58], [0.5, 0.42], [0.56, 0.58], [0.44, 0.42], [0.56, 0.42], [0.44, 0.58], [0.62, 0.5], [0.38, 0.5], [0.62, 0.58],
]

const libre = (p: ProyeccionDirector, x: number, y: number) => !p.fichas.some((f) => Math.abs(f.x - x) < p.tamanoFicha && Math.abs(f.y - y) < p.tamanoFicha)

/** Puts a token on the map for a combatant or a character (none twice). Returns it, or null without a projection or room */
export function ponerFicha(b: PantallaEstado, origen: OrigenFicha, en?: { x: number; y: number }): FichaDirector | null {
  const p = b.mesa.proyeccion
  if (!p || p.fichas.length >= MAX_FICHAS) return null
  const ya = fichaDe(p, origen)
  if (ya) return ya
  const sitio = en ?? LUGARES.map(([x, y]) => ({ x, y })).find(({ x, y }) => libre(p, x, y)) ?? { x: 0.5, y: 0.5 }
  // An enemy's token is placed hidden: the director shows it when the party sees the enemy (Xavi, 24 Oct 2026)
  const f: FichaDirector = 'combatiente' in origen
    ? {
        id: nuevoId(), combatienteId: origen.combatiente.id, characterId: origen.combatiente.characterId, nombre: origen.combatiente.nombre,
        bando: origen.combatiente.bando, adversarioId: origen.combatiente.adversarioId, x: acotar(sitio.x), y: acotar(sitio.y),
        visible: origen.combatiente.bando !== 'pnj',
      }
    : { id: nuevoId(), combatienteId: null, characterId: origen.personaje.id, nombre: origen.personaje.name, bando: 'pj', adversarioId: null, x: acotar(sitio.x), y: acotar(sitio.y), visible: true }
  cambiarProyeccion(b, (q) => { q.fichas.push(f) })
  return f
}

/** Puts the whole party on the map in a row along the bottom edge (those already placed stay where they are) */
export function grupoAlMapa(b: PantallaEstado, grupo: OrigenFicha[]): number {
  const p = b.mesa.proyeccion
  if (!p) return 0
  const nuevos = grupo.filter((o) => !fichaDe(p, o))
  if (nuevos.length === 0) return 0
  const paso = nuevos.length > 1 ? Math.min(p.tamanoFicha * 1.4, 0.76 / (nuevos.length - 1)) : 0
  const x0 = 0.5 - (paso * (nuevos.length - 1)) / 2
  nuevos.forEach((o, i) => { ponerFicha(b, o, { x: x0 + paso * i, y: 0.92 }) })
  return nuevos.length
}

export const moverFicha = (b: PantallaEstado, id: string, x: number, y: number) =>
  cambiarProyeccion(b, (p) => {
    const f = p.fichas.find((q) => q.id === id)
    if (f) {
      f.x = acotar(x)
      f.y = acotar(y)
    }
  })

export const quitarFicha = (b: PantallaEstado, id: string) => cambiarProyeccion(b, (p) => { p.fichas = p.fichas.filter((f) => f.id !== id) })

export const fijarTamanoFichas = (b: PantallaEstado, tamano: number) => cambiarProyeccion(b, (p) => { p.tamanoFicha = acotarTamano(tamano) })

export const fijarNombresFichas = (b: PantallaEstado, mostrar: boolean) => cambiarProyeccion(b, (p) => { p.nombresFichas = mostrar })

export const alternarFichaVisible = (b: PantallaEstado, id: string) =>
  cambiarProyeccion(b, (p) => {
    const f = p.fichas.find((q) => q.id === id)
    if (f) f.visible = !f.visible
  })
