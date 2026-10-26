/**
 * Options of the steps of the guided creation of Nacidos de la bruma that are a choice (`WorldConfig.creacion.pasos`, steps
 * `creacion:<clave>`). Loaded lazily by the step through `opciones.cargar`, so none of it reaches the main chunk (§8, risk 6).
 *
 * «¿Qué tipo quieres ser?» (the second question of the alomancia step, 26-10-2026): every allomantic type of Era 1, each with a
 * short definition in our own words (the full rules are in alomancia.ts), so the director can later hide the ones the table does
 * not offer (`ocultas` of the step). A narrative choice: the metalborn path of the sheet is still the director's.
 */
import type { OpcionCreacion } from '../../worlds/types'
import { getMetal, type MetalId } from './metales'

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

/**
 * «¿Qué tipo de brumoso?» (the step requires «sí» in the one above), in three groups to ease the choice (Xavi, 26-10-2026). The handbook
 * marks no misting as «solo recomendado para jugadores experimentados» (only Feruquimista and Nacido de la bruma, L.19 / PDF 25): the groups
 * are ours, by how often the metal is burnt at the table and how rare it is. The eight common metals are always available (L.167 / PDF 173);
 * the oro misting stayed a secret of the Ministry until the end of Era 1 (L.167-168 / PDF 173-174) and atium is the divine metal, scarce
 * and dear, so the step hides that group (`ocultas`) until the director says otherwise.
 */
const GRUPOS: { titulo: string; metales: MetalId[] }[] = [
  // Common metals with a direct effect in almost any scene
  { titulo: 'Para empezar', metales: ['peltre', 'estano', 'acero', 'hierro', 'cinc', 'laton'] },
  // Common too, but support metals: their value depends on the scene and on the player looking for it
  { titulo: 'Para expertos', metales: ['cobre', 'bronce'] },
  // The book does not take them for granted in Era 1 (see above)
  { titulo: 'Raros y divinos', metales: ['oro', 'atium'] },
]

export const OPCIONES_ALOMANCIA: OpcionCreacion[] = [
  ...GRUPOS.flatMap((g) => g.metales.map(getMetal).map((m) => ({
    id: `brumoso:${m.id}`,
    label: `Brumoso de ${m.nombre.toLowerCase()}`,
    descripcion: `${m.nombreBrumoso}: ${DEFINICION[m.id] ?? 'quema solo este metal.'}`,
    grupo: g.titulo,
  }))),
  {
    id: 'nacido-de-la-bruma', label: 'Nacido de la bruma', grupo: 'Raros y divinos',
    descripcion: 'Quemas todos los metales. Muy raro: solo si el director y el jugador lo pactan, y como mucho uno en la mesa.',
  },
]
