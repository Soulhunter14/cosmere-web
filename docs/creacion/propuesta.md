# Creación de personajes por pasos: propuesta

26 de octubre de 2026. Xavi quiere que la creación de personajes sea secuencial y que el director marque los tiempos: libera un paso,
los jugadores lo completan, libera el siguiente. Va en una sección nueva, «Creación de personajes», que termina con «Personaje
creado» y pasa la ficha a la pantalla de hoy («Personajes»).

## 1. Lo que hay hoy

- El director crea las fichas desde «Personajes» (nombre, nivel, jugador asignado) y las asigna; el jugador ve «Mi personaje».
- La campaña nace en preparación (`iniciadaEn` vacío): el jugador edita libremente su ficha. «Iniciar campaña» (Ajustes) cierra
  propósito, obstáculo, legado y respuestas del legado para los jugadores (`CierreCampana.Campos`); el director puede reabrir.
- El legado y sus tres preguntas (origen, impulso, meta) están en la pestaña «Trasfondo» de la ficha (`LegadoCard`,
  `LegadoPicker`); se guardan al momento en `legado` y `legadoRespuestas` (la API admite tres).
- La mesa del jugador es el patrón a copiar: estado por campaña en la fila de `GmScreens`, el director escribe, los jugadores leen,
  y el hub avisa (`MesaUpdated`) para que todos refresquen sin recargar.

## 2. Qué se propone

Una sección «Creación de personajes» (ruta `creacion`), solo mientras la campaña está en preparación y solo en los mundos con
creación guiada (Mistborn; Stormlight sigue igual). Dos vistas:

**Director.** Ve el paso liberado, la lista de personajes en creación y, de cada uno, qué pasos ha completado y qué ha
respondido (es el hilo conductor para preparar la sesión 0). Botones: «Añadir personaje» (nombre y jugador, como hoy),
«Liberar paso N» (con confirmación; también «Volver al paso anterior», que no borra nada), y «Personaje creado» por personaje
(con confirmación y deshacer).

**Jugador.** Un recorrido de pasos. Los que el director no ha liberado se ven con candado («El director aún no ha liberado este
paso»); los liberados se responden y se pueden corregir hasta que el director dé el personaje por creado. Al final, una tarjeta
«Personaje creado» con «Ir a mi personaje».

### Los pasos (Mistborn, Era 1)

Secuencia fijada por Xavi el 26-10-2026 (faltan pasos por definir; se añadirán al final):

| Paso | Título | Qué hace el jugador | Dónde se guarda |
|---|---|---|---|
| 1 | Nombre | Pone el nombre de su personaje (hasta entonces, «Personaje de <jugador>») | `name` |
| 2 | Trasfondo | Elige uno de los seis legados (la lista con sus resúmenes, sin la conexión con la Era 2). Cambiable cuando el director lo permite («Permitir / Denegar» en su vista; de inicio denegado): cambiarlo reinicia todos los pasos siguientes, con aviso | `legado` |
| 3 | Ascendencia | Humano o kandra, las de la era de la campaña; un kandra indica bajo qué Contrato sirve | `ascendencia` |
| 4 | ¿Quieres ser alomante? | Sí / No, cada uno con una definición corta; dato narrativo, no el camino | `creacionDatos.alomante` |
| 5 | ¿Qué tipo de brumoso? | Los diez brumosos de la Era 1 con una definición corta cada uno (nacido de la bruma oculto por ahora); solo si el paso 4 es «sí», si no queda como «no aplica» | `creacionDatos.alomancia` |
| 6 | Primera pregunta | Origen: «¿Por qué eres de este legado?», con los ejemplos debajo | `legadoRespuestas[0]` |
| 7 | Segunda pregunta | Impulso: «¿Qué te empuja a dejar lo que eres e intentar cambiar las cosas?» | `legadoRespuestas[1]` |
| 8 | Tercera pregunta | Meta: «¿Qué buscas cuando las cosas cambien?» | `legadoRespuestas[2]` |
| … | (pendientes) | | |
| Fin | Personaje creado | Lo marca el director; la ficha pasa a «Personajes» | `creacionCompletada` |

El proceso lo inicia el director: crea la ficha y la asigna a un jugador, sin nombre (la ficha nace como «Personaje de
<jugador>»). El nombre es el paso 1, que libera el director como los demás. Los pasos los define la configuración del mundo
(`WorldConfig.creacion.pasos`) y, en la API, la lista de pasos de `MistbornRules` (cada paso dice qué campo guarda), así que
añadir uno es una línea de datos en cada lado, no código nuevo. Lo demás de la hoja (atributos, habilidades, equipo) se
construye jugando la sesión 0, como ahora.

### Reglas

- Los pasos liberados son acumulativos: al liberar el 3 siguen abiertos el 1 y el 2.
- Un personaje en creación no sale en la lista «Personajes» del jugador (su sección es «Creación»); al director le sale con el
  chip «En creación» y puede abrir la ficha.
