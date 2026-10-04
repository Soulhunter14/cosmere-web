# Delta de reglas base: Archivo de las Tormentas (SL) frente a Nacidos de la Bruma (MB)

Objetivo: decidir con evidencia qué parte de `aventuras.ts`, `combatRules.ts` y de las páginas `AventurasPage.tsx` y
`CombatPage.tsx` se puede compartir entre los dos sets de reglas y qué debe diferenciarse. Este informe es autosuficiente:
cada diferencia lleva el dato exacto de ambos libros y la línea del repo que habría que tocar.

## 0. Resumen ejecutivo

- **El motor de reglas de escena es el mismo.** Los capítulos 9 (Aventuras), 10 (Combate), 11 (Conversaciones) y 12
  (Empeños) comparten estructura, numeración de capítulos, tablas numéricas y casi todo el texto. Lo mismo vale para el
  dado de trama y las Oportunidades y Complicaciones (sección 5): **idénticos**.
- **Lo que cambia es poco y está localizado:**
  - Estados: MB tiene 15 y SL tiene 14. MB **añade Desprovisto y Mermado** y **no tiene Empoderado**. Inconsciente
    pierde las excepciones de luz tormentosa.
  - Combate: la acción **Agarrar** deja al objetivo **Retenido** en MB e **Inmovilizado** en SL. La **Acometida reactiva**
    de MB admite también ataque sin armas. La **Sorpresa** se describe con distinta duración en el capítulo de combate.
  - Descansos y reposo: MB añade el beneficio «Almacenar en mentes de metal» (descanso corto y largo) y la actividad de
    reposo «Mentoría en las artes metálicas». Los costes se pagan en **arquillas** (no marcos).
  - Tablas: **capacidad de levantamiento y carga** (otros valores en kg), **tamaño de personajes** (5 frente a 6
    categorías), **terreno peligroso**, y las tablas de ejemplos de Oportunidades y Complicaciones de combate y de
    conversación.
  - Todo lo demás son ejemplos narrativos con sabor de cada mundo (alta tormenta, abismoide, Shadesmar, brumas, koloss…).
- **Recomendación global:** compartir los dos ficheros de datos con **parches por set** (sección 6). No hace falta duplicar
  ficheros. El componente de página no cambia: solo cambia el origen de los datos y una cadena de subtítulo.
- **Las páginas de Conversaciones y Empeños no existen en la app y vale la pena crearlas** (sección 7). Son ~90 % idénticas
  entre sets, así que se escriben una vez con un parche pequeño por set.
- **Condición previa para compartir bien:** hay defectos ya presentes en los ficheros compartidos (Anexo C, sección 10), el más
  importante el dado de trama de `utils/dice.ts` (12 caras en vez de d6). Conviene corregirlos en la base, no en un set.
- **El libro prevé campañas mixtas** (MB L.374-375 / PDF 380-381). Por tanto el mecanismo de parches debería ser **aditivo**
  (unión de estados y acciones) y no una elección exclusiva. Detalle en el Anexo B.

## 0.1 Fuentes y convenciones de cita

| Sigla | Libro | Conversión de páginas | Origen del texto |
|---|---|---|---|
| **MB** | Nacidos de la Bruma (manual de juego) | PDF = libro + 6 | `mistborn_flow.txt` del scratchpad |
| **SL** | Archivo de las Tormentas (manual de juego) | PDF = libro + 4 | Extractos `ch3_chars.txt`, `ch10_combat.txt` y, para cap. 9, 11, 12 y 13, extracción propia con `pdftotext` de `ART0001_MdAdlT_ESP_high.pdf` (volcada a `sl_manual_280_345.txt`, solo lectura del PDF) |

- Formato: «MB L.311 / PDF 317» = página impresa 311, página PDF 317. «aventuras.ts:213» = línea 213 del fichero actual.
- Los números de línea del repo son los del árbol de trabajo actual (hay cambios sin commitear en `CharacterDetailPage.tsx` y
  `types/index.ts` que no afectan a esta comparación).
- Marca **[inferido]** = conclusión mía no escrita en el libro. Todo lo demás está **verificado** contra el texto de ambos
  libros.
- Equivalencias de nombres: «Investidura» y «luz tormentosa» son recursos de SL; MB usa Investidura con metales (alomancia).

---

## 1. Estados: 15 de MB frente a los 14 de `aventuras.ts`

`ESTADOS` está en `aventuras.ts:176-254`. Se muestra en `AventurasPage.tsx` (pestaña Estados, `EstadoCard`).

### 1.1 Tabla comparativa

| # | Estado | Efecto resumido (MB) | MB (L / PDF) | SL (L / PDF) | App (`aventuras.ts`) | Veredicto |
|---|---|---|---|---|---|---|
| 1 | Afligido | Daño continuo [tipo]; fin de cada turno; fuera de combate cada 10 s; acumulable por efectos distintos | 310 / 316 | 293 / 297 | 177-182 | **Igual** |
| 2 | Agotado | Penalización [-N] a cada prueba tras calcularla; -1 por descanso largo; acumulable; resultado mínimo 0 | 310 / 316 | 293 / 297 | 183-188 | **Igual** |
| 3 | Aturdido | En combate pierdes reacciones y 2 acciones menos; fuera, abrumado a criterio de la DJ | 310 / 316 | 294 / 298 | 189-193 | **Casi igual**: SL añade «y no obtienes ninguna reacción» al inicio del turno; MB lo omite [ver 1.2] |
| 4 | Concentrado | Habilidades con coste de concentración cuestan 1 menos | 310 / 316 | 294 / 298 | 194-198 | **Igual** |
| 5 | Desorientado | Sin reacciones; sentidos ofuscados; Percepción con desventaja | 310 / 316 | 294 / 298 | 199-203 | **Igual** |
| 6 | **Desprovisto [poder]** | Sin acceso a la Investidura del poder: no puedes usarlo, gastar Investidura en él ni aprovechar su versión naciente; por poder; acumulable; se quita con la acción **Beber vial** | 310 / 316 | no existe | no existe | **NUEVO en MB** |
| 7 | Empoderado | (SL) Caballero Radiante al jurar un Ideal: ventaja en todo e Investidura recargada al máximo cada turno; fin de escena | no existe | 294 / 298 | 204-209 | **SOLO SL** |
| 8 | Inconsciente | Movimiento 0; quedas Tumbado y sueltas lo que sujetas; sin acciones ni reacciones; turno lento sin actuar; PJ despierta al final de un turno o al curarse 1+; PNJ al curarse 1+ | 311 / 317 | 294 / 298 | 210-215 | **Cambia**: SL exceptúa «Absorber luz tormentosa» y «Revitalizar» (Radiantes); MB no tiene excepciones |
| 9 | Inmovilizado | Movimiento 0; no puedes moverte ni ser movido | 311 / 317 | 294 / 298 | 216-220 | **Igual** |
| 10 | Mejorado | Atributo +N temporal; no cambia defensas ni máximos; acumulable. Ejemplo VEL 3 +2: +2 a Agilidad, Armamento ligero, Hurto, Sigilo; movimiento 9 a 12 m | 311 / 317 | 294-295 / 298-299 | 221-226 | **Igual** (MB lo usa además para sentidos sobrenaturales: Mejorado [Discernimiento]) |
| 11 | **Mermado [atributo]** | Atributo -N temporal; no cambia defensas ni máximos; acumulable. Ejemplo VEL 3 -2: -2 a las mismas habilidades; movimiento 9 a 7,5 m | 311 / 317 | no existe | no existe | **NUEVO en MB** |
| 12 | Ralentizado | Movimiento a la mitad; si te ralentizan a mitad de movimiento, el resto se reduce a la mitad redondeando hacia arriba | 311 / 317 | 295 / 299 | 227-231 | **Igual** |
| 13 | Resuelto | Al fallar una prueba puedes añadir una Oportunidad; después se elimina | 311 / 317 | 295 / 299 | 232-236 | **Igual** |
| 14 | Retenido | Movimiento 0; desventaja en todas las pruebas salvo las de zafarse; la DJ decide cómo eliminarlo si el efecto no da CD | 311 / 317 | 295 / 299 | 237-241 | **Igual** |
| 15 | Sorprendido | Pierdes todas las reacciones (incluida la inicial), sin turno rápido, 1 acción menos; se elimina tras tu próximo turno | 311 / 317 | 295 / 299 | 242-247 | **Igual** |
| 16 | Tumbado | Ralentizado; ataques cuerpo a cuerpo contra ti con ventaja; Prevenirse sin cobertura; levantarse = acción gratuita y -1,5 m de movimiento hasta tu siguiente turno; si caes trepando o volando, daño por caída | 311 / 317 | 295 / 299 | 248-253 | **Igual** |

