import { useState } from 'react'
import { MapIcon, MessageSquare, Users } from 'lucide-react'
import { GmMessagesPage } from './GmMessagesPage'
import { CaminapiedrasPage } from './CaminapiedrasPage'
import { GlobalNpcListPage } from './GlobalNpcListPage'
import { Tabs, TabPanel } from '../../components/ui'
import { useWorldConfig } from '../../store/campaignStore'
import type { WorldConfig } from '../../worlds/types'

type Tab = 'npcs' | 'messages' | 'caminapiedras'

/** `feature`: the tab is only offered when the world of the campaign declares that capability (WorldConfig.features) */
const TABS: readonly { id: Tab; label: string; feature?: keyof WorldConfig['features'] }[] = [
  { id: 'npcs', label: 'NPCs' },
  { id: 'messages', label: 'Mensajes' },
  { id: 'caminapiedras', label: 'Aventura', feature: 'pestanaAventura' },
]

const TAB_ICONS: Record<Tab, typeof Users> = {
  npcs: Users,
  messages: MessageSquare,
  caminapiedras: MapIcon,
}

const ID_PREFIX = 'gm'

export function GmPage() {
  const [selectedTab, setSelectedTab] = useState<Tab>('npcs')
  const { features } = useWorldConfig()
  const tabs = TABS.filter((tab) => !tab.feature || features[tab.feature])
  // A tab the world does not offer can never be the active one
  const activeTab = tabs.some((tab) => tab.id === selectedTab) ? selectedTab : tabs[0].id

  return (
    <div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 0' }}>
        <Tabs<Tab>
          idPrefix={ID_PREFIX}
          ariaLabel="Secciones del director"
          value={activeTab}
          onChange={setSelectedTab}
          stretch
          tone="rubi"
          /* Director area identity: rubí frame, glyphs and selected label */
          style={{ border: '1px solid var(--gm-border)' }}
          tabs={tabs.map((tab) => {
            const Icon = TAB_ICONS[tab.id]
            return {
              id: tab.id,
              label: tab.label,
              icon: <Icon size={16} aria-hidden style={{ color: 'var(--gm)' }} />,
            }
          })}
        />
      </div>
      <TabPanel idPrefix={ID_PREFIX} id={activeTab}>
        {activeTab === 'npcs' && <GlobalNpcListPage />}
        {activeTab === 'messages' && <GmMessagesPage />}
        {activeTab === 'caminapiedras' && <CaminapiedrasPage />}
      </TabPanel>
    </div>
  )
}
