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

export const CHAPTERS: AdventureChapter[] = [CHAPTER_1, CHAPTER_2]