Recuento: 11 estados con texto idéntico (1, 2, 4, 5, 9, 10, 12, 13, 14, 15, 16), 2 con diferencia de texto (Aturdido, Inconsciente),
1 solo de SL (Empoderado), 2 solo de MB (Desprovisto, Mermado). MB = 14 - 1 + 2 = **15 estados**; la tabla numera 16 filas
porque incluye Empoderado.

### 1.2 Diferencias exactas y texto de parche

**Inconsciente (`aventuras.ts:213`).** Texto actual: «…ni usar acciones o reacciones (excepto Absorber luz tormentosa y
Revitalizar si eres Radiante)…». En MB la frase termina en «No puedes interactuar con el entorno ni usar acciones o
reacciones» (MB L.311 / PDF 317). Parche MB: eliminar el paréntesis. En una campaña mixta [inferido] se conserva la
excepción solo para personajes Radiantes.

**Aturdido (`aventuras.ts:192`).** SL (L.294): pierdes las reacciones, obtienes dos acciones menos «y no obtienes ninguna
reacción» (la del inicio del turno). MB (L.310 / PDF 316): pierdes todas las reacciones y dispones de dos acciones menos; no
dice nada de la reacción nueva del turno. [inferido] es una omisión de edición y no un cambio de regla. Recomendación:
**mantener el texto SL en base** (es la lectura estricta) y anotar la duda (ver sección 11).

**Desprovisto (texto propuesto para el parche MB, `Estado`):**
- `summary`: «No tienes acceso a la Investidura de un poder concreto.»
- `details`: «Mientras estés Desprovisto de un poder no puedes usarlo: no puedes gastar Investidura en efectos de ese poder, no
  cuentas como Investido para ellos y no te beneficias de sus efectos nacientes. El poder del que estás Desprovisto aparece
  entre corchetes tras el nombre (por ejemplo, Desprovisto [Oro]: no puedes usar ese poder, sus talentos ni su versión
  naciente).»
- `special`: «Puedes estar Desprovisto de varios poderes a la vez. Se elimina con la acción Beber vial (cap. 5).»
- Relación con otras reglas: la acción **Beber vial (1 acción)** quita Desprovisto de los poderes cuyos metales hay en el
  vial y deja Desprovisto de los poderes cuyo metal no estaba (MB L.129 / PDF 135). En una mezcla con SL, el estado se aplica
  **por fuente** (sin luz tormentosa no hay potencias; sin metal no hay poder alomántico) (MB L.375 / PDF 381).

**Mermado (texto propuesto para el parche MB):**
- `summary`: «Uno de tus atributos disminuye temporalmente.»
- `details`: «El atributo entre corchetes se reduce en la cifra indicada. Penaliza las habilidades asociadas, los talentos que
  usan directamente ese atributo y el movimiento si es Velocidad, pero no cambia tus defensas, salud máxima, concentración
  máxima ni Investidura máxima.»
- `special`: «Acumulativo: puede afectar a varios atributos a la vez. Ejemplo: Velocidad 3 y Mermado [Velocidad −2] = −2 a
  Agilidad, Armamento ligero, Hurto y Sigilo, y movimiento de 9 a 7,5 m.»
- Es el espejo de Mejorado y se usa sobre todo con feruquimia (almacenar atributos en mentes de metal).

**Empoderado (`aventuras.ts:204-209`).** Solo SL. En MB no existe. Parche MB: `remove: ['Empoderado']`. En campaña mixta se
conserva solo si algún personaje es Caballero Radiante [inferido].

**Estados que dependen del contexto de otros capítulos:** los textos de Mejorado, Mermado, Tumbado e Inconsciente remiten a
«Atributos» (cap. 3) y «Caídas» (cap. 10). Esas referencias son iguales en ambos libros.

**Presentación.** El orden del libro es alfabético en ambos. Con Desprovisto y Mermado intercalados, `ESTADOS` debe
reordenarse alfabéticamente tras aplicar el parche (Desprovisto va entre Desorientado e Inconsciente; Mermado entre Mejorado
y Ralentizado). `AventurasPage.tsx` no ordena: pinta `ESTADOS` tal cual (`ESTADOS.map`, ~línea 260).

---

## 2. Acciones, reacciones y acciones gratuitas de combate

`COMBAT_ACTIONS` está en `combatRules.ts:16-40`; se muestra en `CombatPage.tsx` (pestañas Acciones y Reacciones).

### 2.1 Tabla comparativa (17 entradas en ambos libros)

Costes: ▶ = acción (1/2/3), ▷ = acción gratuita, r = reacción. La tabla impresa de «Acciones y reacciones» tiene **las mismas 17
entradas y los mismos costes** en SL (L.302 / PDF 306) y MB (L.318 / PDF 324).

| Acción | Coste SL | Coste MB | App (`combatRules.ts`) | MB (L / PDF) | SL (L / PDF) | Veredicto |
|---|---|---|---|---|---|---|
| Acometida | 1 | 1 | 18 | 319 / 325 | 303 / 307 | Igual (mano distinta por ataque; mano secundaria 2 concentración) |
| Moverse | 1 | 1 | 19 | 319 / 325 | 303 / 307 | Igual |
| Destrabarse | 1 | 1 | 20 | 319 / 325 | 303 / 307 | Igual (1,5 m sin Acometidas reactivas) |
| Obtener ventaja | 1 | 1 | 21 | 319 / 325 | 303 / 307 | Igual |
| Prevenirse | 1 | 1 | 22 | 319 / 325 | 303 / 307 | Igual |
| Usar una habilidad | 1 | 1 | 23 | 319 / 325 | 303 / 307 | Igual |
| Interactuar | 1 | 1 | 24 | 319 / 325 | 303 / 307 | Igual en regla; **cambian ejemplos** (ver 2.2) |
| Recuperarse | 2 | 2 | 25 | 320 / 326 | 304 / 308 | Igual (una vez por escena) |
| **Agarrar** | 2 | 2 | 26 | 320 / 326 | 304 / 308 | **Mismo coste, distinto estado resultante** (ver 2.2) |
| Empujar | 2 | 2 | 27 | 320 / 326 | 304 / 308 | Igual (1,5 m en horizontal; si empujas a quien te agarra, termina Agarrar) |
| Prepararse | 1 + coste de la acción preparada | igual | 28 | 320 / 326 | 304 / 308 | Igual (tipo `special`) |
| Charlar | 0 | 0 | 31 | 320 / 326 | 304 / 308 | Igual |
| Soltar | 0 | 0 | 32 | 320 / 326 | 304 / 308 | Igual |
| **Acometida reactiva** | r + 1 concentración | r + 1 concentración | 35 | 321 / 327 | 305 / 309 | **Cambia el ataque permitido** (ver 2.2) |
| Ayudar | r + 1 concentración | r + 1 concentración | 36 | 321 / 327 | 305 / 309 | Igual |
| Esquivar | r + 1 concentración | r + 1 concentración | 37 | 321 / 327 | 305 / 309 | Igual (no vale contra zona ni multiobjetivo) |
| Evitar peligro | r | r | 38 | 321 / 327 | 305 / 309 | Igual (Agilidad; CD = resultado de la prueba que lo causa, o CD 15) |

