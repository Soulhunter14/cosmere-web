import client from './client'
import type { DiaryEntry } from '../types'

export const diaryApi = {
  getAll: (campaignId: number) =>
    client.get<DiaryEntry[]>(`/campaigns/${campaignId}/diary`).then((r) => r.data),

  getById: (campaignId: number, entryId: number) =>
    client.get<DiaryEntry>(`/campaigns/${campaignId}/diary/${entryId}`).then((r) => r.data),
}
