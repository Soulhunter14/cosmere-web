import client from './client'
import type { BookChapter, BookChapterSummary, SaveBookChapterRequest } from '../types'

// Libro original: the adventure book uploaded by the director, one chapter at a time (BookController). Players get 403.
export const bookApi = {
  /** The uploaded chapters in order, without their text */
  list: (campaignId: number) =>
    client.get<BookChapterSummary[]>(`/campaigns/${campaignId}/book`).then((r) => r.data),

  get: (campaignId: number, number: number) =>
    client.get<BookChapter>(`/campaigns/${campaignId}/book/${number}`).then((r) => r.data),

  /** Creates the chapter or replaces the stored one */
  save: (campaignId: number, number: number, body: SaveBookChapterRequest) =>
    client.put<BookChapter>(`/campaigns/${campaignId}/book/${number}`, body).then((r) => r.data),

  remove: (campaignId: number, number: number) =>
    client.delete(`/campaigns/${campaignId}/book/${number}`).then(() => undefined),
}
