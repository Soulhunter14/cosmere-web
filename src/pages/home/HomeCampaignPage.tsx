import type { CSSProperties, ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Users, Clock, MapPin } from 'lucide-react'
import { sessionsApi } from '../../api/sessions'
import { charactersApi } from '../../api/characters'
import { useCampaignStore } from '../../store/campaignStore'
import type { Session } from '../../types'
import { EmptyState, SectionTitle, Skeleton, StatTile } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { cosmereImage } from '../../lib/cosmereAssets'
import { c, card, eyebrow, font, fs, numeral, page, pill, radius, semantic, shadow, titleText, tone } from '../../theme'

function isPast(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function HomeCampaignPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const { currentCampaign, isGm } = useCampaignStore()

  const { data: sessions = [], isLoading: loadingSessions } = useQuery({
    queryKey: ['sessions', cId],
    queryFn: () => sessionsApi.getAll(cId),
  })

  const { data: characters = [], isLoading: loadingCharacters } = useQuery({
    queryKey: ['characters', cId],
    queryFn: () => charactersApi.getAll(cId),
  })

  const nextSession = sessions
    .filter((s) => !isPast(new Date(s.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  const roleTone = isGm ? semantic.gm : tone.brand

  return (
    <div style={page}>

      {/* Campaign header */}
      <header className="rise" style={{ marginBottom: 28 }}>
        <h1 style={{ ...titleText, fontSize: fs['2xl'], color: c.text }}>
          {currentCampaign?.name ?? 'Campaña'}
        </h1>
        <p style={{ marginTop: 10 }}>
          <span style={{ ...pill(roleTone), textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: roleTone.fg, boxShadow: `0 0 8px ${roleTone.fg}` }} />
            {isGm ? 'Director' : 'Jugador'}
          </span>
        </p>
      </header>

      {/* Bento: next session (wide) + summary tiles (stacked beside it from ~560px, below it on phones) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: '28px 16px' }}>
        <section
          aria-labelledby="home-next"
          className="rise"
          style={{ '--i': 1, flex: '999 1 320px', minWidth: 0, display: 'flex', flexDirection: 'column' } as CSSProperties}
        >
          <SectionTitle id="home-next">Próxima sesión</SectionTitle>
          {loadingSessions ? (
            <Skeleton height={132} radius={radius.lg} style={{ flex: 1 }} />
          ) : nextSession ? (
            <NextSessionCard session={nextSession} />
          ) : (
            <EmptyState
              icon={<CalendarDays size={22} />}
              title="No hay sesiones planificadas"
              style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            />
          )}
        </section>

        <section
          aria-labelledby="home-summary"
          className="rise"
          style={{ '--i': 2, flex: '1 1 200px', minWidth: 0, display: 'flex', flexDirection: 'column' } as CSSProperties}
        >
          <SectionTitle id="home-summary">Resumen</SectionTitle>
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
            <StatCard icon={<Users size={15} />} label="Personajes" value={characters.length} loading={loadingCharacters} />
            <StatCard icon={<CalendarDays size={15} />} label="Sesiones" value={sessions.length} loading={loadingSessions} />
          </div>
        </section>
      </div>

    </div>
  )
}

function NextSessionCard({ session }: { session: Session }) {
  const date = new Date(session.date)
  const fullDate = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const d20 = cosmereImage('dado-d20')
  return (
    <article
      aria-labelledby="home-next-title"
      style={{
        ...card,
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        minHeight: 132,
        padding: '18px 20px',
        borderColor: tone.brand.border,
        boxShadow: `inset 3px 0 0 var(--brand), ${shadow[1]}`,
      }}
    >
      {d20 && (
        <img
          src={d20}
          alt=""
          aria-hidden
          style={{ position: 'absolute', right: -20, bottom: -26, width: 104, opacity: 0.16, transform: 'rotate(-14deg)', pointerEvents: 'none' }}
        />
      )}

      {/* Date inside the gold chapter medallion */}
      <time
        dateTime={session.date}
        style={{
          position: 'relative', flexShrink: 0, width: 80, height: 80,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <CosmereIcon name="ornamento-medallon" size={80} square style={{ position: 'absolute', inset: 0, color: 'var(--gold-ornament)' }} />
        <span className="sr-only">{fullDate}</span>
        <span aria-hidden style={{ ...numeral, fontSize: fs.xl + 2, color: c.brandLight }}>{date.getDate()}</span>
        <span aria-hidden style={{ ...eyebrow, color: c.gold, marginTop: 4, letterSpacing: '0.1em' }}>
          {MONTHS[date.getMonth()].toUpperCase()}
        </span>
      </time>

      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <h3
          id="home-next-title"
          style={{
            fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, color: c.text, lineHeight: 1.25,
            marginBottom: 8, overflow: 'hidden', overflowWrap: 'anywhere',
            display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2,
          }}
          title={session.title}
        >
          {session.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px 14px', flexWrap: 'wrap', fontSize: fs.sm, color: c.muted }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Clock size={14} aria-hidden style={{ color: c.subtle }} />
            {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {session.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
              <MapPin size={14} aria-hidden style={{ color: c.subtle }} />
              {session.location}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

function StatCard({ icon, label, value, loading }: { icon: ReactNode; label: string; value: number; loading?: boolean }) {
  return (
    <StatTile
      icon={icon}
      label={label}
      value={
        loading ? (
          <>
            <Skeleton height={26} width={44} />
            <span className="sr-only">Cargando…</span>
          </>
        ) : (
          value
        )
      }
      style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '14px 16px', minHeight: 90 }}
    />
  )
}
