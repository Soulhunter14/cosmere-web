import { lazy, Suspense, useState, type CSSProperties } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, BookOpen, FileUp } from 'lucide-react'
import { globalNpcsApi } from '../../api/global-npcs'
import { useCampaignStore } from '../../store/campaignStore'
import { Button, EmptyState, ErrorMessage, PageHeader, Spinner } from '../../components/ui'
import { buttonReset, c, card, font, fs, page, radius, tint, titleText, tone } from '../../theme'
import type { GlobalNpc } from '../../types'
import { RetratoAvatar } from '../../components/RetratoAvatar'

// The bulk upload of book images is rare and only the GM's: it loads on demand, out of the main chunk
const SubirFichasLibro = lazy(() => import('./SubirFichasLibro').then((m) => ({ default: m.SubirFichasLibro })))

function GlobalNpcCard({
  cId,
  npc,
  isGm,
  onOpen,
}: {
  cId: number
  npc: GlobalNpc
  isGm: boolean
  onOpen: () => void
}) {
  const rubi = tone.rubi
  const avatar: CSSProperties = {
    width: 48, height: 48, borderRadius: radius.md, flexShrink: 0, overflow: 'hidden',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: npc.imageUrl ? c.s2 : `radial-gradient(120% 120% at 30% 20%, ${tint(rubi.fg, 20)}, var(--surface-2))`,
    border: `1px solid ${rubi.border}`,
    ...titleText, fontSize: fs.xl, color: rubi.fg,
  }
  const inicial = npc.name[0]?.toUpperCase() ?? '?'
  return (
    <div
      className="ui-card ui-card--interactive"
      style={{ ...card, display: 'flex', alignItems: 'center' }}
    >
      <button
        type="button"
        onClick={onOpen}
        style={{
          ...buttonReset,
          flex: 1, minWidth: 0, minHeight: 76,
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '14px 12px 14px 16px', borderRadius: radius.lg,
        }}
      >
        {/* Avatar: the illustration of its book (GM), its image or its initial */}
        {isGm && npc.bookImages.includes('retrato') ? (
          <RetratoAvatar cId={cId} npcId={npc.id} estilo={{ ...avatar, background: c.s2 }}>{inicial}</RetratoAvatar>
        ) : (
          <span aria-hidden style={avatar}>
            {npc.imageUrl ? <img src={npc.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : inicial}
          </span>
        )}

        {/* Info */}
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text }}>
            {npc.name}
          </span>
          {npc.tipo && (
            <span style={{ fontFamily: font.display, fontStyle: 'italic', fontSize: fs.md, fontWeight: 500, lineHeight: 1.3, color: c.muted }}>
              {npc.tipo}
            </span>
          )}
          {isGm && npc.bookImages.length > 0 && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: fs.xs, fontWeight: 650, color: rubi.fg }}>
              <BookOpen size={12} aria-hidden />
              Ficha del libro
            </span>
          )}
          {(npc.source || npc.ascendencia) && (
            <span style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.35 }}>
              {npc.source && <span style={{ fontWeight: 600, color: c.muted }}>{npc.source}</span>}
              {npc.ascendencia && <span> · {npc.ascendencia}</span>}
            </span>
          )}
        </span>

        <ChevronRight size={18} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
      </button>
    </div>
  )
}

/**
 * The adversaries of the campaign's world, read-only: the catalog is the books' (an erratum or a new adversary comes in a
 * migration, like the seeds) and an enemy is adjusted on its own copy, in an encounter of the GM screen. The GM only uploads the
 * images of their books.
 */
export function GlobalNpcListPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const navigate = useNavigate()
  const { isGm } = useCampaignStore()
  const [subiendoFichas, setSubiendoFichas] = useState(false)

  // The adversaries of the world of this campaign: the id is part of the key and of the request (an arrow, not `getAll` by reference: TanStack would pass it its context)
  const { data: npcs, isLoading, isError } = useQuery({
    queryKey: ['global-npcs', cId],
    queryFn: () => globalNpcsApi.getAll(cId),
  })

  if (isLoading) return <Spinner />

  return (
    <div style={{ ...page, paddingBottom: 48 }}>

      <PageHeader
        title="NPCs"
        subtitle={npcs?.length
          ? `${npcs.length} adversario${npcs.length !== 1 ? 's' : ''} del libro`
          : 'Sin adversarios todavía'}
        actions={isGm && !!npcs?.length && (
          <Button variant="secondary" icon={<FileUp size={16} aria-hidden />} onClick={() => setSubiendoFichas(true)}>
            Subir fichas del libro
          </Button>
        )}
      />
      {subiendoFichas && npcs && (
        <Suspense fallback={null}>
          <SubirFichasLibro cId={cId} catalogo={npcs} onClose={() => setSubiendoFichas(false)} />
        </Suspense>
      )}

      {/* Load error (a failed fetch used to leave the page blank) */}
      {isError && !npcs && <ErrorMessage message="No se pudieron cargar los adversarios. Inténtalo de nuevo." />}

      {/* Empty state */}
      {npcs?.length === 0 && (
        <EmptyState
          icon={<BookOpen size={22} aria-hidden />}
          title="Sin adversarios todavía"
          description="No hay adversarios disponibles."
        />
      )}

      {/* List */}
      {!!npcs?.length && (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {npcs.map((npc, i) => (
            <li key={npc.id} className="rise" style={{ '--i': Math.min(i, 12) } as CSSProperties}>
              <GlobalNpcCard
                cId={cId}
                npc={npc}
                isGm={isGm}
                onOpen={() => navigate(`/campaigns/${campaignId}/global-npcs/${npc.id}`)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
