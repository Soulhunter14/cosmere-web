export type SceneType = 'narrative' | 'social' | 'exploration' | 'combat' | 'choice'
export type NpcRole = 'ally' | 'neutral' | 'villain' | 'special'

export interface SceneTable {
  title: string
  entries: { roll?: string; text: string }[]
}

export interface SceneBranch {
  label: string
  description: string
}

export interface Scene {
  id: string
  title: string
  type: SceneType
  readAloud?: string
  content: string[]
  tips?: string[]
  tables?: SceneTable[]
  branches?: SceneBranch[]
}

export interface Npc {
  name: string
  pronouns: string
  type: string
  role: NpcRole
  traits: string[]
  goal: string
  appearance: string
  notes?: string
}

export interface CombatEnemy {
  name: string
  count: string
  bonus?: string
}

export interface Combat {
  id: string
  title: string
  mapRef?: string
  enemies: CombatEnemy[]
  specialRules: string[]
  duration?: string
  rewards?: string
  tables?: SceneTable[]
}

export interface AdventureMap {
  id: string
  title: string
  pdfPage?: number
  imagePath?: string   // path relative to /public, e.g. "/maps/map_p32.png"
  scale: string
  locations: string[]
  notes?: string
}

export interface PrepItem {
  text: string
  type: 'key' | 'spren' | 'info'
}

export interface AdventureChapter {
  id: string
  number: number
  title: string
  pdfPages: { from: number; to: number }
  levelFrom: number
  levelTo: number
  summary: string
  background: string
  prepChecklist: string[]
  progressionItems: PrepItem[]
  scenes: Scene[]
  npcs: Npc[]
  combats: Combat[]
  maps: AdventureMap[]
}

// ── Chapter 1 ─────────────────────────────────────────────────

