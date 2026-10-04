/**
 * Heroic paths of Nacidos de la bruma (chapter 4: L.73-126 / PDF 79-132; summary table L.19 / PDF 25).
 *
 * P8: both manuals share the six heroic paths, their main talents, their initial skills and 10 of the 18 specialties (L.374 / PDF 380:
 * «si una especialidad tiene el mismo nombre en ambos libros, puede usarse libremente en cualquiera de los dos»). So this module does not
 * copy them: it REUSES by reference the objects of `../heroicPaths` (the Stormlight data, already in the main bundle) and adds only what
 * the Mistborn book changes:
 *   - the 8 specialties that only exist here, transcribed from the book: Rebelde, Francotirador, Mataneblinos, Estafador, Inventor,
 *     Alborotador, Pistolero and Planificador (Inventor and Pistolero only in Era 2: `eras`);
 *   - the setting text, which the book rewrites for Scadrial: the `definition` of each path and the `description` of each specialty;
 *   - the few rules where the two books differ: a copy of the shared talent (or path) with a `notaLibro` that says what each book says.
 * Every other talent of a shared specialty is, by reference, the Stormlight object.
 *
 * Verified in T21 (text layer of the PDF plus the tree diagrams, against the Stormlight data and manual): the names of the 80 talents of
 * the 10 shared specialties, the 6 main talents and the 6 initial skills (Perspicacia, Percepción, Disciplina, Saber, Atletismo,
 * Liderazgo) are identical, and the tree diagrams of the shared specialties have the same grid as `TALENT_GRIDS` (`heroico:*`).
 *
 * Texts are short paraphrases of the book, not quotations (same convention as the rest of `src/data/mistborn/`). Citations are
 * «L.<libro> / PDF <pdf>» (PDF = book + 6): every talent of the new specialties carries the page where its full text starts, and the
 * tree diagram of each path is cited at the path. Prerequisites keep the book's wording (the talent engine compares names literally).
 * Only `src/worlds/mistborn.data.ts` (lazy `import()`) loads this module; it imports nothing heavier than the Stormlight data (§8, risk 6).
 */
import type { Era } from '../../types'
import {
  HEROIC_PATHS,
  type HeroicPath,
  type HeroicPathSpecialty,
  type HeroicPathTalento,
} from '../heroicPaths'

/** A specialty of the Mistborn paths: the Stormlight shape plus the era filter the book marks with «ERA 2» */
export interface EspecialidadNdB extends HeroicPathSpecialty {
  /** Eras where the specialty exists: Inventor and Pistolero carry the «ERA 2» tag (L.73 / PDF 79) and are «solo disponible en la Era 2» (L.102 / PDF 108; L.110 / PDF 116); absent = both eras. Filter with `isAvailable()` */
  eras?: Era[]
}

/** A heroic path of Mistborn: the Stormlight one with Scadrial text and the specialties of the Mistborn book */
export interface CaminoHeroicoNdB extends HeroicPath {
  specialties: EspecialidadNdB[]
  /** Note on the main talent when the two books word it differently (the talent graph reads it from the path as `notaLibro`) */
  notaLibro?: string
}

// ── Reuse of the Stormlight objects ─────────────────────────────────────────────────────────────────────────────

const caminoBase = (id: string): HeroicPath => {
  const camino = HEROIC_PATHS.find((p) => p.id === id)
  if (!camino) throw new Error(`heroicPaths (Mistborn): the base path «${id}» no longer exists in src/data/heroicPaths.ts`)
  return camino
}

const especialidadBase = (caminoId: string, nombre: string): HeroicPathSpecialty => {
  const esp = caminoBase(caminoId).specialties.find((s) => s.name === nombre)
  if (!esp) throw new Error(`heroicPaths (Mistborn): the base specialty «${nombre}» no longer exists in path «${caminoId}»`)
  return esp
}

const talentoBase = (caminoId: string, especialidad: string, nombre: string): HeroicPathTalento => {
  const tal = especialidadBase(caminoId, especialidad).talentos.find((t) => t.name === nombre)
  if (!tal) throw new Error(`heroicPaths (Mistborn): the base talent «${nombre}» no longer exists in «${especialidad}»`)
  return tal
}

/**
 * A specialty shared with Stormlight: the same `talentos` (each unchanged talent is the Stormlight object itself), with the Scadrial
 * `description` and, only where the Mistborn book words a talent differently, a copy of that talent with the `cambios`.
 */
function compartida(
  base: HeroicPathSpecialty,
  description: string,
  cambios: Record<string, Partial<HeroicPathTalento>> = {},
): EspecialidadNdB {
  const nombres = new Set(base.talentos.map((t) => t.name))
  for (const nombre of Object.keys(cambios)) {
    if (!nombres.has(nombre)) throw new Error(`heroicPaths (Mistborn): «${nombre}» is not a talent of «${base.name}»`)
  }
  return { ...base, description, talentos: base.talentos.map((t) => (cambios[t.name] ? { ...t, ...cambios[t.name] } : t)) }
}

/** A talent the two books print with the same text but a different tree position: the Stormlight text with the Mistborn prerequisites */
const heredado = (base: HeroicPathTalento, cambios: Partial<HeroicPathTalento>): HeroicPathTalento => ({ ...base, ...cambios })

// ── Rebelde · Agente (L.84-85 / PDF 90-91; diagram L.81 / PDF 87) ───────────────────────────────────────────────

