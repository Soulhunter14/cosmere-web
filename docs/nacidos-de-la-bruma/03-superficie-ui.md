# Lectura de superficie UI y estado: Nacidos de la Bruma como set de reglas

Alcance: frontend `cosmere-web` (React 19, TS, Vite). Solo lectura. Este informe es autosuficiente: lista cada superficie de UI y de estado que debe volverse consciente del set de reglas, con el texto o símbolo exacto a cambiar, y propone el diseño de creación de campaña, el estado, el tema, la iconografía y los dados.

## 0. Convenciones y estado del árbol

- Rutas relativas a `cosmere-web/src/` salvo `index.html`, `vite.config.ts`, `DESIGN.md` (raíz de `cosmere-web/`). Formato `archivo:línea`.
- Manual: `L.<página libro> / PDF <página>` (PDF = libro + 6). Hoja de personaje: L.402-405 / PDF 408-411.
- `[inferido]` marca decisiones de diseño o lecturas no literales. Todo lo demás está verificado leyendo código, texto del manual o el PDF.
- Las líneas son del árbol de trabajo actual. `pages/characters/CharacterDetailPage.tsx` y `types/index.ts` tienen cambios sin commitear de otra sesión (formas de cantor, `desvioCalculado`, desgloses). Las líneas de esos dos archivos pueden desplazarse unas decenas al integrar: anclar por el texto, no por el número. La especificación no debe pisar ese trabajo.
- Identificadores propuestos: `RuleSetId = 'stormlight' | 'mistborn'`. Los campos de personaje (`fuerza`, `armasLigeras`, `conocimiento`, `habilidadPersonalizadaN`...) no se renombran (regla de lenguaje de dominio del proyecto); solo cambian las etiquetas visibles.

## 1. Hallazgos que condicionan el diseño

1. **Hoy no existe ningún concepto de ambientación en el frontend.** Un `grep` de `mistborn|alomancia|feruquimia|hemalurgia|nacidos` no da resultados reales (solo falsos positivos como «abrumar» y «brumaspren»).
2. **La campaña se crea en un único sitio** (`pages/campaigns/CampaignListPage.tsx`, `InlineForm`, un campo de texto) y **no hay edición de campaña** (ni renombrar). Un `ruleSet` fijado al crear encaja con el código actual. La era sí podría ser editable (ver §4.4).
3. **Cada superficie de la ficha lee un `Character` plano** con los mismos 6 atributos y 18 habilidades en ambos sets (hoja L.402 / PDF 408). Lo que cambia es identidad, recursos y artes metálicas, no el esqueleto de la ficha.
4. **Hay cuatro tablas de habilidades independientes** (ficha `CharacterDetailPage.tsx:385-431`, tirador `DiceRoller.tsx:25-55`, `lib/talentGraph.ts:65-81`, NPC `GlobalNpcDetailPage.tsx:17-54`) y ya discrepan entre sí (auditoría `docs/auditoria-reglas-2026-10-03.md`). Añadir un segundo set sin unificarlas multiplica el problema.
5. **Los nombres «Armas ligeras/pesadas» y «Conocimiento» no son de ningún libro.** Tanto el manual de Tormentas (ch3_chars.txt: «Armamento ligero, Armamento pesado… Saber») como la hoja de Nacidos de la Bruma (L.402 / PDF 408) usan «Armamento ligero», «Armamento pesado» y «Saber». La app los llama «Armas Ligeras» (`CharacterDetailPage.tsx:393-394`), «Conocimiento» (`:412`, `GlobalNpcDetailPage.tsx:39`) y «Saber» solo en el tirador (`DiceRoller.tsx:29`). No es una diferencia entre sets: es una deuda previa que conviene resolver con la tabla única.
6. **El tirador ya resuelve habilidades personalizadas por nombre** (`DiceRoller.tsx:75-85`, `getCharMod`) y las añade a la lista (`getCharSkills`, `:90-97`). Si Alomancia (VOL) y Feruquimia (INT) se guardan en los huecos `habilidadPersonalizadaN` con su código de atributo, ya aparecen y tiran en las pestañas Habilidad y Enfrentada sin tocar el tirador. Solo hace falta cambiar la pestaña Combate (§8).
7. **Los huecos de habilidad personalizada son 2 por columna** (`CharacterDetailPage.tsx:399/414/429` `customNs`; mapa `ATRIBUTO_SLOTS` `:374-376`). La hoja impresa tiene 1 línea en blanco por columna (L.402 / PDF 408). Alomancia (VOL) y Feruquimia (INT) son ambas cognitivas: un nacidoble ocupa los dos huecos cognitivos y no queda ninguno libre. Decisión a tomar: hueco dedicado o ampliar (ver §9).
8. **Datos globales no segmentados por set**: catálogo de armas/armaduras/equipo (`api/catalog.ts`, global y sin filtro) y NPC globales (`api/global-npcs.ts`, `/global-npcs`, sin `campaignId`). Los inventarios del personaje son listas de **nombres** (`Character.weapons/armor/equipment: string[]`, `types/index.ts`) y se resuelven con `find(w => w.name === name)` (`BolsaDetailPage.tsx:243-245`): dos objetos homónimos de sets distintos (p. ej. «Arco corto») colisionan.
9. **Las claves de caché del catálogo ya son incoherentes**: `['catalog-weapons']` en `CatalogPage.tsx:881` frente a `['catalog','weapons']` en `BolsaDetailPage.tsx:160`; `['global-npcs']` en 3 sitios (`GlobalNpcListPage.tsx:97`, `GlobalNpcDetailPage.tsx:147`, `NpcNotesPage.tsx:421`). Hay que meter `ruleSet` en todas.
10. **Condición de carrera de hidratación ya existente**: `AppLayout.tsx:13-17` hace `getById().then(setCurrentCampaign)` sin gate. Mientras llega, la UI usa el `currentCampaign` persistido de **otra** campaña, incluido `isGm` (un director puede ver un instante la vista de jugador). Con dos sets, el set equivocado se vería durante ese instante.
11. **La paleta de marca es un único eje** (`--brand*`, 61 usos de `var(--brand` y 93 de `tone.brand`/`c.brand`), así que reteñirla por set es una sola capa de CSS (ver §6). `index.html` y `vite.config.ts` no se pueden parametrizar por campaña.
12. **Dos objetos oficiales vectoriales están disponibles**: el PDF de Nacidos de la Bruma incrusta las fuentes `MistbornAllomantic-Era1` y `MistbornAllomantic-Era2` (verificado en PDF 411, 29 y 25 glifos extraíbles) y los glifos feruquímicos como trazados vectoriales (118 trazados en 24 filas). Se pueden extraer igual que los de Stormlight (§7).

## 2. Tabla de superficies (cambios por área)

Verbos: **PARAMETRIZAR** (mismo componente, datos o etiquetas del set), **RENOMBRAR**, **OCULTAR** (no existe en Nacidos de la Bruma), **SUSTITUIR** (otro componente/dato), **NUEVO**. «NB» = Nacidos de la Bruma; «ST» = Archivo de las Tormentas.

### A. Contrato, tipos y estado

| ID · Superficie | Archivo:línea | Hoy | En NB |
|---|---|---|---|
| A1 · Tipo `Campaign` / `CampaignDetail` | `types/index.ts:14-27` | `{id,name,role,createdAt,nextSession*}`; sin ambientación | NUEVO: `ruleSet: RuleSetId`, `era?: 'era1'\|'era2'\|'ambas'\|null`. Obligatorio en respuesta de lista (`GET /campaigns`), detalle y `POST /campaigns` |
| A2 · `campaignsApi.create` | `api/campaigns.ts:10-11` | `create(name)` → `POST /campaigns {name}` | PARAMETRIZAR: `create({name, ruleSet, era})`. `join` devuelve `Campaign` (`:15-16`): también con `ruleSet` |
| A3 · `campaignStore` | `store/campaignStore.ts:5-20` | `currentCampaign`, `isGm` (derivado al escribir, `:17`), persistido `cosmere-campaign` | NUEVO: selector `useRuleSet()` sin duplicar estado (§5) |
| A4 · Hidratación | `components/AppLayout.tsx:13-17` | `getById(id).then(setCurrentCampaign).catch(()=>{})`, sin gate | PARAMETRIZAR: gate `currentCampaign?.id === campaignId`, `data-ruleset` en `<html>`, estado de error con reintento (§5) |
| A5 · `themeStore` | `store/themeStore.ts:12, 19-32` | `THEME_BG = {light:'#e8ecf1', dark:'#0a0e15'}` fijo; `applyTheme(mode)` | PARAMETRIZAR: `THEME_BG` por set y `applyTheme(mode, ruleSet)` |
| A6 · Tipo `Character` | `types/index.ts:50-134` | `caminoRadiante:59`, `idealesJurados:61`, `maxInvestiture:72` (obsoleto), `marcosInfusas/Opacas:84-85`, `spells:131`, `conexiones` sin render | PARAMETRIZAR: campos de ST se quedan (no se borran); NUEVO los de NB los define el equipo de datos. La UI no debe leer `caminoRadiante`/marcos si `ruleSet==='mistborn'` |
| A7 · `CreateCharacterRequest` | `types/index.ts:138`; `CharacterListPage.tsx:254-258` | envía `ascendencia:'', caminoHeroico:'', caminoRadiante:''` | PARAMETRIZAR: el servidor debe tomar el set de la campaña; la UI no envía `caminoRadiante` en NB |
| A8 · `DiaryMentionType` | `types/index.ts:175` | `'pj'\|'npc'\|'spren'\|'faction'\|'unknown'` | Se mantiene el tipo (el parser sigue aceptando `[[spren - X]]`); la UI oculta la leyenda `spren` en NB (G1) |
| A9 · `GlobalNpc` | `types/index.ts:210ss`; `api/global-npcs.ts` | global, `source` texto libre (los 34 sembrados: «Caminapiedras») | PARAMETRIZAR: `ruleSet` por NPC y `getAll({ruleSet})` (F3) |
| A10 · Catálogo | `types/index.ts:328ss` `WeaponCatalog`, `ArmorCatalog`, `GearItem`; `api/catalog.ts:21-37` | solo `GearItem` tiene `price`; armas y armaduras sin precio | PARAMETRIZAR: `ruleSet` en cada entrada y en `getWeapons/getArmor/getGear/getOptions`; NUEVO `price` en armas y armaduras (NB da precio a todo, L.258-266) |
| A11 · Claves TanStack Query | `CatalogPage.tsx:881-892`, `BolsaDetailPage.tsx:160-170`, `GlobalNpc*Page`, `NpcNotesPage.tsx:421` | `['catalog-weapons']`, `['catalog','weapons']`, `['opts',X]`, `['global-npcs']` | PARAMETRIZAR: unificar en una función `queryKeys.catalog(ruleSet, 'weapons')` y añadir `ruleSet` a `global-npcs` y `opts`. Invalidar con el mismo prefijo |

