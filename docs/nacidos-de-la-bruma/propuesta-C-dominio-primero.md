# Propuesta C — «Dominio primero»: Nacidos de la Bruma como set de reglas de CosmereAPP

## 0. Portada

| | |
|---|---|
| **Título** | Nacidos de la Bruma como set de reglas: modelo de dominio, configuración de campaña y migración de Stormlight a un modelo común |
| **Fecha** | 3 de octubre de 2026 |
| **Estado** | Propuesta, **sin implementar**. Ningún fichero de los repositorios se ha tocado. |
| **Ángulo** | C — Dominio primero: corrección frente al libro y seguimiento de recursos en mesa (Investidura actual, cargas, viales, cuentas de atium, Desprovisto) por encima de la economía de cambios. |
| **Repositorios** | `cosmere-api` (ASP.NET Core 8, EF Core, PostgreSQL) y `cosmere-web` (React 19, TS, Vite, Zustand, TanStack Query). |
| **Fuentes primarias** | Manual «Nacidos de la bruma» (texto íntegro `mistborn_flow.txt`, PDF = L.+6); mapas `api_map.md`, `web_map.md`, `mistborn_rules_summary.md`; informes de lectura `lectura_motor_talentos_web.md`, `lectura_motor_reglas_api.md`, `lectura_alomancia_inventario.md`, `lectura_feruquimia_hemalurgia_inventario.md`, `lectura_delta_reglas_base.md`, `lectura_delta_catalogo.md`, `lectura_superficie_ui.md`; auditoría `cosmere-web/docs/auditoria-reglas-2026-10-03.md`; convenciones `CLAUDE.md` (raíz y web) y `DESIGN.md`. |
| **Verificación propia** | Se releyeron en el manual PDF 135-139 (Investidura, viales, mentes, metas), PDF 40-41 (kandra y Bendiciones), PDF 301 (lerasium), PDF 377-381 (eras y mezcla de ambientaciones); y en código `CampaignEntity.cs`, `CharacterEntity.cs`, `MetaEntity.cs`, `CosmereContext.cs:28-68`, `Services/Bootstrap.cs`, `MetaService.cs`, `CampaignService.cs`, `CharacterService.cs` (árbol con WIP), `TalentosReglas.cs:170-264`, `FormasCantor.cs`, `CharacterResponse.cs`, `Program.cs:93-94`, `campaignStore.ts`, `AppLayout.tsx`, `themeStore.ts`, `api/*.ts`, `types/index.ts`, `talentGraph.ts`, `talentMap.ts`, `GmPage.tsx`, `ui.tsx`, `DESIGN.md`. |
| **Convenciones de cita** | Código: `archivo:línea` del árbol de trabajo actual. Libro: «L.<libro> / PDF <pdf>». `[inferido]` = deducción no literal del libro ni del código. |

---

## 1. Resumen ejecutivo y principios de diseño

1. El motor de reglas de **escena y de estadísticas es el mismo** en ambos manuales (salud, concentración, defensas, movimiento, recuperación, acciones, dado de trama: `lectura_motor_reglas_api.md` §0.2, `lectura_delta_reglas_base.md` §0). Lo que Nacidos de la Bruma añade es **dominio nuevo**: caminos de nacido del metal, poderes por metal con estado naciente/completo, Investidura ligada a metales, mentes de metal con cargas, viales y cuentas de atium, clavos hemalúrgicos, Bendiciones kandra, arquillas y eras (L.127-133 / PDF 133-139; L.371-372 / PDF 377-378).
2. La propuesta introduce **un set de reglas por campaña** (`Campaigns.RuleSet`, inmutable) y una **era** editable (`Campaigns.Era`), y modela el dominio de nacido del metal con **tablas hijas propias** (`CharacterPoderes`, `ClavosHemalurgicos`) más columnas en `Characters` (`CaminoMetal`, `Alomancia`, `Feruquimia`, `InvestiduraActual`, `CuentasAtium`, `Arquillas`, `Bendiciones`), en vez de marcadores dentro del JSON `Talentos`.
3. Los **valores actuales de mesa** (Investidura actual, cargas por mente, viales raros, cuentas de atium, Desprovisto) pasan a **persistirse en el servidor** y a modificarse con un endpoint parcial (`PATCH …/recursos`) y acciones de dominio (`POST …/acciones/beber-vial`), evitando el PUT completo *last-write-wins* que hoy hace cada guardado (`TalentosDetailPage.tsx:176-179`, `BolsaDetailPage.tsx:184`).
4. La **meta de nacido del metal** reutiliza `MetaEntity` (3 hitos, misma conclusión, L.282-284 / PDF 288-290) con dos campos nuevos (`Tipo`, `PoderId`); concluirla con éxito desbloquea el poder (`Estado = completo`) en el servidor, como manda L.132-133 / PDF 138-139.
5. El servidor gana un **motor por set** (`IReglasSet` + `IReglasSetProvider` singleton) que envuelve sin cambios el cálculo actual (`StormlightReglas`) y añade `MistbornReglas` (validación, gate de Investidura por camino alomántico, Resistencia koloss, Bendiciones, derivados de artes metálicas, penalización de clavos). Todo lo que toca `CharacterService.cs`/`TalentosReglas.cs` es **aditivo** para no pisar el WIP de formas de cantor.
6. En el frontend, un módulo `src/rulesets/` expone por set capacidades, tablas y datos; `talentGraph.ts` recibe el set por parámetro y gana cláusulas (`poder`, `atributo`, `skillAny`, `ancestry` genérica, `eleccionPoderes`); el mapa pinta láminas de poder con el mismo molde que las potencias.
7. **Stormlight no cambia de comportamiento** en ninguna fase: columnas, DTOs y cálculos se conservan; una campaña existente queda `ruleSet='stormlight'` por `DEFAULT` de migración y se ve idéntica.
8. **Camino de convergencia**: en la fase final se propone la vista unificada `poderes` para Stormlight (potencias como poderes cuyo «completo» es el Ideal jurado) sin borrar `CaminoRadiante`/`IdealesJurados`; es opcional y reversible.

**Principios de diseño**

| # | Principio | Consecuencia |
|---|---|---|
| P1 | El libro manda | Nombres, fórmulas, límites y estados tal como los escribe el manual; lo [inferido] se marca y se lista en §12. |
| P2 | Recursos de mesa en el servidor | Lo que cambia durante una sesión (Investidura actual, cargas, viales, Desprovisto) se guarda con escrituras parciales y sin pisar el resto de la ficha. |
| P3 | Aditivo y reversible | Columnas con `DEFAULT`, tablas nuevas, DTOs con propiedades nuevas al final; ningún `DROP`, ningún renombrado. |
| P4 | Un set por campaña, capacidades por personaje | La campaña fija set y era; el motor decide por personaje si tiene Investidura (radiante **o** alomántico), porque así lo prevé la mezcla del libro (L.374-375 / PDF 380-381). |
| P5 | Convenciones del proyecto | Estilos inline con tokens, `ui.tsx` para overlays, iconografía oficial > Lucide, términos de juego en español, `types/index.ts` espejo de `Messages`, claves de caché por campaña, `ConfirmDialog` antes de borrar, migraciones siempre aplicadas. |

---

## 2. Glosario de dominio y convenciones de nombres

### 2.1 Identificadores de set y era

| Concepto | Valor en BD/JSON | Etiqueta UI | Fuente |
|---|---|---|---|
| Set Archivo de las Tormentas | `stormlight` | «Archivo de las Tormentas» (corto «Tormentas») | — |
| Set Nacidos de la Bruma | `mistborn` | «Nacidos de la bruma» (corto «Bruma») | — |
| Era 1 | `1` | «Era 1: El Mundo de Ceniza» | L.372 / PDF 378 |
| Era 2 | `2` | «Era 2: Cambio y revolución» | L.372 / PDF 378 |
| Entre eras | `null` (con `ruleSet='mistborn'`) | «Entre eras» | L.372 / PDF 378 («Entre eras») |
| Sin era (Stormlight) | `null` | — | — |

### 2.2 Vocabulario de dominio (valores persistidos, siempre en español y sin acentos en ids)

| Término del libro | Campo / valor | Notas |
|---|---|---|
| Camino de nacido del metal | `Characters.CaminoMetal` ∈ `''`, `brumoso`, `nacido-de-la-bruma`, `feruquimista`, `ferrin`, `nacidoble` | Excluyentes (L.127 / PDF 133). Mismo estilo kebab/minúsculas que `caminoHeroico` (`agente`…) y `caminoRadiante` (`windrunners`…). |
| Talento de ruptura / de herencia | Nombres exactos en `Talentos` JSON: «Ruptura de brumoso», «Ruptura de nacido de la bruma», «Herencia feruquímica», «Herencia ferrin», «Herencia nacidoble» | L.135, 141, 146, 150, 155. |
| Arte metálica | `Arte` ∈ `alomancia`, `feruquimia` | Hemalurgia no es arte de personaje (L.251 / PDF 257), se modela como clavo. |
| Metal | `Metal` ∈ `hierro, acero, estano, peltre, cinc, laton, cobre, bronce, cromo, nicrosil, aluminio, duraluminio, cadmio, bendaleo, oro, electro, atium` | Nombre visible con acentos («Estaño», «Latón»). |
| Poder | fila de `CharacterPoderes` = (`Arte`, `Metal`) | «Alomancia de acero», «Feruquimia de acero». Nombre visible = `${Arte capitalizado} de ${metal}`. |
| Poder naciente / completo | `Estado` ∈ `naciente`, `completo` | L.162 / PDF 168; L.132 / PDF 138. Atium alomántico nace `completo` (L.133 / PDF 139). |
| Origen del poder | `Origen` ∈ `camino`, `clavo`, `lerasium`, `medallon`, `dj` | Clavo y lerasium dan versión completa (L.290 / PDF 296; L.295 / PDF 301). |
| Meta de nacido del metal | `Metas.Tipo` ∈ `general`, `nacido-del-metal`, `savantismo`; `Metas.PoderId` | Títulos: «Entrenar tu poder», «Fabricar tu mente de metal», «Convertirse en sabio». |
| Investidura actual | `Characters.InvestiduraActual` | Máximo se calcula (2 + máx(DIS,PRE) + bonos, L.26 / PDF 32). |
| Cuentas de atium | `Characters.CuentasAtium` | Aparte de la Investidura (L.176-177 / PDF 182-183). |
| Viales de metal raro | `CharacterPoderes.Viales` (solo `Arte='alomancia'` y metal raro) | Registro individual (L.130 / PDF 136). |
| Desprovisto [poder] | `CharacterPoderes.Desprovisto` + `InvestiduraRemanente` | L.310 / PDF 316; L.131 / PDF 137. |
| Mente de metal, cargas | `CharacterPoderes.Cargas`, `CargasMaxAjuste`, `Integrada` (solo `feruquimia`) | Una reserva por metal (L.131 / PDF 137). |
| Clavo hemalúrgico | fila de `ClavosHemalurgicos` | L.288-291 / PDF 294-297. |
| Bendición kandra | `Characters.Bendiciones` (text[]) ∈ `consciencia, potencia, presencia, estabilidad, fortaleza` | 1 al crear, 2.ª en rango 3 (L.34-35 / PDF 40-41). |
| Ascendencia | `Characters.Ascendencia` ∈ `Humano`, `Kandra`, `Sangre koloss` (Mistborn) · `Humano`, `Oyente` (Stormlight) | Se conserva la capitalización actual («Humano», `CharacterService.cs:23`). |
| Arquillas | `Characters.Arquillas` (numeric 10,2) | Óbolo 0,01 ar; nota 10 ar (L.254 / PDF 260). |
| Habilidades Investidas | `Characters.Alomancia`, `Characters.Feruquimia` (int grados) | Alomancia con Voluntad, Feruquimia con Intelecto (L.128 / PDF 134). |

### 2.3 Nombres de código

| Capa | Nombres |
|---|---|
| C# `Messages` | `Messages/RuleSets/RuleSetIds.cs`; entidades `CharacterPoderEntity`, `ClavoHemalurgicoEntity`; DTOs en `Messages/Poderes/In|Out`, `Messages/Clavos/In|Out`, `Messages/Characters/In/RecursosRequest.cs`, `Messages/Characters/Out/ArtesMetalicasResponse.cs`; `Messages/Campaigns/In/UpdateCampaignSettingsRequest.cs`. |
| C# `Services` | `Services/RuleSets/IReglasSet.cs`, `IReglasSetProvider.cs`, `ReglasSetProvider.cs`, `StormlightReglas.cs`, `MistbornReglas.cs`, `ArtesMetalicas.cs` (tablas puras); `Services/Poderes/IPoderService.cs`, `PoderService.cs`; `Services/Clavos/…`. |
| C# `API` | `API/Controllers/PoderesController.cs`, `ClavosController.cs`; métodos nuevos en `CharactersController`, `CampaignsController`, `CatalogController`, `GlobalNpcsController`. |
| TS tipos | `RuleSetId`, `Era`, `ArteMetal`, `MetalId`, `CaminoMetalId`, `EstadoPoder`, `OrigenPoder`, `CharacterPoder`, `ClavoHemalurgico`, `ArtesMetalicas`, `ArteDerivada`, `RecursosRequest`, `BeberVialRequest` en `src/types/index.ts`. |
| TS módulos | `src/rulesets/index.ts`, `src/rulesets/types.ts`, `src/rulesets/stormlight.ts`, `src/rulesets/mistborn.ts`; datos en `src/data/mistborn/*.ts` (los de Stormlight no se mueven); API `src/api/poderes.ts`, `src/api/clavos.ts`; store: selectores `useRuleSet`, `useEra`, `useRuleSetUi` en `src/store/campaignStore.ts`. |
| Claves TanStack | `['poderes', cId, charId]`, `['clavos', cId, charId]`, `['catalog', cId, 'weapons'|'armor'|'gear']`, `['catalog', cId, 'opts', category]`, `['global-npcs', ruleSet]`, `['campaign', cId]`. Invalidar `['character', cId, charId]` y `['characters', cId]` tras recursos/poderes. |
| Migraciones EF (orden) | `AddRuleSetToCampaigns` → `AddNacidoDelMetalToCharacters` → `AddCharacterPoderesYClavos` → `AddRuleSetToCatalog` → `SeedMistbornCatalog` → `AddRuleSetToGlobalNpcs` → (fase 5, opcional) `UnificarPoderesStormlight`. |

---

## 3. Decisiones de diseño

Cada decisión: alternativas, elegida, por qué. Las que son de producto se diseñan con la recomendación por defecto y se repiten en §12.

### (a) Set exclusivo por campaña frente a mezcla permitida por el libro

| Alternativa | Pros | Contras |
|---|---|---|
| A1 Un `RuleSet` string exclusivo | Simple; validación y catálogo claros; cubre el 100 % de las mesas actuales | No cubre L.374-375 / PDF 380-381 |
| A2 `RuleSets text[]` desde el principio | Fiel al libro | Catálogo e inventarios por nombre colisionan («Arco corto» en ambos sets, `lectura_delta_catalogo.md` §8); UI de creación más compleja; nadie lo ha pedido |
| **A3 (elegida)** `RuleSet` principal + `MezclaAmbientaciones bool` reservado (default `false`, sin UI en v1) + **capacidades por personaje** en el motor | Datos y catálogo exclusivos hoy; el motor ya razona por personaje (`TieneInvestidura` = radiante **o** alomántico; Desprovisto por fuente), así que activar la mezcla después es un flag y un overlay aditivo, no un rediseño | Una columna que v1 no usa |

