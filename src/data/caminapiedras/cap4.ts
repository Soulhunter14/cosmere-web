import type { AdventureChapter } from './tipos'

export const CHAPTER_4: AdventureChapter = {
  id: 'cap4',
  number: 4,
  title: 'Hacia el valle',
  pdfPages: { from: 81, to: 96 },
  levelFrom: 4,
  levelTo: 5,
  summary: 'El grupo navega hacia el Gran Hexi tras Ylt y sus acólitos de los Ojos de Pala, que van al Valle de la Vigilante Nocturna. Por el camino sufre el ataque de un enjambre de anguilas aéreas y la primera tormenta eterna, presencia el despertar de los cantores de la tripulación, hace escala en Karanak y corre en un empeño por el mar de Tarat hasta Hexi, donde se enfrenta a la retaguardia de Ylt. En el valle, las visiones del mañana preceden a una batalla en la arboleda entre Ylt, Kaiana y los PJs por el cuchillo de raysio; después, la Vigilante Nocturna ofrece una bendición y una maldición a cada PJ y envía al grupo al oeste, hacia la Fortaleza de Ashiqqil y Nale. Los personajes empiezan el capítulo en el nivel 4 y suben al nivel 5 al salir del valle.',
  background: 'En Rathalas, el Resto Gris reveló que Ylt y sus acólitos van al Valle de la Vigilante Nocturna a pedirle un favor a la spren legendaria. Ylt quiere suplantar a la Heraldo Pailiah, y la Vigilante Nocturna le ofrece un peligroso artefacto, un cuchillo de raysio capaz de matar a un Heraldo, que el grupo debe arrebatarle. Los bandidos leales a Teryn prestan al grupo el «Broma de la tormenta», el barco que dejaron los fanáticos de Ylt al escapar con el más nuevo del puerto, con Ubo como timonel y una pequeña tripulación. En el camino llega la primera tormenta eterna, provocada por el ascenso de Odium en Roshar, que trae consigo el despertar del pueblo cantor. Teryn sospecha que Kaiana, la segunda de Ylt, no le es tan leal como él cree.',
  prepChecklist: [
    'Antes de que el grupo siga el rastro de Ylt hacia el valle, familiarízate con «Visiones del mañana»: cada PJ vive una visión distinta (el libro da tres visiones y pide crear una personalizada para cada PJ que no tenga una; con cuatro PJs, hace falta una a medida para el cuarto).',
    'Familiarízate con «Una bendición y una maldición» y con los ejemplos de la tabla de bendiciones y maldiciones del final del capítulo: son específicas para cada individuo.',
    'Lleva la cuenta del daño total del barco durante el combate con las anguilas aéreas: determina los fallos iniciales del empeño de la tormenta eterna.',
    'El empeño «Siguiendo a Ylt» determina la dificultad del combate contra la retaguardia de Ylt (campamento desprevenido o emboscada).',
    'Recuerda si en el capítulo 3 el grupo convenció a Kaiana para que cuestionara a Ylt: la prueba de Liderazgo para persuadirla en la arboleda obtiene una ventaja.',
    'Las reglas para empuñar el cuchillo de raysio están en el apéndice B.',
  ],
  progressionItems: [
    { type: 'key', text: 'Los personajes empiezan el capítulo en el nivel 4 y suben al nivel 5 al abandonar el valle, tras sobrevivir al enfrentamiento con Ylt.' },
    { type: 'spren', text: 'Oportunidad para introducir spren, fortalecer vínculos o jurar Ideales: las acciones de un PJ para salvar el barco y a la tripulación durante la tormenta eterna.' },
    { type: 'spren', text: 'Oportunidad para introducir spren, fortalecer vínculos o jurar Ideales: que los PJs salven a Axoq.' },
    { type: 'spren', text: 'Oportunidad para introducir spren, fortalecer vínculos o jurar Ideales: que los PJs convenzan a Kaiana de cambiar de bando.' },
    { type: 'spren', text: 'Oportunidad para introducir spren, fortalecer vínculos o jurar Ideales: cómo se enfrentan los PJs a Ylt y hablan con la Vigilante Nocturna.' },
    { type: 'spren', text: 'Honorspren: se fija en el PJ que, durante la tormenta eterna, pone su vida en juego por salvar a los marineros y no a sí mismo, actuando con gran valor.' },
    { type: 'spren', text: 'Cultivacispren: puede atraerlo un PJ que haga todo lo posible por salvar la vida de Axoq.' },
    { type: 'spren', text: 'Horizontes-Siempre-A-La-Deriva: si Kaiana muere, la brumaspren podría buscar un nuevo vínculo con un PJ que muestre determinación por buscar la verdad tras la traición de los Ojos de Pala y de Ylt.' },
    { type: 'info', text: 'PJs con metas sobre los Heraldos, las hojas de Honor o los Radiantes: pueden aprender más con las visiones de la Vigilante Nocturna o hablando con ella, con Ylt y con Kaiana.' },
  ],

  scenes: [
    {
      id: 'zarpamos',
      title: 'Zarpamos',
      type: 'narrative',
      content: [
        'Libres del control de Ylt, los bandidos leales a Teryn quieren ayudar al grupo a detener al tirano. Teryn o Ubo conducen a los PJs a un puerto oculto a orillas del mar de las Lanzas, al que se llega desde el taller de carpintería.',
        'Los fanáticos de Ylt que escaparon se llevaron el más nuevo de los dos barcos del puerto. El que queda, apodado con cariño «Broma de la tormenta», navega mejor de lo que aparenta, y Teryn se ofrece a prestárselo al grupo, con su pequeña tripulación, para que puedan apresar a Ylt.',
        'Ubo es el primero en ofrecerse como tripulante: conoce bien estas aguas por su experiencia como contramaestre. Si el grupo propone a otros PNJs que se unan, casi todos se dejan convencer con facilidad. Teryn prefiere quedarse a liderar a los bandidos, y Axies planea seguir aprendiendo del Resto Gris.',
        'Ubo completa la tripulación con trabajadores del taller de carpintería. La tripulación final debería ser: Ubo, cuatro PNJs más (invitados por el grupo o trabajadores de Ubo) y dos cantores esclavizados, Tam (plebeyo, él) y Veda (plebeya, ella). Como la mayoría de los cantores de Roshar en esa época, están atrapados en la forma esclava; los bandidos los pusieron a trabajar tras capturarlos en el asalto a una caravana de mercaderes.',
        'Justo antes de zarpar, Teryn habla con el grupo a solas y le confía una sospecha: Kaiana, que es la lugarteniente de Ylt, quizá no le sea tan fiel como este supone.',
      ],
    },
    {
      id: 'anguilas-aereas',
      title: 'Nubes que se retuercen',
      type: 'combat',
      readAloud: 'Un trueno retumba en el cielo gris, resonando desde el oeste. Ubo da unas órdenes bruscas a la tripulación. "¡Arriad las velas! ¡Se acerca una tormenta!". Sus gritos se convierten en un susurro. "¿Una tormenta... desde el oeste?". Un golpe seco y húmedo hace que Ubo dé un respingo cuando algo cae a la cubierta junto a sus pies. Es una anguila aérea de un metro de largo que lucha por respirar.',
      content: [
        'Los PJs saben que Ylt viaja a Hexi para pedir una bendición a la Vigilante Nocturna, una spren legendaria que las concede siempre moderadas por una maldición. Con un barco viejo y tiempo perdido, alcanzar a Ylt no será fácil, pero Po\'ahu anima al grupo a intentarlo: con la destreza de Ubo al timón podrían interrumpir sus planes, aunque el viaje dure semanas. Lo que ignoran es que la tormenta eterna, una tormenta nueva provocada por el ascenso de Odium en Roshar, amenaza con desviarlos de su rumbo.',
        'Tras varios días de viaje, en el ancho río que va del mar de las Lanzas a la ciudad de Karanak, los PJs ven nubes oscuras en el horizonte. Disponen de unos instantes para reaccionar; si no miran al horizonte, el vigía del barco da el aviso señalando al oeste. Lo que parecía una nube es un enjambre de miles de anguilas aéreas a punto de alcanzar el barco.',
        'Todos los PJs que no estén a cubierto deben superar una prueba de Agilidad CD 10 o sufren 2 (1d4) de daño por golpe cuando la mayor parte del enjambre barre la cubierta. Un PJ que supere una prueba de Supervivencia CD 12 observa que las anguilas se mueven de forma errática, como si huyeran del oeste.',
        'El pánico vuelve especialmente violentas a las anguilas más grandes: atacan dos anguilas aéreas mayores y dos anguilas aéreas. En su primer turno se lanzan sobre la cubierta con Bomba en picado (2), desinflando sus bolsas de aire, y después luchan como presas acorraladas.',
        'Ubo (bandido) se une a los PJs contra las anguilas y les advierte del deterioro del barco; el resto de la tripulación se refugia bajo cubierta, porque no está preparada para un ataque así.',
        'Cada vez que una anguila aérea mayor usa Mordisco (1) en cubierta, incluida la Bomba en picado inicial, inflige 9 (1d6 + 5) de daño por golpe al barco. Describe esos daños y suma el total: determina cuántos fallos tiene el empeño de la tormenta eterna al empezar (30-44 de daño: 1 fallo; 45-59: 2 fallos; 60 o más: 3 fallos).',
        'Repercusiones: las anguilas siguen barriendo la cubierta hasta que mueren las dos anguilas aéreas mayores. El barco puede haber sufrido daños graves, pero la tormenta eterna está encima y los marineros no tienen ocasión de repararlo: pasad de inmediato a «Una nueva tormenta».',
      ],
      tips: [
        'Describe el daño que infligen las anguilas aéreas mayores y lleva la cuenta del daño total del barco: afecta a la capacidad del grupo para sobrevivir a la tormenta eterna.',
        'En circunstancias normales las anguilas aéreas nunca atacan a los humanos: aquí actúan movidas por el pánico ante lo que viene del oeste.',
      ],
      tables: [
        {
          title: 'Efectos del campo de batalla',
          entries: [
            { text: 'Pánico de las anguilas aéreas: cada vez que una anguila aérea mayor usa Mordisco (1) en cubierta, incluida la Bomba en picado inicial, inflige 9 (1d6 + 5) de daño por golpe al barco. Lleva la cuenta del total.' },
            { text: 'Cubierta oscilante: al final de cada ronda, todos los personajes en cubierta hacen una prueba de Agilidad CD 10. Con un fallo, el personaje queda Tumbado y cae 3 metros hacia la izquierda o la derecha del barco (alterna de lado cada ronda). Se puede fallar a propósito, como hace una anguila que quiere seguir cerca de su objetivo. Las barandillas impiden caer al agua, pero golpearse contra ellas causa 2 (1d4) de daño por golpe al personaje y al barco.' },
            { text: 'Enjambre: cada vez que termina una ronda, llega al combate otra anguila aérea.' },
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
        'Una cruel tormenta se acerca desde el oeste en lugar del este, desafiando las leyes de la naturaleza conocidas en Roshar. No hay tiempo para respirar ni para planificar. Dirige la escena como un empeño con apuestas de vida o muerte: los PJs luchan contra el viento y los relámpagos para salvarse, salvar el barco y salvar a los marineros del «Broma de la tormenta».',
        'El empeño tiene éxito si el grupo acumula 6 éxitos antes de 4 fallos, o si cumple el objetivo de cualquier otra forma. Según el daño que el barco sufrió contra las anguilas aéreas, puede empezar con 1 o más fallos (tabla «Integridad del barco»).',
        'Antes de cada contribución, presenta al grupo uno de los peligros de la tormenta (tabla «Peligros de la tormenta eterna») para que respondan a él. Mientras tanto, los PJs pueden oír los gemidos de agonía de los cantores Tam y Veda, una reacción a la magnitud de su difícil situación al despertar (ver «Despertar»).',
        'Si un PJ obtiene una Oportunidad o sufre una Complicación, usa la tabla de Oportunidades y Complicaciones de la tormenta eterna como inspiración.',
        'Vacíospren: los PJs cantores son abordados por un spren extraño que cruza el aire como un rayo y, al descansar, toma forma de figura humanoide roja. Es Roil (ella), una vacíospren impulsiva que busca cantores a los que bendecir con formas de poder mientras intenta acercarlos a la influencia de Odium. Si un PJ cantor muestra interés, puede añadir la meta «Conseguir una forma de poder»; si lo hace, Roil lo sigue tras la tormenta, se le aparece solo a él y alimenta sus instintos más espontáneos. Las formas de poder se explican en «Ascendencia cantora», en el capítulo 2 del Manual del Archivo de las Tormentas.',
        'Una vez que los PJs alcanzan su éxito o su fracaso final, lo peor de la tormenta eterna ya ha pasado.',
      ],
      tips: [
        'Camino a la Radianza, poderes emergentes: los Radiantes en ciernes pueden usar sus nuevas habilidades de potenciación para salvar a la tripulación o a sus compañeros. Establece las CD según las circunstancias y da ventaja en las pruebas que se alineen con los ideales de ese Radiante.',
        'Camino a la Radianza (atraer a un spren): el PJ que afronte la tormenta con valor y se juegue la vida por la tripulación, no por sí mismo, llamará la atención de un honorspren.',
        'En el peligro del barco zozobrante, el libro sugiere que es un buen momento para subir la apuesta.',
      ],
      tables: [
        {
          title: 'Integridad del barco (daño sufrido ante las anguilas aéreas)',
          entries: [
            { roll: '30-44', text: 'Hacen falta reparaciones menores. El empeño empieza con 1 fallo.' },
            { roll: '45-59', text: 'Hacen falta reparaciones estructurales importantes. El empeño empieza con 2 fallos.' },
            { roll: '60 o más', text: 'Los daños críticos son inminentes. El empeño empieza con 3 fallos.' },
          ],
        },
        {
          title: 'Peligros de la tormenta eterna',
          entries: [
            { roll: 'Caída de rayo', text: 'Relámpagos rojos castigan el barco. Opciones: eludir los puntos donde es probable que caiga el rayo (Deducción CD 14), resguardarse (Agilidad CD 15) o levantar un pararrayos (Manufactura CD 12).' },
            { roll: 'Vientos potentes', text: 'El viento amenaza con barrer la cubierta. Opciones: amarrarse al barco (Hurto CD 13), agarrarse con todas las fuerzas (Atletismo CD 14) o localizar un hueco de aire en calma dentro de la borrasca (Supervivencia CD 15).' },
            { roll: 'Hombres al agua', text: 'Varios marineros caen al mar y las olas pueden llevárselos. Opciones: acercar el barco a ellos con una maniobra (Agilidad CD 13), coordinar a la tripulación para lanzar y asegurar un cabo (Liderazgo CD 13) o lanzarse a nado a rescatarlos (Atletismo CD 15).' },
            { roll: 'Barco zozobrante', text: 'Una ola descomunal está a punto de volcar el «Broma de la tormenta». Opciones: girar el timón para encararla (Atletismo CD 14), liberar la vela mayor que se ha enganchado (Hurto CD 14) o mandar a los marineros que carguen todos su peso sobre el costado de guardatormenta (Liderazgo CD 13).' },
            { roll: 'Mástil roto', text: 'Un rayo daña el mástil y este amenaza con caer. Opciones: apuntalarlo deprisa (Manufactura CD 15), echar un barril de agua sobre la madera ardiendo (Atletismo CD 13) o tumbarlo de forma controlada (Saber CD 14). Si algún PJ vacila, el mástil puede quebrarse y forzarlo a correr a un sitio seguro (Agilidad CD 15).' },
          ],
        },
        {
          title: 'Oportunidades y Complicaciones de la tormenta eterna',
          entries: [
            { roll: 'Oportunidad', text: 'El PJ reacciona con tanta agilidad mental que salva a un PNJ: al resolverse el empeño, un PNJ menos muere.' },
            { roll: 'Oportunidad', text: 'El PJ encuentra un momento de respiro en la tormenta y queda Concentrado durante 1d4 rondas.' },
            { roll: 'Complicación', text: 'Un rayo impacta en el barco pegado a un personaje, que queda Desorientado hasta que termine el empeño.' },
            { roll: 'Complicación', text: 'Le caen escombros encima a un PJ y lo dejan sin aire: recibe 9 (2d8) de daño por golpe y queda Agotado [−1] hasta el final del empeño.' },
          ],
        },
      ],
      branches: [
        {
          label: 'Éxito (6 éxitos antes de 4 fallos)',
          description: 'La furia de la tormenta disminuye hasta cesar, las aguas se calman y el cielo se abre. Aun así, por cada fallo acumulado durante el empeño muere un miembro de la tripulación, probablemente aplastado por los escombros o ahogado.',
        },
        {
          label: 'Fracaso (4 fallos antes de 6 éxitos)',
          description: 'Todos a bordo sufren lo indecible: aplastados contra el barco, casi ahogados o alcanzados por un rayo. Ubo muere junto con tres tripulantes humanos (los dos cantores sobreviven, porque aparecen en la escena siguiente). Cada PJ sufre una lesión y hace una tirada de lesión para saber su duración; genera lesiones aleatorias con la tabla «Efectos de las lesiones» del capítulo 9 del Manual del Archivo de las Tormentas.',
        },
        {
          label: 'Fracaso catastrófico (sin ningún éxito)',
          description: 'Desenlace opcional: el «Broma de la tormenta» queda destruido y se pierde toda la tripulación. Los PJs pueden acabar varados cerca de Karanak, con días extra de viaje y 2 fallos de partida en el siguiente empeño. El libro no desarrolla este caso, pero propone, si se desea, un empeño de supervivencia en terreno salvaje antes de proseguir.',
        },
      ],
    },
    {
      id: 'despertar',
      title: 'Despertar',
      type: 'narrative',
      readAloud: 'Cuando los fuertes vientos y el oleaje finalmente cesan, encontráis a los dos parshmenios de la tripulación fundidos en un estrecho abrazo, riendo, llorando y hablando entre ellos en voz baja. Uno de los dos se inclina para levantar un garrote abandonado en cubierta. Le tiemblan las manos al apuntarlo hacia el resto de la tripulación. "Nos llevamos el bote salvavidas. Eso es todo. Nos vamos."',
      content: [
        'Haya salido bien o mal el empeño, algunos miembros de la tripulación han cambiado. El fin de la tormenta eterna trae a todo Roshar el despertar del pueblo cantor y el amanecer de una nueva era: los cantores se desprenden de la forma esclava y reconectan con su identidad reprimida. En el «Broma de la tormenta», Tam y Veda reciben ese mismo don y han adoptado la forma de trabajo.',
        'Si todos los PJs son humanos, deben superar una prueba de Persuasión CD 12 para hablar largo y tendido con la pareja de cantores. Si fallan, Tam y Veda siguen nerviosos por su precaria posición y temerosos de cómo reaccionará la tripulación ante su despertar: intentan irse enseguida, aprovechando el caos posterior a la tormenta para escabullirse antes de que nadie tenga fuerzas para protestar. Si la superan, confían lo bastante en los héroes para hablar de lo sucedido: se presentan, expresan su angustia por los años de esclavitud y describen cómo han reconectado con su identidad tras una vida de consciencia onírica.',
        'Si algún PJ es cantor, Tam y Veda lo invitan a compartir una celebración íntima de su nuevo yo (por ejemplo, una comida o cantos con ritmos recuperados). Los cantores conmovidos por el despertar de Tam y Veda obtienen el estado Determinado.',
        'Insistan lo que insistan la tripulación y los PJs, Tam y Veda dejarán enseguida el barco para vivir su libertad como ellos decidan.',
      ],
      branches: [
        {
          label: 'Todos los PJs son humanos: Persuasión CD 12 superada',
          description: 'Tam y Veda confían en los héroes y hablan de lo ocurrido, de su esclavitud y de la reconexión con su identidad.',
        },
        {
          label: 'Todos los PJs son humanos: Persuasión CD 12 fallada',
          description: 'Tam y Veda, nerviosos, intentan irse de inmediato aprovechando el caos de la tormenta.',
        },
        {
          label: 'Hay un PJ cantor',
          description: 'Los dos lo convidan a festejar en privado su nueva identidad; si el PJ cantor se emociona con su despertar, obtiene el estado Determinado.',
        },
      ],
    },
    {
      id: 'en-busca-de-la-verdad',
      title: 'En busca de la verdad',
      type: 'narrative',
      content: [
        'Pasada la primera tormenta eterna, los tripulantes que quedan se juntan, muertos de miedo. Ignoran qué implica una tormenta tan nueva y letal, y solo quieren alcanzar el puerto más próximo, Karanak.',
        'Las lesiones superficiales de los personajes sanan antes de arribar a Karanak; las demás se mantienen durante la travesía del mar de Tarat.',
      ],
    },
    {
      id: 'karanak',
      title: 'Karanak',
      type: 'exploration',
      readAloud: 'Finas columnas de humo se alzan hacia el cielo a medida que la ciudad portuaria de Karanak aparece a la vista. Incluso desde la distancia, la destrucción causada por la tormenta es evidente. Los edificios del lado oeste están partidos en dos. Los pilares agrietados de un gran templo vorin apuntan hacia el cielo como huesos expuestos. Pero los muelles siguen en pie, y la ciudad bulle de actividad.',
      content: [
        'Se necesitan quince días para llegar a Karanak, una ciudad portuaria del principado Bethab de Alezkar. Era bastante rica por el comercio con Jah Keved y Kharbranth, pero ha sufrido graves daños en la tormenta eterna. Sus habitantes se recuperan del desastre y desconfían de los forasteros; la tripulación de bandidos del barco tampoco quiere quedarse más de lo necesario.',
        'Cada día que el grupo pase en Karanak después del primero se suma como 1 fallo al empeño «Siguiendo a Ylt», con un tope de 2 fallos. Cuanto más tarden en marcharse, más inquieta se muestra Po\'ahu por frenar a Ylt.',
        'La tripulación informa de que el «Broma de la tormenta» necesita reparaciones urgentes y, según cuántos tripulantes se hayan perdido en la tormenta eterna, podría necesitar hasta cuatro marineros más. Si los PJs parten sin un barco reparado ni una tripulación completa, el empeño «Siguiendo a Ylt» será más difícil.',
        'Cantores en Karanak: igual que Tam y Veda, los cantores esclavizados de la ciudad despertaron durante la tormenta y se marcharon. La población, ahora solo humana, desconfía profundamente de los cantores: siempre que haya un PJ cantor presente, todas las pruebas sociales sufren una desventaja.',
        'Reparaciones: tras un éxito en el empeño de la tormenta eterna, los daños son leves y los arregla la tripulación de bandidos. Tras un fracaso, hay que abonar 200 marcos en mano de obra y materiales, o bien un PJ dedica un día completo en Karanak a arreglar el barco y supera una prueba de Manufactura CD 15.',
        'Marineros extra: cada uno cuesta 30 marcos y exige una prueba de Liderazgo CD 15 propia (una por marinero). Por cada 30 marcos más que el PJ ofrezca por el viaje a Hexi, la CD baja 5.',
        'Compras: se pueden adquirir el equipo y las armas no especiales del Manual del Archivo de las Tormentas (cap. 7). Todo lo demás permanece cerrado mientras la ciudad se reconstruye.',
        'Preguntar por lo sucedido: los lugareños son cautelosos, pero si los PJs tienen pericia alezi, los tratan con amabilidad o suavizan la conversación con unos cuantos marcos, cualquier vecino responde a las preguntas siguientes.',
      ],
      branches: [
        {
          label: '¿Qué se sabe de la extraña tormenta?',
          description: 'Los predictormentas están tan confundidos como todos y dicen que es un nuevo tipo de tormenta. Las vinculacañas de otras zonas cuentan que ha cruzado todo Roshar, y que algunos la han sufrido más que Karanak: ha destruido ciudades enteras.',
        },
        {
          label: '¿Qué pasó con los cantores?',
          description: 'Todos los parshmenios huyeron la noche de la tormenta, con los ojos brillando como los Portadores del Vacío, y desde entonces no se ha visto a ninguno.',
        },
        {
          label: 'Preguntar por individuos con glifos verdes o por un barco parecido al del grupo',
          description: 'Sí: hace un par de días repararon en el puerto un barco con la vela rota. Su tripulación, de unos nueve individuos, llevaba la cara pintada de verde; era un grupo extraño, pero pagaban bien.',
        },
      ],
    },
    {
      id: 'siguiendo-ylt',
      title: 'Siguiendo a Ylt',
      type: 'exploration',
      content: [
        'Cuando los PJs dejan Karanak, resuelve la persecución de Ylt como un único empeño que condensa varias semanas de navegación por el mar de Tarat hasta las tierras altas del Gran Hexi. Se trata de llegar cuanto antes y pillar sin preparar a los acólitos de los Ojos de Pala.',
        'El empeño tiene éxito si el grupo consigue 3 éxitos antes de 3 fallos, o si cumple el objetivo de cualquier otra forma. Los días de más en Karanak cuentan como fallos (máximo 2).',
        'Plantéalo como un montaje de escenas rápidas: describe en pocas frases lo que resulta de cada prueba y haz avanzar el barco hacia el oeste con cada éxito. Mientras el «Broma de la tormenta» siga dañado o falte tripulación, los PJs tienen desventaja en las pruebas de navegación y demás tareas a bordo.',
        'Los enfoques posibles varían según la etapa del viaje: el mar de Tarat (alta mar), la tormenta en Triax (refugio de piratas) y las orillas de Hexi (desembarco). Durante la alta tormenta en Triax, los PJs pueden recargar sus esferas y los cantores pueden cambiar de forma (ver «Ascendencia cantora» en el capítulo 2 del Manual del Archivo de las Tormentas).',
        'Independientemente de si acaba en éxito o en fracaso, los PJs terminan en el Gran Hexi, pisándole los talones a Ylt.',
      ],
      tables: [
        {
          title: 'Enfoques por etapa del viaje',
          entries: [
            { roll: 'Mar de Tarat', text: 'En alta mar: marcar el rumbo con ayuda de corrientes ya cartografiadas (Saber CD 15), leer el viento y el tiempo (Percepción CD 14), reponer víveres pescando o cazando animales marinos (Supervivencia CD 14), revisar las cubiertas y anotar los desperfectos graves (Deducción CD 13), reparar lo necesario (Manufactura CD 13) o adiestrar al grupo hasta formar una tripulación excelente (Liderazgo CD 13).' },
            { roll: 'Tormenta en Triax', text: 'La tripulación se refugia de una alta tormenta en el refugio para marineros de la costa de Triax, convertido en guarida de piratas y desertores. Un PJ podría protegerse de las amenazas tácitas de los demás (Intimidación CD 16), festejar para forjar amistades dudosas (Persuasión CD 15) o buscar señales de los espías de Ylt (Sigilo CD 15).' },
            { roll: 'Orillas de Hexi', text: 'Los PJs desembarcan en la costa lluviosa del Gran Hexi. Pueden averiguar dónde amarró Ylt (Percepción CD 15), reconocer el terreno a toda prisa para reunir datos (Atletismo CD 15) o rastrear a los Ojos de Pala (Supervivencia CD 15).' },
          ],
        },
      ],
      branches: [
        {
          label: 'Éxito (3 éxitos antes de 3 fallos)',
          description: 'El grupo avanza rápido en su viaje y sorprende a la retaguardia de Ylt: campamento desprevenido.',
        },
        {
          label: 'Fracaso (3 fallos antes de 3 éxitos)',
          description: 'Los PJs se mueven con lentitud por Hexi y la retaguardia de Ylt los embosca.',
        },
      ],
    },
    {
      id: 'zanjas-hexi',
      title: 'Retaguardia',
      type: 'combat',
      readAloud: 'Piedras, grava y una fina capa de nieve crujen bajo vuestros pies mientras las lluvias se congelan con el frío aire del sur. Las desoladas tierras bajas están surcadas por terreno rugoso: zanjas que ascienden y descienden varios metros. Un liquen resbaladizo se aferra a los lados de guardatormenta.',
      content: [
        'Sea cual sea el resultado del empeño anterior, el largo viaje ha terminado: el grupo alcanza a los Ojos de Pala en las zanjas heladas de Hexi (mapa 4.1, «Zanjas de Hexi»).',
        'Ylt ha dejado en retaguardia a un grupo de sus leales acólitos mientras él y Kaiana buscan el valle: tres agentes de los Ojos de Pala, dos bandidos y dos arqueros. Saben que probablemente los sigan y están listos para apuntar sus armas a cualquiera que encuentren; su nivel de preparación depende del empeño «Siguiendo a Ylt».',
        'Éxito en el empeño: en la zanja más profunda, la luz estable de unas esferas asoma entre las tiendas de piel de cerdo. Varios soldados vestidos de verde, con el glifo verde del contingente de Ylt pintado en el rostro, comen raciones de grano encorvados en el lado de sotavento y aún no han visto al grupo. Los acólitos están distraídos y el grupo puede actuar; un PJ que supere una prueba de Sigilo CD 14 podrá acercarse al campamento sin ser detectado.',
        'Fracaso en el empeño: un grito de guerra resuena por las tierras bajas y una escuadra de soldados con el glifo verde pintado en la cara surge de sus escondites en las zanjas más profundas, con las espadas en alto. El grupo es emboscado: todos los PJs sufren el estado Sorprendido hasta el final de su primer turno.',
        'Axoq: los Ojos de Pala tienen prisionero en su campamento a un médico emuli llamado Axoq (experto, él), en la tienda más occidental. Si los PJs se acercan sin ser detectados, ver «Rescate de Axoq». Si no, al inicio del segundo turno rápido de los PNJs, Axoq sale de la tienda y aprovecha la lucha como distracción para huir hacia el norte. Está Ralentizado por sus ataduras y, si los PJs fracasaron en el empeño «Siguiendo a Ylt», también Agotado [−2] por su cautiverio. Aunque la retaguardia se centra en los PJs, también intenta detener violentamente a Axoq.',
        'Si un PJ obtiene una Oportunidad o sufre una Complicación, usa la tabla de Oportunidades y Complicaciones de las zanjas de Hexi como inspiración.',
        'Repercusiones: con la retaguardia vencida, el grupo puede revisar el campamento, charlar con Axoq e interrogar a los supervivientes. Un PJ logra que un acólito hable si supera Intimidación o Persuasión contra su Defensa espiritual: este cuenta que Ylt y Kaiana fueron hacia el valle por las colinas e indica el rumbo exacto. Si no lo consiguen, Axoq ya lo sabía y puede orientar a los PJs.',
      ],
      tips: [
        'Camino a la Radianza (atraer a un spren): el PJ que se esfuerce al máximo por mantener con vida a Axoq, el médico emuli, podría llamar la atención de un cultivacispren.',
      ],
      tables: [
        {
          title: 'Efectos del campo de batalla (zanjas de Hexi)',
          entries: [
            { text: 'Zanjas profundas: los personajes que se agachan en las zanjas tienen cobertura suficiente para usar la acción Prevenirse (1).' },
            { text: 'Liquen resbaladizo: cruzar las paredes de las zanjas que miran al este resulta complicado. Quien se desplace sobre el liquen necesita superar Agilidad CD 10; si falla, su movimiento queda reducido a la mitad hasta que acabe ese turno y, una vez terminado el desplazamiento, cae Tumbado.' },
          ],
        },
        {
          title: 'Oportunidades y Complicaciones de las zanjas de Hexi',
          entries: [
            { roll: 'Oportunidad', text: 'Un oponente resbala y cae a las zanjas: queda Tumbado y suelta su arma.' },
            { roll: 'Complicación', text: 'Una piedra desplazada en la refriega resulta ser en realidad un caparácaro agresivo.' },
          ],
        },
      ],
      branches: [
        {
          label: 'El empeño «Siguiendo a Ylt» tuvo éxito',
          description: 'Campamento desprevenido: un PJ con Sigilo CD 14 puede acercarse sin ser detectado y rescatar a Axoq antes del combate. Axoq solo está Ralentizado.',
        },
        {
          label: 'El empeño «Siguiendo a Ylt» fracasó',
          description: 'Emboscada: todos los PJs sufren el estado Sorprendido hasta el final de su primer turno. Axoq está Ralentizado y Agotado [−2].',
        },
      ],
    },
    {
      id: 'rescate-axoq',
      title: 'Rescate de Axoq',
      type: 'social',
      content: [
        'Si Axoq sale con vida del combate, agradece su ayuda a los PJs. Cuenta que ejercía de médico en una patrulla emuli implicada en la guerra contra los tukari (ver «La Guerra de los Ochenta», cap. 5); atravesó las montañas con sus compañeros para conseguir ingredientes medicinales. Los hombres de Ylt acabaron con casi todos los soldados emuli y lo apretaron a él para que dijera dónde queda el valle.',
        'Axoq cede a los PJs cinco dosis de hierba de invierno (un anestésico), parte de las medicinas que había reunido.',
        'También explica que su patrulla se dirigía a un importante fuerte, la Fortaleza de Ashiqqil, que los tukari han capturado hace poco, y pide acompañar a los PJs en esa dirección.',
      ],
    },
    {
      id: 'valle-vigilante-nocturna',
      title: 'El Valle de la Vigilante Nocturna',
      type: 'exploration',
      readAloud: 'Entre las nevadas faldas de las montañas Hexi se encuentra el Valle de la Vigilante Nocturna. La tierra apenas puede contener la vida silvestre de su interior: enredaderas retorcidas y árboles nudosos se enredan en un denso dosel. El aire es cálido y denso, y unos crujidos intermitentes hacen que parezca que el valle está creciendo activamente, o respirando.',
      content: [
        'Al salir del campamento de la retaguardia, el grupo puede dirigirse al noroeste, a las faldas de las montañas entre el Gran Hexi y Emul. Allí está el valle donde vive la Vigilante Nocturna, tras un muro de follaje que oculta un oscuro pasaje hacia el bosque.',
        'Si Axoq viaja con los PJs, se niega a entrar en el túnel de follaje que lleva al valle, alegando que quienes entran salen transformados. Aconseja descansar antes de entrar a los PJs que parezcan cansados y espera fuera cuando el grupo entra.',
      ],
    },
    {
      id: 'visiones-manana',
      title: 'Visiones del mañana',
      type: 'narrative',
      content: [
        'Al entrar en el valle, el grupo deambula un tiempo difícil de calcular a través de densas cortinas de enredaderas y musgo que bloquean la vista. Los túneles entre el follaje se mueven sutilmente y acaban separando a los PJs. Cuando los personajes están solos y perdidos, la Vigilante Nocturna muestra a cada uno una visión.',
        'Todos los PJs deben vivir una visión única: si hay cuatro PJs, tendrás que crear una a medida para el cuarto (ver «Visiones personalizadas»).',
        'Tras las visiones: cada una acaba con una densa niebla que envuelve al PJ y le quita toda noción de distancia y espacio. En ese vacío blanco hace una prueba de Disciplina CD 12; si la falla, la visión lo ha trastornado y debe gastar 1 punto de concentración, o quedará Desorientado durante la primera ronda del siguiente combate (ver «La locura del Vigilante de la Verdad»).',
        'Cuando concluyen las visiones se esfuma todo lo ocurrido dentro de ellas: tanto la ayuda recibida como el daño padecido. Con el grupo de nuevo junto, continuad con la escena siguiente.',
      ],
      tips: [
        'Familiarízate con esta sección antes de que el grupo siga el rastro de Ylt: cada visión presagia sucesos futuros o toca los arrepentimientos, miedos u obstáculos personales del PJ.',
        'La visión «Sombras perdidas» alude a los cantores en forma sombría del capítulo 7; si uno de los PJs es cantor, es una visión perfecta para él.',
      ],
      branches: [
        {
          label: 'Visión: Sombras perdidas',
          description: 'Figuras de sombras acechan tras cada rama protegida del bosque e imploran al PJ que las encuentre, pero se evaporan como humo cuando intenta acercarse. El aire se llena de un zumbido discordante que un PJ cantor reconoce como el Ritmo de la Súplica. Un PJ cantor nota que las sombras tienen caparazones de cantor; un PJ humano debe superar una prueba de Percepción CD 14 para darse cuenta. Las sombras susurran entre sí maldiciendo los fracasos del PJ, y una, más amable pero igual de urgente, le dice que lo tome.',
        },
        {
          label: 'Visión: El peón de Odium',
          description: 'Una luz brilla entre las raíces y las enredaderas. Si el PJ busca su origen, encuentra a Ylt con un resplandor doloroso emanando de su piel dorada, abriéndose paso por el follaje con férrea determinación. Ylt no reacciona al PJ a menos que lo ataque o lo toque; si lo hace, se gira bruscamente y su forma se desvanece, y en su lugar hay un ser que se extiende hasta el infinito: para los humanos, un anciano con túnica dorada y un cetro; para los cantores, un cantor hombren con caparazón dorado. Justo antes de que termine la visión, el odio de esa figura consume al PJ en una luz fundida y al rojo vivo.',
        },
        {
          label: 'Visión: El poder de la Regeneración',
          description: 'Mientras avanza por el follaje cambiante, el PJ debe hacer una prueba de Agilidad CD 14. Si falla, cae por un agujero invisible entre las raíces y queda gravemente herido en una cueva totalmente oscura; si responde a la voz que lo busca, aparece Kaiana, la Vigilante de la Verdad, envuelta en luz tormentosa, que le sonríe y le ofrece una mano para curar sus heridas mortales. Si la supera, se sostiene y controla la caída; entonces oye a Kaiana pidiendo ayuda y la encuentra en la oscuridad, herida pero con un tenue resplandor de luz tormentosa, llorando desconsolada y diciendo que sabía que estaba equivocado.',
        },
        {
          label: 'Visiones personalizadas',
          description: 'Si el PJ tiene un arrepentimiento, un deseo o una pregunta sin resolver relacionada con Taszo o con la promesa que le hizo, la visión debe tratar de ello. Si no, debe abordar parte de su trasfondo, sobre todo su propósito, obstáculo o metas: por ejemplo, revivir un momento en que no pudo salvar una vida, su último adiós o su mayor miedo.',
        },
      ],
    },
    {
      id: 'locura-vigilante-verdad',
      title: 'La locura del Vigilante de la Verdad',
      type: 'narrative',
      readAloud: 'Al disiparse las visiones, la bruma se transforma en una última visión que todos comparten: Ylt está ante una espiral de nieblas esmeralda que forma un rostro femenino, la Vigilante Nocturna, con Kaiana a su lado. Ylt pide como bendición el poder de derrocar a un Heraldo para ocupar el lugar de Pala. Las enredaderas descubren un cuchillo dorado con una esmeralda en el pomo, y la spren le advierte de que puede matar a un Heraldo; cuando Ylt se lanza a cogerlo, su mano lo atraviesa. La bendición de Ylt es el arma, y su maldición, que debe persuadir a otra persona para que la empuñe; Kaiana lo contempla todo con asombro.',
      content: [
        'Conforme se disipan las visiones individuales, los PJs experimentan una última visión compartida de Ylt y Kaiana en una arboleda: es la petición de Ylt a la Vigilante Nocturna.',
        'La Vigilante Nocturna accede a la petición de Ylt y le entrega un cuchillo de raysio capaz de extraer el alma de Pailiah y cortar así su conexión con el Juramento. Su maldición es que no puede tocar el cuchillo: debe convencer a un aliado para que haga lo que él diga.',
      ],
    },
    {
      id: 'batalla-valle',
      title: 'La batalla de la arboleda',
      type: 'combat',
      readAloud: 'Ylt vuelve hacia vosotros la hoja de Honor y adopta una postura de combate, mientras habla a Kaiana en tono tranquilizador. Le dice que sus visiones intentaban mostrarles esto, que Pala está perdida y que ya han reclamado el poder de la hoja de un Heraldo. Si Kaiana tiene la fuerza para abatirla, él asumirá su carga.',
      content: [
        'Inicio de la batalla: la niebla se dispersa y los PJs se encuentran al borde de una arboleda (mapa 4.2, «El valle de Cultivación»), físicamente presentes en la escena que acaban de presenciar. En el centro, a 15 metros de los PJs, están Ylt y Kaiana; la Vigilante Nocturna se ha retirado y no se la ve. Entre ellos está el cuchillo de raysio (las reglas para empuñarlo están en el apéndice B).',
        'En la primera ronda, Ylt y Kaiana juegan turnos rápidos, él antes que ella. En su primer turno, Ylt usa la acción Prepararse para preparar una Acometida (2 en total) contra cualquier PJ que se acerque al cuchillo.',
        'Objetivos de Ylt: está furioso por la llegada del grupo y no necesita provocación para atacarlo, porque lo ve como una amenaza clara para sus planes. Está convencido de que debe matar a Pailiah para ocupar su lugar como Heraldo; además de matar a los PJs, quiere salir de la arboleda con Kaiana, que portaría el cuchillo de raysio. Durante la escena le ruega a Kaiana que tome el cuchillo y se una a él: empieza confiando en que obedecerá, pero se pone cada vez más nervioso si ella se niega.',
        'En combate, Ylt hace todo lo posible por impedir que los PJs empuñen el cuchillo; si uno de ellos lo hace, centra sus ataques en ese personaje. Si pierde la hoja de Honor de Taln, la invoca de nuevo como 1 con el rasgo Invocación/Descarte de la hoja esquirlada: la hoja desaparece al instante y reaparece en su mano al comienzo de su siguiente turno rápido.',
        'Objetivos de Kaiana: tiene un conflicto interno y empieza luchando solo en defensa propia. Si ningún PJ ha reclamado el cuchillo de raysio al comenzar su primer turno, lo empuña e intenta mantenerlo fuera del alcance del grupo. Tanto Ylt como el grupo pueden convencerla de que luche por su bando, pero Kaiana es leal a Pailiah y se niega a matarla o a salir de la arboleda con el cuchillo.',
        'Suceso «Kaiana ayuda a Ylt»: la escena es un combate, pero si los PJs lo prefieren puede ser una batalla conversacional sobre la lealtad de Kaiana. El suceso, negativo, tiene tres espacios y se activa al rellenar el último espacio de Complicación. Al final de cada ronda, si ningún PJ intentó persuadir a Kaiana en esa ronda, el suceso avanza automáticamente en 1. Si Kaiana aún no se ha unido al grupo cuando se rellenan todos los espacios, ayuda a Ylt: sigue firme en no traicionar a Pailiah, pero ve a los PJs como una amenaza y los ataca. Sube la apuesta y gasta siempre las Complicaciones para hacer avanzar el suceso.',
        'Cómo persuadir a Kaiana: mientras el suceso no se haya activado, un PJ puede Usar una habilidad (1) para hacer una prueba de Liderazgo enfrentada contra Ylt (Liderazgo +6). Si el grupo convenció a Kaiana para que cuestionara a Ylt en el capítulo 3, la prueba obtiene una ventaja. Cada vez que un PJ la supera, Kaiana puede gastar 2 puntos de concentración para resistirse a la influencia; si un PJ la supera y Kaiana no tiene concentración suficiente, queda completamente convencida y se pone del lado del grupo. Si un PJ ataca a Kaiana o intenta desarmarla, las tiradas posteriores para influir en ella sufren una desventaja.',
        'Si el grupo convence a Kaiana, ella se abstiene de atacar a Ylt pero se niega a acompañarlo. Ylt se da cuenta de la inutilidad de la lucha: pasad a «Resolución del combate».',
        'Kaiana empuña el cuchillo: si Kaiana llega al cuchillo de raysio antes que ningún PJ, lo agarra con aire dubitativo y sin intención de atacar, y le dice a Ylt que nunca aceptó aquello: Pala puede no estar bien, pero sigue siendo la Heraldo de su orden. Ylt, sin bajar la guardia, la mira implorante con sus ojos verdes brillantes: sus visiones los han traído hasta allí, ha llegado una nueva Desolación y solo él tiene la fuerza para liderarlos.',
        'Desarmar a Kaiana: el PJ usa una habilidad (1) con su arma cuerpo a cuerpo, ligera o pesada, enfrentándose a la Defensa cognitiva de Kaiana, que es 13, y sube la apuesta. Si el arma es ligera, tira con una desventaja; si es pesada, con dos.',
        'Si un PJ obtiene una Oportunidad o sufre una Complicación, usa la tabla de Oportunidades y Complicaciones de la arboleda como inspiración.',
        'Repercusiones: el combate termina cuando Ylt huye. Si un PJ lo persigue, Ylt lo despista enseguida en el bosque cambiante y el PJ es transportado de vuelta a la arboleda. Si Kaiana cambió de bando y sigue viva, está desanimada por el plan de Ylt de traicionar a Pailiah, pero se acerca en silencio a los personajes heridos y, si se lo permiten, cura sus heridas con su capacidad de Regeneración. Si los PJs dudan sobre qué hacer o le piden consejo, Kaiana se apasiona y les suplica que la ayuden a liberar a los Ojos de Pala de la tiranía de Ylt, prometiendo colaborar con el grupo; está segura de que Ylt se dirige a la base de Pailiah en Rall Elorim.',
      ],
      tips: [
        'Camino a la Radianza, la spren de Kaiana: si Kaiana muere, su brumaspren vinculada, Horizontes-Siempre-A-La-Deriva, se queda en el Reino Físico llorando a su amiga; si un PJ muestra determinación por buscar la verdad tras la traición de los Ojos de Pala y de Ylt, podría buscar un nuevo vínculo con él.',
        'Los PJs con metas sobre Heraldos, hojas de Honor o Radiantes pueden aprender más hablando con Ylt y con Kaiana durante esta escena.',
      ],
      tables: [
        {
          title: 'Efectos del campo de batalla (arboleda)',
          entries: [
            { text: 'Enredaderas cambiantes: al comienzo de cada ronda, la gruesa pared de follaje se cierra visiblemente y abre cuatro túneles diferentes en lugares que elige el DJ. Quien atraviesa uno de ellos más allá del perímetro de la arboleda es transportado según los caprichos de la Vigilante Nocturna: hace de inmediato una prueba de Disciplina CD 12. Si la supera, reaparece al instante en el túnel del perímetro que elija; si la falla, reaparece en un túnel elegido por el DJ (si es un PJ) o por los jugadores (si es un oponente de los PJs).' },
          ],
        },
        {
          title: 'Oportunidades y Complicaciones de la arboleda',
          entries: [
            { roll: 'Oportunidad', text: 'La naturaleza muy Investida del valle permite al PJ absorber luz tormentosa como reacción.' },
            { roll: 'Oportunidad', text: 'Ylt hace algo que a Kaiana le parece mal, y ella pierde 1 punto de concentración.' },
            { roll: 'Complicación', text: 'Lo que hace el PJ disgusta a Kaiana: el suceso «Kaiana ayuda a Ylt» avanza 1 espacio.' },
            { roll: 'Complicación', text: 'El suelo se abre bajo el PJ entre las raíces. Puede usar su reacción Evitar peligro para tirar Agilidad CD 10 y, si la supera, se sujeta a tiempo y se libra. Si falla o prefiere no reaccionar, se precipita por un hueco invisible, recibe 3 (1d6) de daño por golpe y es expulsado, tambaleándose, por un túnel de follaje que decide la Vigilante Nocturna.' },
          ],
        },
      ],
      branches: [
        {
          label: 'Resolución: Kaiana muere o se une al grupo',
          description: 'Ylt se da cuenta de que no puede irse con el cuchillo. Si Kaiana se une al grupo, Ylt usa además una acción final para atacarla antes de huir. En cualquier caso reaparece la Vigilante Nocturna, que observa la escena en silencio; Ylt le grita, furioso, que lo ha engañado, pero que ha descubierto que se puede matar a los Heraldos y que encontrará la manera de ocupar el lugar de Pala, y se adentra en el follaje abriendo un túnel a tajos.',
        },
        {
          label: 'Resolución: Ylt con 40 de salud o menos y Kaiana empuña el cuchillo',
          description: 'Si Kaiana no se ha aliado con los PJs, Ylt empieza a huir, pero Kaiana se detiene al borde de la arboleda, dudosa: deja caer el cuchillo, dice que el futuro de su orden no puede empezar con un asesinato y propone buscar otro camino. Ylt finge aceptarlo y, cuando Kaiana sonríe y da un paso adelante, le clava la hoja de Honor en el hombro. Kaiana no está preparada: considéralo un impacto crítico con la hoja de Honor de Taln, que le inflige 25 de daño espiritual de inmediato. Si eso reduce su salud a 0, muere; si no, queda gravemente herida y murmura conmocionada que sabía que estaba equivocado.',
        },
        {
          label: 'Resolución: Ylt con 40 de salud o menos y Kaiana no empuña el cuchillo',
          description: 'Si Kaiana no se ha aliado con los PJs, ambos huyen.',
        },
        {
          label: '¿Qué pasa si alguien muere?',
          description: 'La escena presupone que nadie muere, pero puede ocurrir con Ylt, con Kaiana o con un PJ. Si el grupo mata a Ylt y recupera antes de tiempo la hoja de Honor, necesitará una nueva razón para ir a Rall Elorim: haz que Kaiana o la Vigilante Nocturna lo animen a encontrar a Pailiah y liberar a los acólitos de la influencia de Ylt; incluso sin él, sus fanáticos son una amenaza para Rall Elorim, sobre todo si liberan a los cantores en forma sombría (capítulo 7), y es posible que la propia Pailiah haya caído bajo el hechizo de Odium. Si muere Kaiana, ver «Camino a la Radianza, la spren de Kaiana». Si muere un PJ, otro puede pedir a la Vigilante Nocturna que lo resucite (ver «Una bendición y una maldición»), pero no puede concederlo si lleva muerto más de un minuto: conviene adelantar su regreso a la arboleda y que mencione esa muerte enseguida.',
        },
      ],
    },
    {
      id: 'bendicion-maldicion',
      title: 'Una bendición y una maldición',
      type: 'choice',
      readAloud: 'La Vigilante Nocturna surge de la bruma que rodea la arboleda con una amplia sonrisa y dice que han actuado bien, tal como esperaba. Su tono se vuelve serio: hay que detener a Ylt y la hoja de Honor debe llegar a Shinovar. Pide al grupo que lleve el cuchillo que ella ofreció al Heraldo de la Justicia, porque el cuchillo ayudará al Heraldo a ver la verdad y servirá al grupo en su viaje.',
      content: [
        'En cuanto el grupo puede tomar aliento, la Vigilante Nocturna vuelve a la arboleda y contesta a las preguntas que se enumeran más abajo.',
        'Quien lo desee puede pactar su propia bendición con la Vigilante Nocturna, aunque Po\'ahu avisa de que la Antigua Magia no siempre resulta sencilla ni previsible.',
        'La Vigilante Nocturna pregunta qué quiere cada personaje y le ofrece una bendición relacionada con su deseo, junto con una maldición de su elección. Usa los ejemplos de la tabla o crea bendiciones a medida para cada PJ. Una maldición no tiene por qué estar relacionada con su bendición; algunas pueden parecer bastante arbitrarias.',
        'La oferta es única y no admite regateo: el PJ la acepta o la rechaza. Si dice que sí, las enredaderas lo envuelven y el pacto se sella.',
        'Si Kaiana está con el grupo, se abstiene de pedir una bendición a la Vigilante Nocturna.',
      ],
      tips: [
        'Si un PJ ha muerto, la resurrección solo es posible si lleva muerto menos de un minuto: puedes hacer que la Vigilante Nocturna llegue pronto y mencione esa muerte de inmediato, en lugar de empezar con rodeos.',
        'Contexto: su madre es Cultivación, una de las esquirlas de Adonalsium (cap. 3 de la Guía del mundo), y Nale es el Heraldo de la Justicia (más en «La Guerra de los Ochenta» y «Heraldo de la Justicia», cap. 5).',
      ],
      tables: [
        {
          title: 'Bendiciones y maldiciones',
          entries: [
            { text: '«Resucita a mi amigo caído». Bendición: un personaje que lleva muerto menos de un minuto y cuya alma está dispuesta a regresar, resucita; quien pidió la bendición siempre puede sentir la dirección del personaje revivido, esté donde esté. Maldición: ambos personajes obtienen «imágenes residuales» distintivas que los atraen el uno hacia el otro; otros personajes las ven si pueden percibir spren en el Reino Físico o si su Discernimiento es 5 o superior.' },
            { text: '«La capacidad de encontrar a Ylt». Bendición: sientes la presencia y la dirección de todas las hojas de Honor de los Heraldos; puedes sentir las diez a cualquier distancia, aunque no distinguirlas. Maldición: mientras estés a 15 metros o menos de una hoja de Honor que no empuñas, debes gastar 1 punto de concentración cada vez que termines tu turno sin haberte acercado a ella; el efecto continúa después de haberte acercado a la hoja sin empuñarla.' },
            { text: '«El poder para derrotar a Ylt». Bendición: tu Fuerza aumenta permanentemente en 1 y una de tus manos se vuelve cristalina, aumentando la magnitud de tu dado de daño sin armas (como si tu Fuerza fuera 2 mayor). Maldición: tu Velocidad se reduce permanentemente en 1.' },
            { text: '«La capacidad de moverme como el viento». Bendición: tu Velocidad aumenta permanentemente en 1 y obtienes ventaja en las pruebas de Atletismo y Agilidad para trepar, saltar o volar. Maldición: tu peso se reduce permanentemente a la mitad; en las pruebas relacionadas con tu masa te consideras una categoría de tamaño menor, y los enemigos obtienen ventaja en las pruebas para agarrarte o moverte.' },
            { text: '«La sabiduría para derrotar a Ylt». Bendición: +1 permanente a Intelecto y a Discernimiento. Maldición: antes de atacar a un humanoide con 25 de salud o menos hay que superar Disciplina CD 20; quien falla se marea de náuseas y queda Aturdido 2 rondas.' },
            { text: '«Fortalece mi voluntad». Bendición: tu Voluntad aumenta permanentemente en 1; mientras estás Resuelto, puedes gastar 1 punto de concentración para obtener ventaja en una prueba, y no puedes volver a hacerlo hasta que vuelvas a obtener ese estado. Maldición: tu Discernimiento se reduce permanentemente en 1.' },
            { text: '«Haz de mí un mejor líder». Bendición: tu cuerpo y tus ropas brillan con luz dorada en un radio de 3 metros, tu porte se vuelve más imponente y tu Presencia aumenta permanentemente en 1. Maldición: en las pruebas para permanecer oculto o mantener un disfraz sufres una desventaja en tu d20 (y en el dado de trama, si lo tiras); además, una vez al día, a discreción del DJ, al obtener una Complicación quedas Desorientado durante 2 rondas.' },
            { text: '«Un arma para derrotar a mis enemigos». Bendición: obtienes una hoja esquirlada con forma de espada larga, de 1,8 metros, que brilla con una luz verde blanquecina y, si la empuña un Radiante, no grita. Maldición: la hoja no se puede invocar ni descartar; mientras la llevas, sufres una desventaja en las pruebas de Sigilo, y su inmenso valor, evidente, te convierte en objetivo de quienes quieran apropiarse de su poder.' },
            { text: '«El don de ver el futuro». Bendición: ganas el talento Visión del futuro del árbol de Iluminado (cap. 5 del Manual del Archivo de las Tormentas). Maldición: en combate, si no te das prisa, te ahogan las visiones de lo que podrían hacer tus oponentes; cada turno lento que juegues te deja Agotado [−1] hasta que acabe la escena.' },
            { text: '«Muchas riquezas». Bendición: atraerás el dinero, salvo el infuso con Investidura; obtienes ventaja en las pruebas de Hurto para robar esferas opacas u otra moneda no Investida a otros personajes. Maldición: el dinero no Investido desatendido (esferas opacas, gemas) situado a 6 metros o menos se ve atraído hacia ti a gran velocidad; cada pieza inflige 1 punto de daño por golpe al chocar contigo, y con un escudo puedes usar la reacción Evitar peligro para no sufrirlo hasta el inicio de tu siguiente turno.' },
            { text: '«Un gran prestigio». Bendición: todos los desconocidos saben tu nombre automáticamente y consigues la atención de un spren inteligente. Maldición: cada vez que conoces el nombre de una persona, olvidas para siempre el nombre de otra que te importa.' },
            { text: '«La inmortalidad». Bendición: ni la vejez ni las lesiones pueden matarte; al sufrir una lesión, su efecto se anula al instante y, si estás a 0 de salud, recuperas 1d4 (apunta en tu hoja la lesión sanada). Maldición: cada lesión que tu inmortalidad cure hace brotar de nuevo una parte de tu cuerpo en forma de enredaderas, hojas o cristales; la quinta vez desapareces para siempre. Con el tiempo, un cultivacispren curioso se interesa por tu grupo.' },
          ],
        },
      ],
      branches: [
        {
          label: '¿Qué tiene de especial este cuchillo?',
          description: 'Está hecha de raysio, el metal divino de Odium. Frente a cualquier enemigo mortal le quita parte de su Investidura; pero si con ella se asesta el golpe final a un Heraldo, es mucho más terrible: atrapa su alma y lo corta del Juramento.',
        },
        {
          label: '¿Cómo podemos encontrar la hoja de Honor?',
          description: 'Ylt ha tomado un camino que no será fácil de seguir. Esto se ha convertido en un asunto de Heraldos y el grupo debe buscar la ayuda de uno.',
        },
        {
          label: '¿Dónde podemos encontrar al Heraldo de la Justicia?',
          description: 'Hay que llevar el cuchillo de raysio al oeste, a través de las montañas, hasta la Fortaleza de Ashiqqil; allí el grupo se topará con una batalla y con gente que necesita ayuda. Dentro del castillo debe buscar a Nale, un hombre makabaki marcado con una medialuna, y entregarle la hoja: puede que él les ayude a dar caza al sirviente de Odium.',
        },
        {
          label: '¿Cuál es tu motivación en todo esto?',
          description: 'Eso habría que preguntárselo a su madre, que es quien maneja los hilos para que todo ocurra como corresponde; nadie puede ponerla en duda.',
        },
        {
          label: '¿Qué sacamos nosotros de todo esto?',
          description: 'Ha ofrecido sus dones generosamente, les ha mostrado su destino y los ha llevado allí para enfrentarse al caballero de Odium. Además, ofrece a cada uno otra bendición, si la desean, pero hay que pagar un precio para equilibrarla.',
        },
      ],
    },
    {
      id: 'abandonando-valle',
      title: 'Abandonando el valle',
      type: 'narrative',
      content: [
        'Una vez cerrados todos los pactos, la Vigilante Nocturna se desvanece junto con su arboleda y el grupo queda a solas. Po\'ahu presiona a los PJs para que marchen hacia el oeste cruzando las montañas, tal como pidió la Vigilante Nocturna.',
        'Si Kaiana sigue con vida, les garantiza que Ylt ha escapado hacia el oeste para conseguir pasaje desde Emul rumbo a Rall Elorim; lo que ignora es si después seguirá por tierra hacia el norte o por mar hacia el sur.',
        'Si Axoq siguió al grupo hasta las montañas, se reúne con él al salir del valle.',
      ],
      branches: [
        {
          label: 'Rechazo de la llamada',
          description: 'Si el grupo rechaza el encargo de llevar el cuchillo de raysio al juez, es Nale quien va a su encuentro. La escena, tensa, se gestiona con «Heraldo de la Justicia» (cap. 5); los detalles pueden cambiar según la ruta que tome el grupo hacia Rall Elorim.',
        },
      ],
    },
    {
      id: 'viaje-continua',
      title: 'El viaje continúa',
      type: 'narrative',
      content: [
        'Tras frustrar los planes de Ylt y decidir el destino de Kaiana, el grupo puede partir del valle, ir por tierra a Emul y proseguir con la misión de la Vigilante Nocturna, además de su misión de recuperar la hoja de Honor de Taln.',
        'Tras sobrevivir al enfrentamiento con Ylt, los personajes suben al nivel 5.',
      ],
    },
  ],

  npcs: [
    {
      name: 'Teryn',
      pronouns: 'ella',
      type: 'Humana alezi, lugarteniente de la Reina Bandida',
      role: 'ally',
      traits: ['Resuelta', 'Paciente', 'Estratégica'],
      goal: 'Sobrevivir y liberar Rathalas de las garras de Ylt',
      appearance: 'Humana alezi de físico poderoso, llena de cicatrices. Lleva el pelo afeitado a ambos lados y una sola trenza.',
      notes: 'Regresa del capítulo 3, donde Ylt, tras matar a la Reina Bandida, la había encarcelado. Ofrece al grupo el «Broma de la tormenta» y su pequeña tripulación, pero prefiere quedarse a liderar a los bandidos leales. Antes de zarpar comparte en privado su sospecha de que Kaiana podría no ser tan leal a Ylt como este cree.',
    },
    {
      name: 'Ubo',
      pronouns: 'él',
      type: 'Contramaestre herdaziano (bandido)',
      role: 'ally',
      traits: ['Precavido', 'Amable', 'Atento'],
      goal: 'Asegurarse de que sus amigos y colegas están a salvo',
      appearance: 'Humano herdaziano de mediana edad, muy elegante. Sus uñas pintadas de colores vivos van a juego con los detalles coloridos de su ropa de trabajo.',
      notes: 'Regresa del capítulo 3 (antes fue contramaestre de un barco mercante capturado por los bandidos de Rathalas). Es el primero en ofrecerse como tripulante y timonel: conoce bien estas aguas. Usa la ficha de bandido: se une a los PJs contra las anguilas aéreas y avisa del deterioro del barco. Si el empeño de la tormenta eterna fracasa, muere junto con tres tripulantes humanos.',
    },
    {
      name: 'Tam',
      pronouns: 'él',
      type: 'Cantor plebeyo, tripulante en forma de trabajo',
      role: 'neutral',
      traits: ['Recién despertado de la forma esclava', 'Nervioso por su precaria posición', 'Decidido a marcharse'],
      goal: 'Abandonar el barco y disfrutar de su libertad a su manera',
      appearance: 'Cantor que, tras la tormenta eterna, ha adoptado la forma de trabajo. El libro no detalla más su aspecto.',
      notes: 'Los bandidos lo pusieron a trabajar tras capturarlo en el asalto a una caravana de mercaderes. Despierta con Veda cuando termina la tormenta eterna. Si los PJs superan Persuasión CD 12, habla de su angustia por los años de esclavitud y de cómo ha reconectado con su identidad; si no, intenta escabullirse. Por mucho que lo intenten, se irá del barco. En la escena del despertar, uno de los dos levanta el garrote y «la otra» grita que se llevan el bote salvavidas.',
    },
    {
      name: 'Veda',
      pronouns: 'ella',
      type: 'Cantora plebeya, tripulante en forma de trabajo',
      role: 'neutral',
      traits: ['Recién despertada de la forma esclava', 'Nerviosa por su precaria posición', 'Decidida a marcharse'],
      goal: 'Abandonar el barco y disfrutar de su libertad a su manera',
      appearance: 'Cantora que, tras la tormenta eterna, ha adoptado la forma de trabajo. El libro no detalla más su aspecto.',
      notes: 'Los bandidos la pusieron a trabajar tras capturarla en el asalto a una caravana de mercaderes. Despierta con Tam cuando termina la tormenta eterna y, como él, abandona el barco pase lo que pase. Si hay un PJ cantor, los dos lo invitan a una celebración íntima de su nuevo yo.',
    },
    {
      name: 'Roil',
      pronouns: 'ella',
      type: 'Vacíospren',
      role: 'special',
      traits: ['Impulsiva', 'Busca cantores a los que bendecir con formas de poder', 'Intenta atraerlos hacia la influencia de Odium'],
      goal: 'Bendecir a cantores con formas de poder mientras los acerca a la influencia de Odium',
      appearance: 'Se mueve por el aire como un rayo; al descansar, se transforma en una figura humanoide roja.',
      notes: 'Aborda a los PJs cantores durante la tormenta eterna. Si un PJ cantor muestra interés, puede añadir la meta «Conseguir una forma de poder»; si lo hace, Roil lo sigue tras la tormenta, se le aparece solo a ese PJ y fomenta sus instintos más espontáneos. Las formas de poder están en «Ascendencia cantora» (capítulo 2 del Manual del Archivo de las Tormentas).',
    },
    {
      name: 'Axoq',
      pronouns: 'él',
      type: 'Médico emuli (experto), prisionero de la retaguardia',
      role: 'ally',
      traits: ['Nostálgico', 'Con conocimientos de botánica', 'De voz suave'],
      goal: 'Ayudar en lo que pueda al esfuerzo de guerra emuli',
      appearance: 'Axoq («AX-ock») es un humano emuli esbelto, de tez oscura, con un pañuelo muy colorido envolviéndole el pelo gris.',
      notes: 'Identifica plantas por el camino, explica sus usos y a veces guarda un esqueje en el bolsillo. Es profundamente supersticioso con el valle, donde las plantas «crecen mal»: se niega a entrar y espera fuera. En sus momentos de calma echa de menos su casita junto a un huerto, destruida por los tukari. Era el médico de una patrulla emuli que cruzó las montañas buscando ingredientes medicinales y se dirigía a la Fortaleza de Ashiqqil, ahora en manos de los tukari. Si lo rescatan, ofrece cinco dosis de hierba de invierno (un anestésico) y pide acompañar a los PJs. Si Axoq sigue al grupo hasta las montañas, se reúne con él al salir del valle. Un PJ que haga todo lo posible por salvarlo puede atraer a un cultivacispren.',
    },
    {
      name: 'Ylt',
      pronouns: 'él',
      type: 'Vigilante de la Verdad iriali, líder de los Ojos de Pala',
      role: 'villain',
      traits: ['Arrogante', 'Furioso con los PJs', 'Convencido de su misión'],
      goal: 'Matar a Pailiah con el cuchillo de raysio y ocupar su lugar como Heraldo, saliendo de la arboleda con Kaiana portando el cuchillo',
      appearance: 'Iriali de brillantes ojos verdes que empuña la hoja de Honor de Taln. Sus acólitos llevan pintado en el rostro su glifo verde.',
      notes: 'Ficha de Jefe de rango 1 en el apéndice A (Liderazgo +6). Está vinculado al brumaspren Iluminado Tyche. La Vigilante Nocturna le da el cuchillo como bendición; su maldición es que no puede tocarlo y debe convencer a otra persona para que lo empuñe. En la arboleda ruega a Kaiana que lo tome y se nerviosea si ella se niega. Si Kaiana se une al grupo, la ataca antes de huir; si Kaiana empuña el cuchillo y él baja a 40 de salud, le clava la hoja de Honor tras fingir ceder. Huye con 40 de salud o menos y, si un PJ lo persigue, lo despista en el bosque cambiante.',
    },
    {
      name: 'Kaiana',
      pronouns: 'ella',
      type: 'Humana reshi, Vigilante de la Verdad y aprendiz de Ylt',
      role: 'neutral',
      traits: ['Leal a Pailiah', 'En conflicto interno', 'Dispuesta a cambiar de bando'],
      goal: 'No traicionar ni matar a Pailiah; si cambia de bando, liberar a los Ojos de Pala de la tiranía de Ylt',
      appearance: 'Mujer reshi. El libro no detalla más su aspecto en este capítulo.',
      notes: 'Ficha de Rival de rango 1 en el apéndice A: 34 de salud, 4 de concentración, Defensa cognitiva 13. Regresa del capítulo 3. Empieza luchando solo en defensa propia; si ningún PJ ha reclamado el cuchillo al comenzar su primer turno, lo empuña. Resiste la persuasión gastando 2 puntos de concentración. Si empuña el cuchillo de raysio, su ficha gana «Acometida: Cuchillo de raysio» (ataque con Cuchillo sin acción; si impacta, el objetivo pierde 1 punto de Investidura). Si cambia de bando y sigue viva, cura a los heridos con Regeneración y suplica ayuda para liberar a los Ojos de Pala; cree que Ylt va a Rall Elorim. Si el grupo la convenció en el capítulo 3 de que cuestionara a Ylt, la prueba de Liderazgo tiene ventaja. Su spren es Horizontes-Siempre-A-La-Deriva.',
    },
    {
      name: 'Horizontes-Siempre-A-La-Deriva',
      pronouns: 'ella',
      type: 'Brumaspren vinculada a Kaiana',
      role: 'special',
      traits: ['Adora a Kaiana', 'Amante de los viajes y de las ciudades', 'Se aburre y se pone nerviosa si Kaiana se queda en un sitio más de unos días'],
      goal: 'Viajar y conocer lugares nuevos, sobre todo ciudades, junto a Kaiana',
      appearance: 'Cuando se mueve parece luz refractada a través del cristal; cuando está quieta, su luz se retuerce en formas parecidas a algas marinas que brotan hacia arriba y ondean como en aguas invisibles.',
      notes: 'Si Kaiana muere, la brumaspren permanece en el Reino Físico llorando la pérdida de su amiga. Si un PJ muestra determinación por buscar la verdad tras la traición de los Ojos de Pala y de Ylt, podría buscar un nuevo vínculo con él.',
    },
    {
      name: 'La Vigilante Nocturna',
      pronouns: 'ella',
      type: 'Spren legendaria, hija de Cultivación',
      role: 'special',
      traits: ['Extraña', 'Generosa', 'Mística'],
      goal: 'Asegurarse de que el cuchillo de raysio acabe en manos de Nale',
      appearance: 'Toma forma de brumas que serpentean, con numerosos brazos y un rostro de mujer. Sus ojos son de un negro absoluto y su voz suena a viento que recorre un bosque.',
      notes: 'Enigmática y legendaria spren que concede bendiciones y maldiciones desde su valle; aunque a veces inclina la balanza en los asuntos de Roshar, sus objetivos son inescrutables. Muestra visiones a cada PJ, entrega a Ylt el cuchillo de raysio y, tras la batalla, responde a cinco preguntas y ofrece a cada PJ una bendición con su maldición. Su madre es Cultivación y no se puede cuestionar. Al terminar los tratos, ella y su arboleda desaparecen. Si los PJs se niegan a llevar el cuchillo a Nale, es él quien acude a ellos.',
    },
  ],

  combats: [
    {
      id: 'combat-anguilas',
      title: 'Anguilas aéreas sobre el Broma de la tormenta',
      enemies: [
        { name: 'Anguila aérea mayor', count: '2', bonus: 'Bomba en picado (2) en su primer turno; cada Mordisco (1) en cubierta, el inicial incluido, inflige 9 (1d6 + 5) de daño por golpe al barco' },
        { name: 'Anguila aérea', count: '2', bonus: 'Bomba en picado (2) en su primer turno' },
      ],
      specialRules: [
        'Antes del combate: todo PJ que no esté a cubierto debe superar una prueba de Agilidad CD 10 o sufre 2 (1d4) de daño por golpe cuando el enjambre barre la cubierta.',
        'En su primer turno, las cuatro anguilas se lanzan sobre la cubierta con Bomba en picado (2); después luchan como presas acorraladas.',
        'Pánico de las anguilas aéreas: cada vez que una anguila aérea mayor usa Mordisco (1) en cubierta, incluida la Bomba en picado inicial, inflige 9 (1d6 + 5) de daño por golpe al barco. Lleva la cuenta del daño total.',
        'Cubierta oscilante: al final de cada ronda, todos los personajes en cubierta hacen una prueba de Agilidad CD 10; con un fallo quedan Tumbados y caen 3 metros a la izquierda o a la derecha del barco (alternando de lado cada ronda). Pueden elegir fallar. Golpearse contra las barandillas causa 2 (1d4) de daño por golpe al personaje y al barco.',
        'Enjambre: cada vez que termina una ronda, llega al combate otra anguila aérea.',
        'Ubo (bandido) lucha junto a los PJs; el resto de la tripulación se refugia bajo cubierta.',
        'El combate termina cuando mueren las dos anguilas aéreas mayores; pasad de inmediato a «Una nueva tormenta», sin tiempo para reparar el barco.',
        'Integridad del barco: el daño total determina los fallos iniciales del empeño de la tormenta eterna: 30-44 de daño, 1 fallo; 45-59, 2 fallos; 60 o más, 3 fallos.',
      ],
    },
    {
      id: 'combat-zanjas',
      title: 'Retaguardia de Ylt en las zanjas de Hexi',
      mapRef: 'map-4-1',
      enemies: [
        { name: 'Agente de los Ojos de Pala', count: '3' },
        { name: 'Bandido', count: '2' },
        { name: 'Arquero', count: '2' },
      ],
      specialRules: [
        'Si el empeño «Siguiendo a Ylt» tuvo éxito, el campamento está desprevenido: un PJ que supere Sigilo CD 14 puede acercarse sin ser detectado.',
        'Si el empeño fracasó, la retaguardia tiende una emboscada: todos los PJs sufren el estado Sorprendido hasta el final de su primer turno.',
        'Axoq, prisionero en la tienda más occidental: si los PJs se acercan sin ser detectados, ver «Rescate de Axoq». Si no, al inicio del segundo turno rápido de los PNJs sale de la tienda y huye hacia el norte, Ralentizado por sus ataduras (y Agotado [−2] si el empeño de navegación fracasó). La retaguardia también intenta detenerlo con violencia.',
        'Zanjas profundas: los personajes que se agachan en ellas tienen cobertura suficiente para usar la acción Prevenirse (1).',
        'Liquen resbaladizo: en los lados de las zanjas encarados al este, quien se mueve por el liquen debe superar una prueba de Agilidad CD 10 o su movimiento se reduce a la mitad hasta el final de ese turno y queda Tumbado al completarlo.',
        'Tras la lucha, un PJ puede interrogar a un superviviente con una prueba de Intimidación o Persuasión contra su Defensa espiritual: revela que Ylt y Kaiana fueron por las colinas hacia el valle, y en qué dirección. Si no, Axoq puede dar indicaciones.',
      ],
      tables: [
        {
          title: 'Oportunidades y Complicaciones de las zanjas de Hexi',
          entries: [
            { roll: 'Oportunidad', text: 'Un oponente resbala y cae a las zanjas: queda Tumbado y suelta su arma.' },
            { roll: 'Complicación', text: 'Una piedra desplazada en la refriega resulta ser en realidad un caparácaro agresivo.' },
          ],
        },
      ],
    },
    {
      id: 'combat-valle',
      title: 'La batalla de la arboleda (Ylt y Kaiana)',
      mapRef: 'map-4-2',
      enemies: [
        { name: 'Ylt', count: '1', bonus: 'Liderazgo +6; turno rápido antes que Kaiana; prepara una Acometida (2 en total) contra quien se acerque al cuchillo; invoca de nuevo la hoja de Honor de Taln como 1 si la pierde' },
        { name: 'Kaiana', count: '1', bonus: 'Empieza luchando solo en defensa propia; Defensa cognitiva 13; puede unirse al grupo o ayudar a Ylt' },
      ],
      specialRules: [
        'Los PJs empiezan al borde de la arboleda; Ylt y Kaiana están en el centro, a 15 metros, con el cuchillo de raysio entre ellos. En la primera ronda, Ylt y Kaiana juegan turnos rápidos, él antes que ella.',
        'En su primer turno, Ylt usa Prepararse para preparar una Acometida (2 en total) contra cualquier PJ que se acerque al cuchillo; si un PJ lo empuña, Ylt centra en él sus ataques.',
        'Si Ylt pierde la hoja de Honor de Taln, la invoca de nuevo como 1 (rasgo Invocación/Descarte de la hoja esquirlada): desaparece al instante y reaparece en su mano al comienzo de su siguiente turno rápido.',
        'Kaiana lucha solo en defensa propia. Si ningún PJ ha reclamado el cuchillo al comenzar su primer turno, lo empuña e intenta mantenerlo lejos del grupo. Sea cual sea su bando, es leal a Pailiah: se niega a matarla o a salir de la arboleda con el cuchillo.',
        'Cuchillo de raysio (apéndice B): al impactar, el objetivo pierde 1 punto de Investidura; puede matar permanentemente a una sombra cognitiva en un cuerpo físico, como un Heraldo. Si Kaiana lo empuña, su ficha gana «Acometida: Cuchillo de raysio»: ataque con Cuchillo (sin acción) y, si impacta, el objetivo pierde 1 punto de Investidura.',
        'Suceso «Kaiana ayuda a Ylt» (3 espacios; se activa al rellenar el último espacio de Complicación): al final de cada ronda en que ningún PJ haya intentado persuadir a Kaiana, avanza en 1; gasta siempre las Complicaciones para hacerlo avanzar. Si Kaiana aún no se ha unido al grupo cuando se activa, ayuda a Ylt y ataca a los PJs.',
        'Persuadir a Kaiana (suceso aún no activado): Usar una habilidad (1) para hacer una prueba de Liderazgo enfrentada contra Ylt (Liderazgo +6); ventaja si el grupo la convenció en el capítulo 3 de que cuestionara a Ylt. Cada vez que un PJ la supera, Kaiana puede gastar 2 puntos de concentración para resistirse; si no puede, se une al grupo. Si un PJ la ataca o intenta desarmarla, las tiradas posteriores para influir en ella sufren una desventaja.',
        'Desarmar a Kaiana: Usar una habilidad (1) con un arma cuerpo a cuerpo contra su Defensa cognitiva (13), subiendo la apuesta; con arma ligera, una desventaja; con arma pesada, dos.',
        'Enredaderas cambiantes: al comienzo de cada ronda se abren cuatro túneles en lugares que elige el DJ. Quien atraviesa uno más allá del perímetro debe superar una prueba de Disciplina CD 12: si la supera, reaparece en el túnel del perímetro que elija; si la falla, en uno elegido por el DJ (PJ) o por los jugadores (oponentes).',
        'El combate termina cuando: Kaiana muere o se une al grupo; o Ylt tiene 40 puntos de salud o menos y Kaiana empuña el cuchillo; o Ylt tiene 40 puntos de salud o menos y Kaiana no empuña el cuchillo.',
        'Kaiana muere o se une al grupo: Ylt no puede irse con el cuchillo; si Kaiana se une al grupo, Ylt la ataca con una acción final antes de huir. Reaparece la Vigilante Nocturna.',
        'Ylt con 40 de salud o menos y Kaiana empuña el cuchillo (sin haberse aliado con los PJs): Ylt empieza a huir, Kaiana duda y deja caer el cuchillo, y Ylt le clava la hoja de Honor en el hombro, un impacto crítico de 25 de daño espiritual. Si su salud llega a 0, Kaiana muere; si no, queda gravemente herida.',
        'Ylt con 40 de salud o menos y Kaiana no empuña el cuchillo (sin haberse aliado con los PJs): ambos huyen.',
      ],
      tables: [
        {
          title: 'Oportunidades y Complicaciones de la arboleda',
          entries: [
            { roll: 'Oportunidad', text: 'La naturaleza muy Investida del valle permite al PJ absorber luz tormentosa como reacción.' },
            { roll: 'Oportunidad', text: 'Ylt hace algo que a Kaiana le parece mal, y ella pierde 1 punto de concentración.' },
            { roll: 'Complicación', text: 'Lo que hace el PJ disgusta a Kaiana: el suceso «Kaiana ayuda a Ylt» avanza 1 espacio.' },
            { roll: 'Complicación', text: 'El suelo se abre bajo el PJ entre las raíces. Puede usar su reacción Evitar peligro para tirar Agilidad CD 10 y, si la supera, se sujeta a tiempo y se libra. Si falla o prefiere no reaccionar, se precipita por un hueco invisible, recibe 3 (1d6) de daño por golpe y es expulsado, tambaleándose, por un túnel de follaje que decide la Vigilante Nocturna.' },
          ],
        },
      ],
    },
  ],

  maps: [
    {
      id: 'map-4-1',
      title: 'Mapa 4.1: Zanjas de Hexi',
      pdfPage: 87,
      imagePath: '/maps/map_p87.webp',
      scale: '1 casilla = 1,5 m',
      locations: ['Tienda de Axoq (la más occidental; el mapa la rotula)', 'Otras dos tiendas del campamento, sin rotular', 'Zanjas profundas (cobertura para Prevenirse)', 'Lados de las zanjas encarados al este (liquen resbaladizo)'],
      notes: 'Mapa del combate contra la retaguardia de Ylt (L. 83). El mapa solo rotula la tienda de Axoq y muestra la brújula (norte arriba).',
    },
    {
      id: 'map-4-2',
      title: 'Mapa 4.2: El valle de Cultivación',
      pdfPage: 93,
      imagePath: '/maps/map_p93.webp',
      scale: '1 casilla = 5 pies (1,5 m); el mapa lo rotula «1 square = 5 ft.»',
      locations: ['Arboleda: en el centro, Ylt y Kaiana, a 15 metros de los PJs', 'Cuchillo de raysio (entre Ylt y Kaiana)', 'Borde de la arboleda (punto de partida de los PJs)', 'Perímetro de follaje (cuatro túneles nuevos cada ronda)'],
      notes: 'Mapa del combate en la arboleda (L. 89). El mapa no lleva rótulos de lugares.',
    },
  ],
}