### B. Shell y navegación

| ID · Superficie | Archivo:línea | Hoy | En NB |
|---|---|---|---|
| B1 · Bloque de campaña (escritorio) | `components/Sidebar.tsx:153-168` | eyebrow «Campaña», nombre, pill «Director de juego»/«Jugador» | NUEVO: segunda pill con el set y la era («Nacidos de la bruma · Era 2») bajo el nombre; componente `RuleSetBadge` |
| B2 · Carril de tableta | `components/Sidebar.tsx:261-268` | punto de rol con `title` | PARAMETRIZAR: añadir el set al `title`/`aria-label` |
| B3 · Barra superior móvil | `components/Sidebar.tsx:353-357` | eyebrow «Director»/«Jugador» | PARAMETRIZAR: añadir «· NB»/«· Tormentas» o glifo del set (`eyebrow` de 11 px) |
| B4 · Navegación principal | `components/Sidebar.tsx:38-54` | Inicio, Partida, Enciclopedia; jugador Personaje; director Personajes, Director | Sin cambio de estructura. «Director» se mantiene. El contenido de cada destino cambia (D, E, F) |
| B5 · Etiquetas de sección | `components/Sidebar.tsx:13-25` | mapa `SECTION_LABELS` | Sin cambio (las rutas nuevas cuelgan de `encyclopedia/`) |
| B6 · Marca | `components/BrandMark.tsx:4-13, 16-32`; `Sidebar.tsx:124, 255, 343` | emblema Cosmere `cosmere-emblem` con `drop-shadow(var(--brand-glow))`; subtítulo «Compañero de mesa» | Sin cambio: marca genérica Cosmere. El glow cambia solo al cambiar `--brand-glow` (§6) |
| B7 · Montaje del tirador | `components/AppLayout.tsx:30` | `<DiceRoller/>` siempre | Sin cambio; el tirador lee el set por hook (H) |
| B8 · Rutas | `App.tsx:46-66` | `encyclopedia/radiant-orders`, `heroic-paths`, `combat`, `aventuras`, `potencias`; `personajes/...`; `gm/...` | NUEVO: rutas de NB (`encyclopedia/nacidos-del-metal`, `encyclopedia/artes-metalicas`, `encyclopedia/origenes`) y un `RuleSetGate` que redirige a `../encyclopedia` si se abre una ruta de otro set (enlace guardado o marcador) |
| B9 · Pantallas sin campaña | `LoginPage.tsx:127`, `RegisterPage.tsx:148` (halo Stormlight), `CampaignListPage.tsx:183` (`BrandMark subtitle="RPG"`) | marca genérica | Sin cambio: no hay `data-ruleset` fuera de `/campaigns/:id/*` |

### C. Campañas

| ID · Superficie | Archivo:línea | Hoy | En NB |
|---|---|---|---|
| C1 · Formulario de creación | `CampaignListPage.tsx:16-91, 222-235` | `InlineForm`: título «Nueva campaña», input «El nombre de tu campaña...», botón «Crear» | SUSTITUIR: `Sheet` con nombre + Ambientación + Era (§4.2). `InlineForm` queda para «Unirse» |
| C2 · Mutación de crear | `CampaignListPage.tsx:131-138` | `campaignsApi.create(newName)`; `setCurrentCampaign(campaign)`; `navigate(.../home)` | PARAMETRIZAR: enviar `ruleSet`, `era`; la respuesta debe traerlos (si no, el store queda sin set) |
| C3 · Tarjeta de campaña | `CampaignListPage.tsx:343-478` (cubierta `:394`, chip de rol `:411-414`, pie `:421-476`) | cubierta con gradiente por `characterHeroBackground(id)`, chip «Director»/«Jugador» | NUEVO: chip del set en la cubierta (esquina opuesta al rol) y chip «ERA 1»/«ERA 2» (§4.3). `CampaignCard` recibe `ruleSet`, `era` |
| C4 · Abrir campaña | `CampaignListPage.tsx:154-163` | `getById` → `setCurrentCampaign` → navega | Sin cambio (ya espera el detalle antes de navegar) |
| C5 · Ajustes | `CampaignSettingsPage.tsx:54-60, 140-163` | invitaciones, cuenta, miembros; sin sección de reglas | NUEVO: sección «Ambientación» solo lectura (set, era); era editable por el director opcional (§4.4). Su `queryKey ['campaign', id]` (`:28`) duplica el fetch de `AppLayout`: unificar |
| C6 · Inicio | `pages/home/HomeCampaignPage.tsx:47-57` | `h1` nombre + pill de rol | NUEVO: `RuleSetBadge` junto a la pill de rol |
| C7 · Tarjeta de próxima sesión | `HomeCampaignPage.tsx:100, 135` | imagen `dado-d20`, medallón dorado | Sin cambio (activos del núcleo Cosmere compartidos) |

### D. Personajes