const REBELDE: EspecialidadNdB = {
  name: 'Rebelde',
  description: 'Los oprimidos acaban alzándose contra el poder injusto, y los Rebeldes encarnan ese descontento: luchan por la reforma, mantienen viva la esperanza y, como los poderosos solo entienden la violencia, aprenden a hablar también ese idioma. Recomendada para la Era 1.',
  talentos: [
    {
      name: 'Coraje puro', // L.84 / PDF 90
      prerequisites: 'Liderazgo 1 o más, talento principal Oportunista',
      activation: 'passive',
      rolDescription: 'Tu ánimo crece en medio del caos, justo cuando otros dudan.',
      description: 'Cada vez que tú o un aliado a 6 metros o menos sufrís una Complicación, recuperas 1 punto de concentración.',
    },
    {
      name: 'Mirada desafiante', // L.85 / PDF 91
      prerequisites: 'Perspicacia 2 o más, talento principal Oportunista',
      activation: 'action1',
      rolDescription: 'Tu espíritu rebelde socava la autoridad del enemigo y lo desgasta.',
      description: 'Gasta 2 puntos de concentración para hacer una prueba de Perspicacia contra la Defensa espiritual de un personaje al que puedes influir. Si tienes éxito y el objetivo no estaba ya Agotado, pasa a estar Agotado [−2].',
    },
    {
      name: 'Alzar el estandarte', // L.84 / PDF 90
      prerequisites: 'Liderazgo 2 o más, talento Coraje puro',
      activation: 'passive',
      rolDescription: 'Respaldas a tus camaradas insurgentes justo cuando más lo necesitan.',
      description: 'Cuando usas la reacción Ayudar con un aliado, este recupera 1 punto de concentración.',
    },
    // Entrenamiento de combate (L.85 / PDF 91): the same text as the Soldado one, here after Mirada desafiante
    heredado(talentoBase('guerrero', 'Soldado', 'Entrenamiento de combate'), { prerequisites: 'talento Mirada desafiante' }),
    {
      name: 'Aprovechar el descontento', // L.84 / PDF 90
      prerequisites: 'talento Alzar el estandarte',
      activation: 'passive',
      rolDescription: 'Tu voz domina el tumulto y empuja a la multitud a pasar a la acción.',
      description: 'Cuando obtienes una Complicación en el dado de trama, suma tus grados en Liderazgo a la bonificación obtenida. Obtienes la pericia de utilidad Oratoria.',
    },
    {
      name: 'Sin piedad', // L.85 / PDF 91
      prerequisites: 'talento Entrenamiento de combate',
      activation: 'passive',
      rolDescription: 'Ya que el enemigo nunca jugó limpio, tú tampoco lo harás.',
      description: 'Obtienes ventaja en las pruebas de ataque contra objetivos Agotados, Inmovilizados o Retenidos.',
    },
    {
      name: 'Escuchar rumores', // L.85 / PDF 91
      prerequisites: 'Perspicacia 3 o más, talento Aprovechar el descontento',
      activation: 'special',
      rolDescription: 'Tus contactos, de las altas esferas a los bajos fondos, te traen información útil para la causa.',
      description: 'Tras un descanso largo, haz una prueba de Perspicacia para recopilar información sobre una persona o un grupo (la DJ fija la CD según lo reservados o desconocidos que sean). Si tienes éxito, la DJ te da dos datos ciertos; si fallas, dos datos, uno verdadero y otro falso, sin decirte cuál es cuál.',
    },
    {
      name: 'Don del mártir', // L.85 / PDF 91
      prerequisites: 'Liderazgo 3 o más, talento Aprovechar el descontento',
      activation: 'special',
      rolDescription: 'Verte herido enciende la indignación de los demás y les da fuerzas para seguir luchando.',
      description: 'Una vez por escena, después de que un enemigo te impacte con un ataque, elige a tantos aliados a los que puedas influir como grados tengas en Liderazgo: cada uno obtiene una reacción que solo puede usar para la acción Recuperarse.',
    },
  ],
}

// ── Francotirador · Cazador (L.90-91 / PDF 96-97; diagram L.88 / PDF 94) ────────────────────────────────────────

/** Disciplina de tiro is the first talent of both Francotirador and Pistolero (same text, different main talent) */
const disciplinaDeTiro = (prerequisites: string): HeroicPathTalento => ({
  name: 'Disciplina de tiro',
  prerequisites,
  activation: 'special',
  rolDescription: 'Dominas el manejo y el mantenimiento de las armas de proyectiles.',
  description: 'Una vez por ronda, al fallar un ataque con un arma con el rasgo Cargada, puedes hacer un rasguño a un objetivo de ese ataque sin gastar concentración. Obtienes pericia en un arma con el rasgo Cargada y la pericia de utilidad Mantenimiento de ballestas o Mantenimiento de armas de fuego (Era 2).',
})

const FRANCOTIRADOR: EspecialidadNdB = {
  name: 'Francotirador',
  description: 'Apoyo inestimable a distancia prudente, con cualquier arma de largo alcance: ojo agudo, puntería meticulosa y pulso firme lo convierten en un enemigo formidable. Recomendada para la Era 2.',
  talentos: [
    {
      name: 'Ojo agudo', // L.90 / PDF 96
      prerequisites: 'Percepción 1 o más, talento principal Buscar presa',
      activation: 'special',
      rolDescription: 'Con la mirada entrenada detectas los puntos fuertes y débiles de tus enemigos, sobre todo de tu presa.',
      description: 'Tras observar a tu presa durante 1 acción (o a cualquier otro personaje durante al menos 1 minuto), haz una prueba de Percepción contra su Defensa cognitiva. Si tienes éxito, descubres uno de estos datos a tu elección: su puntuación de atributo más baja, su defensa más baja, o si ha perdido más de la mitad de su salud, concentración o Investidura máxima (eliges cuál).',
    },
    disciplinaDeTiro('talento principal Buscar presa'), // L.90 / PDF 96
    {
      name: 'Puntería firme', // L.90 / PDF 96
      prerequisites: 'Agilidad 1 o más, talento Ojo agudo',
      activation: 'action1',
      rolDescription: 'Tus disparos llegan a su blanco incluso a distancias enormes.',
      description: 'Hasta el final de tu turno, los alcances corto y largo de tus armas a distancia aumentan en la mitad de su valor. Además, al impactar con un ataque a distancia infliges daño adicional igual a tus grados en Percepción.',
    },
    {
      name: 'Cuerpo a tierra', // L.90 / PDF 96
      prerequisites: 'Agilidad 1 o más, talento Disciplina de tiro',
      activation: 'action1',
      rolDescription: 'Te lanzas al suelo para afrontar lo que viene.',
      description: 'Pasas a estar Tumbado (desmontando con seguridad si cabalgas) y eliges una opción: usar la acción Prepararse (gastando los puntos de acción habituales de la acción que preparas) o recargar por completo un arma con el rasgo Cargada.',
    },
    // Compostura (L.90 / PDF 96): the same text as the shared ones, here after Puntería firme
    heredado(talentoBase('lider', 'Oficial', 'Compostura'), { prerequisites: 'talento Puntería firme' }),
    {
      name: 'Marcado rápido', // L.90 / PDF 96
      prerequisites: 'Agilidad 2 o más, talento Puntería firme',
      activation: 'free',
      rolDescription: 'Ignoras el ruido del entorno y fijas al instante a tu nueva presa.',
      description: 'Gasta 2 puntos de concentración para usar la acción Obtener ventaja como acción gratuita contra un enemigo al que puedas sentir; si estás Tumbado, no cuesta concentración. Si tienes éxito, el objetivo de la prueba pasa a ser también tu presa (siempre que no tengas ya una marcada).',
    },
    {
      name: 'Puntería mortal', // L.91 / PDF 97
      prerequisites: 'Percepción 3 o más, talento Compostura',
      activation: 'passive',
      rolDescription: 'Localizas enseguida los puntos débiles del enemigo y los estorbos de tu camino.',
      description: 'Tras superar una prueba de Percepción para Obtener ventaja, tus armas a distancia a dos manos obtienen el rasgo Mortífera contra el objetivo de esa prueba hasta el final de tu turno.',
    },
    {
      name: 'Tirador certero', // L.91 / PDF 97
      prerequisites: 'Agilidad 3 o más, talento Cuerpo a tierra',
      activation: 'special',
      rolDescription: 'Controlas la respiración, te aíslas de cualquier distracción y disparas con precisión devastadora.',
      description: 'Antes de hacer una prueba con un arma a distancia a dos manos estando Tumbado, puedes gastar 1 punto de concentración para ampliar en 2 el rango de Oportunidad de esa prueba. Si sufres una desventaja, puedes designar un dado que la DJ no podrá elegir para aplicarla.',
    },
  ],
}

// ── Mataneblinos · Cazador (L.91-92 / PDF 97-98; diagram L.89 / PDF 95) ─────────────────────────────────────────

