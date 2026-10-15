/** Labels and tones of «La banda» by state, small text helpers and the hook that runs an operation from a sheet. */
import { useState } from 'react'
import type { ToneName } from '../../theme'
import { c, fs } from '../../theme'
import type { Conservacion, EstadoMejora, EstadoRefugio, EstadoTrabajador, PapelContacto, Relacion, SituacionMercancia } from './estado'
import { ErrorBanda, type OpBanda } from './operaciones'

export const ESTADO_REFUGIO: Record<EstadoRefugio, { label: string; tono: ToneName }> = {
  seguro: { label: 'Seguro', tono: 'esmeralda' },
  comprometido: { label: 'Comprometido', tono: 'topacio' },
  perdido: { label: 'Perdido', tono: 'rubi' },
}

export const ESTADO_MEJORA: Record<EstadoMejora, { label: string; tono: ToneName }> = {
  'en-obra': { label: 'En obra', tono: 'topacio' },
  lista: { label: 'Lista', tono: 'esmeralda' },
  danada: { label: 'Dañada', tono: 'rubi' },
}

export const ESTADO_TRABAJADOR: Record<EstadoTrabajador, { label: string; tono: ToneName }> = {
  activo: { label: 'Activo', tono: 'esmeralda' },
  herido: { label: 'Herido', tono: 'granate' },
  preso: { label: 'Preso', tono: 'topacio' },
  desaparecido: { label: 'Desaparecido', tono: 'cuarzo' },
  muerto: { label: 'Muerto', tono: 'rubi' },
  baja: { label: 'De baja', tono: 'cuarzo' },
}

export const RANGO: Record<'secuaz' | 'rival' | 'jefe', string> = { secuaz: 'Secuaz', rival: 'Rival', jefe: 'Jefe' }

export const RELACION: Record<Relacion, { label: string; tono: ToneName }> = {
  hostil: { label: 'Hostil', tono: 'rubi' },
  tensa: { label: 'Tensa', tono: 'topacio' },
  neutral: { label: 'Neutral', tono: 'cuarzo' },
  aliada: { label: 'Aliada', tono: 'zafiro' },
  leal: { label: 'Leal', tono: 'esmeralda' },
}

export const PAPEL: Record<PapelContacto, string> = { contacto: 'Contacto', patrocinador: 'Patrocinador', companero: 'Compañero' }

export const SITUACION_MERCANCIA: Record<SituacionMercancia, { label: string; tono: ToneName }> = {
  guardada: { label: 'Guardado', tono: 'cuarzo' },
  'en-venta': { label: 'A la venta', tono: 'topacio' },
  vendida: { label: 'Vendido', tono: 'esmeralda' },
  retirada: { label: 'Sacado', tono: 'cuarzo' },
  requisada: { label: 'Requisado', tono: 'rubi' },
}

export const CONSERVACION: Record<Conservacion, string> = { nuevo: 'Nuevo', usado: 'Usado' }

/** Tone of a chance of selling (only the director sees it) */
export const tonoProbabilidad = (prob: number): ToneName => (prob >= 60 ? 'esmeralda' : prob >= 40 ? 'zafiro' : prob >= 20 ? 'topacio' : 'rubi')

/** «12,5 %» */
export const porcentaje = (v: number) => `${String(Math.round(v * 10) / 10).replace('.', ',')} %`

export const tonoReputacion = (v: number): ToneName => (v <= -2 ? 'rubi' : v === -1 ? 'topacio' : v === 0 ? 'cuarzo' : v === 1 ? 'zafiro' : 'esmeralda')

export const conSigno = (v: number) => (v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0')

/** Small muted text line */
export const textoSuave = { fontSize: fs.sm, color: c.muted, lineHeight: 1.45 } as const

/**
 * What an amount field keeps of what is typed or pasted: digits and ONE decimal separator (comma or point) with at most 2 decimals.
 * Letters and any other sign never get in («12abc» → «12», «3,456» → «3,45», «,5» → «0,5»)
 */
export function filtrarCantidad(texto: string): string {
  const limpio = texto.replace(/[^\d.,]/g, '')
  const i = limpio.search(/[.,]/)
  if (i < 0) return limpio
  const decimales = limpio.slice(i + 1).replace(/[.,]/g, '').slice(0, 2)
  return `${limpio.slice(0, i) || '0'}${limpio[i]}${decimales}`
}

/** The number of a filtered amount («12,5» → 12.5); NaN when there is none */
export const leerCantidad = (texto: string) => (texto.trim() ? Number(texto.replace(',', '.')) : NaN)

/**
 * Runs an operation from a sheet: on success calls `alTerminar`; a refused operation leaves its reason in `error` (the sheet stays open)
 */
export function useEjecutar(aplicar: (op: OpBanda) => void) {
  const [error, setError] = useState<string | null>(null)
  const ejecutar = (op: OpBanda, alTerminar?: () => void) => {
    try {
      aplicar(op)
      setError(null)
      alTerminar?.()
    } catch (e) {
      setError(e instanceof ErrorBanda || e instanceof Error ? e.message : 'No se ha podido hacer el cambio.')
    }
  }
  return { error, setError, ejecutar }
}
