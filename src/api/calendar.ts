import client from './client'
import type { OtherCampaignEvent } from '../types'

export const calendarApi = {
  /** What the user has in their other campaigns (sessions and pending proposed slots), read-only */
  getOthers: (campaignId: number) =>
    client.get<OtherCampaignEvent[]>('/calendar/others', { params: { campaignId } }).then((r) => r.data),
}
