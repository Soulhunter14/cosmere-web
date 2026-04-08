import { useNavigate } from 'react-router-dom'
import { Sparkles, Shield, Swords, BookOpen, Compass, Zap } from 'lucide-react'
import { useCampaignStore } from '../../store/campaignStore'

const TOPICS = [
  {
    id: 'radiant-orders',
    label: 'Órdenes Radiantes',
    description: 'Las diez órdenes de los Caballeros Radiantes, sus ideales, poderes y spren vinculados.',
    icon: Sparkles,
    accent: '#a78bfa',
    bg: 'rgba(167,139,250,0.1)',
    bgHover: 'rgba(167,139,250,0.25)',
  },
  {
    id: 'heroic-paths',
    label: 'Caminos Heroicos',
    description: 'Los seis caminos que definen las competencias mundanas de cada héroe: Agente, Cazador, Enviado, Erudito, Guerrero y Líder.',
    icon: Shield,
    accent: '#f87171',
    bg: 'rgba(248,113,113,0.1)',
    bgHover: 'rgba(248,113,113,0.25)',
  },
  {
    id: 'combat',
    label: 'Combate',
    description: 'Referencia rápida de reglas de combate: orden de turno, acciones, reacciones, ataques y maniobras.',
    icon: Swords,
    accent: '#fb923c',
    bg: 'rgba(251,146,60,0.1)',
    bgHover: 'rgba(251,146,60,0.25)',
  },
  {
    id: 'potencias',
    label: 'Potencias',
    description: 'Las diez potencias Radiantes: Abrasión, Adhesión, Cohesión, División, Gravitación, Iluminación, Progresión, Tensión, Transformación y Transportación.',
    icon: Zap,
    accent: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    bgHover: 'rgba(251,191,36,0.25)',
  },
  {
    id: 'aventuras',
    label: 'Aventuras',
    description: 'Escenas, descanso, sucesos, estados y reglas de daño y lesiones.',
    icon: Compass,
    accent: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    bgHover: 'rgba(96,165,250,0.25)',
  },
  {
    id: 'catalog',
    label: 'Catálogo',
    description: 'Armas, armaduras y equipo disponible en el mundo de Roshar.',
    icon: BookOpen,
    accent: '#34d399',
    bg: 'rgba(52,211,153,0.1)',
    bgHover: 'rgba(52,211,153,0.25)',
  },
]

export function EncyclopediaPage() {
  const navigate = useNavigate()
  const { currentCampaign } = useCampaignStore()

  const goTo = (id: string) => {
    if (!currentCampaign) return
    if (id === 'catalog') navigate(`/campaigns/${currentCampaign.id}/catalog`)
    else navigate(`/campaigns/${currentCampaign.id}/encyclopedia/${id}`)
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 48px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
        Enciclopedia
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Lore y referencia del mundo de Roshar
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TOPICS.map(({ id, label, description, icon: Icon, accent, bg, bgHover }) => (
          <button
            key={id}
            onClick={() => goTo(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '16px 18px', borderRadius: 16, textAlign: 'left', width: '100%',
              background: 'var(--surface-1)', border: `1px solid var(--border)`,
              cursor: 'pointer', transition: 'border-color 0.15s, transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = bgHover
              e.currentTarget.style.transform = 'translateX(3px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'none'
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: bg, border: `1px solid ${bgHover}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Icon size={20} style={{ color: accent }} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 3 }}>{label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
