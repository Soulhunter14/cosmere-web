import client from './client'
import type { WeaponCatalog, ArmorCatalog, GearItem, CatalogOption } from '../types'

export const catalogApi = {
  getWeapons: () => client.get<WeaponCatalog[]>('/catalog/weapons').then((r) => r.data),
  getArmor: () => client.get<ArmorCatalog[]>('/catalog/armor').then((r) => r.data),
  getGear: () => client.get<GearItem[]>('/catalog/gear').then((r) => r.data),
  getOptions: (category: string) =>
    client.get<CatalogOption[]>(`/catalog/options/${category}`).then((r) => r.data),
  reimport: () => client.post('/catalog/reimport'),
}
