import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useMemo, type CSSProperties } from 'react'
import { Sparkles, ChevronRight, RefreshCw, TriangleAlert } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore, useWorldData } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { Button, EmptyState, ErrorMessage, PageHeader, Spinner } from '../../components/ui'
import type { Character } from '../../types'
import { buildTalentGraph, graphOptionsFromCharacter, talentBudget } from '../../lib/talentGraph'
import type { TalentRules } from '../../lib/talentRules'
import { CharacterIdentityPills } from '../../components/CharacterIdentityPills'
import { characterGradient } from '../../lib/avatar'
import { buttonReset, c, card, fs, page, pill, radius, shadow, titleText, tone } from '../../theme'
import { onGem } from '../../lib/hero'

/* White initial on the deep character gradient (lib/avatar: >= 10:1 on every palette), as in MetasPage/BolsaPage. */
const ON_GEM = onGem

function CharacterSelectCard({ character, rules, onSelect }: { character: Character; rules: TalentRules; onSelect: () => void }) {
  // Book budget (shared engine, see lib/talentGraph.ts): allowed / used / excess / falta. The graph is the one of the world's rules.
  const budget = useMemo(() => {
    const graph = buildTalentGraph(graphOptionsFromCharacter(character, [], rules), rules)
    return talentBudget(character, graph)
  }, [character, rules])

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

        <CharacterIdentityPills character={character} />

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
  // The talent data of the world of the campaign. Stormlight's are `initialData` of useWorldData, so there it never waits (no new
  // Spinner); Mistborn's come with the lazy chunk of its world
  const { data: worldData, isPending: worldPending } = useWorldData()
  const rules = worldData?.talentos ?? null

  if (isLoading || worldPending) return <Spinner />

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
      ) : !rules ? (
        // The chunk did not load: never budget the characters with the rules of another world. A failed `import()` stays failed for the
        // rest of the document (the browser keeps the failure), so a `refetch()` could not recover it: only reloading the page does
        <div>
          <ErrorMessage message="No se pudieron cargar los talentos." style={{ marginBottom: 16 }} />
          <Button onClick={() => window.location.reload()} icon={<RefreshCw size={15} aria-hidden />}>
            Recargar la página
          </Button>
        </div>
      ) : (
        <ul aria-label="Personajes" style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visible.map((ch, i) => (
            <li key={ch.id} className="rise" style={{ '--i': Math.min(i, 10) } as CSSProperties}>
              <CharacterSelectCard character={ch} rules={rules} onSelect={() => goToDetail(ch)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
