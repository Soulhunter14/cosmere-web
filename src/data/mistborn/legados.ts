/**
 * Legacies of the adventure «El legado de los nacidos de la bruma» (Introducción, L.19-23 / PDF 22-26 of SPA_NacidosBruma_Legado.pdf;
 * book page = PDF page - 3). A legacy is the background of a character and its place in the world: in Era 1 each player picks one of six
 * legacies, answers its two questions and takes its extra skill; in Era 2 each player picks the legacy linked to one of the Era 1
 * characters and gets one of its two starting rewards, depending on what that character did during the adventure.
 *
 * The Era 1 questions are this table's own (24 Oct 2026), three per legacy: where the character comes from (origin), what pushes it to
 * leave what it is and try to change things (impulse) and its first goal (27 Oct 2026: a thing to achieve, a mystery to solve or a debt
 * to settle, said as something that can be crossed out, in the register of the sheet's Metas; the API turns that answer into the
 * character's first Meta at «Personaje creado»). They are the thread of each
 * character's session 0 scene; the book's two questions are answered by playing that session («La caída», biblia de campaña). The
 * backstory is written before the character knows it will belong to a crew, so no Era 1 text names Enge's crew, and the Era 1 cards do
 * not show their Era 2 link for now. The Era 2 legacies keep the book's two questions.
 *
 * Ids are ASCII (P7) and must match `MistbornData.Legados` in the API. Texts are short paraphrases of the book, not quotations.
 * Light module: the legacy components import it BY FILE and load lazily (§8, risk 6), so it imports nothing but types.
 */
import type { Era } from '../../types'

export interface RecompensaLegado {
  nombre: string
  /** What the linked Era 1 character must have done */
  condicion: string
  efecto: string
}

export interface LegadoDef {
  id: string
  nombre: string
  era: Era
  /** Id of the legacy of the other era it is linked to (table «Conexiones de legado de los PJs», L.20 / PDF 23) */
  conexion: string
  /** How both characters are linked */
  vinculo: string
  resumen: string
  /** The «Preguntas para el personaje»: three in Era 1 (origin, impulse, goal), the book's two in Era 2. The API stores at most 3 answers */
  preguntas: string[]
  /** Example answers of each question (same order), a hint in the picker: they give the answers a shape that fits the Final Empire */
  ejemplos?: string[][]
  /** Era 1: extra skill, on top of the ones of character creation */
  pericia?: string
  /** Era 2: two starting rewards; the character gets only one */
  recompensas?: [RecompensaLegado, RecompensaLegado]
}

/** Era 2 reward when none of the two fits what the Era 1 character did (L.22 / PDF 25) */
export const RECOMPENSA_POR_DEFECTO: Omit<RecompensaLegado, 'condicion'> = {
  nombre: 'Recuerdo del asedio',
  efecto:
    'Creció en una calle con el nombre del personaje de la Era 1 con el que está conectado. Una vez por semana puede pedir un favor a un ' +
    'vecino, que le acompaña como compañero guardaespaldas durante un día. También vale otra recompensa de rango 1 acordada con el director.',
}

