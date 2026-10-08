# Pantalla del director — propuesta v1

> Rama `feature/pantalla-director` (web y API), creada desde `main` el 7-8 oct 2026, en los *worktrees*
> `cosmere-web-pantalla` y `cosmere-api-pantalla`. Los árboles principales siguen en `main`, así `deploy.sh` no publica nada a medias.

## 0. Resumen

Una sección **solo para el director** pensada para una **tablet en horizontal** que acompaña la sesión de juego. Reúne en una
pantalla, sin navegar por la app, lo que el director consulta y anota mientras dirige:

| Panel | Para qué |
|---|---|
| **Escena** | Guía narrativa: texto para leer en voz alta en letra grande, notas, caminos, tablas, PNJ, mapas e imágenes. Aventura del libro (Caminapiedras) o escenas propias (cualquier mundo). |
| **Encuentro** | Seguimiento de enemigos y PJ: fases rápido/lento por ronda, salud, concentración, Investidura, defensas, desvío, estados oficiales del mundo, reacción, derrotados. |
| **Grupo** | Ficha rápida de los PJ: defensas, salud, concentración, Investidura, desvío, movimiento y habilidades. |
| **Tiradas** | Registro en vivo de las tiradas de la mesa + tiradas privadas del director (pruebas, ataques de los adversarios leídos de su ficha, daño). |
| **Bitácora** | Apuntes con hora y eventos automáticos (escena, combate, avances, metas). Exporta el *prompt* para generar la crónica del diario. |
| **Avances** | Marcar progreso: lista de verificación y progresión de cada capítulo, escenas jugadas, combates superados, tramas propias y **hitos de las metas** de los PJ. |

Todo se guarda en el servidor (un documento JSON por campaña, con control de versión), así nada se pierde si la tablet borra datos
o si el director abre la pantalla en otro dispositivo.

## 1. Decisiones tomadas (por defecto, revisables en la iteración)

| # | Decisión | Por qué |
|---|---|---|
| D1 | Ruta `/campaigns/:id/pantalla`, dentro de `AppLayout` pero **inmersiva**: sin barra lateral ni barras móviles, a ancho completo. El FAB de dados se mantiene. | Aprovechar toda la tablet; el lanzador de dados ya es conocido y abre la conexión en tiempo real. |
| D2 | Solo director: la ruta redirige a Inicio si no eres director y la API responde 403 a un jugador. | Notas, enemigos y tiradas privadas no deben verse. |
| D3 | Disposición en **dos paneles** cuando la pantalla es horizontal y ≥ 900 px (A: Escena · Encuentro · Grupo; B: Tiradas · Bitácora · Avances), cada uno con su scroll. En vertical o móvil, **un panel** con las seis pestañas. | En la mesa se mira a la vez «lo que pasa» (escena o combate) y «lo que llega» (tiradas, apuntes). |
| D4 | Estado = **un documento JSON por campaña** (`GmScreens.State`), con forma definida por la web (`version: 1`) y `Version` como control de concurrencia (409 si otro dispositivo guardó antes). | La feature va a iterar: cambiar el documento no exige migraciones. Mismo patrón que `Poderes`/`Clavos`. |
| D5 | Autoguardado con *debounce* (0,8 s) e indicador «Guardado / Guardando… / Sin guardar». | Cero botones de guardar en mitad de la partida. |
| D6 | Reglas del libro: fases **PJ rápidos → PNJ rápidos → PJ lentos → PNJ lentos**; el **Jefe** juega turno rápido y lento; el **Secuaz** cae al llegar a 0; estados oficiales **por mundo** en `WorldConfig.estados`. | Principio Cosmere: núcleo compartido + lo propio de cada mundo en su configuración. |
| D7 | Adversarios del catálogo (`/global-npcs`): se leen rango (del `tipo`), defensas (10 + atributos de su columna), desvío, inmunidades y ataques («Impacto 5(1d6+2)») de sus notas para tirar con un toque. | Las notas ya están transcritas con un formato estable. |
| D8 | Las tiradas del director son **privadas** por defecto; un interruptor las publica en el registro de la mesa. | Un director no enseña las tiradas de los enemigos salvo que quiera. |
| D9 | La bitácora se agrupa en **sesiones de juego** (número y título); terminar una la archiva. Exporta el *prompt* de crónica de `docs/diario-formato.md` (rama del diario) con las notas y los nombres de los PJ. | Enlaza con el diario sin construir un editor (las crónicas siguen siendo subidas generadas con IA). |
| D10 | «Mantener pantalla encendida» (Wake Lock) y «Pantalla completa» (con bloqueo a horizontal donde el navegador lo permite). | Una tablet que se apaga a mitad de escena es el peor fallo posible. |

## 2. Experiencia

### 2.1 Barra superior (56 px)
`‹ Director` · emblema del mundo · «Pantalla del director» y nombre de campaña · chips de estado (escena actual, «Ronda 2 · PNJ
rápidos», «Sesión 7 · 1 h 12 min») · estado de guardado · botones *Mantener encendida* y *Pantalla completa*.
Tocar el chip de escena o de combate lleva a su pestaña.

### 2.2 Escena (guía narrativa)
- Fuente: «Aventura» (si el mundo tiene `features.pestanaAventura`: hoy Caminapiedras) o «Escenas propias».
- Aventura: selector de capítulo, sub-vista *Escenas · PNJ · Combates · Mapas · Resumen*. La escena muestra el recuadro «Leer en voz
  alta» con el ornamento oficial y tamaño de letra ajustable (A−/A+, recordado en el dispositivo), contenido, caminos posibles,
  notas para la DJ y tablas. Botones: **Escena actual** (aparece en la barra superior) y **Jugada** (marca de avance + bitácora).
