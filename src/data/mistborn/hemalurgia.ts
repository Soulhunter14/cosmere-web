/**
 * Hemalurgia of Nacidos de la bruma: the third metallic art, which steals a trait from a victim with a metal spike («clavo») and grants
 * it to whoever wears it (L.251 / PDF 257; L.161 / PDF 167). ENCYCLOPEDIA TEXT ONLY in v1 (§3 o, §8): hemalurgy is not a character art
 * (`ArteMetal` is alomancia | feruquimia) and the book has no hemalurgist path; player characters can only get spikes that already exist,
 * as a reward of the DJ (L.128 / PDF 134; L.288 / PDF 294). Implanting spikes on the sheet (column `Clavos`, Defensa espiritual, attribute
 * bonuses) belongs to F7: T49a on the server and T49b on the web, which reads `TIPOS_CLAVO`.
 *
 * Sources: «Hemalurgia» of chapter 6 (L.251 / PDF 257) and «Clavos hemalúrgicos» of chapter 8 (L.288-292 / PDF 294-298).
 * Texts are short paraphrases of the book, not quotations.
 * Light module: it imports nothing but types, so it may travel anywhere (§8, risk 6).
 */
import type { ArteMetal, CategoriaAlomancia, CategoriaFeruquimia, MetalId } from './metales'

/** A power a spike can grant, as the server stores it (`PoderPersonaje`, `ClavoHemalurgico.PoderElegido`): `${arte}:${metal}` (§2) */
export type OpcionPoderClavo = `${ArteMetal}:${MetalId}`

interface TipoClavoBase {
  /** Metal of the spike (ASCII id, P7). There is exactly one type per metal, so it is also the id of the type */
  metal: MetalId
  /**
   * Reward rank of the FIRST spike of this metal («Rango de PJ» of the table, L.291 / PDF 297; reward table L.288 / PDF 294). Every spike
   * of the same metal already owned adds 1 to the reward rank of the next one (L.288 / PDF 294)
   */
  rango: 2 | 3
  /** What the spike steals, as printed in the «Efecto» column: «Fortaleza emocional», «Poder alomántico físico»… */
  roba: string
  /** What it gives, in a few words */
  efecto: string
  notaLibro?: string
}

/** Rank 2: the spike raises an attribute by 1 and grants no power (L.291 / PDF 297). Spikes of the same metal stack (L.288 / PDF 294) */
export interface TipoClavoAtributo extends TipoClavoBase {
  tipo: 'atributo'
  /** Character field of the attribute it raises (a subset of `AttrField`, src/worlds/types.ts) */
  atributo: 'fuerza' | 'intelecto' | 'voluntad' | 'discernimiento'
  /** Code of that attribute, as in `HabilidadDef.codigo` */
  codigo: 'FUE' | 'INT' | 'VOL' | 'DIS'
  /** Bonus per spike */
  bono: 1
}

/**
 * Rank 3: the spike grants ONE power of its group, chosen among four (L.291 / PDF 297). The metal of the spike is not the metal of the
 * power: an acero spike grants a physical alomancy, to pick among hierro, peltre, acero and estaño.
 */
export interface TipoClavoPoder extends TipoClavoBase {
  tipo: 'poder'
  arte: ArteMetal
  /** Group of the art the spike grants: `CategoriaAlomancia` when `arte` is alomancia, `CategoriaFeruquimia` when it is feruquimia */
  categoria: CategoriaAlomancia | CategoriaFeruquimia
  /** The four powers to choose from, in the order printed in the book; the chosen one is `ClavoHemalurgico.PoderElegido` (T49a) */
  opciones: [OpcionPoderClavo, OpcionPoderClavo, OpcionPoderClavo, OpcionPoderClavo]
}

export type TipoClavo = TipoClavoAtributo | TipoClavoPoder

/**
 * «Efectos conocidos de los clavos hemalúrgicos» (L.291 / PDF 297), in the order of the table: the four attribute spikes (rank 2) and then
 * the eight power spikes (rank 3), each group alphabetical as printed. Read from the page image, not from the text layer (verificado en
 * imagen, PDF 297): the rank column is a merged cell that the text layer scatters between the rows.
 * The reward table of L.288 / PDF 294 lists the same twelve metals by rank. There is no spike of atium nor of any divine metal: neither
 * table lists one (verificado en imagen, PDF 294 and 297).
 */