| ID · Superficie | Archivo:línea | Hoy | En NB |
|---|---|---|---|
| D1 · Hero del jugador | `pages/personajes/PersonajesPage.tsx:169-170, 250-261` | pills de camino heroico (`HeroicPathIcon`) y orden radiante (`RadiantOrderIcon`) | PARAMETRIZAR: pill de camino heroico igual; en lugar de la orden, pill del camino de nacido del metal (glifo de metal o icono Lucide, §7); `Nv. N` igual |
| D2 · Mosaico «Bolsa» | `PersonajesPage.tsx:173, 201-211` | imagen `esfera-broam-esmeralda`, subtítulo «Inventario, marcos y equipo» | SUSTITUIR: imagen `dinero-era1`/`dinero-era2` (§7) y subtítulo «Inventario, arquillas y equipo» |
| D3 · Tab «Talentos» | `PersonajesPage.tsx:28-33, 195-200` | etiqueta y subtítulo «Habilidades especiales de tu personaje» | Sin cambio de etiqueta. NUEVO: mosaico/tab «Artes metálicas» solo si el personaje tiene poderes (§9) |
| D4 · Lista de personajes | `characters/CharacterListPage.tsx:88-90, 133-148, 151-156` | `path` + `order` (pills), «Nv. N · {ascendencia\|Sin ascendencia}» | PARAMETRIZAR: la segunda pill muestra el camino de nacido del metal; resto igual |
| D5 · Alta de personaje | `CharacterListPage.tsx:253-258, 320-382` | Sheet «Nuevo personaje»: nombre + jugador | Sin cambio de UI; ver A7 |
| D6 · Selector de personaje (Metas) | `personajes/MetasPage.tsx:24-26, 61-76` | duplicado de pills `path`+`order`; mismo patrón en `TalentosPage.tsx:23-24, 85`, `BolsaPage.tsx:24-25, 86` | PARAMETRIZAR: extraer `CharacterIdentityPills` y sustituir los 4 duplicados (MetasPage, TalentosPage, BolsaPage, CharacterListPage) |
| D7 · Metas, hero | `MetasDetailPage.tsx:348-381` | `order` por `caminoRadiante`, pills | PARAMETRIZAR: igual que D6 |
| D8 · Metas, contenido | `MetasDetailPage.tsx:24-28, 34-60` | 3 hitos; conclusión Éxito / Crecimiento / Fracaso | Sin cambio (mismas reglas, L.283-284 / PDF 289-290). NUEVO: las **metas de nacido del metal** no las concede el director sino un talento (L.283 / PDF 289): etiqueta «Meta de nacido del metal» y casilla «completada» ligada al poder (los datos los define el equipo de modelo) |
| D9 · Talentos, selector | `TalentosPage.tsx:99-105, 144` | chips de presupuesto (`talentBudget`) | Sin cambio de UI; los datos del grafo cambian (el motor de talentos es de otros agentes) |
| D10 · Talentos, detalle | `TalentosDetailPage.tsx:299, 355` (orden), `:314, 496-510, 707-753` (Ideales jurados, `IdealesControl`, `IdealGlyph`), `:447` («Asigna un Camino Heroico u Orden Radiante en la ficha…»), `:452-460, 512-548` (cantor, formas) | UI de Ideales, formas de cantor, orden radiante | OCULTAR: Ideales, formas, orden. RENOMBRAR `:447` («…o un camino de nacido del metal»). NUEVO placas del atlas `kind` NB (`talentMap.ts:61` `'heroico'\|'radiante'\|'cantor'` ampliar a `'poder'\|'nacido-metal'\|'kandra'\|'koloss'`; el trabajo del motor es de otros) |
| D11 · Bolsa selector | `BolsaPage.tsx:19-20, 27, 93-103` | imagen `esfera-marco-diamante`, «N marco(s)» | SUSTITUIR: «N arquilla(s)» con imagen de dinero o icono `Coins` |
| D12 · Bolsa, hero | `BolsaDetailPage.tsx:229-230, 313-328` | pills heroico + orden | PARAMETRIZAR (D6) |
| D13 · Bolsa, Marcos | `BolsaDetailPage.tsx:32-33, 332-429, 581-610` | sección «Marcos» (Infusas/Opacas, «brillantes»/«apagadas», «Apagar un Marco infuso», «Recargar un Marco opaco», diálogo «Añadir Marcos»/«Gastar Marcos») | SUSTITUIR por sección «Arquillas»: un único contador con `Stepper`, diálogo «Añadir/Gastar arquillas»; sin estado infuso/opaco. `ar`, óbolo 0,01 ar, nota = 10 ar (L.254 / PDF 260) |
| D14 · Bolsa, capacidad | `BolsaDetailPage.tsx:233-241` | tabla de **carga** 22,5/45/112,5/225/1125/2250 kg por Fuerza (0, 1-2, 3-4, 5-6, 7-8, 9+) | PARAMETRIZAR: NB usa carga 25/50/125/250/1250/2500 kg y levantamiento 50/100/250/500/2500/5000 kg (L.50 / PDF 56). ST: 45/90/225/450/2250/4500 y 22,5/45/112,5/225/1125/2250 (ch3_chars.txt p. 48) |
| D15 · Bolsa, listas | `BolsaDetailPage.tsx:475-479, 616-618` | «Armas», «Armaduras», «Equipo» por nombre del catálogo | PARAMETRIZAR: catálogo del set (A10/A11). Etiqueta de peso «kg» igual |
| D16 · Bolsa, precio | `BolsaDetailPage.tsx:785`; `CatalogPage.tsx:149-156` | `{price} mc` con imagen `esfera-marco-diamante` | SUSTITUIR: `{price} ar` con icono de dinero |
| D17 · Ficha, hero | `CharacterDetailPage.tsx:603-629` | `Nv.`, `Rango N` (`ornamento-rombo`), «{ascendencia\|Sin ascendencia} · {jugador}» | Sin cambio. Rango y niveles iguales (L.27-29 / PDF 33-35) |
| D18 · Ficha, botón Forma | `CharacterDetailPage.tsx:509, 685-700` (`isCantor`, botón «Forma: …», pill «PODER») | solo si `ascendencia==='Oyente'` | OCULTAR (NB no tiene formas) |
| D19 · Ficha, Identidad | `CharacterDetailPage.tsx:704-743` | 3 `IdentityItem`: «Ascendencia», «Camino», «Orden» (`RadiantOrderIcon` o `cosmere-emblem`) | PARAMETRIZAR: «Ascendencia» (Humano, Kandra, Sangre koloss), «Camino» (heroico), tercera ficha «Camino de nacido del metal» en lugar de «Orden». La hoja del libro tiene un único campo «Caminos» (L.402 / PDF 408) |
| D20 · Ficha, Ascendencias | `CharacterDetailPage.tsx:433-436` | `Humano`, `Oyente` (iconos `UserRound`, `AudioWaveform`) | PARAMETRIZAR: `Humano`, `Kandra`, `Sangre koloss` (esta última solo Era 2, L.38 / PDF 44). Iconos Lucide: `UserRound`, `VenetianMask`, `Mountain` [inferido] |
| D21 · Ficha, Investidura | `CharacterDetailPage.tsx:777, 827-833` | `esRadiante = !!f.caminoRadiante`; sin camino: «Solo disponible para Radiantes»; icono `StatIcons.investidura` (`Gem`) | PARAMETRIZAR: `tieneInvestidura` por set; texto «Solo disponible para alomantes» (brumoso, nacido de la bruma, nacidoble; L.57 / PDF 63). Misma fórmula 2 + máx(DIS,PRE) (L.57) |
| D22 · Ficha, Concentración y Salud | `CharacterDetailPage.tsx:332-341, 766-774, 530-536` | `2 + VOL`; salud 10+FUE y tabla de progreso; ya vienen del servidor | Sin cambio (misma fórmula, L.56 / PDF 62; tabla de progreso L.29 / PDF 35) |
| D23 · Ficha, dado de recuperación y sentidos | `CharacterDetailPage.tsx:814-815` | d4/6/8/10/12/20; alcance 1,5/3/6/15/30/«Sin límite» | Sin cambio (tablas idénticas, L.51-52 / PDF 57-58) |
| D24 · Ficha, movimiento | servidor (`movimiento`); copia en tirador no hay | 6/7,5/9/12/18/24 m por acción | Sin cambio (L.51 / PDF 57) |
| D25 · Ficha, aviso de puntos | `CharacterDetailPage.tsx:357-363, 932-966` | `getPuntosAtributoEsperados`: 12 + 1 en 3, 6, 9, 12, 15, 18 | PARAMETRIZAR: base 12 (humano, koloss) o **6 (kandra)** (L.34 / PDF 40); koloss sin cambio de total (solo máximo de FUE +1 y hasta 4 en FUE). Mismo resto |
| D26 · Ficha, tope de atributo | `CharacterDetailPage.tsx:1018` (`max={5}`) | tope 5 | PARAMETRIZAR: koloss máx. FUE 6 y Bendiciones kandra suben máximos (L.34-38 / PDF 40-44). `max` dinámico |
| D27 · Ficha, secciones de habilidad | `CharacterDetailPage.tsx:385-431` | etiquetas «Armas Ligeras», «Armas Pesadas», «Conocimiento»; Atletismo con `velocidad`/`VEL` (`:395`) | PARAMETRIZAR: etiquetas del libro «Armamento ligero», «Armamento pesado», «Saber»; **Atletismo (FUE)** (hoja L.402 / PDF 408: «ATLETISMO (FUE)») |
| D28 · Ficha, habilidades personalizadas | `CharacterDetailPage.tsx:1092-1175`, `ATRIBUTO_SLOTS :374-376`, `ATTR_MAP :365-368`, select `:1127` | huecos 1-6; `isPotencia = radiantOrder?.surges.includes(...)` (`:1105`) pinta `SurgeIcon` | SUSTITUIR `isPotencia` por `esArteInvestida` (Alomancia, Feruquimia) y `SurgeIcon` por icono Lucide `Flame`/`Anvil` [inferido]; el campo de nombre queda bloqueado para estas dos |
| D29 · Ficha, pickers | `CharacterDetailPage.tsx:1250-1360` | Ascendencia, «Camino Heroico» (descripción «Puedes tener varios caminos heroicos…»), «Cambiar de forma» (sublabel «vacíospren»), «Camino Radiante» («Al guardar, los talentos y potencias de la orden anterior se sustituyen…») | PARAMETRIZAR: Ascendencia con 3 opciones (Era 1: sin koloss). OCULTAR forma y radiante. NUEVO picker «Camino de nacido del metal» (5 caminos; excluyentes; elección en cualquier nivel por su talento principal, L.127-128; filtrado por era, §4.3) |
| D30 · Ficha, pestañas | `CharacterDetailPage.tsx:443-449` | `caracteristicas`, `atributos`, `background` | NUEVO: pestaña «Artes metálicas» (hoja L.404 / PDF 410) cuando hay poderes (§9) |
| D31 · Ficha, Trasfondo | `CharacterDetailPage.tsx:438-441, 1207-1245` | Propósito, Obstáculo, Apariencia, Notas | Sin cambio (la hoja: aspecto, propósito, obstáculo, notas, conexiones, L.403 / PDF 409). `conexiones` ya existe en el tipo pero no se pinta: opcional |

### E. Enciclopedia y catálogo

| ID · Superficie | Archivo:línea | Hoy | En NB |
|---|---|---|---|
| E1 · Cabecera | `pages/encyclopedia/EncyclopediaPage.tsx:210` | «Lore y referencia del mundo de Roshar» | RENOMBRAR: «Lore y referencia del mundo de Scadrial» (por set) |
| E2 · `TOPICS` | `EncyclopediaPage.tsx:109-197` | 6 temas: Órdenes Radiantes, Caminos Heroicos, Combate, Potencias, Aventuras, Catálogo; descripciones `:113, :125, :140, :158, :174, :189` | PARAMETRIZAR: `TOPICS` por set. NB: Orígenes (ascendencias y culturas), Caminos Heroicos, **Caminos de nacido del metal**, **Artes metálicas** (16 metales + atium; hemalurgia solo texto, L.251), Combate, Aventuras, Catálogo. OCULTAR Órdenes Radiantes y Potencias |
| E3 · Emblemas de los temas | `EncyclopediaPage.tsx:117-120, 162-168, 191-195`, `SURGES :16` | `OrderGlyph`, `SurgeIcon`, `esferas-fila` | SUSTITUIR por glifos de metales (§7) y la imagen de dinero; `COMBAT_ACTIVATIONS` y `AVENTURAS_EMBLEMS` se reutilizan |
| E4 · Páginas ST | `RadiantOrdersPage.tsx` (subtítulo `:358`), `PotenciasPage.tsx` | contenido solo ST | OCULTAR en NB + `RuleSetGate` (B8) |
| E5 · Caminos heroicos | `HeroicPathsPage.tsx:250` | subtítulo «…de cada héroe en Roshar»; datos `data/heroicPaths.ts` | RENOMBRAR el subtítulo («…en Scadrial»); las especialidades difieren por set y era (Mataneblinos, Inventor, Pistolero solo NB, L.374-375) |
| E6 · Combate | `CombatPage.tsx:68`; `data/combatRules.ts:103` | subtítulo «…del Archivo de las Tormentas»; texto con poderes radiantes | RENOMBRAR el subtítulo; filtrar por set los fragmentos que citan Radiantes/luz tormentosa |
| E7 · Aventuras | `AventurasPage.tsx`; `data/aventuras.ts:148,169,206,213,277` | reglas de escenas, descanso, estados, daño con menciones a alta tormenta, absorber luz tormentosa, hojas esquirladas | PARAMETRIZAR: etiquetar esos fragmentos por set. NUEVO: «Beber vial» y estado «Desprovisto» (L.129-131 / PDF 135-137) |
| E8 · Catálogo | `CatalogPage.tsx:29-31, 36, 149-156, 910-912`; `EncyclopediaPage.tsx:186-196` | «Armas/Armaduras/Equipo»; moneda `mc` + esfera; subtítulo «Equipo disponible en el sistema»; tema «…mundo de Roshar» | PARAMETRIZAR: datos por set y era (armas de fuego solo Era 2, L.262 / PDF 268); `ar`; descripción «…mundo de Scadrial». NUEVO: «Viales» (metales raros, L.267 / PDF 273) |

