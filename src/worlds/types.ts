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
import type { TipoClavo, ReglaHemalurgia } from '../data/mistborn/hemalurgia'
import type { AventurasOverlay, CombatOverlay } from '../data/overlays'
import type { TalentRules } from '../lib/talentRules'
import type { RadiantOrder } from '../data/radiantOrders'
import type { CaminoNacidoDelMetal } from '../data/mistborn/caminosNacidosDelMetal'
import type { AdventureChapter } from '../data/libros/tipos'
import type { ManifiestoOriginales } from '../data/originales/tipos'
import type { CatalogoBanda } from '../lib/banda/tipos'

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

/** Talent rules of a world (T34a, src/lib/talentRules.ts): every tree, grid and summary the talent engine reads. A type-only import */
export type { TalentRules }

/** An Investida path with its talent tree (§2): a radiant order (Stormlight) or a metalborn path (Mistborn). Type-only imports: no data reach the main chunk */
export type CaminoInvestidoDef = RadiantOrder | CaminoNacidoDelMetal

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

/** The two attributes that head each column of a skills page: the two tiles of its card and the two terms of its defense (10 + attribute + attribute) */
export type AtributosColumna = Record<HabilidadDef['columna'], [AttrField, AttrField]>

/** A condition of the rules («Agotado», «Desprovisto»…) as the «Pantalla del director» applies it to a combatant */
export interface EstadoDef {
  id: string
  /** Visible name, as the book writes it */
  nombre: string
  /** Short paraphrase of its effect for the director (never a quotation of the book) */
  resumen: string
  /** The condition carries a value between brackets («Agotado [−2]», «Desprovisto [Oro]»): hint of the input */
  valor?: string
}
/**
 * Light summary of one Investida path of a world (a radiant order, a metalborn path): what a pill or a chip needs to name and
 * colour it. The heavy definition (talent tree, texts) lives in the lazy data of the world / TalentRules (T34a), never in the config.
 */
export interface CaminoInvestidoResumen {
  /** Value of the character field `WorldConfig.caminoInvestido.field` */
  id: string
  /** Visible name */
  nombre: string
  /** Data colour (hex) for toneFrom()/ink()/tint() */
  color: string
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
    /** The sheet, the dice roller and the Bolsa add `character.bonosAtributos` from the server (the attribute bonus of any origin: a cantor's form, Blessings, talents); true in both worlds since T50 (§5.1, Q22) */
    bonosServidor: boolean
    /** «Equipo inicial» flow by packages from the Bolsa (Mistborn, T47) */
    equipoInicial: boolean
    /** Encyclopedia page «Orígenes» (ancestries, Bendiciones, cultures by era); WorldGate protects it (§7.2) */
    origenes: boolean
    /**
     * The catalog of the world is the book's full price list (Mistborn, L.254-267 / PDF 260-273): its weapons and armor carry a price and can be
     * reward-only, so the forms of own items ask for both, and the item pickers of the Bolsa show prices with a search box and subcategory chips
     * (T41). Stormlight keeps its plain catalog: its weapons and armor have no price (Q13) and its pickers do not change (P1)
     */
    catalogoDePrecios: boolean
    /** Legacy of the character (adventure «El legado de los nacidos de la bruma»): card and picker on the «Trasfondo» tab */
    legados: boolean
    /** «La banda»: the crew sheet (refuges, upgrades, workers, contacts) as a section of the app; its catalog is `banda` below */
    banda: boolean
    /** «Creación de personajes»: the director releases the steps of `creacion.pasos` one by one and the players fill them in (route `creacion`) */
    creacionGuiada: boolean
    /** The sheet marks which of the two paths (heroic, Investida) the character started from and lets the director switch it («Camino inicial», Mistborn) */
    caminoInicial: boolean
    /** The sheet shows and edits expertises («Pericias», in Trasfondo); the creation session's come with «Aplicar a la ficha» */
    pericias: boolean
  }
  /** The 18 standard skills: the character sheet, the dice roller and the NPC page all read this table */
  habilidades: HabilidadDef[]
  /** Investida skills that live in a custom slot by exact name: [] | Alomancia (VOL, attack) / Feruquimia (INT) */
  habilidadesInvestidas: { nombre: string; atributo: AttrField; codigo: string; icono: LucideIcon; ataque: boolean }[]
  /**
   * Most points one attribute can take when the character is made, at level 1 (Mistborn: 3, L.20 / PDF 26). The sheet warns above it, it never blocks.
   * Absent: the world declares no such limit and the sheet shows no notice (Stormlight, P1)
   */
  topeCreacionAtributo?: number
  /** tone and icono are ReactNode-ready on purpose: a bare LucideIcon without tone would be a visual regression in Stormlight (P1) */
  ascendencias: {
    id: string
    label: string
    tone: Tone
    icono: (size: number) => ReactNode
    eras?: Era[]
    puntosAtributoBase: number
    /** Highest value an attribute can reach for this ancestry when it differs from the usual 5 (sangre koloss: Fuerza 6) */
    topeAtributo?: Partial<Record<AttrField, number>>
    /** `topeCreacionAtributo` of an attribute when this ancestry has its own (sangre koloss: Fuerza 4, L.38 / PDF 44) */
    topeCreacion?: Partial<Record<AttrField, number>>
    /**
     * The ancestry carries Blessings (the kandra, L.34-35 / PDF 40-41): id and short name of each, for the identity tile of the sheet. Light twin
     * of `BENDICIONES_KANDRA` (data/mistborn/origenes.ts), which stays in the lazy chunk of the picker (§8, risk 6): keep both in step
     */
    bendiciones?: { id: string; nombre: string }[]
  }[]
  /** The Investida path the world adds to the heroic paths: radiant order (Stormlight) or metalborn path (Mistborn) */
  caminoInvestido: {
    field: 'caminoRadiante' | 'caminoMetal'
    label: string
    excluyente: boolean
    /** The paths of the world in book order, for the identity pills of the lists and hubs (CharacterIdentityPills); the one a character has is `character[field]` */
    caminos: CaminoInvestidoResumen[]
    /** `iconos.caminoInvestido` is a round badge of its own (Stormlight: the official order glyph), drawn at 16 px and pulled to the edge of a pill; `false` = a plain glyph (Mistborn: Lucide) that takes the size and padding of the heroic-path icon beside it */
    insignia: boolean
  } | null
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
  /** Conditions of the world: the Cosmere ones (`ESTADOS_COSMERE`, src/worlds/estados.ts) plus its own, alphabetical; read by the «Pantalla del director» */
  estados: EstadoDef[]
  /**
   * The adventure book of the world: the «Libro» of the director's screen, filtered by the campaign's era (`AdventureChapter.eras`).
   * `cargar` is a lazy `import()`, so its chapters never travel in the main bundle; `null` = the world has no book
   */
  libro: { id: string; titulo: string; cargar: () => Promise<AdventureChapter[]> } | null
  /**
   * Originals of the encyclopedia (book text and mini-PDF of each heroic path, metalborn path, power…): the manifest with the pages of
   * every entry (`src/data/originales/<world>.json`), a lazy `import()`; `null` = the world offers none
   */
  originales: { cargar: () => Promise<ManifiestoOriginales> } | null
  /**
   * Catalog of «La banda» (organization types, refuges, upgrades, trades, factions): a lazy `import()`, so it never travels in the main
   * bundle; `null` = the world has no crew sheet (`features.banda` false)
   */
  banda: { cargar: () => Promise<CatalogoBanda> } | null
  /**
   * Guided character creation (`features.creacionGuiada`): the steps the director releases one by one, in order. Their ids are the field
   * ids of the API (`IWorldRules.PasosCreacion`), so adding a step is one line here and one there; `null` = the world creates characters as always
   */
  creacion: { pasos: PasoCreacion[] } | null
}

