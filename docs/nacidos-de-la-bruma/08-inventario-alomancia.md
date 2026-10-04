# Inventario de la ALOMANCIA (Nacidos de la Bruma, cap. 6) y esquema de datos

Fuente: manual «Nacidos de la bruma» (Devir). Convención de páginas: `L.<libro> / PDF <pdf>` con PDF = libro + 6.
Leído completo: L.161-212 / PDF 167-218 (intro, tablas de metales, 17 entradas de alomancia), L.129-133 / PDF 135-139 (Investidura, viales, metas),
hoja de artes metálicas L.404 / PDF 410, más cruces verificados: L.26 / PDF 32 y L.57 / PDF 63 (fórmula de Investidura), L.134 / PDF 140
(tabla «Descubrimiento de alomancia»), L.136 / PDF 142 (talentos Investido y Portentoso), L.137 / PDF 143 (leyenda de iconos), L.267 / PDF 273 (precios de viales),
L.310 / PDF 316 (estado Desprovisto), L.372 / PDF 378 (metales por era).
Marcas: **[inferido]** = reconstruido porque la extracción de texto desordena columnas o pierde glifos. Las descripciones de los talentos son paráfrasis breves mías, no texto del libro.

## 0. Resumen ejecutivo (lo que más importa al implementador)

- **17 entradas** de alomancia (16 metales + atium). **83 entradas de talento** de alomancia en total (**76 talentos distintos**: 7 aparecen en dos árboles con el mismo nombre). El **aluminio no tiene árbol** (0 talentos).
- **Cada metal con árbol tiene exactamente 2 talentos «raíz»** (prerrequisito = el poder) → 16 metales × 2 = 32 raíces.
- Los talentos de alomancia **no modifican de forma permanente** ningún valor de la ficha (salud, defensas, Investidura máx.); todos son efectos activados o situacionales. Los únicos modificadores permanentes de Investidura están en el árbol del camino brumoso (*Investido*, L.136 / PDF 142), no en estos árboles.
- Activación de talentos y acciones: **7 tipos** = acción 1/2/3, gratuita (0), reacción (r), especial (*), siempre activo (8) (leyenda L.137 / PDF 143, regla L.76 / PDF 82). Coinciden exactamente con el `ActivationType` que ya usa `src/components/TalentActivation.tsx` (`action1|action2|action3|free|reaction|special|passive`).
- Tabla de **Progresión de las artes metálicas** (límite / dado / alcance por grados de Alomancia): ver §4. Es la única «fórmula derivada» nueva de alomancia.
- El manual **no asocia a cada metal un atributo o habilidad propia**: toda la alomancia usa la habilidad Investida **Alomancia (atributo Voluntad, cognitiva)** (L.128 / PDF 134). Las habilidades mundanas (Perspicacia, Liderazgo, Sigilo, Hurto, Engaño, Disciplina, Atletismo, Agilidad, Armamento pesado/ligero) solo aparecen como prerrequisito de ciertos talentos.
- «Avivar» **no es una sección ni una acción**: es una expresión narrativa (gastar mucha Investidura de golpe; L.129 / PDF 135). No hay campo «Avivar» en las entradas.
- La «meta de nacido del metal» **no está dentro de cada entrada** del cap. 6: es genérica por poder (L.132-133 / PDF 138-139, «Entrenar tu(s) poder(es)»; el atium no la necesita). Cada entrada solo indica qué caminos desbloquean el árbol.

## 1. Tablas de metales (L.167-171 / PDF 173-177)

### 1.1 Clasificaciones del libro (L.166-167 / PDF 172-173)
- Categorías de alomancia (4 + divinos): **físicos** (hierro, acero, estaño, peltre), **mentales** (cinc, latón, cobre, bronce), **de mejora** (cromo, nicrosil, aluminio, duraluminio), **temporales** (cadmio, bendaleo, oro, electro), **divinos** (atium, malatium, lerasium, aleaciones de lerasium, armonium, trellium).
- **Externo / interno**: externo = afecta al mundo, interno = afecta al propio usuario. La aleación emparejada comparte clasificación con su metal puro.
- **Tirón / Empujón**: el metal puro es Tirón; su aleación emparejada es Empujón (términos nacidos de hierro/acero, extendidos a todos).
- **Comunes** = los 8 físicos + mentales (suministro implícito). **Raros** = mejora + temporales + divinos (viales contados) (L.167 / PDF 173; L.130 / PDF 136).
- Orden de las filas en la tabla impresa: Hierro, Acero, Estaño, Peltre, Cinc, Latón, Cobre, Bronce, Cromo, Nicrosil, Aluminio, Duraluminio, Cadmio, Bendaleo, Oro, Electro, Atium, Malatium*, Lerasium†, Aleaciones de lerasium†, Armonium*, Trellium*. (Orden de entradas del capítulo, en cambio: alfabético.)

### 1.2 «Metales en la alomancia» — columnas exactas: Metal alomántico · Efecto · Nombre de brumoso · Metal emparejado · Era · Tirón o Empujón · Externo o interno · Categoría (L.168 / PDF 174)
Filas emparejadas por posición con el diagrama y verificadas contra los textos de cada entrada (el texto crudo sale en columnas separadas: **[inferido]** el emparejado fila a fila, pero cada fila coincide con su subtítulo «Categoría – Interno/Externo – Tirón/Empujón» de la entrada).

| # | Metal | Efecto (resumen del libro) | Nombre de brumoso | Emparejado | Era | T/E | Ext/Int | Categoría | Rareza |
|---|-------|----------------------------|-------------------|-----------|-----|-----|---------|-----------|--------|
| 1 | Hierro | Tira de los metales cercanos | Atraedor | Acero | Ambas | Tirón | Externo | Físico | común |
| 2 | Acero | Empuja los metales cercanos | Lanzamonedas | Hierro | Ambas | Empujón | Externo | Físico | común |
| 3 | Estaño | Agudiza tus sentidos | Ojo de estaño | Peltre | Ambas | Tirón | Interno | Físico | común |
| 4 | Peltre | Potencia tus capacidades físicas | Brazo de peltre / violento | Estaño | Ambas | Empujón | Interno | Físico | común |
| 5 | Cinc | Inflama las emociones ajenas | Encendedor | Latón | Ambas | Tirón | Externo | Mental | común |
| 6 | Latón | Calma las emociones ajenas | Aplacador | Cinc | Ambas | Empujón | Externo | Mental | común |
| 7 | Cobre | Oculta el uso de las artes Investidas cercanas | Ahumador / nube de cobre | Bronce | Ambas | Tirón | Interno | Mental | común |
| 8 | Bronce | Detecta el uso de artes Investidas | Buscador | Cobre | Ambas | Empujón | Interno | Mental | común |
| 9 | Cromo | Elimina las reservas de Investidura ajenas | Sanguijuela | Nicrosil | Era 2 | Tirón | Externo | Mejora | raro |
| 10 | Nicrosil | Potencia los efectos Investidos ajenos | Nicroestallante | Cromo | Era 2 | Empujón | Externo | Mejora | raro |
| 11 | Aluminio | Elimina tus reservas de Investidura | Mosquito de aluminio / vacío | Duraluminio | Era 2 ‡ | Tirón | Interno | Mejora | raro |
| 12 | Duraluminio | Potencia tus efectos Investidos | Mosquito de duraluminio | Aluminio | Era 2 ‡ | Empujón | Interno | Mejora | raro |
| 13 | Cadmio | Crea una burbuja de tiempo ralentizado a tu alrededor | Pulsador | Bendaleo | Era 2 | Tirón | Externo | Temporal | raro |
| 14 | Bendaleo | Crea una burbuja de tiempo acelerado a tu alrededor | Deslizador | Cadmio | Era 2 | Empujón | Externo | Temporal | raro |
| 15 | Oro | Revela tu pasado y tus yoes alternativos | Augur | Electro | Ambas ‡ | Tirón | Interno | Temporal | raro |
| 16 | Electro | Revela tus posibles futuros inmediatos | Oráculo | Oro | Era 2 ‡ | Empujón | Interno | Temporal | raro |
| 17 | Atium | Revela los posibles futuros inmediatos de los demás | Vidente | n/a | Era 1 | n/a | n/a | Divino | raro (divino) |
| — | Malatium * | Revela el pasado y los yoes alternativos de los demás | Adivino | n/a | Era 1 | n/a | n/a | Divino | no representado |
| — | Lerasium † | Te convierte en nacido de la bruma | n/a | n/a | Era 1 | n/a | n/a | Divino | recompensa cap. 8 |
| — | Aleaciones de lerasium † | Te convierten en brumoso del poder del metal aleado | n/a | n/a | Era 1 | n/a | n/a | Divino | recompensa cap. 8 |
| — | Armonium * | Desconocido | n/a | n/a | Era 2 | n/a | n/a | Divino | no representado |
| — | Trellium * | Desconocido | n/a | n/a | Era 2 | n/a | n/a | Divino | no representado |

