# Nacidos de la bruma (JdR del Cosmere, Devir) — Resumen de reglas para modelar en la app

Fuente: texto extraído del Manual de Nacidos de la bruma en español (`mistborn_flow.txt`).
Convención de páginas: **pág. libro = pág. PDF − 6** (se citan ambas como `L.xx / PDF yy`).
Los términos de juego se mantienen tal como los escribe el libro.

Aviso de fiabilidad: varias tablas salen desordenadas en la extracción (tabla de metales, armaduras, precios de viales,
armas). Donde he tenido que reconstruir filas por orden/alineación lo marco con **[inferido]**. Todo lo marcado como
"Implicación para el modelo" es mi interpretación, no texto del libro.

---

## 0. Hallazgos clave para el modelo de datos (leer primero)

1. **Mismo sistema base que el Archivo de las Tormentas** (Plotweaver): 6 atributos, 3 defensas, 18 habilidades, d20 + dado de trama,
   salud / concentración / Investidura, talentos en árboles, rangos 1-5, metas con 3 hitos. Los 6 caminos heroicos son los mismos.
2. **Lo nuevo es el bloque "nacido del metal"**: 5 caminos (brumoso, nacido de la bruma, feruquimista, ferrin, nacidoble),
   **mutuamente excluyentes** (al tomar el talento principal de uno ya no se accede a otro). No se eligen en la creación por
   ascendencia: se eligen **como camino inicial** (paso 2) **o más tarde, en cualquier nivel**, tomando su talento principal.
3. **Dos habilidades nuevas "Investidas"**: *Alomancia* (Voluntad) y *Feruquimia* (Intelecto), ambas cognitivas, que aparecen
   al tomar el talento principal (1 grado inicial). Encajan en los huecos de habilidad personalizada de la hoja.
4. **Investidura solo para alomantes**: `máx = 2 + máx(Discernimiento, Presencia) + bonos`; actual arranca en 0 en la creación;
   **solo se recupera con la acción "Beber vial"** (no con descansos). Las escenas empiezan al máximo (1 si Sorprendido).
5. **Feruquimia no usa Investidura**: usa **mentes de metal con cargas** (máx = 2 + grados de Feruquimia, +rango con
   "Mentes de metal ampliadas"); una reserva de cargas **por metal** (aunque haya varias piezas).
6. **Poder naciente vs. completo** por poder: cada poder nace "naciente" y se desbloquea al **completar una meta de nacido del
   metal** (la da el talento principal). Es el sustituto de los Ideales de los Radiantes. Estado a guardar por poder: `naciente | completo`.
7. **Cada metal es un "poder" con su propio árbol de talentos** (capítulo 6): 16 metales × 2 artes + atium. Los árboles se
   desbloquean con la meta del poder; los talentos tienen prerrequisitos de grados en Alomancia/Feruquimia y de otros talentos.
8. **Estado "Desprovisto [poder]"** (por poder, acumulable) y **viales**: metales comunes = suministro implícito; metales raros y
   atium (cuentas, aparte de la Investidura) = hay que contarlos.
9. **Moneda**: arquillas (ar); óbolo = 0,01 ar; nota de 1 = 10 ar. Era 2 multiplica ×10 el dinero inicial.
10. **Era 1 / Era 2** limitan ascendencias, culturas, caminos, metales y objetos (armas de fuego = Era 2). Una campaña puede
    cruzar eras. Se puede **mezclar con Archivo de las Tormentas** (el libro lo prevé; Investidura compartida en una sola reserva).
11. Hemalurgia: **no es un camino**; los clavos son **recompensa** (máx. 3 implantados, ≤ rango; bajan Defensa espiritual).
12. Las 18 habilidades son las mismas que en la hoja de Tormentas (nombres en este libro:
    *Armamento ligero/pesado*, *Hurto*, *Manufactura*, *Saber*, *Perspicacia*). La lista del encargo (Armas pesadas, Robo,
    Manualidades, Sabiduría…) no coincide con los nombres reales del libro.

---

## 1. Capítulo 1 — Creación de personajes (L.17-30 / PDF 23-36)

### 1.1 Pasos en orden (L.17 / PDF 23)
| # | Paso | Qué se decide |
|---|------|---------------|
| 1 | Orígenes | Ascendencia (humano / kandra / sangre koloss) + **hasta 2 pericias culturales** + nombre |
| 2 | Camino inicial | Un camino heroico (6) **o** un camino de nacido del metal (5); da habilidad inicial |
| 3 | Atributos | Repartir **12 puntos** entre 6 atributos, **máx. 3 por atributo** (0 permitido) |
| 4 | Habilidades y pericias | 1 grado gratis en habilidad inicial del camino + **4 grados** (máx. 2 por habilidad); pericias = valor de Intelecto |
| 5 | Talentos | Talento principal del camino inicial + talento(s) de ascendencia |
| 6 | Equipo | Un **equipo inicial** (7 opciones, cap. 7) + compras con arquillas |
| 7 | Historia | Propósito, ≥1 obstáculo, 1-2 metas, apariencia, conexiones |
| 8 | Cálculos finales | Salud, concentración, Investidura, defensas, desvío, nivel 1 |

Orden flexible (L.17). Hay que conocer antes la **era** de la partida (L.17). Los kandra no pueden tomar talentos de
caminos de nacido del metal (L.18).

### 1.2 ¿Cuándo se es nacido del metal? (L.18, L.128 / PDF 24, 134)
- **No es una ascendencia ni un talento de origen.** Humanos y sangre koloss pueden serlo; los kandra, no.
- Se puede empezar con un camino de nacido del metal como **camino inicial** (paso 2); su talento principal se toma en el
  paso 5 (nivel 1).
- O se toma el talento principal ("talento de ruptura" = alomantes; "talento de herencia" = feruquimia) **en cualquier nivel**
  (L.128). Representa el momento en que se descubren los poderes.
- Existe una **tabla aleatoria opcional** d20 de "Descubrimiento de artes metálicas" (L.129): 1-4 ninguno; resto según era.
  (Era 1: 5-9 brumoso, 10-14 brumoso, 15-17 nacido de la bruma, 18-20 feruquimista. Era 2: 5-9 ferrin, 10-14 brumoso,
  15-17 ferrin o brumoso, 18-20 nacidoble.)

### 1.3 Valores iniciales (nivel 1)
| Concepto | Valor | Fuente |
|----------|-------|--------|
| Atributos | 12 puntos, máx. 3 c/u (kandra: 6 puntos; sangre koloss: Fuerza hasta 4 y máx. de Fuerza +1) | L.20, L.34, L.38 |
| Máx. de atributo | 5 (efectos permanentes pueden superarlo) | L.27 |
| Grados de habilidad | 1 (habilidad inicial del camino, si la da) + 4 libres; **máx. 2 por habilidad** al crear | L.21 |
| Modificador de habilidad | grados + atributo + bonos | L.21 |
| Pericias | 2 culturales (paso 1) + tantas como **Intelecto** (adicionales) | L.21 |
| Salud máx. | 10 + Fuerza + bonos | L.26 |
| Concentración máx. | 2 + Voluntad + bonos | L.26 |
| **Investidura máx.** | **2 + (Discernimiento o Presencia, el mayor) + bonos**, solo con camino alomántico (brumoso, nacido de la bruma, nacidoble); **actual = 0** al crear | L.26 |
| Defensa física | 10 + Fuerza + Velocidad | L.26 |
| Defensa cognitiva | 10 + Intelecto + Voluntad | L.26 |
| Defensa espiritual | 10 + Discernimiento + Presencia | L.26 |
| Capacidad de levantamiento / movimiento / dado de recuperación / alcance de los sentidos | Tablas por Fuerza / Velocidad / Voluntad / Discernimiento (cap. 3) | L.20 |
| Desvío | 0 salvo armadura | L.23 |
| Talentos | 1 principal del camino inicial + ascendencia (humano: 1 talento de camino heroico; kandra: Forma natural + Disfraz kandra; koloss: Resistencia koloss) | L.23 |
| Metas | 1-2 + (si nacido del metal) la meta del talento principal | L.23-24, L.128 |
| Propósito / obstáculo | 1 / ≥1 (sin efecto mecánico) | L.23 |
| Dinero | por equipo inicial (arquillas) | L.254 |

Nota: el equipo inicial **Fugitivo** completa de inmediato la meta "Entrenar tu(s) poder(es)" y el de **Guardador** la meta
"Fabricar tu(s) mente(s) de metal" (L.255 / PDF 261).

### 1.4 Tabla "Progreso de los personajes" (L.29 / PDF 35) — ¿difiere de la estándar?
Columnas: **Rango | Nivel | Puntos de atributo | Salud obtenida | Grado máx. de habilidad | Grados en habilidad | Talentos obtenidos**.
No veo diferencias estructurales respecto a la tabla estándar del sistema (el motor de la app ya usa `maxSkillRank`
2/3/4/5 con el mismo patrón). Contenido:

| Rango | Niveles | Salud | Grado máx. | Atributo | Habilidad | Talentos |
|-------|---------|-------|-----------|----------|-----------|----------|
| 1 | 1 | 10 + FUE | 2 | 12 puntos | 4 grados (+1 del camino inicial) | 1 del camino inicial + ascendencia |
| 1 | 2-5 | +5 | 2 | +1 en nivel 3 | +2 grados | +1 talento |
| 2 | 6 | +4 + FUE | 3 | +1 (nivel 6) | +2 | +1 talento + talento de ascendencia |
| 2 | 7-10 | +4 | 3 | +1 en nivel 9 | +2 | +1 |
| 3 | 11 | +3 + FUE | 4 | | +2 | +1 + ascendencia |
| 3 | 12-15 | +3 | 4 | +1 en 12 y 15 | +2 | +1 |
| 4 | 16 | +2 + FUE | 5 | | +2 | +1 + ascendencia |
| 4 | 17-20 | +2 | 5 | +1 en 18 | +2 | +1 |
| 5 | 21+ | +1 | 5 | — | **o** +1 grado **o** +1 talento | (+ ascendencia solo en 21) |

Puntos de atributo: +1 en los niveles **3, 6, 9, 12, 15 y 18** (L.27). Talento de ascendencia al inicio de cada rango
(niveles 1, 6, 11, 16, 21) (L.28). Los hitos de nivel los marca la DJ (no hay XP). Pasos de subida: nivel → atributo →
salud → 2 grados → talento (L.27-28).

Reglas extra: los prerrequisitos solo cuentan efectos **permanentes** (no bonos temporales ni clavos). Rangos:
1 (niv. 1-5), 2 (6-10), 3 (11-15), 4 (16-20), 5 (21+) (L.27).
**Empezar en niveles altos** (L.369-370 / PDF 375-376): se crea a nivel 1 y se sube; el nacido del metal debe gastar recompensas
para desbloquear sus poderes (hay tabla de recompensas iniciales por rango: dinero y nº de recompensas).

---

## 2. Capítulo 2 — Orígenes (L.31-48 / PDF 37-54)

### 2.1 Ascendencias (L.32-39 / PDF 38-45)
| Ascendencia | Era | Tamaño | Mecánica |
|-------------|-----|--------|----------|
| **Humana** | ambas | Mediano | Talento adicional de ascendencia en niveles 1, 6, 11, 16, 21, **elegido de un camino heroico** (otro talento del camino actual o el primero de otro camino). Sin árbol propio. |
| **Kandra** | ambas (Era 1: generaciones 3.ª-10.ª, 2.ª/11.ª con permiso; Era 2: 11.ª) | Mediano | **Solo 6 puntos de atributo** (en vez de 12) + elegir una **Bendición**; **no puede tomar talentos de nacido del metal**; árbol kandra propio; Forma natural (principal) y Disfraz kandra gratis; talento adicional de ascendencia en rangos 2-5 (árbol kandra o heroico). |
| **Sangre koloss** | **solo Era 2** | Mediano | +1 al **máximo** de Fuerza; hasta 4 puntos de atributo en Fuerza al crear; talento principal **Resistencia koloss** (+1 salud máx. por nivel); árbol de sangre koloss; talento adicional en rangos 2-5 (árbol koloss o heroico). |

**Bendiciones kandra** (se elige 1 al crear; una 2.ª, distinta, como recompensa en rango 3; L.34-35 / PDF 40-41):
| Bendición | Efecto |
|-----------|--------|
| Consciencia | Discernimiento +2 (y su máximo +2) |
| Potencia | Fuerza +1 y Velocidad +1 (y sus máximos +1) |
| Presencia | Intelecto +1 y Presencia +1 (y sus máximos +1) |
| Estabilidad | Voluntad +2 (y su máximo +2) |
| Fortaleza | Desvío +1 (reduce también golpe bajo Disfraz kandra) |

Mientras lleve una Bendición no puede implantar otros clavos hemalúrgicos (los clavos de Bendición no tienen efectos
secundarios). Cuerpos verdaderos kandra = recompensa (cap. 8: madera/piedra/cristal/metal/aluminio, con atributos fijos).

**Talentos kandra** (árbol; L.35-37 / PDF 41-43): Forma natural (principal, prereq: ascendencia kandra) → Disfraz kandra →
Imitación improvisada (Perspicacia 2) → Remodelación rápida (Medicina 2; Imitación improvisada); Ocultar objeto (Disfraz kandra) →
Herramientas orgánicas (Hurto 2; Ocultar objeto); Formas desagradables (Medicina 4; Remodelación rápida); Formas creativas
(Perspicacia 3; Remodelación rápida o Herramientas orgánicas).
**Talentos sangre koloss** (L.38-39 / PDF 44-45): Resistencia koloss (principal) → Recuperación koloss (Atletismo 2) →
Recuperación rápida (Atletismo 3) → Recuperación reactiva (Atletismo 4); Tamaño desmedido (nivel 11; Resistencia koloss).

**Implicación para el modelo:** `ascendencia` pasa de {oyente/cantor, humano…} a incluir `humano`, `kandra`, `sangre koloss`;
la ascendencia cambia la **cantidad de puntos de atributo** (12 / 6), el **máximo** de atributos (koloss, Bendiciones) y
añade árboles de talentos propios. Humano/koloss/kandra no tienen "formas" ni equivalente a la forma de cantor.

### 2.2 Culturas = pericias culturales (elegir hasta 2; L.40-47 / PDF 46-53)
Mecánica de las culturas: **no tienen reglas propias**; son *pericias* (idiomas, conocimiento regional, "puedes hacer pruebas
de recordar…"). Cada una trae lista de nombres sugeridos. Algunas dan datos de juego (Elendel: conoces los metales alománticos;
Enclaves terrisanos: conoces los metales feruquímicos). Con permiso de la DJ se pueden inventar otras (subculturas, otras regiones).

| Pericia cultural | Era | Una línea |
|------------------|-----|-----------|
| Skaa | 1 | Pueblo oprimido del Imperio Final; comunidades, relatos largos, leyendas de brumosos |
| Luthadel | 1 | Capital; Ministerio de Acero, obligadores, inquisidores, nacidos de la bruma |
| Dominios Interiores | 1 | Elegir uno de 5 dominios (repetible); Grandes Casas, ceniza, agricultura |
| Dominio de Terris | 1 | Terrisanos, programa de reproducción/servidumbre; la feruquimia no es de dominio público |
| Dominios Exteriores | 1 | Elegir uno (Lejano, Creciente, Remoto, Islas Meridionales; repetible); koloss, tierras abrasadas |
| Elendel | 2 | Metrópolis de la Cuenca; gobierno/policía; octante de origen; nociones de alomancia |
| Sangre koloss | 2 | Clanes y comunidades de sangre koloss; Cuenca y Áridos |
| Malwish | 2 | Nación del sur; máscaras, medallones, aeronaves; religión Jaggenmire |
| Ciudades exteriores | 2 | Bilming, Nueva Seran… (repetible); logística y carga |
| Los Áridos | 2 | Frontera minera; ferrocarriles, compañías mineras, clanes koloss |
| Enclaves terrisanos | 2 | Aldea de Elendel y otros; Sínodo; nociones de feruquimia |
| Tierra Natal kandra | ambas | Normalmente solo kandra; Primer Contrato, Generaciones |
| Alta sociedad | ambas | Etiqueta y nobleza |
| Bajos fondos | ambas | Hampa, bandas, perista |
| Peregrina | ambas | Viajeros; geografía internacional |

Era-dependencia (L.371 / PDF 377): linajes humano y kandra en ambas eras; **sangre koloss solo Era 2**; las pericias culturales
se dividen en Era 1 / Era 2 / ambas. Kandra: Primer Contrato (Era 1, patrocinador humano que paga en atium) vs agente de Armonía (Era 2).

---

## 3. Capítulo 5 — Caminos de nacidos del metal (L.127-160 / PDF 133-166)

### 3.1 Reglas generales (L.127-133 / PDF 133-139; vistazo en L.19 / PDF 25)
**Estructura.** Funcionan como los caminos heroicos (talento principal + árbol), con estas diferencias:
- Son **excluyentes**: al elegir el talento principal de uno, no se puede acceder a otro camino de nacido del metal (L.127).
- No tienen "especialidades". Dan acceso a **≥ 2 árboles**: el del propio camino (talentos intrínsecos, cap. 5) **+ un árbol por cada
  poder de artes metálicas** al que acceda (cap. 6) (L.127).
- El talento principal es un **talento de ruptura** (alomancia) o **talento de herencia** (feruquimia). Se puede tomar en **cualquier nivel**.
- Al tomar el talento principal se obtiene **de inmediato**: una **meta de nacido del metal**, la habilidad Investida
  (Alomancia con Voluntad / Feruquimia con Intelecto, **1 grado inicial**), y según camino el valor de Investidura / acceso a mentes de metal (L.128).
