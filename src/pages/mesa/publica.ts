/**
 * «La mesa»: the document the players read (`GmScreens.Mesa`, `GET /campaigns/{id}/mesa`). The director's screen derives it from
 * its own document with `proyectarMesa` (src/pages/pantalla/mesa.ts), which is the whitelist of what leaves the screen, and saves
 * it in the same PUT. This module is pure and shared by both sides; it only takes TYPES from the director's state, so the
 * players' chunk never pulls the screen's logic. `normalizarMesa` turns any stored JSON (older, partial, `{}`) into a valid document.
 */
import type { EstadoAplicado, Fase, Recurso, Retirado, Turno } from '../pantalla/estado'

/** Bumped when a release adds fields; an older app shows «Actualiza la app» instead of a half-read document */
export const VERSION_MESA = 1
/** Images shown in the session that the DIRECTOR keeps at hand to show again (never published: the players see only the current one) */
export const MAX_PROYECCIONES = 10

/** The book's round order, as `FASES` in estado.ts (copied here so this module needs no runtime import of the screen) */
const FASES_MESA: readonly Fase[] = ['pj-rapido', 'pnj-rapido', 'pj-lento', 'pnj-lento']
const TURNOS: readonly Turno[] = ['rapido', 'lento']

/** Health hint of an enemy, when the director shows it: no damage; damaged but above a quarter; a quarter or less; at 0 */
export type PistaSalud = 'intacto' | 'herido' | 'malherido' | 'caido'
const PISTAS: readonly PistaSalud[] = ['intacto', 'herido', 'malherido', 'caido']
export const PISTA_LABEL: Record<PistaSalud, string> = { intacto: 'Intacto', herido: 'Herido', malherido: 'Malherido', caido: 'Caído' }

export const pistaSalud = (salud: Recurso, derrotado: boolean): PistaSalud =>
  derrotado || salud.actual <= 0 ? 'caido' : salud.actual >= salud.max ? 'intacto' : salud.actual <= salud.max / 4 ? 'malherido' : 'herido'

/** Where an image shown to the players comes from */
export type OrigenImagen =
  /** A path of the web (`/maps/…`, `/aventura/…`) or an external URL: goes straight into an <img src> */
  | { tipo: 'publica'; url: string }
  /** An image the director uploaded to the campaign (`/campaigns/{id}/mesa/imagenes/{imagenId}`, with the token) */
  | { tipo: 'subida'; imagenId: number }
  /** The book's illustration of an adversary (`/global-npcs/{id}/book-images/retrato`, with the token) */
  | { tipo: 'retrato'; adversarioId: number }

/** A part of the image the players may see, as fractions of its width and height (0..1): the same on every screen and zoom */
export interface ZonaNiebla { x: number; y: number; w: number; h: number }

/** Fog of war over a projected map: while active, the players see only the uncovered zones (black everywhere else) */
export interface Niebla {
  activa: boolean
  zonas: ZonaNiebla[]
}
export const MAX_ZONAS = 50
/** Smallest side of a zone (1 % of the image): a tap that did not drag never uncovers anything */
export const ZONA_MINIMA = 0.01

export const sinNiebla = (): Niebla => ({ activa: false, zonas: [] })
/** The map fully covered: the director uncovers it zone by zone */
export const nieblaCerrada = (): Niebla => ({ activa: true, zonas: [] })

export interface Proyeccion {
  id: string
  imagen: OrigenImagen
  titulo: string
  /** What the director says with it («Veis esto…»), '' = nothing */
  pie: string
  /** ISO date when it was shown */
  en: string
  niebla: Niebla
}

/** A character (or an ally added by the director): the players see everything the director tracks of their side */
export interface AliadoMesa {
  id: string
  nombre: string
  /** null = an ally without a character («Aliado») */
  characterId: number | null
  turno: Turno
  actuoRapido: boolean
  actuoLento: boolean
  reaccionUsada: boolean
  salud: Recurso
  concentracion: Recurso
  investidura: Recurso
  estados: EstadoAplicado[]
  derrotado: boolean
}

