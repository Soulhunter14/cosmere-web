# Inventario exacto: feruquimia, hemalurgia y caminos de nacido del metal (Nacidos de la bruma)
Fuente: manual «Nacidos de la bruma» (JdR del Cosmere), texto extraído en `mistborn_flow.txt`.
Convención de páginas: **PÁGINA PDF = PÁGINA DEL LIBRO + 6**; se cita «L.<libro> / PDF <pdf>».
Todo lo marcado [inferido] no está dicho literalmente por el libro. Lo no marcado está verificado leyendo el texto.

Rangos leídos íntegros: cap. 5 L.127-160 (PDF 133-166), feruquimia L.213-250 (PDF 219-256), hemalurgia L.251-252 (PDF 257-258),
cap. 8 L.281-298 (PDF 287-304), más apoyo en cap. 6 L.161-171 (PDF 167-177), cap. 7 L.253-277 (mentes de metal, PDF 259, 282-283),
cap. 9 descanso (PDF 313), cap. 13 eras (PDF 376-378), hoja de personaje (PDF 408-410) e índice (PDF 395-406).

---

## 0. Resumen en 12 líneas
1. Hay **17 poderes feruquímicos** (16 metales + atium). Cada uno = 2 acciones (Almacenar X / Decantar X) + «Usos creativos» + árbol de talentos.
2. **Nicrosil feruquímico (L.246) NO tiene árbol de talentos** (0 talentos); todos los demás sí (2 a 6 talentos).
3. **85 talentos de poder feruquímico** (84 nombres únicos: «Reflejos acelerados» está en acero y en cinc). Solo 3 nombres se comparten con alomancia.
4. Los 5 caminos de nacido del metal suman **38 talentos** (5 principales + 33 de árbol; 19 nombres únicos de árbol, porque 7 se repiten en varios caminos).
5. Las **mentes de metal** tienen cargas: máx = **2 + grados en Feruquimia** (+ rango con «Mentes de metal ampliadas»); **una reserva por metal**, aunque tengas varias piezas.
6. Una mente con ≥1 carga es un **objeto Investido** (L.131, L.253).
7. La **hemalurgia no es un camino**: es **recompensa** (clavos ya cargados + pericia Hemalurgo). Máx. clavos = rango (tope 3). Cada clavo baja la Defensa espiritual.
8. Los 5 caminos son **mutuamente excluyentes** (L.127). Principal de cada uno: Ruptura de brumoso, Ruptura de nacido de la bruma, Herencia feruquímica, Herencia ferrin, Herencia nacidoble.
9. El poder **solo es «naciente»** hasta completar su meta de nacido del metal («Entrenar tu poder» / «Fabricar tu mente de metal»); sin ella **no se pueden elegir talentos del poder** (L.132, L.172).
10. Cada hoja de personaje tiene una **Hoja de artes metálicas** (PDF 410 / L.404): por poder: efecto, mod., alcance, dado, meta de nacido del metal, completada, cargas/viales, talentos.
11. **Glifos de activación**: en el texto extraído `1`,`2`,`3` = 1/2/3 acciones; `0` = acción gratuita; `r` = reacción; `*` = activación especial; `8` = siempre activo (∞). Coincide con `ActivationType` de `cosmere-web/src/components/TalentActivation.tsx:9` y con `cantores.ts:18` (donde `passive` = ∞).
12. La PDF 258 (L.252) **no tiene texto extraíble** (probablemente ilustración); toda la regla de hemalurgia jugable está en cap. 8.

---

## 1. Estructura de una entrada de poder feruquímico (verificada en las 17 entradas)
### 1.1 Anatomía (L.166 «Anatomía de un poder», PDF 172; confirmada entrada a entrada)
Orden fijo de cada entrada «FERUQUIMIA DE X»:

| # | Bloque | Contenido | Verificado en |
|---|--------|-----------|---------------|
| 1 | Título | «FERUQUIMIA DE X» (mayúsculas) | 17/17 |
| 2 | Subtítulo | `Rasgo – Metal <categoría>` (físico/cognitivo/espiritual/híbrido/divino). **Etiqueta de era** («Era 1»/«Era 2») solo en atium (E1), bendaleo, cadmio, cromo, nicrosil (E2). El resto sin etiqueta. | 17/17 |
| 3 | Prosa | Descripción, nombre coloquial del ferrin («mensajeros de acero», «susurravientos»…), a veces recuadros: «Atium auténtico» (L.218), «Consejo para la DJ» canon de bendaleo (L.220) y estaño (L.239), «La feruquimia de latón y los pueblos del sur» (L.243), «La feruquimia de cobre y el pueblo terrisano» (L.228), «Fortuna, que no suerte» (L.232), «Elección del nicrosil como ferrin» (L.246) | 17/17 |
| 4 | Acción **Almacenar X** | `Activación: 1  Duración: <cuánto para ganar 1 carga>`. Texto: «Almacenas X hasta que pones fin al efecto como 0 (o hasta que gastas una carga de la mente)». Lista `◆` de **efectos mientras almacenas** (casi siempre un perjuicio). Regla de **ganancia de cargas** («tras cada escena en la que hayas almacenado durante toda su duración, añades 1 carga a la mente»). | 17/17 |
| 5 | Acción **Decantar X** | `Activación: 1  Duración: tantas rondas como grados tengas en Feruquimia` (o instantánea). «Gastas 1 carga de la mente…» (o N cargas). Lista `◆` de **efectos mientras decantas** (beneficio). Cláusula fija: «Antes de que termine la decantación, puedes mantenerla durante la misma duración gastando 1 carga de la mente como 0». | 17/17 (la cláusula no está en bendaleo, bronce, cobre: son instantáneas) |
| 6 | «Uso de la feruquimia de X» → «Usos creativos» | 2-3 ideas con nombre en negrita (no son reglas cerradas; la DJ las resuelve) | 17/17 (nicrosil y aluminio: texto genérico) |
| 7 | «Talentos de feruquimia de X» | Frase fija: «Los talentos siguientes, presentados en orden alfabético, aparecen en el árbol… Es posible desbloquear este árbol mediante el talento principal de los caminos de **[lista]**, o a través de un clavo hemalúrgico.» Después cada talento: `Nombre / Prerrequisito: … / Activación: … / texto`. | 16/17 (nicrosil: sin bloque) |
| 8 | Diagrama resumen | Recuadro «FERUQUIMIA DE X» con cada talento en 1-2 líneas y su glifo de activación delante. Es el diagrama del árbol (la **geometría** solo está en la imagen; el texto extraído da el orden de lectura). | 16/17 |

**Ausencias comprobadas:** no hay «tabla por grados» propia salvo **cobre** (tabla Grados→duración de la vivencia, L.228); lo demás usa la tabla global «Progresión de las artes metálicas» (L.163). No hay «meta» ni «mentes» descritas dentro de la entrada: la meta y las mentes se definen en cap. 5 (L.131-133) y cap. 7 (L.276-277). La entrada **no** lista Investidura (la feruquimia no la usa, L.131).

### 1.2 Reglas globales que alimentan todas las entradas (cap. 6, L.162-165 / PDF 168-171)
| Regla | Contenido | Pág. |
|-------|-----------|------|
| Poder naciente | Antes de completar la meta solo efectos narrativos menores (4 vías: elección consciente [Usar una habilidad con Feruquimia], esfuerzo instintivo [gastar O], activación accidental [Complicación], práctica controlada). Feruquimia naciente: solo mientras **tocas un objeto con mucha concentración del metal**; **no** da cargas ni almacena/decanta. Ejemplos nacientes en tabla para bendaleo, cobre, cromo, hierro, latón, oro, peltre | L.162 / PDF 168 |
| **Límite de artes metálicas** | Cargas máximas que puedes gastar en un único efecto = grados en Feruquimia (mín. 1) | L.163 / PDF 169 |
| **Dado de artes metálicas** | d4/d6/d8/d10/d12/d20 según grados (daño de «Palma abrasadora», «Golpe vigoroso», curación de oro/bendaleo) | L.163 |
| **Alcance de artes metálicas** | 3/6/12/24/48/96/192 m según grados (afecta «Precisión de estaño», «Horno viviente», etc.) | L.163 |
| Duración | «hasta fin de tu próximo turno» o «tantas rondas como grados» (mín. 1). 1 ronda = fin de tu siguiente turno (combate) / ~1 min (conversación) / contribución (empeño) / ~10 min (fuera de escena) | L.164-165 |
| Mantener | Se paga el mismo coste «como 0» antes de que expire | L.164 |
| Duración de acciones de Almacenar | Se gana el recurso por tiempo transcurrido; si se interrumpe brevemente la DJ puede perdonarlo; normalmente al final de cada escena completa | L.164 |
| Poder = acciones básicas + efectos/acciones de sus talentos | Una regla que dice «tu poder» incluye los talentos | L.161 |

**Tabla «Progresión de las artes metálicas» (L.163 / PDF 169), reconstruida del texto desordenado:**

| Grados (Alomancia/Feruquimia) | 0 | 1 | 2 | 3 | 4 | 5 | 6 o más* |
|---|---|---|---|---|---|---|---|
| Límite de artes metálicas | 1 | 1 | 2 | 3 | 4 | 5 | = rango |
| Dado de artes metálicas | «1 (sin tirada)» | d4 | d6 | d8 | d10 | d12 | d20 |
| Alcance de artes metálicas | 3 m | 6 m | 12 m | 24 m | 48 m | 96 m | 192 m |

*«Solo es posible superar los 5 grados mediante la hemalurgia u otros efectos especiales» (L.163). La columna de grado 0 existe, pero un PJ empieza con 1 grado [inferido de que el principal da «1 grado inicial»].

### 1.3 Variantes de la estructura detectadas (importan para el esquema)
- **Duración de Almacenar** no siempre es «1 carga por escena»: atium «1 carga por categoría de edad y por escena» (L.218), bendaleo «1 carga por cada día de comida o bebida» (L.220), bronce «1 carga o más por descanso» (corto +1; largo +grados) (L.222), cobre «instantánea» (+1 carga por vivencia guardada; duración máx. según grados) (L.228), oro «1 carga por escena» **+ 1 carga por cada uso restante de Recuperarse al final de escena** (L.247).
- **Cargas con vínculo**: cobre (qué vivencia o pericia), bendaleo con talentos (qué medicina/veneno), nicrosil (qué capacidad Investida). El libro dice «anota qué X está vinculada a dicha carga» (L.228, L.221, L.246). → el modelo necesita `cargas` con etiqueta opcional.
- **Decantar** puede costar N cargas hasta el límite (talentos «auténtico/crítica/indexada»: Carrera de acero auténtica, Chispa auténtica, Quintaesencia inamovible, Nexo de Fortuna, Vínculo auténtico, Resolución inquebrantable, Susurros del viento auténticos, Masa crítica, Culturista, Horno viviente, Siesta reparadora, Oxigenación potenciada, Impulso de energía, Mentecobre indexada, Sanación acelerada).
- **Estaño**: «Al principio, este poder solo permite guardar un único sentido a la vez» (L.238); «Almacenamiento multisensorial» sube a tantos sentidos como el **rango** (carga independiente por sentido).

