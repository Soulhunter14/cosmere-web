/**
 * Activation type symbols matching the Cosmere RPG PDF:
 *   action1/2/3  → filled triangles  ▶ ▶▶ ▶▶▶
 *   free         → outline triangle  ▷
 *   reaction     → curved arrow      ↻
 *   special      → asterisk          ✦
 *   passive      → infinity          ∞
 */
import type { ReactElement } from 'react'

export type ActivationType = 'action1' | 'action2' | 'action3' | 'free' | 'reaction' | 'special' | 'passive'

const SIZE = 8

function FilledTriangle() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 8 8" style={{ display: 'inline', verticalAlign: 'middle' }}>
      <polygon points="0,0 8,4 0,8" fill="currentColor" />
    </svg>
  )
}

function OutlineTriangle() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 8 8" style={{ display: 'inline', verticalAlign: 'middle' }}>
      <polygon points="0,0 8,4 0,8" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

const CONFIG: Record<ActivationType, { symbols: ReactElement; label: string; color: string; bg: string; border: string }> = {
  action1: {
    symbols: <><FilledTriangle /></>,
    label: '1 acción',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.25)',
  },
  action2: {
    symbols: <><FilledTriangle /><FilledTriangle /></>,
    label: '2 acciones',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.25)',
  },
  action3: {
    symbols: <><FilledTriangle /><FilledTriangle /><FilledTriangle /></>,
    label: '3 acciones',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.1)',
    border: 'rgba(96,165,250,0.25)',
  },
  free: {
    symbols: <OutlineTriangle />,
    label: 'Acción gratuita',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.1)',
    border: 'rgba(74,222,128,0.25)',
  },
  reaction: {
    symbols: <span style={{ fontSize: 10, lineHeight: 1 }}>↻</span>,
    label: 'Reacción',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.1)',
    border: 'rgba(251,191,36,0.25)',
  },
  special: {
    symbols: <span style={{ fontSize: 9, lineHeight: 1 }}>✦</span>,
    label: 'Especial',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.1)',
    border: 'rgba(192,132,252,0.25)',
  },
  passive: {
    symbols: <span style={{ fontSize: 11, lineHeight: 1 }}>∞</span>,
    label: 'Siempre activo',
    color: '#94a3b8',
    bg: 'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.25)',
  },
}

interface Props {
  type: ActivationType
  /** show only the symbol, no label text */
  compact?: boolean
}

export function TalentActivation({ type, compact = false }: Props) {
  const cfg = CONFIG[type]

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: compact ? '2px 5px' : '2px 7px',
      borderRadius: 20,
      background: cfg.bg,
      border: `1px solid ${cfg.border}`,
      color: cfg.color,
      fontSize: 9,
      fontWeight: 700,
      flexShrink: 0,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {cfg.symbols}
      </span>
      {!compact && (
        <span style={{ letterSpacing: '0.04em' }}>{cfg.label}</span>
      )}
    </span>
  )
}
