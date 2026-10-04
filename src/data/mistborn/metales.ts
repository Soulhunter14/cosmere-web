/**
 * Metals of Scadrial for the metallic arts (Nacidos de la bruma, chapter 6).
 *
 * Source: the tables «Metales en la alomancia» (L.168 / PDF 174) and «Metales en la feruquimia» (L.171 / PDF 177), transcribed from
 * the page images (the text layer of the PDF scrambles their columns), and «Caminos de nacidos del metal por era» (L.372 / PDF 378).
 * Metals follow the printed order: the first 16 fill the 4×4 grid of the metal picker row by row and atium goes apart (§7.5).
 * Light module: it may travel in the main bundle, so it imports nothing but types (§8, risk 6).
 */
import type { Era } from '../../types'

/** The 17 playable metals (ASCII ids without accents, P7). Malatium, lerasium, armonium and trellium are not playable in the book. */
export type MetalId =
  | 'hierro' | 'acero' | 'estano' | 'peltre' | 'cinc' | 'laton' | 'cobre' | 'bronce'
  | 'cromo' | 'nicrosil' | 'aluminio' | 'duraluminio' | 'cadmio' | 'bendaleo' | 'oro' | 'electro'
  | 'atium'

/** Metalborn path: the values of `Character.caminoMetal` (§2) */
export type CaminoMetalId = 'brumoso' | 'nacido-de-la-bruma' | 'feruquimista' | 'ferrin' | 'nacidoble'

/** Metallic art of a character power; hemalurgy is not a character art in v1 (L.251 / PDF 257) */
export type ArteMetal = 'alomancia' | 'feruquimia'

/** The two arts classify the same metal differently (L.166 / PDF 172) */
export type CategoriaAlomancia = 'fisico' | 'mental' | 'mejora' | 'temporal' | 'divino'
export type CategoriaFeruquimia = 'fisico' | 'cognitivo' | 'espiritual' | 'hibrido' | 'divino'

/** Visible labels of the «Categoría» column of each table (the ids carry no accents) */
export const CATEGORIAS_ALOMANCIA: Record<CategoriaAlomancia, string> = {
  fisico: 'Físico',
  mental: 'Mental',
  mejora: 'Mejora',
  temporal: 'Temporal',
  divino: 'Divino',
}
export const CATEGORIAS_FERUQUIMIA: Record<CategoriaFeruquimia, string> = {
  fisico: 'Físico',
  cognitivo: 'Cognitivo',
  espiritual: 'Espiritual',
  hibrido: 'Híbrido',
  divino: 'Divino',
}

export interface MetalDef {
  id: MetalId
  /** Visible name («Estaño») */
  nombre: string
  categoriaAlomancia: CategoriaAlomancia
  categoriaFeruquimia: CategoriaFeruquimia
  /** Pure metal (true) or alloy (false), «¿Aleación o puro?» of the feruchemy table; null = «n/a» in the book (atium only) */
  puro: boolean | null
  /** Paired metal (the pure metal and its alloy); null for atium («n/a» in both tables). The pairing is symmetric */
  pareja: MetalId | null
  /** Alomancy: true = interno (affects the user), false = externo (affects the world around); null for atium («n/a») */
  interno: boolean | null
  /** Alomancy: true = Empujón (the alloy of a pair), false = Tirón (the pure metal); null for atium («n/a») */
  empujon: boolean | null
  /** «Nombre de brumoso» exactly as printed (some cells give two names: «Brazo de peltre / violento») */
  nombreBrumoso: string
  /** «Nombre de ferrin» */
  nombreFerrin: string
  /** Feruchemical trait the metal stores («Rasgo» of the subtitle of each feruchemy entry: «Velocidad», «Peso»…) */
  rasgoFeruquimico: string
  /** Eras of the «Era» column. Aluminio, duraluminio and electro (‡) become known at the end of Era 1: see `notaLibro` */
  eras: Era[]
  /** Common metal (the 8 physical and mental ones of alomancy, the same 8 in feruchemy): always available; the rest are rare (L.167 / PDF 173) */
  comun: boolean
  /** Hex colour for ink()/tint() (§7.8); see the note above `METALES` */
  color: string
  notaLibro?: string
}

