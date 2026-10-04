/**
 * talentGraph — pure talent engine (no React, no UI).
 *
 * Replaces checkPrereq / resolveParent / computeCascadeRemove / getTalentosPermitidos / talentosLibres
 * (TalentosDetailPage.tsx) and the duplicated budget logic of TalentosPage.tsx.
 * Rules: Manual de juego, Cap. 1 (progreso, rangos), Cap. 2 (ascendencias), Cap. 4 (caminos), Cap. 5 (Ideales).
 *
 * Exported API
 * - parsePrereq(text, known?, rules?)    → PrereqClause[]  typed clauses of a prerequisite string.
 * - allTalentNames(rules?)               → every talent name in the data (used to split «o» safely).
 * - buildTalentGraph(options, rules?)    → TalentGraph     one node per occurrence (id = `${treeId}/${name}`), identity by name.
 * - graphOptionsFromCharacter(ch, extra?)→ options for buildTalentGraph from a Character.
 * - talentStateFromCharacter(ch, extra?, rules?) → TalentState for evaluate / cheapestRoute / cascadeRemove.
 * - evaluate(graph, state)               → TalentEvaluation per-node state, gates, distance, minLevel, missing texts.
 * - cheapestRoute(graph, state, targetId, opts?) → RouteResult ordered steps, skills, earliest level, gates, «o» branches.
 * - cascadeRemove(graph, state, name)    → CascadeResult   remaining stored array after forgetting (fixed point).
 * - talentBudget(character, graph)       → TalentBudget    allowed / used / excess / typed slots / breakdown rows.
 * - talentSlotsAt(level, ascendencia, startingPathId?, rules?) → the typed slots a character has at a level.
 * - helpers: isCantorAncestry, parseStoredTalentos, splitStoredTalentos, withTalent, storyKey,
 *   maxSkillRank, minLevelForRank, rangoOf, idealIndexOf, structurallyMet.
 * - constants: FORMA_ACTIVA_PREFIX, CAMBIAR_DE_FORMA, FORMAS_INICIALES, IDEAL_NAMES, SKILL_NAME_MAP, SKILL_FIELDS, SURGE_NAMES
 *   (FORMAS_INICIALES, IDEAL_NAMES and SKILL_NAME_MAP are defined in talentRules.ts and re-exported here).
 *
 * Conventions
 * - Talents are stored by bare name in Character.talentos (JSON array). The array may also hold the
 *   active singer form as `~forma~<nombre>` and non-talent leftovers (surge names such as «Adhesión»,
 *   path/specialty names): those never count and are kept untouched.
 * - Auto-granted (owned without being stored): the starting path's main talent (it IS the level-1 talent)
 *   and, for singers, «Cambiar de forma». The Primer Ideal is NOT auto-granted: it costs 1 talent, level 2+.
 * - distance = talents still to learn to own the node, the node included (0 = owned, 1 = learnable now,
 *   null = unreachable). It follows the node's own clauses; ancestors use their cheapest occurrence.
 *   «o» branches: fewer unconfirmed DJ conditions first, then fewer talents (same rule in cheapestRoute).
 * - minLevel = earliest level allowed by the gates on that cheapest route (level clauses, Ideal levels and
 *   the skill cap: max rank 2 until level 5, 3 until 10, 4 until 15, 5 from 16). Never mixed with distance.
 * - Ideals: an Ideal clause («Primer Ideal», «pronunciar el Segundo Ideal») needs the Ideal talent AND the
 *   Ideal sworn. While idealesJurados is null/undefined, a learned Ideal counts as sworn.
 * - Story clauses («tener…», «acceso a…», «contar con…», «vínculo con…») never lock: their gate has
 *   status 'confirm' and the UI must show the DJ ConfirmDialog before learning (needsConfirmation).
 * - World data (T34a, §7.7): every tree, talent name and skill name comes from a TalentRules (talentRules.ts). Each `rules`
 *   parameter is optional and defaults to STORMLIGHT_TALENTOS, so a call without it behaves exactly as before; a graph keeps the
 *   rules it was built from (`graph.rules`), which talentBudget and cheapestRoute read. No world is named and no world id is
 *   compared here: data are told apart by their shape (`'ordenes' in p` = Potencia, `'surges' in c` = RadiantOrder, an ancestry
 *   tree that is a plain list = the singer tree).
 */

import type { Character } from '../types'
import type { ActivationType } from '../components/TalentActivation'
import type { RadiantOrder } from '../data/radiantOrders'
import type { Potencia } from '../data/potencias'
import { CAMBIAR_DE_FORMA, FORMA_ACTIVA_PREFIX, getFormaActiva, getFormasDisponibles } from '../data/cantores'
import type { FormaCantor, TalentoCantor } from '../data/cantores'
import type { CaminoInvestidoDef, PoderDef } from '../worlds/types'
import { FORMAS_INICIALES, IDEAL_NAMES, SKILL_NAME_MAP, STORMLIGHT_TALENTOS, type TalentRules } from './talentRules'

export { FORMA_ACTIVA_PREFIX, CAMBIAR_DE_FORMA }
export { FORMAS_INICIALES, IDEAL_NAMES, SKILL_NAME_MAP }

// ── Constants ────────────────────────────────────────────────────────────────

export type IdealName = (typeof IDEAL_NAMES)[number]
const IDEAL_ORDINALS = ['primer', 'segundo', 'tercer', 'cuarto', 'quinto']

/** The ten surges (habilidades de potencia). Transportación may still be missing from POTENCIAS. */
export const SURGE_NAMES = [
  'Abrasión', 'Adhesión', 'Cohesión', 'División', 'Gravitación',
  'Iluminación', 'Progresión', 'Tensión', 'Transformación', 'Transportación',
] as const

export const SKILL_FIELDS = [
  'agilidad', 'armasLigeras', 'armasPesadas', 'atletismo', 'hurto', 'sigilo',
  'deduccion', 'disciplina', 'intimidacion', 'manufactura', 'medicina', 'conocimiento',
  'engano', 'liderazgo', 'percepcion', 'perspicacia', 'persuasion', 'supervivencia',
] as const
export type SkillField = (typeof SKILL_FIELDS)[number]

type CustomSkillNameField = `habilidadPersonalizada${1 | 2 | 3 | 4 | 5 | 6}`
type CustomSkillValueField = `${CustomSkillNameField}Valor`
/** Skill values: a Character works as is. Custom slots habilidadPersonalizada1..6 hold surges and custom skills. */
export type SkillSource = Partial<Pick<Character, SkillField | CustomSkillNameField | CustomSkillValueField>>

// ── Text helpers ─────────────────────────────────────────────────────────────

const norm = (s: string): string =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim()
const slug = (s: string): string => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const plural = (n: number, one: string, many: string): string => (n === 1 ? one : many)

// ── Rango / skill cap (Cap. 1 «Progreso de los personajes») ────────────────────

/** Rango 1 = levels 1-5, 2 = 6-10, 3 = 11-15, 4 = 16-20, 5 = 21+. */
export function rangoOf(level: number): number {
  return Math.min(5, Math.floor((Math.max(1, level) - 1) / 5) + 1)
}
/** Max skill rank at a level: 2 until level 5, 3 until 10, 4 until 15, 5 from 16. */
export function maxSkillRank(level: number): number {
  return level <= 5 ? 2 : level <= 10 ? 3 : level <= 15 ? 4 : 5
}
/** Earliest level at which a skill can reach `rank`. */
export function minLevelForRank(rank: number): number {
  return rank <= 2 ? 1 : rank === 3 ? 6 : rank === 4 ? 11 : 16
}
const rangoLastLevel = (level: number): number => (level <= 5 ? 5 : level <= 10 ? 10 : level <= 15 ? 15 : 20)

