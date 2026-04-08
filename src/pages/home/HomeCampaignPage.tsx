import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Users, Clock, MapPin, LogOut } from 'lucide-react'
import { sessionsApi } from '../../api/sessions'
import { charactersApi } from '../../api/characters'
import { useCampaignStore } from '../../store/campaignStore'
import type { Session } from '../../types'

function isPast(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function HomeCampaignPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const navigate = useNavigate()
  const { currentCampaign, isGm } = useCampaignStore()

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions', cId],
    queryFn: () => sessionsApi.getAll(cId),
  })

  const { data: characters = [] } = useQuery({
    queryKey: ['characters', cId],
    queryFn: () => charactersApi.getAll(cId),
  })

  const nextSession = sessions
    .filter((s) => !isPast(new Date(s.date)))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 48px' }}>

      {/* Campaign header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em', marginBottom: 8 }}>
          {currentCampaign?.name ?? 'Campaña'}
        </h1>
        <span
          style={
            isGm
              ? { fontSize: 10, padding: '3px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: 20, fontWeight: 700, letterSpacing: '0.1em', display: 'inline-block' }
              : { fontSize: 10, padding: '3px 10px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--brand-light)', borderRadius: 20, fontWeight: 700, letterSpacing: '0.1em', display: 'inline-block' }
          }
        >
          {isGm ? 'GAME MASTER' : 'JUGADOR'}
        </span>
      </div>

      {/* Next session */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
          PRÓXIMA SESIÓN
        </div>
        {nextSession ? (
          <NextSessionCard session={nextSession} />
        ) : (
          <div style={{
            background: 'var(--surface-1)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '20px', textAlign: 'center',
            color: 'var(--text-subtle)', fontSize: 13,
          }}>
            No hay sesiones planificadas
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
        RESUMEN
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 40 }}>
        <StatCard icon={<Users size={16} />} label="Personajes" value={characters.length} />
        <StatCard icon={<CalendarDays size={16} />} label="Sesiones" value={sessions.length} />
      </div>

      {/* Back to campaigns */}
      <button
        onClick={() => navigate('/campaigns')}
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: '1px solid var(--border)',
          borderRadius: 12, padding: '11px 16px', cursor: 'pointer',
          color: 'var(--text-subtle)', fontSize: 13, fontWeight: 600,
          width: '100%', transition: 'border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(251,113,133,0.3)'; e.currentTarget.style.color = '#fb7185' }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-subtle)' }}
      >
        <LogOut size={14} />
        Volver a campañas
      </button>
    </div>
  )
}

function NextSessionCard({ session }: { session: Session }) {
  const date = new Date(session.date)
  return (
    <div style={{
      background: 'var(--surface-1)', border: '1px solid rgba(180,190,254,0.2)',
      borderLeft: '3px solid var(--brand-light)',
      borderRadius: 14, padding: '14px 16px',
      display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <div style={{
        flexShrink: 0, textAlign: 'center',
        background: 'rgba(180,190,254,0.08)', border: '1px solid rgba(180,190,254,0.2)',
        borderRadius: 12, padding: '8px 12px', minWidth: 48,
      }}>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand-light)', lineHeight: 1 }}>
          {date.getDate()}
        </div>
        <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.04em', marginTop: 2 }}>
          {MONTHS[date.getMonth()].toUpperCase()}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {session.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-subtle)' }}>
            <Clock size={10} />
            {date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </span>
          {session.location && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--text-subtle)' }}>
              <MapPin size={10} />
              {session.location}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: number; accent?: boolean }) {
  return (
    <div style={{
      background: 'var(--surface-1)',
      border: `1px solid ${accent ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`,
      borderRadius: 14, padding: '14px 16px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <div style={{ color: accent ? '#f87171' : 'var(--text-subtle)' }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--text)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-subtle)', fontWeight: 600 }}>{label}</div>
    </div>
  )
}
