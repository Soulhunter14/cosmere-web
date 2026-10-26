/**
 * Picker of the legacy of a character (adventure «El legado de los nacidos de la bruma», L.19-23 / PDF 22-26), in two steps: the legacy
 * (the six of the era of the campaign plus «Sin legado») and then the answers to its «Preguntas para el personaje» (three in Era 1, two in Era 2). It can open on
 * the second step to edit the answers of the saved legacy. The owner or the director use it outside edit mode, with an immediate save
 * (like the Blessings). In Era 2 each row says which Era 1 legacy it is linked to: offering only the ones linked to the Era 1 characters
 * of the group is the director's call; an Era 1 row does not show its Era 2 link for now (24 Oct 2026). Under each question, the legacy's
 * example answers are a hint. It writes `legado` and `legadoRespuestas` and nothing else; when the legacy changes, the page asks
 * before the old answers go. Loaded lazily from components/mistborn/index.ts and importing its data BY FILE, so none of it reaches the
 * main chunk (§8, risk 6).
 */
import { useId, useState } from 'react'
import { Button, Sheet } from '../ui'
import { getLegado } from '../../data/mistborn/legados'
import { PasoLegado } from './PasoLegado'
import { PreguntaLegado } from './PreguntaLegado'

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

/** A draft per question of the legacy `id`, from the saved answers (in the order of the questions) */
const borradorDe = (id: string, guardadas: string[]) => (getLegado(id)?.preguntas ?? []).map((_, i) => guardadas[i] ?? '')

export function LegadoPicker({ open, onClose, value, respuestas, pasoInicial = 'legado', onConfirm }: LegadoPickerProps) {
  const idBase = useId()

  // The picker is mounted when it opens (the sheet renders it only then), so the initial state is the saved one
  const [paso, setPaso] = useState<'legado' | 'preguntas'>(pasoInicial === 'preguntas' && value ? 'preguntas' : 'legado')
  const [seleccion, setSeleccion] = useState(value)
  // One draft per question of the legacy (three in Era 1, two in Era 2): the saved answers in order, blank where there is none
  const [borrador, setBorrador] = useState<string[]>(() => borradorDe(value, respuestas))

  const def = getLegado(seleccion)
  // Back to the saved legacy, its saved answers come back; another legacy starts blank (its questions are different)
  const elegir = (id: string) => {
    if (id === seleccion) return
    setSeleccion(id)
    setBorrador(borradorDe(id, id === value ? respuestas : []))
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
            <PreguntaLegado
              key={pregunta}
              id={`${idBase}-${i}`}
              pregunta={pregunta}
              ejemplos={def.ejemplos?.[i]}
              value={borrador[i] ?? ''}
              autoFocus={i === 0}
              onChange={(texto) => setBorrador((cur) => cur.map((x, j) => (j === i ? texto : x)))}
            />
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
      description="El trasfondo del personaje y su lugar en el mundo. Después responderás sus preguntas."
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
      <PasoLegado value={seleccion} onChange={elegir} conSinLegado />
    </Sheet>
  )
}