Resultado: **17 de 17 coinciden en nombre y coste**; 3 de ellas (Agarrar, Acometida reactiva, Interactuar) tienen diferencia de
texto. Los costes son **idénticos en las 17**.

### 2.2 Diferencias exactas

| Tema | SL (y estado actual de la app) | MB | Tratamiento |
|---|---|---|---|
| Agarrar: efecto (`combatRules.ts:26`) | Si superas la prueba el objetivo queda **Inmovilizado** (SL L.304 / PDF 308) | Queda **Retenido** (MB L.320 / PDF 326) | **Parche por set.** Es un cambio de regla: Retenido da movimiento 0 y desventaja en todas las pruebas salvo zafarse; Inmovilizado solo movimiento 0 |
| Acometida reactiva: ataque (`:35`) | «ataque con arma cuerpo a cuerpo» | «Acometida con un arma cuerpo a cuerpo **o un ataque sin armas**» | **Parche por set** (regla) |
| Acometida reactiva: exclusión | No funciona contra quien se transporta con Transportación o se mueve instantáneamente | Igual, con ejemplo «Radiante que use Transportación del Manual del Archivo de las Tormentas» | El texto de la app **omite esta exclusión en ambos sets** (ver Anexo C, sección 10) |
| Interactuar: ejemplos (`:24`) | Desenvainar o envainar un arma; «devorar unas tortitas»; ropa sencilla | **Preparar o guardar un arma**; comer algo rápidamente; ropa sencilla | **Neutralizar en base**: «preparar o guardar un arma» vale para ambos (MB amplía a armas de fuego) |
| Acción de capacidad citada | «Absorber luz tormentosa, disponible para los Radiantes» (SL L.303) | «Beber vial, disponible para los alomantes» (MB L.319) | La app no lista acciones otorgadas por talentos; ver 2.3 |
| Frases de enlace | «Radiantes», Shadesmar (en otras secciones) | Referencias a Scadrial | Solo texto narrativo |

### 2.3 Acciones que otorgan los poderes (propias de cada set)

Son las únicas «acciones de combate» propias de un set; hoy la app no las modela en `combatRules.ts`:

| Set | Acción | Coste | Dónde |
|---|---|---|---|
| SL | Absorber luz tormentosa | 2 acciones | SL L.303 / `radiantOrders.ts:64` |
| SL | Revitalizar | gratuita (▷) | SL L.294 (excepción de Inconsciente) |
| MB | Beber vial | 1 acción | MB L.129 / PDF 135; elimina o impone Desprovisto |
| MB | Quemar [metal] y otras de cada talento alomántico | 1 acción (varía) | MB cap. 5 y 6 [resumen] |

Si se quiere mostrar «acciones de poderes» en `CombatPage` hay que dar a `COMBAT_ACTIONS` un cuarto grupo por set
(propuesta en Anexo B). No hace falta para la paridad con el estado actual.

### 2.4 Secciones de reglas (`COMBAT_SECTIONS`, `combatRules.ts:42-110`)

| Sección | Líneas | SL frente a MB | Veredicto |
|---|---|---|---|
| Orden del combate (`order`) | 44-53 | Turno rápido 2 acciones / lento 3; fases PJ rápidos, PNJ rápidos, PJ lentos, PNJ lentos; 1 reacción al inicio del combate y 1 nueva por turno; ronda ≈ 10 s (MB L.317-318 / PDF 323-324; SL L.301-302 / PDF 305-306) | **Igual** |
| Cómo atacar (`attacks`) | 56-65 | Pasos: objetivo, prueba + dados de daño, resolver. Fallo / rasguño (1 concentración, daño = dados) / impacto (dados + modificador) / crítico (gastar O: dados al máximo) (MB L.321-322; SL L.305-306) | **Igual** |
| Sorpresa (`surprise`) | 68-76 | **Cambia la duración** (ver 2.5) | **Parche** |
| Cobertura y movimiento (`cover`) | 78-88 | Prevenirse a 1,5 m; terreno difícil = Ralentizado; punto de apoyo inestable = desventaja a distancia; cercanía 1,5 m | **Igual** |
| Maniobras creativas (`maneuvers`) | 90-99 | Armas pesadas / ligeras; ejemplo desarmar con defensa cognitiva y 1 o 2 desventajas (MB L.323; SL L.307) | **Igual** |
| Ataques de zona (`area`) | 101-110 | Una prueba y un tiro de daño comparados con cada defensa; rasguño múltiple 1 concentración por objetivo; no cruzan muros; no hacen falta sentidos. El sumario de la app dice «especialmente potencias Radiantes» (`:103`); MB dice «poderes y capacidades» | **Igual en regla; neutralizar una frase** |

### 2.5 Sorpresa: la única diferencia de regla en las secciones

- SL (L.302 / PDF 306): «Después de que **todos** los personajes hayan jugado su primer turno, elimina el estado Sorprendido».
  La app copia eso (`combatRules.ts:70` y `:74`).
- MB (L.318 / PDF 324): «Tras el primer turno **de cada personaje**, el estado Sorprendido se elimina».
- Ambos libros dicen en la ficha del estado: «se elimina después de tu próximo turno» (SL L.295, MB L.311), que coincide con la
  lectura de MB. En SL hay por tanto una tensión interna entre capítulo 9 y 10. **Recomendación:** base con la redacción de MB
  (por personaje); mantener la de SL como parche solo si se quiere reproducir el libro al pie de la letra [inferido].
- Además, `combatRules.ts:73` («Los personajes Sorprendidos no pueden actuar en el primer turno») es **incorrecto en ambos**
  (ver Anexo C, sección 10).

### 2.6 Contenido de combate que existe en ambos libros y la app aún no tiene (y que difiere)

| Bloque | SL (L / PDF) | MB (L / PDF) | Difiere |
|---|---|---|---|
| Tamaño de personajes | 309-310 / 313-314 | 325-326 / 331-332 | **Sí**: 5 frente a 6 categorías (sección 3) |
| Terreno peligroso (tabla) | 311 / 315 | 327 / 333 | **Sí** (sección 3) |
| Caídas | 311 / 315 | 327 / 333 | No: desde 3 m, 1d6 por golpe por cada 3 m, quedas Tumbado |
| Cuadrícula (casillas de 1,5 m, diagonal 1,5 m) | 311-312 / 315-316 | 327-329 / 333-335 | No |
| Combate sobre monturas | 313 / 317 | 329 / 335 | No (montar/desmontar = 2 acciones) |
| Oportunidades y Complicaciones en combate (tabla de 12 filas) | 313 / 317 | 329 / 335 | **Sí** (5 de 12 filas): sección 3.3 |
| Objetivos y alcance, línea de efecto, alcance corto/largo, efectos de zona | 308-309 / 312-313 | 323-325 / 329-331 | No (ejemplos de potencias frente a metales) |

---

## 3. Tablas numéricas: iguales o distintas

### 3.1 Resumen