- **Elección de poderes**: al tomar el talento principal se elige(n) el/los metal(es) (según era). Se pueden desbloquear más
  pares/poderes después con **nuevas metas** a discreción de la DJ (L.141, 146).
- **Talentos con meta**: mientras no se complete la meta del talento principal no se pueden tomar los talentos posteriores
  (L.75 / PDF 81). El poder solo se usa en versión **naciente** hasta entonces.

**Resumen de los 5 caminos** (tabla "Los caminos de nacidos del metal de un vistazo", L.19 / PDF 25):
| Camino | Era | Poderes | Habilidad inicial (grado gratis si es camino inicial) | Talento principal |
|--------|-----|---------|------------------------|-------------------|
| **Brumoso** | ambas | **1** poder alomántico | Alomancia (+1 grado de la Ruptura) | Ruptura de brumoso |
| **Nacido de la bruma** | **Era 1** | **todos** los alománticos | ninguna | Ruptura de nacido de la bruma |
| **Feruquimista** | **Era 1** | **todos** los feruquímicos | ninguna | Herencia feruquímica |
| **Ferrin** | **Era 2** | **1** poder feruquímico | Feruquimia (+1 de la Herencia) | Herencia ferrin |
| **Nacidoble** | **Era 2** | **1** alomántico + **1** feruquímico | **Disciplina** (+1 en Alomancia y +1 en Feruquimia al tomar la Herencia) | Herencia nacidoble |
Nacido de la bruma y Feruquimista: "solo recomendado para jugadores experimentados".

**Prerrequisitos de los talentos principales**: Ruptura de brumoso, Herencia ferrin, Herencia nacidoble → ascendencia **humana o sangre koloss**;
Ruptura de nacido de la bruma, Herencia feruquímica → ascendencia **humana**. Todos: "no tener ningún otro talento de ruptura o herencia"
(excepción: lerasium puro, cap. 8, permite Ruptura de nacido de la bruma aun teniendo otro).

### 3.2 Recursos / marcadores nuevos en el personaje
| Marcador | Quién | Regla |
|----------|-------|-------|
| **Investidura** (máx / actual) | brumoso, nacido de la bruma, nacidoble (y cualquiera con clavo alomántico) | máx = 2 + máx(DIS, PRE) + bonos; talento *Investido* suma +rango (crece al subir rango). Se gasta para activar poderes y **mantiene** efectos; a 0 → "no Investido" (L.129) |
| **Viales** | alomantes | Metales comunes (8): suministro implícito, mezclables; metales raros (mejora, temporales, divinos): llevar **registro individual de cada vial** salvo suministro recurrente; el vial raro lleva además los comunes. Durante descansos corto/largo se mezclan o separan (L.130, L.267) |
| **Beber vial (1 acción)** | alomantes | Recupera Investidura al máximo si el vial contiene un metal que puedes quemar; quita Desprovisto de poderes cuyos metales estén en el vial y **deja Desprovisto** de los que no (L.129). Metales no purificados: riesgo (1d6 vital por rango + Aturdido) |
| **Cuentas de atium** | alomantes de atium | Se llevan **aparte**; no dan Investidura (acciones Tragar atium / Quemar atium) (L.176) |
| **Desprovisto [metal/poder]** | alomantes, feruquimistas | Estado por poder, acumulable; puede anotarse "Investidura remanente" de un metal raro junto al estado (L.131) |
| **Mente de metal** (por metal) | feruquimistas, ferrin, nacidoble | Objeto Investido si tiene ≥1 carga; **cargas** máx = 2 + grados Feruquimia (+rango con *Mentes de metal ampliadas*); una **reserva compartida por metal**; la meta "Fabricar tu mente de metal" la otorga gratis la primera vez (L.131, L.133) |
| **Nº de mentes llevadas a la vez** | feruquimista | = **Intelecto** (mín. 1); *Ancho de banda mental* → = modificador de Feruquimia (L.146) |
| **Almacenar/Decantar** | feruquimia | Almacenar durante una escena = +1 carga; en descanso corto = 1 escena; en descanso largo = 2 escenas y Agotado [−1] (L.131, L.313) |
| **Meta de nacido del metal** | todos | 1 por poder (o por pareja): nombre, **3 hitos**, **completada** sí/no; con mentor se avanza el doble de rápido (L.133) |
| **Poder naciente / completo** | por poder | Naciente: solo efectos narrativos menores (L.162). Completo tras la meta |
| **Metas/recompensas de poder** | — | alomancia: "Entrenar tu(s) poder(es)"; feruquimia: "Fabricar tu(s) mente(s) de metal" |
| **Mod / alcance / dado / límite** | por habilidad Investida | derivados de los grados de Alomancia/Feruquimia (tabla en §4.1) |

**Implicación para el modelo:** hace falta una colección `poderes` por personaje:
`{arte: alomancia|feruquimia, metal, estado: naciente|completo, metaId, cargas/viales actuales, talentos tomados}`,
más `investidura`, `desprovisto: metal[]`, `cuentasAtium`, `mentesDeMetal{metal: {cargas, cargasMax}}`.

### 3.3 Alomancia: uso de la Investidura (L.129-131 / PDF 135-137) — puntos finos
- Las escenas empiezan con Investidura al máximo (se supone vial ya bebido). Si empiezas **Sorprendido**: **1** punto.
- Poder variable: se puede gastar hasta el **límite de artes metálicas** (= grados de Alomancia); gastar mucho = "avivar" (quemar rápido).
- Si la Investidura llega a 0 quedas "no Investido": no se mantienen efectos más allá de su duración.
- Metales de otras fuentes (monedas, cubiertos): Beber vial con posible prueba; impuros → complicaciones.
- Alomancia de atium, trazas de metal, savantismo (ver talentos del brumoso).

### 3.4 Los cinco caminos: talento principal + árbol (nombre — prerrequisito)
`★` en el libro = activación especial (*). Prerreq. "talento principal" = el de ese camino.

#### BRUMOSO (L.134-136, árbol en L.137 / PDF 140-143)
Principal: **Ruptura de brumoso** — ascendencia humana o sangre koloss; sin otra ruptura/herencia. Da: acceso a Investidura
(máx 2 + DIS/PRE), acción Beber vial, habilidad Alomancia (1 grado), **un** poder alomántico naciente (el atium se usa completo desde ya), meta "Entrenar tu poder" (excepto atium).
| Talento | Prerrequisito | Efecto resumido |
|---------|---------------|-----------------|
| Investido | Ruptura de brumoso | Investidura máx +rango (crece con rango) |
| Portentoso | Investido | +1 grado efectivo de Alomancia para alcance/límite; mantener cuesta −1 Investidura (mín. 1) |
| Quemar instintivamente ★ | Alomancia 3; Ruptura de brumoso | Tras descanso largo eliges un poder; puedes Quemar antes del primer turno de la escena |
| Trazas de metal | Alomancia 3; Investido | Puedes usar versión naciente con 0 Investidura o Desprovisto |
| Savantismo alomántico ★ | Alomancia 5; Portentoso | Meta "Convertirse en sabio" (≥7 días quemando casi constante, 1 avance/sesión); recompensa: +2 Investidura de amplificación y síntomas de abstinencia al estar Desprovisto |
Tabla opcional "Descubrimiento de alomancia" (d20 → metal, L.134). Ejemplos de construcción: Brisa (latón), Marasi (cadmio).

#### NACIDO DE LA BRUMA (L.138-142, árbol L.143 / PDF 144-149) — Era 1
Principal: **Ruptura de nacido de la bruma** — ascendencia **humana**; sin otra ruptura/herencia. Da: Investidura, Beber vial,
Alomancia (1 grado), **todos** los poderes alománticos de la era en versión naciente (atium completo), y se elige **una pareja
Empujón/Tirón** para la meta "Entrenar tus poderes" (pares adicionales, a discreción de la DJ).
| Talento | Prerrequisito |
|---------|---------------|
| Investido | Ruptura de nacido de la bruma |
| Mezcla metálica | Ruptura de nacido de la bruma (al hacer prueba de un poder gasta O para activar otros 2 poderes nacientes sin Investidura) |
| Quemar instintivamente ★ | Alomancia 3; Mezcla metálica |
| Quemar selectivamente ★ | Alomancia 3; Mezcla metálica (quedar Desprovisto del poder en vez de pagar Investidura = efecto con límite máx.) |
| Quemar simultáneamente | Alomancia 4; Quemar instintivamente (gasta 2 concentración para obtener 2 acciones solo para alomancia) |
| Trazas de metal | Alomancia 3; Investido |
Consejo de DJ: un solo nacido de la bruma completo por grupo; centrarse en pocos metales (L.140).

