/**
 * Talent activation badge using the OFFICIAL Cosmere RPG action symbols
 * (CosmereDingbats glyphs from the rulebook):
 *   action1/2/3 ▶ ▶▶ ▶▶▶ · free ▷ · reaction ↩ · special ★ · passive ∞
 */
import { CosmereIcon } from './CosmereIcon'
import { tone, type Tone } from '../theme'

export type ActivationType = 'action1' | 'action2' | 'action3' | 'free' | 'reaction' | 'special' | 'passive'

const CONFIG: Record<ActivationType, { icon: string; label: string; tone: Tone }> = {
  action1: { icon: 'accion-1', label: '1 acción', tone: tone.zafiro },
  action2: { icon: 'accion-2', label: '2 acciones', tone: tone.zafiro },
  action3: { icon: 'accion-3', label: '3 acciones', tone: tone.zafiro },
  free: { icon: 'accion-gratuita', label: 'Acción gratuita', tone: tone.esmeralda },
  reaction: { icon: 'reaccion', label: 'Reacción', tone: tone.topacio },
  special: { icon: 'activacion-especial', label: 'Especial', tone: tone.amatista },
  passive: { icon: 'siempre-activo', label: 'Siempre activo', tone: tone.cuarzo },
}

interface Props {
  type: ActivationType
  /** show only the symbol, no label text (the label stays available to screen readers and as a tooltip) */
  compact?: boolean
}

export function TalentActivation({ type, compact = false }: Props) {
  const cfg = CONFIG[type]
  return (
    <span
      title={cfg.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        minHeight: 22,
        padding: compact ? '2px 7px' : '2px 9px 2px 8px',
        borderRadius: 999,
        background: cfg.tone.bg,
        border: `1px solid ${cfg.tone.border}`,
        color: cfg.tone.fg,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.02em',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        lineHeight: 1.2,
      }}
    >
      <CosmereIcon name={cfg.icon} size={type === 'passive' ? 9 : 11} />
      {compact ? <span className="sr-only">{cfg.label}</span> : <span>{cfg.label}</span>}
    </span>
  )
}