const MATANEBLINOS: EspecialidadNdB = {
  name: 'Mataneblinos',
  description: 'Entrenados y equipados para combatir a alomantes, usan equipo especializado, como armaduras de madera o palos de ruido, para anular sus ventajas. Recomendada para la Era 1. Exclusiva de Scadrial: solo para personajes que conozcan los poderes de los nacidos del metal (L.375 / PDF 381).',
  talentos: [
    {
      name: 'Buscar alomante', // L.91 / PDF 97
      prerequisites: 'Percepción 1 o más, talento principal Buscar presa',
      activation: 'reaction',
      rolDescription: 'En cuanto un alomante se delata, tus sentidos se afilan para estudiar sus técnicas.',
      description: 'Tras percatarte de que un personaje al que puedes sentir gasta Investidura, usa esta reacción y gasta 1 punto de concentración para convertirlo en tu presa. Además, el alcance de tus sentidos se duplica mientras una presa enemiga esté a 60 metros o menos de ti.',
    },
    {
      name: 'Armamento mataneblinos', // L.91 / PDF 97
      prerequisites: 'talento principal Buscar presa',
      activation: 'passive',
      rolDescription: 'Preparas cuchillas y munición pensadas para engañar a los alomantes que confían en su instinto.',
      description: 'Un arma diseñada para contrarrestar las Artes Investidas (daga de cristal, hacha de obsidiana, bastón de duelo, palos de ruido o arma de fuego con munición mataneblinos) obtiene en tus manos el rasgo Preparación rápida, y al impactar o hacer un rasguño con ella infliges daño adicional igual a tus grados en Perspicacia. Obtienes la pericia de utilidad Fabricar armamento o una pericia en arma a tu elección.',
      notaLibro: 'El libro escribe «Armamento mataneblino» (en singular) en la configuración icónica «Miembro de una escuadra de asesinos» (L.87 / PDF 93); el nombre del talento en el diagrama (L.89 / PDF 95) y en su texto completo es «Armamento mataneblinos», que es el que se usa aquí y en los prerrequisitos.',
    },
    // Serenidad (L.92 / PDF 98): the same text as the shared ones, here after Buscar alomante
    heredado(talentoBase('erudito', 'Cirujano', 'Serenidad'), { prerequisites: 'talento Buscar alomante' }),
    {
      name: 'Tacto delicado', // L.92 / PDF 98
      prerequisites: 'Percepción 2 o más, talento Armamento mataneblinos',
      activation: 'passive',
      rolDescription: 'Prefieres armas frágiles pero letales a las duraderas, incluso contra nacidos del metal.',
      description: 'Ignoras los efectos del rasgo Frágil. Además, al hacer una prueba de ataque con un arma que tenga ese rasgo, su rango de Oportunidad se amplía en 2.',
    },
    {
      name: 'Dos pasos por delante', // L.91 / PDF 97
      prerequisites: 'Percepción 2 o más, talento Serenidad o talento Apagar',
      activation: 'passive',
      rolDescription: 'Esquivas los ataques de los alomantes que herirían a un mataneblinos menos curtido.',
      description: 'Mientras tu presa enemiga esté en tu cercanía, no puedes sufrir rasguños y ese objetivo debe gastar 1 acción adicional para Destrabarse.',
    },
    {
      name: 'Apagar', // L.91 / PDF 97
      prerequisites: 'Perspicacia 3 o más, talento Tacto delicado o Dos pasos por delante',
      activation: 'reaction',
      rolDescription: 'Sabes que la desventaja es tuya desde el principio, pero eso te empuja a no rendirte.',
      description: 'Antes de que tu presa recupere Investidura estando en tu cercanía, puedes usar contra ella la reacción Acometida reactiva como si hubiera abandonado tu cercanía voluntariamente. Si el ataque impacta o hace un rasguño, el objetivo solo recupera la mitad de la Investidura y queda Aturdido hasta el final de su siguiente turno.',
    },
    {
      name: 'Ferocidad temeraria', // L.91 / PDF 97
      prerequisites: 'talento Dos pasos por delante',
      activation: 'action2',
      rolDescription: 'Cuando el primer golpe alcanza, lo repites sin dudar: un enemigo herido siempre merece otro.',
      description: 'Haces dos ataques con arma cuerpo a cuerpo contra la Defensa física de un objetivo. El segundo ataque sufre una desventaja.',
    },
    // Presciencia (L.91 / PDF 97): the same text as the Mentor one, here after Apagar
    heredado(talentoBase('enviado', 'Mentor', 'Presciencia'), { prerequisites: 'Percepción 3 o más, talento Apagar' }),
  ],
}

// ── Estafador · Enviado (L.98-99 / PDF 104-105; diagram L.96 / PDF 102) ─────────────────────────────────────────

const ESTAFADOR: EspecialidadNdB = {
  name: 'Estafador',
  description: 'Sin la moral convencional como freno, saben que la mejor mentira lleva algo de verdad; fiarse de ellos suele salir caro, pero su confianza en los demás es un tesoro escaso.',
  talentos: [
    {
      name: 'Adulación falsa', // L.98 / PDF 104
      prerequisites: 'talento principal Presencia imponente',
      activation: 'passive',
      rolDescription: 'Tu labia desarma incluso a los más recelosos y acaba beneficiándote.',
      description: 'Puedes usar tu Presencia imponente con un personaje que no sea tu aliado y que no esté ya Resuelto. La próxima vez que ese personaje falle una prueba, deberá usar su estado Resuelto para añadir una Oportunidad, pero la obtienes tú.',
    },
    {
      name: 'Esta corre de mi cuenta', // L.98 / PDF 104
      prerequisites: 'Disciplina 1 o más, talento principal Presencia imponente',
      activation: 'reaction',
      rolDescription: 'Eres un estafador, pero leal: te interpones entre el peligro y un aliado.',
      description: 'Antes de que un aliado sufra un impacto o un rasguño por un ataque a distancia, gasta 1 punto de concentración para usar la acción Moverse como reacción. Debes terminar el movimiento en un espacio entre el aliado y su atacante. Pasas a ser el nuevo objetivo del ataque, que te impacta automáticamente ignorando tus defensas, y el aliado protegido queda Resuelto.',
    },
    {
      name: 'Excusa plausible', // L.98 / PDF 104
      prerequisites: 'Engaño 1 o más, talento Adulación falsa',
      activation: 'reaction',
      rolDescription: 'La experiencia encubierta te permite justificar sobre la marcha casi cualquier comportamiento sospechoso.',
      description: 'Si te descubren mientras estás escondido o merodeando, usa esta reacción y gasta 2 puntos de concentración para fingir inocencia: influyes en todos los personajes que puedan sentirte para que crean tu excusa. Un personaje puede resistirse, pero pierde concentración adicional igual a tus grados en Engaño. Obtienes la pericia de utilidad Juegos de manos.',
    },
    {
      name: 'Timo a largo plazo', // L.99 / PDF 105
      prerequisites: 'talento Esta corre de mi cuenta',
      activation: 'passive',
      rolDescription: 'Años de planificación te han ganado el favor de gente rica y poderosa.',
      description: 'Obtienes un patrocinador (acuerda con la DJ quién es y qué relación os une). Para determinar sus comodidades cuentas como si tuvieras un rango superior (capítulo 8, «Beneficios de los patrocinadores»). Mientras tengas acceso a ellas, dispones de ropa y accesorios para cualquier disfraz mundano.',
    },
    {
      name: 'Salida de tono', // L.98 / PDF 104
      prerequisites: 'Engaño 2 o más, talento Excusa plausible',
      activation: 'action1',
      rolDescription: 'Un chiste, un insulto o un disparate dejan a tu oponente descolocado.',
      description: 'Haz una prueba de Engaño contra la Defensa espiritual de un personaje al que puedes influir. Si tienes éxito, el objetivo queda Sorprendido hasta el inicio de tu siguiente turno.',
    },
    {
      name: '¡Te pillé!', // L.98 / PDF 104
      prerequisites: 'Disciplina 2 o más, talento Esta corre de mi cuenta',
      activation: 'reaction',
      rolDescription: 'Cuando tus aliados ganan un duelo de ingenio, tú rematas señalando los errores del perdedor.',
      description: 'Cuando un aliado tiene éxito en una prueba contra la Defensa cognitiva o espiritual de un objetivo al que puedes influir, usa esta reacción para lanzarle una pulla ingeniosa: el objetivo pierde 2 puntos de concentración y, si su concentración baja a 0, queda también Desorientado hasta el inicio de tu próximo turno.',
    },
    {
      name: 'Farol excepcional', // L.98 / PDF 104
      prerequisites: 'Engaño 3 o más, talento Salida de tono',
      activation: 'special',
      rolDescription: 'Aparentas autoridad en lo que no dominas y abrumas a los profanos con tecnicismos.',
      description: 'Antes de hacer una prueba cognitiva o espiritual para influir en un personaje, puedes gastar 2 puntos de concentración para que la prueba sea de Engaño en lugar de la habilidad correspondiente.',
    },
    {
      name: 'Echar leña al fuego', // L.98 / PDF 104
      prerequisites: 'Disciplina 3 o más, talento Salida de tono',
      activation: 'passive',
      rolDescription: 'La justicia poética a veces necesita ayuda, y tú se la das con gusto.',
      description: 'Una vez por escena, al obtener una Oportunidad mediante Adulación falsa, puedes gastarla para hacer que ese personaje sufra una lesión.',
    },
  ],
}