## 2. Inventario por metal (los 17 poderes feruquímicos)
### 2.1 Tabla maestra
Fuente: entradas L.213-250 + tabla «Metales en la feruquimia» (L.169-171 / PDF 175-177, reconstruida del texto por columnas) + frase de desbloqueo de cada entrada.
Pág. = libro (L.) y PDF. Cat. = categoría feruquímica. Ferrin = nombre coloquial. Par = metal emparejado; «(P)»/«(A)» indica si el metal **de esa fila** es puro o aleación. «Desbloquea» = caminos que dan acceso al árbol (todos además «o a través de un clavo hemalúrgico»). F=feruquimista, Fe=ferrin, N=nacidoble.

| Metal (id) | Pág. L. / PDF | Rasgo | Cat. | Era (entrada / tabla L.171) | Ferrin | Par | Desbloquea | Talentos |
|---|---|---|---|---|---|---|---|---|
| Acero | 213-215 / 219-221 | Velocidad (física) | físico | sin etiqueta / ambas | mensajero de acero | Hierro (A) | F, Fe, N | 6 |
| Aluminio | 216-217 / 222-223 | Identidad | espiritual | sin etiqueta / Era 2† | genuino | Duraluminio (P) [inferido P/A] | F, Fe, N | 3 |
| Atium | 218-219 / 224-225 | Juventud | divino | **Era 1** / Era 1 | cronodevanador | n/a | **solo F** | 2 |
| Bendaleo | 220-221 / 226-227 | Nutrición (e hidratación) | híbrido | **Era 2** / Era 2 | incorporador | Cadmio (A) | **solo Fe, N** | 5 |
| Bronce | 222-223 / 228-229 | Desvelo | cognitivo | sin etiqueta / ambas | centinela | Cobre (A) | F, Fe, N | 5 |
| Cadmio | 224-225 / 230-231 | Aliento | híbrido | **Era 2** / Era 2 | resollante | Bendaleo (P) | **solo Fe, N** | 5 |
| Cinc | 226-227 / 232-233 | Velocidad mental | cognitivo | sin etiqueta / ambas | chispeante | Latón (P) | F, Fe, N | 6 |
| Cobre | 228-230 / 234-236 | Recuerdos | cognitivo | sin etiqueta / ambas | archivero | Bronce (P) | F, Fe, N | 6 |
| Cromo | 231-233 / 237-239 | Fortuna (espiritual) | espiritual | **Era 2** / Era 2 | hilador | Nicrosil (P) | **solo Fe, N** | 6 |
| Duraluminio | 234-235 / 240-241 | Conexión (espiritual) | espiritual | sin etiqueta / Era 2† | conector | Aluminio (A) | F, Fe, N | 5 |
| Electro | 236-237 / 242-243 | Determinación | híbrido | sin etiqueta / Era 2† | pináculo | Oro (A) | F, Fe, N | 6 |
| Estaño | 238-240 / 244-246 | Sentidos | físico | sin etiqueta / ambas | susurravientos | Peltre (A) | F, Fe, N | 6 |
| Hierro | 241-242 / 247-248 | Peso | físico | sin etiqueta / ambas | ajustador | Acero (P) | F, Fe, N | 6 |
| Latón | 243-245 / 249-251 | Calor | cognitivo | sin etiqueta / ambas | alma de fuego | Cinc (A) | F, Fe, N | 6 |
| Nicrosil | 246 / 252 | Investidura (capacidad Investida) | espiritual | **Era 2** / Era 2 | portaalmas | Cromo (A) | **sin frase de desbloqueo y sin árbol** | **0** |
| Oro | 247-248 / 253-254 | Salud | híbrido | sin etiqueta / ambas (L.167) | hacedor de sangre | Electro (P) | F, Fe, N | 6 |
| Peltre | 249-250 / 255-256 | Fuerza (física) | físico | sin etiqueta / ambas | bruto | Estaño (P) | F, Fe, N | 6 |

† «A finales de la Era 1 el aluminio, el duraluminio y el electro dejan de ser un secreto del Ministerio de Acero» (L.167, L.372). Era del oro: «ambas» (L.167: «El oro también está disponible [en ambas eras]»).
La columna Par/P/A se deduce del orden de la tabla L.171 (texto por columnas): pares puro↔aleación = Hierro(P)↔Acero(A), Estaño↔Peltre, Cinc↔Latón, Cobre↔Bronce, Cromo↔Nicrosil, Aluminio↔Duraluminio, Cadmio↔Bendaleo, Oro↔Electro; Atium sin par. [inferido el sentido P/A de la fila; los pares son seguros porque coinciden con el sentido de las entradas de metal].

**Categorías (L.169-171):** físicos = hierro, acero, estaño, peltre · cognitivos = cinc, latón, cobre, bronce · espirituales = aluminio, cromo, duraluminio, nicrosil · híbridos = cadmio, bendaleo, oro, electro · divino = atium (más malatium, lerasium, aleaciones de lerasium, armonium, trellium: «Desconocido/no aparece en este libro»). Metales comunes (siempre disponibles): físicos y cognitivos (8). Metales raros: espirituales, híbridos, divinos.

**Metales elegibles por camino y era (cap. 13, L.372 / PDF 378):**
| Camino(s) | Era | Metales disponibles |
|---|---|---|
| Feruquimista y nacido de la bruma | 1 | acero, atium, bronce, cinc, cobre, estaño, hierro, latón, oro, peltre* |
| Brumoso | 1 | acero, atium, bronce, cinc, cobre, estaño, hierro, latón, peltre* (sin oro) |
| Brumoso, ferrin y nacidoble | 2 | acero, aluminio, bendaleo, bronce, cadmio, cinc, cobre, cromo, duraluminio, electro, estaño, hierro, latón, nicrosil, oro, peltre (16; **sin atium**) |
*Nota L.372: a finales de la Era 1 aluminio, duraluminio y electro dejan de ser secreto (oro/brumosos de oro también). [inferido] En Era 1 tardía la DJ puede abrirlos.

### 2.2 Acciones Almacenar / Decantar (las 34 acciones básicas)
Todas: **Activación 1** (1 acción), se corta con una 0, y Decantar se mantiene con «1 carga como 0» salvo las instantáneas. «g» = grados en Feruquimia.

| Metal | Almacenar: nombre · ganancia de cargas | Efectos mientras almacenas | Decantar: nombre · duración · coste | Efectos mientras decantas |
|---|---|---|---|---|
| Acero | Almacenar velocidad · 1/escena | Mermado [Velocidad −1]; solo 1 Moverse por turno | Decantar velocidad · g rondas · 1 carga | Mejorado [Velocidad +2]; 1 Moverse gratuito por turno |
| Aluminio | Almacenar Identidad · 1/escena | resistir influencia +1 concentración; **Defensa espiritual −2** | Decantar Identidad · g rondas · 1 carga | resistir cuesta −2 concentración; **Defensa espiritual +4** |
| Atium | Almacenar juventud · 1 carga por categoría de edad que superes, por escena (5 categorías: muy joven, joven, maduro, anciano, muy anciano) | envejeces físicamente a la categoría elegida (> cronológica) | Decantar juventud · g rondas · ≥1 cargas, **ignora el límite** | rejuveneces tantas categorías como cargas (mín. muy joven); cambia de tamaño |
| Bendaleo | Almacenar nutrición · 1 por cada día de comida/bebida consumido (~1 min narrativo) | comes sin saciarte ni cubrir necesidades | Decantar nutrición · instantánea · 1 carga | alimentado e hidratado (1 día); si Agotado, penalización −2 |
| Bronce | Almacenar desvelo · tras descanso corto +1; tras largo +g (solo si el descanso se pasa almacenando) | somnolencia; descansos pasan a «sueño profundo» Inconsciente | Decantar desvelo · instantánea · 1 carga (o 2 cargas «gratis» para simular descanso largo) | recuperas salud/concentración como descanso corto |
| Cadmio | Almacenar aliento · 1/escena | turno rápido cuesta 1 concentración; otras capacidades +1 concentración | Decantar aliento · g rondas · 1 carga | no necesitas respirar; reacciones/gratuitas −1 concentración |
| Cinc | Almacenar velocidad mental · 1/escena | Mermado [Intelecto −1]; Prepararse +1 acción; Intelecto en Obtener ventaja/Usar habilidad +1 acción | Decantar velocidad mental · g rondas · 1 carga | Mejorado [Intelecto +2]; 1 acción gratuita de Prepararse/Obtener ventaja/Usar habilidad con Intelecto |
| Cobre | Almacenar recuerdos · instantánea; +1 carga por vivencia; tope de duración por grados (ver tabla abajo); olvidas la vivencia | (olvidas el recuerdo) | Decantar recuerdos · instantánea · 1 carga | rememoras la vivencia vinculada con nitidez; extraer detalles (prueba) |
| Cromo | Almacenar Fortuna · 1/escena; +1 carga por cada O/C ignorada | no puedes subir la apuesta; O/C (20 nat/1 nat/Resuelto) se ignoran y dan +1 carga | Decantar Fortuna · g rondas · 1 carga | repites dado de trama en cara en blanco; rangos de Oportunidad/Complicación +2 |
| Duraluminio | Almacenar Conexión · 1/escena | Mermado [Presencia −1]; no cuentas como aliado de efectos que afectan a aliados | Decantar Conexión · g rondas · 1 carga | Mejorado [Presencia +2]; conoces el idioma nativo de un personaje/asentamiento |
| Electro | Almacenar determinación · 1/escena; +1 carga extra la 1.ª vez por escena que pierdes Resuelto | Mermado [Voluntad −1]; pierdes Resuelto y no puedes recuperarlo | Decantar determinación · g rondas · 1 carga | Mejorado [Voluntad +2]; el que falla en influirte pierde 1 concentración |
| Estaño | Almacenar sentido · 1/escena (por sentido) | Mermado [Discernimiento −1]; desventaja en pruebas del sentido almacenado | Decantar sentido · g rondas · 1 carga (por sentido) | Mejorado [Discernimiento +2]; ventaja en pruebas no-ataque del sentido; sentido sobrenatural |
| Hierro | Almacenar peso · 1/escena | peso a la mitad; tamaño menor; sin daño por caída; ataques cuerpo a cuerpo en tu contra con ventaja; desplazamientos ×2 | Decantar peso · g rondas · 1 carga | peso ×2; tamaño mayor; tus ataques cuerpo a cuerpo con ventaja; puedes reducir desplazamientos |
| Latón | Almacenar calor · 1/escena | temperatura baja; resistes calor, sufres frío; daño por energía −rango | Decantar calor · g rondas · 1 carga | temperatura alta; resistes frío; daño por energía +rango; 0: daño de energía = mod. Feruquimia al contacto |
| Nicrosil | Almacenar Investidura · 1/escena (anotar a qué capacidad se vincula la carga) | tienes **1 grado menos** en la habilidad Investida de ese poder (solo para él) | Decantar Investidura · g rondas · 1 carga de la capacidad vinculada | **+2 grados** en esa habilidad Investida para ese poder |
| Oro | Almacenar salud · 1/escena **+ 1 por cada uso restante de Recuperarse al final de escena** | 1d4 daño vital al final de tus turnos (no baja de 1 salud); desventaja vs enfermedad/drogas/veneno | Decantar salud · g rondas · 1 carga | al empezar y cada turno: recuperas dado de artes metálicas y terminas 1 efecto de enfermedad/droga/veneno |
| Peltre | Almacenar fuerza · 1/escena | Mermado [Fuerza −1]; desventaja en pruebas de Fuerza | Decantar fuerza · g rondas · 1 carga | Mejorado [Fuerza +2]; ventaja en pruebas no-ataque de Fuerza |