#### FERUQUIMISTA (L.144-147, árbol L.147 / PDF 150-153) — Era 1
Principal: **Herencia feruquímica** — ascendencia **humana**; sin otra ruptura/herencia. Da: habilidad Feruquimia (1 grado),
**todos** los poderes feruquímicos de la era en versión naciente; llevar tantas mentes como Intelecto (mín. 1); se elige un metal
puro + su aleación (o atium) para la meta "Fabricar tus mentes de metal".
| Talento | Prerrequisito |
|---------|---------------|
| Almacenamiento rápido | Feruquimia 2; Herencia feruquímica (acciones de Almacenar como 0) |
| Mentes de metal ampliadas | Herencia feruquímica (cargas máx +rango) |
| Ancho de banda mental | Feruquimia 3; Mentes de metal ampliadas |
| Decantación instintiva ★ | Feruquimia 3; Almacenamiento rápido |
| Decantación rápida | Feruquimia 4; Decantación instintiva (2 concentración → 1 acción para decantar) |
| Mente de metal integrada ★ | Feruquimia 4; Mentes de metal ampliadas |
Hasta **17 mentes** (16 metales + atium) = riesgo de dispersión (consejo de DJ, L.145).

#### FERRIN (L.148-151, árbol L.151 / PDF 154-157) — Era 2
Principal: **Herencia ferrin** — ascendencia humana o sangre koloss; sin otra ruptura/herencia. Da: Feruquimia (1 grado, +1 si camino inicial),
**un** poder feruquímico naciente, meta "Fabricar tu mente de metal". Nombre coloquial según metal (tabla d20 de la §4.2).
| Talento | Prerrequisito |
|---------|---------------|
| Almacenamiento rápido | Feruquimia 2; Herencia ferrin |
| Mentes de metal ampliadas | Herencia ferrin |
| Decantación instintiva ★ | Feruquimia 3; Almacenamiento rápido |
| Mente de metal integrada ★ | Feruquimia 4; Mentes de metal ampliadas |
| Últimas reservas ★ | Voluntad 4 o más; Mentes de metal ampliadas (1×/escena: sin cargas, 3 concentración = 1 carga) |

#### NACIDOBLE (L.152-159, árbol L.157 / PDF 158-165) — Era 2
Principal: **Herencia nacidoble** — ascendencia humana o sangre koloss; sin otra ruptura/herencia. Da: Investidura (2 + DIS/PRE), Beber vial,
habilidades **Alomancia y Feruquimia (1 grado cada una)**, **un** poder alomántico + **uno** feruquímico nacientes, **dos metas**
("Entrenar tu poder" y "Fabricar tu mente de metal"). Los metales **pueden ser distintos o iguales**; "resonancias" entre ambos.
| Talento | Prerrequisito |
|---------|---------------|
| Almacenamiento rápido | Feruquimia 2; Herencia nacidoble |
| Mentes de metal ampliadas | Herencia nacidoble |
| Investido | Herencia nacidoble |
| Quemar instintivamente ★ | Alomancia 3; Herencia nacidoble |
| Decantación instintiva ★ | Feruquimia 3; Almacenamiento rápido |
| Mente de metal integrada ★ | Feruquimia 4; Mentes de metal ampliadas |
| Trazas de metal | Alomancia 3; Investido |
| **Componedor** | Alomancia 3; Feruquimia 3; **ambos poderes con el mismo metal**; Mentes de metal ampliadas **o** Investido (Beber vial sobre un fragmento de la mente: −1 carga máx. permanente, gasta Investidura como cargas) |
| Composición recursiva | Alomancia 4; Feruquimia 4; Componedor (gasta Investidura para añadir cargas a la mente) |
| **Resonancia aleada** ★ | **poderes con metales distintos**; Mentes de metal ampliadas o Investido (1 carga → ventaja alomántica; 1 Investidura → ventaja feruquímica) |
| Sinergia metálica | Alomancia 3; Feruquimia 3; Resonancia aleada |
**Rama condicional:** Componedor requiere "mismo metal"; Resonancia aleada requiere "metales distintos" → son prerrequisitos
sobre las **elecciones de poderes**, no solo sobre grados/talentos. Ejemplos: Wax (acero + hierro), Wayne (bendaleo + oro), Miles (oro + oro).

### 3.5 Metas y recompensas de nacido del metal (progreso) — ¿qué sustituye a los Ideales? (L.132-133 / PDF 138-139)
No hay Ideales/juramentos. El desbloqueo se hace por **metas** (3 hitos, como cualquier meta, cap. 8):
- **Alomancia**: "Entrenar tu(s) poder(es)" → recompensa: versión completa + acceso a talentos del árbol. Atium no la necesita.
- **Feruquimia**: "Fabricar tu(s) mente(s) de metal" → recompensa: mente de metal (gratis la 1.ª vez) + versión completa + talentos.
  Mentes de reserva del mismo metal no dan beneficio mecánico salvo si la original se pierde. Reparar: Manufactura CD 15.
- Savantismo alomántico: meta adicional "Convertirse en sabio".
- Recompensas generales (cap. 8): lerasium (nacido de la bruma), clavos, mentes de metal desligadas, medallones, etc. (ver §5.6).
- Los **rangos** (1-5) siguen siendo los de nivel; no hay un contador propio de "grados de poder" más allá de los **grados en
  Alomancia/Feruquimia** (máx. 5 normalmente; ≥6 solo vía hemalurgia/efectos especiales).

### 3.6 Caminos heroicos (compartidos con Tormentas) — tabla (L.19 / PDF 25)
| Camino | Especialidades | Habilidad inicial | Talento principal |
|--------|----------------|-------------------|-------------------|
| Agente | Investigador, Ladrón, Rebelde | Perspicacia | Oportunista |
| Cazador | Mataneblinos, Francotirador, Rastreador | Percepción | Buscar presa |
| Enviado | Estafador, Fiel, Mentor | Disciplina | Presencia imponente |
| Erudito | Cirujano, Estratega, Inventor (Era 2) | Saber | Ilustración |
| Guerrero | Alborotador, Pistolero (Era 2), Soldado | Atletismo | Posición vigilante |
| Líder | Planificador, Oficial, Político | Liderazgo | Mando decisivo |
Especialidades solo de ambientación: Mataneblinos, Inventor, Pistolero (Mistborn) / Artifabriano, Portador de esquirlada (Tormentas) (L.374-375).

---

## 4. Capítulo 6 — Artes metálicas (L.161-171 intro; ejemplos L.172-174, L.213-215, L.251 / PDF 167-177, 178-180, 219-221, 257)

### 4.1 Reglas comunes (L.161-165 / PDF 167-171)
- Tres artes: **alomancia** (quemar metal ingerido → efecto), **feruquimia** (almacenar un rasgo en una mente de metal y decantarlo),
  **hemalurgia** (clavos; no jugable como camino).
- Cada metal otorga **un poder por arte** (cada metal aparece dos veces: alomancia y feruquimia).
- **Poder naciente**: antes de completar la meta del poder solo efectos narrativos menores (elección consciente con la acción
  Usar una habilidad; esfuerzo instintivo gastando O; activación accidental con C; práctica controlada en reposo). Alomancia naciente:
  requiere ≥1 Investidura y no estar Desprovisto (la DJ puede pedir 1 Investidura). Feruquimia naciente: tocar un objeto con mucho
  metal (no es mente de metal, sin cargas). Hay una tabla de ejemplos por metal (L.162).
- **Progresión de las artes metálicas** (por grados de la habilidad Investida correspondiente) (L.163):

| Grados | Límite de artes metálicas | Dado de artes metálicas | Alcance de artes metálicas |
|--------|---------------------------|-------------------------|---------------------------|
| 0 | 1 | 1 (sin tirada) | 3 m |
| 1 | 1 | d4 | 6 m |
| 2 | 2 | d6 | 12 m |
| 3 | 3 | d8 | 24 m |
| 4 | 4 | d10 | 48 m |
| 5 | 5 | d12 | 96 m |
| 6 o más* | igual al rango | d20 | 192 m |
*Solo superable con hemalurgia u otros efectos especiales.
- **Límite**: máx. de Investidura o cargas que se pueden invertir en un único efecto. **Duración**: "1 ronda", "hasta el final de tu
  próximo turno" o "tantas rondas como grados" (mín. 1). **Mantener**: pagar el mismo coste como acción gratuita (0) antes de que expire.
- Duración fuera de combate (1 ronda ≈ 10 s combate / ~1 min conversación / 1-10 min empeño / ~10 min fuera de escena) (L.164).
- **Materiales alománticamente inertes** (sin metal, aluminio): no se pueden Tirar/Empujar; aluminio bloquea alomancia emocional
  en la cabeza, impide curación Investida alojado en el cuerpo, etc. (L.165).

### 4.2 Tabla de metales de Scadrial (L.168, L.171 / PDF 174, 177) **[inferido]** — columnas reconstruidas
**Categorías alomancia:** físicos (hierro, acero, estaño, peltre), mentales (cinc, latón, cobre, bronce), de mejora (cromo, nicrosil,
aluminio, duraluminio), temporales (cadmio, bendaleo, oro, electro), divinos. **Feruquimia:** físicos, cognitivos, espirituales, híbridos, divinos.
**Tirón/Empujón**: metal puro = Tirón; aleación = Empujón. **Metal emparejado** = su pareja (puro ↔ aleación).

