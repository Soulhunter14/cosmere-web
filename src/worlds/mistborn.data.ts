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
