import { useState } from 'react'
import { MapIcon, MessageSquare, Users } from 'lucide-react'
import { GmMessagesPage } from './GmMessagesPage'
import { CaminapiedrasPage } from './CaminapiedrasPage'
import { GlobalNpcListPage } from './GlobalNpcListPage'
import { Tabs, TabPanel } from '../../components/ui'

const TABS = [
  { id: 'npcs', label: 'NPCs' },
  { id: 'messages', label: 'Mensajes' },
  { id: 'caminapiedras', label: 'Aventura' },
] as const

type Tab = typeof TABS[number]['id']

const TAB_ICONS: Record<Tab, typeof Users> = {
  npcs: Users,
  messages: MessageSquare,
  caminapiedras: MapIcon,
}

const ID_PREFIX = 'gm'

export function GmPage() {
  const [activeTab, setActiveTab] = useState<Tab>('npcs')

  return (
    <div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 0' }}>
        <Tabs<Tab>
          idPrefix={ID_PREFIX}
          ariaLabel="Secciones del director"
          value={activeTab}
          onChange={setActiveTab}
          stretch
          tone="rubi"
          /* Director area identity: rubí frame, glyphs and selected label */
          style={{ border: '1px solid var(--gm-border)' }}
          tabs={TABS.map((tab) => {
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
