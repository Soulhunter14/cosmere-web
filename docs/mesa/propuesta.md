# La mesa — pantalla del jugador — propuesta v1

> Sigue a la «Pantalla del director» (`docs/pantalla-director/propuesta.md`, §8.3 «Mostrar a la mesa» y §8.4 «Imágenes propias»).
> Se haría en la rama `feature/mesa` (web y API) en los *worktrees* `cosmere-web-mesa` y `cosmere-api-mesa`, probando en
> «Bruma TEST» (42) y en «Caminapiedras» (1). Nada de esto está hecho: es la propuesta para revisar antes de tocar código.

## 0. Resumen

Una sección **para los jugadores**, pensada para el **móvil en la mesa**, que enseña lo que el director decide compartir de su
pantalla, en tiempo real:

| Bloque | Qué ve el jugador |
|---|---|
| **Combate** | Los encuentros abiertos: ronda y fase (PJ rápidos → PNJ rápidos → PJ lentos → PNJ lentos). **Compañeros** con su salud, concentración, Investidura, estados y si ya han actuado. **Enemigos** solo por nombre (Guardia 1, Guardia 2…), con sus estados, si han actuado y si han caído; sin salud, defensas, rango ni ataques. Huidos y rendidos. |
| **En la mesa** | La imagen que el director proyecta («Veis esto…», «El personaje se ve así»): mapa del libro, ilustración del guion, retrato de un adversario, imagen subida por el director o una URL. Se abre a pantalla completa con zoom. Cuando el director la quita, los jugadores no ven nada (el historial para «Volver a mostrar» es solo del director). |
| **Sesión** | Número y título de la sesión abierta y tiempo jugado. Indicador «Al día / Sin conexión». |

El director no tiene que hacer nada nuevo para el combate: lo que ya lleva en su Encuentro se publica solo (puede ocultar un
encuentro entero o un enemigo concreto). Para las imágenes, un botón **«Mostrar a la mesa»** allí donde ya ve imágenes
(galería del guion, mapas del libro, retrato del adversario) y un panel nuevo **Mesa** con sus imágenes subidas.

## 1. Decisiones por defecto (revisables)

| # | Decisión | Por qué |
|---|---|---|
| D1 | Nombre **«La mesa»**, ruta `/campaigns/:id/mesa`, entrada «Mesa» en el menú del jugador. El director también puede abrirla («Ver la mesa como jugador»). | Es «lo que hay sobre la mesa»; la «Pantalla» sigue siendo la del director. |
| D2 | **La API no interpreta la pantalla del director.** La web deriva un segundo documento, el **documento público** (`MesaPublica`), con una función pura `proyectarMesa(estado)` y lo guarda **en el mismo PUT** que la pantalla, en una columna nueva `GmScreens.Mesa`. Los jugadores leen solo esa columna (`GET /campaigns/{id}/mesa`). | Mismo principio que `GmScreens.State`: la web es dueña de la forma, sin migraciones por cada iteración. Un solo guardado, una sola versión: la pantalla y la mesa nunca se desincronizan. El servidor sigue sin leer dentro. |
| D3 | Tiempo real **sin contenido por el hub**: tras un guardado que cambie la mesa, la API emite `MesaUpdated { campaignId, version }` al grupo de la campaña y los móviles vuelven a pedir el documento. | `JoinCampaign` no comprueba la pertenencia (nota en `CrewController`): por el hub solo viajan ids, como en «La banda». |
| D4 | Un encuentro **nace oculto** (`Encuentro.enMesa = false`); el director lo publica con **«Mostrar en la mesa»** en su cabecera (y lo vuelve a ocultar con «Ocultar de la mesa»). Un enemigo puede marcarse además **«Oculto a la mesa»** (`Combatiente.oculto`). | Respuesta de Xavi (23 oct 2026): oculto por defecto. Un encuentro preparado desde una escena nunca destripa una emboscada. |
| D5 | De los **enemigos** se publica: nombre tal como está en la pantalla (el director puede renombrarlo), estados con su valor, turno elegido y si ha actuado, caído, y una **pista de salud** de tres niveles («Intacto / Herido / Malherido», más «Caído») **solo si el director la muestra** para ese enemigo (`Combatiente.mostrarSalud`, por defecto no). **No** se publica el número de salud, defensas, desvío, rango, inmunidades, ataques, habilidades ni notas. | Lo que pidió Xavi: «el listado de enemigos pero no sus stats o su vida, pero sí estados alterados»; la pista la decidió el 23 oct 2026: «sí, pero por defecto oculta, la muestra el director a su discreción». |
| D6 | De los **compañeros** (bando PJ) se publica todo lo que el director lleva: salud, concentración, Investidura, estados, turno, actuado, reacción. | Es su equipo; la salud del encuentro es la que el director apunta (la ficha no guarda salud actual). |
| D7 | Las **imágenes subidas** van a la base de datos (`CampaignImages`, `bytea`), ≤ 3 MB cada una y ≤ 50 por campaña, como las fichas del libro. | Sin volúmenes nuevos en `docker-compose.yml` ni en `deploy.sh`; nginx ya deja pasar 4 MB en `/api/`. |
| D8 | El **retrato** de un adversario (`book-images/retrato`) pasa a poder leerlo cualquier miembro de la campaña; la ficha y las tácticas siguen siendo del director. | Para «el personaje se ve así» y para el avatar del enemigo en el móvil. |
| D9 | La proyección y su historial (10 últimas) viven en la pantalla del director (`PantallaEstado.mesa`) y se vacían al **Terminar sesión**. El historial **no se publica**: los jugadores ven solo la imagen que está en la mesa, y nada en cuanto el director la quita. | La sesión siguiente empieza limpia; la bitácora anota cada «Se muestra a la mesa: …» para la crónica. Xavi (23 oct 2026): «no debería haber nada en la mesa y los jugadores ven los mapas» → el historial dejó de publicarse. |
| D10 | La página del jugador **no es inmersiva**: conserva la barra inferior (el jugador va y viene de su ficha y del lanzador de dados) y ofrece «Mantener encendida» y «Pantalla completa» como la del director. | En la mesa el móvil se apaga; los dos botones ya existen y se extraen a un módulo común. |
| D11 | El documento público lleva `version: 1` y se normaliza al leer (`normalizarMesa`). Una mesa guardada por una versión más nueva de la app muestra «Actualiza la app». | Mismo seguro que `VERSION_ESTADO` en la pantalla. |
| D12 | `VERSION_ESTADO` de la pantalla sube a **5** (`enMesa`, `oculto`, `mesa`). | Una versión anterior de la app abriría el documento en solo lectura en vez de perder esos campos. |

