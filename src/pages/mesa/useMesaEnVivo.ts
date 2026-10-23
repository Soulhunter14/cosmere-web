import { useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { mesaApi } from '../../api/mesa'
import { esMasNueva, normalizarMesa, type MesaPublica } from './publica'

/** Safety net when the phone slept through the hub event: a fresh read every 45 s while the page is on screen */
const INTERVALO_MS = 45_000

export type EstadoRed = 'al-dia' | 'cargando' | 'sin-conexion'

/**
 * The table as the players see it, kept live: the hub event `MesaUpdated` (re-dispatched by the DiceRoller as `mesaUpdated`)
 * and coming back to the page both read the document again; offline, the last one read stays on screen.
 */
export function useMesaEnVivo(cId: number): {
  mesa: MesaPublica | null
  masNueva: boolean
  red: EstadoRed
  /** When the document on screen was read, in ms (0 = never) */
  leidoEn: number
  error: boolean
  reintentar: () => void
} {
  const qc = useQueryClient()
  const q = useQuery({
    queryKey: ['mesa', cId],
    queryFn: () => mesaApi.get(cId),
    enabled: cId > 0,
    refetchInterval: INTERVALO_MS,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  })

  useEffect(() => {
    if (!(cId > 0)) return
    const alCambiar = (e: Event) => {
      if ((e as CustomEvent<{ campaignId?: number }>).detail?.campaignId !== cId) return
      void qc.invalidateQueries({ queryKey: ['mesa', cId] })
    }
    const alVolver = () => { if (document.visibilityState === 'visible') void qc.invalidateQueries({ queryKey: ['mesa', cId] }) }
    window.addEventListener('mesaUpdated', alCambiar)
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      window.removeEventListener('mesaUpdated', alCambiar)
      document.removeEventListener('visibilitychange', alVolver)
    }
  }, [cId, qc])

  const data = q.data
  const red: EstadoRed = q.fetchStatus === 'paused' || (q.isError && !!data) ? 'sin-conexion' : !data ? 'cargando' : 'al-dia'
  return {
    mesa: data ? normalizarMesa(data.state) : null,
    masNueva: data ? esMasNueva(data.state) : false,
    red,
    leidoEn: q.dataUpdatedAt,
    error: q.isError && !data,
    reintentar: () => { void q.refetch() },
  }
}