Notas al pie del libro: `*` el poder no aparece representado en el libro; `†` el metal aparece en «Metales raros» del cap. 8; `‡` a finales de la Era 1 las propiedades de aluminio, duraluminio y electro, y la existencia de brumosos de oro, empiezan a conocerse más allá del Ministerio de Acero.
Disponibilidad por era según la tabla de descubrimiento (L.134 / PDF 140): **solo Era 2** = cromo, nicrosil, cadmio, bendaleo; **fin de Era 1 o Era 2** = aluminio, duraluminio, oro, electro (el oro figura «Ambas ‡» en la tabla de metales: el metal se conoce en ambas eras pero los brumosos de oro estaban ocultos hasta casi el final de la Era 1, L.167 / PDF 173).

### 1.3 «Metales en la feruquimia» — columnas: Metal feruquímico · Efecto · Nombre de ferrin · Metal emparejado · ¿Aleación o puro? · Era · Categoría (L.171 / PDF 177)
Incluida porque cada metal aparece dos veces (alomancia y feruquimia) y comparte `id`. **[inferido]** el emparejado por posición de fila.

| Metal | Almacena | Nombre de ferrin | Emparejado | Puro/Aleación | Era | Categoría |
|-------|----------|------------------|-----------|---------------|-----|-----------|
| Hierro | peso | Ajustador | Acero | Puro | Ambas | Físico |
| Acero | velocidad física | Mensajero de acero | Hierro | Aleación | Ambas | Físico |
| Estaño | sentidos | Susurravientos | Peltre | Puro | Ambas | Físico |
| Peltre | fuerza | Bruto | Estaño | Aleación | Ambas | Físico |
| Cinc | velocidad mental | Chispeante | Latón | Puro | Ambas | Cognitivo |
| Latón | calor | Alma de fuego | Cinc | Aleación | Ambas | Cognitivo |
| Cobre | recuerdos | Archivero | Bronce | Puro | Ambas | Cognitivo |
| Bronce | desvelo | Centinela | Cobre | Aleación | Ambas | Cognitivo |
| Cromo | Fortuna (espiritual) | Hilador | Nicrosil | Puro | Era 2 | Espiritual |
| Nicrosil | capacidades Investidas | Portaalmas | Cromo | Aleación | Era 2 | Espiritual |
| Aluminio | Identidad (espiritual) | Genuino | Duraluminio | Puro | Era 2 † | Espiritual |
| Duraluminio | Conexión (espiritual) | Conector | Aluminio | Aleación | Era 2 † | Espiritual |
| Cadmio | aliento | Resollante | Bendaleo | Puro | Era 2 | Híbrido |
| Bendaleo | nutrición | Incorporador | Cadmio | Aleación | Era 2 | Híbrido |
| Oro | salud | Hacedor de sangre | Electro | Puro | Ambas | Híbrido |
| Electro | determinación | Pináculo | Oro | Aleación | Era 2 † | Híbrido |
| Atium | juventud | Cronodevanador | n/a | n/a | Era 1 | Divino |
(Malatium, lerasium y aleaciones: «Desconocido», Era 1; armonium y trellium: «Desconocido», Era 2; todos n/a.) Categorías de feruquimia: físicos, cognitivos, espirituales, híbridos, divinos.

### 1.4 Otras tablas del cap. 6 de uso en la app
- **Ejemplos de poderes nacientes** (L.162 / PDF 168): solo 6 metales de alomancia tienen ejemplo: bendaleo, cinc, cobre, cromo, estaño, hierro (más 6 de feruquimia). Es texto de apoyo, no regla.
- **Diagramas circulares** «Tabla de metales alománticos» (L.169 / PDF 175) y «Tabla de metales feruquímicos» (L.170 / PDF 176): solo ilustración (ejes externo/interno y tirar/empujar); no aportan datos que no estén en §1.2/§1.3.
- **Precios de «Viales de metales raros»** (L.267 / PDF 273; verificado contra la imagen de la página): en arquillas (ar).

| Metal | Era 1 | Era 2 |
|-------|-------|-------|
| Aluminio | 25 ar/vial | 50 ar/vial |
| Atium | 150 ar/cuenta | No disponible |
| Bendaleo | No disponible | 500 ar/vial |
| Cadmio | No disponible | 50 ar/vial |
| Cromo | No disponible | 10 ar/vial |
| Duraluminio | 25 ar/vial | 50 ar/vial |
| Electro | 10 ar/vial | 50 ar/vial |
| Nicrosil | No disponible | 50 ar/vial |
| Oro | 5 ar/vial | 25 ar/vial |

## 2. Estructura de una entrada de poder alomántico (verificada)

Verificada leyendo las 17 entradas completas; en especial acero, hierro, bendaleo, cinc, atium, aluminio, duraluminio y peltre. Fuente de la lista de secciones: «Anatomía de un poder», L.166 / PDF 172.

Orden fijo dentro de cada entrada:
1. **Título** «Alomancia de X» (en mayúsculas en el diseño; el libro lo presenta como «alomancia de acero»).
2. **Subtítulo** `Categoría – Interno/Externo – Tirón/Empujón` (p. ej. «Físico – Externo – Empujón»). Variantes: **atium** = `Metal divino` + línea de era (`Era 1`); metales solo Era 2 llevan además una línea `Era 2` (bendaleo, cadmio, cromo, nicrosil). Aluminio, duraluminio y electro (Era 2 ‡) **no** llevan línea de era (**verificado**: PDF 181, 201 y 203), ni oro ni los comunes (Ambas).
3. **Prosa de ambientación** (qué hace, nombre coloquial del brumoso en cursiva/negrita, anécdotas). Sin reglas.
4. **«Elección de alomancia de X»** — recuadro opcional, **solo en aluminio y duraluminio** (consejo de no elegirlos salvo campaña de saltamundos). No existe en las demás.
5. **Acciones** (1 o 2 sub-bloques con nombre propio; ver §3): cada una con línea `Activación: <icono> Duración: <texto>` y reglas. Casi todas terminan con la cláusula de mantenimiento «Antes de que el efecto termine, puedes mantenerlo … gastando … como 0».
6. **«Uso de la alomancia de X»** — opcional (ausente en aluminio): subapartados con nombre propio y variables según el metal (p. ej. «Empujones de acero difíciles», «Propiedades únicas» en atium, «Burbujas solapadas» + «Interacción con la burbuja» en bendaleo/cadmio, «Complicaciones» + «Manipulaciones solapadas» + «Control de PNJs» en cinc/latón, «Traspasar nubes de cobre», «Buscar entre la multitud», «Estallidos en capacidades que no progresan» en duraluminio/nicrosil) y casi siempre **«Usos creativos»** (lista de ideas con nombre + frase). Hay además recuadros sueltos: «Consejo para la DJ: Tamaño frente a peso» (acero e hierro), «El atium auténtico» (atium), «Pulsadores y granadas alománticas» (cadmio), «Estados emocionales alterados» (latón, L.206 / PDF 212).
7. **«Talentos de alomancia de X»** (en oro el encabezado no existe, solo la frase): frase fija «Los talentos siguientes, presentados en orden alfabético, aparecen en el árbol de talentos de la alomancia de X. **Es posible desbloquear este árbol mediante el talento principal de los caminos de …, o a través de un clavo hemalúrgico.**» y, a continuación, cada talento con `Nombre / Prerrequisito: … / Activación: … / texto narrativo / texto de reglas`.
8. **Diagrama resumen del árbol** (rótulo «ALOMANCIA DE X»): una línea por talento en orden de árbol (de la raíz hacia abajo), con icono de activación (en el texto extraído solo sobrevive la estrella ★ de «especial») y a veces un prerrequisito abreviado. **Atención**: el diagrama omite prerrequisitos de talento (van como líneas gráficas) y varias veces los de habilidad; el texto del talento manda (ver §6, discrepancias).

