/**
 * Configuration of the Mistborn world (Scadrial; manual «Nacidos de la bruma»).
 * Born COMPLETE in T06b so that `npx tsc -b` compiles; the values marked provisional are replaced by the task named
 * next to them. Heavy data never enter here: they live in mistborn.data.ts (lazy). When F3 data exist, import them
 * BY FILE ('../data/mistborn/metales'…), never from the barrel src/data/mistborn/index.ts (§8, risk 6).
 * Meeting-point file: later tasks add lines, they never reorder them.
 */
import { Anvil, Coins, Flame, Sparkle } from 'lucide-react'
import { tone } from '../theme'
import type { WorldConfig } from './types'
import { HABILIDADES_STORMLIGHT_LEGADO } from './skills'
import { iconoCaminoMetal, iconoHumano, iconoKandra, iconoSangreKoloss } from './mistborn.icons'
import { MISTBORN_TOPICS } from './mistborn.topics'

export const MISTBORN: WorldConfig = {
  id: 'mistborn',
  nombre: 'Nacidos de la bruma',
  nombreCorto: 'Bruma',
  nombreDe: 'de Nacidos de la bruma',
  planeta: 'Scadrial',
  emblema: 'cosmere-emblem', // provisional until T46 (then 'nacidos-bruma-emblem')
  // L.372 / PDF 378. Tones are [inferido → Q18]
  eras: [
    { id: 'era1', label: 'Era 1', tone: tone.granate, aviso: 'Era 1: El Mundo de Ceniza. El libro advierte de un tono más sombrío.' },
    { id: 'era2', label: 'Era 2', tone: tone.zafiro, aviso: 'Era 2: Cambio y revolución. Armas de fuego, sangre koloss, ferrin y nacidobles.' },
  ],
  features: {
    caminoRadiante: false,
    idealesJurados: false,
    marcos: false,
    formasCantor: false,
    potencias: false,
    artesMetalicas: true,
    arquillas: true,
    mencionSpren: false,
    pestanaAventura: false, // Q10: the adventure registry per world comes later (§13)
    eras: true,
    bonosServidor: true,
    equipoInicial: true,
    origenes: true,
  },
  habilidades: HABILIDADES_STORMLIGHT_LEGADO, // provisional: T26 replaces it with HABILIDADES_COSMERE; no tirador/pnj tables: Mistborn uses `habilidades` on all three surfaces
  // Alomancia rolls with Voluntad and attacks (L.172 / PDF 178); Feruquimia with Intelecto. Icons are [inferido → Q18]
  habilidadesInvestidas: [
    { nombre: 'Alomancia', atributo: 'voluntad', codigo: 'VOL', icono: Flame, ataque: true },
    { nombre: 'Feruquimia', atributo: 'intelecto', codigo: 'INT', icono: Anvil, ataque: false },
  ],
  // Tones and icons are [inferido → Q18]. Sangre koloss: +1 to the Fuerza maximum (L.38 / PDF 44); Kandra: 6 points (L.34 / PDF 40)
  ascendencias: [
    { id: 'Humano', label: 'Humano', tone: tone.cuarzo, icono: iconoHumano, puntosAtributoBase: 12 },
    { id: 'Kandra', label: 'Kandra', tone: tone.granate, icono: iconoKandra, puntosAtributoBase: 6 },
    { id: 'Sangre koloss', label: 'Sangre koloss', tone: tone.topacio, icono: iconoSangreKoloss, eras: ['era2'], puntosAtributoBase: 12, topeAtributo: { fuerza: 6 } },
  ],
  caminoInvestido: { field: 'caminoMetal', label: 'Camino de nacido del metal', excluyente: true },
  // Keys of the server's `recursos` (§2, `RecursosPermitidos`); arquillas has 2 decimals (óbolo = 0.01 ar, banknote = 10 ar;
  // L.254 / PDF 260). The icons of the three are provisional [inferido → Q18]: the book has none
  recursos: [
    { clave: 'investiduraActual', label: 'Investidura actual', icono: Flame, decimales: 0 },
    { clave: 'cuentasAtium', label: 'Cuentas de atium', icono: Sparkle, decimales: 0 },
    { clave: 'arquillas', label: 'Arquillas', icono: Coins, decimales: 2 },
  ],
  // Keys of `derivadosSet` (§2, §6.3)
  derivados: [
    { clave: 'alomancia.modificador', label: 'Mod.', grupo: 'alomancia' },
    { clave: 'alomancia.limite', label: 'Límite', grupo: 'alomancia' },
    { clave: 'alomancia.dado', label: 'Dado', grupo: 'alomancia' },
    { clave: 'alomancia.alcance', label: 'Alcance', grupo: 'alomancia' },
    { clave: 'feruquimia.modificador', label: 'Mod.', grupo: 'feruquimia' },
    { clave: 'feruquimia.limite', label: 'Límite', grupo: 'feruquimia' },
    { clave: 'feruquimia.dado', label: 'Dado', grupo: 'feruquimia' },
    { clave: 'feruquimia.alcance', label: 'Alcance', grupo: 'feruquimia' },
    { clave: 'feruquimia.cargasMax', label: 'Cargas máx.', grupo: 'feruquimia' },
    { clave: 'feruquimia.mentesALaVez', label: 'Mentes a la vez', grupo: 'feruquimia' },
  ],
  moneda: { simbolo: 'ar', nombre: 'Arquillas', imagen: null /* T45 */, decimales: 2 },
  // L.50 / PDF 56: carrying capacity and lifting capacity by Fuerza bracket
  tablas: { cargaKg: [25, 50, 125, 250, 1250, 2500], levantamientoKg: [50, 100, 250, 500, 2500, 5000] },
  enciclopedia: MISTBORN_TOPICS, // provisional: four topics, T24a completes the list (§7.8)
  textos: {
    sinInvestidura: 'Solo disponible para alomantes',
    // The Stormlight sentence adapted to the Mistborn paths (§7.7 #4 gives only its opening)
    vacioTalentos: 'Asigna un Camino Heroico o un Camino de nacido del metal en la ficha para ver los talentos disponibles.',
  },
  // §7.8 Tema: T44 only changes them if the final palette differs
  tema: { dataWorld: 'mistborn', themeBg: { light: '#ebe8e6', dark: '#0c0b0d' } },
  iconos: { investidura: Flame, caminoInvestido: iconoCaminoMetal },
  loadData: () => import('./mistborn.data').then((m) => m.DATA),
}
