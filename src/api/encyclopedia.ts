import client from './client'
import type { EncyclopediaOriginalSummary, EncyclopediaText, SaveEncyclopediaTextRequest } from '../types'

// Originales de la enciclopedia (EncyclopediaController): the book's text and mini-PDF of each entry, shared by every campaign of the
// world of `campaignId`. Any member reads them; writes are the director's (403 for a player).
const base = (section: string, key: string) => `/encyclopedia/originals/${section}/${key}`

export const encyclopediaApi = {
  /** What the world has uploaded, without the texts or the PDFs */
  list: (campaignId: number) =>
    client.get<EncyclopediaOriginalSummary[]>('/encyclopedia/originals', { params: { campaignId } }).then((r) => r.data),

  getText: (campaignId: number, section: string, key: string) =>
    client.get<EncyclopediaText>(`${base(section, key)}/text`, { params: { campaignId } }).then((r) => r.data),

  /** The mini-PDF as a blob: it needs the token, so it is downloaded through an object URL, never with a plain link to the API */
  getPdf: (campaignId: number, section: string, key: string) =>
    client.get<Blob>(`${base(section, key)}/pdf`, { params: { campaignId }, responseType: 'blob' }).then((r) => r.data),

  saveText: (campaignId: number, section: string, key: string, body: SaveEncyclopediaTextRequest) =>
    client.put<EncyclopediaOriginalSummary>(`${base(section, key)}/text`, body, { params: { campaignId } }).then((r) => r.data),

  savePdf: (campaignId: number, section: string, key: string, title: string, file: Blob) => {
    const form = new FormData()
    form.append('file', file, `${key}.pdf`)
    form.append('title', title)
    // The client's default JSON type would turn the form into JSON: multipart lets the browser add the boundary
    return client.put<EncyclopediaOriginalSummary>(`${base(section, key)}/pdf`, form, {
      params: { campaignId },
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  removeText: (campaignId: number, section: string, key: string) =>
    client.delete(`${base(section, key)}/text`, { params: { campaignId } }).then(() => undefined),

  removePdf: (campaignId: number, section: string, key: string) =>
    client.delete(`${base(section, key)}/pdf`, { params: { campaignId } }).then(() => undefined),
}
