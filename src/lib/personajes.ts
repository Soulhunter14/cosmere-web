import type { CSSProperties } from 'react'
import type { Character } from '../types'

// Dead characters (core, both worlds): they stay on the lists, at the end, but take no part in what happens from now on

/** The characters still alive */
export const vivos = (personajes: Character[]): Character[] => personajes.filter((p) => !p.muerto)

/** The same list with the dead at the end, in a stable order */
export const vivosPrimero = (personajes: Character[]): Character[] =>
  [...personajes.filter((p) => !p.muerto), ...personajes.filter((p) => p.muerto)]

/** A player's character: the living one or, if all of them are dead, the one who died last */
export function miPersonaje(personajes: Character[], userId: number | null | undefined): Character | null {
  if (userId == null) return null
  const suyos = personajes.filter((p) => p.ownerId === userId)
  return suyos.find((p) => !p.muerto)
    ?? [...suyos].sort((a, b) => (b.muertoEn ?? '').localeCompare(a.muertoEn ?? ''))[0]
    ?? null
}

/** The card of a dead character on the lists: still there, but faded */
export const estiloMuerto: CSSProperties = { opacity: 0.6 }