| Tabla / valor | ¿Igual? | Dónde vive hoy en la app | Cita MB | Cita SL |
|---|---|---|---|---|
| Dado de recuperación por Voluntad | **Igual** | `CharacterDetailPage.tsx:814` | L.52 / PDF 58 | L.50 / PDF 54 |
| Alcance de sentidos por Discernimiento | **Igual** | `CharacterDetailPage.tsx:815` | L.52 / PDF 58 | L.50 / PDF 54 |
| Movimiento por Velocidad | **Igual** | `TalentosReglas.cs:264-272` (API) | L.51 / PDF 57 | L.49 / PDF 53 |
| Establecer conexiones por Presencia | **Igual** | no existe | L.53 / PDF 59 | L.51 / PDF 55 |
| Ejemplos de CD (10/15/20/25/30) | **Igual** | no existe | L.60 / PDF 66 | L.56 / PDF 60 |
| Capacidad de levantamiento y de carga por Fuerza | **DISTINTA** | `BolsaDetailPage.tsx:233-240` (valores SL) | L.50 / PDF 56 | L.48 / PDF 52 |
| Duración de lesiones (d20) y efectos (d8) | **Igual** | `aventuras.ts:286-301` | L.313-314 / PDF 319-320 | L.296 / PDF 300 |
| Descansos corto (≥1 h) y largo (≥8 h) | **Igual** (MB añade beneficios) | `aventuras.ts:77-99` | L.306-307 / PDF 312-313 | L.299 / PDF 303 |
| Comida y agua | **Igual** | `aventuras.ts:325-334` | L.312 / PDF 318 | L.295 / PDF 299 |
| Costes y duración del reposo | **Igual en cifras** (cambia la moneda) | `aventuras.ts:101-138` | L.308-309 / PDF 314-315 | L.292-293 / PDF 296-297 |
| Salud 10 + FUE; concentración 2 + VOL; defensas 10 + dos atributos | **Igual** | API `CharacterService.cs` | L.53, 56 / PDF 59, 62 | L.53-54 / PDF 57-58 |
| Investidura máx. 2 + máx(DIS, PRE) | **Igual la fórmula; cambia a quién se concede** | API `CharacterService.cs:212-223` | L.57 / PDF 63 | L.54 / PDF 58 |
| Caídas | **Igual** | no existe | L.327 / PDF 333 | L.311 / PDF 315 |
| Tamaño de personajes | **DISTINTA** | no existe | L.326 / PDF 332 | L.310 / PDF 314 |
| Terreno peligroso | **DISTINTA** | no existe | L.327 / PDF 333 | L.311 / PDF 315 |
| Umbral colectivo de empeños y Ganando terreno | **Igual** | no existe | L.341, 349 / PDF 347, 355 | L.325, 331 [aprox.] |

### 3.2 Valores exactos de las tablas

**Dado de recuperación (Voluntad):** 0 = 1d4; 1-2 = 1d6; 3-4 = 1d8; 5-6 = 1d10; 7-8 = 1d12; 9 o más = 1d20. Idéntica en ambos.
La app la calcula con `volEff` en `CharacterDetailPage.tsx:814`.

**Alcance de sentidos (Discernimiento):** 0 = 1,5 m; 1-2 = 3 m; 3-4 = 6 m; 5-6 = 15 m; 7-8 = 30 m; 9 o más = no se ve afectado por
sentidos ofuscados (la app muestra «Sin límite», `:815`). Idéntica en ambos.

**Movimiento (Velocidad), metros por acción:** 0 = 6; 1-2 = 7,5; 3-4 = 9; 5-6 = 12; 7-8 = 18; 9 o más = 24. Idéntica. Fuera de combate
se cuentan ~3 acciones cada 10 s (carrera en 10 s = movimiento × 3), igual en ambos.

**Capacidad de levantamiento / carga (kg) por Fuerza. DISTINTA:**

| Fuerza | SL levantamiento | SL carga | MB levantamiento | MB carga |
|---|---|---|---|---|
| 0 | 45 | 22,5 | 50 | 25 |
| 1-2 | 90 | 45 | 100 | 50 |
| 3-4 | 225 | 112,5 | 250 | 125 |
| 5-6 | 450 | 225 | 500 | 250 |
| 7-8 | 2250 | 1125 | 2500 | 1250 |
| 9 o más | 4500 | 2250 | 5000 | 2500 |

- Los valores de SL son exactamente el 90 % de los de MB [inferido: ambos parten de la misma tabla en libras, SL convertida
  a kg y MB redondeada]. Las **reglas** de carga son idénticas (Ralentizado si te mueves por encima de la capacidad; Agotado [-1]
  por cada 60 minutos acumulados por encima, que se reinicia tras un descanso largo; tope temporal = capacidad de levantamiento).
- La app implementa solo la **capacidad de carga**, con valores SL (`BolsaDetailPage.tsx:233-240`). Debe pasar a leer una tabla
  por set. El campo `weight` del catálogo es por tanto dependiente del set (los pesos de los objetos SL y MB deben usar la misma
  unidad que su tabla) [inferido].

**Establecer conexiones (Presencia):** 0 = 1 año; 1-2 = 50 días; 3-4 = 5 días; 5-6 = 1 día; 7-8 = 1 hora; 9 o más = «tu reputación te
precede». Idéntica.

**Ejemplos de CD:** Fácil 10, Media 15, Alta 20, Muy alta 25, Casi imposible 30. Idéntica.

**Lesiones:** tirada d20 + desvío de la armadura + modificadores de capacidades − 5 por cada lesión previa (no es prueba de
habilidad; puede ser negativa). Duración: ≤ −6 muerte; −5 a 0 permanente; 1-5 grave (6d6 días); 6-15 leve (1d6 días); ≥ 16 herida
superficial (hasta el siguiente descanso largo). Efectos d8: 1-2 Agotado [-1]; 3 Agotado [-2]; 4-5 Ralentizado; 6 Desorientado;
7 Sorprendido; 8 solo una mano. Idénticas, incluidas las sugerencias narrativas (`aventuras.ts:286-301`).

**Descansos:** corto = 1 hora o más ininterrumpida; recupera tirando el dado de recuperación y repartiendo el resultado entre salud
y concentración (ejemplo del libro: un 5 = 3 de salud y 2 de concentración); largo = 8 horas o más; recupera toda la salud y
concentración y Agotado baja 1. Idénticos. Beneficios alternativos del corto (atender a otros con Medicina, buscar recursos con
Supervivencia, otros) idénticos.

**Costes de reposo:** Investigación 10+ días, 3 por día; Entrenamiento 20+ días, 5 por día; Autorreflexión 10+ días, 5 por día.
Idénticos en cifra. **La unidad cambia: marcos (mc) en SL, arquillas en MB.**

**Tamaño de personajes (zona controlada). DISTINTA:**

| SL (5 categorías) | MB (6 categorías) |
|---|---|
| Pequeño 0,75 m; Mediano 1,5 m; Grande 3 m; Enorme 4,5 m; Gargantuesco 6 m o más (a criterio de la DJ) | Pequeño 0,75 m; Mediano 1,5 m; Grande 3 m; Enorme 4,5 m; Gargantuesco 6 m; **Colosal 9 m o más** |

**Terreno peligroso (daño al entrar o empezar el turno). DISTINTA:**

| SL | MB |
|---|---|
| Pinchos de madera 1d4 laceración; Fuego abrasador 1d8 energía; Vientos de alta tormenta 1d12 golpe | Charco de ácido 1d10 vital; Frío extremo 1d4 vital; Fuego abrasador 1d8 energía; Humo venenoso 1d6 vital; Pinchos de madera 1d4 laceración |

Comparten «Fuego abrasador 1d8 energía» y «Pinchos de madera 1d4 laceración».

**Comida y agua:** pasas sin comer tantos días como tu Voluntad; luego, Agotado [-1] por día; en Agotado [-10] mueres. Agua: Agotado
[-1] por día sin beber lo suficiente. Idéntico; el consumo se resetea al comer, pero Agotado persiste.

### 3.3 Tablas de ejemplos de Oportunidades y Complicaciones (combate y conversación)

**Combate (12 filas en cada libro; 7 coinciden, 5 cambian).** MB L.329 / PDF 335; SL L.313 / PDF 317.

