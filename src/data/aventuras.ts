export interface AventuraSection {
  id: string
  title: string
  summary: string
  details: { label: string; text: string }[]
}

export interface Estado {
  name: string
  summary: string
  details: string
  special?: string
}

export interface TipoDano {
  name: string
  reducedByDesvio: boolean
  description: string
}

export interface ActividadReposo {
  name: string
  duration: string
  cost: string
  description: string
}

// ─── Escenas ───────────────────────────────────────────────────────────────

export const ESCENAS_SECTIONS: AventuraSection[] = [
  {
    id: 'tipos',
    title: 'Tipos de escena',
    summary: 'El juego distingue tres tipos principales de escena. La mayoría de las reglas del libro se centran en las escenas, que son los momentos en que las acciones individuales tienen consecuencias.',
    details: [
      { label: 'Combates', text: 'Ocurren cuando uno o más personajes participan en un conflicto físicamente hostil. El posicionamiento y el tiempo son cruciales. Las reglas del capítulo 10 cubren los combates en detalle.' },
      { label: 'Conversaciones', text: 'Se centran en los momentos en que los personajes se comunican y el desenlace es incierto. Incluyen discusiones, negociaciones, engaños e interacciones similares. Cubiertas en el capítulo 11.' },
      { label: 'Empeños', text: 'Resaltan los momentos en que intentas atravesar, explorar, descubrir, perseguir o escabullirte. El principal oponente no suele ser otro personaje, sino el entorno o la situación. Capítulo 12.' },
      { label: 'Escenas mixtas', text: 'No todas las secuencias encajan en un único tipo. Por ejemplo, una conversación puede convertirse rápidamente en combate. Las reglas son pautas flexibles que la DJ puede adaptar.' },
    ],
  },
  {
    id: 'tiempo',
    title: 'Tiempo y ritmo',
    summary: 'La DJ controla el paso del tiempo de manera informal, alternando entre momentos rápidos (días o semanas resumidos) y momentos detallados (escenas donde cada segundo importa).',
    details: [
      { label: 'Ritmo rápido', text: 'La historia avanza rápidamente: viajas durante días, descansas o esperas. Estos períodos se resumen y ofrecen oportunidades de reposo.' },
      { label: 'Ritmo detallado', text: 'Cada movimiento importa. La acción se desarrolla segundo a segundo con reglas de escena activas.' },
      { label: 'Transiciones', text: 'Cuando se logra (o no) el objetivo principal de una escena, suele ser el momento de concluirla. Responder una pregunta suele plantear otra nueva.' },
      { label: 'Características entre escenas', text: 'Salud, concentración e Investidura permanecen en el mismo estado entre escenas hasta que se recuperan mediante capacidades o descanso significativo.' },
    ],
  },
  {
    id: 'interpretacion',
    title: 'Interpretación',
    summary: 'Hay dos enfoques principales para interpretar a tu personaje. Ninguno es incorrecto; usa el que mejor encaje con tu estilo y el de tu grupo.',
    details: [
      { label: 'Primera persona', text: 'Encarnas a tu personaje directamente. Hablas como si fueras él, usas su voz y expresiones. Puede ser muy inmersivo, pero requiere respetar el espacio de los demás jugadores.' },
      { label: 'Tercera persona', text: 'Narras las acciones de tu personaje usando su nombre o "él/ella". Útil en escenas de alta intensidad emocional o cuando no quieres encarnar directamente algo difícil.' },
      { label: 'Conocimiento del jugador vs. del personaje', text: 'Distingue siempre lo que sabes tú (el jugador) de lo que sabe tu personaje. Usa el conocimiento adicional que tienes para crear ironía dramática o desenlaces interesantes, no para que tu personaje actúe sobre información que no debería tener.' },
      { label: 'Cuando tu personaje sabe más que tú', text: 'Si tu personaje conocería algo que tú no sabes (sobre su cultura, ocupación o historia), pídele a la DJ contexto e información relevante.' },
    ],
  },
  {
    id: 'grupo',
    title: 'Separar el grupo',
    summary: 'A veces la historia requiere que el grupo se divida para conseguir varios objetivos a la vez. Sin embargo, esto presenta retos para el ritmo de la partida.',
    details: [
      { label: 'Reto principal', text: 'Las escenas deben alternarse entre grupos, dejando a algunos jugadores sin actividad. El juego funciona mejor con el grupo unido siempre que la historia lo permita.' },
      { label: 'Pautas para la DJ', text: 'El capítulo 13 proporciona orientación específica para dirigir partidas con el grupo dividido de manera dinámica.' },
    ],
  },
]

