# La sesión de la pantalla: formato

El panel Escena de la pantalla del director tiene dos fuentes:

- **Libro**: la aventura del mundo de la campaña tal como la cuenta el libro (`WorldConfig.libro`): *Caminapiedras* en Archivo
  de las Tormentas (`src/data/caminapiedras/`) y *El legado de los nacidos de la bruma* en Nacidos de la Bruma
  (`src/data/mistborn/legado/`), solo con los capítulos de la era de la campaña (1-4 en la Era 1, 5-9 en la Era 2). Se carga bajo
  demanda. Es una referencia fija: se lee y se consulta, pero no guarda progreso (ni escena actual, ni jugadas). Si el director
  sube el **texto original** del libro (ver «El libro original» al final), el Libro muestra ese texto en lugar del resumen.
- **Sesión**: el guion de lo que debería pasar a partir de ahora, el esqueleto de la partida. Aquí vive todo el progreso: escena
  actual, escenas jugadas, pruebas superadas o falladas, empeños y contadores. Todo lo que se marca se anota en la bitácora.

La sesión no se escribe entera en la app: se prepara fuera, normalmente con IA a partir del libro y de lo jugado, y se importa como
Markdown. En la mesa se completa de dos formas:

- **Desde el libro.** «Del libro» (en la barra de Sesión) abre el Libro. Cada escena tiene **A la sesión** en la fila fija del
  índice, siempre a mano mientras se lee (solo el icono en el móvil), y cada combate, **Añadir a la sesión** junto a «Preparar
  encuentro». La copia va en este formato (lectura en voz alta, texto, pruebas con su CD, caminos, consejos y tablas; en los
  combates, el mapa, los enemigos, las reglas y las recompensas). Si ya hay una escena con ese título, el botón dice «En la sesión».
  En un mundo sin libro, o sin capítulos para la era de la campaña, no se muestran ni el Libro ni «Del libro».
- **In situ.** **Nueva escena** pide título, tipo, texto para leer en voz alta y qué pasa; hereda el grupo de la escena actual y
  pasa a ser la actual. «Escribirla completa en Markdown» abre el editor con todo el formato.

Las escenas añadidas (del libro, in situ o importadas) entran **tras la escena actual**, o al final si no hay ninguna.

## Cada sesión tiene sus escenas

- Las escenas de Sesión son las de la **sesión en curso** (Bitácora → «Empezar sesión») o, si no hay ninguna abierta, las de la
  **próxima sesión**, que se prepara de antemano. Importar, añadir del libro, crear, editar, ordenar o borrar escenas no abre una
  sesión; la abre «Empezar sesión» o *jugar* (escena actual, jugada, una prueba, un empeño). La cabecera dice «Sesión 4 · en curso»
  o «Sesión 4 · sin empezar».
- **Terminar sesión** se lleva las escenas **jugadas**, con lo anotado en cada una (pruebas superadas o falladas, empeño y
  contadores). Las **no jugadas pasan a la siguiente sesión** con su estado; la sesión nueva solo empieza vacía si se jugó todo. La
  confirmación dice cuántas se van y cuántas pasan.
- En Bitácora → «Sesiones anteriores», cada sesión muestra sus escenas jugadas (solo lectura) y «Copiar escenas» las devuelve en
  este formato, para reimportarlas si hace falta. Para no pasar del límite del documento (1 MB), solo las **3 últimas** sesiones
  cerradas guardan el Markdown de sus escenas; las anteriores, el título y lo anotado.
- «Prompt de la siguiente sesión» lleva lo jugado en la última sesión cerrada (con sus resultados) y las escenas pendientes.

Los avances de los personajes (nivel, metas, Ideales) solo se **recomiendan**: se aplican en la ficha de cada personaje, nunca
desde la pantalla. Lo mismo vale para lo que dan las **decisiones** (ver «Decisiones» más abajo): la pantalla lo suma y lo guarda,
y la ficha se cambia a mano.

## El ciclo

1. **Borrador.** En Sesión, «Prompt de la siguiente sesión» copia un *prompt* con los PJ (caminos, propósito, obstáculo y metas
   activas), la última crónica del diario, el estado de cada escena de la sesión (jugada, en juego o sin jugar, con las pruebas
   superadas o falladas, lo que decidió cada personaje, el empeño y los contadores) y las notas de la bitácora. Se pega en la IA, mejor con
   el libro de la aventura a mano.
2. **Importar.** «Importar» → pegar el Markdown o elegir el `.md`. La hoja lista las escenas del archivo con una casilla: se
   desmarcan las que no se quieran. *Añadir y actualizar* conserva lo marcado en las escenas con el mismo grupo y título;
   *Reemplazar la sesión* quita las que no estén en el archivo (pide confirmación).
