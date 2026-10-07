import type { AttrField } from '../worlds/types'

// Auth
export interface User {
  id: number
  username: string
  displayName: string
}

export interface LoginResponse {
  token: string
  user: User
}

// Campaigns
// Setting of a campaign: fixed when it is created and inherited by its characters.
export type WorldId = 'stormlight' | 'mistborn'
// Mistborn era (L.372 / PDF 378): required in 'mistborn', null in 'stormlight'; fixed when the campaign is created.
export type Era = 'era1' | 'era2'

export interface Campaign {
  id: number
  name: string
  role: 'gm' | 'player'
  createdAt: string
  nextSessionDate?: string
  nextSessionTitle?: string
  world: WorldId
  era: Era | null
}

export interface CampaignDetail extends Campaign {
  inviteCode?: string
  inviteActive: boolean
  members: Member[]
}

export interface Member {
  userId: number
  displayName: string
  role: 'gm' | 'player'
}

// Stat breakdown (computed by the rules engine)
export interface StatLinea {
  concepto: string
  valor: number
  descripcionCondicion?: string
  /** Attribute-bonus line of any origin (cantor form, Blessing, talent, spike), flagged by the server (§5.1): the sheet reads this instead of the concept text */
  esBono: boolean
}

export interface StatDesglose {
  total: number
  unidad?: string          // undefined = integer, "m" = meters
  lineas: StatLinea[]      // active — sum to total
  situacional: StatLinea[] // visible but NOT counted in total
}

// Metallic power of a Mistborn character (§4.2, §5.4): alomancy or feruchemy of one metal; derived id = `${arte}:${metal}`
export interface PoderPersonaje {
  arte: 'alomancia' | 'feruquimia'
  /** ASCII id of one of the 17 metals (`hierro`, `acero`, `estano`…) */
  metal: string
  origen: 'camino' | 'clavo' | 'lerasium' | 'medallon'
  /** false = nascent, true = complete (L.132-133 / PDF 138-139); the server owns it (meta conclusion, PATCH recursos) */
  completo: boolean
  /** Meta enlazada de «Entrenar tu poder» / «Fabricar tu mente de metal» */
  metaId: number | null
  /** Feruchemy: current charges, one reserve per metal */
  cargas: number
  /** Componedor: permanent −1 per use (≤ 0) */
  ajusteCargasMax: number
  /** Alomancy, rare metals only */
  viales: number
  /** Estado «Desprovisto [poder]» (L.310 / PDF 316) */
  desprovisto: boolean
}

