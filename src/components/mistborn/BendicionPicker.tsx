/**
 * Picker of the kandra Blessings (Nacidos de la bruma, L.34-35 / PDF 40-41): five options, at most two and always different. A kandra
 * picks one when the character is created; the second is a reward of rank 3 that only the director grants (Q16). Whoever is not the
 * director can set the FIRST one while none is saved; once saved the picker is read-only for them (the server enforces the same:
 * `MistbornRules.RestringirCambiosNoGm`, §5.2). It writes `bendiciones` and nothing else. Loaded lazily from
 * components/mistborn/index.ts and importing its data BY FILE, so none of it reaches the main chunk (§8, risk 6).
 */
import { useState } from 'react'
import { Button, Sheet } from '../ui'
import { ASCENDENCIAS_MB, BENDICIONES_KANDRA, type BendicionKandra } from '../../data/mistborn/origenes'
import { useWorldConfig } from '../../store/campaignStore'
import { c, fs, pill, tone } from '../../theme'
import { FilaOpcion } from './FilaOpcion'

export interface BendicionPickerProps {
  open: boolean
  onClose: () => void
  /** Blessings the character carries now (`Character.bendiciones`) */
  value: string[]
  /** Director: up to the maximum and any change. Otherwise: only the first Blessing, and only while none is saved */
  isGm: boolean
  onConfirm: (bendiciones: string[]) => void
}

const NOMBRE_OBJETIVO: Record<BendicionKandra['bonos'][number]['objetivo'], string> = {
  fuerza: 'Fuerza', velocidad: 'Velocidad', intelecto: 'Intelecto', voluntad: 'Voluntad', discernimiento: 'Discernimiento', presencia: 'Presencia',
  desvio: 'Desvío',
}

const mismos = (a: string[], b: string[]) => a.length === b.length && a.every((id) => b.includes(id))

export function BendicionPicker({ open, onClose, value, isGm, onConfirm }: BendicionPickerProps) {
  const cfg = useWorldConfig()
  const reglas = ASCENDENCIAS_MB.find((a) => a.bendiciones)?.bendiciones
  const t = cfg.ascendencias.find((a) => a.bendiciones)?.tone ?? tone.esmeralda

  const soloLectura = !isGm && value.length > 0
  const maximo = isGm ? (reglas?.maximo ?? 2) : 1

  // The picker is mounted when it opens (the sheet renders it only then), so the initial selection is the saved one
  const [seleccion, setSeleccion] = useState(value)

  const alternar = (id: string) => setSeleccion((cur) => {
    if (cur.includes(id)) return cur.filter((x) => x !== id)
    if (maximo === 1) return [id]
    return cur.length < maximo ? [...cur, id] : cur
  })

  const descripcion = soloLectura
    ? 'Solo el director puede cambiar tu Bendición: una segunda, distinta de la primera, es una recompensa de rango 3.'
    : isGm
      ? `Cada kandra elige una Bendición al crearse; como recompensa de rango ${reglas?.segundaEnRango ?? 3} puede obtener una segunda, distinta de la primera (máximo ${maximo}).`
      : 'Elige tu Bendición: es un aumento permanente que también se aplica bajo Disfraz kandra.'

  const hayCambio = !mismos(seleccion, value) && (isGm || seleccion.length > 0)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Bendición kandra"
      description={descripcion}
      maxWidth={480}
      footer={soloLectura ? (
        <Button variant="secondary" size="lg" fullWidth onClick={onClose} data-autofocus>Cerrar</Button>
      ) : (
        <>
          <Button variant="secondary" size="lg" style={{ flex: 1 }} onClick={onClose}>Cancelar</Button>
          <Button size="lg" style={{ flex: 2 }} disabled={!hayCambio} onClick={() => onConfirm(seleccion)}>Guardar</Button>
        </>
      )}
    >
      <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {BENDICIONES_KANDRA.map((b) => {
          const elegida = seleccion.includes(b.id)
          // With the maximum reached (two for the director) the rest wait until one is deselected; a single choice just replaces itself
          const bloqueada = soloLectura || (!elegida && maximo > 1 && seleccion.length >= maximo)
          return (
            <li key={b.id}>
              <FilaOpcion titulo={b.nombre} t={t} selected={elegida} disabled={bloqueada} onClick={() => alternar(b.id)}>
                <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {b.bonos.map((bono) => (
                    <span key={bono.objetivo} style={{ ...pill(t), fontSize: fs.xs }}>+{bono.valor} {NOMBRE_OBJETIVO[bono.objetivo]}</span>
                  ))}
                </span>
                <span style={{ fontSize: fs.sm, color: c.muted, lineHeight: 1.45 }}>{b.descripcion}</span>
              </FilaOpcion>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
