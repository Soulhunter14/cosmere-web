import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useQuery } from '@tanstack/react-query'
import type { CampaignDetail, Character, Era, WorldId } from '../types'
import { getWorld } from '../worlds'
import type { WorldConfig } from '../worlds/types'

interface CampaignState {
  currentCampaign: CampaignDetail | null
  setCurrentCampaign: (campaign: CampaignDetail | null) => void
  isGm: boolean
  /**
   * `tema.dataWorld` of the current campaign's world: `null` (no data-world attribute on <html>) or the world id.
   * Persisted so that the pre-paint script of index.html can read it without knowing any world id (§7.2, T07).
   */
  dataWorld: WorldId | null
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set) => ({
      currentCampaign: null,
      isGm: false,
      dataWorld: null,
      setCurrentCampaign: (campaign) =>
        set({
          currentCampaign: campaign,
          isGm: campaign?.role === 'gm',
          dataWorld: getWorld(campaign?.world).tema.dataWorld,
        }),
    }),
    {
      name: 'cosmere-campaign',
      partialize: (s) => ({ currentCampaign: s.currentCampaign, isGm: s.isGm, dataWorld: s.dataWorld }),
    }
  )
)

// Era of the current campaign. `null` in Stormlight and also when the persisted campaign (localStorage) predates eras.
export const useEra = (): Era | null => useCampaignStore((s) => s.currentCampaign?.era ?? null)

// Whether a field of the character is locked for the viewer because the campaign has started (src/lib/cierreCampana.ts). The director
// always edits, so for them nothing is locked. Returns a function so the sheet asks field by field with a single hook
export function useCampoCerrado(): (campo: keyof Character) => boolean {
  const isGm = useCampaignStore((s) => s.isGm)
  const iniciada = useCampaignStore((s) => !!s.currentCampaign?.iniciadaEn)
  const campos = useCampaignStore((s) => s.currentCampaign?.camposDeCierre)
  return (campo) => !isGm && iniciada && (campos ?? []).includes(campo)
}

// World of the current campaign. getWorld resolves '', null, undefined and unknown ids (e.g. a campaign persisted
// before worlds existed) to Stormlight, so no world literal is needed here.
export const useWorld = (): WorldId => useCampaignStore((s) => getWorld(s.currentCampaign?.world).id)

// Light, synchronous configuration of the current campaign's world (capabilities, labels, tables, theme, icons).
export const useWorldConfig = (): WorldConfig => getWorld(useWorld())

// Heavy, lazy data of the current campaign's world, cached forever. `initialData`: where the data already travel in
// the main bundle (Stormlight, `syncData`) `isPending` is false from the first render, so no new Spinner appears (P1);
// only a world without `syncData` loads through `import()`. `structuralSharing: false`: the data are large and immutable.
// `networkMode: 'always'`: an `import()` is not a network request as far as TanStack is concerned (the PWA precaches the chunk),
// but with the default mode it would pause, with no error, whenever the browser is offline and the pages that wait for the data
// (Aventuras and Combate, T23) would stay on their Spinner (same reasoning as the campaign query of AppLayout).
export function useWorldData() {
  const cfg = useWorldConfig()
  return useQuery({
    queryKey: ['world-data', cfg.id],
    queryFn: cfg.loadData,
    initialData: cfg.syncData,
    staleTime: Infinity,
    gcTime: Infinity,
    structuralSharing: false,
    networkMode: 'always',
  })
}
