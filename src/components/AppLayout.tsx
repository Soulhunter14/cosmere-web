import { useLayoutEffect } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { DiceRoller } from './DiceRoller'
import { Button, ErrorMessage, Spinner } from './ui'
import { useCampaignStore, useWorldConfig } from '../store/campaignStore'
import { applyTheme, useThemeStore } from '../store/themeStore'
import { campaignsApi } from '../api/campaigns'
import { page } from '../theme'

export function AppLayout() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const id = Number(campaignId)
  const validId = Number.isFinite(id) && id > 0

  const currentCampaign = useCampaignStore((s) => s.currentCampaign)
  const setCurrentCampaign = useCampaignStore((s) => s.setCurrentCampaign)
  const cfg = useWorldConfig()

  // Same query as CampaignSettingsPage. `networkMode: 'always'`: without it TanStack pauses the query (no error, so no
  // «Reintentar») once the browser has gone offline; here a failed request must end in the error state below.
  const { data, isError, refetch } = useQuery({
    queryKey: ['campaign', id],
    queryFn: () => campaignsApi.getById(id),
    enabled: validId,
    networkMode: 'always',
  })

  // TanStack v5 has no `onSuccess` in useQuery: the store follows `data` from an effect. A layout effect, so that when
  // the campaign is already cached the store is written before the first paint (no Spinner frame in between).
  useLayoutEffect(() => {
    if (data) setCurrentCampaign(data)
  }, [data, setCurrentCampaign])

  // Gate: what the pages read (`isGm`, the world through `useWorld`) is the persisted campaign of the last session, so
  // nothing that depends on it renders until the store holds the campaign of this URL. Persisted campaign = URL
  // campaign (reload, or arriving from the list, which stores the detail before navigating) → ready on the first render.
  const ready = currentCampaign?.id === id

  // Theme of the world (§7.2): `data-world` on <html> only while the URL campaign is the current one and its world has a
  // theme of its own (`tema.dataWorld`). A world without one gets no attribute at all (not even an empty one), so no
  // token changes. `applyTheme` runs again because it only runs when the mode changes and the meta theme-color would
  // keep the previous colour; the cleanup (leaving the campaign, or switching to another one) puts <html> and the meta back.
  const dataWorld = ready ? cfg.tema.dataWorld : null
  useLayoutEffect(() => {
    const root = document.documentElement
    const sync = () => applyTheme(useThemeStore.getState().mode)
    if (dataWorld) root.dataset.world = dataWorld
    else delete root.dataset.world
    sync()
    return () => {
      delete root.dataset.world
      sync()
    }
  }, [dataWorld])

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      <a href="#main" className="skip-link">Saltar al contenido</a>
      {/* Sidebar and DiceRoller read `isGm` and the campaign from the store: not before the gate opens */}
      {ready && <Sidebar />}
      {/* .app-main clears the fixed mobile top bar / bottom nav (+ safe areas); no offsets from 640px */}
      <main id="main" tabIndex={-1} className="app-main" style={{ flex: 1, minWidth: 0, outline: 'none' }}>
        {ready ? (
          /* key: replays the entrance animation on every route change */
          <div key={pathname} className="fade-in">
            <Outlet />
          </div>
        ) : isError || !validId ? (
          <div style={{ ...page, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <ErrorMessage message={validId ? 'No se pudo cargar la campaña.' : 'La campaña no existe.'} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {validId && (
                <Button onClick={() => refetch()} icon={<RefreshCw size={15} aria-hidden />}>
                  Reintentar
                </Button>
              )}
              <Button variant="secondary" onClick={() => navigate('/campaigns')}>
                Volver a campañas
              </Button>
            </div>
          </div>
        ) : (
          <Spinner label="Cargando campaña…" />
        )}
      </main>
      {ready && <DiceRoller />}
    </div>
  )
}
