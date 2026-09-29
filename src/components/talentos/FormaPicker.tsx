/**
 * Singer forms: the form card (used by the talent sheet and the picker) and the active-form picker sheet.
 * Power forms (vacíospren) always carry the Odium warning.
 */
import { Check, TriangleAlert, Zap } from 'lucide-react'
import { Button, Sheet } from '../ui'
import { c, eyebrow, font, fs, radius, tone } from '../../theme'
import type { FormaCantor } from '../../data/cantores'
import type { Accent } from './talentStyle'

/** "Forma de poder" marker (vacíospren): icon + text for assistive tech when no visible note explains it */
export function PoderMark({ size = 14, announce }: { size?: number; announce: boolean }) {
  return (
    <span title="Forma de poder" style={{ display: 'inline-flex', color: tone.heliodoro.fg, flexShrink: 0 }}>
      <Zap size={size} aria-hidden />
      {announce && <span className="sr-only">Forma de poder</span>}
    </span>
  )
}

export function FormaCard({ forma, isActive, accent, onActivate, showPoderNote, showAcciones }: {
  forma: FormaCantor
  isActive: boolean
  accent: Accent
  onActivate?: () => void
  showPoderNote: boolean
  showAcciones: boolean
}) {
  return (
    <li
      style={{
        listStyle: 'none', borderRadius: radius.md, padding: '12px 16px',
        border: isActive ? `1.5px solid ${accent.borderStrong}` : `1px solid ${c.border}`,
        background: isActive ? accent.wash(8, c.s2) : c.s2,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }}>
          {forma.esPoder && <PoderMark announce={!showPoderNote} />}
          <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 650, lineHeight: 1.2, color: isActive ? accent.fg : c.text }}>
            {forma.nombre}
          </span>
          {isActive && (
            <span style={{ ...eyebrow, color: accent.fg, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Check size={13} aria-hidden strokeWidth={2.5} />
              Activa
            </span>
          )}
        </div>
        {onActivate && (
          <Button variant="secondary" size="md" onClick={onActivate} aria-label={`Activar forma ${forma.nombre}`} style={{ flexShrink: 0 }}>
            Activar
          </Button>
        )}
      </div>
      <p style={{ fontSize: fs.sm, color: accent.fg, marginTop: 4 }}>{forma.spren}</p>
      <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 4, lineHeight: 1.5 }}>{forma.bonos}</p>
      {showPoderNote && forma.esPoder && (
        <p style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: fs.sm, color: tone.heliodoro.fg, marginTop: 6, fontStyle: 'italic' }}>
          <TriangleAlert size={14} aria-hidden style={{ marginTop: 2 }} />
          Vacíospren — influencia de Odium
        </p>
      )}
      {showAcciones && forma.accionesEspeciales?.map((a) => (
        <p key={a} style={{ fontSize: fs.sm, color: tone.heliodoro.fg, marginTop: 4, lineHeight: 1.45 }}>{a}</p>
      ))}
    </li>
  )
}

export function FormaPickerSheet({ open, onClose, formas, activa, accent, onActivate }: {
  open: boolean
  onClose: () => void
  formas: FormaCantor[]
  activa: string | null
  accent: Accent
  onActivate: (nombre: string) => void
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Seleccionar forma activa"
      description="Solo puedes estar en una forma a la vez. El cambio ocurre durante una alta tormenta."
      footer={<Button variant="secondary" size="lg" onClick={onClose} data-autofocus fullWidth>Cerrar</Button>}
    >
      {formas.length === 0 ? (
        <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.5 }}>
          Aún no tienes ninguna forma. Aprende un talento de Formas en el árbol de cantor para desbloquear las primeras.
        </p>
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {formas.map((forma) => (
            <FormaCard
              key={forma.nombre}
              forma={forma}
              isActive={activa === forma.nombre}
              accent={accent}
              showPoderNote
              showAcciones={false}
              onActivate={activa !== forma.nombre ? () => onActivate(forma.nombre) : undefined}
            />
          ))}
        </ul>
      )}
    </Sheet>
  )
}
