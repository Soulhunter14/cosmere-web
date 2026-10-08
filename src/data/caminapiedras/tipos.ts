/** Types of the book's adventure data (Caminapiedras), one chapter per file in this folder */
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
}