export const TIPOS_CLAVO: TipoClavo[] = [
  // Rank 2, attributes (L.291 / PDF 297; reward rank L.288 / PDF 294)
  {
    metal: 'cinc', rango: 2, tipo: 'atributo', roba: 'Fortaleza emocional', efecto: 'Voluntad +1',
    atributo: 'voluntad', codigo: 'VOL', bono: 1,
  },
  {
    metal: 'cobre', rango: 2, tipo: 'atributo', roba: 'Fortaleza mental', efecto: 'Intelecto +1',
    atributo: 'intelecto', codigo: 'INT', bono: 1,
  },
  {
    metal: 'estano', rango: 2, tipo: 'atributo', roba: 'Sentidos agudizados', efecto: 'Discernimiento +1',
    atributo: 'discernimiento', codigo: 'DIS', bono: 1,
  },
  {
    metal: 'hierro', rango: 2, tipo: 'atributo', roba: 'Fuerza', efecto: 'Fuerza +1',
    atributo: 'fuerza', codigo: 'FUE', bono: 1,
  },
  // Rank 3, one power of four (L.291 / PDF 297; reward rank L.288 / PDF 294)
  {
    metal: 'acero', rango: 3, tipo: 'poder', roba: 'Poder alomántico físico',
    efecto: 'A elegir: alomancia de hierro, peltre, acero o estaño',
    arte: 'alomancia', categoria: 'fisico', opciones: ['alomancia:hierro', 'alomancia:peltre', 'alomancia:acero', 'alomancia:estano'],
  },
  {
    metal: 'bendaleo', rango: 3, tipo: 'poder', roba: 'Poder feruquímico espiritual',
    efecto: 'A elegir: feruquimia de aluminio, cromo, duraluminio o nicrosil',
    arte: 'feruquimia', categoria: 'espiritual',
    opciones: ['feruquimia:aluminio', 'feruquimia:cromo', 'feruquimia:duraluminio', 'feruquimia:nicrosil'],
    notaLibro:
      'El clavo de bendaleo ofrece feruquimia de nicrosil (L.291 / PDF 297), pero la tabla de medallones feruquímicos marca el nicrosil como no disponible para personajes jugadores (L.294 / PDF 300). Se incluyen ambas opciones tal como aparecen en el libro.',
  },
  {
    metal: 'bronce', rango: 3, tipo: 'poder', roba: 'Poder alomántico mental',
    efecto: 'A elegir: alomancia de latón, bronce, cobre o cinc',
    arte: 'alomancia', categoria: 'mental', opciones: ['alomancia:laton', 'alomancia:bronce', 'alomancia:cobre', 'alomancia:cinc'],
  },
  {
    metal: 'cadmio', rango: 3, tipo: 'poder', roba: 'Poder alomántico temporal',
    efecto: 'A elegir: alomancia de bendaleo, cadmio, electro u oro',
    arte: 'alomancia', categoria: 'temporal', opciones: ['alomancia:bendaleo', 'alomancia:cadmio', 'alomancia:electro', 'alomancia:oro'],
  },
  {
    metal: 'electro', rango: 3, tipo: 'poder', roba: 'Poder alomántico de mejora',
    efecto: 'A elegir: alomancia de aluminio, cromo, duraluminio o nicrosil',
    arte: 'alomancia', categoria: 'mejora',
    opciones: ['alomancia:aluminio', 'alomancia:cromo', 'alomancia:duraluminio', 'alomancia:nicrosil'],
  },
  {
    metal: 'laton', rango: 3, tipo: 'poder', roba: 'Poder feruquímico cognitivo',
    efecto: 'A elegir: feruquimia de latón, bronce, cobre o cinc',
    arte: 'feruquimia', categoria: 'cognitivo',
    opciones: ['feruquimia:laton', 'feruquimia:bronce', 'feruquimia:cobre', 'feruquimia:cinc'],
  },
  {
    metal: 'oro', rango: 3, tipo: 'poder', roba: 'Poder feruquímico híbrido',
    efecto: 'A elegir: feruquimia de bendaleo, cadmio, electro u oro',
    arte: 'feruquimia', categoria: 'hibrido',
    opciones: ['feruquimia:bendaleo', 'feruquimia:cadmio', 'feruquimia:electro', 'feruquimia:oro'],
  },
  {
    metal: 'peltre', rango: 3, tipo: 'poder', roba: 'Poder feruquímico físico',
    efecto: 'A elegir: feruquimia de hierro, peltre, acero o estaño',
    arte: 'feruquimia', categoria: 'fisico',
    opciones: ['feruquimia:hierro', 'feruquimia:peltre', 'feruquimia:acero', 'feruquimia:estano'],
  },
]

