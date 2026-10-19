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
  /** When the director started the campaign; `null` = being prepared (session 0). Optional: a campaign persisted in localStorage before it existed lacks it */
  iniciadaEn?: string | null
  /** Character fields (camelCase) that a started campaign locks for players (`CierreCampana.Campos` in the API); always the full list */
  camposDeCierre?: string[]
  /**
   * Whether the viewer may open «La banda»: the director always; a player only when the director has shared the crew sheet with
   * them. Only the campaign detail carries it; absent = hidden
   */
  bandaVisible?: boolean
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

/** A registered user who is not in the campaign yet: the GM can add them as a player */
export interface UserCandidate {
  userId: number
  username: string
  displayName: string
}

// Stat breakdown (computed by the rules engine)
export interface StatLinea {
  concepto: string
  valor: number
  descripcionCondicion?: string
  /** Attribute-bonus line of any origin (cantor form, Blessing, talent, spike), flagged by the server (§5.1): the sheet reads this instead of the concept text */
  esBono: boolean
  /** Informative line with no numeric effect (hemalurgy «Desorientado al inicio de escena»): the sheet prints only its concept. Absent in every other line */
  sinValor?: boolean
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

// Hemalurgic spike of a Mistborn character (T49a, §9): its own list in `Character.clavos`, apart from `poderes`. Only the director writes it
// (the server keeps the saved list when anyone else sends one)
export interface ClavoHemalurgico {
  /** ASCII id of the metal of the spike: one of the 12 of the table «Efectos conocidos de los clavos hemalúrgicos» (cinc, cobre, estano, hierro, acero…; L.291 / PDF 297) */
  metalClavo: string
  /** `${arte}:${metal}` of the power a power spike grants (one of the four of its metal; the power travels in `poderes` with `origen: 'clavo'`); null in an attribute spike */
  poderElegido: string | null
  /** true while implanted: only then does it take effect (L.290 / PDF 296) */
  implantado: boolean
  /** «Clavo secreto» (L.289 / PDF 295): informative only in v1 */
  secreto: boolean
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
  /** Hemalurgic spikes (T49a): `[]` in Stormlight and in a character with none; `derivadosSet['hemalurgia.clavosMax']` is the limit once there is one */
  clavos: ClavoHemalurgico[]
  /** Legacy of the adventure «El legado de los nacidos de la bruma» (`convicto`, `pilluelo`…; `src/data/mistborn/legados.ts`): `''` = none, always `''` in Stormlight */
  legado: string
  /** Answers to the two questions of the legacy, in their order: `[]` = unanswered, always `[]` in Stormlight */
  legadoRespuestas: string[]
  /** Dead (core, both worlds): the sheet is read-only for everyone and the gear left it for `equipoAlMorir`. Only the director sets it */
  muerto: boolean
  /** When the director marked the death (ISO), `null` while alive */
  muertoEn: string | null
  /** Optional cause written by the director (≤ 300), `''` while alive */
  causaMuerte: string
  /** What the character carried at death, given back if the director brings them back to life; `null` with no copy */
  equipoAlMorir: EquipoGuardado | null
  createdAt: string
  updatedAt: string
}

/** Gear taken off a dead character's sheet (mirror of `Messages/Characters/EquipoGuardado.cs`) */
export interface EquipoGuardado {
  weapons: string[]
  armor: string[]
  spells: string[]
  equipment: string[]
  equippedArmor: string
  desvio: number
  marcosInfusas: number
  marcosOpacas: number
  /** What the world took, with keys only the world knows: Mistborn `arquillas`, `cuentasAtium`, `viales:<arte>:<metal>`, `cargas:<arte>:<metal>` */
  mundo: Record<string, number>
}

export type CreateCharacterRequest = Pick<Character, 'name' | 'playerName' | 'level' | 'ascendencia' | 'caminoHeroico' | 'caminoRadiante' | 'caminoMetal' | 'caminoInicial'> & { ownerId?: number }
// `poderes`, `bendiciones` and `caminoInicial` do travel in the PUT; `recursos` (and the table state of each power) go with PATCH …/recursos
// `clavos` travels too (T49b), but only the director's list is written: for anyone else the server keeps the saved one
export type UpdateCharacterRequest = Omit<Character,
  'id' | 'campaignId' | 'createdAt' | 'updatedAt' | 'metas' |
  'concentracion' | 'defensaFisica' | 'defensaCognitiva' | 'defensaEspiritual' |
  'salud' | 'investidura' | 'movimiento' | 'desvioCalculado' |
  'recursos' | 'derivadosSet' | 'bonosAtributos' |
  'muerto' | 'muertoEn' | 'causaMuerte' | 'equipoAlMorir'
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
  /**
   * Era (1 | 2) of an adversary the book tags «ERA 1» / «ERA 2», null = both eras. The server sets it (the book's tag, or the era of
   * the campaign it is created in) and lists only those of the campaign's era plus the ones of both
   */
  era: 1 | 2 | null
  /** Images of its page in the book uploaded to the catalog (AddGlobalNpcImages); each one comes from `globalNpcsApi.getBookImage` */
  bookImages: BookImageKind[]
}

/** What a book image of an adversary shows: its stat block, its tactics box or its illustration */
export type BookImageKind = 'ficha' | 'tacticas' | 'retrato'

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
/** Fixed slot of a proposed day (null = free time) */
export type ProposalSlot = 'morning' | 'afternoon'
export type ProposalDateStatus = 'Pending' | 'Accepted' | 'Rejected'

