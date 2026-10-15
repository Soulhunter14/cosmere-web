/**
 * «La banda»: the shape of a world's crew catalog (Cosmere core). The data live in each world (Nacidos de la bruma:
 * src/data/mistborn/banda/) and load lazily through `WorldConfig.banda.cargar`. Spec: docs/banda/propuesta.md (§4.3, Anexo A).
 */
import type { Era } from '../../types'

/** Where a rule comes from: the book, our own table rule, or a gap of the book we filled */
export type OrigenRegla = 'oficial' | 'casero' | 'inferido'

export interface Fuente {
  origen: OrigenRegla
  /** Chapter and section it comes from, as the page shows it: «Manual · Cap. 8 › Refugios › Mejoras de refugio» */
  cita?: string
}

/** Amount by era, in the world's currency; an era without an amount = not available in that era */
export type Coste = Partial<Record<Era, number>>

/** A text that may change with the campaign's era (each campaign reads only its own era's version) */
export type TextoEra = string | Partial<Record<Era, string>>

/** Official NPC tiers (L.360 / PDF 366) */
export type RangoPnj = 'secuaz' | 'rival' | 'jefe'

/**
 * A rule as the page shows it: `texto` is the book's rule adapted very faithfully in our own words (never the book's literal text), or
 * our own rule when `origen` is casero; `casero` adds how this table plays it (a house rule, or what we play where the book has a gap)
 */
export interface Definicion extends Fuente {
  titulo: string
  texto: TextoEra
  casero?: TextoEra
}

export interface TipoOrganizacionDef extends Fuente {
  id: string
  nombre: string
  resumen: TextoEra
  /** Perks of the type, «una vez por sesión» unless `uso` says otherwise; `porEscala[0]` = scale 1 */
  ventajas: { id: string; nombre: string; uso: 'sesion' | 'escena' | 'pasiva'; porEscala: string[] }[]
  /** Commercial company: monthly profit by scale 1..4 */
  beneficioMensual?: Coste[]
}

export interface TipoRefugioDef extends Fuente {
  id: string
  nombre: string
  eras?: Era[]
  /** How many upgrades it can hold (Mobiliario selecto counts once) */
  capacidad: number
  /** Upkeep per week */
  mantenimiento: Coste
  /** It moves (a barge): it comes with Movilidad */
  movil: boolean
  notoriedadAlInstalarse?: number
  notas: TextoEra
  /** How this table plays it (capacity and upkeep are ours) */
  casero?: TextoEra
}

export interface MejoraRefugioDef extends Fuente {
  id: string
  nombre: string
  eras?: Era[]
  efecto: TextoEra
  /** How this table plays it: an extra effect of ours, or what we play where the book has an erratum */
  casero?: TextoEra
  /** Cost of each level (Mobiliario selecto has 3); empty = it is not bought (Movilidad comes with the refuge or the vehicle) */
  coste: Coste[]
  /** Weeks of work per level */
  semanas: number
  /** Worker who must hold the post for the effect (Nube de cobre: ahumador; Tapadera: administrador) */
  requiereOficio?: string
  /** Money it brings every week while it works (Tapadera) */
  ingresoSemanal?: Coste
  /** Extra upkeep of the refuge per week (Dormitorio de refugiados) */
  mantenimientoExtra?: Coste
  /** The refuge's upkeep does not suffer the scarcity multiplier (Despensa) */
  libraEscasez?: boolean
}

export interface OficioDef extends Fuente {
  id: string
  nombre: string
  eras?: Era[]
  rango: RangoPnj
  /** Metal of a metalborn trade (Ahumador: cobre) */
  metal?: string
  /** Post and its advantage; null = works away from the refuge (Informante) */
  puesto: {
    mejoras?: string[]
    tipoRefugio?: string
    ventaja: TextoEra
    /** What «Pasar semanas» applies while they hold the post: upkeep of their refuge (−25), profit of a company (+50), works (+1 week once) */
    efecto?: { mantenimientoPct?: number; beneficioPct?: number; obraSemanaExtra?: boolean }
  } | null
  ordenesAfines: string[]
  /** Name of the combat profile in the NPC catalog («Informador») */
  perfilPnj?: string
}

export interface FaccionDef extends Fuente {
  id: string
  nombre: string
  eras?: Era[]
  /** Fixed at −2 (the crew's enemies) */
  enemiga?: boolean
}

/** Scarcity of a stretch of time (Era 1: the siege): wages and upkeep are multiplied */
export interface ContextoDef extends Fuente {
  id: string
  nombre: string
  eras?: Era[]
  multiplicador: number
}

/** A price band of the black market: the asking price as a % of the market value, up to `hasta` (null = above the last band) */
export interface TramoPrecioDef {
  hasta: number | null
  etiqueta: string
  /** Chance of selling in one week, % (0 = nobody buys it) */
  prob: number
}

/**
 * The black market of the crew's store (our rule; only the director sees its numbers): price bands, how the weeks on sale help, what
 * the crew brings and the risk of a tip-off. Spec: docs/banda/propuesta-mercado-negro.md §2
 */