| # | Metal | Alomancia: efecto | Nombre de brumoso | Pareja | Int/Ext · T/E | Cat. | Feruquimia: almacena | Nombre de ferrin | Cat. | Puro/Aleación | Era |
|---|-------|-------------------|-------------------|--------|-------------|------|----------------------|------------------|------|---------------|-----|
| 1 | Hierro | Tira de los metales cercanos | Atraedor | Acero | Ext · Tirón | Físico | **peso** | Ajustador | Físico | Puro | ambas |
| 2 | Acero | Empuja los metales cercanos | Lanzamonedas | Hierro | Ext · Empujón | Físico | **velocidad física** | Mensajero de acero | Físico | Aleación | ambas |
| 3 | Estaño | Agudiza tus sentidos | Ojo de estaño | Peltre | Int · Tirón | Físico | **sentidos** | Susurravientos | Físico | Puro | ambas |
| 4 | Peltre | Potencia tus capacidades físicas | Brazo de peltre / violento | Estaño | Int · Empujón | Físico | **fuerza** | Bruto (brazo de peltre) | Físico | Aleación | ambas |
| 5 | Cinc | Inflama las emociones ajenas | Encendedor | Latón | Ext · Tirón | Mental | **velocidad mental** | Chispeante | Cognitivo | Puro | ambas |
| 6 | Latón | Calma las emociones ajenas | Aplacador | Cinc | Ext · Empujón | Mental | **calor** | Alma de fuego | Cognitivo | Aleación | ambas |
| 7 | Cobre | Oculta el uso de artes Investidas cercanas | Ahumador / nube de cobre | Bronce | Int · Tirón | Mental | **recuerdos** | Archivero | Cognitivo | Puro | ambas |
| 8 | Bronce | Detecta el uso de artes Investidas | Buscador | Cobre | Int · Empujón | Mental | **desvelo** | Centinela | Cognitivo | Aleación | ambas |
| 9 | Cromo | Elimina las reservas de Investidura ajenas | Sanguijuela | Nicrosil | Ext · Tirón | Mejora | **Fortuna** (espiritual) | Hilador | Espiritual | Puro | Era 2 |
| 10 | Nicrosil | Potencia los efectos Investidos ajenos | Nicroestallante | Cromo | Ext · Empujón | Mejora | **capacidades Investidas** | Portaalmas | Espiritual | Aleación | Era 2 (no para PJ en medallón) |
| 11 | Aluminio | Elimina tus reservas de Investidura | Mosquito de aluminio / vacío | Duraluminio | Int · Tirón | Mejora | **Identidad** | Genuino | Espiritual | Puro | Era 2† |
| 12 | Duraluminio | Potencia tus efectos Investidos | Mosquito de duraluminio | Aluminio | Int · Empujón | Mejora | **Conexión** | Conector | Espiritual | Aleación | Era 2† |
| 13 | Cadmio | Burbuja de tiempo **ralentizado** | Pulsador | Bendaleo | Ext · Tirón | Temporal | **aliento** | Resollante | Híbrido | Puro | Era 2 |
| 14 | Bendaleo | Burbuja de tiempo **acelerado** | Deslizador | Cadmio | Ext · Empujón | Temporal | **nutrición** | Incorporador | Híbrido | Aleación | Era 2 |
| 15 | Oro | Revela tu pasado y yoes alternativos | Augur | Electro | Int · Tirón | Temporal | **salud** | Hacedor de sangre | Híbrido | Puro | ambas (brumosos de oro ocultos hasta casi el fin de Era 1) |
| 16 | Electro | Revela tus posibles futuros inmediatos | Oráculo | Oro | Int · Empujón | Temporal | **determinación** | Pináculo | Híbrido | Aleación | Era 2† |
| 17 | Atium | Revela los futuros inmediatos de los demás | Vidente | — | — | Divino | **juventud** | Cronodevanador | Divino | — | **Era 1** |
| — | Malatium | Revela pasado/yoes alternativos de los demás | Adivino | — | — | Divino | desconocido | — | — | — | Era 1 (no representado) |
| — | Lerasium / aleaciones | Te convierte en nacido de la bruma / brumoso del metal aleado | — | — | — | Divino | desconocido | — | — | — | Era 1 (recompensa) |
| — | Armonium / Trellium | desconocido | — | — | — | Divino | desconocido | — | — | — | Era 2 (no representado) |

† A finales de la Era 1, aluminio, duraluminio y electro dejan de ser secreto del Ministerio de Acero.
**Los "16 metales"** son los 16 primeros (8 comunes físicos+mentales; 8 raros = mejora + temporales). El atium (17.º) y demás divinos son aparte.
**Metales comunes**: los 8 físicos y mentales. **Raros**: mejora, temporales, divinos (L.167). Disponibilidad por era del
camino (L.372 / PDF 378): Era 1 feruquimista y nacido de la bruma = acero, atium, bronce, cinc, cobre, estaño, hierro, latón, **oro**, peltre;
Era 1 brumoso = igual **sin oro**; Era 2 (brumoso, ferrin, nacidoble) = los 16 metales (sin atium).
Alomancia de aluminio = poder "maldito" (agota Investidura y purga efectos Investidos); feruquimia de nicrosil: no disponible para PJ en medallones.

### 4.3 Forma de una entrada de poder (para el esquema de datos) (L.166 / PDF 172)
Cada entrada de metal tiene, en orden:
1. **Título**: "Alomancia de X" / "Feruquimia de X".
2. **Subtítulo**: alomancia = `Categoría – Interno/Externo – Tirón/Empujón` (atium: `Metal divino` + era);
   feruquimia = `Rasgo almacenado – Metal categoría` (p. ej. `Velocidad – Metal físico`).
3. Prosa de ambientación y consejos de elección ("Elección de…").
4. **Acciones** del poder (cada una con: nombre, **Activación** [nº de acciones 1/2/3, 0 acción gratuita, r reacción, * especial, 8 pasivo],
   **Duración**, reglas, y cláusula "antes de que termine puedes mantenerlo gastando el mismo coste como 0").
   - Alomancia: normalmente `Quemar X` (a veces más acciones: `Empujón de acero`, `Tirón de hierro`…).
   - Feruquimia: **exactamente dos**: `Almacenar <rasgo>` y `Decantar <rasgo>` (almacenar da un efecto, a menudo perjudicial, y +1 carga por escena completa;
     decantar gasta carga(s) y da un efecto beneficioso durante "grados en Feruquimia" rondas).
5. **Uso del poder**: reglas de dificultad (pruebas de Alomancia/Feruquimia opcionales, rara vez en feruquimia) + **Usos creativos**.
6. **Talentos del poder**: texto "Es posible desbloquear este árbol mediante el talento principal de los caminos de … o a través de un clavo hemalúrgico";
   cada talento: `Nombre · Prerrequisito (grados de Alomancia/Feruquimia, otras habilidades, talentos, "poder X") · Activación · texto`;
   más un **diagrama resumen** (≈1-2 líneas por talento). No tienen rangos propios: la profundidad se controla con prerrequisitos.
   Los talentos del primer nivel tienen como prerrequisito "poder Alomancia de X" / "poder Feruquimia de X".

**Ejemplo ALOMANCIA DE ACERO** (Físico – Externo – Empujón; L.172-174 / PDF 178-180):
- Acciones: *Quemar acero* (1 acción, 1 ronda, **gratis si tienes ≥1 Investidura**; percibes metal en el alcance; no detecta aluminio; con <6 grados no detecta objetos Investidos/integrados);
  *Empujón de acero* (1 acción, instantánea; gasta ≥1 Investidura hasta el límite; opciones **Propulsar** [6 m por Investidura] o **Lanzar una moneda** [ataque a distancia de Alomancia vs Defensa física, 1d4 de golpe que escala con el dado de artes metálicas]).
- Talentos (7): Ráfaga de monedas — poder Alomancia de acero; Prevenirse con palanca — poder Alomancia de acero;
  Experto en Empujones de acero — Alomancia 3; Prevenirse con palanca; Francotirador con monedas — Alomancia 3; Ráfaga de monedas;
  Disparo con empujón — Armamento pesado 2 o ligero 2; Ráfaga de monedas; Burbuja protectora — Alomancia 4; Experto en Empujones de acero;
  Vuelo de acero auténtico — Experto en Empujones de acero.
**Ejemplo FERUQUIMIA DE ACERO** (Velocidad – Metal físico; L.213-215 / PDF 219-221):
- Acciones: *Almacenar velocidad* (1, 1 carga por escena; Mermado [Velocidad −1], solo 1 Moverse por turno); *Decantar velocidad* (1, gasta 1 carga,
  duración = grados en Feruquimia; Mejorado [Velocidad +2]; un Moverse gratis por turno).
- Talentos (6): Esquiva acelerada — poder Feruquimia de acero; Repetir jugada — Feruquimia 2; Estallido de velocidad — Feruquimia 3; Repetir jugada;
  Reflejos acelerados — Feruquimia 3; Esquiva acelerada; Carrera de acero auténtica — Reflejos acelerados o Estallido de velocidad;
  Velocista de acero — Repetir jugada.