| Coinciden en ambos | Solo SL | Solo MB |
|---|---|---|
| Llegan refuerzos (aliados / enemigos) | La lluvia arrecia (Complicación) | Llegan las brumas y ofuscan el campo (Complicación) |
| Enemigo herido huye o se rinde / aliado tropieza y queda Tumbado | Esferas infusas del enemigo para absorber luz tormentosa (O) / tus esferas se apagan (C) | Viales o mente de metal que quitar al oponente (O) / te quedas sin metales o pierdes una carga (C) |
| Transeúnte se pone a salvo / aliado o inocente en peligro | Tu spren ayuda (O) / tu spren se distrae (C) | Tu poder alomántico más potente (O) / menos potente (C) |
| Enemigo se distrae (ventaja en ataques) / enemigo te advierte | Respiro: +1 concentración (O) / perturbado: −1 concentración (C) | Poder feruquímico eficiente, +1 ronda (O) / decantas de más, −1 ronda (C) |
| Enemigo deja caer arma / tú dejas caer arma | Tiempo adicional para tu objetivo (O) / pierdes tiempo, objetivo más urgente (C) | Elemento del entorno cambia (O: expone al rival / C: te obliga a moverte) |
| Detectas oculto y avisas / distraído, el oponente se aleja sin Acometida reactiva | | |
| Oponente revela un detalle / rematas sin querer a quien querías interrogar | | |

**Conversación (tabla general L.332 / PDF 338 en MB; L.317 / PDF 321 en SL).** SL tiene 4 filas; MB 3. La fila «tu spren Radiante
hace una observación útil / se distrae» **no existe en MB**. Las demás filas son equivalentes (dato útil / mentira; observador
impresionado / observador te desprecia; distraes de tus intenciones / atención indeseada).

**Tipos de conversación (4 tipos × 3 filas cada uno en ambos libros):** Indagación, Negociación, Argucia y Social. Los títulos
de tipo coinciden (SL llama «Socialización» al cuarto, MB «Social»). Las filas de Oportunidad y Complicación son **parecidas pero
no idénticas** (redacción y alguna fila distinta, p. ej. Negociación MB incluye «patrocinador poderoso / sospecha de espía», SL
«costumbre o ley útil / obstáculo insalvable»). Tratar como contenido por set.

---

## 4. Texto con sabor Stormlight que habría que neutralizar o condicionar

### 4.1 `aventuras.ts`

| Línea | Texto actual | Tratamiento | MB (equivalente) |
|---|---|---|---|
| 106 | Manufactura: «objetos o fabriales» | Neutralizar o parche | MB: objetos (armas de fuego y explosivos de la Era 2); sin fabriales (L.309 / PDF 315) |
| 123 | Investigación: coste «3 mc/día» | Moneda por set | «3 arquillas/día» |
| 124 | Investigación: «Visita devotarios, lee en bibliotecas o experimenta en laboratorios» | Parche | MB: bibliotecas, laboratorios con nuevas tecnologías, o localizar a un guardador terrisano |
| 129 | Entrenamiento: «5 mc/día» | Moneda por set | «5 arquillas/día» |
| 130 | Entrenamiento: «(como Martillo de guerra o Semiesquirla)» | Parche | MB ejemplo: «Hoja koloss» (L.308 / PDF 314) |
| 135 | Autorreflexión: «5 mc/día» | Moneda por set | «5 arquillas/día» |
| 148 | Sucesos: ejemplos «alta tormenta», «cierre de una perpendicular» | Parche (solo ejemplos) | Puesta de sol y llegada de las brumas, furia de una horda de koloss, guardias del lord Legislador, llegada del tren (L.306 / PDF 312) |
| 159 | Sucesos: «un abismoide irrumpiendo en la escena» | Parche | Un brumoso enemigo llegando justo cuando los PJ iban a vencer (L.306) |
| 169 | Ejemplo «refuerzos / alta tormenta» | Parche | Refuerzos vitales frente a la puesta de sol y las brumas que permitirían escapar a los enemigos (L.306) |
| 204-209 | Empoderado (Caballeros Radiantes, Investidura recargada) | **Solo SL** | No existe en MB |
| 206 | «(solo Caballeros Radiantes)» | Solo SL | — |
| 213 | «Absorber luz tormentosa y Revitalizar si eres Radiante» | Parche | Eliminar |
| 267 | Golpe: «(martillos, rocas)» | Opcional (neutral) | MB: bastón de duelo o trozo de metal |
| 277 | Espiritual: «Causado principalmente por hojas esquirladas y algunas potencias» | **Parche obligatorio** | MB: «efectos que dañan el ser físico y espiritual»; sin hojas esquirladas |
| 328 | Comida y agua: «…tras las líneas enemigas o en Shadesmar» | Parche | MB: «…tras las líneas enemigas o a bordo de una aeronave con pocas provisiones» (L.312 / PDF 318) |

No necesitan cambio: líneas 36-38 y 70 (remisiones a los capítulos 10, 11, 12 y 13; **la numeración de capítulos es la misma en
ambos libros**), línea 50 (salud, concentración e Investidura se conservan entre escenas) y 224 (Investidura máxima en Mejorado:
MB también tiene Investidura).

Falta en la app y existe en ambos libros: la sección «Duraciones» de efectos y estados (MB L.312 / PDF 318; SL L.295 / PDF 299)
y la sección «Muerte» (MB L.315 / PDF 321 «La muerte y los efectos Investidos»; SL L.298 / PDF 302 «Muerte e infusiones»). Ver
sección 7.

### 4.2 `combatRules.ts`

| Línea | Texto actual | Tratamiento |
|---|---|---|
| 26 | Agarrar → «Inmovilizado» | **Parche de regla** (MB: Retenido) |
| 35 | Acometida reactiva: «ataque con arma cuerpo a cuerpo» | **Parche de regla** (MB: o sin armas) |
| 24 | Interactuar: «desenvainar o envainar un arma» | Neutralizar a «preparar o guardar un arma» |
| 70, 74 | Sorpresa: «cuando todos han jugado su primer turno» | Parche (MB: tras el primer turno de cada personaje) |
| 103 | Ataques de zona: «(especialmente potencias Radiantes)» | Neutralizar: «poderes y capacidades» |

El resto del fichero (acciones, reacciones y las secciones order, attacks, cover, maneuvers) no contiene sabor de ningún mundo.

### 4.3 Páginas y textos de navegación

| Fichero:línea | Texto | Tratamiento |
|---|---|---|
| `CombatPage.tsx:68` | Subtítulo «…reglas de combate del Archivo de las Tormentas» | **Parametrizar por set** (única cadena de la página con nombre de set) |
| `CombatPage.tsx:121` | Callout de reacciones (neutral) | Sin cambio (contenido erróneo, ver Anexo C, sección 10) |
| `AventurasPage.tsx:208` | Subtítulo «Reglas de escenas, descanso, sucesos, estados y daño» | Neutral, sin cambio |
| `AventurasPage.tsx:~257` | Callout de Estados «Salvo indicación contraria…» (neutral; no está tal cual en los libros) | Sin cambio [inferido: es una glosa de la app] |
| `EncyclopediaPage.tsx` tiles (`combat`, `aventuras`) | Descripciones neutrales | Sin cambio; el tile `catalog` dice «mundo de Roshar» (fuera de este alcance) |
| `AventurasPage.tsx` `ACCENT = 'var(--esmeralda)'`, `CombatPage.tsx` `ACCENT = 'var(--rubi)'` | Color de acento de la página | Sin cambio: neutral |

---

## 5. Dado de trama, Oportunidades y Complicaciones: confirmación de identidad

**Conclusión: IDÉNTICOS en reglas.** Citas: MB introducción L.9-12 / PDF 15-18 y cap. 13 L.355-357 / PDF 361-363; SL introducción
L.7-10 / PDF 11-14 y cap. 13 L.339-341 / PDF 343-345.

