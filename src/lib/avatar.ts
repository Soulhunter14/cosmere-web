import type { ToneName } from '../theme'

/* Character identity colour, chosen by character.id % 6 (same rule as the old AVATAR_GRADIENTS).
   Deep gemstone gradients: white text on them is ≥ 10:1. */
interface CharacterPalette {
  tone: ToneName
  /** deep base colours of the hero/avatar gradient */
  from: string
  to: string
  /** luminous accent (the gem's glint) */
  accent: string
}

const PALETTES: CharacterPalette[] = [
  { tone: 'amatista', from: '#3b2a6b', to: '#1c1438', accent: '#bb9bff' },
  { tone: 'zafiro', from: '#173a6a', to: '#0c1f3d', accent: '#7cb3ff' },
  { tone: 'granate', from: '#5a1d35', to: '#2e0f1d', accent: '#ff8fb1' },
  { tone: 'esmeralda', from: '#0f4a3b', to: '#082a22', accent: '#4fdc9a' },
  { tone: 'heliodoro', from: '#5b3a10', to: '#2f1e08', accent: '#ffa45c' },
  { tone: 'circon', from: '#0e4452', to: '#08262f', accent: '#5fe0ea' },
]

export function characterPalette(id: number): CharacterPalette {
  return PALETTES[Math.abs(id) % PALETTES.length]
}

/** Background for the character hero header */
export function characterHeroBackground(id: number): string {
  const p = characterPalette(id)
  return [
    `radial-gradient(110% 90% at 100% 0%, color-mix(in srgb, ${p.accent} 26%, transparent), transparent 62%)`,
    `radial-gradient(80% 70% at 0% 100%, color-mix(in srgb, ${p.accent} 10%, transparent), transparent 70%)`,
    `linear-gradient(160deg, ${p.from}, ${p.to})`,
  ].join(', ')
}

/** Small avatar / list-row gradient (drop-in replacement for AVATAR_GRADIENTS[id % 6]) */
export function characterGradient(id: number): string {
  const p = characterPalette(id)
  return `radial-gradient(120% 120% at 30% 15%, color-mix(in srgb, ${p.accent} 45%, ${p.from}), ${p.to})`
}
