# La sesión de la pantalla: formato

El panel Escena de la pantalla del director tiene dos fuentes:

- **Libro**: la aventura tal como la cuenta el libro (`src/data/caminapiedras/`). Es una referencia fija: se lee y se consulta,
  pero no guarda progreso (ni escena actual, ni jugadas).
- **Sesión**: el guion de lo que debería pasar a partir de ahora, el esqueleto de la partida. Aquí vive todo el progreso: escena
  actual, escenas jugadas, pruebas superadas o falladas, empeños y contadores. Todo lo que se marca se anota en la bitácora.

La sesión no se escribe entera en la app: se prepara fuera, normalmente con IA a partir del libro y de lo jugado, y se importa como
Markdown. En la mesa se completa de dos formas:

- **Desde el libro.** Cada escena y cada combate del libro tiene **Añadir a la sesión**, que la copia a la sesión en este formato
  (lectura en voz alta, texto, pruebas con su CD, caminos, consejos y tablas; en los combates, el mapa, los enemigos, las reglas y
  las recompensas). Si ya hay una escena con ese título, el botón dice «En la sesión».
- **In situ.** **Nueva escena** pide título, tipo, texto para leer en voz alta y qué pasa; hereda el grupo de la escena actual y
  pasa a ser la actual. «Escribirla completa en Markdown» abre el editor con todo el formato.

Las escenas añadidas (del libro, in situ o importadas) entran **tras la escena actual**, o al final si no hay ninguna.

Los avances de los personajes (nivel, metas, Ideales) solo se **recomiendan**: se aplican en la ficha de cada personaje, nunca
desde la pantalla.

## El ciclo

1. **Borrador.** En Sesión, «Prompt de la siguiente sesión» copia un *prompt* con los PJ (caminos, propósito, obstáculo y metas
   activas), la última crónica del diario, el estado de cada escena de la sesión (jugada, en juego o sin jugar, con las pruebas
   superadas o falladas, el empeño y los contadores) y las notas de la bitácora. Se pega en la IA, mejor con
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
| `> …` | Recuadro «Leer en voz alta» con letra grande. |
| `### Pruebas` | Cada viñeta «**Habilidad CD n**: …» o «**Habilidad contra …**: …» con su dificultad en grande y **Superada / Fallada**. |
| `### PNJ` | Tarjetas; si el nombre o `ficha:` coincide con el catálogo, botón **Añadir al encuentro**. |
| `### Para los PJ` | Ganchos por personaje. |
| `### Caminos` | Ramas según lo que decidan los jugadores. |
| `### Reglas del combate` | Efectos del campo de batalla; también se ven en el encuentro preparado desde la escena. |
| `### Avances` | Avances recomendados (subir de nivel, un hito de meta, un Ideal). Solo se recomiendan: se aplican en la ficha. Un `- [ ]` de guiones antiguos se lee como viñeta. |
| Otra `### Sección` | Se muestra tal cual (tablas de oportunidades, «Lo que sabe», visiones…). |

Los metadatos van justo debajo del título, sin líneas en blanco. No se admite HTML, ni tablas, ni enlaces.

## Imágenes

Las rutas que empiezan por `/` se sirven desde `public/` de la web y se cargan solo cuando se ven (la PWA no las precachea).
`public/aventura/caminapiedras/` tiene ilustraciones oficiales de los capítulos 3-4 de la aventura, extraídas como WebP: Kaiana y
Teryn, Ubo, los murales del templo, el Resto Gris, la tormenta eterna, la ruta de Rathalas al Gran Hexi, Axoq, la Vigilante
Nocturna, el valle, una vacíospren, un oyente pasando por parshmenio y la anguila aérea. Los mapas siguen en `public/maps/`
(`map_p77` = 3.5, `map_p87` = 4.1, `map_p93` = 4.2). También vale cualquier URL externa.

## Guiones de campaña

Los guiones de cada campaña son contenido de la mesa y de la aventura: viven en `docs/pantalla-director/guiones/`, que está en
`.gitignore`, y se cargan en la pantalla importándolos.

## El libro de la aventura, listo para importar

`scripts/aventura/parsear_caminapiedras.py` lee el PDF de *Caminapiedras* entero (introducción, capítulos 1-7 y apéndices A y B) y
genera, por partes:

- `cosmere-api/Resources/pdfextract/caminapiedras_libro/<parte>.json`: el texto en orden de lectura como lista de nodos (títulos,
  párrafos, recuadros de lectura, listas, cuadros laterales, tablas y mapas), cada uno con su página PDF. Es la base para futuras
  funciones sobre la aventura.
- `docs/pantalla-director/guiones/libro/<parte>.md`: el mismo texto en este formato, con una escena `##` por apartado del libro,
  `>` para los recuadros «Lee lo siguiente», `### PNJ` para los «Cómo interpretar a…», las tablas como listas y los mapas publicados
  como imágenes. Se importa en Sesión → Importar (mejor un capítulo cada vez, desmarcando lo que no se vaya a jugar: el documento
  de la pantalla admite hasta 1 MB).

```bash
python -I scripts/aventura/parsear_caminapiedras.py "<ruta>/ARTO007_Caminapiedras aventura_high.pdf" ../cosmere-api/Resources/pdfextract/caminapiedras_libro docs/pantalla-director/guiones/libro
```

Las dos salidas son texto literal del libro, que tiene derechos de autor: se quedan en local y fuera de git (las dos carpetas están
ignoradas). En el repositorio solo está el script. Los datos de la fuente Libro (`src/data/caminapiedras/`, un archivo por
capítulo) sí se versionan: son fieles al libro en todo dato, con redacción propia y la página para leer el original. Cada escena
lleva su `section` (el apartado del libro), que agrupa el índice del Libro y va en la `fuente:` de la escena añadida a la sesión.
