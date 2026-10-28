# Sesión de creación y registro de respuestas

Fecha: 28-10-2026. Decidido con Xavi en la conversación de ese día; implementado en `feature/creacion` (API `0432972` y la web del
mismo día). Réplica de PRO en local para trabajar la campaña 5: `pro-local.sh` (ver `entorno-pruebas.md`, «Réplica de PRO en local»).

## 1. Qué se decidió

- **Las preguntas narrativas se responden antes de la sesión 0**, para que el director prepare escenas a medida (el obstáculo de la ira
  da una escena donde su objetivo choca con la ira y hay una prueba de Voluntad; el metal da la escena pico de la Ruptura; la persona que
  le importa da el PNJ). Pendiente: los pasos de propósito, obstáculo, vínculo y «tu metal antes de hoy» (`propuesta-proposito-obstaculo.md`).
- **De la sesión 0 vuelven a la ficha las decisiones que la afectan** y la recomendación de camino inicial. Pendiente: «Aplicar a la
  ficha» desde el registro (cada fila tiene `aplicadaEn` para hacerlo una sola vez).
- **La sesión de creación es un estado de la campaña**, no un número ni un título de la pantalla: `pendiente → preparando → en-curso →
  jugada`, una por campaña, sin «Reabrir» en la interfaz. El director la prepara antes de empezarla.
- **Las respuestas son una estructura genérica en el personaje**: tipo de pregunta, pregunta tal como se hizo, tipo de respuesta y
  respuesta, con su origen. Soporta cualquier pregunta sin migración.

## 2. API (`cosmere-api`, migración `AddSesionCreacionYRespuestas`, aditiva)

- `Campaigns.SesionCreacionEstado` (`pendiente` por defecto), `…PreparadaEn`, `…IniciadaEn`, `…TerminadaEn`, `…Guion` (título del guion
  cargado), `…MesaId` (id de la sesión de mesa de la pantalla). `POST campaigns/{id}/creacion/sesion/{preparar|iniciar|terminar}`
  (director; 409 fuera de orden; `iniciar` admite `{ mesaId, guion }`). `CreacionResponse.sesion`.
- `CharacterRespuestas`: `Clave` (única por personaje), `TipoPregunta` (`paso` | `decision` | …), `Pregunta`, `TipoRespuesta` (`texto` |
  `opcion` | `si-no` | `eleccion`), `Respuesta`, `Detalle` (JSON), `Origen` (`creacion` | `sesion-creacion` | `sesion`), `SesionId`,
  `SesionTitulo`, `RespondidaEn`, `AplicadaEn`. La migración copia `CreacionDatos` (alomante, alomancia) con la pregunta que vio el jugador.
- Los pasos de la creación dejan su fila desde el `PUT` del personaje (`CreacionGuiada.Cambios` → `RespuestasPersonaje.RegistrarPasos`); la
  web manda la pregunta vista en `respuestas: [{ paso, pregunta, tipoRespuesta }]`. Vaciar un paso quita su fila. Los campos de la ficha y
  `CreacionDatos` siguen siendo el dato de trabajo; las filas son el registro.
- `PUT campaigns/{id}/characters/{chId}/respuestas/decisiones` (director): la lista completa de decisiones del guion del personaje
  (`{ sesionId, sesionTitulo, decisiones: [{ clave, pregunta, respuesta, tipoRespuesta, detalle }] }`), que sustituye a la guardada: sin
  duplicados (400 si hay claves repetidas), cambiar la opción deja `AplicadaEn` a null. Con la sesión de creación en curso, las filas nacen
  `sesion-creacion` y la sesión de mesa debe ser la registrada (400 si no). `GET …/respuestas`: todo al director, la creación a su dueño.
- `CreacionPersonajeResponse.respuestas` (director: todas; jugador: las suyas de la creación).

## 3. Web (`cosmere-web`)

- Tipos `RespuestaPersonaje`, `SesionCreacion`, `DecisionesPersonajeRequest`, `RespuestaPasoRequest`; `creacionApi.sesion`, `getRespuestas`,
  `putDecisiones`.
- `CreacionJugador`: cada guardado lleva la pregunta vista (`preguntaDePaso`). `CreacionDirector`: tarjeta «Sesión de creación» (estado,
  fechas, guion, enlace a la pantalla) y, en «Ver respuestas», «Decisiones de la mesa» por sesión y escena (`pages/creacion/Respuestas.tsx`,
  compartido con la pantalla).
- Pantalla del director: `pantalla/creacionPantalla.ts` (estado de la creación, `esSesionDeCreacion`), `pantalla/SesionCreacion.tsx`
  (`SeccionSesionCreacion` en Bitácora: «Preparar la sesión de creación» → preparación con cada personaje en creación, sus respuestas y
  las notas del director (`estado.preparacionCreacion`, guardadas con la pantalla) → «Empezar la sesión de creación», que registra la
  sesión en la campaña y abre la sesión de mesa número 0; `TarjetaCreacion` en las tarjetas del Grupo mientras se prepara o se juega).
  «Terminar sesión» de la sesión de creación manda las decisiones pendientes, cierra la sesión en la campaña y avisa de quién sigue en creación.
