import type { ActivationType } from '../components/TalentActivation'

export interface Talento {
  name: string
  cost: ActivationType
  prereq?: string
  description: string
}

export interface Potencia {
  id: string
  name: string
  atributo: string
  ordenes: string[]
  costoBase: ActivationType
  descripcion: string
  talentos: Talento[]
}

export interface PotenciaRegla {
  id: string
  title: string
  summary: string
  details: { label: string; text: string }[]
}

// ─── Reglas generales ──────────────────────────────────────────────────────

export const POTENCIAS_REGLAS: PotenciaRegla[] = [
  {
    id: 'como-obtener',
    title: 'Cómo obtener y usar potencias',
    summary: 'Las potencias son habilidades Investidas exclusivas de los Radiantes. No puedes acceder a una potencia hasta que tu camino Radiante te otorgue al menos 1 grado. Una vez obtenido, puedes usar su versión básica y mejorarla con grados adicionales.',
    details: [
      { label: 'Atributo asociado', text: 'Cada potencia tiene un atributo (indicado entre paréntesis). El modificador de habilidad = grados en la potencia + valor del atributo.' },
      { label: 'En la hoja de personaje', text: 'Cuando obtengas tu primer grado, añade la potencia a las líneas en blanco bajo las habilidades normales.' },
      { label: 'Pruebas', text: 'Haz pruebas con la potencia igual que con cualquier habilidad (p. ej., una prueba de Abrasión).' },
      { label: 'Talentos', text: 'Los talentos de potencia solo están disponibles tras pronunciar el Primer Ideal. Siguen las mismas reglas que los talentos de camino.' },
    ],
  },
  {
    id: 'escalado',
    title: 'Escalado de potencias',
    summary: 'A medida que obtienes grados en una potencia, aumenta tanto tu modificador de habilidad como los efectos de la potencia: el dado de daño y el tamaño máximo del objetivo o zona afectada.',
    details: [
      { label: 'Grado 1', text: 'Dado: d4 — Tamaño máximo: Pequeño (0,75 m)' },
      { label: 'Grado 2', text: 'Dado: d6 — Tamaño máximo: Mediano (1,5 m)' },
      { label: 'Grado 3', text: 'Dado: d8 — Tamaño máximo: Grande (3 m)' },
      { label: 'Grado 4', text: 'Dado: d10 — Tamaño máximo: Enorme (4,5 m)' },
      { label: 'Grado 5', text: 'Dado: d12 — Tamaño máximo: Gargantuesco (6 m)' },
    ],
  },
  {
    id: 'infusion',
    title: 'Infusión y duración',
    summary: 'Algunas potencias infunden luz tormentosa en objetos o en ti mismo. Las que se aplican a ti se nutren de tu Investidura actual; las que se aplican a objetos requieren infundirlos con luz tormentosa.',
    details: [
      { label: 'Coste por ronda', text: 'Normalmente 1 punto de Investidura al inicio de cada turno. La potencia termina cuando se agota la Investidura infundida o cuando eliges terminarla (sin coste de acción).' },
      { label: 'Infundirte a ti mismo', text: 'No gastas Investidura adicional por adelantado. Simplemente gastas 1 por ronda automáticamente hasta que decides parar.' },
      { label: 'Añadir Investidura a una infusión', text: 'Al inicio de tu turno (antes de gastar), puedes infundir Investidura adicional a una infusión activa para prolongarla. Debes estar en el alcance.' },
      { label: 'Fuera del combate', text: 'En conversación: 1 Investidura por minuto. En empeños: varía (1–10 min). Fuera de escenas: 1 Investidura cada 10 minutos.' },
      { label: 'Varias infusiones', text: 'Puedes tener varias infusiones activas a la vez.' },
    ],
  },
  {
    id: 'ataques',
    title: 'Ataques de potencia',
    summary: 'Si una potencia permite hacer un ataque, sigue las reglas estándar de ataques del capítulo 10, con algunas reglas adicionales.',
    details: [
      { label: 'Sin sentir al objetivo', text: 'Si no puedes sentir al objetivo, la prueba de ataque sufre una desventaja.' },
      { label: 'Daño al impactar', text: 'En caso de impacto, suma tu modificador de habilidad de potencia al daño. Puedes gastar Oportunidad para hacer un impacto crítico.' },
      { label: 'Rasguño al fallar', text: 'En caso de fallo, puedes gastar 1 punto de concentración por objetivo para hacer un rasguño.' },
    ],
  },
  {
    id: 'uso-creativo',
    title: 'Uso creativo de potencias',
    summary: 'No estás limitado a los efectos descritos. Con la aprobación de la DJ, puedes usar tus potencias para casi cualquier cosa. La DJ establece la CD, la cantidad de Investidura y narra los resultados.',
    details: [
      { label: 'Cómo resolverlo', text: 'Realiza una prueba de habilidad de la potencia y gasta Investidura (cantidad determinada por la DJ). Consulta la tabla de escalado para saber el tamaño de zona o fuerza relativa de los efectos.' },
      { label: 'Sobre objetos de enemigos', text: 'Para infundir un objeto que sujeta un personaje reticente, o una superficie que soporta su peso, debes superar una prueba de potencia contra la Defensa del objetivo. Si fallas, no gastas Investidura.' },
    ],
  },
]

