import client from './client'
import type { Note, CreateNoteRequest } from '../types'

export const notesApi = {
  getAll: (campaignId: number) =>
    client.get<Note[]>(`/campaigns/${campaignId}/notes`).then((r) => r.data),

  create: (campaignId: number, data: CreateNoteRequest) =>
    client.post<Note>(`/campaigns/${campaignId}/notes`, data).then((r) => r.data),

  markAsRead: (campaignId: number, noteId: number) =>
    client.put(`/campaigns/${campaignId}/notes/${noteId}/read`),
}
