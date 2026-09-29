import { useState, useSyncExternalStore } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BookOpenText, CalendarDays, Mail, Users, type LucideIcon } from 'lucide-react'
import { DiarioPage } from '../diario/DiarioPage'
import { SessionsPage } from '../sessions/SessionsPage'
import { NotasPage } from './NotasPage'
import { NpcNotesPage } from '../npcs/NpcNotesPage'
import { notesApi } from '../../api/notes'
import { useCampaignStore } from '../../store/campaignStore'
import { Tabs, TabPanel, type TabItem } from '../../components/ui'

const TABS = [
  { id: 'sessions', label: 'Calendario' },
  { id: 'npcs', label: 'NPCs' },
  { id: 'diario', label: 'Diario' },
  { id: 'notas', label: 'Mensajes' },
] as const

type Tab = typeof TABS[number]['id']

const TAB_ICONS: Record<Tab, LucideIcon> = {
  sessions: CalendarDays,
  npcs: Users,
  diario: BookOpenText,
  notas: Mail,
}

/* From 640px the tabs get icons and their regular size; on phones they shrink to fit the row. */
const WIDE_QUERY = '(min-width: 640px)'
const subscribeWide = (onChange: () => void) => {
  const mq = window.matchMedia(WIDE_QUERY)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}
const getWide = () => window.matchMedia(WIDE_QUERY).matches
const getWideServer = () => false

export function HistoriaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('sessions')
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const { isGm } = useCampaignStore()
  const wide = useSyncExternalStore(subscribeWide, getWide, getWideServer)

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', cId],
    queryFn: () => notesApi.getAll(cId),
    enabled: !isGm,
  })

  const unreadCount = notes.filter((n) => !n.isRead).length

  const tabs: TabItem<Tab>[] = TABS.map((tab) => {
    const Icon = TAB_ICONS[tab.id]
    // Unread badge on "Mensajes", players only
    const badge = tab.id === 'notas' && !isGm && unreadCount > 0 ? unreadCount : undefined
    return {
      id: tab.id,
      label: tab.label,
      // Explicit name so every screen reader announces the count ("Mensajes 3 sin leer"), not "Mensajes3"
      ariaLabel: badge ? `${tab.label} ${badge} sin leer` : undefined,
      icon: wide ? <Icon size={16} aria-hidden /> : undefined,
      badge,
    }
  })

  return (
    <div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 0' }}>
        <Tabs
          tabs={tabs}
          value={activeTab}
          onChange={setActiveTab}
          ariaLabel="Partida"
          idPrefix="historia"
          stretch={!wide}
          size={wide ? 'md' : 'sm'}
        />
      </div>
      <TabPanel idPrefix="historia" id={activeTab}>
        {activeTab === 'diario' && <DiarioPage />}
        {activeTab === 'sessions' && <SessionsPage />}
        {activeTab === 'notas' && <NotasPage />}
        {activeTab === 'npcs' && <NpcNotesPage />}
      </TabPanel>
    </div>
  )
}
