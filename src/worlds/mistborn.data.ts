/**
 * Heavy data of the Mistborn world (WorldData). It is the only module of the world loaded with `import()`
 * (WorldConfig.loadData), so nothing heavy may be imported from the main bundle (§8, risk 6).
 * Born empty in T06b: each F3 task (T16-T23) connects its exports to the matching field when it finishes.
 * Meeting-point file: later tasks add lines, they never reorder them.
 */
import type { WorldData } from './types'
import { TIPOS_CLAVO, REGLAS_HEMALURGIA } from '../data/mistborn/hemalurgia'

export const DATA: WorldData = {
  talentos: null,
  caminosHeroicos: [],
  poderes: [],
  overlays: { aventuras: null, combat: null },
  hemalurgia: { tipos: TIPOS_CLAVO, reglas: REGLAS_HEMALURGIA },
}

// The Investida paths are not a WorldData field: they live INSIDE TalentRules (§7.1, §7.7). T19 only makes them reachable from this
// lazy module; T34a composes `MISTBORN_TALENTOS.caminosInvestidos` from this export.
export { CAMINOS_NACIDOS_DEL_METAL } from '../data/mistborn/caminosNacidosDelMetal'
