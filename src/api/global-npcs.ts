import client from './client'
import type { BookImageKind, GlobalNpc } from '../types'

/**
 * The caller never sets the world nor the era: the server takes them from the campaign of `?campaignId=` and ignores them in
 * the body (§5.2). The book images have their own calls.
 */
type GlobalNpcBody = Partial<Omit<GlobalNpc, 'world' | 'era' | 'bookImages'>>

// Every call but `getById` carries `?campaignId=`: the server lists the adversaries of that campaign's world, creates the new one in it
// and answers 404 when the adversary of an update or a delete belongs to another world.
export const globalNpcsApi = {
  getAll: (campaignId: number) =>
    client.get<GlobalNpc[]>('/global-npcs', { params: { campaignId } }).then((r) => r.data),

  // By id and unfiltered: the detail page decides what to show when the adversary belongs to another world
  getById: (id: number) =>
    client.get<GlobalNpc>(`/global-npcs/${id}`).then((r) => r.data),

  create: (data: GlobalNpcBody, campaignId: number) =>
    client.post<GlobalNpc>('/global-npcs', data, { params: { campaignId } }).then((r) => r.data),

  update: (id: number, data: GlobalNpcBody, campaignId: number) =>
    client.put<GlobalNpc>(`/global-npcs/${id}`, data, { params: { campaignId } }).then((r) => r.data),

  delete: (id: number, campaignId: number) =>
    client.delete(`/global-npcs/${id}`, { params: { campaignId } }),

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
