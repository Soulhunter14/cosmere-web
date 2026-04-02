import client from './client'
import type { Match } from '../types'

export const matchesApi = {
  getAll: (campaignId: number) =>
    client.get<Match[]>(`/campaigns/${campaignId}/matches`).then((r) => r.data),

  getById: (campaignId: number, matchId: number) =>
    client.get<Match>(`/campaigns/${campaignId}/matches/${matchId}`).then((r) => r.data),

  create: (campaignId: number) =>
    client.post<Match>(`/campaigns/${campaignId}/matches`, {}).then((r) => r.data),

  addScene: (campaignId: number, matchId: number, description: string) =>
    client.post<Match>(`/campaigns/${campaignId}/matches/${matchId}/scenes`, { description }).then((r) => r.data),

  finalize: (campaignId: number, matchId: number, resolution: string) =>
    client.post<Match>(`/campaigns/${campaignId}/matches/${matchId}/finalize`, { resolution }).then((r) => r.data),

  delete: (campaignId: number, matchId: number) =>
    client.delete(`/campaigns/${campaignId}/matches/${matchId}`),
}
