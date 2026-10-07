/* Money of a world on screen (WorldConfig.moneda): how an amount is written and the official illustration of its era.
   Shared by the Bolsa, its list and the hub of Personajes; the catalog (T41) and the starting equipment (T47) write their prices with it too. */
import type { Era } from '../types'
import type { WorldConfig } from '../worlds/types'
import { cosmereImage } from './cosmereAssets'

export type Moneda = WorldConfig['moneda']

/**
 * An amount without its symbol («12,50», «0,05», «5»).
 * - `decimales: 0` (the Marcos of Stormlight): the number exactly as the catalog stores it («0.2», «15000»). The Stormlight text does not
 *   change (P1), so neither the decimal comma nor the thousands separator of `es-ES` apply there.
 * - With decimals (the Arquillas): Spanish writing, comma for the decimals and a point from 5 digits («2500», «12.500»). `fija` always shows
 *   all the decimals (what a character carries: «12,50»); without it only the ones it needs (a price: «7,5», «0,05», «200»), as the book prints them.
 */
export function formatCantidad(valor: number, moneda: Moneda, { fija = false }: { fija?: boolean } = {}): string {
  if (moneda.decimales === 0 || !Number.isFinite(valor)) return String(valor) // a price that did not arrive reads as before, it does not crash the page
  return valor.toLocaleString('es-ES', { minimumFractionDigits: fija ? moneda.decimales : 0, maximumFractionDigits: moneda.decimales })
}

/** «12,50 ar», «0,05 ar», «5 mc» */
export const formatMoneda = (valor: number, moneda: Moneda, opciones?: { fija?: boolean }): string =>
  `${formatCantidad(valor, moneda, opciones)} ${moneda.simbolo}`

/**
 * Official illustration of the money of the era (`dinero-era1` pouch, `dinero-era2` wallet; L.254 / PDF 260, T45), or `undefined` when the
 * world has none (`imagen: null`, Stormlight) or the campaign has no era: the caller then falls back to its own glyph
 */
export function monedaImagen(moneda: Moneda, era: Era | null): string | undefined {
  return moneda.imagen && era ? cosmereImage(`${moneda.imagen}-${era}`) : undefined
}
