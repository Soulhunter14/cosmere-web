# Propuesta B — Registro de sets de reglas dirigido por datos: «Nacidos de la Bruma» en CosmereAPP

## 0. Portada

| Campo | Valor |
|---|---|
| Título | Set de reglas «Nacidos de la Bruma» como entrada de un **registro de sets de reglas** (RuleSet) dirigido por datos |
| Fecha | 3 de octubre de 2026 |
| Estado | **Propuesta, sin implementar.** Nada de lo descrito existe en los repositorios. |
| Ángulo | B — un objeto de configuración por set (TS y C#); Archivo de las Tormentas es la primera entrada del registro; ficha, dados, talentos, enciclopedia y catálogo consumen la configuración en lugar de importar datos de Stormlight. Un tercer set debe ser barato. |
| Repositorios | `cosmere-api` (ASP.NET Core 8, EF Core 8 + Npgsql, PostgreSQL) y `cosmere-web` (React 19, TS, Vite, Zustand, TanStack Query) |
| Fuentes primarias | `api_map.md`, `web_map.md`, `mistborn_rules_summary.md`; informes `lectura_motor_talentos_web.md`, `lectura_motor_reglas_api.md`, `lectura_alomancia_inventario.md`, `lectura_feruquimia_hemalurgia_inventario.md`, `lectura_delta_reglas_base.md`, `lectura_delta_catalogo.md`, `lectura_superficie_ui.md`; manual «Nacidos de la bruma» (`mistborn_flow.txt`, PDF = libro + 6); extractos del manual de Archivo de las Tormentas; `docs/auditoria-reglas-2026-10-03.md`; `CLAUDE.md` (raíz y web) y `DESIGN.md` |
| Convenciones de cita | Código: `archivo:línea` del árbol de trabajo actual (rutas relativas a cada repo). Manual: «L.<libro> / PDF <pdf>». Lo no verificado se marca **[inferido]**. |
| Trabajo en curso a respetar | `cosmere-api`: `Services/Characters/CharacterService.cs`, `TalentosReglas.cs`, `Messages/Characters/Out/CharacterResponse.cs` (modificados) y `Services/Characters/FormasCantor.cs` (nuevo), formas de cantor. `cosmere-web`: `src/pages/characters/CharacterDetailPage.tsx` y `src/types/index.ts` modificados. Esta propuesta solo añade; no renombra `BonosForma`, `FormasCantor` ni los `Build*Lineas`. |

---

## 1. Resumen ejecutivo y principios de diseño

1. Hoy no existe el concepto «set de reglas» en ningún repo: `CampaignEntity.cs:3-17` no tiene campo de ambientación, `CharacterService.cs:12-33` valida listas Stormlight cableadas, `talentGraph.ts:42-45` importa `HEROIC_PATHS/RADIANT_ORDERS/POTENCIAS/ARBOL_CANTOR` de forma estática y `EncyclopediaPage.tsx:109-197` lista seis temas de Roshar.
2. El motor numérico base es **idéntico** en ambos libros (salud, concentración, defensas, Investidura `2+máx(DIS,PRE)`, movimiento, rango; `lectura_motor_reglas_api.md` §1.4 frente a L.26-29 / PDF 32-35). Lo que cambia es el **contenido** (caminos, poderes, ascendencias, moneda, catálogo, estados) y unas pocas **condiciones** (quién tiene Investidura).
3. Por eso la propuesta introduce un **registro de sets**: `src/rulesets/` en el frontend (`RuleSetConfig`) y `Services/RuleSets/` en la API (`IReglasSet` + `IReglasSetProvider`). Stormlight es la entrada `'stormlight'`, construida envolviendo los datos y reglas actuales **sin cambio de comportamiento**; Mistborn es `'mistborn'`.
4. La campaña gana `RuleSet` (inmutable) y `Era` (`era1 | era2 | entre-eras`, editable por el director). Todo lo persistido hasta hoy pasa a `'stormlight'` por defecto de migración y por *fallback* del proveedor.
5. El personaje gana una columna `CaminoInvestido` (camino de nacido del metal en Mistborn) y **dos columnas JSON tipadas**: `Poderes` (lista de poderes del personaje: arte, metal, estado naciente/completo, cargas, viales, Desprovisto, meta enlazada) y `Recursos` (bolsa clave→número para valores actuales propios del set: Investidura actual, cuentas de atium, arquillas). Un tercer set añade claves y entradas de registro, no columnas.
6. El servidor devuelve además `DerivadosSet: Dictionary<string, StatDesglose>` (límite, dado, alcance y modificador de Alomancia y Feruquimia; cargas máximas de mentes de metal) usando el mismo `StatDesglose` que las ocho estadísticas actuales.
7. El motor de talentos recibe el set por parámetro (`ReglasSetTalentos`) y gana cuatro cláusulas aditivas (`poder`, `atributo`, `skillAny`, `ancestry` genérica) que ningún prerrequisito actual de Stormlight usa, así que no hay regresión.
8. Catálogo y PNJ globales se segmentan con una columna `RuleSet` (+ `Era`, `Price`, `IsRewardOnly` en catálogo) y se filtran por `campaignId` en el servidor; el cliente nunca envía el set.
9. Enciclopedia: `aventuras.ts` y `combatRules.ts` se comparten con **overlays por set**; cada set registra sus temas y páginas propias; un `RuleSetGate` redirige rutas de otro set.
10. Tema: `<html data-ruleset="mistborn">` redefine los tokens de marca y atmósfera en los tres bloques de `index.css`; `theme.ts` no cambia.
11. Plan en 6 fases y 35 tareas; tras la fase 1 la app queda usable con Stormlight intacto y el set visible en la campaña; Mistborn se completa en fases 2-5 con tareas paralelizables (transcripción de datos).
12. Riesgos principales: regresión silenciosa de Tormentas (no hay tests → captura de JSON de referencia), colisión con el WIP de formas de cantor (solo parámetros opcionales al final y propiedades añadidas después de `DesvioCalculado`), y datos del libro reconstruidos de texto desordenado (marcados **[inferido]**, revisión visual obligatoria).

**Principios de diseño**
- **P1 Datos antes que ramas.** Ningún componente compara `ruleSet === 'mistborn'`; pregunta a la configuración (`set.features.marcos`, `set.moneda.simbolo`, `set.caminoInvestido`).
- **P2 Stormlight primero y sin cambios.** La fase que introduce el registro debe producir el **mismo JSON** y la **misma UI** para toda campaña existente.
- **P3 Aditivo en los ficheros del WIP.** Parámetros opcionales al final; propiedades nuevas después de las existentes; nada se renombra.
- **P4 Un hecho, un sitio.** Tabla única de habilidades, una tabla de carga por set, una lista de ascendencias por set.
- **P5 El servidor manda en lo que valida; el cliente aconseja en lo demás** (presupuestos, prerrequisitos), como hoy (`lectura_motor_reglas_api.md` §3).
- **P6 Convenciones del proyecto**: estilos inline con `theme.ts`, overlays con `Sheet`/`ConfirmDialog`, iconografía oficial > Lucide > nunca emojis, términos del juego en español, `types/index.ts` espejo de `Messages`, claves de TanStack Query por campaña, confirmación antes de borrar, migraciones aplicadas al terminar, `npx tsc -b`.

---

## 2. Glosario de dominio y convenciones de nombres

### 2.1 Identificadores de set y era

| Concepto | TS (`src/types/index.ts`) | C# (`Messages/RuleSets/RuleSetIds.cs`) | Valores |
|---|---|---|---|
| Set de reglas | `type RuleSetId = 'stormlight' \| 'mistborn'` | `RuleSetIds.Stormlight = "stormlight"`, `RuleSetIds.Mistborn = "mistborn"`, `RuleSetIds.Todos`, `RuleSetIds.EsValido(string?)` | minúsculas, ASCII, estables |
| Era | `type Era = 'era1' \| 'era2' \| 'entre-eras'` | `EraIds.Era1 = "era1"`, `Era2 = "era2"`, `EntreEras = "entre-eras"`, `EsValida(string?)` | `null` en sets sin eras (Stormlight) |
| Campo en campaña | `Campaign.ruleSet: RuleSetId`, `Campaign.era: Era \| null` | `CampaignEntity.RuleSet`, `CampaignEntity.Era` | columna `Campaigns.RuleSet text NOT NULL DEFAULT 'stormlight'`, `Campaigns.Era text NULL` |

Etiquetas visibles (L.372 / PDF 378): «Archivo de las Tormentas» / «Tormentas»; «Nacidos de la bruma» / «Bruma»; «Era 1: El Mundo de Ceniza»; «Era 2: Cambio y revolución»; «Entre eras».

### 2.2 Términos de juego (tal como los escribe el libro)

fuerza, velocidad, intelecto, voluntad, discernimiento, presencia · camino heroico · **camino de nacido del metal** (brumoso, nacido de la bruma, feruquimista, ferrin, nacidoble; L.19 / PDF 25) · **talento de ruptura** / **talento de herencia** (L.128 / PDF 134) · Investidura · artes metálicas / Artes Investidas · alomancia, feruquimia, hemalurgia · habilidades Investidas **Alomancia (Voluntad)** y **Feruquimia (Intelecto)** (L.128 / PDF 134) · poder **naciente** / **completo** (L.162 / PDF 168) · **meta de nacido del metal** («Entrenar tu(s) poder(es)», «Fabricar tu(s) mente(s) de metal»; L.132-133 / PDF 138-139) · mentes de metal, cargas · viales, **Beber vial** (L.129 / PDF 135) · cuentas de atium · estado **Desprovisto [poder]** y **Mermado [atributo]** (L.310-311 / PDF 316-317) · arquillas (ar), óbolo, nota (L.254 / PDF 260) · ascendencias **Humano, Kandra, Sangre koloss** y **Bendiciones** kandra (L.32-39 / PDF 38-45) · clavos hemalúrgicos (L.288-291 / PDF 294-297) · límite / dado / alcance de artes metálicas (L.163 / PDF 169).

Ids en código: ASCII sin tildes ni eñes, como `Potencia.id` (`potencias.ts:3-27`): `estano`, `laton`, `nacido-de-la-bruma`, `sangre-koloss`. El nombre con tildes va siempre en `name`/`nombre`.

### 2.3 Nombres de tipos y carpetas

| Pieza | Frontend | API |
|---|---|---|
| Registro | `src/rulesets/index.ts` → `RULESETS: Record<RuleSetId, RuleSetConfig>`, `getRuleSet(id)`, hooks `useRuleSet()`, `useEra()`, `useRuleSetConfig()` | `Services/RuleSets/ReglasSetProvider.cs` → `IReglasSetProvider.Obtener(string? id)` (singleton) |
| Configuración por set | `src/rulesets/types.ts` → `RuleSetConfig`; `src/rulesets/stormlight.ts`; `src/rulesets/mistborn.ts` | `Services/RuleSets/IReglasSet.cs`; `StormlightReglas.cs`; `MistbornReglas.cs` |
| Datos estáticos | `src/data/*.ts` (Stormlight, **sin mover**); `src/data/mistborn/*.ts` (nuevos); `src/data/shared/overlays.ts` (tipos de overlay) | — (los datos de juego viven en el cliente, `cosmere-web/CLAUDE.md` «Static game content») |
| Estado del personaje por set | `Character.caminoInvestido`, `Character.poderes: PoderPersonaje[]`, `Character.recursos: Record<string, number>`, `Character.derivadosSet: Record<string, StatDesglose>` | `CharacterEntity.CaminoInvestido`, `CharacterEntity.Poderes` (jsonb), `CharacterEntity.Recursos` (jsonb), `CharacterResponse.DerivadosSet` |
| Camino especial del set | `set.caminoInvestido.field: 'caminoRadiante' \| 'caminoInvestido'` | `IReglasSet.CaminoInvestidoDe(CharacterEntity c)` |

`caminoInvestido` es un término de la app (no del libro): «el camino de Artes Investidas que el set añade a los caminos heroicos». En Stormlight sigue viviendo en `CaminoRadiante` (compatibilidad); en Mistborn y en cualquier set futuro, en `CaminoInvestido`.

---

## 3. Decisiones de diseño

Formato: alternativas → elegida → por qué.

### (a) Set exclusivo por campaña frente a mezcla permitida por el libro
- Alternativas: (1) un `RuleSet` por campaña, exclusivo; (2) `RuleSets text[]` con set principal; (3) capacidades por personaje (`tieneCaminoRadiante`, `tieneNacidoDelMetal`) y campaña sin set.
- **Elegida: (1) en v1**, con el registro preparado para un tercer id `'mixto'` cuya configuración haga la **unión** (overlays aditivos, `TieneInvestidura = radiante OR alomántico`, Investidura única).
- Por qué: el libro permite mezclar (L.374-375 / PDF 380-381: «una única reserva de Investidura», Desprovisto por fuente), pero los inventarios guardan **nombres** (`BolsaDetailPage.tsx:204-245`) y los dos catálogos comparten nombres («Cuchillo», «Arco corto»; `lectura_delta_catalogo.md` §8), los talentos se identifican por nombre (`talentGraph.ts` `byName`) y los seis huecos de habilidad personalizada competirían. Resolver eso es otro proyecto. El registro, al ser datos, admite un set `'mixto'` después sin tocar la ficha. → Pregunta 12.1.

### (b) Era a nivel de campaña y si cambia en el tiempo
- Alternativas: (1) sin era (todo disponible); (2) era fija al crear; (3) era editable por el director; (4) era por personaje.
- **Elegida: (3)**, columna `Campaigns.Era` obligatoria al crear una campaña `mistborn` y editable con `PATCH /campaigns/{id}/settings` (director). Valores `era1`, `era2`, `entre-eras` (unión de disponibilidad).
- Por qué: el libro exige conocer la era antes de crear personajes (L.17 / PDF 23) y la era filtra ascendencias, caminos, metales y objetos (L.371-372 / PDF 377-378); «El legado de los nacidos de la bruma» cruza las dos eras (L.372 / PDF 378 «Entre eras»), así que fijarla para siempre sería incorrecto. El cambio de era no invalida datos guardados: solo filtra **opciones nuevas**; lo ya elegido se conserva y se marca en la UI con el chip de su era.

### (c) ¿Se puede cambiar el set tras crear la campaña?
- Alternativas: (1) inmutable; (2) editable sin personajes; (3) editable siempre.
- **Elegida: (1)**. No hay endpoint de edición hoy (`CampaignsController.cs:15-47`) y cambiar el set dejaría `Ascendencia="Oyente"`, órdenes radiantes y marcos sin sentido. El `Sheet` de creación avisa: «La ambientación no se puede cambiar después de crear la campaña.»

### (d) Almacenamiento de poderes del personaje: columnas, JSON o tablas hijas
- Alternativas: (1) columnas planas (`PoderAlomantico1..n`); (2) tabla hija `CharacterPowers` (patrón `MetaEntity`); (3) **JSON tipado** en `Characters.Poderes` (jsonb) con DTO `PoderPersonaje`; (4) marcadores en `Talentos` (`~poder~acero=completo`, patrón `~forma~`).
- **Elegida: (3)**, más una bolsa `Characters.Recursos` jsonb (`Dictionary<string,double>`).
- Por qué: un nacido de la bruma de Era 1 tiene hasta 10 poderes (L.372 / PDF 378), lo que descarta columnas; la tabla hija obliga a endpoints, DTOs y consultas nuevas para datos que siempre se leen y escriben **junto al personaje** (PUT completo, `CharacterService.cs:172-199 ApplyUpdate`); los marcadores en `Talentos` ya exigen trato especial en cuatro sitios del motor (`lectura_motor_talentos_web.md` §5.4) y pisarían el WIP de `FormasCantor.cs:25`. El JSON tipado se valida en el servidor (ids de metal y arte del set), se mapea con un `ValueConverter` a `jsonb` sin activar JSON dinámico de Npgsql, y permite que un tercer set guarde sus poderes (p. ej. Alientos de Nalthis) sin migración. Las metas se enlazan por `MetaId` a `MetaEntity` (existe, 3 hitos, mismas conclusiones; L.282-284 / PDF 288-290).

### (e) Valores actuales (Investidura actual, cargas, viales, cuentas de atium) que hoy no se persisten
- Alternativas: (1) solo cliente (localStorage, como hoy salud actual); (2) servidor en `Recursos`/`Poderes` dentro del PUT del personaje; (3) endpoint propio `PATCH /characters/{id}/recursos`.
- **Elegida: (2)** con un helper `charactersApi.patchRecursos` que envía el personaje completo con los campos cambiados (mismo patrón que `talentosMutation`, `TalentosDetailPage.tsx:176-195`). Documentar la concurrencia *last-write-wins* como hoy.
- Por qué: la hoja de artes metálicas del libro guarda cargas/viales y «meta completada» por poder (L.404 / PDF 410), el director necesita verlo y el jugador cambia de dispositivo. Mantener salud/concentración actuales como están (fuera de alcance). → Pregunta 12.4.

### (f) Catálogo global frente a por set
- Alternativas: (1) un catálogo con `RuleSets text[]`/`'both'`; (2) filas **duplicadas por set** con columna `RuleSet`; (3) catálogo por campaña.
- **Elegida: (2)** con `'shared'` solo en `CatalogOptions`, siguiendo `lectura_delta_catalogo.md` §5 y §8: solo 4 de 65 objetos homónimos coinciden en precio y peso, la moneda es distinta (`mc` / `ar`) y las descripciones son editables por fila. El servidor filtra por `?campaignId=` (deriva set y era); sin parámetro devuelve `stormlight` (cliente actual sigue funcionando). De paso se corrige la autorización (`CatalogController.cs:11-13` solo `[Authorize]`) exigiendo director de esa campaña para crear, borrar y editar.

### (g) PNJ globales por set
- **Elegida:** columna `GlobalNpcs.RuleSet text NOT NULL DEFAULT 'stormlight'` (los 34 sembrados son de Caminapiedras, `20260408073708_SeedAllNpcs.cs`) y filtro `?campaignId=` en `GET /global-npcs`. `Source` sigue libre. Alternativa descartada: usar `Source` como discriminador (es texto libre editable).

### (h) Enciclopedia compartida frente a duplicada
- **Elegida:** compartir `aventuras.ts` y `combatRules.ts` con **overlays por set** (14 de 48 y 5 de 23 elementos, `lectura_delta_reglas_base.md` §6) y páginas `AventurasPage`/`CombatPage` tal cual con una cadena parametrizada (`CombatPage.tsx:68`). Las páginas exclusivas (Órdenes Radiantes, Potencias / Orígenes, Caminos de nacido del metal, Artes metálicas) se registran en `set.enciclopedia`. Base: **neutralizar** el texto compartido (≈25 ediciones) porque es lo único coherente con un futuro `'mixto'` → Pregunta 12.6.

### (i) Tema visual por set
- **Elegida:** atributo `data-ruleset` en `<html>` + bloque de tokens de Mistborn en `index.css` (tres formas: oscuro, claro explícito, claro por media query; `lectura_superficie_ui.md` §6). Se mantienen `--gold*`, los diez tonos gema y `--navy`. `theme.ts` no cambia (P1). Paleta propuesta en `lectura_superficie_ui.md` §6.3 (acero/peltre como marca, sol rojo de la Era 1 en la atmósfera) → revisión visual obligatoria.

### (j) Columnas Stormlight del personaje en campañas de Nacidos de la Bruma
- **Elegida:** se conservan (`CaminoRadiante`, `IdealesJurados`, `MarcosInfusas/Opacas`, `MaxInvestiture`), se dejan en su valor por defecto y la UI las oculta por `features`. No se borran ni se renombran (riesgo cero de migración destructiva, `lectura_motor_reglas_api.md` §6). `MistbornReglas.ValidarIdentidad` rechaza `CaminoRadiante` no vacío y `Ascendencia` fuera de `Humano | Kandra | Sangre koloss`.

### Otras decisiones menores
- **Alomancia y Feruquimia** se guardan en los huecos `HabilidadPersonalizada1..6` con atributo `VOL`/`INT`, **fijadas por nombre** por la configuración (`set.habilidadesInvestidas`). La ficha las pinta en un bloque propio «Habilidades Investidas» y las excluye de los huecos libres; el tirador ya las resuelve por nombre (`DiceRoller.tsx:68-97`). Un nacidoble conserva 4 huecos libres. Alternativa (columnas dedicadas) en Pregunta 12.3.
- **Exclusividad de caminos de nacido del metal**: se aplica en el selector (un solo `CaminoInvestido`) y en la validación del servidor, no como cláusula de prerrequisito.
- **Hemalurgia v1**: solo enciclopedia + `PoderPersonaje.origen = 'clavo'`; las penalizaciones a la Defensa espiritual quedan para la fase futura (§13).
- **Camino de nacido del metal como camino inicial** (L.17-18 / PDF 23-24): campo `Recursos['caminoInicialInvestido'] = 1` **[inferido]** en lugar de columna; el motor de talentos lo lee para marcar el principal como `autoGranted`. Alternativa: columna booleana (12.5).

---

## 4. Modelo de datos (API)

### 4.1 Entidades y columnas

| Entidad / fichero | Propiedad C# exacta | Columna PostgreSQL | Notas |
|---|---|---|---|
| `Messages/Database/Entities/CampaignEntity.cs` | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` | `"RuleSet" text NOT NULL DEFAULT 'stormlight'` | índice no único `IX_Campaigns_RuleSet` (opcional) |
| ídem | `public string? Era { get; set; }` | `"Era" text NULL` | `null` salvo `mistborn` |
| `Messages/Database/Entities/CharacterEntity.cs` | `public string CaminoInvestido { get; set; } = string.Empty;` | `"CaminoInvestido" text NOT NULL DEFAULT ''` | debajo de `CaminoRadiante` (`:19`) |
| ídem | `public List<PoderPersonaje> Poderes { get; set; } = [];` | `"Poderes" jsonb NOT NULL DEFAULT '[]'` | `ValueConverter` JSON (System.Text.Json, camelCase) + `ValueComparer` |
| ídem | `public Dictionary<string, double> Recursos { get; set; } = new();` | `"Recursos" jsonb NOT NULL DEFAULT '{}'` | ídem |
| `Messages/Database/Entities/WeaponCatalogEntity.cs` (las 4 clases) | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` | `"RuleSet" text NOT NULL DEFAULT 'stormlight'` en `WeaponCatalog`, `ArmorCatalog`, `GearItems`, `CatalogOptions` | `'shared'` solo en `CatalogOptions` |
| `WeaponCatalogEntity`, `ArmorCatalogEntity`, `GearItemEntity` | `public short? Era { get; set; }` · `public double? Price { get; set; }` (solo arma y armadura; `GearItem.Price` ya existe `double`) · `public bool IsRewardOnly { get; set; }` | `"Era" smallint NULL`, `"Price" double precision NULL`, `"IsRewardOnly" boolean NOT NULL DEFAULT false` | `GearItemEntity.Category string? ` (`'vial'`) opcional |
| `Messages/Database/Entities/GlobalNpcEntity.cs` | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` | `"RuleSet" text NOT NULL DEFAULT 'stormlight'` | índice `IX_GlobalNpcs_RuleSet` |

`PoderPersonaje` (nuevo, `Messages/Characters/PoderPersonaje.cs`, compartido por entidad, request y response):

```csharp
namespace Messages.Characters;
public sealed class PoderPersonaje
{
    public required string Arte { get; set; }          // "alomancia" | "feruquimia"  (un tercer set declara sus artes)
    public required string Metal { get; set; }         // id ASCII: "acero", "estano", "atium"...
    public string Origen { get; set; } = "camino";     // "camino" | "clavo" | "lerasium" | "medallon"
    public bool Completo { get; set; } = false;        // false = naciente (L.162 / PDF 168); atium alomántico siempre true (L.177 / PDF 183)
    public long? MetaId { get; set; }                  // MetaEntity.Id de «Entrenar tu poder» / «Fabricar tu mente de metal»
    public int Cargas { get; set; } = 0;               // feruquimia: cargas actuales de la mente de metal (una reserva por metal, L.131 / PDF 137)
    public int AjusteCargasMax { get; set; } = 0;      // Componedor: −1 permanente por uso (L.158 / PDF 164)
    public int Viales { get; set; } = 0;               // alomancia, solo metales raros (L.130 / PDF 136)
    public bool Desprovisto { get; set; } = false;     // estado Desprovisto [poder] (L.310 / PDF 316)
}
```

Claves de `Recursos` declaradas por `MistbornReglas` (el servidor rechaza claves fuera de `IReglasSet.RecursosPermitidos`): `investiduraActual`, `cuentasAtium`, `arquillas` (decimal, óbolo = 0,01), `caminoInicialInvestido` (0/1). Stormlight declara `[]` en v1 (sus marcos siguen en columnas).

### 4.2 Configuración EF (`Infrastructure/Data/CosmereContext.cs`, dentro de `OnModelCreating`, tras el bloque Character → Metas `:63-68`)

```csharp
var json = new JsonSerializerOptions(JsonSerializerDefaults.Web);
modelBuilder.Entity<CharacterEntity>().Property(c => c.Poderes)
    .HasColumnType("jsonb")
    .HasConversion(v => JsonSerializer.Serialize(v, json),
                   v => JsonSerializer.Deserialize<List<PoderPersonaje>>(v, json) ?? new(),
                   new ValueComparer<List<PoderPersonaje>>((a, b) => JsonSerializer.Serialize(a, json) == JsonSerializer.Serialize(b, json),
                                                           v => JsonSerializer.Serialize(v, json).GetHashCode(),
                                                           v => JsonSerializer.Deserialize<List<PoderPersonaje>>(JsonSerializer.Serialize(v, json), json)!));
modelBuilder.Entity<CharacterEntity>().Property(c => c.Recursos)  // mismo patrón con Dictionary<string,double>
    .HasColumnType("jsonb").HasConversion(/* ídem */);
```
Motivo del conversor: evita `EnableDynamicJson()` de Npgsql 8 y mantiene el tipo C# fuerte. No se consulta por dentro del JSON.

### 4.3 Migraciones EF (nombre exacto y orden; todas con la API parada)

| # | Nombre | Contenido `Up` | `Down` |
|---|---|---|---|
| M1 | `AddRuleSetAndEraToCampaign` | `AddColumn<string>("RuleSet","Campaigns","text",nullable:false,defaultValue:"stormlight")`; `AddColumn<string>("Era","Campaigns","text",nullable:true)` | `DropColumn` ×2 |
| M2 | `AddCaminoInvestidoPoderesRecursos` | `AddColumn<string>("CaminoInvestido","Characters","text",nullable:false,defaultValue:"")`; `AddColumn<string>("Poderes","Characters","jsonb",nullable:false,defaultValueSql:"'[]'::jsonb")`; `AddColumn<string>("Recursos","Characters","jsonb",nullable:false,defaultValueSql:"'{}'::jsonb")` | `DropColumn` ×3 |
| M3 | `AddRuleSetToCatalog` | columnas de §4.1 en las 4 tablas; `migrationBuilder.Sql("UPDATE \"CatalogOptions\" SET \"RuleSet\"='shared' WHERE \"Id\" IN (1,2,3,10,11,...,27,30,31,32,40,42,43,44,46,50,51,52,53,54,56,57,58,60,61,62,64,70,71,73,74,80,81,82,83,85)")` (`lectura_delta_catalogo.md` §5.2); índices `(RuleSet)` | revertir columnas |
| M4 | `SeedMistbornCatalog` | `INSERT` de 35 armas (ids 1001-1035), 8 armaduras (1001-1008), 84 objetos (1001-1084) y opciones nuevas (4, 33, 34, 47-49, 65-69, 78, 79, 86, 100, 110-115, 140, 141) con `RuleSet='mistborn'`; termina con los tres `setval(pg_get_serial_sequence(...), MAX("Id"))` (`lectura_delta_catalogo.md` §6.6). **Sin `DELETE FROM`** inicial | `DELETE ... WHERE "RuleSet"='mistborn'` |
| M5 | `AddRuleSetToGlobalNpcs` | `AddColumn<string>("RuleSet","GlobalNpcs","text",nullable:false,defaultValue:"stormlight")` + índice | `DropColumn` |

Patrón de referencia: `Infrastructure/Migrations/20260929110638_AddIdealesJurados.cs:11-19`. Las marcas de tiempo deben ser posteriores a `20260929110638`. Se auto-aplican al arrancar (`API/Program.cs:93-94`, `AutoMigrate` por defecto `true`).

### 4.4 Compatibilidad con campañas y personajes existentes
- Toda campaña existente queda `RuleSet='stormlight'`, `Era=NULL` por `DEFAULT`. `ReglasSetProvider.Obtener(null | desconocido)` devuelve Stormlight.
- Personajes: `CaminoInvestido=''`, `Poderes=[]`, `Recursos={}` → `MapToResponse` produce exactamente los mismos ocho `StatDesglose` que hoy y `DerivadosSet={}`.
- Clientes antiguos (PWA cacheada) que envíen `UpdateCharacterRequest` sin `caminoInvestido/poderes/recursos`: las tres propiedades son **anulables** en el request y `ApplyUpdate` no asigna si llegan `null` (evita pisar con vacío; `lectura_motor_reglas_api.md` riesgo 13).
- Catálogo: todas las filas actuales → `'stormlight'` (y las opciones compartidas → `'shared'`), así `GET /catalog/weapons` sin `campaignId` devuelve lo mismo que hoy.
- Diario sembrado con `CampaignId = 1` (`20260526130330_AddDiaryEntries.cs`) sigue en una campaña Stormlight.

---

## 5. Contrato API

### 5.1 DTOs (propiedades exactas; `types/index.ts` debe espejarlas en camelCase)

| DTO (fichero) | Propiedades nuevas |
|---|---|
| `CreateCampaignRequest` (`Messages/Campaigns/In/CreateCampaignRequest.cs:3-6`) | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` · `public string? Era { get; set; }` |
| `UpdateCampaignSettingsRequest` (nuevo, mismo fichero) | `public string? Era { get; set; }` |
| `CampaignResponse` y `CampaignDetailResponse` (`Messages/Campaigns/Out/CampaignResponse.cs:3-22`) | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` · `public string? Era { get; set; }` |
| `CreateCharacterRequest` (`Messages/Characters/In/CharacterRequest.cs:3-12`) | `public string CaminoInvestido { get; set; } = string.Empty;` |
| `UpdateCharacterRequest` (`:19-98`) | `public string? CaminoInvestido { get; set; }` · `public List<PoderPersonaje>? Poderes { get; set; }` · `public Dictionary<string, double>? Recursos { get; set; }` (anulables: `null` = no tocar) |
| `CharacterResponse` (`Messages/Characters/Out/CharacterResponse.cs`), **después** de `DesvioCalculado` (`:43-44`) y de `Metas` | `public string CaminoInvestido { get; set; } = string.Empty;` · `public List<PoderPersonaje> Poderes { get; set; } = [];` · `public Dictionary<string, double> Recursos { get; set; } = new();` · `public Dictionary<string, StatDesglose> DerivadosSet { get; set; } = new();` |
| Catálogo `Messages/Catalog/Out/*Response.cs` y `In/CreateCatalogRequests.cs` | `RuleSet`, `Era`, `Price`, `IsRewardOnly` en respuestas de arma, armadura y equipo; `RuleSet` en opción; `CreateWeaponRequest/CreateArmorRequest`: `long CampaignId`, `double? Price`, `short? Era`, `bool IsRewardOnly` |
| `GlobalNpcResponse`/`GlobalNpcRequest` (`Messages/GlobalNpcs/*`) | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` |

Claves de `DerivadosSet` que emite `MistbornReglas.Derivar` (cada una un `StatDesglose`): `alomancia.modificador`, `alomancia.limite`, `alomancia.dado` (`Total` = caras; 1 = «sin tirada»; `Unidad = "d"`), `alomancia.alcance` (`Unidad = "m"`), `feruquimia.modificador`, `feruquimia.limite`, `feruquimia.dado`, `feruquimia.alcance`, `feruquimia.cargasMax`. Solo se emiten las del arte que el personaje posee (habilidad Investida presente). Stormlight emite `{}`.

### 5.2 Endpoints

| Ruta | Verbo | Permiso | Cambio |
|---|---|---|---|
| `/campaigns` | POST | usuario | acepta `ruleSet`, `era`; valida `RuleSetIds.EsValido`; si `ruleSet=='mistborn'` exige `era` válida; si `stormlight`, `era` se ignora (`null`) → `ArgumentException` (400) |
| `/campaigns`, `/campaigns/{id}`, `/campaigns/join` | GET/POST | miembro | devuelven `ruleSet`, `era` (proyección `CampaignService.cs:17-33`, detalle `:48-62`, join `:115`) |
| `/campaigns/{id}/settings` | **PATCH** (nuevo) | director (`GetGmCampaignAsync`) | body `{ era }`; `RuleSet` **no** editable (ignorado si llega) |
| `/campaigns/{cid}/characters` (POST, PUT) | | director / dueño | validación por set (§5.3); `ApplyUpdate` asigna `CaminoInvestido`, `Poderes`, `Recursos` si no son `null` |
| `/catalog/weapons|armor|gear|options/{category}` | GET | usuario | `?campaignId=` opcional → set+era de la campaña (debe ser miembro); sin él → `stormlight` sin filtro de era |
| `/catalog/weapons|armor` (POST), `/catalog/*/{id}` (DELETE, PUT description) | | **director de `campaignId`** | corrige el defecto previo `CatalogController.cs:11-13` |
| `/global-npcs` | GET | usuario | `?campaignId=` → filtra `RuleSet`; POST/PUT aceptan `ruleSet` |
| `/campaigns/{cid}/characters/{id}?enCombate=` | GET | | sin cambio (`CharactersController.cs:24-26`) |

### 5.3 Validaciones por set (en `IReglasSet.ValidarIdentidad`, lanzan `ArgumentException` → 400 por `ExceptionMiddleware.cs:21-30`)

| Set | Caminos heroicos | `CaminoRadiante` | `CaminoInvestido` | Ascendencia | `Poderes` | `Recursos` |
|---|---|---|---|---|---|---|
| stormlight | `agente, cazador, enviado, erudito, guerrero, lider` | 10 ids actuales (`CharacterService.cs:17-21`) | debe ser `''` | `Humano, Oyente` (conservar; la inconsistencia con `FormasCantor.AscendenciasCantor` se deja como está, riesgo 9 de `lectura_motor_reglas_api.md`) | debe ser `[]` | claves ∈ `[]` |
| mistborn | los mismos 6 (L.19 / PDF 25) | debe ser `''` | `brumoso, nacido-de-la-bruma, feruquimista, ferrin, nacidoble` (L.19 / PDF 25) | `Humano, Kandra, Sangre koloss` (L.32-39 / PDF 38-45); `Kandra` incompatible con `CaminoInvestido != ''` (L.18 / PDF 24) | `Arte ∈ {alomancia, feruquimia}`, `Metal ∈ 17 ids`, sin duplicados `(Arte, Metal)`; `Origen ∈ {camino, clavo, lerasium, medallon}`; `Completo=true` obligatorio para `alomancia:atium` | claves ∈ `investiduraActual, cuentasAtium, arquillas, caminoInicialInvestido`; valores ≥ 0 |

No se valida por era en el servidor (la era puede cambiar; la UI filtra). No se valida nivel, atributos, presupuesto ni prerrequisitos (como hoy; P5). Bloqueo no-GM (`CharacterService.cs:111-116`): se añade `request.CaminoInvestido = character.CaminoInvestido` **solo si** `set.CaminoInvestidoLoCambiaElDirector` (Stormlight `true`, Mistborn `false`: el libro permite tomar el camino en cualquier nivel, L.128 / PDF 134) → Pregunta 12.2.

### 5.4 Reflejo en `src/types/index.ts` (fichero con cambios sin commitear: anclar por texto, no por línea)

```ts
export type RuleSetId = 'stormlight' | 'mistborn'
export type Era = 'era1' | 'era2' | 'entre-eras'
export interface Campaign { /* ...existentes... */ ruleSet: RuleSetId; era: Era | null }
export interface PoderPersonaje {
  arte: string; metal: string; origen: 'camino' | 'clavo' | 'lerasium' | 'medallon'
  completo: boolean; metaId: number | null; cargas: number; ajusteCargasMax: number; viales: number; desprovisto: boolean
}
export interface Character { /* ...existentes... */
  caminoInvestido: string; poderes: PoderPersonaje[]; recursos: Record<string, number>
  derivadosSet: Record<string, StatDesglose>
}
export type UpdateCharacterRequest = Omit<Character, 'id'|'campaignId'|'createdAt'|'updatedAt'|'metas'|'concentracion'|'defensaFisica'|'defensaCognitiva'|'defensaEspiritual'|'salud'|'investidura'|'movimiento'|'desvioCalculado'|'derivadosSet'>
export interface WeaponCatalog { /* ... */ ruleSet: RuleSetId; era: 1 | 2 | null; price: number | null; isRewardOnly: boolean }
export interface GlobalNpc { /* ... */ ruleSet: RuleSetId }
```

---

## 6. Motor de reglas en servidor

### 6.1 Interfaz y proveedor (`Services/RuleSets/`)

```csharp
namespace Services.RuleSets;
public interface IReglasSet
{
    string Id { get; }
    IReadOnlyDictionary<string, List<ReglaTalento>> ReglasTalentos { get; }       // núcleo común + propias
    IReadOnlySet<string> RecursosPermitidos { get; }
    bool CaminoInvestidoLoCambiaElDirector { get; }
    string CaminoInvestidoDe(CharacterEntity c);                                   // Stormlight: c.CaminoRadiante; Mistborn: c.CaminoInvestido
    void ValidarIdentidad(CreateOrUpdateIdentidad id);                             // record (CaminoHeroico, CaminoRadiante, CaminoInvestido, Ascendencia, Poderes, Recursos)
    bool TieneInvestidura(CharacterEntity c, IReadOnlyList<string> talentos);
    BonosForma BonosAtributos(CharacterEntity c, IReadOnlyList<string> talentos, out string? origen);
    bool DesvioBonoSeAcumula { get; }
    Dictionary<string, StatDesglose> Derivar(CharacterEntity c, IReadOnlyList<string> talentos);
}
public interface IReglasSetProvider { IReglasSet Obtener(string? ruleSetId); }
public sealed class ReglasSetProvider(IEnumerable<IReglasSet> sets) : IReglasSetProvider
{
    private readonly Dictionary<string, IReglasSet> _porId = sets.ToDictionary(s => s.Id);
    public IReglasSet Obtener(string? id) => id is not null && _porId.TryGetValue(id, out var s) ? s : _porId[RuleSetIds.Stormlight];
}
```
Registro en `Services/Bootstrap.cs:19-35` (tres líneas): `services.AddSingleton<IReglasSet, StormlightReglas>(); services.AddSingleton<IReglasSet, MistbornReglas>(); services.AddSingleton<IReglasSetProvider, ReglasSetProvider>();`. Singleton inyectado en scoped es válido; las reglas son datos puros.

Un tercer set = una clase `XReglas : IReglasSet` + una línea en `Bootstrap.cs` + un id en `RuleSetIds`.

### 6.2 Dónde se invoca (archivo:línea actual → cambio)

| Sitio | Cambio |
|---|---|
| `CharacterService.cs:10` | `CharacterService(CosmereContext db, IReglasSetProvider reglas)` |
| `CharacterService.cs:12-33` | se mueven a `StormlightReglas.ValidarIdentidad` tal cual (mismos mensajes en inglés) |
| `CharacterService.cs:35-48, 50-64, 66-97, 99-123, 135-155` | tras `EnsureMember/EnsureGm`: `var set = await ObtenerReglasAsync(campaignId);` (consulta `db.Campaigns.AsNoTracking().Where(c=>c.Id==campaignId).Select(c=>c.RuleSet).FirstOrDefaultAsync()`); `MapToResponse(c, set, ctx)`; `set.ValidarIdentidad(...)` en `:79` y `:118` |
| `CharacterService.cs:172-199 ApplyUpdate` | asignar `CaminoInvestido`, `Poderes`, `Recursos` cuando no son `null` |
| `CharacterService.cs:237-253 BuildInvLineas` **(WIP)** | nuevo parámetro opcional al final `bool? tieneInvestidura = null`; `:239` usa `tieneInvestidura ?? string.IsNullOrEmpty(c.CaminoRadiante)==false` |
| `CharacterService.cs:288-301 BuildDesvioLineas` **(WIP)** | parámetro opcional `bool acumula = false`; si `true`, suma en vez de «mayor» |
| `CharacterService.cs:310 MapToResponse` **(WIP)** | firma `MapToResponse(CharacterEntity c, IReglasSet set, ContextoJuego? ctx = null)`; `:314-315` → `fb = set.BonosAtributos(c, talentos, out var forma)`; `:336-379` pasar `reglas: set.ReglasTalentos, tieneInvestidura: inv` a cada `Calcular`; tras `:405`: `CaminoInvestido = c.CaminoInvestido, Poderes = c.Poderes, Recursos = c.Recursos, DerivadosSet = set.Derivar(c, talentos)` |
| `TalentosReglas.cs:170-177 Calcular` **(WIP)** | dos parámetros opcionales **al final**: `IReadOnlyDictionary<string, List<ReglaTalento>>? reglas = null, bool? tieneInvestidura = null`; `:182` `foreach (var (nombre, rs) in reglas ?? Reglas)` |
| `TalentosReglas.cs:214-224 EsActiva` | `TieneInvestidura` → `tieneInvestidura ?? !string.IsNullOrEmpty(c.CaminoRadiante)` |
| `TalentosReglas.cs:240-261 GradosDe` **(WIP)** | tras el `switch`, buscar por nombre exacto en `HabilidadPersonalizada1..6` (`Alomancia`, `Feruquimia`) |
| `CampaignService.cs:65-72` | validar y asignar `RuleSet`, `Era`; `:17-33`, `:48-62`, `:115` devolver ambos |

### 6.3 Implementaciones

**`StormlightReglas`**: `ValidarIdentidad` = los tres `HashSet` de `CharacterService.cs:12-23` + `CaminoInvestido==''` + `Poderes.Count==0`; `TieneInvestidura` = `!string.IsNullOrEmpty(c.CaminoRadiante)`; `BonosAtributos` = `FormasCantor.BonosActivos(c.Ascendencia, talentos)` con `origen = FormasCantor.FormaActiva(talentos)` si `EsCantor` (envuelve el WIP, no lo reescribe); `DesvioBonoSeAcumula=false`; `ReglasTalentos = TalentosReglas.Reglas`; `Derivar` → `{}`; `RecursosPermitidos = []`; `CaminoInvestidoLoCambiaElDirector = true`.

**`MistbornReglas`**:
- `ValidarIdentidad`: §5.3.
- `TieneInvestidura`: `CaminoInvestido ∈ {brumoso, nacido-de-la-bruma, nacidoble}` (L.26 / PDF 32; L.57 / PDF 63) **o** algún `Poder` con `Arte=="alomancia"` y `Origen ∈ {clavo, lerasium}` (L.290 / PDF 296).
- `BonosAtributos`: devuelve `BonosForma` vacío en v1 (Bendiciones kandra y Tamaño desmedido se editan a mano en el atributo: el libro los describe como aumentos permanentes del valor **y del máximo**, L.34-35 / PDF 40-41, L.39 / PDF 45; **[inferido]** que no son bonos temporales). `DesvioBonoSeAcumula=true` (sin efecto mientras el bono sea 0).
- `ReglasTalentos`: `TalentosReglas.Reglas` + `["Resistencia koloss"] = MaxSalud PorNivel 1` (L.38 / PDF 44). Los homónimos Compostura, Robusto, Serenidad, Paso firme e Investido ya existen con el mismo efecto (L.80, 81, 89, 90, 136 / PDF 86, 87, 95, 96, 142).
- `Derivar`: por cada habilidad Investida presente en `HabilidadPersonalizada1..6` (nombre exacto `Alomancia` → atributo `Voluntad`; `Feruquimia` → `Intelecto`):

| Clave | Fórmula (L.163 / PDF 169; L.128 / PDF 134; L.131 / PDF 137) | Líneas del `StatDesglose` |
|---|---|---|
| `<arte>.modificador` | grados + atributo | `Grados en Alomancia`, `Voluntad` |
| `<arte>.limite` | grados 0-5 → `max(1, grados)`; ≥6 → rango (texto literal «igual al rango») | `Grados`, línea `Portentoso` +1 solo para alcance (no aquí) |
| `<arte>.dado` | grados 0 → 1 («sin tirada»); 1..5 → 4,6,8,10,12; ≥6 → 20 | una línea `Dado de artes metálicas` |
| `<arte>.alcance` (`Unidad="m"`) | 3,6,12,24,48,96,192 según grados 0..6+; `Portentoso` suma 1 grado efectivo (L.136 / PDF 142) | `Grados`, `Portentoso` |
| `feruquimia.cargasMax` | `2 + grados` + `rango` si talento `Mentes de metal ampliadas` (L.146 / PDF 152) | `Base 2`, `Grados en Feruquimia`, `Mentes de metal ampliadas` |

El `+5` de `Guardián del conocimiento` (solo cobre, L.229 / PDF 235) y el `AjusteCargasMax` por poder se aplican en el cliente al pintar cada mente (son por poder, no por arte).

### 6.4 Reglas de metal, metas y Desprovisto en el servidor
- Los 83 talentos de alomancia y 85 de feruquimia **no** modifican estadísticas permanentes (`lectura_alomancia_inventario.md` §0; `lectura_feruquimia_hemalurgia_inventario.md` §2.4), así que el registro `ReglasTalentos` no necesita entradas por metal. Excepción: `Investido` (ya existe).
- La **meta de nacido del metal** es una `MetaEntity` normal (3 hitos; `MetaService.cs:42-43`) enlazada por `PoderPersonaje.MetaId`. `Completo` se marca a mano (interruptor en la UI) o la UI lo propone al concluir la meta con `tipoConclusion='exito'`. `MetaService` no cambia en v1.
- **Desprovisto** es estado por poder (`PoderPersonaje.Desprovisto`), gestionado por la acción «Beber vial» en la UI (quita el estado de los poderes cuyos metales contiene el vial, lo deja en el resto, Investidura actual al máximo; L.129 / PDF 135). El servidor solo lo persiste.

### 6.5 Convivencia con el WIP de formas de cantor
- `StormlightReglas` **envuelve** `FormasCantor`; no se tocan `FormasCantor.cs`, `BonosForma` ni los `Build*Lineas` salvo parámetros opcionales al final.
- `CharacterResponse`: propiedades añadidas **después** de `DesvioCalculado` (`:43-44`) y `Metas`; sin reordenar.
- La extracción de `StormlightReglas` se hace **después** de que el WIP compile (`dotnet build` verde) y con **JSON de referencia** capturado antes (§11).
- `TalentosReglas.Calcular` ya recibió `situacionalBase` del WIP; los dos parámetros nuevos van detrás.

---

## 7. Frontend

### 7.1 Módulo `src/rulesets/` (el corazón del ángulo B)

```ts
// src/rulesets/types.ts
export interface RuleSetConfig {
  id: RuleSetId; nombre: string; nombreCorto: string; mundo: string; emblema: string           // 'archivo-tormentas' | 'nacidos-bruma-emblem'
  eras: { id: Era; label: string; aviso?: string }[] | null
  features: { caminoRadiante: boolean; idealesJurados: boolean; marcos: boolean; formasCantor: boolean; potencias: boolean
              artesMetalicas: boolean; viales: boolean; arquillas: boolean; mencionSpren: boolean; pestanaAventura: boolean }
  habilidades: HabilidadDef[]                        // 18: { field, label, atributo: AttrField, codigo: 'FUE'|..., columna: 'fisico'|'cognitivo'|'espiritual' }
  habilidadesInvestidas: { nombre: string; atributo: AttrField; codigo: string; icono: LucideIcon }[]   // [] | Alomancia/Feruquimia
  ascendencias: { id: string; label: string; eras?: Era[]; icono: LucideIcon; puntosAtributoBase: number; arbol?: ArbolAscendencia }[]
  caminosHeroicos: HeroicPath[]                      // mismos 6 ids; especialidades por set
  caminoInvestido: { field: 'caminoRadiante' | 'caminoInvestido'; label: string; opciones: CaminoInvestidoDef[]; excluyente: boolean } | null
  poderes: PoderDef[]                                // POTENCIAS (Stormlight) | PODERES_ALOMANCIA + PODERES_FERUQUIMIA
  talentos: ReglasSetTalentos                        // ver 7.6
  recursos: { clave: string; label: string; icono: LucideIcon; decimales?: number }[]
  derivados: { clave: string; label: string; grupo: string }[]            // claves de derivadosSet a mostrar
  moneda: { simbolo: 'mc' | 'ar'; nombre: string; imagen?: string; decimales: number }
  tablas: { cargaKg: number[]; levantamientoKg: number[] }               // 6 tramos por Fuerza
  overlays: { aventuras: AventurasOverlay; combat: CombatOverlay }
  enciclopedia: TopicDef[]                           // id, label, description, tone, ruta, emblema
  tema: { dataRuleset: string; themeBg: { light: string; dark: string } }
  iconos: { investidura: LucideIcon; caminoInvestido: Record<string, LucideIcon> }
}
```
- `src/rulesets/stormlight.ts`: `features` todo `true` salvo `artesMetalicas/viales/arquillas`; `habilidades` con las etiquetas del libro de Tormentas («Armamento ligero», «Armamento pesado», «Saber», Atletismo FUE, Intimidación VOL; `cosmere-api/Resources/pdfextract/ch3_chars.txt`) → Pregunta 12.7; `caminoInvestido = { field: 'caminoRadiante', label: 'Orden', opciones: RADIANT_ORDERS }`; `moneda = { simbolo: 'mc', ... }`; `tablas.cargaKg = [22.5,45,112.5,225,1125,2250]`; `overlays` vacíos (si la base queda neutral, el overlay Stormlight reintroduce Empoderado, la excepción de Inconsciente, etc.).
- `src/rulesets/mistborn.ts`: `eras` tres; `caminoInvestido = { field: 'caminoInvestido', label: 'Camino de nacido del metal', opciones: CAMINOS_NACIDOS_DEL_METAL, excluyente: true }`; `habilidadesInvestidas` Alomancia (VOL, `Flame`) y Feruquimia (INT, `Anvil`) **[inferido iconos]**; `recursos` investiduraActual, cuentasAtium, arquillas; `moneda ar` con imagen `dinero-era1|era2`; `tablas.cargaKg = [25,50,125,250,1250,2500]`, `levantamientoKg = [50,100,250,500,2500,5000]` (L.50 / PDF 56).
- `src/rulesets/index.ts`: `RULESETS`, `getRuleSet(id = 'stormlight')`, `isAvailable(item: { eras?: Era[] }, era: Era | null)` (`entre-eras` = unión).
- Hooks (`src/store/campaignStore.ts`, aditivo): `export const useRuleSet = () => useCampaignStore(s => s.currentCampaign?.ruleSet ?? 'stormlight')`, `useEra`, `useRuleSetConfig = () => getRuleSet(useRuleSet())`.

### 7.2 Store, persistencia e hidratación
- `campaignStore.ts:19` persiste `{currentCampaign, isGm}`; objetos antiguos sin `ruleSet` caen a `'stormlight'` por el selector (sin `migrate`).
- `AppLayout.tsx:13-17`: *gate* `ready = currentCampaign?.id === Number(campaignId)`; `useLayoutEffect` fija `document.documentElement.dataset.ruleset = getRuleSet(ruleSet).tema.dataRuleset` y lo borra al desmontar; `<Outlet/>` y `<DiceRoller/>` solo si `ready`; error con `ErrorMessage` + `Button` «Reintentar» (sustituye `.catch(() => {})`).
- `index.html:18-26`: segundo script previo a la pintura que lee `localStorage['cosmere-campaign']`, compara `state.currentCampaign.id` con `/^\/campaigns\/(\d+)/` y pone `data-ruleset`.
- `themeStore.ts:12,19`: `THEME_BG` por set (`getRuleSet(document.documentElement.dataset.ruleset).tema.themeBg`); `applyTheme(mode)` lee el atributo.

### 7.3 Rutas y navegación
- `App.tsx:46-66`: nuevas rutas `encyclopedia/origenes`, `encyclopedia/nacidos-del-metal`, `encyclopedia/artes-metalicas`, `encyclopedia/conversaciones`, `encyclopedia/empenos`; componente `RuleSetGate` (`src/components/RuleSetGate.tsx`) que envuelve las páginas exclusivas y redirige a `../encyclopedia` si `!set.enciclopedia.some(t => t.ruta === actual)`.
- `Sidebar.tsx:38-54`: sin cambio estructural. `:153-168` añade `<RuleSetBadge/>` (nuevo componente: emblema 14 px + «Nacidos de la bruma · Era 2»), también en `HomeCampaignPage.tsx:47-57` y en `CampaignSettingsPage.tsx` sección «Ambientación».
- `GmPage.tsx:8-12`: pestaña `caminapiedras` solo si `features.pestanaAventura`.

### 7.4 Creación de campaña (UI)
`CampaignListPage.tsx:16-91, 222-235`: sustituir `InlineForm` de crear por `Sheet` (`ui.tsx:920`) «Nueva campaña» con `Field`+`Input` nombre (`data-autofocus`), eyebrow «Ambientación» + `Segmented` (`ui.tsx:686`) `[Tormentas | Bruma]` (ariaLabel completos), vista previa `aria-live="polite"` (emblema 40 px + frase), si `mistborn` eyebrow «Era» + `Segmented` `[Era 1 | Era 2 | Entre eras]` con *hint* (`fs.xs`, `c.subtle`): «Era 1: El Mundo de Ceniza. El libro advierte de que su tono es más sombrío (L.372).» / «Era 2: Cambio y revolución. Armas de fuego, aeronaves, sangre koloss.» / «Entre eras: se muestran las opciones de ambas.»; aviso `tone.topacio` + `TriangleAlert` «La ambientación no se puede cambiar después de crear la campaña.»; pie `Button` secundario «Cancelar» y primario «Crear campaña» (`disabled` si `!name.trim() || (mistborn && !era) || isPending`). `createMutation` (`:131-138`) envía `{ name, ruleSet, era }`. Tarjeta (`:343-478`): chip del set (`heroPill`) y chip «ERA 1 / ERA 2 / ENTRE ERAS» (`tone.granate` / `tone.zafiro` / `tone.cuarzo` **[inferido]**). `InlineForm` sigue para «Unirse». Restricción `DESIGN.md`: `Segmented` para elección única, nada bajo 12 px, solo tokens.

### 7.5 Ficha (`CharacterDetailPage.tsx`, fichero con WIP: anclar por texto)
| Zona | Hoy | Con la configuración |
|---|---|---|
| Identidad (`IdentityItem` ×3, `:704-743`) | Ascendencia, Camino, Orden | Ascendencia (`set.ascendencias` filtradas por `isAvailable(era)`), Camino heroico, `set.caminoInvestido?.label` («Orden» / «Camino de nacido del metal») o nada si `null` |
| Botón Forma (`:509, 685-700`) | `ascendencia==='Oyente'` | `features.formasCantor && isCantorAncestry` |
| Investidura (`:777, 827-833`) | `!!caminoRadiante`, «Solo disponible para Radiantes» | `investidura.total > 0` (lo decide el servidor); texto `set.textos.sinInvestidura` («Solo disponible para Radiantes» / «Solo disponible para alomantes»); si `features.artesMetalicas`, `Stepper` de **Investidura actual** (`recursos.investiduraActual`, 0..máx) y botón «Beber vial» (abre `Sheet` con los metales de los poderes alománticos: marca Desprovisto según selección y pone actual = máx) |
| Aviso de puntos (`getPuntosAtributoEsperados`, `:357-363`) | 12 + hitos | `ascendencia.puntosAtributoBase` (12; kandra 6, L.34 / PDF 40) + hitos 3,6,9,12,15,18 (igual) |
| Tope de atributo (`:1018 max={5}`) | 5 | `5 + bonoMaximo(ascendencia, atributo)` (koloss Fuerza +1, L.38 / PDF 44); Bendiciones a mano **[inferido]** |
| Habilidades (`SECTIONS :385-431`) | etiquetas propias | `set.habilidades` (tabla única; corrige Atletismo FUE e Intimidación VOL) |
| Huecos personalizados (`:1092-1175`) | `isPotencia` + `SurgeIcon` | `esInvestida = set.habilidadesInvestidas.some(h => h.nombre === nombre)`; bloque aparte «Habilidades Investidas» con el icono del set y el nombre bloqueado; los huecos ocupados no se listan entre los libres |
| Pestañas (`:443-449`) | 3 | + «Artes metálicas» si `features.artesMetalicas && poderes.length > 0` |
| Pestaña Artes metálicas (nueva, hoja L.404 / PDF 410) | — | cabecera por arte con `StatTile` **Mod. / Alcance / Dado / Límite** desde `derivadosSet`; lista sin tope de `PoderCard` (glifo del metal, nombre «Alomancia de acero», chip era, `Switch` «Meta de nacido del metal completada» → enlaza `metaId`, contador `Stepper` de cargas (máx = `feruquimia.cargasMax.total + ajusteCargasMax + (cobre && Guardián del conocimiento ? 5 : 0)`) o de viales (raros) o de cuentas de atium (`recursos.cuentasAtium`), `Badge` «Desprovisto», talentos del poder tomados); botón «Añadir poder» (`Sheet` con cuadrícula de 16 metales + atium filtrada por camino y era, L.372 / PDF 378) |
| Pickers (`:1250-1360`) | ascendencia, camino, forma, orden | ascendencia por set; forma y orden solo con `features`; picker nuevo «Camino de nacido del metal» (5 opciones filtradas por era; al elegir: añade el talento principal a `talentos`, crea la(s) habilidad(es) Investida(s) con valor 1 en huecos libres, crea las metas iniciales «Entrenar tu poder» / «Fabricar tu mente de metal» (`metasApi.create`) y los `poderes` iniciales según `poderes.alomancia/feruquimia` (`1` → abre selector de metal; `'todos'` → todos los de la era); cambio de camino: `ConfirmDialog`) |

Componentes de `ui.tsx` a reutilizar: `Sheet`, `ConfirmDialog`, `Segmented`, `Stepper`, `StatTile`, `Switch`, `Badge`, `Disclosure`, `EmptyState`, `Tabs`. Restricciones `DESIGN.md`: tono `amatista` para Investidura, `heliodoro` concentración, `topacio` desvío; colores de caminos NdM como hex en datos pasando por `ink()/tint()`.

### 7.6 Talentos (`lib/talentGraph.ts`, `components/talentos/*`)

`ReglasSetTalentos` (en `RuleSetConfig.talentos`):
```ts
export interface ReglasSetTalentos {
  caminosHeroicos: HeroicPath[]; caminosInvestidos: CaminoInvestidoDef[]      // RadiantOrder[] | CaminoNacidoDelMetal[]
  poderes: PoderDef[]                                                          // Potencia[] | PoderMetal[]
  arbolesAscendencia: Record<string, ArbolAscendencia>                        // { oyente: ARBOL_CANTOR } | { kandra, 'sangre-koloss' }
  grids: Record<string, TalentGrid>; summaries: Record<string, string>
  skillNameMap: Record<string, SkillField>                                     // + 'Armamento ligero/pesado'
  nombresIdeales: readonly string[] | null; formasIniciales: readonly string[]
}
```
Cambios del motor (todos aditivos; detalle en `lectura_motor_talentos_web.md` §5.4):
1. `buildTalentGraph(options, set)`, `parsePrereq(text, known, set)`, `catalog(set)` (caché por `set.id`, `talentGraph.ts:167-197`), `talentSlotsAt(level, ascendencia, startingPathId, set)`, `talentBudget(character, graph, set)`.
2. `PrereqClause` (`:212-219`) += `{ kind: 'poder'; poderId: string }` (regex `^(?:poder\s+)?(alomancia|feruquimia) de (.+)$`, `met` si `state.poderes` contiene el id con `completo`), `{ kind: 'atributo'; atributo: AttrField; min }`, `{ kind: 'skillAny'; options: { skill; field; min }[] }` (texto «A N o más o B N o más»), `ancestry: string[]` en lugar de `'cantor'` (`:218, :240`).
3. `TreeKind` (`:297`) += `'nacidoMetal' | 'poderMetal'`; `TalentGraphOptions` (`:299-306`) += `caminoInvestido?: string | null; poderes?: readonly PoderEstado[]; ascendencia?: string`; bloque nuevo en `buildTalentGraph` entre `:470` y `:500`: raíz `nacidoMetal:<id>` (clave = talento principal, `autoGranted` si `recursos.caminoInicialInvestido === 1`), árbol plano del camino, un árbol `poderMetal:<arte>:<metal>` por poder del personaje con `keyNodeId` = principal.
4. `SlotKind` (`:1081`) += `'nacidoMetal' | 'poder'`; `slotKindOf` (`:1148-1159`) deja de caer en `'radiante'`; huecos: nivel normal acepta todos, hueco de ascendencia humana solo `heroico` (L.33 / PDF 39), hueco de camino inicial acepta `principal` del camino inicial sea heroico o NdM **[inferido]**.
5. `TalentState` (`:577`) += `poderes?: readonly PoderEstado[]; atributos?: Pick<Character, AttrField>`.
6. `gateBadge` += `'meta'` con glifo del set (`MapPieces.tsx:91-94`), textos «Meta de nacido del metal pendiente: Entrenar tu poder» (`TalentLamina.tsx:36-41`, `TalentSheet.tsx:31,41`).

Mapa (`talentMap.ts`, `PathAtlas.tsx`): `PlateKind` += `'poder' | 'nacidoMetal'`; `gridKeyOf` (`talentMap.ts:76-81`) devuelve `metal:<arte>:<metal>` y `nacidoMetal:<camino>`; `PathAtlas.tsx:224` pasa a trocear `plates` en filas de 3 con un bus por fila (`mapDims` `:225-251` asume 3 por fila) y `caretX` por fila; `pathIcon` (`:69-72`) usa el glifo del metal (`CosmereIcon name="alomancia-era1-acero"`) o `set.iconos.caminoInvestido[id]`. Por defecto solo se pintan las láminas de los poderes del personaje; «Otros poderes» plegado (patrón `showOthers`, `TalentosDetailPage.tsx:129-144`).

### 7.7 Metas (`MetasDetailPage.tsx`)
- Etiqueta `Badge` «Meta de nacido del metal» cuando algún `poderes[].metaId === meta.id`; al concluir con `exito` se ofrece `ConfirmDialog` «¿Marcar el poder como completo?» que pone `completo=true`. Reglas (3 hitos, 3 conclusiones) sin cambio (L.283-284 / PDF 289-290).

### 7.8 Bolsa (`BolsaDetailPage.tsx`)
- Sección «Marcos» (`:332-429`) solo si `features.marcos`; si `features.arquillas`, sección «Arquillas» con `Stepper` decimal (0,01) sobre `recursos.arquillas`, diálogo «Añadir / Gastar arquillas».
- `getCapacity` (`:233-241`) → `set.tablas.cargaKg[tramo(fuerza)]`.
- Precio (`:785`) → `formatMoneda(value, set.moneda)` («0,05 ar» con `toLocaleString('es-ES')`), imagen `set.moneda.imagen` o `Coins`.
- Picker (`:612-660`): búsqueda + chips de subcategoría (ligeras, pesadas, especiales, fuego; viales); oculta `isRewardOnly`.
- Viales: la compra de un «Vial de oro (Era 1)» añade el nombre a `equipment` **y** suma 1 a `poderes[alomancia:oro].viales` si existe el poder **[inferido: conveniencia]**.

### 7.9 Dados (`DiceRoller.tsx`, `utils/dice.ts`)
- `SKILLS`/`SKILL_TO_FIELDS` (`:25-55`) → `set.habilidades` (tabla única) + `getCharSkills` sigue añadiendo huecos personalizados (Alomancia/Feruquimia ya funcionan).
- Combate `WEAPON_SKILLS` (`:1012`) → `['Armamento ligero', 'Armamento pesado', 'Agilidad', ...set.habilidadesInvestidas.filter(h => h.ataque).map(h => h.nombre)]` (Alomancia: «Lanzar una moneda» vs Defensa física, L.172 / PDF 178); con Alomancia elegida, dado de daño por defecto = `derivadosSet['alomancia.dado'].total`.
- `utils/dice.ts`: `artesMetalicas(grados, rango)` pura (misma tabla que el servidor) para prellenar; Recuperación: *hint* «La Investidura no se recupera con descansos sino con Beber vial» si `features.artesMetalicas` (L.129 / PDF 135).
- El dado de trama d12 (`dice.ts:81-90`) es un defecto previo común a ambos sets: tarea independiente T35.

### 7.10 Enciclopedia, catálogo, NPC
- `EncyclopediaPage.tsx:109-197` → `TOPICS = set.enciclopedia`; cabecera `:210` «Lore y referencia del mundo de {set.mundo}». Temas Mistborn: Orígenes, Caminos Heroicos, Caminos de nacido del metal, Artes metálicas, Combate, Aventuras, Catálogo (+ Conversaciones y Empeños compartidos, opcional).
- `AventurasPage.tsx`/`CombatPage.tsx`: datos desde `resolveAventuras(set)`/`resolveCombat(set)` (base + overlay); `CombatPage.tsx:68` «…de {set.nombre}».
- `CatalogPage.tsx:881-892` y `BolsaDetailPage.tsx:160-170`: claves unificadas `['catalog', cId, 'weapons' | 'armor' | 'gear']`, `['catalog', cId, 'opts', cat]`; `catalogApi.*` con `campaignId`; `Price` (`:150-157`) con `set.moneda`; precio también en armas y armaduras; chip «ERA 2».
- `GlobalNpcListPage.tsx:97`, `GlobalNpcDetailPage.tsx:147`, `NpcNotesPage.tsx:421`: `['global-npcs', cId]`, `globalNpcsApi.getAll(cId)`; el formulario de alta fija `ruleSet` de la campaña.
- `DiarioPage.tsx:259`: leyenda `spren` solo si `features.mencionSpren`; `:390` emblema `set.emblema`.

### 7.11 Tema e iconos
- `index.css`: bloque `:root[data-ruleset='mistborn']`, `:root[data-ruleset='mistborn'][data-theme='light']` y `@media (prefers-color-scheme: light) { :root[data-ruleset='mistborn']:not([data-theme='dark']) }` con la paleta de `lectura_superficie_ui.md` §6.3 (`--bg #0c0b0d`, `--brand #a9bccd` oscuro; `--bg #ebe8e6`, `--brand #3a5672` claro; `--atmo` con el sol rojo `rgba(190,98,84,0.10)`). Se mantienen oro, tonos gema, `--navy`.
- `lib/gameIcons.ts:21-28`: `StatIcons.investidura` por set (`Gem` / `Flame`); mapa de iconos de los 5 caminos NdM (`Flame`, `CloudFog`, `Container`, `Package`, `Merge` **[inferido]**).
- Activos oficiales nuevos en `src/assets/cosmere/`: `alomancia-era1-<metal>.svg` (17), `alomancia-era2-<metal>.svg` (17), `feruquimia-<metal>.svg` (17), `nacidos-bruma-emblem.svg`, `img/dinero-era1.webp`, `img/dinero-era2.webp` (extracción vectorial de PDF 410-411 y raster de PDF 260; `lectura_superficie_ui.md` §7.3). Registro automático por `lib/cosmereAssets.ts:2`.

---

## 8. Datos estáticos de Nacidos de la Bruma (`src/data/mistborn/`)

Organización: los ficheros Stormlight **no se mueven** (`heroicPaths.ts`, `radiantOrders.ts`, `potencias.ts`, `cantores.ts`, `talentGrids.ts`, `talentSummaries.ts`, `aventuras.ts`, `combatRules.ts`, `caminapiedras.ts` siguen en `src/data/`); `src/rulesets/stormlight.ts` los importa. Lo nuevo va en `src/data/mistborn/` y los tipos de overlay en `src/data/shared/overlays.ts`. Un tercer set = `src/data/<set>/` + `src/rulesets/<set>.ts`. (Mover Stormlight a `src/data/stormlight/` con *barrels* en las rutas antiguas es opcional, T05 lo deja preparado.)

| Fichero | Export (tipo) | Contenido | Páginas (L. / PDF) | Volumen |
|---|---|---|---|---|
| `metales.ts` | `METALES: MetalDef[]`, `MetalId`, `CategoriaAlomantica`, `CategoriaFeruquimica` | 17 metales: nombre, pareja puro/aleación, Tirón/Empujón, interno/externo, categorías, efecto alomántico, rasgo feruquímico, nombres de brumoso y ferrin, era, rareza; divinos no jugables en `NO_REPRESENTADOS` | 167-171 / 173-177 (**filas [inferido]**, cotejadas con subtítulos de entradas y L.134 / PDF 140) | ~250 líneas |
| `artesMetalicasReglas.ts` | `PROGRESION_ARTES_METALICAS`, `REGLAS_INVESTIDURA`, `REGLAS_VIALES`, `REGLAS_MENTES`, `PRECIOS_VIALES` | tabla límite/dado/alcance; Investidura, Beber vial, Desprovisto, viales, cuentas de atium; cargas, mentes llevadas, descansos; precios por era | 129-133 / 135-139; 161-165 / 167-171; 267 / 273; 307 / 313 | ~200 |
| `eras.ts` | `ERAS`, `METALES_POR_CAMINO_Y_ERA`, `isAvailable` | etiquetas, aviso Era 1, tabla de metales por camino y era, asterisco «fin de Era 1» | 371-372 / 377-378 | ~60 |
| `alomancia.ts` | `PODERES_ALOMANCIA: PoderMetal[]` | 17 entradas: acciones básicas (20), usos creativos, 83 talentos (`name, cost, prereq, description`), caminos que desbloquean | 172-212 / 178-218 (índice por metal en `lectura_alomancia_inventario.md` §3.18) | ~1100 |
| `feruquimia.ts` | `PODERES_FERUQUIMIA: PoderMetal[]` | 17 entradas: Almacenar/Decantar (34 acciones), tabla de cobre, 85 talentos, medallón | 213-250 / 219-256 | ~1100 |
| `caminosNacidosDelMetal.ts` | `CAMINOS_NACIDOS_DEL_METAL: CaminoNacidoDelMetal[]`, `TALENTOS_COMUNES_NDM` | 5 caminos: principal, concesiones, metas iniciales, habilidad inicial, árbol (5/6/6/5/11), colores hex, tablas d20 de descubrimiento | 127-159 / 133-165 | ~450 |
| `ascendencias.ts` | `ASCENDENCIAS_MISTBORN`, `BENDICIONES_KANDRA`, `ARBOL_KANDRA`, `ARBOL_SANGRE_KOLOSS` | Humano, Kandra (6 puntos, 5 Bendiciones, 8 talentos), Sangre koloss (Era 2, 5 talentos) | 32-39 / 38-45 | ~250 |
| `culturas.ts` | `PERICIAS_CULTURALES` | 15 pericias culturales con era y resumen | 40-47 / 46-53 | ~120 |
| `heroicPathsMistborn.ts` | `ESPECIALIDADES_MISTBORN: Record<HeroicPathId, HeroicPathSpecialty[]>`, `HEROIC_PATHS_MISTBORN` | 8 especialidades nuevas (Rebelde, Mataneblinos, Francotirador, Estafador, Inventor, Alborotador, Pistolero, Planificador) + reutilización de las 10 comunes de `heroicPaths.ts`; Inventor y Pistolero `eras: ['era2']` | 73-126 / 79-132; L.374-375 / PDF 380-381 | ~500 (**verificar** que el texto de las especialidades comunes coincide; si no, transcribir las 18) |
| `hemalurgia.ts` | `TIPOS_CLAVO`, `REGLAS_HEMALURGIA` | 12 clavos con rango y efecto; implantar/extraer; límites; Defensa espiritual | 251 / 257; 288-291 / 294-297 | ~120 |
| `overlays.ts` | `AVENTURAS_OVERLAY_MISTBORN`, `COMBAT_OVERLAY_MISTBORN` | las 23 operaciones de `lectura_delta_reglas_base.md` §6.2 (Desprovisto, Mermado, −Empoderado, Inconsciente, descansos, Mentoría, Agarrar→Retenido, Acometida reactiva, Sorpresa, ejemplos, moneda) | 306-312 / 312-318; 318-321 / 324-327 | ~200 |
| `equipoInicial.ts` | `EQUIPO_INICIAL_MISTBORN: PaqueteInicial[]` | 7 paquetes con nombres exactos del catálogo, dados de dinero, ×10 Era 2, beneficios | 254-255 / 260-261 | ~120 |
| `talentGridsMistborn.ts` | `TALENT_GRIDS_MISTBORN: Record<string, TalentGrid>` | claves `nacidoMetal:<camino>` (5), `metal:alomancia:<metal>` (16), `metal:feruquimia:<metal>` (16), `heroico:<camino>:<Especialidad>` (8), `kandra`, `sangre-koloss` | diagramas en L.137, 143, 147, 151, 157 y cada entrada de metal (**posiciones solo en el PDF renderizado**) | ~450 |
| `talentSummariesMistborn.ts` | `TALENT_SUMMARIES_MISTBORN` | frase corta por talento (≈206 nombres) | — (paráfrasis) | ~220 |
| `viajes.ts` (opcional) | `ALOJAMIENTO`, `MONTURAS`, `VEHICULOS` | tablas de viaje | 272 / 278 | ~40 |

Tipos compartidos nuevos en `src/data/mistborn/types.ts`: `PoderMetal extends Omit<Potencia,'ordenes'>` (`arte`, `metal`, `caminos`, `eras`, `requiereMeta`, `sinArbol`, `acciones`), `CaminoNacidoDelMetal` (`lectura_motor_talentos_web.md` §5.2), `PaqueteInicial`. Reutilizan `Talento` de `potencias.ts:3-10` y `ActivationType` de `TalentActivation.tsx:10` (los glifos del libro coinciden, L.137 / PDF 143).

---

## 9. Plan de implementación por fases y tareas

Formato por tarea: **Repo** · **Archivos** · **Qué** · **Aceptación** · **Verificación** · **Tamaño** · **Fuera de alcance**. Comandos: web `cd cosmere-web && npx tsc -b` (nunca `--noEmit`); API `cd cosmere-api && dotnet build`; migraciones **con la API parada**: `dotnet ef migrations add <Nombre> --project Infrastructure --startup-project API` y `dotnet ef database update --project Infrastructure --startup-project API`.

### Fase 0 — Cimientos API (Stormlight intacto)

**T01 · RuleSet y Era en campaña** · Fase 0 · deps: — · `cosmere-api`
- Archivos: `Messages/RuleSets/RuleSetIds.cs` (nuevo: `RuleSetIds`, `EraIds`), `Messages/Database/Entities/CampaignEntity.cs`, `Messages/Campaigns/In/CreateCampaignRequest.cs`, `Messages/Campaigns/Out/CampaignResponse.cs`, `Services/Campaigns/CampaignService.cs` (`:17-33`, `:48-62`, `:65-72`, `:115`), migración `AddRuleSetAndEraToCampaign`.
- Qué: §4.1 fila 1-2, §5.1 fila 1 y 3, §5.2 fila 1-2. En `CreateCampaignAsync`: `if (!RuleSetIds.EsValido(request.RuleSet)) throw new ArgumentException($"Invalid RuleSet: '{request.RuleSet}'."); if (request.RuleSet == RuleSetIds.Mistborn && !EraIds.EsValida(request.Era)) throw new ArgumentException("Era is required for mistborn campaigns.");` `Era = request.RuleSet == RuleSetIds.Mistborn ? request.Era : null`.
- Aceptación: `POST /campaigns {name}` sigue funcionando y devuelve `ruleSet:"stormlight", era:null`; `GET /campaigns` de una campaña anterior incluye `ruleSet:"stormlight"`; `POST` con `ruleSet:"mistborn"` sin `era` → 400; `Down` de la migración elimina ambas columnas.
- Verificación: `dotnet build`; `dotnet ef migrations add AddRuleSetAndEraToCampaign ...`; `dotnet ef database update ...`; `psql`/pgAdmin: `SELECT "Id","RuleSet","Era" FROM "Campaigns"` todo `stormlight`/`NULL`.
- Tamaño: M. Fuera: personajes, catálogo, cliente.

**T02 · Registro `IReglasSet` + `StormlightReglas` sin cambio de comportamiento** · Fase 0 · deps: T01 · `cosmere-api`
- Archivos: `Services/RuleSets/IReglasSet.cs`, `IReglasSetProvider.cs`, `ReglasSetProvider.cs`, `StormlightReglas.cs` (nuevos); `Services/Bootstrap.cs:19-35`; `Services/Characters/CharacterService.cs` (`:10`, `:12-33`, 5 métodos, `MapToResponse`, `BuildInvLineas`, `BuildDesvioLineas`); `Services/Characters/TalentosReglas.cs` (`Calcular :170-177`, `:182`, `EsActiva :214-224`, `GradosDe :240-261`); `Messages/Characters/Out/CharacterResponse.cs` (añadir `DerivadosSet` después de `DesvioCalculado` y `Metas`).
- Qué: §6.1-6.3 (solo Stormlight), §6.5. `GradosDe` también busca en `HabilidadPersonalizada1..6`. **Antes de tocar**: guardar en `scratchpad/baseline/` el JSON de `GET /campaigns/{id}/characters` de ≥3 personajes reales (uno con forma de cantor, uno con armadura, uno radiante con `Investido`).
- Aceptación: `dotnet build` verde con el WIP; los JSON de referencia son **idénticos** salvo las tres propiedades nuevas (`caminoInvestido:""`, `poderes:[]`, `recursos:{}`, `derivadosSet:{}` — si T19 aún no existe, solo `derivadosSet:{}`); `FormasCantor.cs` sin cambios (`git diff --stat` no lo lista más allá del WIP).
- Verificación: `dotnet build`; comparar JSON con `diff` tras normalizar.
- Tamaño: L. Fuera: Mistborn, validaciones nuevas.

**T03 · `PATCH /campaigns/{id}/settings` (era)** · Fase 0 · deps: T01 · `cosmere-api`
- Archivos: `API/Controllers/CampaignsController.cs`, `Services/Campaigns/ICampaignService.cs`, `CampaignService.cs`, `Messages/Campaigns/In/CreateCampaignRequest.cs` (`UpdateCampaignSettingsRequest`).
- Qué: `[HttpPatch("{id:long}/settings")]`; `GetGmCampaignAsync`; si `campaign.RuleSet != Mistborn` y llega `era` → 400; valida `EraIds.EsValida`; devuelve `CampaignDetailResponse`.
- Aceptación: jugador → 403/404; director cambia `era1`→`entre-eras` y `GET` lo refleja; `ruleSet` en el body se ignora.
- Verificación: `dotnet build`; Swagger. Tamaño: S. Fuera: UI.

### Fase 1 — Cimientos web (app usable, Stormlight idéntico, set visible)

**T04 · Tipos y API de campaña en el cliente** · Fase 1 · deps: T01 · `cosmere-web`
- Archivos: `src/types/index.ts` (WIP: anclar por texto; añadir `RuleSetId`, `Era`, `Campaign.ruleSet/era`), `src/api/campaigns.ts:10-11` (`create(payload: { name: string; ruleSet: RuleSetId; era: Era | null })`, `updateSettings(id, { era })`), `src/store/campaignStore.ts` (hooks `useRuleSet`, `useEra`).
- Aceptación: `npx tsc -b` sin errores; `CampaignListPage` compila pasando `{ name, ruleSet: 'stormlight', era: null }`.
- Tamaño: S. Fuera: UI de selección.

**T05 · Módulo `src/rulesets/` con Stormlight** · Fase 1 · deps: T04 · `cosmere-web`
- Archivos: `src/rulesets/types.ts`, `stormlight.ts`, `index.ts`, `hooks.ts`; `src/data/shared/overlays.ts` (tipos `Overlay<T>`, `SectionOverlay`, `AventurasOverlay`, `CombatOverlay`, `resolveAventuras`, `resolveCombat`).
- Qué: §7.1. `stormlight.ts` referencia los datos actuales; `tablas.cargaKg` copia `BolsaDetailPage.tsx:233-241`; `habilidades` = las 18 con `field`, etiqueta del libro, `atributo` y `columna` (Físico FUE+VEL; Cognitivo INT+VOL; Espiritual DIS+PRE). `enciclopedia` = los 6 `TOPICS` actuales (`EncyclopediaPage.tsx:109-197`) con `ruta`.
- Aceptación: `getRuleSet('stormlight').habilidades.length === 18`; `getRuleSet(undefined).id === 'stormlight'`; `isAvailable({}, null) === true`; `npx tsc -b`.
- Tamaño: M. Fuera: consumir el módulo en páginas.

**T06 · Hidratación, `data-ruleset` y tema** · Fase 1 · deps: T05 · `cosmere-web`
- Archivos: `src/components/AppLayout.tsx:13-30`, `index.html:18-26`, `src/store/themeStore.ts:12-32`.
- Qué: §7.2. `Spinner` mientras `!ready`; `ErrorMessage` + «Reintentar» + «Volver a campañas» si falla; `useLayoutEffect` pone/quita `data-ruleset`; `applyTheme` lee el atributo para `theme-color`.
- Aceptación: con una campaña A persistida, abrir `/campaigns/B/home` por URL no muestra ningún frame con datos de A (ni `isGm` de A); `/campaigns` y `/login` no llevan `data-ruleset`; en una campaña Stormlight la UI es idéntica (sin bloque CSS para `stormlight`).
- Tamaño: M. Fuera: paleta Mistborn.

**T07 · Creación de campaña, tarjetas, badge y Ajustes** · Fase 1 · deps: T04, T05, T03 · `cosmere-web`
- Archivos: `src/pages/campaigns/CampaignListPage.tsx` (`:16-91`, `:131-138`, `:222-235`, `:343-478`), `src/components/RuleSetBadge.tsx` (nuevo), `src/components/Sidebar.tsx:153-168`, `src/pages/home/HomeCampaignPage.tsx:47-57`, `src/pages/campaigns/CampaignSettingsPage.tsx` (sección «Ambientación»: badge; `Segmented` de era para director con `ConfirmDialog` «Cambiar la era filtra las opciones nuevas; lo ya elegido se conserva.»).
- Qué: §7.4. Textos exactos: título «Nueva campaña»; `Segmented` «Tormentas» / «Bruma» (`ariaLabel` «Archivo de las Tormentas», «Nacidos de la bruma»); era «Era 1», «Era 2», «Entre eras»; aviso «La ambientación no se puede cambiar después de crear la campaña.»; botón «Crear campaña».
- Aceptación: crear Stormlight sin tocar nada funciona igual que hoy; crear Mistborn sin era deshabilita el botón; la tarjeta muestra chips de set y era; Ajustes muestra la ambientación; director cambia era y la lista se invalida (`['campaigns']`, `['campaign', id]`); objetivos táctiles ≥ 44 px; `npx tsc -b`.
- Tamaño: M. Fuera: tema.

**T08 · Tabla única de habilidades en ficha, tirador y PNJ** · Fase 1 · deps: T05 · `cosmere-web`
- Archivos: `src/pages/characters/CharacterDetailPage.tsx` (`SECTIONS` ~`:385-431`; WIP, anclar por texto), `src/components/DiceRoller.tsx:25-55`, `src/pages/gm/GlobalNpcDetailPage.tsx:17-54`, `src/lib/talentGraph.ts:73-81` (`SKILL_NAME_MAP` += `'Armamento ligero'`, `'Armamento pesado'`).
- Qué: las cuatro tablas leen `set.habilidades`. Etiquetas «Armamento ligero», «Armamento pesado», «Saber»; Atletismo→`fuerza`/FUE; Intimidación→`voluntad`/VOL (hoja NB L.402 / PDF 408; manual Tormentas `ch3_chars.txt`). Los campos `armasLigeras`, `armasPesadas`, `conocimiento` **no** se renombran.
- Aceptación: los modificadores de Atletismo e Intimidación coinciden entre ficha y tirador; PNJ agrupa Cognitivo INT+VOL y Espiritual DIS+PRE; `npx tsc -b`.
- Tamaño: M. Fuera: errores del dado de trama (T35). → Pregunta 12.7 (afecta a Stormlight; recomendación: sí).

**T09 · `talentGraph` parametrizado por `ReglasSetTalentos` (sin cambio de comportamiento)** · Fase 1 · deps: T05 · `cosmere-web`
- Archivos: `src/lib/talentGraph.ts` (`:42-45` imports → parámetro; `catalog()` `:167-197` con caché `Map<RuleSetId, Catalog>`; `allTalentNames(set)`; `parsePrereq(text, known, set)`; `buildTalentGraph(options, set)`; `graphOptionsFromCharacter`; `talentSlotsAt(..., set)`; `talentBudget(..., set)`), `src/components/talentos/talentMap.ts:116` (`buildPathModels(graph, set)`), `src/pages/personajes/TalentosDetailPage.tsx`, `TalentosPage.tsx`, `CharacterDetailPage.tsx` (llamadas), `src/rulesets/stormlight.ts` (`talentos`).
- Qué: §7.6 punto 1 solamente. Valor por defecto del parámetro = Stormlight para no romper llamadas.
- Aceptación: para 3 personajes reales, `evaluate(buildTalentGraph(opts, STORMLIGHT.talentos), state)` produce el mismo `Map` de estados que antes (volcar a JSON y comparar); el mapa de talentos se ve igual; `npx tsc -b`.
- Tamaño: L. Fuera: cláusulas nuevas.

### Fase 2 — Datos de Nacidos de la Bruma (paralelizables entre sí; deps: T05 por los tipos)

**T10 · `metales.ts`, `artesMetalicasReglas.ts`, `eras.ts`, `types.ts`** · Fase 2 · `cosmere-web` · Páginas: L.129-133 / PDF 135-139; L.161-171 / PDF 167-177; L.267 / PDF 273; L.371-372 / PDF 377-378. Aceptación: 17 `MetalId`; cada metal con `pareja` recíproca; `PROGRESION_ARTES_METALICAS[0..6]` exacta (1/1/2/3/4/5/rango; 1,d4..d20; 3..192 m); `METALES_POR_CAMINO_Y_ERA` reproduce la tabla L.372; filas de la tabla de metales marcadas `// [inferido]` donde proceda; `npx tsc -b`. Tamaño: M.

**T11 · `alomancia.ts` (17 poderes, 83 talentos)** · Fase 2 · Páginas por metal: acero 172-174/178-180, aluminio 175/181, atium 176-178/182-184, bendaleo 179-181/185-187, bronce 182-184/188-190, cadmio 185-187/191-193, cinc 188-190/194-196, cobre 191-192/197-198, cromo 193-194/199-200, duraluminio 195-196/201-202, electro 197-198/203-204, estaño 199-200/205-206, hierro 201-203/207-209, latón 204-206/210-212, nicrosil 207-208/213-214, oro 209-210/215-216, peltre 211-212/217-218. Reglas: prerrequisitos literales del **texto** del talento (no del diagrama); raíz normalizada a «poder Alomancia de X»; `notaLibro` en Revitalizar (icono 8 vs «acción gratuita»), Manipulación sutil (`action1`), «Enhaciendo el no ver» (sic). Aceptación: conteo por metal = 7,0,6,5,6,4,6,4,6,2,6,6,7,6,4,2,6 (83); `cost` ∈ `ActivationType`; `npx tsc -b`. Tamaño: L.

**T12 · `feruquimia.ts` (17 poderes, 85 talentos)** · Fase 2 · Páginas: acero 213-215/219-221 … peltre 249-250/255-256 (tabla en `lectura_feruquimia_hemalurgia_inventario.md` §2.1). Cada poder con `almacenar` y `decantar` (`action1`), tabla de cobre (L.228 / PDF 234), `desbloqueadoPor` (atium solo feruquimista; bendaleo/cadmio/cromo solo ferrin y nacidoble; nicrosil `sinArbol`). Aceptación: conteo 6,3,2,5,5,5,6,6,6,5,6,6,6,6,0,6,6 (85); `npx tsc -b`. Tamaño: L.

**T13 · `caminosNacidosDelMetal.ts`** · Fase 2 · Páginas: L.127-159 / PDF 133-165 (árboles L.137, 143, 147, 151, 157). Prerrequisitos del principal: «ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia» (brumoso, ferrin, nacidoble) / «ascendencia humana; …» (nacido de la bruma, feruquimista). Componedor/Resonancia aleada con `prereq` literal y `notaLibro` «condición sobre la elección de metales». Colores hex por camino (pasan por `ink()`). Aceptación: 5 caminos, árboles 5/6/6/5/11; `metasIniciales` según L.135, 141, 146, 150, 155. Tamaño: M.

**T14 · `ascendencias.ts` y `culturas.ts`** · Fase 2 · Páginas: L.32-39 / PDF 38-45; L.40-47 / PDF 46-53. Kandra `puntosAtributoBase: 6`, `prohibeCaminoInvestido: true`; Sangre koloss `eras: ['era2']`, `bonoMaximo: { fuerza: 1 }`; Bendiciones (Consciencia DIS+2, Potencia FUE+1/VEL+1, Presencia INT+1/PRE+1, Estabilidad VOL+2, Fortaleza desvío+1). Aceptación: 3 ascendencias, 5 Bendiciones, 8 talentos kandra, 5 koloss, 15 culturas con era. Tamaño: M.

**T15 · `heroicPathsMistborn.ts` (8 especialidades)** · Fase 2 · Páginas: L.73-126 / PDF 79-132. Primero comparar el texto de las 10 especialidades comunes con `heroicPaths.ts`; si difiere, transcribir las 18. Aceptación: cada camino tiene 3 especialidades; Inventor y Pistolero `eras: ['era2']`; `npx tsc -b`. Tamaño: L.

**T16 · `overlays.ts`, `hemalurgia.ts`, `equipoInicial.ts`** · Fase 2 · deps: T05 (tipos de overlay). Páginas: delta §6.2 (L.306-312 / PDF 312-318; L.318-321 / PDF 324-327); L.288-291 / PDF 294-297; L.254-255 / PDF 260-261. Textos de Desprovisto y Mermado según `lectura_delta_reglas_base.md` §1.2. Aceptación: `resolveAventuras(MISTBORN).estados.length === 15` ordenados alfabéticamente, sin «Empoderado»; `resolveCombat(MISTBORN)` Agarrar → «Retenido»; 7 paquetes cuyos nombres existen todos en el seed M4. Tamaño: M.

**T17 · `talentGridsMistborn.ts` y `talentSummariesMistborn.ts`** · Fase 2 · deps: T11-T15 · Requiere renderizar las páginas de los diagramas con `pdf_image_extractor` (PDF 143, 149, 153, 157, 163-165 y las de cada metal) y transcribir `col/row` como en `talentGrids.ts:25-30`. Mientras no exista una rejilla, el mapa cae a 2 carriles en orden de lectura (`talentMap.ts:105`): entrega parcial aceptable. Aceptación: toda celda referencia un `name` existente (test de consistencia en consola: `Object.values(GRIDS).flatMap(g=>g.cells).every(c => names.has(c.name))`). Tamaño: L.

**T18 · Activos oficiales** · Fase 2 · `cosmere-api/Resources/Parts/mistborn_assets/extract.py` (nuevo; PyMuPDF + fontTools) y `cosmere-web/src/assets/cosmere/` (51 SVG + emblema + 2 webp). Procedimiento `lectura_superficie_ui.md` §7.3. Aceptación: `hasCosmereIcon('alomancia-era1-acero')`; SVG con `fill="currentColor"` y `viewBox`; nota de procedencia en `CosmereIcon.tsx:3-10`. Tamaño: M.

### Fase 3 — API Mistborn

**T19 · `CaminoInvestido`, `Poderes`, `Recursos` en personaje** · Fase 3 · deps: T02 · `cosmere-api`
- Archivos: `Messages/Characters/PoderPersonaje.cs` (nuevo), `CharacterEntity.cs` (3 propiedades), `CharacterRequest.cs` (create + update anulables), `CharacterResponse.cs` (3 propiedades tras `DerivadosSet`), `Infrastructure/Data/CosmereContext.cs` (conversores §4.2), `CharacterService.cs` (`ApplyUpdate` + `MapToResponse` copia; `CreateCharacterAsync :81-92` asigna `CaminoInvestido`), migración `AddCaminoInvestidoPoderesRecursos`.
- Aceptación: PUT sin las tres propiedades conserva valores; PUT con `poderes:[{arte:'alomancia',metal:'acero',...}]` persiste y vuelve en GET; JSON de referencia de T02 idéntico salvo las propiedades nuevas; `Down` revierte.
- Verificación: `dotnet build`; `dotnet ef migrations add AddCaminoInvestidoPoderesRecursos ...`; `database update`. Tamaño: M.

**T20 · `MistbornReglas`** · Fase 3 · deps: T19 · `cosmere-api`
- Archivos: `Services/RuleSets/MistbornReglas.cs` (nuevo), `Services/Bootstrap.cs` (una línea), `CharacterService.cs:111-116` (bloqueo condicionado a `set.CaminoInvestidoLoCambiaElDirector`).
- Qué: §5.3 y §6.3. Mensajes de error en inglés con el valor recibido (estilo actual): `Invalid CaminoInvestido: '...'`, `Kandra cannot take a camino de nacido del metal.`, `Invalid Poder: 'alomancia:xyz'.`, `Invalid Recurso key: '...'`.
- Aceptación (campaña mistborn): personaje con `CaminoInvestido='brumoso'`, `HabilidadPersonalizada1='Alomancia'` (`VOL`, valor 3), VOL 2, DIS 1, PRE 3, nivel 7 → `investidura.total = 5`, `derivadosSet['alomancia.modificador'].total = 5`, `limite 3`, `dado 8`, `alcance 24`; con `Portentoso` → `alcance 48`; `feruquimia.cargasMax` = `2 + grados` (+ rango con «Mentes de metal ampliadas»); `Ascendencia='Oyente'` → 400; `CaminoRadiante='windrunners'` → 400; `Resistencia koloss` suma nivel a salud.
- Tamaño: M. Fuera: clavos (defensa espiritual), Bendiciones automáticas.

**T21 · Catálogo por set en la API** · Fase 3 · deps: T01 · `cosmere-api`
- Archivos: `Messages/Database/Entities/WeaponCatalogEntity.cs` (4 clases), `Messages/Catalog/In|Out/*`, `Services/Catalog/CatalogService.cs:11-71`, `API/Controllers/CatalogController.cs:14-85`, migración `AddRuleSetToCatalog`.
- Qué: §4.1, §5.2 filas catálogo; helper `ResolverSetYEraAsync(long? campaignId, long userId)` (miembro; devuelve `(ruleSet, era)`; `null` → `("stormlight", null)`); filtros `RuleSet = @set AND (Era IS NULL OR @era IS NULL OR Era = @era)`; opciones `RuleSet IN ('shared', @set)`; escritura solo director de `campaignId`.
- Aceptación: `GET /catalog/weapons` sin parámetro devuelve exactamente las 25 armas actuales; con `campaignId` de una campaña mistborn Era 1 no devuelve armas de fuego; jugador no GM hace `POST /catalog/weapons` → 403.
- Tamaño: M.

**T22 · `SeedMistbornCatalog`** · Fase 3 · deps: T21 · `cosmere-api` · Migración con los `INSERT` de `lectura_delta_catalogo.md` §6.2-6.5 (35 armas 1001-1035, 8 armaduras 1001-1008, 84 objetos 1001-1084, opciones nuevas) y los tres `setval` (§6.6). Antes: comprobar en la BD que no existan armas `IsCustom` con nombres Mistborn. Aceptación: `SELECT COUNT(*) FROM "WeaponCatalog" WHERE "RuleSet"='mistborn'` = 35; `POST /catalog/weapons` crea con id ≥ 1036; `Down` deja solo Stormlight. Tamaño: L. Fuera: precios de Tormentas (12.9).

**T23 · PNJ globales por set** · Fase 3 · deps: T01 · `cosmere-api` · `GlobalNpcEntity.cs`, DTOs, `GlobalNpcService.cs`, `GlobalNpcsController.cs` (`?campaignId=`), migración `AddRuleSetToGlobalNpcs`. Aceptación: 34 PNJ quedan `stormlight`; campaña mistborn ve lista vacía. Tamaño: S.

### Fase 4 — Web Mistborn

**T24 · `src/rulesets/mistborn.ts`** · Fase 4 · deps: T05, T10-T16 · Config completa §7.1. Aceptación: `getRuleSet('mistborn').features.marcos === false`, `.caminoInvestido.field === 'caminoInvestido'`, `.habilidadesInvestidas.length === 2`; `npx tsc -b`. Tamaño: M.

**T25 · Motor de talentos: cláusulas y árboles de nacido del metal** · Fase 4 · deps: T09, T24 · `src/lib/talentGraph.ts` (§7.6 puntos 2-6), `src/types/index.ts` (`PoderEstado`). Aceptación: `parsePrereq('Armamento pesado 2 o más o Armamento ligero 2 o más', known, MB)[0].kind === 'skillAny'`; `parsePrereq('Voluntad 4 o más')` → `atributo`; `parsePrereq('poder Alomancia de acero')` → `poder` con `poderId 'alomancia:acero'`; `'ascendencia humana o de sangre koloss'` → `ancestry ['humano','sangre-koloss']`; un brumoso de acero con poder naciente ve «Ráfaga de monedas» `locked` con badge `meta` y `available` al marcar `completo`; Stormlight: mismos resultados que T09. Tamaño: L.

**T26 · UI de talentos para caminos y poderes de metal** · Fase 4 · deps: T25, T17, T18 · `talentMap.ts` (`PlateKind`, `gridKeyOf`, `buildPathModels`), `PathAtlas.tsx` (filas de 3, `pathIcon`), `TalentLamina.tsx` (banda de poder con glifo del metal; sin copy de Ideales si `!set.talentos.nombresIdeales`), `MapPieces.tsx` (insignia `meta`), `TalentSheet.tsx`, `MyTalents.tsx` (acciones de poder: Quemar/Almacenar/Decantar, Beber vial en lugar de `RADIANT_ACTIONS`), `TalentosDetailPage.tsx` (`IdealesControl` y formas solo por `features`; estado vacío «Asigna un camino heroico o un camino de nacido del metal en la ficha»). Aceptación: un nacido de la bruma con 10 poderes no desborda horizontalmente a 360 px; láminas de poderes no elegidos en «Otros poderes»; Stormlight idéntico. Tamaño: L.

**T27 · Ficha Mistborn** · Fase 4 · deps: T19, T20, T24, T08, T18 · `CharacterDetailPage.tsx` (WIP) y nuevos `src/components/ficha/ArtesMetalicasTab.tsx`, `PoderCard.tsx`, `BeberVialSheet.tsx`, `CaminoInvestidoPicker.tsx`, `MetalPicker.tsx`; `CharacterListPage.tsx:254-258` (envía `caminoInvestido:''`; pills por set), `PersonajesPage.tsx:250-261`, `MetasPage.tsx`, `TalentosPage.tsx`, `BolsaPage.tsx` (extraer `CharacterIdentityPills`). Qué: §7.5 completa. Aceptación: elegir «Brumoso» crea el talento principal, la habilidad Alomancia (VOL, 1) y la meta «Entrenar tu poder»; «Beber vial» con oro y acero marcados deja Desprovisto el resto y pone Investidura actual = máx; kandra no puede elegir camino de nacido del metal; Era 1 oculta Sangre koloss; Stormlight idéntico; `npx tsc -b`. Tamaño: L.

**T28 · Metas de nacido del metal** · Fase 4 · deps: T19, T27 · `MetasDetailPage.tsx` (badge, `ConfirmDialog` al concluir con éxito). Aceptación: concluir con éxito la meta enlazada propone marcar el poder completo; rechazar no cambia nada. Tamaño: S.

**T29 · Bolsa Mistborn** · Fase 4 · deps: T19, T21, T22, T24 · `BolsaDetailPage.tsx` (§7.8), `src/lib/moneda.ts` (`formatMoneda`). Aceptación: capacidad FUE 3 = 125 kg en mistborn y 112,5 en stormlight; «Arquillas» con decimales; picker con búsqueda; `isRewardOnly` oculto; Stormlight muestra «Marcos» igual que hoy. Tamaño: M.

**T30 · Dados** · Fase 4 · deps: T08, T24 · `DiceRoller.tsx:1012` y Recuperación; `utils/dice.ts` `artesMetalicas()`. Aceptación: con Alomancia 3 el combate propone d8; Recuperación muestra el hint solo en mistborn; `npx tsc -b`. Tamaño: S.

**T31 · Catálogo y PNJ en el cliente** · Fase 4 · deps: T21, T22, T23, T24 · `src/api/catalog.ts`, `src/api/global-npcs.ts`, `CatalogPage.tsx` (`:36`, `:150-157`, `:340`, `:364`, `:686-870`, `:881-892`), `BolsaDetailPage.tsx:160-170`, `GlobalNpcListPage.tsx:97`, `GlobalNpcDetailPage.tsx:147`, `NpcNotesPage.tsx:421`. Claves `['catalog', cId, ...]`, `['global-npcs', cId]`; invalidar `['catalog', cId]`. Aceptación: cambiar de campaña stormlight→mistborn muestra el catálogo correcto sin recargar; precio en armas y armaduras; chip «ERA 2». Tamaño: M.

**T32 · Enciclopedia por set** · Fase 4 · deps: T24, T16 · `EncyclopediaPage.tsx`, `App.tsx`, `RuleSetGate.tsx`, páginas nuevas `src/pages/encyclopedia/OrigenesPage.tsx`, `NacidosDelMetalPage.tsx`, `ArtesMetalicasPage.tsx` (lista de 17 metales con glifo, pestañas Alomancia/Feruquimia, bloque Hemalurgia solo texto), opcionales `ConversacionesPage.tsx`, `EmpenosPage.tsx` (compartidas, L.331-351 / PDF 337-357); `AventurasPage.tsx`/`CombatPage.tsx` leen `resolve*(set)`; `HeroicPathsPage.tsx:250` subtítulo; `combatRules.ts:24,103` y `aventuras.ts` neutralizados (12.6). Aceptación: `/encyclopedia/radiant-orders` en mistborn redirige; «Desprovisto» y «Mermado» aparecen en Estados; Stormlight muestra «Empoderado». Tamaño: L.

**T33 · Tema Mistborn, iconos, director y diario** · Fase 4 · deps: T06, T18, T24 · `src/index.css` (tres bloques `data-ruleset='mistborn'`), `lib/gameIcons.ts`, `GmPage.tsx:8-12` (pestaña Aventura por `features`), `DiarioPage.tsx:259, 390`. Aceptación: contraste ≥ 4,5:1 en `--text*` sobre `--bg..--surface-3` en ambos temas; revisión visual de 6 pantallas (inicio, ficha, talentos, bolsa, enciclopedia, catálogo) en claro y oscuro; Stormlight sin cambios. Tamaño: M.

**T34 · Equipo inicial por paquetes** · Fase 4 · deps: T16, T29 · `src/components/ficha/EquipoInicialSheet.tsx` desde la Bolsa (vacía) o la ficha: elegir paquete, tirar dados con `utils/dice.ts`, ×10 en Era 2, añadir nombres a `weapons/armor/equipment`, `recursos.arquillas`; beneficios Fugitivo/Guardador marcan `completo` al elegir camino. Aceptación: Noble en Era 2 recibe `10×4d20` arquillas y «Bastón de duelo». Tamaño: M. Opcional en v1.

### Fase 5 — Deuda base independiente

**T35 · Dado de trama d6 y naturales acumulativos** · deps: — · `cosmere-web` · `utils/dice.ts:81-90, 137-147`, `DiceRoller.tsx:99-108`. Libro: d6 con 2 blancas, 2 Oportunidades, 2 Complicaciones (+2/+4); 20 y 1 naturales se **acumulan** al dado (L.10-12 / PDF 16-18; Tormentas L.8-10). Fuera de este proyecto pero conviene antes de compartir datos (evita atribuir al set un fallo de reglas). Tamaño: S.

---

## 10. Orden de ejecución recomendado y paralelismo

```
Fase 0  T01 → T02 → T03                      (API; secuencial; antes: WIP de cantor estable y JSON de referencia)
Fase 1  T04 → T05 → { T06 ∥ T07 ∥ T08 ∥ T09 } (web)   ← la app queda USABLE: Stormlight idéntico, set visible en campaña
Fase 2  { T10 ∥ T11 ∥ T12 ∥ T13 ∥ T14 ∥ T15 ∥ T18 } → { T16 ∥ T17 }   (datos; un agente por fichero; en paralelo con fase 3)
Fase 3  T19 → T20 ; T21 → T22 ; T23           (API; tres cadenas independientes)
Fase 4  T24 → { T25 → T26 } ∥ { T27 → T28 } ∥ T29 ∥ T30 ∥ T31 ∥ T32 ∥ T33 → T34
Fase 5  T35 en cualquier momento (independiente)
```
- **Hitos de uso:** tras **F1** la app funciona con Stormlight intacto y se pueden crear campañas Mistborn (sin contenido aún: la ficha es la genérica). Tras **F3+T24+T27** un brumoso tiene ficha, Investidura y poderes. Tras **F4** completa, paridad de funciones.
- Las migraciones M1-M5 se generan en el orden T01, T19, T21, T22, T23 y siempre con `dotnet build` verde y la API parada.
- Paralelismo máximo: fase 2 (7 agentes) y fase 4 (6 cadenas). Las tareas de datos no tocan código compartido.

---

## 11. Riesgos y mitigaciones

| # | Riesgo | Gravedad | Mitigación |
|---|---|---|---|
| 1 | Regresión silenciosa del cálculo de Tormentas al extraer `StormlightReglas` (no hay tests) | Alta | JSON de referencia de ≥3 personajes antes de T02; `diff` tras T02 y T19; ejemplo trabajado en `lectura_motor_reglas_api.md` §1.6 |
| 2 | Colisión con el WIP de formas de cantor (mismos ficheros y líneas) | Alta | P3: parámetros opcionales al final de `Calcular`/`BuildInvLineas`/`BuildDesvioLineas`; propiedades tras `DesvioCalculado`; `FormasCantor.cs` intacto; empezar T02 con `dotnet build` verde del WIP |
| 3 | `dotnet ef migrations add` compila el proyecto de arranque: si el árbol no compila no hay migración | Media | `dotnet build` antes de cada `migrations add`; migraciones en el orden de §4.3 |
| 4 | Auto-migración en producción (`Program.cs:93-94`) con `ADD COLUMN ... DEFAULT` y `jsonb` | Baja | Columnas con default constante (metadatos en PostgreSQL ≥ 11 **[inferido, versión no verificada]**); tablas pequeñas; `deploy.sh`/`docker-compose.yml` no leídos → comprobar versión antes de desplegar |
| 5 | `localStorage` con `currentCampaign` antiguo sin `ruleSet` y condición de carrera de hidratación (`AppLayout.tsx:13-17`) | Media | Selector `?? 'stormlight'`; gate `ready`; script previo a la pintura; `data-ruleset` se limpia al salir |
| 6 | Tamaño del bundle: ≈4.500 líneas de datos nuevas (+ 51 SVG) | Media | `src/rulesets/mistborn.ts` cargado con `React.lazy`/`import()` desde `getRuleSetAsync`; SVG por `import.meta.glob` ya son perezosos (`lib/cosmereAssets.ts:2`); medir `npm run build` antes y después |
| 7 | Datos **[inferido]** del libro: tablas de metales y armaduras reconstruidas de texto desordenado; posiciones de rejilla solo en imagen; erratas (Revitalizar, «Enhaciendo el no ver», Lupa 200 ar, límite «igual al rango») | Media | Marcar `// [inferido]` y `notaLibro` en datos; revisión visual con páginas renderizadas (`pdf_image_extractor`); el texto del talento manda sobre el diagrama |
| 8 | Prerrequisitos que hoy quedarían `unknown` o bloqueados sin aviso (`parseClause`) | Media | T25 añade cláusulas y un test manual de 10 prerrequisitos representativos; `TalentSheet` muestra la cláusula `unknown` como texto para la DJ |
| 9 | Inventarios por **nombre** y catálogos homónimos | Media (solo con mezcla) | Set exclusivo por campaña (3a); filas duplicadas por set; migrar a ids queda para `'mixto'` |
| 10 | Secuencias de identidad del catálogo (`IDENTITY BY DEFAULT`, ids explícitos sin `setval`) | Media | `setval` al final de M4; comprobar estado real de la BD antes |
| 11 | Cambiar la autorización del catálogo (solo director) altera el comportamiento para jugadores | Baja | Comunicarlo; es un defecto previo de seguridad |
| 12 | Concurrencia *last-write-wins* del PUT completo con valores que cambian a menudo (cargas, Investidura actual) | Media | Documentar; mutaciones optimistas con `invalidateQueries(['character', cId, charId])`; `PATCH` dedicado como mejora futura (§13) |
| 13 | Tabla única de habilidades cambia etiquetas y dos atributos en Stormlight (Atletismo, Intimidación) | Baja | Es corrección de errores ya auditados (`docs/auditoria-reglas-2026-10-03.md`); Pregunta 12.7 |

---

## 12. Preguntas abiertas para Xavi (con recomendación por defecto)

1. **Mezcla de sets en una campaña** (L.374-375 / PDF 380-381). ¿v1 exclusivo? → **Sí**; el registro deja previsto un set `'mixto'` posterior.
2. **¿Puede el jugador (no director) cambiar su camino de nacido del metal?** El libro lo permite en cualquier nivel (L.128 / PDF 134); hoy el director bloquea `CaminoHeroico/CaminoRadiante` (`CharacterService.cs:111-116`). → **Sí para Mistborn** (`CaminoInvestidoLoCambiaElDirector=false`), con `ConfirmDialog`.
3. **Alomancia y Feruquimia en huecos `habilidadPersonalizadaN` fijados por nombre o en columnas dedicadas.** → **Huecos** (sin migración, el tirador ya funciona); columnas si más adelante hacen falta índices o validación fuerte.
4. **Persistir Investidura actual, cargas, viales y cuentas en el servidor** (hoy ningún valor actual se persiste). → **Sí** (`Recursos`/`Poderes`), porque la mesa es multi-dispositivo y el director debe verlo.
5. **Camino de nacido del metal como camino inicial**: ¿clave `recursos.caminoInicialInvestido` o columna booleana? → **Clave en `Recursos`** (sin migración; solo lo lee el presupuesto de talentos).
6. **Neutralizar el texto base de `aventuras.ts`/`combatRules.ts` (≈25 ediciones; afecta a Stormlight) o dejar la base Stormlight y solo overlay Mistborn.** → **Neutralizar** (coherente con `'mixto'` y con los defectos del Anexo C del delta).
7. **Tabla única de habilidades también para Stormlight** (Armamento ligero/pesado, Saber, Atletismo FUE, Intimidación VOL). → **Sí**: son los nombres del propio manual de Tormentas y corrige discrepancias auditadas.
8. **Era editable tras crear** (`PATCH /campaigns/{id}/settings`). → **Sí**, solo director, con confirmación; «Entre eras» disponible en v1.
9. **Rellenar `Price` de las armas y armaduras de Tormentas** (el libro los tiene; la BD no). → **No en este proyecto**; la columna queda `NULL` y la UI oculta el precio.
10. **Reescribir las descripciones de rasgos compartidos** (Defensiva, Frágil, Peligrosa, Perforante) con el texto literal del libro (afecta a Tormentas). → **Sí** (mejora ambos sets).
11. **Pestaña «Aventura» del director en Mistborn**: ¿ocultar o preparar registro de aventuras por set (existe `SPA_NacidosBruma_Legado.pdf`)? → **Ocultar en v1** (`features.pestanaAventura=false`); registro por set en §13.
12. **Sorpresa**: ¿lectura literal de Tormentas («cuando todos han jugado su primer turno») o unificar en la de Mistborn («tras el primer turno de cada personaje», coherente con la ficha del estado en ambos libros)? → **Unificar en la de Mistborn** en la base.
13. **Bendiciones kandra y clavos**: ¿aumentos permanentes editados a mano en el atributo (v1) o modelados como bonos automáticos? → **A mano en v1**; el tope dinámico de atributo (`max`) sí se eleva.
14. **Glifo canónico de estaño (I/E) y peltre (O/U)** y los iconos Lucide [inferidos] de ascendencias y caminos. → Usar I y O; revisar visualmente.

---

## 13. Fuera de alcance y trabajo futuro

- **Set `'mixto'`** (Tormentas + Nacidos de la Bruma): unión de overlays, `TieneInvestidura` radiante OR alomántico, inventarios por id en lugar de nombre, desambiguación de talentos homónimos.
- **Aventura «El legado de los nacidos de la bruma»** (`SPA_NacidosBruma_Legado.pdf`): registro de aventuras por set para la pestaña «Aventura» del director (hoy solo `caminapiedras.ts`).
- **Guía del mundo de Nacidos de la bruma** (adversarios, seed de PNJ globales `RuleSet='mistborn'`).
- **Hemalurgia mecánica**: clavos como entidad (metal, implantado, poder elegido), −2/−5 a la Defensa espiritual, Desorientado con ≤ 9, tope `min(rango,3)` (L.289-291 / PDF 295-297); medallones feruquímicos y mentes desligadas (L.293-294 / PDF 299-300).
- **Bendiciones kandra y Tamaño desmedido** como bonos automáticos vía `BonosAtributos` (el hook existe en `IReglasSet`).
- **Estado de escena** (almacenando/decantando, rondas restantes, efectos mantenidos): efímero, no se persiste.
- **`PATCH /characters/{id}/recursos`** y control de concurrencia (ETag/`UpdatedAt`).
- **Hoja de personaje imprimible** (PDF 408-411) y **hoja de artes metálicas** exportable.
- **Iconos oficiales de los 5 caminos** (no existen en el libro; Lucide) y segundas letras de estaño/peltre.
- **Páginas Conversaciones, Empeños, Dado de trama y Características** compartidas (previstas en T32 como opcionales).
- **Mover `src/data/*.ts` de Stormlight a `src/data/stormlight/`** con *barrels* (limpieza).
- **Precios de Tormentas en el catálogo**, cantidades en inventario (hoy nombres repetidos), «Viajes» como pestaña.
- **Salud y concentración actuales** en servidor (siguen sin persistirse, como hoy).
- **Corrección de defectos base** listados en `docs/auditoria-reglas-2026-10-03.md` y Anexo C del delta (salvo T35 y T08, que entran como independientes).