3. **Jugar.** «Escena actual» fija dónde está la historia; «Jugada · pasar a…» marca la escena y pasa a la siguiente. El índice se
   abre en una hoja agrupada, con «Ir a la escena actual»; ◀ ▶ pasan de escena sin abrirlo.
4. **Crónica.** Bitácora → «Copiar prompt de crónica» y subir la crónica al diario. El siguiente borrador parte de ella.

Cada escena se guarda como su propio Markdown dentro del documento de la pantalla (`GmScreens.State`, `escenasPropias[].md`), así
que editar una escena es editar su texto (lápiz en la escena) y el formato puede crecer sin migraciones. Lo lee
`src/pages/pantalla/guion.ts`; la versión que va dentro del *prompt* es la constante `FORMATO_GUION` de ese archivo, que debe seguir
alineada con este documento.

## Estructura

```markdown
---
guion: Tras la batalla del salón
---

# Capítulo 4 · Hacia el valle

## Nubes que se retuercen
tipo: combate
fuente: Caminapiedras L.78-79 / PDF 82-83
imagen: /aventura/caminapiedras/anguila-aerea.webp | Anguila aérea
enemigos: 2 Anguila aérea mayor, 2 Anguila aérea
contadores: Daño del barco

> Texto para leer en voz alta. Un párrafo por línea con «>»;
> una línea con solo «>» separa párrafos.

Qué pasa y cómo dirigirlo, para el director. **Negrita** y *cursiva*.

### Pruebas
- **Supervivencia CD 12**: para qué sirve. Éxito: … Fallo: …
- **Intimidación o Persuasión contra la Defensa espiritual**: prueba enfrentada.

### Reglas del combate
- Al final de cada ronda se une una anguila aérea más.

### PNJ
- **Ubo** (él · ficha: Bandido): cómo interpretarlo.

### Para los PJ
- **Oden**: el gancho de este personaje en la escena.

### Caminos
- **Si intentan …**: qué ocurre.

### Decisión: ¿Qué hacéis con el prisionero?

prueba: Persuasión CD 12 · éxito: +1 al atributo de la habilidad

- Lo soltáis. **Meta** Devolverle el favor · **Eco** El prisionero vuelve en el capítulo 6
- Lo entregáis. **Objeto** 20 marcos · **Eco** Los bandidos os buscan

### Claves de la escena
- Lo que tiene que pasar para que la historia siga.

### Avances
- Los PJ suben a nivel 4.
```

| Elemento | Qué hace la pantalla |
|---|---|
| `---` / `guion:` / `---` | Título del guion (opcional). |
| `# Grupo` | Agrupa las escenas siguientes en el índice («Capítulo 4 · Hacia el valle»). Se guarda en cada escena como `grupo:`. |
| `## Título` | Empieza una escena. El título y el grupo la identifican al reimportar. |
| `tipo:` | narrativa · social · exploración · combate · decisión (icono y color). |
| `fuente:` | Página del libro de la que sale («L.<libro> / PDF <pdf>»). |
| `imagen: ruta \| Título` | Galería con miniaturas que se abren a pantalla completa. Una línea por imagen. |
| `enemigos:` | «2 Anguila aérea mayor, 2 Anguila aérea»: botón **Preparar encuentro** con las fichas del catálogo. El encuentro recuerda la escena y muestra sus reglas y contadores. |
| `empeño:` | «6 éxitos antes de 4 fallos»: contador de éxitos y fallos con su resultado (se anota en la bitácora). |
| `contadores:` | «Daño del barco, Días de más en Karanak»: contadores con +/− y «± Cantidad». |
| `decide:` | Quién toma las decisiones de la escena: `todos` (por defecto), un legado (`convicto`) o el nombre de un PJ. |
| `> …` | Recuadro «Leer en voz alta» con letra grande. |
| `### Pruebas` | Cada viñeta «**Habilidad CD n**: …» o «**Habilidad contra …**: …» con su dificultad en grande y **Superada / Fallada**. |
| `### PNJ` | Tarjetas; si el nombre o `ficha:` coincide con el catálogo, botón **Añadir al encuentro**. |
| `### Para los PJ` | Ganchos por personaje. |
| `### Caminos` | Ramas según lo que decidan los jugadores (solo texto; para guardar lo elegido, `### Decisión`). |
| `### Decisión: ¿…?` | Una pregunta con una viñeta por opción: botones que guardan lo que elige cada personaje y, si lleva `prueba:`, **Superada / Fallada**. Ver «Decisiones». |
| `### Reglas del combate` | Efectos del campo de batalla; también se ven en el encuentro preparado desde la escena. |
| `### Avances` | Avances recomendados (subir de nivel, un hito de meta, un Ideal). Solo se recomiendan: se aplican en la ficha. Un `- [ ]` de guiones antiguos se lee como viñeta. |
| Otra `### Sección` | Se muestra tal cual (tablas de oportunidades, «Lo que sabe», visiones…). |

