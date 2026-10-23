import type { CSSProperties, ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, ChevronRight, Users, Clock, MapPin, Projector, Warehouse } from 'lucide-react'
import { sessionsApi } from '../../api/sessions'
import { charactersApi } from '../../api/characters'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import type { Session } from '../../types'
import { EmptyState, SectionTitle, Skeleton, StatTile } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { WorldBadge } from '../../components/WorldBadge'
import { cosmereImage } from '../../lib/cosmereAssets'
import { c, card, eyebrow, font, fs, numeral, page, pill, radius, semantic, shadow, titleText, tone } from '../../theme'
import { vivos } from '../../lib/personajes'

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
  const { features } = useWorldConfig()

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
        <p style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          <span style={{ ...pill(roleTone), textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: roleTone.fg, boxShadow: `0 0 8px ${roleTone.fg}` }} />
            {isGm ? 'Director' : 'Jugador'}
          </span>
          {currentCampaign && <WorldBadge variant="chip" world={currentCampaign.world} era={currentCampaign.era} />}
        </p>
      </header>

      {/* A player's entries to what is used during play: «La mesa» always; «La banda» on the phone only (the sidebar and the rail have it) */}
      {!isGm && (
        <div className="rise" style={{ '--i': 1, display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 } as CSSProperties}>
          <TarjetaAcceso
            to={`/campaigns/${cId}/mesa`}
            icono={<Projector size={22} />}
            tono={tone.zafiro}
            titulo="La mesa"
            texto="Lo que el director muestra durante la partida: el combate, la salud del grupo y las imágenes."
          />
          {features.banda && currentCampaign?.bandaVisible && (
            <div className="only-mobile">
              <TarjetaAcceso
                to={`/campaigns/${cId}/banda`}
                icono={<Warehouse size={22} />}
                tono={tone.esmeralda}
                titulo="La banda"
                texto="La hoja de la banda: refugio, mejoras, trabajadores y almacén."
              />
            </div>
          )}
        </div>
      )}

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
            <StatCard icon={<Users size={15} />} label="Personajes" value={vivos(characters).length} loading={loadingCharacters} />
            <StatCard icon={<CalendarDays size={15} />} label="Sesiones" value={sessions.length} loading={loadingSessions} />
          </div>
        </section>
      </div>

    </div>
  )
}

/** A card that is a link to a section (the same shape as the director's entry to the «Pantalla del director») */
function TarjetaAcceso({ to, icono, tono, titulo, texto }: { to: string; icono: ReactNode; tono: { fg: string; bg: string; border: string }; titulo: string; texto: string }) {
  return (
    <Link
      to={to}
      className="ui-card ui-card--interactive"
      style={{
        display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: radius.lg,
        background: `linear-gradient(135deg, ${tono.bg}, var(--surface-1) 72%)`, border: `1px solid ${tono.border}`,
        boxShadow: shadow[1], color: c.text, textDecoration: 'none',
      }}
    >
      <span
        aria-hidden
        style={{
          width: 44, height: 44, flexShrink: 0, borderRadius: radius.md, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: tono.bg, border: `1px solid ${tono.border}`, color: tono.fg,
        }}
      >
        {icono}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, lineHeight: 1.25 }}>{titulo}</span>
        <span style={{ display: 'block', fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>{texto}</span>
      </span>
      <ChevronRight size={20} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
    </Link>
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