// Characters
export interface Character {
  id: number
  campaignId: number
  ownerId?: number
  name: string
  playerName: string
  level: number
  experience: number
  caminoHeroico: string
  caminoRadiante: string
  ascendencia: string
  idealesJurados: number
  fuerza: number
  velocidad: number
  intelecto: number
  voluntad: number
  discernimiento: number
  presencia: number
  maxHealth: number
  /** @deprecated Bonus manual eliminado. Concentración = 2 + VOL + talentos. */
  maxConcentration: number
  /** @deprecated Bonus manual eliminado. Investidura = 2 + max(DIS,PRE) + talentos. */
  maxInvestiture: number
  desvio: number
  // Computed by the rules engine (read-only)
  concentracion: StatDesglose
  defensaFisica: StatDesglose
  defensaCognitiva: StatDesglose
  defensaEspiritual: StatDesglose
  salud: StatDesglose
  investidura: StatDesglose
  movimiento: StatDesglose
  /** Desvío efectivo: mayor entre armadura (`desvio`) y forma de cantor, más talentos situacionales. */
  desvioCalculado: StatDesglose
  marcosInfusas: number
  marcosOpacas: number
  agilidad: number
  armasLigeras: number
  armasPesadas: number
  atletismo: number
  hurto: number
  sigilo: number
  deduccion: number
  disciplina: number
  intimidacion: number
  manufactura: number
  medicina: number
  conocimiento: number
  engano: number
  liderazgo: number
  percepcion: number
  perspicacia: number
  persuasion: number
  supervivencia: number
  habilidadPersonalizada1: string
  habilidadPersonalizada1Valor: number
  habilidadPersonalizada1Atributo: string
  habilidadPersonalizada2: string
  habilidadPersonalizada2Valor: number
  habilidadPersonalizada2Atributo: string
  habilidadPersonalizada3: string
  habilidadPersonalizada3Valor: number
  habilidadPersonalizada3Atributo: string
  habilidadPersonalizada4: string
  habilidadPersonalizada4Valor: number
  habilidadPersonalizada4Atributo: string
  habilidadPersonalizada5: string
  habilidadPersonalizada5Valor: number
  habilidadPersonalizada5Atributo: string
  habilidadPersonalizada6: string
  habilidadPersonalizada6Valor: number
  habilidadPersonalizada6Atributo: string
  proposito: string
  obstaculo: string
  talentos: string
  metas: Meta[]
  apariencia: string
  notas: string
  conexiones: string
  weapons: string[]
  armor: string[]
  spells: string[]
  equipment: string[]
  equippedArmor: string
  // Nacidos de la bruma (§5.1). In Stormlight: '', '', [], {}, [] and {} (bonosAtributos carries the cantor-form bonus)
  /** Metalborn path: `''`, `brumoso`, `nacido-de-la-bruma`, `feruquimista`, `ferrin` or `nacidoble` (L.19 / PDF 25) */
  caminoMetal: string
  /** Which path the character started with (L.17-18 / PDF 23-24): `''` = undecided (every existing character) */
  caminoInicial: '' | 'heroico' | 'metal'
  poderes: PoderPersonaje[]
  /** Table state by key: `investiduraActual`, `cuentasAtium`, `arquillas` (written with PATCH …/recursos, never with the PUT) */
  recursos: Record<string, number>
  /** Kandra Blessings: `consciencia`, `potencia`, `presencia`, `estabilidad`, `fortaleza` (at most 2, no duplicates) */
  bendiciones: string[]
  /** World-specific derived stats (`alomancia.limite`, `poder.cobre.cargasMax`…), computed by the server */
  derivadosSet: Record<string, StatDesglose>
  /** Attribute bonuses of any origin, without zeros; the sheet and the dice roller add them only when `features.bonosServidor` is true */
  bonosAtributos: Partial<Record<AttrField, number>>
  createdAt: string
  updatedAt: string
}

export type CreateCharacterRequest = Pick<Character, 'name' | 'playerName' | 'level' | 'ascendencia' | 'caminoHeroico' | 'caminoRadiante' | 'caminoMetal' | 'caminoInicial'> & { ownerId?: number }
// `poderes`, `bendiciones` and `caminoInicial` do travel in the PUT; `recursos` (and the table state of each power) go with PATCH …/recursos
export type UpdateCharacterRequest = Omit<Character,
  'id' | 'campaignId' | 'createdAt' | 'updatedAt' | 'metas' |
  'concentracion' | 'defensaFisica' | 'defensaCognitiva' | 'defensaEspiritual' |
  'salud' | 'investidura' | 'movimiento' | 'desvioCalculado' |
  'recursos' | 'derivadosSet' | 'bonosAtributos'
>

// PATCH …/recursos (Nacidos de la bruma, §5.2): only the keys that are present are written
export interface RecursosPatch {
  recursos?: Record<string, number>
  poderes?: {
    arte: string
    metal: string
    cargas?: number
    viales?: number
    desprovisto?: boolean
    completo?: boolean
    /** Componedor: only ≤ 0 (L.155 / PDF 161) */
    ajusteCargasMax?: number
  }[]
}

// Metas
export interface Meta {
  id: number
  characterId: number
  titulo: string
  descripcion: string
  hitos: number
  estado: 'activa' | 'concluida'
  tipoConclusion: 'exito' | 'crecimiento' | 'fracaso' | null
  notasConclusion: string
  createdAt: string
}

export interface CreateMetaRequest {
  titulo: string
  descripcion: string
}

export interface UpdateMetaRequest {
  titulo: string
  descripcion: string
  hitos: number
}

export interface ConcludeMetaRequest {
  tipoConclusion: 'exito' | 'crecimiento' | 'fracaso'
  notasConclusion: string
}

// Diary
export type DiaryMentionType = 'pj' | 'npc' | 'spren' | 'faction' | 'unknown'

export interface DiaryMention {
  raw: string
  display: string
  type: DiaryMentionType
}

export interface DiaryEntry {
  id: number
  campaignId: number
  number: number
  title: string
  slug: string
  preview: string
  body: string
  participants: string[]
  mentions: DiaryMention[]
  createdAt: string
  updatedAt: string
}

