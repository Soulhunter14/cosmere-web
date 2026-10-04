/**
 * Book-diagram grid positions of the talent trees of Nacidos de la bruma that are not in Stormlight (T38-1; the 32 grids of the powers
 * `poder:<arte>:<metal>` are added by T38-2). Same shape and same convention as `src/data/talentGrids.ts`: each entry reproduces the
 * layout of the tree diagram printed in the manual (which lane, `col`, and which row, `row`, each card occupies), 0-indexed, lanes
 * left to right and rows top to bottom. The talent map reads them through `graph.rules.grids` (T34a, §7.7 #4, §8) and, without an entry,
 * falls back to two lanes in reading order (`talentMap.ts` `plateOf`).
 *
 * treeId convention (§7.7 #4, `gridKeyOf`):
 *   - 'caminoInvestido:<caminoId>' — one per metalborn path (5), `caminoId` as in `CaminoMetalId` / `CAMINOS_NACIDOS_DEL_METAL`
 *     (brumoso, nacido-de-la-bruma, feruquimista, ferrin, nacidoble). The main talent (Ruptura de brumoso, Herencia nacidoble…) is the
 *     key node of the tree and is not a cell, exactly like the main talent of the heroic paths.
 *   - 'ascendencia:<id>' — kandra and sangre-koloss. Like the singer tree in Stormlight, these are single trees whose principal talent
 *     (Forma natural, Resistencia koloss) opens the diagram; it is kept as the first row.
 *   - 'heroico:<caminoId>:<Especialidad>' — the 8 specialties that only exist in this book (Rebelde, Francotirador, Mataneblinos, Estafador,
 *     Inventor, Alborotador, Pistolero, Planificador), 2 lanes x 4 rows. The 10 specialties that both books share keep the Stormlight grids
 *     (their keys are picked from `TALENT_GRIDS` when T34a composes `MISTBORN_TALENTOS`, §8).
 *
 * Source: the pages cited at each entry of the Spanish manual (SPA_Mistborn_Handbook.pdf; PDF page = book page + 6), rendered at 200 DPI and
 * looked at one by one: `name` is the exact name of the talent in the data files (caminosNacidosDelMetal.ts, origenes.ts, heroicPaths.ts),
 * which the check script compares one by one. Rows and lanes follow the printed cards, not the alphabetical order of the entries.
 * Light module with no imports at run time: it only travels in the lazy `mistborn.data` chunk (§8, risk 6).
 */
import type { TalentGrid } from '../talentGrids'

