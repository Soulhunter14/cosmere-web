/**
 * Origins of Nacidos de la bruma (chapter 2, L.31-48 / PDF 37-54): the three ancestries, the kandra Blessings, the kandra and sangre
 * koloss talent trees and the 15 cultural skills.
 *
 * Source: the text of the book plus the page images of the two trees (L.35-37 / PDF 41-43 and L.38-39 / PDF 44-45). The arrows between
 * talents exist only in those diagrams: every `prereq` is the full line of the talent's own entry, which spells out the talent
 * prerequisites that the diagram draws as arrows (checked against the arrows: they agree). Names of talents must match their
 * prerequisites character by character, because the talent engine compares them literally. Descriptions and summaries are short
 * paraphrases of the book, not quotations.
 * Light module: it may travel in the main bundle (the Blessing picker and the encyclopedia import it BY FILE), so it imports nothing
 * but types and makes no top-level calls (§8, risk 6).
 */
import type { Era } from '../../types'
import type { AttrField } from '../../worlds/types'
import type { Talento } from '../potencias'

// ── Talent trees (L.35-39 / PDF 41-45) ───────────────────────────────────────

/**
 * Kandra tree, in the order of the diagram (left branch, then right branch). «Forma natural» is the main talent and «Disfraz kandra»
 * the second free talent of level 1 (L.34 / PDF 40). The arrows of L.35 / PDF 41 hang everything else from «Disfraz kandra»:
 * Imitación improvisada → Remodelación rápida → Formas desagradables; Ocultar objeto → Herramientas orgánicas; and Formas creativas
 * from Remodelación rápida or Herramientas orgánicas.
 */
export const ARBOL_KANDRA: Talento[] = [
  {
    // L.35 / PDF 41
    name: 'Forma natural', cost: 'passive', prereq: 'ascendencia kandra',
    description:
      'Tu cuerpo amorfo se escurre ante lo que corta o perfora. En forma natural o bajo Disfraz kandra: +5 de desvío contra el daño por ' +
      'laceración, ignoras el rasgo Perforante de las armas al sufrir ese daño, una tirada de lesión por debajo de 0 cuenta como 0 (salvo ' +
      'ácido, fuego u otros medios que destruyan el cuerpo por completo) y eres inmune a la alomancia emocional, la de latón y la de cinc ' +
      'incluidas, salvo que su usuario gaste al menos 6 puntos de Investidura. En forma natural, además, con 1 acción pasas por aberturas ' +
      'de al menos 30 cm de diámetro, no puedes hablar ni comunicarte con facilidad y la mayoría de las culturas humanas te miran con ' +
      'horror o desdén.',
  },
  {
    // L.35-36 / PDF 41-42
    name: 'Disfraz kandra', cost: 'special', prereq: 'talento principal Forma natural',
    description:
      'En lugar de los beneficios de un descanso largo, ingieres a un humano Pequeño o Mediano y adoptas su forma mientras sus huesos ' +
      'sigan en ti. Tu Fuerza, Velocidad y Discernimiento se sustituyen por los suyos (tu Bendición se sigue aplicando) y se recalcula ' +
      'todo lo que dependa de ellos (si sube tu salud máxima, la actual sube lo mismo; si baja, la actual solo cambia si supera el nuevo ' +
      'máximo); una lesión que rompa o desplace un hueso no sana mientras mantengas la forma. Eres indistinguible del original y, si lo ' +
      'observaste durante un mes antes de su muerte, imitas sus modales sin pruebas de Engaño en conversaciones generales (la DJ puede ' +
      'exigirlas ante información muy específica o privada). Con 1 acción te desprendes de los huesos y vuelves a tu forma natural; si ' +
      'los conservas, puedes reutilizarlos.',
  },
  {
    // L.36 / PDF 42
    name: 'Imitación improvisada', cost: 'passive', prereq: 'Perspicacia 2 o más; talento Disfraz kandra',
    description:
      'Si observas a un personaje con atención durante una escena antes de ingerir sus huesos, imitas sus gestos de forma convincente y ' +
      'obtienes ventaja en las pruebas de Engaño sobre información de su pasado que desconozcas. Para imitarlo a la perfección sin ' +
      'pruebas sigues necesitando el mes de investigación.',
  },
  {
    // L.37 / PDF 43
    name: 'Remodelación rápida', cost: 'passive', prereq: 'Medicina 2 o más; talento Imitación improvisada',
    description: 'Puedes usar Disfraz kandra para ingerir el cuerpo de un personaje durante un descanso corto, en lugar de uno largo.',
  },
  {
    // L.36 / PDF 42
    name: 'Formas desagradables', cost: 'passive', prereq: 'Medicina 4 o más; talento Remodelación rápida',
    description:
      'Con Disfraz kandra puedes ingerir y adoptar la forma de cualquier personaje Pequeño o Mediano, no solo humanos, y obtienes los ' +
      'beneficios innatos de su cuerpo (armas, desvío, movimiento y sentidos). Tus huesos son muy vulnerables: el desvío que te dé esa ' +
      'forma no reduce el daño por golpe.',
  },
  {
    // L.37 / PDF 43
    name: 'Ocultar objeto', cost: 'action1', prereq: 'talento Disfraz kandra',
    description:
      'Con una acción de Interactuar, tú o un personaje que te tenga en su cercanía guardáis o recuperáis un objeto en un compartimento ' +
      'oculto de tu cuerpo (cabe uno solo, no más largo que tu antebrazo), a salvo de registros y de la alomancia. Solo quien tenga 6 o ' +
      'más grados en una habilidad de Artes Investidas puede afectarlo con poderes Investidos.',
  },
  {
    // L.36 / PDF 42
    name: 'Herramientas orgánicas', cost: 'passive', prereq: 'Hurto 2 o más; talento Ocultar objeto',
    description:
      'Remodelas tus extremidades al momento para convertirlas en ganzúas u otras herramientas delicadas, y obtienes ventaja en las ' +
      'pruebas de Hurto y Manufactura que se beneficien de ellas.',
  },
  {
    // L.36 / PDF 42
    name: 'Formas creativas', cost: 'action2', prereq: 'Perspicacia 3 o más; talento Remodelación rápida o Herramientas orgánicas',
    description:
      'Alteras con creatividad la apariencia de Disfraz kandra (rasgos faciales, peso…) para dejar de parecerte a la forma original de ' +
      'los huesos. Si suplantas a alguien concreto debes superar una prueba de Engaño para no levantar sospechas ante quienes lo ' +
      'conocían; si dedicas el tiempo habitual a investigarlo, tienes ventaja en ella.',
  },
]