// ─── Las diez potencias ────────────────────────────────────────────────────

export const POTENCIAS: Potencia[] = [
  {
    id: 'abrasion',
    name: 'Abrasión',
    atributo: 'Velocidad',
    ordenes: ['Danzante del Filo', 'Portador del Polvo'],
    costoBase: 'action1',
    descripcion: 'Altera la fuerza de fricción en la superficie de un objeto, generalmente eliminándola casi por completo. Puedes infundir un objeto o superficie en tu cercanía, o infundirte a ti mismo para Patinar y Deslizarte.',
    talentos: [
      { name: 'Movimiento sin fricción', cost: 'passive', prereq: 'Primer Ideal', description: 'Mientras estás infuso con Abrasión, tu movimiento aumenta en 3 m e ignoras Ralentizado por terreno difícil, trepar, arrastrarte o nadar.' },
      { name: 'Abrasión inversa', cost: 'special', prereq: 'Primer Ideal', description: 'En lugar de eliminar fricción, puedes aumentarla. Los personajes que interactúan con el objeto afectado obtienen ventaja en pruebas de Agilidad y Atletismo, e ignoran Ralentizado en esa superficie.' },
      { name: 'Patinaje grácil', cost: 'passive', prereq: 'Movimiento sin fricción', description: 'Cuando Patinas, no estás obligado a moverte en línea recta.' },
      { name: 'Objetivo resbaladizo', cost: 'special', prereq: 'Patinaje grácil', description: 'Mientras estás infuso con Abrasión, los ataques no pueden hacerte un rasguño y las Acometidas reactivas contra ti sufren desventaja.' },
      { name: 'Reclamación de luz tormentosa', cost: 'free', prereq: 'Abrasión inversa', description: 'Puedes poner fin a cualquier número de infusiones en tu cercanía y recuperar toda la Investidura restante con la que fueron infundidas.' },
      { name: 'Potenciación distante', cost: 'passive', prereq: 'Abrasión inversa', description: 'Puedes usar tus potencias y sus talentos como si tu cercanía fuera de 6 metros, sin necesitar tocar al objetivo.' },
      { name: 'Combatiente escurridizo', cost: 'special', prereq: 'Objetivo resbaladizo', description: 'Mientras estás infuso con Abrasión y en movimiento, puedes interrumpir el desplazamiento para usar otras acciones. Una vez por ronda, al atacar en mitad de un movimiento, tiras daño adicional (comienza en 1d4, escala con grados en Abrasión).' },
      { name: 'Patinaje fluido', cost: 'passive', prereq: 'Potenciación distante u Objetivo resbaladizo', description: 'Mientras tengas 1 o más puntos de Investidura, obtienes los beneficios de estar infuso con Abrasión sin gastar Investidura, y Patinar te cuesta 1 punto menos de concentración.' },
    ],
  },
  {
    id: 'adhesion',
    name: 'Adhesión',
    atributo: 'Presencia',
    ordenes: ['Corredor del Viento', 'Forjador de Vínculos'],
    costoBase: 'action1',
    descripcion: 'Une cosas mediante un Enlace completo, adhiriendo dos objetos físicos manipulando la presión y resistencia del aire. Los Forjadores de Vínculos pueden además manipular Conexiones espirituales.',
    talentos: [
      { name: 'Reclamación de luz tormentosa', cost: 'free', prereq: 'Primer Ideal', description: 'Pones fin a cualquier número de infusiones de Adhesión en tu cercanía y recuperas toda su Investidura restante.' },
      { name: 'Acometida vinculante', cost: 'special', prereq: 'Primer Ideal', description: 'Tras impactar con un ataque cuerpo a cuerpo, puedes gastar O o 2 puntos de concentración para usar Adhesión en un objeto que el objetivo esté sosteniendo o usando, sin gastar acción. Tienes éxito automáticamente en la prueba de infusión.' },
      { name: 'Potenciación distante', cost: 'passive', prereq: 'Reclamación de luz tormentosa', description: 'Puedes usar tus potencias como si tu cercanía fuera de 6 metros y sin necesitar tocar al objetivo.' },
      { name: 'Disparo vinculante', cost: 'special', prereq: 'Acometida vinculante', description: 'Puedes usar Acometida vinculante cuando impactas con un ataque a distancia, a cualquier distancia, sin tocar a los objetivos infundidos ni tener una mano libre.' },
      { name: 'Adhesión extendida', cost: 'passive', prereq: 'Potenciación distante', description: 'Tus infusiones de Adhesión gastan 1 punto de Investidura durante un número de rondas igual a tus grados en Adhesión (en lugar de 1 punto por ronda).' },
      { name: 'Trampa adhesiva', cost: 'special', prereq: 'Disparo vinculante', description: 'Al usar Adhesión, puedes infundir solo una superficie. Cualquier personaje que la toque queda sujeto a un Enlace completo con esa superficie automáticamente.' },
      { name: 'Adhesión viviente', cost: 'passive', prereq: 'Adhesión extendida', description: 'Puedes usar Adhesión directamente sobre personajes. Cuando Enlazas a alguien a un objeto mayor que él, queda Retenido, sufre desventaja en pruebas físicas y los ataques en su contra tienen ventaja.' },
      { name: 'Vínculo superior', cost: 'passive', prereq: 'Trampa adhesiva o Adhesión extendida', description: 'Si la Fuerza de un personaje es menor o igual a tus grados en Adhesión, superas automáticamente la prueba enfrentada para mantener tus Enlaces sobre él, sin tirar.' },
    ],
  },
  {
    id: 'cohesion',
    name: 'Cohesión',
    atributo: 'Voluntad',
    ordenes: ['Custodio de la Piedra', 'Escultor de Voluntad'],
    costoBase: 'action1',
    descripcion: 'Altera los objetos hasta sus ejes fundamentales. Conocida como escultura de piedra, permite moldear la roca como si fuera arcilla. Mientras dura la infusión la piedra es blanda; al agotarse, se solidifica con su nueva forma.',
    talentos: [
      { name: 'Lanza de piedra', cost: 'action2', prereq: 'Primer Ideal', description: 'Gasta 1 punto de Investidura para hacer un ataque de Cohesión a distancia (18 m) contra Defensa física, tirando 2d4 de daño por golpe (escala con grados). Con un impacto, puedes gastar Oportunidad para dejar al objetivo Tumbado.' },
      { name: 'Recuerdos de piedra', cost: 'action2', prereq: 'Primer Ideal', description: 'Gasta 1 punto de Investidura para comunicarte con la piedra que tocas durante 1 ronda. La piedra comparte la historia de la zona y recuerdos de sucesos cercanos en imágenes y susurros que pueden requerir una prueba de Cohesión para interpretarse.' },
      { name: 'Socavón', cost: 'action1', prereq: 'Lanza de piedra', description: 'Gasta 1 punto de Investidura y haz una prueba de Cohesión contra la Defensa cognitiva de los objetivos sobre un suelo de piedra en una zona que puedas afectar. Si tienes éxito, se hunden en el suelo y quedan Inmovilizados hasta que se solidifica la roca.' },
      { name: 'Excavar túnel', cost: 'action1', prereq: 'Socavón', description: 'Gasta 1 punto de Investidura para infundirte Cohesión. Mientras dura, puedes moverte a través de superficies de piedra como si fuera terreno difícil, dejando un túnel de 1,5 m de radio por el que otros pueden seguirte.' },
      { name: 'Escultura de piedra verdadera', cost: 'passive', prereq: 'Cohesión 2 o más; Excavar túnel', description: 'Ya no necesitas acciones ni tiempo adicional para moldear piedra. Cuando activas Cohesión, puedes dar forma instantáneamente a la piedra de manera tan elaborada e intrincada como desees.' },
      { name: 'A través de la piedra', cost: 'passive', prereq: 'Socavón', description: 'Cuando tocas piedra, puedes sentir y usar tu Cohesión a través de ella hasta 6 metros de distancia, siempre que haya una superficie de piedra continua entre tú y el objetivo.' },
      { name: 'Cohesión suelta', cost: 'passive', prereq: 'Cohesión 4 o más; A través de la piedra', description: 'Puedes usar Cohesión y sus talentos en cualquier material sólido que no esté vivo, Investido ni infundido con luz tormentosa, no solo en piedra.' },
      { name: 'Tierra fluida', cost: 'special', prereq: 'Escultura de piedra verdadera', description: 'Tras usar Cohesión o gastar Oportunidad en uno de sus talentos, la piedra bajo tus pies te propulsa hasta 1,5 m × tus grados en Cohesión en cualquier dirección, sin activar Acometidas reactivas.' },
    ],
  },
  {
    id: 'division',
    name: 'División',
    atributo: 'Intelecto',
    ordenes: ['Portador del Polvo', 'Rompedor del Cielo'],
    costoBase: 'action2',
    descripcion: 'Destruye y descompone. Puedes desintegrar personajes (daño espiritual), objetos o zonas. Requiere una mano libre y tocar el objetivo. Usar División bajo presión requiere una prueba previa según el material.',
    talentos: [
      { name: 'Deterioro corporal', cost: 'special', prereq: 'Primer Ideal', description: 'Cuando impactas con un ataque de División, puedes gastar Oportunidad para infligir una lesión adicional al objetivo.' },
      { name: 'Fuga erosionada', cost: 'action1', prereq: 'Primer Ideal', description: 'Gasta 1 o más puntos de Investidura para terminar esa misma cantidad de efectos que apliquen Inmovilizado, Retenido o desventaja en pruebas físicas sobre ti o un aliado en tu cercanía.' },
      { name: 'División inflamable', cost: 'special', prereq: 'Deterioro corporal', description: 'Al afectar a un objetivo con División, gasta 1 o más puntos de Investidura adicionales para que arda durante esa cantidad de rondas. El objetivo queda Afligido y la zona a 1,5 m se incendia (daño de energía = modificador de División).' },
      { name: 'Mandar chispas', cost: 'passive', prereq: 'Deterioro corporal o Fuga erosionada', description: 'Puedes usar División y sus talentos como si tu cercanía fuera de 6 metros, siempre que haya una superficie sólida entre tú y tu objetivo a lo largo de la cual puedas enviar una chispa entrópica.' },
      { name: 'Ráfaga de llamas', cost: 'action2', prereq: 'División inflamable', description: 'Gasta 3 puntos de Investidura para realizar un ataque de División que afecta a todos los objetivos en una zona de hasta un tamaño mayor del normal. Tira 3d4 de daño por energía (escala con grados).' },
      { name: 'División devastadora', cost: 'passive', prereq: 'Ráfaga de llamas', description: 'Cuando tiras por daño con División o sus talentos, tiras un dado de daño adicional de la misma magnitud.' },
      { name: 'Chispa ineludible', cost: 'passive', prereq: 'Mandar chispas', description: 'El alcance de Mandar chispas aumenta al alcance de tu vínculo spren. No necesitas línea de efecto mientras puedas sentir al objetivo y este no puede usar Prevenirse contra tu División.' },
      { name: 'Entropía desatada', cost: 'special', prereq: 'Mandar chispas o Ráfaga de llamas', description: 'Usar División te cuesta 1 acción menos. Además, las CD de la tabla División bajo presión se reducen en 5.' },
    ],
  },
  {
    id: 'gravitacion',
    name: 'Gravitación',
    atributo: 'Discernimiento',
    ordenes: ['Corredor del Viento', 'Rompedor del Cielo'],
    costoBase: 'action1',
    descripcion: 'Cambia la dirección y magnitud de la gravedad de un objeto mediante un Enlace básico. Puedes otorgar vuelo a personajes dispuestos o infundirte a ti mismo. Tu valor de gravitación comienza en 7,5 m.',
    talentos: [
      { name: 'As del vuelo', cost: 'action1', prereq: 'Primer Ideal', description: 'Mientras mantienes un Enlace básico sobre ti, vuelas hasta tu valor de gravitación. Una vez durante este movimiento, puedes gastar 1 concentración para realizar un ataque cuerpo a cuerpo. Tu valor de gravitación aumenta permanentemente a 12 m.' },
      { name: 'Impacto gravitacional', cost: 'passive', prereq: 'Primer Ideal', description: 'Cuando mueves a un objetivo con un Enlace básico hacia una superficie sólida, la colisión inflige 1d4 de daño por golpe por cada 3 metros movidos en ese turno (escala con grados). El objetivo puede usar Evitar peligro para reducir el daño a la mitad.' },
      { name: 'Vuelo estable', cost: 'passive', prereq: 'As del vuelo', description: 'Mientras mantienes un Enlace básico sobre ti, tus ataques a distancia no sufren desventaja por volar ni por punto de apoyo inestable.' },
      { name: 'Disparo con Enlace', cost: 'action2', prereq: 'Impacto gravitacional', description: 'Tocas un objeto no supervisado y lo propulsas hacia un objetivo en tu línea de efecto. Gasta Investidura = distancia ÷ valor de gravitación (redondeando arriba). Haz un ataque de Gravitación a distancia: 2d4 de daño por golpe (escala con grados).' },
      { name: 'Vuelo en grupo', cost: 'passive', prereq: 'Vuelo estable', description: 'Fuera del combate, cuando infundes un Enlace básico a ti mismo o a un aliado dispuesto, también puedes infundir Gravitación a aliados adicionales (hasta tus grados en Gravitación) en tu cercanía, sin Investidura adicional.' },
      { name: 'Escuadrón aéreo', cost: 'passive', prereq: 'Gravitación 3 o más; Vuelo en grupo', description: 'Puedes usar Vuelo en grupo también durante el combate.' },
      { name: 'Maestro de los cielos', cost: 'passive', prereq: 'Vuelo en grupo o Disparo con Enlace', description: 'Mientras tengas 1 o más puntos de Investidura, siempre obtienes los beneficios de estar infuso con Gravitación sin gastar Investidura.' },
      { name: 'Enlaces múltiples', cost: 'special', prereq: 'Impacto gravitacional', description: 'Tras superar una prueba de Gravitación para mover a un personaje reticente, puedes infundirle Investidura adicional igual a tus grados. El efecto continúa hasta que la infusión termina, en lugar de solo hasta el inicio de tu siguiente turno.' },
    ],
  },
  {
    id: 'iluminacion',
    name: 'Iluminación',
    atributo: 'Presencia',
    ordenes: ['Tejedor de Luz', 'Vigilante de la Verdad'],
    costoBase: 'action1',
    descripcion: 'Crea ilusiones visuales y auditivas convincentes (tejido de luz). Las ilusiones simples gastan 1 Investidura cada 10 minutos; las complejas, 1 por ronda. Puedes controlar ilusiones dentro del alcance de tu vínculo spren.',
    talentos: [
      { name: 'Ilusión distractiva', cost: 'action1', prereq: 'Primer Ideal', description: 'Gasta 1 Investidura para tejer un duplicado ilusorio de ti mismo o de un aliado al que puedas sentir. Los ataques contra ese personaje tienen desventaja y no pueden hacer un rasguño. La ilusión termina cuando un ataque falla o al final de la escena.' },
      { name: 'Tejidos de luz persistentes', cost: 'special', prereq: 'Primer Ideal', description: 'Cuando creas una ilusión, puedes infundir su Investidura en una esfera o gema sin recubrimiento. La ilusión se mueve con la gema y gasta 1 Investidura durante X rondas = tus grados, en lugar de 1 por ronda.' },
      { name: 'Destello desorientador', cost: 'action2', prereq: 'Ilusión distractiva', description: 'Gasta 1 Investidura para proyectar una explosión de luz en una zona de tu cercanía. Haz una prueba de Iluminación contra la Defensa cognitiva de cada personaje en la zona. Éxito: queda Desorientado hasta el final de su siguiente turno.' },
      { name: 'Reclamación de luz tormentosa', cost: 'free', prereq: 'Ilusión distractiva', description: 'Pones fin a cualquier número de infusiones de Iluminación dentro del alcance de tu vínculo spren y recuperas toda su Investidura restante.' },
      { name: 'Iluminación espiritual', cost: 'action1', prereq: 'Destello desorientador', description: 'Gasta 2 puntos de Investidura para crear un tejido de luz momentáneo cerca de un aliado al que puedas sentir. Ese aliado queda Resuelto y Concentrado hasta el final de su próximo turno.' },
      { name: 'Tejido de luz multiplicador', cost: 'passive', prereq: 'Reclamación de luz tormentosa', description: 'Cuando creas una ilusión, puedes crear ilusiones adicionales hasta alcanzar tus grados en Iluminación. Estas infusiones duran lo mismo que la original y no requieren Investidura adicional.' },
      { name: 'Verdad dolorosa', cost: 'action1', prereq: 'Iluminación espiritual', description: 'Gasta 2 Investidura y haz una prueba de Iluminación contra la Defensa espiritual de un objetivo al que sientas. Éxito: queda Ralentizado hasta fin de su siguiente turno y debe gastar concentración (= tus grados) o alejarse de ti lo máximo posible como 0.' },
      { name: 'Ilusiones infinitas', cost: 'passive', prereq: 'Tejido de luz multiplicador o Iluminación espiritual', description: 'Mientras tengas 1 o más puntos de Investidura, tus infusiones de Iluminación dentro del alcance de tu vínculo spren no gastan Investidura al inicio de tu turno.' },
    ],
  },
  {
    id: 'progresion',
    name: 'Progresión',
    atributo: 'Discernimiento',
    ordenes: ['Danzante del Filo', 'Vigilante de la Verdad'],
    costoBase: 'action2',
    descripcion: 'Controla el crecimiento y la curación de seres vivos. Sus dos efectos: Crecimiento (plantas brotan rápidamente) y Regeneración (cura la salud de un personaje a razón de 1d4 + modificador de Progresión por turno).',
    talentos: [
      { name: 'Regeneración de lesión', cost: 'action2', prereq: 'Primer Ideal', description: 'Gasta 2 puntos de Investidura para curar una lesión temporal de un personaje que toques (o de ti mismo), o gasta 3 puntos para curar una lesión permanente.' },
      { name: 'Crecimiento explosivo', cost: 'action2', prereq: 'Primer Ideal', description: 'Gasta 1 Investidura para usar Crecimiento en una zona. Realiza un ataque de Progresión contra la Defensa física de los personajes de tu elección. Tira 2d4 de daño (escala con grados). Puedes gastar Oportunidad para Inmovilizar a los que impactes.' },
      { name: 'Revitalización rápida', cost: 'special', prereq: 'Progresión 2 o más; Regeneración de lesión', description: 'Cuando usas Revitalizar, recuperas 1d6 + modificador de Progresión de salud (en lugar de la cantidad normal; el dado escala con grados). Además, mientras tengas Investidura, tú y los objetivos de tu Regeneración podéis añadir tu modificador a las tiradas de lesión.' },
      { name: 'Crecimiento desmesurado', cost: 'passive', prereq: 'Crecimiento explosivo', description: 'Cuando infundes Crecimiento en una planta, puedes hacer una prueba de Progresión CD 15 para hacerla crecer más allá de los límites normales de su especie. Su salud actual y máxima aumentan en 2d4 (escala con grados).' },
      { name: 'Regeneración extendida', cost: 'passive', prereq: 'Revitalización rápida', description: 'Tus infusiones de Regeneración gastan 1 punto de Investidura durante un número de rondas igual a tus grados en Progresión, en lugar de 1 por ronda.' },
      { name: 'Progresión fiable', cost: 'special', prereq: 'Progresión 2 o más; Crecimiento desmesurado', description: 'Cuando tiras un dado cuya magnitud aumenta con tus grados en Progresión (incluidas las tiradas de Regeneración de aliados), si el resultado es menor que tus grados, puedes cambiarlo para que sea igual a tus grados.' },
      { name: 'Desde el abismo', cost: 'action3', prereq: 'Progresión 3 o más; Regeneración extendida', description: 'Gasta 3 puntos de Investidura y toca el cuerpo de un personaje dispuesto que haya muerto durante el último minuto. Vuelve a la vida Inconsciente y con 0 puntos de salud.' },
      { name: 'Fuente de vida', cost: 'passive', prereq: 'Regeneración extendida o Progresión fiable', description: 'Usar Progresión y sus talentos te cuesta 1 acción menos.' },
    ],
  },
  {
    id: 'tension',
    name: 'Tensión',
    atributo: 'Fuerza',
    ordenes: ['Custodio de la Piedra', 'Forjador de Vínculos'],
    costoBase: 'action1',
    descripcion: 'Altera la rigidez de objetos blandos (tela, cuerda) volviéndolos firmes como el acero. Cuando se activa, el portador de ropa infundida gana Defensa física +2. Al agotarse la Investidura, el objeto vuelve a ser blando.',
    talentos: [
      { name: 'Parada de tensión', cost: 'reaction', prereq: 'Primer Ideal', description: 'Antes de que tú o un aliado en tu cercanía sufra un impacto o rasguño, infunde Tensión en la ropa del objetivo. Gana Defensa física +2 incluso contra el ataque desencadenante; si eso convierte el impacto en fallo, este no hace rasguño.' },
      { name: 'Reclamación de luz tormentosa', cost: 'free', prereq: 'Primer Ideal', description: 'Pones fin a cualquier número de infusiones de Tensión en tu cercanía y recuperas toda su Investidura restante.' },
      { name: 'Armamento trucado', cost: 'special', prereq: 'Parada de tensión', description: 'Mientras empuñas un arma cuerpo a cuerpo y sujetas material flexible de al menos 3 m, puedes gastar 1 Investidura para aumentar la cercanía del arma en 3 m hasta el final de tu turno. Al impactar, puedes gastar O o 2 concentración para infundir Tensión en un objeto del objetivo sin gastar acción.' },
      { name: 'Tensión extendida', cost: 'passive', prereq: 'Reclamación de luz tormentosa', description: 'Tus infusiones de Tensión gastan 1 Investidura durante X rondas = tus grados. Mientras tengas Investidura, puedes mantener infusiones de Tensión en objetos que sujetes sin coste.' },
      { name: 'Maestría de tejidos', cost: 'passive', prereq: 'Tensión 2 o más; Armamento trucado', description: 'Cuando usas Tensión para crear un objeto, puedes moldearlo automáticamente a su forma exacta sin acciones ni tiempo adicional.' },
      { name: 'Tensión superficial', cost: 'passive', prereq: 'Tensión extendida', description: 'Puedes usar Tensión sobre líquidos, afectando una zona hasta el doble del tamaño normal. Los personajes pueden caminar sobre el líquido afectado como si fuera suelo sólido.' },
      { name: 'Control delicado', cost: 'action2', prereq: 'Maestría de tejidos', description: 'Infunde un objeto no supervisado con Tensión. A lo largo de la duración, puedes controlarlo: se mueve hasta 7,5 m por superficies, realiza tareas y puede atacar usando tu Tensión (2d4 de daño por golpe, escala con grados).' },
      { name: 'Urdidor', cost: 'passive', prereq: 'Maestría de tejidos o Tensión superficial', description: 'El efecto Defensa endurecida aumenta la Defensa física en 4 (en lugar de 2). Cuando creas un arma temporal con Tensión, obtiene un dado de daño adicional (1d4, escala con grados).' },
    ],
  },
  {
    id: 'transformacion',
    name: 'Transformación',
    atributo: 'Voluntad',
    ordenes: ['Nominador de lo Otro', 'Tejedor de Luz'],
    costoBase: 'action2',
    descripcion: 'Transforma un material en otro mediante moldeado de almas. La CD depende de la distancia entre categorías (Sólidos, Orgánicos, Líquidos, Vapores, Aire limpio, Llamas). Éxito: el material se transforma; el coste en Investidura depende del tamaño.',
    talentos: [
      { name: 'Defensa moldeadora de almas', cost: 'reaction', prereq: 'Primer Ideal', description: 'Antes de que un proyectil impacte en ti o un aliado en tu cercanía, gasta 1 Investidura y haz una prueba de Transformación (CD = resultado del ataque). Fallo: el proyectil hace rasguño. Éxito: el ataque falla y transforma el proyectil en el material que elijas.' },
      { name: 'Moldeado de almas viviente', cost: 'action2', prereq: 'Primer Ideal', description: 'Gasta 1 Investidura y haz un ataque cuerpo a cuerpo de Transformación contra la Defensa espiritual de un organismo vivo. Tira 3d4 de daño espiritual (escala con grados). Si reduce la salud a 0, el objetivo muere.' },
      { name: 'Parada moldeadora de almas', cost: 'passive', prereq: 'Defensa moldeadora de almas', description: 'Puedes usar Defensa moldeadora de almas también contra ataques cuerpo a cuerpo, no solo contra proyectiles.' },
      { name: 'Moldeado de sangre', cost: 'action2', prereq: 'Moldeado de almas viviente', description: 'Gasta 1 Investidura y haz una prueba de Transformación CD 15 para limpiar todo el veneno del objetivo y reducir el tiempo de recuperación de una de sus lesiones en 5 días.' },
      { name: 'Potenciación distante', cost: 'passive', prereq: 'Parada moldeadora de almas o Moldeado de sangre', description: 'Puedes usar tus potencias y sus talentos como si tu cercanía fuera de 6 metros.' },
      { name: 'Moldeado de llamas', cost: 'passive', prereq: 'Potenciación distante', description: 'Obtienes Llama como sexta categoría de material. Cuando moldeas llamas, atacas a los personajes a 1,5 m usando Transformación contra Física, tirando 2d4 de daño por energía (escala con grados).' },
      { name: 'Transformación persistente', cost: 'passive', prereq: 'Transformación 2 o más', description: 'Al moldear objetos inanimados, la CD máxima es 15. Además, si fallas, puedes reintentar el moldeado pagando 1 punto de Investidura adicional por cada fracaso reciente al moldear ese mismo objeto.' },
      { name: 'Transmutación expansiva', cost: 'passive', prereq: 'Transformación persistente', description: 'Transformar materiales no orgánicos cuesta 2 puntos menos de Investidura.' },
    ],
  },
]
