/**
 * The «al elegir camino» flow of the metalborn path (§7.4, T28) as pure functions over the character: what changes when the
 * director assigns a metalborn path, changes it for another one, removes it, or only switches which path is the starting one.
 *
 * CharacterDetailPage runs these functions inside its immediate mutations (`aplicarCaminoMetal`, `quitarCaminoMetal`) and saves
 * the result with ONE `PUT` (after creating the goals); CaminoMetalPicker uses `faltanHuecosCognitivos` to warn before the
 * director goes on. No React and no I/O. It lives with the other components of Nacidos de la bruma, so it is loaded lazily from
 * components/mistborn/index.ts together with the data it imports BY FILE (§7.4 rule 4, §8 risk 6).
 *
 * Book rules (L.x / PDF y): the main talent of a starting path is granted without taking a slot (L.17-18 / PDF 23-24); the free
 * degree of the starting skill: brumoso (L.135 / PDF 141), ferrin (L.150 / PDF 156), nacidoble in Disciplina (L.19 / PDF 25;
 * L.154 / PDF 160), none for nacido de la bruma and feruquimista (L.141 / PDF 147; L.145 / PDF 151); Alomancia and Feruquimia go
 * in the blank cognitive lines (L.128 / PDF 134); alomancia de atium is complete from the start and needs no goal (L.177 / PDF
 * 183; L.135 / PDF 141); a spike or a lerasium alloy also grants the Investida skill of its art (L.290 / PDF 296; L.295 / PDF 301).
 */
import type { Character, PoderPersonaje } from '../../types'
import {
  CAMINOS_NACIDOS_DEL_METAL,
  type CaminoNacidoDelMetal,
  type HabilidadInvestidaNombre,
  type SeleccionMeta,
} from '../../data/mistborn/caminosNacidosDelMetal'
import type { ArteMetal } from '../../data/mistborn/metales'

/** What the sheet knows and the flow needs: where the custom skills of each attribute go and the attribute of each Investida skill */
export interface EntornoCaminoMetal {
  /** `ATRIBUTO_SLOTS` of the sheet: custom slots by attribute code (the cognitive ones, INT and VOL, are 2 and 5) */
  huecos: Record<string, readonly number[]>
  /** `WorldConfig.habilidadesInvestidas`: the attribute code of each Investida skill (Alomancia VOL, Feruquimia INT) */
  investidas: readonly { nombre: string; codigo: string }[]
}

/** What the director chose for a path: its starting role and, when the path is new, the powers of the MetalPicker (step 4) */
export interface SeleccionCaminoMetal {
  caminoInicial: 'heroico' | 'metal'
  /** Powers of the MetalPicker; `null` = the same path again, only the starting path changes (no power, no goal) */
  poderes: PoderPersonaje[] | null
  /** Power ids (`${arte}:${metal}`) the first goal(s) train */
  paraMeta: string[]
}

/** A goal to create before the PUT; the powers it trains get its id as `metaId` */
export interface MetaPendiente {
  titulo: string
  descripcion: string
  /** Power ids (`${arte}:${metal}`) */
  poderes: string[]
}

export interface PlanCaminoMetal {
  /** Character fields to write with the PUT (absolute values: merging them twice gives the same character) */
  cambio: Partial<Character>
  /** Goals of step 5, in the order of the path's `metasIniciales` */
  metas: MetaPendiente[]
  /** Investida skills that found no free cognitive slot: the plan must not be saved (Q4, the director frees one) */
  faltan: string[]
}

/** Derived id of a power (§2): `'alomancia:acero'` */
export const idPoder = (p: { arte: string; metal: string }): string => `${p.arte}:${p.metal}`

const ARTE_DE_HABILIDAD: Record<HabilidadInvestidaNombre, ArteMetal> = { Alomancia: 'alomancia', Feruquimia: 'feruquimia' }

const caminoDe = (id: string): CaminoNacidoDelMetal | undefined => CAMINOS_NACIDOS_DEL_METAL.find((p) => p.id === id)

