/**
 * Overlays by world over the shared rules of the encyclopedia pages «Aventuras» and «Combate» (spec §3 h, §8; Q12, P8).
 *
 * `aventuras.ts` and `combatRules.ts` are Cosmere content shared by every world. What differs between worlds (a state that only one
 * book has, the currency of a cost, an example, a rule that one book words differently) is an overlay that the world owns and
 * carries in its `WorldData.overlays`: the one of Mistborn travels in its lazy chunk, the one of Stormlight lives in the main
 * bundle (`stormlight.data.ts`, so its first render already has it). The pages never compare world ids: they ask `useWorldData()`
 * for the overlay and resolve it here.
 *
 * Since T23b the base is neutral (no colour of any world: «monedas locales», generic examples, no Empoderado) and each world has an
 * overlay of its own. A world without overlay (`null`, or its lazy data not loaded yet) gets the base itself, by identity. The overlay of
 * Stormlight puts back, by name and in place, the exact text the base carried before T23b: the arrays it resolves to are JSON-identical
 * to the old ones (compared before and after).
 *
 * Operations, applied in this order:
 * - lists of named items (`Overlay`): `remove`, `replace` and `add` by `name`;
 * - lists of sections (`SectionOverlay`): per section `id`, a new summary and details replaced or added by `label`.
 * A target that does not exist is ignored (an overlay can never break a page): compare the resolved JSON to catch a typo.
 */
import type { WorldId } from '../types'
import {
  ACTIVIDADES_REPOSO, DANO_SECTIONS, DESCANSOS, DURACION_LESIONES, EFECTOS_LESIONES, ESCENAS_SECTIONS, ESTADOS, SUCESOS_SECTIONS, TIPOS_DANO,
  type ActividadReposo, type AventuraSection, type Estado, type TipoDano,
} from './aventuras'
import { COMBAT_ACTIONS, COMBAT_SECTIONS, type CombatAction, type CombatSection } from './combatRules'

/** Every list of items of the base (states, damage types, rest activities, combat actions) is keyed by a unique `name` */
interface Named { name: string }

/** Anything made of sections: `AventuraSection` and `CombatSection` */
interface Section { id: string; summary: string; details: { label: string; text: string }[] }

export interface Overlay<T extends Named> {
  /** New items, after the existing ones (the list of states is sorted alphabetically again, as in the book) */
  add?: T[]
  /** Names that leave the base */
  remove?: string[]
  /** Items that take the place of the base item with their name; the fields they leave out keep the base value */
  replace?: (Partial<T> & Named)[]
}

/** Changes to one section of the base (found by `id`) */
export interface SectionPatch {
  summary?: string
  /** label → new text; the detail keeps its position */
  replaceDetails?: Record<string, string>
  /** New details, placed after the one labelled `after` (at the end when `after` is left out or does not exist) */
  addDetails?: { label: string; text: string; after?: string }[]
}

/** section id → changes */
export type SectionOverlay = Record<string, SectionPatch>

export interface AventurasOverlay {
  escenas?: SectionOverlay
  descansos?: SectionOverlay
  actividades?: Overlay<ActividadReposo>
  sucesos?: SectionOverlay
  estados?: Overlay<Estado>
  tiposDano?: Overlay<TipoDano>
  dano?: SectionOverlay
}

export interface CombatOverlay {
  actions?: Overlay<CombatAction>
  freeActions?: Overlay<CombatAction>
  reactions?: Overlay<CombatAction>
  sections?: SectionOverlay
}

/** Everything `AventurasPage` reads, resolved for one world */
export interface ResolvedAventuras {
  escenas: AventuraSection[]
  descansos: AventuraSection[]
  actividades: ActividadReposo[]
  sucesos: AventuraSection[]
  estados: Estado[]
  tiposDano: TipoDano[]
  /** Injury tables: the same in every world, passed through */
  duracionLesiones: typeof DURACION_LESIONES
  efectosLesiones: typeof EFECTOS_LESIONES
  dano: AventuraSection[]
}

/** Everything `CombatPage` reads, resolved for one world */
export interface ResolvedCombat {
  actions: CombatAction[]
  freeActions: CombatAction[]
  reactions: CombatAction[]
  sections: CombatSection[]
}

