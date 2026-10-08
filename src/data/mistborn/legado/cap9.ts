import type { AdventureChapter, SceneTable } from '../../libros/tipos'

/** Tables used by a scene and by its combat (or by several scenes): defined once so they always show the same entries */
const TABLA_TRAMPA_POCO_FIABLE: SceneTable = {
  title: 'Trampa poco fiable (d4)',
  entries: [
    { roll: '1-2', text: 'La trampa funciona sin sorpresas.' },
    { roll: '3', text: 'Al entrar los PJ en la sala, la trampa todavía no ha saltado. Cada vez que alguien esté a punto de dispararla durante una escena, se tira el dado de trama y solo se activa si sale una Complicación (C).' },
    { roll: '4', text: 'El entorno natural ha cambiado con los años y la trampa sigue sin saltar cuando los PJ llegan. Elige una variante: está bajo el agua, su emplazamiento se ha movido hasta 4,5 m, o es ahora la madriguera de cuatro serpientes furiosas (apéndice «Compañeros animales» del Manual de Nacidos de la bruma).' },
  ],
}

const TABLA_EFECTOS_TRAMPAS: SceneTable = {
  title: 'Efectos de las trampas de la cripta',
  entries: [
    { roll: 'Pozo de ácido (Sortear CD 19)', text: 'Caer en el ácido causa 9d4 de daño vital y el estado Afligido [1d4 vital], que dura hasta lavarse con agua. Los PNJ afectados encuentran agua en 2 rondas, salvo que los PJ se lo impidan.' },
    { roll: 'Caja de señuelo (Sortear CD 16)', text: 'Solo perjudica a las fuerzas cercanas del Trío Dorado: se distraen intentando abrir la caja y sufren desventaja en las pruebas de Percepción.' },
    { roll: 'Trampa de foso (Sortear CD 17)', text: 'Foso de 6 m: la caída causa 1d6 de daño por golpe y las estacas, 5d6 de daño por laceración. Para trepar y salir hace falta una prueba de Atletismo CD 12.' },
    { roll: 'Trampa de peñasco rodante (Sortear CD 16)', text: 'Cae un peñasco de 3 m de diámetro que rueda 6 m al inicio de la ronda siguiente y 12 m al inicio de cada ronda posterior, hasta topar con una pared. A quien alcance le causa 8d6 de daño por golpe.' },
    { roll: 'Trampa de púas (Sortear CD 15)', text: 'Brotan púas del suelo o caen del techo: 4d6 de daño por laceración.' },
    { roll: 'Hachas oscilantes (Sortear CD 18)', text: 'Una vez disparada, durante 1 minuto unas hachas de metal recorren la sala. Quien entre o empiece su turno dentro debe superar una prueba de Agilidad CD 18 o recibe 6d8 de daño por laceración.' },
    { roll: 'Dardos en las paredes (Sortear CD 15)', text: 'Las paredes lanzan dardos al activarse: 7d4 de daño por laceración.' },
  ],
}

const TABLA_MODIFICACIONES_TRAMPAS: SceneTable = {
  title: 'Modificaciones de las trampas',
  entries: [
    { roll: 'Revestimiento de ácido', text: 'Suma 4d4 de daño vital a lo que inflige la trampa.' },
    { roll: 'Bien oculta', text: 'Aunque ya haya saltado, los PNJ desconocen dónde está el disparador y pueden pisarla otra vez. Detectarla se hace con desventaja.' },
    { roll: 'Reforzada', text: 'Esta trampa se salta la tabla Trampa poco fiable.' },
  ],
}

const TABLA_DADOS_LEGADO: SceneTable = {
  title: 'Dados de destino y legado',
  entries: [
    { roll: '1d20', text: 'PJ de la Era 1 que tomó parte en «Amanecer rojo en Luthadel» y salió con vida.' },
    { roll: '2d20', text: 'PJ de la Era 1 que se perdió «Amanecer rojo en Luthadel» (no estuvo en él).' },
    { roll: '3d20', text: 'PJ de la Era 1 que estuvo en «Amanecer rojo en Luthadel» y recurrió a la regla especial Sacrificio heroico.' },
  ],
}

const TABLA_SALUD_AJUSTADA: SceneTable = {
  title: 'Salud ajustada de los adversarios',
  entries: [
    { roll: 'Sobreviven 3 del Trío', text: 'Cada miembro no transformado tiene salud 50; la monstruosidad hemalúrgica, 160.' },
    { roll: 'Sobreviven 2 del Trío', text: 'El miembro no transformado tiene salud 75; la monstruosidad hemalúrgica, 160.' },
    { roll: 'Sobrevive 1 del Trío', text: 'No hay miembro no transformado; la monstruosidad hemalúrgica tiene salud 190.' },
  ],
}

const TABLA_OC_FINAL: SceneTable = {
  title: 'Oportunidades y Complicaciones de «Libertad para los necios»',
  entries: [
    { roll: 'O', text: 'Un fragmento suelto del techo o de un edificio se desploma sobre un enemigo; si no supera Evitar peligro (r), recibe 2d6 de daño por golpe.' },
    { roll: 'O', text: 'Un PJ da con un hacha de obsidiana sin el rasgo Quebradiza.' },
    { roll: 'C', text: 'Una colonia de murciélagos se agita alrededor del PJ, que queda Desorientado hasta que acabe su siguiente turno.' },
    { roll: 'C', text: 'El poder de la monstruosidad hemalúrgica rebosa: lanza un poder al azar de la tabla Expulsión inestable (en su ficha) sin quedar Aturdida.' },
  ],
}

