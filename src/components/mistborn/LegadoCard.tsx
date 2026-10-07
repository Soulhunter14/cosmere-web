/**
 * The legacy of a character on the «Trasfondo» tab (adventure «El legado de los nacidos de la bruma», L.19-23 / PDF 22-26): what it is,
 * how it links to the other era, its two questions with the character's answers and its extra skill (Era 1) or its starting rewards (Era 2). The sheet only shows
 * them: the skill and the reward are written by hand, because the app does not track skills of utility or culture. Loaded lazily from
 * components/mistborn/index.ts and importing its data BY FILE, so none of it reaches the main chunk (§8, risk 6).
 */
import type { CSSProperties } from 'react'
import { Lock, Pencil, ScrollText } from 'lucide-react'
import { Button, Card } from '../ui'
import { RECOMPENSA_POR_DEFECTO, getLegado } from '../../data/mistborn/legados'
import { useWorldConfig } from '../../store/campaignStore'
import { AVISO_CERRADO } from '../../lib/cierreCampana'
import { c, eyebrow, font, fs, pill, tone } from '../../theme'

export interface LegadoCardProps {
  /** `Character.legado`; `''` = none */
  legado: string
  /** `Character.legadoRespuestas`, in the order of the questions */
  respuestas: string[]
  /** Opens the LegadoPicker; absent when the viewer cannot change it (or the sheet is in edit mode) */
  onElegir?: () => void
  /** Opens the LegadoPicker on the questions; absent like `onElegir` */
  onResponder?: () => void
  /** The started campaign locks the legacy for this viewer (a player): says why there is nothing to change */
  cerrado?: boolean
}

const nombreEra = (era: string) => (era === 'era1' ? 'Era 1' : 'Era 2')

export function LegadoCard({ legado, respuestas, onElegir, onResponder, cerrado = false }: LegadoCardProps) {
  const cfg = useWorldConfig()
  const def = getLegado(legado)
  const t = cfg.eras?.find((e) => e.id === def?.era)?.tone ?? tone.cuarzo
  const conexion = def && getLegado(def.conexion)

  const avisoCerrado = cerrado && (
    <p style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: fs.xs, color: c.subtle }}>
      <Lock size={13} aria-hidden /> {AVISO_CERRADO}
    </p>
  )

  if (!def) {
    return (
      <Card padding="16px 18px" style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <ScrollText size={20} aria-hidden style={{ color: c.subtle, flexShrink: 0 }} />
        <p style={{ flex: 1, minWidth: 180, fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>
          Sin legado. El legado es el trasfondo del personaje en la aventura (Convicto, Pilluelo, Noble…).
        </p>
        {onElegir && <Button variant="secondary" onClick={onElegir}>Elegir legado</Button>}
        {avisoCerrado && <div style={{ flexBasis: '100%' }}>{avisoCerrado}</div>}
      </Card>
    )
  }

  const subtitulo: CSSProperties = { ...eyebrow, marginBottom: 6 }
  const respondidas = respuestas.some((r) => r.trim() !== '')

  return (
    <Card padding="16px 18px" style={{ display: 'flex', flexDirection: 'column', gap: 14, borderColor: t.border }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ ...eyebrow, color: t.fg, marginBottom: 4 }}>Legado · {nombreEra(def.era)}</p>
          <h2 style={{ fontFamily: font.display, fontSize: fs.lg + 3, fontWeight: 600, color: c.text, lineHeight: 1.2 }}>{def.nombre}</h2>
        </div>
        {onElegir && (
          <Button variant="secondary" icon={<Pencil size={16} aria-hidden />} onClick={onElegir}>Cambiar</Button>
        )}
      </div>

      <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.text, lineHeight: 1.55 }}>{def.resumen}</p>

      {conexion && (
        <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>
          <span style={{ ...pill(t), marginRight: 8 }}>{conexion.nombre} · {nombreEra(conexion.era)}</span>
          {def.vinculo}
        </p>
      )}

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
          <p style={{ ...eyebrow }}>Preguntas para el personaje</p>
          {onResponder && (
            <Button variant="ghost" size="sm" onClick={onResponder}>{respondidas ? 'Editar respuestas' : 'Responder'}</Button>
          )}
        </div>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {def.preguntas.map((p, i) => {
            const respuesta = respuestas[i]?.trim()
            return (
              <li key={p} style={{ display: 'flex', gap: 8, lineHeight: 1.45 }}>
                <span aria-hidden style={{ color: t.fg, fontSize: fs.sm }}>◆</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: fs.sm, color: c.muted }}>{p}</p>
                  <p style={{
                    marginTop: 4, fontFamily: font.display, fontSize: fs.md + 1, lineHeight: 1.55, whiteSpace: 'pre-wrap',
                    color: respuesta ? c.text : c.subtle, fontStyle: respuesta ? 'normal' : 'italic',
                  }}>
                    {respuesta || 'Sin responder'}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {def.pericia && (
        <div>
          <p style={subtitulo}>Pericia adicional</p>
          <p style={{ fontSize: fs.sm, color: c.text, lineHeight: 1.45 }}>{def.pericia}</p>
        </div>
      )}

      {def.recompensas && (
        <div>
          <p style={subtitulo}>Recompensa inicial (solo una)</p>
          <p style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45, marginBottom: 8 }}>
            Depende de lo que hizo {conexion ? `el ${conexion.nombre}` : 'el personaje conectado'} en la Era 1.
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...def.recompensas, { ...RECOMPENSA_POR_DEFECTO, condicion: 'Si ninguna de las anteriores encaja.' }].map((r) => (
              <li key={r.nombre} style={{ fontSize: fs.sm, lineHeight: 1.45 }}>
                <span style={{ fontWeight: 650, color: c.text }}>{r.nombre}.</span>{' '}
                <span style={{ color: c.muted }}>{r.condicion}</span>{' '}
                <span style={{ color: c.text }}>{r.efecto}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {avisoCerrado}
    </Card>
  )
}