export const LEGADOS: LegadoDef[] = [
  // ── Era 1 (L.20-21 / PDF 23-24); summaries valid before and after the fall; questions of this table: origin, impulse, goal ──
  {
    id: 'convicto', nombre: 'Convicto', era: 'era1', conexion: 'narrador',
    vinculo: 'Su historia es el tema principal de la obra del Narrador.',
    resumen:
      'Sabe lo que es estar preso a merced del lord Legislador: una celda, un número y el Ministerio de Acero detrás. Lo que aprendió ' +
      'dentro (quién manda, quién mira, por dónde se sale) es todo lo que tiene.',
    preguntas: [
      '¿Cómo acabaste en una celda del Ministerio?',
      '¿Qué te empuja a querer cambiar las cosas, y no solo salir de aquí?',
      '¿Qué cuenta te llevas pendiente de la celda: una persona, un nombre, algo que recuperar?',
    ],
    ejemplos: [
      [
        'Nací en una plantación y me escapé: la celda fue donde acabó la huida',
        'Me vendió alguien de confianza: un socio, un pariente, mi propia red',
        'Caí en una redada que no iba a por mí; estaba donde no debía',
        'Me entregué para que no se llevaran a otra persona',
      ],
      [
        'Lo que he visto en la galería: a quién encierran de verdad, y por qué',
        'Alguien que entró conmigo y no va a salir',
        'La promesa que le hice a quien dejé fuera',
        'Que nadie tenga que dar un nombre falso para seguir vivo',
      ],
      [
        'Encontrar a quien me vendió y mirarle a la cara',
        'Sacar de dentro a quien entró conmigo',
        'Recuperar lo que me quitaron al detenerme',
        'Borrar mi número de los registros del Ministerio',
      ],
    ],
    pericia: 'Pericia de utilidad Fuerzas del orden o pericia cultural Bajos fondos: lo que aprendió dentro del sistema.',
  },
  {
    id: 'cronista', nombre: 'Cronista', era: 'era1', conexion: 'explorador',
    vinculo: 'Sus escritos son la base de lo que sabe el Explorador.',
    resumen:
      'Quiere dejar testimonio de la historia mientras sucede, para que sus crónicas sean un bastión de la verdad en el mundo que viene. ' +
      'Puede hacerlo por su cuenta o con el respaldo de una institución, como los guardadores feruquimistas de Terris.',
    preguntas: [
      '¿Quién te puso una pluma en la mano, y por qué sigues escribiendo?',
      '¿Qué te empuja a dejar de escribir lo que te mandan y a escribir lo que pasa?',
      '¿Qué quieres terminar de escribir, encontrar o poner a salvo?',
    ],
    ejemplos: [
      [
        'Un guardador terrisano me enseñó a escondidas, y con la letra, lo prohibido',
        'Mi señor necesitaba a alguien que anotara lo que él no quería recordar',
        'Me formó el Ministerio, y me fui (o me echaron) con lo aprendido',
      ],
      [
        'Una crónica que me hicieron tachar',
        'Un nombre que el Ministerio borró y yo recuerdo',
        'Saber que lo que escribo hoy es lo único que quedará de esta gente',
        'Que la historia de verdad se cuenta junto al fuego, y nadie la anota',
      ],
      [
        'Terminar la crónica que me hicieron tachar y esconderla donde el Ministerio no llegue',
        'Recuperar el nombre que borraron y escribirlo donde alguien lo lea',
        'Encontrar al guardador que me enseñó',
        'Reunir en un solo registro lo que vi hoy, con nombres',
      ],
    ],
    pericia: 'Pericia cultural Peregrina o Dominio de Terris: sus viajes o el lugar donde reunió sus registros.',
  },
  {
    id: 'funcionario', nombre: 'Funcionario', era: 'era1', conexion: 'vigilante-de-la-ley',
    vinculo: 'Su filosofía influye en el trabajo del Vigilante de la ley.',
    resumen:
      'Obligador del Ministerio de Acero, o alguien muy cercano al gobierno del Imperio Final. Conoce sus papeles, sus cantones y sus ' +
      'injusticias desde dentro, y algo de lo que ha firmado le pesa.',
    preguntas: [
      '¿Por qué entraste en el Ministerio de Acero?',
      '¿Qué te empuja a dejar de servir al Ministerio e intentar cambiar las cosas?',
      '¿Qué expediente quieres cerrar: un papel que recuperar, un nombre que borrar, una verdad que sacar?',
    ],
    ejemplos: [
      [
        'Mi familia lleva generaciones dando obligadores al Ministerio: no hubo elección',
        'Era la única salida para una casa menor sin herencia que repartir',
        'Creía de verdad en el lord Legislador, y ya no',
        'Alguien pagó mi puesto a cambio de un favor que todavía debo',
      ],
      [
        'Un expediente que firmé y no debí firmar',
        'Las cuentas: el Ministerio cobra por skaa que llevan años muertos',
        'Una súplica que no pude atender y no se me va de la cabeza',
        'Saber lo que hace el Cantón de la Inquisición con los nombres de sus listas',
      ],
      [
        'Recuperar o destruir el expediente que firmé',
        'Encontrar a la persona de la súplica que no atendí',
        'Averiguar qué hace el Cantón de la Inquisición con los nombres de sus listas',
        'Sacar mi nombre de los libros del Ministerio',
      ],
    ],
    pericia: 'Pericia de utilidad Ministerio de Acero o pericia cultural Dominios Interiores: según trabajara más con el Ministerio o con la nobleza.',
  },
  {
    id: 'noble', nombre: 'Noble', era: 'era1', conexion: 'heredero',
    vinculo: 'Es de la misma familia que el Heredero.',
    resumen:
      'Ocupa un lugar privilegiado en la cruel jerarquía del Imperio Final, pero no encaja en él. Un acto de rebeldía o un fracaso le ' +
      'dejará fuera de su casa, y tendrá que buscarse la vida.',
    preguntas: [
      '¿Qué lugar ocupas en tu casa, y por qué nunca encajaste en él?',
      '¿Qué te empuja a romper con tu casa e intentar cambiar las cosas?',
      '¿Qué quieres sacar de tu casa: una persona, un papel, una deuda?',
    ],
    ejemplos: [
      [
        'Sin derecho a heredar: me educaron para servir a quien hereda',
        'Quien hace las preguntas que la casa no quiere oír',
        'Quien pasa más tiempo con los criados que en el salón',
        'Moneda de cambio: me prometieron a otra casa para pagar una deuda',
      ],
      [
        'Lo que vi hacer a mi familia con sus skaa, y que todos llaman normal',
        'Un pacto de la casa que me enseñaron a no leer',
        'Alguien de abajo que me importó más que mi apellido',
        'Que la casa está acabada y nadie quiere decirlo en voz alta',
      ],
      [
        'Leer el pacto que me enseñaron a no leer',
        'Sacar de la fortaleza a la persona de abajo que me importa',
        'Romper el compromiso con la casa a la que me prometieron',
        'Poner lo que sé de mi casa en manos de quien pueda usarlo',
      ],
    ],
    pericia: 'Pericia cultural Alta sociedad o Luthadel (la segunda, si representó a su familia en la política de la capital).',
  },
  {
    id: 'pilluelo', nombre: 'Pilluelo', era: 'era1', conexion: 'emprendedor',
    vinculo: 'Sus decisiones benefician al Emprendedor, su descendiente.',
    resumen:
      'De origen humilde, quiere salir de la miseria y del anonimato cueste lo que cueste. El clasismo manda en Luthadel: los nobles ' +
      'desconfían de los pilluelos y los skaa suelen simpatizar con ellos.',
    preguntas: [
      '¿Cómo acabaste en la calle?',
      '¿Qué te empuja a dejar de robar para otros e intentar cambiar las cosas?',
      '¿Qué golpe, qué persona o qué deuda te sacaría de la calle?',
    ],
    ejemplos: [
      [
        'Nací en los Laberintos y no conocí a mis padres',
        'A mi familia se la llevaron (una redada, una deuda, un capricho noble) y yo me escondí',
        'Huí de una plantación, o de la casa noble donde servía',
        'Me echaron de un taller o de un gremio, y la calle fue lo que quedó',
      ],
      [
        'Un crío de la red al que se llevaron por un encargo mío',
        'Que lo que robo acaba siempre en el mismo bolsillo',
        'Un noble que me pagó por algo que no era un robo',
        'Ver que media ciudad se queda quieta por miedo',
      ],
      [
        'Encontrar al crío de la red que se llevaron',
        'Saber quién era el noble que me pagó por lo que no era un robo, y por qué',
        'Dar el golpe que me saque de los Laberintos para siempre',
        'Reunir a los míos bajo un techo que no sea de nadie más',
      ],
    ],
    pericia: 'Pericia cultural Bajos fondos; quien aspire a la nobleza (o a suplantar nobles y estafar) puede tomar Alta sociedad en su lugar.',
  },
  {
    id: 'veterano', nombre: 'Veterano', era: 'era1', conexion: 'novato',
    vinculo: 'Sus hazañas legendarias ponen el listón muy alto al Novato.',
    resumen:
      'Luchó en las campañas del lord Legislador, por la leva o al mando en nombre de su casa noble. Años de servicio le han enseñado ' +
      'lo que hay detrás de una victoria, y piensa en desertar para decidir su propio destino.',
    preguntas: [
      '¿Por qué te uniste al ejército?',
      '¿Qué te empuja a colgar la librea e intentar cambiar las cosas?',
      '¿Qué cuenta te llevas pendiente del ejército: una persona, una orden, una deuda?',
    ],
    ejemplos: [
      [
        'La leva se llevó a los jóvenes de mi calle, y yo estaba en ella',
        'Para comer: era el uniforme o los Pozos',
        'Mi casa, pequeña, debía soldados a los Haught, y me tocó a mí',
        'Para huir de algo, o de alguien, que la guerra tapó',
      ],
      [
        'Una orden que no cumplí, y la cara de quien me la dio',
        'Lo que había detrás de una victoria: pueblos quemados que nadie anotó',
        'Los míos mueren por órdenes de gente que no sabe sus nombres',
        'Un señor al que llevo años sirviendo y que no sabe el mío',
      ],
      [
        'Encontrar a quien me dio la orden que no cumplí',
        'Volver al pueblo que quemamos y hacer algo por los que quedan',
        'Sacar a mi camarada de la unidad antes de que lo manden al frente',
        'Dejar escrito lo que hubo detrás de la victoria, con nombres',
      ],
    ],
    pericia: 'Pericia de utilidad Vida militar o pericia cultural Dominios Exteriores: según las guarniciones donde sirvió.',
  },

  // ── Era 2 (L.22-23 / PDF 25-26) ──
  {
    id: 'emprendedor', nombre: 'Emprendedor', era: 'era2', conexion: 'pilluelo',
    vinculo: 'Desciende del Pilluelo, cuyas decisiones le benefician.',
    resumen:
      'Elendel es la ciudad de las oportunidades, y quiere dar forma a su futuro. Lo que heredó de su antepasado Pilluelo le pone en el ' +
      'camino para hacer realidad sus grandes ideas.',
    preguntas: [
      '¿Qué queréis crear tú o tu empresa?',
      '¿Qué parte no material de tu herencia valoras más (una idea, un contacto, un lugar donde pensar)?',
    ],
    recompensas: [
      {
        nombre: 'Mecenazgo de Kandor', condicion: 'Si el Pilluelo aceptó la mentoría de Kandor.',
        efecto: 'Dirige una empresa comercial de escala 1 (Organizaciones, cap. 8 del Manual): +100 arquillas iniciales y 100 arquillas de beneficio al mes.',
      },
      {
        nombre: 'Red de Cynwise', condicion: 'Si el Pilluelo se unió a la red de Cynwise.',
        efecto: 'Pericias culturales Elendel y Bajos fondos; +100 arquillas si Cynwise pagó al Pilluelo por rechazar a Kandor (cap. 3).',
      },
    ],
  },
  {
    id: 'explorador', nombre: 'Explorador', era: 'era2', conexion: 'cronista',
    vinculo: 'Los escritos del Cronista son la base de su conocimiento.',
    resumen:
      'De buena familia, ecléctico y poco convencional, quiere desenterrar el pasado. Siente un interés especial por los escritos del Cronista.',
    preguntas: ['¿Por qué no encajas en las instituciones académicas?', '¿Por qué te centras ahora tanto en el registro del Cronista?'],
    recompensas: [
      {
        nombre: 'Musa de Bezryl', condicion: 'Si el Cronista aconsejó a Bezryl sobre cómo hablar en la manifestación de los trabajadores.',
        efecto: 'Aprecia la historia de Terris: obtiene un compañero consejero terrisano.',
      },
      {
        nombre: 'Propagandista de Cett', condicion: 'Si el Cronista aceptó difundir la propaganda de Ashweather Cett.',
        efecto: 'Es miembro de los Amigos de Ashweather, un club social de escala 1 con su propio pasquín (Organizaciones, cap. 8).',
      },
    ],
  },
  {
    id: 'heredero', nombre: 'Heredero', era: 'era2', conexion: 'noble',
    vinculo: 'Es de la misma familia que el Noble.',
    resumen:
      'Su linaje se remonta a antes del Catacendro, hasta el Noble. Sus parientes vivos son especialmente dañinos y suele desafiar lo que ' +
      'esperan de él. Encaja muy bien con un nacido del metal (momento de legado del capítulo 6).',
    preguntas: ['¿En qué no has estado a la altura de lo que espera tu familia?', '¿Lo has decidido tú o es que no eres capaz?'],
    recompensas: [
      {
        nombre: 'Lealtad de Anastas', condicion: 'Si el Noble ayudó a Cadme a fugarse con Anastas Elariel.',
        efecto: 'Un suministro de metales raros de rango 1 a su elección (Metales raros, cap. 8).',
      },
      {
        nombre: 'Engaño a Duvall', condicion: 'Si el Noble se reunió con Duvall Haught para hablar de la traición.',
        efecto: 'Su familia le ha dado un sombrero forrado de aluminio.',
      },
    ],
  },
  {
    id: 'narrador', nombre: 'Narrador', era: 'era2', conexion: 'convicto',
    vinculo: 'Su obra gira en torno a la historia del Convicto.',
    resumen:
      'Cree en la importancia de los relatos. Solo ha desenterrado una parte de la vida del Convicto y sigue su rastro para escribir la ' +
      'próxima gran epopeya.',
    preguntas: ['¿Cómo conociste la historia del Convicto?', '¿Qué parte de esa historia te cuesta más aceptar, y por qué?'],
    recompensas: [
      {
        nombre: 'Relato de camaradería',
        condicion: 'Si el Convicto calmó a los rebeldes en el incendio del almacén de Construcciones Kandor (cap. 3).',
        efecto: 'Una vez por semana puede llamar a un compañero rebelde para que le acompañe durante un día.',
      },
      {
        nombre: 'Relato de ingenio', condicion: 'Si el Convicto usó lo aprendido en prisión para dejar al menos una marca en la cripta.',
        efecto: 'Un gabán de bruma o una granada alomántica de rango 1, a su elección; debe contar cómo lo consiguió.',
      },
    ],
  },
  {
    id: 'novato', nombre: 'Novato', era: 'era2', conexion: 'veterano',
    vinculo: 'Desciende del Veterano y vive a la sombra de su leyenda.',
    resumen:
      'Desciende de un héroe legendario, el Veterano, cuya historia se ha mitificado con los años. Le guste o no, vive a la sombra de una leyenda.',
    preguntas: [
      '¿Qué te delata al momento como pariente del famoso Veterano (el nombre, el aspecto, otro rasgo)?',
      '¿Cómo esperas diferenciarte del Veterano?',
    ],
    recompensas: [
      {
        nombre: 'Protector de todos', condicion: 'Si el Veterano se arriesgó para salvar a los prisioneros de la bestia hemalúrgica.',
        efecto: 'Si tiene un refugio, puede añadirle gratis la mejora Despensa o Almacén (Refugios, cap. 8).',
      },
      {
        nombre: 'La palabra de Demoux', condicion: 'Si el Veterano impresionó a Demoux en las negociaciones de Construcciones Kandor.',
        efecto: 'Obtiene el beneficio de un cuerpo político de escala 1 (Organizaciones, cap. 8), aunque no se dedique a la política.',
      },
    ],
  },
  {
    id: 'vigilante-de-la-ley', nombre: 'Vigilante de la ley', era: 'era2', conexion: 'funcionario',
    vinculo: 'La filosofía del Funcionario inspira su trabajo.',
    resumen:
      'Formó parte de las fuerzas del orden de Elendel y sabe que la ley tiene fallos. Ahora busca el verdadero sentido de la justicia, con ' +
      'el ejemplo del Funcionario, que también dio la espalda a lo establecido.',
    preguntas: [
      '¿Qué caso o situación te llevó a dimitir o a que te despidieran?',
      '¿Cómo se inspiran tu ética de trabajo o tu idea de la justicia en el ideario del Funcionario (o cómo lo rechazan)?',
    ],
    recompensas: [
      {
        nombre: 'Teoría del juicio', condicion: 'Si el Funcionario ayudó a Murn a entregarse al nuevo gobierno de Luthadel.',
        efecto: 'Pericia de utilidad Policía de Elendel o Senado de Elendel.',
      },
      {
        nombre: 'Teoría de la institución', condicion: 'Si el Funcionario adoptó la meta «Restablecer la enfermería».',
        efecto: 'Un médico como patrocinador: una vez por semana, durante el reposo, reduce una lesión 1d3 días por cada hito de esa meta.',
      },
    ],
  },
]

export const getLegado = (id: string): LegadoDef | undefined => LEGADOS.find((l) => l.id === id)
