# Auditoría de reglas: CosmereAPP frente al Manual de juego y la Guía del Mundo

Fecha: 3 de octubre de 2026. Solo análisis, sin cambios en el código.

Fuentes: `ART0001_MdAdlT_ESP_high.pdf` (Manual de juego, 392 páginas PDF; página PDF = página del libro + 4) y
`ARTO002_GdM_AdlT_ESP_.pdf` (Guía del Mundo, 280 páginas). Las páginas citadas abajo son **páginas PDF del Manual**
salvo que se indique «Guía».

## Correcciones aplicadas (3 de octubre de 2026, ficha de personaje)

- Salud máxima mostrada desde el desglose del servidor (incluye Robusto y la Fuerza de la forma).
- Mente ambiciosa: +2 a Defensa cognitiva en el motor de reglas.
- Bonos de la forma de cantor aplicados en el servidor a defensas, concentración, Investidura, salud y movimiento,
  con línea «Forma: X» en cada desglose (nuevo `FormasCantor.cs`, espejo de `cantores.ts`).
- Desvío: se toma el mayor entre armadura y forma, no la suma (nuevo campo `desvioCalculado`).
- Movimiento sin fricción pasa a situacional («mientras estás infundido con Abrasión»).
- Rango con tope en 5 en servidor y ficha; el nivel admite hasta 30.
- Réplica fulminante muestra los grados de Disciplina en lugar de +0.

Pendientes de la ficha: Atletismo con Fuerza, Investidura solo con Primer Ideal, validaciones de grados y
atributos, nombres de habilidades y ascendencia «Cantor».

## Método y cobertura

Se dividió la app en 13 áreas. Un agente por área leyó el código (API y web) y las páginas del libro correspondientes
y produjo hallazgos con cita del libro y `archivo:línea`. Cada discrepancia de severidad alta o media fue revisada
por un segundo agente escéptico que releyó la página y el código para refutarla, matizarla o confirmarla.

| Resultado | Hallazgos |
|---|---|
| Comparaciones totales | 350 |
| Correctas (coinciden con el libro) | 174 |
| Discrepancias | 42 |
| Parciales (dato correcto pero incompleto) | 88 |
| No implementadas (regla relevante ausente) | 34 |
| Añadidos sin base en el libro | 12 |
| Discrepancias verificadas por segundo agente | 61 (34 confirmadas, 26 matizadas, 1 refutada) |

## Lo que está bien

- **Fórmulas centrales de la ficha** (API, `CharacterService.cs` y `TalentosReglas.cs`): Defensas = 10 + dos
  atributos (p. 55), Concentración = 2 + Voluntad (p. 58), Investidura = 2 + mayor de Discernimiento/Presencia
  (p. 58), Salud por nivel según la tabla de progreso con Fuerza añadida en los niveles 1, 6, 11 y 16 (p. 29),
  Movimiento por Velocidad, dado de recuperación, alcance de sentidos, puntos de atributo por nivel.
- **Motor de talentos** (`talentGraph.ts`): un talento por nivel, talentos de ascendencia en 1/6/11/16/21,
  tope de grado de habilidad por rango (2/3/4/5), prerrequisitos de talento conectado, de habilidad, de nivel y de
  Ideal, talento principal gratuito del camino inicial. 24 de 39 comprobaciones correctas.
- **Caminos heroicos**: los 144 talentos de los seis caminos coinciden en nombre, prerrequisito, tipo de
  activación y efecto numérico. Las rejillas del diagrama coinciden salvo una duda en Rastreador.
- **Potencias**: atributo, órdenes, activación base, tabla de escalado y los 80 talentos coinciden en nombre,
  prerrequisito, activación y números.
- **Combate y aventuras** (enciclopedia): 30 de 41 comprobaciones correctas, incluidos los 14 estados, tipos de
  daño, tablas de lesiones, descansos, acciones, reacciones y pasos del ataque.
- **Catálogo**: tablas de armas y armaduras (daño, rasgos, desvío, pesos, alcances), esferas y marcos, capacidad de
  carga.
- **Metas**: tres hitos, conclusión con tres tipos, propósito y obstáculo, niveles por hito narrativo.
- **Cantores**: las 14 formas con spren y bonos numéricos, estructura del árbol, Mente ambiciosa (texto).

## Errores que producen números erróneos en la mesa (severidad alta, confirmados)

