/**
 * TalentRules — the talent data of one world, as the Cosmere talent engine reads it (spec §7.7, P8).
 *
 * talentGraph.ts is Cosmere: it never names a world nor compares world ids. What belongs to a world reaches it through one TalentRules
 * object: its heroic paths, its Investida paths (radiant orders, metalborn paths), its powers (potencias, metallic powers), its
 * ancestry trees, the grids and card summaries of the talent map, the skill names of its prerequisites and a few rule flags that each
 * world fills in.
 *
 * - STORMLIGHT_TALENTOS (below): the current Stormlight data by reference (same objects, same order: P1). Every `rules` parameter of
 *   talentGraph.ts defaults to it, so a call without rules builds exactly what it built before.
 * - MISTBORN_TALENTOS: composed in src/worlds/mistborn.data.ts, the lazy chunk of that world. No file of src/lib/ imports data of
 *   Scadrial at run time (§8, risk 6): the Mistborn names below are type-only imports.
 *
 * SKILL_NAME_MAP (Cosmere), IDEAL_NAMES and FORMAS_INICIALES (Roshar) live here and talentGraph.ts re-exports them: talentGraph.ts
 * imports this module for its defaults, so this module takes nothing but types from it (in an import cycle, whichever of the two
 * modules ran first would read the other one's constants before they exist).
 */
import type { WorldId } from '../types'
import type { CaminoInvestidoDef, PoderDef } from '../worlds/types'
import type { ArbolAscendencia } from '../data/mistborn/origenes'
import type { SkillField } from './talentGraph'
import type { TalentGrid } from './talentTypes'
import { HEROIC_PATHS, type HeroicPath } from '../data/heroicPaths'
import { RADIANT_ORDERS } from '../data/radiantOrders'
import { POTENCIAS, type Potencia } from '../data/potencias'
import { ARBOL_CANTOR, type TalentoCantor } from '../data/cantores'
import { TALENT_GRIDS } from '../data/talentGrids'
import { TALENT_SUMMARIES } from '../data/talentSummaries'

export interface TalentRules {
  id: WorldId
  caminosHeroicos: HeroicPath[]
  /** Radiant orders (Stormlight) or metalborn paths (Mistborn): talentGraph.ts tells them apart by their shape, never by the world */
  caminosInvestidos: CaminoInvestidoDef[]
  /** Potencias (Stormlight) or metallic powers (Mistborn): `'ordenes' in p` is a Potencia, `'caminos' in p` a PoderDef */
  poderes: (Potencia | PoderDef)[]
  /**
   * Ancestry trees by the slug of `Character.ascendencia` (§7.7 #3): `{ humano, kandra, 'sangre-koloss' }` in Mistborn, each with the
   * calendar and tree of the ancestry (`ArbolAscendencia`, T20); `{ oyente: ARBOL_CANTOR }` in Stormlight, where the singer tree stays
   * the plain list that the 'cantor' block of the graph has always read (P1). The engine tells the two shapes apart with `Array.isArray`.
   */
  arbolesAscendencia: Record<string, ArbolAscendencia | TalentoCantor[]>
  /** Book-diagram grid of each tree, by the key of the talent map (`heroico:<camino>:<Especialidad>`, `radiante:<orden>`, `cantor`…) */
  grids: Record<string, TalentGrid>
  /** Card text of the talent map, by exact talent name */
  summaries: Record<string, string>
  /** Skill name as written in prerequisites → Character field (Mistborn adds «Armamento ligero» and «Armamento pesado») */
  skillNameMap: Record<string, SkillField>
  /** The Ideals of the world in order, or null if it has none */
  nombresIdeales: readonly string[] | null
  /** Level-1 singer talents, one of them mandatory at level 1 (Stormlight); [] in a world without singers */
  formasIniciales: readonly string[]
  /** Prerequisite clauses that never gate because the sheet already enforces them (Mistborn: «no tener ningún otro talento de ruptura o herencia») */
  ignorarClausulas: readonly RegExp[]
  /** Permanent attribute bonuses (`character.bonosAtributos`) count for prerequisites: Mistborn true (L.28 / PDF 34), Stormlight false (P1) */
  bonosCuentanParaRequisitos: boolean
  /** Character field that stores the Investida path of the world; graphOptionsFromCharacter reads it (§7.7 #3) */
  campoCaminoInvestido: 'caminoRadiante' | 'caminoMetal'
  /**
   * Visible name of the goal that opens the trees of an Investida path with a flat tree and of its powers (T36, §7.7 #3); the engine adds
   * «pendiente» / «completada» to it. Optional: a world without goal-locked trees leaves it out and the engine says «Meta»
   */
  nombreMeta?: string
}

/** Skill name as written in prerequisites → Character field. «Saber» is the book's name for conocimiento. */
export const SKILL_NAME_MAP: Record<string, SkillField> = {
  'Agilidad': 'agilidad', 'Armas Ligeras': 'armasLigeras', 'Armas Pesadas': 'armasPesadas',
  'Atletismo': 'atletismo', 'Hurto': 'hurto', 'Sigilo': 'sigilo',
  'Deducción': 'deduccion', 'Disciplina': 'disciplina', 'Intimidación': 'intimidacion',
  'Manufactura': 'manufactura', 'Medicina': 'medicina', 'Conocimiento': 'conocimiento',
  'Saber': 'conocimiento', 'Engaño': 'engano', 'Liderazgo': 'liderazgo',
  'Percepción': 'percepcion', 'Perspicacia': 'perspicacia',
  'Persuasión': 'persuasion', 'Supervivencia': 'supervivencia',
}

export const IDEAL_NAMES = ['Primer Ideal', 'Segundo Ideal', 'Tercer Ideal', 'Cuarto Ideal', 'Quinto Ideal'] as const

/** The three level-1 singer talents: one of them is mandatory at level 1. */
export const FORMAS_INICIALES = ['Formas de delicadeza', 'Formas de determinación', 'Formas de sabiduría'] as const

/** Talent rules of Roshar: the current data by reference (P1). Default of every `rules` parameter of talentGraph.ts */
export const STORMLIGHT_TALENTOS: TalentRules = {
  id: 'stormlight',
  caminosHeroicos: HEROIC_PATHS,
  caminosInvestidos: RADIANT_ORDERS,
  poderes: POTENCIAS,
  arbolesAscendencia: { oyente: ARBOL_CANTOR },
  grids: TALENT_GRIDS,
  summaries: TALENT_SUMMARIES,
  skillNameMap: SKILL_NAME_MAP,
  nombresIdeales: IDEAL_NAMES,
  formasIniciales: FORMAS_INICIALES,
  ignorarClausulas: [],
  bonosCuentanParaRequisitos: false,
  campoCaminoInvestido: 'caminoRadiante',
}
