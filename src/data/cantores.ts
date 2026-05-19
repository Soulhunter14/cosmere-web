// ── Tipos ──────────────────────────────────────────────────────────────────

export type FormaBonusKey = 'fuerza' | 'velocidad' | 'intelecto' | 'voluntad' | 'discernimiento' | 'presencia' | 'desvio' | 'concentracion'
export type FormaBonusMap = Partial<Record<FormaBonusKey, number>>

export interface FormaCantor {
  nombre: string
  spren: string
  esPoder: boolean          // true = vacíospren → riesgo influencia Odium
  descripcion: string
  bonos: string             // texto resumen de bonos activos (legible)
  bonusAtributos?: FormaBonusMap  // bonos numéricos para aplicar a la ficha
  accionesEspeciales?: string[]
}

export interface TalentoCantor {
  nombre: string
  activacion: string | null // '3' = 3 acciones, null = siempre activo / pasivo
  prereq?: string
  descripcion: string
  formas: FormaCantor[]
  esFormasDePoder?: boolean
}

// ── Constantes ────────────────────────────────────────────────────────────

export const CANTOR_COLOR        = '#a78bfa'
export const CAMBIAR_DE_FORMA    = 'Cambiar de forma'
export const FORMA_ACTIVA_PREFIX = '~forma~'

// ── Árbol completo de talentos de Cantor ──────────────────────────────────
// Fuente: Manual del Jugador – Capítulo 2: Orígenes, págs. 31-41