- «Personaje creado» es por personaje, no para todos a la vez: el director decide cuándo está cada uno. Después, la ficha se rige
  por las reglas de hoy (libre hasta «Iniciar campaña», que la cierra).
- El servidor es quien manda: un jugador no puede escribir el legado sin el paso 1 liberado, ni la respuesta *k* sin el paso
  *k* + 1, aunque llame a la API directamente. El director siempre puede.
- Los personajes que ya existen (Bruma TEST, Caminapiedras) quedan como «creados»: nada cambia para ellos.

## 3. Cambios en la API (`cosmere-api`)

Migración **AddCreacionGuiada**, aditiva, con valores por defecto:

- `Campaigns.CreacionPaso int NOT NULL DEFAULT 0`: pasos liberados (0 = creación sin abrir; 1 a 4).
- `Characters.CreacionCompletada bool NOT NULL DEFAULT true`: las fichas de hoy nacen creadas; las de la sección de creación
  nacen con `false`.

Endpoints (`CreacionController`, `campaigns/{id}/creacion`):

| Método | Ruta | Quién | Qué hace |
|---|---|---|---|
| GET | `/creacion` | miembros | `{ paso, pasos, personajes: [{ id, name, ownerId, ownerName, legado, respuestas, completada }] }`; el jugador solo ve sus personajes y sus respuestas |
| PUT | `/creacion/paso` `{ paso }` | director | Libera o retrocede (0 a `pasos`); avisa por el hub |
| POST | `/creacion/personajes` `{ ownerId }` | director | Crea la ficha asignada al jugador con `CreacionCompletada = false`, nombre provisional «Personaje de <jugador>», nivel 1 y el resto vacío |
| POST | `/creacion/personajes/{charId}/completar` | director | «Personaje creado»; avisa por el hub |
| DELETE | `/creacion/personajes/{charId}/completar` | director | Deshacer |

- `pasos` lo da `IWorldRules` como lista ordenada de campos (`MistbornRules`: `name`, `legado`, `ascendencia`,
  `legadoRespuestas[0]`, `legadoRespuestas[1]`, `legadoRespuestas[2]`…; `StormlightRules`: vacía, sin creación guiada), y las
  reglas del mundo validan en `CharacterService.Update`: con `CreacionCompletada = false` y jugador, cada campo exige que su
  paso esté liberado (`CreacionPaso >= posición + 1`); se rechaza con 400 y mensaje claro. Con la campaña iniciada, el cierre de
  hoy.
- Hub: evento `CreacionUpdated` al grupo de la campaña (sin datos) al cambiar el paso, al permitir o denegar cambiar un paso, al completar o deshacer, y cuando un
  jugador guarda legado o respuestas en un personaje en creación (para que la tabla del director se mueva sola).
- `CampaignResponse.CreacionPaso` y `CharacterResponse.CreacionCompletada` (y los tipos TS a juego).

## 4. Cambios en la web (`cosmere-web`)

- **Mundo:** `features.creacionGuiada` (Mistborn `true`, Stormlight `false`) y `creacion: { pasos: PasoCreacion[] }` en
  `WorldConfig` (`{ id: 'legado' } | { id: 'pregunta', indice: 0 | 1 | 2 }`, con título y texto de ayuda). Stormlight no declara
  nada: ni ruta, ni menú, ni cambios (comparar capturas de «Personajes» antes y después).
- **Ruta y menú:** `creacion` (página lazy `pages/creacion/CreacionPage.tsx`, dentro de `WorldGate`). Jugador: mientras su
  personaje no está creado, el menú muestra «Creación» en el sitio de «Personaje»; al estar creado, «Personaje». Director:
  «Creación» junto a «Personajes» mientras la campaña está en preparación.
- **Vista del director** (`CreacionDirector`): cabecera con el paso liberado y los botones de liberar y retroceder
  (`ConfirmDialog`); tabla de personajes en creación con nombre, jugador, legado, una marca por paso y la respuesta desplegable;
  «Personaje creado» por fila (`ConfirmDialog`) y «Añadir personaje» (`Sheet` con el jugador al que se asigna; el nombre lo
  pondrá él).
- **Vista del jugador** (`CreacionJugador`): lista de pasos con estado (bloqueado, pendiente, hecho); el paso 1 es un campo de
  nombre; el 2 reutiliza la lista de legados del `LegadoPicker` en línea; el 3, las ascendencias de la configuración del mundo
  (las de la era) con el texto del Contrato para un kandra; los pasos 4 a 6 reutilizan la pregunta con ejemplos y el área de
  texto (se extrae un componente `PreguntaLegado` de `LegadoPicker` para no duplicarlo). Guardado al momento con la mutación de
  identidad de hoy.
