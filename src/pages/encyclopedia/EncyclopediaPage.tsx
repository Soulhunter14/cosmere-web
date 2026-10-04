import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Swords } from 'lucide-react'
import { useCampaignStore } from '../../store/campaignStore'
import { PageHeader } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { BalancedRow, EmblemStrip, MiniTile, OrderGlyph } from '../../components/EncyclopediaEmblems'
import { AVENTURAS_EMBLEMS, COMBAT_ACTIVATIONS, SURGES } from '../../components/emblemData'
import { HeroicPathIcon, SurgeIcon } from '../../components/GameIcons'
import { TalentActivation } from '../../components/TalentActivation'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { cosmereImage } from '../../lib/cosmereAssets'
import { c, font, fs, ink, page, radius, shadow, tint, tone, type Tone } from '../../theme'

/* Provisional (T06c): `Topic` and `TOPICS` have an identical copy in worlds/stormlight.topics.tsx (TopicDef,
   STORMLIGHT_TOPICS). T09 deletes both and reads `useWorldConfig().enciclopedia` instead. */
interface Topic {
  id: string
  label: string
  description: string
  tone: Tone
  /** Feature tiles span the whole row of the bento grid */
  feature?: boolean
  emblem: ReactNode
}

const TOPICS: Topic[] = [
  {
    id: 'radiant-orders',
    label: 'Órdenes Radiantes',
    description: 'Las diez órdenes de los Caballeros Radiantes, sus ideales, poderes y spren vinculados.',
    tone: tone.amatista,
    feature: true,
    emblem: (
      <BalancedRow gap={6}>
        {RADIANT_ORDERS.map((o) => <OrderGlyph key={o.id} order={o} size={32} />)}
      </BalancedRow>
    ),
  },
  {
    id: 'heroic-paths',
    label: 'Caminos Heroicos',
    description: 'Los seis caminos que definen las competencias mundanas de cada héroe: Agente, Cazador, Enviado, Erudito, Guerrero y Líder.',
    tone: tone.granate,
    emblem: (
      <BalancedRow gap={6}>
        {HEROIC_PATHS.map((p) => (
          <MiniTile key={p.id} bg={tint(p.color, 12)} border={tint(p.color, 32)} color={ink(p.color)}>
            <HeroicPathIcon id={p.id} size={17} />
          </MiniTile>
        ))}
      </BalancedRow>
    ),
  },
  {
    id: 'combat',
    label: 'Combate',
    description: 'Referencia rápida de reglas de combate: orden de turno, acciones, reacciones, ataques y maniobras.',
    tone: tone.rubi,
    emblem: (
      <span aria-hidden style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        {/* The defence shield of the official character sheet, with crossed swords */}
        <span style={{ position: 'relative', display: 'inline-flex', color: tone.rubi.fg }}>
          <CosmereIcon name="marco-defensa" size={48} />
          <Swords size={20} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -54%)' }} />
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {COMBAT_ACTIVATIONS.map((a) => <TalentActivation key={a} type={a} compact />)}
        </span>
      </span>
    ),
  },
  {
    id: 'potencias',
    label: 'Potencias',
    description: 'Las diez potencias Radiantes: Abrasión, Adhesión, Cohesión, División, Gravitación, Iluminación, Progresión, Tensión, Transformación y Transportación.',
    tone: tone.brand,
    feature: true,
    emblem: (
      <BalancedRow gap={6}>
        {SURGES.map((s) => (
          <MiniTile key={s} bg={tone.brand.bg} border={tone.brand.border} color={tone.brand.fg}>
            <SurgeIcon surge={s} size={20} />
          </MiniTile>
        ))}
      </BalancedRow>
    ),
  },
  {
    id: 'aventuras',
    label: 'Aventuras',
    description: 'Escenas, descanso, sucesos, estados y reglas de daño y lesiones.',
    tone: tone.esmeralda,
    emblem: (
      <BalancedRow gap={6}>
        {AVENTURAS_EMBLEMS.map((node, i) => (
          <MiniTile key={i} bg={tone.esmeralda.bg} border={tone.esmeralda.border} color={tone.esmeralda.fg}>
            {node}
          </MiniTile>
        ))}
      </BalancedRow>
    ),
  },
  {
    id: 'catalog',
    label: 'Catálogo',
    description: 'Armas, armaduras y equipo disponible en el mundo de Roshar.',
    tone: tone.gold,
    emblem: (
      <EmblemStrip t={tone.gold} style={{ padding: '0 12px' }}>
        <img src={cosmereImage('esferas-fila')} alt="" width={116} height={34} style={{ width: 116, height: 'auto' }} />
      </EmblemStrip>
    ),
  },
]

export function EncyclopediaPage() {
  const { currentCampaign } = useCampaignStore()

  const pathFor = (id: string) => {
    if (!currentCampaign) return '#'
    if (id === 'catalog') return `/campaigns/${currentCampaign.id}/catalog`
    return `/campaigns/${currentCampaign.id}/encyclopedia/${id}`
  }

  return (
    <div style={page}>
      <PageHeader title="Enciclopedia" subtitle="Lore y referencia del mundo de Roshar" />

      <ul
        style={{
          listStyle: 'none',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
          gap: 12,
        }}
      >
        {TOPICS.map((topic, i) => {
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
