/**
 * Picker of the legacy of a character (adventure «El legado de los nacidos de la bruma», L.19-23 / PDF 22-26), in two steps: the legacy
 * (the six of the era of the campaign plus «Sin legado») and then the answers to its two «Preguntas para el personaje». It can open on
 * the second step to edit the answers of the saved legacy. The owner or the director use it outside edit mode, with an immediate save
 * (like the Blessings). In Era 2 each row says which Era 1 legacy it is linked to: offering only the ones linked to the Era 1 characters
 * of the group is the director's call. It writes `legado` and `legadoRespuestas` and nothing else; when the legacy changes, the page asks
 * before the old answers go. Loaded lazily from components/mistborn/index.ts and importing its data BY FILE, so none of it reaches the
 * main chunk (§8, risk 6).
 */
import { useId, useState } from 'react'
import { Button, Sheet, Textarea } from '../ui'
import { LEGADOS, getLegado } from '../../data/mistborn/legados'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { c, fs, tone } from '../../theme'
import { FilaOpcion } from './FilaOpcion'

/** Same limit as `MistbornData.MaxRespuestaLegado` in the API */
const MAX_RESPUESTA = 2000

export interface LegadoPickerProps {
  open: boolean
  onClose: () => void
  /** Legacy the character has now (`Character.legado`); `''` = none */
  value: string
  /** Saved answers (`Character.legadoRespuestas`), in the order of the questions */
  respuestas: string[]
  /** `preguntas` opens straight on the answers of the saved legacy */
  pasoInicial?: 'legado' | 'preguntas'
  /** Answers come trimmed, and `[]` when both are empty */
  onConfirm: (legado: string, respuestas: string[]) => void
}

/** Trimmed answers, or `[]` when there is nothing written */
const normalizar = (r: string[]) => {
  const limpias = r.map((x) => x.trim())
  return limpias.some((x) => x !== '') ? limpias : []
}

const mismas = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i])

export function LegadoPicker({ open, onClose, value, respuestas, pasoInicial = 'legado', onConfirm }: LegadoPickerProps) {
  const cfg = useWorldConfig()
  const era = useEra()
  const idBase = useId()
  // The legacies of the era of the campaign; a saved legacy of the other era (an older choice) stays visible so it can be removed
  const opciones = LEGADOS.filter((l) => !era || l.era === era || l.id === value)
  const toneDe = (e: string) => cfg.eras?.find((x) => x.id === e)?.tone ?? tone.cuarzo

  // The picker is mounted when it opens (the sheet renders it only then), so the initial state is the saved one
  const [paso, setPaso] = useState<'legado' | 'preguntas'>(pasoInicial === 'preguntas' && value ? 'preguntas' : 'legado')
  const [seleccion, setSeleccion] = useState(value)
  const [borrador, setBorrador] = useState<[string, string]>([respuestas[0] ?? '', respuestas[1] ?? ''])

  const def = getLegado(seleccion)
  // Back to the saved legacy, its saved answers come back; another legacy starts blank (its questions are different)
  const elegir = (id: string) => {
    if (id === seleccion) return
    setSeleccion(id)
    setBorrador(id === value ? [respuestas[0] ?? '', respuestas[1] ?? ''] : ['', ''])
  }

  const finales = seleccion ? normalizar(borrador) : []
  const hayCambio = seleccion !== value || !mismas(finales, normalizar(respuestas))
  const guardar = () => onConfirm(seleccion, finales)

  if (paso === 'preguntas' && def) {
    return (
      // Its own key: switching steps mounts a new Sheet, so the focus goes to the first answer as it does on opening
      <Sheet
        key="preguntas"
        open={open}
        onClose={onClose}
        title={`Legado · ${def.nombre}`}
        description="Responde las preguntas de tu legado. Puedes dejarlas en blanco y completarlas más adelante."
        maxWidth={520}
        footer={(
          <>
            <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={() => setPaso('legado')}>Atrás</Button>
            <Button size="lg" style={{ flex: 2 }} disabled={!hayCambio} onClick={guardar}>Guardar</Button>
          </>
        )}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* The question is the label in sentence case: the uppercase eyebrow of Field is hard to read for a whole sentence */}
          {def.preguntas.map((pregunta, i) => (
            <div key={pregunta} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <label htmlFor={`${idBase}-${i}`} style={{ fontSize: fs.base, fontWeight: 600, color: c.text, lineHeight: 1.4 }}>{pregunta}</label>
              <Textarea
                id={`${idBase}-${i}`}
                rows={4}
                maxLength={MAX_RESPUESTA}
                value={borrador[i]}
                aria-describedby={`${idBase}-${i}-cuenta`}
                data-autofocus={i === 0 || undefined}
                onChange={(e) => {
                  const texto = e.target.value
                  setBorrador((cur) => (i === 0 ? [texto, cur[1]] : [cur[0], texto]))
                }}
                placeholder="Tu respuesta…"
              />
              <p id={`${idBase}-${i}-cuenta`} style={{ fontSize: fs.xs, color: c.subtle, textAlign: 'right' }}>{borrador[i].length}/{MAX_RESPUESTA}</p>
            </div>
          ))}
        </div>
      </Sheet>
    )
  }

  return (
    <Sheet
      key="legado"
      open={open}
      onClose={onClose}
      title="Legado"
      description="El trasfondo del personaje y su lugar en el mundo. Después responderás sus dos preguntas."
      maxWidth={520}
      footer={(
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          {seleccion ? (
            <Button size="lg" style={{ flex: 2 }} onClick={() => setPaso('preguntas')}>Siguiente</Button>
          ) : (
            <Button size="lg" style={{ flex: 2 }} disabled={!hayCambio} onClick={guardar}>Guardar</Button>
          )}
        </>
      )}
    >
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {opciones.map((l) => {
          const conexion = getLegado(l.conexion)
          const t = toneDe(l.era)
          return (
            <li key={l.id}>
              <FilaOpcion titulo={l.nombre} t={t} selected={seleccion === l.id} onClick={() => elegir(l.id)}>
                <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>{l.resumen}</span>
                {conexion && (
                  <span style={{ fontSize: fs.xs, color: c.subtle, lineHeight: 1.4 }}>
                    Conectado con {conexion.nombre} ({conexion.era === 'era1' ? 'Era 1' : 'Era 2'})
                  </span>
                )}
              </FilaOpcion>
            </li>
          )
        })}
        <li>
          <FilaOpcion titulo="Sin legado" t={tone.cuarzo} selected={seleccion === ''} onClick={() => elegir('')} />
        </li>
      </ul>
    </Sheet>
  )
}