### F. Director y NPC

| ID · Superficie | Archivo:línea | Hoy | En NB |
|---|---|---|---|
| F1 · Tabs del director | `pages/gm/GmPage.tsx:8-12, 16-20, 49-53` | NPCs, Mensajes, **Aventura** (`caminapiedras`) | OCULTAR «Aventura» en NB v1 (solo existe Caminapiedras, ST). Hueco futuro: registro de aventuras por set (el PDF `SPA_NacidosBruma_Legado.pdf` está en `Downloads/Español`) |
| F2 · Cabecera de aventura | `CaminapiedrasPage.tsx:822-833` | `archivo-tormentas` (56 px), «Caminapiedras» | Sin cambio (solo ST) |
| F3 · NPC, lista | `GlobalNpcListPage.tsx:96-98, 127-130, 163, 185` | `queryKey ['global-npcs']`; subtítulo «N adversario(s) del libro» | PARAMETRIZAR: filtrar por set; vacío «Sin adversarios todavía» pasa a tener sentido real en NB (no hay apéndice sembrado) |
| F4 · NPC, detalle | `GlobalNpcDetailPage.tsx:61-65` (`RESOURCES`: Salud, Concentración, **Investidura** con `StatIcons.investidura`), `:17-54` (agrupación propia), `:214, 246-250` (Fuente, Ascendencia) | tres recursos | Sin cambio estructural. Corregir de paso la agrupación del NPC (auditoría: Cognitivo = INT+VOL; Espiritual = DIS+PRE) al unificar tablas. Para NB, Investidura solo se muestra si `maxInvestiture>0` [inferido] |
| F5 · Autocompletado de notas de NPC | `pages/npcs/NpcNotesPage.tsx:420-423` | `globalNpcsApi.getAll()` | PARAMETRIZAR: pasar el set |

### G. Diario

| ID · Superficie | Archivo:línea | Hoy | En NB |
|---|---|---|---|
| G1 · Menciones | `pages/diario/DiarioPage.tsx:13-21, 152, 259, 291` | tipo `spren`: etiqueta «Spren», icono `Sparkles`, leyenda «Spren», parseo `[[spren - X]]` | OCULTAR la entrada de leyenda `spren` (`:259` lista `['pj','npc','spren','faction']`) en NB; el parseo (`:152, :291`) se queda por compatibilidad |
| G2 · Estado vacío | `DiarioPage.tsx:390` | icono `archivo-tormentas` | SUSTITUIR por el emblema del set (§7) |

### H. Dados

| ID · Superficie | Archivo:línea | Hoy | En NB |
|---|---|---|---|
| H1 · `SKILLS` | `components/DiceRoller.tsx:25-31` | 18 etiquetas: «Armas ligeras», «Armas pesadas», «Saber»... | PARAMETRIZAR: tabla única compartida con la ficha (§8) |
| H2 · `SKILL_TO_FIELDS` | `DiceRoller.tsx:36-55` | `Atletismo→fuerza` (correcto), `Intimidación→presencia` (el libro: Voluntad) | PARAMETRIZAR/corregir: Intimidación (VOL) en la hoja NB (L.402 / PDF 408) |
| H3 · Combate: habilidades de ataque | `DiceRoller.tsx:1012` | `['Armas ligeras','Armas pesadas','Agilidad']` | PARAMETRIZAR: añadir `Alomancia` si el personaje la tiene (ataque de Lanzar una moneda, L.172 / PDF 178) |
| H4 · Pestañas | `DiceRoller.tsx:1306-1316` | Combate, Habilidad, Daño, Recuperación, Enfrentada, Libre, Registro | Sin cambio |
| H5 · Recuperación | `DiceRoller.tsx:702-706, 773`; `utils/dice.ts:107-114` | tabla por Voluntad; texto «Distribuye entre Salud y/o Concentración» | Sin cambio de lógica (L.52 / PDF 58). NUEVO texto de ayuda en NB: la Investidura no se recupera con descanso sino con «Beber vial» (L.129 / PDF 135) |
| H6 · Dado de trama | `utils/dice.ts:81-90`; `DiceRoller.tsx:99-108` | d12 de 12 caras | **No es diferencia de set**: ambos libros usan un d6 (PDF 16 / L.10). Es un error previo (auditoría); se corrige aparte, no en este proyecto |

### I. Tema, iconografía y PWA

| ID · Superficie | Archivo:línea | Hoy | En NB |
|---|---|---|---|
| I1 · Tokens de marca y atmósfera | `index.css:60-62, 98, 126-132, 159-165, 193-199, 224-230, 259-265, 290-296` | `--brand` `#8fd4ff`/`#1359ad`, `--brand-glow`, `--atmo`, `--selection`, `--navy` | PARAMETRIZAR por `data-ruleset` (§6). Tres bloques duplicados (oscuro, claro, claro por media query) |
| I2 · Animación sin uso | `index.css:722-724` | `@keyframes stormlight` | Sin cambio (sin consumidores) |
| I3 · Color de la barra del navegador | `index.html:15-16, 57-59`; `store/themeStore.ts:12` | `#0a0e15` / `#e8ecf1` | `themeStore` sí puede cambiarlo en ejecución (A5); `index.html` no (§6.4) |
| I4 · Manifiesto PWA | `vite.config.ts:44-52` | `name: 'Cosmere · Compañero de campaña'`, `theme_color`/`background_color` `#0a0e15` | Sin cambio: estático por instalación |
| I5 · Favicon | `public/favicon.svg` (degradado azul `#8fd4ff`) | emblema Cosmere en azul | Opcional: cambiar `<link rel="icon">` en ejecución a un `favicon-mistborn.svg`; el icono de la PWA no se puede |
| I6 · Iconos de stats | `lib/gameIcons.ts:21-28` | `investidura: Gem` | PARAMETRIZAR: NB `Flame` para Investidura y `FlaskConical` para viales/cargas (existen en lucide 1.7.0, verificado) |
| I7 · Iconos de camino | `lib/gameIcons.ts:10-17`, `components/GameIcons.tsx:14-17` | seis caminos heroicos con Lucide | Sin cambio (los 6 caminos heroicos son los mismos). NUEVO: mapa para los 5 caminos de nacido del metal (§7.4) |
| I8 · Gradientes de héroe | `lib/avatar.ts:14-21` | 6 paletas por `id % 6` | Sin cambio |

## 3. Superficies que no deben tocarse

Sesiones, calendario y propuestas (`pages/sessions/*`), mensajes (`NotasPage`, `GmMessagesPage`), diario salvo G1/G2, historia (`HistoriaPage`), invitaciones y miembros (Ajustes), autenticación, primitivas de `ui.tsx` (`Segmented`, `Field`, `Sheet`, `Tabs`...), `CharacterHero`, paletas de héroe, núcleo de metas (3 hitos, 3 conclusiones), tirador salvo H1-H3, lógica de recuperación, conexión `useCampaignHub`. El motor de talentos (`lib/talentGraph.ts`, `components/talentos/*`) es de otros agentes; aquí solo se anota el punto de contacto (D10).

## 4. Flujo de creación de campaña

### 4.1 Hoy, paso a paso

1. `/campaigns` (`CampaignListPage`), cabecera con «Unirse» y «Nueva campaña» (`:198-217`). El estado vacío repite ambos botones (`:285-292`).
2. «Nueva campaña» → `setMode('create')` → aparece `InlineForm` (`:222-235`): título «Nueva campaña», un `Input` («El nombre de tu campaña...»), botón «Crear» (`:83-85`). Habilitado si `value.trim()` y no pendiente (`:44`).
3. `createMutation.mutate()` (`:131-138`): `POST /campaigns {name}` (`api/campaigns.ts:10-11`; contrato sin ambientación: `CreateCampaignRequest` solo `Name`, `cosmere-api/Messages/Campaigns/In/CreateCampaignRequest.cs`).
4. `onSuccess`: invalida `['campaigns']`, `setCurrentCampaign(campaign)` (escribe `currentCampaign` e `isGm`; el creador es director), `navigate('/campaigns/:id/home')`.
5. `AppLayout` monta, vuelve a pedir `getById` (`:13-17`) y pinta `Sidebar` + `Outlet` + `DiceRoller`.
6. Unirse: `joinMutation` (`:140-147`) devuelve `Campaign` y solo refresca la lista. Abrir: `openCampaign` (`:154-163`) espera `getById` y entonces navega.

### 4.2 Propuesta de UI (respetando DESIGN.md)