**ATIUM (alomancia)** es distinto (L.176-178 / PDF 182-184): sin versión naciente ni meta; acciones *Tragar atium* y *Quemar atium*; **cuentas** contadas
aparte; d20 fijados a 15 (propios) / 5 (enemigo) en interacciones físicas; 6 talentos (Maestría de las sombras, En el peor de los casos, Vidente social,
Despejar la mente, Precisión vital, Modo dios).

**¿Qué camino desbloquea qué árbol?** (por la frase de cada entrada)
- Alomancia: brumoso + nacidoble + nacido de la bruma → acero, bronce, cinc, cobre, duraluminio, electro, estaño, hierro, latón, peltre, oro;
  **solo brumoso + nacido de la bruma** → atium; **solo brumoso + nacidoble** → bendaleo, cadmio, cromo, nicrosil (Era 2, no existen para nacido de la bruma).
  Aluminio: sin árbol de talentos.
- Feruquimia: ferrin + nacidoble + feruquimista → acero, aluminio, bronce, cinc, cobre, duraluminio, electro, estaño, hierro, latón, oro, peltre;
  **solo feruquimista** → atium; **solo ferrin + nacidoble** → bendaleo, cadmio, cromo (Era 2). Nicrosil feruquimia: sin árbol.
- En todos los casos, también **mediante clavo hemalúrgico** (otorga el poder completo + habilidad + Investidura).

**Nº aproximado de talentos por poder** (conteo automático; ±1): 0 (alomancia de aluminio, feruquimia de nicrosil), 2 (alomancia de oro, de duraluminio,
feruquimia de atium), 3 (feruquimia de aluminio), 4-8 (la mayoría; ≈6). Total estimado ≈ 150-165 talentos de poderes. **[inferido]**

### 4.4 Hemalurgia (L.251 / PDF 257; reglas de uso en cap. 8, L.288-291 / PDF 294-297)
- **No es opción de creación**: "no incluye un camino específico de hemalurgo"; los PJ no la practican, solo obtienen **clavos ya cargados como recompensa**.
  Crear/cargar clavos (matando) queda para DJ/PNJ.
- Pericia especializada **Hemalurgo** (recompensa de rango 1) para implantar/extraer (acciones Implantar clavo [3, Medicina CD 20] y Extraer clavo [1, Medicina CD 10]).
- Límite: clavos implantados ≤ rango (máx. **3**); 4+ → el PJ pasa a PNJ (influencia de una Esquirla).
- Efectos (tabla L.291): cinc +1 Voluntad, cobre +1 Intelecto, estaño +1 Discernimiento, hierro +1 Fuerza (rango 2);
  acero → poder alomántico físico, peltre → feruquimia física, bronce → alomancia mental, latón → feruquimia cognitiva, cadmio → alomancia temporal,
  oro → feruquimia híbrida, electro → alomancia de mejora, bendaleo → feruquimia espiritual (rango 3). Duplicados suben el rango.
- Cada clavo baja la Defensa espiritual (−2 el primero de cada metal, −5 los adicionales); Defensa espiritual ≤9 → Desorientado al inicio de escena.
- Los poderes de clavo no generan resonancias en nacidobles.

---

## 5. Capítulo 7 — Objetos (L.253-267 / PDF 259-273; extra L.268-279 / PDF 274-285)

### 5.1 Divisa (L.254 / PDF 260)
Moneda única de seguimiento: **arquilla (ar)**. Tres denominaciones:
| Denominación | Valor | Notas |
|--------------|-------|-------|
| **Óbolo** | 0,01 ar | Metales comunes (hierro, estaño, bronce); monedas de 1, 5, 10, 20, 50 óbolos |
| **Arquilla** | 1 ar | Doble tamaño, metales preciosos; antes del Catacendro piezas de 2 y 5; en Era 2 más denominaciones |
| **Nota** (papel) | 1 nota = **10 ar** | Existe en ambas eras (en Era 1 solo entre nobleza); también 5, 10, 20, 50 |
Los precios del libro valen para ambas eras salvo indicación. Efigies cambian por era (cosmético). Dinero inicial: dados por equipo inicial,
**×10 en Era 2**. Hoja: campo "arquillas" (sin esferas/marcos infundidos).

### 5.2 Equipo inicial (7 opciones, L.254-255 / PDF 260-261)
Artesano (4d8 ar), Bajos fondos (1d20), **Fugitivo** (sin armas/armadura/dinero; completa meta inicial alomántica), **Guardador** (sin armas/dinero; completa meta de mente de metal),
Indagador (3d12; pericia Literatura), Mercenario (2d6), Noble (4d20; patrocinador). Cada uno: armas, armadura, equipo, dinero y a veces beneficio intangible
(conexión/patrocinador, ruptura, pericia).

### 5.3 Armas
Columnas: Tipo · Habilidad · Daño · Alcance · Rasgos · Rasgos de experto · Peso · Precio. Alcance cuerpo a cuerpo `[+X m]` o a distancia `[corto/largo]`.
- **Armamento ligero** (L.258): bastón de madera 1d6 golpe, cuchillo 1d4, daga de cristal 1d4 (inerte, Frágil), espada lateral 1d6, lanza corta 1d8, maza 1d6 golpe,
  arco corto 1d6 [24/96], honda 1d4 golpe [9/36].
- **Armamento pesado** (L.259): alabarda 1d10, escudo 1d4, escudo de madera 1d6, espada larga 1d8, hacha 1d6, hacha de obsidiana 1d6, lanza larga 1d8 [+1,5], martillo 1d10,
  arco largo 1d6 [45/180], ballesta 1d8 [30/120]. (precios 5-100 ar; asignación peso/precio **[inferido]**)
- **Armas especiales** (L.260): arma improvisada, ataque sin armas (Atletismo; daño por Fuerza: 0-2 → 1; 3-4 → 1d4; 5-6 → 1d8; 7-8 → 2d6; 9+ → 2d10 golpe),
  **bastón de duelo** (1d8 golpe, Armamento pesado o ligero, 40 ar, pericia especializada), **hoja koloss** (1d12 golpe, solo recompensa, Voluminosa [6], Mortífera),
  **palo de ruido** (1d4, 100 ar).
- **Armas de fuego — SÍ, solo Era 2** (L.262 / PDF 268) **[inferido en precios/pesos]**:
  | Arma | Hab. | Daño | Alcance | Rasgos | ≈Precio |
  |------|------|------|---------|--------|---------|
  | Granada de fragmentación | ligero | 2d4 lac. | [6/18] | Explosiva [5], Peligrosa, Perforante, Desechable, Arrojadiza | 75 |
  | Fusil de caza | ligero | 1d8 lac. | [45/180] | Cargada [1], Perforante, A dos manos | 400 |
  | Pistola de bota | ligero | 1d4 lac. | [6/12] | Discreta, Cargada [1], Perforante | 125 |
  | Pistola de cañón corto | ligero | 1d4 lac. | [6/18] | Cargada [6], Perforante | 175 |
  | Revólver | ligero | 1d6 lac. | [6/24] | Cargada [6], Perforante, A dos manos (experto: pierde A dos manos) | 250 |
  | Granada de conmoción | pesado | 2d6 golpe | [6/18] | Explosiva [10], Peligrosa, Desechable | 50 |
  | Cañón de mano | pesado | 1d8 lac. | [6/24] | Cargada [6], Perforante | 300 |
  | Carabina | pesado | 1d8 lac. | [24/96] | Cargada [4], Perforante, A dos manos | 750 |
  | Escopeta | pesado | 1d10 lac. | [6/18] | Peligrosa, Cargada [2], Perforante | 600 |
  | Fusil de cerrojo | pesado | 1d10 lac. | [45/180] | Cargada [1], Perforante, A dos manos | 600 |
  | Dinamita (1 cartucho) | pesado | 4d6 golpe | cuerpo a cuerpo/arrojar | Explosiva [9], Peligrosa, Desechable | 100 |
  | Ametralladora rotatoria | pesado | 3d4 lac. | [6/18] | Voluminosa [6], Peligrosa, Cargada [20], Perforante | 2500 |
  Tabla propia de Oportunidades/Complicaciones de armas de fuego; dinamita y ametralladora requieren patrocinador. Munición mataneblinos (Era 2), prototipos de armas de fuego (componentes: bayoneta, calibración, etc.).
- **Rasgos de arma NUEVOS respecto a una lista medieval** (L.257 / PDF 263): **Cargada [X]** (munición almacenada), **Explosiva [X]** (radio),
  **Perforante** (ignora desvío), **Peligrosa** (rasguño accidental a aliado con C), **Voluminosa [X]** (Fuerza mínima), **Discreta**, **Indirecta**, **Mortífera**, **Desechable**,
  **Frágil**, **Inercia**, **Defensiva**, **Preparación rápida**, **Mano secundaria**, **Arrojadiza [X/Y]**, **A dos manos**, **Única**. Además "rasgos de experto" que
  solo aplican con la **pericia** de esa arma (a veces quitan un rasgo malo).