/**
 * Sangre koloss tree, in the order of the diagram (L.39 / PDF 45): «Resistencia koloss» is the main talent; Recuperación koloss →
 * Recuperación rápida → Recuperación reactiva hang from it in a line, and Tamaño desmedido hangs from it on the other side.
 */
export const ARBOL_SANGRE_KOLOSS: Talento[] = [
  {
    // L.38 / PDF 44
    name: 'Resistencia koloss', cost: 'passive', prereq: 'ascendencia de sangre koloss',
    description:
      'Tu cuerpo soporta una tensión muy superior a la corriente: tu salud máxima y actual aumentan en 1 al crear el personaje y de ' +
      'nuevo en cada nivel que subes (+1 de salud máxima por nivel).',
    notaLibro:
      'El párrafo «Resistencia Koloss (nivel 1)» de «Elección de ascendencia de sangre koloss» escribe «Koloss» con mayúscula inicial ' +
      '(L.38 / PDF 44, verificado en imagen); el título de la ficha del talento y los prerrequisitos de los demás talentos (L.38-39 / PDF 44-45) usan ' +
      '«Resistencia koloss». Aquí, en el motor de talentos y en el servidor se usa la forma en minúscula.',
  },
  {
    // L.39 / PDF 45
    name: 'Recuperación koloss', cost: 'special', prereq: 'Atletismo 2 o más; talento principal Resistencia koloss',
    description:
      'Antes de tirar el dado de recuperación puedes tirarlo dos veces y sumar ambos resultados; si lo haces, solo recuperas salud, no ' +
      'concentración.',
  },
  {
    // L.39 / PDF 45
    name: 'Recuperación rápida', cost: 'action1', prereq: 'Atletismo 3 o más; talento Recuperación koloss',
    description:
      'Puedes usar la acción Recuperarse con 1 acción (solo recuperas salud, no concentración) y repetirla en cada escena tantas veces ' +
      'como tu rango, en lugar de una sola.',
    notaLibro:
      'El diagrama dice que puedes hacerlo tantas veces por escena como tu rango; el texto de la ficha habla de un número de veces ' +
      'adicional igual al rango, en lugar de una sola vez (L.39 / PDF 45, verificado en imagen). No queda claro si el total por escena es el rango o el rango ' +
      'más la vez habitual: se recoge la lectura del diagrama.',
  },
  {
    // L.39 / PDF 45
    name: 'Recuperación reactiva', cost: 'reaction', prereq: 'Atletismo 4 o más; talento Recuperación rápida',
    description: 'Antes de sufrir daño, puedes usar la acción Recuperarse como reacción.',
  },
  {
    // L.39 / PDF 45
    name: 'Tamaño desmedido', cost: 'passive', prereq: 'nivel 11 o más; talento principal Resistencia koloss',
    description: 'Al obtenerlo, tu Fuerza y su valor máximo aumentan en 1, y se te considera de tamaño Grande para todo salvo el espacio que ocupas.',
  },
]

