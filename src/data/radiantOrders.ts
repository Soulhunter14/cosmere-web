import type { Talento } from './potencias'

export interface RadiantOrder {
  id: string
  name: string
  surges: [string, string]
  ideal: string        // order-specific motto (Segundo Ideal condensado)
  definition: string
  sprenName: string
  sprenForm: string
  sprenAppearance: string
  sprenBehavior: string
  sprenPhilosophy: string
  personality: string
  ideals: string
  color: string
  colorBg: string
  colorBorder: string
  talentos: Talento[]
}

export interface RadiantRegla {
  id: string
  title: string
  summary: string
  details: { label: string; text: string }[]
}

export const PRIMER_IDEAL =
  'Vida antes que muerte. Fuerza antes que debilidad. Viaje antes que destino.'

export const RADIANT_REGLAS: RadiantRegla[] = [
  {
    id: 'investidura',
    title: 'Investidura',
    summary: 'La energía mágica que alimenta los poderes Radiantes.',
    details: [
      {
        label: 'Valor máximo',
        text: 'Al elegir el talento Primer Ideal, obtienes un valor máximo de Investidura igual a 2 + tu Discernimiento o Presencia (el mayor). El talento Investido aumenta este máximo en tu rango.',
      },
      {
        label: 'Gastar Investidura',
        text: 'Gastas Investidura para activar potencias, talentos de potencia, talentos de vínculo spren y las acciones de luz tormentosa.',
      },
      {
        label: 'Estado no Investido',
        text: 'Si tu Investidura actual baja a 0, pasas a estar no Investido y no puedes mantener efectos activos como infusiones más allá de sus duraciones restantes.',
      },
      {
        label: 'Recuperar luz tormentosa',
        text: 'En condiciones normales, se asume que tienes esferas suficientes si llevas al menos tres veces más marcos que tu total de Investidura. En situaciones especiales, la DJ puede pedir llevar registro: recuperas 1 Investidura por marco o broam infuso drenado.',
      },
    ],
  },
  {
    id: 'acciones-luz',
    title: 'Acciones de luz tormentosa',
    summary: 'Al elegir el talento Primer Ideal, obtienes acceso a estas tres acciones.',
    details: [
      {
        label: 'Absorber luz tormentosa (2 acciones)',
        text: 'Atraes luz tormentosa desde esferas infusas situadas a 1,5 metros o menos. Si tienes esferas suficientes, recuperas Investidura hasta tu máximo. Puedes realizar esta acción incluso si estás Inconsciente o no puedes realizar otras acciones.',
      },
      {
        label: 'Aumentar (1 acción)',
        text: 'Gasta 1 Investidura para quedar Mejorado [Fuerza +1] y Mejorado [Velocidad +1] hasta el final de tu siguiente turno. Al final de ese turno, y en turnos sucesivos, puedes gastar 1 Investidura como acción gratuita para mantener estos estados.',
      },
      {
        label: 'Revitalizar (acción gratuita)',
        text: 'Gasta 1 Investidura para recuperar salud equivalente a 1d6 + tu rango actual.',
      },
    ],
  },
  {
    id: 'spren',
    title: 'Vínculo con el spren',
    summary: 'El vínculo Nahel une al Radiante con su spren y define su acceso a las potencias.',
    details: [
      {
        label: 'Proximidad',
        text: 'Tu spren puede alejarse hasta 9 metros de ti. Con el talento Vínculo estrechado, esta distancia aumenta a 30 metros y asignarle una tarea cuesta 1 punto de concentración menos.',
      },
      {
        label: 'Comunicación',
        text: 'Tu spren percibe el mundo físico y puede hablar contigo. Puede ayudarte en pruebas relacionadas con sus áreas de conocimiento.',
      },
      {
        label: 'Ruptura del vínculo',
        text: 'Traicionar un ideal debilita el vínculo. Si el vínculo se rompe completamente, pierdes el acceso a tus potencias e Investidura hasta restaurarlo.',
      },
      {
        label: 'Manifestación esquirlada',
        text: 'Al pronunciar el Tercer Ideal puedes manifestar a tu spren como una hoja esquirlada Radiante. Al pronunciar el Cuarto Ideal, también como armadura esquirlada Radiante.',
      },
    ],
  },
  {
    id: 'ideales',
    title: 'Progresión de ideales',
    summary: 'Los ideales definen el crecimiento de un Caballero Radiante.',
    details: [
      {
        label: 'Primer Ideal (universal)',
        text: '"Vida antes que muerte. Fuerza antes que debilidad. Viaje antes que destino." Pronunciarlo inicia el vínculo Nahel: obtienes Investidura y las dos potencias de tu orden.',
      },
      {
        label: 'Segundo Ideal',
        text: 'Específico de cada orden. Al pronunciarlo quedas Empoderado y puedes usar Aumentar como acción gratuita sin gastar Investidura.',
      },
      {
        label: 'Tercer Ideal',
        text: 'Más personal que el segundo. Al pronunciarlo quedas Empoderado y puedes manifestar tu spren como hoja esquirlada Radiante.',
      },
      {
        label: 'Cuarto Ideal',
        text: 'Único para cada individuo. Al pronunciarlo quedas Empoderado y puedes manifestar armadura esquirlada Radiante.',
      },
      {
        label: 'Metas de ideal',
        text: 'Cada ideal genera una meta en tu hoja de personaje. Pronunciar un ideal no es solo decir las palabras: debes comprenderlo y vivirlo de verdad.',
      },
    ],
  },
  {
    id: 'escuderos',
    title: 'Escuderos',
    summary: 'Los Radiantes del Tercer Ideal pueden adoptar escuderos y otorgarles sus potencias.',
    details: [
      {
        label: 'Requisitos',
        text: 'Para adoptar un escudero: debe estar dispuesto, ser consciente, debes haberlo conocido al menos una sesión y no debe haberse vinculado con un spren Radiante.',
      },
      {
        label: 'Beneficios del escudero',
        text: 'El escudero obtiene las potencias que elijas (una, ambas o ninguna) más acceso a Absorber luz tormentosa, Aumentar y Revitalizar.',
      },
      {
        label: 'Límite',
        text: 'El límite de escuderos varía por orden (normalmente = tu Ideal actual o tu nivel). Si ya tienes el máximo, debes descartar uno antes de adoptar otro.',
      },
    ],
  },
]

