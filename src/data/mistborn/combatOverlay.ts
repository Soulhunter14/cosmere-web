/**
 * Overlay of Nacidos de la bruma over the shared «Combate» rules (`src/data/combatRules.ts`; resolver in `src/data/overlays.ts`).
 * Capítulo 10 of both books is the same engine (the 17 actions and their costs are identical): only what the book words
 * differently is written here: the rule differences of operations 18-20 of the checklist of
 * `docs/nacidos-de-la-bruma/06-delta-reglas-base.md` §6.2 (four replacements: Agarrar, Acometida reactiva, Sorpresa ×2). Operation 23 is the
 * subtitle of the page, which reads `WorldConfig.nombreDe`. Texts are short paraphrases of the book, not quotations.
 * The base is neutral since T23b (Q12): Interactuar (operation 22) and the ataques de zona (operation 21) are worded there the way this book
 * words them, so their operations are gone. Agarrar, Acometida reactiva and Sorpresa are rules, not colour: the base keeps the wording
 * Stormlight has always had (`STORMLIGHT_COMBATE` does not touch them) and this overlay is the one that changes them.
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
  },
}
