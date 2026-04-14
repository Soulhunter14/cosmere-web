import client from './client'
import type { LockedDay, CreateLockedDayRequest } from '../types'

export const lockedDaysApi = {
  getAll: (campaignId: number) =>
    client.get<LockedDay[]>(`/campaigns/${campaignId}/locked-days`).then((r) => r.data),

  add: (campaignId: number, request: CreateLockedDayRequest) =>
    client.post<LockedDay>(`/campaigns/${campaignId}/locked-days`, request).then((r) => r.data),

  remove: (campaignId: number, lockedDayId: number) =>
    client.delete(`/campaigns/${campaignId}/locked-days/${lockedDayId}`),
}