- **Lista «Personajes»:** el director ve el chip «En creación»; el jugador no ve esas fichas. Si un jugador abre por URL la
  ficha de un personaje en creación, se le lleva a «Creación».
- **Tiempo real:** `useCampaignHub(cId, { CreacionUpdated })` invalida `['creacion', cId]` (y `['characters', cId]`) en las
  dos vistas.
- Todo con estilos en línea, `Sheet`/`ConfirmDialog`, iconos Lucide (Lock, LockOpen, Check); los componentes de Mistborn
  siguen cargándose perezosamente.

## 5. Entregas

1. **F1, API:** migración, campos, `CreacionController`, reglas del mundo en `MistbornRules`, evento del hub. Verificación:
   `dotnet build`, migración aplicada en local, pruebas con `curl` (jugador bloqueado en el paso no liberado → 400; director
   libre).
2. **F2, web:** configuración del mundo, ruta y menú, las dos vistas, el chip en «Personajes», tiempo real. Verificación:
   `npx tsc -b`, `npm run lint`, recorrido completo en «Bruma TEST» con dos sesiones (director `nb-tester`, jugador
   `nb-jugador`): liberar, responder, completar, ver la ficha en «Personajes»; captura de «Personajes» en Caminapiedras igual
   que antes.
3. **F3, remate:** deshacer «Personaje creado», bitácora en `docs/nacidos-de-la-bruma/bitacora-ejecucion.md`, nota en
   `CLAUDE.md` (sección Worlds) y memoria.

Trabajo en una rama `feature/creacion` con worktrees `cosmere-web-creacion` / `cosmere-api-creacion`, pruebas solo en «Bruma
TEST», despliegue después con migración (pg_dump y `:prev` antes).

## 6. Decisiones por defecto (dime si alguna no te encaja)

1. El proceso lo inicia el director: crea la ficha desde «Creación» y la asigna a un jugador (decidido por Xavi el 26-10-2026).
2. El nombre lo pone cada jugador en el paso 1, que libera el director; puede cambiarlo cuando quiera.
3. Los pasos son acumulativos (liberar el 3 no cierra el 1 y el 2); se cierran todos al marcar «Personaje creado».
4. «Personaje creado» es por personaje y se puede deshacer.
5. Tras «Personaje creado», la ficha vuelve a las reglas de hoy: libre hasta «Iniciar campaña».
6. Solo Mistborn por ahora; Stormlight no cambia. Los pasos son datos del mundo, ampliables.
7. El director ve las respuestas de todos en su tabla, para preparar la sesión 0 con ellas.
8. Un personaje en creación no se ve en «Personajes» del jugador, pero el director sí lo ve, con chip.

## 9. Estado (26-10-2026)

Construido en `feature/creacion` (worktrees `cosmere-web-creacion` y `cosmere-api-creacion`), con el paso 7 «¿Quieres ser alomante?»
que Xavi añadió sobre la marcha (dato narrativo `alomancia` en `Character.creacionDatos`, con todas las opciones alománticas de la
Era 1; las que no se ofrezcan irán en `ocultas` del paso, en `mistborn.ts`).

- **API:** migración `AddCreacionGuiada` (`Campaigns.CreacionPaso`, `Characters.CreacionCompletada` y `Characters.CreacionDatos`, todas con
  valor por defecto), `IWorldRules.PasosCreacion` (Mistborn: `name`, `legado`, `ascendencia`, `legadoRespuestas:0..2`,
  `creacion:alomancia`; Stormlight: vacía), `CreacionGuiada` (la vigilancia de pasos en el `PUT` de personajes de un jugador, con 400 y el
  paso que falta), `CreacionController` (`GET`, `PUT paso`, `POST personajes`, `POST`/`DELETE …/completar`) y el evento del hub
  `CreacionUpdated`. El director es el miembro con rol «gm». Probado con `curl` en «Bruma TEST» (director `nb-tester`, jugador
  `nb-jugador`): paso no liberado → 400; liberado → 200; jugador no puede liberar (403); fuera de rango → 400; completar y deshacer.
- **Web:** `features.creacionGuiada` y `creacion.pasos` por mundo, ruta `creacion` (chunk propio), `CreacionPage` con `CreacionDirector`
  y `CreacionJugador`, `PasoLegado` y `PreguntaLegado` compartidos con la ficha, chip «En creación» y botón «Creación de personajes» en
  «Personajes», el jugador en creación ve «Creación» en el menú y su ficha le redirige. `npx tsc -b` y ESLint en verde.
- **Pendiente:** el recorrido en el navegador con dos sesiones (el clasificador del entorno no deja al agente escribir credenciales, ni
  de prueba), la captura de «Personajes» en Caminapiedras, la bitácora y el despliegue (con migración: `pg_dump` y `:prev` antes).
  En «Bruma TEST» queda el personaje de prueba «Kelsier de prueba» (id 211, en creación, de `nb-jugador`) y el paso 2 liberado.
