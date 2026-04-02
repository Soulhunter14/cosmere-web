import type { ActivationType } from '../components/TalentActivation'

export interface HeroicPathSpecialty {
  name: string
  description: string
  keyTalents: { name: string; activation: ActivationType; description: string }[]
}

export interface HeroicPath {
  id: string
  name: string
  definition: string
  initialSkill: string
  mainTalent: string
  mainTalentEffect: string
  recommendedAttributes: string[]
  recommendedSkills: string[]
  specialties: HeroicPathSpecialty[]
  color: string
  colorBg: string
  colorBorder: string
  icon: string
}

export const HEROIC_PATHS: HeroicPath[] = [
  {
    id: 'agente',
    name: 'Agente',
    definition: 'Artistas de la duplicidad y el sabotaje, los Agentes agarran los hilos del destino en sus manos y esperan el momento perfecto para tirar. Pueden engañar incluso a los más prudentes con sus astutas artimañas, movimientos veloces y ataques calculados. Solo responden ante su propio código.',
    initialSkill: 'Perspicacia',
    mainTalent: 'Oportunista',
    mainTalentEffect: 'Una vez por ronda, cuando tiras un dado de trama, puedes repetir la tirada. La tirada original no tiene efecto y debes utilizar el nuevo resultado.',
    recommendedAttributes: ['Discernimiento', 'Intelecto', 'Velocidad'],
    recommendedSkills: ['Agilidad', 'Armamento ligero', 'Deducción', 'Engaño', 'Hurto', 'Perspicacia'],
    specialties: [
      {
        name: 'Investigador',
        description: 'Las corazonadas son poco fiables, pero los Investigadores cultivan instintos infalibles, aprendiendo a escuchar, colaborar y buscar respuestas a preguntas que a los demás no se les ocurren.',
        keyTalents: [
          { name: 'Haz que hablen', activation: 'action2', description: 'Gasta 1 concentración para hacer una prueba de Deducción contra Espiritual y averiguar las motivaciones del objetivo. Durante la escena, puedes subir la apuesta aprovechándote de esas motivaciones.' },
          { name: 'Recopilar pruebas', activation: 'passive', description: 'Obtienes pericia en Códigos legales. Cuando superas una prueba cognitiva contra un objetivo, pasas a estar Concentrado.' },
          { name: 'Instintos de sabueso', activation: 'passive', description: 'Obtienes ventaja en pruebas cognitivas contra personajes de los que conoces su motivación; sabes cuándo te están mintiendo.' },
          { name: 'Cerrar el caso', activation: 'action3', description: 'Gasta 3 concentración para hacer prueba de Deducción contra Cognitiva del objetivo. Si la superas, se echa atrás.' },
        ],
      },
      {
        name: 'Espía',
        description: 'Para conseguir lo que necesitan, los Espías se ponen en situaciones complicadas, listos para desviar o reducir las sospechas cuando, inevitablemente, se posan sobre ellos.',
        keyTalents: [
          { name: 'Excusa plausible', activation: 'special', description: 'Preparas coartadas y tapaderas que te permiten salir de situaciones comprometidas con una prueba de Engaño.' },
          { name: 'Fachada volátil', activation: 'special', description: 'Puedes adoptar una identidad encubierta; mientras la mantienes, obtienes ventajas en Engaño relacionadas con esa identidad.' },
          { name: 'Análisis rápido', activation: 'free', description: 'Gasta 2 concentración para obtener 2 acciones adicionales para pruebas cognitivas con Usar una habilidad, Obtener ventaja o talentos de Agente.' },
          { name: 'Torvo', activation: 'passive', description: 'Para resistirse a tu influencia, un personaje debe gastar concentración adicional equivalente a tu rango.' },
        ],
      },
      {
        name: 'Ladrón',
        description: 'Aunque una mente rápida es un activo de valor incalculable, los Ladrones entrenan su cuerpo para seguir el ritmo. Lo arriesgan todo para superar las dificultades imposibles que se interponen entre ellos y su premio.',
        keyTalents: [
          { name: 'Golpe bajo', activation: 'action1', description: 'Ataque con arma improvisada o sin armas a Cognitiva. El objetivo queda Sorprendido si impactas.' },
          { name: 'Comportamiento arriesgado', activation: 'special', description: 'Puedes subir la apuesta en pruebas de Hurto o Agilidad; si sufres una Complicación, reduces su severidad.' },
          { name: 'Paso sombrío', activation: 'free', description: 'Puedes moverte hasta la mitad de tu valor de movimiento como acción gratuita si estás oculto o a cubierto.' },
          { name: 'Mano embaucadora', activation: 'action1', description: 'Obtienes ventaja en pruebas de Hurto y puedes intentar robar objetos a objetivos en tu cercanía como acción.' },
        ],
      },
    ],
    color: '#a78bfa',
    colorBg: 'rgba(167,139,250,0.1)',
    colorBorder: 'rgba(167,139,250,0.3)',
    icon: '🎭',
  },
  {
    id: 'cazador',
    name: 'Cazador',
    definition: 'Personas con buena puntería y a quienes les gusta estar al aire libre; buscan y eliminan problemas. Son expertos en rastrear, tender emboscadas y eliminar amenazas antes de que estas puedan reaccionar.',
    initialSkill: 'Percepción',
    mainTalent: 'Buscar presa',
    mainTalentEffect: 'Después de pasar 1 minuto preparándote, eliges un personaje como presa. Obtienes ventaja en todas las pruebas para encontrar, atacar o estudiar a tu presa.',
    recommendedAttributes: ['Discernimiento', 'Fuerza', 'Velocidad'],
    recommendedSkills: ['Percepción', 'Supervivencia', 'Sigilo', 'Armamento ligero', 'Agilidad'],
    specialties: [
      {
        name: 'Arquero',
        description: 'Expertos en combate a distancia que utilizan su puntería y conocimiento del terreno para eliminar objetivos desde lejos.',
        keyTalents: [
          { name: 'Puntería firme', activation: 'action1', description: 'Aumenta el alcance de tu arma a la mitad de su valor e inflige daño adicional igual a tus grados en Percepción.' },
          { name: 'Ojo agudo', activation: 'special', description: 'Observa al objetivo y realiza prueba de Percepción contra Cognitiva para averiguar su defensa o atributo más bajo, o si su salud/concentración están por debajo de la mitad.' },
          { name: 'Explotar debilidad', activation: 'free', description: 'Usa la acción Obtener ventaja como acción gratuita, apuntando solo a tu presa.' },
          { name: 'Salva implacable', activation: 'passive', description: 'Puedes usar la misma arma a distancia para atacar a tu presa más de una vez por turno.' },
        ],
      },
      {
        name: 'Asesino',
        description: 'Especialistas en eliminar objetivos de manera rápida y discreta, aprovechando el sigilo y el elemento sorpresa.',
        keyTalents: [
          { name: 'Golpe sorprendente', activation: 'action1', description: 'Ataque sin armas o improvisado contra Cognitiva. Con un impacto o rasguño, el objetivo queda Sorprendido.' },
          { name: 'Filo asesino', activation: 'passive', description: 'Obtienes pericia en Cuchillo y Honda. Estas armas obtienen los rasgos de experto Mortífera y Preparación rápida.' },
          { name: 'Estocada fatal', activation: 'action2', description: 'Ataque cuerpo a cuerpo contra Cognitiva de un objetivo Sorprendido o que no te ve como amenaza. Añade 4d4 de daño y puede aplicar penalizaciones a tiradas de lesión.' },
          { name: 'Mirada fría', activation: 'passive', description: 'Al derrotar a tu presa, recuperas 1 concentración y puedes designar una nueva presa inmediatamente.' },
        ],
      },
      {
        name: 'Rastreador',
        description: 'Expertos en el terreno que utilizan trampas, conocimiento de la naturaleza y compañeros animales para acechar y capturar a sus presas.',
        keyTalents: [
          { name: 'Trampa mortal', activation: 'action2', description: 'Creas y ocultas una trampa en tu cercanía. Trampa enredadora (inmoviliza) o trampa de empalamiento (daño vital) contra el primero que la pise.' },
          { name: 'Vínculo animal', activation: 'special', description: 'Tu compañero animal te advierte del peligro; mientras está a 3 metros tus defensas aumentan en 1. Puede rastrear a tu presa.' },
          { name: 'Trampero experimentado', activation: 'special', description: 'Consigues recursos automáticamente durante descansos cortos. Puedes fabricar herramientas de materiales naturales.' },
          { name: 'Ventaja del cazador', activation: 'passive', description: 'Tu compañero animal obtiene ventaja contra tu presa. Las trampas mortales aumentan su daño.' },
        ],
      },
    ],
    color: '#4ade80',
    colorBg: 'rgba(74,222,128,0.1)',
    colorBorder: 'rgba(74,222,128,0.3)',
    icon: '🏹',
  },
  {
    id: 'enviado',
    name: 'Enviado',
    definition: 'Negociadores perspicaces que ejercen hábilmente su influencia sobre los demás. Se mantienen firmes en su ética a través de su fuerte conexión con el estamento al que sirven, doblando voluntades sin necesidad de recurrir a la fuerza.',
    initialSkill: 'Disciplina',
    mainTalent: 'Presencia imponente',
    mainTalentEffect: 'Elige un aliado al que puedes influir. Pasará a estar Resuelto hasta que se beneficie de ese estado o hasta que termine la escena.',
    recommendedAttributes: ['Presencia', 'Voluntad'],
    recommendedSkills: ['Disciplina', 'Engaño', 'Liderazgo', 'Persuasión', 'Saber'],
    specialties: [
      {
        name: 'Diplomático',
        description: 'Destinados en el extranjero, son expertos en desenvolverse en la política de la corte. Utilizan lo que aprenden sobre sus países anfitriones para buscar un tratamiento más favorable para el suyo.',
        keyTalents: [
          { name: 'Desafío inalterable', activation: 'action1', description: 'Gasta 1 concentración para hacer prueba de Disciplina contra Espiritual del enemigo. Si tienes éxito, queda Desorientado y sufre desventaja en pruebas contra ti.' },
          { name: 'Llamamiento a la calma', activation: 'special', description: 'Cuando tu Desafío inalterable hace que un objetivo quede Desorientado, puedes gastar concentración para calmarlo.' },
          { name: 'Oratoria ensayada', activation: 'special', description: 'Cuando uses Presencia imponente o Desafío inalterable, puedes gastar concentración para añadir objetivos adicionales.' },
          { name: 'Solución sosegada', activation: 'free', description: 'Si todos los enemigos no subordinados están calmados y todos están de acuerdo en cesar las hostilidades, el combate termina inmediatamente.' },
        ],
      },
      {
        name: 'Fiel',
        description: 'Para los Fieles, el culto a lo divino impregna toda su vida. Se dedican en cuerpo y alma a las tradiciones de su fe, demostrando sus convicciones a los demás mediante palabras o hechos.',
        keyTalents: [
          { name: 'Galvanizar', activation: 'action2', description: 'Una vez por escena, elige un aliado al que puedes influir. Tira su dado de recuperación para recuperar concentración.' },
          { name: 'Presencia devota', activation: 'special', description: 'Cuando uses Presencia imponente sobre aliados, puedes gastar 1 concentración por objetivo para eliminar los estados Aturdido, Ralentizado, Sorprendido y Tumbado.' },
          { name: 'Fervor inspirado', activation: 'special', description: 'Cuando un aliado usa su estado Resuelto, elige otros aliados que recuperen 1 concentración (hasta tus grados en Disciplina).' },
          { name: 'Vestimenta tradicional', activation: 'passive', description: 'Mientras llevas puesta armadura Presentable o ropa apropiada, tus Defensas espiritual y física aumentan en 2.' },
        ],
      },
      {
        name: 'Mentor',
        description: 'Más interesados en el individuo que en el todo, se dedican en cuerpo y alma a sus pupilos. Con paciencia, guían a otros hacia la grandeza, viendo más allá de las dudas y los déficits.',
        keyTalents: [
          { name: 'Buen consejo', activation: 'reaction', description: 'Después de que un aliado al que puedes influir falla una prueba, puedes gastar 1 concentración para usar tu Presencia imponente sobre él como reacción.' },
          { name: 'Lecciones de paciencia', activation: 'passive', description: 'Cuando usas Presencia imponente, el objetivo recupera 1 concentración. Obtienes pericia en Discurso motivador.' },
          { name: 'Grito de guerra', activation: 'passive', description: 'Presencia imponente puede reanimar a un aliado Inconsciente; si tiene 0 salud, recupera dado de recuperación + grados en Liderazgo.' },
          { name: 'Infundir confianza', activation: 'special', description: 'Presencia imponente puede hacer que un aliado esté Concentrado en lugar de Resuelto hasta el final de la escena.' },
        ],
      },
    ],
    color: '#fbbf24',
    colorBg: 'rgba(251,191,36,0.1)',
    colorBorder: 'rgba(251,191,36,0.3)',
    icon: '🕊️',
  },
  {
    id: 'erudito',
    name: 'Erudito',
    definition: 'La creatividad, la perspicacia y la paciencia son características distintivas de los Eruditos legendarios. Para ellos, cada misterio es un desafío con un premio apropiado. Usan su incansable hambre de conocimiento para cambiar el mundo, descubrimiento brillante a descubrimiento brillante.',
    initialSkill: 'Saber',
    mainTalent: 'Ilustración',
    mainTalentEffect: 'Eliges una pericia cultural o de utilidad y dos habilidades cognitivas diferentes. Al hacer pruebas, se considerará que tienes esa pericia y un grado adicional de cada habilidad elegida. Puedes reasignar después de un descanso largo con acceso a una biblioteca.',
    recommendedAttributes: ['Intelecto', 'Presencia', 'Fuerza o Velocidad'],
    recommendedSkills: ['Deducción', 'Manufactura', 'Medicina', 'Saber'],
    specialties: [
      {
        name: 'Artifabriano',
        description: 'Combinando ciencia, ingeniería y arte, los artifabrianos utilizan piedrabases y carcasas de metal para construir fabriales que llevan a cabo funciones precisas.',
        keyTalents: [
          { name: 'Adquisición preciada', activation: 'passive', description: 'Obtienes pericia en Fabricación de fabriales y una gema especialmente tallada. La primera vez que fabricas un fabrial con esta gema, ignoras los requisitos de tiempo.' },
          { name: 'Diseño inventivo', activation: 'passive', description: 'Tus fabriales personalizados suelen integrar funciones novedosas gracias a tu profundo conocimiento de la piedra con la que trabajas.' },
          { name: 'Trasteo experimental', activation: 'special', description: 'Puedes modificar fabriales existentes de maneras novedosas, descubriendo nuevas funciones o mejorando las existentes.' },
          { name: 'Abrumar con detalles', activation: 'action1', description: 'Cuando hablas sobre un tema que te apasiona, gasta 2 concentración para usar tu modificador de Saber en lugar del habitual en una prueba cognitiva o espiritual.' },
        ],
      },
      {
        name: 'Cirujano',
        description: 'Los Cirujanos cualificados aplican sus conocimientos y su empatía para curar a los enfermos y salvar vidas. Aplican la ciencia médica combinada con una comprensión profunda del cuerpo humano.',
        keyTalents: [
          { name: 'Medicina de campo', activation: 'action2', description: 'Puedes proporcionar atención médica de emergencia en combate, estabilizando aliados con pocas acciones.' },
          { name: 'Inteligencia emocional', activation: 'passive', description: 'Tu formación te permite entender mejor las motivaciones y estados de ánimo de los pacientes y objetivos.' },
          { name: 'Atención continuada', activation: 'special', description: 'Cuando atiendes a un aliado durante un descanso, el periodo de recuperación de sus lesiones se reduce significativamente.' },
          { name: 'Curación precisa', activation: 'special', description: 'Tus conocimientos médicos te permiten maximizar la recuperación de salud durante los descansos.' },
        ],
      },
      {
        name: 'Estratega',
        description: 'Los Estrategas siempre van tres pasos por delante. Saben que el tiempo lo es todo y lo hacen correr a su favor, planificando minuciosamente cada movimiento.',
        keyTalents: [
          { name: 'Planificar', activation: 'special', description: 'Después de estudiar una situación, puedes preparar un plan que otorga ventajas a ti y tus aliados en la próxima escena.' },
          { name: 'Conoce tu momento', activation: 'passive', description: 'Tu análisis te permite identificar el momento óptimo para actuar, obteniendo ventajas en pruebas de iniciativa.' },
          { name: 'Contemplación profunda', activation: 'special', description: 'Durante un descanso, puedes analizar a tus enemigos para descubrir sus debilidades y comunicarlas a tus aliados.' },
          { name: 'Punto de inflexión', activation: 'reaction', description: 'Identifica el momento decisivo de un combate o negociación y actúa en consecuencia para cambiar el resultado.' },
        ],
      },
    ],
    color: '#38bdf8',
    colorBg: 'rgba(56,189,248,0.1)',
    colorBorder: 'rgba(56,189,248,0.3)',
    icon: '📚',
  },
  {
    id: 'guerrero',
    name: 'Guerrero',
    definition: 'Roshar es un mundo desgarrado por el conflicto, y muchos de sus habitantes siguen la senda del Guerrero. Un Guerrero experimentado sabe desenvolverse en cualquier situación marcial peligrosa, ya sea un duelo formal, una pelea en un callejón o un aterrador choque de ejércitos.',
    initialSkill: 'Atletismo',
    mainTalent: 'Posición vigilante',
    mainTalentEffect: 'Aprendes a utilizar las posiciones de combate. Comienzas con la Posición vigilante, que puedes adoptar como acción gratuita. Mientras estás en ella, reduces el coste de concentración de tus reacciones Esquivar y Acometida reactiva en 1.',
    recommendedAttributes: ['Fuerza', 'Velocidad', 'Discernimiento', 'Voluntad'],
    recommendedSkills: ['Atletismo', 'Armamento ligero', 'Armamento pesado', 'Intimidación', 'Liderazgo', 'Persuasión'],
    specialties: [
      {
        name: 'Duelista',
        description: 'En los círculos íntimos de la élite, los hábiles Duelistas compiten por la gloria y la influencia política, manejando sus armas con gracia despiadada.',
        keyTalents: [
          { name: 'Posición de fuego', activation: 'free', description: 'Adoptas una posición agresiva. Obtienes ventaja en Intimidación y, cuando hay exactamente un enemigo en tu cercanía sin aliados, puedes obtener acciones adicionales.' },
          { name: 'Acometida con finta', activation: 'action1', description: 'Gasta 2 concentración para atacar a Defensa cognitiva. Si impactas, el objetivo pierde una reacción y concentración igual a tus grados en Intimidación.' },
          { name: 'A la desesperada', activation: 'action2', description: 'Gasta 1 concentración, muévete la mitad de tu movimiento y ataca a Cognitiva de un objetivo con 0 concentración. Ignora desvío e inflige 4d6 de daño adicional.' },
          { name: 'Kata entrenada', activation: 'passive', description: 'Puedes usar posiciones de lucha en conversaciones y empeños, además de en combate.' },
        ],
      },
      {
        name: 'Portador de esquirlada',
        description: 'Los guerreros que tienen la suerte de poseer hojas y armaduras esquirladas sirven como Portadores de esquirlada. Utilizan estas armas de antigua procedencia para dominar el campo de batalla.',
        keyTalents: [
          { name: 'Entrenamiento de esquirlada', activation: 'passive', description: 'Una vez por ronda, cuando atacas con hoja esquirlada, puedes atacar a tantos enemigos adicionales como tus grados en la habilidad usada. Tu armadura esquirlada tiene 2 cargas adicionales.' },
          { name: 'Posición de la piedra', activation: 'free', description: 'Adoptas una postura defensiva. Tu desvío aumenta en 1 y los enemigos en tu cercanía deben gastar una acción adicional para atacar a tus aliados.' },
          { name: 'Golpe demoledor', activation: 'action1', description: 'Cuando impactas en un ataque cuerpo a cuerpo, gasta 2 concentración para quitar 1 carga de la armadura del objetivo y empujar a los objetivos dañados.' },
          { name: 'Salto meteórico', activation: 'action2', description: 'Salta hasta una cuarta parte de tu movimiento y ataca sin armas a Física de todos los objetivos en tu cercanía. Los objetivos débiles quedan Tumbados.' },
        ],
      },
      {
        name: 'Soldado',
        description: 'Los Soldados, la fuerza de combate más común, forman la mayor parte de los grandes ejércitos de Roshar. Dominan las tácticas para luchar eficazmente en unidades.',
        keyTalents: [
          { name: 'Avance cauteloso', activation: 'action1', description: 'Te desplazas hasta la mitad de tu movimiento ignorando el terreno difícil, luego obtienes 2 acciones para Prevenirte u Obtener ventaja.' },
          { name: 'Entrenamiento de combate', activation: 'passive', description: 'Una vez por ronda, cuando fallas un ataque con arma, puedes hacer un rasguño sin gastar concentración. Obtienes pericia en un arma, armadura y Vida militar.' },
          { name: 'Posición defensiva', activation: 'passive', description: 'La acción Prevenirse añade dos desventajas a los ataques contra ti. Tus aliados pueden usar Prevenirse tras tu escudo.' },
          { name: 'Golpe devastador', activation: 'action1', description: 'Ataque con arma cuerpo a cuerpo contra Defensa física que añade 2d8 de daño adicional.' },
        ],
      },
    ],
    color: '#f87171',
    colorBg: 'rgba(248,113,113,0.1)',
    colorBorder: 'rgba(248,113,113,0.3)',
    icon: '⚔️',
  },
  {
    id: 'lider',
    name: 'Líder',
    definition: 'Los Líderes, ejemplos de estímulo y dirección, supervisan los esfuerzos de los demás. Cuando el empeoramiento de las condiciones hace que los seguidores duden, los Líderes están a la altura de las circunstancias, reforzando la camaradería y la determinación de seguir adelante.',
    initialSkill: 'Liderazgo',
    mainTalent: 'Mando decisivo',
    mainTalentEffect: 'Obtienes un dado de mando (d4). Gasta 1 concentración para elegir un aliado a 6 metros. La próxima vez que realice una prueba, podrá tirar tu dado de mando junto con los demás dados y añadir su resultado al de uno de sus dados.',
    recommendedAttributes: ['Fuerza', 'Presencia', 'Voluntad'],
    recommendedSkills: ['Armamento pesado', 'Atletismo', 'Engaño', 'Intimidación', 'Liderazgo', 'Persuasión'],
    specialties: [
      {
        name: 'Campeón',
        description: 'Los Campeones inspiran a los demás con su coraje inquebrantable y atacan ferozmente a sus enemigos. Su impulso es magnético y anima a los aliados cercanos a seguir adelante.',
        keyTalents: [
          { name: 'Intervención valiente', activation: 'action1', description: 'Gasta 1 concentración para moverte 3 metros y hacer prueba de Atletismo contra Espiritual del enemigo. Si la superas, sufre desventaja en pruebas contra tus aliados.' },
          { name: 'Coordinación en combate', activation: 'free', description: 'Después de una de tus Acometidas, usa Mando decisivo sin gastar acción. Si tu Acometida no impacta, tampoco gastas concentración.' },
          { name: 'Resiliencia heroica', activation: 'passive', description: 'Antes de que tu salud baje a 0, pasarás a tener tantos puntos de salud como tu modificador en Atletismo.' },
          { name: 'Postura resuelta', activation: 'special', description: 'Cuando usas Intervención valiente, puedes gastar concentración para afectar a objetivos adicionales hasta tus grados en Liderazgo.' },
        ],
      },
      {
        name: 'Oficial',
        description: 'Los Oficiales mantienen el orden con frialdad en medio del caos más absoluto. Asignan recursos y emiten órdenes, orquestando la marcha hacia la victoria.',
        keyTalents: [
          { name: 'A través de la refriega', activation: 'reaction', description: 'Un aliado a 6 metros puede usar Destrabarse u Obtener ventaja como reacción.' },
          { name: 'Asalto sincronizado', activation: 'action2', description: 'Gasta 2 concentración para hacer prueba de Liderazgo contra Cognitiva. Si la superas, aliados hasta tus grados en Liderazgo obtienen una acción para una Acometida adicional.' },
          { name: 'Marcha implacable', activation: 'passive', description: 'Mando decisivo incrementa el movimiento del objetivo en 3 metros y hace que ignore los estados Agotado, Ralentizado y Sorprendido.' },
          { name: 'Autoridad', activation: 'passive', description: 'Si tienes un título que te ponga al mando de 5 o más personas, duplica el alcance y el número de aliados afectados por tus talentos de Líder.' },
        ],
      },
      {
        name: 'Político',
        description: 'Con cierta inclinación hacia la exageración, los Políticos buscan favores y prestigio mientras socavan sutilmente a sus enemigos en la corte y en el campo.',
        keyTalents: [
          { name: 'Ardid táctico', activation: 'action1', description: 'Haz prueba de Engaño contra Cognitiva para que tu objetivo pierda una reacción y obtenga desventaja en su próxima prueba cognitiva o espiritual.' },
          { name: 'Tácticas despiadadas', activation: 'special', description: 'Tu aliado puede subir la apuesta en lugar de tirar tu dado de mando; si sufre una Complicación, recuperas 1 concentración.' },
          { name: 'Difundir rumores', activation: 'special', description: 'Obtienes pericia en Escándalos. Gasta 2 concentración para añadir Oportunidad a pruebas de desinformación o enterarte de rumores.' },
          { name: 'Gran engaño', activation: 'action3', description: 'Gasta 3 concentración para hacer prueba de Engaño (CD 15) que desvele una treta que cambie un detalle clave de la situación.' },
        ],
      },
    ],
    color: '#fb923c',
    colorBg: 'rgba(251,146,60,0.1)',
    colorBorder: 'rgba(251,146,60,0.3)',
    icon: '👑',
  },
]
