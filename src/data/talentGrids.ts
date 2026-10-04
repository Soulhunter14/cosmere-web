/**
 * Book-diagram grid positions for every talent tree in the game.
 *
 * Each entry reproduces the exact layout of the corresponding tree diagram printed in the
 * Manual de juego (Capítulos 4-6): which lane (col) and row a talent's card occupies. The
 * app uses this to lay out the talent map the same way the book does, instead of an
 * auto-generated org-chart.
 *
 * treeId convention (see TALENT_GRIDS keys below):
 *   - 'heroico:<caminoId>:<especialidad>' — one per heroic-path specialty (18 total: 6 caminos
 *     heroicos x 3 especialidades), e.g. 'heroico:cazador:Arquero'. caminoId matches
 *     HeroicPath.id in heroicPaths.ts (lowercase, no accents). especialidad matches the
 *     specialty's exact 'name' in heroicPaths.ts. Grid: 2 lanes x 4 rows (the camino's own
 *     talento principal is not part of this grid — it lives at the camino level).
 *   - 'potencia:<Nombre>' — one per surge (10 total), e.g. 'potencia:Adhesión'. Nombre matches
 *     Potencia.name in potencias.ts exactly. Grid: 2 lanes x 4 rows.
 *   - 'radiante:<ordenId>' — one per playable Radiant order's own vínculo-spren tree (9 total;
 *     Bondsmiths/'bondsmiths' excluded, jugable: false), e.g. 'radiante:windrunners'. ordenId
 *     matches RadiantOrder.id in radiantOrders.ts. Grid: 'Primer Ideal' alone at row 0, then
 *     2 lanes x 4 rows below it (rows 1-4). Vigilantes de la Verdad ('truthwatchers') adds a
 *     10th talent, 'Visión del futuro' (the Iluminado sub-tree's own principal talent), which
 *     has no book diagram of its own — placed in an extra row (row 5) rather than invented.
 *   - 'cantor' — the singer talent tree (single tree, no variants): 'Cambiar de forma' above a
 *     3-lane x 3-row grid (3 basic Formas branches, 'Mente ambiciosa' centered, 3 Formas de
 *     poder branches).
 *
 * Source: rendered pages of cosmere-api/Resources/CaminaPiedras/ART0001_MdAdlT_ESP_high.pdf
 * (Manual de juego) — heroic specialties pp. 76-121 (PDF 80-121, transcribed in
 * scratchpad/analysis/bookgrid.mjs), Radiant vínculo trees pp. 136-204 (PDF 140-208), surges
 * pp. 216-238 (PDF 217-242), singer tree p. 32 (PDF 36). PDF page = book page + 4 throughout
 * this manual.
 */

import type { TalentGrid } from '../lib/talentTypes'

/** `TalentGrid` and `TalentGridCell` live in src/lib/talentTypes.ts since T34a (Cosmere core); re-exported so that no import of them changes */
export type { TalentGrid, TalentGridCell } from '../lib/talentTypes'

