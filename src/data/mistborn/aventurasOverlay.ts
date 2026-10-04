/**
 * Overlay of Nacidos de la bruma over the shared «Aventuras» rules (`src/data/aventuras.ts`; resolver in `src/data/overlays.ts`).
 * Capítulo 9 of both books is the same engine, so only what differs is written here (operations 1-17 of the checklist of
 * `docs/nacidos-de-la-bruma/06-delta-reglas-base.md` §6.2): the two states that only this book has (Desprovisto, Mermado), the one
 * it lacks (Empoderado), the metal-mind benefit of the rests and the new rest activity, the currency of the costs and the examples
 * of Scadrial. Texts are short paraphrases of the book, not quotations.
 * The base is still written with the Stormlight text (T23): T23b neutralises it and drops the operations it makes redundant.
 */
import type { AventurasOverlay } from '../overlays'

export const MISTBORN_AVENTURAS: AventurasOverlay = {
  estados: {
    // 15 states: Empoderado is Stormlight's (Radiant Ideals), Desprovisto and Mermado are new (L.310-311 / PDF 316-317).
    // The resolver sorts the list alphabetically again (Desprovisto after Desorientado, Mermado after Mejorado)
    add: [
      {
        name: 'Desprovisto',
        summary: 'No tienes acceso a la Investidura de un poder concreto.',
        details:
          'Mientras estés Desprovisto de un poder no puedes usarlo: no puedes gastar Investidura en efectos de ese poder, no cuentas como Investido para ellos y no te beneficias de sus efectos nacientes. El poder del que estás Desprovisto aparece entre corchetes tras el nombre (por ejemplo, Desprovisto [Oro]: no puedes usar ese poder, sus talentos ni su versión naciente).',
        special: 'Puedes estar Desprovisto de varios poderes a la vez. Se elimina con la acción Beber vial (cap. 5).',
      },
      {
        name: 'Mermado',
        summary: 'Uno de tus atributos disminuye temporalmente.',
        details:
          'El atributo entre corchetes se reduce en la cifra indicada. Penaliza las habilidades asociadas, los talentos que usan directamente ese atributo y el movimiento si es Velocidad, pero no cambia tus defensas, salud máxima, concentración máxima ni Investidura máxima.',
        special:
          'Acumulativo: puede afectar a varios atributos a la vez. Ejemplo: Velocidad 3 y Mermado [Velocidad -2] = -2 a Agilidad, Armamento ligero, Hurto y Sigilo, y movimiento de 9 a 7,5 m.',
      },
    ],
    remove: ['Empoderado'],
    // Inconsciente loses the exception of the Radiants (L.311 / PDF 317)
    replace: [
      {
        name: 'Inconsciente',
        details:
          'Quedas Tumbado y dejas caer lo que sujetas. No puedes interactuar con el entorno ni usar acciones o reacciones. En combate siempre tienes turno lento pero no puedes actuar.',
      },
    ],
  },

  // Beneficio alternativo de ambos descansos: cargar las mentes de metal feruquímicas (L.307 / PDF 313)
  descansos: {
    corto: {
      addDetails: [
        {
          label: 'Beneficio alternativo: almacenar en mentes de metal',
          text: 'En lugar de recuperarte tú, puedes cargar tus mentes de metal feruquímicas durante el descanso: equivale a una escena a efectos de almacenamiento.',
          after: 'Beneficio alternativo: buscar recursos',
        },
      ],
    },
    largo: {
      addDetails: [
        {
          label: 'Beneficio alternativo: almacenar en mentes de metal',
          text: 'En lugar de recuperarte, puedes cargar tus mentes de metal feruquímicas durante el descanso: equivale a dos escenas a efectos de almacenamiento. Si lo haces, quedas Agotado [-1].',
          after: 'Agotamiento',
        },
      ],
    },
  },

  // Reposo: costes en arquillas y ejemplos de Scadrial (L.308-310 / PDF 314-316); Mentoría en las artes metálicas es nueva
  actividades: {
    add: [
      {
        name: 'Mentoría en las artes metálicas',
        // [inferido]: el libro no fija ni duración ni coste, solo «por cada día que pases entrenando con un mentor»
        duration: 'Por días de entrenamiento con el mentor',
        cost: '—',
        description:
          'Si tienes un patrocinador experto en alguno de tus poderes alománticos o feruquímicos, puede instruirte. Por cada día que entrenes con él obtienes una ventaja para una prueba futura relacionada con ese poder. Acumulas tantas ventajas como tus grados en Alomancia o Feruquimia (el valor mayor de los dos); persisten hasta que las uses o hasta que vuelvas a entrenar con cualquier mentor.',
      },
    ],
    replace: [
      {
        name: 'Manufactura',
        description:
          'Puedes fabricar objetos (como las potentes armas de fuego y explosivos de la Era 2) tal como se describe en el capítulo 7. La manufactura puede llevar muchos días, por lo que es ideal llevarla a cabo durante períodos de reposo.',
      },
      {
        name: 'Investigación',
        cost: '3 arquillas/día',
        description:
          'Experimenta con nuevas tecnologías en un laboratorio, consulta volúmenes en una biblioteca o localiza a un guardador terrisano reservado para acceder a su saber. Dile a la DJ qué esperas descubrir y ella decidirá si es posible y cuánto tiempo necesitas. Suele requerir pruebas de Deducción, Saber o Persuasión.',
      },
      {
        name: 'Entrenamiento',
        cost: '5 arquillas/día',
        description:
          'Busca un mentor, libro de referencia o expertos para adquirir una nueva pericia especializada (como Hoja koloss). La DJ determina el tiempo y las pruebas requeridas.',
      },
      { name: 'Autorreflexión', cost: '5 arquillas/día' },
    ],
  },

  // Sucesos: los ejemplos de Scadrial (L.305-306 / PDF 311-312)
  sucesos: {
    'que-es': {
      replaceDetails: {
        'Positivos o negativos':
          'Los sucesos pueden ser buenos o malos para los PJs. Ejemplos: la puesta de sol y la llegada de las brumas, la furia creciente de una horda de koloss, la llegada de los guardias del lord Legislador a un altercado o la aparición del tren que vigilabas para un trabajo.',
      },
    },
    'como-contribuir': {
      replaceDetails: {
        'Complicaciones (DJ)':
          'La DJ puede gastar una Complicación en un suceso negativo. Esto le da control dramático sobre cuándo se activa un suceso adverso, como la llegada de un brumoso enemigo justo cuando los PJs estaban a punto de vencer.',
      },
    },
    activacion: {
      replaceDetails: {
        'Ejemplo':
          'Estás esperando unos refuerzos vitales (suceso positivo) mientras el sol se pone y las brumas amenazan con permitir que tus enemigos escapen (suceso negativo). Contribuyes al avance de tus aliados con Oportunidades, mientras las Complicaciones hacen avanzar la llegada de las brumas.',
      },
    },
  },

  // Tipos de daño: sin hojas esquirladas ni potencias; ejemplos de Golpe del libro (L.312 / PDF 318)
  tiposDano: {
    replace: [
      {
        name: 'Espiritual',
        description:
          'Daña tanto el yo físico como el espiritual: lo infligen los efectos que dañan ambos aspectos del ser. No se ve reducido por el desvío.',
      },
      {
        name: 'Golpe',
        description:
          'Aplastamientos, golpes con objetos contundentes (bastones de duelo, trozos de metal). Se ve reducido por tu valor de desvío.',
      },
    ],
  },

  // Comida y agua: sin Shadesmar (L.312 / PDF 318)
  dano: {
    'comida-agua': {
      summary:
        'En situaciones normales la DJ no pide seguimiento de reservas. Solo importa cuando el acceso puede ser limitado, como tras las líneas enemigas o a bordo de una aeronave con pocas provisiones.',
    },
  },
}
