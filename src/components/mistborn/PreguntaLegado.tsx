/**
 * One «Pregunta para el personaje» of a legacy with its answer: the question as the label, the legacy's example answers as a hint and
 * the text area with its counter. Shared by LegadoPicker (the sheet) and the guided creation (CreacionJugador); loaded lazily through
 * the barrel, like the rest of the Mistborn components.
 */
import { Textarea } from '../ui'
import { c, fs } from '../../theme'

/** Same limit as `MistbornData.MaxRespuestaLegado` in the API */
export const MAX_RESPUESTA_LEGADO = 2000

export interface PreguntaLegadoProps {
  /** Id of the text area (the label and the hints point to it) */
  id: string
  pregunta: string
  /** Example answers, shown under the question */
  ejemplos?: string[]
  value: string
  onChange: (texto: string) => void
  autoFocus?: boolean
  disabled?: boolean
  rows?: number
}

export function PreguntaLegado({ id, pregunta, ejemplos, value, onChange, autoFocus = false, disabled = false, rows = 4 }: PreguntaLegadoProps) {
  const hayEjemplos = !!ejemplos?.length
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* The question is the label in sentence case: the uppercase eyebrow of Field is hard to read for a whole sentence */}
      <label htmlFor={id} style={{ fontSize: fs.base, fontWeight: 600, color: c.text, lineHeight: 1.4 }}>{pregunta}</label>
      {hayEjemplos && (
        <p id={`${id}-ejemplos`} style={{ fontSize: fs.xs, color: c.muted, lineHeight: 1.45 }}>
          Por ejemplo: {ejemplos!.join(' · ')}.
        </p>
      )}
      <Textarea
        id={id}
        rows={rows}
        maxLength={MAX_RESPUESTA_LEGADO}
        value={value}
        disabled={disabled}
        aria-describedby={hayEjemplos ? `${id}-ejemplos ${id}-cuenta` : `${id}-cuenta`}
        data-autofocus={autoFocus || undefined}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Tu respuesta…"
      />
      <p id={`${id}-cuenta`} style={{ fontSize: fs.xs, color: c.subtle, textAlign: 'right' }}>{value.length}/{MAX_RESPUESTA_LEGADO}</p>
    </div>
  )
}