/** One rule of the encyclopedia section «Hemalurgia», in reading order */
export interface ReglaHemalurgia {
  /** Stable id (ASCII, kebab-case) */
  id: string
  /** Heading; the two actions carry their cost, as in the book («Implantar clavo (3 acciones)») */
  titulo: string
  /** Paraphrase of the rule, in own words */
  texto: string
  /** Page(s) of the book: «L.<libro> / PDF <pdf>» (PDF = L. + 6) */
  cita: string
  /** Gap or inference about the rule */
  notaLibro?: string
}

/**
 * Rules of the hemalurgy section, in reading order: what it is (L.251 / PDF 257) and «Clavos hemalúrgicos» (L.288-292 / PDF 294-298).
 * The numbers are inside the texts and nothing here computes them (the server applies them in T49a): implanting is 3 actions, Medicina
 * CD 20; extracting is 1 action, Medicina CD 10; a character wears at most min(rango, 3) spikes; the first spike of a metal lowers
 * Defensa espiritual by 2 and each further one of that metal by 5; Desorientado with Defensa espiritual 9 or less.
 */
export const REGLAS_HEMALURGIA: ReglaHemalurgia[] = [
  {
    id: 'que-es',
    titulo: 'Qué es la hemalurgia',
    texto:
      'Tercer arte metálico de Scadrial y el más siniestro: un clavo de metal transfiere un rasgo de una persona a otra. Puede ' +
      'trasladar atributos físicos y mentales y también poderes alománticos y feruquímicos. Cargar el clavo obliga a atravesar a quien ' +
      'posee el rasgo, y todos los métodos conocidos acaban con su vida. Quien recibe un clavo cargado gana el rasgo robado, pero el ' +
      'clavo perturba su redespíritu (la red de conexiones que forma su alma): puede abrir un canal de influencia con una Esquirla ' +
      '(Ruina o Armonía), y llevar demasiados clavos sin apoyo daña gravemente la redespíritu y puede matar.',
    cita: 'L.251 / PDF 257; L.161 / PDF 167',
  },
  {
    id: 'no-es-un-camino',
    titulo: 'No es un camino de nacido del metal',
    texto:
      'Crear clavos, y otros instrumentos hemalúrgicos como las chavetas de los inquisidores de acero, está al alcance de poquísimos ' +
      'expertos y mata a la víctima, así que el libro no ofrece un camino de hemalurgo. Los clavos llegan como recompensa: un personaje ' +
      'jugador no puede crearlos, solo usar clavos que ya existen. «Hemalurgo» se aplica a cualquiera que use clavos para obtener poder. ' +
      'El contenido futuro del juego podría añadir reglas para crearlos.',
    cita: 'L.251 / PDF 257; L.128 / PDF 134; L.288 / PDF 294',
  },
  {
    id: 'recompensas',
    titulo: 'Recompensas por rango',
    texto:
      'El rango del personaje limita lo que puede recibir: en el rango 1, la pericia especializada Hemalurgo; en el rango 2, un clavo de ' +
      'cobre, hierro, estaño o cinc; en el rango 3, un clavo de bendaleo, latón, bronce, cadmio, electro, oro, peltre o acero. La DJ ' +
      'también puede conceder un clavo por otras vías, como quitárselo a un enemigo en combate o dejar tiempo tras la pelea para ' +
      'recuperar uno intacto.',
    cita: 'L.288 / PDF 294',
  },
  {
    id: 'clavos-del-mismo-metal',
    titulo: 'Clavos del mismo metal',
    texto:
      'Se pueden reunir varios clavos de un mismo metal, pero cada uno que ya poseas suma 1 al rango de recompensa de los siguientes de ' +
      'ese metal (un tercer clavo de hierro cuenta como rango 4). Mientras estén implantados, sus efectos se acumulan: dos clavos de ' +
      'hierro dan Fuerza +2. Cada clavo adicional también reduce la Defensa espiritual.',
    cita: 'L.288-289 / PDF 294-295',
  },
  {
    id: 'pericia-hemalurgo',
    titulo: 'Pericia Hemalurgo',
    texto:
      'Pericia especializada que da la DJ o que se puede elegir como recompensa de rango 1. Quien la posee puede implantar clavos en ' +
      'sí mismo o en otros que lo acepten, extraerlos y tratar de quitárselos a un enemigo; conoce los puntos de anclaje de humanos, ' +
      'kandra y koloss, las aplicaciones de la mayoría de los metales y cómo guardar los clavos sin que pierdan poder. Habilita las ' +
      'acciones Implantar clavo y Extraer clavo.',
    cita: 'L.289 / PDF 295',
  },
  {
    id: 'descanso-o-escena',
    titulo: 'Implantar o extraer en descanso o en escena',
    texto:
      'Con un descanso corto o largo por delante, la pericia permite implantar o extraer clavos con calma y sin prueba, en uno mismo o ' +
      'en un voluntario. En plena escena, en cambio, hay que gastar las acciones Implantar clavo o Extraer clavo y superar la prueba ' +
      'de Medicina correspondiente.',
    cita: 'L.289 / PDF 295',
  },
  {
    id: 'limite-de-clavos',
    titulo: 'Límite de clavos',
    texto:
      'Un personaje jugador puede llevar tantos clavos implantados como su rango, hasta un máximo de 3. Si llegara a tener cuatro o más, ' +
      'por el motivo que sea, sucumbiría por completo a la influencia de una Esquirla y dejaría de ser personaje jugador: el jugador y ' +
      'la DJ acuerdan su destino y cómo entra su siguiente personaje.',
    cita: 'L.289 / PDF 295; L.291 / PDF 297',
  },
  {
    id: 'implantar-clavo',
    titulo: 'Implantar clavo (3 acciones)',
    texto:
      'Medicina CD 20. Sirve para fijar en el punto de anclaje adecuado un clavo de tu rango o menor, ya sea en ti o en un aliado que ' +
      'quiera recibirlo y al que alcances a tocar. Si superas la prueba, quien lo recibe gana los efectos del clavo; si fallas, sufre ' +
      '1d10 de daño vital y el clavo no se implanta.',
    cita: 'L.289 / PDF 295',
  },
  {
    id: 'extraer-clavo',
    titulo: 'Extraer clavo (1 acción)',
    texto:
      'Medicina CD 10. Sirve para soltar un clavo de su punto de anclaje, en tu cuerpo o en el de un aliado dispuesto al que toques. ' +
      'Si lo superas, el clavo sale y dejan de aplicarse sus efectos (podrá reutilizarse más adelante); si fallas, el objetivo recibe ' +
      '1d4 de daño vital y el clavo sigue puesto.',
    cita: 'L.290 / PDF 296',
  },
  {
    id: 'extraer-a-un-enemigo',
    titulo: 'Extraer el clavo a un enemigo',
    texto:
      'Con la pericia Hemalurgo se puede intentar arrebatar el clavo a un enemigo en pleno combate. Lo normal es una prueba de ' +
      'Atletismo contra su Defensa física, pero se admiten otros enfoques (por ejemplo, Hurto contra su Defensa cognitiva si el ' +
      'enemigo no se da cuenta). Los clavos son objetos Investidos y resisten los Tirones de hierro y los Empujones de acero. ' +
      'Según el caso, la DJ puede exigir antes retener al enemigo, rellenar un medidor de suceso «Extraer clavo» o derrotarlo. Con un ' +
      'momento de calma tras el combate, un clavo funcional e intacto de un cadáver reciente se saca con cuidado, sin prueba.',
    cita: 'L.290 / PDF 296; L.253 / PDF 259',
  },
  {
    id: 'poder-nuevo',
    titulo: 'Poder nuevo',
    texto:
      'Un clavo que concede un poder alomántico o feruquímico nuevo para su portador lo da en su versión completa, sin pasar por la ' +
      'meta de nacido del metal. Con él llegan la habilidad Alomancia o Feruquimia y, si el portador carecía de ella, un valor de ' +
      'Investidura; desde ese momento puede gastar sus subidas de nivel en talentos del árbol del poder y en grados de esa habilidad.',
    cita: 'L.290 / PDF 296',
    notaLibro:
      'El libro no especifica de dónde sale la mente de metal de un poder feruquímico obtenido por clavo (el clavo no cuenta como mente de ' +
      'metal, salvo que la DJ decida lo contrario, L.290 / PDF 296) ni menciona la meta «Fabricar tu mente de metal». Se deja a criterio de la ' +
      'DJ cómo se obtiene esa mente de metal [inferido: el libro guarda silencio sobre su origen; solo aclara que el clavo no la sustituye salvo decisión de la DJ].',
  },
  {
    id: 'poder-existente',
    titulo: 'Poder existente',
    texto:
      'Si el clavo concede un poder que el portador ya tiene, cuenta como un grado adicional en la habilidad correspondiente. Ese ' +
      'grado no cuenta para el máximo de grados, de ahí que la hemalurgia permita superar los 5 grados.',
    cita: 'L.290 / PDF 296; L.163 / PDF 169',
  },
  {
    id: 'no-es-mente-de-metal',
    titulo: 'No es una mente de metal',
    texto: 'Los clavos no sirven como mentes de metal, salvo que la DJ decida otra cosa.',
    cita: 'L.290 / PDF 296',
  },
  {
    id: 'perturbacion-de-la-redespiritu',
    titulo: 'Perturbación de la redespíritu',
    texto:
      'Cada clavo resta Defensa espiritual al portador: 2 puntos el primero de cada metal y 5 cada uno de los siguientes del mismo ' +
      'metal. Si al empezar una escena lleva algún clavo y su Defensa espiritual ha bajado a 9 o menos, comienza esa escena ' +
      'Desorientado y lo sigue estando hasta que termine.',
    cita: 'L.290 / PDF 296',
  },
  {
    id: 'quitar-un-clavo',
    titulo: 'Quitar un clavo',
    texto:
      'Si el portador pierde el clavo, por su voluntad o no, deja de recibir todo lo que daba: el poder, los bonos de atributo, los ' +
      'recursos, los grados, las acciones y los talentos asociados. Con la actividad de reposo Autorreflexión puede reasignar los ' +
      'talentos que le queden inaccesibles.',
    cita: 'L.290 / PDF 296',
  },
  {
    id: 'influencia-de-las-esquirlas',
    titulo: 'Influencia de las Esquirlas',
    texto:
      'Con uno o más clavos hemalúrgicos (las Bendiciones kandra no cuentan), una Esquirla puede intentar comunicarse con el portador: ' +
      'Conservación y Ruina en la Era 1, Armonía en la Era 2. La DJ decide cuándo; los contactos suelen ser breves y la dificultad de ' +
      'las pruebas depende del poder y el acceso de la Esquirla (el libro propone CD 15 para una encarcelada y CD 20 para una con todo ' +
      'su poder). El portador puede resistirse como ante cualquier influencia; la Esquirla solo puede forzarlo si ha acumulado clavos ' +
      'suficientes para quedar bajo su control, y entonces pasa a ser PNJ.',
    cita: 'L.291-292 / PDF 297-298',
  },
  {
    id: 'bendiciones-kandra',
    titulo: 'Bendiciones kandra y clavos',
    texto:
      'Cada kandra lleva una Bendición, un par de clavos hemalúrgicos que se rige sobre todo por las reglas de ascendencia. Para ' +
      'beneficiarse de otro clavo hemalúrgico hay que quitarse uno de los dos de la Bendición, con lo que se pierden temporalmente sus ' +
      'beneficios; el que se conserva cuenta para el límite de clavos (rango 2: un clavo hemalúrgico además del de la Bendición; rango ' +
      '3 o más: dos). Ese límite solo rige si se lleva algún clavo hemalúrgico de este capítulo: sin ellos, se pueden tener dos ' +
      'Bendiciones, y las Bendiciones no reducen la Defensa espiritual.',
    cita: 'L.291 / PDF 297; L.35 / PDF 41',
  },
  {
    id: 'clavo-secreto',
    titulo: 'Empezar con un clavo secreto',
    texto:
      'Si la DJ lo permite, un personaje puede empezar con un clavo que no sabe que lleva (por ejemplo, un pendiente de familia), y ' +
      'acuerdan con ella los metales posibles. No disfruta de su poder completo hasta cumplir una meta que lo convierta formalmente en ' +
      'recompensa y alcanzar el rango del clavo; para quitárselo sigue haciendo falta la pericia Hemalurgo. A criterio de la DJ, antes ' +
      'de eso podría usar de forma inconsciente la versión naciente del poder, de modo que parezca una coincidencia.',
    cita: 'L.289 / PDF 295',
  },
  {
    id: 'eras',
    titulo: 'Hemalurgia en cada era',
    texto:
      'Es un arte poco conocido en las dos eras. En la Era 1 casi solo lo ejercen los inquisidores de acero; en la Era 2 lo recupera ' +
      'el Grupo y los Sangre Espectral recurren a él de forma comedida.',
    cita: 'L.371 / PDF 377',
  },
  {
    id: 'guia-de-seguridad',
    titulo: 'Guía de seguridad',
    texto:
      'El libro recomienda repasar la «Guía de seguridad» del capítulo 13 antes de usar clavos en la partida: crear o implantar clavos ' +
      'es un proceso violento, la hemalurgia puede anular la voluntad de un personaje y, en la Era 1, kandra y koloss dependen de los ' +
      'clavos para sobrevivir sin dejar de ser personas, algo que pide especial respeto.',
    cita: 'L.288 / PDF 294; L.379-380 / PDF 385-386',
  },
]
