# Adversarios desde los PDF

Scripts que convierten los perfiles de adversario de un libro del JdR del Cosmere (edición en español) en una migración de
datos de la API (`GlobalNpcs`). Se usaron para los 38 adversarios de la **Guía del mundo de Nacidos de la bruma**
(capítulo 8, PDF 223-269) → migración `SeedMistbornAdversarios`. Solo código: el texto extraído del libro va a
`cosmere-api/Resources/pdfextract/` (ignorado por git) y nunca se sube.

Ejecutar con `python -I` (PyMuPDF instalado):

```bash
python -I extraer_pdf.py "<libro>.pdf" ../../cosmere-api/Resources/pdfextract/<libro>_flow.txt
python -I parse_adversarios.py <flow.txt> "<libro>.pdf" <desde_pdf> <hasta_pdf> "<Fuente>" <pdf-libro> adversarios.json informe.txt
python -I generar_migracion.py adversarios.json <Migración>.cs <Clase> mistborn "<Fuente>" "<resumen>"
```

1. `extraer_pdf.py`: texto por página (separadas con salto de página) e índice del PDF.
2. `parse_adversarios.py`: cada perfil («Rival de rango 2 – Humanoide Mediano») a una fila. Valida que las defensas
   impresas sean 10 + atributos (si no, escribe una «Nota del libro» con las impresas, que la pantalla del director usa),
   que la salud esté en su rango y que las habilidades existan. Las habilidades se guardan como rango (total − atributo).
   Rasgos en `Talentos` («Nombre: descripción»); desvío, movimiento, sentidos, inmunidades, artes metálicas, acciones (una
   por línea, con su coste 1/2/3/0/r), tácticas y la cita «L./PDF» en `Notas`; la descripción en `Apariencia`.
   Revisa siempre `informe.txt`: los avisos son erratas del libro o páginas raras.
3. `generar_migracion.py`: la migración (solo `InsertData`; su `Down` borra exactamente esas filas por `World` y `Source`).
   Antes: `dotnet ef migrations add <Clase> --project Infrastructure --startup-project API` con la API parada, y sustituir
   el archivo vacío por el generado. La ascendencia sale del nombre («Espía kandra»); la de los perfiles con nombre propio está en
   la tabla `ASCENDENCIA` del script (NeBaal, Azmine Wilko, Yunque, criaturas hemalúrgicas).

Usados también para **El legado** (Apéndice A, PDF 192-242, desfase 3): `SeedLegadoAdversarios`, con los 26 perfiles que no son
reimpresiones de la Guía (los 18 repetidos tienen los mismos números y no se cargan dos veces).

**Era**: la migración `AddGlobalNpcEra` rellena `GlobalNpcs.Era` de estas filas con las marcas «ERA 1» / «ERA 2» de los marcadores
del PDF (una subsección hereda la de su sección; sin marca = ambas eras). Si se carga otro libro, su era se pone igual, en una
migración posterior a la de datos, o en el propio `InsertData` añadiendo la columna.
