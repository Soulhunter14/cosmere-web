/**
 * «Caminapiedras» (Archivo de las Tormentas): the book's adventure, chapter by chapter. Every fact (scenes in the book's order,
 * NPCs, tests and difficulties, enemies, rules, maps, levels and pages) follows the book; the wording is our own summary, so
 * the read-aloud boxes cite the page to read the original. Source text: `cosmere-api/Resources/pdfextract/caminapiedras_capitulos/`.
 */
import { CHAPTER_1 } from './cap1'
import { CHAPTER_2 } from './cap2'
import { CHAPTER_3 } from './cap3'
import { CHAPTER_4 } from './cap4'
import type { AdventureChapter } from './tipos'

export * from './tipos'

export const CHAPTERS: AdventureChapter[] = [CHAPTER_1, CHAPTER_2, CHAPTER_3, CHAPTER_4]
