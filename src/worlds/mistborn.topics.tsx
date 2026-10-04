/**
 * Encyclopedia topics of the Mistborn world (WorldConfig.enciclopedia). PROVISIONAL (T06c): only the four topics that
 * already have a page (Caminos Heroicos, Combate, Aventuras, Catálogo), with Lucide emblems [inferido → Q18: the book
 * has no iconography for them]; the shared Cosmere topics keep the Stormlight wording and tone (P8). T24a completes
 * the list with Orígenes, Caminos de nacido del metal and Artes metálicas (§7.8) and T46 replaces the provisional
 * glyphs. A .tsx apart from mistborn.ts because the emblems are JSX; it exports only the list, and imports nothing
 * heavy: it travels in the main bundle (§8, risk 6).
 */
import { Coins, Swords } from 'lucide-react'
import { BalancedRow, EmblemStrip, MiniTile } from '../components/EncyclopediaEmblems'
import { AVENTURAS_EMBLEMS } from '../components/emblemData'
import { HeroicPathIcon } from '../components/GameIcons'
import { HEROIC_PATHS } from '../data/heroicPaths'
import { ink, tint, tone } from '../theme'
import type { TopicDef } from './types'

export const MISTBORN_TOPICS: TopicDef[] = [
  {
    // Cosmere core (L.19 / PDF 25): the same six paths as in Stormlight, with the same Lucide glyphs
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
      <EmblemStrip t={tone.rubi}>
        <Swords size={24} />
      </EmblemStrip>
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
    // The Stormlight tile shows the spheres of Roshar: here a provisional Lucide glyph (the currency is the arquilla)
    id: 'catalog',
    label: 'Catálogo',
    description: 'Armas, armaduras y equipo disponible en el mundo de Scadrial.',
    tone: tone.gold,
    emblem: (
      <EmblemStrip t={tone.gold}>
        <Coins size={24} />
      </EmblemStrip>
    ),
  },
]