// ── Inventor · Erudito, solo Era 2 (L.108-109 / PDF 114-115; diagram L.105 / PDF 111) ───────────────────────────

const INVENTOR: EspecialidadNdB = {
  name: 'Inventor',
  eras: ['era2'],
  description: 'Siempre trasteando con piezas nuevas, se enorgullecen de optimizar y embellecer lo que construyen. Solo en la Era 2. Exclusiva de Scadrial: solo para personajes con conocimientos de tecnología industrial (L.375 / PDF 381).',
  talentos: [
    {
      name: 'Operario experto', // L.109 / PDF 115
      prerequisites: 'talento principal Ilustración',
      activation: 'passive',
      rolDescription: 'Las tareas que abruman a otros bajo presión te salen con naturalidad.',
      description: 'Cuando intentas una tarea compleja bajo presión que dominas y podrías completar con rapidez y fiabilidad en una situación relajada, no necesitas Usar una habilidad ni superar una prueba: te basta con usar la acción Interactuar como si no hubiera presión (atar un nudo complejo, escribir y entregar una nota, conducir un vehículo, accionar botones o palancas, consultar un libro, contar dinero, cargar mercancía delicada…). La DJ decide si puedes usar este talento para contribuir de forma significativa a un empeño.',
    },
    {
      name: 'Ajuste apresurado', // L.108 / PDF 114
      prerequisites: 'Manufactura 1 o más, talento principal Ilustración',
      activation: 'action1',
      rolDescription: 'Improvisas con la mecánica a contrarreloj: para ti la chatarra es un cofre de posibilidades.',
      description: 'Haz una prueba de Manufactura para improvisar una trampa o un dispositivo similar, o para alterar y mejorar la utilidad de una herramienta o máquina más allá de lo habitual; puedes combinar componentes de otra herramienta o máquina que tengas para obtener ventaja. Si tienes éxito, acuerda con la DJ el efecto del nuevo objeto. Aprendes a usar la habilidad Supervivencia para buscar chatarra y piezas de repuesto en zonas industriales o ciudades.',
    },
    {
      name: 'Escrutinio agudo', // L.109 / PDF 115
      prerequisites: 'Saber 2 o más, talento Operario experto o Ajuste apresurado',
      activation: 'reaction',
      rolDescription: 'Reconoces las chapuzas antes de que fallen y sabes provocar el fallo en el momento oportuno.',
      description: 'Cuando un personaje al que puedes sentir intenta usar un objeto no Investido que le pertenece o que estaba presente al inicio de la escena, usa esta reacción y gasta 1 punto de concentración para hacer una prueba de Manufactura contra su Defensa cognitiva. Si tienes éxito, el objeto deja de funcionar; la DJ determina qué sucede.',
    },
    {
      name: 'Fabricante de armas', // L.109 / PDF 115
      prerequisites: 'Manufactura 2 o más, talento Operario experto o Ajuste apresurado',
      activation: 'passive',
      rolDescription: 'Construir armas de fuego con todo tipo de extras es tu especialidad.',
      description: 'En las pruebas para manufacturar un objeto, su rango de Oportunidad se amplía en 2 y cualquier coste de materias primas se reduce a la mitad. Obtienes la pericia de utilidad Fabricar armamento, con la que puedes inventar armas de fuego diseñando prototipos (capítulo 7, «Invención de armas de fuego»).',
    },
    {
      name: 'Lo tengo por aquí', // L.109 / PDF 115
      prerequisites: 'Manufactura 2 o más, talento Escrutinio agudo',
      activation: 'action3',
      rolDescription: 'Cargas con tantos cachivaches de tu invención que casi siempre tienes justo lo que hace falta.',
      description: 'Intentas fabricar un objeto útil para esta escena con lo que tengas a mano o con materiales comunes que puedas permitirte con tus arquillas (como si los hubieras comprado en una escena anterior). Haz una prueba de Manufactura: la CD es 15 para la mayoría de objetos y 20 si usas materiales no estándar (capítulo 7).',
    },
    {
      name: 'Desencasquillar la situación', // L.109 / PDF 115
      prerequisites: 'Saber 2 o más, talento Fabricante de armas',
      activation: 'reaction',
      rolDescription: 'Las averías de las armas de fuego no te alteran: las arreglas sin perder el paso.',
      description: 'Cuando un arma en tu cercanía se queda sin munición o se rompe, usa esta reacción y gasta 1 punto de concentración para recargarla o para hacer una prueba de Manufactura que la repare.',
    },
    {
      name: 'Maravilla de la modernidad', // L.109 / PDF 115
      prerequisites: 'Manufactura 3 o más, talento Lo tengo por aquí',
      activation: 'passive',
      rolDescription: 'Eres un experto en las comodidades modernas, del taller a la carretera.',
      description: 'Obtienes la pericia de utilidad Mecánica de automóviles y un coche (capítulo 7, «Vehículos») con un compartimento oculto, donde cabe un objeto de hasta una cuarta parte del volumen del vehículo.',
    },
    {
      name: 'Experto en detonaciones', // L.109 / PDF 115
      prerequisites: 'Saber 3 o más, talento Desencasquillar la situación',
      activation: 'special',
      rolDescription: 'El peligro te mantiene ágil; nada te activa tanto como el fuego a tus pies.',
      description: 'Si empiezas tu turno a 9 metros o menos de un explosivo sin detonar que puedas sentir, obtienes 1 acción que solo puedes usar para Interactuar con el explosivo, Destrabarte o Moverte para alejarte de él. En las pruebas de ataque con dinamita puedes usar Saber en lugar de Armamento pesado. Obtienes la pericia en arma Dinamita.',
    },
  ],
}