function patchList<T extends Named>(base: T[], overlay: Overlay<T> | undefined, sortByName = false): T[] {
  if (!overlay) return base
  const { add = [], remove = [], replace = [] } = overlay
  if (!add.length && !remove.length && !replace.length) return base
  const items = base
    .filter((item) => !remove.includes(item.name))
    .map((item): T => {
      const patch = replace.find((r) => r.name === item.name)
      return patch ? { ...item, ...patch } : item
    })
    .concat(add)
  return sortByName && add.length ? items.sort((a, b) => a.name.localeCompare(b.name, 'es')) : items
}

function patchSections<S extends Section>(base: S[], overlay: SectionOverlay | undefined): S[] {
  if (!overlay || !Object.keys(overlay).length) return base
  return base.map((section) => {
    if (!Object.hasOwn(overlay, section.id)) return section
    const { summary, replaceDetails, addDetails } = overlay[section.id]
    let details = replaceDetails
      ? section.details.map((d) => (Object.hasOwn(replaceDetails, d.label) ? { ...d, text: replaceDetails[d.label] } : d))
      : section.details
    for (const { after, ...added } of addDetails ?? []) {
      const at = after === undefined ? -1 : details.findIndex((d) => d.label === after)
      details = at < 0 ? [...details, added] : [...details.slice(0, at + 1), added, ...details.slice(at + 1)]
    }
    return { ...section, summary: summary ?? section.summary, details }
  })
}

// The base itself: what a world without overlay gets (the same arrays the data modules export)
const BASE_AVENTURAS: ResolvedAventuras = {
  escenas: ESCENAS_SECTIONS,
  descansos: DESCANSOS,
  actividades: ACTIVIDADES_REPOSO,
  sucesos: SUCESOS_SECTIONS,
  estados: ESTADOS,
  tiposDano: TIPOS_DANO,
  duracionLesiones: DURACION_LESIONES,
  efectosLesiones: EFECTOS_LESIONES,
  dano: DANO_SECTIONS,
}

const BASE_COMBAT: ResolvedCombat = {
  actions: COMBAT_ACTIONS.actions,
  freeActions: COMBAT_ACTIONS.freeActions,
  reactions: COMBAT_ACTIONS.reactions,
  sections: COMBAT_SECTIONS,
}

// One resolution per world while its overlay (a module constant) stays the same: the pages call the resolver on every render
const aventurasCache = new Map<WorldId, { overlay: AventurasOverlay; value: ResolvedAventuras }>()
const combatCache = new Map<WorldId, { overlay: CombatOverlay; value: ResolvedCombat }>()

/** Base of «Aventuras» plus the overlay of `world`. Without overlay (`null`, or not loaded yet) it is the base itself, by identity */
export function resolveAventuras(world: WorldId, overlay?: AventurasOverlay | null): ResolvedAventuras {
  if (!overlay) return BASE_AVENTURAS
  const hit = aventurasCache.get(world)
  if (hit?.overlay === overlay) return hit.value
  const value: ResolvedAventuras = {
    ...BASE_AVENTURAS,
    escenas: patchSections(ESCENAS_SECTIONS, overlay.escenas),
    descansos: patchSections(DESCANSOS, overlay.descansos),
    actividades: patchList(ACTIVIDADES_REPOSO, overlay.actividades),
    sucesos: patchSections(SUCESOS_SECTIONS, overlay.sucesos),
    estados: patchList(ESTADOS, overlay.estados, true),
    tiposDano: patchList(TIPOS_DANO, overlay.tiposDano),
    dano: patchSections(DANO_SECTIONS, overlay.dano),
  }
  aventurasCache.set(world, { overlay, value })
  return value
}

/** Base of «Combate» plus the overlay of `world`. Without overlay (`null`, or not loaded yet) it is the base itself, by identity */
export function resolveCombat(world: WorldId, overlay?: CombatOverlay | null): ResolvedCombat {
  if (!overlay) return BASE_COMBAT
  const hit = combatCache.get(world)
  if (hit?.overlay === overlay) return hit.value
  const value: ResolvedCombat = {
    actions: patchList(COMBAT_ACTIONS.actions, overlay.actions),
    freeActions: patchList(COMBAT_ACTIONS.freeActions, overlay.freeActions),
    reactions: patchList(COMBAT_ACTIONS.reactions, overlay.reactions),
    sections: patchSections(COMBAT_SECTIONS, overlay.sections),
  }
  combatCache.set(world, { overlay, value })
  return value
}