## 2. Experiencia

### 2.1 Jugador: «La mesa» (`/campaigns/:id/mesa`, móvil en vertical; también tablet)

Una columna, `maxWidth: 680`:

1. **Cabecera**: «La mesa» · nombre de la campaña · chip «Sesión 7 · 1 h 12 min» (si hay sesión abierta) · indicador de
   conexión: «Al día» (punto esmeralda), «Actualizando…», «Sin conexión · última actualización 21:04» (topacio). Botones
   «Mantener encendida» y «Pantalla completa».
2. **En la mesa** (solo si el director proyecta algo): la imagen a todo el ancho, su título y el pie en recuadro de cita
   («Veis esto…»). Tocar → hoja a pantalla completa con botones «−», «+», «Ajustar» y, para rutas públicas, «Abrir en pestaña
   nueva». Al llegar una imagen nueva el bloque se resalta un instante (sin vibración). Cuando el director la quita, el bloque
   desaparece: el jugador no conserva ninguna imagen anterior (ese historial es del director, para «Volver a mostrar»).
   **Niebla de guerra** (pedida el 23 oct 2026): un mapa llega **tapado en negro** y solo se ven las zonas rectangulares que el
   director destapa, también en la vista ampliada; con niebla no se ofrece «Abrir en pestaña nueva» (el archivo suelto enseñaría
   el mapa entero). Un texto dice «El director aún no ha destapado ninguna zona» o «El director va destapando el mapa».
3. **Combate** (un bloque por encuentro visible; el activo primero):
   - Cabecera: título, **Ronda n**, tira de las cuatro fases con la actual resaltada (los iconos oficiales de 2 y 3 acciones, como
     en la pantalla del director).
   - **Compañeros**: tarjeta por aliado, el del propio jugador primero con la píldora «Tú». Nombre, barra de **Salud** (`BarraRecurso`,
     granate; en rojo si ≤ ¼), **Concentración** y **Investidura** (si su máximo es > 0) como numerales pequeños, píldoras de
     **estados** (topacio, «Agotado [−2]»; tocar → hoja con el resumen del estado de `WorldConfig.estados`), chips «Rápido / Lento»,
     «Ha actuado», «Reacción usada», «Inconsciente». Un aliado sin personaje (PNJ amigo añadido por el director) sale como «Aliado».
   - **Enemigos**: fila compacta por enemigo: tesela con su número o inicial (`marcaDe`), retrato del libro si lo hay (avatar),
     nombre, píldoras de estados, punto «Ha actuado» y, si el director la muestra, la pista de salud como píldora
     («Intacto» esmeralda, «Herido» topacio, «Malherido» rubí). Los **caídos** al final, plegados («Caídos (3)»). Luego «Fuera del
     combate: huyen …, se rinden …».
4. Sin combate ni imagen: `EmptyState` «La mesa está tranquila» · «Cuando el director muestre algo, aparecerá aquí.»
5. Documento de una versión más nueva: aviso «Actualiza la app para ver la mesa» con «Recargar».

Datos: `useQuery(['mesa', cId])` + evento `mesaUpdated` (reenviado por el `DiceRoller` desde el hub) que invalida la clave;
`refetchOnReconnect`, refetch al volver a primer plano (`visibilitychange`) y `refetchInterval` de 45 s solo con la página
visible (red de seguridad si el móvil durmió y perdió el evento).

### 2.2 Director: lo que cambia en su pantalla

- **Encuentro**: en la cabecera del encuentro, botón **«Mostrar en la mesa»** / **«Ocultar de la mesa»** (nace oculto; una
  píldora «En la mesa» lo indica mientras está publicado). En la tarjeta de cada enemigo, en su menú: **«Oculto a la mesa»**
  (icono ojo tachado; la tarjeta lo indica con una píldora «Oculto»), **«Mostrar la salud a la mesa»** (la pista de tres
  niveles, nunca el número; píldora «Salud visible») y **«Mostrar el retrato a la mesa»** (si el adversario tiene retrato).
