/**
 * The «Libro» of the director's screen: the adventure book of the campaign's world (`WorldConfig.libro`), only its chapters for the
 * campaign's era. It is loaded on demand (`import()`), once per world and era.
 */
import { useQuery } from '@tanstack/react-query'
import { useEra, useWorldConfig } from '../../store/campaignStore'
import { isAvailable } from '../../worlds'
import type { LibroAventura } from '../../data/libros/tipos'
import { bookApi } from '../../api/book'
import { usePantalla } from './contexto'
import { dividirGuion } from './guion'

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

// ── Libro original: the book uploaded by the director (PanelLibroOriginal) ──

const MAX_MD = 500_000

/** A chapter file: front matter with `capitulo:` and `titulo:`, or a `# Capítulo N · Título` heading, and at least one scene */
export function leerCapituloSubido(texto: string): { numero: number; titulo: string; md: string } | { error: string } {
  const md = texto.replace(/\r\n?/g, '\n').trim()
  const portada = /^---\n([\s\S]*?)\n---/.exec(md)?.[1] ?? ''
  const campo = (k: string) => new RegExp(`^${k}\\s*:\\s*(.+)$`, 'mi').exec(portada)?.[1].trim() ?? ''
  const cabecera = /^#\s+Cap[ií]tulo\s+(\d+)\s*[·:.-]\s*(.+)$/m.exec(md)
  const numero = Number(campo('capitulo') || cabecera?.[1] || NaN)
  const titulo = campo('titulo') || cabecera?.[2]?.trim() || ''
  if (!Number.isInteger(numero) || numero < 1 || numero > 99) return { error: 'No dice qué capítulo es (`capitulo:` en la cabecera).' }
  if (!titulo) return { error: 'No tiene título (`titulo:` en la cabecera).' }
  if (md.length > MAX_MD) return { error: 'Es demasiado grande (más de 500 000 caracteres).' }
  if (dividirGuion(md).escenas.length === 0) return { error: 'No tiene escenas (`## Título`).' }
  return { numero, titulo, md }
}

/** The chapters uploaded to the campaign (empty while loading or when there are none) */
export function useLibroOriginal() {
  const { cId } = usePantalla()
  const q = useQuery({ queryKey: ['book', cId], queryFn: () => bookApi.list(cId) })
  return { capitulos: q.data ?? [], listo: q.isSuccess }
}
