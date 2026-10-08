/**
 * Decisions of the director's script (`### Decisión: …`, read by `guion.ts`): who makes a decision of a scene, and what the table
 * decided added up per character for the Grupo panel: what goes to the sheet (attributes, skills, expertises, goals, items), the
 * secret marks of heroic path and metal (a session zero played like «El primer paso») and the echoes the story will bring back.
 * The screen only records and adds up: the sheet is changed by hand, as with the advances. Pure functions, no React.
 */
import { foldText as normalizar } from '../../lib/catalogo'
import type { Character } from '../../types'
import type { HabilidadDef } from '../../worlds/types'
import type { ClaveEfecto, Efecto, Eleccion } from './estado'
import { cantidadesDe, nombresDe } from './guion'

export const ETIQUETA_EFECTO: Record<ClaveEfecto, string> = {
  atributo: 'Atributo', habilidad: 'Habilidad', pericia: 'Pericia', meta: 'Meta', objeto: 'Objeto', camino: 'Camino', metal: 'Metal', eco: 'Eco',
}
/** Effects the player writes on the sheet */
export const EFECTOS_HOJA: readonly ClaveEfecto[] = ['atributo', 'habilidad', 'pericia', 'meta', 'objeto']
/** Effects only the director sees (the hidden record of paths and metals, revealed at the end) */
export const EFECTOS_SECRETOS: readonly ClaveEfecto[] = ['camino', 'metal']

const mayuscula = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

/** «+1 Fuerza · +2 Atletismo · Pericia Bajos fondos · Meta «…»»: what an option gives to the sheet, for the log */
export const resumenHoja = (efectos: Efecto[]): string =>
  efectos
    .filter((x) => EFECTOS_HOJA.includes(x.clave))
    .map((x) => (x.clave === 'atributo' || x.clave === 'habilidad' ? x.valor : `${ETIQUETA_EFECTO[x.clave]} ${x.valor}`))
    .join(' · ')

// ── Who decides ──────────────────────────────────────────────────────────────

export interface Quien {
  characterId: number | null
  nombre: string
}

/**
 * Who picks in a decision. «todos» (or nothing) is every character of the campaign; a legacy («convicto») or a character's name
 * is the characters that fit. With none that fits, one slot named after it and without character («Convicto»), so the screen
 * still records the choice (a campaign without legacies yet, a guest player); `sinCoincidencia` says so.
 */
export function quienesDeciden(
  decide: string,
  personajes: Pick<Character, 'id' | 'name' | 'legado'>[],
): { quienes: Quien[]; sinCoincidencia: boolean } {
  const d = normalizar(decide)
  const de = (lista: typeof personajes): Quien[] => lista.map((p) => ({ characterId: p.id, nombre: p.name }))
  if (!d || d === 'todos' || d === 'grupo' || d === 'todo el grupo') {
    return { quienes: personajes.length ? de(personajes) : [{ characterId: null, nombre: 'Sin personaje' }], sinCoincidencia: false }
  }
  const encajan = personajes.filter((p) => normalizar(p.legado ?? '') === d || normalizar(p.name) === d)
  if (encajan.length) return { quienes: de(encajan), sinCoincidencia: false }
  return { quienes: [{ characterId: null, nombre: mayuscula(decide.trim()) }], sinCoincidencia: true }
}

// ── What the table decided, per character ────────────────────────────────────

export interface Suma {
  nombre: string
  total: number
}

export interface RegistroPersonaje {
  /** `c<id>` for a campaign character, `n<name>` for a choice recorded without one */
  clave: string
  characterId: number | null
  nombre: string
  atributos: Suma[]
  habilidades: Suma[]
  pericias: string[]
  metas: string[]
  objetos: string[]
  ecos: string[]
  /** What a passed test gave that is not «+1 al atributo de la habilidad» */
  otros: string[]
  /** Secret marks, most marked first */
  caminos: Suma[]
  metales: Suma[]
  /** Its choices, oldest first, with their key in `decisiones` (to remove a wrong one) */
  elecciones: { clave: string; eleccion: Eleccion }[]
}

