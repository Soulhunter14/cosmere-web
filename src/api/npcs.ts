import client from './client'
import type { Npc } from '../types'

export const npcsApi = {
  getAll: (campaignId: number) =>
    client.get<Npc[]>(`/campaigns/${campaignId}/npcs`).then((r) => r.data),

  getById: (campaignId: number, npcId: number) =>
    client.get<Npc>(`/campaigns/${campaignId}/npcs/${npcId}`).then((r) => r.data),

  create: (campaignId: number, data: Partial<Npc>) =>
    client.post<Npc>(`/campaigns/${campaignId}/npcs`, data).then((r) => r.data),

  update: (campaignId: number, npcId: number, data: Partial<Npc>) =>
    client.put<Npc>(`/campaigns/${campaignId}/npcs/${npcId}`, data).then((r) => r.data),

  clone: (campaignId: number, npcId: number) =>
    client.post<Npc>(`/campaigns/${campaignId}/npcs/${npcId}/clone`).then((r) => r.data),

  toggleVisibility: (campaignId: number, npcId: number, isVisibleToPlayers: boolean) =>
    client.patch(`/campaigns/${campaignId}/npcs/${npcId}/visibility`, { isVisibleToPlayers }),

  delete: (campaignId: number, npcId: number) =>
    client.delete(`/campaigns/${campaignId}/npcs/${npcId}`),
}
