import client from './client'
import type { Character, CreateCharacterRequest, UpdateCharacterRequest } from '../types'

export const charactersApi = {
  getAll: (campaignId: number) =>
    client.get<Character[]>(`/campaigns/${campaignId}/characters`).then((r) => r.data),

  getById: (campaignId: number, characterId: number) =>
    client.get<Character>(`/campaigns/${campaignId}/characters/${characterId}`).then((r) => r.data),

  create: (campaignId: number, data: CreateCharacterRequest) =>
    client.post<Character>(`/campaigns/${campaignId}/characters`, data).then((r) => r.data),

  update: (campaignId: number, characterId: number, data: UpdateCharacterRequest) =>
    client.put<Character>(`/campaigns/${campaignId}/characters/${characterId}`, data).then((r) => r.data),

  delete: (campaignId: number, characterId: number) =>
    client.delete(`/campaigns/${campaignId}/characters/${characterId}`),

  assign: (campaignId: number, characterId: number, ownerId: number | null) =>
    client.put<Character>(`/campaigns/${campaignId}/characters/${characterId}/assign`, { ownerId }).then((r) => r.data),
}
