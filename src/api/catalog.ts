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
}

export interface CreateArmorPayload {
  name: string
  armorTypeId: number
  desvio: number
  traitIds: number[]
  expertTraitIds: number[]
}

export const catalogApi = {
  getWeapons: () => client.get<WeaponCatalog[]>('/catalog/weapons').then((r) => r.data),
  getArmor: () => client.get<ArmorCatalog[]>('/catalog/armor').then((r) => r.data),
  getGear: () => client.get<GearItem[]>('/catalog/gear').then((r) => r.data),
  getOptions: (category: string) =>
    client.get<CatalogOption[]>(`/catalog/options/${category}`).then((r) => r.data),
  createWeapon: (payload: CreateWeaponPayload) =>
    client.post<WeaponCatalog>('/catalog/weapons', payload).then((r) => r.data),
  createArmor: (payload: CreateArmorPayload) =>
    client.post<ArmorCatalog>('/catalog/armor', payload).then((r) => r.data),
  deleteWeapon: (id: number) => client.delete(`/catalog/weapons/${id}`),
  deleteArmor: (id: number) => client.delete(`/catalog/armor/${id}`),
}