export interface MercadoNegroDef {
  /** Value of a used item, % of its book price */
  usadoPct: number
  tramos: TramoPrecioDef[]
  /** Each week already on sale adds this % of the band's chance, up to `semanasMax` weeks */
  crecimientoPorSemana: number
  semanasMax: number
  modificadores: {
    /** Points while a worker of this trade is with the crew, active or wounded */
    oficio: { id: string; puntos: number }
    /** Points for each worker (active or wounded) posted at this upgrade, ready in a refuge not lost; at most `maximo` */
    puesto: { mejora: string; puntos: number; maximo: number }
    /** Points by the crew's organization type */
    organizacion: Record<string, number>
    /** Points from this notoriety up */
    notoriedad: { desde: number; puntos: number }
  }
  /** Top of the weekly chance, %; the rolls above 100 − `riesgo` are a tip-off */
  maximo: number
  riesgo: number
  /** Upgrade that hides the goods: with it ready in a refuge not lost, a tip-off does not cost them */
  mejoraEscondite: string | null
  /** What the director reads about it */
  regla: Definicion
}

/**
 * What an event does to the sheet, once the director validates it: damage one upgrade at random («danar-mejora») or every upgrade of a
 * refuge at random («danar-refugio»). A damaged upgrade damaged again breaks and is lost
 */
export type EfectoSuceso = 'danar-mejora' | 'danar-refugio'

/** One row of the events table: what the second roll means */
export interface SucesoDef {
  desde: number
  hasta: number
  titulo: string
  texto: TextoEra
  efecto?: EfectoSuceso
  /** A placeholder until the real table is written */
  provisional?: boolean
}

/**
 * «Cosas que pueden pasar» while weeks pass (our rule; only the director sees it). Every week one die says whether something happens:
 * from `umbralBase` up, a number that goes down `bajadaPorSemana` for each week in a row without an event (never below `umbralMinimo`)
 * and goes back up when one comes. When something happens, a second die on `tabla` says what
 */
export interface TablaSucesosDef extends Fuente {
  /** Faces of both dice */
  dado: number
  umbralBase: number
  bajadaPorSemana: number
  umbralMinimo: number
  tabla: SucesoDef[]
}

/**
 * The candidate generator (our rule): the director generates who the crew may hire, edits them and publishes them; the players only
 * decide whom to hire. Rank and metal come from the trade, the wage is the suggested one and the loyalty starts at 1
 */
export interface GeneradorCandidatosDef {
  /** Names to pick from, by era (a name is not repeated while a worker or a candidate has it) */
  nombres: Partial<Record<Era, string[]>>
  /** A trait everyone sees */
  rasgos: string[]
  /** What only the director knows */
  secretos: string[]
  /** % of candidates who belong to a faction of the era (the rest, to none) */
  conFaccion: number
  /** % of candidates with a secret */
  conSecreto: number
}

export interface CatalogoBanda {
  escalaMaxima: number
  notoriedadMaxima: number
  /** Active workers per point of scale */
  trabajadoresPorEscala: number
  /** A month's profit is paid as this many weeks */
  semanasPorMes: number
  /** Key of `Character.recursos` that holds a character's money (Nacidos de la bruma: arquillas): what a contribution takes from */
  claveDinero: string
  /** Weekly wage by tier, food included */
  sueldoPorRango: Record<RangoPnj, Coste>
  /** Added to the wage of a metalborn worker */
  sueldoNacidoDelMetal: Coste
  /** What scale, treasury and notoriety mean, for everyone who reads the sheet */
  definiciones: { escala: Definicion; tesoreria: Definicion; notoriedad: Definicion }
  /** The general rules of refuges (basic refuge, upgrades, moving one), shown on the «Refugio» tab */
  reglasRefugio: Definicion[]
  /** What a sponsor is, for the contacts that are one */
  patrocinador: Definicion
  tiposOrganizacion: TipoOrganizacionDef[]
  tiposRefugio: TipoRefugioDef[]
  mejorasRefugio: MejoraRefugioDef[]
  oficios: OficioDef[]
  facciones: FaccionDef[]
  /** Scarcity options of «Pasar semanas» (empty: the world has none) */
  contextos: ContextoDef[]
  /** The black market of the store (null: the world has none, and the «Almacén» tab is hidden) */
  mercadoNegro: MercadoNegroDef | null
  /** What can happen each week while weeks pass (null: the world has none, and weeks pass without rolling) */
  sucesos: TablaSucesosDef | null
  /** The candidate generator: the only way to hire workers */
  generadorCandidatos: GeneradorCandidatosDef
  /** Metals a metalborn worker can burn (id + name), when the world has them; the sheet draws their official glyph */
  metales?: { id: string; nombre: string }[]
}

/** Amount of a cost in an era: `null` = not available in it. Without an era (a world without eras) the first amount */
export const enEra = (coste: Coste | undefined, era: Era | null): number | null => {
  if (!coste) return null
  if (era) return coste[era] ?? null
  const valores = Object.values(coste)
  return valores.length ? (valores[0] as number) : null
}

/** The text of the campaign's era (or the only one there is) */
export const textoEra = (texto: TextoEra | undefined, era: Era | null): string => {
  if (texto === undefined) return ''
  if (typeof texto === 'string') return texto
  return (era && texto[era]) || Object.values(texto)[0] || ''
}