Qué NO tiene cada entrada (comprobado): meta de nacido del metal (es genérica, L.132-133), «Avivar», tabla propia de alcance/dado/límite (es la tabla común de L.163 / PDF 169; las entradas solo la referencian: «tu dado de artes metálicas», «tu límite de artes metálicas», «tu alcance de artes metálicas»), versión naciente propia (los ejemplos nacientes están en la tabla común L.162 / PDF 168). El **atium** es excepción: no tiene versión naciente ni requiere la meta (L.177 / PDF 183; L.133 / PDF 139).

### 2.1 Gramática de prerrequisitos (todas las variantes que aparecen)
| Forma | Ejemplo | Aparece en |
|-------|---------|-----------|
| `poder Alomancia de X` (raíz) | Prevenirse con palanca | todas las raíces (en *Ráfaga de monedas* aparece como «Alomancia de acero» sin «poder» [errata menor]) |
| `Alomancia N o más` | Alomancia 3 o más | 1 a 5 |
| `talento T` | talento Burbuja ampliada | muchos |
| `talento A o talento B` (OR) | Hiperdrenaje; Ahumador eficiente («talento Nube de cobre ampliada o Cobertura espontánea») | cromo, cobre |
| habilidad N + talento | Liderazgo 3 o más; talento Encender determinación | cinc, cobre, cromo, electro, atium, latón, nicrosil, peltre |
| OR de habilidades | «Armamento pesado 2 o más o Armamento ligero 2 o más»; «Atletismo 2 o más o Hurto 2 o más»; «Atletismo 2 o más o Armamento pesado 2 o más» | acero, estaño, hierro, nicrosil, peltre |
| requisito narrativo/de equipo | «pericia en un arma Defensiva o en una armadura con un desvío de 3 o más» | Equipo de atraedor (hierro) |
| requisito de otros poderes | «al menos otro poder o capacidad Investida» / «al menos otros dos poderes o capacidades Investidas» | duraluminio (ambos talentos) |
Habilidades que aparecen como prerrequisito: Armamento pesado, Armamento ligero, Atletismo, Agilidad, Hurto, Sigilo, Perspicacia, Liderazgo, Engaño, Disciplina. Con separador `;` entre cláusulas (AND) y « o » para OR, igual que el motor actual `parsePrereq` de `src/lib/talentGraph.ts` (L.204-290); haría falta una cláusula nueva para `poder Alomancia de X` y para «otros poderes» [inferido].

## 3. Inventario por metal

Convenciones: Act. = activación (1/2 = acciones, 0 = gratuita, r = reacción, * = especial, 8 = siempre activo). «Raíz» = prerrequisito solo el poder. `Inv.` = puntos de Investidura. Límite = límite de artes metálicas (§4). Todas las páginas son `L. / PDF`.
En cada metal: **Caminos** = quién desbloquea el árbol. «B»=brumoso, «N»=nacidoble, «NB»=nacido de la bruma.

### 3.1 ACERO — L.172-174 / PDF 178-180 — Físico – Externo – Empujón — **7 talentos**
Caminos: B, N, NB. Acciones (2):
- **Quemar acero** — Act. 1, duración 1 ronda, coste 0 Inv. (requiere ≥1 Inv.); mantener como 0 si queda ≥1 Inv. Percibe metal dentro del alcance; no detecta aluminio; con <6 grados no detecta objetos Investidos ni integrados en el cuerpo.
- **Empujón de acero** — Act. 1, instantánea, gasta ≥1 Inv. hasta el límite, mientras quemas acero. Opciones: *Propulsar* (6 m por Inv.) o *Lanzar una moneda* (ataque a distancia de Alomancia vs Defensa física; daño 1d4 = dado de artes metálicas).

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Ráfaga de monedas | poder Alomancia de acero (raíz) | * | Gasta Inv. extra para dar a Lanzar una moneda el rasgo Explosiva (1,5 m por Inv.) |
| Prevenirse con palanca (compartido con hierro) | poder Alomancia de acero (raíz) | 8 | Con Prevenirse, usa el tamaño del objeto mayor; ventaja en pruebas de Alomancia con objetos ≤ tu tamaño |
| Experto en Empujones de acero | Alomancia 3; talento Prevenirse con palanca | 8 | Varios Empujones por turno (1 concentración cada uno extra); punto de apoyo estable |
| Francotirador con monedas | Alomancia 3; talento Ráfaga de monedas | 8 | Un dado de daño adicional al Lanzar una moneda |
| Disparo con empujón | Armamento pesado 2 o Armamento ligero 2; talento Ráfaga de monedas | * | Empuja munición metálica de un arma a distancia; más alcance y suma dados |
| Burbuja protectora | Alomancia 4; talento Experto en Empujones de acero | 1 | 1 Inv.: desventaja a ataques a distancia con proyectil metálico hasta fin de turno; mantener 1 Inv. como 0 |
| Vuelo de acero auténtico | talento Experto en Empujones de acero | 1 | 1 Inv.: valor de vuelo 12 m hasta fin de turno; mantener 1 Inv. como 0 |

### 3.2 ALUMINIO — L.175 / PDF 181 — Mejora – Interno – Tirón — **0 talentos** (sin árbol)
Acción única: **Quemar aluminio** — Act. 1, duración 1 ronda, coste 1 Inv.; mantener 1 Inv. como 0. Efectos: Investidura a 0, Desprovisto de tus otros poderes mientras dure (aunque Bebas vial), mentes de metal a 0 cargas, termina efectos Investidos externos, inmune a efectos que requieran infundirte (no a tu equipo). Tiene «Elección de alomancia de aluminio»; **no** tiene «Uso del poder» ni sección de talentos ni frase de caminos desbloqueadores. Además L.165 / PDF 171: reglas de objetos de aluminio («alománticamente inertes»).

### 3.3 ATIUM — L.176-178 / PDF 182-184 — Metal divino – Era 1 — **6 talentos**
Caminos: B, NB (**no** nacidoble: es solo Era 1). Sin versión naciente ni meta (L.177 / PDF 183). Acciones (2):
- **Tragar atium** — Act. 1; ingiere cuentas; puede incluir Beber vial; **no** da Investidura (registro aparte de cuentas).
- **Quemar atium** — Act. 1; duración = tantas rondas de combate (o minutos fuera de combate) como grados de Alomancia; coste = 1 cuenta de atium ya tragada; mantener como 0 gastando otra cuenta. Mientras dura: tus d20 de pruebas físicas contra personajes en alcance valen 15; los d20 enemigos contra ti valen 5 (si ambos fijan el dado, se ignora y se tira normal).

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Maestría de las sombras | poder Alomancia de atium (raíz) | 8 | Sumas tus grados de Alomancia al d20 fijo propio y los restas al enemigo; el exceso sobre 20/1 da Oportunidad/Complicación |
| En el peor de los casos | Engaño 3; poder Alomancia de atium | 8 | Puedes no activar reacciones enemigas; los ataques no te hacen rasguños |
| Vidente social | Perspicacia 3; talento Maestría de las sombras | 8 | El efecto alcanza también pruebas mentales/espirituales |
| Despejar la mente | Disciplina 4; talento En el peor de los casos | * | 1 concentración: ignora un efecto que asigna valor estático a tus dados |
| Precisión vital | Alomancia 4; talento Maestría de las sombras | 8 | Cada dado de daño toma su valor máximo |
| Modo dios | Alomancia 5; talento Precisión vital | * | Cuando un enemigo acaba turno, 1 concentración para una acción 1 o 0 adicional |

