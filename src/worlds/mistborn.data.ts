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

export const DATA: WorldData = {
  talentos: null,
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
