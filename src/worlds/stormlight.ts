/**
 * Configuration of the Stormlight world (Roshar; manual «Archivo de las Tormentas»).
 * Every value is what the app already shows today: this file describes the current behaviour, it changes none (P1).
 * Meeting-point file: later tasks add lines, they never reorder them.
 */
import { Gem } from 'lucide-react'
import { tone } from '../theme'
import type { WorldConfig } from './types'
import {
  HABILIDADES_STORMLIGHT_LEGADO, HABILIDADES_STORMLIGHT_PNJ_LEGADO, HABILIDADES_STORMLIGHT_TIRADOR_LEGADO,
} from './skills'
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
    bonosServidor: false, // T50 turns it on (Q22)
    equipoInicial: false,
    origenes: false,
  },
  // The three legacy tables (see skills.ts): T50 points the three surfaces to HABILIDADES_COSMERE and deletes them
  habilidades: HABILIDADES_STORMLIGHT_LEGADO,
  habilidadesTirador: HABILIDADES_STORMLIGHT_TIRADOR_LEGADO,
  habilidadesPnj: HABILIDADES_STORMLIGHT_PNJ_LEGADO,
  habilidadesInvestidas: [],
  ascendencias: [
    { id: 'Humano', label: 'Humano', tone: tone.cuarzo, icono: iconoHumano, puntosAtributoBase: 12 },
    { id: 'Oyente', label: 'Oyente', tone: tone.amatista, icono: iconoOyente, puntosAtributoBase: 12 },
  ],
  caminoInvestido: { field: 'caminoRadiante', label: 'Orden', excluyente: true },
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