Por qué: el libro dice que la mezcla «se puede» pero la deja a la DJ y la delega al futuro *Manual de los saltamundos* (L.374 / PDF 380). Diseñar el **motor** por capacidades del personaje es lo que el libro exige para la Investidura única; diseñar el **catálogo** mixto no.

### (b) Era a nivel de campaña y si cambia en el tiempo

| Alternativa | Elegida |
|---|---|
| Era fija al crear | No: «El legado de los nacidos de la bruma» cruza las dos eras (L.372 / PDF 378) |
| Era por personaje | No: la era es de la partida, no del personaje (L.17 / PDF 23: hay que conocer la era antes de crear) |
| **Era de campaña, obligatoria en Mistborn, editable por el director** (`PATCH /campaigns/{id}/ajustes`) con valores `1`, `2`, `null` = «Entre eras» | **Sí**. Cambiar de era no invalida datos: solo filtra disponibilidad (caminos, metales, ascendencias, objetos). La UI avisa con `ConfirmDialog` si algún personaje tiene elementos que dejan de estar disponibles [inferido]; el servidor **no** rechaza el cambio. |

### (c) ¿Se puede cambiar el set tras crear la campaña?

**No** (inmutable). No hay endpoint de edición hoy (`CampaignsController.cs:15-47`); cambiarlo dejaría personajes inválidos («Oyente» no existe en Mistborn, `CaminoRadiante` sin sentido). El `PATCH …/ajustes` solo acepta `era`. Si en el futuro se quisiera, bloquear cuando `Characters.Count > 0`.

### (d) Almacenamiento de poderes del personaje

| Alternativa | Pros | Contras |
|---|---|---|
| Marcadores en `Talentos` JSON (`~poder~acero=completo`) como `~forma~` | Sin migración | Acopla 4 sitios del motor web (`splitStoredTalentos`, `withTalent`, `talentBudget.ignored`, `cascadeRemove`) y `FormasCantor.cs` (WIP); cargas y Desprovisto cambian a cada ronda y viajarían en el PUT completo; imposible indexar o enlazar la meta |
| Columna JSON `Poderes` en `Characters` | Una migración; sin FK | Mismo PUT completo; sin FK a `Metas`; consultas por metal imposibles |
| **Tablas hijas (elegida)** `CharacterPoderes` y `ClavosHemalurgicos`, patrón idéntico a `MetaEntity` (`CosmereContext.cs:63-68`) | FK a `Metas` para la meta de nacido del metal; endpoints propios; escrituras pequeñas; `Include` en la lectura del personaje como ya se hace con `Metas` (`CharacterService.cs:46, 56`) | 2 tablas, 2 servicios, 2 controladores |

Por qué: el poder es la unidad de juego de Nacidos de la Bruma (hoja de artes metálicas, PDF 410: un bloque por poder con meta, completada, cargas/viales, talentos). Un nacido de la bruma de Era 1 tiene hasta 10 poderes (L.372 / PDF 378); un feruquimista 10 mentes. Eso es una colección, no un marcador.

### (e) Seguimiento de valores actuales (hoy no persistidos en servidor)

Hoy salud/concentración/Investidura actuales se eliminaron de la BD (`api_map.md` §2: migraciones `DropConcentrationInvestiture`, `RemoveHealth`). Para Nacidos de la Bruma la Investidura actual es un recurso con reglas propias (empieza en 0 al crear, L.26 / PDF 32; al máximo al empezar escena o 1 si Sorprendido, L.129 / PDF 135; solo se repone con Beber vial). Decisión:

- **Persistir en servidor**: `Characters.InvestiduraActual`, `CuentasAtium`, `Arquillas`; por poder `Cargas`, `Viales`, `Desprovisto`, `InvestiduraRemanente`.
- **Escrituras parciales**: `PATCH …/recursos` (todas las propiedades opcionales) para no competir con el PUT completo de la ficha.
- **Acciones de dominio en servidor** (atómicas, con la regla del libro): `POST …/acciones/beber-vial { metales }` (L.129 / PDF 135) y `POST …/acciones/inicio-escena { sorprendido }`.
- **Fuera de alcance**: salud y concentración actuales (siguen en cliente); difusión por SignalR de cambios de recursos (futuro).

### (f) Catálogo global frente a por set

**Columna `RuleSet` en las 4 tablas de catálogo y filas duplicadas por set** (`lectura_delta_catalogo.md` §5 y §8: moneda distinta, precios no proporcionales, descripciones editables por fila). `'shared'` solo en `CatalogOptions`. Filtro por `campaignId` en todas las rutas de `CatalogController`; sin `campaignId` se devuelve `stormlight` (compatibilidad). Alternativa descartada: catálogo por campaña (copia por campaña): multiplica filas y rompe el catálogo compartido actual.

### (g) NPC globales por set

**Columna `GlobalNpcs.RuleSet text NOT NULL DEFAULT 'stormlight'`** y filtro `GET /global-npcs?ruleSet=`. Los 34 sembrados son de Caminapiedras (Stormlight). Alternativa descartada: usar `Source` libre como discriminador (frágil, el GM lo edita).

### (h) Enciclopedia compartida frente a duplicada

**Compartida con overlay por set** para `aventuras.ts` y `combatRules.ts` (14/48 y 5/23 elementos con parche, `lectura_delta_reglas_base.md` §6) y **páginas propias por set** para lo que no existe en el otro (Órdenes/Potencias solo Stormlight; Orígenes, Caminos de nacido del metal, Artes metálicas solo Mistborn). Las dos páginas de reglas (`AventurasPage`, `CombatPage`) se comparten tal cual con una cadena parametrizada.

### (i) Tema visual por set

**`<html data-ruleset="mistborn">`** con override de tokens en los tres bloques de `index.css` (`lectura_superficie_ui.md` §6), paleta acero/peltre con atmósfera de ceniza; `themeStore.applyTheme(mode, ruleSet)` para la meta `theme-color`; script previo a la pintura en `index.html`. Se mantienen dorado, tonos gema y `--navy`. Alternativa descartada: no cambiar el tema (el libro distingue claramente ambas identidades; la hoja NB es gris bruma).

### (j) Columnas Stormlight del personaje en campañas de Nacidos de la Bruma

Se **conservan** (`CaminoRadiante`, `IdealesJurados`, `MarcosInfusas/Opacas`, `Spells`). Reglas:
- `MistbornReglas.ValidarIdentidad` exige `CaminoRadiante == ''` (400 si no, salvo `MezclaAmbientaciones`).
- La UI no lee ni pinta esos campos cuando `features.caminoRadiante === false`.
- El PUT completo los reenvía tal cual (quedan en `''`/`0`), sin coste.
- En la fase 5 (opcional) se proyectan como `poderes` para unificar el consumo en el cliente (§4.6), sin borrarlos.

### Decisiones secundarias

| ID | Decisión | Elegida y por qué |
|---|---|---|
| D-ALO | Alomancia/Feruquimia: columnas dedicadas o huecos `HabilidadPersonalizadaN` | **Columnas dedicadas** `Alomancia`, `Feruquimia` (int). Son habilidades del libro con atributo fijo (L.128 / PDF 134); los huecos son 2 por columna y un nacidoble agotaría los cognitivos (`lectura_superficie_ui.md` §9.4). El tirador y el motor de talentos las leen por un adaptador (§7.9). |
| D-BEN | Bendiciones kandra | `Bendiciones text[]` + bonos permanentes de atributo aplicados por `BonosAtributos` del set (líneas «Bendición de la Consciencia: +2») para que el presupuesto de 6 puntos (L.34 / PDF 40) siga comprobándose sobre los atributos base. Fortaleza: desvío +1 **acumulable con la armadura** [inferido; es un clavo permanente, no una forma]. |
| D-MET | Marcar «completo» | Dos vías: concluir con `exito` una `Meta` con `PoderId` (servidor pone `completo`) o `PATCH …/poderes/{id} { estado }` por el GM. El atium alomántico se crea `completo` (L.133 / PDF 139). |
| D-CLV | Clavos | Tabla propia; el servidor aplica −2/−5 a Defensa espiritual (L.290 / PDF 296) como líneas del desglose y expone `ClavosMax = min(rango, 3)`; el poder que concede el clavo se crea como fila de `CharacterPoderes` con `Origen='clavo'`, `Estado='completo'`. |
| D-NOGM | Bloqueo no-GM de `CaminoMetal` | **No bloquear** al jugador: el libro permite tomar el camino en cualquier nivel (L.128 / PDF 134); `Name`/`CaminoHeroico`/`CaminoRadiante` siguen bloqueados como hoy (`CharacterService.cs:111-116`). Decisión de producto en §12. |
| D-ERA-DATA | Disponibilidad por era | Se evalúa en **cliente** (datos estáticos con `eras`) y en servidor solo para catálogo (`Era` de la fila). El servidor **no** rechaza un metal fuera de era (la DJ puede abrir «final de Era 1», L.372 / PDF 378); la UI avisa. |

---

## 4. Modelo de datos (API)

Capa `Messages/Database/Entities`. Tipos exactos C#; convención del repo: `long` PK identidad, `DateTime.UtcNow`, listas `List<string>` mapeadas a `text[]` por Npgsql como `Weapons` (`CharacterEntity.cs:86-90`).

### 4.1 `CampaignEntity` (añadir tras `CreatedAt`, `CampaignEntity.cs:10`)

```csharp
public string RuleSet { get; set; } = RuleSetIds.Stormlight;   // 'stormlight' | 'mistborn'
public short? Era { get; set; }                                 // 1 | 2 | null (entre eras / no aplica)
public bool MezclaAmbientaciones { get; set; } = false;         // reservado; v1 siempre false
```
SQL (migración `AddRuleSetToCampaigns`): `ADD COLUMN "RuleSet" text NOT NULL DEFAULT 'stormlight'`, `ADD COLUMN "Era" smallint NULL`, `ADD COLUMN "MezclaAmbientaciones" boolean NOT NULL DEFAULT false`. Sin índice.

### 4.2 `CharacterEntity` (añadir tras `IdealesJurados`, `CharacterEntity.cs:21`, y tras `MarcosOpacas`, `:37`)

```csharp
// Nacido del metal (identidad)
public string CaminoMetal { get; set; } = string.Empty;      // '' | brumoso | nacido-de-la-bruma | feruquimista | ferrin | nacidoble
public List<string> Bendiciones { get; set; } = [];          // kandra: consciencia|potencia|presencia|estabilidad|fortaleza
// Habilidades Investidas (grados 0-5; con clavos pueden superar 5, L.290 / PDF 296)
public int Alomancia { get; set; } = 0;                      // atributo Voluntad
public int Feruquimia { get; set; } = 0;                     // atributo Intelecto
// Recursos de mesa
public int InvestiduraActual { get; set; } = 0;              // 0 al crear (L.26 / PDF 32)
public int CuentasAtium { get; set; } = 0;                   // aparte de la Investidura (L.176 / PDF 182)
public decimal Arquillas { get; set; } = 0m;                 // numeric(10,2); óbolo = 0,01 ar

public List<CharacterPoderEntity> Poderes { get; set; } = [];
public List<ClavoHemalurgicoEntity> Clavos { get; set; } = [];
```
SQL (`AddNacidoDelMetalToCharacters`): `CaminoMetal text NOT NULL DEFAULT ''`, `Bendiciones text[] NOT NULL DEFAULT '{}'`, `Alomancia integer NOT NULL DEFAULT 0`, `Feruquimia integer NOT NULL DEFAULT 0`, `InvestiduraActual integer NOT NULL DEFAULT 0`, `CuentasAtium integer NOT NULL DEFAULT 0`, `Arquillas numeric(10,2) NOT NULL DEFAULT 0`. En `CosmereContext.OnModelCreating`: `modelBuilder.Entity<CharacterEntity>().Property(c => c.Arquillas).HasPrecision(10, 2);`.

### 4.3 `CharacterPoderEntity` (nuevo, `Messages/Database/Entities/CharacterPoderEntity.cs`)

```csharp
public class CharacterPoderEntity
{
    public long Id { get; set; }
    public long CharacterId { get; set; }
    public required string Arte { get; set; }            // 'alomancia' | 'feruquimia'
    public required string Metal { get; set; }           // 'acero', 'estano', ... 'atium'
    public string Estado { get; set; } = "naciente";     // 'naciente' | 'completo'
    public string Origen { get; set; } = "camino";       // 'camino' | 'clavo' | 'lerasium' | 'medallon' | 'dj'
    public long? MetaId { get; set; }                    // Meta «Entrenar tu poder» / «Fabricar tu mente de metal»
    // Alomancia
    public int Viales { get; set; } = 0;                 // solo metales raros (L.130 / PDF 136)
    public bool Desprovisto { get; set; } = false;       // L.310 / PDF 316
    public int InvestiduraRemanente { get; set; } = 0;   // L.131 / PDF 137
    // Feruquimia (una reserva por metal, L.131 / PDF 137)
    public int Cargas { get; set; } = 0;
    public int CargasMaxAjuste { get; set; } = 0;        // −1 por Componedor (L.155 / PDF 161); +5 Guardián del conocimiento lo aplica el motor por talento
    public bool Integrada { get; set; } = false;         // «Mente de metal integrada»
    public string Notas { get; set; } = string.Empty;    // cargas vinculadas (cobre, bendaleo, nicrosil), texto libre
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public CharacterEntity Character { get; set; } = null!;
    public MetaEntity? Meta { get; set; }
}
```
Configuración EF: FK `CharacterId` cascade (como `MetaEntity`, `CosmereContext.cs:63-68`); FK `MetaId` → `Metas.Id` `OnDelete(DeleteBehavior.SetNull)`; índice único `(CharacterId, Arte, Metal)`. Tabla `CharacterPoderes`.

### 4.4 `ClavoHemalurgicoEntity` (nuevo)

```csharp
public class ClavoHemalurgicoEntity
{
    public long Id { get; set; }
    public long CharacterId { get; set; }
    public required string Metal { get; set; }           // cinc|cobre|estano|hierro (rango 2) · acero|bronce|cadmio|electro|peltre|laton|oro|bendaleo (rango 3)
    public string PoderOtorgado { get; set; } = string.Empty;  // '' o 'alomancia:acero' (metal elegido dentro de la categoría, L.291 / PDF 297)
    public bool Implantado { get; set; } = true;
    public bool Secreto { get; set; } = false;           // «clavo secreto» (L.289 / PDF 295)
    public string Notas { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public CharacterEntity Character { get; set; } = null!;
}
```
FK cascade; índice `(CharacterId)`. Tabla `ClavosHemalurgicos`. Las Bendiciones kandra **no** son filas aquí (no penalizan, L.291 / PDF 297): van en `Characters.Bendiciones`.

### 4.5 `MetaEntity` (añadir tras `NotasConclusion`, `MetaEntity.cs:12`)

