/**
 * «Progresión de las artes metálicas» (L.163 / PDF 169): limit, die and range of the metallic arts by degrees in the Investida skill
 * (Alomancia or Feruquimia). TS twin of `ArtesMetalicas.Progresion` on the server (P5: one table per language and nothing else):
 * only the encyclopedia reads it. The sheet and the dice roller read the server's `derivadosSet` (§7.8).
 */

/** Degrees in the Investida skill; 6 stands for the row «6 o más» */
export type GradosArte = 0 | 1 | 2 | 3 | 4 | 5 | 6

export interface ProgresionArte {
  /** Most Investidura (or charges) that can go into a single effect; 'rango' = «Igual al rango» (the 6-or-more row) */
  limite: number | 'rango'
  /** Faces of the metallic arts die; 1 = «1 (sin tirada)» */
  dado: 1 | 4 | 6 | 8 | 10 | 12 | 20
  /** Range in metres */
  alcance: number
  notaLibro?: string
}

export const PROGRESION_ARTES_METALICAS: Record<GradosArte, ProgresionArte> = {
  0: { limite: 1, dado: 1, alcance: 3 },
  1: { limite: 1, dado: 4, alcance: 6 },
  2: { limite: 2, dado: 6, alcance: 12 },
  3: { limite: 3, dado: 8, alcance: 24 },
  4: { limite: 4, dado: 10, alcance: 48 },
  5: { limite: 5, dado: 12, alcance: 96 },
  6: {
    limite: 'rango',
    dado: 20,
    alcance: 192,
    notaLibro:
      'Con 6 o más grados la tabla dice «Igual al rango», mientras que el texto de L.163 / PDF 169 define el límite como los grados en la ' +
      'habilidad Investida (mínimo 1). Se transcribe la tabla tal cual y el servidor aplica el rango del personaje [inferido]. ' +
      'Solo es posible superar los 5 grados con hemalurgia u otros efectos especiales.',
  },
}