// ── Kandra Blessings (L.34-35 / PDF 40-41) ───────────────────────────────────

/** Ids of the five Blessings (§2): the values of `Character.bendiciones` */
export type BendicionId = 'consciencia' | 'potencia' | 'presencia' | 'estabilidad' | 'fortaleza'

/** One bonus of a Blessing: an attribute (`AttrField`) or the Desvío value */
export interface BonoBendicion {
  objetivo: AttrField | 'desvio'
  valor: number
}

export interface BendicionKandra {
  id: BendicionId
  /** Name as the book and the server write it: the server labels the breakdown lines of the sheet with it (§6.3) */
  nombre: string
  bonos: BonoBendicion[]
  /** true: each attribute of `bonos` also raises its maximum value by the same amount (all but Fortaleza) */
  subeMaximo: boolean
  descripcion: string
  notaLibro?: string
}

/**
 * The Blessings are permanent increases that also apply under Disfraz kandra (L.34 / PDF 40) and count for talent prerequisites
 * (L.28 / PDF 34). A kandra picks one in step 3 of the creation and may earn a second, different one at rank 3 (their bonuses add up):
 * `bendiciones` of `ASCENDENCIAS_MB`.
 */
export const BENDICIONES_KANDRA: BendicionKandra[] = [
  {
    // L.34 / PDF 40
    id: 'consciencia', nombre: 'Bendición de la Consciencia',
    bonos: [{ objetivo: 'discernimiento', valor: 2 }], subeMaximo: true,
    descripcion: 'Tu Discernimiento aumenta en 2, y su valor máximo también.',
  },
  {
    // L.34 / PDF 40
    id: 'potencia', nombre: 'Bendición de la Potencia',
    bonos: [{ objetivo: 'fuerza', valor: 1 }, { objetivo: 'velocidad', valor: 1 }], subeMaximo: true,
    descripcion: 'Tu Fuerza y tu Velocidad aumentan en 1 cada una, y sus valores máximos también.',
  },
  {
    // L.35 / PDF 41
    id: 'presencia', nombre: 'Bendición de la Presencia',
    bonos: [{ objetivo: 'intelecto', valor: 1 }, { objetivo: 'presencia', valor: 1 }], subeMaximo: true,
    descripcion: 'Tu Intelecto y tu Presencia aumentan en 1 cada uno, y sus valores máximos también.',
  },
  {
    // L.35 / PDF 41
    id: 'estabilidad', nombre: 'Bendición de la Estabilidad',
    bonos: [{ objetivo: 'voluntad', valor: 2 }], subeMaximo: true,
    descripcion: 'Tu Voluntad aumenta en 2, y su valor máximo también.',
  },
  {
    // L.35 / PDF 41
    id: 'fortaleza', nombre: 'Bendición de la Fortaleza',
    bonos: [{ objetivo: 'desvio', valor: 1 }], subeMaximo: false,
    descripcion: 'Tu valor de desvío aumenta en 1; bajo el efecto de Disfraz kandra, ese desvío sí reduce el daño por golpe.',
    notaLibro:
      'El libro solo dice que el valor de desvío aumenta en 1 (L.35 / PDF 41, verificado en imagen) y no aclara si se acumula con el de la ' +
      'armadura: la app lo acumula [inferido, Q8: decisión cerrada; la imagen confirma que el libro no dice nada de la armadura].',
  },
]

// ── Ancestries (L.32-39 / PDF 38-45) ─────────────────────────────────────────

/** Stored values of `Character.ascendencia` in Nacidos de la bruma (§2); same capitalisation as `'Humano'` and `'Oyente'` */
export type AscendenciaId = 'Humano' | 'Kandra' | 'Sangre koloss'

/** ASCII key of an ancestry in the ids of the talent graph and the grids: `ascendencia:<slug>` (§7.7 #3, §8) */
export type AscendenciaSlug = 'humano' | 'kandra' | 'sangre-koloss'

/** What an extra ancestry talent can be: a talent of any heroic path or one of the ancestry's own tree */
export type TipoTalentoAscendencia = 'heroico' | 'ascendencia'

