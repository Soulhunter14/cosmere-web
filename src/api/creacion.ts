import client from './client'
import type { CreacionEstado } from '../types'

/**
 * Guided character creation (section «Creación de personajes», src/pages/creacion): the director releases the world's steps one by one,
 * adds characters assigned to players and marks them created; players fill their steps with the usual PUT of characters, which the
 * server checks against the released steps. Every write answers with the whole state and wakes the campaign with `CreacionUpdated`.
 */
export const creacionApi = {
  get: (campaignId: number) =>
    client.get<CreacionEstado>(`/campaigns/${campaignId}/creacion`).then((r) => r.data),

  setPaso: (campaignId: number, paso: number) =>
    client.put<CreacionEstado>(`/campaigns/${campaignId}/creacion/paso`, { paso }).then((r) => r.data),

  addPersonaje: (campaignId: number, ownerId: number) =>
    client.post<CreacionEstado>(`/campaigns/${campaignId}/creacion/personajes`, { ownerId }).then((r) => r.data),

  completar: (campaignId: number, characterId: number) =>
    client.post<CreacionEstado>(`/campaigns/${campaignId}/creacion/personajes/${characterId}/completar`).then((r) => r.data),

  deshacer: (campaignId: number, characterId: number) =>
    client.delete<CreacionEstado>(`/campaigns/${campaignId}/creacion/personajes/${characterId}/completar`).then((r) => r.data),
}
