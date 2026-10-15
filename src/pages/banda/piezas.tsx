/** Small shared components of «La banda»: origin chip, dots, who acts, an amount field and a rule's text. Labels live in etiquetas.ts. */
import type { InputHTMLAttributes } from 'react'
import { Badge, Field, Input, Select } from '../../components/ui'
import { filtrarCantidad } from './etiquetas'
import type { OrigenRegla, TextoEra } from '../../lib/banda/tipos'
import { textoEra } from '../../lib/banda/tipos'
import type { Era } from '../../types'
import type { ToneName } from '../../theme'
import { c, fs, tone } from '../../theme'
import { nombreActor, type Actor } from './estado'

const ORIGEN: Record<OrigenRegla, { label: string; tono: ToneName }> = {
  oficial: { label: 'Oficial', tono: 'zafiro' },
  casero: { label: 'Casero', tono: 'cuarzo' },
  inferido: { label: 'Inferido', tono: 'topacio' },
}

/** Where a rule comes from: «Oficial» (the book), «Casero» (our table) or «Inferido» (a gap or an erratum of the book we filled) */
export function OrigenChip({ origen }: { origen: OrigenRegla }) {
  const o = ORIGEN[origen]
  return <Badge tone={o.tono}>{o.label}</Badge>
}

/** A row of dots for a small track (loyalty 0-3, notoriety 0-6); the number is spelled for screen readers */
export function Puntos({ valor, max, tono: t, etiqueta }: { valor: number; max: number; tono: ToneName; etiqueta: string }) {
  return (
    <span role="img" aria-label={`${etiqueta}: ${valor} de ${max}`} style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          aria-hidden
          style={{
            width: 9, height: 9, borderRadius: 999,
            background: i < valor ? tone[t].fg : 'transparent',
            border: `1.5px solid ${i < valor ? tone[t].fg : c.borderBright}`,
          }}
        />
      ))}
    </span>
  )
}

/**
 * An amount of money: only digits and a decimal separator get in (filtrarCantidad). It passes the rest of its props to the input, so a
 * `Field` around it can wire its label and hint
 */
export function CampoCantidad({ valor, onCambio, ...resto }: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> & {
  valor: string
  onCambio: (texto: string) => void
}) {
  return <Input {...resto} inputMode="decimal" autoComplete="off" value={valor} onChange={(e) => onCambio(filtrarCantidad(e.target.value))} />
}

const claveActor = (a: Actor) => (a.tipo === 'pj' ? `pj:${a.characterId}` : 'director')

/**
 * Who does it: a select among the characters (and the director, when allowed). With a single choice it is a line of text; with none,
 * the reason (a player without a character in the campaign)
 */
export function SelectorActor({ actores, valor, onChange, conDirector = true, etiqueta = '¿Quién lo hace?' }: {
  actores: Actor[]
  valor: Actor | null
  onChange: (a: Actor | null) => void
  conDirector?: boolean
  etiqueta?: string
}) {
  const opciones = actores.filter((a) => conDirector || a.tipo === 'pj')
  if (opciones.length === 0) {
    return <p style={{ fontSize: fs.sm, color: tone.topacio.fg }}>Hace falta un personaje en la campaña para hacerlo.</p>
  }
  if (opciones.length === 1) {
    return <p style={{ fontSize: fs.sm, color: c.muted }}>Lo hace <strong style={{ color: c.text }}>{nombreActor(opciones[0])}</strong>.</p>
  }
  return (
    <Field label={etiqueta}>
      <Select value={valor ? claveActor(valor) : ''} onChange={(e) => onChange(opciones.find((a) => claveActor(a) === e.target.value) ?? null)}>
        <option value="">Elige…</option>
        {opciones.map((a) => (
          <option key={claveActor(a)} value={claveActor(a)}>{a.tipo === 'pj' ? a.nombre : `Director${a.nombre ? ` (${a.nombre})` : ''}`}</option>
        ))}
      </Select>
    </Field>
  )
}

/**
 * A rule as the page shows it: its text (the book's rule adapted in our own words, or our own rule), how this table plays it when that
 * differs («En esta mesa»), and where it comes from: the origin and the chapter and section of the book («Manual · Cap. 8 › Refugios»)
 */
export function TextoRegla({ texto, casero, origen, cita, era, conFuente = true }: {
  texto: TextoEra
  casero?: TextoEra
  origen: OrigenRegla
  cita?: string
  era: Era | null
  /** Show the origin and the reference (a refuge's card leaves them out for our own types) */
  conFuente?: boolean
}) {
  const principal = textoEra(texto, era)
  const nota = textoEra(casero, era)
  const estilo = { fontSize: fs.sm, color: c.muted, lineHeight: 1.5, whiteSpace: 'pre-line' as const }
  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {principal && <p style={estilo}>{principal}</p>}
      {nota && (
        <p style={{ ...estilo, paddingLeft: 10, borderLeft: `2px solid ${tone.cuarzo.border}` }}>
          <strong style={{ color: c.text, fontWeight: 650 }}>En esta mesa: </strong>{nota}
        </p>
      )}
      {conFuente && (
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          <OrigenChip origen={origen} />
          {cita && <span style={{ fontSize: fs.xs, color: c.subtle }}>{cita}</span>}
        </div>
      )}
    </div>
  )
}