### 3.4 BENDALEO — L.179-181 / PDF 185-187 — Temporal – Externo – Empujón — Era 2 — **5 talentos**
Caminos: B, N. Acción: **Quemar bendaleo** — Act. 2, 1 ronda, ≥1 Inv. hasta el límite; burbuja de tiempo acelerado tamaño Enorme (4,5 m); en la ronda adicional los de dentro actúan con 1 + Inv. acciones; mantener como 0 con la misma Inv. (debes estar dentro); una sola burbuja activa.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Burbuja ampliada (compartido con cadmio) | poder Alomancia de bendaleo | * | +1 Inv. para área de 7,5 m (también al mantener) |
| Burbuja espontánea (compartido con cadmio) | Alomancia 2; poder Alomancia de bendaleo | r | 1 concentración: quemar bendaleo/cadmio como reacción |
| Arreglo apresurado | Alomancia 3; talento Burbuja ampliada | * | En empeño, 1 concentración para sufrir C en vez de contar un fallo |
| Burbuja defensiva | talento Burbuja espontánea | 8 | Bono a todas las defensas contra efectos externos = Inv. gastada |
| Burbuja expeditiva (compartido con cadmio) | Alomancia 3; talento Burbuja espontánea | 8 | Quemar bendaleo/cadmio cuesta una acción menos |

### 3.5 BRONCE — L.182-184 / PDF 188-190 — Mental – Interno – Empujón — **6 talentos**
Caminos: B, N, NB. Acción: **Quemar bronce** — Act. 1, duración = grados de Alomancia en rondas, ≥1 Inv. hasta el límite; detecta gasto de Investidura y efectos persistentes en alcance, puedes buscar tantos efectos como Inv. gastada; con 1 acción, prueba de Alomancia CD 15 para identificar el poder; mantener ≥1 Inv. como 0.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Buscador distante | poder Alomancia de bronce | 8 | Duplica el alcance de artes metálicas del bronce |
| Maestro de pulsos | Alomancia 2; poder Alomancia de bronce | 8 | Identificas el poder automáticamente; prueba CD 15 para efectos y objetivos |
| Buscador de reservas | talento Maestro de pulsos | 8 | Conoces Investidura máxima y actual del buscado |
| Buscador del Cosmere | Alomancia 3; talento Maestro de pulsos | 8 | Detectas casi cualquier capacidad Investida |
| Defensa detectada | Alomancia 3; talento Maestro de pulsos | 8 | Desventaja al enemigo detectado, o ventaja para ti |
| Búsqueda constante | Alomancia 2; talento Buscador distante | * | Quemar bronce sin gastar Inv. (efecto como 1); quita tu Sorprendido |

### 3.6 CADMIO — L.185-187 / PDF 191-193 — Temporal – Externo – Tirón — Era 2 — **4 talentos**
Caminos: B, N. Acción: **Quemar cadmio** — Act. 2, 1 ronda, ≥1 Inv. hasta el límite; burbuja Enorme (4,5 m) de tiempo ralentizado; todos dentro obtienen 1 + Inv. puntos de demora que deben eliminar con acciones antes de actuar; mantener como 0 con la misma Inv. (más demora); una sola burbuja activa.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Burbuja ampliada (compartido) | poder Alomancia de cadmio | * | +1 Inv. para área de 7,5 m |
| Burbuja espontánea (compartido) | Alomancia 2; poder Alomancia de cadmio | r | 1 concentración: quemar bendaleo/cadmio como reacción |
| Burbuja expeditiva (compartido) | Alomancia 3; talento Burbuja espontánea | 8 | Quemar bendaleo/cadmio cuesta una acción menos |
| Dilatación temporal | Alomancia 3; talento Burbuja ampliada | 8 | La burbuja ampliada llega a 10,5-13,5 m |

### 3.7 CINC — L.188-190 / PDF 194-196 — Mental – Externo – Tirón — **6 talentos**
Caminos: B, N, NB. Acción: **Quemar cinc** — Act. 2, 1 ronda, ≥1 Inv. hasta el límite; elige una emoción y una zona Grande (3 m) dentro del alcance; prueba de Alomancia vs Defensa espiritual si quieres ocultarlo; el afectado puede resistirse gastando concentración = Inv. como 0; mantener ≥1 Inv. como 0. Con ≥6 Inv. y objetivo kandra/koloss/hemalúrgico a 0 concentración → pasa a ser compañero.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Agresión abrumadora | poder Alomancia de cinc | 0 | 2 Inv.: objetivo a 0 concentración ataca al más cercano |
| Control de masas (compartido con latón) | Alomancia 2; poder Alomancia de cinc | 8 | Área de cinc/latón hasta zona Colosal (9 m) |
| Influencia precisa (compartido con latón) | Alomancia 3; talento Control de masas | 8 | Cuesta una acción menos; excluir objetivos |
| Manipulación sutil (compartido con latón) | Perspicacia 3; talento Influencia precisa | 1 | 1 Inv.: ventaja al influir; Secuaces/Rivales pierden 2 concentración más al resistir |
| Encender determinación | Liderazgo 2; talento Agresión abrumadora | * | 1/escena: en vez del efecto, aliados recuperan concentración y quedan Resueltos |
| Brío profundo | Liderazgo 3; talento Encender determinación | * | Además deja Concentrados a tantos objetivos como Inv. |

### 3.8 COBRE — L.191-192 / PDF 197-198 — Mental – Interno – Tirón — **4 talentos**
Caminos: B, N, NB. Acción: **Quemar cobre** — Act. 1, duración = grados de Alomancia en rondas, coste 1 Inv.; nube hasta 3 m de radio centrada en ti; inmune a efectos mentales; capacidades con ≥6 Inv. la traspasan; mantener 1 Inv. como 0.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Nube de cobre ampliada | poder Alomancia de cobre | 8 | Radio máximo +1,5 m × grados |
| Cobertura espontánea | poder Alomancia de cobre | r | 1 concentración: quemar cobre como reacción ante capacidad Investida |
| Ahumador eficiente | Alomancia 2; talento Nube de cobre ampliada **o** Cobertura espontánea | 8 | Duración doble; cambiar tamaño de nube como 0 |
| Coordinación encubierta | Sigilo 3; talento Cobertura espontánea | * | 1 concentración: ventaja a aliado en la nube (Sigilo o apuesta alta) |

### 3.9 CROMO — L.193-194 / PDF 199-200 — Mejora – Externo – Tirón — Era 2 — **6 talentos**
Caminos: B, N. Acción: **Quemar cromo** — Act. 1, instantánea, coste 1 Inv.; toca para drenar: personaje/objeto infundido pierde 1d4 Inv. (dado de artes metálicas); objeto con cargas pierde la mitad; mentes de metal solo si el objetivo tiene 0 Inv. y está almacenando/decantando; prueba de Alomancia vs Defensa física si es reticente.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Agarre drenante | poder Alomancia de cromo | * | Tras prueba física con éxito, O o 2 concentración para drenar sin tirada |
| Drenaje reactivo | Alomancia 2; poder Alomancia de cromo | r | Drenar antes de que alguien use una capacidad Investida |
| Drenaje simultáneo | Alomancia 3; talento Agarre drenante | * | Drena a dos objetivos a la vez |
| Hiperdrenaje | talento Agarre drenante **o** talento Drenaje reactivo | * | Inv. extra hasta el límite = dados extra |
| Sanguijuela evasiva | Hurto 2; talento Drenaje reactivo | * | Reacción adicional por turno para Esquivar o Drenaje reactivo |
| Sifón de mentes de metal | Alomancia 4; talento Hiperdrenaje | 8 | Drena tantas cargas como el dado; aunque el portador tenga Inv. |

### 3.10 DURALUMINIO — L.195-196 / PDF 201-202 — Mejora – Interno – Empujón — **2 talentos**
Caminos: B, N, NB (el árbol lo dice así; ver §6). Acción: **Quemar duraluminio** — Act. *, instantánea, no requiere acción; antes de usar/mantener otra capacidad que consuma Inv., gastas **toda** la Inv. restante ignorando límite y costes; tamaño/alcance/objetivos al máximo; tira dado de trama (C = pérdida de control). Tiene «Elección de alomancia de duraluminio».

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Estallido controlado | Alomancia 4; poder Alomancia de duraluminio; al menos otro poder o capacidad Investida | 8 | Sin dado de trama obligatorio ni máximos forzados |
| Estallido selectivo | poder Alomancia de duraluminio; al menos otros dos poderes o capacidades Investidas | * | En vez de gastar toda la Inv., quedas Desprovisto del poder del estallido |

