import client from './client'
import type { GlobalNpc } from '../types'

/**
 * The caller never sets the world nor the era: the server takes them from the campaign of `?campaignId=` and ignores them in
 * the body (§5.2)
 */
type GlobalNpcBody = Partial<Omit<GlobalNpc, 'world' | 'era'>>

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
}