/** An enemy: its name, its conditions and whether it acted or fell. Never its numbers */
export interface EnemigoMesa {
  id: string
  nombre: string
  /** For the book's portrait, or null */
  adversarioId: number | null
  turno: Turno
  actuoRapido: boolean
  actuoLento: boolean
  estados: EstadoAplicado[]
  derrotado: boolean
  /** Only when the director shows it for this enemy; null = not shown */
  pistaSalud: PistaSalud | null
}

export interface EncuentroMesa {
  id: string
  titulo: string
  ronda: number
  fase: Fase
  aliados: AliadoMesa[]
  enemigos: EnemigoMesa[]
  retirados: Retirado[]
}

export interface MesaPublica {
  version: typeof VERSION_MESA
  sesion: { numero: number | null; titulo: string; iniciadaEn: string } | null
  /** The encounters the director shows, the one on screen first */
  encuentros: EncuentroMesa[]
  /** What is on the table right now, or null: «Quitar de la mesa» leaves the players with nothing (the history is the director's) */
  proyeccion: Proyeccion | null
}

export const mesaVacia = (): MesaPublica => ({ version: VERSION_MESA, sesion: null, encuentros: [], proyeccion: null })

// ── Normalization (any stored JSON → a valid document) ──────────────────────

type Obj = Record<string, unknown>
const esObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const texto = (v: unknown, def = ''): string => (typeof v === 'string' ? v : def)
const entero = (v: unknown, def = 0): number => (typeof v === 'number' && Number.isFinite(v) ? Math.trunc(v) : def)
const logico = (v: unknown): boolean => v === true
const una = <T extends string>(v: unknown, opciones: readonly T[], def: T): T => (opciones.includes(v as T) ? (v as T) : def)
const lista = <T>(v: unknown, f: (x: unknown) => T | null): T[] => (Array.isArray(v) ? v.map(f).filter((x): x is T => x !== null) : [])
const idDe = (v: unknown, def: string): string => texto(v) || def

const recurso = (v: unknown): Recurso => {
  const o = esObj(v) ? v : {}
  const max = Math.max(0, entero(o.max))
  return { max, actual: Math.min(max, Math.max(0, entero(o.actual, max))) }
}

const estados = (v: unknown): EstadoAplicado[] => lista(v, (e) => (esObj(e) && texto(e.id) ? { id: texto(e.id), valor: texto(e.valor) } : null))

export const origenImagen = (v: unknown): OrigenImagen | null => {
  if (!esObj(v)) return null
  if (v.tipo === 'publica' && texto(v.url)) return { tipo: 'publica', url: texto(v.url) }
  if (v.tipo === 'subida' && entero(v.imagenId) > 0) return { tipo: 'subida', imagenId: entero(v.imagenId) }
  if (v.tipo === 'retrato' && entero(v.adversarioId) > 0) return { tipo: 'retrato', adversarioId: entero(v.adversarioId) }
  return null
}

const fraccion = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? Math.min(1, Math.max(0, v)) : null)

/** A zone clipped to the image; one too small to see (or malformed) is dropped */
export const zonaNiebla = (v: unknown): ZonaNiebla | null => {
  if (!esObj(v)) return null
  const x = fraccion(v.x)
  const y = fraccion(v.y)
  const w = fraccion(v.w)
  const h = fraccion(v.h)
  if (x === null || y === null || w === null || h === null) return null
  const z = { x, y, w: Math.min(w, 1 - x), h: Math.min(h, 1 - y) }
  return z.w >= ZONA_MINIMA && z.h >= ZONA_MINIMA ? z : null
}

export const niebla = (v: unknown): Niebla => (esObj(v) ? { activa: logico(v.activa), zonas: lista(v.zonas, zonaNiebla).slice(0, MAX_ZONAS) } : sinNiebla())

export const proyeccion = (v: unknown): Proyeccion | null => {
  if (!esObj(v)) return null
  const imagen = origenImagen(v.imagen)
  return imagen
    ? { id: idDe(v.id, `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`), imagen, titulo: texto(v.titulo), pie: texto(v.pie), en: texto(v.en), niebla: niebla(v.niebla) }
    : null
}