**Tabla de cobre «Almacenar recuerdos» (L.228):** grados 1 → 10 minutos; 2 → 1 hora; 3 → 8 horas; 4 → 24 h (1 día); 5 → 168 h (7 días); 6 o más → 720 h (30 días).
**Cinco categorías de edad (atium, L.218):** 1 Muy joven, 2 Joven, 3 Maduro, 4 Anciano, 5 Muy anciano.

### 2.3 Talentos de cada poder: «nombre — prerrequisito — activación — efecto»
Sintaxis de prerrequisito tal como en el libro: «poder Feruquimia de X» = tener el poder desbloqueado (meta cumplida); «Feruquimia N» = N grados en Feruquimia (el libro dice «N o más»); «talento Y» = haber tomado Y. Activación: **1/2/3** acciones · **grat.** acción gratuita (glifo `0`) · **reac.** reacción (`r`) · **esp.** especial (`*`) · **∞** siempre activo (`8`).

**ACERO (L.213-215 / PDF 219-221) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Esquiva acelerada | poder Feruquimia de acero | ∞ | Esquivar mientras decantas velocidad: el ataque no puede hacerte un rasguño |
| Repetir jugada | Feruquimia 2; poder | 1 | 1 concentración: repetir una acción de 1 con prueba física |
| Estallido de velocidad | Feruquimia 3; talento Repetir jugada | grat. | 1 carga: 2 acciones para Prevenirse/Destrabarse/Interactuar/Moverse/pruebas físicas |
| Reflejos acelerados | Feruquimia 3; talento Esquiva acelerada | 1 | 1 carga (acero o cinc): 1 reacción extra al inicio del turno de cada otro personaje |
| Carrera de acero auténtica | talento Reflejos acelerados **o** talento Estallido de velocidad | esp. | Decantar N cargas (≤límite): Mejorado [Velocidad 1+N] y N Moverse gratuitos hasta fin de turno |
| Velocista de acero | talento Repetir jugada | ∞ | 1 carga antes de escena: llegas antes (2 acciones extra / contribución extra) |

**ALUMINIO (L.216-217 / PDF 222-223) — 3**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Introspección experta | Perspicacia 2; poder | esp. | Desvío también vs daño espiritual mientras decantas; Autorreflexión gratis en descanso largo |
| Motivación esencial | poder | ∞ | Decantando: +1 concentración al final de turnos en que actúas según propósito/obstáculo/meta |
| Quintaesencia inamovible | Feruquimia 3; talento Introspección experta | esp. | Decantar N cargas: coste de resistir −(1+N); Defensa espiritual +(2+2N); sin rasguños en Def. espiritual |

**ATIUM (L.218-219 / PDF 224-225) — 2**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Aparentar la edad | Engaño 2; poder | ∞ | Ventaja en pruebas de Presencia contra personajes de tu misma categoría de edad física |
| Plena forma | Feruquimia 3; poder | 1 | Si eres Maduro+, 2 cargas: pasas a Joven y Mejorado [+1 a todos los atributos] |

**BENDALEO (L.220-221 / PDF 226-227) — 5**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Nutrición proactiva | Medicina 2; poder | esp. | 1 carga: repetir un dado (no el de trama) menor que tus grados |
| Impulso de energía | Feruquimia 2; poder | esp. | Decantar N cargas: recuperas 1d4+N (dado de artes metálicas); reduces Agotado −2 por carga |
| Nutrición constante | Feruquimia 3; talento Nutrición proactiva | esp. | Si el reintento sigue bajo, sustituye un dado por tus grados |
| Dosis de prevención | Medicina 3; talento Nutrición proactiva | ∞ | Almacenar una medicina ingerible en una carga (se aplica al decantarla) |
| Ruina de envenenadores | Medicina 4; talento Dosis de prevención | ∞ | Almacenar un veneno: éxito automático al resistirlo hasta fin de escena |

**BRONCE (L.222-223 / PDF 228-229) — 5**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Despierto y alerta | poder | 1 | 1 carga: Mejorado [Intelecto +1] y [Discernimiento +1] g rondas |
| Almacenamiento soñoliento | Feruquimia 2; poder | esp. | Almacenar sin dormir: Agotado [−2]; perder Concentrado da +1 carga (tope Agotado <10) |
| Centinela concentrado | Feruquimia 2; talento Despierto y alerta | 1 | 1 carga: Concentrado hasta fin de próximo turno |
| Siesta reparadora | Feruquimia 3; talento Despierto y alerta | esp. | Decantar N cargas: N «descansos cortos» inmediatos |
| Sueño instantáneo | Feruquimia 4; talento Siesta reparadora | 2 | 1×/escena, 5 cargas: efecto de descanso largo inmediato |

**CADMIO (L.224-225 / PDF 230-231) — 5**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Entrenamiento en privación | Atletismo 2; poder | ∞ | Duración de Decantar aliento ×2; sin decantar/almacenar, 1.ª r/0 por escena cuesta −1 |
| Oxigenación potenciada | Feruquimia 2; poder | esp. | Decantar N cargas: r y 0 cuestan −N concentración |
| Excelencia aeróbica | Feruquimia 3; talento Entrenamiento en privación | ∞ | El ahorro de concentración se extiende a todas las acciones |
| Estallido de recuperación | Atletismo 3; talento Excelencia aeróbica | ∞ | Salud/concentración recuperada +g mientras decantas |
| Resistencia feruquímica | talento Oxigenación potenciada | 1 | 1 carga: quitas Afligido o Desorientado |

**CINC (L.226-227 / PDF 232-233) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Ayuda chispeante | poder | ∞ | Tu reacción Ayudar da bonificación = g a un dado del aliado |
| Doble pensamiento | Feruquimia 2; poder | 1 | 1 concentración: repetir acción de 1 con prueba cognitiva/Discernimiento |
| Momento eureka | Deducción 2; talento Doble pensamiento | 1 | 1 carga: epifanía sobre la escena (o una Oportunidad) |
| Rapidez mental | Feruquimia 3; talento Doble pensamiento | grat. | 1 carga: 2 acciones para Prepararse/Recuperarse/pruebas de Discernimiento, Intelecto o Voluntad |
| Reflejos acelerados | Feruquimia 3; talento Ayuda chispeante | 1 | (mismo texto que en acero) |
| Chispa auténtica | talento Reflejos acelerados **o** talento Rapidez mental | esp. | Decantar N cargas: Mejorado [Intelecto 1+N] y N acciones cognitivas |

**COBRE (L.228-230 / PDF 234-236) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Archivero de pericias | poder | ∞ | Almacenar una pericia como recuerdo (la pierdes mientras esté guardada); al decantar, ventaja cognitiva/espiritual |
| Mentecobre indexada | Feruquimia 2; poder | esp. | Decantar N cargas: rememoras N vivencias a la vez |
| Maestro mnemotécnico | Saber 2; talento Mentecobre indexada | ∞ | Efectos «hasta fin de escena» duran hasta después de un descanso largo |
| Memoria muscular | Agilidad 2 **o** Atletismo 2; talento Archivero de pericias | ∞ | Al recuperar pericia, ventaja también en pruebas físicas relacionadas |
| Pupilo aplicado | talento Archivero de pericias | esp. | Alojar una pericia temporal tras ≥1 h de estudio en descanso |
| Guardián del conocimiento | Feruquimia 3; Saber 3; talento Maestro mnemotécnico | ∞ | **+5 cargas máx.** de la mentecobre; **Intelecto +2** (y su máximo +2); 2 pericias nuevas |

**CROMO (L.231-233 / PDF 237-239) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Susurros del destino | poder | esp. | Tras descanso, 1 carga: impresión sobre la próxima escena; Concentrado al llegar el momento clave |
| Todavía no | poder | reac. | Si la DJ sube la apuesta mientras decantas: almacenas Fortuna, haces la prueba sin subirla, +1 carga |
| Compartir el destino | Liderazgo 2; talento Todavía no | reac. | 1 carga: subir la apuesta en prueba de un aliado que siente |
| Momento oportuno | Feruquimia 2; talento Susurros del destino | ∞ | Decantando, Prepararse como acción gratuita |
| Lugar adecuado | Perspicacia 2; talento Susurros del destino | esp. | Al inicio de escena, N cargas = N Moverse |
| Nexo de Fortuna | Feruquimia 3; talento Lugar adecuado | esp. | Decantar N cargas: subes la apuesta en todo; rangos O/C +(1+N) |

**DURALUMINIO (L.234-235 / PDF 240-241) — 5**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Conexión individual | poder | esp. | Excluir a personajes del debilitamiento; idioma aprendido persiste |
| Fuerza de personalidad | Feruquimia 2; poder | ∞ | Decantando, resistirte cuesta +2 concentración al otro |
| Vínculo instantáneo | Feruquimia 2; talento Conexión individual | **3 acciones** | 2 cargas: prueba de Feruquimia vs Def. espiritual de PNJ no enemigo; se hace amigo hasta descanso largo |
| De enemigo a amigo | Feruquimia 3; talento Vínculo instantáneo | ∞ | Vínculo instantáneo cuesta −1 acción; puede usarse sobre un Secuaz enemigo |
| Vínculo auténtico | Feruquimia 3; talento Fuerza de personalidad | esp. | Decantar N cargas: Mejorado [Presencia 1+N]; todos los idiomas en el alcance |

