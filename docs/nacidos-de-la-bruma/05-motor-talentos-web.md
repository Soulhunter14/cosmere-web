# Lectura del motor de talentos del frontend (cosmere-web)

Alcance: contrato de datos del motor de talentos y de su mapa, y qué forma tendrían que tener los «caminos de nacidos del metal» y los «poderes de metal» de Nacidos de la Bruma para enchufarse. Solo lectura; no se ha ejecutado nada (lo marcado [inferido] sale de leer el código, no de probarlo).

Rutas base: `W` = `cosmere-web/src`. Cita `archivo:línea` relativa a `W` salvo que se diga otra cosa. Manual: «L.<libro> / PDF <pdf>» (PDF = libro + 6 en Nacidos de la Bruma).

## 0. Resumen ejecutivo

1. El motor (`W/lib/talentGraph.ts`, 1214 líneas) es TS puro, sin React. Se alimenta **solo** de datos estáticos de `W/data/*.ts` (importados de forma estática en `talentGraph.ts:42-45`) y de un `Character` (talentos JSON, nivel, habilidades, ascendencia, `idealesJurados`). No hay ningún parámetro de «set de reglas».
2. El contrato es **por nombre de talento**: la identidad de un talento es su `name`; los prerrequisitos son **texto en español** que `parsePrereq` (L.278) convierte en cláusulas tipadas. Si un prerrequisito no encaja con los patrones conocidos, la cláusula queda como `unknown` y **el talento no se puede aprender nunca** (`gateFor` L.733-734 la deja `unmet`).
3. Stormlight está cableado en: nombres de Ideales (L.55), de potencias (L.60), de formas iniciales (L.53), `isCantorAncestry` (L.121), el regex de Ideales (L.223), los bloques de orden radiante y de cantor en `buildTalentGraph` (L.472-510), la tabla de huecos `talentSlotsAt` (L.1125), `slotKindOf` (L.1148), el prerrequisito implícito «nivel 2» del Primer Ideal (L.428-429) y la lógica «Ideal aprendido vs jurado» (L.688-709, L.981-992).
4. Los poderes de metal **encajan casi tal cual** en el molde `Potencia`/`Talento` (un árbol por poder, prerrequisitos por texto, grados de habilidad personalizada). Lo que **no** encaja y exige cambios: el estado naciente/completo del poder (cláusula nueva), prerrequisitos de atributo («Voluntad 4 o más»), alternativa entre habilidades («Armamento pesado 2 o más o Armamento ligero 2 o más»), exclusividad entre caminos, ascendencia humana/sangre koloss, la relación «mismo metal / metales distintos» entre poderes, los nombres de habilidad «Armamento ligero/pesado», y un tipo de hueco de talento nuevo.
5. El mapa (`W/components/talentos/talentMap.ts`) dibuja **láminas de 2 carriles** (3 en el cantor) colocadas por `TALENT_GRIDS`. Una lámina por poder de metal es viable (mismo formato que `potencia:*`). Lo que **no** es viable sin cambios es mostrar muchas láminas a la vez: `PathAtlas` pinta todas las láminas de un camino en **una sola fila flex sin wrap** dimensionada para 3 (`mapDims` L.225-251, `PathAtlas.tsx:224`). Un nacido de la bruma (Era 1) llegaría a unas 12 láminas.
6. Persistencia hoy: la selección vive en `Character.talentos` (string JSON de nombres) + el marcador `~forma~<nombre>`; los Ideales jurados en `Character.idealesJurados` (int 0-5, 0 = «sin marcar»); los rangos de potencia en los huecos de habilidad personalizada 1-6. Para el estado naciente/completo y las cargas se recomienda un campo/entidad nueva en la API, no más marcadores en `talentos`.

---

## 1. Tipos exactos (copiados del código)

### 1.1 `ActivationType` (`W/components/TalentActivation.tsx:10`)
```ts
export type ActivationType = 'action1' | 'action2' | 'action3' | 'free' | 'reaction' | 'special' | 'passive'
```
La tabla de iconos/etiquetas está duplicada en `TalentActivation.tsx:12-20` y `talentStyle.ts:31-39` (`ACTIVATION`). El libro de Nacidos de la Bruma usa los mismos símbolos (leyenda en L.136 / PDF 143: 1, 2, 3 acciones, gratuita, reacción, activación especial, siempre activo).

### 1.2 `Talento` y `Potencia` (`W/data/potencias.ts:3-27`)
```ts
export interface Talento {
  name: string
  cost: ActivationType
  prereq?: string
  description: string
  /** Nota sobre una errata del libro (...) sin cambiar `prereq`. */
  notaLibro?: string
}

export interface Potencia {
  id: string
  name: string
  atributo: string
  ordenes: string[]
  costoBase: ActivationType
  descripcion: string
  talentos: Talento[]
}

export interface PotenciaRegla {
  id: string
  title: string
  summary: string
  details: { label: string; text: string }[]
}
```
`POTENCIAS: Potencia[]` (L.90) tiene 10 entradas (`id` sin acento: `'abrasion'`, `'adhesion'`...). `POTENCIAS_REGLAS` (L.31) son 5 bloques de reglas de texto que el motor no usa.

### 1.3 Camino heroico (`W/data/heroicPaths.ts:3-36`)
```ts
export interface HeroicPathTalento {
  name: string
  prerequisites: string
  activation: ActivationType
  rolDescription: string
  description: string
  notaLibro?: string
}
export interface HeroicPathSpecialty {
  name: string
  description: string
  talentos: HeroicPathTalento[]
}
export interface HeroicPath {
  id: string                       // 'agente' | 'cazador' | 'enviado' | 'erudito' | 'guerrero' | 'lider'
  name: string
  definition: string
  initialSkill: string
  mainTalent: string
  mainTalentPrerequisites: string
  mainTalentActivation: ActivationType
  mainTalentRolDescription: string
  mainTalentEffect: string
  recommendedAttributes: string[]
  recommendedSkills: string[]
  specialties: HeroicPathSpecialty[]   // 3 por camino
  color: string
  colorBg: string
  colorBorder: string
  icon: string
}
```
Notas verificadas: el camino heroico usa `prerequisites`/`activation`; las potencias y órdenes usan `prereq`/`cost`. `buildTalentGraph` normaliza ambas formas a `RawTalent` (L.381-388, L.455-468, L.482-483, L.493-494). Los 6 `mainTalent` (`heroicPaths.ts:47,257,466,675,884,1095`) coinciden con los de Nacidos de la Bruma (L.19 / PDF 25). Las especialidades **no** coinciden del todo (ver §6).

### 1.4 Orden radiante (`W/data/radiantOrders.ts:3-29`, `31-32`)
```ts
export interface RadiantOrder {
  id: string                    // 'windrunners', 'skybreakers', ... 'bondsmiths' (ids en inglés)
  name: string
  surges: [string, string]      // nombres de potencias (Potencia.name)
  ideal: string
  definition: string
  sprenName: string
  sprenForm: string
  sprenAppearance: string
  sprenBehavior: string
  sprenPhilosophy: string
  personality: string
  ideals: string
  color: string
  colorBg: string
  colorBorder: string
  talentos: Talento[]           // el árbol del vínculo: Primer..Cuarto Ideal + 5 talentos
  /** false = no jugable por personajes (p. ej. Forjadores de Vínculos). Por defecto true. */
  jugable?: boolean
}
export interface RadiantRegla { id: string; title: string; summary: string; details: { label: string; text: string }[] }
export const PRIMER_IDEAL = 'Vida antes que muerte. Fuerza antes que debilidad. Viaje antes que destino.'
```
- `RADIANT_REGLAS` (L.34) = bloques `investidura`, `acciones-luz`, `spren`, `ideales`, `escuderos`. Solo texto de enciclopedia; `MyTalents.tsx:131` lee el bloque `acciones-luz`.
- `TALENTOS_COMUNES` (L.148-197, no exportado) es la fábrica de los talentos repetidos en cada orden: `primerIdeal` (prereq `'nivel 2 o más'`), `segundoIdeal` (`'Primer Ideal; nivel 4 o más'`), `tercerIdeal` (`'Segundo Ideal; nivel 8 o más'`), `cuartoIdeal` (`'Tercer Ideal; nivel 13 o más'`), `investido`, `vinculoEstrechado`, `adoptarEscudero`, `regeneracionHeridas`.
- Una orden tiene **9 talentos** (4 Ideales + 5), salvo Vigilantes de la Verdad (10; `talentGrids.ts:519-534`) y Forjadores de Vínculos (`talentos: []`, `jugable: false`, L.505-523).
- El **primer talento** del array es siempre el Primer Ideal y el motor lo toma como nodo clave (`isKey = i === 0`, `talentGraph.ts:484`).

