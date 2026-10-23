/**
 * «La mesa» seen from the director's screen: `proyectarMesa` is the WHITELIST of what the players get (the public document the
 * provider saves next to the screen), and the operations that show or hide images. Pure, like estado.ts: the panels change the
 * document through `usePantalla().actualizar`.
 */
import {
  MAX_PROYECCIONES, MAX_ZONAS, VERSION_MESA, mismaImagen, nieblaCerrada, pistaSalud, sinNiebla, zonaNiebla,
  type AliadoMesa, type EncuentroMesa, type EnemigoMesa, type MesaPublica, type Niebla, type OrigenImagen, type Proyeccion, type ZonaNiebla,
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

/** Of an enemy: name, conditions, turn, fallen, and the health hint only when the director shows it. No numbers, no stat block */
const enemigoMesa = (c: Combatiente): EnemigoMesa => ({
  id: c.id,
  nombre: c.nombre,
  adversarioId: c.adversarioId,
  turno: c.turno,
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
const copiaProyeccion = (p: Proyeccion): Proyeccion => ({ id: p.id, imagen: { ...p.imagen }, titulo: p.titulo, pie: p.pie, en: p.en, niebla: copiaNiebla(p.niebla) })

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
    proyeccion: b.mesa.proyeccion ? copiaProyeccion(b.mesa.proyeccion) : null,
  }
}

/**
 * Shows an image to the players: it becomes the projection and goes first in the session's history (an image shown before moves
 * up instead of repeating). The log notes it, so the chronicle knows what the table saw.
 */
export function mostrarEnMesa(
  b: PantallaEstado, imagen: OrigenImagen, titulo: string, pie: string, ultimoDiario: number | null, niebla: Niebla = nieblaInicial(titulo),
): Proyeccion {
  const p: Proyeccion = { id: nuevoId(), imagen, titulo: titulo.trim(), pie: pie.trim(), en: ahoraIso(), niebla: copiaNiebla(niebla) }
  b.mesa.proyeccion = p
  b.mesa.proyecciones = [p, ...b.mesa.proyecciones.filter((q) => !mismaImagen(q.imagen, imagen))].slice(0, MAX_PROYECCIONES)
  anotar(b, { tipo: 'apunte', etiqueta: 'Mesa', texto: `Se muestra a la mesa: ${p.titulo || 'una imagen'}` }, ultimoDiario)
  return p
}

/** Shows again an image of the session's history, with the fog as it was left */
export function volverAMostrar(b: PantallaEstado, id: string, ultimoDiario: number | null): Proyeccion | null {
  const p = b.mesa.proyecciones.find((q) => q.id === id)
  return p ? mostrarEnMesa(b, p.imagen, p.titulo, p.pie, ultimoDiario, p.niebla) : null
}

/** Changes the fog of the current projection (and of its copy in the history): the recipe mutates it */
export function cambiarNiebla(b: PantallaEstado, receta: (n: Niebla) => void) {
  const p = b.mesa.proyeccion
  if (!p) return
  receta(p.niebla)
  p.niebla.zonas.splice(MAX_ZONAS)
  const h = b.mesa.proyecciones.find((q) => q.id === p.id)
  if (h) h.niebla = copiaNiebla(p.niebla)
}

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
  const p = b.mesa.proyeccion
  if (!p) return
  if (cambios.titulo !== undefined) p.titulo = cambios.titulo.trim()
  if (cambios.pie !== undefined) p.pie = cambios.pie.trim()
  const h = b.mesa.proyecciones.find((q) => q.id === p.id)
  if (h) {
    h.titulo = p.titulo
    h.pie = p.pie
  }
}

/** Enemies of a fight the players do not see */
export const enemigosOcultos = (e: Encuentro) => e.combatientes.filter((c) => c.bando === 'pnj' && c.oculto).length
