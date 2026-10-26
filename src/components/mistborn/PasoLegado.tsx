/**
 * The list of legacies to choose from: one row per legacy of the era of the campaign with its summary (an Era 1 row does not show its
 * Era 2 link for now). The first screen of LegadoPicker (the sheet) and the «Tu trasfondo» step of the guided creation. Lazy through
 * the barrel, importing its data BY FILE (§8, risk 6).
 */
import { Users } from 'lucide-react'
import { LEGADOS, getLegado } from '../../data/mistborn/legados'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { c, fs, pill, tone } from '../../theme'
import { FilaOpcion } from './FilaOpcion'

export interface PasoLegadoProps {
  /** Id of the chosen legacy; `''` = none */
  value: string
  onChange: (id: string) => void
  disabled?: boolean
  /** Offer «Sin legado» at the end (the sheet does; the guided creation does not) */
  conSinLegado?: boolean
  /** Legacies other characters of the campaign already have (id → how many): each row says so, to spread the crew over the legacies */
  elegidos?: Record<string, number>
}

const yaElegido = (n: number) => (n === 1 ? 'Ya lo ha elegido 1 compañero' : `Ya lo han elegido ${n} compañeros`)

export function PasoLegado({ value, onChange, disabled = false, conSinLegado = false, elegidos = {} }: PasoLegadoProps) {
  const cfg = useWorldConfig()
  const era = useEra()
  // The legacies of the era of the campaign; a saved legacy of the other era (an older choice) stays visible so it can be changed
  const opciones = LEGADOS.filter((l) => !era || l.era === era || l.id === value)
  const toneDe = (e: string) => cfg.eras?.find((x) => x.id === e)?.tone ?? tone.cuarzo

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {opciones.map((l) => {
        const conexion = l.era === 'era2' ? getLegado(l.conexion) : undefined
        const n = elegidos[l.id] ?? 0
        return (
          <li key={l.id}>
            <FilaOpcion titulo={l.nombre} t={toneDe(l.era)} selected={value === l.id} disabled={disabled} onClick={() => onChange(l.id)}>
              <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>{l.resumen}</span>
              {n > 0 && (
                <span style={{ ...pill(tone.topacio), alignSelf: 'flex-start', marginTop: 4 }}>
                  <Users size={12} aria-hidden /> {yaElegido(n)}
                </span>
              )}
              {conexion && (
                <span style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.4 }}>
                  Conectado con {conexion.nombre} ({conexion.era === 'era1' ? 'Era 1' : 'Era 2'})
                </span>
              )}
            </FilaOpcion>
          </li>
        )
      })}
      {conSinLegado && (
        <li>
          <FilaOpcion titulo="Sin legado" t={tone.cuarzo} selected={value === ''} disabled={disabled} onClick={() => onChange('')} />
        </li>
      )}
    </ul>
  )
}
