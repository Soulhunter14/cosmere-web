import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, type CSSProperties } from 'react'
import { ShoppingBag, ArrowRight, Package } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { EmptyState, PageHeader, Spinner } from '../../components/ui'
import type { Character } from '../../types'
import { CharacterIdentityPills } from '../../components/CharacterIdentityPills'
import { characterGradient } from '../../lib/avatar'
import { cosmereImage } from '../../lib/cosmereAssets'
import { buttonReset, c, card, fs, page, radius, shadow, titleText } from '../../theme'
import { onGem } from '../../lib/hero'

/** Official sphere illustration (a diamond mark) next to the marcos count */
const MARCO_IMG = cosmereImage('esfera-marco-diamante')

function CharacterSelectCard({ character, onSelect }: { character: Character; onSelect: () => void }) {
  const [hovered, setHovered] = useState(false)
  const itemCount = (character.weapons?.length ?? 0) + (character.armor?.length ?? 0) + (character.equipment?.length ?? 0)
  const marcos = (character.marcosInfusas ?? 0) + (character.marcosOpacas ?? 0)

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="ui-card ui-card--interactive"
      style={{
        ...buttonReset,
        ...card,
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minHeight: 76,
        padding: '14px 16px',
        textAlign: 'left',
        color: c.text,
      }}
    >
      {/* Identity avatar: deep gemstone gradient by character id, white initial */}
      <span
        aria-hidden
        style={{
          width: 48,
          height: 48,
          borderRadius: radius.md,
          background: characterGradient(character.id),
          boxShadow: shadow[1],
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...titleText,
          fontSize: fs.xl,
          lineHeight: 1,
          color: onGem,
        }}
      >
        {character.name.charAt(0).toUpperCase()}
      </span>

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ ...titleText, fontSize: fs.md + 1, color: c.text, overflowWrap: 'anywhere' }}>{character.name}</span>

        <CharacterIdentityPills character={character} />

        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: fs.sm, color: c.muted }}>
          <span style={metaItem}>
            <Package size={14} aria-hidden style={{ color: c.subtle }} />
            {itemCount} objeto{itemCount !== 1 ? 's' : ''}
          </span>
          <span aria-hidden style={{ color: c.subtle }}>·</span>
          <span style={metaItem}>
            {MARCO_IMG && <img src={MARCO_IMG} alt="" width={16} height={16} style={{ width: 16, height: 16, objectFit: 'contain' }} />}
            {marcos} marco{marcos !== 1 ? 's' : ''}
          </span>
        </span>
      </span>

      <ArrowRight
        size={18}
        aria-hidden
        style={{
          color: hovered ? c.brand : c.subtle,
          transform: hovered ? 'translateX(3px)' : 'translateX(0)',
          transition: 'transform var(--dur-2) var(--ease-spring), color var(--dur-1)',
        }}
      />
    </button>
  )
}

const metaItem: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }

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

  const visible = isGm ? characters : characters.filter((ch) => ch.ownerId === user?.id)

  const goToDetail = (character: Character) =>
    navigate(`/campaigns/${cId}/${detailBasePath}/${character.id}`)

  if (visible.length === 1) {
    goToDetail(visible[0])
    return <Spinner />
  }

  return (
    <div style={{ ...page, paddingBottom: 48 }}>
      <PageHeader title="Bolsa" subtitle="Selecciona un personaje para ver su inventario" />

      {visible.length === 0 ? (
        <EmptyState
          icon={<ShoppingBag size={24} aria-hidden />}
          title="Sin personajes"
          description="Crea un personaje primero."
        />
      ) : (
        <ul role="list" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map((ch, i) => (
            <li key={ch.id} className="rise" style={{ '--i': i } as CSSProperties}>
              <CharacterSelectCard character={ch} onSelect={() => goToDetail(ch)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
