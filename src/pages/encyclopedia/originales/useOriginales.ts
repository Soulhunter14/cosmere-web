/**
 * Originals of the encyclopedia: the manifest of the world (which entries a section has and the PDF pages of each one, a lazy
 * `import()` of `WorldConfig.originales`) joined with what the world has uploaded (`/encyclopedia/originals?campaignId=`).
 */
import { useQuery } from '@tanstack/react-query'
import { encyclopediaApi } from '../../../api/encyclopedia'
import { useCampaignStore, useWorldConfig } from '../../../store/campaignStore'
import type { EncyclopediaOriginalSummary } from '../../../types'
import type { EntradaOriginal, ManifiestoOriginales, SeccionOriginales } from '../../../data/originales/tipos'

/** Largest accepted mini-PDF and text (`EncyclopediaService.MaxPdfBytes` and `MaxMdLength`) */
export const MAX_PDF = 3_900_000
export const MAX_MD = 300_000

export interface EstadoOriginales {
  cId: number | null
  isGm: boolean
  /** null while the manifest loads or when the world offers no originals */
  manifiesto: ManifiestoOriginales | null
  /** Entries of the section in the order of the book (empty without a manifest) */
  entradas: EntradaOriginal[]
  /** What is uploaded of an entry; undefined = nothing */
  subido: (clave: string) => EncyclopediaOriginalSummary | undefined
  listo: boolean
}

export const claveListaOriginales = (cId: number | null) => ['encyclopedia-originals', cId] as const

export function useOriginales(seccion: SeccionOriginales): EstadoOriginales {
  const cfg = useWorldConfig()
  const { currentCampaign, isGm } = useCampaignStore()
  const cId = currentCampaign?.id ?? null
  const ref = cfg.originales

  const man = useQuery({
    queryKey: ['originales-manifiesto', cfg.id],
    queryFn: () => ref!.cargar(),
    enabled: !!ref,
    staleTime: Infinity,
    gcTime: Infinity,
    networkMode: 'always',
  })
  const lista = useQuery({
    queryKey: claveListaOriginales(cId),
    queryFn: () => encyclopediaApi.list(cId!),
    enabled: !!ref && cId != null,
  })

  const subidos = new Map((lista.data ?? []).filter((o) => o.section === seccion).map((o) => [o.key, o]))
  return {
    cId,
    isGm,
    manifiesto: man.data ?? null,
    entradas: man.data?.secciones[seccion] ?? [],
    subido: (clave) => subidos.get(clave),
    listo: man.isSuccess && lista.isSuccess,
  }
}

// ── Labels and download ──

const rango = ([a, b]: [number, number], d = 0) => (a === b ? `${a - d}` : `${a - d}-${b - d}`)

/** «L.74-81 · PDF 78-85» */
export function paginasDe(e: EntradaOriginal, m: ManifiestoOriginales): string {
  return `L.${e.paginas.map((p) => rango(p, m.desfase)).join(', ')} · PDF ${e.paginas.map((p) => rango(p)).join(', ')}`
}

/** «3,1 MB» / «820 KB» */
export function peso(bytes: number): string {
  return bytes >= 1_000_000 ? `${(bytes / 1_000_000).toLocaleString('es-ES', { maximumFractionDigits: 1 })} MB` : `${Math.max(1, Math.round(bytes / 1000))} KB`
}

/** Name of the downloaded file: «Agente · Manual del Archivo de las Tormentas (PDF 78-85).pdf» */
function nombreArchivo(e: EntradaOriginal, m: ManifiestoOriginales): string {
  const n = `${e.titulo} · ${m.libro} (PDF ${e.paginas.map((p) => rango(p)).join(', ')})`
  return `${n.replace(/[\\/:*?"<>|]+/g, '-')}.pdf`
}

/** Downloads the mini-PDF of an entry: it needs the token, so it goes through a blob and an object URL */
export async function descargarPdf(cId: number, seccion: SeccionOriginales, e: EntradaOriginal, m: ManifiestoOriginales) {
  const blob = await encyclopediaApi.getPdf(cId, seccion, e.clave)
  const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo(e, m)
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