Sustituir `InlineForm` de creación por un `Sheet` (como «Nuevo personaje», `CharacterListPage.tsx:320-382`: se abre como hoja inferior en móvil y diálogo desde 640 px, mismo patrón y misma sensación). `InlineForm` queda para «Unirse». Todo con estilos en línea, tokens y `Segmented` para elecciones únicas (DESIGN.md, checklist de accesibilidad: «Single-choice groups use `Segmented`»).

```
Sheet title="Nueva campaña" description="Elige la ambientación; no se puede cambiar después." maxWidth=480
  Field label="Nombre de la campaña"        -> Input autoFocus
  <p style={eyebrow}>Ambientación</p>
  Segmented ariaLabel="Ambientación"
    [ {value:'stormlight', label:<icon archivo-tormentas 16 /> 'Tormentas', ariaLabel:'Archivo de las Tormentas'},
      {value:'mistborn',   label:<icon nacidos-bruma-emblem 16 /> 'Bruma',    ariaLabel:'Nacidos de la bruma'} ]
  RuleSetPreview (aria-live="polite"): emblema 40 px + nombre completo (font.display) + 1-2 líneas
     stormlight: «Roshar. Caballeros Radiantes, Órdenes, potencias, luz tormentosa.»
     mistborn:   «Scadrial. Alomancia, feruquimia y hemalurgia; brumosos y nacidos de la bruma.»
  si mistborn:
    <p style={eyebrow}>Era</p>
    Segmented ariaLabel="Era" [ 'Era 1' | 'Era 2' | 'Entre eras' ]
    texto bajo (Field hint, fs.xs, c.subtle):
       Era 1: «El Mundo de Ceniza» (Imperio Final). Aviso: el libro advierte de que su tono es más sombrío que el de la Era 2 (L.372 / PDF 378).
       Era 2: «Cambio y revolución». Armas de fuego, aeronaves, sangre koloss.
       Entre eras: «Une ambas; el director decide qué queda disponible» [inferido; L.371-372 / PDF 377-378]
  Aviso (tone.topacio pill + TriangleAlert, patrón de CharacterDetailPage.tsx:943-963):
     «La ambientación no se puede cambiar después de crear la campaña.»
  footer: Button secondary «Cancelar» (flex 1) · Button primary «Crear campaña» (flex 2),
          disabled si !name.trim() || (mistborn && !era) || isPending; aria-busy en pendiente
```

Decisiones de diseño:
- **Etiquetas cortas en el `Segmented`** («Tormentas», «Bruma»): con el contenedor de 296 px útiles en un móvil de 360 px, «Archivo de las Tormentas» se truncaría (`Segmented` usa `nowrap` + elipsis, `ui.tsx:686ss`). El nombre completo va en `ariaLabel` de la opción y en la vista previa.
- **Ambientación sin valor por defecto vacío**: preseleccionar `stormlight` (compatibilidad y menos fricción) y mostrar siempre el aviso de inmutabilidad. **Era obligatoria** para NB (`era` sin valor por defecto) para no asumir una época.
- **Vista previa en vivo** (emblema oficial + frase) en lugar de dos tarjetas grandes: respeta el estándar de `Segmented` y no desplaza el resto del formulario.
- `ErrorMessage` («Algo salió mal. Inténtalo de nuevo.») se reutiliza igual que en `InlineForm` (`:88`).
- Iconos: `CosmereIcon name="archivo-tormentas"` y `nacidos-bruma-emblem` (§7). Sin emojis.
- Foco: `data-autofocus` en el `Input` del nombre (`useDialogA11y` lo busca, `ui.tsx` Sheet).

### 4.3 Tarjeta de campaña, etiquetas de era y disponibilidad por era

- `CampaignCard` (`:343-478`): chip del set en la cubierta (esquina superior derecha, con el patrón `heroPill` + `backdropFilter` de `:411`) con el glifo del set; en NB, segundo chip «ERA 1» / «ERA 2» / «ENTRE ERAS». El libro marca las eras con etiquetas «ERA 1» / «ERA 2» (visibles en PDF 260), así que el chip imita ese formato. Color de los chips de era sin tokens nuevos: `tone.granate` para Era 1 (sol rojo, ceniza) y `tone.zafiro` para Era 2 [inferido]. Evitar `rubi` (identidad del Director).
- Filtros por era (consumidos por pickers y enciclopedia): ascendencia sangre koloss solo Era 2; caminos de nacido del metal Era 1 = brumoso, nacido de la bruma, feruquimista; Era 2 = brumoso, ferrin, nacidoble (L.372 / PDF 378); metales por era (Era 1: acero, atium, bronce, cinc, cobre, estaño, hierro, latón, peltre, y oro salvo brumoso; Era 2: los 16 sin atium). Con «Entre eras» se muestra la unión. La UI lee `era` desde un único selector (`useEra()`), no compara cadenas dispersas.

### 4.4 Ajustes y edición

No hay endpoint de edición de campaña (api_map). Propuesta mínima: `ruleSet` inmutable; `era` editable por el director con un `Segmented` en la nueva sección «Ambientación» de Ajustes (`CampaignSettingsPage.tsx`), con `ConfirmDialog` si hay personajes que pasarían a tener elementos no disponibles. Requiere `PATCH /campaigns/{id}/settings`; si no se implementa en v1, la era es de solo lectura [inferido].

## 5. Estado: exponer `ruleSet` y `era`

### 5.1 Compatibilidad con lo persistido

`campaignStore` persiste `{currentCampaign, isGm}` bajo `cosmere-campaign` (`store/campaignStore.ts:19`). Los objetos persistidos antes del cambio no tienen `ruleSet`. Propuesta: **no duplicar estado**, derivar con selectores:

```ts
// store/campaignStore.ts (añadir; no cambia el shape persistido)
export const useRuleSet = () => useCampaignStore((s) => s.currentCampaign?.ruleSet ?? 'stormlight')
export const useEra     = () => useCampaignStore((s) => s.currentCampaign?.era ?? null)
```

- `?? 'stormlight'` cubre objetos antiguos y la ausencia de campaña (listado, login). No hace falta `migrate`; el siguiente `getById` (con `ruleSet` del servidor) sobrescribe el valor. Si se prefiere versionar, `persist({ version: 1, migrate })` que rellena `ruleSet: 'stormlight'`; no es necesario.
- Contrato del servidor: toda campaña existente debe devolver `ruleSet: 'stormlight'` (migración de BD con valor por defecto). Si la respuesta no trae el campo, el selector cae a `stormlight` en vez de romper.
- Los archivos que usan `useCampaignStore()` (20 leen `isGm`) desestructuran el store entero (`const { isGm } = useCampaignStore()`); añadir selectores no los afecta.

### 5.2 Parpadeo de hidratación y campaña equivocada

Problema real hoy (hallazgo 10): `AppLayout.tsx:13-17`. Con dos sets el efecto visible es el tema y las pestañas del set equivocado. Propuesta:

```tsx
// AppLayout
const { campaignId } = useParams(); const id = Number(campaignId)
const current = useCampaignStore((s) => s.currentCampaign)
const ready = current?.id === id               // la campaña en store es la de la URL
// 1) pedir/refrescar (ideal: useQuery(['campaign', id]) compartido con Ajustes; setCurrentCampaign en onSuccess)
// 2) useLayoutEffect: document.documentElement.dataset.ruleset = ready ? current.ruleSet : (lo ya presente); cleanup: delete dataset.ruleset
// 3) render: Sidebar siempre (necesita enlaces); <Outlet/> y <DiceRoller/> solo si ready
//    si !ready y la petición falla: ErrorMessage + Button «Reintentar» + «Volver a campañas»
```

- Efecto: al entrar por URL directa o desde otro dispositivo se ve `Spinner` hasta tener la campaña (antes: UI con `isGm` y set ajenos). Al abrir desde el listado no hay espera (`openCampaign` ya espera `getById`, `CampaignListPage.tsx:157`).
- `.catch(() => {})` actual deja la UI colgada en silencio; sustituir por estado de error con reintento (en PWA sin red también aplica).
- Sin parpadeo en recarga: **script previo a la pintura** en `index.html` (junto al de `cosmere-theme`, `:18-26`) que lea `localStorage['cosmere-campaign']`, compare el id con `location.pathname.match(/^\/campaigns\/(\d+)/)` y, si coincide, ponga `data-ruleset` en `<html>` antes del primer frame (`try/catch`, igual que el del tema). Si no coincide, no pone nada y `AppLayout` lo fija al llegar la campaña.
- `data-ruleset` se quita al salir de `/campaigns/:id/*` (cleanup del layout effect) para que el listado, el login y el registro mantengan la identidad Cosmere genérica.
- `themeStore.applyTheme(mode, ruleSet)` (A5) lee `document.documentElement.dataset.ruleset` cuando se llama desde `ThemeSwitcher` y desde `onRehydrateStorage` (`themeStore.ts:45-47`), de modo que la `<meta name="theme-color">` queda en el color del set.
- Las claves de caché de TanStack Query que dependen del set llevan `ruleSet` (A11); las de personajes ya están acotadas por `campaignId`.

### 5.3 `RuleSetUi`: un único módulo de configuración

Para no repetir `ruleSet === 'mistborn'` en 30 archivos, un módulo `src/rulesets/index.ts` expone por set capacidades y etiquetas; los componentes preguntan por la capacidad, no por el set. Esquema:

```ts
export interface RuleSetUi {
  id: RuleSetId; name: string; shortName: string; emblemIcon: string      // 'archivo-tormentas' | 'nacidos-bruma-emblem'
  features: {
    caminoRadiante: boolean; idealesJurados: boolean; marcos: boolean; formasCantor: boolean
    potencias: boolean; artesMetalicas: boolean; viales: boolean; arquillas: boolean
    mencionSpren: boolean; pestanaAventura: boolean; caminoNacidoDelMetal: boolean
  }
  ascendencias: { id: string; label: string; era?: 'era2'; icon: ... }[]
  puntosAtributoBase: (ascendencia: string) => number                      // 12 | 6 (kandra)
  capacidadCargaKg: number[]                                               // 6 tramos por Fuerza (D14)
  skills: SkillDef[]                                                       // tabla única §8.1
  encyclopedia: TopicDef[]                                                 // E2
  currency: { symbol: 'mc' | 'ar'; image?: string }
  themeBg: { light: string; dark: string }                                 // A5
}
```

Se evalúa por set y era con helpers (`isAvailable(item, era)`).

## 6. Tema

### 6.1 Mecanismo

`<html data-ruleset="mistborn">` (§5.2). Los tokens son variables CSS; `theme.ts` solo las referencia (`c`, `tone`, `shadow.glow`), así que **cambiar tokens cambia todo** sin tocar componentes. Stormlight es el valor por defecto (sin atributo o `data-ruleset="stormlight"` sin reglas).

Hay que repetir el override en las **tres** formas en que el tema define sus variables (`index.css:101-166` oscuro, `:168-231` claro, `:233-298` claro por `prefers-color-scheme`):

```css
:root[data-ruleset='mistborn'] { /* oscuro (valor por defecto del tema) */ ... }
:root[data-ruleset='mistborn'][data-theme='light'] { /* claro explícito */ ... }
@media (prefers-color-scheme: light) {
  :root[data-ruleset='mistborn']:not([data-theme='dark']) { /* claro del sistema */ ... }
}
```

Especificidad: la primera (0,2,0) iguala a `:root[data-theme='light']`; va **después** en el archivo. La segunda y tercera (0,3,0) ganan. Los derivados (`--brand-bg`, `--brand-border`, `--glow-brand`) se recalculan solos al cambiar `--brand` y `--brand-glow`; `--brand-glow` y `--selection` sí se redefinen a mano.

### 6.2 Tokens que cambian

`--brand`, `--brand-light`, `--brand-dark`, `--brand-fill`, `--on-brand`, `--brand-glow`, `--atmo`, `--selection`, `--grain-opacity`, y las superficies/bordes/texto (`--bg`, `--mantle`, `--surface-1..4`, `--overlay`, `--border*`, `--hover*`, `--track`, `--text*`). Se mantienen: `--gold`, `--gold-ornament`, `--gold-border/rule` (el dorado ornamental es identidad Cosmere común), los 10 tonos gema (semántica de rol, estado y daño; `rubi` = Director), `--navy` y `--navy-deep` (los usa la banda de las placas de talento, `components/talentos/talentStyle.ts:43`).

### 6.3 Paleta propuesta (Nacidos de la Bruma)

Referencias del libro: la hoja es blanco y negro con nubes de bruma gris en la banda superior (PDF 408-409); las ilustraciones de PDF 411 usan un rojo salmón tostado (medido sobre el render: mediana RGB 186,106,99 → `#BA6A63`; moda `#B06058`); el Mundo de Ceniza es ceniza y niebla (PDF 378). Marca = **acero/peltre** (metal frío) en lugar del azul de luz tormentosa; el **rojo del sol de Era 1** va en la atmósfera y en el chip de era (no como acento de UI, para no chocar con `rubi`= Director/peligro). Nombres de tema [inferido]: claro «Pergamino de ceniza», oscuro «Noche de bruma»; hoy `ThemeSwitcher` solo dice «Libro»/«Noche» (`ThemeSwitcher.tsx:19-20`), sin cambio necesario.

| Token | Oscuro | Claro |
|---|---|---|
| `--bg` | `#0c0b0d` | `#ebe8e6` |
| `--mantle` | `#08070a` | `#e0dcda` |
| `--surface-1` / `-2` / `-3` / `-4` | `#141215` / `#1c191e` / `#26222a` / `#312c36` | `#faf8f7` / `#f1eeec` / `#e5e0de` / `#d8d2d0` |
| `--overlay` | `rgba(6,4,8,0.74)` | `rgba(30,22,32,0.42)` |
| `--border` / `-bright` / `-strong` | `rgba(205,190,200,0.10/0.20/0.34)` | `rgba(40,30,40,0.13/0.22/0.38)` |
| `--hover` / `-strong` / `--track` | `rgba(205,190,200,0.06/0.10/0.12)` | `rgba(40,30,40,0.05/0.09/0.12)` |
| `--text` / `--text-muted` / `--text-subtle` | `#ede9e7` / `#bdb5b6` / `#988f92` | `#1d1a1f` / `#4a434a` / `#625a62` |
| `--brand` / `--brand-light` | `#a9bccd` / `#d3dfea` | `#3a5672` / `#2f4760` |
| `--brand-dark` / `--brand-fill` / `--on-brand` | `#3e5a74` / `#a9bccd` / `#0b1218` | `#28384a` / `#2b3a4c` / `#ffffff` |
| `--brand-glow` / `--selection` | `rgba(169,188,205,0.26)` | `rgba(58,86,114,0.22)` |
| `--atmo` (oscuro) | `radial-gradient(900px 520px at 88% -8%, rgba(190,98,84,0.10), transparent 62%), radial-gradient(700px 480px at -12% 104%, rgba(169,188,205,0.05), transparent 60%), radial-gradient(600px 400px at 40% 120%, rgba(150,140,150,0.05), transparent 60%)` | `radial-gradient(1000px 560px at 85% -12%, rgba(255,255,255,0.9), transparent 62%), radial-gradient(760px 480px at 105% 110%, rgba(176,96,88,0.10), transparent 60%), linear-gradient(180deg, #efecea 0%, #e8e4e2 60%, #e0dbd9 100%)` |
| `--grain-opacity` | `0.06` (ceniza) | `0.04` |

Contraste (calculado con la fórmula WCAG; el estándar del proyecto es ≥ 4,5:1 en `--bg` a `--surface-3`, DESIGN.md, principio 1): oscuro, `--text` 12,9 a 16,3; `--text-muted` 7,8 a 9,8; `--text-subtle` 5,0 a 6,2; `--brand` 8,0 a 10,1; `--on-brand` sobre `--brand-fill` 9,7. Claro, `--text` 13,2 a 16,3; `--text-muted` 7,3 a 9,0; `--text-subtle` 5,1 a 6,3; `--brand` 5,8 a 7,2; blanco sobre `--brand-fill` 11,6. Hay que re-verificar visualmente en ambos temas (la comprobación numérica no sustituye el repaso de pantallas).

Datos con color propio (colores `color` en `data/*.ts`) pasan por `ink()`/`tint()`: no cambian. Los colores de los 5 caminos de nacido del metal (nuevos datos) deben definirse como hex y usarse igual con `toneFrom`.

### 6.4 Lo que no se puede parametrizar por campaña

- `index.html:15-16, 57-59`: `theme-color` y fondo inicial (`#0a0e15` / `#e8ecf1`). El navegador los lee antes de ejecutar JS. El script previo a la pintura (§5.2) puede fijar `data-ruleset`, pero estos colores son los de ST hasta que `themeStore.applyTheme` reescribe las metas. Efecto: un destello de 1 frame con el fondo de ST al recargar una campaña NB. Mitigación: que el CSS inicial de `<style>` use `html[data-ruleset='mistborn']{background:#0c0b0d}` etc. (el script previo ya habrá puesto el atributo).
- `vite.config.ts:44-52`: el manifiesto es estático por instalación PWA; nombre «Cosmere · Compañero de campaña» (genérico) y colores ST. Sin cambio.
- `apple-touch-icon`, `icon-192/512`: estáticos.
- Sí es dinámico: la meta `theme-color`, el `href` del `<link rel="icon">` y `document.title` [inferido].

## 7. Iconografía

Prioridad del proyecto (DESIGN.md, «Iconography»): icono oficial Cosmere, luego Lucide, nunca emojis ni dibujos propios. Los activos viven en `src/assets/cosmere/*.svg` (vectores en `currentColor`, registro automático por `import.meta.glob`, `lib/cosmereAssets.ts:2`) y `img/*.webp`.

### 7.1 Qué hace falta de Nacidos de la Bruma

| Activo | Uso | Origen (PDF `SPA_Mistborn_Handbook.pdf`) | Nombre propuesto |
|---|---|---|---|
| Glifos alománticos Era 1 (acero de alfabeto) | icono de poder, chips de metal, tarjetas del tema «Artes metálicas» | fuente `MistbornAllomantic-Era1` en PDF 411 (29 glifos) | `alomancia-era1-<metal>.svg` |
| Glifos alománticos Era 2 | ídem para campañas Era 2 | fuente `MistbornAllomantic-Era2` en PDF 411 (25 glifos) | `alomancia-era2-<metal>.svg` |
| Glifos feruquímicos (alfabeto de Terris) | icono de poder de feruquimia | trazados vectoriales en PDF 411, columna «Feruquímico» (118 trazados, 24 filas) | `feruquimia-<metal>.svg` |
| Emblema de Nacidos de la Bruma | `RuleSetBadge`, estado vacío del diario, selector de set | trazados vectoriales en PDF 410 (rectángulo ≈ 0-56 × 4-58 pt, cuatro rellenos) | `nacidos-bruma-emblem.svg` |
| Rótulo «Nacidos de la bruma» (opcional) | cabecera de Enciclopedia | trazado en PDF 410 (≈ 48-225 × 5-55 pt) | `nacidos-bruma-wordmark.svg` |
| Dinero de la Era 1 / Era 2 (ilustración) | Bolsa, catálogo, mosaico «Bolsa» | imágenes raster de PDF 260 (las dos de 783×819 y 723×675 px; pie «Dinero de la Era 1» / «Dinero de la Era 2»; confirmar al extraer) | `img/dinero-era1.webp`, `img/dinero-era2.webp` |

