import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ChevronRight, Compass, HeartCrack, Swords, Tent } from 'lucide-react'
import { useCampaignStore } from '../../store/campaignStore'
import { PageHeader } from '../../components/ui'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'
import { CosmereIcon } from '../../components/CosmereIcon'
import { HeroicPathIcon, PlotIcon, SurgeIcon } from '../../components/GameIcons'
import { TalentActivation, type ActivationType } from '../../components/TalentActivation'
import { RADIANT_ORDERS, type RadiantOrder } from '../../data/radiantOrders'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { cosmereImage, hasCosmereIcon } from '../../lib/cosmereAssets'
import { c, font, fs, ink, page, radius, shadow, tint, tone, type Tone } from '../../theme'

/* The ten surges, in the order they appear on the orders (Adhesión … Transportación) */
const SURGES = Array.from(new Set(RADIANT_ORDERS.flatMap((o) => o.surges)))

/* Action economy of a combat turn, drawn with the official activation glyphs */
const COMBAT_ACTIVATIONS: ActivationType[] = ['action1', 'action2', 'action3', 'reaction']

/* One glyph per Aventuras tab: Escenas · Reposo · Sucesos (official Oportunidad plot symbol) · Estados · Daño */
const AVENTURAS_EMBLEMS: ReactNode[] = [
  <Compass size={17} />,
  <Tent size={17} />,
  <PlotIcon result="oportunidad" size={17} />,
  <Activity size={17} />,
  <HeartCrack size={17} />,
]

/**
 * A row of small emblems split in two halves that never break inside: the row either fits whole
 * or wraps as a balanced 5 + 5 (instead of 8 + 2 on a phone).
 */
function BalancedRow({ children, gap }: { children: ReactNode[]; gap: number }) {
  const mid = Math.ceil(children.length / 2)
  return (
    <span aria-hidden style={{ display: 'flex', flexWrap: 'wrap', gap }}>
      <span style={{ display: 'flex', gap }}>{children.slice(0, mid)}</span>
      <span style={{ display: 'flex', gap }}>{children.slice(mid)}</span>
    </span>
  )
}

/**
 * Official order glyph in its identity colour. Same look as the shared RadiantOrderIcon, but the colour
 * goes through ink() so the glyph stays readable on the light "pergamino" paper too
 * (RadiantOrderIcon paints the raw data colour). Falls back to RadiantOrderIcon (placard crop).
 */
function OrderGlyph({ order, size }: { order: RadiantOrder; size: number }) {
  const glyph = `orden-${order.id}`
  if (!hasCosmereIcon(glyph)) return <RadiantOrderIcon orderId={order.id} size={size} decorative />
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(circle at 50% 35%, ${tint(order.color, 26)}, ${tint(order.color, 8)})`,
        boxShadow: `inset 0 0 0 1px ${tint(ink(order.color), 40)}`,
        color: ink(order.color),
      }}
    >
      <CosmereIcon name={glyph} size={Math.round(size * 0.62)} square />
    </span>
  )
}

/** Horizontal strip that holds a row of small icons (48px high, like the single-icon tiles) */
function EmblemStrip({ t, children, style }: { t: Tone; children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 12, height: 48, padding: '0 14px',
        borderRadius: radius.md, background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/** Small tinted square for one glyph */
function MiniTile({ bg, border, color, children }: { bg: string; border: string; color: string; children: ReactNode }) {
  return (
    <span
      style={{
        width: 32, height: 32, borderRadius: radius.sm, flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: bg, border: `1px solid ${border}`, color,
      }}
    >
      {children}
    </span>
  )
}

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
