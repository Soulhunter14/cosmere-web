/**
 * Overlay of Nacidos de la bruma over the shared «Combate» rules (`src/data/combatRules.ts`; resolver in `src/data/overlays.ts`).
 * Capítulo 10 of both books is the same engine (the 17 actions and their costs are identical): only what the book words
 * differently is written here, operations 18-22 of the checklist of `docs/nacidos-de-la-bruma/06-delta-reglas-base.md` §6.2 (six
 * replacements: Agarrar, Acometida reactiva, Sorpresa ×2, ataques de zona, Interactuar). Operation 23 is the subtitle of the page,
 * which reads `WorldConfig.nombreDe`. Texts are short paraphrases of the book, not quotations.
 * The base is still written with the Stormlight text (T23): T23b neutralises it and drops the operations it makes redundant
 * (Interactuar and the ataques de zona).
 */
import type { CombatOverlay } from '../overlays'

export const MISTBORN_COMBATE: CombatOverlay = {
  actions: {
    replace: [
      {
        // Retenido (movement 0 and disadvantage on everything but breaking free) instead of Inmovilizado (L.320 / PDF 326)
        name: 'Agarrar',
        description:
          'Haz prueba de Atletismo contra Defensa física de un personaje en tu cercanía. Si la superas, queda Retenido hasta que quedes Inconsciente, elijas poner fin al efecto o ya no esté en tu cercanía.',
      },
      {
        // The examples of the book: preparar o guardar (it also covers firearms), comer algo, una prenda sencilla (L.319 / PDF 325)
        name: 'Interactuar',
        description:
          'Interactúas rápidamente con un objeto que puedes alcanzar sin necesidad de prueba: abrir/cerrar una puerta, recoger un objeto, preparar o guardar un arma, sacar algo de tu mochila, pasar algo a un aliado, comer algo rápidamente, ponerte o quitarte una prenda sencilla. Puede usarse más de una vez por turno.',
      },
    ],
  },
  reactions: {
    replace: [
      {
        // The reactive strike also admits an unarmed attack (L.321 / PDF 327)
        name: 'Acometida reactiva',
        description:
          'Cuando un enemigo abandona voluntariamente tu cercanía, puedes hacer una Acometida con arma cuerpo a cuerpo o un ataque sin armas contra su Defensa física. Cuesta 1 punto de concentración.',
      },
    ],
  },
  sections: {
    surprise: {
      // Sorprendido ends after the first turn of each character, not when everyone has played theirs (L.318 / PDF 324)
      summary:
        'Cuando un bando tiende una emboscada, los personajes que no se percatan quedan Sorprendidos al inicio del combate. El estado se elimina tras el primer turno de cada personaje.',
      replaceDetails: {
        'Duración': 'El estado Sorprendido se elimina tras el primer turno de cada personaje.',
      },
    },
    area: {
      // Area attacks come from powers and capabilities of any kind, not only Radiant surges (L.323 / PDF 329)
      summary:
        'Algunos ataques (de ciertos poderes y capacidades) afectan a todos los personajes dentro de una zona física. Se resuelven haciendo una sola prueba y comparando con cada objetivo.',
    },
  },
}