**ELECTRO (L.236-237 / PDF 242-243) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Voluntad curtida | poder | esp. | 1.ª decantación por escena: Resuelto o ignorar una lesión temporal |
| Dejarse llevar | poder | ∞ | Almacenando: resistir +1 concentración, ventaja en Perspicacia y Persuasión |
| Afabilidad infinita | Feruquimia 2; talento Dejarse llevar | esp. | Almacenando: si no resistes, +2 concentración y descubres dato clave |
| Intensidad de propósito | Feruquimia 2; talento Voluntad curtida | esp. | Con O: aliados Resueltos, enemigos Agotados [−1] |
| Esencia indomable | Feruquimia 3; talento Intensidad de propósito | esp. | Al recobrar el conocimiento: N cargas = N dados de recuperación |
| Resolución inquebrantable | Feruquimia 3; talento Voluntad curtida | esp. | Decantar N cargas: Mejorado [Voluntad 1+N]; ignorar hasta 1+N lesiones temporales |

**ESTAÑO (L.238-240 / PDF 244-246) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Control sensorial | poder | ∞ | Almacenar un sentido mientras decantas otro distinto |
| Precisión de estaño | Armamento pesado 1 **o** ligero 1; poder | ∞ | (compartido con alomancia de estaño) alcance de ataques a distancia + alcance de sentidos |
| Almacenar dolor | Medicina 2; talento Control sensorial | ∞ | Almacenando tacto: daño −g/2 e ignoras Afligido/Agotado/Ralentizado |
| Susurros del viento espontáneos | Feruquimia 2; talento Control sensorial | reac. | Almacenar sentido ante un detonante, con ventaja contra él |
| Almacenamiento multisensorial | Feruquimia 3; talento Susurros del viento espontáneos | esp. | Almacenar tantos sentidos como el rango (1 carga y Mermado −1 por sentido extra) |
| Susurros del viento auténticos | Feruquimia 3; talento Control sensorial | esp. | Decantar N cargas: N sentidos; Mejorado [Discernimiento 1+N] |

**HIERRO (L.241-242 / PDF 247-248) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Evasión liviana | poder | reac. | Almacenando peso: reduces daño por golpe/laceración en mod. Feruquimia y te mueves 3 m sin Acometidas reactivas |
| Golpe vigoroso | poder | 2 | Ataque cuerpo a cuerpo/sin armas decantando: +dado de artes metálicas; empuja 3 m por carga |
| Objeto inamovible | talento Golpe vigoroso | reac. | Si un personaje menor te impacta cuerpo a cuerpo, queda Tumbado |
| Pies ligeros | Agilidad 2; talento Evasión liviana | ∞ | Almacenando: ventaja en Velocidad no-ataque; saltos sin prueba |
| Masa crítica | Feruquimia 3; talento Objeto inamovible | esp. | Decantar N cargas (efectos acumulables hasta fin de próximo turno) |
| Maestro ajustador | Feruquimia 3; talento Objeto inamovible **o** talento Pies ligeros | esp. | 1 concentración: Almacenar/Decantar peso sin acción antes de un suceso |

**LATÓN (L.243-245 / PDF 249-251) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Palma abrasadora | poder | 2 | Agarrar/Empujar/atacar sin armas decantando calor; +dado de artes metálicas de daño por energía |
| Conducción térmica | Feruquimia 2; poder | esp. | 1×/turno decantando: al tocar (también con arma metálica) daño por energía = mod. Feruquimia |
| Contacto reconfortante | Medicina 2; talento Palma abrasadora **o** Conducción térmica | esp. | +g al dado de recuperación de un aliado; acelera lesiones temporales |
| Frío entumecedor | Feruquimia 2; talento Palma abrasadora **o** Conducción térmica | esp. | Almacenando: 2 concentración u O: objetivo Mermado [Velocidad −2] |
| Maestro alma de fuego | Feruquimia 3; talento Contacto reconfortante **o** talento Frío entumecedor | esp. | 1 concentración: Almacenar/Decantar calor sin acción |
| Horno viviente | talento Maestro alma de fuego | esp. | Decantar N cargas: calor ambiental radio 3 m×N que daña a todos incluido tú |

**NICROSIL (L.246 / PDF 252) — 0 talentos.** El libro no incluye bloque «Talentos» ni frase de desbloqueo. Advertencia propia (L.246): «la mayoría de los ferrins suelen evitar este poder» (solo útil si tienes otra capacidad Investida). No disponible para PJ en medallones (ver §3.3). Sí puede obtenerse por clavo de bendaleo (ver §4).

**ORO (L.247-248 / PDF 253-254) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Sanación espontánea | poder | reac. | Antes de quedar Inconsciente: Decantar salud y +g salud; si salud >0, quedas con 1 y sin lesión |
| Especialista en lesiones | Feruquimia 2; poder | esp. | Decantar salud puede sanar 1 lesión temporal (gratis) o permanente (+1 carga) |
| Sanación acelerada | Feruquimia 3; talento Especialista en lesiones | 1 | N cargas (≤límite): recuperas 1d8+mod. Feruquimia por carga (dado de artes metálicas) |
| Huir de la muerte | Feruquimia 3; talento Sanación espontánea | ∞ | Destrabarse en la misma reacción; 1 reacción extra por turno solo para Sanación espontánea |
| Sanación subconsciente | Feruquimia 3; talento Sanación espontánea | grat. | Decantar salud inconsciente o muerto <1 min (vuelves a la vida con 0 salud) |
| Regeneración instantánea | Feruquimia 4; talento Sanación acelerada | 2 | 1×/escena, 5 cargas: salud completa, sanar lesiones, fin de enfermedades/drogas/venenos |

**PELTRE (L.249-250 / PDF 255-256) — 6**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| Muro de músculos | Feruquimia 2; poder | ∞ | Desvío +mitad de cargas; Prevenirse sin cobertura; eres cobertura para aliados |
| Armamento de brazo de peltre | Armamento pesado 1 **o** ligero 1; poder | esp. | (compartido con alomancia de peltre) dado de daño sin armas en lugar del del arma |
| Barricada de peltre | talento Muro de músculos | ∞ | Ignoras el rasgo Perforante (tú y aliados cubiertos) |
| Lanzador de peltre | talento Armamento de brazo de peltre | ∞ | (compartido) armas con Arrojadiza [30/90] |
| Culturista | Feruquimia 3; talento Muro de músculos | esp. | Decantar N cargas: Mejorado [Fuerza 1+N]; tamaño +1 categoría |
| Por los aires | Armamento pesado 3; talento Lanzador de peltre | 1 | Lanzar a un aliado o enemigo Retenido hasta 30 m (ataque con arma improvisada) |

### 2.4 Hechos transversales de los árboles (importantes para el modelo)
- **Talentos repetidos por nombre**: «Reflejos acelerados» existe en acero (prereq Esquiva acelerada) y en cinc (prereq Ayuda chispeante), con texto idéntico («menteacero o mentecinc correspondiente»). Compartidos con la alomancia: «Precisión de estaño» (alomancia: Armamento 1 + talento «Reenfoque con avivamiento»; feruquimia: Armamento 1 + poder), «Armamento de brazo de peltre» y «Lanzador de peltre» (mismos textos, solo cambia «poder Alomancia/Feruquimia de peltre»). → la identidad de un talento debería ser (arbol, nombre), con posibilidad de enlazar dos árboles.
- Los talentos del **primer nivel** tienen como prerrequisito «poder Feruquimia de X». Son **gatillos de meta**: sin la meta no se eligen (L.132, L.172).
- Prerrequisitos de **otras habilidades** (no solo Feruquimia): Perspicacia, Engaño, Medicina 2-4, Atletismo 2-3, Deducción 2, Saber 2-3, Agilidad 2, Liderazgo 2, Armamento ligero/pesado 1-3. Un prerrequisito de **atributo** solo en Últimas reservas (Voluntad 4, camino ferrin).
- Talentos con **bonos permanentes**: «Guardián del conocimiento» (+5 cargas máx. mente de cobre, +2 Intelecto y máximo). «Mentes de metal ampliadas» (camino) suma el rango.
- El **diagrama** del libro omite casi siempre los prerrequisitos de talento (los muestra con flechas); el texto es la fuente completa. No hay discrepancias de contenido entre texto y diagrama; solo omisiones del diagrama (p. ej. «Objeto inamovible», «Resonancia aleada»).

## 3. Mentes de metal: reglas (cap. 5 «Feruquimia: uso de mentes de metal», L.131-133 / PDF 137-139; cap. 7 L.253, L.276-277; cap. 8 L.293-294)
### 3.1 Reglas núcleo
| Regla | Texto/valor | Pág. |
|---|---|---|
| No hay Investidura en feruquimia | «en este juego no te otorga una reserva de Investidura»; se almacena un rasgo en una mente y se decanta | L.131 / PDF 137 |
| Objeto Investido | Mente con **≥1 carga** = objeto Investido; sin cargas deja de serlo; resiste Tirones/Empujones y detección (cap. 7) | L.131; L.253 / PDF 259 |
| **Cargas máximas** | **2 + tus grados en Feruquimia** | L.131 |
| Mente llena | No puedes usar talentos ni efectos que almacenen cargas adicionales | L.131 |
| Solo el dueño | «Solo tú puedes almacenar/gastar cargas de tus propias mentes de metal» | L.131 |
| Una mente por poder | Las reglas modelan **una única mente por poder feruquímico**, aunque físicamente haya muchas piezas | L.131 |
| **Una reserva por metal** | Mentes de reserva del mismo metal **comparten una única reserva de cargas** (máx. habitual 2+g); no hay beneficio mecánico salvo si se pierde la original (entonces pasas a la de reserva con **0 cargas**) | L.131, L.133 |
| Reparto de cargas | Si importa narrativamente, la DJ puede repartir el máximo entre piezas menores del mismo metal (guías extra en bendaleo y estaño, canon opcional: una mente por sentido/por nutrición e hidratación) | L.131, L.220, L.239 |
| Almacenar y decantar a la vez | Imposible para el mismo metal (empezar una termina la otra); gastar cargas en talentos cuenta como decantar | L.131 |
| Sin cargas | No se puede usar ningún talento ni efecto que las consuma | L.131 |
| Mentes llevadas a la vez | Feruquimista: **tantas como tu valor de Intelecto (mín. 1)**; todas las mentes del mismo poder cuentan como una; «Ancho de banda mental» → **modificador de Feruquimia** (L.146). Para ferrin/nacidoble el libro no da límite [inferido: 1-2 mentes, irrelevante] | L.131, L.145-146 |
| Cargas máx. ampliadas | Talento «Mentes de metal ampliadas»: **+rango** a cada mente (crece con el rango) | L.146, L.150, L.156, L.158 |
| Descanso | Almacenar durante descanso corto = 1 escena (renuncias a recuperar salud/concentración); descanso largo = **2 escenas** y quedas **Agotado [−1]** | L.307 / PDF 313; L.131 |
| Muerte | Los efectos activos terminan, pero las mentes con ≥1 carga **siguen Investidas con esas cargas** | L.315 / PDF 321 |
| Obtención | La primera mente de cada poder se obtiene **gratis** al completar la meta «Fabricar tu(s) mente(s) de metal» | L.133; L.276 |
| Fabricación / reposición | Mente perdida: Manufactura estándar; metal común 5 ar, metal raro = coste del metal en bruto; o nueva meta «Fabricar tu mente de metal». Reparar daños: Manufactura CD 15 conservando el metal | L.133; L.276 / PDF 282 |
| Integrada | Talento «Mente de metal integrada» (Feruquimia 4): la mente se implanta bajo la piel; solo quien tenga ≥6 grados en una habilidad de Artes Investidas puede afectarla | L.147, L.150 |
| Clavos hemalúrgicos | Los clavos hemalúrgicos **no** se usan como mentes de metal (salvo decisión de la DJ) | L.290 |