// ─── Reposo ────────────────────────────────────────────────────────────────

export const DESCANSOS: AventuraSection[] = [
  {
    id: 'corto',
    title: 'Descanso corto',
    summary: 'Cualquier período ininterrumpido de una hora o más en el que puedes relajarte y recuperarte.',
    details: [
      { label: 'Recuperación de salud y concentración', text: 'Tira tu dado de recuperación (determinado por tu Voluntad). El resultado se puede distribuir entre salud y concentración. Por ejemplo, un 5 permite recuperar 3 de salud y 2 de concentración.' },
      { label: 'Beneficio alternativo: atender a los demás', text: 'En lugar de recuperarte tú, puedes proporcionar atención médica a aliados. Ellos suman tu modificador de Medicina a su tirada de recuperación.' },
      { label: 'Beneficio alternativo: buscar recursos', text: 'Puedes usar Supervivencia para buscar recursos en el entorno durante el descanso.' },
      { label: 'Beneficio alternativo: otras tareas', text: 'Puedes renunciar a los beneficios del descanso para llevar a cabo tareas. En general, cualquier cosa que requiera una prueba de habilidad es demasiado exigente para hacerse mientras se descansa.' },
    ],
  },
  {
    id: 'largo',
    title: 'Descanso largo',
    summary: 'Cualquier período ininterrumpido de ocho horas o más que incluya tiempo para dormir y recuperarse significativamente.',
    details: [
      { label: 'Recuperación completa', text: 'Recuperas toda la salud y la concentración.' },
      { label: 'Agotamiento', text: 'Tu penalización por estar Agotado se reduce en 1.' },
      { label: 'Otros efectos', text: 'Algunos talentos y efectos se activan durante el descanso largo. Puedes beneficiarte de ellos incluso al mismo tiempo que recuperas salud y concentración.' },
    ],
  },
]

export const ACTIVIDADES_REPOSO: ActividadReposo[] = [
  {
    name: 'Manufactura',
    duration: 'Variable según complejidad',
    cost: 'Materiales requeridos',
    description: 'Puedes fabricar objetos o fabriales tal como se describe en el capítulo 7. La manufactura puede llevar muchos días, por lo que es ideal llevarla a cabo durante períodos de reposo.',
  },
  {
    name: 'Trabajar en una profesión',
    duration: 'Variable',
    cost: '—',
    description: 'Puedes dedicarte a tu profesión, ya sea en trabajos ocasionales o administrando propiedades. Si tienes un patrocinador u organización, es posible que esperen que trabajes en su nombre.',
  },
  {
    name: 'Recuperación',
    duration: 'Por días de reposo',
    cost: '—',
    description: 'Dedicar tiempo de reposo a la recuperación acelera en gran medida la curación: cada día de reposo dedicado al descanso cuenta como dos días para la curación de lesiones.',
  },
  {
    name: 'Investigación',
    duration: '10+ días para información importante',
    cost: '3 mc/día',
    description: 'Visita devotarios, lee en bibliotecas o experimenta en laboratorios. Dile a la DJ qué esperas descubrir y ella decidirá si es posible y cuánto tiempo necesitas. Suele requerir pruebas de Deducción, Saber o Persuasión.',
  },
  {
    name: 'Entrenamiento',
    duration: '20+ días',
    cost: '5 mc/día',
    description: 'Busca un mentor, libro de referencia o expertos para adquirir una nueva pericia especializada (como Martillo de guerra o Semiesquirla). La DJ determina el tiempo y las pruebas requeridas.',
  },
  {
    name: 'Autorreflexión',
    duration: '10+ días',
    cost: '5 mc/día',
    description: 'Evalúa tus valores y experiencias para llevar a cabo cambios mecánicos en tu personaje: cambiar talentos, ajustar grados de habilidad u otras modificaciones. Coordínate con la DJ para integrar los cambios en la historia.',
  },
]

// ─── Sucesos ───────────────────────────────────────────────────────────────

