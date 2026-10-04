/**
 * Heavy data of the Mistborn world (WorldData). It is the only module of the world loaded with `import()`
 * (WorldConfig.loadData), so nothing heavy may be imported from the main bundle (§8, risk 6).
 * Born empty in T06b: each F3 task (T16-T23) connects its exports to the matching field when it finishes.
 * Meeting-point file: later tasks add lines, they never reorder them.
 */
import type { WorldData } from './types'

export const DATA: WorldData = {
  talentos: null,
  caminosHeroicos: [],
  poderes: [],
  overlays: { aventuras: null, combat: null },
}

// The ancestries are not a WorldData field: the kandra and sangre koloss trees feed `TalentRules.arbolesAscendencia` (§7.7). T20 only
// makes them reachable from this lazy module; T34a composes `MISTBORN_TALENTOS.arbolesAscendencia` from the `arbol` of each
// `ASCENDENCIAS_MB` entry.
export { ASCENDENCIAS_MB, ARBOL_KANDRA, ARBOL_SANGRE_KOLOSS } from '../data/mistborn/origenes'
