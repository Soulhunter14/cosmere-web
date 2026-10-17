# La banda: Cartel de misiones

Planteamiento revisado con las respuestas de Xavi (17 oct 2026). Añade a la hoja de banda una pestaña **Cartel**, justo después de
Refugio, con los encargos, rumores y amenazas que publica el director. La banda los **acepta** o los **rechaza**, y los aceptados
quedan **en curso** hasta que el director los cierra.

Es el «Tablón de oportunidades» del bucle de juego de la biblia (*Biblia de campaña › La banda › El bucle de juego*: el máster
ofrece 2 o 3 encargos, rumores o amenazas y los jugadores eligen). Lo que queda para más adelante está en el §7.

**Sin cambios en la API ni migraciones:** `CrewSheets.State` y `CrewSheets.GmState` son JSON opacos (1 MB y 200 KB) que el servidor
guarda tal cual, y las operaciones del servidor (`aportes`, `almacen/*`) leen y reescriben el JSON entero conservando los campos que
no tocan. El evento `CrewSheetUpdated` ya avisa a todos de cada cambio.

---

## 1. Decisiones

| # | Decisión |
| --- | --- |
| 1 | Pestaña propia **«Cartel»**, la segunda (después de Refugio). La pestaña por defecto sigue siendo Refugio. |
| 2 | Los jugadores **no proponen** encargos: solo aceptan o rechazan lo que publica el director. Proponer queda para iterar (§7). |
| 3 | Los rumores tienen una **verdad oculta** (cierto, falso o a medias) que solo ve el director. |
| 4 | **Sin metas de banda** en esta entrega. Cómo integrarlas queda para iterar (§7). |
| 5 | La sección de arriba es **«En curso»**: los encargos que la banda ha aceptado y aún no se han cerrado. |
| 6 | **Plazo en semanas** opcional, que pone el director al crear el aviso; «Pasar semanas» lo descuenta. Es **privado**: solo lo ve el director (decidido el 17 oct 2026); los jugadores solo ven que un aviso caducado pasa al archivo. |
| 7 | Acepta o rechaza **la banda**, no un PJ: cualquier jugador con la banda compartida, o el director, pulsa por todos. El registro guarda quién lo pulsó. |
| 8 | Sin campo «Guion» por ahora; queda para iterar (§7). |

## 2. Qué ve cada uno

| Quién | Ve | Puede |
| --- | --- | --- |
| Director | Todo: borradores, la verdad de cada rumor, sus notas y «si caduca» | Crear, editar, publicar, cerrar, retirar y borrar avisos; aceptar o rechazar en nombre de la banda |
| Jugador con la banda compartida | Avisos publicados, en curso y el archivo | Aceptar o rechazar un aviso publicado en nombre de la banda; añadir pistas a uno en curso |
| Jugador sin la banda compartida | Nada (la página ya responde «La banda no está a tu alcance») | — |

## 3. Modelo de datos (`src/pages/banda/estado.ts`)

Todo es aditivo: `VERSION_BANDA` sigue en 1 y una hoja antigua se normaliza con listas vacías.

```ts
export type TipoAviso = 'encargo' | 'rumor' | 'amenaza'
/**
 * publicado → aceptado (en curso) → cumplido | fallido
 * publicado → rechazado | caducado | descartado
 * Los borradores no tienen estado público: viven en BandaSecretos.borradores hasta que se publican.
 */
export type EstadoAviso = 'publicado' | 'aceptado' | 'cumplido' | 'fallido' | 'rechazado' | 'caducado' | 'descartado'

/** Lo que todos los que tienen acceso ven en el cartel */
export interface Aviso {
  id: string
  tipo: TipoAviso
  titulo: string
  /** El gancho, como lo cuenta quien lo ofrece */
  texto: string
  /** Quién lo ofrece: id de un contacto de la banda, o null y `origenTexto` («Un apostador del Foso») */
  origenContacto: string | null
  origenTexto: string
  lugar: string
  /** Recompensa anunciada, en texto («150 ar y un favor de Hob») */
  recompensa: string
  /** Pago en moneda que se ingresa en la tesorería al cumplirlo; null = sin pago automático */
  pago: number | null
  estado: EstadoAviso
  /** Lo que la banda ha averiguado, en orden */
  pistas: string[]
  /** ISO */
  publicadoEn: string
  /** Cuándo la banda lo aceptó o lo rechazó */
  decididoEn: string | null
  cerradoEn: string | null
  /** Cómo acabó, visible para todos («Brannoc pagó la mitad») */
  desenlace: string
}

/** Lo privado de un aviso, en BandaSecretos.cartel bajo el mismo id (como los candidatos) */
export interface AvisoPrivado {
  /** Solo rumores: si es verdad. null = el director aún no lo ha decidido */
  verdad: 'cierto' | 'falso' | 'a-medias' | null
  /** Lo que de verdad hay detrás, la recompensa real… */
  notas: string
  /** Qué pasa si caduca o lo rechazan (sobre todo amenazas); se muestra al director cuando ocurre */
  siCaduca: string
  /** Semanas que le quedan, solo las sabe el director; null = sin plazo. «Pasar semanas» las descuenta */
  semanasRestantes: number | null
}
```