- Combates del capítulo: **Preparar encuentro** añade sus enemigos con la cantidad del libro, enlazados al catálogo por nombre
  (`Bandido (Ojos de Pala)` → `Bandido`, `Ylt, Vigilante de la Verdad` → `Ylt`); si no hay ficha, entra como enemigo libre.
- Mapas: miniatura → hoja a pantalla completa.
- Escenas propias: crear/editar (título, tipo, leer en voz alta, notas, imágenes por URL, enemigos «3 Bandido»), borrar con confirmación.

### 2.3 Encuentro
- Cabecera: título, **ronda**, tira de fases con los iconos oficiales de 2 y 3 acciones, **Fase siguiente** (al acabar la cuarta
  empieza ronda nueva: se limpian «actuado» y reacciones), **Añadir**, **Terminar combate** (confirmación + resumen en bitácora).
- Combatientes agrupados por fase según el turno elegido (rápido/lento); el Jefe aparece en las dos. Derrotados al final, plegados.
- Tarjeta: nombre, rango, PJ/PNJ, interruptor rápido/lento, **Actuado**, **Reacción** (icono oficial), barra de salud con
  **Daño / Curar** (teclado numérico grande; resta el desvío si se marca), concentración e Investidura (PNJ), defensas, desvío,
  estados (con valor entre corchetes: *Agotado [−2]*, *Afligido [2d10 vital]*), inmunidades, ataques de la ficha (tirada privada con un
  toque), notas. A 0 de salud: Secuaz → derrotado; resto → *Inconsciente*.
- Añadir: del catálogo del mundo (con cantidad), personajes de la campaña (o «todo el grupo»), o libre (nombre, salud, defensas, desvío).

### 2.4 Grupo
Tarjetas de los PJ con defensas (marco oficial), salud, concentración, Investidura (y la actual en mundos con recurso), desvío,
movimiento, habilidades plegables, estados que tengan en el encuentro y **Añadir al encuentro** / **Ver ficha**.

### 2.5 Tiradas
- **Tirada del director**: quién (Director, un combatiente o un PJ), modo *Prueba* (habilidad con su modificador o libre, ventaja,
  dado de trama), *Ataque* (ataques leídos de la ficha o manual: bonificador + dados), *Daño* y *Libre*. Interruptor **Privada**.
- Registro unificado (lo más nuevo arriba): tiradas de la mesa (API + tiempo real) y privadas (candado). Filtro *Todas · Mesa · Privadas*.

### 2.6 Bitácora
- **Empezar sesión** (número propuesto = siguiente al último del diario o de la historia; título opcional). Si llega un evento sin
  sesión abierta, se abre una automáticamente.
- Apunte rápido con etiqueta (*Apunte · Pista · Decisión · PNJ · Botín · Gancho*). Eventos automáticos: escena jugada o fijada,
  combate empezado/terminado (rondas y derrotados), avances, hitos de metas, tramas.
- **Copiar prompt de crónica** (formato de `docs/diario-formato.md`) y **Descargar notas (.md)**. **Terminar sesión** la archiva.
- Borrar un apunte o una sesión archivada pide confirmación.

### 2.7 Avances
Por capítulo (aventura): barra de progreso y casillas de lista de verificación, progresión, escenas jugadas y combates.
**Tramas** propias (abierta / en curso / resuelta). **Metas de los PJ**: hitos 0-3 con la API de metas existente
(`PUT …/metas/{id}`), que también anota en la bitácora.

## 3. Reglas aplicadas (fuentes)

- Orden de combate: `src/data/combatRules.ts` (sección «Orden del combate»): PJ rápidos → PNJ rápidos → PJ lentos → PNJ lentos;
  turno rápido 2 acciones, lento 3.
- Rangos de adversario en el catálogo (`GlobalNpcs.Tipo`): «Secuaz Rango 1…», «Rival…», «Jefe…». Secuaz: «derrotado al sufrir una
  lesión»; Jefe: «puede jugar un turno rápido y un turno lento en cada ronda» (Manual de la partida, apéndice A).
- Estados (resúmenes propios, no citas). Núcleo Cosmere: Afligido, Agotado, Aturdido, Concentrado, Desorientado, Inconsciente,
  Inmovilizado, Mejorado, Ralentizado, Resuelto, Retenido, Sorprendido, Tumbado. Archivo de las Tormentas añade **Empoderado**
  (*Puente Nueve*, tabla de estados). Nacidos de la bruma añade **Desprovisto** y **Mermado** (L.310-311 / PDF 316-317).
- Defensas: 10 + los dos atributos de su columna (`COLUMNAS_COSMERE`). Modificador de habilidad: rango + atributo.

## 4. Documento de la pantalla (`State`, versión 2)

Definido en `src/pages/pantalla/estado.ts` (`PantallaEstado`), normalizado al cargar (`normalizarEstado`), así un documento
antiguo o parcial nunca rompe la pantalla. La versión 1 guardaba un solo `encuentro` y los `retirados` como nombres: al cargarla
se convierte sola (el encuentro pasa a `encuentros[0]` y cada retirado a `{ nombre, motivo: 'derrotado' }`).

