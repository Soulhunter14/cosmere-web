/**
 * Components of Nacidos de la bruma for the character sheet. Only CharacterDetailPage (and the tabs of F4) load them, ALWAYS with
 * `React.lazy(() => import('../../components/mistborn').then((m) => ({ default: m.X })))` (§7.4 rule 4), so neither they nor the data
 * they import BY FILE (caminosNacidosDelMetal, origenes…) reach the main chunk (§8, risk 6). Meeting-point file: later tasks add lines.
 */
export { CaminoMetalPicker } from './CaminoMetalPicker'
export type { CaminoMetalPickerProps } from './CaminoMetalPicker'
export { BendicionPicker } from './BendicionPicker'
export type { BendicionPickerProps } from './BendicionPicker'
export { MetalPicker } from './MetalPicker'
export type { MetalPickerProps } from './MetalPicker'
// The «al elegir camino» flow (T28): pure functions that CharacterDetailPage loads with `await import()` inside its mutations
export { planAplicarCaminoMetal, planQuitarCaminoMetal, enlazarMetas, metalesDelCamino, faltanHuecosCognitivos, idPoder } from './caminoMetalFlujo'
export type { EntornoCaminoMetal, SeleccionCaminoMetal, MetaPendiente, PlanCaminoMetal } from './caminoMetalFlujo'
// The «Artes metálicas» tab (T30): ArtesMetalicasTab is loaded lazily by the sheet; «Añadir poder» (the director grants a spike, an alloy or a medallion) runs `planAnadirPoder` in its mutation
export { ArtesMetalicasTab } from './ArtesMetalicasTab'
export type { ArtesMetalicasTabProps } from './ArtesMetalicasTab'
export { PoderCard } from './PoderCard'
export type { PoderCardProps } from './PoderCard'
export { planAnadirPoder, faltaHuecoParaPoder } from './caminoMetalFlujo'
export type { PlanAnadirPoder } from './caminoMetalFlujo'
// «Beber vial» (T31): BeberVialSheet is loaded lazily by the character sheet and, later, by the talents page (T37b). `vial.ts` is tiny and the character sheet
// imports it BY FILE for the optimistic copy of the character; its pure rules are re-exported here for whoever loads the barrel with `await import()`
export { BeberVialSheet } from './BeberVialSheet'
export type { BeberVialSheetProps } from './BeberVialSheet'
export { conVialBebido, esPoderDelVial, quemaElVial } from './vial'