### 1.5 Cantor (`W/data/cantores.ts:3-30`)
```ts
export type FormaBonusKey = 'fuerza' | 'velocidad' | 'intelecto' | 'voluntad' | 'discernimiento' | 'presencia' | 'desvio' | 'concentracion'
export type FormaBonusMap = Partial<Record<FormaBonusKey, number>>
export interface FormaCantor {
  nombre: string
  spren: string
  esPoder: boolean          // true = vacíospren → riesgo influencia Odium
  descripcion: string
  bonos: string
  bonusAtributos?: FormaBonusMap
  accionesEspeciales?: string[]
}
export interface TalentoCantor {
  nombre: string
  activacion: string | null // 'action3', 'passive'...
  prereq?: string
  descripcion: string
  formas: FormaCantor[]
  esFormasDePoder?: boolean
}
export const CANTOR_COLOR        = '#a78bfa'
export const CAMBIAR_DE_FORMA    = 'Cambiar de forma'
export const FORMA_ACTIVA_PREFIX = '~forma~'
export const ARBOL_CANTOR: TalentoCantor[]            // L.34; 8 talentos, raíz «Cambiar de forma»
export function getFormaActiva(talentos: string[]): string | null              // L.337
export function withFormaActiva(talentos: string[], forma: string): string[]   // L.343
export function getFormasDisponibles(selectedTalentos: string[]): FormaCantor[] // L.348
```
El árbol del cantor es el **precedente de «árbol de ascendencia»**: un árbol propio de una ascendencia, con raíz concedida (`autoGranted`). Kandra y sangre koloss de Nacidos de la Bruma (L.35-39 / PDF 41-45) serían análogos.

### 1.6 Rejilla (`W/data/talentGrids.ts:34-53`)
```ts
export interface TalentGridCell {
  /** Nombre exacto del talento (coincide con name/nombre del fichero de datos). */
  name: string
  /** carril, 0-indexed, de izquierda a derecha como en el libro */
  col: number
  /** fila, 0-indexed, de arriba abajo */
  row: number
}
export interface TalentGrid {
  cols: number
  rows: number
  cells: TalentGridCell[]
}
export const TALENT_GRIDS: Record<string, TalentGrid>   // L.55
```
Claves existentes (38 entradas): `heroico:<caminoId>:<Especialidad>` (18, p. ej. `heroico:agente:Investigador`, L.57), `potencia:<NombreDeLaPotencia>` (10, p. ej. `potencia:Abrasión`, L.316), `radiante:<ordenId>` (9, sin `bondsmiths`, L.459-596) y `cantor` (L.597; 3 carriles x 4 filas con hueco). Formas: potencia 2x4 completa (8 celdas), radiante 2x5 (Primer Ideal solo en la fila 0 + 2x4 debajo; Vigilantes 2x6), heroica 2x4.

`TALENT_SUMMARIES: Record<string, string>` (`W/data/talentSummaries.ts:29`): texto corto de la tarjeta del mapa; **clave = nombre del talento** (global, sin separar por árbol). Si falta, la UI usa la primera frase de `description` (`talentMap.ts:21-28`).

### 1.7 Tipos del grafo (`W/lib/talentGraph.ts`)
```ts
export type TreeKind = 'heroico' | 'radiante' | 'potencia' | 'cantor'                      // L.297
export interface TalentGraphOptions {                                                      // L.299
  caminoHeroico?: string | null           // camino inicial (su talento principal es gratis)
  extraHeroicPaths?: readonly string[]    // otros caminos heroicos (su principal cuesta 1 talento)
  caminoRadiante?: string | null
  isCantor?: boolean
}
export interface TalentTree {                                                              // L.308
  id: string          // 'heroico:<path>' (principal) | 'heroico:<path>:<slug-especialidad>' | 'radiante:<order>' | 'potencia:<id>' | 'cantor'
  kind: TreeKind
  pathId: string; pathName: string
  section: string; sectionId: string          // especialidad / «Vínculo con X» / nombre de potencia / 'Cantor'
  color: string
  order: number
  nodeIds: string[]
  keyNodeId: string | null                    // talento clave del camino
  isStartingPath: boolean
  status: 'ok' | 'noJugable' | 'pendiente'
  potenciaId: string | null
}
export interface TalentNode {                                                              // L.340
  id: string                  // `${treeId}/${name}`  (con sufijo ~index si choca)
  name: string; treeId: string; kind: TreeKind; pathId: string; section: string
  index: number; isKey: boolean; autoGranted: boolean
  activation: ActivationType; description: string; prereqText: string; notaLibro: string | null
  clauses: PrereqClause[]; parentGroups: ParentGroup[]; childIds: string[]
  mejora: string[]; mejoradoPor: string[]
  formas: FormaCantor[]
}
export interface TalentGraph {                                                             // L.367
  options: TalentGraphOptions; trees: TalentTree[]; treeById: Map<string, TalentTree>
  nodes: TalentNode[]; byId: Map<string, TalentNode>; byName: Map<string, TalentNode[]>
  autoGranted: string[]; startingPathId: string | null; radiantOrderId: string | null; isCantor: boolean
}
export type PrereqClause =                                                                 // L.212
  | (ClauseBase & { kind: 'talent'; options: string[]; principal: boolean })
  | (ClauseBase & { kind: 'ideal'; ideal: number; name: IdealName })
  | (ClauseBase & { kind: 'skill'; skill: string; field: SkillField | null; surge: boolean; min: number })
  | (ClauseBase & { kind: 'level'; min: number })
  | (ClauseBase & { kind: 'story'; text: string })
  | (ClauseBase & { kind: 'ancestry'; ancestry: 'cantor' })
  | (ClauseBase & { kind: 'unknown' })
export interface TalentState {                                                             // L.577
  talentos: readonly string[]; level: number; skills: SkillSource; ascendencia: string
  idealesJurados?: number | null; confirmedStory?: readonly string[]
}
export type NodeState = 'learned' | 'learnedElsewhere' | 'available' | 'locked'            // L.605
export type GateStatus = 'met' | 'unmet' | 'confirm'                                       // L.606
export type Gate = /* las mismas 7 variantes que PrereqClause + status/label/text; 'skill' añade current/maxRank/capLevel/capped; 'ideal' añade learned/sworn */   // L.622
export interface NodeEval { id; state; gates; missing; distance: number|null; minLevel; needsConfirmation; gateBadge: 'nivel'|'ideal'|'dj'|null }   // L.631
export interface TalentEvaluation { learned: ReadonlySet<string>; stored: string[]; formaActiva: string|null; formaActivaValida: boolean; nodes: Map<string, NodeEval>; level: number }  // L.647
export type SlotKind = 'principal' | 'heroico' | 'radiante' | 'cantor' | 'formas' | 'cambiarForma' | 'otro'   // L.1081
export interface TalentSlot { level; source: 'principal'|'nivel'|'ascendencia'; label; accepts: SlotKind[]; mandatory; orRank }   // L.1088
export interface TalentBudget { allowed; used; excess; remaining; missing: BudgetRow[]; unplaced: string[]; rows: BudgetRow[]; counted: string[]; ignored: string[]; excessText: string|null; excessDetail: string }  // L.1102
```
Tipos del mapa (`talentMap.ts`): `PlateKind = 'especialidad' | 'vinculo' | 'potencia' | 'cantor'` (L.43); `PlateModel {tree, kind, cols, rows, pos: Map<nodeId,{col,row}>, order, label, fullLabel}` (L.44-57); `PathModel {id, kind: 'heroico'|'radiante'|'cantor', pathId, title, eyebrow, color, keyNode, plates, nodeIds, isStarting, noJugable}` (L.58-73).

`Character` (`W/types/index.ts`): `talentos: string` (JSON, L.124), `idealesJurados` (int), `caminoHeroico`, `caminoRadiante`, `ascendencia` (todos `string` libres, sin unión), 18 habilidades por campo y `habilidadPersonalizada1..6` (`...`, `...Valor`, `...Atributo`). `Meta` (`types/index.ts:146`): `{id, characterId, titulo, descripcion, hitos, estado: 'activa'|'concluida', tipoConclusion, notasConclusion, createdAt}`.

---

## 2. API exportada de `talentGraph.ts` y suposiciones de Stormlight

### 2.1 Constantes y helpers exportados

