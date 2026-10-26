/**
 * Data the guided creation reads lazily: the legacy definitions (their names, questions and examples) and the options of a step that is
 * a choice. Both are Mistborn-only data, so they come through `import()` / the step's loader and never through a static import.
 */
import { useQuery } from '@tanstack/react-query'
import type { LegadoDef } from '../../data/mistborn/legados'
import { useWorldConfig } from '../../store/campaignStore'
import type { OpcionCreacion, PasoCreacion } from '../../worlds/types'

/** The legacies of the world (`[]` in a world without them) */
export function useLegados(): LegadoDef[] {
  const cfg = useWorldConfig()
  const { data = [] } = useQuery({
    queryKey: ['datos', 'legados'],
    queryFn: () => import('../../data/mistborn/legados').then((m) => m.LEGADOS),
    enabled: cfg.features.legados,
    staleTime: Infinity,
  })
  return data
}

/** The options of a `creacion:<clave>` step, without the ones the table hides; `[]` for any other step */
export function useOpcionesPaso(paso: PasoCreacion | undefined): OpcionCreacion[] {
  const cargar = paso && 'opciones' in paso ? paso.opciones.cargar : undefined
  const ocultas = paso && 'ocultas' in paso ? paso.ocultas : []
  const { data = [] } = useQuery({
    queryKey: ['creacion', 'opciones', paso?.id ?? ''],
    queryFn: () => cargar!(),
    enabled: !!cargar,
    staleTime: Infinity,
  })
  return data.filter((o) => !ocultas.includes(o.id))
}

/** Visible label of the value of a `creacion:<clave>` step */
export const etiquetaOpcion = (opciones: OpcionCreacion[], id: string): string => opciones.find((o) => o.id === id)?.label ?? id
