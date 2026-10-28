import client from './client'
import type { CreacionEstado, DecisionesPersonajeRequest, RespuestaPersonaje } from '../types'

/**
 * Guided character creation (section «Creación de personajes», src/pages/creacion): the director releases the world's steps one by one,
 * permits or denies changing the answered ones, adds characters assigned to players and marks them created; players fill their steps
 * with the usual PUT of characters, which the server checks against the released and the changeable steps. Every write answers with
 * the whole state and wakes the campaign with `CreacionUpdated`.
 */
export const creacionApi = {
  get: (campaignId: number) =>
    client.get<CreacionEstado>(`/campaigns/${campaignId}/creacion`).then((r) => r.data),

  setPaso: (campaignId: number, paso: number) =>
    client.put<CreacionEstado>(`/campaigns/${campaignId}/creacion/paso`, { paso }).then((r) => r.data),

  setCambiable: (campaignId: number, paso: string, permitido: boolean) =>
    client.put<CreacionEstado>(`/campaigns/${campaignId}/creacion/cambiable`, { paso, permitido }).then((r) => r.data),

  addPersonaje: (campaignId: number, ownerId: number) =>
    client.post<CreacionEstado>(`/campaigns/${campaignId}/creacion/personajes`, { ownerId }).then((r) => r.data),

  completar: (campaignId: number, characterId: number) =>
    client.post<CreacionEstado>(`/campaigns/${campaignId}/creacion/personajes/${characterId}/completar`).then((r) => r.data),

  deshacer: (campaignId: number, characterId: number) =>
    client.delete<CreacionEstado>(`/campaigns/${campaignId}/creacion/personajes/${characterId}/completar`).then((r) => r.data),

  /** The creation session (director): `preparar`, `iniciar` (with the screen's table session and script), `terminar` or `volver` to the preparation; 409 out of order */
  sesion: (campaignId: number, accion: 'preparar' | 'iniciar' | 'terminar' | 'volver', body: { mesaId?: string; guion?: string } = {}) =>
    client.post<CreacionEstado>(`/campaigns/${campaignId}/creacion/sesion/${accion}`, body).then((r) => r.data),

  /** The record of answers of a character: every row for the director, the creation rows for its owner */
  getRespuestas: (campaignId: number, characterId: number) =>
    client.get<RespuestaPersonaje[]>(`/campaigns/${campaignId}/characters/${characterId}/respuestas`).then((r) => r.data),

  /** Replaces the character's script decisions with the list sent (director); answers with every row of the character */
  putDecisiones: (campaignId: number, characterId: number, body: DecisionesPersonajeRequest) =>
    client.put<RespuestaPersonaje[]>(`/campaigns/${campaignId}/characters/${characterId}/respuestas/decisiones`, body).then((r) => r.data),
}