Los 16 metales de la hoja de artes metálicas más atium: 17 × 3 estilos = **51 SVG** mínimos. Opcionales: lerasium y malatium (6) y las segundas letras de estaño y peltre (4). Ya reutilizables sin cambios: `trama-*`, `accion-*`, `marco-*`, `ornamento-*`, `cosmere-emblem*`, `dado-d20`, `dado-trama`.

### 7.2 Tabla letra → metal (alfabeto de acero, L.405 / PDF 411)

El libro la imprime con tres columnas de glifos por fila: alomántico Era 1, alomántico Era 2 y feruquímico. Letra de la fuente: la misma letra (`CH`→`c`, `SH`→`x`).

| Letra | Metal | | Letra | Metal | | Letra | Metal |
|---|---|---|---|---|---|---|---|
| A | Lerasium | | G | Cadmio | | R | Latón |
| I / E | Estaño | | H | desconocido | | S | Duraluminio |
| O / U | Peltre | | J | desconocido | | SH (x) | desconocido |
| B | Hierro | | K | Bendaleo | | T | Bronce |
| CH (c) | desconocido | | L | Cinc | | V | Atium |
| D | Cobre | | M | Oro | | W | Cromo |
| F | Malatium | | N | Electro | | Y | Nicrosil |
| | | | P | Acero | | Z | Aluminio |

Estaño (I/E) y peltre (O/U) llevan **dos glifos alománticos** (uno por letra) y uno feruquímico. Se propone usar el primero (I, O) como símbolo canónico y guardar el segundo como variante [inferido: el libro no dice cuál representa al metal].

### 7.3 Extracción (verificada como viable)

El camino «render PNG» de `pdf_image_extractor` (96 DPI, PNG) no sirve para iconos tintables. La vía vectorial se ha probado sobre el PDF real (Python 3.13, PyMuPDF 1.28.2 y fontTools 4.65.0 están instalados en la máquina):

1. **Glifos Era 1 y Era 2**: `doc.extract_font(xref)` devuelve los CFF incrustados (xref 13453 y 13452 en PDF 411; 5.719 y 5.517 bytes). Con `fontTools.cffLib.CFFFontSet.decompile` y `CharStrings[<glifo>]` + `SVGPathPen` se obtiene el contorno de cada letra (probado: Era 1 tiene `A B D E F G H I J K L M N O P R S T U V W Y Z c x` y además `one two three four`; Era 2 tiene las 25 letras). Escribir cada glifo en un `<svg viewBox>` con `fill="currentColor"`, invirtiendo el eje Y.
2. **Glifos feruquímicos**: `page.get_drawings()` en la página 411 filtrando `295 < rect.x0 < 335` y `rect.y0 > 100` (118 trazados); agrupar por banda de ≈ 27 pt (las letras caen en y = 131, 158, 184, 212, 239, 266, 294, 321, 348, 376, 403, 429, 457, 484, 511, 539, 566, 593, 621, 647, 674, 702, 729) y volcar cada banda a un `<path>` con `fill="currentColor"` (o `page.get_svg_image(clip=..., text_as_path=True)` y limpiar).
3. **Emblema**: `page.get_drawings()` en PDF 410 con `rect.y1 < 75 and rect.x1 < 235` (5 trazados; el rectángulo 48-225 es el rótulo).
4. **Dinero**: `page.get_images(full=True)` en PDF 260 y exportar las dos imágenes a `webp`.
5. Normalizar para que el registro de `lib/cosmereAssets.ts:13` lea el `viewBox="x y w h"` y `CosmereIcon` reciba `size` = altura. Ubicar el script junto a las herramientas existentes (`cosmere-api/Resources/Parts/`) [inferido] y documentar la procedencia como se hace con los de Stormlight («uso privado de mesa»; el arte y la marca Cosmere® pertenecen a sus titulares, `CosmereIcon.tsx:3-10`).
6. Comprobación visual: comparar cada SVG con su fila en los renders `p408.png` a `p411.png` (80 DPI) generados durante este análisis en `scratchpad/hoja/` (directorio de trabajo de la sesión, no del repositorio).

### 7.4 Resto de iconos (Lucide, verificados en lucide-react 1.7.0)

| Concepto | Icono | Notas |
|---|---|---|
| Investidura (NB) | `Flame` | en `StatIcons` por set (I6) |
| Viales / cargas | `FlaskConical` | |
| Arquillas | `Coins` o `cosmereImage('dinero-era1'/'dinero-era2')` | |
| Ascendencia Humano / Kandra / Sangre koloss | `UserRound` / `VenetianMask` / `Mountain` | [inferido] |
| Alomancia / Feruquimia (habilidades) | `Flame` / `Anvil` | [inferido] |
| Camino brumoso / nacido de la bruma / feruquimista / ferrin / nacidoble | `Flame` / `CloudFog` / `Container` / `Package` / `Merge` | [inferido]; en poderes concretos, el glifo del metal |
| Hemalurgia (solo enciclopedia) | `Skull` | [inferido] |

No existe emblema oficial de los 5 caminos de nacido del metal ni de los 6 caminos heroicos; se usa Lucide (misma política que hoy, `lib/gameIcons.ts:9-17`).

## 8. Dados

### 8.1 Qué cambia

1. **Tabla única de habilidades** (hallazgos 4 y 5). Un módulo `skills` con `{ field, label, atributo, columna }[]` por set, consumido por ficha, tirador, NPC y grafo de talentos. Contenido NB (hoja L.402 / PDF 408; L.59-72 / PDF 65-78):
   - Velocidad: Agilidad, **Armamento ligero**, Hurto, Sigilo. Fuerza: **Armamento pesado**, **Atletismo**.
   - Intelecto: Deducción, Manufactura, Medicina, **Saber**. Voluntad: Disciplina, **Intimidación**.
   - Discernimiento: Percepción, Perspicacia, Supervivencia. Presencia: Engaño, Liderazgo, Persuasión.
   - Columnas de la hoja (físico/cognitivo/espiritual) agrupan por defensa, no por atributo: Físico = FUE+VEL; Cognitivo = INT+VOL; Espiritual = DIS+PRE.
   - Los campos del `Character` no se renombran: `armasLigeras`, `armasPesadas`, `conocimiento`. Solo la etiqueta.
   - Diferencias del tirador hoy: etiquetas (H1) e Intimidación→`presencia` (H2). Atletismo ya es FUE en el tirador y está mal en la ficha (`CharacterDetailPage.tsx:395`).
2. **Alomancia (VOL) y Feruquimia (INT)** como habilidades (Alomancia en la lista de Voluntad, L.52 / PDF 58; Feruquimia en la de Intelecto, L.51 / PDF 57; se obtienen con el talento principal, L.128 / PDF 134). Se guardan en `habilidadPersonalizadaN` con atributo `VOL`/`INT`: el tirador ya las lista (`getCharSkills`) y calcula `valor + atributo` (`getCharMod`, `DiceRoller.tsx:75-85`). Cero cambios en las pestañas Habilidad y Enfrentada.
3. **Pestaña Combate**: `WEAPON_SKILLS` (`:1012`) pasa a ser dinámico y añade `Alomancia` cuando existe; el ataque de «Lanzar una moneda» es una prueba de Alomancia contra Defensa física (L.172 / PDF 178). Con Alomancia seleccionada, el dado de daño por defecto es el **dado de artes metálicas** (más abajo) y el contador de dados 1; el «Francotirador con monedas» (+1 dado) y «Disparo con empujón» son manuales o de otro equipo.
4. **Dado de artes metálicas** (L.163 / PDF 169), función pura análoga a `recoveryDieFaces` (`utils/dice.ts:107-114`):

   | Grados (Alomancia/Feruquimia) | Límite | Dado | Alcance |
   |---|---|---|---|
   | 0 | 1 | 1 (sin tirada) | 3 m |
   | 1 | 1 | d4 | 6 m |
   | 2 | 2 | d6 | 12 m |
   | 3 | 3 | d8 | 24 m |
   | 4 | 4 | d10 | 48 m |
   | 5 | 5 | d12 | 96 m |
   | 6 o más | rango | d20 | 192 m |

   `artesMetalicas(grados, rango)` → `{ limite, dado, alcance }`. Se usa en la ficha (caja «mod./alcance/dado», §9) y en el prellenado de Combate. `mod` = Voluntad + grados (Alomancia) o Intelecto + grados (Feruquimia).
5. **Texto de ayuda en Recuperación** (H5): la Investidura no se recupera con descansos sino con «Beber vial» (L.129 / PDF 135).

### 8.2 Qué no cambia

Las siete pestañas (H4); la recuperación (tabla por Voluntad idéntica en L.52 / PDF 58 y en el manual de Tormentas); el dado de daño (`DAMAGE_DICE = [4,6,8,10,12,20]`, `:33`; sirve igual para el dado de artes metálicas); la tirada libre; el Registro y la difusión por SignalR; el modo ventaja/desventaja y el dado de trama. Nada de «luz tormentosa» aparece en el tirador (verificado con `grep`: no hay «Radiante», «Investidura» ni «luz» en `DiceRoller.tsx`).

### 8.3 Deuda previa que no pertenece a este proyecto

La auditoría (`docs/auditoria-reglas-2026-10-03.md`, 2026-10-03) documenta errores del tirador que afectan a ambos sets: d12 de trama en vez del d6 de 6 caras (L.10 / PDF 16), complicación sin bono (+2/+4), 20 y 1 naturales que sustituyen al dado de trama, modificador de daño en 0, Intimidación con Presencia, defensas del NPC cruzadas. Conviene corregirlos antes o en paralelo, pero como trabajo independiente: si se mezcla con el cambio de set, un fallo de reglas parecerá un fallo del set.

