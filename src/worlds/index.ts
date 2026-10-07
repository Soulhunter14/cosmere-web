/**
 * World registry: the single place that knows which worlds exist. Everything else asks `getWorld()` or the
 * hooks of campaignStore (`useWorld`, `useWorldConfig`, `useWorldData`) and never compares a world id (P4, P8).
 * A new world is one `WorldConfig` file plus one line here (and the server side, §6.1).
 */
import type { Era, WorldId } from '../types'
import type { WorldConfig } from './types'
import { STORMLIGHT } from './stormlight'
import { MISTBORN } from './mistborn'

export const WORLDS: Record<WorldId, WorldConfig> = {
  stormlight: STORMLIGHT,
  mistborn: MISTBORN,
}

/**
 * `''`, `null`, `undefined` and unknown ids fall back to Stormlight, as `WorldRulesProvider.Get` does on the server
 * (also persisted campaign objects that predate worlds). `Object.hasOwn`, not `id in WORLDS`: with a plain object,
 * 'constructor' or 'toString' would resolve to properties of the prototype.
 */
export const getWorld = (id?: string | null): WorldConfig =>
  Object.hasOwn(WORLDS, id ?? '') ? WORLDS[id as WorldId] : WORLDS.stormlight

/** Era filter of the pickers and the catalog: `null` (no era, Stormlight) = everything available; an item without `eras` is in every era */
export const isAvailable = (item: { eras?: Era[] }, era: Era | null): boolean =>
  era === null || !item.eras || item.eras.includes(era)
