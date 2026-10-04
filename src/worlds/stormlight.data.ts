/**
 * Heavy data of the Stormlight world (WorldData). Its modules already travel in the main bundle
 * (CharacterDetailPage and a dozen more files import heroicPaths/radiantOrders statically), so stormlight.ts also
 * exposes this same object as `syncData`.
 *
 * RADIANT_ORDERS, ARBOL_CANTOR, TALENT_GRIDS and TALENT_SUMMARIES are NOT wrapped here: they do not fit in
 * WorldData and enter STORMLIGHT_TALENTOS in T34a.
 * Meeting-point file: later tasks add lines, they never reorder them.
 */
import { HEROIC_PATHS } from '../data/heroicPaths'
import { POTENCIAS } from '../data/potencias'
import type { WorldData } from './types'

export const DATA: WorldData = {
  talentos: null,
  caminosHeroicos: HEROIC_PATHS,
  poderes: POTENCIAS,
  overlays: { aventuras: null, combat: null },
}