```csharp
public string Tipo { get; set; } = "general";   // 'general' | 'nacido-del-metal' | 'savantismo'
public long? PoderId { get; set; }              // FK CharacterPoderes.Id, SetNull
public CharacterPoderEntity? Poder { get; set; }
```
SQL en `AddCharacterPoderesYClavos`: `Tipo text NOT NULL DEFAULT 'general'`, `PoderId bigint NULL` + FK `SetNull` + índice.

### 4.6 Catálogo y NPC (resumen; detalle en `lectura_delta_catalogo.md` §5-6)

| Tabla | Columnas nuevas |
|---|---|
| `CatalogOptions` | `RuleSet text NOT NULL DEFAULT 'stormlight'` (+ `UPDATE … 'shared'` para ids 1-3, 10-27, 30-32, 40, 42-44, 46, 50-54, 56-58, 60-62, 64, 70-71, 73-74, 80-83, 85) |
| `WeaponCatalog`, `ArmorCatalog` | `RuleSet text NOT NULL DEFAULT 'stormlight'`, `Era smallint NULL`, `Price double precision NULL`, `IsRewardOnly boolean NOT NULL DEFAULT false` |
| `GearItems` | `RuleSet`, `Era`, `IsRewardOnly`, `Category text NULL` (`'vial'`) |
| `GlobalNpcs` | `RuleSet text NOT NULL DEFAULT 'stormlight'` |
Índices no únicos `(RuleSet)` en las cuatro tablas de catálogo y en `GlobalNpcs`. La migración `SeedMistbornCatalog` inserta ids 1001+ y termina con `setval` (`lectura_delta_catalogo.md` §6.6); **nunca** empieza con `DELETE`.

### 4.7 Convergencia Stormlight → modelo común (fase 5, opcional, reversible)

Objetivo: que el cliente consuma **un solo** concepto `poderes` para potencias (Stormlight) y poderes de metal (Mistborn), sin perder datos.