export const SUCESOS_SECTIONS: AventuraSection[] = [
  {
    id: 'que-es',
    title: '¿Qué es un suceso?',
    summary: 'Un suceso es una herramienta opcional que la DJ introduce dentro de una escena para representar circunstancias inminentes que progresan hacia un momento que sacudirá la acción. Funciona como una cuenta atrás independiente del objetivo principal.',
    details: [
      { label: 'Positivos o negativos', text: 'Los sucesos pueden ser buenos o malos para los PJs. Ejemplos: una alta tormenta que se acerca, la llegada de refuerzos aliados, el creciente enfado de una multitud o el inminente cierre de una perpendicular.' },
      { label: 'Frecuencia', text: 'La DJ puede incorporar dos o tres sucesos por sesión, generalmente repartidos entre distintas escenas. No deben parecer giros aleatorios; son dispositivos deliberados para aumentar la tensión.' },
      { label: 'Medidor', text: 'Cada suceso tiene un medidor con al menos dos espacios de Oportunidad, Complicación o ambas. La DJ elige la cantidad de cada tipo al presentarlo.' },
    ],
  },
  {
    id: 'como-contribuir',
    title: 'Contribuir a un suceso',
    summary: 'Jugadores, DJ y PNJs pueden rellenar los espacios del medidor gastando Oportunidades o Complicaciones en lugar de usarlos para sus efectos habituales.',
    details: [
      { label: 'Oportunidades (jugadores)', text: 'Gastar una Oportunidad en un suceso positivo rellena un espacio, acercando un resultado favorable. A veces es mejor guardarla para un beneficio inmediato; la elección es estratégica.' },
      { label: 'Complicaciones (DJ)', text: 'La DJ puede gastar una Complicación en un suceso negativo. Esto le da control dramático sobre cuándo se activa un suceso adverso, como un abismoide irrumpiendo en la escena.' },
      { label: 'PNJs aliados y enemigos', text: 'Los PNJs también contribuyen. Las Oportunidades de aliados avanzan sucesos positivos; las de enemigos avanzan sucesos negativos (y viceversa con las Complicaciones).' },
    ],
  },
  {
    id: 'activacion',
    title: 'Activación',
    summary: 'Una vez rellenados todos los espacios del medidor, el suceso se activa y sus consecuencias se hacen realidad en la escena.',
    details: [
      { label: 'Medidores dobles', text: 'Para desenlaces más complejos, la DJ puede manejar dos medidores simultáneamente: uno positivo y uno negativo. ¿Cuál se llenará primero?' },
      { label: 'Ejemplo', text: 'Estás esperando refuerzos muy necesarios (suceso positivo) mientras una alta tormenta se acerca (suceso negativo). Contribuyes al avance de tus aliados con Oportunidades, mientras las Complicaciones hacen avanzar la tormenta.' },
    ],
  },
]

// ─── Estados ───────────────────────────────────────────────────────────────