## 9. Ficha: hoja de Nacidos de la Bruma frente a la ficha actual

Hoja del libro (L.402-405 / PDF 408-411), vista en los renders de las cuatro páginas.

### 9.1 Cajas nuevas

| Elemento de la hoja | Dónde | Hoy en la app | Propuesta |
|---|---|---|---|
| «Ambientación de campaña» (rótulo bajo el logo en las hojas 2, 3 y 4) | cabecera PDF 409-411 | no existe | `RuleSetBadge` con set y era (Sidebar, Inicio, tarjeta, Ajustes) |
| Campo único «Caminos» | cabecera PDF 408-409 | tres fichas: Ascendencia, Camino, Orden | dos fichas: Camino heroico y Camino de nacido del metal (D19) |
| **Investidura máxima / actual** | PDF 408 | solo máximo; sin valor actual; solo para radiantes | máximo con desglose y **actual editable** (escala 0 al crear; sube con «Beber vial»; L.57 / PDF 63 y L.129 / PDF 135). Nuevo estado (otros agentes); en la UI, `Stepper` en la tarjeta de Investidura |
| **Hoja de artes metálicas** (4 bloques en 2×2) | PDF 410 | no existe | pestaña «Artes metálicas» de la ficha, lista de tarjetas de poder |
| Cabecera «ALOMANCIA» / «FERUQUIMIA» con **MOD. / ALCANCE / DADO** | PDF 410, arriba | no existe | dos tarjetas con `artesMetalicas()` (§8.1): una por arte, **no por metal** |
| Por bloque: **METAL**, «Meta de nacido del metal completada» (círculo), **EFECTO**, **CARGAS/VIALES** (caja), **TALENTOS** | PDF 410 | no existe | tarjeta de poder: nombre y glifo del metal, interruptor «Meta completada» (lleva a la meta enlazada), efecto, contador de cargas o viales, talentos del poder |
| **Arquillas** (caja dentro de «Armadura y equipo») | PDF 409 | `marcosInfusas/Opacas` | sección «Arquillas» en Bolsa (D13) |
| Alfabeto de acero y de Terris | PDF 411 | no existe | no es dato de juego: solo fuente de iconos (§7) |
| Metas de nacido del metal | texto L.283 / PDF 289 | las metas no distinguen origen | etiqueta y vínculo al poder (D8) |

Las 4 tarjetas por hoja del libro son un límite de papel, no de juego: un nacido de la bruma puede tener hasta 10 metales; la UI debe permitir una lista sin tope [inferido].

### 9.2 Lo que desaparece

| Elemento ST | Dónde en la app | En NB |
|---|---|---|
| Orden Radiante (selector, pill, icono, placas) | D1, D4, D6, D7, D12, D19, D29 | oculto |
| Ideales jurados (`idealesJurados`, `IdealesControl`) | `TalentosDetailPage.tsx:196-205, 314, 707-753`; `Character.idealesJurados` | oculto; sustituido por «meta de nacido del metal completada» |
| Marcos infusos/opacos (esferas) | D2, D11, D13; `Character.marcosInfusas/Opacas` | sustituido por Arquillas |
| Potencias (huecos de habilidad con `SurgeIcon`) | D28 | sustituido por Alomancia y Feruquimia |
| Formas de cantor y ascendencia «Oyente» | D18, D20, D29, `TalentosDetailPage.tsx:452-548`, `data/cantores.ts` | oculto |
| Luz tormentosa / spren | G1, E2-E4, `Sidebar` no | oculto |
| Catálogo Roshar (moneda `mc`, esferas) | D16, E8 | sustituido |

### 9.3 Lo que se mantiene igual

Atributos, defensas, salud, desvío, concentración, movimiento, dado de recuperación, alcance de sentidos, las 18 habilidades, propósito, obstáculo, apariencia, notas, conexiones, metas con 3 hitos, estados y lesiones, pericias, armas y talentos (la hoja de NB y la de ST comparten el diseño base del juego, L.402 / PDF 408).

### 9.4 Decisión abierta (D28)

Con el esquema actual (`habilidadPersonalizadaN`, 2 por columna) caben Alomancia e Intelecto/Voluntad, pero un nacidoble ocupa los dos huecos cognitivos y el jugador pierde sus habilidades libres. Alternativas: (a) campos dedicados `alomancia`/`feruquimia` (más limpio, requiere API); (b) mantener huecos y ampliar a 3 por columna; (c) dejar el diseño como está y aceptar el límite. Recomendación UI: (a), con los mismos valores expuestos al tirador como habilidades personalizadas sintéticas para no tocar `getCharMod`.

## 10. Plan de tareas UI (dependencias y alcance)

| # | Tarea | Depende de | Superficies |
|---|---|---|---|
| U0 | Cimientos: tipos (`RuleSetId`, `era`), selectores `useRuleSet`/`useEra`, módulo `src/rulesets/` (features, skills, ascendencias, capacidad), claves de caché, `RuleSetGate` | contrato API (`ruleSet`, `era` en respuestas) | A1, A3, A11, B8 |
| U1 | Hidratación: gate en `AppLayout`, `data-ruleset`, script previo en `index.html`, error con reintento | U0 | A4, A5, I3 |
| U2 | Creación de campaña (Sheet) y tarjeta con chips | U0, U1, emblemas (U7) | C1-C3, A2 |
| U3 | Shell: `RuleSetBadge`, Sidebar, Inicio, Ajustes | U0 | B1-B3, C5, C6 |
| U4 | Tema NB (tokens en tres bloques, paleta) | U1 | I1, I5, I6 |
| U5 | Tabla única de habilidades y refactor de ficha, tirador y NPC (corrige Atletismo/Intimidación) | U0 | D27, H1, H2, F4 |
| U6 | Ficha NB: identidad, ascendencias, puntos de atributo, Investidura, pestaña «Artes metálicas» | U0, U5, modelo de datos NB | D17-D31 |
| U7 | Activos: script de extracción y 51 SVG + emblema + dinero | PDF disponible | §7 |
| U8 | Bolsa y catálogo: arquillas, capacidad, precio, filtrado por set | U0, API catálogo | D2, D11-D16, E8 |
| U9 | Enciclopedia por set (`TOPICS`, rutas nuevas, subtítulos) | U0, datos NB | E1-E7, B8 |
| U10 | Director: ocultar «Aventura», NPC por set | U0, API NPC | F1-F5 |
| U11 | Diario y selectores de personaje (`CharacterIdentityPills`) | U0 | G1, G2, D1, D4, D6, D7, D12 |
| U12 | Dados: Alomancia/Feruquimia en Combate, `artesMetalicas`, texto de Recuperación | U5 | H3, H5 |

Criterios de aceptación transversales:
- Una campaña ST existente, abierta tras el cambio, se ve **idéntica** (sin `data-ruleset` efectivo, mismos tokens, mismas pestañas).
- Abrir por URL directa una campaña NB tras tener otra ST persistida nunca muestra un frame con el set equivocado ni la vista de jugador al director.
- `npx tsc -b` sin errores ni avisos (regla del proyecto). Ningún componente nuevo usa clases Tailwind ni colores literales (solo tokens, `tone`, `ink`/`tint`).
- Todo borrado nuevo pide confirmación (`ConfirmDialog`).
- Accesibilidad: foco en el nombre al abrir el Sheet; `aria-live` en la vista previa; `Segmented` con `ariaLabel` completos; objetivos táctiles ≥ 44 px.

## 11. Verificado, inferido y preguntas abiertas

Verificado en código o texto: A1-A11, B1-B9, C1-C7, D1-D31, E1-E8, F1-F5, G1-G2, H1-H6, I1-I8 (líneas citadas), tablas de capacidad/movimiento/recuperación/sentidos (L.50-52 / PDF 56-58 frente al manual de Tormentas), campos de la hoja (renders PDF 408-411), era (L.372 / PDF 378: «El Mundo de Ceniza», «Cambio y revolución»), existencia de las fuentes de glifos y de los trazados feruquímicos (PDF 411), iconos Lucide, contrastes de §6.3 (calculados).

Inferido: valores por defecto del selector de set y era; tonos de los chips de era (`granate`/`zafiro`); nombres de tema; iconos Lucide de ascendencias, caminos de nacido del metal, Alomancia y Feruquimia; glifo canónico de estaño/peltre; lista sin tope de poderes; Investidura de NPC condicionada a `maxInvestiture>0`; ubicación del script de extracción; hueco de «Entre eras».

Preguntas para quien decide:
1. ¿`era` se edita tras crear la campaña (requiere `PATCH`) o es inmutable como el set?
2. ¿«Entre eras» se ofrece en v1? (L.371-372 prevé campañas entre eras; el efecto es mostrar la unión de opciones.)
3. ¿Alomancia y Feruquimia en campos dedicados o en huecos `habilidadPersonalizadaN` (§9.4)?
4. ¿Se corrige a la vez la tabla única de habilidades de ST (Armamento ligero/pesado, Saber, Atletismo con FUE) o solo se introduce para NB? La unificación de §8.1 solo es coherente si se hace para ambos.
5. ¿Se oculta «Aventura» en NB v1 o se prepara un registro de aventuras por set (existe `SPA_NacidosBruma_Legado.pdf`)?
6. ¿Mezcla de sets en una campaña (L.374-375 / PDF 380-381: Investidura única compartida)? Este diseño no la contempla: `ruleSet` es exclusivo. Añadirla después exigiría que `ruleSet` pase a ser un conjunto o que `features` se activen por personaje.
