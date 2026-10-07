/**
 * The «Equipo inicial» flow (T47, L.254-255 / PDF 260-261) as pure functions: which weapons a package offers in an era, how much money
 * its dice give, what the benefit of Fugitivo and Guardador does to THIS character, and exactly what has to be saved.
 *
 * EquipoInicialSheet runs these functions and writes the result with a `PUT` of the whole character (weapons, armor, equipment), a
 * `PATCH …/recursos` (arquillas) and, for Fugitivo and Guardador, the conclusion of the initial metalborn goal (the server then marks
 * the power complete, T14). No React and no I/O. It lives with the other components of Nacidos de la bruma, so it is loaded lazily from
 * components/mistborn/index.ts together with the data it imports BY FILE (§7.4 rule 4, §8 risk 6).
 */
import type { Character, Era, PoderPersonaje } from '../../types'
import { CAMINOS_NACIDOS_DEL_METAL } from '../../data/mistborn/caminosNacidosDelMetal'
import {
  ARMAS_POR_GRUPO,
  MULTIPLICADOR_DINERO_ERA2,
  type ArmaElegida,
  type ArmaPaquete,
  type PaqueteInicial,
} from '../../data/mistborn/equipoInicial'
import type { ArteMetal } from '../../data/mistborn/metales'

/** The weapon rows of the package that exist in this era, in the order of the book (Indagador: the knife in Era 1, the boot pistol in Era 2) */
export function armasDeLaEra(paquete: PaqueteInicial, era: Era | null): ArmaPaquete[] {
  return paquete.armas.filter((a) => a.tipo === 'eleccion' || a.era === undefined || a.era === era)
}

/**
 * Names a picker offers for one choice: the weapons of its category that exist in this era AND in the catalog of the campaign (a name
 * that is not in the catalog would be saved without weight or description), the extra ones first (Artesano: the hammer), without repeats
 */
export function opcionesDeArma(arma: ArmaElegida, era: Era | null, catalogo: readonly { name: string }[]): string[] {
  const enCatalogo = new Set(catalogo.map((w) => w.name))
  const delGrupo = ARMAS_POR_GRUPO[arma.grupo].filter((w) => w.era === undefined || w.era === era).map((w) => w.nombre)
  return [...new Set([...(arma.ademas ?? []), ...delGrupo])].filter((nombre) => enCatalogo.has(nombre))
}

/** The dice of the package in this era: `dados`d`caras`, times `multiplicador` (10 in Era 2, L.254 / PDF 260) */
export interface DineroDelPaquete {
  dados: number
  caras: number
  multiplicador: number
}

export function dineroDelPaquete(paquete: PaqueteInicial, era: Era | null): DineroDelPaquete | null {
  return paquete.dinero ? { ...paquete.dinero, multiplicador: era === 'era2' ? MULTIPLICADOR_DINERO_ERA2 : 1 } : null
}

/** The arquillas a roll gives: the sum of the dice times the multiplier of the era */
export const arquillasDeLaTirada = (resultados: readonly number[], multiplicador: number): number =>
  resultados.reduce((suma, d) => suma + d, 0) * multiplicador

/** Adds to an amount of arquillas without floating-point noise (the server only accepts 2 decimals, §4.2) */
export const sumarArquillas = (actual: number, anadir: number): number => Number((actual + anadir).toFixed(2))

/**
 * What the benefit «completes the initial goal of the art» (Fugitivo: alomancia, Guardador: feruquimia; L.255 / PDF 261) does to this
 * character: the goal is the first one linked to a power of the art that its metalborn path gave it.
 * - `concluir`: there is a goal to conclude; the powers it trains become complete.
 * - `completa`: the initial goal is already completed (or the power needed none, like alomancia de atium).
 * - `sin-camino`, `camino-sin-arte`, `sin-meta`: nothing to conclude; the director marks the power by hand with the switch «Meta de
 *   nacido del metal completada» of the tab «Artes metálicas» (§7.4 step 5, Q14).
 */
export type EstadoMeta =
  | { tipo: 'concluir'; arte: ArteMetal; metaId: number; titulo: string | null; poderes: PoderPersonaje[] }
  | { tipo: 'completa'; arte: ArteMetal }
  | { tipo: 'sin-camino'; arte: ArteMetal }
  | { tipo: 'camino-sin-arte'; arte: ArteMetal; camino: string }
  | { tipo: 'sin-meta'; arte: ArteMetal }

/**
 * The initial goal of an art is the OLDEST one linked to a power of the art that the path gave (lowest id): later goals are the
 * «Nueva meta de nacido del metal» of other powers (L.141 / PDF 147; L.146 / PDF 152) and the benefit does not touch them
 */
