/**
 * The black market of the crew's store (docs/banda/propuesta-mercado-negro.md §2): the chance of selling a lot in a week, from its asking
 * price compared with its market value (scarcity raises it), the weeks it has been on sale and what the crew brings (a smuggler, workers
 * posted at the Almacén, a criminal network, notoriety). Only the director sees these numbers: the players set the price and see the
 * market price. «Pasar semanas» rolls them (economia.ts).
 */
import type { CatalogoBanda, MercadoNegroDef, TramoPrecioDef } from '../../lib/banda/tipos'
import type { Mercancia } from './estado'
import { privadoDe, type DocBanda } from './operaciones'

export interface LineaPuntos {
  concepto: string
  puntos: number
}

export interface ProbabilidadVenta {
  /** % of selling that week (0 = nobody buys it) */
  prob: number
  tramo: TramoPrecioDef
  /** Asking price ÷ market value, % */
  ratio: number
  /** Market value of one unit, with the scarcity */
  valorMercado: number
  /** Where the chance comes from: the band, the weeks on sale and the crew */
  desglose: LineaPuntos[]
}

/** What happened to one lot on sale while the weeks passed */
export interface ResultadoLote {
  /** Chance and roll of each week rolled, until it sold or was seized */
  semanas: { prob: number; tirada: number }[]
  vendida: boolean
  soplo: boolean
  requisada: boolean
  /** Week it sold or was seized (1 = the first one); null = still on sale */
  semana: number | null
}

const redondear = (v: number) => Math.round(v * 100) / 100
const trabaja = (estado: string) => estado === 'activo' || estado === 'herido'

export const multiplicadorEscasez = (catalogo: CatalogoBanda, contextoId: string | null): number =>
  (contextoId ? catalogo.contextos.find((c) => c.id === contextoId)?.multiplicador : undefined) ?? 1

export const tramoDe = (ratio: number, def: MercadoNegroDef): TramoPrecioDef =>
  def.tramos.find((t) => t.hasta === null || ratio <= t.hasta) ?? def.tramos[def.tramos.length - 1]

/** What the crew brings to the black market, the same for every lot: its smuggler, its workers at the Almacén, its type, its notoriety */
export function puntosDeLaBanda(doc: DocBanda, catalogo: CatalogoBanda): LineaPuntos[] {
  const def = catalogo.mercadoNegro
  if (!def) return []
  const { banda, secretos } = doc
  const { oficio, puesto, organizacion, notoriedad } = def.modificadores
  const plantilla = banda.trabajadores
    .filter((t) => t.enBanda)
    .map((t) => ({ t, p: privadoDe(t, secretos, catalogo) }))
    .filter(({ p }) => trabaja(p.estado))
  const lineas: LineaPuntos[] = []

  if (plantilla.some(({ t }) => t.oficio === oficio.id)) {
    lineas.push({ concepto: `${catalogo.oficios.find((o) => o.id === oficio.id)?.nombre ?? oficio.id} en la banda`, puntos: oficio.puntos })
  }
  // Posts at the upgrade (the Almacén), ready, in refuges not lost
  const puestos = new Set(banda.refugios
    .filter((r) => r.estado !== 'perdido')
    .flatMap((r) => r.mejoras.filter((m) => m.mejora === puesto.mejora && m.estado === 'lista').map((m) => `${r.id}|${m.id}`)))
  const enPuesto = plantilla.filter(({ p }) => p.puesto?.mejora && puestos.has(`${p.puesto.refugio}|${p.puesto.mejora}`)).length
  if (enPuesto) {
    const nombre = catalogo.mejorasRefugio.find((m) => m.id === puesto.mejora)?.nombre ?? puesto.mejora
    lineas.push({ concepto: `${enPuesto} ${enPuesto === 1 ? 'trabajador' : 'trabajadores'} en el ${nombre}`, puntos: Math.min(puesto.maximo, enPuesto * puesto.puntos) })
  }
  const org = banda.tipoOrganizacion ? organizacion[banda.tipoOrganizacion] : undefined
  if (org) lineas.push({ concepto: catalogo.tiposOrganizacion.find((t) => t.id === banda.tipoOrganizacion)?.nombre ?? 'Organización', puntos: org })
  if (banda.notoriedad >= notoriedad.desde) lineas.push({ concepto: `Notoriedad ${banda.notoriedad}`, puntos: notoriedad.puntos })
  return lineas
}