const CHAPTER_1: AdventureChapter = {
  id: 'cap1',
  number: 1,
  title: 'Honor más allá de la tormenta',
  pdfPages: { from: 22, to: 34 },
  levelFrom: 1,
  levelTo: 2,
  summary: 'Los PJs acompañan a Taszo, un chamán de piedra shin, hacia las Llanuras Quebradas. En la Encrucijada de la Piedra del Concilio descubren que la hoja de Honor de Taln viaja en una caravana alezi. Los Ojos de Pala envían a Kaiana a robarla y a bandidos como distracción. El capítulo concluye con la muerte de Taszo y el grupo heredando su misión.',
  background: 'El regreso de Taln presagia una nueva Desolación. Los chamanes de piedra de Shinovar buscan su hoja de Honor. Taszo sobrevivió al ataque que mató a sus compañeros chamanes y ha reclutado a los PJs. Ylt, un Vigilante de la Verdad de Iri, también busca la hoja para su gloria personal. Ha adoctrinado a bandidos locales y a los Ojos de Pala para detener a los chamanes y robar el arma. Kaiana, su discípula, ejecutará el intercambio mientras los bandidos distraen a los soldados.',
  prepChecklist: [
    'Los PJs presencian el arrebato de Ellar contra Taln.',
    'Taszo inicia la conversación de "Sospechas reveladas" con los PJs.',
    'Los PJs tienen la oportunidad de descubrir que los bandidos son una distracción (o Taszo lo revela).',
    'Taszo pide al grupo que continúe su misión antes de morir.',
    'El capítulo termina con el grupo heredando la cumbrespren Po\'ahu de Taszo.',
  ],
  progressionItems: [
    { type: 'key', text: 'Los PJs suben al nivel 2 tras la muerte de Taszo.' },
    { type: 'spren', text: 'Spren atraídos si un PJ interviene en el arrebato de Ellar.' },
    { type: 'spren', text: 'Spren atraídos si un PJ ayuda y protege a Tet Rebin y Hana.' },
    { type: 'spren', text: 'Spren atraídos si un PJ sigue a Taszo hacia la tormenta.' },
    { type: 'info', text: 'PJs con metas sobre Heraldos/hojas de Honor pueden progresar observando a Taln, identificando el glifo de Ylt en Veth, o descubriendo los poderes de Kaiana.' },
  ],

  scenes: [
    {
      id: 'apertura',
      title: 'A cobijo de la tormenta',
      type: 'narrative',
      readAloud: 'Viajáis a través de las Montañas Irreclamadas, una región poco habitada de terreno irregular, arbustos y piedra de tonos ocres. Espesas nubes grises sobre vuestras cabezas amenazan con una alta tormenta, y vientospren de un azul brillante se mueven por el cielo.\n\nVuestro afable compañero Taszo juguetea con el yeso de su brazo roto y mira hacia arriba con aprensión.\n\nAlcanzáis la cima de la siguiente colina y Taszo exhala aliviado. Por debajo de vosotros se encuentra la cara protegida de la formación rocosa de la Encrucijada de la Piedra del Concilio. La pared mide 150 metros de alto y el doble de ancho. Proporciona una barrera natural contra las tormentas, lo que la convierte en un punto de paso muy popular para las caravanas. Ahora mismo hay unas cuantas de este tipo por la zona, incluida una gran caravana militar que exhibe las banderas azules de la casa Kholin.\n\n"Los espíritus de las piedras nos protegen". Los ojos de Taszo se detienen en las banderas. "La tormenta podría llegar en cualquier momento. ¡Hagamos algunos amigos, y rápido!"',
      content: [
        'Varias caravanas están reunidas en la Encrucijada de la Piedra del Concilio. Hay dos que aún se están preparando para la tormenta.',
        'El grupo debe decidir a cuál acercarse primero, aunque el suceso "El arrebato de Ellar" tiene lugar independientemente de esta elección.',
      ],
      tips: [
        'Los jugadores deben haber creado conexiones de personaje con Taszo antes de comenzar (consulta la introducción del libro).',
        'Si el grupo se entretiene demasiado, el sargento Ellar se acerca y los pone a trabajar.',
      ],
    },
    {
      id: 'encrucijada',
      title: 'La Encrucijada de la Piedra del Concilio',
      type: 'exploration',
      content: [
        'La Piedra del Concilio es una formación rocosa de 300 metros de largo. La pared está cubierta de glifos quemados y pintados. Un PJ con pericia Alezi, o que supere una prueba de Saber CD 10, reconocerá que aquí se firmaron acuerdos comerciales y juramentos desde el inicio de la Guerra de la Venganza.',
        'CARAVANA DE MERCADERES: Un círculo de cuatro carros casi preparado para la tormenta. Svalka (thayleña, ella) pregunta por su amigo Tet Rebin, que debía haber llegado hace horas. Nen (alezi, él), el mercader de armas, hace de anfitrión e interroga al grupo con curiosidad.',
        'CARAVANA DE LA CASA KHOLIN: Diez carros con cien soldados alezi comandados por el sargento Ellar. Un carruaje con barrotes transporta a Taln. Un carro envuelto en cadenas y custodiado por cuatro soldados transporta la hoja esquirlada (solo Bordin lo sabe). El grupo puede integrarse si demuestra utilidad (prueba CD 10 con habilidad relevante) o pasando desapercibido (Sigilo CD 10).',
      ],
      tips: [
        'Si los PJs ayudan a Ellar, los soldados comparten cotilleos (tabla Cotilleos de la caravana).',
        'Los cantores con aspecto sencillo obtienen ventaja en la prueba de Sigilo.',
      ],
      tables: [
        {
          title: 'Cotilleos de la caravana (d4)',
          entries: [
            { roll: '1', text: 'El sargento Ellar hace como que está al mando, pero en realidad responde ante Bordin, uno de los guardias del carro cerrado con llave.' },
            { roll: '2', text: 'Los soldados no saben qué hay dentro del carro cerrado con llave; solo lo sabe Bordin.' },
            { roll: '3', text: 'Hace dos días, unos bandidos atacaron la caravana alezi. Hubo heridos por ballestas, pero no víctimas mortales.' },
            { roll: '4', text: 'Los alezi transportan a un hombre que delira y que asegura ser el Heraldo Taln. La orden de transportarlo proviene del alto príncipe Dalinar Kholin.' },
          ],
        },
      ],
    },
    {
      id: 'leyenda',
      title: 'El regreso de una leyenda',
      type: 'social',
      readAloud: 'Taszo mira con asombro el carruaje con ventanas enrejadas, mientras los asombrospren revolotean sobre su cabeza en anillos de humo azul. Mirando al prisionero del interior, Taszo se agarra, dubitativo, a los barrotes.\n\nUna voz fuerte corta el viento: "¡Atrás, extraño!". Ellar da un paso adelante. "Este prisionero es un bobo delirante y blasfemo. Se pasa todo el día murmurando que es un gran Heraldo".\n\nEl sargento sacude la cabeza con desprecio, luego grita al interior del carro: "¿Puedes salvarnos de la tormenta, gran Heraldo?" Escupe entre los barrotes al hombre que hay en el interior.',
      content: [
        'EL ARREBATO DE ELLAR: Si el grupo interviene, un PJ debe superar Intimidación o Liderazgo CD 13. Si tiene éxito, Ellar se echa atrás. Si falla, gasta 2 concentración para resistirse (requiere una segunda prueba CD 13). Si fallan ambas, Ellar menosprecia al PJ. En cualquier caso, Bordin interviene.',
        'Bordin agradece a los personajes su intervención y les pide que encadenen el carro de Taln para la tormenta.',
        'SOSPECHAS REVELADAS: Taszo reúne al grupo junto al precipicio. Pregunta su opinión sobre los alezi y sobre quién transportan. Tras este momento, la llegada de Hana interrumpe la conversación.',
      ],
      tips: [
        'Taln repite su mantra sin parar (consulta ficha de Taln). No responde a estímulos externos.',
        'Si los PJs atacan a Ellar, este usa estadísticas de guardia (ataques sin armas: +5, daño 1d4+5), pero Bordin lo detiene rápidamente.',
        'Bordin respeta a personas con principios; es un buen aliado potencial si los PJs se comportan bien.',
      ],
    },
    {
      id: 'crem',
      title: 'La trampa del crem',
      type: 'choice',
      readAloud: 'Un alboroto atrae la atención de ambas caravanas. En el centro, una adolescente gesticula desesperadamente hacia el camino. Unos miedospren morados se reúnen a sus pies, y su voz es frenética: "¡El carro está atascado y padre no quiere abandonarlo, necesitamos ayuda! ¡Por favor, es todo lo que tenemos!"',
      content: [
        'Hana (plebeya, ella) es la hija de Tet Rebin. Su carro de vino está atascado en un charco de crem fresco a varias decenas de metros del camino. Bordin ofrece 50 marcos y Svalka otros 50 si el grupo lleva a Rebin a un refugio antes de la tormenta.',
        'Un PJ que examine el charco de crem y supere Deducción o Supervivencia CD 12 descubrirá que el carro fue colocado así intencionadamente: los bandidos tienden una emboscada.',
      ],
      tips: [
        'Taszo quiere ayudar pero admite que puede contribuir poco con el brazo roto.',
        'Después de que los PJs teoricen sobre la trampa, Taszo revela que el artefacto que busca es la hoja de Honor de Taln y que cree que está en ese carro encadenado.',
      ],
      branches: [
        {
          label: 'Atrapados en el crem',
          description: 'Los PJs van a ayudar a Rebin. Empeño de ingeniería: 3 éxitos antes de 3 fallos. Opciones: tirar del carro (Atletismo CD 18), aligerar el peso (Atletismo CD 13), voltear el chull (Atletismo CD 14 o Supervivencia CD 12), idear una solución con cuerda (Manufactura CD 12 + Liderazgo CD 12). Si fracasan, el carro queda atascado y todos buscan refugio.',
        },
        {
          label: 'Quedarse con la caravana',
          description: 'Bordin envía 3 lanceros. Los PJs pueden intentar robar la hoja de Honor. Empeño: 4 éxitos antes de 2 fallos. Distraer guardias (Engaño/Persuasión CD 15, desventaja sin haber ayudado antes), acercarse sigiloso (Sigilo CD 16), forzar la cerradura (Hurto CD 15), buscar panel suelto (Percepción CD 12). Si se sufre una Complicación, el empeño falla inmediatamente.',
        },
      ],
      tables: [
        {
          title: 'Oportunidades y Complicaciones del carro',
          entries: [
            { roll: 'Oportunidad', text: 'El PJ se percata de que el charco fue creado intencionalmente, o descubre las huellas de los bandidos e intuye de dónde vendrá la emboscada.' },
            { roll: 'Complicación', text: 'El PJ queda atrapado en el charco de crem (ver Emboscada en el camino).' },
          ],
        },
      ],
    },
    {
      id: 'kaiana',
      title: 'Descubriendo a Kaiana',
      type: 'narrative',
      readAloud: 'En el interior del carro, una mujer de pelo negro está agachada junto a un cofre abierto. Lleva una capa marrón sobre un vestido verde y sostiene una hoja esquirlada con forma de púa enorme. Os mira con los ojos muy abiertos, y observáis un glifo verde pintado en su cara redonda. De repente, hay un destello cegador.',
      content: [
        'Kaiana acaba de intercambiar la hoja de Honor por una hoja esquirlada ordinaria. Usa Destello desorientador, huye por un tablón cortado y lo vuelve a colocar tras ella.',
        'EL TABLÓN CORTADO: Percepción CD 12 para encontrarlo. Deducción CD 12 para saber que fue cortado por una hoja esquirlada.',
        'LA CERRADURA FABRIAL: Alimentada por amatista, funciona como cerradura de combinación. Manufactura de fabriales o Saber CD 16 para entenderla. Hurto CD 25 para abrirla. Contiene la hoja esquirlada que Kaiana dejó como sustituta.',
        'EL GLIFO DE KAIANA: Prueba con desventaja para identificarlo (solo se vio un instante). Si se identifica, es el mismo que llevan los seguidores de Ylt.',
      ],
      tips: [
        'Los PJs disponen solo de un breve momento para investigar antes de que los bandidos ataquen.',
        'El glifo verde es clave: conectará a Kaiana con Ylt y con los asesinos de los compañeros de Taszo.',
      ],
    },
    {
      id: 'emboscada',
      title: 'La emboscada de los bandidos',
      type: 'combat',
      content: [
        'Veinte bandidos atacan las caravanas. La mayoría se centra en los soldados alezi con tácticas de guerrilla. Cuatro (o seis si los PJs están en la caravana) se dirigen directamente contra el grupo.',
        'Los bandidos se retiran después de 3 rondas, o cuando solo quede vivo uno de los que luchan contra los PJs.',
        'SEÑAL DE RETIRADA: Un silbido agudo de Kaiana indica que el robo fue completado. Los bandidos huyen directamente hacia la muralla de tormenta. Los soldados se burlan de ellos.',
      ],
      tips: [
        'Cualquier PJ que haya fallado un empeño o estuviera conversando al inicio del ataque sufre el estado Sorprendido.',
        'Si Taszo está con el grupo, ayuda a luchar pero se retira si recibe un impacto.',
      ],
      tables: [
        {
          title: 'Oportunidades y Complicaciones (camino)',
          entries: [
            { roll: 'Oportunidad', text: 'Si un bandido está a 1,5 m del charco de crem, cae y queda Retenido. O el suelo mojado hace que uno resbale y quede Tumbado.' },
            { roll: 'Complicación', text: 'Rebin y Hana intentan huir y un bandido los persigue.' },
          ],
        },
        {
          title: 'Oportunidades y Complicaciones (caravana)',
          entries: [
            { roll: 'Oportunidad', text: 'Un soldado alezi llega y atraviesa con su lanza a uno de los bandidos que se enfrenta a los PJs (5 daño, 1d6+2).' },
            { roll: 'Complicación', text: 'Un bandido rompe la puerta del carro de Nen y lo arrastra agarrándolo por el cuello.' },
          ],
        },
      ],
    },
    {
      id: 'tormenta',
      title: 'Hacia la tormenta',
      type: 'combat',
      readAloud: 'La muralla de tormenta impacta. Aguas heladas y nubes de escombros asfixiantes os azotan. El viento es tan fuerte que puede levantar a una persona incluso a pesar del muro protector del macizo de piedra. Por encima del viento y la lluvia ensordecedores, se oye un estruendo. Una roca cae a solo tres metros de vosotros.',
      content: [
        'TASZO CORRE: Cuando Taszo (o cualquier PJ) ve el glifo verde en un bandido muerto, Taszo palidece, comprende que la emboscada era una distracción y corre hacia la muralla de tormenta persiguiendo a Kaiana y Ylt.',
        'SIGUIENDO A TASZO: Cada PJ que siga a Taszo debe superar Atletismo o Supervivencia CD 13 para avanzar contra la tormenta. Los personajes con pericia Oyente obtienen ventaja. Fallo: 3 (1d6) daño y estado Tumbado. Éxito: mitad del daño.',
        'Si los PJs siguen a Taszo, reciben el estado Determinado (pueden añadir una Oportunidad a una prueba fallida antes del próximo combate).',
        'PO\'AHU: La cumbrespren de Taszo (escondida en una piedra) los guía. El PJ con mayor resultado en Disciplina la descubre: una piedra caliente que tira de él hacia las figuras en la oscuridad.',
        'INTERCAMBIO BREVE: Los PJs encuentran a Ylt, Kaiana y Veth. Veth acaba de apuñalar a Taszo en el estómago. Ylt declara que lo previó y ordena a Veth que elimine a los testigos. Ylt y Kaiana escapan.',
        'MUERTE DE TASZO: Taszo muere al final de este capítulo. Pide al grupo que continúe su misión antes de morir. Po\'ahu puede comenzar a vincularse con el PJ que desee ser Custodio de la Piedra.',
      ],
      tips: [
        'Pide a los jugadores que expliquen por qué sus personajes siguen a Taszo; es un momento de definición de personaje.',
        'Taszo puede tardar algo en morir para dar tiempo a la conversación final.',
        'Veth lucha a muerte (no se rinde ni huye): el robo solo puede mantenerse en secreto eliminando testigos.',
      ],
      tables: [
        {
          title: 'Efectos de la alta tormenta (al inicio de cada ronda)',
          entries: [
            { roll: '1–2', text: 'Lluvia torrencial: desventaja en ataques a distancia.' },
            { roll: '3–4', text: 'Ráfaga de viento: prueba de Atletismo CD 12 o queda Tumbado.' },
            { roll: '5–6', text: 'Escombros: prueba de Atletismo CD 10 o sufre 3 (1d6) daño.' },
          ],
        },
      ],
    },
  ],

  npcs: [
    {
      name: 'Taszo-hijo-Clutio',
      pronouns: 'él',
      type: 'chamán de piedra',
      role: 'ally',
      traits: ['obligado por su cometido', 'empático', 'inquisitivo'],
      goal: 'Proteger Roshar entregando la hoja de Honor de Taln a Shinovar.',
      appearance: 'Humano shin de treinta y pocos años. Bajo, piel rosada y pálida, ojos redondos azul oscuro, espesa mata de pelo rubio rizado. Lleva un brazo roto enyesado.',
      notes: 'Esconde la existencia de Po\'ahu (cumbrespren). La piedra que trata con reverencia es Po\'ahu. Muere al final de este capítulo. Puede vincularse provisionalmente con un PJ antes de morir.',
    },
    {
      name: 'Ellar',
      pronouns: 'él',
      type: 'guardia',
      role: 'neutral',
      traits: ['beligerante', 'intolerante', 'vanidoso'],
      goal: 'Ser visto y respetado como figura de autoridad.',
      appearance: 'Sargento alezi con el pelo rapado. Se regocija en su posición relativa de poder.',
      notes: 'No es el verdadero líder de la caravana; eso es Bordin. Prueba para calmarlo: Intimidación/Liderazgo CD 13.',
    },
    {
      name: 'Bordin',
      pronouns: 'él',
      type: 'guardia',
      role: 'neutral',
      traits: ['leal', 'pragmático', 'discreto'],
      goal: 'Proteger la caravana y llevar la hoja esquirlada a Dalinar Kholin con discreción.',
      appearance: 'Humano alezi inofensivo, ojos oscuros, pelo oscuro y corto, cejas pronunciadas. Viste el azul de la casa Kholin.',
      notes: 'Respeta a los PJs con principios. Buen aliado si se comportan con integridad. Solo Bordin sabe que el carro encadenado transporta una hoja esquirlada.',
    },
    {
      name: 'Taln (Talenel\'Elin)',
      pronouns: 'él',
      type: 'heraldo',
      role: 'special',
      traits: ['distante', 'preocupado', 'repetitivo'],
      goal: 'Avisar a todo el mundo de la Desolación que se avecina.',
      appearance: 'Hombre makabaki alto y musculoso. Ojos oscuros y cansados, pelo largo desgreñado. Mirada ausente. Repite su mantra sin responder a estímulos.',
      notes: 'Mantra: "Soy Talenel\'Elin, Heraldo de la Guerra. La época del Retorno, la Desolación, se acerca. Debemos prepararnos…" (ver texto completo en el libro pág. 26).',
    },
    {
      name: 'Kaiana',
      pronouns: 'ella',
      type: 'Tejedor de Luz (discípula de Ylt)',
      role: 'villain',
      traits: ['hábil', 'reticente a matar', 'leal a Ylt (por ahora)'],
      goal: 'Robar la hoja de Honor de Taln para Ylt.',
      appearance: 'Mujer reshi de pelo negro liso. Cara redonda con un glifo verde pintado. Lleva una capa marrón sobre un vestido verde.',
      notes: 'Usa Destello desorientador para escapar. Le disgusta la violencia innecesaria; la muerte de Taszo la perturba. Reaparece en capítulos posteriores.',
    },
    {
      name: 'Ylt',
      pronouns: 'él',
      type: 'Vigilante de la Verdad',
      role: 'villain',
      traits: ['carismático', 'manipulador', 'megalómano'],
      goal: 'Hacerse con la hoja de Honor de Taln y llevarse la gloria de proteger Roshar.',
      appearance: 'Iriali alto y escultural, piel dorada, larga túnica verde ondeante. Ojos que brillan en verde cuando usa sus poderes.',
      notes: 'Sirve (teóricamente) a la Heraldo Pailiah. Sus visiones proféticas han sido distorsionadas por su megalomanía. Primer antagonista principal de la campaña.',
    },
    {
      name: 'Veth',
      pronouns: 'él',
      type: 'guardia (Ojo de Pala)',
      role: 'villain',
      traits: ['fanático', 'silencioso', 'letal'],
      goal: 'Eliminar testigos del robo de la hoja.',
      appearance: 'Hombre alezi con la cabeza rapada. Mismo glifo verde en el rostro. Armado con espada.',
      notes: 'No se comunica. Lucha a muerte. Combate final del capítulo (ver Mapa 1.3). Tiene el glifo de Vigilante de la Verdad (Palah) tatuado en la muñeca.',
    },
    {
      name: 'Svalka',
      pronouns: 'ella',
      type: 'mercader',
      role: 'neutral',
      traits: ['afectuosa', 'ansiosa', 'generosa'],
      goal: 'Encontrar a su amigo Tet Rebin y asegurarse de que él y su hija estén a salvo.',
      appearance: 'Elegante thayleña con cejas blancas caídas. Carro marcado con un glifo azul brillante (carrete de hilo).',
      notes: 'Ofrece 50 marcos si el grupo salva a Rebin y Hana. Es la primera en preguntar por ellos.',
    },
    {
      name: 'Nen',
      pronouns: 'él',
      type: 'mercader',
      role: 'neutral',
      traits: ['optimista', 'parlanchín', 'hospitalario'],
      goal: 'Vender sus armas de asta a los campamentos de guerra.',
      appearance: 'Hombre alezi de pelo oscuro y ondulado. Inspeccionando sus armas cuando el grupo llega.',
      notes: 'Comparte cotilleos si los PJs responden con honestidad o superan Engaño CD 13.',
    },
    {
      name: 'Tet Rebin',
      pronouns: 'él',
      type: 'experto (mercader)',
      role: 'neutral',
      traits: ['terco', 'protector', 'exhausto'],
      goal: 'Salvar su carro de vino (el sustento de su familia) de quedar atascado.',
      appearance: 'Hombre veden pelirrojo con pelo escaso. Tira inútilmente de las cuerdas del chull.',
      notes: 'Defensa cognitiva 13, Defensa espiritual 13 para convencerle. Gasta 2 concentración para resistir argumentos. Cede si se argumenta la seguridad de Hana (ventaja en la prueba).',
    },
    {
      name: 'Hana',
      pronouns: 'ella',
      type: 'plebeya',
      role: 'neutral',
      traits: ['desesperada', 'valiente', 'joven'],
      goal: 'Conseguir ayuda para salvar a su padre y el carro familiar.',
      appearance: 'Adolescente, hija de Tet Rebin. Gesticula desesperadamente ante ambas caravanas.',
      notes: 'Guía al grupo hasta el carro atascado. Durante la emboscada, ella y Rebin se acobardan y los bandidos los ignoran.',
    },
  ],

  combats: [
    {
      id: 'emboscada-camino',
      title: 'Emboscada en el camino',
      mapRef: '1.1',
      enemies: [
        { name: 'Bandido', count: '4', bonus: 'Estándar' },
      ],
      specialRules: [
        'El charco de crem es terreno difícil. Cada movimiento en él requiere Agilidad CD 10 o el personaje queda Retenido.',
        'Carro y chull proporcionan cobertura. El chull se retira con Retraerse en cada turno si es liberado.',
        'Tras 3 rondas → Retirada coordinada (silbido de Kaiana).',
      ],
      duration: '3 rondas',
    },
    {
      id: 'emboscada-caravana',
      title: 'Emboscada en la caravana',
      mapRef: '1.2',
      enemies: [
        { name: 'Bandido', count: '6 (+2 si PJs están en la caravana)', bonus: 'Estándar' },
      ],
      specialRules: [
        'Los carros alrededor del campamento proporcionan cobertura (ver Mapa 1.2).',
        'Fardos de armas junto al carro de Nen: jabalina, lanza corta o lanza larga (acción Interactuar).',
        'No es necesario llevar cuenta de los bandidos y soldados del telón de fondo.',
        'Tras 3 rondas → Retirada coordinada.',
      ],
      duration: '3 rondas',
      rewards: 'Armas y 1d6 marcos por bandido. Uno lleva ganzúa. Uno lleva glifo Palah (Vigilante de la Verdad) tatuado en la muñeca.',
    },
    {
      id: 'batalla-veth',
      title: 'Batalla con Veth',
      mapRef: '1.3',
      enemies: [
        { name: 'Veth (Ojo de Pala)', count: '1', bonus: 'Lucha a muerte' },
      ],
      specialRules: [
        'Alta tormenta activa: al inicio de cada ronda, tirar en tabla Efectos de la alta tormenta.',
        'El macizo de roca cercano bloquea la mayor parte de la tormenta pero no toda.',
        'Seguir a Ylt y Kaiana hacia el interior de la tormenta es imposible sin sanación de luz tormentosa.',
        'Los cantores pueden cambiar de forma con su talento Cambiar de forma durante la alta tormenta.',
      ],
      rewards: 'Fin del capítulo. Taszo muere y Po\'ahu busca un nuevo portador entre los PJs.',
    },
  ],

  maps: [
    {
      id: '1.1',
      title: 'Carro atrapado en el crem',
      pdfPage: 29,
      imagePath: '/maps/map_p29.png',
      scale: '1 casilla = 1,5 m',
      locations: [
        'Carro de Tet Rebin (atascado)',
        'Chull (caído en ángulo)',
        'Charco de crem húmedo (terreno difícil)',
        'Sendero oeste hacia la Encrucijada',
        'Zona de emboscada de bandidos',
      ],
      notes: 'Mapa referenciado en las escenas "Atrapados en el crem" y "Emboscada en el camino".',
    },
    {
      id: '1.2',
      title: 'La caravana en la Encrucijada',
      pdfPage: 32,
      imagePath: '/maps/map_p32.png',
      scale: '1 casilla = 3 m',
      locations: [
        'Muro protector de la Piedra del Concilio (norte)',
        'Carruaje de Taln (barras en ventanas)',
        'Carreta cerrada con llave y encadenada (hoja esquirlada)',
        'Campamento de la casa Kholin (10 carros, compañía de 100 soldados)',
        'Caravana de mercaderes (4 carros: Svalka + Nen)',
        'Refugio improvisado alezi',
        'Muralla de tormenta (aproximándose desde el oeste)',
        'Fardos de armas junto al carro de Nen',
      ],
      notes: 'Mapa principal del capítulo. Válido para "Emboscada en la caravana".',
    },
    {
      id: '1.3',
      title: 'Batalla con Veth',
      pdfPage: 34,
      imagePath: '/maps/map_p34.png',
      scale: '1 casilla = 1,5 m',
      locations: [
        'Pared de la formación rocosa (cobertura, este)',
        'Zona de combate (exterior, dentro de la tormenta)',
        'Taszo caído (con daga en el costado)',
        'Dirección de huida de Ylt y Kaiana (interior de la tormenta, oeste)',
      ],
      notes: 'Combate final del capítulo bajo efectos de alta tormenta. Seguir a Ylt es imposible sin curación.',
    },
  ],
}

// ── Chapter 2 ─────────────────────────────────────────────────

