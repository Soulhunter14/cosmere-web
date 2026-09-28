import client from './client'
import type { AnyRollResult } from '../utils/dice'

export interface DiceRollResponse {
  id: number
  campaignId: number
  userId: number
  userDisplayName: string
  rollType: string
  rollData: string       // JSON string — parse to AnyRollResult
  rollLabel: string
  characterName: string | null   // nombre del personaje (null = tirada del propio usuario)
  createdAt: string
}

export const diceRollsApi = {
  getRecent: (campaignId: number, limit = 50) =>
    client
      .get<DiceRollResponse[]>(`/campaigns/${campaignId}/dice-rolls`, { params: { limit } })
      .then((r) => r.data),

  create: (
    campaignId: number,
    rollType: string,
    rollData: AnyRollResult,
    rollLabel: string,
    characterName?: string | null,
  ) =>
    client
      .post<DiceRollResponse>(`/campaigns/${campaignId}/dice-rolls`, {
        rollType,
        rollData: JSON.stringify(rollData),
        rollLabel,
        characterName: characterName ?? null,
      })
      .then((r) => r.data),
}