### 3.2 Mentes no vinculadas (desligadas) (L.294 / PDF 300)
Recompensa de rango 2 (4 cargas máx.) o rango 3+ (8 cargas máx.). Cualquier personaje con el poder del metal puede decantarla; cualquiera con el poder puede gastar una carga ajena (p. ej. mentecobre con recuerdos de otro). Si almacenas en ella deja de ser desligada y pasa a ser mente de reserva tuya. Se cambia al agotarse por otra cargada (patrocinador o meta «Canjear por una mente de metal nueva»). Se puede fabricar con cualquier metal feruquímico.

### 3.3 Medallones feruquímicos (Era 2) (L.293-294 / PDF 299-300)
- Permiten a **cualquiera** usar poderes feruquímicos temporalmente; **uno a la vez** (Interactuar para ponérselo/quitárselo).
- 1 a 3 poderes por medallón; **máx. 8 cargas por poder** (cuenta por separado). La DJ decide con cuántas empieza (normalmente 8; los de Almacenar principal, como hierro, pueden empezar en 0).
- **Almacenar en un medallón no genera cargas** (se obtiene el efecto pero «el medallón absorbe tan poca cantidad que no se generan cargas»).
- No se recargan: se canjea el medallón (meta «Canjear por un medallón nuevo» o patrocinador malwish).
- Rango de recompensa = suma de los rangos de sus poderes (máx. 3 poderes):

| Metal | Rasgo | Rango | Metal | Rasgo | Rango |
|---|---|---|---|---|---|
| Acero | Velocidad | 2 | Estaño | Sentidos | 1 |
| Aluminio | Identidad | 1 | Hierro | Peso | 1 |
| Bendaleo | Nutrición | 1 | Latón | Calor | 1 |
| Bronce | Desvelo | 2 | **Nicrosil** | Investidura | **no disponible para PJ** |
| Cadmio | Aliento | 1 | Oro | Salud | 2 |
| Cinc | Velocidad mental | 1 | Peltre | Fuerza | 2 |
| Cobre | Recuerdos | 1 | Electro | Determinación | 2 |
| Cromo | Fortuna | 2 | Duraluminio | Conexión | 1 |
(Atium no aparece en medallones.) Los medallones de latón se fabrican en el sur (Soberano) para sobrevivir al frío (L.243).

### 3.4 Cadena de metas para obtener una mente (L.132-133 / PDF 138-139)
- Meta **«Fabricar tu(s) mente(s) de metal»** (la da el talento de herencia). Se avanza **el doble de rápido con ayuda** (otro feruquimista, metales purificados de fuente experta). Al completarla: mente de metal + versión completa + acceso a los talentos del árbol.
- Los **equipos iniciales «Guardador»** (feruquimia) y **«Fugitivo»** (alomancia) completan **de inmediato** esa meta inicial al adquirir el talento principal (L.255 / PDF 261).
- Se puede pedir más tarde otra meta para otro poder/pareja (a discreción de la DJ).

## 4. Hemalurgia
### 4.1 Qué es (L.251 / PDF 257; cap. 5 L.128; cap. 6 L.161; cap. 8 L.288-292)
- Tercer arte metálico; clavos metálicos que **roban** un rasgo a una víctima (casi siempre matándola) y lo **otorgan** a quien los lleva. Puede robar atributos físicos y mentales y poderes alománticos/feruquímicos.
- **No es un camino** de nacido del metal ni opción de creación. Se **obtiene como recompensa** («Clavos hemalúrgicos», cap. 8). «Este libro no incluye un camino específico de hemalurgo» (L.251). Los PJ **no pueden crear clavos** (L.288). Contenido futuro podría añadir creación (L.288).
- A los portadores se les llama hemalurgos (L.251).
- La PDF 258 / L.252 no tiene texto extraíble.

### 4.2 Recompensas (L.288 / PDF 294)
| Rango de PJ | Recompensa |
|---|---|
| 1 | Pericia especializada **Hemalurgo** |
| 2 | Clavo de **cobre, hierro, estaño o cinc** |
| 3 | Clavo de **bendaleo, latón, bronce, cadmio, electro, oro, peltre o acero** |

- **Clavos duplicados** (L.288): suma +1 al rango de recompensa de los futuros clavos de ese metal por cada clavo de ese metal que ya tengas (ej.: el 3.º clavo de hierro cuenta como rango 4). Efectos del mismo metal **se acumulan** (dos clavos de hierro: Fuerza +2).
- También se puede obtener un clavo **extrayéndolo** de un enemigo o cadáver (L.290): pericia Hemalurgo; sin prueba de un cadáver reciente viable; contra enemigo vivo: Atletismo vs Defensa física (o Hurto vs Def. cognitiva, etc.); la DJ puede exigir Retener, medidor de suceso o derrotarlo.

### 4.3 Reglas de uso (L.289-291)
| Concepto | Regla |
|---|---|
| Pericia Hemalurgo | Permite implantar/extraer clavos de uno mismo o de dispuestos. La concede la DJ o se elige como recompensa de rango 1 |
| Implantar clavo | **3 acciones**; prueba de **Medicina CD 20**; clavo de tu rango o inferior; éxito: efectos; fallo: 1d10 daño vital y no se implanta. En descanso corto/largo: sin prueba |
| Extraer clavo | **1 acción**; **Medicina CD 10**; fallo: 1d4 daño vital. En descanso: sin prueba |
| **Límite de clavos implantados** | **tantos como el rango, máx. 3** (kandra: el clavo de Bendición cuenta; ver cap. 8) |
| Cuarto clavo | «sucumbe por completo a la influencia de una Esquirla» → deja de ser PJ (pasa a PNJ) |
| Poder nuevo | Si el clavo da un poder alomántico/feruquímico nuevo: **versión completa** (como si hubieras cumplido la meta), obtienes la habilidad Alomancia/Feruquimia y **Investidura si no la tenías**; al subir de nivel eliges talentos de ese árbol y grados en la habilidad |
| Poder existente | **+1 grado** en la habilidad correspondiente, que **no cuenta** para el máximo de grados (por eso se supera 5) |
| No es mente de metal | Los clavos no se usan como mentes de metal salvo decisión de la DJ |
| Quitar clavo | Todos sus efectos terminan (poder, atributos, recursos, grados, acciones, talentos). Autorreflexión permite reasignar talentos inaccesibles |
| Sin resonancias | Los poderes robados no generan resonancias en nacidobles (L.154) |
| Influencia de Esquirla | Con ≥1 clavo (excepto Bendiciones kandra) una Esquirla puede comunicarse con el PJ (Conservación/Ruina en E1, Armonía en E2); pruebas de ejemplo CD 15/25; solo narrativa, la DJ decide (L.291-292) |

### 4.4 Efectos conocidos por metal (tabla «Efectos conocidos de los clavos hemalúrgicos», L.291 / PDF 297; rango de recompensa base entre paréntesis)
| Metal del clavo | Rango | Efecto | Opciones de poder |
|---|---|---|---|
| Cinc | 2 | «fortaleza emocional»: **Voluntad +1** | — |
| Cobre | 2 | «fortaleza mental»: **Intelecto +1** | — |
| Estaño | 2 | «sentidos agudizados»: **Discernimiento +1** | — |
| Hierro | 2 | «fuerza»: **Fuerza +1** | — |
| Acero | 3 | poder **alomántico físico** | alomancia de hierro, peltre, acero o estaño |
| Bronce | 3 | poder **alomántico mental** | alomancia de latón, bronce, cobre o cinc |
| Cadmio | 3 | poder **alomántico temporal** | alomancia de bendaleo, cadmio, electro u oro |
| Electro | 3 | poder **alomántico de mejora** | alomancia de aluminio, cromo, duraluminio o nicrosil |
| Peltre | 3 | poder **feruquímico físico** | feruquimia de hierro, peltre, acero o estaño |
| Latón | 3 | poder **feruquímico cognitivo** | feruquimia de latón, bronce, cobre o cinc |
| Oro | 3 | poder **feruquímico híbrido** | feruquimia de bendaleo, cadmio, electro u oro |
| Bendaleo | 3 | poder **feruquímico espiritual** | feruquimia de aluminio, cromo, duraluminio o **nicrosil** |
Atium y los metales divinos **no** tienen clavo. Los de cinc/cobre/estaño/hierro dan atributos (mapean 1:1 a atributos en español: voluntad, intelecto, discernimiento, fuerza).
Observación: el clavo de bendaleo permite feruquimia de nicrosil aunque el medallón no (L.294).

### 4.5 Efectos en la Defensa espiritual y estados (L.290 / PDF 296)
- Cada clavo perturba la redespíritu: **el primer clavo de cada metal reduce la Defensa espiritual en 2; cada clavo adicional del mismo metal, en 5**.
- Al **inicio de cada escena**, si tienes ≥1 clavo y tu **Defensa espiritual es 9 o inferior**, quedas **Desorientado hasta el final de la escena**.
- Base de la Defensa espiritual: 10 + Discernimiento + Presencia (L.26; ver resumen del manual).
- Excepción kandra: sin otros clavos, las Bendiciones no reducen la Defensa espiritual (L.291).
- Otros efectos en la Defensa espiritual relacionados (feruquimia de aluminio): −2 almacenando, +4 decantando; «Quintaesencia inamovible» +2+2×cargas (L.216-217).
- Un objeto de aluminio alojado en el cuerpo impide recuperar salud mediante artes metálicas (L.165, no hemalurgia pero relacionado).

