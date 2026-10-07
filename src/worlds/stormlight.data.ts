/**
 * Heavy data of the Stormlight world (WorldData). Its modules already travel in the main bundle
 * (CharacterDetailPage and a dozen more files import heroicPaths/radiantOrders statically), so stormlight.ts also
 * exposes this same object as `syncData`.
 *
 * RADIANT_ORDERS, ARBOL_CANTOR, TALENT_GRIDS and TALENT_SUMMARIES are NOT wrapped here: they do not fit in
 * WorldData and enter STORMLIGHT_TALENTOS in T34a.
 * Meeting-point file: later tasks add lines, they never reorder them.
 */
import { HEROIC_PATHS } from '../data/heroicPaths'
import { POTENCIAS } from '../data/potencias'
import type { AventurasOverlay, CombatOverlay } from '../data/overlays'
import type { WorldData } from './types'
import { STORMLIGHT_TALENTOS } from '../lib/talentRules'

/**
 * Overlay of Stormlight over the shared «Aventuras» rules (T23b, Q12, P8). The base (src/data/aventuras.ts) is neutral Cosmere text;
 * what is Roshar's is written here and put back by name: the arrays the page resolves for Stormlight are JSON-identical to the ones
 * it showed when the base still carried this wording (compared before and after T23b). It travels in the main bundle with the rest of
 * Stormlight's data, so `syncData` has it on the first render.
 */
export const STORMLIGHT_AVENTURAS: AventurasOverlay = {
  estados: {
    // Empoderado (the Ideals of the Radiants) is only in this book, and Inconsciente keeps the exception of the Radiants.
    // The resolver sorts the list alphabetically again, so Empoderado goes back after Desorientado, where it always was
    add: [
      {
        name: 'Empoderado',
        summary: 'Estallido de poder sin límites al jurar un Ideal (solo Caballeros Radiantes).',
        details: 'Obtienes ventaja en todas las pruebas y tu Investidura se recarga hasta su máximo al inicio de cada uno de tus turnos.',
        special: 'Se elimina al final de la escena actual.',
      },
    ],
    replace: [
      {
        name: 'Inconsciente',
        details:
          'Quedas Tumbado y dejas caer lo que sujetas. No puedes interactuar con el entorno ni usar acciones o reacciones (excepto Absorber luz tormentosa y Revitalizar si eres Radiante). En combate siempre tienes turno lento pero no puedes actuar.',
      },
    ],
  },

  // Reposo: costs in marcos (mc) and the examples of Roshar (fabriales, devotarios, Martillo de guerra, Semiesquirla)
  actividades: {
    replace: [
      {
        name: 'Manufactura',
        description:
          'Puedes fabricar objetos o fabriales tal como se describe en el capítulo 7. La manufactura puede llevar muchos días, por lo que es ideal llevarla a cabo durante períodos de reposo.',
      },
      {
        name: 'Investigación',
        cost: '3 mc/día',
        description:
          'Visita devotarios, lee en bibliotecas o experimenta en laboratorios. Dile a la DJ qué esperas descubrir y ella decidirá si es posible y cuánto tiempo necesitas. Suele requerir pruebas de Deducción, Saber o Persuasión.',
      },
      {
        name: 'Entrenamiento',
        cost: '5 mc/día',
        description:
          'Busca un mentor, libro de referencia o expertos para adquirir una nueva pericia especializada (como Martillo de guerra o Semiesquirla). La DJ determina el tiempo y las pruebas requeridas.',
      },
      { name: 'Autorreflexión', cost: '5 mc/día' },
    ],
  },

  // Sucesos: the examples of Roshar (alta tormenta, perpendicular, abismoide)
  sucesos: {
    'que-es': {
      replaceDetails: {
        'Positivos o negativos':
          'Los sucesos pueden ser buenos o malos para los PJs. Ejemplos: una alta tormenta que se acerca, la llegada de refuerzos aliados, el creciente enfado de una multitud o el inminente cierre de una perpendicular.',
      },
    },
    'como-contribuir': {
      replaceDetails: {
        'Complicaciones (DJ)':
          'La DJ puede gastar una Complicación en un suceso negativo. Esto le da control dramático sobre cuándo se activa un suceso adverso, como un abismoide irrumpiendo en la escena.',
      },
    },
    activacion: {
      replaceDetails: {
        'Ejemplo':
          'Estás esperando refuerzos muy necesarios (suceso positivo) mientras una alta tormenta se acerca (suceso negativo). Contribuyes al avance de tus aliados con Oportunidades, mientras las Complicaciones hacen avanzar la tormenta.',
      },
    },
  },

  // Tipos de daño: the hojas esquirladas and the potencias
  tiposDano: {
    replace: [
      {
        name: 'Espiritual',
        description: 'Daña tanto el yo físico como el espiritual. Causado principalmente por hojas esquirladas y algunas potencias. No se ve reducido por el desvío.',
      },
    ],
  },

  // Comida y agua: Shadesmar
  dano: {
    'comida-agua': {
      summary:
        'En situaciones normales la DJ no pide seguimiento de reservas. Solo importa cuando el acceso puede ser limitado, como tras las líneas enemigas o en Shadesmar.',
    },
  },
}

/**
 * Overlay of Stormlight over the shared «Combate» rules (T23b, Q12, P8): the wording of Roshar that the neutral base
 * (src/data/combatRules.ts) no longer carries. What the two books rule differently (Agarrar → Inmovilizado, Acometida reactiva with a
 * melee weapon only, Sorprendido ending when everyone has played) is a rule, not colour: the base keeps the text Stormlight has always
 * had and the Mistborn overlay is the one that changes it.
 */
export const STORMLIGHT_COMBATE: CombatOverlay = {
  actions: {
    replace: [
      {
        name: 'Interactuar',
        description:
          'Interactúas rápidamente con un objeto que puedes alcanzar sin necesidad de prueba: abrir/cerrar una puerta, recoger un objeto, desenvainar o envainar un arma, sacar algo de tu mochila, pasar algo a un aliado. Puede usarse más de una vez por turno.',
      },
    ],
  },
  sections: {
    area: {
      summary:
        'Algunos ataques (especialmente potencias Radiantes) afectan a todos los personajes dentro de una zona física. Se resuelven haciendo una sola prueba y comparando con cada objetivo.',
    },
  },
}

export const DATA: WorldData = {
  talentos: STORMLIGHT_TALENTOS,
  caminosHeroicos: HEROIC_PATHS,
  poderes: POTENCIAS,
  overlays: { aventuras: STORMLIGHT_AVENTURAS, combat: STORMLIGHT_COMBATE },
}
