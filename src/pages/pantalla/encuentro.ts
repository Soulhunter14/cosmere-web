/**
 * Encounter operations shared by the panels (Encuentro, Escena «Preparar encuentro», Grupo «Añadir al encuentro»).
 * They mutate the draft that `usePantalla().actualizar` hands over, so a whole action is ONE change (one save, one log line).
 * Several encounters can be open at once (a split party): the actions of the other panels go to the one on screen.
 */
import type { Character, GlobalNpc } from '../../types'
import type { HabilidadDef } from '../../worlds/types'
import {
  MAX_ENCUENTROS, anotar, caidosDe, encuentroEnPantalla, moverCombatiente, nombrarSerie, nombresNuevos, nuevoEncuentro, salidasDe,
  type Bando, type Encuentro, type PantallaEstado, type Rango,
} from './estado'
import { buscarAdversario, combatienteDeAdversario, combatienteDePersonaje, combatienteLibre, type EraNum } from './adversarios'

/**
 * A new encounter, on screen from now on; the log says it starts and, with others open, alongside which ones. A title already
 * open gets a number («Encuentro 2»). With the maximum open it returns the one on screen.
 */
export function abrirEncuentro(b: PantallaEstado, titulo: string, ultimoDiario: number | null): Encuentro {
  const actual = encuentroEnPantalla(b)
  if (actual && b.encuentros.length >= MAX_ENCUENTROS) return actual
  const abiertos = b.encuentros.map((e) => e.titulo)
  const [libre] = nombresNuevos(titulo.trim() || 'Encuentro', 1, abiertos)
  const enc = nuevoEncuentro(libre)
  b.encuentros.push(enc)
  b.encuentroActivo = enc.id
  const aLaVez = abiertos.length ? `, a la vez que «${abiertos.join('», «')}»` : ''
  anotar(b, { tipo: 'combate', etiqueta: 'Combate', texto: `Empieza «${enc.titulo}»${aLaVez}` }, ultimoDiario)
  return enc
}

/** «al encuentro», or «a «El muelle»» when several are open: where the «Añadir» of the other panels goes */
export function destinoAnadir(b: PantallaEstado): string {
  const activo = encuentroEnPantalla(b)
  return activo && b.encuentros.length > 1 ? `a «${activo.titulo}»` : 'al encuentro'
}

/** The encounter on screen; when there is none one starts */
export function asegurarEncuentro(b: PantallaEstado, titulo: string, ultimoDiario: number | null): Encuentro {
  return encuentroEnPantalla(b) ?? abrirEncuentro(b, titulo, ultimoDiario)
}

/** Ends an encounter: the log gets its rounds and the defeated, and the screen goes to the next open one */
export function cerrarEncuentro(b: PantallaEstado, id: string, ultimoDiario: number | null) {
  const e = b.encuentros.find((x) => x.id === id)
  if (!e) return
  const rondas = `${e.ronda} ronda${e.ronda === 1 ? '' : 's'}`
  const partes = [
    [caidosDe(e), 'Derrotados'],
    [salidasDe(e, 'huido'), 'Huyen'],
    [salidasDe(e, 'rendido'), 'Se rinden'],
  ] as const
  const resumen = partes.filter(([nombres]) => nombres.length).map(([nombres, titulo]) => `. ${titulo}: ${nombres.join(', ')}`).join('')
  anotar(b, { tipo: 'combate', etiqueta: 'Combate', texto: `Termina «${e.titulo}» tras ${rondas}${resumen}` }, ultimoDiario)
  b.encuentros = b.encuentros.filter((x) => x !== e)
  if (b.encuentroActivo === id) b.encuentroActivo = b.encuentros[0]?.id ?? null
}

/** «Bandido (Ojos de Pala)» → «Bandido»; «Ylt, Vigilante de la Verdad» → «Ylt»; «Khornak adulto» stays */
export const nombreBase = (nombre: string) => nombre.replace(/\([^)]*\)/g, '').split(',')[0].replace(/\s+/g, ' ').trim() || nombre.trim()

/** `era`: the campaign's (1 | 2), so the stat block only brings the attacks of that era; null in a world without eras */
export function anadirAdversario(
  enc: Encuentro, npc: GlobalNpc, cantidad: number, habilidades: HabilidadDef[], era: EraNum, nombre = npc.name, nota = '',
) {
  for (const n of nombrarSerie(enc, nombreBase(nombre), cantidad)) {
    const cb = combatienteDeAdversario(npc, n, habilidades, era)
    cb.notas = nota
    enc.combatientes.push(cb)
  }
}

/**
 * Brings characters to `enc`: one in no fight joins as a new combatant; one fighting in another encounter moves here with its
 * health and conditions (a PJ is in one fight at a time). Returns how many joined.
 */
export function anadirPersonajes(
  b: PantallaEstado, enc: Encuentro, personajes: Character[], habilidades: HabilidadDef[], contarBonos: boolean,
): number {
  let n = 0
  for (const ch of personajes) {
    const otro = b.encuentros.find((e) => e.combatientes.some((c) => c.characterId === ch.id))
    if (otro === enc) continue
    const cb = otro?.combatientes.find((c) => c.characterId === ch.id)
    if (cb) moverCombatiente(b, cb.id, enc.id)
    else enc.combatientes.push(combatienteDePersonaje(ch, habilidades, contarBonos))
    n++
  }
  return n
}

export interface DatosLibre {
  nombre: string
  bando: Bando
  salud: number
  defensa: number
  desvio: number
  rango: Rango | null
}

export function anadirLibre(enc: Encuentro, datos: DatosLibre, cantidad: number, nota = '') {
  for (const n of nombrarSerie(enc, nombreBase(datos.nombre), cantidad)) {
    const cb = combatienteLibre({ ...datos, nombre: n })
    cb.notas = nota
    enc.combatientes.push(cb)
  }
}

/**
 * Enemies of a scene or of a combat of the book: linked to the catalog by id or by name (`buscarAdversario`); an enemy with no
 * stat block joins as a free one with placeholder values the director adjusts. Returns how many came from the catalog and the
 * names that did not.
 */
export function anadirEnemigos(
  enc: Encuentro,
  enemigos: { nombre: string; cantidad: number; adversarioId?: number | null; nota?: string }[],
  catalogo: GlobalNpc[],
  habilidades: HabilidadDef[],
  era: EraNum,
): { enlazados: number; sinFicha: string[] } {
  let enlazados = 0
  const sinFicha: string[] = []
  for (const e of enemigos) {
    const npc = (e.adversarioId != null ? catalogo.find((n) => n.id === e.adversarioId) : undefined) ?? buscarAdversario(e.nombre, catalogo)
    if (npc) {
      anadirAdversario(enc, npc, e.cantidad, habilidades, era, e.nombre, e.nota ?? '')
      enlazados += e.cantidad
    } else {
      const aviso = 'Sin ficha en el catálogo: ajusta salud y defensas.'
      anadirLibre(enc, { nombre: e.nombre, bando: 'pnj', salud: 10, defensa: 10, desvio: 0, rango: null }, e.cantidad, e.nota ? `${e.nota}\n${aviso}` : aviso)
      sinFicha.push(nombreBase(e.nombre))
    }
  }
  return { enlazados, sinFicha }
}
