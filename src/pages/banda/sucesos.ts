/**
 * «Cosas que pueden pasar» while weeks pass (our rule; a placeholder table for now, docs/banda/propuesta.md Anexo A.8). Every week one die
 * says whether something happens and, when it does, a second one says what. The number the first die needs goes down for each week in a
 * row without an event (`BandaSecretos.semanasSinSuceso`, the internal value) and goes back up when one comes, played or skipped. Only
 * the director sees any of it. The page rolls, never an operation, so applying one again after a 409 gives the same result.
 */
import type { CatalogoBanda, EfectoSuceso, SucesoDef, TablaSucesosDef } from '../../lib/banda/tipos'
import type { DecisionSuceso } from './estado'
import { nombreMejora, puedeDanarse, type DocBanda } from './operaciones'

/** What the dice said in one week */
export interface SemanaSucesos {
  /** 1 = the first week of this time */
  semana: number
  /** «¿Pasa algo?»: the roll and the number it needed */
  tirada: number
  umbral: number
  /**
   * Only when something happens: the roll on the table, its row and what the director did with it (null = not decided yet). A played
   * event that damages carries the upgrades he validated (`danos`) and what will happen to them (`efectos`)
   */
  suceso: {
    tirada: number
    def: SucesoDef | null
    decision: DecisionSuceso | null
    danos?: { refugio: string; mejora: string }[]
    efectos?: string[]
  } | null
}

/** An upgrade an event can damage, for the director to validate it */
export interface MejoraDanable {
  /** `refugio|mejora` */
  clave: string
  refugioId: string
  refugio: string
  mejoraId: string
  nombre: string
  /** It is already damaged (or being repaired): damaged again, it breaks and is lost */
  rompe: boolean
}

/** Every upgrade an event can damage (built ones of refuges not lost; Movilidad is the vehicle itself) */
export function mejorasDanables(doc: DocBanda, cat: CatalogoBanda): MejoraDanable[] {
  return doc.banda.refugios
    .filter((r) => r.estado !== 'perdido')
    .flatMap((r) => r.mejoras.filter(puedeDanarse).map((m) => ({
      clave: `${r.id}|${m.id}`, refugioId: r.id, refugio: r.nombre, mejoraId: m.id, nombre: nombreMejora(m, cat), rompe: m.estado !== 'lista',
    })))
}

/** What an event proposes to damage (the director can change it): one upgrade at random, or every one of a refuge at random */
export function proponerDanos(danables: MejoraDanable[], efecto: EfectoSuceso, tirar: (caras: number) => number = tirarDado): string[] {
  if (danables.length === 0) return []
  if (efecto === 'danar-mejora') return [danables[tirar(danables.length) - 1].clave]
  const refugios = [...new Set(danables.map((d) => d.refugioId))]
  const elegido = refugios[tirar(refugios.length) - 1]
  return danables.filter((d) => d.refugioId === elegido).map((d) => d.clave)
}

/** What damaging these upgrades will do, in words («Armería (La Garza): dañada») */
export const efectosDanos = (danables: MejoraDanable[], claves: string[]) =>
  danables.filter((d) => claves.includes(d.clave)).map((d) => `${d.nombre} (${d.refugio}): ${d.rompe ? 'rota, se pierde' : 'dañada'}`)

/** The number «¿pasa algo?» needs after `sinSuceso` weeks in a row without an event */
export const umbralSuceso = (t: TablaSucesosDef, sinSuceso: number) =>
  Math.max(t.umbralMinimo, t.umbralBase - t.bajadaPorSemana * Math.max(0, sinSuceso))

/** % chance of the die reaching that number */
export const probabilidadSuceso = (t: TablaSucesosDef, umbral: number) =>
  Math.round((Math.min(t.dado, Math.max(0, t.dado - umbral + 1)) / t.dado) * 100)

/** The row of the table a roll gives */
export const filaSuceso = (t: TablaSucesosDef, tirada: number): SucesoDef | null =>
  t.tabla.find((s) => tirada >= s.desde && tirada <= s.hasta) ?? null

/** One roll of a die with `caras` faces */
export function tirarDado(caras: number): number {
  const valor = new Uint32Array(1)
  crypto.getRandomValues(valor)
  return (valor[0] % caras) + 1
}

/**
 * Rolls the weeks from `desde` to `hasta` (1-based, both included) after `sinSuceso` quiet weeks in a row, until something happens. It
 * returns the weeks rolled (when `parada`, the last one has the event, still undecided) and the quiet weeks in a row after them (0 after
 * an event). `tirar` is the die (a fixed one checks it by hand)
 */
export function tirarHastaSuceso(
  t: TablaSucesosDef, desde: number, hasta: number, sinSuceso: number, tirar: (caras: number) => number = tirarDado,
): { semanas: SemanaSucesos[]; sinSuceso: number; parada: boolean } {
  const semanas: SemanaSucesos[] = []
  let quietas = Math.max(0, sinSuceso)
  for (let semana = desde; semana <= hasta; semana++) {
    const umbral = umbralSuceso(t, quietas)
    const tirada = tirar(t.dado)
    if (tirada >= umbral) {
      const tiradaTabla = tirar(t.dado)
      semanas.push({ semana, tirada, umbral, suceso: { tirada: tiradaTabla, def: filaSuceso(t, tiradaTabla), decision: null } })
      return { semanas, sinSuceso: 0, parada: true }
    }
    semanas.push({ semana, tirada, umbral, suceso: null })
    quietas += 1
  }
  return { semanas, sinSuceso: quietas, parada: false }
}
