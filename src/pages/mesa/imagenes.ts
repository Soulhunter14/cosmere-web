import { useQuery } from '@tanstack/react-query'
import { mesaApi } from '../../api/mesa'
import { globalNpcsApi } from '../../api/global-npcs'
import type { OrigenImagen } from './publica'

/**
 * What to put in an <img src> for an image of the table: a public path or URL as it is; an uploaded image or a book portrait as an
 * object URL fetched with the token (the visit keeps it: `staleTime: Infinity`). The portrait shares its cache key with
 * `useImagenLibro` (src/lib/fichasLibro.ts), so the director's screen never downloads it twice.
 */
export function useImagenMesa(cId: number, origen: OrigenImagen | null): { url: string | null; cargando: boolean; fallo: boolean } {
  const conToken = origen?.tipo === 'subida' || origen?.tipo === 'retrato'
  const q = useQuery({
    queryKey: origen?.tipo === 'subida'
      ? ['mesa-imagen', cId, origen.imagenId]
      : origen?.tipo === 'retrato'
        ? ['global-npc-image', origen.adversarioId, 'retrato']
        : ['mesa-imagen', 'ninguna'],
    queryFn: async () => {
      if (origen?.tipo === 'subida') return URL.createObjectURL(await mesaApi.getImage(cId, origen.imagenId))
      if (origen?.tipo === 'retrato') return URL.createObjectURL(await globalNpcsApi.getBookImage(origen.adversarioId, 'retrato', cId))
      return null
    },
    enabled: conToken,
    staleTime: Infinity,
    gcTime: Infinity,
  })
  if (!origen) return { url: null, cargando: false, fallo: false }
  if (origen.tipo === 'publica') return { url: origen.url, cargando: false, fallo: false }
  return { url: q.data ?? null, cargando: q.isLoading, fallo: q.isError }
}
