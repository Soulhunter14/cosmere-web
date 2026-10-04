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
 * Stormlight from T50; T50 then deletes the three legacy tables.
 *
 * `columna` is a property of the skill, not of the table: the roller has no columns, so its rows carry the column
 * the same skill has on the sheet (the sheet and the NPC page agree on it).
 */
import type { SkillField } from '../lib/talentGraph'
import type { AttrField, HabilidadDef } from './types'

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