### 3.11 ELECTRO — L.197-198 / PDF 203-204 — Temporal – Interno – Empujón — **6 talentos**
Caminos: B, N, NB. Acción: **Quemar electro** — Act. 1, 1 ronda, ≥1 Inv. hasta el límite; tiras tantos d20 como Inv.: son tus «sombras de electro», que puedes gastar para sustituir el d20 de una prueba enemiga contra ti; mantener ≥1 Inv. como 0 (se tiran de nuevo).

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Reacciones prescientes | poder Alomancia de electro | 8 | Gastar una sombra en lugar de tu reacción para Esquivar/Acometida reactiva |
| Sombras persistentes | Alomancia 2; poder Alomancia de electro | * | Al mantener, Inv. extra conserva sombras una ronda más |
| Electro profético | Alomancia 2; talento Reacciones prescientes | * | Volver a tirar un d20 de sombra; quemar quita Sorprendido |
| Objetivo resbaladizo | Alomancia 3; talento Reacciones prescientes | 8 | Sin rasguños; Acometidas reactivas contra ti con desventaja |
| Oráculo proactivo | Perspicacia 2; talento Sombras persistentes | * | Gasta sombra para sustituir tu propio d20 en pruebas sobre otros |
| Ejercicio teórico | Alomancia 3; talento Oráculo proactivo | * | 1/ronda, 3 Inv.: deshacer una acción o reacción |

### 3.12 ESTAÑO — L.199-200 / PDF 205-206 — Físico – Interno – Tirón — **6 talentos**
Caminos: B, N, NB. Acción: **Quemar estaño** — Act. 1, duración = grados de Alomancia en rondas, ≥1 Inv. hasta el límite; **Mejorado [Discernimiento]** con bono = mitad de la Inv. (redondeo arriba); sentidos sobrenaturales (más percepción y vulnerabilidad); mantener ≥1 Inv. como 0.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Reenfoque con avivamiento | poder Alomancia de estaño | 1 | Inv. → misma concentración; 1d4 de daño vital por punto |
| Preparación sensible | Alomancia 2; poder Alomancia de estaño | * | Quemar sin gastar Inv.; quita Sorprendido |
| Sensibilidad proactiva | talento Preparación sensible | 8 | Sin Desorientado por estímulos de aliados o propios |
| Precisión de estaño | Armamento pesado 1 o Armamento ligero 1; talento Reenfoque con avivamiento | 8 | Más alcance a distancia; no subir la apuesta cerca de aliados |
| Sentir la debilidad | Alomancia 3; talento Reenfoque con avivamiento | 8 | Obtener ventaja revela salud/defensas; +1d4 al siguiente ataque |
| Enhaciendo el no ver (sic, nombre tal como aparece en texto y diagrama) | Alomancia 3; talento Sensibilidad proactiva | 0 | 2 concentración: un solo sentido ×4 de alcance y Oportunidad; pierdes los demás |

### 3.13 HIERRO — L.201-203 / PDF 207-209 — Físico – Externo – Tirón — **7 talentos**
Caminos: B, N, NB. Acciones (2):
- **Quemar hierro** — Act. 1, 1 ronda, 0 Inv. (requiere ≥1); mantener como 0 si queda ≥1 Inv.; igual que acero (no detecta aluminio; <6 grados no detecta Investidos).
- **Tirón de hierro** — Act. 1, instantánea, ≥1 Inv. hasta el límite; *Propulsar* (6 m por Inv.) o *Choque violento* (ataque cuerpo a cuerpo de Alomancia vs Defensa física, 1d4 = dado de artes metálicas).

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Prevenirse con palanca (compartido con acero) | poder Alomancia de hierro | 8 | Igual que en acero |
| Tirón de proyectil | poder Alomancia de hierro | r | 1 Inv.: te conviertes en objetivo de un proyectil metálico dirigido a un aliado |
| Disparo con Tirón de hierro | Alomancia 2; talento Prevenirse con palanca | * | Atraer un objeto contra un personaje en su trayectoria: ataque a distancia, 1d4 |
| Acometida con Tirón | Atletismo 2 o Armamento pesado 2; talento Prevenirse con palanca | * | Choque violento con arma cuerpo a cuerpo o sin armas, suma dados |
| Desarmar tirando | Alomancia 2; talento Tirón de proyectil | 8 | Tirón de proyectil contra armas metálicas y ataques contra ti; arrebatas el arma |
| Equipo de atraedor | pericia en arma Defensiva o armadura con desvío ≥3; talento Tirón de proyectil | 8 | +desvío = grados contra ataques metálicos; ignoras Perforante |
| Experto en Tirones de hierro | Alomancia 3; talento Desarmar tirando | 8 | Varios Tirones por turno (1 concentración); reacción extra solo para Tirón de proyectil |

### 3.14 LATÓN — L.204-206 / PDF 210-212 — Mental – Externo – Empujón — **6 talentos**
Caminos: B, N, NB. Acción: **Quemar latón** — Act. 2, 1 ronda, ≥1 Inv. hasta el límite; atenúa una emoción en zona Grande (3 m); resto idéntico a cinc (prueba vs Defensa espiritual para ocultarlo, resistir con concentración = Inv. como 0, ≥6 Inv. → compañero kandra/koloss).

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Apatía aplastante | poder Alomancia de latón | 0 | 2 Inv.: objetivo a 0 concentración queda Aturdido mientras dure |
| Control de masas (compartido con cinc) | Alomancia 2; poder Alomancia de latón | 8 | Área hasta Colosal (9 m) |
| Influencia precisa (compartido con cinc) | Alomancia 3; talento Control de masas | 8 | Una acción menos; excluir objetivos |
| Manipulación sutil (compartido con cinc) | Perspicacia 3; talento Influencia precisa | 1 | Igual que en cinc |
| Aplacar la fatiga | Perspicacia 2; talento Apatía aplastante | * | 1/escena: en vez del efecto, aliados recuperan salud = Inv. y reducen Agotado |
| Calma profunda | Perspicacia 3; talento Aplacar la fatiga | * | Además pone fin a tantos efectos (Desorientado, Aturdido, Sorprendido, costes de concentración) como Inv. |

### 3.15 NICROSIL — L.207-208 / PDF 213-214 — Mejora – Externo – Empujón — Era 2 — **4 talentos**
Caminos: B, N. Acción: **Quemar nicrosil** — Act. **r**, instantánea, coste 1 Inv.; antes de que otro personaje en tu cercanía use/mantenga una capacidad Investida: provocas su estallido (gasta todos sus recursos relacionados, máximos forzados, dado de trama); prueba de Alomancia vs Defensa física si es reticente.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Nicroestallido proactivo | poder Alomancia de nicrosil | 1 | ≥1 Inv. (hasta el límite): estallido de tantas capacidades activas como Inv. |
| Estallido asistido | Alomancia 4; poder Alomancia de nicrosil | 8 | Al ayudar a un aliado, este no tira dado de trama |
| Agarre estallante | Atletismo 2 o Hurto 2; talento Nicroestallido proactivo | * | Tras prueba física con éxito, O o 2 concentración para usarlo sin tirada |
| Estallido inesperado | Sigilo 3; talento Agarre estallante | * | 1.ª vez por escena: desventaja al dado de trama del enemigo |

### 3.16 ORO — L.209-210 / PDF 215-216 — Temporal – Interno – Tirón — **2 talentos**
Caminos: B, N, NB. (La sección de talentos de oro **no lleva** el encabezado «Talentos de alomancia de oro» ni «presentados en orden alfabético»: solo la frase «Es posible desbloquear los siguientes talentos…».) Acción: **Quemar oro** — Act. 1, duración **1 escena**, ≥1 Inv. hasta el límite; creas tantas sombras de oro como Inv.; al tocar cada sombra por primera vez tiras dado de trama (O: +1 concentración y Concentrado; C: Desorientado; en blanco: nada); mantener como 0 con la misma Inv.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Aleación de uno mismo | Alomancia 3; poder Alomancia de oro | * | Renuncias a un descanso largo y gastas 1 Inv.: dado de trama (O = avanzas un hito de meta; C = Agotado [−1]) |
| Oportunidades doradas | Alomancia 4; poder Alomancia de oro | 8 | Cara en blanco cuenta como Oportunidad; Concentrado dura tantas rondas como rango |