- `CharacterPoderEntity.Arte` admite un tercer valor `potencia` (`Metal` pasa a ser el id de potencia: `adhesion`, `gravitacion`…). `Estado='completo'` ⇔ Ideal jurado ≥ 1 [inferido: «El rango 1 es gratis al jurar el Primer Ideal», `TalentLamina.tsx:110`].
- Migración de datos `UnificarPoderesStormlight`: para cada personaje con `CaminoRadiante != ''`, inserta 2 filas `potencia` (las `surges` de la orden, leídas de una tabla estática C# espejo de `radiantOrders.ts`) con `Estado = IdealesJurados >= 1 ? 'completo' : 'naciente'`, `Origen='camino'`. **No borra** `CaminoRadiante`, `IdealesJurados` ni los huecos `HabilidadPersonalizadaN` (los grados de potencia siguen ahí: `CharacterDetailPage.tsx:1265-1313`).
- Lectura dual en el cliente durante la transición: `features.poderesUnificados`. `Down` = `DELETE FROM "CharacterPoderes" WHERE "Arte"='potencia'`.
- Queda **fuera** de las fases 0-4; se incluye como T46 para que el camino esté trazado.

### 4.8 Compatibilidad con datos existentes

| Dato | Efecto de las migraciones |
|---|---|
| Campañas existentes | `RuleSet='stormlight'`, `Era=NULL`, `Mezcla=false` por `DEFAULT`; el diario sembrado con `CampaignId=1` (`20260526130330_AddDiaryEntries.cs`) queda en Stormlight |
| Personajes existentes | Columnas nuevas a `''`/`0`/`'{}'`; sin filas en `CharacterPoderes`/`Clavos`; `MapToResponse` idéntico (ver §6.6) |
| Metas existentes | `Tipo='general'`, `PoderId=NULL` |
| Catálogo | Filas actuales `stormlight`; opciones compartidas `shared`; ids 1001+ no colisionan (`lectura_delta_catalogo.md` §1.4) |
| NPC globales | `stormlight` |
| `localStorage` `cosmere-campaign` | Objetos sin `ruleSet`: selector `?? 'stormlight'` (§7.1); el siguiente `getById` lo rellena |

---

## 5. Contrato API

JSON camelCase (ASP.NET por defecto; `Program.cs:67` no lo cambia). Permisos: «GM» = `EnsureGmAsync`; «dueño o GM» = patrón de `MetaService.EnsureAccessAsync` (`MetaService.cs:85-98`). Errores: `ArgumentException` → 400 (`ExceptionMiddleware.cs:27`), en inglés como hoy (`Invalid CaminoMetal: '…'.`).

### 5.1 Campañas

```csharp
// Messages/Campaigns/In/CreateCampaignRequest.cs (clase CreateCampaignRequest)
public required string Name { get; set; }
public string RuleSet { get; set; } = RuleSetIds.Stormlight;   // opcional: clientes antiguos siguen funcionando
public short? Era { get; set; }                                // obligatorio si RuleSet == mistborn (1, 2) o null = entre eras SOLO si EntreEras == true
public bool EntreEras { get; set; } = false;                   // explícito para no confundir «sin era» con «entre eras»

// Messages/Campaigns/In/UpdateCampaignSettingsRequest.cs (nuevo)
public class UpdateCampaignSettingsRequest { public short? Era { get; set; } public bool EntreEras { get; set; } = false; }

// Messages/Campaigns/Out/CampaignResponse.cs: añadir a CampaignResponse y CampaignDetailResponse
public string RuleSet { get; set; } = RuleSetIds.Stormlight;
public short? Era { get; set; }
public bool MezclaAmbientaciones { get; set; }
```
| Verbo y ruta | Permiso | Cambio |
|---|---|---|
| `POST /campaigns` | usuario | valida `RuleSetIds.EsValido`; si `mistborn` y `Era == null && !EntreEras` → 400 `"Era is required for mistborn."`; si `stormlight` fuerza `Era = null` |
| `GET /campaigns`, `GET /campaigns/{id}`, `POST /campaigns/join` | miembro | devuelven `ruleSet`, `era`, `mezclaAmbientaciones` (`CampaignService.cs:17-33, 48-62, 115`) |
| `PATCH /campaigns/{id}/ajustes` (nuevo) | GM | solo `Era`/`EntreEras`; 400 si `ruleSet=='stormlight'` y `Era != null` |

TS: `Campaign { …; ruleSet: RuleSetId; era: 1 | 2 | null; mezclaAmbientaciones: boolean }`; `campaignsApi.create({ name, ruleSet, era, entreEras })`; `campaignsApi.updateAjustes(id, { era, entreEras })`.

### 5.2 Personaje

`CreateCharacterRequest` (`CharacterRequest.cs:3-12`): añadir `public string CaminoMetal { get; set; } = string.Empty;`.
`UpdateCharacterRequest` (`:19-98`): añadir **al final**, todas opcionales para que un cliente antiguo no pise valores (riesgo 13 de `lectura_motor_reglas_api.md`):
```csharp
public string? CaminoMetal { get; set; }
public List<string>? Bendiciones { get; set; }
public int? Alomancia { get; set; }
public int? Feruquimia { get; set; }
```
`ApplyUpdate` (`CharacterService.cs:172-199`): `if (r.CaminoMetal is not null) c.CaminoMetal = r.CaminoMetal;` etc. **Los recursos de mesa (`InvestiduraActual`, `CuentasAtium`, `Arquillas`) NO van en el PUT**: solo por `PATCH …/recursos`.

`CharacterResponse` (`CharacterResponse.cs`), añadir **después de `DesvioCalculado` y antes de `MarcosInfusas`** no: después de `Metas` para no reordenar (regla 8.2.3 del informe API):
```csharp
public string CaminoMetal { get; set; } = string.Empty;
public List<string> Bendiciones { get; set; } = [];
public int Alomancia { get; set; }
public int Feruquimia { get; set; }
public int InvestiduraActual { get; set; }
public int CuentasAtium { get; set; }
public decimal Arquillas { get; set; }
public List<CharacterPoderResponse> Poderes { get; set; } = [];
public List<ClavoHemalurgicoResponse> Clavos { get; set; } = [];
public ArtesMetalicasResponse? ArtesMetalicas { get; set; }   // null en Stormlight
```
```csharp
// Messages/Characters/Out/ArtesMetalicasResponse.cs
public class ArteDerivada { public int Grados; public string Atributo = ""; public int Modificador; public int Limite; public string Dado = ""; public int AlcanceMetros; }
public class CargasMaxPoder { public long PoderId; public string Metal = ""; public int CargasMax; }
public class ArtesMetalicasResponse
{
    public ArteDerivada? Alomancia { get; set; }
    public ArteDerivada? Feruquimia { get; set; }
    public List<CargasMaxPoder> CargasMax { get; set; } = [];
    public int? MentesALaVez { get; set; }      // feruquimista: Intelecto (mín. 1) o mod. Feruquimia con «Ancho de banda mental»; null otros
    public int ClavosMax { get; set; }          // min(rango, 3)
    public bool TieneInvestidura { get; set; }
}
```
(Propiedades con `{ get; set; }` en el código real; abreviadas aquí.)

### 5.3 Recursos y acciones de dominio (nuevos en `CharactersController`)

```csharp
// Messages/Characters/In/RecursosRequest.cs
public class RecursosRequest
{
    public int? InvestiduraActual { get; set; }
    public int? CuentasAtium { get; set; }
    public decimal? Arquillas { get; set; }
    public List<PoderRecursosRequest>? Poderes { get; set; }
}
public class PoderRecursosRequest { public long Id { get; set; } public int? Cargas { get; set; } public int? Viales { get; set; } public bool? Desprovisto { get; set; } public int? InvestiduraRemanente { get; set; } }
public class BeberVialRequest { public List<string> Metales { get; set; } = []; }
public class InicioEscenaRequest { public bool Sorprendido { get; set; } }
```
| Verbo y ruta | Permiso | Regla de servidor |
|---|---|---|
| `PATCH /campaigns/{cid}/characters/{chid}/recursos` | dueño o GM | aplica solo lo no nulo; `InvestiduraActual` se recorta a `[0, InvestiduraMax]`; `Cargas` a `[0, CargasMax]`; `Viales ≥ 0`, `CuentasAtium ≥ 0`, `Arquillas ≥ 0`. Devuelve `CharacterResponse`. |
| `POST …/acciones/beber-vial` | dueño o GM | L.129 / PDF 135: si algún metal de `Metales` corresponde a un poder alomántico del personaje → `InvestiduraActual = InvestiduraMax`; para cada poder alomántico: `Desprovisto = !Metales.Contains(Metal)` (los 8 comunes se consideran siempre incluidos [inferido de L.130 / PDF 136: «se da por supuesto que estos viales más raros también contienen metales físicos y mentales comunes»]); por cada metal raro incluido con `Viales > 0` → `Viales--`; si `Viales == 0` y es raro → 409 `"No vials of {metal} left."` salvo `ignorarViales=true`. Si no hay poder alomántico → 400. |
| `POST …/acciones/inicio-escena` | dueño o GM | `InvestiduraActual = Sorprendido ? 1 : InvestiduraMax` (L.129 / PDF 135). |
| `POST …/acciones/tragar-atium` | dueño o GM | `CuentasAtium -= 1` (mín. 0) [inferido como atajo; Tragar atium ingiere cuentas y Quemar las gasta, L.176-177 / PDF 182-183] |

### 5.4 Poderes (`API/Controllers/PoderesController.cs`, ruta `campaigns/{campaignId:long}/characters/{characterId:long}/poderes`)

```csharp
// Messages/Poderes/In
public class CreatePoderRequest { public required string Arte; public required string Metal; public string Origen = "camino"; public bool Completo = false; public bool CrearMeta = true; }
public class UpdatePoderRequest  { public string? Estado; public string? Origen; public long? MetaId; public bool? Integrada; public int? CargasMaxAjuste; public string? Notas; }
// Messages/Poderes/Out
public class CharacterPoderResponse { Id, CharacterId, Arte, Metal, Estado, Origen, MetaId, Viales, Desprovisto, InvestiduraRemanente, Cargas, CargasMaxAjuste, Integrada, Notas, CreatedAt }
```
| Verbo | Permiso | Regla |
|---|---|---|
| `GET` | dueño o GM | lista |
| `POST` | dueño o GM | valida `Arte`, `Metal` (lista de 17); 409 si ya existe `(Arte, Metal)`; `Estado = Completo || (Arte=='alomancia' && Metal=='atium') ? 'completo' : 'naciente'`; si `CrearMeta && Estado=='naciente'` crea `Meta { Titulo = Arte=='alomancia' ? "Entrenar tu poder" : "Fabricar tu mente de metal", Tipo='nacido-del-metal', PoderId }` y enlaza `MetaId`. El servidor **no** valida era ni camino (§3 D-ERA-DATA); la UI filtra. |
| `PATCH {id}` | dueño o GM | cambia estado/origen/meta/integrada/ajuste/notas |
| `DELETE {id}` | GM | borra; la meta enlazada queda con `PoderId=NULL` (SetNull) |

### 5.5 Metas (`MetasController`, sin rutas nuevas)

- `CreateMetaRequest` + `public string Tipo { get; set; } = "general"; public long? PoderId { get; set; }`.
- `MetaResponse` + `Tipo`, `PoderId`.
- `MetaService.ConcludeMetaAsync` (`MetaService.cs:53-67`): tras poner `concluida`, si `meta.PoderId != null && request.TipoConclusion == "exito"` → `poder.Estado = "completo"` (L.132-133 / PDF 138-139). Con `crecimiento`/`fracaso` no cambia el poder [inferido: el libro solo describe el éxito]. Validación `Tipo ∈ {general, nacido-del-metal, savantismo}`.

### 5.6 Clavos (`ClavosController`, ruta `…/characters/{characterId}/clavos`)

```csharp
public class CreateClavoRequest { public required string Metal; public string PoderOtorgado = ""; public bool Secreto = false; public bool CrearPoder = true; }
public class UpdateClavoRequest { public bool? Implantado; public bool? Secreto; public string? Notas; public string? PoderOtorgado; }
public class ClavoHemalurgicoResponse { Id, CharacterId, Metal, PoderOtorgado, Implantado, Secreto, Notas, CreatedAt }
```
| Verbo | Permiso | Regla |
|---|---|---|
| `POST` | **GM** (es recompensa, L.288 / PDF 294) | valida `Metal` ∈ 12 metales de clavo; 409 si `Clavos.Count(Implantado) >= min(rango,3)` y `Implantado=true` (L.289 / PDF 295); si `CrearPoder && PoderOtorgado != ''` crea el poder `Origen='clavo', Estado='completo'` (o `+1` grado en `Alomancia`/`Feruquimia` si ya existe, L.290 / PDF 296, anotado en `Notas` del clavo; el grado extra no se persiste en la columna [inferido: se calcula en `ArtesMetalicas.Grados`]) |
| `PATCH {id}`, `DELETE {id}` | GM | |

### 5.7 Catálogo y NPC

- `GET /catalog/{weapons|armor|gear}?campaignId=` y `GET /catalog/options/{category}?campaignId=`: filtro `RuleSet = set AND (Era IS NULL OR eraCampaña IS NULL OR Era = eraCampaña)`; opciones `RuleSet IN ('shared', set)`. `POST`/`DELETE`/`PUT description` exigen GM de `campaignId` (corrige `CatalogController.cs:11-13`). Respuestas + `ruleSet`, `era`, `price`, `isRewardOnly`, `category`.
- `GET /global-npcs?ruleSet=`; `POST` con `RuleSet` en el body (default `stormlight`); respuesta + `ruleSet`.

### 5.8 Validaciones por set (en `IReglasSet.ValidarIdentidad`)

| Set | Caminos heroicos | Camino especial | Ascendencias |
|---|---|---|---|
| `stormlight` | `agente, cazador, enviado, erudito, guerrero, lider` | `CaminoRadiante` ∈ 10 órdenes; `CaminoMetal == ''` | `Humano`, `Oyente` (**+ `Cantor`, `Cantora`** para resolver la inconsistencia con `FormasCantor.cs:27-28` [decisión en §12]) |
| `mistborn` | los mismos 6 | `CaminoMetal` ∈ 5 ids; `CaminoRadiante == ''` | `Humano`, `Kandra`, `Sangre koloss` |
Otras validaciones de dominio en servidor: `Bendiciones` ⊆ 5 valores y `Count ≤ 2`, solo si `Ascendencia == 'Kandra'`; `Arte`, `Metal`, `Estado`, `Origen`, `Tipo` de meta, `Metal` de clavo. **No** se valida en servidor: nivel, puntos de atributo, prerrequisitos de talentos, exclusividad de caminos NdM (va en `CaminoMetal` único por construcción), era (§3).

### 5.9 Espejo en `src/types/index.ts`

```ts
export type RuleSetId = 'stormlight' | 'mistborn'
export type Era = 1 | 2 | null
export type ArteMetal = 'alomancia' | 'feruquimia'
export type MetalId = 'hierro' | 'acero' | 'estano' | 'peltre' | 'cinc' | 'laton' | 'cobre' | 'bronce'
  | 'cromo' | 'nicrosil' | 'aluminio' | 'duraluminio' | 'cadmio' | 'bendaleo' | 'oro' | 'electro' | 'atium'
export type CaminoMetalId = 'brumoso' | 'nacido-de-la-bruma' | 'feruquimista' | 'ferrin' | 'nacidoble'
export type EstadoPoder = 'naciente' | 'completo'
export type OrigenPoder = 'camino' | 'clavo' | 'lerasium' | 'medallon' | 'dj'
export type BendicionKandra = 'consciencia' | 'potencia' | 'presencia' | 'estabilidad' | 'fortaleza'
export interface CharacterPoder { id: number; characterId: number; arte: ArteMetal; metal: MetalId; estado: EstadoPoder; origen: OrigenPoder; metaId: number | null; viales: number; desprovisto: boolean; investiduraRemanente: number; cargas: number; cargasMaxAjuste: number; integrada: boolean; notas: string; createdAt: string }
export interface ClavoHemalurgico { id: number; characterId: number; metal: string; poderOtorgado: string; implantado: boolean; secreto: boolean; notas: string; createdAt: string }
export interface ArteDerivada { grados: number; atributo: string; modificador: number; limite: number; dado: string; alcanceMetros: number }
export interface ArtesMetalicas { alomancia: ArteDerivada | null; feruquimia: ArteDerivada | null; cargasMax: { poderId: number; metal: MetalId; cargasMax: number }[]; mentesALaVez: number | null; clavosMax: number; tieneInvestidura: boolean }
// Character: + caminoMetal: string; bendiciones: BendicionKandra[]; alomancia: number; feruquimia: number; investiduraActual: number; cuentasAtium: number; arquillas: number; poderes: CharacterPoder[]; clavos: ClavoHemalurgico[]; artesMetalicas: ArtesMetalicas | null
// Campaign: + ruleSet: RuleSetId; era: Era; mezclaAmbientaciones: boolean
// Meta: + tipo: 'general' | 'nacido-del-metal' | 'savantismo'; poderId: number | null
export interface RecursosRequest { investiduraActual?: number; cuentasAtium?: number; arquillas?: number; poderes?: { id: number; cargas?: number; viales?: number; desprovisto?: boolean; investiduraRemanente?: number }[] }
export interface BeberVialRequest { metales: MetalId[]; ignorarViales?: boolean }
```
`UpdateCharacterRequest` (`types/index.ts:139-144`) debe además omitir `poderes | clavos | artesMetalicas | investiduraActual | cuentasAtium | arquillas` y hacer opcionales `caminoMetal | bendiciones | alomancia | feruquimia`. `CreateCharacterRequest` (`:138`) añade `'caminoMetal'` al `Pick`.

---

## 6. Motor de reglas en servidor

### 6.1 Parametrización por set

```csharp
// Messages/RuleSets/RuleSetIds.cs
public static class RuleSetIds { public const string Stormlight = "stormlight"; public const string Mistborn = "mistborn";
    public static readonly IReadOnlyList<string> Todos = [Stormlight, Mistborn]; public static bool EsValido(string? id) => id is not null && Todos.Contains(id); }

// Services/RuleSets/IReglasSet.cs
public interface IReglasSet
{
    string Id { get; }
    IReadOnlyDictionary<string, List<ReglaTalento>> ReglasTalentos { get; }
    void ValidarIdentidad(string caminoHeroico, string caminoRadiante, string caminoMetal, string ascendencia, IReadOnlyList<string> bendiciones, bool mezcla);
    bool TieneInvestidura(CharacterEntity c, IReadOnlyList<string> talentos);
    BonosForma BonosAtributos(CharacterEntity c, IReadOnlyList<string> talentos, out string? origen);   // reutiliza el record del WIP sin renombrar
    bool DesvioBonoSeAcumula { get; }
    IReadOnlyList<StatLinea> PenalizacionesDefensaEspiritual(CharacterEntity c);                        // clavos (Mistborn); vacío en Stormlight
    ArtesMetalicasResponse? Derivar(CharacterEntity c, IReadOnlyList<string> talentos);                 // null en Stormlight
}
public interface IReglasSetProvider { IReglasSet Obtener(string? ruleSetId); }   // null/desconocido → Stormlight
```
Registro (`Services/Bootstrap.cs:19-35`, 3 líneas): `AddSingleton<IReglasSet, StormlightReglas>()`, `AddSingleton<IReglasSet, MistbornReglas>()`, `AddSingleton<IReglasSetProvider, ReglasSetProvider>()`. Los sets son sin estado (datos puros), como `TalentosReglas` hoy.

Resolución: `CharacterService(CosmereContext db, IReglasSetProvider reglas)`; helper `ObtenerReglasAsync(campaignId)` = una consulta `db.Campaigns.AsNoTracking().Where(c => c.Id == campaignId).Select(c => new { c.RuleSet, c.MezclaAmbientaciones }).FirstOrDefaultAsync()` por método (mismo coste que `IsGmAsync`, `CharacterService.cs:157-158`). Puntos de invocación: `GetCharactersAsync :47`, `GetCharacterAsync :63`, `CreateCharacterAsync :79, :96`, `UpdateCharacterAsync :118, :122`, `AssignCharacterAsync :154` → `MapToResponse(c, set, ctx)`. `PoderService`, `ClavoService` y los endpoints de recursos reutilizan `ObtenerReglasAsync` (para `InvestiduraMax`, `CargasMax`, `ClavosMax`).

### 6.2 Fórmulas de Nacidos de la Bruma frente al motor actual

| Derivado | Stormlight (código) | Nacidos de la Bruma (libro) | Cambio |
|---|---|---|---|
| Salud máx. | tabla `BuildSaludLineas` (`CharacterService.cs:261-282`) | idéntica (L.29 / PDF 35) | ninguno; + «Resistencia koloss» `MaxSalud PorNivel 1` |
| Concentración | 2 + VOL (`:224-235`) | idéntica (L.26 / PDF 32) | ninguno |
| Defensas | 10 + attr + attr (`:212-222`) | idéntica (L.26 / PDF 32) | + líneas negativas de clavos en Defensa espiritual: −2 primer clavo de cada metal, −5 adicionales (L.290 / PDF 296); aviso `Desorientado` si total ≤ 9 y ≥1 clavo → línea `situacional` con `DescripcionCondicion` |
| Investidura máx. | gate `CaminoRadiante != ''` (`:239`; `TalentosReglas.cs:218`) | 2 + máx(DIS, PRE) + bonos, solo caminos alománticos (L.26 / PDF 32; L.129 / PDF 135) | `set.TieneInvestidura`: Stormlight = `CaminoRadiante != ''`; Mistborn = `CaminoMetal ∈ {brumoso, nacido-de-la-bruma, nacidoble}` **o** algún poder `alomancia` (clavo/lerasium dan Investidura, L.290 / PDF 296; L.295 / PDF 301). Con `mezcla`, OR de ambos. |
| Movimiento | `MovimientoBase` (`TalentosReglas.cs:264-272`) | idéntico (L.51 / PDF 57) | ninguno |
| Desvío | WIP `BuildDesvioLineas` (`:288-301`), forma: «mayor» | Bendición de la Fortaleza +1 (L.35 / PDF 41) | `DesvioBonoSeAcumula`: Stormlight `false` (formas), Mistborn `true` [inferido] |
| Rango | `Rango()` clamp 1-5 | igual (L.27 / PDF 33) | ninguno |
| Bonos de atributo | `FormasCantor.BonosActivos` (WIP) | Bendiciones (+2 DIS / +1 FUE y VEL / +1 INT y PRE / +2 VOL), «Tamaño desmedido» +1 FUE (L.38-39 / PDF 44-45), clavos de atributo +1 (L.291 / PDF 297), «Guardián del conocimiento» +2 INT (L.229 / PDF 235) | `BonosAtributos` del set devuelve `BonosForma` con esas sumas y `origen` = «Bendiciones y clavos» |
| Artes metálicas | no existe | tabla L.163 / PDF 169 | `Derivar` (§6.3) |

### 6.3 `Derivar` (clase estática `Services/RuleSets/ArtesMetalicas.cs`, tablas puras)

```csharp
public static (int limite, string dado, int alcance) Progresion(int grados, int rango) => grados switch
{ <= 0 => (1, "1", 3), 1 => (1, "d4", 6), 2 => (2, "d6", 12), 3 => (3, "d8", 24), 4 => (4, "d10", 48), 5 => (5, "d12", 96), _ => (rango, "d20", 192) };
```
- `gradosEfectivos(arte) = c.Alomancia|c.Feruquimia + nº de clavos implantados cuyo PoderOtorgado sea un poder ya poseído de ese arte` (L.290 / PDF 296) [inferido el cómputo].
- `Modificador = grados + (arte == alomancia ? c.Voluntad : c.Intelecto)` (L.128 / PDF 134), con bonos de atributo del set.
- `Limite` con «Portentoso» (+1 grado efectivo **solo** para alcance, L.136 / PDF 142): `alcance = Progresion(grados+1).alcance`.
- `CargasMax(poder) = 2 + gradosFeruquimia + (talentos ∋ "Mentes de metal ampliadas" ? rango : 0) + (poder.Metal=='cobre' && talentos ∋ "Guardián del conocimiento" ? 5 : 0) + poder.CargasMaxAjuste` (L.131 / PDF 137; L.146 / PDF 152; L.229 / PDF 235; L.155 / PDF 161).
- `MentesALaVez = CaminoMetal=='feruquimista' ? (talentos ∋ "Ancho de banda mental" ? Modificador(feruquimia) : Math.Max(1, c.Intelecto)) : null` (L.131 / PDF 137; L.146 / PDF 152).
- `ClavosMax = Math.Min(Rango(level), 3)` (L.289 / PDF 295).
- Se devuelve `ArtesMetalicasResponse` solo si `CaminoMetal != '' || Poderes.Count > 0`; si no, `null`.

### 6.4 Reglas de talentos (registro por set)

`MistbornReglas.ReglasTalentos` = núcleo común (Compostura, Robusto, Serenidad, Paso firme, Investido: `TalentosReglas.cs:60-113`, verificados en L.80, 81, 89, 90, 136 / PDF 86, 87, 95, 96, 142) **+** `["Resistencia koloss"] = MaxSalud PorNivel 1` **−** «Vestimenta tradicional», «Movimiento sin fricción», «Posición de la enredadera», «Posición de la sangre», «Parada de tensión», «Réplica fulminante» y «Mente ambiciosa» salvo que se verifique que existen en Nacidos de la Bruma [inferido; pendiente de comparar talento a talento]. Ningún talento de los árboles de metal modifica estadísticas permanentes (`lectura_alomancia_inventario.md` §0); «Guardián del conocimiento» se trata en `BonosAtributos` y `CargasMax`.

Cambios aditivos en `TalentosReglas.cs`: `Calcular(…, IReadOnlyDictionary<string, List<ReglaTalento>>? reglas = null, bool? tieneInvestidura = null)` al final de la firma (`:170-177`); `foreach (var (nombre, rs) in reglas ?? Reglas)` (`:182`); `EsActiva` usa `tieneInvestidura ?? !string.IsNullOrEmpty(c.CaminoRadiante)` (`:218`); `GradosDe` (`:240-261`) añade `"Alomancia" => c.Alomancia, "Feruquimia" => c.Feruquimia` y, en `_`, búsqueda por nombre en `HabilidadPersonalizada1..6`.

### 6.5 Metas de nacido del metal y Desprovisto en el servidor

- Meta: §5.5 (concluir con éxito → `completo`).
- Desprovisto: estado por poder; `beber-vial` lo pone/quita (§5.3); `MapToResponse` no lo altera. «Trazas de metal» (usar naciente estando Desprovisto, L.136 / PDF 142) es informativo para el cliente, no cambia el estado.
- Inicio de escena: `inicio-escena` (§5.3). Nada se automatiza por tiempo.

### 6.6 Convivencia con el WIP de formas de cantor

| Regla | Aplicación |
|---|---|
| No tocar `FormasCantor.cs`, `BonosForma`, `Build*Lineas` del WIP | `StormlightReglas.BonosAtributos` = `FormasCantor.BonosActivos(c.Ascendencia, talentos)`; `origen = FormasCantor.FormaActiva(...)` si `EsCantor` |
| Cambios en `Calcular`/`EsActiva`/`MapToResponse` solo con parámetros opcionales al final | §6.4; `MapToResponse(CharacterEntity c, IReglasSet set, ContextoJuego? ctx = null)` es la única firma que cambia y se hace en la tarea T10 tras commitear el WIP (T00) |
| `CharacterResponse`: propiedades nuevas después de `Metas`, sin reordenar | §5.2 |
| Comportamiento de referencia = WIP, no HEAD | El JSON de referencia de T09 se captura con el WIP compilando |
| Golden test | Antes de T10, guardar `GET /campaigns/{id}/characters` de 3-4 personajes reales (con forma, armadura, talentos) y comparar byte a byte después (riesgo 2 del informe API) |

---

## 7. Frontend

### 7.1 Store, tipos, hidratación

- `campaignStore.ts`: añadir selectores sin cambiar el shape persistido: `export const useRuleSet = () => useCampaignStore(s => s.currentCampaign?.ruleSet ?? 'stormlight')`, `useEra = () => useCampaignStore(s => s.currentCampaign?.era ?? null)`, `useRuleSetUi = () => RULESETS[useRuleSet()]`.
- `AppLayout.tsx:13-17`: gate `ready = currentCampaign?.id === Number(campaignId)`; `useQuery(['campaign', id])` compartido con `CampaignSettingsPage` (`:28`); `useLayoutEffect` que fija `document.documentElement.dataset.ruleset` cuando `ready` y lo borra al desmontar; `<Outlet/>` y `<DiceRoller/>` solo si `ready`; error con `ErrorMessage` + `Button` «Reintentar».
- `index.html:18-26`: segundo script previo a la pintura que lee `localStorage['cosmere-campaign']`, compara `state.currentCampaign.id` con `/^\/campaigns\/(\d+)/` y pone `data-ruleset` (try/catch).
- `themeStore.ts:12-32`: `THEME_BG` por set (`stormlight`: actuales; `mistborn`: `#ebe8e6`/`#0c0b0d`, `lectura_superficie_ui.md` §6.3) y `applyTheme(mode, ruleSet = document.documentElement.dataset.ruleset ?? 'stormlight')`.

### 7.2 Módulo `src/rulesets/`

```ts
// src/rulesets/types.ts
export interface SkillDef { field: SkillField; label: string; atributo: AtributoField; codigo: 'FUE'|'VEL'|'INT'|'VOL'|'DIS'|'PRE'; columna: 'fisico'|'cognitivo'|'espiritual' }
export interface RuleSetUi {
  id: RuleSetId; name: string; shortName: string; emblemIcon: string; worldName: string   // 'Roshar' | 'Scadrial'
  features: { caminoRadiante: boolean; idealesJurados: boolean; marcos: boolean; formasCantor: boolean; potencias: boolean
              caminoMetal: boolean; artesMetalicas: boolean; viales: boolean; arquillas: boolean; mencionSpren: boolean; pestanaAventura: boolean; eras: boolean }
  ascendencias: { id: string; label: string; eras?: Era[]; puntosAtributo: number; icon: LucideIcon }[]
  skills: SkillDef[]                                     // 18 + (mistborn) Alomancia (VOL), Feruquimia (INT) como «investidas»
  capacidadCargaKg: readonly number[]                    // 6 tramos; ST 22,5… / NB 25…
  currency: { symbol: 'mc' | 'ar'; image: string; decimals: 0 | 2 }
  encyclopedia: TopicDef[]
  themeBg: { light: string; dark: string }
  talentos: ReglasSetTalentos                             // §7.6
  overlays: { aventuras: AventurasOverlay; combat: CombatOverlay }
}
```
`src/rulesets/stormlight.ts` importa de los `src/data/*.ts` actuales (sin moverlos); `src/rulesets/mistborn.ts` de `src/data/mistborn/*`. `src/rulesets/index.ts`: `export const RULESETS: Record<RuleSetId, RuleSetUi>` y helpers `isAvailableInEra(item: { eras?: Era[] }, era: Era)`.

### 7.3 Rutas y navegación

- `App.tsx:46-66`: rutas nuevas `encyclopedia/origenes`, `encyclopedia/nacidos-del-metal`, `encyclopedia/artes-metalicas`, `encyclopedia/artes-metalicas/:arte/:metal`, `encyclopedia/conversaciones`, `encyclopedia/empenos`, `encyclopedia/dado-de-trama` (las tres últimas compartidas, `lectura_delta_reglas_base.md` §7). Componente `RuleSetGate` que redirige a `../encyclopedia` si la ruta pertenece a otro set.
- `Sidebar.tsx:29-45`: sin cambios de estructura; `RuleSetBadge` (set + era) bajo el nombre de campaña (`:153-168`), en la barra móvil (`:353-357`) y en `HomeCampaignPage.tsx:47-57`.
- `GmPage.tsx:8-12`: la pestaña «Aventura» solo si `features.pestanaAventura`.

### 7.4 Creación de campaña (`CampaignListPage.tsx`)

`Sheet` «Nueva campaña» (sustituye a `InlineForm` de creación, `:16-91, 222-235`; `InlineForm` queda para «Unirse») según `lectura_superficie_ui.md` §4.2: `Field` nombre (`data-autofocus`), `Segmented` Ambientación (`Tormentas` | `Bruma`, `ariaLabel` completos, iconos `CosmereIcon archivo-tormentas` / `nacidos-bruma-emblem`), vista previa `aria-live="polite"`, `Segmented` Era (`Era 1` | `Era 2` | `Entre eras`) solo en Bruma con texto de ayuda («Era 1: El Mundo de Ceniza. El libro advierte de un tono más sombrío», L.372 / PDF 378), aviso topacio «La ambientación no se puede cambiar después», botones `Cancelar`/`Crear campaña` (`disabled` si falta nombre o era). `createMutation` (`:131-138`) envía `{ name, ruleSet, era, entreEras }`. Tarjeta (`:343-478`): chip del set y chip «ERA 1»/«ERA 2»/«ENTRE ERAS» (`tone.granate` / `tone.zafiro` [inferido]). Ajustes (`CampaignSettingsPage.tsx`): sección «Ambientación» con set en solo lectura y era editable por el GM (`Segmented` + `ConfirmDialog`).

### 7.5 Ficha (`CharacterDetailPage.tsx`; líneas móviles por el WIP: anclar por texto)

| Zona | Cambio |
|---|---|
| Identidad (`IdentityItem` «Ascendencia», «Camino», «Orden») | tercera ficha por set: «Orden» (ST) o «Camino de nacido del metal» (NB) con icono Lucide del camino; ascendencias de `ruleSetUi.ascendencias` filtradas por era |
| Picker de camino de nacido del metal (nuevo, `Sheet`) | 5 caminos filtrados por era (L.372 / PDF 378), excluyentes; al elegir: guarda `caminoMetal`, añade el talento principal a `talentos`, pone `alomancia`/`feruquimia` a 1 (L.128 / PDF 134; nacidoble ambas; +1 extra si es camino inicial para brumoso/ferrin, L.19 / PDF 25), abre el selector de metal(es) (§7.7) y crea poderes + metas con `poderesApi.create`. Cambiar de camino: `ConfirmDialog` que explica que se borrarán poderes y talentos del camino anterior |
| Estadísticas: Investidura | `tieneInvestidura` de `artesMetalicas` (NB) o `!!caminoRadiante` (ST); en NB muestra **actual / máx.** con `Stepper` (PATCH recursos) y botones «Beber vial» (abre `Sheet` con los metales raros disponibles; comunes implícitos) e «Inicio de escena»; texto sin camino: «Solo disponible para alomantes» |
| Puntos de atributo (`getPuntosAtributoEsperados`) | base `ruleSetUi.ascendencias[x].puntosAtributo` (12 / 6 kandra, L.34 / PDF 40); tope `max` 5 salvo koloss FUE 6 y Bendiciones (líneas del desglose lo muestran) |
| Habilidades (`SECTIONS`) | tabla única `ruleSetUi.skills` (etiquetas del libro: «Armamento ligero», «Armamento pesado», «Saber»; Atletismo FUE; Intimidación VOL); en NB dos filas «investidas» Alomancia (VOL) y Feruquimia (INT) ligadas a `character.alomancia/feruquimia`, visibles solo si `caminoMetal != '' || poderes.length` |
| Botón «Forma» (`isCantor`) | solo si `features.formasCantor` |
| Pestaña nueva «Artes metálicas» (`Tabs` `:443-449`) | §7.8 |
| Bolsa (`BolsaDetailPage.tsx`) | sección «Marcos» (`:332-429`) ⇄ «Arquillas» (`Stepper` con 2 decimales, PATCH recursos) según `features.arquillas`; `getCapacity` (`:233-241`) ← `capacidadCargaKg`; precios `ar`; cuentas de atium y viales por metal en una tarjeta «Metales» (PATCH recursos) |

### 7.6 Talentos: integración con `talentGraph.ts` y `talentMap.ts`

`ReglasSetTalentos` (propuesto en `lectura_motor_talentos_web.md` §6) se pasa a `buildTalentGraph`, `parsePrereq`, `catalog()`, `talentSlotsAt`, `talentBudget` como primer parámetro con `stormlight` por defecto (sin cambio de comportamiento):
```ts
export interface ReglasSetTalentos { id: RuleSetId; caminosHeroicos: HeroicPath[]; caminosEspeciales: (RadiantOrder | CaminoNacidoDelMetal)[]; poderes: (Potencia | PoderMetal)[]; arbolesAscendencia: ArbolAscendencia[]; grids: Record<string, TalentGrid>; summaries: Record<string, string>; skillNameMap: Record<string, SkillField | 'alomancia' | 'feruquimia'>; nombresIdeales: readonly string[] | null }
```
Cambios del motor (todos aditivos; detalle en `lectura_motor_talentos_web.md` §5.4):
1. Cláusula `poder` (`^(?:poder\s+)?(alomancia|feruquimia) de (.+)$`): `met` si `state.poderes` contiene `${arte}:${metal}` con `completo`; sin nodo (no consume hueco).
2. `SKILL_NAME_MAP` + «Armamento ligero/pesado»; `skillValue` lee `alomancia`/`feruquimia` de `Character` directamente.
3. Cláusula `skillAny` («Armamento pesado 2 o más o Armamento ligero 2 o más»).
4. Cláusula `atributo` («Voluntad 4 o más»; `TalentState.atributos`).
5. `ancestry` genérica (`humana`, `sangre koloss`, `kandra`, `cantor`).
6. Cláusula `exclusivo` («no tener ningún otro talento de ruptura o herencia»): `met` si ningún otro principal NdM está en `learned`.
7. Cláusula `eleccionPoderes` (`mismoMetal` | `metalesDistintos`) sobre `state.poderes` del nacidoble.
8. `TreeKind += 'nacidoMetal' | 'poderMetal' | 'ascendencia'`; `TalentGraphOptions += caminoMetal, poderes, ascendenciaArbol`; bloque nuevo en `buildTalentGraph` entre L.470 y L.500: raíz (clave = principal, `autoGranted` si camino inicial) + árbol plano del camino + un árbol por poder **completo o naciente** (naciente: nodos `locked` por la cláusula `poder`).
9. `SlotKind += 'nacidoMetal' | 'poder' | 'ascendencia'`; `slotKindOf` deja de caer en `'radiante'`; huecos: nivel normal acepta todo; ascendencia humana solo `heroico` (L.33 / PDF 39); kandra `['ascendencia','heroico']`, koloss ídem; camino inicial NdM acepta `principal` [inferido].
10. `gateBadge` `'meta'` con copy «Meta de nacido del metal pendiente».
Mapa: `gridKeyOf` + `metal:<arte>:<metal>`, `nacidoMetal:<camino>`, `ascendencia:<id>`; `PlateKind += 'poder' | 'camino-metal' | 'ascendencia'`; `PathAtlas` muestra las láminas de los poderes del personaje y pliega el resto en «Otros poderes» (patrón `showOthers`), con filas de 3 (`mapDims`) y `caretX` por fila; icono de lámina de poder = glifo del metal. `TalentosDetailPage`: `IdealesControl`, formas y orden solo con `features`; texto vacío «Asigna un camino heroico o un camino de nacido del metal en la ficha».

### 7.7 Selector de metal (componente nuevo `components/metales/MetalPicker.tsx`)

`Sheet` con cuadrícula 4×4 + atium (glifo, nombre, categoría, puro/aleación, pareja, nombre de brumoso/ferrin, era), filtrada por `era` y por camino (`PoderMetal.caminos`, `eras`); selección simple (brumoso, ferrin), pareja Empujón/Tirón (nacido de la bruma: todos nacientes + pareja para la meta, L.141 / PDF 147), puro + aleación o atium (feruquimista, L.146 / PDF 152), uno de cada arte (nacidoble, mismo o distinto metal, L.155 / PDF 161). Botón «Confirmar» crea los poderes (y metas) por API. Sin emojis; glifos oficiales (§7.11).

### 7.8 Hoja de artes metálicas (pestaña «Artes metálicas» de la ficha)

Reproduce PDF 410: dos `StatTile` cabecera por arte (**MOD. / ALCANCE / DADO** de `artesMetalicas.alomancia|feruquimia`, más «Límite» y «Investidura actual/máx.» o «Mentes a la vez»); lista sin tope de tarjetas de poder (`Card`): glifo + «Alomancia de acero», chip `naciente`/`completo`, `Switch` «Meta completada» (solo GM; enlaza a la meta si `metaId`), efecto (de datos estáticos), **acciones del poder** (Quemar acero (1), Empujón de acero (1) / Almacenar, Decantar, con `TalentActivation`), contador de **cargas** `Stepper` 0..`cargasMax` (feruquimia) o **viales** `Stepper` (alomancia rara) y toggle **Desprovisto** (PATCH recursos), talentos del poder aprendidos (`TALENT_SUMMARIES`). Sección «Clavos hemalúrgicos» (GM: alta con `Sheet`; `ConfirmDialog` para extraer/borrar) con aviso «Defensa espiritual ≤ 9: Desorientado al inicio de escena» (L.290 / PDF 296). Sección «Bendiciones» (kandra). Estado vacío (`EmptyState`) si no hay camino de nacido del metal.

### 7.9 Dados (`DiceRoller.tsx`)

- `SKILLS`/`SKILL_TO_FIELDS` (`:25-55`) ← `ruleSetUi.skills` (una tabla); `getCharSkills` añade Alomancia/Feruquimia desde `character.alomancia/feruquimia` con VOL/INT (adaptador, sin tocar `habilidadPersonalizadaN`).
- Combate `WEAPON_SKILLS` (`:1012`): + «Alomancia» si `artesMetalicas?.alomancia` (Lanzar una moneda vs Defensa física, L.172 / PDF 178); dado de daño por defecto = `artesMetalicas.alomancia.dado`.
- Recuperación: nota en NB «La Investidura solo se repone con Beber vial» (L.129 / PDF 135).
- Dado de trama d12 → d6 (`utils/dice.ts:81-90, 137-147`): **deuda previa**, tarea independiente (T45), no del set.

### 7.10 Enciclopedia, catálogo, NPC

- `EncyclopediaPage.tsx:109-197` `TOPICS` ← `ruleSetUi.encyclopedia`; NB: Orígenes, Caminos heroicos, Caminos de nacido del metal, Artes metálicas, Combate, Aventuras, Conversaciones, Empeños, Dado de trama, Catálogo. Subtítulos con `worldName`.
- Páginas nuevas: `OrigenesPage` (ascendencias, Bendiciones, culturas por era), `NacidosDelMetalPage` (5 caminos con árbol y tabla d20), `ArtesMetalicasPage` (tabla de metales + progresión L.163 + hemalurgia como texto) y `PoderMetalPage` (entrada completa de un poder), `ConversacionesPage`, `EmpenosPage`, `DadoTramaPage`.
- `AventurasPage`/`CombatPage`: datos por `resolveAventuras(ruleSetUi)`/`resolveCombat(...)`; subtítulo `CombatPage.tsx:68` parametrizado.
- Catálogo: `catalogApi.*(campaignId)`, claves `['catalog', cId, …]`, precio `ar` con imagen `dinero-era1/2`, chips Era, viales agrupados, picker con búsqueda. NPC: `globalNpcsApi.getAll(ruleSet)`, clave `['global-npcs', ruleSet]`.

### 7.11 Tema e iconos

- Tokens: §3(i) y `lectura_superficie_ui.md` §6.3 (paleta propuesta, contraste calculado ≥ 4,5:1; re-verificar en pantalla).
- Activos oficiales a extraer (PyMuPDF + fontTools, procedimiento en `lectura_superficie_ui.md` §7.3): `alomancia-era1-<metal>.svg` (29 glifos), `alomancia-era2-<metal>.svg` (25), `feruquimia-<metal>.svg` (trazados PDF 411), `nacidos-bruma-emblem.svg` (PDF 410), `img/dinero-era1.webp`, `img/dinero-era2.webp` (PDF 260). Componente `MetalIcon metal era arte` en `components/GameIcons.tsx`. Lucide para caminos NdM, ascendencias, Investidura (`Flame`), viales (`FlaskConical`), arquillas (`Coins` si falta la imagen). Nunca emojis.

### 7.12 Restricciones transversales (DESIGN.md)

Solo tokens y `tone.*`/`ink()`/`tint()`; `Sheet`/`ConfirmDialog` para overlays; `Segmented` para elección única; `Tabs` WAI-ARIA; targets ≥ 44 px; `h1→h2→h3`; `maxWidth: 680`; estilos inline; sin Tailwind; `npx tsc -b` limpio; toda eliminación con `ConfirmDialog`.

---

## 8. Datos estáticos de Nacidos de la Bruma (`src/data/mistborn/`)

Carpeta nueva; los ficheros de Stormlight **no se mueven** (sin romper imports). `src/rulesets/stormlight.ts` y `mistborn.ts` son los únicos que importan datos.

| Fichero | Export (tipo) | Contenido | Páginas | Volumen |
|---|---|---|---|---|
| `metales.ts` | `METALES: MetalDef[]`, `MetalDef`, `MetalId`, `PROGRESION_ARTES_METALICAS` | 17 metales: categorías alománticas/feruquímicas, puro/aleación, pareja, nombres de brumoso y ferrin, efecto, rasgo almacenado, eras, rareza, letra del alfabeto; tabla L.163 | L.163, 167-171 / PDF 169, 173-177; L.405 / PDF 411 | ~220 líneas |
| `alomancia.ts` | `PODERES_ALOMANTICOS: PoderMetal[]` | 17 entradas (acciones básicas, usos creativos, caminos que desbloquean, `talentos: Talento[]` 83 entradas con `prereq` literal) | L.172-212 / PDF 178-218 | ~1100 líneas |
| `feruquimia.ts` | `PODERES_FERUQUIMICOS: PoderMetal[]` | 17 entradas (Almacenar/Decantar, efectos ◆, tabla de cobre, medallón, 85 talentos) | L.213-250 / PDF 219-256 | ~1200 líneas |
| `caminosNacidoDelMetal.ts` | `CAMINOS_NACIDO_DEL_METAL: CaminoNacidoDelMetal[]` | 5 caminos: principal, concesiones, metas iniciales, poderes, habilidad inicial, árbol (5/6/6/5/11), tabla d20 de descubrimiento, colores hex | L.127-159 / PDF 133-165 | ~450 líneas |
| `hemalurgia.ts` | `TIPOS_CLAVO: TipoClavo[]`, `HEMALURGIA_REGLAS` | 12 clavos, rangos, efectos, implantar/extraer, penalizaciones, lerasium | L.251 / PDF 257; L.288-295 / PDF 294-301 | ~120 líneas |
| `ascendencias.ts` | `ASCENDENCIAS_MISTBORN`, `BENDICIONES`, `ARBOL_KANDRA`, `ARBOL_SANGRE_KOLOSS` | 3 ascendencias, 5 Bendiciones, árboles (8 y 5 talentos) | L.32-39 / PDF 38-45 | ~220 líneas |
| `culturas.ts` | `CULTURAS: PericiaCultural[]` | 15 pericias culturales con era | L.40-47 / PDF 46-53 | ~120 líneas |
| `especialidadesHeroicas.ts` | `ESPECIALIDADES_MISTBORN: Record<HeroicPathId, HeroicPathSpecialty[]>` | 8 especialidades nuevas (Rebelde, Mataneblinos, Francotirador, Estafador, Inventor, Alborotador, Pistolero, Planificador) con sus talentos; las comunes se reutilizan de `heroicPaths.ts` | L.73-126 / PDF 79-132 | ~500 líneas |
| `talentGrids.ts` | `TALENT_GRIDS_MISTBORN: Record<string, TalentGrid>` | rejillas `metal:*`, `nacidoMetal:*`, `ascendencia:*`, `heroico:*` nuevas; **geometría del PDF renderizado** (no está en el texto) | diagramas L.137, 143, 147, 151, 157, árboles cap. 6 | ~600 líneas |
| `talentSummaries.ts` | `TALENT_SUMMARIES_MISTBORN` | línea de diagrama por talento | cap. 5-6 | ~250 líneas |
| `equipoInicial.ts` | `EQUIPO_INICIAL: PaqueteInicial[]` | 7 paquetes con dados y beneficios | L.254-255 / PDF 260-261 | ~120 líneas |
| `viajes.ts` | `ALOJAMIENTO`, `MONTURAS`, `VEHICULOS` | tablas de viaje | L.272 / PDF 278 | ~50 líneas |
| `eras.ts` | `ERAS: EraDef[]` | nombre, descripción, aviso de tono, qué cambia | L.371-372 / PDF 377-378 | ~60 líneas |
| `overlays.ts` | `AVENTURAS_OVERLAY_MISTBORN`, `COMBAT_OVERLAY_MISTBORN` | 23 operaciones (`lectura_delta_reglas_base.md` §6.2) | cap. 9-10 | ~200 líneas |
| `conversaciones.ts`, `empenos.ts`, `dadoTrama.ts` (en `src/data/`, compartidos con overlay) | datos base de los capítulos 11, 12 e intro | compartidos | L.331-351 / PDF 337-357; L.9-12 / PDF 15-18 | ~500 líneas |

Tipos nuevos en `src/data/mistborn/types.ts` (molde compatible con `Talento`/`Potencia` de `potencias.ts:3-27`): `PoderMetal extends Omit<Potencia,'ordenes'> { arte; metal; caminos: CaminoMetalId[]; porClavo; eras; requiereMeta; sinArbol?; acciones: AccionPoder[] }`, `CaminoNacidoDelMetal`, `MetalDef`, `TipoClavo`, `PaqueteInicial`. Bundle: ~5000 líneas de datos ≈ 350-450 kB sin minificar; cargar `src/rulesets/mistborn.ts` con `import()` dinámico (lazy) para que una campaña Stormlight no lo descargue (§11).

---

## 9. Plan de implementación por fases y tareas

Formato: **id · título · fase · deps · repo · archivos · cambios · libro · aceptación · verificación · tamaño · fuera de alcance**. Comandos: web `cd cosmere-web && npx tsc -b`; API `cd cosmere-api && dotnet build`; migraciones **con la API parada** `dotnet ef migrations add <Nombre> --project Infrastructure --startup-project API && dotnet ef database update --project Infrastructure --startup-project API`.

### Fase 0 — Cimientos (sin cambio de comportamiento)

**T00 · Estabilizar el WIP de formas de cantor** · F0 · deps — · api · `Services/Characters/CharacterService.cs`, `TalentosReglas.cs`, `FormasCantor.cs`, `Messages/Characters/Out/CharacterResponse.cs` · No es trabajo de este proyecto: Xavi commitea o descarta el WIP. Hasta entonces las tareas T10-T13 no empiezan. · Aceptación: `git status` limpio en esos 4 ficheros; `dotnet build` OK · S · Fuera: cualquier cambio funcional.

**T01 · `RuleSetIds` y columnas de campaña** · F0 · T00 · api · `Messages/RuleSets/RuleSetIds.cs` (nuevo, §6.1), `Messages/Database/Entities/CampaignEntity.cs` (+3 propiedades §4.1), migración `AddRuleSetToCampaigns` · SQL §4.1 · Aceptación: migración aplicada; `SELECT "RuleSet","Era" FROM "Campaigns"` devuelve `stormlight`/NULL en todas; `dotnet build` OK · S · Fuera: DTOs.

**T02 · Contrato de campaña (`ruleSet`, `era`) y endpoint de ajustes** · F0 · T01 · api · `Messages/Campaigns/In/CreateCampaignRequest.cs`, `In/UpdateCampaignSettingsRequest.cs` (nuevo), `Out/CampaignResponse.cs`, `Services/Campaigns/ICampaignService.cs`, `CampaignService.cs:17-33, 48-62, 65-72, 115`, `API/Controllers/CampaignsController.cs` (+`PATCH {campaignId}/ajustes`) · Reglas §5.1 · Aceptación: `POST /campaigns {name}` sigue creando Stormlight; `POST {name, ruleSet:'mistborn'}` sin era → 400; con `era:2` → 200 y `GET` devuelve `ruleSet:'mistborn', era:2`; `PATCH ajustes` por no-GM → 403 · S.

**T03 · Tipos TS y selectores de set** · F0 · T02 · web · `src/types/index.ts` (`RuleSetId`, `Era`, campos de `Campaign`), `src/api/campaigns.ts` (`create({name, ruleSet, era, entreEras})`, `updateAjustes`), `src/store/campaignStore.ts` (`useRuleSet`, `useEra`) · Aceptación: `npx tsc -b` limpio; `useRuleSet()` devuelve `'stormlight'` con un objeto persistido antiguo sin `ruleSet` (probar borrando el campo en localStorage) · S.

**T04 · Módulo `src/rulesets/` con Stormlight como único set** · F0 · T03 · web · `src/rulesets/types.ts`, `index.ts`, `stormlight.ts` (§7.2; `features` todas `true` para ST salvo las NB; `skills` con etiquetas del libro de Tormentas: «Armamento ligero/pesado», «Saber», Atletismo FUE, Intimidación VOL; `capacidadCargaKg` 22,5…; `currency mc`; `encyclopedia` = `TOPICS` actuales) · Fuente ST: `ch3_chars.txt` · Aceptación: ningún componente lo consume aún; `tsc` limpio · M · Fuera: consumo en pantallas (T20+).

**T05 · Gate de hidratación, `data-ruleset` y script previo** · F0 · T03 · web · `src/components/AppLayout.tsx:13-17`, `index.html:18-26`, `src/store/themeStore.ts:12-32`, `src/pages/campaigns/CampaignSettingsPage.tsx:28` (compartir `['campaign', id]`) · §7.1 · Aceptación: con una campaña A persistida, abrir por URL `/campaigns/B/home` muestra `Spinner` y nunca la vista de A; `document.documentElement.dataset.ruleset` vale `stormlight` dentro de la campaña y no existe en `/campaigns`; fallo de red → `ErrorMessage` con «Reintentar» · M.

**T06 · Columnas de personaje NdM** · F0 · T01 · api · `Messages/Database/Entities/CharacterEntity.cs` (+7 propiedades §4.2), `Infrastructure/Data/CosmereContext.cs` (`HasPrecision(10,2)`), migración `AddNacidoDelMetalToCharacters` · Aceptación: migración aplicada; personajes existentes con `CaminoMetal=''`, `Arquillas=0`; `dotnet build` OK · S.

**T07 · Tablas `CharacterPoderes` y `ClavosHemalurgicos`, campos de `Metas`** · F0 · T06 · api · `CharacterPoderEntity.cs`, `ClavoHemalurgicoEntity.cs` (nuevos §4.3-4.4), `MetaEntity.cs` (+`Tipo`, `PoderId`, `Poder`), `CosmereContext.cs` (DbSets `CharacterPoderes`, `ClavosHemalurgicos`; FKs cascade; `MetaId` SetNull; índice único `(CharacterId, Arte, Metal)`), migración `AddCharacterPoderesYClavos` · Aceptación: migración aplicada; `\d "CharacterPoderes"` muestra el índice único; borrar una meta deja `PoderId` NULL en el poder (probar en SQL) · M.

**T08 · DTOs de personaje, poderes, clavos y recursos** · F0 · T07 · api · `Messages/Characters/In/CharacterRequest.cs` (`CaminoMetal` en create; 4 opcionales al final del update), `In/RecursosRequest.cs`, `Out/CharacterResponse.cs` (10 propiedades tras `Metas`), `Out/ArtesMetalicasResponse.cs`, `Messages/Poderes/In|Out/*.cs`, `Messages/Clavos/In|Out/*.cs`, `Messages/Metas/In/*.cs`, `Out/MetaResponse.cs` · §5.2-5.6 · Aceptación: `dotnet build` OK; `CharacterResponse` conserva el orden de propiedades existentes · S.

**T09 · JSON de referencia (golden) de Tormentas** · F0 · T00 · api · `cosmere-api/Resources/golden/*.json` (gitignored o en scratchpad) · Guardar `GET /campaigns/{id}/characters` de 3-4 personajes reales (uno cantor con forma, uno con armadura y «Vestimenta tradicional», uno radiante con «Investido») · Aceptación: ficheros guardados con fecha; script `diff` documentado en el README del directorio · S · Fuera: tests automatizados (no hay proyecto de tests).

### Fase 1 — Motor por set en el servidor

**T10 · `IReglasSet`, `StormlightReglas`, provider y DI** · F1 · T08, T09 · api · `Services/RuleSets/IReglasSet.cs`, `IReglasSetProvider.cs`, `ReglasSetProvider.cs`, `StormlightReglas.cs`, `Services/Bootstrap.cs:19-35` (+3 `AddSingleton`), `CharacterService.cs:10` (ctor), `:12-33` (borrar los 3 `HashSet` y `ValidateCaminos`; mover a `StormlightReglas`), `:35-155` (resolver `set` y pasarlo), `:237-253` (`BuildInvLineas` recibe `bool tieneInvestidura`), `:310` (`MapToResponse(c, set, ctx)`), `TalentosReglas.cs:170-177, 182, 218, 240-261` (parámetros opcionales §6.4) · Aceptación: **diff byte a byte** con los JSON de T09 = vacío; `dotnet build` OK; `ValidarIdentidad` de Stormlight acepta además `Cantor`/`Cantora` (ver §12 Q7; si Xavi dice no, dejar `Humano`/`Oyente`) · L · Fuera: Mistborn.

**T11 · `MistbornReglas` y `ArtesMetalicas`** · F1 · T10 · api · `Services/RuleSets/MistbornReglas.cs`, `ArtesMetalicas.cs` (§6.2-6.4) · L.26 / PDF 32 (Investidura), L.163 / PDF 169 (progresión), L.131 / PDF 137 (cargas), L.146 / PDF 152, L.229 / PDF 235, L.155 / PDF 161, L.289-291 / PDF 295-297 (clavos), L.34-35 / PDF 40-41 (Bendiciones), L.38-39 / PDF 44-45 (koloss) · Aceptación (con una campaña `mistborn` de prueba): personaje `CaminoMetal='brumoso'`, DIS 2, PRE 3, talentos `["Ruptura de brumoso","Investido"]`, nivel 7 → `investidura.total = 7` (2+3+2); `CaminoMetal=''` → `investidura.total = 0` y `artesMetalicas = null`; `Alomancia=3` → `artesMetalicas.alomancia = {limite:3, dado:'d8', alcanceMetros:24, modificador: 3+VOL}`; un clavo de hierro → `defensaEspiritual` tiene línea «Clavo de hierro −2» y `fuerza` suma +1 en el desglose de defensa física; `Ascendencia='Oyente'` → 400 · L.

**T12 · `MapToResponse` incluye poderes, clavos, recursos y `ArtesMetalicas`** · F1 · T11 · api · `CharacterService.cs` (`Include(c => c.Poderes).Include(c => c.Clavos)` en `:46, :56, :104`; copiar campos §5.2; `ArtesMetalicas = set.Derivar(c, talentos)`), `ApplyUpdate :172-199` (4 asignaciones condicionales) · Aceptación: golden de T09 sigue idéntico salvo las 10 propiedades nuevas con valores vacíos (`[]`, `0`, `''`, `null`); `tsc` del web aún no toca · M.

**T13 · Servicios y controladores de poderes y clavos** · F1 · T12 · api · `Services/Poderes/IPoderService.cs`, `PoderService.cs`, `Services/Clavos/IClavoService.cs`, `ClavoService.cs`, `API/Controllers/PoderesController.cs`, `ClavosController.cs`, `Services/Bootstrap.cs` (+2 `AddScoped`) · Reglas §5.4, §5.6 · Aceptación: `POST poderes {arte:'alomancia', metal:'acero'}` crea poder `naciente` y una meta «Entrenar tu poder» con `tipo:'nacido-del-metal'` y `poderId`; repetir → 409; `{metal:'atium'}` → `completo` sin meta; `POST clavos` como jugador → 403; cuarto clavo con rango 3 → 409 · M.

**T14 · Recursos y acciones de dominio** · F1 · T13 · api · `Messages/Characters/In/RecursosRequest.cs` (ya en T08), `ICharacterService.cs` (+`PatchRecursosAsync`, `BeberVialAsync`, `InicioEscenaAsync`, `TragarAtiumAsync`), `CharacterService.cs`, `CharactersController.cs` (+4 rutas §5.3) · L.129 / PDF 135; L.130 / PDF 136; L.176-177 / PDF 182-183 · Aceptación: `PATCH recursos {investiduraActual: 99}` deja `min(99, max)`; `beber-vial {metales:['oro']}` con poderes acero (común) y oro (raro, viales 2) → `investiduraActual = max`, acero y oro `desprovisto=false`, oro `viales=1`; con `metales:[]` → acero `desprovisto=false`, oro `desprovisto=true`; `inicio-escena {sorprendido:true}` → 1 · M.

**T15 · Metas tipadas y desbloqueo del poder** · F1 · T13 · api · `Services/Metas/MetaService.cs:22-36, 53-67, 100-106` · L.132-133 / PDF 138-139 · Aceptación: concluir con `exito` una meta con `poderId` deja el poder `completo`; con `fracaso` no cambia; `Tipo` inválido → 400 · S.

**T16 · Catálogo por set y era** · F1 · T01 · api · entidades de catálogo (§4.6), `Messages/Catalog/*`, `Services/Catalog/CatalogService.cs`, `API/Controllers/CatalogController.cs` (`campaignId`, GM), migraciones `AddRuleSetToCatalog` y `SeedMistbornCatalog` (datos exactos en `lectura_delta_catalogo.md` §6; ids 1001+, `setval` final, sin `DELETE`) · L.253-279 / PDF 259-285 · Aceptación: sin `campaignId` devuelve exactamente lo de hoy; con campaña `mistborn` Era 1 no aparecen armas de fuego ni «Vial de bendaleo»; Era 2 sí; `POST weapons` de un jugador → 403; `SELECT COUNT(*) FROM "WeaponCatalog" WHERE "RuleSet"='mistborn'` = 35 · L.

**T17 · NPC globales por set** · F1 · T01 · api · `GlobalNpcEntity.cs`, `Messages/GlobalNpcs/*`, `Services/GlobalNpcs/GlobalNpcService.cs`, `API/Controllers/GlobalNpcsController.cs`, migración `AddRuleSetToGlobalNpcs` · Aceptación: `GET /global-npcs?ruleSet=mistborn` → `[]`; sin parámetro → 34 · S.

### Fase 2 — Frontend consciente del set (Stormlight intacto)

**T20 · Espejo TS de personaje, poderes, clavos, recursos y APIs** · F2 · T12, T13, T14 · web · `src/types/index.ts` (§5.9), `src/api/characters.ts` (+`patchRecursos`, `beberVial`, `inicioEscena`, `tragarAtium`), `src/api/poderes.ts`, `src/api/clavos.ts`, `src/api/metas.ts` (tipos), `src/api/catalog.ts` (`campaignId`), `src/api/global-npcs.ts` (`ruleSet`) · Aceptación: `tsc` limpio; `UpdateCharacterRequest` omite recursos y colecciones · S.

**T21 · `RuleSetBadge`, Sidebar, Inicio, tarjeta y Ajustes** · F2 · T04, T05 · web · `src/components/RuleSetBadge.tsx` (nuevo), `Sidebar.tsx:153-168, 261-268, 353-357`, `pages/home/HomeCampaignPage.tsx:47-57`, `pages/campaigns/CampaignListPage.tsx:343-478`, `CampaignSettingsPage.tsx` (sección «Ambientación», era editable por GM con `ConfirmDialog`) · Aceptación: en ST el badge dice «Archivo de las Tormentas»; en NB «Nacidos de la bruma · Era 2»; `PATCH ajustes` desde Ajustes refresca `['campaign', id]` · M.

**T22 · Creación de campaña con ambientación y era** · F2 · T21 · web · `CampaignListPage.tsx:16-91, 115-165, 222-235` (`Sheet` §7.4) · L.372 / PDF 378 (nombres de era, aviso de tono) · Aceptación: crear ST sigue igual en un paso; NB sin era deja «Crear campaña» deshabilitado; el `Segmented` tiene `ariaLabel` completos; foco inicial en el nombre; sin emojis · M.

**T23 · Tabla única de habilidades (ficha, tirador, NPC, grafo)** · F2 · T04 · web · `pages/characters/CharacterDetailPage.tsx` (`SECTIONS`, anclar por texto «Armas Ligeras»), `components/DiceRoller.tsx:25-55`, `pages/gm/GlobalNpcDetailPage.tsx:17-54`, `lib/talentGraph.ts:65-81` · Fuente: hoja ST (`ch3_chars.txt`) y NB L.402 / PDF 408 · Aceptación: las cuatro tablas leen `ruleSetUi.skills`; etiquetas «Armamento ligero», «Armamento pesado», «Saber»; Atletismo FUE e Intimidación VOL en todas; campos del `Character` sin renombrar; `tsc` limpio · M · Fuera: Alomancia/Feruquimia (T31).

**T24 · Tema por set (tokens y `theme-color`)** · F2 · T05 · web · `src/index.css` (tres bloques `:root[data-ruleset='mistborn']…` §3(i)), `store/themeStore.ts` · Paleta `lectura_superficie_ui.md` §6.3 · Aceptación: con `data-ruleset="mistborn"` cambian `--brand`, `--bg`, `--atmo`; sin atributo todo es idéntico (comparar capturas); contraste `--text`/`--bg` ≥ 4,5:1 en ambos temas · M.

**T25 · Activos oficiales de Nacidos de la Bruma** · F2 · — · web (+ script en `cosmere-api/Resources/Parts/mistborn_assets/`) · `src/assets/cosmere/alomancia-era1-*.svg`, `alomancia-era2-*.svg`, `feruquimia-*.svg`, `nacidos-bruma-emblem.svg`, `img/dinero-era1.webp`, `img/dinero-era2.webp`; `components/GameIcons.tsx` (`MetalIcon`); `lib/gameIcons.ts` (mapas de caminos NdM, ascendencias) · PDF 410-411, 260; procedimiento `lectura_superficie_ui.md` §7.3 · Aceptación: 51 SVG con `fill="currentColor"` y `viewBox`; `hasCosmereIcon('alomancia-era1-acero')` true; revisión visual contra renders de PDF 411 (estaño I/E y peltre O/U: usar I y O como canónicos [inferido]) · L.

### Fase 3 — Datos estáticos y motor de talentos

**T30 · Datos: metales, caminos, ascendencias, culturas, eras, equipo inicial, viajes** · F3 · — · web · `src/data/mistborn/types.ts`, `metales.ts`, `caminosNacidoDelMetal.ts`, `ascendencias.ts`, `culturas.ts`, `eras.ts`, `equipoInicial.ts`, `viajes.ts` (§8) · L.19, 32-47, 127-159, 163, 167-171, 254-255, 272, 371-372 · Aceptación: 17 metales; 5 caminos con 38 talentos (5+33), prerrequisitos literales («Voluntad 4 o más», «no tener ningún otro talento de ruptura o herencia»); 5 Bendiciones; `tsc` limpio · L.

**T31 · Datos: alomancia (17 poderes, 83 talentos)** · F3 · T30 · web · `src/data/mistborn/alomancia.ts` · L.172-212 / PDF 178-218; tablas en `lectura_alomancia_inventario.md` §3 · Aceptación: conteo por metal acero 7, aluminio 0, atium 6, bendaleo 5, bronce 6, cadmio 4, cinc 6, cobre 4, cromo 6, duraluminio 2, electro 6, estaño 6, hierro 7, latón 6, nicrosil 4, oro 2, peltre 6; 20 acciones básicas; `notaLibro` en Revitalizar (8 vs gratuita), «Enhaciendo el no ver» (sic), Ráfaga de monedas (sin «poder») · L.

**T32 · Datos: feruquimia (17 poderes, 85 talentos) y hemalurgia** · F3 · T30 · web · `src/data/mistborn/feruquimia.ts`, `hemalurgia.ts` · L.213-250 / PDF 219-256; L.251, 288-295 / PDF 257, 294-301; tablas en `lectura_feruquimia_hemalurgia_inventario.md` §2, §4 · Aceptación: nicrosil 0 talentos y sin desbloqueo; 34 acciones Almacenar/Decantar; 12 tipos de clavo con rango 2/3 · L.

**T33 · Datos: 8 especialidades heroicas de Nacidos de la Bruma** · F3 · — · web · `src/data/mistborn/especialidadesHeroicas.ts`; `src/rulesets/mistborn.ts` compone `caminosHeroicos` = 6 caminos con especialidades comunes de `heroicPaths.ts` + las 8 nuevas · L.73-126 / PDF 79-132 · Aceptación: Agente {Investigador, Ladrón, Rebelde}, Cazador {Mataneblinos, Francotirador, Rastreador}, Enviado {Estafador, Fiel, Mentor}, Erudito {Cirujano, Estratega, Inventor (Era 2)}, Guerrero {Alborotador, Pistolero (Era 2), Soldado}, Líder {Planificador, Oficial, Político}; comparar texto de las comunes con ST y anotar diferencias en `notaLibro` · L.

**T34 · Rejillas y resúmenes de Nacidos de la Bruma** · F3 · T31, T32, T33 · web · `src/data/mistborn/talentGrids.ts`, `talentSummaries.ts` · Geometría desde PDF renderizado (`pdf_image_extractor` sobre el PDF del manual NB; páginas PDF 143, 149, 153, 157, 163 y los diagramas de cap. 6) · Aceptación: toda clave `metal:*` con árbol tiene rejilla 2×N; sin celdas duplicadas; cada `name` existe en los datos · L · Fuera: si el PDF no está disponible, se entrega sin rejilla (el mapa cae a 2 carriles).

**T35 · Motor de talentos parametrizado por set (sin cambio de comportamiento)** · F3 · T04 · web · `src/lib/talentGraph.ts:42-45, 160-202, 411, 563, 1125, 1166` (parámetro `set: ReglasSetTalentos = STORMLIGHT_TALENTOS`), `components/talentos/talentMap.ts` · Aceptación: `TalentosDetailPage` de una campaña ST idéntica (mismo grafo, mismo presupuesto, mismas láminas); `tsc` limpio · M.

**T36 · Cláusulas nuevas del prerrequisito y huecos** · F3 · T35 · web · `talentGraph.ts` (`PrereqClause`, `parseClause :232-272`, `Gate`, `gateFor :693-735`, `TalentState` (+`poderes`, `atributos`, `caminoMetal`), `SKILL_NAME_MAP :73-81`, `SlotKind :1081`, `slotKindOf :1148`, `talentSlotsAt :1125`), `components/talentos/TalentLamina.tsx:36-41`, `TalentSheet.tsx:31,41`, `MapPieces.tsx:91-94` (`gateBadge 'meta'`) · §7.6 puntos 1-7, 9-10 · Aceptación: prueba de 10 líneas con `parsePrereq`: «poder Alomancia de acero» → `{kind:'poder', arte:'alomancia', metal:'acero'}`; «Armamento pesado 2 o más o Armamento ligero 2 o más» → `skillAny`; «Voluntad 4 o más» → `atributo`; «ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia» → `[ancestry, exclusivo]`; «los poderes de la Herencia nacidoble usan el mismo metal» → `eleccionPoderes mismoMetal`; prerrequisitos ST siguen parseándose igual (comparar el grafo ST serializado antes/después) · L.

**T37 · Grafo y mapa de caminos de nacido del metal, poderes y ascendencias** · F3 · T36, T30-T34 · web · `talentGraph.ts:443-510` (bloque nuevo), `talentMap.ts:43-81, 116-157` (`PlateKind`, `gridKeyOf`, `buildPathModels`), `components/talentos/PathAtlas.tsx:69-72, 82, 98-107, 215-224` (icono de metal, filas de 3, `caretX` por fila, «Otros poderes» plegado), `pages/personajes/TalentosDetailPage.tsx` (features, textos) · Aceptación: brumoso con acero `completo` ve raíz «Ruptura de brumoso», lámina del camino (5) y lámina «Alomancia de acero» (7) con 2 raíces disponibles; con acero `naciente` esas 2 raíces salen `locked` con insignia «meta»; nacido de la bruma Era 1 con 10 poderes no desborda horizontalmente a 360 px; ST sin cambios · L.

### Fase 4 — Pantallas de Nacidos de la Bruma

**T40 · Ficha: identidad, ascendencias, puntos, camino de nacido del metal, Investidura actual** · F4 · T20, T23, T30, T37 · web · `CharacterDetailPage.tsx` (zonas §7.5), `components/metales/MetalPicker.tsx` (nuevo §7.7), `components/metales/BeberVialSheet.tsx` (nuevo) · L.17-26 / PDF 23-32; L.128-129 / PDF 134-135; L.372 / PDF 378 · Aceptación: en NB Era 2 el picker de ascendencia ofrece Humano, Kandra, Sangre koloss; en Era 1 no ofrece koloss; elegir «brumoso» + acero crea poder y meta (visible en Metas) y pone Alomancia a 1 (2 si es camino inicial); tarjeta Investidura muestra `actual/máx.` y «Beber vial» repone al máximo; kandra: aviso de 6 puntos; cambiar de camino pide confirmación · L.

**T41 · Pestaña «Artes metálicas» y clavos** · F4 · T40 · web · `components/metales/ArtesMetalicasTab.tsx`, `PoderCard.tsx`, `ClavosSection.tsx` (nuevos), `CharacterDetailPage.tsx` (`Tabs`) · PDF 410; L.131 / PDF 137; L.288-291 / PDF 294-297 · Aceptación: cabeceras MOD./ALCANCE/DADO por arte; `Stepper` de cargas no supera `cargasMax`; toggle Desprovisto persiste con `PATCH recursos`; el GM marca «Meta completada» y el poder pasa a `completo` (vía conclude de la meta si existe, si no `PATCH poderes`); alta de clavo solo GM, con `ConfirmDialog` al extraer; aviso Desorientado si Defensa espiritual ≤ 9 · L.

**T42 · Metas tipadas en UI** · F4 · T20 · web · `pages/personajes/MetasDetailPage.tsx`, `MetasPage.tsx`, `types` · L.132-133 / PDF 138-139; L.283 / PDF 289 · Aceptación: metas con `tipo:'nacido-del-metal'` llevan etiqueta «Meta de nacido del metal» y enlace al poder; al concluir con éxito la ficha refleja `completo` sin recargar (invalidar `['character']`, `['poderes']`) · S.

**T43 · Bolsa: arquillas, capacidad, metales, catálogo por set** · F4 · T16, T20 · web · `pages/personajes/BolsaDetailPage.tsx:137-270, 332-429, 233-241, 475-479, 612-660, 785`, `BolsaPage.tsx:19-27, 93-103`, `pages/personajes/PersonajesPage.tsx:173, 201-211`, `pages/catalog/CatalogPage.tsx:36, 149-157, 220-224, 881-892` · L.50 / PDF 56; L.254 / PDF 260; L.267 / PDF 273 · Aceptación: en NB la sección se llama «Arquillas» con 2 decimales y persiste por `PATCH recursos`; capacidad 25/50/125/250/1250/2500; precios `ar`; claves `['catalog', cId, …]`; en ST todo igual · L.

**T44 · Enciclopedia por set y páginas nuevas** · F4 · T30-T33 · web · `pages/encyclopedia/EncyclopediaPage.tsx:109-197, 210`, `OrigenesPage.tsx`, `NacidosDelMetalPage.tsx`, `ArtesMetalicasPage.tsx`, `PoderMetalPage.tsx`, `ConversacionesPage.tsx`, `EmpenosPage.tsx`, `DadoTramaPage.tsx` (nuevas), `AventurasPage.tsx`/`CombatPage.tsx:68` (resolver + subtítulo), `src/data/mistborn/overlays.ts`, `src/data/conversaciones.ts`, `empenos.ts`, `dadoTrama.ts`, `App.tsx:46-66` (rutas + `RuleSetGate`), `HeroicPathsPage.tsx:250` · `lectura_delta_reglas_base.md` §6.2 (23 operaciones), §7 · Aceptación: NB muestra 15 estados (con Desprovisto y Mermado, sin Empoderado) ordenados alfabéticamente; Agarrar dice «Retenido»; abrir `/encyclopedia/potencias` en NB redirige a la enciclopedia; ST sin cambios de texto salvo las neutralizaciones acordadas (§12 Q9) · L.

**T45 · Dados: Alomancia en Combate, dado de artes metálicas, nota de Recuperación** · F4 · T23, T40 · web · `components/DiceRoller.tsx:68-97, 702-773, 1012`, `utils/dice.ts` (+`artesMetalicas(grados, rango)`) · L.163 / PDF 169; L.172 / PDF 178; L.129 / PDF 135 · Aceptación: con `artesMetalicas.alomancia` la pestaña Combate ofrece «Alomancia» y prellena el dado; sin ella la lista es la actual · M · Fuera: corrección del dado de trama d12→d6 (deuda previa; tarea aparte recomendada **antes** de esta fase).

**T46 · Director y diario por set** · F4 · T17, T21 · web · `pages/gm/GmPage.tsx:8-12`, `GlobalNpcListPage.tsx:96-98`, `GlobalNpcDetailPage.tsx:61-65, 147`, `pages/npcs/NpcNotesPage.tsx:420-423`, `pages/diario/DiarioPage.tsx:259, 390` · Aceptación: NB oculta «Aventura»; lista de NPC vacía con `EmptyState`; leyenda `spren` oculta; emblema del set en el estado vacío del diario · S.

**T47 · Equipo inicial por paquetes (creación de personaje)** · F4 · T43 · web · `src/data/mistborn/equipoInicial.ts` (T30), `pages/characters/CharacterListPage.tsx:253-258, 320-382` (paso opcional «Equipo inicial» en el `Sheet`) · L.254-255 / PDF 260-261 · Aceptación: elegir «Fugitivo» no da dinero y marca que la meta «Entrenar tu poder» se completará al elegir camino (`PATCH poderes estado=completo` en T40); «Noble» tira 4d20 (×10 en Era 2) y escribe `arquillas` · M · Fuera: cantidades en inventario (los arrays son nombres).

### Fase 5 — Convergencia (opcional)

**T50 · Vista unificada de poderes para Stormlight** · F5 · T13, T37 · api + web · migración `UnificarPoderesStormlight` (§4.7), `StormlightReglas.Derivar` devuelve `ArtesMetalicasResponse` con `tieneInvestidura` y nada más, `features.poderesUnificados`, `TalentosDetailPage`/`MyTalents` leen `poderes` cuando el flag está activo · Aceptación: tras migrar, cada radiante tiene 2 filas `potencia`; `CaminoRadiante` e `IdealesJurados` intactos; `Down` las borra; ST con flag `false` idéntico · L · Fuera: borrar columnas Stormlight.

---

## 10. Orden de ejecución y paralelismo

```
F0  T00 ──► T01 ──► T02 ──► T03 ──► T04 ──► T05
         └► T06 ──► T07 ──► T08              T09 (tras T00, en paralelo)
F1  T10 (T08,T09) ──► T11 ──► T12 ──► T13 ──► T14
                                        └──► T15
    T16, T17 (solo T01; en paralelo con T10-T15)
F2  T20 (T12-T14) · T21 (T04,T05) ──► T22 · T23 (T04) · T24 (T05) · T25 (independiente)
F3  T30 · T33 · T35 (T04) en paralelo ──► T31, T32 (T30) ──► T34 ──► T36 (T35) ──► T37
F4  T40 (T20,T23,T30,T37) ──► T41 ──► T42 · T43 (T16,T20) · T44 (T30-T33) · T45 (T23,T40) · T46 (T17,T21) · T47 (T43)
F5  T50
```
- **Paralelizable**: T16/T17 con F1; T25 con todo; T30/T33/T35 entre sí; T43/T44/T46 entre sí.
- **Hitos de app usable con Stormlight intacto**: tras **F0** (solo columnas y selectores, nada visible), tras **F1** (API diferencia sets; cliente igual), tras **F2** (se pueden crear campañas NB y verlas con tema y badge; la ficha NB aún es la de ST con campos ocultos), tras **F3+F4** (NB completo). En **cada** hito la campaña Stormlight se ve y calcula igual (golden T09, capturas T24, grafo serializado T35).
- Deuda previa recomendada **antes** de F4: dado de trama d6 (`utils/dice.ts:81-90, 137-147`), reacciones por ronda (`CombatPage.tsx:121`), Sorpresa (`combatRules.ts:73`).

---

## 11. Riesgos y mitigaciones

| # | Riesgo | Gravedad | Mitigación |
|---|---|---|---|
| 1 | Regresión silenciosa del cálculo Stormlight al extraer `StormlightReglas` (sin tests) | Alta | T09 golden JSON + diff byte a byte en T10 y T12; comportamiento de referencia = WIP |
| 2 | Colisión con el WIP de formas de cantor | Alta | T00 obligatorio; parámetros opcionales al final; no renombrar `BonosForma`/`FormasCantor`; propiedades de respuesta tras `Metas` |
| 3 | `dotnet ef` necesita que el árbol compile | Media | `dotnet build` antes de cada `migrations add`; API parada |
| 4 | Auto-migración al arrancar (`Program.cs:93-94`) con `ADD COLUMN NOT NULL DEFAULT` | Baja | Constante → solo metadatos en PostgreSQL ≥ 11 [inferido: versión no verificada; leer `docker-compose.yml`]; tablas pequeñas |
| 5 | `localStorage` con campaña antigua sin `ruleSet` | Baja | Selector `?? 'stormlight'`; gate de hidratación (T05) |
| 6 | Parpadeo del tema al recargar una campaña NB | Baja | Script previo a la pintura en `index.html`; `html[data-ruleset='mistborn']{background:…}` inline |
| 7 | Tamaño de bundle (+~400 kB de datos NB) | Media | `import()` dinámico de `src/rulesets/mistborn.ts`; `vite build` con `--report` para comprobar que el chunk ST no cambia |
| 8 | Datos [inferido] del libro: columnas de tablas de metales reconstruidas por posición, geometría de árboles, Revitalizar 8 vs gratuita, duraluminio/electro para nacido de la bruma, Lupa 200 ar, pesos de viales | Media | Marcar `notaLibro`; revisión visual con páginas renderizadas (T25, T34); lista en §12 |
| 9 | PUT completo de la ficha pisa recursos | Media | Recursos solo por `PATCH …/recursos`; `UpdateCharacterRequest` no los incluye; campos NdM opcionales (`null` = no tocar) |
| 10 | Catálogo: secuencias de id y nombres duplicados con objetos propios | Media | `setval` final; comprobar `IsCustom` con nombres NB antes del seed |
| 11 | Cambio de permisos en `CatalogController` (hoy cualquier usuario edita) | Baja | Es una corrección; avisar a la mesa |
| 12 | Nombres de talento repetidos entre sets con efecto distinto («Vestimenta tradicional», posturas) | Baja | Registro de reglas por set (§6.4); comparar talento a talento en T33 |
| 13 | Líneas de `CharacterDetailPage.tsx`/`types/index.ts` desplazadas por el WIP del web | Baja | Anclar por texto en T23/T40 |
| 14 | Falta el PDF del manual NB en el repo para renders | Media | T34 y T25 lo requieren; si no está, entregar sin rejilla y con Lucide |

---

## 12. Preguntas abiertas para Xavi (con recomendación por defecto)

| # | Pregunta | Recomendación (la propuesta la asume) |
|---|---|---|
| Q1 | ¿Set exclusivo por campaña en v1, dejando la mezcla (L.374-375 / PDF 380-381) como flag reservado? | **Sí**, exclusivo; `MezclaAmbientaciones` sin UI. |
| Q2 | ¿Era editable por el director tras crear la campaña y con opción «Entre eras»? | **Sí** a ambas (El legado cruza eras, L.372 / PDF 378). |
| Q3 | ¿Alomancia y Feruquimia en columnas dedicadas o en huecos personalizados? | **Columnas dedicadas** (D-ALO). |
| Q4 | ¿Puede un jugador no-GM elegir/cambiar su camino de nacido del metal? | **Sí** (L.128 / PDF 134); seguir bloqueando nombre, camino heroico y orden. |
| Q5 | ¿Los recursos de mesa (Investidura actual, cargas, viales, Desprovisto, arquillas) se persisten en el servidor? ¿También salud/concentración actuales (hoy no)? | **Sí** a los NdM; salud/concentración **fuera de alcance** (coherencia con lo que ya se decidió al borrarlas). |
| Q6 | ¿La Bendición de la Fortaleza (+1 desvío) se acumula con la armadura? | **Sí** [inferido]; las formas de cantor siguen con «mayor de los dos». |
| Q7 | ¿`ValidarIdentidad` de Stormlight acepta `Cantor`/`Cantora` (hoy `FormasCantor` sí y `CharacterService` no)? | **Sí**, para alinear ambos; es un bug previo. |
| Q8 | ¿Se unifica la tabla de habilidades también en Stormlight (Armamento ligero/pesado, Saber, Atletismo FUE, Intimidación VOL)? | **Sí**: ambos libros usan esos nombres; corrige la auditoría. |
| Q9 | ¿Base neutral (≈25 ediciones en `aventuras.ts`/`combatRules.ts`) o base ST + overlay NB? | **Base neutral** solo para las frases que no son regla (Interactuar, Zona); el resto por overlay (menos regresión). |
| Q10 | ¿Se oculta «Aventura» del director en NB v1? | **Sí**; registro de aventuras por set en el futuro (§13). |
| Q11 | ¿Metas de nacido del metal se completan solo por éxito, o también por crecimiento? | **Solo éxito** [inferido]; GM puede forzar con `PATCH poderes`. |
| Q12 | ¿Beber vial exige tener viales del metal raro (409) o solo avisa? | **Exige**, con `ignorarViales` para la DJ. |
| Q13 | ¿Clavos y Bendiciones los da solo el GM? | **Sí** (son recompensas, L.288 / PDF 294). |
| Q14 | ¿Glifo canónico de estaño (I/E) y peltre (O/U)? | I y O; el otro como variante. |
| Q15 | ¿Fase 5 (poderes unificados para Stormlight) entra en el alcance? | **No** en v1; queda trazada (T50). |
| Q16 | ¿Corregir antes el dado de trama (d6, +2/+4, naturales acumulables) y las reacciones por ronda? | **Sí, antes de F4**, como trabajo independiente. |
| Q17 | ¿Reescribir las descripciones de rasgos compartidos del catálogo con el texto literal del libro (afecta a ST)? | **Sí**, son más fieles en ambos. |

---

## 13. Fuera de alcance y trabajo futuro

- Aventura **«El legado de los nacidos de la bruma»** (`SPA_NacidosBruma_Legado.pdf`): registro de aventuras por set en la pestaña «Aventura» del director (hoy `CaminapiedrasPage` es la única).
- **Guía del mundo de Nacidos de la bruma**: adversarios, PNJ mentores y cuerpos verdaderos kandra como seed de `GlobalNpcs` con `RuleSet='mistborn'`.
- **Mezcla de ambientaciones** real (Q1): UI del flag, catálogo con deduplicación por nombre priorizando el set principal (o inventarios por id), overlays en unión, Investidura única con Desprovisto por fuente (ya soportado por el motor).
- **Medallones feruquímicos**, mentes desligadas, granadas alománticas y objetos Investidos como filas con cargas propias (`Origen='medallon'` queda reservado).
- **Resonancias** del nacidoble (narrativas, L.154 / PDF 160), **savantismo** (meta `savantismo` reservada) y «clavo secreto» (campo `Secreto` reservado) como flujos guiados.
- **Hoja de personaje imprimible** (PDF 408-411) generada desde la ficha.
- Difusión por **SignalR** de cambios de recursos (`RecursosChanged`) para que el director vea la Investidura de la mesa en tiempo real.
- **Salud y concentración actuales** en servidor; cantidades en inventario; `Experience` (sin uso en ambos libros).
- Eliminación de columnas obsoletas (`MaxConcentration`, `MaxInvestiture`) y, tras la fase 5, de `CaminoRadiante`/`IdealesJurados` si algún día se decide.
- Iconos oficiales de los **caminos** (no existen en el libro: se mantiene Lucide).