export const TALENT_GRIDS_MISTBORN: Record<string, TalentGrid> = {
  // ── Metalborn paths (5 flat trees; the main talent is NOT a cell: it is the key node of the tree, drawn above the plate, as in the heroico grids) ──
  // Brumoso · diagram L.137 / PDF 143
  'caminoInvestido:brumoso': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Investido', col: 0, row: 0 },
      { name: 'Quemar instintivamente', col: 1, row: 0 },
      { name: 'Portentoso', col: 0, row: 1 },
      { name: 'Trazas de metal', col: 1, row: 1 },
      { name: 'Savantismo alomántico', col: 0, row: 2 },
    ],
  },
  // Nacido de la bruma · diagram L.143 / PDF 149
  'caminoInvestido:nacido-de-la-bruma': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Investido', col: 0, row: 0 },
      { name: 'Mezcla metálica', col: 1, row: 0 },
      { name: 'Trazas de metal', col: 0, row: 1 },
      { name: 'Quemar instintivamente', col: 1, row: 1 },
      { name: 'Quemar selectivamente', col: 0, row: 2 },
      { name: 'Quemar simultáneamente', col: 1, row: 2 },
    ],
  },
  // Feruquimista · diagram L.147 / PDF 153
  'caminoInvestido:feruquimista': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Mentes de metal ampliadas', col: 0, row: 0 },
      { name: 'Almacenamiento rápido', col: 1, row: 0 },
      { name: 'Ancho de banda mental', col: 0, row: 1 },
      { name: 'Decantación instintiva', col: 1, row: 1 },
      { name: 'Mente de metal integrada', col: 0, row: 2 },
      { name: 'Decantación rápida', col: 1, row: 2 },
    ],
  },
  // Ferrin · diagram L.151 / PDF 157
  'caminoInvestido:ferrin': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Mentes de metal ampliadas', col: 0, row: 0 },
      { name: 'Almacenamiento rápido', col: 1, row: 0 },
      { name: 'Últimas reservas', col: 0, row: 1 },
      { name: 'Decantación instintiva', col: 1, row: 1 },
      { name: 'Mente de metal integrada', col: 0, row: 2 },
    ],
  },
  // Nacidoble · diagram L.157 / PDF 163 (the only path printed in 4 lanes)
  'caminoInvestido:nacidoble': {
    cols: 4,
    rows: 3,
    cells: [
      { name: 'Almacenamiento rápido', col: 0, row: 0 },
      { name: 'Mentes de metal ampliadas', col: 1, row: 0 },
      { name: 'Investido', col: 2, row: 0 },
      { name: 'Quemar instintivamente', col: 3, row: 0 },
      { name: 'Decantación instintiva', col: 0, row: 1 },
      { name: 'Componedor', col: 1, row: 1 },
      { name: 'Resonancia aleada', col: 2, row: 1 },
      { name: 'Trazas de metal', col: 3, row: 1 },
      { name: 'Mente de metal integrada', col: 0, row: 2 },
      { name: 'Composición recursiva', col: 1, row: 2 },
      { name: 'Sinergia metálica', col: 2, row: 2 },
    ],
  },

  // ── Ancestry trees (like 'cantor' in Stormlight, the principal talent is the first row; plateOf never consumes the key, so that cell is harmless) ──
  // Kandra · diagram L.35 / PDF 41. Forma natural (principal) and Disfraz kandra are printed centred over the two lanes: [inferido] they are stored in lane 0, the lanes being integers
  'ascendencia:kandra': {
    cols: 2,
    rows: 5,
    cells: [
      { name: 'Forma natural', col: 0, row: 0 },
      { name: 'Disfraz kandra', col: 0, row: 1 },
      { name: 'Imitación improvisada', col: 0, row: 2 },
      { name: 'Ocultar objeto', col: 1, row: 2 },
      { name: 'Remodelación rápida', col: 0, row: 3 },
      { name: 'Herramientas orgánicas', col: 1, row: 3 },
      { name: 'Formas desagradables', col: 0, row: 4 },
      { name: 'Formas creativas', col: 1, row: 4 },
    ],
  },
  // Sangre koloss · diagram L.39 / PDF 45. Resistencia koloss (principal) is printed centred: [inferido] stored in lane 0
  'ascendencia:sangre-koloss': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Resistencia koloss', col: 0, row: 0 },
      { name: 'Recuperación koloss', col: 0, row: 1 },
      { name: 'Tamaño desmedido', col: 1, row: 1 },
      { name: 'Recuperación rápida', col: 0, row: 2 },
      { name: 'Recuperación reactiva', col: 1, row: 2 },
    ],
  },

  // ── Heroic specialties that only exist in Nacidos de la bruma (2 lanes x 4 rows, read row by row; the path's main talent is not part of the grid). The other 10 specialties reuse the 'heroico:*' grids of Stormlight (src/data/talentGrids.ts) ──
  // Rebelde · diagram L.81 / PDF 87
  'heroico:agente:Rebelde': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Coraje puro', col: 0, row: 0 },
      { name: 'Mirada desafiante', col: 1, row: 0 },
      { name: 'Alzar el estandarte', col: 0, row: 1 },
      { name: 'Entrenamiento de combate', col: 1, row: 1 },
      { name: 'Aprovechar el descontento', col: 0, row: 2 },
      { name: 'Sin piedad', col: 1, row: 2 },
      { name: 'Escuchar rumores', col: 0, row: 3 },
      { name: 'Don del mártir', col: 1, row: 3 },
    ],
  },
  // Francotirador · diagram L.88 / PDF 94
  'heroico:cazador:Francotirador': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Ojo agudo', col: 0, row: 0 },
      { name: 'Disciplina de tiro', col: 1, row: 0 },
      { name: 'Puntería firme', col: 0, row: 1 },
      { name: 'Cuerpo a tierra', col: 1, row: 1 },
      { name: 'Compostura', col: 0, row: 2 },
      { name: 'Marcado rápido', col: 1, row: 2 },
      { name: 'Puntería mortal', col: 0, row: 3 },
      { name: 'Tirador certero', col: 1, row: 3 },
    ],
  },
  // Mataneblinos · diagram L.89 / PDF 95
  'heroico:cazador:Mataneblinos': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Buscar alomante', col: 0, row: 0 },
      { name: 'Armamento mataneblinos', col: 1, row: 0 },
      { name: 'Serenidad', col: 0, row: 1 },
      { name: 'Tacto delicado', col: 1, row: 1 },
      { name: 'Dos pasos por delante', col: 0, row: 2 },
      { name: 'Apagar', col: 1, row: 2 },
      { name: 'Ferocidad temeraria', col: 0, row: 3 },
      { name: 'Presciencia', col: 1, row: 3 },
    ],
  },
  // Estafador · diagram L.96 / PDF 102
  'heroico:enviado:Estafador': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Adulación falsa', col: 0, row: 0 },
      { name: 'Esta corre de mi cuenta', col: 1, row: 0 },
      { name: 'Excusa plausible', col: 0, row: 1 },
      { name: 'Timo a largo plazo', col: 1, row: 1 },
      { name: 'Salida de tono', col: 0, row: 2 },
      { name: '¡Te pillé!', col: 1, row: 2 },
      { name: 'Farol excepcional', col: 0, row: 3 },
      { name: 'Echar leña al fuego', col: 1, row: 3 },
    ],
  },
  // Inventor (Era 2) · diagram L.105 / PDF 111
  'heroico:erudito:Inventor': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Operario experto', col: 0, row: 0 },
      { name: 'Ajuste apresurado', col: 1, row: 0 },
      { name: 'Escrutinio agudo', col: 0, row: 1 },
      { name: 'Fabricante de armas', col: 1, row: 1 },
      { name: 'Lo tengo por aquí', col: 0, row: 2 },
      { name: 'Desencasquillar la situación', col: 1, row: 2 },
      { name: 'Maravilla de la modernidad', col: 0, row: 3 },
      { name: 'Experto en detonaciones', col: 1, row: 3 },
    ],
  },
  // Alborotador · diagram L.112 / PDF 118
  'heroico:guerrero:Alborotador': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Posición de forcejeo', col: 0, row: 0 },
      { name: 'Paso firme', col: 1, row: 0 },
      { name: 'Torvo', col: 0, row: 1 },
      { name: 'Encajar los golpes', col: 1, row: 1 },
      { name: 'Posición de bravucón', col: 0, row: 2 },
      { name: 'Pulso de la batalla', col: 1, row: 2 },
      { name: 'Curtido en batalla', col: 0, row: 3 },
      { name: 'Golpetazo', col: 1, row: 3 },
    ],
  },
  // Pistolero (Era 2) · diagram L.113 / PDF 119
  'heroico:guerrero:Pistolero': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Disparo trucado', col: 0, row: 0 },
      { name: 'Disciplina de tiro', col: 1, row: 0 },
      { name: 'Posición de dos armas', col: 0, row: 1 },
      { name: 'Sacudida aterradora', col: 1, row: 1 },
      { name: 'Manos rápidas', col: 0, row: 2 },
      { name: 'Poderoso', col: 1, row: 2 },
      { name: 'Daño secundario', col: 0, row: 3 },
      { name: 'Disparo en abanico', col: 1, row: 3 },
    ],
  },
  // Planificador · diagram L.121 / PDF 127
  'heroico:lider:Planificador': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Plan maestro', col: 0, row: 0 },
      { name: 'Compostura', col: 1, row: 0 },
      { name: 'Seguir el plan', col: 0, row: 1 },
      { name: '¡A tu espalda!', col: 1, row: 1 },
      { name: 'A mi señal', col: 0, row: 2 },
      { name: 'Mando preciso', col: 1, row: 2 },
      { name: 'Ejecución fluida', col: 0, row: 3 },
      { name: 'Tengo justo lo necesario', col: 1, row: 3 },
    ],
  },
}
