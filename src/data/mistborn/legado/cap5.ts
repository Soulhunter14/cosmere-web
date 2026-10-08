import type { AdventureChapter, SceneTable } from '../../libros/tipos'

/** Tables used by a scene and by its combat or rule section: defined once so both always show the same entries */
const TABLA_A_FONDO: SceneTable = {
  title: 'Oportunidades y Complicaciones de ¡A fondo!',
  entries: [
    { roll: 'O', text: 'El PJ deja descolocados a los rivales. Su jugador cuenta cómo aprovecha el desconcierto y hace, con una habilidad adecuada, una prueba enfrentada contra el rival del momento. Si la gana, el grupo lo adelanta al instante; si la gana el rival, esa derrota no cuenta como fallo del empeño.' },
    { roll: 'C', text: 'Una polvareda cae sobre la cara de quien conduce: las pruebas de conducción sufren desventaja hasta que otro PJ tome el volante.' },
  ],
}

const TABLA_POSICIONES: SceneTable = {
  title: 'Posición inicial del grupo según los fallos de ¡A fondo!',
  entries: [
    { roll: '0 fallos', text: '6.ª posición' },
    { roll: '1 fallo', text: '7.ª posición' },
    { roll: '2 fallos', text: '8.ª posición' },
    { roll: '3 fallos', text: '9.ª posición' },
  ],
}

const TABLA_ACCIONES_BAYRON: SceneTable = {
  title: 'Acciones de rival de Bayron (Defensa cognitiva 17, Defensa espiritual 16, 5 puntos de concentración)',
  entries: [
    { text: 'Refuerzos en la calzada: Bayron hace una seña y un piloto PNJ anónimo resulta ser un infiltrado a su servicio. Se coloca a ese piloto justo detrás de Bayron, que puede desviar gratis hacia él los efectos de cualquier acción.' },
    { text: '¡Granada!: lanza una granada cegadora desde su coche. Cada PJ hace una prueba de Disciplina CD 13. Si falla quien conduce, el grupo retrocede 1 posición; los PJ que no conducen y fallan quedan Desorientados hasta el final de su siguiente turno.' },
    { text: 'Empujón de acero: con alomancia, Bayron empuja las piezas metálicas del volante del coche del grupo. Quien conduce debe superar una prueba de Atletismo CD 15; si no, el grupo retrocede 1 posición.' },
  ],
}

const TABLA_ACCIONES_LYSARRA: SceneTable = {
  title: 'Acciones de rival de Lysarra (Defensa cognitiva 18, Defensa espiritual 18, 6 puntos de concentración)',
  entries: [
    { text: 'Disparo con cinc: apoyada en cálculos que potencia el cinc, inclina su retrovisor y acierta un disparo de pistola imposible. Quien conduce debe superar una prueba de Agilidad CD 15; si falla, el coche queda dañado y las pruebas de conducción sufren desventaja hasta repararlo con una prueba de Manufactura CD 13.' },
    { text: 'Derrape perfecto: un giro impecable en una curva cerrada obliga a los demás a frenar, cambiar de rumbo o arriesgarse a chocar. Quien conduce debe superar una prueba de Deducción CD 14; si no, el grupo retrocede 1 posición.' },
    { text: 'Atajar: Lysarra se cuela por un callejón estrecho y reaparece de golpe más adelante. Quien conduce debe superar una prueba de Percepción CD 15; si no, el grupo retrocede 1 posición, y si lo desea Lysarra ocupa el puesto que el grupo acaba de dejar libre.' },
  ],
}

const TABLA_OBSTACULOS_CARRERA: SceneTable = {
  title: 'Obstáculos posibles de la carrera',
  entries: [
    { roll: 'Tráfico denso', text: 'Cuesta ganar terreno entre tanto vehículo. Quien conduce puede colarse entre dos coches de un volantazo (prueba de Agilidad CD 15); también se puede decantar cinc para calcular la posición en fracciones de segundo (el libro no da CD) o buscar huecos en el camino (prueba de Percepción CD 15).' },
    { roll: 'Competidores hábiles', text: 'Un piloto agresivo trata de embestir de costado. Un PJ puede lanzar objetos sueltos a la calzada (prueba de Atletismo CD 14), disparar a un neumático u otro punto débil (prueba de Armamento ligero CD 14) o provocar a ese piloto para que cometa un error grave (prueba de Intimidación CD 15).' },
    { roll: 'Daños en el automóvil', text: 'El estilo temerario del grupo, o quizá otro piloto, acaba dañando el coche. Un PJ puede apretar la biela de dirección (prueba de Manufactura CD 14), remendar un conducto que pierde (prueba de Hurto CD 15) o sujetar a la fuerza una pieza que cede (prueba de Atletismo CD 15).' },
  ],
}

const TABLA_CARRERA_OC: SceneTable = {
  title: 'Oportunidades y Complicaciones de Caos automovilístico',
  entries: [
    { roll: 'O', text: 'El motor de otro piloto revienta en una nube de humo negro y este debe abandonar la carrera.' },
    { roll: 'O', text: 'El PJ abre distancia entre el grupo y los demás pilotos: la próxima ronda se anula una acción de rival.' },
    { roll: 'C', text: 'Escombros de unas obras cercanas se enredan en las ruedas. El grupo no puede adelantar hasta limpiarlas con una prueba de Hurto CD 13.' },
    { roll: 'C', text: 'Los coches de delante van tan apiñados que no se puede afectar a ambos. Elige a Bayron o a Lysarra: durante esta ronda no puede ser objetivo de ninguna acción.' },
    { roll: 'C', text: 'Transeúntes invaden la calzada: toda acción que exija ver o apuntar sufre desventaja durante 1 ronda.' },
    { roll: 'C', text: 'Las ruedas pisan una mancha de aceite y pierden agarre, y el coche hace un trompo: el grupo retrocede 1 posición.' },
  ],
}

const TABLA_INSIGNIA_OC: SceneTable = {
  title: 'Oportunidades y Complicaciones de Robar la insignia',
  entries: [
    { roll: 'O', text: 'Algo escandaloso en la sala capta la atención de Kwylliam y lo entretiene, así que el grupo puede intentar robar la insignia de inmediato.' },
    { roll: 'C', text: 'Kwylliam aviva sin pensar las emociones del PJ: hace una prueba de Persuasión contra su Defensa espiritual. Si la gana, el PJ debe gastar 2 puntos de concentración o emprender una acción temeraria.' },
  ],
}

const TABLA_PASILLO_OC: SceneTable = {
  title: 'Oportunidades y Complicaciones de Carrera por el pasillo',
  entries: [
    { roll: 'O', text: 'Un archivero que huye se cruza en el camino de los guardias y os da un respiro: sumad un éxito al empeño.' },
    { roll: 'C', text: 'A un PJ se le escurre la caja y se resquebraja, y los peines decorativos se esparcen. Si los PJ intentan recogerlos, necesitan un éxito adicional.' },
  ],
}

const TABLA_ANDANADA: SceneTable = {
  title: 'Andanada de los vigilantes de la ley',
  entries: [
    { roll: 'Ronda 1', text: 'Prueba de Agilidad CD 10; daño 1d4 por laceración.' },
    { roll: 'Ronda 2', text: 'Prueba de Agilidad CD 11; daño 1d6 por laceración.' },
    { roll: 'Ronda 3', text: 'Prueba de Agilidad CD 12; daño 1d8 por laceración.' },
    { roll: 'Ronda 4', text: 'Prueba de Agilidad CD 13; daño 1d10 por laceración.' },
  ],
}

const TABLA_PLAZA_OC: SceneTable = {
  title: 'Oportunidades y Complicaciones de Batalla en la plaza Beldre',
  entries: [
    { roll: 'O', text: 'Un disparo revienta un farol de gas y llena la plaza de humo: los PJ tienen ventaja en sus pruebas de Agilidad contra la Andanada hasta el final de la próxima ronda.' },
    { roll: 'C', text: 'Una bala agrieta una estatua y lanza metralla. Los PJ a menos de 3 metros de ella deben superar una prueba de Agilidad CD 13 o sufren 1d4 de daño por golpe.' },
  ],
}