Campos nuevos:

- `BandaEstado.cartel: Aviso[]` (abiertos siempre; cerrados, los `MAX_HISTORIAL_CARTEL = 100` más recientes).
- `BandaSecretos.cartel: Record<string, AvisoPrivado>`.
- `BandaSecretos.borradores: Aviso[]`: avisos que el director aún no ha publicado. Publicar uno lo mueve a `BandaEstado.cartel`
  (mismo id) con `estado: 'publicado'`, igual que los candidatos.
- `TipoMovimiento` gana `'cartel'` (también en `TIPOS_MOVIMIENTO` y en el `TIPO` de `PanelRegistro.tsx`: «Cartel»).

Normalización: `normalizarAviso` y `normalizarAvisoPrivado` con los helpers que ya hay (`obj`, `arr`, `str`, `num`, `uno`);
`normalizarBanda`, `normalizarSecretos`, `bandaNueva` y `secretosVacios` los usan. Valores desconocidos caen en el valor por
defecto (`estado` → `'publicado'`, `tipo` → `'encargo'`).

## 4. Operaciones (`src/pages/banda/operaciones.ts`)

Funciones puras `OpBanda`, como las demás: validan con `ErrorBanda` y anotan en el registro con `tipo: 'cartel'`. Las marcadas
**(J)** las puede hacer un jugador: solo tocan `banda`, nunca `secretos`. Actualizar el comentario de cabecera con ellas. Como
acepta la banda, estas operaciones no llevan `Actor`: el registro guarda el `autor` (el usuario que pulsó), como siempre.

| Operación | Quién | Qué hace | Registro |
| --- | --- | --- | --- |
| `guardarBorrador(datos, privado, id?)` | Director | Crea o edita un aviso en `secretos.borradores` y su `AvisoPrivado` | — |
| `publicarAviso(id)` | Director | Mueve el borrador a `banda.cartel` como `publicado` | «Nuevo en el cartel: {titulo}» |
| `editarAviso(id, datos, privado)` | Director | Edita un aviso del cartel y su parte privada | — |
| `aceptarAviso(id)` **(J)** | Banda | `publicado` → `aceptado` | «La banda acepta: {titulo}» |
| `rechazarAviso(id)` **(J)** | Banda | `publicado` → `rechazado` | «La banda rechaza: {titulo}» |
| `anadirPista(id, texto)` **(J)** | Banda o director | Añade a `pistas` de un aviso `aceptado` | — |
| `cerrarAviso(id, resultado, desenlace, pago)` | Director | `aceptado` → `cumplido`/`fallido`; si hay pago, a la tesorería | con `dinero` si cobró |
| `descartarAviso(id, motivo)` | Director | `publicado` → `descartado` (lo retira; se queda en el archivo) | «Retirado del cartel: {titulo}» |
| `borrarAviso(id)` | Director | Lo quita del todo, parte pública y privada. **Con `ConfirmDialog`** | — |

Validaciones: título obligatorio; solo se acepta o rechaza un aviso `publicado` («La banda ya lo ha aceptado» si otro jugador se
adelantó); solo se cierra uno `aceptado`; el pago no puede ser negativo. Un rumor o una amenaza también se aceptan: significa que
la banda va a investigarlo o a hacerle frente.

### 4.1 Pasar semanas (`economia.ts`, `SemanasSheet.tsx`)

- Cada aviso `publicado` o `aceptado` con `semanasRestantes` descuenta las semanas pasadas.
- Al llegar a 0, un aviso `publicado` pasa a `caducado` y se anota («Caducado: {titulo}»). Uno `aceptado` no caduca: queda en 0 y el
  panel lo marca «Fuera de plazo».
- El resumen de «Pasar semanas» (solo lo ve el director) añade una sección **Cartel** con lo que ha caducado y, para cada aviso, su
  `siCaduca`. El director aplica las consecuencias a mano. La vista previa lo muestra antes de confirmar.

## 5. Interfaz

### 5.1 Pestaña

`BandaPage.tsx`: nueva pestaña `'cartel'`, etiqueta **Cartel**, icono `ClipboardList` (Lucide; no hay iconografía oficial de un
tablón), en segunda posición. Las pestañas ya hacen scroll horizontal (`overflowX: 'auto'` en `Tabs`), así que seis caben en 375 px.

### 5.2 `PanelCartel.tsx` (nuevo)

De arriba abajo, dentro del ancho de 680 px:

1. **En curso:** los avisos `aceptado`, con sus pistas, plazo («Quedan 2 semanas», o «Fuera de plazo» en rubí) y, para el director,
   los botones «Cumplido» y «Fallido». Vacío: «La banda no tiene nada entre manos.»
2. **En el cartel:** `Segmented` con Todo · Encargos · Rumores · Amenazas, con los avisos `publicado`. Vacío: «El cartel está
   vacío.»
3. **Archivo:** `Disclosure` cerrado con los cerrados (cumplido, fallido, rechazado, caducado, descartado), el más reciente primero.

