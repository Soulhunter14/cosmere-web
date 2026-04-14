import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Target, ArrowRight } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { Spinner } from '../../components/ui'
import type { Character } from '../../types'
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

// ─── Character selector card ───────────────────────────────────────────────

function CharacterSelectCard({ character, onSelect }: { character: Character; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  const gradient = AVATAR_GRADIENTS[character.id % AVATAR_GRADIENTS.length]

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 16, cursor: 'pointer',
        background: 'var(--surface-1)',
        border: `1px solid ${hovered ? 'rgba(180,190,254,0.2)' : 'var(--border)'}`,
        transform: hovered ? 'translateX(3px)' : 'translateX(0)',
        boxShadow: hovered ? '0 4px 24px rgba(0,0,0,0.2)' : 'none',
        transition: 'transform 0.18s cubic-bezier(.22,.68,0,1.2), box-shadow 0.18s ease, border-color 0.18s ease',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 13, background: gradient, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, fontWeight: 800, color: 'white',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.25)' : 'none',
        transition: 'box-shadow 0.18s ease',
      }}>
        {character.name[0].toUpperCase()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{character.name}</span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: 'var(--brand-light)',
            background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.15)',
            borderRadius: 6, padding: '1px 6px',
          }}>
            Nv.{character.level}
          </span>
        </div>

        {(character.caminoHeroico || character.caminoRadiante) && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {(() => {
              const path = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
              return path ? (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: path.colorBg, border: `1px solid ${path.colorBorder}`, color: path.color }}>
                  {path.icon} {path.name}
                </span>
              ) : null
            })()}
            {(() => {
              const order = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)
              return order ? (
                <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: order.colorBg, border: `1px solid ${order.colorBorder}`, color: order.color, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                  <RadiantOrderIcon orderId={order.id} size={10} />
                  {order.name}
                </span>
              ) : null
            })()}
          </div>
        )}
      </div>

      <ArrowRight
        size={15}
        style={{
          flexShrink: 0,
          color: hovered ? 'var(--brand-light)' : 'var(--text-subtle)',
          transform: hovered ? 'translateX(2px)' : 'translateX(0)',
          transition: 'transform 0.18s cubic-bezier(.22,.68,0,1.2), color 0.15s',
        }}
      />
    </div>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────

export function MetasPage({ detailBasePath = 'personajes/metas' }: { detailBasePath?: string } = {}) {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const { isGm } = useCampaignStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters', cId],
    queryFn: () => charactersApi.getAll(cId),
  })

  if (isLoading) return <Spinner />

  const visibleCharacters = isGm
    ? characters
    : characters.filter((c) => c.ownerId === user?.id)

  const goToDetail = (character: Character) =>
    navigate(`/campaigns/${cId}/${detailBasePath}/${character.id}`)

  // Single-character player goes straight to detail
  if (!isGm && visibleCharacters.length === 1) {
    goToDetail(visibleCharacters[0])
    return <Spinner />
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 48px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
          Metas
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Selecciona un personaje para ver sus metas
        </p>
      </div>

      {visibleCharacters.length === 0 ? (
        <div style={{ border: '1.5px dashed var(--border-bright)', borderRadius: 20, padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)' }}>
          <Target size={24} style={{ color: 'var(--text-subtle)', margin: '0 auto 14px', display: 'block' }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Sin personajes</h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', margin: 0 }}>Crea un personaje primero para empezar a registrar metas.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visibleCharacters.map((character) => (
            <CharacterSelectCard
              key={character.id}
              character={character}
              onSelect={() => goToDetail(character)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
