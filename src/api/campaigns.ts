import client from './client'
import type { Campaign, CampaignDetail, Era, UserCandidate, WorldId } from '../types'

export const campaignsApi = {
  getAll: () => client.get<Campaign[]>('/campaigns').then((r) => r.data),

  getById: (id: number) =>
    client.get<CampaignDetail>(`/campaigns/${id}`).then((r) => r.data),

  create: (data: { name: string; world: WorldId; era: Era | null }) =>
    client.post<CampaignDetail>('/campaigns', data).then((r) => r.data),

  delete: (id: number) => client.delete(`/campaigns/${id}`),

  join: (inviteCode: string) =>
    client.post<Campaign>('/campaigns/join', { inviteCode }).then((r) => r.data),

  updateInvite: (id: number, inviteActive: boolean) =>
    client.patch(`/campaigns/${id}/invite`, { inviteActive }),

  regenerateCode: (id: number) =>
    client.post<string>(`/campaigns/${id}/invite/regenerate`).then((r) => r.data),

  getCandidates: (id: number) =>
    client.get<UserCandidate[]>(`/campaigns/${id}/members/candidates`).then((r) => r.data),

  addMember: (id: number, userId: number) =>
    client.post(`/campaigns/${id}/members`, { userId }),

  // Closing of the campaign (src/lib/cierreCampana.ts): director only
  iniciar: (id: number) => client.post(`/campaigns/${id}/iniciar`),

  reabrir: (id: number) => client.post(`/campaigns/${id}/reabrir`),
}
