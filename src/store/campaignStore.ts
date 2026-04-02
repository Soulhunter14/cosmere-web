import { create } from 'zustand'
import type { CampaignDetail } from '../types'

interface CampaignState {
  currentCampaign: CampaignDetail | null
  setCurrentCampaign: (campaign: CampaignDetail | null) => void
  isGm: boolean
}

export const useCampaignStore = create<CampaignState>((set) => ({
  currentCampaign: null,
  isGm: false,
  setCurrentCampaign: (campaign) =>
    set({ currentCampaign: campaign, isGm: campaign?.role === 'gm' }),
}))
