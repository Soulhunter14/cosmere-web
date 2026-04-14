import client from './client'
import type { Meta, CreateMetaRequest, UpdateMetaRequest, ConcludeMetaRequest } from '../types'

const base = (campaignId: number, characterId: number) =>
  `/campaigns/${campaignId}/characters/${characterId}/metas`

export const metasApi = {
  getAll: (campaignId: number, characterId: number) =>
    client.get<Meta[]>(base(campaignId, characterId)).then((r) => r.data),

  create: (campaignId: number, characterId: number, data: CreateMetaRequest) =>
    client.post<Meta>(base(campaignId, characterId), data).then((r) => r.data),

  update: (campaignId: number, characterId: number, metaId: number, data: UpdateMetaRequest) =>
    client.put<Meta>(`${base(campaignId, characterId)}/${metaId}`, data).then((r) => r.data),

  conclude: (campaignId: number, characterId: number, metaId: number, data: ConcludeMetaRequest) =>
    client.post<Meta>(`${base(campaignId, characterId)}/${metaId}/conclude`, data).then((r) => r.data),

  delete: (campaignId: number, characterId: number, metaId: number) =>
    client.delete(`${base(campaignId, characterId)}/${metaId}`),
}
