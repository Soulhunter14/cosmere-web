/**
 * Alomancia of Nacidos de la bruma (chapter 6): the 17 alomantic powers (16 metals plus atium), each with its basic actions, its creative uses and its
 * talent tree.
 *
 * Source: the entries «Alomancia de <metal>» of L.172-212 / PDF 178-218; the page of each datum is cited next to it. `name`, `prereq` and the
 * activation glyph (`cost`) follow the book literally; descriptions, actions and creative uses are summaries in our own words.
 * Heavy data: it only travels in the lazy `mistborn.data` chunk, so no module of the main bundle may import it (§8, risk 6).
 *
 * Conventions:
 * - `id` `alomancia:<metal>`, `name` «Alomancia de <metal>», `atributo` Voluntad (the attribute of the Investida skill Alomancia, L.128 / PDF 134),
 *   `costoBase` the activation of the first action and `eras` copied from METALES (L.168 / PDF 174). `caminos` follow the header of each tree
 *   («Es posible desbloquear este árbol mediante el talento principal de los caminos de…»); only atium skips the goal «Entrenar tu poder»
 *   (`requiereMeta` false, L.177 / PDF 183).
 * - `talentos` are listed in the reading order of the book's diagram (row by row, left column first), so the two-column fallback layout of the
 *   talent map reproduces it; the exact geometry is T38-2's. The 7 names that appear in two trees (Prevenirse con palanca; Burbuja ampliada,
 *   Burbuja espontánea y Burbuja expeditiva; Control de masas, Influencia precisa y Manipulación sutil) are written in both with their own root
 *   prerequisite (rule «Talentos con nombres duplicados», L.75 / PDF 81).
 * - `prereq` is the printed prerequisite (root ones read «poder Alomancia de <metal>»); `cost` is the glyph of the «Activación» line
 *   (1 → action1, 2 → action2, 0 → free, r → reaction, ★ → special, ∞ → passive). Where the book contradicts itself, `notaLibro` says what each
 *   source prints and what is kept.
 */
import type { Era } from '../../types'
import { getMetal, type CaminoMetalId, type MetalId } from './metales'
import type { PoderAlomantico } from './tipos'

/** Metals available in each era: copied from METALES, the single source of the «Era» column (L.168 / PDF 174) */
const erasDe = (metal: MetalId): Era[] => [...getMetal(metal).eras]

const TRES_CAMINOS: CaminoMetalId[] = ['brumoso', 'nacidoble', 'nacido-de-la-bruma']
const BRUMOSO_NACIDOBLE: CaminoMetalId[] = ['brumoso', 'nacidoble']
const BRUMOSO_NACIDO: CaminoMetalId[] = ['brumoso', 'nacido-de-la-bruma']

