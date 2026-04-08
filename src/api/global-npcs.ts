import client from './client'
import type { GlobalNpc } from '../types'

export const globalNpcsApi = {
  getAll: () =>
    client.get<GlobalNpc[]>('/global-npcs').then((r) => r.data),

  getById: (id: number) =>
    client.get<GlobalNpc>(`/global-npcs/${id}`).then((r) => r.data),

  create: (data: Partial<GlobalNpc>) =>
    client.post<GlobalNpc>('/global-npcs', data).then((r) => r.data),

  update: (id: number, data: Partial<GlobalNpc>) =>
    client.put<GlobalNpc>(`/global-npcs/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    client.delete(`/global-npcs/${id}`),
}