| Elemento | SL | MB | Igual |
|---|---|---|---|
| Dado de trama | d6 personalizado: 2 caras en blanco, 2 Oportunidad (O), 2 Complicación (C con +2 o +4); sustituto con d6 normal: 1 y 2 son «peores» y dan C+4 y C+2 (la bonificación = el doble del d6) | Igual, mismo texto | Sí |
| Cuándo se tira | Solo al «subir la apuesta»; no en cada prueba; PNJ normalmente no | Igual | Sí |
| Subir la apuesta | La DJ la sube (misión, propósito/obstáculo/metas, alta tensión); solo una vez por prueba y nunca tras tirar el d20; el jugador puede pedirlo | Igual | Sí |
| Gastar una Oportunidad | Ayudar a un aliado (ventaja a su siguiente prueba); recobrar la compostura (+1 concentración); impacto crítico (solo ataques); influir en la narrativa | Igual (cuatro opciones) | Sí |
| Gastar una Complicación | La DJ elige: perjudicar a un aliado (desventaja en la siguiente prueba de un PJ); distracción (−1 concentración); influir en la narrativa | Igual | Sí |
| Bonificación de Complicación | La C del dado da al d20 el número mostrado (+2 o +4); por otras vías, lo que diga la capacidad | Igual | Sí |
| Rango de Oportunidad y Complicación | Por defecto 20 natural = O; 1 natural = C (esta sin bonificación); se acumulan con el dado de trama; con varios d20 solo cuenta el d20 elegido; ampliaciones solo de efectos con nombre distinto | Igual (MB lo repite en cap. 3 L.63 / PDF 69) | Sí |
| Uso por la DJ (cap. 13) | ~1 de cada 3 pruebas; fuera de combate más que en combate; uso colaborativo; «Otro eje», «Habilidades alternativas», «Pura chiripa» | Igual en estructura y orden | Sí |
| Ejemplos narrativos | Misión en una prisión de Fusionados; Escultor de Voluntad; ejemplo de «Sangre Espectral» (idéntico en ambos) | Infiltración en un Cantón del Ministerio de Acero; obligador; mismo ejemplo de «Sangre Espectral» | **Solo cambia el ejemplo** del cap. 13 |

**Implicación para la app.** El dado de trama no necesita parche por set; sí necesita **corrección en la base** (Anexo C, sección 10):
`utils/dice.ts:81-89` implementa un dado de 12 caras (blanco ×4, O ×3, C1 ×2, C2, C3, C4) y `:137-147` fuerza O con un 20 natural y
C2 con un 1 natural sin tirar el dado. El libro define un d6 y trata el 20 y el 1 naturales como Oportunidad o Complicación
**adicionales**. Esto debe arreglarse una vez para ambos sets antes de «compartir».

---

## 6. Recomendación por fichero y por página

Criterio: **«compartir tal cual»** si hay 0 diferencias; **«compartir con parches por set»** si las diferencias son un puñado de
ítems localizados; **«duplicar por set»** si las diferencias superan la mitad del contenido o cambian la estructura. Ningún fichero
llega al umbral de duplicar.

| Fichero | Recomendación | Justificación (conteo verificado) |
|---|---|---|
| `src/data/aventuras.ts` | **Compartir con parches por set** | 48 elementos de primer nivel (4 secciones de escenas, 2 descansos, 6 actividades, 3 sucesos, 14 estados, 5 tipos de daño, 5 filas de duración, 6 filas de efectos, 3 secciones de daño). **14 de 48 necesitan parche** (29 %) más **3 altas** (Desprovisto, Mermado, Mentoría). **Solo 7 cambian regla** (2 estados nuevos, Empoderado fuera, Inconsciente, 2 beneficios de descanso, Mentoría); el resto es moneda o ejemplos. Tablas de lesiones y duraciones: idénticas |
| `src/data/combatRules.ts` | **Compartir con parches por set** | 23 elementos (17 acciones + 6 secciones). **5 necesitan parche** (22 %): Agarrar, Acometida reactiva, Sorpresa (reglas); Interactuar y Zona (neutralizables en base). Costes: 17 de 17 idénticos |
| `src/pages/encyclopedia/AventurasPage.tsx` | **Compartir tal cual** | El componente es data-driven (`ESTADOS.map`, `SectionList`, `ActividadCard`, tablas). Nuevos estados y nueva actividad se pintan sin tocar JSX. Solo cambia de dónde vienen los arrays (resolver por set). Sin cadenas con nombre de set |
| `src/pages/encyclopedia/CombatPage.tsx` | **Compartir tal cual**, con una cadena parametrizada | La estructura (tres pestañas, `ActionCard`, `RuleDetails`) es idéntica. Única cadena dependiente del set: el subtítulo `:68`. Las acciones de poder (Beber vial, Absorber luz tormentosa) no están en esta página hoy |
| Pestañas y rutas (`App.tsx:54-55`) | Compartir tal cual | Mismas rutas `encyclopedia/combat` y `encyclopedia/aventuras` |

### 6.1 Cómo aplicar los parches (resumen; contrato en Anexo B)

1. **Base neutral + overlay por set**: la base contiene todo el texto común y neutralizado; cada set aporta `add`, `remove` y
   `replace` por clave (`name` para `Estado`, `CombatAction`, `ActividadReposo`, `TipoDano`; `id` + `label` para
   `AventuraSection.details`).
2. **Alternativa más barata (si se quiere cero riesgo de regresión)**: dejar los ficheros actuales como «base = SL» y crear solo el
   overlay de MB con las 17 + 5 operaciones. El inconveniente es que el texto con sabor SL queda en la base y una campaña mixta
   tendría que quitarlo a mano. [inferido] La opción neutral cuesta unas 25 ediciones de texto y evita ese problema.
3. En campaña **mixta**, aplicar los overlays en unión (estados: Empoderado + Desprovisto + Mermado; Inconsciente con la
   excepción de Radiante) y resolver los **conflictos de regla** (solo Agarrar y Acometida reactiva) con el set principal de la
   campaña [inferido: el libro no lo dicta].

### 6.2 Lista de operaciones de parche para MB (checklist para quien implemente)

| # | Fichero / elemento | Operación | Detalle |
|---|---|---|---|
| 1 | `ESTADOS` | add | Desprovisto (sección 1.2) |
| 2 | `ESTADOS` | add | Mermado (sección 1.2) |
| 3 | `ESTADOS` | remove | Empoderado |
| 4 | `ESTADOS.Inconsciente.details` | replace | Sin la excepción de luz tormentosa y Revitalizar |
| 5 | `DESCANSOS.corto.details` | add | «Almacenar en mentes de metal»: cargar mentes de metal feruquímicas durante el descanso, equivale a **una escena** a efectos de almacenamiento (MB L.307 / PDF 313) |
| 6 | `DESCANSOS.largo.details` | add | Igual, equivale a **dos escenas**; si lo haces, quedas **Agotado [−1]** (MB L.307 / PDF 313) |
| 7 | `ACTIVIDADES_REPOSO` | add | «Mentoría en las artes metálicas»: con un patrocinador experto en tu poder, cada día de entrenamiento da una ventaja para una prueba futura de ese poder; acumulas hasta tus grados en Alomancia o Feruquimia (el mayor); persisten hasta usarlas o hasta que vuelvas a entrenar con cualquier mentor (MB L.309-310 / PDF 315-316). Duración y coste: no se fijan en el libro |
| 8-11 | `ACTIVIDADES_REPOSO` Manufactura, Investigación, Entrenamiento, Autorreflexión | replace | Texto y moneda de la sección 4.1 |
| 12-14 | `SUCESOS_SECTIONS` líneas 148, 159, 169 | replace | Ejemplos de la sección 4.1 |
| 15 | `TIPOS_DANO.Espiritual.description` | replace | Sin «hojas esquirladas» |
| 16 | `DANO_SECTIONS.comida-agua` (línea 328) | replace | Sin Shadesmar |
| 17 | `TIPOS_DANO.Golpe.description` | replace (opcional) | Ejemplos de MB |
| 18 | `COMBAT_ACTIONS.Agarrar` | replace | «queda Retenido…» en vez de Inmovilizado |
| 19 | `COMBAT_ACTIONS['Acometida reactiva']` | replace | «…Acometida con arma cuerpo a cuerpo o ataque sin armas…» |
| 20 | `COMBAT_SECTIONS.surprise` líneas 70, 74 | replace | «Tras el primer turno de cada personaje se elimina» |
| 21 | `COMBAT_SECTIONS.area` línea 103 | replace | «poderes y capacidades» |
| 22 | `COMBAT_ACTIONS.Interactuar` | neutralizar en base | «preparar o guardar un arma»; añadir «comer algo rápidamente» y «ponerte o quitarte una prenda sencilla» |
| 23 | `CombatPage.tsx:68` | parametrizar | «…de combate de {nombre del set}» |

