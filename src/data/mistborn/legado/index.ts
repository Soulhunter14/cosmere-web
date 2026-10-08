/**
 * «El legado de los nacidos de la bruma» (Nacidos de la Bruma): the book's adventure, chapter by chapter. Chapters 1-4 are played
 * in Era 1 and 5-9 in Era 2 (`eras`). Every fact (scenes in the book's order, NPCs, tests and difficulties, enemies with the names
 * of the catalog, rules, tables, maps, levels and pages) follows the book; the wording is our own summary, so the read-aloud boxes
 * cite the page to read the original. Source text: `cosmere-api/Resources/pdfextract/mistborn_legado_flow.txt` (local only).
 * Loaded on demand through `WorldConfig.libro` (never in the main bundle).
 */
import type { AdventureChapter } from '../../libros/tipos'
import { CAPITULO_1 } from './cap1'
import { CAPITULO_2 } from './cap2'
import { CAPITULO_3 } from './cap3'
import { CAPITULO_4 } from './cap4'
import { CAPITULO_5 } from './cap5'
import { CAPITULO_6 } from './cap6'
import { CAPITULO_7 } from './cap7'
import { CAPITULO_8 } from './cap8'
import { CAPITULO_9 } from './cap9'

export const CAPITULOS: AdventureChapter[] = [
  CAPITULO_1, CAPITULO_2, CAPITULO_3, CAPITULO_4, CAPITULO_5, CAPITULO_6, CAPITULO_7, CAPITULO_8, CAPITULO_9,
]