const TALENTOS_COMUNES = {
  primerIdeal: (surges: string): Talento => ({
    name: 'Primer Ideal',
    cost: 'special',
    description: `Pronuncias el primer ideal universal y estableces el vínculo Nahel. Obtienes Investidura y acceso a las acciones Absorber luz tormentosa, Aumentar y Revitalizar. Al completar la meta "Pronunciar el Primer Ideal", obtienes las potencias de ${surges}.`,
  }),
  segundoIdeal: (desc: string): Talento => ({
    name: 'Segundo Ideal',
    cost: 'special',
    prereq: 'Primer Ideal; nivel 4 o más',
    description: `${desc} Al pronunciarlo quedas Empoderado y puedes usar Aumentar como acción gratuita sin gastar Investidura.`,
  }),
  tercerIdeal: (desc: string): Talento => ({
    name: 'Tercer Ideal',
    cost: 'special',
    prereq: 'Segundo Ideal; nivel 8 o más',
    description: `${desc} Al pronunciarlo quedas Empoderado y puedes manifestar tu spren como una hoja esquirlada Radiante.`,
  }),
  cuartoIdeal: (desc: string): Talento => ({
    name: 'Cuarto Ideal',
    cost: 'special',
    prereq: 'Tercer Ideal; nivel 13 o más',
    description: `${desc} Al pronunciarlo quedas Empoderado y puedes manifestar armadura esquirlada Radiante.`,
  }),
  investido: (prereq?: string): Talento => ({
    name: 'Investido',
    cost: 'passive',
    prereq,
    description: 'Tu Investidura máxima aumenta en el valor de tu rango. Cuando tu rango sube en 1, tu Investidura máxima también lo hace.',
  }),
  vinculoEstrechado: (): Talento => ({
    name: 'Vínculo estrechado',
    cost: 'passive',
    prereq: 'Tercer Ideal',
    description: 'El alcance de tu vínculo spren aumenta a 30 metros. Además, asignar una tarea a tu spren te cuesta 1 punto de concentración menos.',
  }),
  adoptarEscudero: (limite: string): Talento => ({
    name: 'Adoptar escudero',
    cost: 'special',
    prereq: 'Tercer Ideal',
    description: `Puedes designar un compañero como escudero, otorgándole una o ambas de tus potencias. También puede Absorber luz tormentosa, Aumentar y Revitalizar. Puedes tener ${limite}.`,
  }),
  regeneracionHeridas: (prereq?: string): Talento => ({
    name: 'Regeneración de heridas',
    cost: 'special',
    prereq,
    description: 'Cuando usas Revitalizar, puedes gastar 2 puntos de Investidura para recuperarte de una lesión temporal, o 3 puntos para recuperarte de una permanente.',
  }),
}