export const CAPITULO_5: AdventureChapter = {
  id: 'legado-cap5',
  number: 5,
  title: 'Motores y espionaje',
  pdfPages: { from: 95, to: 113 },
  levelFrom: 3,
  levelTo: 3,
  eras: ['era2'],
  summary: 'Primer capítulo de la Era 2, tres siglos después de la Era 1, con un grupo nuevo de nivel 3. Los PJ corren en una carrera ilegal de coches por Elendel contra el Trío Dorado (Bayron Conrad, Lysarra Tekiel y Kwylliam Elariel), y una analepsis explica por qué: la profesora Azmine Wilko los ha contratado para sacar de los Archivos Nacionales la caja 38.4B antes de que Kwylliam se la quede. Quedar entre los tres primeros da acceso a la fiesta de cumpleaños de Lysarra en los Archivos, donde pueden birlar la insignia de Kwylliam y bajar al nivel inferior; el suceso «Cierre de los Archivos» mide el riesgo de que salte la alarma. Con la caja, huyen de la capitana Eliane Vorn y los alguaciles en la plaza Beldre y narran su plan de escape; en la caja hay una Llave del Fundador y la Máscara de Cuervo, primera pieza del Mapa Dorado. Los PJ suben al nivel 4 al entregar la caja a Wilko.',
  background: 'Tres siglos después de la caída del lord Legislador, Scadrial ya no es un mundo de ceniza y brumas sino un prodigio industrial movido por motores y pólvora. Con la nueva era cambia el reparto: un grupo nuevo de héroes y una nueva amenaza Dorada, el Trío Dorado, mientras el legado sangriento de Vadilek resuena a través del tiempo. Los jugadores crean sus PJ de la Era 2 siguiendo «Creación de personajes» de la introducción; empiezan en el nivel 3. Pese a los cambios sociales, tecnológicos y económicos, los excesos de la nobleza siguen ahí, y el grupo recupera parte de esos privilegios con un robo muy público entre chirridos de neumáticos.\n\nESTRUCTURA: los PJ se ven de lleno en una carrera ilegal de coches que celebra el cumpleaños de Lysarra Tekiel; Bayron Conrad es el anfitrión y Kwylliam Elariel el favorito. Los tres forman el Trío Dorado, los principales antagonistas de la Era 2. En plena carrera, una analepsis lleva a los PJ al día anterior, cuando se reúnen con su colaboradora Azmine Wilko: Kwylliam ha sobornado a los Archivos Nacionales para desviar una caja de artefactos destinada a ella, y Wilko recluta al grupo para robarla antes. La primera fase del robo es la carrera: los tres primeros consiguen entrada a la fiesta de después, en los Archivos. Allí intentarán quitarle a Kwylliam una insignia de los Archivos, bajarán al nivel inferior a por la caja (un suceso negativo decide si logran eludir a la seguridad o si se activa el protocolo de cierre) y descubrirán que la caja está en una cámara con potentes alarmas. Después huyen con los guardias pisándoles los talones hasta una batalla contra Eliane Vorn, capitana de seguridad nacidoble; lo logrado en el robo decide cuánto deben resistir frente a los alguaciles. Una última analepsis deja que los jugadores narren su plan de huida, y el capítulo cierra con la entrega de la caja a Wilko: dentro hay una Llave del Fundador y una máscara de baile, la primera pieza del Mapa Dorado, que más adelante resultará ser el mapa que NeBaal trazó en el capítulo 4.\n\nLOS SECRETOS DE WILKO: sin que los PJ lo sepan, Wilko es una recién iniciada de los Guardianes, una sociedad secreta que abarca las dos eras y protege el Clavo de la Eternidad (apéndice F). Sabe poco más que los PJ y miente fatal: al encargarse de la máscara y la llave ya revela más de lo que debería. Si la presionan en este capítulo, acaba confesando que la máscara y la llave tienen que ver con el Mapa Dorado, que cree parte de una antigua búsqueda del tesoro secreta, y que hay que mantenerlas lejos de gente como Kwylliam. Se niega en redondo a mencionar a los Guardianes o a admitir que pertenece a una organización secreta (al menos durante el capítulo 5), aunque le cueste visiblemente.',
  prepChecklist: [
    'Antes de empezar, los jugadores crean sus PJ de la Era 2 (nivel 3) según «Creación de personajes» de la introducción.',
    'Ten a mano la ayuda de juego «Mapa del robo en los Archivos Nacionales» (apéndice D; también aparece en el capítulo, L.104 / PDF 107), para entregarla a los jugadores en la analepsis.',
    'Prepara el «Registro de posición en la carrera» (L.96 / PDF 99) y los «Coches de carreras» (L.97 / PDF 100): se pueden imprimir y recortar los coches o usar nueve fichas. La ruta de la carrera aparece ilustrada en L.99 / PDF 102.',
    'Repasa en «Personajes principales» de la introducción al Trío Dorado (Bayron, Kwylliam y Lysarra) y a la profesora Wilko: los cuatro tienen escenas en el capítulo.',
    'Ten a mano las fichas del apéndice A de la capitana Eliane Vorn, el alguacil, el agitador (el encargado del puesto de control de G2), el vigilante de la ley y el consejero (Wynn).',
    'Lee el suceso negativo «Cierre de los Archivos» (cuatro casillas) y «Sucesos» en el capítulo 9 del Manual de Nacidos de la bruma; presenta el suceso a los jugadores antes de empezar «Burocracia y peligro».',
    'Revisa qué legados de la Era 2 tiene el grupo: hay momentos de legado para el Vigilante de la ley, el Explorador, el Emprendedor, el Narrador, el Novato y el Heredero.',
    'Los objetos de la caja 38.4B (Llave del Fundador y Máscara de Cuervo) y la insignia de los Archivos Nacionales se detallan en el apéndice B.',
    'Si el grupo estudia las notas sobre hemalurgia de la Era 1, consulta «Cómo tratar la hemalurgia» en la introducción.',
  ],
  progressionItems: [
    { type: 'key', text: 'Los PJ de la Era 2 empiezan el capítulo en el nivel 3 y suben al nivel 4 al llegar al despacho de Wilko tras el robo («El viaje continúa»).' },
    { type: 'key', text: 'Hallazgo del capítulo: la caja 38.4B contiene una Llave del Fundador y una Máscara de Cuervo (apéndice B). La máscara es la primera pieza del Mapa Dorado y la llave abre la urna plateada de NeBaal (capítulo 6); el Mapa Dorado es el que NeBaal trazó en el capítulo 4.' },
    { type: 'info', text: 'Meta «Aprender sobre hemalurgia»: los PJ pueden emprenderla tras encontrar las notas de hemalurgia del grupo de la Era 1 en la caja 38.4B, y avanzar (o completarla) durante el reposo del capítulo 6.' },
    { type: 'info', text: 'La insignia de los Archivos Nacionales de Kwylliam (apéndice B) abre todas las puertas del nivel inferior y es lo único que evita que salte la alarma de la Cámara 1616.' },
    { type: 'info', text: 'Momento de legado del Explorador: Wynn le entrega notas cifradas del Cronista; cinco días de reposo descifran una sección (hasta 3 veces) y cada una da una nueva pericia cultural de la Era 1.' },
    { type: 'info', text: 'Momento de legado del Heredero: puede abrir la cámara 1599 y quedarse una reliquia familiar creada con su jugador, de hasta 250 arquillas de valor en la Era 2.' },
    { type: 'info', text: 'Momento de legado del Narrador: si impresiona a Lysarra, ella le ofrece 100 arquillas por adelantado y otras 100 al terminar un encargo sobre la Guerrera Ascendente.' },
    { type: 'info', text: 'Momento de legado del Emprendedor: Bayron lo reta a vender el equivalente a 10 000 arquillas de su próximo invento; desde entonces lo considera un rival personal.' },
    { type: 'info', text: 'Botín posible de las cajas: un cuadro de Anastas Elariel (200 arquillas), un vestido de gala (50) y un juego de peines de marfil (100). Wilko paga 300 arquillas a los PJ al final.' },
  ],

  scenes: [
    // ── Calentad motores ──
    {
      id: 'legado-5-linea-de-salida',
      title: 'Línea de salida',
      section: 'Calentad motores',
      type: 'narrative',
      readAloud: 'Es una noche fresca de primavera en Elendel. El aire huele a aceite, gasolina y nervios, y un reloj de torre da las once entre el estruendo de los motores. A vuestra derecha, tumbado en su coche negro y reluciente, Kwylliam Elariel estudia a los rivales con gafas de espejo y una sonrisa despreocupada; en su solapa destella algo dorado que os importa mucho. La cuenta atrás empieza y vuestro motor ruge impaciente: tres, dos, uno… (L.93 / PDF 96)',
      content: [
        'La aventura arranca en plena acción: los PJ ya están a bordo de su coche, junto a otros ocho pilotos, esperando el disparo de salida. Las carreras por las calles de Elendel son ilegales, pero esta noche Bayron ha sobornado a los alguaciles.',
        'PREPARAR LA MESA: pide a los jugadores que decidan quién conduce y dónde va cada uno. Durante la carrera, quien conduce hace pruebas para maniobrar el coche y los pasajeros hacen acciones para respaldarlo: guiar al piloto, disparar a los neumáticos ajenos, estorbar a los rivales con capacidades de nacidos del metal o incluso soltar un insulto en el momento justo.',
        'CONDUCCIÓN: cada ronda, quien conduce debe aportar una prueba que tenga que ver directamente con conducir. Al empezar la ronda, pregunta si quieren cambiar de conductor. Si lo hacen, el conductor gasta 1 punto de concentración y cambia de sitio con otro PJ, y las pruebas del nuevo conductor en esa ronda suben la apuesta. Si el coche se queda sin conductor, los PJ sufren desventaja en las pruebas de esa ronda.',
      ],
    },
    {
      id: 'legado-5-a-fondo',
      title: '¡A fondo!',
      section: 'Calentad motores',
      type: 'exploration',
      content: [
        'Esta escena es la primera mitad de la carrera y se dirige como un empeño. El grupo se topa con tres rivales, en este orden: Bayron Conrad (él), Lysarra Tekiel (ella) y Kwylliam Elariel (él). Cada rival es un obstáculo que los PJ deben superar con dos pruebas con éxito para conservar su posición. Con un fallo, describe cómo el rival deja al grupo mordiendo el polvo y pasa al siguiente.',
        'RESOLUCIÓN: ver el final de «El encendido de Kwylliam». Los tres obstáculos tienen su propia escena: «El asalto de Bayron», «El cruce de Lysarra» y «El encendido de Kwylliam».',
        'CONEXIÓN EN EL TIEMPO: en la analepsis «¿Cómo hemos llegado hasta aquí?», Wilko recluta al grupo para hacerse con una caja de artefactos. Ella no lo sabe, pero la caja guarda la primera pieza del Mapa Dorado (la máscara de Cadme del capítulo 2) y una llave para la cerradura de la urna plateada de NeBaal (capítulo 6). Más adelante se revela que el Mapa Dorado es el que NeBaal trazó en el capítulo 4.',
      ],
      tables: [TABLA_A_FONDO],
      branches: [
        { label: '2 éxitos ante el rival', description: 'El grupo conserva su posición y pasa al siguiente obstáculo (Bayron, luego Lysarra, luego Kwylliam).' },
        { label: '1 fallo ante el rival', description: 'El rival deja atrás al grupo; se anota el fallo y se pasa al siguiente obstáculo. Los fallos acumulados fijan la posición inicial de la segunda mitad.' },
      ],
    },
    {
      id: 'legado-5-asalto-bayron',
      title: 'El asalto de Bayron',
      section: 'Calentad motores',
      type: 'exploration',
      readAloud: 'Suena el disparo y el humo y los chirridos llenan el aire. A vuestra izquierda sale disparado Bayron Conrad, el industrial que organiza la carrera, en un automóvil blindado de acero con el casco remachado y pintado de verde oscuro. Su voz crepita por un altavoz del capó: se burla de vuestro modelo, que según él tiene un fallo de diseño vergonzoso, y os desea que hayáis reforzado los ejes. Su mole vira de pronto hacia vosotros mientras él grita que la audacia forja el mañana. (L.94 / PDF 97)',
      content: [
        'El grupo debe esquivar o aguantar el asalto de Bayron. Puede gritar indicaciones al conductor para ganarle en maniobrabilidad (prueba de Liderazgo CD 12), agarrarse para el impacto (prueba de Atletismo CD 14) o localizar giros demasiado cerrados para el enorme vehículo de Bayron (prueba de Deducción CD 15).',
        'AVANCE: este obstáculo se cierra con 2 éxitos o con 1 fallo; después sigue «El cruce de Lysarra».',
      ],
      tables: [TABLA_A_FONDO],
    },
    {
      id: 'legado-5-cruce-lysarra',
      title: 'El cruce de Lysarra',
      section: 'Calentad motores',
      type: 'exploration',
      readAloud: 'El elegante coche plateado de Lysarra Tekiel se abre paso hacia la cabeza. La carrera es en su honor y maniobra con precisión astuta; además de filántropa, ingeniosa y ambiciosa, es temible al volante. La calle se estrecha entre edificios altos y un paso a nivel cruza la recta mientras el estruendo de un tren se vuelve ensordecedor. En el último segundo Lysarra acelera a fondo y las barreras, con el sello de los Tekiel, bajan justo detrás de ella y justo delante de vosotros. (L.94 / PDF 97)',
      content: [
        'La maniobra de Lysarra deja al grupo atrapado en el lado equivocado de las vías. Los PJ pueden buscar rutas alternativas (prueba de Supervivencia CD 14), acelerar antes de que las barreras terminen de bajar (prueba de Agilidad CD 16) o distraer a Lysarra con una burla sobre el declive del negocio de los Tekiel (prueba de Saber CD 16), lo que permitiría adelantarla.',
        'AVANCE: este obstáculo se cierra con 2 éxitos o con 1 fallo; después sigue «El encendido de Kwylliam».',
      ],
      tables: [TABLA_A_FONDO],
    },
    {
      id: 'legado-5-encendido-kwylliam',
      title: 'El encendido de Kwylliam',
      section: 'Calentad motores',
      type: 'exploration',
      readAloud: 'Kwylliam Elariel no compite, hace un espectáculo: va en cabeza a un ritmo tan pausado que parece haber ganado ya y esperar a que los demás lo noten. En una intersección abarrotada mira por encima del hombro mientras bebe sin prisa de una petaca plateada, y al instante estalla el caos: espectadores y transeúntes invaden la calle entre gritos y empujones, presas del encendido alomántico de Kwylliam. (L.95 / PDF 98)',
      content: [
        'Para abrirse paso entre la multitud en pánico, los PJ pueden contraatacar con su propia alomancia emocional (el libro no da CD), intuir el movimiento de la gente para hallar un camino seguro (prueba de Perspicacia CD 15) u ordenar a la masa que se aparte con un grito atronador (prueba de Liderazgo CD 16).',
        'AVANCE: este último obstáculo también se cierra con 2 éxitos o con 1 fallo, y entonces se resuelve el empeño entero.',
        'RESOLUCIÓN DEL EMPEÑO: aquí no se busca un éxito o un fracaso global. Cuenta los fallos que han sumado los PJ en los tres obstáculos (de 0 a 3): esa cifra decide dónde sale el grupo en la segunda mitad de la carrera (ver «Posiciones iniciales»).',
      ],
      tables: [TABLA_A_FONDO],
    },
    {
      id: 'legado-5-saludo-burlon',
      title: 'Un saludo burlón',
      section: 'Calentad motores',
      type: 'narrative',
      readAloud: 'La calle se despeja lo justo para ver el morro negro y brillante del coche de Kwylliam trazando un derrape perfecto alrededor de una fuente. Con una sola mano al volante, él se asoma por la ventanilla y os lanza un saludo burlón. Mientras los coches aceleran, os invaden los recuerdos y volvéis atrás, a antes de la carrera y del plan: al despacho de la profesora Azmine Wilko, sala 141 del departamento de Historia de la Universidad de Elendel. (L.95 / PDF 98)',
      content: [
        'Cierra el empeño de ¡A fondo! con esta transición a la analepsis. La carrera se retoma en «Caos automovilístico».',
      ],
    },

    // ── ¿Cómo hemos llegado hasta aquí? ──
    {
      id: 'legado-5-como-hemos-llegado',
      title: '¿Cómo hemos llegado hasta aquí?',
      section: '¿Cómo hemos llegado hasta aquí?',
      type: 'social',
      readAloud: 'El sol baña el escritorio de la profesora Wilko, cubierto de mapas y manifiestos. Con su traje de tweed, ella hojea con el ceño fruncido una carpeta con el sello de la casa Elariel. Cuenta que la caja ya debería estar aquí, pero Kwylliam ha «donado» una cifra absurda a la Junta Directiva de los Archivos; su contacto, Wynn, le ha dicho que la han «redirigido» y que en dos días saldrá con un cargamento hacia la hacienda de los Elariel. Hay que frenar a Kwylliam y hacerlo ya. Os mira fijamente, a sus colegas y amigos, y os pide ayuda: sabe que se os da de maravilla «liberar» artefactos del Imperio Final y esta caja necesita que la liberen. (L.95 / PDF 98)',
      content: [
        'ESCENA: analepsis en el despacho de la profesora Azmine Wilko (ella) el día antes de la carrera. Para interpretarla, consulta «Personajes principales» en la introducción del libro.',
        'DESCRIPCIÓN DE LOS PJ: tras el primer texto, pide a cada jugador que describa el aspecto de su personaje y por qué destaca en el grupo.',
        'EL ENCARGO: Wilko explica que van a robar de los Archivos Nacionales la caja número 38.4B, que se le confió a ella, y que hay que ponerla a salvo antes de que Kwylliam la desvíe y se quede con ella. Les da un mapa dibujado a mano.',
        'EL MAPA: el croquis de los niveles inferiores de los Archivos está hecho de memoria. Entrega a los jugadores la ayuda de juego «Mapa del robo en los Archivos Nacionales» (apéndice D). Wilko explica que es el nivel inferior, que la caja se ha trasladado a la sala de traslados de la hacienda, que primero habrá que entrar en los Archivos y que después hace falta una insignia para abrir las puertas del nivel inferior, algo que en circunstancias normales sería muy difícil.',
        'LA CARRERA COMO LLAVE: Wilko sonríe con complicidad y señala que mañana hay una carrera callejera ilegal de coches. Quien quede al menos tercero consigue invitación a la fiesta posterior en los Archivos y la ocasión de robar la insignia de Kwylliam. El libro presenta estos tres pasos como textos para leer en voz alta, después de que los jugadores describan a sus PJ (L.95 / PDF 98).',
        'PREGUNTAS DE LOS PJ: Wilko invita a preguntar. Respuestas del libro: ver las ramas de esta escena. Cuando terminen, cierra la charla con «¿Cuál es el plan?» y pasa a «Sentar las bases».',
      ],
      tips: [
        'Si los PJ presionan a Wilko sobre el contenido de la caja, recuerda «Los secretos de Wilko» (introducción del capítulo): miente fatal, pero no mencionará a los Guardianes.',
      ],
      branches: [
        { label: '¿Qué hay en la caja?', description: 'Wilko no está del todo segura del contenido completo y duda, claramente confundida. Sí sabe que hay dos objetos vitales, una máscara y una llave, y espera investigarlos cuando recuperen la caja. Si insisten, ver «Los secretos de Wilko».' },
        { label: '¿Cómo conseguimos entrar?', description: 'La insignia de un miembro de la junta abre las puertas cerradas de los Archivos y evita que salten las alarmas. La más a mano es la que Kwylliam lleva en la solapa; con ella se llega a la sala de traslados de la hacienda, en el nivel inferior.' },
        { label: '¿Cómo funciona la carrera?', description: 'Solo los tres primeros reciben invitación a la fiesta posterior en los Archivos. Se fomenta la competición, pero la violencia letal es inaceptable. Wilko paga la inscripción; el coche lo ponen los PJ.' },
        { label: '¿Qué más deberíamos saber?', description: 'Kwylliam nunca está solo: él, Bayron Conrad y Lysarra Tekiel son un trío inseparable. Wilko los conoció en la universidad y asegura que quien se mete con uno se las ve con los tres.' },
      ],
    },
    {
      id: 'legado-5-sentar-las-bases',
      title: 'Sentar las bases',
      section: '¿Cómo hemos llegado hasta aquí?',
      type: 'exploration',
      content: [
        'Pide a cada PJ que describa cómo ha contribuido al plan y haz que haga una prueba de habilidad pertinente. Contribuciones posibles: conseguir un vehículo, explorar la ruta, vigilar al objetivo o preparar una sorpresa (ver las ramas de esta escena).',
        'BENEFICIOS: por cada éxito, propón un beneficio que el PJ pueda aplicar una sola vez durante «Caos automovilístico». Ejemplos del libro: Modificación del vehículo (si el PJ explica cómo ayuda lo que ha cambiado en el coche, un fallo cuenta como éxito); Conocimientos previos (usar lo averiguado sobre la ruta para ignorar una Complicación); Una ayudita (un contacto interfiere en la carrera y un rival no puede realizar una de sus acciones); Entrenamiento del piloto (tras subir 1 posición, hacer una prueba adicional con otra habilidad para intentar adelantar de nuevo al instante).',
      ],
      branches: [
        { label: 'Conseguir un vehículo', description: 'Obtener un coche por los medios que sea: prueba de Hurto CD 14.' },
        { label: 'Explorar la ruta', description: 'Estudiar el recorrido en busca de atajos y peligros: prueba de Deducción CD 13 o Supervivencia CD 14.' },
        { label: 'Vigilar al objetivo', description: 'Estudiar los hábitos de Kwylliam o espiar a Bayron o a Lysarra: prueba de Perspicacia CD 15 o Sigilo CD 16.' },
        { label: 'Preparar una sorpresa', description: 'Modificar el coche con un artilugio de un solo uso: prueba de Manufactura CD 14.' },
      ],
    },

    // ── Caos automovilístico ──
    {
      id: 'legado-5-posiciones-iniciales',
      title: 'Posiciones iniciales',
      section: 'Caos automovilístico',
      type: 'exploration',
      readAloud: 'El recuerdo soleado se desvanece y vuelven el rugido de los motores y el olor a goma quemada. Muy por delante, Kwylliam aumenta su ventaja hasta quedar fuera de alcance, pero tenéis problemas más cercanos: pegado a vuestra izquierda se lanza el blindado de doble anchura de Bayron, y más allá, a la derecha, el bólido plateado de Lysarra maniobra con una precisión implacable. (L.97 / PDF 100)',
      content: [
        'La segunda mitad de la carrera: los PJ compiten por un puesto entre los tres primeros mientras Bayron y Lysarra intentan sacarlos de la pista y Kwylliam, arrogante, va tranquilo en cabeza. Se dirige como un empeño especial (ver «Cómo dirigir la carrera»).',
        'REGISTRO: prepara el «Registro de posición en la carrera» y los «Coches de carreras» (o 9 fichas) y sigue la posición relativa de los corredores desde el 9.º (último) hasta el 1.º (en cabeza). Cuando un piloto adelanta a otro y sube una posición, el que ocupaba ese lugar baja un puesto y se intercambian.',
        'POSICIÓN INICIAL: la del grupo depende de los fallos acumulados en ¡A fondo! (tabla). Bayron sale en la 4.ª posición, Lysarra en la 2.ª y Kwylliam en la 1.ª; rellena el resto de puestos con pilotos PNJ.',
        'REGLA ESPECIAL, OTROS PILOTOS: además del Trío Dorado y el grupo, otros cinco pilotos completan el registro. No tienen turnos propios: suben y bajan en el registro según lo que le pase al vehículo de los PJ.',
      ],
      tables: [TABLA_POSICIONES],
    },
    {
      id: 'legado-5-acciones-de-rival',
      title: 'Acciones de rival',
      section: 'Caos automovilístico',
      type: 'exploration',
      content: [
        'ACCIONES DE RIVAL: Bayron Conrad y Lysarra Tekiel eligen una acción de su repertorio (tablas de esta escena) en el arranque de cada ronda.',
        'DESVIAR EL EFECTO: si una acción de rival obliga al grupo a retroceder 1 posición, quien conduce puede gastar 2 puntos de concentración para desviar el efecto al piloto PNJ más cercano, que sale de la carrera. Esto no gasta la contribución del PJ de esa ronda.',
        'LOS RIVALES TAMBIÉN DESVÍAN: Bayron y Lysarra pueden gastar 2 puntos de concentración cuando una acción de un PJ los afecte: anulan el efecto y sale de la carrera, en su lugar, el piloto PNJ más cercano.',
      ],
      tables: [TABLA_ACCIONES_BAYRON, TABLA_ACCIONES_LYSARRA],
    },
    {
      id: 'legado-5-dirigir-la-carrera',
      title: 'Cómo dirigir la carrera',
      section: 'Caos automovilístico',
      type: 'exploration',
      content: [
        'DURACIÓN: la carrera dura tres rondas. Cada ronda, Bayron y Lysarra hacen una nueva acción de rival (el libro no aclara si puede repetirse una ya usada) y después cada PJ hace una contribución para mejorar la posición del grupo.',
        'POSICIONES: cada éxito sube al grupo 1 posición (si no está ya primero) y cada fallo lo hace retroceder 1. Al final de la tercera ronda, pasa a «Cruzando la meta».',
        'OBSTÁCULOS: la tabla lista los que podrían aparecer. Recuerda la regla de conducción de «Línea de salida»: quien conduce aporta cada ronda una prueba de conducción.',
      ],
      tables: [TABLA_OBSTACULOS_CARRERA, TABLA_CARRERA_OC],
    },
    {
      id: 'legado-5-cruzando-la-meta',
      title: 'Cruzando la meta',
      section: 'Caos automovilístico',
      type: 'choice',
      content: [
        'Tras tres rondas termina la carrera. El desenlace depende de la posición del grupo en el registro.',
        'VICTORIA (1.º al 3.º): Kwylliam sonríe e invita a los PJ a la fiesta posterior: da por hecho que se verán allí, les dice que son gente divertida y bromea con que los Archivos no aguantarán la noche si las reliquias corren la misma suerte que el asfalto. Pasa a «Robo en la alta sociedad».',
        'DERROTA (4.º al 9.º): sin invitación, el grupo debe buscar otra forma de entrar en los Archivos Nacionales. Pasa a «Infiltración sin invitación».',
      ],
      branches: [
        { label: 'Del 1.º al 3.º puesto', description: 'Victoria: invitación a la fiesta de los Archivos. Siguiente: «Robo en la alta sociedad».' },
        { label: 'Del 4.º al 9.º puesto', description: 'Derrota: sin invitación. Siguiente: «Infiltración sin invitación».' },
      ],
    },
    {
      id: 'legado-5-infiltracion-sin-invitacion',
      title: 'Infiltración sin invitación',
      section: 'Caos automovilístico',
      type: 'choice',
      content: [
        'Sin invitación, los PJ tienen que ingeniárselas para colarse en la fiesta, lo que además complica el robo de la medalla (la insignia). Pueden intentar lo siguiente.',
        'PUERTAS PRINCIPALES: por la vigilancia, cruzarlas es imposible sin superar una difícil prueba de Sigilo CD 22. Si fallan, los guardias los escoltan al exterior de inmediato.',
        'ENTRADA DEL PERSONAL: se puede entrar por una puerta lateral con una prueba de Sigilo o Engaño CD 18, pero los PJ deben disfrazarse de camareros para cruzar la zona de servicio, llena de gente, y llegar a la galería principal. Mientras vistan como el servicio, todas las pruebas sociales de «Robo en la alta sociedad» sufren desventaja, salvo que encuentren ocasión de ponerse ropa de gala. El libro no dice qué pasa si fallan esta prueba.',
        'PLAN DE CONTINGENCIA DE WILKO: si todo lo demás falla, les ayuda une archivere con túnica verde: Wynn Letrelle (consejere, elle), contacto de la profesora Wilko. Wynn acaba consiguiendo que entren, pero al llegar tarde el grupo atrae la atención no deseada de la capitana de seguridad de los Archivos (ver «Intercepción: capitana de seguridad Vorn»).',
        'Una vez dentro, pasa a «Robo en la alta sociedad».',
      ],
      tips: [
        'Entrar sin ganar la carrera hace avanzar el suceso «Cierre de los Archivos» (ver «Suceso: Cierre de los Archivos»).',
      ],
      branches: [
        { label: 'Puertas principales', description: 'Prueba de Sigilo CD 22; si falla, los guardias los escoltan fuera al momento.' },
        { label: 'Entrada del personal', description: 'Prueba de Sigilo o Engaño CD 18 y disfraz de camareros; desventaja en las pruebas sociales del robo salvo que se cambien a ropa de gala.' },
        { label: 'Wynn Letrelle', description: 'Si todo falla, Wynn los hace entrar, pero llegan tarde y se activa «Intercepción: capitana de seguridad Vorn».' },
      ],
    },
    {
      id: 'legado-5-intercepcion-vorn',
      title: 'Intercepción: capitana de seguridad Vorn',
      section: 'Caos automovilístico',
      type: 'social',
      content: [
        'La capitana Eliane Vorn (ella) manda la imponente fuerza de seguridad de los Archivos. Viste un guardapolvo gris pizarra, con aire de autoridad y amenaza contenida, y no se separa de la sombra de Lysarra.',
        'CUÁNDO OCURRE: si los PJ entraron con ayuda de Wynn (en «Infiltración sin invitación») o si fallan una prueba mientras actúan de forma sospechosa, captan de inmediato la atención de Vorn, que se acerca a preguntarles quiénes son y qué hacen allí.',
        'CÓMO SALIR DEL PASO: basta con mencionar a Wynn, empleade legítime de los Archivos. Si no lo hacen, deben superar una prueba de Engaño CD 18. Con ganas de volver junto a Lysarra, Vorn los deja marchar con una advertencia en cualquier caso.',
        'SI NO QUEDA SATISFECHA: si Vorn no se queda conforme o los PJ mencionan a Wilko, ordena a sus guardias que no los pierdan de vista: los PJ sufren desventaja en las pruebas de Sigilo y Hurto en la zona de la galería (G1).',
        'MOMENTO DE LEGADO DEL VIGILANTE DE LA LEY: Vorn y el Vigilante de la ley se reconocen nada más verse. Pregunta a su jugador qué pasó entre ellos: si Vorn influyó en que el Vigilante perdiera la placa (y de qué modo) o si fue él quien la descubrió abusando de su puesto. En las escenas sociales, Vorn lo trata con desprecio.',
      ],
      tips: [
        'Que Vorn intercepte al grupo hace avanzar el suceso «Cierre de los Archivos».',
      ],
      branches: [
        { label: 'Mencionan a Wynn', description: 'Vorn queda satisfecha y los deja marchar con una advertencia.' },
        { label: 'No mencionan a Wynn', description: 'Prueba de Engaño CD 18 para salir del paso; Vorn los deja marchar con una advertencia de todos modos.' },
        { label: 'Vorn no queda satisfecha o mencionan a Wilko', description: 'Ordena vigilarlos: desventaja en Sigilo y Hurto en la galería (G1).' },
      ],
    },

    // ── Robo en la alta sociedad ──
    {
      id: 'legado-5-robo-alta-sociedad',
      title: 'Robo en la alta sociedad',
      section: 'Robo en la alta sociedad',
      type: 'narrative',
      readAloud: 'Altas columnas de piedra suben hasta el techo de los Archivos Nacionales y dan una resonancia de caverna a la música de un cuarteto de cuerda. La élite de Elendel saborea cócteles ante la exposición del momento, Relatos del asedio, abierta solo a los invitados al cumpleaños de Lysarra. Ella, radiante en pieles y seda verde, charla junto a una fila de bustos rodeada de jóvenes nobles. Cerca hay una fuente de chocolate de varios pisos atendida por una malwish. Bayron está solo, escribiendo en un cuaderno, mientras las risas de Kwylliam resuenan al sentarse sobre una de las piezas, con el disgusto de un archivero; en su solapa brilla la insignia dorada. (L.100 / PDF 103)',
      content: [
        'OBJETIVO: con el acceso asegurado, los PJ deben infiltrarse en los niveles inferiores de los Archivos, localizar la caja 38.4B y escapar. Robar la insignia de Kwylliam no es obligatorio, pero facilita mucho el golpe.',
        'MAPA 5.1: muestra la planta baja de los Archivos. Los PJ tienen tiempo de sobra para tratar con los invitados y las piezas de la galería (zona G1) antes de ponerse manos a la obra (ver «Rumbo al golpe»).',
        'LA FIESTA: es la ocasión de conocer al Trío Dorado y examinar las piezas de la exposición principal.',
      ],
    },
    {
      id: 'legado-5-g1-galeria',
      title: 'G1: Galería del pasado',
      section: 'Robo en la alta sociedad',
      type: 'exploration',
      content: [
        'ZONA: comunica con G2. Los nobles pasean entre reliquias de valor incalculable, con sus bebidas y sus cotilleos, junto a la fuente de chocolate. Las piezas de la exposición esperan a que los PJ las examinen, y Kwylliam, Lysarra y Bayron están disponibles para conversar (ver «Personajes principales» en la introducción para interpretarlos).',
        'EXPOSICIÓN «RELATOS DEL ASEDIO: TRAGEDIA Y TRIUNFO»: objetos y retratos de una época de esperanza, desgracia y agitación política, pocos años antes del Catacendro. Contiene: fragmentos de la Puerta de Acero, la última en caer en la Batalla de Luthadel; pines artesanales con una mano marcada, atribuidos a un movimiento obrero skaa; bustos desconchados de Shan Elariel, Delina Tekiel, Yestal Haught, Idren Seeris, Triss Urbain, Duvall Haught, Silia Buvidas y Caridus Buvidas; escritos y primeras propuestas de la Asamblea de Luthadel; una de las sillas de lord Cett; una vidriera reconstruida de cinco paneles con los dominios del Imperio Final, titulada «Vidriera de un noble de Fellise»; y un hacha de obsidiana con muescas, de dueño desconocido.',
        'SECCIÓN DE LAS «BANDAS» SKAA DE LUTHADEL: muestra equipo de metalurgia ilegal, ropa para hacerse pasar por nobles, documentos falsos y órdenes de arresto descoloridas, además de un boceto de los PJ de la Era 1 con el rostro de Enge rodeado varias veces con tinta oscura (es el boceto del despacho del Crisol Secreto del capítulo 1). Una placa bajo el dibujo, «Engeanthe Elariel y su banda», presenta a Enge como una noble convertida en contrabandista y héroe del pueblo. Si los PJ examinan el boceto, invita a los jugadores a contar qué saben sus personajes de estas figuras históricas según sus legados y vínculos.',
        'MOMENTO DE LEGADO DEL EXPLORADOR: durante la fiesta, le archivere Wynn Letrelle busca al Explorador. Le dice que conoce sus inquietudes académicas por la profesora Wilko y que hace poco vio algo interesante entre el material descartado de los Archivos; le entrega un paquete con notas cifradas del Cronista. El Explorador puede dedicar cinco días de reposo a descifrar una sección, hasta un máximo de 3 veces. Cada vez, pide al jugador del Cronista que describa el suceso de la Era 1 que se descodifica; después, el Explorador obtiene una nueva pericia cultural de la Era 1 a su elección.',
      ],
      tips: [
        'Mapa 5.1: G1 es la sala principal; G2 está al norte y la salida a Elendel, al sur.',
      ],
    },
    {
      id: 'legado-5-cotilleos-fuente',
      title: 'Cotilleos junto a la fuente',
      section: 'Robo en la alta sociedad',
      type: 'social',
      content: [
        'Trellis Draam (plebeya, ella) es la dueña malwish de la chocolatería Excursiones Exquisitas y atiende la fuente de chocolate mientras cotillea sin freno. Si los PJ fueron invitados, elogia su destreza al volante; si no, le intriga su atrevimiento.',
        'RUMORES: comenta los disturbios en los Áridos del Norte (capítulo 7), los avances de Industrias Conrad y la expansión de las nuevas líneas de tren de los Tekiel por todo Scadrial. Le extraña que Lysarra pueda pagar una fiesta tan fastuosa tras el reciente revés financiero de los Tekiel.',
        'CONFIDENCIA: con una prueba de Persuasión CD 12, Trellis le susurra a un PJ que entre Lysarra y la capitana de seguridad Vorn hay más relación de la que aparenta, y que Vorn podría estar ligada a la familia criminal Morgenthax.',
      ],
    },
    {
      id: 'legado-5-lysarra',
      title: 'Lysarra Tekiel',
      section: 'Robo en la alta sociedad',
      type: 'social',
      content: [
        'Lysarra brilla entre sus admiradores, muy elegante, y comenta un busto rotulado «Delina Tekiel». Charla con gusto de tres asuntos.',
        'LA CARRERA: acepta con elegancia las felicitaciones de cumpleaños y los elogios sinceros. Insiste en la importancia de la precisión y la concentración y las compara con el sistema ferroviario que se extiende por Elendel y los Áridos.',
        'CONEXIONES: si le preguntan por Bayron o por Kwylliam, mantiene la sonrisa pero su tono se tensa. Cuesta que revele mucho; menciona la veta ambiciosa de Bayron y la fascinación de Kwylliam por lo novedoso y escandaloso.',
        'SU LABOR: presenta su fundación benéfica, los Jóvenes Ascendentes, como un medio para financiar y educar a la siguiente hornada de líderes de Scadrial, y con mucha gracia solicita una aportación.',
        'MOMENTO DE LEGADO DEL NARRADOR: Lysarra llama al Narrador, se presenta y presenta a los Jóvenes Ascendentes, dice que ha oído hablar de él y que le vendría bien la opinión de un experto en narrativa. Le pregunta cuál es su pieza favorita de la galería (ver «G1: Galería del pasado») y qué lección podría sacar de ella un Joven Ascendente. Si lo impresiona con una prueba de Persuasión CD 12, Lysarra le ofrece 100 arquillas por adelantado para encargarle un relato, una representación pública o una obra conmemorativa sobre la Guerrera Ascendente, y otras 100 arquillas al terminar.',
      ],
    },
    {
      id: 'legado-5-bayron',
      title: 'Bayron Conrad',
      section: 'Robo en la alta sociedad',
      type: 'social',
      content: [
        'Bayron está solo bajo un cuadro de un inquisidor con halo dorado rodeado de cadáveres, todos con los brazos extendidos en súplica, con un diario de cuero en la mano. Si un PJ supera una prueba de Percepción CD 13, ve que dibuja una medalla antes de cerrar el diario de golpe: es la Medalla de la Unidad del capítulo 7. Lejos de su coche se muestra juvenil y algo torpe. Está dispuesto a hablar de tres temas.',
        'LA CARRERA: acepta con cautela los elogios por su actuación y se anima si sale el tema de su coche; se ilumina ante cualquier admiración por su ingeniería.',
        'CONEXIONES: muestra cariño y lealtad hacia Kwylliam y hacia Lysarra. Si lo presionan, podría admitir que le intimida la visión y el olfato social de Lysarra y que le frustra la poca capacidad de atención de Kwylliam.',
        'SU LABOR: habla de las novedades de su empresa, Industrias Conrad, en seguridad privada y comunicaciones, y deja caer que fabrica vehículos blindados y armas. Se presenta como alguien que solo intenta que las cosas funcionen mejor.',
        'MOMENTO DE LEGADO DEL EMPRENDEDOR: Bayron se acerca al Emprendedor, al que reconoce como colega innovador, y comenta con entusiasmo las maravillas de ingeniería de su coche y lo desafía a presentar su propia idea. Le propone otra «carrera»: quien primero venda el equivalente a 10 000 arquillas de su próximo gran invento gana, y el perdedor se integra en la empresa del ganador. Lo acepte o no el Emprendedor, a partir de ahora Bayron lo considera un rival personal.',
      ],
    },
    {
      id: 'legado-5-robar-insignia',
      title: 'Robar la insignia',
      section: 'Robo en la alta sociedad',
      type: 'social',
      content: [
        'PLAN: para sustraer la insignia de los Archivos Nacionales (apéndice B), el grupo puede intentar distraer a Kwylliam con una conversación (ver «Resolución de la conversación»).',
        'ACTITUD DE KWYLLIAM: si el grupo quedó tercero o mejor en la carrera, siente curiosidad por los recién llegados que han puesto en evidencia a sus amigos y acepta de buen grado la charla. Si no, se desconcierta al verlos en la fiesta y sospecha de inmediato; aunque quizá amenace sin mucho empeño con pedir a Vorn que los expulse, sigue conversando mientras los intrusos logren mantener su interés. Esa atención lo complica todo: todas las pruebas para distraerlo o quitarle la insignia sufren desventaja.',
        'RESISTIRSE A LA INFLUENCIA: Kwylliam tiene Defensa cognitiva 16, Defensa espiritual 19 y 6 puntos de concentración. Gasta concentración para resistirse a interacciones que le parecen aburridas o previsibles. Se divierte fácilmente con lo impactante, provocador o absurdo, y no se resiste a la influencia cuando los PJ provocan caos o desorden, porque ese entretenimiento le encanta.',
        'ENFOQUES DE LA CONVERSACIÓN, CORTEJAR AL CAOS: como magnate de los pasquines, a Kwylliam lo apasionan la intriga, la falta de decoro y la agitación, y tiene buen olfato para los cotilleos. Un relato escandaloso o un rumor explosivo lo conquistan; si la historia es sosa o evidentemente falsa, dice que se aburre y pierde el interés.',
        'ENFOQUES DE LA CONVERSACIÓN, RIESGO Y RECOMPENSA: le encantan las maniobras arriesgadas, sobre todo si impactan y dan juego en la prensa. Si los PJ hacen una proeza temeraria o proponen un juego peligroso, acepta de inmediato. Buen momento para subir la apuesta.',
        'ENFOQUES DE LA CONVERSACIÓN, CONEXIONES: si le preguntan por sus amigos, solo da su opinión después de que los PJ le cuenten algún trapo sucio o logren impresionarlo. Entonces dice que Lysarra es audaz (hace pocos años su familia estaba arruinada y era el hazmerreír) y que Bayron es demasiado listo para su bien, y que le gusta sacarlo de quicio.',
        'CUIDADO CON LO QUE CUENTAN: presta mucha atención a lo que los PJ le digan. Cualquier dato incriminatorio podría reaparecer publicado en un pasquín en el capítulo 6.',
        'REGLA ESPECIAL, INTENTO DE ROBO: durante la conversación, un PJ puede usar su contribución para intentar robar la insignia con una prueba de Hurto CD 15. Si Kwylliam está entretenido (o se ha quedado sin concentración para resistir), cada intento tiene ventaja y él no se da cuenta de los dos primeros fallos; cada vez que los PJ fallan, deben volver a entretenerlo. Si no está entretenido, cada intento sufre desventaja y él nota el primer fallo al instante. Superar la prueba roba la insignia sin que se entere; si nota un fallo, la conversación termina.',
        'RESOLUCIÓN DE LA CONVERSACIÓN: la charla acaba cuando un PJ roba la insignia o Kwylliam nota un intento fallido. Éxito: roban la insignia limpiamente. Fracaso: Kwylliam agarra la mano del ladrón y dice que aún no tienen tanta confianza; tras una risa burlona llama con total naturalidad a Vorn (ver «Intercepción: capitana de seguridad Vorn») y se va mientras Vorn acosa al grupo unos minutos. No se pueden hacer más intentos de robo. En ambos casos, los PJ pueden seguir explorando la fiesta o pasar a «Rumbo al golpe».',
        'MOMENTO DE LEGADO DEL NOVATO: Kwylliam se fija en el Novato, al que ve como un elemento imprevisible que podría reclutar o explotar. Pregunta al jugador qué maniobra audaz e inesperada hizo en el pasado para captar el interés de Kwylliam, quien a su vez le preguntará qué habría pensado de ese acto su célebre antepasado, el Veterano. Si responde a las preguntas incisivas, el Novato puede añadir una ventaja a la prueba de un aliado para robar la insignia; avisa a su jugador de que cada vez que lo haga tendrá que esforzarse más para entretener a Kwylliam.',
      ],
      tables: [TABLA_INSIGNIA_OC],
      branches: [
        { label: 'Kwylliam entretenido', description: 'Cada intento de robo tiene ventaja y no nota los dos primeros fallos; tras cada fallo hay que volver a entretenerlo.' },
        { label: 'Kwylliam no entretenido', description: 'Cada intento sufre desventaja y nota el primer fallo al instante.' },
        { label: 'Éxito en la prueba de Hurto CD 15', description: 'Roban la insignia sin que se dé cuenta.' },
        { label: 'Kwylliam nota un fallo', description: 'Llama a Vorn y se marcha; Vorn acosa al grupo unos minutos; no hay más intentos de robo.' },
      ],
    },
    {
      id: 'legado-5-rumbo-al-golpe',
      title: 'Rumbo al golpe',
      section: 'Robo en la alta sociedad',
      type: 'narrative',
      content: [
        'Una vez dentro, el grupo no necesita estrictamente la insignia de Kwylliam: podría escabullirse hacia el ala administrativa, al fondo de la galería, en cualquier momento (mapa 5.1). Pero haberla robado da grandes ventajas, porque es la única forma de evitar que salten las alarmas antes de que los PJ salgan con la caja (ver «L4: Cámara 1616»).',
        'Tengan o no la insignia, cuando quieran descender a los niveles inferiores, continúa en «G2: Puerta al núcleo central».',
      ],
    },
    {
      id: 'legado-5-g2-puerta',
      title: 'G2: Puerta al núcleo central',
      section: 'Robo en la alta sociedad',
      type: 'exploration',
      readAloud: 'En un puesto de control ante un arco de acero negro con un lema grabado sobre la memoria y el futuro, un encargado de uniforme gris impecable revisa la fila de empleados que bajan al nivel inferior. Una administrativa sudorosa duda, el encargado hace una seña y dos guardias se la llevan. Cuando sus ojos se posan en vosotros, una ansiedad extraña os recorre la mente. El ascensor a los niveles inferiores está justo tras el puesto. (L.104 / PDF 107)',
      content: [
        'ZONA: comunica con G1 y L1; es el acceso a los niveles inferiores.',
        'EL ENCARGADO: es un sutil encendedor (usa las características del agitador) que amplifica la ansiedad y la culpa para detectar intrusos. Los PJ pueden reconocer el efecto y dominar sus emociones con una prueba de Disciplina CD 13, o aparentar confianza con una prueba de Engaño CD 14. Enseñar la insignia de los Archivos Nacionales da ventaja en esta prueba.',
        'RESULTADO: quienes tienen éxito pasan inadvertidos. Si fallan, un guardia de seguridad (alguacil) da un paso al frente para interrogar a todo el grupo, aunque acaba dejándolos pasar tras una advertencia. Esa advertencia hace avanzar el suceso «Cierre de los Archivos».',
        'Tras el puesto de control, los PJ pueden bajar en ascensor al nivel inferior (L1).',
      ],
    },

    // ── Burocracia y peligro ──
    {
      id: 'legado-5-burocracia-peligro',
      title: 'Burocracia y peligro',
      section: 'Burocracia y peligro',
      type: 'narrative',
      content: [
        'Cuando estén listos para empezar el golpe, pide a los jugadores que consulten la ayuda de juego «Mapa del robo en los Archivos Nacionales» (aparece aquí y en el apéndice D). Muestra una parte del nivel inferior, con la sala de traslados de la hacienda marcada.',
        'Antes de continuar, presenta a los jugadores el suceso «Cierre de los Archivos».',
      ],
    },
    {
      id: 'legado-5-suceso-cierre',
      title: 'Suceso: Cierre de los Archivos',
      section: 'Burocracia y peligro',
      type: 'exploration',
      content: [
        'EL SUCESO: «Cierre de los Archivos» es un suceso negativo (reglas en «Sucesos», capítulo 9 del Manual de Nacidos de la bruma) de cuatro casillas, que reflejan cómo crecen las sospechas. Dura hasta que se dispara o hasta que el grupo sale de los Archivos; mientras tanto, sé generoso al subir la apuesta.',
        'CÓMO PROGRESA: avanza de inmediato el suceso en 1 por cada uno de estos puntos. (1) El grupo ha entrado en los Archivos sin ganar la carrera (el libro dice «ganar»; lo más coherente es leerlo como no haber quedado entre los tres primeros, pero no lo aclara). (2) El grupo ha fallado la conversación «Robar la insignia» con Kwylliam o se ha activado «Intercepción: capitana de seguridad Vorn». (3) El grupo ha recibido una advertencia de seguridad en el puesto de control de G2.',
        'COMPLICACIONES: si un PJ saca una Complicación durante el golpe, puedes usarla para adelantar el suceso 1 casilla; así cambias un problema inmediato por un posible cierre general.',
        'OTROS AVANCES EN EL NIVEL INFERIOR: fallar la prueba de Engaño CD 15 ante el guardia de una habitación al azar (+1), fallar la prueba de Engaño CD 12 para que un archivero abra una puerta (+1), irse con una caja señuelo (+1). Además, fallar al abrir la puerta de la Cámara 1616 activa el suceso de inmediato (ver cada sala).',
        'FIN DEL SUCESO: la salida del grupo marca el final del suceso (ver «Persecución intensa»).',
      ],
      tips: [
        'El suceso se anota con cuatro casillas (C) de «Cierre de los Archivos»; al rellenar la cuarta se activa («Activación del suceso»).',
      ],
    },
    {
      id: 'legado-5-activacion-suceso',
      title: 'Activación del suceso',
      section: 'Burocracia y peligro',
      type: 'combat',
      readAloud: 'Resuena la alarma con un tañido estridente y se oyen gritos cercanos: una voz anuncia una alerta de seguridad, ordena al personal no esencial que permanezca en su puesto y dice que los equipos de seguridad evalúan la situación. Las puertas del nivel inferior se bloquean y las alarmas retumban por todas las plantas de los Archivos. (L.105 / PDF 108)',
      content: [
        'Cuando se rellenan las cuatro casillas, los Archivos Nacionales entran de inmediato en alerta máxima.',
        'EFECTOS: cualquier prueba social ante un archivero fracasa sin tirar, y toda prueba de Sigilo se hace con desventaja.',
        'ENCUENTRO: cuatro guardias de los Archivos (con la ficha del alguacil), capitaneados por un vigilante de la ley, salen al paso del grupo e intentan detenerlo. Se retiran al caer a la mitad de su salud.',
      ],
    },
    {
      id: 'legado-5-nivel-inferior',
      title: 'Nivel inferior de los Archivos',
      section: 'Burocracia y peligro',
      type: 'exploration',
      content: [
        'El nivel inferior alberga un sinfín de salas y pasillos; el mapa 5.2 solo marca las estancias de interés. Si un PJ abre una habitación al azar, describe cajas polvorientas y archivadores llenos de papeles: nada útil ni valioso.',
        'LA TERCERA HABITACIÓN AL AZAR: la tercera vez que entren en una habitación cualquiera, un guardia de seguridad (alguacil) los descubre y les pregunta qué hacen. Con una prueba de Engaño CD 15, el guardia colabora y les da indicaciones si se las piden. Si fallan, informa del incidente y el suceso «Cierre de los Archivos» avanza en 1.',
      ],
    },
    {
      id: 'legado-5-abrir-puertas',
      title: 'Cómo abrir las puertas de los Archivos',
      section: 'Burocracia y peligro',
      type: 'exploration',
      content: [
        'CON LA INSIGNIA: la de Kwylliam sirve de llave maestra y abre cualquier puerta de los Archivos.',
        'SIN LA INSIGNIA: se puede forzar la cerradura (prueba de Hurto CD 12) o derribar la puerta (prueba de Atletismo CD 14). También se puede llamar la atención de un archivero y convencerlo de que abra (prueba de Engaño CD 12); si fallan, cruzan la puerta de forma sospechosa y el suceso «Cierre de los Archivos» avanza en 1.',
      ],
      branches: [
        { label: 'Insignia de Kwylliam', description: 'Abre todas las puertas.' },
        { label: 'Forzar o derribar', description: 'Hurto CD 12 para la cerradura; Atletismo CD 14 para echarla abajo.' },
        { label: 'Pedirlo a un archivero', description: 'Engaño CD 12; si falla, cruzan sospechosamente y el suceso avanza 1.' },
      ],
    },
    {
      id: 'legado-5-l1-plataforma',
      title: 'L1: Plataforma del ascensor',
      section: 'Burocracia y peligro',
      type: 'exploration',
      readAloud: 'El ascensor baja chirriando hacia las entrañas de los Archivos y se abre ante un pasillo largo y estrecho flanqueado de puertas cerradas. Por el techo corren tubos neumáticos como venas, que silban cuando pasan los botes de registros, y archiveros y guardias van de sala en sala con prisa. (L.105 / PDF 108)',
      content: [
        'ZONA: enlaza con G2 y L5. En el croquis del grupo aparece marcada la sala de traslados de la hacienda (L2), muy cerca de aquí.',
      ],
    },
    {
      id: 'legado-5-l2-traslados',
      title: 'L2: Sala de traslados de la hacienda',
      section: 'Burocracia y peligro',
      type: 'exploration',
      readAloud: 'Al fondo de la estrecha sala de traslados hay cinco cajas de madera, transportables pero demasiado grandes para esconderlas, con un portapapeles encima. Están bien etiquetadas, de la 38.4A a la 38.4E. El registro del portapapeles anota el lote 38.4, del donante lord Anton Elariel, y señala dudas: las cajas no cuadran con los documentos anteriores, los sellos de la hacienda están rotos y los pesos no coinciden. Debajo, alguien ha garabateado que no se puede procesar un cargamento con el registro mal, que se dejen las cajas ahí y que Registros, que guarda el libro de movimientos, lo arregle. (L.105 / PDF 108)',
      content: [
        'ZONA: comunica con L5. Se abre la puerta como indica «Cómo abrir las puertas de los Archivos».',
        'CAMBIO DE CARTAS: CAJAS DE SEÑUELO: si los PJ sospechan de las cajas o revisan las etiquetas, pide una prueba de Deducción CD 13 (con ventaja si también examinaron el portapapeles). Con éxito, notan que las etiquetas se han cambiado y que los sellos de los Elariel son falsos: son cajas señuelo.',
        'CONTENIDO DE LAS CAJAS: quien abra las cajas señuelo halla una nota sin firmar que agradece el pago por el servicio y por el silencio. Con una prueba de Manufactura CD 10, se identifica el papel como el que se usa para imprimir pasquines. Lo único de valor es un cuadro de Anastas Elariel luchando contra un león, de 200 arquillas; el resto es material de embalaje sin valor.',
        'DISTRACCIÓN CON SEÑUELOS: si los PJ salen con alguna caja señuelo, un archivero que pasa mira las cajas y comenta, aliviado, que ya sabía que estaban mal etiquetadas, y les pregunta si han consultado el error con Registros. Pide una prueba de Deducción a los PJ: quien saque más se da cuenta de que esas cajas son señuelos. El suceso «Cierre de los Archivos» avanza en 1 y el archivero les indica cómo llegar a la sala de registros. (L.105 / PDF 108)',
      ],
      tips: [
        'Descubrir que las cajas eran señuelos reduce en 1 ronda la resistencia de la «Batalla en la plaza Beldre».',
      ],
      branches: [
        { label: 'Deducción CD 13 superada', description: 'Se dan cuenta de que las etiquetas se cambiaron y los sellos de los Elariel son falsos: las cajas son señuelos.' },
        { label: 'Salen con una caja señuelo', description: 'Un archivero les habla del error; la prueba de Deducción más alta revela el señuelo, el suceso avanza 1 y los dirige a la sala de registros.' },
      ],
    },
    {
      id: 'legado-5-l3-registros',
      title: 'L3: Sala de registros',
      section: 'Burocracia y peligro',
      type: 'exploration',
      readAloud: 'La sala de registros es hexagonal y está repleta de archivadores y pequeños escritorios. En el centro, sobre una gran mesa, reposa el libro de movimientos, un volumen pesado que anota los traslados recientes. (L.107 / PDF 110)',
      content: [
        'ZONA: comunica con L5. Los tubos neumáticos del techo acaban en esta sala, al final de un pasillo que sale de los ascensores. La puerta reforzada lleva una placa de latón deslucida con el rótulo «Registros» (ver «Cómo abrir las puertas de los Archivos»).',
        'INFORMACIÓN: el libro anota que el lote doc. 38.4 se trasladaba a la hacienda Elariel y fue redirigido a la Cámara 1616, con la autorización de K. E., de la Junta Directiva.',
      ],
    },
    {
      id: 'legado-5-l4-camara-1616',
      title: 'L4: Cámara 1616',
      section: 'Burocracia y peligro',
      type: 'exploration',
      content: [
        'ZONA: comunica con L5. La pesada puerta es un último contratiempo: Wilko no previó que el cargamento se desviaría dos veces y no pudo avisar, así que la puerta tiene una alarma oculta.',
        'CÓMO ENTRAR, CON LA INSIGNIA DE KWYLLIAM: mientras la insertan y empiezan a abrir, pide a cada PJ una prueba de Percepción; quien saque más nota el mecanismo de alarma justo a tiempo. Un PJ puede desactivarlo superando una prueba de Hurto o Manufactura CD 18. Si falla, salta la alarma y se activa de inmediato el suceso «Cierre de los Archivos»; si tiene éxito, entran sin que suene, lo cual no es poca cosa.',
        'CÓMO ENTRAR, SIN LA INSIGNIA: burlar la seguridad de la cámara sin hacer ruido es imposible. Si un PJ intenta abrir con sigilo, pide una prueba de Hurto o Manufactura CD 18; si la supera, descubre una alarma que no se puede desactivar sin la insignia. Si falla, o si fuerzan la puerta (sin prueba), la cámara se abre pero el suceso se activa de inmediato.',
        'MOMENTO DE LEGADO DEL HEREDERO: en el libro de movimientos figura el apellido del Heredero, ligado a la cámara 1599, que es fácil de localizar; un archivero la abre cuando el Heredero acredita su identidad. Guarda un armario con trajes de gala de la Era 1 y una reliquia familiar singular. Pregunta al jugador del Noble qué objeto habría querido dejar en herencia y diseñadlo juntos, sin pasar de 250 arquillas de valor en la Era 2.',
        'DENTRO DE LA CÁMARA: cinco cajas de madera apiladas contra la pared del fondo, transportables pero demasiado voluminosas para esconderlas. Cada una tiene un gran candado metálico y el sello de los Elariel en cera roja. Abrir una exige una prueba de Atletismo o Hurto CD 14.',
        'CONTENIDO DE LAS CAJAS: reliquias. Una invitación de baile descolorida con los nombres de los personajes de la Era 1, otra firmada por lord Guiverre Seeris con afecto, un vestido de gala casi intacto (50 arquillas) y un juego de peines de marfil (100 arquillas). La caja 38.4B guarda dos objetos: una gran llave dorada con un ojo cuya pupila es una estrella (una Llave del Fundador) y una máscara que imita cuervos en pleno vuelo (la Máscara de Cuervo, apéndice B). Las cajas contienen también las notas sobre hemalurgia de los PJ de la Era 1, que los de la Era 2 pueden estudiar si quieren (ver «Cómo tratar la hemalurgia» en la introducción).',
        'EMPRENDER LA HUIDA: si el grupo saca la caja 38.4B o su contenido sin activar el suceso «Cierre de los Archivos», sale de los Archivos en el ascensor, desandando sus pasos, y pasa directo a «Persecución intensa». Si no, debe escapar con la caja mientras suenan las alarmas: pasa a «L5: Pasillo».',
      ],
      branches: [
        { label: 'Con la insignia, alarma desactivada', description: 'Percepción más alta avisa; Hurto o Manufactura CD 18 desactiva la alarma. Entran sin que suene.' },
        { label: 'Con la insignia, alarma no desactivada', description: 'Salta la alarma y se activa el suceso de inmediato.' },
        { label: 'Sin la insignia', description: 'Imposible hacerlo en silencio. Hurto o Manufactura CD 18 solo descubre la alarma; con un fallo o forzando la puerta, la cámara se abre y el suceso se activa.' },
        { label: 'Sin activar el suceso', description: 'Salen por el ascensor y pasan a «Persecución intensa».' },
        { label: 'Con el suceso activo', description: 'Escapan con la caja mientras suenan las alarmas: «L5: Pasillo» y «Carrera por el pasillo».' },
      ],
    },
    {
      id: 'legado-5-l5-pasillo',
      title: 'L5: Pasillo',
      section: 'Burocracia y peligro',
      type: 'exploration',
      content: [
        'ZONA: este corredor da acceso a L1, L2, L3 y L4. Si «Cierre de los Archivos» ya se ha disparado y los PJ escapan con la caja, continúa en «Carrera por el pasillo».',
      ],
    },
    {
      id: 'legado-5-carrera-pasillo',
      title: 'Carrera por el pasillo',
      section: 'Burocracia y peligro',
      type: 'exploration',
      content: [
        'EMPEÑO: dirige la huida como un empeño en el que los PJ deben superar tres obstáculos, cada uno con dos pruebas con éxito. Si fracasan, tendrán que abrirse paso luchando. Los guardias usan el conjunto de características del alguacil. Los peligros, en orden, son estos.',
        'SALIENDO DE L4, BRIGADA CON PORRAS: dos guardias persiguen a los PJ y otros seis se acercan de refuerzo. Los PJ pueden empujar un carro para cortarles el paso (prueba de Atletismo CD 13), meterse en un despacho para despistarlos (prueba de Sigilo CD 14) o dar una falsa alarma para confundirlos (prueba de Engaño CD 15).',
        'MITAD DEL PASILLO, FRENESÍ DE ARCHIVEROS: una marea de archiveros con gafas corre de un lado a otro presa del pánico y bloquea el pasillo. Los PJ pueden abrirse paso a empujones (prueba de Atletismo CD 14), gritarles que se aparten (prueba de Intimidación CD 15) o zigzaguear entre los eruditos asustados (prueba de Agilidad CD 15). Buen momento para subir la apuesta.',
        'CERCA DE L1, PUERTA DE SEGURIDAD: una puerta de seguridad baja y corta la huida. Los PJ pueden pasar rodando antes de que cierre (prueba de Agilidad CD 14), atascarla unos segundos (prueba de Manufactura CD 13) o lanzarse por el hueco a toda prisa (prueba de Atletismo CD 14).',
        'RESOLUCIÓN DEL EMPEÑO: tiene éxito si el grupo acumula 6 éxitos antes que 4 fallos. Éxito: llega al ascensor justo cuando la puerta de seguridad se bloquea a su espalda; continúa en «Huida en ascensor». Fracaso: se ve obligado a luchar y debe derrotar a dos guardias de seguridad (alguaciles) antes de pasar a «Huida en ascensor».',
      ],
      tables: [TABLA_PASILLO_OC],
      branches: [
        { label: 'Éxito (6 éxitos antes que 4 fallos)', description: 'Llegan al ascensor cuando la puerta se bloquea tras ellos. Siguiente: «Huida en ascensor».' },
        { label: 'Fracaso', description: 'Deben derrotar a dos alguaciles antes de pasar a «Huida en ascensor».' },
      ],
    },
    {
      id: 'legado-5-huida-ascensor',
      title: 'Huida en ascensor',
      section: 'Burocracia y peligro',
      type: 'narrative',
      readAloud: 'Mientras entráis en el ascensor, una figura de guardapolvo gris pizarra dobla la esquina tras vosotros con los ojos entornados. Alza una mano, el aire a su alrededor brilla de forma extraña y las puertas parecen frenarse un largo segundo tenso antes de terminar de cerrarse. Ordena a los guardias que corran a las escaleras traseras y, justo cuando se sellan las puertas, gruñe que podéis correr cuanto queráis porque os atrapará. El ascensor sube. (L.108 / PDF 111)',
      content: [
        'PRUEBA DE SABER: quien supere una prueba de Saber CD 10 comprende que el ascensor, con el grupo dentro, se salvó por muy poco de quedar encerrado en una burbuja de cadmio levantada por la capitana de seguridad Vorn. Continúa en «Persecución intensa».',
      ],
    },

    // ── Persecución intensa ──
    {
      id: 'legado-5-persecucion-intensa',
      title: 'Persecución intensa',
      section: 'Persecución intensa',
      type: 'narrative',
      readAloud: 'La noche primaveral de Elendel se hace pedazos con las alarmas que suenan a vuestra espalda y los silbatos agudos que suenan delante; los agentes de seguridad os pisan los talones y los alguaciles corren por las calles hacia vosotros. El cerco se cierra, y rápido. (L.108 / PDF 111)',
      content: [
        'FIN DEL SUCESO: la salida del grupo cierra el suceso «Cierre de los Archivos».',
        'SI NO SE ACTIVÓ EL SUCESO: lee un primer texto: la galería está en silencio cuando escapan y, ya a la vista de las puertas de salida, oyen gritos detrás avisando de que han entrado en las cámaras y hay que cerrar los Archivos. Las alarmas atruenan, la capitana de seguridad irrumpe en la galería, grita «¡Alto!» y alza una mano: el mundo se ralentiza en una burbuja a su alrededor, que se detiene a pocos centímetros de los PJ. Cruzan las puertas justo a tiempo. (L.108 / PDF 111)',
        'LA CALLE (siempre): el personal de seguridad de los Archivos sigue al grupo y los alguaciles llenan las calles y cierran casi todas las salidas. Solo queda libre la ruta hacia el noreste, que lleva a la plaza Beldre.',
      ],
    },
    {
      id: 'legado-5-batalla-plaza-beldre',
      title: 'Batalla en la plaza Beldre',
      section: 'Persecución intensa',
      type: 'combat',
      readAloud: 'Ante vosotros se abre la plaza Beldre, una gran explanada con estatuas agrietadas y una fuente seca. Los faroles alumbran a los alguaciles que llegan por el norte, el oeste y el sur y se parapetan tras las coberturas. El lado este acaba en una barandilla sobre una caída mortal hasta las vías del tren, y el aire vibra con el estruendo lejano de un tren que se acerca. (L.108 / PDF 111)',
      content: [
        'DURACIÓN: informa a los jugadores de que han preparado un plan de huida, pero deben resistir 4 rondas, menos 1 ronda por cada uno de estos puntos: no haber activado el suceso «Cierre de los Archivos» y haber descubierto que las cajas de la sala de traslados eran señuelos.',
        'ARRANQUE: Vorn llega a la plaza al comenzar el combate con un turno lento, y con ella vienen dos vigilantes de la ley a sus flancos. En el arranque de la segunda ronda, dos alguaciles se aproximan desde el norte o desde el sur (a elección de la DJ) y atacan de frente a los PJ.',
        'EFECTO DEL CAMPO DE BATALLA, ANDANADA DE LOS VIGILANTES DE LA LEY: los alguaciles rodean la plaza en número excesivo para combatirlos de frente y disparan ráfagas coordinadas desde sus coberturas. Al empezar cada ronda, cada PJ debe superar una prueba de Agilidad o sufre daño del fuego enemigo, según la tabla. Tanto la CD como el daño suben cada ronda.',
        'MOMENTO DE LEGADO DEL VIGILANTE DE LA LEY: si, una sola vez durante la pelea con Vorn, el Vigilante aprovecha lo que comparte con ella, Vorn queda en estado Sorprendido (por descuido o por el golpe de los recuerdos).',
        'Cuando los PJ sobrevivan las rondas necesarias, pasa a «Repercusiones» y «Este era el plan».',
      ],
      tables: [TABLA_ANDANADA, TABLA_PLAZA_OC],
    },
    {
      id: 'legado-5-repercusiones',
      title: 'Repercusiones',
      section: 'Persecución intensa',
      type: 'narrative',
      content: [
        'En cuanto los PJ sobreviven las rondas necesarias, pasa a «Este era el plan».',
      ],
    },
    {
      id: 'legado-5-este-era-el-plan',
      title: 'Este era el plan',
      section: 'Persecución intensa',
      type: 'choice',
      readAloud: 'El tren que retumba bajo vuestros pies cruza el canal rumbo al Primer Octante. El caos del tiroteo, los gritos, los silbatos de los alguaciles y el rugido del tren se difuminan hasta dejar solo la voz de la profesora Wilko: dice que es imposible salir limpios, que cuando todo se tuerza (y siempre se tuerce) acabaréis atrapados en esa plaza con alguaciles en cada esquina, y que, eligiendo bien el momento y dando un salto de fe, podríais caer sobre el tren. Solo queda una pregunta: qué les impedirá seguiros. (L.110 / PDF 113)',
      content: [
        'Haz que los jugadores cuenten su plan maestro de escape, aportando cada uno un detalle. Anímalos a sacar partido de sus capacidades y del escenario para crear un desenlace vistoso, de película.',
        'Con el plan armado, regresa a la plaza Beldre y cede a los jugadores la narración de cómo sale todo.',
      ],
    },
    {
      id: 'legado-5-entrega-caja',
      title: 'Entrega de la caja',
      section: 'Persecución intensa',
      type: 'narrative',
      readAloud: 'De vuelta en el despacho 141 de la Universidad de Elendel, Wilko os recibe agradecida: por Armonía, lo habéis conseguido, y justo ante las narices de Kwylliam y los demás; os habéis enfrentado al Trío y habéis vencido. Ahora toca ver qué historia pretendían ocultar. Examina la caja y saca una llave de oro ornamentada, con un ojo cuya pupila es una estrella, y una máscara de baile con cuervos en pleno vuelo, que deja a un lado. (L.110 / PDF 113)',
      content: [
        'Cuando se han sacudido a sus perseguidores, los PJ pueden volver junto a Wilko. Como ella y el grupo averiguarán en los capítulos 6 y 7, los dos objetos son una Llave del Fundador y la Máscara de Cuervo (ambas, en el apéndice B).',
        'RECOMPENSA: Wilko paga 300 arquillas al grupo y confiesa que le gustaría anotar un relato completo y sin nombres de sus hazañas en el «mentecobre», ese voluminoso diario suyo ordenado por colores, cuando hayan descansado. Contactará con ellos al terminar de estudiar lo que había en la caja.',
      ],
    },
    {
      id: 'legado-5-fugitivos',
      title: 'Fugitivos',
      section: 'Persecución intensa',
      type: 'narrative',
      content: [
        'Si todos los PJ caen inconscientes, los alguaciles llegan para detenerlos y les ven la cara con claridad. Se pasa igualmente a «Este era el plan»; sin embargo, tras la fuga el grupo queda como sospechoso ante la policía de Elendel y, en sus tratos futuros con alguaciles, las pruebas sociales sufren desventaja.',
      ],
    },

    // ── El viaje continúa ──
    {
      id: 'legado-5-viaje-continua',
      title: 'El viaje continúa',
      section: 'El viaje continúa',
      type: 'narrative',
      content: [
        'Al terminar el capítulo, los PJ de la Era 2 suben al nivel 4.',
        'El grupo ha cumplido el encargo de Wilko y ha estropeado el plan de Kwylliam de quedarse con la caja (y con la máscara y la llave de dentro), aunque también ha llamado la atención del Trío Dorado. Vuelve a su guarida a descansar mientras Wilko se compromete a investigar la llave, la máscara y la búsqueda del tesoro.',
      ],
    },
  ],

  npcs: [
    {
      name: 'Azmine Wilko',
      pronouns: 'ella',
      type: 'Profesora de Historia de la Universidad de Elendel, de sangre koloss (ficha «Azmine Wilko», apéndice A)',
      role: 'ally',
      traits: ['respetuosa', 'con mentalidad histórica', 'diligente'],
      goal: 'Usar el conocimiento del pasado para mejorar el futuro.',
      appearance: 'Mujer de sangre koloss, de piel gris azulada, mandíbula de líneas suaves y pelo ondulado y recogido. Viste traje de tweed acorde a su cargo y lleva un maletín de cuero modificado. Se pronuncia «AZ-meen WILL-koh».',
      notes: 'Colaboradora habitual y firme aliada de los PJ de la Era 2. Cree que se debe aprender de la historia, la aplica al pie de la letra y cita con frecuencia a figuras del pasado; quiere documentar las aventuras de los PJ en su «mentecobre», un enorme diario clasificado por colores. Como única profesora de sangre koloss del campus, está acostumbrada a que la ignoren, lleva sus títulos como una armadura y evita el conflicto. Es miembro de bajo rango de los Guardianes y miente fatal. En el capítulo les encarga robar la caja 38.4B; ver «Los secretos de Wilko» en la introducción del capítulo para lo que revela y lo que se niega a contar. Despacho: sala 141, departamento de Historia.',
    },
    {
      name: 'Kwylliam Elariel',
      pronouns: 'él',
      type: 'Nacidoble, noble y magnate de los pasquines, miembro del Trío Dorado (ficha «Kwylliam Elariel», apéndice A)',
      role: 'villain',
      traits: ['provocador', 'displicente', 'libertino'],
      goal: 'Acaparar todas las miradas y mantener la vida entretenida.',
      appearance: 'Noble delgado y alto, de unos veinticinco años, con pómulos marcados, tez morena y una melena revuelta color tierra. Su ropa es llamativa y lleva siempre un gesto de diversión. Se pronuncia «KWIL-ee-um eh-LAIR ee-al».',
      notes: 'Tiene alomancia de cinc (encendedor), feruquimia de duraluminio (conector) y, por un clavo familiar de bendaleo, feruquimia de cromo (hilador). Vive sin rendir cuentas, detesta el aburrimiento y cree que cualquier atención es buena. Favorito de la carrera, lleva en la solapa la insignia de los Archivos; cuando no se divierte, se resiste a la influencia (Defensa cognitiva 16, Defensa espiritual 19, 6 puntos de concentración). Sobornó a la Junta Directiva de los Archivos para desviar la caja de Wilko. Lo que los PJ le cuenten en la fiesta podría publicarse en un pasquín en el capítulo 6.',
    },
    {
      name: 'Lysarra Tekiel',
      pronouns: 'ella',
      type: 'Heredera de la casa Tekiel, ferrin, miembro del Trío Dorado (ficha «Lysarra Tekiel», apéndice A)',
      role: 'villain',
      traits: ['serena', 'calculadora', 'perspicaz'],
      goal: 'Restaurar el estatus de la familia Tekiel.',
      appearance: 'Mujer de rasgos angulosos de unos veinticinco años, con ojos penetrantes, pelo oscuro peinado en elegantes rizos ladeados y facciones de porcelana afiladas como cuchillas. Viste ropa discreta y exquisitamente confeccionada. Se pronuncia «lye-SAR-uh TEE-kee-ehl».',
      notes: 'Tiene feruquimia de cinc (chispeante) y, por un clavo familiar de bronce, alomancia de latón (aplacadora). Es la anfitriona de la fiesta, que celebra su cumpleaños; fundó la organización benéfica Jóvenes Ascendentes y vincula su linaje a la Guerrera Ascendente. Es generosa y encantadora por fuera y no es leal a nadie más que a sí misma, aunque siente gran afecto por su pareja, la capitana Vorn. En la carrera tiene Defensa cognitiva 18, Defensa espiritual 18 y 6 puntos de concentración; sus acciones de rival están en «Acciones de rival».',
    },
    {
      name: 'Bayron Conrad',
      pronouns: 'él',
      type: 'Industrial e inventor, miembro del Trío Dorado (ficha «Bayron Conrad», apéndice A)',
      role: 'villain',
      traits: ['torpe', 'decidido', 'inseguro'],
      goal: 'Ganarse el respeto de la alta sociedad.',
      appearance: 'Joven de unos veinticinco años, de mirada penetrante, ojos separados, piel cobriza y pelo rubio oscuro partido por el centro. Viste una camisa cómoda con las mangas subidas y pantalones de trabajo. Se pronuncia «BAY-ron KON-rad».',
      notes: 'Fundó Industrias Conrad (armas, vehículos blindados y equipos de comunicaciones). Con dos clavos hemalúrgicos de acero en el torso se otorgó alomancia de peltre (brazo de peltre) y de acero (lanzamonedas). Tiene un intelecto agudo, poca paciencia y obsesión por superarse; se frustra con facilidad ante personas y sistemas «ilógicos» y evita la humillación a toda costa, cerrándose en banda si se siente amenazado. Es el anfitrión de la carrera y conduce un automóvil blindado de acero de casco verde oscuro. En la carrera tiene Defensa cognitiva 17, Defensa espiritual 16 y 5 puntos de concentración. En la fiesta esboza la Medalla de la Unidad del capítulo 7.',
    },
    {
      name: 'Capitana Eliane Vorn',
      pronouns: 'ella',
      type: 'Capitana de seguridad de los Archivos Nacionales, nacidoble y exalguacil (ficha «Capitana Eliane Vorn», apéndice A)',
      role: 'villain',
      traits: ['poderosa', 'autoritaria', 'imperturbable'],
      goal: 'Proteger a Lysarra y los Archivos Nacionales.',
      appearance: 'Humana nacidoble de piel oscura y cabello canoso antes de tiempo, muy tirante en el recogido. Transmite una seguridad arrogante y lleva un guardapolvo gris pizarra. Se pronuncia «eh-lee-AH-nah VOHRN».',
      notes: 'Nacida en la familia delictiva Morgenthax, llegó a alguacil de Elendel y solo aceptó el puesto de capitana de seguridad de los Archivos tras perder su placa; Lysarra convenció a Kwylliam de contratarla. Es la pareja sentimental de Lysarra y su intermediaria con los bajos fondos de Elendel; no se separa de su sombra en la fiesta. Crea burbujas de cadmio que ralentizan lo que atrapan (ver «Huida en ascensor» y «Persecución intensa»). Manda a los guardias de los Archivos, intercepta a los PJ si actúan de forma sospechosa y lidera el combate de la plaza Beldre. Con el Vigilante de la ley tiene una historia compartida (ver «Intercepción: capitana de seguridad Vorn»).',
    },
    {
      name: 'Wynn Letrelle',
      pronouns: 'elle',
      type: 'Archivere (consejere) de los Archivos Nacionales, integrante de los Guardianes (ficha «Consejero», apéndice A)',
      role: 'ally',
      traits: ['contacto de Wilko en los Archivos', 'integrante de los Guardianes', 'acude cuando todo lo demás falla'],
      goal: 'El libro no da una meta: ayuda a la profesora Wilko desde dentro de los Archivos.',
      appearance: 'Archivere con túnica verde. Se pronuncia «WIN». El libro no da más rasgos físicos.',
      notes: 'Contacto de la profesora Wilko en los Archivos y quien le avisó de que la caja había sido redirigida. Es el plan de contingencia de Wilko: si los PJ no tienen invitación y todo lo demás falla, Wynn los hace entrar (pero llegan tarde y atraen la atención de Vorn); mencionar a Wynn basta para satisfacer a Vorn. En la fiesta entrega al Explorador un paquete con notas cifradas del Cronista (momento de legado del Explorador). Es empleade legítime de los Archivos.',
    },
    {
      name: 'Trellis Draam',
      pronouns: 'ella',
      type: 'Plebeya malwish, dueña de la chocolatería Excursiones Exquisitas',
      role: 'neutral',
      traits: ['cotilla', 'acostumbrada a servir a la élite de Elendel', 'habladora'],
      goal: 'El libro no da una meta: atiende la fuente de chocolate de la fiesta y cotillea con total libertad.',
      appearance: 'Malwish que atiende la fuente de chocolate de varios niveles de la fiesta. Se pronuncia «TREH-liss DRAHM». El libro no da más rasgos físicos.',
      notes: 'Cuenta rumores sobre los disturbios en los Áridos del Norte, los avances de Industrias Conrad y las líneas de tren de los Tekiel, y se extraña de que Lysarra pueda pagar una fiesta tan fastuosa. Con una prueba de Persuasión CD 12 revela que Lysarra y Vorn están más unidas de lo que parece y que Vorn podría tener vínculos con los Morgenthax.',
    },
  ],

  combats: [
    {
      id: 'legado-5-combate-alerta-maxima',
      title: 'Activación del suceso: alerta máxima',
      mapRef: '5.2',
      enemies: [
        { name: 'Alguacil', count: '4', bonus: 'Guardias de seguridad de los Archivos; usan el conjunto de características del alguacil; se retiran si su salud se reduce a la mitad' },
        { name: 'Vigilante de la ley', count: '1', bonus: 'Jefe de los guardias; se retira si su salud se reduce a la mitad' },
      ],
      specialRules: [
        'Se rellenan las cuatro casillas de «Cierre de los Archivos»: alerta máxima, con todas las puertas del nivel inferior bloqueadas y las alarmas sonando en las plantas de los Archivos.',
        'Cualquier prueba social ante un archivero fracasa sin tirar, y toda prueba de Sigilo se hace con desventaja.',
        'Los cuatro guardias y su jefe salen al paso del grupo e intentan detenerlo; se retiran al caer a la mitad de su salud.',
        'El libro no sitúa el encuentro en una sala concreta; el mapa 5.2 muestra el nivel inferior.',
      ],
    },
    {
      id: 'legado-5-combate-pasillo',
      title: 'Fracaso en la Carrera por el pasillo',
      mapRef: '5.2',
      enemies: [
        { name: 'Alguacil', count: '2', bonus: 'Guardias de seguridad de los Archivos; usan el conjunto de características del alguacil' },
      ],
      specialRules: [
        'Solo se lucha si el empeño «Carrera por el pasillo» fracasa (4 fallos antes que 6 éxitos): los PJ deben derrotar a dos guardias de seguridad antes de pasar a «Huida en ascensor».',
        'Para los guardias se emplea la ficha del alguacil.',
      ],
    },
    {
      id: 'legado-5-combate-plaza-beldre',
      title: 'Batalla en la plaza Beldre',
      mapRef: '5.3',
      enemies: [
        { name: 'Capitana Eliane Vorn', count: '1', bonus: 'Hace su entrada al inicio del combate, con un turno lento' },
        { name: 'Vigilante de la ley', count: '2', bonus: 'Flanquean a Vorn al entrar' },
        { name: 'Alguacil', count: '2', bonus: 'Se suman al empezar la ronda 2, desde el norte o desde el sur según decida la DJ, y atacan a los PJ de frente' },
      ],
      specialRules: [
        'Hay que aguantar 4 rondas, descontando 1 ronda por cada mérito del grupo: no haber disparado «Cierre de los Archivos» y haber visto que las cajas de L2 eran señuelos.',
        'Andanada de los vigilantes de la ley: los alguaciles rodean la plaza en número excesivo para combatirlos de frente y disparan ráfagas coordinadas desde sus coberturas. Al empezar cada ronda, cada PJ debe superar una prueba de Agilidad o sufre daño por el fuego enemigo, según la tabla; la CD y el daño suben cada ronda.',
        'Los alguaciles llegan desde el norte, el oeste y el sur y toman posiciones tras coberturas. El lado este termina en una barandilla sobre una caída mortal hacia las vías del tren; un tren se aproxima.',
        'Momento de legado del Vigilante de la ley: si, una sola vez durante la pelea con Vorn, el Vigilante aprovecha lo que comparte con ella, Vorn queda Sorprendida (por descuido o por el golpe de los recuerdos).',
        'Fugitivos: si todos los PJ quedan inconscientes, los alguaciles los arrestan y les ven la cara; se pasa igualmente a «Este era el plan», pero los PJ serán sospechosos para la policía de Elendel y sus futuras interacciones sociales con alguaciles sufrirán desventaja.',
      ],
      duration: '4 rondas, menos 1 por no haber activado el suceso «Cierre de los Archivos» y menos 1 por haber descubierto que las cajas de la sala de traslados eran señuelos.',
      tables: [TABLA_ANDANADA, TABLA_PLAZA_OC],
    },
  ],

  maps: [
    {
      id: '5.1',
      title: 'Mapa de la galería',
      pdfPage: 104,
      imagePath: '/maps/legado/map_p104.webp',
      scale: '1 casilla = 1,5 m',
      locations: [
        'G1: Galería del pasado (sala principal de la fiesta y de la exposición «Relatos del asedio»; comunica con G2)',
        'G2: Puerta al núcleo central (puesto de control y acceso a los niveles inferiores; comunica con G1 y L1)',
        'Ascensores a L1 (al norte, tras G2)',
        'Salida a Elendel (al sur de G1)',
      ],
      notes: 'Muestra la disposición de la planta baja de los Archivos Nacionales. Se usa en «Robo en la alta sociedad».',
    },
    {
      id: '5.2',
      title: 'Archivos Nacionales, nivel inferior',
      pdfPage: 109,
      imagePath: '/maps/legado/map_p109.webp',
      scale: '1 casilla = 1,5 m',
      locations: [
        'L1: Plataforma del ascensor (ascensores a G2; comunica con G2 y L5)',
        'L2: Sala de traslados de la hacienda (cajas 38.4A a 38.4E, señuelos; comunica con L5)',
        'L3: Sala de registros (libro de movimientos; comunica con L5)',
        'L4: Cámara 1616 (cinco cajas con la caja 38.4B y alarma oculta; comunica con L5)',
        'L5: Pasillo (comunica con L1, L2, L3 y L4)',
      ],
      notes: 'El mapa solo señala las estancias de interés; el resto del nivel inferior son salas y pasillos con cajas y archivadores sin valor. Es el mapa de «Burocracia y peligro».',
    },
    {
      id: '5.3',
      title: 'Plaza Beldre',
      pdfPage: 112,
      imagePath: '/maps/legado/map_p112.webp',
      scale: '1 casilla = 1,5 m',
      locations: [
        'Plaza abierta con estatuas agrietadas y una fuente seca',
        'Farolas de gas repartidas por la plaza',
        'Entradas norte, oeste y sur, por donde llegan los alguaciles y toman posiciones tras coberturas',
        'Barandilla del lado este sobre una caída mortal hacia las vías del tren',
      ],
      notes: 'El mapa marca el norte con una brújula. Se usa en «Batalla en la plaza Beldre».',
    },
  ],
}
