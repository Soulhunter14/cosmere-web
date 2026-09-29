import { useEffect } from 'react'
import { Outlet, useLocation, useParams } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { DiceRoller } from './DiceRoller'
import { useCampaignStore } from '../store/campaignStore'
import { campaignsApi } from '../api/campaigns'

export function AppLayout() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const { setCurrentCampaign } = useCampaignStore()
  const { pathname } = useLocation()

  useEffect(() => {
    const id = Number(campaignId)
    if (!id) return
    campaignsApi.getById(id).then(setCurrentCampaign).catch(() => {})
  }, [campaignId, setCurrentCampaign])

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <a href="#main" className="skip-link">Saltar al contenido</a>
      <Sidebar />
      {/* .app-main clears the fixed mobile top bar / bottom nav (+ safe areas); no offsets from 640px */}
      <main id="main" tabIndex={-1} className="app-main" style={{ flex: 1, minWidth: 0, outline: 'none' }}>
        {/* key: replays the entrance animation on every route change */}
        <div key={pathname} className="fade-in">
          <Outlet />
        </div>
      </main>
      <DiceRoller />
    </div>
  )
}
