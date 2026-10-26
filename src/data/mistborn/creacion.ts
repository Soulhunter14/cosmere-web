/**
 * Options of the steps of the guided creation of Nacidos de la bruma that are a choice (`WorldConfig.creacion.pasos`, steps
 * `creacion:<clave>`). Loaded lazily by the step through `opciones.cargar`, so none of it reaches the main chunk (§8, risk 6).
 *
 * «¿Qué tipo quieres ser?» (the second question of the alomancia step, 26-10-2026): every allomantic type of Era 1, each with a
 * short definition in our own words (the full rules are in alomancia.ts), so the director can later hide the ones the table does
 * not offer (`ocultas` of the step). A narrative choice: the metalborn path of the sheet is still the director's.
 */
import type { OpcionCreacion } from '../../worlds/types'
import { METALES, type MetalId } from './metales'

/** What each misting of Era 1 does, in one line (the misting name comes from METALES.nombreBrumoso) */
const DEFINICION: Partial<Record<MetalId, string>> = {
  hierro: 'tira de los metales cercanos hacia ti, o tú hacia ellos.',
  acero: 'empuja los metales cercanos lejos de ti, y lanza monedas como proyectiles.',
  estano: 'agudiza todos tus sentidos: ves, oyes y hueles mucho más allá.',
  peltre: 'fuerza, aguante y resistencia al daño mientras lo quemas.',
  cinc: 'enciende las emociones de los demás sin que sepan que eres tú.',
  laton: 'apaga las emociones de los demás: calma, apatía, miedo que se va.',
  cobre: 'oculta tu alomancia y la de quien tengas cerca a los buscadores.',
  bronce: 'sientes a quien está quemando metales a tu alrededor.',
  oro: 'ves a quien podrías haber sido si hubieras tomado otro camino.',
  atium: 'ves unos instantes del futuro: casi nadie logra tocarte.',
}

/** «¿Quieres ser alomante?» (its own step, so the director can release it before the type) */
export const OPCIONES_ALOMANTE: OpcionCreacion[] = [
  { id: 'si', label: 'Sí', descripcion: 'Quemas un metal para despertar un poder: lo que ya eres en secreto, o lo que esta noche despertará.' },
  { id: 'no', label: 'No', descripcion: 'Sin alomancia, al menos por ahora. Nada te impide descubrirla más adelante.' },
]

/** «¿Qué tipo de brumoso?»: the step requires «sí» in the one above */
export const OPCIONES_ALOMANCIA: OpcionCreacion[] = [
  {
    id: 'nacido-de-la-bruma', label: 'Nacido de la bruma',
    descripcion: 'Quemas todos los metales. Muy raro: solo si el director y el jugador lo pactan, y como mucho uno en la mesa.',
  },
  ...METALES.filter((m) => m.eras.includes('era1')).map((m) => ({
    id: `brumoso:${m.id}`,
    label: `Brumoso de ${m.nombre.toLowerCase()}`,
    descripcion: `${m.nombreBrumoso}: ${DEFINICION[m.id] ?? 'quema solo este metal.'}`,
  })),
]
