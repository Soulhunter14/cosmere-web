import { BookOpen, Compass, Flag, GitBranch, GitFork, MessageCircle, StickyNote, Swords, Target, type LucideIcon } from 'lucide-react'
import { tone, type Tone } from '../../theme'
import type { Rango, TipoEscena, TipoEvento } from './estado'

/** Scene types of the adventure data (same labels, tones and glyphs as the «Aventura» tab of the Director area) */
export const ESCENA_META: Record<TipoEscena, { label: string; tone: Tone; icon: LucideIcon }> = {
  narrative: { label: 'Narrativa', tone: tone.amatista, icon: BookOpen },
  social: { label: 'Social', tone: tone.zafiro, icon: MessageCircle },
  exploration: { label: 'Exploración', tone: tone.esmeralda, icon: Compass },
  combat: { label: 'Combate', tone: tone.rubi, icon: Swords },
  choice: { label: 'Decisión', tone: tone.topacio, icon: GitFork },
}
export const TIPOS_ESCENA = Object.keys(ESCENA_META) as TipoEscena[]

export const RANGO_META: Record<Rango, { label: string; tone: Tone }> = {
  secuaz: { label: 'Secuaz', tone: tone.cuarzo },
  rival: { label: 'Rival', tone: tone.topacio },
  jefe: { label: 'Jefe', tone: tone.rubi },
}

export const EVENTO_META: Record<TipoEvento, { tone: Tone; icon: LucideIcon }> = {
  apunte: { tone: tone.cuarzo, icon: StickyNote },
  escena: { tone: tone.amatista, icon: BookOpen },
  combate: { tone: tone.rubi, icon: Swords },
  avance: { tone: tone.esmeralda, icon: Flag },
  meta: { tone: tone.brand, icon: Target },
  trama: { tone: tone.topacio, icon: GitBranch },
}

/** Tags of a quick note of the log */
export const ETIQUETAS_APUNTE = ['Apunte', 'Pista', 'Decisión', 'PNJ', 'Botín', 'Gancho'] as const
