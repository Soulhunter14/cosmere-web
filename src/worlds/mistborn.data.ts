/**
 * Heavy data of the Mistborn world (WorldData). It is the only module of the world loaded with `import()`
 * (WorldConfig.loadData), so nothing heavy may be imported from the main bundle (§8, risk 6).
 * Born empty in T06b: each F3 task (T16-T23) connects its exports to the matching field when it finishes.
 * Meeting-point file: later tasks add lines, they never reorder them.
 */
import { MISTBORN_AVENTURAS, MISTBORN_COMBATE } from '../data/mistborn'
import type { WorldData } from './types'
import { TIPOS_CLAVO, REGLAS_HEMALURGIA } from '../data/mistborn/hemalurgia'
import { PODERES_FERUQUIMICOS } from '../data/mistborn'
import { PODERES_ALOMANTICOS } from '../data/mistborn/alomancia'
import { HEROIC_PATHS_MISTBORN } from '../data/mistborn/heroicPaths'
import { SKILL_NAME_MAP, type TalentRules } from '../lib/talentRules'
import { TALENT_GRIDS } from '../data/talentGrids'
import { TALENT_SUMMARIES } from '../data/talentSummaries'
import { CAMINOS_NACIDOS_DEL_METAL } from '../data/mistborn/caminosNacidosDelMetal'
import { METALES_POR_CAMINO_Y_ERA, type CaminoMetalId } from '../data/mistborn/metales'
import { ASCENDENCIAS_MB } from '../data/mistborn/origenes'
import { TALENT_GRIDS_MISTBORN } from '../data/mistborn/talentGrids'
import { TALENT_SUMMARIES_MISTBORN } from '../data/mistborn/talentSummaries'

/**
 * Keys `heroico:<camino>:<Especialidad>` of the specialties that both books share (10, reused by reference from Stormlight, §8):
 * they keep their Stormlight grid, picked from TALENT_GRIDS. The 8 specialties of this book have their own key in TALENT_GRIDS_MISTBORN.
 */
const CLAVES_HEROICO_REUTILIZADAS = HEROIC_PATHS_MISTBORN
  .flatMap((p) => p.specialties.map((s) => `heroico:${p.id}:${s.name}`))
  .filter((clave) => Object.hasOwn(TALENT_GRIDS, clave))

/**
 * Talent rules of Scadrial (T34a, §7.7, §8): the heroic paths of this book, the five metalborn paths, the 34 metallic powers and the
 * trees of the three ancestries (by slug). Grids: the 10 shared specialties keep the Stormlight ones, then TALENT_GRIDS_MISTBORN by
 * reference (metalborn paths, ancestries, the 8 new specialties and, from T38-2, the powers). Summaries: Stormlight's, then this book's.
 */
export const MISTBORN_TALENTOS: TalentRules = {
  id: 'mistborn',
  caminosHeroicos: HEROIC_PATHS_MISTBORN,
  caminosInvestidos: CAMINOS_NACIDOS_DEL_METAL,
  poderes: [...PODERES_ALOMANTICOS, ...PODERES_FERUQUIMICOS],
  arbolesAscendencia: Object.fromEntries(ASCENDENCIAS_MB.map((a) => [a.slug, a.arbol])),
  grids: { ...Object.fromEntries(CLAVES_HEROICO_REUTILIZADAS.map((clave) => [clave, TALENT_GRIDS[clave]])), ...TALENT_GRIDS_MISTBORN },
  summaries: { ...TALENT_SUMMARIES, ...TALENT_SUMMARIES_MISTBORN },
  // «Armamento ligero» / «Armamento pesado»: the names this book gives to armasLigeras / armasPesadas (§7.7)
  skillNameMap: { ...SKILL_NAME_MAP, 'Armamento ligero': 'armasLigeras', 'Armamento pesado': 'armasPesadas' },
  nombresIdeales: null,
  formasIniciales: [],
  // The exclusivity of the metalborn paths is enforced by the sheet (CaminoMetalPicker), not by the talent map (§7.7 #2)
  ignorarClausulas: [/^no tener ningún otro talento de ruptura o herencia\.?$/i],
  // Permanent increases of the attributes (Bendiciones, Tamaño desmedido, Guardián del conocimiento) count for prerequisites (L.28 / PDF 34)
  bonosCuentanParaRequisitos: true,
  campoCaminoInvestido: 'caminoMetal',
  // The goal that opens the tree of the metalborn path and the trees of its powers (L.75 / PDF 81; T36): «Meta de nacido del metal pendiente»
  nombreMeta: 'Meta de nacido del metal',
  // The metals each path can take in each era: the literal table of L.372 / PDF 378, the same one MetalPicker filters by. The «Otros poderes» of the map
  // offers only these, so that the brumoso of Era 1 is not shown a power of gold that no brumoso of his era can have
  metalesDelCamino: (caminoId, era) => {
    if (!Object.hasOwn(METALES_POR_CAMINO_Y_ERA, caminoId)) return null
    const porEra = METALES_POR_CAMINO_Y_ERA[caminoId as CaminoMetalId]
    return era ? porEra[era] : [...porEra.era1, ...porEra.era2]
  },
}

export const DATA: WorldData = {
  talentos: MISTBORN_TALENTOS,
  caminosHeroicos: HEROIC_PATHS_MISTBORN,
  poderes: [
    ...PODERES_ALOMANTICOS,
    ...PODERES_FERUQUIMICOS,
  ],
  overlays: { aventuras: MISTBORN_AVENTURAS, combat: MISTBORN_COMBATE },
  hemalurgia: { tipos: TIPOS_CLAVO, reglas: REGLAS_HEMALURGIA },
}

// The Investida paths are not a WorldData field: they live INSIDE TalentRules (§7.1, §7.7). T19 only makes them reachable from this
// lazy module; T34a composes `MISTBORN_TALENTOS.caminosInvestidos` from this export.
export { CAMINOS_NACIDOS_DEL_METAL } from '../data/mistborn/caminosNacidosDelMetal'
// The ancestries are not a WorldData field: the kandra and sangre koloss trees feed `TalentRules.arbolesAscendencia` (§7.7). T20 only
// makes them reachable from this lazy module; T34a composes `MISTBORN_TALENTOS.arbolesAscendencia` from the `arbol` of each
// `ASCENDENCIAS_MB` entry.
export { ASCENDENCIAS_MB, ARBOL_KANDRA, ARBOL_SANGRE_KOLOSS } from '../data/mistborn/origenes'
// The talent grids and summaries are not a WorldData field either: they feed `TalentRules.grids` and `.summaries` (§7.7, §8). T38-1 only
// makes them reachable from this lazy module (T38-2 adds the 32 grids of the powers to the same record); T34a composes
// `MISTBORN_TALENTOS.grids = { ...pick(TALENT_GRIDS, <reused heroico keys>), ...TALENT_GRIDS_MISTBORN }` and
// `MISTBORN_TALENTOS.summaries = { ...TALENT_SUMMARIES, ...TALENT_SUMMARIES_MISTBORN }` from them.
export { TALENT_GRIDS_MISTBORN } from '../data/mistborn/talentGrids'
export { TALENT_SUMMARIES_MISTBORN } from '../data/mistborn/talentSummaries'
