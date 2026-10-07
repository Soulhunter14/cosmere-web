/**
 * Configuration of the Stormlight world (Roshar; manual «Archivo de las Tormentas»).
 * It describes what the app already shows, except the two things T50 changed on purpose (Q3, Q22): the skill table, now the book's one (the same
 * for every world), and `bonosServidor`, now on (the sheet, the dice roller and the Bolsa add the attribute bonus the server computes, a cantor's form).
 * Meeting-point file: later tasks add lines, they never reorder them.
 */
import { Gem } from 'lucide-react'
import { tone } from '../theme'
import { RADIANT_ORDERS } from '../data/radiantOrders'
import type { WorldConfig } from './types'
import { HABILIDADES_COSMERE } from './skills'
import { iconoHumano, iconoOrden, iconoOyente } from './stormlight.icons'
import { STORMLIGHT_TOPICS } from './stormlight.topics'
import { DATA } from './stormlight.data'

export const STORMLIGHT: WorldConfig = {
  id: 'stormlight',
  nombre: 'Archivo de las Tormentas',
  nombreCorto: 'Tormentas',
  nombreDe: 'del Archivo de las Tormentas', // «reglas de combate {nombreDe}» (CombatPage: the text it already shows today)
  planeta: 'Roshar',
  emblema: 'archivo-tormentas',
  eras: null,
  features: {
    caminoRadiante: true,
    idealesJurados: true,
    marcos: true,
    formasCantor: true,
    potencias: true,
    artesMetalicas: false,
    arquillas: false,
    mencionSpren: true,
    pestanaAventura: true,
    eras: false,
    bonosServidor: true, // T50 (Q22): the server's `bonosAtributos` (a cantor's form) count on the sheet, the dice roller and the Bolsa
    equipoInicial: false,
    origenes: false,
    catalogoDePrecios: false,
    legados: false,
  },
  // The book's skill table, the same one every world reads on the sheet, the dice roller and the NPC page (T50, Q3)
  habilidades: HABILIDADES_COSMERE,
  habilidadesInvestidas: [],
  ascendencias: [
    { id: 'Humano', label: 'Humano', tone: tone.cuarzo, icono: iconoHumano, puntosAtributoBase: 12 },
    { id: 'Oyente', label: 'Oyente', tone: tone.amatista, icono: iconoOyente, puntosAtributoBase: 12 },
  ],
  caminoInvestido: {
    field: 'caminoRadiante',
    label: 'Orden',
    excluyente: true,
    // The ten radiant orders, with the name and colour the lists and hubs show today (radiantOrders.ts already travels in the main bundle)
    caminos: RADIANT_ORDERS.map((o) => ({ id: o.id, nombre: o.name, color: o.color })),
    insignia: true, // RadiantOrderIcon: the official round glyph, 16 px in the pills
  },
  recursos: [],
  derivados: [],
  moneda: { simbolo: 'mc', nombre: 'Marcos', imagen: null, decimales: 0 },
  // No levantamientoKg: the Bolsa only has a carrying capacity today (BolsaDetailPage `getCapacity`)
  tablas: { cargaKg: [22.5, 45, 112.5, 225, 1125, 2250] },
  enciclopedia: STORMLIGHT_TOPICS,
  textos: {
    sinInvestidura: 'Solo disponible para Radiantes', // CharacterDetailPage.tsx
    vacioTalentos: 'Asigna un Camino Heroico u Orden Radiante en la ficha para ver los talentos disponibles.', // TalentosDetailPage.tsx
  },
  // themeBg: the colours themeStore.ts used to hold itself; `applyTheme` now reads them from here (T07). No data-world
  // attribute: Stormlight has no theme block in index.css, its tokens are the base ones
  tema: { dataWorld: null, themeBg: { light: '#e8ecf1', dark: '#0a0e15' } },
  // investidura: the current StatIcons.investidura (src/lib/gameIcons.ts)
  iconos: { investidura: Gem, caminoInvestido: iconoOrden },
  // Nothing to load: Stormlight's data already travel in the main bundle, so `loadData` resolves to the same object as
  // `syncData`. (§7.1 writes `() => import('./stormlight.data')…`, but importing lazily a module that this file also
  // imports statically splits nothing and makes the build warn INEFFECTIVE_DYNAMIC_IMPORT.)
  loadData: () => Promise.resolve(DATA),
  syncData: DATA,
}