1. **Dado de trama con 12 caras.** `utils/dice.ts:82-89` define blanco ×4, Oportunidad ×3 y Complicación C1/C2/C3/C4.
   El libro (p. 12) define un d6 con 2 blancas, 2 Oportunidad y 2 Complicación (+2 y +4). Las probabilidades
   quedan sesgadas (Oportunidad 25 % en vez de 33 %) y existen resultados C1 y C3 que no existen en el juego.
2. **La Complicación no suma su bonificación.** El libro (p. 13) da +2 o +4 al d20 cuando el dado de trama muestra
   Complicación. `dice.ts:149` calcula `total = d20 + modificador` y la cara de trama es solo una etiqueta.
3. **20 y 1 naturales sustituyen al dado de trama.** `dice.ts:137-147`: con 20 natural no se tira el dado de trama y
   se fuerza Oportunidad; con 1 se fuerza C2. El libro (p. 14) dice que el natural es una Oportunidad o Complicación
   *adicional* que se acumula con el dado de trama, y que la Complicación por 1 natural no da bonificación.
4. **Modificador de daño a 0.** En Combate, `DiceRoller.tsx:1018-1028` autorrellena el modificador de ataque pero
   deja «Mod. daño» en 0. El libro (p. 310) suma al daño el modificador de la habilidad usada en el ataque.
5. **Intimidación con Presencia en el tirador.** `DiceRoller.tsx:45` mapea Intimidación a `presencia`; el libro
   (p. 67 y hoja de personaje) la asocia a Voluntad. La ficha (`CharacterDetailPage.tsx:397`) sí usa Voluntad, así
   que ficha y tirador discrepan.
6. **Salud máxima mostrada ignora talentos.** `CharacterDetailPage.tsx:520` calcula la salud en cliente con nivel y
   Fuerza y marca como deprecado el desglose del servidor, que sí incluye Robusto (+1 por nivel, p. 80) y
   cualquier otra bonificación. Un personaje con Robusto ve menos salud de la real.
7. **Defensas del PNJ con atributos cruzados.** `GlobalNpcDetailPage.tsx:32` y `:45` agrupan Cognitivo = INT + DIS y
   Espiritual = VOL + PRE. El libro (p. 28) dice Cognitiva = INT + VOL y Espiritual = DIS + PRE. Ejemplo con el
   Guardia de la Guía (INT 1, VOL 2, DIS 3, PRE 1): libro 13/14, app 14/12.
8. **Habilidades del PNJ con atributo equivocado.** `GlobalNpcDetailPage.tsx:35-36` pone Disciplina e Intimidación con
   DIS (libro: VOL) y `:51` pone Supervivencia con VOL (libro: DIS, p. 60).
9. **Mente ambiciosa sin el +2 a Defensa cognitiva.** El libro (p. 39) dice «Aumenta tu Defensa cognitiva en 2».
   `TalentosReglas.cs` no tiene regla para este talento; solo aparece como texto en `cantores.ts:188`.

## Discrepancias de severidad media confirmadas

### Ficha, formas y motor de reglas
- **Atletismo con Velocidad en la ficha** (`CharacterDetailPage.tsx:383`). El texto de reglas (pp. 53 y 65) dice
  Fuerza; la hoja de personaje impresa del libro (p. 23) dice «(vel)», así que el libro se contradice. El tirador
  (`DiceRoller.tsx:40`) usa Fuerza, de modo que la app es incoherente consigo misma.
- **Bonos de forma de cantor no llegan a defensas, movimiento ni salud.** La web suma los bonos a atributos,
  habilidades, concentración y desvío, pero el servidor (`CharacterService.cs:286-314`) calcula defensas, salud y
  movimiento con los atributos base. El libro (p. 37) dice que la forma otorga «aumentos de características».
  Tampoco se suma el bono de Voluntad de la forma a la concentración máxima.
- **Investidura con solo asignar camino Radiante.** `CharacterService.cs:212-223` da 2 + máx(DIS, PRE) cuando
  `CaminoRadiante` no está vacío. El libro (p. 139) la concede al adquirir el talento Primer Ideal (nivel 2 o más).
- **Movimiento sin fricción siempre activo.** `TalentosReglas.cs:106-113` suma +3 m si hay camino Radiante. El libro
  (p. 218) lo condiciona a estar infundido con Abrasión; debería ser situacional.