export interface ProposalDateResponse {
  id: number
  proposedDate: string
  slot: ProposalSlot | null
  status: ProposalDateStatus
  sessionId: number | null
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

export interface ProposedSlotRequest {
  date: string
  slot: ProposalSlot | null
}

export interface CreateProposalRequest {
  title: string
  notes: string
  /** Plain dates without slot (older clients); ignored when `proposedSlots` is sent */
  proposedDates?: string[]
  proposedSlots?: ProposedSlotRequest[]
}

export interface CastVoteRequest {
  canAttend: boolean
}

export interface PromoteProposalRequest {
  proposalDateId: number
  title: string
  location: string
}

export interface PromoteDateRequest {
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

// Pantalla del director (GM screen): ONE JSON document per campaign, director only (`GmScreenResponse` / `SaveGmScreenRequest`).
// The web owns the shape of `state` (src/pages/pantalla/estado.ts); the server only stores it with optimistic concurrency.
export interface GmScreen {
  /** The stored document (`{}` when the campaign has none yet): read it through `normalizarEstado` */
  state: unknown
  /** Send it back with the next save; 0 = never saved. A save with another version answers 409 with the stored GmScreen */
  version: number
  /** null = never saved */
  updatedAt: string | null
}

export interface SaveGmScreenRequest {
  /** The whole document (a JSON object, at most 1 MB of text) */
  state: object
  /** The version the client read */
  version: number
}

// La banda: the crew sheet of a campaign (CrewController, `CrewSheetResponse` / `SaveCrewSheetRequest` / `ShareCrewSheetRequest`).
// The web owns the shape of `state` and `gmState` (src/pages/banda/estado.ts); the server stores them with optimistic concurrency.
// Players get it only when the director shares it with them, without `gmState` or `sharedWith`; any other player gets 403.
export interface CrewSheet {
  /** The crew sheet (`{}` when it has never been saved): read it through `normalizarBanda` */
  state: unknown
  /** The director's private part; `null` for a player */
  gmState: unknown | null
  /** User ids of the players who may read the sheet; `null` for a player */
  sharedWith: number[] | null
  /** Send it back with the next save; 0 = never saved. A save with another version answers 409 with the stored CrewSheet */
  version: number
  /** null = never saved */
  updatedAt: string | null
}

export interface SaveCrewSheetRequest {
  /** The whole sheet (a JSON object, at most 1 MB of text) */
  state: object
  /** The director's private part (at most 200 kB); omitted = keep the stored one */
  gmState?: object
  /** The version the client read */
  version: number
}

export interface AportarCrewRequest {
  /** The character who gives the money (their own, for a player) */
  characterId: number
  /** More than 0, at most 2 decimals */
  cantidad: number
  /** For the ledger (at most 200 characters) */
  motivo: string
}

/** Character inventory lists (Character.weapons / armor / equipment): one entry per unit */
export type ListaInventario = 'weapons' | 'armor' | 'equipment'

/** Goods leave a character's inventory and enter the crew's store, together (POST …/crew/almacen/entradas) */
export interface EntrarAlmacenRequest {
  /** Their own, for a player */
  characterId: number
  lista: ListaInventario
  /** As the inventory keeps it */
  nombre: string
  /** 1..999, and the inventory must carry that many */
  cantidad: number
  /** The lot as the web builds it (src/pages/banda/estado.ts, Mercancia); the server fixes who, when, name, quantity and list */
  lote: unknown
  /** Ledger texts (at most 200 characters each) */
  motivo: string
  motivoVenta?: string
}

/** A lot leaves the crew's store and its units enter a character's inventory, together (POST …/crew/almacen/{loteId}/salida) */
export interface SacarAlmacenRequest {
  /** Who takes it, and whose inventory it goes to: their own, for a player */
  characterId: number
  /** For the ledger (at most 200 characters) */
  motivo: string
}

export interface ShareCrewSheetRequest {
  /** Players who may read the sheet; replaces the stored list (empty = only the director) */
  userIds: number[]
}

// Libro original: the adventure book uploaded by the director, chapter by chapter (BookController, director only). Each chapter is
// Markdown in the screen's scene format, generated from the PDF by scripts/aventura/parsear_libro.py (`BookChapter*Response`).
export interface BookChapterSummary {
  number: number
  title: string
  /** Length of the Markdown, in characters */
  length: number
  updatedAt: string
}

export interface BookChapter {
  number: number
  title: string
  md: string
  updatedAt: string
}

export interface SaveBookChapterRequest {
  title: string
  /** At most 500 000 characters */
  md: string
}

// Originales de la enciclopedia: the book's text (Markdown) and a mini-PDF of each entry (a heroic path, a metalborn path, a power…),
// shared by every campaign of the world (EncyclopediaController). Any member reads them; only the director uploads them. Generated
// from the PDF by scripts/enciclopedia/generar_originales.py (`EncyclopediaOriginal*Response`).
export interface EncyclopediaOriginalSummary {
  section: string
  key: string
  title: string
  /** Characters of the text; null = no text uploaded */
  textLength: number | null
  /** Bytes of the mini-PDF; null = no PDF uploaded */
  pdfBytes: number | null
  updatedAt: string
}

export interface EncyclopediaText {
  section: string
  key: string
  title: string
  md: string
  updatedAt: string
}

export interface SaveEncyclopediaTextRequest {
  title: string
  /** At most 300 000 characters */
  md: string
}
