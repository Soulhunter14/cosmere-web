import client from './client'
import type { SideQuest } from '../types'

export const sideQuestsApi = {
  getAll: (campaignId: number) =>
    client.get<SideQuest[]>(`/campaigns/${campaignId}/sidequests`).then((r) => r.data),

  getById: (campaignId: number, id: number) =>
    client.get<SideQuest>(`/campaigns/${campaignId}/sidequests/${id}`).then((r) => r.data),

  create: (campaignId: number, data: Partial<SideQuest>) =>
    client.post<SideQuest>(`/campaigns/${campaignId}/sidequests`, data).then((r) => r.data),

  update: (campaignId: number, id: number, data: Partial<SideQuest>) =>
    client.put<SideQuest>(`/campaigns/${campaignId}/sidequests/${id}`, data).then((r) => r.data),

  delete: (campaignId: number, id: number) =>
    client.delete(`/campaigns/${campaignId}/sidequests/${id}`),
}
