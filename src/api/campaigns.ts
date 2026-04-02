import client from './client'
import type { Campaign, CampaignDetail } from '../types'

export const campaignsApi = {
  getAll: () => client.get<Campaign[]>('/campaigns').then((r) => r.data),

  getById: (id: number) =>
    client.get<CampaignDetail>(`/campaigns/${id}`).then((r) => r.data),

  create: (name: string) =>
    client.post<CampaignDetail>('/campaigns', { name }).then((r) => r.data),

  delete: (id: number) => client.delete(`/campaigns/${id}`),

  join: (inviteCode: string) =>
    client.post<Campaign>('/campaigns/join', { inviteCode }).then((r) => r.data),

  updateInvite: (id: number, inviteActive: boolean) =>
    client.patch(`/campaigns/${id}/invite`, { inviteActive }),

  regenerateCode: (id: number) =>
    client.post<string>(`/campaigns/${id}/invite/regenerate`).then((r) => r.data),
}
