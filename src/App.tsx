import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { CampaignListPage } from './pages/campaigns/CampaignListPage'
import { CampaignSettingsPage } from './pages/campaigns/CampaignSettingsPage'
import { CharacterListPage } from './pages/characters/CharacterListPage'
import { CharacterDetailPage } from './pages/characters/CharacterDetailPage'
import { NpcListPage } from './pages/npcs/NpcListPage'
import { NpcDetailPage } from './pages/npcs/NpcDetailPage'
import { MatchListPage } from './pages/matches/MatchListPage'
import { MatchDetailPage } from './pages/matches/MatchDetailPage'
import { SideQuestListPage } from './pages/sidequests/SideQuestListPage'
import { SideQuestDetailPage } from './pages/sidequests/SideQuestDetailPage'
import { CatalogPage } from './pages/catalog/CatalogPage'
import { EncyclopediaPage } from './pages/encyclopedia/EncyclopediaPage'
import { RadiantOrdersPage } from './pages/encyclopedia/RadiantOrdersPage'
import { HeroicPathsPage } from './pages/encyclopedia/HeroicPathsPage'
import { CombatPage } from './pages/encyclopedia/CombatPage'
import { DiarioPage } from './pages/diario/DiarioPage'
import { SessionsPage } from './pages/sessions/SessionsPage'

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
              <Route index element={<Navigate to="characters" replace />} />
              <Route path="settings" element={<CampaignSettingsPage />} />
              <Route path="characters" element={<CharacterListPage />} />
              <Route path="characters/:characterId" element={<CharacterDetailPage />} />
              <Route path="npcs" element={<NpcListPage />} />
              <Route path="npcs/:npcId" element={<NpcDetailPage />} />
              <Route path="matches" element={<MatchListPage />} />
              <Route path="matches/:matchId" element={<MatchDetailPage />} />
              <Route path="sidequests" element={<SideQuestListPage />} />
              <Route path="sidequests/:sideQuestId" element={<SideQuestDetailPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="encyclopedia" element={<EncyclopediaPage />} />
              <Route path="encyclopedia/radiant-orders" element={<RadiantOrdersPage />} />
              <Route path="encyclopedia/heroic-paths" element={<HeroicPathsPage />} />
              <Route path="encyclopedia/combat" element={<CombatPage />} />
              <Route path="diario" element={<DiarioPage />} />
              <Route path="sessions" element={<SessionsPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/campaigns" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
