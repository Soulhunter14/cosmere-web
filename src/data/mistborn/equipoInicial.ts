/**
 * Starting equipment of Nacidos de la bruma (chapter 7, L.254-255 / PDF 260-261): the seven packages a character chooses from in step
 * 6 of the creation (Artesano, Bajos fondos, Fugitivo, Guardador, Indagador, Mercenario and Noble). Each one gives weapons, armor, gear
 * and money (dice; ten times as much in Era 2) and some add a benefit that is not an object.
 *
 * Source: the page images of L.254-255 / PDF 260-261 (every row was read against them) and the catalog of the world (T40,
 * `07-delta-catalogo.md` §10): every name below is the `Name` of a row of the Mistborn catalog, because the Bolsa stores NAMES and its
 * arrays have no quantity field, so «5 velas» are the same name five times. Where the book's wording is not a catalog name (a «cofre»
 * is an «Arcón») the row says so with `[inferido]`. Benefit texts are short paraphrases of the book, not quotations.
 * Light module: it only imports types, so the sheet can load it by file from its lazy chunk (§8, risk 6).
 */
import type { Era } from '../../types'
import type { ArteMetal } from './metales'

/** The «10 ×» of Era 2 (L.254 / PDF 260: «10 × 4d8 arquillas»); every package that gives money applies it */
export const MULTIPLICADOR_DINERO_ERA2 = 10

/** The categories of weapon that a package can ask for: «arma ligera» and «arma no especial» (L.255 / PDF 261) */
export type GrupoArmas = 'ligera' | 'no-especial'

/** A weapon of the book's tables, by catalog name; `era` = it only exists in that era (firearms: «ERA 2», L.262 / PDF 268) */
export interface ArmaDeTabla {
  nombre: string
  era?: Era
}

/** A weapon the package gives, always the same one (and, if `era` is set, only in that era: the book tags the row «ERA 1» / «ERA 2») */
export interface ArmaFija {
  tipo: 'fijo'
  nombre: string
  era?: Era
}

/** A weapon the player picks from a category of the book's tables */
export interface ArmaElegida {
  tipo: 'eleccion'
  /** What the picker asks for («Arma ligera», «Martillo o arma ligera»…) */
  etiqueta: string
  grupo: GrupoArmas
  /** Catalog names that are also valid although they are not in the category («Martillo» for the Artesano) */
  ademas?: string[]
}

export type ArmaPaquete = ArmaFija | ArmaElegida

/** A catalog item the package gives, `cantidad` times (the bag has no quantity field: the name is repeated) */
export interface ObjetoPaquete {
  nombre: string
  cantidad: number
}

/** A benefit of the package that is not an object (L.255 / PDF 261) */
export interface BeneficioPaquete {
  titulo: string
  /** Paraphrase of the rule */
  texto: string
  /** Fugitivo and Guardador: the initial goal of this art is completed at once when the main talent of a path with the art is acquired */
  completaMeta?: ArteMetal
}

export interface PaqueteInicial {
  /** ASCII id (§2, P7) */
  id: string
  /** As the book titles it: «Equipo inicial de {nombre}» */
  nombre: string
  /** One line for the list of packages */
  resumen: string
  armas: ArmaPaquete[]
  /** Catalog names of the armors */
  armaduras: string[]
  equipo: ObjetoPaquete[]
  /** Money in Era 1: `dados`d`caras` arquillas, times MULTIPLICADOR_DINERO_ERA2 in Era 2; null = none */
  dinero: { dados: number; caras: number } | null
  beneficios: BeneficioPaquete[]
  /** Erratum or discrepancy of the book about this package */
  notaLibro?: string
}

// ── Weapon categories (names as the catalog seeds them) ───────────────────────