/** Adds up numbers by name (accents and case do not split «Fuerza» from «fuerza»); the list goes from the highest */
function sumador() {
  const m = new Map<string, Suma>()
  return {
    sumar(nombre: string, n: number) {
      const k = normalizar(nombre)
      if (!k) return
      const s = m.get(k)
      if (s) s.total += n
      else m.set(k, { nombre: mayuscula(nombre.trim()), total: n })
    },
    lista: (): Suma[] => [...m.values()].filter((s) => s.total !== 0).sort((a, b) => b.total - a.total || a.nombre.localeCompare(b.nombre, 'es')),
  }
}

/**
 * The record of decisions, one entry per character in the order of the campaign (then the choices recorded without a character).
 * A passed test with «+1 al atributo de la habilidad» adds 1 to the attribute of the skill it was rolled with (`habilidades` of
 * the world says which); the cap of 3 of character creation is checked on the sheet.
 */
export function registroDecisiones(
  decisiones: Record<string, Eleccion>,
  habilidades: HabilidadDef[],
  personajes: Pick<Character, 'id' | 'name'>[],
): RegistroPersonaje[] {
  const grupos = new Map<string, { characterId: number | null; nombre: string; elecciones: { clave: string; eleccion: Eleccion }[] }>()
  for (const [clave, el] of Object.entries(decisiones)) {
    const k = el.characterId !== null ? `c${el.characterId}` : `n${normalizar(el.personaje)}`
    const actual = el.characterId !== null ? personajes.find((p) => p.id === el.characterId)?.name : undefined
    const g = grupos.get(k) ?? { characterId: el.characterId, nombre: actual ?? el.personaje, elecciones: [] }
    g.elecciones.push({ clave, eleccion: el })
    grupos.set(k, g)
  }
  const orden = (k: string) => {
    const i = personajes.findIndex((p) => `c${p.id}` === k)
    return i >= 0 ? i : personajes.length
  }
  return [...grupos.entries()]
    .sort(([a, ga], [b, gb]) => orden(a) - orden(b) || ga.nombre.localeCompare(gb.nombre, 'es'))
    .map(([clave, g]): RegistroPersonaje => {
      const atributos = sumador()
      const hab = sumador()
      const caminos = sumador()
      const metales = sumador()
      const r: RegistroPersonaje = {
        clave, characterId: g.characterId, nombre: g.nombre, atributos: [], habilidades: [], pericias: [], metas: [], objetos: [], ecos: [], otros: [],
        caminos: [], metales: [], elecciones: g.elecciones.sort((a, b) => a.eleccion.en.localeCompare(b.eleccion.en)),
      }
      for (const { eleccion: el } of r.elecciones) {
        for (const x of el.efectos) {
          if (x.clave === 'atributo') for (const c of cantidadesDe(x.valor)) atributos.sumar(c.nombre, c.cantidad)
          else if (x.clave === 'habilidad') for (const c of cantidadesDe(x.valor)) hab.sumar(c.nombre, c.cantidad)
          else if (x.clave === 'camino') for (const n of nombresDe(x.valor)) caminos.sumar(n, 1)
          else if (x.clave === 'metal') for (const n of nombresDe(x.valor)) metales.sumar(n, 1)
          else if (x.clave === 'pericia') r.pericias.push(x.valor)
          else if (x.clave === 'meta') r.metas.push(x.valor)
          else if (x.clave === 'objeto') r.objetos.push(x.valor)
          else r.ecos.push(x.valor)
        }
        if (el.resultado !== 'exito' || !el.exito) continue
        const habilidad = habilidades.find((h) => normalizar(h.label) === normalizar(el.prueba.replace(/\s+CD\s*\d+.*$/i, '')))
        if (habilidad && /atributo de la habilidad/i.test(el.exito)) atributos.sumar(habilidad.atributo, 1)
        else r.otros.push(`${el.prueba} superada: ${el.exito}`)
      }
      return { ...r, atributos: atributos.lista(), habilidades: hab.lista(), caminos: caminos.lista(), metales: metales.lista() }
    })
}