### 3.17 PELTRE — L.211-212 / PDF 217-218 — Físico – Interno – Empujón — **6 talentos**
Caminos: B, N, NB. Acción: **Quemar peltre** — Act. 1, 1 ronda, ≥1 Inv. hasta el límite; **Mejorado [Velocidad] y [Fuerza]** con bono = mitad de la Inv. (redondeo arriba); ignoras la penalización de Agotado; mantener ≥1 Inv. como 0.

| Talento | Prerrequisito | Act. | Efecto (paráfrasis) |
|---------|---------------|------|---------------------|
| Revitalizar | Alomancia 2; poder Alomancia de peltre | 8 (ver §6: el texto habla de «acción gratuita») | 1 Inv.: recuperas 1d6 + rango de salud, incluso Inconsciente |
| Armamento de brazo de peltre | Armamento pesado 1 o Armamento ligero 1; poder Alomancia de peltre | * | Usa el dado de daño sin armas en ataques cuerpo a cuerpo con arma |
| Aguantar el arrastre | Alomancia 3; talento Revitalizar | * | A 0 de salud puedes ignorar Inconsciente; Agotado [−1] por cada daño |
| Pugilista ágil | Agilidad 1; talento Armamento de brazo de peltre | 8 | Usas Velocidad en vez de Fuerza para ataques sin armas, Agarrar y Empujar |
| Acometidas de arrastre | Alomancia 3; talento Armamento de brazo de peltre | 1 | Quedas Agotado [−1] para una Acometida adicional con la misma mano |
| Lanzador de peltre | talento Armamento de brazo de peltre | 8 | Armas con Arrojadiza [30/90]; aplicas Armamento de brazo de peltre a distancia |

### 3.18 Tabla resumen
| Metal | Libro | PDF | Acciones básicas (nombre, act.) | Talentos | Caminos que desbloquean |
|-------|-------|-----|---------------------------------|----------|-------------------------|
| Acero | 172-174 | 178-180 | Quemar acero (1); Empujón de acero (1) | 7 | B, N, NB |
| Aluminio | 175 | 181 | Quemar aluminio (1) | 0 | sin árbol |
| Atium | 176-178 | 182-184 | Tragar atium (1); Quemar atium (1) | 6 | B, NB |
| Bendaleo | 179-181 | 185-187 | Quemar bendaleo (2) | 5 | B, N |
| Bronce | 182-184 | 188-190 | Quemar bronce (1) | 6 | B, N, NB |
| Cadmio | 185-187 | 191-193 | Quemar cadmio (2) | 4 | B, N |
| Cinc | 188-190 | 194-196 | Quemar cinc (2) | 6 | B, N, NB |
| Cobre | 191-192 | 197-198 | Quemar cobre (1) | 4 | B, N, NB |
| Cromo | 193-194 | 199-200 | Quemar cromo (1) | 6 | B, N |
| Duraluminio | 195-196 | 201-202 | Quemar duraluminio (*) | 2 | B, N, NB |
| Electro | 197-198 | 203-204 | Quemar electro (1) | 6 | B, N, NB |
| Estaño | 199-200 | 205-206 | Quemar estaño (1) | 6 | B, N, NB |
| Hierro | 201-203 | 207-209 | Quemar hierro (1); Tirón de hierro (1) | 7 | B, N, NB |
| Latón | 204-206 | 210-212 | Quemar latón (2) | 6 | B, N, NB |
| Nicrosil | 207-208 | 213-214 | Quemar nicrosil (r) | 4 | B, N |
| Oro | 209-210 | 215-216 | Quemar oro (1) | 2 | B, N, NB |
| Peltre | 211-212 | 217-218 | Quemar peltre (1) | 6 | B, N, NB |
| **Total** | | | 20 acciones básicas | **83** | |

Acciones básicas = 17 «Quemar …» + Tragar atium + Empujón de acero + Tirón de hierro = 20.
Reparto de las 83 entradas por activación: **8 (siempre activo) 38; * (especial) 30; 1 (una acción) 7; r (reacción) 5; 0 (gratuita) 3; 2 acciones: 0; 3 acciones: 0.**
Los 7 talentos duplicados por nombre (regla «Talentos con nombres duplicados», L.75 / PDF 81: si ya tienes uno con ese nombre, lo tienes en todos los caminos): Prevenirse con palanca (acero, hierro); Burbuja ampliada, Burbuja espontánea, Burbuja expeditiva (bendaleo, cadmio); Control de masas, Influencia precisa, Manipulación sutil (cinc, latón). Texto idéntico en ambos; solo cambia el prerrequisito raíz («poder Alomancia de X» del metal respectivo).

## 4. Valores derivados de Alomancia y reglas de Investidura

### 4.1 Progresión de las artes metálicas (L.163 / PDF 169) — por grados en la habilidad Investida (Alomancia o Feruquimia)
| Grados | Límite de artes metálicas | Dado de artes metálicas | Alcance de artes metálicas |
|--------|---------------------------|-------------------------|---------------------------|
| 0 | 1 | 1 (sin tirada) | 3 m |
| 1 | 1 | d4 | 6 m |
| 2 | 2 | d6 | 12 m |
| 3 | 3 | d8 | 24 m |
| 4 | 4 | d10 | 48 m |
| 5 | 5 | d12 | 96 m |
| 6 o más* | igual al rango (sic) | d20 | 192 m |
*Solo superable (>5 grados) con hemalurgia u otros efectos especiales. «Igual al rango»: así se lee en la tabla (la columna «Límite» de 6+ dice «Igual al rango»); es raro que no diga «a los grados»; transcribir literalmente y anotar. **[inferido]** que el límite efectivo con ≥6 grados = rango del personaje. Fórmulas equivalentes para 0-5 grados: límite = máx(1, grados); alcance = 3 × 2^grados m; dado = d4→d12 (4, 6, 8, 10, 12 caras = 2 + 2×grados).
- **Límite** (L.163 / PDF 169): cantidad máxima de Investidura (o cargas, en feruquimia) que se puede invertir en un único efecto; mínimo 1.
- **Duración** (L.164 / PDF 170): «1 ronda» = hasta el final de tu próximo turno; «tantas rondas como grados» con mínimo 1; «1 escena» (oro); «instantánea». Fuera de combate 1 ronda ≈ 10 s (combate), 1 min (conversación), 1-10 min (empeño), 10 min (fuera de escena).
- **Mantener** (L.164 / PDF 170): antes de expirar, pagar el coste indicado (casi siempre como acción gratuita 0). Si el efecto menciona «Quemar», se aplica también al mantener, salvo que cite el nombre del poder en mayúsculas.
- **Portentoso** (brumoso, L.136 / PDF 142): +1 grado efectivo en Alomancia para el **alcance** de artes metálicas; mantener cuesta −1 Inv. (mín. 1).
- La mayoría de personajes no pasan de límite 5, por lo que no pueden traspasar nubes de cobre con ≥6 Inv. (L.191 / PDF 197).
- Mod. de habilidad de Alomancia = grados + Voluntad (L.128 / PDF 134). La hoja de artes metálicas recoge «mod., alcance, dado» por arte (L.404 / PDF 410); el **límite no tiene casilla propia** [inferido: se deduce de los grados].

