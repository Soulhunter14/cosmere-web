/**
 * Encyclopedia topics of the Mistborn world (WorldConfig.enciclopedia), in the order of §7.8: Orígenes, Caminos Heroicos,
 * Caminos de nacido del metal, Artes metálicas, Combate, Aventuras and Catálogo. Their ids are the route segments of
 * `encyclopedia/<id>` (App.tsx), except 'catalog'. The emblems of ancestries and paths are Lucide glyphs [inferido → Q18: the book has no
 * iconography for them]; the one of the metallic arts shows the official glyphs of the book (MetalGlyph, T46); the shared Cosmere
 * topics keep the Stormlight wording and tone (P8). A .tsx apart from mistborn.ts because the emblems are JSX; it
 * exports only the list, and it travels in the main bundle, so it imports no data of the world beyond a type (§8, risk 6):
 * the tones of the metalborn paths are the tile's, not the data colours of the paths.
 */
import { Coins, Swords } from 'lucide-react'
import { BalancedRow, EmblemStrip, MiniTile } from '../components/EncyclopediaEmblems'
import { AVENTURAS_EMBLEMS } from '../components/emblemData'
import { HeroicPathIcon } from '../components/GameIcons'
import { MetalGlyph } from '../components/mistborn/MetalGlyph'
import { HEROIC_PATHS } from '../data/heroicPaths'
import type { CaminoMetalId } from '../data/mistborn/metales'
import { ink, tint, tone } from '../theme'
import { iconoCaminoMetal, iconoHumano, iconoKandra, iconoSangreKoloss } from './mistborn.icons'
import type { TopicDef } from './types'

/** The five metalborn paths in the order of the book (chapter 5): the tile shows one glyph for each */
const CAMINOS_METAL: CaminoMetalId[] = ['brumoso', 'nacido-de-la-bruma', 'feruquimista', 'ferrin', 'nacidoble']

export const MISTBORN_TOPICS: TopicDef[] = [
  {
    // Chapter 2 (L.31-48 / PDF 37-54): the three ancestries, the kandra Blessings and the cultural skills of each era
    id: 'origenes',
    label: 'Orígenes',
    description: 'Las ascendencias humana, kandra y de sangre koloss, las Bendiciones kandra y las pericias culturales de cada era.',
    tone: tone.granate,
    emblem: (
      <EmblemStrip t={tone.granate}>
        {iconoHumano(24)}
        {iconoKandra(24)}
        {iconoSangreKoloss(24)}
      </EmblemStrip>
    ),
  },
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
    // Chapter 5 (L.127-159 / PDF 133-165). A feature tile (whole row): it keeps the 2-column grid balanced with seven topics
    id: 'nacidos-del-metal',
    label: 'Caminos de nacido del metal',
    description: 'Los cinco caminos que dan acceso a la alomancia y la feruquimia: brumoso, nacido de la bruma, feruquimista, ferrin y nacidoble.',
    tone: tone.topacio,
    feature: true,
    emblem: (
      <BalancedRow gap={6}>
        {CAMINOS_METAL.map((id) => (
          <MiniTile key={id} bg={tone.topacio.bg} border={tone.topacio.border} color={tone.topacio.fg}>
            {iconoCaminoMetal(id, 17)}
          </MiniTile>
        ))}
      </BalancedRow>
    ),
  },
  {
    // Chapter 6 (from L.161 / PDF 167): alomancia, feruquimia and hemalurgia. The tile shows the glyph of steel in the alphabet of each of the two
    // arts that have one (L.405 / PDF 411); hemalurgia has none (a spike is not a letter), so it is not in the emblem
    id: 'artes-metalicas',
    label: 'Artes metálicas',
    description: 'Alomancia, feruquimia y hemalurgia: los diecisiete metales, sus poderes y los talentos de cada uno.',
    tone: tone.amatista,
    emblem: (
      <EmblemStrip t={tone.amatista}>
        <MetalGlyph arte="alomancia" metal="acero" size={28} />
        <MetalGlyph arte="feruquimia" metal="acero" size={28} />
      </EmblemStrip>
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