// ── Alborotador · Guerrero (L.114-115 / PDF 120-121; diagram L.112 / PDF 118) ───────────────────────────────────

const ALBOROTADOR: EspecialidadNdB = {
  name: 'Alborotador',
  description: 'Rápidos de reflejos y directos, disfrutan enfrentándose a la superioridad numérica.',
  talentos: [
    {
      name: 'Posición de forcejeo', // L.115 / PDF 121
      prerequisites: 'Intimidación 1 o más, talento principal Posición vigilante',
      activation: 'action1',
      rolDescription: 'Te plantas listo para agarrar, lanzar o desviar el cañón de un arma antes de que apunte.',
      description: 'Aprendes una posición nueva, que adoptas con 1 acción: Posición de forcejeo. Mientras la mantienes, obtienes ventaja en las pruebas de Atletismo que no sean de ataque y puedes usar Agarrar o Empujar con 1 acción (en lugar de 2). Además, un enemigo en tu cercanía debe gastar 1 acción adicional para desenfundar un arma o para usar una acción de ataque con un arma a distancia (el efecto no se acumula si varios personajes con esta posición tienen a ese enemigo en su cercanía).',
    },
    // Paso firme (L.115 / PDF 121): the same text as the shared ones, here directly after the main talent
    heredado(talentoBase('agente', 'Ladrón', 'Paso firme'), { prerequisites: 'talento principal Posición vigilante' }),
    // Torvo (L.115 / PDF 121): the same text as the shared ones, here after Posición de forcejeo
    heredado(talentoBase('agente', 'Investigador', 'Torvo'), { prerequisites: 'talento Posición de forcejeo' }),
    {
      name: 'Encajar los golpes', // L.114 / PDF 120
      prerequisites: 'Atletismo 2 o más, talento Paso firme',
      activation: 'reaction',
      rolDescription: 'Usas la furia del enemigo en tu favor y te cuelas por los huecos de sus ataques.',
      description: 'Tras sufrir un impacto o un rasguño por un ataque, usa esta reacción para moverte hasta la mitad de tu valor de movimiento sin activar Acometidas reactivas.',
    },
    {
      name: 'Posición de bravucón', // L.115 / PDF 121
      prerequisites: 'Intimidación 2 o más, talento Torvo',
      activation: 'action1',
      rolDescription: 'Cambias el peso y la postura para frenar a varios oponentes a la vez.',
      description: 'Aprendes una posición nueva, que adoptas con 1 acción: Posición de bravucón. Mientras la mantienes, tu Defensa física aumenta en 1 por cada enemigo en tu cercanía (hasta +5). Además, cuando un enemigo provoque una Acometida reactiva, puedes hacerla sin gastar tu reacción: pagas la concentración de la forma habitual y usas un ataque sin armas o un arma improvisada. Solo puedes atacar así a cada enemigo una vez por ronda.',
    },
    {
      name: 'Pulso de la batalla', // L.115 / PDF 121
      prerequisites: 'talento Torvo',
      activation: 'special',
      rolDescription: 'En pleno combate el tiempo se ralentiza: desvías golpes por instinto y sabes cuándo contraatacar.',
      description: 'Antes de sufrir un rasguño por un ataque, puedes elegir uno de estos efectos (no requiere acción): aumentar en 1 tu valor de desvío contra ese ataque y recuperar 1 punto de concentración, o gastar 2 puntos de concentración para obtener una reacción adicional.',
    },
    {
      name: 'Curtido en batalla', // L.114 / PDF 120
      prerequisites: 'Atletismo 3 o más, talento Posición de bravucón',
      activation: 'special',
      rolDescription: 'Has sangrado en muchas arenas y sigues en pie gracias a tu ferocidad y tus instintos.',
      description: 'Una vez por ronda, puedes repetir uno de estos dados cuando su resultado sea inferior a tus grados en Atletismo: un dado de recuperación, un dado de daño de un ataque sin armas o con un arma improvisada, o el d20 de una tirada de lesión.',
    },
    {
      name: 'Golpetazo', // L.114 / PDF 120
      prerequisites: 'Intimidación 3 o más, talento Pulso de la batalla',
      activation: 'reaction',
      rolDescription: 'Esquivas un ataque y devuelves un golpe demoledor que desorienta, desarma o derriba.',
      description: 'Después de que un enemigo a 3 metros o menos falle un ataque contra ti o solo te haga un rasguño, usa esta reacción y gasta 2 puntos de concentración para moverte hasta la mitad de tu valor de movimiento y hacer un ataque sin armas contra la Defensa espiritual del atacante: suma 2d6 de daño adicional e ignora el valor de desvío del objetivo. Puedes gastar una Oportunidad de ese ataque para aplicar un efecto: Desorientado hasta el final de tu próximo turno; Desarmar (el objetivo debe superar una prueba de Agilidad con CD igual a tu resultado de ataque o suelta un arma que empuñe, que puedes recoger o apartar hasta 3 metros sin acción); o Derribo (el objetivo queda Tumbado). Mejora con el rango: en rango 3 alcanza a un enemigo a 4,5 metros o menos y suma 4d6; en rango 4, 6 metros y 6d6; en rango 5, 7,5 metros y 8d6.',
    },
  ],
}

// ── Pistolero · Guerrero, solo Era 2 (L.115-116 / PDF 121-122; diagram L.113 / PDF 119) ─────────────────────────