```ts
interface PantallaEstado {
  version: 2
  escenaActual: { origen: 'aventura' | 'propia'; capituloId: string | null; escenaId: string } | null
  escenasPropias: EscenaPropia[]          // título, tipo, leerEnVozAlta, notas, imagenes[{url,titulo}], enemigos[{nombre,cantidad,adversarioId}]
  marcas: Record<string, string>          // 'aventura:cap1:escena:apertura' → fecha ISO
  tramas: Trama[]                         // título, detalle, estado
  encuentros: Encuentro[]                 // abiertos a la vez (máx. 4): título, ronda, fase, combatientes[], retirados[{nombre,motivo}]
  encuentroActivo: string | null          // el que está en pantalla y recibe los «Añadir» de los otros paneles
  sesion: SesionMesa | null               // número, título, inicio, eventos[]
  historial: SesionMesa[]                 // sesiones terminadas (máx. 30)
  tiradasPrivadas: TiradaPrivada[]        // últimas 60
  cambios: CambioCombate[]                // daño, curación, concentración, Investidura y estados anotados (últimos 150)
}
```

## 5. API y base de datos

### 5.1 Tabla `GmScreens` (migración `AddGmScreens`)
| Columna | Tipo | Notas |
|---|---|---|
| `CampaignId` | bigint PK, FK → `Campaigns` (cascade) | una fila por campaña, se crea al primer guardado |
| `State` | text, default `'{}'` | objeto JSON; el servidor no lo interpreta |
| `Version` | integer | *concurrency token* |
| `UpdatedAt` | timestamptz | |

Migración **aditiva** (solo `CREATE TABLE`): segura con el auto-migrado al arrancar la API en producción.

### 5.2 Endpoints
| Método | Ruta | Respuesta |
|---|---|---|
| GET | `/campaigns/{id}/gm-screen` | `{ state, version, updatedAt }` (documento vacío `{}` y versión 0 si no hay) |
| PUT | `/campaigns/{id}/gm-screen` | body `{ state, version }` → 200 con la nueva versión, **409** con el documento guardado si la versión no coincide, 400 si no es un objeto o pasa de 1 MB |

No miembro → 404; miembro no director → 403.

### 5.3 Backup y rollback (DEV y producción)
1. Backup antes de aplicar:
   `docker exec cosmere-postgres-local pg_dump -U jira -d cosmere -Fc > ../backups/cosmere-dev-<fecha>-pre-AddGmScreens.dump`
2. Aplicar: arrancar la API de la rama (auto-migra) o
   `dotnet ef database update --project Infrastructure --startup-project API` (con la API parada).
3. Rollback (cualquiera de los dos):
   - `dotnet ef database update AddCampaignIniciadaEn --project Infrastructure --startup-project API` (ejecuta el `Down`: `DROP TABLE "GmScreens"`).
   - SQL: `docs/pantalla-director/sql/AddGmScreens.down.sql` (idempotente; borra la tabla y su fila de `__EFMigrationsHistory`).
   - Restaurar todo: `docker exec -i cosmere-postgres-local pg_restore -U jira -d cosmere --clean < <backup>.dump`.
   Ojo: si la API de la rama vuelve a arrancar, re-aplica la migración. Para descartar la feature hay que parar esa API.
4. Producción (cuando se despliegue): `pg_dump` y etiquetar imágenes `:prev` como siempre (CLAUDE.md, «Deployment»).

## 6. Web