- Armas **alománticamente inertes** (sin metal: cristal, madera, obsidiana, aluminio) no pueden ser movidas por hierro/acero.

### 5.4 Armaduras (L.264-266 / PDF 270-272) **[inferido en alineación de columnas]**
Reglas: solo 1 armadura a la vez; no se pone/quita en combate; en sociedad llama la atención salvo rasgo **Presentable**. Columnas: Tipo · **Valor de desvío** ·
Rasgos · Rasgos de experto · Peso · Precio. El desvío reduce daño por golpe, laceración y energía (no espiritual/vital).
| Armadura | Desvío | Rasgos | Precio |
|----------|--------|--------|--------|
| Uniforme | 0 | Presentable | 20 ar |
| **Capa de bruma** | 0 | Única (flecos ondeantes: ventaja Sigilo con ofuscación; desventaja a Percepción rival) | Solo recompensa (rango 1) |
| Cuero | 1 | — | 30 ar |
| **Gabán de bruma** (Era 2) | 1 | Presentable, Única | Solo recompensa (rango 1) |
| Coraza | 2 | Voluminosa [3] | 50 ar |
| Coraza de cerámica | 2 | Voluminosa [3], Frágil | ≈250 ar |
| Armadura de placas y malla | 3 | Voluminosa [4] | ≈200-1000 ar |
| Armadura de madera | 3 | Voluminosa [5], Frágil | ≈200-1000 ar |
Rasgos de armadura: Frágil, Presentable, Única, **Voluminosa [X]** (Ralentizado y desventaja en pruebas de Velocidad si Fuerza < X).

### 5.5 Viales de metal (L.267 / PDF 273)
- **Metales comunes**: gratis en la práctica (cualquier mezcla de los 8).
- Cada vial = limaduras/pepitas en alcohol o aceite. En descanso corto/largo se **mezclan o separan** viales para cualquier combinación de metales raros.
  Un vial de metal raro ya incluye los comunes que quiera el alomante.
- **Mecánica**: la acción *Beber vial* recupera Investidura al máximo (si contiene un metal quemable) y gestiona "Desprovisto" (§3.2). Los viales raros se **compran por unidad**
  (o se logra un **suministro recurrente** como recompensa).
- Precios de viales de metales raros **[inferido]**, Era 1 / Era 2: Aluminio 25/50; Atium 150 ar/cuenta / no disp.; Bendaleo no disp./500; Cadmio no disp./50;
  Cromo no disp./10; Duraluminio 25/50; Electro 10/50; Nicrosil no disp./50; Oro 5/25.
- Coste de **manufactura** con metales raros (L.273 / PDF 279): aluminio 500 (solo Era 2), atium 2500 (solo Era 1), bendaleo 2500, cadmio 1250, cromo 500, duraluminio 1250,
  electro 250/1250, nicrosil 250, oro 125/500.

### 5.6 ¿Equivalentes a los "fabriales" de Tormentas?
No hay un objeto único tipo fabrial, pero sí **objetos Investidos** con reglas (L.253 / PDF 259; cap. 8 L.286-295):
- **Objetos Investidos**: clavos hemalúrgicos, objetos infundidos, **mentes de metal con ≥1 carga** → resisten Tirón/Empujón; solo afecta quien tenga ≥6 grados de artes Investidas
  (p. ej. Mente de metal integrada, Ocultar objeto).
- **Cargas** genéricas de objetos (activar gastando 1 carga; recarga según objeto).
- **Mentes de metal**: se obtienen por meta; remodelables; **mentes de metal especiales** (integradas en un arma/objeto, característica avanzada de manufactura); **mentes de metal desligadas** (recompensa rango 2-3, 4 u 8 cargas; cualquiera con ese poder las decanta).
- **Medallones feruquímicos** (Era 2, recompensa; hasta 3 poderes; **8 cargas máx. por poder**; al decantar se gastan cargas, al almacenar no se generan; no recargables → canjear;
  rango de recompensa por metal: 1-2 por poder, nicrosil no disponible para PJ; L.293-294).
- **Granadas alománticas** (Era 2, almacenan Investidura 1/3/5 según rango).
- **Sombrero forrado de aluminio** (Era 2, bloquea influencia emocional/mental), objetos de aluminio (Era 2, 500 ar el metal).
- **Clavos hemalúrgicos** (ver §4.4), **Cuerpos verdaderos kandra**, **sillalibre** (Era 2, movilidad), **aeronave** (Era 2, solo recompensa rango 3+).
- **Muy distinto de las esferas de Tormentas**: no hay esferas infundidas como moneda ni fuente de Investidura.
- Equipo: aceite, arena metálica (confunde hierro/acero), antisépticos/anestésico, ganzúa, nudilleras (+1 paso al daño sin armas), venenos (3 niveles), ropa por estatus, etc.
  Alojamiento 0,2 / 1 / 5 / 25 / 40 ar; caballo 500 ar; trenes, barcos, aeronaves como vehículos (varios Era 2).

### 5.7 Manufactura (resumen; L.273-279 / PDF 279-285)
Pericia necesaria; materiales = mitad del precio; 50 ar de trabajo por jornada; prueba de Manufactura → 0-3 mejoras / inconvenientes (tabla d6);
características avanzadas (Adornado, Arma poco convencional, Compartimento oculto, Diseño letal, Equilibrio perfecto, Mente de metal especial); prototipos de armas de fuego (Era 2).

### 5.8 Recompensas del capítulo 8 relevantes (L.286-296 / PDF 292-302)
Metas de 3 hitos → recompensas por **rango** (compañeros, clavos hemalúrgicos, objetos especiales por rango, metales raros 10 g aluminio r1 / 3 cuentas de atium r2 /
aleación de lerasium r3 / lerasium puro r4+, suministros recurrentes por metal, patrocinadores, conexiones). **Lerasium puro** da talento de nacido de la bruma;
**aleación de lerasium** da el poder del metal aleado.

---

## 6. Capítulo 13 — Eras y mezcla de ambientaciones (L.371-376 / PDF 377-382)

### 6.1 Las eras
- **Era 1 — "El Mundo de Ceniza"**: Imperio Final (novelas de la trilogía original). Nacidos de la bruma, skaa/nobles/terrisanos oprimidos; tema oscuro (aviso de contenido).
  Ideas: rebeldes, ladrones, intriga cortesana. Tecnología sin armas de fuego.
- **Era 2 — "Cambio y revolución"**: ~300 años después del Catacendro (Aleación de ley → El metal perdido). Armas de fuego, aeronaves, electricidad, Elendel/Cuenca/Áridos/Malwish.
  Mayor diversidad de caminos y orígenes ("versátil").
- **Elección de era**: la DJ decide según intereses/tolerancia de los jugadores; repasa diferencias clave; discute metas antes; informar de destripes. Posibles campañas **entre eras**
  (aventura *El legado de los nacidos de la bruma*) y otras eras (Scadrial Clásico, Era de los Originadores) con más trabajo.

### 6.2 Qué cambia entre eras
| Aspecto | Era 1 | Era 2 |
|---------|-------|-------|
| Ascendencias | humano, kandra | humano, kandra, **sangre koloss** |
| Culturas (pericias) | Skaa, Luthadel, Dominios Interiores/Exteriores, Dominio de Terris | Elendel, sangre koloss, Malwish, Ciudades exteriores, Áridos, Enclaves terrisanos |
| Caminos heroicos | Especialidades recomendadas: Ladrón/Rebelde (Agente), Mataneblinos (Cazador), Oficial (Líder) | Investigador, Francotirador; **Inventor y Pistolero solo Era 2** |
| Caminos de nacido del metal | brumoso, **nacido de la bruma, feruquimista** | brumoso, **ferrin, nacidoble** |
| Metales | 8 comunes + oro (oculto) + atium (+ lerasium/malatium); al final aluminio, duraluminio, electro | los 16 (cromo, nicrosil, cadmio, bendaleo…); **sin atium/lerasium/malatium**; armonium/trellium no representados |
| Objetos | capa de bruma, hoja koloss (curiosidades en Era 2) | armas de fuego, gabán de bruma, sombrero de aluminio, granadas alománticas, medallones, aeronaves, sillalibre |
| Hemalurgia | inquisidores de acero | el Grupo la redescubre; Sangre Espectral |
| Dinero inicial | dado | **×10** |
| Kandra | Primer Contrato; atium como pago | libres; agentes de Armonía |

### 6.3 Mezclar con el Archivo de las Tormentas (L.374-375 / PDF 380-381)
- Se **puede** mezclar: "todos los objetos, recompensas, adversarios y otros elementos de juego de cualquiera de los libros pueden usarse conjuntamente sin apenas trabajo adicional".
  El libro **Manual de los saltamundos** (futuro) tendrá reglas completas de viaje entre mundos. La mezcla básica es decisión de la DJ.
