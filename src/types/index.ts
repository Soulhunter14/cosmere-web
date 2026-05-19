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
export interface Campaign {
  id: number
  name: string
  role: 'gm' | 'player'
  createdAt: string
  nextSessionDate?: string
  nextSessionTitle?: string
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
}

export interface StatDesglose {
  total: number
  unidad?: string          // undefined = integer, "m" = meters
  lineas: StatLinea[]      // active — sum to total
  situacional: StatLinea[] // visible but NOT counted in total
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
  fuerza: number
  velocidad: number
  intelecto: number
  voluntad: number
  discernimiento: number
  presencia: number
  maxHealth: number
  maxConcentration: number  // legacy field kept for reference
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
  createdAt: string
  updatedAt: string
}

export type CreateCharacterRequest = Pick<Character, 'name' | 'playerName' | 'level' | 'ascendencia' | 'caminoHeroico' | 'caminoRadiante'> & { ownerId?: number }
export type UpdateCharacterRequest = Omit<Character,
  'id' | 'campaignId' | 'createdAt' | 'updatedAt' | 'metas' |
  'concentracion' | 'defensaFisica' | 'defensaCognitiva' | 'defensaEspiritual' |
  'salud' | 'investidura' | 'movimiento'
>

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
}

export interface GearItem {
  id: number
  name: string
  weight: number
  price: number
  description: string
}

export interface CatalogOption {
  id: number
  name: string
  description: string
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