| Símbolo | Firma / valor | Línea | Suposición Stormlight |
|---|---|---|---|
| `FORMAS_INICIALES` | `['Formas de delicadeza','Formas de determinación','Formas de sabiduría'] as const` | 53 | Los 3 talentos de nivel 1 del cantor; uno es obligatorio. Usado por `slotKindOf` (L.1150). |
| `IDEAL_NAMES` / `IdealName` | `['Primer Ideal',...,'Quinto Ideal']` | 55-56 | Los Ideales son **talentos con nombre fijo** y a la vez un contador «jurados». Base de `IDEAL_SET` (L.119), del regex L.223 y de la exclusión de «mejora» (L.546). |
| `FORMA_ACTIVA_PREFIX`, `CAMBIAR_DE_FORMA` | re-export de `cantores.ts` | 48 | Marcador `~forma~` y raíz del árbol del cantor. |
| `SURGE_NAMES` | 10 nombres de potencias | 60-63 | Entra en `catalog().nonTalent` (L.172) y en `SURGE_BY_NORM` (L.97) para marcar `surge: true` en cláusulas de habilidad. |
| `SKILL_FIELDS` / `SkillField` | 18 campos de `Character` | 65-70 | Las 18 habilidades de Stormlight; Nacidos de la Bruma comparte las 18 (resumen §0.12). |
| `SKILL_NAME_MAP` | nombre en prerrequisito → campo | 73-81 | Incluye `'Armas Ligeras'/'Armas Pesadas'` y `'Saber'→conocimiento`. **No** incluye `'Armamento ligero'/'Armamento pesado'`, que es como los llama Nacidos de la Bruma (resumen §8). Ningún prerrequisito actual de Stormlight usa armas ni atributos (grep en `heroicPaths.ts`, `potencias.ts`, `radiantOrders.ts`), así que el hueco no se ha visto. |
| `SkillSource` | `Partial<Pick<Character, SkillField \| habilidadPersonalizadaN \| ...Valor>>` | 86 | Las habilidades no estándar se resuelven por **nombre en los 6 huecos personalizados** (`skillValue` L.677-686). Alomancia/Feruquimia funcionarían así sin tocar nada (ver §5.3). |
| `rangoOf(level)` | `number → 1..5` | 102 | Rango 1=niv 1-5 ... 5=21+. Igual en Nacidos de la Bruma (L.27). |
| `maxSkillRank(level)` | `→ 2/3/4/5` | 106 | Tope de grado por nivel. Igual en Nacidos de la Bruma (resumen §1.4). |
| `minLevelForRank(rank)` | `→ 1/6/11/16` | 110 | Ídem. |
| `idealIndexOf(name)` | `string → 0..5` | 116 | Stormlight. |
| `isCantorAncestry(asc)` | `string\|null\|undefined → boolean`; acepta `oyente`/`cantor`/`cantora` | 121-124 | **Cableado**: la única ascendencia con árbol propio. Lo llaman `graphOptionsFromCharacter` (L.571), `gateFor` (L.730) y `talentSlotsAt` (L.1127). |
| `parseStoredTalentos(json)` | `string\|null\|undefined → string[]` | 129 | Seguro ante JSON roto. |
| `splitStoredTalentos(stored)` | `→ {names, formaActiva}` | 139 | Separa `~forma~...`; deduplica y recorta. |
| `withTalent(stored, name)` | `→ string[]` | 147 | Añade sin duplicar y deja el marcador `~forma~` al final. |
| `storyKey(condition)` | `string → string` | 154 | Clave normalizada de una confirmación de DJ. |
| `allTalentNames()` | `→ ReadonlySet<string>` | 200 | Todos los nombres de talento de **todos** los datos (caché global `catalogCache`, L.167-197). |
| `parsePrereq(text, known?)` | `→ PrereqClause[]` | 278 | Ver §2.2. |
| `buildTalentGraph(options)` | `TalentGraphOptions → TalentGraph` | 411 | Ver §2.3. |
| `graphOptionsFromCharacter(ch, extraHeroicPaths?)` | `Pick<Character,'caminoHeroico'\|'caminoRadiante'\|'ascendencia'> → TalentGraphOptions` | 563 | Lee `caminoRadiante` y `ascendencia` (cantor). |
| `talentStateFromCharacter(ch, extra?)` | `Character → TalentState` | 593 | `idealesJurados`: 0 se lee como «sin definir» (null → un Ideal aprendido cuenta como jurado). |
| `evaluate(graph, state)` | `→ TalentEvaluation` | 834 | Estado por nodo, gates, `distance`, `minLevel`. Usa `getFormasDisponibles` (L.884). |
| `structurallyMet(node, names)` | `→ boolean` | 739 | Solo cláusulas de talento e Ideal. |
| `cheapestRoute(graph, state, targetId, opts?)` | `→ RouteResult` | 938 | Ruta mínima; cuenta huecos libres con `talentSlotsAt` (L.1018). |
| `cascadeRemove(graph, state, name)` | `→ CascadeResult` | 1045 | Olvidar en cascada; invalida la forma activa (L.1067-1068). |
| `talentSlotsAt(level, ascendencia, startingPathId?)` | `→ TalentSlot[]` | 1125 | Ver §2.4. |
| `talentBudget(character, graph)` | `→ TalentBudget` | 1166 | Emparejamiento bipartito talentos↔huecos (Kuhn, L.1183-1198). |

Tipos exportados adicionales: `PrereqClause`, `TreeKind`, `TalentGraphOptions`, `TalentTree`, `ParentOption`, `ParentGroup`, `TalentNode`, `TalentGraph`, `TalentState`, `NodeState`, `GateStatus`, `GateOption`, `Gate`, `NodeEval`, `TalentEvaluation`, `RouteStep`, `RouteSkill`, `RouteAlternative`, `RouteResult`, `CascadeResult`, `SlotKind`, `TalentSlot`, `BudgetRow`, `TalentBudget`.

### 2.2 `parsePrereq`: gramática real y qué rompe con Nacidos de la Bruma

Orden de intento en `parseClause` (L.232-272): (1) Ideal (regex L.223, p. ej. «Primer Ideal», «pronunciar el Segundo Ideal»); (2) nombre exacto de un talento conocido; (3) historia (`^(tener|acceso a|contar con|vínculo con)\s`, L.222, nunca bloquea: estado `confirm` y diálogo de DJ); (4) `^ascendencia\s+cantor`; (5) `^nivel N o más`; (6) `^talento principal X` (X puede ser «A o B»); (7) `^talento X`; (8) `^<habilidad> N o más`; (9) lista «A o B» de talentos conocidos; (10) `unknown`. Separadores: `,` y `;` = Y (L.282); `o`/`u` = O solo entre nombres de talento conocidos (`splitOr` L.230). `N o más` / `N o superior` se enmascara antes (L.280) para no confundirlo con una O.

Qué encaja tal cual con el texto del manual (L.136-137 / PDF 142-143 y L.172-174 / PDF 178-180):
- `Alomancia 3 o más; talento principal Ruptura de brumoso` → cláusula `skill` (field `null`) + `talent` principal. **Válido** si «Ruptura de brumoso» es un talento conocido y Alomancia está en un hueco personalizado.
- `talento Investido`, `talento Experto en Empujones de acero` → `talent`.
- `Alomancia 4 o más; talento Experto en Empujones de acero` → `skill` + `talent`.

Qué **no** encaja (derivado de leer `parseClause`; no ejecutado):

| Texto del manual | Dónde sale | Qué haría hoy el motor |
|---|---|---|
| `poder Alomancia de acero` / `Alomancia de acero` (primer nivel de cada árbol) | L.179-180 / PDF 180 | Con prefijo «poder » → `unknown` (no se quita el prefijo). Sin prefijo y con un nodo llamado «Alomancia de acero» sería `talent`; si no existe ese nombre en el catálogo → `unknown`. |
| `Armamento pesado 2 o más o Armamento ligero 2 o más` | «Disparo con empujón», L.173 / PDF 179 | La regex del paso (8) es lazy y anclada: captura `skill = "Armamento pesado 2 o más o Armamento ligero"`, `min = 2`, `field = null` → se busca ese nombre en los huecos personalizados → valor 0. **Se queda bloqueado para siempre sin avisar** (`status: unmet`, no `unknown`). No hay cláusula de «O entre habilidades». |
| `Voluntad 4 o más` (atributo) | «Últimas reservas» (ferrin), resumen §3.4 | `skill` con `field = null` → 0 → inalcanzable. No hay cláusula de atributo. |
| `Armamento pesado 2` en `SKILL_NAME_MAP` | ídem | `'Armamento pesado'` no está en el mapa (solo `'Armas Pesadas'`, L.74) → mismo fallo. |
| `ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia` | principal de cada camino de nacido del metal, L.135 / PDF 141 | `ascendencia` solo reconoce `cantor` (L.240) → `unknown` (bloqueado). «no tener ningún otro...» → `unknown`. |
| `ambos poderes con el mismo metal` / `poderes con metales distintos` | «Componedor» y «Resonancia aleada» (nacidoble), resumen §3.4 | `unknown`. No son historia ni talento: son condiciones sobre las **elecciones de poder**. |
| `Alomancia 3 o más; Feruquimia 3 o más; ...; Mentes de metal ampliadas o Investido` | «Componedor» | Las dos habilidades van como `skill` (válido); `Mentes de metal ampliadas o Investido` es una O de talentos conocidos (válido). |

### 2.3 `buildTalentGraph` (L.411-561): qué construye y dónde está cableado

1. **Caminos heroicos** (L.443-470): una raíz `heroico:<id>` con el `mainTalent` como nodo clave + un árbol por especialidad (`heroico:<id>:<slug>`). El primero (`options.caminoHeroico`) es el «camino inicial»: su principal entra en `autoGranted` (L.460), es decir, se posee sin estar guardado. Los `extraHeroicPaths` cuestan 1 talento.
2. **Orden radiante** (L.472-498): árbol `radiante:<id>` con `order.talentos` (primer talento = clave, L.484-485) + **dos árboles de potencia** `potencia:<id>` (uno por `order.surges`) cuyo `keyNodeId` es el Primer Ideal. Estado: `noJugable` si `talentos.length === 0 || jugable === false`; `pendiente` si la potencia no tiene talentos transcritos (L.491).
3. **Cantor** (L.500-510): un árbol `cantor` con `ARBOL_CANTOR`; clave y `autoGranted` = «Cambiar de forma».
4. **Enlaces padre→hijo** (L.512-535): por cada cláusula de talento/Ideal se crea un `ParentGroup`; el candidato elegido es el mismo árbol, luego el mismo camino, luego el nodo clave, luego cualquiera (L.520-526). Esa regla es la que hace que los talentos de potencia cuelguen del Primer Ideal de **su** orden.
5. **«Mejora / Mejorado por»** (L.537-553): busca en la descripción nombres de otros talentos del grafo (regex por nombre en `mentionRegexes`, L.402-409; sobre `catalog().names` **global**).
6. **Prerrequisito implícito** (L.428-429): al talento llamado exactamente `'Primer Ideal'` se le añade `nivel 2 o más` si no tiene cláusula de nivel.

