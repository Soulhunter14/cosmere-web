# Mundo «Nacidos de la Bruma» para CosmereAPP — especificación definitiva (encargo: «set de reglas»)

**Índice**

- [0. Portada](#0-portada)
- [1. Resumen ejecutivo y principios de diseño](#1-resumen-ejecutivo-y-principios-de-diseño)
  - [Protocolo de ejecución (orquestador Opus 5.5)](#protocolo-de-ejecución-orquestador-opus-55)
- [2. Glosario de dominio y convenciones de nombres](#2-glosario-de-dominio-y-convenciones-de-nombres)
- [3. Decisiones de diseño](#3-decisiones-de-diseño)
- [4. Modelo de datos (API)](#4-modelo-de-datos-api)
- [5. Contrato API](#5-contrato-api)
- [6. Motor de reglas en servidor](#6-motor-de-reglas-en-servidor)
- [7. Frontend](#7-frontend)
- [8. Datos estáticos de Nacidos de la Bruma (`src/data/mistborn/`)](#8-datos-estáticos-de-nacidos-de-la-bruma-srcdatamistborn)
- [9. Plan de implementación por fases y tareas](#9-plan-de-implementación-por-fases-y-tareas)
  - [Índice de tareas](#índice)
  - [F0 — Salvaguardas](#f0--salvaguardas-sin-cambios-de-producto)
  - [F1 — Discriminador de campaña](#f1--discriminador-de-campaña-la-app-sigue-100--stormlight-ya-se-pueden-crear-campañas-bruma)
  - [F2 — Motor de servidor envuelto](#f2--motor-de-servidor-envuelto-stormlight-idéntico-mistborn-valida-calcula-y-persiste-el-estado-de-mesa)
  - [F3 — Datos estáticos y enciclopedia de Nacidos de la Bruma](#f3--datos-estáticos-y-enciclopedia-de-nacidos-de-la-bruma-paralelizable-sin-dependencias-de-api)
  - [F4 — Ficha de Nacidos de la Bruma](#f4--ficha-de-nacidos-de-la-bruma)
  - [F5 — Talentos de Nacidos de la Bruma](#f5--talentos-de-nacidos-de-la-bruma)
  - [F6 — Catálogo, PNJ, dados, tema, iconos](#f6--catálogo-pnj-dados-tema-iconos)
  - [F7 — Cierre: deuda Stormlight, hemalurgia en la ficha y equipo inicial](#f7--cierre-deuda-stormlight-hemalurgia-en-la-ficha-y-equipo-inicial)
- [10. Orden de ejecución y paralelismo](#10-orden-de-ejecución-y-paralelismo)
- [11. Riesgos y mitigaciones](#11-riesgos-y-mitigaciones)
- [12. Decisiones de diseño cerradas (Q1-Q27, 4 de octubre de 2026)](#12-decisiones-de-diseño-cerradas-q1-q27-4-de-octubre-de-2026)
- [13. Fuera de alcance y trabajo futuro](#13-fuera-de-alcance-y-trabajo-futuro)
- [14. Trazabilidad](#14-trazabilidad)

## 0. Portada

| Campo | Valor |
|---|---|
| Título | «Nacidos de la Bruma» como **mundo** elegido al crear la campaña: discriminador `World` + `Era`, motor de servidor por mundo, registro de configuración en el frontend y módulo de datos hermano. El encargo se llamó «set de reglas»; en el diseño, el discriminador de la campaña es el **mundo** (§2 «Mundo», principio P8) y lo compartido es el universo Cosmere. El nombre de este fichero no cambia. |
| Fecha | 3 de octubre de 2026; actualizado el 4 de octubre de 2026 con las decisiones de Xavi y cerrado ese mismo día como plan de ejecución para el orquestador Opus 5.5 (§1 «Protocolo de ejecución») |
| Estado | **Especificación cerrada, lista para ejecutar.** Todas las preguntas de §12 tienen decisión; el plan (§9, §10) y el protocolo (§1) son operativos. Solo lectura sobre `cosmere-api` y `cosmere-web`: nada de lo descrito existe todavía en los repositorios, salvo los anexos ya copiados al `docs/` sin seguimiento del árbol principal de `cosmere-web` (copia canónica, §1 «Protocolo de ejecución», punto 2) y la rama de integración `nacidos-de-la-bruma`, con sus worktrees `cosmere-api-nb` y `cosmere-web-nb` creados desde `main`, cuyo primer commit es T01 (el WIP de formas de cantor de Xavi). |
| Procedencia | Síntesis de tres propuestas evaluadas por un panel de tres jueces. Esqueleto y salvaguardas de la propuesta A (ganadora: riesgo mínimo, plan ejecutable por agentes); modelo de personaje tipado, registro de configuración, `DerivadosSet` y era como texto de la propuesta B; fórmulas completas de artes metálicas, acciones de dominio, Bendiciones estructuradas y reglas del selector de metales de la propuesta C. Se corrigen todas las debilidades concretas señaladas por los jueces (ver §1). |
| Fuentes de código | `api_map.md`, `web_map.md`, `lectura_motor_reglas_api.md`, `lectura_motor_talentos_web.md`, `lectura_superficie_ui.md`, `lectura_delta_reglas_base.md`, `lectura_delta_catalogo.md` (scratchpad) y lectura directa del árbol de trabajo actual de ambos repos (con el WIP sin commitear de la API). |
| Fuentes del libro | Manual *Nacidos de la bruma* (`mistborn_flow.txt`, PDF = L.+6; 416 páginas), `mistborn_rules_summary.md`, `lectura_alomancia_inventario.md`, `lectura_feruquimia_hemalurgia_inventario.md`. Manual *Archivo de las Tormentas*: `cosmere-api/Resources/pdfextract/ch3_chars.txt`, `ch10_combat.txt`, `ch4_full.txt`; `docs/auditoria-reglas-2026-10-03.md`. |
| Anexos (T00a/T00b) | **Copiados el 4 de octubre de 2026** a `docs/nacidos-de-la-bruma/` del `docs/` sin seguimiento del árbol principal de `cosmere-web` (`<docsPath>`, copia canónica durante la ejecución, §1 «Protocolo de ejecución», punto 2), junto con las tres propuestas (`propuesta-A-riesgo-minimo.md`, `propuesta-B-registro-de-sets.md`, `propuesta-C-dominio-primero.md`); T00a (repo web) los copia a la rama de integración (`cosmere-web-nb/docs/`) y los commitea, con `.gitignore`/`.dockerignore` de web y el anexo **obligatorio** `seed-mistborn.sql`; T00b (repo API) deja los renders en `<rendersPath>` y crea el `.dockerignore` de la API. Nombres: `01-mapa-api.md` (api_map), `02-mapa-web.md` (web_map), `03-superficie-ui.md`, `04-motor-reglas-api.md`, `05-motor-talentos-web.md`, `06-delta-reglas-base.md`, `07-delta-catalogo.md`, `08-inventario-alomancia.md`, `09-inventario-feruquimia-hemalurgia.md`, `10-resumen-reglas-mistborn.md`, más `fuentes/pg.sh`. **Los renders de páginas del manual (`hoja/*.png`, `img/*.png`, páginas 260-285 y 408-411) y los `.cff` extraídos NO se commitean** (reproducen páginas completas de una obra con copyright): se copian a `<rendersPath>` = `C:\Users\xavie\Documents\Repositories\personal\cosmere-api\Resources\pdfextract\renders\` (ruta absoluta; carpeta ignorada por git, `cosmere-api/.gitignore:25`, y, desde T00b, por Docker) y las tareas que los necesitan (T16, T25b, T38-1, T38-2, T38b, T40, T45, T47) los reciben como parámetro `<rendersPath>`; si la carpeta no existe, se regeneran desde `<pdfPath>` con `pdf_image_extractor` y, si tampoco hay PDF, se aplica el respaldo determinista de §1 «Protocolo de ejecución», punto 2. **El texto íntegro del manual (`mistborn_flow.txt`, 1,44 MB, obra con copyright) tampoco se copia a `docs/` ni se commitea**: se guarda en `<flowPath>` = `C:\Users\xavie\Documents\Repositories\personal\cosmere-api\Resources\pdfextract\mistborn_flow.txt` (misma carpeta ignorada por git **y, desde T00b, por Docker**, junto a `ch3_chars.txt`) y las tareas lo reciben como parámetro `<flowPath>`, igual que `<pdfPath>`; T00a añade además a `cosmere-web/.gitignore` las líneas `docs/nacidos-de-la-bruma/fuentes/*.txt` (por si alguien deja ahí el texto) y `docs/nacidos-de-la-bruma/entorno-pruebas.md`, y `docs` a `cosmere-web/.dockerignore`; T00b crea `cosmere-api/.dockerignore`. En `docs/nacidos-de-la-bruma/` van los diez informes `.md`, `fuentes/pg.sh`, las tres propuestas, la bitácora (`bitacora-ejecucion.md`, la crea y actualiza el orquestador), el anexo **obligatorio** `seed-mistborn.sql` (T00a) y la medida de referencia del bundle `bundle-referencia.txt` (T16): texto propio con citas breves, SQL del seed y una lista de tamaños; y, sin seguimiento ni commit, `entorno-pruebas.md` (credenciales locales que genera el orquestador, §1 «Protocolo de ejecución», punto 2). En este documento, «informe de X §n» se lee como `docs/nacidos-de-la-bruma/<fichero>.md §n` (alomancia = 08, feruquimia = 09, catálogo = 07, reglas base = 06, UI = 03, talentos web = 05, API = 04). **Prevalencia:** donde un anexo o una propuesta contradiga este documento (era editable, «entre eras», `PATCH settings`, picker abierto al jugador, nombres de clase antiguos, y el vocabulario anterior «set de reglas», con los nombres de interfaz y de clase que las propuestas daban al discriminador, en lugar de mundo / `World` / `IWorldRules`), manda este documento (§14). |
| PDF del manual Nacidos de la Bruma | `SPA_Mistborn_Handbook.pdf` (416 páginas; PDF = L.+6). **No está en ningún repo**: `cosmere-api/Resources/CaminaPiedras/` solo contiene PDFs de Archivo de las Tormentas (ART0001, ARTO002, ARTO007, ARTO008 y la hoja de personaje). **Ruta canónica, única y absoluta** (`<pdfPath>`): `C:\Users\xavie\Downloads\Español\SPA_Mistborn_Handbook.pdf` (en la misma carpeta están `SPA_Mistborn_World_Guide.pdf`, 296 páginas; `SPA_NacidosBruma_Legado.pdf`, 270 páginas, aventura que cruza las dos eras; y `SPA_Welcome_to_Scadrial.pdf`). No se copia a ningún repo ni worktree: las rutas relativas no resuelven desde los worktrees hermanos y las carpetas ignoradas por git no existen en ellos (§1 «Protocolo de ejecución», punto 2). Las tareas T16, T25b, T38-1, T38-2, T38b, T40, T45 y T47 lo reciben como parámetro `<pdfPath>`; si falta, **nadie se detiene ni pregunta**: se aplica el respaldo determinista de §1 «Protocolo de ejecución», punto 2 (`<rendersPath>` → `<flowPath>` con marca `[inferido]` y nota en la bitácora). El texto extraído (`mistborn_flow.txt`, una página por `\f`, PDF = L.+6) vive en `<flowPath>` = `C:\Users\xavie\Documents\Repositories\personal\cosmere-api\Resources\pdfextract\mistborn_flow.txt` (carpeta ignorada por git) y lo leen T17-T22, T38-1, T38-2 y T40 con `pg.sh`. |
| Convenciones | Código: `archivo:línea` (rutas relativas a cada repo; el WIP mueve líneas en `CharacterService.cs`, `TalentosReglas.cs`, `CharacterResponse.cs`, `CharacterDetailPage.tsx` y `types/index.ts`, por lo que las tareas anclan además por texto). Manual: «L.<libro> / PDF <pdf>». **[inferido]** = deducción no verificada en código ni en libro. Términos de juego en español tal como los escribe el libro. Rutas de entrada (`<pdfPath>`, `<flowPath>`, `<rendersPath>`, anexos, esta especificación y la herramienta `pdf_image_extractor`): siempre **absolutas** del árbol principal (§1 «Protocolo de ejecución», punto 2); en Git Bash se escriben `/c/Users/xavie/...`. Consultas a la BD local: `docker exec cosmere-postgres-local psql -U jira -d cosmere -c "<SQL>"` (no hay `psql` en el PATH). |

## 1. Resumen ejecutivo y principios de diseño

1. Hoy ninguno de los dos repos tiene noción de ambientación: `CampaignEntity` no tiene campo de mundo
   (`Messages/Database/Entities/CampaignEntity.cs:3-17`), la campaña se crea con un único `Name`
   (`Messages/Campaigns/In/CreateCampaignRequest.cs:3-6`, `CampaignListPage.tsx:131-138`) y todo el contenido de juego es
   Stormlight.
2. El motor numérico de Nacidos de la Bruma es **idéntico** al de Tormentas: salud (L.29 / PDF 35), concentración 2+Voluntad y
   defensas 10+atributo+atributo (L.26 / PDF 32), Investidura 2+máx(DIS, PRE) (L.57 / PDF 63), movimiento (L.51 / PDF 57), rango.
   Cambian **quién tiene Investidura** (hoy `CaminoRadiante != ""`, `CharacterService.cs:239` y `TalentosReglas.cs:218`) y un
   bloque nuevo de derivados de artes metálicas (límite / dado / alcance / cargas, L.163 / PDF 169).
3. La campaña gana `World` (`'stormlight'` por defecto para todo lo existente, inmutable) y `Era` (`era1 | era2`, obligatoria
   en `mistborn`, `null` en Stormlight, fijada al crear la campaña e inmutable como el mundo; decisión de Xavi, 4 de octubre de
   2026).
4. El servidor gana `IWorldRules` con dos implementaciones registradas en `Bootstrap.cs` y un `WorldRulesProvider` con respaldo en
   Stormlight: `StormlightRules` **envuelve** el código actual (incluido el WIP de formas de cantor) sin reescribirlo;
   `MistbornRules` añade validación, condición de Investidura, Resistencia koloss, Bendiciones kandra como bonos de atributo, y
   `DerivadosSet` (un `Dictionary<string, StatDesglose>` que reutiliza el desglose de las ocho estadísticas actuales).
5. El personaje gana cinco columnas aditivas: `CaminoMetal` (text), `CaminoInicial` (text: `''`, `'heroico'` o `'metal'`; Q7),
   `Poderes` (text JSON con lista tipada `PoderPersonaje`, mismo patrón de persistencia que `Talentos`), `Recursos` (text JSON
   clave→decimal: Investidura actual, cuentas de atium, arquillas) y `Bendiciones` (`text[]`, patrón de `Weapons`). Las columnas
   Stormlight se conservan y se ignoran en Nacidos de la Bruma.
6. El estado de mesa (Investidura actual, cargas, viales, Desprovisto) **se persiste en servidor** desde el principio y se
   modifica con `PATCH …/recursos` parcial y dos acciones de dominio (`beber-vial`, `inicio-escena`) que aplican la regla del
   libro en un solo sitio. Nada en `localStorage`.
7. En el frontend, `src/worlds/` expone por mundo una **configuración ligera y síncrona** (`WorldConfig`: capacidades,
   etiquetas, tabla de habilidades, moneda, tablas de carga, temas de enciclopedia, tema visual, iconos) y una **carga de datos
   pesada y perezosa** (`WorldData`: talentos, poderes, overlays) con `import()`. Los componentes preguntan a la configuración,
   nunca `world === 'mistborn'`.
8. Los datos estáticos de Nacidos de la Bruma viven en `src/data/mistborn/`; los ficheros Stormlight de `src/data/*.ts` no se
   mueven ni renombran (ningún import existente cambia).
9. `aventuras.ts` y `combatRules.ts` acaban siendo **base neutra del universo Cosmere** con un overlay por mundo (añadir /
   quitar / sustituir por nombre). En dos pasos (Q12, decisión de Xavi): T23 crea el resolver y el overlay de Nacidos de la
   Bruma sobre la base intacta (`resolveAventuras('stormlight')` devuelve los arrays actuales por identidad); T23b neutraliza
   los ≈25 fragmentos de Roshar de la base y los reinyecta con un overlay Stormlight, con la garantía de que los arrays
   resueltos para `stormlight` son idénticos (comparación JSON) a los anteriores: la campaña Stormlight no cambia ni un texto.
10. El motor de talentos (`talentGraph.ts`) se parametriza con un `TalentRules` opcional cuyo valor por defecto es
    Stormlight; gana cuatro cláusulas aditivas de prerrequisito (`poder`, `atributo`, `skillAny`, `ancestry` genérica) que ningún
    prerrequisito Stormlight usa.
11. El tema se cambia con `data-world` en `<html>` que redefine tokens; sin atributo, los tokens actuales no se tocan. Catálogo
    y PNJ globales ganan una columna `World` con filtro por campaña; el seed de Nacidos de la Bruma es una migración aditiva sin
    `DELETE`.
12. Plan en 8 fases (F0-F7) y 65 tareas (T00-T50, con T00 partida en a/b (web/API), T06 en a/b/c, T32b y T38 en -1/-2, T24,
    T32, T34, T37, T39, T42 y T49 partidas en a/b, T48 retirada y tres tareas añadidas el 4 de octubre de 2026: T23b (base
    neutra Cosmere + overlay Stormlight, Q12), T25b y T38b (revisión visual con imágenes de los datos `[inferido]` y de la
    geometría de los árboles, Q11/Q18)); tras cada fase **F0-F6** la app compila, migra sola al arrancar (`API/Program.cs:93-94`)
    y la campaña Stormlight se ve idéntica; F7 cambia a propósito etiquetas y tiradas Stormlight (T50, Q3/Q22). F1 ya permite
    crear campañas «Bruma». El orden operativo por lotes y el protocolo del orquestador están en §1
    «Protocolo de ejecución» y §10.
13. Sin tests en ningún repo: la red de seguridad es una captura JSON de referencia de personajes Stormlight antes de tocar el
    motor (T02), la comparación byte a byte después (T10) y una prueba de humo de `parsePrereq` antes de ampliar la gramática
    (T03).
14. El WIP de formas de cantor es la **línea base**: parámetros nuevos al final de las firmas y propiedades nuevas al final de
    las clases (desde T10, `reglas` y `tieneInvestidura` son obligatorios en `Calcular` y `BuildInvLineas`, sin respaldo a
    `CaminoRadiante` en el núcleo, §6.2/§6.5); está commiteado en la rama de integración desde T01 (4 de octubre de 2026).
15. Correcciones respecto a las propuestas originales, tal como pidieron los jueces: estado de mesa en servidor (no
    `localStorage`); `Derivar` con Portentoso, Guardián del conocimiento, Componedor, mentes a la vez y clavos; `TieneInvestidura`
    con clavo y aleación de lerasium (el libro da Investidura con cualquier clavo que otorgue un poder alomántico o feruquímico,
    L.290 / PDF 296; v1 solo con `Arte == "alomancia"` [inferido: la feruquimia no usa Investidura, L.131 / PDF 137] → Q19);
    Bendiciones como dato estructurado (nunca marcador `~bendicion~`, que `talentBudget` contaría como talento); era como texto
    (`era1`/`era2`); `CreateWeaponRequest.CampaignId` anulable; configuración ligera separada de datos perezosos;
    etiquetas Stormlight fuera de la fase «idéntica» (T50) y neutralización de la base solo con overlay Stormlight verificado
    por igualdad JSON (T23b); meta de nacido del metal que marca el poder completo en servidor; lista tipada `PoderPersonaje`
    con validación de duplicados.

**Principios.** (P1) Nada de Stormlight cambia de comportamiento, texto ni validación sin una tarea explícita que lo diga. (P2)
Todo cambio de contrato es aditivo y con valor por defecto; las propiedades nuevas de `UpdateCharacterRequest` son anulables
(`null` = conservar). (P3) Cada fase es desplegable y **reversible en producción redesplegando la imagen anterior**: las
migraciones son aditivas con DEFAULT de BD, así que la imagen anterior sigue leyendo y escribiendo sin conocer las columnas
nuevas, y `Migrate()` ignora las migraciones aplicadas que no conoce; la única excepción es el seed M4 (F6), cuyas filas
`mistborn` la imagen anterior no sabe filtrar y que exige el `DELETE` manual descrito en §4.3 «Rollback de F6»; `Down` solo se usa
en desarrollo (la imagen de runtime `mcr.microsoft.com/dotnet/aspnet:8.0`, `cosmere-api/Dockerfile:23`, no lleva `dotnet ef`).
(P4) Datos antes que ramas: los componentes consultan `WorldConfig`, el servidor consulta `IWorldRules`. (P5) Duplicar datos es
aceptable, duplicar lógica de cálculo no: una tabla de progresión en C# y su espejo en TS, nada más. (P6) El servidor manda en lo
que valida (identidad, ids de metal, claves de recursos); el cliente aconseja en lo demás (presupuestos, prerrequisitos, era),
como hoy. (P7) Nunca se renombra un identificador de dominio existente; ids nuevos en ASCII sin tildes (`estano`,
`nacido-de-la-bruma`). (P8) **Lo compartido es Cosmere y vive en el núcleo; lo específico pertenece a un mundo y se resuelve a
través de la campaña (mundo + era). Ante cualquier duda de diseño o implementación se aplica esta regla sin preguntar**
(decisión de Xavi, 4 de octubre de 2026). En la práctica: fórmulas, dado de trama, caminos heroicos, combate, aventuras,
motor de talentos y componentes son Cosmere (`src/data/*.ts`, `src/lib/`, `components/ui.tsx`, `TalentosReglas.cs`); artes
metálicas, órdenes radiantes, ascendencias, catálogo, PNJ, tema e iconos son del mundo y se leen a través de la campaña
(`useWorldConfig()`, `IWorldRules`), nunca por una columna del personaje.

### Cómo usar este documento con agentes

- **Leer siempre** las secciones 2 a 8 antes de ejecutar cualquier tarea: fijan nombres, columnas, contratos, fórmulas y
  componentes. La sección 9 describe cada tarea de forma autosuficiente **junto con** esas secciones; no hace falta leer las otras
  tareas salvo las que figuran en «depende de».
- **Asignar una tarea**: comprobar en la tabla índice de §9 que sus dependencias están cerradas (fusionadas en la rama de
  integración `nacidos-de-la-bruma`); pasar al agente, con la plantilla de §1 «Protocolo», punto 4, el id, la sección 9 completa
  de esa tarea y las secciones 2-8; indicarle el repositorio (`cosmere-api` o `cosmere-web`), su worktree y que solo toque los
  archivos listados (si necesita otro, lo anota en el resultado).
- **Al terminar** (en el worktree de la tarea): web `npx tsc -b && npm run lint` (nunca `npx tsc --noEmit`); API `dotnet build`;
  migraciones **con la API de ese worktree parada** (definición en §1 «Protocolo», punto 2):
  `dotnet ef migrations add <Nombre> --project Infrastructure --startup-project API` y
  `dotnet ef database update --project Infrastructure --startup-project API`; revisar el `Up` generado contra §4.3 antes de
  aplicar; ejecutar los criterios de aceptación de la tarea; en tareas de API que tocan `CharacterService`, comparar los JSON de
  T02 con el comparador de §1 «Protocolo», punto 5.
- **Regla del WIP**: el WIP de formas de cantor de Xavi (API: `Messages/Characters/Out/CharacterResponse.cs`,
  `Services/Characters/CharacterService.cs`, `Services/Characters/TalentosReglas.cs` y `Services/Characters/FormasCantor.cs`; web:
  `src/pages/characters/CharacterDetailPage.tsx` y `src/types/index.ts`) está incluido en la rama de integración desde T01
  (commits `5083960` y `4dc6dfd`, 4 de octubre de 2026, decisión de Xavi) y es la **línea base** de todo el plan: nada espera a
  Xavi. Sigue además sin commitear en sus árboles principales, que **ni el orquestador ni los agentes tocan** (única excepción:
  la copia canónica de documentos, `<docsPath>`, §1 «Protocolo», punto 2) y donde nadie hace commits; Xavi descarta esa copia
  antes de la fusión final en `main` (§1 «Protocolo», punto 1). Sobre esos seis ficheros, solo cambios aditivos descritos en §6.2
  y §6.5: las
  tareas que los editan anclan por texto (las líneas citadas son las del WIP) y cualquier edición de `Character`,
  `CreateCharacterRequest` o `UpdateCharacterRequest` (T15) conserva `'desvioCalculado'` en el `Omit`. El WIP no toca entidades,
  así que las migraciones generadas en la rama de integración son válidas para `main`.
- **Datos del libro**: cada fila reconstruida de texto desordenado lleva `// [inferido]`; cada errata detectada lleva `notaLibro`.
  La revisión visual de esas filas la hacen dos tareas de agente con imágenes del manual: T25b (F3, datos) y T38b (F5,
  geometría de los árboles); no es una revisión de Xavi.
- **Decisiones**: §12 está cerrado (todas las preguntas tienen decisión). Si una tarea tropieza con una duda no prevista, se
  aplica P8, se anota en el informe de la tarea y en la bitácora (§1 «Protocolo de ejecución», punto 8); no se pregunta a
  mitad de tarea.

### Protocolo de ejecución (orquestador Opus 5.5)

El orquestador ejecuta el plan completo (F0-F7, 65 tareas) sin intervención humana hasta la puerta final del punto 1. Todo lo
que no esté escrito aquí o en §2-§10 se decide con P8 y con las decisiones de §12 y se deja anotado en la bitácora. Los comandos
`git` de este protocolo se ejecutan desde `C:\Users\xavie\Documents\Repositories\personal` (la carpeta no es un repo git) con
`git -C <carpeta>`.

1. **Puerta humana (una sola, al final).** Xavi valida y sube: fusiona `nacidos-de-la-bruma` en `main` en los dos repos y
   despliega con `deploy.sh`, que **solo ejecuta Xavi** (pide la contraseña SSH con `read -s -p`, `deploy.sh:28`, y usa
   `sshpass`, `:91-98`, que no existe en Git Bash). Antes de fusionar descarta en sus árboles principales el WIP sin commitear,
   idéntico al commit de T01 (si lo cambió después del 4 de octubre de 2026, antes lleva esos cambios a la rama de integración),
   y el `docs/` sin seguimiento (tras la sincronización final del orquestador es la misma copia que la rama, punto 2
   «Documentos»):
   - API:
     `git -C cosmere-api checkout -- Messages/Characters/Out/CharacterResponse.cs Services/Characters/CharacterService.cs Services/Characters/TalentosReglas.cs`
     y borrar `cosmere-api/Services/Characters/FormasCantor.cs` (sin seguimiento);
   - web: `git -C cosmere-web checkout -- src/pages/characters/CharacterDetailPage.tsx src/types/index.ts` y borrar
     `cosmere-web/docs/` (sin seguimiento).

   Dentro de la misma puerta van las comprobaciones y el SQL en la BD de **producción** (contenedor `cosmere-postgres`,
   `docker-compose.yml:6`): la consulta de T12 (y su `UPDATE` de limpieza si devuelve filas), la consulta de `MAX("Id")` e ids de
   opciones de T40 (si falla, Xavi se lo indica al orquestador, que abre la tarea de seguimiento `T40-s1`: renumera a 2001+ los
   ids del seed y regenera M4, §9 T40) y el procedimiento de §4.3 (`pg_dump`, imagen `:prev`, `docker compose logs api`). El plan
   asume **un único despliegue final**; un despliegue intermedio al cerrar una fase es opcional y sigue el mismo procedimiento
   sobre la etiqueta `nb-f<N>` de esa fase (punto 7), con las comprobaciones de producción de las fases que incluya. En la BD
   local (contenedor `cosmere-postgres-local`) esas comprobaciones y correcciones las ejecuta el agente de la tarea **sin
   preguntar**. Todo lo demás (dudas de reglas, de datos, de diseño o de implementación, PDF ausente, discrepancias con el código)
   se decide con P8, §12 y los respaldos de este protocolo, sin preguntar, y se anota. El orquestador no espera a Xavi en ningún
   punto del plan: solo se detiene con un informe si una `Txx-s1` falla (punto 5) y al cerrar F7, con el informe final para la
   puerta humana.
2. **Preparación (antes de F0).**
   - **Repos y worktrees.** `git status` en los árboles principales `cosmere-api` y `cosmere-web` para conocer el WIP de Xavi,
     que no se toca (en web figuran además los sin seguimiento `.claude/`, `CLAUDE.md` y `docs/`). Rama de integración
     `nacidos-de-la-bruma` en cada repo, en los worktrees `C:\Users\xavie\Documents\Repositories\personal\cosmere-api-nb` y
     `C:\Users\xavie\Documents\Repositories\personal\cosmere-web-nb`, creados desde `main` el 4 de octubre de 2026 (si faltan:
     `git -C cosmere-api worktree add ../cosmere-api-nb -b nacidos-de-la-bruma main`, ídem web); su primer commit es T01 (el WIP
     de formas de cantor). Primer paso en `cosmere-web-nb`: `npm ci` (`node_modules` está en `.gitignore:10` y el worktree nace
     sin `tsc`, `eslint` ni `vite`; `npx tsc` descargaría un paquete `tsc` ajeno); en `cosmere-api-nb`, `dotnet build` (restaura
     solo).
   - **Herramientas.** `dotnet tool list -g` debe listar `dotnet-ef` con **versión mayor ≥ 8** (hoy 10.0.5, con los SDK 8.0.417 y
     10.0.302; `Infrastructure/Infrastructure.csproj:8-12` fija EF 8.0.11 y la herramienta 10.x genera migraciones válidas para
     ese paquete; si falta, `dotnet tool install -g dotnet-ef`). Node 22 y npm 10. Python 3.13 con PyMuPDF y fontTools ya
     instalados (script de T45 y renders a 200 DPI en el scratchpad). No hay `jq` (se usa el comparador `node -e` del punto 5) ni
     `psql` en el PATH.
   - **Base de datos.** PostgreSQL local = el contenedor Docker **`cosmere-postgres-local`** (`postgres:16-alpine`, puerto 5432,
     usuario `jira`, BD `cosmere`, `API/appsettings.json:10`), arrancado (`docker ps`). **Toda consulta local** de esta
     especificación (T04, T11, T12, T39a, T40, T42a, T49a, §4.1, §4.3) se ejecuta con
     `docker exec cosmere-postgres-local psql -U jira -d cosmere -c "<SQL>"`; en producción, `sudo docker exec cosmere-postgres …`
     (§4.3), solo Xavi. Las migraciones se generan y aplican **desde el worktree de la tarea** contra esta BD compartida: son
     columnas aditivas con DEFAULT, así que la API de previsualización en marcha sigue funcionando (P3). «API parada», en esta
     especificación, significa que ningún proceso ejecuta la API desde el árbol donde corre `dotnet ef` (el worktree de la tarea,
     que compila en su propio `bin/`); `nb-api` no se para para generar una migración. Si una tarea que aplicó una migración no
     llega a fusionarse, su agente (o el de `Txx-s1`) revierte antes la BD local desde el mismo worktree con
     `dotnet ef database update <migración anterior> --project Infrastructure --startup-project API`.
   - **Entorno de previsualización.** `C:\Users\xavie\Documents\Repositories\personal\cosmere-web\.claude\launch.json` contiene,
     junto a `cosmere-web` y `cosmere-api` (árboles principales; no se usan durante la ejecución porque ocupan los mismos
     puertos), las configuraciones `nb-api`
     (`dotnet run --project C:/Users/xavie/Documents/Repositories/personal/cosmere-api-nb/API --launch-profile http`,
     puerto 5200; perfil `http` de `API/Properties/launchSettings.json:12-21`, `http://localhost:5200`,
     `ASPNETCORE_ENVIRONMENT=Development`) y `nb-web`
     (`npm --prefix C:/Users/xavie/Documents/Repositories/personal/cosmere-web-nb run dev`,
     puerto 5173; el proxy de Vite envía `/api` y `/hubs` a la 5200); si faltan, el orquestador las añade. Las arranca con la
     herramienta de previsualización (por nombre) y **reinicia `nb-api` tras cada tarea de API fusionada** (`Migrate()` aplica al
     arrancar las migraciones que la BD no tenga, `API/Program.cs:93-94`); las tareas web que trabajan directamente en
     `cosmere-web-nb` se ven en vivo con HMR.
   - **Rutas de entrada, siempre absolutas** (los worktrees son carpetas hermanas y las carpetas ignoradas por git no existen en
     ellos; en Git Bash se escriben `/c/Users/xavie/...`):
     - `<pdfPath>` = `C:\Users\xavie\Downloads\Español\SPA_Mistborn_Handbook.pdf` (no se copia a ningún repo);
     - `<flowPath>` = `C:\Users\xavie\Documents\Repositories\personal\cosmere-api\Resources\pdfextract\mistborn_flow.txt`;
     - `<rendersPath>` = `C:\Users\xavie\Documents\Repositories\personal\cosmere-api\Resources\pdfextract\renders\` (la crea
       T00b; carpeta del árbol principal ignorada por git, que no ensucia el árbol de Xavi);
     - `<docsPath>` = copia canónica de la especificación, los anexos, la bitácora y `entorno-pruebas.md`:
       `C:\Users\xavie\Documents\Repositories\personal\cosmere-web\docs\` (el `docs/` sin seguimiento del árbol principal; ver
       «Documentos»); `<docsPathBash>` = la misma ruta en formato Git Bash (`/c/Users/xavie/...`);
     - anexos = `<docsPath>\nacidos-de-la-bruma\`; esta especificación =
       `<docsPath>\propuesta-set-de-reglas-nacidos-de-la-bruma.md`;
     - `<herramienta>` = `C:\Users\xavie\Documents\Repositories\personal\cosmere-api\Resources\Parts\pdf_image_extractor`
       (`dotnet run --project "<herramienta>" -- "<pdfPath>" "<outputDir>" <páginas>`; 96 DPI fijos, `Program.cs:31`; salida
       `map_p<N>.png`; si una página no se lee, se renderiza a 200 DPI en el scratchpad con
       `python -c "import pymupdf; d=pymupdf.open(r'<pdfPath>'); d[<página PDF - 1>].get_pixmap(dpi=200).save(r'<outputDir>\p<página PDF>.png')"`;
       nunca se edita la herramienta);
     - `<scratchpad>` = directorio temporal de la sesión del agente; `<outputDir>` = `<scratchpad>\<id>`.
   - **Respaldo determinista si falta una entrada** (ninguna tarea se detiene ni pregunta por ello): si `<pdfPath>` no existe, la
     tarea usa las páginas que haya en `<rendersPath>`; para las que falten, o si `<rendersPath>` tampoco existe, usa
     `<flowPath>`, marca `// [inferido]` cada dato que no haya podido ver en imagen y lo anota en su informe (el orquestador lo
     copia a la bitácora). Tareas afectadas: T16, T25b, T38-1, T38-2, T38b, T40, T45 (sin PDF no extrae glifos: deja los Lucide
     provisionales y el orquestador abre `T45-s1` en la bitácora) y T47.
   - **Documentos.** Los agentes leen `<docsPath>` por ruta absoluta (plantilla del punto 4) y solo escriben en él lo que su tarea
     diga (`seed-mistborn.sql` en T00a, `bundle-referencia.txt` en T16, ids en `entorno-pruebas.md` en T02 y T05). La bitácora
     `<docsPath>\nacidos-de-la-bruma\bitacora-ejecucion.md` la crea el orquestador en esta preparación, con la cabecera de tabla
     `| Fecha | Tarea | Agente (modelo) | Rama/worktree | Commit | Resultado | Dudas resueltas con P8 | Discrepancias código/especificación | Seguimiento |`,
     y la actualiza él (punto 8); no viaja en el commit de ninguna tarea ni entra en el chequeo `git status --porcelain` del
     punto 6. **Sincronización**: T00a copia la primera vez `<docsPath>\nacidos-de-la-bruma\`, la especificación y
     `<docsPath>\auditoria-reglas-2026-10-03.md` a `cosmere-web-nb\docs\` y los commitea en la rama de integración; el
     orquestador repite esa copia y su commit (`git -C cosmere-web-nb add docs`, mensaje `Docs: sincronización fin de F<N>`) al
     cerrar cada fase (punto 7) y antes de la puerta final. `entorno-pruebas.md` viaja en la copia, pero `.gitignore` lo excluye
     desde T00a: `git -C cosmere-web-nb status --porcelain docs` nunca debe listarlo. Si Xavi hace un despliegue intermedio
     (opcional, punto 1), desde esa primera fusión `<docsPath>` pasa a ser `cosmere-web-nb\docs\` (el `docs/` del árbol principal
     queda versionado en `main` y escribir en él ensuciaría el árbol de Xavi).
   - **Usuario y datos de prueba para los criterios HTTP** (T02, T05, T10-T14, T39b, T42a, T49a). El orquestador genera en esta
     preparación dos usuarios locales (director y jugador), con nombre en minúsculas y contraseña aleatoria
     (`node -e "console.log(require('crypto').randomBytes(12).toString('hex'))"`), y los guarda en
     `<docsPath>\nacidos-de-la-bruma\entorno-pruebas.md`, **sin seguimiento y nunca en el chat, en informes, en la bitácora ni en
     commits**. El fichero se carga con `.` desde Git Bash, así que solo contiene comentarios `# …` y líneas `CLAVE=valor` sin
     espacios: `NB_GM_USER`, `NB_GM_PASS`, `NB_JUGADOR_USER`, `NB_JUGADOR_PASS`, `NB_JUGADOR_ID`; T02 añade `NB_CID_STORMLIGHT` y
     `NB_CHARS="<id1> <id2> <id3> <id4> <id5>"`, y T05, `NB_CID_ERA1` y `NB_CID_ERA2`. Registro (`AuthController.cs:13-16`;
     `RegisterRequest`: `username`, `password` y `displayName`, obligatorios; responde `LoginResponse`; el nombre se guarda en
     minúsculas, `AuthService.cs:16,22`, y repetirlo da 409 «Username already taken.»: entonces basta con el login):
     `. "<docsPathBash>/nacidos-de-la-bruma/entorno-pruebas.md"; curl -s -X POST http://localhost:5200/auth/register -H "Content-Type: application/json" -d "{\"username\":\"$NB_GM_USER\",\"password\":\"$NB_GM_PASS\",\"displayName\":\"Director NB\"}"`
     (ídem el jugador). Token (`AuthController.cs:18-21`; `LoginResponse.Token` y `User.Id`,
     `Messages/Auth/Out/LoginResponse.cs:5-6, 11`;
     credenciales erróneas → 404 «Invalid username or password.», `AuthService.cs:36-40`):
     `TOKEN_GM=$(curl -s -X POST http://localhost:5200/auth/login -H "Content-Type: application/json" -d "{\"username\":\"$NB_GM_USER\",\"password\":\"$NB_GM_PASS\"}" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).token))")`
     e ídem `TOKEN_JUGADOR`; `NB_JUGADOR_ID` es el `user.id` de la respuesta del jugador. Cada petición lleva
     `-H "Authorization: Bearer $TOKEN_GM"`; los tokens valen igual contra `nb-api` (5200) y contra la API de una tarea en su
     puerto (punto 3), porque comparten BD y clave de firma (`API/appsettings.json`). La campaña de regresión, los personajes
     sintéticos y la captura de los JSON de referencia están en T02.
3. **Rama de integración, worktrees de tarea y lotes.** Una sola rama de integración por repo, `nacidos-de-la-bruma`, en los
   worktrees `cosmere-api-nb` y `cosmere-web-nb` (punto 2); el orquestador **nunca** hace commits en `main` ni toca los árboles
   principales (salvo `<docsPath>`). Dónde trabaja cada tarea (`<id>` en minúsculas en carpetas y ramas: `t17`, `t38-1`,
   `t32b-2`):
   - **Tarea web sin otra tarea web en curso** (de su lote o de la fase que corre en paralelo): directamente en `cosmere-web-nb`,
     sobre `nacidos-de-la-bruma` (la previsualización `nb-web` la muestra en vivo con HMR).
   - **Tareas web en paralelo**: cada una en su worktree de tarea
     `C:\Users\xavie\Documents\Repositories\personal\cosmere-web-nb-<id>`,
     rama `nb-<id>` creada desde la punta de la rama de integración
     (`git -C cosmere-web-nb worktree add ../cosmere-web-nb-<id> -b nb-<id> nacidos-de-la-bruma`); paso 0: `npm ci` en el
     worktree nuevo.
   - **Tareas de API: siempre** en worktree de tarea `C:\Users\xavie\Documents\Repositories\personal\cosmere-api-nb-<id>`, rama
     `nb-<id>` desde la punta de la rama de integración
     (`git -C cosmere-api-nb worktree add ../cosmere-api-nb-<id> -b nb-<id> nacidos-de-la-bruma`;
     basta `dotnet build`), porque `nb-api` corre desde `cosmere-api-nb` y en Windows bloquea las DLL de su `bin/`.
   - **API y web propias de una tarea.** Si una tarea de API necesita la API para sus criterios, el agente la arranca en segundo
     plano desde su worktree en un puerto propio
     (`dotnet run --project API --launch-profile http --urls http://localhost:<puertoApi>`;
     `<puertoApi>` = 5201, 5202… uno por tarea de API en curso, lo asigna el orquestador) y la para al terminar; `nb-api` sigue
     en la 5200. Igual en web, si una tarea en worktree de tarea necesita ver la app: `npm run dev -- --port <puertoWeb>` (5174,
     5175…).
   - **T02 y T03 no modifican ningún repositorio**: T02 trabaja contra `nb-api`; T03 ejecuta su script desde `cosmere-web-nb`.

   Dentro de una fase, los lotes son secuenciales y las tareas de un mismo lote se ejecutan en paralelo, **un agente por tarea**;
   un lote empieza cuando todas las tareas del anterior están fusionadas en `nacidos-de-la-bruma`. Cada fase empieza cuando la
   anterior ha pasado su revisión de fin de fase (punto 7), salvo F3, que corre en paralelo con F2 (las dos empiezan al cerrar
   F1); F4 espera a F2 y F3. Los «ficheros punto de encuentro» (`src/worlds/mistborn.data.ts`, `src/worlds/stormlight.data.ts`,
   `src/worlds/types.ts`, `src/worlds/mistborn.ts`, `src/data/mistborn/index.ts`, `src/components/mistborn/index.ts`, `App.tsx`,
   `src/types/index.ts`) se editan **añadiendo líneas, nunca reordenando**, para que la fusión sea limpia. Lotes:
   - F0: lote 1: T00a ∥ T00b ∥ T02 ∥ T03 (T01 ya está hecho: es el primer commit de la rama de integración).
   - F1: lote 1: T04; lote 2: T05; lote 3: T06a; lote 4: T06b; lote 5: T06c ∥ T07; lote 6: T08 ∥ T09.
   - F2: lote 1: T10; lote 2: T11; lote 3: T12; lote 4: T13 ∥ T14; lote 5: T15.
   - F3 (en paralelo con F2): lote 1: T16; lote 2: T17 ∥ T18 ∥ T19 ∥ T20 ∥ T21 ∥ T22 ∥ T23; lote 3: T23b ∥ T24a ∥ T25 ∥
     T25b; lote 4: T24b.
   - F4: lote 1: T26 ∥ T32b-1 ∥ T38-1; lote 2: T27 ∥ T32b-2; lote 3: T28; lote 4: T29; lote 5: T30 ∥ T32a; lote 6: T31 ∥ T33.
   - F5: lote 1: T34a ∥ T38-2; lote 2: T34b ∥ T35; lote 3: T36 ∥ T38b; lote 4: T37a ∥ T37b.
   - F6: lote 1: T39a ∥ T43 ∥ T44 ∥ T45 (solo T39a genera migración, M3); lote 2: T39b ∥ T42a ∥ T46 (solo T42a genera
     migración, M5); lote 3: T40 ∥ T42b (T40 genera M4 sobre la rama que ya contiene M3 y M5: orden obligatorio
     T39a → T42a → T40, §4.3; nunca dos `migrations add` a la vez); lote 4: T41.
   - F7: lote 1: T47 ∥ T49a ∥ T50 (solo T49a genera migración, M6); lote 2: T49b.

   Cada agente de tarea recibe la plantilla del punto 4 con todos los huecos resueltos (sin marcadores) y se lanza con el modelo
   del punto 10.
4. **Plantilla de prompt del agente de tarea** (texto literal). Huecos y cómo se rellenan: `<id>` = id de la tarea tal como
   figura en §9 (p. ej. `T17`); `<modelo>` = `haiku`, `sonnet` u `opus` según el punto 10 (se pasa además como parámetro `model`
   al lanzar el agente); `<repo>` = `cosmere-api` o `cosmere-web`; `<rutas>` = ruta absoluta del worktree donde trabaja la tarea
   y nombre de su rama (p. ej. `C:\Users\xavie\Documents\Repositories\personal\cosmere-web-nb-t17`, rama `nb-t17`; o
   `C:\Users\xavie\Documents\Repositories\personal\cosmere-web-nb`, rama `nacidos-de-la-bruma`); `<puertos>` = `<puertoApi>` y,
   si procede, `<puertoWeb>` del punto 3, o «ninguno»; `<pdfPath>`, `<flowPath>`, `<rendersPath>` = las rutas absolutas del punto
   2, o la palabra `AUSENTE` si no existen (entonces el agente aplica el respaldo determinista); `<docsPath>` y `<docsPathBash>` =
   los del punto 2; `<scratchpad>` = directorio temporal de la sesión del agente; `<outputDir>` = `<scratchpad>\<id>`;
   `<texto de la tarea>` = el bloque íntegro de la tarea en §9, desde su cabecera `**<id> · …**` hasta «Fuera de alcance».

```text
Eres el agente de la tarea <id> de la especificación «Nacidos de la Bruma»
(<docsPath>\propuesta-set-de-reglas-nacidos-de-la-bruma.md). Modelo asignado: <modelo>.
Repositorio: <repo>. Worktree y rama: <rutas>. Puertos propios: <puertos>.
Entradas (solo si la tarea las pide; rutas absolutas): <pdfPath>, <flowPath>, <rendersPath>; anexos en
<docsPath>\nacidos-de-la-bruma\; scratchpad: <scratchpad>; salida de renders: <outputDir>. Si una entrada es AUSENTE:
<pdfPath> → <rendersPath> → <flowPath>, marcando `// [inferido]` lo que no hayas visto en imagen, y anótalo en el informe.
No preguntes por ella. Si la tarea hace peticiones HTTP, carga las credenciales locales con
`. "<docsPathBash>/nacidos-de-la-bruma/entorno-pruebas.md"` y no copies su contenido en ningún informe.

Antes de tocar nada:
0. Si el repositorio es cosmere-web y el worktree no tiene node_modules, ejecuta `npm ci` en él.
1. Lee §2-§8 de la especificación completos y, después, el texto íntegro de la tarea <id> (§9), copiado al final.
2. Lee §1 «Principios» (P1-P8). Ante cualquier duda aplica P8: lo compartido es Cosmere y vive en el núcleo; lo específico
   pertenece a un mundo y se resuelve a través de la campaña (mundo + era). No preguntes: decide con P8 y §12 y anótalo.
3. Comprueba que las dependencias de la tarea están en la rama (`git log --oneline` muestra sus commits `Txx:`).

Reglas:
- Toca solo los archivos listados en la tarea; si necesitas otro, hazlo y decláralo en el informe con el motivo.
- La realidad del código manda sobre la especificación: si difieren (líneas movidas, nombres distintos), ancla por texto,
  conserva el comportamiento descrito y anota la discrepancia en el informe.
- Nada de Stormlight cambia (P1) salvo que la tarea lo diga; cambios aditivos y con valor por defecto (P2, P3).
- Datos del libro: cada fila reconstruida lleva `// [inferido]`; cada errata, `notaLibro`; cita siempre «L.x / PDF y».
- Código interno en inglés para ids, valores e infraestructura; términos de juego y textos visibles en español; sin emojis;
  en el frontend, estilos inline y primitivas de `components/ui.tsx` (DESIGN.md).
- No ejecutes `git commit`, `git merge` ni `deploy.sh` (lo hacen el orquestador o Xavi). Nunca `--no-verify`.
- No toques los árboles principales `cosmere-api` y `cosmere-web` (salvo escribir en <docsPath> lo que tu tarea diga),
  `Resources/pdfextract`, los renders ni el PDF, y no los añadas a git (única excepción: T00b, que copia los renders a
  <rendersPath> sin añadirlos a git).
- Consultas a la BD local: `docker exec cosmere-postgres-local psql -U jira -d cosmere -c "<SQL>"`. No hay `jq`: usa `node -e`.
- «API parada» significa que ninguna API corre desde tu worktree; no pares `nb-api` (puerto 5200). Si arrancas tu API o tu
  servidor de desarrollo en tus puertos propios, páralos al terminar.

Al terminar ejecuta la verificación de la tarea y la puerta de calidad: web `npx tsc -b && npm run lint` (nunca
`npx tsc --noEmit`) y `npm run build` si la tarea mide el bundle; API `dotnet build`, migración con tu API parada y `Up`
revisado contra §4.3, comparación JSON de T02 si tocas `CharacterService` (comparador de §1 «Protocolo», punto 5); y los
criterios de aceptación uno a uno.

Devuelve un informe con exactamente estas secciones:
1. Archivos tocados (ruta y qué cambió, una línea por fichero; marca los que no estaban en la lista de la tarea).
2. Comandos ejecutados y su resultado (última línea relevante de cada uno, literal).
3. Criterios de aceptación, uno a uno: «cumple» / «no cumple», con la evidencia (valor obtenido, consulta, captura).
4. Dudas resueltas con P8: duda → decisión → por qué (y la fila de §12 si ya la cubría).
5. Discrepancias entre el código real y la especificación (archivo:línea citado → lo encontrado).
6. `[inferido]` nuevos y `notaLibro` nuevas (fichero, fila, página).
7. Pendientes que no has podido cerrar, con la causa exacta (o «ninguno»).

Texto de la tarea <id>:
<texto de la tarea>
```

5. **Puerta de calidad por tarea** (la pasa el agente y la repite el orquestador antes de commitear, en el worktree de la
   tarea): web `npx tsc -b && npm run lint` (nunca `npx tsc --noEmit`) y, si la tarea fija un objetivo de bundle,
   `npm run build` comparado con `<docsPath>\nacidos-de-la-bruma\bundle-referencia.txt` (T16); API `dotnet build`; si hay
   migración: API parada (punto 2), `Up` revisado contra §4.3 (toda columna `NOT NULL` nueva con `defaultValue`/`defaultValueSql`
   **presente y con el valor de §4.1**: `""` es el valor correcto en `CaminoMetal` y `CaminoInicial`; `"[]"`, `"{}"` y `'{}'` en
   `Poderes`, `Recursos` y `Bendiciones`; `"stormlight"` en toda columna `World`; `"[]"` en `Clavos`), `dotnet ef database
   update`, consultas de verificación de §4.1 (con `docker exec cosmere-postgres-local psql …`) y `dotnet ef migrations
   has-pending-model-changes` → «No changes…»; si la tarea toca `CharacterService` (T10-T14, T49a), comparación con la referencia
   de T02: los mismos `GET` y el mismo token que T02, contra la API de la tarea, guardados como
   `"$TEMP/cosmere-regresion/despues-<id>-<nombre>.json"` junto a cada `antes-<nombre>.json` (`<nombre>` = `lista`, `<charId>` o
   `<charId>-combate`, T02), y el **comparador inline** (sin `jq`), que borra las propiedades nuevas de la respuesta
   (`caminoMetal`, `caminoInicial`, `poderes`, `recursos`, `bendiciones`, `derivadosSet`, `bonosAtributos` y, desde T49a,
   `clavos`) y la marca `esBono` de cada línea de desglose (§5.1) y compara el resto byte a byte:
   `node -e "const fs=require('fs');const strip=o=>{if(Array.isArray(o))return o.map(strip);if(o&&typeof o==='object'){const r={};for(const[k,v]of Object.entries(o)){if(['caminoMetal','caminoInicial','poderes','recursos','bendiciones','derivadosSet','bonosAtributos','clavos','esBono'].includes(k))continue;r[k]=strip(v)}return r}return o};const[a,b]=process.argv.slice(1).map(p=>JSON.stringify(strip(JSON.parse(fs.readFileSync(p,'utf8')))));console.log(a===b?'IGUAL':'DIFERENTE');process.exit(a===b?0:1)" "$TEMP/cosmere-regresion/antes-<nombre>.json" "$TEMP/cosmere-regresion/despues-<id>-<nombre>.json"`;
   criterios de aceptación de la tarea, uno a uno. Si algo falla, el mismo agente corrige (se le reenvía el fallo con
   `SendMessage`); si tras dos intentos no puede, el orquestador abre una tarea de seguimiento `Txx-s1` en la bitácora (qué falla,
   qué se intentó) y la ejecuta **un agente nuevo con el modelo `opus`** (punto 10) con el texto de la tarea más la descripción
   del fallo; si `Txx-s1` también falla, el orquestador **se detiene con un informe** (única escalación a Xavi antes de la puerta
   final). **No se avanza de fase** con una `Txx-s1` abierta.
6. **Convención de commits y fusiones.** Un commit por tarea, hecho por el orquestador tras la puerta de calidad, con
   `git add <ficheros de la tarea>` (nunca `git add -A` ni `git add .`); mensaje `Txx: <título de la tarea tal como figura en §9>`
   en español, cuerpo con la lista de criterios de aceptación comprobados y las dudas resueltas con P8; nunca `--no-verify`; nunca
   `commit --amend` sobre un commit ya fusionado; nunca se commitean `Resources/pdfextract/`, los renders, el PDF, `node_modules`,
   `entorno-pruebas.md` ni ficheros del scratchpad. Antes de cada commit, `git status --porcelain` del worktree de la tarea solo
   puede mostrar los ficheros de la tarea (más, en `cosmere-web-nb`, el `docs/` que sincroniza el orquestador). Una tarea que
   trabaja directamente en `cosmere-web-nb` se commitea ahí, sobre `nacidos-de-la-bruma`. Una tarea en worktree de tarea se
   commitea en `nb-<id>` y se fusiona en la rama de integración:
   `git -C cosmere-<repo>-nb merge --no-ff nb-<id> -m "Merge nb-<id>: Txx"`, después
   `git -C cosmere-<repo>-nb worktree remove ../cosmere-<repo>-nb-<id>` y `git -C cosmere-<repo>-nb branch -d nb-<id>`; tras
   fusionar una tarea de API, el orquestador reinicia `nb-api` (punto 2). Si el merge da conflicto en un fichero punto de
   encuentro, el orquestador lo resuelve conservando ambas adiciones (son líneas añadidas, nunca reordenadas) y repite la puerta
   de calidad sobre la rama de integración. T00a se commitea en `cosmere-web-nb` con `git add docs .gitignore .dockerignore`;
   T00b, en `nb-t00b` con `git add .dockerignore`.
7. **Fin de fase.** (a) Revisión cruzada por un agente distinto de los que ejecutaron las tareas (modelo `sonnet`, punto 10),
   con esta lista: §10 «Estado de la app al cerrar la fase» comprobado punto a punto en la previsualización (`nb-api` y `nb-web`
   arrancadas desde la rama de integración ya fusionada); campaña Stormlight idéntica en **F0-F6** (JSON de T02 con el
   comparador del punto 5; capturas antes/después de las pantallas tocadas), **salvo en F7, donde T50 cambia a propósito
   etiquetas y tiradas Stormlight: allí se comprueban los criterios de T50 en lugar de la identidad**; `git status` limpio en los
   worktrees de integración (salvo el `docs/` del orquestador) y `git log` con un commit por tarea (y un merge `--no-ff` por cada
   tarea hecha en worktree de tarea); ningún worktree de tarea ni rama `nb-<id>` pendiente; `npx tsc -b && npm run lint` en
   `cosmere-web-nb` y `dotnet build` en `cosmere-api-nb` verdes; `has-pending-model-changes` sin cambios si la fase tocó
   entidades; bitácora al día. (b) Sincronización de documentos (punto 2, «Documentos») y etiqueta local `nb-f<N>`
   (`git -C cosmere-web-nb tag nb-f<N>` y `git -C cosmere-api-nb tag nb-f<N>`) en la punta de cada rama de integración. (c)
   Fila de cierre en la bitácora. No hay puerta humana por fase: la fase siguiente empieza en cuanto termina (b). Tras F7, el
   orquestador entrega a Xavi el informe final para la puerta del punto 1: etiquetas, commits, migraciones que se auto-aplicarán
   al arrancar (M1-M6), procedimiento de §4.3 (`pg_dump`, `:prev`, `docker compose logs api`) y las comprobaciones SQL de
   producción (consulta y `UPDATE` de T12; consulta de ids de T40).
8. **Registro.** El orquestador crea la bitácora en la preparación (punto 2, «Documentos») y añade una fila por tarea (fecha,
   tarea, agente y modelo, rama/worktree, commit, resultado de la puerta de calidad, dudas resueltas con P8, discrepancias
   código/especificación, seguimiento) y una fila por cierre de fase (revisor, etiqueta, sincronización y, si Xavi hace un
   despliegue intermedio, su fusión y su despliegue). La bitácora vive en `<docsPath>`, nunca viaja en el commit de una tarea y
   llega a la rama de integración con la sincronización de cada fase.
9. **Si el código real difiere de la especificación** (líneas movidas por el WIP, un nombre distinto, un helper que ya existe, un
   patrón del repo que contradice un snippet): la realidad del código manda. El agente ancla por texto, conserva el
   comportamiento descrito, aplica P8 si la diferencia obliga a decidir, anota la discrepancia en su informe y el orquestador la
   copia a la bitácora. Solo si la discrepancia invalida una decisión de Xavi (§3, §12) se detiene la tarea y se abre una tarea
   de seguimiento; nunca se «arregla» código Stormlight que la tarea no nombra (P1).
10. **Modelo por tarea** (para ahorrar tokens; nunca el modelo «fable»): `haiku` para las tareas mecánicas S T00a y T00b; `opus`
    para las de motor o de máxima precisión: T10, T11, T12, T28, T34a, T35, T36 y T40; `sonnet` para todas las demás, incluidas
    las transcripciones del libro (T16-T22, T38-1, T38-2), las revisiones visuales (T25b, T38b) y las revisiones cruzadas de fin
    de fase (punto 7). Toda tarea de seguimiento `Txx-s1` la ejecuta un agente nuevo con `opus` (punto 5): si un agente `sonnet`
    falla dos veces la puerta de calidad, su seguimiento pasa a `opus`. El orquestador pasa el modelo como parámetro `model` al
    lanzar el agente y lo anota en la bitácora.

## 2. Glosario de dominio y convenciones de nombres

| Concepto | Identificador / valores | Dónde |
|---|---|---|
| Universo Cosmere | Núcleo compartido por todos los mundos (P8): fórmulas de la ficha (salud, concentración, defensas, Investidura, movimiento, rango), dado de trama, caminos heroicos y sus especialidades, reglas de combate y de aventuras (base neutra de `aventuras.ts`/`combatRules.ts` desde T23b), motor de talentos (`talentGraph.ts`, `TalentosReglas.cs`), componentes y primitivas de UI. En BD, el valor `"cosmere"` marca las `CatalogOptions` compartidas por todos los mundos (`WorldIds.Cosmere`; no es un mundo de campaña). **Ficheros del núcleo Cosmere en web**: `src/data/heroicPaths.ts`, `aventuras.ts` y `combatRules.ts` (base neutra desde T23b), `src/worlds/skills.ts` (`HABILIDADES_COSMERE`, T26), `src/lib/*` (incluido `src/lib/talentTypes.ts`, T34a: tipos `Talento` y `TalentGrid`), `components/ui.tsx`, `components/talentos/*`. **Ficheros de Roshar (mundo Stormlight)**: `src/data/radiantOrders.ts`, `potencias.ts` (salvo el tipo `Talento`, que reexporta desde `talentTypes.ts`; `Potencia` sigue siendo de Roshar), `cantores.ts`, `caminapiedras.ts`, `talentGrids.ts` y `talentSummaries.ts` **parcialmente** (las claves `heroico:*` son Cosmere; `radiante:*`, `potencia:*` y `cantor` son de Roshar; `TalentGrid` se reexporta desde `talentTypes.ts`), los SVG de órdenes y potencias de `src/assets/cosmere/`, `src/worlds/stormlight*.ts(x)`. En la API: `TalentosReglas.ReglasCosmere` frente a `TalentosReglas.ReglasRoshar` (§6.1, §6.2) y `FormasCantor.cs`. | `src/data/*.ts` (base), `src/lib/`, `components/ui.tsx`, `Services/Characters/TalentosReglas.cs`; `WorldIds.Cosmere` |
| Mundo | C# `World`, TS `world`. Valores `"stormlight"` (Roshar; manual *Archivo de las Tormentas*) y `"mistborn"` (Scadrial; manual *Nacidos de la Bruma*): los ids son los nombres de los manuales y no cambian. Cada campaña tiene **exactamente un** mundo, fijado al crear e inmutable; el personaje no tiene mundo propio, hereda el de su campaña. Etiquetas visibles: «Archivo de las Tormentas» / «Tormentas»; «Nacidos de la bruma» / «Bruma». El nombre visible del planeta va en `WorldConfig.planeta` (`'Roshar'` \| `'Scadrial'`). | `Messages/Worlds/WorldIds.cs` (`Stormlight`, `Mistborn`, `Todos`, `EsValido(string?)`, y `Cosmere = "cosmere"` reservado para contenido compartido, fuera de `Todos`: `EsValido("cosmere")` es `false`); `src/types/index.ts` `WorldId` |
| Convención de nombres | El discriminador se llama **mundo** (`World`/`world`) en código y en prosa; el nombre que usaba el encargo (título, §0) no se usa ni en código ni en prosa (P8). Código interno en inglés para ids, valores, tipos e infraestructura nueva (`World`, `Era`, `WorldIds`, `IWorldRules`, `WorldRulesProvider`, `WorldConfig`, `WorldGate`, carpetas `Services/Worlds/`, `Messages/Worlds/`, `src/worlds/`); términos de juego en español en los identificadores de dominio, como en el código actual (`CaminoHeroico`, `TalentosReglas`, `CaminoMetal`, `Poderes`, `Investidura`, `DerivadosSet`); todo texto visible en español (decisión de Xavi, 4 de octubre de 2026). Los nombres de fichero `stormlight.ts`, `mistborn.ts`, `src/data/mistborn/`, `src/components/mistborn/`, `MistbornData` y `mistbornAssets` se mantienen. Los anexos de `docs/nacidos-de-la-bruma/` conservan el vocabulario anterior al cierre: manda este documento (§14). | §5, §6, §7 |
| Era | `Era` / `era`. Valores `"era1"` («Era 1: El Mundo de Ceniza»), `"era2"` («Era 2: Cambio y revolución»); L.372 / PDF 378. `null` en Stormlight. Obligatoria en `mistborn`, fijada al crear la campaña e inmutable (decisión (b)). No existe un valor «entre eras»: una campaña que cruce las dos eras se juega como dos campañas; relacionar eras o mundos queda para más adelante (§13). | `EraIds` (C#: `Era1`, `Era2`, `EsValida`), `Era` (TS) |
| Camino de nacido del metal | `CaminoMetal` / `caminoMetal`: `""`, `"brumoso"`, `"nacido-de-la-bruma"`, `"feruquimista"`, `"ferrin"`, `"nacidoble"` (L.19 / PDF 25) | columna `Characters.CaminoMetal` |
| Camino inicial | `CaminoInicial` / `caminoInicial`: `""` (no decidido / Stormlight), `"heroico"`, `"metal"` (L.17-18 / PDF 23-24; decisión (k), Q7). Decide el grado gratuito de la habilidad inicial y el `autoGranted` del talento principal. | columna `Characters.CaminoInicial` |
| «Camino Investido» (término de la app) | El camino de Artes Investidas que el mundo añade a los caminos heroicos: `CaminoRadiante` en Stormlight, `CaminoMetal` en Mistborn. Solo aparece en nombres de código (`CaminoInvestidoLoCambiaElDirector`, `WorldConfig.caminoInvestido`, `TalentRules.campoCaminoInvestido`, `TreeKind`/`SlotKind`/`PlateKind` `'caminoInvestido'`). | §6.1, §7.1, §7.7 |
| Talento de ruptura / de herencia | Talento principal de un camino de nacido del metal (L.128 / PDF 134): Ruptura de brumoso, Ruptura de nacido de la bruma, Herencia feruquímica (L.146 / PDF 152; **no** «feruquimista»), Herencia ferrin, Herencia nacidoble. Son claves literales de los prerrequisitos («talento principal Herencia feruquímica») que parsea `talentGraph` | `caminosNacidosDelMetal.ts` `mainTalent` |
| Metal | 17 ids ASCII: `hierro acero estano peltre cinc laton cobre bronce aluminio duraluminio cromo nicrosil cadmio bendaleo oro electro atium` (L.168 / PDF 174). Comunes (8): los físicos y mentales de la alomancia (físicos y cognitivos en feruquimia): hierro, acero, estaño, peltre, cinc, latón, cobre, bronce. Raros: de mejora, temporales y divinos (L.167 / PDF 173; el libro define comunes/raros solo para la alomancia y los viales; para la feruquimia solo importa que los 8 comunes son los mismos metales, [inferido] el libro no define «raro» para mentes de metal). Las categorías difieren por arte (alomancia: físico, mental, mejora, temporal, divino, L.166 / PDF 172; feruquimia: físico, cognitivo, espiritual, híbrido, divino, L.167 / PDF 173; aluminio es «mejora» en alomancia (L.168 / PDF 174; L.175 / PDF 181) y «espiritual» en feruquimia (L.171 / PDF 177; L.216 / PDF 222)). | `src/data/mistborn/metales.ts` `MetalId`; `MistbornData.Metales` |
| Arte | `"alomancia"` \| `"feruquimia"` (hemalurgia no es arte de personaje en v1; L.251 / PDF 257) | `ArteMetal` |
| Poder | `PoderPersonaje { arte, metal, origen, completo, metaId, cargas, ajusteCargasMax, viales, desprovisto }`; id derivado `${arte}:${metal}` (`"alomancia:acero"`) para claves de grafo y rejilla | `Messages/Characters/PoderPersonaje.cs`; TS `PoderPersonaje` |
| Estado del poder | `completo: false` = **naciente**, `true` = **completo** (L.132-133 / PDF 138-139; L.162 / PDF 168). Atium alomántico nace completo (L.177 / PDF 183). | `PoderPersonaje.Completo` |
| Origen del poder | `"camino"` \| `"clavo"` \| `"lerasium"` \| `"medallon"` (L.288-295 / PDF 294-301). `"lerasium"` = **solo aleación de lerasium** (da un poder alomántico completo, L.295 / PDF 301); el lerasium puro no es un poder (ver §13). Todo poder con `Origen != "camino"` nace completo y sin meta (L.290 / PDF 296; L.295 / PDF 301; medallón [inferido]). | `PoderPersonaje.Origen` |
| Meta de nacido del metal | `Meta` normal enlazada por `PoderPersonaje.MetaId` (L.132-133 / PDF 138-139). Títulos del libro: «Entrenar tu poder» (brumoso, nacidoble), «Entrenar tus poderes» (nacido de la bruma), «Fabricar tu mente de metal» (ferrin, nacidoble), «Fabricar tus mentes de metal» (feruquimista, L.146 / PDF 152). No se crea meta si el único poder es alomancia de atium (L.135 / PDF 141). | `MetaEntity` sin cambios |
| Recursos de mesa | `Recursos` JSON clave→decimal. Claves Mistborn: `investiduraActual` (0 al crear, L.26 / PDF 32), `cuentasAtium` (L.176 / PDF 182), `arquillas` (óbolo 0,01 ar, nota 10 ar; L.254 / PDF 260). Stormlight: ninguna en v1. | `Characters.Recursos`; `IWorldRules.RecursosPermitidos` |
| Ascendencias NdB | `"Humano"`, `"Kandra"`, `"Sangre koloss"` (misma capitalización que `"Humano"`/`"Oyente"`, `CharacterService.cs:23`; L.32-39 / PDF 38-45) | `MistbornData.Ascendencias` |
| Bendición kandra | `Bendiciones` `text[]` con ids `consciencia potencia presencia estabilidad fortaleza` (una al crear; una 2.ª distinta como recompensa en rango 3; L.34-35 / PDF 40-41) | `Characters.Bendiciones` |
| Habilidades Investidas | `Alomancia` (Voluntad, `VOL`) y `Feruquimia` (Intelecto, `INT`), cognitivas, en `HabilidadPersonalizadaN` **por nombre exacto** (L.128 / PDF 134). En la ficha los huecos cognitivos son **2 y 5** (`ATRIBUTO_SLOTS['INT'] = ATRIBUTO_SLOTS['VOL'] = [2, 5]`, `CharacterDetailPage.tsx:374-376`; físicos 1 y 4, espirituales 3 y 6, `:399/:414/:429`): Alomancia ocupa el primer libre de `[2, 5]` y Feruquimia el siguiente; el nacidoble ocupa los dos. | ficha, tirador, `GradosDe` |
| Estados nuevos | **Desprovisto [poder]** (por poder, `PoderPersonaje.Desprovisto`; L.310 / PDF 316), **Mermado [atributo]** (solo enciclopedia; L.311 / PDF 317) | overlay de aventuras |
| Derivados por mundo | `DerivadosSet: Dictionary<string, StatDesglose>` (identificador heredado de la propuesta B y conservado: «Set» nombra aquí el bloque de derivados específicos del mundo, no el antiguo nombre del discriminador); claves `alomancia.modificador`, `alomancia.limite`, `alomancia.dado`, `alomancia.alcance`, `feruquimia.modificador`, `feruquimia.limite`, `feruquimia.dado`, `feruquimia.alcance`, `feruquimia.cargasMax`, `feruquimia.mentesALaVez`; por poder feruquímico `poder.<metal>.cargasMax`; `hemalurgia.clavosMax` **solo desde T49a** (F7), no en F2 | `CharacterResponse.DerivadosSet` |
| Carpetas | API: `Services/Worlds/`, `Messages/Worlds/`, `Messages/Characters/PoderPersonaje.cs`. Web: `src/worlds/` (configuración), `src/data/mistborn/` (datos), `src/data/overlays.ts`, `src/lib/talentRules.ts`, `src/pages/encyclopedia/mistborn/`, `src/components/mistborn/` | — |
| Tipos C# nuevos | `WorldIds`, `EraIds`, `IWorldRules`, `IWorldRulesProvider`, `WorldRulesProvider`, `StormlightRules`, `MistbornRules`, `MistbornData`, `ArtesMetalicas` (estática), `CharacterJson` (estática, `internal`), `BonosFormaExtensions` (estática, `internal`, `Services/Worlds/BonosFormaExtensions.cs`: método de extensión `ComoDiccionario(this BonosForma)`, §6.2 fila `:307`), `PoderPersonaje`, `IdentidadPersonaje` (record), `AccionMesa` (record abstracto con las variantes `PatchRecursos`, `BeberVial`, `InicioEscena`, §6.1), `ClavoHemalurgico` (T49a), `RecursosRequest`, `PoderRecursosRequest`, `BeberVialRequest`, `InicioEscenaRequest` | — |
| Tipos TS nuevos | `WorldId`, `Era`, `AttrField` (`'fuerza'\|'velocidad'\|'intelecto'\|'voluntad'\|'discernimiento'\|'presencia'`, campos de `Character`; hoy solo existe `SkillField`, `talentGraph.ts:70`), `WorldConfig`, `WorldData`, `HabilidadDef`, `TopicDef` (`src/worlds/types.ts`, extraído del `Topic` local de `EncyclopediaPage.tsx:99-107`), `CaminoInvestidoDef = RadiantOrder \| CaminoNacidoDelMetal` (`src/worlds/types.ts`), `PoderPersonaje`, `MetalDef`, `PoderAlomantico`, `PoderFeruquimico`, `PoderDef = PoderAlomantico \| PoderFeruquimico` (`src/data/mistborn/tipos.ts`, **creados por T16** porque T17 y T18 corren en paralelo y ambos los necesitan; en T06b `PoderDef` nace como `export type PoderDef = unknown` en `src/worlds/types.ts` porque `src/data/mistborn/` no existe hasta F3, y T16 lo sustituye por el tipo real), `StatLinea.esBono` (propiedad, §5.4), `CaminoNacidoDelMetal`, `ArbolAscendencia`, `Cultura`, `PaqueteInicial` (`src/data/mistborn/origenes.ts`, `equipoInicial.ts`), `TalentRules` (con `bonosCuentanParaRequisitos` y `campoCaminoInvestido`, §7.7), `Overlay<T>`, `SectionOverlay`, `AventurasOverlay`, `CombatOverlay` (`src/data/overlays.ts`), `RecursosPatch` | — |
| Claves TanStack Query | `['campaign', cId]`, `['catalog', cId, 'weapons' \| 'armor' \| 'gear']`, `['catalog', cId, 'opts', cat]`, `['global-npcs', cId]` (los PNJ se piden con `?campaignId=`, §5.2); personajes siguen `['characters', cId]`, `['character', cId, charId]`. **Atención:** la ficha usa una clave de CUATRO elementos `['character', cId, chId, enCombate]` (`CharacterDetailPage.tsx:468-471`) e invalida por prefijo `['character', cId, chId]` (`:483`, `:491`); `TalentosDetailPage.tsx:59`, `BolsaDetailPage.tsx:150` y `MetasDetailPage.tsx:318` usan la de tres. Toda mutación optimista de la ficha (T28, T29, T30) opera **por prefijo**: `const prefix = ['character', cId, chId]; onMutate: await qc.cancelQueries({ queryKey: prefix }); const prev = qc.getQueriesData<Character>({ queryKey: prefix }); qc.setQueriesData<Character>({ queryKey: prefix }, old => old && { ...old, /* cambio */ }); onError: prev.forEach(([k, d]) => qc.setQueryData(k, d)); onSettled: qc.invalidateQueries({ queryKey: prefix }); qc.invalidateQueries({ queryKey: ['characters', cId] })`. La base de un `PUT` sale de la entrada con `enCombate === false` (`qc.getQueryData(['character', cId, chId, false])`) o de `char`. Con `enCombate === true` no se sustituye la caché por la respuesta de `PATCH`/acciones (el servidor la calcula con `ContextoJuego` por defecto, es decir, fuera de combate): se invalida y se deja refetch. Un `setQueryData` sobre la clave de tres elementos escribiría una entrada que ningún observador lee y la UI no se movería hasta el refetch. | §7 |

## 3. Decisiones de diseño

Formato: alternativas consideradas → elegida → por qué. Las letras (a)-(j) son las obligatorias del encargo; (k)-(o) son las
secundarias que las propuestas y los jueces hicieron necesarias.

### (a) Mundo exclusivo por campaña frente a mezcla permitida por el libro (L.374-375 / PDF 380-381)
- Alternativas: (1) `World` string exclusivo por campaña; (2) `Worlds text[]` con unión; (3) capacidades por personaje con una
  única reserva de Investidura (lo que prevé el libro: «una única reserva de Investidura», Desprovisto por fuente).
- **Elegida: (1) en v1.**
- Por qué: migración mínima; inventarios y catálogo van **por nombre** (`BolsaDetailPage.tsx:243-245`) y los dos catálogos
  comparten nombres («Cuchillo», «Arco corto»; informe de catálogo §8); el motor de talentos identifica por nombre
  (`talentGraph.ts` `byName`); los seis huecos de habilidad personalizada competirían. El diseño deja preparada la mezcla:
  `TieneInvestidura` se decide por capacidades del personaje (radiante **o** alomántico), así que un futuro id `"mixto"` cuyo
  `IWorldRules` haga la unión no exige migración. → Q1.

### (b) Era a nivel de campaña y si cambia en el tiempo
- Alternativas: (1) sin era (todo disponible); (2) fija al crear; (3) editable por el director; (4) por personaje.
- **Elegida: (2), por decisión de Xavi (4 de octubre de 2026).** `Campaigns.Era text` obligatoria si `mistborn`, valores
  `era1 | era2`, `null` en Stormlight, fijada al crear la campaña e inmutable como `World`. No existe el valor «entre eras».
- Por qué: el libro exige conocer la era antes de crear personajes (L.17 / PDF 23) y la era filtra ascendencias, caminos, metales
  y objetos (L.371-372 / PDF 377-378). Xavi quiere que una campaña sea solo Archivo, Nacidos Era 1 o Nacidos Era 2; una campaña
  que cruce las dos eras (como «El legado de los nacidos de la bruma», L.372 / PDF 378) se juega en v1 como dos campañas;
  relacionar
  eras o mundos queda para más adelante (§13). La era **solo filtra opciones** (pickers, catálogo); nunca invalida datos
  guardados. Texto en
  lugar de `short?`: deja `null` con un único significado («sin era», Stormlight) y admite valores futuros sin migración.

### (c) ¿Se puede cambiar el mundo tras crear la campaña?
- Alternativas: (1) inmutable; (2) editable si no hay personajes; (3) siempre.
- **Elegida: (1) No.**
- Por qué: no existe endpoint de edición de campaña (`API/Controllers/CampaignsController.cs`, 48 líneas); cambiar el mundo
  dejaría
  `Ascendencia="Oyente"`, órdenes radiantes y marcos inválidos para `ValidarIdentidad`. No hay ningún endpoint de edición de la
  campaña (ni `World` ni `Era`). El `Sheet` de creación avisa.

### (d) Almacenamiento de poderes del personaje
- Alternativas: (1) columnas fijas (`PoderAlomantico1..n`); (2) JSON tipado en `Characters`; (3) tabla hija `CharacterPoderes`
  (patrón `MetaEntity`); (4) marcadores en `Talentos` (`~poder~acero=completo`, patrón `~forma~`).
- **Elegida: (2).** Columna `Poderes text NOT NULL DEFAULT '[]'` que guarda `List<PoderPersonaje>` serializada con
  `System.Text.Json` **en el servicio** (mismo patrón que `Talentos`/`ParseTalentos`, `CharacterService.cs:300-305`), con DTOs
  **tipados** en request y response.
- Por qué: un nacido de la bruma de Era 1 tiene hasta 10 poderes (L.372 / PDF 378), lo que descarta columnas; la tabla hija obliga
  a endpoints, DTOs e `Include` nuevos para datos que siempre viajan con el personaje; los marcadores exigen trato especial en
  cuatro sitios del motor de talentos (`splitStoredTalentos`, `withTalent`, `talentBudget`, `cascadeRemove`) y pisan
  `FormasCantor.cs:25`. Se evita `jsonb` + `ValueConverter`/`ValueComparer`, patrón inexistente en el repo (todo se mapea por
  convención, `CosmereContext.cs:28-213`). Validación en servidor: arte, metal, origen, sin duplicados `(arte, metal)`, atium
  completo. La tabla hija queda como evolución documentada si aparecen problemas de concurrencia (§13).

### (e) Seguimiento de valores actuales que hoy la app no persiste en servidor
- Alternativas: (1) solo cliente (`localStorage` por personaje); (2) servidor dentro del `PUT` completo del personaje; (3)
  servidor con `PATCH` parcial y acciones de dominio.
- **Elegida: (3).** Cargas, viales y Desprovisto viven en `PoderPersonaje`; Investidura actual, cuentas de atium y arquillas en
  `Recursos`. Se escriben con `PATCH …/recursos` (solo lo no nulo, recortado a [0, máximo]) y con `POST …/acciones/beber-vial` e
  `inicio-escena`, que aplican L.129-130 / PDF 135-136 en un solo sitio.
- Por qué: el director necesita ver el estado de la mesa y el jugador cambia de dispositivo; la hoja de artes metálicas del libro
  registra cargas, viales y «meta completada» por poder (L.404 / PDF 410). Salud y concentración actuales **no** se persisten hoy
  en ningún sitio (no es una decisión de cliente: simplemente no existen), así que no hay coherencia que preservar. El `PUT`
  completo no toca estos valores, lo que elimina la carrera *last-write-wins* identificada en `TalentosDetailPage.tsx:176-179` y
  `BolsaDetailPage.tsx:184`. → Q5.

### (f) Catálogo global frente a por mundo
- Alternativas: (1) columna `World` + filas duplicadas por mundo; (2) `Worlds[]` o valor `'both'`; (3) catálogo por campaña.
- **Elegida: (1)**, con `'cosmere'` solo en `CatalogOptions`.
- Por qué (informe de catálogo §5, §8): solo 4 de 65 objetos homónimos coinciden en precio y peso, la moneda difiere (`mc` / `ar`)
  y las descripciones son editables por fila. Filtro `?campaignId=` con **default `stormlight`** si falta (cliente actual
  intacto). Escritura: GM de la campaña cuando llega `campaignId`, lo que corrige el defecto previo de
  `API/Controllers/CatalogController.cs:11-13` (solo `[Authorize]`). **Sin cambio visible en Stormlight:** la UI ya muestra «Nueva
  arma/armadura», «Eliminar» y «Editar descripción» solo al GM (`CatalogPage.tsx:913`, `:276`, `:435`); el hueco es únicamente de
  API (llamadas directas) y T39b lo cierra en servidor. → Q9.

### (g) PNJ globales por mundo
- Alternativas: (1) columna `World` + filtro; (2) usar `Source` como discriminador.
- **Elegida: (1).** `GlobalNpcs.World text NOT NULL DEFAULT 'stormlight'` y `GET /global-npcs?campaignId=` (el mundo se resuelve
  por la campaña, nunca viaja en el cuerpo; §5.2).
- Por qué: los 34 PNJ sembrados son de Caminapiedras (`20260408073708_SeedAllNpcs.cs`) y `Source` es texto libre editable. Sin
  seed Mistborn (los adversarios están en la Guía del mundo, fuera de alcance): el vacío «Sin adversarios todavía»
  (`GlobalNpcListPage.tsx:131`, `:185`) pasa a tener sentido.

### (h) Enciclopedia compartida frente a duplicada
- Alternativas: (1) duplicar páginas; (2) base neutra (universo Cosmere) + un overlay por mundo (≈25 ediciones en textos
  Stormlight, reinyectadas por el overlay Stormlight); (3) base = Stormlight intacta + overlay Mistborn.
- **Elegida: (2) como estado final, pasando por (3) como paso intermedio** (Q12, decisión de Xavi del 4 de octubre de 2026,
  por el principio Cosmere/mundo: las reglas de aventuras y combate son compartidas y viven en el núcleo; el color de Roshar y
  el de Scadrial pertenecen a cada mundo). T23 crea el resolver y el overlay de Bruma sobre la base intacta; T23b neutraliza la
  base y añade el overlay Stormlight.
- Por qué: cero regresión de texto (P1), garantizada por comparación JSON de los arrays resueltos para `stormlight` antes y
  después de T23b; el motor de escena de los capítulos 9-12 es el mismo en ambos libros (informe de reglas base).
  `AventurasPage` y `CombatPage` se comparten (una sola cadena parametrizada, `CombatPage.tsx:68`). Páginas solo Stormlight
  (`RadiantOrdersPage`, `PotenciasPage`) ocultas en Mistborn con `WorldGate`; páginas solo Mistborn en
  `pages/encyclopedia/mistborn/` con `React.lazy`. Con la base neutra, un futuro mundo (o el `"mixto"` de §13) solo añade su
  overlay.

### (i) Tema visual por mundo
- Alternativas: (1) tokens redefinidos bajo `data-world`; (2) segundo `index.css`; (3) sin tema por mundo.
- **Elegida: (1).**
- Por qué: `--brand*` es un único eje (61 `var(--brand` + 93 `tone.brand`/`c.brand`, informe UI §6) y `theme.ts` solo referencia
  variables. Sin atributo = tokens actuales (no hay regla para `data-world='stormlight'`). `index.html` y `vite.config.ts`
  (manifest PWA) quedan Stormlight: no son parametrizables por campaña.

### (j) Columnas Stormlight del personaje en campañas de Nacidos de la Bruma
- Alternativas: (1) borrar; (2) anular; (3) ignorar.
- **Elegida: (3).** `CaminoRadiante`, `IdealesJurados`, `MarcosInfusas/Opacas`, `MaxInvestiture`, `Spells` se guardan y se
  devuelven; la UI no las pinta cuando `features.caminoRadiante/idealesJurados/marcos` es `false`.
- Por qué: cero migración destructiva. `MistbornRules.ValidarIdentidad` exige `CaminoRadiante == ""`; `StormlightRules` exige
  `CaminoMetal == ""`, `Poderes`, `Bendiciones` y `Recursos` vacíos. Así una campaña nunca acumula datos del otro mundo.

### (k) Camino de nacido del metal como camino inicial (L.17-18 / PDF 23-24)
- Alternativas: (1) columna `CaminoInicial`; (2) clave numérica en `Recursos` (`caminoInicialInvestido = 1`); (3) regla derivada
  (`caminoHeroico === ''` ⇒ el camino de nacido del metal es el inicial).
- **Elegida: (1).** Columna aditiva `Characters.CaminoInicial text NOT NULL DEFAULT ''` en M2 con valores `''`, `'heroico'` o
  `'metal'` (§4.1, §5.1, §5.3). Si vale `'metal'`, el talento principal del camino de nacido del metal es `autoGranted` y la
  habilidad inicial recibe el grado gratuito adicional (L.135 / PDF 141); si vale `'heroico'`, el heroico es el inicial y el
  principal del NdM ocupa un hueco de nivel y se guarda en `talentos`. `''` significa «no decidido» (todo personaje existente y
  todo Stormlight): la UI lo trata como `'heroico'` si hay camino heroico y como `'metal'` si solo hay camino de nacido del metal.
- Por qué: la regla derivada (alternativa descartada, 3) **no cubre el caso común**: la ascendencia humana da un talento adicional
  que debe ser de un camino heroico ya en el nivel 1 (L.32 / PDF 38), y todos los ejemplos icónicos del libro empiezan con camino
  de nacido del metal inicial **más** un talento heroico (Brisa: Ruptura de brumoso + Presencia imponente, L.135 / PDF 141;
  Kelsier y Vin, L.139 / PDF 145; Wax, L.153 / PDF 159). Con esos personajes `caminoHeroico != ''`, así que deducirlo no daría el
  grado gratuito ni el `autoGranted`. La clave en `Recursos` (2) sería un booleano disfrazado de número. La columna la fija el
  cliente al elegir el camino (`Segmented` «Camino inicial» en `CaminoMetalPicker`, §7.4 paso 2) y, como el camino, solo la cambia
  el
  director (el servidor bloquea `CaminoInicial` a no-GM, §5.2; Q6). → Q7.

### (l) Dónde vive el estado «completo» del poder
- Alternativas: (1) derivarlo de `Meta.estado`; (2) campo en el poder + vínculo a la meta, marcado a mano en la UI; (3) campo en
  el poder + el servidor lo marca al concluir la meta.
- **Elegida: (3).** `PoderPersonaje.Completo` es la verdad; `MetaId` enlaza la meta. `MetaService.ConcludeMetaAsync`
  (`Services/Metas/MetaService.cs:53-67`), tras marcar `concluida` con **cualquier** `TipoConclusion`
  (`exito | crecimiento | fracaso`), busca en `character.Poderes` los que tengan `MetaId == meta.Id` y pone `Completo = true`
  (L.132-133 / PDF 138-139). El libro dice que una meta puede concluirse por éxito, crecimiento o fracaso y que «una vez concluida
  la meta, recibirás una recompensa» (L.284 / PDF 290); la recompensa de la meta de nacido del metal es la versión completa del
  poder [inferido: el libro no distingue el tipo de conclusión para estas metas] → Q20.
- Por qué: la recompensa del libro se aplica donde ocurre, sin interruptor manual; es un añadido guardado (sin efecto si ningún
  poder enlaza la meta), así que Stormlight no cambia. El GM puede además marcarlo a mano con `PATCH …/recursos`. El `PUT`
  completo **no** escribe `Completo` de los poderes existentes (lo conserva por `(Arte, Metal)`, §5.1), de modo que una copia
  cacheada antigua no puede revertirlo. No se añaden columnas a `MetaEntity`.

### (m) Alomancia y Feruquimia: columnas dedicadas frente a huecos personalizados
- Alternativas: (1) columnas `Alomancia`, `Feruquimia int`; (2) huecos `HabilidadPersonalizadaN` fijados por nombre.
- **Elegida: (2).**
- Por qué: es la instrucción literal del libro («escribiéndola en la línea en blanco bajo el resto de habilidades cognitivas»,
  L.128 / PDF 134); el tirador ya resuelve habilidades personalizadas por nombre (`DiceRoller.tsx:68-97`); `GradosDe` gana una
  rama por nombre; cero API nueva. Coste: un nacidoble ocupa los dos huecos cognitivos (quedan cuatro libres). → Q4.

### (n) Bendiciones kandra
- Alternativas: (1) marcador `~bendicion~X` en `Talentos`; (2) columna `Bendiciones text[]` + bonos aplicados por
  `BonosAtributos`.
- **Elegida: (2).**
- Por qué: el marcador se contaría como talento `otro` en `talentBudget` (`talentGraph.ts:1166`; solo ignora `~forma~` y
  `nonTalent`) y consumiría un hueco. El libro las describe como aumentos permanentes de valor y máximo (L.34-35 / PDF 40-41);
  aplicarlas como líneas «Bendición de la Consciencia: +2» en el desglose mantiene comprobable el presupuesto de 6 puntos (L.34 /
  PDF 40) sobre los atributos base. Fortaleza (Desvío +1) se acumula con la armadura [inferido] → Q8.

### (o) Hemalurgia en v1
- Alternativas: (1) tabla de clavos + penalizaciones; (2) solo enciclopedia + `origen: 'clavo'` en el poder; (3) nada.
- **Elegida: (2).**
- Por qué: los clavos son recompensa del DJ (L.288 / PDF 294); un poder con `origen: 'clavo'` da Investidura (L.290 / PDF 296) y
  eso sí entra en `TieneInvestidura`. Penalizaciones a Defensa espiritual (−2 / −5, Desorientado ≤ 9), clavos de atributo (cinc,
  cobre, estaño, hierro: no dan poder, L.291 / PDF 297) y `clavosMax = min(rango, 3)` quedan para T49a/T49b con una columna
  `Clavos text`
  (migración M6, F7) independiente de `Poderes` (§4.1, §13, T49a). El lerasium puro tampoco es un poder (da un talento del camino
  de nacido de la bruma,
  L.295 / PDF 301) y queda fuera de v1 (§13).

## 4. Modelo de datos (API)

### 4.1 Entidades y columnas

| Entidad (fichero) | Propiedad C# exacta (añadir al final del bloque indicado) | Columna PostgreSQL | Fase |
|---|---|---|---|
| `CampaignEntity` (`Messages/Database/Entities/CampaignEntity.cs`, tras `CreatedAt` `:10`) | `public string World { get; set; } = WorldIds.Stormlight;` | `"World" text NOT NULL DEFAULT 'stormlight'` | F1 |
| `CampaignEntity` | `public string? Era { get; set; }` | `"Era" text NULL` | F1 |
| `CharacterEntity` (`CharacterEntity.cs`, tras `IdealesJurados` `:21`) | `public string CaminoMetal { get; set; } = string.Empty;` | `"CaminoMetal" text NOT NULL DEFAULT ''` | F2 |
| `CharacterEntity` | `public string CaminoInicial { get; set; } = string.Empty;` (valores `''`, `'heroico'`, `'metal'`; decisión (k), Q7) | `"CaminoInicial" text NOT NULL DEFAULT ''` | F2 |
| `CharacterEntity` | `public string Poderes { get; set; } = "[]";` (JSON de `List<PoderPersonaje>`, camelCase) | `"Poderes" text NOT NULL DEFAULT '[]'` | F2 |
| `CharacterEntity` | `public string Recursos { get; set; } = "{}";` (JSON de `Dictionary<string, decimal>`) | `"Recursos" text NOT NULL DEFAULT '{}'` | F2 |
| `CharacterEntity` | `public List<string> Bendiciones { get; set; } = [];` (patrón `Weapons`, `CharacterEntity.cs:86-90`) | `"Bendiciones" text[] NOT NULL DEFAULT '{}'` | F2 |
| `CharacterEntity` (tras `Bendiciones`) | `public string Clavos { get; set; } = "[]";` (JSON de `List<ClavoHemalurgico>`, T49a) | `"Clavos" text NOT NULL DEFAULT '[]'` | F7 |
| `WeaponCatalogEntity`, `ArmorCatalogEntity`, `GearItemEntity` (`Messages/Database/Entities/WeaponCatalogEntity.cs`) | `public string World { get; set; } = WorldIds.Stormlight; public short? Era { get; set; } public bool IsRewardOnly { get; set; }` | `text NOT NULL DEFAULT 'stormlight'`, `smallint NULL`, `boolean NOT NULL DEFAULT false` | F6 |
| `WeaponCatalogEntity`, `ArmorCatalogEntity` | `public double? Price { get; set; }` (`GearItemEntity.Price` ya existe como `double`) | `double precision NULL` | F6 |
| `GearItemEntity` | `public string? Category { get; set; }` (`'vial'`) | `text NULL` | F6 |
| `CatalogOptionEntity` | `public string World { get; set; } = WorldIds.Stormlight;` (valores `stormlight`, `mistborn`, `cosmere`) | `text NOT NULL DEFAULT 'stormlight'` | F6 |
| `GlobalNpcEntity` | `public string World { get; set; } = WorldIds.Stormlight;` | `text NOT NULL DEFAULT 'stormlight'` | F6 |

Índices: `IX_WeaponCatalog_World`, `IX_ArmorCatalog_World`, `IX_GearItems_World`, `IX_GlobalNpcs_World`; en
`CatalogOptions` el índice de `Category` (`Infrastructure/Data/CosmereContext.cs:167-169`) pasa a `(World, Category)`. Sin FK
nuevas. Sin `HasMaxLength` (convención del repo).

**DEFAULT de BD obligatorio (declarado en Fluent, no editado a mano).** `dotnet ef migrations add` no lee los inicializadores C#
(`= WorldIds.Stormlight`, `= "[]"`): para una columna `string NOT NULL` añadida a una tabla existente genera `defaultValue: ""`
(precedente: `Infrastructure/Migrations/20260408113458_AddEquippedArmor.cs:13-18`, propiedad `= string.Empty`), y para
`List<string>` no tiene valor CLR por defecto, así que el `ALTER TABLE … ADD COLUMN "Bendiciones" text[] NOT NULL` fallaría en
PostgreSQL con filas existentes («column contains null values») y, como las migraciones se auto-aplican al arrancar
(`API/Program.cs:92-94`), la API quedaría en bucle de reinicio (`restart: unless-stopped`, `docker-compose.yml`) y nginx
devolvería 502 en `/api/`. Hoy `CosmereContext.OnModelCreating` no tiene ningún `HasDefaultValue` (`grep` → 0 resultados; todo se
mapea por convención), pero es el único sitio del repo donde se configuran índices y relaciones, así que ahí se declaran los
defaults para que la migración generada los lleve **y** el snapshot quede coherente (editar el `Up` a mano desincroniza
`CosmereContextModelSnapshot.cs`):

```csharp
// Infrastructure/Data/CosmereContext.cs, OnModelCreating
modelBuilder.Entity<CampaignEntity>().Property(c => c.World).HasDefaultValue(WorldIds.Stormlight);            // M1
modelBuilder.Entity<CharacterEntity>().Property(c => c.CaminoMetal).HasDefaultValue("");                          // M2
modelBuilder.Entity<CharacterEntity>().Property(c => c.CaminoInicial).HasDefaultValue("");
modelBuilder.Entity<CharacterEntity>().Property(c => c.Poderes).HasDefaultValue("[]");
modelBuilder.Entity<CharacterEntity>().Property(c => c.Recursos).HasDefaultValue("{}");
modelBuilder.Entity<CharacterEntity>().Property(c => c.Bendiciones).HasDefaultValueSql("'{}'");
modelBuilder.Entity<CharacterEntity>().Property(c => c.Clavos).HasDefaultValue("[]");                           // M6 (T49a, F7)
// M3 / M5: WeaponCatalogEntity, ArmorCatalogEntity, GearItemEntity, CatalogOptionEntity, GlobalNpcEntity → .Property(e => e.World).HasDefaultValue(WorldIds.Stormlight)
```

Verificación obligatoria tras cada `database update` (en local, con `docker exec cosmere-postgres-local psql -U jira -d cosmere -c
"<SQL>"`, §1 «Protocolo», punto 2): `SELECT DISTINCT "World" FROM "Campaigns"` = `stormlight` (M1); `SELECT
COUNT(*) FROM "Characters" WHERE "Poderes" <> '[]' OR "Recursos" <> '{}' OR "CaminoMetal" <> '' OR "CaminoInicial" <> ''` = 0 y
`SELECT COUNT(*) FROM "Characters" WHERE "Bendiciones" IS NULL` = 0 (M2);
`SELECT COUNT(*) FROM "WeaponCatalog" WHERE "World" = ''` = 0 (M3, M5 análogo); `SELECT COUNT(*) FROM "Characters" WHERE "Clavos"
<> '[]'` = 0 (M6). Sin esto, `GET /campaigns` devolvería
`world: ""` y el catálogo y los PNJ Stormlight desaparecerían al filtrar por `'stormlight'`.

### 4.2 `PoderPersonaje` y `Recursos`

```csharp
// Messages/Characters/PoderPersonaje.cs — compartido por request, response y servicio
namespace Messages.Characters;
public sealed class PoderPersonaje
{
    public required string Arte { get; set; }          // "alomancia" | "feruquimia"
    public required string Metal { get; set; }         // id ASCII de los 17 (§2)
    public string Origen { get; set; } = "camino";     // "camino" | "clavo" | "lerasium" | "medallon"
    public bool Completo { get; set; } = false;        // naciente solo si Origen == "camino" y la meta no está concluida (L.162 / PDF 168); alomancia:atium siempre true (L.177 / PDF 183); Origen != "camino" siempre true (L.290 / PDF 296; L.295 / PDF 301)
    public long? MetaId { get; set; }                  // Metas.Id de «Entrenar tu poder» / «Fabricar tu mente de metal» (L.132-133 / PDF 138-139)
    public int Cargas { get; set; } = 0;               // feruquimia: cargas actuales; una reserva por metal (L.131 / PDF 137)
    public int AjusteCargasMax { get; set; } = 0;      // Componedor: −1 permanente por uso (L.155 / PDF 161)
    public int Viales { get; set; } = 0;               // alomancia, solo metales raros (L.130 / PDF 136)
    public bool Desprovisto { get; set; } = false;     // estado Desprovisto [poder] (L.310 / PDF 316)
}
```

`Recursos` se tipa como `Dictionary<string, decimal>` en DTOs y servicio (la columna es `text`). Claves permitidas por mundo
(`IWorldRules.RecursosPermitidos`): Mistborn `investiduraActual`, `cuentasAtium`, `arquillas`; Stormlight `[]`. Valores `>= 0`;
`arquillas` con 2 decimales; las demás enteras (se validan con `decimal.Truncate(v) == v`). Helpers en la clase estática nueva
`Services/Characters/CharacterJson.cs` (`internal static`, creada en T11 y compartida por `CharacterService` y `MetaService`,
mismo ensamblado): `ParsePoderes(string?)`, `ParseRecursos(string?)`, `SerializarPoderes(List<PoderPersonaje>)`,
`SerializarRecursos(...)`, `FusionarPoderes(...)`. `ParsePoderes`/`ParseRecursos` devuelven `[]`/`{}` ante `null`, `""` o JSON
inválido, mismo patrón de tolerancia que `ParseTalentos` (`CharacterService.cs:300-305`), que **no** se mueve. Serialización con
una instancia estática `private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);` (camelCase y
lectura sin distinguir mayúsculas, equivalente a lo que ASP.NET Core aplica por defecto en los controladores; `API/Program.cs:67`
es un `AddControllers()` sin opciones JSON explícitas).

### 4.3 Migraciones EF (orden; todas posteriores a `20260929110638_AddIdealesJurados`; patrón `Infrastructure/Migrations/20260929110638_AddIdealesJurados.cs:11-19`)

| # | Nombre | `Up` | `Down` | Fase |
|---|---|---|---|---|
| M1 | `AddCampaignWorld` | `AddColumn<string>("World","Campaigns",type:"text",nullable:false,defaultValue:"stormlight")`; `AddColumn<string>("Era","Campaigns",type:"text",nullable:true)` | `DropColumn` ×2 | F1 |
| M2 | `AddCharacterMistbornFields` | `AddColumn<string>("CaminoMetal","Characters","text",nullable:false,defaultValue:"")`; `AddColumn<string>("CaminoInicial","Characters","text",nullable:false,defaultValue:"")`; `AddColumn<string>("Poderes","Characters","text",nullable:false,defaultValue:"[]")`; `AddColumn<string>("Recursos","Characters","text",nullable:false,defaultValue:"{}")`; `AddColumn<List<string>>("Bendiciones","Characters","text[]",nullable:false,defaultValueSql:"'{}'")` (el genérico es `List<string>`, como `table.Column<List<string>>` en `20260327145705_InitialCreate.cs:210-213`, **no** `string[]`; criterio de revisión: tipo `text[]`, `NOT NULL`, default vacío) | `DropColumn` ×5 | F2 |
| M3 | `AddWorldToCatalog` | columnas de §4.1 en las 4 tablas + índices + `migrationBuilder.Sql("UPDATE \"CatalogOptions\" SET \"World\"='cosmere' WHERE \"Id\" IN (1,2,3,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,30,31,32,40,42,43,44,46,50,51,52,53,54,56,57,58,60,61,62,64,70,71,73,74,80,81,82,83,85)")` (informe de catálogo §5.2) + **los cuatro `setval`**: `SELECT setval(pg_get_serial_sequence('"WeaponCatalog"','Id'), (SELECT MAX("Id") FROM "WeaponCatalog"))` e ídem `ArmorCatalog`, `GearItems`, `CatalogOptions` (`20260410143041_SeedCatalogData.cs` insertó ids explícitos **sin** `setval`, así que en la BD local las secuencias nunca avanzaron y el primer alta con id autogenerado chocaría con un id sembrado; T40 conserva además su propio `setval` final) | `DropIndex`/`DropColumn` | F6 |
| M4 | `SeedMistbornCatalog` | `INSERT` de opciones nuevas (ids 4, 33, 34, 47-49, 65-69, 78, 79, 86, 100, 110-115, 140, 141), 35 armas (ids 1001-1035), 8 armaduras (1001-1008), 84 `GearItems` (1001-1084; `Category='vial'` en 1072-1084), todo `World='mistborn'`; termina con `SELECT setval(pg_get_serial_sequence('"WeaponCatalog"','Id'), (SELECT MAX("Id") FROM "WeaponCatalog"))` e ídem `ArmorCatalog`, `GearItems`, `CatalogOptions`. **Sin `DELETE`** (a diferencia de `20260410143041_SeedCatalogData.cs`). | `DELETE … WHERE "World"='mistborn'` + borrar opciones por id | F6 |
| M5 | `AddWorldToGlobalNpcs` | `AddColumn<string>("World","GlobalNpcs","text",nullable:false,defaultValue:"stormlight")` + índice | `DropColumn` | F6 |
| M6 | `AddCharacterClavos` | `AddColumn<string>("Clavos","Characters","text",nullable:false,defaultValue:"[]")` (T49a; `HasDefaultValue("[]")` en Fluent, §4.1) | `DropColumn` | F7 |

Comandos (en el worktree de la tarea, con su API parada, §1 «Protocolo», punto 2, y el árbol compilando):
`dotnet ef migrations add <Nombre> --project Infrastructure --startup-project API` →
revisar `Up` (cada columna `NOT NULL` nueva lleva `defaultValue`/`defaultValueSql` **presente y con el valor de §4.1** gracias al
Fluent: `""` es el valor correcto en `CaminoMetal` y `CaminoInicial`, lo incorrecto es que falte o que una columna `World` valga
`""`; si no lo lleva, **no aplicar**: añadir el `HasDefaultValue` y regenerar con `dotnet ef migrations remove`) →
`dotnet ef database update
--project Infrastructure --startup-project API`. Se auto-aplican al arrancar (`API/Program.cs:93-94`,
`Infrastructure/Bootstrap.cs:22-28`, `AutoMigrate` por defecto `true`). Todas son `ADD COLUMN … DEFAULT` constante o `INSERT`:
metadatos sin reescritura de tabla (producción `postgres:16-alpine`, `docker-compose.yml:4`; el local es el contenedor
`cosmere-postgres-local`, también `postgres:16-alpine`: comprobarlo con
`docker exec cosmere-postgres-local psql -U jira -d cosmere -c "SELECT version();"`, ≥ 11).

**Regla de serialización de migraciones.** Solo un agente genera migraciones a la vez y siempre sobre una rama que contenga todas
las migraciones anteriores ya fusionadas: `Infrastructure/Migrations/CosmereContextModelSnapshot.cs` es un único fichero
compartido, y dos `migrations add` en ramas paralelas producen conflicto de snapshot y `Up` incorrectos (columnas re-añadidas o
eliminadas). El orden de aplicación es por *timestamp* del nombre, no por fase, así que el orden obligatorio es M1 (T04) < M2
(T11) < M3 (T39a) < M5 (T42a) < M4 (T40) < M6 (T49a). M4 es SQL puro sin cambio de modelo, pero su `migrations add` también toca
el
snapshot, así que **se genera después de M5** (orden de tareas T39a → T42a → T40, lotes 1-3 de F6, §1 «Protocolo», punto 3): un
solo generador a la vez. Cada `migrations add` se hace en el worktree de su tarea, creado desde la punta de `nacidos-de-la-bruma`
cuando la migración anterior ya está fusionada (M3 exige M2). Tras cada fusión que toque entidades, el orquestador, al reiniciar
`nb-api` (§1 «Protocolo», punto 6), ejecuta con ella parada en `cosmere-api-nb`:
`dotnet ef migrations has-pending-model-changes --project Infrastructure --startup-project API` (paquete EF 8.0.11,
`Infrastructure/Infrastructure.csproj:8-12`; herramienta global `dotnet-ef` con versión mayor ≥ 8, hoy 10.0.5, §1 «Protocolo»,
punto 2) debe decir «No changes have been made to the model since the last migration».

**Despliegue con migraciones (el final, con M1-M6; o uno intermedio opcional, con las de sus fases; §1 «Protocolo», punto 1).**
**Antes de ejecutar `deploy.sh`** (por SSH al servidor,
`ssh -p 2222 xpujol@83.51.10.55`; el `docker load` del heredoc de `deploy.sh:103-104` reasigna la etiqueta `cosmere-api:latest` a
la imagen nueva, así que el `tag :prev` debe hacerse antes de lanzar el script): `cd ~/cosmere && sudo docker exec
cosmere-postgres pg_dump -U jira -d cosmere -Fc > backup-$(date +%F).dump && sudo docker tag cosmere-api:latest cosmere-api:prev
&& sudo docker tag cosmere-web:latest cosmere-web:prev` (usuario `jira`, `docker-compose.yml:10`). **Después**:
`sudo docker compose logs api | grep -i "Applying migration"` debe listar las migraciones nuevas (el nivel `Default: Information`
de `API/appsettings.Production.json` deja pasar los logs de `Microsoft.EntityFrameworkCore.Migrations`; el contenedor arranca con
`ASPNETCORE_ENVIRONMENT=Production`, `docker-compose.yml:34`, y `appsettings.json` tiene el mismo valor) y
`sudo docker compose ps` debe mostrar `api` en `Up` sin reinicios. **Rollback**: `docker-compose.yml` referencia
`image: cosmere-api` sin etiqueta, así que hay que reetiquetar `:prev` como `latest`: `sudo docker compose down && sudo docker tag
cosmere-api:prev cosmere-api:latest && sudo docker tag cosmere-web:prev cosmere-web:latest && sudo docker compose up -d` (en F6,
antes del `up`, el `DELETE` de M4 descrito a continuación). `deploy.sh` (`:98-117`) hoy hace `docker load` + `docker compose down`
+
`up -d` sin backup ni rollback, así que estos pasos son manuales (opcional: añadir el `pg_dump` y el `tag :prev` como paso [2b/4]
antes de `docker load`, fuera de los dos repos de código).

**Rollback de F6.** La imagen anterior no filtra por `World` (`CatalogService.cs:11-35` devuelve todas las filas): si hay que
volver a ella tras aplicar M4, la campaña Stormlight vería las 35 armas, 8 armaduras y 84 objetos de Nacidos de la Bruma mezclados
en su catálogo. Ejecutar en el servidor, antes del `docker compose up -d` con `:prev`: `sudo docker exec cosmere-postgres psql -U
jira -d cosmere -c "DELETE FROM \"WeaponCatalog\" WHERE \"World\"='mistborn'; DELETE FROM \"ArmorCatalog\" WHERE
\"World\"='mistborn'; DELETE FROM \"GearItems\" WHERE \"World\"='mistborn'; DELETE FROM \"CatalogOptions\" WHERE
\"World\"='mistborn'; SELECT setval(pg_get_serial_sequence('\"WeaponCatalog\"','Id'), (SELECT MAX(\"Id\") FROM \"WeaponCatalog\")); SELECT setval(pg_get_serial_sequence('\"ArmorCatalog\"','Id'), (SELECT MAX(\"Id\") FROM \"ArmorCatalog\")); SELECT setval(pg_get_serial_sequence('\"GearItems\"','Id'), (SELECT MAX(\"Id\") FROM \"GearItems\")); SELECT setval(pg_get_serial_sequence('\"CatalogOptions\"','Id'), (SELECT MAX(\"Id\") FROM \"CatalogOptions\"));
DELETE FROM \"__EFMigrationsHistory\" WHERE \"MigrationId\" LIKE '%_SeedMistbornCatalog';"` (es el `Down`
de M4 más el borrado de su entrada de historial, para que la imagen nueva vuelva a sembrar al redesplegar; sin borrar la entrada,
`Migrate()` no repetiría el seed). Los cuatro `setval` devuelven las secuencias al máximo que queda: sin ellos seguirían en
1035/1008/1084/141, un arma o armadura propia creada con `:prev` nacería con id ≥ 1036 o ≥ 1009, y al redesplegar la imagen
nueva la guarda de M4 abortaría la migración (riesgo 4). Añadido el 5 de octubre de 2026 a partir del informe de T40. Las opciones `cosmere` de M3 siguen devolviéndose a Stormlight y no requieren rollback. Los PNJ
`mistborn` creados en `GlobalNpcs` se verían en Stormlight hasta redesplegar la imagen nueva: aceptable (la lista nace vacía).

**Rollback con campañas `mistborn` existentes (F2 en adelante).** Con la imagen `:prev` las campañas `mistborn` quedan en **solo
lectura efectiva**: sus personajes se leen (las columnas nuevas se ignoran) pero cualquier `PUT` devuelve 400
(`Invalid Ascendencia`/`CaminoRadiante`: `ValidateCaminos` de la imagen anterior solo conoce `Humano`/`Oyente`,
`CharacterService.cs:12-33`) y no se pueden crear campañas Bruma. Es el comportamiento esperado, no corrupción: los datos de
`CaminoMetal`, `Poderes`, `Recursos` y `Bendiciones` siguen en BD y vuelven a funcionar al redesplegar la imagen nueva. La campaña
Stormlight no se ve afectada.

### 4.4 Compatibilidad con datos existentes

- Campañas: `World='stormlight'`, `Era=NULL` por `DEFAULT`; `WorldRulesProvider.Get(null | desconocido)` devuelve Stormlight.
- Personajes: `CaminoMetal=''`, `Poderes='[]'`, `Recursos='{}'`, `Bendiciones='{}'` → `MapToResponse` produce los mismos ocho
  `StatDesglose` que hoy y `DerivadosSet` vacío (verificable con T02).
- Clientes antiguos (PWA cacheada): `POST /campaigns {name}` crea Stormlight; `GET /catalog/*` sin `campaignId` devuelve
  Stormlight; `PUT` de personaje sin `caminoMetal/poderes/recursos/bendiciones` (anulables) **no pisa** los valores guardados;
  `GET /global-npcs` sin `campaignId` devuelve Stormlight.
- Catálogo y PNJ existentes quedan `stormlight`; opciones compartidas pasan a `cosmere` (siguen devolviéndose a Stormlight porque
  el filtro es `World IN ('cosmere', @world)`). Diario sembrado con `CampaignId = 1` (`20260526130330_AddDiaryEntries.cs`) sigue
  en
  una campaña Stormlight.

## 5. Contrato API

### 5.1 DTOs (propiedades exactas; al final del bloque indicado, sin reordenar; en `CharacterResponse`, después de `Metas` `:98` y antes de `CreatedAt`/`UpdatedAt` `:100-101`; la `:99` está en blanco)

| Clase (fichero) | Añadir |
|---|---|
| `CreateCampaignRequest` (`Messages/Campaigns/In/CreateCampaignRequest.cs:3-6`) | `public string World { get; set; } = WorldIds.Stormlight; public string? Era { get; set; }` |
| `CampaignResponse`, `CampaignDetailResponse` (`Messages/Campaigns/Out/CampaignResponse.cs:3-22`) | `public string World { get; set; } = WorldIds.Stormlight; public string? Era { get; set; }` |
| `CreateCharacterRequest` (`Messages/Characters/In/CharacterRequest.cs:3-12`) | `public string CaminoMetal { get; set; } = string.Empty; public string CaminoInicial { get; set; } = string.Empty;` |
| `UpdateCharacterRequest` (`:19-98`) | `public string? CaminoMetal { get; set; } public string? CaminoInicial { get; set; } public List<PoderPersonaje>? Poderes { get; set; } public List<string>? Bendiciones { get; set; } public List<ClavoHemalurgico>? Clavos { get; set; }` (`null` ⇒ conservar; `Clavos` lo añadió T49a y solo lo escribe el director: `RestringirCambiosNoGm` lo anula para el jugador). **No** incluye `Recursos` ni los campos de mesa de los poderes: ver 5.2. `Poderes` del `PUT` solo escribe `Arte, Metal, Origen, MetaId` (**no** `AjusteCargasMax`, que es estado de mesa y va por `PATCH …/recursos`); para un poder **ya existente** por `(Arte, Metal)` el servidor conserva `Completo`, `Cargas`, `AjusteCargasMax`, `Viales` y `Desprovisto` del valor guardado (los PUT de bolsa y talentos envían el personaje cacheado completo, `BolsaDetailPage.tsx:184-196`, `TalentosDetailPage.tsx:179,199`, `CharacterDetailPage.tsx:481,490`, y pisarían un `Completo = true` puesto por T14 o por `PATCH`); un poder **nuevo** nace con `Completo = (Origen != "camino") \|\| (Arte == "alomancia" && Metal == "atium")`, `MetaId` del cuerpo solo si `Origen == "camino"` (si no, `null`), `Cargas = (Origen == "medallon" ? 8 : 0)` (la DJ elige las cargas iniciales del medallón, casi siempre 8, y puede bajarlas a 0..8 con `PATCH recursos` al concederlo, L.293 / PDF 299), `AjusteCargasMax/Viales = 0`, `Desprovisto = false`. El valor de `Completo` que llegue en el cuerpo **se ignora y se normaliza** (no se rechaza, P6). `Completo` solo cambia por `PATCH …/recursos { completo }` o por T14 |
| `CharacterResponse` (`Messages/Characters/Out/CharacterResponse.cs`, después de `Metas` `:98`, antes de `CreatedAt` `:100`; `DesvioCalculado` del WIP está en `:44`) | `public string CaminoMetal { get; set; } = string.Empty; public string CaminoInicial { get; set; } = string.Empty; public List<PoderPersonaje> Poderes { get; set; } = []; public Dictionary<string, decimal> Recursos { get; set; } = new(); public List<string> Bendiciones { get; set; } = []; public Dictionary<string, StatDesglose> DerivadosSet { get; set; } = new(); public Dictionary<string, int> BonosAtributos { get; set; } = new(); public List<ClavoHemalurgico> Clavos { get; set; } = [];` (`Clavos`: T49a, tras `BonosAtributos`. `BonosAtributos`: claves `fuerza velocidad intelecto voluntad discernimiento presencia`, salida de `world.BonosAtributos(...)` sin ceros; vacío si no hay bonos. En Stormlight contiene el bono de forma de cantor del WIP, pero **la ficha y el tirador solo lo consumen cuando `features.bonosServidor` es `true`** (capacidad propia de `WorldConfig`, §7.1: Mistborn desde T29/T43; Stormlight la pone a `true` en T50): así en Mistborn los totales de atributo, los bonus de habilidad y el modificador de tirada incluyen Bendiciones, Tamaño desmedido y Guardián del conocimiento, y en Stormlight nada cambia hasta T50 (P1) → Q22) |
| `StatLinea` (`Messages/Characters/Out/StatDesglose.cs:3-8`) | `public bool EsBono { get; set; }` al final de la clase (T11): `true` en las líneas de bono de atributo de cualquier origen (forma de cantor, Bendición, Tamaño desmedido, Guardián del conocimiento, clavos), que `CharacterService.Build*Lineas` marca al construirlas (§6.2 fila `:210-298`); la ficha la usa en lugar de reconocer el concepto por texto (§7.4 regla 3). Viaja en el JSON como `esBono`; el comparador de T02 la descarta (§1 «Protocolo», punto 5) |
| `RecursosRequest`, `PoderRecursosRequest`, `BeberVialRequest`, `InicioEscenaRequest` (nuevo `Messages/Characters/In/RecursosRequest.cs`, creado en T10 porque `AccionMesa.PatchRecursos` lo referencia; lo usa T13) | ver 5.2 |
| `WeaponCatalogResponse`, `ArmorCatalogResponse`, `GearItemResponse`, `CatalogOptionResponse` (`Messages/Catalog/Out`) | `public string World { get; set; } = WorldIds.Stormlight; public short? Era { get; set; } public bool IsRewardOnly { get; set; }`; `public double? Price { get; set; }` (arma, armadura); `public string? Category { get; set; }` (gear); opción solo `World` |
| `CreateWeaponRequest`, `CreateArmorRequest` (`Messages/Catalog/In/CreateCatalogRequests.cs`) | `public long? CampaignId { get; set; } public double? Price { get; set; } public bool IsRewardOnly { get; set; }` (`CampaignId` **anulable**: un cliente cacheado sigue creando armas Stormlight) |
| `GlobalNpcResponse` (`Messages/GlobalNpcs/Out`) | `public string World { get; set; } = WorldIds.Stormlight;` (**solo la respuesta**: `GlobalNpcRequest` no lleva `World`; el mundo lo fija el servidor desde la campaña de `?campaignId=`, §5.2) |

```csharp
// Messages/Characters/In/RecursosRequest.cs
public class RecursosRequest
{
    public Dictionary<string, decimal>? Recursos { get; set; }      // solo las claves presentes se escriben
    public List<PoderRecursosRequest>? Poderes { get; set; }
}
public class PoderRecursosRequest
{
    public required string Arte { get; set; } public required string Metal { get; set; }
    public int? Cargas { get; set; } public int? Viales { get; set; } public bool? Desprovisto { get; set; } public bool? Completo { get; set; }
    public int? AjusteCargasMax { get; set; }   // Componedor: solo <= 0, recortado a >= -(cargasMax sin ajuste) (L.155 / PDF 161)
}
public class BeberVialRequest { public List<string> Metales { get; set; } = []; }   // ids de metal del vial
public class InicioEscenaRequest { public bool Sorprendido { get; set; } }
```

### 5.2 Endpoints

| Ruta | Verbo | Permiso | Cambio |
|---|---|---|---|
| `/campaigns` | POST | usuario | Lee `World`/`Era`; `ArgumentException` (400 vía `API/Internals/ExceptionMiddleware.cs:27`) si `!reglas.Existe(request.World)` (`IWorldRulesProvider.Existe`: los mundos válidos son las `IWorldRules` registradas, §6.1); `campaign.Era = reglas.Get(request.World).NormalizarEra(request.Era)` (`StormlightRules` devuelve `null` siempre; `MistbornRules` exige `era1 \| era2` y lanza `ArgumentException` si no, §6.1). `CampaignService` no nombra ningún mundo ni era. Respuesta con ambos. |
| `/campaigns`, `/campaigns/{id}`, `/campaigns/join` | GET/GET/POST | miembro | Devuelven `world`, `era` (proyección `Services/Campaigns/CampaignService.cs:17-33`, detalle `:48-62`, join `:115`). |
| `/campaigns/{cid}/characters` (POST), `…/{id}` (PUT, GET, assign) | — | igual que hoy | `world.ValidarIdentidad(...)` sustituye `ValidateCaminos` (`CharacterService.cs:79`, `:118`); `MapToResponse(c, world, ctx)`; bloqueo no-GM (`:111-116`): el núcleo conserva `request.Name = character.Name` y `request.CaminoHeroico = character.CaminoHeroico` como hoy y, a continuación, llama al hook `world.RestringirCambiosNoGm(request, character)` (§6.1; `CharacterService` solo lo llama): `StormlightRules` hace `request.CaminoRadiante = character.CaminoRadiante` (el bloqueo actual, movido tal cual en T10); `MistbornRules` (T12) fija `request.CaminoMetal = character.CaminoMetal` y `request.CaminoInicial = character.CaminoInicial` (`CaminoInvestidoLoCambiaElDirector = true`: Xavi decidió el 4 de octubre de 2026 que, por ahora, solo el director cambia el camino de nacido del metal, aunque el libro permita tomarlo en cualquier nivel, L.128 / PDF 134 → Q6) y aplica el bloqueo de Bendiciones y la reinyección de poderes (Q16, P6): `if (character.Bendiciones.Count > 0) request.Bendiciones = null; else if (request.Bendiciones is { Count: > 1 }) throw new UnauthorizedAccessException("Only the GM can grant a second blessing."); if (request.Poderes is not null) { var existentes = CharacterJson.ParsePoderes(character.Poderes); if (request.Poderes.Any(p => !existentes.Any(e => e.Arte == p.Arte && e.Metal == p.Metal))) throw new UnauthorizedAccessException("Only the GM can add powers."); foreach (var e in existentes.Where(e => !request.Poderes.Any(p => p.Arte == e.Arte && p.Metal == e.Metal))) request.Poderes.Add(e); }` (desde Q6 un jugador no GM no puede añadir **ni quitar** ningún poder, sea del camino o concedido por el DJ: el camino de nacido del metal y sus metales los asigna el director; los poderes que falten en su lista cacheada se reinyectan antes de fusionar, igual que se conserva `Bendiciones`; sin esto, un `PUT` de Bolsa o Talentos con una copia cacheada anterior a la concesión de un clavo lo borraría en silencio junto con su Investidura. Lo único que un no-GM cambia en un poder por `PUT` es `metaId`, al crear su meta de nacido del metal (§7.6); el resto del estado va por `PATCH …/recursos`. La 2.ª Bendición es una recompensa de rango 3, L.35 / PDF 41; clavos, aleación de lerasium y medallones son recompensas del DJ, L.288 / PDF 294). `CaminoInicial` se bloquea igual que `CaminoMetal`, dentro de `MistbornRules.RestringirCambiosNoGm`, porque decide el grado gratuito y el talento principal (Q6, Q7). **Normalización de `CaminoInicial` (P6, antes de `ValidarIdentidad`)**: el `OptionPicker` de la ficha incluye siempre «— Sin selección —» (`CharacterDetailPage.tsx:99-106`, `onChange('')`) y el picker heroico escribe `caminoHeroico` **y reescribe `talentos`** (`:1266-1277`; en `:1274-1276` guarda explícitamente el talento principal del camino anterior y añade el del nuevo), así que el GM puede borrar el camino heroico de un personaje con `caminoInicial:"heroico"` y el `PUT` llega con `caminoHeroico: ""` y `talentos` ya reescritos (el servidor **no toca `Talentos`**: solo normaliza `CaminoInicial`); sin normalizar, todo `PUT` posterior (también los de Bolsa y Talentos de un jugador, que reenvían `caminoInicial`) devolvería 400 para siempre. En `UpdateCharacterAsync`: `var ci = request.CaminoInicial ?? character.CaminoInicial; var cm = request.CaminoMetal ?? character.CaminoMetal; if (ci == "heroico" && request.CaminoHeroico == "") ci = cm != "" ? "metal" : ""; if (ci == "metal" && cm == "") ci = request.CaminoHeroico != "" ? "heroico" : ""; request.CaminoInicial = ci;` y `ValidarIdentidad` solo rechaza (400) valores fuera de `{"", "heroico", "metal"}` (§5.3). En la creación (`POST`) se aplica la misma normalización sobre `request.CaminoInicial`/`request.CaminoMetal`/`request.CaminoHeroico`. `PUT` con `Poderes` no nulo: valida la lista **fusionada** (5.3), conserva `Completo/Cargas/AjusteCargasMax/Viales/Desprovisto` de los poderes ya existentes por `(Arte, Metal)`, los nuevos toman los valores iniciales de 5.1. Tras `ValidarIdentidad`, **`UpdateCharacterAsync` (no las reglas del mundo) comprueba `MetaId`**: `var metaIds = poderes.Where(p => p.MetaId is not null).Select(p => p.MetaId!.Value).Distinct().ToList(); if (metaIds.Count > 0 && await db.Metas.CountAsync(m => m.CharacterId == characterId && metaIds.Contains(m.Id)) != metaIds.Count) throw new ArgumentException("Invalid metaId in poderes: the meta must belong to this character.");` (las reglas de mundo son singleton sin BD, §6.1, y `UpdateCharacterAsync` carga el personaje sin `Include(Metas)`, `CharacterService.cs:103-105`, así que `character.Metas.Any(...)` daría 400 siempre; nota: por ese mismo motivo la respuesta del `PUT` ya devuelve hoy `metas: []`, comportamiento previo que no cambia). |
| `/campaigns/{cid}/characters/{id}/recursos` | PATCH (nuevo) | dueño o GM (misma regla que el `PUT`, `CharacterService.cs:108-109`) | Implementación (§6.1): `CharacterService` abre la transacción, bloquea la fila, comprueba permisos, calcula `estado = MapToResponse(c, world)` y llama a `world.AplicarAccionMesa(c, new AccionMesa.PatchRecursos(body, isGm), estado)`; **las reglas de esta fila las aplica `MistbornRules`** (T13); `StormlightRules` lanza `ArgumentException("Table action not available in this world.")` → 400 en las tres acciones de mesa (`recursos`, `beber-vial`, `inicio-escena`). Aplica solo lo no nulo. `investiduraActual` recortada a `[0, investidura.total]` (calculada con `MapToResponse`); `cargas` a `[0, cargasMax del poder]`; `cargas > 0` sobre un poder **feruquímico con `Completo == false`** → 400 (un poder naciente no tiene mente de metal y no almacena ni decanta cargas, L.162 / PDF 168; los poderes con `Origen != "camino"` nacen completos y no se ven afectados); para poderes con `Origen == "medallon"`, un **no-GM solo puede reducir** `cargas` (aumentarlas → 403; almacenar en un medallón no genera cargas y la recarga es sustituirlo, L.293 / PDF 299); `ajusteCargasMax` solo `<= 0` y recortado a `>= -(cargasMax sin ajuste)` (Componedor, L.155 / PDF 161); `viales`, `cuentasAtium`, `arquillas` `>= 0`; claves fuera de `RecursosPermitidos` → 400; poder `(Arte, Metal)` inexistente → 404 (`KeyNotFoundException`). **Concurrencia**: los tres endpoints de esta tabla (`recursos`, `beber-vial`, `inicio-escena`) leen la fila, modifican los JSON `Recursos`/`Poderes` y reescriben la columna entera; dos `PATCH` simultáneos con claves distintas (Investidura actual desde un dispositivo y cuentas de atium desde otro) se pisarían. Se ejecutan en una transacción que bloquea la fila, **con los mismos filtros y el mismo 404/403 que el `PUT`** (`CharacterService.cs:103-109`): `await using var tx = await db.Database.BeginTransactionAsync(); var c = await db.Characters.FromSqlInterpolated($"SELECT * FROM \"Characters\" WHERE \"Id\" = {characterId} AND \"CampaignId\" = {campaignId} AND NOT \"IsNpc\" FOR UPDATE").FirstOrDefaultAsync() ?? throw new KeyNotFoundException("Character not found."); if (!isGm && c.OwnerId != userId) throw new UnauthorizedAccessException("You can only edit your own character."); … await db.SaveChangesAsync(); await tx.CommitAsync();`. **Nunca `FirstAsync()`**: sin filas lanza `InvalidOperationException`, que `ExceptionMiddleware.cs:28` mapea a **409 Conflict**, no al 404 prometido; y sin el filtro `CampaignId`/`IsNpc` un GM de la campaña A (que pasa `EnsureMemberAsync`/`IsGmAsync` sobre A) podría parchear por id un personaje de la campaña B. **No** introducir `xmin`/`[ConcurrencyCheck]` como token global: haría fallar con 500 a los `PUT` existentes (ninguna entidad tiene token hoy, `CosmereContext.cs:28-213`, y `ExceptionMiddleware.cs:23-30` no mapea `DbUpdateConcurrencyException`). Devuelve `CharacterResponse`. |
| `…/{id}/acciones/beber-vial` | POST (nuevo) | dueño o GM | `world.AplicarAccionMesa(c, new AccionMesa.BeberVial(Metales), estado)` (reglas en `MistbornRules`; Stormlight → 400). L.129-130 / PDF 135-136: 400 si el personaje no tiene ningún poder alomántico. `Metales` llega del cliente **tal cual**: los 8 comunes vienen preseleccionados en la UI pero el director puede desmarcarlos (el libro da por supuesto que los viales de metales raros también contienen «los que el alomante desee» de los comunes, L.130 / PDF 136 y L.267 / PDF 273 → Q17); el servidor no los añade. Para cada poder alomántico **distinto de atium** `Desprovisto = !Metales.Contains(Metal)`; por cada metal raro incluido con `Viales > 0` → `Viales--` (nunca 409: el recuento de viales es discreción del DJ, L.130 / PDF 136). Investidura: **solo si** algún poder alomántico (no atium) del personaje usa un metal de `Metales`, `Recursos["investiduraActual"] = investidura.total`; si no, se conserva («Si el vial contiene un metal que puedes quemar, recuperas Investidura hasta tu valor máximo», L.129 / PDF 135). **Atium queda fuera de la regla**: `Metales` no puede contener `"atium"` (400); `alomancia:atium` se ignora al calcular `Desprovisto` y al decidir si se restaura la Investidura [inferido a partir de L.176 / PDF 182: «el atium no aumenta tu Investidura actual; debes llevar el registro de tus cuentas de atium de forma independiente a tus viales metálicos»; su alomancia no tiene versión naciente, L.177 / PDF 183]. Las cuentas de atium se gestionan solo con `recursos.cuentasAtium`. Devuelve `CharacterResponse`. |
| `…/{id}/acciones/inicio-escena` | POST (nuevo) | dueño o GM | `world.AplicarAccionMesa(c, new AccionMesa.InicioEscena(Sorprendido), estado)` (reglas en `MistbornRules`; Stormlight → 400). `Recursos["investiduraActual"] = Math.Min(Sorprendido ? 1 : total, total)` con `total = investidura.total` (L.129 / PDF 135). 400 si el mundo no tiene la clave `investiduraActual` o si `total == 0` (personaje sin Investidura, p. ej. feruquimista puro). **Desprovisto (Q24)**: con `Sorprendido == false`, además de reponer la Investidura, pone `Desprovisto = false` en los poderes alománticos (no atium) cuyo metal sea común (`MistbornData.MetalesComunes`), porque el libro presupone que «si no estás Sorprendido al empezar una escena, ya te has bebido un vial por puro instinto» (L.129 / PDF 135) y un vial estándar contiene los 8 comunes (L.130 / PDF 136) [inferido → Q24]; los raros conservan su estado (su suministro se controla con `viales`). Con `Sorprendido == true` no se toca ningún `Desprovisto`. |
| `/campaigns/{cid}/characters/{id}/metas/{metaId}/conclude` (existente) | POST | igual | `MetaService` resuelve el mundo de la campaña (`MetaService(CosmereContext db, IWorldRulesProvider reglas)`, T14) y, tras guardar la conclusión con **cualquier** `TipoConclusion` válido (`exito \| crecimiento \| fracaso`, decisión (l), Q20, L.284 / PDF 290), llama al hook `world.AlConcluirMeta(character, meta)` y guarda: solo `MistbornRules` lo implementa (marca `Completo = true` en los poderes con `MetaId == meta.Id`, T12); `StormlightRules` es no-op, así que `MetaService` no contiene lógica de `Poderes` y Stormlight no cambia. `MetaService.DeleteMetaAsync` (`:69-74`): tras borrar, `world.AlBorrarMeta(character, meta)` (Mistborn: `MetaId = null` en los poderes que la enlazaban; Stormlight no-op). |
| `/catalog/weapons\|armor\|gear`, `/catalog/options/{category}` | GET | usuario | `[FromQuery] long? campaignId` → mundo y era de la campaña (debe ser miembro; 403 si no); sin él, `stormlight` sin filtro de era. Objetos: `World = @world AND (Era IS NULL OR @era IS NULL OR Era = @eraNum)` con `@eraNum` = 1 \| 2. Opciones: `World IN ('cosmere', @world)` (`WorldIds.Cosmere`: lo compartido pertenece al universo Cosmere, P8). |
| `/catalog/weapons\|armor` POST (`CampaignId` en el body), `/catalog/{tipo}/{id}?campaignId=` DELETE, `/catalog/{tipo}/{id}/description?campaignId=` PUT (`[FromQuery] long? campaignId`; no existe DELETE de gear) | — | **GM de `campaignId`** cuando llega (403 si no, con `JwtHelper.GetUserId(User)` pasado a `CatalogService`, que hoy no recibe `userId`, `CatalogService.cs:9-35`); además el objeto debe tener `World` igual al de la campaña (404 si no). Sin él, comportamiento actual (`[Authorize]`, `CatalogController.cs:11-13`) | Alta fija `World` al de la campaña, `IsCustom=true`. **Sin cambio visible en Stormlight (Q9):** la UI ya restringe crear, borrar y editar descripciones al GM (`CatalogPage.tsx:913` `actions={isGm && …}`, `:276` `isGm && isCustom`, `:435` `isGm && !editing`); el hueco es solo de API (llamadas directas con el JWT) y T39b lo cierra en servidor. La UI sigue mostrando esos controles únicamente al GM, en ambos mundos. |
| `/global-npcs`, `/global-npcs/{id}` | GET/POST/PUT/DELETE | usuario (miembro de `campaignId` cuando llega) | `[FromQuery] long? campaignId` en los cuatro verbos (como el catálogo): el mundo es el de la campaña (miembro; 403 si no lo es; 404 si la campaña no existe) y **nunca viaja en el cuerpo** (`GlobalNpcRequest` no lleva `World`; lo fija el servidor). `GET` de la lista sin `campaignId` → `stormlight` (cliente cacheado). `POST …?campaignId=` → `World` = mundo de la campaña (`FromRequest`, `GlobalNpcService.cs:41`; sin `campaignId`, `stormlight`). `PUT …/{id}?campaignId=` y `DELETE …/{id}?campaignId=` → 404 si el PNJ tiene un `World` distinto del de la campaña; `Apply` (`:56-69`) **no toca `World`** (un `PUT` de un cliente cacheado no puede revertir un PNJ `mistborn` a `stormlight`). `GET …/{id}` por id, sin filtro (la ficha del PNJ se abre por id; el gate de mundo lo pinta el cliente, T42b). `GlobalNpcService` recibe `userId` (`JwtHelper.GetUserId(User)`) y comprueba la pertenencia con la misma consulta de `CampaignMembers` que `CatalogService` (T39b). `GlobalNpcResponse.World` sí se devuelve. |

### 5.3 Validaciones por mundo (`IWorldRules.ValidarIdentidad`; `ArgumentException` → 400; mensajes en inglés con el valor recibido, estilo actual `Invalid CaminoMetal: '…'.`)

| Mundo | Caminos heroicos | Camino Investido y `CaminoInicial` | Ascendencias | `Poderes` | `Bendiciones` | `Recursos` |
|---|---|---|---|---|---|---|
| stormlight | `agente cazador enviado erudito guerrero lider` | `CaminoRadiante` ∈ 10 ids actuales (`CharacterService.cs:17-21`); `CaminoMetal == ""`; `CaminoInicial == ""` | `Humano`, `Oyente` (se conserva la inconsistencia con `FormasCantor.AscendenciasCantor`, `FormasCantor.cs:27-28`; no es de este proyecto → §13) | `[]` | `[]` | claves ∈ `[]` |
| mistborn | los mismos 6 (L.19 / PDF 25) | `CaminoMetal` ∈ `brumoso nacido-de-la-bruma feruquimista ferrin nacidoble`; `CaminoRadiante == ""`; `CaminoInicial ∈ {"", "heroico", "metal"}` (400 solo fuera de ese conjunto). La coherencia `"metal"` ⇒ `CaminoMetal != ""` y `"heroico"` ⇒ `CaminoHeroico != ""` **no se rechaza: la normaliza `CharacterService` antes de validar** (§5.2, P6; si el camino correspondiente se ha borrado, `CaminoInicial` pasa al otro camino si existe o a `""`) | `Humano`, `Kandra`, `Sangre koloss` (L.32-39 / PDF 38-45); `Kandra` con `CaminoMetal != ""` → 400 (L.18 / PDF 24); `Sangre koloss` con `CaminoMetal` ∈ {`nacido-de-la-bruma`, `feruquimista`} → 400 (sus talentos principales exigen ascendencia humana, L.141 / PDF 147; L.146 / PDF 152; brumoso, ferrin y nacidoble admiten sangre koloss, L.135 / PDF 141, L.150 / PDF 156, L.155 / PDF 161) | Sobre la lista **fusionada**: `Arte ∈ {alomancia, feruquimia}`; `Metal` ∈ 17 ids; sin duplicados `(Arte, Metal)`; `Origen` ∈ 4 valores (400 en los cuatro casos anteriores). **Compatibilidades de origen** (400 en cada caso): `Origen == "lerasium"` exige `Arte == "alomancia"` y `Metal != "atium"` (la aleación de lerasium da el poder alomántico del metal aleado, L.295 / PDF 301); `Origen == "medallon"` exige `Arte == "feruquimia"` y `Metal` ∉ {`atium`, `nicrosil`} (los medallones son solo feruquímicos, L.293 / PDF 299; tabla «Poderes de los medallones feruquímicos» sin atium y con nicrosil «no disponible para personajes jugadores», L.294 / PDF 300). Limitación v1 [inferido]: no se modela que un medallón lleve hasta 3 poderes ni que solo se use uno a la vez (§13). **Se normalizan en servidor, no se rechazan** (P6): `FusionarPoderes` fija `Completo = true` y `MetaId = null` cuando `Origen != "camino"` (L.290 / PDF 296; L.295 / PDF 301; medallón [inferido]) y `Completo = true` para `alomancia:atium` (L.177 / PDF 183), así que `ValidarIdentidad` recibe una lista en la que esas invariantes ya se cumplen. `MetaId`, si no es `null`, debe existir en `Metas` con `CharacterId == character.Id` (400 si no); **lo comprueba `CharacterService.UpdateCharacterAsync`, no las reglas del mundo** (§5.2, §6.2 fila `:118`) | ⊆ 5 ids; `Count <= 2`; **sin duplicados** (`Distinct().Count() == Count`, «debes elegir una distinta a la primera», L.35 / PDF 41); no vacío solo si `Ascendencia == "Kandra"` | claves ∈ `investiduraActual cuentasAtium arquillas`; valores ≥ 0 |

El servidor **no** valida era (es inmutable desde la creación; la UI solo filtra opciones), exclusividad de caminos (va en
`CaminoMetal` único por construcción),
prerrequisitos, presupuesto de puntos, nivel ni número de poderes (como hoy no valida nivel ni atributos; informe API §3).

### 5.4 Espejo en `src/types/index.ts` (fichero con cambios sin commitear: anclar por texto)

```ts
import type { AttrField } from '../worlds/types'   // §7.1 (T06b)
export type WorldId = 'stormlight' | 'mistborn'
export type Era = 'era1' | 'era2'
export interface Campaign { /* actuales */ world: WorldId; era: Era | null }            // ídem CampaignDetail
export interface StatLinea { /* actuales: concepto, valor, descripcionCondicion */ esBono: boolean }   // §5.1: línea de bono de atributo marcada por el servidor
export interface PoderPersonaje {
  arte: 'alomancia' | 'feruquimia'; metal: string; origen: 'camino' | 'clavo' | 'lerasium' | 'medallon'
  completo: boolean; metaId: number | null; cargas: number; ajusteCargasMax: number; viales: number; desprovisto: boolean
}
export interface Character { /* actuales */
  caminoMetal: string; caminoInicial: '' | 'heroico' | 'metal'; poderes: PoderPersonaje[]; recursos: Record<string, number>; bendiciones: string[]
  derivadosSet: Record<string, StatDesglose>; bonosAtributos: Partial<Record<AttrField, number>>
}
export type CreateCharacterRequest = Pick<Character, /* actuales */ | 'caminoMetal' | 'caminoInicial'>
export type UpdateCharacterRequest = Omit<Character, /* actuales, incluido 'desvioCalculado' del WIP */ | 'recursos' | 'derivadosSet' | 'bonosAtributos'>   // poderes, bendiciones y caminoInicial sí viajan
export interface RecursosPatch { recursos?: Record<string, number>; poderes?: { arte: string; metal: string; cargas?: number; viales?: number; desprovisto?: boolean; completo?: boolean; ajusteCargasMax?: number }[] }
export interface WeaponCatalog { /* actuales */ world: WorldId; era: 1 | 2 | null; price: number | null; isRewardOnly: boolean }  // ídem ArmorCatalog; GearItem añade category: string | null; CatalogOption añade world
export interface GlobalNpc { /* actuales */ world: WorldId }
```

`src/api/characters.ts` añade `patchRecursos(cId, id, body: RecursosPatch)`, `beberVial(cId, id, metales: string[])`,
`inicioEscena(cId, id, sorprendido: boolean)` y normaliza toda respuesta de personaje (`getById`, `getAll`, `update`,
`patchRecursos`, `beberVial`, `inicioEscena`) con `normalizeCharacter(c) => ({ ...c, caminoMetal: c.caminoMetal ?? '',
caminoInicial: c.caminoInicial ?? '', poderes: c.poderes ?? [], recursos: c.recursos ?? {}, bendiciones: c.bendiciones ?? [],
derivadosSet: c.derivadosSet ?? {}, bonosAtributos: c.bonosAtributos ?? {} })`, de modo que un frontend de F2+ contra una API
todavía sin T11 (worktrees paralelos en desarrollo) no rompa con `poderes.some(...)`/`poderes.length` (en producción api y web se
despliegan juntos, `deploy.sh:82-84`); `src/api/campaigns.ts:10-11` `create({ name, world, era })` y
`src/api/catalog.ts:28-46` acepta `campaignId`; `src/api/global-npcs.ts` `getAll(campaignId)`, `create(body, campaignId)`,
`update(id, body, campaignId)`, `delete(id, campaignId)` (`?campaignId=`, §5.2; el método se llama `delete` hoy,
`global-npcs.ts:17-18`).

### 5.5 Ejemplo de respuesta (fragmento de `CharacterResponse` de un brumoso de acero en campaña `mistborn`)

Caso de aceptación de T12: **nivel 6** (rango 2; grado máximo 3 en una habilidad, tabla «Progreso de los personajes», L.29 / PDF
35), VOL 2, INT 1, DIS 1, PRE 3, `HabilidadPersonalizada2 = "Alomancia"` (`VOL`; hueco cognitivo 2,
`ATRIBUTO_SLOTS['VOL'] = [2, 5]`) con valor 3, camino inicial brumoso (`caminoInicial: "metal"`, sin camino heroico), talentos
Investido y Portentoso aprendidos (Portentoso exige Investido, L.136 / PDF 142; ambos exigen la meta «Entrenar tu poder» completa,
L.75 / PDF 81, por eso `completo: true`). El caso de nivel 1 (Alomancia 2, sin talentos extra) se describe aparte en T12: en rango
1 el grado máximo es 2 y los talentos del árbol del camino están bloqueados hasta completar la meta. Es un **fixture numérico**:
omite por brevedad los talentos heroicos de ascendencia humana de los niveles 1 y 6 (L.32 / PDF 38), que el servidor no valida
(§5.3) y no alteran ningún valor calculado; no copiarlo como personaje «legal».

```json
{
  "caminoHeroico": "", "caminoRadiante": "", "caminoMetal": "brumoso", "caminoInicial": "metal", "ascendencia": "Humano", "level": 6,
  "habilidadPersonalizada2": "Alomancia", "habilidadPersonalizada2Valor": 3, "habilidadPersonalizada2Atributo": "VOL",
  "talentos": "[\"Investido\",\"Portentoso\"]",
  "investidura": { "total": 7, "unidad": null, "lineas": [{ "concepto": "Base", "valor": 2 }, { "concepto": "Presencia", "valor": 3 }, { "concepto": "Investido", "valor": 2 }], "situacional": [] },
  "poderes": [{ "arte": "alomancia", "metal": "acero", "origen": "camino", "completo": true, "metaId": 41,
                "cargas": 0, "ajusteCargasMax": 0, "viales": 0, "desprovisto": false }],
  "recursos": { "investiduraActual": 7, "cuentasAtium": 0, "arquillas": 12.5 },
  "bendiciones": [],
  "bonosAtributos": {},
  "derivadosSet": {
    "alomancia.modificador": { "total": 5, "unidad": null, "lineas": [{ "concepto": "Grados en Alomancia", "valor": 3 }, { "concepto": "Voluntad", "valor": 2 }], "situacional": [] },
    "alomancia.limite":      { "total": 3, "unidad": null, "lineas": [{ "concepto": "Grados en Alomancia", "valor": 3 }], "situacional": [] },
    "alomancia.dado":        { "total": 8, "unidad": "d",  "lineas": [{ "concepto": "Dado de artes metálicas", "valor": 8 }], "situacional": [] },
    "alomancia.alcance":     { "total": 48, "unidad": "m", "lineas": [{ "concepto": "Grados en Alomancia (3)", "valor": 24 }, { "concepto": "Portentoso", "valor": 24 }], "situacional": [] }
  }
}
```

Las líneas de `alomancia.alcance` suman al total (24 → 48 por el grado efectivo extra); `alomancia.limite` no cambia con
Portentoso; Investido suma el rango (2) a la Investidura máxima (L.136 / PDF 142). En Stormlight las siete propiedades nuevas
valen `""`, `""`, `[]`, `{}`, `[]`, `{}` y `{}` (o el bono de forma de cantor en `bonosAtributos`, que el cliente Stormlight no
consume hasta T50, Q22), y cada `StatLinea` lleva `esBono` (`true` solo en las líneas «Forma: …»; §5.1).

## 6. Motor de reglas en servidor

### 6.1 Interfaz, proveedor y registro

```csharp
// Services/Worlds/IWorldRules.cs
namespace Services.Worlds;
public sealed record IdentidadPersonaje(string CaminoHeroico, string CaminoRadiante, string CaminoMetal, string CaminoInicial, string Ascendencia,
                                        IReadOnlyList<PoderPersonaje> Poderes, IReadOnlyList<string> Bendiciones, IReadOnlyDictionary<string, decimal> Recursos,
                                        IReadOnlyList<ClavoHemalurgico>? Clavos = null);   // Clavos: añadido por T49a como último parámetro opcional
// Sin BD: la existencia de MetaId la comprueba CharacterService.UpdateCharacterAsync (§5.2, §6.2 fila :118)
public interface IWorldRules
{
    string Id { get; }
    string? NormalizarEra(string? era);                                          // T04 (B3): Stormlight → null siempre; Mistborn exige era1|era2 (ArgumentException → 400)
    IReadOnlyDictionary<string, List<ReglaTalento>> ReglasPropias { get; }      // reglas de talento del mundo: Roshar = potencias, órdenes y cantores; Scadrial = Resistencia koloss (§6.3)
    IReadOnlyDictionary<string, List<ReglaTalento>> ReglasTalentos { get; }     // efectivas = TalentosReglas.Efectivas(ReglasPropias): núcleo Cosmere + propias, en el orden del literal (§6.2 fila :56)
    IReadOnlySet<string> RecursosPermitidos { get; }
    bool CaminoInvestidoLoCambiaElDirector { get; }
    void ValidarIdentidad(IdentidadPersonaje id);                                // ArgumentException → 400
    void RestringirCambiosNoGm(UpdateCharacterRequest request, CharacterEntity character);   // bloqueo no-GM del mundo (§5.2): Stormlight CaminoRadiante; Mistborn CaminoMetal, CaminoInicial, Bendiciones y reinyección de poderes
    void AplicarAccionMesa(CharacterEntity c, AccionMesa accion, CharacterResponse estado);  // PATCH recursos, beber-vial, inicio-escena (§5.2); `estado` = MapToResponse previo (total de Investidura, cargasMax); Stormlight → ArgumentException (400)
    void AlConcluirMeta(CharacterEntity c, MetaEntity meta);                     // T14: Mistborn marca Completo en los poderes con MetaId == meta.Id; Stormlight no-op
    void AlBorrarMeta(CharacterEntity c, MetaEntity meta);                       // T14: Mistborn pone MetaId = null; Stormlight no-op
    IEnumerable<string> TalentosImplicitos(CharacterEntity c);                    // talentos autoGranted del cliente que el servidor debe contar (no se guardan en c.Talentos)
    bool TieneInvestidura(CharacterEntity c, IReadOnlyList<string> talentos, IReadOnlyList<PoderPersonaje> poderes);
    BonosForma BonosAtributos(CharacterEntity c, IReadOnlyList<string> talentos, out string? origen);   // reutiliza el record del WIP sin renombrar: BonosForma representa bonos de atributo de cualquier origen (forma de cantor, Bendición, talento, clavo), no solo de forma
    string EtiquetaBono(string? origen);                                         // Stormlight: $"Forma: {origen}"; Mistborn: origen ?? "Bendición"
    bool DesvioBonoSeAcumula { get; }
    Dictionary<string, StatDesglose> Derivar(CharacterEntity c, IReadOnlyList<string> talentos, IReadOnlyList<PoderPersonaje> poderes, BonosForma fb);
    // T49a (F7) añade, aditivo: void CompletarDesglose(CharacterEntity c, StatAfectada stat, StatDesglose d); Mistborn: líneas de clavos en Defensa espiritual; Stormlight: no-op
}
public abstract record AccionMesa                                                 // acciones de mesa (§5.2); el núcleo solo las encamina
{
    public sealed record PatchRecursos(RecursosRequest Cuerpo, bool EsGm) : AccionMesa;
    public sealed record BeberVial(IReadOnlyList<string> Metales) : AccionMesa;
    public sealed record InicioEscena(bool Sorprendido) : AccionMesa;
}
public interface IWorldRulesProvider { IWorldRules Get(string? worldId); bool Existe(string? worldId); }
public sealed class WorldRulesProvider(IEnumerable<IWorldRules> mundos) : IWorldRulesProvider
{
    private readonly Dictionary<string, IWorldRules> _porId = mundos.ToDictionary(s => s.Id);
    public IWorldRules Get(string? id) => id is not null && _porId.TryGetValue(id, out var s) ? s : _porId[WorldIds.Stormlight];
    public bool Existe(string? id) => id is not null && _porId.ContainsKey(id);   // fuente única de los mundos válidos (CampaignService, §5.2); WorldIds.EsValido queda como helper estático sin DI
}
```
Registro en `Services/Bootstrap.cs:19-35` (tres líneas, hoy solo hay `AddScoped`): `services.AddSingleton<IWorldRules,
StormlightRules>(); services.AddSingleton<IWorldRules, MistbornRules>(); services.AddSingleton<IWorldRulesProvider,
WorldRulesProvider>();`. Clases sin estado ni BD, por eso singleton. **Calendario**: T04 (F1) crea la interfaz **mínima** (`Id`,
`NormalizarEra`), el proveedor (`Get`, `Existe`) y las dos clases mínimas, y las registra, porque `CampaignService` (T05) ya
necesita `Existe` y `NormalizarEra`; T10 amplía la interfaz y `StormlightRules` con el resto de miembros y hace que
`MistbornRules` **delegue en una instancia privada de `StormlightRules`** en todos ellos (`private static readonly
StormlightRules Respaldo = new();`, comentario `// hasta T12`), de modo que una campaña `mistborn` se comporta exactamente como
Stormlight hasta T12, que sustituye la delegación por la implementación real (salvo `AplicarAccionMesa`, que implementa T13).
**Un tercer mundo no es «una clase y un id»**: haría falta una clase `XRules : IWorldRules` y su línea en `Bootstrap.cs`, el id en
`WorldIds.Todos` y en el `WorldId` de TS, los campos de identidad propios en `CharacterEntity` y en `IdentidadPersonaje` (que
hoy enumera los de los dos mundos: `CaminoRadiante`, `CaminoMetal`, `CaminoInicial`, `Poderes`, `Bendiciones`), un `WorldConfig`
en `src/worlds/x.ts` registrado en `WORLDS`, su `WorldData` con overlays, sus datos en `src/data/x/`, su seed de catálogo y,
si tiene temas propios, sus páginas de enciclopedia.

### 6.2 Dónde se invoca (archivo:línea del árbol de trabajo con WIP → cambio)

| Sitio | Cambio |
|---|---|
| `Services/Characters/CharacterService.cs:10` | `CharacterService(CosmereContext db, IWorldRulesProvider reglas)` (ctor primario). |
| `:12-33` | Los tres `HashSet` y `ValidateCaminos` se mueven **tal cual** a `StormlightRules.ValidarIdentidad` (mismos mensajes y orden). |
| `:37/:52/:68/:101/:137` (tras `Ensure*`) | `var world = await GetWorldRulesAsync(campaignId);` = `reglas.Get(await db.Campaigns.AsNoTracking().Where(c => c.Id == campaignId).Select(c => c.World).FirstOrDefaultAsync())`. |
| `:79` (creación; `character` aún no existe, se crea en `:81`, y `CreateCharacterRequest.CaminoMetal`/`CaminoInicial` no son anulables) | `world.ValidarIdentidad(new IdentidadPersonaje(request.CaminoHeroico, request.CaminoRadiante, request.CaminoMetal, request.CaminoInicial, request.Ascendencia, [], [], new Dictionary<string, decimal>()))`. |
| `:118` (actualización; valores **efectivos**: request o guardados) | **Antes**, la normalización de `request.CaminoInicial` de §5.2 (`heroico` sin camino heroico → `metal` o `""`; `metal` sin camino de nacido del metal → `heroico` o `""`). Después: `var poderes = CharacterJson.FusionarPoderes(CharacterJson.ParsePoderes(character.Poderes), request.Poderes); world.ValidarIdentidad(new IdentidadPersonaje(request.CaminoHeroico, request.CaminoRadiante, request.CaminoMetal ?? character.CaminoMetal, request.CaminoInicial ?? character.CaminoInicial, request.Ascendencia, poderes, request.Bendiciones ?? character.Bendiciones, CharacterJson.ParseRecursos(character.Recursos)))` (se valida la lista fusionada, §5.3). **Justo después** (tras `world.ValidarIdentidad`, en el servicio porque las reglas del mundo no tienen BD): `var metaIds = poderes.Where(p => p.MetaId is not null).Select(p => p.MetaId!.Value).Distinct().ToList(); if (metaIds.Count > 0 && await db.Metas.CountAsync(m => m.CharacterId == characterId && metaIds.Contains(m.Id)) != metaIds.Count) throw new ArgumentException("Invalid metaId in poderes: the meta must belong to this character.");` (`UpdateCharacterAsync` carga el personaje sin `Include(Metas)`, `:103-105`, así que no se usa `character.Metas`). |
| `:81-92` (creación) | `CaminoMetal = request.CaminoMetal, CaminoInicial = request.CaminoInicial`. |
| `:111-116` (bloqueo no-GM) | Se conservan `request.Name = character.Name` y `request.CaminoHeroico = character.CaminoHeroico` (núcleo); `request.CaminoRadiante = character.CaminoRadiante` se mueve **tal cual** a `StormlightRules.RestringirCambiosNoGm` y, en su lugar, el servicio llama a `world.RestringirCambiosNoGm(request, character)` (T10; mismos códigos de respuesta y JSON). `MistbornRules.RestringirCambiosNoGm` (T12) fija `CaminoMetal` y `CaminoInicial` al guardado (`CaminoInvestidoLoCambiaElDirector = true`), aplica el bloqueo de `Bendiciones` (primera libre, segunda solo GM) y la **reinyección** de los poderes guardados que falten en la lista del no-GM (bloque completo en §5.2, Q16). |
| `:172-199` (`ApplyUpdate`) | `if (r.CaminoMetal is not null) c.CaminoMetal = r.CaminoMetal; if (r.CaminoInicial is not null) c.CaminoInicial = r.CaminoInicial; if (r.Bendiciones is not null) c.Bendiciones = r.Bendiciones; if (r.Poderes is not null) c.Poderes = CharacterJson.SerializarPoderes(CharacterJson.FusionarPoderes(CharacterJson.ParsePoderes(c.Poderes), r.Poderes));` (`FusionarPoderes` conserva `Completo/Cargas/AjusteCargasMax/Viales/Desprovisto` de los existentes por `(Arte, Metal)`, fija los valores iniciales de los nuevos y normaliza `Completo`/`MetaId` según origen y atium, §5.1 y §5.3). |
| `:47/:63/:96/:122/:154` | `MapToResponse(c, world, ctx)`. |
| `:210-298` (`ConceptoForma` y `Build*Lineas`, WIP) | `ConceptoForma(forma) => $"Forma: {forma}"` (`:210`) etiqueta hoy toda línea de bono de atributo (`:220, :233, :251, :280, :293`); en Mistborn saldría «Forma: Bendición de la Consciencia». Parámetro opcional **al final** `string? etiquetaBono = null` en `BuildDefensaLineas`, `BuildConcLineas`, `BuildInvLineas`, `BuildSaludLineas` y `BuildDesvioLineas` (firmas finales al pie de esta sección); cada `ConceptoForma(forma)` pasa a `etiquetaBono ?? ConceptoForma(forma)`. La línea de Movimiento («… de {forma}», `:368`) no cambia. T10 introduce el parámetro con `null` (JSON de T02 idénticos). T11 marca además esas mismas líneas con `EsBono = true` (`StatLinea.EsBono`, propiedad nueva al final de la clase, §5.1): la ficha reconoce así los bonos de atributo de cualquier origen sin leer el texto del concepto (§7.4 regla 3); el comparador de T02 descarta `esBono`. |
| `:237-239` (`BuildInvLineas`, WIP) | Parámetro **obligatorio** al final `bool tieneInvestidura` (T10 lo pasa desde `world.TieneInvestidura(c, talentos, [])`, que en Stormlight es `!string.IsNullOrEmpty(c.CaminoRadiante)`: mismo resultado, JSON de T02 idénticos); `:239` → `if (!tieneInvestidura)`. El núcleo no conserva ningún respaldo a `CaminoRadiante`. |
| `:288` (`BuildDesvioLineas`, WIP) | Parámetro opcional `bool acumula = false`; `true` suma armadura + bono en lugar de tomar el mayor. |
| `:307` (`MapToResponse`, WIP) | Firma `MapToResponse(CharacterEntity c, IWorldRules world, ContextoJuego? ctx = null)`; tras `var talentos = ParseTalentos(c.Talentos)` (`:310`): `talentos = talentos.Union(world.TalentosImplicitos(c)).ToList();` (los `autoGranted` del cliente, como «Resistencia koloss», no se guardan en `c.Talentos`, `talentGraph.ts:672`, y `TalentosReglas.Calcular` hace `talentos.Contains(nombre)`, `TalentosReglas.cs:184`); `var poderes = CharacterJson.ParsePoderes(c.Poderes); var recursos = CharacterJson.ParseRecursos(c.Recursos);`; `var fb = world.BonosAtributos(c, talentos, out var forma); var etiqueta = world.EtiquetaBono(forma);`; `var tieneInv = world.TieneInvestidura(c, talentos, poderes);`; `BuildInvLineas(c, fb, forma, tieneInv, etiqueta)`; `BuildDesvioLineas(c, fb, forma, world.DesvioBonoSeAcumula, etiqueta)`; las otras tres `Build*Lineas` reciben `etiqueta`; cada `Calcular` recibe al final `reglas: world.ReglasTalentos, tieneInvestidura: tieneInv`; al construir la respuesta se recortan **solo en la salida** (no se persiste) `recursos["investiduraActual"]` a `[0, investidura.Total]` y cada `poder.Cargas` a `[0, cargasMax]` (si el máximo bajó después del `PATCH`, p. ej. por reducir PRE en el `PUT`); al final del inicializador: `CaminoMetal = c.CaminoMetal, CaminoInicial = c.CaminoInicial, Poderes = poderes, Recursos = recursos, Bendiciones = c.Bendiciones, DerivadosSet = world.Derivar(c, talentos, poderes, fb), BonosAtributos = fb.ComoDiccionario()`. `ComoDiccionario` es un **método de extensión en el fichero nuevo `Services/Worlds/BonosFormaExtensions.cs`** (no se edita `FormasCantor.cs`, regla del WIP): `internal static class BonosFormaExtensions { public static Dictionary<string, int> ComoDiccionario(this BonosForma fb) { var d = new Dictionary<string, int>(); void Add(string k, int v) { if (v != 0) d[k] = v; } Add("fuerza", fb.Fuerza); Add("velocidad", fb.Velocidad); Add("intelecto", fb.Intelecto); Add("voluntad", fb.Voluntad); Add("discernimiento", fb.Discernimiento); Add("presencia", fb.Presencia); return d; } }` (`Desvio` y `Concentracion` no se emiten: ya van como líneas de desglose). |
| `Services/Characters/TalentosReglas.cs:56` (`Reglas`, WIP) | **No se edita el literal.** Al final de la clase, aditivos (T10): `ClavesRoshar` (`HashSet<string>` con las seis reglas de potencias, órdenes y cantores de `:103-161` salvo `Investido`, `:110`: `Mente ambiciosa`, `Movimiento sin fricción`, `Posición de la enredadera`, `Posición de la sangre`, `Parada de tensión`, `Réplica fulminante`), `ReglasRoshar` (las entradas de `Reglas` cuyas claves están en `ClavesRoshar`), `ReglasCosmere` (las demás: Compostura, Robusto, Serenidad, Paso firme, Vestimenta tradicional, Presciencia, Investido) y `Efectivas(IReadOnlyDictionary<string, List<ReglaTalento>> propias)`, que recorre `Reglas` **en el orden del literal** y toma las claves de `ReglasCosmere` o de `propias`, añadiendo al final las de `propias` que no estén en `Reglas` (el orden del diccionario decide el orden de las líneas del desglose: para Stormlight, `Efectivas(ReglasRoshar)` reproduce `Reglas` clave a clave y los JSON de T02 no cambian). Las `List<ReglaTalento>` se comparten por referencia y nadie las muta: sin copia profunda. |
| `Services/Characters/TalentosReglas.cs:170` (`Calcular`) | Dos parámetros **obligatorios**: `IReadOnlyDictionary<string, List<ReglaTalento>> reglas, bool tieneInvestidura`, insertados **antes** de `unidad` (C# no admite parámetros obligatorios tras opcionales; única inserción no final del plan: T01 ya está commiteado y las ocho llamadas viven en `CharacterService`, que T10 actualiza); `:182` → `foreach (var (nombre, rs) in reglas)` **y** `:186` → `foreach (var regla in rs.Where(r => r.Stat == stat))` (hoy la variable de deconstrucción se llama `reglas` y `:186` la usa; al añadir el parámetro `reglas` hay que renombrar las dos líneas o no compila); `tieneInvestidura` se propaga a `EsActiva`. Sin respaldo a `Reglas` ni a `CaminoRadiante`. |
| `TalentosReglas.cs:214-224` (`EsActiva`) | `CondicionRegla.TieneInvestidura => tieneInvestidura` (parámetro obligatorio propagado desde `Calcular`; sin respaldo a `CaminoRadiante`). El enum existe (`:31`) y hoy ninguna regla del registro lo usa: el cambio es inocuo. |
| `TalentosReglas.cs:240-261` (`GradosDe`) | Rama por defecto: buscar `habilidad` en `HabilidadPersonalizada1..6` (comparación `OrdinalIgnoreCase` tras quitar tildes) y devolver su `Valor`. Hoy ninguna regla `PorHabilidad` nombra una personalizada: sin efecto en Stormlight. |
| `Services/Metas/MetaService.cs:9` (ctor) y `:53-67` (`ConcludeMetaAsync`) | `MetaService(CosmereContext db, IWorldRulesProvider reglas)` (T14). Tras guardar la conclusión (con cualquier `TipoConclusion` válido, decisión (l)): `var world = reglas.Get(await db.Campaigns.AsNoTracking().Where(c => c.Id == campaignId).Select(c => c.World).FirstOrDefaultAsync()); var ch = await db.Characters.FirstAsync(c => c.Id == characterId); world.AlConcluirMeta(ch, meta); await db.SaveChangesAsync();`. `MistbornRules.AlConcluirMeta` (T12): `var poderes = CharacterJson.ParsePoderes(c.Poderes); if (poderes.Any(p => p.MetaId == meta.Id)) { foreach (var p in poderes.Where(p => p.MetaId == meta.Id)) p.Completo = true; c.Poderes = CharacterJson.SerializarPoderes(poderes); }` (`CharacterJson` es la clase estática de §4.2, `Services.Characters`, mismo ensamblado); `StormlightRules.AlConcluirMeta` no hace nada. `MetaService` no contiene ninguna lógica de `Poderes`. |
| `Services/Metas/MetaService.cs:69-74` (`DeleteMetaAsync`) | Tras `Remove`: `world.AlBorrarMeta(ch, meta)` con el mismo patrón (Mistborn: `MetaId = null` en los poderes con `MetaId == meta.Id`, para que el `Switch` de `PoderCard` no enlace una meta inexistente; Stormlight no-op). |
| `Services/Campaigns/CampaignService.cs:9` (ctor) y `:65-72` | `CampaignService(CosmereContext db, IWorldRulesProvider reglas)`; `if (!reglas.Existe(request.World)) throw new ArgumentException($"Invalid World: '{request.World}'."); campaign.World = request.World; campaign.Era = reglas.Get(request.World).NormalizarEra(request.Era);` (sin literales de mundo ni de era en el servicio, T05); `:17-33`, `:48-62`, `:115` devolver ambos. |

**Firmas finales tras T10** (parámetros nuevos al final, en este orden, salvo los dos obligatorios de `Calcular`, que van antes de
`unidad`; T10 pasa `tieneInv` de Stormlight, `null` y `false` donde procede y los JSON de T02 no cambian; T12 pasa
`world.DesvioBonoSeAcumula` y `etiqueta`). Las firmas actuales son `BuildDefensaLineas(string
attr1, int valor1, string attr2, int valor2, int bonoForma, string? forma)` (`:212`) y
`(CharacterEntity c, BonosForma fb, string? forma)` en las otras cuatro (`:224`, `:237`, `:261`, `:288`):

```csharp
private static List<StatLinea> BuildDefensaLineas(string attr1, int valor1, string attr2, int valor2, int bonoForma, string? forma, string? etiquetaBono = null)
private static List<StatLinea> BuildConcLineas(CharacterEntity c, BonosForma fb, string? forma, string? etiquetaBono = null)
private static List<StatLinea> BuildInvLineas(CharacterEntity c, BonosForma fb, string? forma, bool tieneInvestidura, string? etiquetaBono = null)
private static List<StatLinea> BuildSaludLineas(CharacterEntity c, BonosForma fb, string? forma, string? etiquetaBono = null)
private static (List<StatLinea> Lineas, List<StatLinea> Situacional) BuildDesvioLineas(CharacterEntity c, BonosForma fb, string? forma, bool acumula = false, string? etiquetaBono = null)
// TalentosReglas.cs:170 (los dos obligatorios antes de los opcionales del WIP; las ocho llamadas de CharacterService los pasan)
public static StatDesglose Calcular(StatAfectada stat, List<StatLinea> baseLineas, CharacterEntity c, ContextoJuego ctx, List<string> talentos, IReadOnlyDictionary<string, List<ReglaTalento>> reglas, bool tieneInvestidura, string? unidad = null, List<StatLinea>? situacionalBase = null)
```

### 6.3 Implementaciones

**`StormlightRules`** (`Services/Worlds/StormlightRules.cs`): `ValidarIdentidad` = código actual +
`CaminoMetal != "" → ArgumentException` + `CaminoInicial != "" → ArgumentException` (§5.3 exige `CaminoInicial == ""` en
Stormlight; sin esta comprobación un `POST` con `caminoInicial:"metal"` quedaría guardado contra la decisión (j)) +
`Poderes.Count > 0` o `Bendiciones.Count > 0` o `Recursos.Count > 0 → ArgumentException`; `TieneInvestidura` =
`!string.IsNullOrEmpty(c.CaminoRadiante)`; `TalentosImplicitos → []`; `BonosAtributos` =
`FormasCantor.BonosActivos(c.Ascendencia, talentos)` y `origen = FormasCantor.EsCantor(c.Ascendencia) ?
FormasCantor.FormaActiva(talentos) : null` (envuelve el WIP); `EtiquetaBono(origen) => $"Forma: {origen}"` (idéntico a
`ConceptoForma`); `DesvioBonoSeAcumula = false`; `ReglasPropias = TalentosReglas.ReglasRoshar` y `ReglasTalentos =
TalentosReglas.Efectivas(ReglasRoshar)` (mismas claves y mismo orden que `Reglas`, §6.2 fila `:56`); `Derivar → new()`;
`RecursosPermitidos = []`; `CaminoInvestidoLoCambiaElDirector = true`; `NormalizarEra(_) => null`; `RestringirCambiosNoGm` =
`request.CaminoRadiante = character.CaminoRadiante` (el bloqueo actual de `:111-116`, movido tal cual); `AplicarAccionMesa` lanza
`ArgumentException("Table action not available in this world.")` (400 en `recursos`, `beber-vial` e `inicio-escena`);
`AlConcluirMeta`/`AlBorrarMeta` no hacen nada. **Cero cambio de comportamiento**, verificable con T02.

**`MistbornRules`** (`Services/Worlds/MistbornRules.cs`; listas en `MistbornData.cs`; tabla pura en `ArtesMetalicas.cs`):

| Miembro | Regla | Cita |
|---|---|---|
| `NormalizarEra` | `EraIds.EsValida(era) ? era : throw new ArgumentException($"Invalid Era: '{era}'.")` (`era1 \| era2` obligatoria; T04) | L.372 / PDF 378 |
| `ValidarIdentidad` | §5.3 | L.19 / PDF 25; L.18 / PDF 24; L.32-39 / PDF 38-45 |
| `RestringirCambiosNoGm` | `request.CaminoMetal = character.CaminoMetal; request.CaminoInicial = character.CaminoInicial;` + bloqueo de `Bendiciones` (primera libre, segunda solo GM) + reinyección de los poderes guardados que falten (bloque literal en §5.2; T12) | Q6, Q16; L.35 / PDF 41; L.288 / PDF 294 |
| `AplicarAccionMesa` | Las tres variantes de `AccionMesa` con las reglas de §5.2 (`PatchRecursos`: recortes, 400/403/404; `BeberVial`: Desprovisto y restauración de Investidura; `InicioEscena`: Investidura a máximo o 1 y limpieza de Desprovisto de los comunes); recibe `estado` (`MapToResponse` previo) para `investidura.Total` y `poder.<metal>.cargasMax` (T13) | L.129-130 / PDF 135-136; L.155 / PDF 161; L.293 / PDF 299 |
| `AlConcluirMeta` / `AlBorrarMeta` | `Completo = true` en los poderes con `MetaId == meta.Id`; `MetaId = null` al borrar (§6.2 filas `MetaService`; T12 implementa, T14 engancha) | L.132-133 / PDF 138-139; L.284 / PDF 290 |
| `TieneInvestidura` | `CaminoMetal ∈ {brumoso, nacido-de-la-bruma, nacidoble}` **o** algún poder con `Arte == "alomancia"` y `Origen ∈ {clavo, lerasium}`. El libro es más amplio: cualquier clavo que otorgue un poder alomántico **o feruquímico** da «la habilidad Alomancia o Feruquimia correspondiente y un valor de Investidura (si aún no lo tenías)» (L.290 / PDF 296; aleación de lerasium, L.295 / PDF 301); v1 la concede solo con `Arte == "alomancia"` [inferido: la feruquimia no usa reserva de Investidura, L.131 / PDF 137] → Q19. | L.26 / PDF 32; L.129 / PDF 135 |
| `TalentosImplicitos` | `c.Ascendencia switch { "Sangre koloss" => ["Resistencia koloss"], "Kandra" => ["Forma natural", "Disfraz kandra"], _ => [] }` (el cliente los marca `autoGranted` en `ascendencia:sangre-koloss` / `ascendencia:kandra` y no los guarda; sin esto un personaje Sangre koloss nunca recibiría +nivel de salud). Misma regla para cualquier otro talento `autoGranted` que una regla del servidor use. | L.38 / PDF 44; L.34 / PDF 40 |
| Forma natural (kandra) | Único talento de ascendencia con efecto en un derivado de la ficha: «Tu valor de desvío aumenta en 5 contra el daño por laceración» (vale también bajo Disfraz kandra). `BuildDesvioLineas` añade a `Situacional` (que ya existe, §6.2 fila `:288`) la línea «Forma natural: +5 contra daño por laceración» cuando `talentos` contiene «Forma natural» (vía `TalentosImplicitos`); **no suma al total**. El resto del talento (ignorar Perforante, lesión mínima 0, inmunidad emocional) es solo texto de enciclopedia; la línea situacional la implementa T12 (criterio de aceptación). | L.35 / PDF 41 |
| `ReglasPropias` / `ReglasTalentos` | `ReglasPropias = MistbornData.Reglas`, un diccionario **solo con las reglas del mundo**: `["Resistencia koloss"] = [new ReglaTalento { Stat = StatAfectada.MaxSalud, Formula = TipoFormula.PorNivel, Valor = 1, Condicion = CondicionRegla.Siempre, DescripcionCondicion = "Resistencia koloss: +1 salud por nivel" }]` (`ReglaTalento` es una clase con propiedades, `TalentosReglas.cs:41-49`); `ReglasTalentos = TalentosReglas.Efectivas(MistbornData.Reglas)` = núcleo Cosmere (Compostura, Robusto, Serenidad, Paso firme, Vestimenta tradicional, Presciencia, Investido, en el orden del literal) + Resistencia koloss. **Sin copia profunda**: las `List<ReglaTalento>` del núcleo se comparten por referencia entre los dos mundos y nadie las muta (una regla nueva de un mundo va siempre a su `ReglasPropias`, p. ej. las de T49a). Compostura, Robusto, Serenidad, Paso firme e Investido ya existen con el mismo efecto (L.80, 81, 89, 90, 136 / PDF 86, 87, 95, 96, 142). Las seis reglas de Roshar (`Movimiento sin fricción`, `Posición de la enredadera`, `Posición de la sangre`, `Parada de tensión`, `Réplica fulminante`, `Mente ambiciosa`, `TalentosReglas.cs:103-161`, salvo `Investido`, `:110`, que sí es Cosmere) **no entran** en Mistborn: ningún talento MB se llama así (0 apariciones en el manual). **`Vestimenta tradicional` sí existe en MB** (Enviado, especialidad Fiel, L.100 / PDF 106; regla en `TalentosReglas.cs:81-95`) con el mismo efecto (+2 Defensa física y espiritual con armadura Presentable o ropa apropiada) y se mantiene activa. **Nota (defecto previo, fuera de este proyecto → §13)**: el motor evalúa `LlevaArmaduraTipo` por el **nombre** de la armadura equipada (`TalentosReglas.cs:219-221`, `c.EquippedArmor.Contains("Presentable")`), no por sus `TraitIds`; hoy tampoco se activa en Stormlight con «Uniforme» (rasgo 80 Presentable solo en `TraitIds`, `20260410143041_SeedCatalogData.cs:117`). T40 siembra el rasgo 80 en Uniforme y Gabán de bruma solo por fidelidad al libro; **no** activa la regla del servidor y nadie la «arregla» dentro de este proyecto (P1). Ningún talento de los árboles de metal modifica salud, concentración, Investidura, defensas, movimiento ni desvío permanentes, salvo Investido (+rango Investidura) y los de atributo Guardián del conocimiento (INT +2) y Tamaño desmedido (FUE +1) (informe de alomancia §0, feruquimia §2.4). | L.38 / PDF 44 |
| `BonosAtributos` | Bendiciones (`c.Bendiciones`): `consciencia` DIS +2; `potencia` FUE +1, VEL +1; `presencia` INT +1, PRE +1; `estabilidad` VOL +2; `fortaleza` Desvío +1. Talento «Tamaño desmedido» FUE +1. Talento «Guardián del conocimiento» INT +2. `origen` = «Bendición de la Consciencia» (o lista separada por «, »; con talento, su nombre). Devuelve `BonosForma` (record del WIP) sin renombrar. | L.34-35 / PDF 40-41; L.39 / PDF 45; L.229 / PDF 235 |
| `EtiquetaBono` | `origen ?? "Bendición"` (sin el prefijo «Forma: » de `ConceptoForma`, §6.2 fila `:210-298`) | — |
| `DesvioBonoSeAcumula` | `true` [inferido] | L.35 / PDF 41 → Q8 |
| `RecursosPermitidos` | `investiduraActual`, `cuentasAtium`, `arquillas` | L.26 / PDF 32; L.176 / PDF 182; L.254 / PDF 260 |
| `CaminoInvestidoLoCambiaElDirector` | `true` | Q6 (Xavi, 4 de octubre de 2026: «por ahora no»); el libro permitiría cambiarlo a cualquier nivel, L.128 / PDF 134 |
| `Derivar` | tabla siguiente | — |

```csharp
// Services/Worlds/ArtesMetalicas.cs — tabla pura, espejo exacto de L.163 / PDF 169 (su gemelo TS, solo para la enciclopedia: src/data/mistborn/progresionArtes.ts; el tirador lee el dado y el alcance de derivadosSet, §7.8)
public static class ArtesMetalicas
{
    public static (int Limite, int DadoCaras, int AlcanceMetros) Progresion(int grados, int rango) => grados switch
    { <= 0 => (1, 1, 3), 1 => (1, 4, 6), 2 => (2, 6, 12), 3 => (3, 8, 24), 4 => (4, 10, 48), 5 => (5, 12, 96), _ => (rango, 20, 192) };
}
```

Esqueleto de las dos implementaciones (los cuerpos siguen las tablas de esta sección):

```csharp
// Services/Worlds/StormlightRules.cs
public sealed class StormlightRules : IWorldRules
{
    public string Id => WorldIds.Stormlight;
    public string? NormalizarEra(string? era) => null;                                   // T04: Stormlight no tiene era
    public IReadOnlyDictionary<string, List<ReglaTalento>> ReglasPropias => TalentosReglas.ReglasRoshar;
    public IReadOnlyDictionary<string, List<ReglaTalento>> ReglasTalentos { get; } = TalentosReglas.Efectivas(TalentosReglas.ReglasRoshar);   // == Reglas, mismo orden
    public IReadOnlySet<string> RecursosPermitidos { get; } = new HashSet<string>();
    public bool CaminoInvestidoLoCambiaElDirector => true;
    public bool DesvioBonoSeAcumula => false;
    public void ValidarIdentidad(IdentidadPersonaje id) { /* los tres HashSet y mensajes de CharacterService.cs:12-33, tal cual */
        if (id.CaminoMetal != "") throw new ArgumentException($"Invalid CaminoMetal: '{id.CaminoMetal}'.");
        if (id.CaminoInicial != "") throw new ArgumentException($"Invalid CaminoInicial: '{id.CaminoInicial}'.");
        if (id.Poderes.Count > 0 || id.Bendiciones.Count > 0 || id.Recursos.Count > 0) throw new ArgumentException("This world has no metalborn data."); }
    public void RestringirCambiosNoGm(UpdateCharacterRequest request, CharacterEntity character) => request.CaminoRadiante = character.CaminoRadiante;   // CharacterService.cs:115, movido tal cual
    public void AplicarAccionMesa(CharacterEntity c, AccionMesa accion, CharacterResponse estado) => throw new ArgumentException("Table action not available in this world.");
    public void AlConcluirMeta(CharacterEntity c, MetaEntity meta) { }
    public void AlBorrarMeta(CharacterEntity c, MetaEntity meta) { }
    public IEnumerable<string> TalentosImplicitos(CharacterEntity c) => [];
    public bool TieneInvestidura(CharacterEntity c, IReadOnlyList<string> t, IReadOnlyList<PoderPersonaje> p) => !string.IsNullOrEmpty(c.CaminoRadiante);
    public BonosForma BonosAtributos(CharacterEntity c, IReadOnlyList<string> t, out string? origen)
    { origen = FormasCantor.EsCantor(c.Ascendencia) ? FormasCantor.FormaActiva(t) : null; return FormasCantor.BonosActivos(c.Ascendencia, t); }
    public string EtiquetaBono(string? origen) => $"Forma: {origen}";
    public Dictionary<string, StatDesglose> Derivar(CharacterEntity c, IReadOnlyList<string> t, IReadOnlyList<PoderPersonaje> p, BonosForma fb) => new();
}

// Services/Worlds/MistbornRules.cs (T12 sustituye la delegación en StormlightRules que dejó T10; AplicarAccionMesa la implementa T13)
public sealed class MistbornRules : IWorldRules
{
    public string Id => WorldIds.Mistborn;
    public string? NormalizarEra(string? era) => EraIds.EsValida(era) ? era : throw new ArgumentException($"Invalid Era: '{era}'.");   // T04
    public IReadOnlyDictionary<string, List<ReglaTalento>> ReglasPropias => MistbornData.Reglas;                         // solo Resistencia koloss
    public IReadOnlyDictionary<string, List<ReglaTalento>> ReglasTalentos { get; } = TalentosReglas.Efectivas(MistbornData.Reglas);   // núcleo Cosmere + propias
    public IReadOnlySet<string> RecursosPermitidos { get; } = new HashSet<string> { "investiduraActual", "cuentasAtium", "arquillas" };
    public bool CaminoInvestidoLoCambiaElDirector => true;   // Q6: por ahora solo el director
    public bool DesvioBonoSeAcumula => true;
    public void ValidarIdentidad(IdentidadPersonaje id) { /* §5.3 */ }
    public void RestringirCambiosNoGm(UpdateCharacterRequest request, CharacterEntity character) { /* §5.2: CaminoMetal, CaminoInicial, Bendiciones, reinyección de poderes */ }
    public void AplicarAccionMesa(CharacterEntity c, AccionMesa accion, CharacterResponse estado) { /* §5.2: PatchRecursos, BeberVial, InicioEscena (T13) */ }
    public void AlConcluirMeta(CharacterEntity c, MetaEntity meta) { /* §6.2 fila MetaService:53-67 */ }
    public void AlBorrarMeta(CharacterEntity c, MetaEntity meta) { /* §6.2 fila MetaService:69-74 */ }
    public IEnumerable<string> TalentosImplicitos(CharacterEntity c) => c.Ascendencia switch { "Sangre koloss" => ["Resistencia koloss"], "Kandra" => ["Forma natural", "Disfraz kandra"], _ => [] };
    public bool TieneInvestidura(CharacterEntity c, IReadOnlyList<string> t, IReadOnlyList<PoderPersonaje> p)
        => MistbornData.CaminosAlomanticos.Contains(c.CaminoMetal) || p.Any(x => x.Arte == "alomancia" && x.Origen is "clavo" or "lerasium");
    public BonosForma BonosAtributos(CharacterEntity c, IReadOnlyList<string> t, out string? origen) { /* Bendiciones + Tamaño desmedido + Guardián del conocimiento */ }
    public string EtiquetaBono(string? origen) => origen ?? "Bendición";
    public Dictionary<string, StatDesglose> Derivar(CharacterEntity c, IReadOnlyList<string> t, IReadOnlyList<PoderPersonaje> p, BonosForma fb) { /* tabla siguiente */ }
}
```
`Derivar` emite el arte A si (i) existe el hueco de su habilidad Investida en `HabilidadPersonalizada1..6` (nombre exacto
`Alomancia` → Voluntad; `Feruquimia` → Intelecto), **o** (ii) `CaminoMetal` implica A (brumoso/nacido de la bruma → alomancia;
feruquimista/ferrin → feruquimia; nacidoble → ambas), **o** (iii) algún `PoderPersonaje` tiene `Arte == A` (poder de clavo,
aleación de lerasium o medallón sin camino: el clavo y la aleación dan la habilidad correspondiente, L.290 / PDF 296, L.295 / PDF
301, y la ficha debe mostrar MOD/LÍMITE/DADO/ALCANCE). `grados` = valor del hueco, o 0 si no existe (límite 1, dado 1 «sin
tirada», alcance 3 m, modificador = atributo; tabla L.163 / PDF 169); `rango = Rango(c.Level)`. `poder.<metal>.cargasMax` se emite
para **todo** poder feruquímico, aunque el arte no se emita:

| Clave | Fórmula | Líneas del `StatDesglose` | Cita |
|---|---|---|---|
| `<arte>.modificador` | `grados + atributo` (Voluntad o Intelecto, con `fb` del mundo) | `Grados en Alomancia`, `Voluntad`, `Bendición…` si aplica | L.128 / PDF 134 |
| `<arte>.limite` | `Progresion(grados, rango).Limite` | `Grados`; con ≥6 grados, línea `Rango` | L.163 / PDF 169 |
| `<arte>.dado` | `Total = Progresion(grados, rango).DadoCaras`, `Unidad = "d"` (1 = «sin tirada») | `Dado de artes metálicas` | L.163 / PDF 169 |
| `alomancia.alcance` | `Progresion(grados + (talentos ∋ "Portentoso" ? 1 : 0), rango).AlcanceMetros`, `Unidad = "m"` (Portentoso +1 grado **solo** para el alcance de poderes alománticos) | `Grados`, `Portentoso` | L.136 / PDF 142 |
| `feruquimia.alcance` | `Progresion(grados, rango).AlcanceMetros`, `Unidad = "m"` (Portentoso **no** afecta: su texto habla solo de poderes alománticos) | `Grados` | L.136 / PDF 142; L.163 / PDF 169 |
| `feruquimia.cargasMax` | `2 + grados + (talentos ∋ "Mentes de metal ampliadas" ? rango : 0)` | `Base`, `Grados en Feruquimia`, `Mentes de metal ampliadas` | L.131 / PDF 137; L.146 / PDF 152 |
| `poder.<metal>.cargasMax` (uno por poder feruquímico) | `poder.Completo == false ? 0 : poder.Origen == "medallon" ? 8 : feruquimia.cargasMax + (metal == "cobre" && talentos ∋ "Guardián del conocimiento" ? 5 : 0) + poder.AjusteCargasMax` (un poder naciente no tiene mente de metal y no almacena ni decanta cargas, L.162 / PDF 168: `Total = 0` con la única línea `Naciente: sin mente de metal`; un medallón alberga un máximo fijo de 8 cargas por poder, sin líneas de grados ni Mentes de metal ampliadas, y al almacenar en él no se generan cargas) | naciente: `Naciente: sin mente de metal` 0; las anteriores + `Guardián del conocimiento`, `Componedor`; medallón: solo `Medallón` 8 | L.162 / PDF 168; L.229 / PDF 235; L.155 / PDF 161; L.293 / PDF 299 |
| `feruquimia.mentesALaVez` | **Solo si `CaminoMetal == "feruquimista"`** (el límite lo da Herencia feruquímica; ferrin y nacidoble tienen una mente por poder y el libro no les describe límite [inferido → Q27]): `talentos ∋ "Ancho de banda mental" ? feruquimia.modificador : Math.Max(1, c.Intelecto + fb.Intelecto)` | `Intelecto` (+ línea de bono si `fb.Intelecto != 0`) o `Ancho de banda mental` | L.131 / PDF 137; L.146 / PDF 152 |
| `hemalurgia.clavosMax` | **No en F2 / T12.** La añade T49a (F7): `Math.Min(rango, 3)`, solo si existe algún clavo; hasta entonces nadie la consume | `Rango` | L.289 / PDF 295 |

Sin hueco, sin camino y sin poderes → diccionario vacío. La codificación del dado como `StatDesglose` (`Total` = caras) es una
concesión para reutilizar el componente de desglose en la UI; el cliente lo pinta como `d{total}` o «—» si `total == 1`.

### 6.4 Metas de nacido del metal, Desprovisto e inicio de escena

- La meta es una `MetaEntity` normal (3 hitos, éxito/crecimiento/fracaso; `MetaService.cs:42-43`, `:57-59`; L.282-284 / PDF
  288-290). La crea el cliente al elegir el camino (títulos de §2: «Entrenar tu poder» / «Entrenar tus poderes» / «Fabricar tu
  mente de metal» / «Fabricar tus mentes de metal», L.132-133 / PDF 138-139; L.146 / PDF 152) y guarda su id en
  `PoderPersonaje.MetaId`. No se crea meta de alomancia si el único poder es atium (usa la versión completa, «Atium intuitivo»,
  L.133 / PDF 139; L.135 / PDF 141). Concluirla con **cualquier** `TipoConclusion` (`exito | crecimiento | fracaso`) marca el
  poder completo en servidor (hook `AlConcluirMeta` de `MistbornRules`, llamado por `MetaService`, §6.2; L.284 / PDF 290: toda
  conclusión da la recompensa) [inferido: el libro no distingue el tipo
  para las metas de nacido del metal] → Q20. Los poderes con `Origen != "camino"` nacen completos y sin meta (§5.3). Mientras un
  poder feruquímico está naciente, `poder.<metal>.cargasMax = 0` y el `PATCH` rechaza `cargas > 0` (§5.2, §6.3).
- **Desprovisto [poder]** (L.310 / PDF 316) y **Beber vial** (L.129-130 / PDF 135-136) se aplican en `POST …/acciones/beber-vial`
  (§5.2). «Trazas de metal» (usar un poder naciente estando Desprovisto, L.136 / PDF 142) es informativo para el cliente.
- **Inicio de escena**: `POST …/acciones/inicio-escena` pone la Investidura actual al máximo o a 1 si Sorprendido (L.129 / PDF
  135); sin Sorprendido limpia además `Desprovisto` de los poderes alománticos (no atium) de metal **común** («ya te has bebido un
  vial por puro instinto», L.129 / PDF 135) y deja intactos los raros [inferido → Q24]; con Sorprendido no toca ningún
  `Desprovisto`. Nada se automatiza por tiempo.

### 6.5 Convivencia con el WIP de formas de cantor

El WIP está commiteado en la rama de integración desde T01, con `dotnet build` verde. Reglas: no renombrar `BonosForma` ni
`FormasCantor`
(`BonosForma` representa bonos de atributo de cualquier origen: forma de cantor, Bendición, talento o clavo; el nombre es del WIP
de Xavi y se conserva); no reescribir `Build*Lineas` (solo parámetros nuevos al final: `tieneInvestidura` **obligatorio** y
`etiquetaBono` en `BuildInvLineas`, `acumula` y `etiquetaBono` en `BuildDesvioLineas`, `etiquetaBono` en las otras tres, §6.2);
propiedades nuevas de `CharacterResponse` después de `Metas` (`:98`) y antes de `CreatedAt` (`:100`; la `:99` está en blanco) y
`EsBono` al final de `StatLinea`; los dos parámetros obligatorios de `Calcular` (`reglas`, `tieneInvestidura`) se insertan
**antes** de `unidad`, porque C# no admite obligatorios tras opcionales (única inserción no final del plan; T01 ya está
commiteado y las ocho llamadas están en `CharacterService`); el literal `Reglas` no se edita (los miembros nuevos de
`TalentosReglas` van al final de la clase, §6.2 fila `:56`); comportamiento de referencia = **WIP**, no HEAD (el JSON de T02
se captura con el WIP compilando).
`CondicionRegla.TieneInvestidura` (`TalentosReglas.cs:31`) existe y no lo usa ninguna regla: el cambio de `EsActiva` es inocuo
hoy.

## 7. Frontend

### 7.1 Registro de configuración (`src/worlds/`)

Dos capas para resolver la contradicción «configuración síncrona» frente a «datos perezosos»:

```ts
// src/worlds/types.ts
export type AttrField = 'fuerza' | 'velocidad' | 'intelecto' | 'voluntad' | 'discernimiento' | 'presencia'   // campos de Character (hoy solo existe SkillField, talentGraph.ts:70)
export interface TopicDef { id: string; label: string; description: string; tone: Tone; feature?: boolean; emblem: ReactNode; ruta?: string }  // mueve el Topic local de EncyclopediaPage.tsx:99-107; pathFor() conserva su caso especial 'catalog' (:200-206)
export type TalentRules = unknown   // TODO T34a: sustituir por el tipo real de src/lib/talentRules.ts
export type AventurasOverlay = unknown    // TODO T23: sustituir por el tipo real de src/data/overlays.ts
export type CombatOverlay = unknown       // TODO T23
export type PoderDef = unknown            // TODO T16: sustituir por PoderAlomantico | PoderFeruquimico de src/data/mistborn/tipos.ts (la carpeta no existe hasta F3)
export interface HabilidadDef { field: SkillField; label: string; atributo: AttrField; codigo: 'FUE'|'VEL'|'INT'|'VOL'|'DIS'|'PRE'; columna: 'fisico'|'cognitivo'|'espiritual' }
export interface WorldConfig {                      // LIGERA, síncrona, sin datos de juego pesados
  id: WorldId; nombre: string; nombreCorto: string; planeta: 'Roshar' | 'Scadrial'; emblema: string    // 'archivo-tormentas' | 'nacidos-bruma-emblem'; planeta = nombre visible («del mundo de Scadrial»)
  eras: { id: Era; label: string; aviso?: string; tone: Tone }[] | null   // label, pista y tono del chip de era: el Sheet de creación los lee de aquí (§7.3)
  features: { caminoRadiante: boolean; idealesJurados: boolean; marcos: boolean; formasCantor: boolean; potencias: boolean
              artesMetalicas: boolean; arquillas: boolean; mencionSpren: boolean; pestanaAventura: boolean; eras: boolean
              bonosServidor: boolean   // la ficha y el tirador suman character.bonosAtributos del servidor (Mistborn true; Stormlight false hasta T50, que lo pone a true; §5.1, Q22)
              equipoInicial: boolean   // flujo «Equipo inicial» por paquetes desde la Bolsa (Mistborn true, T47)
              catalogoDePrecios: boolean // buscador, chips y precio del selector del catálogo y de sus formularios (Mistborn true, Stormlight false; añadido por T41)
              origenes: boolean }      // página de enciclopedia «Orígenes» (ascendencias, Bendiciones, culturas por era): Mistborn true; WorldGate la protege (§7.2)
  habilidades: HabilidadDef[]                          // 18; Stormlight = HABILIDADES_STORMLIGHT_LEGADO (etiquetas y atribuciones ACTUALES de la ficha, Q3) hasta T50; Mistborn = HABILIDADES_COSMERE desde T26
  habilidadesTirador?: HabilidadDef[]                  // solo Stormlight hasta T50: tabla local actual de DiceRoller.tsx:25-55 (HABILIDADES_STORMLIGHT_TIRADOR_LEGADO); el tirador lee `cfg.habilidadesTirador ?? cfg.habilidades`
  habilidadesPnj?: HabilidadDef[]                      // solo Stormlight hasta T50: tabla local actual de GlobalNpcDetailPage.tsx:17-54 (HABILIDADES_STORMLIGHT_PNJ_LEGADO); la página de PNJ lee `cfg.habilidadesPnj ?? cfg.habilidades`
  habilidadesInvestidas: { nombre: string; atributo: AttrField; codigo: string; icono: LucideIcon; ataque: boolean }[]   // [] | Alomancia (VOL, ataque) / Feruquimia (INT)
  ascendencias: { id: string; label: string; tone: Tone; icono: (size: number) => ReactNode; eras?: Era[]; puntosAtributoBase: number; topeAtributo?: Partial<Record<AttrField, number>> }[]   // tone e icono como ReactNode: hoy ASCENDENCIAS lleva tone cuarzo/amatista e icon JSX (CharacterDetailPage.tsx:433-436); un LucideIcon sin tone sería una regresión visual Stormlight (P1)
  caminoInvestido: { field: 'caminoRadiante' | 'caminoMetal'; label: string; excluyente: boolean } | null
  recursos: { clave: string; label: string; icono: LucideIcon; decimales: 0 | 2 }[]
  derivados: { clave: string; label: string; grupo: 'alomancia' | 'feruquimia' }[]
  moneda: { simbolo: 'mc' | 'ar'; nombre: string; imagen: string | null; decimales: 0 | 2 }
  tablas: { cargaKg: number[]; levantamientoKg?: number[] }   // levantamientoKg opcional: Stormlight no la declara (hoy la Bolsa solo tiene capacidad de carga, BolsaDetailPage.tsx:233-240, y añadirla sería UI nueva en Stormlight, P1); Mistborn sí
  enciclopedia: TopicDef[]                             // los emblem JSX de Stormlight (BalancedRow de RADIANT_ORDERS, EncyclopediaPage.tsx:109-197) se declaran en src/worlds/stormlight.topics.tsx y los de Mistborn (Lucide provisional hasta T46) en src/worlds/mistborn.topics.tsx: un fichero .ts no admite JSX
  textos: { sinInvestidura: string; vacioTalentos: string }
  tema: { dataWorld: WorldId | null; themeBg: { light: string; dark: string } }   // dataWorld = null (sin atributo data-world) o el id del mundo; se persiste en `cosmere-campaign` para el script previo a la pintura (§7.2) y applyTheme lo resuelve con getWorld (§7.2)
  iconos: { investidura: LucideIcon; caminoInvestido: (id: string, size: number) => ReactNode }   // Stormlight: RadiantOrderIcon (SVG oficial del libro, no un LucideIcon) en stormlight.icons.tsx; Mistborn: Lucide de Q18 en mistborn.icons.tsx hasta T46
  loadData: () => Promise<WorldData>              // import() perezoso: () => import('./x.data').then(m => m.DATA) (el import() devuelve el espacio de nombres del módulo, no un WorldData)
  syncData?: WorldData                         // Stormlight: los datos actuales ya están en el bundle principal (mismo objeto que devuelve loadData); Mistborn: undefined
}
export interface WorldData {                        // PESADA, perezosa
  talentos: TalentRules | null                  // null hasta T34a; caminosHeroicos, caminosInvestidos y poderes viven DENTRO de TalentRules (§7.7), no se duplican aquí
  caminosHeroicos: HeroicPath[]                       // lo rellenan T21 (Mistborn) y T06b (Stormlight) para HeroicPathsPage antes de que exista talentos
  poderes: (Potencia | PoderDef)[]                    // Stormlight: POTENCIAS (Potencia tiene `ordenes`, src/data/potencias.ts:12-16); Mistborn: PODERES_ALOMANTICOS/FERUQUIMICOS (T17/T18) para MetalPicker, PoderCard y enciclopedia antes de T34a
  overlays: { aventuras: AventurasOverlay | null; combat: CombatOverlay | null }
}
```

`TalentRules`, `AventurasOverlay`, `CombatOverlay` y `PoderDef` se declaran en T06b como `export type … = unknown`
(comentario `// TODO T34a / T23 / T16`) y esas tareas los sustituyen por los reales. `src/worlds/stormlight.data.ts` y
`mistborn.data.ts` exportan `export const DATA: WorldData = { … }`. `mistborn.data.ts` nace en T06b con `talentos: null`,
`caminosHeroicos: []`, `poderes: []`, `overlays: { aventuras: null, combat: null }`; cada tarea de F3 (T16-T23) conecta sus
exports en el campo correspondiente al terminar. `stormlight.data.ts` nace en T06b con `DATA = { talentos: null, caminosHeroicos:
HEROIC_PATHS, poderes: POTENCIAS, overlays: { aventuras: null, combat: null } }`; `RADIANT_ORDERS`, `ARBOL_CANTOR`, `TALENT_GRIDS`
y `TALENT_SUMMARIES` **no** se envuelven aquí (no caben en `WorldData`): entran en `STORMLIGHT_TALENTOS` (T34a).

- `src/worlds/stormlight.ts`: `features` todo `true` salvo `artesMetalicas/arquillas/eras/bonosServidor/equipoInicial/origenes/catalogoDePrecios` (`bonosServidor` pasa a `true` en T50);
  `habilidades = HABILIDADES_STORMLIGHT_LEGADO`, `habilidadesTirador = HABILIDADES_STORMLIGHT_TIRADOR_LEGADO` y
  `habilidadesPnj = HABILIDADES_STORMLIGHT_PNJ_LEGADO`, importadas de `./skills` (fichero que crea T06b transcribiendo `SECTIONS`
  de `CharacterDetailPage.tsx:385-431`, `SKILLS`/`SKILL_TO_FIELDS` de `DiceRoller.tsx:25-55` y `SECTIONS` de
  `GlobalNpcDetailPage.tsx:17-54` **sin tocar esos ficheros**; `stormlight.ts` no lleva copia propia; T50 apunta las tres
  superficies a `HABILIDADES_COSMERE` y borra las de legado); `ascendencias: [{ id:
  'Humano', label: 'Humano', tone: tone.cuarzo, icono: iconoHumano, puntosAtributoBase: 12 }, { id: 'Oyente', label: 'Oyente',
  tone: tone.amatista, icono: iconoOyente, puntosAtributoBase: 12 }]` e `iconos.caminoInvestido: iconoOrden`, con las tres
  funciones JSX declaradas en `src/worlds/stormlight.icons.tsx` (T06b; `iconoHumano = (size) => <UserRound size={size} />`,
  `iconoOyente = (size) => <AudioWaveform size={size} />`, `iconoOrden = (id, size) => <RadiantOrderIcon orderId={id} size={size}
  decorative />`; valores actuales de `CharacterDetailPage.tsx:433-436` y de las pills; cada export con
  `// eslint-disable-next-line react-refresh/only-export-components`, como `ProposalsPage.tsx:16`); `caminoInvestido = { field:
  'caminoRadiante', label: 'Orden', excluyente: true }`; `habilidadesInvestidas: []`; `recursos: []`; `derivados: []`;
  `eras: null`; `moneda: { simbolo: 'mc', nombre: 'Marcos', imagen: null, decimales: 0 }`;
  `tablas: { cargaKg: [22.5,45,112.5,225,1125,2250] }` (sin `levantamientoKg`); `textos: { sinInvestidura: 'Solo disponible para
  Radiantes', vacioTalentos: <literal actual de TalentosDetailPage.tsx:447> }`; `tema: { dataWorld: null, themeBg: { light:
  '#e8ecf1', dark: '#0a0e15' } }` (los valores actuales de `themeStore.ts:12`, cuyo `THEME_BG` desaparece en T07: `applyTheme`
  lee `getWorld(world).tema.themeBg`, §7.2);
  `loadData = () => import('./stormlight.data').then(m => m.DATA)`; `syncData = DATA` (import estático de
  `./stormlight.data`: sus datos ya viajan en el chunk principal porque `CharacterDetailPage` y otros 15 ficheros importan
  `heroicPaths.ts`/`radiantOrders.ts` estáticamente).
- `src/worlds/mistborn.ts` (**nace completo en T06b para que `npx tsc -b` compile**, con los provisionales indicados): `eras`
  dos (`era1` con `label: 'Era 1'`, `tone: tone.granate` y `aviso` «Era 1: El Mundo de Ceniza. El libro advierte de un tono más
  sombrío.»; `era2` con `tone: tone.zafiro` y «Era 2: Cambio y revolución. Armas de fuego, sangre koloss, ferrin y nacidobles.»;
  L.372 / PDF 378; tonos [inferido → Q18]); `features`: `pestanaAventura: false` (Q10), `eras: true`, `artesMetalicas: true`,
  `arquillas: true`, `bonosServidor: true`, `equipoInicial: true`, `origenes: true`, y `caminoRadiante`, `idealesJurados`,
  `marcos`, `formasCantor`,
  `potencias`, `mencionSpren` en `false`; `caminoInvestido = {
  field: 'caminoMetal', label: 'Camino de nacido del metal', excluyente: true }`;
  `habilidades: HABILIDADES_STORMLIGHT_LEGADO` **provisional** (la ficha de una campaña Mistborn sigue siendo la Stormlight hasta
  que T26 la sustituya por `HABILIDADES_COSMERE`); sin `habilidadesTirador` ni `habilidadesPnj` (Mistborn usa `habilidades` en
  las tres superficies); `derivados` con las claves de §2 (`alomancia.modificador|limite|dado|alcance` grupo
  `alomancia`, `feruquimia.*` grupo `feruquimia`); `tema: { dataWorld: 'mistborn', themeBg: { light: '#ebe8e6', dark: '#0c0b0d'
  } }` (valores de §7.8 Tema; T44 solo los cambia si la paleta final difiere); `habilidadesInvestidas` Alomancia (`VOL`, `Flame`,
  `ataque: true`) y Feruquimia (`INT`, `Anvil`) [iconos inferidos]; `ascendencias` Humano (12, `tone.cuarzo`, `UserRound`), Kandra
  (6, L.34 / PDF 40, `tone.granate`, `VenetianMask`), Sangre koloss (`eras: ['era2']`, `topeAtributo: { fuerza: 6 }`, L.38 / PDF
  44, `tone.topacio`, `Mountain`) [tonos e iconos inferidos → Q18]; `iconos.caminoInvestido` Lucide de Q18 (en
  `src/worlds/mistborn.icons.tsx`, T06b, análogo a `stormlight.icons.tsx`); `recursos` investiduraActual, cuentasAtium, arquillas
  (2 decimales); `moneda ar` con `imagen: null`
  hasta T45 (después `img/dinero-era1|era2`); `cargaKg [25,50,125,250,1250,2500]`, `levantamientoKg [50,100,250,500,2500,5000]`
  (L.50 / PDF 56); `textos.sinInvestidura = 'Solo disponible para alomantes'`; `enciclopedia: []` en T06b y rellenada en T06c
  desde `./mistborn.topics.tsx` (provisional: Caminos Heroicos, Combate, Aventuras, Catálogo; completa en T24a);
  `emblema: 'cosmere-emblem'` provisional hasta T46; `loadData = () => import('./mistborn.data').then(m => m.DATA)`; sin
  `syncData`. Importa **por fichero** (`'../data/mistborn/metales'`…), nunca el barrel `src/data/mistborn/index.ts` (§8).
- `src/worlds/index.ts`: `WORLDS`, `getWorld = (id?: string | null): WorldConfig => Object.hasOwn(WORLDS, id ?? '') ?
  WORLDS[id as WorldId] : WORLDS.stormlight` (`''`, `null` o un id desconocido caen a Stormlight, coherente con
  `WorldRulesProvider.Get`; **no** usar `id in WORLDS`: con un objeto plano, `'constructor'` o `'toString'` devolverían
  propiedades del prototipo), `isAvailable(item: { eras?: Era[] }, era: Era | null)` (`null` = todo disponible).
- `src/worlds/skills.ts`: en T06b, `HABILIDADES_STORMLIGHT_LEGADO` (ficha), `HABILIDADES_STORMLIGHT_TIRADOR_LEGADO` (tirador) y
  `HABILIDADES_STORMLIGHT_PNJ_LEGADO` (PNJ), transcripciones literales de las tres tablas Stormlight actuales; en T26,
  `HABILIDADES_COSMERE` (nombres y atribuciones del libro, idénticos en los dos manuales: Armamento ligero/pesado, Saber,
  Atletismo
  FUE, Intimidación VOL; `ch3_chars.txt` y hoja L.402 / PDF 408), que Mistborn usa desde T26 y Stormlight desde T50. **Las tres
  tablas Stormlight actuales difieren entre sí** (ficha
  `CharacterDetailPage.tsx:385-431`: «Armas Ligeras», «Conocimiento», Atletismo→VEL, Intimidación→VOL; tirador
  `DiceRoller.tsx:25-55`: «Armas ligeras», «Saber», Atletismo→FUE, Intimidación→PRE; PNJ `GlobalNpcDetailPage.tsx:17-54`: columnas
  cognitivo INT/DIS y espiritual VOL/PRE, Disciplina e Intimidación→DIS, Supervivencia→VOL; auditoría 2026-10-03 puntos 5 y 8),
  así que una sola tabla no puede reproducirlas y unificarlas cambiaría el modificador de tirada de la campaña en curso (P1). Por
  eso `WorldConfig` lleva `habilidadesTirador?` y `habilidadesPnj?` **opcionales**: solo Stormlight las declara (sus tablas de
  legado) hasta T50; el tirador lee `cfg.habilidadesTirador ?? cfg.habilidades` y la página de PNJ `cfg.habilidadesPnj ??
  cfg.habilidades`, **sin ninguna comparación de ids de mundo** en los componentes (P4, §1.7). T50 borra las tres tablas de
  legado y las dos propiedades opcionales, y Stormlight pasa a `HABILIDADES_COSMERE` en las tres superficies (Q3).
- Hooks (`src/store/campaignStore.ts`, aditivo, sin cambiar el shape persistido `cosmere-campaign`):

```ts
// src/store/campaignStore.ts (T06a añade useEra; T06b añade dataWorld, useWorld, useWorldConfig y useWorldData; shape persistido `cosmere-campaign` ampliado solo con dataWorld)
export const useEra = () => useCampaignStore(s => s.currentCampaign?.era ?? null)
export const useWorld = (): WorldId => useCampaignStore(s => getWorld(s.currentCampaign?.world).id)   // sin literales de mundo: getWorld resuelve '', null, undefined y los ids desconocidos a Stormlight (objetos persistidos antiguos incluidos)
export const useWorldConfig = () => getWorld(useWorld())                                        // síncrono, ligero
// setCurrentCampaign persiste además `dataWorld: getWorld(campaign?.world).tema.dataWorld` (WorldId | null) en `cosmere-campaign`
// (partialize), para que el script previo a la pintura de index.html lo lea sin conocer ningún id de mundo (§7.2)
export function useWorldData() {                                                                     // perezoso, cacheado para siempre
  const cfg = useWorldConfig()
  return useQuery({ queryKey: ['world-data', cfg.id], queryFn: cfg.loadData, initialData: cfg.syncData,
                    staleTime: Infinity, gcTime: Infinity, structuralSharing: false })   // initialData: en Stormlight isPending es false desde el primer render (ningún Spinner nuevo, P1); structuralSharing: false porque los datos son grandes e inmutables
}
// src/components/WorldGate.tsx
export function WorldGate({ feature, children }: { feature: keyof WorldConfig['features']; children: ReactNode }) {
  const cfg = useWorldConfig()
  return cfg.features[feature] ? <>{children}</> : <Navigate to="../encyclopedia" replace />   // por capacidad, nunca por id de mundo
}
```
  Las páginas que necesitan `WorldData` (talentos, enciclopedia de caminos y poderes, overlays) muestran `Spinner` mientras
  `isPending`; **en Stormlight `isPending` es `false` desde el primer render** gracias a `initialData: cfg.syncData` (sin
  él, con TanStack v5 un `useQuery` sin `initialData` empieza en `status: 'pending'` y `HeroicPathsPage`/`TalentosDetailPage`
  mostrarían un `Spinner` nuevo la primera vez en cada sesión, rompiendo «Stormlight idéntica»); solo Mistborn carga con
  `import()`. Las que solo necesitan `WorldConfig` (ficha, bolsa, dados, catálogo) no esperan nada.

  **Chunks perezosos y PWA.** Hoy la app no tiene ningún `import()` ni `React.lazy` (`grep -rn "lazy(" src` → 0): todo el JS es un
  único chunk. El diseño introduce chunks con hash (`mistborn.data`, páginas `encyclopedia/mistborn/*`, `mistbornAssets`) en una
  PWA con `registerType: 'autoUpdate'`, `skipWaiting` y `clientsClaim` (`vite.config.ts:11,23-24`): tras un despliegue, un cliente
  que tenga la app abierta recibe el SW nuevo, que borra el precache antiguo; cuando navegue a una ruta perezosa con el hash
  viejo, nginx devuelve `index.html` por el fallback SPA y falla con «Failed to fetch dynamically imported module». Mitigación
  (T06c, `src/main.tsx`, aditivo): `window.addEventListener('vite:preloadError', (e) => { e.preventDefault(); const k =
  'cosmere-reload-once'; if (!sessionStorage.getItem(k)) { sessionStorage.setItem(k, '1'); window.location.reload() } })` y
  `sessionStorage.removeItem(k)` tras el primer render correcto (Vite ≥ 5.0.5 emite ese evento; `package.json` `vite ^8.0.1`).
  Riesgo 20 en §11.

### 7.2 Hidratación, tema y navegación

- `src/components/AppLayout.tsx:13-17`: hoy `campaignsApi.getById(id).then(setCurrentCampaign).catch(() => {})`. Pasa a
  `useQuery(['campaign', id])` compartida con `CampaignSettingsPage.tsx:28`: `const id = Number(campaignId); const { data,
  isError, refetch } = useQuery({ queryKey: ['campaign', id], queryFn: () => campaignsApi.getById(id), enabled:
  Number.isFinite(id) && id > 0 }); useEffect(() => { if (data) setCurrentCampaign(data) }, [data, setCurrentCampaign])` (TanStack
  v5 **no** tiene `onSuccess` en `useQuery`: el store se escribe desde un `useEffect` sobre `data`); gate
  `ready = currentCampaign?.id === id`; `isError && !ready` → `ErrorMessage` + «Reintentar» (`refetch`) + «Volver a campañas»;
  `useLayoutEffect`: `const root = document.documentElement; if (cfg.tema.dataWorld) root.dataset.world =
  cfg.tema.dataWorld; else delete root.dataset.world; applyTheme(useThemeStore.getState().mode);` y
  `delete root.dataset.world` también en el cleanup (nunca queda `data-world=""` en Stormlight; `applyTheme` se vuelve a
  ejecutar porque hoy solo corre al cambiar el modo, `themeStore.ts:19-32`, y el `meta theme-color` quedaría con el color
  anterior); `<Outlet/>` y `<DiceRoller/>` solo con `ready`; `Spinner` mientras carga; si falla, `ErrorMessage` + `Button`
  «Reintentar» + «Volver a campañas».
- `index.html:18-26`: segundo script previo a la pintura que lee `localStorage['cosmere-campaign']`, compara
  `state.currentCampaign.id` con `location.pathname.match(/^\/campaigns\/(\d+)/)` y, si coincide y `state.dataWorld` es una
  cadena no vacía, pone `data-world = state.dataWorld` (`try/catch`); el script **no conoce ningún id de mundo**: el valor lo
  persiste `setCurrentCampaign` desde `WorldConfig.tema.dataWorld` (§7.1).
- `src/store/themeStore.ts:12,19-32`: se borra `THEME_BG` (`:12`);
  `applyTheme(mode, world = document.documentElement.dataset.world)`
  lee `getWorld(world).tema.themeBg` (`getWorld(undefined)` devuelve Stormlight con los valores actuales; `tema.dataWorld` es
  siempre `null` o el id del mundo, así que `getWorld` lo resuelve).
- `App.tsx:46-66`: rutas nuevas `encyclopedia/origenes` (con `<WorldGate feature="origenes">`), `encyclopedia/nacidos-del-metal`,
  `encyclopedia/artes-metalicas` y `encyclopedia/artes-metalicas/:arte/:metal` (con `<WorldGate feature="artesMetalicas">`), todas
  con `React.lazy`; `radiant-orders` con `<WorldGate feature="caminoRadiante">` y `potencias` con `<WorldGate
  feature="potencias">`. `WorldGate` (`src/components/WorldGate.tsx`): `{ feature: keyof WorldConfig['features']; children }` →
  `<Navigate to="../encyclopedia" replace/>` si `useWorldConfig().features[feature]` es `false` (ningún componente compara ids de
  mundo).
- `Sidebar.tsx:38-54` sin cambio de estructura; `WorldBadge` (emblema 14 px + «Nacidos de la bruma · Era 2») en `:153-168`,
  `:261-268`, `:353-357`, `HomeCampaignPage.tsx:47-57` y `CampaignSettingsPage.tsx` (sección «Ambientación»). `GmPage.tsx:8-20`:
  pestaña «Aventura» solo con `features.pestanaAventura`.

### 7.3 Creación de campaña y ajustes (`CampaignListPage.tsx`, `CampaignSettingsPage.tsx`)

`Sheet` (`ui.tsx:920`) «Nueva campaña» sustituye al `InlineForm` de creación (`:16-91`, `:222-235`; el de «Unirse» se queda):
`Field`+`Input` nombre (autofoco) · eyebrow «Ambientación» · `Segmented` (`ui.tsx:686`) construido desde
`Object.values(WORLDS).map(w => ({ value: w.id, label: w.nombreCorto, ariaLabel: w.nombre }))` con `CosmereIcon name={w.emblema}`
(sin literales de mundo en el componente: un tercer mundo aparece solo) · vista previa `aria-live="polite"` (emblema 40 px +
frase) · si `cfg.eras` no es `null` (`cfg = WORLDS[world]`): eyebrow «Era», `Segmented` con `cfg.eras.map(e => ({ value: e.id,
label: e.label }))` → `era1|era2`, pista `fs.xs`/`c.subtle` con `e.aviso` (textos declarados en `mistborn.ts`, §7.1; L.372 /
PDF 378) · aviso `tone.topacio` + `TriangleAlert` «La ambientación y la era no se pueden cambiar después de crear la campaña.» ·
pie `Button` secundario «Cancelar» / primario «Crear campaña» (`disabled` si `!name.trim() || (cfg.eras && !era) || isPending`).
`campaignsApi.create({ name, world, era })`. Tarjeta (`:343-478`): chip del mundo (`nombreCorto` + emblema) y chip de era con
`e.label` y `e.tone` de `cfg.eras` (`granate` / `zafiro` [inferido → Q18]). Ajustes: sección «Ambientación» con dos `StatTile` de
solo lectura (mundo y era); sin controles de edición, porque mundo y era se fijan al crear la campaña (decisión (b)).

### 7.4 Ficha (`src/pages/characters/CharacterDetailPage.tsx`; fichero con WIP: anclar por texto)

Reglas transversales de la ficha: (1) **Caché**: la clave real de la ficha es `['character', cId, chId, enCombate]` (`:468-471`);
toda mutación optimista opera por prefijo `['character', cId, chId]` con `getQueriesData`/`setQueriesData` (receta completa en §2
«Claves TanStack Query»); la base de un `PUT` sale de la entrada `enCombate === false` o de `char`. (2) **Hooks**: las
`useMutation` nuevas (`aplicarCaminoMetal`, `quitarCaminoMetal`, `patchRecursos`, `beberVial`, `inicioEscena`) se declaran
**antes** del retorno temprano `if (isLoading || !char) { return (<Spinner/>…) }` (`:494-501`, ancla por texto
`if (isLoading || !char)` porque el fichero tiene WIP; `formaMutation` ya está antes, `:488-492`) o `rules-of-hooks` falla; leen
los datos con `qc.getQueriesData`, no con el cierre de `char`. (3) **Líneas de bono**: la ficha distingue las líneas «base» de un
desglose (que recalcula localmente en las previsualizaciones de edición) de las de talento con `esLineaBase = c === 'Base' ||
c.startsWith('Forma:') || ATRIBUTO_RE.test(c)` (`:346-348`) y colorea el Desvío con `startsWith('Forma:')` (`:797`). Las líneas de
Mistborn («Bendición de la Consciencia», «Tamaño desmedido», «Guardián del conocimiento», sin prefijo «Forma: ») deben reconocerse
o `lineasTalento()` las sumaría otra vez sobre el bono que `fbOf` ya añade (salud, concentración e Investidura previstas
duplicadas): el servidor marca cada línea de bono de atributo con `esBono: true` (`StatLinea.EsBono`, §5.1) y la ficha pasa a
`const esLineaBase = (l: StatLinea) => l.concepto === 'Base' || l.esBono || ATRIBUTO_RE.test(l.concepto)` y a `l.esBono` en lugar
de `startsWith('Forma:')` en `:797` (T29): ninguna expresión regular sobre el texto del concepto (en Stormlight las líneas
«Forma: …» llegan con `esBono: true`, mismo resultado que hoy, P1). (4)
**Carga perezosa**: los componentes de `src/components/mistborn/*` se exportan desde `src/components/mistborn/index.ts` y
`CharacterDetailPage.tsx` los carga con `React.lazy(() => import('../../components/mistborn').then(m => ({ default:
m.CaminoMetalPicker })))` (uno por componente usado), envueltos en `Suspense` con `Spinner`; así ni los componentes ni sus datos
(`CAMINOS_NACIDOS_DEL_METAL`, `BENDICIONES_KANDRA`, `PODERES_*`) entran en el chunk de Stormlight; solo `metales.ts`,
`progresionArtes.ts` y los tipos pueden quedar en el principal (§8, riesgo 6). (5) **Quién abre el picker de camino de nacido del
metal**: `onPick = !editing && isGm ? () => setPicker('caminoMetal') : undefined` (`IdentityItem` solo pinta botón si hay
`onPick`, `:204-246`): **solo el director** (Q6, decisión de Xavi del 4 de octubre de 2026; el servidor lo refuerza con
`CaminoInvestidoLoCambiaElDirector = true`) y **solo fuera de edición** (por la mutación inmediata descrita abajo); los pickers
heroico y radiante siguen como hoy (`editing && isGm`, `:728`, `:738`) y el de Ascendencia con solo `editing` (`:720`).
`aplicarCaminoMetal` y `quitarCaminoMetal` solo se invocan con `editing === false`.

| Zona (ancla de texto) | Stormlight | Nacidos de la Bruma |
|---|---|---|
| Identidad (`IdentityItem` ×3) | Ascendencia · Camino · Orden | Ascendencia (`cfg.ascendencias` filtradas por `isAvailable(era)`) · Camino heroico · **Camino de nacido del metal** (`cfg.caminoInvestido.label`; icono del camino o glifo del metal si tiene un solo poder) |
| Botón Forma (`isCantor`) | igual | oculto (`features.formasCantor = false`) |
| Investidura (ancla: el literal `'Solo disponible para Radiantes'` en línea, `CharacterDetailPage.tsx:831`, y la constante `esRadiante = !!f.caminoRadiante`, `:777`; no existe ningún `investiduraHint`) | igual (`esRadiante = !!f.caminoRadiante`: el GM elige la Orden en el `form` y la tarjeta se enciende y previsualiza al instante; con `inv.total` del servidor seguiría en «Solo disponible…» hasta guardar) | `const tieneInv = cfg.features.caminoRadiante ? !!f.caminoRadiante : (inv.total > 0)` sustituye a `esRadiante` en `:777`, `:827-831` y en la previsualización (en Mistborn lo decide el servidor; en Stormlight no cambia nada); texto `cfg.textos.sinInvestidura`; `Stepper` **Investidura actual** (`recursos.investiduraActual`, 0..máx, `charactersApi.patchRecursos` con actualización optimista por prefijo, §2 y §7.6); botones «Beber vial» (abre `BeberVialSheet`) e «Inicio de escena» (`Segmented` normal / Sorprendido → `inicioEscena`). Los `Stepper` de recursos se deshabilitan mientras `editing` sea `true` (prop `disabled` nueva de `Stepper`, §7.8 Bolsa; la ficha reinicia `form` con cada copia nueva del servidor, `:469-478`, y un refetch borraría lo editado sin guardar). |
| Bonos de atributo en cliente (`formaBonus`/`fbOf`, `:514-515`; totales `:1011/:1046`, bonus de habilidades personalizadas `:1102`; previsualizaciones de salud `fbFuerza` `:533`, concentración `concFb` `:769` e Investidura `:786`; `fbFuerza` solo suma la forma de cantor) | `formaBonus` desde `data/cantores.ts` como hoy hasta T50 (Q22), que activa `features.bonosServidor` en Stormlight: desde entonces los seis atributos salen de `bonosAtributos` (mismos valores: `FormasCantor.cs` es espejo de `data/cantores.ts` y el cambio de forma se guarda al momento, `:1281-1296`) | Cuando `features.bonosServidor` es `true`, `fbOf(k) = char.bonosAtributos?.[k] ?? 0` (§5.1; solo los seis atributos: el desvío y la concentración de la forma de cantor siguen saliendo de `formaBonus`, que es `{}` fuera de los cantores, porque `bonosAtributos` no los emite, §6.2 fila `:307`): así los totales de atributo, los bonus de habilidad y las previsualizaciones en edición incluyen Bendiciones, Tamaño desmedido y Guardián del conocimiento. Imprescindible que `esLineaBase` use `esBono` (regla 3 de arriba): sin ello la previsualización sumaría el bono dos veces. |
| Aviso de puntos de atributo (`getPuntosAtributoEsperados`) | 12 + hitos 3/6/9/12/15/18 | `ascendencia.puntosAtributoBase` (kandra 6, L.34 / PDF 40) + mismos hitos (L.27 / PDF 33); los bonos de Bendición vienen del servidor como líneas y **no** cuentan en el presupuesto. Al crear (nivel 1) cada atributo base `<= 3`, y `<= 4` en Fuerza para Sangre koloss (L.20 / PDF 26; L.38 / PDF 44): es un aviso `tone.topacio`, no bloquea; las Bendiciones no se cuentan en el presupuesto ni en el tope de 3 de creación [inferido: el libro no lo aclara; las Bendiciones se eligen en el mismo paso 3 y dicen que aumentan el «valor máximo» del atributo, L.20 / PDF 26; L.34 / PDF 40]. |
| Tope de atributo (`max={5}`) | 5 | `max = ascendencia.topeAtributo?.[attr] ?? 5` → koloss FUE 6 (L.38 / PDF 44); las Bendiciones no suben el tope del valor base (van como bono) |
| Habilidades (`SECTIONS`) | etiquetas actuales (Q3) | `cfg.habilidades` del mundo: Armamento ligero/pesado, Saber, Atletismo (FUE), Intimidación (VOL) (hoja L.402 / PDF 408) |
| Huecos personalizados (`isPotencia`, `SurgeIcon`) | potencias de la orden | `esInvestida = cfg.habilidadesInvestidas.some(h => h.nombre === nombre)`: bloque propio «Habilidades Investidas», nombre y atributo bloqueados, icono del mundo; los huecos ocupados no se listan entre los libres |
| Pickers (`Sheet`) | Ascendencia, Camino heroico, Forma, Orden | Ascendencia (por era), Camino heroico (igual), **Camino de nacido del metal** (`CaminoMetalPicker`), **Bendición kandra** (`Sheet` con las 5, máx. 2, solo kandra; escribe `bendiciones`) |
| Pestañas (`caracteristicas`, `atributos`, `background`) | igual | + **«Artes metálicas»** si `features.artesMetalicas && (poderes.length > 0 \|\| caminoMetal)` |

**Al elegir camino de nacido del metal** (`CaminoMetalPicker` + `MetalPicker`). El picker de orden radiante (`:738`) modifica el
estado local `form` y persiste al pulsar Guardar, mientras que `formaMutation` (`:488-491`) hace un `update` inmediato con
`{...char}`; mezclar ambos dejaría metas huérfanas si el usuario cancela y el `update` inmediato ignoraría lo editado en `form`.
Por eso el flujo se ejecuta **como mutación inmediata `aplicarCaminoMetal` solo fuera de edición** (`editing === false`) y la
`IdentityItem` del camino de nacido del metal abre el picker con `onPick = !editing && isGm ? … : undefined` (regla 5 de
arriba: solo el director, Q6; los pickers heroico y radiante siguen con `editing && isGm`, `:728`, `:738`):

1. Escribe `caminoMetal`.
2. Escribe `caminoInicial` (decisión (k), Q7): si no hay camino heroico, `'metal'` sin preguntar; si lo hay, lo elige el director
   en un `Segmented` «Camino inicial» (`Camino heroico` / `Camino de nacido del metal`) dentro de `CaminoMetalPicker`, por defecto
   `'heroico'`. Si `caminoInicial === 'metal'`, el principal (ruptura/herencia) queda `autoGranted` sin entrada en `talentos`; si
   `'heroico'`, se inserta el talento principal en `talentos` (ocupa un hueco de nivel). El +1 gratuito del paso 3 depende de
   `caminoInicial === 'metal'`.
3. Crea en el primer hueco **cognitivo** libre (huecos **2 y 5**, `ATRIBUTO_SLOTS['VOL']`/`['INT'] = [2, 5]`,
   `CharacterDetailPage.tsx:374-376`; la UI pinta los huecos 3 y 6 en la columna Espiritual, `:429`) la habilidad Investida con
   valor 1 (`HabilidadPersonalizadaN = 'Alomancia'`, `…Valor = 1`, `…Atributo = 'VOL'`; Feruquimia `'INT'`). **+1 grado gratuito
   solo si el camino es inicial y `camino.habilidadInicial` no es `null`**: brumoso (Alomancia, L.135 / PDF 141, «además del grado
   obtenido por Ruptura de brumoso»), ferrin (Feruquimia, L.150 / PDF 156) y nacidoble (Disciplina: campo estándar
   `disciplina += 1`, **no** un hueco personalizado; L.19 / PDF 25; L.154 / PDF 160); **nacido de la bruma y feruquimista no
   tienen habilidad inicial** («Habilidad inicial: ninguna… no obtienes ningún grado gratuito», L.141 / PDF 147 y L.145 / PDF 151;
   tabla L.19 / PDF 25). Nacidoble: Alomancia 1 en el primer libre de `[2, 5]` y Feruquimia 1 en el siguiente (ocupa los dos). Si
   no quedan huecos cognitivos libres, aviso `tone.topacio` y el director libera uno (Q4).
4. Abre `MetalPicker` con las reglas de §7.5 y crea los `poderes` nacientes (`origen: 'camino'`; `alomancia:atium` nace
   `completo: true`, L.177 / PDF 183).
5. Crea la(s) `Meta` con `metasApi.create` y guarda sus ids en `metaId` de los poderes elegidos para la meta. Títulos: «Entrenar
   tu poder» (brumoso, nacidoble), «Entrenar tus poderes» (nacido de la bruma), «Fabricar tu mente de metal» (ferrin, nacidoble),
   «Fabricar tus mentes de metal» (feruquimista) (L.132-133 / PDF 138-139; L.146 / PDF 152); nacidoble: ambas (L.155 / PDF 161).
   **No se crea meta de alomancia si el único poder es atium** (usa la versión completa, L.133 / PDF 139; L.135 / PDF 141). Si el
   personaje tiene equipo inicial de Fugitivo (completa de inmediato la meta de alomancia) o de Guardador (la de feruquimia), en
   v1 el GM o el propietario marca el poder como completo a mano con el `Switch` «Meta de nacido del metal completada» de la
   pestaña «Artes metálicas» (`patchRecursos { completo: true }`, Q14); el flujo automático llega con T47 (L.255 / PDF 261).
6. Un solo `charactersApi.update` con `{ ...cur, caminoMetal, caminoInicial, talentos, huecos, disciplina, poderes }` donde `cur =
   qc.getQueryData<Character>(['character', cId, chId, false]) ?? char` (la ficha usa la clave de cuatro elementos, §2; patrón de
   `talentosMutation`, `TalentosDetailPage.tsx:176-179`); `onMutate` optimista por prefijo
   (`cancelQueries`/`getQueriesData`/`setQueriesData` sobre `['character', cId, chId]`), `onError` restaura cada entrada,
   `onSettled` invalida `['character', cId, chId]`, `['characters', cId]` **y `['metas', cId, charId]`**
   (`MetasDetailPage.tsx:329`; sin esto las metas recién creadas tardarían 30 s en aparecer, `staleTime` de `App.tsx:27`). Si el
   paso 6 falla, se borran con `metasApi.delete` las metas creadas en el paso 5.

Al quitar el camino (`quitarCaminoMetal`, también mutación inmediata): `ConfirmDialog` («Se quitarán el talento principal, la
habilidad Investida y los poderes obtenidos por el camino»; `confirmLabel="Quitar camino"`, `tone="danger"`, `icon` explícito:
`ConfirmDialog` tiene por defecto `confirmLabel='Eliminar'` y el icono se infiere del texto del botón, `ui.tsx:990-1015`) y
limpieza inversa: `caminoMetal: ''`, quita el talento principal de `talentos` si estaba, vacía el hueco de la habilidad Investida,
elimina los poderes con `origen === 'camino'`, deshace el +1 de Disciplina del nacidoble si procedía y **reinicia `caminoInicial`
a `'heroico'` si hay camino heroico y a `''` si no** (sin esto el servidor normalizaría igual, §5.2, pero la copia optimista
quedaría incoherente); los poderes con `origen !== 'camino'` y las metas ya creadas se conservan.

### 7.5 Selector de metal (`src/components/mistborn/MetalPicker.tsx`)

`Sheet` con cuadrícula 4×4 + atium (glifo `MetalGlyph`, nombre, categoría del arte, puro/aleación, pareja, nombre de
brumoso/ferrin, chip de era), filtrada por **`METALES_POR_CAMINO_Y_ERA[camino][era]`** (tabla literal de L.372 / PDF 378, en
`metales.ts`, §8) y por `PoderDef.caminos`. `MetalDef.eras` solo no
basta: la disponibilidad es por **camino y era** (en Era 1 el oro solo lo tienen nacido de la bruma y feruquimista, el brumoso de
Era 1 no tiene oro; atium solo existe en Era 1; L.167 / PDF 173; notas al pie de L.168 / PDF 174 y L.171 / PDF 177). Modo de
selección por camino: **brumoso** y **ferrin** uno (L.135 / PDF 141; L.150 / PDF 156); **nacido de la bruma** recibe todos los
alománticos de la era como nacientes y elige la **pareja Empujón/Tirón** cuya meta se entrena primero (L.141 / PDF 147);
**feruquimista** recibe todos los feruquímicos de la era y elige **puro + aleación o atium** para la meta (L.146 / PDF 152);
**nacidoble** uno de cada arte, mismo o distinto metal (L.155 / PDF 161; condiciona Componedor, L.155 / PDF 161, y Resonancia
aleada, L.159 / PDF 165). **`PoderDef.caminos` se define por arte** (cabeceras «Es posible desbloquear este árbol mediante el
talento principal de los caminos de…» de cada poder). ALOMANCIA: acero, bronce, cinc, cobre, duraluminio, electro, estaño, hierro,
latón, oro, peltre y **aluminio** → `['brumoso', 'nacidoble', 'nacido-de-la-bruma']` (acero L.172 / PDF 178; aluminio sin árbol
pero con «Elección de alomancia de aluminio», L.175 / PDF 181); atium → `['brumoso', 'nacido-de-la-bruma']` (L.177 / PDF 183);
bendaleo, cadmio, cromo y nicrosil → `['brumoso', 'nacidoble']` (L.180, 186, 193, 208 / PDF 186, 192, 199, 214). FERUQUIMIA:
acero, aluminio, bronce, cinc, cobre, duraluminio, electro, estaño, hierro, latón, oro, peltre y **nicrosil** →
`['ferrin', 'nacidoble', 'feruquimista']` (acero L.213 / PDF 219; aluminio L.216 / PDF 222; nicrosil sin árbol pero con «Elección
del nicrosil como ferrin», L.246 / PDF 252); bendaleo, cadmio y cromo → `['ferrin', 'nacidoble']` (L.220, 224, 232 / PDF 226, 230,
238); atium → `['feruquimista']` (L.219 / PDF 225). «Sin árbol» (`talentos: []`: alomancia de aluminio, feruquimia de nicrosil)
**no** significa «sin camino»: ambos se pueden elegir. La disponibilidad por era la sigue decidiendo `METALES_POR_CAMINO_Y_ERA`
(L.372 / PDF 378). Feruquimia de aluminio tiene 3 talentos (informes 08 y 09). **Oro en Era 1 para nacido de la bruma y
feruquimista**: su aleación emparejada, el electro, no figura en la lista de Era 1 (L.372 / PDF 378; parejas L.168 / PDF 174,
L.171 / PDF 177), así que la regla «pareja Empujón/Tirón» / «puro + aleación» no lo cubre: el `MetalPicker` lo ofrece como
elección individual para la meta («Oro (sin pareja en esta era)») [inferido: el libro no lo trata → Q25]. **Nuevas metas**: tras
completar la primera, el libro permite, a discreción de la DJ, la meta para otra pareja (o el atium en feruquimista), «y así
sucesivamente» (L.141 / PDF 147; L.146 / PDF 152): la pestaña «Artes metálicas» ofrece al GM la acción «Nueva meta de nacido del
metal», que abre el `MetalPicker` en modo pareja/puro-aleación-o-atium sobre los poderes nacientes sin `metaId`, crea una `Meta`
con el título del camino y la enlaza por `metaId` (subtarea de T33). Botones ≥ 44 px, `Segmented` para el modo, sin emojis.
Reutilizable desde la pestaña «Artes metálicas» («Añadir poder», para `origen: 'clavo' | 'lerasium' | 'medallon'`, solo GM; crea
el poder con `completo: true`, §5.3).

### 7.6 Pestaña «Artes metálicas» (`src/components/mistborn/ArtesMetalicasTab.tsx`, `PoderCard.tsx`, `BeberVialSheet.tsx`; hoja L.404 / PDF 410)

Cabecera por arte: `Card` con `StatTile` **MOD. / LÍMITE / DADO / ALCANCE** desde `derivadosSet['alomancia.*']` (dado como
`d{total}`); feruquimia añade «Cargas máx.» y «Mentes a la vez». Lista sin tope de `PoderCard` (un nacido de la bruma supera las 4
casillas del papel): glifo del metal, «Alomancia de acero», subtítulo «Físico – Externo – Empujón» (alomancia:
`MetalDef.categoriaAlomancia` · interno/externo · Tirón/Empujón; el atium tiene `interno: null` y `empujon: null` y su subtítulo
es solo «Divino» («Metal divino», L.176 / PDF 182); feruquimia: `categoriaFeruquimica` · rasgo), chip `naciente`/`completo`,
`Switch` «Meta de nacido del metal completada» (enlaza la meta por `metaId`; marca `completo` vía `patchRecursos`), efecto y
acciones básicas del poder (datos estáticos, `TalentActivation`), `Stepper` de **cargas**
0..`derivadosSet['poder.<metal>.cargasMax']` (feruquimia; mientras el poder feruquímico esté **naciente** (`completo: false`) el
`Stepper` se muestra `disabled` con el texto «Fabrica tu mente de metal para almacenar cargas», L.162 / PDF 168, y `cargasMax` es
0; en un poder `origen: 'medallon'` el **jugador** solo decrece al decantar, porque almacenar en un medallón no genera cargas,
mientras que el **GM** ve el `Stepper` completo 0..8 y un botón «Medallón nuevo» que fija 8 (meta «Canjear por un medallón nuevo»,
L.293 / PDF 299)) o de **viales** (alomancia rara, nunca atium) o de **cuentas de atium** (`recursos.cuentasAtium`); en el poder
cuyo camino tiene el talento Componedor aprendido, botón «Usar Componedor (−1 máx.)» con `ConfirmDialog`
(`confirmLabel="Usar Componedor"`, `tone="brand"`, `icon` explícito: los valores por defecto son «Eliminar» y peligro,
`ui.tsx:990-1015`) que envía `patchRecursos({ poderes: [{ arte, metal, ajusteCargasMax: poder.ajusteCargasMax - 1 }] })` (L.155 /
PDF 161); `<Badge tone="topacio">Desprovisto</Badge>` (la prop `tone` de `Badge` es un `ToneName` en cadena, `ui.tsx:301-316`, no
el objeto `tone.topacio`), talentos del poder aprendidos (`talentos` ∩ árbol del poder, `TALENT_SUMMARIES_MISTBORN`). Todo escribe
con `charactersApi.patchRecursos` mediante **una `useMutation` optimista por prefijo** `['character', cId, chId]` (receta de §2:
`cancelQueries`/`getQueriesData`/`setQueriesData`, `onError` restaura, `onSettled` invalida; patrón de `talentosMutation`,
`TalentosDetailPage.tsx:176-208`); sin esto, tres toques rápidos del `Stepper` parten del mismo valor cacheado y se pierden
incrementos. `BeberVialSheet`: lista de metales de los poderes alománticos **distintos de atium** (L.176 / PDF 182) con `Switch`
(comunes **preseleccionados pero desmarcables** por el director, L.267 / PDF 273 «los que el alomante desee» → Q17; raros según
`viales > 0`), botón «Beber» → `charactersApi.beberVial`; texto «Si el vial contiene un metal que puedes quemar, restaura la
Investidura al máximo; deja Desprovisto cualquier poder cuyo metal no esté en el vial.» (L.129-130 / PDF 135-136). `EmptyState` si
no hay camino ni poderes.

### 7.7 Talentos (`src/lib/talentGraph.ts`, `talentMap.ts`, `components/talentos/*`)

Molde: cada poder de metal es una `Potencia` (`atributo`, `costoBase`, `talentos: Talento[]`) y cada camino NdM un `HeroicPath`
sin especialidades con árbol plano (informe de talentos §5.1).

```ts
// src/lib/talentRules.ts
export interface TalentRules {
  id: WorldId; caminosHeroicos: HeroicPath[]; caminosInvestidos: CaminoInvestidoDef[]; poderes: (Potencia | PoderDef)[]   // PoderDef = PoderAlomantico | PoderFeruquimico (§2); en talentGraph.ts el discriminador es `'ordenes' in p` (Potencia) frente a `'caminos' in p` (PoderDef)
  arbolesAscendencia: Record<string, ArbolAscendencia>          // { oyente: ARBOL_CANTOR } | { kandra, 'sangre-koloss' }
  grids: Record<string, TalentGrid>; summaries: Record<string, string>
  skillNameMap: Record<string, SkillField>                     // + 'Armamento ligero', 'Armamento pesado'
  nombresIdeales: readonly string[] | null; formasIniciales: readonly string[]; ignorarClausulas: readonly RegExp[]
  bonosCuentanParaRequisitos: boolean                          // Mistborn true (L.28 / PDF 34: los aumentos permanentes cuentan); Stormlight false (P1) — lo rellena cada mundo, sin comparar ids en src/lib/
  campoCaminoInvestido: 'caminoRadiante' | 'caminoMetal'      // campo de Character que guarda el camino Investido del mundo; graphOptionsFromCharacter lo lee (§7.7 #3)
}
export const STORMLIGHT_TALENTOS: TalentRules   // datos actuales por referencia
export const MISTBORN_TALENTOS: TalentRules     // se compone en src/worlds/mistborn.data.ts
```

1. **Parametrización** (`talentGraph.ts:42-45`, `:160-202`, `:278`, `:411`, `:1125`, `:1166`):
   `buildTalentGraph(options, rules = STORMLIGHT_TALENTOS)`, `parsePrereq(text, known, rules?)`, `catalog(rules)` cacheado por
   `rules.id`,
   `allTalentNames(rules?)`, `talentSlotsAt(level, ascendencia, startingPathId?, rules?)`, `talentBudget(ch, graph)` (el grafo
   lleva
   `rules`), `talentStateFromCharacter(ch: Character, extra: { confirmedStory?: readonly string[] } = {}, rules: TalentRules =
   STORMLIGHT_TALENTOS): TalentState` (firma actual `:593` más el tercer parámetro; el único llamador hoy es
   `TalentosDetailPage.tsx:123`, que pasa `graph.rules` (`TalentosPage.tsx:28` solo llama a `buildTalentGraph`/`talentBudget` y
   `MyTalents` no llama a ninguna de las dos: se toca en T37b); la llamada sin tercer argumento sigue siendo Stormlight, así que
   el `snap` de T34a no cambia). Sin cambio de salida para Stormlight.
2. **Gramática** (`parseClause` `:232-272`, `PrereqClause` `:212-219`, `SKILL_NAME_MAP` `:73`):
   `+= { kind: 'poder'; poderId: string }` (`^(?:poder\s+)?(alomancia|feruquimia) de (.+)$`; `met` si `state.poderes` contiene
   `${arte}:${metal}` con `completo`; sin nodo propio); `{ kind: 'skillAny'; options: { skill; field; min }[] }` («Armamento
   pesado 2 o más o Armamento ligero 2 o más»); `{ kind: 'atributo'; atributo: AttrField; min }` («Voluntad 4 o más»,
   `TalentState.atributos`; `talentStateFromCharacter(ch, extra, rules)` lo rellena con `atributos[attr] = ch[attr] +
   (rules.bonosCuentanParaRequisitos ? (ch.bonosAtributos?.[attr] ?? 0) : 0)` (flag de `TalentRules` que rellena cada mundo:
   ninguna comparación de ids de mundo en `src/lib/`): las Bendiciones kandra, Tamaño desmedido y Guardián del conocimiento son
   aumentos
   permanentes y cuentan para prerrequisitos, «los efectos que aumentan tus características de forma permanente cuentan para
   cumplir estos prerrequisitos», L.28 / PDF 34; los temporales, p. ej. la forma adoptada con Disfraz kandra, no; en Stormlight
   `atributos` = valor base, sin cambio, P1); `ancestry: string[]` generalizada («humana o de sangre koloss», «kandra», «cantor»);
   `{ kind: 'poderes'; modo: 'mismoMetal' | 'metalesDistintos' }` (Componedor / Resonancia aleada). «No tener ningún otro talento
   de ruptura o herencia» va a `rules.ignorarClausulas` (la exclusividad la garantiza el picker): en Mistborn, las cláusulas que
   casan con `rules.ignorarClausulas` se eliminan **antes** de `parseClause` y no generan gate; en Stormlight
   `ignorarClausulas = []`. Las cláusulas `unknown` conservan `status: 'unmet'` (siguen bloqueando, como hoy,
   `talentGraph.ts:734`) y `TalentSheet` **ya** las muestra con `g.label`/`g.text` (`TalentSheet.tsx:35, 45`): **no se cambia**
   ese comportamiento en ningún mundo.
3. **Grafo** (`TreeKind` `:297`, `TalentGraphOptions` `:299-306`, `buildTalentGraph` `:443-510`, `TalentState` `:577`):
   `TreeKind += 'caminoInvestido' | 'poder' | 'ascendencia'` (tipos genéricos: ningún nombre de Scadrial en el núcleo);
   `options += caminoInvestido?: string, poderes?: readonly PoderPersonaje[], ascendencia?`;
   `graphOptionsFromCharacter(ch, extraPaths, rules = STORMLIGHT_TALENTOS)` rellena
   `caminoInvestido = ch[rules.campoCaminoInvestido]`; bloque nuevo entre el radiante y el cantor,
   alimentado por `rules.caminosInvestidos` y `rules.poderes`: raíz `caminoInvestido:<id>` (clave = principal; `autoGranted` si
   camino inicial) + árbol plano del camino (solo para definiciones con árbol plano, `'talentos' in def`; las `RadiantOrder`
   siguen en el bloque `radiante:*` actual, P1) + un árbol `poder:<arte>:<metal>` por poder del personaje (`keyNodeId` =
   principal; nodos bloqueados por `gateBadge: 'meta'` hasta `completo`, como `potencia:*` con el Primer Ideal, `:490`). **Los
   nodos del árbol `caminoInvestido:<camino>` distintos del principal también quedan bloqueados (`gateBadge: 'meta'`) hasta que
   esté
   completa la meta del talento principal**: «si has elegido el talento principal Ruptura de brumoso… pero no has completado su
   meta “Entrenar tu poder”, todavía no puedes elegir los talentos Investido o Quemar instintivamente» (L.75 / PDF 81); importa
   mecánicamente porque Investido da +rango de Investidura. Para nacido de la bruma, feruquimista y nacidoble basta con que esté
   concluida al menos una meta de nacido del metal del camino [inferido a partir del ejemplo del brumoso, L.75 / PDF 81 → Q26];
   los árboles `poder:*` siguen bloqueados poder a poder por su `completo`. Árboles `ascendencia:kandra` (autoGranted «Forma
   natural», «Disfraz kandra», L.35-37 / PDF 41-43) y `ascendencia:sangre-koloss` (autoGranted «Resistencia koloss», L.38 / PDF
   44; el servidor los cuenta vía `TalentosImplicitos`, §6.1). **Calendario de huecos de ascendencia por mundo**
   (`talentSlotsAt(level, ascendencia, startingPathId?, rules?)`; la rama actual `cantor`/humano de `talentGraph.ts:1125-1146` se
   conserva intacta para Stormlight): en Mistborn `ArbolAscendencia` declara `{ autoGranted: string[]; hitos: number[]; acepta:
   SlotKind[]; talentos: Talento[] }` y `talentSlotsAt` lo lee de `rules.arbolesAscendencia[ascendenciaId]`: **Humano**
   `{ autoGranted: [], hitos: [1, 6, 11, 16, 21], acepta: ['heroico'] }` (L.32 / PDF 38, idéntico a hoy); **Kandra** `{
   autoGranted: ['Forma natural', 'Disfraz kandra'], hitos: [6, 11, 16, 21], acepta: ['ascendencia', 'heroico'] }` (L.34 / PDF 40:
   «Forma natural (nivel 1)… Talentos adicionales de ascendencia (niveles 6, 11, 16 y 21)… del árbol kandra o de cualquier camino
   heroico»); **Sangre koloss** `{ autoGranted: ['Resistencia koloss'], hitos: [6, 11, 16, 21], acepta: ['ascendencia', 'heroico']
   }` (L.38 / PDF 44). En el nivel 1, kandra y sangre koloss **no** reciben hueco de ascendencia libre: por cada talento
   `autoGranted` se genera un hueco `source: 'ascendencia'` de nivel 1 con `accepts: ['ascendencia']` y etiqueta «Nivel 1 ·
   kandra: Forma natural» (mismo patrón que `Cambiar de forma` del cantor, `talentGraph.ts:509`, `:1137`), de modo que
   `talentBudget` (`:1180`, que cuenta los `autoGranted`) los coloca y no los cuenta como exceso. Etiquetas de los hitos: «Nivel N
   · kandra: talento kandra o heroico» / «Nivel N · sangre koloss: talento koloss o heroico». `slotKindOf` devuelve
   `'ascendencia'` para los nodos de los árboles `ascendencia:*`. **Identidad de nodo** = `(árbol, nombre)` para el grafo y solo
   `nombre` para `talentos[]`: tener un talento con ese nombre lo da por elegido en todos los árboles donde aparezca («Talentos
   con nombres duplicados», L.75 / PDF 81). Duplicados reales: 7 en alomancia (Prevenirse con palanca; Burbuja ampliada, Burbuja
   espontánea, Burbuja expeditiva; Control de masas, Influencia precisa, Manipulación sutil), 1 en feruquimia (Reflejos
   acelerados: acero y cinc), 3 compartidos entre alomancia y feruquimia (Precisión de estaño, Armamento de brazo de peltre,
   Lanzador de peltre) y 7 entre caminos NdM con prerrequisito distinto (Investido, Quemar instintivamente, Trazas de metal,
   Almacenamiento rápido, Mentes de metal ampliadas, Decantación instintiva, Mente de metal integrada; L.136, 142, 146, 150, 155 /
   PDF 142, 148, 152, 156, 161). `SlotKind` (`:1081`) `+= 'caminoInvestido' | 'poder' | 'ascendencia'`; `slotKindOf`
   (`:1148-1159`)
   deja de caer en `'radiante'`; hueco de nivel acepta todo; hueco humano solo `heroico` (L.32 / PDF 38); hueco de ascendencia
   kandra/koloss acepta `['ascendencia','heroico']` (calendario de arriba); hueco principal acepta `caminoInvestido` si
   `caminoInicial === 'metal'` [inferido → Q27].
4. **Mapa y UI**: `gridKeyOf` (`talentMap.ts:76-81`) devuelve `poder:<arte>:<metal>`, `caminoInvestido:<camino>`,
   `ascendencia:<id>`; `PlateKind += 'poder' | 'caminoInvestido' | 'ascendencia'`; `talentMap.ts` importa hoy `TALENT_GRIDS` y
   `TALENT_SUMMARIES` de forma estática (`:14-15`) y los usa en `summaryOf(node)` (`:26-28`) y `plateOf` (`:85`): pasan a leer
   `graph.rules.grids` / `graph.rules.summaries` (`summaryOf(node, summaries)`), y sus llamadores `PathAtlas.tsx:655`,
   `TalentLamina.tsx:188` y `MyTalents.tsx:181` (que usa `TALENT_SUMMARIES` directamente) pasan `graph.rules.summaries`; sin esto
   el
   mapa de Nacidos de la Bruma nunca usaría `TALENT_GRIDS_MISTBORN` ni `TALENT_SUMMARIES_MISTBORN` (T37a/T37b); `PathAtlas` pinta
   solo las láminas de los poderes del personaje y el resto en `Disclosure` «Otros poderes» (patrón `showOthers`,
   `TalentosDetailPage.tsx:129-144`); con más de 3 poderes, `plates` en filas de 3 con bus y `caretX` por fila
   (`PathAtlas.tsx:224`, `mapDims` `talentMap.ts:225-251`). `gateBadge` hoy solo se calcula en `talentGraph.ts:644,856,875` y
   **ningún componente lo lee** (las insignias salen de los `gates`; `MapPieces.tsx:91-94` es `IdealGlyph`): se amplía con
   `'meta'` y **se consume en `PathAtlas`/`TalentLamina` con el glifo del metal** (`MetalGlyph`, con Lucide de reserva hasta T46;
   `MapPieces.tsx:91-94` gana la insignia `meta`; decisión fija); textos «Meta de nacido del metal pendiente»
   (`TalentLamina.tsx:36-41`, `TalentSheet.tsx:31,41`);
   `TalentosDetailPage.tsx:447` → `cfg.textos.vacioTalentos` («Asigna un camino heroico o un camino de nacido del metal en la
   ficha…» en Mistborn; texto actual en Stormlight); `IdealesControl`/`idealesMutation` solo con `features.idealesJurados` y
   `onChangeForma`/`FormaPicker` solo con `features.formasCantor` (`:488`, `:507`; este gating solo depende de `features` y se
   hace en F1, T09); `MyTalents` sustituye `RADIANT_ACTIONS` por «Beber vial (1)» y las acciones básicas de cada poder.
5. **Rejillas**: sin entrada en `grids` el mapa cae a 2 carriles en orden de lectura (`talentMap.ts:102-104`); después rejillas
   transcritas del PDF renderizado (T38-1: caminos, especialidades y ascendencias; T38-2: poderes).

### 7.8 Metas, bolsa, dados, enciclopedia, catálogo, PNJ, diario, tema, iconos

| Pantalla | Cambio | Primitivas `ui.tsx` / DESIGN.md |
|---|---|---|
| Metas (`MetasDetailPage.tsx:82-110`, `MetaCard`) | `MetaCard` solo recibe `{ meta, campaignId, characterId, index }` (`:82`) y sus mutaciones solo invalidan `['metas', campaignId, characterId]` (`:101-110`): gana la prop `poderes: PoderPersonaje[]` (desde `character.poderes` de la página, `:318`); `Badge` «Meta de nacido del metal» si `poderes.some(p => p.metaId === meta.id)`; `concludeMutation` y `deleteMutation` invalidan además `['character', campaignId, characterId]` y `['characters', campaignId]` (T14 también cambia `poderes` al **borrar** una meta, `MetaId = null`); al concluir (con cualquier `tipoConclusion`, Q20) el servidor marca el poder completo y la UI muestra bajo la meta un aviso inline `role="status"` con `<Badge tone="esmeralda">Poder completo: Alomancia de acero</Badge>` (`tone` es `ToneName` en cadena, `ui.tsx:301-316`), calculado comparando `poderes` antes y después de concluir. No existe ninguna primitiva `toast` en el repo (`grep -ri toast src` → solo el comentario de `index.css:468`; `ui.tsx` no la exporta): si se quiere aviso flotante, crear `Toast` en `ui.tsx` como tarea aparte. | `Badge` |
| Bolsa (`BolsaDetailPage.tsx:32-33, 233-241, 332-429, 785`) | «Arquillas» (`Stepper` `step={0.01} decimals={2}` sobre `recursos.arquillas` vía `patchRecursos`; **`Stepper` gana dos props en `ui.tsx:768-804` (T29; `ui.tsx` se edita como primer paso de T29, y T30 y T32a dependen de ello; T29 va después de T26 y T27, §10 F4)**: `disabled?: boolean` (los dos botones `disabled = disabled \|\| value ∓ step < min / > max`; el `<output>` con `aria-disabled`) y `decimals?: number` (redondea `Number((value ± step).toFixed(decimals))` antes de `onChange` y en el cálculo de `disabled`; hoy suma `value ± step` sin redondear, `ui.tsx:797-803`, y 0,1 + 0,2 daría 0,30000000000000004, que la validación de 2 decimales rechazaría); diálogos «Añadir / Gastar arquillas») en lugar de «Marcos» si `features.arquillas`; `getCapacity` lee `cfg.tablas.cargaKg` y la tarjeta de capacidad muestra una segunda línea «Levantar hasta N kg» con `cfg.tablas.levantamientoKg[tramo]` **solo cuando la tabla existe** (Mistborn; Stormlight no la declara, §7.1); precio `formatMoneda(value, cfg.moneda)` («0,05 ar», `toLocaleString('es-ES')`) con imagen `dinero-era1\|era2` o `Coins`; picker con `Input` de búsqueda y chips de subcategoría (ligeras, pesadas, especiales, fuego; equipo); oculta `isRewardOnly`. **Viales**: los `GearItems` con `category === 'vial'` son solo referencia de precio y descripción (como cualquier objeto): comprarlos **no** modifica `poderes[].viales` (Q21); el recuento de viales de un metal raro vive únicamente en `PoderPersonaje.Viales` y se edita con el `Stepper` de la tarjeta del poder (§7.6) o con `PATCH …/recursos`; el picker de «Equipo» de la Bolsa **no lista** los `category === 'vial'` (solo aparecen en Enciclopedia → Catálogo), para evitar el doble conteo (un «Vial de oro» en `equipment` más `viales`); ese filtro es de **T41**, cuando `GearItem.category` ya existe (T39a/T40); T32a no filtra por categoría. **Mentes de metal** (Q23): no son objetos de la bolsa ni filas del catálogo en v1 (informe 07 §: «cuerpo de enciclopedia, no catálogo»; L.131 / PDF 137); cada poder feruquímico es su propia mente de metal y sus cargas viven en `PoderPersonaje.Cargas` (pestaña «Artes metálicas»). La Bolsa muestra bajo «Equipo» un enlace «Cargas en Artes metálicas →» si `features.artesMetalicas && poderes.some(p => p.arte === 'feruquimia')`. Mentes desligadas y medallones como objetos con cargas → §13. | `Stepper`, `Sheet`, `Segmented`, `Input` |
| Dados (`DiceRoller.tsx:25-55, 68-87, 773, 1012`) | `SKILLS`/`SKILL_TO_FIELDS` se derivan de `cfg.habilidadesTirador ?? cfg.habilidades` (T43; en Stormlight la tabla de legado, idéntica a la local de hoy; en Mistborn `HABILIDADES_COSMERE`; las constantes locales `:25-55` se borran porque `skills.ts` ya las contiene desde T06b, §7.1). `getCharMod` (`:68-87`; `:88-97` es `getCharSkills`) es una función de módulo fuera del componente y no puede usar hooks: pasa a `getCharMod(char, skillName, bonosAtributos: boolean)` y sus llamadores dentro del componente pasan `cfg.features.bonosServidor`; con `true` suma `char.bonosAtributos?.[attrField] ?? 0` al atributo crudo (en Mistborn un kandra con Bendición de la Estabilidad tiraría Alomancia con 2 puntos de menos sin esto; en Stormlight el diccionario trae el bono de forma del WIP, que el tirador ignora hoy: corregirlo cambiaría el modificador de los cantores de la campaña en curso, así que **no** se hace aquí (P1) y se hace en T50, F7 (Q22 = sí: el motor que suma el bono es Cosmere, el bono es del mundo)). `WEAPON_SKILLS` dinámico añade las `habilidadesInvestidas` con `ataque` (Alomancia: «Lanzar una moneda» vs Defensa física, L.172 / PDF 178) con dado de daño por defecto = `character.derivadosSet['alomancia.dado'].total` y alcance `['alomancia.alcance'].total` (los calcula el servidor; `utils/dice.ts` **no** importa nada de `src/data/mistborn/` ni replica la progresión: P5, una tabla C# y su espejo TS solo en `progresionArtes.ts` para la enciclopedia); si el director tira sin personaje seleccionado, elige el dado a mano en `DAMAGE_DICE`. Recuperación: «La Investidura no se recupera con el descanso: usa Beber vial» si `features.artesMetalicas` (L.129 / PDF 135 para Beber vial; L.306-307 / PDF 312-313: el descanso solo recupera salud y concentración [inferido que no hay otra vía]). El d12 de trama (`dice.ts:81-90`) es un defecto previo común: fuera de este proyecto. | sin UI nueva |
| Enciclopedia (`EncyclopediaPage.tsx:99-107, 109-197, 200-206, 210`) | `TOPICS` pasa a `useWorldConfig().enciclopedia` (`TopicDef[]`, §7.1; los `emblem` JSX de Stormlight se mueven a `src/worlds/stormlight.topics.tsx`; `pathFor()` conserva el caso especial `'catalog'`); Mistborn: Orígenes (`tone.granate`), Caminos Heroicos, Caminos de nacido del metal (`tone.topacio`), Artes metálicas (`tone.amatista`), Combate, Aventuras, Catálogo («…del mundo de Scadrial»). Subtítulo «Lore y referencia del mundo de {cfg.planeta}». `HeroicPathsPage.tsx:250` datos y subtítulo por mundo. `CombatPage.tsx:68` subtítulo. | `Card`, `PageHeader` |
| Páginas Mistborn nuevas (`pages/encyclopedia/mistborn/`) | `OrigenesPage` (3 ascendencias, Bendiciones, árboles kandra/koloss, 15 culturas por era), `CaminosMetalPage` (5 caminos con `Tabs`: principal, qué concede, árbol, meta), `ArtesMetalicasPage` (`Tabs` Alomancia / Feruquimia / Hemalurgia; tabla «Progresión de las artes metálicas» L.163; cuadrícula de 17 metales con glifo, categoría, era), `PoderMetalPage` (`/:arte/:metal`: acciones, usos creativos, talentos con `TalentActivation`). Patrón visual de `RadiantOrdersPage`/`PotenciasPage`. | `Tabs`, `TabPanel`, `Card`, `StatTile`, `TalentActivation`, `Disclosure` |
| Catálogo (`src/pages/catalog/CatalogPage.tsx:36, 150-157, 204-224, 690, 800, 881-892`; `BolsaDetailPage.tsx:158-170`) | **Las claves actuales son incoherentes entre páginas**: `CatalogPage` usa `['catalog-weapons' \| 'catalog-armor' \| 'catalog-gear']` y `['opts', X]` (`:881-892`), `BolsaDetailPage` usa `['catalog', 'weapons' \| …]` y `['opts', X]` (`:160-170`); una invalidación por prefijo `['catalog', cId]` no tocaría las de `CatalogPage`. Renombrar todas a `['catalog', cId, 'weapons' \| 'armor' \| 'gear']` y `['catalog', cId, 'opts', cat]` y revisar las invalidaciones sueltas (`CatalogPage.tsx:204, 220, 224, 690, 800`). `campaignId` en la API (`createWeapon/createArmor(payload & { campaignId })`, `deleteWeapon/deleteArmor(id, campaignId)`, `update*Description(id, description, campaignId)`), `price` con `cfg.moneda`, chip «Era 2», precio en armas y armaduras, campo Precio y «Solo recompensa» en el formulario propio; «Añadir arma», «Eliminar» y «Editar descripción» siguen mostrándose **solo al GM**, como hoy (`CatalogPage.tsx:913, :276, :435`; §5.2, Q9). | existentes |
| PNJ (`GlobalNpcListPage.tsx:96-98`, `GlobalNpcDetailPage.tsx:17-54, 61-65`, `NpcNotesPage.tsx:420-423`) | `getAll(cId)`, `create(body, cId)`, `update(id, body, cId)`, `delete(id, cId)` con `?campaignId=` (§5.2), clave `['global-npcs', cId]`; el servidor fija `world` desde la campaña (nada en el cuerpo); habilidades desde `cfg.habilidadesPnj ?? cfg.habilidades` (T26: en Stormlight la tabla de legado, idéntica a la local de hoy; en Mistborn `HABILIDADES_COSMERE`; sin comparación de ids de mundo, §7.1). La ruta `global-npcs/:npcId` abre cualquier PNJ por id: si `npc.world !== useWorld()` (enlace guardado a un adversario de Caminapiedras desde una campaña Mistborn), `GlobalNpcDetailPage` renderiza `EmptyState` «Este adversario pertenece a otra ambientación» con `Button` «Volver a NPCs» (`../gm`), sin editar ni borrar (T42b). `RESOURCES` (`:61-65`) es una constante a nivel de módulo que usa `StatIcons.investidura`: pasa a construirse dentro del componente con `useWorldConfig().iconos.investidura`, y la fila Investidura se muestra solo si `maxInvestiture > 0` cuando `features.artesMetalicas` [inferido → Q27]. **Artes metálicas de los PNJ**: `GlobalNpcEntity` tiene 18 habilidades fijas, `Talentos` y `Notas`, sin huecos personalizados ni campo de artes (`GlobalNpcEntity.cs:40-49`); en v1 los grados de Alomancia/Feruquimia, los metales y las acciones alománticas del adversario se escriben en `Notas`, igual que hoy las defensas y el movimiento (`20260408073708_SeedAllNpcs.cs:42,54`), y `maxInvestiture` recoge su Investidura máxima; en Mistborn la sección de notas se titula «Notas, poderes y tácticas». Columnas estructuradas → §13. | existentes |
| Diario (`DiarioPage.tsx:259, 390`) | leyenda `spren` oculta si `!features.mencionSpren`; estado vacío con `cfg.emblema`. | — |
| Tema (`src/index.css`) | bloques `:root[data-world='mistborn']`, `:root[data-world='mistborn'][data-theme='light']` y `@media (prefers-color-scheme: light) { :root[data-world='mistborn']:not([data-theme='dark']) }` **después** de los actuales (`index.css:101-298`), paleta acero/peltre del informe UI §6.3 (`--brand #a9bccd` / `#3a5672`, `--bg #0c0b0d` / `#ebe8e6`, `--atmo` con el rojo del sol de Era 1). Se conservan `--gold*`, `--navy*` y los 10 tonos gema. En el `<style>` inicial de `index.html` (`:57-59`, que hoy pinta `#0a0e15` / `#e8ecf1` según `data-theme` y `prefers-color-scheme`): `html[data-world='mistborn'], html[data-world='mistborn'] body { background: #0c0b0d }` **más las reglas claras equivalentes** `@media (prefers-color-scheme: light) { html[data-world='mistborn']:not([data-theme='dark']) … { background: #ebe8e6 } }` y `html[data-world='mistborn'][data-theme='light'] … { background: #ebe8e6 }` (sin ellas el tema claro pintaría oscuro antes de la hidratación). `applyTheme` se vuelve a llamar desde el `useLayoutEffect` de `AppLayout` tras fijar `dataset.world` (§7.2). | solo tokens |
| Iconos | Oficiales primero (DESIGN.md «Iconography»): glifos alománticos Era 1/Era 2 (fuentes incrustadas en `<pdfPath>` página 411), glifos feruquímicos (trazados, página 411), emblema (página 410), dinero (página 260) → `src/assets/cosmere/mistborn/alomancia-era1-<metal>.svg`, `alomancia-era2-<metal>.svg`, `feruquimia-<metal>.svg` (50 glifos), `src/assets/cosmere/nacidos-bruma-emblem.svg` (**en la raíz**, dentro del glob eager, como `archivo-tormentas.svg`: un solo SVG pequeño que `WorldBadge` (Sidebar, Home, Ajustes) y el `Sheet` de creación consumen de forma **síncrona** con `CosmereIcon name="nacidos-bruma-emblem"`; `CosmereIcon`/`hasCosmereIcon` solo resuelven nombres del glob `../assets/cosmere/*.svg`, así que en `mistborn/` nunca se encontraría), `src/assets/cosmere/img/dinero-era1.webp`, `img/dinero-era2.webp`. **Atención**: `lib/cosmereAssets.ts:2` carga los SVG con `eager: true` (glob `../assets/cosmere/*.svg`, 44 SVG), así que 50 glifos nuevos en esa carpeta entrarían en el bundle Stormlight; T45 los mete en la subcarpeta `mistborn/` (fuera de ese glob) y T46 los carga desde **un único módulo perezoso** `src/lib/mistbornAssets.ts` (`import.meta.glob('../assets/cosmere/mistborn/*.svg', { query: '?raw', import: 'default', eager: true })`: un solo chunk `mistbornAssets-*.js` con los 50 glifos, que solo se descarga con `await import('../lib/mistbornAssets')` desde `MetalGlyph`/`mistborn.data.ts`; un glob no eager produciría 50 micro-chunks y 50 entradas de precache). `MetalGlyph` (`src/components/mistborn/MetalGlyph.tsx`, `{ metal, arte, era?, size }`) con icono de reserva de Lucide `Flame`/`Anvil`. Nota PWA: el service worker (`vite-plugin-pwa`, `vite.config.ts:11-40`, sin `globPatterns` explícitos) precachea por defecto `**/*.{js,css,html}`, así que **sí** descargará ese chunk en segundo plano para todos los usuarios; es aceptable y no afecta a la primera pintura. El objetivo medible es el tamaño del chunk principal (hoy 1,43 MB), que debe quedar < 2 MiB (`maximumFileSizeToCacheInBytes` por defecto de workbox) o el SW lo excluirá del precache y la app perderá el modo offline sin error de build. Caminos NdM: Lucide `Flame`, `CloudFog`, `Container`, `Package`, `Merge` [inferido → Q18]. `StatIcons.investidura` por mundo (`Gem` / `Flame`): `StatIcons` no es un hook y se usa en `CharacterDetailPage.tsx:827` y en la constante de módulo `RESOURCES` de `GlobalNpcDetailPage.tsx:61-65`; ambos pasan a `useWorldConfig().iconos.investidura` dentro del componente. Nunca emojis. | `CosmereIcon`, `cosmereImage` |

Restricciones transversales de DESIGN.md para todo lo anterior: solo tokens y `tone.*`/`ink()`/`tint()`, nunca colores literales
en componentes (los hex de caminos y metales viven en datos y pasan por `ink()/tint()`); overlays con `Sheet`/`ConfirmDialog`;
`Segmented` para elección única; `Tabs` WAI-ARIA; targets ≥ 44 px; `h1→h2→h3` sin saltos; `maxWidth: 680`; estilos inline; sin
Tailwind; toda eliminación con `ConfirmDialog`; `npx tsc -b` y `npm run lint` limpios.

## 8. Datos estáticos de Nacidos de la Bruma (`src/data/mistborn/`)

Organización: carpeta nueva `src/data/mistborn/`; los ficheros Stormlight de `src/data/*.ts` **no se mueven** (ningún import
cambia). `src/data/mistborn/index.ts` re-exporta todo; `src/worlds/mistborn.data.ts` compone `MISTBORN_TALENTOS` y los overlays
y es el único punto que se carga con `import()` (riesgo de bundle, §11). **Regla de importación (riesgo 6):** el barrel `index.ts`
solo lo importa `src/worlds/mistborn.data.ts` (perezoso). Todo módulo que viaje en el bundle principal
(`CharacterDetailPage.tsx`, `src/components/mistborn/*`, `utils/dice.ts`, `worlds/mistborn.ts`) importa **por fichero**
(`'../../data/mistborn/metales'`, `'…/caminosNacidosDelMetal'`, `'…/origenes'`, `'…/progresionArtes'`), nunca desde el barrel, y
nunca `alomancia.ts`, `feruquimia.ts`, `heroicPaths.ts`, `talentGrids.ts` ni `talentSummaries.ts`, que solo viajan en
`WorldData` (el barrel re-exporta ≈2.000 líneas de árboles y una constante derivada no pura arrastraría todo al chunk
principal). Composición de `MISTBORN_TALENTOS` (T34a): `grids = { ...pick(TALENT_GRIDS, clavesHeroicoReutilizadas),
...TALENT_GRIDS_MISTBORN }` y `summaries = { ...TALENT_SUMMARIES, ...TALENT_SUMMARIES_MISTBORN }`, donde
`clavesHeroicoReutilizadas` son las `heroico:<camino>:<Especialidad>` de las 10 especialidades que `HEROIC_PATHS_MISTBORN`
reutiliza por referencia (sin esto perderían su rejilla). Los tipos compartidos `Talento` y `TalentGrid` viven en
`src/lib/talentTypes.ts` desde T34a (`potencias.ts` y `talentGrids.ts` los reexportan para no romper ningún import); `Potencia` y
`HeroicPath` se importan de `src/data/potencias.ts` y `src/data/heroicPaths.ts`; los tipos de poderes de metal, de `tipos.ts`
(T16).

| Fichero | Export (tipo) | Contenido | Libro | Volumen est. |
|---|---|---|---|---|
| `eras.ts` | `ERAS: Record<Era, { label; lema; aviso? }>` | «Era 1: El Mundo de Ceniza» (aviso de tono), «Era 2: Cambio y revolución» | L.371-372 / PDF 377-378 | 40 líneas |
| `metales.ts` | `METALES: MetalDef[]` (17), `MetalId`, `pareja(id)`, `esComun(id)` · `MetalDef { id; nombre; categoriaAlomancia: 'fisico'\|'mental'\|'mejora'\|'temporal'\|'divino'; categoriaFeruquimia: 'fisico'\|'cognitivo'\|'espiritual'\|'hibrido'\|'divino'; puro: boolean; pareja: MetalId\|null; interno: boolean\|null; empujon: boolean\|null; nombreBrumoso; nombreFerrin; rasgoFeruquimico; eras: Era[]; comun: boolean; color: string }` (dos categorías porque difieren por arte, §2; el atium lleva `pareja: null`, `interno: null`, `empujon: null`: en la tabla del libro sus columnas Emparejado, Tirón/Empujón y Externo/Interno son «n/a», L.168 / PDF 174, L.171 / PDF 177) · `METALES_POR_CAMINO_Y_ERA: Record<CaminoMetalId, Record<'era1' \| 'era2', MetalId[]>>`, copia literal de L.372 / PDF 378: Era 1 feruquimista y nacido de la bruma = acero, atium, bronce, cinc, cobre, estaño, hierro, latón, oro, peltre; Era 1 brumoso = los mismos **sin oro**; Era 2 brumoso, ferrin y nacidoble = acero, aluminio, bendaleo, bronce, cadmio, cinc, cobre, cromo, duraluminio, electro, estaño, hierro, latón, nicrosil, oro, peltre (sin atium); feruquimista/nacido de la bruma en Era 2 y ferrin/nacidoble en Era 1 = `[]`. `notaLibro`: «A finales de la Era 1 el aluminio, el duraluminio y el electro, y la existencia de los brumosos de oro, dejan de ser secreto» [inferido: ofrecerlos como opción del director]; «El consejo para la DJ del feruquimista (L.145 / PDF 151) habla de gestionar hasta diecisiete poderes; la tabla de L.372 / PDF 378 manda y da 10 en Era 1 (el resto, a finales de la era como opción del director [inferido]). La feruquimia de aluminio se describe como disponible en ambas eras (L.216 / PDF 222): no ampliar la tabla sin confirmar.» | tabla de metales **transcrita desde la imagen de las páginas 172-177** (T16; el texto de `mistborn_flow.txt` llega con las columnas desordenadas) | L.166-171 / PDF 172-177; L.372 / PDF 378 | 220 |
| `progresionArtes.ts` | `PROGRESION_ARTES_METALICAS` (grados 0..6 → límite, dado, alcance) | tabla; la consume `ArtesMetalicasPage` (T24b); el tirador no la usa (lee `derivadosSet`, §7.8) | L.163 / PDF 169 | 30 |
| `tipos.ts` (T16) | `PoderAlomantico`, `PoderFeruquimico` (ambos `extends Omit<Potencia, 'ordenes'>` + `caminos`, `eras`, `requiereMeta`, `acciones[]`, `usosCreativos[]`, `notaLibro?`; `PoderFeruquimico` añade `almacenar`/`decantar`, `cargasConVinculo`, `tablaPorGrados`, `medallon`), `PoderDef = PoderAlomantico \| PoderFeruquimico` | solo tipos: los crea T16 porque T17 y T18 corren en paralelo y ambos los necesitan; T16 sustituye con ellos el `unknown` de `src/worlds/types.ts` | — | 60 |
| `alomancia.ts` | `PODERES_ALOMANTICOS: PoderAlomantico[]` (17; tipo de `tipos.ts`, T16: `extends Omit<Potencia, 'ordenes'>` (`Potencia.ordenes: string[]` es obligatorio y Stormlight, `src/data/potencias.ts:12-20`; ídem `PoderFeruquimico`): `id 'alomancia:acero'`, `name 'Alomancia de acero'`, `atributo 'Voluntad'`, `caminos`, `eras`, `requiereMeta`, `acciones[]` (nombre, activación, duración, coste), `usosCreativos[]`, `talentos: Talento[]`, `notaLibro?`) | 20 acciones básicas, 83 entradas de talento (76 nombres distintos: 7 duplicados entre árboles, §7.7 #3), alomancia de aluminio sin árbol (0 talentos), atium `requiereMeta: false` | L.172-212 / PDF 178-218 (acero 172, aluminio 175, atium 176, bendaleo 179, bronce 182, cadmio 185, cinc 188, cobre 191, cromo 193, duraluminio 195, electro 197, estaño 199, hierro 201, latón 204, nicrosil 207, oro 209, peltre 211) | 950 |
| `feruquimia.ts` | `PODERES_FERUQUIMICOS: PoderFeruquimico[]` (17; mismo molde; `almacenar`/`decantar` con duración de ganancia de carga, `cargasConVinculo`, `tablaPorGrados` (solo cobre), `medallon`) | 34 acciones, 85 entradas de talento (84 nombres distintos: Reflejos acelerados en acero y cinc; 3 nombres compartidos con la alomancia, §7.7 #3), feruquimia de aluminio 3 talentos, nicrosil `talentos: []` | L.213-250 / PDF 219-256 | 1000 |
| `caminosNacidosDelMetal.ts` | `CAMINOS_NACIDOS_DEL_METAL: CaminoNacidoDelMetal[]` (5; mismos campos `mainTalent*` que `HeroicPath` (`mainTalent` exacto: Ruptura de brumoso, Ruptura de nacido de la bruma, Herencia feruquímica, Herencia ferrin, Herencia nacidoble), `talentos: Talento[]` (**sin** el principal), `habilidadesInvestidas`, `habilidadInicial: 'Alomancia' \| 'Feruquimia' \| 'Disciplina' \| null` (`null` en nacido-de-la-bruma y feruquimista, L.141 / PDF 147; L.145 / PDF 151), `poderes: { alomancia: 1 \| 'todos' \| 0; feruquimia: … }`, `seleccionMeta: 'uno' \| 'pareja' \| 'puro-aleacion-o-atium' \| 'uno-por-arte'`, `concedeInvestidura`, `metasIniciales` (títulos de §2), `eras`, `ascendenciasPermitidas` (brumoso, ferrin y nacidoble `['Humano', 'Sangre koloss']`, L.135 / PDF 141, L.150 / PDF 156, L.155 / PDF 161; nacido-de-la-bruma y feruquimista `['Humano']`, L.141 / PDF 147, L.146 / PDF 152; Kandra excluida en los 5, L.18 / PDF 24), `color`, `icon`) | 5 principales + 33 de árbol (19 nombres únicos: 7 nombres se repiten entre caminos con prerrequisito distinto, §7.7 #3); Componedor (L.155 / PDF 161) / Resonancia aleada (L.159 / PDF 165) con condiciones sobre metales | L.127-159 / PDF 133-165 (brumoso 134-137, nacido de la bruma 138-143, feruquimista 144-147, ferrin 148-151, nacidoble 152-159) | 380 |
| `origenes.ts` | `ASCENDENCIAS_MB`, `BENDICIONES_KANDRA` (5: id, nombre, bonos, descripción), `ARBOL_KANDRA: Talento[]` (8), `ARBOL_SANGRE_KOLOSS: Talento[]` (5), `CULTURAS: Cultura[]` (15, con era) | orígenes | L.31-48 / PDF 37-54 | 320 |
| `heroicPaths.ts` | `HEROIC_PATHS_MISTBORN: HeroicPath[]` (6; reutiliza por referencia las especialidades comunes de `../heroicPaths` y añade Rebelde, Mataneblinos, Francotirador, Estafador, Inventor (Era 2), Alborotador, Pistolero (Era 2), Planificador) | 8 especialidades nuevas (≈8 talentos cada una) | cap. 4 L.73-126 / PDF 79-132 | 650 |
| `hemalurgia.ts` | `TIPOS_CLAVO` (12: metal, qué roba, rango), `REGLAS_HEMALURGIA` (texto: implantar 3 acciones Medicina CD 20, extraer 1 acción CD 10, máx. clavos = rango ≤ 3, −2/−5 Defensa espiritual, Desorientado ≤ 9) | solo enciclopedia en v1 | L.251 / PDF 257; L.288-292 / PDF 294-298 | 120 |
| `aventurasOverlay.ts` | `MISTBORN_AVENTURAS: AventurasOverlay` | +Desprovisto, +Mermado, −Empoderado, Inconsciente sin excepción radiante, descansos +«Almacenar en mentes de metal», +«Mentoría en las artes metálicas», moneda y ejemplos (17 operaciones del informe de reglas base §6.2) | L.306-315 / PDF 312-321 | 150 |
| `combatOverlay.ts` | `MISTBORN_COMBATE: CombatOverlay` | Agarrar → Retenido; Acometida reactiva + sin armas; Sorpresa por personaje; zona «poderes y capacidades»; Interactuar (6 operaciones) | L.317-329 / PDF 323-335 | 50 |
| `talentGrids.ts` | `TALENT_GRIDS_MISTBORN: Record<string, TalentGrid>` claves `poder:alomancia:<metal>` (16), `poder:feruquimia:<metal>` (16), `caminoInvestido:<camino>` (5), `ascendencia:kandra\|sangre-koloss`, `heroico:<camino>:<Especialidad>` (8) | geometría de diagramas (solo en imagen; T38-1: caminos, especialidades y ascendencias; T38-2: los 32 poderes) | páginas de cada entrada | 450 |
| `talentSummaries.ts` | `TALENT_SUMMARIES_MISTBORN: Record<string, string>` | una frase por talento (≈210; T38-1) | líneas de los diagramas | 230 |
| `equipoInicial.ts` (F7) | `EQUIPO_INICIAL: PaqueteInicial[]` (7) | Artesano 4d8, Bajos fondos 1d20, Fugitivo, Guardador, Indagador 3d12, Mercenario 2d6, Noble 4d20; ×10 en Era 2. `notaLibro`: «errata del libro: el “equipo inicial de Militar” de los ejemplos icónicos (Marasi L.135 / PDF 141, Razal L.149 / PDF 155, Wax L.153 / PDF 159, Miles L.154 / PDF 160) no existe en la lista de siete; equivale a Mercenario [inferido]» | L.254-255 / PDF 260-261 | 120 |
| `src/data/overlays.ts` (compartido, fuera de `mistborn/`) | `Overlay<T> { add?: T[]; remove?: string[]; replace?: T[] }`, `SectionOverlay`, `resolveAventuras(world, overlay?)`, `resolveCombat(world, overlay?)` | Con T23, Stormlight devuelve los arrays actuales **por identidad** (base intacta); desde T23b la base es neutra (Cosmere) y `stormlight` resuelve con su propio overlay a arrays **JSON-idénticos** a los actuales | — | 80 |
| `src/worlds/stormlight.data.ts` (T23b; overlay Stormlight, fuera de `mistborn/`) | `STORMLIGHT_AVENTURAS: AventurasOverlay`, `STORMLIGHT_COMBATE: CombatOverlay`, conectados en `DATA.overlays` | Reinyectan por nombre los ≈25 fragmentos de Roshar neutralizados en la base: ejemplos de sucesos con «alta tormenta», «abismoide» y Shadesmar; «hojas esquirladas» y «potencias» en los tipos de daño; «fabriales» en Manufactura; «potencias Radiantes» en los ataques de zona; costes en marcos «mc»; el estado Empoderado y «Absorber luz tormentosa» en Inconsciente | informe 06 §4 | 150 |

Marcas obligatorias en los datos: `notaLibro` para erratas (Revitalizar «8» vs «acción gratuita», «Enhaciendo el no ver», Ráfaga
de monedas sin «poder», límite «igual al rango» con 6+ grados, Lupa 200 ar) y `// [inferido]` en filas reconstruidas
(disponibilidad de duraluminio/electro para nacido de la bruma a finales de la Era 1; las tablas de metales se transcriben desde
la imagen en T16 y no llevan la marca).

## 9. Plan de implementación por fases y tareas

Formato: **Tnn · Título** — fase · repo · tamaño · depende de. Cada tarea es autosuficiente junto a las secciones 2-8.
Verificación base, en el worktree de la tarea (§1 «Protocolo», punto 3): web `npx tsc -b && npm run lint`; API `dotnet build`;
migraciones con la API de ese worktree parada (`dotnet ef migrations add <Nombre> --project Infrastructure --startup-project API`,
`dotnet ef database update --project Infrastructure --startup-project API`). Toda tarea de API que toque `CharacterService`
compara los JSON de T02 con el comparador de §1 «Protocolo», punto 5. El despliegue es la puerta humana final de Xavi (fusión de
la rama de integración en `main` y `deploy.sh`, con el `pg_dump` y la imagen `:prev` de §4.3; §1 «Protocolo», punto 1); los
despliegues intermedios por fase son opcionales. Las tareas con sufijo (T00a/T00b, T06a/T06b/T06c, T24a/T24b, T32a/T32b-1/T32b-2,
T34a/T34b, T37a/T37b, T38-1/T38-2,
T39a/T39b, T42a/T42b, T49a/T49b) son particiones de la tarea original para no superar 6 ficheros o 400 líneas por agente ni
mezclar dos repos en un agente. T23b, T25b y T38b no son particiones: son tareas añadidas
el 4 de octubre de 2026 al cerrar §12 (Q12, Q11 y Q18).

Cada tarea abre con su línea de cabecera (id, título, fase, repositorio, tamaño y dependencias, idénticos a los de la tabla
índice) y sigue con las viñetas Archivos, Cambios, Aceptación, Verificación y Fuera de alcance. «—» indica que el original no
define contenido propio para ese campo; la Verificación remite entonces a la base descrita arriba.

### Índice

| Id | Título | Fase | Repo | Tamaño | Depende de |
|---|---|---|---|---|---|
| T00a | Persistir los informes, anexos y la especificación en el repo web | F0 | web | S | — |
| T00b | Renders del manual fuera de git y `.dockerignore` de la API | F0 | api | S | — |
| T01 | Incluir el WIP de formas de cantor en la rama de integración | F0 | api y web | S | — |
| T02 | Captura JSON de referencia de personajes Stormlight | F0 | api | S | T01 |
| T03 | Prueba de humo de `parsePrereq` con prerrequisitos de Nacidos de la Bruma | F0 | web | S | — |
| T04 | `WorldIds`/`EraIds`, `IWorldRules` mínima con proveedor, columnas de campaña + migración `AddCampaignWorld` | F1 | api | M | — |
| T05 | Contrato de campaña: DTOs y `CampaignService` (`World` y `Era` al crear, vía `IWorldRulesProvider`) | F1 | api | S | T04 |
| T06a | Tipos y API cliente de campaña (`WorldId`, `Era`, `Campaign`, `useEra`) | F1 | web | S | T05 |
| T06b | Núcleo de `src/worlds/` (tipos, `skills.ts` de legado Stormlight, `stormlight.ts`, `mistborn.ts`, `*.data.ts`, `*.icons.tsx`, `index.ts`), `useWorld`/`useWorldConfig`/`useWorldData` | F1 | web | M | T06a |
| T06c | Emblemas y `topics` de enciclopedia (`EncyclopediaEmblems.tsx`, `stormlight.topics.tsx`, `mistborn.topics.tsx`) + manejador `vite:preloadError` | F1 | web | S | T06b |
| T07 | Hidratación con gate, `data-world` y tema por mundo | F1 | web | M | T06b |
| T08 | Creación de campaña con ambientación y era; insignias; ambientación en Ajustes (solo lectura) | F1 | web | M | T06b, T07 (ambos editan `CampaignSettingsPage.tsx`: va después de T07, nunca en paralelo) |
| T09 | `WorldGate`, temas de enciclopedia por mundo, pestaña Aventura, diario y gating por `features` de Talentos | F1 | web | S | T06c |
| T10 | `IWorldRules` completa, `StormlightRules`, delegación provisional de `MistbornRules` y enganche en `CharacterService` sin cambio de comportamiento | F2 | api | L | T01, T02, T04 |
| T11 | Columnas de personaje, migración `AddCharacterMistbornFields`, `CharacterJson` y DTOs | F2 | api | M | T10 |
| T12 | `MistbornRules` + `ArtesMetalicas.Progresion` + `DerivadosSet` | F2 | api | L | T11 |
| T13 | `PATCH …/recursos` y acciones `beber-vial` / `inicio-escena` | F2 | api | M | T12 |
| T14 | Conclusión de meta marca el poder completo; borrado de meta desenlaza (`MetaService` llama a `AlConcluirMeta`/`AlBorrarMeta`) | F2 | api | S | T11, T12 |
| T15 | Tipos TS del personaje y funciones de `charactersApi` | F2 | web | S | T01, T11, T12, T13 |
| T16 | `eras.ts`, `metales.ts`, `progresionArtes.ts`, `tipos.ts` (+ medida de referencia del bundle) | F3 | web | M | T06b (entrada `<pdfPath>`, §0; si falta, respaldo determinista de §1 «Protocolo», punto 2) |
| T17 | `alomancia.ts` (17 poderes, 83 talentos) | F3 | web | L | T16 |
| T18 | `feruquimia.ts` (17 poderes, 85 talentos) | F3 | web | L | T16 |
| T19 | `caminosNacidosDelMetal.ts` (5 caminos, 33 talentos de árbol + 5 principales) | F3 | web | M | T16 |
| T20 | `origenes.ts` | F3 | web | M | T16 |
| T21 | `heroicPaths.ts` de Nacidos de la Bruma (8 especialidades nuevas) | F3 | web | L | T16 |
| T22 | `hemalurgia.ts` | F3 | web | S | T16 |
| T23 | Overlays de aventuras y combate con resolver (base intacta hasta T23b) | F3 | web | M | T06b |
| T23b | Base neutra Cosmere de `aventuras.ts`/`combatRules.ts` y overlay Stormlight (Q12) | F3 | web | M | T23 |
| T24a | Rutas perezosas, `enciclopedia` completo, `OrigenesPage` y `CaminosMetalPage` | F3 | web | M | T09, T19, T20 |
| T24b | `ArtesMetalicasPage` y `PoderMetalPage` | F3 | web | M | T24a, T16-T18, T22 |
| T25 | `HeroicPathsPage` por mundo | F3 | web | S | T21 |
| T25b | Revisión visual de los datos `[inferido]` de F3 contra las imágenes del manual | F3 | web | S | T16-T22 (entrada `<pdfPath>`/`<rendersPath>`, §0; respaldo de §1 «Protocolo», punto 2) |
| T26 | `HABILIDADES_COSMERE` en `skills.ts` y consumidores Mistborn | F4 | web | M | T01, T06b |
| T27 | Identidad de la ficha: ascendencias por era, `CaminoMetalPicker`, Bendiciones | F4 | web | M | T01, T15, T19, T20, T26 |
| T28 | `MetalPicker` y flujo «al elegir camino» (habilidades, poderes, metas) | F4 | web | L | T27 |
| T29 | Estadísticas por mundo: Investidura actual, inicio de escena, bonos, puntos y topes de atributo; `Stepper.disabled/decimals` | F4 | web | M | T27 |
| T30 | Pestaña «Artes metálicas»: cabecera, `PoderCard`, cargas y viales | F4 | web | L | T29, T17, T18, T38-1 (`talentSummaries.ts`) |
| T31 | `BeberVialSheet` | F4 | web | S | T30 |
| T32a | Bolsa: arquillas, capacidad, moneda | F4 | web | M | T15, T06b, T29 (`Stepper.decimals`), T32b-1 y T32b-2 (editan las mismas líneas de `BolsaPage.tsx`, `PersonajesPage.tsx` y `BolsaDetailPage.tsx`; se ejecuta después, no en paralelo) |
| T32b-1 | `CharacterIdentityPills` y sustitución en las listas y los hubs (`MetasPage`, `TalentosPage`, `BolsaPage`, `CharacterListPage`, `PersonajesPage`) | F4 | web | S | T15, T06b |
| T32b-2 | `CharacterIdentityPills` en las páginas de detalle (`MetasDetailPage`, `BolsaDetailPage`, `TalentosDetailPage`) | F4 | web | S | T32b-1 |
| T33 | Metas de nacido del metal en la UI (+ «Nueva meta de nacido del metal» para el GM) | F4 | web | S | T28, T14, T30 (crea `ArtesMetalicasTab.tsx`; sin T30 cerrado, el fichero no existe) |
| T38-1 | Resúmenes de talentos MB y rejillas de caminos, especialidades y ascendencias | F4 | web | M | T17-T21 (entrada `<pdfPath>`/`<rendersPath>`, §0; respaldo de §1 «Protocolo», punto 2) |
| T34a | `talentRules.ts`, `talentTypes.ts` y `talentGraph.ts` parametrizado sin cambio de comportamiento | F5 | web | L | T15, T17-T21, T38-1 |
| T34b | Consumidores de `useWorldData().talentos` (`TalentosDetailPage`, `TalentosPage`) | F5 | web | S | T34a |
| T35 | Gramática de prerrequisitos ampliada | F5 | web | M | T03, T34a |
| T36 | Tipos de árbol y hueco nuevos; bloque del camino de nacido del metal y ascendencias | F5 | web | L | T35 |
| T37a | Mapa de talentos MB: `talentMap.ts`, `PathAtlas.tsx`, `MapPieces.tsx` | F5 | web | M | T36 |
| T37b | Hojas y página de talentos MB: `TalentLamina`, `TalentSheet`, `MyTalents`, `TalentosDetailPage` | F5 | web | M | T36, T34b, T31 |
| T38-2 | Rejillas de los 32 poderes de metal | F5 | web | M | T38-1 (entrada `<pdfPath>`/`<rendersPath>`, §0; respaldo de §1 «Protocolo», punto 2) |
| T38b | Revisión visual de la geometría de los árboles de talentos MB contra las imágenes del manual | F5 | web | S | T38-2 (entrada `<pdfPath>`/`<rendersPath>`, §0; respaldo de §1 «Protocolo», punto 2) |
| T39a | Columnas `World/Era/IsRewardOnly/Price/Category` del catálogo, DTOs y migración `AddWorldToCatalog` | F6 | api | M | T05, T11 (solo para `migrations add`: M3 debe ir después de M2, §4.3) |
| T39b | Filtro `?campaignId=` por mundo y era + autorización GM del catálogo (solo API; la UI ya restringe) | F6 | api | M | T39a |
| T40 | Seed `SeedMistbornCatalog` | F6 | api | L | T39a, T42a (M4 se genera después de M5, §4.3; entrada `<pdfPath>`/`<rendersPath>` con respaldo de §1 «Protocolo», punto 2; la comprobación de ids en producción es de la puerta de despliegue, §1 «Protocolo», punto 1) |
| T41 | Catálogo y bolsa por mundo en el frontend | F6 | web | M | T39b, T40, T32a |
| T42a | PNJ globales por mundo (API: `?campaignId=` + migración `AddWorldToGlobalNpcs`) | F6 | api | M | T05, T39a (solo para `migrations add`: M5 después de M3, §4.3) |
| T42b | PNJ globales por mundo (web) | F6 | web | S | T42a, T26 |
| T43 | Dados: artes metálicas, bonos de atributo y Alomancia en Combate | F6 | web | S | T26, T15 |
| T44 | Tema «Nacidos de la Bruma» | F6 | web | M | T07 |
| T45 | Extracción de activos oficiales de Nacidos de la Bruma (script en `cosmere-web/scripts/`) | F6 | web | M | — (entrada `<pdfPath>`, §0; sin PDF no hay glifos: respaldo de §1 «Protocolo», punto 2) |
| T46 | `MetalGlyph` con carga perezosa y sustitución de iconos provisionales | F6 | web | S | T45, T24b, T30, T37a |
| T47 | Equipo inicial por paquetes | F7 | web | M | T40, T32a (entrada `<pdfPath>`/`<rendersPath>`, §0; respaldo de §1 «Protocolo», punto 2) |
| T49a | Hemalurgia en la ficha (API): columna `Clavos` (migración `AddCharacterClavos`), `BonosAtributos`, desglose de Defensa espiritual, `hemalurgia.clavosMax` | F7 | api | M | T13, T22 |
| T49b | Hemalurgia en la ficha (web): sección «Clavos hemalúrgicos» en `ArtesMetalicasTab` | F7 | web | S | T49a, T30 |
| T50 | Deuda Stormlight: etiquetas del libro (Q3) y `bonosAtributos` en el tirador (Q22) | F7 | web | M | T26, T43 |

(T48 «Páginas Conversaciones y Empeños» se ha retirado del plan: añadía dos temas de enciclopedia que hoy no existen en
Stormlight, fuera del encargo; queda en §13.)

### F0 — Salvaguardas (sin cambios de producto)

**T00a · Persistir los informes, anexos y la especificación en el repo web** — F0 · web · S · —
- Estado (4 de octubre de 2026): los diez informes, `fuentes/pg.sh`, las tres propuestas, esta especificación y la auditoría ya
  están en la copia canónica `<docsPath>` (el `docs/` sin seguimiento del árbol principal de `cosmere-web`); la bitácora y
  `entorno-pruebas.md` los crea el orquestador en la preparación (§1 «Protocolo», punto 2). Se ejecuta directamente en
  `cosmere-web-nb`, sobre `nacidos-de-la-bruma` (§1 «Protocolo», punto 3), nunca en el árbol principal ni en `main`.
- Archivos: crear en `<docsPath>\nacidos-de-la-bruma\` el anexo **obligatorio** `seed-mistborn.sql`, extraído de
  `07-delta-catalogo.md` §5.2 y §6 para que T39a y T40 lo copien y no lo reconstruyan, con dos secciones: «-- M3» (el `UPDATE` de
  opciones `cosmere` de §4.3 M3 y los cuatro `setval`) y «-- M4» (opciones nuevas, 35 armas, 8 armaduras y 84 objetos con
  `World='mistborn'`, y los cuatro `setval` finales); copiar a `cosmere-web-nb\docs\` la carpeta `<docsPath>\nacidos-de-la-bruma\`
  (con el anexo nuevo), `<docsPath>\propuesta-set-de-reglas-nacidos-de-la-bruma.md` y `<docsPath>\auditoria-reglas-2026-10-03.md`
  (primera sincronización, §1 «Protocolo», punto 2); en `cosmere-web-nb`, `.gitignore` (añadir
  `docs/nacidos-de-la-bruma/fuentes/*.txt`, por si alguien deja ahí el texto del manual, y
  `docs/nacidos-de-la-bruma/entorno-pruebas.md`) y `.dockerignore` (añadir `docs`; hoy solo excluye `node_modules`, `dist`,
  `dist-ssr`, `.git`, `.idea`, `.vscode`, `.claude`, `*.log`, `*.local`, y el contenedor de runtime solo copia `dist/`). **Ningún
  `.txt` del manual, ningún `.png` ni `.cff`** bajo `docs/` (los renders son de T00b; el texto íntegro vive en `<flowPath>`).
- Cambios: ninguno en código. Comprobar que existe la ruta `<pdfPath>` de §0
  (`ls "/c/Users/xavie/Downloads/Español/SPA_Mistborn_Handbook.pdf"`) y anotar el resultado en el informe; si no existe, las
  tareas que lo usan aplican el respaldo de §1 «Protocolo», punto 2; no se pregunta a Xavi.
- Aceptación: los ficheros existen en `cosmere-web-nb/docs/` y cada referencia «informe de X §n» de este documento se resuelve con
  la tabla de §0; `git -C cosmere-web-nb status --porcelain` muestra solo `docs/`, `.gitignore` y `.dockerignore`, **ningún `.txt`
  del manual ni ningún `.png` o `.cff` bajo `docs/`, y no lista `entorno-pruebas.md`** (ignorado); ningún fichero de
  `docs/nacidos-de-la-bruma/` supera 300 KB; `seed-mistborn.sql` contiene en «-- M3» el `UPDATE` y 4 `setval`, y en «-- M4» las
  opciones nuevas de §4.3 M4, las filas de 35 armas (ids 1001-1035), 8 armaduras (1001-1008) y 84 objetos (1001-1084;
  `Category='vial'` en 1072-1084) y 4 `setval`; el árbol principal de `cosmere-web` no cambia (salvo el anexo nuevo en
  `<docsPath>`).
- Verificación: — (sin código; la comprobación es la Aceptación).
- Fuera de alcance: todo lo de `cosmere-api` (T00b); la bitácora y `entorno-pruebas.md` (los lleva el orquestador).

**T00b · Renders del manual fuera de git y `.dockerignore` de la API** — F0 · api · S · —
- Estado (4 de octubre de 2026): `mistborn_flow.txt` ya está en `<flowPath>` (carpeta ignorada, `cosmere-api/.gitignore:25`);
  `<rendersPath>` no existe todavía. Tarea de API: worktree de tarea `cosmere-api-nb-t00b`, rama `nb-t00b` (§1 «Protocolo», punto
  3).
- Archivos: crear `.dockerignore` en el worktree con `Resources/`, `**/bin/`, `**/obj/`, `.git`, `*.tar` (`cosmere-api/` no tiene
  `.dockerignore` y su `Dockerfile:17` hace `COPY . .`, así que `Resources/pdfextract/`, los PDF de `Resources/CaminaPiedras/`
  (≈310 MB) y `Resources/Parts/node_modules` viajan al contexto de build en cada `docker compose build` de `deploy.sh:82`; no
  llegan a la imagen de runtime, que solo copia `/app/publish`, `Dockerfile:26`). Crear `<rendersPath>` (carpeta del árbol
  principal ignorada por git; no existe en ningún worktree) y copiar tal cual las carpetas de renders del scratchpad de la sesión
  de redacción,
  `C:/Users/xavie/AppData/Local/Temp/claude/C--Users-xavie-Documents-Repositories-personal-cosmere-web/664137b1-bed4-450a-88ae-c1b3fb8e1e0c/scratchpad/hoja/`
  (páginas 260 y 408-411, `emblem410.png` y las dos fuentes `.cff`) e `img\` (páginas 260, 261, 264-266, 268, 271, 273, 275 y 285
  y recortes de objetos y monedas), a `<rendersPath>\hoja\` y `<rendersPath>\img\`; las páginas de 260-285 y 408-411 que falten (o
  todas, si el scratchpad ya no existe) se renderizan desde `<pdfPath>` con
  `dotnet run --project "<herramienta>" -- "<pdfPath>" "<rendersPath>" <páginas>` (§1 «Protocolo», punto 2); si `<pdfPath>`
  tampoco existe, se deja lo copiado y se anota (respaldo de §1 «Protocolo», punto 2). **No se commitean**: reproducen páginas
  completas de una obra con copyright. Esta tarea es la única excepción a la regla de la plantilla «no toques
  `Resources/pdfextract`».
- Cambios: ninguno en código.
- Aceptación: `git -C cosmere-api-nb-t00b status --porcelain` muestra solo `.dockerignore`;
  `git -C cosmere-api status --porcelain` no muestra `Resources/pdfextract/` (sigue ignorada); `<rendersPath>` contiene las
  páginas 260-285 y 408-411 (copiadas o renderizadas; sin PDF, lo copiado, con nota en el informe);
  `docker build --no-cache --progress=plain .` desde el worktree no transfiere `Resources/` en el contexto.
- Verificación: — (sin código; la comprobación es la Aceptación).
- Fuera de alcance: todo lo de `cosmere-web` (T00a).

**T01 · Incluir el WIP de formas de cantor en la rama de integración** — F0 · api y web · S · —
- Estado: **hecha** el 4 de octubre de 2026 por el orquestador, por decisión de Xavi (validar y subir todo junto): commits
  `5083960` en `cosmere-api-nb` y `4dc6dfd` en `cosmere-web-nb`, primeros de `nacidos-de-la-bruma` («T01: formas de cantor
  (trabajo en curso de Xavi incluido en la rama de integración)»). Sin puerta humana: nada del plan espera a Xavi.
- Archivos: API `Messages/Characters/Out/CharacterResponse.cs`, `Services/Characters/CharacterService.cs`,
  `Services/Characters/TalentosReglas.cs` y `Services/Characters/FormasCantor.cs` (sin seguimiento en el árbol principal); web
  `src/pages/characters/CharacterDetailPage.tsx` y `src/types/index.ts`. Copiados tal cual desde los árboles principales de Xavi,
  sin editar su contenido.
- Cambios: copia de los seis ficheros a `cosmere-api-nb` y `cosmere-web-nb`; `dotnet build` y `npx tsc -b` verdes; un commit en
  `nacidos-de-la-bruma` en cada repo.
- Aceptación: `git -C cosmere-api-nb show --stat 5083960` lista los cuatro ficheros de la API y
  `git -C cosmere-web-nb show --stat 4dc6dfd` los dos de web; `dotnet build` en `cosmere-api-nb` y `npx tsc -b` en
  `cosmere-web-nb` (tras `npm ci`) sin errores; `cmp` de cada fichero con su copia del árbol principal no muestra diferencias
  mientras Xavi no cambie su WIP (si lo cambia, lleva él los cambios a la rama antes de la puerta final, §1 «Protocolo», punto 1).
- Verificación: — (hecha al commitear; la comprobación es la Aceptación).
- Fuera de alcance: cualquier cambio funcional; descartar el WIP sin commitear de los árboles principales (lo hace Xavi antes de
  la fusión final en `main`, §1 «Protocolo», punto 1).

**T02 · Captura JSON de referencia de personajes Stormlight** — F0 · api · S · T01
- Archivos: — (no modifica ningún repositorio: los JSON van a `"$TEMP/cosmere-regresion"`, sintaxis bash, fuera de los repos; los
  ids, a `entorno-pruebas.md`).
- Cambios: con `nb-api` arrancada desde `cosmere-api-nb` en el commit de T01 (la referencia es el WIP, §6.5, antes de cualquier
  cambio de F1) y las variables de `entorno-pruebas.md` (`TOKEN_GM`, `TOKEN_JUGADOR`, `NB_JUGADOR_ID`; §1 «Protocolo», punto 2):
  - Campaña de regresión:
    `curl -s -X POST http://localhost:5200/campaigns -H "Authorization: Bearer $TOKEN_GM" -H "Content-Type: application/json" -d '{"name":"Regresión Stormlight"}'`
    (`CampaignsController.cs:23-25`; `CreateCampaignRequest.cs:3-6`; responde `CampaignDetailResponse` con `id` e `inviteCode`,
    `CampaignResponse.cs:13-22`; la invitación nace activa, `CampaignEntity.cs:9`); el jugador se une con `POST /campaigns/join` y
    `{"inviteCode":"<inviteCode>"}` usando `TOKEN_JUGADOR` (`CampaignsController.cs:34-36`; `JoinCampaignRequest`,
    `CreateCampaignRequest.cs:8-11`).
  - Cinco personajes sintéticos que cubren los casos de T10-T14: `POST /campaigns/{cid}/characters` con `{"name":"…"}`
    (`CreateCharacterRequest`, `CharacterRequest.cs:3-12`: `name` obligatorio, `playerName`, `level`, `ascendencia`,
    `caminoHeroico`, `caminoRadiante`, `ownerId`) y después `PUT /campaigns/{cid}/characters/{id}` con el JSON completo devuelto
    por `GET` más los cambios del caso (`UpdateCharacterRequest`, `CharacterRequest.cs:19-98`: `name` obligatorio; `talentos` es
    una **cadena** con un array JSON; `equippedArmor` debe estar en `armor`, `CharacterService.cs:198`; las propiedades de la
    respuesta que no están en el DTO se ignoran):
    `curl -s -H "Authorization: Bearer $TOKEN_GM" "http://localhost:5200/campaigns/$CID/characters/$ID" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const c=JSON.parse(s);Object.assign(c,JSON.parse(process.argv[1]));process.stdout.write(JSON.stringify(c))})" '<cambios>' | curl -s -X PUT -H "Authorization: Bearer $TOKEN_GM" -H "Content-Type: application/json" --data-binary @- "http://localhost:5200/campaigns/$CID/characters/$ID"`.
    Casos (`<cambios>`): (1) humano windrunner de nivel 7, caso trabajado del informe API §1.6 (radiante con orden y talentos con
    reglas):
    `{"level":7,"ascendencia":"Humano","caminoRadiante":"windrunners","fuerza":2,"velocidad":3,"intelecto":1,"voluntad":2,"discernimiento":1,"presencia":3,"talentos":"[\"Robusto\",\"Compostura\",\"Investido\"]","habilidadPersonalizada1":"Adhesión","habilidadPersonalizada1Valor":2,"habilidadPersonalizada1Atributo":"PRE"}`
    → salud 49, concentración 6, defensas 15/13/14, Investidura 7 (2 + PRE 3 + Investido rango 2), movimiento 9; (2) oyente cantor
    en forma de guerra con armadura equipada:
    `{"level":3,"ascendencia":"Oyente","fuerza":3,"velocidad":2,"intelecto":1,"voluntad":2,"discernimiento":2,"presencia":2,"talentos":"[\"~forma~Forma de guerra\"]","armor":["Uniforme"],"equippedArmor":"Uniforme","desvio":2}`
    (prefijo `~forma~`, `FormasCantor.cs:25`; Forma de guerra da FUE +1 y Desvío +1); (3) humano sin orden ni talentos:
    `{"level":1,"ascendencia":"Humano"}`; (4) copia de (1) creada con `"ownerId":<NB_JUGADOR_ID>` en el `POST` (o asignada con
    `PUT …/{id}/assign {"ownerId":<id>}`, `CharactersController.cs:43-45`) para los criterios de no-GM; (5) reglas Cosmere y de
    Roshar con condición:
    `{"level":5,"ascendencia":"Humano","caminoHeroico":"enviado","caminoRadiante":"windrunners","talentos":"[\"Vestimenta tradicional\",\"Movimiento sin fricción\",\"Mente ambiciosa\"]","armor":["Ropa Presentable"],"equippedArmor":"Ropa Presentable"}`
    («Vestimenta tradicional» se activa porque el nombre de la armadura contiene «Presentable», `TalentosReglas.cs:219-221`).
  - Captura con `TOKEN_GM`: `mkdir -p "$TEMP/cosmere-regresion"`; `GET /campaigns/$NB_CID_STORMLIGHT/characters` →
    `"$TEMP/cosmere-regresion/antes-lista.json"` y, por cada id de `$NB_CHARS`, `GET …/characters/<id>` → `antes-<id>.json` y
    `GET …/characters/<id>?enCombate=true` → `antes-<id>-combate.json` (con `curl -s … > <fichero>`). Anotar `NB_CID_STORMLIGHT` y
    `NB_CHARS` (ids de (1)-(5), en orden) en `entorno-pruebas.md`.
- Aceptación: 11 ficheros JSON en `"$TEMP/cosmere-regresion"` (la lista y dos por personaje), ninguno con `{"error":…}`; los
  números del caso trabajado (1) coinciden; (2) muestra la línea «Forma: Forma de guerra» y (5) la de «Vestimenta tradicional». Se
  reutilizan en T10-T14 y T49a con el comparador `node -e` de §1 «Protocolo», punto 5 (sin `jq`).
- Verificación: — (sin código; la comprobación es la Aceptación).
- Fuera de alcance: personajes reales de otras campañas (el director de prueba no es miembro de ellas) y cualquier cambio de
  código.

**T03 · Prueba de humo de `parsePrereq` con prerrequisitos de Nacidos de la Bruma** — F0 · web · S · —
- Archivos: script temporal en el scratchpad (no en el repo), ejecutado desde `cosmere-web-nb` con `npx --yes tsx <script>` (`tsx`
  no está en `devDependencies`, `package.json`; se descarga al vuelo, requiere red, **no** añadirlo al `package.json`) contra
  `src/lib/talentGraph.ts` (`parsePrereq` `:278`). No modifica ningún repositorio.
- Cambios: ejecutar con `Alomancia 3 o más; talento principal Ruptura de brumoso`, `poder Alomancia de acero`,
  `Armamento pesado 2 o más o Armamento ligero 2 o más; talento Ráfaga de monedas`,
  `Voluntad 4 o más; talento Mentes de metal ampliadas`,
  `ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia`. **Pasar como segundo argumento**
  (`known`) un `Set` con los nombres de talento que aparecen en los textos de prueba (`Ruptura de brumoso`, `Ráfaga de monedas`,
  `Mentes de metal ampliadas`…): el valor por defecto `allTalentNames()` solo conoce los talentos Stormlight y haría salir
  `unknown` cualquier `talento X` por el catálogo, no por la gramática (`talentGraph.ts:251-257`). Registrar qué cláusulas salen
  `unknown` o `skill` con `field null`.
- Aceptación: tabla texto → cláusula en el informe de la tarea (el orquestador la copia a la bitácora); confirma o corrige las
  deducciones del informe de talentos §2.2 antes de T35.
- Verificación: — (sin código; la comprobación es la Aceptación).
- Fuera de alcance: —

### F1 — Discriminador de campaña (la app sigue 100 % Stormlight; ya se pueden crear campañas «Bruma»)

**T04 · `WorldIds`/`EraIds`, `IWorldRules` mínima con proveedor, columnas de campaña + migración `AddCampaignWorld`** — F1 · api ·
M · —
- Archivos (worktree de tarea `cosmere-api-nb-t04`, §1 «Protocolo», punto 3): crear `Messages/Worlds/WorldIds.cs`
  (`public static class WorldIds { public const string Stormlight = "stormlight"; public const string Mistborn = "mistborn"; public const string Cosmere = "cosmere"; /* contenido compartido (CatalogOptions, M3); no es un mundo de campaña y no entra en Todos */ public static readonly string[] Todos = [Stormlight, Mistborn]; public static bool EsValido(string? v) => v is not null && Todos.Contains(v); }`)
  y `Messages/Worlds/EraIds.cs` (`EraIds` análoga con `Era1 = "era1"`, `Era2 = "era2"`, `EsValida`);
  `Services/Worlds/IWorldRules.cs` con la interfaz **mínima** (`string Id { get; }`, `string? NormalizarEra(string? era)`),
  `IWorldRulesProvider` (`Get`, `Existe`) y `WorldRulesProvider` (§6.1); `Services/Worlds/StormlightRules.cs` y
  `Services/Worlds/MistbornRules.cs` mínimas (solo `Id` y `NormalizarEra`, con los cuerpos de §6.3); `Services/Bootstrap.cs:19-35`
  (las tres líneas `AddSingleton` de §6.1); `Messages/Database/Entities/CampaignEntity.cs` (`World`, `Era` de §4.1, tras
  `CreatedAt` `:10`); `Infrastructure/Data/CosmereContext.cs` `OnModelCreating`
  (`.Property(c => c.World).HasDefaultValue(WorldIds.Stormlight)`, §4.1).
- Cambios: — (descritos por fichero en «Archivos»).
- Comandos: `dotnet build` → `dotnet ef migrations add AddCampaignWorld --project Infrastructure --startup-project API` →
  comprobar que el `Up` es el de §4.3 M1 y que contiene `defaultValue: "stormlight"` (**no** `""`: EF no lee el inicializador C#,
  §4.1) → `dotnet ef database update --project Infrastructure --startup-project API` (desde el worktree de la tarea; «API parada»
  según §1 «Protocolo», punto 2).
- Aceptación: con `docker exec cosmere-postgres-local psql -U jira -d cosmere -c "<SQL>"`, `SELECT "World","Era" FROM "Campaigns"`
  devuelve `stormlight`/`NULL` en todas las filas y `SELECT COUNT(*) FROM "Campaigns" WHERE "World" = ''` = 0; `dotnet build`
  verde; la API de la tarea arranca y resuelve `IWorldRulesProvider` sin error de DI; el `Down` generado contiene los dos
  `DropColumn`.
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: el resto de miembros de `IWorldRules` (T10) y los DTOs y el servicio de campaña (T05).

**T05 · Contrato de campaña: DTOs y `CampaignService` (`World` y `Era` al crear, vía `IWorldRulesProvider`)** — F1 · api · S · T04
- Archivos (worktree de tarea `cosmere-api-nb-t05`): `Messages/Campaigns/In/CreateCampaignRequest.cs` (`World`, `Era`, §5.1),
  `Messages/Campaigns/Out/CampaignResponse.cs` (§5.1, en `CampaignResponse` y `CampaignDetailResponse`);
  `Services/Campaigns/CampaignService.cs`: ctor `CampaignService(CosmereContext db, IWorldRulesProvider reglas)` (`:9`),
  validación y asignación en `CreateCampaignAsync` (`:65-72`) con `reglas.Existe(request.World)` y
  `reglas.Get(request.World).NormalizarEra(request.Era)` (§5.2, §6.2; **sin literales de mundo ni de era en el servicio**), y
  `World`/`Era` en las proyecciones `:17-33`, `:48-62` y `:115`. Sin endpoint de edición: mundo y era se fijan al crear (decisión
  (b), Xavi, 4 de octubre de 2026); `CampaignsController` no cambia.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación (API de la tarea en su puerto, §1 «Protocolo», punto 3; token del director de `entorno-pruebas.md`):
  `POST /campaigns {"name":"x"}` crea `stormlight` con `era: null`; `{"name":"x","world":"mistborn"}` → 400;
  `{"name":"x","world":"mistborn","era":"era3"}` → 400; `{"name":"x","world":"cosmere"}` → 400 (`Existe` solo conoce los mundos
  registrados); `{"name":"x","world":"stormlight","era":"era1"}` → 200 con `era: null`;
  `{"name":"x","world":"mistborn","era":"era2"}` → 200 con ambos campos; `GET /campaigns` y `/campaigns/{id}` incluyen `world` y
  `era`; `grep -nE "stormlight|mistborn|era1|era2" Services/Campaigns/CampaignService.cs` no devuelve nada. El agente crea con el
  director las campañas de prueba `mistborn`/`era1` y `mistborn`/`era2` y anota sus ids (`NB_CID_ERA1`, `NB_CID_ERA2`) en
  `entorno-pruebas.md`.
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: —

**T06a · Tipos y API cliente de campaña (`WorldId`, `Era`, `Campaign`, `useEra`)** — F1 · web · S · T05
- Archivos (tarea web, directamente en `cosmere-web-nb`, §1 «Protocolo», punto 3): `src/types/index.ts` (`WorldId`, `Era`,
  `Campaign.world/era`, `CampaignDetail`; anclar por texto; **no** tocar `Character` ni `UpdateCharacterRequest`);
  `src/api/campaigns.ts:10-11` (`create(data: { name: string; world: WorldId; era: Era | null })`); `src/store/campaignStore.ts`
  (solo `useEra`, §7.1: `dataWorld`, `useWorld`, `useWorldConfig` y `useWorldData` necesitan `getWorld` y son de T06b);
  `src/pages/campaigns/CampaignListPage.tsx:132` (solo la llamada `create`).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: `npx tsc -b` y `npm run lint` verdes; `CampaignListPage.tsx:132` adaptado a
  `create({ name: newName, world: 'stormlight', era: null })` (valor provisional: la UI nueva de T08 lo sustituye por la elección
  del `Sheet`); `useEra()` devuelve `null` con `currentCampaign` sin `era`. Ninguna pantalla cambia visualmente.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T06b · Núcleo de `src/worlds/` (tipos, `skills.ts` de legado Stormlight, `stormlight.ts`, `mistborn.ts`, `*.data.ts`,
`*.icons.tsx`, `index.ts`), `useWorld`/`useWorldConfig`/`useWorldData`** — F1 · web · M · T06a
- Archivos (tarea web, directamente en `cosmere-web-nb`; 10 ficheros, todos nuevos salvo `campaignStore.ts`): crear
  `src/worlds/types.ts` (§7.1, incluidos `AttrField`, `TopicDef`, `HabilidadDef` y los cuatro `unknown` con su `// TODO`:
  `TalentRules` (T34a), `AventurasOverlay` y `CombatOverlay` (T23), `PoderDef` (T16)); `skills.ts`
  (`HABILIDADES_STORMLIGHT_LEGADO`, `HABILIDADES_STORMLIGHT_TIRADOR_LEGADO` y `HABILIDADES_STORMLIGHT_PNJ_LEGADO`: transcripciones
  literales de `SECTIONS` de `CharacterDetailPage.tsx:385-431`, de `SKILLS`/`SKILL_TO_FIELDS` de `DiceRoller.tsx:25-55` y de
  `SECTIONS` de `GlobalNpcDetailPage.tsx:17-54`, **sin tocar esos ficheros**, §7.1); `stormlight.icons.tsx` (**mínimo, tres
  funciones**: `iconoHumano = (size) => <UserRound size={size} />`, `iconoOyente = (size) => <AudioWaveform size={size} />`,
  `iconoOrden = (id, size) => <RadiantOrderIcon orderId={id} size={size} decorative />`, valores actuales de
  `CharacterDetailPage.tsx:433-436` y de las pills); `mistborn.icons.tsx` (análogo: los Lucide provisionales de Q18 para
  ascendencias, `UserRound`, `VenetianMask`, `Mountain`, y caminos de nacido del metal, `Flame`, `CloudFog`, `Container`,
  `Package`, `Merge`); `stormlight.ts`; `mistborn.ts`; `stormlight.data.ts`
  (`export const DATA: WorldData = { talentos: null, caminosHeroicos: HEROIC_PATHS, poderes: POTENCIAS, overlays: { aventuras: null, combat: null } }`;
  **no** envuelve `RADIANT_ORDERS`, `ARBOL_CANTOR`, `TALENT_GRIDS` ni `TALENT_SUMMARIES`, que entran en `STORMLIGHT_TALENTOS` en
  T34a); `mistborn.data.ts` (`DATA` con todos los campos a `null`/`[]`); `index.ts` (§7.1: `WORLDS`, `getWorld` con
  `Object.hasOwn`, `isAvailable`); editar `src/store/campaignStore.ts` (§7.1: `dataWorld` en el estado y en `partialize`, fijado
  por `setCurrentCampaign` con `getWorld(campaign?.world).tema.dataWorld`; `useWorld = () => getWorld(currentCampaign?.world).id`,
  sin literales de mundo; `useWorldConfig`; `useWorldData` con `initialData: cfg.syncData` y `structuralSharing: false`).
- Contenido obligatorio para que `npx tsc -b` quede verde con `WorldConfig` completo (§7.1): `stormlight.ts` con `features` (todo
  `true` salvo `artesMetalicas`, `arquillas`, `eras`, `bonosServidor`, `equipoInicial` y `origenes`),
  `habilidades: HABILIDADES_STORMLIGHT_LEGADO`, `habilidadesTirador: HABILIDADES_STORMLIGHT_TIRADOR_LEGADO`,
  `habilidadesPnj: HABILIDADES_STORMLIGHT_PNJ_LEGADO`,
  `habilidadesInvestidas: []`, `ascendencias` (Humano/Oyente con `tone` e `icono` de `stormlight.icons.tsx`), `caminoInvestido`,
  `recursos: []`, `derivados: []`, `eras: null`, `moneda mc`, `tablas: { cargaKg: [22.5,45,112.5,225,1125,2250] }`,
  **`enciclopedia: []` provisional** (T06c la rellena), `textos` con los literales actuales (`'Solo disponible para Radiantes'`,
  `CharacterDetailPage.tsx:831`; el de `TalentosDetailPage.tsx:447`),
  `tema: { dataWorld: null, themeBg: { light: '#e8ecf1', dark: '#0a0e15' } }` (`themeStore.ts:12`), `iconos` (`investidura: Gem`,
  el actual de `StatIcons.investidura`, `src/lib/gameIcons.ts:24`; `caminoInvestido: iconoOrden`), `loadData`, `syncData: DATA`.
  `mistborn.ts` **nace completo** (§7.1): `features`, `habilidades: HABILIDADES_STORMLIGHT_LEGADO` **provisional** (T26 la
  sustituye por `HABILIDADES_COSMERE`), sin `habilidadesTirador` ni `habilidadesPnj`, `habilidadesInvestidas` (Alomancia
  `VOL`/`Flame`/`ataque: true`, Feruquimia `INT`/`Anvil`), `ascendencias` (Humano/Kandra/Sangre koloss con `tone`, `icono` de
  `mistborn.icons.tsx`, `eras`, `puntosAtributoBase`, `topeAtributo`), `caminoInvestido`, `recursos`, `derivados` (claves de §2),
  `eras` (dos, con `label`, `aviso` y `tone`),
  `moneda: { simbolo: 'ar', nombre: 'Arquillas', imagen: null /* T45 */, decimales: 2 }`, `tablas` con `cargaKg` y
  `levantamientoKg` (§7.1), `enciclopedia: []` (T06c), `textos`,
  `tema: { dataWorld: 'mistborn', themeBg: { light: '#ebe8e6', dark: '#0c0b0d' } }` (§7.8 Tema), `emblema: 'cosmere-emblem'`
  provisional (T46), `iconos` (`investidura: Flame`; `caminoInvestido` de `mistborn.icons.tsx`), `loadData`, sin `syncData`.
- **ESLint**: `eslint.config.js` extiende `reactRefresh.configs.vite` (regla `react-refresh/only-export-components` activa). Un
  fichero `.tsx` que exporte a la vez componentes y no componentes (funciones en minúscula, arrays) falla `npm run lint`; por eso
  los datos van en `.ts` y los helpers JSX no componente de `stormlight.icons.tsx` y `mistborn.icons.tsx` llevan
  `// eslint-disable-next-line react-refresh/only-export-components`, como ya hace el repo en `ProposalsPage.tsx:16, 22, 27`.
- Aceptación: `npx tsc -b` y `npm run lint` verdes **sin errores nuevos**; `useWorldData().isPending === false` en el primer
  render de una campaña Stormlight (`initialData`); `getWorld('constructor')`, `getWorld('')` y `getWorld(undefined)` devuelven la
  configuración Stormlight; `useWorld()` devuelve `'stormlight'` con `currentCampaign` sin `world`, con `world: ''` y con un id
  desconocido; `localStorage['cosmere-campaign']` guarda `dataWorld: null` en una campaña Stormlight y `'mistborn'` en una
  Mistborn; ninguna pantalla cambia visualmente (nadie consume aún `useWorldConfig`); `npm run build` no crea ningún chunk nuevo
  salvo `mistborn.data-*.js` (vacío) y el chunk principal no crece respecto a antes de la tarea.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T06c · Emblemas y `topics` de enciclopedia (`EncyclopediaEmblems.tsx`, `stormlight.topics.tsx`, `mistborn.topics.tsx`) +
manejador `vite:preloadError`** — F1 · web · S · T06b
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que T07, §1 «Protocolo»,
  punto 3): crear `src/components/EncyclopediaEmblems.tsx` extrayendo `EncyclopediaPage.tsx:1-97`
  (`BalancedRow` `:34`, `OrderGlyph` `:49`, `EmblemStrip` `:69`, `MiniTile` `:85` como componentes exportados) y
  `src/components/emblemData.ts` (**fichero `.ts`** con `SURGES` `:16`, `COMBAT_ACTIVATIONS` `:19` y `AVENTURAS_EMBLEMS` `:22`
  convertido en una función o movido a `stormlight.topics.tsx` si lleva JSX; hoy son `const`/`function` no exportadas del mismo
  fichero y los `topics` no compilarían sin ellas; `EncyclopediaPage.tsx` pasa a importarlas y queda solo con la página); crear
  `src/worlds/stormlight.topics.tsx` (los `emblem` JSX actuales de `EncyclopediaPage.tsx:109-197` como
  `export const STORMLIGHT_TOPICS: TopicDef[]`; si además exporta algo no componente,
  `// eslint-disable-next-line react-refresh/only-export-components` como en `ProposalsPage.tsx:16`) y `mistborn.topics.tsx`
  (`MISTBORN_TOPICS` provisional = Caminos Heroicos, Combate, Aventuras, Catálogo, con `emblem` Lucide; un `.ts` no admite JSX);
  editar `stormlight.ts`/`mistborn.ts` (`enciclopedia: STORMLIGHT_TOPICS` / `MISTBORN_TOPICS` en lugar de `[]`),
  `EncyclopediaPage.tsx:1-97` (solo quitar lo extraído e importar; `TOPICS` sigue siendo la constante local hasta T09) y
  `src/main.tsx` (aditivo: manejador `vite:preloadError` con recarga única, §7.1 «Chunks perezosos y PWA»).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: `npx tsc -b` y `npm run lint` verdes sin errores nuevos (regla `react-refresh/only-export-components`);
  `EncyclopediaPage` idéntica en captura; `npm run build` sin chunks nuevos y chunk principal sin crecer.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T07 · Hidratación con gate, `data-world` y tema por mundo** — F1 · web · M · T06b
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que T06c, §1 «Protocolo»,
  punto 3): `src/components/AppLayout.tsx:13-17` (§7.2:
  `useQuery({ queryKey: ['campaign', id], queryFn: () => campaignsApi.getById(id), enabled: Number.isFinite(id) && id > 0 })` +
  `useEffect(() => { if (data) setCurrentCampaign(data) }, [data, setCurrentCampaign])` (TanStack v5 no tiene `onSuccess` en
  `useQuery`); gate `ready = currentCampaign?.id === id`;
  `if (cfg.tema.dataWorld) root.dataset.world = cfg.tema.dataWorld; else delete root.dataset.world;` + `applyTheme(mode)` tras
  fijarlo; `delete` en el cleanup); `index.html:18-26` (segundo script previo a la pintura que lee `state.dataWorld` de
  `localStorage['cosmere-campaign']`, persistido por T06b, **sin conocer ningún id de mundo**, §7.2) y `:57-59` (reglas de fondo
  oscuras **y claras** para `data-world='mistborn'`, §7.8 Tema); `src/store/themeStore.ts:12,19-32` (se borra `THEME_BG` de `:12`;
  `applyTheme(mode, world = document.documentElement.dataset.world)` lee `getWorld(world).tema.themeBg`, §7.2: con
  `getWorld(undefined)` salen los valores actuales de Stormlight); `src/pages/campaigns/CampaignSettingsPage.tsx:28` usa la misma
  `useQuery(['campaign', id])`.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: abrir por URL directa una campaña distinta de la persistida nunca muestra un frame con `isGm` ni mundo equivocados;
  sin red se ve `ErrorMessage` con «Reintentar»; `document.documentElement.dataset.world` existe solo bajo `/campaigns/:id/*` y
  solo para `mistborn` (en Stormlight el atributo **no existe**, ni siquiera vacío); `meta[name=theme-color]` cambia al entrar en
  una campaña Mistborn y vuelve al salir; en Stormlight ningún token cambia (no hay regla CSS para `data-world='stormlight'`);
  `grep -rn "THEME_BG" src` no devuelve nada; con la app abierta en `npm run preview`, publicar un build nuevo y navegar a
  Talentos no deja la pantalla en error (el manejador `vite:preloadError` de T06c recarga una vez; riesgo 20; si T06c no está
  fusionada al ejecutar T07, este criterio se verifica en la revisión de fin de F1).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T08 · Creación de campaña con ambientación y era; insignias; ambientación en Ajustes (solo lectura)** — F1 · web · M · T06b, T07
(ambos editan `CampaignSettingsPage.tsx`: va después de T07, nunca en paralelo)
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que T09, §1 «Protocolo», punto
  3): `src/pages/campaigns/CampaignListPage.tsx` (§7.3: `Sheet` nuevo con el `Segmented` de ambientación construido desde
  `Object.values(WORLDS)` y las pistas de era desde `cfg.eras`, sin literales de mundo ni de era en el componente; `InlineForm`
  solo para unirse; `CampaignCard` con chips; la llamada provisional de T06a pasa a `create({ name, world, era })`); crear
  `src/components/WorldBadge.tsx`; `Sidebar.tsx:153-168, 261-268, 353-357`; `HomeCampaignPage.tsx:47-57`;
  `CampaignSettingsPage.tsx` (sección «Ambientación» con dos `StatTile` de solo lectura, mundo y era; sin controles de edición,
  decisión (b)).
- Cambios: — (descritos por fichero en «Archivos»).
- Textos: «Nueva campaña», «Nombre de la campaña», «Ambientación», «Era», «La ambientación y la era no se pueden cambiar después
  de crear la campaña.», «Crear campaña», «Cancelar»; los nombres de mundo («Tormentas»/«Bruma», `WorldConfig.nombreCorto`) y de
  era («Era 1»/«Era 2», `cfg.eras[].label`) salen de la configuración.
- Aceptación: crear Stormlight y Mistborn/Era 2 funciona; «Crear campaña» deshabilitado sin era en Mistborn; foco en el nombre al
  abrir; `Segmented` con `ariaLabel`; Ajustes muestra mundo y era sin ningún control para cambiarlos; sin colores literales;
  `npx tsc -b`, `npm run lint`. Icono `nacidos-bruma-emblem` provisional = `CosmereIcon name="cosmere-emblem"` hasta T46.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T09 · `WorldGate`, temas de enciclopedia por mundo, pestaña Aventura, diario y gating por `features` de Talentos** — F1 · web ·
S · T06c
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que T08): crear
  `src/components/WorldGate.tsx` (`{ feature: keyof WorldConfig['features']; children }`: lee `useWorldConfig().features` y
  redirige a `../encyclopedia` si la capacidad es `false`; nunca compara ids de mundo, §7.2); `src/App.tsx:51-56` (envolver
  `radiant-orders` con `<WorldGate feature="caminoRadiante">` y `potencias` con `<WorldGate feature="potencias">`);
  `EncyclopediaPage.tsx:99-107, 109-197, 200-206, 210` (`Topic` local → `TopicDef` de `worlds/types.ts`;
  `TOPICS = useWorldConfig().enciclopedia` con los emblems de `stormlight.topics.tsx`; los helpers `:1-97` ya viven en
  `src/components/EncyclopediaEmblems.tsx` desde T06c; `pathFor()` conserva el caso `'catalog'`; subtítulo con `cfg.planeta`);
  `GmPage.tsx:8-20` (`features.pestanaAventura`); `DiarioPage.tsx:259, 390` (`features.mencionSpren`, `emblema`);
  `src/pages/personajes/TalentosDetailPage.tsx:447, 488, 507, 753` (texto vacío → `cfg.textos.vacioTalentos`;
  `onChangeForma`/`FormaPicker` solo con `features.formasCantor`; `IdealesControl`/`idealesMutation` solo con
  `features.idealesJurados`; `StateLegend` (`:737-757`) oculta el item «jurar un Ideal» (`:753`, `IdealGlyph`) cuando
  `!cfg.features.idealesJurados`: este gating solo depende de `features` y debe estar antes de cerrar F4, no en F5).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: en Stormlight, enciclopedia, director, diario y Talentos idénticos a hoy; en Mistborn no aparecen Órdenes ni
  Potencias y `/encyclopedia/potencias` redirige a `../encyclopedia`; la pestaña Aventura desaparece; en Talentos de una campaña
  Mistborn no se ven Ideales jurados, botón de forma ni el texto «Orden Radiante», y la leyenda de Talentos no menciona Ideales.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

### F2 — Motor de servidor envuelto (Stormlight idéntico; Mistborn valida, calcula y persiste el estado de mesa)

**T10 · `IWorldRules` completa, `StormlightRules`, delegación provisional de `MistbornRules` y enganche en `CharacterService` sin
cambio de comportamiento** — F2 · api · L · T01, T02, T04
- Archivos a crear (worktree de tarea `cosmere-api-nb-t10`): `Messages/Characters/PoderPersonaje.cs` (§4.2; DTO puro sin
  migración: lo usan las firmas de `IWorldRules`, por eso nace aquí y no en T11) y `Messages/Characters/In/RecursosRequest.cs`
  (§5.1: `RecursosRequest`, `PoderRecursosRequest`, `BeberVialRequest`, `InicioEscenaRequest`; nace aquí porque
  `AccionMesa.PatchRecursos` lo referencia; lo usa T13).
- Archivos a tocar: `Services/Worlds/IWorldRules.cs` (de la interfaz mínima de T04 a la completa de §6.1: `IdentidadPersonaje`,
  `AccionMesa` con sus tres variantes, `ReglasPropias`, `ReglasTalentos`, `RecursosPermitidos`,
  `CaminoInvestidoLoCambiaElDirector`, `ValidarIdentidad`, `RestringirCambiosNoGm`, `AplicarAccionMesa`, `AlConcluirMeta`,
  `AlBorrarMeta`, `TalentosImplicitos`, `TieneInvestidura`, `BonosAtributos`, `EtiquetaBono`, `DesvioBonoSeAcumula`, `Derivar`);
  `Services/Worlds/StormlightRules.cs` (todos los miembros de §6.3 copiando el código actual: los tres `HashSet` y
  `ValidateCaminos` de `CharacterService.cs:12-33` tal cual en `ValidarIdentidad`, el bloqueo
  `request.CaminoRadiante = character.CaminoRadiante` de `:115` en `RestringirCambiosNoGm`, `AplicarAccionMesa` →
  `ArgumentException("Table action not available in this world.")`, `AlConcluirMeta`/`AlBorrarMeta` vacíos,
  `ReglasPropias = TalentosReglas.ReglasRoshar`, `ReglasTalentos = TalentosReglas.Efectivas(TalentosReglas.ReglasRoshar)`);
  `Services/Worlds/MistbornRules.cs` (delega todos los miembros nuevos en
  `private static readonly StormlightRules Respaldo = new();` con el comentario `// hasta T12`; `Id` y `NormalizarEra` ya son
  suyos desde T04; §6.1 «Calendario»); `Services/Characters/CharacterService.cs` (§6.2: ctor con `IWorldRulesProvider`,
  `GetWorldRulesAsync`, `world.ValidarIdentidad` en `:79`/`:118` con
  `new IdentidadPersonaje(request.CaminoHeroico, request.CaminoRadiante, "", "", request.Ascendencia, [], [], new Dictionary<string, decimal>())`
  hasta que T11 añada las columnas, `world.RestringirCambiosNoGm(request, character)` en lugar de la línea `:115` (el núcleo
  conserva `Name` y `CaminoHeroico`, `:113-114`), `MapToResponse(c, world, ctx)` en las cinco llamadas,
  `talentos.Union(world.TalentosImplicitos(c))` (vacío en Stormlight), `tieneInvestidura` **obligatorio** en `BuildInvLineas`
  desde `world.TieneInvestidura(c, talentos, [])`, `acumula` y `etiquetaBono` opcionales en `BuildDesvioLineas` y `etiquetaBono`
  opcional en las otras tres, pasando `false`/`null` (**firmas finales exactas en el bloque «Firmas finales tras T10» de §6.2**),
  y los ocho `Calcular` con `reglas: world.ReglasTalentos` y `tieneInvestidura`; ninguna referencia a `MistbornData`);
  `Services/Characters/TalentosReglas.cs` (§6.2 filas `:56`, `:170` y `:214-224`: los dos parámetros **obligatorios** `reglas` y
  `tieneInvestidura` de `Calcular`, insertados antes de `unidad`; renombrar la variable de deconstrucción de `:182` **y** su uso
  en `:186` a `rs`; `tieneInvestidura` propagado a `EsActiva`, sin respaldo a `CaminoRadiante`; al final de la clase, aditivos,
  `ClavesRoshar`, `ReglasRoshar`, `ReglasCosmere` y `Efectivas(propias)`, sin editar el literal `Reglas` ni copiar listas).
  `Services/Bootstrap.cs` no cambia: T04 ya registró las dos implementaciones y el proveedor.
- Cambios: — (descritos por fichero en «Archivos»).
- Orden sugerido: 1) ampliar la interfaz y `StormlightRules` copiando el código; 2) delegación de `MistbornRules`; 3)
  `TalentosReglas` aditivo; 4) ctor y llamadas de `CharacterService`; 5) compilar; 6) arrancar la API de la tarea en su puerto (§1
  «Protocolo», punto 3) y comparar con T02.
- Aceptación: `dotnet build` verde; los JSON de T02 son **byte a byte iguales** tras el cambio (mismo orden de líneas y totales;
  comparador de §1 «Protocolo», punto 5);
  `System.Diagnostics.Debug.Assert(TalentosReglas.Efectivas(TalentosReglas.ReglasRoshar).Keys.SequenceEqual(TalentosReglas.Reglas.Keys))`
  en el constructor estático de `StormlightRules` (solo Debug) no salta al arrancar; un personaje con `CaminoRadiante=""` sigue
  con Investidura 0; `POST /campaigns/{id}/characters` con `Ascendencia="Kandra"` en campaña Stormlight sigue dando 400 con el
  mensaje actual; un jugador no GM (personaje (4) de T02) que cambia `caminoRadiante` en su `PUT` lo ve ignorado (200, valor
  guardado); una campaña `mistborn` se comporta como Stormlight (delegación);
  `grep -n "MistbornData" Services/Characters/CharacterService.cs` no devuelve nada.
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: la implementación real de `MistbornRules` (T12), columnas nuevas (T11), `GradosDe` (T12) y endpoints de mesa
  (T13).

**T11 · Columnas de personaje, migración `AddCharacterMistbornFields`, `CharacterJson` y DTOs** — F2 · api · M · T10
- Archivos (worktree de tarea `cosmere-api-nb-t11`): crear `Services/Characters/CharacterJson.cs` (`internal static`:
  `ParsePoderes`, `ParseRecursos`, `SerializarPoderes`, `SerializarRecursos`, `FusionarPoderes`, §4.2; `PoderPersonaje.cs` ya
  existe desde T10); `Messages/Database/Entities/CharacterEntity.cs` (5 propiedades tras `IdealesJurados` `:21`: `CaminoMetal`,
  `CaminoInicial`, `Poderes`, `Recursos`, `Bendiciones`); `Infrastructure/Data/CosmereContext.cs` `OnModelCreating`
  (`HasDefaultValue("")` ×2, `("[]")`, `("{}")` y `HasDefaultValueSql("'{}'")` para `Bendiciones`, §4.1);
  `Messages/Characters/In/CharacterRequest.cs` (§5.1, incluido `CaminoInicial`); `Messages/Characters/Out/CharacterResponse.cs` (7
  propiedades tras `Metas` `:98` y antes de `CreatedAt` `:100`; `DerivadosSet` y `BonosAtributos` vacíos por ahora);
  `Messages/Characters/Out/StatDesglose.cs` (`StatLinea.EsBono` al final de la clase, §5.1); `CharacterService.cs` (creación con
  `CaminoMetal`/`CaminoInicial`; `ApplyUpdate` condicional con `FusionarPoderes` (§6.2 fila `:172-199`), que conserva
  `Completo/Cargas/AjusteCargasMax/Viales/Desprovisto` de los existentes y normaliza `Completo`/`MetaId` según origen y atium
  (§5.3); `MapToResponse` copia `CaminoMetal`, `CaminoInicial`, `Poderes`, `Recursos` y `Bendiciones`; `ValidarIdentidad` recibe
  las listas efectivas, §6.2 filas `:79`/`:118`; **la comprobación de `MetaId`** de §6.2 fila `:118`, en el servicio;
  `EsBono = true` en las líneas de bono de atributo que construyen las cinco `Build*Lineas`, §6.2 fila `:210-298`). El bloqueo
  no-GM de `CaminoMetal`, `CaminoInicial` y `Bendiciones` y la reinyección de poderes **no** van en `CharacterService`: son de
  `MistbornRules.RestringirCambiosNoGm` (T12, §5.2).
- Cambios: — (descritos por fichero en «Archivos»).
- Comandos: `dotnet ef migrations add AddCharacterMistbornFields --project Infrastructure --startup-project API` → abrir el `Up` y
  comprobar que las 5 columnas llevan `defaultValue`/`defaultValueSql` **presente y con el valor de §4.1** (`""` es correcto en
  `CaminoMetal` y `CaminoInicial`; `"[]"`, `"{}"` y `'{}'` en `Poderes`, `Recursos` y `Bendiciones`), como §4.3 M2; **si
  `Bendiciones` no lo lleva, no aplicar**: añadir el `HasDefaultValueSql` y regenerar (`dotnet ef migrations remove`) →
  `database update` (desde el worktree de la tarea; «API parada» según §1 «Protocolo», punto 2).
- Aceptación (verificable con campaña Stormlight, porque `MistbornRules` delega en `StormlightRules` hasta T12, que rechaza
  cualquier poder o Bendición): la migración se aplica sobre una BD con al menos un personaje existente (no solo sobre BD vacía) y
  las consultas de verificación de §4.1 (M2, con `docker exec cosmere-postgres-local psql -U jira -d cosmere -c "<SQL>"`) dan 0;
  `PUT` sin los campos nuevos conserva los valores; `GET` devuelve `caminoMetal:""`, `caminoInicial:""`, `poderes:[]`,
  `recursos:{}`, `bendiciones:[]`, `derivadosSet:{}` y `bonosAtributos:{}` en personajes existentes; cada línea de desglose lleva
  `esBono` (`true` solo en las líneas «Forma: …» del cantor (2) de T02); `PUT` con
  `poderes:[{"arte":"alomancia","metal":"acero"}]` en campaña Stormlight → 400; `POST`/`PUT` con `caminoInicial:"metal"` en
  campaña Stormlight → 400 (`StormlightRules` exige `CaminoInicial == ""`, §6.3); JSON de T02 idénticos salvo las siete
  propiedades nuevas y `esBono`, que el comparador de §1 «Protocolo», punto 5, descarta. Los criterios con datos guardados en una
  campaña Mistborn (bloqueos no-GM, reinyección, `metaId` de otro personaje) están en T12.
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: —

**T12 · `MistbornRules` + `ArtesMetalicas.Progresion` + `DerivadosSet`** — F2 · api · L · T11
- Archivos a crear (worktree de tarea `cosmere-api-nb-t12`): `Services/Worlds/MistbornData.cs` (`CaminosMetal`,
  `CaminosAlomanticos`, `Ascendencias`, `Metales` (17), `MetalesComunes` (8), `Origenes`, `Bendiciones` con sus bonos y `Reglas`,
  el diccionario **solo con las reglas del mundo** (`["Resistencia koloss"]`, §6.3) que `MistbornRules` usa como `ReglasPropias` y
  combina con el núcleo Cosmere vía `TalentosReglas.Efectivas`; sin copia profunda: las listas del núcleo se comparten y nadie las
  muta), `Services/Worlds/ArtesMetalicas.cs` (§6.3), `Services/Worlds/BonosFormaExtensions.cs` (`ComoDiccionario`, §6.2 fila
  `:307`; no se edita `FormasCantor.cs`).
- Archivos a tocar: `Services/Worlds/MistbornRules.cs` (sustituye la delegación de T10 por la implementación real de §5.3 y §6.3
  en todos los miembros salvo `AplicarAccionMesa`, que sigue delegando hasta T13: `ValidarIdentidad`, `RestringirCambiosNoGm`
  (bloque literal de §5.2: `CaminoMetal`, `CaminoInicial`, Bendiciones y reinyección de poderes), `AlConcluirMeta`/`AlBorrarMeta`
  (§6.2 filas `MetaService`), `TieneInvestidura`, `TalentosImplicitos`, `BonosAtributos`, `EtiquetaBono`, `DesvioBonoSeAcumula`,
  `RecursosPermitidos`, `ReglasPropias = MistbornData.Reglas`, `ReglasTalentos = TalentosReglas.Efectivas(MistbornData.Reglas)`,
  `Derivar`); `CharacterService.cs` (`DerivadosSet = world.Derivar(c, talentos, poderes, fb)` y
  `BonosAtributos = fb.ComoDiccionario()` al final del inicializador de `MapToResponse`; `etiqueta = world.EtiquetaBono(forma)`
  pasada a las cinco `Build*Lineas` y `acumula: world.DesvioBonoSeAcumula`; recorte de salida de `investiduraActual` y `Cargas`,
  §6.2; **normalización de `CaminoInicial`** antes de `ValidarIdentidad` en `POST` y `PUT`, §5.2; línea `Situacional` «Forma
  natural: +5 contra daño por laceración» en `BuildDesvioLineas` cuando `talentos` contiene «Forma natural», §6.3; ninguna
  referencia a `MistbornData`: el servicio solo llama a los miembros de `IWorldRules`); `TalentosReglas.cs:240-261` (`GradosDe`
  con huecos personalizados). `Bootstrap.cs` no cambia (T04).
- Cambios: — (descritos por fichero en «Archivos»).
- Forma de `Derivar`: construir un `Dictionary<string, StatDesglose>`; por arte, helper
  `ArteDerivada(string arte, int grados, int atributo, string nombreAtributo)` que añade las cuatro claves con sus `StatLinea`;
  después `feruquimia.cargasMax`, `poder.<metal>.cargasMax` por cada poder feruquímico (aunque el arte no se emita),
  `feruquimia.mentesALaVez`. **No** `hemalurgia.clavosMax` (T49a). Disparador por arte: hueco de la habilidad **o** camino que la
  implique **o** algún poder con ese `Arte` (§6.3 (i)-(iii)). Grados: buscar `HabilidadPersonalizada1..6` por nombre
  (`Alomancia`/`Feruquimia`, sin tildes, `OrdinalIgnoreCase`); si no existe, grados 0 (límite 1, dado 1, alcance 3 m).
- **Comprobación en código (sin proyecto de tests)**: en el constructor estático de `MistbornData` añadir
  `System.Diagnostics.Debug.Assert(!TalentosReglas.Reglas.ContainsKey("Resistencia koloss") && !TalentosReglas.Efectivas(Reglas).Keys.Intersect(TalentosReglas.ClavesRoshar).Any());`
  (solo activo en Debug, sin coste en Release: el literal del núcleo no gana reglas de Scadrial y Mistborn no hereda las de
  Roshar) y verificar que la API de la tarea arranca sin disparar la aserción.
- **Comprobación de datos obligatoria** (riesgo 21): durante F1-F3 la ficha sigue siendo 100 % Stormlight y el servidor no valida
  por mundo, así que un personaje de una campaña `mistborn` puede tener Orden radiante o ascendencia Oyente guardadas, y desde F2
  `MistbornRules.ValidarIdentidad` lo rechazaría con 400 en **todo** `PUT` (el cliente reenvía siempre el `caminoRadiante`
  guardado). En la BD local, con `docker exec cosmere-postgres-local psql -U jira -d cosmere -c "<SQL>"`:
  `SELECT ch."Id", ch."Name", ch."CaminoRadiante", ch."Ascendencia" FROM "Characters" ch JOIN "Campaigns" c ON c."Id" = ch."CampaignId" WHERE c."World" = 'mistborn' AND (ch."CaminoRadiante" <> '' OR ch."Ascendencia" NOT IN ('', 'Humano', 'Kandra', 'Sangre koloss'));`
  debe devolver 0 filas; si no, el agente ejecuta **sin preguntar** (las campañas Bruma de F1-F3 son de prueba, P8)
  `UPDATE "Characters" ch SET "CaminoRadiante" = '', "IdealesJurados" = 0, "Ascendencia" = CASE WHEN ch."Ascendencia" IN ('Humano','Kandra','Sangre koloss') THEN ch."Ascendencia" ELSE 'Humano' END FROM "Campaigns" c WHERE c."Id" = ch."CampaignId" AND c."World" = 'mistborn';`
  y limpia en `Talentos` los talentos de orden, potencias y formas si los hubiera. En producción, Xavi repite la consulta (y el
  `UPDATE` si devuelve filas) dentro de la puerta de despliegue, tras el `pg_dump` (§1 «Protocolo», punto 1; con un único
  despliegue final no habrá filas, porque las campañas Bruma solo existen en producción desde ese despliegue).
- Reglas: §5.3, §6.3 completas. Libro: L.18-19 / PDF 24-25; L.26 / PDF 32; L.34-35 / PDF 40-41; L.38-39 / PDF 44-45; L.128-131 /
  PDF 134-137; L.136 / PDF 142; L.146 / PDF 152; L.155 / PDF 161; L.163 / PDF 169; L.229 / PDF 235; L.289-290 / PDF 295-296; L.295
  / PDF 301.
- Aceptación (campaña `mistborn`): brumoso de **nivel 1** con DIS 1, PRE 3, VOL 2, `HabilidadPersonalizada2="Alomancia"` (`VOL`)
  valor **2** (grado máximo 2 en rango 1: 1 de Ruptura + 1 gratuito, L.29 / PDF 35), sin talentos extra → `investidura.total=5`,
  `derivadosSet['alomancia.modificador'].total=4`, `limite=2`, `dado.total=6`, `alcance.total=12`; el mismo brumoso a **nivel 6**
  (rango 2) con Alomancia 3, talentos Investido y Portentoso y `poderes[0].completo=true` (ejemplo de §5.5; Portentoso exige
  Investido y ambos exigen la meta completa, L.136 / PDF 142, L.75 / PDF 81) → `investidura.total=7` (Base 2, Presencia 3,
  Investido 2), `modificador.total=5`, `limite=3`, `dado.total=8`, `alcance.total=48` (24 + 24 por Portentoso); con un poder
  `completo:true` guardado, un `PUT` que envía ese poder con `completo:false` → 200 y la respuesta trae `completo:true`
  (FusionarPoderes conserva); `PUT` con `{"arte":"alomancia","metal":"atium","completo":false}` → 200 con `completo:true`
  (normalización, §5.3); `PUT` con `{"arte":"alomancia","metal":"acero","origen":"clavo","completo":false,"metaId":7}` (GM) → 200
  con `completo:true` y `metaId:null`; `PUT` con `poderes[].metaId` de una meta de otro personaje → 400; jugador no GM con
  `bendiciones:["consciencia"]` guardadas que envía `["potencia"]` → se conserva `["consciencia"]`; jugador no GM sin Bendición
  que envía `["consciencia","potencia"]` → 403; jugador no GM con un poder `origen:"clavo"` guardado que envía `poderes:[]` → el
  clavo se conserva (reinyección, §5.2); jugador no GM que envía `poderes` con un metal nuevo → 403; jugador no GM que envía
  `caminoMetal:"ferrin"` y `caminoInicial:"metal"` sobre un brumoso → 200 y se conservan `brumoso` y su `caminoInicial`; el GM
  con la misma petición → 200 y cambia; `caminoInicial:"x"` → 400; `PUT` con `caminoInicial:"metal"` y `caminoMetal:""` sobre un
  personaje con camino heroico → 200 y `caminoInicial:"heroico"` (normalización, §5.2); GM que borra `caminoHeroico`
  (`caminoHeroico:""`) en un personaje con `caminoInicial:"heroico"` y `caminoMetal:"brumoso"` → 200 y `caminoInicial:"metal"`;
  sin ningún camino → `caminoInicial:""`; la aserción `Debug.Assert` de `MistbornData` no salta al arrancar en Debug;
  feruquimista de **nivel 6 (rango 2**; `TalentosReglas.Rango(5) = 1`, `TalentosReglas.cs:237`; L.27 / PDF 33) con Feruquimia 2,
  INT 3 y «Mentes de metal ampliadas» → `feruquimia.cargasMax = 2 + 2 + 2 = 6`, `feruquimia.alcance.total=12` (Portentoso no se
  aplica), `mentesALaVez=3` (INT 3) y `modificador.total=5`; caso aparte con prerrequisitos de libro: Feruquimia 3, Saber 3, nivel
  6, talentos Mentes de metal ampliadas + Guardián del conocimiento, poder cobre → `feruquimia.cargasMax = 2 + 3 + 2 = 7`,
  `poder.cobre.cargasMax=12`, `mentesALaVez=5` (INT 3 + línea de bono 2), `feruquimia.modificador.total=8`,
  `bonosAtributos.intelecto=2`; ferrin con Feruquimia 2 → sin clave `feruquimia.mentesALaVez`; poder `feruquimia:hierro` con
  `origen:"medallon"` → `poder.hierro.cargasMax=8` y nace con `cargas:8`; poder `feruquimia:acero` `origen:"camino"` con
  `completo:false` → `poder.acero.cargasMax.total=0` con línea «Naciente: sin mente de metal», y tras `completo:true` →
  `feruquimia.cargasMax`; `Ascendencia="Oyente"` → 400; `Kandra` + `CaminoMetal="ferrin"` → 400; `poderes` con
  `(alomancia, acero)` duplicado → 400; `arte:"hemalurgia"`, `metal:"plomo"` u `origen:"x"` → 400;
  `bendiciones:["consciencia","consciencia"]` → 400; Sangre koloss a nivel 4 **sin** «Resistencia koloss» en el JSON de `talentos`
  suma 4 a salud (línea «Resistencia koloss», vía `TalentosImplicitos`); kandra con armadura de Desvío 1 →
  `desvioCalculado.total=1` y `situacional` contiene la línea «Forma natural: +5 contra daño por laceración» (§6.3); kandra con
  DIS 2, PRE 1, **VOL 0** y `bendiciones:["consciencia"]` → `defensaEspiritual.total=15` con líneas Base 10, **Discernimiento 2,
  Presencia 1** y «Bendición de la Consciencia» 2 (la Defensa espiritual es 10 + Discernimiento + Presencia, L.26 / PDF 32,
  `CharacterService.cs:348-351`; **sin** prefijo «Forma: ») e `investidura.total=0` (un kandra no puede tener camino); el mismo
  kandra con `poderes:[{"arte":"alomancia","metal":"acero","origen":"clavo"}]` (puesto por el GM) → `investidura.total=6` con
  líneas Base 2, Discernimiento 2 y «Bendición de la Consciencia» 2 (caso sintético: el libro exige retirar un clavo de la
  Bendición para implantar otro clavo, L.35 / PDF 41, L.291 / PDF 297; el servidor no lo valida, es decisión del GM, y esta prueba
  solo comprueba que `TieneInvestidura` reconoce `Origen="clavo"` aunque `Ascendencia` sea Kandra); humano sin camino con poder
  `alomancia:acero` `origen:"clavo"` y **sin hueco `Alomancia`** → Investidura > 0, `completo:true`,
  `derivadosSet['alomancia.limite'].total=1`, `dado.total=1`, `alcance.total=3` y `modificador.total` = Voluntad (disparador (iii)
  de §6.3); `origen:"lerasium"` con `arte:"feruquimia"` → 400; `origen:"medallon"` con `arte:"alomancia"` → 400;
  `origen:"medallon"` con `metal:"atium"` o `"nicrosil"` → 400; `Sangre koloss` + `caminoMetal:"feruquimista"` → 400 (§5.3); la
  regla «Vestimenta tradicional» se comporta exactamente igual que en Stormlight (solo se activa si el **nombre** de la armadura
  equipada contiene «Presentable», `TalentosReglas.cs:219-221`; defecto previo, no se corrige aquí, §6.3);
  `grep -n "MistbornData" Services/Characters/CharacterService.cs` no devuelve nada; JSON de T02 (Stormlight) idénticos salvo
  propiedades nuevas (comparador de §1 «Protocolo», punto 5).
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: —

**T13 · `PATCH …/recursos` y acciones `beber-vial` / `inicio-escena`** — F2 · api · M · T12
- Archivos (worktree de tarea `cosmere-api-nb-t13`): `Services/Worlds/MistbornRules.cs` (`AplicarAccionMesa` con las tres
  variantes de `AccionMesa` y las reglas de §5.2: recortes, 400/403/404, `BeberVial` (Desprovisto y restauración de Investidura) e
  `InicioEscena` (Investidura a máximo o 1 y limpieza de `Desprovisto` de los comunes, Q24); usa `estado` para `investidura.Total`
  y `poder.<metal>.cargasMax`); `Services/Characters/CharacterService.cs` (`PatchRecursosAsync`, `BeberVialAsync`,
  `InicioEscenaAsync`, **solo infraestructura**: transacción con `SELECT … FOR UPDATE` sobre la fila del personaje, filtros
  `CampaignId`/`NOT IsNpc`, `FirstOrDefaultAsync() ?? throw new KeyNotFoundException` (nunca `FirstAsync`, que daría 409),
  comprobación `isGm || OwnerId == userId`, `estado = MapToResponse(c, world)`,
  `world.AplicarAccionMesa(c, new AccionMesa.X(...), estado)`, `SaveChangesAsync`, `CommitAsync` y respuesta con `MapToResponse`;
  snippet exacto en §5.2; sin tokens de concurrencia globales; ninguna regla de mesa ni referencia a `MistbornData` en el
  servicio); `ICharacterService`; `API/Controllers/CharactersController.cs` (`[HttpPatch("{characterId:long}/recursos")]`,
  `[HttpPost("{characterId:long}/acciones/beber-vial")]`, `[HttpPost("{characterId:long}/acciones/inicio-escena")]`: la ruta del
  controlador es `campaigns/{campaignId:long}/[controller]` y los parámetros se llaman `campaignId`/`characterId`,
  `:11, :19, :32, :43`; con `{id}` no se enlazarían). `RecursosRequest.cs` ya existe desde T10.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: `PATCH {"recursos":{"investiduraActual":99}}` deja `investiduraActual` = máximo; `{"recursos":{"salud":3}}` → 400;
  `{"poderes":[{"arte":"feruquimia","metal":"oro","cargas":50}]}` recorta a `cargasMax`; `cargas:1` sobre un poder feruquímico
  `completo:false` → 400; jugador no GM que sube `cargas` de un poder `origen:"medallon"` → 403 y que las baja → 200; GM que pone
  `cargas:8` en el medallón → 200; `ajusteCargasMax:-1` → 200 y `poder.<metal>.cargasMax` baja 1; `ajusteCargasMax:1` → 400; dos
  `PATCH` concurrentes con claves distintas (`investiduraActual` y `cuentasAtium`) dejan ambas claves escritas;
  `PATCH …/characters/999999/recursos` → **404 (nunca 409)**; `PATCH …/recursos` sobre un `characterId` de **otra campaña**
  (aunque el llamante sea GM de `cid`) → 404; sobre un PNJ (`IsNpc`) → 404; `beber-vial {"metales":["atium"]}` → 400; brumoso solo
  de atium + `beber-vial {"metales":["hierro"]}` → `desprovisto` e `investiduraActual` sin cambios; jugador sobre personaje ajeno
  → 403; `beber-vial {"metales":["acero","hierro","estano","peltre","cinc","laton","cobre","bronce"]}` en brumoso con poderes
  acero y oro → `desprovisto` false en acero y true en oro, Investidura al máximo; `beber-vial {"metales":["hierro"]}` en brumoso
  solo de acero → `desprovisto:true` en acero e `investiduraActual` **sin cambios**; brumoso solo de cadmio con
  `beber-vial {"metales":["acero"]}` → `desprovisto:true` en cadmio e `investiduraActual` sin cambios; `beber-vial` en
  feruquimista puro → 400; `inicio-escena {"sorprendido":true}` → `investiduraActual=1` y `desprovisto` sin cambios;
  `inicio-escena {"sorprendido":false}` en brumoso de acero Desprovisto → `desprovisto:false` e `investiduraActual` = máximo; en
  brumoso de oro Desprovisto → `desprovisto` sin cambios (metal raro, Q24); `inicio-escena` en feruquimista puro
  (`investidura.total=0`) → 400; en una campaña Stormlight, las tres acciones (`PATCH …/recursos` con cualquier cuerpo,
  `beber-vial` e `inicio-escena`) → 400 «Table action not available in this world.» (`StormlightRules.AplicarAccionMesa`, §6.3);
  `grep -n "MistbornData" Services/Characters/CharacterService.cs` no devuelve nada.
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: —

**T14 · Conclusión de meta marca el poder completo; borrado de meta desenlaza (`MetaService` llama a
`AlConcluirMeta`/`AlBorrarMeta`)** — F2 · api · S · T11, T12
- Archivos (worktree de tarea `cosmere-api-nb-t14`): `Services/Metas/MetaService.cs`: ctor
  `MetaService(CosmereContext db, IWorldRulesProvider reglas)` (`:9`); `ConcludeMetaAsync` (`:53-67`): tras guardar la conclusión
  con cualquier `TipoConclusion` válido (Q20), resolver el mundo de la campaña, cargar el personaje y llamar a
  `world.AlConcluirMeta(ch, meta)` + `SaveChangesAsync` (snippet en §6.2); `DeleteMetaAsync` (`:69-74`): tras `Remove`,
  `world.AlBorrarMeta(ch, meta)` con el mismo patrón. **Ninguna lógica de `Poderes` en `MetaService`**: la implementación es de
  `MistbornRules` (T12) y `StormlightRules` es no-op. `Bootstrap.cs` no cambia (la DI inyecta `IWorldRulesProvider`, registrado en
  T04).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: meta enlazada por `metaId` concluida con `exito`, `crecimiento` **o** `fracaso` → `poderes[].completo=true` en el
  siguiente `GET` (L.284 / PDF 290; decisión (l), Q20) y, si el poder es feruquímico, `poder.<metal>.cargasMax` pasa de 0 al valor
  completo (ya puede almacenar cargas); borrar una meta enlazada deja `metaId:null` en el poder y `completo` sin cambios; meta sin
  poder enlazado (todas las de Stormlight) → comportamiento idéntico, JSON de T02 iguales;
  `grep -nE "Poderes|CharacterJson" Services/Metas/MetaService.cs` no devuelve nada. (La validación de `metaId` del `PUT` es de
  T11/T12, no de esta tarea.)
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: —

**T15 · Tipos TS del personaje y funciones de `charactersApi`** — F2 · web · S · T01, T11, T12, T13
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que tareas web de F3, §1
  «Protocolo», punto 3): `src/types/index.ts` (§5.4: `PoderPersonaje`, `StatLinea.esBono`, `Character` (+ `caminoInicial`,
  `bonosAtributos`), `CreateCharacterRequest`, `UpdateCharacterRequest` (el `Omit` es el bloque `:139-143` del WIP, commiteado en
  T01: **conservar `'desvioCalculado'`** y añadir `'recursos' | 'derivadosSet' | 'bonosAtributos'`), `RecursosPatch` con
  `ajusteCargasMax`); `src/api/characters.ts` (`patchRecursos`, `beberVial`, `inicioEscena` y `normalizeCharacter` aplicado a toda
  respuesta de personaje, §5.4); `src/pages/characters/CharacterListPage.tsx:254-258` (`caminoMetal: ''`, `caminoInicial: ''` en
  el alta).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: `npx tsc -b` verde; sin cambios visuales; `normalizeCharacter` aplicado a una respuesta sin `poderes` (API anterior
  a T11) devuelve `poderes: []` y `recursos: {}`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

### F3 — Datos estáticos y enciclopedia de Nacidos de la Bruma (paralelizable; sin dependencias de API)

**T16 · `eras.ts`, `metales.ts`, `progresionArtes.ts`, `tipos.ts` (+ medida de referencia del bundle)** — F3 · web · M · T06b
(entrada `<pdfPath>`, §0; si falta, respaldo determinista de §1 «Protocolo», punto 2)
- Antes de crear ficheros (primera tarea de F3; directamente en `cosmere-web-nb` o, si corre a la vez que T15, en su worktree de
  tarea con `npm ci` como paso 0, §1 «Protocolo», punto 3): ejecutar `npm run build` y guardar el listado de tamaños de
  `dist/assets/*.js` en `<docsPath>\nacidos-de-la-bruma\bundle-referencia.txt` (anexo; no viaja en el commit de la tarea: lo
  sincroniza el orquestador) como referencia para T24b, T27-T30, T45 y T46 (antes de F1 el chunk principal pesaba 1.425.267
  bytes).
- Primer paso: renderizar las páginas 172-177 con
  `dotnet run --project "<herramienta>" -- "<pdfPath>" "<outputDir>" 172 173 174 175 176 177` (§1 «Protocolo», punto 2) y
  transcribir las tablas de alomancia y feruquimia **desde la imagen**, no desde `<flowPath>` (en el texto la tabla «Metales en la
  alomancia» llega con las columnas desordenadas: nombres de brumoso, metal emparejado, era, Tirón/Empujón y Externo/Interno en
  bloques separados). **Resolución**: la herramienta renderiza a 96 DPI fijos (`Program.cs:31`, `new RenderOptions(Dpi: 96)`; el
  comentario de `:30` dice «150 DPI» pero no es cierto), ≈816×1056 px por página, que puede ser ilegible para una tabla densa: si
  no se lee, renderizar esa página a 200 DPI con PyMuPDF en el scratchpad (comando de §1 «Protocolo», punto 2); nunca editar la
  herramienta. Sin `<pdfPath>`, respaldo determinista (§1 «Protocolo», punto 2): `<rendersPath>` no contiene estas páginas, así
  que se transcribe de `<flowPath>` con `// [inferido]` en cada fila. Las filas leídas en imagen quedan sin `// [inferido]` y la
  revisión visual de T25b para `metales.ts` se da por hecha en esta tarea (T17, T18, T28 y T30 consumen `pareja`, `interno`,
  `empujon`, `nombreBrumoso` y `eras`).
- Archivos: `src/data/mistborn/eras.ts`, `metales.ts` (incluida `METALES_POR_CAMINO_Y_ERA`, §8), `progresionArtes.ts`, `tipos.ts`
  (`PoderAlomantico`, `PoderFeruquimico` y `PoderDef`, §8: nacen aquí porque T17 y T18 corren en paralelo y ambos los necesitan) e
  `index.ts`; `src/worlds/types.ts` (sustituir `export type PoderDef = unknown` por
  `import type { PoderDef } from '../data/mistborn/tipos'` y `export type { PoderDef }`: un import de tipo no arrastra datos al
  chunk principal). Tipos de §8 (`MetalDef` con `categoriaAlomancia` y `categoriaFeruquimia`). Al terminar, exportar desde
  `src/data/mistborn/index.ts` (el resto de tareas F3 hacen lo mismo y conectan sus constantes en el campo correspondiente de
  `src/worlds/mistborn.data.ts`; `talentos` queda `null` hasta T34a). Regla de importación por fichero de §8 (el barrel solo lo
  importa `mistborn.data.ts`).
- Cambios: — (descritos por fichero en «Archivos»).
- Libro: L.166-171 / PDF 172-177 (tablas); L.163 / PDF 169; L.371-372 / PDF 377-378 (tabla «Caminos de nacidos del metal por era»,
  copia literal). Informe: `docs/nacidos-de-la-bruma/08-inventario-alomancia.md`, `09-inventario-feruquimia-hemalurgia.md`.
- Aceptación: 17 metales; `METALES.filter(m => m.comun).length === 8`; parejas simétricas (`pareja(pareja(x)) === x`) para los 16
  metales con pareja; el atium tiene `pareja: null`, `interno: null`, `empujon: null` (L.168 / PDF 174);
  `METALES.find(m => m.id === 'acero')` →
  `{ pareja: 'hierro', interno: false, empujon: true, nombreBrumoso: 'Lanzamonedas', eras: ['era1','era2'] }` y
  `METALES.find(m => m.id === 'cromo')` →
  `{ pareja: 'nicrosil', interno: false, empujon: false, nombreBrumoso: 'Sanguijuela', eras: ['era2'] }` (leídos en la imagen de
  la página 174); `METALES_POR_CAMINO_Y_ERA.brumoso.era1` no contiene `'oro'` y sí `'atium'`;
  `METALES_POR_CAMINO_Y_ERA.brumoso.era2` no contiene `'atium'` y sí `'oro'`; `feruquimista.era2`, `['nacido-de-la-bruma'].era2`,
  `ferrin.era1` y `nacidoble.era1` son `[]` (L.372 / PDF 378); `PROGRESION_ARTES_METALICAS[3]` →
  `{ limite: 3, dado: 8, alcance: 24 }`; `PoderDef` de `src/worlds/types.ts` ya no es `unknown`; `bundle-referencia.txt` existe en
  `<docsPath>`; `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T17 · `alomancia.ts` (17 poderes, 83 talentos)** — F3 · web · L · T16
- Archivos: — (el título nombra el fichero; carpeta `src/data/mistborn/`, §8).
- Contenido: §8; estructura y tablas por metal de `docs/nacidos-de-la-bruma/08-inventario-alomancia.md` §3 (acciones básicas con
  activación, duración y coste; talentos con `prereq` **literal del libro**, `cost` según glifo, `description`, `notaLibro` en los
  4 casos de su §6). `PoderAlomantico extends Omit<Potencia, 'ordenes'>`. `caminos` por entrada según la cabecera de cada árbol
  (§7.5): acero, bronce, cinc, cobre, duraluminio, electro, estaño, hierro, latón, oro, peltre y **aluminio**
  `['brumoso', 'nacidoble', 'nacido-de-la-bruma']` (aluminio con `talentos: []` pero elegible, L.175 / PDF 181); atium
  `['brumoso', 'nacido-de-la-bruma']`; bendaleo, cadmio, cromo, nicrosil `['brumoso', 'nacidoble']`. `requiereMeta=false` solo
  atium. Los 7 nombres duplicados entre árboles (§7.7 #3) se transcriben en ambos árboles con su prerrequisito raíz propio. Al
  terminar, conectar `PODERES_ALOMANTICOS` en `WorldData.poderes` de `src/worlds/mistborn.data.ts` (el tipo `PoderAlomantico`
  viene de `./tipos`, creado en T16; `src/worlds/types.ts` no se toca).
- Libro: L.172-212 / PDF 178-218 (páginas por metal en §8).
- Aceptación: `PODERES_ALOMANTICOS.length === 17`; suma de `talentos.length` = 83; `new Set(nombres).size === 76` (nombres
  distintos, no entradas); cada `prereq` de raíz contiene `Alomancia de <metal>`; `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T18 · `feruquimia.ts` (17 poderes, 85 talentos)** — F3 · web · L · T16
- Archivos: — (el título nombra el fichero; carpeta `src/data/mistborn/`, §8).
- Contenido: §8; tabla maestra y árboles de `docs/nacidos-de-la-bruma/09-inventario-feruquimia-hemalurgia.md` §2;
  `PoderFeruquimico extends Omit<Potencia, 'ordenes'>`; `almacenar`/`decantar` con duración de ganancia de carga (variantes atium,
  bendaleo, bronce, cobre, oro); `tablaPorGrados` solo cobre; `medallon` (nicrosil `disponibleParaPJ: false`). `caminos` por
  entrada según la cabecera de cada árbol (§7.5): acero, aluminio, bronce, cinc, cobre, duraluminio, electro, estaño, hierro,
  latón, oro, peltre y **nicrosil** `['ferrin', 'nacidoble', 'feruquimista']` (nicrosil con `talentos: []` pero elegible, L.246 /
  PDF 252); bendaleo, cadmio, cromo `['ferrin', 'nacidoble']`; atium `['feruquimista']` (L.219 / PDF 225). Reflejos acelerados se
  transcribe en acero y en cinc; Precisión de estaño, Armamento de brazo de peltre y Lanzador de peltre comparten nombre con la
  alomancia (§7.7 #3). Al terminar, añadir `PODERES_FERUQUIMICOS` a `WorldData.poderes` de `mistborn.data.ts` (el tipo
  `PoderFeruquimico` viene de `./tipos`, creado en T16).
- Libro: L.213-250 / PDF 219-256.
- Aceptación: 17 entradas; 85 entradas de talento (84 nombres distintos); aluminio 3 talentos; nicrosil `talentos: []`;
  `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T19 · `caminosNacidosDelMetal.ts` (5 caminos, 33 talentos de árbol + 5 principales)** — F3 · web · M · T16
- Archivos: — (el título nombra el fichero; carpeta `src/data/mistborn/`, §8).
- Contenido: §8 y tabla §5.2-5.4 de `docs/nacidos-de-la-bruma/09-inventario-feruquimia-hemalurgia.md` (principal, qué concede,
  `habilidadInicial`, `seleccionMeta`, metas con los títulos de §2, árbol con prerrequisitos literales; Componedor / Resonancia
  aleada con sus condiciones). `mainTalent` exacto: Ruptura de brumoso, Ruptura de nacido de la bruma, **Herencia feruquímica**
  (con tilde, L.146 / PDF 152; nunca «feruquimista»), Herencia ferrin, Herencia nacidoble. `talentos` **no** incluye el principal.
  Colores hex por camino (pasan por `ink()`/`tint()`). Al terminar, conectar en `mistborn.data.ts`.
- Libro: L.127-159 / PDF 133-165; L.19 / PDF 25 (habilidad inicial: brumoso Alomancia; ferrin Feruquimia; nacidoble Disciplina;
  **nacido de la bruma y feruquimista NINGUNA**, L.141 / PDF 147 y L.145 / PDF 151: «no obtienes ningún grado gratuito»).
- Aceptación: 5 caminos, `talentos` 5/6/6/5/11; `habilidadInicial` = `'Alomancia'`, `null`, `null`, `'Feruquimia'`, `'Disciplina'`
  (brumoso, nacido de la bruma, feruquimista, ferrin, nacidoble); `eras` brumoso ambas, nacido de la bruma y feruquimista `era1`,
  ferrin y nacidoble `era2`; `ascendenciasPermitidas` = `['Humano','Sangre koloss']` en brumoso, ferrin y nacidoble y `['Humano']`
  en nacido de la bruma y feruquimista (Kandra excluida en los 5); `mainTalent` de feruquimista === `'Herencia feruquímica'`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T20 · `origenes.ts`** — F3 · web · M · T16
- Archivos: — (el título nombra el fichero; carpeta `src/data/mistborn/`, §8).
- Contenido: ascendencias (Humano: talento heroico extra en 1/6/11/16/21; Kandra: 6 puntos, una Bendición al crear y una 2.ª en
  rango 3, Forma natural + Disfraz kandra, sin nacido del metal; Sangre koloss: Era 2, FUE máx 6, Resistencia koloss), 5
  Bendiciones con bonos, árbol kandra (8), árbol sangre koloss (5), 15 culturas con era.
- Libro: L.31-48 / PDF 37-54. Informe: `docs/nacidos-de-la-bruma/10-resumen-reglas-mistborn.md`. Al terminar, conectar en
  `mistborn.data.ts`.
- Aceptación: conteos anteriores; ids de Bendición = los de §2; `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T21 · `heroicPaths.ts` de Nacidos de la Bruma (8 especialidades nuevas)** — F3 · web · L · T16
- Archivos: — (el título nombra el fichero; carpeta `src/data/mistborn/`, §8).
- Contenido: `HEROIC_PATHS_MISTBORN` reutilizando por referencia los objetos de `src/data/heroicPaths.ts` para Investigador,
  Ladrón, Rastreador, Fiel, Mentor, Estratega, Cirujano, Soldado, Oficial, Político, y transcribiendo Rebelde, Mataneblinos,
  Francotirador, Estafador, Inventor, Alborotador, Pistolero, Planificador (`eras: ['era2']` en Inventor y Pistolero). Verificado:
  los nombres de talento de las 10 especialidades compartidas (8 por especialidad) y las habilidades iniciales de los 6 caminos
  (`initialSkill` Perspicacia, Percepción, Disciplina, Saber, Atletismo, Liderazgo, `heroicPaths.ts`) son idénticos a Stormlight
  (tabla L.19 / PDF 25; cap. 4 L.73-126 / PDF 79-132; L.374 / PDF 380: las especialidades con el mismo nombre se usan libremente
  en ambos libros). Queda por comparar solo el **texto** de 2-3 talentos por especialidad; anotar diferencias en `notaLibro`.
- Libro: cap. 4 L.73-126 / PDF 79-132; L.19 / PDF 25. Al terminar, conectar `HEROIC_PATHS_MISTBORN` en
  `WorldData.caminosHeroicos` de `mistborn.data.ts`.
- Aceptación: 6 caminos × 3 especialidades; `mainTalent` idénticos a los de Stormlight; «Vestimenta tradicional» (Enviado/Fiel,
  L.100 / PDF 106) presente con el mismo nombre que en Stormlight (su regla de servidor se comparte, §6.3); `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T22 · `hemalurgia.ts`** — F3 · web · S · T16
- Archivos: — (el título nombra el fichero; carpeta `src/data/mistborn/`, §8).
- Contenido y libro: §8 (L.251 / PDF 257; L.288-292 / PDF 294-298). Solo texto de enciclopedia. Informe:
  `docs/nacidos-de-la-bruma/09-inventario-feruquimia-hemalurgia.md`. Al terminar, conectar en `mistborn.data.ts`.
- Aceptación: 12 tipos de clavo (4 de atributo a rango 2: cinc VOL, cobre INT, estaño DIS, hierro FUE; 8 de poder a rango 3 con
  elección entre 4 poderes, L.291 / PDF 297); `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T23 · Overlays de aventuras y combate con resolver (base intacta hasta T23b)** — F3 · web · M · T06b
- Archivos: crear `src/data/overlays.ts` (§8; sustituye los `unknown` de `AventurasOverlay`/`CombatOverlay` en
  `src/worlds/types.ts` por los tipos reales), `src/data/mistborn/aventurasOverlay.ts`, `combatOverlay.ts` (las 23 operaciones
  de la lista de §6.2 de `docs/nacidos-de-la-bruma/06-delta-reglas-base.md`, con los textos de Desprovisto y Mermado de su §1.2);
  conectar ambos en `WorldData.overlays` de `mistborn.data.ts`; `AventurasPage.tsx`, `CombatPage.tsx` consumen el resolver con
  el overlay de `useWorldData()` (o `null` mientras carga); `CombatPage.tsx:68` subtítulo «…reglas de combate de {cfg.nombre}».
  `aventuras.ts` y `combatRules.ts` **no se editan**.
- Cambios: — (descritos por fichero en «Archivos»).
- Libro: L.306-315 / PDF 312-321; L.317-329 / PDF 323-335; L.310-311 / PDF 316-317.
- Aceptación: `resolveAventuras('stormlight').estados === ESTADOS` (misma referencia); en Mistborn hay 15 estados en orden
  alfabético con Desprovisto y Mermado y sin Empoderado; Agarrar dice «Retenido».
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T23b · Base neutra Cosmere de `aventuras.ts`/`combatRules.ts` y overlay Stormlight (Q12)** — F3 · web · M · T23
- Antes de tocar nada: script temporal en el scratchpad (`npx --yes tsx <script>` desde el worktree, como en T03) que importa
  `src/data/overlays.ts` y los datos y guarda con `JSON.stringify` **todas** las secciones resueltas para `stormlight`
  (`resolveAventuras('stormlight', null)`, `resolveCombat('stormlight', null)`) y para `mistborn` (con los overlays de T23) en
  `aventuras-stormlight-antes.json`, `combat-stormlight-antes.json`, `aventuras-mistborn-antes.json` y
  `combat-mistborn-antes.json`.
- Archivos: `src/data/aventuras.ts` y `src/data/combatRules.ts` (neutralizar los ≈25 fragmentos de Roshar del informe 06 §4,
  listados en §8 fila `stormlight.data.ts`; nada más cambia en esos ficheros: ni ids, ni orden, ni reglas);
  `src/worlds/stormlight.data.ts` (exportar `STORMLIGHT_AVENTURAS: AventurasOverlay` y `STORMLIGHT_COMBATE: CombatOverlay` y
  conectarlos en `DATA.overlays`, que es también `syncData`: en Stormlight el overlay está disponible en el primer render, sin
  `Spinner`); `src/data/mistborn/aventurasOverlay.ts` y `combatOverlay.ts` (quitar las operaciones que ya no hacen falta sobre
  una base neutra, p. ej. `remove: ['Empoderado']` o la sustitución de «mc», y añadir las que la base neutra exija, p. ej. la
  moneda «ar» en los costes); `src/data/overlays.ts` solo si el resolver necesita una operación nueva (sin cambiar su firma).
  `AventurasPage.tsx` y `CombatPage.tsx` no se tocan: consumen el resolver desde T23.
- Cambios: la base describe cada regla sin color de mundo (ejemplos genéricos, «la moneda local», tipos de daño sin armas de un
  mundo concreto, Inconsciente sin la excepción radiante, sin el estado Empoderado); el overlay Stormlight vuelve a poner, por
  nombre y en la misma posición, exactamente el texto actual; el overlay de Bruma produce el mismo resultado que en T23. Es la
  aplicación literal de P8: la regla es Cosmere, el color es del mundo.
- Libro: L.306-315 / PDF 312-321 y L.317-329 / PDF 323-335 (Bruma); `ch10_combat.txt` y `ch4_full.txt` (Stormlight, §0
  «Fuentes del libro»); `docs/nacidos-de-la-bruma/06-delta-reglas-base.md` §4 (lista de fragmentos).
- Aceptación: los cuatro JSON «después» son **byte a byte iguales** a los «antes» (la campaña Stormlight no cambia ni un texto;
  la de Bruma tampoco);
  `grep -n "alta tormenta\|abismoide\|Shadesmar\|esquirlad\|fabrial\|Radiante\|luz tormentosa\|Empoderado" src/data/aventuras.ts src/data/combatRules.ts`
  y `grep -n " mc\b"` sobre los mismos ficheros → 0 resultados; `resolveAventuras('stormlight')` sin overlay devuelve la base
  neutra (el criterio de identidad `=== ESTADOS` de T23 queda sustituido por la igualdad JSON de esta tarea); capturas de
  Aventuras y Combate en una campaña Stormlight idénticas antes/después; `npx tsc -b`, `npm run lint`; `npm run build` sin
  crecimiento del chunk principal más allá del tamaño de los dos overlays Stormlight (≈150 líneas).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: el mundo `"mixto"` (§13) y cualquier cambio de regla, fórmula, ficha o tirada.

**T24a · Rutas perezosas, `enciclopedia` completo, `OrigenesPage` y `CaminosMetalPage`** — F3 · web · M · T09, T19, T20
- Archivos: crear `src/pages/encyclopedia/mistborn/OrigenesPage.tsx` (3 ascendencias, Bendiciones, árboles kandra/koloss, 15
  culturas por era) y `CaminosMetalPage.tsx` (5 caminos con `Tabs`: principal, qué concede, árbol, meta); `App.tsx` las cuatro
  rutas de §7.2 con `React.lazy` + `<WorldGate feature="origenes">` (orígenes) o `<WorldGate feature="artesMetalicas">` (las
  otras tres; capacidades de `WorldConfig`, nunca ids de mundo) + `Suspense` con `Spinner` (las dos de T24b apuntan a un
  marcador provisional `EmptyState` hasta T24b); `src/worlds/mistborn.topics.tsx` `enciclopedia` completo (7 `TopicDef`, §7.8;
  importa los helpers de `src/components/EncyclopediaEmblems.tsx`). Patrón visual de `RadiantOrdersPage.tsx`/`PotenciasPage.tsx`;
  glifo provisional Lucide hasta T46.
- Cambios: — (descritos por fichero en «Archivos»).
- Textos: «Orígenes», «Caminos de nacido del metal».
- Aceptación: en Mistborn las 7 tarjetas del hub navegan (dos a marcador provisional); en Stormlight las rutas redirigen;
  `npx tsc -b`, `npm run lint`; sin Tailwind ni colores literales; h1→h2→h3.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T24b · `ArtesMetalicasPage` y `PoderMetalPage`** — F3 · web · M · T24a, T16-T18, T22
- Archivos: crear `src/pages/encyclopedia/mistborn/ArtesMetalicasPage.tsx` (`Tabs` Alomancia / Feruquimia / Hemalurgia; tabla
  «Progresión de las artes metálicas» L.163 / PDF 169; cuadrícula de 17 metales con glifo, categoría del arte, era) y
  `PoderMetalPage.tsx` (`/:arte/:metal`: acciones, usos creativos, talentos con `TalentActivation`); sustituir los placeholders de
  T24a en `App.tsx`.
- Cambios: — (descritos por fichero en «Archivos»).
- Textos: «Artes metálicas»; eyebrows «Alomancia» / «Feruquimia» / «Hemalurgia»; tabla «Progresión de las artes metálicas».
- Aceptación: las 7 tarjetas navegan a páginas reales; `npm run build` muestra un chunk separado para `mistborn` y el chunk
  principal no crece respecto a `bundle-referencia.txt` (T16); `npx tsc -b`, `npm run lint`; sin Tailwind ni colores literales;
  h1→h2→h3.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T25 · `HeroicPathsPage` por mundo** — F3 · web · S · T21
- Archivos: `src/pages/encyclopedia/HeroicPathsPage.tsx` (datos `HEROIC_PATHS` o `HEROIC_PATHS_MISTBORN` desde `useWorldData()`;
  subtítulo `:250` con `cfg.planeta`; chip «Era 2» en Inventor y Pistolero).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: Stormlight idéntica; Mistborn muestra Rebelde, Mataneblinos, etc.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T25b · Revisión visual de los datos `[inferido]` de F3 contra las imágenes del manual** — F3 · web · S · T16-T22 (entrada
`<pdfPath>`/`<rendersPath>`, §0; respaldo de §1 «Protocolo», punto 2)
- Entrada: `<pdfPath>` o `<rendersPath>` (§0); sin ninguna de las dos, respaldo determinista de §1 «Protocolo», punto 2 (las
  filas que no se puedan ver en imagen conservan `// [inferido]` y se anotan). Sustituye a la antigua «revisión de Xavi» de Q11 y
  Q18: la hace un agente que **mira las imágenes** (herramienta `Read` sobre los PNG).
- Archivos: `src/data/mistborn/*.ts` creados por T16-T22, **solo** las filas marcadas `// [inferido]` o con `notaLibro`; no se
  tocan `aventurasOverlay.ts` ni `combatOverlay.ts` (los edita T23b en el mismo lote); `src/worlds/mistborn.ts` solo si la
  revisión de Q18 aconseja otro Lucide o tono (nunca iconos caseros; oficial primero, Lucide después).
- Procedimiento: `grep -rn "\[inferido\]\|notaLibro" src/data/mistborn/` → lista de filas con su cita «L.x / PDF y». Para cada
  una, renderizar la página (`dotnet run --project "<herramienta>" -- "<pdfPath>" "<outputDir>" <páginas>`, 96 DPI; si no
  se lee, los renders de `<rendersPath>` o PyMuPDF a 200 DPI en el scratchpad, §1 «Protocolo», punto 2; nunca editar la
  herramienta), mirar la imagen y decidir: si la imagen desmiente el dato, corregirlo; si lo confirma,
  quitar `// [inferido]` y dejar `// verificado en imagen, PDF <n>`; si la imagen no permite resolverlo, conservar la marca con
  el motivo. Lista mínima (§8): disponibilidad de duraluminio/electro para nacido de la bruma y brumosos de oro a finales de la
  Era 1 (nota de L.372 / PDF 378); Revitalizar «8» frente a «acción gratuita»; «Enhaciendo el no ver»; Ráfaga de monedas sin
  «poder»; límite «igual al rango» con 6+ grados; nota del feruquimista con 17 poderes (L.145 / PDF 151); Lupa 200 ar y
  «Militar» = Mercenario se anotan para T40 y T47 (sus ficheros no existen aún). Q18: comparar los tonos y Lucide provisionales
  (eras, ascendencias, caminos, Alomancia/Feruquimia) con la imaginería de las páginas de orígenes (L.31-48 / PDF 37-54) y
  caminos (L.127-159 / PDF 133-165); como el libro no trae iconos de caminos ni de ascendencias (§13), se mantienen los Lucide
  salvo que exista un glifo oficial extraíble, que se anota para T45.
- Aceptación: `grep -rn "\[inferido\]" src/data/mistborn/` solo devuelve filas que la imagen no permite resolver, cada una con el
  motivo en el comentario; cada corrección cita «L.x / PDF y»; los criterios de aceptación de T16-T22 (conteos, parejas, eras)
  siguen cumpliéndose; `npx tsc -b`, `npm run lint`; informe para la bitácora con la tabla fila → página → veredicto.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: rejillas de talentos (T38b), glifos (T45), catálogo (T40) y equipo inicial (T47).

### F4 — Ficha de Nacidos de la Bruma

**T26 · `HABILIDADES_COSMERE` en `skills.ts` y consumidores Mistborn** — F4 · web · M · T01, T06b
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que T32b-1 o T38-1, §1
  «Protocolo», punto 3): `src/worlds/skills.ts` (creado en T06b con las tres tablas de legado Stormlight): añadir
  `HABILIDADES_COSMERE` (nombres y atribuciones del libro, idénticos en los dos manuales: Armamento ligero/pesado, Saber,
  Atletismo FUE, Intimidación VOL; hoja L.402 / PDF 408 y `ch3_chars.txt`, §7.1); `src/worlds/mistborn.ts`
  (`habilidades: HABILIDADES_COSMERE` en lugar del provisional de T06b; sin `habilidadesTirador` ni `habilidadesPnj`);
  consumidores: `CharacterDetailPage.tsx` `SECTIONS` (`:385-431`; lee `useWorldConfig().habilidades`: en Stormlight es la tabla de
  legado, idéntica a la actual) y `GlobalNpcDetailPage.tsx:17-54` (lee `cfg.habilidadesPnj ?? cfg.habilidades`: en Stormlight, la
  tabla de legado del PNJ, idéntica a la local de hoy; en Mistborn, `HABILIDADES_COSMERE`). **Ningún componente compara ids de
  mundo** (P4, §7.1). El tirador (`DiceRoller.tsx:25-55`) se toca en T43.
- Cambios: — (descritos por fichero en «Archivos»).
- Por qué no una tabla única: las tres tablas Stormlight actuales difieren entre sí en etiquetas y atribución (§7.1 `skills.ts`;
  auditoría 2026-10-03 puntos 5 y 8) y unificarlas cambiaría el modificador de tirada de la campaña en curso (P1). La unificación
  Stormlight (incluida la atribución Atletismo/Intimidación del tirador) es **T50, nunca T26** (Q3).
- Aceptación: en Stormlight, capturas antes/después de ficha, tirador y PNJ idénticas; en Mistborn, ficha y PNJ muestran las
  etiquetas y atribuciones del libro; `grep -rnE "===\s*'(mistborn|stormlight)'" src/pages src/components` no devuelve ninguna
  línea nueva; `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T27 · Identidad de la ficha: ascendencias por era, `CaminoMetalPicker`, Bendiciones** — F4 · web · M · T01, T15, T19, T20, T26
- Archivos: `src/pages/characters/CharacterDetailPage.tsx` (anclas `ASCENDENCIAS` → `cfg.ascendencias` filtradas por
  `isAvailable(era)` (conservan `tone` e `icono`, §7.1); `isCantor` solo con `features.formasCantor`; `fbOf` lee
  `char.bonosAtributos` (los seis atributos) cuando `features.bonosServidor` es `true` (§7.4); tercera `IdentityItem` con
  `cfg.caminoInvestido.label`
  cuyo `onPick = !editing && isGm ? () => setPicker('caminoMetal') : undefined` (regla 5 de §7.4: solo el director, **fuera de
  edición**, Q6; los de `:728`/`:738` siguen igual); pickers de §7.4; los componentes de
  `src/components/mistborn/*` se cargan con `React.lazy` desde `src/components/mistborn/index.ts`, regla 4 de §7.4); crear
  `src/components/mistborn/index.ts`, `CaminoMetalPicker.tsx` (5 caminos filtrados por era y por `ascendenciasPermitidas` con
  descripción «Los caminos de nacido del metal son excluyentes; el director puede asignarlo en cualquier nivel: el personaje toma
  su talento principal»,
  L.127-128 / PDF 133-134; deshabilitado para Kandra; `Segmented` «Camino inicial» cuando ya hay camino heroico, §7.4 paso 2) y
  `BendicionPicker.tsx` (`Sheet`, 5 opciones distintas, máx. 2, escribe `bendiciones`; para un jugador no GM queda deshabilitado
  si ya hay una Bendición guardada, Q16). El picker de camino **solo** escribe `caminoMetal` y `caminoInicial` en esta tarea; el
  flujo completo llega en T28. Importa `caminosNacidosDelMetal.ts` y `origenes.ts` por fichero (§8).
- Cambios: — (descritos por fichero en «Archivos»).
- Libro: L.17-19 / PDF 23-25; L.32-39 / PDF 38-45; L.372 / PDF 378.
- Aceptación: un jugador no GM no ve el botón del picker de camino de nacido del metal en ninguna ascendencia (Q6); el director
  lo ve y en Kandra aparece deshabilitado; Kandra sí ve el de Bendición; Sangre koloss no aparece en Era 1 ni
  puede elegir nacido de la bruma o feruquimista; elegir Bendición «Consciencia» guarda `bendiciones:["consciencia"]` y el
  servidor devuelve la línea «Bendición de la Consciencia» en Defensa espiritual y `bonosAtributos.discernimiento = 2`, que la
  ficha suma al total de Discernimiento; un jugador con una Bendición guardada ve el picker deshabilitado; en Stormlight la
  ascendencia conserva su tono (`cuarzo`/`amatista`) y sus iconos, sin cambios en captura; `npm run build`: el chunk principal no
  supera `bundle-referencia.txt` + 40 KB y existe un chunk `mistborn-*.js` separado.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T28 · `MetalPicker` y flujo «al elegir camino» (habilidades, poderes, metas)** — F4 · web · L · T27
- Archivos a crear: `src/components/mistborn/MetalPicker.tsx` (§7.5; props `{ open; onClose; arte: 'alomancia' | 'feruquimia' |
  'ambas'; modo: CaminoNacidoDelMetal['seleccionMeta']; era; caminoMetal; yaElegidos: string[]; onConfirm(poderes:
  PoderPersonaje[], paraMeta: string[]) }`).
- Archivos a tocar: `CharacterDetailPage.tsx` (los 6 pasos de §7.4 «Al elegir camino…» en una `useMutation` optimista
  `aplicarCaminoMetal(camino, seleccion)` que **solo se ejecuta fuera de edición** (`editing === false`), se declara **antes del
  retorno temprano** `if (isLoading || !char)` (`:494`, ancla por texto, regla 2 de §7.4) y parte de
  `qc.getQueryData<Character>(['character', cId, chId, false]) ?? char`, nunca de `form`; actualización optimista **por prefijo**
  `['character', cId, chId]` (§2) y `onSettled` que invalida también `['metas', cId, charId]`; limpieza inversa
  `quitarCaminoMetal()` con `ConfirmDialog` (`confirmLabel="Quitar camino"`, `tone="danger"`, `icon` explícito, §7.4) que además
  reinicia `caminoInicial` (`'heroico'` si hay camino heroico, `''` si no), misma técnica). `MetalPicker` se carga con
  `React.lazy` desde `src/components/mistborn/index.ts` (regla 4 de §7.4).
- Cambios: — (descritos por fichero en «Archivos»).
- Datos: `CAMINOS_NACIDOS_DEL_METAL` (T19, importado por fichero) para `habilidadInicial` (puede ser `null`),
  `habilidadesInvestidas`, `poderes`, `seleccionMeta`, `metasIniciales`; `METALES` y `METALES_POR_CAMINO_Y_ERA` (T16) y
  `PODERES_ALOMANTICOS`/`PODERES_FERUQUIMICOS` (T17/T18, vía `useWorldData().poderes`, nunca import estático) para `caminos` de
  cada metal (§7.5); `ATRIBUTO_SLOTS` (`CharacterDetailPage.tsx:374-376`) para los huecos cognitivos `[2, 5]`;
  `metasApi.create`/`metasApi.delete` (`src/api/metas.ts:11,20`, **sin cambios**) para crear las metas iniciales y deshacerlas si
  el `update` falla.
- Reglas: §7.4, §7.5; L.135 / PDF 141 (grado gratuito adicional si inicial, solo brumoso); L.141 / PDF 147 y L.145 / PDF 151
  (nacido de la bruma y feruquimista sin habilidad inicial); L.141 / PDF 147 (pareja Empujón/Tirón); L.146 / PDF 152 (puro +
  aleación o atium); L.155 / PDF 161 (nacidoble, ambas metas); L.177 / PDF 183 (atium completo); L.135 / PDF 141 (sin meta si el
  poder es atium); L.19 / PDF 25 (Disciplina del nacidoble); L.372 / PDF 378 (metales por camino y era).
- Aceptación: «Brumoso» + «Acero» en Era 2 con camino heroico guerrero y `Segmented` en «Camino heroico» guarda
  `caminoMetal:"brumoso"`, `caminoInicial:"heroico"`,
  `poderes:[{"arte":"alomancia","metal":"acero","origen":"camino","completo":false,"metaId":N,…}]`,
  `habilidadPersonalizada2 = "Alomancia"` / `VOL` / 1 (hueco 2; si está ocupado, el 5), «Ruptura de brumoso» en `talentos` y una
  meta «Entrenar tu poder» activa que aparece en Metas sin esperar (invalidación de `['metas', cId, charId]`); el mismo caso con
  el `Segmented` en «Camino de nacido del metal» guarda `caminoInicial:"metal"`, Alomancia 2 y «Ruptura de brumoso» **no** está en
  `talentos`; sin camino heroico, `caminoInicial:"metal"` sin preguntar, Alomancia 2 y «Ruptura de brumoso» no está en `talentos`;
  «Nacido de la bruma» o «Feruquimista» como camino inicial: Alomancia/Feruquimia vale **1**, sin grado gratuito; «Nacidoble»
  inicial: Alomancia 1 y Feruquimia 1 en los huecos 2 y 5 **y `disciplina` sube 1**; «Brumoso» en Era 1 no ofrece oro en el
  `MetalPicker`; «Brumoso» + «Aluminio» en Era 2 sí se ofrece (sin árbol, elegible); «Brumoso» + «Atium» no crea meta y el poder
  nace `completo:true`; «Nacido de la bruma» en Era 1 crea los poderes alománticos de la era (con oro) y pide la pareja (el oro se
  ofrece como elección individual, §7.5); meta titulada «Entrenar tus poderes»; «Nacidoble» crea un poder por arte y crea dos
  metas; el picker solo se abre al director (un jugador no GM no ve el botón, Q6) y **no** se abre en edición (`onPick` ausente);
  si se pulsa Guardar en
  edición no se dispara nada del flujo; la UI se actualiza al instante también con `?enCombate=true` (prefijo de caché); quitar el
  camino pide `ConfirmDialog` y conserva poderes con `origen !== 'camino'`; `npm run build`: chunk principal ≤
  `bundle-referencia.txt` + 40 KB.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T29 · Estadísticas por mundo: Investidura actual, inicio de escena, bonos, puntos y topes de atributo;
`Stepper.disabled/decimals`** — F4 · web · M · T27
- Archivos: `src/components/ui.tsx:768-804` (**primero**: `Stepper` gana `disabled?: boolean` (los dos botones
  `disabled = disabled || …`; `<output aria-disabled>`) y `decimals?: number` (redondea `Number((value ± step).toFixed(decimals))`
  antes de `onChange` y en el cálculo de `disabled`); T30 y T32a dependen de ello); `CharacterDetailPage.tsx` (anclas: el literal
  `'Solo disponible para Radiantes'` (`:831`) → `cfg.textos.sinInvestidura`; `esRadiante = !!f.caminoRadiante` (`:777`) → `const
  tieneInv = cfg.features.caminoRadiante ? !!f.caminoRadiante : (inv.total > 0)` usado en `:777`, `:827-831` y la previsualización
  (**no** sustituir por `inv.total > 0` a secas: en Stormlight el GM elige la Orden en el `form` y la tarjeta debe encenderse al
  instante, regresión de P1); `esLineaBase` (`:346-348`) pasa a
  `l.concepto === 'Base' || l.esBono || ATRIBUTO_RE.test(l.concepto)` y la comprobación de `:797` a `l.esBono` (regla 3 de §7.4;
  sin expresiones regulares sobre el texto del concepto);
  `Stepper` de Investidura actual sobre `recursos.investiduraActual` con una `useMutation` optimista sobre
  `charactersApi.patchRecursos` declarada antes del retorno temprano `if (isLoading || !char)` (`:494`; patrón `talentosMutation`,
  `TalentosDetailPage.tsx:176-208`, pero **por prefijo** `['character', cId, chId]` con `getQueriesData`/`setQueriesData`, §2),
  máximo `investidura.total`, **`disabled` mientras `editing`**; botón «Inicio de escena» con `Segmented` normal/Sorprendido →
  `inicioEscena`; `getPuntosAtributoEsperados` con `puntosAtributoBase` y aviso de creación `<= 3` (`<= 4` FUE koloss); `max`
  dinámico `ascendencia.topeAtributo?.[attr] ?? 5`; `esInvestida` en huecos personalizados (`[2, 5]`); previsualizaciones en
  edición de salud (`fbFuerza`, `:533`), concentración (`concFb`, `:769`) e Investidura (`:786`) suman los seis atributos de
  `bonosAtributos` cuando `features.bonosServidor` es `true` (desvío y concentración de la forma siguen saliendo de `formaBonus`,
  §7.4); icono de Investidura desde `useWorldConfig().iconos.investidura` en lugar de
  `StatIcons.investidura` (`:827`)).
- Cambios: — (descritos por fichero en «Archivos»).
- Libro: L.20 / PDF 26; L.26-27 / PDF 32-33; L.34 / PDF 40; L.38 / PDF 44; L.57 / PDF 63; L.129 / PDF 135.
- Aceptación: kandra ve «6 puntos»; koloss puede poner FUE 6; kandra con Bendición de la Potencia y nivel 1 ve la salud prevista
  en edición con FUE +1 **y exactamente igual que la guardada** (sin doble conteo: la línea «Bendición de la Potencia» no se suma
  otra vez); tres toques rápidos en el `Stepper` suman 3 (sin perder incrementos) y no superan el máximo, también con
  `?enCombate=true`; el valor persiste en servidor (visible desde otro dispositivo y para el GM); en edición el `Stepper` está
  deshabilitado; «Inicio de escena · Sorprendido» deja 1; en Stormlight, al elegir una Orden en edición la tarjeta de Investidura
  se enciende y previsualiza como hoy; `Stepper` sin las props nuevas se comporta igual (`DiceRoller`, Bolsa Stormlight);
  Stormlight sin cambios en captura; `npm run build`: chunk principal ≤ `bundle-referencia.txt` + 40 KB.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T30 · Pestaña «Artes metálicas»: cabecera, `PoderCard`, cargas y viales** — F4 · web · L · T29, T17, T18, T38-1
(`talentSummaries.ts`)
- Archivos a crear: `src/components/mistborn/ArtesMetalicasTab.tsx` (props
  `{ character; isGm; editing; onPatch(body: RecursosPatch) }`), `PoderCard.tsx` (props `{ poder; def: PoderDef; cargasMax?:
  number; talentosAprendidos: string[]; disabled; onPatch }`; `PoderDef = PoderAlomantico | PoderFeruquimico`, §2).
- Archivos a tocar: `CharacterDetailPage.tsx` (pestaña condicional en la lista de `Tabs`, ancla `caracteristicas`; reutiliza la
  `useMutation` optimista por prefijo de `patchRecursos` creada en T29; `ArtesMetalicasTab` con `React.lazy` desde
  `src/components/mistborn/index.ts`).
- Contenido: §7.6 salvo `BeberVialSheet` (T31). Cargas, viales, cuentas de atium, `completo` y `ajusteCargasMax` escriben con
  `patchRecursos` (un `Stepper` → una petición, actualización optimista por prefijo `['character', cId, chId]`, §2; los `Stepper`
  reciben `disabled={editing}`, prop de T29). Poder feruquímico **naciente**: `Stepper` de cargas `disabled` con el texto «Fabrica
  tu mente de metal para almacenar cargas» (`cargasMax` 0, L.162 / PDF 168). Poder `origen: 'medallon'`: el jugador solo decrece
  (máximo fijo 8, L.293 / PDF 299); el GM ve el `Stepper` completo 0..8 y un botón «Medallón nuevo» que fija 8 («Canjear por un
  medallón nuevo»). Poder del camino con Componedor aprendido: botón «Usar Componedor (−1 máx.)» con `ConfirmDialog`
  (`confirmLabel="Usar Componedor"`, `tone="brand"`, `icon` explícito; los valores por defecto son «Eliminar» y peligro,
  `ui.tsx:990-1015`) → `patchRecursos({ poderes: [{ arte, metal, ajusteCargasMax: actual − 1 }] })` (L.155 / PDF 161). Botón
  «Añadir poder» (solo GM) abre `MetalPicker` con `origen` seleccionable (`clavo`, `lerasium`, `medallon`; el picker solo ofrece
  combinaciones válidas de §5.3: `lerasium` → alomancia sin atium, `medallon` → feruquimia sin atium ni nicrosil), crea el poder
  con `completo: true` y sin `metaId` (§5.3; el servidor lo normaliza igualmente) y envía un `charactersApi.update` con la lista
  ampliada partiendo del personaje cacheado `['character', cId, chId, false]` (los existentes conservan
  `completo/cargas/ajusteCargasMax/viales/desprovisto` en servidor, §5.1). **Si `origen` es `clavo` o `lerasium` y no existe el
  hueco de la habilidad Investida** (`Alomancia` VOL / `Feruquimia` INT), la UI lo crea con valor 0 en el primer hueco cognitivo
  libre de `[2, 5]` en ese mismo `update` (el clavo y la aleación dan la habilidad correspondiente, L.290 / PDF 296; L.295 / PDF
  301); con `medallon` no se crea (L.293 / PDF 299). Subtítulo de `PoderCard` para el atium: «Divino» (sin Externo/Interno ni
  Empujón/Tirón, §7.6). `<Badge tone="topacio">Desprovisto</Badge>` (cadena, no `tone.topacio`).
- Datos: `derivadosSet` del servidor para la cabecera y `cargasMax`; `PODERES_*` (`useWorldData().poderes`, nunca import
  estático) para efecto, acciones y árbol; `METALES[].categoriaAlomancia`/`categoriaFeruquimia` (import por fichero) para el
  subtítulo; `TALENT_SUMMARIES_MISTBORN` (T38-1, vía `useWorldData()` cuando T34a lo conecte; hasta entonces import perezoso
  propio) para los talentos aprendidos.
- Libro: hoja L.404 / PDF 410; L.129-131 / PDF 135-137; L.163 / PDF 169; L.310 / PDF 316; L.162 / PDF 168; L.293 / PDF 299.
- Aceptación: MOD./LÍMITE/DADO/ALCANCE coinciden con `derivadosSet`; el `Stepper` de cargas no supera `poder.<metal>.cargasMax` y
  tres toques rápidos suman 3 (también con `?enCombate=true`); un poder feruquímico naciente muestra el `Stepper` deshabilitado y
  el texto de la mente de metal; marcar «completada» pone `completo:true`, habilita el `Stepper` de cargas y desbloquea el árbol
  en talentos (tras T36); «Añadir poder» con `origen: 'clavo'` crea el poder ya `completo:true`; un medallón recién concedido
  muestra 8 cargas y el jugador solo puede bajarlas; «Usar Componedor» baja `cargasMax` en 1 tras confirmar; lista sin tope con 10
  poderes sin desbordamiento a 360 px; `Badge` «Desprovisto» visible cuando `desprovisto:true`; subtítulo «Físico – Externo –
  Empujón» en Alomancia de acero; `npm run build`: chunk principal ≤ `bundle-referencia.txt` + 40 KB y chunk `mistborn-*.js`
  separado.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T31 · `BeberVialSheet`** — F4 · web · S · T30
- Archivos: crear `src/components/mistborn/BeberVialSheet.tsx` (§7.6); editar `src/components/mistborn/index.ts` (export) y
  `CharacterDetailPage.tsx` (botón «Beber vial» junto a «Inicio de escena» en la tarjeta de Investidura de T29, `React.lazy` +
  `Suspense` desde el barrel (regla 4 de §7.4), visible solo si `poderes.some(p => p.arte === 'alomancia')`;
  `charactersApi.beberVial` con la misma `useMutation` optimista por prefijo de T29). T37b añade después el enlace desde
  `MyTalents`. Nadie más tiene asignado ese botón.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: el botón «Beber vial» aparece en la tarjeta de Investidura de un brumoso y **no** en un feruquimista puro; beber un
  vial con los comunes en un brumoso con acero y oro deja Desprovisto [Oro], quita Desprovisto [Acero] y restaura la Investidura
  al máximo (todo desde el servidor); el atium **no aparece** en la lista (sus cuentas van aparte, L.176 / PDF 182); los comunes
  aparecen preseleccionados **pero el director puede desmarcarlos** (Q17; L.267 / PDF 273) y, si desmarca todos los que el
  personaje quema, el aviso dice «El vial no contiene ningún metal que puedas quemar: no recuperas Investidura»; raros con
  `viales = 0` aparecen deshabilitados con texto «Sin viales» pero el GM puede forzarlos.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T32a · Bolsa: arquillas, capacidad, moneda** — F4 · web · M · T15, T06b, T29 (`Stepper.decimals`), T32b-1 y T32b-2 (editan las
mismas líneas de `BolsaPage.tsx`, `PersonajesPage.tsx` y `BolsaDetailPage.tsx`; se ejecuta después, no en paralelo)
- Archivos: `src/pages/personajes/BolsaDetailPage.tsx:32-33, 233-241, 332-429, 785` (§7.8; `Stepper step={0.01} decimals={2}` de
  arquillas sobre `patchRecursos`, mutación optimista sobre `['character', cId, charId]` (la Bolsa usa la clave de tres elementos,
  `:150`); `getCapacity` (`:233-240`) lee `cfg.tablas.cargaKg` y la tarjeta de capacidad añade «Levantar hasta N kg» con
  `cfg.tablas.levantamientoKg[tramo]` solo cuando la tabla existe (Mistborn); enlace «Cargas en Artes metálicas →» bajo «Equipo»
  si hay poderes feruquímicos; el filtro de viales del picker de «Equipo» es de T41, cuando `GearItem.category` ya existe,
  Q21); `BolsaPage.tsx:19-27, 93-103` («N
  arquilla(s)»); `PersonajesPage.tsx:173, 201-211` (imagen y subtítulo «Inventario, arquillas y equipo»).
- Cambios: — (descritos por fichero en «Archivos»).
- Libro: L.254 / PDF 260; L.50 / PDF 56; L.131 / PDF 137.
- Aceptación: Stormlight sigue mostrando Marcos y `mc`; Mistborn muestra «Arquillas» con 2 decimales y diez pulsaciones de +0,01
  desde 0,1 dan exactamente 0,2 en servidor; capacidad 125 kg con FUE 3; un personaje con poderes feruquímicos ve el enlace
  «Cargas en Artes
  metálicas →» bajo «Equipo» (Q23).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T32b-1 · `CharacterIdentityPills` y sustitución en las listas y los hubs (`MetasPage`, `TalentosPage`, `BolsaPage`,
`CharacterListPage`, `PersonajesPage`)** — F4 · web · S · T15, T06b
- Archivos (6): crear `src/components/CharacterIdentityPills.tsx` (ascendencia · camino heroico · camino Investido del mundo, con
  `cfg.caminoInvestido` y `cfg.iconos.caminoInvestido(id, size)`, que en Stormlight devuelve `RadiantOrderIcon`, §7.1) y sustituir
  los duplicados de `MetasPage.tsx:24-26`, `TalentosPage.tsx:23-24`, `BolsaPage.tsx:24-25`, `CharacterListPage.tsx:133-148` y **el
  hero del jugador en `PersonajesPage.tsx:15-16, 170, 250-261`** (`RADIANT_ORDERS.find(...)` + `RadiantOrderIcon`: sin esto el
  jugador de Mistborn nunca vería su camino de nacido del metal en su pantalla principal).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: Stormlight idéntico en captura en las 5 superficies (las pills siguen mostrando `RadiantOrderIcon`, el SVG oficial,
  no un Lucide); en Mistborn el hero del jugador y las pills muestran el camino de nacido del metal y ninguna orden; `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T32b-2 · `CharacterIdentityPills` en las páginas de detalle (`MetasDetailPage`, `BolsaDetailPage`, `TalentosDetailPage`)** — F4
· web · S · T32b-1
- Archivos (3): `MetasDetailPage.tsx:348`, `BolsaDetailPage.tsx:313-328` y **el hero de
  `TalentosDetailPage.tsx:298-299, 343-358`** (`RADIANT_ORDERS.find` y pill con `RadiantOrderIcon`; conservar los pills de
  `extraPaths`).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: Stormlight idéntico en captura en las 3 superficies; en Mistborn la pantalla de Talentos y los detalles muestran el
  camino de nacido del metal y ninguna orden; `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T33 · Metas de nacido del metal en la UI (+ «Nueva meta de nacido del metal» para el GM)** — F4 · web · S · T28, T14, T30 (crea
`ArtesMetalicasTab.tsx`; sin T30 cerrado, el fichero no existe)
- Archivos: `MetasDetailPage.tsx:82-110` (`MetaCard`: prop nueva `poderes: PoderPersonaje[]` pasada desde `character.poderes` de
  la página (`:318`); `Badge` «Meta de nacido del metal» si `poderes.some(p => p.metaId === meta.id)`; `concludeMutation` y
  `deleteMutation` (`:101-110`, hoy solo invalidan `['metas', …]`) invalidan además `['character', campaignId, characterId]` y
  `['characters', campaignId]` (T14 también cambia `poderes` al borrar una meta); al concluir con **cualquier** tipo (Q20), si el
  poder pasó a completo (comparando `poderes` antes/después), mostrar bajo la meta un aviso inline `role="status"` con
  `<Badge tone="esmeralda">Poder completo: Alomancia de acero</Badge>`; no existe `toast` en el repo, §7.8);
  `src/components/mistborn/ArtesMetalicasTab.tsx` (subtarea: acción «Nueva meta de nacido del metal», solo GM y solo si ya hay una
  meta concluida del camino, que abre `MetalPicker` en modo `pareja` / `puro-aleacion-o-atium` sobre los poderes nacientes sin
  `metaId`, crea la `Meta` con el título del camino con `metasApi.create` y envía un `charactersApi.update` que fija `metaId` en
  esos poderes; L.141 / PDF 147; L.146 / PDF 152, §7.5). Libro: L.132-133 / PDF 138-139; L.283-284 / PDF 289-290.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: flujo completo con T14 para `exito`, `crecimiento` y `fracaso`; un nacido de la bruma con la primera meta concluida
  puede recibir del GM una segunda meta «Entrenar tus poderes» enlazada a otra pareja y los demás poderes no cambian; Stormlight
  sin cambios.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T38-1 · Resúmenes de talentos MB y rejillas de caminos, especialidades y ascendencias** — F4 · web · M · T17-T21 (entrada
`<pdfPath>`/`<rendersPath>`, §0; respaldo de §1 «Protocolo», punto 2)
- Archivos (tarea web; en su worktree de tarea, porque corre a la vez que T26 y T32b-1, §1 «Protocolo», punto 3): crear
  `src/data/mistborn/talentGrids.ts` (`TALENT_GRIDS_MISTBORN` con las claves `caminoInvestido:<camino>` (5),
  `heroico:<camino>:<Especialidad>` de las 8 especialidades nuevas y `ascendencia:kandra` y `ascendencia:sangre-koloss`; las 32 de
  poderes llegan en T38-2) y `talentSummaries.ts` (`TALENT_SUMMARIES_MISTBORN`, una frase por talento MB, ≈210, incluidos los de
  los poderes); conectarlos en `src/worlds/mistborn.data.ts` y exportarlos desde `src/data/mistborn/index.ts` (ficheros punto de
  encuentro: añadir líneas). El tipo `TalentGrid` se importa de `../talentGrids` (`src/data/talentGrids.ts:43-53`; T34a lo mueve a
  `src/lib/talentTypes.ts` y `talentGrids.ts` lo reexporta, así que el import sigue valiendo).
- Calendario: lote 1 de F4, **antes de T30** (que consume `talentSummaries.ts`) y de T34a (que compone `MISTBORN_TALENTOS` con
  estas rejillas).
- Cambios: rejillas y resúmenes transcritos de las páginas de cada diagrama (caminos, L.127-159 / PDF 133-165; especialidades del
  cap. 4, L.73-126 / PDF 79-132; árboles kandra y sangre koloss, L.35-39 / PDF 41-45) con
  `dotnet run --project "<herramienta>" -- "<pdfPath>" "<outputDir>" <páginas>` (procedimiento de
  `src/data/talentGrids.ts:25-30`); a 96 DPI fijos (`Program.cs:31`) una rejilla densa puede no leerse: entonces, esa página a 200
  DPI con PyMuPDF en el scratchpad (§1 «Protocolo», punto 2); nunca editar la herramienta. Sin `<pdfPath>`, respaldo determinista
  (§1 «Protocolo», punto 2). Los resúmenes salen de la línea de cada talento en su diagrama; prerrequisitos y textos completos ya
  están en T17-T21.
- Aceptación: un script de comprobación (`npx --yes tsx <script>` desde el worktree) verifica que cada `cells[].name` de las 15
  rejillas existe en su árbol (`CAMINOS_NACIDOS_DEL_METAL`, `HEROIC_PATHS_MISTBORN`, `ARBOL_KANDRA`, `ARBOL_SANGRE_KOLOSS`) y que
  todo talento de esos árboles, salvo el principal de cada camino, tiene celda; `TALENT_SUMMARIES_MISTBORN` tiene una entrada por
  cada nombre distinto de T17-T21; sin rejilla, el mapa cae al orden de lectura sin romper (`talentMap.ts:102-104`); `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: las 32 rejillas de poderes (T38-2) y la revisión visual (T38b).

### F5 — Talentos de Nacidos de la Bruma

**T34a · `talentRules.ts`, `talentTypes.ts` y `talentGraph.ts` parametrizado sin cambio de comportamiento** — F5 · web · L · T15,
T17-T21, T38-1
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que T38-2, §1 «Protocolo»,
  punto 3): crear `src/lib/talentTypes.ts` (mueve **tal cual** `Talento` de `src/data/potencias.ts:3-10` y `TalentGrid` con
  `TalentGridCell` de `src/data/talentGrids.ts:34-53`, con
  `import type { ActivationType } from '../components/TalentActivation'`); `src/data/potencias.ts` (borra la interfaz movida y
  añade `import type { Talento } from '../lib/talentTypes'`, que usa `Potencia.talentos`, y
  `export type { Talento } from '../lib/talentTypes'`); `src/data/talentGrids.ts` (ídem:
  `import type { TalentGrid } from '../lib/talentTypes'` y `export type { TalentGrid, TalentGridCell } from '../lib/talentTypes'`;
  los importadores actuales de `Talento`, `src/data/radiantOrders.ts:1`, `src/pages/encyclopedia/PotenciasPage.tsx:4` y
  `RadiantOrdersPage.tsx:5`, no cambian); crear `src/lib/talentRules.ts` (§7.7: `TalentRules`; `STORMLIGHT_TALENTOS` con los datos
  actuales por referencia (`HEROIC_PATHS`, `RADIANT_ORDERS`, `POTENCIAS`, `ARBOL_CANTOR`, `TALENT_GRIDS`, `TALENT_SUMMARIES`),
  `bonosCuentanParaRequisitos: false`, `campoCaminoInvestido: 'caminoRadiante'` e `ignorarClausulas: []`; sustituye el `unknown`
  de `TalentRules` en `src/worlds/types.ts`); `src/worlds/stormlight.data.ts` y `mistborn.data.ts` completan **solo**
  `WorldData.talentos` (el resto ya está desde F3; en Stormlight también en `syncData`, que es el mismo objeto `DATA`):
  `MISTBORN_TALENTOS` se compone en `mistborn.data.ts` con `grids`/`summaries` según la regla de §8 (las 10 especialidades
  heroicas reutilizadas conservan su rejilla Stormlight), `bonosCuentanParaRequisitos: true` (L.28 / PDF 34) y
  `campoCaminoInvestido: 'caminoMetal'`; `src/lib/talentGraph.ts:42-45, 160-202, 278, 411, 1125, 1166` (parámetro opcional con
  default Stormlight; discriminador `'ordenes' in p` para `Potencia` frente a `PoderDef`; el grafo expone `graph.rules`; ninguna
  comparación de ids de mundo en `src/lib/`).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: para los cinco personajes de T02 (`"$TEMP/cosmere-regresion/antes-<id>.json"`, que son `Character` de la API),
  un script temporal (`npx --yes tsx <script>` desde el worktree de la tarea; `tsx` no está instalado, se descarga al vuelo, no
  añadirlo a `package.json`) serializa `const snap = (ch: Character, g: TalentGraph) =>
  JSON.stringify({ trees: g.trees.map(t => ({ id: t.id, kind: t.kind, nodeIds: t.nodeIds, keyNodeId: t.keyNodeId, status: t.status
  })), nodes: g.nodes.map(n => ({ id: n.id, prereqText: n.prereqText, clauses: n.clauses, parentGroups: n.parentGroups, childIds:
  n.childIds, isKey: n.isKey, autoGranted: n.autoGranted })), autoGranted: g.autoGranted, evalNodes: [...evaluate(g,
  talentStateFromCharacter(ch)).nodes.entries()], budget: talentBudget(ch, g) })` (campos reales de `TalentTree`
  `talentGraph.ts:308-326`, `TalentNode` `:340-365`, `TalentGraph` `:367-379`, `evaluate` `:834`, `talentStateFromCharacter`
  `:593`, `talentBudget` `:1166`; **los `Map` se pasan a array antes de `JSON.stringify`**, que con un `Map` directo da `"{}"` y
  la comparación pasaría siempre) y el texto es idéntico antes y después del cambio;
  `grep -rnE "rules\.id\s*===|world\s*===" src/lib` no devuelve nada; `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T34b · Consumidores de `useWorldData().talentos` (`TalentosDetailPage`, `TalentosPage`)** — F5 · web · S · T34a
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que T35):
  `TalentosDetailPage.tsx` (`:120` y `:136`: `buildTalentGraph(…, rules)` con `rules = useWorldData().talentos`; `:123`:
  `talentStateFromCharacter(character, { confirmedStory }, graph.rules)`, único llamador, §7.7 #1; `:125` y `:231`: `talentBudget`
  con el grafo, sin cambio de firma) y `TalentosPage.tsx:28-29` (`buildTalentGraph(graphOptionsFromCharacter(character), rules)`);
  ambas muestran `Spinner` mientras `isPending` (solo ocurre en Mistborn: en Stormlight `initialData` lo deja resuelto, §7.1).
  `MyTalents.tsx` **no** se toca aquí: no llama a `buildTalentGraph` ni a `talentStateFromCharacter` (recibe `graph` y
  `evaluation` ya calculados, `MyTalents.tsx:328-335`); su adaptación es de T37b.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: Stormlight idéntico en captura y sin ningún `Spinner` nuevo en el primer render; en Mistborn el grafo se construye
  con `MISTBORN_TALENTOS`; `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: `MyTalents` (T37b) y `graphOptionsFromCharacter` con `rules` (T36).

**T35 · Gramática de prerrequisitos ampliada** — F5 · web · M · T03, T34a
- Archivos: `talentGraph.ts` `PrereqClause` (`:212`), `parseClause` (`:232-272`), `Gate` (`:622`), `gateFor` (`:693-735`),
  `TalentState` (`:577`: `atributos?`, `poderes?: readonly PoderPersonaje[]`), `talentStateFromCharacter` (`:593`: firma
  `talentStateFromCharacter(ch: Character, extra: { confirmedStory?: readonly string[] } = {}, rules: TalentRules =
  STORMLIGHT_TALENTOS)`, §7.7 #1;
  `atributos[attr] = ch[attr] + (rules.bonosCuentanParaRequisitos ? (ch.bonosAtributos?.[attr] ?? 0) : 0)`: el flag lo rellena
  cada mundo en su `TalentRules` (T34a), sin ninguna comparación de ids de mundo en `src/lib/`; los llamadores con grafo pasan
  `graph.rules`; la llamada sin tercer argumento sigue siendo Stormlight; L.28 /
  PDF 34), `SKILL_NAME_MAP` (`:73-81`), `rules.ignorarClausulas` (§7.7 #2: filtrado **antes** de `parseClause`;
  `ignorarClausulas = []` en Stormlight). **No se toca `TalentSheet.tsx`**: las cláusulas `unknown` siguen bloqueando (`:734`) y
  ya se pintan con `g.label`/`g.text` (`TalentSheet.tsx:35, 45`).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: los 5 textos de T03 producen cláusulas `met`/`unmet` correctas y ninguna `unknown`; «no tener ningún otro talento de
  ruptura o herencia» no genera gate en Mistborn y sí `unknown` en Stormlight (donde nunca aparece); tabla de pruebas por tipo
  (`poder`, `skillAny`, `atributo`, `ancestry[]`, `poderes`); kandra con VOL base 2 y Bendición de la Estabilidad
  (`bonosAtributos.voluntad = 2`) cumple «Voluntad 4 o más» (Últimas reservas); en Stormlight `atributos` = valor base; ningún
  prerrequisito de `heroicPaths.ts`, `potencias.ts`, `radiantOrders.ts`, `cantores.ts` cambia de cláusula (comparación con el
  `snap` de T34a).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T36 · Tipos de árbol y hueco nuevos; bloque del camino de nacido del metal y ascendencias** — F5 · web · L · T35
- Archivos: `talentGraph.ts:297-306, 443-510, 563-573, 1081-1086, 1125-1159` (§7.7 #3, incluidos el bloqueo `meta` de los nodos no
  principales de `caminoInvestido:<camino>`, la identidad `(árbol, nombre)` con «elegido en todos los árboles» por nombre y el
  **calendario de huecos de ascendencia por mundo** de §7.7 #3: `talentSlotsAt` lee `rules.arbolesAscendencia[id]` (`autoGranted`,
  `hitos`, `acepta`) en Mistborn y conserva intacta la rama `cantor`/humano actual para Stormlight; un hueco de nivel 1
  `accepts: ['ascendencia']` por cada `autoGranted` de kandra/sangre koloss, sin hueco heroico de nivel 1 para ellos; `slotKindOf`
  devuelve `'ascendencia'` para los nodos de `ascendencia:*`); `graphOptionsFromCharacter` (`:563-566`): ampliar el
  `Pick<Character, …>` con `caminoMetal`, `caminoInicial`, `poderes`, añadir el tercer parámetro `rules = STORMLIGHT_TALENTOS` y
  rellenar `caminoInvestido = ch[rules.campoCaminoInvestido]` (§7.7 #3); `TreeKind` y `SlotKind` ganan los tipos genéricos
  `'caminoInvestido' | 'poder' | 'ascendencia'`, alimentados por `rules.caminosInvestidos` y `rules.poderes`, sin nombres de
  Scadrial en el núcleo; el camino inicial es `caminoInicial === 'metal'`
  (columna, decisión (k), Q7), y con `caminoInicial === ''` cae a «`'metal'` si no hay camino heroico» para los personajes
  anteriores a la columna. **`TalentosDetailPage.tsx:112-122, 135-138`**: hoy desestructura solo
  `caminoHeroico, caminoRadiante, ascendencia` (`:112`) y llama `graphOptionsFromCharacter({ caminoHeroico, caminoRadiante,
  ascendencia }, extraPaths)` con `useMemo` que solo depende de esos tres campos (`:119-122`, `:135-138`): pasar también
  `caminoMetal: character.caminoMetal, caminoInicial: character.caminoInicial, poderes: character.poderes` y añadirlos a las
  dependencias de los dos `useMemo` (sin esto el grafo Mistborn se construiría sin camino de nacido del metal ni poderes y no se
  recalcularía al cambiarlos) y pasar `rules` como tercer argumento; `TalentosPage.tsx:28` ya pasa `character` entero y solo
  añade `rules` (el mismo de T34b) como tercer argumento.
- Cambios: — (descritos por fichero en «Archivos»).
- Libro: L.17-18 / PDF 23-24; L.28 / PDF 34 (hitos de ascendencia); L.32 / PDF 38 (talento humano solo heroico); L.35-39 / PDF
  41-45; L.75 / PDF 81 (talentos con metas; nombres duplicados).
- Aceptación: brumoso de acero nivel 1 con `caminoInicial:"metal"` (con o sin camino heroico) → «Ruptura de brumoso» `autoGranted`
  como raíz; con `caminoInicial:"heroico"` ocupa un hueco de nivel; árbol `caminoInvestido:brumoso` con **6 nodos** (Ruptura de
  brumoso + Investido, Portentoso, Quemar instintivamente, Savantismo alomántico, Trazas de metal; L.135-137 / PDF 141-143) cuyos
  5 nodos no principales **y** los 7 de `poder:alomancia:acero` aparecen bloqueados por «Meta de nacido del metal pendiente»
  hasta `poderes[].completo = true`; elegir «Reflejos acelerados» en `poder:feruquimia:acero` lo marca elegido también en
  `poder:feruquimia:cinc`; `talentBudget` no cuenta «Investido» como `radiante`; nacido de la bruma con una pareja completa y
  el resto nacientes → nodos de `caminoInvestido:nacido-de-la-bruma` desbloqueados y `poder:*` de los nacientes bloqueados por
  meta (Q26); **huecos de ascendencia**: kandra de nivel 1 con `talentos: []` → presupuesto sin exceso ni hueco libre de
  ascendencia (Forma natural y Disfraz kandra ocupan sus dos huecos de nivel 1); kandra de nivel 6 → un hueco «talento kandra o
  heroico»; sangre koloss de nivel 1 → un hueco ocupado por Resistencia koloss y ninguno heroico extra; humano Mistborn idéntico
  al humano Stormlight; cambiar `poderes` en la ficha reconstruye el grafo en Talentos sin recargar; cantor Stormlight idéntico
  (comparación con el `snap` de T34a).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T37a · Mapa de talentos MB: `talentMap.ts`, `PathAtlas.tsx`, `MapPieces.tsx`** — F5 · web · M · T36
- Archivos: `components/talentos/talentMap.ts:14-15, 26-28, 43, 58-81, 85, 116-157, 168-176` (claves `poder:*`,
  `caminoInvestido:*`, `ascendencia:*`; `PlateKind`; **quitar los imports estáticos de `TALENT_GRIDS`/`TALENT_SUMMARIES`
  `:14-15`**:
  `summaryOf(node, summaries)` `:26-28` y `plateOf` `:85` leen `graph.rules.summaries` / `graph.rules.grids`),
  `PathAtlas.tsx:69-72, 82, 98-107, 134, 187, 215-224, 367, 501, 655` (láminas de los poderes del personaje, «Otros poderes» en
  `Disclosure`, filas de 3 con bus y `caretX` por fila; `:655` pasa `graph.rules.summaries` a `summaryOf`), `MapPieces.tsx:91-94`
  (insignia `meta`: `gateBadge` se consume en `PathAtlas`/`TalentLamina` con el glifo del metal, Lucide `Flame`/`Anvil` de reserva
  hasta T46, §7.7 #4).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: en Mistborn se ven camino NdM, poderes propios y «Otros poderes» plegado; con 4+ poderes no hay desbordamiento
  horizontal a 360 px; los nodos bloqueados por meta se distinguen visualmente; Stormlight idéntico (captura antes/después).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T37b · Hojas y página de talentos MB: `TalentLamina`, `TalentSheet`, `MyTalents`, `TalentosDetailPage`** — F5 · web · M · T36,
T34b, T31
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que T37a):
  `TalentLamina.tsx:36-41, 90-117, 188` (textos «Meta de nacido del metal pendiente» e insignia `meta` de `MapPieces.tsx` (T37a)
  con el glifo del metal, Lucide de reserva hasta T46, §7.7 #4; `:188` pasa `graph.rules.summaries` a `summaryOf`),
  `TalentSheet.tsx:31, 41` (solo los textos «Meta de nacido del metal pendiente»; las cláusulas `unknown` ya se pintan hoy,
  `:35, 45`, §7.7 #2), `MyTalents.tsx` (hoy recibe `{ character, graph, evaluation, onOpenTalent, onShowInTree, onChangeForma? }`,
  `:328-335`, desde `TalentosDetailPage.tsx:482-489`, y no llama a `buildTalentGraph` ni a `talentStateFromCharacter`: gana la
  prop opcional `onBeberVial?: () => void` y, para los poderes de `character.poderes`, entradas con las acciones básicas de cada
  poder (`acciones` de su `PoderDef` en `graph.rules.poderes`) y «Beber vial (1)», que llama a `onBeberVial`, en lugar de
  `RADIANT_ACTIONS` (`:85-89`, usado en `:133`), que sigue igual en Stormlight; `:181` usa `graph.rules.summaries` en lugar de
  `TALENT_SUMMARIES`, importado en `:20`), `TalentosDetailPage.tsx:452-462, 482-489, 496-535, 573, 709` (placas y resumen del
  camino NdM; pasa `onBeberVial` a `MyTalents` y monta `BeberVialSheet` (T31) con `React.lazy` desde
  `src/components/mistborn/index.ts`, solo si el personaje tiene algún poder alomántico; `Ascendencia cantora` → etiqueta genérica
  de ascendencia; el gating por `features` de Ideales, formas, leyenda y texto vacío ya está hecho en T09, el hero con pills en
  T32b-2, `talentStateFromCharacter(…, graph.rules)` en T34b y el paso de `caminoMetal`/`caminoInicial`/`poderes` y `rules` a
  `graphOptionsFromCharacter` en T36: comprobar que siguen así).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: en Mistborn no aparecen Ideales, formas ni orden (ya desde T09) y sí el camino NdM; los resúmenes de los talentos MB
  salen de `TALENT_SUMMARIES_MISTBORN`; `MyTalents` ofrece «Beber vial (1)» que abre `BeberVialSheet` en un personaje con algún
  poder alomántico y las acciones básicas de sus poderes; Stormlight idéntico (captura antes/después).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T38-2 · Rejillas de los 32 poderes de metal** — F5 · web · M · T38-1 (entrada `<pdfPath>`/`<rendersPath>`, §0; respaldo de §1
«Protocolo», punto 2)
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea si corre a la vez que T34a, §1 «Protocolo»,
  punto 3): `src/data/mistborn/talentGrids.ts` (añadir a `TALENT_GRIDS_MISTBORN` las 32 rejillas de poderes:
  `poder:alomancia:<metal>` (16) y `poder:feruquimia:<metal>` (16), es decir, los 17 metales de cada arte menos los árboles sin
  talentos, alomancia de aluminio y feruquimia de nicrosil, §8).
- Cambios: rejillas transcritas de las páginas renderizadas de cada poder (alomancia L.172-212 / PDF 178-218; feruquimia L.213-250
  / PDF 219-256; páginas por metal en §8) con `dotnet run --project "<herramienta>" -- "<pdfPath>" "<outputDir>" <páginas>`
  (procedimiento de `src/data/talentGrids.ts:25-30`); a 96 DPI fijos (`Program.cs:31`) una rejilla densa puede no leerse:
  entonces, esa página a 200 DPI con PyMuPDF en el scratchpad (§1 «Protocolo», punto 2); nunca editar la herramienta. Sin
  `<pdfPath>`, respaldo determinista (§1 «Protocolo», punto 2).
- Aceptación: el script de comprobación de T38-1, ampliado: cada `cells[].name` de las 32 rejillas existe en el árbol del poder
  (`PODERES_ALOMANTICOS`/`PODERES_FERUQUIMICOS`) y todo talento de esos árboles tiene celda; sin rejilla, el mapa cae al orden de
  lectura sin romper (`talentMap.ts:102-104`); `npx tsc -b`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: la revisión visual (T38b) y `talentMap.ts` (T37a).

**T38b · Revisión visual de la geometría de los árboles de talentos MB contra las imágenes del manual** — F5 · web · S · T38-2
(entrada `<pdfPath>`/`<rendersPath>`, §0; respaldo de §1 «Protocolo», punto 2)
- Entrada: `<pdfPath>` o `<rendersPath>` (§0); sin ninguna, respaldo determinista de §1 «Protocolo», punto 2. Sustituye a la
  antigua «revisión de Xavi» de Q11 para la geometría: la hace un agente que **mira las imágenes** de los diagramas (herramienta
  `Read` sobre los PNG).
- Archivos: `src/data/mistborn/talentGrids.ts` y `talentSummaries.ts` (solo correcciones; T38-1 y T38-2 ya están fusionadas).
- Procedimiento: para cada una de las rejillas de T38-1 y T38-2 (32 de poderes, 5 de caminos, 2 de ascendencia, 8 de
  especialidades), renderizar la página del diagrama (páginas de cada entrada, §8; `<herramienta>` a 96 DPI, los renders de
  `<rendersPath>` o PyMuPDF a 200 DPI si no se lee, §1 «Protocolo», punto 2), mirar la imagen y comprobar fila y columna de cada
  celda y las conexiones
  entre nodos; corregir; comprobar que cada `cells[].name` existe en el árbol (script de T38-1/T38-2) y que cada frase de
  `talentSummaries.ts` coincide con la línea del diagrama. La comparación del mapa dibujado (T37a, lote siguiente) con el render
  la hace la revisión de fin de F5 (§1 «Protocolo», punto 7).
- Aceptación: tabla rejilla → página → veredicto en el informe para la bitácora; script de comprobación de T38-1/T38-2 verde; sin
  rejilla ausente para ningún árbol con nodos; `npx tsc -b`, `npm run lint`; Stormlight sin cambios (ficheros Stormlight no
  tocados).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: cambios en `talentMap.ts`/`PathAtlas.tsx` (T37a) y en los datos de poderes (T17/T18, revisados en T25b).

### F6 — Catálogo, PNJ, dados, tema, iconos

**T39a · Columnas `World/Era/IsRewardOnly/Price/Category` del catálogo, DTOs y migración `AddWorldToCatalog`** — F6 · api · M
· T05, T11 (solo para `migrations add`: M3 debe ir después de M2, §4.3)
- Archivos: `Messages/Database/Entities/WeaponCatalogEntity.cs` (4 entidades, §4.1), DTOs de `Messages/Catalog/In|Out` (§5.1,
  `CampaignId` anulable), `Services/Catalog/CatalogService.cs:11-35` y `Services/Catalog/ICatalogService.cs` (las proyecciones
  devuelven los campos nuevos), `Infrastructure/Data/CosmereContext.cs:167-169` (índice `(World, Category)`, índices
  `IX_*_World` y `HasDefaultValue(WorldIds.Stormlight)` en las 4 entidades, §4.1).
- Cambios: — (descritos por fichero en «Archivos»).
- Comandos (worktree de tarea `cosmere-api-nb-t39a`): `dotnet ef migrations add AddWorldToCatalog …` → comprobar
  `defaultValue: "stormlight"` en las 4 columnas `World` → añadir al `Up`, con `migrationBuilder.Sql`, la sección «-- M3» del
  anexo `<docsPath>\nacidos-de-la-bruma\seed-mistborn.sql` (T00a): el `UPDATE` de opciones `cosmere` **y los cuatro `setval`** de
  §4.3 M3 (SQL de origen en `07-delta-catalogo.md` §5.2) → `database update` (desde el worktree de la tarea).
- Aceptación: `GET /catalog/*` devuelve lo mismo que hoy (25/8/68 y las opciones) más los campos nuevos con `world: "stormlight"`
  (`cosmere` en las opciones del `UPDATE`); con `docker exec cosmere-postgres-local psql -U jira -d cosmere -c "<SQL>"`,
  `SELECT COUNT(*) FROM "WeaponCatalog" WHERE "World" = ''` = 0 (ídem `ArmorCatalog`, `GearItems` y `CatalogOptions`); tras M3,
  crear un arma propia (`POST /catalog/weapons`) obtiene un id mayor que el máximo sembrado, sin `duplicate key` (los `setval`), y
  se borra después; `dotnet build` verde.
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: —

**T39b · Filtro `?campaignId=` por mundo y era + autorización GM del catálogo (solo API; la UI ya restringe)** — F6 · api · M ·
T39a
- Alcance: la UI ya restringe crear, borrar y editar descripciones al GM (`CatalogPage.tsx:913, :276, :435`); esta tarea cierra el
  hueco de API (hoy `[Authorize]` sin rol, `CatalogController.cs:11-13`) **sin cambio visible en Stormlight** (Q9).
- Archivos: `Services/Catalog/CatalogService.cs:11-35, 41, 71, 95-140` (los GET y las altas, y **también** los cinco
  `DeleteWeaponAsync` `:95`, `DeleteArmorAsync` `:105`, `UpdateWeaponDescriptionAsync` `:115`, `UpdateArmorDescriptionAsync`
  `:124`, `UpdateGearDescriptionAsync` `:133`, que hoy solo reciben `long id`) e `ICatalogService.cs` (nuevas firmas con
  `long? campaignId` y `long userId`; filtro §5.2; alta fija `World`; pertenencia y rol GM),
  `API/Controllers/CatalogController.cs:14-85` (`[FromQuery] long? campaignId` en los GET, en `DELETE weapons|armor/{id:long}` y
  en `PUT …/{id:long}/description`; `JwtHelper.GetUserId(User)` pasado al servicio; GM de la campaña para escribir cuando llega).
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: `GET /catalog/weapons` sin parámetro devuelve las 25 armas actuales; con `campaignId` de una campaña Mistborn
  devuelve 0 (hasta T40); con `campaignId` de una campaña ajena → 403; jugador no GM recibe 403 al
  `POST`/`DELETE`/`PUT description` con `campaignId`; `DELETE` de un arma Stormlight con `campaignId` Mistborn → 404; `POST` sin
  `campaignId` se comporta como hoy.
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: —

**T40 · Seed `SeedMistbornCatalog`** — F6 · api · L · T39a, T42a (M4 se genera después de M5, §4.3; entrada
`<pdfPath>`/`<rendersPath>` con respaldo de §1 «Protocolo», punto 2; la comprobación de ids en producción es de la puerta de
despliegue, §1 «Protocolo», punto 1)
- Entrada: `<pdfPath>` (§0) para verificar en imagen cualquier fila dudosa (páginas 260-273 con `<herramienta>` a 96 DPI o PyMuPDF
  a 200 DPI, §1 «Protocolo», punto 2), o los renders de `<rendersPath>` (T00b); sin ninguno, respaldo determinista (§1
  «Protocolo», punto 2).
- **Comprobación previa obligatoria en la BD local** (worktree de tarea `cosmere-api-nb-t40`; el agente la ejecuta sin preguntar):
  `docker exec cosmere-postgres-local psql -U jira -d cosmere -c 'SELECT (SELECT MAX("Id") FROM "WeaponCatalog"), (SELECT MAX("Id") FROM "ArmorCatalog"), (SELECT MAX("Id") FROM "GearItems"), (SELECT MAX("Id") FROM "CatalogOptions");'`
  — los tres primeros deben ser < 1001 (las tablas son `IdentityByDefaultColumn`, `20260327145705_InitialCreate.cs:21,38,53,85`, y
  las altas de usuario toman ids autogenerados, `CatalogService.cs:58,84`: si una secuencia hubiera avanzado hasta ahí, el
  `INSERT` con id explícito fallaría con `duplicate key`, la migración abortaría al arrancar y la API entraría en el bucle de
  reinicio del riesgo 4 para toda la app) y
  `SELECT "Id" FROM "CatalogOptions" WHERE "Id" IN (4,33,34,47,48,49,65,66,67,68,69,78,79,86,100,110,111,112,113,114,115,140,141)`
  debe devolver 0 filas. Si falla en local, se renumeran los ids del seed (bloque 2001+) antes de generar la migración. **En
  producción**, la misma comprobación (con `sudo docker exec cosmere-postgres psql …`) es de Xavi, dentro de la puerta de
  despliegue (§1 «Protocolo», punto 1); si allí falla, el orquestador abre `T40-s1`, que renumera a 2001+ los ids del seed en el
  SQL de M4 (SQL puro: el snapshot no cambia), revierte la BD local hasta la migración anterior a M4 y la vuelve a aplicar. Como
  red de seguridad, el `Up` empieza con
  `migrationBuilder.Sql("DO $$ BEGIN IF EXISTS (SELECT 1 FROM \"WeaponCatalog\" WHERE \"Id\" >= 1001) OR EXISTS (SELECT 1 FROM \"ArmorCatalog\" WHERE \"Id\" >= 1001) OR EXISTS (SELECT 1 FROM \"GearItems\" WHERE \"Id\" >= 1001) THEN RAISE EXCEPTION 'SeedMistbornCatalog: ids 1001+ ya ocupados; revisar T40'; END IF; END $$;")`
  para que el fallo sea explícito en `docker compose logs api` y no un `duplicate key` genérico.
- Archivos: migración manual (`dotnet ef migrations add SeedMistbornCatalog …`, generada después de M5 de T42a, §4.3, y con
  `Up`/`Down` rellenos con SQL): la sección «-- M4» del anexo **obligatorio** `<docsPath>\nacidos-de-la-bruma\seed-mistborn.sql`
  (T00a) se copia tal cual, sin reconstruirla: opciones (`07-delta-catalogo.md` §6.2), 35 armas (§6.3), 8 armaduras (§6.4;
  Uniforme y Gabán de bruma con el rasgo Presentable (id 80) en `TraitIds` **por fidelidad al libro**; no activa la regla del
  servidor «Vestimenta tradicional», que compara el nombre de la armadura, ver §6.3), 84 `GearItems` (§2.7-2.8; `Category='vial'`
  en 1072-1084) y el `setval` final (§6.6). Antes de aplicar, comprobar también que no hay armas `IsCustom` con nombres Mistborn.
  Rollback en producción: §4.3 «Rollback de F6».
- Cambios: — (descritos por fichero en «Archivos»).
- Libro: L.254-267 / PDF 260-273 (verificado en imagen por el lector).
- Aceptación (consultas locales con `docker exec cosmere-postgres-local psql …`):
  `SELECT COUNT(*) FROM "WeaponCatalog" WHERE "World"='mistborn'` = 35; `ArmorCatalog` 8; `GearItems` 84; `Down` deja las cuentas
  a 0 sin tocar Stormlight (comprobado en local y vuelto a aplicar); crear un arma propia tras el seed obtiene id ≥ 1036.
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: la comprobación en producción (puerta humana, §1 «Protocolo», punto 1).

**T41 · Catálogo y bolsa por mundo en el frontend** — F6 · web · M · T39b, T40, T32a
- Archivos: `src/api/catalog.ts:28-46` (`createWeapon/createArmor(payload & { campaignId })`,
  `deleteWeapon/deleteArmor(id, campaignId)`, `update*Description(id, description, campaignId)`; **firmas fijas**:
  `getWeapons(campaignId?: number)`, `getArmor(campaignId?)`, `getGear(campaignId?)`,
  `getOptions(category: string, campaignId?: number)`, `:32-33` ya tiene `category` primero). **Trampa de `queryFn`**: hoy
  `CatalogPage.tsx:881-883` y `BolsaDetailPage.tsx:160-162` pasan la función por referencia (`queryFn: catalogApi.getWeapons`), de
  modo que TanStack Query la invoca con el `QueryFunctionContext` como primer argumento; con el parámetro nuevo ese objeto se
  enviaría como `?campaignId=[object Object]` y el compilador no lo detecta. **Envolver siempre**:
  `queryFn: () => catalogApi.getWeapons(cId)`; nunca pasar la función por referencia una vez tenga parámetros.
  `src/types/index.ts` (tipos de catálogo de §5.4), `src/pages/catalog/CatalogPage.tsx:36, 149-157, 204-224, 340, 364, 686-870,
  881-892` (renombrar `['catalog-weapons' | 'catalog-armor' | 'catalog-gear']` y `['opts', X]` a
  `['catalog', cId, 'weapons' | 'armor' | 'gear']` y `['catalog', cId, 'opts', cat]`; revisar las invalidaciones sueltas de
  `:204, :220, :224, :690, :800`; `CatalogPage` pasa siempre `currentCampaign.id`; «Añadir arma», «Eliminar» y «Editar
  descripción» siguen solo para el GM, como hoy), `BolsaDetailPage.tsx:158-170, 612-660` (mismas claves; §7.8; el picker de Equipo
  no ofrece `category === 'vial'`, Q21). Invalidación por prefijo `['catalog', cId]`.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: campaña Stormlight ve 25/8/68 con `mc`; Mistborn Era 1 no ve armas de fuego ni «Vial de bendaleo»; Mistborn Era 2 ve
  armas de fuego y
  «Vial de bendaleo»; picker con búsqueda y chips; crear un arma desde `CatalogPage` refresca también el picker de la Bolsa (misma
  clave); la UI
  sigue mostrando «Añadir arma» únicamente al GM (sin cambio respecto a hoy, Q9); el picker de Equipo de la Bolsa no ofrece «Vial
  de …».
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T42a · PNJ globales por mundo (API: `?campaignId=` + migración `AddWorldToGlobalNpcs`)** — F6 · api · M · T05, T39a (solo para
`migrations add`: M5 después de M3, §4.3)
- Archivos (worktree de tarea `cosmere-api-nb-t42a`): `Messages/Database/Entities/GlobalNpcEntity.cs` (`World`, §4.1);
  `Messages/GlobalNpcs/Out` (`GlobalNpcResponse.World`, §5.1; **`GlobalNpcRequest` no cambia**: el mundo nunca viaja en el cuerpo,
  §5.2); `Services/GlobalNpcs/GlobalNpcService.cs` (`GetAllAsync(long? campaignId, long userId)` filtra por el mundo de la
  campaña, `stormlight` sin `campaignId`; `CreateAsync(request, campaignId, userId)` fija `World` en `FromRequest` (`:41`) al
  mundo de la campaña, `WorldIds.Stormlight` sin `campaignId`; `UpdateAsync` y `DeleteAsync` reciben `campaignId` y `userId` y
  devuelven 404 si el PNJ tiene otro `World`; `Apply` (`:56-69`) **no toca `World`**; `Map` (`:71`) devuelve `World`; con
  `campaignId`, pertenencia a la campaña con la misma consulta de `CampaignMembers` que `CatalogService` (T39b): 403 si no es
  miembro, 404 si la campaña no existe; `GetByIdAsync` sin filtro); `Services/GlobalNpcs/IGlobalNpcService.cs` (firmas nuevas);
  `API/Controllers/GlobalNpcsController.cs:14-35` (`[FromQuery] long? campaignId` en `GET` de la lista, `POST`, `PUT` y `DELETE`;
  `JwtHelper.GetUserId(User)` pasado al servicio; `GET {id}` sin cambios); `Infrastructure/Data/CosmereContext.cs`
  (`HasDefaultValue(WorldIds.Stormlight)` e índice `IX_GlobalNpcs_World`, §4.1); migración `AddWorldToGlobalNpcs` (§4.3 M5;
  comprobar `defaultValue: "stormlight"`; se genera después de M3 y antes de M4). Ninguna referencia a ids de mundo en el servicio
  salvo `WorldIds.Stormlight` como valor por defecto.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: `GET /global-npcs` sin parámetro devuelve los 34 PNJ sembrados, igual que con `?campaignId=` de la campaña
  Stormlight de T02; con `?campaignId=` de una campaña Mistborn devuelve 0; con el de una campaña ajena → 403;
  `docker exec cosmere-postgres-local psql -U jira -d cosmere -c "SELECT COUNT(*) FROM \"GlobalNpcs\" WHERE \"World\" = ''"` = 0;
  `POST ?campaignId=<Mistborn>` crea un PNJ `world:"mistborn"` que no aparece en la lista Stormlight, aunque el cuerpo lleve
  `"world":"stormlight"` (el cuerpo no fija el mundo); `PUT ?campaignId=<Mistborn>` de ese PNJ lo deja `mistborn`; `PUT` y
  `DELETE` de un PNJ Stormlight con `?campaignId=<Mistborn>` → 404; `dotnet build` verde.
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: la UI (T42b).

**T42b · PNJ globales por mundo (web)** — F6 · web · S · T42a, T26
- Archivos (tarea web; en su worktree de tarea, porque corre a la vez que T40): `src/types/index.ts` (`GlobalNpc.world: WorldId`,
  §5.4; anclar por texto `export interface GlobalNpc`); `src/api/global-npcs.ts:4-19` (`getAll(campaignId: number)`,
  `create(data, campaignId)`, `update(id, data, campaignId)` y `delete(id, campaignId)`, todos con `?campaignId=`; `getById` sin
  cambios); `GlobalNpcListPage.tsx:96-113` (clave `['global-npcs', cId]` con el id de la campaña actual y
  **`queryFn: () => globalNpcsApi.getAll(cId)`**: hoy pasa la función por referencia, `queryFn: globalNpcsApi.getAll` (`:98`), y
  con el parámetro nuevo TanStack Query le pasaría el `QueryFunctionContext`, enviando `?campaignId=[object Object]` sin error de
  compilación; `create({ name: newName }, cId)` (`:102`); `delete(id, cId)` (`:112`); invalidaciones con la clave nueva, `:104`,
  `:113`; estado vacío de `:131, 185`); `GlobalNpcDetailPage.tsx:61-65` (`RESOURCES` dentro del componente con
  `useWorldConfig().iconos.investidura`; fila Investidura solo si `maxInvestiture > 0` cuando `features.artesMetalicas`, Q27),
  `:145-147` (`update(id, form, cId)` e invalidación de `['global-npcs', cId]`) y gate de mundo: si `npc.world !== useWorld()`,
  `EmptyState` «Este adversario pertenece a otra ambientación» con `Button` «Volver a NPCs» (`../gm`), sin editar ni borrar (§7.8
  PNJ); en Mistborn la sección de notas se titula «Notas, poderes y tácticas» (las artes metálicas del PNJ van en `Notas`, §7.8
  PNJ); `src/pages/npcs/NpcNotesPage.tsx:420-423` (clave `['global-npcs', cId]` y `getAll(cId)`). **La tabla de habilidades por
  mundo de `GlobalNpcDetailPage.tsx:17-54` ya está hecha en T26: no tocar esas líneas.**
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: `npx tsc -b` verde con `GlobalNpc.world` obligatorio; Stormlight ve los 34 PNJ sembrados; Mistborn ve «Sin
  adversarios todavía» y el alta desde una campaña Mistborn crea un PNJ que Stormlight no ve (el mundo lo fija el servidor); toda
  petición de lista y de escritura lleva `?campaignId=<id>` (nunca `[object Object]`); abrir `/campaigns/<mistborn>/global-npcs/1`
  (Anguila Aérea) muestra el `EmptyState`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T43 · Dados: artes metálicas, bonos de atributo y Alomancia en Combate** — F6 · web · S · T26, T15
- Archivos (tarea web; en su worktree de tarea, porque corre a la vez que T44 y T45): `src/components/DiceRoller.tsx:25-55`
  (`SKILLS`/`SKILL_TO_FIELDS` derivados de `cfg.habilidadesTirador ?? cfg.habilidades`: en Stormlight, la tabla de legado del
  tirador, idéntica a la local de hoy; en Mistborn, `HABILIDADES_COSMERE`; se borran las constantes locales, que `skills.ts`
  contiene desde T06b; sin comparar ids de mundo), `:68-87` (`getCharMod` es una función de módulo fuera del componente, sin
  acceso a hooks: pasa a `getCharMod(char, skillName, bonosAtributos: boolean)` y sus llamadores dentro del componente pasan
  `cfg.features.bonosServidor`; con `true` suma `char.bonosAtributos?.[attrField] ?? 0`, Q22; `:88-97` es `getCharSkills`, sin
  cambios), `:1012` (`WEAPON_SKILLS` dinámico con las `habilidadesInvestidas` que tienen `ataque`; dado de daño por defecto =
  `character.derivadosSet['alomancia.dado'].total` y alcance `character.derivadosSet['alomancia.alcance'].total`, calculados por
  el servidor; sin personaje seleccionado, el director elige el dado en `DAMAGE_DICE`), `:773` (texto de Recuperación con
  `features.artesMetalicas`, §7.8). **`src/utils/dice.ts` no cambia**: no importa nada de `src/data/mistborn/` ni replica la
  progresión (P5; el espejo TS `progresionArtes.ts` es solo para la enciclopedia, §7.8 Dados).
- Cambios: — (descritos por fichero en «Archivos»).
- Libro: L.163 / PDF 169; L.172 / PDF 178; L.129 / PDF 135; L.306-307 / PDF 312-313.
- Aceptación: con `Alomancia` 3 la pestaña Combate ofrece «Alomancia» con d8 preseleccionado
  (`derivadosSet['alomancia.dado'].total = 8`) y alcance 24 m; en Mistborn `getCharMod('Atletismo')` usa `fuerza` y un kandra con
  Bendición de la Estabilidad tira Alomancia con +2; `grep -n "data/mistborn" src/utils/dice.ts src/components/DiceRoller.tsx` no
  devuelve nada; **en Stormlight las etiquetas y los modificadores del tirador no cambian, incluidos los cantores** (P1; la
  corrección del bono de forma en el tirador Stormlight se hace en T50, Q22 = sí).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T44 · Tema «Nacidos de la Bruma»** — F6 · web · M · T07
- Archivos (tarea web; en su worktree de tarea, porque corre a la vez que T43 y T45): `src/index.css` (tres bloques de §7.8 tras
  `:298`), `index.html:57-59` (reglas de fondo para `data-world='mistborn'` **en oscuro y en claro**, §7.8 Tema; T07 ya las puso:
  solo revisar los valores), `src/worlds/mistborn.ts` (**solo si** la paleta final difiere de los valores fijados en T06b,
  `tema.themeBg: { light: '#ebe8e6', dark: '#0c0b0d' }`). `src/lib/gameIcons.ts:21-28` no cambia: `StatIcons` queda como está para
  Stormlight y el icono de Investidura por mundo vive en `WorldConfig.iconos`, consumido en `CharacterDetailPage.tsx:827` (T29) y
  `GlobalNpcDetailPage.tsx:61-65` (T42b). `applyTheme` ya lee `getWorld(world).tema.themeBg` desde T07 y no existe `THEME_BG`:
  ningún color de tema vive fuera de `WorldConfig` y del CSS.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: sin `data-world` el CSS computado de `--brand`, `--bg`, `--atmo` es el actual; con `mistborn` cambian en claro y
  oscuro y el fondo previo a la hidratación es claro en tema claro; contraste ≥ 4,5:1 de `--text*` y `--brand` sobre
  `--bg`..`--surface-3` (revisión visual de 6 pantallas en ambos temas); `grep -rn "THEME_BG" src` no devuelve nada.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T45 · Extracción de activos oficiales de Nacidos de la Bruma (script en `cosmere-web/scripts/`)** — F6 · web · M · — (entrada
`<pdfPath>`, §0; sin PDF no hay glifos: respaldo de §1 «Protocolo», punto 2)
- Archivos (un solo repo; tarea web en su worktree de tarea, porque corre a la vez que T43 y T44): script
  `cosmere-web/scripts/mistborn_glyphs/extract.py` (Python 3.13 con PyMuPDF y fontTools, ya instalados, §1 «Protocolo», punto 2;
  sin dependencia de .NET; procedimiento de `docs/nacidos-de-la-bruma/03-superficie-ui.md` §7.3) →
  `cosmere-web/src/assets/cosmere/mistborn/alomancia-era1-<metal>.svg` (17), `alomancia-era2-<metal>.svg` (16),
  `feruquimia-<metal>.svg` (17) (50 glifos en la subcarpeta `mistborn/`, **fuera** del glob eager de `lib/cosmereAssets.ts:2`, que
  solo mira `../assets/cosmere/*.svg`), **`cosmere-web/src/assets/cosmere/nacidos-bruma-emblem.svg` en la raíz** (dentro del glob
  eager, como `archivo-tormentas.svg`: `WorldBadge` y el `Sheet` de creación lo consumen de forma síncrona con `CosmereIcon`,
  §7.8 Iconos), `cosmere-web/src/assets/cosmere/img/dinero-era1.webp`, `dinero-era2.webp`; comentario de procedencia como en
  `CosmereIcon.tsx:3-10`; `mistborn.ts` pasa `moneda.imagen` de `null` a `img/dinero-era1|era2`.
- Cambios: — (descritos por fichero en «Archivos»).
- Fuente: `<pdfPath>` página 411 (fuentes `MistbornAllomantic-Era1/Era2`, trazados feruquímicos), página 410 (emblema), página 260
  (dinero); referencia visual en `<rendersPath>` (T00b). Sin `<pdfPath>` no se extraen glifos: se mantienen los Lucide
  provisionales, el emblema provisional `cosmere-emblem` y `moneda.imagen: null`, y el orquestador abre `T45-s1` (respaldo de §1
  «Protocolo», punto 2). Tabla letra→metal de `03-superficie-ui.md` §7.2; estaño (I) y peltre (O)
  como glifo canónico [inferido; se confirma en esta misma tarea comparando con el render de la página 411].
- Aceptación: 51 SVG con `fill="currentColor"` y `viewBox` (50 en `mistborn/` + 1 en la raíz); comparación visual con los renders
  de las páginas 408-411; `npm run build` no cambia el tamaño del chunk principal respecto a `bundle-referencia.txt` (T16) más
  allá del emblema (un SVG pequeño).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T46 · `MetalGlyph` con carga perezosa y sustitución de iconos provisionales** — F6 · web · S · T45, T24b, T30, T37a
- Archivos: crear `src/lib/mistbornAssets.ts` (**un único módulo perezoso**: `import.meta.glob('../assets/cosmere/mistborn/*.svg',
  { query: '?raw', import: 'default', eager: true })` que solo se carga con `await import('../lib/mistbornAssets')`; un glob no
  eager daría 51 micro-chunks, §7.8 Iconos) y `src/components/mistborn/MetalGlyph.tsx` (`{ metal, arte, era?, size }`,
  `Suspense`/estado de carga, icono de reserva de Lucide `Flame`/`Anvil`); cambiar el provisional `emblema: 'cosmere-emblem'` de
  T06b/T08 por `'nacidos-bruma-emblem'` en `WorldConfig.emblema` de `mistborn.ts` (el SVG ya está en la raíz del glob eager
  desde T45, así que `CosmereIcon` lo resuelve sin más registro); usar `MetalGlyph` en enciclopedia, `PoderCard`, `MetalPicker`,
  `PathAtlas`; sustituir los `emblem` Lucide de `src/worlds/mistborn.topics.tsx` por `MetalGlyph`/`nacidos-bruma-emblem`.
- Cambios: — (descritos por fichero en «Archivos»).
- Aceptación: cero emojis; fallback si falta un SVG; `npm run build` muestra un chunk `mistbornAssets-*.js` separado y el chunk
  principal no crece; en `npm run preview` con DevTools → Application → Service Workers → *Bypass for network*, una campaña
  Stormlight no solicita ese chunk (con el SW activo el precache de workbox sí lo descargará en segundo plano: es aceptable,
  §7.8). No se añade `workbox.globIgnores` en `vite.config.ts`: la descarga en segundo plano se acepta (decisión cerrada, P8).
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

### F7 — Cierre: deuda Stormlight, hemalurgia en la ficha y equipo inicial

F7 forma parte del plan y se ejecuta entera tras cerrar F6 (plan completo, 4 de octubre de 2026): T47 ya no espera a que
Xavi lo pida (P8: el equipo inicial es contenido del mundo Scadrial que se resuelve por la campaña y su era), y T50 recoge las
dos deudas Stormlight decididas en §12 (Q3 etiquetas, Q22 `bonosAtributos` en el tirador).

**T47 · Equipo inicial por paquetes** — F7 · web · M · T40, T32a (entrada `<pdfPath>`/`<rendersPath>`, §0; respaldo de §1
«Protocolo», punto 2)
- Archivos (tarea web; en su worktree de tarea, porque corre a la vez que T50): `src/data/mistborn/equipoInicial.ts` (7 paquetes,
  `docs/nacidos-de-la-bruma/07-delta-catalogo.md` §10; `notaLibro` «Militar» = Mercenario [inferido], §8; exportado desde el
  barrel `src/data/mistborn/index.ts`); `src/components/mistborn/EquipoInicialSheet.tsx` (nuevo `Sheet`, exportado desde
  `src/components/mistborn/index.ts` y cargado con `React.lazy`, regla 4 de §7.4; importa `equipoInicial.ts` por fichero);
  `src/pages/personajes/BolsaDetailPage.tsx` (botón «Equipo inicial» que abre el `Sheet`, visible para el GM y el propietario solo
  con `features.equipoInicial`, §7.1, sin comparar ids de mundo).
- Entrada: `<pdfPath>`/`<rendersPath>` para comprobar en imagen la tabla de paquetes (L.254-255 / PDF 260-261; renders de las
  páginas 260 y 261 en `<rendersPath>`, T00b); sin ellas, respaldo determinista (§1 «Protocolo», punto 2).
- Cambios: flujo de alta nuevo, fuera del núcleo compartido: elegir paquete, tirar sus dados (`rollFree`, `utils/dice.ts:357`),
  ×10 en Era 2 (`useEra()`), añadir los nombres a `weapons`, `armor` y `equipment` con un `charactersApi.update` sobre el
  personaje cacheado (§2) y las arquillas con `charactersApi.patchRecursos({ recursos: { arquillas } })`; Fugitivo y Guardador
  completan de inmediato la meta de nacido del metal de alomancia y de feruquimia, respectivamente (L.255 / PDF 261): el flujo la
  concluye con `metasApi.conclude(cId, chId, metaId, { tipoConclusion: 'exito', notasConclusion: 'Equipo inicial' })`
  (`src/api/metas.ts:17-18`) y el servidor marca el poder completo (T14); si el personaje aún no tiene esa meta, la UI lo avisa y
  el GM usa el `Switch` de la pestaña «Artes metálicas» (§7.4, paso 5).
- Aceptación: Noble en Era 2 recibe 4d20×10 arquillas; Artesano en Era 1, 4d8; las armas, armaduras y objetos del paquete aparecen
  en la Bolsa; un brumoso con meta «Entrenar tu poder» activa que elige Fugitivo termina con la meta concluida y el poder
  `completo:true`; en Stormlight no aparece el botón; `npm run build`: el chunk principal no crece más que el botón.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T49a · Hemalurgia en la ficha (API): columna `Clavos` (migración `AddCharacterClavos`), `BonosAtributos`, desglose de Defensa
espiritual, `hemalurgia.clavosMax`** — F7 · api · M · T13, T22
- Archivos (worktree de tarea `cosmere-api-nb-t49a`): crear `Messages/Characters/ClavoHemalurgico.cs`
  (`public sealed class ClavoHemalurgico { public required string MetalClavo { get; set; } public string? PoderElegido { get; set; } /* "alomancia:hierro" */ public bool Implantado { get; set; } = true; public bool Secreto { get; set; } }`);
  `Messages/Database/Entities/CharacterEntity.cs` (`public string Clavos { get; set; } = "[]";` tras `Bendiciones`, §4.1);
  `Infrastructure/Data/CosmereContext.cs` (`HasDefaultValue("[]")` para `Clavos`, §4.1); migración M6 `AddCharacterClavos` (§4.3;
  generada después de M4, una sola a la vez); `Messages/Characters/In/CharacterRequest.cs`
  (`public List<ClavoHemalurgico>? Clavos { get; set; }` al final de `UpdateCharacterRequest`; `null` = conservar) y
  `Messages/Characters/Out/CharacterResponse.cs` (`public List<ClavoHemalurgico> Clavos { get; set; } = [];` tras
  `BonosAtributos`); `Services/Characters/CharacterJson.cs` (`ParseClavos`, `SerializarClavos`, con la tolerancia de §4.2);
  `Services/Characters/CharacterService.cs` (`ApplyUpdate` escribe `Clavos` si no es `null`; `MapToResponse` lo devuelve y, tras
  cada `Calcular`, llama al hook nuevo); `Services/Worlds/IWorldRules.cs` (miembro nuevo, aditivo,
  `void CompletarDesglose(CharacterEntity c, StatAfectada stat, StatDesglose d)`), `Services/Worlds/StormlightRules.cs` (no-op:
  los JSON de T02 no cambian) y `Services/Worlds/MistbornRules.cs` (`RestringirCambiosNoGm` anula `request.Clavos` para un no-GM,
  porque los clavos son recompensa del DJ, L.288 / PDF 294; `BonosAtributos` suma los clavos de atributo; `Derivar` añade
  `hemalurgia.clavosMax`; `CompletarDesglose` añade a `DefensaEspiritual` las líneas de clavos y recalcula `Total`, y la
  situacional «Desorientado al inicio de escena» si el total es ≤ 9). Partida en dos (T49a API, T49b web) para no mezclar
  repositorios en un agente (§9).
- Cambios: el clavo **no** se cuelga de `PoderPersonaje`: los clavos de cinc, cobre, estaño y hierro (rango 2, los primeros que se
  obtienen) no dan poder pero sí restan Defensa espiritual y suben un atributo (L.291 / PDF 297), y el metal del clavo no es el
  poder (un clavo de acero otorga una alomancia física a elegir entre hierro, peltre, acero o estaño). Modelo: lista independiente
  `Clavos` en su propia columna (`text NOT NULL DEFAULT '[]'`, migración M6, §4.1 y §4.3); el poder de un clavo con `PoderElegido`
  lo envía la UI en el mismo `PUT` como poder `origen: 'clavo'` (el servidor lo normaliza a `completo: true`, §5.3);
  `MistbornRules.BonosAtributos` suma +1 por clavo de atributo (cinc VOL, cobre INT, estaño DIS, hierro FUE) y los bonos de clavos
  del mismo metal se acumulan (dos clavos de hierro = FUE +2); el desglose de Defensa espiritual añade una línea por clavo
  **contando todos** (de atributo y de poder): −2 el primero de cada metal y −5 los adicionales del mismo metal (L.290 / PDF 296),
  y la línea situacional «Desorientado al inicio de escena» si el total es ≤ 9; el **rango de recompensa** del siguiente clavo de
  un metal aumenta en 1 por cada clavo que ya se tenga de ese metal (L.288 / PDF 294; solo texto de enciclopedia en v1); «Poder
  existente»: +1 grado que no cuenta para el máximo (L.290 / PDF 296); **T49a añade** la clave
  `hemalurgia.clavosMax = Math.Min(rango, 3)` a `Derivar`, solo si existe algún clavo (no la emite F2, §6.3).
- Aceptación: el GM implanta a un humano sin camino un clavo de acero con `PoderElegido = "alomancia:hierro"` y el poder
  `alomancia:hierro` `origen:"clavo"` en el mismo `PUT` → `investidura.total > 0`, poder `completo: true`, Defensa espiritual con
  una línea −2; un clavo de cobre → `bonosAtributos.intelecto = 1` y línea −2, sin poder nuevo; un segundo clavo de cobre →
  `intelecto = 2` y línea −5; `hemalurgia.clavosMax = min(rango, 3)` solo con algún clavo; un jugador no GM que envía `clavos`
  conserva los guardados; el `Up` de M6 lleva `defaultValue: "[]"` y la consulta de §4.1 (`"Clavos" <> '[]'` = 0) da 0 en local;
  JSON de T02 (Stormlight) idénticos salvo propiedades nuevas (`clavos` está en la lista del comparador de §1 «Protocolo», punto
  5).
- Verificación: base de §9 en el worktree de la tarea: `dotnet build`; si genera migración, con su API parada (§1 «Protocolo»,
  punto 2); si toca `CharacterService`, comparación JSON con T02 (punto 5).
- Fuera de alcance: hemalurgia jugable completa más allá de este alcance (implantar y extraer con tiradas, clavos secretos, robo
  de atributos; §13).

**T49b · Hemalurgia en la ficha (web): sección «Clavos hemalúrgicos» en `ArtesMetalicasTab`** — F7 · web · S · T49a, T30
- Archivos (tarea web; directamente en `cosmere-web-nb` o en su worktree de tarea):
  `src/components/mistborn/ArtesMetalicasTab.tsx` (creado en T30, §7.6); `src/types/index.ts` (`ClavoHemalurgico` y
  `Character.clavos`, que `UpdateCharacterRequest` incluye); `src/api/characters.ts` (`normalizeCharacter` añade
  `clavos: c.clavos ?? []`).
- Cambios: sección «Clavos hemalúrgicos» en `ArtesMetalicasTab`, solo para el GM: lista de clavos (metal, poder elegido o
  atributo, implantado); «Implantar clavo» (`Sheet` con los 12 tipos de `TIPOS_CLAVO`, T22, y, en los 8 de poder, la elección
  entre sus 4 poderes) que envía en un solo `charactersApi.update` el clavo y, si da poder, el poder `origen: 'clavo'`; «Extraer
  clavo» con `ConfirmDialog` (`confirmLabel="Extraer clavo"`, `tone="danger"`, `icon` explícito) que quita el clavo y su poder
  `origen: 'clavo'` asociado [inferido].
- Aceptación: el GM implanta un clavo de cobre y la ficha muestra INT +1 y la línea −2 en Defensa espiritual (datos del servidor);
  un jugador no GM no ve la sección; extraer pide confirmación; Stormlight sin cambios; `npx tsc -b`, `npm run lint`.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: —

**T50 · Deuda Stormlight: etiquetas del libro (Q3) y `bonosAtributos` en el tirador (Q22)** — F7 · web · M · T26, T43
- Estado (4 de octubre de 2026): las dos partes están **decididas** (Q3 = sí, Q22 = sí) y se ejecutan juntas en F7 porque cambian
  texto visible y resultados de tirada de la campaña en curso (P1 exige una tarea explícita). La neutralización de la base ya no
  está aquí: es T23b (F3).
- Archivos (tarea web; en su worktree de tarea, porque corre a la vez que T47): `src/worlds/skills.ts` (borra
  `HABILIDADES_STORMLIGHT_LEGADO`, `HABILIDADES_STORMLIGHT_TIRADOR_LEGADO` y `HABILIDADES_STORMLIGHT_PNJ_LEGADO`),
  `src/worlds/stormlight.ts` (`habilidades: HABILIDADES_COSMERE`, sin `habilidadesTirador` ni `habilidadesPnj`;
  `features.bonosServidor: true`), `src/worlds/types.ts` (quita de `WorldConfig` las propiedades opcionales `habilidadesTirador?`
  y `habilidadesPnj?`), `src/components/DiceRoller.tsx` y `src/pages/gm/GlobalNpcDetailPage.tsx` (leen `cfg.habilidades` en lugar
  de `cfg.habilidadesTirador ?? cfg.habilidades` y `cfg.habilidadesPnj ?? cfg.habilidades`).
- Cambios: (1) Stormlight adopta `HABILIDADES_COSMERE` en ficha, tirador y PNJ (Armamento ligero/pesado, Saber, Atletismo FUE,
  Intimidación VOL; `ch3_chars.txt`, auditoría 2026-10-03) y desaparecen las tablas de legado y las dos propiedades opcionales
  (Q3); (2) `stormlight.ts` pasa `features.bonosServidor` a `true` (Q22): el tirador (`getCharMod`, T43) y la ficha (`fbOf`, T29)
  suman `bonosAtributos` en ambos mundos sin más cambios de código, porque ya leen la capacidad: el motor que suma es Cosmere y el
  bono (forma de cantor o Bendición) lo pone el mundo en servidor. En la ficha Stormlight los seis atributos pasan a salir de
  `bonosAtributos` (mismos valores que `formaBonus`: `FormasCantor.cs` es espejo de `data/cantores.ts` y el cambio de forma se
  guarda al momento, `CharacterDetailPage.tsx:1281-1296`); el desvío y la concentración de la forma siguen saliendo de
  `formaBonus`, porque `bonosAtributos` no los emite (§6.2 fila `:307`).
- Aceptación: en una campaña Stormlight la ficha, el tirador y la página de PNJ muestran «Armamento ligero», «Armamento pesado» y
  «Saber», y Atletismo e Intimidación usan Fuerza y Voluntad en los tres sitios (`getCharMod('Atletismo')` =
  `fuerza + atletismo`); las tres superficies leen `cfg.habilidades` y no queda ninguna comparación de ids de mundo en los
  componentes (`grep -rnE "===\s*'(mistborn|stormlight)'" src` no devuelve nada); un cantor Stormlight en forma diestra tira
  Agilidad con +1 respecto al valor anterior a T50 y un humano Stormlight tira igual que antes; la ficha del cantor en forma de
  guerra (personaje (2) de T02) muestra los mismos totales de atributo, salud, concentración y desvío que antes de T50; Mistborn
  sin cambios (capturas); `npx tsc -b` y `npm run lint` verdes.
- Verificación: base de §9 en el worktree de la tarea: `npx tsc -b && npm run lint`.
- Fuera de alcance: hacerla dentro de F1-F6 (cambia texto visible y tiradas de la campaña en curso); emitir desde el servidor el
  desvío y la concentración de la forma (siguen en `formaBonus`).

## 10. Orden de ejecución y paralelismo

| Fase | Secuencia | En paralelo | Estado de la app al cerrar la fase |
|---|---|---|---|
| F0 | T00a ∥ T00b ∥ T02 ∥ T03 (T01 ya hecho: el WIP de formas de cantor es el primer commit de `nacidos-de-la-bruma`) | las cuatro entre sí (T02 y T03 no modifican ningún repositorio) | Sin cambios de producto. WIP incluido en la rama de integración (T01); documentos commiteados en `cosmere-web-nb` (T00a); renders en `<rendersPath>` y texto del manual en `<flowPath>` (`cosmere-api/Resources/pdfextract/`, ignorada por git y, desde T00b, por Docker); JSON de referencia de T02 en `"$TEMP/cosmere-regresion"`. |
| F1 | T04 → T05 → T06a → T06b → (T06c ∥ T07) → (T08 ∥ T09) | T06c ∥ T07; T08 ∥ T09 (**T08 después de T07**: ambos editan `CampaignSettingsPage.tsx`) | **Primera fase usable en la previsualización:** se crean campañas «Bruma» con su era fijada al crear; ven enciclopedia reducida y Talentos sin Ideales ni formas. **La ficha sigue siendo 100 % Stormlight** (picker de Orden, ascendencia Oyente e Investidura radiante incluidos) hasta F4, y el servidor no valida por mundo hasta F2: **las campañas «Bruma» creadas en F1-F3 son de prueba; no asignar Orden radiante ni ascendencia Oyente a sus personajes**, porque desde F2 `MistbornRules.ValidarIdentidad` los rechazará con 400 en todo `PUT` (comprobación y limpieza SQL en T12; riesgo 21). Stormlight idéntico. M1 queda aplicada en la BD local desde el worktree de T04; en producción se aplica con el despliegue final (o con uno intermedio opcional), con `pg_dump` e imagen `:prev` previos (§4.3). |
| F2 | T10 → T11 → T12 → (T13 ∥ T14) → T15 | T13 ∥ T14 | Motor envuelto; Mistborn valida, calcula y persiste el estado de mesa. Stormlight idéntico (T02). M2 toca `Characters`: `pg_dump` previo en el despliegue que la incluya. |
| F3 | T16 → (T17 ∥ T18 ∥ T19 ∥ T20 ∥ T21 ∥ T22 ∥ T23) → (T23b ∥ T24a ∥ T25 ∥ T25b) → T24b | 7 transcripciones con agentes distintos; después T23b, T24a, T25 y T25b entre sí (T25b solo edita los datos de T16-T22 marcados `[inferido]`/`notaLibro` y, si procede, `src/worlds/mistborn.ts`; T23b edita `aventuras.ts`, `combatRules.ts`, `stormlight.data.ts` y los overlays de Bruma); toda la fase corre en paralelo con F2 | Enciclopedia completa de Nacidos de la Bruma; base de aventuras y combate neutra (Cosmere) con overlay por mundo; datos `[inferido]` de F3 revisados contra las imágenes del manual (T25b). Stormlight idéntico (comparación JSON de T23b, capturas de Aventuras y Combate). |
| F4 | (T26 ∥ T32b-1 ∥ T38-1) → (T27 ∥ T32b-2) → T28 → T29 → (T30 ∥ T32a) → (T31 ∥ T33) | T32b-1, T32b-2 y T32a en serie entre sí (editan las mismas líneas de `BolsaPage.tsx`, `PersonajesPage.tsx` y `BolsaDetailPage.tsx`); T38-1 antes de T30, que consume `talentSummaries.ts`; T33 tras T28, T14 y T30 (edita `ArtesMetalicasTab.tsx`, que crea T30) | Ficha jugable de Nacidos de la Bruma con estado de mesa en servidor (sin mapa de talentos MB; Talentos sin Ideales ni formas en Mistborn desde F1). |
| F5 | (T34a ∥ T38-2) → (T34b ∥ T35) → (T36 ∥ T38b) → (T37a ∥ T37b) | T34a ∥ T38-2 (T38-2 solo toca `talentGrids.ts`); T34b ∥ T35; T36 ∥ T38b; T37a ∥ T37b (T37b además tras T34b y T31) | Talentos completos; geometría de los árboles revisada contra las imágenes del manual (T38b). Stormlight idéntico (`snap` de T34a). |
| F6 | (T39a ∥ T43 ∥ T44 ∥ T45) → (T39b ∥ T42a ∥ T46) → (T40 ∥ T42b) → T41 | casi todo, **salvo la generación de migraciones**: una a la vez y en el orden de aplicación M3 (T39a) < M5 (T42a) < M4 (T40), es decir, T39a → T42a → T40 (§4.3) | Catálogo, PNJ, dados, tema, iconos. M3, M4 y M5: `pg_dump` previo en el despliegue que las incluya y, si hay que volver atrás tras M4, el `DELETE` de §4.3 «Rollback de F6». |
| F7 | (T47 ∥ T49a ∥ T50) → T49b | T47 ∥ T49a ∥ T50 | Fase completa del plan (no opcional): equipo inicial por paquetes, hemalurgia en la ficha y las dos deudas Stormlight decididas (Q3 etiquetas y Q22 `bonosAtributos` en el tirador, T50). Es la única fase que cambia texto visible y tiradas de la campaña Stormlight, y lo hace a propósito. Al cerrarla, el orquestador entrega el informe final y Xavi pasa la puerta humana (§1 «Protocolo», punto 1). |

El plan no espera a Xavi en ningún punto: T01 (el WIP de formas de cantor) ya está en la rama de integración, F1 empieza al cerrar
F0, F2 y F3 corren en paralelo al cerrar F1 y cada fase siguiente empieza al cerrar la anterior (§1 «Protocolo», punto 3). El plan
asume **un único despliegue final**, que es la puerta humana de Xavi (§1 «Protocolo», punto 1); los despliegues intermedios por
fase son opcionales y siguen el mismo procedimiento sobre la etiqueta `nb-f<N>`. T39a depende de T05 y T11 (M3 se genera después
de M2); T39b y T42a, además, de T39a; las tres van en los lotes de F6 y su generación de migraciones es en serie (§4.3). El orden
operativo por lotes (qué tareas van en paralelo en cada fase, con un agente por tarea), la puerta humana y la puerta de calidad
están en §1 «Protocolo de ejecución», puntos 1, 3 y 5; esta tabla es su fuente.

## 11. Riesgos y mitigaciones

| # | Riesgo | Mitigación |
|---|---|---|
| 1 | Regresión silenciosa del cálculo Stormlight al extraer `StormlightRules` (sin tests) | T02 captura con el **WIP** como referencia; T10-T14 y T49a comparan byte a byte con el comparador `node -e` de §1 «Protocolo», punto 5 (quita solo las propiedades nuevas y `esBono`); `StormlightRules` copia el código, no lo reescribe. |
| 2 | Colisión con el WIP de formas de cantor (API y `CharacterDetailPage.tsx`/`types/index.ts` en web) | El WIP es la línea base: está en la rama de integración desde T01 (commits `5083960` y `4dc6dfd`), así que nada espera a Xavi y nadie fusiona `main` en la rama; cambios aditivos al final de firmas y clases; `BonosForma`/`FormasCantor` sin renombrar; las tareas que tocan esos ficheros anclan por texto; los árboles principales no se tocan y, antes de la fusión final en `main`, Xavi descarta en ellos su copia sin commitear (`git checkout --` de los ficheros y borrar `FormasCantor.cs`, §1 «Protocolo», punto 1), porque `deploy.sh` empaqueta el árbol de trabajo (`COPY . .`). |
| 3 | `dotnet ef` compila el proyecto de arranque: si el árbol no compila no hay migración | `dotnet build` antes de cada `migrations add`, en el worktree de la tarea y con su API parada (regla del proyecto; definición en §1 «Protocolo», punto 2). |
| 4 | Auto-migración al arrancar en producción (`Program.cs:93-94`); un fallo de migración deja la API en bucle de reinicio (`restart: unless-stopped`) y nginx devuelve 502 en `/api/` para **toda** la app, incluida la campaña Stormlight en curso; la imagen de runtime no lleva `dotnet ef` (sin `Down` en producción) | Solo `ADD COLUMN … DEFAULT` constante o `INSERT` (PostgreSQL 16 en producción, verificado en `docker-compose.yml:4`); **DEFAULT de BD declarado en Fluent para toda columna `NOT NULL` nueva** (§4.1; sin él EF genera `""` o, para `List<string>`, nada); el seed no borra; backup `pg_dump` previo e imagen `:prev` etiquetada para redesplegar la anterior (§4.3); comprobar `docker compose logs api` tras arrancar. |
| 5 | `localStorage['cosmere-campaign']` persistido sin `world`, o `world: ""` si una migración se aplicara sin DEFAULT | `useWorld = () => getWorld(currentCampaign?.world).id`, sin literales: `getWorld` resuelve `''`, `null`, `undefined` y los ids desconocidos a Stormlight con `Object.hasOwn`; `dataWorld` persistido desde `WorldConfig.tema` para el script previo a la pintura; gate `ready` en `AppLayout`. |
| 6 | Tamaño del bundle (+ ≈4.500 líneas de datos MB y 51 SVG); el service worker de la PWA precachea todos los chunks `.js` en segundo plano y excluye del precache los ficheros > 2 MiB (`maximumFileSizeToCacheInBytes` por defecto de workbox), con lo que la app perdería el modo offline sin error de build (hoy el chunk principal pesa 1,43 MB) | `WorldData` con `import()`; páginas MB con `React.lazy`; SVG en `assets/cosmere/mistborn/` fuera del glob `eager` de `cosmereAssets.ts:2` y en un único chunk `mistbornAssets`; medida de referencia en T16 y comparación en T24b, T27, T28, T29, T30, T45 y T46 (chunk `mistborn-*.js` separado; chunk principal **≤ referencia + 40 KB en F4** (solo `metales.ts`, `progresionArtes.ts` y los tipos pueden quedar en él; los componentes de `src/components/mistborn/*` se cargan con `React.lazy`, §7.4 regla 4) **y sin crecer en F3/F6, siempre < 2 MiB**); regla de importación por fichero, nunca desde el barrel `src/data/mistborn/index.ts` (§8). El precache en segundo plano se acepta; no se añade `workbox.globIgnores` (T46). |
| 7 | Datos [inferido] del libro (tablas de metales por posición, geometría de árboles, glifos canónicos de estaño/peltre, Lupa 200 ar, Revitalizar, duraluminio/electro para nacido de la bruma) | `notaLibro` y `// [inferido]`; revisión visual por agentes con imágenes del manual: T25b (datos de F3) y T38b (geometría de los árboles, F5); los glifos los compara T45 con el render de la página 411 (Q11, Q18). |
| 8 | `parsePrereq` deducido, no ejecutado; cláusulas `unknown` bloquean para siempre | T03 antes de T35; `TalentSheet` muestra `unknown` como texto; `ignorarClausulas` por mundo. |
| 9 | Secuencias de id del catálogo (`IDENTITY BY DEFAULT` con ids explícitos): si un id 1001+ o uno de los ids de opción nuevos ya existe en producción, el `INSERT` falla con `duplicate key`, la migración aborta al arrancar y la API entra en el bucle del riesgo 4 | `setval` en M3 (T39a) y al final de M4 (T40); **comprobación previa obligatoria** de `MAX("Id")` y de los ids de `CatalogOptions`: en la BD local la hace el agente de T40 (con renumeración a 2001+ si choca) y en producción Xavi, dentro de la puerta de despliegue (§1 «Protocolo», punto 1; si falla, `T40-s1`); `DO $$ … RAISE EXCEPTION` al inicio del `Up` de M4 para que el fallo sea explícito en `docker compose logs api`. |
| 10 | Inventarios por nombre: homónimos entre mundos | Mundo exclusivo por campaña (decisión (a)); el filtro garantiza un nombre por catálogo. |
| 11 | Tres tablas de habilidades Stormlight ya incoherentes entre ficha, tirador y PNJ (auditoría 2026-10-03; §7.1 `skills.ts`) | T26 **no** las unifica: añade `HABILIDADES_COSMERE` para Mistborn y deja las tres Stormlight como tablas de legado en `skills.ts` (`habilidades`, `habilidadesTirador`, `habilidadesPnj`, §7.1; unificarlas cambiaría el modificador de tirada, P1); la unificación es T50 (Q3). |
| 12 | Carrera de hidratación ya existente (`AppLayout.tsx:13-17`, `.catch(() => {})`) | T07 la corrige para ambos mundos. |
| 13 | Concurrencia del `PUT` completo del personaje con `poderes` (*last-write-wins*, como `talentos` hoy; los PUT de bolsa y talentos envían el personaje cacheado completo) | Los valores de mesa y de estado del servidor (`completo`, `cargas`, `viales`, `desprovisto`, `recursos`) **no** se escriben desde el `PUT` (se conservan por `(arte, metal)`), solo por `PATCH`/acciones/T14; la identidad del poder sí viaja en el `PUT`, igual que `talentos`, pero **los poderes con `Origen != "camino"` tampoco se pierden por un `PUT` de un no-GM con una lista cacheada antigua**: el servidor los reinyecta antes de fusionar (§5.2, Q16). Los `Stepper` de recursos usan mutaciones optimistas **por prefijo de caché** y se deshabilitan en edición (§2, §7.6); los tres endpoints de mesa bloquean la fila con `SELECT … FOR UPDATE` (§5.2). |
| 14 | Cambiar la autorización del catálogo (T39b) podría alterar el comportamiento para jugadores no GM | **Sin cambio visible en Stormlight:** la UI ya restringe «Nueva arma/armadura», «Eliminar» y «Editar descripción» al GM (`CatalogPage.tsx:913` `actions={isGm && …}`, `:276` `isGm && isCustom && !confirmDelete`, `:435` `isGm && !editing`); el hueco es solo de API (`CatalogController.cs:11-13`, `[Authorize]` sin rol: llamadas directas con el JWT) y T39b lo cierra en servidor únicamente cuando llega `campaignId` (Q9). La UI sigue mostrando esos controles solo al GM en ambos mundos. |
| 15 | `MetaService` es compartido con Stormlight (T14) | `MetaService` solo llama a los hooks `AlConcluirMeta`/`AlBorrarMeta` del mundo (no-op en Stormlight; la lógica de poderes vive en `MistbornRules`); JSON de T02 como aceptación. |
| 16 | `Recursos` y `Poderes` como `text` JSON sin tipo en BD | Validación completa en servidor (ids, claves, rangos); serialización centralizada en `CharacterJson`; tabla hija como evolución documentada (§13). |
| 17 | Líneas citadas de ficheros con WIP pueden moverse | Las tareas anclan por texto (`ASCENDENCIAS`, `isCantor`, `SECTIONS`, `ATRIBUTO_SLOTS`, `getPuntosAtributoEsperados`, `'Solo disponible para Radiantes'`, `esRadiante`, `MapToResponse`, `ConceptoForma`, `ParseTalentos`). |
| 18 | Migraciones generadas en paralelo por agentes distintos (M2-M6): `CosmereContextModelSnapshot.cs` es un único fichero y dos `migrations add` en ramas paralelas producen conflicto de snapshot y `Up` incorrectos; el orden de aplicación es por *timestamp*, no por fase | Regla de serialización de §4.3: una migración a la vez, en el worktree de su tarea creado desde la punta de la rama de integración con todas las anteriores fusionadas, en el orden M1 (T04) < M2 (T11) < M3 (T39a) < M5 (T42a) < M4 (T40) < M6 (T49a): M4 es SQL puro sin cambio de modelo, pero su `migrations add` también toca el snapshot, así que se genera después de M5 (T39a → T42a → T40, lotes 1-3 de F6); `dotnet ef migrations has-pending-model-changes` tras cada fusión que toque entidades. |
| 19 | Talentos `autoGranted` del cliente (p. ej. «Resistencia koloss») no se guardan en `Talentos` y el servidor solo aplica reglas por `Contains(nombre)` | `IWorldRules.TalentosImplicitos` los une en `MapToResponse` antes de `Calcular` y `Derivar` (§6.1, §6.2). |
| 20 | Chunks perezosos nuevos (`import()`/`React.lazy`; hoy no existe ninguno) con hash + service worker `autoUpdate`/`skipWaiting`/`clientsClaim` (`vite.config.ts:11,23-24`): un cliente con la app abierta durante un despliegue recibe el SW nuevo, que borra el precache antiguo, y al navegar a una ruta perezosa con el hash viejo nginx devuelve `index.html` (fallback SPA) → «Failed to fetch dynamically imported module» y pantalla en `Spinner`/error hasta recargar a mano | Manejador `vite:preloadError` con recarga única (`sessionStorage['cosmere-reload-once']`) en `src/main.tsx` (T06c, §7.1 «Chunks perezosos y PWA»); aceptación de T07: con la app abierta en `npm run preview`, publicar un build nuevo y navegar a Talentos no deja la pantalla en error. |
| 21 | Datos Stormlight guardados en campañas `mistborn` durante F1-F3 (la ficha sigue siendo Stormlight y `ValidateCaminos`, `CharacterService.cs:25`, no conoce el mundo, así que acepta Orden radiante y Oyente y `BuildInvLineas` `:239` les da Investidura): tras F2, `MistbornRules.ValidarIdentidad` devuelve 400 permanente en todo `PUT` de esos personajes (el cliente reenvía el `caminoRadiante` guardado y `:111-116` lo fuerza para no-GM), incluidos los de Bolsa y Talentos | Aviso en §10 F1 (campañas Bruma de F1-F3 son de prueba: sin Orden ni Oyente); consulta SQL obligatoria y `UPDATE` de limpieza que el agente de T12 ejecuta en la BD local sin preguntar; Xavi repite la consulta (y el `UPDATE` si devuelve filas) en producción dentro de la puerta de despliegue (§1 «Protocolo», punto 1; con un único despliegue final no habrá filas). |

## 12. Decisiones de diseño cerradas (Q1-Q27, 4 de octubre de 2026)

Todas las preguntas que la especificación planteó a Xavi están resueltas. Ninguna fila queda abierta ni delegada a una
recomendación: donde la decisión aplica el principio de Xavi (lo compartido es Cosmere; lo específico es del mundo y se
resuelve por la campaña) se indica «por el principio Cosmere/mundo». Las alternativas descartadas se han eliminado. Si durante
la ejecución surge una duda no prevista aquí, se aplica P8 (§1) y se anota en la bitácora.

| # | Pregunta | Decisión |
|---|---|---|
| Q1 | ¿Mezclar Tormentas y Nacidos de la Bruma en una campaña (L.374-375 / PDF 380-381)? | **Resuelta (4 de octubre de 2026): no en v1.** `World` exclusivo por campaña; `TieneInvestidura` por capacidades deja preparado un `"mixto"` sin migración (§13). |
| Q2 | ¿La era se puede editar tras crear la campaña? | **Resuelta (4 de octubre de 2026): no.** La era se fija al crear la campaña y no se edita; sin valor «entre eras» (decisión (b)). |
| Q3 | ¿Se unifican las etiquetas Stormlight con los nombres del libro (Armamento ligero/pesado, Saber, Atletismo FUE, Intimidación VOL)? | **Resuelta (4 de octubre de 2026): sí**, como tarea aparte (T50, F7): cambia texto visible y tiradas de la campaña en curso. La unificación de las tres tablas (ficha, tirador, PNJ), incluida la atribución Atletismo/Intimidación del tirador, es **T50, nunca T26**. |
| Q4 | ¿Alomancia y Feruquimia en huecos personalizados o columnas dedicadas? | **Resuelta (4 de octubre de 2026): huecos personalizados** (literal del libro, cero API, el tirador ya las tira). Coste: un nacidoble ocupa los dos huecos cognitivos. |
| Q5 | ¿Persistir Investidura actual, cargas, viales y Desprovisto en servidor? | **Resuelta (4 de octubre de 2026): sí, desde F2** (`PATCH recursos` + acciones). El director los ve y sobreviven al cambio de dispositivo. |
| Q6 | ¿Puede un jugador no GM cambiar `caminoMetal`? | **Resuelta (4 de octubre de 2026): por ahora no.** Solo el director, como hoy con `CaminoRadiante`: `CaminoInvestidoLoCambiaElDirector = true` en Mistborn, `CaminoInicial` se bloquea igual y el selector de camino de nacido del metal solo se muestra al director (el libro permitiría cambiarlo a cualquier nivel, L.128 / PDF 134; revisable más adelante). |
| Q7 | ¿Camino de nacido del metal como camino inicial sin columna (decisión (k))? | **Resuelta (4 de octubre de 2026): se mantiene la columna `CaminoInicial text`** (`''`, `'heroico'` o `'metal'`) en M2 (aditiva, `HasDefaultValue("")`). Xavi preguntó si no era inherente a separar las campañas por mundo; no lo es: dentro de una campaña de Bruma un personaje puede empezar por un camino heroico o por uno de nacido del metal, y el motor necesita saberlo. Motivo técnico: casi todo humano nacido del metal tiene `caminoHeroico != ''` por el talento de ascendencia (L.32 / PDF 38; ejemplos icónicos L.135, 139, 153 / PDF 141, 145, 159: Brisa, Kelsier y Vin, Waxillium), así que la regla derivada `caminoHeroico === ''` no detecta el caso común. |
| Q8 | ¿La Bendición de la Fortaleza (Desvío +1) se acumula con la armadura? | **Resuelta (4 de octubre de 2026): sí** [inferido], por el principio Cosmere/mundo: el cálculo de Desvío es Cosmere y la acumulación la declara el mundo (`DesvioBonoSeAcumula = true` en `MistbornRules`, `false` en `StormlightRules`). |
| Q9 | ¿Corregir la autorización del catálogo en la API (hoy `CatalogController.cs:11-13` solo lleva `[Authorize]`, sin rol)? | **Resuelta (4 de octubre de 2026): sí** (T39b), **sin cambio visible en Stormlight**: la UI ya restringe crear, borrar y editar descripciones al GM (`CatalogPage.tsx:913`, `:276`, `:435`), así que el hueco solo lo explotan llamadas directas a la API con el JWT. T39b exige rol GM de la campaña únicamente cuando llega `campaignId` (un cliente cacheado sin `campaignId` se comporta como hoy) y la UI sigue mostrando esos controles solo al GM en ambos mundos (T41). |
| Q10 | ¿Ocultar «Aventura» del director en Mistborn v1? | **Resuelta (4 de octubre de 2026): sí, por ahora**; el registro de aventuras por mundo se abordará más adelante (§13). |
| Q11 | Revisión visual de datos [inferido] (geometría de árboles, glifos de estaño/peltre, Lupa 200 ar, Revitalizar, duraluminio/electro para nacido de la bruma a finales de la Era 1) | **Resuelta (4 de octubre de 2026): deja de ser una revisión de Xavi.** La hacen agentes que miran las imágenes del manual: **T25b** (F3, datos de T16-T22 marcados `[inferido]`/`notaLibro`) y **T38b** (F5, geometría de los árboles de T38-1 y T38-2); los glifos de estaño/peltre los confirma la propia T45 contra el render de la página 411. Las tablas de metales no entran: T16 las transcribe desde la imagen de las páginas 172-177 (PDF) y su revisión se da por hecha en esa tarea. |
| Q12 | ¿Neutralizar la base compartida de `aventuras.ts`/`combatRules.ts` (≈25 textos) para un futuro `"mixto"`? | **Resuelta (4 de octubre de 2026): sí, opción (2) de §3(h)**, por el principio Cosmere/mundo: base neutra (contenido Cosmere) + overlay Stormlight que reinyecta los ≈25 fragmentos de Roshar + overlay Mistborn. Nueva tarea **T23b** (F3, tras T23): neutralizar la base, crear el overlay Stormlight en `src/worlds/stormlight.data.ts` y verificar que los arrays resueltos para `stormlight` son idénticos (comparación JSON) a los anteriores: la campaña Stormlight no cambia ni un texto. T50 pierde la parte de neutralización. Afecta solo a dos ficheros de la enciclopedia y a las páginas Aventuras y Combate; no cambia ninguna regla, fórmula, ficha ni tirada (§1.9, §3(h), §8). |
| Q13 | ¿Precio de armas y armaduras de Stormlight (existe en el libro, no en BD)? | **Resuelta (4 de octubre de 2026): fuera de alcance confirmado** (§13); la columna `Price` queda `NULL` en Stormlight. |
| Q14 | ¿Debe el jugador (no GM) poder marcar un poder como completo a mano (`PATCH recursos { completo }`)? | **Resuelta (4 de octubre de 2026): sí** [inferido]; la vía normal es concluir la meta (T14), el interruptor es un atajo de mesa. |
| Q15 | ¿Alinear `ValidAscendencias` (`CharacterService.cs:23`) con `FormasCantor.AscendenciasCantor` (`Cantor`, `Cantora`)? | **Resuelta (4 de octubre de 2026): fuera de alcance confirmado.** Bug previo del núcleo (cambiaría validación Stormlight, P1); anotado en §13. |
| Q16 | ¿Puede un jugador no GM editar `bendiciones` y añadir poderes con `origen ≠ 'camino'`? | **Resuelta (4 de octubre de 2026).** **Bendiciones:** el jugador puede fijar la primera (si `character.Bendiciones.Count == 0`); cualquier otro cambio lo hace el GM (la 2.ª es una recompensa de rango 3, L.35 / PDF 41). **Poderes (con Q6):** un jugador no GM no añade **ni quita** ningún poder (el camino y sus metales los asigna el director); un poder nuevo desde un no-GM → 403 y los poderes guardados que falten en su lista (copia cacheada) se **reinyectan** en servidor antes de fusionar, de modo que un `PUT` de Bolsa o Talentos no los borra; lo único que fija es `metaId` al crear su meta de nacido del metal (clavos, aleación de lerasium y medallones son recompensas del DJ, L.288 / PDF 294). Implementado en `MistbornRules.RestringirCambiosNoGm` (§5.2, §6.1, §6.3; T12) y en T27 (picker solo para el director). |
| Q17 | ¿`beber-vial` presupone siempre los 8 metales comunes? | **Resuelta (4 de octubre de 2026): preseleccionados en la UI, pero desmarcables** por el director (L.130 / PDF 136 «se da por supuesto que estos viales más raros también contienen metales físicos y mentales comunes»; L.267 / PDF 273 «los que el alomante desee»); el servidor usa la lista tal cual y solo restaura Investidura si el vial contiene un metal que el personaje quema (L.129 / PDF 135). El DJ puede imponer Desprovisto de un común también con `PATCH …/recursos { poderes: [{ arte, metal, desprovisto: true }] }`. |
| Q18 | Inferencias visuales sin respaldo del libro: tonos de los chips de era (`granate`/`zafiro`/`cuarzo`), Lucide para ascendencias (`UserRound`/`VenetianMask`/`Mountain`), caminos NdM (`Flame`/`CloudFog`/`Container`/`Package`/`Merge`) y Alomancia/Feruquimia (`Flame`/`Anvil`) | **Resuelta (4 de octubre de 2026): se adoptan como provisionales y su revisión es de agente, no de Xavi.** T25b los compara con la imaginería del manual (páginas de orígenes y caminos) y, como el libro no trae iconos de caminos ni de ascendencias (§13), los Lucide se mantienen salvo que exista un glifo oficial extraíble; los glifos de metales y el emblema oficiales llegan con T45/T46 (oficial primero, Lucide después, nunca iconos caseros). |
| Q19 | ¿Un clavo o medallón que otorgue un poder **feruquímico** da también Investidura? El libro dice que cualquier clavo que otorgue un poder alomántico o feruquímico da «la habilidad Alomancia o Feruquimia correspondiente y un valor de Investidura (si aún no lo tenías)» (L.290 / PDF 296) | **Resuelta (4 de octubre de 2026): v1 solo con `Arte == "alomancia"`** [inferido: la feruquimia no usa reserva de Investidura, L.131 / PDF 137, y una reserva sin uso solo añadiría ruido en la ficha]. Es una regla del mundo (`MistbornRules.TieneInvestidura`), ampliable sin cambio de contrato. |
| Q20 | ¿Una meta de nacido del metal concluida por `fracaso` o `crecimiento` también desbloquea la versión completa del poder, o solo `exito`? | **Resuelta (4 de octubre de 2026): cualquier conclusión** [inferido]: el libro dice que al concluir la meta se recibe la recompensa (L.284 / PDF 290; «Al completarla, recibes su recompensa: obtienes una mente de metal, desbloqueas la versión completa de tu poder», L.150 / PDF 156) sin distinguir el tipo (decisión (l), §6.4; T14, T33). |
| Q21 | ¿Comprar un vial en la Bolsa debe sumar automáticamente a `poderes[].viales`? | **Resuelta (4 de octubre de 2026): fuera de alcance confirmado (no en v1)**: evita el doble conteo «Vial de oro» en `equipment` + `viales` y parsear el metal del nombre (`GearItemEntity` no tiene columna de metal). Los `GearItems` con `category === 'vial'` son solo referencia de precio en Enciclopedia → Catálogo y el picker de Equipo de la Bolsa no los ofrece (§7.8, T41); el recuento vive en `PoderPersonaje.Viales` y se edita con el `Stepper` del poder o con `PATCH …/recursos` (§13). |
| Q22 | ¿`bonosAtributos` se aplica también en Stormlight (tirador `getCharMod`), cambiando el modificador de los cantores de la campaña en curso? Hoy el tirador ignora la forma de cantor (`DiceRoller.tsx:68-87`), defecto previo al WIP. | **Resuelta (4 de octubre de 2026): sí, como parte de T50 (F7)**, por el principio Cosmere/mundo: el motor que suma el bono al modificador es Cosmere y el bono (forma de cantor o Bendición) lo pone el mundo en servidor; va en F7 porque cambia tiradas de la campaña en curso (P1 exige tarea explícita). Hasta T50, T29 y T43 suman `bonosAtributos` solo si `features.bonosServidor` es `true` (Mistborn); T50 la activa en Stormlight, cuyo `CharacterResponse.BonosAtributos` ya lleva el bono de forma. Un cantor en forma diestra tirará Agilidad con +1 respecto a hoy. La ficha Stormlight toma entonces de `bonosAtributos` los seis atributos (mismos valores que `formaBonus`, espejo de `FormasCantor.cs`; el cambio de forma se guarda al momento) y sigue leyendo de `formaBonus` el desvío y la concentración de la forma, que `bonosAtributos` no emite. |
| Q23 | ¿Las mentes de metal son objetos de la Bolsa o filas del catálogo? | **Resuelta (4 de octubre de 2026): fuera de alcance confirmado (no en v1)**: el libro simplifica «una única mente de metal por cada poder feruquímico» (L.131 / PDF 137); cada poder feruquímico es su propia mente, las cargas viven en `PoderPersonaje.Cargas` y se gestionan en la pestaña «Artes metálicas»; la Bolsa solo enlaza («Cargas en Artes metálicas →», §7.8). Mentes de reserva, mentes desligadas y medallones como objetos con cargas → §13. |
| Q24 | ¿`POST …/acciones/inicio-escena` sin `Sorprendido` limpia el estado Desprovisto? El libro presupone que, si no estás Sorprendido, «ya te has bebido un vial por puro instinto» (L.129 / PDF 135) | **Resuelta (4 de octubre de 2026): sí para los metales comunes** [inferido]: con `Sorprendido == false`, además de `investiduraActual = total`, pone `Desprovisto = false` en los poderes alománticos (no atium) cuyo metal sea común (`MistbornData.MetalesComunes`), porque ese es el contenido de un vial estándar (L.130 / PDF 136); los raros conservan su estado (su suministro se controla con `viales`). Con `Sorprendido == true` no se toca nada (§5.2, §6.4, T13). |
| Q25 | En Era 1 el nacido de la bruma y el feruquimista tienen oro pero no electro (L.372 / PDF 378), así que la regla de meta «pareja Empujón/Tirón» (L.141 / PDF 147) y «puro + aleación» (L.146 / PDF 152) no cubre el oro. ¿Cómo se ofrece? | **Resuelta (4 de octubre de 2026): como elección individual** [inferido]: en `MetalPicker` modo `pareja` / `puro-aleacion-o-atium`, el oro aparece como opción suelta («Oro (sin pareja en esta era)») que crea una meta «Entrenar tus poderes» / «Fabricar tus mentes de metal» para ese único poder (§7.5, T28). |
| Q26 | ¿Qué desbloquea el árbol del camino (`caminoInvestido:<camino>`: Investido, Quemar instintivamente, Mentes de metal ampliadas…) en nacido de la bruma, feruquimista y nacidoble, cuyos talentos principales crean metas por pareja / puro+aleación y no por poder único? El libro solo da el ejemplo del brumoso (L.75 / PDF 81) y para el nacido de la bruma habla de los árboles de los poderes (L.141 / PDF 147) | **Resuelta (4 de octubre de 2026): al menos una meta de nacido del metal del camino concluida** [inferido a partir del ejemplo del brumoso]; los árboles `poder:*` siguen bloqueados poder a poder por su `completo` (§7.7 #3, T36). |
| Q27 | Inferencias de reglas menores sin respaldo literal: (a) `feruquimia.mentesALaVez` solo para feruquimista (ferrin y nacidoble, una mente por poder, sin límite; L.131 / PDF 137, L.146 / PDF 152); (b) el hueco principal de nivel 1 acepta el talento de ruptura/herencia cuando `caminoInicial === 'metal'`; (c) en PNJ Mistborn la fila Investidura solo se muestra si `maxInvestiture > 0` | **Resuelta (4 de octubre de 2026): se adoptan (a), (b) y (c) tal como están escritas** (§6.3, §7.7 #3, §7.8 PNJ); son reglas del mundo Mistborn y viven en `MistbornRules`/`WorldConfig`, no en el núcleo. |

**Decisiones cerradas (4 de octubre de 2026).** Xavi fijó cuatro principios y la especificación los aplica así:

1. *Lo compartido pertenece al universo Cosmere y vive en el núcleo* (P8): fórmulas de la ficha, dado de trama, caminos
   heroicos, combate, aventuras, motor de talentos y componentes. Por eso la base de `aventuras.ts`/`combatRules.ts` se
   neutraliza (Q12 → T23b), las `CatalogOptions` compartidas llevan el valor `cosmere` y el motor que suma
   `bonosAtributos` al modificador de tirada es el mismo en los dos mundos (Q22 → T50).
2. *Lo específico pertenece a un mundo y se resuelve a través de la campaña*: el discriminador se llama **mundo** (`World`,
   `world`, `WorldIds`, `IWorldRules`, `WorldConfig`, `useWorld`; el encargo lo llamaba de otro modo, título y §0), cada
   campaña tiene exactamente un mundo y una era fijados al crear (Q1, Q2), y el **personaje no tiene mundo propio: hereda el
   de su campaña**
   (sin columna `World` en `Characters`). Las reglas específicas (`DesvioBonoSeAcumula`, `TieneInvestidura`, `mentesALaVez`,
   Investidura de clavos…: Q8, Q19, Q24-Q27) viven en `MistbornRules`/`StormlightRules` y en `WorldConfig`.
3. *Una campaña es solo Archivo de las Tormentas, Nacidos Era 1 o Nacidos Era 2*; relacionar mundos o eras queda para más
   adelante (§13).
4. *Convención de nombres*: código interno en inglés (ids, valores, tipos e infraestructura), términos de juego en español en
   los identificadores de dominio y todo texto visible en español (§2).

Respuestas directas: Q1 no; Q2 no (era fija al crear, sin «entre eras»); Q3 sí (T50); Q4 huecos personalizados; Q5 sí; Q6 por
ahora solo el director; Q7 columna `CaminoInicial` (Xavi preguntó si no bastaba con separar las campañas por mundo; no basta:
dentro de una campaña de Bruma un personaje puede empezar por un camino heroico o por uno de nacido del metal, y el motor
necesita saberlo); Q9 sí; Q10 sí por ahora; Q12 sí, opción (2) de §3(h) (T23b); Q22 sí (T50). Las preguntas de interpretación (Q8,
Q14,
Q17, Q19, Q20, Q24-Q27) adoptan la lectura que la especificación ya tenía escrita, por P8; Q13, Q15, Q21 y Q23 quedan fuera de
alcance confirmado (§13); Q11 y Q18 pasan a ser tareas de agente con imágenes (T25b, T38b). No queda ninguna pregunta abierta.

## 13. Fuera de alcance y trabajo futuro

- **Campañas que cruzan las dos eras** (como «El legado de los nacidos de la bruma»): la era se fija al crear (decisión (b)), así
  que en v1 se juegan como dos campañas; relacionar eras o mundos queda para más adelante.
- Aventura **El legado de los nacidos de la bruma** (registro de aventuras por mundo, pestaña «Aventura» en Mistborn, escenas y
  mapas). **Hecho en parte (8 de octubre de 2026):** el registro por mundo es `WorldConfig.libro`, y los 9 capítulos, con sus
  escenas, combates, PNJ y 21 mapas, son el «Libro» de la pantalla del director, filtrado por la era de la campaña
  (`src/data/mistborn/legado/`, `docs/pantalla-director/propuesta.md`). La pestaña «Aventura» de Director sigue siendo solo de
  Archivo de las Tormentas.
- **Guía del mundo** de Scadrial: adversarios y PNJ sembrados (la lista MB nace vacía); iconos oficiales de los 5 caminos de
  nacido del metal (no existen en el libro); emblemas de era.
- Mezcla de ambientaciones con Investidura única (`"mixto"`): `IWorldRules` de unión, overlays aditivos, inventarios por id en
  lugar de por nombre.
- Hemalurgia jugable completa más allá de T49a/T49b (implantar/extraer con tiradas, clavos secretos, robo de atributos), cuerpos
  verdaderos kandra, medallones y mentes desligadas como objetos con cargas, granadas alománticas, savantismo (L.134 / PDF 140;
  L.136 / PDF 142).
- **Lerasium puro** (recompensa de rango 4 o más, L.295 / PDF 301): no es un poder; otorga un talento del camino de nacido de la
  bruma y permite Ruptura de nacido de la bruma aunque ya se tenga otra ruptura o herencia (rompe la exclusividad de
  `CaminoMetal`); +2 de Investidura máxima si ya eres nacido de la bruma. `Origen: "lerasium"` cubre solo la aleación de lerasium.
- **Precio de armas y armaduras de Stormlight** (existe en el libro, no en BD): la columna `Price` queda `NULL` en Stormlight
  (Q13).
- **Compra de viales en la Bolsa → `poderes[].viales`** (Q21): comprar un «Vial de …» no suma viales al poder; los `GearItems`
  con `category === 'vial'` son solo referencia de precio (Enciclopedia → Catálogo; el picker de Equipo de la Bolsa no los
  ofrece, T41) y el recuento vive en `PoderPersonaje.Viales` (`Stepper` del poder o `PATCH …/recursos`).
- Páginas de enciclopedia **Conversaciones** (cap. 11, L.331 / PDF 337) y **Empeños** (cap. 12, L.339 / PDF 345), compartidas por
  ambos mundos con overlay MB: eran T48 y se retiran del plan porque añaden temas que hoy no existen en Stormlight, fuera del
  encargo (diferenciar por mundo las superficies existentes).
- Deuda del núcleo Cosmere, común a ambos mundos (auditoría 2026-10-03): dado de trama d12 → d6 con 20/1 naturales acumulativos
  (`utils/dice.ts:81-90, 137-147`), reacciones por ronda, Sorpresa; ascendencia «Cantor»/«Cantora» en `ValidAscendencias`;
  **`CondicionRegla.LlevaArmaduraTipo` compara el nombre de la armadura equipada con
  «Presentable» (`TalentosReglas.cs:219-221`) en lugar de los `TraitIds` de la armadura vía catálogo**, por lo que «Vestimenta
  tradicional» no se activa con «Uniforme» en ningún mundo (defecto previo; corregirlo cambia Defensas Stormlight, P1).
- Medallones feruquímicos con hasta 3 poderes y uno solo puesto a la vez (L.293 / PDF 299): v1 modela cada poder de medallón como
  un `PoderPersonaje` independiente con 8 cargas (§5.3).
- Nota de Investidura junto a Desprovisto para metales raros (L.131 / PDF 137, a discreción del DJ): no se modela en v1; el GM
  puede quitar `desprovisto` a mano con `PATCH …/recursos { poderes: [{ arte, metal, desprovisto: false }] }` (Q17).
- Columnas estructuradas de artes metálicas en `GlobalNpcEntity` (`Alomancia`, `Feruquimia`, `Poderes`): en v1 van en `Notas`
  (§7.8 PNJ); llegarán con el registro de adversarios de la Guía del mundo.
- Efectos del talento kandra «Forma natural» más allá de la línea situacional de desvío (+5 contra laceración, §6.3): ignorar
  Perforante, lesión mínima 0, inmunidad emocional (L.35 / PDF 41) son solo texto de enciclopedia (la línea situacional la
  implementa T12).
- Hoja de personaje imprimible (hojas L.402-405 / PDF 408-411); exportación.
- Validaciones de reglas en servidor (presupuesto de puntos, prerrequisitos, exclusividad de caminos, era): hoy tampoco existen
  para Stormlight.
- Tabla hija `CharacterPoderes` (patrón `MetaEntity`, índice único `(CharacterId, Arte, Metal)`) si el JSON `Poderes` da problemas
  de concurrencia o hace falta consultar por metal.
- Notificación SignalR de cambios de recursos de mesa (hoy el único evento es `DiceRollReceived`).
- Eliminación de columnas obsoletas (`MaxConcentration`, `MaxInvestiture`) y de `src/data/sessions.ts` (muerto).
- Páginas de Características (cap. 3), Terreno/tamaño/caídas (cap. 10) y Dado de trama en la enciclopedia.

## 14. Trazabilidad

Fuentes de esta especificación. Los informes de lectura, los mapas y las propuestas se generaron en el scratchpad temporal de la
sesión y el 4 de octubre de 2026 se copiaron a `cosmere-web/docs/nacidos-de-la-bruma/` con los nombres de anexo indicados abajo
(§0 «Anexos»); el texto íntegro del manual está en `cosmere-api/Resources/pdfextract/mistborn_flow.txt`. **Este documento
prevalece sobre anexos y propuestas**: los informes y las tres propuestas conservan el diseño anterior a las decisiones del 4 de
octubre (era editable y «entre eras», `PATCH /campaigns/{id}/settings`, picker de camino de nacido del metal abierto al jugador,
nombres de clase en español como `IReglasSet`) y el vocabulario anterior al cierre del 4 de octubre: hablan de «set de reglas»
y usan `RuleSet`, `IRuleSet`, `RuleSetConfig` o `IReglasSet` donde este documento dice **mundo**, `World`, `IWorldRules` y
`WorldConfig` (§2 «Mundo» y «Convención de nombres»). No se han parcheado: ante cualquier diferencia manda este documento y,
donde este documento calle, el principio P8. Directorio de trabajo
original, del que cuelgan los nombres de las listas siguientes:

```text
C:/Users/xavie/AppData/Local/Temp/claude/C--Users-xavie-Documents-Repositories-personal-cosmere-web/664137b1-bed4-450a-88ae-c1b3fb8e1e0c/scratchpad
```

### Mapas (3)

- `api_map.md`: mapa del modelo de la API (entidades, DTOs, servicios, migraciones, seeds), con archivo:línea. Anexo T00a:
  `01-mapa-api.md`.
- `web_map.md`: mapa del frontend (flujo de campaña, ficha, datos estáticos, dados, tipos, rutas, iconos, tema). Anexo T00a:
  `02-mapa-web.md`.
- `mistborn_rules_summary.md`: resumen de reglas del manual *Nacidos de la bruma* orientado al modelo de datos, con páginas.
  Anexo T00a: `10-resumen-reglas-mistborn.md`.

### Informes de lectura (7)

- `lectura_superficie_ui.md`: superficies de interfaz y de estado que deben volverse conscientes del mundo; creación de campaña,
  tema, iconografía y dados. Anexo T00a: `03-superficie-ui.md`.
- `lectura_motor_reglas_api.md`: contrato del motor de reglas del servidor y puntos de enganche para un mundo. Anexo T00a:
  `04-motor-reglas-api.md`.
- `lectura_motor_talentos_web.md`: motor de talentos del frontend y forma que deben tener los caminos de nacido del metal y los
  poderes de metal. Anexo T00a: `05-motor-talentos-web.md`.
- `lectura_delta_reglas_base.md`: delta de reglas base entre Archivo de las Tormentas y Nacidos de la Bruma (`aventuras.ts`,
  `combatRules.ts`). Anexo T00a: `06-delta-reglas-base.md`.
- `lectura_delta_catalogo.md`: delta de catálogo (armas, armaduras, equipo, viales, divisa y equipo inicial, cap. 7) frente al
  seed actual. Anexo T00a: `07-delta-catalogo.md`.
- `lectura_alomancia_inventario.md`: inventario de la alomancia (cap. 6) y esquema de datos. Anexo T00a:
  `08-inventario-alomancia.md`.
- `lectura_feruquimia_hemalurgia_inventario.md`: inventario de feruquimia, hemalurgia y caminos de nacido del metal.
  Anexo T00a: `09-inventario-feruquimia-hemalurgia.md`.

### Propuestas (3)

- `propuesta_A.md`: riesgo mínimo e incremental. Aporta el esqueleto, las salvaguardas y el plan ejecutable por agentes
  (ganadora).
- `propuesta_B.md`: registro de mundos («sets» en la propuesta) dirigido por datos. Aporta el modelo de personaje tipado, el
  registro de configuración, `DerivadosSet` y la era como texto.
- `propuesta_C.md`: dominio primero. Aporta las fórmulas completas de artes metálicas, las acciones de dominio, las Bendiciones
  estructuradas y las reglas del selector de metales.

### Otras fuentes

- Texto íntegro del manual *Nacidos de la bruma*: `mistborn_flow.txt` (416 páginas; PDF = L.+6), en `<flowPath>`
  (`cosmere-api/Resources/pdfextract/`, ignorada por git y, desde T00b, por Docker; no se commitea), y su lector `pg.sh`
  (`docs/nacidos-de-la-bruma/fuentes/`).
- Extractos de *Archivo de las Tormentas*: `cosmere-api/Resources/pdfextract/ch3_chars.txt`, `ch10_combat.txt` y `ch4_full.txt`;
  auditoría previa app-contra-libro: `cosmere-web/docs/auditoria-reglas-2026-10-03.md`.
- Convenciones del proyecto: `CLAUDE.md` (raíz y `cosmere-web/`) y `cosmere-web/DESIGN.md`.
- Código: lectura directa del árbol de trabajo de `cosmere-api` y `cosmere-web`, incluido el trabajo en curso sin commitear de las
  formas de cantor (`CharacterService.cs`, `TalentosReglas.cs`, `CharacterResponse.cs`, `FormasCantor.cs`).

### Páginas del manual más usadas

| Páginas (libro / PDF) | Tema | Dónde pesan |
|---|---|---|
| L.17-19 / PDF 23-25 | Creación: camino inicial, habilidad inicial por camino de nacido del metal | §2, decisión (k), T27, T28, T36 |
| L.26-29 / PDF 32-35 | Derivados al crear (Investidura inicial 0, salud, concentración, defensas) | §1, §6.3, T12 |
| L.32-39 / PDF 38-45 | Ascendencias (humano, kandra, sangre koloss) y Bendiciones kandra (L.34-35 / PDF 40-41) | §2, T20, T27, T29, Q16 |
| L.127-159 / PDF 133-165 | Caminos de nacido del metal: talentos principales y metas (L.128, 132-133, 135, 141, 146); Componedor (L.155) | §2, T19, T28, T33, Q25, Q26 |
| L.129-131 / PDF 135-137 | Investidura, viales, Desprovisto y mentes de metal | §6.3, T13, T30, T31, Q17, Q23, Q24 |
| L.162-163 / PDF 168-169 | Poder naciente y completo; progresión de las artes metálicas (límite, dado, alcance, cargas) | T12, T16, T43 |
| L.166-250 / PDF 172-256 | Metales (L.166-171) y entradas de alomancia (L.172-212) y feruquimia (L.213-250) | T16, T17, T18, T24b |
| L.284 / PDF 290 | Conclusión de metas y recompensa | T14, Q20 |
| L.288-295 / PDF 294-301 | Recompensas: clavos, medallones, aleación de lerasium y lerasium; hemalurgia | T22, T49a, Q19, §13 |
| L.371-375 / PDF 377-381 | Eras (L.372 / PDF 378: metales por camino y era) y mezcla de ambientaciones | decisiones (a) y (b), Q1, Q25 |
| L.404 / PDF 410 | Hoja de personaje de artes metálicas | §7.6, T30 |
