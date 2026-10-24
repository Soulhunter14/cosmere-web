# Caminapiedras: mapas y fichas de la mesa

Índice de los PDF de mapas, fichas (tokens) y handouts de la aventura **Caminapiedras** (Archivo de las Tormentas), para que
cualquier sesión sepa qué página abrir y cómo montarla sin volver a mirar las 70 páginas.

**Estado (23 de octubre de 2026): verificado.** Cada uno de los 18 mapas del Manual de la partida se ha comparado con su montaje de
losetas (orden y giro) renderizando ambos lado a lado. Solo queda una inferencia, marcada `[inferido]`: el montaje y el uso de las
páginas p9–p10, que no tienen mapa equivalente en el Manual.

## Dónde están

Desde el 23 de octubre de 2026 **los cuatro PDF de esta carpeta son la única referencia de Caminapiedras**. La copia del Manual de la
partida que hay en `cosmere-api/Resources/CaminaPiedras/` es idéntica byte a byte, pero ya no es la referencia. Material con
copyright: **no se commitea** ni se copian sus renders al repositorio.

`C:\Users\xavie\Documents\Personal\Cosmere\Spanish_Stonewalkers_Adventure\Spanish Stonewalkers Adventure\`

| Fichero | Páginas | Tamaño | Qué es |
|---------|---------|--------|--------|
| `ARTO007_Caminapiedras aventura_high.pdf` | 172 | 122 MB | **El Manual de la partida** (md5 `e74efb8e…`). Página del libro = página del PDF − 4 (comprobado en los pies de los capítulos 1 a 7). |
| `ARTO007_Caminapiedras_cover_ESP_high.pdf` | 1 | 28 MB | Portada. |
| `Maps-and-Tokens-Stonewalkers.pdf` | 70 | 192 MB | **Mapas de batalla y fichas.** Solo imágenes (una por página, sin capa de texto). Páginas carta (612×792 pt). |
| `Stonewalkers_Handouts.pdf` | 40 | 57 MB | **Handouts para jugadores, en inglés** (arte de PNJ y lugares, mapas 2.1, 3.1 y 4.1 con rótulos). Con capa de texto. |

La subcarpeta `__MACOSX` es basura del zip.

## Cómo leer el PDF de mapas

- No tiene texto: `pdf_extractor` devuelve páginas vacías. Hay que **renderizar** y mirar. Con la herramienta del repo
  (`cosmere-api/Resources/Parts/pdf_image_extractor`, 96 DPI, ficheros `map_p<N>.png`):

  ```bash
  dotnet run --project "cosmere-api/Resources/Parts/pdf_image_extractor" -- "C:\Users\xavie\Documents\Personal\Cosmere\Spanish_Stonewalkers_Adventure\Spanish Stonewalkers Adventure\Maps-and-Tokens-Stonewalkers.pdf" "<carpetaSalida>" 45 46 47 48
  ```

  O con PyMuPDF (instalado en el Python del sistema), que permite elegir DPI:

  ```bash
  python -I -c "import pymupdf as f, sys; d=f.open(sys.argv[1]); [d[p-1].get_pixmap(dpi=120).save(f'mapa_p{p}.png') for p in map(int, sys.argv[2:])]" "C:\Users\xavie\Documents\Personal\Cosmere\Spanish_Stonewalkers_Adventure\Spanish Stonewalkers Adventure\Maps-and-Tokens-Stonewalkers.pdf" 45 46 47 48
  ```

- Para montar las losetas de un mapa en una sola imagen (orden por filas) y, si hace falta, girar el conjunto:

  ```python
  import pymupdf as fitz, sys
  # uso: montar.py <pdf> <salida.png> <columnas> <giro: 0, 90 (izquierda) o -90 (derecha)> p1 p2 ...
  src = fitz.open(sys.argv[1]); out_png = sys.argv[2]; cols = int(sys.argv[3]); giro = int(sys.argv[4])
  pages = [int(p) for p in sys.argv[5:]]
  r0 = src[pages[0] - 1].rect; TW = 400; TH = int(TW * r0.height / r0.width); rows = (len(pages) + cols - 1) // cols
  tmp = fitz.open(); grid = tmp.new_page(width=cols * TW, height=rows * TH)
  for k, pno in enumerate(pages):
      x0, y0 = (k % cols) * TW, (k // cols) * TH
      grid.show_pdf_page(fitz.Rect(x0, y0, x0 + TW, y0 + TH), src, pno - 1)
  W, H = (grid.rect.height, grid.rect.width) if giro % 180 else (grid.rect.width, grid.rect.height)
  out = fitz.open(); page = out.new_page(width=W, height=H)
  page.show_pdf_page(page.rect, tmp, 0, rotate=giro)   # rotate=90 gira a la izquierda (antihorario), -90 a la derecha
  page.get_pixmap(dpi=96).save(out_png)
  ```

- Las losetas llevan un pequeño sangrado, así que montadas sin recortar quedan ligeros desajustes en las juntas; para la mesa da
  igual, para imprimir conviene recortar unos milímetros.
- Escala del libro: **1 casilla = 1,5 m**, salvo el Mapa 1.2 (la caravana), 1 casilla = 3 m, y el Mapa 5.1 (Ashiqqil), 1 casilla = 1 m.
- Convención de este documento: «girar a la izquierda» = antihorario (`rotate=90` en `show_pdf_page` de PyMuPDF); «a la derecha» =
  horario (`rotate=-90`). Cuando un mapa va girado, se da tanto la receta (montar y girar el conjunto) como la posición final de
  cada loseta en la orientación del Manual.

## Los 18 mapas del Manual de la partida y su montaje

«PDF» es la página del fichero del Manual; «Libro», la impresa (PDF − 4).

| Mapa | Nombre en el libro | PDF | Libro | Páginas y montaje en `Maps-and-Tokens` |
|------|--------------------|----:|------:|-----------------------------------------|
| 1.1 | Atrapados en el crem | 29 | 25 | **p7 \| p8**, lado a lado, sin girar. El carro de tormenta y su chull entre rocas de crem. |
| 1.2 | La caravana | 32 | 28 | **p11 encima de p12**, sin girar. Los carros al abrigo de la pared de roca; 1 casilla = 3 m. |
| 1.3 | Batalla con Veth | 35 | 31 | **p13** sola. Suelo oscuro con cuadrícula y la pared de roca a la derecha. |
| 2.1 | Campamento de guerra de los Kholin | 41 | 37 | **No está en el PDF de mapas.** Es una ilustración isométrica con rótulos: Manual PDF 41 (castellano) y Handouts p5 «Map 2.1: Kholin Warcamp» (inglés). |
| 2.2 | El complejo del templo | 57 | 53 | **p31** sola: la vista general, con los rótulos en inglés (Temple, Housing, Monastery, Training Complex, Guard Post, Storage). |
| 2.3 | Interior del monasterio | 59 | 55 | **16 losetas en 4×4 por filas**: p15–p18 / p19–p22 / p23–p26 / p27–p30, sin girar. Es el complejo entero a escala de batalla (muralla arriba, tejado abajo a la izquierda, mesas de «Recepción y triaje» abajo a la derecha). |
| 3.1 | La ciudad de Rathalas | 65 | 61 | **p14 y p32**: dos copias casi idénticas de la vista general, sin rótulos («West to the Sea of Spears», norte). Con los rótulos A1–A8: Manual PDF 65 (castellano) y Handouts p11 (inglés). |
| 3.2 | El suelo del cañón | 66 | 62 | **p49** sola: río turquesa, orilla de arena y rocabrotes, con cuadrícula. |
| 3.3 | La prisión de Rathalas | 70 | 66 | **p33 \| p34**, lado a lado, sin girar. Pasillo P1, sala del mosaico rojo P2, barriles P3 y celdas P4. |
| 3.4 | El salón y la plataforma | 76 | 72 | **2×2 por filas: p35 p36 / p37 p38**, sin girar. La plataforma circular de madera sobre la sima; la caseta del túnel abajo a la izquierda. |
| 3.5 | El salón y la plataforma caída | 77 | 73 | **2×2 con las filas invertidas: p41 p42 / p39 p40**, sin girar. La misma zona con el maderamen derrumbado. |
| — | Ruta de Rathalas a Gran Hexi (sin número; Handouts p18) | — | — | **p43 \| p44** (oeste \| este): mapa de Roshar con la ruta en rojo. |
| 4.1 | Zanjas de Hexi | 87 | 83 | **Girado.** Montar p45 p46 / p48 p47 y girar el conjunto a la izquierda. En la orientación del Manual quedan p46 (arriba izda.), p47 (arriba dcha., tienda dorada), p45 (abajo izda., Tienda de Axoq) y p48 (abajo dcha., tienda azul), cada loseta girada a la izquierda. |
| 4.2 | El valle de Cultivación | 93 | 89 | **Girado.** Montar p50 \| p51 y girar el conjunto a la derecha. En la orientación del Manual p50 queda arriba y p51 abajo, cada loseta girada a la derecha. |
| 5.1 | La batalla por la Fortaleza de Ashiqqil | 99 | 95 | **4×2 por filas: p52–p55 / p56–p59**, sin girar. 1 casilla = 1 m. Las losetas cubren solo la mitad norte del mapa del Manual (las cuatro plataformas, las entradas, la muralla con buhederas y la Puerta de Ashiqqil); la explanada sur con los peñascos y las paredes de roca laterales no están. |
| 6.1 | El escondite de la resistencia | 113 | 109 | **p60 \| p61**, lado a lado, sin girar. Almacén con barriles, alfombra, estanque y el patio del mosaico con tres mesas. |
| 6.2 | El pozo del Hueco Funesto | 119 | 115 | **2×2 por filas: p62 p63 / p64 p65**, sin girar. El pozo queda en el centro; el Manual lo imprime algo recortado arriba y abajo. |
| 7.1 | Exterior e interior de la bóveda | 124 | 120 | **p66 girada a la izquierda**: la vista general con Y1–Y8 (la sala de estanterías Y7 queda arriba a la derecha). |
| 7.2 | La bóveda de Pailiah | 131 | 127 | **Girado.** Montar p67 p68 / p70 p69 y girar el conjunto a la izquierda. En la orientación del Manual quedan p68 (arriba izda.), p69 (arriba dcha.), p67 (abajo izda.) y p70 (abajo dcha.); la zona iluminada y las luces quedan arriba. |

## Índice por página de `Maps-and-Tokens-Stonewalkers.pdf`

| Páginas | Contenido |
|---------|-----------|
| p1–p6 | **Fichas redondas** (tokens): PJ, PNJ, soldados y criaturas, unas 60 por página, con fondos de color por bando |
| p7–p8 | Mapa 1.1, Atrapados en el crem |
| p9–p10 | **Sin equivalente en el Manual**: la caravana en marcha (carros tirados por chulls, hoguera, cajas), mismo estilo y escala que el 1.1. Encaja con «La emboscada de los bandidos» / «Emboscada en el camino» (Manual PDF 30–31), que no tiene mapa numerado. Montaje probable p9 \| p10 `[inferido]` |
| p11–p12 | Mapa 1.2, La caravana (p11 arriba, p12 abajo) |
| p13 | Mapa 1.3, Batalla con Veth |
| p14 | Mapa 3.1, La ciudad de Rathalas (copia 1, sin rótulos) |
| p15–p30 | Mapa 2.3, Interior del monasterio (16 losetas, 4×4 por filas) |
| p31 | Mapa 2.2, El complejo del templo (vista general) |
| p32 | Mapa 3.1, La ciudad de Rathalas (copia 2, sin rótulos) |
| p33–p34 | Mapa 3.3, La prisión de Rathalas |
| p35–p38 | Mapa 3.4, El salón y la plataforma |
| p39–p42 | Mapa 3.5, El salón y la plataforma caída (filas invertidas: p41 p42 arriba, p39 p40 abajo) |
| p43–p44 | Ruta de Rathalas a Gran Hexi (mapa de Roshar, oeste \| este) |
| p45–p48 | Mapa 4.1, Zanjas de Hexi (girado, ver receta) |
| p49 | Mapa 3.2, El suelo del cañón |
| p50–p51 | Mapa 4.2, El valle de Cultivación (girado, ver receta) |
| p52–p59 | Mapa 5.1, La batalla por la Fortaleza de Ashiqqil (mitad norte; 4×2) |
| p60–p61 | Mapa 6.1, El escondite de la resistencia |
| p62–p65 | Mapa 6.2, El pozo del Hueco Funesto (2×2) |
| p66 | Mapa 7.1, Exterior e interior de la bóveda (girar a la izquierda) |
| p67–p70 | Mapa 7.2, La bóveda de Pailiah (girado, ver receta) |

## `Stonewalkers_Handouts.pdf` (inglés)

Nombres tal como aparecen en el PDF. Cada página lleva el rótulo «Stonewalker's GM Tools» y el capítulo.

| Páginas | Capítulo | Contenido |
|---------|----------|-----------|
| p1 | — | Portada «Stonewalkers Handouts» |
| p2–p4 | 1, Honor beyond the storm | Bordin and the stormwagon; Taszo-son-Clutio; Taln in his stormwagon; glyph-inscribed dagger; refugio de la alta tormenta en Covenant Stone Crossroads; Veth, Kaiana and Ylt at Taszo's fall |
| p5–p9 | 2, Weeper's Trail | **Map 2.1: Kholin Warcamp** (la ilustración del Mapa 2.1 con rótulos en inglés: The Ornery Chull, Bettani's Bunker, The Spear Exchange, The Blueworks, Devotary of the Mind, Sgt. Ellar's Barracks, Temple Complex, Kholin Central Complex…); Calinai scouts the chasm; whitespines escape the menagerie; a game of Pieces; Liss; Po'ahu; highprince Amaram; Taln imprisoned |
| p10–p16 | 3, The City that Smolders | The City of Rathalas; **Map 3.1 City of Rathalas con A1–A8 y Chamber of the Heralds**; The Maze of Bridges; Kaiana tends to Teryn; Ubo the Quartermaster; The Gray Remnant; ancient mosaics in Lower Rathalas; stone triptych of the Heralds (Nalan, Paliah, Taln) |
| p17–p22 | 4, Into the Valley | The everstorm strikes; the party's route from Rathalas to Greater Hexi; **Map 4.1 Hexi Trenches** (1 square = 5 ft, impreso en vertical); raysium knife; Axoq; The Nightwatcher's Valley; Ylt and Kaiana meet the Nightwatcher |
| p23–p26 | 5, The Eighty's War | Assault on Ashiqqil Gate; Tukari soldier; Emuli warrior; Vanzi, Dustbringer of the Second Ideal; Nale, Herald of Justice; The Measured Response |
| p27–p31 | 6, Precipice of Change | Rall Elorim; Heth Dymad; Heth's Resistance; Axies the Collector |
| p32–p40 | 7, What was and What Could Be | Ylt with Taln's Honorblade; flooded corridors; entrance to Paliah's Vault; a mysterious fabrial door; Ylt and Shadowform zealots; Taln's Honorblade y Lilinum's Blade; Po'ahu in the Cognitive Realm |

## Uso en la app

Los mapas que sirve la app están en `public/maps/caminapiedras/` (`mapa-1-1.webp` … `mapa-4-2.webp`, más `mapa-1-emboscada.webp`)
y los referencian los datos de los capítulos en `src/data/caminapiedras/cap1.ts` a `cap4.ts` (campo `maps`, `imagePath`). Se generan
con `scripts/caminapiedras/generar_mapas.py`, que monta y gira las losetas según las recetas de este documento y recorta del Manual
los dos mapas con rótulos en castellano (2.1 y 3.1), que el PDF de mapas no trae rotulados:

```bash
python -I scripts/caminapiedras/generar_mapas.py "<carpeta>\Maps-and-Tokens-Stonewalkers.pdf" "<carpeta>\ARTO007_Caminapiedras aventura_high.pdf" public/maps/caminapiedras --hoja hoja.png
```

Lado largo de 2400 a 4000 px según el número de losetas, webp con calidad 82. Hasta el 24 de octubre de 2026 la app servía páginas
enteras del Manual renderizadas a 1275×1650 (`public/maps/map_p<N>.webp`); se retiraron al sustituirlas. Los capítulos 5 a 7 aún no
existen en los datos, así que sus mapas (5.1, 6.1, 6.2, 7.1 y 7.2) están solo en este índice.

## Cómo se verificó

Para cada mapa se recortó la imagen del Manual (la imagen más grande de la página que no es el fondo) y se montaron las losetas
candidatas con el guion de arriba, probando las rejillas y los giros posibles hasta que coincidieran los elementos inconfundibles:
tiendas de las zanjas de Hexi, el pozo del Hueco Funesto, la caseta del túnel de la plataforma, la zona iluminada de la bóveda,
la sala de estanterías Y7, el carro de tormenta, los rótulos del complejo del templo, etc. Las dos copias de Rathalas (p14 y p32)
se compararon lado a lado y no muestran diferencias visibles aparte del tamaño de la imagen incrustada.
