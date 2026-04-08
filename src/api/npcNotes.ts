import client from './client'
import type { NpcNote } from '../types'

export const npcNotesApi = {
  getAll: (campaignId: number) =>
    client.get<NpcNote[]>(`/campaigns/${campaignId}/npc-notes`).then((r) => r.data),

  create: (campaignId: number, data: { npcName: string; notes: string; isShared: boolean }) =>
    client.post<NpcNote>(`/campaigns/${campaignId}/npc-notes`, data).then((r) => r.data),

  update: (campaignId: number, noteId: number, data: { npcName: string; notes: string; isShared: boolean }) =>
    client.put<NpcNote>(`/campaigns/${campaignId}/npc-notes/${noteId}`, data).then((r) => r.data),

  delete: (campaignId: number, noteId: number) =>
    client.delete(`/campaigns/${campaignId}/npc-notes/${noteId}`),
}