/**
 * Chance of selling a lot worth `valor` per unit at `precio` per unit in a week that starts after `semanas` weeks on sale. null = the lot
 * has no value yet, there is no price or the world has no black market
 */
export function probabilidadVenta(
  valor: number | null, precio: number, semanas: number, doc: DocBanda, catalogo: CatalogoBanda, contextoId: string | null,
): ProbabilidadVenta | null {
  const def = catalogo.mercadoNegro
  if (!def || valor === null || valor <= 0 || !(precio > 0)) return null
  const valorMercado = redondear(valor * multiplicadorEscasez(catalogo, contextoId))
  const ratio = (precio / valorMercado) * 100
  const tramo = tramoDe(ratio, def)
  const desglose: LineaPuntos[] = [{ concepto: `${tramo.etiqueta} (${Math.round(ratio)} % del valor de mercado)`, puntos: tramo.prob }]
  if (tramo.prob <= 0) return { prob: 0, tramo, ratio, valorMercado, desglose }
  const s = Math.min(Math.max(0, semanas), def.semanasMax)
  if (s > 0) {
    desglose.push({
      concepto: `${semanas} ${semanas === 1 ? 'semana' : 'semanas'} a la venta${semanas > def.semanasMax ? ` (cuentan ${def.semanasMax})` : ''}`,
      puntos: (tramo.prob * def.crecimientoPorSemana * s) / 100,
    })
  }
  desglose.push(...puntosDeLaBanda(doc, catalogo))
  const total = desglose.reduce((acc, l) => acc + l.puntos, 0)
  return { prob: Math.min(def.maximo, Math.max(1, Math.round(total))), tramo, ratio, valorMercado, desglose }
}

/** Chance of selling in a run of weeks, %: 1 − Π(1 − p) */
export const probabilidadAcumulada = (probs: number[]) => Math.round((1 - probs.reduce((acc, p) => acc * (1 - p / 100), 1)) * 100)

/** A refuge not lost has the upgrade that hides the goods (the Escondrijo), ready: a tip-off does not cost them */
export const tieneEscondite = (doc: DocBanda, catalogo: CatalogoBanda) => {
  const id = catalogo.mercadoNegro?.mejoraEscondite
  return !!id && doc.banda.refugios.some((r) => r.estado !== 'perdido' && r.mejoras.some((m) => m.mejora === id && m.estado === 'lista'))
}

/**
 * The weeks of one lot on sale, with the rolls the director's page made: it sells at the first roll equal to or under that week's chance;
 * a roll above 100 − riesgo is a tip-off, and without a hiding place the goods are seized
 */
export function tirarLote(
  m: Mercancia, tiradas: number[], semanas: number, doc: DocBanda, catalogo: CatalogoBanda, contextoId: string | null, escondite: boolean,
): ResultadoLote {
  const def = catalogo.mercadoNegro
  const res: ResultadoLote = { semanas: [], vendida: false, soplo: false, requisada: false, semana: null }
  if (!def || m.precio === null) return res
  for (let i = 0; i < semanas && i < tiradas.length; i++) {
    const prob = probabilidadVenta(m.valor, m.precio, m.semanasALaVenta + i, doc, catalogo, contextoId)?.prob ?? 0
    const tirada = tiradas[i]
    res.semanas.push({ prob, tirada })
    if (tirada <= prob) return { ...res, vendida: true, semana: i + 1 }
    if (tirada > 100 - def.riesgo) {
      res.soplo = true
      if (!escondite) return { ...res, requisada: true, semana: i + 1 }
    }
  }
  return res
}

/** `n` rolls of 1d100. Only the page rolls (when the director confirms), never an operation: it must give the same result if applied again */
export function tirarD100(n: number): number[] {
  const valores = new Uint32Array(Math.max(0, n))
  crypto.getRandomValues(valores)
  return Array.from(valores, (v) => (v % 100) + 1)
}
