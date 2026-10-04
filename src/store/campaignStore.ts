import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CampaignDetail, Era } from '../types'

interface CampaignState {
  currentCampaign: CampaignDetail | null
  setCurrentCampaign: (campaign: CampaignDetail | null) => void
  isGm: boolean
}

export const useCampaignStore = create<CampaignState>()(
  persist(
    (set) => ({
      currentCampaign: null,
      isGm: false,
      setCurrentCampaign: (campaign) =>
        set({ currentCampaign: campaign, isGm: campaign?.role === 'gm' }),
    }),
    { name: 'cosmere-campaign', partialize: (s) => ({ currentCampaign: s.currentCampaign, isGm: s.isGm }) }
  )
)

// Era of the current campaign. `null` in Stormlight and also when the persisted campaign (localStorage) predates eras.
export const useEra = (): Era | null => useCampaignStore((s) => s.currentCampaign?.era ?? null)
