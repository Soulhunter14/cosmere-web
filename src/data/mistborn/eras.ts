/**
 * The two eras of Scadrial a Nacidos de la bruma campaign is set in (L.371-372 / PDF 377-378). The era is fixed when the campaign is
 * created and only filters options (pickers, catalog); a campaign that crosses both eras is played as two campaigns (§3 b, §13).
 * Texts are short paraphrases of the book, not quotations.
 */
import type { Era } from '../../types'

export interface EraDef {
  /** Heading of the era section in the book */
  label: string
  /** One-line summary of the setting */
  lema: string
  /** Tone warning shown when the era is chosen; only Era 1 has one in the book */
  aviso?: string
}

export const ERAS: Record<Era, EraDef> = {
  era1: {
    label: 'Era 1: El Mundo de Ceniza',
    lema: 'Un planeta postapocalíptico de lluvia de ceniza y brumas que encaja con asesinos, rebeldes y nobles corruptos.',
    aviso:
      'La Era 1 es más sombría que la Era 2: la opresión del Imperio Final incluye temas duros. ' +
      'Avisa a los jugadores antes de empezar y acordad las herramientas de seguridad (L.372 / PDF 378).',
  },
  era2: {
    label: 'Era 2: Cambio y revolución',
    lema: 'Un Scadrial que cambia deprisa: tecnología, artes metálicas mejor estudiadas y naciones que dejan de estar aisladas; ' +
      'ambiente de novela de género con agentes de la ley, detectives y cazatesoros armados.',
  },
}