export const ESTADOS: Estado[] = [
  {
    name: 'Afligido',
    summary: 'Sufres daño de forma continuada.',
    details: 'En combate, al final de cada uno de tus turnos sufres el daño especificado entre corchetes (p. ej. [1d4 vital]). Fuera del combate, sufres ese daño cada 10 segundos y después de cada intento de eliminar el estado.',
    special: 'A diferencia de la mayoría de estados, puedes estar Afligido por múltiples efectos simultáneamente. Cada uno se resuelve por separado.',
  },
  {
    name: 'Agotado',
    summary: 'Estás fatigado y tus pruebas de habilidad son más difíciles.',
    details: 'Al obtener este estado, se indica una penalización negativa entre corchetes (p. ej. [-2]). Después de calcular el resultado de una prueba, aplica esa penalización. Tras cada descanso largo, la penalización se reduce en 1.',
    special: 'Acumulativo: si obtienes una segunda instancia, las penalizaciones se suman. El resultado de una prueba no puede ser menor que 0.',
  },
  {
    name: 'Aturdido',
    summary: 'Pierdes reacciones y acciones en combate.',
    details: 'En combate: pierdes cualquier reacción disponible, obtienes dos acciones menos en tu turno y no obtienes ninguna reacción al inicio del mismo. Fuera del combate: estás abrumado y te mueves y reaccionas más lentamente a criterio de la DJ.',
  },
  {
    name: 'Concentrado',
    summary: 'Estás completamente absorto en tu tarea.',
    details: 'Cuando usas una habilidad que tiene un coste en concentración, ese coste se reduce en 1 punto.',
  },
  {
    name: 'Desorientado',
    summary: 'Tus sentidos están alterados, dificultando la mayoría de tareas.',
    details: 'No puedes usar reacciones. Tus sentidos siempre cuentan como ofuscados. Las pruebas de Percepción y pruebas similares que requieran sentidos tienen desventaja.',
  },
  {
    name: 'Empoderado',
    summary: 'Estallido de poder sin límites al jurar un Ideal (solo Caballeros Radiantes).',
    details: 'Obtienes ventaja en todas las pruebas y tu Investidura se recarga hasta su máximo al inicio de cada uno de tus turnos.',
    special: 'Se elimina al final de la escena actual.',
  },
  {
    name: 'Inconsciente',
    summary: 'Tu valor de movimiento pasa a 0, no puedes moverte ni comunicarte.',
    details: 'Quedas Tumbado y dejas caer lo que sujetas. No puedes interactuar con el entorno ni usar acciones o reacciones (excepto Absorber luz tormentosa y Revitalizar si eres Radiante). En combate siempre tienes turno lento pero no puedes actuar.',
    special: 'Como PJ, puedes elegir recuperar la consciencia al final de cualquiera de tus turnos (sin coste de acción) o cuando un efecto te cure al menos 1 punto de salud. Con 0 de salud, recuperas 1 al despertar.',
  },
  {
    name: 'Inmovilizado',
    summary: 'Tu valor de movimiento pasa a 0.',
    details: 'No puedes moverte ni ser movido por otros efectos mientras dure el estado.',
  },
  {
    name: 'Mejorado',
    summary: 'Uno de tus atributos aumenta temporalmente.',
    details: 'El atributo especificado entre corchetes obtiene una bonificación al valor indicado. Esto mejora las habilidades asociadas y el movimiento según corresponda, pero no cambia tus defensas, salud máxima, concentración máxima ni Investidura máxima.',
    special: 'Acumulativo: puede aplicarse a varios atributos simultáneamente.',
  },
  {
    name: 'Ralentizado',
    summary: 'Tu valor de movimiento se reduce a la mitad.',
    details: 'Si quedas Ralentizado en medio de un movimiento, el movimiento restante se reduce a la mitad (redondeando hacia arriba).',
  },
  {
    name: 'Resuelto',
    summary: 'Puedes convertir un fallo en una Oportunidad.',
    details: 'Cuando fallas una prueba, puedes añadir una Oportunidad al resultado. Después de elegir hacerlo, este estado se elimina.',
  },
  {
    name: 'Retenido',
    summary: 'Tu movimiento pasa a 0 y sufres desventaja en casi todo.',
    details: 'Sufres desventaja en todas las pruebas, excepto aquellas destinadas a liberarte. Si el efecto no establece una CD de escape, la DJ decide si y cómo puedes eliminar el estado.',
  },
  {
    name: 'Sorprendido',
    summary: 'Fuiste pillado desprevenido al inicio del combate.',
    details: 'Pierdes todas las reacciones, no obtienes reacción al comienzo del combate ni en tu primer turno, no puedes realizar un turno rápido y obtienes una acción menos.',
    special: 'Se elimina después de tu próximo turno.',
  },
  {
    name: 'Tumbado',
    summary: 'Estás tendido en el suelo.',
    details: 'Estás Ralentizado y los ataques cuerpo a cuerpo contra ti obtienen ventaja. Puedes usar la acción Prevenirse sin necesitar cobertura. Ponerse en pie y eliminar este estado cuesta una acción gratuita y reduce tu movimiento en 1,5 m hasta el inicio de tu siguiente turno.',
    special: 'Si quedas Tumbado mientras trepas o vuelas, caes y sufres daño por caída.',
  },
]

// ─── Daño y Lesiones ───────────────────────────────────────────────────────

export const TIPOS_DANO: TipoDano[] = [
  {
    name: 'Energía',
    reducedByDesvio: true,
    description: 'Calor, fuego, relámpagos y efectos similares. Se ve reducido por tu valor de desvío.',
  },
  {
    name: 'Golpe',
    reducedByDesvio: true,
    description: 'Aplastamientos, golpes con objetos contundentes (martillos, rocas). Se ve reducido por tu valor de desvío.',
  },
  {
    name: 'Laceración',
    reducedByDesvio: true,
    description: 'Cortes, perforaciones, empalamientos (dagas, espadas, púas). Se ve reducido por tu valor de desvío.',
  },
  {
    name: 'Espiritual',
    reducedByDesvio: false,
    description: 'Daña tanto el yo físico como el espiritual. Causado principalmente por hojas esquirladas y algunas potencias. No se ve reducido por el desvío.',
  },
  {
    name: 'Vital',
    reducedByDesvio: false,
    description: 'Pone a prueba tu constitución (venenos, asfixia, frío extremo). No se ve reducido por el desvío.',
  },
]