/**
 * Talent calendar and tree of an ancestry, in the shape the talent engine reads (`TalentRules.arbolesAscendencia[slug]`, §7.7 #3):
 * `autoGranted` are the talents granted free at level 1 (the first one is the main talent), `hitos` the levels that give an extra
 * talent and `acepta` what that talent can be.
 */
export interface ArbolAscendencia {
  autoGranted: string[]
  hitos: number[]
  acepta: TipoTalentoAscendencia[]
  talentos: Talento[]
}

/** A benefit of the ancestry, as «Elección de ascendencia …» lists them */
export interface BeneficioAscendencia {
  titulo: string
  /** Levels where it applies */
  niveles: number[]
  texto: string
}

/** Blessing rules of the kandra (L.34-35 / PDF 40-41) */
export interface ReglaBendiciones {
  /** Chosen in step 3 of the creation */
  alCrear: number
  /** Rank at which a second Blessing, different from the first, can be earned as a reward */
  segundaEnRango: number
  /** Blessings a character can carry: they must be distinct */
  maximo: number
}

export interface AscendenciaMB {
  id: AscendenciaId
  slug: AscendenciaSlug
  nombre: string
  /** Eras where the ancestry exists: Sangre koloss only in Era 2 (L.38 / PDF 44; L.371 / PDF 377) */
  eras: Era[]
  tamano: 'Mediano'
  /** Points to distribute among the six attributes in step 3 (12; kandra 6, L.34 / PDF 40) */
  puntosAtributoBase: number
  /** Attribute maximums above the common 5 (Sangre koloss Fuerza 6, L.38 / PDF 44); the same values as `WorldConfig.ascendencias` */
  topeAtributo?: Partial<Record<AttrField, number>>
  /** Points that can go into one attribute in step 3 when they exceed the common 3 (Sangre koloss Fuerza 4, L.38 / PDF 44) */
  topeCreacion?: Partial<Record<AttrField, number>>
  /**
   * false: cannot take talents of the metalborn paths (kandra, L.18 / PDF 24; L.34 / PDF 40). true is not «every path»: each path lists
   * the ancestries it admits in its own `ascendenciasPermitidas` (sangre koloss is out of two of them, §8)
   */
  permiteCaminoMetal: boolean
  /** null: no Blessings (only kandra have them) */
  bendiciones: ReglaBendiciones | null
  descripcion: string
  beneficios: BeneficioAscendencia[]
  notas?: string[]
  arbol: ArbolAscendencia
}

