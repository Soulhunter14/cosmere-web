/**
 * Metalborn paths of Nacidos de la bruma (chapter 5, L.127-159 / PDF 133-165): the five paths that unlock alomancia, feruquimia or both.
 * They work like the heroic paths (a main talent plus a tree) but have no specialties and exclude each other (L.127 / PDF 133). The
 * tree of each path is flat and its main talent is NOT in `talentos`: the talent engine builds the root node from the `mainTalent*`
 * fields (§7.7). The trees of the powers themselves (chapter 6) live in alomancia.ts and feruquimia.ts.
 *
 * Source: the entries of each path (main talent plus «Talentos de …», printed in alphabetical order, which is the order kept here) and
 * the diagram of each path (L.137, 143, 147, 151, 157 / PDF 143, 149, 153, 157, 163). Texts are short paraphrases of the book, not
 * quotations; only names and `prereq` are literal, because the engine compares talent names character by character (§7.7, T03): the
 * «talento Investido» or «talento principal Herencia feruquímica» of a prerequisite must match the names below exactly. A prerequisite
 * is the wording of the entry (the diagrams only print the numeric prerequisites: the talent ones are their arrows), without the final
 * full stop. `cost` is read from the «Activación:» glyph of each entry (star = special, infinity = passive, hollow triangle = free
 * action, solid triangle = one action) and confirmed against the icons of the diagrams. Differences between the entry and its diagram
 * go in `notaLibro`.
 * Light module: it only imports types, so components can load it by file from their lazy chunk (§8, risk 6).
 */
import type { ActivationType } from '../../components/TalentActivation'
import type { Era } from '../../types'
import type { Talento } from '../potencias'
import type { ArteMetal, CaminoMetalId } from './metales'

/** The Investida skills a main talent adds; each lives in a custom skill slot, found by this exact name (L.128 / PDF 134) */
export type HabilidadInvestidaNombre = 'Alomancia' | 'Feruquimia'

/**
 * How the first metalborn goal chooses its powers (§7.5): 'uno' = the only power of the art (brumoso, ferrin); 'pareja' = a pair
 * Empujón/Tirón (nacido de la bruma, L.141 / PDF 147); 'puro-aleacion-o-atium' = a pure metal and its alloy, or atium (feruquimista,
 * L.146 / PDF 152); 'uno-por-arte' = one power of each art, the same metal or different ones (nacidoble, L.155 / PDF 161).
 */
export type SeleccionMeta = 'uno' | 'pareja' | 'puro-aleacion-o-atium' | 'uno-por-arte'

/** A «meta de nacido del metal» that a main talent grants (L.132-133 / PDF 138-139). The sheet creates it as a normal `Meta` */
export interface MetaNacidoDelMetalDef {
  /** Art whose power(s) the goal unlocks */
  arte: ArteMetal
  /** Title exactly as the book names the goal (§2) */
  titulo: string
  /** Text for `CreateMetaRequest.descripcion`: how to advance and what completing it rewards */
  descripcion: string
}

export interface CaminoNacidoDelMetal {
  /** Value of `Character.caminoMetal` (§2) */
  id: CaminoMetalId
  /** Visible name */
  name: string
  /** What the path is, in a few lines */
  definition: string
  /** Eras where the path exists: the «ERA 1» / «ERA 2» tag of its heading (L.19 / PDF 25); agrees with METALES_POR_CAMINO_Y_ERA */
  eras: Era[]
  /** «Solo recomendado para jugadores experimentados» (asterisk of the table L.19 / PDF 25; advice of L.140 / PDF 146 and L.145 / PDF 151) */
  soloExperimentados: boolean
  /** Ancestries that can take the main talent, as in `Character.ascendencia`. Kandra is excluded in all five (L.18 / PDF 24) */
  ascendenciasPermitidas: string[]
  /** «Habilidad inicial» (L.19 / PDF 25): the free degree of the skill when the path is the starting path; null = none */
  habilidadInicial: 'Alomancia' | 'Feruquimia' | 'Disciplina' | null

  // Main talent: the same `mainTalent*` fields as HeroicPath
  mainTalent: string
  /** Wording of the entry, so that the engine can parse it: «ascendencia …; no tener ningún otro talento de ruptura o herencia» */
  mainTalentPrerequisites: string
  mainTalentActivation: ActivationType
  /** Opening lines of the entry, in own words */
  mainTalentRolDescription: string
  /** What the main talent grants, in own words */
  mainTalentEffect: string

  /** Investida skills the main talent adds, with their initial degrees (L.128 / PDF 134) */
  habilidadesInvestidas: { nombre: HabilidadInvestidaNombre; grados: number }[]
  /** How many powers of each art the main talent grants (nascent): a number, or 'todos' = all of the era (L.19 / PDF 25) */
  poderes: { alomancia: 0 | 1 | 'todos'; feruquimia: 0 | 1 | 'todos' }
  seleccionMeta: SeleccionMeta
  /** The main talent gives a maximum Investidura and the action Beber vial (the alomantic paths; feruquimia has no Investidura, L.131 / PDF 137) */
  concedeInvestidura: boolean
  /** Goals the main talent grants; their titles are those of §2 */
  metasIniciales: MetaNacidoDelMetalDef[]
  /** Flat tree of the path WITHOUT the main talent, in the order of the entries of the book (alphabetical) */
  talentos: Talento[]
  /** Hex colour for ink()/tint() (§7.8). [inferido]: the book gives no colour to the paths (verificado en imagen, PDF 133-165: every path banner is the same grey plate) */
  color: string
  /** Name of the provisional Lucide icon (rendered by `mistborn.icons.tsx`). [inferido → Q18]: the book has no icons for the paths (verificado en imagen, PDF 133-165) */
  icon: string
  /** Erratum or discrepancy of the book about the main talent (the tree talents carry their own `Talento.notaLibro`) */
  notaLibro?: string
}