### 4.2 Investidura (reglas)
| Concepto | Regla | Cita |
|----------|-------|------|
| Quién la tiene | Solo caminos brumoso, nacido de la bruma o nacidoble (alomancia). Otros caminos: campo en blanco. La reserva aparece al elegir el talento de ruptura/herencia nacidoble (L.129 / PDF 135) | L.26 / PDF 32; L.57 / PDF 63 |
| Máxima | **2 + máx(Discernimiento, Presencia) + bonificaciones/penalizaciones** | L.26 / PDF 32; L.57 / PDF 63 |
| Bonos conocidos | *Investido* (brumoso): + rango, y crece al subir rango; *Savantismo alomántico*: amplifica 2 Inv. al gastar | L.136 / PDF 142 |
| Actual al crear | **0** (hay que quemar metal para tener los primeros puntos) | L.26 / PDF 32 |
| Al empezar escena | Al **máximo** (se supone vial bebido o reservas en el estómago); si empiezas **Sorprendido**, solo **1** | L.129 / PDF 135 |
| Gasto | Para activar poderes y talentos; poderes con coste variable: hasta el límite de artes metálicas (gastar mucho = «avivar») | L.129 / PDF 135 |
| Mantener efectos | La Investidura **mantiene** efectos activos; a **0** quedas «no Investido» y no mantienes efectos más allá de su duración restante | L.129 / PDF 135 |
| Poder naciente (alomancia) | Requiere ≥1 Inv. y no estar Desprovisto de ese poder; la DJ puede pedir 1 Inv. | L.162 / PDF 168 |
| **Beber vial** | Acción **1**: si el vial contiene un metal que puedes quemar, recuperas Investidura **hasta el máximo**; quitas Desprovisto de los poderes cuyos metales estén en el vial y quedas **Desprovisto** de los poderes cuyos metales no estén | L.129 / PDF 135 |
| Metales de otras fuentes | Monedas, cubiertos, clavos: Beber vial con posible prueba; metales impuros: la DJ puede gastar C para 1d6 de daño vital por rango + Aturdido 3 rondas, hasta Inv. 0 o descanso largo | L.129-130 / PDF 135-136 |
| **Desprovisto** | Estado **por poder**, entre corchetes («Desprovisto [Oro]»), **acumulable** (varios poderes a la vez). Sin Investidura para ese poder, no cuenta como Investido, sin efectos nacientes. Se quita con Beber vial | L.310 / PDF 316 |
| Desprovisto de metal raro con Inv. sobrante | Opcional (DJ): anotar la Investidura remanente junto al estado; se ignora Desprovisto para ese metal hasta gastarla | L.131 / PDF 137 |
| Viales comunes | Los 8 metales físicos y mentales: la DJ supone suministro suficiente; vial = mezcla cualquiera sin coste | L.130 / PDF 136; L.267 / PDF 273 |
| Viales raros | Mejora, temporales, divinos: **registro individual de cada vial**, salvo suministro recurrente (recompensa, cap. 8). El vial raro se da por contener los comunes que quiera el alomante. En descanso corto/largo se mezclan o separan viales | L.130 / PDF 136; L.267 / PDF 273 |
| **Atium** | **Cuentas** aparte, **no** dan Investidura: Tragar atium (1 acción) y Quemar atium (1 cuenta, duración = grados). 150 ar/cuenta en Era 1, no disponible en Era 2 | L.176-177 / PDF 182-183 |
| Aluminio | Quemarlo pone Investidura a 0 y te deja Desprovisto de tus otros poderes mientras dure (aunque Bebas) | L.175 / PDF 181 |
| Duraluminio/nicrosil | Estallido: gasta **toda** la Investidura restante (o el recurso del objetivo) | L.195, L.207 / PDF 201, 213 |
| Meta de poder | Alomancia: «Entrenar tu(s) poder(es)» (3 hitos, ×2 de ritmo con mentor); hasta completarla solo versión naciente; el atium no la necesita | L.132-133 / PDF 138-139 |
| Descubrimiento al azar | d20 → camino (tabla L.129 / PDF 135) y d20 → metal de brumoso (L.134 / PDF 140, re-tirar si no está en la era) | |

Resumen de estado de personaje implicado: `investidura{max, actual}`, `desprovisto: string[]` (ids de poder), `viales: {metal → n}` solo para raros, `cuentasAtium: n`, por poder `{estado: naciente|completo, meta{hitos 0-3, completada}}`.

### 4.3 Disponibilidad por era del camino (L.372 / PDF 378)
| Camino (era) | Metales disponibles |
|--------------|---------------------|
| Feruquimista y nacido de la bruma (Era 1) | acero, atium, bronce, cinc, cobre, estaño, hierro, latón, oro, peltre* |
| Brumoso (Era 1) | acero, atium, bronce, cinc, cobre, estaño, hierro, latón, peltre* (sin oro) |
| Brumoso, ferrin y nacidoble (Era 2) | acero, aluminio, bendaleo, bronce, cadmio, cinc, cobre, cromo, duraluminio, electro, estaño, hierro, latón, nicrosil, oro, peltre (sin atium) |

## 5. Borrador de tipos

### 5.1 TypeScript (datos estáticos, `src/data/` según la convención del proyecto; compatible con el `Talento` y `ActivationType` actuales)
```ts
import type { ActivationType } from '../components/TalentActivation'

export type MetalId =
  | 'hierro' | 'acero' | 'estano' | 'peltre' | 'cinc' | 'laton' | 'cobre' | 'bronce'
  | 'cromo' | 'nicrosil' | 'aluminio' | 'duraluminio' | 'cadmio' | 'bendaleo' | 'oro' | 'electro'
  | 'atium'                                   // divino representado; malatium/lerasium/armonium/trellium no son jugables

export type CategoriaMetal = 'fisico' | 'mental' | 'mejora' | 'temporal' | 'divino'
export type EraMetal = 'ambas' | 'era1' | 'era2'
export type CaminoMetalId = 'brumoso' | 'nacido-de-la-bruma' | 'nacidoble'   // los que desbloquean alomancia

export interface DuracionPoder {
  tipo: 'instantanea' | 'rondas' | 'rondas-por-grado' | 'escena'
  rondas?: number                             // si tipo === 'rondas' (todas son 1 ronda = hasta fin del próximo turno)
}
export type CostePoder =
  | { tipo: 'ninguno'; minInvestidura: 1 }                    // Quemar acero/hierro: gratis si tienes >=1 Inv.
  | { tipo: 'investidura-variable'; min: 1; tope: 'limite-artes-metalicas' }
  | { tipo: 'investidura-fijo'; cantidad: number }            // cobre, cromo, nicrosil, aluminio
  | { tipo: 'cuenta-atium'; cantidad: 1 }
  | { tipo: 'toda-restante' }                                 // duraluminio

export interface AccionPoder {
  id: string                                  // 'quemar-acero', 'empujon-de-acero', 'tragar-atium'…
  nombre: string                              // tal como el libro: «Quemar acero»
  activacion: ActivationType                  // 1/2 acciones, 0, r, *  (NUNCA 'passive' en acciones base)
  duracion: DuracionPoder
  coste: CostePoder
  mantener: 'mismo-coste-gratuita' | 'coste-indicado-gratuita' | 'no-aplica'
  resumen: string
  opciones?: { nombre: string; resumen: string }[]            // Propulsar / Lanzar una moneda / Choque violento
}

export interface UsoCreativo { nombre: string; texto: string }

export interface PoderAlomantico {
  id: MetalId
  metal: string                               // 'Acero'
  titulo: string                              // 'Alomancia de acero'
  paginaLibro: number; paginaPdf: number      // 172 / 178
  categoria: CategoriaMetal
  lado: 'externo' | 'interno' | null          // null en divinos
  impulso: 'tiron' | 'empujon' | null         // puro = tirón; aleación = empujón
  efecto: string                              // columna «Efecto» de la tabla de metales
  nombreBrumoso: string                       // 'Lanzamonedas'
  metalEmparejado: MetalId | null
  era: EraMetal
  conocidoFinEra1?: boolean                   // marca ‡: aluminio, duraluminio, electro, oro
  rareza: 'comun' | 'raro'                    // comun = físicos+mentales; raro = mejora+temporal+divino
  usaCuentas?: boolean                        // atium: cuentas en vez de Investidura
  tieneVersionNaciente: boolean               // false solo atium
  ejemploNaciente?: string                    // solo bendaleo, cinc, cobre, cromo, estaño, hierro (L.162)
  acciones: AccionPoder[]
  usosCreativos: UsoCreativo[]
  desbloqueadoPor: CaminoMetalId[]            // [] en aluminio (sin árbol)
  talentos: string[]                          // ids de TalentoDeMetal (orden de árbol); [] en aluminio
}

export type PrereqMetal =
  | { tipo: 'poder'; metales: MetalId[] }                     // «poder Alomancia de X»; varios si el talento es compartido (any-of)
  | { tipo: 'grados'; habilidad: 'Alomancia'; min: number }
  | { tipo: 'habilidad'; opciones: { habilidad: string; min: number }[] }   // OR de habilidades
  | { tipo: 'talento'; opciones: string[] }                   // OR de talentos
  | { tipo: 'otrosPoderes'; cantidad: 1 | 2 }                 // duraluminio
  | { tipo: 'equipo'; texto: string }                         // Equipo de atraedor

export interface TalentoDeMetal {                             // extiende la forma del `Talento` actual
  id: string                                  // slug del nombre: 'prevenirse-con-palanca'
  name: string
  cost: ActivationType                        // 'action1' | 'free' | 'reaction' | 'special' | 'passive'
  prereq: string                              // texto del libro, p. ej. 'Alomancia 3 o más; talento Prevenirse con palanca'
  prereqs: PrereqMetal[]                      // AND entre elementos
  poderes: MetalId[]                          // un talento compartido lista dos metales
  raiz: boolean                               // true si solo exige el poder (32 en total)
  description: string
  resumen?: string                            // línea del diagrama
  notaLibro?: string                          // discrepancias texto/diagrama (ver §6)
}
```

