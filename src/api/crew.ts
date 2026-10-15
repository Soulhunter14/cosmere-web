import client from './client'
import type {
  AportarCrewRequest, CrewSheet, EntrarAlmacenRequest, SacarAlmacenRequest, SaveCrewSheetRequest, ShareCrewSheetRequest,
} from '../types'

// «La banda»: the crew sheet of one campaign (CrewController). The director reads and writes it; a player reads it only when the
// director has shared it with them (otherwise 403).
export const crewApi = {
  get: (campaignId: number) =>
    client.get<CrewSheet>(`/campaigns/${campaignId}/crew`).then((r) => r.data),

  /** 409 when another device saved first: the error's `response.data` is the stored CrewSheet */
  save: (campaignId: number, body: SaveCrewSheetRequest) =>
    client.put<CrewSheet>(`/campaigns/${campaignId}/crew`, body).then((r) => r.data),

  /**
   * A character gives money from their purse to the treasury; the server moves it in one transaction and answers with the new sheet.
   * 400: not enough money or an invalid amount; 403: not their character, or the sheet is not shared with them
   */
  aportar: (campaignId: number, body: AportarCrewRequest) =>
    client.post<CrewSheet>(`/campaigns/${campaignId}/crew/aportes`, body).then((r) => r.data),

  /**
   * Goods leave a character's inventory (the worn armor comes off when none is left) and enter the crew's store, in one transaction.
   * 400: the character does not carry that many, or invalid data; 403: not their character, or the sheet is not shared with them
   */
  entrarAlmacen: (campaignId: number, body: EntrarAlmacenRequest) =>
    client.post<CrewSheet>(`/campaigns/${campaignId}/crew/almacen/entradas`, body).then((r) => r.data),

  /** A lot leaves the crew's store and its units enter the character's inventory, in one transaction. 400: the lot is no longer there */
  sacarAlmacen: (campaignId: number, loteId: string, body: SacarAlmacenRequest) =>
    client.post<CrewSheet>(`/campaigns/${campaignId}/crew/almacen/${encodeURIComponent(loteId)}/salida`, body).then((r) => r.data),

  /** Replaces the players who may read the sheet; it does not change the version */
  share: (campaignId: number, body: ShareCrewSheetRequest) =>
    client.put<CrewSheet>(`/campaigns/${campaignId}/crew/sharing`, body).then((r) => r.data),
}
