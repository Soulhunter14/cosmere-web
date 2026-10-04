/**
 * Skill tables per surface.
 *
 * T06b: the three LEGACY Stormlight tables, transcribed row by row from the three places that hold their own copy today
 * (the files are not touched here). They differ from each other, so a single table cannot reproduce them and unifying
 * them would change the roll modifier of the campaign in progress (P1, audit 2026-10-03 points 5 and 8):
 *   - sheet:  CharacterDetailPage.tsx `SECTIONS`          «Armas Ligeras», «Conocimiento», Atletismo → VEL, Intimidación → VOL
 *   - roller: DiceRoller.tsx `SKILLS` / `SKILL_TO_FIELDS`  «Armas ligeras», «Saber», Atletismo → FUE, Intimidación → PRE
 *   - NPC:    GlobalNpcDetailPage.tsx `SECTIONS`           Disciplina and Intimidación → DIS, Supervivencia → VOL
 * T26 adds `HABILIDADES_COSMERE` (the book's names, identical in both manuals), which Mistborn uses from T26 and
 * Stormlight from T50; T50 then deletes the three legacy tables and the legacy NPC grouping (`COLUMNAS_STORMLIGHT_PNJ_LEGADO`).
 *
 * `columna` is a property of the skill, not of the table: the roller has no columns, so its rows carry the column
 * the same skill has on the sheet (the sheet and the NPC page agree on it).
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

/** Character sheet (CharacterDetailPage.tsx `SECTIONS`): same order, labels and attributes as today */
export const HABILIDADES_STORMLIGHT_LEGADO: HabilidadDef[] = [
  hab('agilidad', 'Agilidad', 'VEL', 'fisico'),
  hab('armasLigeras', 'Armas Ligeras', 'VEL', 'fisico'),
  hab('armasPesadas', 'Armas Pesadas', 'FUE', 'fisico'),
  hab('atletismo', 'Atletismo', 'VEL', 'fisico'),
  hab('hurto', 'Hurto', 'VEL', 'fisico'),
  hab('sigilo', 'Sigilo', 'VEL', 'fisico'),

  hab('deduccion', 'Deducción', 'INT', 'cognitivo'),
  hab('disciplina', 'Disciplina', 'VOL', 'cognitivo'),
  hab('intimidacion', 'Intimidación', 'VOL', 'cognitivo'),
  hab('manufactura', 'Manufactura', 'INT', 'cognitivo'),
  hab('medicina', 'Medicina', 'INT', 'cognitivo'),
  hab('conocimiento', 'Conocimiento', 'INT', 'cognitivo'),

  hab('engano', 'Engaño', 'PRE', 'espiritual'),
  hab('liderazgo', 'Liderazgo', 'PRE', 'espiritual'),
  hab('percepcion', 'Percepción', 'DIS', 'espiritual'),
  hab('perspicacia', 'Perspicacia', 'DIS', 'espiritual'),
  hab('persuasion', 'Persuasión', 'PRE', 'espiritual'),
  hab('supervivencia', 'Supervivencia', 'DIS', 'espiritual'),
]

/** Dice roller (DiceRoller.tsx `SKILLS` order and `SKILL_TO_FIELDS`): the label is the key the roller shows and looks up */
export const HABILIDADES_STORMLIGHT_TIRADOR_LEGADO: HabilidadDef[] = [
  hab('agilidad', 'Agilidad', 'VEL', 'fisico'),
  hab('armasLigeras', 'Armas ligeras', 'VEL', 'fisico'),
  hab('armasPesadas', 'Armas pesadas', 'FUE', 'fisico'),
  hab('atletismo', 'Atletismo', 'FUE', 'fisico'),
  hab('deduccion', 'Deducción', 'INT', 'cognitivo'),
  hab('disciplina', 'Disciplina', 'VOL', 'cognitivo'),
  hab('engano', 'Engaño', 'PRE', 'espiritual'),
  hab('hurto', 'Hurto', 'VEL', 'fisico'),
  hab('intimidacion', 'Intimidación', 'PRE', 'cognitivo'),
  hab('liderazgo', 'Liderazgo', 'PRE', 'espiritual'),
  hab('manufactura', 'Manufactura', 'INT', 'cognitivo'),
  hab('medicina', 'Medicina', 'INT', 'cognitivo'),
  hab('percepcion', 'Percepción', 'DIS', 'espiritual'),
  hab('perspicacia', 'Perspicacia', 'DIS', 'espiritual'),
  hab('persuasion', 'Persuasión', 'PRE', 'espiritual'),
  hab('conocimiento', 'Saber', 'INT', 'cognitivo'),
  hab('sigilo', 'Sigilo', 'VEL', 'fisico'),
  hab('supervivencia', 'Supervivencia', 'DIS', 'espiritual'),
]

