/**
 * Pure helpers of the section «Clavos hemalúrgicos» of the «Artes metálicas» tab (T49b, §9; «Efectos conocidos de los clavos hemalúrgicos», L.291 /
 * PDF 297; implanting and extracting, L.289-290 / PDF 295-296). No React and no I/O. Light on purpose: it only imports types, `hemalurgia.ts`
 * (which imports nothing), `metales.ts` and the helpers of the tab (§8, risk 6).
 *
 * The spikes live in their own list, `Character.clavos`, apart from the powers (T49a): an attribute spike (cinc, cobre, estaño, hierro) grants no power
 * but raises an attribute and lowers Defensa espiritual, and the metal of a power spike is not the metal of its power (an acero spike grants an alomancy
 * to pick among hierro, peltre, acero and estaño). The server computes every effect (bonuses, the lines of Defensa espiritual, the grade of an existing
 * power, `hemalurgia.clavosMax`); what the sheet sends is only the list of spikes and, for a spike that grants a power the character does not have, that
 * power as `origen: 'clavo'` in the same `PUT` (T49a: «un clavo cuyo poder no figura en poderes no da nada»).
 */
import type { Character, ClavoHemalurgico, PoderPersonaje } from '../../types'
import { TIPOS_CLAVO, type OpcionPoderClavo, type TipoClavo } from '../../data/mistborn/hemalurgia'
import { METALES, type ArteMetal } from '../../data/mistborn/metales'
import { idPoder, planAnadirPoder, type EntornoCaminoMetal } from './caminoMetalFlujo'
import { nombrePoder } from './poderes'

const metalDe = (id: string) => METALES.find((m) => m.id === id)

/** Type of spike of a metal in the table of L.291 / PDF 297; `undefined` for a metal that has none (atium, the divine metals) */
export const tipoDeClavo = (metal: string): TipoClavo | undefined => TIPOS_CLAVO.find((t) => t.metal === metal)

/** «Clavo de estaño»: the name of the spike of a metal, the same concept the server writes in its breakdown lines */
export const nombreClavo = (metal: string): string => `Clavo de ${(metalDe(metal)?.nombre ?? metal).toLowerCase()}`

/** `'alomancia:hierro'` → art and metal of the power a spike grants */
export function partesPoder(poder: string): { arte: ArteMetal; metal: string } {
  const [arte, metal] = poder.split(':')
  return { arte: arte as ArteMetal, metal }
}

/** What a spike gives, in a few words: «Intelecto +1» (attribute) or «Alomancia de hierro» (power) */
export function efectoClavo(k: Pick<ClavoHemalurgico, 'metalClavo' | 'poderElegido'>): string {
  if (k.poderElegido) return nombrePoder(partesPoder(k.poderElegido))
  const tipo = tipoDeClavo(k.metalClavo)
  if (tipo?.tipo === 'atributo') return tipo.efecto
  return tipo?.tipo === 'poder' ? 'Poder sin elegir' : 'Sin efecto conocido'
}

/** Spikes that take effect: only an implanted one does (an extracted one keeps its data but its effects end, L.290 / PDF 296) */
export const implantados = (clavos: readonly ClavoHemalurgico[]): ClavoHemalurgico[] => clavos.filter((k) => k.implantado)

/**
 * Reward rank of the NEXT spike of a metal: the one of its type plus 1 for every spike of that metal the character already owns (L.288 / PDF 294).
 * Informative: the server does not check ranks
 */
export const rangoDeRecompensa = (tipo: TipoClavo, clavos: readonly ClavoHemalurgico[]): number =>
  tipo.rango + clavos.filter((k) => k.metalClavo === tipo.metal).length

export interface PlanClavos {
  /** Character fields to write with the PUT: the whole list of spikes and, if the spike grants a new power, the list of powers (and its Investida skill) */
  cambio: Partial<Character>
  /** The Investida skill that found no free cognitive slot: the plan must not be saved, the director frees one (Q4) */
  faltan: string[]
}

/**
 * Implants a spike: it goes at the end of the list, implanted and not secret. A power spike also brings its power, born complete and without a goal
 * (`origen: 'clavo'`, §5.3), and the Investida skill of its art at 0 degrees in the first free cognitive slot when the character has none (L.290 / PDF
 * 296; `planAnadirPoder`, the same as «Añadir poder»). When the character ALREADY has the power, from any origin, nothing is added: the server counts the
 * spike as one more grade of its skill, which does not count for the maximum (L.290 / PDF 296, «Poder existente»).
 */
export function planImplantarClavo(base: Character, tipo: TipoClavo, poderElegido: OpcionPoderClavo | null, entorno: EntornoCaminoMetal): PlanClavos {
  const clavo: ClavoHemalurgico = { metalClavo: tipo.metal, poderElegido: tipo.tipo === 'poder' ? poderElegido : null, implantado: true, secreto: false }
  const clavos = [...base.clavos, clavo]
  if (!clavo.poderElegido || base.poderes.some((p) => idPoder(p) === clavo.poderElegido)) return { cambio: { clavos }, faltan: [] }

  const { arte, metal } = partesPoder(clavo.poderElegido)
  const poder: PoderPersonaje = { arte, metal, origen: 'clavo', completo: true, metaId: null, cargas: 0, ajusteCargasMax: 0, viales: 0, desprovisto: false }
  const plan = planAnadirPoder(base, poder, entorno)
  return { cambio: { ...plan.cambio, clavos }, faltan: plan.faltan }
}

export interface PlanExtraer {
  /** Character fields to write with the PUT: the list without the spike and, when its power goes with it, the list of powers */
  cambio: Partial<Character>
  /** The power that leaves with the spike (the confirmation names it); `null` when no power leaves */
  poderQuitado: PoderPersonaje | null
}

/**
 * Extracts the spike at `indice`: it leaves the list and, with it, the effects the server derives from it (the attribute bonus, the lines of Defensa
 * espiritual, the extra grade). The power it granted goes too (`origen: 'clavo'`) [inferido: L.290 / PDF 296 says the character stops receiving the power],
 * unless another implanted spike still grants it, and a power the character has from another origin (path, lerasium alloy, medallion) is never touched.
 * The Investida skill stays: its degrees may have been raised by hand and the book does not say it is lost.
 */
export function planExtraerClavo(base: Character, indice: number): PlanExtraer {
  const clavo = base.clavos[indice]
  if (!clavo) return { cambio: {}, poderQuitado: null }
  const clavos = base.clavos.filter((_, i) => i !== indice)
  const id = clavo.poderElegido
  const quitado = id && !implantados(clavos).some((k) => k.poderElegido === id) ? base.poderes.find((p) => idPoder(p) === id && p.origen === 'clavo') : undefined
  if (!quitado) return { cambio: { clavos }, poderQuitado: null }
  return { cambio: { clavos, poderes: base.poderes.filter((p) => p !== quitado) }, poderQuitado: quitado }
}
