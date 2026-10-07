/**
 * Legacies of the adventure «El legado de los nacidos de la bruma» (Introducción, L.19-23 / PDF 22-26 of SPA_NacidosBruma_Legado.pdf;
 * book page = PDF page - 3). A legacy is the background of a character and its place in the world: in Era 1 each player picks one of six
 * legacies, answers its two questions and takes its extra skill; in Era 2 each player picks the legacy linked to one of the Era 1
 * characters and gets one of its two starting rewards, depending on what that character did during the adventure.
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
  /** The two «Preguntas para el personaje» */
  preguntas: [string, string]
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
  // ── Era 1 (L.20-21 / PDF 23-24) ──
  {
    id: 'convicto', nombre: 'Convicto', era: 'era1', conexion: 'narrador',
    vinculo: 'Su historia es el tema principal de la obra del Narrador.',
    resumen:
      'Estuvo preso a merced del lord Legislador y escapó de la cárcel con una huida audaz. Tras esquivar al Ministerio de Acero, busca ' +
      'una vida nueva en la red de contrabando de Enge.',
    preguntas: ['¿Por qué delito te condenaron? ¿Lo cometiste de verdad?', '¿Cómo te escapaste de la prisión?'],
    pericia: 'Pericia de utilidad Fuerzas del orden o pericia cultural Bajos fondos: lo que aprendió dentro del sistema.',
  },
  {
    id: 'cronista', nombre: 'Cronista', era: 'era1', conexion: 'explorador',
    vinculo: 'Sus escritos son la base de lo que sabe el Explorador.',
    resumen:
      'Quiere dejar testimonio de la historia mientras sucede, para que sus crónicas sean un bastión de la verdad en el mundo que viene. ' +
      'Puede hacerlo por su cuenta o con el respaldo de una institución, como los guardadores feruquimistas de Terris.',
    preguntas: ['¿Sobre qué tratan tus crónicas?', '¿Cómo llevas tu registro? ¿Tiene nombre?'],
    pericia: 'Pericia cultural Peregrina o Dominio de Terris: sus viajes o el lugar donde reunió sus registros.',
  },
  {
    id: 'funcionario', nombre: 'Funcionario', era: 'era1', conexion: 'vigilante-de-la-ley',
    vinculo: 'Su filosofía influye en el trabajo del Vigilante de la ley.',
    resumen:
      'Antiguo obligador del Ministerio de Acero, o alguien muy cercano al gobierno del Imperio Final. Tras la caída del lord Legislador ' +
      'dejó su puesto para unirse a la red de Enge y poner su talento al servicio de algo mejor.',
    preguntas: [
      '¿A qué cantón del Ministerio estabas más ligado (Finanzas, Ortodoxia, Recursos…)? ¿Llevas los tatuajes de obligador alrededor de los ojos?',
      '¿Qué te hizo ver las injusticias del Ministerio o de tu institución?',
    ],
    pericia: 'Pericia de utilidad Ministerio de Acero o pericia cultural Dominios Interiores: según trabajara más con el Ministerio o con la nobleza.',
  },
  {
    id: 'noble', nombre: 'Noble', era: 'era1', conexion: 'heredero',
    vinculo: 'Es de la misma familia que el Heredero.',
    resumen:
      'Tuvo un lugar privilegiado en la cruel jerarquía del Imperio Final, pero por un acto de rebeldía o por un fracaso acabó repudiado ' +
      'y tiene que buscarse la vida.',
    preguntas: ['¿Cómo se llama tu familia y por qué era conocida?', '¿Por qué no podrás volver nunca con ella?'],
    pericia: 'Pericia cultural Alta sociedad o Luthadel (la segunda, si representó a su familia en la política de la capital).',
  },
  {
    id: 'pilluelo', nombre: 'Pilluelo', era: 'era1', conexion: 'emprendedor',
    vinculo: 'Sus decisiones benefician al Emprendedor, su descendiente.',
    resumen:
      'De origen humilde, está decidido a salir de la miseria y del anonimato. El clasismo sigue vivo en Luthadel: los nobles desconfían ' +
      'de los pilluelos y los skaa suelen simpatizar con ellos.',
    preguntas: ['¿Qué habilidad especial te hace indispensable para la banda?', '¿Quieres unirte a la élite rica o que todos jueguen en igualdad?'],
    pericia: 'Pericia cultural Bajos fondos; quien aspire a la nobleza (o a suplantar nobles y estafar) puede tomar Alta sociedad en su lugar.',
  },
  {
    id: 'veterano', nombre: 'Veterano', era: 'era1', conexion: 'novato',
    vinculo: 'Sus hazañas legendarias ponen el listón muy alto al Novato.',
    resumen:
      'Luchó en las campañas del lord Legislador, reclutado a la fuerza o al mando en nombre de su casa noble. Tras años de servicio, ' +
      'desencantado con la guerra, desertó para decidir su propio destino.',
    preguntas: ['¿Qué papel tenías en el ejército (soldado, cirujano, estratega…)?', '¿Cómo dejaste el ejército?'],
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