- **Rango sin tope en el servidor.** `TalentosReglas.cs:200` usa `ceil(nivel/5)`, lo que da rango 6 a nivel 26. El
  libro tiene 5 rangos (p. 28). Solo afecta por encima del nivel 25.
- **Ideales jurados = 0 cuenta como jurado.** `talentGraph.ts:688-691`: si el campo está a 0 (valor por defecto), un
  Ideal aprendido se considera pronunciado y deja encadenar Ideales sin la meta (p. 74). Decisión deliberada, pero
  conviene distinguir «sin marcar» de «0 jurados».
- **Ascendencia «Oyente».** `CharacterService.cs:23` solo acepta Humano y Oyente. El libro (pp. 34-35) llama a la
  ascendencia «cantora»; oyente es una cultura, y un cantor puede no ser oyente.

### Tirador de dados
- **Ventaja en daño re-tira todo el conjunto** (`dice.ts:162-195`). El libro (p. 62) aplica cada ventaja a *un* dado
  concreto (se tira dos veces ese dado). Con varios dados de daño, la app sobrestima el efecto.
- **Una sola ventaja, solo al d20.** El libro permite varias ventajas asignadas a dados distintos, incluido el dado
  de trama, y que cada desventaja anule una ventaja.
- No existen CD, defensa del objetivo, éxito/fallo, rasguño ni impacto crítico (gastar Oportunidad para maximizar
  dados, p. 310). El daño se muestra siempre, aunque el ataque pudiera fallar.

### Contenido transcrito (datos estáticos)
- **Desenlace seguro** (`heroicPaths.ts:122`): la lógica está invertida. Libro (p. 82): «Si el dado mostraba O, dale la
  vuelta a C4. Si mostraba cualquier C, dale la vuelta a O».
- **Trampa mortal** (`heroicPaths.ts:394`): la trampa de empalamiento hace daño «por laceración», no «vital»; faltan
  la lesión por Oportunidad y que no puede hacer rasguño (p. 92).
- **Derribo sutil** (`heroicPaths.ts:157`): falta que el agarre supera la prueba automáticamente y deja Tumbado.
- **Acometida con finta** (`heroicPaths.ts:922`): las 2 acciones por Oportunidad solo valen para Acometida o activar
  una posición (p. 114).
- **Mando decisivo** (`heroicPaths.ts:1099`): falta el plazo «antes del final de su siguiente turno» y que no se
  puede aplicar al dado de trama (p. 119).
- **Glifos del PDF como letras** en `talentSummaries.ts` (l. 33, 49, 51, 73, 75, 90, 189, 191, 206, 222, 230):
  «retirar C», «añadir O», «como 0», «obtienes 2 para usar». Son iconos de Complicación, Oportunidad y acciones.
- **Parada de tensión** (`potencias.ts:225`): inventa «si convierte el impacto en fallo, no hace rasguño». El libro
  (p. 237) dice que si el ataque hace rasguño, el objetivo ignora sus efectos.
- **Entropía desatada** (`potencias.ts:160`): falta «(pero no sus talentos)». **Control delicado** (`:231`): faltan
  salud 5 × grados y defensas 10 + modificador del objeto.
- **Nota obsoleta en `PotenciasPage.tsx:267` y `:280`**: dice que Transportación no está incluida, pero sí lo está.
- **Ideales de las órdenes** (`radiantOrders.ts`, campo `ideals`): en las cinco órdenes de la segunda mitad del
  capítulo (Portadores del Polvo, Rompedores del Cielo, Tejedores de Luz, Vigilantes de la Verdad, Forjadores de
  Vínculos) las frases son inventadas; en las cinco primeras están parafraseadas. El libro da el texto sugerido del
  Segundo y Tercer Ideal de cada orden (pp. 136-211).
- **Prosa de spren y órdenes**: Portadores del Polvo (`radiantOrders.ts:271`), brumaspren (`:341`), lumispren (`:447`) y
  cumbrespren (`:480`) contradicen el libro (autocontrol y disciplina; brumaspren curiosos y pacientes; lumispren
  taciturnos y sin cambio de forma; cumbrespren joviales). Los campos `sprenPhilosophy` y `personality` no tienen
  base en el libro.
- **Nominadores de lo Otro** (`radiantOrders.ts:424`): el enjambre de logispren es la armadura del Cuarto Ideal, no la
  hoja del Tercero (p. 171).
- **Rejilla de Tejedores de Luz** (`talentGrids.ts:535-546`): Investido debe ir junto al Segundo Ideal, Regeneración
  de heridas junto al Tercero e Ilusión física junto al Cuarto (p. 196).
