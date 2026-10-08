import type { AdventureChapter } from './tipos'

export const CHAPTER_3: AdventureChapter = {
  id: 'cap3',
  number: 3,
  title: 'La ciudad quemada',
  pdfPages: { from: 61, to: 80 },
  levelFrom: 3,
  levelTo: 4,
  summary: 'Los PJs viajan a Rathalas, la ciudad que Dalinar Kholin incendió hace una década y que hoy ocupan unos bandidos a los que Ylt, el ambicioso Vigilante de la Verdad, ha convertido en fanáticos tras matar a la Reina Bandida y robar la hoja de Honor de Taln. El grupo se infiltra en la ciudad esquivando el escrutinio de los bandidos, busca aliados (Ubo, Teryn y los prisioneros), habla con Kaiana en la prisión y se enfrenta a los fanáticos de Ylt en la batalla del salón, de la que Ylt y Kaiana huyen a través de la piedra llevándose la hoja de Honor. Después, con la ayuda de Axies, bajan a la Baja Rathalas, donde el spren antiquísimo Resto Gris les cuenta adónde se dirige Ylt, y suben a nivel 4.',
  background: 'Rathalas, la Grieta, fue una gran ciudad alezi en el fondo de un cañón hasta que, hace una década y con Alezkar recién unificada, el rey Gavilar mandó a Dalinar Kholin contra una ciudad que flirteaba con la rebelión; cuando asesinos de Tanalan mataron a la esposa de Dalinar, este la incendió, y con el respaldo de Sadeas murieron miles de civiles. Solo se salvaron las zonas excavadas en la sima. (Historia secreta: fue aún más cruel que la versión oficial, pero en este relato todos los PNJ creen la oficial.) Entre las ruinas se instalaron unos bandidos bajo la Reina Bandida, que asaltaban caravanas sin gusto por la sangre. Hace unas semanas llegó Ylt: mató a la Reina Bandida, encerró a su lugarteniente Teryn y volvió fanáticos a los bandidos con promesas de poder. Antes había viajado con su aprendiz Kaiana y unos conversos para robar la hoja de Honor de Taln, y ahora practica con ella. Los más fieles (túnicas verdes, espadas con el glifo de los Vigilantes de la Verdad) usan la ficha de fanático. Bajo la ciudad duerme el Resto Gris, un spren antiquísimo que conoce las verdaderas intenciones de Ylt y su próximo destino.',
  prepChecklist: [
    'Piensa cómo llegan los PJs a Rathalas con los favores del capítulo 2: una patrulla Kholin (Bordin, Ellar u otro representante) o la escolta de la brillante Bettani. Durante el viaje se topan con Lorn, un bandido desertor.',
    'Familiarízate con las tres entradas a la ciudad (A1, A2 y A3) y con el mapa 3.1: la mayor parte del capítulo es una infiltración parecida a un dungeon en la que los PJs deben evitar el escrutinio de los bandidos.',
    'Ten a mano el suceso «Bandidos en alerta» (tres espacios de Complicación): las Complicaciones de los PJs en cualquier escena de Rathalas pueden gastarse para hacerlo avanzar, hasta que desencadena una pelea con los bandidos.',
    'Prepara la conversación con Kaiana en la prisión: determina las probabilidades de que cambie de bando y se una al grupo en el capítulo 4.',
    'El encuentro con Ylt en «El corazón de la fortaleza» siempre ocurre, pero antes los PJs pueden buscar información y aliados entre los bandidos (Ubo, Teryn, los prisioneros) y así liberar Rathalas de la tiranía del Vigilante de la Verdad.',
    'Axies, el Coleccionista, aparece en la prisión o tras la batalla contra los fanáticos. Es la vía más rápida para llegar al Resto Gris, en la Baja Rathalas, el único ser que conoce las verdaderas intenciones de Ylt y su próximo destino.',
    'Los bandidos más leales a Ylt usan la ficha de fanático del apéndice A.',
  ],
  progressionItems: [
    { type: 'key', text: 'El grupo arranca el capítulo en nivel 3 y asciende a nivel 4 cuando ya ha hablado con el Resto Gris.' },
    { type: 'info', text: 'Las decisiones del capítulo ofrecen oportunidades de introducir spren, fortalecer vínculos spren o jurar Ideales.' },
    { type: 'spren', text: 'Cómo tratan los PJs al antiguo bandido Lorn (lumispren si lo animan a buscar una vida mejor; altospren si quieren entregarlo por sus crímenes).' },
    { type: 'spren', text: 'Si los PJs deciden liberar prisioneros o ayudar a la resistencia contra los bandidos (lumispren al centrarse en liberar a los prisioneros; cultivacispren al tratar sus dolencias en la sala de los barriles).' },
    { type: 'spren', text: 'Si un PJ decide revelar una verdad dolorosa al Resto Gris (también capta la atención de Código, sobre todo si admite haber mentido sobre sí mismo).' },
    { type: 'info', text: 'Los PJs con metas sobre aprender más acerca de los Heraldos, las hojas de Honor o los Radiantes pueden avanzar en ellas hablando con Kaiana o con el Resto Gris.' },
  ],

  scenes: [
    {
      id: 'viaje-rathalas',
      title: 'El viaje a Rathalas',
      type: 'choice',
      content: [
        'Para conseguir transporte a Rathalas, el grupo puede acudir a Bordin, a Liss o a alguien que les deba un favor. El libro propone dos opciones.',
        'Unirse a una patrulla Kholin: si el grupo cobra un favor o supera una prueba de Liderazgo CD 13, Bordin, Ellar u otro representante Kholin lo contrata como escolta de una patrulla rumbo al norte. Recibe monturas y, además, 30 marcos por personaje pagados de antemano.',
        'Escoltar a la brillante Bettani: el grupo acompaña a Bettani, que va al principado de Thanadal por asuntos urgentes. Les proporcionan caballos para cruzar las Montañas Irreclamadas, pero el equipo es viejo y está en mal estado: cada personaje debe superar una prueba de Supervivencia CD 12 o llegará a Rathalas Agotado [−1].',
        'Sea cual sea la opción, la travesía se prolonga veinte días, y unos mozos de cuadra van con el grupo para llevar de regreso los caballos a los campamentos de guerra una vez concluida la escolta.',
      ],
      branches: [
        {
          label: 'Unirse a una patrulla Kholin',
          description: 'Favor o prueba de Liderazgo CD 13 ante Bordin, Ellar u otro representante Kholin. Caballos y 30 marcos por personaje, por adelantado.',
        },
        {
          label: 'Escoltar a la brillante Bettani',
          description: 'Caballos para cruzar las Montañas Irreclamadas, pero con equipo viejo: cada personaje supera una prueba de Supervivencia CD 12 o llega Agotado [−1].',
        },
      ],
    },
    {
      id: 'un-viajero-en-el-camino',
      title: 'Un viajero en el camino',
      type: 'social',
      readAloud: 'Al caer la tarde, buscando un sitio donde pasar la noche, topáis con un viejo de aspecto curtido que ya ha instalado su campamento a resguardo del viento del este, tras una formación de roca. Lleva armas, pero os recibe con aire afable.',
      content: [
        'El anciano se llama Lorn (bandido, él): desertó de la banda, fiel como era a la Reina Bandida, cuando Ylt acabó con ella. Camina hacia las Llanuras Quebradas buscando empleo y quiere noticias de los campamentos de guerra. Mientras habla, no reconoce haber sido bandido.',
        'Lo que cuenta si le preguntan por la región y los bandidos: que se han vuelto más violentos y despiadados y que su número crece; que su antigua reina fue asesinada y que ahora los lidera un jefe sectario con planes propios; y que ese líder es un portador de esquirlada iriali, con pelo dorado y la hoja esquirlada más grande que se haya visto.',
        'Si le preguntan si puede contarles algo más, Lorn duda. Un PJ que supere una prueba de Persuasión CD 12 consigue que revele que no todo el mundo en Rathalas está contento con el nuevo líder y que hay un contramaestre llamado Ubo en la carpintería, cerca del fondo del cañón. Si falla, Lorn solo dice que no hay mucho más que contar.',
        'Quien tenga pericia en Bajos fondos, o supere una prueba de Deducción o Perspicacia CD 13, se da cuenta de que Lorn fue bandido.',
        'Si el grupo viaja con la patrulla Kholin, su líder insiste en arrestar a Lorn. Convencer a la patrulla de que lo deje marchar requiere una prueba de Intimidación, Liderazgo o Persuasión CD 14.',
        'La jornada siguiente al encuentro con Lorn, el grupo alcanza los alrededores de Rathalas.',
      ],
      tips: [
        'Camino a la Radianza: un personaje que anime a Lorn a buscar una vida mejor puede atraer la atención de un lumispren; uno que quiera entregarlo por sus crímenes puede atraer la de un altospren.',
      ],
      branches: [
        {
          label: 'Animar a Lorn a buscar una vida mejor',
          description: 'Puede atraer la atención de un lumispren.',
        },
        {
          label: 'Querer entregarlo por sus crímenes',
          description: 'Puede atraer la atención de un altospren. Con la patrulla Kholin, el líder quiere arrestarlo: dejarlo ir requiere Intimidación, Liderazgo o Persuasión CD 14.',
        },
      ],
    },
    {
      id: 'rathalas-ciudad-cenizas',
      title: 'Rathalas, la ciudad reducida a cenizas',
      type: 'narrative',
      content: [
        'Hace diez años, recién unificada Alezkar, Rathalas (la Grieta) era el hogar de decenas de miles de alezi bajo el mando del brillante señor Tanalan, y su emplazamiento dentro de un gran cañón la resguardaba de las altas tormentas como a pocas ciudades.',
        'Cuando la ciudad coqueteó con la rebelión, el rey Gavilar mandó a Dalinar Kholin, el Espina Negra. Asesinos de Tanalan mataron a la esposa de Dalinar y este respondió incendiando la ciudad entera; con el respaldo del alto príncipe Sadeas, la ruina de Rathalas quedó como escarmiento para los rebeldes y perecieron miles de civiles. Hoy solo quedan vigas calcinadas de casas y pasarelas que colgaban sobre el abismo, además de las zonas excavadas en la sima, que se salvaron.',
        'Historia secreta: las acciones de Dalinar y Sadeas fueron aún más duras de lo que cuenta la versión oficial, pero en este relato la historia de Rathalas se presenta como un hecho y todos los PNJ la creen.',
        'Situación actual: en los últimos años, unos bandidos hicieron de las ruinas su guarida bajo el mando de una mujer a la que solo se conocía como la Reina Bandida. Atacaban caravanas y secuestraban rehenes, pero sin gusto por la sangre: solo mataban si no había más remedio.',
        'Hace unas semanas llegó Ylt y todo cambió: acabó con la Reina Bandida y metió en prisión a su leal lugarteniente, Teryn. Fue radicalizando a los bandidos con la promesa de poderes asombrosos a cambio de fe y adoración. Antes había viajado con su aprendiz Kaiana y unos cuantos conversos para robar la hoja de Honor de Taln, y ahora practica con ella.',
        'Los sermones de Ylt y su exhibición de la hoja de Honor han traído nuevos seguidores y más violencia, y los bandidos son cada vez más brutales en las Montañas Irreclamadas. Los más fieles a Ylt usan la ficha de fanático; se distinguen por las túnicas verdes y por unas espadas con el glifo de los Vigilantes de la Verdad, semejantes a la daga que mató a Taszo.',
      ],
    },
    {
      id: 'llegando-rathalas',
      title: 'Llegando a Rathalas',
      type: 'exploration',
      readAloud: 'Al otro lado de las llanuras aparece Rathalas, otrora una gran ciudad, apoyada en las paredes de un cañón. Abajo, un río somero fluye hacia el oeste y desemboca en el mar de las Lanzas; las antiguas rampas ya no sirven y solo se entra por el extremo occidental, desde el fondo del cañón. Los restos de una muralla poderosa, agrietada y cubierta de crem, rodean las ruinas, y solo un puesto de vigilancia luce esferas encendidas.',
      content: [
        'Antes de entrar, el grupo puede reconocer el terreno o preguntar por ahí; esto es lo que descubre de cada acceso.',
        'Suelo del cañón (zona A1): quien lo explora descubre que se puede ir a la boca occidental del cañón y caminar por él hasta una entrada a Rathalas sin vigilancia. Con una prueba de Percepción CD 13 también observa movimiento entre los rocabrotes de la boca del cañón. Esta entrada conecta con la zona A4.',
        'Puesto de vigilancia (zona A2): quien lo espía hace una prueba de Percepción CD 12. Si falla, solo ve varias figuras custodiando la puerta; si la supera, distingue a ocho bandidos con túnicas verdes sobre armaduras descuidadas y ve cómo una mujer desaliñada, nueva recluta, obtiene permiso para entrar. Esta entrada conecta con la zona A5.',
        'Pared del risco (zona A3): quien la investiga hace una prueba de Supervivencia CD 13. Si la supera, descubre un tramo del cañón con apoyos suficientes para descender a la ciudad quemada. Esta entrada conecta con las zonas A4 y A6.',
        'Las entradas se detallan en «Localizaciones de Rathalas» y se ubican en el mapa 3.1. Antes de que el grupo elija entrada, presenta a los jugadores el suceso «Bandidos en alerta». Cuando elijan, dirige la escena de la zona correspondiente y luego pasad a «Cómo moverse por Rathalas» mientras los PJs entran en la ciudad.',
      ],
      tips: [
        'Conviene dominar las tres entradas y el mapa: dentro de las ruinas, los PJs necesitan esquivar la mirada de los bandidos para avanzar a salvo.',
      ],
      branches: [
        {
          label: 'Suelo del cañón (A1)',
          description: 'Entrada sin vigilancia por la boca occidental del cañón; hay khornaks al acecho. Percepción CD 13 para ver movimiento entre los rocabrotes. Conecta con A4.',
        },
        {
          label: 'Puesto de vigilancia (A2)',
          description: 'Ocho bandidos fanáticos; solo pasan quienes superan una prueba de Engaño CD 17. Percepción CD 12 para espiarlo. Conecta con A5.',
        },
        {
          label: 'Pared del risco (A3)',
          description: 'Descenso con pruebas de Atletismo CD 13 por la pared. Supervivencia CD 13 para encontrar el tramo practicable. Conecta con A4 y A6.',
        },
      ],
    },
    {
      id: 'suceso-bandidos-alerta',
      title: 'Suceso: Bandidos en alerta',
      type: 'exploration',
      content: [
        'Cuando el grupo se acerca a la ciudad, la mayoría de los bandidos supone que son nuevos reclutas. Anuncia a los jugadores que van a iniciar un suceso (ver «Sucesos» en el capítulo 9 del Manual del Archivo de las Tormentas). «Bandidos en alerta» es un suceso negativo con tres espacios que miden cuándo descubren los bandidos que hay intrusos entre ellos. Se activa cuando se rellena el último espacio de Complicación.',
        'Cómo avanza: cada Complicación que sufra un PJ en cualquier escena de Rathalas puede canjearse por 1 espacio del suceso; así el problema inmediato se transforma en la amenaza de un choque futuro.',
        'Otros avances que marca el libro: fallar la prueba de Engaño CD 17 del puesto de vigilancia (A2) y la primera caída de un personaje en la pared del risco (A3). Retrocede en 1 con la Oportunidad «Ubo cubre a los PJs» (A4).',
        'Activación: si se rellenan los tres espacios, suena un cuerno y el campamento entra en estado de alerta. La prisión (A7) recibe dos guardias bandidos más.',
        'Además, un grupo de tres bandidos y tres arqueros intercepta a los héroes. Si los PJs parecen fuera de lugar, atacan antes de hacer preguntas, y se retiran o se rinden cuando la mitad de sus efectivos ha sido derrotada. Si el grupo es derrotado o se rinde, los bandidos lo llevan a la prisión (A7) y lo arrojan a la sala de los barriles (P3).',
      ],
      tips: [
        'Cada Complicación de un PJ en Rathalas puede convertirse en un avance del suceso: cambia un problema inmediato por la amenaza de la pelea.',
      ],
    },
    {
      id: 'como-moverse-rathalas',
      title: 'Cómo moverse por Rathalas',
      type: 'exploration',
      readAloud: 'Entráis en una ciudad muerta y chamuscada, marcada por la tragedia. Troncos pelados se levantan donde antes hubo cimientos de madera, y los puentes y las casas caídas aparecen cubiertos de deteriospren. Huele a cenizas y aceite, todo cruje bajo los pies y, en las cornisas y túneles de la pared del risco, se adivina movimiento.',
      content: [
        'Tras acercarse por la entrada elegida, el grupo debe recorrer la ciudad quemada reuniendo información y aliados. Para enfrentarse a Ylt hay que atravesar varios lugares unidos por túneles, puentes, edificios carbonizados y rampas; los PJs empiezan visitando una zona conectada con la entrada que hayan elegido.',
        'Taller de carpintería (A4): supervisado por un contramaestre compasivo que trabaja bajo la mirada de los fanáticos de Ylt; se le puede convencer de que comparta información útil. Conecta con A1, A3 y A6.',
        'Devotario (A5): un almacén y centro de actividad que el grupo debe atravesar con discreción. Conecta con A2, A6, A7 y A8.',
        'Laberinto de puentes (A6): una zona peligrosa de la ciudad habitada por bestias salvajes. Conecta con A3, A4, A5 y A7.',
        'Prisión (A7): retiene a los presos fieles a la Reina Bandida y a un curioso erudito de los spren; da a A5, A6 y A8.',
        'Corazón de la fortaleza (A8): una gran plataforma en una caverna de un risco con vistas al palacio en ruinas, donde Ylt reúne a sus seguidores y da órdenes. Conduce a A5 y A7, y también a la Baja Rathalas.',
      ],
      tips: [
        'La mayor parte del capítulo es una infiltración parecida a un dungeon: los PJs deben evitar el escrutinio de los bandidos para moverse con seguridad.',
      ],
    },
    {
      id: 'a1-suelo-canon',
      title: 'A1: El suelo del cañón',
      type: 'combat',
      content: [
        'La boca occidental del cañón (mapa 3.2) está plagada de rocabrotes de ribera de unos dos metros, abultados por la humedad del lago, con gruesas enredaderas tendidas entre ellos que hacen de toda la zona terreno difícil.',
        'Emboscada: tres khornaks anfibios se ocultan entre las enredaderas, hacia el centro del paso entre los rocabrotes.',
        'Un PJ que supere una prueba de Percepción CD 15 los ve y puede avisar al grupo antes del ataque. La prueba sufre una desventaja porque los khornaks están a cubierto; pero si los PJs exploraron el fondo del cañón antes de entrar (ver «Llegando a Rathalas») y ya detectaron movimiento entre los rocabrotes, la prueba también obtiene una ventaja.',
        'Si nadie los descubre, los khornaks saltan de improviso desde las enredaderas y los PJs quedan Sorprendidos hasta que termine su primer turno de combate. No se retiran: pelean hasta la muerte.',
        'Acceso a la ciudad: al terminar esta escena y entrar por primera vez en la ciudad, ver «Cómo moverse por Rathalas». Conexiones: esta zona conecta con el taller de carpintería (A4).',
      ],
    },
    {
      id: 'a2-puesto-vigilancia',
      title: 'A2: El puesto de vigilancia',
      type: 'social',
      content: [
        'Nada más pasar las puertas, los bandidos han montado escaleras, rampas y controles para ir y venir con seguridad entre su base y las llanuras; un torno con poleas mueve el botín, aunque casi todos prefieren las escaleras a la plataforma colgante. Este puesto, a nivel de la llanura, está ocupado por ocho bandidos fanáticos.',
        'Los bandidos suponen que cualquiera que conoce su escondite es un nuevo recluta, pero no dejan pasar a nadie que no supere una prueba de Engaño CD 17. Si se supera, dejan entrar al grupo y le indican que empiece con las labores manuales en el devotario (A5).',
        'En caso de fallo, los bandidos echan al grupo a la fuerza y «Bandidos en alerta» sube 1 espacio.',
        'Acceso a la ciudad: si la escena termina con éxito, el grupo accede por primera vez a la ciudad (ver «Cómo moverse por Rathalas»). Conexiones: esta zona conecta con el devotario (A5).',
      ],
      branches: [
        {
          label: 'Superar la prueba de Engaño CD 17',
          description: 'Los bandidos dejan entrar al grupo y lo mandan a las labores manuales del devotario (A5).',
        },
        {
          label: 'Fallar la prueba de Engaño CD 17',
          description: 'Ahuyentan violentamente al grupo y «Bandidos en alerta» avanza en 1.',
        },
      ],
    },
    {
      id: 'a3-pared-risco',
      title: 'A3: Pared del risco',
      type: 'exploration',
      content: [
        'El descenso es peligroso: cada personaje debe superar una prueba de Atletismo CD 13 para dar con un apoyo firme. Sube la apuesta en la prueba del primer PJ que tome esta ruta.',
        'Una Oportunidad en esa primera prueba da ventaja al resto de los PJs en las suyas; una Complicación sube a 14 la CD de todos los demás, pues se desploma una de las cornisas y deja de servir.',
        'Tras fallar la prueba de Atletismo, el PJ puede intentar salvarse con Agilidad CD 15: si lo logra, se aferra a tiempo, aunque pierde 1 punto de concentración por el susto; si no, se desliza por la roca y se estrella 6 metros más abajo contra los restos carbonizados de un edificio, con 7 (2d6) de daño por golpe.',
        'Solo la primera caída de un personaje hace avanzar 1 el suceso «Bandidos en alerta»; las demás no cuentan.',
        'Acceso a la ciudad: al terminar esta escena y acceder por primera vez a la ciudad, ver «Cómo moverse por Rathalas». Conexiones: esta zona conecta con el taller de carpintería (A4) y el laberinto de puentes (A6).',
      ],
      tips: [
        'Sube la apuesta en la prueba del primer PJ que elija esta ruta.',
      ],
      branches: [
        {
          label: 'Oportunidad en la prueba del primer PJ',
          description: 'Los demás PJs obtienen una ventaja en sus pruebas de Atletismo.',
        },
        {
          label: 'Complicación en la prueba del primer PJ',
          description: 'La CD sube a 14 para el resto del grupo: una cornisa se derrumba.',
        },
        {
          label: 'Fallar la prueba de Atletismo',
          description: 'Prueba de Agilidad CD 15 para salvarse (pierde 1 punto de concentración). Si la falla, cae 6 metros y sufre 7 (2d6) de daño por golpe.',
        },
      ],
    },
    {
      id: 'a4-taller-carpinteria',
      title: 'A4: El taller de carpintería',
      type: 'social',
      readAloud: 'Una docena de obreros aserran y labran maderas para vigas y rampas, mientras otros descansan en una cantina sin molestar a nadie. Entre ellos sobresale un herdaziano maduro al que todos tratan con respeto y que mantiene las distancias con seis bandidos armados que visten de verde. Subido a un banco, aplaude y anuncia que los recién llegados se presenten ante él para recibir faena.',
      content: [
        'Sobre el tejado fortificado de un edificio reventado funciona un taller donde los bandidos fabrican material para el asentamiento; en una bahía oculta hay además dos barcos. Esta zona conecta con el suelo del cañón (A1), la pared del risco (A3) y el laberinto de puentes (A6).',
        'Ubo, contramaestre (bandido, él), es herdaziano, de edad media, y Ylt no le inspira cariño alguno. Seis bandidos de túnica verde (fanáticos), fieles a Ylt, vigilan a su cuadrilla.',
        'Enfoques de conversación: si el grupo se acerca, Ubo supone que son nuevos reclutas. Los PJs que quieran convencerlo de que les ayude pueden intentarlo conversando (ver «Resolución de la conversación»). Enfoque de ejemplo: ayudar al pueblo de Rathalas. Ubo quiere proteger a tantos amigos como pueda; si los PJs superan las pruebas que demuestran su competencia y su voluntad de ayudar, comparte detalles sobre Teryn (la lugarteniente encarcelada de la antigua Reina Bandida) y sobre la prisión (A7). Si las pruebas fallan, Ubo les implora que abandonen Rathalas y regresen con un alto señor, pero los PJs saben que entonces los alezi probablemente reclamarían la hoja de Honor.',
        'Resistirse a la influencia: Ubo tiene Defensa cognitiva 11, Defensa espiritual 13 y 2 puntos de concentración. En las conversaciones gasta su concentración en resistirse a las discusiones que pongan en peligro a los carpinteros, pero no siente simpatía por los bandidos y se le puede convencer de que ayude de formas poco arriesgadas.',
        'Resolución de la conversación: termina con éxito si los PJs convencen a Ubo de que Rathalas puede salvarse de Ylt, o si Ubo ya no tiene concentración para resistirse. Si tras varios intentos el grupo no lo convence, Ubo decide que el intercambio es demasiado arriesgado y la conversación fracasa.',
        'Éxito: Ubo, contento de contar con aliados, les describe cómo está organizado el asentamiento, y por eso los PJs tienen ventaja en todas las pruebas para atravesar el laberinto de puentes (A6). Si todavía no había hablado de Teryn, ahora lo hace y aconseja sacarla de la prisión (A7).',
        'Fracaso: Ubo da por terminada la conversación y desaparece entre un numeroso grupo de trabajadores.',
      ],
      tips: [
        'Ubo atiende, pero prefiere pasar desapercibido: si la charla sube de tono, la da por terminada sin contemplaciones.',
      ],
      tables: [
        {
          title: 'Oportunidades y Complicaciones de Ubo',
          entries: [
            { roll: 'O', text: 'Ubo respalda a los PJs y el suceso «Bandidos en alerta» retrocede 1 espacio.' },
            { roll: 'C', text: 'Un fanático se aproxima para saber quién reclutó a los PJs y si profesan lealtad a Ylt.' },
          ],
        },
      ],
      branches: [
        {
          label: 'Éxito en la conversación',
          description: 'Ubo explica la disposición del asentamiento (ventaja en todas las pruebas del laberinto de puentes, A6) y recomienda liberar a Teryn de la prisión (A7).',
        },
        {
          label: 'Fracaso en la conversación',
          description: 'Ubo da por terminada la conversación y desaparece entre los trabajadores.',
        },
      ],
    },
    {
      id: 'a5-devotario',
      title: 'A5: El devotario',
      type: 'exploration',
      readAloud: 'Lo que queda del devotario es un pasillo abovedado excavado en la roca que da a una sala igualmente abovedada; el resto del edificio se vino abajo hace años. Los bandidos despejan allí los escombros para guardar cajas. En un arco con vistas a la ciudad calcinada, una mujer morena con ropa de cuero muy usada vigila con mirada afilada y regaña a los obreros cuando aflojan.',
      content: [
        'Rampas y escaleras llevan a un devotario en ruinas que los bandidos despejan para convertirlo en almacén de lo robado. Desde aquí se accede a A2 (puesto de vigilancia), A6 (laberinto de puentes), A7 (prisión) y A8 (corazón de la fortaleza).',
        'La mujer es Nadari (ladrona, ella) y manda en las labores. La acompañan cuatro bandidos y dos arqueros que guardan las cajas (ver la regla especial «Manos largas»). Desertó de las tropas del alto príncipe Thanadal: en las Llanuras Quebradas la dejaban de mensajera pese a ser mejor exploradora que casi todos los hombres, y eso le escocía. Es una superviviente y da por invencible a Ylt.',
        'Ante unos supuestos reclutas, Nadari ordena retirar escombros, un trabajo extenuante que supervisa sin piedad; consulta a los jugadores si se ponen a ello y cuánto tiempo aguantan. Tras dos horas de faena sin otra actividad, cada PJ supera una prueba de Atletismo CD 15 o queda Agotado [−1]. Terminadas las dos horas, Nadari les manda con aspereza al taller de carpintería (A4), al que se llega atravesando el laberinto de puentes (A6).',
        'Si el grupo intenta robar algo de las cajas, escapar o colarse por el devotario, se aplica «Seguir avanzando».',
        'Seguir avanzando: si el grupo no trabaja con diligencia durante dos horas, dirige un empeño (ver «Resolución del empeño»). Los enfoques posibles aparecen en las ramas de esta escena.',
        'Regla especial «Manos largas»: los PJs pueden examinar las cajas llenas de objetos robados con una prueba de Hurto CD 15, pero hacerlo aumenta en 1 el número de éxitos necesarios para el empeño. Es un buen momento para subir la apuesta. Con un éxito, el PJ roba un objeto de la tabla Objetos robados.',
        'Resolución del empeño: tiene éxito si el grupo consigue 3 éxitos antes que 3 fallos, o si cumple el objetivo de otra manera. Si el grupo intenta robar, el número de éxitos necesarios aumenta en 1 por cada intento.',
        'Éxito: el grupo cruza el devotario sin incidentes. Fracaso: Nadari los encara, los acusa de robar y avisa a los bandidos y arqueros que guardan las cajas para que los apresen.',
      ],
      tips: [
        'Evitar levantar sospechas, escalar de estructura en estructura y examinar las cajas son buenos momentos para subir la apuesta.',
      ],
      tables: [
        {
          title: 'Objetos robados (d4)',
          entries: [
            { roll: '1', text: 'Ropajes de fervoroso de buena calidad que valen 75 marcos.' },
            { roll: '2', text: 'Un libro sobre el Imperio azishiano que vale 30 marcos.' },
            { roll: '3', text: 'Un vial de veneno efectivo (1 dosis) y dos viales de perfume, estos últimos con un valor de 40 marcos.' },
            { roll: '4', text: 'Materiales para construir fabriales que valen 200 marcos.' },
          ],
        },
        {
          title: 'Oportunidades y Complicaciones del devotario',
          entries: [
            { roll: 'O', text: 'Los PJs captan algún dato valioso sobre Rathalas; por ejemplo, que Ylt posee una hoja esquirlada, que Teryn sigue presa o que Kaiana parece dudar de su lealtad.' },
            { roll: 'C', text: 'Nadari huele algo raro y se pone a indagar: la siguiente prueba de los PJs es una prueba opuesta frente a ella, con las habilidades que correspondan.' },
          ],
        },
      ],
      branches: [
        {
          label: 'Evitar levantar sospechas',
          description: 'Moverse con sigilo (prueba de Sigilo CD 13), marcarse un farol con bravuconería (prueba de Engaño CD 14) o usar disfraces (prueba de Hurto CD 12). Buen momento para subir la apuesta.',
        },
        {
          label: 'Provocar una distracción',
          description: 'Atraer a los bandidos hacia otra sección de la ciudad (prueba de Engaño CD 12) o provocar un derrumbe que investiguen (prueba de Manufactura CD 10).',
        },
        {
          label: 'Escalar de estructura en estructura',
          description: 'Rodear la zona escalando la pared del risco (prueba de Atletismo CD 12) o moviéndose con cuidado por los andamios (prueba de Agilidad CD 12). Buen momento para subir la apuesta.',
        },
        {
          label: 'Manos largas: examinar las cajas',
          description: 'Prueba de Hurto CD 15; los éxitos necesarios para el empeño aumentan en 1. Con un éxito, el PJ roba un objeto de la tabla Objetos robados.',
        },
      ],
    },
    {
      id: 'a6-laberinto-puentes',
      title: 'A6: El laberinto de puentes',
      type: 'exploration',
      readAloud: 'Ante vosotros se abre un barranco enorme sembrado de cascotes chamuscados que divide la ciudad en sectores habitados. Pasarelas de cuerda, rampas en ambos sentidos y senderos que se cuelan por edificios o túneles de roca unen los distintos niveles, y en muchos se nota el paso de bandidos o de animales salvajes. Cualquier ruta parece arriesgada y los niveles inferiores resultan impracticables.',
      content: [
        'Este gran barranco divide las zonas habitadas de Rathalas. Los bandidos han marcado algunos senderos seguros, pero para quien no los conoce abrirse paso entre tanta construcción es difícil y arriesgado. Esta zona conecta con la pared del risco (A3), el taller de carpintería (A4), el devotario (A5) y la prisión (A7).',
        'La primera vez que el grupo intenta cruzar el laberinto, debe encontrar una ruta segura mientras evita a los bandidos y a una jauría de sabuesos-hacha salvajes. Cuando los PJs elijan un destino, dirige un empeño (ver «Resolución del empeño»). Las estrategias posibles aparecen en las ramas de esta escena.',
        'Si el grupo entabló amistad con Ubo en el taller de carpintería (A4), obtiene una ventaja en las pruebas para cruzar estos puentes.',
        'Resolución del empeño: tiene éxito si el grupo consigue 5 éxitos antes que 3 fallos, o si cumple el objetivo de cualquier otra forma. Éxito: encuentra una ruta segura y llega a su destino. Fracaso: pasa demasiado tiempo en el laberinto y es acorralado por seis sabuesos-hacha; una vez derrotados, los PJs llegan a su destino sin más incidentes.',
      ],
      tables: [
        {
          title: 'Oportunidades y Complicaciones de los puentes',
          entries: [
            { roll: 'O', text: 'Desde un buen mirador se comprende cómo se enlazan casi todos los puentes, y las pruebas cognitivas del grupo tienen ventaja el resto del empeño.' },
            { roll: 'C', text: 'El suelo cede detrás del personaje y cae al abismo; quien lo siga debe buscar otro camino.' },
            { roll: 'C', text: 'Se oye el bramido de un sabueso-hacha en el abismo y otro más se suma a la jauría que persigue al grupo (ver «Resolución del empeño»).' },
          ],
        },
      ],
      branches: [
        {
          label: 'Inspeccionar los puentes',
          description: 'Muchos puentes parecen inestables: comprobar su construcción con una prueba de Manufactura CD 12 (el libro la imprime como «Artesanía CD 12»).',
        },
        {
          label: 'Atravesar escombros',
          description: 'Mantener el equilibrio sobre vigas quemadas (prueba de Agilidad CD 12) o escalar distancias cortas (prueba de Atletismo CD 13). Buen momento para subir la apuesta.',
        },
        {
          label: 'Explorar',
          description: 'Mirar adelante para ver si una ruta es viable (prueba de Percepción CD 12) o buscar señales de uso continuado (prueba de Supervivencia CD 13).',
        },
        {
          label: 'Éxito del empeño (5 éxitos antes que 3 fallos)',
          description: 'El grupo encuentra una ruta segura y llega a su destino.',
        },
        {
          label: 'Fracaso del empeño',
          description: 'Seis sabuesos-hacha acorralan al grupo; al derrotarlos, los PJs llegan a su destino sin más incidentes.',
        },
      ],
    },
    {
      id: 'a7-prision',
      title: 'A7: La prisión',
      type: 'exploration',
      content: [
        'En la prisión aguarda Kaiana, la Vigilante de la Verdad que es mano derecha de Ylt y atraviesa un conflicto interior; además, los PJs pueden liberar a unos cuantos presos que serían buenos aliados. El plano es el mapa 3.3. Desde aquí se llega a A5 (devotario), A6 (laberinto de puentes) y A8 (corazón de la fortaleza).',
        'Acceso a la prisión: el grupo entra al principio por las escaleras, una amplia escalera de piedra que baja desde una cornisa y unas plataformas hasta el pasillo de la antigua bodega de una vivienda (P1). Hay otras dos salidas hacia la fortaleza (A8): un túnel estrecho que los sirvientes usaban antaño para las entregas, y un pasillo al que da una puerta sin llave junto a las celdas.',
        'P1, el pasillo: al sur hay una puerta a la sala de estar (P2), al norte otra a la sala de los barriles (P3), y el pasillo termina al oeste en una puerta a las celdas (P4). Si el suceso «Bandidos en alerta» no se ha activado, los PJs precavidos pueden cruzarlo sin problemas. Si se ha activado, dos bandidos patrullan el pasillo (además de los de la sala de estar); si atrapan al grupo, ver «Fuga de la prisión».',
        'P2, la sala de estar: fue un elegante salón de los brillantes señores de la casa, que lo usaban para beber vino; conserva mobiliario antiguo de buena hechura, una estatua de un pollo de aspecto extraño tasada en 30 marcos y una alfombra con el emblema de Tanalan. Cuatro guardias de la prisión (bandidos) comen aquí sin prisa. Si los PJs llaman la atención, ver «Fuga de la prisión».',
        'P3, la sala de los barriles: la puerta está cerrada por fuera y un ventanuco en la madera deja entrar la luz y permite a los bandidos vigilar a los prisioneros. Es la zona de detención, llena de barriles vacíos. Los prisioneros actuales son cuatro bandidos leales, dos cantores, cuatro viajeros humanos de caravanas y Axies, el Coleccionista (él).',
        'Tuxli (cantora en forma diestra, ella) es una de las cantoras presas; en realidad es una espía oyente infiltrada. La otra cantora y los cuatro viajeros son plebeyos. Tuxli debía localizar rutas de suministro, pero la caravana en la que se coló cayó en manos de los bandidos. Desea huir; no obstante, si hay un PJ cantor, en vez de escapar sola se ofrece a ayudar. Lleva ropa discreta y los mechones pelirrojos rapados.',
        'Los cautivos están débiles, con la mitad de su salud, y precisan atención médica, en parte por falta de comida: a quien se alimente le vuelven 3 (1d6) puntos de salud. Si los PJs los liberan, pasad a «Fuga de la prisión».',
        'Conversar con Axies: intenta negociar su libertad y ofrece la información de las ramas de esta escena.',
      ],
      tips: [
        'Camino a la Radianza: un PJ que se centre en liberar a los prisioneros puede atraer la atención de un lumispren; uno que se centre en tratar sus dolencias, la de un cultivacispren.',
      ],
      branches: [
        {
          label: 'Axies: ¿qué haces aquí?',
          description: 'Dice que el portador de la hoja esquirlada creyó que valdría la pena hablar con él.',
        },
        {
          label: 'Axies: ¿quién eres?',
          description: 'Se presenta como Axies: viaja por Roshar investigando spren raros e interesantes y esperaba por fin ver un cautivospren.',
        },
        {
          label: 'Axies: ¿qué sabes de los líderes?',
          description: 'Ylt, el portador de esquirlada que tomó el poder, parece de los que nunca se conforman con lo que tienen; su segunda, la mujer reshi (Kaiana), no parece muy contenta con tanta ambición; y Teryn, la lugarteniente bandida de las celdas, parece culparse por no haber protegido a sus amigos.',
        },
        {
          label: 'Axies: ¿cómo puedes ayudarnos?',
          description: 'A cambio de su libertad, ofrece guiarlos hasta un spren muy antiguo que vive bajo la ciudad y es pariente de la Vigilante Nocturna; este da respuestas verdaderas en vez de bendiciones, y Ylt ha pasado muchas horas con ese Resto Gris buscando saber.',
        },
      ],
    },
    {
      id: 'a7-celdas-kaiana',
      title: 'P4: Las celdas (Kaiana y Teryn)',
      type: 'social',
      readAloud: 'Al fondo de la sala, a la luz de una lámpara de esferas, dos mujeres cuchichean dentro de una celda. Una, de brazos robustos y llenos de cicatrices, está esposada y tiene una herida abierta en la sien que soporta sin una queja. La otra, una reshi de túnica verde y dorada, le extiende un ungüento y, al respirar hondo, de su mano brota un resplandor tenue, como un humo luminoso.',
      content: [
        'Cuatro celdas de madera ocupan lo que fue una gran despensa. La única presa es Teryn (maestra lancera, esposada y sin armas; ella), pero comparte celda con Kaiana (ella). Teryn está esposada a la pared, y las llaves penden de un aro junto a la entrada. Kaiana le cura las heridas que sufrió por negarse a acatar a Ylt. Más sobre Teryn en su ficha de PNJ (resumen del recuadro «Teryn, la lugarteniente»).',
        'Si ya hay pelea o alboroto en la prisión, las dos aguardan calladas y en tensión, con la vista en la puerta, cuando llegan los PJs. En caso contrario, pasad a «Escuchar a escondidas».',
        'Escuchar a escondidas: Kaiana y Teryn muestran una camaradería improbable y están enfrascadas en su conversación cuando llega el grupo. Si los PJs se hacen notar, pasad a «Enfrentamiento con Kaiana». Si son sigilosos o escuchan desde fuera, lee el recuadro. Un PJ que intente acercarse lo bastante para oírlas debe hacer una prueba de Sigilo CD 13, subiendo la apuesta: si falla, Kaiana y Teryn lo descubren; si la supera, oye que Kaiana cree que los bandidos lograrán grandes cosas bajo Ylt, que Teryn cree que Ylt es como cualquier otro brillante señor dispuesto a abusar del poder, que Teryn le reprocha a Kaiana el asesinato de la Reina Bandida y que Kaiana dice no creer que matar sea el camino correcto y admite que la violencia de Ylt le parece equivocada.',
        'La reacción de Po\'ahu: identifica de inmediato la curación de Kaiana como potenciación y se pregunta en voz baja si habrá pronunciado los juramentos. Además, si los PJs no reconocen a Kaiana, Po\'ahu sí: les cuenta que era aliada de los asesinos de Taszo, pero que también se enfrentó a Ylt para intentar detener su asesinato.',
        'Enfrentamiento con Kaiana: no contaba con los PJs. Habla con franqueza y no rehúye la charla, pero recela de los intrusos, se enfurece con facilidad si la provocan y defiende a Ylt. Teryn escucha con atención y solo se mete si se habla de los bandidos. Kaiana sabe que está en inferioridad numérica: a quien se muestre cortés le aconseja irse, y si la amenazan con violencia huye con Destello desorientador (ver «Resultado de la conversación»).',
        'Para que Kaiana dude de Ylt, los PJs pueden conversar con ella (ver «Resolución de la conversación»). Con caos o pelea en la prisión, las pruebas para persuadirla tienen desventaja. Teryn interviene cuando se trata el bienestar de los bandidos: da ventaja a la prueba de quien lo aborda y desventaja a la de quien lo ignora. Los enfoques de ejemplo están en las ramas de esta escena.',
        'Resistencia de Kaiana: Defensa cognitiva 13, Defensa espiritual 16 y 4 puntos de concentración. Responde bien a la compasión, pero paga 2 puntos de concentración para oponerse a amenazas o a argumentos contra Ylt. Si un razonamiento muy agresivo la arrincona, tira Liderazgo con +4 y afirma que Ylt habla por la Heraldo Pala y que sus visiones merecen atención; si el resultado iguala o supera la Defensa espiritual de un PJ, ese PJ gasta 2 puntos de concentración para resistirse o abandona la conversación.',
        'Resultado de la conversación: tiene éxito si el grupo convence a Kaiana de cuestionar su lealtad a Ylt, ya sea con argumentos especialmente convincentes o porque Kaiana se quede sin concentración. Si los PJs no son convincentes y fracasan en varios intentos, decide cuándo ha tenido suficiente y da por terminada la conversación; también fracasa si algún PJ actúa con hostilidad.',
        'Éxito: Kaiana reconoce que los PJs tienen razón en parte, pero sigue pensando que Ylt es demasiado peligroso, sobre todo armado con la hoja de Honor, como para que lo desafíen. Promete frenar su violencia y pide al grupo que no intervenga de forma directa. Entrega las llaves de la celda de Teryn y se va sin dar la voz de alarma a los guardias bandidos.',
        'Fracaso: Kaiana da por concluida la conversación y huye para advertir a Ylt de los intrusos. Al irse les dice que claramente no están preparados para la verdad de en qué se está convirtiendo Roshar, que espera que encuentren la paz y que no se hace responsable de sus decisiones. Agita la mano y un destello cegador y un estallido como un trueno llenan la estancia; luego desaparece. La puerta de la prisión queda abierta y a lo lejos los guardias se gritan entre sí.',
        'Kaiana usa Destello desorientador y sale corriendo de la prisión por el túnel o el pasillo que llevan a la fortaleza (A8). Una vez que huye, el grupo debe escapar rápido: si sale directamente de la prisión, no encuentra guardias; si intenta reclutarlos, ver «Fuga de la prisión».',
      ],
      tips: [
        'Las pruebas para persuadir a Kaiana tienen desventaja si hay caos o pelea en la prisión.',
        'Argumentar que las acciones de Ylt son malignas es un buen momento para subir la apuesta.',
        'Los PJs con metas sobre los Heraldos, las hojas de Honor o los Radiantes pueden aprender más hablando con Kaiana.',
      ],
      tables: [
        {
          title: 'Oportunidades y Complicaciones de escuchar a escondidas',
          entries: [
            { roll: 'O', text: 'Lo que oye le sirve para persuadir a Kaiana: en la conversación, tiene éxito automático en una prueba a su elección.' },
            { roll: 'C', text: 'Lo que oye le siembra dudas y pierde 1 punto de concentración.' },
          ],
        },
        {
          title: 'Oportunidades y Complicaciones de Kaiana',
          entries: [
            { roll: 'O', text: 'Teryn apoya el argumento del PJ y Kaiana pierde 1 punto de concentración.' },
            { roll: 'C', text: 'Una campana avisa del relevo de guardia, y Kaiana advierte de que pronto pasarán patrullas bandidas por la zona.' },
          ],
        },
      ],
      branches: [
        {
          label: 'Argumentar que las acciones de Ylt son malignas',
          description: 'Kaiana está tensa al verse obligada a enfrentarse a las acciones de Ylt y comprende intrínsecamente el Primer Ideal (el fin no justifica los medios). Fallo: explica que hay una perspectiva más amplia que el grupo no tiene en cuenta. Éxito: se resiste gastando concentración y defiende a Ylt sin mucho convencimiento. Buen momento para subir la apuesta.',
        },
        {
          label: 'Explicar la importancia de su búsqueda',
          description: 'Kaiana es receptiva a que la hoja de Honor debe alejarse de manos equivocadas, pero está convencida de que Ylt es digno de empuñarla. Mencionar a los chamanes de piedra da ventaja a la siguiente prueba (se siente culpable por no haber hecho nada cuando Ylt mató a los compañeros de Taszo). Fallo: dice que Ylt actúa a instancias de la Heraldo Pala y puede preguntar por los planes del grupo para la hoja.',
        },
        {
          label: 'Expresar preocupación por Kaiana',
          description: 'La sorprende que le pregunten por sus sentimientos: la primera vez, la prueba obtiene una ventaja. Fallo: se siente tratada con condescendencia. Éxito: no se resiste gastando concentración y confiesa que últimamente Ylt parece distinto del mentor que la apoyó con entusiasmo y la capacitó para explorar sus capacidades Radiantes.',
        },
        {
          label: 'Éxito en la conversación',
          description: 'Kaiana se compromete a oponerse a la violencia de Ylt, pero pide al grupo que no intervenga directamente; entrega las llaves de la celda de Teryn y se va sin avisar a los guardias.',
        },
        {
          label: 'Fracaso en la conversación',
          description: 'Kaiana huye con Destello desorientador por el túnel o el pasillo hacia la fortaleza (A8) para advertir a Ylt.',
        },
      ],
    },
    {
      id: 'a7-fuga-prision',
      title: 'Fuga de la prisión',
      type: 'combat',
      content: [
        'Liberar a los presos o pelear contra los guardias de la prisión plantea varios obstáculos.',
        'Liberar a los presos: Teryn está encadenada a la pared y las llaves de sus grilletes se hallan al lado de la puerta de las celdas (P4). Los cautivos de P3 están muertos de miedo, pero Teryn consigue que los cuatro bandidos presos luchen por el grupo. Axies prefiere seguir en Rathalas con su investigación y no ayuda en el combate.',
        'Enfrentamiento con los guardias: son hostiles, pero titubean antes de atacar si el grupo lleva a un bandido leal liberado. Al principio hay cuatro guardias bandidos (en P2); si «Bandidos en alerta» se activó, se suman dos bandidos más (en P1). Puede que el grupo ya haya acabado con alguno.',
        'Reclutar guardias: un PJ hace una prueba de Liderazgo CD 15 subiendo la apuesta, con ventaja si Teryn los acompaña. Si triunfa, la mitad de los guardias (redondeando hacia arriba) se pasa al bando de los leales contra Ylt y los demás atacan. Una Oportunidad en la prueba hace que un bandido, torpe por la duda, suelte su maza. Una Complicación indica que esos guardias son especialmente fieles a Ylt y combaten hasta morir; en los otros casos, huyen al quedarse con menos de la mitad de su salud.',
        'Aliados bandidos: una vez resuelta la situación en la prisión, los bandidos reclutados siguen hasta el corazón de la fortaleza (A8) para enfrentarse a Ylt. Según cómo se haya resuelto, el grupo podría liderar hasta siete bandidos leales (tres guardias de la prisión y los cuatro leales encarcelados en P3), además de Teryn y Tuxli.',
      ],
      tips: [
        'Cuenta cuántos PNJ aliados consigue el grupo: en la batalla del salón se elimina un fanático por cada dos aliados (máximo cuatro).',
      ],
      branches: [
        {
          label: 'Reclutar a los guardias: prueba de Liderazgo CD 15 superada',
          description: 'Se pasan a los leales la mitad de los guardias, redondeando al alza; el resto lucha. Si Teryn va con el grupo, la prueba tiene ventaja.',
        },
        {
          label: 'Oportunidad en la prueba de Liderazgo',
          description: 'Uno de los bandidos titubea torpemente y deja caer su maza.',
        },
        {
          label: 'Complicación en la prueba de Liderazgo',
          description: 'Estos guardias demuestran una lealtad especial a Ylt y luchan hasta la muerte; los demás huyen cuando su salud baja de la mitad.',
        },
      ],
    },
    {
      id: 'a8-corazon-fortaleza',
      title: 'A8: El corazón de la fortaleza',
      type: 'narrative',
      readAloud: 'La caverna es inmensa y uno de sus lados se abre al cañón, frente a las ruinas de un palacio que fue blanco. Una gran plataforma circular de madera cuelga de cadenas de hierro y llena todo el espacio, con una multitud expectante que mira hacia una cornisa tallada. En ella, sobre un estrado, un hombre alto de piel dorada, con túnica verde y un glifo verde pintado en torno a los ojos hasta la punta de la barbilla, domina a la gente.',
      content: [
        'Desde esta gran oquedad abierta al cañón, con el palacio en ruinas de Rathalas a la vista, Ylt arenga a sus seguidores. Es el punto crítico: según lo que haya hecho el grupo, quizá unos bandidos, tal vez capitaneados por Teryn, se han propuesto quitarle la ciudad a Ylt, y Kaiana puede estar dudando de su mentor sin atreverse todavía a romper con él. Sea como sea, el grupo tiene ocasión de inclinar la balanza del poder en la ciudad quemada.',
        'Esta zona conecta con el devotario (A5) y la prisión (A7), y también conduce a la Baja Rathalas.',
        'Ylt está en la cornisa oeste, esperando a que sus seguidores se reúnan. Kaiana está junto a él; según el trato previo con los PJs (si lo hubo), puedes describirla hablándole en voz baja, lanzándoles miradas de advertencia o simplemente quedándose a su lado en silencio.',
        'Una estrecha cresta transitable rodea la mayor parte de la cueva y termina a tres metros de la cornisa de Ylt. Los PJs y sus aliados entran por el túnel sureste, al fondo de la multitud. Nadie los aborda mientras se queden ahí; cada PJ puede decidir si se une a la multitud en la plataforma circular o permanece en la cresta junto al túnel.',
        'Cuando Teryn va con los PJs, desafía con arrojo a Ylt a un duelo por el mando de Rathalas. Ylt no le hace caso y mira, en cambio, cómo se llenan de bandidos y de fanáticos los túneles y cornisas de alrededor.',
        'Si el grupo ataca, pasad a «La batalla del salón». Si espera a que se sucedan los acontecimientos, sigue con «El discurso de Ylt».',
      ],
      branches: [
        {
          label: 'El grupo ataca',
          description: 'Pasad directamente a «La batalla del salón».',
        },
        {
          label: 'El grupo espera',
          description: 'Ylt pronuncia su discurso («El discurso de Ylt») y acaba rompiendo una cadena de la plataforma.',
        },
      ],
    },
    {
      id: 'a8-discurso-ylt',
      title: 'El discurso de Ylt',
      type: 'narrative',
      readAloud: 'Ylt arenga a la multitud con voz firme y apasionada: dice que el pueblo de Rathalas no está solo ni indefenso y que, confiando en los Heraldos, puede renacer mediante el moldeado de almas. Entre vapores de niebla hace surgir en su mano una hoja larga y fina: es la hoja de Honor que le robó a Taln.\n\nLuego baja del estrado y anuncia a grandes zancadas que llega la Noche de las Penas, la verdadera Desolación, y que hay que volver a pronunciar las antiguas Palabras, pero antes hay que eliminar a los intrusos. Mientras los bandidos se giran hacia vosotros, Ylt descarga la hoja sobre una de las cadenas de la plataforma, que revienta con un chasquido: la plataforma tiembla y se inclina.',
      content: [
        'Si los PJs esperan, lee la primera parte (el discurso a la multitud y la aparición de la hoja de Honor). Dales un momento para reaccionar: pueden interrumpir la acción o esperar a más acontecimientos. Si permanecen en silencio, Ylt continúa con la segunda parte.',
        'Ylt baja de su estrado y avanza con zancadas dramáticas, acentuando sus palabras. Anuncia la tormenta eterna y llama a los parias de Rathalas a pronunciar de nuevo las antiguas Palabras; promete que su valor será recompensado en los Salones Tranquilos.',
        'Mientras la plataforma se tambalea, pasad a «La batalla del salón».',
      ],
      tips: [
        'Dales un momento a los jugadores para que reaccionen: pueden interrumpir la acción o esperar a más acontecimientos.',
      ],
    },
    {
      id: 'a8-batalla-salon',
      title: 'La batalla del salón',
      type: 'combat',
      readAloud: 'Ylt alza la palma y la roca bajo sus pies se retira. Al instante, una gigantesca púa de piedra revienta la plataforma desde abajo y todo el suelo de madera se sacude y se hunde.',
      content: [
        'Por sencillez, los aliados del grupo, los bandidos leales a Ylt que están más lejos y la muchedumbre quedan fuera del combate: describe su pelea como telón de fondo, mientras los PJs afrontan al maestro lancero, a los arqueros y a los fanáticos que queden.',
        'Disposición: lo normal es que los PJs empiecen en el lado este de la plataforma o junto al pasaje este (mapa 3.4). Ylt y Kaiana empiezan en la cornisa oeste, con dos arqueros; el estrado circular de la cornisa mide 1,5 metros de altura. Las demás fuerzas de Ylt son seis fanáticos y un maestro lancero, repartidos por la plataforma de madera de modo que impidan el acceso a Ylt y los arqueros.',
        'Reducción por aliados: por cada dos PNJ que el grupo consiga como aliados, reduce en uno el número de fanáticos enemigos, a medida que Teryn y sus leales reclutados se unen a la lucha. Por ejemplo, si los PJs salieron de la prisión con cuatro reclutas, elimina dos fanáticos. Como máximo, elimina cuatro fanáticos.',
        'Las acciones de Ylt: empieza el combate en la cornisa de piedra estable al oeste, justo encima de la pesada cadena que acaba de cortar. Este combate no está diseñado para que él participe, así que se retira lo antes posible: para facilitarlo, puede usar cualquier acción de su ficha como 1 acción (▶) durante esta escena, aunque normalmente requiera 2 (▶▶). Tiene turno rápido y turno lento, y usa su rasgo Jefe para gastar concentración y obtener una acción adicional después del turno de cada PJ.',
        'A la menor oportunidad, usa Lanza de piedra (como ▶) para derrumbar por completo la plataforma sobre la que están los PJs y sus propios fanáticos (lee el recuadro).',
        'La plataforma se desploma 4,5 metros hasta los escombros de abajo (mapa 3.5) y los presentes caen con ella. Todos los PJs que estén en la plataforma deben hacer una prueba de Agilidad CD 12 y sufren 3 (1d6) puntos de daño por golpe si fallan. La mitad de los fanáticos sufre 3 puntos de daño cada uno por el aterrizaje brusco.',
        'Al caer la plataforma, el rasgo Tierra fluida lleva a Ylt 4,5 metros hacia el pasaje oeste sin gastar acción. Después exige a Kaiana con brusquedad que lo siga; si ella llega antes de que le toque jugar, Ylt usa Piedra de salto (▶) para trasladarla personalmente al túnel. Con Kaiana ya en el pasaje, Ylt emplea la potencia de Cohesión (▶) que le da la hoja de Honor de Taln para sellar la piedra a sus espaldas y tapiar la salida oeste.',
        'Las acciones de Kaiana: pese a haber interactuado con el grupo, sigue siendo reacia a luchar contra Ylt. Juega un turno rápido inmediatamente después de los PJs y sigue a Ylt al túnel antes de que él lo selle con Cohesión. El grupo queda abandonado a su suerte: los PJs no recuperan la hoja de Honor.',
        'Campo de batalla, Escombros peligrosos: avanzar entre los restos de la plataforma caída resulta arduo, así que sube la apuesta con frecuencia. La madera rota del mapa 3.5 cuenta como terreno difícil, y quien quede Tumbado sobre ella sufre 2 (1d4) de daño por laceración por las astillas.',
        'Campo de batalla, Escalada difícil: el cascajo de piedra que rodea la plataforma caída solo se cruza trepando. Subir 4,5 metros desde la plataforma hasta la cornisa estable superior exige una prueba de Atletismo CD 12, o CD 8 para quien se agarre a la cadena entera del extremo sur de la plataforma.',
      ],
      tips: [
        'Para simplificar, narra de fondo la lucha de los aliados, los leales a Ylt y la multitud.',
        'Sube la apuesta a menudo al moverse entre los escombros de la plataforma caída.',
      ],
      tables: [
        {
          title: 'Oportunidades y Complicaciones de la batalla del salón',
          entries: [
            { roll: 'O', text: 'Un bandido leal vitorea el triunfo del PJ y lo anima: el PJ recibe el estado Concentrado hasta el fin de su próximo turno.' },
            { roll: 'O', text: 'Un enemigo, al ver que la lucha se tuerce, sale corriendo.' },
            { roll: 'C', text: 'Se desprenden escombros de arriba: el personaje y quienes estén a 1,5 metros o menos deben superar una prueba de Agilidad CD 15 (con la reacción Evitar peligro) o recibir 3 (1d6) de daño por golpe.' },
            { roll: 'C', text: 'La plataforma de madera termina de quebrarse y aprisiona al personaje, que queda Inmovilizado. Él mismo, o quien lo tenga cerca, puede Usar una habilidad (▶) con una prueba de Atletismo CD 10 para liberarlo de los restos.' },
          ],
        },
      ],
    },
    {
      id: 'repercusiones',
      title: 'Repercusiones',
      type: 'narrative',
      content: [
        'Los fanáticos pelean hasta morir, absorbidos por la fe en las perversas doctrinas de Ylt.',
        'Si ganan los fanáticos, Teryn cae en combate y desarman y encierran a los PJs; entonces eres tú quien decide cómo continúa la historia.',
        'Si los fanáticos pierden, Teryn y los bandidos que le son fieles respetan y agradecen a los PJs. Los suyos los curan y les brindan refugio para pasar la noche.',
        'No hay rastro de Ylt ni de Kaiana. Solo queda una porción de roca anormalmente lisa en el lugar donde se abría un acceso a un corredor. Si los PJs no estaban cerca para verlo, un leal de Teryn cuenta que presenció cómo ambos se internaban en la piedra. Los bandidos ignoran su destino.',
        'Cuando todo se serena, Axies, el Coleccionista, se acerca al grupo: sabe que Ylt consultó a un spren antiguo que habita bajo la ciudad, el Resto Gris (él), y propone acompañarlos para buscarlo, pues quizá conozca los planes de Ylt. Pasad a «La Baja Rathalas».',
      ],
      branches: [
        {
          label: 'Los fanáticos salen victoriosos',
          description: 'Teryn muere en batalla y los PJs son desarmados y encarcelados; el director decide cómo sigue la historia.',
        },
        {
          label: 'Los fanáticos son derrotados',
          description: 'Teryn y sus leales respetan y aprecian a los PJs, les dan atención médica y un lugar seguro para la noche. Axies propone ir a buscar al Resto Gris.',
        },
      ],
    },
    {
      id: 'baja-rathalas',
      title: 'La Baja Rathalas',
      type: 'exploration',
      readAloud: 'El túnel hacia la Baja Rathalas es sorprendentemente liso, aunque Axies opina que no lo ha cortado una hoja esquirlada. Huele a humedad por las filtraciones del mar de las Lanzas y, entre putrispren y paredes que devuelven los ecos, se notan marcas de dónde se trabajó o se colocó la piedra.',
      content: [
        'Cuando el grupo está listo para buscar al Resto Gris, Axies, el Coleccionista, intenta guiarlo sin pensárselo dos veces por antiguos pasajes bajo las ruinas de la Rathalas actual. Quizá lo hace para saldar una deuda por su libertad, o quizá haya pedido ayuda para orientarse por los viejos túneles.',
        'Si los PJs se dejan llevar por Axies, se ve que no tiene claro el rumbo. Un PJ puede tomar la iniciativa de guiar al grupo con una prueba de Supervivencia CD 14: si la supera, la marcha es tranquila y llegan al templo donde está la Cámara de los Heraldos. Si falla, o si dejan que guíe Axies, el trayecto se alarga mucho entre varios desvíos erróneos y todos llegan Agotados [−1].',
      ],
      branches: [
        {
          label: 'Un PJ guía y supera Supervivencia CD 14',
          description: 'El viaje transcurre sin contratiempos y llegan al templo que alberga la Cámara de los Heraldos.',
        },
        {
          label: 'Falla la prueba o los guía Axies',
          description: 'El viaje se alarga con varios giros equivocados y todos los personajes llegan Agotados [−1].',
        },
      ],
    },
    {
      id: 'templo-heraldos',
      title: 'El templo de los Heraldos',
      type: 'exploration',
      readAloud: 'Os encontráis en lo que queda de un templo antiguo, tallado a gran profundidad en la pared del risco. Enormes murales cubren los muros: portadores de esquirlada con armaduras imponentes combaten contra monstruos gigantescos y seres blindados de fuego y viento. Son los Radiantes Perdidos en su guerra contra los Portadores del Vacío.',
      content: [
        'Las cámaras y túneles proceden de los inicios del vorinismo, época en la que se aclamaba a los Caballeros Radiantes como héroes y pilares de la sociedad.',
        'Si los PJs examinan los murales, una prueba de Deducción, Saber o Percepción CD 13 revela detalles adicionales: cada caballero va acompañado por una figura que se parece a un spren; los Radiantes luchan con armas diversas, no solo con hojas esquirladas; y el mural tiene más de dos mil años, por lo que es anterior a la Traición.',
        'Quien tenga pericia en Religión sabe que el Día de la Traición fue cuando los Radiantes Perdidos traicionaron a la humanidad y se apartaron de ella.',
      ],
      branches: [
        {
          label: 'Prueba de Deducción, Saber o Percepción CD 13',
          description: 'Cada caballero lleva una figura parecida a un spren; los Radiantes usan armas diversas, no solo hojas esquirladas; el mural tiene más de dos mil años y es anterior a la Traición.',
        },
        {
          label: 'Pericia en Religión',
          description: 'Sabe que el Día de la Traición fue cuando los Radiantes Perdidos traicionaron a la humanidad y se separaron.',
        },
      ],
    },
    {
      id: 'camara-heraldos',
      title: 'Cámara de los Heraldos',
      type: 'exploration',
      readAloud: 'La sala es circular y austera, de unos quince metros de diámetro, con una bóveda de artesonado. Diez hornacinas regulares albergan sendas estatuas de tamaño natural sobre pedestales altos. El tiempo las ha castigado y solo tres conservan rasgos que aún se distinguen.',
      content: [
        'Un personaje con pericia en Religión, o que supere una prueba de Deducción o Saber CD 8, reconoce las tres estatuas legibles como representaciones de Heraldos (descritos en «Historia de Roshar», en la introducción del libro).',
        'Taln, Heraldo de la Guerra: hombre makabaki musculoso, con barba pulcra y una armadura impresionante. Nale, Heraldo de la Justicia: hombre makabaki calvo con una marca de medialuna en la mejilla derecha. Pailiah, Heraldo del Conocimiento: mujer alezi o veden de pelo largo, con una túnica similar a la de Ylt y sus acólitos.',
        'Examinar las otras siete estatuas permite una prueba de Percepción CD 15; con éxito, se descubre a le spren Código.',
        'Código (elle) observa al grupo desde detrás de una estatua en ruinas. Es une críptique, también llamados mentiraspren, con un patrón que se asemeja a una arquitectura infinitamente cambiante de columnas, escaleras y arcos entrelazados.',
        'A Código le interesan las mentiras que cada cual se cuenta a sí mismo y le atraen sobre todo los arrogantes y los excesivamente seguros de sí. Sentía fascinación por Ylt y vio cómo dominaba primero a los bandidos y luego, con una impostura descarada y fantasiosa, los convertía en fanáticos.',
        'Cualquier PJ que revele una verdad dolorosa al Resto Gris (ver «El Resto Gris») capta la atención de Código, sobre todo si admite haber mentido sobre aspectos de sí mismo. Cuando el grupo se marcha, le spren los sigue fuera de Rathalas.',
      ],
      tips: [
        'Quien revele una verdad dolorosa al Resto Gris, sobre todo si admite haber mentido sobre sí mismo, capta la atención de Código.',
      ],
    },
    {
      id: 'el-resto-gris',
      title: 'El Resto Gris',
      type: 'social',
      readAloud: 'Una gota de barro húmedo cae a vuestro lado, y luego otra. En el techo, los paneles se llenan de un lodo parecido al crem que se agita como si tuviera vida; de él emergen dedos y, enseguida, decenas de manos flacas que se mueven cada una por su cuenta, entre la súplica, la violencia y la desesperación. Una voz grave y rasposa os dice que, como él, buscáis la verdad, pero que la verdad debe doler.',
      content: [
        'Aparece cuando los PJs han examinado las estatuas o cuando alguno llama a gritos al Resto Gris.',
        'Una verdad dolorosa: los spren son manifestaciones del pensamiento y la percepción, y al haber caído en el olvido, el Resto Gris ha perdido fuerza y coherencia. Un vínculo espiritual con un personaje refuerza su mente, de modo que, a cambio de lo que sabe, pide que un PJ le confíe una verdad dolorosa, por ejemplo algún hecho o hallazgo ligado al obstáculo de ese PJ. Debe notarse como un sacrificio: soltar una mentira que consuela o encarar algo que el PJ eludía.',
        'Otra verdad: una vez compartida la verdad dolorosa, usa la información de las ramas de esta escena para guiar la conversación del Resto Gris, con Axies interviniendo de vez en cuando con sus propias preguntas.',
        '¿Sabes adónde se dirige Ylt? Es la información más importante que puede compartir el Resto Gris, así que si los PJs no se lo preguntan, Axies lo hará.',
        'Además, el Resto Gris contesta dudas sobre qué son las potencias, el vínculo Nahel y el Primer Ideal.',
      ],
      tips: [
        'Una verdad dolorosa debería sentirse como un sacrificio, no como un trámite; una buena opción es un suceso o descubrimiento ligado al obstáculo del PJ.',
        'Si los PJs no preguntan adónde se dirige Ylt, Axies lo hará.',
        'Si el Resto Gris se siente amenazado, puede retirarse a las piedras.',
      ],
      branches: [
        {
          label: '¿Qué sabes sobre Ylt?',
          description: 'Es un Vigilante de la Verdad al servicio de la Heraldo Pailiah, pero el Resto Gris presiente que un antiguo enemigo influye en su mente. Ylt cree que entregar la hoja de Honor a los chamanes de piedra shin aceleraría la destrucción del mundo. Tiene el don de ver el futuro, pero el spren teme que sus profecías estén nubladas y distorsionadas por su ambición.',
        },
        {
          label: '¿Qué te preguntó Ylt?',
          description: 'Buscaba conocimientos antiguos, historias de los Heraldos y de cómo surgieron. Quería unirse a ellos, pero el Resto Gris le advirtió que solo debe haber diez.',
        },
        {
          label: '¿Se puede confiar en Pailiah y los demás Heraldos?',
          description: 'Los Heraldos se quebraron hace mucho tiempo; el Resto Gris cree que ahora serán representantes aún menos fiables.',
        },
        {
          label: 'Axies: ¿qué son las sombras de Rall Elorim?',
          description: 'Son almas extraviadas unidas a sombraspren, seres que no están vivos ni muertos. (Rall Elorim, ciudad del extremo noroeste de Roshar, es un lugar clave en los capítulos 6 y 7.)',
        },
        {
          label: 'Axies: ¿cómo puedo llegar a estos sombraspren?',
          description: 'Sus esencias están atrapadas en gemas escondidas bajo la Ciudad de las Sombras.',
        },
        {
          label: '¿Sabes adónde se dirige Ylt?',
          description: 'Ylt y sus acólitos van tras la bendición de la madre del Resto Gris, la Vigilante Nocturna, y se encaminan a su valle. Quien tenga pericia en Folclore o Religión sabe que la Vigilante Nocturna concede a la vez una bendición y una maldición, lo que los alezi llaman Antigua Magia. Quien tenga al menos un grado en Saber sabe que al valle se llega por la nación del Gran Hexi.',
        },
      ],
    },
    {
      id: 'despedida-resto-gris',
      title: 'La advertencia del Resto Gris',
      type: 'narrative',
      readAloud: 'La forma del spren se agita y su voz vuelve a rasparse: ahora es él quien os regala una verdad dolorosa. El camino que os aguarda será duro; se acerca la tormenta eterna, los Heraldos caerán y vuestros juramentos serán puestos a prueba. De repente las manos se quedan quietas; el spren dice que está agotado, agradece vuestro obsequio y se sumerge en el techo, escurriéndose por las fisuras de la roca antigua.',
      content: [
        'Cuando el grupo tiene toda la información que necesita, el Resto Gris lanza una última advertencia y se retira.',
      ],
    },
    {
      id: 'el-viaje-continua',
      title: 'El viaje continúa',
      type: 'narrative',
      content: [
        'Gracias a lo que ha revelado el Resto Gris, el grupo puede salir de Rathalas y seguir la pista de Ylt y sus acólitos hasta el Gran Hexi.',
        'Ylt y Kaiana zarparon en uno de los barcos de los bandidos; los leales de Teryn ponen a disposición de los PJs otra nave para darles caza.',
        'Concluidas las peripecias en la ciudad quemada, los personajes alcanzan el nivel 4.',
      ],
    },
  ],

  npcs: [
    {
      name: 'Lorn',
      pronouns: 'él',
      type: 'Bandido desertor (anciano curtido)',
      role: 'neutral',
      traits: ['Amistoso', 'Reservado con lo que cuenta', 'Leal a la Reina Bandida'],
      goal: 'Encontrar trabajo en las Llanuras Quebradas, lejos de los bandidos de Ylt, y enterarse de las noticias de los campamentos de guerra.',
      appearance: 'Anciano curtido y armado que acampa a resguardo de un lait, una formación natural que bloquea los vientos del este.',
      notes: 'El libro no trae un recuadro «Cómo interpretar a Lorn»; usa la ficha de bandido. Desertor leal a la Reina Bandida que se fue cuando Ylt la mató; no se delata como exbandido. Con una prueba de Persuasión CD 12 revela que no todos están contentos con el nuevo líder y menciona a Ubo, contramaestre de la carpintería. Se le reconoce como bandido con pericia en Bajos fondos o Deducción o Perspicacia CD 13; la patrulla Kholin quiere arrestarlo (Intimidación, Liderazgo o Persuasión CD 14 para evitarlo). Su trato puede atraer a un lumispren (animarlo a una vida mejor) o a un altospren (entregarlo).',
    },
    {
      name: 'Ubo',
      pronouns: 'él',
      type: 'Contramaestre herdaziano (bandido)',
      role: 'ally',
      traits: ['Precavido', 'Amable', 'Atento'],
      goal: 'Asegurarse de que sus amigos y colegas están a salvo.',
      appearance: 'Ubo («OO-boh») es un humano herdaziano de mediana edad y gran elegancia; lleva las uñas pintadas de colores vivos que combinan con los toques de color de su ropa de trabajo.',
      notes: 'Antes era contramaestre de un navío mercante que los bandidos de Rathalas apresaron en el mar de las Lanzas; hoy dirige el taller de carpintería (A4) y pone su buen ojo para los números al servicio de los bandidos, sin renunciar a vestir con estilo. Escucha con atención, pero no quiere llamar la atención: si la charla se vuelve ruidosa o acalorada, la corta. No siente afecto por Ylt ni simpatía por los bandidos. Defensa cognitiva 11, Defensa espiritual 13, 2 puntos de concentración. Si lo convencen, explica la disposición del asentamiento (ventaja en el laberinto de puentes) y recomienda liberar a Teryn.',
    },
    {
      name: 'Nadari',
      pronouns: 'ella',
      type: 'Ladrona, desertora de las fuerzas de Thanadal',
      role: 'neutral',
      traits: ['Implacable', 'Superviviente', 'Convencida de que Ylt es invencible'],
      goal: 'Sacar adelante el trabajo del devotario bajo el mando de Ylt, a quien considera invencible, y sobrevivir.',
      appearance: 'Mujer de pelo oscuro, con ropa de cuero desgastada y ojos penetrantes; vigila desde un arco y grita cuando los trabajadores reducen el ritmo.',
      notes: 'El libro no trae un recuadro «Cómo interpretar a Nadari»; usa la ficha de ladrón. Desertó de las tropas del alto príncipe Thanadal: en las Llanuras Quebradas, donde se curtió, la dejaban de mensajera pese a ser mejor exploradora que casi todos los hombres, y eso le escocía. Dirige el devotario con cuatro bandidos y dos arqueros que custodian las cajas. Si los PJs se hacen pasar por reclutas, les manda limpiar escombros (Atletismo CD 15 tras dos horas, o Agotados [−1]). Si nota algo sospechoso, la siguiente prueba es opuesta contra ella; si el empeño fracasa, los acusa de robo y llama a los bandidos y arqueros.',
    },
    {
      name: 'Teryn',
      pronouns: 'ella',
      type: 'Maestra lancera, lugarteniente de la Reina Bandida (prisionera)',
      role: 'ally',
      traits: ['Resuelta', 'Paciente', 'Estratégica'],
      goal: 'Sobrevivir y liberar Rathalas de las garras de Ylt.',
      appearance: 'Teryn («TARE-in») es una humana alezi de físico poderoso lleno de cicatrices, con el pelo afeitado a ambos lados y una sola trenza.',
      notes: 'Esposada a la pared de una celda (P4) y herida por negarse a someterse a Ylt; usa la ficha de maestro lancero (esposada y desarmada). Le repugnan la alta sociedad alezi y sus formas, aunque siente simpatía por los creyentes y respeto por los fervorosos. Aguarda en prisión una ocasión para plantar cara a Ylt desde una posición de fuerza y espera que sembrar dudas en Kaiana le abra una salida. La lección que sacó del Espina Negra es que los fuertes se quedan con lo que quieren y los débiles se pliegan o mueren: busca ser fuerte, pero antepone seguir viva. Trasfondo (recuadro «Teryn, la lugarteniente»): con trece años, hija de un pescador del séptimo nahn, fue salvada por fervorosos que guiaron a los niños a las cavernas tras su devotario cuando Dalinar incendió la ciudad; ya bandida, se hizo luchadora y lugarteniente de la Reina Bandida. Tras la llegada de Ylt se negó a jurarle lealtad, pero hizo que sus partidarios se sometieran; él le perdonó la vida y la mandó a prisión. Si se libera, anima a los cuatro bandidos presos a luchar, reta a Ylt a un duelo y, si los fanáticos son derrotados, sus leales atienden a los PJs y les ofrecen un navío.',
    },
    {
      name: 'Tuxli',
      pronouns: 'ella',
      type: 'Cantora en forma diestra, espía oyente infiltrada',
      role: 'ally',
      traits: ['Espía oyente infiltrada', 'Quiere escapar', 'Se ofrece a ayudar si hay un PJ cantor'],
      goal: 'Escapar de la prisión; si algún PJ es cantor, ayudar al grupo en su lugar.',
      appearance: 'Cantora en forma diestra que viste ropa discreta y lleva rapados sus mechones pelirrojos.',
      notes: 'Prisionera en la sala de los barriles (P3). Su misión era rastrear rutas de suministro, pero la caravana en la que se infiltró fue atacada y capturada por los bandidos. Como los demás cautivos, está con la mitad de su salud y necesita atención médica; la comida repone 3 (1d6). Si el grupo la libera, puede acompañar a Teryn y a los leales hasta la fortaleza.',
    },
    {
      name: 'Axies, el Coleccionista',
      pronouns: 'él',
      type: 'Siah aimiano, investigador de spren',
      role: 'ally',
      traits: ['Erudito', 'Curioso por los spren raros e interesantes', 'Evita el conflicto físico'],
      goal: 'Negociar su libertad y seguir investigando spren raros; guiar al grupo hasta el Resto Gris.',
      appearance: 'Siah aimiano capaz de cambiar sutilmente de forma, de modo que puede «tatuarse» notas de investigación en el cuerpo; no envejece (ficha «Axies», apéndice A).',
      notes: 'Preso en la sala de los barriles (P3) porque el portador de la hoja esquirlada creyó que valdría la pena hablar con él. Negocia su libertad y se ofrece a llevar al grupo a un antiguo spren bajo la ciudad. Quiere quedarse en Rathalas para su investigación y no colabora en la lucha. Tras la batalla propone acompañar a los PJs a la Baja Rathalas, aunque no sabe bien el camino (si le dejan guiar, todos llegan Agotados [−1]). En la conversación con el Resto Gris interviene con sus preguntas y, si los PJs no lo hacen, pregunta adónde va Ylt. Más información en «Personajes principales», en la introducción del libro.',
    },
    {
      name: 'Kaiana',
      pronouns: 'ella',
      type: 'Vigilante de la Verdad reshi, aprendiz de Ylt',
      role: 'special',
      traits: ['Sincera', 'Desconfiada con los infiltrados', 'Irascible si la provocan', 'Protege a Ylt'],
      goal: 'Seguir a su mentor, convencida de que lograrán grandes cosas, y evitar que su violencia se desborde, sin que el grupo se enfrente a él.',
      appearance: 'Mujer reshi con túnica verde y dorada; al curar, un aura tenue como humo brillante emana de su mano.',
      notes: 'Segunda al mando de Ylt, vive un conflicto interno: cree en su liderazgo, pero admite que su violencia le parece equivocada. En la prisión cura a Teryn con potenciación. La conversación con ella determina las probabilidades de que cambie de bando y se una al grupo en el capítulo 4. Defensa cognitiva 13, Defensa espiritual 16, 4 puntos de concentración; gasta 2 para resistirse a amenazas o críticas a Ylt y, si se siente acorralada, usa Liderazgo +4 diciendo que Ylt habla en nombre de la Heraldo Pala. Si la conversación fracasa, huye con Destello desorientador para avisar a Ylt; si tiene éxito, entrega las llaves de la celda de Teryn. En la batalla del salón sigue a Ylt a través de la piedra. Ficha «Kaiana» (apéndice A): vinculada a la brumaspren Horizontes-Siempre-A-La-Deriva.',
    },
    {
      name: 'Ylt',
      pronouns: 'él',
      type: 'Vigilante de la Verdad iriali, portador de la hoja de Honor de Taln',
      role: 'villain',
      traits: ['Arrogante', 'Orador apasionado', 'Visionario, aunque su ambición nubla sus profecías'],
      goal: 'Buscar con sus acólitos la bendición de la Vigilante Nocturna en su valle, conservando la hoja de Honor, convencido de que entregarla a los chamanes de piedra shin aceleraría la destrucción del mundo.',
      appearance: 'Hombre alto de piel dorada con una larga túnica verde y un glifo verde pintado en el rostro que rodea los ojos y termina en punta en la barbilla afeitada. Los rumores de Lorn hablan de pelo dorado.',
      notes: 'Ficha «Ylt» (apéndice A). Mató a la Reina Bandida, encarceló a Teryn y convirtió a los bandidos en fanáticos; ha pasado horas con el Resto Gris buscando conocimiento. En A8 este combate no está diseñado para que él participe: usa Lanza de piedra para derrumbar la plataforma, se desplaza con Tierra fluida y huye a través de la piedra con Kaiana, cerrando el pasaje con Cohesión. Se queda con la hoja de Honor; los PJs no la recuperan. Él y Kaiana se llevan uno de los barcos de los bandidos hacia el Gran Hexi.',
    },
    {
      name: 'Código',
      pronouns: 'elle',
      type: 'Críptique (mentiraspren)',
      role: 'special',
      traits: ['Estudia las mentiras que la gente se dice a sí misma', 'Atraíde por los presumidos y los demasiado confiados', 'Fascinade con Ylt'],
      goal: 'Seguir observando las mentiras que la gente se dice a sí misma; sigue al grupo fuera de Rathalas si un PJ revela una verdad dolorosa.',
      appearance: 'Un patrón que se asemeja a una arquitectura infinitamente cambiante de columnas, escaleras y arcos entrelazados.',
      notes: 'Observa al grupo desde detrás de una estatua en ruinas de la Cámara de los Heraldos (Percepción CD 15 para detectarle). Vio cómo Ylt se apoderó de los bandidos y, con un engaño descarado e ilusorio, los transformó en fanáticos. Capta su atención el PJ que revele una verdad dolorosa al Resto Gris, sobre todo si admite haber mentido sobre sí mismo; al marchar el grupo, le spren los sigue fuera de Rathalas.',
    },
    {
      name: 'El Resto Gris',
      pronouns: 'él',
      type: 'Spren antiquísimo que duerme en la piedra bajo Rathalas',
      role: 'special',
      traits: ['Confuso', 'Atento', 'Cansado'],
      goal: 'Averiguar verdades dolorosas para mantener su conexión con el Reino Físico.',
      appearance: 'Se manifiesta como manos que se extienden de la arcilla y habla con la voz áspera de un anciano enfermo.',
      notes: 'Duerme desde hace milenios en la roca bajo Rathalas. Los sacerdotes vorin silenciaron su existencia, porque consultarle se parecía demasiado a adivinar el futuro, práctica herética para el vorinismo. Olvidado, ya no es tan poderoso ni coherente como antes. Está emparentado con la Vigilante Nocturna, a quien llama «mi madre». A cambio de su conocimiento pide a un PJ una verdad dolorosa; si se siente amenazado, puede retirarse a las piedras. Al final advierte que la tormenta eterna se acerca, que los Heraldos caerán y que los juramentos serán puestos a prueba. Los PJs suben a nivel 4 tras hablar con él.',
    },
  ],

  combats: [
    {
      id: 'combat-khornaks',
      title: 'Khornaks en el suelo del cañón (A1)',
      mapRef: 'map-3-2',
      enemies: [
        { name: 'Khornak', count: '3', bonus: 'Anfibios; acechan bajo las enredaderas y luchan a muerte' },
      ],
      specialRules: [
        'Los rocabrotes de ribera (unos 2 metros de altura) y las gruesas enredaderas entre ellos convierten la zona en terreno difícil.',
        'Los khornaks esperan escondidos entre las enredaderas, hacia la mitad del trecho entre los rocabrotes.',
        'Un PJ que supere una prueba de Percepción CD 15 los ve y alerta al grupo antes del ataque. La prueba sufre una desventaja porque están a cubierto, pero obtiene una ventaja si los PJs exploraron el fondo del cañón antes de entrar y ya detectaron movimiento entre los rocabrotes.',
        'Si pasan inadvertidos, los khornaks emergen de las enredaderas por sorpresa y los PJs quedan Sorprendidos hasta que acabe su primer turno de combate.',
        'Los khornaks luchan a muerte.',
      ],
    },
    {
      id: 'combat-bandidos-alerta',
      title: 'Bandidos en alerta',
      enemies: [
        { name: 'Bandido', count: '3', bonus: 'Interceptan a los héroes' },
        { name: 'Arquero', count: '3' },
      ],
      specialRules: [
        'Este combate solo ocurre si se rellenan los tres espacios del suceso «Bandidos en alerta»: suena un cuerno y el campamento entra en estado de alerta.',
        'Si los PJs parecen fuera de lugar, los bandidos y arqueros atacan antes de hacer preguntas.',
        'Se retiran o se rinden cuando la mitad de sus efectivos ha sido derrotada.',
        'Si el grupo es derrotado o se rinde, lo llevan a la prisión (A7) y lo arrojan a la sala de los barriles (P3).',
        'Además, la prisión (A7) recibe dos guardias bandidos más.',
      ],
    },
    {
      id: 'combat-sabuesos-hacha',
      title: 'Sabuesos-hacha del laberinto de puentes (A6)',
      enemies: [
        { name: 'Sabueso-hacha', count: '6', bonus: 'Acorralan al grupo' },
      ],
      specialRules: [
        'Solo ocurre si fracasa el empeño del laberinto de puentes (3 fallos antes que 5 éxitos): el grupo pasa demasiado tiempo en él y los seis sabuesos-hacha lo acorralan.',
        'Complicación de ejemplo del empeño: otro sabueso-hacha se une a la manada que sigue a los personajes (ver «Resolución del empeño»).',
        'Una vez derrotados los sabuesos-hacha, los PJs llegan a su destino sin más incidentes.',
      ],
    },
    {
      id: 'combat-guardias-prision',
      title: 'Guardias de la prisión (A7)',
      mapRef: 'map-3-3',
      enemies: [
        { name: 'Bandido', count: '4 (+2 si «Bandidos en alerta» se ha activado)', bonus: 'Cuatro guardias en la sala de estar (P2); si el suceso está activo, otros dos patrullan el pasillo (P1)' },
      ],
      specialRules: [
        'Los guardias son hostiles, pero si hay un bandido leal liberado con el grupo, dudan antes de atacar.',
        'Reclutarlos exige una prueba de Liderazgo CD 15 subiendo la apuesta (ventaja si Teryn está con el grupo). Si se supera, la mitad de los guardias (redondeando hacia arriba) se une a los leales contra Ylt y el resto ataca.',
        'Con una Oportunidad en esa prueba, uno de los bandidos titubea y deja caer su maza. Con una Complicación, los guardias luchan hasta la muerte; si no, huyen cuando su salud baja de la mitad.',
        'Quizá el grupo ya haya derrotado a algunos de ellos antes.',
        'Aliados que pueden acompañar al grupo hasta A8: hasta siete bandidos leales (tres guardias de la prisión y los cuatro leales presos en P3), además de Teryn y Tuxli.',
      ],
    },
    {
      id: 'combat-batalla-salon',
      title: 'La batalla del salón',
      mapRef: 'map-3-4',
      enemies: [
        { name: 'Fanático', count: '6 (−1 por cada 2 PNJ aliados del grupo; máx. −4)', bonus: 'Repartidos por la plataforma para impedir el acceso a Ylt y los arqueros; la mitad sufre 3 de daño al caer la plataforma' },
        { name: 'Maestro lancero', count: '1', bonus: 'Repartido por la plataforma de madera' },
        { name: 'Arquero', count: '2', bonus: 'Empiezan en la cornisa oeste con Ylt y Kaiana' },
        { name: 'Ylt', count: '1', bonus: 'No está pensado para que luche: se retira lo antes posible, con cualquier acción como ▶; turno rápido y turno lento' },
        { name: 'Kaiana', count: '1', bonus: 'Reacia a luchar contra Ylt; sigue a Ylt al túnel tras los PJs' },
      ],
      specialRules: [
        'Los aliados del grupo, los bandidos apartados leales a Ylt y la multitud no forman parte del combate: narra su lucha de fondo.',
        'Los PJs empiezan probablemente en el lado este de la plataforma o junto al pasaje este. Ylt y Kaiana empiezan en la cornisa oeste con dos arqueros; el estrado circular mide 1,5 metros de altura.',
        'Por cada dos PNJ que el grupo consiga como aliados, elimina un fanático enemigo (como máximo, cuatro). Ejemplo: con cuatro reclutas, elimina dos.',
        'Ylt empieza en la cornisa de piedra estable al oeste, sobre la cadena que acaba de cortar. Para retirarse puede usar cualquier acción de su ficha como ▶ aunque requiera ▶▶. Tiene turno rápido y lento, y con su rasgo Jefe gasta concentración para obtener una acción adicional después del turno de cada PJ.',
        'A la menor oportunidad usa Lanza de piedra (▶) para derrumbar por completo la plataforma. Cae 4,5 metros hasta los escombros (mapa 3.5); los PJs sobre ella hacen una prueba de Agilidad CD 12 y sufren 3 (1d6) de daño por golpe si fallan. La mitad de los fanáticos sufre 3 de daño cada uno.',
        'Al derrumbarse la plataforma, la Tierra fluida de Ylt lo desplaza 4,5 metros hacia el pasaje oeste sin acción. Ordena a Kaiana que lo siga y, si llega antes de su turno, usa Piedra de salto (▶) para llevarla al túnel. Después usa Cohesión (▶) con la hoja de Honor para cerrar la piedra tras ambos y bloquear la salida oeste.',
        'Kaiana juega un turno rápido inmediatamente después de los PJs y sigue a Ylt al túnel antes de que lo selle. El grupo queda abandonado a su suerte y no recupera la hoja de Honor.',
        'Escombros peligrosos: desplazarse entre los restos de la plataforma caída es complicado, de modo que conviene subir la apuesta a menudo. La madera rota del mapa 3.5 es terreno difícil y, si alguien queda Tumbado en ella, las astillas le causan 2 (1d4) de daño por laceración.',
        'Escalada difícil: la zona de escombros de piedra alrededor de la plataforma caída es intransitable salvo trepando. Escalar 4,5 metros hasta la cornisa estable superior requiere superar una prueba de Atletismo CD 12, o CD 8 si se trepa por la cadena intacta del extremo sur de la plataforma.',
        'Los fanáticos luchan a muerte. Si vencen, Teryn muere en la batalla y los PJs son desarmados y encarcelados.',
      ],
      tables: [
        {
          title: 'Oportunidades y Complicaciones de la batalla del salón',
          entries: [
            { roll: 'O', text: 'Un bandido leal vitorea el triunfo del PJ y lo anima: el PJ recibe el estado Concentrado hasta el fin de su próximo turno.' },
            { roll: 'O', text: 'Un enemigo, al ver que la lucha se tuerce, sale corriendo.' },
            { roll: 'C', text: 'Se desprenden escombros de arriba: el personaje y quienes estén a 1,5 metros o menos deben superar una prueba de Agilidad CD 15 (con la reacción Evitar peligro) o recibir 3 (1d6) de daño por golpe.' },
            { roll: 'C', text: 'La plataforma de madera termina de quebrarse y aprisiona al personaje, que queda Inmovilizado. Él mismo, o quien lo tenga cerca, puede Usar una habilidad (▶) con una prueba de Atletismo CD 10 para liberarlo de los restos.' },
          ],
        },
      ],
    },
  ],

  maps: [
    {
      id: 'map-3-1',
      title: 'Mapa 3.1: La ciudad de Rathalas',
      pdfPage: 65,
      imagePath: '/maps/map_p65.webp',
      scale: 'Mapa ilustrado sin escala; marca el norte (N)',
      locations: [
        'A1: El suelo del cañón',
        'A2: El puesto de vigilancia',
        'A3: Pared del risco',
        'A4: El taller de carpintería',
        'A5: El devotario',
        'A6: El laberinto de puentes',
        'A7: La prisión',
        'A8: El corazón de la fortaleza',
        'Hacia abajo, a la Baja Rathalas',
        'Cámara de los Heraldos',
        'Oeste, al mar de las Lanzas',
      ],
      notes: 'Conexiones entre zonas: A1 con A4; A2 con A5; A3 con A4 y A6; A4 con A1, A3 y A6; A5 con A2, A6, A7 y A8; A6 con A3, A4, A5 y A7; A7 con A5, A6 y A8; A8 con A5 y A7, y desde ella se baja a la Baja Rathalas.',
    },
    {
      id: 'map-3-2',
      title: 'Mapa 3.2: El suelo del cañón',
      pdfPage: 66,
      imagePath: '/maps/map_p66.webp',
      scale: '1 casilla = 1,5 m',
      locations: [
        'Boca occidental del cañón (A1)',
        'Rocabrotes de ribera de unos 2 metros de altura',
        'Enredaderas entre los rocabrotes (terreno difícil)',
      ],
      notes: 'Mapa del combate con los tres khornaks. El mapa no lleva rótulos de zona: las localizaciones se toman del texto de A1.',
    },
    {
      id: 'map-3-3',
      title: 'Mapa 3.3: La prisión de Rathalas',
      pdfPage: 70,
      imagePath: '/maps/map_p70.webp',
      scale: '1 casilla = 5 pies (1,5 m); el mapa lo rotula «1 square = 5 ft.»',
      locations: [
        'P1: El pasillo',
        'P2: La sala de estar',
        'P3: La sala de los barriles',
        'P4: Las celdas',
      ],
      notes: 'P1 da al sur a P2, al norte a P3 y al oeste a P4. Hay tres accesos a la prisión: las escaleras (a P1), un túnel estrecho a la fortaleza (A8) y un pasillo junto a las celdas que también conduce a A8.',
    },
    {
      id: 'map-3-4',
      title: 'Mapa 3.4: El salón y la plataforma',
      pdfPage: 76,
      imagePath: '/maps/map_p76.webp',
      scale: '1 casilla = 5 pies (1,5 m); el mapa lo rotula «1 square = 5 ft.»',
      locations: [
        'Plataforma circular de madera suspendida por cadenas',
        'Cornisa oeste con el estrado circular de 1,5 m de altura (Ylt, Kaiana y dos arqueros)',
        'Pasaje oeste (por donde huyen Ylt y Kaiana)',
        'Pasaje este (donde empiezan los PJs)',
        'Túnel sureste (entrada de los PJs y sus aliados)',
      ],
      notes: 'Mapa de la batalla antes del derrumbe. El mapa no lleva rótulos de zona: las localizaciones se toman del texto de «La batalla del salón» y «El corazón de la fortaleza».',
    },
    {
      id: 'map-3-5',
      title: 'Mapa 3.5: El salón y la plataforma caída',
      pdfPage: 77,
      imagePath: '/maps/map_p77.webp',
      scale: '1 casilla = 5 pies (1,5 m); el mapa lo rotula «1 square = 5 ft.»',
      locations: [
        'Plataforma caída: madera rota (terreno difícil)',
        'Escombros de piedra alrededor (intransitables salvo trepando)',
        'Cadena intacta en el extremo sur de la plataforma (escalada CD 8)',
        'Cornisa estable superior (a 4,5 m)',
        'Pasaje oeste (cerrado por Ylt con Cohesión)',
      ],
      notes: 'Se usa cuando Ylt derrumba la plataforma; la plataforma cae 4,5 metros. El mapa no lleva rótulos de zona: las localizaciones se toman de los efectos del campo de batalla.',
    },
  ],
}
