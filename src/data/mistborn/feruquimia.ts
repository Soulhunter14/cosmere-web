/**
 * Feruquimia (feruchemy) of Nacidos de la bruma: the 17 powers (16 metals + atium) with their two basic actions, creative uses and
 * talent trees (chapter 6, L.213-250 / PDF 219-256) plus the medallion ranks of chapter 8 (L.294 / PDF 300).
 *
 * Source and conventions:
 * - Read from the text layer of the manual (name, prerequisite and activation icon of the 85 talents machine-compared with it) and checked
 *   against the rendered images of the 16 tree diagrams, of the medallion table and of the aluminio and nicrosil pages. Talent entries are
 *   transcribed from the full text of each talent; `prereq` is the book's «Prerrequisito:» line (literal, `;`
 *   between clauses, as `parsePrereq` expects). Where the diagram and the text disagree, the text wins (08 §6 rule) and the talent carries
 *   a `notaLibro` (Velocista de acero, Aparentar la edad, Plena forma and Vínculo instantáneo: icon mismatches or a missing icon).
 * - Names, prerequisites and activation icons are the book's; `description`, `descripcion` and the other prose are short paraphrases in own
 *   words, not quotations. Glyphs of «Activación:»: 1/2/3 = action1/2/3, 0 = free, r = reaction, * = special, 8 = passive.
 * - `acciones` is `[almacenar, decantar]` (the same two objects, built by `poder()`); the `duracion` of Almacenar is the rule to gain a
 *   charge. `eras` is copied from `METALES` (single source, T16). The marks `[inferido]` are on the few items the book does not state.
 * - Trees: «Reflejos acelerados» is in acero and in cinc (same text, different prerequisite); «Precisión de estaño», «Armamento de brazo
 *   de peltre» and «Lanzador de peltre» share their name with the alomancy talents of T17 (§7.7 #3). 85 talents, 84 distinct names;
 *   aluminio has 3 and nicrosil none (its entry has no talents block).
 * Heavy module: it is loaded only through `WorldData` (lazy); nothing in the main bundle imports it (§8, risk 6).
 */
import type { Talento } from '../potencias'
import { getMetal, type CaminoMetalId, type MetalId } from './metales'
import type { AccionPoder, PoderFeruquimico, UsoCreativo } from './tipos'

/** Maintenance clause shared by almost every Decantar action («Antes de que termine… gastando 1 carga… como 0») */
const MANTENER = 'Antes de que termine, puedes mantenerla durante la misma duración gastando 1 carga como acción gratuita.'
const DECANTAR_DURACION = 'Tantas rondas como grados en Feruquimia'

interface DatosPoder {
  metal: MetalId
  caminos: CaminoMetalId[]
  descripcion: string
  almacenar: AccionPoder
  decantar: AccionPoder
  usosCreativos: UsoCreativo[]
  talentos: Talento[]
  cargasConVinculo: boolean
  tablaPorGrados?: PoderFeruquimico['tablaPorGrados']
  medallon: PoderFeruquimico['medallon']
  notaLibro?: string
}

/**
 * Builds a feruchemical power: everything that follows from the metal (id, name, eras) or from the art (attribute, `requiereMeta`: only
 * alomancia de atium skips the goal, L.177 / PDF 183; `acciones`) is derived here once, so the 17 entries cannot disagree. `costoBase` is
 * the activation of the first action (tipos.ts).
 */
function poder(d: DatosPoder): PoderFeruquimico {
  const metal = getMetal(d.metal)
  return {
    ...d,
    id: `feruquimia:${d.metal}`,
    name: `Feruquimia de ${metal.nombre.toLowerCase()}`,
    arte: 'feruquimia',
    atributo: 'Intelecto',
    costoBase: d.almacenar.activacion,
    eras: [...metal.eras],
    requiereMeta: true,
    acciones: [d.almacenar, d.decantar],
  }
}