export const ARBOL_CANTOR: TalentoCantor[] = [
  // ── Talento raíz ────────────────────────────────────────────────────────
  {
    nombre: CAMBIAR_DE_FORMA,
    activacion: 'action3',
    prereq: undefined,
    descripcion:
      'Aprendes a vincularte con un spren durante las altas tormentas y cambias tu forma. ' +
      'Esta transformación no solo altera tu apariencia, sino también tus fortalezas física, ' +
      'cognitiva y espiritual, e incluso tu personalidad.\n\n' +
      'Cuando adquieres este talento, comienzas con dos formas de cantor: forma gris y forma carnal. ' +
      'Si te encuentras al aire libre durante una alta tormenta, puedes activar este talento para ' +
      'cambiar a forma gris o cualquier forma que hayas desbloqueado. Solo puedes estar en una forma a la vez.',
    formas: [
      {
        nombre: 'Forma gris',
        spren: 'ninguno',
        esPoder: false,
        descripcion:
          'Tu forma no está especializada: el spren con el que te has vinculado no otorga forma. ' +
          'Puedes pasar desapercibido como un "parshmenio" en la mayoría de las sociedades humanas, ' +
          'pero no obtienes otros beneficios.',
        bonos: '— (sin bonos)',
      },
      {
        nombre: 'Forma carnal',
        spren: 'vidaspren',
        esPoder: false,
        descripcion:
          'Te has vinculado con un vidaspren y tu forma está especializada para la reproducción.',
        bonos: '— (sin bonos mecánicos)',
      },
    ],
  },

  // ── Nivel 1: tres ramas de formas básicas ────────────────────────────────
  {
    nombre: 'Formas de delicadeza',
    activacion: null,
    prereq: 'Cambiar de forma',
    descripcion:
      'Obtienes dos nuevas formas de cantor (forma artística y forma diestra) en las que ' +
      'transformarte usando Cambiar de forma.',
    formas: [
      {
        nombre: 'Forma artística',
        spren: 'creacionspren',
        esPoder: false,
        descripcion:
          'La forma artística se especializa en la expresión creativa. Obtienes un discernimiento ' +
          'amplificado de los ritmos, los colores y otros aspectos del mundo que te rodea.\n\n' +
          'Te has vinculado a un creacionspren. Mientras estás en esta forma, aumentas tu ' +
          'Discernimiento en 1 y obtienes las pericias de utilidad Pintura y Música. ' +
          'Además, obtienes ventaja en pruebas de Manufactura y en pruebas relacionadas con ' +
          'el entretenimiento (cantar, bailar, etc.).',
        bonos: 'Discernimiento +1 · Pericias: Pintura, Música · Ventaja: Manufactura y entretenimiento',
        bonusAtributos: { discernimiento: 1 },
      },
      {
        nombre: 'Forma diestra',
        spren: 'vientospren',
        esPoder: false,
        descripcion:
          'La forma diestra se especializa en la flexibilidad física y mental. Tu caparazón es ' +
          'mínimo; en cambio, tienes un rango de movimiento y concentración mental aumentados.\n\n' +
          'Te has vinculado a un vientospren. Mientras estás en esta forma, tu Velocidad aumenta ' +
          'en 1. Cuando cambias a esta forma, tu concentración máxima y actual aumentan en 2; ' +
          'cuando asumes una forma diferente, ambas disminuyen en 2.',
        bonos: 'Velocidad +1 · Concentración máx. y actual +2',
        bonusAtributos: { velocidad: 1, concentracion: 2 },
      },
    ],
  },
  {
    nombre: 'Formas de determinación',
    activacion: null,
    prereq: 'Cambiar de forma',
    descripcion:
      'Obtienes dos nuevas formas de cantor (forma de guerra y forma de trabajo) en las que ' +
      'transformarte usando Cambiar de forma.',
    formas: [
      {
        nombre: 'Forma de guerra',
        spren: 'dolorspren',
        esPoder: false,
        descripcion:
          'La forma de guerra se especializa en el combate. Tu cuerpo es grande y está cubierto ' +
          'por un grueso caparazón que actúa como armadura.\n\n' +
          'Te has vinculado a un dolorspren. Mientras estás en esta forma, tu Fuerza aumenta en 1 ' +
          'y tu valor de desvío aumenta en 1 (no se acumula con armaduras). ' +
          'Puedes saltar horizontalmente hasta tu valor de movimiento, o verticalmente hasta la ' +
          'mitad de tu valor de movimiento, sin prueba de Atletismo.',
        bonos: 'Fuerza +1 · Desvío +1 · Salto: movimiento completo (horiz.) / ½ movimiento (vert.)',
        bonusAtributos: { fuerza: 1, desvio: 1 },
      },
      {
        nombre: 'Forma de trabajo',
        spren: 'gravitacionspren',
        esPoder: false,
        descripcion:
          'La forma de trabajo se especializa en las tareas físicas y te otorga determinación. ' +
          'Tienes un cuerpo robusto con modestas crestas de caparazón.\n\n' +
          'Te has vinculado a un gravitacionspren. Mientras estás en esta forma, tu Voluntad ' +
          'aumenta en 1 e ignoras los efectos del estado Agotado. ' +
          'Puedes camuflarte fácilmente para pasar desapercibido como un "parshmenio".',
        bonos: 'Voluntad +1 · Ignora Agotado · Camuflaje como parshmenio',
        bonusAtributos: { voluntad: 1 },
      },
    ],
  },
  {
    nombre: 'Formas de sabiduría',
    activacion: null,
    prereq: 'Cambiar de forma',
    descripcion:
      'Obtienes dos nuevas formas de cantor (forma de mediación y forma sabia) en las que ' +
      'transformarte usando Cambiar de forma.',
    formas: [
      {
        nombre: 'Forma de mediación',
        spren: 'unespren',
        esPoder: false,
        descripcion:
          'La forma de mediación se especializa en la comunicación. Tu caparazón es suave y ' +
          'tus rasgos faciales están bien definidos y son expresivos.\n\n' +
          'Te has vinculado a un unespren. Mientras estás en esta forma, tu Presencia aumenta en 1. ' +
          'Además, no tienes que gastar concentración para usar la reacción Ayudar.',
        bonos: 'Presencia +1 · Ayudar sin gastar concentración',
        bonusAtributos: { presencia: 1 },
      },
      {
        nombre: 'Forma sabia',
        spren: 'logispren',
        esPoder: false,
        descripcion:
          'La forma sabia se especializa en la erudición, mejorando los procesos mentales y la memoria. ' +
          'Te vuelves más paciente y analítico.\n\n' +
          'Te has unido a un logispren. Mientras estás en esta forma, tu Intelecto aumenta en 1. ' +
          'Cuando adoptas esta forma, elige una pericia cultural o de utilidad que no tengas, y también ' +
          'una habilidad cognitiva no de potencia. Obtienes esa pericia y un grado adicional en esa ' +
          'habilidad temporalmente.',
        bonos: 'Intelecto +1 · Pericia cultural/utilidad temporal · Grado en habilidad cognitiva temporal',
        bonusAtributos: { intelecto: 1 },
      },
    ],
  },

  // ── Puerta a las formas de poder ────────────────────────────────────────
  {
    nombre: 'Mente ambiciosa',
    activacion: null,
    prereq: 'Disciplina 3 o más, Formas de delicadeza o Formas de determinación o Formas de sabiduría',
    descripcion:
      'Tu creciente sed de poder te predispone a la influencia de Odium. Aunque todavía no te has ' +
      'unido a un vacíospren, la influencia de Odium permea tu mente y tu Defensa cognitiva aumenta en 2.\n\n' +
      'Si adquieres un talento que te otorga formas de poder, puedes usar Cambiar de forma para ' +
      'atraer a un vacíospren. La unión con este spren sigue las mismas reglas que otras formas.\n\n' +
      '⚠ Mientras estás unido a un vacíospren: una vez al día, cuando obtienes una Complicación en ' +
      'una prueba, debes superar Disciplina CD 15 o quedas Aturdido hasta el final de tu siguiente turno. ' +
      'Si has jurado el Primer Ideal de una Orden Radiante, superas esta prueba automáticamente.',
    formas: [],
    esFormasDePoder: false,
  },

  // ── Nivel 2: formas de poder (vacíospren) ────────────────────────────────
  {
    nombre: 'Formas de destrucción',
    activacion: null,
    prereq: 'Mente ambiciosa',
    descripcion:
      'Obtienes dos nuevas formas de poder de cantor (forma funesta y forma tormenta) en las que ' +
      'transformarte usando Cambiar de forma. Estas formas utilizan vacíospren conectados a Odium.',
    formas: [
      {
        nombre: 'Forma funesta',
        spren: 'desalmaspren',
        esPoder: true,
        descripcion:
          'Forma funesta se especializa en una fuerza y persistencia inquebrantables. ' +
          'Tu caparazón considerable tiene una cresta irregular de púas. ' +
          'Sientes inclinación a obedecer a tus superiores pero a ser obstinado con los demás.\n\n' +
          'Te has unido a un desalmaspren (vacíospren). Mientras estás en esta forma, tu Fuerza ' +
          'aumenta en 2 y tu valor de desvío aumenta en 2 (no se acumula con armaduras). ' +
          'Cuando un personaje desencadena una Acometida reactiva a tu favor, puedes usarla ' +
          'para Agarrar en lugar de atacar (gastando 1 de concentración como de costumbre).',
        bonos: 'Fuerza +2 · Desvío +2',
        bonusAtributos: { fuerza: 2, desvio: 2 },
        accionesEspeciales: ['↺ Acometida reactiva → puede usarse para Agarrar en lugar de atacar'],
      },
      {
        nombre: 'Forma tormenta',
        spren: 'tormentaspren',
        esPoder: true,
        descripcion:
          'Forma tormenta es una forma de batalla de élite optimizada para la destreza física. ' +
          'Estás cubierto por un caparazón blindado con crestas y púas.\n\n' +
          'Te has unido a un tormentaspren (vacíospren). Mientras estás en esta forma, tu Fuerza, ' +
          'Velocidad y Desvío aumentan en 1 cada uno (el desvío no se acumula con armaduras).\n\n' +
          'Desatar rayos (2 acc.): gasta 1 de concentración o Investidura para hacer un ataque a ' +
          'distancia de Disciplina (18 m) contra la Defensa física de un objetivo. ' +
          'Tira 2d8 de daño por energía; con un impacto, el objetivo queda Desorientado. ' +
          'Con Disciplina 4 grados → 2d10; con 5+ grados → 2d12.',
        bonos: 'Fuerza +1 · Velocidad +1 · Desvío +1',
        bonusAtributos: { fuerza: 1, velocidad: 1, desvio: 1 },
        accionesEspeciales: ['⚡ Desatar rayos (2 acc.): Disciplina vs. Def. Física 18 m, 2d8 energía, Desorientado'],
      },
    ],
    esFormasDePoder: true,
  },
  {
    nombre: 'Formas de expansión',
    activacion: null,
    prereq: 'Mente ambiciosa',
    descripcion:
      'Obtienes dos nuevas formas de poder de cantor (forma emisaria y forma comunicadora) en las que ' +
      'transformarte usando Cambiar de forma. Estas formas utilizan vacíospren conectados a Odium.',
    formas: [
      {
        nombre: 'Forma emisaria',
        spren: 'fanatispren',
        esPoder: true,
        descripcion:
          'La forma emisaria es una forma embellecida para satisfacer necesidades administrativas. ' +
          'Tu forma de alta estatura se eleva por encima de los demás y tu caparazón es atractivo.\n\n' +
          'Te has vinculado a un fanatispren (vacíospren). Mientras estás en esta forma, tu Intelecto ' +
          'y Presencia aumentan en 1. Puedes hablar, leer, escribir y entender todos los idiomas. ' +
          'Obtienes ventaja en pruebas de Perspicacia para interpretar los deseos o intenciones de los demás.',
        bonos: 'Intelecto +1 · Presencia +1 · Todos los idiomas · Ventaja: Perspicacia de intenciones',
        bonusAtributos: { intelecto: 1, presencia: 1 },
      },
      {
        nombre: 'Forma comunicadora',
        spren: 'prisaspren',
        esPoder: true,
        descripcion:
          'La forma comunicadora otorga velocidad y resistencia ideales para exploradores. ' +
          'Tu cuerpo ágil está protegido por un caparazón ligero con púas aerodinámicas.\n\n' +
          'Te has vinculado a un prisaspren (vacíospren). Mientras estás en esta forma, tu Velocidad ' +
          'aumenta en 2 e ignoras los efectos del estado Ralentizado. ' +
          'Puedes gastar 1 punto de concentración para obtener ventaja en pruebas de Agilidad, Sigilo o Hurto.',
        bonos: 'Velocidad +2 · Ignora Ralentizado · Gasta 1 conc. → ventaja en Agilidad/Sigilo/Hurto',
        bonusAtributos: { velocidad: 2 },
      },
    ],
    esFormasDePoder: true,
  },
  {
    nombre: 'Formas de misterio',
    activacion: null,
    prereq: 'Mente ambiciosa',
    descripcion:
      'Obtienes dos nuevas formas de poder de cantor (forma pútrida y forma nocturna) en las que ' +
      'transformarte usando Cambiar de forma. Estas formas utilizan vacíospren conectados a Odium.',
    formas: [
      {
        nombre: 'Forma pútrida',
        spren: 'desgracispren',
        esPoder: true,
        descripcion:
          'La enigmática forma pútrida otorga habilidad insidiosa para minar la vitalidad de otros. ' +
          'Tu delgado caparazón es irregular, quebradizo y asimétrico.\n\n' +
          'Te has unido a un desgracispren (vacíospren). Mientras estás en esta forma, tu Voluntad ' +
          'aumenta en 2.\n\n' +
          'Toque putrefacto (*): antes de que un personaje dentro de tu alcance recupere salud o ' +
          'concentración, puedes gastar 1 de concentración o Investidura para evitar que lo haga. ' +
          'El personaje no recupera esa salud o concentración y pierde los recursos gastados.',
        bonos: 'Voluntad +2',
        bonusAtributos: { voluntad: 2 },
        accionesEspeciales: ['* Toque putrefacto: impide recuperar salud/conc. a objetivo en alcance (1 conc./Inv.)'],
      },
      {
        nombre: 'Forma nocturna',
        spren: 'nochespren',
        esPoder: true,
        descripcion:
          'La forma nocturna otorga visiones impredecibles del futuro y agudiza tus sentidos. ' +
          'Un caparazón con forma de pétalo crece desde tu cráneo enmarcando tus orejas.\n\n' +
          'Te has vinculado a un nochespren (vacíospren). Mientras estás en esta forma, tu ' +
          'Discernimiento e Intelecto aumentan en 1. Tu concentración máxima y actual aumentan en 2 ' +
          '(y disminuyen al cambiar de forma).\n\n' +
          'Premoniciones interpuestas (↺): al comienzo de cada sesión, tira dos d20 y anota los ' +
          'resultados. Cuando un aliado o enemigo realice una prueba, puedes usar esta reacción para ' +
          'reemplazar su tirada con uno de tus números anotados (después de ver el resultado, antes de ' +
          'resolverse los efectos). Pierdes el número al usarlo o al terminar la sesión.\n\n' +
          'Premoniciones esporádicas (*): a discreción de la DJ, puedes percibir fogonazos vagos del futuro.',
        bonos: 'Discernimiento +1 · Intelecto +1 · Concentración +2',
        bonusAtributos: { discernimiento: 1, intelecto: 1, concentracion: 2 },
        accionesEspeciales: [
          '↺ Premoniciones interpuestas: tira 2d20 al inicio de sesión, reemplaza tiradas de aliados/enemigos',
          '* Premoniciones esporádicas: la DJ puede describir fogonazos del futuro',
        ],
      },
    ],
    esFormasDePoder: true,
  },
]

