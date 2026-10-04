/**
 * One option of a picker of Nacidos de la bruma (CaminoMetalPicker, BendicionPicker): a toggle button with an optional icon box, a
 * title and free content below it. Same look as the rows of the OptionPicker of CharacterDetailPage (card surface, the tone of the
 * option once selected, 56 px minimum height). The explanation of a disabled option goes in a sibling element, outside the button:
 * a dimmed button would dim it too, and `describedBy` ties both together for assistive technology.
 */
import type { ReactNode } from 'react'
import { Check } from 'lucide-react'
import { buttonReset, c, fs, radius, type Tone } from '../../theme'

export function FilaOpcion({ titulo, icono, t, selected, disabled = false, onClick, describedBy, children }: {
  titulo: string
  /** Glyph inside the tinted box; omit it for an option without icon */
  icono?: ReactNode
  /** Tone of the option once selected */
  t: Tone
  selected: boolean
  disabled?: boolean
  onClick: () => void
  /** Id of the element that explains why the option is disabled */
  describedBy?: string
  children?: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-describedby={describedBy}
      disabled={disabled}
      data-autofocus={selected || undefined}
      onClick={onClick}
      className={disabled ? 'ui-card' : 'ui-card ui-card--interactive'}
      style={{
        ...buttonReset,
        width: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        minHeight: 56,
        padding: '12px 14px',
        borderRadius: radius.md,
        background: selected ? t.bg : c.s2,
        border: `1px solid ${selected ? t.border : c.border}`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        // A disabled option that is not selected is the one that is out of reach; the selected one stays legible (what the character has)
        opacity: disabled && !selected ? 0.7 : 1,
      }}
    >
      {icono && (
        <span
          aria-hidden
          style={{
            width: 40, height: 40, flexShrink: 0, borderRadius: radius.sm,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
          }}
        >
          {icono}
        </span>
      )}
      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontSize: fs.base, fontWeight: 600, lineHeight: 1.3, color: selected ? t.fg : c.text }}>{titulo}</span>
        {children}
      </span>
      {selected && <Check size={18} aria-hidden style={{ color: t.fg, flexShrink: 0, marginTop: 2 }} />}
    </button>
  )
}