export const ASCENDENCIAS_MB: AscendenciaMB[] = [
  {
    // L.32 / PDF 38; step 5 of the creation: L.23 / PDF 29. No tree of its own: the extra talents are heroic.
    id: 'Humano', slug: 'humano', nombre: 'Humano', eras: ['era1', 'era2'], tamano: 'Mediano',
    puntosAtributoBase: 12, permiteCaminoMetal: true, bendiciones: null,
    descripcion:
      'Sus reglas se aplican a todos los humanos de Scadrial, incluidos los del sur que no sufrieron el Imperio Final. Las capacidades ' +
      'de nacido del metal se representan con los talentos de los capítulos 5 y 6, y la historia étnica, con la elección de pericias ' +
      'culturales.',
    beneficios: [
      {
        titulo: 'Talentos adicionales de ascendencia', niveles: [1, 6, 11, 16, 21],
        texto:
          'Obtienes un talento adicional en el paso 5 de la creación y otro cada vez que alcanzas un rango nuevo. Debe ser de un camino ' +
          'heroico y cumplir sus prerrequisitos.',
      },
    ],
    arbol: { autoGranted: [], hitos: [1, 6, 11, 16, 21], acepta: ['heroico'], talentos: [] },
  },
  {
    // L.33-35 / PDF 39-41; step 5 of the creation: L.23 / PDF 29
    id: 'Kandra', slug: 'kandra', nombre: 'Kandra', eras: ['era1', 'era2'], tamano: 'Mediano',
    puntosAtributoBase: 6, permiteCaminoMetal: false, bendiciones: { alCrear: 1, segundaEnRango: 3, maximo: 2 },
    descripcion:
      'Espectros de la bruma que el lord Legislador concibió como espías inmortales y dotó de sapiencia con dos clavos hemalúrgicos, ' +
      'las Bendiciones. Son masas gelatinosas que se moldean alrededor de unos huesos para adoptar la apariencia de su dueño; entre ' +
      'los suyos suelen llevar un Cuerpo verdadero de huesos artificiales visibles bajo la piel translúcida.',
    beneficios: [
      {
        titulo: 'Atributos kandra', niveles: [1],
        texto:
          'En el paso 3 repartes solo 6 puntos entre tus atributos, en lugar de 12, y eliges una Bendición. Disfraz kandra sustituye ' +
          'temporalmente tu Fuerza, Velocidad y Discernimiento por los del cuerpo ingerido: quizá prefieras priorizar otros atributos.',
      },
      {
        titulo: 'Árbol de talentos único', niveles: [1],
        texto: 'Al elegir un talento nuevo puedes tomarlo del árbol kandra, además de los árboles a los que ya tengas acceso.',
      },
      {
        titulo: 'Forma natural', niveles: [1],
        texto:
          'Obtienes Forma natural (principal de kandra) y Disfraz kandra. Más adelante podrás conseguir como recompensa los huesos de ' +
          'un Cuerpo verdadero (capítulo 8).',
      },
      {
        titulo: 'Talentos adicionales de ascendencia', niveles: [6, 11, 16, 21],
        texto: 'Un talento adicional con cada rango nuevo, del árbol kandra o de cualquier camino heroico, cumpliendo sus prerrequisitos.',
      },
    ],
    notas: [
      'No puedes elegir talentos de los caminos de nacidos del metal (L.18 / PDF 24; L.34 / PDF 40).',
      'Segunda Bendición (recompensa de rango 3): debe ser distinta de la primera y sus beneficios se acumulan. Como cada kandra nace ' +
        'con una sola, obtenerla exige la muerte de su portador original (L.35 / PDF 41).',
      'Mientras lleves Bendiciones no puedes implantarte otros clavos hemalúrgicos. Si retiras un clavo de la Bendición puedes ' +
        'implantarte otro, pero pierdes temporalmente sus beneficios y la DJ puede gastar una Complicación para mermar tu contacto con ' +
        'la realidad (L.35 / PDF 41).',
      'Era 1: lo habitual es una generación entre la 3.ª y la 10.ª (con permiso de la DJ, la 2.ª o la 11.ª) y un patrocinador humano ' +
        'que te paga en atium. Era 2: casi siempre la 11.ª, y el Contrato ya no te ata (L.33-34 / PDF 39-40).',
      'Un kandra que empieza ya disfrazado de plebeyo (con permiso de la DJ) tiene, mientras mantenga esa forma, Fuerza 0, Velocidad 1 ' +
        'y Discernimiento 1 (L.34 / PDF 40).',
    ],
    arbol: {
      autoGranted: ['Forma natural', 'Disfraz kandra'], hitos: [6, 11, 16, 21], acepta: ['ascendencia', 'heroico'], talentos: ARBOL_KANDRA,
    },
  },
  {
    // L.38 / PDF 44 (Era 2); step 5 of the creation: L.23 / PDF 29
    id: 'Sangre koloss', slug: 'sangre-koloss', nombre: 'Sangre koloss', eras: ['era2'], tamano: 'Mediano',
    puntosAtributoBase: 12, topeAtributo: { fuerza: 6 }, topeCreacion: { fuerza: 4 }, permiteCaminoMetal: true, bendiciones: null,
    descripcion:
      'Humanos descendientes de los koloss del Imperio Final: tras el Catacendro los koloss pueden procrear entre sí y con humanos, y ' +
      'sus hijos nacen sin clavos. No son intrínsecamente más fuertes ni más grandes que un humano, pero pueden aumentar su envergadura ' +
      'y su fuerza con un acondicionamiento físico intensivo.',
    beneficios: [
      {
        titulo: 'Atributos koloss', niveles: [1],
        texto: 'Tu puntuación máxima de Fuerza aumenta en 1 y, en el paso 3, puedes asignarle hasta 4 puntos (en lugar de 3).',
      },
      {
        titulo: 'Resistencia koloss', niveles: [1],
        texto: 'Obtienes el talento Resistencia koloss (principal de sangre koloss) del árbol de sangre koloss.',
      },
      {
        titulo: 'Árbol de talentos único', niveles: [1],
        texto: 'Al elegir un talento nuevo puedes tomarlo del árbol de sangre koloss, además de los árboles a los que ya tengas acceso.',
      },
      {
        titulo: 'Talentos de ascendencia adicionales', niveles: [6, 11, 16, 21],
        texto: 'Un talento adicional con cada rango nuevo, del árbol de sangre koloss o de cualquier camino heroico, cumpliendo sus prerrequisitos.',
      },
    ],
    notas: [
      'Quien acepta implantarse clavos koloss para ser un koloss completo se convierte en un PNJ koloss (L.38 / PDF 44).',
    ],
    arbol: {
      autoGranted: ['Resistencia koloss'], hitos: [6, 11, 16, 21], acepta: ['ascendencia', 'heroico'], talentos: ARBOL_SANGRE_KOLOSS,
    },
  },
]

