import client from './client'
import type { BookImageKind, GlobalNpc } from '../types'

/**
 * The adversaries of each world's catalog are read-only: they are the books' (an erratum or a new adversary comes in a migration,
 * like the seeds) and an enemy is adjusted on its own copy, in an encounter of the GM screen. Only their book images are written.
 */
// Every call but `getById` carries `?campaignId=`: the server lists the adversaries of that campaign's world and serves the book
// images only to its GM.
export const globalNpcsApi = {
  getAll: (campaignId: number) =>
    client.get<GlobalNpc[]>('/global-npcs', { params: { campaignId } }).then((r) => r.data),

  // By id and unfiltered: the detail page decides what to show when the adversary belongs to another world
  getById: (id: number) =>
    client.get<GlobalNpc>(`/global-npcs/${id}`).then((r) => r.data),

  // The adversary as its book prints it (only the GM of a campaign of its world). The image needs the token, so it comes as a
  // blob for an object URL, never as an <img src> to the API
  getBookImage: (id: number, kind: BookImageKind, campaignId: number) =>
    client.get<Blob>(`/global-npcs/${id}/book-images/${kind}`, { params: { campaignId }, responseType: 'blob' }).then((r) => r.data),

  saveBookImage: (id: number, kind: BookImageKind, file: Blob, campaignId: number) => {
    const form = new FormData()
    form.append('file', file)
    // The client's default JSON type would turn the form into JSON: multipart lets the browser add the boundary
    return client.put<GlobalNpc>(`/global-npcs/${id}/book-images/${kind}`, form, {
      params: { campaignId },
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data)
  },

  deleteBookImage: (id: number, kind: BookImageKind, campaignId: number) =>
    client.delete(`/global-npcs/${id}/book-images/${kind}`, { params: { campaignId } }),
}