export const TALENT_GRIDS: Record<string, TalentGrid> = {
// Heroic specialties (2 lanes x 4 rows, per the book's diagram).
  "heroico:agente:Investigador": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Ojo avizor", col: 0, row: 0 },
      { name: "Haz que hablen", col: 1, row: 0 },
      { name: "Análisis rápido", col: 0, row: 1 },
      { name: "Torvo", col: 1, row: 1 },
      { name: "Recopilar pruebas", col: 0, row: 2 },
      { name: "Robusto", col: 1, row: 2 },
      { name: "Instintos de sabueso", col: 0, row: 3 },
      { name: "Cerrar el caso", col: 1, row: 3 },
    ],
  },
  "heroico:agente:Espía": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Desenlace seguro", col: 0, row: 0 },
      { name: "Excusa plausible", col: 1, row: 0 },
      { name: "Serenidad", col: 0, row: 1 },
      { name: "Tapadera", col: 1, row: 1 },
      { name: "Derribo sutil", col: 0, row: 2 },
      { name: "Poderoso", col: 1, row: 2 },
      { name: "Fachada volátil", col: 0, row: 3 },
      { name: "Contactos en la alta sociedad", col: 1, row: 3 },
    ],
  },
  "heroico:agente:Ladrón": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Comportamiento arriesgado", col: 0, row: 0 },
      { name: "Golpe bajo", col: 1, row: 0 },
      { name: "Obstinarse", col: 0, row: 1 },
      { name: "Paso firme", col: 1, row: 1 },
      { name: "Contactos en los bajos fondos", col: 0, row: 2 },
      { name: "Paso sombrío", col: 1, row: 2 },
      { name: "Charlatanería", col: 0, row: 3 },
      { name: "Mano embaucadora", col: 1, row: 3 },
    ],
  },

  "heroico:cazador:Arquero": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Disparo de seguimiento", col: 0, row: 0 },
      { name: "Entrenamiento de combate", col: 1, row: 0 },
      { name: "Ojo agudo", col: 0, row: 1 },
      { name: "Puntería firme", col: 1, row: 1 },
      { name: "Explotar debilidad", col: 0, row: 2 },
      { name: "Paso atrás", col: 1, row: 2 },
      { name: "Salva implacable", col: 0, row: 3 },
      { name: "Robusto", col: 1, row: 3 },
    ],
  },
  "heroico:cazador:Asesino": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Golpe sorprendente", col: 0, row: 0 },
      { name: "Filo asesino", col: 1, row: 0 },
      { name: "Estocada fatal", col: 0, row: 1 },
      { name: "Seguimiento", col: 1, row: 1 },
      { name: "Poderoso", col: 0, row: 2 },
      { name: "Mirada fría", col: 1, row: 2 },
      { name: "Acometidas rápidas", col: 0, row: 3 },
      { name: "Eludir", col: 1, row: 3 },
    ],
  },
  "heroico:cazador:Rastreador": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Trampa mortal", col: 0, row: 0 },
      { name: "Vínculo animal", col: 1, row: 0 },
      { name: "Trampero experimentado", col: 0, row: 1 },
      { name: "Vínculo protector", col: 1, row: 1 },
      { name: "Paso firme", col: 0, row: 2 },
      { name: "Conexión salvaje", col: 1, row: 2 },
      { name: "Ventaja del cazador", col: 0, row: 3 },
      { name: "Caza en manada", col: 1, row: 3 },
    ],
  },

  "heroico:enviado:Diplomático": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Desafío inalterable", col: 0, row: 0 },
      { name: "Serenidad", col: 1, row: 0 },
      { name: "Réplica fulminante", col: 0, row: 1 },
      { name: "Elegante", col: 1, row: 1 },
      { name: "Llamamiento a la calma", col: 0, row: 2 },
      { name: "Contactos en la alta sociedad", col: 1, row: 2 },
      { name: "Solución sosegada", col: 0, row: 3 },
      { name: "Oratoria ensayada", col: 1, row: 3 },
    ],
  },
  "heroico:enviado:Fiel": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Vestimenta tradicional", col: 0, row: 0 },
      { name: "Galvanizar", col: 1, row: 0 },
      { name: "Presencia devota", col: 0, row: 1 },
      { name: "Compostura", col: 1, row: 1 },
      { name: "Presencia incondicional", col: 0, row: 2 },
      { name: "Motivación aplicada", col: 1, row: 2 },
      { name: "Consejo sabio", col: 0, row: 3 },
      { name: "Fervor inspirado", col: 1, row: 3 },
    ],
  },
  "heroico:enviado:Mentor": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Buen consejo", col: 0, row: 0 },
      { name: "Demostración práctica", col: 1, row: 0 },
      { name: "Lecciones de paciencia", col: 0, row: 1 },
      { name: "Poderoso", col: 1, row: 1 },
      { name: "Infundir confianza", col: 0, row: 2 },
      { name: "Alocución orientadora", col: 1, row: 2 },
      { name: "Presciencia", col: 0, row: 3 },
      { name: "Grito de guerra", col: 1, row: 3 },
    ],
  },

  "heroico:erudito:Artifabriano": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Ingeniería eficiente", col: 0, row: 0 },
      { name: "Adquisición preciada", col: 1, row: 0 },
      { name: "Estudio profundo", col: 0, row: 1 },
      { name: "Diseño inventivo", col: 1, row: 1 },
      { name: "Destreza refinada", col: 0, row: 2 },
      { name: "Sobrecargar", col: 1, row: 2 },
      { name: "Trasteo experimental", col: 0, row: 3 },
      { name: "Abrumar con detalles", col: 1, row: 3 },
    ],
  },
  "heroico:erudito:Estratega": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Planificar", col: 0, row: 0 },
      { name: "Cuerpo y mente", col: 1, row: 0 },
      { name: "Compostura", col: 0, row: 1 },
      { name: "Conoce tu momento", col: 1, row: 1 },
      { name: "Contemplación profunda", col: 0, row: 2 },
      { name: "Conocimientos aplicados", col: 1, row: 2 },
      { name: "Contingencia", col: 0, row: 3 },
      { name: "Punto de inflexión", col: 1, row: 3 },
    ],
  },
  "heroico:erudito:Cirujano": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Medicina de campo", col: 0, row: 0 },
      { name: "Inteligencia emocional", col: 1, row: 0 },
      { name: "Conocimientos de anatomía", col: 0, row: 1 },
      { name: "Serenidad", col: 1, row: 1 },
      { name: "Sanación ágil", col: 0, row: 2 },
      { name: "Medicina aplicada", col: 1, row: 2 },
      { name: "Cuidados continuos", col: 0, row: 3 },
      { name: "Resucitación", col: 1, row: 3 },
    ],
  },

  "heroico:guerrero:Duelista": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Kata entrenada", col: 0, row: 0 },
      { name: "Posición de fuego", col: 1, row: 0 },
      { name: "Posición de hierro", col: 0, row: 1 },
      { name: "Arma distintiva", col: 1, row: 1 },
      { name: "Paso firme", col: 0, row: 2 },
      { name: "Acometida con finta", col: 1, row: 2 },
      { name: "Posición de la enredadera", col: 0, row: 3 },
      { name: "A la desesperada", col: 1, row: 3 },
    ],
  },
  "heroico:guerrero:Portador de esquirlada": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Entrenamiento de esquirlada", col: 0, row: 0 },
      { name: "Posición de la piedra", col: 1, row: 0 },
      { name: "Posición de viento", col: 0, row: 1 },
      { name: "Poderoso", col: 1, row: 1 },
      { name: "Golpe demoledor", col: 0, row: 2 },
      { name: "Posición de la sangre", col: 1, row: 2 },
      { name: "Parada precisa", col: 0, row: 3 },
      { name: "Salto meteórico", col: 1, row: 3 },
    ],
  },
  "heroico:guerrero:Soldado": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Avance cauteloso", col: 0, row: 0 },
      { name: "Entrenamiento de combate", col: 1, row: 0 },
      { name: "Posición defensiva", col: 0, row: 1 },
      { name: "Golpe devastador", col: 1, row: 1 },
      { name: "Ejercicios de formación", col: 0, row: 2 },
      { name: "Robusto", col: 1, row: 2 },
      { name: "Precaución", col: 0, row: 3 },
      { name: "Acometidas veloces", col: 1, row: 3 },
    ],
  },

  "heroico:lider:Campeón": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Coordinación en combate", col: 0, row: 0 },
      { name: "Intervención valiente", col: 1, row: 0 },
      { name: "Posición formidable", col: 0, row: 1 },
      { name: "Robusto", col: 1, row: 1 },
      { name: "Poderoso", col: 0, row: 2 },
      { name: "Postura resuelta", col: 1, row: 2 },
      { name: "Resiliencia heroica", col: 0, row: 3 },
      { name: "Mando demostrativo", col: 1, row: 3 },
    ],
  },
  "heroico:lider:Oficial": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Compostura", col: 0, row: 0 },
      { name: "A través de la refriega", col: 1, row: 0 },
      { name: "Abastecimiento adecuado", col: 0, row: 1 },
      { name: "Vestimenta tradicional", col: 1, row: 1 },
      { name: "Marcha implacable", col: 0, row: 2 },
      { name: "Mando confiado", col: 1, row: 2 },
      { name: "Asalto sincronizado", col: 0, row: 3 },
      { name: "Autoridad", col: 1, row: 3 },
    ],
  },
  "heroico:lider:Político": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Tácticas despiadadas", col: 0, row: 0 },
      { name: "Ardid táctico", col: 1, row: 0 },
      { name: "Difundir rumores", col: 0, row: 1 },
      { name: "Elegante", col: 1, row: 1 },
      { name: "Torvo", col: 0, row: 2 },
      { name: "Poner en desacuerdo", col: 1, row: 2 },
      { name: "Mando astuto", col: 0, row: 3 },
      { name: "Gran engaño", col: 1, row: 3 },
    ],
  },

  // Potencias (surges): 2 lanes x 4 rows, per the book's diagram.
  "potencia:Abrasión": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Movimiento sin fricción", col: 0, row: 0 },
      { name: "Abrasión inversa", col: 1, row: 0 },
      { name: "Patinaje grácil", col: 0, row: 1 },
      { name: "Reclamación de luz tormentosa", col: 1, row: 1 },
      { name: "Objetivo resbaladizo", col: 0, row: 2 },
      { name: "Potenciación distante", col: 1, row: 2 },
      { name: "Combatiente escurridizo", col: 0, row: 3 },
      { name: "Patinaje fluido", col: 1, row: 3 },
    ],
  },
  "potencia:Adhesión": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Reclamación de luz tormentosa", col: 0, row: 0 },
      { name: "Acometida vinculante", col: 1, row: 0 },
      { name: "Potenciación distante", col: 0, row: 1 },
      { name: "Disparo vinculante", col: 1, row: 1 },
      { name: "Adhesión extendida", col: 0, row: 2 },
      { name: "Trampa adhesiva", col: 1, row: 2 },
      { name: "Adhesión viviente", col: 0, row: 3 },
      { name: "Vínculo superior", col: 1, row: 3 },
    ],
  },
  "potencia:Cohesión": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Lanza de piedra", col: 0, row: 0 },
      { name: "Recuerdos de piedra", col: 1, row: 0 },
      { name: "Socavón", col: 0, row: 1 },
      { name: "Excavar túnel", col: 1, row: 1 },
      { name: "A través de la piedra", col: 0, row: 2 },
      { name: "Escultura de piedra verdadera", col: 1, row: 2 },
      { name: "Cohesión suelta", col: 0, row: 3 },
      { name: "Tierra fluida", col: 1, row: 3 },
    ],
  },
  "potencia:División": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Deterioro corporal", col: 0, row: 0 },
      { name: "Fuga erosionada", col: 1, row: 0 },
      { name: "División inflamable", col: 0, row: 1 },
      { name: "Mandar chispas", col: 1, row: 1 },
      { name: "Ráfaga de llamas", col: 0, row: 2 },
      { name: "Chispa ineludible", col: 1, row: 2 },
      { name: "División devastadora", col: 0, row: 3 },
      { name: "Entropía desatada", col: 1, row: 3 },
    ],
  },
  "potencia:Gravitación": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "As del vuelo", col: 0, row: 0 },
      { name: "Impacto gravitacional", col: 1, row: 0 },
      { name: "Vuelo estable", col: 0, row: 1 },
      { name: "Enlaces múltiples", col: 1, row: 1 },
      { name: "Vuelo en grupo", col: 0, row: 2 },
      { name: "Disparo con Enlace", col: 1, row: 2 },
      { name: "Escuadrón aéreo", col: 0, row: 3 },
      { name: "Maestro de los cielos", col: 1, row: 3 },
    ],
  },
  "potencia:Iluminación": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Ilusión distractiva", col: 0, row: 0 },
      { name: "Tejidos de luz persistentes", col: 1, row: 0 },
      { name: "Destello desorientador", col: 0, row: 1 },
      { name: "Reclamación de luz tormentosa", col: 1, row: 1 },
      { name: "Iluminación espiritual", col: 0, row: 2 },
      { name: "Tejido de luz multiplicador", col: 1, row: 2 },
      { name: "Verdad dolorosa", col: 0, row: 3 },
      { name: "Ilusiones infinitas", col: 1, row: 3 },
    ],
  },
  "potencia:Progresión": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Regeneración de lesión", col: 0, row: 0 },
      { name: "Crecimiento explosivo", col: 1, row: 0 },
      { name: "Revitalización rápida", col: 0, row: 1 },
      { name: "Crecimiento desmesurado", col: 1, row: 1 },
      { name: "Regeneración extendida", col: 0, row: 2 },
      { name: "Progresión fiable", col: 1, row: 2 },
      { name: "Desde el abismo", col: 0, row: 3 },
      { name: "Fuente de vida", col: 1, row: 3 },
    ],
  },
  "potencia:Tensión": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Parada de tensión", col: 0, row: 0 },
      { name: "Reclamación de luz tormentosa", col: 1, row: 0 },
      { name: "Armamento trucado", col: 0, row: 1 },
      { name: "Tensión extendida", col: 1, row: 1 },
      { name: "Maestría de tejidos", col: 0, row: 2 },
      { name: "Tensión superficial", col: 1, row: 2 },
      { name: "Control delicado", col: 0, row: 3 },
      { name: "Urdidor", col: 1, row: 3 },
    ],
  },
  "potencia:Transformación": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Defensa moldeadora de almas", col: 0, row: 0 },
      { name: "Moldeado de almas viviente", col: 1, row: 0 },
      { name: "Parada moldeadora de almas", col: 0, row: 1 },
      { name: "Moldeado de sangre", col: 1, row: 1 },
      { name: "Potenciación distante", col: 0, row: 2 },
      { name: "Moldeado de llamas", col: 1, row: 2 },
      { name: "Transformación persistente", col: 0, row: 3 },
      { name: "Transmutación expansiva", col: 1, row: 3 },
    ],
  },
  "potencia:Transportación": {
    cols: 2,
    rows: 4,
    cells: [
      { name: "Previsión cognitiva", col: 0, row: 0 },
      { name: "Evasión entre reinos", col: 1, row: 0 },
      { name: "Visión cognitiva", col: 0, row: 1 },
      { name: "Paso entre reinos", col: 1, row: 1 },
      { name: "Transportación compartida", col: 0, row: 2 },
      { name: "Nominar lo otro", col: 1, row: 2 },
      { name: "Puerta de lo otro", col: 0, row: 3 },
      { name: "Caminarreinos", col: 1, row: 3 },
    ],
  },

  // Radiant orders' own vínculo-spren tree: Primer Ideal alone at the top (row 0),
  // then 2 lanes x 4 rows underneath (rows 1-4). Bondsmiths (bondsmiths) excluded: not jugable.
  "radiante:windrunners": {
    cols: 2,
    rows: 5,
    cells: [
      { name: "Primer Ideal", col: 0, row: 0 },
      { name: "Segundo Ideal", col: 0, row: 1 },
      { name: "Enlace inverso", col: 1, row: 1 },
      { name: "Tercer Ideal", col: 0, row: 2 },
      { name: "Investido", col: 1, row: 2 },
      { name: "Cuarto Ideal", col: 0, row: 3 },
      { name: "Regeneración de heridas", col: 1, row: 3 },
      { name: "Vínculo estrechado", col: 0, row: 4 },
      { name: "Adoptar escudero", col: 1, row: 4 },
    ],
  },
  "radiante:skybreakers": {
    cols: 2,
    rows: 5,
    cells: [
      { name: "Primer Ideal", col: 0, row: 0 },
      { name: "Segundo Ideal", col: 0, row: 1 },
      { name: "Destrucción desorbitada", col: 1, row: 1 },
      { name: "Tercer Ideal", col: 0, row: 2 },
      { name: "Investido", col: 1, row: 2 },
      { name: "Cuarto Ideal", col: 0, row: 3 },
      { name: "Regeneración de heridas", col: 1, row: 3 },
      { name: "Vínculo estrechado", col: 0, row: 4 },
      { name: "Adoptar escudero", col: 1, row: 4 },
    ],
  },
  "radiante:dustbringers": {
    cols: 2,
    rows: 5,
    cells: [
      { name: "Primer Ideal", col: 0, row: 0 },
      { name: "Segundo Ideal", col: 0, row: 1 },
      { name: "Tormenta de polvo abrasadora", col: 1, row: 1 },
      { name: "Tercer Ideal", col: 0, row: 2 },
      { name: "Investido", col: 1, row: 2 },
      { name: "Cuarto Ideal", col: 0, row: 3 },
      { name: "Regeneración de heridas", col: 1, row: 3 },
      { name: "Vínculo estrechado", col: 0, row: 4 },
      { name: "Adoptar escudero", col: 1, row: 4 },
    ],
  },
  "radiante:edgedancers": {
    cols: 2,
    rows: 5,
    cells: [
      { name: "Primer Ideal", col: 0, row: 0 },
      { name: "Segundo Ideal", col: 0, row: 1 },
      { name: "Gracia del Danzante del Filo", col: 1, row: 1 },
      { name: "Tercer Ideal", col: 0, row: 2 },
      { name: "Investido", col: 1, row: 2 },
      { name: "Cuarto Ideal", col: 0, row: 3 },
      { name: "Regeneración de heridas", col: 1, row: 3 },
      { name: "Vínculo estrechado", col: 0, row: 4 },
      { name: "Adoptar escudero", col: 1, row: 4 },
    ],
  },
  "radiante:truthwatchers": {
    cols: 2,
    rows: 6,
    cells: [
      { name: "Primer Ideal", col: 0, row: 0 },
      { name: "Segundo Ideal", col: 0, row: 1 },
      { name: "Sanación espiritual", col: 1, row: 1 },
      { name: "Tercer Ideal", col: 0, row: 2 },
      { name: "Investido", col: 1, row: 2 },
      { name: "Cuarto Ideal", col: 0, row: 3 },
      { name: "Regeneración de heridas", col: 1, row: 3 },
      { name: "Vínculo estrechado", col: 0, row: 4 },
      { name: "Adoptar escudero", col: 1, row: 4 },
      { name: "Visión del futuro", col: 0, row: 5 },
    ],
  },
  "radiante:lightweavers": {
    cols: 2,
    rows: 5,
    cells: [
      { name: "Primer Ideal", col: 0, row: 0 },
      { name: "Segundo Ideal", col: 0, row: 1 },
      { name: "Ilusión física", col: 1, row: 1 },
      { name: "Tercer Ideal", col: 0, row: 2 },
      { name: "Investido", col: 1, row: 2 },
      { name: "Cuarto Ideal", col: 0, row: 3 },
      { name: "Regeneración de heridas", col: 1, row: 3 },
      { name: "Vínculo estrechado", col: 0, row: 4 },
      { name: "Adoptar escudero", col: 1, row: 4 },
    ],
  },
  "radiante:elsecallers": {
    cols: 2,
    rows: 5,
    cells: [
      { name: "Primer Ideal", col: 0, row: 0 },
      { name: "Segundo Ideal", col: 0, row: 1 },
      { name: "Sagacidad del Nominador de lo Otro", col: 1, row: 1 },
      { name: "Tercer Ideal", col: 0, row: 2 },
      { name: "Investido", col: 1, row: 2 },
      { name: "Cuarto Ideal", col: 0, row: 3 },
      { name: "Regeneración de heridas", col: 1, row: 3 },
      { name: "Vínculo estrechado", col: 0, row: 4 },
      { name: "Adoptar escudero", col: 1, row: 4 },
    ],
  },
  "radiante:willshapers": {
    cols: 2,
    rows: 5,
    cells: [
      { name: "Primer Ideal", col: 0, row: 0 },
      { name: "Segundo Ideal", col: 0, row: 1 },
      { name: "Cohesión espiritual", col: 1, row: 1 },
      { name: "Tercer Ideal", col: 0, row: 2 },
      { name: "Investido", col: 1, row: 2 },
      { name: "Cuarto Ideal", col: 0, row: 3 },
      { name: "Regeneración de heridas", col: 1, row: 3 },
      { name: "Vínculo estrechado", col: 0, row: 4 },
      { name: "Adoptar escudero", col: 1, row: 4 },
    ],
  },
  "radiante:stonewards": {
    cols: 2,
    rows: 5,
    cells: [
      { name: "Primer Ideal", col: 0, row: 0 },
      { name: "Segundo Ideal", col: 0, row: 1 },
      { name: "Trabajo en equipo cohesivo", col: 1, row: 1 },
      { name: "Tercer Ideal", col: 0, row: 2 },
      { name: "Investido", col: 1, row: 2 },
      { name: "Cuarto Ideal", col: 0, row: 3 },
      { name: "Regeneración de heridas", col: 1, row: 3 },
      { name: "Vínculo estrechado", col: 0, row: 4 },
      { name: "Adoptar escudero", col: 1, row: 4 },
    ],
  },

  // Singer (cantor) tree: Cambiar de forma above a 3x3 grid.
  "cantor": {
    cols: 3,
    rows: 4,
    cells: [
      { name: "Cambiar de forma", col: 1, row: 0 },
      { name: "Formas de delicadeza", col: 0, row: 1 },
      { name: "Formas de sabiduría", col: 1, row: 1 },
      { name: "Formas de determinación", col: 2, row: 1 },
      { name: "Mente ambiciosa", col: 1, row: 2 },
      { name: "Formas de destrucción", col: 0, row: 3 },
      { name: "Formas de expansión", col: 1, row: 3 },
      { name: "Formas de misterio", col: 2, row: 3 },
    ],
  },
}
