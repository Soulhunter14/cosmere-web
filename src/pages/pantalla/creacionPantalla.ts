/**
 * The creation session as the screen reads it: the creation state of the campaign (`GET …/creacion`, the same query as the «Creación»
 * page keeps) and what the screen derives from it. The components live in SesionCreacion.tsx.
 */
import { useQuery } from '@tanstack/react-query'
import { creacionApi } from '../../api/creacion'
import { useWorldConfig } from '../../store/campaignStore'
import type { CreacionEstado, CreacionPersonaje } from '../../types'

/** The creation state of the campaign (only in a world with guided creation); `activa` while the session is prepared or played */
export function useCreacionPantalla(cId: number) {
  const cfg = useWorldConfig()
  const { data } = useQuery({ queryKey: ['creacion', cId], queryFn: () => creacionApi.get(cId), enabled: cId > 0 && !!cfg.creacion })
  const estado = data?.sesion.estado ?? 'pendiente'
  return {
    creacion: data,
    pasos: cfg.creacion?.pasos ?? [],
    activa: estado === 'preparando' || estado === 'en-curso',
    enCurso: estado === 'en-curso',
  }
}

/** Whether the open table session is the creation session the campaign registered */
export const esSesionDeCreacion = (sesionId: string | undefined, creacion: CreacionEstado | undefined): boolean =>
  !!sesionId && !!creacion && creacion.sesion.estado === 'en-curso' && creacion.sesion.mesaId === sesionId

/** The characters still in creation */
export const personajesEnCreacion = (creacion: CreacionEstado | undefined): CreacionPersonaje[] =>
  (creacion?.personajes ?? []).filter((p) => !p.completada)