export const CAPITULO_9: AdventureChapter = {
  id: 'legado-cap9',
  number: 9,
  title: 'Todo acaba en Luthadel',
  pdfPages: { from: 175, to: 191 },
  levelFrom: 8,
  levelTo: 9,
  eras: ['era2'],
  summary: 'Final de toda la aventura. Rumbo norte en un tren Inexpugnable, el Trío Dorado lleva el entramado robado y retiene a la profesora Wilko, y se apresura a completar la Ascensión con el Clavo de la Eternidad. Los PJ de la Era 2 reúnen el Mapa Dorado, cruzan los Áridos del Norte, se cuelan en el campamento base del Trío y bajan a la cripta de la antigua Luthadel, donde las trampas que dejaron los héroes de la Era 1 juegan a su favor. Allí interrumpen la Ascensión o llegan tarde, y en la batalla final contra la monstruosidad hemalúrgica los legados de ambas eras se entrelazan. Un epílogo y un postludio opcional con Ojos de Hierro deciden qué será del Clavo.',
  background: 'El Trío Dorado quiere cerrar el ritual de Ascensión y usar el Clavo de la Eternidad antes de que los PJ lo alcancen y se produzca el choque final. El grupo ha de juntar el Mapa Dorado y seguirlos hasta la antigua Luthadel; allí puede liberar a la profesora Wilko en el campamento base del Trío antes de adentrarse en la mazmorra de la Cripta de la Eternidad.\n\nCÓMO DIRIGIRLO: antes de empezar, monta la mazmorra de la cripta con el mapa y las decisiones de los jugadores en el capítulo 4 (ver «Preparación de la mazmorra de la cripta»). Elige también cuál de los tres integrantes del Trío es el «elegido», el villano principal de tu campaña: el que más enganche personal dé a tu historia; recibirá el Clavo y «ascenderá». Los textos para leer en voz alta dan por vivos a los tres; si uno o dos murieron, retócalos. Los legados funcionan distinto en este capítulo: recupera las ayudas «Mi legado» del capítulo 4, pues los legados de la Era 1 y la Era 2 se trenzan en la batalla final («Hilos del destino»), y repasa los recuadros del Cronista y del Convicto. Para la pelea final lee la ficha de la monstruosidad hemalúrgica, que ofrece rasgos y acciones para el villano elegido; los otros miembros del Trío que sigan vivos combaten con características modificadas, como rivales y no como jefes.\n\nDESENLACE: si el grupo derriba a la monstruosidad, la Élite Dorada cae y los PJ cumplen los legados de los protectores originales del Clavo en la Era 1. Lo que venga después queda en manos de los PJ de la Era 2, aunque en el «Postludio» Ojos de Hierro les hará una oferta.',
  prepChecklist: [
    'Monta la mazmorra de la cripta (mapa 9.1) antes de «Carrera hacia la eternidad», siguiendo «Preparación de la mazmorra de la cripta», con el plano real que dibujaron los jugadores de la Era 1 en el capítulo 4 (guárdalo: también se entrega a los PJ en «Rostros conocidos»).',
    'Del capítulo 4, apunta dónde dejaron los héroes de la Era 1 el estuche del Clavo (S1, tras la antigua catarata, o S2), qué trampas pusieron, dónde y con qué modificaciones (Revestimiento de ácido, Bien oculta, Reforzada), y si hay una caja de señuelo en S1 o S2.',
    'Si el Funcionario construyó su trampa especial en el capítulo 4, aquí tiene las características de la trampa base más el efecto extra que escogió (2 dados de daño adicionales, Retenido o Desorientado).',
    'Cuenta las marcas que el Convicto dejó en la cripta en el capítulo 4 (para el suceso «Siempre hay otro secreto») y busca los escritos del Cronista hechos con tinta metálica: sus copias originales aparecen dentro de la cripta.',
    'Reúne las ayudas «Mi legado» del capítulo 4 y anota, por cada PJ de la Era 1, si estuvo en «Amanecer rojo en Luthadel», si sobrevivió y si usó Sacrificio heroico: de ello depende cuántos d20 de legado tira cada jugador.',
    'Decide quién es el elegido del Trío Dorado y en cuál de las dos cavernas (S1 o S2) preparan la Ascensión.',
    'Haz memoria de lo ocurrido antes: piezas del Mapa Dorado que tienen los PJ, supervivientes (NeBaal, Merid, Wynn, K. T. Quiven, Marthis, la profesora Wilko), si dieron con el andén del Sótano 1, si pusieron a Yunque contra Bayron o la combatieron en el capítulo 7, si vieron los planos de la perforadora en el capítulo 8 y si oyeron a Ojos de Hierro.',
    'Ten a mano las fichas del apéndice A (monstruosidad hemalúrgica con su tabla Expulsión inestable, Bayron Conrad, Kwylliam Elariel, Lysarra Tekiel, Yunque y los adversarios de Conrad y de los Morgenthax), las minas terrestres del apéndice B y la descripción del Clavo de la Eternidad del apéndice C.',
    'Prepara tres registros de suceso: Ascensión (negativo, 8 casillas de Complicación, desde «Hacia las ruinas»), Siempre hay otro secreto (positivo, solo con el legado del Convicto) y Perturbar el entramado (positivo, 4 casillas de Oportunidad, en la batalla final).',
  ],
  progressionItems: [
    { type: 'key', text: 'Los PJ de la Era 2 arrancan el capítulo en nivel 8 y pasan a nivel 9 en cuanto pisan la mazmorra de la cripta. Es la última subida de nivel de la campaña de la Era 2: avísalos y ayúdales a cerrar sus personajes.' },
    { type: 'key', text: 'Al caer la monstruosidad hemalúrgica y quedar deshecha la Élite Dorada, los PJ suben a nivel 10.' },
    { type: 'key', text: 'Botín de la victoria: el Clavo de la Eternidad (apéndice C), dos clavos hemalúrgicos de rango 3 que otorgan un poder de nacido del metal de la tabla Expulsión inestable, un clavo hemalúrgico de trellium y todo el equipo, ingenios y vehículos de la Élite Dorada, que se venden por 4000 arquillas como mínimo.' },
    { type: 'key', text: 'Si el grupo entrega el Clavo a Ojos de Hierro en el «Postludio», puede adoptar a Armonía como patrocinador, que le asignará misiones futuras, y Ojos de Hierro acudirá en ayuda del próximo PJ en peligro mortal.' },
    { type: 'info', text: 'Superar el empeño «Hacia las ruinas» da el estado Resuelto a los PJ, que llegan descansados a la antigua Luthadel.' },
    { type: 'info', text: 'Tras ganar «Hacia las ruinas», el empeño «Antigua Luthadel» empieza con 1 éxito ya anotado.' },
    { type: 'info', text: 'Si Marthis sobrevivió gracias a los PJ, regala 1 éxito gratuito en «Hacia las ruinas».' },
    { type: 'info', text: 'Si los PJ echan una mano a K. T. Quiven en T8, ella les da un cartucho de dinamita.' },
    { type: 'info', text: 'Cada PJ de la Era 1 aporta 1d20, 2d20 o 3d20 de legado a su pareja de la Era 2; el Cronista tira un dado extra si sus escritos ayudaron, y el Convicto puede activar una trampa adicional con «Siempre hay otro secreto».' },
    { type: 'info', text: 'Cada ayuda previa borra 1 casilla del suceso Ascensión: NeBaal guiando por los túneles, el Clavo oculto tras la cascada de S1 o una caja de señuelo en S1 o S2.' },
  ],

  scenes: [
    // ── Viaje al pasado ──────────────────────────────────────────────────────────────────
    {
      id: 'legado-9-viaje-al-pasado',
      title: 'Viaje al pasado',
      section: 'Viaje al pasado',
      type: 'narrative',
      content: [
        'El capítulo continúa sin pausa desde el capítulo 8 y deja a los PJ un breve respiro para reorganizarse y salir tras el Trío Dorado, que avanza rumbo al norte en el Inexpugnable con el entramado y con Wilko de rehén. Si el grupo no saca por sí solo alguno de estos datos, NeBaal lo aporta.',
        'DATOS CLAVE (1): Wilko comentó rumores de que el Trío había dado con la antigua Luthadel y de que Lysarra pagaba desde hacía casi un año una excavación clandestina. (2): el Mapa Dorado guía por los túneles que corren bajo la ciudad hasta la puerta de la cripta, y solo las tres piezas unidas muestran el recorrido. (3): como el Trío tiene a Wilko y su diario sobre el mapa, hallar la Cripta de la Eternidad (la que custodia el Clavo) es solo cuestión de tiempo. (4): los clavos que Lysarra quitó a la Élite Dorada son el entramado que exige el ritual de Ascensión que emplea el Clavo. (5): el Inexpugnable va hacia la antigua Luthadel; por el porvenir de Scadrial y por Wilko, conviene perseguirlo ya.',
      ],
      tips: [
        'Los legados de los PJ funcionan de forma distinta en este capítulo: ver «Hilos del destino».',
      ],
    },
    {
      id: 'legado-9-rostros-conocidos',
      title: 'Rostros conocidos',
      section: 'Viaje al pasado',
      type: 'social',
      content: [
        'Antes de que el grupo salga, acuden a verlo NeBaal y Merid; si Merid ha muerto, lo hace en su lugar Wynn Letrelle, elle archivere de los Guardianes que apareció en el capítulo 5. Si los PJ los buscan, pueden contar además con otros PNJ que sigan vivos.',
        'NEBAAL: insiste en acompañar al grupo. Se inquieta por Wilko y se hace responsable de todo lo que ha llevado hasta aquí. Recuerda las hazañas de los héroes de la Era 1 y dice que no puede quedarse mirando.',
        'K. T. QUIVEN: si los PJ la buscan, no la encuentran. En su cuarto de la residencia hay uniformes robados de Industrias Conrad y notas sobre el vagón de Lysarra en el Inexpugnable: parece que ha vuelto a infiltrarse. Si el grupo no dio con el andén del Sótano 1, las notas de K. T. lo señalan.',
        'MARTHIS ELARIEL/TEKIEL: si los PJ lo salvaron, informa de cuanto sabe sobre cómo planea Lysarra el viaje: el itinerario previsto y lo seco del clima en la zona. El grupo gana 1 éxito gratuito en el empeño «Hacia las ruinas».',
        'MERID O WYNN: con Merid vivo, entrega a los PJ los planos de la Cripta de la Eternidad, es decir, el mapa que los jugadores trazaron en el capítulo 4 con las marcas de todas las trampas, y los Guardianes prometen ayuda en lo que puedan. Si murió, Wynn entrega igualmente los planos en nombre de los Guardianes, pero la sociedad está sumida en el caos y no puede dar nada más.',
        'CONEXIÓN EN EL TIEMPO: ese plano lo trazaron los héroes de la Era 1 en el capítulo 4. Pasó de mano en mano entre los Guardianes durante siglos, convertido en reliquia, esperando justo este momento.',
      ],
      tips: [
        'Entrega a los jugadores el mapa de la cripta que dibujaron en el capítulo 4, con las marcas de las trampas.',
      ],
      branches: [
        { label: 'Merid sobrevivió', description: 'Entrega los planos de la cripta; los Guardianes ayudan en lo posible y ofrecen un dirigible experimental en «Hacia las ruinas».' },
        { label: 'Merid murió', description: 'Wynn Letrelle entrega igualmente los planos en nombre de los Guardianes, que están en el caos y no pueden dar más ayuda.' },
        { label: 'Marthis sobrevivió', description: 'Comparte lo averiguado sobre la ruta de Lysarra y el clima seco: 1 éxito gratuito en «Hacia las ruinas».' },
        { label: 'K. T. Quiven', description: 'No se la encuentra; sus notas pueden llevar al andén del Sótano 1 si el grupo no lo había hallado.' },
      ],
    },
    {
      id: 'legado-9-hacia-las-ruinas',
      title: 'Hacia las ruinas',
      section: 'Viaje al pasado',
      type: 'exploration',
      content: [
        'EL VIAJE: los PJ pueden usar las vías secretas de Lysarra bajo tierra, pero llegar cuesta: casi mil kilómetros en tren o barco hasta las inmediaciones de Callingfale (Áridos del Norte) y luego orientarse por unos 120 km de desierto rocoso, hostil y sin caminos hasta las ruinas de la antigua Luthadel. Se juega como empeño con tres obstáculos sucesivos: descifrar el mapa, conseguir transporte veloz y sobrevivir a la frontera.',
        'REGLA ESPECIAL, LA ASCENSIÓN SE APROXIMA: desde ahora corre la cuenta atrás del suceso Ascensión (ver «Suceso: Ascensión»). Aún no lo nombres: enseña a la mesa un suceso negativo anónimo con un registro de ocho casillas de Complicación. Marca 1 casilla por cada pieza del Mapa Dorado que el grupo no tenga y avisa cada vez que avance, aunque su sentido completo no se revela hasta «Carrera hacia la eternidad». Por ahora solo avanza en los casos indicados, no con las Complicaciones. Cada fallo del empeño equivale a un retraso que beneficia al Trío: marca una casilla y deja pistas de que el Trío y sus huestes van por delante, como campamentos vacíos, rodadas de neumáticos o rumores de una columna de nobles rumbo al noreste.',
        'REGLA ESPECIAL, MOMENTOS DE CALMA: dos escenas de interpretación se intercalan con el empeño. Orden propuesto: «Componer el mapa» cuando se descifren las piezas, y «Hemos llegado muy lejos» una vez asegurado el transporte, durante la frontera o si el empeño fracasa.',
        'OBSTÁCULO 1, DESCIFRAR EL MAPA: con las tres piezas, éxito automático y el mapa se compone sin esfuerzo. Con alguna pieza ausente, pueden contrastar el mapa incompleto con cartografía histórica de Luthadel (prueba de Deducción CD 20) o descodificarlo gracias a su pericia con el terreno (prueba de Supervivencia CD 18). Se pasa al obstáculo 2 con 1 éxito o con 2 fallos.',
        'OBSTÁCULO 2, CONSEGUIR TRANSPORTE: pueden regatear un pasaje rápido en tren o barco (prueba de Persuasión CD 18) o escoger buenas monturas para el tramo terrestre de los Áridos del Norte (prueba de Supervivencia CD 16). Con Merid vivo, tienen ventaja en ambas y los Guardianes prestan un dirigible experimental, que requiere un mecánico entregado (prueba de Manufactura CD 16) y se avería con facilidad. Basta 1 éxito para pasar al obstáculo 3.',
        'OBSTÁCULO 3, SOBREVIVIR A LA FRONTERA: pueden prever los peligros del territorio (prueba de Supervivencia CD 16), esquivar la mirada de bandidos o clanes koloss (prueba de Percepción CD 18) o sostener la moral del grupo durante el trayecto (prueba de Liderazgo CD 16).',
        'RESOLUCIÓN DEL EMPEÑO: se gana con 5 éxitos antes de 3 fallos, o salvando los tres obstáculos por otras vías. Éxito: ritmo excelente; los PJ llegan frescos y listos, en la estela del Trío, y ganan el estado Resuelto. Fracaso: la marcha es extenuante y, al llegar, comprueban que el Trío les saca varios pasos de ventaja.',
      ],
      tips: [
        'El obstáculo 3 es un buen punto para subir la apuesta.',
        'Si el empeño sale bien, el siguiente («Antigua Luthadel») empieza con 1 éxito anotado.',
      ],
      branches: [
        { label: 'Éxito (5 éxitos antes que 3 fallos)', description: 'Los PJ llegan descansados, pisando los talones al Trío, y obtienen el estado Resuelto.' },
        { label: 'Fracaso', description: 'Viaje agotador: el Trío lleva varios pasos de ventaja. Cada fallo acumulado ya habrá rellenado una casilla del suceso Ascensión.' },
      ],
    },
    {
      id: 'legado-9-componer-el-mapa',
      title: 'Momento de calma: Componer el mapa',
      section: 'Viaje al pasado',
      type: 'social',
      readAloud: 'Ante vosotros, NeBaal junta la máscara, la medalla y la capa de bruma, casando costuras y grabados hasta que los tres objetos se solapan y dibujan un único diseño. Elle retrocede un paso, se cruza de brazos y pronuncia el nombre: el Mapa Dorado. (L.174 / PDF 177)',
      content: [
        'MOMENTO: se juega poco después de descifrar el mapa. El texto anterior es para cuando los PJ tienen el mapa completo: NeBaal siente esperanza.',
        'SI FALTA ALGUNA PIEZA: NeBaal siente temor. Mira el mapa incompleto con serenidad y avisa de que sin el Mapa Dorado entero todo será más duro: han sacado en claro lo que han podido. Añade que el Trío tampoco lo tiene completo, pero dispone de Azmine y de sus notas, de modo que será una carrera de verdad por el Clavo. (L.174 / PDF 177)',
        'NEBAAL EN EL GRUPO: elle quiere acompañarlos. Si la relación con los PJ es buena, murmura un juramento: combatirá en persona a la Élite Dorada si hace falta, aunque eso contradiga los tabúes de los kandra.',
      ],
    },
    {
      id: 'legado-9-hemos-llegado-muy-lejos',
      title: 'Momento de calma: Hemos llegado muy lejos',
      section: 'Viaje al pasado',
      type: 'social',
      content: [
        'MOMENTO: cualquier noche del viaje, antes de acostarse, NeBaal propone charlar. Reconoce que necesita pensar en otra cosa para no angustiarse por Wilko, y puede hablar del daño que sufrieron los héroes de la Era 1.',
        'MECÁNICA: reparte turnos por la mesa; cada jugador elige una pregunta de la lista para que su PJ la conteste o se la haga a otro PJ.',
        'PREGUNTAS (resumidas): cuál de los tres del Trío es el más peligroso; qué opina el PJ de la masacre de la Élite Dorada por Lysarra; qué siente al ir al corazón del Imperio Final; qué haría con el Clavo de la Eternidad; si conviene estudiar los poderes antiguos o dejarlos atrás; qué debe priorizar el grupo entre salvar a Wilko y frenar al Trío; qué piensa de los Guardianes y su sociedad secreta; y si, de no salir con vida, pediría algo al grupo.',
      ],
      tips: [
        'Se puede jugar mientras sobreviven a la frontera, tras conseguir el transporte o si los PJ fallan el empeño.',
      ],
    },
    {
      id: 'legado-9-antigua-luthadel',
      title: 'Antigua Luthadel',
      section: 'Viaje al pasado',
      type: 'exploration',
      readAloud: 'Descendéis entre rocas rotas hacia la gran boca de una caverna, puerta de los túneles de la antigua Luthadel y de sus ruinas sepultadas. Faroles de gas titilantes alumbran un yacimiento arqueológico que os cierra el paso: tiendas de lona, maquinaria y tramos de vía. Entre cajas de suministros circulan ingenieros de Industrias Conrad, y matones de los Morgenthax, bien armados, rondan el perímetro. (L.175 / PDF 178)',
      content: [
        'SITUACIÓN: un campamento del Trío, repleto de enemigos, rodea la entrada de la cueva hacia las ruinas. Cierra el paso, pero espiarlo permite saber qué hay abajo. NeBaal pide buscar a Wilko.',
        'EL EMPEÑO: la infiltración se resuelve como empeño. De camino a la boca del túnel, los PJ pueden cumplir tres objetivos opcionales: averiguar los planes del Trío, provocar el caos entre las tropas Doradas y liberar a la profesora Wilko. Antes de empezar, pregunta de forma explícita si intentarán rescatarla, porque eso encarece el empeño.',
        'OBSTÁCULO, TIENDAS DE MANDO: entre lonas y pilas de cajas, los PJ rozan a los mercenarios Morgenthax (mataneblinos) y a los ingenieros de Conrad. Pueden pasar inadvertidos (prueba de Sigilo CD 16) o camuflarse con un disfraz (prueba de Hurto CD 17) y así captar datos valiosos: los «preparativos para la Ascensión» han comenzado, el Trío ya está bajo tierra y Wilko está presa en una tienda del extremo oeste del campamento.',
        'OBSTÁCULO, LA UBICACIÓN DE WILKO: un PJ que observe el campamento puede fijarse en una tienda con demasiada vigilancia (prueba de Perspicacia CD 15) o hojear los papeles de los ingenieros y deducir dónde la tienen (prueba de Deducción CD 18).',
        'OBSTÁCULO, FRICCIÓN ENTRE EL PERSONAL: los criminales de los Morgenthax y el personal corporativo de Conrad se llevan mal, y esa tensión se puede explotar: escuchar quejas hasta que alguien suelte de más (prueba de Liderazgo CD 15); lograr que un ingeniero de Conrad agobiado se desahogue sobre los empleados desaparecidos (prueba de Persuasión CD 16); o presentarse como mensajero de los Morgenthax con «órdenes corregidas» para crear confusión (prueba de Engaño CD 16).',
        'RESOLUCIÓN: el empeño se gana con 4 éxitos antes de 3 fallos; si intentan salvar a Wilko, hacen falta 5. Si ganaron «Hacia las ruinas», el Trío acaba de irse con prisas: el campamento sigue revuelto y empiezan con 1 éxito.',
        'ÉXITO: atraviesan el campamento sin incidentes y, por la vía que sea, averiguan además cuántos son, cómo están formadas las fuerzas del Trío y dónde se ubican en la cripta (ver «Recorrido por las cavernas»). Con rescate, sigue «Rescatar a Wilko»; sin él, NeBaal va a liberar a la profesora y los PJ van «A la cripta».',
        'FRACASO: los descubren. Para salvar la misión, NeBaal se aparta y monta una distracción arriesgada, pidiendo al grupo que continúe sin elle. Con rescate, sigue «Rescatar a Wilko»; sin él, directo a «A la cripta».',
      ],
      branches: [
        { label: 'Éxito', description: 'Cruzan el campamento y se enteran de la composición, el número y la ubicación en la cripta de las fuerzas del Trío. Con rescate: «Rescatar a Wilko»; sin rescate: NeBaal salva a la profesora y los PJ van «A la cripta».' },
        { label: 'Fracaso', description: 'Los descubren; NeBaal crea una distracción arriesgada y les dice que sigan sin elle. Con rescate: «Rescatar a Wilko»; sin rescate: directamente «A la cripta».' },
      ],
    },
    {
      id: 'legado-9-rescatar-a-wilko',
      title: 'Rescatar a Wilko',
      section: 'Viaje al pasado',
      type: 'choice',
      content: [
        'LA TIENDA: Wilko está presa en una tienda que vigilan maleantes de los Morgenthax (los mataneblinos). Lo que haya allí depende de cómo acabó el empeño «Antigua Luthadel».',
        'TRAS UN ÉXITO: solo dos matones de los Morgenthax, aburridos y absortos en una partida de cartas. Para entrar basta una prueba: engañar a los guardias (prueba de Engaño CD 14) o abrir un tajo por detrás (prueba de Hurto CD 13); esa prueba tiene ventaja.',
        'TRAS UN FRACASO: cinco maleantes de los Morgenthax, en guardia. NeBaal se lleva a tres con su señuelo, pero los dos restantes atacan nada más ver a los PJ.',
        'ENCUENTRO: Wilko está cortando la lona con una lima para huir. Informa de que el Trío le quitó el diario y bajó a los túneles. Sigue en «A la cripta».',
      ],
      branches: [
        { label: 'Éxito en «Antigua Luthadel»', description: 'Dos guardias aburridos jugando a las cartas; una prueba de Engaño CD 14 o Hurto CD 13 con ventaja basta para entrar.' },
        { label: 'Fracaso en «Antigua Luthadel»', description: 'Cinco maleantes alerta; NeBaal aparta a tres y los otros dos atacan al ver a los PJ (ver el combate de esta escena).' },
      ],
    },
    {
      id: 'legado-9-a-la-cripta',
      title: 'A la cripta',
      section: 'Viaje al pasado',
      type: 'narrative',
      content: [
        'Los PJ saben ya que el Trío ha bajado a la cripta con guardias e ingenieros para usar el Clavo de la Eternidad. Si liberaron a Wilko y NeBaal sigue con ellos, ambos se ofrecen a guiarlos por los túneles; Wilko, muerta de miedo, acompaña al grupo si se lo piden.',
        'CASOS POSIBLES: el grupo puede ir pegado al Trío o muy rezagado, guiarse por el Mapa Dorado o por el rastro enemigo, y entrar acompañado de sus aliados o sin saber qué ha sido de NeBaal y Wilko.',
        'En cualquier caso, llegan a la boca de la cueva y descienden por los túneles hasta la antigua Luthadel, donde los espera la eternidad. Empieza «Carrera hacia la eternidad».',
      ],
    },

    // ── Carrera hacia la eternidad ───────────────────────────────────────────────────────
    {
      id: 'legado-9-carrera-hacia-la-eternidad',
      title: 'Carrera hacia la eternidad',
      section: 'Carrera hacia la eternidad',
      type: 'narrative',
      content: [
        'ESQUEMA: mientras el grupo avanza por los túneles, el Trío Dorado entra en la Cripta de la Eternidad con un equipo mercenario de excavación y arranca el ritual de Ascensión. El mapa se concibió a dos manos: recoge las defensas de los héroes de la Era 1, que ayudan al grupo, y las tropas del Trío, que lo frenan.',
        'ANTES DE JUGAR: si aún no has preparado la mazmorra, detén la partida y sigue «Preparación de la mazmorra de la cripta»; es buen momento también para el avance de nivel. Después, sigue en «Cómo dirigir la mazmorra».',
        'NIVEL 9: los PJ de la Era 2 suben a nivel 9 al entrar en la mazmorra. Es la última subida de esa campaña; avisa a los jugadores y ayúdales a completar sus personajes. Tras recorrer dos eras, queda poco para el choque decisivo contra la Élite Dorada y el Clavo.',
      ],
    },
    {
      id: 'legado-9-preparacion-de-la-mazmorra',
      title: 'Preparación de la mazmorra de la cripta',
      section: 'Carrera hacia la eternidad',
      type: 'narrative',
      content: [
        'Antes de jugar la mazmorra, el director tiene tres tareas.',
        'COLOCAR AL TRÍO: están en la sala más profunda, ultimando la Ascensión. Ponlos en S1 o S2, la caverna donde los héroes de la Era 1 dejaron el estuche del Clavo.',
        'ELEGIR AL ELEGIDO: escoge cuál de los tres villanos recibirá la Ascensión. Todos ansían la divinidad por razones propias; decide según quién dé a tu mesa el mejor antagonista.',
        'REPASAR LA MAZMORRA: estudia la «Regla especial: Gestión de las trampas», el mapa 9.1 y «Recorrido por las cavernas», y recuerda narrar las «Características de los túneles» cuando venga a cuento.',
      ],
    },
    {
      id: 'legado-9-como-dirigir-la-mazmorra',
      title: 'Cómo dirigir la mazmorra',
      section: 'Carrera hacia la eternidad',
      type: 'exploration',
      content: [
        'PASO 1, PRESENTAR EL SUCESO: ve a «Suceso: Ascensión», revela a los jugadores qué es y calcula cuántas casillas parten ya marcadas.',
        'PASO 2, ELEGIR ENTRADA: la entrada sur es un túnel recién abierto, con profundas huellas de rodadura que delatan la perforadora (ver T2). Con el Mapa Dorado completo, los PJ pueden acercarse por la suroeste (T1), la sur (T2) o la sureste (T3). Sin él, empiezan por la sur, porque solo siguen la pista de la máquina.',
        'PASO 3, JUGAR LA MAZMORRA: usa el mapa 9.1 con las zonas de «Recorrido por las cavernas». En cada sala donde los héroes de la Era 1 pusieron una trampa, aplica su «Configuración de trampas» al entrar los PJ actuales y luego la «Regla especial: Gestión de las trampas». Deja que los jugadores tiren el daño de las trampas y narren sus efectos sobre los ocupantes. Después, los PJ entran en la zona y se miden con lo que quede de las fuerzas Doradas.',
        'PASO 4, EL FINAL: la mazmorra acaba al alcanzar al Trío («Ascensión interrumpida») o al activarse el suceso («Suceso: Ascensión»).',
        'REGLA ESPECIAL, COMPLICACIONES POR DOQUIER: el tiempo apremia, así que fuera de combate sube la apuesta y da desventaja a toda prueba relevante que los PJ hagan para tratar directamente con las fuerzas del Trío. Cada Complicación hace avanzar el suceso Ascensión de forma automática.',
        'MOMENTO DE LEGADO DEL CONVICTO: abre un suceso positivo, «Siempre hay otro secreto», con tantas casillas de Oportunidad como 5 menos las marcas que el Convicto dejó en el capítulo 4. Los PJ gastan O para avanzarlo 1; si la gasta el Narrador (así lo dice el libro; parece referirse al director de juego), avanza 2. Al activarse, el jugador del Convicto elige una de tres trampas (foso, hachas oscilantes o dardos en la pared); se dibuja en el mapa de la caverna y salta al instante.',
        'CONEXIÓN EN EL TIEMPO: gracias a los héroes de la Era 1, los PJ conocen dónde está cada trampa. Aquí no son una sorpresa hostil, sino el fruto de una buena planificación: subraya cómo los preparativos antiguos dañan a las tropas del Trío e incita a usarlas con ingenio.',
      ],
      tips: [
        'La mazmorra usa el mapa 9.1 y termina al llegar junto al Trío o al activarse la Ascensión.',
        'Si el Funcionario construyó la trampa especial del capítulo 4, recuerda sus características (trampa base más efecto extra).',
      ],
    },
    {
      id: 'legado-9-gestion-de-las-trampas',
      title: 'Regla especial: Gestión de las trampas',
      section: 'Carrera hacia la eternidad',
      type: 'exploration',
      content: [
        'POSICIÓN CONOCIDA: salvo que una trampa haya cambiado de sitio (tabla Trampa poco fiable), los PJ saben dónde está exactamente y no la disparan al caminar por ella a propósito. El movimiento forzado sí puede dispararla, por ejemplo si un enemigo Empuja a un PJ hacia ella.',
        'AL DISPARARSE, PRIMERO: si los héroes de la Era 1 no la hicieron «Reforzada», la trampa es poco fiable: tira en la tabla Trampa poco fiable.',
        'AL DISPARARSE, DESPUÉS: aplica a quienes estén en la sala los «Efectos de las trampas de la cripta» y la «Configuración de trampas» de esa sala. El daño lo tiran los jugadores.',
      ],
      tables: [TABLA_TRAMPA_POCO_FIABLE],
    },
    {
      id: 'legado-9-recorrido-por-las-cavernas',
      title: 'Recorrido por las cavernas',
      section: 'Carrera hacia la eternidad',
      type: 'exploration',
      content: [
        'Las tropas del Trío aguardan en las cavernas. Si hubo trampas de la Era 1 en una sala, aplica su «Configuración de trampas» cuando los PJ entren. El objetivo es llegar a S1 o S2 (la que alberga el estuche del Clavo) antes de que se active la Ascensión.',
        'CONEXIONES ENTRE ZONAS (mapa 9.1): T1 con T4; T2 con T3 y T4; T3 con T2 y T5; T4 con T1, T2, T6, T7 y T8; T5 con T3, T8 y T9; T6 con T4 y S1; T7 con T4 y S2; T8 con T4, T5 y T9; T9 con T5, T8 y S2.',
      ],
      tips: [
        'Las fichas de los adversarios están en el apéndice A; las minas terrestres, en el apéndice B.',
      ],
    },
    {
      id: 'legado-9-t1-centinelas-forajidos',
      title: 'T1: Centinelas forajidos',
      section: 'Carrera hacia la eternidad',
      type: 'social',
      content: [
        'ZONA: enlaza con T4.',
        'SI YUNQUE ROMPIÓ CON BAYRON GRACIAS A LOS PJ (capítulo 7): la sala está vacía.',
        'EN OTRO CASO: tres Marca de Hierro (luchadores por la libertad) y Yunque; si ella murió, la sustituye un protector del clan koloss. Si el grupo se enfrentó a Yunque en el capítulo 7, los Marca de Hierro atacan nada más verlos; si no, desconfían del Trío y negociarán. Yunque gasta concentración para resistir los argumentos ya usados en el capítulo 7, pero atiende pruebas nuevas y se retira o ayuda si el trato que le ofrecen es mejor.',
        'TRAMPAS: se activan con normalidad. Después, los Marca de Hierro que sigan en pie están asustados y los PJ tienen ventaja al negociar con ellos.',
      ],
    },
    {
      id: 'legado-9-t2-operacion-de-perforacion',
      title: 'T2: Operación de perforación',
      section: 'Carrera hacia la eternidad',
      type: 'exploration',
      content: [
        'ZONA: enlaza con T3 y T4. Dos operativos de Conrad vigilan el acceso sur: quien se acerque desde allí sufre desventaja en Sigilo.',
        'PERFORADORA: máquina de vapor Tekiel adaptada, de 7,5 por 3 m y con un cabezal de taladro descomunal, que acaba de abrir un túnel hacia la cripta. Hay que calentar su caldera de carbón durante una ronda; luego avanza taladrando la roca hasta 1,5 m por ronda. Tiene Defensa física 18, salud 50 y valor de desvío 3. Averiguar cómo se maneja exige la pericia Ingeniería o una prueba de Deducción CD 18 (con ventaja si se vieron los planos en el capítulo 8).',
        'TRAMPAS: las que salten solo dañan a la perforadora; con 10 o más puntos de daño se bloquea y hace falta una prueba de Manufactura CD 16 para repararla.',
      ],
    },
    {
      id: 'legado-9-t3-ingenieros',
      title: 'T3: Ingenieros',
      section: 'Carrera hacia la eternidad',
      type: 'combat',
      content: [
        'ZONA: enlaza con T2 y T5. Al norte hay un risco de 6 m (ver «Características de los túneles»).',
        'FUERZAS: tres ingenieros de Conrad toman medidas y apuntes por los túneles; uno carga una granada alomántica con alomancia de hierro ya infundida (3 de Investidura).',
        'TRAMPAS: se activan con normalidad; luego los ingenieros que queden están despistados y las pruebas de los PJ contra ellos (Sigilo y similares) tienen ventaja.',
      ],
    },
    {
      id: 'legado-9-t4-expertos-en-explosivos',
      title: 'T4: Expertos en explosivos',
      section: 'Carrera hacia la eternidad',
      type: 'combat',
      content: [
        'ZONA: enlaza con T1, T2, T6, T7 y T8.',
        'FUERZAS: dos ingenieros de Conrad instalan tres minas terrestres (apéndice B); a 3 m, dos operativos de Conrad vigilan un alijo con una escopeta, dos granadas de conmoción y otras dos minas.',
        'TRAMPAS: se activan con normalidad. Si cae cualquiera de los ingenieros, las tres minas detonan y el túnel se hunde en parte: 2d6 de daño por golpe por el derrumbe, sumados al de minas y trampas. Tras las trampas, los operativos que queden protegen el alijo con miedo.',
      ],
    },
    {
      id: 'legado-9-t5-t7-t9-francotiradores',
      title: 'T5, T7 y T9: Francotiradores de élite',
      section: 'Carrera hacia la eternidad',
      type: 'combat',
      content: [
        'ZONAS: T5 une con T3, T8 y T9; T7, con T4 y S2; T9, con T5, T8 y S2.',
        'FUERZAS: un francotirador (operativo de élite de Conrad) por túnel. La primera vez que un PJ entra en uno, el francotirador tira Sigilo contra la Defensa espiritual del PJ; si gana, sigue oculto y el PJ no lo percibe hasta que dispare o se delate.',
        'TRAMPAS: se activan con normalidad.',
      ],
    },
    {
      id: 'legado-9-t6-emboscada-de-los-morgenthax',
      title: 'T6: Emboscada de los Morgenthax',
      section: 'Carrera hacia la eternidad',
      type: 'combat',
      content: [
        'ZONA: enlaza con T4 y S1; está en el nivel inferior, con un risco de 6 m al este (ver «Características de los túneles»).',
        'FUERZAS: un equipo de élite de los Morgenthax aguarda en un estrechamiento atento a la alomancia y al grupo: dos asesinos (mataneblinos), dos matones y su líder (mataneblino de élite), que lleva armadura de placas de madera.',
        'TRAMPAS: se activan con normalidad.',
      ],
    },
    {
      id: 'legado-9-t8-desactivacion-bajo-presion',
      title: 'T8: Desactivación bajo presión',
      section: 'Carrera hacia la eternidad',
      type: 'social',
      content: [
        'ZONA: enlaza con T4, T5 y T9.',
        'K. T. QUIVEN: la informadora se coló entre las tropas del Trío como supuesta ingeniera de Conrad. Tres operativos de Conrad la mandan a buscar trampas, sin que ella sepa hacerlo. Si los PJ la ayudan, les entrega un cartucho de dinamita.',
        'TRAMPAS: las de esta zona siguen intactas, y K. T. está a punto de dispararlas.',
      ],
    },
    {
      id: 'legado-9-efectos-de-las-trampas',
      title: 'Efectos de las trampas de la cripta',
      section: 'Carrera hacia la eternidad',
      type: 'exploration',
      content: [
        'Las trampas de los héroes de la Era 1 tienen dos rasgos.',
        'SORTEAR: es la CD de Percepción para localizar la trampa y de Manufactura u Hurto para desarmarla; quien vaya a dispararla puede hacer una prueba de Agilidad contra esa CD (reacción Evitar peligro) para evitarlo.',
        'EFECTO: lo que hace la trampa; la primera tabla recoge las posibles. Pruebas que incluye: salir del foso exige una prueba de Atletismo CD 12, y en las hachas oscilantes quien entre o empiece su turno dentro debe superar una prueba de Agilidad CD 18.',
        'MODIFICACIONES: las trampas modificadas suman efectos extra (segunda tabla).',
      ],
      tables: [TABLA_EFECTOS_TRAMPAS, TABLA_MODIFICACIONES_TRAMPAS],
    },
    {
      id: 'legado-9-caracteristicas-de-los-tuneles',
      title: 'Características de los túneles',
      section: 'Carrera hacia la eternidad',
      type: 'exploration',
      content: [
        'Dos rasgos del terreno: el cauce de una antigua catarata y unos riscos escarpados. Descríbelos cuando venga a cuento.',
        'ANTIGUA CATARATA: seca desde hace mucho; la erosión derrumbó la entrada a la caverna que se esconde tras ella (S1). Una prueba de Supervivencia CD 14 halla un paso seguro entre las rocas; si falla, la Ascensión avanza mientras los PJ pierden tiempo buscando ruta.',
        'RISCOS: paredes de 6 m al norte de T3 y al este de T6. Subirlas con seguridad exige una prueba de Atletismo CD 14; quien falla cae y recibe 1d6 de daño por golpe. Si dispara una trampa mientras escala, la prueba tiene desventaja.',
      ],
    },
    {
      id: 'legado-9-suceso-ascension',
      title: 'Suceso: Ascensión',
      section: 'Carrera hacia la eternidad',
      type: 'exploration',
      content: [
        'NATURALEZA: suceso negativo de ocho casillas que mide el ritual del Trío hasta su culminación. En él se implanta el entramado (con los clavos originales de Vadilek) a un miembro del Trío, paso previo a recibir el Clavo de la Eternidad. Se esboza en «Hacia las ruinas» y se revela entero al comenzar «Carrera hacia la eternidad», cuando ya puede llevar casillas marcadas (por piezas del mapa perdidas o por fallos del viaje).',
        'AL COMENZAR: explica que el suceso mide el avance del Trío en el ritual y borra 1 casilla marcada por cada una de estas condiciones: los héroes de la Era 1 escondieron el Clavo tras la cascada de S1; esos mismos héroes dejaron una caja de señuelo en S1 o S2; NeBaal ayudó a los PJ a orientarse por los túneles.',
        'AVANCE: una Complicación de un PJ dentro de la cripta se convierte en +1 al suceso; también suma 1 cada combate que se alargue más de una ronda (avísalo a los jugadores). Con cada paso, los alaridos del elegido retumban más fuertes por los túneles, porque otro clavo lo acerca a la Ascensión. También avanza al fallar la búsqueda de paso en la antigua catarata.',
        'ACTIVACIÓN: si se llenan las ocho casillas antes de alcanzar el Clavo, el suceso se activa («Llega la Ascensión»). Si los PJ llegan a la sala final antes, pasa a «Ascensión interrumpida».',
      ],
      tips: [
        'La ficha de la monstruosidad hemalúrgica (apéndice A) usa el número de casillas marcadas de este suceso para limitar los poderes inestables que puede emplear sin quedar Aturdida.',
      ],
    },
    {
      id: 'legado-9-llega-la-ascension',
      title: 'Llega la Ascensión',
      section: 'Carrera hacia la eternidad',
      type: 'narrative',
      readAloud: 'La luz se vuelve densa y poco natural, el aire vibra y os eriza la piel. Oís gritos de terror y pasos que huyen. Una ola negra e invisible os atraviesa: el Pavor, una emoción que aplasta cualquier otra y os dice que algo ha salido terriblemente mal. Poco después, el estruendo de la huida se apaga y lo sustituyen alaridos guturales, inhumanos. (L.182 / PDF 185)',
      content: [
        'OLEADA EMOCIONAL: la Ascensión comienza y desata una ola de encendido emocional. Las tropas del Trío huyen en pleno pánico, intuyendo que quedarse es morir. PJ y PNJ aliados hacen una prueba de Disciplina CD 20: los PNJ que fallan escapan; los PJ han de optar entre pagar 3 puntos de concentración o sufrir Mermado [Intelecto −2] y Mermado [Voluntad −2] en la primera ronda de combate (el libro no aclara si la opción es solo para quien falla).',
        'AL LLEGAR A LA SALA DEL TRÍO (texto para leer, resumido): la sala del ritual está desierta, con escombros y sangre derramada. Un túnel que sube deja pasar la luz del sol hacia una caverna mayor y desde allí llega una respiración monstruosa y fatigada. (L.182 / PDF 185)',
        'LO OCURRIDO: el elegido se ha convertido en monstruosidad hemalúrgica y ha reventado el techo hacia una cámara superior más amplia; los demás del Trío lo han seguido. Con una prueba de Deducción o Percepción CD 14, los PJ hallan harapos de la transformación y saben quién mutó. Subir tras ellos no requiere prueba.',
        'SIGUIENTE: ver «El legado aguarda» y «Hilos del destino».',
      ],
    },
    {
      id: 'legado-9-ascension-interrumpida',
      title: 'Ascensión interrumpida',
      section: 'Carrera hacia la eternidad',
      type: 'narrative',
      readAloud: 'En el suelo yace el elegido (adapta el texto a su identidad), con la cabeza caída y el pecho cubierto de heridas sangrantes y de cabezas de clavos plateados. La inserción del entramado se ha cortado de forma traumática. Al veros, con las cuencas atravesadas por clavos, se convulsiona y grita que se haga ya. (L.182 / PDF 185)',
      content: [
        'ESCENA: si los PJ llegan a la sala final antes de que se active la Ascensión, describe a los supervivientes del Trío arrodillados en torno al elegido y lee o parafrasea el texto adaptado a quien sea la víctima.',
        'QUIÉN COLOCA EL CLAVO: si solo sobrevive el elegido, un operativo de Conrad aterrado coloca el Clavo de la Eternidad. Si no, lo hace un miembro superviviente: Bayron, tras tomar aire con dificultad, lo clava en Kwylliam o Lysarra proclamando que la audacia forja el mañana; Lysarra lo hunde con determinación en Bayron o Kwylliam, declarando que es hora de enmendar la historia; Kwylliam lo ensarta sin preámbulos en Bayron o Lysarra, comentando que la cosa se pondrá interesante.',
        'SEGUNDO TEXTO PARA LEER (resumido): el elegido se retuerce de agonía, los huesos restallan y la piel se estira hasta reventar entre gritos. Toda la caverna se sacude, caen rocas, estalla el pánico y el aire en torno al elegido se distorsiona con el brillo de una burbuja de velocidad. (L.182 / PDF 185)',
        'LA BURBUJA: la burbuja de velocidad de bendaleo dura una ronda; la monstruosidad hemalúrgica la aprovecha para romper el techo y subir a la cámara superior, seguida del resto del Trío. Los PJ que entren en la burbuja deben gastar 2 puntos de concentración o quedan Aturdidos. Seguirlos a la caverna siguiente no exige prueba.',
      ],
      branches: [
        { label: 'Solo sobrevive el elegido', description: 'Un operativo de Conrad aterrado coloca el Clavo de la Eternidad.' },
        { label: 'Ayuda de Bayron', description: 'Clava el Clavo en Kwylliam o Lysarra tras tomar aire con dificultad, proclamando que la audacia forja el mañana.' },
        { label: 'Ayuda de Lysarra', description: 'Hunde el Clavo en Bayron o Kwylliam con determinación, declarando que es hora de enmendar la historia.' },
        { label: 'Ayuda de Kwylliam', description: 'Ensarta el Clavo en Bayron o Lysarra sin preámbulos, comentando que la cosa se pondrá interesante.' },
      ],
    },
    {
      id: 'legado-9-el-legado-aguarda',
      title: 'El legado aguarda',
      section: 'Carrera hacia la eternidad',
      type: 'narrative',
      content: [
        'Quien ha ascendido no es un nuevo lord Legislador, sino una aberración monstruosa cargada de poder y de dolor que trepa hacia el exterior. Los otros del Trío, perplejos y sin alternativa, la acompañan.',
        'SIGUIENTE: la lucha se juega en «Libertad para los necios», pero antes corresponde «Hilos del destino», donde los legados de los PJ pesan en la batalla final.',
      ],
    },

    // ── Hilos del destino ────────────────────────────────────────────────────────────────
    {
      id: 'legado-9-hilos-del-destino',
      title: 'Hilos del destino',
      section: 'Hilos del destino',
      type: 'narrative',
      content: [
        'CONTEXTO: al cerrarse la aventura, las crónicas de los héroes de ambas eras se trenzan por última vez. Ten a mano las ayudas «Mi legado» que los jugadores completaron en el capítulo 4.',
        'PAREJAS DE LEGADO: cada jugador de la Era 1 se empareja con su contraparte de la Era 2; por ejemplo, el legado Noble corresponde al PJ Heredero. Los de la Era 1 podrán apoyar a sus parejas durante la batalla.',
        'DADOS: usa la tabla Dados de destino y legado para fijar cuántos d20 de legado tira cada jugador. Anotan los resultados en «Mi legado» y, una vez en el combate, pueden gastarlos con la capacidad Intervención de legado.',
      ],
      tables: [TABLA_DADOS_LEGADO],
    },
    {
      id: 'legado-9-intervencion-de-legado',
      title: 'Intervención de legado',
      section: 'Hilos del destino',
      type: 'narrative',
      content: [
        'PROCEDIMIENTO: cuando se usa Intervención de legado, la pareja de jugadores colabora así. (1) Dale al jugador de la Era 2 la ayuda «Mi legado» que escribió su pareja. (2) Que la lea en voz alta para recordar cuál fue el legado perdurable del PJ de la Era 1 (el jugador del Heredero lee la hoja del Noble, por ejemplo). (3) El jugador de la Era 1 cuenta cómo su legado se propagó por el tiempo, mediante hechos directos o indirectos, hasta afectar ahora a su pareja. (4) Entre ambos hilvanan la historia.',
        'CREATIVIDAD: sirve cualquier cadena de causas: una persona ayudada, una idea defendida, un objeto fabricado. El jugador de la Era 1 puede proponer una analepsis breve. Ejemplo del libro: el liderazgo pacífico del Funcionario inspira una norma que limita ciertas armas a las fuerzas del orden; el Vigilante de la ley, al formarse con menos opciones, afinó su puntería con un arma insólita y ahora logra un disparo imposible. Vía más directa: la armadura heredada del Novato, forjada con mimo por el Veterano, lo salva de un golpe letal; o basta con que el jugador de la Era 2 se inspire en una cita o reflexión de su pareja.',
        'RESOLUCIÓN: al acabar el relato, se aplica el efecto: el PJ de la Era 2 cambia su resultado por el de un dado de legado del PJ de la Era 1 (el que elija, si tiene varios).',
        'EL CRONISTA: si el Explorador se sirvió de los escritos del Cronista, o si este dejó anotado un consejo útil para la batalla final, el jugador del Cronista tira un dado de legado más.',
        'REGLA ESPECIAL, INTERVENCIÓN DE LEGADO: capacidad que tienen los PJ solo en el combate final. Una vez, cuando la pareja de la Era 2 haga una prueba o sea el objetivo de una prueba enemiga, el jugador de la Era 1 puede invocar el legado compartido y cambiar el d20 de esa prueba por uno de sus dados de legado anotados. Así el PJ de la Era 2 puede acertar o el enemigo fallar. Se decide viendo ya la tirada y aplicadas la ventaja o la desventaja, pero antes de que se resuelva la prueba. Cualquiera en la mesa puede sugerir usarla; decide el jugador de la Era 1.',
      ],
      tips: [
        'Conserva las ayudas «Mi legado» del capítulo 4: aquí se usan por última vez.',
      ],
    },

    // ── Libertad para los necios ─────────────────────────────────────────────────────────
    {
      id: 'legado-9-libertad-para-los-necios',
      title: 'Libertad para los necios',
      section: 'Libertad para los necios',
      type: 'narrative',
      content: [
        'META: impedir que la monstruosidad hemalúrgica salga a la superficie y siembre el caos. El resto del Trío se suma a la pelea con la esperanza de aniquilar por fin a los PJ. Antes de empezar, aplica «Ajustar la salud de los adversarios» y relee «Tácticas del Trío Dorado».',
        'AJUSTE DE SALUD: la monstruosidad combate junto a un máximo de otros dos miembros del Trío (Bayron Conrad, Kwylliam Elariel o Lysarra Tekiel, según quién viva). En esta escena, los no transformados pierden el rasgo Jefe y su salud inicial se toma de la tabla según cuántos del Trío sigan vivos.',
      ],
      tables: [TABLA_SALUD_AJUSTADA],
    },

    // ── Las ruinas de Luthadel ───────────────────────────────────────────────────────────
    {
      id: 'legado-9-las-ruinas-de-luthadel',
      title: 'Las ruinas de Luthadel',
      section: 'Las ruinas de Luthadel',
      type: 'combat',
      readAloud: 'Emergéis a una caverna inmensa donde entra la luz del sol por una grieta altísima. Entre el lodo asoman edificios de piedra en ruinas, con metales retorcidos que sobresalen de la roca en ángulos extraños: es la antigua Luthadel. Al este, una estatua de bronce y una fuente viejas entre escombros; al noreste, una catarata cae sobre los restos inclinados de una fortaleza noble; al norte, un edificio gigantesco y torcido está a punto de hundirse. Bajo la luz se alza una silueta enorme, de piel traslúcida, huesos desmesurados y cientos de clavos brillantes. Alza al sol sus ojos recién perforados, aúlla y echa a andar hacia la catarata: noventa metros de escalada hasta la libertad. (L.184 / PDF 187)',
      content: [
        'INICIO: la batalla arranca cuando el grupo sale del túnel donde está la criatura. Pon el mapa 9.2 y sitúa a la monstruosidad igual de lejos del túnel que de la catarata; los PJ se colocan a no más de 1,5 m de la boca del túnel.',
        'POSICIONES: tras una Ascensión interrumpida, describe cómo se despliega el resto del Trío: Bayron junto a los restos de la fuente, Kwylliam en las ruinas derrumbadas y Lysarra entre los edificios en ruinas próximos al túnel. Si la Ascensión se activó, ya están apostados, ocultos por ahora.',
        'OJOS DE HIERRO: si algún PJ oyó a Ojos de Hierro en el capítulo 8, evoca su aviso: un poder así podría arrasar una ciudad como Elendel. Que quede claro que la criatura no puede salir de la antigua Luthadel.',
        'TURNOS RÁPIDOS: movida por el odio y por un poder inestable, la criatura corre a la superficie. Mientras no reciba 30 puntos de daño ni un PJ gaste O para derribarla, en sus turnos rápidos avanza a la catarata y escala: cada Moverse (1) de escalada pide una prueba de Atletismo CD 15, aunque no cae si falla; la salida está a 90 m. Con una O, los PJ pueden hacerla perder el equilibrio y caer al suelo (1d6 de daño por golpe cada tres metros). Sube la apuesta en todas las pruebas de los PJ mientras escale.',
        'TURNOS LENTOS: recurre a Obtener ventaja (1) con Atletismo y, contra cualquier PJ al alcance, a Garras (1), Revés (1) o Propulsar metal (1); si nadie la ha atacado, la tercera acción puede ser Moverse (1) o Prevenirse (1) tras algún elemento del entorno.',
        'MONSTRUOSIDAD ENFURECIDA: al llegar a 30 puntos de daño o al caer al suelo (lo primero), olvida la fuga y se centra en el grupo hasta que muera el último PJ. Abre entonces el suceso «Perturbar el entramado».',
      ],
      tips: [
        'Ten preparados el registro del suceso Perturbar el entramado y la ayuda «Mi legado» de cada jugador.',
      ],
    },
    {
      id: 'legado-9-perturbar-el-entramado',
      title: 'Suceso: Perturbar el entramado',
      section: 'Las ruinas de Luthadel',
      type: 'combat',
      readAloud: 'Despacio, la criatura que fue [Bayron/Kwylliam/Lysarra] se gira y clava en vosotros su rabia incandescente. Como un latido, el clavo del centro de su cuerpo pulsa con fuerza; la carne ondea y se rehace, y deja ver las cabezas relucientes de otros clavos repartidos por todo el cuerpo. (L.185 / PDF 188)',
      content: [
        'EL SUCESO: crea un suceso positivo de cuatro casillas de Oportunidad; mide cuánto avanzan los PJ en arrancar el entramado y cortar la regeneración de la criatura.',
        'AVANCE: un PJ que consiga una Oportunidad atacándola puede gastarla para sumar 1. Además, quien pueda llegar hasta ella puede Usar una habilidad (1) y hacer una prueba de Atletismo, Medicina o Hurto contra su Defensa física (19); tienen ventaja los especialistas en Hemalurgo, y cada éxito suma 1.',
        'ACTIVACIÓN: con las cuatro casillas llenas, la monstruosidad deja de recuperar salud y, hasta el final de la escena, pierde el beneficio de su rasgo Clavo de la Eternidad. Texto para leer (resumen): la silueta deforme se convulsiona, aterrada, e intenta sujetar con las manos el Clavo de la Eternidad clavado en su pecho; la carne ya no se rehace. (L.185 / PDF 188)',
      ],
      branches: [
        { label: 'Gastar una Oportunidad al atacarla', description: 'Avanza el suceso en 1.' },
        { label: 'Usar una habilidad (1) contra Defensa física 19', description: 'Prueba de Atletismo, Medicina o Hurto; con la pericia Hemalurgo, ventaja. Con éxito, el suceso avanza en 1.' },
        { label: 'Suceso activado (4 casillas)', description: 'La monstruosidad no recupera salud y no puede usar su rasgo Clavo de la Eternidad el resto de la escena.' },
      ],
    },
    {
      id: 'legado-9-efectos-del-campo-de-batalla',
      title: 'Efectos del campo de batalla',
      section: 'Las ruinas de Luthadel',
      type: 'combat',
      content: [
        'Elementos con los que se puede interactuar durante el combate (mapa 9.2).',
        'FACHADAS: salientes y balcones forman varias alturas; trepar por ellas no exige prueba de Atletismo.',
        'RUINAS DERRUMBADAS: edificio hundido sobre sí mismo; para llegar a los balcones altos hay que cruzar madera podrida e inestable. Sube la apuesta en toda prueba aquí.',
        'CATARATA DE LA FORTALEZA ELARIEL: supera los noventa metros; nace de un afluente del Channerel y cae sobre las ruinas de la fortaleza.',
        'EDIFICIOS EN RUINAS: pequeñas construcciones inclinadas en ángulos absurdos porque el agua socavó sus bases.',
        'ESCOMBROS DE LA FUENTE: fuente rota y estatua de bronce antigua; tras ellos, Prevenirse (1) da cobertura.',
        'ARROYO: el agua de la catarata corre hacia una cueva al oeste; es terreno difícil, sin profundidad para obligar a nadar.',
      ],
      tables: [TABLA_OC_FINAL],
    },
    {
      id: 'legado-9-tacticas-del-trio-dorado',
      title: 'Tácticas del Trío Dorado',
      section: 'Las ruinas de Luthadel',
      type: 'combat',
      content: [
        'Los miembros del Trío que no se han transformado intervienen en la escena como sigue.',
        'BAYRON CONRAD: se planta tras los escombros de la fuente a la espera de estorbar con su acción ¡Granada! (2) y exige a gritos a la monstruosidad que «controle el poder». Está celoso de no ser el elegido, desbordado por el cambio y se obstina en negar que esto no estaba previsto. Si los PJ juegan con su inseguridad o sus celos, puede arremeter contra la criatura antes de huir.',
        'KWYLLIAM ELARIEL: hostiga a los PJ desde las ruinas derrumbadas; el espectáculo le divierte, pues ve la mutación como castigo ideal a la arrogancia de su socio. Ante un peligro inminente, tal vez se oculte hasta que pase.',
        'LYSARRA TEKIEL: está desconcertada: esperaba que el clavo fortaleciera a su socio, no que lo volviera un monstruo, y se jugó todo a esa carta. Dispara a los PJ desde los edificios en ruinas, que le dan cobertura, y trata con desesperación de hacer entrar en razón a su aliado transformado. Acorralada o ante un trato, podría rendir la lucha por pura supervivencia.',
      ],
      tips: [
        'Estos tres combatientes usan sus fichas del apéndice A como rivales: sin el rasgo Jefe y con la salud de la tabla Salud ajustada de los adversarios.',
      ],
    },
    {
      id: 'legado-9-repercusiones',
      title: 'Repercusiones',
      section: 'Las ruinas de Luthadel',
      type: 'choice',
      content: [
        'LA CRIATURA: pelea hasta el final; no admite salvación, diálogo ni cura.',
        'SI CAE: el cuerpo se contrae como el de un feruquimista que deja de almacenar fuerza, y el resto del Trío se rinde, exhausto. El grupo puede recoger el Clavo de la Eternidad (apéndice C) y se lleva dos clavos hemalúrgicos de rango 3 (ver «Clavos hemalúrgicos», capítulo 8 del Manual de Nacidos de la bruma), que concederán un poder de nacido del metal de los de la tabla Expulsión inestable de la criatura. Hallan también un clavo plateado de brillo escarlata y motas como de herrumbre: de trellium. Todo el equipo, los ingenios y los vehículos de la Élite Dorada valen al menos 4000 arquillas. Pasa a «Epílogo»; los PJ son ya de nivel 10.',
        'SI LOS PJ CAEN: la criatura escala y se pierde en el yermo de los Áridos del Norte. Quizá en semanas o meses logre someter el Clavo a su voluntad, o quizá vague como amenaza para Scadrial hasta que otros héroes se alcen.',
      ],
      branches: [
        { label: 'Los PJ vencen', description: 'El resto del Trío se rinde; el grupo recupera el Clavo, obtiene dos clavos hemalúrgicos de rango 3 y un clavo de trellium, y puede vender el equipo de la Élite Dorada por al menos 4000 arquillas. Sigue en «Epílogo».' },
        { label: 'Los PJ son derrotados', description: 'La monstruosidad escapa a los Áridos del Norte y quizá doblegue el Clavo o se convierta en una amenaza errante.' },
      ],
    },

    // ── Epílogo ──────────────────────────────────────────────────────────────────────────
    {
      id: 'legado-9-epilogo',
      title: 'Epílogo',
      section: 'Epílogo',
      type: 'narrative',
      readAloud: 'Al salir de las cavernas, el sol abrasador de los Áridos del Norte os golpea. Habéis resuelto enigmas de siglos, el Mapa Dorado y la Cripta de la Eternidad, habéis desenterrado un episodio oculto de Scadrial y habéis hecho frente a poderes antiguos que manos indignas manejaban. Hoy el mundo está a salvo, pero el mañana nunca es seguro: es frágil, es bello, y merece esperanza, lucha y sangre. ¿Qué haréis con el vuestro? (L.187 / PDF 190)',
      content: [
        'AL SALIR: el grupo puede escoltar a los supervivientes de la Élite Dorada hasta Elendel. Falta decidir el destino del Clavo de la Eternidad; la escena opcional «Postludio» propone una salida.',
        'NEBAAL Y WILKO: si NeBaal no bajó con los PJ, los espera fuera; si no liberaron a Wilko, ella logró escapar cuando las fuerzas del Trío se dispersaron. Si los PJ casi no se esforzaron por NeBaal o Wilko, se puede tirar el dado de trama para cada PNJ: una Complicación implica una tirada de lesión (ver el capítulo 9 del Manual de Nacidos de la bruma).',
        'CIERRE: antes de terminar, juega escenas cortas para que los PJ asimilen lo logrado y lo celebren con sus aliados. Pregunta a cada jugador con qué PNJ quiere charlar y apóyate en las ideas siguientes.',
        'EL CONTRATO DE NEBAAL: elle se muestra introspective. Ha llegado muy lejos desde que su única meta era cumplir el Contrato de Vadilek; no imaginó cuánto cambiaría Scadrial, ni que el Clavo marcaría su vida para siempre, ni la cruel ironía de un poder imposible de controlar.',
        'MISIÓN CUMPLIDA PARA WILKO: aun con el peligro, está convencida de que ella y los PJ han cambiado el mundo. Desea seguir con ellos, ayudar a que los Guardianes crezcan (más aún si Merid murió) y explorar la antigua Luthadel en busca de más historia.',
        'OTROS PNJ: K. T., Marthis y Merid, si siguen vivos, no salen de su asombro. Todos serían excelentes compañeros de rango 2 (ver «Compañeros», capítulo 8 del Manual de Nacidos de la bruma). Merid puede ofrecer ahora el ingreso en los Guardianes, si no lo hizo antes.',
      ],
    },
    {
      id: 'legado-9-el-futuro-del-clavo',
      title: 'El futuro del Clavo de la Eternidad',
      section: 'Epílogo',
      type: 'choice',
      content: [
        'El «Postludio» (opcional) da a los jugadores una solución duradera para custodiar el Clavo y, de paso, ganchos para nuevas aventuras. Úsalo, adáptalo o deja que los PJ decidan: ¿lo depositan en los Archivos Nacionales o lo confían a los Guardianes? Cada mesa responderá a su manera.',
        'La aventura termina aquí, pero la historia puede seguir: ver «Continuar la campaña».',
      ],
      branches: [
        { label: 'Aplicar el Postludio', description: 'Ojos de Hierro propone custodiar el Clavo (ver «Postludio»).' },
        { label: 'Que decidan los PJ', description: 'Pueden guardarlo en los Archivos Nacionales, confiarlo a los Guardianes u optar por otra solución.' },
      ],
    },
    {
      id: 'legado-9-postludio',
      title: 'Postludio',
      section: 'Epílogo',
      type: 'choice',
      readAloud: 'Muerte se alza ante vosotros: Ojos de Hierro, el último inquisidor, una figura de leyenda, os observa con los ojos atravesados por clavos y una expresión imposible de leer. Os llama portadores de la Eternidad, os agradece el gran servicio prestado a Scadrial y os pide otro: que le entreguéis el clavo para custodiarlo hasta el día en que su poder pueda usarse sin peligro. Tiende la mano y aclara que es una petición, no una orden; si accedéis, tendréis el favor de Armonía y el suyo. (L.188 / PDF 191)',
      content: [
        'MOMENTO: escena opcional, posible en cualquier punto tras vencer a la monstruosidad, cuando todos los PJ viajen juntos con el Clavo. Se les aproxima una figura de negro: Ojos de Hierro (ver «Un encuentro con Muerte», capítulo 8), tenido por muchos como la encarnación de la muerte.',
        'SI RECHAZAN: se va decepcionado. Es probable que otras facciones (el Grupo, los Sangre Espectral) se interesen por el Clavo, y de ahí podrían surgir nuevas aventuras.',
        'SI ACEPTAN: pueden adoptar a Armonía como patrocinador, que les encargará misiones. Además Ojos de Hierro se fija en ellos y acudirá cuando un PJ esté a punto de morir.',
      ],
      branches: [
        { label: 'Entregan el Clavo', description: 'Armonía se convierte en patrocinador del grupo y le asigna misiones futuras; Ojos de Hierro acudirá en ayuda del próximo PJ en peligro mortal.' },
        { label: 'Se niegan', description: 'Ojos de Hierro se va decepcionado; otras facciones, como el Grupo y los Sangre Espectral, pueden interesarse por el Clavo.' },
      ],
    },

    // ── Continuar la campaña ─────────────────────────────────────────────────────────────
    {
      id: 'legado-9-continuar-la-campana',
      title: 'Continuar la campaña',
      section: 'Continuar la campaña',
      type: 'narrative',
      content: [
        'Al vencer a la monstruosidad, los PJ suben a nivel 10. Scadrial ofrece muchas aventuras.',
        'IDEAS DEL LIBRO: indagar el origen del clavo de trellium hallado en el entramado de la criatura, con posible choque con el Grupo; seguir guiando a NeBaal para que se reintegre en la sociedad kandra de la Era 2; investigar con la profesora Wilko otros enigmas del pasado de Scadrial; acompañar a Yunque para reparar los daños de la Élite Dorada; o unirse a los Guardianes, pilotar un dirigible e impulsar su causa por toda la Cuenca de Elendel.',
      ],
    },
  ],

  npcs: [
    {
      name: 'NeBaal',
      pronouns: 'elle',
      type: 'Kandra de la sexta generación, aliade de los PJ (rival de rango 2 en el apéndice A)',
      role: 'ally',
      traits: ['desconfiade', 'curiose', 'morbose'],
      goal: 'Detener a la Élite Dorada y aprender a confiar de nuevo.',
      appearance: 'En la Era 2 prefiere los cuerpos masculinos y cambia de forma a menudo, aunque suele volver a los huesos que los PJ le entregaron al principio del capítulo 6.',
      notes: 'Se pronuncia «nee-BAHL». Insiste en viajar con el grupo: le inquieta Wilko y se siente responsable de todo lo ocurrido; evoca las hazañas de los PJ de la Era 1 y dice que no puede quedarse mirando. Si los PJ tienen buena relación con elle, jura en voz baja que luchará en persona contra la Élite Dorada si hace falta, algo que va contra los tabúes kandra. Si guía a los PJ por los túneles, se borra 1 casilla del suceso Ascensión. Si el empeño «Antigua Luthadel» sale mal, se separa para distraer al enemigo; si el grupo no rescata a Wilko, va a por ella. En el epílogo se muestra introspective sobre su Contrato con Vadilek.',
    },
    {
      name: 'Azmine Wilko',
      pronouns: 'ella',
      type: 'Profesora de la Universidad de Elendel y Guardiana de bajo rango, de sangre koloss (rival de rango 1 en el apéndice A)',
      role: 'ally',
      traits: ['respetuosa', 'con mentalidad histórica', 'diligente'],
      goal: 'Usar el conocimiento del pasado para mejorar el futuro.',
      appearance: 'Mujer de sangre koloss, de piel gris azulada, mandíbula suave y pelo ondulado recogido. Viste traje de tweed y lleva un maletín de cuero modificado.',
      notes: 'Se pronuncia «AZ-meen WILL-koh». Rehén del Trío Dorado: se quedaron con su diario de notas sobre el Mapa Dorado y la retienen en una tienda del extremo oeste del campamento. Cuando los PJ llegan, intenta huir cortando la lona con una lima. Aterrada, acompaña al grupo a la cripta si se lo piden. Miente fatal. En el epílogo cree que su grupo ha marcado una diferencia y quiere seguir con ellos y ayudar a que crezcan los Guardianes.',
    },
    {
      name: 'Merid',
      pronouns: 'él',
      type: 'Vigilante de la ley terrisano de los Áridos y miembro de los Guardianes',
      role: 'ally',
      traits: ['sincero', 'idealista', 'decidido'],
      goal: 'Evitar que el Clavo de la Eternidad caiga en malas manos.',
      appearance: 'Vigilante de la ley terrisano y alto, de piel color terracota, con pendientes y brazaletes de plata. Bajo un guardapolvo verde oliva lleva camisa abotonada y cartuchera.',
      notes: 'Se pronuncia «MARE-id». Si sobrevivió, entrega a los PJ los planos de la Cripta de la Eternidad, con las marcas de las trampas, y compromete la ayuda de los Guardianes; además da ventaja en las pruebas de transporte de «Hacia las ruinas» y ofrece un dirigible experimental. En el epílogo, si sobrevivió, puede invitar a los PJ a unirse a los Guardianes (si no lo hizo antes) y es un buen compañero de rango 2.',
    },
    {
      name: 'Wynn Letrelle',
      pronouns: 'elle',
      type: 'Archivere de los Archivos Nacionales y Guardián (consejere)',
      role: 'ally',
      traits: [],
      goal: 'Ayudar a los PJ en nombre de los Guardianes.',
      appearance: 'Archivere con túnica verde (descripción del capítulo 5).',
      notes: 'Se pronuncia «WIN». Si Merid murió, acude en su lugar a ver a los PJ antes de que partan y les entrega igualmente los planos de la cripta, aunque la sociedad secreta de los Guardianes está sumida en el caos y no puede ofrecer más ayuda.',
    },
    {
      name: 'K. T. Quiven',
      pronouns: 'ella',
      type: 'Estudiante de Periodismo e informadora (rival de rango 1 en el apéndice A)',
      role: 'ally',
      traits: ['valiente', 'astuta', 'tenaz'],
      goal: 'Sacar a la luz los secretos de la Orden de los Mil Ojos (en este capítulo, seguir infiltrada entre las tropas del Trío).',
      appearance: 'Mujer morena de pelo ondulado y piel clara, de aire intenso, con sombrero, tirantes y zapatos caros. En la cripta va disfrazada de ingeniera de Conrad.',
      notes: 'Se pronuncia «KAY-TEE KWI-ven». Antes de la salida, los PJ no logran encontrarla: en su cuarto hay uniformes robados de Industrias Conrad y notas sobre el vagón de Lysarra, que pueden llevar al andén del Sótano 1. En T8 está infiltrada entre las tropas del Trío y tres operativos le han ordenado comprobar las trampas, para las que no tiene formación; si los PJ la ayudan, les da un cartucho de dinamita. En el epílogo, si sobrevivió, es un buen compañero de rango 2.',
    },
    {
      name: 'Marthis Elariel/Tekiel',
      pronouns: 'él',
      type: 'Estudiante universitario, descendiente de Anastas y aspirante de una sociedad (secuaz de rango 1 en el apéndice A)',
      role: 'ally',
      traits: ['crédulo', 'torpe', 'machito'],
      goal: 'Superar las Pruebas de Medianoche y enorgullecer a sus padres.',
      appearance: 'Joven fornido de piel cobriza, nariz aguileña y cabello negro con un corte impecable.',
      notes: 'Se pronuncia «MAR-this». Si los PJ lo salvaron, les cuenta lo que averiguó de los preparativos de Lysarra para viajar a la antigua Luthadel (ruta prevista y clima seco), lo que da 1 éxito gratuito en el empeño «Hacia las ruinas». En el epílogo, si sobrevivió, es un buen compañero de rango 2.',
    },
    {
      name: 'Yunque (Elanda Wilko)',
      pronouns: 'ella',
      type: 'Líder koloss de los Marca de Hierro (rival de rango 2 en el apéndice A)',
      role: 'neutral',
      traits: ['confiada', 'decidida', 'violenta'],
      goal: 'Establecer los Áridos como una nación independiente.',
      appearance: 'Mujer koloss de color azul intenso y dos metros y quince centímetros de altura, con una enorme coraza de hierro, un gran escudo de acero, joyas arrebatadas a nobles en orejas, cuello y nudillos, y la cabeza calva cubierta de tatuajes y cicatrices.',
      notes: 'Se pronuncia «eh-LAHN-dah WILL-koh». En T1 vigila con tres Marca de Hierro (si murió, un protector del clan koloss ocupa su lugar), salvo que los PJ la pusieran contra Bayron en el capítulo 7, en cuyo caso la sala está vacía. Si el grupo la combatió en el capítulo 7, los Marca de Hierro atacan al verlos; si no, desconfían del Trío. Gasta concentración para resistir los argumentos que los PJ ya usaron en el capítulo 7, pero atiende pruebas nuevas y puede retirarse o ayudar a cambio de un trato mejor. Es prima de la profesora Wilko, que lo ignora. En el epílogo se sugiere unirse a ella para reparar los daños de la Élite Dorada.',
    },
    {
      name: 'Bayron Conrad',
      pronouns: 'él',
      type: 'Jefe rango 1 – Humanoide Mediano (en la batalla final, rival sin el rasgo Jefe)',
      role: 'villain',
      traits: ['torpe', 'decidido', 'inseguro'],
      goal: 'Ganarse el respeto de la alta sociedad.',
      appearance: 'Joven de unos veinticinco años, de mirada penetrante, ojos separados, piel cobriza y cabello rubio oscuro partido al medio. Viste camisa abotonada con las mangas arremangadas y pantalón de trabajo.',
      notes: 'Se pronuncia «BAY-ron KON-rad». Fundador de Industrias Conrad e integrante del Trío Dorado. En la batalla final se coloca tras los escombros de la fuente y entorpece a los PJ con su acción ¡Granada! (2), mientras grita a la monstruosidad que domine su poder. Siente celos por no haber sido el elegido y se niega a admitir que aquello no estaba previsto; si los PJ juegan con su inseguridad o sus celos, puede atacar con furia a la propia monstruosidad antes de huir. Si es el elegido, se transforma en la monstruosidad.',
    },
    {
      name: 'Kwylliam Elariel',
      pronouns: 'él',
      type: 'Jefe rango 2 – Humanoide Mediano (en la batalla final, rival sin el rasgo Jefe)',
      role: 'villain',
      traits: ['provocador', 'displicente', 'libertino'],
      goal: 'Acaparar la atención de todos y mantener la vida entretenida.',
      appearance: 'Noble alto y larguirucho de unos veinticinco años, de pómulos pronunciados, tez morena y pelo revuelto color tierra; ropa llamativa y gesto de diversión constante.',
      notes: 'Se pronuncia «KWIL-ee-um eh-LAIR ee-al». Integrante del Trío Dorado. En la batalla final se coloca en las ruinas derrumbadas y hostiga a los PJ; el espectáculo le divierte, pues cree que la mutación es el castigo ideal para la arrogancia de su socio, y ante un peligro inminente tal vez se esconda hasta que pase. Si es el elegido, se transforma en la monstruosidad.',
    },
    {
      name: 'Lysarra Tekiel',
      pronouns: 'ella',
      type: 'Jefe rango 2 – Humanoide Mediano (en la batalla final, rival sin el rasgo Jefe)',
      role: 'villain',
      traits: ['serena', 'calculadora', 'perspicaz'],
      goal: 'Restaurar el estatus de la familia Tekiel.',
      appearance: 'Mujer angulosa de unos veinticinco años, de mirada penetrante, pelo oscuro con elegantes rizos hacia un lado y un rostro de porcelana afilado; vestimenta sobria y de confección exquisita.',
      notes: 'Se pronuncia «lye-SAR-uh TEE-kee-ehl». Integrante del Trío Dorado: suele ser la persona más lista de cualquier sala y solo es leal a sí misma. Su pareja es la capitana Eliane Vorn. Financió casi un año la excavación secreta de la antigua Luthadel. En la batalla final se cubre en los edificios en ruinas mientras dispara a los PJ y trata de razonar con su aliado transformado; desconcertada porque esperaba que el clavo lo fortaleciera, si se ve acorralada o le ofrecen un trato podría abandonar la lucha. Si es la elegida, se transforma en la monstruosidad.',
    },
    {
      name: 'Monstruosidad hemalúrgica',
      pronouns: 'ella',
      type: 'Jefe rango 2 – Humanoide Grande (apéndice A)',
      role: 'villain',
      traits: ['consumida por el odio', 'dolor y poder desbordados', 'inestable'],
      goal: 'Escapar por la catarata hasta la superficie (a 90 m) y, ya enfurecida, matar a todos los PJ.',
      appearance: 'Forma enorme de piel traslúcida que deja ver huesos demasiado largos y músculos ondulantes y antinaturales, salpicada de clavos relucientes; los ojos, recién perforados por clavos. Un clavo en el centro del cuerpo pulsa como un latido y regenera la carne.',
      notes: 'Es el elegido del Trío transformado (Bayron, Kwylliam o Lysarra); el libro la trata en femenino («la criatura») sea quien sea. No admite salvación, diálogo ni cura: lucha hasta la muerte. Mientras no sufra 30 puntos de daño ni caiga, trepa hacia la catarata; después se centra en los PJ. Su regeneración (rasgo Clavo de la Eternidad) se anula al activarse el suceso Perturbar el entramado. Salud 160 (190 si es el único miembro del Trío vivo); Defensa física 19. Si cae, deja el Clavo, dos clavos hemalúrgicos de rango 3 y un clavo de trellium. Si los PJ caen, huye a los Áridos del Norte.',
    },
    {
      name: 'Ojos de Hierro',
      pronouns: 'él',
      type: 'Inquisidor de acero, emisario de Armonía y encarnación de la muerte (antes se llamó Marsh)',
      role: 'special',
      traits: [],
      goal: 'Custodiar el Clavo de la Eternidad hasta que su poder pueda usarse con seguridad.',
      appearance: 'Figura vestida de negro, con gabán y sombrero, y clavos de acero donde deberían estar los ojos: el izquierdo muy hundido en la cuenca y rodeado de cicatrices y densos tatuajes negros.',
      notes: 'Su aviso en el capítulo 8 (tanto poder podría arrasar una ciudad como Elendel) se recuerda antes de la batalla final. En el «Postludio» pide a los PJ el Clavo como petición, no como orden, a cambio del favor de Armonía y el suyo; si se niegan, se marcha decepcionado, y si aceptan, Armonía pasa a ser su patrocinador y Ojos de Hierro acudirá en ayuda del próximo PJ en peligro mortal.',
    },
  ],

  combats: [
    {
      id: 'legado-9-combate-rescate-wilko',
      title: 'Rescatar a Wilko: guardias de la tienda',
      enemies: [
        { name: 'Mataneblino', count: '2', bonus: 'El libro los llama «matones de los Morgenthax (mataneblinos)». Solo hay combate si el empeño «Antigua Luthadel» fracasó: son los dos que NeBaal no logra apartar, de un grupo de cinco maleantes.' },
      ],
      specialRules: [
        'Si el empeño «Antigua Luthadel» tuvo éxito, la tienda la custodian dos matones aburridos que juegan a las cartas: basta una prueba para entrar (Engaño CD 14 o Hurto CD 13, con ventaja) y no hay combate.',
        'Si fracasó, el señuelo de NeBaal aparta a tres de los cinco maleantes de los Morgenthax y los otros dos atacan a los PJ nada más verlos.',
        'Dentro, Wilko intenta huir cortando la lona con una lima; informa de que el Trío le quitó el diario y bajó a los túneles.',
      ],
    },
    {
      id: 'legado-9-combate-t1-centinelas',
      title: 'T1: Centinelas forajidos',
      mapRef: '9.1',
      enemies: [
        { name: 'Luchador por la libertad', count: '3', bonus: 'Son los Marca de Hierro' },
        { name: 'Yunque', count: '1', bonus: 'Si murió, un protector del clan koloss ocupa su lugar' },
      ],
      specialRules: [
        'Si los PJ pusieron a Yunque contra Bayron en el capítulo 7, la sala está vacía.',
        'Si el grupo se enfrentó a Yunque en el capítulo 7, los Marca de Hierro atacan al verlos; si no, desconfían del Trío y negociarán.',
        'Yunque gasta concentración para resistir los argumentos del capítulo 7, pero atiende argumentos nuevos y puede retirarse o ayudar a cambio de un trato mejor.',
        'Trampas: se activan con normalidad. Después, los Marca de Hierro que sigan en pie están asustados y los PJ tienen ventaja al negociar.',
      ],
    },
    {
      id: 'legado-9-combate-t2-perforadora',
      title: 'T2: Operación de perforación',
      mapRef: '9.1',
      enemies: [
        { name: 'Operativo de Conrad', count: '2', bonus: 'Vigilan la entrada sur (desventaja en Sigilo desde ese lado)' },
      ],
      specialRules: [
        'Perforadora: máquina de vapor Tekiel de 7,5 por 3 m con gran cabezal de taladro. Su caldera de carbón tarda 1 ronda en calentarse; luego avanza y perfora la roca hasta 1,5 m por ronda. Defensa física 18, salud 50, valor de desvío 3.',
        'Manejarla: pericia Ingeniería o prueba de Deducción CD 18 (ventaja si se vieron los planos en el capítulo 8).',
        'Trampas: solo dañan a la perforadora; con 10 o más puntos de daño se bloquea y requiere una prueba de Manufactura CD 16 para repararla.',
      ],
    },
    {
      id: 'legado-9-combate-t3-ingenieros',
      title: 'T3: Ingenieros',
      mapRef: '9.1',
      enemies: [
        { name: 'Ingeniero de Conrad', count: '3', bonus: 'Uno porta una granada alomántica con alomancia de hierro ya infundida (3 de Investidura)' },
      ],
      specialRules: [
        'Hay un risco de 6 m al norte de la zona (prueba de Atletismo CD 14 para sortearlo; fallo: 1d6 de daño por golpe).',
        'Trampas: se activan con normalidad. Después, los ingenieros que queden están despistados y las pruebas de los PJ contra ellos, como Sigilo, tienen ventaja.',
      ],
    },
    {
      id: 'legado-9-combate-t4-explosivos',
      title: 'T4: Expertos en explosivos',
      mapRef: '9.1',
      enemies: [
        { name: 'Ingeniero de Conrad', count: '2', bonus: 'Instalan tres minas terrestres (apéndice B)' },
        { name: 'Operativo de Conrad', count: '2', bonus: 'A 3 m, vigilan un alijo: una escopeta, dos granadas de conmoción y otras dos minas' },
      ],
      specialRules: [
        'Trampas: se activan con normalidad.',
        'Si cae cualquiera de los ingenieros de Conrad, las tres minas detonan y el túnel de T4 se hunde en parte: 2d6 de daño por golpe por el derrumbe, sumado al de minas y trampas.',
        'Tras las trampas, los operativos que queden protegen el alijo con miedo.',
      ],
    },
    {
      id: 'legado-9-combate-francotiradores',
      title: 'T5, T7 y T9: Francotiradores de élite',
      mapRef: '9.1',
      enemies: [
        { name: 'Operativo de élite de Conrad', count: '3', bonus: 'Un francotirador en cada túnel (T5, T7 y T9)' },
      ],
      specialRules: [
        'La primera vez que cada PJ entra en el túnel, el francotirador tira Sigilo contra su Defensa espiritual; si gana, sigue oculto y el PJ no lo percibe hasta que dispare o se delate.',
        'Trampas: se activan con normalidad.',
      ],
    },
    {
      id: 'legado-9-combate-t6-morgenthax',
      title: 'T6: Emboscada de los Morgenthax',
      mapRef: '9.1',
      enemies: [
        { name: 'Mataneblino', count: '2', bonus: 'Asesinos de los Morgenthax' },
        { name: 'Matón', count: '2' },
        { name: 'Mataneblino de Élite', count: '1', bonus: 'Líder del equipo; lleva armadura de placas de madera' },
      ],
      specialRules: [
        'Aguardan en un estrechamiento, atentos a la alomancia y al grupo.',
        'Hay un risco de 6 m al este de la zona (Atletismo CD 14 para sortearlo; fallo: 1d6 de daño por golpe).',
        'Trampas: se activan con normalidad.',
      ],
    },
    {
      id: 'legado-9-combate-t8-desactivacion',
      title: 'T8: Desactivación bajo presión',
      mapRef: '9.1',
      enemies: [
        { name: 'Operativo de Conrad', count: '3', bonus: 'Han mandado a K. T. Quiven (informadora disfrazada de ingeniera) a buscar trampas' },
      ],
      specialRules: [
        'Las trampas de esta zona siguen intactas y K. T. está a punto de dispararlas.',
        'Si los PJ ayudan a K. T., ella les da un cartucho de dinamita.',
      ],
    },
    {
      id: 'legado-9-combate-monstruosidad',
      title: 'Libertad para los necios: batalla final en las ruinas de Luthadel',
      mapRef: '9.2',
      enemies: [
        { name: 'Monstruosidad hemalúrgica', count: '1', bonus: 'Es el elegido del Trío transformado. Salud 160 (190 si es el único miembro del Trío vivo). Defensa física 19.' },
        { name: 'Bayron Conrad', count: '1', bonus: 'Si no es el elegido y sigue vivo. Sin el rasgo Jefe: salud 50 (con 3 miembros del Trío vivos) o 75 (con 2).' },
        { name: 'Kwylliam Elariel', count: '1', bonus: 'Si no es el elegido y sigue vivo. Sin el rasgo Jefe: salud 50 (con 3 miembros del Trío vivos) o 75 (con 2).' },
        { name: 'Lysarra Tekiel', count: '1', bonus: 'Si no es la elegida y sigue viva. Sin el rasgo Jefe: salud 50 (con 3 miembros del Trío vivos) o 75 (con 2).' },
      ],
      specialRules: [
        'Preparativos: la monstruosidad lucha junto a un máximo de otros dos miembros del Trío. Los PJ empiezan a menos de 1,5 m de la entrada del túnel; la criatura está igual de lejos del túnel que de la catarata.',
        'Primera fase: hasta que sufra 30 puntos de daño o un PJ gaste O para derribarla, la monstruosidad usa turnos rápidos para trepar por la catarata. Cada Moverse (1) de escalada exige Atletismo CD 15, pero no cae si falla; la salida está a 90 m. Una caída causa 1d6 de daño por golpe por cada tres metros. Mientras escala, sube la apuesta en todas las pruebas de los PJ. En los turnos lentos usa Obtener ventaja (1) con Atletismo y ataca con Garras (1), Revés (1) o Propulsar metal (1); si nadie la ha atacado, puede Moverse (1) o Prevenirse (1) tras un elemento del entorno.',
        'Monstruosidad enfurecida: tras 30 puntos de daño o al caer al suelo, se centra en los PJ y no intenta escapar hasta que todos estén muertos. Abre el suceso Perturbar el entramado (4 casillas de Oportunidad; Oportunidad al atacarla o prueba de Atletismo, Medicina o Hurto contra Defensa física 19, con ventaja para la pericia Hemalurgo). Al llenarlo, no recupera salud ni usa su rasgo Clavo de la Eternidad.',
        'Intervención de legado: una vez por jugador de la Era 1, cambia el d20 de una prueba de su pareja de la Era 2 (o de una prueba enemiga contra ella) por un dado de legado anotado; cada jugador tiene 1d20, 2d20 o 3d20 según «Amanecer rojo en Luthadel» (el Cronista, un dado extra si sus escritos ayudaron).',
        'Campo de batalla (mapa 9.2): fachadas de edificios (se trepa sin prueba de Atletismo), ruinas derrumbadas (sube la apuesta en toda prueba), catarata de la Fortaleza Elariel (más de 90 m), edificios en ruinas, escombros de la fuente (Prevenirse (1) da cobertura) y arroyo (terreno difícil, sin necesidad de nadar).',
        'Bayron: tras los escombros de la fuente, ¡Granada! (2), celoso e inseguro; puede atacar a la monstruosidad antes de huir. Kwylliam: hostiga desde las ruinas derrumbadas y se esconde si el peligro es inminente. Lysarra: dispara cubierta por los edificios en ruinas y trata de razonar con la monstruosidad; puede abandonar si la acorralan o le ofrecen un trato.',
        'La monstruosidad no admite salvación, diálogo ni cura: lucha hasta la muerte.',
      ],
      rewards: 'Si la monstruosidad cae, el resto del Trío se rinde. Los PJ pueden recoger el Clavo de la Eternidad (apéndice C), se llevan dos clavos hemalúrgicos de rango 3 (con un poder de nacido del metal de la tabla Expulsión inestable) y un clavo hemalúrgico de trellium; el equipo, los ingenios y los vehículos de la Élite Dorada valen al menos 4000 arquillas. Los PJ suben a nivel 10.',
      tables: [TABLA_SALUD_AJUSTADA, TABLA_OC_FINAL],
    },
  ],

  maps: [
    {
      id: '9.1',
      title: 'La caverna de la cripta',
      pdfPage: 182,
      imagePath: '/maps/legado/map_p182.webp',
      scale: '1 casilla = 1,5 m',
      locations: [
        'T1: Centinelas forajidos (entrada suroeste; comunica con T4)',
        'T2: Operación de perforación (entrada sur; comunica con T3 y T4)',
        'T3: Ingenieros (entrada sureste; comunica con T2 y T5; nivel inferior; risco al norte)',
        'T4: Expertos en explosivos (comunica con T1, T2, T6, T7 y T8)',
        'T5: Francotirador de élite (comunica con T3, T8 y T9)',
        'T6: Emboscada de los Morgenthax (comunica con T4 y S1; nivel inferior; risco al este)',
        'T7: Francotirador de élite (comunica con T4 y S2)',
        'T8: Desactivación bajo presión (comunica con T4, T5 y T9)',
        'T9: Francotirador de élite (comunica con T5, T8 y S2)',
        'S1: caverna tras la antigua catarata (nivel inferior; posible ubicación del estuche del Clavo y del Trío)',
        'S2: caverna donde el Trío puede preparar la Ascensión (posible ubicación del estuche del Clavo)',
        'Antigua catarata (seca; la entrada a S1 está derrumbada)',
        'Riscos de 6 m (norte de T3 y este de T6)',
      ],
      notes: 'Mazmorra de «Carrera hacia la eternidad». Las entradas son la suroeste (T1), la sur (T2, túnel nuevo de la perforadora) y la sureste (T3). Las trampas de la Era 1 se marcan sobre este mapa según el plano del capítulo 4.',
    },
    {
      id: '9.2',
      title: 'Ruinas de la antigua Luthadel',
      pdfPage: 188,
      imagePath: '/maps/legado/map_p188.webp',
      scale: '1 casilla = 1,5 m',
      locations: [
        'Túnel (entrada de los PJ, a menos de 1,5 m al inicio)',
        'Escombros de la fuente (fuente agrietada y estatua de bronce; cobertura; posición de Bayron)',
        'Ruinas derrumbadas (edificio colapsado; posición de Kwylliam)',
        'Catarata de la Fortaleza Elariel (por donde trepa la monstruosidad; 90 m)',
        'Fachada de edificio (dos, con balcones y salientes)',
        'Edificios en ruinas (posición de Lysarra)',
        'Arroyo (terreno difícil que fluye hacia una cueva al oeste)',
      ],
      notes: 'Mapa de la batalla final. La monstruosidad empieza a la misma distancia del túnel que de la catarata. Los PJ empiezan a menos de 1,5 m de la entrada del túnel.',
    },
  ],
}