const CHAPTER_2: AdventureChapter = {
  id: 'cap2',
  number: 2,
  title: 'Tras la pista de Doliente',
  pdfPages: { from: 39, to: 60 },
  levelFrom: 2,
  levelTo: 3,
  summary: 'Los PJs llegan a los campamentos de guerra alezi en las Llanuras Quebradas. Exploran libremente seis escenas en el campamento de los Kholin buscando a Liss, una informante alezi de los chamanes de piedra. Tras reunir suficientes indicios, encuentran a Liss en la panadería Horno de Crem, donde Po\'ahu por primera vez toma forma física. El capítulo culmina con la infiltración en el monasterio Kholin para hablar con Taln, que les revela que su hoja de Honor está en Rathalas.',
  background: 'Las Llanuras Quebradas son el frente de la guerra alezi contra los parshendi. El campamento de guerra Kholin, en uno de los cráteres, es el destino del grupo. Liss es la contacto alezi de los chamanes de piedra, pero localizarla requiere investigar el mundo criminal y social del campamento. Taln lleva meses encerrado en el monasterio Kholin, tratado como un lunático. El brillante señor Amaram, de los Hijos de Honor, vigila cualquier pista sobre los Radiantes.',
  prepChecklist: [
    'Priorizar las escenas que aborden los trasfondos y caminos heroicos de cada PJ.',
    '"Ojos de Doliente" (Vedolin) no debería ser la primera escena — requiere reputación previa.',
    'Cada escena otorga un indicio o un favor; anotar cuáles consigue el grupo.',
    'El grupo necesita al menos 3 indicios para encontrar a Liss en el Horno de Crem.',
    'Taln puede responder preguntas, pero su condición es inestable — preparar sus respuestas clave.',
    'Amaram confronta al grupo al final; preparar sus motivaciones y oferta a los Hijos de Honor.',
  ],
  progressionItems: [
    { type: 'key', text: 'Los PJs suben al nivel 3 tras hablar con Taln y conocer el destino de la hoja.' },
    { type: 'spren', text: 'Spren atraídos si un PJ protege a Calinai frente a soldados alezi en los abismos.' },
    { type: 'spren', text: 'Spren atraídos si un PJ ayuda desinteresadamente a Bettani o Ryvlk.' },
    { type: 'spren', text: 'Spren atraídos si un PJ visita el Devotario y demuestra interés genuino en los Heraldos.' },
    { type: 'info', text: 'PJs con metas sobre Heraldos/Radiantes: Shansan y Kalay en el Devotario, y la conversación con Taln ofrecen información clave.' },
  ],

  scenes: [
    {
      id: 'llegada-campamentos',
      title: 'Un respiro en las Llanuras Quebradas',
      type: 'narrative',
      readAloud: 'Con silenciosa determinación, la caravana avanza a través de las Montañas Irreclamadas hacia las Llanuras Quebradas. Aquí, profundos abismos surcan la tierra, rompiendo el terreno en una interminable extensión de áridas mesetas.\n\nAvanzáis hacia vuestro destino en el extremo occidental de las llanuras: diez enormes cráteres, cada uno de ellos ocupado por un campamento de guerra desde el cual los alezi libran la guerra contra los parshendi. Más al oeste, una pequeña ciudad de tiendas de campaña y búnkeres se asienta bajo estandartes azules: el campamento de guerra de la casa Kholin.',
      content: [
        'El campamento de guerra Kholin ocupa un gran cráter. Sus instalaciones principales incluyen el Complejo Central Kholin, el Complejo del Templo (con monasterio), La Lonja de Lanzas, El Chull Gruñón (taberna), Los Talleres Azules, el Búnker de Bettani y el Cuartel del Sargento Ellar.',
        'El grupo tiene libertad para explorar en cualquier orden. Los personajes con metas sobre los Heraldos, hojas de Honor o Radiantes podrán progresar visitando el Devotario de la Mente, hablando con Liss o con Taln.',
        'INDICIOS Y FAVORES: Cada escena puede otorgar un indicio (pista para localizar a Liss) o un favor (aliado que puede ayudarles al final del capítulo). Los jugadores deben anotar a cada persona cuyo favor consigan.',
      ],
      tips: [
        'La tabla "Escenas del campamento de guerra" (pág. 43) resume los seis ganchos activos y pasivos de cada escena.',
        'El grupo necesita al menos 3 indicios para encontrar a Liss. Con más indicios, la conversación con Liss es más fluida.',
      ],
    },
    {
      id: 'abismos',
      title: 'Ofensiva en los abismos',
      type: 'combat',
      content: [
        'El sargento Ellar recluta voluntarios para una expedición que busca exploradores parshendi desaparecidos en los abismos cercanos al campamento.',
        'En los abismos, el grupo encuentra a Calinai (cantor en forma diestra, ella) con tres cantores en forma de guerra. Busca el cuerpo de su hermana caída, que portaba un brazalete con glifos de los Escultores de Voluntad.',
        'Los cantores están preparados para luchar, pero Calinai prefiere negociar si el grupo no ataca. Si los PJs ayudan a recuperar el cuerpo y el brazalete, Calinai comparte un indicio sobre Liss como agradecimiento.',
        'GANCHO ACTIVO: Los PJs piden ayuda a Bordin sobre Liss o los glifos; Bordin pide primero que le ayuden con Ellar.',
        'GANCHO PASIVO: Bordin busca directamente a los PJs para ofrecerles el trabajo.',
      ],
      tips: [
        'Si los PJs atacan inmediatamente, los cantores de guerra luchan en defensa propia.',
        'El brazalete con glifos de los Escultores de Voluntad puede ser una pista relevante para PJs interesados en los Radiantes.',
        'Éxito otorga: indicio sobre Liss + favor de Bordin/Ellar.',
      ],
    },
    {
      id: 'esferas-culpables',
      title: 'Esferas culpables',
      type: 'social',
      readAloud: 'En el campamento de guerra Aladar, un cartel pintado a mano cuelga sobre una entrada discreta: "El Rocabrote Rojo". El interior huele a tabaco y bebida. Mesas de cartas llenan la sala; soldados y mercaderes intercambian esferas y secretos con igual soltura.',
      content: [
        'El Rocabrote Rojo es un antro de juego en el campamento de guerra Aladar, el mejor lugar para información clandestina.',
        'El "visón" (propietario, él) dirige una partida de cartas. Los PJs pueden jugar o buscar información de otras formas.',
        'CÓMO JUGAR AL JUEGO: Estrategias posibles — Jugar según reglas (Deducción CD 13), Engañar a jugadores (Engaño CD 13), Leer expresiones (Perspicacia CD 13). Los personajes que no juegan pueden ayudar en silencio; si fallan, dos guardias los expulsan.',
        'El "visón" escucha y observa con cuidado, buscando información para chantajes. Compartir información verdadera puede despertar su interés.',
        'GANCHO ACTIVO: Buscar información clandestina conduce al Rocabrote Rojo. GANCHO PASIVO: Tras completar dos escenas, el grupo recibe una invitación.',
      ],
      tips: [
        'Éxito otorga: indicio sobre Liss + acceso a esferas del mercado negro.',
        'El "visón" puede convertirse en aliado si el grupo gana su respeto.',
      ],
    },
    {
      id: 'devotario',
      title: 'Devotario de la mente',
      type: 'social',
      readAloud: 'Las indicaciones os conducen a un pequeño templo construido en la pared de un búnker militar. En su interior, un santuario dedicado a los diez Heraldos domina la única estancia, y los estantes rebosan de textos y tablillas religiosas.\n\nUn par de fervorosos trabajan con esmero; en un escritorio y en el santuario. Tienen la cabeza rapada y visten túnicas grises. Le fervorose del escritorio, une erudite delgade con gafas, levanta la vista de su escritura y entrecierra los ojos.\n\n"¿Sois vosotros, verdad? ¿Los que viajaban con el sargento Ellar?"',
      content: [
        'Shansan (fervorose erudito, elle) y Kalay (fervorosa devota, ella) atienden el Devotario de la Mente en el Complejo del Templo.',
        'Shansan está interesado en los Caballeros Radiantes desde un punto de vista académico. Kalay es más conservadora y se alarma ante cualquier mención de spren inusuales.',
        'Si el grupo muestra y describe la piedra de Taszo, Kalay pide que se marchen inmediatamente (preocupada por los spren extraños).',
        'Los fervorosos ofrecen un favor si el grupo les ayuda a localizar a unos bandidos que están robando suministros religiosos.',
        'GANCHO ACTIVO: Los PJs buscan información sobre glifos o los Radiantes. GANCHO PASIVO: Soldados de Bordin y Ellar dirigen al grupo al Devotario.',
      ],
      tips: [
        'Impresionar a Shansan: interés en los Caballeros Radiantes. Impresionar a Kalay: condena de los Radiantes (contradictorio con Shansan).',
        'Éxito otorga: indicio sobre Liss + favor de los fervorosos.',
        'Shansan puede proporcionar información sobre las Órdenes Radiantes si se le pregunta correctamente.',
      ],
    },
    {
      id: 'animales',
      title: 'Animales amenazantes',
      type: 'combat',
      content: [
        'Ryvlk (thayleño, él) tiene una caseta de fieras ambulante con animales exóticos, incluyendo pollos shin (la mayoría teñidos), un pajarito cantor de Shinovar y un ganso de los Picos Comecuernos.',
        'Ryvlk obtuvo el pájaro cantor de forma dudosa (mintió sobre ganarlo en un juego, en realidad se lo robó a Liss). Perspicacia CD 8 para detectar el engaño; si se le descubre, ofrece el segundo indicio.',
        'COMBATE: Dos espinablancas jóvenes escapan de sus jaulas y atacan al grupo y a civiles cercanos.',
        'GANCHO ACTIVO: Búsqueda de información por canales no oficiales. GANCHO PASIVO: Alboroto por los animales sueltos llama la atención del grupo.',
      ],
      tips: [
        'Los espinablancas jóvenes escapan hacia las Llanuras si los PJs son abatidos (no matan al grupo).',
        'Recompensa por ayudar: 50 marcos + favor. Si capturan un espinablanca vivo: cachorro de sabueso-hacha.',
        'Éxito otorga: indicio sobre Liss + favor de Ryvlk.',
      ],
    },
    {
      id: 'bettani',
      title: 'Búnker de Bettani',
      type: 'exploration',
      content: [
        'Bettani (mercader, ella) necesita que alguien repare sus vinculacañas fabriales o entregue piezas de repuesto en el Mercado de Sebarial.',
        'EMPEÑO DE HABILIDAD: 4 éxitos antes de 3 fallos. Opciones: Manufactura de fabriales (CD 12), Saber (CD 14), Comercio (CD 12), Persuasión (CD 12 para conseguir piezas de otros comerciantes).',
        'El búnker de Bettani o el mercado de Sebarial tienen piezas de repuesto para fabricar nuevas vinculacañas (Oportunidad).',
        'GANCHO ACTIVO/PASIVO: Bordin conoce a Bettani y puede introducir al grupo.',
      ],
      tips: [
        'Éxito otorga: favor de Bettani + acceso a su red de mercaderes.',
        'Oportunidad: piezas suficientes para un nuevo par de vinculacañas. Complicación: mensajero rival llega primero al mercado de Sebarial.',
      ],
    },
    {
      id: 'vedolin',
      title: 'Ojos de Doliente',
      type: 'exploration',
      content: [
        'Vedolin (receptor clandestino de mercancías robadas, él) tiene información directa sobre Liss. Localizarlo requiere rastrear rumores por el campamento.',
        'PERSECUCIÓN: Cuando Vedolin detecta que lo buscan, huye por los mercados y tejados del campamento. Empeño de persecución: 4 éxitos antes de 3 fallos.',
        'Enfrentarse a la multitud: Agilidad (contra su +2 Agilidad) o Liderazgo (contra su +3 Persuasión). Escalar tejados: Percepción (contra +1 Sigilo) o Atletismo (contra +2 Agilidad). Buscar atajos: Deducción (contra +2 Supervivencia).',
        'Esta escena NO debería ser la primera del capítulo — requiere que el grupo ya tenga cierta reputación en los campamentos.',
        'GANCHO ACTIVO: Buscar canales no oficiales lleva a oír el nombre de Vedolin. GANCHO PASIVO: Vedolin se acerca al grupo tras escuchar que preguntan por Liss.',
      ],
      tips: [
        'Si capturan a Vedolin: indicio directo + posible favor si el grupo negocia con él.',
        'Vedolin conoce la ubicación exacta del Horno de Crem.',
      ],
    },
    {
      id: 'contacto',
      title: 'El contacto: Liss',
      type: 'social',
      readAloud: 'La panadería es un edificio de piedra ruinoso, aún cubierto de crem húmedo en su lado de guardatormenta. Una chimenea expulsa humo denso desde el lado de sotavento, y el cálido resplandor del fuego emana de las ventanas abiertas.\n\nEn el interior, una mujer morena y corpulenta os observa con atención. Lleva un vestido negro, joyas con esmeraldas y unas botas modernas pero prácticas. Agarrando con calma un cuchillo de pan, grita:\n\n"Así que por fin habéis venido."',
      content: [
        'Liss (informante alezi, ella) opera desde la panadería Horno de Crem en el Mercado Exterior. Los PJs necesitan al menos 3 indicios para encontrarla.',
        'Liss conoce la misión de los chamanes de piedra y puede proporcionar información sobre la hoja de Honor y Taln.',
        'REVELACIÓN DE PO\'AHU: Cuando los PJs están listos para hablar sobre los próximos pasos, la piedra de Taszo cae por sí sola y se hace añicos. Po\'ahu emerge: una diminuta mujer hecha de piedra. Habla con voz que resuena como grava.',
        'Po\'ahu confirma que Taln (el Heraldo) puede sentir la hoja de Honor y guiar al grupo hasta ella. El problema: Taln está retenido en el monasterio Kholin, tratado como un lunático.',
        'Liss se niega a acompañar al grupo al monasterio — los chamanes no le pagaron lo suficiente para ese riesgo.',
      ],
      tips: [
        'Este es el punto de inflexión del capítulo: de sandbox a objetivo claro.',
        'Con más indicios, Liss confía más rápido y comparte información adicional sobre Amaram y los Hijos de Honor.',
        'Po\'ahu puede responder preguntas básicas sobre la misión pero tiene conocimiento limitado.',
      ],
    },
    {
      id: 'confrontacion',
      title: 'Confrontación',
      type: 'combat',
      readAloud: '"¡Eh, vosotros!"\n\nUn soldado grita mientras regresáis a los campamentos. A pesar de su impecable uniforme, tiene una mirada salvaje. Está rodeado por una escuadra de cuatro hombres armados, todos vestidos con los uniformes de color verde bosque de la casa Sadeas.',
      content: [
        'Tras salir del Horno de Crem, una escuadra de soldados Sadeas confronta al grupo buscando problemas.',
        'Los PJs pueden convencerles de que no representan una amenaza (Persuasión CD 12), o pueden combatir.',
        'Si los PJs ya tienen favores de aliados del campamento, pueden invocarlos aquí para que intercedan.',
      ],
      tips: [
        'Este combate es opcional — se puede evitar con persuasión o usando favores acumulados.',
        'Si el grupo lucha, los soldados Sadeas ceden si uno queda incapacitado.',
      ],
    },
    {
      id: 'heraldo-guerra',
      title: 'Heraldo de la guerra',
      type: 'choice',
      content: [
        'El grupo debe infiltrarse en el monasterio Kholin (Mapa 2.3) para llegar a Taln.',
        'ENTRADA AL COMPLEJO: El complejo del templo está al noreste del campamento. Opciones: convencer a los guardias (Persuasión CD 12), escalar las murallas (Atletismo CD 14).',
        'FERVOROSOS DE GUARDIA: Dentro del monasterio, los fervorosos atienden a los pacientes. Opciones: convencer (Engaño o Persuasión CD 12), escabullirse (Sigilo CD 14), encontrar entrada secreta (Deducción CD 15). Los cantores sin armas tienen ventaja.',
        'TALN: Está en una celda oscura. Al principio solo balbucea, pero si el grupo usa los favores que ha acumulado o presenta información relevante, Taln lucidez brevemente y puede responder preguntas.',
        'Taln puede sentir el vínculo con su hoja de Honor: está en Rathalathar (Rathalas).',
        'AMARAM: El brillante señor Meridas Amaram (Portador de esquirlada duelista) confronta al grupo al salir. Prefiere no hacer una escena. Pregunta qué saben sobre los Radiantes Perdidos. Si comparten información, hace una oferta: "Si me traéis más información, quizá haya un lugar para vosotros entre los Hijos de Honor".',
      ],
      tips: [
        'Taln habla más si el grupo le pregunta sobre la hoja, los Portadores del Vacío o Shinovar.',
        'Amaram es un antagonista a largo plazo — la oferta es genuina pero peligrosa.',
        'El grupo sube al nivel 3 tras esta escena.',
      ],
      branches: [
        {
          label: 'Aceptar la oferta de Amaram',
          description: 'Amaram les proporciona recursos e información. Los PJs quedan en deuda con los Hijos de Honor — consecuencias en capítulos futuros.',
        },
        {
          label: 'Rechazar o engañar a Amaram',
          description: 'Amaram se muestra escéptico pero no actúa todavía. Los PJs quedan marcados como personas de interés para los Hijos de Honor.',
        },
      ],
    },
  ],

  npcs: [
    {
      name: 'Ellar',
      pronouns: 'él',
      type: 'guardia',
      role: 'neutral',
      traits: ['beligerante', 'oportunista', 'pragmático'],
      goal: 'Conseguir voluntarios para la expedición en los abismos y mantener el orden en el campamento.',
      appearance: 'Sargento alezi con pelo rapado. Regresa del capítulo 1 con mayor autoridad en el campamento Kholin.',
      notes: 'Puede convertirse en aliado si el grupo le ayuda en los abismos. Favor: facilita acceso a zonas restringidas del campamento.',
    },
    {
      name: 'Bordin',
      pronouns: 'él',
      type: 'guardia',
      role: 'ally',
      traits: ['leal', 'pragmático', 'discreto'],
      goal: 'Proteger los intereses de la casa Kholin en el campamento de guerra.',
      appearance: 'Humano alezi inofensivo, ojos oscuros, pelo oscuro y corto. Regresa del capítulo 1.',
      notes: 'Conoce el campamento bien. Puede presentar al grupo con Bettani y el Devotario. Favor: acceso al Complejo del Templo.',
    },
    {
      name: 'Calinai',
      pronouns: 'ella',
      type: 'cantor (forma diestra)',
      role: 'neutral',
      traits: ['decidida', 'leal a su familia', 'desconfiada de los humanos'],
      goal: 'Recuperar el cuerpo de su hermana caída y un brazalete familiar con glifos de los Escultores de Voluntad.',
      appearance: 'Cantor en forma diestra. Acompañada de tres cantores en forma de guerra. Cautelosa y lista para luchar.',
      notes: 'No es enemiga por defecto. Si el grupo la ayuda, es una aliada sorprendente. El brazalete con glifos Escultores de Voluntad puede ser relevante para PJs que investigan los Radiantes.',
    },
    {
      name: 'Ka',
      pronouns: 'él',
      type: 'tabernero',
      role: 'neutral',
      traits: ['observador', 'reservado', 'curioso'],
      goal: 'Gestionar el Chull Gruñón y mantener la paz entre soldados de distintos ejércitos.',
      appearance: 'Humano de complexión fuerte, delantal manchado de bebida. Siempre detrás de la barra.',
      notes: 'El Chull Gruñón es el mejor lugar para escuchar cotilleos del campamento. Ka escucha más de lo que habla.',
    },
    {
      name: 'Yarren',
      pronouns: 'él',
      type: 'mercader',
      role: 'neutral',
      traits: ['comerciante astuto', 'cordial', 'informado'],
      goal: 'Vender equipamiento militar y armas en la Lonja de Lanzas.',
      appearance: 'Hombre alezi de mediana edad, siempre contando esferas.',
      notes: 'Puede proporcionar información sobre movimientos de mercancías y personas en el campamento.',
    },
    {
      name: 'Ishali',
      pronouns: 'ella',
      type: 'artesana',
      role: 'neutral',
      traits: ['perfeccionista', 'orgullosa de su trabajo', 'directa'],
      goal: 'Mantener los Talleres Azules como el mejor taller de reparaciones del campamento.',
      appearance: 'Mujer alezi con las manos manchadas de aceite de fabrial.',
      notes: 'Conoce a Bettani. Puede proporcionar herramientas o información sobre fabriales.',
    },
    {
      name: 'El "visón"',
      pronouns: 'él',
      type: 'experto (operador del antro)',
      role: 'neutral',
      traits: ['calculador', 'observador', 'amoral'],
      goal: 'Recopilar información valiosa y mantener el Rocabrote Rojo como negocio rentable.',
      appearance: 'Hombre de edad indefinida, ojos pequeños y astutos. Siempre con una copa en la mano pero nunca parece beber.',
      notes: 'Busca información para chantajes. Puede convertirse en aliado si el grupo gana su respeto o le ofrece información de valor equivalente.',
    },
    {
      name: 'Shansan',
      pronouns: 'elle',
      type: 'fervorose (erudito)',
      role: 'ally',
      traits: ['académico', 'curioso', 'abierto de mente'],
      goal: 'Estudiar los textos sagrados y la historia de los Caballeros Radiantes.',
      appearance: 'Persona de complexión delgada, gafas, cabeza rapada, túnica gris. Siempre con tinta en los dedos.',
      notes: 'Comparte información sobre las Órdenes Radiantes con quien muestre interés genuino. Recompensa: favor + posible indicio sobre Liss.',
    },
    {
      name: 'Kalay',
      pronouns: 'ella',
      type: 'fervorosa (devota)',
      role: 'neutral',
      traits: ['ortodoxa', 'protectora', 'cautelosa'],
      goal: 'Mantener la fe y el orden en el Devotario de la Mente.',
      appearance: 'Mujer de mediana edad, cabeza rapada, túnica gris impecable. Mirada seria.',
      notes: 'Se alarma ante spren inusuales o mención de los Radiantes con demasiado entusiasmo. Pide al grupo que se marche si muestran la piedra de Taszo.',
    },
    {
      name: 'Ryvlk',
      pronouns: 'él',
      type: 'experto (tratante de animales)',
      role: 'neutral',
      traits: ['engreído', 'charlatán', 'en el fondo amable'],
      goal: 'Vender sus animales exóticos a precios exorbitantes.',
      appearance: 'Thayleño corpulento, ropa colorida, siempre gesticulando. Rodeado de jaulas de animales.',
      notes: 'Mintió sobre cómo obtuvo el pájaro cantor shin (se lo robó a Liss). Perspicacia CD 8 para descubrirlo. Si se le confronta, ofrece un indicio como compensación.',
    },
    {
      name: 'Bettani',
      pronouns: 'ella',
      type: 'mercader',
      role: 'neutral',
      traits: ['práctica', 'exigente', 'fiable'],
      goal: 'Mantener sus vinculacañas en funcionamiento para gestionar su negocio.',
      appearance: 'Mujer alezi de mediana edad, vestimenta de trabajo, siempre con una lista de tareas en la mano.',
      notes: 'Su búnker es un buen punto de referencia en el campamento. Favor: acceso a piezas de fabrial y contactos mercantiles.',
    },
    {
      name: 'Vedolin',
      pronouns: 'él',
      type: 'experto (receptor clandestino)',
      role: 'neutral',
      traits: ['evasivo', 'nervioso', 'informado'],
      goal: 'Evitar que lo capturen y mantener su red de contactos clandestina.',
      appearance: 'Hombre de aspecto anodino, ropa gris. Siempre mirando por encima del hombro.',
      notes: 'Conoce la ubicación del Horno de Crem y tiene información directa sobre Liss. No debería ser el primer PNJ contactado.',
    },
    {
      name: 'Liss',
      pronouns: 'ella',
      type: 'informante',
      role: 'ally',
      traits: ['pragmática', 'directa', 'calculadora'],
      goal: 'Cumplir su contrato con los chamanes de piedra y cobrar — sin arriesgar más de lo acordado.',
      appearance: 'Mujer morena y corpulenta, vestido negro, joyas con esmeraldas, botas prácticas. Sostiene un cuchillo de pan con calma.',
      notes: 'Opera desde la panadería Horno de Crem. Se niega a entrar al monasterio. Clave para conectar al grupo con Taln.',
    },
    {
      name: 'Po\'ahu',
      pronouns: 'ella',
      type: 'cumbrespren',
      role: 'special',
      traits: ['sabia', 'enigmática', 'críptica'],
      goal: 'Ayudar al portador a proteger Roshar, cumpliendo la misión de Taszo.',
      appearance: 'Diminuta mujer hecha completamente de piedra. Habla con voz que resuena como grava. Estaba oculta en la piedra de Taszo.',
      notes: 'Se revela por primera vez en el Horno de Crem. Puede vincularse con el Custodio de la Piedra. Conocimiento limitado pero perspectiva única sobre los Heraldos.',
    },
    {
      name: 'Taln (Talenel\'Elin)',
      pronouns: 'él',
      type: 'heraldo',
      role: 'special',
      traits: ['traumatizado', 'inestable', 'lúcido en momentos clave'],
      goal: 'Advertir a Roshar de la Desolación y recuperar su hoja de Honor.',
      appearance: 'Hombre makabaki alto y musculoso. Ojos oscuros y cansados. Encerrado en una celda del monasterio Kholin.',
      notes: 'Puede sentir el vínculo con su hoja: está en Rathalathar (Rathalas). La información clave del capítulo. Responde mejor si el grupo usa favores acumulados o presenta información relevante.',
    },
    {
      name: 'Meridas Amaram',
      pronouns: 'él',
      type: 'Portador de esquirlada (brillante señor)',
      role: 'villain',
      traits: ['carismático', 'calculador', 'patriota fanático'],
      goal: 'Recopilar información sobre los Radiantes Perdidos para los Hijos de Honor.',
      appearance: 'Hombre alezi alto y bien parecido. Uniforme impecable. Lleva una hoja esquirlada en el costado.',
      notes: 'Antagonista a largo plazo. No actúa violentamente ahora — prefiere vigilar. Su oferta de unirse a los Hijos de Honor es genuina pero peligrosa para los PJs.',
    },
  ],

  combats: [
    {
      id: 'abismos-cantores',
      title: 'Cantores en los abismos',
      mapRef: '2.1',
      enemies: [
        { name: 'Calinai (cantor diestra)', count: '1', bonus: 'Solo si el grupo ataca primero' },
        { name: 'Cantores de guerra', count: '3' },
      ],
      specialRules: [
        'Este combate es OPCIONAL — Calinai prefiere negociar si el grupo no es agresivo.',
        'Los cantores defienden el cuerpo de la hermana de Calinai; no atacan sin provocación.',
        'Si el grupo ayuda a recuperar el cuerpo, Calinai se convierte en aliada y comparte un indicio.',
        'Los abismos son terreno difícil; moverse sin una prueba de Atletismo CD 10 requiere acción adicional.',
      ],
      rewards: 'Indicio sobre Liss + favor de Bordin.',
    },
    {
      id: 'espinablancas',
      title: 'Espinablancas sueltas',
      mapRef: '2.1',
      enemies: [
        { name: 'Espinablanca joven', count: '2' },
      ],
      specialRules: [
        'Las espinablancas escaparon de las jaulas de Ryvlk y atacan a civiles cercanos.',
        'Si los PJs son abatidos, las espinablancas huyen a las Llanuras Quebradas sin rematar al grupo.',
        'Capturar un espinablanca vivo (en lugar de matarlo) otorga recompensa adicional.',
      ],
      rewards: '50 marcos + favor de Ryvlk. Si capturan uno vivo: cachorro de sabueso-hacha.',
    },
    {
      id: 'soldados-sadeas',
      title: 'Confrontación con soldados Sadeas',
      enemies: [
        { name: 'Soldado Sadeas', count: '4' },
      ],
      specialRules: [
        'Combate OPCIONAL — se puede evitar con Persuasión CD 12 o invocando favores de aliados.',
        'Los soldados ceden si uno de ellos queda incapacitado.',
        'No hay recompensa directa, pero evitar el combate puede preservar favores para el encuentro con Amaram.',
      ],
      duration: 'Hasta rendición o persuasión exitosa',
    },
  ],

  maps: [
    {
      id: '2.1',
      title: 'Campamento de guerra de los Kholin',
      pdfPage: 41,
      imagePath: '/maps/map_p41.png',
      scale: 'Vista general (sin escala por casillas)',
      locations: [
        'El Chull Gruñón (taberna)',
        'Búnker de Bettani',
        'La Lonja de Lanzas',
        'Los Talleres Azules',
        'Devotario de la Mente',
        'Cuartel del Sargento Ellar',
        'Complejo del Templo',
        'Talleres de Construcción',
        'Zona de Preparación',
        'Zona de Atención Médica',
        'Tiendas de Reclutamiento',
        'Complejo Central Kholin',
      ],
      notes: 'Mapa general del campamento de guerra. Referencia para todas las escenas del capítulo.',
    },
    {
      id: '2.2',
      title: 'El complejo del templo',
      pdfPage: 57,
      imagePath: '/maps/map_p57.png',
      scale: 'Vista general',
      locations: [
        'Templo principal',
        'Monasterio (noreste)',
        'Aposentos de los fervorosos',
        'Almacenes (×2)',
        'Puesto de guardia',
        'Complejo de entrenamiento',
      ],
      notes: 'Área donde se ubica el monasterio que aloja a Taln. Usar en escena "Heraldo de la guerra".',
    },
    {
      id: '2.3',
      title: 'Interior del monasterio',
      pdfPage: 59,
      imagePath: '/maps/map_p59.png',
      scale: '1 casilla = 1,5 m',
      locations: [
        'Celda de Taln',
        'Otras celdas',
        'Recepción y triaje',
        'Sala de espera',
        'Sala de registros',
        'Oficina principal',
        'Aposentos de los fervorosos',
      ],
      notes: 'Mapa táctico para la infiltración al monasterio. Usar para el encuentro con Taln y la confrontación con Amaram.',
    },
  ],
}

