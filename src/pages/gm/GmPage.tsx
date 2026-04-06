import { useState } from 'react'
import { SideQuestListPage } from '../sidequests/SideQuestListPage'
import { MatchListPage } from '../matches/MatchListPage'
import { GmMessagesPage } from './GmMessagesPage'

const TABS = [
  { id: 'sidequests', label: 'Misiones' },
  { id: 'matches', label: 'Combates' },
  { id: 'messages', label: 'Mensajes' },
] as const

type Tab = typeof TABS[number]['id']

export function GmPage() {
  const [activeTab, setActiveTab] = useState<Tab>('sidequests')

  return (
    <div>
      <div style={{
        display: 'flex', gap: 4,
        padding: '12px 16px 0',
        maxWidth: 680, margin: '0 auto',
      }}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '7px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 700,
              transition: 'all 0.15s',
              background: activeTab === tab.id ? 'rgba(239,68,68,0.1)' : 'transparent',
              color: activeTab === tab.id ? '#f87171' : 'rgba(248,113,113,0.5)',
              outline: activeTab === tab.id ? '1px solid rgba(239,68,68,0.25)' : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'sidequests' && <SideQuestListPage />}
      {activeTab === 'matches' && <MatchListPage />}
      {activeTab === 'messages' && <GmMessagesPage />}
    </div>
  )
}