/** NPC page (GlobalNpcDetailPage.tsx `SECTIONS`): same order, labels and attributes as today */
export const HABILIDADES_STORMLIGHT_PNJ_LEGADO: HabilidadDef[] = [
  hab('agilidad', 'Agilidad', 'VEL', 'fisico'),
  hab('armasLigeras', 'Armas ligeras', 'VEL', 'fisico'),
  hab('armasPesadas', 'Armas pesadas', 'FUE', 'fisico'),
  hab('atletismo', 'Atletismo', 'FUE', 'fisico'),
  hab('hurto', 'Hurto', 'VEL', 'fisico'),
  hab('sigilo', 'Sigilo', 'VEL', 'fisico'),

  hab('deduccion', 'Deducción', 'INT', 'cognitivo'),
  hab('disciplina', 'Disciplina', 'DIS', 'cognitivo'),
  hab('intimidacion', 'Intimidación', 'DIS', 'cognitivo'),
  hab('manufactura', 'Manufactura', 'INT', 'cognitivo'),
  hab('medicina', 'Medicina', 'INT', 'cognitivo'),
  hab('conocimiento', 'Conocimiento', 'INT', 'cognitivo'),

  hab('engano', 'Engaño', 'PRE', 'espiritual'),
  hab('liderazgo', 'Liderazgo', 'PRE', 'espiritual'),
  hab('percepcion', 'Percepción', 'DIS', 'espiritual'),
  hab('perspicacia', 'Perspicacia', 'DIS', 'espiritual'),
  hab('persuasion', 'Persuasión', 'PRE', 'espiritual'),
  hab('supervivencia', 'Supervivencia', 'VOL', 'espiritual'),
]

/**
 * T26. The book's table, identical in the two manuals: skill descriptions (Mistborn L.65-69 / PDF 71-75; Stormlight
 * `ch3_chars.txt`, «Modificadores de habilidad basados en…»), example sheet (L.22 / PDF 28) and blank sheet (L.402 / PDF 408).
 * Armamento ligero (VEL) and pesado (FUE), Saber (INT), Atletismo (FUE), Disciplina and Intimidación (VOL), Supervivencia (DIS).
 * Same fields and order as the sheet, with the labels and attributions of the book. Mistborn reads it from T26 on the sheet and the
 * NPC page (the dice roller does from T43); Stormlight, which keeps its three legacy tables, reads it in the three places from T50.
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
 * T26. The two attributes that head each column, in the book (the three defenses, L.26 / PDF 32; the sheet, L.402 / PDF 408):
 * Físico = FUE + VEL, Cognitivo = INT + VOL, Espiritual = DIS + PRE. The character sheet already groups them like this;
 * the NPC page reads them from here unless the world declares `columnasPnj`.
 */
export const COLUMNAS_COSMERE: AtributosColumna = {
  fisico: ['fuerza', 'velocidad'],
  cognitivo: ['intelecto', 'voluntad'],
  espiritual: ['discernimiento', 'presencia'],
}

/**
 * T26. The NPC page as it is today, kept for Stormlight (P1): Cognitivo = INT + DIS and Espiritual = VOL + PRE, so the defenses
 * of an adversary add the crossed attributes (audit 2026-10-03 point 7: the book says INT + VOL and DIS + PRE). T50 deletes it.
 */
export const COLUMNAS_STORMLIGHT_PNJ_LEGADO: AtributosColumna = {
  fisico: ['fuerza', 'velocidad'],
  cognitivo: ['intelecto', 'discernimiento'],
  espiritual: ['voluntad', 'presencia'],
}
