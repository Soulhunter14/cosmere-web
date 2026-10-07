/**
 * Pure helpers of the «Artes metálicas» tab (T30, §7.6): what a power card shows and the changes it asks the server for. No React and no
 * I/O. Light on purpose: it only imports types and `metales.ts` (§8, risk 6).
 *
 * Every `cambio…` function takes the LATEST copy of the character (the one in the cache, which already holds the steps tapped before) and
 * returns the body of `PATCH …/recursos`, or `null` when nothing changes. So a counter that is tapped fast counts every tap, and a value
 * that is already at its limit sends no request (the server would only clamp it).
 */
import type { Character, PoderPersonaje, RecursosPatch, StatDesglose } from '../../types'
import { CATEGORIAS_ALOMANCIA, CATEGORIAS_FERUQUIMIA, METALES, type ArteMetal } from '../../data/mistborn/metales'

export const ARTES: ArteMetal[] = ['alomancia', 'feruquimia']
export const NOMBRE_ARTE: Record<ArteMetal, string> = { alomancia: 'Alomancia', feruquimia: 'Feruquimia' }

/** Origin of a power that does not come from the path: the rewards of the director (spike, lerasium alloy, medallion; L.288-295 / PDF 294-301) */
export type OrigenConcedido = Exclude<PoderPersonaje['origen'], 'camino'>
export const NOMBRE_ORIGEN: Record<OrigenConcedido, string> = {
  clavo: 'Clavo hemalúrgico',
  lerasium: 'Aleación de lerasium',
  medallon: 'Medallón feruquímico',
}

/** A power is told apart by art and metal (derived id `${arte}:${metal}`, §2) */
export type RefPoder = Pick<PoderPersonaje, 'arte' | 'metal'>

/**
 * What a card hands to the tab: a ready body, or a function of the latest character that builds it (so a step is counted from the value
 * in the cache and not from the one that was rendered). `null` = nothing to send.
 */
export type CambioPoder = RecursosPatch | ((vivo: Character) => RecursosPatch | null)

const metalDe = (metal: string) => METALES.find((m) => m.id === metal)

/** «Alomancia de acero»: the name of a power (the one `PoderDef.name` carries) */
export const nombrePoder = (p: RefPoder): string => `${NOMBRE_ARTE[p.arte]} de ${(metalDe(p.metal)?.nombre ?? p.metal).toLowerCase()}`

/**
 * «Físico – Externo – Empujón» (alomancia), «Divino» (alomancia de atium: no Externo/Interno nor Empujón/Tirón, «Metal divino», L.176 / PDF 182),
 * «Físico – Velocidad» (feruquimia: category and trait): the subtitle of a power (§7.6)
 */
export function subtituloPoder(p: RefPoder): string {
  const m = metalDe(p.metal)
  if (!m) return ''
  if (p.arte === 'feruquimia') return `${CATEGORIAS_FERUQUIMIA[m.categoriaFeruquimia]} – ${m.rasgoFeruquimico}`
  if (m.interno === null || m.empujon === null) return CATEGORIAS_ALOMANCIA[m.categoriaAlomancia]
  return `${CATEGORIAS_ALOMANCIA[m.categoriaAlomancia]} – ${m.interno ? 'Interno' : 'Externo'} – ${m.empujon ? 'Empujón' : 'Tirón'}`
}

/** The metal is a common one (the 8 physical and mental metals of alomancy: always at hand; the rest are rare and counted in vials, L.130 / PDF 136) */
export const esMetalComun = (metal: string): boolean => metalDe(metal)?.comun ?? false

const ordenMetal = (metal: string): number => {
  const i = METALES.findIndex((m) => m.id === metal)
  return i < 0 ? METALES.length : i
}

/** The powers of one art in the order of the book's table of metals (stable, whatever order the server keeps them in) */
export const poderesDe = (poderes: readonly PoderPersonaje[], arte: ArteMetal): PoderPersonaje[] =>
  poderes.filter((p) => p.arte === arte).sort((a, b) => ordenMetal(a.metal) - ordenMetal(b.metal))

/** Talents the character has learnt, by name (`Character.talentos` is a JSON array of names) */
export function talentosDe(c: Pick<Character, 'talentos'>): string[] {
  try {
    const v: unknown = JSON.parse(c.talentos || '[]')
    return Array.isArray(v) ? v.filter((t): t is string => typeof t === 'string') : []
  } catch {
    return []
  }
}

/** Value of a derived stat as the header shows it: `d8` (the die; «—» when there is no roll), `48 m`, or the plain number */
export function textoDerivado(d: StatDesglose): string {
  if (d.unidad === 'd') return d.total <= 1 ? '—' : `d${d.total}`
  if (d.unidad === 'm') return `${d.total} m`
  return String(d.total)
}

