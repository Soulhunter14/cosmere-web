/**
 * Book-diagram grid positions of the talent trees of Nacidos de la bruma that are not in Stormlight (T38-1: paths, ancestries and
 * specialties; T38-2: the 32 grids of the powers `poder:<arte>:<metal>`). Same shape and same convention as
 * `src/data/talentGrids.ts`: each entry reproduces the layout of the tree diagram printed in the manual (which lane, `col`, and which
 * row, `row`, each card occupies), 0-indexed, lanes left to right and rows top to bottom. The talent map reads them through
 * `graph.rules.grids` (T34a, §7.7 #4, §8) and, without an entry, falls back to two lanes in reading order (`talentMap.ts` `plateOf`).
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
 *   - 'poder:<arte>:<metal>' — one per metallic power that has a talent tree (32: 16 alomantic and 16 feruchemical; alomancia de aluminio and
 *     feruquimia de nicrosil have no tree), `arte` and `metal` as in `PoderMetalico.id` (`alomancia:estano`, `feruquimia:laton`: ids without
 *     accents). The diagram hangs from the header «Alomancia de <metal>» / «Feruquimia de <metal>», so a power has no main talent: the
 *     talents of row 0 are its roots and every talent of the tree is a cell. Always 2 lanes, 1 to 4 rows.
 *
 * Source: the pages cited at each entry of the Spanish manual (SPA_Mistborn_Handbook.pdf; PDF page = book page + 6), rendered at 200 DPI and
 * looked at one by one: `name` is the exact name of the talent in the data files (caminosNacidosDelMetal.ts, origenes.ts, heroicPaths.ts,
 * alomancia.ts, feruquimia.ts), which the check script compares one by one. Rows and lanes follow the printed cards, not the alphabetical
 * order of the entries. For the 32 powers (T38-2) the lane and row read from each image were also compared with the coordinates of the card
 * titles in the text layer of the PDF: both agree on every card except the staggered diagram marked [inferido] below.
 * T38b (visual review): the 47 grids, and the 10 specialties shared with Stormlight that keep the `heroico:*` grids of `src/data/talentGrids.ts`,
 * were looked at again in the 200 DPI renders of their diagrams and compared with the card rectangles of the PDF drawing layer (lane = a column
 * of cards, row = position in that column): no cell had to move.
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

  // ── Alomantic powers (16 trees: the 17 metals minus alomancia de aluminio, which has no talent tree, L.175 / PDF 181). Two lanes; row 0 holds the roots hanging from the diagram header, the power itself is not a cell ──
  // Alomancia de acero · diagram L.174 / PDF 180
  'poder:alomancia:acero': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Ráfaga de monedas', col: 0, row: 0 },
      { name: 'Prevenirse con palanca', col: 1, row: 0 },
      { name: 'Disparo con empujón', col: 0, row: 1 },
      { name: 'Francotirador con monedas', col: 1, row: 1 },
      { name: 'Vuelo de acero auténtico', col: 0, row: 2 },
      { name: 'Experto en Empujones de acero', col: 1, row: 2 },
      { name: 'Burbuja protectora', col: 1, row: 3 },
    ],
  },
  // Alomancia de atium · diagram L.177 / PDF 183
  'poder:alomancia:atium': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Maestría de las sombras', col: 0, row: 0 },
      { name: 'En el peor de los casos', col: 1, row: 0 },
      { name: 'Vidente social', col: 0, row: 1 },
      { name: 'Despejar la mente', col: 1, row: 1 },
      { name: 'Precisión vital', col: 0, row: 2 },
      { name: 'Modo dios', col: 1, row: 2 },
    ],
  },
  // Alomancia de bendaleo · diagram L.180 / PDF 186
  'poder:alomancia:bendaleo': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Burbuja ampliada', col: 0, row: 0 },
      { name: 'Burbuja espontánea', col: 1, row: 0 },
      { name: 'Arreglo apresurado', col: 0, row: 1 },
      { name: 'Burbuja defensiva', col: 1, row: 1 },
      { name: 'Burbuja expeditiva', col: 1, row: 2 },
    ],
  },
  // Alomancia de bronce · diagram L.183 / PDF 189
  'poder:alomancia:bronce': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Buscador distante', col: 0, row: 0 },
      { name: 'Maestro de pulsos', col: 1, row: 0 },
      { name: 'Búsqueda constante', col: 0, row: 1 },
      { name: 'Buscador de reservas', col: 1, row: 1 },
      { name: 'Defensa detectada', col: 0, row: 2 },
      { name: 'Buscador del Cosmere', col: 1, row: 2 },
    ],
  },
  // Alomancia de cadmio · diagram L.187 / PDF 193
  'poder:alomancia:cadmio': {
    cols: 2,
    rows: 2,
    cells: [
      { name: 'Burbuja ampliada', col: 0, row: 0 },
      { name: 'Burbuja espontánea', col: 1, row: 0 },
      { name: 'Dilatación temporal', col: 0, row: 1 },
      { name: 'Burbuja expeditiva', col: 1, row: 1 },
    ],
  },
  // Alomancia de cinc · diagram L.189 / PDF 195
  'poder:alomancia:cinc': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Control de masas', col: 0, row: 0 },
      { name: 'Agresión abrumadora', col: 1, row: 0 },
      { name: 'Influencia precisa', col: 0, row: 1 },
      { name: 'Encender determinación', col: 1, row: 1 },
      { name: 'Manipulación sutil', col: 0, row: 2 },
      { name: 'Brío profundo', col: 1, row: 2 },
    ],
  },
  // Alomancia de cobre · diagram L.192 / PDF 198
  // [inferido] The two lanes stack their cards independently and the second-tier cards are printed at different heights (Ahumador eficiente
  // above Coordinación encubierta): stored as the two tiers of the tree, both on row 1, like the Stormlight grid of Rastreador, whose lanes are
  // also offset (src/data/talentGrids.ts). T38b kept it: the strictly printed order would need a 3rd row with an empty cell and no tier meaning
  'poder:alomancia:cobre': {
    cols: 2,
    rows: 2,
    cells: [
      { name: 'Cobertura espontánea', col: 0, row: 0 },
      { name: 'Nube de cobre ampliada', col: 1, row: 0 },
      { name: 'Coordinación encubierta', col: 0, row: 1 },
      { name: 'Ahumador eficiente', col: 1, row: 1 },
    ],
  },
  // Alomancia de cromo · diagram L.194 / PDF 200
  'poder:alomancia:cromo': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Agarre drenante', col: 0, row: 0 },
      { name: 'Drenaje reactivo', col: 1, row: 0 },
      { name: 'Drenaje simultáneo', col: 0, row: 1 },
      { name: 'Sanguijuela evasiva', col: 1, row: 1 },
      { name: 'Hiperdrenaje', col: 0, row: 2 },
      { name: 'Sifón de mentes de metal', col: 1, row: 2 },
    ],
  },
  // Alomancia de duraluminio · diagram L.196 / PDF 202
  'poder:alomancia:duraluminio': {
    cols: 2,
    rows: 1,
    cells: [
      { name: 'Estallido controlado', col: 0, row: 0 },
      { name: 'Estallido selectivo', col: 1, row: 0 },
    ],
  },
  // Alomancia de electro · diagram L.198 / PDF 204
  'poder:alomancia:electro': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Reacciones prescientes', col: 0, row: 0 },
      { name: 'Sombras persistentes', col: 1, row: 0 },
      { name: 'Electro profético', col: 0, row: 1 },
      { name: 'Oráculo proactivo', col: 1, row: 1 },
      { name: 'Objetivo resbaladizo', col: 0, row: 2 },
      { name: 'Ejercicio teórico', col: 1, row: 2 },
    ],
  },
  // Alomancia de estaño · diagram L.199 / PDF 205
  'poder:alomancia:estano': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Reenfoque con avivamiento', col: 0, row: 0 },
      { name: 'Preparación sensible', col: 1, row: 0 },
      { name: 'Precisión de estaño', col: 0, row: 1 },
      { name: 'Sensibilidad proactiva', col: 1, row: 1 },
      { name: 'Sentir la debilidad', col: 0, row: 2 },
      { name: 'Enhaciendo el no ver', col: 1, row: 2 },
    ],
  },
  // Alomancia de hierro · diagram L.202 / PDF 208
  'poder:alomancia:hierro': {
    cols: 2,
    rows: 4,
    cells: [
      { name: 'Prevenirse con palanca', col: 0, row: 0 },
      { name: 'Tirón de proyectil', col: 1, row: 0 },
      { name: 'Disparo con Tirón de hierro', col: 0, row: 1 },
      { name: 'Acometida con Tirón', col: 1, row: 1 },
      { name: 'Desarmar tirando', col: 0, row: 2 },
      { name: 'Equipo de atraedor', col: 1, row: 2 },
      { name: 'Experto en Tirones de hierro', col: 0, row: 3 },
    ],
  },
  // Alomancia de latón · diagram L.205 / PDF 211
  'poder:alomancia:laton': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Control de masas', col: 0, row: 0 },
      { name: 'Apatía aplastante', col: 1, row: 0 },
      { name: 'Influencia precisa', col: 0, row: 1 },
      { name: 'Aplacar la fatiga', col: 1, row: 1 },
      { name: 'Manipulación sutil', col: 0, row: 2 },
      { name: 'Calma profunda', col: 1, row: 2 },
    ],
  },
  // Alomancia de nicrosil · diagram L.207 / PDF 213
  'poder:alomancia:nicrosil': {
    cols: 2,
    rows: 2,
    cells: [
      { name: 'Nicroestallido proactivo', col: 0, row: 0 },
      { name: 'Estallido asistido', col: 1, row: 0 },
      { name: 'Agarre estallante', col: 0, row: 1 },
      { name: 'Estallido inesperado', col: 1, row: 1 },
    ],
  },
  // Alomancia de oro · diagram L.210 / PDF 216
  'poder:alomancia:oro': {
    cols: 2,
    rows: 1,
    cells: [
      { name: 'Aleación de uno mismo', col: 0, row: 0 },
      { name: 'Oportunidades doradas', col: 1, row: 0 },
    ],
  },
  // Alomancia de peltre · diagram L.212 / PDF 218
  'poder:alomancia:peltre': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Revitalizar', col: 0, row: 0 },
      { name: 'Armamento de brazo de peltre', col: 1, row: 0 },
      { name: 'Aguantar el arrastre', col: 0, row: 1 },
      { name: 'Pugilista ágil', col: 1, row: 1 },
      { name: 'Acometidas de arrastre', col: 0, row: 2 },
      { name: 'Lanzador de peltre', col: 1, row: 2 },
    ],
  },

  // ── Feruchemical powers (16 trees: the 17 metals minus feruquimia de nicrosil, which has no talent tree, L.246 / PDF 252). Same layout as the alomantic ones ──
  // Feruquimia de acero · diagram L.214 / PDF 220
  'poder:feruquimia:acero': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Esquiva acelerada', col: 0, row: 0 },
      { name: 'Repetir jugada', col: 1, row: 0 },
      { name: 'Reflejos acelerados', col: 0, row: 1 },
      { name: 'Estallido de velocidad', col: 1, row: 1 },
      { name: 'Carrera de acero auténtica', col: 0, row: 2 },
      { name: 'Velocista de acero', col: 1, row: 2 },
    ],
  },
  // Feruquimia de aluminio · diagram L.217 / PDF 223
  'poder:feruquimia:aluminio': {
    cols: 2,
    rows: 2,
    cells: [
      { name: 'Introspección experta', col: 0, row: 0 },
      { name: 'Motivación esencial', col: 1, row: 0 },
      { name: 'Quintaesencia inamovible', col: 0, row: 1 },
    ],
  },
  // Feruquimia de atium · diagram L.219 / PDF 225
  'poder:feruquimia:atium': {
    cols: 2,
    rows: 1,
    cells: [
      { name: 'Aparentar la edad', col: 0, row: 0 },
      { name: 'Plena forma', col: 1, row: 0 },
    ],
  },
  // Feruquimia de bendaleo · diagram L.221 / PDF 227
  'poder:feruquimia:bendaleo': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Impulso de energía', col: 0, row: 0 },
      { name: 'Nutrición proactiva', col: 1, row: 0 },
      { name: 'Dosis de prevención', col: 0, row: 1 },
      { name: 'Nutrición constante', col: 1, row: 1 },
      { name: 'Ruina de envenenadores', col: 0, row: 2 },
    ],
  },
  // Feruquimia de bronce · diagram L.223 / PDF 229
  'poder:feruquimia:bronce': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Despierto y alerta', col: 0, row: 0 },
      { name: 'Almacenamiento soñoliento', col: 1, row: 0 },
      { name: 'Centinela concentrado', col: 0, row: 1 },
      { name: 'Siesta reparadora', col: 1, row: 1 },
      { name: 'Sueño instantáneo', col: 1, row: 2 },
    ],
  },
  // Feruquimia de cadmio · diagram L.225 / PDF 231
  'poder:feruquimia:cadmio': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Oxigenación potenciada', col: 0, row: 0 },
      { name: 'Entrenamiento en privación', col: 1, row: 0 },
      { name: 'Resistencia feruquímica', col: 0, row: 1 },
      { name: 'Excelencia aeróbica', col: 1, row: 1 },
      { name: 'Estallido de recuperación', col: 1, row: 2 },
    ],
  },
  // Feruquimia de cinc · diagram L.227 / PDF 233
  'poder:feruquimia:cinc': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Ayuda chispeante', col: 0, row: 0 },
      { name: 'Doble pensamiento', col: 1, row: 0 },
      { name: 'Reflejos acelerados', col: 0, row: 1 },
      { name: 'Rapidez mental', col: 1, row: 1 },
      { name: 'Chispa auténtica', col: 0, row: 2 },
      { name: 'Momento eureka', col: 1, row: 2 },
    ],
  },
  // Feruquimia de cobre · diagram L.230 / PDF 236
  'poder:feruquimia:cobre': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Archivero de pericias', col: 0, row: 0 },
      { name: 'Mentecobre indexada', col: 1, row: 0 },
      { name: 'Pupilo aplicado', col: 0, row: 1 },
      { name: 'Maestro mnemotécnico', col: 1, row: 1 },
      { name: 'Memoria muscular', col: 0, row: 2 },
      { name: 'Guardián del conocimiento', col: 1, row: 2 },
    ],
  },
  // Feruquimia de cromo · diagram L.232 / PDF 238
  'poder:feruquimia:cromo': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Todavía no', col: 0, row: 0 },
      { name: 'Susurros del destino', col: 1, row: 0 },
      { name: 'Compartir el destino', col: 0, row: 1 },
      { name: 'Momento oportuno', col: 1, row: 1 },
      { name: 'Nexo de Fortuna', col: 0, row: 2 },
      { name: 'Lugar adecuado', col: 1, row: 2 },
    ],
  },
  // Feruquimia de duraluminio · diagram L.235 / PDF 241
  'poder:feruquimia:duraluminio': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Conexión individual', col: 0, row: 0 },
      { name: 'Fuerza de personalidad', col: 1, row: 0 },
      { name: 'Vínculo instantáneo', col: 0, row: 1 },
      { name: 'Vínculo auténtico', col: 1, row: 1 },
      { name: 'De enemigo a amigo', col: 0, row: 2 },
    ],
  },
  // Feruquimia de electro · diagram L.237 / PDF 243
  'poder:feruquimia:electro': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Voluntad curtida', col: 0, row: 0 },
      { name: 'Dejarse llevar', col: 1, row: 0 },
      { name: 'Intensidad de propósito', col: 0, row: 1 },
      { name: 'Afabilidad infinita', col: 1, row: 1 },
      { name: 'Esencia indomable', col: 0, row: 2 },
      { name: 'Resolución inquebrantable', col: 1, row: 2 },
    ],
  },
  // Feruquimia de estaño · diagram L.239 / PDF 245
  'poder:feruquimia:estano': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Precisión de estaño', col: 0, row: 0 },
      { name: 'Control sensorial', col: 1, row: 0 },
      { name: 'Almacenar dolor', col: 0, row: 1 },
      { name: 'Susurros del viento espontáneos', col: 1, row: 1 },
      { name: 'Susurros del viento auténticos', col: 0, row: 2 },
      { name: 'Almacenamiento multisensorial', col: 1, row: 2 },
    ],
  },
  // Feruquimia de hierro · diagram L.242 / PDF 248
  'poder:feruquimia:hierro': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Golpe vigoroso', col: 0, row: 0 },
      { name: 'Evasión liviana', col: 1, row: 0 },
      { name: 'Objeto inamovible', col: 0, row: 1 },
      { name: 'Pies ligeros', col: 1, row: 1 },
      { name: 'Masa crítica', col: 0, row: 2 },
      { name: 'Maestro ajustador', col: 1, row: 2 },
    ],
  },
  // Feruquimia de latón · diagram L.245 / PDF 251
  'poder:feruquimia:laton': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Palma abrasadora', col: 0, row: 0 },
      { name: 'Conducción térmica', col: 1, row: 0 },
      { name: 'Contacto reconfortante', col: 0, row: 1 },
      { name: 'Frío entumecedor', col: 1, row: 1 },
      { name: 'Maestro alma de fuego', col: 0, row: 2 },
      { name: 'Horno viviente', col: 1, row: 2 },
    ],
  },
  // Feruquimia de oro · diagram L.248 / PDF 254
  'poder:feruquimia:oro': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Especialista en lesiones', col: 0, row: 0 },
      { name: 'Sanación espontánea', col: 1, row: 0 },
      { name: 'Sanación acelerada', col: 0, row: 1 },
      { name: 'Huir de la muerte', col: 1, row: 1 },
      { name: 'Regeneración instantánea', col: 0, row: 2 },
      { name: 'Sanación subconsciente', col: 1, row: 2 },
    ],
  },
  // Feruquimia de peltre · diagram L.249 / PDF 255
  'poder:feruquimia:peltre': {
    cols: 2,
    rows: 3,
    cells: [
      { name: 'Muro de músculos', col: 0, row: 0 },
      { name: 'Armamento de brazo de peltre', col: 1, row: 0 },
      { name: 'Barricada de peltre', col: 0, row: 1 },
      { name: 'Lanzador de peltre', col: 1, row: 1 },
      { name: 'Culturista', col: 0, row: 2 },
      { name: 'Por los aires', col: 1, row: 2 },
    ],
  },
}