/** Art(s) and goal mode of the MetalPicker for a path (L.19 / PDF 25): nacidoble picks one power of each art */
export function metalesDelCamino(camino: CaminoNacidoDelMetal): { arte: ArteMetal | 'ambas'; modo: SeleccionMeta } {
  const { alomancia, feruquimia } = camino.poderes
  const arte = alomancia !== 0 && feruquimia !== 0 ? 'ambas' : alomancia !== 0 ? 'alomancia' : 'feruquimia'
  return { arte, modo: camino.seleccionMeta }
}

/** The starting path as the sheet reads it (§3 k): `''` = undecided, the heroic one if there is one and the metalborn one otherwise */
const inicialEfectivo = (c: Pick<Character, 'caminoInicial' | 'caminoHeroico'>): 'heroico' | 'metal' =>
  c.caminoInicial || (c.caminoHeroico ? 'heroico' : 'metal')

const SLOTS = [1, 2, 3, 4, 5, 6] as const

/**
 * Working copy of the fields the flow touches. The custom skill slots are read and written by number through the
 * `habilidadPersonalizadaN`, `…Valor` and `…Atributo` fields of the character.
 */
function borrador(base: Character) {
  const campos: Record<string, unknown> = { ...(base as unknown as Record<string, unknown>) }
  const tocados = new Set<string>()
  const escribir = (k: string, v: unknown) => { campos[k] = v; tocados.add(k) }
  const b = {
    talentos: leerTalentos(base.talentos),
    poderes: [...base.poderes],
    get: <K extends keyof Character>(k: K): Character[K] => campos[k] as Character[K],
    set: <K extends keyof Character>(k: K, v: Character[K]) => escribir(k, v),
    nombre: (n: number): string => String(campos[`habilidadPersonalizada${n}`] ?? '').trim(),
    valor: (n: number): number => Number(campos[`habilidadPersonalizada${n}Valor`] ?? 0) || 0,
    atributo: (n: number): string => String(campos[`habilidadPersonalizada${n}Atributo`] ?? ''),
    hueco: (n: number, nombre: string, valor: number, atributo: string) => {
      escribir(`habilidadPersonalizada${n}`, nombre)
      escribir(`habilidadPersonalizada${n}Valor`, valor)
      escribir(`habilidadPersonalizada${n}Atributo`, atributo)
    },
    /** Slot that holds this skill, by exact name (§2: the sheet, the dice roller and the server find it so), wherever it is */
    slotDe: (nombre: string): number | undefined => SLOTS.find((n) => b.nombre(n) === nombre),
    /** The fields the flow wrote, plus `talentos` and `poderes` when they changed */
    cambio: (): Partial<Character> => {
      const out: Record<string, unknown> = {}
      for (const k of tocados) out[k] = campos[k]
      const talentos = JSON.stringify(b.talentos)
      if (talentos !== base.talentos) out.talentos = talentos
      if (JSON.stringify(b.poderes) !== JSON.stringify(base.poderes)) out.poderes = b.poderes
      return out as Partial<Character>
    },
  }
  return b
}
type Borrador = ReturnType<typeof borrador>

function leerTalentos(raw: string): string[] {
  try {
    const v: unknown = JSON.parse(raw || '[]')
    return Array.isArray(v) ? v.filter((t): t is string => typeof t === 'string') : []
  } catch {
    return []
  }
}

/** Main talent: granted without a slot (not stored) when the metalborn path is the starting one; stored, taking a slot, otherwise */
function fijarTalentoPrincipal(b: Borrador, camino: CaminoNacidoDelMetal, inicial: 'heroico' | 'metal') {
  const sin = b.talentos.filter((t) => t !== camino.mainTalent)
  // Prepended, as the heroic-path picker of the sheet does with the main talent of a new path
  b.talentos = inicial === 'heroico' ? [camino.mainTalent, ...sin] : sin
}

/**
 * Puts an Investida skill in its slot: the one that already holds it (a spike may have created it, T30) or the first free slot of
 * its attribute (cognitive 2 and 5, §7.4 step 3). `grados` is its minimum value; `extra` the free degree of a starting path.
 * Returns false when no slot is free.
 */