- **Galería** del guion y mapas del libro (`Galeria`): en la hoja de la imagen ampliada, botón **«Mostrar a la mesa»**.
- **Ficha del adversario** (`FichaAdversario`, pestaña Libro): **«Mostrar el retrato a la mesa»**.
- **Panel Mesa** (nuevo, en el panel «Registro»: Tiradas · Bitácora · **Mesa**; icono `Projector`):
  1. **Ahora en la mesa**: la imagen, título y pie de la proyección, **«Quitar de la mesa»**, y «Ver la mesa como jugador»
     (abre `/mesa` en pestaña nueva). **Editor de niebla**: interruptor «Niebla» (activo por defecto en los mapas de la pestaña
     «Mapas» y en las imágenes tituladas «Mapa…»; apagado en retratos, subidas y URL), el mapa entero bajo un velo con las zonas
     destapadas recuadradas; **arrastrar** (dedo, ratón o lápiz) destapa un rectángulo, la «×» de cada zona la vuelve a tapar y
     «Tapar todo» las quita. Las zonas van en fracciones del mapa (0-1), así caen en el mismo sitio en cualquier pantalla y zoom.
     Un arrastre menor del 1 % no destapa nada; máximo 50 zonas. «Volver a mostrar» recupera el mapa con sus zonas.
  2. **Encuentros**: por cada encuentro abierto, el botón «Mostrar en la mesa» / «Ocultar de la mesa» y «n enemigos ocultos».
  3. **Mostrar una imagen** (`Segmented`): **Subidas** (cuadrícula de las imágenes de la campaña, «Subir imagen» (WebP/PNG/JPEG,
     ≤ 3 MB), «Borrar» con `ConfirmDialog`), **Guion** (imágenes de las escenas de la sesión, la escena actual primero),
     **Mapas** (mapas del libro del mundo por capítulo), **Retratos** (adversarios de los encuentros abiertos y buscador del
     catálogo), **URL** (campo de texto).
  4. Elegir una abre la hoja **«Mostrar a la mesa»**: vista previa, «Título», «Pie para los jugadores» («Veis esto…»), botón
     **Mostrar**. Al mostrar, la bitácora anota «Se muestra a la mesa: <título>» (etiqueta «Mesa»).
  5. **Mostradas en esta sesión**: lista (las 10 últimas) con «Volver a mostrar».
- **Barra superior**: chip «En la mesa: <título>» mientras haya proyección; tocarlo abre el panel Mesa.
- **Terminar sesión** vacía la proyección y el historial.

### 2.3 Accesos

- **Menú del jugador**: «Mesa» (`Projector`) entre «Personaje» y «Partida», también en la barra inferior del móvil (5 ítems).
  Cuando la campaña tiene además «Banda» compartida (Nacidos de la bruma), «Banda» pasa a `soloAncho` también para el jugador y
  se llega a ella desde una tarjeta en Inicio (ver Q6). Archivo de las Tormentas solo gana el ítem «Mesa».
- **Inicio del jugador**: tarjeta «La mesa — lo que el director muestra: el combate y las imágenes», como la tarjeta «Pantalla
  del director» de `GmPage`.
- **Director**: sin entrada de menú; llega desde el panel Mesa. La ruta `/mesa` no redirige al director.

## 3. Reglas y privacidad

- Nada de lo que la API emite por el hub lleva contenido: solo `campaignId` y `version`.
- `GET /campaigns/{id}/mesa`: miembro → 200; no miembro → 404 (la campaña no se revela).
- Escritura de la mesa solo a través del PUT de la pantalla (director). Imágenes: subir y borrar, director; leer, miembro.
- `book-images/retrato`: miembro de una campaña del mundo del adversario; `ficha` y `tacticas`: solo director (como hoy).
- Lo que no entra en `MesaPublica` no puede verse desde el móvil: la función `proyectarMesa` es la **lista blanca** y se revisa
  con un test de forma (§7, M4): el JSON de un enemigo no contiene las claves `salud`, `defensas`, `desvio`, `rango`,
  `inmunidades`, `ataques`, `habilidades`, `notas`.

## 4. Documento público (`MesaPublica`, versión 1)

`src/pages/mesa/publica.ts` (puro, sin React; el *chunk* del jugador no depende de `estado.ts` salvo por tipos):