Suposiciones que no sobreviven a Nacidos de la Bruma: un camino «especial» (radiante) que **sí o no** existe y es único (`options.caminoRadiante`), el nodo clave es siempre el primer talento del array, los árboles de potencia cuelgan de ese nodo clave, y el catálogo/`byName` mezcla todos los datos (no hay separación por set).

### 2.4 Presupuesto de talentos (`talentSlotsAt` L.1125-1146, `slotKindOf` L.1148-1159, `talentBudget` L.1166)

- Hueco de nivel 1 «talento principal»: acepta `['principal']` si hay camino inicial, si no `['principal','heroico']` (L.1129-1133).
- Hitos de ascendencia 1/6/11/16/21 (L.1134-1141): humano = un hueco `['heroico']` por hito; cantor = en el 1: «Cambiar de forma» + un «Formas de…» **obligatorio** (`mandatory: true`), y en los demás `['cantor','formas','cambiarForma','heroico']`.
- Niveles 2..L: un hueco que acepta **todos** los tipos (`ALL_KINDS`, L.1082); a partir del 21, «talento o rango de habilidad» (`orRank`).
- `slotKindOf(name, graph)`: `cambiarForma` / `formas` por nombre; si el nombre está en el grafo, `heroico` (principal si es el clave del camino inicial) o `cantor`, y **todo lo demás cae en `radiante`** (L.1155); si no está en el grafo, mira `catalog().kind` (L.1157).
- `talentBudget`: cuenta los nombres guardados que sean talentos (los que son solo nombres de potencia/camino/especialidad o llevan `~forma~` se ignoran, L.1174-1179), añade los `autoGranted` (L.1180, **consumen hueco**), y empareja con los huecos por tipos. `excess = used - allowed`.
- El engine ya modela un **hueco obligatorio por ascendencia** (cantor). Nacidos de la Bruma tiene otro: kandra recibe «Forma natural» (principal) + «Disfraz kandra» gratis (resumen §2.1) y las ascendencias dan huecos en los mismos hitos (L.28). Los kandra no pueden tomar talentos de nacido del metal (L.18 / PDF 24): sería una restricción de `accepts`/ascendencia, no un hueco nuevo.

### 2.5 Dónde está cableado lo de Ideales (todo lo que sustituiría la «meta de nacido del metal»)

| Qué | Dónde | Detalle |
|---|---|---|
| Cláusula `ideal` | L.223-228, L.236-237, L.704-709 | Se cumple solo si el talento Ideal está aprendido **y** jurado (`isSworn` L.688-691: `idealesJurados` null → cuenta como jurado). |
| Estado «jurado» | `TalentState.idealesJurados` L.583; `Character.idealesJurados` | Entero 0-5 que fija a mano GM o dueño (`IdealesControl`, `TalentosDetailPage.tsx:709`, con `Stepper` 0-5). |
| Aviso `ideal` en el mapa | `cellMark` (`talentMap.ts:168-176`), `gateBadge` (L.875) | Prioridad NV > Ideal > DJ. Insignia con el glifo `caballeros-radiantes` (`MapPieces.tsx:91-94`). |
| Ruta | `cheapestRoute` L.981-992 | El Ideal pendiente es un paso en sí; «Pronunciar el X Ideal (meta pendiente)» como gate. |
| Texto de lámina | `TalentLamina.tsx:36-37` | «Jurar el primer Ideal». |
| Texto de ficha | `TalentSheet.tsx:31,41` | «aprendido, falta jurarlo (meta con la DJ)». |
| Copy de la lámina de potencia | `TalentLamina.tsx:110` | «El rango 1 es gratis al jurar el Primer Ideal.» |
| Rango de potencia | `TalentosDetailPage.tsx:304-310` (`surgeRank`), `MyTalents.tsx:91-97` | Busca la potencia por nombre en los 6 huecos personalizados y lee su `...Valor`. |

El análogo en Nacidos de la Bruma es **una meta de 3 hitos por poder** (L.132-133 / PDF 138-139): completada = versión completa + acceso al árbol. Hoy no existe ningún objeto «meta ligada a un talento»: `Meta` es independiente (`types/index.ts:146`), y los Ideales usan un contador manual, no una `Meta`.

---

## 3. Persistencia de la selección

| Dato | Dónde se guarda | Formato | Quién lo escribe |
|---|---|---|---|
| Talentos aprendidos | `Character.talentos` (`types/index.ts:124`, `CharacterEntity` en la API) | String con un **array JSON de nombres desnudos**: `["Oportunista","Robusto",...]`. Sin ids, sin árbol, sin nivel. | `TalentosDetailPage` `talentosMutation` (L.176-195): `charactersApi.update(cId, charId, { ...(cur as UpdateCharacterRequest), talentos: JSON.stringify(names) })`. Actualización **optimista** y **de todo el personaje** (last-write-wins). |
| Forma activa del cantor | **Misma** cadena como elemento `~forma~<Nombre>` | `withFormaActiva` (`cantores.ts:343`) lo deja al final; `splitStoredTalentos` (L.139) y `withTalent` (L.147) lo respetan | `activateForma` (`TalentosDetailPage.tsx:270`), `CharacterDetailPage` |
| «Aprendidos» que no son talentos | También en `talentos`: nombres de potencias (`'Adhesión'`), caminos, especialidades | Se **ignoran** en el presupuesto (`catalog().nonTalent`, L.164-165, L.1177) y en «Mis talentos» (`MyTalents.tsx:107`); el motor los deja intactos | El selector de orden radiante de `CharacterDetailPage.tsx:1312-1357` los **añade/quita** al cambiar de orden |
| Talento principal del camino inicial | **No se guarda**: `autoGranted` (L.460) | — | Pero el selector de camino de la ficha (`CharacterDetailPage.tsx:1269-1276`) **sí** lo inserta en `talentos` al cambiar de camino heroico |
| «Cambiar de forma» (cantor) | No se guarda: `autoGranted` (L.509) | — | — |
| Ideales jurados | `Character.idealesJurados` (int; API `CharacterEntity.cs:21`, `CharacterRequest.cs:28`) | 0-5; 0 = sin marcar | `idealesMutation` (`TalentosDetailPage.tsx:196-209`) |
| Rangos de potencia | `habilidadPersonalizadaN` (nombre) + `...Valor` (grados) + `...Atributo` (código FUE/VEL/...) | Se leen **por nombre** | Selector de orden radiante (`CharacterDetailPage.tsx:1312-1357`): valor 1 al elegir orden |
| Rango en 6 huecos | 6 huecos en total para todo lo «personalizado» | — | Alomancia + Feruquimia + hasta 2 potencias Stormlight compiten por esos 6 huecos (inferido de `CharacterDetailPage` L.1049-1130: 2 huecos por tarjeta Físico/Cognitivo/Espiritual) |
| Objetivo de planificación, láminas abiertas, modo, confirmaciones de DJ, camino explorado | `localStorage` por dispositivo | `cosmere-talentos-objetivo:<charId>`, `...-laminas:<charId>`, `...-vista:<userId>`, `...-dj:<charId>` (`TalentosDetailPage.tsx:87-90`) | Solo cliente; no llegan a la API |
| Caminos heroicos extra | **Inferidos** de `talentos`: si está guardado el `mainTalent` de otro camino, ese camino entra en el grafo (`extraKey`, `TalentosDetailPage.tsx:114-118`) | — | — |

Servidor (solo para entender qué lee del campo): `TalentosReglas.Reglas` (`cosmere-api/Services/Characters/TalentosReglas.cs:54`) es un diccionario **nombre de talento → reglas de estadística** (p. ej. `["Investido"] = MaxInvestidura PorRango`, `["Robusto"] = MaxSalud PorNivel`); la API no valida los talentos, solo lee nombres. `CondicionRegla.TieneInvestidura` se evalúa como `!string.IsNullOrEmpty(c.CaminoRadiante)` (`TalentosReglas.cs:218`) y `BuildInvLineas` devuelve 0 sin `CaminoRadiante` (`CharacterService.cs:239`): la Investidura de un alomante hoy sería 0. `ValidAscendencias = ["Humano","Oyente"]` y la lista de caminos válidos están en `CharacterService.cs:20-32`. No toco las formas de cantor (trabajo en curso de otra sesión: `FormasCantor.cs`).

Consecuencia de diseño: el motor **no puede guardar nada que no sea una lista de nombres** sin tocar `Character`. Para Nacidos de la Bruma hace falta persistir como mínimo, por poder: `estado naciente|completo`; y como extras (fuera del motor): cargas de mente de metal, cuentas de atium, Desprovisto, viales.

---

## 4. Cómo se dibuja el mapa y qué espera de `talentGrids`

