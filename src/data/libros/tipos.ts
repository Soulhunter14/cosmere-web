/**
 * Types of the adventure books of every world («Libro» of the director's screen): Caminapiedras (`src/data/caminapiedras/`) and
 * El legado de los nacidos de la bruma (`src/data/mistborn/legado/`), one chapter per file. The world config says which book
 * a campaign has (`WorldConfig.libro`).
 */
import type { Era } from '../../types'

export type SceneType = 'narrative' | 'social' | 'exploration' | 'combat' | 'choice'
export type NpcRole = 'ally' | 'neutral' | 'villain' | 'special'

export interface SceneTable {
  title: string
  entries: { roll?: string; text: string }[]
}

export interface SceneBranch {
  label: string
  description: string
}

export interface Scene {
  id: string
  title: string
  /** Top-level section of the book the scene belongs to («Localizaciones de Rathalas»): groups the index */
  section?: string
  type: SceneType
  readAloud?: string
  content: string[]
  tips?: string[]
  tables?: SceneTable[]
  branches?: SceneBranch[]
}

export interface Npc {
  name: string
  pronouns: string
  type: string
  role: NpcRole
  traits: string[]
  goal: string
  appearance: string
  notes?: string
}

export interface CombatEnemy {
  name: string
  count: string
  bonus?: string
}

export interface Combat {
  id: string
  title: string
  mapRef?: string
  enemies: CombatEnemy[]
  specialRules: string[]
  duration?: string
  rewards?: string
  tables?: SceneTable[]
}

export interface AdventureMap {
  id: string
  title: string
  pdfPage?: number
  imagePath?: string   // path relative to /public, e.g. "/maps/map_p32.webp"
  scale: string
  locations: string[]
  notes?: string
}

export interface PrepItem {
  text: string
  type: 'key' | 'spren' | 'info'
}

export interface AdventureChapter {
  id: string
  number: number
  title: string
  pdfPages: { from: number; to: number }
  levelFrom: number
  levelTo: number
  summary: string
  background: string
  prepChecklist: string[]
  progressionItems: PrepItem[]
  scenes: Scene[]
  npcs: Npc[]
  combats: Combat[]
  maps: AdventureMap[]
  /** Eras the chapter is played in (El legado: chapters 1-4 in Era 1, 5-9 in Era 2); absent = any */
  eras?: Era[]
}

/** An adventure book: its title (in the `fuente:` of the scenes added to a session) and its chapters in order */
export interface LibroAventura {
  id: string
  titulo: string
  capitulos: AdventureChapter[]
}