Los metadatos van justo debajo del título, sin líneas en blanco. No se admite HTML, ni tablas, ni enlaces.

## Decisiones

Una sección `### Decisión: <pregunta>` es una elección que la pantalla **guarda por personaje**: sirve para sesiones guiadas como
la sesión 0 de *El primer paso*, donde lo que se decide construye la hoja, y para cualquier elección que la historia tenga que
recordar.

```markdown
### Decisión: El carcelero golpea a Pella. ¿Qué haces?

Texto para el director (opcional). Un recuadro `>` también vale.

prueba: CD 10 · éxito: +1 al atributo de la habilidad

- Te interpones entre los dos. **Habilidad** +2 Atletismo · **Camino** Guerrero · **Metal** Peltre · **Eco** El carcelero le recuerda
- Le paras la sangre con la manga. **Habilidad** +1 Medicina y +1 Disciplina · **Camino** Erudito · **Metal** Bronce
```

- **Opciones.** Una viñeta por opción. El texto hasta la primera clave en negrita es la opción; después, sus efectos, separados
  por « · ». Todas las claves son opcionales:
  - Para la ficha: `**Atributo** +1 Fuerza`, `**Habilidad** +2 Atletismo` (o «+1 Medicina y +1 Disciplina»), `**Pericia** …`,
    `**Meta** …`, `**Objeto** …`.
  - Marcas secretas del director: `**Camino** Guerrero`, `**Metal** Peltre` (varios con «y» o comas).
  - Para la historia: `**Eco** …`, lo que volverá más adelante.
- **Líneas de la decisión**, en su propio párrafo (con una línea en blanco antes y después): `decide:` (como el de la escena, que
  sustituye para esta pregunta), `prueba: CD 10` (con la habilidad que da la opción elegida) o `prueba: Atletismo CD 12`, y
  `éxito: …`. Si el éxito dice «+1 al atributo de la habilidad», el registro suma 1 al atributo de esa habilidad (Atletismo →
  Fuerza); cualquier otro texto se apunta como premio.
- **Quién decide.** `decide:` en la escena o en la sección: `todos` (o nada) son todos los personajes de la campaña; un legado
  (`convicto`) o un nombre, los personajes que encajan. Con uno solo, cada opción es un botón; con varios, cada opción lleva una
  ficha con el nombre de cada uno. Si ningún personaje encaja (una campaña sin legados, un invitado), se guarda con ese nombre y sin
  personaje, y la pantalla lo avisa.
- **En la mesa.** Tocar una opción la marca para ese personaje (tocarla otra vez la desmarca; tocar otra la cambia). Si la decisión
  lleva prueba, aparece debajo con **Superada / Fallada**. Las dos cosas se anotan en la bitácora («Decisión», «Prueba»). En el
  Libro original, las decisiones se leen pero no se marcan.
- **Caminos y metales ocultos.** El ojo de cada decisión, y el interruptor del registro, muestran u ocultan las marcas secretas en
  ese dispositivo (la tableta puede estar mirando a los jugadores). Están ocultas por defecto.

**Dónde se guarda.** En el documento de la pantalla (`decisiones`, desde la versión 4 del estado), con la clave grupo + título de
la escena + pregunta + personaje. Por eso sobrevive a **Terminar sesión**, a reimportar la escena y a borrarla: lo decidido sigue
disponible en los capítulos siguientes. Cambiar el grupo, el título o la pregunta en el Markdown rompe el enlace con lo ya marcado
(el registro lo conserva igual). Lo decidido en cada escena también va con ella al archivarse y en los *prompts*.

**Registro de decisiones** (panel Grupo). Por personaje: lo que va a la ficha sumado (atributos, habilidades, pericias, metas y
objetos), las marcas de camino y de metal contadas (la más marcada destaca: es la recomendación del final de la sesión 0), los ecos
y cada decisión con su prueba. Una decisión mal marcada se quita desde aquí, con confirmación. La pantalla no cambia la ficha: el
tope de 3 por atributo y los puntos de control se comprueban al pasarlo a mano.

## Imágenes

