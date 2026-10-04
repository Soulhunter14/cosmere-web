# Propuesta A — «Nacidos de la Bruma» como set de reglas (riesgo mínimo e incremental)

## 0. Portada

| Campo | Valor |
|---|---|
| Título | Set de reglas «Nacidos de la Bruma» para CosmereAPP: discriminador en la campaña y módulos hermanos por set |
| Fecha | 3 de octubre de 2026 |
| Estado | **Propuesta, sin implementar.** Solo lectura sobre `cosmere-api` y `cosmere-web`. |
| Ángulo | A — riesgo mínimo e incremental: la campaña Stormlight en curso no se toca; Stormlight se **envuelve**, Nacidos de la Bruma se **añade** como módulo paralelo; se acepta duplicación a cambio de seguridad; cada fase deja la app desplegable. |
| Fuentes de código | `api_map.md`, `web_map.md`, `lectura_motor_reglas_api.md`, `lectura_motor_talentos_web.md`, `lectura_superficie_ui.md`, `lectura_delta_reglas_base.md`, `lectura_delta_catalogo.md` (todos en el scratchpad) y lectura directa de `CharacterService.cs`, `TalentosReglas.cs`, `CampaignService.cs`, `CampaignEntity.cs`, `Bootstrap.cs`, `talentGraph.ts`, `talentMap.ts`, `campaignStore.ts`, `AppLayout.tsx`, `App.tsx`, `EncyclopediaPage.tsx`, `themeStore.ts`, `index.html`, `DESIGN.md`. |
| Fuentes del libro | `mistborn_rules_summary.md`, `lectura_alomancia_inventario.md`, `lectura_feruquimia_hemalurgia_inventario.md`, texto íntegro `mistborn_flow.txt` (PDF = L.+6); leídas directamente PDF 134-139 (cap. 5) y PDF 377-381 (cap. 13). Manual de Tormentas: `ch3_chars.txt`, `ch10_combat.txt`, `auditoria-reglas-2026-10-03.md`. |
| Convenciones de cita | `archivo:línea` para código (árbol de trabajo actual, con WIP sin commitear); «L.<libro> / PDF <pdf>» para el manual de Nacidos de la Bruma. **[inferido]** = deducción no verificada en código ni en libro. |

## 1. Resumen ejecutivo y principios de diseño

1. Hoy ni la API ni el frontend tienen noción de ambientación: `CampaignEntity` no tiene campo de set (`Messages/Database/Entities/CampaignEntity.cs:3-17`), la campaña se crea con un único campo `Name` (`CreateCampaignRequest.cs:3-6`, `CampaignListPage.tsx:131-138`) y todo el contenido de juego es Stormlight.
2. El motor numérico de Nacidos de la Bruma es **idéntico** al de Tormentas: salud (L.29 / PDF 35), concentración 2+Voluntad y defensas 10+attr+attr (L.26 / PDF 32), Investidura 2+máx(DIS,PRE) (L.57 / PDF 63), movimiento (L.51 / PDF 57). Lo único que cambia en el servidor es **quién tiene Investidura** (hoy `CaminoRadiante != ""`, `CharacterService.cs:239` y `TalentosReglas.cs:218`) y un bloque nuevo de derivados de artes metálicas (L.163 / PDF 169).
3. La propuesta añade un **discriminador** `Campaigns.RuleSet` (`'stormlight'` por defecto para todo lo existente) y `Campaigns.Era`, fijados al crear la campaña e inmutables (el set) o editables por el director (la era, fase opcional).
4. El servidor gana una interfaz `IReglasSet` con dos implementaciones: `StormlightReglas` **envuelve** el código actual sin reescribirlo (incluido el WIP de formas de cantor) y `MistbornReglas` añade validación, gate de Investidura, Resistencia koloss, Bendiciones kandra y el bloque `DerivadosSet` (límite / dado / alcance / cargas).
5. El personaje gana tres columnas aditivas: `CaminoMetal`, `PoderesMetal` (JSON, mismo patrón que `Talentos`) y `Arquillas`. Las columnas Stormlight (`CaminoRadiante`, `IdealesJurados`, `Marcos*`) se quedan y se ignoran en Nacidos de la Bruma.
6. En el frontend, un módulo `src/rulesets/` expone por set capacidades, etiquetas y tablas; los componentes preguntan por capacidad (`features.marcos`, `features.artesMetalicas`), no por `ruleSet === 'mistborn'`.
7. Los datos estáticos de Nacidos de la Bruma viven en `src/data/mistborn/` sin mover ni renombrar los ficheros Stormlight actuales (ningún import existente cambia).
8. `aventuras.ts` y `combatRules.ts` quedan intactos como base; Nacidos de la Bruma aplica un **overlay** (añadir / quitar / sustituir por nombre) con las 23 operaciones verificadas por el lector de reglas base.
9. El motor de talentos (`talentGraph.ts`) se parametriza por set con parámetros **opcionales** cuyo valor por defecto es Stormlight: todas las llamadas actuales siguen compilando y produciendo el mismo grafo.
10. El tema se cambia con un atributo `data-ruleset` en `<html>` que redefine tokens; sin atributo, los tokens actuales no se tocan.
11. Catálogo y PNJ globales ganan una columna `RuleSet` y un filtro por campaña; el seed de Nacidos de la Bruma es una migración aditiva (sin `DELETE`) con filas duplicadas por set.
12. Siete fases; tras cada una la app compila, migra sola al arrancar (`API/Program.cs:93-94`) y la campaña Stormlight se ve **idéntica**.
13. Sin tests en ninguno de los dos repos: la red de seguridad es una captura JSON de referencia de los personajes Stormlight antes de tocar el motor (T02) y la comparación byte a byte después (T10).
14. El WIP de formas de cantor (`CharacterService.cs`, `TalentosReglas.cs`, `CharacterResponse.cs`, `FormasCantor.cs`) es la **línea base**: la propuesta solo añade parámetros opcionales al final y propiedades nuevas al final de las clases, y exige que esté commiteado antes de la fase 2.
15. Las decisiones de producto que no me corresponden (mezcla de sets, era editable, dónde viven Alomancia y Feruquimia, renombrar habilidades Stormlight, persistir valores actuales) van en la sección 12 con una recomendación por defecto; el diseño asume esa recomendación.

**Principios:** (P1) nada de Stormlight cambia de comportamiento sin una tarea explícita que lo diga; (P2) todo cambio de contrato es aditivo y con valor por defecto; (P3) cada fase es desplegable y reversible con `Down`; (P4) Nacidos de la Bruma es un módulo hermano, no una generalización prematura; (P5) duplicar datos es aceptable, duplicar lógica de cálculo no; (P6) nunca se renombra un identificador de dominio existente.

## 2. Glosario de dominio y convenciones de nombres