Cabecera del panel, solo el director: **«Nuevo aviso»** y **«Borradores (n)»** (lista de borradores con «Editar», «Publicar» y
«Borrar»).

### 5.3 Tarjeta de aviso

- Chip de tipo con tono: Encargo (zafiro), Rumor (topacio), Amenaza (rubí). Chip de estado en el archivo.
- Título, texto, «Lo ofrece: {contacto o origenTexto}», lugar, recompensa, plazo («Caduca en 2 semanas» / «Sin plazo»).
- Pistas, si las hay; en el archivo, el desenlace.
- Solo el director: una línea en `textoSuave` con la verdad del rumor y las notas.
- Acciones:
  - Aviso publicado: «Aceptar» y «Rechazar» (jugador y director). Rechazar pide confirmación, porque el aviso sale del cartel.
  - Aviso en curso: «Añadir pista» (jugador y director); «Cumplido» y «Fallido» (director).
  - Director: «Editar», «Retirar» y «Borrar» (con confirmación).

### 5.4 Hojas (`Sheet`, en `hojasCartel.tsx`)

- `AvisoSheet` (director): tipo, título, texto, quién lo ofrece (desplegable de contactos o texto libre), lugar, recompensa, pago,
  plazo en semanas (vacío = sin plazo), verdad (solo rumores), notas y «si caduca». Botones «Guardar borrador» y «Publicar».
- `CerrarAvisoSheet` (director): Cumplido o Fallido, desenlace (texto público) y pago (precargado con `pago`, editable).
- `PistaSheet`: un campo de texto.

Textos en castellano, estilos en línea con `theme.ts`, primitivas de `ui.tsx`. Nada de Tailwind.

## 6. Tareas

Cada tarea deja `npx tsc -b` y `npm run lint` sin errores en `cosmere-web/`.

**T1. Tipos y normalización** (`estado.ts`). Tipos del §3, campos nuevos en `BandaEstado` y `BandaSecretos`, normalizadores,
`MAX_HISTORIAL_CARTEL`, `TipoMovimiento` con `'cartel'`.
*Acepta:* una hoja guardada antes de esta entrega se abre sin errores y con el cartel vacío; `normalizarBanda({})` devuelve
`cartel: []`.

**T2. Operaciones** (`operaciones.ts`). Las del §4 con sus validaciones. Las (J) no leen ni escriben `secretos`.
*Acepta:* `aceptarAviso` sobre un documento con `secretos` vacío funciona; aceptar dos veces da `ErrorBanda` «La banda ya lo ha
aceptado»; reaplicar tras un 409 da el mismo resultado.

**T3. Pasar semanas** (`economia.ts`, `SemanasSheet.tsx`). §4.1, en la vista previa y al confirmar.
*Acepta:* con un aviso publicado a 1 semana, pasar 2 semanas lo deja `caducado`, lo anota y lo muestra en el resumen con su
`siCaduca`; uno aceptado queda «Fuera de plazo».

**T4. Panel y tarjetas** (`PanelCartel.tsx`, `BandaPage.tsx`). §5.1 a §5.3.
*Acepta:* la pestaña es la segunda; a 375 px no hay scroll horizontal de página; un jugador no ve borradores, verdad ni notas.

**T5. Hojas** (`hojasCartel.tsx`). §5.4. Borrar y rechazar piden confirmación.

**T6. Registro** (`PanelRegistro.tsx`, `etiquetas.ts`). Etiqueta «Cartel» y su filtro.

**T7. Prueba en local.** En «Bruma TEST» (campaña 42), con la banda compartida con nb-jugador:
1. El director crea un rumor (verdad: falso) y un encargo con plazo de 2 semanas y pago de 150 ar, y publica los dos.
2. El jugador ve los dos sin la verdad ni las notas; acepta el encargo y añade una pista; rechaza el rumor.
3. El director pasa 3 semanas: el encargo queda «Fuera de plazo», no caducado.
4. El director lo cierra como cumplido: la tesorería sube 150 ar y el registro lo muestra con quién aceptó.
5. Dos navegadores abiertos (director y jugador): cada cambio llega al otro sin recargar.

## 7. Pendiente de iterar

- **Propuestas de los jugadores:** que la banda proponga sus propios encargos y el director los apruebe.
- **Metas de la banda:** cómo integrarlas con el cartel (por ejemplo, encargos que dan hitos y la subida de Escala de la biblia).
- **Guion:** un campo privado para enlazar cada aviso con la biblia o con el guion de la pantalla del director.
- También fuera: el cartel en la pantalla del director, sucesos de «Pasar semanas» que creen avisos y recompensas automáticas que
  no sean dinero.

## 8. Riesgos

- **Conflictos de escritura:** dos jugadores pulsando a la vez. Lo cubre el 409 + reaplicar de `useBanda`; la segunda pulsación da
  «La banda ya lo ha aceptado».
- **Tamaño:** 100 avisos cerrados con texto caben de sobra en 1 MB.
- **Fugas:** la verdad, las notas, «si caduca» y los borradores viven solo en `GmState`, que el servidor nunca manda a un jugador.