function asegurarHabilidad(b: Borrador, nombre: string, grados: number, extra: number, entorno: EntornoCaminoMetal): boolean {
  const codigo = entorno.investidas.find((h) => h.nombre === nombre)?.codigo ?? ''
  const existente = b.slotDe(nombre)
  const n = existente ?? (entorno.huecos[codigo] ?? []).find((i) => b.nombre(i) === '')
  if (n === undefined) return false
  b.hueco(n, nombre, Math.max(existente === undefined ? 0 : b.valor(n), grados) + extra, codigo)
  return true
}

/**
 * Inverse cleanup of the path the character has (§7.4 «Al quitar el camino»): its main talent leaves `talentos`, the slots of its
 * Investida skills are emptied, the powers that came from a path go away (spikes, lerasium alloys and medallions stay), Disciplina
 * loses the free degree of a starting nacidoble and the starting path goes back to the heroic one if there is one ('' otherwise).
 * The goals already created are kept. A slot whose art is still granted by a kept spike or lerasium power keeps its skill and value
 * [inferido: the book gives the skill with the spike or the alloy, L.290 / PDF 296; L.295 / PDF 301, but says nothing of losing a
 * path; a medallion gives no skill, L.293 / PDF 299]. The talents of the path's tree stay: §7.4 only removes the main one.
 */
function quitar(b: Borrador, base: Character) {
  const camino = caminoDe(base.caminoMetal)
  const conservados = b.poderes.filter((p) => p.origen !== 'camino')
  b.poderes = conservados
  if (camino) {
    b.talentos = b.talentos.filter((t) => t !== camino.mainTalent)
    for (const h of camino.habilidadesInvestidas) {
      const arte = ARTE_DE_HABILIDAD[h.nombre]
      if (conservados.some((p) => p.arte === arte && (p.origen === 'clavo' || p.origen === 'lerasium'))) continue
      for (const n of SLOTS) if (b.nombre(n) === h.nombre) b.hueco(n, '', 0, '')
    }
    if (camino.habilidadInicial === 'Disciplina' && inicialEfectivo(base) === 'metal') b.set('disciplina', Math.max(0, b.get('disciplina') - 1))
  }
  b.set('caminoMetal', '')
  b.set('caminoInicial', base.caminoHeroico ? 'heroico' : '')
}

/** «Quitar camino»: the cleanup above as the fields of one PUT */
export function planQuitarCaminoMetal(base: Character): Partial<Character> {
  const b = borrador(base)
  quitar(b, base)
  return b.cambio()
}

/**
 * Same path, other starting path: the main talent moves in or out of `talentos` and the free degree of the starting skill goes up
 * or down by one (never below the degrees of the main talent; Disciplina never below 0). Powers and goals do not change.
 */
function cambiarInicial(b: Borrador, base: Character, camino: CaminoNacidoDelMetal, pedido: 'heroico' | 'metal') {
  const antes = inicialEfectivo(base)
  const inicial = base.caminoHeroico ? pedido : 'metal'
  b.set('caminoInicial', inicial)
  fijarTalentoPrincipal(b, camino, inicial)
  if (antes === inicial || !camino.habilidadInicial) return
  const delta = inicial === 'metal' ? 1 : -1
  if (camino.habilidadInicial === 'Disciplina') {
    b.set('disciplina', Math.max(0, b.get('disciplina') + delta))
    return
  }
  const n = b.slotDe(camino.habilidadInicial)
  const minimo = camino.habilidadesInvestidas.find((h) => h.nombre === camino.habilidadInicial)?.grados ?? 0
  if (n !== undefined) b.hueco(n, camino.habilidadInicial, Math.max(minimo, b.valor(n) + delta), b.atributo(n))
}

/**
 * Steps 1-3 and the data of 4-5 of «Al elegir camino…» (§7.4) for the path `caminoId`, starting from `base` (the cached copy out of
 * combat, never the edit form). A different path first undoes the current one (`quitar`), so changing paths and assigning the first
 * one are the same operation; the same path with `poderes: null` only switches the starting path.
 */
