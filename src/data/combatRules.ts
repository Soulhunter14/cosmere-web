import type { ActivationType } from '../components/TalentActivation'

export interface CombatAction {
  name: string
  cost: ActivationType
  description: string
}

export interface CombatSection {
  id: string
  title: string
  summary: string
  details: { label: string; text: string }[]
}

export const COMBAT_ACTIONS: { actions: CombatAction[]; freeActions: CombatAction[]; reactions: CombatAction[] } = {
  actions: [
    { name: 'Acometida', cost: 'action1', description: 'Atacas con un arma que empuñas o sin armas contra la Defensa física del objetivo. Puedes usarla más de una vez por turno, pero cada ataque debe usar una mano diferente. Atacar con la mano secundaria cuesta 2 concentración.' },
    { name: 'Moverse', cost: 'action1', description: 'Te mueves una distancia igual o menor a tu valor de movimiento. Si te arrastras, trepas, nadas o te mueves sigilosamente, estás Ralentizado. Puedes usarla más de una vez por turno.' },
    { name: 'Destrabarse', cost: 'action1', description: 'Te alejas cuidadosamente de un enemigo sin activar Acometidas reactivas. Te mueves 1,5 metros.' },
    { name: 'Obtener ventaja', cost: 'action1', description: 'Usas una habilidad para buscar superioridad sobre tu oponente mediante tácticas, fintas o fuerza superior. Si la prueba tiene éxito, obtienes ventaja en tu próxima prueba con una habilidad diferente contra ese enemigo.' },
    { name: 'Prevenirse', cost: 'action1', description: 'Te escondes tras cobertura a 1,5 metros o menos. Todos los ataques contra ti sufren desventaja. El beneficio termina si atacas o te mueves. Si tienes arma con rasgo Defensiva, puedes crear cobertura móvil.' },
    { name: 'Usar una habilidad', cost: 'action1', description: 'Utilizas una de tus habilidades para realizar tareas desafiantes en el campo de batalla: prueba de Percepción, esconderte con Sigilo, usar Medicina para tratar a un aliado, etc.' },
    { name: 'Interactuar', cost: 'action1', description: 'Interactúas rápidamente con un objeto que puedes alcanzar sin necesidad de prueba: abrir/cerrar una puerta, recoger un objeto, desenvainar o envainar un arma, sacar algo de tu mochila, pasar algo a un aliado. Puede usarse más de una vez por turno.' },
    { name: 'Recuperarse', cost: 'action2', description: 'Respiras profundamente y haces acopio de fuerzas. Tira tu dado de recuperación para recuperar salud y/o concentración, como en un descanso corto. Solo puede usarse una vez por escena.' },
    { name: 'Agarrar', cost: 'action2', description: 'Haz prueba de Atletismo contra Defensa física de un personaje en tu cercanía. Si la superas, queda Inmovilizado hasta que quedes Inconsciente, elijas poner fin al efecto o ya no esté en tu cercanía.' },
    { name: 'Empujar', cost: 'action2', description: 'Haz prueba de Atletismo contra Defensa física de un personaje en tu cercanía. Si la superas, empujas al objetivo 1,5 metros horizontalmente. Si empujas a quien te agarra, el efecto de Agarrar termina.' },
    { name: 'Prepararse', cost: 'special', description: 'Eliges un detonante y una acción como respuesta. Cuesta 1 acción más el coste de la acción que preparas. Si ese detonante ocurre antes de tu siguiente turno, puedes usar la acción elegida aunque no sea tu turno.' },
  ],
  freeActions: [
    { name: 'Charlar', cost: 'free', description: 'Puedes hablar libremente en cualquier momento de tu turno. Los demás personajes pueden responder brevemente. Recuerda que cada ronda dura solo unos 10 segundos.' },
    { name: 'Soltar', cost: 'free', description: 'Dejas caer cualquier cantidad de objetos que tengas en las manos u otro apéndice.' },
  ],
  reactions: [
    { name: 'Acometida reactiva', cost: 'reaction', description: 'Cuando un enemigo abandona voluntariamente tu cercanía, puedes atacar con arma cuerpo a cuerpo contra su Defensa física. Cuesta 1 punto de concentración.' },
    { name: 'Ayudar', cost: 'reaction', description: 'Antes de que un aliado realice una prueba de habilidad, le otorgas ventaja. Debes estar al alcance o en su cercanía para ayudarlo de manera realista. Cuesta 1 punto de concentración.' },
    { name: 'Esquivar', cost: 'reaction', description: 'Antes de que un enemigo te elija como objetivo para un ataque, añades desventaja a su prueba. No funciona con ataques de zona o a varios objetivos. Cuesta 1 punto de concentración.' },
    { name: 'Evitar peligro', cost: 'reaction', description: 'Cuando te encuentras en una situación de peligro (roca que cae, ser empujado desde un balcón), haz prueba de Agilidad para ponerte a salvo. CD 15 o igual al resultado de la prueba que lo desencadenó.' },
  ],
}

