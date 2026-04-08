import { useState } from 'react'
import { CharacterListPage } from '../characters/CharacterListPage'
import { NpcNotesPage } from '../npcs/NpcNotesPage'

const TABS = [
  { id: 'characters', label: 'Personajes' },
  { id: 'npcs', label: 'NPCs' },
] as const

type Tab = typeof TABS[number]['id']

export function PersonajesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('characters')

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
              background: activeTab === tab.id ? 'rgba(180,190,254,0.12)' : 'transparent',
              color: activeTab === tab.id ? 'var(--brand-light)' : 'var(--text-subtle)',
              outline: activeTab === tab.id ? '1px solid rgba(180,190,254,0.2)' : '1px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'characters' ? <CharacterListPage /> : <NpcNotesPage />}
    </div>
  )
}
