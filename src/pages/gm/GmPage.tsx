import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ChevronRight, Columns3, MapIcon, MessageSquare, Users } from 'lucide-react'
import { GmMessagesPage } from './GmMessagesPage'
import { CaminapiedrasPage } from './CaminapiedrasPage'
import { GlobalNpcListPage } from './GlobalNpcListPage'
import { Tabs, TabPanel } from '../../components/ui'
import { useWorldConfig } from '../../store/campaignStore'
import { c, font, fs, radius, shadow } from '../../theme'
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
  const { campaignId } = useParams<{ campaignId: string }>()
  const [selectedTab, setSelectedTab] = useState<Tab>('npcs')
  const { features } = useWorldConfig()
  const tabs = TABS.filter((tab) => !tab.feature || features[tab.feature])
  // A tab the world does not offer can never be the active one
  const activeTab = tabs.some((tab) => tab.id === selectedTab) ? selectedTab : tabs[0].id

  return (
    <div>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '16px 16px 0' }}>
        {/* Entry to the «Pantalla del director», the table screen for a tablet held sideways */}
        <Link
          to={`/campaigns/${campaignId}/pantalla`}
          className="ui-card ui-card--interactive"
          style={{
            display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12, padding: '14px 16px', borderRadius: radius.lg,
            background: 'linear-gradient(135deg, var(--rubi-bg), var(--surface-1) 72%)', border: '1px solid var(--gm-border)',
            boxShadow: shadow[1], color: c.text, textDecoration: 'none',
          }}
        >
          <span
            aria-hidden
            style={{
              width: 44, height: 44, flexShrink: 0, borderRadius: radius.md, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--rubi-bg)', border: '1px solid var(--rubi-border)', color: 'var(--gm)',
            }}
          >
            <Columns3 size={22} />
          </span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, lineHeight: 1.25 }}>Pantalla del director</span>
            <span style={{ display: 'block', fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>
              Para dirigir en la mesa con la tablet en horizontal: escena, encuentro, tiradas y bitácora.
            </span>
          </span>
          <ChevronRight size={20} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
        </Link>
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
