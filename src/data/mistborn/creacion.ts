/**
 * Options of the steps of the guided creation of Nacidos de la bruma that are a choice (`WorldConfig.creacion.pasos`, steps
 * `creacion:<clave>`). Loaded lazily by the step through `opciones.cargar`, so none of it reaches the main chunk (§8, risk 6).
 *
 * «¿Quieres ser alomante?» (26-10-2026): every allomantic possibility of Era 1, so the director can later hide the ones the table
 * does not offer (`ocultas` of the step). It is a narrative choice: the metalborn path of the sheet is still the director's.
 */
import type { OpcionCreacion } from '../../worlds/types'
import { METALES } from './metales'

export const OPCIONES_ALOMANCIA: OpcionCreacion[] = [
  { id: 'no', label: 'No', descripcion: 'Sin alomancia, al menos por ahora.' },
  {
    id: 'nacido-de-la-bruma', label: 'Nacido de la bruma',
    descripcion: 'Todos los metales. Muy raro: solo si el director y el jugador lo pactan, y como mucho uno en la mesa.',
  },
  ...METALES.filter((m) => m.eras.includes('era1')).map((m) => ({
    id: `brumoso:${m.id}`,
    label: `Brumoso de ${m.nombre.toLowerCase()}`,
    descripcion: m.nombreBrumoso,
  })),
]
