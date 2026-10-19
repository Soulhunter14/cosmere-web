import client from './client'
import type { Session, CreateSessionRequest, UpdateSessionRequest } from '../types'

export const sessionsApi = {
  getAll: (campaignId: number) =>
    client.get<Session[]>(`/campaigns/${campaignId}/sessions`).then((r) => r.data),

  create: (campaignId: number, request: CreateSessionRequest) =>
    client.post<Session>(`/campaigns/${campaignId}/sessions`, request).then((r) => r.data),

  update: (campaignId: number, sessionId: number, request: UpdateSessionRequest) =>
    client.put<Session>(`/campaigns/${campaignId}/sessions/${sessionId}`, request).then((r) => r.data),

  delete: (campaignId: number, sessionId: number) =>
    client.delete(`/campaigns/${campaignId}/sessions/${sessionId}`),
}
