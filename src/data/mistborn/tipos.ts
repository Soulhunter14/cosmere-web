/**
 * Types of the metallic powers of Nacidos de la bruma (alomancia and feruquimia). Types only, no runtime code: T16 creates them because
 * T17 (alomancia.ts) and T18 (feruquimia.ts) run in parallel and both need them.
 *
 * A power is a `Potencia` of the talent engine (attribute, base cost, talents) without radiant orders (`ordenes`) and with what the
 * metalborn paths and the encyclopedia need. `src/lib/talentGraph.ts` tells the two apart with `'ordenes' in p` (Potencia) versus
 * `'caminos' in p` (PoderDef), §7.7. `src/worlds/types.ts` imports `PoderDef` as a type, so none of this reaches the main chunk.
 */
import type { ActivationType } from '../../components/TalentActivation'
import type { Era } from '../../types'
import type { Potencia } from '../potencias'
import type { ArteMetal, CaminoMetalId, MetalId } from './metales'

/** A basic action of a power (the «Acciones» of each entry): «Quemar acero», «Empujón de acero», «Almacenar velocidad»… */
export interface AccionPoder {
  nombre: string
  /** Glyph of the «Activación:» line of the book (1/2/3 actions, free, reaction, special) */
  activacion: ActivationType
  /** «Duración:» line, summarised: «1 ronda», «Instantánea», «Tantas rondas como grados en Feruquimia», «1 carga por escena»… */
  duracion: string
  /** What the action spends: Investidura (alomancia), cargas (feruquimia) or cuentas de atium; «Ninguno» if it costs nothing */
  coste: string
  /** Maintenance clause («Antes de que termine… puedes mantenerlo gastando… como 0»), when the action has one */
  mantener?: string
  /** What the action does, in own words */
  descripcion: string
  /** The ◆ bullets of the book (effects while burning, storing or tapping), summarised */
  efectos?: string[]
  /** Variants the player chooses from (Propulsar / Lanzar una moneda…) */
  opciones?: { nombre: string; descripcion: string }[]
}

/** An idea of the «Usos creativos» list of a power */
export interface UsoCreativo {
  nombre: string
  texto: string
}

/**
 * What alomantic and feruchemical powers share. Conventions for the inherited `Potencia` fields (T17 and T18 follow them alike):
 * `name` «Alomancia de acero» / «Feruquimia de acero»; `atributo` «Voluntad» (alomancia) or «Intelecto» (feruquimia), the attribute of
 * the Investida skill (L.128 / PDF 134); `costoBase` the activation of the first of `acciones`; `descripcion` a summary of the entry's intro.
 */
export interface PoderMetalico extends Omit<Potencia, 'ordenes'> {
  /** Art of the power: the discriminant of `PoderDef` */
  arte: ArteMetal
  /** Metal of the power. `id` is always `${arte}:${metal}` (`'alomancia:acero'`), the key of talent trees and grids (§2) */
  metal: MetalId
  /**
   * Metalborn paths whose main talent unlocks the power's tree, as in the header of each tree («Es posible desbloquear este árbol
   * mediante el talento principal de los caminos de…»). «Sin árbol» (alomancia de aluminio, feruquimia de nicrosil) does not mean
   * «sin camino»: both can be chosen (§7.5).
   */
  caminos: CaminoMetalId[]
  /** Eras where the metal is available: the «Era» column of the metal tables (same as `MetalDef.eras`). Filter with `isAvailable()` */
  eras: Era[]
  /** false only for alomancia de atium: no nascent version and no «Entrenar tu poder» goal (L.177 / PDF 183; L.133 / PDF 139) */
  requiereMeta: boolean
  acciones: AccionPoder[]
  usosCreativos: UsoCreativo[]
  /** Erratum or discrepancy of the book about the power (not about one of its talents: those carry their own `Talento.notaLibro`) */
  notaLibro?: string
}

export interface PoderAlomantico extends PoderMetalico {
  arte: 'alomancia'
}

export interface PoderFeruquimico extends PoderMetalico {
  arte: 'feruquimia'
  /** `acciones` of a feruchemical power is `[almacenar, decantar]` (the same two objects). Almacenar: `duracion` is the rule to gain a charge */
  almacenar: AccionPoder
  decantar: AccionPoder
  /** The book asks to note what each charge is tied to: cobre (experience or skill), bendaleo with talents (medicine or poison), nicrosil (Investida capacity) */
  cargasConVinculo: boolean
  /** Only cobre (L.228 / PDF 234): how long the stored memory lasts by degrees in Feruquimia; `grados` 6 stands for «6 o más» */
  tablaPorGrados?: { grados: number; valor: string }[]
  /** Feruchemical medallions (Era 2, L.293-294 / PDF 299-300): `disponibleParaPJ` false for nicrosil (L.294 / PDF 300) and atium (not in the table) */
  medallon: { disponibleParaPJ: boolean; rangoRecompensa: number | null }
}

export type PoderDef = PoderAlomantico | PoderFeruquimico
