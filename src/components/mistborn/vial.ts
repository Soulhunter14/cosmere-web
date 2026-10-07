/**
 * Pure rules of «Beber vial» (Nacidos de la bruma, L.129-130 / PDF 135-136; §5.2, T31): which powers a vial acts upon and what drinking it does to the
 * character. The server applies the rule (`POST …/acciones/beber-vial`, `MistbornRules.AplicarAccionMesa`); this module only PREDICTS it: the sheet of the
 * vial (BeberVialSheet) shows the prediction before drinking, and the character sheet writes `conVialBebido` into the cache while the request is on its
 * way (the refetch that follows brings the server's own values). No React, no I/O and nothing but types imported: the character sheet loads this module
 * eagerly, outside the lazy chunk of the world, so it must stay tiny (§8, risk 6).
 */
import type { Character, PoderPersonaje } from '../../types'

/**
 * The powers a vial acts upon: the alomantic ones, atium aside. Atium is not drunk from a vial: its beads are counted apart from the vials and do not
 * raise the Investiture (L.176 / PDF 182), so a vial never makes it Desprovisto either (§5.2)
 */
export const esPoderDelVial = (p: Pick<PoderPersonaje, 'arte' | 'metal'>): boolean => p.arte === 'alomancia' && p.metal !== 'atium'

/** The vial holds a metal that one of the powers burns, so drinking it brings the Investiture back to its maximum («recuperas Investidura hasta tu valor máximo», L.129 / PDF 135) */
export const quemaElVial = (poderes: readonly PoderPersonaje[], metales: readonly string[]): boolean =>
  poderes.some((p) => esPoderDelVial(p) && metales.includes(p.metal))

/**
 * The character as the server will leave it after the vial, as far as the page can tell without asking: the Investiture at its maximum if the vial
 * holds a metal that is burnt, and every power of the vial Desprovisto unless its metal is in it (L.129 / PDF 135). The vials spent (one of each rare
 * metal that was in it) arrive with the refetch.
 */
export function conVialBebido(c: Character, metales: readonly string[]): Character {
  return {
    ...c,
    recursos: quemaElVial(c.poderes, metales) ? { ...c.recursos, investiduraActual: c.investidura?.total ?? 0 } : c.recursos,
    poderes: c.poderes.map((p) => (esPoderDelVial(p) ? { ...p, desprovisto: !metales.includes(p.metal) } : p)),
  }
}