/** Breakdown of a derived stat, «3 (Grados en Alomancia) + 2 (Voluntad)»: the format of the stat cards of the sheet */
export const desgloseTexto = (d: StatDesglose): string => d.lineas.map((l) => `${l.valor} (${l.concepto})`).join(' + ')

/** Maximum charges of the metalmind of a feruchemical power: 0 while it is nascent, 8 in a medallion (`derivadosSet['poder.<metal>.cargasMax']`, §6.3) */
export const cargasMaxDe = (c: Pick<Character, 'derivadosSet'>, p: Pick<PoderPersonaje, 'metal'>): number =>
  c.derivadosSet[`poder.${p.metal}.cargasMax`]?.total ?? 0

const poderVivo = (vivo: Character, ref: RefPoder) => vivo.poderes.find((p) => p.arte === ref.arte && p.metal === ref.metal)

/**
 * The goal switch («Meta de nacido del metal completada»): flips `completo` from the latest value, so two quick taps end where they started. A power
 * that is born complete (spike, alloy, medallion, alomancia de atium) never goes back to nascent: the server keeps it complete (L.290 / PDF 296; L.177 / PDF 183)
 */
export function cambioCompleto(vivo: Character, ref: RefPoder): RecursosPatch | null {
  const p = poderVivo(vivo, ref)
  if (!p || (p.completo && (p.origen !== 'camino' || (p.arte === 'alomancia' && p.metal === 'atium')))) return null
  return { poderes: [{ arte: p.arte, metal: p.metal, completo: !p.completo }] }
}

/**
 * One step of the charges of a feruchemical power, from the latest value and inside 0..maximum. A medallion is only spent by a player:
 * storing in it makes no charges and it is replaced, not recharged (L.293 / PDF 299); the director can set any value.
 */
export function cambioDeCargas(vivo: Character, ref: RefPoder, delta: number, esGm: boolean): RecursosPatch | null {
  const p = poderVivo(vivo, ref)
  if (!p || p.arte !== 'feruquimia') return null
  const tope = cargasMaxDe(vivo, p)
  const actual = Math.min(tope, Math.max(0, p.cargas))
  let siguiente = Math.min(tope, Math.max(0, actual + delta))
  if (p.origen === 'medallon' && !esGm) siguiente = Math.min(siguiente, actual)
  return siguiente === actual ? null : { poderes: [{ arte: p.arte, metal: p.metal, cargas: siguiente }] }
}

/** One step of the vials of a rare alomantic metal (never below 0; the count of vials is the director's discretion, L.130 / PDF 136) */
export function cambioDeViales(vivo: Character, ref: RefPoder, delta: number): RecursosPatch | null {
  const p = poderVivo(vivo, ref)
  if (!p || p.arte !== 'alomancia') return null
  const siguiente = Math.max(0, p.viales + delta)
  return siguiente === p.viales ? null : { poderes: [{ arte: p.arte, metal: p.metal, viales: siguiente }] }
}

/** One step of the atium beads, a count apart from the vials and from the Investiture (L.176 / PDF 182) */
export function cambioDeCuentasAtium(vivo: Character, delta: number): RecursosPatch | null {
  const actual = Math.max(0, vivo.recursos.cuentasAtium ?? 0)
  const siguiente = Math.max(0, actual + delta)
  return siguiente === actual ? null : { recursos: { cuentasAtium: siguiente } }
}

/** Componedor: the metalmind of the power loses 1 maximum charge for good (L.155 / PDF 161); not below 0, which the server clamps anyway */
export function cambioComponedor(vivo: Character, ref: RefPoder): RecursosPatch | null {
  const p = poderVivo(vivo, ref)
  if (!p || p.arte !== 'feruquimia' || cargasMaxDe(vivo, p) <= 0) return null
  return { poderes: [{ arte: p.arte, metal: p.metal, ajusteCargasMax: p.ajusteCargasMax - 1 }] }
}

/** «Medallón nuevo»: the director swaps the medallion for a new one, with the full 8 charges (the goal «Canjear por un medallón nuevo», L.293 / PDF 299) */
export function cambioMedallonNuevo(vivo: Character, ref: RefPoder): RecursosPatch | null {
  const p = poderVivo(vivo, ref)
  if (!p || p.arte !== 'feruquimia') return null
  const tope = cargasMaxDe(vivo, p)
  const nuevas = tope > 0 ? tope : 8
  return p.cargas === nuevas ? null : { poderes: [{ arte: p.arte, metal: p.metal, cargas: nuevas }] }
}