const NOTA_FIN_ERA_1 =
  'A finales de la Era 1 el aluminio, el duraluminio y el electro dejan de ser un secreto del Ministerio de Acero ' +
  '(L.168 / PDF 174 ‡; L.171 / PDF 177 †; L.372 / PDF 378 *). El libro avisa de que es muy poco probable que un PJ los conozca antes de la ' +
  'muerte del lord Legislador y deja a la DJ y al jugador acordar cuándo y cómo se enteró (L.167 / PDF 173, «Final de la Era 1»): ofrecerlos ' +
  'en una campaña de finales de la Era 1 es una opción del director (verificado en imagen, PDF 173, 174, 177 y 378).'

const NOTA_ORO =
  'El Ministerio de Acero ocultó la existencia de los brumosos de oro hasta casi el final de la Era 1 (L.167 / PDF 173; L.168 / PDF 174 ‡): ' +
  'en la tabla de L.372 / PDF 378 el oro está en Era 1 para nacido de la bruma y feruquimista, pero no para el brumoso, y la nota * de esa ' +
  'tabla equipara la existencia de los brumosos de oro a la del aluminio, el duraluminio y el electro a finales de la era (verificado en ' +
  'imagen, PDF 173, 174 y 378). Abrirlo entonces al brumoso como opción del director [inferido: el libro deja el momento a acuerdo con la ' +
  'DJ solo para el aluminio, el duraluminio y el electro; para el oro se extiende por analogía y la imagen no lo resuelve].'

/**
 * Columns: `pareja`, `interno`, `empujon`, `nombreBrumoso`, `categoriaAlomancia` and `eras` come from L.168 / PDF 174; `puro`, `nombreFerrin`
 * and `categoriaFeruquimia` from L.171 / PDF 177 (pairs and eras agree in both); `rasgoFeruquimico` from the subtitle of each «Feruquimia de X»
 * entry (L.213-250 / PDF 219-256); `comun` from L.167 / PDF 173.
 * `color`: approximate tone of the metal's medallion in the diagram «Tabla de metales feruquímicos» (L.170 / PDF 176), sampled from the
 * page image (median of the central region of each medallion); the 16 metals of the diagram. Atium is not in that diagram: its tone is
 * sampled the same way from the medallion of the header art of «Feruquimia de atium» (L.218 / PDF 224); same method on the aluminio
 * header (PDF 222) gives the aluminio tone of the diagram, verificado en imagen.
 */