| Concepto | Valor / identificador | Dónde |
|---|---|---|
| Set de reglas | `RuleSet` (C#), `ruleSet` (TS). Valores `"stormlight"` (Archivo de las Tormentas) y `"mistborn"` (Nacidos de la Bruma). | `Messages/RuleSets/RuleSetIds.cs`; `src/types/index.ts` `RuleSetId` |
| Era | `Era` / `era`. Valores `"era1"` («Era 1: El Mundo de Ceniza»), `"era2"` («Era 2: Cambio y revolución»), `"ambas"` (campaña entre eras, L.372 / PDF 378); `null` en Stormlight. | `EraIds` (C#), `Era` (TS) |
| Camino de nacido del metal | `CaminoMetal` / `caminoMetal`: `""`, `"brumoso"`, `"nacido-de-la-bruma"`, `"feruquimista"`, `"ferrin"`, `"nacidoble"` | columna `Characters.CaminoMetal` |
| Metal | ids ASCII sin tilde: `hierro acero estano peltre cinc laton cobre bronce cromo nicrosil aluminio duraluminio cadmio bendaleo oro electro atium` (17; L.168 / PDF 174) | `src/data/mistborn/metales.ts` `MetalId` |
| Arte | `"alomancia"` \| `"feruquimia"` (hemalurgia solo enciclopedia, L.251 / PDF 257) | `ArteMetal` |
| Poder | `${arte}:${metal}` → `"alomancia:acero"`, `"feruquimia:oro"` | `PoderMetalDto.Id` (derivado), claves de rejilla `poder:alomancia:acero` |
| Estado del poder | `"naciente"` \| `"completo"` (L.132-133 / PDF 138-139) | `PoderesMetal` JSON |
| Ascendencias NdB | `"Humano"`, `"Kandra"`, `"Sangre koloss"` (misma capitalización que `"Humano"`/`"Oyente"` actuales, `CharacterService.cs:23`) | `MistbornReglas.ValidAscendencias` |
| Bendición kandra | marcador `~bendicion~<Nombre>` en `Talentos` (`Consciencia`, `Potencia`, `Presencia`, `Estabilidad`, `Fortaleza`; L.34-35 / PDF 40-41), mismo patrón que `~forma~` (`FormasCantor.cs:25`) | `Talentos` JSON |
| Habilidades Investidas | `Alomancia` (Voluntad, `VOL`) y `Feruquimia` (Intelecto, `INT`) en `HabilidadPersonalizadaN` por nombre exacto (L.128 / PDF 134) | ficha, tirador, `GradosDe` |
| Moneda | `arquillas` (`ar`), decimal con 2 decimales (óbolo 0,01 ar; nota 10 ar; L.254 / PDF 260) | `Characters.Arquillas numeric` |
| Carpetas | API: `Services/RuleSets/`, `Messages/RuleSets/`. Web: `src/rulesets/` (configuración UI por set), `src/data/mistborn/` (datos estáticos), `src/pages/encyclopedia/mistborn/`, `src/components/mistborn/` | — |
| Tipos C# nuevos | `RuleSetIds`, `EraIds`, `IReglasSet`, `IReglasSetProvider`, `ReglasSetProvider`, `StormlightReglas`, `MistbornReglas`, `MistbornDatos`, `DerivadosSet`, `ArteDerivada`, `PoderMetalDto`, `UpdateCampaignSettingsRequest` | — |
| Tipos TS nuevos | `RuleSetId`, `Era`, `RuleSetUi`, `DerivadosSet`, `ArteDerivada`, `PoderMetal`, `MetalDef`, `PoderAlomantico`, `PoderFeruquimico`, `CaminoNacidoDelMetal`, `ArbolAscendencia`, `ReglasSetTalentos`, `Overlay<T>` | — |
| Claves TanStack Query | `['campaign', cId]`, `['catalog', cId, 'weapons'\|'armor'\|'gear']`, `['catalog', cId, 'opts', cat]`, `['global-npcs', ruleSet]`; las de personajes siguen `['characters', cId]` | §7.1 |

## 3. Decisiones de diseño

| # | Decisión | Alternativas | Elegida y por qué |
|---|---|---|---|
| (a) | Set exclusivo por campaña vs mezcla | (1) `RuleSet` string exclusivo; (2) `RuleSets text[]` con unión; (3) capacidades por personaje con Investidura única (lo que prevé el libro, L.374-375 / PDF 380-381) | **(1) en v1.** Un string con default es la migración más pequeña, el catálogo y los inventarios por **nombre** (`BolsaDetailPage.tsx:243-245`) no colisionan, y el motor de talentos funde homónimos sin ambigüedad. (2)/(3) quedan posibles después añadiendo el valor `"mixto"` cuyo `IReglasSet` haga la unión (`TieneInvestidura` = radiante OR alomántico); el diseño no lo impide (§13). |
| (b) | Era a nivel de campaña y si cambia | (1) inmutable; (2) editable por el director con `PATCH`; (3) por personaje | **Campaña, con valor `"ambas"` para campañas entre eras** (la aventura *El legado de los nacidos de la bruma* cruza las dos, L.372 / PDF 378). En v1 se fija al crear; `PATCH /campaigns/{id}/settings` (solo era, solo GM) es la tarea opcional T43 porque la era **solo filtra pickers y catálogo**, nunca invalida datos guardados. |
| (c) | ¿Cambiar el set tras crear? | (1) no; (2) sí si no hay personajes | **No.** No existe endpoint de edición (`CampaignsController.cs:15-50`); cambiarlo dejaría personajes con `Ascendencia="Oyente"` inválidos en Mistborn (`ValidarIdentidad` fallaría al guardar). El `Sheet` de creación lo avisa. |
| (d) | Almacenar poderes del personaje | (1) columnas fijas; (2) JSON en `Characters`; (3) tabla hija `CharacterPoderes` | **(2) `PoderesMetal text default '[]'`**, mismo patrón que `Talentos` (`CharacterEntity.cs`, `ParseTalentos` `CharacterService.cs:303-308`). Una columna, sin configuración EF nueva, se guarda con el `PUT` actual; el servidor la deserializa solo para `Derivar`. Un nacido de la bruma de Era 1 tiene hasta 10 poderes (L.372 / PDF 378): una columna por poder no escala; la tabla hija es la evolución natural si aparecen problemas de concurrencia (§13). |
| (e) | Valores actuales (Investidura actual, cargas de mentes, viales, cuentas de atium) | (1) servidor con `PATCH` parcial; (2) cliente (`localStorage` por personaje); (3) nada | **(2) en v1, (1) como T44 opcional.** La app ya decidió no persistir salud ni concentración actuales (`20260413132616_RemoveHealth`, `20260408133329_DropConcentrationInvestiture`); ser coherente evita un endpoint nuevo y la carrera con el `PUT` de personaje entero (`TalentosDetailPage.tsx:176-179`). Pregunta Q5. |
| (f) | Catálogo global vs por set | (1) columna `RuleSet` + filas duplicadas; (2) `RuleSets[]` con `'both'`; (3) catálogo por campaña | **(1)** (informe de catálogo §8): solo 4 de 65 objetos homónimos coinciden en precio y peso, la moneda difiere (`mc` vs `ar`) y las descripciones son editables por fila. Filtro por `?campaignId=` con **default `stormlight` si falta** (cliente actual intacto). |
| (g) | PNJ globales por set | (1) columna `RuleSet` + filtro; (2) usar `Source` libre | **(1)** `GlobalNpcs.RuleSet text default 'stormlight'` y `GET /global-npcs?ruleSet=`. Sin seed Mistborn (los adversarios están en la Guía del mundo, fuera de alcance): la lista vacía «Sin adversarios todavía» (`GlobalNpcListPage.tsx:163`) pasa a tener sentido. |
| (h) | Enciclopedia compartida vs duplicada | (1) duplicar páginas; (2) base neutral + overlays (≈25 ediciones en ST); (3) base = ST intacta + overlay MB | **(3)** (cero regresión; informe de reglas base §6.1 alternativa 2). Páginas compartidas tal cual: `AventurasPage`, `CombatPage` (una cadena, `:68`). Páginas solo ST ocultas en MB (`RadiantOrdersPage`, `PotenciasPage`) con `RuleSetGate`; páginas nuevas solo MB en `pages/encyclopedia/mistborn/`. |
| (i) | Tema visual por set | (1) tokens por `data-ruleset`; (2) segundo `index.css`; (3) nada | **(1)**: `--brand*` es un único eje (61 `var(--brand` + 93 `tone.brand`/`c.brand`, informe UI §6) y `theme.ts` solo referencia variables. Sin atributo = tokens actuales. `index.html` y `vite.config.ts` quedan Stormlight (no parametrizables por campaña). |
| (j) | Columnas Stormlight del personaje en campañas MB | (1) borrar; (2) anular; (3) ignorar | **(3)**: `CaminoRadiante`, `IdealesJurados`, `MarcosInfusas/Opacas`, `Spells` se guardan y se devuelven; la UI no las pinta cuando `features.caminoRadiante/idealesJurados/marcos` es `false`; `MistbornReglas.ValidarIdentidad` exige `CaminoRadiante == ""`. Sin migración destructiva. |
| (k) | Camino inicial de nacido del metal (L.17 / PDF 23: puede ser camino inicial) | (1) campo nuevo `CaminoInicial`; (2) regla derivada | **(2) [inferido]**: si `caminoHeroico === ''` y `caminoMetal !== ''`, el camino de nacido del metal es el inicial (su talento principal es `autoGranted` y su habilidad inicial es gratis); si hay ambos, el heroico es el inicial y el principal del NdM cuesta un hueco de nivel y se guarda en `talentos`. Sin columna nueva. |
| (l) | Dónde se guarda el estado «completo» del poder | (1) derivar de `Meta.estado`; (2) campo en `PoderesMetal` + vínculo opcional a la meta | **(2)**: `estado` es la verdad, `metaId` enlaza la meta «Entrenar tu poder» / «Fabricar tu mente de metal»; al concluir esa meta con éxito la UI ofrece marcar el poder completo. No se toca `MetaEntity`. |

## 4. Modelo de datos (API)

### 4.1 Entidades y columnas

| Entidad / tabla | Propiedad C# exacta | Columna PostgreSQL | Fase |
|---|---|---|---|
| `CampaignEntity` (`Messages/Database/Entities/CampaignEntity.cs`) | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` | `"RuleSet" text NOT NULL DEFAULT 'stormlight'` | F1 |
| `CampaignEntity` | `public string? Era { get; set; }` | `"Era" text NULL` | F1 |
| `CharacterEntity` (`CharacterEntity.cs`, tras `IdealesJurados`) | `public string CaminoMetal { get; set; } = string.Empty;` | `"CaminoMetal" text NOT NULL DEFAULT ''` | F2 |
| `CharacterEntity` | `public string PoderesMetal { get; set; } = "[]";` | `"PoderesMetal" text NOT NULL DEFAULT '[]'` | F2 |
| `CharacterEntity` | `public decimal Arquillas { get; set; } = 0;` | `"Arquillas" numeric NOT NULL DEFAULT 0` | F2 |
| `WeaponCatalogEntity`, `ArmorCatalogEntity`, `GearItemEntity` | `public string RuleSet { get; set; } = RuleSetIds.Stormlight; public short? Era { get; set; } public bool IsRewardOnly { get; set; }` | `text NOT NULL DEFAULT 'stormlight'`, `smallint NULL`, `boolean NOT NULL DEFAULT false` | F6 |
| `WeaponCatalogEntity`, `ArmorCatalogEntity` | `public double? Price { get; set; }` | `double precision NULL` | F6 |
| `GearItemEntity` | `public string? Category { get; set; }` (`'vial'`) | `text NULL` | F6 |
| `CatalogOptionEntity` | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` (valores `stormlight`, `mistborn`, `shared`) | `text NOT NULL DEFAULT 'stormlight'` | F6 |
| `GlobalNpcEntity` | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` | `text NOT NULL DEFAULT 'stormlight'` | F6 |
| `CharacterEntity` (opcional) | `public string RecursosMetal { get; set; } = "{}";` | `text NOT NULL DEFAULT '{}'` | F7 |

Índices: `CREATE INDEX "IX_WeaponCatalog_RuleSet"`, ídem `ArmorCatalog`, `GearItems`, `GlobalNpcs`; en `CatalogOptions` ampliar el índice de `Category` (`CosmereContext.cs:167-169`) a `(RuleSet, Category)`. Sin índice único `(RuleSet, Name)` (puede haber armas propias duplicadas) [inferido]. Sin FK nuevas. Sin `HasMaxLength`: el resto de entidades se configura por convención (`CosmereContext.cs:28-213`).

### 4.2 Esquema JSON de `PoderesMetal`

```json
[{ "arte": "alomancia", "metal": "acero", "estado": "naciente", "origen": "camino", "metaId": 12 },
 { "arte": "feruquimia", "metal": "oro",   "estado": "completo", "origen": "clavo",  "metaId": null }]
```
`origen` ∈ `camino | clavo | lerasium | medallon` [inferido del cap. 8]. El servidor acepta cualquier lista bien formada y valida solo `arte` y `metal` conocidos (→ 400). El cliente es el dueño de la lista.

### 4.3 Migraciones EF (en orden, todas posteriores a `20260929110638_AddIdealesJurados`)

| # | Nombre | Up | Down | Fase |
|---|---|---|---|---|
| 1 | `AddCampaignRuleSet` | `AddColumn<string>("RuleSet","Campaigns",type:"text",nullable:false,defaultValue:"stormlight")`; `AddColumn<string>("Era","Campaigns",type:"text",nullable:true)` | `DropColumn` ambas | F1 |
| 2 | `AddCharacterMistbornFields` | `AddColumn<string>("CaminoMetal","Characters","text",false,"")`; `AddColumn<string>("PoderesMetal","Characters","text",false,"[]")`; `AddColumn<decimal>("Arquillas","Characters",type:"numeric",nullable:false,defaultValue:0m)` | `DropColumn` ×3 | F2 |
| 3 | `AddRuleSetToCatalog` | columnas de §4.1 en las 4 tablas + índices + `UPDATE "CatalogOptions" SET "RuleSet"='shared' WHERE "Id" IN (1,2,3,10..27,30,31,32,40,42,43,44,46,50,51,52,53,54,56,57,58,60,61,62,64,70,71,73,74,80,81,82,83,85)` (informe catálogo §5.2) | `DropColumn`/`DropIndex` | F6 |
| 4 | `SeedMistbornCatalog` | `INSERT` de opciones nuevas (ids 4, 33-34, 47-49, 65-69, 78-79, 86, 100, 110-115, 140-141), 35 armas (ids 1001-1035), 8 armaduras (1001-1008), 84 `GearItems` (1001-1084), todo `RuleSet='mistborn'`; termina con los tres `setval(pg_get_serial_sequence(...), MAX("Id"))`. **Sin `DELETE`** (a diferencia de `20260410143041_SeedCatalogData.cs`). | `DELETE ... WHERE "RuleSet"='mistborn'` + borrar opciones por id | F6 |
| 5 | `AddRuleSetToGlobalNpcs` | `AddColumn<string>("RuleSet","GlobalNpcs","text",false,"stormlight")` + índice | `DropColumn` | F6 |
| 6 | `AddCharacterRecursosMetal` (opcional) | `AddColumn<string>("RecursosMetal","Characters","text",false,"{}")` | `DropColumn` | F7 |

Comandos (API parada, árbol compilando): `dotnet ef migrations add <Nombre> --project Infrastructure --startup-project API` y `dotnet ef database update --project Infrastructure --startup-project API`. Se auto-aplican al arrancar (`API/Program.cs:93-94`, `Infrastructure/Bootstrap.cs:22-28`, `AutoMigrate` por defecto `true`).

### 4.4 Compatibilidad con datos existentes

- Todas las campañas pasan a `RuleSet='stormlight'`, `Era=NULL` por el `DEFAULT`; `ReglasSetProvider.Obtener(null|desconocido)` también cae a Stormlight.
- Personajes existentes: `CaminoMetal=''`, `PoderesMetal='[]'`, `Arquillas=0`. Ninguna fórmula cambia porque `StormlightReglas` reproduce `BuildInvLineas`/`Calcular` actuales.
- Catálogo y PNJ existentes quedan `stormlight`; opciones compartidas pasan a `shared` (siguen devolviéndose a Stormlight porque el filtro es `RuleSet IN ('shared', @set)`).
- Clientes antiguos (PWA cacheada): `POST /campaigns {name}` crea Stormlight; `GET /catalog/*` sin `campaignId` devuelve Stormlight; `PUT` de personaje sin `caminoMetal/poderesMetal/arquillas` (propiedades `string?`/`decimal?` en `UpdateCharacterRequest`) **no pisa** los valores guardados.

## 5. Contrato API

### 5.1 DTOs (propiedades exactas, añadidas al final de cada clase)

| Clase (fichero) | Añadir |
|---|---|
| `CreateCampaignRequest` (`Messages/Campaigns/In/CreateCampaignRequest.cs:3-6`) | `public string RuleSet { get; set; } = RuleSetIds.Stormlight; public string? Era { get; set; }` |
| `UpdateCampaignSettingsRequest` (nueva, mismo fichero; F7) | `public string? Era { get; set; }` |
| `CampaignResponse` y `CampaignDetailResponse` (`Messages/Campaigns/Out/CampaignResponse.cs:3-22`) | `public string RuleSet { get; set; } = RuleSetIds.Stormlight; public string? Era { get; set; }` |
| `CreateCharacterRequest` (`Messages/Characters/In/CharacterRequest.cs:3-12`) | `public string CaminoMetal { get; set; } = string.Empty;` |
| `UpdateCharacterRequest` (`:19-98`) | `public string? CaminoMetal { get; set; } public string? PoderesMetal { get; set; } public decimal? Arquillas { get; set; }` (null ⇒ conservar) |
| `CharacterResponse` (`Messages/Characters/Out/CharacterResponse.cs`, después de `Metas`, sin reordenar) | `public string CaminoMetal { get; set; } = ""; public string PoderesMetal { get; set; } = "[]"; public decimal Arquillas { get; set; } public DerivadosSet? DerivadosSet { get; set; }` |
| `DerivadosSet`, `ArteDerivada` (nuevo `Messages/Characters/Out/DerivadosSet.cs`) | `class DerivadosSet { ArteDerivada? Alomancia; ArteDerivada? Feruquimia; }` · `class ArteDerivada { int Grados; int Modificador; int Limite; string Dado; int AlcanceMetros; int? CargasMaxMente; }` |
| `PoderMetalDto` (nuevo `Messages/Characters/PoderMetalDto.cs`) | `class PoderMetalDto { string Arte=""; string Metal=""; string Estado="naciente"; string Origen="camino"; long? MetaId; }` (solo para deserializar `PoderesMetal`) |
| `WeaponCatalogResponse`, `ArmorCatalogResponse`, `GearItemResponse`, `CatalogOptionResponse` (`Messages/Catalog/Out`) | `string RuleSet; short? Era; bool IsRewardOnly; double? Price` (armas y armaduras); `string? Category` (gear) |
| `CreateWeaponRequest`, `CreateArmorRequest` (`Messages/Catalog/In/CreateCatalogRequests.cs`) | `public long? CampaignId { get; set; } public double? Price { get; set; } public bool IsRewardOnly { get; set; }` |
| `GlobalNpcResponse`, `GlobalNpcRequest` | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` |

### 5.2 Endpoints

| Ruta | Verbo | Permiso | Cambio |
|---|---|---|---|
| `/campaigns` | POST | usuario | Lee `RuleSet`/`Era`; 400 si `!RuleSetIds.EsValido` o (`mistborn` y `!EraIds.EsValido(Era)`); fuerza `Era=null` si `stormlight`. Respuesta con ambos. |
| `/campaigns`, `/campaigns/{id}`, `/campaigns/join` | GET/GET/POST | miembro | Devuelven `ruleSet`, `era` (proyección `CampaignService.cs:17-33`, detalle `:48-62`, join `:115`). |
| `/campaigns/{id}/settings` (F7) | PATCH | **GM** (`GmUserId`) | Solo `Era`; 400 si inválida o si la campaña es `stormlight`. |
| `/campaigns/{cid}/characters` (+`{id}`, PUT, assign) | — | igual | Validación por set (`set.ValidarIdentidad`), `DerivadosSet` en la respuesta. Bloqueo no-GM (`CharacterService.cs:111-116`): **no** se añade `CaminoMetal` (el libro permite tomar el camino en cualquier nivel, L.128 / PDF 134); decisión Q6. |
| `/catalog/weapons|armor|gear|options/{category}` | GET | usuario | `?campaignId=` opcional → set y era de la campaña (miembro requerido); sin él, `stormlight` sin filtro de era. Objetos: `RuleSet=@set AND (Era IS NULL OR @era IS NULL OR @era='ambas' OR Era=@eraNum)`. Opciones: `RuleSet IN ('shared',@set)`. |
| `/catalog/weapons|armor` POST, DELETE `{id}`, PUT `{tipo}/{id}/description` | — | **GM de la campaña** si `campaignId` presente (hoy solo `[Authorize]`, `CatalogController.cs:11-13`; defecto previo) | Alta fija `RuleSet` al de la campaña, `IsCustom=true`. |
| `/global-npcs` | GET | usuario | `?ruleSet=` opcional (default `stormlight`; 400 si inválido). POST/PUT aceptan `RuleSet`. |

### 5.3 Validaciones por set (`IReglasSet.ValidarIdentidad`)

| Set | Caminos heroicos | Camino especial | Ascendencias |
|---|---|---|---|
| Stormlight | `agente cazador enviado erudito guerrero lider` | `CaminoRadiante` ∈ 10 ids actuales (`CharacterService.cs:17-21`); `CaminoMetal` debe ser `""` | `Humano`, `Oyente` (se conserva la inconsistencia con `FormasCantor.AscendenciasCantor`, `FormasCantor.cs:27-28`; no es de este proyecto) |
| Mistborn | los mismos 6 (L.19 / PDF 25) | `CaminoMetal` ∈ `brumoso nacido-de-la-bruma feruquimista ferrin nacidoble`; `CaminoRadiante` debe ser `""` | `Humano`, `Kandra`, `Sangre koloss` (L.32-39 / PDF 38-45). Kandra + `CaminoMetal != ""` → 400 (L.18 / PDF 24) |

Metales válidos en `PoderesMetal`: los 17 ids de §2; `arte` ∈ `alomancia|feruquimia`. El servidor **no** valida era, exclusividad de caminos, prerrequisitos, presupuesto de puntos ni número de poderes (igual que hoy no valida nivel ni atributos, informe API §3): son avisos de cliente. Mensajes en inglés con el valor recibido, estilo actual (`Invalid CaminoMetal: '…'.`).

### 5.4 Espejo en `src/types/index.ts`

```ts
export type RuleSetId = 'stormlight' | 'mistborn'
export type Era = 'era1' | 'era2' | 'ambas'
export interface Campaign { /* actuales */ ruleSet: RuleSetId; era: Era | null }
export interface ArteDerivada { grados: number; modificador: number; limite: number; dado: string; alcanceMetros: number; cargasMaxMente?: number | null }
export interface DerivadosSet { alomancia?: ArteDerivada | null; feruquimia?: ArteDerivada | null }
export interface PoderMetal { arte: 'alomancia' | 'feruquimia'; metal: string; estado: 'naciente' | 'completo'; origen: 'camino' | 'clavo' | 'lerasium' | 'medallon'; metaId: number | null }
export interface Character { /* actuales */ caminoMetal: string; poderesMetal: string /* JSON PoderMetal[] */; arquillas: number; derivadosSet?: DerivadosSet | null }
// CreateCharacterRequest añade 'caminoMetal' al Pick; UpdateCharacterRequest añade 'derivadosSet' al Omit
export interface WeaponCatalog { /* actuales */ ruleSet: RuleSetId; era: number | null; price: number | null; isRewardOnly: boolean }  // ídem ArmorCatalog; GearItem añade category: string | null
export interface GlobalNpc { /* actuales */ ruleSet: RuleSetId }
```

## 6. Motor de reglas en servidor

### 6.1 Interfaz y registro

```csharp
// Services/RuleSets/IReglasSet.cs
public interface IReglasSet {
    string Id { get; }
    IReadOnlyDictionary<string, List<ReglaTalento>> ReglasTalentos { get; }
    void ValidarIdentidad(string caminoHeroico, string caminoRadiante, string caminoMetal, string ascendencia);   // ArgumentException → 400
    bool TieneInvestidura(CharacterEntity c, IReadOnlyList<string> talentos);
    BonosForma BonosAtributos(CharacterEntity c, IReadOnlyList<string> talentos, out string? origen);          // reutiliza el record del WIP sin renombrar
    bool DesvioBonoSeAcumula { get; }
    DerivadosSet? Derivar(CharacterEntity c, IReadOnlyList<string> talentos);
}
public interface IReglasSetProvider { IReglasSet Obtener(string? ruleSetId); }   // null/desconocido → Stormlight
```
Registro en `Services/Bootstrap.cs:19-35` (tres líneas): `AddSingleton<IReglasSet, StormlightReglas>()`, `AddSingleton<IReglasSet, MistbornReglas>()`, `AddSingleton<IReglasSetProvider, ReglasSetProvider>()`. Son clases sin estado ni BD, por eso singleton. `CharacterService(CosmereContext db, IReglasSetProvider reglas)` (ctor primario, `CharacterService.cs:10`).

### 6.2 Dónde se invoca (archivo:línea actual → cambio)

| Línea | Cambio |
|---|---|
| `CharacterService.cs:12-33` | Mover los 3 `HashSet` y `ValidateCaminos` a `StormlightReglas.ValidarIdentidad` sin cambiar texto ni orden de comprobaciones. |
| `:37/:52/:68/:101/:137` (tras `Ensure*`) | `var set = await ObtenerReglasAsync(campaignId);` — una consulta `db.Campaigns.AsNoTracking().Where(c=>c.Id==campaignId).Select(c=>c.RuleSet).FirstOrDefaultAsync()`. |
| `:79` y `:118` | `set.ValidarIdentidad(request.CaminoHeroico, request.CaminoRadiante, request.CaminoMetal ?? character.CaminoMetal, request.Ascendencia)`. |
| `:81-92` (creación) | `CaminoMetal = request.CaminoMetal`. |
| `:172-199` (`ApplyUpdate`) | `if (r.CaminoMetal is not null) c.CaminoMetal = r.CaminoMetal;` ídem `PoderesMetal`, `Arquillas`. |
| `:47/:63/:96/:122/:154` | `MapToResponse(c, set, ctx)`. |
| `:310` (`MapToResponse`) | Firma `MapToResponse(CharacterEntity c, IReglasSet set, ContextoJuego? ctx = null)`; `:314-315` → `var fb = set.BonosAtributos(c, talentos, out var forma);`; `var tieneInv = set.TieneInvestidura(c, talentos);`. |
| `:237-239` (`BuildInvLineas`) | Parámetro `bool tieneInvestidura` en lugar de `string.IsNullOrEmpty(c.CaminoRadiante)`. |
| `:288-301` (`BuildDesvioLineas`, WIP) | `set.DesvioBonoSeAcumula ? suma : mayor`. Stormlight = `false` (comportamiento actual). |
| `:336-379` (8 `Calcular`) | Añadir al final `reglas: set.ReglasTalentos, tieneInvestidura: tieneInv`. |
| tras `:405` | `DerivadosSet = set.Derivar(c, talentos)`, `CaminoMetal = c.CaminoMetal`, `PoderesMetal = c.PoderesMetal`, `Arquillas = c.Arquillas`. |
| `TalentosReglas.cs:170-177` (`Calcular`) | Dos parámetros opcionales **al final**: `IReadOnlyDictionary<string, List<ReglaTalento>>? reglas = null, bool? tieneInvestidura = null`. `:182` → `foreach (var (nombre, rs) in reglas ?? Reglas)`. |
| `TalentosReglas.cs:218` (`EsActiva`) | `CondicionRegla.TieneInvestidura => tieneInvestidura ?? !string.IsNullOrEmpty(c.CaminoRadiante)` (el parámetro se propaga a `EsActiva`). |
| `TalentosReglas.cs:240-261` (`GradosDe`) | Rama por defecto: buscar `habilidad` en `HabilidadPersonalizada1..6` (comparación `OrdinalIgnoreCase` tras quitar tildes) y devolver su `Valor`. Afecta a ambos sets solo cuando una regla `PorHabilidad` nombra una habilidad personalizada (hoy ninguna). |

### 6.3 Implementaciones

**`StormlightReglas`**: `ValidarIdentidad` = código actual + `caminoMetal != "" → ArgumentException`; `TieneInvestidura` = `!string.IsNullOrEmpty(c.CaminoRadiante)`; `BonosAtributos` = `FormasCantor.BonosActivos(c.Ascendencia, talentos)` y `origen = FormasCantor.EsCantor(...) ? FormasCantor.FormaActiva(talentos) : null`; `DesvioBonoSeAcumula=false`; `ReglasTalentos = TalentosReglas.Reglas`; `Derivar → null`. **Cero cambio de comportamiento**, verificable con T02.

**`MistbornReglas`** (`Services/RuleSets/MistbornReglas.cs` + `MistbornDatos.cs` con las listas):

| Miembro | Regla | Cita |
|---|---|---|
| `ValidarIdentidad` | §5.3 | L.19 / PDF 25; L.32-39 / PDF 38-45 |
| `TieneInvestidura` | `CaminoMetal ∈ {brumoso, nacido-de-la-bruma, nacidoble}` **o** algún poder de `PoderesMetal` con `arte=alomancia` y `origen=clavo` [inferido: el clavo da Investidura si no la tenías] | L.26 / PDF 32; L.129 / PDF 135; L.290 / PDF 296 |
| `ReglasTalentos` | copia de `TalentosReglas.Reglas` + `["Resistencia koloss"] = [MaxSalud, PorNivel, 1, Siempre]`. `Investido` (+rango) ya existe con el mismo texto | L.38 / PDF 44; L.136 / PDF 142 |
| `BonosAtributos` | Bendición por marcador `~bendicion~X`: Consciencia DIS+2; Potencia FUE+1, VEL+1; Presencia INT+1, PRE+1; Estabilidad VOL+2; Fortaleza Desvio+1. Talento `Tamaño desmedido` → FUE+1. `origen` = «Bendición: X» | L.34-35 / PDF 40-41; L.39 / PDF 45 |
| `DesvioBonoSeAcumula` | `true` [inferido; Q8] | L.35 / PDF 41 |
| `Derivar` | Para cada arte con habilidad presente (`HabilidadPersonalizadaN == "Alomancia"/"Feruquimia"`) o implicada por `CaminoMetal`: `Grados=valor`; `Modificador=grados+Voluntad` (Alomancia) o `+Intelecto` (Feruquimia); tabla grados→(límite, dado, alcance): 0→(1, "", 3), 1→(1,"d4",6), 2→(2,"d6",12), 3→(3,"d8",24), 4→(4,"d10",48), 5→(5,"d12",96), ≥6→(Rango(level),"d20",192). Feruquimia: `CargasMaxMente = 2 + grados + (talentos∋"Mentes de metal ampliadas" ? Rango : 0)`. Sin habilidad ni camino → `null` | L.163 / PDF 169; L.131 / PDF 137; L.146 / PDF 152 |

### 6.4 Metas de nacido del metal y Desprovisto

- `MetaService` no cambia: mismas reglas (3 hitos, éxito/crecimiento/fracaso; L.282-284 / PDF 288-290). La meta «Entrenar tu(s) poder(es)» / «Fabricar tu(s) mente(s) de metal» (L.132-133 / PDF 138-139) es una `Meta` normal creada por el cliente al elegir el camino y enlazada por `PoderMetal.metaId`.
- **Desprovisto [poder]** (L.310 / PDF 316) y «Beber vial» (L.129 / PDF 135) son estado de escena: en v1 viven en el cliente (`localStorage`, decisión (e)); el servidor no los conoce. Enciclopedia: overlay de estados (T21).

### 6.5 Convivencia con el WIP de formas de cantor

Condición de entrada a F2: WIP commiteado y `dotnet build` verde (T01). Reglas: no renombrar `BonosForma` ni `FormasCantor`; no reescribir `Build*Lineas` (solo el parámetro `tieneInvestidura` y el `bool` de acumulación); propiedades nuevas al final de `CharacterResponse`; parámetros opcionales al final de `Calcular`. El WIP ya dejó `CondicionRegla.TieneInvestidura` sin reglas que la usen: el cambio de `EsActiva` es inocuo hoy.

## 7. Frontend

### 7.1 Estado, tipos, hidratación

- `store/campaignStore.ts:5-20`: sin cambiar el shape persistido (`cosmere-campaign`). Añadir selectores `export const useRuleSet = () => useCampaignStore(s => s.currentCampaign?.ruleSet ?? 'stormlight')` y `useEra = () => useCampaignStore(s => s.currentCampaign?.era ?? null)`. Objetos persistidos antiguos sin `ruleSet` caen a Stormlight; el siguiente `getById` los sobrescribe.
- `components/AppLayout.tsx:13-17`: gate `ready = currentCampaign?.id === Number(campaignId)`; `useQuery(['campaign', id])` compartida con `CampaignSettingsPage.tsx:28`; `useLayoutEffect` fija `document.documentElement.dataset.ruleset` (y lo borra al desmontar); `<Outlet/>` y `<DiceRoller/>` solo con `ready`; si la petición falla, `ErrorMessage` + `Button` «Reintentar» (hoy `.catch(() => {})` deja la UI colgada).
- `index.html:18-26`: segundo script previo a la pintura que lee `localStorage['cosmere-campaign']`, compara `state.currentCampaign.id` con `location.pathname.match(/^\/campaigns\/(\d+)/)` y pone `data-ruleset` si coincide (`try/catch`).
- `store/themeStore.ts:12,19-32`: `THEME_BG` por set y `applyTheme(mode, ruleSet = document.documentElement.dataset.ruleset)`.
- `src/rulesets/`: `types.ts` (`RuleSetUi`), `stormlight.ts`, `mistborn.ts`, `index.ts` (`RULESETS`, `useRuleSetUi()`), `skills.ts` (tabla única), `eras.ts` (helpers `disponibleEnEra(item, era)`).

```ts
export interface RuleSetUi {
  id: RuleSetId; name: string; shortName: string; emblemIcon: string; worldName: string   // 'Roshar' | 'Scadrial'
  features: { caminoRadiante: boolean; idealesJurados: boolean; marcos: boolean; formasCantor: boolean; potencias: boolean;
              artesMetalicas: boolean; arquillas: boolean; mencionSpren: boolean; pestanaAventura: boolean; caminoMetal: boolean; eras: boolean }
  ascendencias: { id: string; label: string; icon: LucideIcon; eras?: Era[] }[]
  puntosAtributoBase: (ascendencia: string) => number        // 12; kandra 6 (L.34 / PDF 40)
  topeAtributo: (ascendencia: string, attr: string, talentos: string[]) => number   // 5; koloss FUE 6; Bendiciones +N
  capacidadCargaKg: number[]                                  // ST 22,5/45/112,5/225/1125/2250; MB 25/50/125/250/1250/2500 (L.50 / PDF 56)
  currency: { symbol: 'mc' | 'ar'; image: string | null; decimals: 0 | 2 }
  encyclopedia: TopicDef[]
  investiduraHint: string                                     // «Solo disponible para Radiantes» | «Solo disponible para alomantes»
  themeBg: { light: string; dark: string }
}
```

### 7.2 Rutas y navegación

- `App.tsx:46-66`: rutas nuevas `encyclopedia/origenes`, `encyclopedia/nacidos-del-metal`, `encyclopedia/artes-metalicas`, `encyclopedia/artes-metalicas/:arte/:metal`, todas envueltas en `<RuleSetGate only="mistborn">`; `radiant-orders` y `potencias` en `<RuleSetGate only="stormlight">`. `RuleSetGate` redirige a `../encyclopedia`. Páginas MB con `React.lazy` (control de bundle).
- `Sidebar.tsx:38-54`: sin cambio de estructura. `RuleSetBadge` (set · era) bajo el nombre de campaña (`:153-168`), en el `title` del carril (`:261-268`) y en el eyebrow móvil (`:353-357`).
- `GmPage.tsx:8-20`: pestaña «Aventura» solo si `features.pestanaAventura`.

### 7.3 Creación de campaña (`CampaignListPage.tsx`)

`Sheet` (`ui.tsx:920`) «Nueva campaña» sustituye al `InlineForm` de creación (`:16-91`, `:222-235`; el de «Unirse» se queda): `Field`+`Input` nombre (autoFocus) · eyebrow «Ambientación» · `Segmented` (`ui.tsx:686`) `[{value:'stormlight', label:'Tormentas', ariaLabel:'Archivo de las Tormentas'}, {value:'mistborn', label:'Bruma', ariaLabel:'Nacidos de la bruma'}]` con `CosmereIcon` `archivo-tormentas` / `nacidos-bruma-emblem` · vista previa `aria-live="polite"` (emblema 40 px + frase) · si `mistborn`: eyebrow «Era», `Segmented` `['Era 1','Era 2','Entre eras']` → `era1|era2|ambas`, pista bajo el control (`Era 1: «El Mundo de Ceniza». El libro advierte de un tono más sombrío.` L.372 / PDF 378) · aviso `tone.topacio` «La ambientación no se puede cambiar después de crear la campaña.» · footer `Button` secondary «Cancelar» / primary «Crear campaña» (`disabled` si `!name.trim() || (mistborn && !era) || isPending`). `campaignsApi.create({ name, ruleSet, era })`. Tarjeta (`:343-478`): chip del set y chip «ERA 1 / ERA 2 / ENTRE ERAS» (`tone.granate` / `tone.zafiro` [inferido]).

### 7.4 Ficha (`CharacterDetailPage.tsx`; líneas anclables por texto, el fichero tiene cambios sin commitear)

| Zona | Stormlight | Nacidos de la Bruma |
|---|---|---|
| Identidad (3 `IdentityItem`) | Ascendencia · Camino · Orden | Ascendencia (`Humano`, `Kandra`, `Sangre koloss` solo `era2|ambas`) · Camino heroico · **Camino de nacido del metal** (icono Lucide del camino; glifo del metal si tiene un solo poder) |
| Botón Forma (`isCantor`) | igual | oculto (`features.formasCantor=false`) |
| Investidura | «Solo disponible para Radiantes» | `investidura.total > 0` según servidor; pista `investiduraHint`; `Stepper` de Investidura actual (`localStorage` `cosmere-recursos:<charId>`) |
| Aviso de puntos de atributo (`getPuntosAtributoEsperados`) | 12 +1 en 3/6/9/12/15/18 | base `puntosAtributoBase(ascendencia)` (kandra 6, L.34 / PDF 40); mismos hitos (L.27 / PDF 33) |
| Tope de atributo (`max={5}`) | 5 | `topeAtributo()` (koloss FUE 6, L.38 / PDF 44; Bendiciones +N, L.34-35) |
| Huecos personalizados (`isPotencia`, `SurgeIcon`) | potencias de la orden | `esArteInvestida` (`Alomancia`/`Feruquimia`): nombre y atributo bloqueados, icono `Flame`/`Anvil` [inferido] |
| Habilidades (`SECTIONS`) | etiquetas actuales (Q3) | etiquetas del libro: Armamento ligero/pesado, Saber, Atletismo (FUE), Intimidación (VOL) (hoja L.402 / PDF 408) |
| Pickers | Ascendencia, Camino heroico, Forma, Orden | Ascendencia (por era), Camino heroico (igual), **Camino de nacido del metal** (5, filtrados por era L.372 / PDF 378; descripción «Los caminos de nacido del metal son excluyentes; puedes elegirlo en cualquier nivel tomando su talento principal», L.127-128 / PDF 133-134), **Bendición kandra** (5) |
| Pestañas (`caracteristicas`, `atributos`, `background`) | igual | + **«Artes metálicas»** si `poderesMetal.length > 0 || caminoMetal` |

**Al elegir camino de nacido del metal** (misma técnica que el picker de orden radiante, `CharacterDetailPage.tsx` ≈`:1265-1313`): escribe `caminoMetal`; inserta el talento principal en `talentos` salvo si es camino inicial (decisión (k)); crea `Alomancia` (`VOL`) y/o `Feruquimia` (`INT`) con valor 1 en el primer hueco cognitivo libre (hueco 3-4, `ATRIBUTO_SLOTS`); crea en `poderesMetal` los poderes nacientes elegidos en un selector de metales (cuadrícula 4×4 + atium, filtrada por era y camino: atium solo brumoso/nacido de la bruma; bendaleo, cadmio, cromo, nicrosil solo brumoso/nacidoble; `nacido-de-la-bruma`/`feruquimista` reciben **todos** los de la era; atium nace `completo`, L.177 / PDF 183); crea la(s) `Meta` «Entrenar tu poder» / «Fabricar tu mente de metal» (nacidoble: ambas, L.155 / PDF 161) y guarda su `id` en `metaId`. Al quitar el camino, `ConfirmDialog` y limpieza inversa.

**Pestaña «Artes metálicas»** (hoja L.404 / PDF 410): dos `Card` cabecera por arte con `StatTile` MOD. / ALCANCE / DADO / LÍMITE desde `derivadosSet`; una `Card` por poder con glifo del metal, subtítulo (`Físico – Externo – Empujón`), interruptor `Switch` «Meta de nacido del metal completada» (enlaza a `metaId`), efecto, `Stepper` de cargas (feruquimia, máx `cargasMaxMente`) o viales/cuentas (alomancia raros/atium) en `localStorage`, estado Desprovisto (`Badge` `tone.topacio`) y acción «Beber vial» (restaura Investidura actual al máximo y gestiona Desprovisto por metal, L.129 / PDF 135), lista de talentos del poder aprendidos (`talentos` ∩ árbol del poder). Lista sin tope (un nacido de la bruma supera las 4 casillas del papel [inferido]).

### 7.5 Talentos (`talentGraph.ts`, `talentMap.ts`, `components/talentos/*`)

Molde: cada poder de metal es una `Potencia` (`atributo`, `costoBase`, `talentos: Talento[]`) y cada camino NdM un `HeroicPath` sin especialidades y con un árbol plano (informe talentos §5.1). Cambios mínimos, en este orden:

1. **Parametrización** (`talentGraph.ts:42-45`, `160-202`): `buildTalentGraph(options, set: ReglasSetTalentos = STORMLIGHT_TALENTOS)`, `catalog(set)` cacheado por `set.id`, `allTalentNames(set?)`, `talentSlotsAt(level, ascendencia, startingPathId?, set?)`, `talentBudget(ch, graph)` (el grafo lleva `set`). `ReglasSetTalentos = { id, caminosHeroicos, caminosEspeciales, potencias, arbolesAscendencia, grids, summaries, skillNameMap, nombresIdeales | null }` en `src/lib/talentSets.ts`. Sin cambio de salida para Stormlight.
2. **Gramática** (`parseClause` `:232-272`): `SKILL_NAME_MAP` += `'Armamento ligero'`, `'Armamento pesado'`; cláusula `poder` (`^(?:poder\s+)?(alomancia|feruquimia) de (.+)$` → `met` si `state.poderes` contiene `${arte}:${metal}` con `completo`); `skillAny` («Armamento pesado 2 o más o Armamento ligero 2 o más»); `atributo` («Voluntad 4 o más», `TalentState.atributos`); `ancestry` generalizada a `string[]` («humana o de sangre koloss», «kandra»); `poderes` (`mismoMetal | metalesDistintos`, Componedor / Resonancia aleada, L.158-159 / PDF 164-165). «No tener ningún otro talento de ruptura o herencia» **no** se parsea: la exclusividad la garantiza el picker (un solo `caminoMetal`); la cláusula se añade a una lista `IGNORAR` para que no bloquee como `unknown`.
3. **Grafo** (`:297`, `:411-561`, `:1081`, `:1125-1159`): `TreeKind += 'nacidoMetal' | 'poderMetal' | 'ascendencia'`; `TalentGraphOptions += caminoMetal?, poderes?: readonly PoderMetal[], ascendencia?`; bloque nuevo entre el radiante y el cantor: raíz `nacidoMetal:<camino>` (clave = principal; `autoGranted` si camino inicial) + árbol plano del camino + un árbol `poder:<arte>:<metal>` por poder del personaje (`keyNodeId` = principal, como `potencia:*` con el Primer Ideal, `:490`); árboles de ascendencia `ascendencia:kandra` (autoGranted «Forma natural», «Disfraz kandra», L.35-37 / PDF 41-43) y `ascendencia:sangre-koloss` (autoGranted «Resistencia koloss», L.38 / PDF 44). `SlotKind += 'nacidoMetal' | 'poder' | 'ascendencia'`; `slotKindOf` deja de caer en `'radiante'` (`:1155`); hueco de nivel acepta todo; hueco humano solo `heroico`; hueco de ascendencia kandra/koloss acepta `['ascendencia','heroico']`; hueco principal acepta `nacidoMetal` si es camino inicial [inferido, informe talentos §5.4 #9].
4. **Mapa y UI**: `gridKeyOf` (`talentMap.ts:76-81`) devuelve `poder:<arte>:<metal>`, `nacidoMetal:<camino>`, `ascendencia:<id>`; `PlateKind += 'poder' | 'nacidoMetal' | 'ascendencia'`; `PathAtlas` pinta solo las láminas de los poderes del personaje (como la orden solo pinta sus 2 potencias) y el resto en un `Disclosure` «Otros poderes» (patrón `showOthers`, `TalentosDetailPage.tsx:129-144`); si el personaje tiene más de 3 poderes, `model.plates` se trocea en filas de 3 con un bus por fila (`PathAtlas.tsx:224`, `mapDims` `talentMap.ts:225-251`); `gateBadge: 'meta'` con glifo del metal (hoy `'ideal'`, `MapPieces.tsx:91-94`); textos «Meta de nacido del metal pendiente» (`TalentLamina.tsx:36-41`, `TalentSheet.tsx:31,41`); `TalentosDetailPage.tsx:447` «…o un camino de nacido del metal»; `IdealesControl` y formas ocultos por `features`; `MyTalents` sustituye `RADIANT_ACTIONS` por «Beber vial (1)» y las acciones básicas de cada poder.
5. **Datos de rejilla**: sin entrada en `TALENT_GRIDS` el mapa cae a 2 carriles en orden de lectura (`talentMap.ts:105`): primera entrega aceptable; después rejillas transcritas del PDF renderizado (T34).

### 7.6 Metas, bolsa, dados, enciclopedia, catálogo, PNJ, tema, iconos

| Pantalla | Cambio | Primitivas `ui.tsx` / DESIGN.md |
|---|---|---|
| Metas (`MetasDetailPage.tsx:24-60, 348-381`) | `Badge` «Meta de nacido del metal» cuando algún `PoderMetal.metaId === meta.id`; al concluir con éxito, `ConfirmDialog` «¿Marcar el poder X como completo?». Pills de identidad por set (`CharacterIdentityPills`). | `Badge`, `ConfirmDialog` |
| Bolsa (`BolsaDetailPage.tsx:32-33, 233-241, 332-429, 785`) | Sección «Arquillas» (un `Stepper` con decimales, diálogos «Añadir/Gastar arquillas») en lugar de «Marcos» cuando `features.arquillas`; `getCapacity` lee `capacidadCargaKg`; precio `{n} ar` con `toLocaleString('es-ES')` e imagen `dinero-era1/2` o `Coins`; picker con `Input` de búsqueda y chips de subcategoría (armas ligeras/pesadas/especiales/fuego; equipo/viales); oculta `isRewardOnly`. | `Stepper`, `Sheet`, `Segmented`, `Input` |
| Dados (`DiceRoller.tsx:25-55, 1012; utils/dice.ts`) | `SKILLS`/`SKILL_TO_FIELDS` desde `rulesets/skills.ts`; `WEAPON_SKILLS` dinámico añade `Alomancia` si existe (ataque «Lanzar una moneda» vs Defensa física, L.172 / PDF 178) con dado por defecto = dado de artes metálicas; `artesMetalicas(grados, rango)` en `utils/dice.ts` junto a `recoveryDieFaces`; texto de Recuperación: «La Investidura no se recupera con el descanso: usa Beber vial» (L.129 / PDF 135). El d12 de trama (`dice.ts:81-90`) es un error previo común a ambos sets: fuera de este proyecto. | sin UI nueva |
| Enciclopedia (`EncyclopediaPage.tsx:109-197, 210`) | `TOPICS` desde `RuleSetUi.encyclopedia`. MB: Orígenes (`tone.granate`), Caminos Heroicos, Caminos de nacido del metal (`tone.topacio`), Artes metálicas (`tone.amatista`, emblema con 4 glifos de metal), Combate, Aventuras, Catálogo («…del mundo de Scadrial»). Subtítulo «Lore y referencia del mundo de {worldName}». `HeroicPathsPage.tsx:250` subtítulo y datos por set. `CombatPage.tsx:68` subtítulo. | `Card`, `PageHeader`, `Tabs`, `Disclosure` |
| Páginas MB nuevas | `OrigenesPage` (3 ascendencias, Bendiciones, árboles kandra/koloss, 15 culturas por era), `CaminosMetalPage` (5 caminos con `Tabs`, talento principal, árbol, qué concede), `ArtesMetalicasPage` (`Tabs` Alomancia / Feruquimia / Hemalurgia; tabla de progresión L.163; cuadrícula de 17 metales con glifo, categoría, era) y detalle `/:arte/:metal` (acciones, usos creativos, talentos con `TalentActivation`). | `Tabs`, `TabPanel`, `Card`, `StatTile`, `TalentActivation` |
| Catálogo (`CatalogPage.tsx:36, 150-157, 881-892`) | claves `['catalog', cId, …]`, `campaignId` en la API, `Price` con `currency`, chip «Era 2», precio en armas y armaduras, campo Precio y «Solo recompensa» en el formulario propio. | existentes |
| PNJ (`GlobalNpcListPage.tsx:96-98`, `GlobalNpcDetailPage.tsx:61-65`, `NpcNotesPage.tsx:420-423`) | `getAll({ ruleSet })`, clave `['global-npcs', ruleSet]`; Investidura del PNJ solo si `maxInvestiture > 0` [inferido]. | existentes |
| Diario (`DiarioPage.tsx:259, 390`) | leyenda `spren` oculta si `!features.mencionSpren`; estado vacío con `emblemIcon` del set. | — |
| Tema (`index.css`) | bloque `:root[data-ruleset='mistborn']`, `:root[data-ruleset='mistborn'][data-theme='light']` y `@media (prefers-color-scheme: light) { :root[data-ruleset='mistborn']:not([data-theme='dark']) }` **después** de los bloques actuales (`index.css:101-298`), con la paleta acero/peltre del informe UI §6.3 (`--brand #a9bccd / #3a5672`, `--bg #0c0b0d / #ebe8e6`, `--atmo` con el rojo del sol de Era 1). Se conservan `--gold*`, `--navy*` y los 10 tonos gema. | solo tokens |
| Iconos | Oficiales primero (DESIGN.md «Iconography»): glifos alománticos Era 1/Era 2 (fuentes incrustadas en PDF 411), glifos feruquímicos (trazados PDF 411), emblema NdB (PDF 410), dinero Era 1/2 (PDF 260) → `src/assets/cosmere/alomancia-era1-<metal>.svg`, `alomancia-era2-<metal>.svg`, `feruquimia-<metal>.svg`, `nacidos-bruma-emblem.svg`, `img/dinero-era1.webp`, `img/dinero-era2.webp`. Componente `MetalGlyph({ metal, arte, era })` con fallback Lucide `Flame`/`Anvil`. Caminos NdM: Lucide `Flame`, `CloudFog`, `Container`, `Package`, `Merge` [inferido]. `StatIcons.investidura` por set (`Gem` / `Flame`). Nunca emojis. | `CosmereIcon`, `cosmereImage` |

## 8. Datos estáticos de Nacidos de la Bruma (`src/data/mistborn/`)

Organización: carpeta nueva `src/data/mistborn/`; los ficheros Stormlight de `src/data/*.ts` **no se mueven** (ningún import cambia). Un `src/data/mistborn/index.ts` re-exporta todo y `src/lib/talentSets.ts` compone `MISTBORN_TALENTOS`. Las páginas MB importan con `React.lazy`/`import()` para no engordar el bundle de Stormlight.

| Fichero | Export (tipo) | Contenido | Libro | Volumen est. |
|---|---|---|---|---|
| `eras.ts` | `ERAS: Record<Era, { label, lema, aviso? }>`, `disponibleEnEra()` | «Era 1: El Mundo de Ceniza» (aviso de tono), «Era 2: Cambio y revolución», «Entre eras» | L.371-372 / PDF 377-378 | 60 líneas |
| `metales.ts` | `METALES: MetalDef[]` (17), `MetalId`, categorías, pareja, puro/aleación, interno/externo, tirón/empujón, nombre de brumoso y de ferrin, rasgo feruquímico, eras, común/raro | tabla de metales | L.166-171 / PDF 172-177 | 180 |
| `progresionArtes.ts` | `PROGRESION_ARTES_METALICAS` (grados 0..6 → límite, dado, alcance), `artesMetalicas()` espejo del servidor | tabla | L.163 / PDF 169 | 30 |
| `alomancia.ts` | `PODERES_ALOMANTICOS: PoderAlomantico[]` (17; `extends Potencia`: `id 'alomancia:acero'`, `name 'Alomancia de acero'`, `atributo 'Voluntad'`, `caminos`, `eras`, `requiereMeta`, `acciones[]`, `usosCreativos[]`, `talentos: Talento[]`) | 20 acciones básicas, 83 talentos (76 distintos), aluminio sin árbol | L.172-212 / PDF 178-218 (acero 172, aluminio 175, atium 176, bendaleo 179, bronce 182, cadmio 185, cinc 188, cobre 191, cromo 193, duraluminio 195, electro 197, estaño 199, hierro 201, latón 204, nicrosil 207, oro 209, peltre 211) | 950 |
| `feruquimia.ts` | `PODERES_FERUQUIMICOS: PoderFeruquimico[]` (17; mismo molde; `almacenar`/`decantar`, `cargasConVinculo`, `medallon`) | 34 acciones, 85 talentos (84 distintos), nicrosil sin árbol; tabla de cobre por grados | L.213-250 / PDF 219-256 | 1000 |
| `caminosNacidosDelMetal.ts` | `CAMINOS_NACIDOS_DEL_METAL: CaminoNacidoDelMetal[]` (5; mismos campos `mainTalent*` que `HeroicPath`, `talentos: Talento[]`, `habilidadesInvestidas`, `poderes`, `concedeInvestidura`, `metasIniciales`, `eras`, `ascendenciaRequerida`, `color`, `icon`) | 5 principales + 33 de árbol (19 nombres únicos) | L.127-159 / PDF 133-165 (brumoso 134-137, nacido de la bruma 138-143, feruquimista 144-147, ferrin 148-151, nacidoble 152-159) | 380 |
| `origenes.ts` | `ASCENDENCIAS_MB`, `BENDICIONES_KANDRA` (5), `ARBOL_KANDRA: Talento[]` (8), `ARBOL_SANGRE_KOLOSS: Talento[]` (5), `CULTURAS: Cultura[]` (15, con era) | orígenes | L.31-48 / PDF 37-54 | 320 |
| `heroicPaths.ts` | `HEROIC_PATHS_MISTBORN: HeroicPath[]` (6; reutiliza por referencia las especialidades comunes de `../heroicPaths` y añade Rebelde, Mataneblinos, Francotirador, Estafador, Inventor (Era 2), Alborotador, Pistolero (Era 2), Planificador) | 8 especialidades nuevas (≈8 talentos cada una) | cap. 4 L.73-126 / PDF 79-132 | 650 |
| `hemalurgia.ts` | `TIPOS_CLAVO` (12), `REGLAS_HEMALURGIA` (texto: implantar 3 acciones Medicina CD 20, extraer 1 acción CD 10, máx. clavos = rango ≤ 3, −2/−5 Defensa espiritual) | solo enciclopedia en v1 | L.251 / PDF 257; L.288-292 / PDF 294-298 | 120 |
| `aventurasOverlay.ts` | `MISTBORN_AVENTURAS: AventurasOverlay` | +Desprovisto, +Mermado, −Empoderado, Inconsciente sin excepción radiante, descansos +«Almacenar en mentes de metal», +«Mentoría en las artes metálicas», moneda y ejemplos (17 operaciones) | L.306-315 / PDF 312-321 | 150 |
| `combatOverlay.ts` | `MISTBORN_COMBATE: CombatOverlay` | Agarrar → Retenido; Acometida reactiva + sin armas; Sorpresa por personaje; zona «poderes y capacidades»; Interactuar (6 operaciones) | L.317-329 / PDF 323-335 | 50 |
| `talentGrids.ts` | `TALENT_GRIDS_MISTBORN: Record<string, TalentGrid>` claves `poder:alomancia:<metal>` (16), `poder:feruquimia:<metal>` (16), `nacidoMetal:<camino>` (5), `ascendencia:kandra|sangre-koloss`, `heroico:<camino>:<Especialidad>` (8) | geometría de diagramas (solo en imagen; T34) | diagramas en las páginas de cada entrada | 450 |
| `talentSummaries.ts` | `TALENT_SUMMARIES_MISTBORN: Record<string, string>` | una frase por talento (≈210) | líneas de los diagramas | 230 |
| `equipoInicial.ts` (F7) | `EQUIPO_INICIAL: PaqueteInicial[]` (7) | Artesano 4d8, Bajos fondos 1d20, Fugitivo, Guardador, Indagador 3d12, Mercenario 2d6, Noble 4d20; ×10 en Era 2 | L.254-255 / PDF 260-261 | 120 |
| `viajes.ts` (F7) | alojamiento, monturas, vehículos | enciclopedia | L.272 / PDF 278 | 40 |

Marcas obligatorias en los datos: `notaLibro` para erratas (Revitalizar «8» vs «acción gratuita», «Enhaciendo el no ver», Ráfaga de monedas sin «poder», límite «igual al rango» con 6+ grados, Lupa 200 ar) y comentario `// [inferido]` en filas reconstruidas (tablas de metales por posición, disponibilidad de duraluminio/electro para nacido de la bruma a finales de la Era 1).

## 9. Plan por fases y tareas

Formato: **Tnn · Título** — fase · repo · tamaño · dependencias. Cada tarea es autosuficiente junto a las secciones 2-8. Verificación base: `cd cosmere-web && npx tsc -b` (nunca `--noEmit`), `npm run lint`; `cd cosmere-api && dotnet build`; migraciones con la API parada.

### F0 — Salvaguardas (sin cambios de producto)

**T01 · Estabilizar y commitear el WIP de formas de cantor** — F0 · api · S · —
- Archivos: `Services/Characters/CharacterService.cs`, `TalentosReglas.cs`, `FormasCantor.cs`, `Messages/Characters/Out/CharacterResponse.cs` (solo los de Xavi; no editar contenido).
- Cambios: `dotnet build` verde; commit del WIP (lo hace Xavi o con su visto bueno). Si el WIP no está listo, F2 espera; F1 y F3 no dependen de él.
- Aceptación: `git status` limpio en `cosmere-api`; `dotnet build` sin errores. Fuera de alcance: cualquier cambio funcional.

**T02 · Captura JSON de referencia de los personajes Stormlight** — F0 · api · S · T01
- Cambios: con la API arrancada, guardar `GET /campaigns/{id}/characters` y `GET /campaigns/{id}/characters/{charId}?enCombate=true` de 3-4 personajes reales (con talentos, forma de cantor, armadura) en una carpeta fuera de los repos (p. ej. `%TEMP%\cosmere-regresion\`). Añadir el caso trabajado del informe API §1.6 (nivel 7, FUE 2, VEL 3, INT 1, VOL 2, DIS 1, PRE 3, windrunners, Robusto+Compostura+Investido → salud 49, concentración 6, defensas 15/13/14, Investidura 7, movimiento 9).
- Aceptación: ficheros JSON guardados y nombrados por id. Se reutilizan en T10, T12.

**T03 · Prueba de humo de `parsePrereq` con prerrequisitos de Nacidos de la Bruma** — F0 · web · S · —
- Archivos: script temporal en el scratchpad (no en el repo), ejecutado con `npx tsx` contra `src/lib/talentGraph.ts`.
- Cambios: llamar a `parsePrereq` con: `Alomancia 3 o más; talento principal Ruptura de brumoso`, `poder Alomancia de acero`, `Armamento pesado 2 o más o Armamento ligero 2 o más; talento Ráfaga de monedas`, `Voluntad 4 o más; talento Mentes de metal ampliadas`, `ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia`. Registrar qué cláusulas salen `unknown`/`skill` con `field null`.
- Aceptación: tabla resultado→cláusula anotada en el scratchpad; confirma o corrige las deducciones del informe de talentos §2.2 antes de T31.

### F1 — Discriminador de campaña (la app sigue 100 % Stormlight)

**T04 · `RuleSetIds`/`EraIds` + columnas de campaña + migración `AddCampaignRuleSet`** — F1 · api · S · T01
- Archivos: crear `Messages/RuleSets/RuleSetIds.cs` (clases `RuleSetIds` y `EraIds` de §2 con `Todos` y `EsValido`); `Messages/Database/Entities/CampaignEntity.cs` (`RuleSet`, `Era` de §4.1); migración.
- Comandos: `dotnet ef migrations add AddCampaignRuleSet --project Infrastructure --startup-project API` (API parada) → revisar que el `Up` sea exactamente el de §4.3 #1 → `dotnet ef database update --project Infrastructure --startup-project API`.
- Aceptación: `SELECT "RuleSet","Era" FROM "Campaigns"` devuelve `stormlight`/`NULL` en todas las filas; `dotnet build` verde.

**T05 · Contrato de campaña: DTOs y `CampaignService`** — F1 · api · S · T04
- Archivos: `Messages/Campaigns/In/CreateCampaignRequest.cs`, `Messages/Campaigns/Out/CampaignResponse.cs` (§5.1); `Services/Campaigns/CampaignService.cs:65-72` (validación de §5.2 y asignación `RuleSet`, `Era`), `:17-33` (`RuleSet = m.Campaign.RuleSet, Era = m.Campaign.Era`), `:48-62` y `:115`.
- Aceptación: `POST /campaigns {"name":"x"}` crea `stormlight`; `{"name":"x","ruleSet":"mistborn"}` → 400; `{"name":"x","ruleSet":"mistborn","era":"era2"}` → 200 con `ruleSet`/`era`; `GET /campaigns` y `/campaigns/{id}` incluyen ambos campos. Fuera de alcance: edición de la era (T43).

**T06 · Tipos, API cliente, selectores y módulo `src/rulesets/`** — F1 · web · M · T05
- Archivos: `src/types/index.ts` (`RuleSetId`, `Era`, `Campaign.ruleSet/era`); `src/api/campaigns.ts:10-11` (`create(data: { name: string; ruleSet: RuleSetId; era: Era | null })`); `src/store/campaignStore.ts` (`useRuleSet`, `useEra`); crear `src/rulesets/types.ts`, `stormlight.ts`, `mistborn.ts`, `index.ts` (§7.1; `mistborn.ts` con `features`, `ascendencias`, `capacidadCargaKg`, `currency`, `investiduraHint`, `themeBg`; `encyclopedia` MB provisional = Caminos Heroicos, Combate, Aventuras, Catálogo).
- Aceptación: `npx tsc -b` verde; `CampaignListPage.tsx:132` adaptado a `create({ name: newName, ruleSet: 'stormlight', era: null })` (la UI nueva llega en T08). Ninguna pantalla cambia visualmente.

**T07 · Hidratación con gate, `data-ruleset` y tema por set** — F1 · web · M · T06
- Archivos: `src/components/AppLayout.tsx:13-17` (§7.1: `useQuery(['campaign', id])`, `ready`, `useLayoutEffect` con `dataset.ruleset`, `Spinner` mientras carga, `ErrorMessage` + «Reintentar» + «Volver a campañas»); `index.html:18-26` (script previo a la pintura); `src/store/themeStore.ts` (`THEME_BG` por set, `applyTheme(mode, ruleSet?)`); `src/pages/campaigns/CampaignSettingsPage.tsx:28` usa la misma clave.
- Aceptación: abrir por URL directa una campaña distinta de la persistida nunca muestra un frame con el `isGm` ni el set equivocados; sin red, se ve el error con reintento; `document.documentElement.dataset.ruleset` existe solo bajo `/campaigns/:id/*`. Stormlight: ningún token cambia (no hay regla CSS para `data-ruleset='stormlight'`).

**T08 · Creación de campaña con ambientación y era; chips e insignia** — F1 · web · M · T06, T07
- Archivos: `src/pages/campaigns/CampaignListPage.tsx` (§7.3: `Sheet` nuevo, `InlineForm` solo para unirse; `CampaignCard` con chips); crear `src/components/RuleSetBadge.tsx`; `Sidebar.tsx:153-168, 261-268, 353-357`; `HomeCampaignPage.tsx:47-57`; `CampaignSettingsPage.tsx` sección «Ambientación» (solo lectura, `SectionTitle` + dos `StatTile`).
- Textos: «Nueva campaña», «Nombre de la campaña», «Ambientación», «Tormentas»/«Bruma», «Era», «Era 1»/«Era 2»/«Entre eras», «La ambientación no se puede cambiar después de crear la campaña.», «Crear campaña», «Cancelar».
- Aceptación: crear Stormlight y Mistborn/Era 2 funciona; «Crear campaña» deshabilitado sin era en Mistborn; foco en el nombre al abrir; `Segmented` con `ariaLabel`; sin colores literales; `npx tsc -b` y `npm run lint` verdes. Icono `nacidos-bruma-emblem` provisional = `CosmereIcon name="cosmere-emblem"` hasta T41.

**T09 · `RuleSetGate`, temas de enciclopedia por set, pestaña Aventura y diario** — F1 · web · S · T06
- Archivos: crear `src/components/RuleSetGate.tsx` (`{ only: RuleSetId; children }` → `<Navigate to="../encyclopedia" replace/>` si no coincide); `src/App.tsx:51-56` envolver `radiant-orders` y `potencias`; `EncyclopediaPage.tsx:109-197, 210` (`TOPICS` desde `useRuleSetUi().encyclopedia`, subtítulo con `worldName`); `GmPage.tsx:8-20` (`features.pestanaAventura`); `DiarioPage.tsx:259, 390` (`features.mencionSpren`, `emblemIcon`).
- Aceptación: en Stormlight, enciclopedia y director idénticos a hoy; en Mistborn no aparecen Órdenes ni Potencias y `/encyclopedia/potencias` redirige; la pestaña Aventura desaparece.

### F2 — Motor de servidor envuelto (Stormlight idéntico; Mistborn preparado)

**T10 · `IReglasSet`, `StormlightReglas`, provider y enganche en `CharacterService` sin cambio de comportamiento** — F2 · api · L · T01, T02, T04
- Archivos: crear `Services/RuleSets/IReglasSet.cs`, `IReglasSetProvider.cs`, `ReglasSetProvider.cs`, `StormlightReglas.cs` (§6.1, §6.3); `Services/Bootstrap.cs:19-35`; `Services/Characters/CharacterService.cs` (§6.2 todas las filas salvo las de `CaminoMetal`/`PoderesMetal`/`DerivadosSet`); `Services/Characters/TalentosReglas.cs:170-177, 182, 214-224` (parámetros opcionales al final).
- Aceptación: `dotnet build` verde; los JSON de T02 son **byte a byte iguales** (mismo orden de líneas, mismos totales) tras el cambio; un personaje con `CaminoRadiante=""` sigue con Investidura 0. Fuera de alcance: `MistbornReglas` (T12).

**T11 · Columnas de personaje y migración `AddCharacterMistbornFields`** — F2 · api · M · T10
- Archivos: `Messages/Database/Entities/CharacterEntity.cs` (3 propiedades de §4.1 tras `IdealesJurados`); `Messages/Characters/In/CharacterRequest.cs` (§5.1); `Messages/Characters/Out/CharacterResponse.cs` (3 propiedades al final); `CharacterService.cs` creación (`CaminoMetal`), `ApplyUpdate` (asignación condicional), `MapToResponse` (copia).
- Comandos: `dotnet ef migrations add AddCharacterMistbornFields --project Infrastructure --startup-project API` → `Up` como §4.3 #2 → `database update`.
- Aceptación: `PUT` sin los tres campos conserva los valores; `GET` devuelve `caminoMetal:""`, `poderesMetal:"[]"`, `arquillas:0` en personajes existentes.

**T12 · `MistbornReglas` + `DerivadosSet`** — F2 · api · L · T11
- Archivos: crear `Services/RuleSets/MistbornReglas.cs`, `MistbornDatos.cs` (caminos, ascendencias, metales, caminos alománticos, Bendiciones), `Messages/Characters/Out/DerivadosSet.cs`, `Messages/Characters/PoderMetalDto.cs`; `CharacterResponse.cs` (`DerivadosSet?` al final); `CharacterService.cs` (`DerivadosSet = set.Derivar(c, talentos)`); `TalentosReglas.cs:240-261` (`GradosDe` con huecos personalizados); `Bootstrap.cs` (`AddSingleton<IReglasSet, MistbornReglas>()`).
- Reglas: §6.3 tabla completa. Libro: L.26 / PDF 32, L.34-35 / PDF 40-41, L.38 / PDF 44, L.129 / PDF 135, L.131 / PDF 137, L.136 / PDF 142, L.146 / PDF 152, L.163 / PDF 169.
- Aceptación: en una campaña `mistborn`, personaje con `CaminoMetal="brumoso"`, DIS 1, PRE 3, `HabilidadPersonalizada3="Alomancia"` valor 2, VOL 2 → `investidura.total=5`, `derivadosSet.alomancia = {grados:2, modificador:4, limite:2, dado:"d6", alcanceMetros:12}`; con `Ascendencia="Oyente"` → 400; `Ascendencia="Kandra"` + `CaminoMetal="ferrin"` → 400; talento `Resistencia koloss` a nivel 4 suma 4 a salud; `~bendicion~Consciencia` añade línea «Bendición: Consciencia» +2 en Defensa espiritual y en Investidura. JSON de T02 (Stormlight) sigue idéntico.

**T13 · Tipos TS del personaje** — F2 · web · S · T11, T12
- Archivos: `src/types/index.ts` (§5.4: `Character`, `CreateCharacterRequest`, `UpdateCharacterRequest`, `DerivadosSet`, `ArteDerivada`, `PoderMetal`); `src/pages/characters/CharacterListPage.tsx:254-258` (`caminoMetal: ''`).
- Aceptación: `npx tsc -b` verde; sin cambios visuales.

### F3 — Datos estáticos y enciclopedia de Nacidos de la Bruma

**T14 · `eras.ts`, `metales.ts`, `progresionArtes.ts`** — F3 · web · M · T06
- Archivos: `src/data/mistborn/eras.ts`, `metales.ts`, `progresionArtes.ts`, `index.ts`. Contenido y tipos de §8; `MetalDef` del informe de talentos §5.2.
- Libro: L.166-171 / PDF 172-177 (tablas); L.163 / PDF 169; L.372 / PDF 378 (eras). Marcar `// [inferido]` las filas reconstruidas por posición.
- Aceptación: 17 metales; `METALES.filter(m => m.comun).length === 8`; parejas simétricas (`pareja(pareja(x)) === x`); `artesMetalicas(3, 1)` → `{limite:3, dado:8, alcance:24}`; `npx tsc -b` verde.

**T15 · `alomancia.ts` (17 poderes, 83 talentos)** — F3 · web · L · T14
- Contenido: §8; estructura y tablas por metal del informe de alomancia §3 (acciones básicas con activación, duración y coste; talentos con `prereq` **literal del texto del libro**, `cost` según glifo, `description` paráfrasis o texto, `notaLibro` en los 4 casos de §6 del informe). `caminos` por entrada (atium solo brumoso y nacido de la bruma; bendaleo, cadmio, cromo, nicrosil solo brumoso y nacidoble; aluminio `[]`). `requiereMeta=false` solo atium.
- Libro: L.172-212 / PDF 178-218 (páginas por metal en §8).
- Aceptación: `PODERES_ALOMANTICOS.length === 17`; suma de `talentos.length` = 83; `new Set(nombres).size === 76`; cada `prereq` de raíz contiene `Alomancia de <metal>`; `npx tsc -b` verde.

**T16 · `feruquimia.ts` (17 poderes, 85 talentos)** — F3 · web · L · T14
- Contenido: §8; tabla maestra y árboles del informe de feruquimia §2; `almacenar`/`decantar` con duración de ganancia de carga (variantes: atium, bendaleo, bronce, cobre, oro); `tablaPorGrados` solo cobre; `medallon` (nicrosil `disponibleParaPJ:false`).
- Libro: L.213-250 / PDF 219-256. Aceptación: 17 entradas; 85 talentos (84 nombres); nicrosil `talentos: []`; `npx tsc -b`.

**T17 · `caminosNacidosDelMetal.ts` (5 caminos, 38 talentos)** — F3 · web · M · T14
- Contenido: §8 y tabla §5.2-5.4 del informe de feruquimia (principal, qué concede, metas, árbol con prerrequisitos literales; Componedor/Resonancia aleada con sus condiciones sobre metales). Colores hex por camino (pasan por `ink()`/`tint()`).
- Libro: L.127-159 / PDF 133-165. Aceptación: 5 caminos, `talentos` 5/6/6/5/11; `eras` brumoso ambas, nacido de la bruma y feruquimista `era1`, ferrin y nacidoble `era2`.

**T18 · `origenes.ts`** — F3 · web · M · T14
- Contenido: ascendencias (Humano: talento heroico extra en 1/6/11/16/21; Kandra: 6 puntos de atributo, Bendición, Forma natural + Disfraz kandra, sin nacido del metal; Sangre koloss: Era 2, FUE máx 6, Resistencia koloss), 5 Bendiciones con bonos, árbol kandra (8), árbol sangre koloss (5), 15 culturas con era.
- Libro: L.31-48 / PDF 37-54. Aceptación: conteos anteriores; `npx tsc -b`.

**T19 · `heroicPaths.ts` de Nacidos de la Bruma (8 especialidades nuevas)** — F3 · web · L · T14
- Contenido: `HEROIC_PATHS_MISTBORN` reutilizando por referencia los objetos de `src/data/heroicPaths.ts` para Investigador, Ladrón, Rastreador, Fiel, Mentor, Estratega, Cirujano, Soldado, Oficial, Político, y transcribiendo Rebelde, Mataneblinos, Francotirador, Estafador, Inventor, Alborotador, Pistolero, Planificador (con `eras: ['era2']` en Inventor y Pistolero). Antes de reutilizar, comparar el texto de 2-3 talentos de una especialidad común con el libro MB y anotar diferencias en `notaLibro` [no comparado por los lectores].
- Libro: cap. 4 L.73-126 / PDF 79-132; L.19 / PDF 25; L.374-375 / PDF 380-381.
- Aceptación: 6 caminos × 3 especialidades; `mainTalent` idénticos a los de ST; `npx tsc -b`.

**T20 · `hemalurgia.ts`** — F3 · web · S · T14
- Contenido y libro: §8 (L.251 / PDF 257; L.288-292 / PDF 294-298). Solo texto de enciclopedia. Aceptación: 12 tipos de clavo; `npx tsc -b`.

**T21 · Overlays de aventuras y combate con resolver (base intacta)** — F3 · web · M · T06
- Archivos: crear `src/data/overlays.ts` (`Overlay<T>`, `SectionOverlay`, `resolveAventuras(set)`, `resolveCombat(set)`; Stormlight devuelve los arrays actuales **por identidad**); `src/data/mistborn/aventurasOverlay.ts`, `combatOverlay.ts` (las 23 operaciones de la checklist §6.2 del informe de reglas base, con los textos propuestos de Desprovisto y Mermado en su §1.2); `AventurasPage.tsx`, `CombatPage.tsx` consumen el resolver; `CombatPage.tsx:68` subtítulo «…reglas de combate de {name}». `aventuras.ts` y `combatRules.ts` **no se editan**.
- Libro: L.306-315 / PDF 312-321; L.317-329 / PDF 323-335; L.310-311 / PDF 316-317.
- Aceptación: `resolveAventuras('stormlight').estados === ESTADOS` (misma referencia); en Mistborn hay 15 estados en orden alfabético con Desprovisto y Mermado y sin Empoderado; Agarrar dice «Retenido».

**T22 · Páginas de enciclopedia de Nacidos de la Bruma y rutas** — F3 · web · L · T14-T18, T20, T09
- Archivos: crear `src/pages/encyclopedia/mistborn/OrigenesPage.tsx`, `CaminosMetalPage.tsx`, `ArtesMetalicasPage.tsx`, `PoderMetalPage.tsx` (detalle `/:arte/:metal`); `App.tsx` rutas con `React.lazy` + `RuleSetGate only="mistborn"`; `src/rulesets/mistborn.ts` `encyclopedia` completo (§7.6). Patrón visual de `RadiantOrdersPage.tsx`/`PotenciasPage.tsx`; `Tabs`, `Card`, `TalentActivation`; glifo provisional Lucide hasta T41/T42.
- Textos: títulos «Orígenes», «Caminos de nacido del metal», «Artes metálicas»; eyebrows «Alomancia» / «Feruquimia» / «Hemalurgia»; tabla «Progresión de las artes metálicas».
- Aceptación: en Mistborn las 7 tarjetas del hub navegan; en Stormlight las rutas redirigen; `npx tsc -b`, `npm run lint`; sin Tailwind ni colores literales; h1→h2→h3 sin saltos.

**T23 · `HeroicPathsPage` por set** — F3 · web · S · T19
- Archivos: `src/pages/encyclopedia/HeroicPathsPage.tsx` (datos `HEROIC_PATHS` o `HEROIC_PATHS_MISTBORN` según set; subtítulo `:250` con `worldName`; chip «Era 2» en Inventor y Pistolero). Aceptación: Stormlight idéntica; Mistborn muestra Rebelde, Mataneblinos, etc.

### F4 — Ficha de Nacidos de la Bruma

**T24 · Tabla única de habilidades (`src/rulesets/skills.ts`)** — F4 · web · M · T06
- Archivos: crear `src/rulesets/skills.ts` (`SkillDef { field: SkillField; label: string; attrField; attrCode; columna: 'fisico'|'cognitivo'|'espiritual' }` por set: **Stormlight = etiquetas y atribuciones actuales de la ficha** `CharacterDetailPage.tsx` `SECTIONS` (sin cambio visible; Q3 decide si se adoptan los nombres del libro); Mistborn = hoja L.402 / PDF 408); consumidores: `CharacterDetailPage.tsx` `SECTIONS`, `DiceRoller.tsx:25-55`, `GlobalNpcDetailPage.tsx:17-54`.
- Aceptación: en Stormlight la ficha pinta exactamente las mismas etiquetas que hoy; el tirador y el NPC leen la tabla del set; `npx tsc -b`.

**T25 · Identidad de la ficha en Nacidos de la Bruma** — F4 · web · L · T13, T17, T18, T24
- Archivos: `src/pages/characters/CharacterDetailPage.tsx` (`ASCENDENCIAS` → `useRuleSetUi().ascendencias` filtradas por `useEra()`; `isCantor` solo con `features.formasCantor`; tercera `IdentityItem` «Camino de nacido del metal»; pickers de §7.4); crear `src/components/mistborn/CaminoMetalPicker.tsx` y `MetalPicker.tsx` (cuadrícula de 17 con `Segmented`/botones ≥44 px, chips de era y categoría); `src/api/metas.ts` para crear las metas iniciales.
- Reglas: §7.4 «Al elegir camino…»; L.17-19 / PDF 23-25; L.127-128 / PDF 133-134; L.135/141/146/150/155 (qué concede cada principal); L.177 / PDF 183 (atium completo); L.372 / PDF 378 (era).
- Aceptación: elegir «Brumoso» + «Acero» en Era 2 guarda `caminoMetal:"brumoso"`, `poderesMetal:[{"arte":"alomancia","metal":"acero","estado":"naciente","origen":"camino","metaId":N}]`, hueco cognitivo con `Alomancia`/`VOL`/1, talento «Ruptura de brumoso» en `talentos` (si hay camino heroico) y una meta «Entrenar tu poder» activa; Kandra no ve el picker de camino de nacido del metal; Sangre koloss no aparece en Era 1; quitar el camino pide `ConfirmDialog`. Stormlight sin cambios.

**T26 · Estadísticas y atributos de la ficha por set** — F4 · web · M · T25
- Archivos: `CharacterDetailPage.tsx` (Investidura: `investiduraHint`, `Stepper` de Investidura actual en `localStorage` `cosmere-recursos:<charId>`; `getPuntosAtributoEsperados` con `puntosAtributoBase`; `max` dinámico con `topeAtributo`; picker de Bendición kandra que escribe `~bendicion~<Nombre>` en `talentos`; `esArteInvestida` en huecos; icono `StatIcons.investidura` por set).
- Libro: L.26-27 / PDF 32-33; L.34-35 / PDF 40-41; L.38 / PDF 44; L.57 / PDF 63; L.129 / PDF 135.
- Aceptación: kandra ve «6 puntos»; koloss puede poner FUE 6; Bendición Consciencia sube el tope de DIS a 7 y el servidor devuelve la línea «Bendición: Consciencia»; Investidura actual persiste al recargar en el mismo dispositivo.

**T27 · Pestaña «Artes metálicas»** — F4 · web · L · T26, T15, T16
- Archivos: crear `src/components/mistborn/ArtesMetalicasTab.tsx`, `PoderCard.tsx`, `BeberVialSheet.tsx`; `CharacterDetailPage.tsx:443-449` pestaña condicional. Contenido de §7.4 último párrafo. Estado de escena en `localStorage` (`investiduraActual`, `cargas{metal}`, `viales{metal}`, `cuentasAtium`, `desprovisto[]`).
- Libro: hoja L.404 / PDF 410; L.129-131 / PDF 135-137; L.163 / PDF 169; L.310 / PDF 316.
- Aceptación: MOD./ALCANCE/DADO coinciden con `derivadosSet`; marcar «completada» cambia `estado` a `completo` y se guarda vía `charactersApi.update`; «Beber vial» con un vial de acero deja Desprovisto [Oro] si el personaje tiene oro y restaura Investidura al máximo; cargas no superan `cargasMaxMente`; todo con `Stepper`/`Switch`/`Sheet`; lista de poderes sin tope.

**T28 · Bolsa: arquillas, capacidad, moneda; `CharacterIdentityPills`** — F4 · web · M · T13, T06
- Archivos: `src/pages/personajes/BolsaDetailPage.tsx:32-33, 233-241, 332-429, 785` (§7.6); `BolsaPage.tsx:19-27, 93-103` («N arquilla(s)»); `PersonajesPage.tsx:173, 201-211` (imagen y subtítulo «Inventario, arquillas y equipo»); crear `src/components/CharacterIdentityPills.tsx` y sustituir los duplicados de `MetasPage.tsx:24-26`, `TalentosPage.tsx:23-24`, `BolsaPage.tsx:24-25`, `CharacterListPage.tsx:133-148`, `MetasDetailPage.tsx:348`, `BolsaDetailPage.tsx:313-328`.
- Libro: L.254 / PDF 260 (moneda); L.50 / PDF 56 (carga). Aceptación: Stormlight sigue mostrando Marcos y `mc`; Mistborn muestra «Arquillas» con 2 decimales y capacidad 125 kg con FUE 3; pills muestran el camino de nacido del metal.

**T29 · Metas de nacido del metal** — F4 · web · S · T25
- Archivos: `MetasDetailPage.tsx` (`Badge` «Meta de nacido del metal» si `poderesMetal` enlaza la meta; al concluir con `exito`, `ConfirmDialog` «¿Marcar el poder {Alomancia de acero} como completo?» que actualiza `poderesMetal`). Libro: L.132-133 / PDF 138-139; L.283 / PDF 289. Aceptación: flujo completo; Stormlight sin cambios.

### F5 — Talentos de Nacidos de la Bruma

**T30 · `talentGraph.ts` parametrizado por set sin cambio de comportamiento** — F5 · web · L · T13, T15-T19
- Archivos: crear `src/lib/talentSets.ts` (`ReglasSetTalentos`, `STORMLIGHT_TALENTOS` con los datos actuales, `MISTBORN_TALENTOS` con `src/data/mistborn/*`, `talentSetFor(ruleSet)`); `src/lib/talentGraph.ts:42-45, 160-202, 411, 1125, 1166` (§7.5 #1; parámetro opcional con default Stormlight); `TalentosDetailPage.tsx`, `TalentosPage.tsx`, `MyTalents.tsx` pasan `talentSetFor(useRuleSet())`.
- Aceptación: para un personaje Stormlight, `JSON.stringify` del grafo (`trees`, `nodes` ids/clauses) antes y después es idéntico (script temporal con `npx tsx`); `npx tsc -b`.

**T31 · Gramática de prerrequisitos ampliada** — F5 · web · M · T03, T30
- Archivos: `talentGraph.ts` `PrereqClause` (`:212`), `parseClause` (`:232-272`), `Gate` (`:622`), `gateFor` (`:693-735`), `TalentState` (`:577`: `atributos?`, `poderes?: readonly PoderMetal[]`), `talentStateFromCharacter` (`:593`), `SKILL_NAME_MAP` (`:73-81`), lista `IGNORAR` (§7.5 #2).
- Aceptación: los 5 textos de T03 producen cláusulas `met`/`unmet` correctas y ninguna `unknown`; ningún prerrequisito de `heroicPaths.ts`, `potencias.ts`, `radiantOrders.ts`, `cantores.ts` cambia de cláusula (comparación con T30).

**T32 · Tipos de árbol y hueco nuevos; bloque del camino de nacido del metal y ascendencias** — F5 · web · L · T31
- Archivos: `talentGraph.ts:297-306, 443-510, 563-573, 1081-1086, 1125-1159` (§7.5 #3); `graphOptionsFromCharacter` lee `caminoMetal`, `poderesMetal`, `ascendencia`.
- Libro: L.17-18 / PDF 23-24 (camino inicial, kandra sin nacido del metal); L.28 / PDF 34 (hitos de ascendencia); L.35-39 / PDF 41-45.
- Aceptación: brumoso de acero nivel 1 (camino inicial) → «Ruptura de brumoso» `autoGranted`, árbol `nacidoMetal:brumoso` con 5 nodos, árbol `poder:alomancia:acero` con 7 nodos bloqueados por «Meta de nacido del metal pendiente» hasta `estado:'completo'`; `talentBudget` no cuenta «Investido» como `radiante`; cantor Stormlight idéntico.

**T33 · UI de talentos para Nacidos de la Bruma** — F5 · web · L · T32
- Archivos: `components/talentos/talentMap.ts:43, 58-81, 116-157, 168-176`, `PathAtlas.tsx:69-72, 82, 98-107, 134, 187, 215-224, 367, 501`, `TalentLamina.tsx:36-41, 90-117`, `TalentSheet.tsx:31, 41`, `MapPieces.tsx:91-94`, `MyTalents.tsx:85-97, 128-165`, `TalentosDetailPage.tsx:447, 452-462, 496-535, 573, 709` (§7.5 #4).
- Aceptación: en Mistborn no aparecen Ideales, formas ni orden; se ven camino NdM, poderes propios y «Otros poderes» plegado; con 4+ poderes no hay desbordamiento horizontal a 360 px; Stormlight idéntico (captura de pantalla antes/después).

**T34 · Rejillas y resúmenes de talentos MB** — F5 · web · M (L con rejillas completas) · T15-T19
- Archivos: `src/data/mistborn/talentGrids.ts`, `talentSummaries.ts`; `talentSets.ts` los conecta. Primera entrega: solo resúmenes + rejillas de los 5 caminos y de las 8 especialidades heroicas; segunda: 32 rejillas de poderes transcritas de las páginas renderizadas del PDF (`pdf_image_extractor`, procedimiento de la cabecera de `src/data/talentGrids.ts:25-30`; el PDF del manual no está en el repo).
- Aceptación: cada `cells[].name` existe en el árbol correspondiente (script de comprobación); sin rejilla el mapa cae al orden de lectura sin romper.

### F6 — Catálogo, PNJ, dados, tema, iconos

**T35 · Catálogo por set en la API: `AddRuleSetToCatalog`, filtro y autorización** — F6 · api · L · T05
- Archivos: `Messages/Database/Entities/WeaponCatalogEntity.cs` (4 entidades, §4.1), DTOs de `Messages/Catalog/In|Out` (§5.1), `Services/Catalog/CatalogService.cs:11-35, 41, 71` (filtro §5.2; alta fija `RuleSet`), `API/Controllers/CatalogController.cs:14-85` (`[FromQuery] long? campaignId`; GM de la campaña para escribir), `CosmereContext.cs:167-169` (índice).
- Comandos: `dotnet ef migrations add AddRuleSetToCatalog ...` → editar el `Up` para añadir el `UPDATE` de §4.3 #3 → `database update`.
- Aceptación: `GET /catalog/weapons` sin parámetro devuelve las 25 armas actuales; con `campaignId` de una campaña Mistborn devuelve 0 (hasta T36); un jugador no GM recibe 403 al `POST` con `campaignId`.

**T36 · Seed `SeedMistbornCatalog`** — F6 · api · L · T35
- Archivos: migración manual (`dotnet ef migrations add SeedMistbornCatalog ...` y rellenar `Up`/`Down` con SQL): opciones (informe catálogo §6.2), 35 armas (§6.3), 8 armaduras (§6.4), 84 `GearItems` (§2.7-2.8, `Category='vial'` en 1072-1084), `setval` final (§6.6). Antes de aplicar, comprobar que no hay armas `IsCustom` con nombres Mistborn.
- Libro: L.254-267 / PDF 260-273 (verificado en imagen por el lector).
- Aceptación: `SELECT COUNT(*) FROM "WeaponCatalog" WHERE "RuleSet"='mistborn'` = 35; `ArmorCatalog` 8; `GearItems` 84; `Down` deja las cuentas a 0 y no toca Stormlight; crear un arma propia tras el seed obtiene id ≥ 1036.

**T37 · Catálogo y bolsa por set en el frontend** — F6 · web · M · T35, T36, T28
- Archivos: `src/api/catalog.ts:28-47` (`campaignId`), `src/types/index.ts:328-368`, `CatalogPage.tsx:36, 149-157, 204-224, 340, 364, 686-870, 881-892`, `BolsaDetailPage.tsx:160-170, 612-660` (§7.6). Claves `['catalog', cId, …]` e invalidación por prefijo `['catalog', cId]`.
- Aceptación: campaña Stormlight ve 25/8/68 con `mc`; Mistborn Era 1 no ve armas de fuego ni «Vial de bendaleo»; «Entre eras» ve todo; picker con búsqueda.

**T38 · PNJ globales por set** — F6 · api+web · M · T05
- Archivos API: `GlobalNpcEntity.cs`, DTOs, `GlobalNpcService.cs`, `GlobalNpcsController.cs` (`[FromQuery] string? ruleSet`), migración `AddRuleSetToGlobalNpcs` (§4.3 #5). Web: `src/api/global-npcs.ts`, `GlobalNpcListPage.tsx:96-98, 163`, `GlobalNpcDetailPage.tsx:61-65, 147`, `NpcNotesPage.tsx:420-423`, claves `['global-npcs', ruleSet]`.
- Aceptación: Stormlight ve los 34 PNJ sembrados; Mistborn ve «Sin adversarios todavía» y puede crear uno con `ruleSet:'mistborn'`.

**T39 · Dados: artes metálicas y Alomancia en Combate** — F6 · web · S · T24, T13
- Archivos: `src/utils/dice.ts` (`artesMetalicas(grados, rango)` junto a `recoveryDieFaces` `:107-114`), `DiceRoller.tsx:1012` (`WEAPON_SKILLS` dinámico), `:773` (texto de Recuperación por set).
- Libro: L.163 / PDF 169; L.172 / PDF 178; L.129 / PDF 135. Aceptación: con `Alomancia` 3 el Combate ofrece «Alomancia» con d8 preseleccionado; Stormlight sin cambios.

**T40 · Tema «Nacidos de la Bruma»** — F6 · web · M · T07
- Archivos: `src/index.css` (tres bloques de §7.6 tras `:298`; `html[data-ruleset='mistborn']{background:#0c0b0d}` en el `<style>` inicial de `index.html`), `src/lib/gameIcons.ts:21-28` (`StatIcons` por set), `src/rulesets/mistborn.ts` (`themeBg`).
- Aceptación: sin `data-ruleset` el CSS computado de `--brand`, `--bg`, `--atmo` es el actual; con `mistborn` cambian en claro y oscuro; contraste ≥ 4,5:1 de `--text*` y `--brand` sobre `--bg`..`--surface-3` (revisión visual de 6 pantallas en ambos temas).

**T41 · Extracción de activos oficiales de Nacidos de la Bruma** — F6 · activos · M · —
- Archivos: script `cosmere-api/Resources/Parts/mistborn_glyphs/extract.py` (PyMuPDF + fontTools, procedimiento del informe UI §7.3) → `cosmere-web/src/assets/cosmere/alomancia-era1-<metal>.svg` (17), `alomancia-era2-<metal>.svg` (16), `feruquimia-<metal>.svg` (17), `nacidos-bruma-emblem.svg`, `img/dinero-era1.webp`, `img/dinero-era2.webp`; comentario de procedencia como en `CosmereIcon.tsx:3-10`.
- Fuente: PDF 411 (fuentes `MistbornAllomantic-Era1/Era2`, trazados feruquímicos), PDF 410 (emblema), PDF 260 (dinero). Tabla letra→metal del informe UI §7.2; estaño (I) y peltre (O) como glifo canónico [inferido].
- Aceptación: `hasCosmereIcon('alomancia-era1-acero')` es `true`; cada SVG usa `fill="currentColor"` y `viewBox`; comparación visual con los renders de PDF 408-411.

**T42 · `MetalGlyph` y sustitución de los iconos provisionales** — F6 · web · S · T41, T22, T27, T33
- Archivos: crear `src/components/mistborn/MetalGlyph.tsx` (`{ metal, arte, era?, size }` → `CosmereIcon` o fallback Lucide); usar en enciclopedia, `PoderCard`, `MetalPicker`, `PathAtlas`, `RuleSetBadge`, `Sheet` de creación. Aceptación: cero emojis; fallback funciona si falta un SVG.

### F7 — Opcionales y futuro cercano

**T43 · `PATCH /campaigns/{id}/settings` (era) y Ajustes editable** — F7 · api+web · S · T08 — `UpdateCampaignSettingsRequest`, `CampaignService.UpdateSettingsAsync` (GM, solo `mistborn`), `CampaignsController`; `CampaignSettingsPage` con `Segmented` + `ConfirmDialog` «Cambiar la era filtra las opciones disponibles; los datos guardados no se modifican.» Aceptación: 403 a no GM; 400 en Stormlight.

**T44 · Persistir recursos de artes metálicas en servidor** — F7 · api+web · M · T27 — migración `AddCharacterRecursosMetal`, `PATCH /campaigns/{cid}/characters/{id}/recursos` (dueño o GM) que solo escribe esa columna; `ArtesMetalicasTab` sustituye `localStorage` por la API y SignalR opcional. Depende de Q5.

**T45 · Equipo inicial por paquetes** — F7 · web · M · T36, T28 — `src/data/mistborn/equipoInicial.ts` (7 paquetes, §10 del informe de catálogo), flujo en el alta: elegir paquete, tirar dados (`utils/dice.ts`), ×10 en Era 2, añadir nombres a `weapons/armor/equipment`, `arquillas`; Fugitivo/Guardador marcan la meta inicial completa (L.255 / PDF 261).

**T46 · Páginas Conversaciones y Empeños (compartidas con overlay)** — F7 · web · M · T21 — datos base + overlay MB (informe de reglas base §7); rutas `encyclopedia/conversaciones`, `encyclopedia/empenos` en ambos sets.

**T47 · Hemalurgia en la ficha** — F7 · web · M · T27, T20 — marcador `~clavo~<metal>[:poder]` en `talentos`, −2/−5 a Defensa espiritual (línea en `MistbornReglas`), poderes `origen:'clavo'`, aviso Desorientado si ≤ 9 (L.290 / PDF 296).

## 10. Orden de ejecución y paralelismo

| Fase | Tareas | Paralelo | Estado de la app al cerrar la fase |
|---|---|---|---|
| F0 | T01 → T02; T03 aparte | T03 ∥ T01-T02 | Sin cambios. WIP commiteado. |
| F1 | T04 → T05 → T06 → (T07 ∥ T08 ∥ T09) | T07, T08, T09 entre sí | **Primera fase usable:** se pueden crear campañas «Bruma» (ven enciclopedia reducida y ficha Stormlight sin Investidura). Stormlight idéntico. Un `deploy.sh` normal basta: la migración 1 se auto-aplica. |
| F2 | T10 → T11 → T12 → T13 | T13 tras T11 puede ir ∥ T12 | Motor envuelto; Mistborn valida y calcula. Stormlight idéntico (T02). |
| F3 | T14 → (T15 ∥ T16 ∥ T17 ∥ T18 ∥ T19 ∥ T20 ∥ T21) → T22 → T23 | 7 transcripciones en paralelo (agentes distintos) | Enciclopedia completa de Nacidos de la Bruma. |
| F4 | T24 → T25 → T26 → T27; T28 ∥ T29 tras T25 | T28 ∥ T24-T27 | Ficha jugable de Nacidos de la Bruma (sin mapa de talentos MB). |
| F5 | T30 → T31 → T32 → T33; T34 ∥ T31-T33 | T34 | Talentos completos. |
| F6 | (T35 → T36 → T37) ∥ T38 ∥ T39 ∥ T40 ∥ (T41 → T42) | casi todo en paralelo | Catálogo, PNJ, dados, tema, iconos. |
| F7 | T43-T47 según Q | — | Opcionales. |

Puede empezar en paralelo desde el día 1: F3 (datos, sin dependencias de API) y T41 (activos). F2 espera a T01. F6-API (T35, T36, T38) solo depende de T05 y puede adelantarse a F4/F5.

## 11. Riesgos y mitigaciones

| # | Riesgo | Mitigación |
|---|---|---|
| 1 | Regresión silenciosa del cálculo Stormlight al extraer `StormlightReglas` (sin tests) | T02 captura y T10/T12 comparan byte a byte; `StormlightReglas` copia el código, no lo reescribe. |
| 2 | Colisión con el WIP de formas de cantor | F2 solo tras T01; cambios aditivos al final de firmas y clases; `BonosForma`/`FormasCantor` sin renombrar; el WIP es la línea base. |
| 3 | `dotnet ef` compila el proyecto de arranque: si el árbol no compila, no hay migración | `dotnet build` antes de cada `migrations add`; API parada (regla del proyecto). |
| 4 | Auto-migración al arrancar en producción (`Program.cs:93-94`); versión de PostgreSQL desconocida | Todas las migraciones son `ADD COLUMN ... DEFAULT` constantes (metadatos en PG ≥ 11 [inferido]) o `INSERT`; el seed no borra. Revisar `deploy.sh`/`docker-compose.yml` antes de F6. |
| 5 | `localStorage['cosmere-campaign']` persistido sin `ruleSet` | Selectores con `?? 'stormlight'`; gate `ready` en `AppLayout`; script previo a la pintura. |
| 6 | Tamaño del bundle (+ ≈4.000 líneas de datos MB) | Páginas y datos MB con `React.lazy`/`import()`; `talentSetFor` carga `MISTBORN_TALENTOS` bajo demanda; medir con `npm run build`. |
| 7 | Datos [inferido] del libro (tablas de metales por posición, geometría de árboles, glifos canónicos, Lupa 200 ar, Revitalizar) | `notaLibro` y comentarios; revisión visual sobre páginas renderizadas antes de cerrar F3/F5; lista en §12 Q11. |
| 8 | `parsePrereq` deducido, no ejecutado | T03 antes de T31. |
| 9 | Secuencias de id del catálogo (`IDENTITY BY DEFAULT` con ids explícitos, sin `setval`) | `setval` obligatorio al final de T36; comprobar el estado real antes. |
| 10 | Inventarios por nombre: homónimos entre sets | Set exclusivo por campaña (decisión (a)); el filtro garantiza un nombre por catálogo. |
| 11 | Cuatro tablas de habilidades ya incoherentes (auditoría 2026-10-03) | T24 las unifica en un módulo; Stormlight conserva sus etiquetas hasta Q3. |
| 12 | Carrera de hidratación ya existente (`AppLayout.tsx:13-17`) | T07 la corrige para ambos sets. |
| 13 | Concurrencia del `PUT` de personaje entero con `poderesMetal` | Igual que `talentos` hoy; T44 (PATCH parcial) si molesta en mesa. |
| 14 | Cambiar la autorización del catálogo (T35) altera el comportamiento para jugadores no GM | Solo cuando se envía `campaignId`; sin él, comportamiento actual. Documentar en Q9. |
| 15 | Líneas citadas de `CharacterDetailPage.tsx` y `types/index.ts` pueden moverse (cambios sin commitear) | Las tareas anclan por texto (`ASCENDENCIAS`, `isCantor`, `SECTIONS`, `getPuntosAtributoEsperados`). |

## 12. Preguntas abiertas para Xavi (con recomendación por defecto)

| # | Pregunta | Recomendación por defecto (la propuesta la asume) |
|---|---|---|
| Q1 | ¿Mezclar Tormentas y Nacidos de la Bruma en una campaña (L.374-375 / PDF 380-381)? | **No en v1.** `RuleSet` exclusivo; ampliable con `"mixto"` sin migración. |
| Q2 | ¿La era se puede editar tras crear la campaña? | **Sí, solo el director (T43, F7).** En v1 se fija al crear con la opción «Entre eras». |
| Q3 | ¿Se unifican también las etiquetas Stormlight con los nombres del libro (Armamento ligero/pesado, Saber, Atletismo FUE, Intimidación VOL)? | **Sí, como tarea aparte tras T24** (mejora de corrección en ambos sets; cambia texto visible de Stormlight). |
| Q4 | ¿Alomancia y Feruquimia en campos dedicados o en `habilidadPersonalizadaN`? | **Huecos personalizados** (cero API, el tirador ya las tira). Coste: un nacidoble ocupa los dos huecos cognitivos. |
| Q5 | ¿Persistir Investidura actual, cargas, viales y Desprovisto en servidor? | **No en v1** (coherente con salud/concentración actuales); T44 lista si el director necesita verlos. |
| Q6 | ¿Puede un jugador no GM cambiar `caminoMetal`? | **Sí** (el libro lo permite en cualquier nivel, L.128 / PDF 134); no se añade al bloqueo de `CharacterService.cs:111-116`. |
| Q7 | ¿Camino de nacido del metal como camino inicial sin columna nueva (decisión (k))? | **Sí** (`caminoHeroico==''` ⇒ el NdM es inicial). |
| Q8 | ¿La Bendición Fortaleza (Desvío +1) se acumula con la armadura? | **Sí** [inferido]; `DesvioBonoSeAcumula=true` en Mistborn. |
| Q9 | ¿Corregir la autorización del catálogo (hoy cualquier usuario edita, `CatalogController.cs:11-13`)? | **Sí**, solo cuando llega `campaignId` (T35). |
| Q10 | ¿Ocultar «Aventura» del director en Mistborn v1? | **Sí**; registro de aventuras por set en el futuro. |
| Q11 | Revisión visual de datos [inferido] (tablas de metales, duraluminio/electro para nacido de la bruma, Revitalizar, geometría de árboles, glifos de estaño/peltre, Lupa 200 ar) | Hacerla al cerrar F3 y F5 sobre páginas renderizadas; hasta entonces `notaLibro`. |
| Q12 | ¿Sorpresa con la lectura de MB (por personaje) también en Stormlight, y Aturdido con el texto de SL en ambos? | **Sí a ambas**, en el overlay MB solo lo primero; la base ST queda como está. |
| Q13 | ¿Precio de armas y armaduras de Stormlight (existe en el libro, no en BD)? | Fuera de alcance; columna `Price` queda `NULL`. |

## 13. Fuera de alcance y trabajo futuro

- Aventura **El legado de los nacidos de la bruma** (registro de aventuras por set, pestaña «Aventura» en Mistborn).
- **Guía del mundo** (adversarios y PNJ sembrados para Scadrial; hoy la lista MB nace vacía).
- Mezcla de ambientaciones con Investidura única (`"mixto"`), inventarios por id en lugar de por nombre.
- Hemalurgia jugable completa (implantar/extraer, clavos secretos) más allá de T47; cuerpos verdaderos kandra; medallones y mentes desligadas como objetos con cargas; granadas alománticas; savantismo.
- Corrección del dado de trama (d12 → d6, 20/1 naturales acumulativos, `utils/dice.ts:81-90, 137-147`) y demás defectos de la auditoría 2026-10-03: trabajo independiente, afecta a ambos sets.
- Hoja de personaje imprimible; iconos oficiales de los 5 caminos de nacido del metal (no existen en el libro); emblemas de era.
- Validaciones de reglas en servidor (presupuesto de puntos, prerrequisitos, exclusividad de caminos): hoy tampoco existen para Stormlight.
- Tabla hija `CharacterPoderes` si el JSON `PoderesMetal` da problemas de concurrencia.
- Eliminación de columnas obsoletas (`MaxConcentration`, `MaxInvestiture`) y de `src/data/sessions.ts` (muerto).
- Páginas de Características (cap. 3) y Terreno/tamaño/caídas (cap. 10) de la enciclopedia.