### 4.6 Contexto y escena
- Era 1: su práctica se limita a inquisidores de acero (chavetas); Era 2: el Grupo la redescubre y los Sangre Espectral la usan con moderación (L.371).
- «Empezar con un clavo secreto» (L.289): el PJ puede empezar con un clavo que ignora; debe completar una meta para recibirlo formalmente y necesita pericia Hemalurgo y el rango para sus beneficios; la DJ puede permitir el poder naciente.

## 5. Los cinco caminos de nacido del metal (cap. 5, L.127-159 / PDF 133-165)
### 5.1 Reglas generales (L.127-133)
- Funcionan como los caminos heroicos (cap. 4: principal + árbol) pero **son excluyentes entre sí** (L.127): al elegir el talento principal de uno no se puede acceder a otro.
- **Sin especialidades**. Dan acceso a **≥2 árboles**: el del camino (cap. 5) + uno por cada poder de artes metálicas (cap. 6).
- El principal es un **talento de ruptura** (caminos alománticos: brumoso, nacido de la bruma) o **talento de herencia** (caminos feruquímicos: feruquimista, ferrin, **nacidoble**: la herencia nacidoble concede además los beneficios de ruptura) (índice L.397; L.128).
- Se puede tomar en **cualquier nivel**; representa descubrir los poderes. Prerrequisito común: «no tener ningún otro talento de ruptura o herencia» (excepción: lerasium puro, L.295).
- Al tomarlo se obtiene **de inmediato**: una **meta de nacido del metal** (anotada en el reverso de la hoja), la habilidad Investida con **1 grado**, y Investidura/Beber vial si es alomántico (L.128).
- Los poderes solo son **nacientes** hasta completar su meta (L.127, L.132); una meta nueva por poder/pareja a discreción de la DJ.
- **Hoja**: Alomancia y Feruquimia se escriben en la línea libre de la columna cognitiva (Alomancia con Voluntad, Feruquimia con Intelecto); si hay ambas (nacidoble) una va en otro espacio con flecha. Hoja de artes metálicas aparte (L.128, L.404).
- Habilidades Investidas: no accesibles hasta que el camino (o un clavo) las dé; modificador = grados + atributo; la feruquimia rara vez exige pruebas (L.128).
- **Selección aleatoria opcional** «Descubrimiento de artes metálicas» (d20; L.129 / PDF 135):

| d20 | Era 1 | Era 2 |
|---|---|---|
| 1-4 | ninguno | ninguno |
| 5-9 | brumoso | ferrin |
| 10-14 | brumoso | brumoso |
| 15-17 | nacido de la bruma | ferrin **o** brumoso |
| 18-20 | feruquimista | nacidoble |

- Poder aleatorio de brumoso (d20, L.134 / PDF 140): 1-2 hierro (atraedor), 3-4 acero (lanzamonedas), 5-6 estaño (ojo de estaño), 7-8 peltre (brazo de peltre/violento), 9 cinc (encendedor), 10 latón (aplacador), 11 cobre (ahumador/nube de cobre), 12 bronce (buscador), 13 cromo* (sanguijuela), 14 nicrosil* (nicroestallante), 15 aluminio† (mosquito de aluminio/vacío), 16 duraluminio† (mosquito de duraluminio), 17 cadmio* (pulsador), 18 bendaleo* (deslizador), 19 oro† (augur), 20 electro† (oráculo). *solo Era 2; †final de Era 1 o Era 2. Si el metal no está disponible, se repite la tirada.
- Poder aleatorio de ferrin (d20, L.149 / PDF 155): 1 hierro (ajustador), 2 acero (mensajero de acero), 3 estaño (susurravientos), 4 peltre (brazo de peltre/bruto), 5-6 cinc (chispeante), 7-8 latón (alma de fuego), 9-10 cobre (archivero), 11-12 bronce (centinela), 13 cromo (hilador), 14 nicrosil (portaalmas), 15 aluminio (genuino), 16 duraluminio (conector), 17 cadmio (resollante), 18 bendaleo (incorporador), 19 oro (hacedor de sangre), 20 electro (pináculo). El nacidoble tira en ambas tablas (L.152).

### 5.2 Tabla resumen de los cinco (L.19 / PDF 25 + cap. 5)
| Camino | Era | Poderes que da | Habilidad Investida | Habilidad inicial si es camino inicial | Talento principal (tipo) | Ascendencia exigida |
|---|---|---|---|---|---|---|
| **Brumoso** | ambas | **1** poder alomántico | Alomancia (1 grado) | Alomancia (+1 grado gratis, además del de la Ruptura) | **Ruptura de brumoso** (ruptura) | humana o sangre koloss |
| **Nacido de la bruma** | **Era 1** | **todos** los alománticos de la era | Alomancia (1 grado) | **ninguna** | **Ruptura de nacido de la bruma** (ruptura) | **humana** |
| **Feruquimista** | **Era 1** | **todos** los feruquímicos de la era | Feruquimia (1 grado) | **ninguna** | **Herencia feruquímica** (herencia) | **humana** |
| **Ferrin** | **Era 2** | **1** poder feruquímico | Feruquimia (1 grado) | Feruquimia (+1 grado gratis) | **Herencia ferrin** (herencia) | humana o sangre koloss |
| **Nacidoble** | **Era 2** | **1** alomántico + **1** feruquímico | Alomancia y Feruquimia (1 grado cada una) | **Disciplina** (+1 grado gratis) | **Herencia nacidoble** (herencia + ruptura) | humana o sangre koloss |
- «Nacido de la bruma» y «feruquimista»: «solo recomendado para jugadores experimentados» (consejo de DJ, L.140, L.145). Se recomienda **un solo** completo por grupo.
- **Kandra no pueden** tomar talentos de nacido del metal (L.18). La ascendencia sangre koloss solo existe en Era 2 (L.371).
- Prerrequisito común de principales: «no tener ningún otro talento de ruptura o herencia». Excepción: lerasium puro permite Ruptura de nacido de la bruma (L.295).

### 5.3 Qué concede cada talento principal (texto de L.135, L.141, L.146, L.150, L.155)
| Principal | Concede (inmediato) | Meta que otorga | Metales / poderes que elige |
|---|---|---|---|
| Ruptura de brumoso (L.135, PDF 141) | Investidura máx. = 2 + máx(Discernimiento, Presencia); acción Beber vial; habilidad Alomancia (1 grado, Voluntad); **un** poder alomántico naciente (**atium se usa completo desde ya**) | «Entrenar tu poder» (salvo atium) → versión completa + talentos del árbol | un metal disponible en la era (tabla L.372) |
| Ruptura de nacido de la bruma (L.141, PDF 147) | Investidura (2+DIS/PRE), Beber vial, Alomancia (1 grado); **todos** los poderes alománticos de la era nacientes (atium completo) | «Entrenar tus poderes» para **una pareja Empujón/Tirón** elegida; más parejas a discreción de la DJ | todos los de la era |
| Herencia feruquímica (L.146, PDF 152) | habilidad Feruquimia (1 grado, Intelecto); **todos** los poderes feruquímicos de la era nacientes; puede llevar **tantas mentes como Intelecto (mín. 1)** | «Fabricar tus mentes de metal» para **un metal puro + su aleación, o bien el atium**; más parejas/atium después | todos los de la era |
| Herencia ferrin (L.150, PDF 156) | habilidad Feruquimia (1 grado); **un** poder feruquímico naciente | «Fabricar tu mente de metal» | un metal de la era (E2: 16; sin atium) |
| Herencia nacidoble (L.155, PDF 161) | Investidura (2+DIS/PRE), Beber vial, Alomancia y Feruquimia (1 grado cada una); **un** poder alomántico + **un** feruquímico nacientes | **dos metas**: «Entrenar tu poder» y «Fabricar tu mente de metal» | 1 alomántico + 1 feruquímico (pueden ser **el mismo metal o distintos**) |

Recursos nuevos (L.129-133): **Investidura** (máx. 2 + máx(DIS,PRE) + talentos «Investido»; actual = máx. al inicio de escena, 1 si Sorprendido); **Beber vial** (1 acción: recupera Investidura al máx. si el vial contiene un metal que puedes quemar; quita Desprovisto de poderes cuyos metales haya en el vial y deja Desprovisto del resto); **Desprovisto [poder]**; **viales** (metales raros: registro individual salvo suministro recurrente); **mentes de metal** (ver §3). Estas piezas existen solo para alomantes (Investidura) o feruquimistas (mentes).

### 5.4 Árboles completos: «nombre — prerrequisito — activación»
Los diagramas del libro están en L.137 (brumoso), L.143 (nacido de la bruma), L.147 (feruquimista), L.151 (ferrin), L.157 (nacidoble). Las activaciones salen del texto; los diagramas de camino no muestran glifos.

**BRUMOSO (L.134-137 / PDF 140-143) — 6 talentos (principal + 5)**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| **Ruptura de brumoso** (principal) | ascendencia humana o sangre koloss; ningún otro talento de ruptura/herencia | esp. | ver §5.3 |
| Investido | talento Ruptura de brumoso | ∞ | Investidura máx. **+rango** (crece al subir de rango) |
| Portentoso | talento Investido | ∞ | +1 grado efectivo de Alomancia para el alcance; mantener cuesta −1 Investidura (mín. 1) |
| Quemar instintivamente | Alomancia 3; Ruptura de brumoso | esp. | Tras descanso largo eliges un poder; puedes Quemar antes del primer turno de la escena |
| Trazas de metal | Alomancia 3; talento Investido | ∞ | Usar versión naciente con 0 Investidura o estando Desprovisto |
| Savantismo alomántico | Alomancia 5; talento Portentoso | esp. | Meta «Convertirse en sabio» (≥7 días de quemado casi constante, 1 avance/sesión; o 2 avances si se aviva siempre); recompensa: +2 Investidura de amplificación al gastar Investidura en el poder; **abstinencia** con 0 Investidura o Desprovisto |

**NACIDO DE LA BRUMA (L.138-143 / PDF 144-149) — 7 talentos (principal + 6)**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| **Ruptura de nacido de la bruma** (principal) | ascendencia humana; ningún otro talento de ruptura/herencia | esp. | ver §5.3 |
| Investido | talento principal | ∞ | Investidura máx. +rango |
| Mezcla metálica | talento principal | esp. | Al hacer prueba de un poder alomántico: gasta O para activar versiones nacientes de **otros 2** poderes sin Investidura ni acción |
| Quemar instintivamente | Alomancia 3; talento Mezcla metálica | esp. | como en brumoso |
| Quemar selectivamente | Alomancia 3; talento Mezcla metálica | esp. | Quedar Desprovisto de un poder en vez de pagar Investidura: surte el efecto de gastar tu límite de artes metálicas |
| Quemar simultáneamente | Alomancia 4; talento Quemar instintivamente | grat. | 2 concentración → 2 acciones solo para poderes alománticos |
| Trazas de metal | Alomancia 3; talento Investido | ∞ | como en brumoso |