| Archivo | Cambio |
|---|---|
| `src/pages/pantalla/*` (nuevo, *chunk* perezoso) | `PantallaPage`, `usePantalla` (carga, autoguardado, conflicto), `estado.ts`, `adversarios.ts`, `exportar.ts`, paneles `PanelEscena`, `PanelEncuentro`, `PanelGrupo`, `PanelTiradas`, `PanelBitacora`, `PanelAvances`, piezas comunes `piezas.tsx` |
| `src/api/gmScreen.ts` (nuevo) | `gmScreenApi.get(cId)`, `gmScreenApi.save(cId, state, version)` |
| `src/types/index.ts` | `GmScreen`, `SaveGmScreenRequest` (espejo de los DTO C#) |
| `src/worlds/types.ts`, `estados.ts` (nuevo), `stormlight.ts`, `mistborn.ts` | `WorldConfig.estados` (núcleo + los del mundo) |
| `src/App.tsx` | ruta `pantalla` con `React.lazy` |
| `src/components/AppLayout.tsx`, `src/index.css` | modo inmersivo en la ruta `pantalla` (`.app-main--inmersiva`) |
| `src/components/Sidebar.tsx` | entrada «Pantalla» en la sección Director (escritorio y raíl de tablet; no en la barra inferior del móvil, que ya tiene 5) |
| `src/pages/gm/GmPage.tsx` | tarjeta de acceso «Pantalla del director» encima de las pestañas |
| `src/pages/gm/CaminapiedrasPage.tsx` | exporta `RollTable` (sin cambio visual) |

Reglas: nada compara ids de mundo; textos visibles en español; estilos en línea con tokens; superposiciones con `Sheet`/`ConfirmDialog`;
toda eliminación pide confirmación; la pantalla entera es un *chunk* perezoso (no engorda el arranque de los jugadores).

## 7. Tareas

| # | Tarea | Aceptación | Verificación |
|---|---|---|---|
| P1 | API: entidad, contexto, DTO, servicio, controlador, registro | GET/PUT según §5.2 | `dotnet build` sin errores |
| P2 | Migración `AddGmScreens` + scripts SQL up/down | solo `CREATE/DROP TABLE` | revisar migración; `docs/pantalla-director/sql/*` |
| P3 | Backup DEV + aplicar migración | tabla creada, historial con `AddGmScreens` | `\d "GmScreens"` en psql |
| P4 | `estado.ts`, `adversarios.ts`, `exportar.ts` (puros) | normaliza documentos parciales; parsea los ataques del catálogo | `npx tsc -b` |
| P5 | `gmScreenApi`, tipos, `usePantalla` | autoguardado, 409 con aviso y elección | red: PUT tras 0,8 s; dos pestañas → aviso |
| P6 | `PantallaPage` + ruta + modo inmersivo + accesos | director entra; jugador redirigido | navegador: 1180×820 y 390×844 |
| P7 | `PanelEncuentro` | fases, daño/curar, estados, Jefe doble, Secuaz a 0 | flujo completo de un combate |
| P8 | `PanelEscena` | aventura + escenas propias, preparar encuentro | Stormlight y Mistborn |
| P9 | `PanelTiradas` | registro en vivo + privadas + publicar | tirada desde el FAB aparece sin recargar |
| P10 | `PanelBitacora` | sesiones, apuntes, eventos, exportar | copiar *prompt* |
| P11 | `PanelAvances` + `PanelGrupo` | marcas, tramas, hitos de metas | hito visible en la ficha de metas |
| P12 | `WorldConfig.estados` | listas por mundo | `grep -rnE "===\s*'(mistborn\|stormlight)'" src` vacío |
| P13 | Calidad | `npx tsc -b` y `npm run lint` limpios; Stormlight sin cambios fuera de la pantalla | capturas antes/después de `/gm` |

## 8. Relación con el diario y con la partida preparada (siguientes iteraciones)

Lo que ya queda enlazado en v1: la bitácora usa el **número de sesión del diario** y exporta el *prompt* de crónica con el formato de
subida. Propuestas para cuando lo decidas:

1. **Partida preparada**: una «preparación» por sesión del calendario (`Sessions`): escenas elegidas (del libro o propias), encuentros
   montados de antemano, PNJ y recursos visuales. La pantalla abriría directamente la preparación de la sesión de hoy.
2. **Del cierre al diario**: al terminar la sesión, adjuntar las notas a la sesión del calendario y, cuando se suba la crónica con ese
   número, enlazarlas («Notas del director» solo visibles para él).
3. **Mostrar a la mesa**: enviar un mapa, una imagen o un texto a los móviles de los jugadores (evento SignalR `MesaMostrar`).
4. **Imágenes propias subidas** (hoy solo URL): almacenamiento en el servidor (volumen Docker) o en el propio documento.
5. **Daño de zona**: aplicar un mismo daño a varios combatientes seleccionados.
6. **Estado de mesa de los PJ** compartido con sus fichas (salud actual, Investidura actual de Nacidos de la bruma).

## 9. Preguntas para Xavi (con la opción por defecto aplicada)

1. **Nombre**: «Pantalla del director» (como la pantalla física del DJ). ¿Prefieres «Mesa», «Modo mesa» o «Dirigir»? *(por defecto: Pantalla)*
2. **PWA instalada**: el manifiesto fija `orientation: portrait-primary`; en una tablet Android con la app instalada, la pantalla completa
   intenta bloquear a horizontal. ¿Cambiamos el manifiesto a `any`? Afecta a los móviles de los jugadores. *(por defecto: no se toca)*
3. **Tiradas privadas**: ¿quieres que, al publicar, aparezca «(Director)» junto al nombre del enemigo? *(por defecto: solo el nombre)*
4. **Salud de los PJ en el encuentro**: v1 la lleva el director solo dentro del encuentro. ¿Quieres que sea la salud «oficial» y la vean
   los jugadores en su ficha? Requiere guardar la salud actual del personaje en el servidor. *(por defecto: no)*
5. **Nacidos de la bruma**: ¿pasamos los resúmenes de «El legado de los nacidos de la bruma» a datos de aventura (como Caminapiedras)
   para la guía narrativa? *(por defecto: escenas propias)*

## 10. Fuera de alcance de v1

Edición de la aventura del libro, subida de imágenes, sincronización en vivo entre dos dispositivos del director (hay detección de
conflicto, no fusión), temporizadores de duración de estados y cualquier cambio en las pantallas de jugador.

## 11. Estado de la implementación (DEV, 8 oct 2026)

P1-P13 y la iteración 2 integradas en `main` el 8 oct 2026 (merge de `feature/pantalla-director` en `cosmere-api` y `cosmere-web`).

### Levantar DEV
- Desde Claude: configuraciones `pantalla-api` (puerto 5200) y `pantalla-web` (5173) de `cosmere-web/.claude/launch.json`.
- A mano: `dotnet run --project ../cosmere-api-pantalla/API --no-launch-profile --urls http://localhost:5200` y `npm run dev` en
  `cosmere-web-pantalla`. La API aplica `AddGmScreens` al arrancar.
- Tablet en la misma Wi-Fi: `http://<IP del PC>:5173` (Vite ya escucha en la red, `host: true`). Por `http` el navegador no permite
  «Mantener pantalla encendida» (el botón no aparece) y la copia del *prompt* usa el método antiguo del portapapeles; en producción
  (`https`) funcionan los dos. Windows puede pedir permiso de red para Node la primera vez.

### Base de datos (DEV)
- Backup previo: `personal/backups/cosmere-dev-2026-10-08-pre-AddGmScreens.dump` (`pg_dump -Fc`, 20 tablas con datos).
- Migración `20261007220052_AddGmScreens` aplicada: tabla `GmScreens` (PK `CampaignId`, FK en cascada a `Campaigns`).
- Rollback: parar `pantalla-api` y ejecutar `docs/pantalla-director/sql/AddGmScreens.down.sql`
  (`docker exec -i cosmere-postgres-local psql -U jira -d cosmere < docs/pantalla-director/sql/AddGmScreens.down.sql`), o
  `dotnet ef database update 20261007192956_AddCampaignIniciadaEn --project Infrastructure --startup-project API` en `cosmere-api-pantalla`.
  Restauración total: `docker cp` del backup al contenedor y `pg_restore -U jira -d cosmere --clean --if-exists <ruta>`.

### Verificación hecha
- API: GET vacío (versión 0) · PUT 200 · PUT con versión vieja **409** con el documento guardado · `state` no objeto **400** ·
  jugador **403** · no miembro **404** · sin token 401.
- Web (1180×820 horizontal, oscuro y claro; 375×812 vertical): dos paneles / un panel; fijar escena (chip superior y sesión 1 abierta
  sola); «Preparar encuentro» de «Emboscada en el camino» → 4 bandidos enlazados al catálogo (Secuaz, salud 11, desvío 1, Maza y Arco
  corto); 12 de daño − desvío → 0 y derrotado, con línea en la bitácora; «Todo el grupo» con defensas del servidor; *Agotado [−2]*;
  cuatro fases → ronda 2; tirada privada desde la tarjeta y tirada pública que vuelve por SignalR al registro; apunte «Pista» y
  *prompt* de crónica; marcas de avance; hito de meta por la API de metas; conflicto entre dispositivos (aviso, «Usar la versión
  guardada»); escena propia con lectura y enemigos; campaña Nacidos de la bruma (tema, emblema, sin aventura, estados propios).
- `npx tsc -b` y `npm run lint` limpios; ninguna comparación de ids de mundo.
- *Bundle*: la pantalla es un *chunk* propio (`PantallaPage`, 146 kB tras la iteración 2). Scripts que carga `index.html`: 1.521.841
  bytes en `main` (30c496c) → 1.526.811 con la rama (+5,0 kB: estados por mundo y accesos).
- Subida a producción simulada: copia de la base de antes de la funcionalidad + `dotnet ef database update` → las cuatro migraciones
  (`AddGmScreens`, `SeedMistbornAdversarios`, `SeedLegadoAdversarios`, `AddGlobalNpcEra`) sin errores y las 64 filas idénticas a DEV
  (suma md5 de todas las columnas). Los scripts `sql/*.up.sql` y `*.down.sql` se probaron en otra copia: ida y vuelta al estado de
  `main`. Los dos scripts de datos no son idempotentes a propósito: el `--idempotent` de EF sangra las líneas de los textos.

### Adversarios de Nacidos de la bruma (8 oct 2026)
- Fuente: **Guía del mundo**, capítulo 8 «Adversarios» (L.217-263 / PDF 223-269): **38 perfiles** (el Manual no trae bestiario).
- Migración `20261008064239_SeedMistbornAdversarios` (solo `InsertData`, `World = mistborn`, `Source = «Guía del mundo»`),
  generada con `scripts/adversarios/` (extracción con PyMuPDF + analizador validado). Habilidades como rango (total − atributo),
  igual que `SeedAllNpcs`. Rasgos en `Talentos`; desvío, movimiento, sentidos, inmunidades, artes metálicas, acciones (con su
  coste), tácticas y cita «L./PDF» en `Notas`; descripción en `Apariencia`.
- Seis perfiles imprimen defensas que no son 10 + atributos (Agente del grupo, Avatar de Trell, Fanático, Defensor kandra,
  Piloto malwish, Plebeyo; comprobado en las páginas renderizadas): llevan una «Nota del libro» y la pantalla usa las impresas.
- La pantalla entiende el formato de ataque del libro («Ataque +4, …, 1d6 + 4 de daño»), ofrece Alomancia/Feruquimia en las
  tiradas del adversario y tiene botón **Ficha** (rasgos, acciones con iconos de coste y tácticas) en cada tarjeta de adversario.
- Backup previo: `personal/backups/cosmere-dev-2026-10-08-pre-SeedMistbornAdversarios.dump`. Rollback:
  `docs/pantalla-director/sql/SeedMistbornAdversarios.down.sql` (borra esas 38 filas y su línea del historial; parar antes la API).
- Corrección posterior: 15 perfiles mejoraron con el analizador final (acciones partidas por la etiqueta de era, tácticas,
  descripciones de Forajido y Jefe de forajidos). La migración se regeneró con esos datos y en DEV, que ya la tenía aplicada, se
  actualizaron esas filas en su sitio (mismos ids) con `personal/backups/dev-2026-10-08-corregir-guia-del-mundo.up.sql`
  (deshacer: `.down.sql`). Solo DEV: en producción la migración ya inserta los datos buenos.
- **El legado** (Apéndice A, L.189-239 / PDF 192-242): 44 perfiles, de los que 18 son reimpresiones de la Guía con los mismos
  números. Migración `20261008073931_SeedLegadoAdversarios` con los **26 propios** (`Source = «El legado»`, ids 84-109 en DEV).
  Ascendencia que el nombre no dice, leída de su descripción: NeBaal kandra, Azmine Wilko sangre koloss, Yunque koloss («aceptó sus
  clavos koloss», cap. 7), bestia y monstruosidad hemalúrgicas «Criatura hemalúrgica». Backup:
  `personal/backups/cosmere-dev-2026-10-08-pre-SeedLegadoAdversarios.dump`; rollback: `sql/SeedLegadoAdversarios.down.sql`.
- Pendiente de decidir: los «Módulos de adversario» de la Guía (PDF 270-284).

### Eras de los adversarios (8 oct 2026)
- El libro marca la era por sección en los marcadores del PDF («ERA 1» / «ERA 2»; «Eras de los adversarios», L.216 / PDF 222): una
  sección sin marca vale para las dos eras, y una capacidad con el símbolo solo se usa en esa era.
- Nueva columna **`GlobalNpcs.Era`** (`smallint` nulo: 1, 2 o vacío = ambas, como el catálogo), migración
  `20261008074753_AddGlobalNpcEra`: añade la columna y rellena la de las filas de los dos libros (Guía: 5 de Era 1, 9 de Era 2;
  El legado: 9 de Era 1, 15 de Era 2; el resto, ambas). Las subsecciones heredan la marca de su sección (Vigilante de la ley en
  «Agentes de la ley ERA 2», los mellizos Buvidas en «Mellizos Buvidas Era 1», iniciado y aspirante en «Miembro de una sociedad Era 2»).
- `GET /global-npcs?campaignId=` filtra por el mundo y la era de la campaña (los de su era + los de ambas); un adversario creado en
  una campaña toma su era. Comprobado: Era 1 → 40 (Bezryl sí, Yunque no); Era 2 → 50 (al revés); Archivo de las Tormentas → 35.
- En la pantalla, un perfil de ambas eras solo trae los ataques de la era de la campaña (el Detective de Era 1 lleva Cuchillo y no
  la Pistola de cañón corto), y la **Ficha** oculta las líneas de la otra era con un aviso («Se oculta 1 capacidad…»); la marca de la
  propia era se ve como chip «Era 1».
- Backup: `personal/backups/cosmere-dev-2026-10-08-pre-AddGlobalNpcEra.dump`; rollback: `sql/AddGlobalNpcEra.down.sql` (quita la
  columna; parar antes la API).

### Iteración 2 de la pantalla (8 oct 2026)
- **Combates simultáneos**: hasta 4 encuentros abiertos. Pestañas sobre el encuentro (título, ronda, fase y cuántos faltan por actuar),
  un chip por combate en la barra superior y **Combate simultáneo** (título y PJ que luchan allí; los que estaban en otro combate se
  mueven con su salud y estados). **Mover a «…»** en la hoja de editar. Escena y combates del libro: **Como combate simultáneo**.
  «Todo el grupo» solo trae a los PJ que no luchan en ningún sitio. La bitácora anota «Empieza «B», a la vez que «A»» y los movimientos.
- **Defensas y desvío a la vista** en la tarjeta plegada de los PJ (física, cognitiva, espiritual y desvío) para las tiradas con dados
  de verdad; las tarjetas de PNJ ya los mostraban.
- **Registro de cambios** junto a las tiradas (panel Tiradas, filtro **Cambios**): daño con la cuenta del desvío, curación, concentración
  e Investidura (los toques seguidos se juntan en una línea: «Gasta 3 de concentración · 5 → 2/5»), estados y salidas del combate.
- **Desvío**: «Restar el desvío» vuelve a estar activado por defecto y la cuenta se ve siempre («Daño 5 − 1 por desvío = 4»); el botón
  dice «Daño 4 → salud final». Se puede desactivar para el daño espiritual o vital.
- **Series numeradas**: varios enemigos iguales se llaman «Guardia 1, Guardia 2…» aunque se añadan de uno en uno, y la tesela de su
  tarjeta muestra el número en grande para seguirlos entre turnos rápidos y lentos.
- **Retirar del combate** (botón en cada tarjeta y en la hoja de editar), con motivo: *Ha huido*, *Se rinde*, *Derrotado* o *Quitar sin
  más*. Los tres primeros se anotan y el resumen final los cuenta («Derrotados: …. Huyen: …. Se rinden: …»).
- Verificado en el navegador en las campañas de prueba 10 (Era 1), 11 (Era 2) y 3 (Archivo de las Tormentas, sin cambios de
  comportamiento salvo los nuevos de la pantalla).

### Revisión tras el despliegue (8 oct 2026, rama `fix/pantalla-director-revision`)
Revisión de código en tres partes (API y datos, estado y lógica, paneles), con cada hallazgo comprobado antes de tocarlo.
- **API.** Un texto con medio emoji (un *surrogate* UTF-16 suelto) se guardaba y luego no se podía devolver: todo GET y todo 409
  de la campaña daban 500 hasta tocar la base de datos. Ahora el PUT responde 400 sin guardar. El 409 se limita a las carreras de
  verdad: concurrencia o clave primaria duplicada. Los PNJ globales (crear, editar, borrar) piden ser director de la campaña: un
  jugador podía cambiar el catálogo de todo el mundo.
- **Guardado.**
  - Se envía el texto saneado (medio emoji → U+FFFD), con 15 s de tiempo máximo.
  - Un 4xx («rechazado») se muestra con su motivo y un botón «Reintentar», sin reintentos en bucle; la red y los 5xx sí se reintentan.
  - Por encima de 900 KB se quitan las sesiones cerradas más antiguas.
  - Una respuesta perdida ya no da un falso conflicto: si el 409 trae nuestro mismo documento, se sigue desde su versión.
  - Al salir se intenta un último guardado, sin bucle; la visita siguiente lo espera antes de leer el documento.
  - Un documento de una versión más nueva de la app se abre en solo lectura.
  - Salir con cambios que el servidor no tiene pide confirmación.
  - Los dos botones del conflicto piden confirmación.
- **Paneles.**
  - Un panel abierto desde un chip queda montado (no se pierden borradores).
  - Las pestañas y los chips de combate solo guardan si cambian; el chip del combate en pantalla se marca (`aria-current`).
  - Pantalla completa y orientación se liberan al salir.
  - Las tiradas de la mesa se releen al volver de reposo, y una tirada pública que no llega a la mesa se avisa.
  - «Preparar encuentro» espera al catálogo.
  - El botón de añadir dice qué añade («Añadir 3 × Bandido»), y una búsqueda sin coincidencias lo dice.
- **Encuentro.**
  - «Cancelar» en «Retirar del combate» vuelve a la hoja de editar con sus cambios, y «Quitar sin más» pide confirmación.
  - Un PJ que vuelve deja de contar entre los que huyeron, y los PJ que se mueven de combate se anotan.
  - Las series nunca renombran a un PJ ni repiten el número de un retirado.
  - Los nombres del catálogo se usan tal cual («Quimera hemalúrgica, líder de manada»); solo se acortan los de la aventura.
  - Cantidades de 1 a 30.
  - Salud mínima de 1.
  - El desvío condicional del libro se ve («5 · solo contra laceración») en la tarjeta, en la cuenta y en el interruptor.
  - «Duplicar» trae concentración e Investidura llenas, y los títulos repetidos se numeran.
  - Al cargar, los ids repetidos se regeneran y un PJ nunca está en dos combates.
  - «falta 1».
- **Datos.** El glifo de reacción de Kwylliam Elariel salía como «R» mayúscula y unía dos acciones: se corrigió el analizador y la
  migración de El legado antes del despliegue. Los scripts SQL de datos son ahora no idempotentes, porque el `--idempotent` de EF
  sangra los textos.
- **Para más adelante** (anotado, sin hacer):
  - Al girar la tablet se remontan los paneles y se pierden las hojas abiertas (el documento no).
  - Aviso de cambios sin guardar al cerrar una hoja de formulario.
  - La tarjeta se remonta al cambiar de turno rápido/lento (se pliega la de un PJ desplegado).
  - Navegación con flechas en la lista de motivos de «Retirar».
  - Cabecera en 375 px.
  - Lista de PNJ del *prompt* de crónica cuando ya no hay combate abierto.
  - Copia local del documento sin guardar.
  - Nombres de funciones en español frente a la norma del proyecto.
  - `GET /global-npcs/{id}` sin filtrar por mundo y era.
  - Respuesta del PUT más ligera y atributos de Swagger.

### Iteración 3: Guion de la partida (8 oct 2026, rama `feature/guion-director`, solo web)
Xavi quiere un **borrador de lo que debería pasar a partir de ahora** para usarlo en la mesa: historia, pruebas, explicaciones e
imágenes. Lo jugado manda: al subir la crónica, el siguiente borrador parte de ella. Formato y ciclo: `guion-formato.md`.

- **Qué no permitía la pantalla.**
  - Las escenas propias eran planas: sin pruebas con CD, empeños, contadores, ganchos por PJ, caminos, casillas, orden, grupos ni
    «escena siguiente».
  - Las reglas de un combate no se veían en el encuentro.
  - No había forma de preparar el guion fuera de la mesa e importarlo.
  - Además, los datos de la aventura no coincidían con el libro, sobre todo en el capítulo 3 (el Resto Gris es un spren y Código
    une críptique; Teryn es «ella»; Ylt huye con la hoja). Corregidos los cuatro capítulos: ver «Datos de la aventura» más abajo.
- **Documento versión 3** (`estado.ts`).
  - `EscenaPropia` pasa a ser `{ id, md }`; las de la versión 2 se convierten solas a Markdown.
  - Nuevos campos `guionTitulo`, `empenos`, `contadores` y `resultados` (estado de mesa por escena), y `Encuentro.escenaId`.
  - `quitarEscena` limpia todo lo de una escena; las claves salen de `claveCasilla`, `claveResultado` y `claveContador`.
- **`guion.ts`** (puro). Lee una escena (metadatos, cuerpo, secciones con clase y pruebas «CD» o «contra»). Divide un archivo en
  escenas por `# Grupo` / `## Escena`, fusiona por grupo y título conservando los ids, y escribe el guion de vuelta (ida y vuelta
  idéntica). `FORMATO_GUION` va dentro del *prompt*.
- **`PanelGuion.tsx`** (fuente «Guion» del panel Escena).
  - Índice por grupos con lo jugado; detalle con lectura en voz alta, imágenes, empeño, contadores y secciones.
  - Pruebas con Superada/Fallada; PNJ con «Añadir al encuentro» (por nombre o `ficha:`); preparar encuentro.
  - «Jugada · pasar a…»; subir y bajar escenas; editar en Markdown con resumen en vivo; importar (pegar o `.md`) y exportar
    (copiar o descargar).
  - «Prompt del siguiente guion». El encuentro muestra «Reglas de «escena»» y sus contadores (`ReglasDeEscena`).
- **Avances.** A petición de Xavi se retira la pestaña Avances (marcaba hitos de metas por la API): la pantalla solo **recomienda**
  avances (`### Avances` del guion, sin casillas, con el aviso de que se aplican en la ficha). Los `- [ ]` de guiones antiguos se
  leen como viñetas.
- **Datos de la aventura** (`src/data/caminapiedras/`, ahora una carpeta: `tipos.ts`, `cap1.ts`…`cap4.ts`, `index.ts`; las
  importaciones no cambian). Los cuatro capítulos se contrastaron con el libro, extraído de nuevo por columnas en
  `pdfextract/caminapiedras_capitulos/`. Quedan en el orden y con los títulos del libro, y se conservan los `id` (las marcas de la
  pantalla siguen valiendo). PNJ, pruebas y CD, enemigos con el nombre exacto de su ficha, reglas, tablas, mapas, niveles y páginas
  coinciden con el libro; la redacción es propia y los recuadros de lectura citan la página. El mapa 1.3 era una ilustración de la
  PDF 34: ahora es el mapa real (`public/maps/map_p35.webp`).
- **Libro completo para importar**: `scripts/aventura/parsear_caminapiedras.py` (ver `guion-formato.md`). Salidas en local, fuera
  de git.
- **Libro y Sesión** (a propuesta de Xavi). El panel Escena tiene dos fuentes:
  - **Libro**: referencia fija. Sin escena actual ni marcas de jugada o superado (`claveAventura`, `useAlternarMarca` y `FilaMarca`
    se retiran; las marcas `aventura:…` de documentos antiguos se ignoran). Cada escena y cada combate tiene «Añadir a la sesión»
    (`BotonAnadirASesion`), que la convierte con `mdDesdeEscenaLibro` / `mdDesdeCombateLibro`: lectura, texto, pruebas sacadas del
    texto («prueba de X CD n» con su frase y «(X CD n)» con su cláusula), caminos, consejos, tablas, mapa, enemigos y reglas.
  - **Sesión**: el esqueleto preparado y todo el progreso. «Nueva escena» (`HojaEscenaRapida`) crea una escena en la mesa con
    título, tipo, lectura y qué pasa. Importar deja elegir escenas con casillas.
  - Lo añadido entra tras la escena actual de la sesión, o al final (`posicionTras`).
- **Índice en hoja** (`NavegadorEscenas`, en `piezas.tsx`, para las dos fuentes): fila fija con «Índice», ◀, título y ▶; la hoja
  agrupa por `grupo` (sesión) o por `section` (libro, nuevo campo de `Scene`) y tiene «Ir a la escena actual». Sustituye a la nube
  de 25 botones.
- **Piezas compartidas** movidas a `piezas.tsx` (`CabeceraEscena`, `Apartado`, `Parrafos`, `NavegadorEscenas`, `EnLinea`);
  `useCatalogo` va en `contexto.ts`. `CaminapiedrasPage` se carga bajo demanda en `GmPage` (los datos del libro salen del *chunk*
  principal).
- **Imágenes oficiales**: 12 WebP en `public/aventura/caminapiedras/` (1,5 MB, se cargan bajo demanda; la PWA no las precachea).
- **Datos DEV.**
  - Campaña **40 «Caminapiedras (copia 8 oct)»**: los 6 PJ y sus metas copiados de producción, sin diario ni sesiones.
  - Directores: albert, soul y el usuario de pruebas; jugadores emparejados por nombre; Oden sin asignar (no hay SupaHotFire en
    local).
  - Su pantalla tiene importado `guiones/caminapiedras-tras-la-batalla-del-salon.md` (16 escenas, del final de Rathalas al
    valle de la Vigilante Nocturna), sin nada marcado.
  - Backup previo: `personal/backups/cosmere-dev-2026-10-08-pre-copia-caminapiedras.dump`. Deshacer: borrar la campaña 40
    (en cascada).
- **Verificado** (1180×820 oscuro y claro, 375×812):
  - importar 16 escenas y reimportar (16 actualizadas, conserva marcas);
  - prueba superada a la bitácora; escena actual y «Jugada · pasar»;
  - encuentro de anguilas con 4 fichas del catálogo, reglas y «Daño del barco» compartido; empeño 6/4 superado a la bitácora;
  - *prompt* con PJ, metas y estado del guion; editor; sin desbordes en móvil.
  - Libro → Sesión: una escena del capítulo 4 sin escena actual entra al final; un combate del libro entra con mapa, enemigos y
    reglas; «Nueva escena» con «Karanak» como actual entra justo detrás y pasa a ser la actual; importar con una casilla
    desmarcada importa 2 de 3. Las escenas del libro dan 105 pruebas con CD en los cuatro capítulos.
  - `npx tsc -b`, `npm run lint` y `npm run build` limpios; ninguna comparación de ids de mundo. La pantalla sigue siendo un
    *chunk* propio.
- **Al desplegar.** No hay migraciones. Una web anterior abre un documento de versión 3 en solo lectura, con el aviso «Esta pantalla
  se guardó con una versión más nueva…» (protección de la revisión), así que no se pierde el guion. Se ve en DEV si se abre la
  campaña 40 en el 5173, que sirve `main`.

### Datos de prueba creados en DEV (campaña 3 «Regresión Stormlight», usuario de pruebas)
Documento de la pantalla (encuentro, sesión 1, una escena propia, una trama «Trama creada en otro dispositivo»), la meta de prueba
«Proteger a los suyos (prueba pantalla)» (id 80, personaje 9) y una tirada pública de prueba en el registro de dados.
