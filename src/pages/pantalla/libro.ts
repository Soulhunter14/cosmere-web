/**
 * The «Libro» of the director's screen: the adventure book of the campaign's world (`WorldConfig.libro`), only its chapters for the
 * campaign's era. It is loaded on demand (`import()`), once per world and era.
 */
import { useQuery } from '@tanstack/react-query'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { isAvailable } from '../../worlds'
import type { LibroAventura } from '../../data/libros/tipos'

/** The book with the chapters of this campaign, or null while it loads, when the world has none or none fits the era */
export function useLibro(): LibroAventura | null {
  const cfg = useWorldConfig()
  const era = useEra()
  const ref = cfg.libro
  const q = useQuery({
    queryKey: ['libro', ref?.id ?? null, era],
    queryFn: async (): Promise<LibroAventura | null> => {
      if (!ref) return null
      const capitulos = (await ref.cargar()).filter((c) => isAvailable(c, era))
      return capitulos.length ? { id: ref.id, titulo: ref.titulo, capitulos } : null
    },
    enabled: !!ref,
    staleTime: Infinity,
    gcTime: Infinity,
    networkMode: 'always',
  })
  return q.data ?? null
}
