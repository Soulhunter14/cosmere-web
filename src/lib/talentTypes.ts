/**
 * Talent types shared by every world (Cosmere core, T34a, §2, §8): a talent as the trees of the data files write it, and the
 * book-diagram grid of a talent tree. Moved as they were from src/data/potencias.ts (`Talento`) and src/data/talentGrids.ts
 * (`TalentGrid`, `TalentGridCell`), which re-export them so that no existing import changes. Types only: no runtime code.
 */
import type { ActivationType } from '../components/TalentActivation'

export interface Talento {
  name: string
  cost: ActivationType
  prereq?: string
  description: string
  /** Nota sobre una errata del libro (discrepancia entre el diagrama y el texto): explica qué dice cada fuente, sin cambiar `prereq`. */
  notaLibro?: string
}

export interface TalentGridCell {
  /** Exact talent name, matching the corresponding data file's talento/forma 'name'/'nombre'. */
  name: string
  /** 0-indexed lane (left-to-right, as printed in the book). */
  col: number
  /** 0-indexed row (top-to-bottom, as printed in the book). */
  row: number
}

export interface TalentGrid {
  /** Number of lanes in this tree's diagram. */
  cols: number
  /** Number of rows in this tree's diagram. */
  rows: number
  /** One entry per talent placed in the diagram. Not necessarily cols*rows — every heroic,
   *  potencia and radiante grid here is a full rectangle, but 'cantor' has a gap (no talent
   *  above/below 'Mente ambiciosa' in its own lane) and 'radiante:truthwatchers' adds an extra
   *  row for a talent with no diagram of its own. */
  cells: TalentGridCell[]
}
