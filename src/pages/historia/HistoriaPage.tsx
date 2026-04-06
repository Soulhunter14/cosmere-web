import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { DiarioPage } from '../diario/DiarioPage'
import { SessionsPage } from '../sessions/SessionsPage'
import { NotasPage } from './NotasPage'
import { notesApi } from '../../api/notes'
import { useCampaignStore } from '../../store/campaignStore'

const TABS = [
  { id: 'diario', label: 'Diario' },
  { id: 'sessions', label: 'Calendario' },
  { id: 'notas', label: 'Notas' },
] as const

type Tab = typeof TABS[number]['id']

export function HistoriaPage() {
  const [activeTab, setActiveTab] = useState<Tab>('diario')
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const { isGm } = useCampaignStore()

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', cId],
    queryFn: () => notesApi.getAll(cId),
    enabled: !isGm,
  })

  const unreadCount = notes.filter((n) => !n.isRead).length

  return (
    <div>
      <div style={{
        display: 'flex', gap: 4,
        padding: '12px 16px 0',
        maxWidth: 680, margin: '0 auto',
      }}>
        {TABS.map((tab) => {
          const isNotasTab = tab.id === 'notas'
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative',
                padding: '7px 16px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: 700,
                transition: 'all 0.15s',
                background: isActive ? 'rgba(180,190,254,0.12)' : 'transparent',
                color: isActive ? 'var(--brand-light)' : 'var(--text-subtle)',
                outline: isActive ? '1px solid rgba(180,190,254,0.2)' : '1px solid transparent',
              }}
            >
              {tab.label}
              {isNotasTab && !isGm && unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 2,
                  minWidth: 16, height: 16, borderRadius: 8,
                  background: 'var(--brand)',
                  color: 'white', fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 4px',
                }}>
                  {unreadCount}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {activeTab === 'diario' && <DiarioPage />}
      {activeTab === 'sessions' && <SessionsPage />}
      {activeTab === 'notas' && <NotasPage />}
    </div>
  )
}