/** 1..5 for «Primer Ideal»…«Quinto Ideal», else 0. */
export function idealIndexOf(name: string): number {
  return (IDEAL_NAMES as readonly string[]).indexOf(name) + 1
}
const IDEAL_SET = new Set<string>(IDEAL_NAMES)

export function isCantorAncestry(ascendencia: string | null | undefined): boolean {
  const a = norm(ascendencia ?? '')
  return a === 'oyente' || a === 'cantor' || a === 'cantora'
}

// ── Stored talentos helpers ──────────────────────────────────────────────────

/** Safe parse of Character.talentos (JSON array of names). */
export function parseStoredTalentos(json: string | null | undefined): string[] {
  try {
    const v: unknown = JSON.parse(json || '[]')
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

/** Separates the `~forma~` marker from the talent names. */
export function splitStoredTalentos(stored: readonly string[]): { names: string[]; formaActiva: string | null } {
  return {
    names: [...new Set(stored.filter((t) => !t.startsWith(FORMA_ACTIVA_PREFIX)).map((t) => t.trim()).filter(Boolean))],
    formaActiva: getFormaActiva([...stored]),
  }
}

/** New stored array with `name` added (no duplicates; the forma marker stays last). */
export function withTalent(stored: readonly string[], name: string): string[] {
  if (stored.includes(name)) return [...stored]
  const marker = stored.filter((t) => t.startsWith(FORMA_ACTIVA_PREFIX))
  return [...stored.filter((t) => !t.startsWith(FORMA_ACTIVA_PREFIX)), name, ...marker]
}

/** Key used to remember a confirmed story condition (same text → same confirmation). */
export function storyKey(condition: string): string {
  return norm(condition)
}

// ── Data catalog (all talents of a world, not only the character's) ──────────

/** Potencia (Stormlight) versus PoderDef (Mistborn), §7.7: only a Potencia lists radiant orders */
const esPotencia = (p: Potencia | PoderDef): p is Potencia => 'ordenes' in p
/** RadiantOrder (bond tree plus two surge trees) versus an Investida path with a flat tree (metalborn path) */
const esOrdenRadiante = (c: CaminoInvestidoDef): c is RadiantOrder => 'surges' in c
/** The ancestry tree kept as a plain list of singer talents (Stormlight: ARBOL_CANTOR), or null when the world has none */
function arbolCantorDe(rules: TalentRules): TalentoCantor[] | null {
  for (const arbol of Object.values(rules.arbolesAscendencia)) if (Array.isArray(arbol)) return arbol
  return null
}

type CatalogKind = 'heroicoPrincipal' | 'heroico' | 'radiante' | 'cantor' | 'caminoInvestido' | 'poder' | 'ascendencia'
interface Catalog {
  names: Set<string>
  kind: Map<string, CatalogKind>
  /** stored entries that are not talents: surge, path, specialty, order and power names */
  nonTalent: Set<string>
  /** skill name of the prerequisites (normalised) → Character field, from rules.skillNameMap */
  skillByNorm: Map<string, SkillField>
  /** surge names (normalised): the ten surges plus the name of every Potencia of the rules */
  surgeByNorm: Set<string>
}
/** One catalog per world, cached by `rules.id` */
const catalogCache = new Map<TalentRules['id'], Catalog>()
function catalog(rules: TalentRules): Catalog {
  const cached = catalogCache.get(rules.id)
  if (cached) return cached
  const names = new Set<string>()
  const kind = new Map<string, CatalogKind>()
  const nonTalent = new Set<string>(SURGE_NAMES)
  const add = (n: string, k: CatalogKind) => {
    names.add(n)
    if (!kind.has(n)) kind.set(n, k)
  }
  for (const p of rules.caminosHeroicos) {
    add(p.mainTalent, 'heroicoPrincipal')
    nonTalent.add(p.name)
    for (const s of p.specialties) {
      nonTalent.add(s.name)
      for (const t of s.talentos) add(t.name, 'heroico')
    }
  }
  for (const c of rules.caminosInvestidos) {
    nonTalent.add(c.name)
    if (esOrdenRadiante(c)) {
      for (const t of c.talentos) add(t.name, 'radiante')
    } else {
      add(c.mainTalent, 'caminoInvestido')
      for (const t of c.talentos) add(t.name, 'caminoInvestido')
    }
  }
  for (const p of rules.poderes) {
    nonTalent.add(p.name)
    const k: CatalogKind = esPotencia(p) ? 'radiante' : 'poder'
    for (const t of p.talentos) add(t.name, k)
  }
  for (const arbol of Object.values(rules.arbolesAscendencia)) {
    if (Array.isArray(arbol)) {
      for (const t of arbol) add(t.nombre, 'cantor')
    } else {
      for (const t of arbol.talentos) add(t.name, 'ascendencia')
    }
  }
  for (const n of names) nonTalent.delete(n)
  const cat: Catalog = {
    names, kind, nonTalent,
    skillByNorm: new Map(Object.entries(rules.skillNameMap).map(([k, v]) => [norm(k), v])),
    surgeByNorm: new Set<string>([...SURGE_NAMES, ...rules.poderes.filter(esPotencia).map((p) => p.name)].map(norm)),
  }
  catalogCache.set(rules.id, cat)
  return cat
}

/** Every talent name in the data files of a world (default Stormlight). */
export function allTalentNames(rules: TalentRules = STORMLIGHT_TALENTOS): ReadonlySet<string> {
  return catalog(rules).names
}

// ── parsePrereq ──────────────────────────────────────────────────────────────

interface ClauseBase {
  /** clause text as written (after AND split) */
  raw: string
  /** added by the engine from the book, not present in the data text (e.g. Primer Ideal «nivel 2 o más») */
  implicit?: boolean
}
export type PrereqClause =
  | (ClauseBase & { kind: 'talent'; options: string[]; principal: boolean })
  | (ClauseBase & { kind: 'ideal'; ideal: number; name: IdealName })
  | (ClauseBase & { kind: 'skill'; skill: string; field: SkillField | null; surge: boolean; min: number })
  | (ClauseBase & { kind: 'level'; min: number })
  | (ClauseBase & { kind: 'story'; text: string })
  | (ClauseBase & { kind: 'ancestry'; ancestry: 'cantor' })
  | (ClauseBase & { kind: 'unknown' })

const GTE = '§GTE§'
const STORY_RE = /^(tener|acceso a|contar con|v[ií]nculo con)\s/i
const IDEAL_RE = /^(?:(?:pronunciar|haber pronunciado|jurar|haber jurado)\s+(?:el\s+)?)?(?:talento\s+)?(primer|segundo|tercer|cuarto|quinto)\s+ideal$/i

function parseIdeal(p: string): number {
  const m = p.match(IDEAL_RE)
  return m ? IDEAL_ORDINALS.indexOf(m[1].toLowerCase()) + 1 : 0
}
const stripTalento = (s: string): string => s.replace(/^(?:el\s+)?talento\s+/i, '').trim()
const splitOr = (s: string): string[] => s.split(/\s+(?:o|u)\s+/).map(stripTalento).filter(Boolean)

function parseClause(part: string, known: ReadonlySet<string>, cat: Catalog): PrereqClause {
  const raw = part
  const p = part.replace(/^y\s+/i, '').replace(/^el\s+(?=talento\b)/i, '').replace(/\.$/, '').trim()

  const ideal = parseIdeal(p)
  if (ideal) return { kind: 'ideal', raw, ideal, name: IDEAL_NAMES[ideal - 1] }
  if (known.has(p)) return { kind: 'talent', raw, options: [p], principal: false }
  if (STORY_RE.test(p)) return { kind: 'story', raw, text: p }
  if (/^ascendencia\s+cantor/i.test(p)) return { kind: 'ancestry', raw, ancestry: 'cantor' }

  let m = p.match(/^nivel\s+(\d+)\s+o más$/i)
  if (m) return { kind: 'level', raw, min: Number(m[1]) }

  m = p.match(/^talento principal\s+(.+)$/i)
  if (m) {
    const opts = known.has(m[1].trim()) ? [m[1].trim()] : splitOr(m[1])
    return opts.every((o) => known.has(o)) ? { kind: 'talent', raw, options: opts, principal: true } : { kind: 'unknown', raw }
  }

  m = p.match(/^talento\s+(.+)$/i)
  if (m) {
    const rest = m[1].trim()
    if (known.has(rest)) return { kind: 'talent', raw, options: [rest], principal: false }
    const opts = splitOr(rest)
    return opts.every((o) => known.has(o)) ? { kind: 'talent', raw, options: opts, principal: false } : { kind: 'unknown', raw }
  }

  m = p.match(/^(.+?)\s+(\d+)\s+o más$/)
  if (m) {
    const skill = m[1].trim()
    return {
      kind: 'skill', raw, skill, min: Number(m[2]),
      field: cat.skillByNorm.get(norm(skill)) ?? null,
      surge: cat.surgeByNorm.has(norm(skill)),
    }
  }

  const opts = splitOr(p)
  if (opts.length > 1 && opts.every((o) => known.has(o))) return { kind: 'talent', raw, options: opts, principal: false }
  return { kind: 'unknown', raw }
}

/**
 * Typed clauses of a prerequisite string. AND on «,» and «;»; «N o más» / «N o superior» masked first;
 * OR only when every part is a known talent name; story clauses stay whole. `known` defaults to every talent
 * name of `rules`, whose skill names and surges are the ones recognised (default Stormlight).
 */
export function parsePrereq(
  text: string | null | undefined,
  known?: ReadonlySet<string>,
  rules: TalentRules = STORMLIGHT_TALENTOS,
): PrereqClause[] {
  if (!text || !text.trim()) return []
  const cat = catalog(rules)
  const names = known ?? cat.names
  const masked = text.replace(/(\d+)\s+o\s+(?:más|superior)/gi, `$1${GTE}`)
  return masked
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseClause(s.split(GTE).join(' o más'), names, cat))
}

/** Talent names a clause depends on (talent options, or the Ideal talent), else null. */
function clauseTalentNames(cl: PrereqClause): string[] | null {
  if (cl.kind === 'talent') return cl.options
  if (cl.kind === 'ideal') return [cl.name]
  return null
}

// ── Graph ────────────────────────────────────────────────────────────────────

export type TreeKind = 'heroico' | 'radiante' | 'potencia' | 'cantor'

export interface TalentGraphOptions {
  /** starting heroic path id (its main talent is the free level-1 talent) */
  caminoHeroico?: string | null
  /** other heroic paths the character entered (their main talent costs 1 talent) */
  extraHeroicPaths?: readonly string[]
  caminoRadiante?: string | null
  isCantor?: boolean
}

export interface TalentTree {
  /** 'heroico:<path>' (main talent), 'heroico:<path>:<specialty>', 'radiante:<order>', 'potencia:<id>', 'cantor' */
  id: string
  kind: TreeKind
  /** heroic path id, radiant order id (bond and its surges) or 'cantor' */
  pathId: string
  pathName: string
  /** specialty name, 'Talento principal', spren bond label, surge name or 'Cantor' */
  section: string
  sectionId: string
  color: string
  order: number
  nodeIds: string[]
  /** key talent of the path: heroic main talent, Primer Ideal (bond and surges) or Cambiar de forma */
  keyNodeId: string | null
  isStartingPath: boolean
  /** 'noJugable': order without talents (Forjadores de Vínculos); 'pendiente': surge not transcribed yet */
  status: 'ok' | 'noJugable' | 'pendiente'
  potenciaId: string | null
}

export interface ParentOption {
  name: string
  /** occurrence the line is drawn from (same tree first, then same path), null when not in this graph */
  nodeId: string | null
}
/** One group per talent/Ideal clause. Several groups = «y»; several options in a group = «o». */
export interface ParentGroup {
  clauseIndex: number
  options: ParentOption[]
}

export interface TalentNode {
  /** `${treeId}/${name}` */
  id: string
  name: string
  treeId: string
  kind: TreeKind
  pathId: string
  section: string
  /** position in the data array of its tree */
  index: number
  isKey: boolean
  autoGranted: boolean
  activation: ActivationType
  description: string
  prereqText: string
  notaLibro: string | null
  clauses: PrereqClause[]
  parentGroups: ParentGroup[]
  childIds: string[]
  /** names of other talents this one mentions in its description (it modifies them) */
  mejora: string[]
  /** names of talents whose description mentions this one */
  mejoradoPor: string[]
  /** singer forms unlocked by this talent */
  formas: FormaCantor[]
}

export interface TalentGraph {
  options: TalentGraphOptions
  trees: TalentTree[]
  treeById: Map<string, TalentTree>
  nodes: TalentNode[]
  byId: Map<string, TalentNode>
  byName: Map<string, TalentNode[]>
  /** names owned without being stored */
  autoGranted: string[]
  startingPathId: string | null
  radiantOrderId: string | null
  isCantor: boolean
  /** world data the graph was built from: talentBudget, cheapestRoute and the talent map read them from here */
  rules: TalentRules
}

interface RawTalent {
  name: string
  activation: ActivationType
  description: string
  prereq: string | undefined
  notaLibro: string | null
  formas?: FormaCantor[]
}

const ACTIVATIONS: readonly string[] = ['action1', 'action2', 'action3', 'free', 'reaction', 'special', 'passive']
function toActivation(a: string | null | undefined): ActivationType {
  if (a === null || a === undefined || a === '' || a === '∞') return 'passive'
  if (a === '1' || a === '2' || a === '3') return `action${a}`
  if (a === '0') return 'free'
  return ACTIVATIONS.includes(a) ? (a as ActivationType) : 'special'
}
const notaOf = (t: object): string | null => {
  const n = (t as { notaLibro?: unknown }).notaLibro
  return typeof n === 'string' && n.trim() ? n : null
}

/** Regexes of every talent name of a world, longest first; cached by `rules.id` */
const mentionCache = new Map<TalentRules['id'], { name: string; re: RegExp }[]>()
function mentionRegexes(rules: TalentRules): { name: string; re: RegExp }[] {
  let res = mentionCache.get(rules.id)
  if (!res) {
    res = [...catalog(rules).names]
      .sort((a, b) => b.length - a.length)
      .map((name) => ({ name, re: new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(name)}(?![\\p{L}\\p{N}])`, 'gu') }))
    mentionCache.set(rules.id, res)
  }
  return res
}

export function buildTalentGraph(options: TalentGraphOptions, rules: TalentRules = STORMLIGHT_TALENTOS): TalentGraph {
  const known = allTalentNames(rules)
  const trees: TalentTree[] = []
  const nodes: TalentNode[] = []
  const byId = new Map<string, TalentNode>()
  const byName = new Map<string, TalentNode[]>()
  const autoGranted: string[] = []

  const addTree = (t: Omit<TalentTree, 'nodeIds' | 'order' | 'keyNodeId' | 'isStartingPath' | 'status' | 'potenciaId'> & Partial<TalentTree>): TalentTree => {
    const tree: TalentTree = { keyNodeId: null, isStartingPath: false, status: 'ok', potenciaId: null, ...t, nodeIds: [], order: trees.length }
    trees.push(tree)
    return tree
  }
  const addNode = (tree: TalentTree, t: RawTalent, index: number, isKey: boolean): TalentNode => {
    let id = `${tree.id}/${t.name}`
    if (byId.has(id)) id = `${id}~${index}`
    const clauses = parsePrereq(t.prereq, known, rules)
    if (t.name === 'Primer Ideal' && !clauses.some((c) => c.kind === 'level'))
      clauses.push({ kind: 'level', raw: 'nivel 2 o más', min: 2, implicit: true })
    const node: TalentNode = {
      id, name: t.name, treeId: tree.id, kind: tree.kind, pathId: tree.pathId, section: tree.section,
      index, isKey, autoGranted: false, activation: t.activation, description: t.description,
      prereqText: t.prereq ?? '', notaLibro: t.notaLibro, clauses, parentGroups: [], childIds: [],
      mejora: [], mejoradoPor: [], formas: t.formas ?? [],
    }
    nodes.push(node)
    byId.set(id, node)
    byName.set(t.name, [...(byName.get(t.name) ?? []), node])
    tree.nodeIds.push(id)
    return node
  }

  // Heroic paths: starting path first, then the extra ones
  const pathIds = [...new Set([options.caminoHeroico, ...(options.extraHeroicPaths ?? [])].filter((x): x is string => !!x))]
  let startingPathId: string | null = null
  for (const pid of pathIds) {
    const path = rules.caminosHeroicos.find((p) => p.id === pid)
    if (!path) continue
    const starting = pid === options.caminoHeroico
    if (starting) startingPathId = path.id
    const root = addTree({
      id: `heroico:${path.id}`, kind: 'heroico', pathId: path.id, pathName: path.name,
      section: 'Talento principal', sectionId: 'principal', color: path.color, isStartingPath: starting,
    })
    const key = addNode(root, {
      name: path.mainTalent, activation: path.mainTalentActivation, description: path.mainTalentEffect,
      prereq: path.mainTalentPrerequisites, notaLibro: notaOf(path),
    }, 0, true)
    root.keyNodeId = key.id
    if (starting) autoGranted.push(path.mainTalent)
    for (const spec of path.specialties) {
      const tree = addTree({
        id: `heroico:${path.id}:${slug(spec.name)}`, kind: 'heroico', pathId: path.id, pathName: path.name,
        section: spec.name, sectionId: slug(spec.name), color: path.color, keyNodeId: key.id, isStartingPath: starting,
      })
      spec.talentos.forEach((t, i) => addNode(tree, {
        name: t.name, activation: t.activation, description: t.description, prereq: t.prerequisites, notaLibro: notaOf(t),
      }, i, false))
    }
  }

  // Radiant order: spren bond + its two surges
  const order = rules.caminosInvestidos.find((o): o is RadiantOrder => esOrdenRadiante(o) && o.id === options.caminoRadiante)
  if (order) {
    const playable = order.talentos.length > 0 && order.jugable !== false
    const bond = addTree({
      id: `radiante:${order.id}`, kind: 'radiante', pathId: order.id, pathName: order.name,
      section: `Vínculo con ${order.sprenName}`, sectionId: 'vinculo', color: order.color,
      status: playable ? 'ok' : 'noJugable',
    })
    if (playable) {
      order.talentos.forEach((t, i) => addNode(bond, {
        name: t.name, activation: t.cost, description: t.description, prereq: t.prereq, notaLibro: notaOf(t),
      }, i, i === 0))
      bond.keyNodeId = bond.nodeIds[0] ?? null
      for (const surge of order.surges) {
        const pot = rules.poderes.find((p): p is Potencia => esPotencia(p) && p.name === surge)
        const tree = addTree({
          id: `potencia:${pot?.id ?? slug(surge)}`, kind: 'potencia', pathId: order.id, pathName: order.name,
          section: surge, sectionId: pot?.id ?? slug(surge), color: order.color, keyNodeId: bond.keyNodeId,
          status: pot && pot.talentos.length ? 'ok' : 'pendiente', potenciaId: pot?.id ?? null,
        })
        pot?.talentos.forEach((t, i) => addNode(tree, {
          name: t.name, activation: t.cost, description: t.description, prereq: t.prereq, notaLibro: notaOf(t),
        }, i, false))
      }
    }
  }

  // Singer tree (the ancestry tree that the rules keep as a plain list)
  const isCantor = !!options.isCantor
  const arbolCantor = arbolCantorDe(rules)
  if (isCantor && arbolCantor) {
    const tree = addTree({ id: 'cantor', kind: 'cantor', pathId: 'cantor', pathName: 'Cantor', section: 'Cantor', sectionId: 'cantor', color: '#a78bfa' })
    arbolCantor.forEach((t, i) => addNode(tree, {
      name: t.nombre, activation: toActivation(t.activacion), description: t.descripcion, prereq: t.prereq,
      notaLibro: notaOf(t), formas: t.formas,
    }, i, t.nombre === CAMBIAR_DE_FORMA))
    tree.keyNodeId = byName.get(CAMBIAR_DE_FORMA)?.[0]?.id ?? null
    autoGranted.push(CAMBIAR_DE_FORMA)
  }

  // Parent links (per clause), children
  for (const node of nodes) {
    node.clauses.forEach((cl, ci) => {
      const names = clauseTalentNames(cl)
      if (!names) return
      const principal = cl.kind === 'talent' && cl.principal
      const group: ParentGroup = {
        clauseIndex: ci,
        options: names.map((name) => {
          const cands = byName.get(name) ?? []
          const pick = cands.find((c) => c.treeId === node.treeId)
            ?? cands.find((c) => c.pathId === node.pathId && (!principal || c.isKey))
            ?? cands.find((c) => c.isKey)
            ?? cands[0]
          return { name, nodeId: pick?.id ?? null }
        }),
      }
      node.parentGroups.push(group)
      for (const o of group.options) {
        const parent = o.nodeId ? byId.get(o.nodeId) : undefined
        if (parent && !parent.childIds.includes(node.id)) parent.childIds.push(node.id)
      }
    })
  }

  // «Mejora» / «Mejorado por»: other talent names of this graph mentioned in the description
  const inGraph = (n: string) => byName.has(n)
  const mejoradoPor = new Map<string, Set<string>>()
  for (const node of nodes) {
    let text = node.description
    const found = new Set<string>()
    for (const { name, re } of mentionRegexes(rules)) {
      if (!text.includes(name)) continue
      text = text.replace(re, () => {
        if (name !== node.name && inGraph(name) && !IDEAL_SET.has(name)) found.add(name)
        return ' '.repeat(name.length)
      })
    }
    node.mejora = [...found]
    for (const n of found) mejoradoPor.set(n, new Set([...(mejoradoPor.get(n) ?? []), node.name]))
  }
  for (const node of nodes) node.mejoradoPor = [...(mejoradoPor.get(node.name) ?? [])].filter((n) => n !== node.name)

  for (const n of autoGranted) for (const node of byName.get(n) ?? []) node.autoGranted = true

  return {
    options, trees, treeById: new Map(trees.map((t) => [t.id, t])), nodes, byId, byName,
    autoGranted, startingPathId, radiantOrderId: order?.id ?? null, isCantor, rules,
  }
}

export function graphOptionsFromCharacter(
  ch: Pick<Character, 'caminoHeroico' | 'caminoRadiante' | 'ascendencia'>,
  extraHeroicPaths: readonly string[] = [],
): TalentGraphOptions {
  return {
    caminoHeroico: ch.caminoHeroico || null,
    extraHeroicPaths,
    caminoRadiante: ch.caminoRadiante || null,
    isCantor: isCantorAncestry(ch.ascendencia),
  }
}

// ── State & evaluation ───────────────────────────────────────────────────────

export interface TalentState {
  /** the stored JSON array (may contain the `~forma~` marker) */
  talentos: readonly string[]
  level: number
  skills: SkillSource
  ascendencia: string
  /** how many Ideals are sworn (0-5); null/undefined = unknown → a learned Ideal counts as sworn */
  idealesJurados?: number | null
  /** storyKey()s of story conditions already confirmed with the DJ */
  confirmedStory?: readonly string[]
}

/**
 * State from a Character. Character.idealesJurados is a non-null int defaulting to 0 in the API, so 0 is read
 * as «not set yet» (null → a learned Ideal counts as sworn, nobody gets blocked); 1-5 is used as is, capped at
 * the Ideals of the world (`rules.nombresIdeales`; a world without Ideals keeps null). `rules` defaults to Stormlight.
 */
export function talentStateFromCharacter(
  ch: Character,
  extra: { confirmedStory?: readonly string[] } = {},
  rules: TalentRules = STORMLIGHT_TALENTOS,
): TalentState {
  const jurados = ch.idealesJurados
  const ideales = rules.nombresIdeales
  return {
    talentos: parseStoredTalentos(ch.talentos),
    level: ch.level,
    skills: ch,
    ascendencia: ch.ascendencia,
    idealesJurados: ideales && typeof jurados === 'number' && jurados > 0 ? Math.min(ideales.length, jurados) : null,
    confirmedStory: extra.confirmedStory,
  }
}

export type NodeState = 'learned' | 'learnedElsewhere' | 'available' | 'locked'
export type GateStatus = 'met' | 'unmet' | 'confirm'

export interface GateOption {
  name: string
  nodeId: string | null
  learned: boolean
}
interface GateBase {
  clauseIndex: number
  status: GateStatus
  /** short label: «Percepción 3», «Talento Poderoso o Entrenamiento de esquirlada» */
  label: string
  /** plain-Spanish state: «Percepción 3: tienes 2 · máx. 2 hasta Nv 5» */
  text: string
  implicit: boolean
}
export type Gate =
  | (GateBase & { kind: 'talent'; principal: boolean; options: GateOption[] })
  | (GateBase & { kind: 'ideal'; ideal: number; name: IdealName; learned: boolean; sworn: boolean })
  | (GateBase & { kind: 'skill'; skill: string; field: SkillField | null; surge: boolean; min: number; current: number; maxRank: number; capLevel: number; capped: boolean })
  | (GateBase & { kind: 'level'; min: number; current: number })
  | (GateBase & { kind: 'story'; condition: string; key: string })
  | (GateBase & { kind: 'ancestry'; ancestry: 'cantor' })
  | (GateBase & { kind: 'unknown' })

export interface NodeEval {
  id: string
  state: NodeState
  gates: Gate[]
  /** texts of the gates that are not met (story ones included, prefixed «DJ:») */
  missing: string[]
  /** talents to learn including this one via the cheapest route; 0 = owned; null = unreachable */
  distance: number | null
  /** earliest level allowed by the gates on the cheapest route (≥ 1) */
  minLevel: number
  /** has story conditions still to confirm: show the DJ ConfirmDialog before learning */
  needsConfirmation: boolean
  /** single badge for the grid, priority NV > Ideal > DJ (null when none applies) */
  gateBadge: 'nivel' | 'ideal' | 'dj' | null
}

export interface TalentEvaluation {
  /** owned talent names: stored ∪ auto-granted */
  learned: ReadonlySet<string>
  /** stored talent names (no forma marker) */
  stored: string[]
  formaActiva: string | null
  /** false when the active form is not unlocked by any owned talent */
  formaActivaValida: boolean
  nodes: Map<string, NodeEval>
  level: number
}

interface Ctx {
  graph: TalentGraph
  state: TalentState
  level: number
  learned: Set<string>
  confirmed: Set<string>
}

function makeCtx(graph: TalentGraph, state: TalentState): Ctx {
  const { names } = splitStoredTalentos(state.talentos)
  return {
    graph, state,
    level: Math.max(1, Math.floor(state.level || 1)),
    learned: new Set([...names, ...graph.autoGranted]),
    confirmed: new Set((state.confirmedStory ?? []).map(storyKey)),
  }
}

function skillValue(skills: SkillSource, field: SkillField | null, name: string): number {
  if (field) return Number(skills[field] ?? 0) || 0
  const target = norm(name)
  for (let i = 1; i <= 6; i++) {
    const n = skills[`habilidadPersonalizada${i}` as CustomSkillNameField]
    if (typeof n === 'string' && norm(n) === target)
      return Number(skills[`habilidadPersonalizada${i}Valor` as CustomSkillValueField] ?? 0) || 0
  }
  return 0
}

function isSworn(ctx: Ctx, ideal: number): boolean {
  const j = ctx.state.idealesJurados
  return j === null || j === undefined ? true : j >= ideal
}

function gateFor(ctx: Ctx, node: TalentNode, cl: PrereqClause, ci: number): Gate {
  const base = { clauseIndex: ci, implicit: !!cl.implicit }
  switch (cl.kind) {
    case 'talent': {
      const group = node.parentGroups.find((g) => g.clauseIndex === ci)
      const options = cl.options.map((name) => ({
        name, nodeId: group?.options.find((o) => o.name === name)?.nodeId ?? null, learned: ctx.learned.has(name),
      }))
      const label = `${cl.principal ? 'Talento principal' : 'Talento'} ${cl.options.join(' o ')}`
      return { ...base, kind: 'talent', principal: cl.principal, options, label, text: label, status: options.some((o) => o.learned) ? 'met' : 'unmet' }
    }
    case 'ideal': {
      const learned = ctx.learned.has(cl.name)
      const sworn = learned && isSworn(ctx, cl.ideal)
      const text = !learned ? cl.name : sworn ? `${cl.name} jurado` : `Pronunciar el ${cl.name} (meta pendiente)`
      return { ...base, kind: 'ideal', ideal: cl.ideal, name: cl.name, learned, sworn, label: `${cl.name} jurado`, text, status: sworn ? 'met' : 'unmet' }
    }
    case 'skill': {
      const current = skillValue(ctx.state.skills, cl.field, cl.skill)
      const maxRank = maxSkillRank(ctx.level)
      const capLevel = minLevelForRank(cl.min)
      const met = current >= cl.min
      const capped = !met && ctx.level < capLevel
      const label = `${cl.skill} ${cl.min}`
      const text = `${label}: tienes ${current}${capped ? ` · máx. ${maxRank} hasta Nv ${rangoLastLevel(ctx.level)}` : ''}`
      return { ...base, kind: 'skill', skill: cl.skill, field: cl.field, surge: cl.surge, min: cl.min, current, maxRank, capLevel, capped, label, text, status: met ? 'met' : 'unmet' }
    }
    case 'level': {
      const label = `Nivel ${cl.min}`
      return { ...base, kind: 'level', min: cl.min, current: ctx.level, label, text: `${label}: tienes ${ctx.level}`, status: ctx.level >= cl.min ? 'met' : 'unmet' }
    }
    case 'story': {
      const key = storyKey(cl.text)
      const ok = ctx.confirmed.has(key)
      return { ...base, kind: 'story', condition: cl.text, key, label: cl.text, text: `Condición de historia (DJ): ${cl.text}`, status: ok ? 'met' : 'confirm' }
    }
    case 'ancestry': {
      const ok = isCantorAncestry(ctx.state.ascendencia)
      return { ...base, kind: 'ancestry', ancestry: 'cantor', label: 'Ascendencia cantora', text: 'Ascendencia cantora', status: ok ? 'met' : 'unmet' }
    }
    default:
      return { ...base, kind: 'unknown', label: cl.raw, text: `Requisito no reconocido: ${cl.raw}`, status: 'unmet' }
  }
}

/** Talent and Ideal clauses satisfied by `names` (Ideals: learned only, sworn not checked). Skills/level/story ignored. */
export function structurallyMet(node: TalentNode, names: ReadonlySet<string>): boolean {
  return node.clauses.every((cl) => {
    const opts = clauseTalentNames(cl)
    return !opts || opts.some((o) => names.has(o))
  })
}

// Planner: cheapest set of talents to learn (identity by name, cheapest «o» branch)
interface Plan {
  names: Set<string>
  /** names of the plan that still need a DJ story confirmation */
  story: Set<string>
  /** name → chosen occurrence id */
  via: Map<string, string>
  /** `${nodeId}#${clauseIndex}` → chosen option name */
  picks: Map<string, string>
}
const EMPTY_PLAN: Plan = { names: new Set(), story: new Set(), via: new Map(), picks: new Map() }

/** Branch preference: fewer unconfirmed DJ conditions first, then fewer talents. */
const better = (a: [number, number], b: [number, number]): boolean => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1])
const unionCount = (a: Set<string>, b: Set<string>): number => {
  let n = a.size
  for (const x of b) if (!a.has(x)) n++
  return n
}

function makePlanner(ctx: Ctx, choices?: Readonly<Record<string, string>>) {
  const memo = new Map<string, Plan | null>()
  const visiting = new Set<string>()
  const storyPending = (node: TalentNode) =>
    node.clauses.some((cl) => cl.kind === 'story' && !ctx.confirmed.has(storyKey(cl.text)))

  function forName(name: string): Plan | null {
    if (ctx.learned.has(name)) return EMPTY_PLAN
    if (memo.has(name)) return memo.get(name) ?? null
    if (visiting.has(name)) return null
    let best: Plan | null = null
    for (const occ of ctx.graph.byName.get(name) ?? []) {
      const p = forNode(occ)
      if (p && (!best || better([p.story.size, p.names.size], [best.story.size, best.names.size]))) best = p
    }
    memo.set(name, best)
    return best
  }

  function forNode(node: TalentNode): Plan | null {
    if (ctx.learned.has(node.name)) return EMPTY_PLAN
    if (visiting.has(node.name)) return null
    visiting.add(node.name)
    const plan: Plan = {
      names: new Set([node.name]), story: new Set(storyPending(node) ? [node.name] : []),
      via: new Map([[node.name, node.id]]), picks: new Map(),
    }
    let ok = true
    for (let ci = 0; ci < node.clauses.length && ok; ci++) {
      const opts = clauseTalentNames(node.clauses[ci])
      if (!opts) continue
      const key = `${node.id}#${ci}`
      const forced = choices?.[key]
      const order = forced && opts.includes(forced) ? [forced, ...opts.filter((o) => o !== forced)] : opts
      let bestName: string | null = null
      let bestPlan: Plan | null = null
      let bestCost: [number, number] = [Infinity, Infinity]
      for (const o of order) {
        const p = forName(o)
        if (!p) continue
        if (o === forced) { bestName = o; bestPlan = p; break }
        const cost: [number, number] = [unionCount(plan.story, p.story), unionCount(plan.names, p.names)]
        if (better(cost, bestCost)) { bestCost = cost; bestName = o; bestPlan = p }
      }
      if (!bestPlan || !bestName) { ok = false; break }
      for (const n of bestPlan.names) plan.names.add(n)
      for (const n of bestPlan.story) plan.story.add(n)
      for (const [k, v] of bestPlan.via) if (!plan.via.has(k)) plan.via.set(k, v)
      for (const [k, v] of bestPlan.picks) if (!plan.picks.has(k)) plan.picks.set(k, v)
      plan.picks.set(key, bestName)
    }
    visiting.delete(node.name)
    return ok ? plan : null
  }

  return { forName, forNode }
}

function levelFloor(gates: readonly Gate[]): number {
  let lv = 1
  for (const g of gates) {
    if (g.kind === 'level') lv = Math.max(lv, g.min)
    else if (g.kind === 'skill' && g.status !== 'met') lv = Math.max(lv, g.capLevel)
  }
  return lv
}

/** Per-node state, gates, distance, minLevel and plain-Spanish missing texts. */
export function evaluate(graph: TalentGraph, state: TalentState): TalentEvaluation {
  const ctx = makeCtx(graph, state)
  const planner = makePlanner(ctx)
  const gatesOf = new Map<string, Gate[]>()
  for (const node of graph.nodes) gatesOf.set(node.id, node.clauses.map((cl, ci) => gateFor(ctx, node, cl, ci)))

  // learned vs learnedElsewhere: an owned name is «learned» on the occurrences whose talent clauses hold
  const learnedHere = new Set<string>()
  for (const [name, occs] of graph.byName) {
    if (!ctx.learned.has(name)) continue
    const ok = occs.filter((o) => o.autoGranted || structurallyMet(o, ctx.learned))
    const chosen = ok.length ? ok : [occs.find((o) => o.pathId === graph.startingPathId) ?? occs[0]]
    for (const o of chosen) learnedHere.add(o.id)
  }

  const nodes = new Map<string, NodeEval>()
  for (const node of graph.nodes) {
    const gates = gatesOf.get(node.id) ?? []
    const owned = ctx.learned.has(node.name)
    if (owned) {
      nodes.set(node.id, {
        id: node.id, state: learnedHere.has(node.id) ? 'learned' : 'learnedElsewhere', gates, missing: [],
        distance: 0, minLevel: 1, needsConfirmation: false, gateBadge: null,
      })
      continue
    }
    const plan = planner.forNode(node)
    const routeGates: Gate[] = []
    if (plan) for (const id of plan.via.values()) routeGates.push(...(gatesOf.get(id) ?? []))
    else routeGates.push(...gates)
    const minLevel = levelFloor(routeGates)
    const idealPending = routeGates.some((g) => g.kind === 'ideal' && g.learned && !g.sworn)
    const djPending = routeGates.some((g) => g.status === 'confirm')
    nodes.set(node.id, {
      id: node.id,
      state: gates.some((g) => g.status === 'unmet') ? 'locked' : 'available',
      gates,
      missing: gates.filter((g) => g.status !== 'met').map((g) => (g.status === 'confirm' ? `DJ: ${g.text}` : g.text)),
      distance: plan ? plan.names.size : null,
      minLevel,
      needsConfirmation: gates.some((g) => g.status === 'confirm'),
      gateBadge: minLevel > ctx.level ? 'nivel' : idealPending ? 'ideal' : djPending ? 'dj' : null,
    })
  }

  const { names, formaActiva } = splitStoredTalentos(state.talentos)
  return {
    learned: ctx.learned,
    stored: names,
    formaActiva,
    formaActivaValida: !formaActiva || getFormasDisponibles([...ctx.learned]).some((f) => f.nombre === formaActiva),
    nodes,
    level: ctx.level,
  }
}

// ── cheapestRoute ────────────────────────────────────────────────────────────

export interface RouteStep {
  nodeId: string
  name: string
  treeId: string
  /** learnable right now (all its own gates met or only DJ confirmation pending) */
  availableNow: boolean
  /** gates of this step that are not met (talent gates of earlier steps excluded) */
  gates: Gate[]
  minLevel: number
}
export interface RouteSkill {
  skill: string
  field: SkillField | null
  min: number
  current: number
  capLevel: number
}
export interface RouteAlternative {
  /** key for opts.choices: `${nodeId}#${clauseIndex}` */
  key: string
  nodeId: string
  clauseIndex: number
  chosen: string
  options: { name: string; nodeId: string | null; learned: boolean; talents: number | null }[]
}
export interface RouteResult {
  targetId: string
  reachable: boolean
  owned: boolean
  /** ordered: parents first, the target last */
  steps: RouteStep[]
  talents: number
  /** skills below the threshold along the route (highest threshold per skill) */
  skills: RouteSkill[]
  /** earliest level by gates (level clauses, Ideal levels, skill cap) */
  gateLevel: number
  /** earliest level also counting the talent slots still free (1 talent per level) */
  earliestLevel: number
  /** non-talent gates still pending along the route: Ideal sworn, DJ, level, skill, ancestry */
  gates: Gate[]
  alternatives: RouteAlternative[]
}

/**
 * Cheapest ordered route to `targetId`. `opts.choices` forces an «o» branch (key from RouteAlternative.key).
 */
export function cheapestRoute(
  graph: TalentGraph,
  state: TalentState,
  targetId: string,
  opts: { choices?: Readonly<Record<string, string>> } = {},
): RouteResult {
  const ctx = makeCtx(graph, state)
  const target = graph.byId.get(targetId)
  const empty: RouteResult = {
    targetId, reachable: false, owned: false, steps: [], talents: 0, skills: [], gateLevel: ctx.level,
    earliestLevel: ctx.level, gates: [], alternatives: [],
  }
  if (!target) return empty
  if (ctx.learned.has(target.name)) return { ...empty, reachable: true, owned: true }
  const plan = makePlanner(ctx, opts.choices).forNode(target)
  if (!plan) return empty

  const cheap = makePlanner(ctx)
  const ordered: string[] = []
  const seen = new Set<string>()
  const visit = (id: string) => {
    if (seen.has(id)) return
    seen.add(id)
    const node = graph.byId.get(id)
    if (!node) return
    node.clauses.forEach((_, ci) => {
      const pick = plan.picks.get(`${id}#${ci}`)
      const via = pick && plan.names.has(pick) ? plan.via.get(pick) : undefined
      if (via) visit(via)
    })
    ordered.push(id)
  }
  visit(target.id)

  const steps: RouteStep[] = []
  const gates: Gate[] = []
  const skills = new Map<string, RouteSkill>()
  const alternatives: RouteAlternative[] = []
  for (const id of ordered) {
    const node = graph.byId.get(id)
    if (!node) continue
    const all = node.clauses.map((cl, ci) => gateFor(ctx, node, cl, ci))
    const pending = all.filter((g) => g.status !== 'met' && !(g.kind === 'talent' && g.options.some((o) => plan.names.has(o.name))))
    const pendingIdeal = (g: Gate): g is Extract<Gate, { kind: 'ideal' }> => g.kind === 'ideal' && plan.names.has(g.name)
    steps.push({
      nodeId: id, name: node.name, treeId: node.treeId,
      availableNow: !all.some((g) => g.status === 'unmet'),
      gates: pending.filter((g) => !pendingIdeal(g)),
      minLevel: levelFloor(all),
    })
    for (const g of pending) {
      if (g.kind === 'talent') continue
      if (pendingIdeal(g)) {
        // the Ideal is itself a step: once learned it still has to be sworn
        if (ctx.state.idealesJurados !== null && ctx.state.idealesJurados !== undefined) gates.push({ ...g, text: `Pronunciar el ${g.name} (meta pendiente)` })
        continue
      }
      gates.push(g)
      if (g.kind === 'skill') {
        const k = g.field ?? norm(g.skill)
        const prev = skills.get(k)
        if (!prev || g.min > prev.min) skills.set(k, { skill: g.skill, field: g.field, min: g.min, current: g.current, capLevel: g.capLevel })
      }
    }
    for (const group of node.parentGroups) {
      if (group.options.length < 2) continue
      const key = `${id}#${group.clauseIndex}`
      alternatives.push({
        key, nodeId: id, clauseIndex: group.clauseIndex, chosen: plan.picks.get(key) ?? group.options[0].name,
        options: group.options.map((o) => {
          const p = cheap.forName(o.name)
          return { name: o.name, nodeId: o.nodeId, learned: ctx.learned.has(o.name), talents: p ? p.names.size : null }
        }),
      })
    }
  }

  const gateLevel = Math.max(ctx.level, ...steps.map((s) => s.minLevel))
  const budget = talentBudget({ level: ctx.level, ascendencia: state.ascendencia, talentos: [...state.talentos] }, graph)
  let earliestLevel = gateLevel
  while (earliestLevel < 60 && talentSlotsAt(earliestLevel, state.ascendencia, graph.startingPathId, graph.rules).length - budget.used < steps.length) earliestLevel++

  return {
    targetId, reachable: true, owned: false, steps, talents: steps.length,
    skills: [...skills.values()], gateLevel, earliestLevel, gates, alternatives,
  }
}

// ── cascadeRemove ────────────────────────────────────────────────────────────

export interface CascadeResult {
  /** stored array to save (order kept, forma marker dropped if it became invalid) */
  talentos: string[]
  /** the talent itself plus every dependent that loses its talent/Ideal prerequisites */
  removed: string[]
  /** removed minus the talent itself */
  alsoRemoved: string[]
  /** the active form that is no longer unlocked (its marker was removed), else null */
  formaInvalidada: string | null
  /** true when `name` is auto-granted and cannot be forgotten */
  blocked: boolean
}

/**
 * Forget `name` and, to a fixed point, every talent none of whose occurrences keeps its talent/Ideal
 * clauses («o» respected). Skills, level and story clauses are NOT re-checked; auto-granted talents stay.
 */
export function cascadeRemove(graph: TalentGraph, state: TalentState, name: string): CascadeResult {
  const stored = [...state.talentos]
  if (graph.autoGranted.includes(name))
    return { talentos: stored, removed: [], alsoRemoved: [], formaInvalidada: null, blocked: true }

  const owned = new Set([...splitStoredTalentos(stored).names, ...graph.autoGranted])
  owned.delete(name)
  let changed = true
  while (changed) {
    changed = false
    for (const n of [...owned]) {
      if (graph.autoGranted.includes(n)) continue
      const occs = graph.byName.get(n)
      if (!occs) continue // not in this graph: never touched
      if (!occs.some((o) => structurallyMet(o, owned))) {
        owned.delete(n)
        changed = true
      }
    }
  }

  const removed = splitStoredTalentos(stored).names.filter((n) => !owned.has(n))
  const forma = getFormaActiva(stored)
  const formaInvalidada = forma && !getFormasDisponibles([...owned]).some((f) => f.nombre === forma) ? forma : null
  return {
    talentos: stored.filter((t) => (t.startsWith(FORMA_ACTIVA_PREFIX) ? !formaInvalidada : !removed.includes(t))),
    removed,
    alsoRemoved: removed.filter((n) => n !== name),
    formaInvalidada,
    blocked: false,
  }
}

// ── talentBudget ─────────────────────────────────────────────────────────────

/** What kind of talent a slot can hold. */
export type SlotKind = 'principal' | 'heroico' | 'radiante' | 'cantor' | 'formas' | 'cambiarForma' | 'otro'
const ALL_KINDS: SlotKind[] = ['principal', 'heroico', 'radiante', 'cantor', 'formas', 'cambiarForma', 'otro']
const KIND_LABEL: Record<SlotKind, string> = {
  principal: 'talento principal', heroico: 'heroico', radiante: 'radiante', cantor: 'cantor',
  formas: 'Formas de…', cambiarForma: 'Cambiar de forma', otro: 'otro',
}

export interface TalentSlot {
  level: number
  source: 'principal' | 'nivel' | 'ascendencia'
  label: string
  accepts: SlotKind[]
  /** must be filled (singer: one «Formas de…» at level 1) */
  mandatory: boolean
  /** level 21+: the book gives a talent OR a skill rank */
  orRank: boolean
}
export interface BudgetRow extends TalentSlot {
  acceptsLabel: string
  filledBy: string | null
}
export interface TalentBudget {
  allowed: number
  used: number
  /** used − allowed (same semantics as the current warning: show it when > 0) */
  excess: number
  remaining: number
  /** mandatory typed slots still empty (e.g. singer «Formas de…» at level 1) */
  missing: BudgetRow[]
  /** owned talents no slot can hold (typed excess; includes the numeric excess) */
  unplaced: string[]
  /** one row per slot, by level, for the breakdown table */
  rows: BudgetRow[]
  /** names that consume a slot (auto-granted included) */
  counted: string[]
  /** stored entries that are not talents (forma marker, surge/path/specialty names) */
  ignored: string[]
  /** detail page text, same wording as today (null when no excess) */
  excessText: string | null
  /** list page tooltip text, same wording as today */
  excessDetail: string
}

/** Typed talent slots of a character at `level` (book Cap. 1 + Cap. 2); the starting path's name comes from `rules` (default Stormlight). */
export function talentSlotsAt(level: number, ascendencia: string, startingPathId?: string | null, rules: TalentRules = STORMLIGHT_TALENTOS): TalentSlot[] {
  const L = Math.max(1, Math.floor(level || 1))
  const cantor = isCantorAncestry(ascendencia)
  const principalName = startingPathId ? rules.caminosHeroicos.find((p) => p.id === startingPathId)?.name ?? startingPathId : null
  const slots: TalentSlot[] = [{
    level: 1, source: 'principal', mandatory: false, orRank: false,
    label: `Nivel 1 · talento principal${principalName ? ` (${principalName})` : ''}`,
    accepts: startingPathId ? ['principal'] : ['principal', 'heroico'],
  }]
  for (const hito of [1, 6, 11, 16, 21]) {
    if (hito > L) break
    if (!cantor) slots.push({ level: hito, source: 'ascendencia', label: `Nivel ${hito} · humano: talento heroico`, accepts: ['heroico'], mandatory: false, orRank: false })
    else if (hito === 1) {
      slots.push({ level: 1, source: 'ascendencia', label: 'Nivel 1 · cantor: Cambiar de forma', accepts: ['cambiarForma'], mandatory: false, orRank: false })
      slots.push({ level: 1, source: 'ascendencia', label: 'Nivel 1 · cantor: un talento de Formas (obligatorio)', accepts: ['formas'], mandatory: true, orRank: false })
    } else slots.push({ level: hito, source: 'ascendencia', label: `Nivel ${hito} · cantor: talento cantor o heroico`, accepts: ['cantor', 'formas', 'cambiarForma', 'heroico'], mandatory: false, orRank: false })
  }
  for (let lv = 2; lv <= L; lv++)
    slots.push({ level: lv, source: 'nivel', label: lv > 20 ? `Nivel ${lv} · talento o rango de habilidad` : `Nivel ${lv}`, accepts: ALL_KINDS, mandatory: false, orRank: lv > 20 })
  const srcOrder = { principal: 0, ascendencia: 1, nivel: 2 }
  return slots.sort((a, b) => a.level - b.level || srcOrder[a.source] - srcOrder[b.source])
}

function slotKindOf(name: string, graph: TalentGraph): SlotKind {
  if (name === CAMBIAR_DE_FORMA) return 'cambiarForma'
  if ((FORMAS_INICIALES as readonly string[]).includes(name)) return 'formas'
  const occs = graph.byName.get(name)
  if (occs?.length) {
    const heroic = occs.find((o) => o.kind === 'heroico')
    if (heroic) return heroic.isKey && heroic.pathId === graph.startingPathId ? 'principal' : 'heroico'
    return occs[0].kind === 'cantor' ? 'cantor' : 'radiante'
  }
  const k = catalog(graph.rules).kind.get(name)
  return k === 'heroicoPrincipal' || k === 'heroico' ? 'heroico' : k === 'radiante' ? 'radiante' : k === 'cantor' ? 'cantor' : 'otro'
}

/**
 * Book budget: 1 talent per level (the level-1 one is the starting path's main talent), ancestry bonus
 * at levels 1/6/11/16/21 (human: heroic; singer: Cambiar de forma + one «Formas de…» at 1, then cantor or
 * heroic), levels 21+ talent OR skill rank. Every talent costs, Radiant ones included.
 */
export function talentBudget(
  character: { level: number; ascendencia: string; talentos: string | readonly string[] },
  graph: TalentGraph,
): TalentBudget {
  const stored = typeof character.talentos === 'string' ? parseStoredTalentos(character.talentos) : [...character.talentos]
  const cat = catalog(graph.rules)
  const ignored: string[] = []
  const counted: string[] = []
  for (const t of stored) {
    const n = t.trim()
    if (!n) continue
    if (n.startsWith(FORMA_ACTIVA_PREFIX) || (!cat.names.has(n) && cat.nonTalent.has(n))) ignored.push(t)
    else if (!counted.includes(n)) counted.push(n)
  }
  for (const n of graph.autoGranted) if (!counted.includes(n)) counted.unshift(n)

  const slots = talentSlotsAt(character.level, character.ascendencia, graph.startingPathId, graph.rules)
  // Bipartite matching (Kuhn): most restrictive talents and slots first, so mandatory slots stay filled
  const kinds = new Map(counted.map((n) => [n, slotKindOf(n, graph)]))
  const slotOrder = slots.map((_, i) => i).sort((a, b) => slots[a].accepts.length - slots[b].accepts.length)
  const fits = (n: string, si: number) => slots[si].accepts.includes(kinds.get(n) ?? 'otro')
  const talentOrder = [...counted].sort((a, b) => slotOrder.filter((si) => fits(a, si)).length - slotOrder.filter((si) => fits(b, si)).length)
  const holder: (string | null)[] = slots.map(() => null)
  const tryPlace = (n: string, seen: Set<number>): boolean => {
    for (const si of slotOrder) {
      if (!fits(n, si) || seen.has(si)) continue
      seen.add(si)
      const cur = holder[si]
      if (cur === null || tryPlace(cur, seen)) { holder[si] = n; return true }
    }
    return false
  }
  const unplaced = talentOrder.filter((n) => !tryPlace(n, new Set()))

  const rows: BudgetRow[] = slots.map((s, i) => ({ ...s, acceptsLabel: s.accepts.length === ALL_KINDS.length ? 'cualquiera' : s.accepts.map((k) => KIND_LABEL[k]).join(' o '), filledBy: holder[i] }))
  const allowed = slots.length
  const used = counted.length
  const excess = used - allowed
  const lv = character.level
  return {
    allowed, used, excess, remaining: Math.max(0, allowed - used),
    missing: rows.filter((r) => r.mandatory && !r.filledBy),
    unplaced, rows, counted, ignored,
    excessText: excess > 0
      ? `${used} talentos seleccionados, pero a nivel ${lv} solo corresponden ${allowed}. Retira ${excess} ${plural(excess, 'talento', 'talentos')} para estar dentro del límite.`
      : null,
    excessDetail: `${used} talentos contabilizados, máximo ${allowed} a nivel ${lv}`,
  }
}