// ── Helpers ───────────────────────────────────────────────────────────────

/** Nombre de todos los talentos del árbol de cantor (para allPrereqs) */
export const CANTOR_TALENT_NAMES = ARBOL_CANTOR.map((t) => t.nombre)

/** Extrae la forma activa del array de talentos (o null si no hay ninguna) */
export function getFormaActiva(talentos: string[]): string | null {
  const item = talentos.find((t) => t.startsWith(FORMA_ACTIVA_PREFIX))
  return item ? item.slice(FORMA_ACTIVA_PREFIX.length) : null
}

/** Devuelve un nuevo array de talentos con la forma activa actualizada */
export function withFormaActiva(talentos: string[], forma: string): string[] {
  return [...talentos.filter((t) => !t.startsWith(FORMA_ACTIVA_PREFIX)), FORMA_ACTIVA_PREFIX + forma]
}

/** Devuelve todas las formas disponibles dado el conjunto de talentos adquiridos */
export function getFormasDisponibles(selectedTalentos: string[]): FormaCantor[] {
  const formas: FormaCantor[] = []
  for (const talento of ARBOL_CANTOR) {
    if (selectedTalentos.includes(talento.nombre) && talento.formas.length > 0) {
      formas.push(...talento.formas)
    }
  }
  return formas
}
