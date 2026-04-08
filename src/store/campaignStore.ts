import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CampaignDetail } from '../types'

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
