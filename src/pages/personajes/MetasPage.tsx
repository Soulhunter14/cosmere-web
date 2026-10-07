import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import type { CSSProperties } from 'react'
import { Target, ChevronRight } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { EmptyState, PageHeader, Spinner } from '../../components/ui'
import type { Character } from '../../types'
import { CharacterIdentityPills } from '../../components/CharacterIdentityPills'
import { characterGradient } from '../../lib/avatar'
import { buttonReset, c, card, fs, page, radius, shadow, titleText } from '../../theme'
import { onGem } from '../../lib/hero'

/* White initial on the deep character gradient (lib/avatar: ≥ 10:1 on every palette). */
const ON_GEM = onGem

// ─── Character selector card (same list-row look as TalentosPage, BolsaPage and CharacterListPage) ─

function CharacterSelectCard({ character, onSelect }: { character: Character; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
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
      }}
    >
      {/* Identity tile: the character's gemstone gradient */}
      <span
        aria-hidden
        style={{
          ...titleText,
          width: 48, height: 48, flexShrink: 0, borderRadius: radius.md,
          background: characterGradient(character.id), boxShadow: shadow[1],
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontSize: fs.xl, lineHeight: 1, color: ON_GEM,
        }}
      >
        {character.name.charAt(0).toUpperCase() || '?'}
      </span>

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ ...titleText, fontSize: fs.md + 1, color: c.text, overflowWrap: 'anywhere' }}>{character.name}</span>

        <CharacterIdentityPills character={character} />

        <span style={{ fontSize: fs.sm, color: c.muted, fontVariantNumeric: 'tabular-nums' }}>Nv. {character.level}</span>
      </span>

      <ChevronRight size={18} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
    </button>
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
    <div style={{ ...page, paddingBottom: 48 }}>
      <PageHeader title="Metas" subtitle="Selecciona un personaje para ver sus metas" />

      {visibleCharacters.length === 0 ? (
        <EmptyState
          icon={<Target size={22} aria-hidden />}
          title="Sin personajes"
          description="Crea un personaje primero para empezar a registrar metas."
        />
      ) : (
        <ul aria-label="Personajes" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleCharacters.map((character, i) => (
            <li key={character.id} className="rise" style={{ '--i': Math.min(i, 10) } as CSSProperties}>
              <CharacterSelectCard character={character} onSelect={() => goToDetail(character)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