/**
 * «Armas ligeras»: the table «Armamento ligero» (L.258 / PDF 264) and, in Era 2, the «Armas ligeras» of the firearms table
 * (L.262 / PDF 268, which the book itself heads with that word) [inferido: the equipment text says «arma ligera» without saying whether it covers
 * the firearms of Era 2]. The «Armas especiales» (palo de ruido, bastón de duelo…) are not here.
 */
export const ARMAS_LIGERAS: ArmaDeTabla[] = [
  { nombre: 'Bastón de madera' },
  { nombre: 'Cuchillo' },
  { nombre: 'Daga de cristal' },
  { nombre: 'Espada lateral' },
  { nombre: 'Lanza corta' },
  { nombre: 'Maza' },
  { nombre: 'Arco corto' },
  { nombre: 'Honda' },
  { nombre: 'Granada de fragmentación', era: 'era2' },
  { nombre: 'Fusil de caza', era: 'era2' },
  { nombre: 'Pistola de bota', era: 'era2' },
  { nombre: 'Pistola de cañón corto', era: 'era2' },
  { nombre: 'Revólver', era: 'era2' },
]

/** «Armas pesadas»: the table «Armamento pesado» (L.259 / PDF 265) and, in Era 2, the «Armas pesadas» of the firearms table (L.262 / PDF 268) */
export const ARMAS_PESADAS: ArmaDeTabla[] = [
  { nombre: 'Alabarda' },
  { nombre: 'Escudo' },
  { nombre: 'Escudo de madera' },
  { nombre: 'Espada larga' },
  { nombre: 'Hacha' },
  { nombre: 'Hacha de obsidiana' },
  { nombre: 'Lanza larga' },
  { nombre: 'Martillo' },
  { nombre: 'Arco largo' },
  { nombre: 'Ballesta' },
  { nombre: 'Granada de conmoción', era: 'era2' },
  { nombre: 'Cañón de mano', era: 'era2' },
  { nombre: 'Carabina', era: 'era2' },
  { nombre: 'Escopeta', era: 'era2' },
  { nombre: 'Fusil de cerrojo', era: 'era2' },
]

/**
 * What each category offers. «No especial» is every light and heavy weapon: the book uses the phrase that way in «arma ligera o pesada
 * no especial» (L.260 / PDF 266) and never defines it for the Mercenario [inferido: that the light and heavy firearms of Era 2 count]
 */
export const ARMAS_POR_GRUPO: Record<GrupoArmas, ArmaDeTabla[]> = {
  ligera: ARMAS_LIGERAS,
  'no-especial': [...ARMAS_LIGERAS, ...ARMAS_PESADAS],
}

// ── The seven packages, in the order of the book ───────────────────────────