export const COMBAT_SECTIONS: CombatSection[] = [
  {
    id: 'order',
    title: 'Orden del combate',
    summary: 'El combate se divide en rondas. Cada ronda, eliges entre turno rápido (2 acciones) o turno lento (3 acciones). Los turnos rápidos permiten actuar antes que los enemigos; los lentos dan más acciones.',
    details: [
      { label: 'Turno rápido', text: '2 acciones. Juegas antes que los PNJs.' },
      { label: 'Turno lento', text: '3 acciones. Juegas después de los PNJs rápidos.' },
      { label: 'Fases por ronda', text: '1) PJs rápidos → 2) PNJs rápidos → 3) PJs lentos → 4) PNJs lentos → Nueva ronda.' },
      { label: 'Reacciones', text: 'Obtienes 1 reacción al inicio del combate y 1 nueva al inicio de cada uno de tus turnos. Las reacciones duran hasta el inicio de tu siguiente turno.' },
      { label: 'Duración de una ronda', text: 'Aproximadamente 10 segundos en la narrativa del juego.' },
    ],
  },
  {
    id: 'attacks',
    title: 'Cómo atacar',
    summary: 'Los ataques siguen tres pasos: elegir objetivo, hacer la prueba de ataque y tirar dados de daño simultáneamente, y resolver el resultado.',
    details: [
      { label: 'Fallo', text: 'La prueba no supera la defensa del objetivo. No infliges daño, aunque puedes gastar 1 concentración para hacer un rasguño.' },
      { label: 'Rasguño', text: 'Cuando fallas, puedes gastar 1 concentración por objetivo para infligir la cantidad mostrada por los dados de daño (sin añadir modificador).' },
      { label: 'Impacto', text: 'Si superas la prueba, infliges daño igual a los dados de daño + tu modificador de habilidad.' },
      { label: 'Impacto crítico', text: 'Al impactar, puedes gastar Oportunidad para maximizar todos los dados de daño (como si todos hubieran sacado su valor más alto).' },
      { label: 'Distancia', text: 'Ataques cuerpo a cuerpo requieren que el objetivo esté en tu cercanía (1,5 m). Los ataques a distancia contra objetivos en tu cercanía sufren desventaja.' },
    ],
  },
  {
    id: 'surprise',
    title: 'Sorpresa',
    summary: 'Cuando un bando tiende una emboscada, los personajes que no se percatan quedan Sorprendidos al inicio del combate. El estado se elimina cuando todos han jugado su primer turno.',
    details: [
      { label: 'Cómo sorprender', text: 'El grupo que prepara la emboscada hace prueba de Sigilo contra Percepción del otro bando, o Engaño contra Perspicacia.' },
      { label: 'Efecto', text: 'Los personajes Sorprendidos no pueden actuar en el primer turno rápido/lento hasta que se elimina el estado.' },
      { label: 'Duración', text: 'El estado Sorprendido se elimina después de que todos los personajes han jugado su primer turno.' },
    ],
  },
  {
    id: 'cover',
    title: 'Cobertura y movimiento',
    summary: 'El terreno y la posición son cruciales en combate. La cobertura reduce los ataques enemigos, y diferentes tipos de movimiento tienen costes distintos.',
    details: [
      { label: 'Cobertura (Prevenirse)', text: 'Estar detrás de cobertura a 1,5 m aplica desventaja a todos los ataques contra ti. Atacar o moverte termina el efecto.' },
      { label: 'Terreno difícil', text: 'Arrastrarse, trepar, nadar o moverse sigilosamente aplica el estado Ralentizado a ese movimiento.' },
      { label: 'Saltar y trepar', text: 'Puede requerir una prueba de Agilidad o Atletismo como parte de la acción Moverse.' },
      { label: 'Punto de apoyo inestable', text: 'Nadar, volar o estar sobre superficie precaria aplica desventaja a los ataques a distancia.' },
      { label: 'Cercanía', text: '1,5 metros o menos. Algunas armas y efectos pueden aumentar este alcance.' },
    ],
  },
  {
    id: 'maneuvers',
    title: 'Maniobras creativas',
    summary: 'No estás limitado a ataques normales. Puedes describirle a la DJ cualquier maniobra creativa; si la acepta, elige una defensa y posibles desventajas según la complejidad.',
    details: [
      { label: 'Armas pesadas', text: 'Favorecen maniobras que destruyen el entorno, hacen retroceder enemigos o aprovechan el peso y alcance del arma. La DJ puede reducir desventajas para estas maniobras.' },
      { label: 'Armas ligeras', text: 'Favorecen maniobras precisas como desarmar al enemigo o apuntar a una parte concreta del cuerpo. Menos desventajas para maniobras de precisión.' },
      { label: 'Ejemplo', text: 'Desarmar con una estocada: la DJ puede pedir prueba contra Defensa cognitiva con desventaja (arma ligera) o dos desventajas (arma pesada).' },
      { label: 'Resolución', text: 'Si superas la prueba, la DJ determina los efectos narrativos o mecánicos además del daño normal.' },
    ],
  },
  {
    id: 'area',
    title: 'Ataques de zona',
    summary: 'Algunos ataques (especialmente potencias Radiantes) afectan a todos los personajes dentro de una zona física. Se resuelven haciendo una sola prueba y comparando con cada objetivo.',
    details: [
      { label: 'Resolución', text: 'Haz tu prueba y tira los dados de daño una sola vez. Compara el resultado con la defensa de cada objetivo.' },
      { label: 'Rasguño múltiple', text: 'Para hacer rasguño a varios objetivos que fallaste, debes gastar 1 concentración por cada objetivo.' },
      { label: 'Barreras', text: 'La mayoría de los efectos de zona no pueden atravesar obstáculos sólidos como paredes. La DJ decide casos límite.' },
      { label: 'Sentidos', text: 'Puedes usar efectos de zona aunque no puedas sentir a los personajes dentro de ella, a diferencia de los ataques a objetivos específicos.' },
    ],
  },
]
