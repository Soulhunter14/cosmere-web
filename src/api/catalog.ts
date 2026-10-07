import client from './client'
import type { WeaponCatalog, ArmorCatalog, GearItem, CatalogOption } from '../types'

export interface CreateWeaponPayload {
  name: string
  weaponTypeId: number
  skillId: number
  damageDiceCount: number
  damageDiceValue: number
  damageTypeId: number
  rangeId: number
  traitIds: number[]
  expertTraitIds: number[]
  description: string
  weight: number
  /** Only a world with a priced catalog sends it (`features.catalogoDePrecios`); absent, the server stores no price */
  price?: number | null
  /** Idem: absent = false */
  isRewardOnly?: boolean
}

export interface CreateArmorPayload {
  name: string
  armorTypeId: number
  desvio: number
  traitIds: number[]
  expertTraitIds: number[]
  description: string
  weight: number
  price?: number | null
  isRewardOnly?: boolean
}

/**
 * The catalog is served by campaign: `campaignId` selects the world (and, in Mistborn, the era) whose items and options come back, and the
 * writes require the director of that campaign (T39b). Without it the server answers the Stormlight catalog (clients that predate worlds).
 * `params: { campaignId }` drops an `undefined` value, so the legacy request keeps its exact URL.
 * Wrap these in an arrow when they are a `queryFn` (`queryFn: () => catalogApi.getWeapons(cId)`): TanStack calls a bare reference with its
 * `QueryFunctionContext` as the first argument, an object the server cannot bind as `campaignId`, so it would answer, without any error,
 * the Stormlight catalog (also to a Mistborn campaign).
 */
export const catalogApi = {
  getWeapons: (campaignId?: number) =>
    client.get<WeaponCatalog[]>('/catalog/weapons', { params: { campaignId } }).then((r) => r.data),
  getArmor: (campaignId?: number) =>
    client.get<ArmorCatalog[]>('/catalog/armor', { params: { campaignId } }).then((r) => r.data),
  getGear: (campaignId?: number) =>
    client.get<GearItem[]>('/catalog/gear', { params: { campaignId } }).then((r) => r.data),
  getOptions: (category: string, campaignId?: number) =>
    client.get<CatalogOption[]>(`/catalog/options/${category}`, { params: { campaignId } }).then((r) => r.data),
  createWeapon: (payload: CreateWeaponPayload & { campaignId: number }) =>
    client.post<WeaponCatalog>('/catalog/weapons', payload).then((r) => r.data),
  createArmor: (payload: CreateArmorPayload & { campaignId: number }) =>
    client.post<ArmorCatalog>('/catalog/armor', payload).then((r) => r.data),
  deleteWeapon: (id: number, campaignId: number) =>
    client.delete(`/catalog/weapons/${id}`, { params: { campaignId } }),
  deleteArmor: (id: number, campaignId: number) =>
    client.delete(`/catalog/armor/${id}`, { params: { campaignId } }),
  updateWeaponDescription: (id: number, description: string, campaignId: number) =>
    client.put(`/catalog/weapons/${id}/description`, { description }, { params: { campaignId } }),
  updateArmorDescription: (id: number, description: string, campaignId: number) =>
    client.put(`/catalog/armor/${id}/description`, { description }, { params: { campaignId } }),
  updateGearDescription: (id: number, description: string, campaignId: number) =>
    client.put(`/catalog/gear/${id}/description`, { description }, { params: { campaignId } }),
}