```ts
export const VERSION_MESA = 1
export const MAX_PROYECCIONES = 10

export interface MesaPublica {
  version: typeof VERSION_MESA
  sesion: { numero: number | null; titulo: string; iniciadaEn: string } | null
  /** Encuentros con `enMesa`, el activo primero */
  encuentros: EncuentroMesa[]
  /** Lo que está en la mesa ahora, o null; el historial (`PantallaEstado.mesa.proyecciones`) nunca se publica */
  proyeccion: Proyeccion | null
}

export interface EncuentroMesa {
  id: string
  titulo: string
  ronda: number
  fase: Fase                       // import type de '../pantalla/estado'
  aliados: AliadoMesa[]
  enemigos: EnemigoMesa[]
  retirados: Retirado[]            // { nombre, motivo: 'derrotado' | 'huido' | 'rendido' }
}

export interface AliadoMesa {
  id: string
  nombre: string
  characterId: number | null       // null = aliado sin personaje («Aliado»)
  turno: Turno
  actuoRapido: boolean
  actuoLento: boolean
  reaccionUsada: boolean
  salud: Recurso
  concentracion: Recurso
  investidura: Recurso
  estados: EstadoAplicado[]        // { id, valor }
  derrotado: boolean
}

/** Pista de salud de un enemigo: sin daño; con daño y más de un cuarto; un cuarto o menos; a 0 */
export type PistaSalud = 'intacto' | 'herido' | 'malherido' | 'caido'

export interface EnemigoMesa {
  id: string
  nombre: string
  adversarioId: number | null      // para el retrato
  turno: Turno
  actuoRapido: boolean
  actuoLento: boolean
  estados: EstadoAplicado[]
  derrotado: boolean
  /** Solo cuando el director la muestra para este enemigo (`Combatiente.mostrarSalud`); null = no se muestra */
  pistaSalud: PistaSalud | null
}

export type OrigenImagen =
  | { tipo: 'publica'; url: string }          // '/maps/legado/map_p104.webp', '/aventura/…' o una URL externa → <img src>
  | { tipo: 'subida'; imagenId: number }      // GET /campaigns/{id}/mesa/imagenes/{imagenId} (con token → object URL)
  | { tipo: 'retrato'; adversarioId: number } // GET /global-npcs/{id}/book-images/retrato?campaignId= (idem)

/** Zona destapada, en fracciones del ancho y el alto del mapa (0-1) */
export interface ZonaNiebla { x: number; y: number; w: number; h: number }
/** Niebla de guerra: con `activa`, los jugadores solo ven `zonas` (negro en el resto); máx. 50 zonas, lado mínimo 1 % */
export interface Niebla { activa: boolean; zonas: ZonaNiebla[] }

export interface Proyeccion {
  id: string
  imagen: OrigenImagen
  titulo: string
  pie: string
  en: string                       // ISO
  niebla: Niebla
}

export const mesaVacia = (): MesaPublica => ({ version: VERSION_MESA, sesion: null, encuentros: [], proyeccion: null, proyecciones: [] })
export function normalizarMesa(raw: unknown): MesaPublica   // mismo estilo que normalizarEstado: cualquier JSON → documento válido
export const esMasNueva = (raw: unknown): boolean            // version > VERSION_MESA → aviso «Actualiza la app»
```

### 4.1 Cambios en la pantalla del director (`src/pages/pantalla/estado.ts`, versión 5)

```ts
export const VERSION_ESTADO = 5
export interface Encuentro { …; /** Publicado en la mesa de los jugadores (nace oculto) */ enMesa: boolean }
export interface Combatiente { …; /** Enemigo que los jugadores no ven todavía */ oculto: boolean; /** Enemigo cuya pista de salud ven los jugadores */ mostrarSalud: boolean }
export interface MesaDirector { proyeccion: Proyeccion | null; proyecciones: Proyeccion[] }
export interface PantallaEstado { …; mesa: MesaDirector }
```
`normalizarEstado`: `enMesa` ← `logico(v.enMesa)`; `oculto` ← `logico(v.oculto)`; `mostrarSalud` ← `logico(v.mostrarSalud)`;
`mesa` ← `{ proyeccion: proyeccion(o.mesa?.proyeccion), proyecciones: lista(…).slice(0, MAX_PROYECCIONES) }`.
`nuevoEncuentro` crea `enMesa: false`; `combatienteDe*` crean `oculto: false, mostrarSalud: false`; `terminarSesion` deja `mesa`
vacía; `moverCombatiente` conserva `oculto` y `mostrarSalud`. `pistaSalud(c)`: `caido` si `derrotado` o salud 0; `intacto` si
`actual === max`; `malherido` si `actual ≤ max / 4`; `herido` en el resto.

`src/pages/pantalla/mesa.ts` (puro):

```ts
/** La lista blanca: lo único de la pantalla que llega a los jugadores */
export function proyectarMesa(b: PantallaEstado): MesaPublica
/** Muestra una imagen: pasa a `proyeccion` y entra al principio del historial (sin duplicar su id); `niebla` por defecto según el título */
export function mostrarEnMesa(b: PantallaEstado, imagen: OrigenImagen, titulo: string, pie: string, ultimoDiario: number | null, niebla?: Niebla): Proyeccion
export function quitarDeMesa(b: PantallaEstado): void
export const esMapa = (titulo: string) => boolean               // /^mapa\b/i
export const nieblaInicial = (titulo: string, mapa?: boolean) => Niebla
export function cambiarNiebla(b: PantallaEstado, receta: (n: Niebla) => void): void   // también en la copia del historial
export function destaparZona(b: PantallaEstado, z: ZonaNiebla): boolean               // recortada al mapa; < 1 % se ignora
export const enemigosOcultos = (e: Encuentro): number
```
Capa compartida `src/pages/mesa/Niebla.tsx` (`CapaNiebla`): SVG `viewBox 0 0 1 1` estirado sobre la imagen con una máscara que recorta
las zonas; negro opaco para el jugador (`#000`, es contenido, no interfaz: tapa en cualquier tema), velo al 60 % con las zonas
recuadradas para el director. Editor `EditorNiebla` en `PanelMesa.tsx` (eventos *pointer* con captura; `touch-action: none`).
`proyectarMesa`: encuentros `b.encuentros.filter(e => e.enMesa)` con el activo (`encuentroEnPantalla`) primero; aliados = `bando === 'pj'`;
enemigos = `bando === 'pnj' && !oculto`; cada objeto se construye campo a campo (nunca `...spread` del combatiente).

### 4.2 Guardado (`PantallaProvider`)

`preparar()` añade `mesa: JSON.stringify(proyectarMesa(envio.estado))` y el PUT envía
`{"state":…,"mesa":…,"version":n}`. Se envía siempre (pesa unos KB): el servidor compara con lo guardado y solo emite el evento
si cambió. Un 409 rechaza las dos cosas a la vez. Los scripts que suben guiones (`subir_a_pantalla.mjs`, `vaciar_y_cargar.mjs`)
no envían `mesa`, así que no la tocan; se actualiza con el siguiente guardado de la pantalla.

