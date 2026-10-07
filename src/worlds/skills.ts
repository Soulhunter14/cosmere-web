/**
 * Skill table of the Cosmere engine, the same one for every world.
 *
 * The book's names and attributions, identical in the two manuals: skill descriptions (Mistborn L.65-69 / PDF 71-75; Stormlight
 * `ch3_chars.txt`, «Modificadores de habilidad basados en…»), example sheet (L.22 / PDF 28) and blank sheet (L.402 / PDF 408).
 * Every world reads it through `WorldConfig.habilidades` on the three surfaces that list skills: the character sheet, the dice roller
 * and the NPC page. Mistborn has read it since T26 (the roller since T43). Stormlight kept three legacy tables that differed from each
 * other and from the book (T06b, audit 2026-10-03 points 5, 7 and 8); T50 (Q3) pointed it here and deleted them, so its labels
 * («Armamento ligero», «Armamento pesado», «Saber») and the attribute of Atletismo (FUE) and Intimidación (VOL) are the book's on all three surfaces.
 *
 * `columna` is a property of the skill, not of the table: the sheet and the NPC page group by it; the roller has no columns and ignores it.
 */
import type { SkillField } from '../lib/talentGraph'
import type { AtributosColumna, AttrField, HabilidadDef } from './types'

type Codigo = HabilidadDef['codigo']
type Columna = HabilidadDef['columna']

/** Attribute code (stored in custom skills and shown on the sheet) → Character field */
const ATRIBUTO_DE: Record<Codigo, AttrField> = {
  FUE: 'fuerza', VEL: 'velocidad', INT: 'intelecto', VOL: 'voluntad', DIS: 'discernimiento', PRE: 'presencia',
}

const hab = (field: SkillField, label: string, codigo: Codigo, columna: Columna): HabilidadDef =>
  ({ field, label, atributo: ATRIBUTO_DE[codigo], codigo, columna })

/**
 * The book's table. Armamento ligero (VEL) and pesado (FUE), Saber (INT), Atletismo (FUE), Disciplina and Intimidación (VOL),
 * Supervivencia (DIS). Same fields and order as the sheet (physical, cognitive and spiritual column), which is also the order the
 * dice roller lists them in.
 */
export const HABILIDADES_COSMERE: HabilidadDef[] = [
  hab('agilidad', 'Agilidad', 'VEL', 'fisico'),
  hab('armasLigeras', 'Armamento ligero', 'VEL', 'fisico'),
  hab('armasPesadas', 'Armamento pesado', 'FUE', 'fisico'),
  hab('atletismo', 'Atletismo', 'FUE', 'fisico'),
  hab('hurto', 'Hurto', 'VEL', 'fisico'),
  hab('sigilo', 'Sigilo', 'VEL', 'fisico'),

  hab('deduccion', 'Deducción', 'INT', 'cognitivo'),
  hab('disciplina', 'Disciplina', 'VOL', 'cognitivo'),
  hab('intimidacion', 'Intimidación', 'VOL', 'cognitivo'),
  hab('manufactura', 'Manufactura', 'INT', 'cognitivo'),
  hab('medicina', 'Medicina', 'INT', 'cognitivo'),
  hab('conocimiento', 'Saber', 'INT', 'cognitivo'),

  hab('engano', 'Engaño', 'PRE', 'espiritual'),
  hab('liderazgo', 'Liderazgo', 'PRE', 'espiritual'),
  hab('percepcion', 'Percepción', 'DIS', 'espiritual'),
  hab('perspicacia', 'Perspicacia', 'DIS', 'espiritual'),
  hab('persuasion', 'Persuasión', 'PRE', 'espiritual'),
  hab('supervivencia', 'Supervivencia', 'DIS', 'espiritual'),
]

/**
 * The two attributes that head each column, in the book (the three defenses, L.26 / PDF 32; the sheet, L.402 / PDF 408):
 * Físico = FUE + VEL, Cognitivo = INT + VOL, Espiritual = DIS + PRE. The character sheet groups them like this and the NPC page reads
 * them from here (T26); Stormlight's NPC page used to cross them (Cognitivo = INT + DIS, Espiritual = VOL + PRE, audit point 7) until T50.
 */
export const COLUMNAS_COSMERE: AtributosColumna = {
  fisico: ['fuerza', 'velocidad'],
  cognitivo: ['intelecto', 'voluntad'],
  espiritual: ['discernimiento', 'presencia'],
}
