import client from './client'
import type { Character, CreateCharacterRequest, RecursosPatch, UpdateCharacterRequest } from '../types'

// What Nacidos de la bruma adds to every character response (§5.1)
type MistbornFields = 'caminoMetal' | 'caminoInicial' | 'poderes' | 'recursos' | 'bendiciones' | 'derivadosSet' | 'bonosAtributos' | 'clavos'

// A character as it arrives from the wire: an API older than T11 (parallel worktrees in development) does not send the Mistborn fields
type CharacterWire = Omit<Character, MistbornFields> & Partial<Pick<Character, MistbornFields>>

/**
 * Gives every character response the Mistborn fields with their empty value (§5.4), so that `poderes.some(...)`,
 * `poderes.length` or `recursos[...]` never break against an API without them. Applied to every character response.
 */
export const normalizeCharacter = (c: CharacterWire): Character => ({
  ...c,
  caminoMetal: c.caminoMetal ?? '',
  caminoInicial: c.caminoInicial ?? '',
  poderes: c.poderes ?? [],
  recursos: c.recursos ?? {},
  bendiciones: c.bendiciones ?? [],
  derivadosSet: c.derivadosSet ?? {},
  bonosAtributos: c.bonosAtributos ?? {},
  clavos: c.clavos ?? [],
})

export const charactersApi = {
  getAll: (campaignId: number) =>
    client.get<CharacterWire[]>(`/campaigns/${campaignId}/characters`).then((r) => r.data.map(normalizeCharacter)),

  getById: (campaignId: number, characterId: number, enCombate = false) =>
    client
      .get<CharacterWire>(`/campaigns/${campaignId}/characters/${characterId}`, {
        params: enCombate ? { enCombate: true } : undefined,
      })
      .then((r) => normalizeCharacter(r.data)),

  create: (campaignId: number, data: CreateCharacterRequest) =>
    client.post<CharacterWire>(`/campaigns/${campaignId}/characters`, data).then((r) => normalizeCharacter(r.data)),

  update: (campaignId: number, characterId: number, data: UpdateCharacterRequest) =>
    client.put<CharacterWire>(`/campaigns/${campaignId}/characters/${characterId}`, data).then((r) => normalizeCharacter(r.data)),

  delete: (campaignId: number, characterId: number) =>
    client.delete(`/campaigns/${campaignId}/characters/${characterId}`),

  assign: (campaignId: number, characterId: number, ownerId: number | null) =>
    client.put<CharacterWire>(`/campaigns/${campaignId}/characters/${characterId}/assign`, { ownerId }).then((r) => normalizeCharacter(r.data)),

  // Table state of Nacidos de la bruma (§5.2). The three calls answer with the character computed OUT of combat (default
  // game context): with a cache entry whose `enCombate` is true, invalidate it instead of replacing it with the response (§2).

  /** PATCH …/recursos: only the keys that are present are written (Investiture, atium counts, arquillas; charges, vials, Desprovisto, Completo, Componedor per power). Stormlight answers 400 */
  patchRecursos: (campaignId: number, characterId: number, body: RecursosPatch) =>
    client.patch<CharacterWire>(`/campaigns/${campaignId}/characters/${characterId}/recursos`, body).then((r) => normalizeCharacter(r.data)),

  /** POST …/acciones/beber-vial: drinks a vial with these metal ids (L.129-130 / PDF 135-136) */
  beberVial: (campaignId: number, characterId: number, metales: string[]) =>
    client.post<CharacterWire>(`/campaigns/${campaignId}/characters/${characterId}/acciones/beber-vial`, { metales }).then((r) => normalizeCharacter(r.data)),

  /** POST …/acciones/inicio-escena: Investiture to its maximum, or to 1 if the character is Sorprendido (L.129 / PDF 135) */
  inicioEscena: (campaignId: number, characterId: number, sorprendido: boolean) =>
    client.post<CharacterWire>(`/campaigns/${campaignId}/characters/${characterId}/acciones/inicio-escena`, { sorprendido }).then((r) => normalizeCharacter(r.data)),
}