## 5. API y base de datos

### 5.1 Migración `AddGmScreenMesa` (aditiva)
| Columna | Tipo | Notas |
|---|---|---|
| `GmScreens.Mesa` | text NOT NULL DEFAULT `'{}'` | documento público; el servidor no lo interpreta. `HasDefaultValue("{}")` en Fluent |
| `GmScreens.MesaUpdatedAt` | timestamptz NULL | cuándo cambió por última vez |

### 5.2 Migración `AddCampaignImages` (aditiva, solo `CREATE TABLE`)
| Columna | Tipo | Notas |
|---|---|---|
| `Id` | bigint PK identity | |
| `CampaignId` | bigint FK → `Campaigns` (cascade), índice | |
| `Name` | text | nombre del archivo, ≤ 120 caracteres |
| `ContentType` | text | `image/webp`, `image/png` o `image/jpeg`, detectado por los primeros bytes (el helper de `GlobalNpcService` pasa a `Services/Images/ImageType.cs`) |
| `Data` | bytea | ≤ 3 MB |
| `Bytes` | integer | para la lista sin cargar los datos |
| `CreatedAt` | timestamptz | |

Límites en `MesaService`: `MaxImageBytes = 3 * 1024 * 1024`, `MaxImagesPerCampaign = 50`, `MaxMesaLength = 200_000` caracteres.

### 5.3 Endpoints
| Método | Ruta | Quién | Respuesta |
|---|---|---|---|
| PUT | `/campaigns/{id}/gm-screen` | director | body `{ state, mesa?, version }`. `mesa` opcional (si falta, la guardada no cambia); objeto JSON ≤ 200 000 caracteres, misma validación de texto que `state`. Tras guardar, si `Mesa` cambió: hub `MesaUpdated { campaignId, version }` |
| GET | `/campaigns/{id}/gm-screen` | director | `{ state, mesa, version, updatedAt }` (`mesa` nuevo) |
| GET | `/campaigns/{id}/mesa` | miembro | `MesaResponse { state, version, updatedAt }` (`{}`/0/null si nunca se guardó; `updatedAt` = `MesaUpdatedAt`) |
| GET | `/campaigns/{id}/mesa/imagenes` | miembro | `CampaignImageResponse[] { id, name, contentType, bytes, createdAt }` |
| GET | `/campaigns/{id}/mesa/imagenes/{imageId}` | miembro | bytes con su `Content-Type`; `Cache-Control: private, max-age=86400` |
| POST | `/campaigns/{id}/mesa/imagenes` | director | multipart `file` → `CampaignImageResponse`; 400 si pesa más de 3 MB, no es imagen o ya hay 50 |
| DELETE | `/campaigns/{id}/mesa/imagenes/{imageId}` | director | 204 |
| GET | `/global-npcs/{id}/book-images/retrato?campaignId=` | **miembro** (antes director) | sin cambios de forma |

No miembro → 404; miembro no director en escritura → 403. Controlador nuevo `MesaController` (`campaigns/{campaignId:long}/mesa`),
servicio `Services/Mesa/MesaService.cs` + `IMesaService`; `GmScreenController` recibe `IHubContext<CampaignHub>` como `CrewController`.
`GmScreenSaveResult` gana `MesaChanged`.

### 5.4 Backup y rollback
Como en `docs/pantalla-director/propuesta.md` §5.3: `pg_dump` antes (`../backups/cosmere-dev-<fecha>-pre-AddGmScreenMesa.dump`),
migraciones con la API parada, scripts `docs/mesa/sql/<Migración>.{up,down}.sql`. Rollback = `dotnet ef database update AddEncyclopediaOriginals`
(hace el `Down` de las dos) o los `.down.sql`. En producción: `pg_dump` y etiquetar `:prev` antes de `bash deploy.sh`; después
`sudo docker compose logs api | grep -i "Applying migration"` debe listar `AddGmScreenMesa` y `AddCampaignImages`.

## 6. Web

