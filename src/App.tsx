import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { CampaignListPage } from './pages/campaigns/CampaignListPage'
import { CampaignSettingsPage } from './pages/campaigns/CampaignSettingsPage'
import { CharacterDetailPage } from './pages/characters/CharacterDetailPage'
import { GlobalNpcDetailPage } from './pages/gm/GlobalNpcDetailPage'
import { CatalogPage } from './pages/catalog/CatalogPage'
import { EncyclopediaPage } from './pages/encyclopedia/EncyclopediaPage'
import { RadiantOrdersPage } from './pages/encyclopedia/RadiantOrdersPage'
import { HeroicPathsPage } from './pages/encyclopedia/HeroicPathsPage'
import { CombatPage } from './pages/encyclopedia/CombatPage'
import { AventurasPage } from './pages/encyclopedia/AventurasPage'
import { PotenciasPage } from './pages/encyclopedia/PotenciasPage'
import { HomeCampaignPage } from './pages/home/HomeCampaignPage'
import { PersonajesPage } from './pages/personajes/PersonajesPage'
import { HistoriaPage } from './pages/historia/HistoriaPage'
import { GmPage } from './pages/gm/GmPage'

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
})

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/campaigns" element={<CampaignListPage />} />

            <Route path="/campaigns/:campaignId" element={<AppLayout />}>
              <Route index element={<Navigate to="home" replace />} />
              <Route path="home" element={<HomeCampaignPage />} />
              <Route path="personajes" element={<PersonajesPage />} />
              <Route path="historia" element={<HistoriaPage />} />
              <Route path="encyclopedia" element={<EncyclopediaPage />} />
              <Route path="encyclopedia/radiant-orders" element={<RadiantOrdersPage />} />
              <Route path="encyclopedia/heroic-paths" element={<HeroicPathsPage />} />
              <Route path="encyclopedia/combat" element={<CombatPage />} />
              <Route path="encyclopedia/aventuras" element={<AventurasPage />} />
              <Route path="encyclopedia/potencias" element={<PotenciasPage />} />
              <Route path="gm" element={<GmPage />} />
              <Route path="settings" element={<CampaignSettingsPage />} />
              {/* Detail routes — kept for direct navigation from list pages */}
              <Route path="characters/:characterId" element={<CharacterDetailPage />} />
              <Route path="global-npcs/:npcId" element={<GlobalNpcDetailPage />} />
              <Route path="catalog" element={<CatalogPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/campaigns" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