const PISTOLERO: EspecialidadNdB = {
  name: 'Pistolero',
  eras: ['era2'],
  description: 'Un tiroteo es cuestión de números y, para ellos, dos armas son mejor que una. Solo en la Era 2. Exclusiva de Scadrial: solo para personajes con acceso a las armas de fuego y que las conozcan (L.375 / PDF 381).',
  talentos: [
    {
      name: 'Disparo trucado', // L.116 / PDF 122
      prerequisites: 'Agilidad 1 o más, talento principal Posición vigilante',
      activation: 'passive',
      rolDescription: 'Hacer rebotar una bala hasta un objetivo a cubierto exige un truco que tú dominas.',
      description: 'Tras Obtener ventaja con éxito mediante Agilidad o Percepción, tus armas a distancia a una mano obtienen el rasgo Indirecta hasta el final de tu turno.',
    },
    disciplinaDeTiro('talento principal Posición vigilante'), // L.115 / PDF 121
    {
      name: 'Posición de dos armas', // L.116 / PDF 122
      prerequisites: 'Agilidad 2 o más, talento Disparo trucado',
      activation: 'action1',
      rolDescription: 'Con un arma en cada mano, tus enemigos no saben qué harás a continuación.',
      description: 'Aprendes una posición nueva, que adoptas con 1 acción: Posición de dos armas. Mientras la mantienes, obtienes ventaja en las pruebas de Agilidad y el rango de Oportunidad de tus pruebas de ataque con armas a distancia a una mano aumenta en 2. Además, un arma de una mano que empuñes (la eliges tú) obtiene temporalmente el rasgo Mano secundaria.',
    },
    {
      name: 'Sacudida aterradora', // L.116 / PDF 122
      prerequisites: 'Atletismo 2 o más, talento Disciplina de tiro',
      activation: 'passive',
      rolDescription: 'Tus disparos buscan el impacto psicológico y obligan a los enemigos a esconderse aunque falles.',
      description: 'Tras hacer un rasguño a un objetivo con un ataque que inflija daño por laceración, el objetivo pierde 1 punto de concentración. Si su concentración se reduce a 0, queda Sorprendido hasta el final de su siguiente turno.',
    },
    {
      name: 'Manos rápidas', // L.116 / PDF 122
      prerequisites: 'Agilidad 3 o más, talento Posición de dos armas',
      activation: 'free',
      rolDescription: 'Desenfundas más deprisa que casi todos, y esa rapidez te ha mantenido con vida.',
      description: 'Gasta 2 puntos de concentración para obtener 2 acciones que solo puedes usar para desenfundar o recargar un arma con la acción Interactuar. Hasta el final de tu turno, obtienes ventaja en las pruebas de ataque con esa arma contra objetivos que aún no hayan actuado en esta ronda.',
    },
    // Poderoso (L.116 / PDF 122): the same effect as the shared ones, here after Sacudida aterradora and with its own narrative line
    heredado(talentoBase('enviado', 'Mentor', 'Poderoso'), {
      prerequisites: 'talento Sacudida aterradora',
      rolDescription: 'Sabes sacar el máximo daño a cada ataque.',
    }),
    {
      name: 'Daño secundario', // L.115 / PDF 121
      prerequisites: 'Atletismo 3 o más, talento Sacudida aterradora',
      activation: 'free',
      rolDescription: 'Tus disparos astillan las coberturas y los fragmentos alcanzan a los atrincherados.',
      description: 'Al hacer un ataque a distancia que inflija daño por laceración, elige otro objetivo a 1,5 metros o menos de tu blanco: el ataque también le inflige un rasguño.',
    },
    {
      name: 'Disparo en abanico', // L.116 / PDF 122
      prerequisites: 'Agilidad 3 o más, talento Sacudida aterradora',
      activation: 'action3',
      rolDescription: 'Accionas el martillo sin parar y barres de disparos a los enemigos cercanos.',
      description: 'Mientras tengas una mano libre, haz una prueba de ataque a distancia con un arma con el rasgo Cargada [2 o más] y elige un punto dentro de su alcance. En un radio de 4,5 metros alrededor de ese punto puedes apuntar a tantos enemigos como munición quede en el arma (hasta 6), gastando una munición por objetivo. La CD es la Defensa física más alta de los objetivos y sufres una desventaja por cada objetivo por encima de tus grados en Agilidad. Si tienes éxito, impactas a un objetivo de tu elección y haces un rasguño al resto. Puedes gastar una Oportunidad para infligir un impacto crítico al objetivo impactado o para impactar a uno al que habías hecho un rasguño.',
    },
  ],
}

// ── Planificador · Líder (L.123-124 / PDF 129-130; diagram L.121 / PDF 127) ─────────────────────────────────────

const PLANIFICADOR: EspecialidadNdB = {
  name: 'Planificador',
  description: 'Los mejores planes no son los primeros, sino los que funcionan: los Planificadores aplican su don para la estrategia para que el equipo logre grandes hazañas.',
  talentos: [
    {
      name: 'Plan maestro', // L.124 / PDF 130
      prerequisites: 'Deducción 1 o más, talento principal Mando decisivo',
      activation: 'action2',
      rolDescription: 'Con previsión y algo de suerte, tu plan sale a pedir de boca.',
      description: 'Una vez por escena, revela un plan maestro: colabora con la DJ para crear un suceso (capítulo 9, «Sucesos») con un desenlace positivo para tus aliados y para ti, que representa los esfuerzos hechos fuera de escena para lograr una ventaja narrativa importante. Solo puedes tener uno activo a la vez. Su medidor de suceso tiene por defecto 3 espacios de Oportunidad, a los que contribuís tus aliados y tú; al crearlo puedes añadir tantos espacios como tus grados en Deducción (más difícil de activar, pero más impactante). El grupo lo activa rellenando el medidor antes del siguiente descanso largo; si no, el plan fracasa.',
      notaLibro: 'Errata del libro: el texto completo imprime «Deducción +1» (L.124 / PDF 130); el diagrama del árbol dice «Deducción 1 o más» (L.121 / PDF 127), que es lo que se usa aquí.',
    },
    // Compostura (L.123 / PDF 129): the very same talent as the Oficial one (same prerequisite, same text)
    talentoBase('lider', 'Oficial', 'Compostura'),
    {
      name: 'Seguir el plan', // L.124 / PDF 130
      prerequisites: 'talento Plan maestro',
      activation: 'reaction',
      rolDescription: 'Con un poco de improvisación, enmiendas los errores antes de que se conviertan en un desastre.',
      description: 'Cuando tú o un aliado al que puedas sentir sacáis una cara en blanco en un dado de trama, usa esta reacción y gasta 2 puntos de concentración para rellenar un espacio del suceso del Plan maestro, como si el resultado hubiera sido una Oportunidad.',
    },
    {
      name: '¡A tu espalda!', // L.123 / PDF 129
      prerequisites: 'Liderazgo 2 o más, talento Compostura',
      activation: 'reaction',
      rolDescription: 'Vigilas el entorno, ves venir las amenazas y pones a tus aliados a salvo.',
      description: 'Cuando un aliado dispuesto, al que puedes sentir e influir, cumple los requisitos de las reacciones Evitar peligro o Esquivar, puedes usar esa reacción como si ocuparas su espacio: gastas tú la reacción y la concentración necesarias y le otorgas los beneficios de la acción. Además, al inicio del combate y de cada uno de tus turnos obtienes una reacción adicional que solo puedes usar para el efecto de este talento.',
    },
    {
      name: 'A mi señal', // L.123 / PDF 129
      prerequisites: 'Deducción 2 o más, talento Seguir el plan',
      activation: 'special',
      rolDescription: 'Tu equipo se prepara con cautela y golpea en el momento perfecto.',
      description: 'Cuando tus aliados y tú rellenáis todos los espacios de Oportunidad del suceso del Plan maestro, puedes no activarlo de inmediato: durante la escena actual puedes decidir cuándo activarlo (sin acción) tras resolverse cualquier prueba o al final del turno de cualquier personaje.',
    },
    {
      name: 'Mando preciso', // L.123 / PDF 129
      prerequisites: 'Liderazgo 2 o más, talento ¡A tu espalda!',
      activation: 'special',
      rolDescription: 'Has calculado cada paso y guías a tus aliados siguiendo tu plan al detalle.',
      description: 'Al hacer una prueba de Deducción, Liderazgo o Saber, puedes gastar 1 punto de concentración para tirar el dado de mando y sumar el resultado a la tirada del d20. Además, la magnitud de tu dado de mando aumenta en un paso (por ejemplo, de d4 a d6).',
    },
    {
      name: 'Ejecución fluida', // L.123 / PDF 129
      prerequisites: 'Liderazgo 3 o más, talento A mi señal',
      activation: 'passive',
      rolDescription: 'Un plan bien ejecutado es una satisfacción: a partir de aquí todo fluye.',
      description: 'Cuando se activa el suceso del Plan maestro, tú y los aliados a los que puedes influir pasáis a estar Concentrados hasta el final del próximo turno de cada objetivo.',
    },
    {
      name: 'Tengo justo lo necesario', // L.124 / PDF 130
      prerequisites: 'Deducción 3 o más, talento A mi señal',
      activation: 'action1',
      rolDescription: 'Cargas con demasiado, pero siempre llevas la herramienta adecuada, incluso para el trabajo imprevisto.',
      description: 'Una vez por escena, gasta 1 punto de concentración para elegir un objeto que no tengas pero que razonablemente podrías haber conseguido en el pasado (una pieza de equipo, los planos de un edificio, una carta o algo similar que puedas llevar encima). Lo sacas de tus pertenencias como si lo hubieras comprado u obtenido antes, fuera de escena; si suele tener precio (capítulo 7), debes pagarlo. La DJ tiene la última palabra sobre qué objeto puedes obtener.',
    },
  ],
}

