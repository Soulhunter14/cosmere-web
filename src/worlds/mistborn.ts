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
import { HABILIDADES_COSMERE } from './skills'
import { iconoCaminoMetal, iconoHumano, iconoKandra, iconoSangreKoloss } from './mistborn.icons'
import { MISTBORN_TOPICS } from './mistborn.topics'

export const MISTBORN: WorldConfig = {
  id: 'mistborn',
  nombre: 'Nacidos de la bruma',
  nombreCorto: 'Bruma',
  nombreDe: 'de Nacidos de la bruma',
  planeta: 'Scadrial',
  emblema: 'nacidos-bruma-emblem', // the emblem of the book (PDF 410), extracted by T45 into the eager glob of lib/cosmereAssets.ts
  // L.372 / PDF 378. Tones are [inferido → Q18]
  eras: [
    { id: 'era1', label: 'Era 1', tone: tone.cuarzo, aviso: 'Era 1: El Mundo de Ceniza. El libro advierte de un tono más sombrío.' },
    { id: 'era2', label: 'Era 2', tone: tone.topacio, aviso: 'Era 2: Cambio y revolución. Armas de fuego, sangre koloss, ferrin y nacidobles.' },
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
    catalogoDePrecios: true,
    legados: true,
  },
  // The book's table (T26), read on the sheet, the dice roller (from T43) and the NPC page: the same one Stormlight reads since T50
  habilidades: HABILIDADES_COSMERE,
  // Alomancia rolls with Voluntad and attacks (L.172 / PDF 178); Feruquimia with Intelecto. Icons are [inferido → Q18]
  habilidadesInvestidas: [
    { nombre: 'Alomancia', atributo: 'voluntad', codigo: 'VOL', icono: Flame, ataque: true },
    { nombre: 'Feruquimia', atributo: 'intelecto', codigo: 'INT', icono: Anvil, ataque: false },
  ],
  // At creation no attribute takes more than 3 points (L.20 / PDF 26)
  topeCreacionAtributo: 3,
  // Tones and icons are [inferido → Q18]. Sangre koloss: +1 to the Fuerza maximum and up to 4 points in Fuerza at creation (L.38 / PDF 44);
  // Kandra: 6 points to hand out (L.34 / PDF 40)
  ascendencias: [
    { id: 'Humano', label: 'Humano', tone: tone.cuarzo, icono: iconoHumano, puntosAtributoBase: 12 },
    {
      id: 'Kandra', label: 'Kandra', tone: tone.esmeralda, icono: iconoKandra, puntosAtributoBase: 6,
      // The five Blessings (L.34-35 / PDF 40-41), short names for the identity tile: light twin of BENDICIONES_KANDRA (keep both in step)
      bendiciones: [
        { id: 'consciencia', nombre: 'Consciencia' },
        { id: 'potencia', nombre: 'Potencia' },
        { id: 'presencia', nombre: 'Presencia' },
        { id: 'estabilidad', nombre: 'Estabilidad' },
        { id: 'fortaleza', nombre: 'Fortaleza' },
      ],
    },
    {
      id: 'Sangre koloss', label: 'Sangre koloss', tone: tone.topacio, icono: iconoSangreKoloss, eras: ['era2'], puntosAtributoBase: 12,
      topeAtributo: { fuerza: 6 }, topeCreacion: { fuerza: 4 },
    },
  ],
  caminoInvestido: {
    field: 'caminoMetal',
    label: 'Camino de nacido del metal',
    excluyente: true,
    // The five metalborn paths in the order of the book (chapter 5): light twin of CAMINOS_NACIDOS_DEL_METAL (id, name, colour). That module
    // carries the talent trees and stays in the lazy chunk (§8, risk 6), so the pills read this copy: keep both in step. The colours are
    // [inferido → Q18]: the book colours no path (verificado en imagen, PDF 133-165)
    caminos: [
      { id: 'brumoso', nombre: 'Brumoso', color: '#6987b1' },
      { id: 'nacido-de-la-bruma', nombre: 'Nacido de la bruma', color: '#8f86c9' },
      { id: 'feruquimista', nombre: 'Feruquimista', color: '#b2623b' },
      { id: 'ferrin', nombre: 'Ferrin', color: '#4f9d8a' },
      { id: 'nacidoble', nombre: 'Nacidoble', color: '#a86fa0' },
    ],
    insignia: false, // the book has no icons for the paths: a plain Lucide glyph (Q18)
  },
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
  // T45: official illustrations «Dinero de la Era 1 / Era 2» (L.254 / PDF 260), src/assets/cosmere/img/dinero-era1.webp and dinero-era2.webp.
  // `imagen` is their common name: the consumer appends the era of the campaign, cosmereImage(`${imagen}-${era}`) (Era 1 pouch, Era 2 wallet).
  moneda: { simbolo: 'ar', nombre: 'Arquillas', imagen: 'dinero', decimales: 2 },
  // L.50 / PDF 56: carrying capacity and lifting capacity by Fuerza bracket
  tablas: { cargaKg: [25, 50, 125, 250, 1250, 2500], levantamientoKg: [50, 100, 250, 500, 2500, 5000] },
  enciclopedia: MISTBORN_TOPICS, // the seven topics of §7.8 (T24a)
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
