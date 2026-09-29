import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useMemo, type CSSProperties } from 'react'
import { Sparkles, ChevronRight, TriangleAlert } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { EmptyState, PageHeader, Spinner } from '../../components/ui'
import type { Character } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { buildTalentGraph, graphOptionsFromCharacter, talentBudget } from '../../lib/talentGraph'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'
import { HeroicPathIcon } from '../../components/GameIcons'
import { characterGradient } from '../../lib/avatar'
import { buttonReset, c, card, fs, page, pill, radius, shadow, titleText, tone, toneFrom } from '../../theme'
import { onGem } from '../../lib/hero'

/* White initial on the deep character gradient (lib/avatar: >= 10:1 on every palette), as in MetasPage/BolsaPage. */
const ON_GEM = onGem

function CharacterSelectCard({ character, onSelect }: { character: Character; onSelect: () => void }) {
  const path = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
  const order = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)

  // Book budget (shared engine, see lib/talentGraph.ts): allowed / used / excess / falta.
  const budget = useMemo(() => {
    const graph = buildTalentGraph(graphOptionsFromCharacter(character))
    return talentBudget(character, graph)
  }, [character])

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
      {/* Identity tile: same gemstone gradient as the character hero */}
      <span
        aria-hidden
        style={{
          ...titleText,
          width: 48,
          height: 48,
          flexShrink: 0,
          borderRadius: radius.md,
          background: characterGradient(character.id),
          boxShadow: shadow[1],
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: fs.xl,
          lineHeight: 1,
          color: ON_GEM,
        }}
      >
        {(character.name[0] ?? '?').toUpperCase()}
      </span>

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ ...titleText, fontSize: fs.md + 1, color: c.text, overflowWrap: 'anywhere' }}>
          {character.name}
        </span>

        {(path || order) && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {path && (
              <span style={pill(toneFrom(path.color))}>
                <HeroicPathIcon id={path.id} size={13} />
                {path.name}
              </span>
            )}
            {order && (
              <span style={{ ...pill(toneFrom(order.color)), paddingLeft: 4 }}>
                <RadiantOrderIcon orderId={order.id} size={16} decorative />
                {order.name}
              </span>
            )}
          </span>
        )}

        <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: fs.sm, color: c.muted, fontVariantNumeric: 'tabular-nums' }}>
            Nv. {character.level}
            <span aria-hidden style={{ margin: '0 6px', color: c.subtle }}>·</span>
            {budget.used}/{budget.allowed} talentos
          </span>
          {budget.excess > 0 ? (
            <span title={budget.excessDetail} style={pill(tone.topacio)}>
              <TriangleAlert size={13} aria-hidden />
              +{budget.excess} talento{budget.excess > 1 ? 's' : ''}
              <span className="sr-only"> de más: {budget.excessDetail}</span>
            </span>
          ) : budget.remaining > 0 ? (
            <span title={budget.excessDetail} style={pill(tone.zafiro)}>
              falta {budget.remaining}
              <span className="sr-only">: {budget.excessDetail}</span>
            </span>
          ) : null}
        </span>
      </span>

      <ChevronRight size={18} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
    </button>
  )
}

export function TalentosPage({ detailBasePath = 'personajes/talentos' }: { detailBasePath?: string } = {}) {
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
    <div style={{ ...page, paddingBottom: 48 }}>
      <PageHeader title="Talentos" subtitle="Selecciona un personaje para ver sus talentos" />

      {visible.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={24} aria-hidden />}
          title="Sin personajes"
          description="Crea un personaje primero."
        />
      ) : (
        <ul aria-label="Personajes" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map((ch, i) => (
            <li key={ch.id} className="rise" style={{ '--i': Math.min(i, 10) } as CSSProperties}>
              <CharacterSelectCard character={ch} onSelect={() => goToDetail(ch)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