export const DURACION_LESIONES: { tirada: string; duracion: string; tipo: string }[] = [
  { tirada: '–6 o menos', duracion: 'Permanente (Muerte)', tipo: 'muerte' },
  { tirada: '–5 a 0', duracion: 'Permanente', tipo: 'permanente' },
  { tirada: '1 a 5', duracion: '6d6 días', tipo: 'grave' },
  { tirada: '6 a 15', duracion: '1d6 días', tipo: 'leve' },
  { tirada: '16 o más', duracion: 'Hasta el próximo descanso largo', tipo: 'superficial' },
]

export const EFECTOS_LESIONES: { d8: string; efecto: string; narrativa: string }[] = [
  { d8: '1–2', efecto: 'Agotado [-1]', narrativa: 'Cualquier lesión que reduzca tu resistencia general.' },
  { d8: '3', efecto: 'Agotado [-2]', narrativa: 'Lesión más grave que reduce significativamente tu resistencia.' },
  { d8: '4–5', efecto: 'Ralentizado', narrativa: 'Pie o pierna lesionados, o cualquier lesión que reduzca tu velocidad.' },
  { d8: '6', efecto: 'Desorientado', narrativa: 'Lesión en la cabeza o lesión extendida que afecta a tus sentidos.' },
  { d8: '7', efecto: 'Sorprendido', narrativa: 'Te sientes abrumado por la conmoción de la lesión.' },
  { d8: '8', efecto: 'Solo puedes usar una mano', narrativa: 'Mano o brazo lesionados, o cualquier lesión que reduzca tu coordinación.' },
]

export const DANO_SECTIONS: AventuraSection[] = [
  {
    id: 'sufrir-dano',
    title: 'Sufrir daño',
    summary: 'Cuando sufres daño, reduces tu salud actual en esa cantidad. El valor de desvío puede reducir el daño de algunos tipos. Con 0 de salud quedas Inconsciente y sufres una lesión.',
    details: [
      { label: 'Salud a 0', text: 'Quedas Inconsciente y sufres una lesión inmediatamente.' },
      { label: 'Daño con 0 de salud', text: 'Cada vez que sufres daño adicional mientras tienes 0 de salud, sufres otra lesión. Permaneces Inconsciente hasta recuperar salud o elegir despertar.' },
      { label: 'Valor de desvío', text: 'Reduce el daño de tipo Energía, Golpe y Laceración. No afecta al daño Espiritual ni Vital.' },
    ],
  },
  {
    id: 'tirada-lesion',
    title: 'Tiradas de lesión',
    summary: 'Cada vez que sufres una lesión, tiras un d20 y aplicas modificadores para determinar su gravedad. No es una prueba de habilidad: el resultado puede ser negativo.',
    details: [
      { label: 'Armadura', text: 'Añade el valor de desvío de tu armadura a la tirada.' },
      { label: 'Capacidades', text: 'Añade cualquier modificador relevante de talentos u otras capacidades.' },
      { label: 'Lesiones previas', text: 'Resta 5 de la tirada por cada lesión que ya tengas. Esto hace que las lesiones acumuladas sean progresivamente más peligrosas.' },
      { label: 'PNJs menores', text: 'Al sufrir una lesión quedan derrotados inmediatamente. El PJ que cause la lesión elige si el PNJ muere o queda Inconsciente.' },
    ],
  },
  {
    id: 'comida-agua',
    title: 'Comida y agua',
    summary: 'En situaciones normales la DJ no pide seguimiento de reservas. Solo importa cuando el acceso puede ser limitado, como tras las líneas enemigas o en Shadesmar.',
    details: [
      { label: 'Comida insuficiente', text: 'Puedes pasar un número de días sin comer igual a tu valor de Voluntad antes de sufrir efectos. Por cada día adicional sin comer, quedas Agotado [-1]. Si llegas a Agotado [-10], mueres.' },
      { label: 'Agua insuficiente', text: 'Por cada día sin beber suficiente agua, quedas Agotado [-1]. Si llegas a Agotado [-10], mueres.' },
      { label: 'Recuperación', text: 'Una vez que consumes la ración de un día, el recuento de días se reinicia, aunque el estado Agotado acumulado permanece.' },
    ],
  },
]