/** One option of a creation step that is a choice (`creacion:<clave>`) */
export interface OpcionCreacion {
  id: string
  label: string
  descripcion?: string
  /** Heading the option is listed under in the player's list (groups keep the order of first appearance); without it, no heading */
  grupo?: string
}

/**
 * A step of the guided creation: what it asks and where the answer goes. `id` is the field id of the API: `name`, `legado`, `ascendencia`,
 * `legadoRespuestas:<indice>` (one answer of the legacy) or `creacion:<clave>` (a choice kept in `Character.creacionDatos`, whose options
 * load lazily and can be hidden by the table)
 */
export type PasoCreacion = {
  titulo: string
  ayuda: string
  /**
   * The director may let players change it once answered («Cambiar» on the folded step): the step shows «Permitir / Denegar» in the
   * director's view and starts denied (`CreacionEstado.cambiables`, checked by the API too). A step without it never offers «Cambiar».
   * Default false: Xavi decides per step which ones can be changed
   */
  cambiable?: boolean
} & (
  | { id: 'name' }
  | { id: 'legado' }
  | { id: 'ascendencia' }
  | { id: `legadoRespuestas:${number}`; indice: number }
  | {
    id: `creacion:${string}`
    clave: string
    opciones: { cargar: () => Promise<OpcionCreacion[]> }
    ocultas: string[]
    /**
     * Only when another choice has this value (the type of misting after «¿Quieres ser alomante?» = `si`): while that choice is empty the
     * step waits for it, and with another value it is skipped («No aplica», `siNo` explains why) and counts as done
     */
    requiere?: { clave: string; valor: string; siNo: string }
  }
)

export interface WorldData {
  /** null until T34a; heroic paths, Investida paths and powers live INSIDE TalentRules (§7.7), not duplicated here */
  talentos: TalentRules | null
  /** Filled by T21 (Mistborn) and T06b (Stormlight) for HeroicPathsPage before `talentos` exists */
  caminosHeroicos: HeroicPath[]
  /** Stormlight: POTENCIAS (a Potencia has `ordenes`); Mistborn: the alomantic and feruchemical powers (T17/T18) */
  poderes: (Potencia | PoderDef)[]
  overlays: { aventuras: AventurasOverlay | null; combat: CombatOverlay | null }
  /** Mistborn only (T22): spike types and rules of the hemalurgy encyclopedia section. Text only: hemalurgy is not a character art in v1 (§3 o) */
  hemalurgia?: { tipos: TipoClavo[]; reglas: ReglaHemalurgia[] }
}