- **Caminos heroicos**: ambos libros comparten los **mismos seis**; las especialidades con igual nombre son intercambiables; las exclusivas de ambientación
  (Artifabriano, Portador de esquirlada | Mataneblinos, Inventor, Pistolero) para personajes nativos o con acceso.
- **Artes Investidas**: solo se **nace** alomante/feruquimista con ascendencia scadriana; otros solo con **clavo hemalúrgico, lerasium o medallón feruquímico**. Las **potencias** (surges)
  están al alcance de cualquiera que forme vínculo Nahel con un spren.
- **Potencias + alomancia**: el personaje obtiene todas las habilidades; **una única reserva de Investidura compartida** (luz tormentosa + metales); se puede gastar para ambos;
  *Absorber luz tormentosa* a la vez que *Beber vial*; el estado **Desprovisto** se aplica por fuente (sin luz no hay potencias; sin metal no hay poder alomántico).
- Referencias cruzadas en las entradas: aluminio anula efectos de potenciación; feruquimia de nicrosil puede almacenar "potencia Radiante"; feruquimia de aluminio menciona
  "Radiante / Reclamación de luz tormentosa" (L.216-217).
- **Implicación para el modelo:** `ruleset` **no debería ser exclusivo**. Mejor: ajustes de campaña (`eras permitidas`, `ambientaciones activas`) + capacidades por personaje
  (`tieneNacidoDelMetal`, `tieneCaminoRadiante`) con **Investidura única**. Un campo "ruleset" por personaje solo sirve si se permite lo mixto.

---

## 7. Hoja de personaje (L.402-405 / PDF 408-411)
4 páginas. **Frente (PDF 408)** — campos en orden:
- Cabecera: nombre del jugador · nombre del personaje · **caminos** · **nivel** · **ascendencia**.
- Atributos y defensas por tipo: **físico** (Fuerza, Velocidad, Defensa física) · **cognitivo** (Intelecto, Voluntad, Defensa cognitiva) · **espiritual** (Discernimiento, Presencia, Defensa espiritual).
- **Salud** (máxima / actual) · **Desvío** · **Concentración** (actual / máxima) · **Investidura** (máxima / actual).
- 18 habilidades con atributo entre paréntesis (cada una: casillas de grados + modificador): Agilidad (VEL), Armamento ligero (VEL), Armamento pesado (FUE), Atletismo (FUE), Hurto (VEL), Sigilo (VEL) ·
  Deducción (INT), Disciplina (VOL), Intimidación (VOL), Manufactura (INT), Medicina (INT), Saber (INT) · Engaño (PRE), Liderazgo (PRE), Percepción (DIS), Perspicacia (DIS), Persuasión (PRE), Supervivencia (DIS) ·
  + **1 línea en blanco por columna** (física/cognitiva/espiritual) para habilidades extra (Alomancia, Feruquimia…).
- Capacidad de levantamiento · Movimiento · **Dado de recuperación** · **Alcance de los sentidos**.
- Estados y lesiones · Armas · Pericias · Talentos y capacidades.
**Reverso (PDF 409)**: cabecera repetida con atributos · aspecto del personaje · armadura y equipo · talentos (continuación) · **arquillas** · notas · **propósito** · **obstáculo** ·
**metas** (≈9 líneas, cada una con 3 casillas de hito) · **conexiones**.
**Hoja de artes metálicas (PDF 410)**: 4 bloques; cada uno: (cabecera "alomancia" o "feruquimia" con **mod. / alcance / dado**) · **efecto** · **meta de nacido del metal** + casilla **completada** ·
**cargas/viales** · **talentos**. Los ejemplos del libro anotan la acción del poder (p. ej. "Quemar estaño (1)", "Beber vial (1)") entre los talentos y capacidades.
**PDF 411**: "Alfabeto de acero y alfabeto de Terris" (tabla letra ↔ metal; ornamental, no es dato de juego).

**Campos que NO existen en la hoja de Tormentas / diferencias**:
- Nuevos: **Investidura** en la pieza principal (también existe en Tormentas para Radiantes, pero aquí depende de metal), **hoja de artes metálicas** (metas, cargas/viales, mod/alcance/dado por poder),
  habilidades **Alomancia/Feruquimia**, **arquillas** (moneda).
- No existen en Mistborn: **marcos/esferas infundidas**, **Ideales/juramentos**, **potencias/surges**, formas de cantor.

---

## 8. Habilidades (L.59-72 / PDF 65-78)
18 habilidades "básicas" (todos los personajes), grados 0-5 (tope por rango), modificador = atributo + grados; se tira **d20 + modificador** vs **CD** (10/15/20/25/30) o vs defensa del objetivo:

| Atributo | Habilidades |
|----------|-------------|
| **Velocidad** | Agilidad, Armamento ligero, Hurto, Sigilo |
| **Fuerza** | Armamento pesado, Atletismo |
| **Intelecto** | Deducción, Manufactura, Medicina, Saber |
| **Voluntad** | Disciplina, Intimidación |
| **Discernimiento** | Percepción, Perspicacia, Supervivencia |
| **Presencia** | Engaño, Liderazgo, Persuasión |

**Diferencias respecto a la lista del encargo (no a la del libro de Tormentas)**: los nombres reales son *Armamento ligero/pesado* (no "Armas…"), *Hurto* (no "Robo"),
*Manufactura* (no "Manualidades"), *Saber* (no "Sabiduría"), y existe **Perspicacia** (Discernimiento). *Atletismo* gobierna también el ataque sin armas; *Hurto* (Velocidad) es el robo/cerraduras.
En el libro de Tormentas ya usado por la app, `armasLigeras/armasPesadas/conocimiento` parecen equivaler a Armamento ligero/pesado y Saber (la app mapea "Saber" → `conocimiento`).
- **Habilidades Investidas (nuevas, no son de las 18):**
  - **Alomancia — Voluntad (cognitiva)**: se obtiene al tomar el talento principal de brumoso/nacido de la bruma/nacidoble (o clavo alomántico). Se usa en pruebas de poderes alománticos (como una de Agilidad);
    mod = Voluntad + grados; "límite / dado / alcance / duración" salen de los grados.
  - **Feruquimia — Intelecto (cognitiva)**: ferrin/feruquimista/nacidoble (o clavo). Las pruebas son raras; los grados determinan **cargas máx.** (2 + grados), duración, límite.
  - Se suben con los grados libres de cada nivel (como cualquier habilidad, hasta el máximo del rango). Con clavos: +1 grado extra que no cuenta para el máximo.
  - El atributo base afecta a muchas cosas: Voluntad → Alomancia, concentración, dado de recuperación; Intelecto → Feruquimia, mentes llevadas a la vez.
- Pericias: 5 categorías — en arma, en armadura, culturales, de utilidad, especializadas (solo por talentos/recompensas; p. ej. Hemalurgo, bastón de duelo, capa de bruma, hoja koloss, dinamita).

---

## 9. Checklist de modelado (inferencia mía)
1. **Ascendencia**: añadir `humano | kandra | sangre koloss`; campos: puntosAtributoBase (12/6), bonos de máximos de atributo, árboles propios; Bendición kandra (enum 5); sin forma de cantor.
2. **Camino**: `caminosHeroicos[]` (6, con especialidades) + `caminoNacidoDelMetal` (opcional, único) con su talento principal, **elegible en cualquier nivel**.
3. **Habilidades**: reutilizar las 18; Alomancia (VOL) y Feruquimia (INT) como habilidades extra con grados; derivar `límite`, `dado`, `alcance`, `duración`.
4. **Recursos**: Investidura (máx/actual), cuentas de atium, viales raros (por metal), mentes de metal (cargas por metal), estado Desprovisto[metal].
5. **Poderes**: entidad `PoderMetal {arte, metal, estado naciente|completo, metaId}` + árbol de talentos por metal (talentos con prerrequisitos de habilidad/talento/"poder").
6. **Metas**: ya existen (3 hitos); añadir tipo "nacido del metal" ligada a un poder (con casilla completada).
7. **Catálogo**: metales (16 + divinos) con efecto alomántico, rasgo feruquímico, categoría, era; armas (rasgos nuevos, armas de fuego Era 2), armaduras (desvío), viales, divisa (arquillas, óbolo, nota).
8. **Campaña**: `era` (1/2/mixta), ambientaciones activas; filtros de disponibilidad por era.
9. **Recompensas**: clavos hemalúrgicos (≤3, ≤rango, penalizan Defensa espiritual), medallones feruquímicos, mentes desligadas, granadas, objetos especiales por rango.

## 10. Límites de esta extracción
- Tablas de metales, armaduras, precios de viales y armas de fuego salieron desordenadas: las filas marcadas **[inferido]** se reconstruyeron cruzando con las tablas d20 de descubrimiento
  y con el texto narrativo. Recomendable contrastar contra el PDF original.
- No he leído las entradas completas de los otros 30 poderes (solo la estructura vía acero, atium y varias cabeceras); los conteos de talentos por poder son automáticos (±1).
- El PDF original de Nacidos de la bruma no está en el repositorio, así que no pude renderizar páginas para verificar tablas.
