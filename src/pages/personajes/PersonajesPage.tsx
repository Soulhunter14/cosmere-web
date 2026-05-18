import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Target, ArrowRight, BookOpen, Sparkles, ShoppingBag } from 'lucide-react'
import { CharacterListPage } from '../characters/CharacterListPage'
import { MetasPage } from './MetasPage'
import { TalentosPage } from './TalentosPage'
import { BolsaPage } from './BolsaPage'
import { Spinner } from '../../components/ui'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { charactersApi } from '../../api/characters'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#6366f1)',
  'linear-gradient(135deg,#0e7490,#0284c7)',
  'linear-gradient(135deg,#9d174d,#be185d)',
  'linear-gradient(135deg,#065f46,#0d9488)',
  'linear-gradient(135deg,#92400e,#b45309)',
  'linear-gradient(135deg,#4c1d95,#7c3aed)',
]

const GM_TABS = [
  { id: 'characters', label: 'Personajes' },
  { id: 'metas',     label: 'Metas' },
  { id: 'talentos',  label: 'Talentos' },
  { id: 'bolsa',     label: 'Bolsa' },
] as const

type GmTab = typeof GM_TABS[number]['id']

// ─── GM view: full character list + metas tabs ─────────────────────────────

function GmPersonajesView() {
  const [activeTab, setActiveTab] = useState<GmTab>('characters')

  return (
    <div>
      <div style={{
        display: 'flex', gap: 4,
        padding: '12px 16px 0',
        maxWidth: 680, margin: '0 auto',
      }}>
        {GM_TABS.map((tab) => (
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
      {activeTab === 'characters' && <CharacterListPage />}
      {activeTab === 'metas'     && <MetasPage />}
      {activeTab === 'talentos'  && <TalentosPage />}
      {activeTab === 'bolsa'     && <BolsaPage />}
    </div>
  )
}

// ─── Player view: personal landing with direct access ──────────────────────

function PlayerPersonajesPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters', cId],
    queryFn: () => charactersApi.getAll(cId),
  })

  if (isLoading) return <Spinner />

  const character = characters.find((c) => c.ownerId === user?.id) ?? null

  if (!character) {
    return (
      <div style={{ padding: '20px 16px 48px', maxWidth: 680, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
          Mi personaje
        </h1>
        <div style={{
          border: '1.5px dashed var(--border-bright)', borderRadius: 20,
          padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)', marginTop: 24,
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', margin: 0 }}>
            El GM aún no te ha asignado un personaje.
          </p>
        </div>
      </div>
    )
  }

  const gradient = AVATAR_GRADIENTS[character.id % AVATAR_GRADIENTS.length]
  const path = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
  const order = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)

  const activeMetas = character.metas?.filter((m) => m.estado === 'activa').length ?? 0

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 48px' }}>
      {/* Character identity block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 16, background: gradient, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 22, fontWeight: 800, color: 'white',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          {character.name[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: 2 }}>
            {character.name}
          </h1>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--brand-light)', background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.15)', borderRadius: 6, padding: '1px 6px' }}>
              Nv.{character.level}
            </span>
            {path && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: path.colorBg, border: `1px solid ${path.colorBorder}`, color: path.color }}>
                {path.icon} {path.name}
              </span>
            )}
            {order && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: order.colorBg, border: `1px solid ${order.colorBorder}`, color: order.color, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <RadiantOrderIcon orderId={order.id} size={10} />
                {order.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Character sheet card */}
        <button
          onClick={() => navigate(`/campaigns/${cId}/characters/${character.id}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
            background: 'var(--surface-1)', border: '1px solid var(--border)',
            textAlign: 'left', width: '100%',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(180,190,254,0.25)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12, background: gradient, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <BookOpen size={18} style={{ color: 'white' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>Mi ficha</p>
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>Atributos, habilidades, equipo y más</p>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
        </button>

        {/* Metas card */}
        <button
          onClick={() => navigate(`/campaigns/${cId}/personajes/metas/${character.id}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
            background: 'var(--surface-1)', border: '1px solid var(--border)',
            textAlign: 'left', width: '100%',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(180,190,254,0.25)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Target size={18} style={{ color: 'var(--brand-light)' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>Metas</p>
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>
              {activeMetas > 0 ? `${activeMetas} meta${activeMetas !== 1 ? 's' : ''} activa${activeMetas !== 1 ? 's' : ''}` : 'Objetivos de tu personaje'}
            </p>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
        </button>

        {/* Talentos card */}
        <button
          onClick={() => navigate(`/campaigns/${cId}/personajes/talentos/${character.id}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
            background: 'var(--surface-1)', border: '1px solid var(--border)',
            textAlign: 'left', width: '100%',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251,191,36,0.25)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sparkles size={18} style={{ color: '#fbbf24' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>Talentos</p>
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>Habilidades especiales de tu personaje</p>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
        </button>

        {/* Bolsa card */}
        <button
          onClick={() => navigate(`/campaigns/${cId}/personajes/bolsa/${character.id}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: '18px 20px', borderRadius: 16, cursor: 'pointer',
            background: 'var(--surface-1)', border: '1px solid var(--border)',
            textAlign: 'left', width: '100%',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShoppingBag size={18} style={{ color: '#34d399' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', margin: '0 0 2px' }}>Bolsa</p>
            <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0 }}>Inventario, marcos y equipo</p>
          </div>
          <ArrowRight size={15} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
        </button>
      </div>
    </div>
  )
}

// ─── Root export ───────────────────────────────────────────────────────────

export function PersonajesPage() {
  const { isGm } = useCampaignStore()

  if (!isGm) return <PlayerPersonajesPage />
  return <GmPersonajesView />
}
