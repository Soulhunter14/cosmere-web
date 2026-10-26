/**
 * Rules of the guided creation shared by the director's and the player's views: whether a character has done a step, the state of a
 * step for a character (locked, pending, done) and the check that the world's steps and the API's agree.
 */
import type { CreacionPersonaje } from '../../types'
import type { PasoCreacion } from '../../worlds/types'

/** `omitido`: the step does not apply to this character (what it requires was answered otherwise) and counts as done */
export type EstadoPaso = 'bloqueado' | 'pendiente' | 'hecho' | 'omitido'

/** The provisional name the API gives a character of the guided creation («Personaje de <jugador>»): the name step is not done until the player changes it */
export const esNombreProvisional = (name: string): boolean => name.trim() === '' || /^Personaje de /.test(name.trim())

/** Whether the character has answered the step */
export function pasoHecho(paso: PasoCreacion, p: CreacionPersonaje): boolean {
  if (paso.id === 'name') return !esNombreProvisional(p.name)
  if (paso.id === 'legado') return p.legado !== ''
  if (paso.id === 'ascendencia') return p.ascendencia !== ''
  if ('indice' in paso) return (p.legadoRespuestas[paso.indice] ?? '').trim() !== ''
  if ('clave' in paso) return (p.creacionDatos[paso.clave] ?? '') !== ''
  return false
}

/**
 * Whether the step applies to the character: `si` always, or when the choice it requires has the right value; `espera` while that choice
 * is still unanswered; `no` when it was answered otherwise (the step is skipped)
 */
export function pasoAplica(paso: PasoCreacion, p: CreacionPersonaje): 'si' | 'espera' | 'no' {
  if (!('requiere' in paso) || !paso.requiere) return 'si'
  const valor = p.creacionDatos[paso.requiere.clave] ?? ''
  return valor === '' ? 'espera' : valor === paso.requiere.valor ? 'si' : 'no'
}

/** Locked while the director has not released it; then skipped, done or pending */
export const estadoPaso = (indice: number, pasoLiberado: number, hecho: boolean, aplica: 'si' | 'espera' | 'no' = 'si'): EstadoPaso =>
  indice >= pasoLiberado ? 'bloqueado' : aplica === 'no' ? 'omitido' : hecho ? 'hecho' : 'pendiente'

/** Steps the character has behind: done, or skipped because they do not apply */
export const pasosResueltos = (pasos: PasoCreacion[], p: CreacionPersonaje): number =>
  pasos.filter((paso) => pasoAplica(paso, p) === 'no' || pasoHecho(paso, p)).length

/** The world's steps (client data) and the API's (world rules) must agree: adding a step is one line on each side */
export const pasosCoinciden = (cfg: PasoCreacion[], api: string[]): boolean =>
  cfg.length === api.length && cfg.every((p, i) => p.id === api[i])

/** The answers with the one at `indice` replaced, padding with empty answers when needed */
export function conRespuesta(respuestas: string[], indice: number, texto: string): string[] {
  const out = [...respuestas]
  while (out.length <= indice) out.push('')
  out[indice] = texto
  return out
}
