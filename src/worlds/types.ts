/**
 * World registry types (spec §7.1).
 *
 * Two layers resolve the tension between a synchronous configuration and lazy data:
 * - `WorldConfig`: LIGHT and synchronous (capabilities, labels, skill tables, currency, theme, icons).
 * - `WorldData`: HEAVY and lazy (talents, powers, overlays), loaded through `WorldConfig.loadData`.
 *
 * Components ask the configuration (`useWorldConfig()`), never `world === '…'` (P4, P8).
 * Meeting-point file: later tasks add lines here, they never reorder them.
 */
import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import type { Era, WorldId } from '../types'
import type { Tone } from '../theme'
import type { SkillField } from '../lib/talentGraph'
import type { HeroicPath } from '../data/heroicPaths'
import type { Potencia } from '../data/potencias'
import type { PoderDef } from '../data/mistborn/tipos'
import type { AventurasOverlay, CombatOverlay } from '../data/overlays'

/** Character fields that hold an attribute value (talentGraph.ts only has `SkillField` for skills). */
export type AttrField = 'fuerza' | 'velocidad' | 'intelecto' | 'voluntad' | 'discernimiento' | 'presencia'

/** One tile of the encyclopedia index. Moved out of the local `Topic` of EncyclopediaPage.tsx (T06c/T09 wire it). */
export interface TopicDef {
  id: string
  label: string
  description: string
  tone: Tone
  /** Feature tiles span the whole row of the bento grid */
  feature?: boolean
  emblem: ReactNode
  /** Route override: `pathFor()` keeps its special case for 'catalog' */
  ruta?: string
}

// Placeholder that the owning task replaces with the real type (it does not exist yet).
export type TalentRules = unknown      // TODO T34a: replace with the real type from src/lib/talentRules.ts

/** Overlays of the shared «Aventuras» and «Combate» rules (T23, src/data/overlays.ts). A type-only import: no data reach the main chunk */
export type { AventurasOverlay, CombatOverlay }

/** A metallic power of Mistborn: PoderAlomantico | PoderFeruquimico (T16). A type-only import: no data reach the main chunk */
export type { PoderDef }

/** One of the 18 standard skills: which Character field holds it, how it is labelled and which attribute rolls with it. */
export interface HabilidadDef {
  field: SkillField
  label: string
  atributo: AttrField
  codigo: 'FUE' | 'VEL' | 'INT' | 'VOL' | 'DIS' | 'PRE'
  columna: 'fisico' | 'cognitivo' | 'espiritual'
}

export interface WorldConfig {
  id: WorldId
  nombre: string
  nombreCorto: string
  /** The name after «de», with the Spanish contraction («del Archivo de las Tormentas», «de Nacidos de la bruma»): for running text such as «reglas de combate {nombreDe}» */
  nombreDe: string
  /** Visible name of the planet («del mundo de Scadrial») */
  planeta: 'Roshar' | 'Scadrial'
  /** Name of an official icon in src/assets/cosmere (CosmereIcon) */
  emblema: string
  /** Label, hint and tone of each era chip (the creation Sheet reads them from here); `null` = the world has no eras */
  eras: { id: Era; label: string; aviso?: string; tone: Tone }[] | null
  features: {
    caminoRadiante: boolean
    idealesJurados: boolean
    marcos: boolean
    formasCantor: boolean
    potencias: boolean
    artesMetalicas: boolean
    arquillas: boolean
    mencionSpren: boolean
    pestanaAventura: boolean
    eras: boolean
    /** The sheet and the dice roller add `character.bonosAtributos` from the server (Mistborn true; Stormlight false until T50 turns it on, §5.1, Q22) */
    bonosServidor: boolean
    /** «Equipo inicial» flow by packages from the Bolsa (Mistborn, T47) */
    equipoInicial: boolean
    /** Encyclopedia page «Orígenes» (ancestries, Bendiciones, cultures by era); WorldGate protects it (§7.2) */
    origenes: boolean
  }
  /** The 18 standard skills of the character sheet */
  habilidades: HabilidadDef[]
  /** Only Stormlight until T50 (legacy dice-roller table); the roller reads `habilidadesTirador ?? habilidades` */
  habilidadesTirador?: HabilidadDef[]
  /** Only Stormlight until T50 (legacy NPC table); the NPC page reads `habilidadesPnj ?? habilidades` */
  habilidadesPnj?: HabilidadDef[]
  /** Investida skills that live in a custom slot by exact name: [] | Alomancia (VOL, attack) / Feruquimia (INT) */
  habilidadesInvestidas: { nombre: string; atributo: AttrField; codigo: string; icono: LucideIcon; ataque: boolean }[]
  /** tone and icono are ReactNode-ready on purpose: a bare LucideIcon without tone would be a visual regression in Stormlight (P1) */
  ascendencias: {
    id: string
    label: string
    tone: Tone
    icono: (size: number) => ReactNode
    eras?: Era[]
    puntosAtributoBase: number
    topeAtributo?: Partial<Record<AttrField, number>>
  }[]
  /** The Investida path the world adds to the heroic paths: radiant order (Stormlight) or metalborn path (Mistborn) */
  caminoInvestido: { field: 'caminoRadiante' | 'caminoMetal'; label: string; excluyente: boolean } | null
  recursos: { clave: string; label: string; icono: LucideIcon; decimales: 0 | 2 }[]
  derivados: { clave: string; label: string; grupo: 'alomancia' | 'feruquimia' }[]
  moneda: { simbolo: 'mc' | 'ar'; nombre: string; imagen: string | null; decimales: 0 | 2 }
  /** `levantamientoKg` is optional: Stormlight has no lifting table (adding it would be new UI in Stormlight, P1) */
  tablas: { cargaKg: number[]; levantamientoKg?: number[] }
  enciclopedia: TopicDef[]
  textos: { sinInvestidura: string; vacioTalentos: string }
  /** `dataWorld`: `null` (no data-world attribute on <html>) or the world id; persisted in `cosmere-campaign` for the pre-paint script (§7.2) */
  tema: { dataWorld: WorldId | null; themeBg: { light: string; dark: string } }
  iconos: { investidura: LucideIcon; caminoInvestido: (id: string, size: number) => ReactNode }
  /** Lazy `import()`: `() => import('./x.data').then((m) => m.DATA)` (import() returns the module namespace, not a WorldData) */
  loadData: () => Promise<WorldData>
  /** Stormlight: its data already travel in the main bundle (same object `loadData` resolves to). Mistborn: undefined */
  syncData?: WorldData
}

export interface WorldData {
  /** null until T34a; heroic paths, Investida paths and powers live INSIDE TalentRules (§7.7), not duplicated here */
  talentos: TalentRules | null
  /** Filled by T21 (Mistborn) and T06b (Stormlight) for HeroicPathsPage before `talentos` exists */
  caminosHeroicos: HeroicPath[]
  /** Stormlight: POTENCIAS (a Potencia has `ordenes`); Mistborn: the alomantic and feruchemical powers (T17/T18) */
  poderes: (Potencia | PoderDef)[]
  overlays: { aventuras: AventurasOverlay | null; combat: CombatOverlay | null }
}