Las rutas que empiezan por `/` se sirven desde `public/` de la web y se cargan solo cuando se ven (la PWA no las precachea).
`public/aventura/caminapiedras/` tiene ilustraciones oficiales de los capítulos 3-4 de la aventura, extraídas como WebP: Kaiana y
Teryn, Ubo, los murales del templo, el Resto Gris, la tormenta eterna, la ruta de Rathalas al Gran Hexi, Axoq, la Vigilante
Nocturna, el valle, una vacíospren, un oyente pasando por parshmenio y la anguila aérea. Los mapas siguen en `public/maps/`
(`map_p77` = 3.5, `map_p87` = 4.1, `map_p93` = 4.2). También vale cualquier URL externa.

## Guiones de campaña

Los guiones de cada campaña son contenido de la mesa y de la aventura: viven en `docs/pantalla-director/guiones/`, que está en
`.gitignore`, y se cargan en la pantalla importándolos.

## El libro original: generarlo y subirlo

El Libro de la app es un resumen fiel con redacción propia. Para tener el **texto del libro**, el director lo genera desde su PDF
y lo sube a su campaña: el Libro lo muestra entonces en lugar del resumen, y la Sesión sigue siendo su versión adaptada.

**1. Generar.** `scripts/aventura/parsear_libro.py` lee el PDF con un perfil por libro (`caminapiedras` o `legado`: tipografías,
colores de los títulos, desfase de páginas, partes y mapas) y genera, por parte:

- `<json dir>/<parte>.json`: el texto en orden de lectura como lista de nodos (títulos, párrafos, recuadros de lectura, listas,
  cuadros laterales, tablas y mapas), cada uno con su página PDF.
- `<markdown dir>/<parte>.md`: el capítulo en este formato, con la cabecera `capitulo:` y `titulo:`, una escena `##` por apartado del
  libro (con `apartado:`, su título de primer nivel, y `fuente:` con la página), `>` para los recuadros «Lee lo siguiente»,
  `### Pruebas` con las frases del libro que llevan CD, `### PNJ` para los «Cómo interpretar a…», las tablas como listas y los mapas
  como imágenes. Con el `combates.json` exportado de `src/data/<libro>` (título, mapa y enemigos con los nombres del catálogo), las
  escenas de combate llevan `enemigos:` para «Preparar encuentro»; un combate que no es un título del libro va como escena propia
  detrás de la más parecida.

```bash
node --experimental-strip-types --no-warnings scripts/aventura/exportar_combates.mjs src/data/mistborn/legado <combates.json>
```

```bash
python -I scripts/aventura/parsear_libro.py legado "<ruta>/SPA_NacidosBruma_Legado.pdf" ../cosmere-api/Resources/pdfextract/legado_libro docs/pantalla-director/guiones/libro/legado <combates.json>
```

```bash
python -I scripts/aventura/parsear_libro.py caminapiedras "<ruta>/ARTO007_Caminapiedras aventura_high.pdf" ../cosmere-api/Resources/pdfextract/caminapiedras_libro docs/pantalla-director/guiones/libro
```

**2. Subir.** En Libro → «Subir el libro original» (o «Subir capítulos» si ya hay alguno) se eligen los `.md`; cada uno sustituye
al capítulo de su número. Se guardan en la API (`BookChapters`, `/campaigns/{id}/book`, solo el director de la campaña, hasta
500 000 caracteres por capítulo), no en el documento de la pantalla. El Libro original se lee como la sesión pero en solo lectura
(las pruebas no se marcan), con el índice agrupado por `apartado:`; «A la sesión» copia la escena tal cual a la Sesión para
adaptarla, y sus enemigos preparan el encuentro. «Quitar el original» (con confirmación) borra los capítulos subidos y vuelve al
resumen. También se puede importar un capítulo directamente en Sesión → Importar.

Las salidas del script son texto literal del libro, que tiene derechos de autor: se quedan en local y fuera de git (las carpetas
están ignoradas) y solo las sube el director a su campaña. En el repositorio solo está el script. Los datos de la fuente Libro (`src/data/caminapiedras/` y
`src/data/mistborn/legado/`, un archivo por capítulo, con los tipos comunes en `src/data/libros/tipos.ts`) sí se versionan: son
fieles al libro en todo dato, con redacción propia y la página para leer el original. Cada escena lleva su `section` (el apartado
del libro), que agrupa el índice del Libro y va en la `fuente:` de la escena añadida a la sesión. Los mapas de *El legado* están
en `public/maps/legado/` (21 WebP recortados del PDF, solo el mapa, sin texto del libro).