| Archivo | Cambio |
|---|---|
| `src/types/index.ts` | `GmScreen.mesa: unknown`, `SaveGmScreenRequest.mesa?: unknown`, `MesaDoc { state, version, updatedAt }`, `CampaignImage` (espejo de los DTO) |
| `src/api/gmScreen.ts` | `saveJson` sin cambios de firma (el cuerpo ya lo arma el provider) |
| `src/api/mesa.ts` (nuevo) | `mesaApi.get(cId)`, `listImages(cId)`, `getImage(cId, id)` (blob), `uploadImage(cId, file)`, `deleteImage(cId, id)` |
| `src/pages/mesa/publica.ts` (nuevo, puro) | tipos, `VERSION_MESA`, `normalizarMesa`, `mesaVacia`, `esMasNueva` |
| `src/pages/mesa/MesaPage.tsx` (nuevo, *chunk* perezoso) | la página del jugador (§2.1): `Cabecera`, `EnLaMesa`, `ImagenesSesion`, `BloqueCombate`, `TarjetaAliado`, `FilaEnemigo`, `HojaEstado`, `HojaImagen` |
| `src/pages/mesa/useMesaEnVivo.ts` (nuevo) | la consulta + evento `mesaUpdated` + refetch al volver + intervalo |
| `src/pages/mesa/imagenes.ts` (nuevo) | `useImagenMesa(cId, origen)`: `publica` → la URL; `subida` → object URL (`mesaApi.getImage`, `staleTime: Infinity`); `retrato` → `useImagenLibro(cId, id, 'retrato')` |
| `src/pages/pantalla/estado.ts` | v5: `enMesa`, `oculto`, `mesa` (§4.1) |
| `src/pages/pantalla/mesa.ts` (nuevo, puro) | `proyectarMesa`, `mostrarEnMesa`, `quitarDeMesa`, `enemigosOcultos` |
| `src/pages/pantalla/PantallaProvider.tsx` | envía `mesa` en cada PUT (§4.2) |
| `src/pages/pantalla/PanelMesa.tsx` (nuevo) | el panel del director (§2.2): `AhoraEnLaMesa`, `EncuentrosVisibles`, `ElegirImagen` (Subidas · Guion · Mapas · Retratos · URL), `HojaMostrar`, `MostradasEnSesion` |
| `src/pages/pantalla/PantallaPage.tsx`, `contexto.ts` | `PanelId` + `'mesa'`; `PANEL_B = ['tiradas', 'bitacora', 'mesa']`; chip «En la mesa» en la barra; `useMantenerEncendida` y `usePantallaCompleta` se extraen a `src/pages/pantalla/dispositivo.tsx` (sin cambio visual) |
| `src/pages/pantalla/PanelEncuentro.tsx` | interruptor «Visible en la mesa» en la cabecera; en el enemigo: «Oculto a la mesa», píldora «Oculto», «Mostrar el retrato a la mesa» |
| `src/pages/pantalla/piezas.tsx` | `Galeria` acepta `onMostrar?: (img) => void` → botón «Mostrar a la mesa» en la hoja ampliada |
| `src/pages/pantalla/FichaAdversario.tsx` | «Mostrar el retrato a la mesa» en la pestaña Libro |
| `src/components/DiceRoller.tsx` | manejador `MesaUpdated` → `window` `CustomEvent('mesaUpdated', { detail })` |
| `src/App.tsx` | ruta `mesa` con `React.lazy` (`MesaPage`) |
| `src/components/Sidebar.tsx` | ítem «Mesa» para el jugador; «Banda» `soloAncho` para el jugador (Q6) |
| `src/pages/home/HomeCampaignPage.tsx` | tarjeta «La mesa» (jugador) y «Banda» si procede |
| `src/lib/fichasLibro.ts` | sin cambios (`useImagenLibro` ya sirve; el acceso lo abre la API) |

Reglas: nada compara ids de mundo (`grep -rnE "===\s*'(mistborn|stormlight)'" src` vacío); textos en español; estilos en
línea con tokens; hojas con `Sheet`/`ConfirmDialog`; borrar una imagen pide confirmación; los dos *chunks* nuevos son
perezosos y el arranque no engorda (comparar la suma de los scripts de `dist/index.html` con `docs/nacidos-de-la-bruma/bundle-referencia.txt`).
`MesaPage` importa de `../pantalla/estado` solo `FASES`, `FASE_INFO` y `marcaDe` (módulo puro; Vite lo deja en un *chunk* compartido).

## 7. Tareas

| # | Tarea | Archivos | Aceptación | Verificación |
|---|---|---|---|---|
| M1 | **API: mesa** — columna, DTO, `GET /mesa`, PUT con `mesa`, evento del hub | `GmScreenEntity`, `CosmereContext`, migración `AddGmScreenMesa`, `SaveGmScreenRequest`, `GmScreenResponse`, `MesaResponse`, `GmScreenService`, `MesaService`, `MesaController`, `GmScreenController` | §5.3 filas 1-3; evento solo si `Mesa` cambió; `mesa` ausente no toca la guardada; > 200 000 caracteres → 400 | `dotnet build`; curl: jugador `GET /mesa` 200 `{state:{},version:0}`; no miembro 404; PUT con la misma `mesa` dos veces → un solo evento (log del hub en DEV) |
| M2 | **API: imágenes de la campaña** | `CampaignImageEntity`, `CosmereContext`, migración `AddCampaignImages`, `Services/Images/ImageType.cs` (movido de `GlobalNpcService`), `MesaService`, `MesaController` | §5.3 filas 4-7; límites 3 MB y 50; tipo por bytes | curl: subir 3,1 MB → 400; la 51.ª → 400; jugador POST → 403; DELETE → 204 y GET 404 |
| M3 | **API: retrato para miembros** | `GlobalNpcService.GetBookImageAsync` | `retrato` → miembro; `ficha`/`tacticas` → director | curl con token de jugador: retrato 200, ficha 403 |
| M4 | **Web: documentos** | `publica.ts`, `pantalla/mesa.ts`, `estado.ts` v5, `PantallaProvider`, `types/index.ts`, `api/mesa.ts` | `normalizarMesa` acepta `{}`, parciales y basura; `proyectarMesa` cumple §3 (lista blanca) | `npx tsc -b`; script `scripts/mesa/probar_proyeccion.mjs` (esbuild como `probar_guion.mjs`): con un estado de ejemplo comprueba que ningún enemigo lleva las claves prohibidas y que un encuentro con `enMesa: false` y un enemigo `oculto` no salen |
| M5 | **Web: director** | `PanelMesa.tsx`, `PantallaPage.tsx`, `contexto.ts`, `PanelEncuentro.tsx`, `piezas.tsx`, `FichaAdversario.tsx`, `DiceRoller.tsx`, `dispositivo.tsx` | §2.2 completo; «Terminar sesión» vacía la mesa; la bitácora anota las proyecciones | Chrome (sesión de Xavi, «Bruma TEST»): mostrar un mapa, un retrato, una subida y una URL; ocultar un encuentro y un enemigo; quitar |
| M6 | **Web: jugador** | `MesaPage.tsx`, `useMesaEnVivo.ts`, `imagenes.ts`, `App.tsx`, `Sidebar.tsx`, `HomeCampaignPage.tsx` | §2.1 completo; actualiza sin recargar en < 3 s tras el guardado del director; sin conexión muestra la última mesa | Dos navegadores (director en Chrome, jugador `nb-jugador` en otro perfil o en el móvil por LAN): daño a un PJ → barra; estado a un enemigo → píldora; «Fase siguiente» → tira; proyección → imagen; 390×844 y 768×1024 |
| M7 | **Calidad** | — | `npx tsc -b` y `npm run lint` limpios; arranque sin engordar; Stormlight sin cambios fuera de lo descrito | capturas DOM antes/después de `/home`, `/personajes` y la barra lateral en «Caminapiedras» (jugador y director); `grep` de ids de mundo vacío |
| M8 | **Despliegue** | `docs/mesa/sql/*.{up,down}.sql`, nota en `docs/pantalla-director/propuesta.md` §8 | dos migraciones aditivas | `pg_dump` + `:prev`; tras `deploy.sh`, «Applying migration» de las dos; desde fuera: `/api/campaigns/1/mesa` → 401 |