### 4.1 Pipeline
`buildTalentGraph` → `buildPathModels(graph)` (`talentMap.ts:116`) → `PathAtlas` (`PathAtlas.tsx:74`) → por lámina `tracePlate` (`talentMap.ts:345`) → `Plate`/`EdgeLayer` (SVG) y, al abrir la banda dorada, `TalentLamina` (versión legible con tarjetas).

### 4.2 Qué lee de `TALENT_GRIDS`
- `gridKeyOf(tree)` (`talentMap.ts:76-81`): `heroico` → `heroico:${pathId}:${section}` (el `section` es el **nombre** de la especialidad, con acentos); `potencia` → `potencia:${section}` (**nombre** de la potencia); `radiante` → `radiante:${pathId}`; cualquier otro → `'cantor'`.
- `plateOf` (L.83-114): para cada nodo del árbol (menos el clave) busca la **primera celda no usada con el mismo `name`**. Los talentos sin celda se colocan en col 0 en filas libres a continuación (nunca pisan celdas). Si **no hay rejilla** para la clave, cae a 2 carriles en orden de lectura (`i % 2`, `floor(i/2)`, L.105). La fila mínima se normaliza a 0 (L.108-110). `cols` viene de la rejilla (si no, 2).
- El nodo clave (Primer Ideal, principal heroico, Cambiar de forma) **no es celda**: se pinta arriba en `KeyBox` y las aristas «desde la banda» salen del `keyNodeId` del **árbol** (`tracePlate` usa `plate.tree.keyNodeId`, `talentMap.ts:394`). Es decir, el trazador ya admite una clave **distinta por lámina**; es `PathAtlas`/`PathModel` el que solo pinta una clave por camino.
- Las aristas se dibujan **solo desde prerrequisitos reales** (`parentGroups`), con reglas fijas (recta, salto por margen, lateral con flecha, diagonal entre filas, larga por el canal central; grupos «o» con círculo de unión). Los padres fuera de la lámina salen como texto «también requiere: X» (`chips`).
- Geometría fija, sin medir el DOM: `mapDims(contentW)` (L.225-251; miniatura de móvil, celdas 44x26, o escritorio ≥ 600 px), `laminaDims` (L.255-264), `plateBox` (L.276-284).

### 4.3 ¿Es viable una rejilla de «16 metales»?
Distingo dos cosas:

1. **Una rejilla/lámina por poder de metal (árbol de talentos del poder): sí, sin cambios en el formato.** Cada poder de metal tiene 0-8 talentos (resumen §4.3: «Nº aproximado por poder»; acero alomántico 7, acero feruquímico 6) y el diagrama del libro es de 2 columnas (el listado del manual de acero, PDF 180, tiene 7 celdas; ver [inferido] más abajo). El formato `TalentGrid {cols:2, rows:4}` lo cubre. Claves nuevas sugeridas: `metal:alomancia:acero`, `metal:feruquimia:acero` (hace falta ampliar `gridKeyOf`). Sin entrada de rejilla, el mapa cae al orden de lectura en 2 carriles: sirve como **primera entrega**, pero el orden de los talentos en los datos no es el del diagrama.
2. **Pintar todos los poderes a la vez en el mapa de un camino: no es viable tal cual.**
   - `mapDims` calcula `plateW` como `(contentW - 2*plateGap)/3` (L.226-231, L.243-244): el diseño supone **3 láminas por fila** (especialidades, o vínculo + 2 potencias).
   - `PathAtlas.tsx:224`: `display:'flex', gap, justifyContent:'center', width: rowW, maxWidth:'100%'` sin `flexWrap`; cada `Plate` lleva `flexShrink: 0` (`PathAtlas.tsx:501`) y el bus SVG (L.215-222) une el centro de **todas** las láminas en una sola línea horizontal. Con 12 láminas el contenido desborda horizontalmente.
   - El cálculo de la flecha del `BriefCard` (`caretX`, L.98-107) también asume una sola fila.
   - Alternativas, de menor a mayor esfuerzo: (a) **solo las láminas de los poderes que el personaje tiene** (mismo criterio que la orden radiante, que solo muestra sus 2 potencias) y los demás en un bloque «Otros poderes» plegado, como `showOthers` de los caminos heroicos (`TalentosDetailPage.tsx:129-144, 573`); (b) trocear `model.plates` en filas de 3 con un bus por fila y recalcular `caretX` por fila; (c) componente nuevo de «selector de poder» (tabla 4x4 de metales con estado naciente/completo) que abre la lámina del metal elegido.
3. **Elegir el metal** (la «rejilla de 16 metales» como selector de la Ruptura/Herencia) **no es un árbol de talentos**: no pasa por `talentGrids`. Es una pantalla nueva (cuadrícula con categoría, par puro/aleación, era) que escribe el estado del poder.

[inferido] Las posiciones de las celdas de los árboles de metal no están en el texto extraído (el texto del PDF 180 solo da el orden de lectura del diagrama); habría que extraerlas del PDF renderizado como se hizo para Stormlight (cabecera de `talentGrids.ts:25-30`: páginas renderizadas del PDF).

---

## 5. Borrador de tipos para «CaminoNacidoDelMetal» y «PoderMetal»

Estado: **propuesta**, nada de esto existe. Objetivo: que los datos nuevos usen el mismo molde que ya consume `buildTalentGraph` (`Talento` + `Potencia` + campos del `HeroicPath`), para minimizar cambios en el motor.

### 5.1 Equivalencias de molde

| Concepto de Nacidos de la Bruma (fuente) | Molde existente | Encaje |
|---|---|---|
| Camino de nacido del metal (5; L.127-160 / PDF 133-166): talento principal + árbol propio **sin especialidades**, mutuamente excluyentes | `HeroicPath` con `mainTalent*` (+ un único árbol plano) | Casi: el motor construye 1 raíz + N árboles de especialidad (L.451-469); aquí sería 1 raíz + **1 árbol plano** + árboles de poder. |
| Poder de metal (alomancia o feruquimia de un metal, 2 por metal; L.161-171 / PDF 167-177): árbol de talentos propio con atributo y activación base | `Potencia` (`atributo`, `costoBase`, `talentos: Talento[]`, `ordenes`) | Sí (`ordenes` = caminos que lo desbloquean). |
| Talentos de primer nivel de cada poder: prerrequisito «poder Alomancia de X» (L.173 / PDF 179-180) | Talentos de potencia con `prereq: 'Primer Ideal'` | Hay que dar al «poder desbloqueado» una **cláusula propia** (no un nodo): ver 5.4. |
| Meta de nacido del metal por poder, 3 hitos, completada sí/no; completada = versión completa + acceso al árbol (L.132-133 / PDF 138-139) | `idealesJurados` (contador manual) + cláusula `ideal` | Es un **booleano por poder**, no un contador global. |
| Habilidad Investida Alomancia (VOL) / Feruquimia (INT) (L.128 / PDF 134, resumen §8) | Rango de potencia en `habilidadPersonalizadaN` (+ `...Atributo`) | Sirve tal cual: `skillValue` (L.677-686) resuelve cualquier habilidad por nombre. |
| Cargas de mente de metal, viales, Desprovisto, cuentas de atium | no existe | Fuera del motor (hoja del personaje). |
| Árbol de ascendencia kandra / sangre koloss (L.35-39 / PDF 41-45) | `ARBOL_CANTOR` (`TalentoCantor`) | Mismo patrón («raíz concedida + árbol»), ver §6. |

### 5.2 Tipos de datos (catálogo estático)