// Descriptions the book repeats word for word in several paths (the prerequisite is the only difference between entries)
const DESC_INVESTIDO =
  'Aprendes a contener y quemar más metal a la vez: tu Investidura máxima aumenta en el valor de tu rango y vuelve a subir 1 ' +
  'cada vez que tu rango aumenta.'
const DESC_TRAZAS_DE_METAL =
  'Puedes quemar trazas de metal de tu reserva, procedentes de agua contaminada o de utensilios metálicos: lo justo para usar la ' +
  'versión naciente de tus poderes alománticos aunque tengas 0 puntos de Investidura o estés Desprovisto de ellos.'
const DESC_QUEMAR_INSTINTIVAMENTE =
  'Tras un descanso largo eliges un poder alomántico que hayas desbloqueado con tu camino de nacido del metal o con un clavo ' +
  'hemalúrgico. Al empezar una escena puedes usar su acción Quemar antes del turno del primer personaje, sin gastar acción y ' +
  'pagando la Investidura de la forma habitual. El beneficio termina cuando usas este talento para elegir otro poder.'
const DESC_ALMACENAMIENTO_RAPIDO =
  'Almacenar tu poder feruquímico se vuelve casi instintivo: tus acciones feruquímicas de Almacenar pasan a costar una acción gratuita.'
const DESC_DECANTACION_INSTINTIVA =
  'Tras un descanso largo eliges un poder feruquímico que hayas desbloqueado con tu camino de nacido del metal o con un clavo ' +
  'hemalúrgico. Al empezar una escena puedes usar su acción Decantar antes del turno del primer personaje, sin gastar acción y ' +
  'gastando las cargas de la forma habitual. El beneficio termina cuando usas este talento para elegir otro poder.'
const DESC_MENTE_DE_METAL_INTEGRADA =
  'Tras un descanso largo puedes integrar una de tus mentes de metal en la piel, como un pendiente u otro adorno. Mientras esté ' +
  'integrada, solo pueden afectarla con Artes Investidas los personajes con al menos 6 grados en una habilidad de Artes Investidas, y ' +
  'es probable que pase inadvertida en los registros rutinarios (a discreción de la DJ). Sigue integrada hasta que uses este ' +
  'talento de nuevo o te la quites por otros medios.'
const DESC_MENTES_DE_METAL_AMPLIADAS =
  'Logras que tus mentes de metal alberguen más poder feruquímico: el número máximo de cargas de la mente de cada poder aumenta en el ' +
  'valor de tu rango y vuelve a subir 1 cada vez que tu rango aumenta.'

/**
 * The five metalborn paths in the order of the book (chapter 5; the creation table of L.19 / PDF 25 lists them alphabetically).
 * Main talents: Ruptura de brumoso (L.135 / PDF 141), Ruptura de nacido de la bruma (L.141 / PDF 147), Herencia feruquímica
 * (L.146 / PDF 152, with a tilde: never «feruquimista»), Herencia ferrin (L.150 / PDF 156) and Herencia nacidoble (L.155 / PDF 161).
 * 5 main talents plus 33 tree talents (5, 6, 6, 5 and 11); 19 distinct names, because 7 names repeat across paths with a different
 * prerequisite and are transcribed in each path (§7.7 #3).
 */