export const getAscendencia = (id: string): AscendenciaMB | undefined => ASCENDENCIAS_MB.find((a) => a.id === id)
export const getBendicion = (id: string): BendicionKandra | undefined => BENDICIONES_KANDRA.find((b) => b.id === id)

// ── Cultures = cultural skills (L.40-47 / PDF 46-53) ─────────────────────────

/** Cultural skills a character can take in step 1 of the creation: up to two (L.18 / PDF 24; L.40 / PDF 46) */
export const MAX_CULTURAS = 2

/** What the player chooses when taking the skill (a domain, an octant, a clan…) */
export interface EleccionCultura {
  etiqueta: string
  /** Closed list printed in the book; absent when the choice is open */
  opciones?: string[]
  /** The skill can be taken again with a different choice */
  repetible: boolean
}

export interface Cultura {
  /** ASCII id (P7) */
  id: string
  nombre: string
  /** Eras whose characters can take it: the book groups them as «Pericias culturales de la Era 1 / de la Era 2 / de ambas eras» */
  eras: Era[]
  /** What the culture is, in one sentence */
  resumen: string
  /** What having the skill gives you (what you know and what you choose) */
  pericia: string
  eleccion?: EleccionCultura
  /** Who can take it */
  restriccion?: string
  /** Remark with rules value: knowledge that the skill grants or denies */
  notaJuego?: string
}

/**
 * The 15 cultural skills in the order of the book: 5 of Era 1 (L.40-43 / PDF 46-49), 6 of Era 2 (L.43-46 / PDF 49-52) and 4 of both
 * eras (L.46-47 / PDF 52-53); the split by era is the one of L.371 / PDF 377. With the DJ's approval a player can invent others (other
 * regions, subcultures; L.47 / PDF 53).
 */
