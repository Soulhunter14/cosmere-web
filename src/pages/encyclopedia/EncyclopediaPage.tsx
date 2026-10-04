import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import { PageHeader } from '../../components/ui'
import { c, font, fs, page, radius, shadow } from '../../theme'

export function EncyclopediaPage() {
  const { currentCampaign } = useCampaignStore()
  // The tiles belong to the world of the campaign (WorldConfig.enciclopedia): this page knows no world id
  const cfg = useWorldConfig()

  const pathFor = (id: string) => {
    if (!currentCampaign) return '#'
    if (id === 'catalog') return `/campaigns/${currentCampaign.id}/catalog`
    return `/campaigns/${currentCampaign.id}/encyclopedia/${id}`
  }

  return (
    <div style={page}>
      <PageHeader title="Enciclopedia" subtitle={`Lore y referencia del mundo de ${cfg.planeta}`} />

      <ul
        style={{
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: 12,
        }}
      >
        {cfg.enciclopedia.map((topic, i) => {
          const titleId = `enc-topic-${topic.id}`
          return (
            <li
              key={topic.id}
              className="rise"
              style={{ '--i': i, gridColumn: topic.feature ? '1 / -1' : undefined, display: 'flex' } as CSSProperties}
            >
              <Link
                to={pathFor(topic.id)}
                onClick={(e) => { if (!currentCampaign) e.preventDefault() }}
                aria-labelledby={titleId}
                aria-describedby={`${titleId}-desc`}
                className="ui-card ui-card--interactive"
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                  padding: 20,
                  borderRadius: radius.lg,
                  background: c.s1,
                  border: `1px solid ${c.border}`,
                  boxShadow: shadow[1],
                  color: c.text,
                  textDecoration: 'none',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Tone wash in the corner: identity of the topic, purely decorative */}
                <span
                  aria-hidden
                  style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: `radial-gradient(420px 180px at 100% 0%, ${topic.tone.bg}, transparent 70%)`,
                  }}
                />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  {topic.emblem}
                  <ChevronRight size={20} aria-hidden style={{ color: c.subtle, marginTop: 4 }} />
                </div>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
                  <h2
                    id={titleId}
                    style={{ fontFamily: font.display, fontSize: topic.feature ? fs.xl : fs.lg + 2, fontWeight: 600, lineHeight: 1.2, color: c.text }}
                  >
                    {topic.label}
                  </h2>
                  <p id={`${titleId}-desc`} style={{ fontSize: fs.sm + 1, lineHeight: 1.5, color: c.muted, maxWidth: 560 }}>
                    {topic.description}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