export const RADIANT_ORDERS: RadiantOrder[] = [
  {
    id: 'windrunners',
    name: 'Corredores de Viento',
    surges: ['Adhesión', 'Gravitación'],
    ideal: 'Protegeré.',
    definition: 'Los Corredores de Viento son guerreros del cielo que dominan el vuelo y la protección. Sienten un profundo impulso de proteger a los inocentes y a quienes no pueden defenderse, aunque ello implique sacrificio personal.',
    sprenName: 'honorspren',
    sprenForm: 'Figura humana etérea con destellos de luz azul-blanca',
    sprenAppearance: 'Parecen estar hechos de luz y viento, con un rastro luminoso al moverse',
    sprenBehavior: 'Serios y honorables, miden cuidadosamente a quien consideran digno de vincularse',
    sprenPhilosophy: 'El honor no es lo que hacemos cuando alguien nos observa, sino lo que hacemos cuando nadie lo hace.',
    personality: 'Protectores natos, leales hasta la médula. Sienten la carga de cuidar a los demás como un deber sagrado.',
    ideals: 'Protejo a los que no pueden protegerse. Protejo incluso a los que odio, siempre que sea lo correcto.',
    color: '#60a5fa',
    colorBg: 'rgba(96,165,250,0.1)',
    colorBorder: 'rgba(96,165,250,0.3)',
    talentos: [
      TALENTOS_COMUNES.primerIdeal('Adhesión y Gravitación'),
      TALENTOS_COMUNES.segundoIdeal('Tratas de estrechar tu vínculo Nahel con tu honorspren.'),
      TALENTOS_COMUNES.tercerIdeal('Continúas progresando en tu vínculo con tu honorspren.'),
      TALENTOS_COMUNES.cuartoIdeal('Buscas convertirte en un Caballero Radiante completo.'),
      {
        name: 'Enlace inverso',
        cost: 'special',
        prereq: 'Primer Ideal',
        description: 'Infunde a un objetivo con un Enlace inverso usando Adhesión. Elige un tipo de objeto; el objetivo infuso atrae ese tipo de objetos desde una distancia igual a tu valor de gravitación.',
      },
      TALENTOS_COMUNES.investido(),
      TALENTOS_COMUNES.vinculoEstrechado(),
      TALENTOS_COMUNES.adoptarEscudero('tantos escuderos como el doble de tu nivel actual'),
      TALENTOS_COMUNES.regeneracionHeridas(),
    ],
  },
  {
    id: 'skybreakers',
    name: 'Rompedores del Cielo',
    surges: ['Gravitación', 'División'],
    ideal: 'Buscaré justicia.',
    definition: 'Los Rompedores del Cielo son ejecutores de la justicia y la ley. Creen que el caos solo puede combatirse mediante la adhesión estricta a un código externo, abandonando el juicio personal en favor de la ley objetiva.',
    sprenName: 'altospren',
    sprenForm: 'Agujeros en el aire que revelan un cielo oscuro y estrellado',
    sprenAppearance: 'Aparecen como fisuras en la realidad que muestran la oscuridad del espacio entre sus bordes',
    sprenBehavior: 'Distantes y filosóficos, gustan de debatir sobre ética y justicia antes de actuar',
    sprenPhilosophy: 'La ley no es perfecta, pero un mundo sin ley es peor que cualquier ley imperfecta.',
    personality: 'Disciplinados, inflexibles, con un sentido de la justicia que puede parecer frío pero que nace de una convicción profunda.',
    ideals: 'Elevo la ley por encima de mi propio juicio. Busco la verdad incluso cuando esta me condena.',
    color: '#f59e0b',
    colorBg: 'rgba(245,158,11,0.1)',
    colorBorder: 'rgba(245,158,11,0.3)',
    talentos: [
      TALENTOS_COMUNES.primerIdeal('División y Gravitación'),
      TALENTOS_COMUNES.segundoIdeal('Tratas de estrechar tu vínculo Nahel con tu altospren.'),
      TALENTOS_COMUNES.tercerIdeal('Continúas progresando en tu vínculo con tu altospren.'),
      TALENTOS_COMUNES.cuartoIdeal('Buscas convertirte en un Caballero Radiante completo (puedes invocar un enjambre de suertespren como armadura esquirlada).'),
      {
        name: 'Destrucción desorbitada',
        cost: 'free',
        prereq: 'Primer Ideal',
        description: 'Eres experto en el uso de la División mientras te desplazas por el aire. Después de usar Moverse mientras mantienes un Enlace básico sobre ti mismo con Gravitación, gasta 1 punto de concentración para obtener 1 acción que solo puedes usar para División o uno de sus talentos.',
      },
      TALENTOS_COMUNES.investido('Destrucción desorbitada'),
      TALENTOS_COMUNES.vinculoEstrechado(),
      TALENTOS_COMUNES.adoptarEscudero('tantos escuderos como tu número de Ideal actual'),
      TALENTOS_COMUNES.regeneracionHeridas('Investido'),
    ],
  },
  {
    id: 'dustbringers',
    name: 'Portadores del Polvo',
    surges: ['División', 'Abrasión'],
    ideal: 'Buscaré el autocontrol.',
    definition: 'Los Portadores del Polvo canalizan fuerzas destructivas con precisión quirúrgica. A diferencia de lo que su nombre sugiere, no son agentes del caos: comprenden que la destrucción controlada es necesaria para la renovación y el crecimiento.',
    sprenName: 'cenizaspren',
    sprenForm: 'Grietas ramificadas que parecen quemar las superficies por donde pasan',
    sprenAppearance: 'En el mundo físico aparecen como fisuras incandescentes; en el Shadesmar tienen piel blanca como ceniza que se desmorona para revelar el hueso',
    sprenBehavior: 'Apasionados y directos, valoran la honestidad brutal por encima de la diplomacia',
    sprenPhilosophy: 'Para construir algo duradero, primero debes estar dispuesto a ver arder lo que ya no sirve.',
    personality: 'Intensos, apasionados, con una energía que puede resultar abrumadora. Valoran la autenticidad por encima de todo.',
    ideals: 'Acepto la responsabilidad de mi poder destructivo. Destruyo solo cuando es necesario y con propósito.',
    color: '#f97316',
    colorBg: 'rgba(249,115,22,0.1)',
    colorBorder: 'rgba(249,115,22,0.3)',
    talentos: [
      TALENTOS_COMUNES.primerIdeal('Abrasión y División'),
      TALENTOS_COMUNES.segundoIdeal('Tratas de estrechar tu vínculo Nahel con tu cenizaspren.'),
      TALENTOS_COMUNES.tercerIdeal('Continúas progresando en tu vínculo con tu cenizaspren.'),
      TALENTOS_COMUNES.cuartoIdeal('Buscas convertirte en un Caballero Radiante completo.'),
      {
        name: 'Tormenta de polvo abrasadora',
        cost: 'special',
        prereq: 'Primer Ideal',
        description: 'Gastas Investidura para levantar una oscura nube de polvo a medida que usas Moverse. Los enemigos en el interior de esta nube sufren una cantidad de daño adicional igual a tus grados en Disciplina.',
      },
      TALENTOS_COMUNES.investido(),
      TALENTOS_COMUNES.vinculoEstrechado(),
      TALENTOS_COMUNES.adoptarEscudero('tantos escuderos como tu número de Ideal actual'),
      TALENTOS_COMUNES.regeneracionHeridas(),
    ],
  },
  {
    id: 'edgedancers',
    name: 'Danzantes del Filo',
    surges: ['Abrasión', 'Progresión'],
    ideal: 'Recordaré.',
    definition: 'Los Danzantes del Filo son sanadores y protectores de los más vulnerables de la sociedad. Con una gracia sobrenatural y el don de la curación, se consagran a cuidar a quienes nadie más recuerda ni valora.',
    sprenName: 'cultivacispren',
    sprenForm: 'Enredaderas y cristales que a veces adoptan rasgos humanoides',
    sprenAppearance: 'Se manifiestan como plantas vivas entrelazadas con formaciones cristalinas que crecen y cambian según las emociones del Radiante',
    sprenBehavior: 'Empáticos y observadores, tienen una capacidad especial para percibir el dolor ajeno',
    sprenPhilosophy: 'El mundo no mejora solo con grandes héroes. Mejora cuando alguien se detiene a ayudar al que nadie ve.',
    personality: 'Compasivos, ágiles de mente y cuerpo. Aparentan ligereza pero guardan una profunda seriedad sobre su misión.',
    ideals: 'Recordaré a quienes han sido olvidados. Me inclinaré para ayudar incluso cuando el mundo entero mire hacia otro lado.',
    color: '#34d399',
    colorBg: 'rgba(52,211,153,0.1)',
    colorBorder: 'rgba(52,211,153,0.3)',
    talentos: [
      TALENTOS_COMUNES.primerIdeal('Abrasión y Progresión'),
      TALENTOS_COMUNES.segundoIdeal('Tratas de estrechar tu vínculo Nahel con tu cultivacispren.'),
      TALENTOS_COMUNES.tercerIdeal('Continúas progresando en tu vínculo con tu cultivacispren.'),
      TALENTOS_COMUNES.cuartoIdeal('Buscas convertirte en un Caballero Radiante completo.'),
      {
        name: 'Gracia del Danzante del Filo',
        cost: 'passive',
        prereq: 'Abrasión 2 o más; Progresión 2 o más; Primer Ideal',
        description: 'Mientras tengas Investidura, obtienes una reacción adicional que solo puedes usar para Evitar peligro o Esquivar, sin gastar concentración.',
      },
      TALENTOS_COMUNES.investido(),
      TALENTOS_COMUNES.vinculoEstrechado(),
      TALENTOS_COMUNES.adoptarEscudero('tantos escuderos como tu número de Ideal actual'),
      TALENTOS_COMUNES.regeneracionHeridas(),
    ],
  },
  {
    id: 'truthwatchers',
    name: 'Vigilantes de la Verdad',
    surges: ['Progresión', 'Iluminación'],
    ideal: 'Buscaré la verdad.',
    definition: 'Los Vigilantes de la Verdad son observadores silenciosos del mundo, capaces de percibir verdades ocultas y predecir lo que ha de venir. Son los más enigmáticos de los Radiantes, pues raramente comparten lo que ven.',
    sprenName: 'brumaspren',
    sprenForm: 'Luz reflejada en el mundo físico; en el Shadesmar, figuras de niebla con una máscara de porcelana inmóvil',
    sprenAppearance: 'En el mundo físico apenas son perceptibles, como destellos de luz reflejada; en el Shadesmar su rostro es una máscara de porcelana que nunca cambia de expresión',
    sprenBehavior: 'Silenciosos y misteriosos, comunican más con gestos y miradas que con palabras',
    sprenPhilosophy: 'Ver la verdad no es suficiente. Hay que aprender a vivir con lo que no puedes cambiar.',
    personality: 'Contemplativos, perceptivos, con una capacidad de observación que puede resultar perturbadora para quienes los rodean.',
    ideals: 'Registro lo que veo sin juzgar. La verdad que percibo es un don y una carga que acepto.',
    color: '#a78bfa',
    colorBg: 'rgba(167,139,250,0.1)',
    colorBorder: 'rgba(167,139,250,0.3)',
    talentos: [
      TALENTOS_COMUNES.primerIdeal('Iluminación y Progresión'),
      TALENTOS_COMUNES.segundoIdeal('Tratas de estrechar tu vínculo Nahel con tu brumaspren.'),
      TALENTOS_COMUNES.tercerIdeal('Continúas progresando en tu vínculo con tu brumaspren.'),
      TALENTOS_COMUNES.cuartoIdeal('Buscas convertirte en un Caballero Radiante completo.'),
      {
        name: 'Sanación espiritual',
        cost: 'special',
        prereq: 'Iluminación 2 o más; Progresión 2 o más; Primer Ideal',
        description: 'En lugar de curarte a ti mismo o a un aliado con Revitalizar, gasta 2 puntos de Investidura para que el objetivo recupere la mitad de concentración de los puntos de salud que habría recuperado.',
      },
      TALENTOS_COMUNES.investido(),
      TALENTOS_COMUNES.vinculoEstrechado(),
      TALENTOS_COMUNES.adoptarEscudero('tantos escuderos como tu número de Ideal actual'),
      TALENTOS_COMUNES.regeneracionHeridas(),
    ],
  },
  {
    id: 'lightweavers',
    name: 'Tejedores de Luz',
    surges: ['Iluminación', 'Transformación'],
    ideal: 'Diré mi verdad.',
    definition: 'Los Tejedores de Luz son artistas y maestros del engaño al servicio de una verdad más profunda. Su poder de crear ilusiones perfectas va unido a una búsqueda introspectiva: deben conocerse completamente a sí mismos antes de poder transformar la realidad.',
    sprenName: 'crípticos',
    sprenForm: 'Patrón en relieve complejo que cambia constantemente sobre las superficies',
    sprenAppearance: 'En el mundo físico aparecen como patrones geométricos imposibles que se desplazan por paredes y suelos; en el Shadesmar visten túnicas geométricas con una cabeza que es un patrón fractal en movimiento',
    sprenBehavior: 'Fascinados por las mentiras y la verdad por igual, gustan de acertijos y paradojas',
    sprenPhilosophy: 'Una ilusión perfecta contiene su propia verdad. El arte es mentira que revela la realidad.',
    personality: 'Creativos, independientes, a menudo caprichosos. Tienen dificultad para cumplir compromisos salvo con su arte.',
    ideals: 'Acepto mis mentiras. Acepto mis verdades. Soy el artista y la obra.',
    color: '#f472b6',
    colorBg: 'rgba(244,114,182,0.1)',
    colorBorder: 'rgba(244,114,182,0.3)',
    talentos: [
      TALENTOS_COMUNES.primerIdeal('Iluminación y Transformación'),
      TALENTOS_COMUNES.segundoIdeal('Tratas de estrechar tu vínculo Nahel con tu críptico.'),
      TALENTOS_COMUNES.tercerIdeal('Continúas progresando en tu vínculo con tu críptico.'),
      TALENTOS_COMUNES.cuartoIdeal('Buscas convertirte en un Caballero Radiante completo.'),
      {
        name: 'Ilusión física',
        cost: 'action2',
        prereq: 'Cuarto Ideal',
        description: 'Gastas Investidura para crear una ilusión física con defensas y vida propia. La controlas mediante 1 acción; puede realizar pruebas y atacar usando tu valor de Iluminación.',
      },
      TALENTOS_COMUNES.investido(),
      TALENTOS_COMUNES.vinculoEstrechado(),
      TALENTOS_COMUNES.adoptarEscudero('tantos escuderos como tu número de Ideal actual'),
      TALENTOS_COMUNES.regeneracionHeridas(),
    ],
  },
  {
    id: 'elsecallers',
    name: 'Nominadores de lo Otro',
    surges: ['Transformación', 'Transportación'],
    ideal: 'Alcanzaré todo mi potencial.',
    definition: 'Los Nominadores de lo Otro son los más intelectuales de los Radiantes. Maestros del Shadesmar y de la transformación de la materia, combinan su poderosa magia con una mente analítica y una ambición de superación constante.',
    sprenName: 'tintaspren',
    sprenForm: 'Figuras de color negro azabache con un brillo iridiscente',
    sprenAppearance: 'De un negro intenso con un brillo tornasolado; pueden cambiar de tamaño a voluntad y su forma varía entre el mundo físico y el Shadesmar',
    sprenBehavior: 'Meticulosos e inteligentes, evalúan a los demás con frialdad antes de establecer cualquier vínculo',
    sprenPhilosophy: 'El conocimiento sin aplicación es vanidad. El poder sin responsabilidad es tiranía.',
    personality: 'Ambiciosos, perfeccionistas, con tendencia a ver a los demás como piezas en un tablero mayor.',
    ideals: 'Uso mi poder para elevar a los demás. La grandeza individual no tiene sentido sin quienes me rodean.',
    color: '#38bdf8',
    colorBg: 'rgba(56,189,248,0.1)',
    colorBorder: 'rgba(56,189,248,0.3)',
    talentos: [
      TALENTOS_COMUNES.primerIdeal('Transformación y Transportación'),
      TALENTOS_COMUNES.segundoIdeal('Tratas de estrechar tu vínculo Nahel con tu tintaspren.'),
      TALENTOS_COMUNES.tercerIdeal('Continúas progresando en tu vínculo con tu tintaspren (puedes invocar un enjambre de logispren como hoja esquirlada Radiante).'),
      TALENTOS_COMUNES.cuartoIdeal('Buscas convertirte en un Caballero Radiante completo.'),
      {
        name: 'Sagacidad del Nominador de lo Otro',
        cost: 'passive',
        prereq: 'Transformación 2 o más; Transportación 2 o más; Primer Ideal',
        description: 'Mientras tienes Investidura, obtienes ventaja en las reacciones, en pruebas de Deducción y en pruebas para fisgar entre reinos.',
      },
      TALENTOS_COMUNES.investido('Sagacidad del Nominador de lo Otro'),
      TALENTOS_COMUNES.vinculoEstrechado(),
      TALENTOS_COMUNES.adoptarEscudero('tantos escuderos como tu número de Ideal actual'),
      TALENTOS_COMUNES.regeneracionHeridas(),
    ],
  },
  {
    id: 'willshapers',
    name: 'Escultores de Voluntad',
    surges: ['Cohesión', 'Transportación'],
    ideal: 'Buscaré la libertad.',
    definition: 'Los Escultores de Voluntad son exploradores y liberadores. Sienten una atracción irresistible hacia lo desconocido y un profundo desdén por cualquier forma de esclavitud o restricción injusta. Son tan impredecibles como el viento.',
    sprenName: 'lumispren',
    sprenForm: 'Orbes pulsantes de fuego blanco similares a cometas en el mundo físico',
    sprenAppearance: 'En el mundo físico aparecen como esferas de luz blanca intensa que dejan una estela; en el Shadesmar son humanoides de bronce pulido grabados con patrones únicos',
    sprenBehavior: 'Juguetones y excéntricos, cambian de humor tan rápido como de forma',
    sprenPhilosophy: 'La libertad no es ausencia de vínculos, sino la capacidad de elegir cuáles te atan.',
    personality: 'Independientes, creativos, difíciles de predecir. Odian la rutina y valoran la experiencia sobre la seguridad.',
    ideals: 'Rompo las cadenas que atan injustamente. Exploro sin miedo los límites del mundo.',
    color: '#fb7185',
    colorBg: 'rgba(251,113,133,0.1)',
    colorBorder: 'rgba(251,113,133,0.3)',
    talentos: [
      TALENTOS_COMUNES.primerIdeal('Cohesión y Transportación'),
      TALENTOS_COMUNES.segundoIdeal('Tratas de estrechar tu vínculo Nahel con tu lumispren.'),
      TALENTOS_COMUNES.tercerIdeal('Continúas progresando en tu vínculo con tu lumispren.'),
      TALENTOS_COMUNES.cuartoIdeal('Buscas convertirte en un Caballero Radiante completo.'),
      {
        name: 'Cohesión espiritual',
        cost: 'action2',
        prereq: 'Primer Ideal',
        description: 'Una vez por escena, elige uno o más aliados a los que puedas influir, hasta un número igual a tu Ideal actual. Todos los objetivos obtienen el estado Resuelto hasta el final de la escena.',
      },
      TALENTOS_COMUNES.investido('Cohesión espiritual'),
      TALENTOS_COMUNES.vinculoEstrechado(),
      TALENTOS_COMUNES.adoptarEscudero('tantos escuderos como tu número de Ideal actual'),
      TALENTOS_COMUNES.regeneracionHeridas('Investido'),
    ],
  },
  {
    id: 'stonewards',
    name: 'Custodios de la Piedra',
    surges: ['Cohesión', 'Tensión'],
    ideal: 'Estaré allí cuando se me necesite.',
    definition: 'Los Custodios de la Piedra son la roca sobre la que se apoya el ejército Radiante. Resistentes como la piedra y confiables como la tierra bajo los pies, son los últimos en abandonar el campo y los primeros en ofrecer su espalda como escudo.',
    sprenName: 'cumbrespren',
    sprenForm: 'Versiones en miniatura de sí mismos de unos diez centímetros de altura',
    sprenAppearance: 'Aparecen como réplicas diminutas del ser al que se vinculan, sólidas y detalladas como figuras talladas en piedra',
    sprenBehavior: 'Tranquilos y estables, raramente se alteran por circunstancias externas',
    sprenPhilosophy: 'La fuerza verdadera no es la que derriba muros, sino la que permanece en pie cuando todo cae.',
    personality: 'Estoicos, fiables, con una paciencia casi sobrenatural. Son el ancla de cualquier grupo.',
    ideals: 'Permanezco firme cuando otros se rinden. Mi cuerpo es el escudo de los que protejo.',
    color: '#a3e635',
    colorBg: 'rgba(163,230,53,0.1)',
    colorBorder: 'rgba(163,230,53,0.3)',
    talentos: [
      TALENTOS_COMUNES.primerIdeal('Cohesión y Tensión'),
      TALENTOS_COMUNES.segundoIdeal('Tratas de estrechar tu vínculo Nahel con tu cumbrespren.'),
      TALENTOS_COMUNES.tercerIdeal('Continúas progresando en tu vínculo con tu cumbrespren.'),
      TALENTOS_COMUNES.cuartoIdeal('Buscas convertirte en un Caballero Radiante completo.'),
      {
        name: 'Trabajo en equipo cohesivo',
        cost: 'passive',
        prereq: 'Cohesión 2 o más; Tensión 2 o más; Primer Ideal',
        description: 'Al Obtener ventaja mientras te queda Investidura, la siguiente prueba que un aliado haga contra ese objetivo obtiene también ventaja. Además, nada puede obligarte a moverte ni a quedar Tumbado.',
      },
      TALENTOS_COMUNES.investido(),
      TALENTOS_COMUNES.vinculoEstrechado(),
      TALENTOS_COMUNES.adoptarEscudero('tantos escuderos como tu nivel actual'),
      TALENTOS_COMUNES.regeneracionHeridas(),
    ],
  },
  {
    id: 'bondsmiths',
    name: 'Forjadores de Vínculos',
    surges: ['Tensión', 'Adhesión'],
    ideal: 'Uniré.',
    definition: 'Los Forjadores de Vínculos son los más raros y poderosos de los Radiantes. Solo puede haber tres a la vez, vinculados a los tres grandes spren divinos. Son mediadores entre mundos y su poder tiene el potencial de alterar la realidad misma.',
    sprenName: 'Spren divino (el Padre Tormenta, la Vigilante Nocturna o el Hermano)',
    sprenForm: 'Manifestaciones de divinidad que trascienden la comprensión mortal',
    sprenAppearance: 'Tan vastos que no pueden reducirse a una forma discernible para el ojo humano',
    sprenBehavior: 'Antiguos e insondables, cada uno refleja el aspecto de Honor, Cultivación o el Espacio entre',
    sprenPhilosophy: 'Los vínculos son la esencia de la existencia. Todo lo que existe lo hace porque está unido a algo más.',
    personality: 'Líderes naturales con una capacidad única para ver la humanidad en cualquier ser. Sienten la división como un dolor físico.',
    ideals: 'Uniré en lugar de dividir. Unificaré a la gente aunque me cueste todo lo que tengo.',
    color: '#e2e8f0',
    colorBg: 'rgba(226,232,240,0.08)',
    colorBorder: 'rgba(226,232,240,0.25)',
    talentos: [],
  },
]