**FERUQUIMISTA (L.144-147 / PDF 150-153) — 7 talentos (principal + 6)**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| **Herencia feruquímica** (principal) | ascendencia humana; ningún otro talento de ruptura/herencia | esp. | ver §5.3 |
| Mentes de metal ampliadas | talento principal | ∞ | Cargas máx. de la mente de cada poder **+rango** |
| Almacenamiento rápido | Feruquimia 2; talento principal | ∞ | Acciones de Almacenar cuestan **0** (acción gratuita) |
| Ancho de banda mental | Feruquimia 3; talento Mentes de metal ampliadas | ∞ | Mentes llevadas a la vez = **modificador de Feruquimia** (en vez de Intelecto) |
| Decantación instintiva | Feruquimia 3; talento Almacenamiento rápido | esp. | Tras descanso largo, 1 poder: puedes Decantar antes del primer turno de escena |
| Decantación rápida | Feruquimia 4; talento Decantación instintiva | grat. | 2 concentración → 1 acción solo para poderes que consumen cargas |
| Mente de metal integrada | Feruquimia 4; talento Mentes de metal ampliadas | esp. | Tras descanso largo, integras 1 mente bajo la piel (solo afectable con ≥6 grados de Artes Investidas) |

**FERRIN (L.148-151 / PDF 154-157) — 6 talentos (principal + 5)**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| **Herencia ferrin** (principal) | ascendencia humana o sangre koloss; ningún otro talento de ruptura/herencia | esp. | ver §5.3 |
| Mentes de metal ampliadas | talento principal | ∞ | +rango cargas máx. |
| Almacenamiento rápido | Feruquimia 2; talento principal | ∞ | Almacenar como 0 |
| Decantación instintiva | Feruquimia 3; talento Almacenamiento rápido | esp. | como en feruquimista |
| Mente de metal integrada | Feruquimia 4; talento Mentes de metal ampliadas | esp. | como en feruquimista |
| **Últimas reservas** | **Voluntad 4 o más**; talento Mentes de metal ampliadas | esp. | 1×/escena, sin cargas: 3 concentración = gastar 1 carga (la mente de la Herencia ferrin) |

**NACIDOBLE (L.152-159 / PDF 158-165) — 12 talentos (principal + 11)**
| Talento | Prerrequisito | Act. | Efecto |
|---|---|---|---|
| **Herencia nacidoble** (principal) | ascendencia humana o sangre koloss; ningún otro talento de ruptura/herencia | esp. | ver §5.3 |
| Investido | talento principal | ∞ | Investidura máx. +rango |
| Mentes de metal ampliadas | talento principal | ∞ | +rango cargas máx. |
| Almacenamiento rápido | Feruquimia 2; talento principal | ∞ | Almacenar como 0 |
| Quemar instintivamente | Alomancia 3; talento principal | esp. | como en brumoso |
| Decantación instintiva | Feruquimia 3; talento Almacenamiento rápido | esp. | como en feruquimista |
| Mente de metal integrada | Feruquimia 4; talento Mentes de metal ampliadas | esp. | como en feruquimista |
| Trazas de metal | Alomancia 3; talento Investido | ∞ | como en brumoso |
| **Componedor** | Alomancia 3; Feruquimia 3; **los poderes de la Herencia nacidoble usan el mismo metal**; talento Mentes de metal ampliadas **o** Investido | 1 | Beber vial sobre un fragmento de tu mente: recuperas Investidura; **cargas máx. de esa mente −1 permanente**; hasta fin de escena o Desprovisto puedes alimentar la feruquimia **gastando Investidura como cargas**. Requiere el fragmento extraído (con 1 acción) y en vial, o ya ingerido/integrado. Reparación: renunciar a un descanso largo; metal común o suministro recurrente restaura el máx.; metal raro: +2 cargas por medio kilo |
| Composición recursiva | Alomancia 4; Feruquimia 4; talento Componedor | 1 | Bajo Componedor, gastar ≥1 Investidura para añadir esas cargas a la mente |
| **Resonancia aleada** | **los poderes usan metales distintos**; talento Mentes de metal ampliadas **o** Investido | esp. | Al hacer prueba de poder alomántico: 1 carga de mente = ventaja; al hacer prueba de poder feruquímico: 1 Investidura = ventaja |
| Sinergia metálica | Alomancia 3; Feruquimia 3; talento Resonancia aleada | grat. | Tras Resonancia aleada: aplicas también el efecto del otro poder |

### 5.5 Casos especiales del nacidoble (L.152-153, L.155, L.158-159)
- **Resonancias**: efectos emergentes entre las dos artes; «principalmente los nacidobles» (nacidos de la bruma/feruquimistas se diluyen; los clavos no generan resonancias) (L.154). Se resuelven por colaboración con la DJ (sin tabla).
- **Componedor** (mismo metal en alomancia y feruquimia): quema un fragmento de la mente y multiplica el rasgo almacenado; sin «barreras de seguridad» (L.152). Ejemplos: Miles Dagouter (oro+oro), lord Legislador (atium).
- **Resonancia aleada** (metales distintos): ejemplos Wax (acero+hierro), Wayne (bendaleo+oro).
- **Prerrequisito sobre la elección**: Componedor exige «mismo metal», Resonancia aleada exige «metales distintos»; ambos exigen además «Mentes de metal ampliadas **o** Investido». Es un prerrequisito sobre la **elección de poderes** del talento principal (única elección posible de cada tipo: son excluyentes entre sí) [inferido: Sinergia metálica depende de Resonancia aleada, luego solo existe con metales distintos].

### 5.6 Metas de nacido del metal (L.132-133 / PDF 138-139; L.288)
| Meta | Cuándo se obtiene | Avance | Recompensa |
|---|---|---|---|
| «Entrenar tu(s) poder(es)» | Talento de ruptura (brumoso, nacido de la bruma, nacidoble). Atium alomántico **no** la necesita | 3 hitos (como cualquier meta); el doble de rápido con mentor o compañero con el mismo poder | Versión completa + acceso a talentos del árbol |
| «Fabricar tu(s) mente(s) de metal» | Talento de herencia (feruquimista, ferrin, nacidoble) | 3 hitos; el doble de rápido con ayuda | Mente de metal (gratis la 1.ª vez por poder) + versión completa + talentos |
| «Convertirse en sabio» | Talento Savantismo alomántico (brumoso) | ≥7 días quemando casi constante, 1 avance/sesión | +2 Investidura de amplificación, abstinencia |
| «Canjear por un medallón nuevo» / «por una mente de metal nueva» | Recompensas de medallón / mente desligada | — | Sustituir el objeto |
Reglas de metas (cap. 8): 3 casillas de hito, concluir por éxito/crecimiento/fracaso; se registran en el reverso de la hoja (L.283-285).

## 6. Borradores de tipos TypeScript (propuestos; **no implementan nada**)
Alineados con el repo: `ActivationType` (`cosmere-web/src/components/TalentActivation.tsx:9`), forma de `Talento` (`cosmere-web/src/data/potencias.ts:3-10`: `name`, `cost`, `prereq`, `description`), dominio en español, IDs ASCII sin eñe (`estano`, `laton`) con `nombre` visible en español.