Los números 5-6 y 7 son **contenido nuevo**; el resto son sustituciones.

---

## 7. Capítulos de MB sin página en la enciclopedia hoy, y si merecen entrar

Hoy la enciclopedia tiene 6 temas (`EncyclopediaPage.tsx` TOPICS): órdenes radiantes, caminos heroicos, combate, potencias, aventuras
y catálogo (`App.tsx:51-56`). En MB y en SL existen estos capítulos de reglas de escena sin página:

| Capítulo | MB (L / PDF) | SL (L / PDF) | ¿Merece entrar? | Estructura y esfuerzo | Diferencia entre sets |
|---|---|---|---|---|---|
| **11 Conversaciones** | 331-337 / 337-343 | 315-321 / 319-325 | **Sí** (prioridad media) | 8 bloques base (cuándo usar, ambientación, orden/rondas flexibles, contribuciones y 5 desenlaces, cuándo hacer pruebas con 7 habilidades, concentración y cómo resistirse (2 o 4 puntos), resolución) + 4 tipos con tabla de 3 filas + tabla general + ejemplo de partida | Texto ~90 % igual. Cambian: filas de las tablas de Oportunidades y Complicaciones (sección 3.3), fila del spren (solo SL), ejemplo de partida, remisión a «Duración de las artes metálicas» (cap. 6 MB) frente a «Infusión y duración de las potencias» (cap. 6 SL) |
| **12 Empeños** | 339-351 / 345-357 | 323-335 / 327-339 | **Sí** (prioridad media) | Base (ambientación, objetivos, rondas flexibles, umbral colectivo/flexible/individual, consejo de seguir adelante tras el fracaso) + 4 tipos (descubrimiento con red de investigación y «Apostar por una corazonada»; exploración con «Contra todo pronóstico»; misión con «El tiempo corre»; persecución con «Ganando terreno») + 5 tablas de ejemplos de habilidad y tabla de umbral | Reglas y cifras idénticas (umbral 4/3, */4, 8/4, 9/4, 11/5; Ganando terreno 2/4, 3/6, 4/8). Cambian ejemplos y una fila de «Contra todo pronóstico» (esferas drenadas, CD 10 en SL; viales rotos, CD 10 en MB) |
| Dado de trama, Oportunidades y Complicaciones, ventajas y desventajas (intro y cap. 3) | L.9-12, 61-63 | L.7-10 | **Sí, prioridad alta**: la app no la tiene y el tirador implementa mal el dado (Anexo C, sección 10) | Una página corta de referencia compartida | **Ninguna** (sección 5) |
| Cap. 3 Características (tablas de Fuerza, Velocidad, Voluntad, Discernimiento, Presencia, CD de ejemplo, ejemplos de habilidades) | 49-72 / 55-78 | ≈43-68 / 47-72 [aprox.] | **Sí, valor medio**: la ficha ya calcula parte; una página «Características» ayudaría en mesa | Compartido salvo la tabla de carga, los ejemplos de habilidades y una sección nueva en MB (sentidos sobrenaturales, ver abajo) | Carga (kg) y ejemplos |
| Cap. 9 secciones ausentes (Duraciones, Muerte, Interpretación ya está, Reposo ya está) | 312, 315 | 295, 298 | **Sí**, como dos bloques dentro de `AventurasPage` | Pocas líneas | «Muerte y los efectos Investidos» frente a «Muerte e infusiones» |
| Cap. 10 secciones ausentes (tamaño, caídas, terreno, cuadrícula, monturas, objetivos y alcance, tabla O/C de combate) | 323-329 | 307-313 | **Sí**, como pestaña «Terreno y movimiento» o secciones en `CombatPage` | Medio | Tamaño (6 frente a 5), terreno peligroso, tabla O/C |
| Cap. 13 «Uso del dado de trama» y «Cómo usar las O/C» (guía de DJ) | 355-357 | 339-341 | Opcional (solo DJ); mejor dentro de la página del dado | Corto | Solo ejemplos |
| Cap. 13 Eras y otras ambientaciones | 371-376 | no existe | **Fuera de este alcance**: pertenece a la configuración de campaña (era 1/2, mezcla de ambientaciones) | — | Solo MB |

**Contenido nuevo de MB que merece mención aparte (cap. 3):**
- **Sentidos sobrenaturales y sobreestimulación** (MB L.58 / PDF 64): los sentidos potenciados (alomancia o feruquimia de estaño)
  suelen dar Mejorado [Discernimiento]; la primera vez en cada ronda que sufras un estímulo intenso hay que superar una prueba de
  **Disciplina CD 12 + el valor de Mejorado [Discernimiento]** o quedas **Desorientado** hasta el final de tu siguiente turno. No
  existe en SL.
- La regla de «Duración fuera de combate» de las artes metálicas (MB L.164 / PDF 170): 1 ronda = hasta tu próximo turno (~10 s) en
  combate; ~1 minuto en conversación; 1-10 minutos en empeño; ~10 minutos fuera de escena. Es el puente entre el cap. 10, 11 y 12.
  Para SL existe una regla análoga en su capítulo 6 [inferido: no leído].

**Recomendación de alcance para el plan:** incluir `Conversaciones` y `Empeños` como páginas compartidas (un solo componente por
página, datos base + overlay), más una página corta «Dado de trama y Oportunidades». Dejar `Eras` en la ficha de campaña.

---

## 8. Anexo A: resto de diferencias en el capítulo 9 (descanso, reposo, sucesos, daño)

No están en los puntos (1)-(7) pero aparecen en `aventuras.ts` y condicionan el parche.

| Bloque | SL | MB | App |
|---|---|---|---|
| Interpretación (primera y tercera persona, qué sabe tu personaje, separar el grupo) | L.287-288 / PDF 291-292 | L.303-304 / PDF 309-310 | Neutral; **igual** |
| Tiempo y ritmo; transición entre escenas; características entre escenas | L.288-289 | L.304-305 | **Igual** (tres tipos de escena y numeración de capítulos iguales) |
| Sucesos (medidor ≥ 2 espacios, 2-3 por sesión, contribuir con O/C, activación, medidores dobles) | L.290-291 / PDF 294-295 | L.305-306 / PDF 311-312 | **Igual** salvo ejemplos |
| Descanso corto: beneficios alternativos | atender, buscar recursos, otros | atender, buscar recursos, **almacenar en mentes de metal**, otros | MB añade 1 |
| Descanso largo | recuperación total; Agotado −1 | igual + beneficio alternativo «almacenar» (2 escenas, Agotado [−1]) | MB añade 1 |
| Reposo: actividades listadas | Manufactura, Trabajar en una profesión, Recuperación, Investigación, Entrenamiento, Autorreflexión | Las mismas 6 **más Mentoría en las artes metálicas** | Parche (+1) |
| Reposo: ejemplos narrativos | Vínculo con el spren, dahn, artifabriano | Cirujano, ladrón skaa, inventor | No están en la app |
| Reposo: Autorreflexión | Reconstruir el personaje con las reglas de «Empezar en niveles superiores» (cap. 13), mismo nivel; ejemplo con Segundo Ideal | Igual, con ejemplo de talentos alománticos | Neutral |
| Orden de secciones en el libro | Descanso aparece al final del capítulo (PDF 303, tras Muerte) en la extracción disponible | Descanso antes de Reposo (L.306) | Sin efecto: la app agrupa Reposo en una pestaña |
| Daño y tipos | Cinco tipos; desvío reduce Energía, Golpe y Laceración | Igual | Solo cambia el ejemplo de Espiritual y Golpe |
| Lesiones, tirada, tabla de efectos, PNJ menores, recuperación de lesiones (se curan el doble de rápido en reposo) | L.296-297 | L.313-314 | **Igual** |
| Lesiones y diversidad funcional | Referencia a sillalibre fabrial | Referencia a «dispositivo de movilidad» | No está en la app |
| Muerte | «Muerte e infusiones»: efectos de potencia sin coste por ronda terminan; el resto de infusiones continúa hasta agotarse; Shadesmar | «La muerte y los efectos Investidos»: los efectos activos de artes metálicas terminan; las mentes de metal con ≥ 1 carga siguen Investidas; Reino Cognitivo | No está en la app; contenido por set |