export const METALES: MetalDef[] = [
  {
    id: 'hierro', nombre: 'Hierro', categoriaAlomancia: 'fisico', categoriaFeruquimia: 'fisico', puro: true, pareja: 'acero',
    interno: false, empujon: false, nombreBrumoso: 'Atraedor', nombreFerrin: 'Ajustador', rasgoFeruquimico: 'Peso',
    eras: ['era1', 'era2'], comun: true, color: '#465167',
  },
  {
    id: 'acero', nombre: 'Acero', categoriaAlomancia: 'fisico', categoriaFeruquimia: 'fisico', puro: false, pareja: 'hierro',
    interno: false, empujon: true, nombreBrumoso: 'Lanzamonedas', nombreFerrin: 'Mensajero de acero', rasgoFeruquimico: 'Velocidad',
    eras: ['era1', 'era2'], comun: true, color: '#6987b1',
  },
  {
    id: 'estano', nombre: 'Estaño', categoriaAlomancia: 'fisico', categoriaFeruquimia: 'fisico', puro: true, pareja: 'peltre',
    interno: true, empujon: false, nombreBrumoso: 'Ojo de estaño', nombreFerrin: 'Susurravientos', rasgoFeruquimico: 'Sentidos',
    eras: ['era1', 'era2'], comun: true, color: '#97a3a6',
  },
  {
    id: 'peltre', nombre: 'Peltre', categoriaAlomancia: 'fisico', categoriaFeruquimia: 'fisico', puro: false, pareja: 'estano',
    interno: true, empujon: true, nombreBrumoso: 'Brazo de peltre / violento', nombreFerrin: 'Bruto', rasgoFeruquimico: 'Fuerza',
    eras: ['era1', 'era2'], comun: true, color: '#525459',
  },
  {
    id: 'cinc', nombre: 'Cinc', categoriaAlomancia: 'mental', categoriaFeruquimia: 'cognitivo', puro: true, pareja: 'laton',
    interno: false, empujon: false, nombreBrumoso: 'Encendedor', nombreFerrin: 'Chispeante', rasgoFeruquimico: 'Velocidad mental',
    eras: ['era1', 'era2'], comun: true, color: '#7a7164',
  },
  {
    id: 'laton', nombre: 'Latón', categoriaAlomancia: 'mental', categoriaFeruquimia: 'cognitivo', puro: false, pareja: 'cinc',
    interno: false, empujon: true, nombreBrumoso: 'Aplacador', nombreFerrin: 'Alma de fuego', rasgoFeruquimico: 'Calor',
    eras: ['era1', 'era2'], comun: true, color: '#a07f44',
  },
  {
    id: 'cobre', nombre: 'Cobre', categoriaAlomancia: 'mental', categoriaFeruquimia: 'cognitivo', puro: true, pareja: 'bronce',
    interno: true, empujon: false, nombreBrumoso: 'Ahumador / nube de cobre', nombreFerrin: 'Archivero', rasgoFeruquimico: 'Recuerdos',
    eras: ['era1', 'era2'], comun: true, color: '#b2623b',
  },
  {
    id: 'bronce', nombre: 'Bronce', categoriaAlomancia: 'mental', categoriaFeruquimia: 'cognitivo', puro: false, pareja: 'cobre',
    interno: true, empujon: true, nombreBrumoso: 'Buscador', nombreFerrin: 'Centinela', rasgoFeruquimico: 'Desvelo',
    eras: ['era1', 'era2'], comun: true, color: '#7c4d28',
  },
  {
    id: 'cromo', nombre: 'Cromo', categoriaAlomancia: 'mejora', categoriaFeruquimia: 'espiritual', puro: true, pareja: 'nicrosil',
    interno: false, empujon: false, nombreBrumoso: 'Sanguijuela', nombreFerrin: 'Hilador', rasgoFeruquimico: 'Fortuna',
    eras: ['era2'], comun: false, color: '#a0add3',
  },
  {
    id: 'nicrosil', nombre: 'Nicrosil', categoriaAlomancia: 'mejora', categoriaFeruquimia: 'espiritual', puro: false, pareja: 'cromo',
    interno: false, empujon: true, nombreBrumoso: 'Nicroestallante', nombreFerrin: 'Portaalmas', rasgoFeruquimico: 'Investidura',
    eras: ['era2'], comun: false, color: '#302b36',
  },
  {
    id: 'aluminio', nombre: 'Aluminio', categoriaAlomancia: 'mejora', categoriaFeruquimia: 'espiritual', puro: true, pareja: 'duraluminio',
    interno: true, empujon: false, nombreBrumoso: 'Mosquito de aluminio / vacío', nombreFerrin: 'Genuino', rasgoFeruquimico: 'Identidad',
    eras: ['era2'], comun: false, color: '#6b7b85', notaLibro: NOTA_FIN_ERA_1,
  },
  {
    id: 'duraluminio', nombre: 'Duraluminio', categoriaAlomancia: 'mejora', categoriaFeruquimia: 'espiritual', puro: false, pareja: 'aluminio',
    interno: true, empujon: true, nombreBrumoso: 'Mosquito de duraluminio', nombreFerrin: 'Conector', rasgoFeruquimico: 'Conexión',
    eras: ['era2'], comun: false, color: '#84a4b9', notaLibro: NOTA_FIN_ERA_1,
  },
  {
    id: 'cadmio', nombre: 'Cadmio', categoriaAlomancia: 'temporal', categoriaFeruquimia: 'hibrido', puro: true, pareja: 'bendaleo',
    interno: false, empujon: false, nombreBrumoso: 'Pulsador', nombreFerrin: 'Resollante', rasgoFeruquimico: 'Aliento',
    eras: ['era2'], comun: false, color: '#2f3d4a',
  },
  {
    id: 'bendaleo', nombre: 'Bendaleo', categoriaAlomancia: 'temporal', categoriaFeruquimia: 'hibrido', puro: false, pareja: 'cadmio',
    interno: false, empujon: true, nombreBrumoso: 'Deslizador', nombreFerrin: 'Incorporador', rasgoFeruquimico: 'Nutrición',
    eras: ['era2'], comun: false, color: '#839598',
  },
  {
    id: 'oro', nombre: 'Oro', categoriaAlomancia: 'temporal', categoriaFeruquimia: 'hibrido', puro: true, pareja: 'electro',
    interno: true, empujon: false, nombreBrumoso: 'Augur', nombreFerrin: 'Hacedor de sangre', rasgoFeruquimico: 'Salud',
    eras: ['era1', 'era2'], comun: false, color: '#b49036', notaLibro: NOTA_ORO,
  },
  {
    id: 'electro', nombre: 'Electro', categoriaAlomancia: 'temporal', categoriaFeruquimia: 'hibrido', puro: false, pareja: 'oro',
    interno: true, empujon: true, nombreBrumoso: 'Oráculo', nombreFerrin: 'Pináculo', rasgoFeruquimico: 'Determinación',
    eras: ['era2'], comun: false, color: '#e0b95b', notaLibro: NOTA_FIN_ERA_1,
  },
  {
    // Divine metal: pairing, pure/alloy, interno/externo and Tirón/Empujón are «n/a» in both tables (L.168 / PDF 174, L.171 / PDF 177)
    id: 'atium', nombre: 'Atium', categoriaAlomancia: 'divino', categoriaFeruquimia: 'divino', puro: null, pareja: null,
    interno: null, empujon: null, nombreBrumoso: 'Vidente', nombreFerrin: 'Cronodevanador', rasgoFeruquimico: 'Juventud',
    eras: ['era1'], comun: false, color: '#4a4c64', // L.218 / PDF 224: slate-violet plate of the feruchemy entry header (not in the PDF 176 diagram); verificado en imagen
  },
]