export function estadoMeta(arte: ArteMetal, personaje: Pick<Character, 'caminoMetal' | 'poderes' | 'metas'>): EstadoMeta {
  const camino = CAMINOS_NACIDOS_DEL_METAL.find((c) => c.id === personaje.caminoMetal)
  if (!camino) return { tipo: 'sin-camino', arte }
  if (camino.poderes[arte] === 0) return { tipo: 'camino-sin-arte', arte, camino: camino.name }
  const delCamino = personaje.poderes.filter((p) => p.arte === arte && p.origen === 'camino')
  const enlazados = delCamino.filter((p) => p.metaId !== null)
  if (enlazados.length === 0) {
    return delCamino.length > 0 && delCamino.every((p) => p.completo) ? { tipo: 'completa', arte } : { tipo: 'sin-meta', arte }
  }
  const metaId = Math.min(...enlazados.map((p) => p.metaId as number))
  const poderes = enlazados.filter((p) => p.metaId === metaId)
  const meta = personaje.metas?.find((m) => m.id === metaId)
  if (meta?.estado === 'concluida' || poderes.every((p) => p.completo)) return { tipo: 'completa', arte }
  return { tipo: 'concluir', arte, metaId, titulo: meta?.titulo ?? null, poderes }
}

/** What the player has decided and rolled; the plan is only `listo` when `pendiente` is empty */
export interface EntradaPlan {
  paquete: PaqueteInicial
  era: Era | null
  /** Weapon picked for each row of `armasDeLaEra(paquete, era)` (`''` or missing = not picked yet; fixed rows ignore it) */
  elecciones: readonly string[]
  /** Result of the dice (the sum, BEFORE the multiplier of the era); `null` = not rolled yet */
  tirada: readonly number[] | null
  personaje: Pick<Character, 'caminoMetal' | 'poderes' | 'metas'>
}

export interface PlanEquipoInicial {
  /** Names to add to `weapons`, `armor` and `equipment` (a quantity is the same name repeated: the bag has no quantity field) */
  armas: string[]
  armaduras: string[]
  equipo: string[]
  /** Arquillas to add: the roll times the multiplier of the era; 0 = the package gives no money */
  arquillas: number
  /** What the benefit does to the character; `null` = the package has no goal-completing benefit */
  meta: EstadoMeta | null
  /** What is still missing before it can be applied, as phrases for «Falta …»: «elegir «Arma ligera»», «tirar los dados» */
  pendiente: string[]
}

export function planEquipoInicial({ paquete, era, elecciones, tirada, personaje }: EntradaPlan): PlanEquipoInicial {
  const filas = armasDeLaEra(paquete, era)
  const pendiente: string[] = []
  const armas: string[] = []
  filas.forEach((fila, i) => {
    if (fila.tipo === 'fijo') armas.push(fila.nombre)
    else if (elecciones[i]) armas.push(elecciones[i])
    else pendiente.push(`elegir «${fila.etiqueta}»`)
  })
  const dinero = dineroDelPaquete(paquete, era)
  if (dinero && !tirada) pendiente.push('tirar los dados')
  const arte = paquete.beneficios.find((b) => b.completaMeta)?.completaMeta
  return {
    armas,
    armaduras: [...paquete.armaduras],
    equipo: paquete.equipo.flatMap((o) => Array.from({ length: o.cantidad }, () => o.nombre)),
    arquillas: dinero && tirada ? arquillasDeLaTirada(tirada, dinero.multiplicador) : 0,
    meta: arte ? estadoMeta(arte, personaje) : null,
    pendiente,
  }
}

/** The three lists of the bag with the package added after what the character already carries */
export function bolsaConPaquete(
  actual: Pick<Character, 'weapons' | 'armor' | 'equipment'>,
  plan: Pick<PlanEquipoInicial, 'armas' | 'armaduras' | 'equipo'>,
): { weapons: string[]; armor: string[]; equipment: string[] } {
  return {
    weapons: [...(actual.weapons ?? []), ...plan.armas],
    armor: [...(actual.armor ?? []), ...plan.armaduras],
    equipment: [...(actual.equipment ?? []), ...plan.equipo],
  }
}

/** The bag already holds something (objects or arquillas): a second package would add to it, and the book gives only one */
export const bolsaConContenido = (c: Pick<Character, 'weapons' | 'armor' | 'equipment' | 'recursos'>): boolean =>
  (c.weapons?.length ?? 0) + (c.armor?.length ?? 0) + (c.equipment?.length ?? 0) > 0 || (c.recursos?.arquillas ?? 0) > 0