// ── Chapter 3 ─────────────────────────────────────────────────

const CHAPTER_3: AdventureChapter = {
  id: 'cap3',
  number: 3,
  title: 'La ciudad quemada',
  pdfPages: { from: 61, to: 80 },
  levelFrom: 3,
  levelTo: 4,
  summary: 'Los PJs viajan a Rathalas, una ciudad quemada en las profundidades de un cañón, donde la hoja de Honor de Taln está custodiada por El Resto Gris: un ejército de bandidos sin lealtades. Para recuperarla deberán infiltrarse en la ciudad, negociar alianzas con los prisioneros Kaiana y Teryn, y enfrentarse al traicionero Ylt en una batalla sobre una plataforma en llamas.',
  background: 'Rathalas fue destruida hace años y ahora la ocupa El Resto Gris, una banda de refugiados y mercenarios liderada por El Resto Gris (el individuo). Ylt ha llegado antes que los PJs y ha convencido al líder de que la hoja de Honor es demasiado peligrosa para venderla. Kaiana y Teryn están prisioneros en la cárcel de la ciudad. Axies el Coleccionista, un extranjero ashish, también investiga la ciudad por sus propias razones.',
  prepChecklist: [
    'Decidir si el grupo conoce ya a Kaiana (Ch.1) o es un encuentro nuevo.',
    'Preparar a Tuxli, el guardia de la prisión, como posible aliado o complicación.',
    'La plataforma del salón colapsa durante el combate con Ylt — preparar las fases de la batalla.',
    'Nadari y el devotario ofrecen información sobre la hoja de Honor si los PJs son respetuosos.',
    'El Resto Gris (individuo) puede negociarse — no es necesariamente un villano.',
  ],
  progressionItems: [
    { type: 'key', text: 'Los PJs suben al nivel 4 tras recuperar la hoja de Honor y derrotar a Ylt.' },
    { type: 'spren', text: 'Spren atraídos si un PJ libera a los prisioneros sin violencia.' },
    { type: 'spren', text: 'Spren atraídos si un PJ protege a Nadari o respeta el devotario.' },
    { type: 'spren', text: 'Spren atraídos si un PJ muestra compasión por los miembros de El Resto Gris.' },
    { type: 'info', text: 'PJs con metas sobre Ylt o los Ojos de Pala: esta es la confrontación directa con él.' },
  ],

  scenes: [
    {
      id: 'viaje-rathalas',
      title: 'Viaje a Rathalas',
      type: 'narrative',
      content: [
        'El grupo abandona las Llanuras Quebradas y viaja varios días hacia las Tierras del Interior, siguiendo las pistas obtenidas de Taln.',
        'El camino pasa por llanuras de piedra calcárrea y hondonadas de crem endurecido. El clima empeora y una tormenta menor obliga a buscar refugio.',
        'Durante el viaje pueden encontrar a Lorn, un veterano mercenario que conoce Rathalas y puede darles información valiosa sobre El Resto Gris.',
        'A medida que se acercan al cañón, el paisaje se vuelve más árido y el olor a ceniza antigua impregna el aire.',
      ],
      tips: [
        'Usar el viaje para consolidar los vínculos entre PJs y establecer sus objetivos personales en este capítulo.',
        'Lorn puede funcionar como guía, fuente de información o complicación, según cómo lo traten los PJs.',
        'Introducir rumores sobre El Resto Gris: leales entre sí, desconfiados de extraños, pero no crueles.',
      ],
    },
    {
      id: 'llegando-rathalas',
      title: 'Llegando a Rathalas',
      type: 'exploration',
      readAloud: 'El cañón se abre ante vosotros como una herida en la tierra. Las paredes de roca naranja y roja caen cientos de metros hasta un suelo de piedra quemada. Allí abajo, entre las ruinas de lo que fue una ciudad, veis movimiento. Fuegos encendidos. Vida.',
      content: [
        'El grupo debe descender al cañón. Hay varias rutas: caminos de cuerda y madera construidos por El Resto Gris (vigilados), rutas de escalada (peligrosas pero discretas), o presentarse abiertamente en el puesto de vigilancia.',
        'El cañón tiene una geografía compleja con zonas claramente identificadas: A1 el suelo del cañón, A2 puesto de vigilancia, A3 la pared del risco, A4 taller de carpintería, A5 el devotario, A6 laberinto de puentes, A7 la prisión, A8 el corazón de la fortaleza.',
        'Los PJs pueden explorar libremente las zonas de la ciudad. El nivel de alerta varía según sus acciones previas.',
      ],
      tips: [
        'La primera impresión de Rathalas debe ser de decadencia mezclada con resiliencia — no es un campo de bandidos caótico.',
        'El Resto Gris tiene sus propias reglas: no matar a quien se rinde, no robar a los suyos.',
      ],
    },
    {
      id: 'a1-suelo-canon',
      title: 'A1 — Suelo del cañón',
      type: 'combat',
      readAloud: 'El suelo del cañón es un laberinto de ruinas cubiertas de crem y ceniza. El viento sopla entre las paredes del barranco con un sonido que parece un lamento. No estáis solos.',
      content: [
        'Al descender al cañón los PJs se encuentran con khornaks: criaturas de las profundidades con aspecto de cangrejo gigante que han establecido su territorio en el suelo del cañón.',
        'El Resto Gris los tolera porque mantienen alejados a los intrusos, pero los khornaks no distinguen entre aliados y enemigos.',
        'El combate puede evitarse con sigilo suficiente o con conocimiento de su comportamiento (Naturaleza dificultad 14).',
      ],
      tips: [
        'Los khornaks retroceden si sufren bajas importantes — no luchan hasta la muerte.',
        'Miembros de El Resto Gris pueden observar desde las alturas, evaluando a los intrusos según cómo manejan la situación.',
      ],
    },
    {
      id: 'a2-puesto-vigilancia',
      title: 'A2 — Puesto de vigilancia',
      type: 'social',
      content: [
        'Un puesto de madera y cuerda construido en la pared del cañón. Dos o tres guardias de El Resto Gris vigilan los accesos principales.',
        'Si los PJs se acercan abiertamente, los guardias los detienen y piden explicaciones. Son desconfiados pero no agresivos por defecto.',
        'Con las palabras correctas (o un salvoconducto de Lorn si lo conocen) pueden obtener acceso al interior de la ciudad.',
        'Si los PJs intentan forzar el paso, se activa una alarma que pone en alerta a toda la ciudad.',
      ],
      tips: [
        'Los guardias respetan la fuerza pero también la honestidad. Mentiras elaboradas generan desconfianza.',
        'Mencionar que buscan la "reliquia shin" hace que los guardias se pongan nerviosos — Ylt ya ha dado órdenes al respecto.',
      ],
    },
    {
      id: 'a3-pared-risco',
      title: 'A3 — Pared del risco',
      type: 'exploration',
      content: [
        'La ruta alternativa al interior de la ciudad: una serie de salientes naturales y cuerdas antiguas que permiten bajar por la pared del cañón sin pasar por el puesto de vigilancia.',
        'Requiere tiradas de Atletismo (dificultad 13) para navegar los tramos más difíciles. Un fallo produce daño por caída o llama la atención de los guardias.',
        'A lo largo de la pared hay marcas antiguas de la ciudad original — graffiti alezi, símbolos de los Heraldos, fechas de la quema.',
      ],
    },
    {
      id: 'a4-taller-carpinteria',
      title: 'A4 — Taller de carpintería (Ubo)',
      type: 'social',
      content: [
        'Un taller activo en las ruinas de un edificio alezi. Ubo, un hombre mayor con manos callosas y una sonrisa amplia, dirige el lugar con su cuadrilla de carpinteros.',
        'Ubo construye y repara las estructuras de madera que mantienen unida la ciudad. Es respetado por todos en El Resto Gris.',
        'Si los PJs le ayudan con algún trabajo o le traen materiales escasos, Ubo se vuelve un aliado valioso: conoce los movimientos de Ylt, sabe dónde está la prisión, y puede facilitar el acceso a zonas restringidas.',
        'Ubo no apoya a Ylt pero tampoco lo confronta — prefiere mantener la paz en su comunidad.',
      ],
      tips: [
        'Ubo puede ser el punto de entrada más amigable a la red social de El Resto Gris.',
        'Si los PJs mencionan que quieren liberar a los prisioneros, Ubo frunce el ceño pero no los delata — los ayuda discretamente.',
      ],
    },
    {
      id: 'a5-devotario',
      title: 'A5 — El devotario (Nadari)',
      type: 'social',
      readAloud: 'Entre las ruinas de lo que fue un templo alezi, alguien ha construido un pequeño santuario. Velas encendidas, esferas apagadas en nichos de piedra, y una mujer rezando de rodillas ante un glifo de los Heraldos.',
      content: [
        'Nadari es una devota alezi que se unió a El Resto Gris tras perder su ciudad. Ha convertido las ruinas del antiguo templo en un lugar de culto funcional.',
        'Nadari sabe mucho sobre la hoja de Honor de Taln — ha investigado los registros históricos sobre ella y cree que es demasiado peligrosa para estar en manos de Ylt.',
        'Si los PJs demuestran respeto por los Heraldos y sus propósitos, Nadari los ayuda: tiene un mapa parcial de la fortaleza interior y conoce las rutinas de los guardias.',
        'También puede revelar que Ylt tiene planes de destruir la hoja en lugar de entregarla, si no puede controlar quién la posee.',
      ],
    },
    {
      id: 'a6-laberinto-puentes',
      title: 'A6 — Laberinto de puentes',
      type: 'exploration',
      content: [
        'Una red de puentes de cuerda y madera que conecta los distintos niveles y edificios de la ciudad. Es el sistema de transporte principal de El Resto Gris.',
        'Navegar el laberinto sin guía requiere tiradas de Percepción (dificultad 11). Los miembros de El Resto Gris se mueven por él con total confianza.',
        'Axies el Coleccionista puede encontrarse aquí, fascinado por el diseño de los puentes y tomando notas en su cuaderno. Es extravagante pero informativo.',
        'El laberinto también es útil tácticamente: un perseguidor que no lo conoce bien puede perder a los PJs fácilmente.',
      ],
    },
    {
      id: 'a7-prision',
      title: 'A7 — La prisión (Kaiana y Teryn)',
      type: 'social',
      readAloud: 'La prisión de Rathalas es un edificio de piedra medio derruido, reforzado con vigas de madera nueva. A la entrada, un guardia alto con expresión aburrida os mira acercarse.',
      content: [
        'La prisión alberga a Kaiana y a Teryn, dos personajes que los PJs pueden haber encontrado en el capítulo anterior.',
        'Tuxli es el guardia principal: un hombre pragmático que cumple órdenes pero no es leal fanático de Ylt. Con suficiente persuasión, soborno o amenaza puede mirar para otro lado.',
        'Kaiana, si fue antagonista en Cap.1, está dispuesta a aliarse temporalmente contra Ylt — ella también fue traicionada por él.',
        'Teryn tiene información sobre los planes de Ylt y sobre la ubicación exacta de la hoja de Honor dentro de la fortaleza.',
        'Liberar a los prisioneros sin causar alarma requiere planificación: convencer a Tuxli, distraer a los guardias, o encontrar una salida alternativa.',
      ],
      tips: [
        'La alianza con Kaiana es complicada — tiene sus propios objetivos y no es completamente de fiar.',
        'Teryn puede convertirse en un aliado genuino si los PJs demuestran que buscan proteger la hoja, no usarla.',
      ],
    },
    {
      id: 'a8-batalla-salon',
      title: 'A8 — El corazón de la fortaleza / La batalla del salón',
      type: 'combat',
      readAloud: 'El salón principal de la fortaleza es inmenso: columnas de piedra quemada sostienen un techo parcialmente derrumbado. En el centro, sobre una plataforma elevada de madera, Ylt sostiene la hoja de Honor. Os mira bajar y sonríe. "Llegáis tarde."',
      content: [
        'La confrontación final del capítulo. Ylt tiene la hoja de Honor y no tiene intención de entregarla.',
        'El combate tiene lugar en el salón principal, con la plataforma central como campo de batalla. La plataforma es estructuralmente inestable — el combate la dañará progresivamente.',
        'Al final del tercer round (o antes si los PJs lo fuerzan), la plataforma colapsa parcialmente. Todos en ella deben hacer tiradas de Atletismo para no caer.',
        'Ylt puede escapar si la situación se vuelve desesperada, dejando la hoja pero prometiendo que no ha terminado.',
        'Si los PJs recuperan la hoja, El Resto Gris (individuo) aparece al final y les permite marcharse — respeta que hayan ganado limpiamente.',
      ],
      tips: [
        'El colapso de la plataforma es el momento dramático central — preparar descripciones vívidas.',
        'La hoja de Honor es un arma de Honor vinculada a Taln. Un PJ que la toque siente un peso y una responsabilidad abrumadores.',
        'Ylt no es un fanático — si la situación es irrecuperable, huye. Esto lo establece como antagonista recurrente.',
      ],
    },
    {
      id: 'baja-rathalas',
      title: 'La Baja Rathalas y el templo de los Heraldos',
      type: 'exploration',
      content: [
        'Zona opcional en las profundidades del cañón, bajo la ciudad principal. Ruinas más antiguas que Rathalas misma, posiblemente de la Era del Amanecer.',
        'El templo contiene frescos de los Diez Heraldos en estado de conservación sorprendente, protegidos por la roca del cañón.',
        'Un PJ que investigue los frescos encuentra representaciones de Taln que coinciden con la descripción de la persona que conocieron en el monasterio Kholin.',
        'La zona es peligrosa estructuralmente — algunos pasajes están a punto de colapsar.',
      ],
      tips: [
        'Esta zona es opcional y recomendada para PJs con metas relacionadas con los Heraldos o la historia de las Desolaciones.',
      ],
    },
    {
      id: 'el-resto-gris',
      title: 'El Resto Gris',
      type: 'social',
      content: [
        'Tras la batalla del salón, si los PJs se han comportado con integridad, El Resto Gris (individuo) los convoca para una conversación final.',
        'El Resto Gris es un hombre tranquilo con cicatrices antiguas y ojos evaluadores. No da explicaciones sobre su nombre ni su pasado.',
        'Puede ofrecer a los PJs un salvoconducto por sus territorios, información sobre rutas hacia los chamanes de piedra, o simplemente su respeto.',
        'Si los PJs atacaron o traicionaron a su gente sin causa, la reunión termina en amenaza velada en lugar de acuerdo.',
      ],
      tips: [
        'El Resto Gris no es un aliado permanente, pero puede aparecer en capítulos futuros si los PJs construyeron una relación positiva.',
      ],
    },
  ],

  npcs: [
    {
      name: 'Lorn',
      pronouns: 'él',
      type: 'Mercenario veterano',
      role: 'ally',
      traits: ['Pragmático', 'Leal a quien paga bien', 'Conoce Rathalas'],
      goal: 'Sobrevivir y conseguir suficiente dinero para retirarse',
      appearance: 'Hombre de mediana edad con una cicatriz diagonal en la barbilla y ropa de cuero desgastada. Habla poco pero observa todo.',
      notes: 'Puede actuar como guía o informante. Si los PJs le pagan o le ayudan, los apoya activamente. No tiene lealtad a Ylt.',
    },
    {
      name: 'Ubo',
      pronouns: 'él',
      type: 'Carpintero / Miembro de El Resto Gris',
      role: 'ally',
      traits: ['Amigable', 'Trabajador', 'Pacificador'],
      goal: 'Mantener su comunidad unida y en paz',
      appearance: 'Hombre mayor, fornido, con las manos cubiertas de callos y polvo de madera. Sonrisa fácil y voz tranquila.',
      notes: 'Punto de entrada ideal a la red social de El Resto Gris. No denuncia a los PJs aunque sospeche sus planes.',
    },
    {
      name: 'Nadari',
      pronouns: 'ella',
      type: 'Devota de los Heraldos',
      role: 'ally',
      traits: ['Devota', 'Inteligente', 'Desconfiada de Ylt'],
      goal: 'Proteger la hoja de Honor de quienes la usarían para mal',
      appearance: 'Mujer alezi de unos cuarenta años, cabello oscuro recogido, ropas sencillas pero limpias. Lleva un glifo de Taln grabado en un colgante.',
      notes: 'Ayuda a los PJs si demuestran buenas intenciones respecto a la hoja de Honor. Tiene información clave sobre la fortaleza.',
    },
    {
      name: 'Kaiana',
      pronouns: 'ella',
      type: 'Discípula de Ylt / Prisionera',
      role: 'neutral',
      traits: ['Desconfiada', 'Hábil en combate', 'Traicionada por Ylt'],
      goal: 'Salir de la prisión y ajustar cuentas con Ylt',
      appearance: 'Mujer joven con expresión dura y ojos evaluadores. Lleva el pelo corto y muestra moratones recientes.',
      notes: 'Antagonista del Cap.1 reconvertida en aliada circunstancial. Útil en combate pero con agenda propia. No es completamente de fiar.',
    },
    {
      name: 'Teryn',
      pronouns: 'él',
      type: 'Prisionero / Informante',
      role: 'ally',
      traits: ['Asustado', 'Agradecido', 'Con información valiosa'],
      goal: 'Ser liberado y alejarse de Ylt para siempre',
      appearance: 'Hombre joven, delgado, con aspecto de haber pasado semanas sin comer bien. Ojos nerviosos que no dejan de moverse.',
      notes: 'Conoce la ubicación de la hoja de Honor y las rutinas de los guardias de Ylt. Se convierte en aliado genuino si los PJs lo protegen.',
    },
    {
      name: 'Axies el Coleccionista',
      pronouns: 'él',
      type: 'Viajero ashish / Investigador de spren',
      role: 'neutral',
      traits: ['Excéntrico', 'Curioso', 'Inofensivo'],
      goal: 'Documentar tantos tipos de spren como sea posible',
      appearance: 'Hombre alto de rasgos ashish, piel oscura azulada, con un cuaderno de notas siempre en mano. Habla con entusiasmo desmedido sobre los spren.',
      notes: 'No tiene nada que ver con el conflicto principal. Puede dar información útil sobre spren o sobre Rathalas si los PJs son amables con él.',
    },
    {
      name: 'Tuxli',
      pronouns: 'él',
      type: 'Guardia de la prisión',
      role: 'neutral',
      traits: ['Pragmático', 'Aburrido', 'No fanatizado'],
      goal: 'Hacer su trabajo y cobrar su parte',
      appearance: 'Hombre corpulento con expresión de eterno aburrimiento. Armadura de cuero, lanza apoyada en la pared.',
      notes: 'Puede ser convencido, sobornado o distraído. No morirá por Ylt. Mirar para otro lado es su respuesta favorita ante los problemas.',
    },
    {
      name: 'Ylt',
      pronouns: 'él',
      type: 'Vigilante de la Verdad de Iri / Antagonista',
      role: 'villain',
      traits: ['Carismático', 'Manipulador', 'Convencido de su propia justicia'],
      goal: 'Controlar o destruir la hoja de Honor para evitar que caiga en "manos equivocadas"',
      appearance: 'Hombre de mediana edad, porte aristocrático, ropas de viajero de calidad. Sonrisa que no llega a los ojos. Glifo tatuado en la muñeca izquierda.',
      notes: 'Antagonista principal de la aventura. Inteligente y peligroso. Huye antes de ser derrotado si puede — no es un mártir.',
    },
    {
      name: 'El Resto Gris',
      pronouns: 'él',
      type: 'Líder de la banda / Árbitro final',
      role: 'neutral',
      traits: ['Tranquilo', 'Justo a su manera', 'Imposible de intimidar'],
      goal: 'Proteger a su gente y mantener Rathalas como refugio',
      appearance: 'Hombre de edad indeterminada, cicatrices antiguas en manos y cuello, ojos grises que observan sin juzgar. Habla despacio.',
      notes: 'No es un villano. Su relación con los PJs al final del capítulo depende completamente de cómo se hayan comportado con su gente.',
    },
    {
      name: 'Código',
      pronouns: 'ella',
      type: 'Capitana de guardia de El Resto Gris',
      role: 'neutral',
      traits: ['Disciplinada', 'Directa', 'Protectora de la banda'],
      goal: 'Mantener el orden y proteger a El Resto Gris de amenazas',
      appearance: 'Mujer de complexión atlética, cabello cortado al ras, mirada de evaluación constante. Lleva espada corta y daga al cinto.',
      notes: 'Primera línea de contacto con El Resto Gris como organización. Más hostil que Ubo pero igualmente justa. Se convierte en aliada si los PJs demuestran honorabilidad.',
    },
  ],

  combats: [
    {
      id: 'combat-khornaks',
      title: 'Khornaks en el suelo del cañón',
      mapRef: 'map-3-2',
      enemies: [
        { name: 'Khornak adulto', count: '2', bonus: 'Caparazón duro (reducción de daño 2)' },
        { name: 'Khornak joven', count: '3' },
      ],
      specialRules: [
        'Los khornaks retroceden si sufren 3 o más bajas — no son suicidas.',
        'El terreno del suelo del cañón tiene zona de difícil movilidad: piedras irregulares y charcos de crem.',
        'Se puede evitar el combate completamente con sigilo (Destreza dificultad 13) o conocimiento de su comportamiento (Naturaleza 14).',
      ],
      duration: '3-4 rounds si se llega al combate',
      rewards: 'Acceso al interior de la ciudad sin pasar por el puesto de vigilancia. Posible observación de miembros de El Resto Gris.',
    },
    {
      id: 'combat-bandidos-alerta',
      title: 'Bandidos en estado de alerta',
      enemies: [
        { name: 'Guardia de El Resto Gris', count: '4', bonus: 'Conocen el terreno (ventaja en maniobras de posicionamiento)' },
        { name: 'Jefe de guardia', count: '1', bonus: 'Mejor armadura y arma' },
      ],
      specialRules: [
        'Este combate solo ocurre si los PJs activan la alarma o atacan a los guardias sin justificación.',
        'Los guardias buscan incapacitar, no matar — a menos que los PJs hayan matado a alguno de los suyos.',
        'Si los PJs se rinden, son llevados ante El Resto Gris para negociar — no ejecutados.',
      ],
      duration: '4-5 rounds',
    },
    {
      id: 'combat-batalla-salon',
      title: 'La batalla del salón (Ylt + colapso de plataforma)',
      mapRef: 'map-3-4',
      enemies: [
        { name: 'Ylt, Vigilante de la Verdad', count: '1', bonus: 'Agilidad excepcional, conoce el terreno' },
        { name: 'Guardia de élite de Ylt', count: '2', bonus: 'Equipados con armadura media' },
      ],
      specialRules: [
        'La plataforma central pierde 1 punto de estabilidad por round. Al llegar a 0 (round 4 aproximadamente), colapsa.',
        'Todos en la plataforma cuando colapsa hacen tirada de Atletismo (dificultad 14) o caen (2d6 daño).',
        'Ylt usa la plataforma inestable a su favor: empuja combatientes hacia los bordes.',
        'Si Ylt baja de 25% de su vida máxima, intenta escapar usando humo y el caos del colapso.',
        'Si los PJs tienen a Kaiana como aliada, ella puede absorber las acciones de un guardia de élite.',
      ],
      duration: '4-6 rounds (terminado por el colapso o la huida de Ylt)',
      rewards: 'La hoja de Honor de Taln. Subida al nivel 4. Resolución del arco de Kaiana.',
      tables: [
        {
          title: 'Fases del colapso de la plataforma',
          entries: [
            { roll: 'Round 1-2', text: 'Plataforma estable. Crujidos audibles pero sin efecto mecánico.' },
            { roll: 'Round 3', text: 'Plataforma inestable. Terreno difícil. Los personajes en ella tienen desventaja en tiradas de acrobacias.' },
            { roll: 'Round 4+', text: 'La plataforma colapsa. Tirada de Atletismo dificultad 14 o 2d6 de daño por caída.' },
          ],
        },
      ],
    },
  ],

  maps: [
    {
      id: 'map-3-1',
      title: 'Mapa 3.1 — La ciudad de Rathalas',
      pdfPage: 65,
      imagePath: '/maps/map_p65.png',
      scale: 'Visión general del cañón con zonas A1-A8',
      locations: ['A1 Suelo del cañón', 'A2 Puesto de vigilancia', 'A3 Pared del risco', 'A4 Taller de carpintería', 'A5 El devotario', 'A6 Laberinto de puentes', 'A7 La prisión', 'A8 El corazón de la fortaleza'],
      notes: 'Mapa principal del capítulo. Mostrar a los jugadores solo las zonas que ya han visitado.',
    },
    {
      id: 'map-3-2',
      title: 'Mapa 3.2 — El suelo del cañón',
      pdfPage: 66,
      imagePath: '/maps/map_p66.png',
      scale: 'Detalle del suelo del cañón (zona A1)',
      locations: ['Entrada norte', 'Nidos de khornaks', 'Ruinas de edificios bajos', 'Acceso a la red de puentes'],
      notes: 'Mapa táctico para el combate con los khornaks. También útil para infiltraciones discretas.',
    },
    {
      id: 'map-3-3',
      title: 'Mapa 3.3 — La prisión de Rathalas',
      pdfPage: 70,
      imagePath: '/maps/map_p70.png',
      scale: 'Planta de la prisión con zonas P1-P4',
      locations: ['P1 Entrada con Tuxli', 'P2 Sala de guardias', 'P3 Celdas principales (Kaiana, Teryn)', 'P4 Celda de aislamiento'],
      notes: 'Mapa táctico para la liberación de los prisioneros. Indicar salidas alternativas si los PJs buscan rutas discretas.',
    },
    {
      id: 'map-3-4',
      title: 'Mapa 3.4 — El salón y la plataforma',
      pdfPage: 76,
      imagePath: '/maps/map_p76.png',
      scale: 'Interior del salón principal de la fortaleza',
      locations: ['Entrada al salón', 'Columnas de piedra', 'Plataforma central (estable)', 'Salida posterior'],
      notes: 'Mapa táctico para la batalla inicial. Usar junto con el mapa 3.5 para mostrar el colapso progresivo.',
    },
    {
      id: 'map-3-5',
      title: 'Mapa 3.5 — El salón y la plataforma caída',
      pdfPage: 77,
      imagePath: '/maps/map_p77.png',
      scale: 'Interior del salón principal tras el colapso',
      locations: ['Entrada al salón', 'Columnas de piedra', 'Escombros de la plataforma', 'Nivel inferior expuesto'],
      notes: 'Estado del salón tras el colapso de la plataforma (Round 4+). Cambiar a este mapa cuando ocurra el colapso.',
    },
  ],
}