export const CAMINOS_NACIDOS_DEL_METAL: CaminoNacidoDelMetal[] = [
  // ─────────────────────────────────────────────────────────────
  // BRUMOSO — main talent L.135 / PDF 141, tree L.136 / PDF 142, diagram L.137 / PDF 143
  // ─────────────────────────────────────────────────────────────
  {
    id: 'brumoso',
    name: 'Brumoso',
    // L.134 / PDF 140; table L.19 / PDF 25
    definition:
      'El nacido del metal más habitual de ambas eras: un alomante con un único poder, que quema un metal para acceder al poder de ' +
      'Conservación. Al depender de un solo poder suele dominarlo antes que un nacidoble o un nacido de la bruma, por lo que es un buen ' +
      'maestro para ellos, y con años de uso intenso puede llegar a ser sabio.',
    eras: ['era1', 'era2'], // «Este camino está disponible en ambas eras», L.127 / PDF 133
    soloExperimentados: false,
    ascendenciasPermitidas: ['Humano', 'Sangre koloss'], // L.135 / PDF 141
    habilidadInicial: 'Alomancia', // L.135 / PDF 141: one free degree on top of the one from Ruptura de brumoso
    mainTalent: 'Ruptura de brumoso',
    mainTalentPrerequisites: 'ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia',
    mainTalentActivation: 'special',
    mainTalentRolDescription:
      'Sufres la ruptura y obtienes un poder alomántico. Al principio solo manejas una versión rudimentaria de tu capacidad, quizá sin ' +
      'ser consciente de ello, pero con práctica o entrenamiento llegarás a dominarla.',
    mainTalentEffect:
      'Obtienes acceso a la Investidura, con un máximo de 2 + tu Discernimiento o tu Presencia (el mayor), y puedes usar la acción ' +
      'Beber vial. Añades la habilidad Alomancia (Voluntad) con 1 grado inicial. Eliges un poder alomántico disponible en tu era: por ' +
      'ahora solo puedes usar su versión naciente (la alomancia de atium es la excepción: se usa completa). Obtienes la meta de nacido ' +
      'del metal «Entrenar tu poder» (salvo con atium): al completarla desbloqueas la versión completa del poder y puedes elegir los ' +
      'talentos de su árbol.',
    habilidadesInvestidas: [{ nombre: 'Alomancia', grados: 1 }],
    poderes: { alomancia: 1, feruquimia: 0 },
    seleccionMeta: 'uno',
    concedeInvestidura: true,
    metasIniciales: [
      {
        arte: 'alomancia',
        titulo: 'Entrenar tu poder', // L.132-133 / PDF 138-139; L.135 / PDF 141
        descripcion:
          'Experimenta con tu poder naciente de formas creativas o practica con él siempre que puedas. Con un mentor, o con un ' +
          'compañero que tenga el mismo poder, avanzas el doble de rápido. Al completarla desbloqueas la versión completa del poder ' +
          'y puedes elegir los talentos de su árbol. La alomancia de atium no necesita esta meta.',
      },
    ],
    talentos: [
      {
        name: 'Investido', // L.136 / PDF 142
        cost: 'passive',
        prereq: 'talento principal Ruptura de brumoso',
        description: DESC_INVESTIDO,
      },
      {
        name: 'Portentoso', // L.136 / PDF 142
        cost: 'passive',
        prereq: 'talento Investido',
        description:
          'Tu potencia bruta y tu eficiencia al quemar metal superan las de la mayoría de los alomantes: para determinar el alcance ' +
          'de artes metálicas de tus poderes alománticos cuentas con un grado adicional en Alomancia. Además, mantener el efecto de ' +
          'un poder alomántico te cuesta 1 punto menos de Investidura (mínimo 1).',
      },
      {
        name: 'Quemar instintivamente', // L.136 / PDF 142
        cost: 'special',
        prereq: 'Alomancia 3 o más; talento principal Ruptura de brumoso',
        description: DESC_QUEMAR_INSTINTIVAMENTE,
      },
      {
        name: 'Savantismo alomántico', // L.136 / PDF 142
        cost: 'special',
        prereq: 'Alomancia 5 o más; talento Portentoso',
        description:
          'Al avivar tu metal de forma constante durante periodos prolongados has alterado tu fisiología. Obtienes la meta «Convertirse ' +
          'en sabio» para el poder de tu talento principal Ruptura de brumoso: avanzas en ella una vez tras pasar al menos 7 días ' +
          'quemando el metal de forma casi constante, y solo una vez por sesión (a discreción de la DJ, dos veces si avivas el metal ' +
          'cada vez que usas el poder, gastando casi toda tu Investidura). Al completarla, cuando gastas Investidura en ese poder o en ' +
          'sus talentos puedes amplificar el efecto como si hubieras gastado 2 puntos de Investidura adicionales, sin contar tu límite ' +
          'de artes metálicas; y con 0 puntos de Investidura, o Desprovisto de ese poder, sufres síntomas de abstinencia que defines ' +
          'con la DJ según tu metal.',
      },
      {
        name: 'Trazas de metal', // L.136 / PDF 142
        cost: 'passive',
        prereq: 'Alomancia 3 o más; talento Investido',
        description: DESC_TRAZAS_DE_METAL,
      },
    ],
    color: '#6987b1', // [inferido] steel blue, the tone of the metal of its emblematic power (acero, `METALES`); the book colours no path (PDF 133-165)
    icon: 'Flame', // [inferido → Q18]: no official icon for the path in the book (PDF 133-165, verificado en imagen)
  },

  // ─────────────────────────────────────────────────────────────
  // NACIDO DE LA BRUMA — main talent L.141 / PDF 147, tree L.142 / PDF 148, diagram L.143 / PDF 149
  // ─────────────────────────────────────────────────────────────
  {
    id: 'nacido-de-la-bruma',
    name: 'Nacido de la bruma',
    // L.138 / PDF 144; table L.19 / PDF 25
    definition:
      'El nacido del metal más icónico y temido de Scadrial: quema todos los metales y combina todos los poderes alománticos para ' +
      'lograr efectos que ni el mejor brumoso puede imitar, y con atium es casi imparable. Exige manejar muchos poderes, viales y la ' +
      'Investidura a la vez: solo se recomienda a jugadores experimentados.',
    eras: ['era1'], // L.138 / PDF 144: no new ones are born in Era 2
    soloExperimentados: true, // L.19 / PDF 25; L.140 / PDF 146
    ascendenciasPermitidas: ['Humano'], // L.141 / PDF 147
    habilidadInicial: null, // L.141 / PDF 147: «Habilidad inicial: ninguna… no obtienes ningún grado gratuito»
    mainTalent: 'Ruptura de nacido de la bruma',
    mainTalentPrerequisites: 'ascendencia humana; no tener ningún otro talento de ruptura o herencia',
    mainTalentActivation: 'special',
    mainTalentRolDescription:
      'Sufres la ruptura y obtienes todos los poderes alománticos. Al principio solo manejas versiones rudimentarias de ellos, quizá ' +
      'sin ser consciente de ello, pero con entrenamiento y práctica llegarás a dominarlos todos.',
    mainTalentEffect:
      'Obtienes acceso a la Investidura, con un máximo de 2 + tu Discernimiento o tu Presencia (el mayor), y puedes usar la acción ' +
      'Beber vial. Añades la habilidad Alomancia (Voluntad) con 1 grado inicial. Obtienes todos los poderes alománticos disponibles ' +
      'en tu era: por ahora solo sus versiones nacientes (la alomancia de atium se usa completa). Eliges una pareja de metales ' +
      'Empujón/Tirón y obtienes la meta «Entrenar tus poderes» para esos dos poderes: al completarla desbloqueas la versión completa ' +
      'de ambos y puedes elegir los talentos de sus árboles. A discreción de la DJ, podrás obtener esa meta para otra pareja, y así ' +
      'sucesivamente hasta desbloquear todo tu potencial.',
    habilidadesInvestidas: [{ nombre: 'Alomancia', grados: 1 }],
    poderes: { alomancia: 'todos', feruquimia: 0 },
    seleccionMeta: 'pareja',
    concedeInvestidura: true,
    metasIniciales: [
      {
        arte: 'alomancia',
        titulo: 'Entrenar tus poderes', // L.141 / PDF 147
        descripcion:
          'Entrenas a la vez los dos poderes de la pareja Empujón/Tirón que has elegido: experimenta con ellos y practica siempre ' +
          'que puedas. Con un mentor, o con un compañero que tenga el mismo poder, avanzas el doble de rápido. Al completarla ' +
          'desbloqueas la versión completa de ambos poderes y puedes elegir los talentos de sus árboles. A discreción de la DJ, ' +
          'podrás obtener esta meta para otra pareja, y así sucesivamente.',
      },
    ],
    talentos: [
      {
        name: 'Investido', // L.142 / PDF 148
        cost: 'passive',
        prereq: 'talento principal Ruptura de nacido de la bruma',
        description: DESC_INVESTIDO,
      },
      {
        name: 'Mezcla metálica', // L.142 / PDF 148
        cost: 'special',
        prereq: 'talento principal Ruptura de nacido de la bruma',
        description:
          'Quemar varios metales a la vez es natural para ti: entrelazas sus usos y potencias uno con el toque de los demás. Al ' +
          'llevar a cabo una prueba para usar un poder alomántico, puedes gastar una Oportunidad para activar las versiones nacientes ' +
          'de otros dos poderes cuyo metal tengas disponible, sin gastar Investidura y sin necesitar ninguna acción.',
        notaLibro:
          'El diagrama (L.143 / PDF 149) resume el efecto como «usar también otro poder naciente» (uno); la entrada (L.142 / PDF 148) ' +
          'dice «otros dos poderes para los que tengas metal disponible». Se sigue la entrada del talento.',
      },
      {
        name: 'Quemar instintivamente', // L.142 / PDF 148
        cost: 'special',
        prereq: 'Alomancia 3 o más; talento Mezcla metálica',
        description: DESC_QUEMAR_INSTINTIVAMENTE,
      },
      {
        name: 'Quemar selectivamente', // L.142 / PDF 148
        cost: 'special',
        prereq: 'Alomancia 3 o más; talento Mezcla metálica',
        description:
          'Sientes que cada metal que consumes genera su propia reserva de poder, y puedes quemar uno guardando los demás para ' +
          'después. Antes de gastar Investidura en un poder alomántico, puedes optar por quedar Desprovisto de ese poder en lugar de ' +
          'pagar el coste de Investidura; si lo haces, el poder surte el mismo efecto que si hubieras gastado una cantidad de ' +
          'Investidura igual a tu límite de artes metálicas.',
      },
      {
        name: 'Quemar simultáneamente', // L.142 / PDF 148
        cost: 'free',
        prereq: 'Alomancia 4 o más; talento Quemar instintivamente',
        description:
          'Tienes tanta práctica quemando metales que puedes hacerlo mientras te encargas de otras tareas. Gasta 2 puntos de ' +
          'concentración para obtener 2 acciones que solo puedes usar para activar tus poderes alománticos.',
      },
      {
        name: 'Trazas de metal', // L.142 / PDF 148
        cost: 'passive',
        prereq: 'Alomancia 3 o más; talento Investido',
        description: DESC_TRAZAS_DE_METAL,
      },
    ],
    color: '#8f86c9', // [inferido] mist violet (the mists, the cloak of mists of the book's art); the book colours no path (PDF 133-165)
    icon: 'CloudFog', // [inferido → Q18]: no official icon for the path in the book (PDF 133-165, verificado en imagen)
  },

  // ─────────────────────────────────────────────────────────────
  // FERUQUIMISTA — main talent and tree L.146 / PDF 152, diagram L.147 / PDF 153
  // ─────────────────────────────────────────────────────────────
  {
    id: 'feruquimista',
    name: 'Feruquimista',
    // L.144 / PDF 150; table L.19 / PDF 25
    definition:
      'El feruquimista completo de la Era 1, heredero de la tradición terrisana de los guardadores: almacena rasgos y los decanta más ' +
      'tarde con las mentes de metal de todos los metales feruquímicos, lo que le da una gran flexibilidad. Exige llevar la cuenta de ' +
      'cada mente y de sus cargas: solo se recomienda a jugadores experimentados.',
    eras: ['era1'], // L.144 / PDF 150: very few remain in Era 2, when the ferrin appear
    soloExperimentados: true, // L.19 / PDF 25; L.145 / PDF 151
    ascendenciasPermitidas: ['Humano'], // L.146 / PDF 152
    habilidadInicial: null, // L.145 / PDF 151: «Habilidad inicial: ninguna… no obtienes ningún grado en habilidad gratuito»
    mainTalent: 'Herencia feruquímica', // with a tilde, L.146 / PDF 152; the book never calls it «Herencia feruquimista»
    mainTalentPrerequisites: 'ascendencia humana; no tener ningún otro talento de ruptura o herencia',
    mainTalentActivation: 'special',
    mainTalentRolDescription:
      'Descubres tu herencia feruquímica y obtienes todos los poderes de este arte. Al principio tus capacidades son rudimentarias y ' +
      'dependen de los metales que tengas a mano; cuando hayas fabricado tus propias mentes de metal desbloquearás todo tu potencial.',
    mainTalentEffect:
      'Añades la habilidad Feruquimia (Intelecto) con 1 grado inicial. Obtienes todos los poderes feruquímicos disponibles en tu era: ' +
      'por ahora solo sus versiones nacientes. Cuando tengas mentes de metal, podrás llevar puestas a la vez tantas como tu valor de ' +
      'Intelecto (mínimo 1). Eliges un metal puro y su aleación, o bien el atium, y obtienes la meta «Fabricar tus mentes de metal» ' +
      'para esos poderes: al completarla obtienes una mente de metal para cada uno, desbloqueas la versión completa de sus poderes y ' +
      'puedes elegir los talentos de sus árboles. A discreción de la DJ, podrás obtener esa meta para otra pareja (o para el atium), ' +
      'y así sucesivamente hasta desbloquear todos tus poderes.',
    habilidadesInvestidas: [{ nombre: 'Feruquimia', grados: 1 }],
    poderes: { alomancia: 0, feruquimia: 'todos' },
    seleccionMeta: 'puro-aleacion-o-atium',
    concedeInvestidura: false,
    metasIniciales: [
      {
        arte: 'feruquimia',
        titulo: 'Fabricar tus mentes de metal', // L.146 / PDF 152
        descripcion:
          'Para el metal puro y su aleación que has elegido (o para el atium): prueba tu poder naciente en distintos fragmentos del ' +
          'metal y reúne poco a poco el metal adecuado y puro. Con la ayuda de otro feruquimista, o con metales purificados de una ' +
          'fuente experta, avanzas el doble de rápido. Al completarla obtienes una mente de metal para cada poder (gratis la primera ' +
          'vez que la completas para cada poder), desbloqueas su versión completa y puedes elegir los talentos de sus árboles. A ' +
          'discreción de la DJ, podrás obtener esta meta para otra pareja (o para el atium), y así sucesivamente.',
      },
    ],
    talentos: [
      {
        name: 'Almacenamiento rápido', // L.146 / PDF 152
        cost: 'passive',
        prereq: 'Feruquimia 2 o más; talento principal Herencia feruquímica',
        description: DESC_ALMACENAMIENTO_RAPIDO,
      },
      {
        name: 'Ancho de banda mental', // L.146 / PDF 152
        cost: 'passive',
        prereq: 'Feruquimia 3 o más; talento Mentes de metal ampliadas',
        description:
          'Tienes mucha práctica gestionando varias mentes de metal a la vez: puedes llevar puestas simultáneamente tantas mentes de ' +
          'metal como indique tu modificador de Feruquimia, en lugar de tu valor de Intelecto.',
      },
      {
        name: 'Decantación instintiva', // L.146 / PDF 152
        cost: 'special',
        prereq: 'Feruquimia 3 o más; talento Almacenamiento rápido',
        description: DESC_DECANTACION_INSTINTIVA,
      },
      {
        name: 'Decantación rápida', // L.146 / PDF 152
        cost: 'free',
        prereq: 'Feruquimia 4 o más; talento Decantación instintiva',
        description:
          'Tienes tanta práctica decantando tus mentes de metal que puedes hacerlo mientras te encargas de otras tareas. Gasta 2 puntos ' +
          'de concentración para obtener 1 acción que solo puedes usar para activar tus poderes feruquímicos que consumen cargas.',
      },
      {
        name: 'Mente de metal integrada', // L.146 / PDF 152
        cost: 'special',
        prereq: 'Feruquimia 4 o más; talento Mentes de metal ampliadas',
        description: DESC_MENTE_DE_METAL_INTEGRADA,
      },
      {
        name: 'Mentes de metal ampliadas', // L.146 / PDF 152
        cost: 'passive',
        prereq: 'talento principal Herencia feruquímica',
        description: DESC_MENTES_DE_METAL_AMPLIADAS,
      },
    ],
    color: '#b2623b', // [inferido] copper, the metal of the guardadores' mentes de metal (cobre, `METALES`); the book colours no path (PDF 133-165)
    icon: 'Container', // [inferido → Q18]: no official icon for the path in the book (PDF 133-165, verificado en imagen)
    notaLibro:
      'La entrada (L.146 / PDF 152) escribe el prerrequisito como «ruptura o de herencia»; el diagrama (L.147 / PDF 153) y los otros ' +
      'cuatro caminos lo ponen como «ruptura o herencia». Se usa la forma común de los demás caminos.',
  },

  // ─────────────────────────────────────────────────────────────
  // FERRIN — main talent and tree L.150 / PDF 156, diagram L.151 / PDF 157
  // ─────────────────────────────────────────────────────────────
  {
    id: 'ferrin',
    name: 'Ferrin',
    // L.148 / PDF 154; table L.19 / PDF 25
    definition:
      'Descendiente de los feruquimistas de la Era 1: domina un único poder feruquímico y almacena y decanta un rasgo concreto (la ' +
      'fuerza, el desvelo…) en una mente de metal fabricada con el metal correspondiente. Aparece tras el Catacendro, cuando la ' +
      'feruquimia se extiende fuera de los enclaves terrisanos.',
    eras: ['era2'], // L.148 / PDF 154
    soloExperimentados: false,
    ascendenciasPermitidas: ['Humano', 'Sangre koloss'], // L.150 / PDF 156
    habilidadInicial: 'Feruquimia', // L.150 / PDF 156: one free degree on top of the one from Herencia ferrin
    mainTalent: 'Herencia ferrin',
    mainTalentPrerequisites: 'ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia',
    mainTalentActivation: 'special',
    mainTalentRolDescription:
      'Descubres tu herencia feruquímica y obtienes un poder. Al principio solo puedes usarlo de forma rudimentaria con el metal que ' +
      'tengas a mano; cuando fabriques una mente de metal adecuada, desbloquearás todo tu potencial.',
    mainTalentEffect:
      'Añades la habilidad Feruquimia (Intelecto) con 1 grado inicial. Eliges un poder feruquímico disponible en tu era: por ahora ' +
      'solo puedes usar su versión naciente. Obtienes la meta de nacido del metal «Fabricar tu mente de metal»: al completarla ' +
      'obtienes una mente de metal, desbloqueas la versión completa de tu poder y puedes elegir los talentos de su árbol.',
    habilidadesInvestidas: [{ nombre: 'Feruquimia', grados: 1 }],
    poderes: { alomancia: 0, feruquimia: 1 },
    seleccionMeta: 'uno',
    concedeInvestidura: false,
    metasIniciales: [
      {
        arte: 'feruquimia',
        titulo: 'Fabricar tu mente de metal', // L.132-133 / PDF 138-139; L.150 / PDF 156
        descripcion:
          'Prueba tu poder naciente en distintos fragmentos de tu metal feruquímico y reúne poco a poco el metal adecuado y puro. Con ' +
          'la ayuda de otro feruquimista, o con metales purificados de una fuente experta, avanzas el doble de rápido. Al completarla ' +
          'obtienes una mente de metal (gratis la primera vez), desbloqueas la versión completa del poder y puedes elegir los ' +
          'talentos de su árbol.',
      },
    ],
    talentos: [
      {
        name: 'Almacenamiento rápido', // L.150 / PDF 156
        cost: 'passive',
        prereq: 'Feruquimia 2 o más; talento principal Herencia ferrin',
        description: DESC_ALMACENAMIENTO_RAPIDO,
      },
      {
        name: 'Decantación instintiva', // L.150 / PDF 156
        cost: 'special',
        prereq: 'Feruquimia 3 o más; talento Almacenamiento rápido',
        description: DESC_DECANTACION_INSTINTIVA,
      },
      {
        name: 'Mente de metal integrada', // L.150 / PDF 156
        cost: 'special',
        prereq: 'Feruquimia 4 o más; talento Mentes de metal ampliadas',
        description: DESC_MENTE_DE_METAL_INTEGRADA,
      },
      {
        name: 'Mentes de metal ampliadas', // L.150 / PDF 156
        cost: 'passive',
        prereq: 'talento principal Herencia ferrin',
        description: DESC_MENTES_DE_METAL_AMPLIADAS,
      },
      {
        name: 'Últimas reservas', // L.150 / PDF 156
        cost: 'special',
        prereq: 'Voluntad 4 o más; talento Mentes de metal ampliadas',
        description:
          'Reúnes con una concentración meticulosa los últimos vestigios de poder de una mente de metal casi agotada, lo bastante para ' +
          'una sola carga. Una vez por escena, si a la mente de metal vinculada al poder de tu Herencia ferrin no le quedan cargas, ' +
          'puedes gastar 3 puntos de concentración para usar ese poder como si hubieras gastado 1 carga.',
      },
    ],
    color: '#4f9d8a', // [inferido] verdigris: the oxidised-copper cousin of the feruquimista's copper; the book colours no path (PDF 133-165)
    icon: 'Package', // [inferido → Q18]: no official icon for the path in the book (PDF 133-165, verificado en imagen)
  },

  // ─────────────────────────────────────────────────────────────
  // NACIDOBLE — main talent L.155 / PDF 161, tree L.155-159 / PDF 161-165, diagram L.157 / PDF 163
  // ─────────────────────────────────────────────────────────────
  {
    id: 'nacidoble',
    name: 'Nacidoble',
    // L.152 / PDF 158; table L.19 / PDF 25
    definition:
      'El único nacido del metal que combina alomancia y feruquimia: un poder de cada arte, que no tienen por qué usar el mismo metal. ' +
      'La interacción entre ambos poderes genera resonancias, y el componedor, que usa el mismo metal en los dos, puede quemar ' +
      'fragmentos de su propia mente de metal para amplificar sus efectos.',
    eras: ['era2'], // L.152 / PDF 158
    soloExperimentados: false,
    ascendenciasPermitidas: ['Humano', 'Sangre koloss'], // L.155 / PDF 161
    habilidadInicial: 'Disciplina', // L.154 / PDF 160; L.19 / PDF 25: one free degree (a standard skill, not an Investida one)
    mainTalent: 'Herencia nacidoble',
    mainTalentPrerequisites: 'ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia',
    mainTalentActivation: 'special',
    mainTalentRolDescription:
      'Descubres tu linaje nacidoble, que te da un poder alomántico y otro feruquímico. Al principio solo puedes usar una versión ' +
      'rudimentaria de tus capacidades; tras entrenar y fabricar una mente de metal adecuada, podrás desbloquear todo su potencial.',
    mainTalentEffect:
      'Obtienes acceso a la Investidura, con un máximo de 2 + tu Discernimiento o tu Presencia (el mayor), y puedes usar la acción ' +
      'Beber vial. Añades las habilidades Alomancia (Voluntad) y Feruquimia (Intelecto), con 1 grado inicial en cada una. Eliges un ' +
      'poder alomántico y un poder feruquímico disponibles en tu era: por ahora solo sus versiones nacientes. Obtienes dos metas de ' +
      'nacido del metal: «Entrenar tu poder» (versión completa del poder alomántico y los talentos de su árbol) y «Fabricar tu mente ' +
      'de metal» (una mente de metal, versión completa del poder feruquímico y los talentos de su árbol).',
    habilidadesInvestidas: [
      { nombre: 'Alomancia', grados: 1 },
      { nombre: 'Feruquimia', grados: 1 },
    ],
    poderes: { alomancia: 1, feruquimia: 1 },
    seleccionMeta: 'uno-por-arte',
    concedeInvestidura: true,
    metasIniciales: [
      {
        arte: 'alomancia',
        titulo: 'Entrenar tu poder', // L.155 / PDF 161
        descripcion:
          'Experimenta con tu poder alomántico naciente de formas creativas o practica con él siempre que puedas. Con un mentor, o ' +
          'con un compañero que tenga el mismo poder, avanzas el doble de rápido. Al completarla desbloqueas la versión completa del ' +
          'poder alomántico y puedes elegir los talentos de su árbol.',
      },
      {
        arte: 'feruquimia',
        titulo: 'Fabricar tu mente de metal', // L.155 / PDF 161
        descripcion:
          'Prueba tu poder feruquímico naciente en distintos fragmentos de su metal y reúne poco a poco el metal adecuado y puro. Con ' +
          'la ayuda de otro feruquimista, o con metales purificados de una fuente experta, avanzas el doble de rápido. Al completarla ' +
          'obtienes una mente de metal (gratis la primera vez), desbloqueas la versión completa del poder feruquímico y puedes elegir ' +
          'los talentos de su árbol.',
      },
    ],
    talentos: [
      {
        name: 'Almacenamiento rápido', // L.155 / PDF 161
        cost: 'passive',
        prereq: 'Feruquimia 2 o más; talento principal Herencia nacidoble',
        description: DESC_ALMACENAMIENTO_RAPIDO,
      },
      {
        name: 'Componedor', // L.155 / PDF 161
        cost: 'action1',
        prereq:
          'Alomancia 3 o más; Feruquimia 3 o más; los poderes de tu talento Herencia nacidoble utilizan el mismo metal; ' +
          'talento Mentes de metal ampliadas o Investido',
        description:
          'Puedes usar la acción Beber vial para consumir un fragmento de la mente de metal obtenida con tu Herencia nacidoble. Al ' +
          'hacerlo: recuperas Investidura hasta tu máximo, como es habitual en esa acción; las cargas máximas de esa mente se reducen ' +
          'permanentemente en 1; y, hasta que termine la escena o quedes Desprovisto del poder de esa mente, puedes alimentar la ' +
          'capacidad feruquímica gastando Investidura como si fueran cargas. Para ello debes haber extraído antes un fragmento de la ' +
          'mente (con 1 acción) y haberlo puesto en un vial, o tenerlo ya dentro del cuerpo (ingerido o mediante el talento Mente de ' +
          'metal integrada). Además, puedes renunciar a los beneficios de un descanso largo para reparar una mente cuyas cargas máximas ' +
          'se hayan reducido así, si tienes acceso al metal necesario (según la DJ): con metales comunes, o raros de los que tengas ' +
          'suministro recurrente, recupera su capacidad normal; con otros metales raros restauras 2 cargas por cada medio kilo de metal.',
        notaLibro:
          'El diagrama (L.157 / PDF 163) abrevia la condición como «tus dos poderes utilizan el mismo metal» y omite «talento Mentes ' +
          'de metal ampliadas o Investido», que muestran sus flechas en la entrada. Se sigue la entrada del talento.',
      },
      {
        name: 'Composición recursiva', // L.155 / PDF 161
        cost: 'action1',
        prereq: 'Alomancia 4 o más, Feruquimia 4 o más; talento Componedor',
        description:
          'Quemar un fragmento de tu mente de metal inunda tu cuerpo con el poder que sueles almacenar y te permite devolver parte de ' +
          'esa energía a la propia mente, creando un bucle de retroalimentación. Bajo los efectos del talento Componedor, puedes gastar ' +
          '1 o más puntos de Investidura para añadir esa misma cantidad de cargas a tu mente de metal.',
      },
      {
        name: 'Decantación instintiva', // L.156 / PDF 162
        cost: 'special',
        prereq: 'Feruquimia 3 o más; talento Almacenamiento rápido',
        description: DESC_DECANTACION_INSTINTIVA,
      },
      {
        name: 'Investido', // L.156 / PDF 162
        cost: 'passive',
        prereq: 'talento principal Herencia nacidoble',
        description: DESC_INVESTIDO,
      },
      {
        name: 'Mente de metal integrada', // L.156 / PDF 162
        cost: 'special',
        prereq: 'Feruquimia 4 o más; talento Mentes de metal ampliadas',
        description: DESC_MENTE_DE_METAL_INTEGRADA,
      },
      {
        name: 'Mentes de metal ampliadas', // L.158 / PDF 164
        cost: 'passive',
        prereq: 'talento principal Herencia nacidoble',
        description: DESC_MENTES_DE_METAL_AMPLIADAS,
      },
      {
        name: 'Quemar instintivamente', // L.158 / PDF 164
        cost: 'special',
        prereq: 'Alomancia 3 o más; talento principal Herencia nacidoble',
        description: DESC_QUEMAR_INSTINTIVAMENTE,
      },
      {
        name: 'Resonancia aleada', // L.159 / PDF 165
        cost: 'special',
        prereq:
          'los poderes de tu talento Herencia nacidoble utilizan metales distintos; talento Mentes de metal ampliadas o Investido',
        description:
          'La interacción entre tus dos Artes Investidas genera una resonancia única que te permite potenciar un poder con el otro. ' +
          'Al llevar a cabo una prueba para usar un poder alomántico, puedes gastar 1 carga de mente de metal para obtener ventaja en ' +
          'ella; y al hacer una prueba para usar un poder feruquímico, puedes gastar 1 punto de Investidura para obtener ventaja. ' +
          'Cuando lo haces, tu otra arte metálica puede ampliar y mejorar el poder de formas creativas: define con la DJ qué ' +
          'sinergias crean tus poderes.',
        notaLibro:
          'El diagrama (L.157 / PDF 163) abrevia la condición como «tus dos poderes utilizan metales distintos» y omite «talento ' +
          'Mentes de metal ampliadas o Investido», que muestran sus flechas en la entrada. Se sigue la entrada del talento.',
      },
      {
        name: 'Sinergia metálica', // L.159 / PDF 165
        cost: 'free',
        prereq: 'Alomancia 3 o más; Feruquimia 3 o más; talento Resonancia aleada',
        description:
          'Has practicado tanto con la resonancia de tus dos poderes que canalizarlos es natural: maximizas ambas artes sin invertir ' +
          'tiempo ni concentración adicionales. Tras usar Resonancia aleada obtienes también los beneficios del otro poder de tu ' +
          'Herencia nacidoble: si gastaste 1 o más puntos de Investidura para potenciar tu poder feruquímico, obtienes también los ' +
          'efectos del poder alomántico, como si hubieras quemado ese metal con esa Investidura; si gastaste 1 o más cargas de mente ' +
          'de metal para potenciar tu poder alomántico, obtienes también los efectos del poder feruquímico, como si hubieras ' +
          'decantado la mente con esas cargas.',
        notaLibro:
          'La entrada habla de «Resonancia de aleación» (L.159 / PDF 165), pero el talento se llama Resonancia aleada, como aparece en el ' +
          'diagrama (L.157 / PDF 163).',
      },
      {
        name: 'Trazas de metal', // L.159 / PDF 165
        cost: 'passive',
        prereq: 'Alomancia 3 o más; talento Investido',
        description: DESC_TRAZAS_DE_METAL,
      },
    ],
    color: '#a86fa0', // [inferido] plum: between the steel blue of alomancia and the copper of feruquimia; the book colours no path (PDF 133-165)
    icon: 'Merge', // [inferido → Q18]: no official icon for the path in the book (PDF 133-165, verificado en imagen)
  },
]

const POR_ID = Object.fromEntries(CAMINOS_NACIDOS_DEL_METAL.map((c) => [c.id, c])) as Record<CaminoMetalId, CaminoNacidoDelMetal>

export const getCaminoNacidoDelMetal = (id: CaminoMetalId): CaminoNacidoDelMetal => POR_ID[id]
