/**
 * Manifest of the «originales» of the encyclopedia of a world (`<world>.json`, next to this file): for each section, its entries with
 * the PDF pages they come from. The same file drives `scripts/enciclopedia/generar_originales.py`, which writes the text and the
 * mini-PDF of every entry, and the encyclopedia, which offers them. Only page numbers live here, never the book's text.
 */

/** A section of the encyclopedia with originals */
export type SeccionOriginales = 'caminos-heroicos' | 'caminos-metal' | 'artes-metalicas'

export interface EntradaOriginal {
  /** Key of the entry in its section: the id of the path («agente», «brumoso»), `<arte>-<metal>` for a power, «intro»… */
  clave: string
  titulo: string
  /** PDF page ranges, both ends included (1-based) */
  paginas: [number, number][]
}

export interface ManifiestoOriginales {
  /** Title of the book the pages come from */
  libro: string
  /** PDF page = book page + desfase */
  desfase: number
  secciones: Partial<Record<SeccionOriginales, EntradaOriginal[]>>
}
