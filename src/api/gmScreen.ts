import client from './client'
import type { GmScreen, SaveGmScreenRequest } from '../types'

// «Pantalla del director»: the director's table state of one campaign (GmScreenController). Players get 403.
export const gmScreenApi = {
  get: (campaignId: number) =>
    client.get<GmScreen>(`/campaigns/${campaignId}/gm-screen`).then((r) => r.data),

  /** 409 when another device saved first: the error's `response.data` is the stored GmScreen */
  save: (campaignId: number, body: SaveGmScreenRequest) =>
    client.put<GmScreen>(`/campaigns/${campaignId}/gm-screen`, body).then((r) => r.data),

  /**
   * The same PUT with the body already serialized as a `SaveGmScreenRequest` (the screen cleans and measures it first), and a
   * time limit so a request that never answers does not hold the next saves
   */
  saveJson: (campaignId: number, body: string, timeout: number) =>
    client
      .put<GmScreen>(`/campaigns/${campaignId}/gm-screen`, body, { headers: { 'Content-Type': 'application/json' }, timeout })
      .then((r) => r.data),
}