Orden: M1 → M4 → M5 → M6 (M2 y M3 en paralelo con M4; M5 «Subidas» y «Retratos» esperan a M2/M3). Tamaño: M1 S, M2 S, M3 XS,
M4 M, M5 L, M6 L, M7-M8 S.

## 8. Preguntas para Xavi (con la opción por defecto)

Respuestas del 23 oct 2026: **2** ocultos por defecto; **3** sí a la pista de salud, pero oculta por defecto y la muestra el
director enemigo a enemigo; el resto, con la opción por defecto («adelante con el resto por ahora»).

1. **Nombre y ruta**: «La mesa» (`/mesa`, menú «Mesa»). Alternativas: «Pantalla del jugador», «Mesa de juego». *(por defecto: La mesa)*
2. **Encuentros**: ~~visibles desde que existen~~ → **ocultos hasta pulsar «Mostrar en la mesa»** (decidido).
3. **Enemigos**: nombre tal cual (renombrable en la tarjeta), sin rango. Pista de tres niveles («Intacto / Herido / Malherido»)
   sin número: **sí, oculta por defecto, el director la muestra por enemigo** (decidido).
4. **Estados** («luego lo vemos»): v1 publica nombre y valor («Agotado [−2]») de todos, y el resumen al tocar. Pendiente de
   hablar: duraciones y contadores de rondas, que el jugador marque sus propios estados desde el móvil, estados privados.
   *(por defecto: nombre y valor, solo lectura)*
5. **Compañeros**: ¿se ven la concentración y la Investidura de los demás, o solo la salud? *(por defecto: todo)*
6. **Barra inferior del móvil del jugador**: «Mesa» entra en la barra (5 ítems). En Nacidos de la bruma con «Banda»
   compartida serían 6: propongo pasar «Banda» a tarjeta en Inicio para el jugador (como ya hace el director). Alternativa:
   «Mesa» solo en Inicio y en la barra lateral. *(por defecto: Mesa en la barra, Banda a Inicio)*
7. **Imágenes subidas**: en la base de datos, 3 MB y 50 por campaña. Alternativa: volumen Docker (cambia `docker-compose.yml`
   y el despliegue). *(por defecto: base de datos)*
8. **Retratos** de los adversarios legibles por los jugadores (solo el retrato). *(por defecto: sí)*
9. **Historial**: 10 imágenes por sesión, se vacía al terminar la sesión. *(por defecto: sí)* → Tras la primera prueba (23 oct
   2026) el historial es **solo del director**: los jugadores ven únicamente la imagen que está en la mesa.
10. **Título de la escena actual** en la cabecera del jugador: puede destripar («La emboscada»). *(por defecto: no se muestra)*
11. **Aviso de imagen nueva**: resaltar el bloque; sin vibración ni sonido. *(por defecto: solo resaltar)*
12. **Pantalla completa y mantener encendida** también en el móvil del jugador. *(por defecto: sí)*

## 9. Fuera de alcance de v1

- Que el jugador cambie desde el móvil su salud o sus estados (ida y vuelta con la pantalla del director).
- Proyectar texto (leer en voz alta en los móviles), audio o vídeo; fichas o posiciones sobre el mapa.
- Niebla: mover o redimensionar una zona ya destapada (se tapa con su «×» y se vuelve a dibujar), zonas que no sean rectángulos,
  destapar con pincel.
- Salud actual en la ficha del personaje (pregunta 4 de la propuesta de la pantalla del director).
- Comprobar la pertenencia en `JoinCampaign` del hub (tarea aparte; mientras tanto los eventos siguen sin contenido).
- Registro de tiradas en la mesa (ya está en el lanzador de dados, pestaña Registro).

## 10. Estado de la implementación (DEV, 23 oct 2026)