```ts
// W/data/nacidosBruma.ts  (propuesto)
import type { ActivationType } from '../components/TalentActivation'
import type { Talento } from './potencias'

export type ArteMetal = 'alomancia' | 'feruquimia'
export type Era = 1 | 2
/** ids sin acentos, como `Potencia.id` ('abrasion'). El nombre con acentos va en `name`. */
export type MetalId =
  | 'hierro' | 'acero' | 'estano' | 'peltre' | 'cinc' | 'laton' | 'cobre' | 'bronce'      // 8 comunes (físicos + mentales)
  | 'cromo' | 'nicrosil' | 'aluminio' | 'duraluminio'                                    // raros: mejora
  | 'cadmio' | 'bendaleo' | 'oro' | 'electro'                                            // raros: temporales
  | 'atium'                                                                              // divino (Era 1)
export type CategoriaAlomantica = 'fisico' | 'mental' | 'mejora' | 'temporal' | 'divino'
export type CategoriaFeruquimica = 'fisico' | 'cognitivo' | 'espiritual' | 'hibrido' | 'divino'
export type CaminoNdMId = 'brumoso' | 'nacido-de-la-bruma' | 'feruquimista' | 'ferrin' | 'nacidoble'

/** Catálogo de metales de Scadrial (L.168-171 / PDF 174-177). Los datos de la tabla son [inferido]: la extracción salió desordenada. */
export interface MetalDef {
  id: MetalId
  name: string                    // 'Acero'
  eras: Era[]                     // disponibilidad del metal en la ambientación
  comun: boolean                  // 8 comunes = suministro implícito; raros = viales contados
  puroOAleacion: 'puro' | 'aleacion' | null
  pareja: MetalId | null          // hierro↔acero, estaño↔peltre...
  alomancia: { categoria: CategoriaAlomantica; interno: boolean; tiron: boolean | null; nombreBrumoso: string; efecto: string }
  feruquimia: { categoria: CategoriaFeruquimica; rasgo: string; nombreFerrin: string }   // rasgo: 'peso', 'velocidad física'...
}

/** Un poder = un metal en un arte. Mismo molde que `Potencia` para que `buildTalentGraph` lo trate como un árbol de potencia. */
export interface PoderMetal extends Omit<Potencia, 'ordenes'> {
  /** id estable: `${arte}:${metal}`, p. ej. 'alomancia:acero' */
  id: string
  arte: ArteMetal
  metal: MetalId
  /** 'Alomancia de acero': nombre EXACTO que aparece en los prerrequisitos («poder Alomancia de acero») */
  name: string
  /** alomancia → 'Voluntad', feruquimia → 'Intelecto' (atributo de la habilidad Investida) */
  atributo: 'Voluntad' | 'Intelecto'
  /** caminos de nacido del metal que desbloquean este árbol (frase «Es posible desbloquear este árbol mediante el talento principal de...») */
  caminos: CaminoNdMId[]
  /** también desbloqueable por clavo hemalúrgico (siempre cierto en el libro) */
  porClavo: boolean
  eras: Era[]
  /** false = no hay versión naciente ni meta (alomancia de atium, L.176 / PDF 182) */
  requiereMeta: boolean
  /** true = sin árbol de talentos (alomancia de aluminio, feruquimia de nicrosil): la lámina sale como «no jugable/pendiente» */
  sinArbol?: boolean
  /** acciones del poder (Quemar X, Empujón de X / Almacenar Y, Decantar Y): informativo, no entra en el motor */
  acciones: { name: string; cost: ActivationType; duracion: string; efecto: string }[]
  // heredados de Potencia: descripcion, costoBase, talentos: Talento[]
}

/** Camino de nacido del metal: mismos campos de talento principal que `HeroicPath` para reutilizar el bloque de buildTalentGraph. */
export interface CaminoNacidoDelMetal {
  id: CaminoNdMId
  name: string
  definition: string
  eras: Era[]                                   // brumoso ambas; nacido de la bruma y feruquimista Era 1; ferrin y nacidoble Era 2
  /** habilidad inicial si es camino inicial (L.19 / PDF 25): brumoso 'Alomancia', ferrin 'Feruquimia', nacidoble 'Disciplina', los otros dos ninguna */
  initialSkill: string | null
  mainTalent: string                            // 'Ruptura de brumoso' | 'Herencia ferrin' | ...
  mainTalentPrerequisites: string               // «ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia»
  mainTalentActivation: ActivationType          // 'special'
  mainTalentRolDescription: string
  mainTalentEffect: string
  /** habilidades Investidas que añade el principal y grados iniciales (L.128 / PDF 134) */
  habilidadesInvestidas: { arte: ArteMetal; grados: number }[]
  /** cuántos poderes concede al elegir: 1 | 'todos' por arte; nacidoble = 1 + 1 (L.19 / PDF 25) */
  poderes: { alomancia: 0 | 1 | 'todos'; feruquimia: 0 | 1 | 'todos' }
  /** Investidura (brumoso, nacido de la bruma, nacidoble) */
  concedeInvestidura: boolean
  /** metas de nacido del metal que da el principal: 'Entrenar tu poder' (alomancia), 'Fabricar tu mente de metal' (feruquimia) */
  metasIniciales: { arte: ArteMetal; titulo: string; hitos: number }[]
  /** árbol propio del camino (intrínseco; sin especialidades). Brumoso 5, nacido de la bruma 6, feruquimista 6, ferrin 5, nacidoble 11. */
  talentos: Talento[]
  color: string; colorBg: string; colorBorder: string
  icon: string
}
```
Conteos de `talentos` según el resumen (§3.4), sin contar el principal; a verificar contra el PDF.

### 5.3 Estado por personaje (entrada del motor)

```ts
/** Lo único que el motor necesita saber de un poder del personaje. */
export interface PoderEstado {
  poderId: string          // 'alomancia:acero'
  completo: boolean        // false = naciente (solo efectos menores, árbol cerrado); true = meta completada
}
/** Lo que persiste la API (fuera del motor): se deriva `completo` de aquí. */
export interface PoderPersonaje extends PoderEstado {
  metaId?: number | null   // Meta.id de «Entrenar tu poder»; Meta.estado === 'concluida' ⇒ completo (derivable)
  cargas?: number          // feruquimia: cargas actuales (máx = 2 + grados de Feruquimia, +rango con «Mentes de metal ampliadas»)
  desprovisto?: boolean    // estado «Desprovisto [poder]»
}
```
Qué ya funciona **sin tocar el motor**: Alomancia 3 o más / Feruquimia 3 o más (`skill` con `field: null`, `skillValue` L.677-686) siempre que la habilidad esté en un hueco personalizado con ese nombre. Riesgos: solo hay 6 huecos (Alomancia + Feruquimia + las 2 potencias de una orden radiante en una campaña mixta); `SKILL_NAME_MAP` (L.73) no conoce «Armamento ligero/pesado».

### 5.4 Cambios mínimos del motor (ordenados por necesidad)

| # | Cambio | Dónde | Motivo |
|---|---|---|---|
| 1 | Cláusula `poder` (`{kind:'poder'; poderId; arte; metal}`) + `Gate` equivalente. Regex `^(?:poder\s+)?(alomancia\|feruquimia) de (.+)$`. Estado `met` si `state.poderes` contiene el `poderId` con `completo: true`, si no `unmet` con texto «Meta de nacido del metal pendiente: Entrenar tu poder». | `PrereqClause` L.212, `parseClause` L.232, `Gate` L.622, `gateFor` L.693, `TalentState` L.577 (`poderes?: readonly PoderEstado[]`) | Es el análogo del Ideal jurado, pero **sin nodo**: así el poder no consume hueco de talento ni aparece como talento aprendible. El talento de primer nivel queda `locked` hasta que la meta se completa y `distance` no cambia (como las cláusulas de habilidad/nivel). |
| 2 | Quitar el sesgo «Armamento»: añadir `'Armamento ligero'`, `'Armamento pesado'` a `SKILL_NAME_MAP`. | L.73-81 | Prerrequisitos de «Disparo con empujón» y, en general, de especialidades de Nacidos de la Bruma. |
| 3 | Cláusula `skillAny` (O entre habilidades) | `parseClause` paso (8) L.259-267 (hoy captura mal el texto, ver §2.2) | «Armamento pesado 2 o más o Armamento ligero 2 o más». |
| 4 | Cláusula `atributo` (`Voluntad 4 o más`) leyendo el atributo base del personaje (`TalentState` hoy no lleva atributos) | `TalentState`, `parseClause`, `gateFor` | «Últimas reservas» (ferrin). Hay que añadir `atributos` a `TalentState` desde `Character`. |
| 5 | Generalizar `ancestry`: `{kind:'ancestry'; ancestry: string[]}` («humana o de sangre koloss», «kandra», «cantor») y quitar el literal `'cantor'` | L.218, L.240, L.628, L.729-732; `TalentLamina.tsx:41` | Los 5 talentos principales exigen ascendencia. |
| 6 | Cláusula `exclusivo` («no tener ningún otro talento de ruptura o herencia») evaluada contra los principales del resto de caminos NdM en `learned` | `parseClause`, `gateFor`, y `evaluate` (comprobar contra `graph`) | Los 5 caminos son excluyentes (L.127 / PDF 133). Alternativa más simple: no modelarlo como cláusula y bloquear en la UI al elegir camino. |
| 7 | Cláusula `poderes` (`mismoMetal` \| `metalesDistintos`) sobre los poderes elegidos | idem | «Componedor» (mismo metal) y «Resonancia aleada» (metales distintos), nacidoble. Requiere conocer los poderes elegidos (`state.poderes` basta). |
| 8 | `TreeKind += 'nacidoMetal' \| 'poderMetal'`; `TalentGraphOptions += caminoNdM?: CaminoNdMId \| null; poderes?: readonly string[]`; nuevo bloque en `buildTalentGraph` entre L.470 y L.500: 1 raíz (clave = talento principal; `autoGranted` si es camino inicial) + 1 árbol plano del camino + 1 árbol por cada poder elegido (`keyNodeId` = el principal, como las potencias con el Primer Ideal en L.490) | L.297-306, L.411-561 | Es el bloque de la orden radiante (L.472-498) con otra fuente de datos. Con la cláusula del #1 no hace falta nodo «poder». |
| 9 | `SlotKind += 'nacidoMetal' \| 'poder'` y que `slotKindOf` (L.1148) no deje caer lo nuevo en `'radiante'` (L.1155) | L.1081-1086, L.1148-1159 | Evita que «Investido» (brumoso) cuente como radiante. Qué huecos los aceptan es una decisión de reglas, [inferido]: hueco de nivel normal sí (`ALL_KINDS`); hueco de ascendencia humana (solo `heroico`) no; hueco de «camino inicial» sí si el camino inicial es NdM. |
| 10 | `talentSlotsAt` y `graph.startingPathId` resuelven también ids de camino NdM (hoy `HEROIC_PATHS.find`, L.1128; `startingPathId` solo heroico, L.445-450) | L.1125-1146 | Camino inicial = principal gratis (L.17-18 / PDF 23-24). |
| 11 | `catalog()` y `allTalentNames()` **por set de reglas** (hoy un `catalogCache` único con todo, L.167-197) | L.160-202 | Ver §6: `Investido` existe en Stormlight (orden) y en Nacidos de la Bruma (varios caminos); «Robusto» ya se repite hoy y funciona porque el grafo solo incluye los árboles del personaje. |
| 12 | `gateBadge` con valor `'meta'` (o reutilizar `'ideal'` renombrado) y glifo/copy propios | L.644, `talentMap.ts:168-176`, `MapPieces.tsx:91-94`, `TalentLamina.tsx:36-41`, `TalentSheet.tsx:31,41` | Hoy el aviso de «falta jurar» es un Ideal. |