const POR_ID = Object.fromEntries(METALES.map((m) => [m.id, m])) as Record<MetalId, MetalDef>

export const getMetal = (id: MetalId): MetalDef => POR_ID[id]
/** Paired metal (pure ↔ alloy); null for atium */
export const pareja = (id: MetalId): MetalId | null => POR_ID[id].pareja
export const esComun = (id: MetalId): boolean => POR_ID[id].comun

/**
 * Metals available to each metalborn path by era: literal copy of «Caminos de nacidos del metal por era» (L.372 / PDF 378), in the
 * book's alphabetical order. Era 1 brumoso has no gold (the Ministerio de Acero hid gold mistings); feruquimista and nacido de la bruma
 * exist only in Era 1, and ferrin and nacidoble only in Era 2 (the table has no row for them in the other era: empty lists).
 * The picker also filters by `PoderDef.caminos` (§7.5).
 */
export const METALES_POR_CAMINO_Y_ERA: Record<CaminoMetalId, Record<Era, MetalId[]>> = {
  brumoso: {
    era1: ['acero', 'atium', 'bronce', 'cinc', 'cobre', 'estano', 'hierro', 'laton', 'peltre'],
    era2: [
      'acero', 'aluminio', 'bendaleo', 'bronce', 'cadmio', 'cinc', 'cobre', 'cromo',
      'duraluminio', 'electro', 'estano', 'hierro', 'laton', 'nicrosil', 'oro', 'peltre',
    ],
  },
  'nacido-de-la-bruma': {
    era1: ['acero', 'atium', 'bronce', 'cinc', 'cobre', 'estano', 'hierro', 'laton', 'oro', 'peltre'],
    era2: [],
  },
  feruquimista: {
    era1: ['acero', 'atium', 'bronce', 'cinc', 'cobre', 'estano', 'hierro', 'laton', 'oro', 'peltre'],
    era2: [],
  },
  ferrin: {
    era1: [],
    era2: [
      'acero', 'aluminio', 'bendaleo', 'bronce', 'cadmio', 'cinc', 'cobre', 'cromo',
      'duraluminio', 'electro', 'estano', 'hierro', 'laton', 'nicrosil', 'oro', 'peltre',
    ],
  },
  nacidoble: {
    era1: [],
    era2: [
      'acero', 'aluminio', 'bendaleo', 'bronce', 'cadmio', 'cinc', 'cobre', 'cromo',
      'duraluminio', 'electro', 'estano', 'hierro', 'laton', 'nicrosil', 'oro', 'peltre',
    ],
  },
}

export const NOTA_LIBRO_METALES_POR_CAMINO_Y_ERA =
  'La tabla de L.372 / PDF 378 manda (verificado en imagen). El consejo para la DJ del feruquimista (L.145 / PDF 151) habla de gestionar ' +
  'hasta diecisiete poderes (los 17 metales con efecto de la tabla de L.171 / PDF 177), pero la tabla da 10 metales en Era 1. De los 7 ' +
  'restantes, el aluminio, el duraluminio y el electro llegan a conocerse a finales de la Era 1 (opción del director, L.167 / PDF 173; nota * ' +
  'de L.372 / PDF 378) y el bendaleo, el cadmio, el cromo y el nicrosil son de la Era 2 (L.167 / PDF 173), cuando ya no existe el feruquimista. ' +
  'La feruquimia de aluminio se describe como disponible en ambas eras (L.216 / PDF 222): manda la tabla, no ampliarla sin confirmarlo. ' +
  'En las dos filas de Era 1 el asterisco aparece tras «peltre» y remite a la nota sobre aluminio, duraluminio, electro y los brumosos de ' +
  'oro a finales de la Era 1.'