// ── Shared specialties: Stormlight talents by reference, Scadrial text ──────────────────────────────────────────

const INVESTIGADOR = especialidadBase('agente', 'Investigador')
const LADRON = especialidadBase('agente', 'Ladrón')

const INVESTIGADOR_NDB = compartida(INVESTIGADOR, `${INVESTIGADOR.description} Recomendada para la Era 2.`)

const LADRON_NDB = compartida(LADRON, `${LADRON.description} Recomendada para la Era 1.`, {
  // L.83 / PDF 89 (text) and L.81 / PDF 87 (diagram)
  'Comportamiento arriesgado': {
    prerequisites: 'Perspicacia 2 o más, talento principal Oportunista',
    notaLibro: 'En Nacidos de la bruma el texto completo y el diagrama coinciden: piden Perspicacia 2 o más (L.83 / PDF 89; L.81 / PDF 87). En Archivo de las Tormentas el texto del talento omite ese grado y el libro se contradice.',
  },
  // L.83 / PDF 89
  'Contactos en los bajos fondos': {
    prerequisites: 'tener un patrocinador o compañero que forme parte de los bajos fondos delictivos, talento Obstinarse',
    rolDescription: 'Cuando te mueves en círculos de mala reputación, el nombre de tu patrocinador o compañero ejerce una influencia notable.',
    notaLibro: 'Nacidos de la bruma habla de un patrocinador o «compañero» de los bajos fondos (L.83 / PDF 89); Archivo de las Tormentas dice «seguidor».',
  },
})

const RASTREADOR_NDB = compartida(
  especialidadBase('cazador', 'Rastreador'),
  'En la ciudad o en la frontera, siguen a su presa con soltura; con compañeros animales (a veces, kandra en forma animal) exploran terrenos hostiles, siguen rastros y tienden trampas.',
)

const FIEL_NDB = compartida(
  especialidadBase('enviado', 'Fiel'),
  'Buscan sentido y guía divina sabiendo que el camino no siempre es llano pero debe recorrerse; encuentran milagros en lo cotidiano y siguen el ejemplo de lo divino.',
)

const MENTOR_NDB = compartida(
  especialidadBase('enviado', 'Mentor'),
  'Observadores incansables, procuran entender todas las facetas de sus pupilos para moldearlos y guiarlos hacia la grandeza.',
)

const CIRUJANO_NDB = compartida(
  especialidadBase('erudito', 'Cirujano'),
  'Con decisiones de vida o muerte en segundos, confían en su formación y en su pulso firme para salvar vidas.',
  {
    // L.106 / PDF 112
    'Inteligencia emocional': {
      description: 'Tu talento Ilustración te otorga una habilidad adicional y puedes usar Ilustración para elegir habilidades espirituales que no sean Investidas. Obtienes pericia en Diagnóstico.',
      notaLibro: 'En Nacidos de la bruma la restricción es «que no sean Investidas» (L.106 / PDF 112); en Archivo de las Tormentas es «que no son de potencia». El dato compartido de Archivo de las Tormentas no recoge la restricción.',
    },
  },
)

const ESTRATEGA_NDB = compartida(
  especialidadBase('erudito', 'Estratega'),
  'Usan el ingenio como arma: planifican con antelación y sorprenden al enemigo.',
  {
    // L.108 / PDF 114
    'Cuerpo y mente': {
      description: 'Tu talento Ilustración te otorga una habilidad adicional y puedes usar Ilustración para elegir habilidades físicas que no sean Investidas. Obtienes pericia en un arma de tu elección.',
      notaLibro: 'En Nacidos de la bruma la restricción es «que no sean Investidas» (L.108 / PDF 114); en Archivo de las Tormentas es «que no son de potencia». El dato compartido de Archivo de las Tormentas no recoge la restricción.',
    },
  },
)

const SOLDADO_NDB = compartida(
  especialidadBase('guerrero', 'Soldado'),
  'Sin perder la esperanza, confían en el mando de sus líderes y luchan con valor junto a sus camaradas.',
  {
    // L.117 / PDF 123 (text) and L.113 / PDF 119 (diagram)
    'Posición defensiva': {
      prerequisites: 'Atletismo 2 o más, talento Avance cauteloso',
      notaLibro: 'En Nacidos de la bruma el texto completo sí imprime el prerrequisito de talento, Avance cauteloso, y el diagrama la cuelga de esa carta (L.117 / PDF 123; L.113 / PDF 119). En Archivo de las Tormentas el texto no imprime ningún prerrequisito de talento.',
    },
  },
)

const OFICIAL_NDB = compartida(
  especialidadBase('lider', 'Oficial'),
  'Mantienen el orden en el caos del combate: reparten órdenes y recursos y orquestan la marcha hacia la victoria.',
  {
    // L.122 / PDF 128 (text) and L.120 / PDF 126 (diagram)
    Autoridad: {
      prerequisites: 'tener una posición de mando en una organización o gracias a un patrocinador, talento Mando confiado',
      notaLibro: 'El texto completo de Nacidos de la bruma pide liderar una organización o tener un patrocinador que dé mando sobre un grupo (L.122 / PDF 128), y el diagrama lo redacta como «tener una posición de mando en una organización o gracias a un patrocinador» (L.120 / PDF 126). Se usa la redacción del diagrama: empieza por «tener», así que el motor la trata como cláusula de historia que se confirma a mano. Archivo de las Tormentas exige un título que dé mando sobre al menos 5 personas.',
    },
  },
)

const POLITICO_NDB = compartida(
  especialidadBase('lider', 'Político'),
  'Se especializan en la puesta en escena, la manipulación y el sabotaje sutil de sus enemigos cuando hay que pensar o hablar deprisa.',
)