---

## 9. Anexo B: contrato de datos propuesto para el parche

Propuesta mínima, compatible con los tipos actuales (`aventuras.ts:1-26`, `combatRules.ts:3-14`). Los nombres definitivos
(`RuleSetId`, rutas de fichero) los fija la especificación principal; aquí van como **[inferido]**.

```ts
type RuleSetId = 'stormlight' | 'mistborn'            // [inferido] nombre definitivo en la spec principal
interface Overlay<T> {
  remove?: string[]                                   // clave = name (Estado, CombatAction, ActividadReposo, TipoDano)
  add?: T[]                                           // el resolver reordena alfabéticamente los estados
  replace?: Record<string, Partial<T>>                // clave = name; Partial aplicado encima
}
interface SectionOverlay {                            // para AventuraSection / CombatSection
  addDetails?: Record<string /*section id*/, { label: string; text: string }[]>
  replaceDetails?: Record<string, Record<string /*label*/, string>>
}
interface AventurasOverlay {
  estados?: Overlay<Estado>; actividades?: Overlay<ActividadReposo>; tiposDano?: Overlay<TipoDano>
  descansos?: SectionOverlay; sucesos?: SectionOverlay; dano?: SectionOverlay
}
interface CombatOverlay {
  actions?: Overlay<CombatAction>; freeActions?: Overlay<CombatAction>; reactions?: Overlay<CombatAction>
  sections?: SectionOverlay
}
```

- **Resolver único:** `resolveAventuras(sets: RuleSetId[], primary: RuleSetId)` y `resolveCombat(...)`. Aplican los overlays en
  orden y, ante conflicto de `replace` sobre la misma clave, gana el set principal [inferido].
- **Claves estables:** hoy `Estado.name`, `CombatAction.name`, `ActividadReposo.name` y `TipoDano.name` son únicos; sirven como clave
  sin añadir campos nuevos.
- **Grupos nuevos de acciones:** si se quiere mostrar acciones de poder (Beber vial, Absorber luz tormentosa), añadir
  `powerActions?: CombatAction[]` por set, no en la base.
- **Datos numéricos** que hoy están en JSX o en el API (capacidad de carga `BolsaDetailPage.tsx:233-240`, dado de recuperación
  `CharacterDetailPage.tsx:814`, sentidos `:815`, movimiento `TalentosReglas.cs:264`) deben salir a tablas por set. Solo la carga
  difiere entre sets; el resto puede permanecer como está y compartirse.
- **Campañas mixtas:** el libro lo permite y comparte los seis caminos heroicos (MB L.374 / PDF 380). Por eso `ruleSet` por campaña
  conviene que sea una lista o que el resolver soporte unión [inferido].

---

## 10. Anexo C: defectos ya presentes en los ficheros que se van a compartir

Conviene corregirlos en la **base** (afectan a ambos sets) antes o durante el reparto por set. Todos verificados contra ambos libros.

| # | Fichero:línea | Defecto | Corrección |
|---|---|---|---|
| 1 | `utils/dice.ts:81-89` | Dado de trama de 12 caras (blanco ×4, O ×3, C1 ×2, C2, C3, C4). El libro: d6 con 2 blancos, 2 O, 2 C (+2 o +4) (SL L.8 / MB L.10) | Dado de 6 caras con C+2 y C+4 |
| 2 | `utils/dice.ts:137-147` | Un 20 natural fuerza O y un 1 natural fuerza C2, sustituyendo al dado de trama; la C del dado no suma su bonificación (`dice.ts:149`) | Natural y dado se acumulan; C del dado suma +2/+4; C del 1 natural no suma (SL L.9-10 / MB L.11-12) |
| 3 | `combatRules.ts:73` | «Los personajes Sorprendidos no pueden actuar en el primer turno rápido/lento…» | Según el estado (`aventuras.ts:243-247`): pierden reacciones, no pueden jugar turno rápido y tienen 1 acción menos |
| 4 | `combatRules.ts:70`, `:74` | Duración de Sorprendido (ver 2.5) | Alinear con la ficha del estado |
| 5 | `CombatPage.tsx:121` | «Solo puedes usar una reacción por detonante» | Regla base: **una reacción por ronda**; con varias, no se pueden usar dos para el mismo detonante (SL L.304 / MB L.320) |
| 6 | `combatRules.ts:35` | Falta la exclusión de movimiento instantáneo en Acometida reactiva | Añadirla (ambos libros) |
| 7 | `combatRules.ts:51` | Reacción inicial sin la salvedad «a menos que estés Sorprendido» | Añadir salvedad |
| 8 | `aventuras.ts:176-254` | No existen «Duraciones» (rondas de efectos y fase de inicio) ni «Muerte» | Ver sección 7 |

El hallazgo 1-2 ya figura en `docs/auditoria-reglas-2026-10-03.md` (errores de severidad alta 1 y 3); el 3 y el 5 en la misma auditoría
(«Sorpresa», «Reacciones»). Los 6-8 son nuevos de este informe.

---

## 11. Verificado, inferido y límites

**Verificado (leído en ambos textos):** todas las tablas y textos de las secciones 1, 2, 3, 5, 8 salvo lo marcado. Para SL se
extrajo con `pdftotext` el PDF del manual (páginas 8-24, 280-345) a un fichero del scratchpad; es solo lectura del PDF y no
modifica los repositorios.

**Inferido:**
- Aturdido en MB: omisión de edición, no cambio de regla (sección 1.2).
- Los valores de carga de SL son el 90 % de los de MB por conversión de unidades.
- Mecanismo de resolución en campañas mixtas (set principal gana en conflictos).
- Reglas de duración fuera de combate para SL: no leídas, solo inferidas por analogía.
- Tablas de Ganando terreno y Umbral colectivo de SL: páginas citadas como aprox. (L.325, L.331); las cifras están leídas.

**Dudas abiertas para quien decida:**
1. ¿Se quiere reproducir la lectura literal de SL en Sorpresa (todos han jugado su primer turno) o unificar en la de MB? Cambia una
   sola línea.
2. ¿Aturdido sin reacción al inicio del turno en MB? Conviene tratar el texto de SL como válido para ambos.
3. ¿Neutralizar la base (≈25 ediciones) o dejar la base como SL y crear solo el overlay de MB? La neutral es más limpia para campañas
   mixtas; la segunda tiene cero riesgo de regresión.
4. Duración, coste y límite de la actividad de reposo «Mentoría en las artes metálicas»: el libro no los fija (es contenido
   narrativo con regla de ventajas).
5. Peso del catálogo: confirmar si los pesos de armas, armaduras y equipo de MB están en kg con la misma convención que su tabla de
   carga; no está en el alcance de este informe.

**No comparado (fuera de alcance):** cap. 4-8 (caminos, artes metálicas, objetos, metas), Guía del Mundo, adversarios, hojas de
personaje, cap. 13 salvo el dado de trama.