// NPC Notes (player personal notes about NPCs they encounter)
export interface NpcNote {
  id: number
  npcName: string
  notes: string
  isShared: boolean
  isOwn: boolean
  authorName: string
  createdAt: string
  updatedAt: string
}

// Global NPCs (cross-campaign, from book appendices)
export interface GlobalNpc {
  id: number
  name: string
  source: string
  tipo: string
  ascendencia: string
  level: number
  fuerza: number
  velocidad: number
  intelecto: number
  voluntad: number
  discernimiento: number
  presencia: number
  maxHealth: number
  maxConcentration: number
  maxInvestiture: number
  agilidad: number
  armasLigeras: number
  armasPesadas: number
  atletismo: number
  hurto: number
  sigilo: number
  deduccion: number
  disciplina: number
  intimidacion: number
  manufactura: number
  medicina: number
  conocimiento: number
  engano: number
  liderazgo: number
  percepcion: number
  perspicacia: number
  persuasion: number
  supervivencia: number
  talentos: string
  apariencia: string
  notas: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
  /** World of the adversary: the server fixes it from the campaign it is created in and returns it; it never travels in a request body (§5.2) */
  world: WorldId
}

// Sessions
export interface Session {
  id: number
  campaignId: number
  title: string
  date: string
  location: string
  notes: string
  createdAt: string
}

export interface CreateSessionRequest {
  title: string
  date: string
  location: string
  notes: string
}

// Session Proposals
export type ProposalStatus = 'Pending' | 'Promoted' | 'Rejected'

export interface ProposalDateResponse {
  id: number
  proposedDate: string
  canCount: number
  cannotCount: number
  currentUserVote: boolean | null
}

export interface ProposalResponse {
  id: number
  campaignId: number
  title: string
  notes: string
  status: ProposalStatus
  createdAt: string
  resolvedAt: string | null
  promotedSessionId: number | null
  dates: ProposalDateResponse[]
}

export interface CreateProposalRequest {
  title: string
  notes: string
  proposedDates: string[]
}

export interface CastVoteRequest {
  canAttend: boolean
}

export interface PromoteProposalRequest {
  proposalDateId: number
  title: string
  location: string
}

// Notes
export interface Note {
  id: number
  campaignId: number
  fromUserId: number
  toUserId: number
  fromDisplayName: string
  toDisplayName: string
  content: string
  isRead: boolean
  createdAt: string
}

export interface CreateNoteRequest {
  toUserIds: number[]
  content: string
}

// Catalog
export interface WeaponCatalog {
  id: number
  name: string
  weaponTypeId: number
  skillId: number
  damageDiceCount: number
  damageDiceValue: number
  damageTypeId: number
  rangeId: number
  traitIds: number[]
  expertTraitIds: number[]
  isCustom: boolean
  description: string
  weight: number
  /** World the item belongs to (a catalog is served by campaign, so it is the world of the campaign) */
  world: WorldId
  /** Era the item exists in (L.254-267 / PDF 260-273 label rows «ERA 1» / «ERA 2»); null = every era of its world */
  era: 1 | 2 | null
  /** Price in the money of the world (`WorldConfig.moneda`); null = it has none (every Stormlight weapon, Q13, and the rewards) */
  price: number | null
  /** Only obtained as a reward: the Bolsa pickers do not offer it */
  isRewardOnly: boolean
}

export interface ArmorCatalog {
  id: number
  name: string
  armorTypeId: number
  desvio: number
  traitIds: number[]
  expertTraitIds: number[]
  isCustom: boolean
  description: string
  weight: number
  world: WorldId
  era: 1 | 2 | null
  price: number | null
  isRewardOnly: boolean
}

export interface GearItem {
  id: number
  name: string
  weight: number
  price: number
  description: string
  world: WorldId
  era: 1 | 2 | null
  isRewardOnly: boolean
  /** `'vial'` for the metal vials of Mistborn (reference of price only: the Bolsa picker does not offer them, Q21); null for the rest */
  category: string | null
}

export interface CatalogOption {
  id: number
  name: string
  description: string
  /** `'cosmere'` marks the options shared by every world (WorldIds.Cosmere); the others belong to one world */
  world: WorldId | 'cosmere'
}

// Locked Days
export interface LockedDay {
  id: number
  campaignId: number
  userId: number
  userDisplayName: string
  date: string
  note: string
  createdAt: string
}

export interface CreateLockedDayRequest {
  date: string
  note: string
}