```ts
// ── Catálogo estático (src/data/mistborn/…) ──────────────────────────────────
import type { ActivationType } from '../../components/TalentActivation'

export type Era = 'era1' | 'era2'
export type ArteMetalica = 'alomancia' | 'feruquimia' | 'hemalurgia'
export type HabilidadInvestida = 'Alomancia' | 'Feruquimia'
export type MetalFeruquimicoId =
  | 'hierro' | 'acero' | 'estano' | 'peltre' | 'cinc' | 'laton' | 'cobre' | 'bronce'
  | 'aluminio' | 'duraluminio' | 'cromo' | 'nicrosil' | 'cadmio' | 'bendaleo' | 'oro' | 'electro' | 'atium'
export type CategoriaFeruquimica = 'fisico' | 'cognitivo' | 'espiritual' | 'hibrido' | 'divino'
export type DisponibilidadMetal = 'ambas' | 'era1' | 'era2' | 'era2_fin_era1'   // «Era 2 †» = final de la Era 1 + Era 2
export type CaminoNacidoDelMetalId = 'brumoso' | 'nacido_de_la_bruma' | 'feruquimista' | 'ferrin' | 'nacidoble'
type Atributo = 'fuerza' | 'velocidad' | 'intelecto' | 'voluntad' | 'discernimiento' | 'presencia'

/** Prerrequisito estructurado (el texto literal del libro va en `prereq`). */
export type PrerrequisitoPoder =
  | { tipo: 'grados'; habilidad: HabilidadInvestida | string; min: number }     // «Feruquimia 3 o más», «Medicina 2 o más»
  | { tipo: 'atributo'; atributo: Atributo; min: number }                         // «Voluntad 4» (Últimas reservas)
  | { tipo: 'poder'; arte: ArteMetalica; metal: MetalFeruquimicoId | string }    // «poder Feruquimia de acero»
  | { tipo: 'talento'; nombres: string[]; modo: 'todos' | 'alguno' }              // «Reflejos acelerados o Estallido de velocidad»
  | { tipo: 'talentoPrincipal' }                                                  // «talento principal Herencia …»
  | { tipo: 'eleccionPoderes'; condicion: 'mismoMetal' | 'metalesDistintos' }     // Componedor / Resonancia aleada
  | { tipo: 'ascendencia'; valores: ('humana' | 'sangre_koloss')[] }

export interface TalentoPoder {
  name: string
  cost: ActivationType          // '1'→action1, '2'→action2, '3'→action3, '0'→free, 'r'→reaction, '*'→special, '8'→passive
  prereq?: string               // texto literal del libro
  prerrequisitos: PrerrequisitoPoder[]
  description: string
  compartidoCon?: { arte: ArteMetalica; metal: string }[]   // Reflejos acelerados, Armamento de brazo de peltre…
  notaLibro?: string
}

export interface AccionFeruquimica {
  nombre: string                // «Almacenar velocidad» / «Decantar velocidad»
  tipo: 'almacenar' | 'decantar'
  activacion: ActivationType    // siempre 'action1' en el libro
  duracion: 'unaCargaPorEscena' | 'gradosRondas' | 'instantanea' | 'otra'
  duracionTexto: string         // «1 carga por categoría de edad y por escena»…
  costeCargas: number | 'hastaLimite'
  mantenerComoGratuita: boolean // false en bendaleo, bronce, cobre (instantáneas)
  efectos: string[]             // los «◆» del libro
}

export interface PoderFeruquimico {
  id: MetalFeruquimicoId
  nombre: string                // «Feruquimia de acero»
  rasgo: string                 // «Velocidad»
  categoria: CategoriaFeruquimica
  eraEntrada: Era | null        // etiqueta del encabezado (null = sin etiqueta)
  disponibilidad: DisponibilidadMetal
  nombreFerrin: string          // «mensajero de acero»
  emparejadoCon: MetalFeruquimicoId | null
  puroOAleacion: 'puro' | 'aleacion' | null
  desbloqueadoPor: CaminoNacidoDelMetalId[]   // atium: ['feruquimista']; bendaleo/cadmio/cromo: ['ferrin','nacidoble']; nicrosil: []
  desbloqueadoPorClavo: boolean               // true salvo atium (no hay clavo de atium)
  tieneArbol: boolean                         // false solo en nicrosil
  almacenar: AccionFeruquimica
  decantar: AccionFeruquimica
  tablaPorGrados?: { grados: number; valor: string }[]   // solo cobre (duración del recuerdo)
  talentos: TalentoPoder[]
  medallon: { disponibleParaPJ: boolean; rangoRecompensa: number | null }   // nicrosil: false / null
  paginaLibro: [number, number]
  cargasConVinculo: boolean                   // cobre, bendaleo (con talentos), nicrosil
}

export interface CaminoNacidoDelMetal {
  id: CaminoNacidoDelMetalId
  nombre: string
  eras: Era[]
  artes: ArteMetalica[]                       // ['alomancia'] | ['feruquimia'] | ['alomancia','feruquimia']
  poderes: { alomanticos: number | 'todos'; feruquimicos: number | 'todos' }
  habilidadesInvestidas: HabilidadInvestida[]
  habilidadInicialCamino: string | null       // Alomancia | null | Feruquimia | Disciplina
  ascendenciaRequerida: ('humana' | 'sangre_koloss')[]
  talentoPrincipal: {
    nombre: string                            // «Ruptura de brumoso»
    tipo: 'ruptura' | 'herencia' | 'herenciaRuptura'
    investiduraInicial: boolean               // Investidura 2 + máx(DIS,PRE) y Beber vial
    gradosIniciales: Partial<Record<HabilidadInvestida, number>>
    metas: ('entrenarPoder' | 'fabricarMente')[]
    prerrequisitos: PrerrequisitoPoder[]
  }
  arbol: TalentoPoder[]                       // 5 | 6 | 6 | 5 | 11 sin contar el principal
  excluyeA: CaminoNacidoDelMetalId[]
  soloExperimentados: boolean
}

export interface TipoClavo {                  // tabla L.291
  metal: 'cinc' | 'cobre' | 'estano' | 'hierro' | 'acero' | 'bendaleo' | 'bronce' | 'cadmio' | 'electro' | 'laton' | 'oro' | 'peltre'
  rangoBase: 2 | 3
  efecto:
    | { tipo: 'atributo'; atributo: 'voluntad' | 'intelecto' | 'discernimiento' | 'fuerza'; bono: 1 }
    | { tipo: 'poder'; arte: 'alomancia' | 'feruquimia'; categoria: string; opciones: string[] }  // «feruquimia de oro»…
}

// ── Estado del personaje (se guardaría en la API; ver §6.2) ──────────────────
export interface PoderPersonaje {
  id: number; characterId: number
  arte: 'alomancia' | 'feruquimia'
  metal: string
  origen: 'camino' | 'clavo' | 'lerasium'
  estado: 'naciente' | 'completo'
  metaId: number | null                       // Meta.id existente («Entrenar…/Fabricar…»)
  talentosTomados: string[]
}

export interface MenteDeMetal {
  id: number; characterId: number
  metal: MetalFeruquimicoId                   // UNA reserva por metal, aunque haya piezas de reserva
  cargasActuales: number
  reduccionComponedor: number                 // −1 cargas máx. permanente por cada Beber vial de Componedor
  integrada: boolean                          // «Mente de metal integrada»
  almacenando: boolean; decantando: { rondasRestantes: number } | null   // estado de escena (efímero)
  cargasVinculadas?: { clave: string; texto: string }[]   // cobre: vivencia/pericia; bendaleo: medicina/veneno; nicrosil: capacidad
  desligada: boolean; cargasMaxFija?: number  // mentes no vinculadas: 4 u 8
}

export interface ClavoHemalurgico {
  id: number; characterId: number
  metal: TipoClavo['metal']
  eleccionPoder?: string                      // «feruquimia de oro»
  implantado: boolean
  secreto: boolean                            // «clavo secreto» (L.289)
  rangoRecompensa: number                     // base + nº de clavos del mismo metal ya poseídos
}
```

### 6.1 Cálculos derivados [propuesta para el motor de reglas]
- `cargasMax = 2 + gradosFeruquimia + (tiene «Mentes de metal ampliadas» ? rango : 0) + (cobre y «Guardián del conocimiento» ? 5 : 0) − reduccionComponedor` (L.131, L.146, L.229, L.155).
- `limiteArtesMetalicas = max(1, gradosFeruquimia)`; dado y alcance por la tabla L.163; `duracionRondas = max(1, gradosFeruquimia)`.
- `mentesAlaVez = «Ancho de banda mental» ? modFeruquimia : max(1, Intelecto)` (solo feruquimista, L.131, L.146).
- `defensaEspiritual −= 2 por cada metal distinto con clavo + 5 por cada clavo repetido`; alerta Desorientado si ≤9 con ≥1 clavo (L.290). `clavosMax = min(rango, 3)` (L.289).
- `gradosEfectivos = gradosBase + clavos del mismo poder` (no cuentan para el tope de grados; L.290).
### 6.2 Persistencia sugerida [propuesta; no hay base en el repo todavía]
Tres colecciones por personaje (como `Meta`: tabla hija de `Character`): `PoderPersonaje`, `MenteDeMetal`, `ClavoHemalurgico`. Campos de personaje nuevos: `caminoNacidoDelMetal`, `investidura{max,actual}`, `desprovisto[]`, `viales[]`, `cuentasAtium`. El estado de escena (`almacenando`, `decantando`) es efímero. Ver `api_map.md` para dónde engancharlo.

## 7. Cuentas totales de talentos
| Bloque | Principales | Talentos de árbol | Total |
|---|---|---|---|
| Brumoso 1+5 · Nacido de la bruma 1+6 · Feruquimista 1+6 · Ferrin 1+5 · Nacidoble 1+11 | 5 | 33 | **38** |
| Feruquimia (17 poderes): acero 6, aluminio 3, atium 2, bendaleo 5, bronce 5, cadmio 5, cinc 6, cobre 6, cromo 6, duraluminio 5, electro 6, estaño 6, hierro 6, latón 6, **nicrosil 0**, oro 6, peltre 6 | — | **85** | **85** |
| Hemalurgia | — | 0 | 0 |
| **Total feruquimia + caminos** | 5 | 118 | **123** |

- Caminos: 19 nombres únicos de árbol; 7 se repiten en varios caminos (Investido, Trazas de metal y Quemar instintivamente ×3; Almacenamiento rápido, Mentes de metal ampliadas, Decantación instintiva y Mente de metal integrada ×3).
- Feruquimia: 84 nombres únicos (Reflejos acelerados ×2: acero y cinc); 3 compartidos con alomancia (Precisión de estaño, Armamento de brazo de peltre, Lanzador de peltre).
- Apoyo (fuera de mi ámbito; conteo automático por patrón, verificar con el lector de alomancia): ≈83 talentos de alomancia (103 entradas con «Activación» menos 20 acciones básicas «Quemar/Tragar/Empujón/Tirón»), es decir ≈168 talentos de poder en total; la estimación previa «≈150-165» del resumen del manual queda algo baja [inferido].

## 8. Hechos clave, dudas y cuestiones abiertas
### 8.1 [inferido] / dudas para quien implemente
1. **Mente al obtener feruquimia por clavo**: el libro dice que el clavo da «versión completa», la habilidad e Investidura si no la tenías (L.290) pero **no** menciona entregar una mente de metal ni la meta «Fabricar…». ¿Quién la proporciona? [inferido: la DJ o una recompensa/meta aparte]. Además el clavo da Investidura aunque feruquimia no la usa; es un recurso para alomancia y para el efecto de Componedor/Resonancia.
2. **Talentos de camino en poderes por clavo**: p. ej. «Almacenamiento rápido» exige «talento principal Herencia X»; un personaje con feruquimia solo por clavo no los tiene [inferido].
3. **Mentes llevadas a la vez** solo está definido para feruquimista (Intelecto/mod.). Para ferrin/nacidoble no hay tope escrito [inferido: no aplica práctico].
4. **Meta de nacidoble**: son dos metas independientes; ¿las dos pueden ir en paralelo? El texto las concede a la vez (L.155); no hay orden [inferido: sí].
5. **Era 1 del feruquimista** lista oro y atium; no incluye aluminio/duraluminio/electro salvo la nota L.372 de «final de Era 1» [inferido: opcional para la DJ].
6. **Lerasium** puro permite Ruptura de nacido de la bruma sin quitar otro talento principal (L.295) y da «+2 Investidura máx.»: afecta al modelo de exclusión; verificar en el lector de recompensas.
7. **Atium en feruquimia**: «no hay ningún ferrin de atium conocido» (L.218), solo feruquimista Era 1; pero **«Atium auténtico»** (contaminado con electro) es el que casi todos llaman atium.
8. **Geometría de los diagramas** (columnas/filas de cada árbol): solo en la imagen del PDF; el texto da orden de lectura y glifos pero no coordenadas. Si se quiere replicar el mapa de talentos como en Tormentas (`talentGrids.ts`), habrá que derivarlo de los prerrequisitos (profundidad = longitud de cadena) o transcribirlo de la imagen.
9. La **hoja de artes metálicas** (PDF 410) tiene 4 bloques (2 alomancia, 2 feruquimia) con campos: efecto, mod., alcance, dado, meta de nacido del metal, completada, cargas/viales, talentos. [inferido: 2+2 por maquetación; nacidos de la bruma/feruquimistas necesitan hojas extra].

### 8.2 Referencias cruzadas con el repositorio
- Glifos de activación → `cosmere-web/src/components/TalentActivation.tsx:9` y `cosmere-web/src/data/cantores.ts:18`; forma de talento → `cosmere-web/src/data/potencias.ts:3-10`; meta de 3 hitos → `cosmere-web/src/types/index.ts:146-156` (`Meta`).
- La API y la ficha son hoy específicas de Tormentas (ver `web_map.md`, `api_map.md`). La sesión paralela de formas de cantor (CharacterService.cs, TalentosReglas.cs, CharacterResponse.cs, FormasCantor.cs) es trabajo en curso que esta especificación no debe pisar.