Lo que **no** hace falta cambiar: `evaluate`, `cheapestRoute` y `cascadeRemove` (operan sobre cláusulas de talento; las nuevas cláusulas son no estructurales, como `skill`/`level`); `parsePrereq` para `talento X`, `talento principal X`, `X o Y`, `Habilidad N o más`; el emparejamiento de huecos; el mapa para láminas de 2 carriles; `TALENT_SUMMARIES` y `TALENT_GRIDS` como formato.

Decisiones abiertas que el motor no puede resolver solo (para quien diseñe el modelo):
- Dónde se guarda el camino de nacido del metal: campo nuevo `caminoNdM` (recomendado: excluyente, como `caminoRadiante`) vs inferirlo del principal guardado en `talentos` (como `extraKey` de los caminos heroicos extra, `TalentosDetailPage.tsx:114-118`). Un camino NdM como **camino inicial** (L.17) obliga además a un indicador «camino inicial = heroico | nacido del metal» (hoy `caminoHeroico` es el inicial por definición y la API lo valida contra 6 ids: `CharacterService.cs:20-32`).
- Dónde se guarda `PoderEstado`: **campo/entidad nueva en la API** (`poderes`, JSON o tabla), no en `talentos`. Motivos: las cargas y el Desprovisto cambian a menudo; `talentosMutation` envía el personaje entero (`TalentosDetailPage.tsx:176-179`) y compite con cualquier otra edición; los marcadores en `talentos` ya hay que tratarlos como especiales en 4 sitios (`splitStoredTalentos`, `withTalent`, `talentBudget.ignored`, `cascadeRemove`). Si se optase por marcadores (`~poder~acero=completo`) habría que generalizar `FORMA_ACTIVA_PREFIX` a una lista de prefijos en esos 4 sitios y en `FormasCantor.cs` (en curso por otra sesión).
- ¿Completar la meta marca el poder como `completo` a mano (GM/dueño, como `IdealesControl`) o se deriva de `Meta.estado === 'concluida'` (`Meta` no tiene vínculo con talentos hoy)? Mínimo viable: interruptor manual por poder.
- Efecto de «Investido»: el nombre ya existe en `TalentosReglas.Reglas` del servidor (`MaxInvestidura PorRango`) y serviría tal cual; pero `TieneInvestidura` y `BuildInvLineas` dependen de `CaminoRadiante` (ver §3).

---

## 6. Todo lo que habría que parametrizar por set de reglas

Hoy el set de reglas **no existe como concepto** en el frontend ni en la API (ver `web_map.md` §1: `CreateCampaignRequest` solo tiene `Name`). Para el motor de talentos, la forma natural es un objeto de datos por set que el motor reciba por parámetro:

```ts
// propuesta; no existe
export type RuleSetId = 'archivo-tormentas' | 'nacidos-bruma'
export interface ReglasSetTalentos {
  id: RuleSetId
  caminosHeroicos: HeroicPath[]                 // mismos 6 ids, especialidades distintas (ver 6.3)
  caminosEspeciales: (RadiantOrder | CaminoNacidoDelMetal)[]
  potencias: (Potencia | PoderMetal)[]
  arbolesAscendencia: ArbolAscendencia[]        // cantor hoy; kandra y sangre koloss en Nacidos de la Bruma
  grids: Record<string, TalentGrid>
  summaries: Record<string, string>
  skillNameMap: Record<string, SkillField>      // Armas → Armamento
  nombresIdeales: readonly string[] | null      // null en Nacidos de la Bruma
}
```
`buildTalentGraph`, `parsePrereq`, `catalog()`, `talentSlotsAt`, `talentBudget` recibirían ese objeto (o una referencia al set) en lugar de importar `HEROIC_PATHS`/`RADIANT_ORDERS`/`POTENCIAS`/`ARBOL_CANTOR` de forma estática.

### 6.1 En el motor (`W/lib/talentGraph.ts`)

| Qué | Línea | Hoy | Para Nacidos de la Bruma |
|---|---|---|---|
| Imports estáticos de datos | 42-45 | `HEROIC_PATHS`, `RADIANT_ORDERS`, `POTENCIAS`, `ARBOL_CANTOR` | Pasar el set por parámetro |
| `FORMAS_INICIALES` | 53 | 3 talentos de formas del cantor | Vacío (no hay formas) |
| `IDEAL_NAMES`, `IDEAL_ORDINALS`, `IdealName` | 55-57 | 5 Ideales | Sin Ideales: sustituidos por metas de poder |
| `SURGE_NAMES`, `SURGE_BY_NORM` | 60-63, 97 | 10 potencias | Ids/nombres de los poderes de metal (`'Alomancia de acero'`...) |
| `SKILL_FIELDS` / `SKILL_NAME_MAP` | 65-81 | 18 habilidades; «Armas Ligeras/Pesadas» | Añadir «Armamento ligero/pesado»; Alomancia/Feruquimia siguen siendo huecos personalizados |
| `isCantorAncestry` | 121-124 | `oyente`/`cantor`/`cantora` | Predicado por ascendencia y por set (`humano`, `kandra`, `sangre koloss`) |
| `CatalogKind` y `catalog()` | 160-197 | `heroicoPrincipal \| heroico \| radiante \| cantor` y caché global | Un catálogo por set; añadir `nacidoMetal`, `poder` |
| `IDEAL_RE`, `parseIdeal` | 223-228 | Ideales en el texto | Solo si el set los tiene |
| Cláusula `ancestry` | 218, 240 | solo `cantor` | Lista de ascendencias |
| `TreeKind` | 297 | 4 tipos | `+ nacidoMetal`, `poderMetal` |
| `TalentGraphOptions` | 299-306 | `caminoRadiante`, `isCantor` | `caminoNdM`, `poderes`, ascendencia genérica |
| Bloques de `buildTalentGraph` | 443-510 | heroico, radiante+2 potencias, cantor | + camino NdM + N poderes; árbol de ascendencia genérico |
| Prerrequisito implícito del Primer Ideal | 428-429 | `nivel 2 o más` | No aplica |
| `graphOptionsFromCharacter` | 563-573 | lee `caminoRadiante`, `ascendencia` | leer `caminoNdM`/poderes del personaje |
| `TalentState.idealesJurados`, `isSworn` | 583, 688-691 | contador 0-5 | `poderes?: PoderEstado[]`; `idealesJurados` solo en Stormlight |
| `gateFor` rama `ideal` / `ancestry` | 704-709, 729-732 | Stormlight | Ramas nuevas (§5.4) |
| `evaluate`: `formaActivaValida` | 879-886 | `getFormasDisponibles` | Solo en sets con formas |
| `cheapestRoute`: gates de Ideal | 981-992 | «Pronunciar el X Ideal» | Gate de meta de poder |
| `cascadeRemove`: forma inválida | 1067-1070 | cantor | Solo en sets con formas |
| `SlotKind`, `KIND_LABEL`, `ALL_KINDS` | 1081-1086 | 7 tipos | `+ nacidoMetal`, `poder` |
| `talentSlotsAt` | 1125-1146 | humano heroico; cantor Formas | Humano heroico (igual, L.28); kandra y sangre koloss: árbol propio; hitos 1/6/11/16/21 iguales |
| `slotKindOf` | 1148-1159 | cae a `'radiante'` | Casos nuevos |
| Textos del presupuesto | 1131-1143, 1210-1212 | «cantor: Cambiar de forma», «humano: talento heroico» | Etiquetas por set |

### 6.2 En la UI de talentos y su entorno