// ── The six paths ───────────────────────────────────────────────────────────────────────────────────────────────

/** A path of Mistborn: the Stormlight one (name, id, initial skill, main talent, colour and icon are Cosmere) with the Scadrial overrides */
const caminoNdB = (
  id: string,
  cambios: Partial<Omit<CaminoHeroicoNdB, 'id' | 'specialties'>> & Pick<CaminoHeroicoNdB, 'definition' | 'specialties'>,
): CaminoHeroicoNdB => ({ ...caminoBase(id), ...cambios })

export const HEROIC_PATHS_MISTBORN: CaminoHeroicoNdB[] = [
  // Agente (L.78-85 / PDF 84-91; diagram L.80-81 / PDF 86-87)
  caminoNdB('agente', {
    definition: 'Maestros del engaño y el sabotaje, los Agentes esperan el momento justo para tirar de los hilos del destino y deshacer los planes ajenos. Independientes, al servicio de seres divinos o empleados de organizaciones privadas, todos guardan sus secretos en las sombras. Autodidactas o formados por su banda, ignoran las normas de fuera y solo responden ante su propio código.',
    specialties: [INVESTIGADOR_NDB, LADRON_NDB, REBELDE],
  }),
  // Cazador (L.86-93 / PDF 92-99; diagram L.88-89 / PDF 94-95)
  caminoNdB('cazador', {
    definition: 'El Cazador vigila con paciencia, atento al menor detalle: sabe que estar mejor preparado compensa ser menos poderoso que la presa, y que hasta los alomantes tienen puntos débiles que explotar. Elige dónde y cuándo atacar, apoyado en trampas, terreno elevado y sorpresa, ya sea con una muerte limpia a distancia o cara a cara.',
    // L.86 / PDF 92: «a elegir entre Armamento ligero y Armamento pesado»
    recommendedSkills: ['Agilidad', 'Armamento ligero o pesado', 'Percepción', 'Sigilo', 'Supervivencia'],
    specialties: [FRANCOTIRADOR, MATANEBLINOS, RASTREADOR_NDB],
  }),
  // Enviado (L.94-101 / PDF 100-107; diagram L.96-97 / PDF 102-103)
  caminoNdB('enviado', {
    definition: 'Cuando la esperanza flaquea, los Enviados de Scadrial consuelan y animan a no rendirse, convencidos de que la fuerza de la mente y del corazón vence casi cualquier obstáculo. Prefieren guiar con palabras apasionadas antes que mandar, y su código moral, religioso o filosófico, marca su relación con el mundo.',
    specialties: [ESTAFADOR, FIEL_NDB, MENTOR_NDB],
  }),
  // Erudito (L.102-109 / PDF 108-115; diagram L.104-105 / PDF 110-111)
  caminoNdB('erudito', {
    definition: 'Los eruditos persiguen sin descanso el siguiente descubrimiento, equilibrando la seguridad en sus ideas con la humildad para rectificar, ya sea entre cenizas o en talleres que huelen a pólvora. Ninguna curiosidad les parece menor: exploran, aprenden y construyen, conscientes de que el progreso científico puede elevar o hundir una civilización.',
    // L.106 / PDF 112
    mainTalentEffect: 'Eliges una pericia cultural o de utilidad que no tengas y dos habilidades cognitivas diferentes que no sean Investidas. Al hacer pruebas, se considera que tienes esa pericia y un grado adicional en cada habilidad elegida (incluso por encima del máximo habitual); son temporales y no cuentan para los prerrequisitos. Puedes reasignarlos tras un descanso largo con acceso a una biblioteca.',
    notaLibro: 'En Nacidos de la bruma Ilustración excluye las habilidades Investidas al elegir las dos habilidades cognitivas (L.106 / PDF 112); en Archivo de las Tormentas excluye las de potencia. El dato compartido de Archivo de las Tormentas no recoge la restricción.',
    specialties: [CIRUJANO_NDB, ESTRATEGA_NDB, INVENTOR],
  }),
  // Guerrero (L.110-117 / PDF 116-123; diagram L.112-113 / PDF 118-119)
  caminoNdB('guerrero', {
    definition: 'En el campo de batalla cambiante de Scadrial, los Guerreros muestran una destreza legendaria. Aunque el combate exige acción, el éxito nace en la mente: agresividad, resistencia y adaptabilidad que entrenan hasta convertirlas en instinto. El buen Guerrero sabe por qué lucha y refuerza sus convicciones con la fuerza física.',
    // L.110 / PDF 116
    recommendedSkills: ['Agilidad', 'Armamento ligero', 'Armamento pesado', 'Atletismo', 'Disciplina', 'Intimidación', 'Liderazgo', 'Persuasión'],
    // L.111 / PDF 117
    mainTalentEffect: 'Aprendes a utilizar las posiciones. Empiezas con Posición vigilante, que adoptas con 1 acción: reduce en 1 el coste de concentración de Esquivar y Acometida reactiva y te permite adoptar otra posición conocida con acción gratuita. Entrar en una posición cuesta las acciones que indica su talento y la posición termina si usas una acción gratuita para ello, si pasas a otra o si acaba la escena; mientras la mantienes obtienes sus acciones y efectos. Por defecto, solo se usan posiciones en combate.',
    notaLibro: 'En Nacidos de la bruma Posición vigilante se adopta con 1 acción (L.111 / PDF 117), como indica la activación del talento; el texto de Archivo de las Tormentas la da como acción gratuita.',
    specialties: [ALBOROTADOR, PISTOLERO, SOLDADO_NDB],
  }),
  // Líder (L.118-125 / PDF 124-131; diagram L.120-121 / PDF 126-127)
  caminoNdB('lider', {
    definition: 'Los líderes hacen más que decidir: son faros que motivan y rocas contra las que se rompe el miedo. Asumen responsabilidad, guía y mentoría, con obstinación o con confianza serena en el éxito. Un buen Líder convierte incluso un desastre en victoria y confía las riendas del destino a sus aliados.',
    // L.119 / PDF 125: Nacidos de la bruma precisa que el dado de mando puede llegar a d12 (el texto de este talento en Archivo de las Tormentas solo dice que empieza en d4)
    mainTalentEffect: 'Obtienes un dado de mando (d4, que puede aumentar hasta d12). Gasta 1 concentración para elegir un aliado al que puedes influir a 6 metros o menos. La próxima vez que realice una prueba, podrá tirar tu dado de mando junto con los demás dados y añadir su resultado al de uno de sus dados.',
    // L.118 / PDF 124: the book gives two profiles; the skills are listed as «Armamento pesado, Atletismo, Engaño y Deducción o Armamento ligero,
    // Intimidación, Liderazgo y Persuasión», which does not say which group goes with which profile, so they are kept as one list
    recommendedAttributes: ['Presencia, Fuerza y Voluntad (líder orientado al combate)', 'Intelecto y Discernimiento (grupos sociales o empresariales)'],
    recommendedSkills: ['Armamento ligero', 'Armamento pesado', 'Atletismo', 'Deducción', 'Engaño', 'Intimidación', 'Liderazgo', 'Persuasión'],
    specialties: [OFICIAL_NDB, PLANIFICADOR, POLITICO_NDB],
  }),
]