### 5.2 Tabla de progresión (constante) y estado por personaje
```ts
export const PROGRESION_ARTES_METALICAS: Record<0|1|2|3|4|5|6, { limite: number | 'rango'; dado: 1 | 4 | 6 | 8 | 10 | 12 | 20; alcance: number }> = {
  0: { limite: 1, dado: 1, alcance: 3 },  1: { limite: 1, dado: 4, alcance: 6 },
  2: { limite: 2, dado: 6, alcance: 12 }, 3: { limite: 3, dado: 8, alcance: 24 },
  4: { limite: 4, dado: 10, alcance: 48 }, 5: { limite: 5, dado: 12, alcance: 96 },
  6: { limite: 'rango', dado: 20, alcance: 192 },   // «6 o más»
}

export interface PoderMetalicoPersonaje {             // estado, NO dato estático
  arte: 'alomancia' | 'feruquimia'
  metal: MetalId
  estado: 'naciente' | 'completo'                     // completo = meta completada (atium: siempre completo)
  meta?: { hitos: 0 | 1 | 2 | 3; completada: boolean }
  viales?: number                                     // solo metales raros alománticos
}
```

### 5.3 Equivalente C# (solo estado por personaje; los datos estáticos viven en el frontend, ver `web/CLAUDE.md`) [inferido]
Siguiendo el patrón actual de `Characters.Talentos` (texto JSON, `api_map.md` L.122/L.192) en lugar de tablas nuevas:
```csharp
public record PoderMetalicoDto(
    string Arte,        // "alomancia" | "feruquimia"
    string Metal,       // "acero", "atium"… (mismo id que el TS)
    string Estado,      // "naciente" | "completo"
    int HitosMeta,      // 0..3
    bool MetaCompletada,
    int? Viales);       // solo raros

// Columnas candidatas en Character (todas texto JSON, default "[]"/"{}"/0):
//   PoderesMetalicos  string  -> List<PoderMetalicoDto>
//   Desprovisto       string  -> ["oro","cobre"]      (ids de poder)
//   CuentasAtium      int
//   InvestiduraActual int     (el máximo se calcula: 2 + max(Discernimiento, Presencia) + bonos)
```
El motor de reglas del servidor (`TalentosReglas.cs`, clave = nombre del talento) solo necesita de la alomancia: `Investido` (+rango a la Investidura máx., ya existe una entrada con ese nombre en las Tormentas, con otro texto) y, opcional, `Portentoso`. Ningún talento de los árboles de metal modifica stats permanentes (§0).

## 6. Dudas, discrepancias y puntos [inferido] (para decidir antes de transcribir)
1. **Revitalizar (peltre)**: `Activación: 8` (siempre activo) en el texto, pero la regla dice «puedes usar esta acción gratuita incluso si estás Inconsciente». Probable errata de icono (0 vs 8) o texto descuidado; guardar `passive` con `notaLibro` y revisar en el PDF.
2. **Manipulación sutil (cinc)**: la extracción da `Activación: [1 action]` en vez de `1`; es el mismo talento que en latón (Act. 1). Usar `action1`.
3. **Ráfaga de monedas (acero)**: prerrequisito impreso «Alomancia de acero» sin «poder»; normalizar a `poder Alomancia de acero`.
4. **Enhaciendo el no ver (estaño)**: nombre impreso así en texto y diagrama (parece errata de «Enfocando»/«Haciendo»); conservar tal cual y anotar.
5. **Diagrama vs texto**: los diagramas abrevian prerrequisitos y omitían líneas de talento; casos verificados: Hiperdrenaje (diagrama sin prerrequisito, texto «talento Agarre drenante o talento Drenaje reactivo»), Búsqueda constante (diagrama «Alomancia 2», texto añade «talento Buscador distante»), Precisión de estaño y Equipo de atraedor (el diagrama omite el talento requerido), Arreglo apresurado (diagrama «Alomancia 3», texto añade «talento Burbuja ampliada»), Estaño: Sensibilidad proactiva→Enhaciendo el no ver. **Regla: manda el texto del talento.**
6. **Nacido de la bruma y metales Era 2 ‡**: los árboles de **duraluminio y electro** declaran «brumoso, nacidoble y nacido de la bruma», pero la tabla L.372 / PDF 378 no lista esos metales para nacido de la bruma (Era 1) salvo por el asterisco «a finales de la Era 1 …», que además está **mal colocado** (sobre «peltre*»). Interpretación **[inferido]**: el nacido de la bruma de fin de Era 1 sí los tiene (aluminio incluido: sin árbol). Dejar la disponibilidad como regla de campaña (era + «fin de Era 1»), no como dato rígido.
7. **Aluminio**: sin sección de talentos ni frase de caminos. En Era 2 es elegible como poder (L.372). Marcar `talentos: []`, `desbloqueadoPor: []`.
8. **Atium**: el árbol se desbloquea solo por brumoso y nacido de la bruma (no nacidoble). El libro lo trata como metal «divino» Era 1; el nacidoble es Era 2 (consistente).
9. **Columnas de las tablas L.168 / L.171**: filas **[inferido]** por posición (el texto extraído desordena columnas). Contrastadas con subtítulos y con la tabla de descubrimiento L.134; no hay contradicciones. La imagen de la tabla de viales (L.267) sí se comprobó visualmente.
10. **Límite de artes metálicas con 6+ grados**: la tabla dice «Igual al rango»; en el resto del texto el límite = grados. Transcribir tal cual.
11. **Número de acciones**: el libro usa 1, 2 y 3 acciones como iconos distintos (leyenda L.137 / PDF 143). En el texto extraído «Activación: 1/2» conserva el número; solo los activadores 1 y 2 aparecen (nunca 3) en las entradas de alomancia.
12. **Hoja de artes metálicas** (L.404 / PDF 410): por cada poder, campos «efecto», «meta de nacido del metal», «completada», «cargas/viales», «talentos», más cabecera por arte «mod. / alcance / dado». El texto muestra 4 bloques repetidos → 4 casillas de poder por hoja **[inferido]** (no se vio la imagen). Un personaje nacido de la bruma tiene hasta 10-11 poderes, así que el modelo de datos no debe limitar a 4.
13. **Hemalurgia** (L.251) y **feruquimia** quedan fuera de este informe, salvo la tabla de metales (§1.3) por compartir ids.
14. **Trabajo en curso de otra sesión** (formas de cantor: `CharacterService.cs`, `TalentosReglas.cs`, `CharacterResponse.cs`, `FormasCantor.cs`): este borrador no toca esos archivos; las columnas de §5.3 son una propuesta a decidir en la especificación general.

## 7. Cuenta total
- **Entradas de poder de alomancia: 17** (16 metales + atium); con árbol: 16.
- **Talentos de alomancia (entradas por metal): 83**; **talentos distintos por nombre: 76**.
- Raíces (prerrequisito = el poder): **32** (2 por metal con árbol).
- Por metal: acero 7, aluminio 0, atium 6, bendaleo 5, bronce 6, cadmio 4, cinc 6, cobre 4, cromo 6, duraluminio 2, electro 6, estaño 6, hierro 7, latón 6, nicrosil 4, oro 2, peltre 6 = 83.
- Acciones básicas: 20 (17 «Quemar», Tragar atium, Empujón de acero, Tirón de hierro).
- Metales jugables en alomancia: 16 comunes/raros + atium (17); no representados: malatium, lerasium (y aleaciones), armonium, trellium.