export function planAplicarCaminoMetal(base: Character, caminoId: string, sel: SeleccionCaminoMetal, entorno: EntornoCaminoMetal): PlanCaminoMetal {
  const camino = caminoDe(caminoId)
  if (!camino) throw new Error(`Unknown metalborn path: '${caminoId}'`)
  const b = borrador(base)

  if (sel.poderes === null && base.caminoMetal === caminoId) {
    cambiarInicial(b, base, camino, sel.caminoInicial)
    return { cambio: b.cambio(), metas: [], faltan: [] }
  }

  const anteriores = base.poderes
  quitar(b, base)

  // 1-2. The path and its starting role: without a heroic path the metalborn one is the starting path, with no question (§7.4 step 2)
  const inicial = base.caminoHeroico ? sel.caminoInicial : 'metal'
  b.set('caminoMetal', camino.id)
  b.set('caminoInicial', inicial)
  fijarTalentoPrincipal(b, camino, inicial)

  // 3. Investida skills (1 degree each; nacidoble: Alomancia in the first free cognitive slot and Feruquimia in the next) and the
  // free degree of a starting path: on its Investida skill, or on Disciplina for the nacidoble
  const faltan: string[] = []
  for (const h of camino.habilidadesInvestidas) {
    const extra = inicial === 'metal' && camino.habilidadInicial === h.nombre ? 1 : 0
    if (!asegurarHabilidad(b, h.nombre, h.grados, extra, entorno)) faltan.push(h.nombre)
  }
  if (inicial === 'metal' && camino.habilidadInicial === 'Disciplina') b.set('disciplina', b.get('disciplina') + 1)

  // 4. Powers of the MetalPicker, nascent and from the path (alomancia de atium complete). A power the character keeps from another
  // origin is never duplicated; one it had from the previous path keeps its table state, as the server does with the PUT (§5.1)
  const nuevos = (sel.poderes ?? [])
    .filter((p) => !b.poderes.some((e) => idPoder(e) === idPoder(p)))
    .map((p): PoderPersonaje => {
      const previo = anteriores.find((e) => e.origen === 'camino' && idPoder(e) === idPoder(p))
      return {
        arte: p.arte, metal: p.metal, origen: 'camino', metaId: null,
        completo: previo?.completo || (p.arte === 'alomancia' && p.metal === 'atium'),
        cargas: previo?.cargas ?? 0, ajusteCargasMax: previo?.ajusteCargasMax ?? 0, viales: previo?.viales ?? 0, desprovisto: previo?.desprovisto ?? false,
      }
    })
  b.poderes = [...b.poderes, ...nuevos]

  // 5. One goal per initial goal of the path whose art has powers to train (an atium-only alomancy has none: it is complete)
  const entrenables = new Set(nuevos.filter((p) => !p.completo).map(idPoder))
  const metas = camino.metasIniciales
    .map((m) => ({ titulo: m.titulo, descripcion: m.descripcion, poderes: sel.paraMeta.filter((id) => id.startsWith(`${m.arte}:`) && entrenables.has(id)) }))
    .filter((m) => m.poderes.length > 0)

  return { cambio: b.cambio(), metas, faltan }
}

/** Step 5 → 6: the powers of the plan with the id of the goal that trains each one */
export function enlazarMetas(poderes: PoderPersonaje[], metas: MetaPendiente[], ids: number[]): PoderPersonaje[] {
  return poderes.map((p) => {
    const i = metas.findIndex((m) => m.poderes.includes(idPoder(p)))
    return i >= 0 && ids[i] !== undefined ? { ...p, metaId: ids[i] } : p
  })
}

/** Investida skills of `caminoId` that would find no free cognitive slot once the current path is removed (Q4) */
export function faltanHuecosCognitivos(base: Character, caminoId: string, entorno: EntornoCaminoMetal): string[] {
  const camino = caminoDe(caminoId)
  if (!camino || base.caminoMetal === caminoId) return []
  const b = borrador(base)
  quitar(b, base)
  return camino.habilidadesInvestidas.filter((h) => !asegurarHabilidad(b, h.nombre, h.grados, 0, entorno)).map((h) => h.nombre)
}