- `pantalla/sincronizacion.ts`: tras elegir, marcar la prueba o quitar una decisión, la lista del personaje se manda a la API (0,8 s de
  retraso); el registro de decisiones enseña el estado y ofrece «Guardar en la creación» para reenviar todo.

## 4. Pendiente

1. Pasos nuevos antes de la sesión (propósito, obstáculo, vínculo, metal antes de hoy) con los textos de los cuatro legados elegidos
   (Funcionario, Convicto, Cronista, Veterano).
2. «Aplicar a la ficha» desde el registro (atributos, grados, pericias, metas, objetos) y la recomendación de camino y metal; el paso
   «Tu camino heroico».
3. Enseñar las decisiones al jugador (hoy solo el director).
4. Guion de la sesión 0 y biblia al día con el reparto nuevo.

## 5. Ajustes del 28-10 (tarde)

- «Empezar la sesión de creación» pide confirmación y solo se activa con un guion cargado; la preparación enseña tres requisitos (guion,
  respuestas al día con los pasos liberados, notas por personaje). Motivo: un segundo toque sobre «Preparar» arrancaba la sesión.
- «Volver a la preparación» (Bitácora, con la sesión de creación en curso): `POST …/creacion/sesion/volver` (en curso → preparando, borra
  inicio, guion y sesión de mesa) y la pantalla descarta la sesión de mesa 0. Una sesión jugada sigue sin reabrirse.
- Guion de la sesión 0 para la mesa de cuatro trasfondos: `docs/pantalla-director/guiones/legado/sesion-0-cuatro.md` (ignorado por git),
  generado desde `sesion-0.md` sin las escenas del Noble y del Pilluelo, cuyos papeles quedan en PNJ sin nombre.

## 6. «Aplicar a la ficha» (28-10, tarde)

- `POST campaigns/{id}/characters/{chId}/respuestas/aplicar` (director): la pantalla suma lo que dan las decisiones pendientes (`pantalla/aplicar.ts`,
  con la misma lógica del registro) y la API lo escribe (`AplicadorFicha`): atributos sin pasar de 3, grados sin pasar de 2 por habilidad
  (una habilidad fuera de la lista del mundo busca su hueco personalizado por nombre, como Alomancia), pericias y objetos sin repetir,
  metas activas una vez por título y el camino y el metal recomendados (el más marcado, si no hay empate) en `creacionDatos`
  (`caminoRecomendado`, `metalRecomendado`). Las filas quedan `aplicadaEn`; repetir las mismas claves es 409. Lo que no encuentra sitio vuelve en `ignorado`.
- Nueva columna `Characters.Pericias` (text[], migración `AddCharacterPericias`, aditiva), en el DTO y en el PUT (sin vacíos ni repetidas). La ficha
  la enseña y edita en «Trasfondo» solo con `features.pericias` (Mistborn).
- Registro de decisiones (Grupo): «Aplicar a la ficha» por personaje y para todos los que tengan pendientes, con pendientes/aplicadas y
  «Aplicada a la ficha» en cada decisión; el resultado se lee en una línea por personaje. Una decisión cambiada tras aplicarse vuelve a pendiente:
  aplicar de nuevo añade lo nuevo, nada se resta (ajuste a mano).
- Pendiente: el paso «Tu camino heroico» con la recomendación, y el punto de control (12 puntos de atributo, 5 grados) sigue a mano.

## 7. Ajustes del 28-10 (noche): panel «Creación», decisiones automáticas

- Durante la sesión de creación cada decisión se escribe en la ficha al elegirla y se deshace si cambia o se quita: el PUT de decisiones
  lleva `aplicar` y lo que da cada una (`EfectosFicha`, sumado en `pantalla/aplicar.ts`); la API recuerda por fila lo pedido y lo hecho
  (`CharacterRespuestas.Aplicado`). Fuera de la sesión, «Aplicar a la ficha» a mano por filas.
- Pantalla: nuevo panel «Creación» en el Registro (`PanelCreacion`: estado y acciones de la sesión, personajes con respuestas y notas,
  registro de decisiones), visible solo mientras la sesión de creación no está jugada. La Bitácora solo cierra la sesión de mesa y
  señala a Creación mientras se prepara; el registro de decisiones deja el Grupo. Acciones compartidas en `sesionCreacionAcciones.ts`.
- «Encuentro» solo aparece en la cinta mientras hay un combate abierto (se abre desde «Al encuentro» de una escena).
- «Decisiones de la mesa» en Creación: una tarjeta por escena, pregunta, respuesta en grande y lo que da como etiquetas de color, con
  el resultado de la prueba y «En la ficha».