// ── Chapter 4 ─────────────────────────────────────────────────

const CHAPTER_4: AdventureChapter = {
  id: 'cap4',
  number: 4,
  title: 'Hacia el valle',
  pdfPages: { from: 81, to: 96 },
  levelFrom: 4,
  levelTo: 5,
  summary: 'Los PJs persiguen a Ylt a bordo del "Broma de la tormenta", enfrentando la primera tormenta eterna en el mar. Tras hacer escala en el devastado puerto de Karanak, cruzan el mar de Tarat y alcanzan las zanjas heladas de Hexi. Finalmente entran en el Valle de la Vigilante Nocturna, experimentan visiones proféticas y se enfrentan a Ylt en una batalla en la que el destino de Kaiana lo cambia todo. La Vigilante Nocturna les ofrece bendiciones y maldiciones antes de enviarlos al oeste.',
  background: 'Ylt ha obtenido de la Vigilante Nocturna un cuchillo de raysio capaz de matar a un Heraldo. Su plan: convencer a Kaiana de que lo empuñe y asesine a la Heraldo Pailiah para que él pueda ocupar su lugar. Kaiana, sin embargo, alberga dudas sobre la lealtad de su maestro. La primera tormenta eterna ha sacudido todo Roshar, liberando a los cantores esclavizados de su forma esclava. El grupo navega en el maltrecho "Broma de la tormenta" con Ubo como timonel y una tripulación improvisada.',
  prepChecklist: [
    'Preparar visiones personalizadas para cada PJ según sus trasfondos, propósitos y obstáculos.',
    'Decidir si Ubo sobrevive a la tormenta eterna (afecta al tono del capítulo).',
    'Preparar las bendiciones y maldiciones de la Vigilante Nocturna para cada PJ.',
    'Trackear el daño acumulado del barco durante el combate con las anguilas aéreas.',
    'Si Kaiana viene del Cap.3 como aliada, las pruebas de Liderazgo para persuadirla tienen ventaja.',
  ],
  progressionItems: [
    { type: 'key', text: 'Los PJs suben al nivel 5 tras abandonar el valle.' },
    { type: 'spren', text: 'Spren atraídos si un PJ arriesga su vida para salvar al barco o a la tripulación durante la tormenta.' },
    { type: 'spren', text: 'Spren atraídos si un PJ salva a Axoq.' },
    { type: 'spren', text: 'Spren atraídos si un PJ convence a Kaiana de cambiar de bando.' },
    { type: 'info', text: 'PJs con metas sobre los Heraldos o los Radiantes: las visiones del valle y la conversación con la Vigilante Nocturna son momentos clave.' },
  ],

  scenes: [
    {
      id: 'zarpamos',
      title: 'Zarpamos',
      type: 'narrative',
      readAloud: 'Teryn os lleva por un pasaje oculto del taller de carpintería hasta un pequeño puerto al borde del mar de las Lanzas. Allí espera el "Broma de la tormenta", un barco viejo que cruje al solo mirarlo. Ubo ya está al timón, sonriendo como si fuera lo más natural del mundo.',
      content: [
        'Los bandidos leales a Teryn ayudan al grupo a equipar el barco. Ylt escapó con el mejor navío del puerto, así que el "Broma de la tormenta" es lo que queda.',
        'Ubo se ofrece a actuar como timonel y contramaestre. Conoce las aguas gracias a años de trabajo en el taller. Puede reclutar a cuatro trabajadores adicionales.',
        'Teryn quiere quedarse para liderar a los bandidos restantes. Axies el Coleccionista prefiere seguir estudiando a El Resto Gris.',
        'Tam y Veda son dos cantores esclavizados que los bandidos pusieron a trabajar. Viajan en el barco como parte de la tripulación.',
        'Antes de zarpar, Teryn advierte en privado al grupo que Kaiana puede no ser tan leal a Ylt como parece.',
      ],
      tips: [
        'El grupo puede intentar reclutar hasta cuatro PNJs adicionales. Cada uno requiere una prueba de Liderazgo (dificultad 15), reducida en 5 por cada 30 marcos extra que se ofrezcan.',
        'Este es un buen momento para que los PJs definan su relación con la tripulación antes de los peligros que se avecinan.',
      ],
    },
    {
      id: 'anguilas-aereas',
      title: 'Nubes que se retuercen',
      type: 'combat',
      readAloud: 'Un trueno retumba en el cielo gris, resonando desde el oeste. Ubo da unas órdenes bruscas a la tripulación. "¡Arriad las velas! ¡Se acerca una tormenta!". Sus gritos se convierten en un susurro. "¿Una tormenta... desde el oeste?". Un golpe seco y húmedo hace que Ubo dé un respingo cuando algo cae a la cubierta junto a sus pies. Es una anguila aérea de un metro de largo que lucha por respirar.',
      content: [
        'A varios días de viaje del mar de las Lanzas, una masa de anguilas aéreas panificadas barre el barco. El enjambre se aproxima desde el oeste, un presagio de la tormenta eterna.',
        'Todos los PJs que no están a cubierto deben superar una prueba de Agilidad (dificultad 10) o sufren 1d4 de daño.',
        'Dos anguilas aéreas mayores y dos normales atacan directamente. En su primer turno se lanzan en picado sobre cubierta.',
        'Las anguilas mayores infligen daño también al barco con cada ataque (9 de daño por golpe al navío).',
        'Ubo lucha junto al grupo y advierte del deterioro estructural. El resto de la tripulación busca refugio bajo cubierta.',
        'El combate termina cuando las dos anguilas mayores mueren. El daño acumulado del barco determina el estado inicial del siguiente empeño.',
      ],
      tips: [
        'Llevar cuenta del daño total del barco: 30-44 = 1 fallo inicial; 45-59 = 2 fallos; 60+ = 3 fallos.',
        'Un PJ que supere Supervivencia (dificultad 12) nota que las anguilas huyen hacia el este — de algo.',
      ],
      tables: [
        {
          title: 'Efectos del campo de batalla',
          entries: [
            { text: 'Cubierta oscilante: al final de cada ronda, todos en cubierta hacen Agilidad CD 10 o quedan Tumbados y se desplazan 3 metros.' },
            { text: 'Enjambre de anguilas: al final de cada ronda de combate, una nueva anguila se une a la refriega.' },
          ],
        },
      ],
    },
    {
      id: 'tormenta-eterna',
      title: 'Una nueva tormenta',
      type: 'exploration',
      readAloud: 'El cielo occidental se hunde en la sombra mientras una tormenta negra se arremolina hacia el este. A diferencia de las altas tormentas, esta masa turbulenta está surcada por violentos relámpagos rojos. Aunque no arrastra crem, se abate con un frío agudo, un mar de humo y ceniza asfixiante.',
      content: [
        'La tormenta eterna golpea el barco sin previo aviso. Se dirige como un empeño de vida o muerte: 6 éxitos antes que 4 fallos.',
        'Antes de cada contribución se presenta un peligro diferente al grupo para que reaccionen.',
        'Éxito: la tormenta cesa. Por cada fallo acumulado, un miembro de la tripulación muere.',
        'Fracaso catastrófico (sin éxitos): el barco es destruido. El grupo encalla cerca de Karanak, añadiendo días de viaje y 2 fallos al siguiente empeño.',
        'Los Radiantes en ciernes pueden usar poderes emergentes durante el empeño, con CD ajustada según los ideales que representen.',
      ],
      tips: [
        'Si Ubo muere aquí, el impacto emocional es significativo — era el corazón amigable de la tripulación.',
        'Los cantores Tam y Veda se oyen gemir durante la tormenta: reaccionan ante algo que el grupo no puede percibir aún.',
      ],
      tables: [
        {
          title: 'Peligros de la tormenta eterna',
          entries: [
            { text: 'Caída de rayo: evitar zona (Deducción CD 14), ponerse a cubierto (Agilidad CD 15), construir pararrayos (Manufactura CD 12).' },
            { text: 'Vientos potentes: atarse al barco (Hurto CD 13), aferrarse (Atletismo CD 14), detectar bolsa de aire calmada (Supervivencia CD 15).' },
            { text: 'Hombres al agua: maniobrar barco (Agilidad CD 13), organizar cabo de rescate (Liderazgo CD 13), nadar (Atletismo CD 15).' },
            { text: 'Barco zozobrante: virar hacia la ola (Atletismo CD 14), soltar vela enganchada (Hurto CD 14), agrupar peso (Liderazgo CD 13).' },
            { text: 'Mástil roto: reforzarlo (Manufactura CD 15), arrojar agua (Atletismo CD 13), derribarlo controladamente (Saber CD 14).' },
          ],
        },
      ],
    },
    {
      id: 'despertar',
      title: 'Despertar',
      type: 'narrative',
      readAloud: 'Cuando los fuertes vientos y el oleaje finalmente cesan, encontráis a los dos parshmenios de la tripulación fundidos en un estrecho abrazo, riendo, llorando y hablando entre ellos en voz baja. Uno de los dos se inclina para levantar un garrote abandonado en cubierta. Le tiemblan las manos al apuntarlo hacia el resto de la tripulación. "Nos llevamos el bote salvavidas. Eso es todo. Nos vamos."',
      content: [
        'Tam y Veda han adoptado la forma de trabajo tras la tormenta eterna. Han recuperado su identidad reprimida tras años de consciencia onírica.',
        'Si todos los PJs son humanos, deben superar Persuasión (dificultad 12) para que Tam y Veda confíen en ellos y hablen de lo ocurrido.',
        'Si un PJ es cantor, Tam y Veda lo invitan a una celebración íntima. Los cantores conmovidos por su despertar obtienen el estado Determinado.',
        'Una vacíospren llamada Roil (ella) aborda a los cantores del grupo durante la tormenta: busca ofrecerles formas de poder a cambio de acercarlos a la influencia de Odium.',
        'Independientemente de lo que digan los PJs, Tam y Veda acaban marchándose para disfrutar de su libertad.',
      ],
      tips: [
        'Este momento tiene potencial emocional si hay PJs cantores en el grupo — preparar la conversación con cuidado.',
        'Roil solo se aparece al PJ cantor que muestre interés, y solo a él/ella. Es un hilo narrativo a largo plazo.',
      ],
    },
    {
      id: 'karanak',
      title: 'Karanak',
      type: 'exploration',
      readAloud: 'Finas columnas de humo se alzan hacia el cielo a medida que la ciudad portuaria de Karanak aparece a la vista. Incluso desde la distancia, la destrucción causada por la tormenta es evidente. Los edificios del lado oeste están partidos en dos. Los pilares agrietados de un gran templo vorin apuntan hacia el cielo como huesos expuestos. Pero los muelles siguen en pie, y la ciudad bulle de actividad.',
      content: [
        'Karanak es una ciudad portuaria del principado Bethab de Alezkar. Ha sufrido graves daños durante la tormenta eterna y sus habitantes desconfían de los forasteros.',
        'Los cantores esclavizados de la ciudad despertaron durante la tormenta y huyeron. La población humana desconfía profundamente de cualquier cantor PJ (desventaja en pruebas sociales).',
        'Cada día adicional en Karanak cuenta como 1 fallo en el empeño de "Siguiendo a Ylt" (máximo 2). Po\'ahu se muestra cada vez más impaciente.',
        'El barco necesita reparaciones. Si el empeño de la tormenta tuvo éxito, la tripulación puede hacerlas sola. Si fracasó, cuesta 200 marcos o un día de trabajo (Manufactura CD 15).',
        'Los lugareños confirman que un barco con tripulantes con la cara pintada de verde atracó hace dos días — los Ojos de Pala de Ylt.',
      ],
      tips: [
        'Los PJs pueden contratar marineros adicionales: Liderazgo (dificultad 15), reducida en 5 por 30 marcos extra por marinero.',
        'Las tiendas abiertas venden equipo y armas estándar. Nada más está disponible mientras la ciudad se reconstruye.',
      ],
    },
    {
      id: 'siguiendo-ylt',
      title: 'Siguiendo a Ylt',
      type: 'exploration',
      content: [
        'Una carrera de varias semanas a través del mar de Tarat desde Karanak hasta las tierras altas del Gran Hexi. Se dirige como un empeño: 3 éxitos antes que 3 fallos.',
        'Si el barco sigue dañado o la tripulación está incompleta, los PJs tienen desventaja en pruebas de navegación.',
        'Éxito: el grupo sorprende a la retaguardia de Ylt en las zanjas de Hexi.',
        'Fracaso: la retaguardia tiende una emboscada al grupo.',
        'El viaje pasa por tres etapas: el mar de Tarat (alta mar), la tormenta en Triax (refugio en un puesto de piratas), y las orillas de Hexi (desembarco).',
      ],
      tables: [
        {
          title: 'Enfoques por etapa del viaje',
          entries: [
            { text: 'Mar de Tarat: trazar rumbo (Saber CD 15), interpretar vientos (Percepción CD 14), pescar suministros (Supervivencia CD 14), inspeccionar daños (Deducción CD 13), reparar (Manufactura CD 13), organizar tripulación (Liderazgo CD 13).' },
            { text: 'Tormenta en Triax: intimidar en el refugio de piratas (Intimidación CD 16), forjar amistades (Persuasión CD 15), buscar espías de Ylt (Sigilo CD 15).' },
            { text: 'Orillas de Hexi: localizar el atracadero de Ylt (Percepción CD 15), explorar terreno (Atletismo CD 15), seguir rastro (Supervivencia CD 15).' },
          ],
        },
      ],
    },
    {
      id: 'zanjas-hexi',
      title: 'Retaguardia en las zanjas de Hexi',
      type: 'combat',
      readAloud: 'Piedras, grava y una fina capa de nieve crujen bajo vuestros pies mientras las lluvias se congelan con el frío aire del sur. Las desoladas tierras bajas están surcadas por terreno rugoso: zanjas que ascienden y descienden varios metros. Un liquen resbaladizo se aferra a los lados de guardatormenta.',
      content: [
        'Ylt ha dejado una retaguardia de Ojos de Pala para frenar a los PJs mientras él y Kaiana buscan el Valle.',
        'Si el empeño anterior tuvo éxito, el grupo sorprende al campamento desprevenido (un PJ puede acercarse sin ser detectado con Sigilo CD 14).',
        'Si el empeño fracasó, la retaguardia tiende una emboscada: todos los PJs empiezan Sorprendidos hasta el final de su primer turno.',
        'El médico emuli Axoq está prisionero en la tienda más occidental. Si los PJs se acercan sin ser detectados, pueden intentar rescatarlo antes del combate.',
        'Tras la batalla, un acólito interrogado (Intimidación o Persuasión vs. Defensa espiritual) revela la dirección del valle. Si no, Axoq puede dar indicaciones.',
      ],
      tips: [
        'Si un PJ hace todo lo posible por salvar a Axoq, podría atraer la atención de un cultivacispren.',
        'Los guardias buscan incapacitar, no matar. Si los PJs se rinden, son llevados ante el campamento para negociar.',
      ],
      tables: [
        {
          title: 'Efectos del campo de batalla (Zanjas de Hexi)',
          entries: [
            { text: 'Zanjas profundas: agacharse en ellas da suficiente cobertura para usar la acción Prevenirse (1).' },
            { text: 'Liquen resbaladizo: moverse por los lados encarados al este requiere Agilidad CD 10 o el movimiento se reduce a la mitad y queda Tumbado.' },
          ],
        },
      ],
    },
    {
      id: 'rescate-axoq',
      title: 'Rescate de Axoq (opcional)',
      type: 'social',
      content: [
        'Si los PJs se acercan al campamento sin ser detectados, pueden intentar liberar a Axoq de la tienda más occidental antes o durante el combate.',
        'Axoq está Ralentizado por sus ataduras. Si el empeño de navegación fracasó, también está Agotado [−2] por el cautiverio.',
        'Si los PJs no lo rescatan activamente, Axoq aprovecha el caos del combate para huir hacia el norte.',
        'Tras ser rescatado, Axoq ofrece al grupo cinco dosis de hierba de invierno (anestésico) y puede acompañarlos hasta la Fortaleza de Ashiqqil, su destino original.',
        'Axoq es supersticioso respecto al valle ("las plantas crecen mal") y se niega a entrar. Espera fuera mientras el grupo entra.',
      ],
      tips: [
        'Axoq menciona la Fortaleza de Ashiqqil, capturada por los tukari — una pista para el siguiente capítulo.',
      ],
    },
    {
      id: 'visiones-manana',
      title: 'Visiones del mañana',
      type: 'narrative',
      readAloud: 'Entre las nevadas faldas de las montañas Hexi se encuentra el Valle de la Vigilante Nocturna. La tierra apenas puede contener la vida silvestre de su interior: enredaderas retorcidas y árboles nudosos se enredan en un denso dosel. El aire es cálido y denso, y unos crujidos intermitentes hacen que parezca que el valle está creciendo activamente, o respirando.',
      content: [
        'Al entrar en el valle, los PJs se separan sin darse cuenta. El follaje se mueve sutilmente y los túneles entre enredaderas cambian de dirección.',
        'Cada PJ experimenta una visión personal única: un presagio de eventos futuros, o una revisión de sus arrepentimientos, miedos u obstáculos personales.',
        'Al terminar la visión, una capa de niebla cubre al PJ. Debe superar Disciplina (dificultad 12) o queda Desorientado durante la primera ronda del siguiente combate.',
        'Finalmente, todos los PJs experimentan una última visión compartida: Ylt ante la Vigilante Nocturna, pidiendo el cuchillo de raysio para matar a la Heraldo Pailiah. Kaiana observa con asombro.',
      ],
      tips: [
        'Preparar visiones personalizadas para cada PJ basadas en su propósito, obstáculo, metas y trasfondo.',
        'Visiones sugeridas: Sombras perdidas (cantores en forma sombría), El peón de Odium (Ylt y la entidad detrás de él), El poder de la Regeneración (Kaiana herida pero con luz tormentosa).',
        'Cualquier ayuda recibida o daño sufrido durante las visiones desaparece al terminar.',
      ],
    },
    {
      id: 'batalla-valle',
      title: 'La batalla del valle y Una bendición y una maldición',
      type: 'combat',
      readAloud: 'La niebla se dispersa. Estáis al borde de una arboleda. En el centro, a quince metros, Ylt y Kaiana os observan llegar. Entre ellos yace un cuchillo dorado con una esmeralda en el pomo. Ylt vuelve la hoja de Honor hacia vosotros. "Esto es lo que mis visiones intentaban decirnos, Kaiana. Han llegado demasiado tarde."',
      content: [
        'Ylt busca convencer a Kaiana de que empuñe el cuchillo de raysio y abandone el valle con él. Los PJs deben impedirlo.',
        'Este combate tiene un componente social: los PJs pueden usar una acción (Usar una habilidad) para hacer una prueba de Liderazgo enfrentada contra Ylt (Liderazgo +6) e intentar convencer a Kaiana de que cambie de bando.',
        'Si nadie intenta persuadir a Kaiana al final de cada ronda, el suceso "Kaiana ayuda a Ylt" avanza en 1 (3 espacios = se activa).',
        'Si Kaiana se une al grupo, Ylt ataca a Kaiana con la hoja de Honor (impacto crítico, 25 de daño espiritual) y huye.',
        'Si Ylt baja de 40 de salud y Kaiana empuña el cuchillo (sin aliarse con el grupo), ambos huyen.',
        'Tras el combate, la Vigilante Nocturna regresa a la arboleda. Puede responder preguntas y ofrece a cada PJ una bendición con su correspondiente maldición.',
        'Los PJs suben al nivel 5 tras abandonar el valle.',
      ],
      tips: [
        'El entorno cambia cada ronda: las enredaderas abren y cierran cuatro túneles diferentes. Atravesar uno teleporta al personaje a otro túnel (Disciplina CD 12 para elegir destino).',
        'Si un PJ ataca a Kaiana o intenta desarmarla, las pruebas posteriores para influir en ella tienen desventaja.',
        'La Vigilante Nocturna puede responder: qué es el cuchillo de raysio, cómo encontrar la hoja de Honor, dónde está Nale, y cuál es su motivación.',
      ],
      tables: [
        {
          title: 'Bendiciones y maldiciones (ejemplos)',
          entries: [
            { text: '"Resucita a mi amigo caído" → Bendición: el aliado revive y puedes sentir su dirección siempre. Maldición: ambos tienen imágenes residuales visibles para otros.' },
            { text: '"La capacidad de encontrar a Ylt" → Bendición: sientes la dirección de todas las hojas de Honor de los Heraldos. Maldición: a 15m de una hoja que no empuñas, gastas 1 punto de concentración por turno si no te acercas.' },
            { text: '"El poder para derrotar a Ylt" → Bendición: Fuerza permanente +1, una mano cristalina (daño sin armas mejorado). Maldición: Velocidad permanente −1.' },
            { text: '"La capacidad de moverme como el viento" → Bendición: Velocidad +1, ventaja en Atletismo/Agilidad para trepar, saltar o volar. Maldición: peso reducido a la mitad, desventaja en pruebas de masa.' },
            { text: '"La sabiduría para derrotar a Ylt" → Bendición: Intelecto y Discernimiento permanentes +1. Maldición: Disciplina CD 20 antes de atacar a humanoides con 25 de salud o menos.' },
            { text: '"Fortalece mi voluntad" → Bendición: Voluntad permanente +1, ventaja en una prueba al gastar concentración cuando Resuelto. Maldición: Discernimiento permanente −1.' },
            { text: '"Haz de mí un mejor líder" → Bendición: Presencia permanente +1, aura dorada de 3m. Maldición: desventaja en pruebas de sigilo y disfraz.' },
            { text: '"Un arma para derrotar a mis enemigos" → Bendición: hoja esquirlada (espada larga verde blanquecina, no grita con Radiantes). Maldición: no puede invocarse ni descartarse, desventaja en Sigilo, atrae codiciosos.' },
            { text: '"La inmortalidad" → Bendición: no puedes morir de vejez ni por lesión (recuperas 1d4 de salud a 0). Maldición: cada cura hace crecer enredaderas en tu cuerpo; la quinta vez, desapareces.' },
          ],
        },
      ],
    },
  ],

  npcs: [
    {
      name: 'La Vigilante Nocturna',
      pronouns: 'ella',
      type: 'Spren legendaria / Hija de Cultivación',
      role: 'special',
      traits: ['Enigmática', 'Generosa a su manera', 'Mística'],
      goal: 'Asegurarse de que el cuchillo de raysio llegue a manos de Nale, el Heraldo de la Justicia',
      appearance: 'Se manifiesta como una serie de brumas reptantes con muchos brazos y cara femenina. Ojos de color negro puro. Voz como el viento atravesando un bosque.',
      notes: 'Otorga bendiciones y maldiciones. Sus objetivos son inescrutables incluso para ella misma — su madre es Cultivación. Responde preguntas pero de forma críptica.',
    },
    {
      name: 'Ubo',
      pronouns: 'él',
      type: 'Timonel / Aliado veterano',
      role: 'ally',
      traits: ['Amigable', 'Experto en navegación', 'Valiente sin pretenderlo'],
      goal: 'Llevar al grupo a su destino y volver a casa',
      appearance: 'Hombre mayor, fornido, manos callosas. Sonrisa fácil, ahora con ropa de mar. Igual de tranquilo en cubierta que en su taller.',
      notes: 'Regresa del Cap.3. Puede morir en la tormenta eterna — preparar ese momento si ocurre. Su muerte impacta emocionalmente a toda la tripulación.',
    },
    {
      name: 'Tam',
      pronouns: 'él',
      type: 'Cantor despertado / Ex-esclavo',
      role: 'neutral',
      traits: ['Cauteloso', 'Agradecido pero desconfiado', 'Redescubriendo su identidad'],
      goal: 'Ejercer su libertad recién ganada a su manera',
      appearance: 'Cantor de complexión media, forma esclava recién abandonada. Ojos que han recuperado su brillo. Habla en voz baja.',
      notes: 'Junto a Veda, despierta tras la tormenta eterna. Se marcharán independientemente de lo que digan los PJs. Pueden compartir su historia si los PJs ganan su confianza.',
    },
    {
      name: 'Veda',
      pronouns: 'ella',
      type: 'Cantora despertada / Ex-esclava',
      role: 'neutral',
      traits: ['Directa', 'Determinada', 'Protectora de Tam'],
      goal: 'Llevar a Tam a un lugar seguro lejos de los humanos',
      appearance: 'Cantora de constitución robusta, forma esclava recién abandonada. La que empuña el garrote. Habla con más confianza que Tam.',
      notes: 'Junto a Tam, despierta tras la tormenta eterna. Es ella quien toma la iniciativa de irse. Si hay un PJ cantor, puede abrirse más.',
    },
    {
      name: 'Axoq',
      pronouns: 'él',
      type: 'Médico emuli / Prisionero',
      role: 'ally',
      traits: ['Nostálgico', 'Conocimientos de botánica', 'Voz suave y supersticioso'],
      goal: 'Reunirse con los esfuerzos bélicos emuli y llegar a la Fortaleza de Ashiqqil',
      appearance: 'Humano emuli esbelto de tez oscura, pañuelo colorido envolviendo su pelo gris. Siempre identificando plantas en el camino.',
      notes: 'Preso de la retaguardia de Ylt. Ofrece hierbas medicinales tras ser rescatado. Se niega a entrar en el valle — demasiado supersticioso. Puerta de entrada al Cap.5.',
    },
    {
      name: 'Kaiana',
      pronouns: 'ella',
      type: 'Discípula de Ylt / Vigilante de la Verdad en conflicto',
      role: 'neutral',
      traits: ['Leal a Pailiah por encima de Ylt', 'Hábil en combate', 'Dispuesta a cambiar de bando'],
      goal: 'No permitir que se mate a Pailiah; buscar un futuro diferente para los Ojos de Pala',
      appearance: 'Mujer reshi de porte seguro. Lleva el pelo recogido. Ahora con equipo de viaje y expresión de quien carga una duda enorme.',
      notes: 'Regresa del Cap.3. Tiene un conflicto interno durante la batalla: lucha solo en defensa propia hasta que los PJs la persuaden o el suceso se activa. Su spren es Horizontes-Siempre-A-La-Deriva.',
    },
    {
      name: 'Horizontes-Siempre-A-La-Deriva',
      pronouns: 'ella',
      type: 'Brumaspren / Spren de Kaiana',
      role: 'special',
      traits: ['Amante de los viajes', 'Se aburre si está quieta', 'Adora a Kaiana'],
      goal: 'Acompañar a Kaiana en sus aventuras; si Kaiana muere, encontrar un nuevo vínculo',
      appearance: 'Luz refractada a través del cristal cuando se mueve; cuando está quieta, su luz se retuerce en formas parecidas a algas marinas que ondean en aguas invisibles.',
      notes: 'Si Kaiana muere, permanece en el Reino Físico llorando. Un PJ que busque la verdad tras la traición de Ylt podría atraer su atención para un nuevo vínculo.',
    },
  ],

  combats: [
    {
      id: 'combat-anguilas',
      title: 'Anguilas aéreas sobre el Broma de la tormenta',
      enemies: [
        { name: 'Anguila aérea mayor', count: '2', bonus: 'Bomba en picado (2); cada Mordisco al barco inflige 9 de daño al navío' },
        { name: 'Anguila aérea', count: '2' },
      ],
      specialRules: [
        'Al final de cada ronda, una nueva anguila aérea se une al combate.',
        'El combate termina cuando las dos anguilas mayores mueren.',
        'El daño total al barco determina los fallos iniciales del empeño de la tormenta eterna.',
        'Cubierta oscilante: al final de cada ronda, Agilidad CD 10 o Tumbado y desplazado 3 metros.',
      ],
      duration: '3-4 rounds',
      rewards: 'El daño acumulado del barco afecta directamente al siguiente empeño.',
    },
    {
      id: 'combat-zanjas',
      title: 'Retaguardia de Ylt en las zanjas de Hexi',
      mapRef: 'map-4-1',
      enemies: [
        { name: 'Agente de los Ojos de Pala', count: '3', bonus: 'Conocen el terreno' },
        { name: 'Bandido (Ojos de Pala)', count: '2' },
        { name: 'Arquero (Ojos de Pala)', count: '2' },
      ],
      specialRules: [
        'Si el empeño de navegación tuvo éxito: los PJs pueden sorprender al campamento (Sigilo CD 14).',
        'Si el empeño falló: todos los PJs empiezan Sorprendidos hasta el final de su primer turno.',
        'Zanjas profundas: agacharse da cobertura para Prevenirse (1).',
        'Liquen resbaladizo en los lados este: Agilidad CD 10 o movimiento reducido a la mitad y Tumbado.',
      ],
      duration: '4-5 rounds',
      rewards: 'Información sobre la dirección del valle. Rescate de Axoq. Hierbas medicinales (5 dosis de hierba de invierno).',
    },
    {
      id: 'combat-valle',
      title: 'La batalla del valle (Ylt y Kaiana)',
      mapRef: 'map-4-2',
      enemies: [
        { name: 'Ylt, Vigilante de la Verdad', count: '1', bonus: 'Liderazgo +6; puede invocar/descartar la hoja de Honor de Taln' },
        { name: 'Guardia de élite de los Ojos de Pala', count: '2', bonus: 'Armadura media' },
      ],
      specialRules: [
        'Kaiana empieza neutral: solo lucha en defensa propia. Los PJs deben persuadirla activamente cada ronda.',
        'Suceso "Kaiana ayuda a Ylt": se activa si nadie la persuade durante 3 rondas consecutivas.',
        'Enredaderas cambiantes: al inicio de cada ronda, cuatro túneles abren y cierran en lugares a elección del DJ.',
        'Atravesar un túnel: Disciplina CD 12 — éxito: reapareces en el túnel que elijas; fallo: el DJ elige.',
        'Cuchillo de raysio en el suelo: el primero en agarrarlo activa la reacción preparada de Ylt (Acometida ×2).',
        'Ylt huye si baja de 40 de salud y la situación es irrecuperable.',
      ],
      duration: '5-7 rounds',
      rewards: 'El cuchillo de raysio. Kaiana como aliada potencial. Subida al nivel 5. Bendiciones y maldiciones de la Vigilante Nocturna.',
      tables: [
        {
          title: 'Resolución del combate',
          entries: [
            { text: 'Kaiana muere o se une al grupo → Ylt ataca a Kaiana si ella se une, y huye. La Vigilante Nocturna reaparece.' },
            { text: 'Ylt ≤40 de salud y Kaiana empuña el cuchillo (sin aliarse) → Ylt y Kaiana huyen juntos.' },
            { text: 'Ylt ≤40 de salud y Kaiana no empuña el cuchillo → Ylt huye solo.' },
          ],
        },
      ],
    },
  ],

  maps: [
    {
      id: 'map-4-1',
      title: 'Mapa 4.1 — Zanjas de Hexi',
      pdfPage: 87,
      imagePath: '/maps/map_p87.png',
      scale: '1 casilla = 1,5 m',
      locations: ['Tienda de Axoq (extremo oeste)', 'Zanjas profundas (cobertura)', 'Lados con liquen resbaladizo (este)', 'Puntos de emboscada de los Ojos de Pala'],
      notes: 'Mapa táctico para el combate con la retaguardia de Ylt. Las zanjas ofrecen cobertura y el liquen resbaladizo complica el movimiento.',
    },
    {
      id: 'map-4-2',
      title: 'Mapa 4.2 — El valle de Cultivación',
      pdfPage: 93,
      imagePath: '/maps/map_p93.png',
      scale: '1 casilla = 1,5 m (1 square = 5 ft)',
      locations: ['Arboleda central (Ylt y Kaiana)', 'Cuchillo de raysio (centro)', 'Túneles de enredaderas (perímetro cambiante)', 'Posición inicial de los PJs (15m del centro)'],
      notes: 'Mapa táctico para la batalla final del capítulo. Los túneles del perímetro cambian cada ronda — marcarlos con fichas o dados para trackear su posición.',
    },
  ],
}

export const CHAPTERS: AdventureChapter[] = [CHAPTER_1, CHAPTER_2, CHAPTER_3, CHAPTER_4]