| Pieza | Líneas | Acoplamiento a Stormlight |
|---|---|---|
| `PathAtlas.tsx` | 69-72 | `pathIcon`: `heroico → HeroicPathIcon`, `radiante → RadiantOrderIcon`, resto → icono de música. Falta icono de camino NdM/metal. |
| | 134, 187, 367 | Eyebrow y copys: «Camino radiante», «No jugable… orden», «tu talento de nivel 1». |
| | 43, 327 | `surgeRank` como prop: «rango de potencia». |
| | 82, 224, 215-222, 98-107 | 3 láminas por fila, bus único, `caretX` de una fila (§4.3). |
| `talentMap.ts` | 43, 58-73, 76-81, 116-157 | `PlateKind`, `PathModel.kind`, `gridKeyOf` y `buildPathModels` solo conocen heroico/radiante/cantor. `sourceOf` (L.32-40) compone «Camino · talento principal», «Primer Ideal», «Cantor». |
| `TalentLamina.tsx` | 10, 12, 90-117 | Banda de potencia: busca la potencia por **nombre de la sección** en `POTENCIAS` y usa `SurgeIcon`; copy «El rango 1 es gratis al jurar el Primer Ideal» (L.110). |
| | 36-41 | `gateBits`: texto de Ideal («Jurar el primer Ideal») y de `ancestry` («Ascendencia cantora»). |
| `MapPieces.tsx` | 91-94, 117 | `IdealGlyph` (glifo `caballeros-radiantes`) en la insignia `ideal`. |
| `TalentSheet.tsx` | 18, 31, 41, 339-372 | Textos de gate de Ideal; bloque de formas del cantor y su cascada. |
| `MyTalents.tsx` | 85-97, 128-165, 259-299, 301-326, 341-342, 374, 397 | `RADIANT_ACTIONS` (Absorber luz tormentosa, Aumentar, Revitalizar), filas virtuales de «poder base» por potencia, `FormaActivaCard`, `IdealHintCard` («luz tormentosa»…). |
| `FormaPicker.tsx` | todo | Específico del cantor («alta tormenta», vacíospren, Odium). |
| `TalentosDetailPage.tsx` | 17-19, 298-299, 304-314 | Datos estáticos de Stormlight en la página; `surgeRank`; formas e ideales. |
| | 447, 452-462, 496-535, 573, 709 | Estado vacío («Camino Heroico u Orden Radiante»), aviso de Formas obligatorias, ramas por `m.kind`, «Otros caminos heroicos» (exploración solo de caminos heroicos), `IdealesControl`. |
| `TalentosPage.tsx` | 10-12, 23-24, 83-88 | Pastillas de camino heroico y orden radiante en la tarjeta del personaje. |
| `CharacterDetailPage.tsx` (fichero con cambios sin commitear: las líneas pueden moverse) | 433-436, 509-512, 1261-1276, 1303-1357 | `ASCENDENCIAS` (Humano, Oyente), `isCantor`, selector de camino heroico (inserta el principal en `talentos`), selector de orden radiante (reescribe `talentos` y potencias en huecos personalizados con valor 1). |

### 6.3 En los datos

- **`heroicPaths.ts`**: los 6 caminos y sus `mainTalent` son los mismos en ambos libros (L.19 / PDF 25; y L.374 / PDF 380: «comparten los mismos seis caminos heroicos»; si una especialidad tiene el mismo nombre se puede usar en ambos). Las especialidades difieren:

| Camino | Archivo de las Tormentas (`heroicPaths.ts`) | Nacidos de la Bruma (L.19 / PDF 25) | Comunes |
|---|---|---|---|
| Agente | Investigador, Espía, Ladrón (L.56,118,180) | Investigador, Ladrón, **Rebelde** | Investigador, Ladrón |
| Cazador | Arquero, Asesino, Rastreador | **Mataneblinos**, **Francotirador**, Rastreador | Rastreador |
| Enviado | Diplomático, Fiel, Mentor | **Estafador**, Fiel, Mentor | Fiel, Mentor |
| Erudito | Artifabriano, Estratega, Cirujano | Cirujano, Estratega, **Inventor** (Era 2) | Cirujano, Estratega |
| Guerrero | Duelista, Portador de esquirlada, Soldado | **Alborotador**, **Pistolero** (Era 2), Soldado | Soldado |
| Líder | Campeón, Oficial, Político | **Planificador**, Oficial, Político | Oficial, Político |

  Exclusivas de ambientación según el propio libro (L.374-375 / PDF 380-381): Artifabriano y Portador de esquirlada (Tormentas); Mataneblinos, Inventor y Pistolero (Nacidos de la Bruma). Tres escenarios de datos: especialidades compartidas (reutilizables), de Tormentas (8, ya transcritas) y de Nacidos de la Bruma (8, por transcribir). [inferido] Que el **texto** de los talentos de una especialidad compartida sea idéntico en ambos libros: no se ha comparado.
- **`talentGrids.ts`**: claves `heroico:<camino>:<Especialidad>`, `potencia:<NombrePotencia>`, `radiante:<ordenId>`, `cantor`. Nacidos de la Bruma necesita: `heroico:*` de las 8 especialidades nuevas; `metal:<arte>:<metal>` (hasta ~32 árboles; 2 sin árbol); `nacidoMetal:<caminoId>` (5); y árboles de ascendencia (kandra, sangre koloss). `gridKeyOf` (`talentMap.ts:76`) tiene que conocer los tipos nuevos.
- **`talentSummaries.ts`**: clave = nombre de talento, global. Los nombres repetidos entre caminos NdM («Investido», «Quemar instintivamente», «Trazas de metal», «Almacenamiento rápido», «Mentes de metal ampliadas», «Decantación instintiva», «Mente de metal integrada») tienen **efecto idéntico pero prerrequisito distinto** por camino (resumen §3.4); el resumen puede compartirse, el prerrequisito no (va en cada `Talento`). «Investido» ya existe en Stormlight con el mismo efecto (`radiantOrders.ts:173-178`).
- **`TALENTOS_COMUNES`** (`radiantOrders.ts:148-197`): patrón a imitar para los talentos repetidos de los caminos NdM.
- **Constante de color y marcadores**: `CANTOR_COLOR` (`cantores.ts:27`), `FORMA_ACTIVA_PREFIX` (L.29).
- **Identidad por nombre** (`byName`, `TALENT_SUMMARIES`, `TALENT_GRIDS` por celda, `TalentosReglas.Reglas` en la API): si Stormlight y Nacidos de la Bruma se mezclan en una campaña (permitido, L.374-375 / PDF 380-381), un mismo nombre en ambos sets se fusiona. Con «Investido» sería el comportamiento deseado (misma regla de Investidura única); con cualquier otro homónimo habría que desambiguar.

### 6.4 En la API (solo lo que toca al contrato del motor; sin modificar nada)

| Qué | Dónde | Acoplamiento |
|---|---|---|
| Ascendencias válidas | `cosmere-api/Services/Characters/CharacterService.cs:23` | `["Humano","Oyente"]` |
| Caminos válidos | `CharacterService.cs:20-32` | 6 heroicos + 10 radiantes; no hay camino de nacido del metal |
| Investidura | `CharacterService.cs:239` (`BuildInvLineas`), `TalentosReglas.cs:218` (`TieneInvestidura`) | Solo con `CaminoRadiante` |
| Reglas por talento | `TalentosReglas.cs:54` | Diccionario por nombre (compatible con talentos nuevos si se añaden entradas) |
| Campos del personaje | `CharacterEntity.cs:21` (`IdealesJurados`) y DTOs | Falta `poderes`/`caminoNdM` |
| Formas de cantor | `FormasCantor.cs`, `CharacterService.cs:314-315` | **Cambios sin commitear de otra sesión: no pisar** |

### 6.5 Orden de trabajo que minimiza el riesgo (sugerencia)

1. Introducir `ReglasSetTalentos` y que el motor lo reciba, con Stormlight como único set y **sin cambio de comportamiento** (extraer los imports estáticos de L.42-45 y `catalog()`).
2. Ampliar la gramática de prerrequisitos (cláusulas `poder`, `atributo`, `skillAny`, `ancestry` genérica, `exclusivo`, `poderes`) y `SKILL_NAME_MAP`; son aditivas y no afectan a Stormlight (ningún prerrequisito actual las usa).
3. Añadir `TreeKind`/`SlotKind`/`PlateKind` nuevos y el bloque de grafo del camino NdM + poderes.
4. UI: ramas por `PathModel.kind`, láminas de poder (icono de metal en lugar de `SurgeIcon`), selección de metal, interruptor naciente/completo, y envoltorio de varias filas de láminas.
5. Datos: 5 caminos NdM, ~32 árboles de poder, 8 especialidades heroicas nuevas, rejillas (extraer del PDF renderizado) y resúmenes.

---

## 7. Estado del árbol de trabajo y límites de esta lectura

- Al empezar la sesión, `git status` del frontend marcaba como modificados `src/pages/characters/CharacterDetailPage.tsx` y `src/types/index.ts` (y sin seguimiento `.claude/`, `CLAUDE.md`, `docs/`). Ninguno de los ficheros del motor de talentos (`lib/talentGraph.ts`, `components/talentos/*`, `data/*`, `pages/personajes/Talentos*`) figuraba como modificado. En la API hay cambios sin commitear de las formas de cantor (`CharacterService.cs`, `TalentosReglas.cs`, `CharacterResponse.cs`, `FormasCantor.cs`): se han leído, no se tocan.
- Lo marcado [inferido] sale de leer el código, no de ejecutarlo (en particular el comportamiento de `parseClause` con «Armamento pesado 2 o más o Armamento ligero 2 o más» y con `poder Alomancia de acero`). Antes de apoyarse en ello conviene una prueba de 10 líneas llamando a `parsePrereq` (el motor es TS puro).
- Datos de Nacidos de la Bruma tomados de `mistborn_rules_summary.md` y de lecturas puntuales del texto del manual (PDF 140-143 brumoso, 178-181 acero y aluminio, 380-381 mezcla de ambientaciones). Las tablas de metales del resumen están marcadas [inferido] allí.
- No se ha leído `CharacterDetailPage.tsx` entero ni las páginas de enciclopedia; las líneas citadas de ese fichero salen de búsquedas dirigidas.
