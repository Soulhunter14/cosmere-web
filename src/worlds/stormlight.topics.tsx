/**
 * Encyclopedia topics of the Stormlight world (WorldConfig.enciclopedia): the tiles of the encyclopedia index,
 * moved out of EncyclopediaPage (T06c). A .tsx apart from stormlight.ts because the emblems are JSX; it exports only
 * the list (no components), so fast refresh is not affected. T09 makes EncyclopediaPage read it through
 * `useWorldConfig().enciclopedia`; until then the page keeps its own identical copy.
 */
import { Swords } from 'lucide-react'
import { CosmereIcon } from '../components/CosmereIcon'
import { BalancedRow, EmblemStrip, MiniTile, OrderGlyph } from '../components/EncyclopediaEmblems'
import { AVENTURAS_EMBLEMS, COMBAT_ACTIVATIONS, SURGES } from '../components/emblemData'
import { HeroicPathIcon, SurgeIcon } from '../components/GameIcons'
import { TalentActivation } from '../components/TalentActivation'
import { HEROIC_PATHS } from '../data/heroicPaths'
import { RADIANT_ORDERS } from '../data/radiantOrders'
import { cosmereImage } from '../lib/cosmereAssets'
import { ink, tint, tone } from '../theme'
import type { TopicDef } from './types'

export const STORMLIGHT_TOPICS: TopicDef[] = [
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