const aliado = (v: unknown, i: number): AliadoMesa | null =>
  esObj(v) && texto(v.nombre)
    ? {
        id: idDe(v.id, `aliado-${i}`),
        nombre: texto(v.nombre),
        characterId: typeof v.characterId === 'number' && Number.isFinite(v.characterId) ? Math.trunc(v.characterId) : null,
        turno: una(v.turno, TURNOS, 'rapido'),
        actuoRapido: logico(v.actuoRapido),
        actuoLento: logico(v.actuoLento),
        reaccionUsada: logico(v.reaccionUsada),
        salud: recurso(v.salud),
        concentracion: recurso(v.concentracion),
        investidura: recurso(v.investidura),
        estados: estados(v.estados),
        derrotado: logico(v.derrotado),
      }
    : null

const enemigo = (v: unknown, i: number): EnemigoMesa | null =>
  esObj(v) && texto(v.nombre)
    ? {
        id: idDe(v.id, `enemigo-${i}`),
        nombre: texto(v.nombre),
        adversarioId: typeof v.adversarioId === 'number' && Number.isFinite(v.adversarioId) ? Math.trunc(v.adversarioId) : null,
        turno: una(v.turno, TURNOS, 'rapido'),
        actuoRapido: logico(v.actuoRapido),
        actuoLento: logico(v.actuoLento),
        estados: estados(v.estados),
        derrotado: logico(v.derrotado),
        pistaSalud: PISTAS.includes(v.pistaSalud as PistaSalud) ? (v.pistaSalud as PistaSalud) : null,
      }
    : null

const retirado = (v: unknown): Retirado | null =>
  esObj(v) && texto(v.nombre) ? { nombre: texto(v.nombre), motivo: una(v.motivo, ['derrotado', 'huido', 'rendido'] as const, 'derrotado') } : null

const encuentro = (v: unknown, i: number): EncuentroMesa | null =>
  esObj(v)
    ? {
        id: idDe(v.id, `encuentro-${i}`),
        titulo: texto(v.titulo, 'Encuentro') || 'Encuentro',
        ronda: Math.max(1, entero(v.ronda, 1)),
        fase: una(v.fase, FASES_MESA, 'pj-rapido'),
        aliados: Array.isArray(v.aliados) ? v.aliados.map(aliado).filter((x): x is AliadoMesa => x !== null) : [],
        enemigos: Array.isArray(v.enemigos) ? v.enemigos.map(enemigo).filter((x): x is EnemigoMesa => x !== null) : [],
        retirados: lista(v.retirados, retirado),
      }
    : null

export function normalizarMesa(raw: unknown): MesaPublica {
  const o = esObj(raw) ? raw : {}
  const s = esObj(o.sesion) ? o.sesion : null
  return {
    version: VERSION_MESA,
    sesion: s ? { numero: typeof s.numero === 'number' && Number.isFinite(s.numero) ? Math.trunc(s.numero) : null, titulo: texto(s.titulo), iniciadaEn: texto(s.iniciadaEn) } : null,
    encuentros: Array.isArray(o.encuentros) ? o.encuentros.map(encuentro).filter((x): x is EncuentroMesa => x !== null) : [],
    proyeccion: proyeccion(o.proyeccion),
  }
}

/** The stored document comes from a newer release of the app than this one */
export const esMasNueva = (raw: unknown): boolean => esObj(raw) && typeof raw.version === 'number' && raw.version > VERSION_MESA

/** Two origins show the same picture */
export const mismaImagen = (a: OrigenImagen, b: OrigenImagen): boolean =>
  a.tipo === b.tipo
  && (a.tipo === 'publica' ? a.url === (b as { url: string }).url
    : a.tipo === 'subida' ? a.imagenId === (b as { imagenId: number }).imagenId
      : a.adversarioId === (b as { adversarioId: number }).adversarioId)