export const PODERES_ALOMANTICOS: PoderAlomantico[] = [
  // ── Alomancia de acero · L.172-174 / PDF 178-180 ──
  {
    id: 'alomancia:acero', arte: 'alomancia', metal: 'acero', name: 'Alomancia de acero', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('acero'), requiereMeta: true, costoBase: 'action1',
    descripcion: 'Ves líneas azules entre tu centro de gravedad y el de cada metal cercano, y empujas a lo largo de ellas: se mueve el más pequeño de los dos, tú o el objeto. Los lanzamonedas, sus alomantes, disparan piezas metálicas a velocidad mortal.',
    acciones: [
      {
        nombre: 'Quemar acero', activacion: 'action1', duracion: '1 ronda',
        coste: 'Ninguno (basta con tener 1 punto de Investidura)',
        mantener: 'Si aún te queda 1 punto de Investidura, otra ronda como acción gratuita.',
        descripcion: 'Hasta el final de tu siguiente turno sientes todo el metal de tu alcance de artes metálicas y su tamaño.',
        efectos: [
          'El aluminio no se detecta.',
          'Salvo con 6 o más grados en Alomancia, no notas los objetos Investidos (mentes de metal, clavos) ni los incrustados en un cuerpo, como los pendientes.',
        ],
      }, // L.172 / PDF 178
      {
        nombre: 'Empujón de acero', activacion: 'action1', duracion: 'Instantánea',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas, mientras quemas acero',
        descripcion: 'Empujas un metal que sientes y eliges uno de los dos usos.',
        efectos: [
          'Si el objeto está fijado a otro, o alguien lo lleva o sostiene, cuenta el tamaño del conjunto.',
          'Normalmente no hay prueba; ante una maniobra muy compleja o arriesgada, la DJ puede pedir Alomancia o una habilidad mundana.',
        ],
        opciones: [
          { nombre: 'Propulsar', descripcion: 'Se mueve el más pequeño (si empatan, tú eliges): hasta 6 m por punto gastado, en línea recta y alejándose del otro. Contra algo enorme (un edificio, el suelo) el objeto no se mueve y tú te impulsas la distancia que falte.' },
          { nombre: 'Lanzar una moneda', descripcion: 'Un objeto menor que tú sale disparado hasta 6 m por punto gastado. Es un ataque a distancia de Alomancia contra Defensa física, con 1d4 de daño por golpe según tu dado de artes metálicas (con 2 grados, 1d6; etc.) y cuenta como ataque con arma de proyectil metálico.' },
        ],
      }, // L.172 / PDF 178
    ],
    usosCreativos: [
      { nombre: 'Volar', texto: 'Empujas en diagonal hacia abajo contra algo fijo o mayor que tú y sales disparado en línea recta hasta el máximo del Empujón. La DJ puede pedir Alomancia con la apuesta subida; si fallas, aterrizas sano pero en otro sitio, y una Complicación puede costarte daño por la caída.' }, // L.172-173 / PDF 178-179
      { nombre: 'Pasar un objeto', texto: 'Empujas un objeto hacia un aliado con una mano libre para que lo atrape; si hay obstáculos serios de por medio, prueba de Alomancia.' }, // L.173 / PDF 179
    ],
    talentos: [
      {
        name: 'Ráfaga de monedas', cost: 'special', prereq: 'poder Alomancia de acero', description: 'Antes de Lanzar una moneda puedes gastar Investidura extra, hasta tu límite, para que el disparo tenga el rasgo Explosiva: 1,5 m de radio por cada punto extra.',
        notaLibro: 'El prerrequisito se imprime «Alomancia de acero», sin el «poder» de las demás raíces (L.174 / PDF 180, verificado en imagen); se normaliza a «poder Alomancia de acero».',
      }, // L.174 / PDF 180
      { name: 'Prevenirse con palanca', cost: 'passive', prereq: 'poder Alomancia de acero', description: 'Cuando te apoyas con Prevenirse en algo mayor que tú, ese objeto pone el tamaño para tus Tirones de hierro y Empujones de acero; con objetos de tu tamaño o menores, tienes ventaja en esas pruebas de Alomancia.' }, // L.174 / PDF 180
      { name: 'Disparo con empujón', cost: 'special', prereq: 'Armamento pesado 2 o más o Armamento ligero 2 o más; talento Ráfaga de monedas', description: 'Tu Empujón de acero puede lanzar la munición metálica de un arma a distancia, en vez de la prueba de Alomancia. Valen el alcance y el daño del arma, con alcances corto y largo +6 m por punto gastado, más los dados de Lanzar una moneda.' }, // L.173 / PDF 179
      { name: 'Francotirador con monedas', cost: 'passive', prereq: 'Alomancia 3 o más; talento Ráfaga de monedas', description: 'Al Lanzar una moneda tiras un dado de daño extra del mismo tamaño.' }, // L.174 / PDF 180
      { name: 'Vuelo de acero auténtico', cost: 'action1', prereq: 'talento Experto en Empujones de acero', description: 'Con 1 punto de Investidura vuelas (valor de vuelo 12 m) hasta el final de tu próximo turno, siempre con suelo o una estructura firme a tu alcance de artes metálicas. Se prolonga con otro punto como acción gratuita.' }, // L.174 / PDF 180
      { name: 'Experto en Empujones de acero', cost: 'passive', prereq: 'Alomancia 3 o más; talento Prevenirse con palanca', description: 'Puedes repetir Empujón de acero en un turno, a 1 punto de concentración por cada uso tras el primero. Mientras te quede Investidura, tus ataques a distancia cuentan con apoyo estable.' }, // L.174 / PDF 180
      { name: 'Burbuja protectora', cost: 'action1', prereq: 'Alomancia 4 o más; talento Experto en Empujones de acero', description: 'Con 1 punto de Investidura te rodeas de empujones suaves hasta el final de tu próximo turno: los proyectiles metálicos que sientas te atacan con desventaja y rasguñarte cuesta 1 punto de concentración más. Se mantiene con 1 punto como acción gratuita.' }, // L.173 / PDF 179
    ],
  },
  // ── Alomancia de aluminio · L.175 / PDF 181 ──
  {
    id: 'alomancia:aluminio', arte: 'alomancia', metal: 'aluminio', name: 'Alomancia de aluminio', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('aluminio'), requiereMeta: true, costoBase: 'action1', // L.175 / PDF 181 (verificado en imagen): no tree header lists the paths; brumoso and nacidoble are backed by the text and by the table of L.372 / PDF 378 (Era 2), nacido-de-la-bruma is [inferido] by analogy with duraluminio and electro, whose headers list it (§7.5)
    descripcion: 'En Scadrial se tiene por un poder inútil, incluso dañino: vacía de golpe tus reservas de metal, también las de las mentes de metal que decantes. Fuera de Scadrial protege de las Artes Investidas ajenas, y los saltamundos llaman «vacíos» a quienes lo queman. El libro solo lo recomienda en campañas con saltamundos.',
    notaLibro: 'Sin árbol de talentos ni frase de caminos que lo desbloqueen (L.175 / PDF 181, verificado en imagen); sí es elegible como poder en Era 2 (tabla de L.372 / PDF 378: brumoso y nacidoble) y el recuadro «Elección de alomancia de aluminio» presenta al «mosquito de aluminio» como opción de personaje. Los `caminos` son los tres caminos alománticos: brumoso y nacidoble salen de esa tabla; nacido de la bruma se añade por analogía con el duraluminio y el electro, cuyas cabeceras sí lo listan [inferido: ni la entrada ni el recuadro enumeran caminos].',
    acciones: [
      {
        nombre: 'Quemar aluminio', activacion: 'action1', duracion: '1 ronda',
        coste: '1 punto de Investidura',
        mantener: '1 punto de Investidura como acción gratuita; como el aluminio deja la tuya en 0, antes hay que Beber vial u otra recarga.',
        descripcion: 'Hasta el final de tu próximo turno quedas vaciado de Investidura y a salvo de la ajena.',
        efectos: [
          'Tu Investidura baja a 0.',
          'Quedas Desprovisto de tus demás poderes mientras dure, aunque bebas un vial o te recargues de otro modo.',
          'Las mentes de metal que decantes, o cuyas cargas gastes, se quedan en 0 cargas sin efecto.',
          'Terminan todos los efectos Investidos que te afecten, vengan de otros poderes de nacido del metal o de potencias de luz tormentosa.',
          'Nada puede infundirte Investidura y no funcionan contra ti los efectos que lo necesitan (como la potencia de División); tu equipo y lo que sostienes no quedan protegidos.',
        ],
      }, // L.175 / PDF 181
    ],
    usosCreativos: [],
    talentos: [], // no talent tree (L.175)
  },
  // ── Alomancia de atium · L.176-178 / PDF 182-184 ──
  {
    id: 'alomancia:atium', arte: 'alomancia', metal: 'atium', name: 'Alomancia de atium', atributo: 'Voluntad',
    caminos: [...BRUMOSO_NACIDO], eras: erasDe('atium'), requiereMeta: false, costoBase: 'action1',
    descripcion: 'Ves las «sombras de atium», los futuros inmediatos de todo lo visible, y tu mente se ensancha para procesarlas y actuar: mientras lo quemas casi nadie logra esquivarte ni herirte. Sus alomantes son los videntes. Funciona aparte de los demás metales: se llevan cuentas de atium en vez de gastar Investidura, y no hay versión naciente ni meta «Entrenar tu poder».',
    acciones: [
      {
        nombre: 'Tragar atium', activacion: 'action1', duracion: 'Instantánea',
        coste: 'Una o más cuentas de atium (registro propio; no dan Investidura)',
        descripcion: 'Te tragas cuentas para quemarlas después; en la misma acción puedes Beber vial para otros metales.',
        efectos: [
          'El atium nunca sube tu Investidura actual: anota las cuentas aparte de los viales.',
        ],
      }, // L.176 / PDF 182
      {
        nombre: 'Quemar atium', activacion: 'action1', duracion: 'Una ronda de combate (o un minuto fuera de él) por cada grado en Alomancia',
        coste: '1 cuenta de atium ya tragada',
        mantener: 'Otra cuenta como acción gratuita, por la misma duración.',
        descripcion: 'Mientras dura, en tus pruebas para interactuar físicamente con alguien de tu alcance de artes metálicas (también contra su Defensa física) no tiras: todos tus d20 valen 15, ventajas y desventajas incluidas, antes de modificadores. Cuando un enemigo de tu alcance hace esa clase de prueba contra ti, sus d20 valen 5 (sin acción).',
        efectos: [
          'Si varios efectos fijan el valor del mismo dado (por ejemplo, quemáis atium los dos o alguien usa electro sobre tu tirada), se ignoran todos y se tira con normalidad.',
          'Contra otro que queme atium, tus talentos de Quemar atium (menos Despejar la mente) no le afectan ni anulan sus capacidades.',
        ],
      }, // L.176-177 / PDF 182-183
    ],
    usosCreativos: [],
    talentos: [
      { name: 'Maestría de las sombras', cost: 'passive', prereq: 'poder Alomancia de atium', description: 'Quemar atium mejora: tu d20 fijo sube tantos puntos como grados en Alomancia y el de tus rivales baja otros tantos. Lo que pase de 20 o baje de 1 se convierte en una Oportunidad extra para ti o una Complicación extra para el rival (6 grados: el 15 pasa a 21, queda en 20 y ganas 2 Oportunidades).' }, // L.177 / PDF 183
      { name: 'En el peor de los casos', cost: 'passive', prereq: 'Engaño 3 o más; poder Alomancia de atium', description: 'Quemando atium puedes decidir que las reacciones enemigas no se activen, y los ataques ya no te rasguñan.' }, // L.177 / PDF 183
      { name: 'Vidente social', cost: 'passive', prereq: 'Perspicacia 3 o más; talento Maestría de las sombras', description: 'Quemando atium, el efecto cubre también las pruebas mentales o espirituales contra un personaje (Defensa cognitiva y espiritual).' }, // L.178 / PDF 184
      { name: 'Despejar la mente', cost: 'special', prereq: 'Disciplina 4 o más; talento En el peor de los casos', description: 'Antes de que un efecto fije el valor de tus dados, gastas 1 punto de concentración y lo ignoras; útil contra otro que también queme atium.' }, // L.177 / PDF 183
      { name: 'Precisión vital', cost: 'passive', prereq: 'Alomancia 4 o más; talento Maestría de las sombras', description: 'Quemando atium, todos tus dados de daño dan su resultado máximo.' }, // L.178 / PDF 184
      { name: 'Modo dios', cost: 'special', prereq: 'Alomancia 5 o más; talento Precisión vital', description: 'Si un enemigo termina su turno mientras quemas atium, gastas 1 punto de concentración y haces ya una acción extra (de 1 acción o gratuita).' }, // L.178 / PDF 184
    ],
  },
  // ── Alomancia de bendaleo · L.179-181 / PDF 185-187 ──
  {
    id: 'alomancia:bendaleo', arte: 'alomancia', metal: 'bendaleo', name: 'Alomancia de bendaleo', atributo: 'Voluntad',
    caminos: [...BRUMOSO_NACIDOBLE], eras: erasDe('bendaleo'), requiereMeta: true, costoBase: 'action2',
    descripcion: 'Levantas a tu alrededor una burbuja donde el tiempo corre mucho más deprisa que fuera: para los de fuera, lo de dentro es un borrón. Sus alomantes son los deslizadores.',
    acciones: [
      {
        nombre: 'Quemar bendaleo', activacion: 'action2', duracion: '1 ronda',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas',
        mantener: 'La misma Investidura, como acción gratuita; hay que estar dentro de la burbuja.',
        descripcion: 'Burbuja Enorme (4,5 m) centrada en ti y fija al terreno (o a un vehículo Colosal, como un tren, a criterio de la DJ). Solo puedes tener una burbuja de bendaleo activa a la vez.',
        efectos: [
          'Cada ronda acaba con una ronda extra solo para los de dentro: un turno cada uno, con 1 + la Investidura gastada en acciones.',
          'En combate va tras el último turno lento (primero PJs, luego PNJs). En conversación o empeño va tras la última contribución, y cada 2 acciones (hacia arriba) dan una contribución extra: con 2 de Investidura son 3 acciones, es decir, 2 contribuciones.',
          'Dentro, los efectos persistentes avanzan más rápido: cada 2 acciones (hacia arriba) de la burbuja cuentan como 1 ronda transcurrida (metales quemados, mentes de metal).',
          'La burbuja se disipa al acabar la ronda extra, salvo que la mantengas.',
          'Burbujas solapadas (también de cadmio): quien esté en la intersección sufre todas; con varias de bendaleo, las acciones salen de la Investidura total invertida.',
          'Cruzar el borde por voluntad cuesta tanta concentración como Investidura se gastó (si llega a 0, o ya estaba, Aturdido hasta que acabe su siguiente turno). No hay comunicación ni influencia mundana a través de él, y los ataques que lo cruzan sufren tantas desventajas como Investidura gastada, ganan el rasgo Peligrosa y solo impactan o rasguñan si el atacante paga una Oportunidad.',
        ],
      }, // L.179 / PDF 185
    ],
    usosCreativos: [
      { nombre: 'Duelo forzado', texto: 'Encierras contigo a un solo enemigo en plena pelea para medirte con él a solas.' }, // L.180 / PDF 186
      { nombre: 'Reposo dilatado', texto: 'Con bendaleo de sobra, haces varios descansos mientras otros terminan uno.' }, // L.180 / PDF 186
      { nombre: 'Acción instantánea', texto: 'Te disfrazas o fuerzas una cerradura al momento y sin ruido para los de fuera.' }, // L.180 / PDF 186
    ],
    talentos: [
      { name: 'Burbuja ampliada', cost: 'special', prereq: 'poder Alomancia de bendaleo', description: 'Con 1 punto de Investidura extra, la burbuja de bendaleo o cadmio mide 7,5 m en vez de 4,5 m; mantenerla así cuesta otro punto extra.' }, // L.180 / PDF 186
      { name: 'Burbuja espontánea', cost: 'reaction', prereq: 'Alomancia 2 o más; poder Alomancia de bendaleo', description: 'Cuando alguien va a hacer algo que una burbuja afectaría, gastas 1 punto de concentración y quemas bendaleo o cadmio (Investidura normal). Contra un ataque debes hacerlo antes de la tirada, y el ataque cruza el borde.' }, // L.181 / PDF 187
      { name: 'Arreglo apresurado', cost: 'special', prereq: 'Alomancia 3 o más; talento Burbuja ampliada', description: 'En un empeño, si fallas una prueba dentro de tu burbuja de bendaleo, gastas 1 punto de concentración y sufres una Complicación en lugar de contar el fallo.' }, // L.180 / PDF 186
      { name: 'Burbuja defensiva', cost: 'passive', prereq: 'talento Burbuja espontánea', description: 'Dentro de tu burbuja de bendaleo, todas tus defensas contra efectos de fuera suben tanto como la Investidura gastada en ella.' }, // L.181 / PDF 187
      { name: 'Burbuja expeditiva', cost: 'passive', prereq: 'Alomancia 3 o más; talento Burbuja espontánea', description: 'Quemar bendaleo o cadmio te cuesta una acción menos.' }, // L.181 / PDF 187
    ],
  },
  // ── Alomancia de bronce · L.182-184 / PDF 188-190 ──
  {
    id: 'alomancia:bronce', arte: 'alomancia', metal: 'bronce', name: 'Alomancia de bronce', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('bronce'), requiereMeta: true, costoBase: 'action1',
    descripcion: 'Notas los pulsos, como redobles de tambor, de la Investidura cinética cercana, sobre todo la de alomantes que queman metales: de ahí el nombre de buscadores. Cada categoría de metal (física, mental, temporal, de mejora) tiene su ritmo, los externos laten más rápido que los internos, y Empujar o Tirar deja su sensación característica.',
    acciones: [
      {
        nombre: 'Quemar bronce', activacion: 'action1', duracion: 'Tantas rondas como tus grados en Alomancia',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas; más Investidura, más fuentes que buscar',
        mantener: '1 o más puntos de Investidura como acción gratuita, por la misma duración.',
        descripcion: 'Detectas en tu alcance de artes metálicas cada gasto de Investidura y los efectos persistentes que esta alimenta, aunque empezaran antes. De cada uno notas la dirección y puedes buscarlo (sin acción), hasta tantos a la vez como Investidura gastaste. Al buscar uno conoces su sitio exacto y su origen, y lo sigues si se mueve; con una acción 1 puedes tirar Alomancia CD 15 para saber qué poder lo causa.',
        efectos: [
          'En una multitud, o con muchos usos a la vez, fijar el sitio exacto puede requerir una prueba de Alomancia.',
          'Hay efectos difíciles de captar (Iluminación y otros tejidos de luz), y lo que se esconde tras algo que oculta Investidura, como una nube de cobre, ni se percibe; con 6 o más puntos de Investidura se atraviesa (ver cobre).',
        ],
      }, // L.182 / PDF 188
    ],
    usosCreativos: [
      { nombre: 'Ritmos de Roshar', texto: 'Acompasarte a los ritmos de Roshar.' }, // L.182-183 / PDF 188-189 · the names of these three ideas are ours: the book lists them without a title
      { nombre: 'Pulsos de Shadesmar', texto: 'Guiarte por Shadesmar siguiendo los grandes pulsos del Reino Cognitivo.' }, // L.182-183 / PDF 188-189
      { nombre: 'Cantos de las Esquirlas', texto: 'Reconocer por sus cantos si hay una Esquirla en un sistema planetario y, si ya la habías oído antes, cuál es.' }, // L.183 / PDF 189
    ],
    talentos: [
      { name: 'Buscador distante', cost: 'passive', prereq: 'poder Alomancia de bronce', description: 'Tu alcance de artes metálicas se duplica, solo para el bronce.' }, // L.183 / PDF 189
      { name: 'Maestro de pulsos', cost: 'passive', prereq: 'Alomancia 2 o más; poder Alomancia de bronce', description: 'Al empezar a buscar un efecto sabes sin tirar qué poder lo causa. Mientras lo buscas, con una acción 1 y Alomancia CD 15 averiguas cómo se usa: si aciertas, conoces sus efectos y dónde están sus objetivos dentro de tu alcance.' }, // L.184 / PDF 190
      { name: 'Búsqueda constante', cost: 'special', prereq: 'Alomancia 2 o más; talento Buscador distante', description: 'Quemas bronce sin gastar Investidura y con el efecto de 1 punto. Además, justo antes de que un enemigo de tu alcance use una capacidad Investida que detectarías, puedes quitarte el estado Sorprendido y recuperar lo que te hizo perder.' }, // L.184 / PDF 190
      { name: 'Buscador de reservas', cost: 'passive', prereq: 'talento Maestro de pulsos', description: 'De quien estás buscando conoces su Investidura máxima y la actual.' }, // L.183 / PDF 189
      { name: 'Defensa detectada', cost: 'passive', prereq: 'Alomancia 3 o más; talento Maestro de pulsos', description: 'Quemando bronce, cuando detectas a un enemigo que está usando una capacidad Investida, o bien sufre desventaja en su próxima prueba contra ti (hasta tu siguiente turno), o bien tú tienes ventaja en la próxima que te haga; lo que ocurra antes.' }, // L.184 / PDF 190
      { name: 'Buscador del Cosmere', cost: 'passive', prereq: 'Alomancia 3 o más; talento Maestro de pulsos', description: 'Quemando bronce notas casi cualquier capacidad Investida: las que gastan cargas (mentes de metal), las muy sutiles (Iluminación) y cosas como invocar o despedir una hoja esquirlada o un cantor armonizando un ritmo, del que reconoces cuál es.' }, // L.183 / PDF 189
    ],
  },
  // ── Alomancia de cadmio · L.185-187 / PDF 191-193 ──
  {
    id: 'alomancia:cadmio', arte: 'alomancia', metal: 'cadmio', name: 'Alomancia de cadmio', atributo: 'Voluntad',
    caminos: [...BRUMOSO_NACIDOBLE], eras: erasDe('cadmio'), requiereMeta: true, costoBase: 'action2',
    descripcion: 'Creas una burbuja donde el tiempo se arrastra mucho más despacio que fuera: lo de dentro parece ir a cámara lenta o quedarse quieto. Sus alomantes son los pulsadores. En combate se juzgó casi inútil, hasta que las granadas alománticas (Creaciones raras, cap. 8) permitieron ralentizar solo a los enemigos.',
    acciones: [
      {
        nombre: 'Quemar cadmio', activacion: 'action2', duracion: '1 ronda',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas',
        mantener: 'La misma Investidura, como acción gratuita; hay que estar dentro, y los de dentro suman otros 1 + Investidura puntos de demora.',
        descripcion: 'Burbuja Enorme (4,5 m) centrada en ti y fija al terreno (o a un vehículo Colosal, a criterio de la DJ). Solo puedes tener una burbuja de cadmio activa a la vez.',
        efectos: [
          'Todos los de dentro, tú también, ganan 1 + la Investidura gastada en puntos de demora. Con demora, cada acción y contribución debe ir a quitarla y no hay otras acciones ni reacciones: con una acción 1 se quita 1 punto (repetible); una acción gratuita sigue permitida y, si concede acciones 1, estas también sirven para quitar demora; en conversación o empeño, la contribución quita 2.',
          'Mientras un personaje tenga demora, se pausa la duración de sus efectos persistentes (metales quemados, mentes de metal).',
          'Termina al acabar la ronda siguiente; como las rondas no pasan mientras hay demora, dura hasta el final de la ronda en que el lanzador quita su último punto. Al disiparse, la demora restante desaparece.',
          'Burbujas solapadas (también de bendaleo): todas afectan; las de cadmio suman su demora.',
          'Salir de la burbuja quita toda la demora; entrar da 1 + Investidura puntos. Cruzar el borde cuesta tanta concentración como Investidura gastada (si llega a 0, o ya estaba, Aturdido hasta que acabe su siguiente turno); no hay comunicación ni influencia mundana a través de él, y los ataques que lo cruzan sufren tantas desventajas como Investidura gastada, ganan Peligrosa y solo impactan o rasguñan si el atacante paga una Oportunidad.',
        ],
      }, // L.185-186 / PDF 191-192
    ],
    usosCreativos: [
      { nombre: 'Espectáculo dinámico', texto: 'Ralentizas un instante a los artistas de una función para que su proeza luzca a cámara lenta.' }, // L.186 / PDF 192
      { nombre: 'Observación científica', texto: 'Dejas que otros estudien desde fuera fenómenos del interior que a velocidad normal serían inapreciables.' }, // L.186 / PDF 192
      { nombre: 'Tácticas de demora', texto: 'Impides que un enemigo actúe o que avance la cuenta atrás de un explosivo, y ganas tiempo para tus aliados de fuera.' }, // L.186 / PDF 192
    ],
    talentos: [
      { name: 'Burbuja ampliada', cost: 'special', prereq: 'poder Alomancia de cadmio', description: 'Con 1 punto de Investidura extra, la burbuja de bendaleo o cadmio mide 7,5 m en vez de 4,5 m; mantenerla así cuesta otro punto extra.' }, // L.186 / PDF 192
      { name: 'Burbuja espontánea', cost: 'reaction', prereq: 'Alomancia 2 o más; poder Alomancia de cadmio', description: 'Cuando alguien va a hacer algo que una burbuja afectaría, gastas 1 punto de concentración y quemas bendaleo o cadmio (Investidura normal). Contra un ataque debes hacerlo antes de la tirada, y el ataque cruza el borde.' }, // L.186 / PDF 192
      {
        name: 'Dilatación temporal', cost: 'passive', prereq: 'Alomancia 3 o más; talento Burbuja ampliada', description: 'Con Burbuja ampliada, tu burbuja de cadmio puede medir entre 10,5 y 13,5 m (en vez de 7,5 m).',
        notaLibro: 'El texto del talento da una horquilla de 10,5 a 13,5 m; el diagrama lo resume como «hasta los 13,5 metros» (L.186 / PDF 192 y L.187 / PDF 193, verificado en imagen del diagrama).',
      }, // L.186 / PDF 192
      { name: 'Burbuja expeditiva', cost: 'passive', prereq: 'Alomancia 3 o más; talento Burbuja espontánea', description: 'Quemar bendaleo o cadmio te cuesta una acción menos.' }, // L.186 / PDF 192
    ],
  },
  // ── Alomancia de cinc · L.188-190 / PDF 194-196 ──
  {
    id: 'alomancia:cinc', arte: 'alomancia', metal: 'cinc', name: 'Alomancia de cinc', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('cinc'), requiereMeta: true, costoBase: 'action2',
    descripcion: 'Enciendes sutilmente las emociones ajenas y la gente actúa según ellas, convencida de que la idea fue suya. Sus alomantes son los encendedores: pueden encender varias a la vez, aunque no perciben las emociones de los demás y deben leerlas por medios mundanos.',
    acciones: [
      {
        nombre: 'Quemar cinc', activacion: 'action2', duracion: '1 ronda',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas; más Investidura, más difícil resistirse',
        mantener: '1 o más puntos de Investidura como acción gratuita sobre los afectados de tu alcance; así puedes ajustar la potencia.',
        descripcion: 'Eliges una emoción (ira, amabilidad…) y una zona Grande (3 m) dentro de tu alcance de artes metálicas. La enciendes en todos los de la zona menos en ti hasta que acabe tu próximo turno, y la DJ decide cómo se comportan los PNJs. Si no quieres que lo noten, haces Alomancia contra la Defensa espiritual de cada afectado: si fallas, saben que les encienden las emociones y la DJ puede decidir que descubran que eres tú.',
        efectos: [
          'Quien sabe que lo influyen puede resistirse como acción gratuita gastando tanta concentración como Investidura usaste (en vez del coste habitual de resistir influencia) y no sufre la alteración hasta el inicio de su próximo turno.',
          'Complicaciones: si la DJ gasta una Complicación tuya o de un aliado mientras quemas cinc, alguien puede notar el encendido o descubrir que eres el encendedor.',
          'Manipulaciones solapadas: efectos parecidos sobre una misma persona se combinan (basta resistir el más fuerte) y los opuestos se anulan.',
          'Control de PNJs: con 6 o más puntos de Investidura, si enciendes con éxito a un PNJ kandra, koloss u otro ser hemalúrgico con 0 de concentración, puedes cambiar los efectos habituales por convertirlo en tu compañero, hasta que le hagas daño o otro lo convierta en el suyo.',
          'Cuando manipulan las emociones de tu personaje decides cómo reacciona, pero antes de contradecir de frente la emoción alterada debes gastar concentración para resistir (ver «Estados emocionales alterados», en latón).',
        ],
      }, // L.188 / PDF 194
    ],
    usosCreativos: [
      { nombre: 'Múltiples emociones', texto: 'Enciendes varias a la vez, con posible desventaja de la DJ en tu prueba de Alomancia; si son tantas que las demás parecen apagarse, hasta imitas al latón.' }, // L.188 / PDF 194
      { nombre: 'Influencia perspicaz', texto: 'Antes de encender, Obtener ventaja con Perspicacia: si sale bien, sabes qué emociones tienen más probabilidades de provocar la reacción que buscas.' }, // L.188 / PDF 194
      { nombre: 'Aliento', texto: 'Empujas a un aliado dispuesto a superar su obstáculo con una acción valiente, atrevida o fiel a sus ideales.' }, // L.188 / PDF 194
    ],
    talentos: [
      { name: 'Control de masas', cost: 'passive', prereq: 'Alomancia 2 o más; poder Alomancia de cinc', description: 'Quemando latón o cinc, el área puede ampliarse hasta una zona Colosal (9 m).' }, // L.189 / PDF 195
      { name: 'Agresión abrumadora', cost: 'free', prereq: 'poder Alomancia de cinc', description: 'Gastas 2 puntos de Investidura sobre alguien al que enciendes y que tiene 0 de concentración, y lo lanzas a un frenesí: mientras dure el encendido, cada turno suyo debe emplear todas sus acciones en ir a por el personaje más cercano y atacarlo (a igual distancia, al azar).' }, // L.189 / PDF 195
      { name: 'Influencia precisa', cost: 'passive', prereq: 'Alomancia 3 o más; talento Control de masas', description: 'Quemar latón o cinc te cuesta una acción menos y, al influir en una zona, puedes eximir de ella a los objetivos que conozcas.' }, // L.190 / PDF 196
      { name: 'Encender determinación', cost: 'special', prereq: 'Liderazgo 2 o más; talento Agresión abrumadora', description: 'Una vez por escena, al quemar cinc, cambias el efecto habitual por dar ánimo: cada personaje de la zona menos tú recupera concentración igual a la mitad de la Investidura gastada (hacia arriba) y queda Resuelto hasta que lo pierda o acabe tu encendido.' }, // L.189 / PDF 195
      {
        name: 'Manipulación sutil', cost: 'action1', prereq: 'Perspicacia 3 o más; talento Influencia precisa', description: 'Gastas 1 punto de Investidura: hasta el final de tu próximo turno tienes ventaja al influir en personajes de tu alcance (también en la prueba de Alomancia para pasar inadvertido) y los Secuaces y Rivales que te resisten pierden 2 puntos de concentración más. Se mantiene con 1 punto como acción gratuita.',
        notaLibro: 'En la copia de cinc la línea «Activación» imprime el marcador «[1 action]» en lugar del símbolo (L.190 / PDF 196, verificado en imagen); el diagrama de cinc y la copia de latón (L.206 / PDF 212) llevan el símbolo de 1 acción, que es el que se usa.',
      }, // L.190 / PDF 196
      { name: 'Brío profundo', cost: 'special', prereq: 'Liderazgo 3 o más; talento Encender determinación', description: 'Al Encender determinación eliges además tantos objetivos como Investidura gastaste: quedan Concentrados mientras dure el efecto.' }, // L.189 / PDF 195
    ],
  },
  // ── Alomancia de cobre · L.191-192 / PDF 197-198 ──
  {
    id: 'alomancia:cobre', arte: 'alomancia', metal: 'cobre', name: 'Alomancia de cobre', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('cobre'), requiereMeta: true, costoBase: 'action1',
    descripcion: 'Creas una nube invisible que oculta a cuantos están dentro frente a los sentidos Investidos, como los de un buscador que queme bronce. Sus alomantes son los ahumadores (o nubecobres) y, mientras queman cobre, resisten la alomancia emocional, salvo la más poderosa.',
    acciones: [
      {
        nombre: 'Quemar cobre', activacion: 'action1', duracion: 'Tantas rondas como tus grados en Alomancia',
        coste: '1 punto de Investidura',
        mantener: '1 punto de Investidura como acción gratuita, por la misma duración.',
        descripcion: 'Nube de cobre centrada en ti, de hasta 3 m de radio (lo eliges al activar o mantener), que te acompaña.',
        efectos: [
          'Ni los sentidos ni los poderes Investidos (como un buscador con bronce) captan la nube, a quienes están en ella ni su uso de Investidura; los de dentro tampoco notan efectos externos.',
          'Mientras la quemas, no te afectan los efectos Investidos sobre la mente o las emociones (latón, cinc).',
          'Una capacidad que ponga en juego 6 o más puntos de Investidura (o su equivalente, como 6 cargas de una mente de metal) atraviesa ambos efectos de la nube, aunque se ignore que existe: un alomante de latón o cinc con 6 puntos afecta a los de dentro, y uno de bronce con 6 la percibe y, el resto de la escena, ve lo que oculta. Casi nadie pasa de límite 5, así que casi nadie puede.',
        ],
      }, // L.191 / PDF 197
    ],
    usosCreativos: [
      { nombre: 'Deducción de cobre', texto: 'Enciendes y apagas el cobre para sonsacar información a otros alomantes cercanos: una cara de desconcierto repentina delata a un buscador, y un cambio brusco en tus emociones, qué sentimiento intenta apagar un aplacador.' }, // L.192 / PDF 198
      { nombre: 'Colocación estratégica de la nube', texto: 'Cubres a unos alomantes y a otros no para engañar a los buscadores: por ejemplo, uno del grupo quema metal fuera de la nube como cebo mientras los demás esperan emboscados dentro.' }, // L.192 / PDF 198
    ],
    talentos: [
      { name: 'Cobertura espontánea', cost: 'reaction', prereq: 'poder Alomancia de cobre', description: 'Cuando alguien al que sientes va a usar una capacidad Investida que la nube bloquearía (como el bronce) y eres consciente de ello, gastas 1 punto de concentración y quemas cobre (Investidura normal). También vale en cuanto lo notes, aunque ya hubiera empezado.' }, // L.192 / PDF 198
      { name: 'Nube de cobre ampliada', cost: 'passive', prereq: 'poder Alomancia de cobre', description: 'El radio máximo de tu nube crece 1,5 m por cada grado en Alomancia (con 2 grados, +3 m: radio máximo de 6 m).' }, // L.192 / PDF 198
      { name: 'Coordinación encubierta', cost: 'special', prereq: 'Sigilo 3 o más; talento Cobertura espontánea', description: 'Cuando un aliado situado en tu nube va a hacer una prueba de Sigilo, o una con la apuesta subida, gastas 1 punto de concentración para darle ventaja.' }, // L.192 / PDF 198
      { name: 'Ahumador eficiente', cost: 'passive', prereq: 'Alomancia 2 o más; talento Nube de cobre ampliada o Cobertura espontánea', description: 'Quemar cobre dura el doble (el doble de tus grados en rondas) y, mientras lo quemas, cambias el tamaño de la nube como acción gratuita.' }, // L.192 / PDF 198
    ],
  },
  // ── Alomancia de cromo · L.193-194 / PDF 199-200 ──
  {
    id: 'alomancia:cromo', arte: 'alomancia', metal: 'cromo', name: 'Alomancia de cromo', atributo: 'Voluntad',
    caminos: [...BRUMOSO_NACIDOBLE], eras: erasDe('cromo'), requiereMeta: true, costoBase: 'action1',
    descripcion: 'Con un toque vacías las reservas de poder de un nacido del metal o de otro personaje Investido, que siente un frío súbito. Sus alomantes son las sanguijuelas; en Scadrial, una banda sensata lleva una por si aparece otro usuario de las artes metálicas.',
    notaLibro: 'La acción dice «Tira 1d4» y, a la vez, que el objeto con cargas «pierde la mitad» (L.193 / PDF 199); Sifón de mentes de metal (L.194 / PDF 200) dice que con ese talento se pierde el resultado del dado «en lugar de la mitad», así que de base se pierde la mitad y el dado solo cuenta con ese talento. Se toma la mitad (verificado en imagen, PDF 199 y 200); la tirada de 1d4 de ese punto no fija las cargas.',
    acciones: [
      {
        nombre: 'Quemar cromo', activacion: 'action1', duracion: 'Instantánea',
        coste: '1 punto de Investidura (no se gasta si fallas contra un reticente)',
        descripcion: 'Tocas a un personaje u objeto Investido de tu alcance y drenas su poder. Contra un reticente, o contra un objeto suyo, antes tienes que ganar con Alomancia a su Defensa física; si no lo logras, no drenas ni gastas. El dado es tu dado de artes metálicas (con 2 grados, 1d6 en vez de 1d4).',
        opciones: [
          { nombre: 'Personaje Investido', descripcion: 'Pierde 1d4 puntos de Investidura; si prefieres, drenas esa Investidura de un efecto concreto que tenga infundido.' },
          { nombre: 'Objeto infundido', descripcion: 'Si algo está infundido con Investidura (p. ej. mediante una potencia de luz tormentosa), le quitas 1d4 puntos.' },
          { nombre: 'Objeto con cargas', descripcion: 'Pierde la mitad de sus cargas (hacia abajo), como un fabrial de luz tormentosa. Una mente de metal feruquímica solo se drena si su portador tiene 0 de Investidura y está almacenando o decantando ese metal.' },
        ],
      }, // L.193 / PDF 199
    ],
    usosCreativos: [
      { nombre: 'Drenaje sigiloso', texto: 'Si drenas muy despacio y con sutileza, puede que la víctima no note la pérdida hasta que intente usar sus poderes.' }, // L.193 / PDF 199
      { nombre: 'Drenaje preventivo', texto: 'Con un alomante prisionero, drenarlo a menudo evita que acumule metales residuales del agua u otras fuentes.' }, // L.193 / PDF 199
    ],
    talentos: [
      { name: 'Agarre drenante', cost: 'special', prereq: 'poder Alomancia de cromo', description: 'Tras superar una prueba de habilidad física (un ataque con arma, o Hurto para sustraer viales) contra alguien de tu cercanía, gastas una Oportunidad o 2 puntos de concentración y lo drenas con Quemar cromo, sin acción; tu prueba de Alomancia contra su Defensa física triunfa sin tirar.' }, // L.193 / PDF 199
      { name: 'Drenaje reactivo', cost: 'reaction', prereq: 'Alomancia 2 o más; poder Alomancia de cromo', description: 'Cuando alguien de tu cercanía va a usar una capacidad Investida de la que eres consciente (un alomante que quema, un feruquimista que decanta), lo drenas con Quemar cromo, con la Investidura habitual. Si lo dejas sin recursos para ella, no se produce y pierde las acciones invertidas.' }, // L.193 / PDF 199
      { name: 'Drenaje simultáneo', cost: 'special', prereq: 'Alomancia 3 o más; talento Agarre drenante', description: 'Quemar cromo puede afectar a dos objetivos de tu cercanía. Si los dos son reticentes, haces una única prueba de Alomancia con la apuesta subida, que se enfrenta por separado a la Defensa física de cada objetivo; si superas ambas, pagas la Investidura una vez y los dos sufren el mismo resultado de tu dado de artes metálicas.' }, // L.194 / PDF 200
      { name: 'Sanguijuela evasiva', cost: 'special', prereq: 'Hurto 2 o más; talento Drenaje reactivo', description: 'Al empezar el combate y cada uno de tus turnos tienes una reacción más, solo para Esquivar o para Drenaje reactivo. Además, tras Esquivar a un atacante de tu cercanía, gastas 1 punto de concentración (más la Investidura habitual) y lo drenas con Quemar cromo.' }, // L.194 / PDF 200
      { name: 'Hiperdrenaje', cost: 'special', prereq: 'talento Agarre drenante o talento Drenaje reactivo', description: 'Al Quemar cromo puedes gastar Investidura extra hasta tu límite; por cada punto extra tiras un dado de artes metálicas más para fijar cuánta Investidura o cuántas cargas drenas.' }, // L.194 / PDF 200
      { name: 'Sifón de mentes de metal', cost: 'passive', prereq: 'Alomancia 4 o más; talento Hiperdrenaje', description: 'Un objeto con cargas pierde tantas como marque tu dado de artes metálicas (no la mitad). Puedes drenar la mente de metal de alguien aunque aún conserve Investidura, siempre que esté almacenando o decantando.' }, // L.194 / PDF 200
    ],
  },
  // ── Alomancia de duraluminio · L.195-196 / PDF 201-202 ──
  {
    id: 'alomancia:duraluminio', arte: 'alomancia', metal: 'duraluminio', name: 'Alomancia de duraluminio', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('duraluminio'), requiereMeta: true, costoBase: 'special', // verificado en imagen, PDF 202: the tree header lists nacido-de-la-bruma, but the table of L.372 / PDF 378 does not list this metal for it in Era 1; PDF 173 leaves the end-of-Era-1 case to the GM (see notaLibro)
    descripcion: 'Si lo quemas al usar otro poder, toda tu Investidura estalla en él: un fogonazo difícil de controlar, pero capaz de saltarse los límites de la capacidad. Sin otra capacidad Investida no sirve de nada (de ahí «mosquitos de duraluminio»). El libro solo lo recomienda con saltamundos o con clavos hemalúrgicos a mano.',
    notaLibro: 'La cabecera del árbol lo asigna a brumoso, nacidoble y nacido de la bruma (L.196 / PDF 202), pero la tabla de L.372 / PDF 378 no lista el duraluminio para el nacido de la bruma (Era 1); la nota ‡ de L.168 / PDF 174 y el apartado «Final de la Era 1» de L.167 / PDF 173 lo abren a finales de la Era 1 y dejan a la DJ fijar cuándo y cómo se conoce. Se conserva la cabecera como opción del director a finales de la Era 1 (verificado en imagen, PDF 173, 174, 202 y 378).',
    acciones: [
      {
        nombre: 'Quemar duraluminio', activacion: 'special', duracion: 'Instantánea',
        coste: 'Toda tu Investidura restante (sin límite de artes metálicas ni costes habituales); no requiere acción',
        descripcion: 'En el momento de usar o mantener una capacidad que gaste Investidura (otro poder, por ejemplo), la haces estallar: vuelcas en ella toda tu Investidura restante.',
        efectos: [
          'Si la capacidad deja elegir tamaño, alcance o número de objetivos, debes tomar el máximo de cada uno.',
          'Tiras un dado de trama como al subir la apuesta: con una Complicación, la DJ puede hacer que pierdas el control por completo (daños al entorno, a aliados o a ti, pérdida de concentración, lesiones…); una Oportunidad se gasta como siempre.',
          'También puedes hacer estallar capacidades que no cuestan Investidura o no mejoran con más gasto: consumes igualmente toda tu Investidura y resuelves las consecuencias con la DJ.',
          'Si la capacidad no escala con la Investidura (L.196 / PDF 202): compara con su coste normal, localiza su función principal (daño, curación, drenar o recuperar concentración) y aumenta esa función en proporción a lo gastado de más; lo mismo vale para las consecuencias de perder el control.',
        ],
      }, // L.195 / PDF 201
    ],
    usosCreativos: [
      { nombre: 'Estallido de Revitalizar', texto: 'Haces estallar el talento Revitalizar (peltre): tiras un d6 adicional por cada punto extra de Investidura, o quemas peltre con esa Investidura de más.' }, // L.196 / PDF 202
      { nombre: 'Estallido de Burbuja protectora', texto: 'Haces estallar Burbuja protectora (acero): el radio crece 1,5 m por punto extra y el efecto alcanza a cualquier proyectil que la cruce, sea cual sea su objetivo.' }, // L.196 / PDF 202
    ],
    talentos: [
      { name: 'Estallido controlado', cost: 'passive', prereq: 'Alomancia 4 o más; poder Alomancia de duraluminio; al menos otro poder o capacidad Investida', description: 'Al Quemar duraluminio, el dado de trama pasa a ser opcional, no tienes que tomar los máximos de tamaño, alcance y objetivos, y controlas mejor los efectos extraordinarios que sustituyen o acompañan a los normales (se resuelven con la DJ).' }, // L.196 / PDF 202
      { name: 'Estallido selectivo', cost: 'special', prereq: 'poder Alomancia de duraluminio; al menos otros dos poderes o capacidades Investidas', description: 'Puedes quemar duraluminio quedando Desprovisto del poder que estalla, en vez de gastar toda tu Investidura restante; el estallido se resuelve igual que si la hubieras gastado.' }, // L.196 / PDF 202
    ],
  },
  // ── Alomancia de electro · L.197-198 / PDF 203-204 ──
  {
    id: 'alomancia:electro', arte: 'alomancia', metal: 'electro', name: 'Alomancia de electro', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('electro'), requiereMeta: true, costoBase: 'action1', // verificado en imagen, PDF 204: the tree header lists nacido-de-la-bruma, but the table of L.372 / PDF 378 does not list this metal for it in Era 1; PDF 173 leaves the end-of-Era-1 case to the GM (see notaLibro)
    descripcion: 'Ves tus «sombras de electro», tus posibles futuros inmediatos. Solo te ves a ti mismo y a tu sombra reaccionando, sin saber qué o quién la provoca, por lo que a los oráculos les cuesta interpretarlas sin práctica. Valen menos que las del atium, pero quemar electro vuelve inútil el atium contra ti.',
    notaLibro: 'La cabecera del árbol lo asigna a brumoso, nacidoble y nacido de la bruma (L.198 / PDF 204), pero la tabla de L.372 / PDF 378 no lista el electro para el nacido de la bruma (Era 1); la nota ‡ de L.168 / PDF 174 y el apartado «Final de la Era 1» de L.167 / PDF 173 lo abren a finales de la Era 1 y dejan a la DJ fijar cuándo y cómo se conoce. Se conserva la cabecera como opción del director a finales de la Era 1 (verificado en imagen, PDF 173, 174, 204 y 378).',
    acciones: [
      {
        nombre: 'Quemar electro', activacion: 'action1', duracion: '1 ronda',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas',
        mantener: '1 o más puntos de Investidura como acción gratuita; las sombras se vuelven a tirar, aunque no hubieras gastado las anteriores.',
        descripcion: 'Tiras tantos d20 como Investidura gastaste y los anotas: son tus sombras; duran hasta que las uses o acabe tu próximo turno. Cuando un enemigo haga una prueba contra ti, puedes gastar una sombra (sin acción) para cambiar el d20 de la prueba por su valor; hazlo tras ver su tirada y sus ventajas o desventajas, pero antes de resolver efectos.',
      }, // L.197 / PDF 203
    ],
    usosCreativos: [
      { nombre: 'Detección de trampas', texto: 'Mandas tus sombras por delante y miras cómo reaccionan para dar con trampas en tu alcance de artes metálicas: 1 o más puntos de Investidura y prueba de Percepción, con una ventaja por cada punto más allá del primero.' }, // L.197 / PDF 203
      { nombre: 'Juegos de azar', texto: 'Estudias tus sombras al apostar para decidir si pujar, a quién apostar, plantarte o subir, o cualquier acción parecida que se resuelva en 1 ronda: 1 o más puntos de Investidura y prueba de Perspicacia, con una ventaja por cada punto más allá del primero.' }, // L.197 / PDF 203
    ],
    talentos: [
      { name: 'Reacciones prescientes', cost: 'passive', prereq: 'poder Alomancia de electro', description: 'Una sombra de electro puede ocupar el lugar de tu reacción para Esquivar o hacer Acometida reactiva contra un enemigo de tu alcance, aunque ya hayas agotado la de la ronda; en ese caso, el valor anotado en la sombra no tiene efecto.' }, // L.198 / PDF 204
      { name: 'Sombras persistentes', cost: 'special', prereq: 'Alomancia 2 o más; poder Alomancia de electro', description: 'Al mantener Quemar electro, gastas Investidura extra (hasta tu límite) para guardar esa cantidad de sombras actuales una ronda más, además de tirar las nuevas.' }, // L.198 / PDF 204
      { name: 'Electro profético', cost: 'special', prereq: 'Alomancia 2 o más; talento Reacciones prescientes', description: 'Al quemar electro, antes de anotar tus sombras, puedes repetir uno de los d20 y quedarte con el nuevo valor. Si lo quemas Sorprendido, ese estado termina y recuperas lo que te hizo perder.' }, // L.198 / PDF 204
      { name: 'Oráculo proactivo', cost: 'special', prereq: 'Perspicacia 2 o más; talento Sombras persistentes', description: 'En una prueba que afecte a alguien de tu alcance, gastas una sombra para sustituir tu d20 por su valor, tras ver tu tirada y sus ventajas o desventajas y antes de resolver efectos.' }, // L.198 / PDF 204
      { name: 'Objetivo resbaladizo', cost: 'passive', prereq: 'Alomancia 3 o más; talento Reacciones prescientes', description: 'Quemando electro, los ataques no pueden rasguñarte y las Acometidas reactivas contra ti tienen desventaja.' }, // L.198 / PDF 204
      { name: 'Ejercicio teórico', cost: 'special', prereq: 'Alomancia 3 o más; talento Oráculo proactivo', description: 'Una vez por ronda, cuando acabas de resolver una acción o reacción tuya, gastas 3 puntos de Investidura y la deshaces: recuperas lo invertido (acciones, concentración, Investidura) y todo se revierte. Luego puedes repetirla, hacer otra cosa o no actuar.' }, // L.198 / PDF 204
    ],
  },
  // ── Alomancia de estaño · L.199-200 / PDF 205-206 ──
  {
    id: 'alomancia:estano', arte: 'alomancia', metal: 'estano', name: 'Alomancia de estaño', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('estano'), requiereMeta: true, costoBase: 'action1',
    descripcion: 'Agudizas todos tus sentidos, no solo la vista. Sus alomantes son los ojos de estaño, buenos centinelas y exploradores, sobre todo con poca luz; cuando sufren dolor o cansancio, a veces avivan el metal para despejarse con la estimulación sensorial.',
    acciones: [
      {
        nombre: 'Quemar estaño', activacion: 'action1', duracion: 'Tantas rondas como tus grados en Alomancia',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas',
        mantener: '1 o más puntos de Investidura como acción gratuita, por la misma duración.',
        descripcion: 'Durante ese tiempo obtienes dos beneficios.',
        efectos: [
          'Quedas Mejorado [Discernimiento] con una bonificación igual a la mitad de la Investidura gastada (hacia arriba).',
          'Tus sentidos se vuelven sobrenaturales: percibes más, pero eres más vulnerable (ver «Sentidos sobrenaturales», cap. 3).',
        ],
      }, // L.199 / PDF 205
    ],
    usosCreativos: [
      { nombre: 'Sensaciones familiares', texto: 'Evocas con más detalle imágenes, olores u otras sensaciones que intentas recordar.' }, // L.199 / PDF 205
      { nombre: 'Atravesar las brumas', texto: 'Un ojo de estaño atraviesa con la vista casi cualquier Investidura en forma de gas, las brumas de Scadrial entre ellas.' }, // L.199 / PDF 205
    ],
    talentos: [
      { name: 'Reenfoque con avivamiento', cost: 'action1', prereq: 'poder Alomancia de estaño', description: 'Gastas 1 o más puntos de Investidura y recuperas esa misma cantidad de concentración, a cambio de 1d4 de daño vital por cada punto gastado.' }, // L.200 / PDF 206
      { name: 'Preparación sensible', cost: 'special', prereq: 'Alomancia 2 o más; poder Alomancia de estaño', description: 'Quemas estaño sin gastar Investidura, con el efecto de 1 punto. Y si lo quemas estando Sorprendido, ese estado termina y recuperas lo que te hizo perder.' }, // L.200 / PDF 206
      { name: 'Precisión de estaño', cost: 'passive', prereq: 'Armamento pesado 1 o más o Armamento ligero 1 o más; talento Reenfoque con avivamiento', description: 'Quemando estaño o decantando sentidos de una mentestaño, tus alcances corto y largo a distancia aumentan en tu alcance de los sentidos, y puedes no subir la apuesta al disparar a un objetivo que sientas a 1,5 m o menos de un aliado.' }, // L.200 / PDF 206
      { name: 'Sensibilidad proactiva', cost: 'passive', prereq: 'talento Preparación sensible', description: 'Tus sentidos sobrenaturales no se saturan con estímulos repentinos de aliados o propios, así que no hace falta prueba de Disciplina para evitar Desorientado.' }, // L.200 / PDF 206
      { name: 'Sentir la debilidad', cost: 'passive', prereq: 'Alomancia 3 o más; talento Reenfoque con avivamiento', description: 'Quemando estaño, si Obtienes ventaja con Deducción o una habilidad de Discernimiento, conoces además la salud actual del objetivo y sus tres Defensas, y tu siguiente ataque contra él ese turno hace 1d4 de daño extra (dado de artes metálicas: con 2 grados, 1d6; etc.).' }, // L.200 / PDF 206
      {
        name: 'Enhaciendo el no ver', cost: 'free', prereq: 'Alomancia 3 o más; talento Sensibilidad proactiva', description: 'Quemando estaño, gastas 2 puntos de concentración y conservas un único sentido de tu elección, con el alcance multiplicado por cuatro; dura hasta que acabe tu próximo turno o dejes de quemar. Una vez por turno, en una prueba que dependa de ese sentido, puedes optar por una Oportunidad. Se mantiene con 2 puntos de concentración como acción gratuita.',
        notaLibro: 'El nombre se imprime así, con «Enhaciendo», tanto en el texto como en el diagrama (L.199-200 / PDF 205-206, verificado en imagen del diagrama); parece una errata de «Enfocando» o «Haciendo». Se conserva tal como se imprime.',
      }, // L.199 / PDF 205
    ],
  },
  // ── Alomancia de hierro · L.201-203 / PDF 207-209 ──
  {
    id: 'alomancia:hierro', arte: 'alomancia', metal: 'hierro', name: 'Alomancia de hierro', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('hierro'), requiereMeta: true, costoBase: 'action1',
    descripcion: 'Ves líneas azules entre tu centro de gravedad y los metales cercanos y tiras de ellas: vas hacia el objeto o lo traes hacia ti, según cuál sea mayor. Por sus tirones bruscos y sus proyectiles, a sus alomantes se les llama atraedores; suelen llevar escudos de madera para parar lo que desvían hacia sí.',
    acciones: [
      {
        nombre: 'Quemar hierro', activacion: 'action1', duracion: '1 ronda',
        coste: 'Ninguno (basta con tener 1 punto de Investidura)',
        mantener: 'Si aún te queda 1 punto de Investidura, otra ronda como acción gratuita.',
        descripcion: 'Hasta el final de tu siguiente turno sientes todo el metal de tu alcance de artes metálicas y su tamaño.',
        efectos: [
          'El aluminio no se detecta.',
          'Salvo con 6 o más grados en Alomancia, no notas los objetos Investidos (mentes de metal, clavos) ni los incrustados en un cuerpo, como los pendientes.',
        ],
      }, // L.201 / PDF 207
      {
        nombre: 'Tirón de hierro', activacion: 'action1', duracion: 'Instantánea',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas, mientras quemas hierro',
        descripcion: 'Tiras de un metal que sientes y eliges uno de los dos usos.',
        efectos: [
          'Si el objeto está fijado a otro, o alguien lo lleva o sostiene, cuenta el tamaño del conjunto.',
          'Normalmente no hay prueba; ante una maniobra muy compleja o arriesgada, la DJ puede pedir Alomancia o una habilidad mundana.',
        ],
        opciones: [
          { nombre: 'Propulsar', descripcion: 'Se mueve el más pequeño (si empatan, tú eliges): hasta 6 m por punto gastado, uno hacia el otro. Si tiras hacia algo enorme (un edificio, el suelo), el objeto no se mueve y tú te impulsas la distancia que falte.' },
          { nombre: 'Choque violento', descripcion: 'Con un objeto mayor que tú, te lanzas hacia él hasta 6 m por punto gastado y arrollas a quien se cruce: ataque cuerpo a cuerpo de Alomancia contra Defensa física, con 1d4 de daño por golpe según tu dado de artes metálicas (con 2 grados, 1d6; etc.). La DJ puede gastar una Complicación para que tú también te rasguñes.' },
        ],
      }, // L.201 / PDF 207
    ],
    usosCreativos: [
      { nombre: 'Desarmar', texto: 'Tiras de un objeto metálico que alguien lleva o sostiene: Alomancia enfrentada al Atletismo de la víctima; si ganas, la desarmas y el objeto llega a tu espacio.' }, // L.201 / PDF 207
      { nombre: 'Adherirse a paredes', texto: 'En una pared o techo de metal, o con metal fijado, un Tirón hacia esa superficie la convierte en suelo firme hasta tu siguiente turno; moverte por ella puede exigir Agilidad o Atletismo.' }, // L.202 / PDF 208
    ],
    talentos: [
      { name: 'Prevenirse con palanca', cost: 'passive', prereq: 'poder Alomancia de hierro', description: 'Cuando te apoyas con Prevenirse en algo mayor que tú, ese objeto pone el tamaño para tus Tirones de hierro y Empujones de acero; con objetos de tu tamaño o menores, tienes ventaja en esas pruebas de Alomancia.' }, // L.203 / PDF 209
      { name: 'Tirón de proyectil', cost: 'reaction', prereq: 'poder Alomancia de hierro', description: 'Si un aliado de tu alcance va a ser blanco de un proyectil metálico que sientes, gastas 1 punto de Investidura y el ataque pasa a dirigirse contra ti; hay que declararlo antes de ver la tirada.' }, // L.203 / PDF 209
      { name: 'Disparo con Tirón de hierro', cost: 'special', prereq: 'Alomancia 2 o más; talento Prevenirse con palanca', description: 'Cuando tiras de un objeto hacia ti con alguien en su trayectoria, puedes atacarlo a distancia con Alomancia contra su Defensa física, con 1d4 de daño por golpe (dado de artes metálicas). Es un ataque con arma de proyectil metálico, sin desventaja por enemigo a 1,5 m o menos y, si te beneficiabas de Prevenirse, no pierdes sus ventajas. La DJ puede gastar una Complicación para que te rasguñes, salvo que estés Previniéndote.' }, // L.202 / PDF 208
      { name: 'Acometida con Tirón', cost: 'special', prereq: 'Atletismo 2 o más o Armamento pesado 2 o más; talento Prevenirse con palanca', description: 'El Choque violento puede hacerse como ataque con arma cuerpo a cuerpo o sin armas, en vez de con la prueba de Alomancia, y sus dados de daño se suman al daño del arma.' }, // L.202 / PDF 208
      { name: 'Desarmar tirando', cost: 'passive', prereq: 'Alomancia 2 o más; talento Tirón de proyectil', description: 'Tirón de proyectil sirve también contra ataques dirigidos a ti y contra armas metálicas cuerpo a cuerpo: Alomancia enfrentada a la tirada del atacante; si ganas, el ataque va contra ti y, resuelto, le quitas el arma y la traes a tu espacio. Si pierdes, se resuelve contra el objetivo original.' }, // L.202 / PDF 208
      { name: 'Equipo de atraedor', cost: 'passive', prereq: 'pericia en un arma Defensiva o en una armadura con un desvío de 3 o más; talento Tirón de proyectil', description: 'Quemando hierro con un arma Defensiva en la mano o una armadura de desvío 3 o más, tu desvío sube tus grados en Alomancia contra las armas metálicas que sientas, y su rasgo Perforante no cuenta.' }, // L.203 / PDF 209
      { name: 'Experto en Tirones de hierro', cost: 'passive', prereq: 'Alomancia 3 o más; talento Desarmar tirando', description: 'Puedes repetir Tirón de hierro en un turno, a 1 punto de concentración por cada uso tras el primero. Además, al empezar el combate y cada uno de tus turnos tienes una reacción extra, solo para Tirón de proyectil.' }, // L.203 / PDF 209
    ],
  },
  // ── Alomancia de latón · L.204-206 / PDF 210-212 ──
  {
    id: 'alomancia:laton', arte: 'alomancia', metal: 'laton', name: 'Alomancia de latón', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('laton'), requiereMeta: true, costoBase: 'action2',
    descripcion: 'Apagas sutilmente las emociones ajenas y la gente actúa en contra de ellas, convencida de que fue idea suya. Sus alomantes son los aplacadores: calman un tumulto o la vigilancia de un guardia. Los expertos tocan varias emociones a la vez; como en el cinc, no sientes las de los demás y debes leerlas por medios mundanos.',
    acciones: [
      {
        nombre: 'Quemar latón', activacion: 'action2', duracion: '1 ronda',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas; más Investidura, más difícil resistirse',
        mantener: '1 o más puntos de Investidura como acción gratuita sobre los afectados de tu alcance; así puedes ajustar la potencia.',
        descripcion: 'Eliges una emoción (desconfianza, impulsividad…) y una zona Grande (3 m) dentro de tu alcance de artes metálicas. La apagas en todos los de la zona menos en ti hasta que acabe tu próximo turno, y la DJ decide cómo se comportan los PNJs. Si no quieres que lo noten, haces Alomancia contra la Defensa espiritual de cada afectado: si fallas, saben que alguien los aplaca y la DJ puede decidir que descubran que eres tú.',
        efectos: [
          'Quien sabe que lo aplacan puede resistirse como acción gratuita gastando tanta concentración como Investidura usaste (en vez del coste habitual de resistir influencia) y no sufre la alteración hasta el inicio de su próximo turno.',
          'Complicaciones: si la DJ gasta una Complicación tuya o de un aliado mientras quemas latón, alguien puede notar el aplacamiento o descubrir que eres el aplacador.',
          'Manipulaciones solapadas: efectos parecidos sobre una misma persona se combinan (basta resistir el más fuerte) y los opuestos se anulan.',
          'Control de PNJs: con 6 o más puntos de Investidura, si aplacas con éxito a un PNJ kandra, koloss u otro ser hemalúrgico con 0 de concentración, puedes cambiar los efectos habituales por convertirlo en tu compañero, hasta que le hagas daño o otro lo convierta en el suyo.',
          'Estados emocionales alterados (L.206 / PDF 212): la DJ puede pedir Perspicacia para averiguar qué emociones provocan una reacción concreta; cuando manipulan las de tu personaje decides cómo reacciona, pero antes de contradecir de frente la emoción alterada debes gastar concentración para resistir. Es una manipulación que puede dar pie a escenas delicadas: ver la «Guía de seguridad» (cap. 13).',
        ],
      }, // L.204 / PDF 210
    ],
    usosCreativos: [
      { nombre: 'Múltiples emociones', texto: 'Afectas a varias a la vez, con posible desventaja de la DJ en tu prueba de Alomancia; si aplacas tantas que las demás parecen encenderse, hasta imitas al cinc.' }, // L.204 / PDF 210
      { nombre: 'Emociones dirigidas', texto: 'En vez de una emoción general, acotas su objeto (por ejemplo, menos simpatía hacia una persona o un grupo concreto).' }, // L.204 / PDF 210
      { nombre: 'Manipulación evidente', texto: 'Dejas que los aplacados noten tu influencia para despertar sus sospechas y que gasten concentración en resistirla.' }, // L.205 / PDF 211
      { nombre: 'Agresión redirigida', texto: 'Desvías la atención de tus enemigos hacia un aliado, o la apartas de él; tu prueba de Alomancia sube la apuesta.' }, // L.205 / PDF 211
    ],
    talentos: [
      { name: 'Control de masas', cost: 'passive', prereq: 'Alomancia 2 o más; poder Alomancia de latón', description: 'Quemando latón o cinc, el área puede ampliarse hasta una zona Colosal (9 m).' }, // L.205 / PDF 211
      { name: 'Apatía aplastante', cost: 'free', prereq: 'poder Alomancia de latón', description: 'Gastas 2 puntos de Investidura sobre alguien al que aplacas y que tiene 0 de concentración: queda Aturdido mientras dure tu aplacamiento.' }, // L.205 / PDF 211
      { name: 'Influencia precisa', cost: 'passive', prereq: 'Alomancia 3 o más; talento Control de masas', description: 'Quemar latón o cinc te cuesta una acción menos y, al influir en una zona, puedes eximir de ella a los objetivos que conozcas.' }, // L.205 / PDF 211
      { name: 'Aplacar la fatiga', cost: 'special', prereq: 'Perspicacia 2 o más; talento Apatía aplastante', description: 'Una vez por escena, al quemar latón, cambias el efecto habitual por aliviar: los personajes de la zona menos tú recuperan al instante tanta salud como Investidura gastaste y, mientras dure, los Agotados reducen su penalización en esa misma cantidad.' }, // L.205 / PDF 211
      { name: 'Manipulación sutil', cost: 'action1', prereq: 'Perspicacia 3 o más; talento Influencia precisa', description: 'Gastas 1 punto de Investidura: hasta el final de tu próximo turno tienes ventaja al influir en personajes de tu alcance (también en la prueba de Alomancia para pasar inadvertido) y los Secuaces y Rivales que te resisten pierden 2 puntos de concentración más. Se mantiene con 1 punto como acción gratuita.' }, // L.206 / PDF 212
      { name: 'Calma profunda', cost: 'special', prereq: 'Perspicacia 3 o más; talento Aplacar la fatiga', description: 'Al Aplacar la fatiga, terminas además tantos efectos de cada objetivo como Investidura invertiste, a elegir entre Desorientado, Aturdido, Sorprendido y cualquier efecto que suba sus costes de concentración.' }, // L.205 / PDF 211
    ],
  },
  // ── Alomancia de nicrosil · L.207-208 / PDF 213-214 ──
  {
    id: 'alomancia:nicrosil', arte: 'alomancia', metal: 'nicrosil', name: 'Alomancia de nicrosil', atributo: 'Voluntad',
    caminos: [...BRUMOSO_NACIDOBLE], eras: erasDe('nicrosil'), requiereMeta: true, costoBase: 'reaction',
    descripcion: 'Con un toque obligas a un nacido del metal (o a otro personaje Investido) que usa una capacidad a consumir de golpe toda su reserva en un estallido. Sus alomantes son los nicroestallantes. Estallar es difícil de controlar, sobre todo con un objetivo desprevenido, pero así este supera los límites normales de su poder.',
    acciones: [
      {
        nombre: 'Quemar nicrosil', activacion: 'reaction', duracion: 'Instantánea',
        coste: '1 punto de Investidura (no se gasta si fallas contra un reticente)',
        descripcion: 'Cuando otro personaje de tu cercanía va a usar o mantener una capacidad Investida de la que eres consciente (el Quemar de la alomancia, el Decantar de la feruquimia), la haces estallar. Contra un reticente, antes tienes que ganarle con Alomancia contra su Defensa física; si no lo logras, no hay estallido y no gastas Investidura.',
        efectos: [
          'Debe gastar todos los recursos Investidos de esa capacidad (toda su Investidura restante si es alomancia; todas las cargas de la mente que use si es feruquimia), sin límite de artes metálicas ni costes habituales, aunque la capacidad no gastara recursos.',
          'Si la capacidad deja elegir tamaño, alcance o número de objetivos, ha de tomar el máximo de cada uno.',
          'Tira un dado de trama como al subir la apuesta: con una Complicación, tú (si es un enemigo) o la DJ (si no) pueden hacer que pierda el control por completo (daños al entorno, a aliados o a sí mismo, pérdida de concentración, lesiones…). Puede gastar una Oportunidad como siempre.',
          'Vale también para capacidades que no cuestan Investidura o no escalan con el gasto: se aplica lo anterior y las demás consecuencias se resuelven con la DJ. Para capacidades que no progresan con la Investidura, ver el criterio de duraluminio.',
        ],
      }, // L.207 / PDF 213
    ],
    usosCreativos: [],
    talentos: [
      { name: 'Nicroestallido proactivo', cost: 'action1', prereq: 'poder Alomancia de nicrosil', description: 'Eliges a alguien de tu cercanía y gastas Investidura (1 punto o más, hasta tu límite): estallan tantas capacidades activas suyas como puntos gastaste. Si es reticente, antes superas Alomancia contra su Defensa física. Cada una estalla como si hubieras quemado nicrosil al activarse; si varias gastan el mismo recurso, este se reparte a partes iguales.' }, // L.208 / PDF 214
      { name: 'Estallido asistido', cost: 'passive', prereq: 'Alomancia 4 o más; poder Alomancia de nicrosil', description: 'Si haces estallar la capacidad de un aliado con Quemar nicrosil, este puede prescindir del dado de trama (o tirarlo si prefiere), no tiene que tomar los máximos y controla mejor los efectos extraordinarios, que resuelve con la DJ.' }, // L.208 / PDF 214
      {
        name: 'Agarre estallante', cost: 'special', prereq: 'Atletismo 2 o más o Hurto 2 o más; talento Nicroestallido proactivo', description: 'Tras superar una prueba de habilidad física (un ataque con arma, o Hurto para sustraer viales) contra alguien de tu cercanía, gastas una Oportunidad o 2 puntos de concentración y le aplicas Nicroestallido proactivo, sin acción; tu prueba de Alomancia contra su Defensa física triunfa sin tirar.',
        notaLibro: 'En el diagrama de nicrosil la tarjeta de este talento no lleva icono de activación (L.207 / PDF 213, verificado en imagen); el texto del talento indica ★, activación especial (L.208 / PDF 214), que es la que se usa.',
      }, // L.208 / PDF 214
      { name: 'Estallido inesperado', cost: 'special', prereq: 'Sigilo 3 o más; talento Agarre estallante', description: 'La primera vez en cada escena que haces estallar una capacidad enemiga, su dado de trama se tira con desventaja; si gastas su Complicación para que pierda el control, influyes más en cómo se resuelve.' }, // L.208 / PDF 214
    ],
  },
  // ── Alomancia de oro · L.209-210 / PDF 215-216 ──
  {
    id: 'alomancia:oro', arte: 'alomancia', metal: 'oro', name: 'Alomancia de oro', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('oro'), requiereMeta: true, costoBase: 'action1',
    descripcion: 'Percibes proyecciones oscuras de tu propia esencia, «sombras de oro»: versiones de ti que habrían surgido de otras decisiones pasadas. Sus alomantes son los augures; sus sombras cambian cada vez que queman. Ven a la vez con sus ojos y con los de sus sombras, lo que suele marear. En la Era 1 se sabía que los nacidos de la bruma quemaban oro, pero el Ministerio de Acero ocultó a los brumosos de oro casi hasta el final de la era.',
    acciones: [
      {
        nombre: 'Quemar oro', activacion: 'action1', duracion: '1 escena',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas',
        mantener: 'La misma Investidura, como acción gratuita, por la misma duración.',
        descripcion: 'Creas tantas sombras de oro como Investidura gastaste: incorpóreas, invisibles para los demás y a 1,5 m o menos de ti hasta que acabe la escena. Cada una es una versión distinta de ti. La primera vez que tocas una (o interactúas físicamente con ella) ves con sus ojos, conoces sus pensamientos y tiras un dado de trama.',
        efectos: [
          'Tú y la DJ decidís si lo visto aporta información útil para la historia o la situación actual.',
        ],
        opciones: [
          { nombre: 'Oportunidad', descripcion: 'La sombra te revela algo sobre ti o tu situación: recuperas 1 punto de concentración y quedas Concentrado hasta que empiece tu siguiente turno.' },
          { nombre: 'Complicación', descripcion: 'El mareo te desborda: Desorientado hasta que empiece tu siguiente turno.' },
          { nombre: 'Cara en blanco', descripcion: 'No pasa nada.' },
        ],
      }, // L.209 / PDF 215
    ],
    usosCreativos: [
      { nombre: 'Examinar el yo pasado', texto: 'Con un rato de calma, quemas oro y tiras Alomancia CD 15 para localizar a tu yo en un momento concreto del pasado; si sale bien, al interactuar con esa sombra revives sus pensamientos, emociones y sentidos de entonces, con detalles o contexto nuevos. La DJ puede pedir otra prueba (Deducción, Perspicacia o Percepción) para interpretarlos.' }, // L.209 / PDF 215
      { nombre: 'Buscar variantes específicas', texto: 'Al crear sombras puedes buscar versiones concretas (otra decisión en un momento clave, otro oficio), plausibles según tu historia; según lo distintas que sean, la DJ puede pedir Alomancia. Con una Oportunidad al interactuar con una de ellas, la DJ puede dejarte gastarla para saber algo más de tu situación actual desde la perspectiva y las pericias de esa sombra.' }, // L.209 / PDF 215
    ],
    talentos: [
      { name: 'Aleación de uno mismo', cost: 'special', prereq: 'Alomancia 3 o más; poder Alomancia de oro', description: 'Puedes renunciar a los beneficios de un descanso largo para meditar con una sombra de oro sobre tu situación. Gastas 1 punto de Investidura y tiras un dado de trama: con Oportunidad, explicas cómo te ayuda en una de tus metas y, si la DJ lo admite, avanzas un hito (una vez por meta); con Complicación, quedas Agotado [−1]; con cara en blanco, nada.' }, // L.210 / PDF 216
      { name: 'Oportunidades doradas', cost: 'passive', prereq: 'Alomancia 4 o más; poder Alomancia de oro', description: 'La cara en blanco del dado de trama al Quemar oro o usar sus talentos cuenta como Oportunidad. Y el estado Concentrado que ganas al quemar oro dura tantas rondas como tu rango, no solo hasta el inicio de tu siguiente turno.' }, // L.210 / PDF 216
    ],
  },
  // ── Alomancia de peltre · L.211-212 / PDF 217-218 ──
  {
    id: 'alomancia:peltre', arte: 'alomancia', metal: 'peltre', name: 'Alomancia de peltre', atributo: 'Voluntad',
    caminos: [...TRES_CAMINOS], eras: erasDe('peltre'), requiereMeta: true, costoBase: 'action1',
    descripcion: 'Potencia mucho tu cuerpo: más fuerza y más aguante. Es habitual combatir aprovechándolo (forcejeo, sin armas, armas improvisadas), de ahí los brazos de peltre o violentos. Mientras lo quemas no sientes el agotamiento (el arrastre de peltre), pero al dejarlo te cae todo encima de golpe.',
    acciones: [
      {
        nombre: 'Quemar peltre', activacion: 'action1', duracion: '1 ronda',
        coste: 'De 1 punto de Investidura a tu límite de artes metálicas',
        mantener: '1 o más puntos de Investidura como acción gratuita, por la misma duración.',
        descripcion: 'Hasta el final de tu próximo turno obtienes dos beneficios.',
        efectos: [
          'Mejorado [Velocidad] y Mejorado [Fuerza]: cada atributo recibe una bonificación igual a la mitad de la Investidura gastada (hacia arriba).',
          'Si estás Agotado, no sufres su penalización en tus pruebas hasta que acabe el efecto.',
        ],
      }, // L.211 / PDF 217
    ],
    usosCreativos: [
      { nombre: 'Viaje acelerado', texto: 'Recorres largas distancias a ritmo de arrastre de peltre, o aceleras un carro tirando de él; quedas Agotado [−1] cuando decida la DJ.' }, // L.211 / PDF 217
      { nombre: 'Filtrado metabólico', texto: 'Mientras quemas, el cuerpo elimina mucho antes el alcohol, las drogas y los venenos.' }, // L.211 / PDF 217
    ],
    talentos: [
      {
        name: 'Revitalizar', cost: 'free', prereq: 'Alomancia 2 o más; poder Alomancia de peltre', description: 'Gastas 1 punto de Investidura y recuperas 1d6 + tu rango actual de salud (rango 2: 1d6 + 2). Sirve incluso Inconsciente o si algo te impide actuar.',
        notaLibro: 'La línea «Activación» de la entrada imprime ∞ (siempre activo), pero el diagrama marca ▷ (acción gratuita) y la regla dice «acción gratuita» y gasta 1 punto de Investidura por uso (L.212 / PDF 218, verificado en imagen). Se guarda como acción gratuita (`free`).',
      }, // L.212 / PDF 218
      { name: 'Armamento de brazo de peltre', cost: 'special', prereq: 'Armamento pesado 1 o más o Armamento ligero 1 o más; poder Alomancia de peltre', description: 'En un ataque cuerpo a cuerpo con arma, quemando peltre o decantando fuerza de una mentepeltre, tu dado de daño sin armas puede sustituir al del arma (decídelo antes de tirar; el arma conserva sus rasgos y su tipo de daño).' }, // L.212 / PDF 218
      { name: 'Aguantar el arrastre', cost: 'special', prereq: 'Alomancia 3 o más; talento Revitalizar', description: 'Si tu salud llega a 0 quemando peltre, puedes ignorar el estado Inconsciente (las lesiones siguen). Al terminar el efecto caes Inconsciente si sigues en 0. Mientras sigues a 0 así, cada daño que sufres te deja Agotado [−1].' }, // L.211 / PDF 217
      { name: 'Pugilista ágil', cost: 'passive', prereq: 'Agilidad 1 o más; talento Armamento de brazo de peltre', description: 'Quemando peltre usas Velocidad en lugar de Fuerza en los ataques sin armas y en Agarrar y Empujar (vale también para las pruebas de Atletismo que esas acciones requieran y para el daño sin armas).' }, // L.212 / PDF 218
      { name: 'Acometidas de arrastre', cost: 'action1', prereq: 'Alomancia 3 o más; talento Armamento de brazo de peltre', description: 'Quemando peltre, puedes quedar Agotado [−1] para hacer una Acometida extra con una mano que ya usó una este turno.' }, // L.211 / PDF 217
      { name: 'Lanzador de peltre', cost: 'passive', prereq: 'talento Armamento de brazo de peltre', description: 'Quemando peltre o decantando fuerza de una mentepeltre, para ti las armas tienen el rasgo Arrojadiza [30/90], y puedes aplicar Armamento de brazo de peltre a tus ataques a distancia con armas arrojadizas como si fueran cuerpo a cuerpo.' }, // L.212 / PDF 218
    ],
  },
]
