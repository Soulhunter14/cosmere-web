import { useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useCampaignStore } from '../store/campaignStore'
import { campaignsApi } from '../api/campaigns'

export function AppLayout() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { setCurrentCampaign } = useCampaignStore()

  useEffect(() => {
    const id = Number(campaignId)
    if (!id) return
    campaignsApi.getById(id).then(setCurrentCampaign).catch(() => {})
  }, [campaignId])

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      {/*
        sm:pt-0      — desktop has no top bar
        pt-[52px]    — mobile: clear the fixed top bar (52px)
        sm:pb-0      — desktop: no bottom nav
        pb-[60px]    — mobile: clear the fixed bottom nav (60px)
      */}
      <main className="app-main flex-1 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