// ── Acero · L.213-215 / PDF 219-221 ──────────────────────────────────────────────────────────────────────────────────────────────
const ACERO = poder({
  metal: 'acero',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.213 / PDF 219
  descripcion:
    'Almacena velocidad física en una menteacero: mientras almacenas te mueves con letargo, como si avanzaras por melaza, y al decantar ' +
    'te desplazas muchas veces más rápido de lo normal, hasta parecer un borrón. Los feruquimistas de acero son los mensajeros de acero; ' +
    'su cuerpo compensa en parte la aceleración y procesan el entorno como si fueran a velocidad normal.',
  almacenar: {
    nombre: 'Almacenar velocidad',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas velocidad hasta que le pones fin con una acción gratuita o gastas una carga de la menteacero. Tras cada escena en la que ' +
      'hayas almacenado durante toda su duración, la mente gana 1 carga.',
    efectos: ['Pasas a estar Mermado [Velocidad −1].', 'Solo puedes usar la acción Moverse una vez en cada uno de tus turnos.'],
  },
  decantar: {
    nombre: 'Decantar velocidad',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la menteacero para acelerarte durante tantas rondas como grados tengas en Feruquimia (o hasta que empieces a ' +
      'almacenar velocidad).',
    efectos: ['Pasas a estar Mejorado [Velocidad +2].', 'Una vez en cada uno de tus turnos puedes usar la acción Moverse como acción gratuita.'],
  },
  usosCreativos: [
    { nombre: 'Fingir la muerte', texto: 'Almacenas velocidad para ralentizar los latidos y el metabolismo hasta aparentar haber fallecido.' },
    { nombre: 'Escuadrón ficticio', texto: 'Decantas velocidad para moverte tan deprisa que, por un instante, parece que estés en varios lugares a la vez.' },
    {
      nombre: 'Escabullirse',
      texto: 'Almacenas velocidad en un entorno con poca visibilidad para moverte con más lentitud y deliberación, sin llamar la atención.',
    },
  ],
  talentos: [
    {
      name: 'Carrera de acero auténtica',
      cost: 'special',
      prereq: 'talento Reflejos acelerados o talento Estallido de velocidad',
      description:
        'Al Decantar velocidad puedes gastar cualquier número de cargas hasta tu límite de artes metálicas y renunciar a los efectos y la ' +
        'duración habituales: hasta el final de tu próximo turno quedas Mejorado [Velocidad] con una bonificación de 1 + las cargas gastadas ' +
        'y puedes usar Moverse como acción gratuita tantas veces por turno como cargas hayas invertido. Puedes mantenerla gastando 1 o más ' +
        'cargas como acción gratuita.',
    },
    {
      name: 'Esquiva acelerada',
      cost: 'passive',
      prereq: 'poder Feruquimia de acero',
      description: 'Cuando usas la reacción Esquivar mientras decantas velocidad, el ataque que la provoca no puede hacerte ni un rasguño.',
    },
    {
      name: 'Estallido de velocidad',
      cost: 'free',
      prereq: 'Feruquimia 3 o más; talento Repetir jugada',
      description:
        'Mientras decantas velocidad, gastas 1 carga de la menteacero para obtener 2 acciones que solo sirven para Prevenirse, ' +
        'Destrabarse, Interactuar, Moverse o cualquier acción con prueba física. En una conversación o empeño puedes usarlas para hacer ' +
        'una contribución adicional en la ronda, con esas mismas limitaciones.',
    },
    {
      name: 'Reflejos acelerados',
      cost: 'action1',
      prereq: 'Feruquimia 3 o más; talento Esquiva acelerada',
      description:
        'Mientras decantas velocidad física o mental, gastas 1 carga de la menteacero o de la mentecinc correspondiente para agilizar tus ' +
        'reflejos hasta el inicio de tu próximo turno: al inicio del turno de cada otro personaje obtienes 1 reacción adicional hasta el ' +
        'final de ese turno. Mismo talento, con otro prerrequisito, en la feruquimia de cinc.',
    },
    {
      name: 'Repetir jugada',
      cost: 'action1',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de acero',
      description:
        'Mientras decantas velocidad, gastas 1 punto de concentración para repetir una acción que ya usaste este turno. La acción debe ' +
        'costar 1 acción (no la pagas de nuevo) e incluir una prueba física, como Obtener ventaja, Acometida o Usar una habilidad.',
    },
    {
      name: 'Velocista de acero',
      cost: 'passive',
      prereq: 'talento Repetir jugada',
      description:
        'Antes de que empiece una escena puedes gastar 1 carga de la menteacero para llegar antes al destino: en combate, si juegas un ' +
        'turno rápido en la primera ronda obtienes 2 acciones adicionales; en una conversación o empeño, una contribución adicional en ' +
        'la primera ronda.',
      notaLibro:
        'Errata de icono: el diagrama del árbol (L.214 / PDF 220) marca Velocista de acero con ★ (activación especial), pero la entrada ' +
        'del talento (L.215 / PDF 221) indica ∞ (siempre activo). Se transcribe el texto de la entrada.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 2 }, // L.294 / PDF 300
})

// ── Aluminio · L.216-217 / PDF 222-223 ───────────────────────────────────────────────────────────────────────────────────────────
const ALUMINIO = poder({
  metal: 'aluminio',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.216 / PDF 222
  descripcion:
    'Almacena tu Identidad espiritual en una mentealuminio. Mientras almacenas te vuelves más susceptible a la influencia externa ' +
    '(aplacamiento, encendido…); al decantar resulta muy difícil influirte, por medios Investidos o mundanos. Sus usuarios, los genuinos, ' +
    'no entienden del todo qué hacen y solo se conocen unos pocos efectos básicos.',
  almacenar: {
    nombre: 'Almacenar Identidad',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas Identidad hasta que le pones fin con una acción gratuita o gastas una carga de la mentealuminio. Tras cada escena en la que ' +
      'hayas almacenado durante toda su duración, la mente gana 1 carga.',
    efectos: ['Resistirte a la influencia te cuesta 1 punto de concentración adicional.', 'Tu Defensa espiritual se reduce en 2.'],
  },
  decantar: {
    nombre: 'Decantar Identidad',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga para decantar Identidad durante tantas rondas como grados tengas en Feruquimia (o hasta que empieces a almacenarla).',
    efectos: ['Resistirte a la influencia te cuesta 2 puntos de concentración menos.', 'Tu Defensa espiritual aumenta en 4.'],
  },
  usosCreativos: [
    // [inferido] names: the book lists these four ideas as bullets without a title (L.216 / PDF 222)
    { nombre: 'Facilitar el encendido de un aliado', texto: 'Almacenar Identidad te hace más permeable a que un aliado te encienda con alomancia de cinc.' },
    { nombre: 'Resistir tu obstáculo', texto: 'Ayuda a resistir el impulso de sucumbir a tu obstáculo en un momento de debilidad.' },
    { nombre: 'Sellos de alma', texto: 'Hace que la Falsificación de un sello de alma se adhiera mejor a ti.' },
    {
      nombre: 'Reclamación de luz tormentosa',
      texto: 'Si eres Radiante, es posible que te permita usar el talento Reclamación de luz tormentosa en la infusión de otro Radiante.',
    },
  ],
  talentos: [
    {
      name: 'Introspección experta',
      cost: 'special',
      prereq: 'Perspicacia 2 o más; poder Feruquimia de aluminio',
      description:
        'Mientras decantas Identidad, tu valor de desvío también se aplica al daño espiritual. Además, tras un descanso largo puedes renunciar ' +
        'a sus beneficios habituales para obtener los de la actividad de reposo Autorreflexión, sin gastar arquillas.',
    },
    {
      name: 'Motivación esencial',
      cost: 'passive',
      prereq: 'poder Feruquimia de aluminio',
      description:
        'Mientras decantas Identidad, recuperas 1 punto de concentración al final de cada uno de tus turnos en el que hayas actuado de acuerdo ' +
        'con tu propósito, tu obstáculo o alguna de tus metas (a discreción de la DJ).',
    },
    {
      name: 'Quintaesencia inamovible',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Introspección experta',
      description:
        'Al Decantar Identidad puedes gastar cualquier número de cargas hasta tu límite de artes metálicas y renunciar a los efectos normales: ' +
        'hasta el final de tu próximo turno, resistirte a una influencia cuesta 1 + las cargas gastadas menos de concentración, tu Defensa ' +
        'espiritual aumenta en 2 + el doble de las cargas gastadas y los ataques contra tu Defensa espiritual no pueden hacerte ni un ' +
        'rasguño. Puedes mantenerla gastando 1 o más cargas como acción gratuita.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 1 }, // L.294 / PDF 300
  notaLibro:
    'El texto de la entrada habla de los genuinos «a lo largo de ambas eras» (L.216 / PDF 222), pero la tabla «Metales en la feruquimia» ' +
    '(L.171 / PDF 177) da el aluminio en Era 2 † (aparece a finales de la Era 1) y la tabla de L.372 / PDF 378 no lo ofrece a ningún camino ' +
    'de Era 1. Se conservan las eras de la tabla de metales; no ampliarlas sin confirmarlo [inferido].',
})

// ── Atium · L.218-219 / PDF 224-225 ──────────────────────────────────────────────────────────────────────────────────────────────
const ATIUM = poder({
  metal: 'atium',
  caminos: ['feruquimista'], // L.219 / PDF 225: solo «el talento principal del camino de feruquimista»
  descripcion:
    'Almacena juventud en una menteatium: mientras almacenas el cuerpo envejece físicamente y al decantar rejuvenece, incluso hasta la ' +
    'infancia. Cambian las facultades mentales y físicas, pero no la personalidad, los conocimientos ni las habilidades, y no puedes llegar ' +
    'a morir ni a dejar de existir. No se conoce ningún ferrin de atium (los eruditos terrisanos los llaman cronodevanadores); el «atium» ' +
    'que casi todos conocen es una variedad contaminada con electro y no el metal divino puro (recuadro «Atium auténtico»).',
  almacenar: {
    nombre: 'Almacenar juventud',
    activacion: 'action1',
    duracion: '1 carga por categoría de edad y por escena',
    coste: 'Ninguno',
    descripcion:
      'Envejeces físicamente de forma temporal y almacenas juventud hasta que le pones fin con una acción gratuita o gastas una carga de la ' +
      'menteatium. Eliges una categoría de edad mayor que tu edad cronológica. Tras cada escena en la que hayas almacenado durante toda su ' +
      'duración, la mente gana 1 carga por cada categoría de edad que la edad física elegida supere a tu edad cronológica (de Joven a Anciano: 2 cargas).',
    efectos: [
      'Tu cuerpo envejece a la categoría de edad física elegida.',
      'Tu tamaño cambia para ajustarse a la edad física (de Joven a Muy joven, de Mediano a Pequeño); tus pertenencias no cambian contigo.',
    ],
    opciones: [
      { nombre: 'Muy joven', descripcion: 'Categoría de edad 1; solo si supera tu edad cronológica.' },
      { nombre: 'Joven', descripcion: 'Categoría de edad 2; solo si supera tu edad cronológica.' },
      { nombre: 'Maduro', descripcion: 'Categoría de edad 3; solo si supera tu edad cronológica.' },
      { nombre: 'Anciano', descripcion: 'Categoría de edad 4; solo si supera tu edad cronológica.' },
      { nombre: 'Muy anciano', descripcion: 'Categoría de edad 5; solo si supera tu edad cronológica.' },
    ],
  },
  decantar: {
    nombre: 'Decantar juventud',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: 'Una o más cargas (ignora el límite de artes metálicas)',
    mantener:
      'Antes de que termine, puedes mantener la edad física actual durante la misma duración gastando el mismo número de cargas como acción gratuita.',
    descripcion:
      'Gastas 1 o más cargas de la menteatium, sin tener en cuenta tu límite de artes metálicas, para rejuvenecer físicamente durante tantas ' +
      'rondas como grados tengas en Feruquimia (o hasta que empieces a almacenar juventud). Rejuveneces respecto a tu edad cronológica tantas ' +
      'categorías de edad como cargas hayas gastado, con un mínimo de Muy joven.',
    efectos: ['Tu tamaño cambia para ajustarse a la edad física, como al almacenar.'],
    opciones: [
      { nombre: 'Muy joven', descripcion: 'Categoría de edad 1 (el mínimo al rejuvenecer).' },
      { nombre: 'Joven', descripcion: 'Categoría de edad 2.' },
      { nombre: 'Maduro', descripcion: 'Categoría de edad 3.' },
      { nombre: 'Anciano', descripcion: 'Categoría de edad 4.' },
      { nombre: 'Muy anciano', descripcion: 'Categoría de edad 5.' },
    ],
  },
  usosCreativos: [
    {
      nombre: 'Pasar inadvertido',
      texto: 'Muchos personajes ignoran o menosprecian a los niños; unido al tamaño reducido, merodear sin que te detecten resulta más fácil.',
    },
    {
      nombre: 'Anciano venerable',
      texto: 'Algunas culturas respetan mucho a los mayores: aparentar su categoría de edad o una superior puede facilitar que te escuchen.',
    },
    {
      nombre: '¿Quién es usted?',
      texto: 'Quien te conoce pero espera a alguien de otra edad probablemente no te reconozca, e incluso podría confundirte con un pariente.',
    },
  ],
  talentos: [
    {
      name: 'Aparentar la edad',
      cost: 'passive',
      prereq: 'Engaño 2 o más; poder Feruquimia de atium',
      description:
        'Obtienes ventaja en las pruebas que usen el atributo Presencia para influir en un personaje de tu misma categoría de edad física.',
      notaLibro:
        'Errata de icono: en el diagrama del árbol (L.219 / PDF 225) los iconos de Aparentar la edad (▶, 1 acción) y de Plena forma (∞, siempre ' +
        'activo) están intercambiados respecto a las entradas, que dan ∞ y ▶ respectivamente. Se transcribe el texto de las entradas.',
    },
    {
      name: 'Plena forma',
      cost: 'action1',
      prereq: 'Feruquimia 3 o más; poder Feruquimia de atium',
      description:
        'Si tu categoría de edad cronológica es Maduro o superior, gastas 2 cargas de la menteatium para pasar a ser físicamente Joven y ' +
        'quedar Mejorado [+1 a todos los atributos] hasta el final de tu próximo turno. Puedes mantenerlo gastando 2 cargas como acción gratuita.',
      notaLibro:
        'Errata de icono: el diagrama del árbol (L.219 / PDF 225) marca Plena forma con ∞, pero su entrada (L.219 / PDF 225) indica ▶ (1 acción); ' +
        'ver Aparentar la edad. Se transcribe el texto de la entrada.',
    },
  ],
  cargasConVinculo: false,
  // [inferido] el atium no aparece en la tabla de medallones (L.294 / PDF 300): no se ofrece a los personajes
  medallon: { disponibleParaPJ: false, rangoRecompensa: null },
})

// ── Bendaleo · L.220-221 / PDF 226-227 ───────────────────────────────────────────────────────────────────────────────────────────
const BENDALEO = poder({
  metal: 'bendaleo',
  caminos: ['ferrin', 'nacidoble'], // L.220 / PDF 226
  descripcion:
    'Almacena nutrición e hidratación en una mentebendaleo: mientras almacenas puedes comer o beber sin límite y sin perder el apetito, y al ' +
    'decantar absorbes ese sustento directamente, de modo que puedes pasar largos periodos sin comer ni beber. Los incorporadores avezados ' +
    'también almacenan medicinas o venenos ingeribles.',
  almacenar: {
    nombre: 'Almacenar nutrición',
    activacion: 'action1',
    duracion: '1 carga por cada día de comida o bebida',
    coste: 'Ninguno',
    descripcion:
      'Comes o bebes sin absorber los nutrientes y almacenas la nutrición hasta que le pones fin con una acción gratuita o gastas una carga de ' +
      'la mentebendaleo. Consumir el equivalente a un día de comida o agua lleva más o menos un minuto en la narrativa y añade 1 carga.',
    efectos: ['Consumes alimentos y líquidos con normalidad, pero no te sientes saciado ni cubres tus necesidades nutricionales.'],
  },
  decantar: {
    nombre: 'Decantar nutrición',
    activacion: 'action1',
    duracion: 'Instantánea',
    coste: '1 carga',
    descripcion: 'Gastas 1 carga de la mentebendaleo para sustentarte.',
    efectos: [
      'Quedas alimentado e hidratado como si hubieras consumido un día de comida y agua.',
      'Si estás Agotado, reduces la penalización de ese estado en 2.',
    ],
  },
  usosCreativos: [
    { nombre: 'Permanecer oculto mucho tiempo', texto: 'Decantas nutrición para mantenerte sano aunque no puedas abandonar un espacio reducido.' },
    { nombre: 'Mantenimiento de reservas', texto: 'Almacenas nutrición rica en nutrientes específicos al viajar por regiones donde podrían escasear.' },
    { nombre: 'Ganar concursos de comida', texto: 'Almacenas nutrición para ingerir cantidades legendarias de comida de una sola sentada.' },
  ],
  talentos: [
    {
      name: 'Dosis de prevención',
      cost: 'passive',
      prereq: 'Medicina 3 o más; talento Nutrición proactiva',
      description:
        'Mientras almacenas nutrición puedes consumir una medicina ingerible (por ejemplo, una tónica) y guardarla en una carga de la ' +
        'mentebendaleo sin sufrir su efecto; anotas qué medicina queda vinculada a esa carga. Al gastarla más adelante obtienes los ' +
        'beneficios de esa medicina en lugar de sustentarte.',
    },
    {
      name: 'Impulso de energía',
      cost: 'special',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de bendaleo',
      description:
        'Al Decantar nutrición puedes gastar cualquier número de cargas hasta tu límite de artes metálicas. En su lugar recuperas salud igual ' +
        'a 1d4 (tu dado de artes metálicas, que crece con tus grados) más las cargas gastadas, y reduces la penalización de Agotado en 2 por ' +
        'cada carga invertida.',
    },
    {
      name: 'Nutrición constante',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Nutrición proactiva',
      description:
        'Cuando uses Nutrición proactiva y el nuevo resultado siga siendo inferior a tus grados en Feruquimia, puedes sustituir un dado de ' +
        'esa prueba (que no sea el de trama) por un valor igual a tus grados en Feruquimia.',
    },
    {
      name: 'Nutrición proactiva',
      cost: 'special',
      prereq: 'Medicina 2 o más; poder Feruquimia de bendaleo',
      description:
        'Al hacer una prueba, puedes gastar 1 carga de la mentebendaleo para volver a tirar un dado (que no sea el de trama) cuyo ' +
        'resultado sea inferior a tus grados en Feruquimia.',
    },
    {
      name: 'Ruina de envenenadores',
      cost: 'passive',
      prereq: 'Medicina 4 o más; talento Dosis de prevención',
      description:
        'Mientras almacenas nutrición puedes consumir un veneno ingerible (o una toxina similar) y guardarlo en una carga sin sufrir sus ' +
        'efectos; anotas qué veneno queda vinculado (a discreción de la DJ, algunos no pueden almacenarse así). Al gastar esa carga toleras ' +
        'el veneno: hasta el final de la escena tienes éxito automático en las pruebas para resistirlo.',
    },
  ],
  cargasConVinculo: true, // con Dosis de prevención y Ruina de envenenadores se anota qué medicina o veneno guarda cada carga
  medallon: { disponibleParaPJ: true, rangoRecompensa: 1 }, // L.294 / PDF 300
  notaLibro:
    'Consejo para la DJ (L.220 / PDF 226): en las novelas los incorporadores no almacenan nutrición e hidratación en la misma mente y suelen ' +
    'llevar dos; el JdR lo simplifica con una sola mentebendaleo. Variante opcional: dos mentes (una para nutrición y otra para hidratación) ' +
    'repartiendo entre ellas el máximo de cargas, y la DJ decide a cuál va cada carga; incluso una mente independiente para cada medicina.',
})

// ── Bronce · L.222-223 / PDF 228-229 ─────────────────────────────────────────────────────────────────────────────────────────────
const BRONCE = poder({
  metal: 'bronce',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.222 / PDF 228
  descripcion:
    'Almacena desvelo en una mentebronce; es el único rasgo feruquímico que se puede almacenar durmiendo, en un estado casi comatoso poco ' +
    'reparador del que cuesta mucho despertar (los más expertos almacenan despiertos, con la sensación de estar faltos de sueño). Al decantar ' +
    'te vuelves más alerta y recuperas el vigor al instante: por eso se llama centinelas a sus usuarios.',
  almacenar: {
    nombre: 'Almacenar desvelo',
    activacion: 'action1',
    duracion: '1 carga o más por descanso (corto: 1 carga; largo: tantas como grados en Feruquimia)',
    coste: 'Ninguno',
    descripcion:
      'Almacenas desvelo hasta que le pones fin con una acción gratuita o gastas una carga de la mentebronce. Después de cada descanso en el ' +
      'que hayas almacenado durante toda su duración, la mente gana 1 carga tras un descanso corto y tantas cargas como tus grados en ' +
      'Feruquimia tras un descanso largo.',
    efectos: [
      'Sientes una vaga somnolencia y falta de sueño.',
      'Los descansos cortos y largos no surten sus efectos habituales: al empezar uno quedas Inconsciente en un sueño profundo durante toda ' +
        'su duración, sigues almacenando hasta despertar y no puedes despertar antes salvo que sufras daño u otro perjuicio.',
    ],
  },
  decantar: {
    nombre: 'Decantar desvelo',
    activacion: 'action1',
    duracion: 'Instantánea',
    coste: '1 carga (2 cargas, sin acción, para el descanso largo)',
    descripcion:
      'Gastas 1 carga de la mentebronce para recuperar salud y/o concentración de inmediato, como si acabaras de terminar un descanso corto. ' +
      'Además, cuando empiezas un descanso largo pero no puedes terminarlo, puedes gastar 2 cargas (sin acción) para recuperar salud y ' +
      'concentración y reducir tu penalización de Agotado como si lo hubieras terminado.',
  },
  usosCreativos: [
    {
      nombre: 'Noche en vela',
      texto:
        'En un descanso largo decantas desvelo mientras tus aliados duermen; podrías obtener uno de los beneficios alternativos de un ' +
        'descanso corto (como una prueba de Supervivencia para recolectar recursos) además de las ventajas del descanso largo.',
    },
    { nombre: 'Ayuda para dormir', texto: 'Almacenas desvelo para obligarte a dormir, aliviando el insomnio crónico o calmando una mente ansiosa.' },
    {
      nombre: 'Productividad incansable',
      texto: 'Avanzas al doble de velocidad en una actividad de periodo de reposo decantando desvelo para trabajar toda la noche.',
    },
  ],
  talentos: [
    {
      name: 'Almacenamiento soñoliento',
      cost: 'special',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de bronce',
      description:
        'Almacenas desvelo sin dormir: pasas a estar Agotado [−2] hasta que dejes de almacenar y, si estabas Concentrado, pierdes ese estado ' +
        'y no puedes recuperarlo mientras tanto; la primera vez en cada escena que lo pierdes así, la mente gana 1 carga adicional. Además, ' +
        'tras cada escena en la que hayas almacenado de este modo durante toda su duración, ganas 1 carga. No puedes usarlo si tu penalización ' +
        'de Agotado pasara a ser 10 o más.',
    },
    {
      name: 'Centinela concentrado',
      cost: 'action1',
      prereq: 'Feruquimia 2 o más; talento Despierto y alerta',
      description:
        'Gastas 1 carga de la mentebronce para pasar a estar Concentrado hasta el final de tu próximo turno (o hasta que empieces a almacenar ' +
        'desvelo). Puedes mantenerlo gastando 1 carga como acción gratuita.',
    },
    {
      name: 'Despierto y alerta',
      cost: 'action1',
      prereq: 'poder Feruquimia de bronce',
      description:
        'Gastas 1 carga de la mentebronce para pasar a estar Mejorado [Intelecto +1] y Mejorado [Discernimiento +1] durante tantas rondas ' +
        'como grados tengas en Feruquimia (o hasta que empieces a almacenar desvelo). Puedes mantenerlo gastando 1 carga como acción gratuita.',
    },
    {
      name: 'Siesta reparadora',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Despierto y alerta',
      description:
        'Al Decantar desvelo puedes gastar cualquier número de cargas hasta tu límite de artes metálicas. Por cada carga obtienes de ' +
        'inmediato los beneficios de recuperación de un descanso corto (con 2 cargas tiras dos veces tu dado de recuperación y repartes el ' +
        'total entre salud y concentración).',
    },
    {
      name: 'Sueño instantáneo',
      cost: 'action2',
      prereq: 'Feruquimia 4 o más; talento Siesta reparadora',
      description:
        'Una vez por escena, gastas 5 cargas de la mentebronce para reducir tu penalización de Agotado y recuperar salud y concentración ' +
        'como si acabaras de terminar un descanso largo.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 2 }, // L.294 / PDF 300
})

// ── Cadmio · L.224-225 / PDF 230-231 ─────────────────────────────────────────────────────────────────────────────────────────────
const CADMIO = poder({
  metal: 'cadmio',
  caminos: ['ferrin', 'nacidoble'], // L.224 / PDF 230
  descripcion:
    'Almacena aliento: cargas la mentecadmio con una respiración agitada (hiperventilación) y más tarde la decantas para liberar oxígeno ' +
    'directamente en la sangre, lo que permite proezas de concentración y resistencia. Los resollantes lo usan para acelerar su ' +
    'recuperación, ganar energía en momentos críticos o dejar de respirar un tiempo mientras actúan con normalidad.',
  almacenar: {
    nombre: 'Almacenar aliento',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas aliento mediante la hiperventilación hasta que le pones fin con una acción gratuita. Tras cada escena en la que hayas ' +
      'almacenado durante toda su duración, la mentecadmio gana 1 carga.',
    efectos: [
      'Para jugar un turno rápido debes gastar 1 punto de concentración.',
      'Cualquier otra capacidad que cueste concentración te cuesta 1 punto adicional.',
    ],
  },
  decantar: {
    nombre: 'Decantar aliento',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la mentecadmio para oxigenarte durante tantas rondas como grados tengas en Feruquimia (o hasta que empieces a ' +
      'almacenar aliento).',
    efectos: [
      'No necesitas respirar: en un entorno sin aire o con aire irrespirable no te asfixias.',
      'Al usar una reacción o una acción gratuita, su coste de concentración se reduce en 1.',
    ],
  },
  usosCreativos: [
    { nombre: 'Inmovilidad absoluta', texto: 'Decantas aliento para oxigenarte sin el ruido ni el movimiento de la respiración y ocultarte mejor.' },
    { nombre: 'Optimización del ejercicio', texto: 'Almacenas aliento para simular condiciones de poco oxígeno durante tu entrenamiento físico.' },
    { nombre: 'Fingir la muerte', texto: 'Decantas aliento para aparentar haber fallecido ante quien te observe desde la distancia.' },
  ],
  talentos: [
    {
      name: 'Entrenamiento en privación',
      cost: 'passive',
      prereq: 'Atletismo 2 o más; poder Feruquimia de cadmio',
      description:
        'La duración de Decantar aliento se duplica (hasta el doble de tus grados en Feruquimia). Además, mientras no estés decantando ni ' +
        'almacenando aliento, la primera vez en cada escena que uses una reacción o una acción gratuita que cueste concentración, ese coste ' +
        'se reduce en 1.',
    },
    {
      name: 'Estallido de recuperación',
      cost: 'passive',
      prereq: 'Atletismo 3 o más; talento Excelencia aeróbica',
      description:
        'Al recuperar salud o concentración mientras decantas aliento, aumentas la cantidad recuperada en un valor igual a tus grados en Feruquimia.',
    },
    {
      name: 'Excelencia aeróbica',
      cost: 'passive',
      prereq: 'Feruquimia 3 o más; talento Entrenamiento en privación',
      description:
        'Tus acciones Decantar aliento, Entrenamiento en privación y Oxigenación potenciada reducen el coste de concentración de todas ' +
        'tus acciones, no solo el de las reacciones y las acciones gratuitas.',
    },
    {
      name: 'Oxigenación potenciada',
      cost: 'special',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de cadmio',
      description:
        'Al Decantar aliento puedes gastar cualquier número de cargas hasta tu límite de artes metálicas: el coste de concentración de tus ' +
        'reacciones y acciones gratuitas se reduce en tantos puntos como cargas gastadas (en lugar de en 1). Puedes mantenerla gastando 1 o ' +
        'más cargas como acción gratuita.',
    },
    {
      name: 'Resistencia feruquímica',
      cost: 'action1',
      prereq: 'talento Oxigenación potenciada',
      description: 'Mientras estés Afligido o Desorientado, gastas 1 carga de la mentecadmio para eliminar ese estado.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 1 }, // L.294 / PDF 300
})

// ── Cinc · L.226-227 / PDF 232-233 ───────────────────────────────────────────────────────────────────────────────────────────────
const CINC = poder({
  metal: 'cinc',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.226 / PDF 232
  descripcion:
    'Almacena velocidad mental en una mentecinc: mientras almacenas tus pensamientos se ralentizan; al decantar asimilas datos con rapidez, ' +
    'planificas por adelantado y llegas a conclusiones precisas mientras el mundo parece moverse a cámara lenta. Los chispeantes sienten ' +
    'enseguida hambre al decantar, porque pensar tan rápido consume calorías extra.',
  almacenar: {
    nombre: 'Almacenar velocidad mental',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas velocidad mental hasta que le pones fin con una acción gratuita o gastas una carga de la mentecinc. Tras cada escena en la ' +
      'que hayas almacenado durante toda su duración, la mente gana 1 carga.',
    efectos: [
      'Pasas a estar Mermado [Intelecto −1].',
      'Usar la acción Prepararse te cuesta 1 acción adicional.',
      'Al emplear el atributo Intelecto con las acciones Obtener ventaja o Usar una habilidad, el coste aumenta en 1 acción adicional.',
    ],
  },
  decantar: {
    nombre: 'Decantar velocidad mental',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la mentecinc para agilizar tus pensamientos durante tantas rondas como grados tengas en Feruquimia (o hasta que ' +
      'empieces a almacenar velocidad mental).',
    efectos: [
      'Pasas a estar Mejorado [Intelecto +2].',
      'Una vez en cada uno de tus turnos puedes usar como acción gratuita una de estas: Prepararse (pagando las acciones de la acción que ' +
        'preparas), Obtener ventaja usando Intelecto o Usar una habilidad usando Intelecto.',
    ],
  },
  usosCreativos: [
    {
      nombre: 'Dejar pasar el tiempo',
      texto:
        'Almacenas velocidad mental para ralentizar tus pensamientos y que el tiempo parezca transcurrir más deprisa, reduciendo el impacto ' +
        'psicológico de las esperas largas.',
    },
    {
      nombre: 'Predicción',
      texto:
        'Decantas velocidad mental para anticipar cómo actuará un personaje en su próximo turno; por ejemplo, con una prueba de Deducción ' +
        'contra su Defensa cognitiva para saber si jugará un turno rápido o lento, qué acción usará o a quién atacará.',
    },
  ],
  talentos: [
    {
      name: 'Ayuda chispeante',
      cost: 'passive',
      prereq: 'poder Feruquimia de cinc',
      description:
        'Cuando usas la reacción Ayudar mientras decantas velocidad mental, tu aliado puede elegir uno de sus dados tras tirarlos (que no ' +
        'sea el de trama) y sumarle una bonificación igual a tus grados en Feruquimia.',
    },
    {
      name: 'Chispa auténtica',
      cost: 'special',
      prereq: 'talento Reflejos acelerados o Rapidez mental',
      description:
        'Al Decantar velocidad mental puedes gastar cualquier número de cargas hasta tu límite de artes metálicas y renunciar a los efectos ' +
        'y la duración habituales: hasta el final de tu próximo turno quedas Mejorado [Intelecto] con una bonificación de 1 + las cargas ' +
        'gastadas y, al usar este talento y al inicio de cada uno de tus turnos, obtienes tantas acciones como velocidad mental estés ' +
        'decantando, solo para Prepararse, Obtener ventaja con Intelecto o Usar una habilidad con Intelecto. Puedes mantenerla gastando 1 o ' +
        'más cargas como acción gratuita.',
    },
    {
      name: 'Doble pensamiento',
      cost: 'action1',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de cinc',
      description:
        'Mientras decantas velocidad mental, gastas 1 punto de concentración para repetir una acción que ya usaste este turno. La acción ' +
        'debe costar 1 acción (no la pagas de nuevo) e incluir una prueba con Discernimiento, Intelecto o Voluntad (Obtener ventaja, Usar ' +
        'una habilidad o una acción que requiera una prueba de Alomancia).',
    },
    {
      name: 'Momento eureka',
      cost: 'action1',
      prereq: 'Deducción 2 o más; talento Doble pensamiento',
      description:
        'Gastas 1 carga de la mentecinc para tener una epifanía sobre la escena: a discreción de la DJ averiguas algo interesante, ' +
        'sospechoso, inusual o digno de investigar sobre tu entorno o sobre un personaje presente; si no hay nada relevante, obtienes en ' +
        'su lugar una Oportunidad.',
    },
    {
      name: 'Rapidez mental',
      cost: 'free',
      prereq: 'Feruquimia 3 o más; talento Doble pensamiento',
      description:
        'Mientras decantas velocidad mental, gastas 1 carga de la mentecinc para obtener 2 acciones que solo sirven para Prepararse, ' +
        'Recuperarse o cualquier acción con prueba de Discernimiento, Intelecto o Voluntad. En una conversación o empeño puedes usarlas ' +
        'para aportar una contribución adicional en la ronda, con esas mismas limitaciones.',
    },
    {
      name: 'Reflejos acelerados',
      cost: 'action1',
      prereq: 'Feruquimia 3 o más; talento Ayuda chispeante',
      description:
        'Mientras decantas velocidad física o mental, gastas 1 carga de la menteacero o de la mentecinc correspondiente para agilizar tus ' +
        'reflejos hasta el inicio de tu próximo turno: al inicio del turno de cada otro personaje obtienes 1 reacción adicional hasta el ' +
        'final de ese turno. Mismo talento, con otro prerrequisito, en la feruquimia de acero.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 1 }, // L.294 / PDF 300
})

// ── Cobre · L.228-230 / PDF 234-236 ──────────────────────────────────────────────────────────────────────────────────────────────
const COBRE = poder({
  metal: 'cobre',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.229 / PDF 235
  descripcion:
    'Almacena recuerdos en una mentecobre para recuperarlos más tarde con total nitidez: tras guardar una vivencia solo queda un vago ' +
    'rastro de ella en la mente y cada recuerdo solo se recupera decantando la mentecobre donde se alojó (si se pierde o se destruye, los ' +
    'recuerdos desaparecen con ella). Sus usuarios son los archiveros; en la Era 1 los guardadores terrisanos preservaban así el ' +
    'conocimiento y la cultura frente al Lord Legislador.',
  almacenar: {
    nombre: 'Almacenar recuerdos',
    activacion: 'action1',
    duracion: 'Instantánea (1 carga por vivencia almacenada)',
    coste: 'Ninguno',
    descripcion:
      'Almacenas el recuerdo de un suceso (o de una parte de él). La duración máxima de la vivencia depende de tus grados en Feruquimia ' +
      '(según la tabla de duración por grados). Al guardarlo lo olvidas y la mentecobre gana 1 carga; anotas qué vivencia concreta queda ' +
      'vinculada a la carga.',
  },
  decantar: {
    nombre: 'Decantar recuerdos',
    activacion: 'action1',
    duracion: 'Instantánea',
    coste: '1 carga',
    descripcion:
      'Gastas 1 carga de la mentecobre para rememorar la vivencia vinculada a ella con la misma nitidez que tenía al guardarla. Como parte de ' +
      'la acción, o con 1 acción más adelante en la escena, puedes intentar extraer detalles nuevos, contexto o una comprensión más profunda ' +
      '(la DJ puede pedir una prueba, normalmente de Deducción, Perspicacia, Saber o Percepción).',
  },
  usosCreativos: [
    {
      nombre: 'Inocencia amnésica',
      texto: 'Almacenas el recuerdo de un delito en el que participaste, lo que te facilita mentir sobre cualquier conocimiento previo.',
    },
    { nombre: 'Compartimentar', texto: 'Guardas un recuerdo doloroso para posponer el duelo y evitar que te afecte en el presente.' },
    {
      nombre: 'Memoria perfecta',
      texto: 'Al hacer una prueba sobre información de un texto que memorizaste, decantas ese recuerdo para tener éxito automático.',
    },
  ],
  talentos: [
    {
      name: 'Archivero de pericias',
      cost: 'passive',
      prereq: 'poder Feruquimia de cobre',
      description:
        'Puedes usar Almacenar recuerdos para guardar una de tus pericias como si fuera el recuerdo de un suceso; la pierdes mientras su ' +
        'carga siga almacenada. Al recuperarla con Decantar recuerdos obtienes ventaja en las pruebas cognitivas y espirituales ' +
        'relacionadas hasta el final de la escena.',
    },
    {
      name: 'Guardián del conocimiento',
      cost: 'passive',
      prereq: 'Feruquimia 3 o más; Saber 3 o más; talento Maestro mnemotécnico',
      description:
        'Al adquirirlo, el máximo de cargas de tu mentecobre aumenta en 5, tu Intelecto sube 2 (y su valor máximo también) y obtienes dos ' +
        'pericias nuevas, como es habitual al subir Intelecto en 2.',
    },
    {
      name: 'Maestro mnemotécnico',
      cost: 'passive',
      prereq: 'Saber 2 o más; talento Mentecobre indexada',
      description:
        'Los efectos de tu feruquimia de cobre que suelen durar hasta el final de la escena pasan a durar hasta después de un descanso largo.',
    },
    {
      name: 'Memoria muscular',
      cost: 'passive',
      prereq: 'Agilidad 2 o más o Atletismo 2 o más; talento Archivero de pericias',
      description:
        'Al recuperar una pericia con Decantar recuerdos obtienes además ventaja en las pruebas físicas relacionadas hasta el final de la ' +
        'escena (por ejemplo, ventaja en los ataques con el arma de la pericia).',
    },
    {
      name: 'Mentecobre indexada',
      cost: 'special',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de cobre',
      description:
        'Al Decantar recuerdos puedes invertir cualquier número de cargas hasta tu límite de artes metálicas: rememoras a la vez las ' +
        'vivencias vinculadas a cada una de ellas.',
    },
    {
      name: 'Pupilo aplicado',
      cost: 'special',
      prereq: 'talento Archivero de pericias',
      description:
        'Tras un descanso corto o largo en el que hayas pasado al menos 1 hora en una actividad que (con tiempo de reposo suficiente) te ' +
        'daría una pericia en un tema relacionado, puedes guardar ese conocimiento en tu mentecobre como pericia temporal. Funciona como ' +
        'una guardada con Archivero de pericias, pero al recuperarla solo la tienes hasta el final de la escena; antes de perderla puedes ' +
        'gastar 2 puntos de concentración para volver a alojarla, como con Almacenar recuerdos.',
    },
  ],
  cargasConVinculo: true, // se anota qué vivencia o pericia guarda cada carga (L.228 / PDF 234)
  // L.228 / PDF 234: duración máxima de la vivencia por grados en Feruquimia; `grados` 6 es la fila «6 o más»
  tablaPorGrados: [
    { grados: 1, valor: '10 minutos' },
    { grados: 2, valor: '1 hora' },
    { grados: 3, valor: '8 horas' },
    { grados: 4, valor: '24 horas (1 día)' },
    { grados: 5, valor: '168 horas (7 días)' },
    { grados: 6, valor: '720 horas (30 días)' },
  ],
  medallon: { disponibleParaPJ: true, rangoRecompensa: 1 }, // L.294 / PDF 300
})

// ── Cromo · L.231-233 / PDF 237-239 ──────────────────────────────────────────────────────────────────────────────────────────────
const CROMO = poder({
  metal: 'cromo',
  caminos: ['ferrin', 'nacidoble'], // L.232 / PDF 238
  descripcion:
    'Almacena Fortuna espiritual en una mentecromo (la Fortuna no es suerte, sino una conexión con el Reino Espiritual y con los destinos ' +
    'posibles). Mientras almacenas pierdes el contacto con esa intuición cósmica; al decantar percibes cómo se mueven los hilos del destino ' +
    'y los momentos críticos para actuar. Los hiladores no predicen el futuro, pero destacan inspirando y coordinando a los demás.',
  almacenar: {
    nombre: 'Almacenar Fortuna',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas Fortuna hasta que le pones fin con una acción gratuita o gastas una carga de la mentecromo. Tras cada escena en la que hayas ' +
      'almacenado durante toda su duración, la mente gana 1 carga.',
    efectos: [
      'No puedes subir la apuesta en las pruebas que hagas.',
      'Al obtener una Oportunidad o una Complicación (por un 20 natural, un 1 natural o el estado Resuelto), ignoras sus efectos y añades ' +
        '1 carga a la mentecromo.',
    ],
  },
  decantar: {
    nombre: 'Decantar Fortuna',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la mentecromo para aumentar tu Fortuna durante tantas rondas como grados tengas en Feruquimia (o hasta que ' +
      'empieces a almacenar Fortuna).',
    efectos: [
      'Vuelves a tirar el dado de trama cuando sacas una cara en blanco.',
      'Tu rango de Oportunidad y tu rango de Complicación se amplían en 2.',
    ],
  },
  usosCreativos: [
    {
      nombre: 'Ignorancia feliz',
      texto:
        'Almacenas Fortuna para desconectar de la tensión de las aventuras de alto riesgo y encontrar paz en un momento de descanso antes ' +
        'de que el deber te reclame.',
    },
    {
      nombre: 'Impresión nítida',
      texto: 'Decantas Fortuna cuando te sientes perdido o ante una elección difícil, dejando que el destino te guíe hacia tu siguiente paso.',
    },
    {
      nombre: 'Identificar a un espectador clave',
      texto: 'Decantas Fortuna para fijarte en un transeúnte aparentemente insignificante e inspirarlo a ayudar a los demás en la escena.',
    },
  ],
  talentos: [
    {
      name: 'Compartir el destino',
      cost: 'reaction',
      prereq: 'Liderazgo 2 o más; talento Todavía no',
      description:
        'Antes de que un aliado dispuesto al que puedas sentir haga una prueba mientras decantas Fortuna, usas esta reacción y gastas 1 ' +
        'carga de la mentecromo para subir la apuesta.',
    },
    {
      name: 'Lugar adecuado',
      cost: 'special',
      prereq: 'Perspicacia 2 o más; talento Susurros del destino',
      description:
        'Al inicio de una escena, antes del turno del primer personaje, gastas 1 o más cargas de la mentecromo (hasta tu límite de artes ' +
        'metálicas): por cada carga usas Moverse de inmediato, sin coste de acción y sin activar reacciones. Empiezas la escena en tu ' +
        'nueva ubicación.',
    },
    {
      name: 'Momento oportuno',
      cost: 'passive',
      prereq: 'Feruquimia 2 o más; talento Susurros del destino',
      description:
        'Mientras decantas Fortuna, puedes usar la acción Prepararse como acción gratuita, pagando las acciones habituales de la acción ' +
        'que preparas.',
    },
    {
      name: 'Nexo de Fortuna',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Lugar adecuado',
      description:
        'Al Decantar Fortuna puedes gastar cualquier número de cargas hasta tu límite de artes metálicas y renunciar a los efectos ' +
        'habituales: hasta el final de tu próximo turno subes la apuesta en cada prueba, vuelves a tirar el dado de trama cuando sacas cara ' +
        'en blanco y tus rangos de Oportunidad y de Complicación se amplían en 1 + las cargas gastadas. Puedes mantenerla gastando 1 o ' +
        'más cargas como acción gratuita.',
    },
    {
      name: 'Susurros del destino',
      cost: 'special',
      prereq: 'poder Feruquimia de cromo',
      description:
        'Tras un descanso corto o largo, gastas 1 carga de la mentecromo para obtener una impresión de la relevancia de la próxima escena ' +
        'y de la importancia potencial de una persona, lugar o momento concretos (elegidos por la DJ). Al reunirte con esa persona, llegar ' +
        'a ese lugar o entrar en ese momento, pasas a estar Concentrado hasta el final de tu siguiente turno.',
    },
    {
      name: 'Todavía no',
      cost: 'reaction',
      prereq: 'poder Feruquimia de cromo',
      description:
        'Cuando la DJ sube la apuesta en una prueba tuya mientras decantas Fortuna, puedes usar esta reacción para Almacenar Fortuna en su ' +
        'lugar y hacer la prueba sin subir la apuesta; al hacerlo, la mentecromo gana 1 carga.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 2 }, // L.294 / PDF 300
})

// ── Duraluminio · L.234-235 / PDF 240-241 ────────────────────────────────────────────────────────────────────────────────────────
const DURALUMINIO = poder({
  metal: 'duraluminio',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.234 / PDF 240
  descripcion:
    'Almacena Conexión espiritual en una menteduraluminio: mientras almacenas tus vínculos actuales se debilitan y cuesta más forjar otros ' +
    'nuevos, y tu imagen ante los extraños empeora; al decantar aumentan tu carisma y magnetismo y entablas relaciones con facilidad. Por ' +
    'eso se llama conectores a sus usuarios.',
  almacenar: {
    nombre: 'Almacenar Conexión',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas Conexión hasta que le pones fin con una acción gratuita o gastas una carga de la menteduraluminio. Tras cada escena en la ' +
      'que hayas almacenado durante toda su duración, la mente gana 1 carga.',
    efectos: [
      'Pasas a estar Mermado [Presencia −1].',
      'Cuando otros personajes usan una capacidad que afecta específicamente a sus aliados, no cuentas como tal.',
    ],
  },
  decantar: {
    nombre: 'Decantar Conexión',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la menteduraluminio para potenciar tu capacidad de conectar con los demás durante tantas rondas como grados tengas ' +
      'en Feruquimia (o hasta que empieces a almacenar Conexión).',
    efectos: [
      'Pasas a estar Mejorado [Presencia +2].',
      'Eliges un personaje al que sientas dentro de tu alcance de artes metálicas, o el asentamiento donde te encuentras: mientras dura el ' +
        'efecto conoces su idioma nativo tan bien como el tuyo, aunque sea de otro mundo del Cosmere.',
    ],
  },
  usosCreativos: [
    { nombre: 'El alma de la fiesta', texto: 'Decantas Conexión para acaparar la atención de la multitud y que tus aliados pasen inadvertidos.' },
    { nombre: 'Inadvertido', texto: 'Almacenas Conexión durante una charla para que a los presentes les cueste recordar detalles sobre ti.' },
  ],
  talentos: [
    {
      name: 'Conexión individual',
      cost: 'special',
      prereq: 'poder Feruquimia de duraluminio',
      description:
        'Al Almacenar Conexión puedes elegir a uno o más personajes a los que sientas para excluirlos del debilitamiento de tu vínculo: ' +
        'para ellos sigues contando como aliado. Además, un idioma aprendido con Decantar Conexión lo conoces hasta que uses la acción ' +
        'para aprender otro distinto.',
    },
    {
      name: 'De enemigo a amigo',
      cost: 'passive',
      prereq: 'Feruquimia 3 o más; talento Vínculo instantáneo',
      description:
        'Usar Vínculo instantáneo te cuesta 1 acción menos. Además, una vez por escena puedes elegir como objetivo a un Secuaz enemigo en ' +
        'lugar de a un personaje neutral; si tienes éxito, cuenta como tu compañero hasta el final de la escena (en lugar de hasta ' +
        'después de un descanso largo).',
    },
    {
      name: 'Fuerza de personalidad',
      cost: 'passive',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de duraluminio',
      description:
        'Mientras decantas Conexión, cuando intentas influir en otro personaje este debe gastar 2 puntos de concentración adicionales si ' +
        'quiere resistirse a tu influencia.',
    },
    {
      name: 'Vínculo auténtico',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Fuerza de personalidad',
      description:
        'Al Decantar Conexión puedes gastar cualquier número de cargas hasta tu límite de artes metálicas y renunciar a los efectos y la ' +
        'duración habituales: hasta el final de tu próximo turno quedas Mejorado [Presencia] con una bonificación de 1 + las cargas ' +
        'gastadas, a quien se resista a tu influencia le cuesta 1 + las cargas gastadas más de concentración y conoces todos los idiomas ' +
        'de cualquier personaje o asentamiento dentro de tu alcance de artes metálicas. Puedes mantenerlo gastando 1 o más cargas como ' +
        'acción gratuita.',
    },
    {
      name: 'Vínculo instantáneo',
      cost: 'action3',
      prereq: 'Feruquimia 2 o más; talento Conexión individual',
      description:
        'Gastas 2 cargas de la menteduraluminio para hacer una prueba de Feruquimia contra la Defensa espiritual de un PNJ que no sea un ' +
        'enemigo y al que puedas sentir e influir dentro de tu alcance de artes metálicas. Si tienes éxito, pasa a ser tu amigo o estrecha ' +
        'su relación contigo hasta después de un descanso largo (por ejemplo, un compañero o patrocinador temporal); al terminar, el ' +
        'personaje decide qué grado de amistad mantiene.',
      notaLibro:
        'Falta el icono de activación de Vínculo instantáneo en el diagrama del árbol (L.235 / PDF 241); la entrada del talento ' +
        '(L.235 / PDF 241) indica 3 acciones. Se transcribe el texto de la entrada.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 1 }, // L.294 / PDF 300
})

// ── Electro · L.236-237 / PDF 242-243 ────────────────────────────────────────────────────────────────────────────────────────────
const ELECTRO = poder({
  metal: 'electro',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.236 / PDF 242
  descripcion:
    'Almacena determinación en una mentelectro: mientras almacenas puedes parecer una persona sin rumbo ni objetivos, pero ves las cosas ' +
    'desde perspectivas que de otro modo rechazarías; al decantar obtienes intensos estallidos de determinación. Esos altibajos les han ' +
    'valido a sus usuarios el nombre de pináculos.',
  almacenar: {
    nombre: 'Almacenar determinación',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas determinación hasta que le pones fin con una acción gratuita o gastas una carga de la mentelectro. Tras cada escena en la ' +
      'que hayas almacenado durante toda su duración, la mente gana 1 carga.',
    efectos: [
      'Pasas a estar Mermado [Voluntad −1].',
      'Si estabas Resuelto al empezar, pierdes ese estado y no puedes volver a tenerlo hasta que dejes de almacenar determinación.',
      'La primera vez en cada escena que pierdes Resuelto de este modo, añades 1 carga adicional a la mentelectro.',
    ],
  },
  decantar: {
    nombre: 'Decantar determinación',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la mentelectro para aumentar tu determinación durante tantas rondas como grados tengas en Feruquimia (o hasta que ' +
      'empieces a almacenar determinación).',
    efectos: ['Pasas a estar Mejorado [Voluntad +2].', 'Tras resistirte a la influencia de un personaje, este pierde 1 punto de concentración.'],
  },
  usosCreativos: [
    {
      nombre: 'Evitar provocaciones',
      texto: 'Decantas determinación para controlar tu ira ante las injusticias en el momento justo y afrontar mejor esos agravios más adelante.',
    },
    { nombre: 'Evitar distracciones', texto: 'Decantas determinación para mantener la concentración en tu tarea en un entorno caótico.' },
    { nombre: 'Derribar barreras', texto: 'Almacenas determinación para comprender mejor la posición y los motivos ajenos.' },
  ],
  talentos: [
    {
      name: 'Afabilidad infinita',
      cost: 'special',
      prereq: 'Feruquimia 2 o más; talento Dejarse llevar',
      description:
        'Mientras almacenas determinación, si decides no resistirte a la influencia de un personaje, recuperas 2 puntos de concentración y ' +
        'descubres una información clave sobre él, como su propósito, obstáculo o meta.',
    },
    {
      name: 'Dejarse llevar',
      cost: 'passive',
      prereq: 'poder Feruquimia de electro',
      description:
        'Mientras almacenas determinación, resistirte a la influencia te cuesta 1 punto de concentración adicional, pero obtienes ventaja en ' +
        'las pruebas de Perspicacia y Persuasión.',
    },
    {
      name: 'Esencia indomable',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Intensidad de propósito',
      description:
        'Cuando estás Inconsciente y eliges recobrar el conocimiento, puedes gastar cargas de la mentelectro hasta tu límite de artes ' +
        'metálicas: tiras ese número de dados de recuperación y sumas el resultado a tu salud, a tu concentración o a una combinación de ambas.',
    },
    {
      name: 'Intensidad de propósito',
      cost: 'special',
      prereq: 'Feruquimia 2 o más; talento Voluntad curtida',
      description:
        'Al hacer una prueba mientras decantas determinación, puedes gastar una Oportunidad para mostrar una convicción sobrenatural: tú y ' +
        'los aliados a los que puedas influir pasáis a estar Resueltos, y los enemigos a los que puedas influir pasan a estar Agotados [−1].',
    },
    {
      name: 'Resolución inquebrantable',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Voluntad curtida',
      description:
        'Al Decantar determinación puedes gastar cualquier número de cargas hasta tu límite de artes metálicas: hasta el final de tu próximo ' +
        'turno, en lugar de los efectos habituales, quedas Mejorado [Voluntad] con una bonificación de 1 + las cargas gastadas e ignoras los ' +
        'efectos de tantas lesiones temporales como estés sufriendo, hasta 1 + las cargas gastadas (las lesiones persisten y siguen aplicando ' +
        'su penalización a las tiradas de lesión). Puedes mantenerla gastando 1 o más cargas como acción gratuita.',
    },
    {
      name: 'Voluntad curtida',
      cost: 'special',
      prereq: 'poder Feruquimia de electro',
      description:
        'La primera vez que decantas determinación en cada escena eliges un efecto que dura hasta el final de ella: pasas a estar Resuelto, ' +
        'o ignoras los efectos de una lesión temporal que sufras (la lesión persiste y sigue aplicando su penalización a las tiradas de lesión).',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 2 }, // L.294 / PDF 300
})

// ── Estaño · L.238-240 / PDF 244-246 ─────────────────────────────────────────────────────────────────────────────────────────────
const ESTANO = poder({
  metal: 'estano',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.239 / PDF 245
  descripcion:
    'Almacena los sentidos (generalmente oído, vista, olfato, gusto y tacto) en una mentestaño: el sentido elegido se atenúa mientras lo ' +
    'guardas y se agudiza al decantarlo. Los susurravientos son capaces de oír susurros al otro lado de una estancia abarrotada.',
  almacenar: {
    nombre: 'Almacenar sentido',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas un sentido hasta que le pones fin con una acción gratuita o gastas una carga de la mentestaño. Al principio solo puedes ' +
      'guardar un único sentido a la vez. Tras cada escena en la que hayas almacenado un sentido durante toda su duración, la mente gana 1 carga.',
    efectos: [
      'Pasas a estar Mermado [Discernimiento −1].',
      'Sufres desventaja en las pruebas que dependen del sentido almacenado (a discreción de la DJ): por ejemplo, en Perspicacia al guardar ' +
        'la vista o el oído, en Supervivencia al guardar la vista o el olfato, o en los ataques con armas y otras pruebas físicas al guardar el tacto.',
    ],
    opciones: [
      { nombre: 'Oído', descripcion: 'Al guardarlo sufres desventaja, por ejemplo, en las pruebas de Perspicacia.' },
      { nombre: 'Vista', descripcion: 'Al guardarla sufres desventaja, por ejemplo, en las pruebas de Perspicacia y de Supervivencia.' },
      { nombre: 'Olfato', descripcion: 'Al guardarlo sufres desventaja, por ejemplo, en las pruebas de Supervivencia.' },
      { nombre: 'Gusto', descripcion: 'Sentido almacenable; sirve, por ejemplo, para soportar una comida desagradable.' },
      { nombre: 'Tacto', descripcion: 'Al guardarlo sufres desventaja, por ejemplo, en los ataques con armas y otras pruebas físicas.' },
    ],
  },
  decantar: {
    nombre: 'Decantar sentido',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga (por sentido)',
    mantener:
      'Antes de que termine, puedes mantenerla durante la misma duración gastando 1 carga como acción gratuita, siguiendo con el mismo sentido o ' +
      'empezando con uno distinto.',
    descripcion:
      'Gastas 1 carga de la mentestaño y eliges un sentido para decantarlo durante tantas rondas como grados tengas en Feruquimia (o hasta ' +
      'que empieces a almacenar cualquier sentido). Para decantar más de un sentido a la vez activas el poder por separado para cada uno.',
    efectos: [
      'Pasas a estar Mejorado [Discernimiento +2] (solo una vez, aunque decantes varios sentidos a la vez).',
      'Obtienes ventaja en las pruebas que no sean de ataque y dependan del sentido decantado (a discreción de la DJ).',
      'El sentido decantado se convierte en un sentido sobrenatural y puede contar como tu sentido principal.',
    ],
    opciones: [
      { nombre: 'Oído', descripcion: 'Se agudiza y se vuelve sobrenatural mientras dura la decantación.' },
      { nombre: 'Vista', descripcion: 'Se agudiza y se vuelve sobrenatural mientras dura la decantación.' },
      { nombre: 'Olfato', descripcion: 'Se agudiza y se vuelve sobrenatural mientras dura la decantación (útil para seguir rastros).' },
      { nombre: 'Gusto', descripcion: 'Se agudiza y se vuelve sobrenatural mientras dura la decantación.' },
      { nombre: 'Tacto', descripcion: 'Se agudiza y se vuelve sobrenatural mientras dura la decantación.' },
    ],
  },
  usosCreativos: [
    { nombre: 'Rastreo de sabueso', texto: 'Decantas olfato para seguir el rastro del olor característico de un individuo.' },
    { nombre: 'Percepción minuciosa', texto: 'Decantas tacto u oído para detectar el sonido de los mecanismos al forzar una cerradura.' },
    {
      nombre: 'Bloqueo sensorial',
      texto: 'Almacenas un sentido para mitigar efectos sensoriales indeseados (por ejemplo, guardar el gusto o el olfato para soportar una comida desagradable).',
    },
    {
      // [inferido] name: the book closes the list with a paragraph without a title (L.238 / PDF 244)
      nombre: 'Sentidos especiales',
      texto:
        'Los sentidos almacenables no se limitan a los mundanos: la alomancia de bronce da la capacidad de sentir los pulsos de las capacidades ' +
        'Investidas y los cantores de Roshar perciben los ritmos de su mundo. La DJ decide los efectos de almacenar y decantar un sentido especial.',
    },
  ],
  talentos: [
    {
      name: 'Almacenamiento multisensorial',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Susurros del viento espontáneos',
      description:
        'Al Almacenar sentido puedes guardar tantos sentidos como tu rango, con una carga independiente por cada uno. Por cada sentido ' +
        'adicional pasas a estar Mermado [Discernimiento −1] de nuevo (con dos sentidos, Mermado [−2] y 2 cargas por escena).',
    },
    {
      name: 'Almacenar dolor',
      cost: 'passive',
      prereq: 'Medicina 2 o más; talento Control sensorial',
      description:
        'Mientras almacenas el sentido del tacto, reduces el daño que sufres en un valor igual a la mitad de tus grados en Feruquimia e ' +
        'ignoras los efectos de los estados Afligido, Agotado y Ralentizado.',
    },
    {
      name: 'Control sensorial',
      cost: 'passive',
      prereq: 'poder Feruquimia de estaño',
      description:
        'Puedes almacenar un sentido mientras decantas otro: usar Decantar sentido no pone fin a Almacenar sentido, ni al revés, siempre ' +
        'que los sentidos sean distintos. Además, el Mermado [Discernimiento] por almacenar no se aplica a las pruebas que dependen del ' +
        'sentido que estás decantando.',
    },
    {
      name: 'Precisión de estaño',
      cost: 'passive',
      prereq: 'Armamento pesado 1 o más o Armamento ligero 1 o más; poder Feruquimia de estaño',
      description:
        'Mientras quemas estaño o decantas sentidos de una mentestaño, los alcances corto y largo de tus ataques a distancia aumentan en ' +
        'tu alcance de los sentidos, y al atacar a distancia a un objetivo al que sientes a 1,5 metros o menos de un aliado puedes optar por ' +
        'no subir la apuesta. Mismo nombre y mismo efecto que un talento de la alomancia de estaño, que exige además un talento de ese árbol.',
    },
    {
      name: 'Susurros del viento auténticos',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Control sensorial',
      description:
        'Al Decantar sentido puedes gastar cualquier número de cargas hasta tu límite de artes metálicas y elegir tantos sentidos como ' +
        'cargas gastadas: hasta el final de tu próximo turno, en lugar de los efectos habituales, quedas Mejorado [Discernimiento] con ' +
        'una bonificación de 1 + las cargas gastadas, tienes ventaja en las pruebas que dependan de cualquiera de esos sentidos y todos ' +
        'se vuelven sobrenaturales y cuentan como tu sentido principal (casi imposible quedar ofuscado). Puedes mantenerla gastando 1 o ' +
        'más cargas como acción gratuita.',
    },
    {
      name: 'Susurros del viento espontáneos',
      cost: 'reaction',
      prereq: 'Feruquimia 2 o más; talento Control sensorial',
      description:
        'Antes de una acción u otro efecto que pueda verse afectado por el almacenamiento de uno de tus sentidos, usas esta reacción para ' +
        'Almacenar sentido. Hasta el final de ese turno tienes ventaja en las pruebas para resistir el efecto y su origen sufre desventaja ' +
        'en las pruebas contra ti provocadas por él (por ejemplo, un ruido fuerte, una luz cegadora o un olor nauseabundo que podría ' +
        'dejarte Desorientado).',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 1 }, // L.294 / PDF 300
  notaLibro:
    'Consejo para la DJ (L.239 / PDF 245): en las novelas los susurravientos solo guardan un sentido por mentestaño y suelen llevar al menos ' +
    'cinco; el JdR lo simplifica con una sola mentestaño para todos los sentidos. Variante opcional: una mentestaño independiente por ' +
    'sentido, repartiendo entre ellas el máximo de cargas; al almacenar solo se ganan cargas para el sentido de esa mente y al decantarla ' +
    'solo se mejora ese sentido.',
})

// ── Hierro · L.241-242 / PDF 247-248 ─────────────────────────────────────────────────────────────────────────────────────────────
const HIERRO = poder({
  metal: 'hierro',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.241 / PDF 247
  descripcion:
    'Almacena el peso físico en una mentehierro: mientras almacenas tu peso disminuye y al decantar aumenta, mientras el cuerpo compensa ' +
    'para que te muevas con la misma agilidad que con tu peso habitual. Un ajustador que decanta mucho peso de golpe puede multiplicar su ' +
    'masa, quebrar la superficie donde se apoya o volverse casi inamovible.',
  almacenar: {
    nombre: 'Almacenar peso',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas peso hasta que le pones fin con una acción gratuita o gastas una carga de la mentehierro. Tras cada escena en la que hayas ' +
      'almacenado durante toda su duración, la mente gana 1 carga.',
    efectos: [
      'Tu peso disminuye hasta la mitad del valor habitual.',
      'Para cualquier regla (salvo el espacio que ocupas y controlas) se te considera de un tamaño menor.',
      'No sufres daño por caída.',
      'Los ataques cuerpo a cuerpo en tu contra obtienen ventaja.',
      'Se duplica la distancia de cualquier efecto que te desplace contra tu voluntad mediante fuerza física.',
    ],
  },
  decantar: {
    nombre: 'Decantar peso',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la mentehierro para aumentar tu peso durante tantas rondas como grados tengas en Feruquimia (o hasta que empieces a ' +
      'almacenar peso).',
    efectos: [
      'Tu peso aumenta hasta el doble del valor habitual.',
      'Para cualquier regla (salvo el espacio que ocupas y controlas) se te considera de un tamaño mayor.',
      'Tus ataques cuerpo a cuerpo obtienen ventaja.',
      'Antes de que un efecto te desplace contra tu voluntad, puedes reducir la distancia del desplazamiento en cualquier cantidad.',
    ],
  },
  usosCreativos: [
    { nombre: 'Conservación del impulso', texto: 'Almacenas peso justo después de saltar para llegar mucho más lejos (a discreción de la DJ).' },
    { nombre: 'Atravesar el suelo', texto: 'Decantas tanto peso que atraviesas el suelo y caes al piso inferior.' },
    {
      nombre: 'Peso muerto',
      texto:
        'Pisas o te sientas sobre un personaje Tumbado y decantas peso para dejarlo Inmovilizado; el objetivo puede intentar escapar ' +
        'superando una prueba de Agilidad o Atletismo contra tu Defensa física.',
    },
  ],
  talentos: [
    {
      name: 'Evasión liviana',
      cost: 'reaction',
      prereq: 'poder Feruquimia de hierro',
      description:
        'Mientras almacenas peso, antes de sufrir daño por golpe o por laceración, usas esta reacción para reducir ese daño en tu ' +
        'modificador de Feruquimia y desplazarte hasta 3 metros desde el origen del daño sin activar Acometidas reactivas.',
    },
    {
      name: 'Golpe vigoroso',
      cost: 'action2',
      prereq: 'poder Feruquimia de hierro',
      description:
        'Haces un ataque con arma cuerpo a cuerpo o un ataque sin armas contra la Defensa física del objetivo mientras decantas peso. Al ' +
        'tirar el daño sumas 1d4 adicional (tu dado de artes metálicas, que crece con tus grados). Si impactas y eres de una categoría de ' +
        'tamaño mayor que el objetivo, puedes empujarlo hasta 3 metros por cada carga invertida en decantar peso.',
    },
    {
      name: 'Maestro ajustador',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Objeto inamovible o talento Pies ligeros',
      description:
        'Antes de una acción o un efecto que pueda verse afectado por almacenar o decantar peso (activar otro talento de hierro, atacar, ' +
        'sufrir un ataque, un intento de desplazarte por la fuerza o una caída), gastas 1 punto de concentración para Almacenar peso o ' +
        'Decantar peso sin coste de acción.',
    },
    {
      name: 'Masa crítica',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Objeto inamovible',
      description:
        'Al Decantar peso puedes gastar cualquier número de cargas hasta tu límite de artes metálicas. Los efectos se acumulan por cada ' +
        'carga invertida, pero solo duran hasta el final de tu próximo turno (con 100 kilos y 2 cargas pesas 300 kilos, cuentas como dos ' +
        'tamaños mayor y tus ataques cuerpo a cuerpo obtienen 2 ventajas). Puedes mantenerla gastando 1 o más cargas como acción gratuita.',
    },
    {
      name: 'Objeto inamovible',
      cost: 'reaction',
      prereq: 'Talento Golpe vigoroso', // sic: mayúscula inicial en la entrada del libro (L.242 / PDF 248)
      description:
        'Después de que un personaje de una categoría de tamaño menor que la tuya te impacte con un ataque cuerpo a cuerpo, usas esta ' +
        'reacción para dejarlo Tumbado (al decantar peso tu cuerpo es mucho más pesado y rígido de lo que aparenta).',
    },
    {
      name: 'Pies ligeros',
      cost: 'passive',
      prereq: 'Agilidad 2 o más; talento Evasión liviana',
      description:
        'Mientras almacenas peso obtienes ventaja en las pruebas de Velocidad que no sean de ataque y, al moverte, puedes saltar una ' +
        'distancia horizontal igual a tu movimiento (o vertical igual a la mitad) sin necesidad de una prueba de Atletismo.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 1 }, // L.294 / PDF 300
})

// ── Latón · L.243-245 / PDF 249-251 ──────────────────────────────────────────────────────────────────────────────────────────────
const LATON = poder({
  metal: 'laton',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.244 / PDF 250
  descripcion:
    'Almacena el calor corporal en una mentelatón: al almacenar bajas tu temperatura, lo que evita el sobrecalentamiento y te protege en ' +
    'parte de las llamas; al decantar la subida de temperatura evita los efectos de los climas gélidos y puedes quemar al tocar. Por eso se ' +
    'llama almas de fuego a sus usuarios. El poder solo regula la temperatura interna, así que irradiar un calor abrasador puede ser peligroso ' +
    'también para ellos. En el sur de Scadrial, los medallones de latón que enseñó el Soberano permiten sobrevivir al frío a quien no es ' +
    'nacido del metal (L.243 / PDF 249).',
  almacenar: {
    nombre: 'Almacenar calor',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas calor hasta que le pones fin con una acción gratuita o gastas una carga de la mentelatón. Tras cada escena en la que hayas ' +
      'almacenado durante toda su duración, la mente gana 1 carga.',
    efectos: [
      'Tu temperatura corporal disminuye.',
      'Resistes mejor los entornos calurosos, pero lo pasas peor en los fríos (un día templado de otoño podría provocarte hipotermia).',
      'Antes de sufrir daño por energía, lo reduces en una cantidad igual a tu rango.',
    ],
  },
  decantar: {
    nombre: 'Decantar calor',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la mentelatón para decantar calor durante tantas rondas como grados tengas en Feruquimia (o hasta que empieces a ' +
      'almacenar calor).',
    efectos: [
      'Tu temperatura corporal aumenta.',
      'Resistes mejor los entornos fríos, pero lo pasas peor en los calurosos.',
      'Cuando sufres daño por energía, aumenta en una cantidad igual a tu rango.',
      'Al final de cada uno de tus turnos, si has mantenido contacto físico con otro personaje más que unos instantes (agarrándolo, o ' +
        'usando una habilidad contra su Defensa física para prolongar el contacto), puedes infligirle daño por energía igual a tu ' +
        'modificador de Feruquimia con una acción gratuita.',
    ],
  },
  usosCreativos: [
    { nombre: 'Enfriar un objeto', texto: 'Almacenas calor mientras tocas un objeto para drenar su calidez.' },
    {
      nombre: 'Calentar un objeto',
      texto: 'Decantas calor mientras tocas un objeto para transmitirle calor; podría sobrecalentar maquinaria y provocar fallos de funcionamiento.',
    },
    {
      nombre: 'Prender un objeto',
      texto:
        'Mientras tocas un objeto inflamable desatendido, gastas 1 carga para calentarlo hasta prenderlo; podría crear terreno peligroso ' +
        'y, a discreción de la DJ, el fuego podría propagarse.',
    },
  ],
  talentos: [
    {
      name: 'Conducción térmica',
      cost: 'special',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de latón',
      description:
        'Una vez por turno mientras decantas calor, después de que otro personaje y tú os toquéis (también con un arma de metal cuerpo a ' +
        'cuerpo u otro objeto metálico similar), le infliges daño por energía igual a tu modificador de Feruquimia sin coste de acción.',
    },
    {
      name: 'Contacto reconfortante',
      cost: 'special',
      prereq: 'Medicina 2 o más; talento Palma abrasadora o talento Conducción térmica',
      description:
        'Al almacenar o decantar calor, cuando un aliado dispuesto cercano tira un dado de recuperación, le sumas tus grados en Feruquimia. ' +
        'Además, tras un descanso largo en el que renuncies a la recuperación para almacenar en tus mentes de metal, puedes elegir a un ' +
        'aliado cercano con una lesión temporal: reduce su tiempo de recuperación en tantos días como tus grados en Feruquimia.',
    },
    {
      name: 'Frío entumecedor',
      cost: 'special',
      prereq: 'Feruquimia 2 o más; talento Palma abrasadora o Conducción térmica',
      description:
        'Cuando tocas a un personaje mientras almacenas calor, gastas 2 puntos de concentración (sin acción) para que quede Mermado ' +
        '[Velocidad −2] hasta el final de tu próximo turno. Si lo tocaste como parte de una prueba, puedes gastar una Oportunidad de esa ' +
        'prueba en lugar de concentración.',
    },
    {
      name: 'Horno viviente',
      cost: 'special',
      prereq: 'talento Maestro alma de fuego',
      description:
        'Al Decantar calor puedes gastar cualquier número de cargas hasta tu límite de artes metálicas: la decantación solo dura hasta el ' +
        'final de tu próximo turno y además exudas calor ambiental en un radio de 3 metros × las cargas gastadas. Al final de cada uno de ' +
        'tus turnos, todos los personajes de la zona (tú incluido) sufren daño por energía igual a tu modificador de Feruquimia, aunque ya ' +
        'lo hayan sufrido por tocarte. Puedes mantenerla gastando 1 o más cargas como acción gratuita.',
    },
    {
      name: 'Maestro alma de fuego',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Contacto reconfortante o talento Frío entumecedor',
      description:
        'Antes de una acción o un efecto que pueda verse afectado por almacenar o decantar calor (activar otro talento de latón, que te ' +
        'agarren, caer a un río helado o una explosión ardiente), gastas 1 punto de concentración para Almacenar calor o Decantar calor ' +
        'sin coste de acción.',
    },
    {
      name: 'Palma abrasadora',
      cost: 'action2',
      prereq: 'poder Feruquimia de latón',
      description:
        'Mientras decantas calor, usas esta acción para Agarrar, Empujar o hacer un ataque sin armas contra la Defensa física de un ' +
        'personaje cercano. Si Agarras o Empujas con éxito, o impactas o haces un rasguño, infliges 1d4 adicional de daño por energía (tu ' +
        'dado de artes metálicas, que crece con tus grados).',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 1 }, // L.294 / PDF 300
})

// ── Nicrosil · L.246 / PDF 252 ───────────────────────────────────────────────────────────────────────────────────────────────────
const NICROSIL = poder({
  metal: 'nicrosil',
  // [inferido] the entry has no «Es posible desbloquear este árbol…» phrase; the criterion is §7.5 (the three feruchemy paths can choose it)
  caminos: ['ferrin', 'nacidoble', 'feruquimista'],
  descripcion:
    'Almacena la propia facultad de blandir Investidura: mientras almacenas, una de tus capacidades Investidas mengua; más tarde podrás ' +
    'decantarla para potenciar su eficacia de forma temporal, con un control y una seguridad asombrosos frente a los estallidos instantáneos ' +
    'de la alomancia de duraluminio o de nicrosil. Sus usuarios, los portaalmas, no comprenden bien qué hacen y apenas se sabe nada de este ' +
    'poder más allá de sus efectos básicos.',
  almacenar: {
    nombre: 'Almacenar Investidura',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas uno de tus poderes (u otra capacidad Investida, como una potencia Radiante) hasta que le pones fin con una acción gratuita ' +
      'o gastas una carga de la mentenicrosil. Tras cada escena en la que hayas almacenado durante toda su duración, la mente gana 1 carga y ' +
      'anotas a qué capacidad Investida queda vinculada.',
    efectos: [
      'Se considera que tienes 1 grado menos en la habilidad Investida correspondiente, solo para los efectos del poder almacenado.',
      'Esa reducción no afecta al máximo de cargas de tus mentes de metal ni a los prerrequisitos de tus talentos.',
    ],
  },
  decantar: {
    nombre: 'Decantar Investidura',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga (de la capacidad vinculada)',
    mantener:
      'Antes de que termine, puedes mantenerla durante la misma duración gastando 1 carga como acción gratuita; si la nueva carga pertenece a ' +
      'un poder distinto, ajustas los efectos en consecuencia.',
    descripcion:
      'Gastas 1 carga de la mentenicrosil para decantar el poder (o capacidad Investida) vinculado a esa carga durante tantas rondas como ' +
      'grados tengas en Feruquimia (o hasta que empieces a almacenar Investidura).',
    efectos: [
      'Se considera que tienes 2 grados adicionales en la habilidad Investida correspondiente, solo para los efectos de ese poder.',
      'Ese aumento no afecta al máximo de cargas de tus mentes de metal ni a los prerrequisitos de tus talentos.',
    ],
  },
  usosCreativos: [
    {
      nombre: 'Vida oculta',
      texto:
        'Al almacenar Investidura rápidamente puedes ocultarte de efectos que detecten personajes Investidos (o incluso seres vivos), como ' +
        'la alomancia de bronce o el sentido vital de un despertante.',
    },
    {
      nombre: 'Superar límites',
      texto:
        'Si al decantar un poder de tu mentenicrosil alcanzas temporalmente 6 grados o más en una habilidad Investida, podrías lograr proezas ' +
        'que superen las limitaciones habituales; algunos poderes dan beneficios especiales con 6 grados o más, o al gastar 6 o más puntos ' +
        'de Investidura (se indican en la sección de cada poder).',
    },
  ],
  talentos: [],
  cargasConVinculo: true, // se anota a qué capacidad Investida está vinculada cada carga
  medallon: { disponibleParaPJ: false, rangoRecompensa: null }, // «No disponible para personajes jugadores», L.294 / PDF 300
  notaLibro:
    'La entrada no trae árbol de talentos ni la frase «Es posible desbloquear este árbol mediante el talento principal de los caminos de…» ' +
    '(L.246 / PDF 252); el poder se puede elegir igualmente («Elección del nicrosil como ferrin», L.246 / PDF 252: casi nadie lo hace, porque ' +
    'solo es útil si también puedes emplear otra capacidad Investida, p. ej. en una campaña de saltamundos o con clavos hemalúrgicos). ' +
    'La app lo ofrece a los tres caminos de feruquimia [inferido]. Tampoco está disponible en medallones para personajes jugadores ' +
    '(L.294 / PDF 300).',
})

// ── Oro · L.247-248 / PDF 253-254 ────────────────────────────────────────────────────────────────────────────────────────────────
const ORO = poder({
  metal: 'oro',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.247 / PDF 253
  descripcion:
    'Almacena salud en una menteoro: mientras lo haces te vuelves enfermizo y propenso a las lesiones; al decantar sanas a un ritmo acelerado ' +
    'e incluso te recuperas de heridas que normalmente serían fatales. Por eso se llama hacedores de sangre a sus usuarios.',
  almacenar: {
    nombre: 'Almacenar salud',
    activacion: 'action1',
    duracion: '1 carga por escena, más 1 carga por cada uso de Recuperarse sin gastar al final de la escena (aunque no estés almacenando)',
    coste: 'Ninguno',
    descripcion:
      'Almacenas salud en tu menteoro hasta que le pones fin con una acción gratuita (o decantes salud). Tras cada escena en la que hayas ' +
      'almacenado durante toda su duración, la mente gana 1 carga. Además, al final de una escena, si no has agotado el último uso de tu ' +
      'acción Recuperarse, añades 1 carga adicional por cada uso restante, incluso si no estás almacenando salud en ese momento.',
    efectos: [
      'Sufres 1d4 de daño vital al final de cada uno de tus turnos; tu salud no puede reducirse a 0 de esta manera.',
      'Sufres desventaja en las pruebas contra enfermedades, drogas y venenos.',
    ],
  },
  decantar: {
    nombre: 'Decantar salud',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la menteoro para recuperar salud de forma continua durante tantas rondas como grados tengas en Feruquimia (o hasta ' +
      'que empieces a almacenar salud).',
    efectos: [
      'Al empezar a decantar y al inicio de cada uno de tus turnos mientras dure, recuperas 1d4 de salud (tu dado de artes metálicas, que crece ' +
        'con tus grados) y pones fin a un único efecto de enfermedad, droga o veneno que sufras.',
    ],
  },
  usosCreativos: [
    {
      nombre: 'Despertar compasión',
      texto: 'Almacenas salud para mostrar un aspecto enfermizo y patético y que las personas de buen corazón se apiaden de ti.',
    },
    {
      nombre: 'Ignorar el dolor',
      texto:
        'Decantar salud no impide sentir dolor, pero sana rápido su causa y puede ayudarte a cambiar de mentalidad y minimizar la reacción ' +
        'ante el sufrimiento físico.',
    },
    {
      nombre: 'Recobrar la sobriedad',
      texto: 'En plena vorágine hedonista, decantas salud para purgar de inmediato las sustancias de tu organismo y recuperar la sobriedad si hace falta.',
    },
  ],
  talentos: [
    {
      name: 'Especialista en lesiones',
      cost: 'special',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de oro',
      description:
        'Cada vez que Decantar salud te permite poner fin a los efectos de una enfermedad, droga o veneno, puedes sanar en su lugar una ' +
        'lesión temporal (sin coste adicional) o gastar 1 carga adicional para sanar una lesión permanente.',
    },
    {
      name: 'Huir de la muerte',
      cost: 'passive',
      prereq: 'Feruquimia 3 o más; talento Sanación espontánea',
      description:
        'Al usar Sanación espontánea puedes usar también Destrabarse como parte de la misma reacción. Además, al inicio del combate y de ' +
        'cada uno de tus turnos obtienes 1 reacción adicional que solo puedes emplear en Sanación espontánea.',
    },
    {
      name: 'Regeneración instantánea',
      cost: 'action2',
      prereq: 'Feruquimia 4 o más; talento Sanación acelerada',
      description:
        'Una vez por escena, gastas 5 cargas de la menteoro para recuperar de inmediato toda tu salud, sanar cualquier número de lesiones ' +
        'y poner fin a todos los efectos de enfermedades, drogas y venenos que sufras.',
    },
    {
      name: 'Sanación acelerada',
      cost: 'action1',
      prereq: 'Feruquimia 3 o más; talento Especialista en lesiones',
      description:
        'Gastas 1 o más cargas de la menteoro (hasta tu límite de artes metálicas). Por cada carga recuperas salud igual a 1d8 + tu ' +
        'modificador de Feruquimia; la tirada usa tu dado de artes metálicas (con 4 grados, 1d10 en lugar de 1d8).',
    },
    {
      name: 'Sanación espontánea',
      cost: 'reaction',
      prereq: 'poder Feruquimia de oro',
      description:
        'Antes de quedar Inconsciente, usas esta reacción para Decantar salud y seguir consciente, y recuperas de inmediato tanta salud como ' +
        'grados tengas en Feruquimia. Si la usas antes de que tu salud baje a 0, te quedas con 1 punto de salud en lugar de 0, sin lesión ni ' +
        'Inconsciencia, y obtienes los beneficios habituales de Decantar salud.',
    },
    {
      name: 'Sanación subconsciente',
      cost: 'free',
      prereq: 'Feruquimia 3 o más; talento Sanación espontánea',
      description:
        'Mientras estás Inconsciente o llevas muerto menos de un minuto, puedes Decantar salud como acción gratuita, incluso si algún efecto ' +
        'te impide actuar. Si estabas muerto, vuelves a la vida Inconsciente con 0 puntos de salud y a continuación obtienes los beneficios ' +
        'de Decantar salud.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 2 }, // L.294 / PDF 300
})

// ── Peltre · L.249-250 / PDF 255-256 ─────────────────────────────────────────────────────────────────────────────────────────────
const PELTRE = poder({
  metal: 'peltre',
  caminos: ['ferrin', 'nacidoble', 'feruquimista'], // L.249 / PDF 255
  descripcion:
    'Almacena fuerza física en una mentepeltre, lo que te vuelve enclenque y débil mientras lo haces; al decantar, tu tamaño y tu masa ' +
    'muscular aumentan, y con ellos tu vigor y tu envergadura. Los brutos llevan mentes de peltre que se dilatan para adaptarse al tamaño ' +
    'de su portador en cada momento.',
  almacenar: {
    nombre: 'Almacenar fuerza',
    activacion: 'action1',
    duracion: '1 carga por escena',
    coste: 'Ninguno',
    descripcion:
      'Almacenas fuerza hasta que le pones fin con una acción gratuita o gastas una carga de la mentepeltre. Tras cada escena en la que hayas ' +
      'almacenado durante toda su duración, la mente gana 1 carga.',
    efectos: ['Pasas a estar Mermado [Fuerza −1].', 'Sufres desventaja en las pruebas que usen el atributo Fuerza.'],
  },
  decantar: {
    nombre: 'Decantar fuerza',
    activacion: 'action1',
    duracion: DECANTAR_DURACION,
    coste: '1 carga',
    mantener: MANTENER,
    descripcion:
      'Gastas 1 carga de la mentepeltre para decantar fuerza durante tantas rondas como grados tengas en Feruquimia (o hasta que empieces a ' +
      'almacenar fuerza).',
    efectos: [
      'Pasas a estar Mejorado [Fuerza +2].',
      'Obtienes ventaja en las pruebas que no sean de ataque y que usen el atributo Fuerza.',
    ],
  },
  usosCreativos: [
    { nombre: 'Demostración de fuerza', texto: 'Decantas fuerza como parte de una prueba de Intimidación para parecer más amenazador.' },
    {
      nombre: 'Luchador insignificante',
      texto: 'Almacenas fuerza para que te perciban como alguien débil y evitar así llamar la atención de luchadores arrogantes u otros adversarios.',
    },
    { nombre: 'Ajuste de tamaño', texto: 'Almacenas fuerza para reducir tu masa muscular y pasar con más facilidad por un espacio estrecho.' },
  ],
  talentos: [
    {
      name: 'Armamento de brazo de peltre',
      cost: 'special',
      prereq: 'Armamento pesado 1 o más o Armamento ligero 1 o más; poder Feruquimia de peltre',
      description:
        'Al hacer un ataque con arma cuerpo a cuerpo mientras quemas peltre o decantas fuerza de una mentepeltre, puedes usar tu dado de ' +
        'daño sin armas en lugar del dado habitual del arma (lo decides antes de tirar; se mantienen los rasgos y el tipo de daño del ' +
        'arma). Mismo texto que el talento del mismo nombre de la alomancia de peltre; solo cambia el poder que exige.',
    },
    {
      name: 'Barricada de peltre',
      cost: 'passive',
      prereq: 'talento Muro de músculos',
      description:
        'Mientras decantas fuerza, los ataques no pueden beneficiarse del rasgo de arma Perforante si se hacen contra ti o contra un aliado ' +
        'que se beneficie de la cobertura de tu Muro de músculos.',
    },
    {
      name: 'Culturista',
      cost: 'special',
      prereq: 'Feruquimia 3 o más; talento Muro de músculos',
      description:
        'Al Decantar fuerza puedes gastar cualquier número de cargas hasta tu límite de artes metálicas: hasta el final de tu próximo turno, ' +
        'en lugar de los efectos habituales, quedas Mejorado [Fuerza] con una bonificación de 1 + las cargas gastadas, obtienes tantas ' +
        'ventajas en las pruebas de Fuerza (como un ataque sin armas) como la mitad de las cargas invertidas (redondeando hacia arriba) y ' +
        'tu tamaño aumenta en una categoría. Puedes mantenerla gastando 1 o más cargas como acción gratuita.',
    },
    {
      name: 'Lanzador de peltre',
      cost: 'passive',
      prereq: 'talento Armamento de brazo de peltre',
      description:
        'Mientras quemas peltre o decantas fuerza de una mentepeltre, las armas obtienen para ti el rasgo Arrojadiza [30/90] y, al hacer un ' +
        'ataque a distancia con un arma arrojadiza, puedes aplicar Armamento de brazo de peltre como si fuera un ataque cuerpo a cuerpo. ' +
        'Mismo talento, con el mismo prerrequisito, que en la alomancia de peltre.',
    },
    {
      name: 'Muro de músculos',
      cost: 'passive',
      prereq: 'Feruquimia 2 o más; poder Feruquimia de peltre',
      description:
        'Mientras decantas fuerza, tu valor de desvío aumenta en la mitad de las cargas invertidas en decantar fuerza (redondeando hacia ' +
        'arriba), puedes usar Prevenirse sin cobertura cercana usando tu musculatura como escudo y cuentas como cobertura para tus aliados.',
    },
    {
      name: 'Por los aires',
      cost: 'action1',
      prereq: 'Armamento pesado 3 o más; talento Lanzador de peltre',
      description:
        'Mientras decantas fuerza, eliges un objetivo o un punto del suelo a 30 metros o menos y, con una mano libre, lanzas hacia allí a un ' +
        'aliado dispuesto o a un enemigo Retenido que esté en tu cercanía y no sea más de una categoría de tamaño mayor que tú. El aliado ' +
        'aterriza a salvo; al enemigo lo usas como arma pesada improvisada Arrojadiza en un ataque a distancia y sufre el daño como si el ' +
        'ataque le hubiera impactado, sea cual sea el resultado de la prueba.',
    },
  ],
  cargasConVinculo: false,
  medallon: { disponibleParaPJ: true, rangoRecompensa: 2 }, // L.294 / PDF 300
})

/** The 17 feruchemical powers in the book's alphabetical order (acero … peltre; atium is third, as printed) */
export const PODERES_FERUQUIMICOS: PoderFeruquimico[] = [
  ACERO,
  ALUMINIO,
  ATIUM,
  BENDALEO,
  BRONCE,
  CADMIO,
  CINC,
  COBRE,
  CROMO,
  DURALUMINIO,
  ELECTRO,
  ESTANO,
  HIERRO,
  LATON,
  NICROSIL,
  ORO,
  PELTRE,
]