- **Primer Ideal** (`radiantOrders.ts:149-153`): falta que al completar la meta quedas Empoderado y obtienes 1 grado
  gratuito en cada habilidad de potencia (p. 139).
- **Cuarto Ideal de Rompedores del Cielo**: se pronuncia antes de completar la meta, al revés que las demás órdenes
  (p. 185). La app usa el texto genérico.
- **Rasgos del catálogo** (`SeedCatalogData.cs`): Voluminosa [X] es un requisito de Fuerza, no de capacidad de carga
  (pp. 249 y 256); Peligrosa daña a un aliado cercano, nunca al portador; Perforante ignora todo el desvío. Los
  rasgos con parámetro (Arrojadiza [6/18], [10/40], Cargada [1], Cuerpo a cuerpo [+1,5]) se guardan sin su valor.
- **Sorpresa** (`combatRules.ts:73`): dice que el Sorprendido no actúa en el primer turno. El libro (p. 299) dice que
  juega turno lento con una acción menos y sin reacciones. La ficha de estado en `aventuras.ts:243` sí es correcta.
- **Reacciones** (`CombatPage.tsx:121`): falta la regla base de una reacción por ronda (p. 308).

## Reglas relevantes no implementadas

- Grados de habilidad: presupuesto por nivel (4 + 1 iniciales, +2 por nivel) y tope por rango. El input admite 0-10
  sin aviso, a diferencia de los atributos (`CharacterDetailPage.tsx:1018`).
- Pericias (2 culturales + Intelecto, cinco categorías, pp. 55-57): no existen en la ficha.
- Tablas de CD de División bajo presión (p. 225) y de Transformación (p. 238), referenciadas por talentos.
- Árbol Iluminado de los Vigilantes de la Verdad (Vistazo al futuro, Buscar en el pasado, Alterar la fortuna, Vacío de
  visión y tabla de CD, pp. 208-209): solo existe Visión del futuro.
- Capacidades del spren con coste de concentración (p. 134) y la regla de empezar la escena con Investidura completa,
  o con 1 si estás Sorprendido (p. 128).
- Precio de armas y armaduras (pp. 250-256) y marcas «solo recompensa / solo talento».
- PNJ: desvío, movimiento, sentidos, inmunidades e idiomas sin campo propio (p. 348); rango y rol sin estructura.
- Combate: alcance corto/largo y objetivo no sentido (p. 312), caídas y terreno peligroso (p. 314), duración de los
  efectos (p. 299).
- Recompensas al concluir una meta (cap. 8, pp. 283-288).

## Límites de este análisis

- No se comparó bloque a bloque la semilla de adversarios de Caminapiedras (`SeedAllNpcs.cs`) con el Manual de la
  partida; solo el formato y un ejemplo.
- Las rejillas de los árboles se contrastaron por el orden de lectura del texto extraído, no con la imagen. La duda
  del Rastreador (filas 2 y 3) y el prerrequisito de Posición defensiva requieren mirar las páginas 89 y 113.
- El diagrama del d6 del dado de trama (p. 12) se interpretó a partir del texto; conviene confirmar qué cara da +2 y
  cuál +4 con la imagen.
- Guía del Mundo: solo se usaron las secciones de cantores y de adversarios. Capítulos 11 (Conversaciones) y 12
  (Empeños) del Manual no se compararon porque la app no los implementa.

## Orden sugerido para corregir

1. Tirador de dados: dado de trama de 6 caras, bonificación +2/+4, naturales acumulativos, modificador de daño,
   Intimidación con Voluntad. Todo en `utils/dice.ts` y `DiceRoller.tsx`.
2. Ficha de PNJ: agrupación de defensas y atributos de Disciplina, Intimidación y Supervivencia.
3. Ficha de personaje: usar la salud del servidor, Mente ambiciosa en `TalentosReglas.cs`, Atletismo coherente entre
   ficha y tirador, bonos de forma en el servidor.
4. Textos de talentos y órdenes con error de regla (Desenlace seguro, Parada de tensión, Acometida con finta,
   Trampa mortal, Mando decisivo, Sorpresa, rasgos del catálogo, glifos en `talentSummaries.ts`).
5. Ideales y prosa de las órdenes Radiantes.

Resultado completo por área (JSON) en el scratchpad de la sesión: `rules/resultado.json`.
