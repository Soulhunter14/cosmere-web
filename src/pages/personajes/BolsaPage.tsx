import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ShoppingBag, ArrowRight } from 'lucide-react'
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

function CharacterSelectCard({ character, onSelect }: { character: Character; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  const gradient = AVATAR_GRADIENTS[character.id % AVATAR_GRADIENTS.length]
  const path = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
  const order = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)
  const itemCount = (character.weapons?.length ?? 0) + (character.armor?.length ?? 0) + (character.equipment?.length ?? 0)
  const marcos = (character.marcosInfusas ?? 0) + (character.marcosOpacas ?? 0)

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
      }}>
        {character.name[0].toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{character.name}</span>
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
        <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>
          {itemCount} objeto{itemCount !== 1 ? 's' : ''} · {marcos} marco{marcos !== 1 ? 's' : ''}
        </span>
      </div>
      <ArrowRight size={15} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
    </div>
  )
}

export function BolsaPage({ detailBasePath = 'personajes/bolsa' }: { detailBasePath?: string } = {}) {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { isGm } = useCampaignStore()

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ['characters', cId],
    queryFn: () => charactersApi.getAll(cId),
  })

  if (isLoading) return <Spinner />

  const visible = isGm ? characters : characters.filter((c) => c.ownerId === user?.id)

  const goToDetail = (character: Character) =>
    navigate(`/campaigns/${cId}/${detailBasePath}/${character.id}`)

  if (visible.length === 1) {
    goToDetail(visible[0])
    return <Spinner />
  }

  return (
    <div style={{ padding: '20px 16px 48px', maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
          Bolsa
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
          Selecciona un personaje para ver su inventario
        </p>
      </div>

      {visible.length === 0 ? (
        <div style={{ border: '1.5px dashed var(--border-bright)', borderRadius: 20, padding: '52px 32px', textAlign: 'center', background: 'var(--surface-1)' }}>
          <ShoppingBag size={24} style={{ color: 'var(--text-subtle)', margin: '0 auto 14px', display: 'block' }} />
          <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>Sin personajes</h3>
          <p style={{ fontSize: 13, color: 'var(--text-subtle)', margin: 0 }}>Crea un personaje primero.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {visible.map((c) => (
            <CharacterSelectCard key={c.id} character={c} onSelect={() => goToDetail(c)} />
          ))}
        </div>
      )}
    </div>
  )
}