M1-M7 hechas en los *worktrees* `cosmere-web-mesa` y `cosmere-api-mesa` (rama `feature/mesa`), **sin commits** a la espera de la
validación de Xavi en la mesa. Respuestas aplicadas: encuentros ocultos por defecto («Mostrar en la mesa»), pista de salud por
enemigo («Salud» en la tarjeta, oculta por defecto); el resto, por defecto.

### Levantar DEV
- Configuraciones `mesa-api` (5200) y `mesa-web` (5173) en `.claude/launch.json` del árbol principal. Vite escucha en la red local:
  desde una tablet en la misma Wi-Fi, `http://192.168.50.64:5173/` (si no carga, el firewall de Windows debe dejar pasar Node en
  redes privadas). En http sin ser localhost no hay «Mantener encendida» (Wake Lock exige contexto seguro).
- Director: `nb-tester`; jugador: `nb-jugador`; campaña «Bruma TEST» (42). Credenciales en `docs/nacidos-de-la-bruma/entorno-pruebas.md`.

### Base de datos (DEV)
- Backup previo: `personal/backups/cosmere-dev-2026-10-23-pre-AddGmScreenMesa.dump` (80,6 MB).
- Aplicadas, una a una: `AddGmScreenMesa` (dos `AddColumn` en `GmScreens`) y `AddCampaignImages` (`CreateTable` + índice). Scripts
  idempotentes en `docs/mesa/sql/` (los `down` borran también la fila de `__EFMigrationsHistory`).
- La API de main sigue funcionando con las columnas de más (EF no valida el esquema).

### Verificación hecha
- API (curl con los tokens de prueba, sin imprimirlos): la matriz de §7 M1-M3 completa. Destacado: el evento `MesaUpdated` solo
  se emite cuando el texto de `Mesa` cambia (log Information en el controlador); `mesa` ausente o `null` no toca la guardada;
  `[1]` → 400; > 200 000 caracteres → 400; 409 no escribe la mesa; jugador PUT/GET `gm-screen` → 403; subir > 3 MB → **400**
  (no 413: `[ApiController]` convierte el límite de cuerpo en `ValidationProblem`, como ya pasa con las fichas del libro); texto
  renombrado `.png` → 400; la 51.ª imagen → 400; `retrato` lo lee el jugador (200) y `ficha`/`tacticas` no (403); no miembro → 404.
- Web: `npx tsc -b` y `npm run lint` limpios; `grep` de ids de mundo vacío; `node scripts/mesa/probar_proyeccion.mjs` (carga los
  módulos con Vite en modo SSR) comprueba la lista blanca: de un enemigo solo salen `id, nombre, adversarioId, turno, actuoRapido,
  actuoLento, estados, derrotado, pistaSalud`; un encuentro sin `enMesa` y un enemigo `oculto` no dejan rastro en el JSON; la pista
  solo sale con `mostrarSalud`.
- Bundle (`npm run build`): el arranque pasa de 873 060 a 875 012 bytes en `index-*.js` (+1 952: menú, Inicio y el manejador del
  hub); `MesaPage-*.js` 19,3 KB y `PantallaPage-*.js` 208,6 KB, los dos perezosos.
- **No comprobado en navegador**: la UI del jugador y el panel Mesa del director (el navegador integrado no puede iniciar sesión).
  Xavi lo valida desde su Chrome y la tablet: mostrar un mapa, un retrato, una subida y una URL; mostrar y ocultar un encuentro y un
  enemigo; daño y estados a un PJ; «Terminar sesión» vacía la mesa.

### Decisiones de implementación
- **Primera prueba de Xavi (23 oct 2026):** con nada proyectado, los jugadores seguían viendo los dos mapas mostrados y quitados
  minutos antes (la tira «Imágenes de la sesión» del historial). Corregido: `MesaPublica` ya no lleva `proyecciones`;
  `normalizarMesa` descarta las de un documento guardado antes del cambio, así que no hace falta tocar la base de datos.
- **Niebla de guerra (23 oct 2026, segunda petición de Xavi):** `Proyeccion.niebla` en los dos documentos, sin cambios de API ni
  migración. El jugador no puede eludirla desde la app (ni «Abrir en pestaña nueva» con niebla), pero un mapa de `public/` sigue
  siendo un archivo público: la niebla es una ayuda de mesa, no una protección. Probado con `probar_proyeccion.mjs` (nace tapado,
  recorte, mínimo 1 %, «Tapar todo», retrato sin niebla, lectura de zonas inválidas); la interfaz la valida Xavi.
- La galería del guion, los mapas del libro y la ficha del adversario muestran la imagen **con un toque** («Mostrar a la mesa»); el
  título y el pie se editan después en el panel Mesa → «Ahora en la mesa» (se guardan al salir del campo). Solo «URL» pide los datos antes.
- Borrar una imagen subida la quita también de la proyección actual y del historial (los jugadores recibirían un 404).
- `BotonEncendida` y `BotonPantallaCompleta` viven ahora en `src/pages/pantalla/dispositivo.tsx` (la mesa los usa sin bloqueo de
  orientación y con su propia preferencia `cosmere-mesa-encendida`); la pantalla del director no cambia.
- El indicador de red del jugador: «Al día» (esmeralda) o «Sin conexión · lo último, hace n min» (topacio) cuando la consulta está
  en pausa sin red o falla con datos en caché; refetch al volver a primer plano, al reconectar y cada 45 s con la página visible.
- `useImagenMesa` comparte la clave de caché `['global-npc-image', id, 'retrato']` con `useImagenLibro`: el retrato no se descarga dos veces.