export const CULTURAS: Cultura[] = [
  // ── Era 1 ──
  {
    // L.40-41 / PDF 46-47
    id: 'skaa', nombre: 'Skaa', eras: ['era1'],
    resumen: 'El pueblo más numeroso del Imperio Final, oprimido por la nobleza y muy volcado en su comunidad, su familia y sus «relatos largos».',
    pericia:
      'Localizas y entiendes las estructuras de una comunidad skaa, sus líderes y dónde dormir, y conoces los cuentos populares sobre ' +
      'brumosos y espectros de la bruma. Decides cuánto sabes escribir en imperial (la mayoría de los skaa no sabe, salvo oficio o negocio propio).',
  },
  {
    // L.41 / PDF 47
    id: 'luthadel', nombre: 'Luthadel', eras: ['era1'],
    resumen: 'La mayor ciudad de Scadrial y sede del lord Legislador: nudo del comercio por canales y de la guerra política entre las Grandes Casas.',
    pericia:
      'Conoces el Ministerio de Acero y a sus obligadores, quizá has visto trabajar a los inquisidores de acero, y sabes que existen los ' +
      'alomantes y los nacidos de la bruma (incluso has podido ver sus enfrentamientos sobre los tejados).',
  },
  {
    // L.41 / PDF 47
    id: 'dominios-interiores', nombre: 'Dominios Interiores', eras: ['era1'],
    resumen: 'El núcleo agrícola y densamente poblado del imperio, donde la nobleza manda sin discusión sobre los skaa.',
    pericia:
      'Del dominio elegido conoces las Grandes Casas y los nobles menores, sus industrias, los Montes de Ceniza y otros puntos de interés ' +
      '(los Pozos de Hathsin, el Lago Negro), y te orientas por sus carreteras y canales. Decides tu nivel de escritura en imperial y ' +
      'entiendes los dialectos del dominio.',
    eleccion: { etiqueta: 'Dominio Interior', opciones: ['Central', 'Septentrional', 'Occidental', 'Oriental', 'Meridional'], repetible: true },
  },
  {
    // L.42 / PDF 48
    id: 'dominio-de-terris', nombre: 'Dominio de Terris', eras: ['era1'],
    resumen: 'Tundra montañosa del extremo norte y hogar de los terrisanos, sometidos por el Ministerio de Acero a un programa de reproducción y servidumbre.',
    pericia:
      'Conoces las costumbres terrisanas y el alcance de esos programas. Decides tu nivel de escritura en imperial y quizá sepas algunas ' +
      'palabras de terrisano si has tratado con guardadores.',
    notaJuego:
      'Has oído rumores de «místicos» terrisanos, pero la verdad sobre la feruquimia y los guardadores no es de dominio público, ni ' +
      'siquiera con esta pericia.',
  },
  {
    // L.42-43 / PDF 48-49. «Islas Meridionales» is one of the choices of the skill's text.
    id: 'dominios-exteriores', nombre: 'Dominios Exteriores', eras: ['era1'],
    resumen: 'Los confines poco hospitalarios del imperio, donde el control del Ministerio se debilita, abundan las rebeliones skaa y patrullan los ejércitos koloss.',
    pericia:
      'Del dominio elegido conoces a los nobles menores y sus industrias, la existencia de los koloss (el tamaño de sus huestes y quizá su ' +
      'ferocidad) y los focos de resistencia de las fronteras. Decides tu nivel de escritura en imperial; en Lejano, Remoto o las Islas ' +
      'Meridionales sabes navegar con seguridad por las costas, y en el Creciente, orientarte por los desiertos.',
    eleccion: { etiqueta: 'Dominio Exterior', opciones: ['Lejano', 'Creciente', 'Remoto', 'Islas Meridionales'], repetible: true },
  },
  // ── Era 2 ──
  {
    // L.43 / PDF 49
    id: 'elendel', nombre: 'Elendel', eras: ['era2'],
    resumen: 'La mayor urbe de Scadrial, sobre el lugar de la Ascensión Final: epicentro del comercio y la inventiva, con gobernador electo y senado.',
    pericia:
      'Conoces a las familias poderosas, las leyes municipales y el funcionamiento de la policía. Eliges un octante de origen (negocios, ' +
      'organizaciones públicas y monumentos), tu educación y tu nivel al hablar y escribir skaa y alto imperial, y conoces los dogmas ' +
      'básicos del supervivencialismo, el lasquismo y el Camino.',
    eleccion: { etiqueta: 'Octante de origen', repetible: false },
    notaJuego: 'Aunque no seas brumoso, conoces bien la alomancia y recitas de memoria los metales alománticos y las capacidades de cada uno.',
  },
  {
    // L.44 / PDF 50. The culture shares its name with the ancestry.
    id: 'sangre-koloss', nombre: 'Sangre koloss', eras: ['era2'],
    resumen: 'Gente nacida de al menos un progenitor koloss o de sangre koloss, entre dos mundos, que antepone la familia, la comunidad y la autenticidad individual.',
    pericia:
      'Conoces los clanes locales y los principales pueblos o barrios de sangre koloss, y sabes desenvolverte con las costumbres de los ' +
      'clanes y de las comunidades urbanas. Eliges una comunidad o un clan donde hayas vivido (territorio, líderes, familias, historia), ' +
      'tu educación y tu nivel de skaa, y conoces los principios del supervivencialismo, el lasquismo y el Camino.',
    eleccion: { etiqueta: 'Comunidad de sangre koloss o clan', repetible: false },
  },
  {
    // L.44 / PDF 50
    id: 'malwish', nombre: 'Malwish', eras: ['era2'],
    resumen: 'Nación militante del continente meridional, de tecnología avanzada, gran respeto por el decoro y los nacidos del metal y religión propia, el Jaggenmire; todos llevan máscara.',
    pericia:
      'Conoces la geografía del sur y las costumbres de las máscaras (probablemente tengas al menos una), la tecnología de medallones y ' +
      'aeronaves y los dogmas básicos del Jaggenmire. Eliges tu nivel de malwish hablado y escrito.',
  },
  {
    // L.44-45 / PDF 50-51
    id: 'ciudades-exteriores', nombre: 'Ciudades exteriores', eras: ['era2'],
    resumen: 'Bilming, Nueva Seran y asentamientos menores de la Cuenca que siguen el ejemplo de Elendel, con un movimiento independentista cada vez más popular.',
    pericia:
      'Conoces las industrias de la Cuenca, sobre todo la logística de carga y transporte. De la ciudad o región elegida sabes sus ' +
      'importaciones y exportaciones y dónde encontrar negocios y lugares de interés. Eliges tu educación y tu nivel de skaa y alto ' +
      'imperial, y conoces los dogmas del supervivencialismo, el lasquismo y el Camino.',
    eleccion: { etiqueta: 'Ciudad o región de la Cuenca de Elendel', repetible: true },
  },
  {
    // L.45 / PDF 51. The section is titled «Los Áridos»; the skill is «Pericia Áridos».
    id: 'aridos', nombre: 'Los Áridos', eras: ['era2'],
    resumen: 'La desolada franja fronteriza más allá de las cordilleras de la Cuenca: hacenderos, prospectores, compañías mineras, delincuentes y clanes koloss.',
    pericia:
      'Conoces las líneas ferroviarias, los negocios mineros y los núcleos de población principales; sin entrenamiento en supervivencia, ' +
      'sabes encontrar agua o reconocer accidentes geográficos. Eliges tu región, tu educación y tu nivel de skaa, y conoces los dogmas ' +
      'del supervivencialismo, el lasquismo y el Camino.',
    eleccion: { etiqueta: 'Región', opciones: ['Áridos del Norte', 'Áridos del Sur', 'Ambos'], repetible: false },
  },
  {
    // L.46 / PDF 52
    id: 'enclaves-terrisanos', nombre: 'Enclaves terrisanos', eras: ['era2'],
    resumen: 'Comunidades terrisanas repartidas por la Cuenca (la mayor es la Aldea de Elendel), supervisadas por su Sínodo y entregadas a la erudición, la educación y la salud espiritual.',
    pericia:
      'Conoces a los maestros, ancianos y miembros del Sínodo más destacados, sabes desenvolverte con sus costumbres y puedes acceder a ' +
      'bibliotecas y registros terrisanos. Eliges un enclave, tu educación y tu nivel de terrisano y tu grado de conocimiento de la ' +
      'erudición y las prácticas meditativas terrisanas, y conoces a Armonía y la antigua religión terrisana.',
    eleccion: { etiqueta: 'Enclave terrisano', repetible: false },
    notaJuego: 'Aunque no seas ferrin, conoces bien la feruquimia y recitas de memoria los metales feruquímicos y los atributos que permite almacenar cada uno.',
  },
  // ── Ambas eras ──
  {
    // L.46-47 / PDF 52-53
    id: 'tierra-natal-kandra', nombre: 'Tierra Natal kandra', eras: ['era1', 'era2'],
    resumen: 'El refugio subterráneo de los kandra, regido por el Primer Contrato en el Imperio Final y convertido, tras el Catacendro, en lugar de peregrinaje más que de residencia.',
    pericia:
      'Conoces a la Primera Generación, las responsabilidades de la Segunda, el Primer Contrato y otros secretos de su historia (incluida ' +
      'la información de «Ascendencia kandra»). En la Era 1 decides qué experiencia tienes fuera de la Tierra Natal; en la Era 2 conoces ' +
      'los negocios, el ocio y las costumbres modernas de los kandra. Eliges tu educación y tu nivel de imperial/skaa y terrisano, y ' +
      'conoces a Conservación y Ruina y, si juegas tras el Catacendro, también a Armonía.',
    restriccion: 'Normalmente solo para personajes kandra; con permiso de la DJ, para quien haya convivido con ellos o trabajado a su servicio.',
  },
  {
    // L.47 / PDF 53
    id: 'alta-sociedad', nombre: 'Alta sociedad', eras: ['era1', 'era2'],
    resumen: 'El mundo de la nobleza y los acaudalados, con sus bailes, cenas de gala y salas de fumadores; tras el Catacendro se suman banqueros e industriales.',
    pericia:
      'Dominas la etiqueta, el protocolo y las modas de la aristocracia, y sabes quiénes son los nobles locales y cuánta influencia ' +
      'tienen en la política y los negocios; rara vez te perderás una invitación a un baile. No hace falta ser noble para elegirla.',
  },
  {
    // L.47 / PDF 53
    id: 'bajos-fondos', nombre: 'Bajos fondos', eras: ['era1', 'era2'],
    resumen: 'El hampa que nace de la explotación skaa: rebeldes y revolucionarios que traman en la sombra y bandas de ladrones y estafadores; sigue viva tras el Catacendro.',
    pericia:
      'Sabes (o averiguas pronto) quién manda en la zona, contactas con ladrones, bandas y cuadrillas aunque sea por el contacto de otro ' +
      'contacto y entiendes los códigos del hampa (señales de contrabandistas, jerga de ladrones). Encuentras con facilidad un perista o ' +
      'un comprador de mercancía robada, aunque el riesgo suele estar a la altura de la recompensa.',
  },
  {
    // L.47 / PDF 53. The section is titled «Peregrinos»; the skill is «Pericia Peregrina».
    id: 'peregrina', nombre: 'Peregrina', eras: ['era1', 'era2'],
    resumen: 'Scadrianos de vida errante, por exilio, trabajo o curiosidad: nómadas de las tierras abrasadas, eruditos en busca de maravillas lejanas, vagabundos de los Áridos o exploradores malwish.',
    pericia:
      'Conoces la geografía internacional y sabes interpretar mapas de todo tipo, te desenvuelves en los intercambios culturales entre ' +
      'tierras lejanas, dominas la jerga y los referentes de todo Scadrial y reconoces la fauna y el ganado de cualquier rincón del mundo.',
  },
]