export const EQUIPO_INICIAL: PaqueteInicial[] = [
  {
    // L.254 / PDF 260
    id: 'artesano',
    nombre: 'Artesano',
    resumen: 'Un arma a elegir, armadura de cuero y un arcón con suministros quirúrgicos, de escritura y de música.',
    armas: [{ tipo: 'eleccion', etiqueta: 'Martillo o arma ligera', grupo: 'ligera', ademas: ['Martillo'] }],
    armaduras: ['Cuero'],
    equipo: [
      { nombre: 'Arcón', cantidad: 1 }, // [inferido]: the book says «cofre»
      { nombre: 'Ropa (común)', cantidad: 1 },
      { nombre: 'Suministros quirúrgicos', cantidad: 1 },
      { nombre: 'Antiséptico (débil, 5 dosis)', cantidad: 1 }, // [inferido]: «5 dosis de antiséptico suave»
      { nombre: 'Cálamo', cantidad: 1 },
      { nombre: 'Tinta (vial de 30 ml)', cantidad: 1 }, // [inferido]: «un frasco de tinta»
      { nombre: 'Papel o pergamino (1 hoja)', cantidad: 5 }, // «5 hojas de pergamino»
      { nombre: 'Vela', cantidad: 5 },
      { nombre: 'Pedernal y acero', cantidad: 1 },
      { nombre: 'Botella (cristal)', cantidad: 3 }, // «3 botellas de cristal vacías»
      { nombre: 'Diapasón', cantidad: 1 },
      { nombre: 'Instrumento musical', cantidad: 1 }, // «de tu elección»: the catalog has one generic row
      { nombre: 'Balanza', cantidad: 1 },
    ],
    dinero: { dados: 4, caras: 8 },
    beneficios: [],
  },
  {
    // L.254 / PDF 260
    id: 'bajos-fondos',
    nombre: 'Bajos fondos',
    resumen: 'Dos armas ligeras, armadura de cuero y las herramientas de quien vive de la calle.',
    armas: [
      { tipo: 'eleccion', etiqueta: 'Primera arma ligera', grupo: 'ligera' },
      { tipo: 'eleccion', etiqueta: 'Segunda arma ligera', grupo: 'ligera' },
    ],
    armaduras: ['Cuero'],
    equipo: [
      { nombre: 'Mochila', cantidad: 1 },
      { nombre: 'Ropa (común)', cantidad: 1 },
      { nombre: 'Alcohol (botella)', cantidad: 1 }, // «botella de whisky»
      { nombre: 'Nudilleras', cantidad: 1 }, // «nudillera»
      { nombre: 'Palanca', cantidad: 1 },
      { nombre: 'Ganzúa', cantidad: 1 },
      { nombre: 'Cuerda (15 metros)', cantidad: 1 },
      { nombre: 'Pedernal y acero', cantidad: 1 },
      { nombre: 'Linterna (aceite)', cantidad: 1 }, // [inferido]: «una lámpara de aceite»
      { nombre: 'Aceite (1 frasco)', cantidad: 1 },
      { nombre: 'Comida (callejera, 1 día)', cantidad: 5 }, // «comida callejera para 5 días»
    ],
    dinero: { dados: 1, caras: 20 },
    beneficios: [],
  },
  {
    // L.255 / PDF 261
    id: 'fugitivo',
    nombre: 'Fugitivo',
    resumen: 'Sin armas, armadura ni dinero: solo ropa raída. Completa de inmediato la meta inicial de alomancia.',
    armas: [],
    armaduras: [],
    equipo: [{ nombre: 'Ropa (raída)', cantidad: 1 }],
    dinero: null,
    beneficios: [
      {
        titulo: 'Ruptura',
        texto:
          'Al adquirir el talento principal de un camino de nacido del metal con alomancia (brumoso, nacido de la bruma o nacidoble), en la ' +
          'creación o en un nivel posterior, tu meta inicial «Entrenar tu(s) poder(es)» queda completada de inmediato.',
        completaMeta: 'alomancia',
      },
    ],
  },
  {
    // L.255 / PDF 261
    id: 'guardador',
    nombre: 'Guardador',
    resumen: 'Sin armas, armadura ni dinero: solo ropa buena. Completa de inmediato la meta inicial de feruquimia.',
    armas: [],
    armaduras: [],
    equipo: [{ nombre: 'Ropa (buena)', cantidad: 1 }], // «ropa buena (túnica)»
    dinero: null,
    beneficios: [
      {
        titulo: 'Mente de metal',
        texto:
          'Al adquirir el talento principal de un camino de nacido del metal con feruquimia (ferrin, feruquimista o nacidoble), en la ' +
          'creación o en un nivel posterior, tu meta inicial «Fabricar tu(s) mente(s) de metal» queda completada de inmediato.',
        completaMeta: 'feruquimia',
      },
    ],
  },
  {
    // L.255 / PDF 261
    id: 'indagador',
    nombre: 'Indagador',
    resumen: 'Cuchillo (Era 1) o pistola de bota (Era 2), uniforme, material de escritura, un libro de referencia y la pericia de Literatura.',
    armas: [
      { tipo: 'fijo', nombre: 'Cuchillo', era: 'era1' },
      { tipo: 'fijo', nombre: 'Pistola de bota', era: 'era2' },
    ],
    armaduras: ['Uniforme'],
    equipo: [
      { nombre: 'Mochila', cantidad: 1 },
      { nombre: 'Ropa (común)', cantidad: 1 },
      { nombre: 'Cálamo', cantidad: 1 },
      { nombre: 'Tinta (vial de 30 ml)', cantidad: 1 }, // [inferido]: «un frasco de tinta»
      { nombre: 'Papel o pergamino (1 hoja)', cantidad: 20 }, // «20 hojas de papel»
      { nombre: 'Linterna (aceite)', cantidad: 1 }, // [inferido]: «una linterna»
      { nombre: 'Libro (referencia)', cantidad: 1 }, // «sobre un tema a tu elección (con el visto bueno de la DJ)»
      { nombre: 'Cerradura y llave', cantidad: 1 },
    ],
    dinero: { dados: 3, caras: 12 },
    beneficios: [
      {
        titulo: 'Pericia adicional',
        texto:
          'Obtienes la pericia de utilidad Literatura (si ya la tienes, otra pericia cultural o de utilidad a tu elección), además de las ' +
          'que eliges al crear el personaje.',
      },
    ],
  },
  {
    // L.255 / PDF 261
    id: 'mercenario',
    nombre: 'Mercenario',
    resumen: 'Un arma no especial, uniforme y coraza, y raciones de comida para diez días.',
    armas: [{ tipo: 'eleccion', etiqueta: 'Arma no especial', grupo: 'no-especial' }],
    armaduras: ['Uniforme', 'Coraza'],
    equipo: [
      { nombre: 'Mochila', cantidad: 1 },
      { nombre: 'Ropa (común)', cantidad: 1 },
      { nombre: 'Odre', cantidad: 1 },
      { nombre: 'Lupa', cantidad: 1 },
      { nombre: 'Palanca', cantidad: 1 },
      { nombre: 'Grilletes', cantidad: 1 },
      { nombre: 'Comida (ración, 1 día)', cantidad: 10 }, // «raciones de comida para 10 días»
    ],
    dinero: { dados: 2, caras: 6 },
    beneficios: [],
    notaLibro:
      'Errata del libro: los ejemplos de creación citan un «equipo inicial de Militar» (Marasi, L.135 / PDF 141; Razal, L.149 / PDF 155; Wax, ' +
      'L.153 / PDF 159; Miles, L.154 / PDF 160; y varios caminos heroicos, L.86-87 / PDF 92-93, L.110-111 / PDF 116-117 y L.119 / PDF 125) ' +
      'que no existe en la lista de siete de L.254-255 / PDF 260-261; equivale a Mercenario [inferido]. También citan «Cortesano» (L.86 / PDF ' +
      '92) y «Prisionero» (L.79 / PDF 85), que tampoco figuran en la lista.',
  },
  {
    // L.255 / PDF 261
    id: 'noble',
    nombre: 'Noble',
    resumen: 'Bastón de duelo y un arma ligera, alcohol y ropa elegante, y el apoyo de un patrocinador de tu casa.',
    armas: [
      { tipo: 'fijo', nombre: 'Bastón de duelo' },
      { tipo: 'eleccion', etiqueta: 'Arma ligera', grupo: 'ligera' },
    ],
    armaduras: [],
    equipo: [
      { nombre: 'Alcohol (botella)', cantidad: 1 }, // «una botella de vino selecto o de whisky»
      { nombre: 'Ropa (buena)', cantidad: 1 }, // [inferido]: «ropa elegante»
    ],
    dinero: { dados: 4, caras: 20 },
    beneficios: [
      {
        titulo: 'Conexión',
        texto:
          'Cuentas con el apoyo de un patrocinador de tu casa noble (capítulo 8, «Patrocinadores»), que te garantiza alojamiento y un cierto ' +
          'nivel de vida.',
      },
    ],
  },
]
