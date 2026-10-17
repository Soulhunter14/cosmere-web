/**
 * Book images of the adversaries (AddGlobalNpcImages): the illustration, the stat block and the tactics box as the book prints
 * them, cut from the GM's own PDF by `scripts/aventura/fichas_libro.py` and uploaded to the catalog. Reading them, and matching the files of a bulk
 * upload with the catalog.
 */
import { useQuery } from '@tanstack/react-query'
import { globalNpcsApi } from '../api/global-npcs'
import type { BookImageKind, GlobalNpc } from '../types'

export const ETIQUETA_IMAGEN_LIBRO: Record<BookImageKind, string> = { retrato: 'Retrato', ficha: 'Ficha', tacticas: 'Tácticas' }

/** The order a book page is read in: who it is, the stat block, how it fights */
export const ORDEN_IMAGENES_LIBRO: BookImageKind[] = ['retrato', 'ficha', 'tacticas']

/**
 * A book image of an adversary as an object URL (the request needs the token, so it can never be an <img src> to the API).
 * The visit keeps it: a stat block does not change during a session, and a new upload invalidates `['global-npc-image', id]`.
 */
export function useImagenLibro(cId: number, npcId: number, kind: BookImageKind, activa = true) {
  return useQuery({
    queryKey: ['global-npc-image', npcId, kind],
    queryFn: async () => URL.createObjectURL(await globalNpcsApi.getBookImage(npcId, kind, cId)),
    enabled: activa,
    staleTime: Infinity,
    gcTime: Infinity,
  })
}

/** «Quimera hemalúrgica, líder de manada» → «quimera-hemalurgica-lider-de-manada», as the script names the files */
export const slugNombre = (texto: string) =>
  texto.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

/** The script's book ids, by the `source` of the catalog («El legado», «Guía del mundo») */
const LIBROS: { id: string; fuente: RegExp }[] = [
  { id: 'legado', fuente: /legado/ },
  { id: 'guia', fuente: /guia/ },
  { id: 'caminapiedras', fuente: /caminapiedras/ },
]
const libroDeFuente = (source: string) => LIBROS.find((l) => l.fuente.test(slugNombre(source)))?.id ?? null

/** «maton.guia.tacticas.webp» → { slug: 'maton', libro: 'guia', kind: 'tacticas' }; null when it is not a file of the script */
export function leerArchivoFicha(nombre: string): { slug: string; libro: string; kind: BookImageKind } | null {
  const m = /^([a-z0-9-]+)\.([a-z0-9-]+)(?:\.(tacticas|retrato))?\.(webp|png|jpe?g)$/i.exec(nombre.trim())
  return m ? { slug: m[1].toLowerCase(), libro: m[2].toLowerCase(), kind: (m[3]?.toLowerCase() as BookImageKind | undefined) ?? 'ficha' } : null
}

export interface SubidaFicha {
  npc: GlobalNpc
  kind: BookImageKind
  file: File
}

/**
 * The files of a bulk upload against the catalog of the campaign: each one goes to the adversary of its name. An adversary that
 * both books print («Matón») takes the file of the book of its `source`, and the other book's is left out; one without a known
 * book takes whichever comes.
 */
export function emparejarFichas(files: File[], catalogo: GlobalNpc[]) {
  const porSlug = new Map(catalogo.map((n) => [slugNombre(n.name), n]))
  const candidatos = new Map<string, { npc: GlobalNpc; kind: BookImageKind; files: { file: File; libro: string }[] }>()
  const sinAdversario: string[] = []
  const noValidos: string[] = []
  for (const file of files) {
    const a = leerArchivoFicha(file.name)
    if (!a) {
      noValidos.push(file.name)
      continue
    }
    const npc = porSlug.get(a.slug)
    if (!npc) {
      sinAdversario.push(file.name)
      continue
    }
    const clave = `${npc.id}:${a.kind}`
    const c = candidatos.get(clave) ?? { npc, kind: a.kind, files: [] }
    c.files.push({ file, libro: a.libro })
    candidatos.set(clave, c)
  }
  const subidas: SubidaFicha[] = []
  const deOtroLibro: string[] = []
  for (const { npc, kind, files: opciones } of candidatos.values()) {
    const suyo = libroDeFuente(npc.source)
    const elegida = opciones.find((o) => o.libro === suyo) ?? opciones[0]
    subidas.push({ npc, kind, file: elegida.file })
    deOtroLibro.push(...opciones.filter((o) => o !== elegida).map((o) => o.file.name))
  }
  return { subidas, sinAdversario, deOtroLibro, noValidos }
}
