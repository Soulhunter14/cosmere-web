/**
 * Components of Nacidos de la bruma for the character sheet. Only CharacterDetailPage (and the tabs of F4) load them, ALWAYS with
 * `React.lazy(() => import('../../components/mistborn').then((m) => ({ default: m.X })))` (§7.4 rule 4), so neither they nor the data
 * they import BY FILE (caminosNacidosDelMetal, origenes…) reach the main chunk (§8, risk 6). Meeting-point file: later tasks add lines.
 */
export { CaminoMetalPicker } from './CaminoMetalPicker'
export type { CaminoMetalPickerProps } from './CaminoMetalPicker'
export { BendicionPicker } from './BendicionPicker'
export type { BendicionPickerProps } from './BendicionPicker'
