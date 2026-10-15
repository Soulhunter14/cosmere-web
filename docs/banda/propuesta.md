# La banda y su refugio — propuesta v1

> Campaña *El legado de los nacidos de la bruma* (Nacidos de la bruma). Propuesta del 14 oct 2026, **sin implementar**: espera tu visto
> bueno. Fuentes: Manual de Nacidos de la bruma (cap. 8 «Metas y recompensas» y cap. 9, el reposo), apéndices E y F de *El legado*,
> Guía del mundo (cap. 5 y 8) y la biblia de campaña («La banda», «Los actos», «Frentes y relojes», «El puente entre eras»).
> Convenciones: «L.x / PDF y» = página del Manual (libro / PDF); «Legado PDF n» y «GM PDF n» = página del PDF de la aventura y de la
> Guía del mundo; `[casero]` = regla nuestra; `[inferido]` = hueco del libro que rellenamos.

## 0. Resumen

La biblia ya decide que la banda es «un personaje más, con su propia hoja» (escala, tesorería, refugio, contactos, notoriedad y
reputación). Esta propuesta completa esa hoja con **trabajadores, mejoras y una fase entre sesiones**, y la lleva a la app:

| Pieza | Qué es | Base |
|---|---|---|
| **Hoja de banda** | Escala, tesorería, notoriedad, reputación por facción y tipo de organización con sus ventajas | Manual cap. 8 (organizaciones) + pistas caseras de la biblia |
| **Refugio** | La barcaza en la Era 1 (y un piso franco en Luthadel), la sede de Elendel en la Era 2; cada uno con sus mejoras | Manual cap. 8 (refugios y sus 7 mejoras) + 12 mejoras caseras |
| **Trabajadores** | PNJ a sueldo con oficio, rango (secuaz, rival, jefe), lealtad, puesto y órdenes | Casero, sobre las reglas oficiales de compañeros |
| **Fase de refugio** | Lo que pasa en cada reposo: cuentas, órdenes, actividades de los PJ, obras y un suceso | Manual cap. 9 (reposo) + apéndices E y F de *El legado* |
| **Metas de banda** | Metas de 3 hitos que, al concluir, dan una mejora de organización (crecer, refugio, transporte…) | Manual cap. 8 (metas de organización) |
| **Proyectos** | Obras de varias fases; la cripta del acto 4 es el gran proyecto | Minijuego de la cripta de *El legado* |
| **Herencia** | Lo que construye la banda de la Era 1 es lo que encuentran los Guardianes en la Era 2 | Biblia, «El puente entre eras» |

**Lo que alarga la campaña**: los siete reposos del libro (de 7 a 21 días) y tres momentos nuevos (el nacimiento de la banda en Urteau, el
cierre de la Era 1 y la sede de Elendel) se convierten en sesiones de banda con contenido propio: conseguir y mejorar el refugio, contratar y
perder gente, sucesos que empujan a los frentes. Estimación: **entre 8 y 13 sesiones más** (§3), sin tocar los tres puntos fijos de la Era 1.

**Entregas**: F1 «Hoja de banda» (la ven todos, la edita el director) → F2 «Fase de refugio» (cuentas, órdenes y sucesos; los jugadores
proponen desde el móvil) → F3 integraciones (pantalla del director, guion, diario, reparto de botín) → F4 proyectos (la cripta) y herencia
entre eras. Cada entrega se puede usar sola.

## 1. Decisiones por defecto (revisables)

| # | Decisión | Por qué |
|---|---|---|
| D1 | En la app: «La banda» (la página) y «Refugio» (la base). | Son los términos del Manual; «base» no aparece. |
| D2 | Lo oficial manda; lo nuestro se marca `[casero]` en los datos y con una etiqueta «Casero» en la app. | Regla del repositorio para los datos del libro. |
| D3 | Refugio de la Era 1: **la barcaza de Enge** (la del final de la sesión 0), con Enge como **patrocinadora**; desde el acto 3, un piso franco fijo en Luthadel. | Es lo que el libro da por hecho (la banda vive en una barcaza, Legado PDF 22 y 261) y resuelve moverse entre Urteau, Fellise y Luthadel. |
| D4 | Escala de 1 a 4, como en la biblia: sube al elegir «Reclutamiento» tras concluir una meta de banda, **sin el tope oficial por rango del líder** `[casero]`. | Con el tope oficial (escala máxima = rango del líder, L.297 / PDF 303) la banda seguiría en escala 1 hasta el nivel 6: toda la Era 1. |
| D5 | Una **fase de refugio por reposo**: la abre el director cuando pasan días (los reposos del libro y los huecos nuevos), no en cada sesión. | El Manual permite resolver el reposo entre sesiones, por chat (L.308 / PDF 314). |
| D6 | La app lleva las cuentas y tira las órdenes; el director confirma cada resultado y elige o tira el suceso. | Cero aritmética en la mesa; el director manda. |
| D7 | Estado = **un documento JSON por campaña** en el servidor (`CrewSheets.State`) con control de versión, más un documento **solo del director** (`GmState`) para secretos. | Las reglas cambiarán tras las primeras sesiones y el documento cambia sin migraciones. Mismo patrón que `GmScreens`. |
| D8 | Todos los miembros ven la hoja. En F1 solo el director la cambia; en F2 los jugadores **proponen** órdenes y actividades, y el director las adopta. | La banda es de todos, pero las cuentas no se pisan. |
| D9 | Núcleo Cosmere + catálogo por mundo: `features.banda` (Nacidos de la bruma sí, Archivo de las Tormentas no) y catálogo en `src/data/mistborn/banda/`, cargado con `useWorldData()`. | Principio de la biblia y de CLAUDE.md: el mecanismo es común, el contenido es del mundo. |
| D10 | Tiempo real: evento SignalR `CrewSheetUpdated` **sin datos**; los móviles recargan la hoja. | Si el director cambia la tesorería, la mesa lo ve al momento. |
| D11 | La tesorería de la banda va aparte del dinero de cada PJ; aportar y repartir llega en F3 con el `PATCH …/recursos` que ya existe. | No toca las reglas de la ficha. |
| D12 | La Era 2 será **otra campaña** de la app (la era es fija): al cerrar la Era 1 se exporta la herencia y se importa en la nueva (F4). | `Campaign.Era` no cambia después de crear la campaña. |

## 2. Las reglas

### 2.1 Qué es oficial y qué es nuestro

| Pieza | Tipo | Fuente |
|---|---|---|
| Organización: escala, metas de organización, mejoras de organización | Oficial | L.297-298 / PDF 303-304 |
| Tipos de organización y sus ventajas por escala | Oficial | L.298-300 / PDF 304-306 |
| Refugio básico, 7 mejoras y traslado (sin precios: los fija la DJ) | Oficial | L.300-301 / PDF 306-307 |
| Compañeros (secuaz, rival o jefe según el rango del PJ) | Oficial | L.286-287 / PDF 292-293; rangos de PNJ L.360 / PDF 366 |
| Patrocinadores | Oficial | L.296 / PDF 302 |
| Reposo y sus actividades; Manufactura | Oficial | L.307-310 / PDF 313-316; L.273-274 / PDF 279-280 |
| Actividades, oportunidades y complicaciones de los reposos de la aventura | Oficial (aventura) | Legado PDF 259-264 |
| Minijuego de la cripta (planos, trabajadores, materiales) | Oficial (aventura) | Legado PDF 77-78, 84-86, 250 |
| Los Guardianes (escala, orientación, préstamos) | Oficial (aventura) | Legado PDF 265-266 |
| Notoriedad 0-6 y reputación por facción −2..+2 | `[casero]`, ya decidido | Biblia, «Hoja de banda» |
| Trabajadores: oficios, sueldos, lealtad, puestos y órdenes | `[casero]`, nuevo | §2.5 y Anexo A |
| Precios de mejoras, mantenimiento, escasez del asedio, capacidad de los refugios, sucesos | `[casero]`, nuevo | Anexo A |

Los libros no traen sueldos, alquileres, mantenimiento, precios de mejoras, capacidad del refugio ni una escala de relación con los
contactos: eso es lo que rellena lo casero.

### 2.2 La hoja de banda

| Pista | Valores | Sube | Baja | Para qué sirve |
|---|---|---|---|---|
| **Escala** | 1-4 | «Reclutamiento» al concluir una meta de banda | perder el refugio principal o un contacto clave (biblia) | metas de banda a la vez = escala (oficial); trabajadores activos ≤ 3 × escala `[casero]`; ventajas de su tipo de organización |
| **Tesorería** | ar | pagos de encargos, contrabando, botín, beneficios | nóminas, mantenimiento, mejoras, sobornos | dinero común, aparte del de cada PJ |
| **Notoriedad** | 0-6 | golpes ruidosos, testigos, fracasos, pasquines (+1) | orden «Borrar el rastro» (−1), trasladar el refugio (−2) | se suma a la tirada de sucesos; a 3 o más, el frente activo actúa (biblia) |
| **Reputación** (por facción) | −2..+2 | encargos a su favor | encargos en su contra | candidatos y precios de esa facción (§2.7) |
| **Contactos** | hostil · tensa · neutral · aliada · leal | favores, encargos, «Enmendar relaciones» | traiciones, fracasos, abandono | un contacto leal puede ser compañero, patrocinador o trabajador |
| **Tipo de organización** | uno de cinco (Anexo A.1) | — | — | ventajas «una vez por sesión» según la escala (oficial) |
| **Refugios** | uno principal + pisos francos | §2.4 | §2.4 | mejoras y puestos de trabajo |
| **Trabajadores** | hasta 3 × escala | §2.5 | §2.5 | puestos y órdenes |
| **Metas de banda** | hasta «escala» a la vez, 3 hitos | ~1 hito por sesión | — | al concluir, una mejora de organización |

### 2.3 La banda como organización (oficial)

- Los PJ **lideran** la banda: deciden qué metas persigue, quién se encarga de cada una y cómo se gasta la tesorería (L.297 / PDF 303).
- **Metas de banda**: tantas a la vez como la escala, asignadas a uno o varios PJ; cuentan como metas suyas, avanzan más o menos un hito
  por sesión y, al concluir, no dan premio personal sino **una mejora de organización** (Anexo A.2): Equipo avanzado, Héroes del pueblo,
  Reclutamiento (+1 escala), Red de contactos ampliada, Red de transporte o Refugio (uno nuevo o una mejora gratis). Cada una se elige una
  sola vez, salvo Reclutamiento; cuando se agoten, un líder PJ puede crear con la DJ una mejora única (L.298 / PDF 304).
- **Tipo de organización**: la banda elige uno al nacer (Anexo A.1). Era 1: **Red criminal** si son contrabandistas, como en el libro, o
  **Célula de resistencia** si se alían con los Hijos de la Ceniza. Era 2: el que elijan (Club social, Empresa comercial…). Puede cambiar
  cuando la historia lo pida (L.297 / PDF 303).
- Ejemplos de metas de banda:

| Era | Meta | Hitos |
|---|---|---|
| 1 | Un nombre en Urteau | primer encargo limpio · un contacto aliado · que los skaa hablen de la banda |
| 1 | La barcaza a punto | dos mejoras · un barquero · una ruta segura por el canal |
| 1 | Una red en Luthadel | un piso franco · un informante · reputación +1 con los obreros |
| 1 | Ojos en la Élite | un infiltrado · una fortaleza vigilada · un secreto de Delina |
| 2 | Restablecer el refugio | la del libro tras la bomba del cap. 6 (Legado PDF 115-118) |
| 2 | Contraprensa | una imprenta · un periodista · desmentir un pasquín de Kwylliam |
| 2 | Linajes | encontrar a tres descendientes de trabajadores leales de la Era 1 |

### 2.4 Refugios y mejoras

- **Refugio básico** (oficial): escondite con alojamiento modesto que nadie nota si la banda no le lleva problemas (L.300 / PDF 306).
- **Tipos** `[casero]` (Anexo A.3): cada uno con capacidad de mejoras y mantenimiento semanal. La barcaza trae Movilidad de serie.
- **Mejoras** (Anexo A.4): las 7 oficiales (Almacén, Armería, Despensa, Mesa de trabajo, Mobiliario selecto, Movilidad, Reservas de metal) y
  12 caseras con sabor de la campaña (Escondrijo para el Clavo, Nube de cobre, Enfermería, Imprenta contra la prensa de Kwylliam…).
  Se consiguen de tres formas: como **recompensa** (mejora de organización «Refugio», metas, el libro), **comprándolas** (coste en ar +
  semanas de obra `[casero]`, la actividad «Mejoras del refugio» de la aventura) o por **legado** (una opción del legado del Novato, en la
  Era 2, da la Despensa o el Almacén, Legado PDF 26).
- **Estado**: seguro · comprometido (tras un suceso; no se usa hasta superar una prueba CD 15, como en la aventura) · perdido (el almacén
  del cap. 6 vuela por los aires). Una mejora dañada no da su efecto hasta repararla: mitad del coste y 1 semana `[casero]`.
- **Traslado** (oficial): lleva días y quizá dinero o logística; se conservan las mejoras y los rasgos del sitio que encajen en el nuevo
  (L.300 / PDF 306). `[casero]`: Movilidad solo se conserva si el nuevo refugio también es un vehículo; trasladarse baja la Notoriedad en 2.
- **Varios refugios** `[casero]`: uno principal (donde vive la banda) y pisos francos; un piso franco sin mejoras no paga mantenimiento.

### 2.5 Trabajadores `[casero, sobre «Compañeros»]`

- Un trabajador es un **PNJ a sueldo de la banda**: oficio (Anexo A.5), rango oficial de PNJ (secuaz, rival o jefe), sueldo semanal,
  lealtad 0-3, estado (activo, herido, preso, desaparecido, muerto, de baja), puesto y, si es nacido del metal, su metal.
- **Tope**: 3 × escala trabajadores activos.
- **Cómo llegan**: candidatos que ofrece el director en el tablón (1-3 por fase), la orden «Reclutar», contactos leales que se unen y los
  del libro (Roben se queda en la barcaza, Legado PDF 261; Merid, K. T. y Marthis como compañeros de rango 2, Legado PDF 190). Los
  personajes del canon no se contratan (biblia, «Canon y spoilers»). Candidatos del libro: Anexo A.11.
- **Sueldo** por semana, comida incluida (Era 1 / Era 2): secuaz 3 / 6 ar, rival 8 / 16 ar, jefe 20 / 40 ar; nacido del metal +10 / +20 ar.
  En la Era 1, la escasez del asedio lo multiplica (§2.6).
- **Lealtad 0-3**: empieza en 1 (contratado) o en 2 (viene de un contacto aliado o leal). Sube con un deseo personal cumplido, una paga
  extra (una semana) o cuando la banda le salva. Baja con cada fase sin cobrar, si le abandonan en una orden arriesgada o por un suceso.
  A 0 se va (o traiciona, si el director le guarda un secreto); a 3 es leal: aguanta una fase sin cobrar y en la Era 2 deja **linaje**.
- **Puesto**: cada trabajador activo vive en un refugio y, si su oficio lo pide, trabaja en una mejora concreta (la ahumadora en la Nube de
  cobre, el cocinero en la Despensa); su ventaja de puesto vale mientras esté ahí y su orden sea «En su puesto».
- **Compañero** (oficial): un trabajador puede salir con un PJ y cuenta para el límite de compañeros de su rango (L.286-287 / PDF 292-293);
  mientras tanto no da su ventaja de puesto ni cumple órdenes. Su ficha de combate es un perfil del catálogo de PNJ (Guardaespaldas,
  Informador, Matón, Soldado…) enlazado desde la app.
- **Órdenes** (Anexo A.6): una por trabajador y fase. Las que tienen prueba se tiran con d20 + 2 (secuaz), +4 (rival) o +6 (jefe), +2 si la
  orden es afín a su oficio, contra la CD de la orden.

### 2.6 La fase de refugio (el reposo de la banda)

Son los pasos «Reposo» y «El mundo se mueve» del bucle de juego de la biblia, con orden y cuentas:

1. **Abrir**: el director fija los días que pasan (semanas = días ÷ 7, redondeando hacia arriba) y el contexto (Era 1: la estación del asedio).
2. **Cuentas** (automáticas): ingresos (beneficio de la empresa comercial, a razón de su beneficio mensual ÷ 4 por semana; tapadera;
   ingreso semanal de patrocinadores y contactos) − (sueldos + mantenimiento) × escasez, todo por las semanas de la fase. Si la tesorería no
   llega, el director elige a quién no se paga: −1 de lealtad a cada uno, salvo a los leales en su primera fase sin cobrar.
3. **Órdenes y actividades**: una orden por trabajador; cada PJ elige su actividad de reposo (Manual cap. 9 y las de la aventura,
   Anexo A.10). En F2, los jugadores lo proponen desde el móvil.
4. **Resolución**: la app tira las órdenes con prueba (el director puede repetir o corregir) y las obras avanzan las semanas de la fase;
   cada efecto se aplica al confirmarlo.
5. **Suceso**: 1d20 + Notoriedad − vigilancia (−2 por la Red de vigías y −2 por cada trabajador con la orden «Vigilar», como máximo −4) en
   la tabla de la era (Anexo A.8). Bajo = oportunidad, medio = calma, alto = las complicaciones de la aventura; desde 21, el frente activo
   actúa contra la banda y abre la sesión siguiente.
6. **Cerrar**: un resumen pasa a la **crónica de la banda** y se reinician las ventajas «una vez por sesión».

En la mesa son 10-15 minutos; también se puede hacer por chat entre sesiones. **Escasez** (Era 1) `[casero]`: verano en Urteau ×1; otoño con
el asedio de Straff y Cett ×1,5; invierno con los koloss ×2. La Despensa libra al mantenimiento de la escasez y la orden «Abastecer» libra
a los sueldos.

*Ejemplo* (Era 1, escala 1, otoño, reposo de 21 días = 3 semanas): barcaza 4 ar + barquero y cocinera secuaces 3 + 3 ar + ahumadora rival
nacida del metal 8 + 10 ar = 28 ar/semana × 1,5 = 42 ar/semana → **126 ar**. La paga de la urna (600 ar, Legado PDF 31) cubre unas 14
semanas; una orden de contrabando trae 5d10 ar cada 5 días (unos 110 ar en la fase), con riesgo de perder al contrabandista.

### 2.7 Notoriedad, reputación, contactos y patrocinadores

- **Notoriedad** `[casero, biblia]` (0-6, la ven todos): lo que saben de la banda sus enemigos. A 3 o más, el frente activo actúa (biblia:
  Delina golpea a un contacto o al refugio; el Trío ataca el refugio y abre el acto 6). Se suma a la tirada de sucesos.
- **Reputación** `[casero, biblia]` por facción (Anexo A.9): con +1 o más, esa facción ofrece un candidato más por fase y un 10 % de
  descuento en sus servicios; con −1, no ofrece candidatos; con −2, sus sucesos se aplican contra la banda. Las facciones enemigas
  (Élite Dorada, Trío) están fijas en −2.
- **Contactos** `[casero, biblia]`: escalera hostil → tensa → neutral → aliada → leal; «Enmendar relaciones» (actividad de la aventura)
  sube un paso. Un contacto leal puede pasar a compañero, patrocinador o trabajador (con lealtad 3).
- **Patrocinadores** (oficial): dan comodidades donde llega su influencia y esperan lealtad y resultados; si no los obtienen, retiran su
  apoyo o delatan (L.296 / PDF 302). Era 1: **Enge** (la barcaza; desde el Crisol, en secreto, NeBaal). Era 2: los **Guardianes**
  (préstamos, investigación o infiltrados según su orientación, Legado PDF 265-266) y **Wilko** (reduce a la mitad el tiempo de
  investigación, Legado PDF 117).

### 2.8 Proyectos

- Un **proyecto** es una obra de varias semanas o de varios recursos: un piso franco, una tapadera, formar a un trabajador… y la cripta.
  Las mejoras en obra llevan su propia cuenta de semanas (§4.2).
- **La cripta** (acto 4) usa los tres recursos del libro: planos (un umbral que no se gasta), trabajadores (cada punto baja 2 la CD de una
  trampa) y materiales; trabajadores y materiales se gastan (Legado PDF 77-78, 84-86, 250). Lo que la banda construyó durante la campaña suma `[casero]`: +1 trabajador por cada
  trabajador artesano, +1 plano con la Mesa de trabajo o la Sala de mapas y +1 material con el Almacén. Así la cripta refleja toda la
  campaña, como pide la biblia.

### 2.9 Herencia entre eras

La tabla de la biblia («El puente entre eras») más tres filas `[casero]` (la de la barcaza ya está en la biblia):

| Al cerrar la Era 1 | En la Era 2 |
|---|---|
| Trabajadores leales (lealtad 3) | Linajes: sus descendientes aparecen como candidatos y contactos aliados |
| Mejoras del refugio | La sede de los Guardianes empieza con 2 de ellas, a elegir |
| La barcaza | Reliquia o lugar de Elendel con su nombre (ya propuesto en la biblia) |
| Notoriedad final | Notoriedad inicial de la Era 2 = la mitad, redondeando hacia abajo |

## 3. Cómo se alarga la campaña

### 3.1 La base en cada acto

Reposos del libro (Legado PDF 259 y 262): Era 1, 21 días (travesía por el canal), 14 (antes del baile), 21 (abre el cap. 3) y 14 (abre el
cap. 4); Era 2, 7 (cap. 6), 10 (cap. 7) y hasta 10 (cap. 8).

| Momento | Reposo del libro | Qué se juega con la base | Sesiones de más (estimadas) |
|---|---|---|---|
| Acto 1 · Urteau | — (momento nuevo) | **La barcaza de Enge**: Enge les ofrece literas a cambio de encargos. Nace la banda: nombre, tipo de organización, primera meta («Un nombre en Urteau»), primeros contactos (Pella y los Hijos de la Ceniza). Desde el Crisol, el patrocinador es NeBaal. | +1 |
| Travesía Urteau → Luthadel | 21 días | Primera fase de refugio larga: reformar la barcaza, el primer trabajador (Roben), contrabando por el camino, el primer suceso. | +1 |
| Acto 2 · antes del baile | 14 días | Amarre en Luthadel, la paga de la urna (600 ar), el almacén de refugiados de Cynwise; preparar la infiltración en Fellise. | 0-1 |
| Acto 3 · empieza el asedio | 21 días | La escasez lo encarece todo (×1,5). «Un escondite seguro para el Clavo» (el disparador del acto): segundo refugio, fijo, en el almacén de Cynwise, la serrería de Construcciones Kandor o la antigua guarida de Camon (mapa de Luthadel, Legado PDF 260). Los sabotajes de Duvall golpean a los trabajadores. | +1-2 |
| Acto 4 · obtención de recursos | 14 días | **«Planos, manos y piedra»**: arco de construcción que acaba en la cripta; los oficios y las mejoras de la banda suman. | +2 |
| Cierre de la Era 1 | 300 años (momento nuevo) | **«Lo que dejamos»**: qué fue de la barcaza, de los trabajadores, de Kandor y de la enfermería; se rellena la herencia. | +1 |
| Acto 5 · Elendel | — (momento nuevo) | La sede: el almacén portuario de los Guardianes, con las mejoras heredadas. | 0-1 |
| Acto 6 · cae el refugio | 7 días | Asalto (Notoriedad 3) y **«Restablecer el refugio»** con la tabla «Nuevo refugio» del libro (Legado PDF 115-118). | +1-2 |
| Actos 7-8 | 10 y hasta 10 días | Hostigar al Trío, la imprenta contra Kwylliam, la familia Morgenthax secuestra a un trabajador. | +1-2 |
| Postludio | — | La base como plataforma para «Continuar la campaña» (Legado PDF 191). | opcional |

Total: **de 8 a 13 sesiones más**. No se tocan los tres puntos fijos de la Era 1 (la Élite Dorada captura a NeBaal, el Clavo queda en la cripta
y los fragmentos del mapa sobreviven) ni el ritmo de los actos 8 y 9 (la Ascensión no espera).

### 3.2 Por qué la barcaza

- Responde a una decisión pendiente de la biblia («por qué le importa a la banda que Enge desaparezca»): Enge les dio un hogar, y su
  desaparición pone en riesgo el refugio.
- Da tensión: desde el Crisol, la casa de la banda es de «Enge», es decir, de NeBaal; el libro sitúa su confesión en la barcaza.
- Al cerrar la Era 1, la barcaza pasa a la banda (o se pierde en la batalla) y alimenta la herencia.
- Alternativa (pregunta 1 de §6): un sótano propio en los canales secos de Urteau, y la barcaza robada al huir con el Clavo.

### 3.3 Cambios en la biblia (después de tu visto bueno)

| Sección | Cambio |
|---|---|
| «La banda» › «Hoja de banda» | Filas nuevas: Trabajadores, Tipo de organización y Metas de banda; la fila Refugio pasa a «la barcaza de Enge». |
| «El bucle de juego» | El paso «Reposo» pasa a ser la fase de refugio de §2.6. |
| «Los actos» | Una nota por acto con su momento de base (§3.1). |
| «El puente entre eras» | Las tres filas nuevas de §2.9. |
| «Decisiones pendientes» | Se cierra la de Enge y se añaden las preguntas de §6 que sigan abiertas. |
| Pestaña nueva «El refugio» | Las reglas para los jugadores: §2 y el Anexo A, resumidos. |

## 4. La app

### 4.1 Experiencia

- **Ruta** `/campaigns/:campaignId/banda`, página «La banda», *chunk* perezoso y solo si `features.banda`. Accesos: director, pestaña
  «Banda» en Personajes; jugador, tarjeta «La banda» en Personaje; todos, tarjeta en Inicio con Escala · Tesorería · Notoriedad.
- **Cabecera**: nombre y concepto, tipo de organización, `StatTile` de Escala, Tesorería (`formatMoneda` y la imagen del dinero de la era) y
  Notoriedad (0-6 en marcas; desde 3, el aviso «Vuestros enemigos actúan»). Ventajas «una vez por sesión» del tipo de organización
  como interruptores (director) y el botón «Nueva sesión» que las reinicia.
- **Pestañas** (`Tabs`): Refugio · Trabajadores · Contactos · Metas · Crónica.
  - **Refugio**: tarjeta por refugio (el principal primero): tipo, ubicación, estado y sus mejoras como piezas con su efecto y su origen
    («Oficial · L.301», «Casero», «Inferido»). Acciones: «Construir mejora» (`Sheet` con el catálogo de la era, capacidad usada, coste,
    semanas y requisitos; botón «Pagar y empezar»), «Dañar», «Reparar», «Trasladar» y «Nuevo refugio».
  - **Trabajadores**: tarjeta por trabajador: nombre, oficio, rango, glifo del metal si es nacido del metal (`MetalGlyph` con
    `arte="alomancia"`, cargado de forma perezosa desde `components/mistborn`), lealtad 0-3, estado, puesto y «sale con…». Acciones:
    «Contratar» (`Sheet`: oficio, rango y sueldo sugerido editable), «Editar», «Asignar puesto», «Sale con…» (muestra el límite oficial de
    compañeros del rango del PJ y avisa si se supera, sin bloquear) y «Despedir» (también un jugador con acceso: solo guarda la parte
    pública, y al cargar la hoja del director su parte privada pasa a `baja` sin puesto).
  - **Contactos**: por facción, la reputación (−2..+2, `Segmented`) y sus contactos con su relación; patrocinadores marcados.
  - **Metas**: metas de banda con 3 hitos; «Concluir» pide elegir la mejora de organización.
  - **Crónica**: fases cerradas (resumen) y el registro de movimientos, con filtro por tipo.
- **Tesorería** (director): `Sheet` «Movimiento de tesorería»: cantidad (+/−) y motivo (obligatorio); queda en el registro.
- **Fase de refugio** (F2): aviso «Fase de refugio abierta · 21 días» en la página. El director la lleva en una hoja de pasos: Cuentas ·
  Órdenes · Actividades · Suceso · Cerrar. El jugador ve «Propón órdenes y tu actividad de reposo» y «Enviar propuesta».
- **Pantalla del director** (F3): tarjeta «Banda» en el panel Grupo (Notoriedad ±1, Tesorería ±, abrir la hoja); «Terminar sesión» ofrece
  «Abrir fase de refugio».
- **Textos fijos**:

| Dónde | Texto |
|---|---|
| Hoja vacía (director) | «La banda aún no tiene hoja.» · botón «Crear la hoja de banda» (nombre, concepto y tipo de organización) |
| Hoja vacía (jugador) | «El director aún no ha creado la hoja de la banda.» |
| Despedir | «¿Despedir a {nombre}? Deja la banda; quedará en la crónica.» |
| Quitar mejora | «¿Quitar {mejora}? No se devuelve el dinero.» |
| Borrar refugio | «¿Borrar el refugio {nombre}? Sus mejoras se pierden.» |
| Borrar contacto | «¿Borrar el contacto {nombre}?» |
| Sin dinero | «La tesorería no llega: faltan {cantidad}.» |
| Sin sitio | «El refugio no tiene sitio para más mejoras ({usadas}/{capacidad}).» |
| Sin plazas | «Con escala {escala}, la banda tiene como máximo {tope} trabajadores.» |
| Conflicto resuelto | «Otro dispositivo cambió la hoja; tu cambio se ha aplicado sobre la versión nueva.» |
| Conflicto sin arreglo | «Otro dispositivo cambió la hoja y tu cambio ya no es posible: {motivo}» |

### 4.2 Documento de la banda (`src/pages/banda/estado.ts`)

Lo define la web; el servidor no lo interpreta. `normalizarBanda()` completa los documentos parciales; si la versión del documento es mayor
que `VERSION_BANDA`, la página se abre en solo lectura con el aviso de la pantalla del director. El esquema v1 ya trae los campos de F2-F4
(vacíos) para no tener que subir la versión en cada entrega.

```ts
import type { RangoPnj } from '../../lib/banda/tipos'

export const VERSION_BANDA = 1

export interface PjRef { characterId: number; nombre: string }   // copia del nombre: un jugador solo puede leer su propio PJ

export interface BandaEstado {
  version: 1
  nombre: string
  concepto: string
  tipoOrganizacion: string | null          // id de CatalogoBanda.tiposOrganizacion
  escala: number                           // 1..catalogo.escalaMaxima
  tesoreria: number                        // en la moneda del mundo (WorldConfig.moneda), 2 decimales
  notoriedad: number                       // 0..catalogo.notoriedadMaxima [casero]
  reputacion: Record<string, number>       // id de facción → -2..+2 [casero]
  faccionesPropias: { id: string; nombre: string }[]
  refugios: Refugio[]
  trabajadores: Trabajador[]
  contactos: Contacto[]
  metas: MetaBanda[]
  proyectos: Proyecto[]                    // F4
  ventajasUsadas: string[]                 // ids de ventajas «una vez por sesión» ya usadas
  fase: FaseRefugio | null                 // F2
  cronica: FaseCerrada[]                   // F2; últimas 30
  registro: Movimiento[]                   // últimos 400, el más reciente primero
}

export interface Refugio {
  id: string
  tipo: string                             // id de CatalogoBanda.tiposRefugio
  nombre: string                           // «La Garza»
  ubicacion: string
  principal: boolean
  estado: 'seguro' | 'comprometido' | 'perdido'
  mejoras: MejoraRefugio[]
  notas: string
}

export interface MejoraRefugio {
  id: string
  mejora: string                           // id de CatalogoBanda.mejorasRefugio, o 'propia'
  nombre?: string                          // solo las propias
  efecto?: string                          // solo las propias
  nivel: number                            // Mobiliario selecto 1..3; el resto 1
  estado: 'en-obra' | 'lista' | 'danada'
  semanasRestantes: number                 // 0 cuando está lista
}

export interface Trabajador {
  id: string
  nombre: string
  oficio: string                           // id de CatalogoBanda.oficios, o 'propio'
  oficioNombre?: string                    // solo los propios
  rango: RangoPnj
  nacidoDelMetal: string | null            // id de metal (MetalGlyph) o null
  sueldo: number                           // por semana; el catálogo lo propone y el director lo ajusta
  lealtad: number                          // 0..3
  fasesSinCobrar: number                   // seguidas; un leal aguanta la primera sin perder lealtad
  estado: 'activo' | 'herido' | 'preso' | 'desaparecido' | 'muerto' | 'baja'
  puesto: { refugio: string; mejora: string | null } | null
  companeroDe: PjRef | null                // sale con ese PJ como compañero (reglas oficiales)
  faccion: string | null
  globalNpcId: number | null               // perfil de combate del catálogo de PNJ
  notas: string
  desde: string                            // ISO
}

export interface Contacto {
  id: string
  nombre: string
  faccion: string | null
  relacion: 'hostil' | 'tensa' | 'neutral' | 'aliada' | 'leal'
  papel: 'contacto' | 'patrocinador' | 'companero'
  beneficio: string                        // lo que ofrece (patrocinador)
  ingresoSemanal: number                   // dinero fijo que aporta en cada semana de fase (0 casi siempre)
  notas: string
}

export interface MetaBanda {
  id: string
  titulo: string
  hitos: string[]                          // los textos de los 3 hitos
  hechos: number                           // 0..3
  asignadaA: PjRef[]
  estado: 'activa' | 'concluida' | 'abandonada'
  mejoraElegida: string | null             // id de CatalogoBanda.mejorasOrganizacion
}

export interface Proyecto {
  id: string
  nombre: string                           // «La cripta»
  tipo: 'refugio' | 'formacion' | 'cripta' | 'libre'
  semanasRestantes: number | null
  contadores: { nombre: string; valor: number; umbral: number | null }[]   // la cripta: planos, trabajadores, materiales
  estado: 'en-curso' | 'terminado' | 'abandonado'
  notas: string
}

export type TipoMovimiento = 'tesoreria' | 'notoriedad' | 'reputacion' | 'escala' | 'refugio' | 'mejora'
  | 'trabajador' | 'contacto' | 'meta' | 'proyecto' | 'suceso' | 'nota'

export interface Movimiento {
  id: string
  en: string                               // ISO
  autor: string                            // nombre de usuario
  tipo: TipoMovimiento
  cantidad?: number                        // delta (tesorería, notoriedad, reputación, escala)
  objetivo?: string                        // facción, trabajador, mejora…
  motivo: string                           // «Paga de Cadme por la urna»
  fase?: string                            // id de la fase en la que nació
}

export interface FaseRefugio {
  id: string
  abiertaEn: string
  dias: number
  semanas: number                          // ceil(dias / 7), mínimo 1
  contexto: string | null                  // id de CatalogoBanda.contextos (estación del asedio)
  ordenes: Record<string, { orden: string; detalle: string }>              // id de trabajador → orden
  actividades: Record<string, { pj: PjRef; actividad: string; detalle: string }>  // characterId → actividad de reposo
  resultados: ResultadoOrden[]
  suceso: { tirada: number; total: number; suceso: string | null; aplicado: boolean } | null
  balance: { ingresos: number; sueldos: number; mantenimiento: number; multiplicador: number; total: number } | null
}

export interface ResultadoOrden {
  trabajador: string
  orden: string
  tirada: number | null
  total: number | null
  cd: number | null
  exito: boolean | null
  efecto: string                           // texto ya resuelto: «+31 ar», «Preso, Notoriedad +1»
  aplicado: boolean
}

export interface FaseCerrada { id: string; abiertaEn: string; cerradaEn: string; dias: number; resumen: string }   // resumen en Markdown
```

Documento **solo del director** (`gmState`), que nunca llega a un jugador:

```ts
export interface BandaSecretos {
  version: 1
  notas: string                            // notas del director sobre la banda
  secretos: Record<string, string>         // id de trabajador o contacto → secreto («Informa a Delina»)
  sucesosPreparados: string[]              // textos que el director quiere lanzar en la próxima fase
}
```

### 4.3 Catálogo del mundo (`src/lib/banda/tipos.ts` + `src/data/mistborn/banda/`)

La forma es común (Cosmere); los datos son de cada mundo y se cargan con su `WorldData` (`WorldData.banda?: CatalogoBanda`). Los precios
van por era (`Partial<Record<Era, number>>`); lo que no tiene precio en una era no existe en ella. El filtro de era es `isAvailable()`.

```ts
import type { Era } from '../../types'

export type OrigenRegla = 'oficial' | 'casero' | 'inferido'
export interface Fuente { origen: OrigenRegla; cita?: string }      // cita: «L.301 / PDF 307», «Legado PDF 261»
export type Coste = Partial<Record<Era, number>>
export type RangoPnj = 'secuaz' | 'rival' | 'jefe'

export interface CatalogoBanda {
  escalaMaxima: number                     // 4
  notoriedadMaxima: number                 // 6
  trabajadoresPorEscala: number            // 3
  bonoRango: Record<RangoPnj, number>      // 2 / 4 / 6
  sueldoPorRango: Record<RangoPnj, Coste>
  sueldoNacidoDelMetal: Coste
  vigilanciaMaxima: number                 // 4
  semanasPorMes: number                    // 4: el beneficio mensual se reparte así por semana [casero]
  companerosPorRangoPj: string[]           // límite oficial por rango del PJ (índice = rango − 1); solo avisa, no bloquea
  tiposOrganizacion: TipoOrganizacionDef[]
  mejorasOrganizacion: MejoraOrganizacionDef[]
  tiposRefugio: TipoRefugioDef[]
  mejorasRefugio: MejoraRefugioDef[]
  oficios: OficioDef[]
  ordenes: OrdenDef[]
  contextos: ContextoDef[]
  sucesos: SucesoDef[]
  facciones: FaccionDef[]
  actividadesReposo: ActividadDef[]
}

export interface TipoOrganizacionDef extends Fuente {
  id: string; nombre: string; resumen: string
  ventajas: { id: string; nombre: string; uso: 'sesion' | 'escena' | 'pasiva'; porEscala: string[] }[]   // porEscala[0] = escala 1
  beneficioMensual?: Coste[]               // empresa comercial: por escala 1..4
}
export interface MejoraOrganizacionDef extends Fuente { id: string; nombre: string; efecto: string; veces: number }
export interface TipoRefugioDef extends Fuente {
  id: string; nombre: string; eras?: Era[]; capacidad: number; mantenimiento: Coste; movil: boolean
  notoriedadAlInstalarse?: number          // Mansión: 1
  notas: string
}
export interface MejoraRefugioDef extends Fuente {
  id: string; nombre: string; eras?: Era[]; efecto: string
  coste: Coste[]                           // por nivel (Mobiliario selecto: 3 niveles)
  semanas: number
  requiere?: { oficioEnPuesto?: string; mejora?: string }
  vigilancia?: number                      // Red de vigías: 2
  ingresoSemanal?: Coste                   // Tapadera
  mantenimientoExtra?: Coste               // Dormitorio de refugiados
  libraEscasezMantenimiento?: boolean      // Despensa
}
export interface OficioDef extends Fuente {
  id: string; nombre: string; eras?: Era[]; rango: RangoPnj; metal?: string
  puesto: {
    mejoras?: string[]                     // vale en cualquiera de estas mejoras (Artesano: Mesa de trabajo o Armería)
    tipoRefugio?: string                   // o en este tipo de refugio (Barquero: barcaza)
    ventaja: string                        // texto visible
    efecto?: { mantenimientoPct?: number; semanasObra?: number; beneficioPct?: number }   // −25 / −1 / +50
  } | null                                 // null: trabaja fuera (Informante)
  ordenesAfines: string[]
  perfilPnj?: string                       // nombre del perfil en el catálogo de PNJ («Informador»)
}
export interface OrdenDef extends Fuente {
  id: string; nombre: string; eras?: Era[]; descripcion: string
  cd: number | null; cdMasNotoriedad?: boolean
  cdConReputacion?: number                 // Reclutar: −2 si la reputación con la facción elegida es +1 o más
  coste?: Coste                            // Sacar de prisión: soborno de 20 / 50 ar
  exito: EfectoOrden; fallo?: EfectoOrden
}
export interface EfectoOrden {
  texto: string
  dinero?: { dados: string; cadaDias?: number; multiplicador?: Coste }   // «5d10» cada 5 días; «1d6» × 10; «6d10» × 2 en la Era 2
  notoriedad?: number
  estadoTrabajador?: 'herido' | 'preso'
  liberaPreso?: boolean                    // Sacar de prisión
  candidato?: boolean                      // Reclutar
  rumores?: number                         // Rumores: 2 (éxito) o 1 (fallo)
  vigilancia?: number
  semanasObra?: number
  libraEscasezSueldos?: boolean
}
export interface ContextoDef extends Fuente { id: string; nombre: string; eras?: Era[]; multiplicador: number }
export interface SucesoDef extends Fuente {
  id: string; eras?: Era[]; min: number; max: number; titulo: string; texto: string
  evitadoPor?: string[]                    // ids de mejora: Despensa (Escasez), Escondrijo y Tapadera (Registro), Imprenta (Pasquín)
  prueba?: { cd: number; texto: string }   // Registro: CD 15 para que el refugio no quede comprometido
  efectos?: {
    tesoreria?: number; notoriedad?: number; lealtad?: number
    refugio?: 'comprometido' | 'perdido'
    mantenimientoDoble?: boolean           // Escasez
    obraPierdeAvance?: boolean             // Sabotaje
    trabajador?: 'herido' | 'desaparecido' | 'baja'
    candidato?: boolean                    // Llaman a la puerta
  }
}
export interface FaccionDef extends Fuente { id: string; nombre: string; eras?: Era[]; enemiga?: boolean }
export interface ActividadDef extends Fuente { id: string; nombre: string; eras?: Era[]; resumen: string }
```

### 4.4 API y base de datos

**Tabla `CrewSheets`** (migración `AddCrewSheets`, F1):

| Columna | Tipo | Notas |
|---|---|---|
| `CampaignId` | bigint PK, FK → `Campaigns` (cascade) | una fila por campaña; se crea al primer guardado |
| `State` | text, default `'{}'` | `BandaEstado`; el servidor no lo interpreta |
| `GmState` | text, default `'{}'` | `BandaSecretos`; solo lo recibe el director |
| `Version` | integer | *concurrency token* |
| `UpdatedAt` | timestamptz | |

**Tabla `CrewOrders`** (migración `AddCrewOrders`, F2): `CampaignId` + `UserId` (PK compuesta, mismos tipos que `CampaignMembers`, FK →
`Campaigns` en cascada), `Orders` text default `'{}'`, `UpdatedAt` timestamptz. Una fila por jugador con su propuesta, con esta forma (la
define la web; el servidor no la interpreta). Las propuestas con otro `faseId` que la fase abierta se ignoran, así nadie tiene que borrarlas:

```ts
export interface PropuestaFase {
  faseId: string
  ordenes: Record<string, { orden: string; detalle: string }>                 // id de trabajador → orden propuesta
  actividades: Record<string, { pj: PjRef; actividad: string; detalle: string }>  // sus propios PJ
  nota: string
}
```

DTO con el mismo estilo que `GmScreen`: peticiones como clases (`SaveCrewSheetRequest`, `SaveCrewOrderRequest`) y resultados como
*records* (`CrewSheetSaveResult`).

Las dos migraciones son **aditivas** (solo `CREATE TABLE`): seguras con el auto-migrado al arrancar la API en producción.

**Endpoints** (sin prefijo `/api`, como el resto):

| Método | Ruta | Quién | Respuesta |
|---|---|---|---|
| GET | `/campaigns/{id}/crew` | miembro | `{ state, gmState, version, updatedAt }`: `gmState` es `null` si no eres director; documento vacío `{}` y versión 0 si no existe |
| PUT | `/campaigns/{id}/crew` | director | body `{ state, gmState?, version }` (sin `gmState` se conserva el guardado) → 200 con la versión nueva; **409** con el documento guardado si la versión no coincide; 400 si no es un objeto JSON o pasa de 1 000 000 caracteres (`gmState`: 200 000) |
| GET | `/campaigns/{id}/crew/orders` (F2) | miembro | director: todas `[{ userId, userName, orders, updatedAt }]`; jugador: solo la suya |
| PUT | `/campaigns/{id}/crew/orders` (F2) | miembro | body `{ orders }` (objeto JSON ≤ 50 000 caracteres) → guarda la propuesta propia |

No miembro → 404; jugador en `PUT /crew` → 403 (como `BookService` y `GmScreenService`). Tras cada guardado, el controlador emite al grupo
de la campaña `CrewSheetUpdated` `{ campaignId, version }` o `CrewOrdersUpdated` `{ campaignId }`.

**Observación** (fuera de esta propuesta): `CampaignHub.JoinCampaign` no comprueba que el usuario sea miembro de la campaña, así que cualquier
usuario con sesión puede escuchar los eventos de otra. Por eso los eventos nuevos no llevan datos. Arreglo propuesto aparte.

**Backup y rollback** (como `AddGmScreens`):
1. Antes de aplicar en DEV: `docker exec cosmere-postgres-local pg_dump -U jira -d cosmere -Fc > ../backups/cosmere-dev-<fecha>-pre-AddCrewSheets.dump`.
2. Aplicar: arrancar la API de la rama (auto-migra) o `dotnet ef database update --project Infrastructure --startup-project API` con la API parada.
3. Deshacer: `dotnet ef database update AddBookChapters --project Infrastructure --startup-project API`, o el SQL idempotente
   `docs/banda/sql/AddCrewSheets.down.sql` (borra la tabla y su fila de `__EFMigrationsHistory`).
4. Producción: `pg_dump` y etiquetar las imágenes `:prev` antes del despliegue (CLAUDE.md, «Deployment»).

### 4.5 Web

| Archivo | Cambio |
|---|---|
| `src/pages/banda/*` (nuevo, *chunk* perezoso) | `BandaPage`, `useBanda`, `estado.ts`, `operaciones.ts`, `economia.ts`, `fase.ts` (F2), `dados.ts`, `CabeceraBanda`, `PanelRefugio`, `PanelTrabajadores`, `PanelContactos`, `PanelMetasBanda`, `PanelCronica`, `FaseRefugioSheet` (F2), `PropuestaFase` (F2) y las hojas `MejoraSheet`, `TrabajadorSheet`, `ContactoSheet`, `MovimientoSheet` |
| `src/lib/banda/tipos.ts` (nuevo) | Forma del catálogo (§4.3), común a todos los mundos |
| `src/data/mistborn/banda/*` (nuevo, perezoso) | `organizacion.ts`, `refugios.ts`, `trabajadores.ts`, `sucesos.ts`, `facciones.ts`, `actividades.ts`, `index.ts` (`CATALOGO_BANDA_MISTBORN`) |
| `src/worlds/types.ts`, `stormlight.ts`, `mistborn.ts`, `mistborn.data.ts` | `features.banda` (false / true); `WorldData.banda?`; `banda: CATALOGO_BANDA_MISTBORN` dentro del literal `DATA` |
| `src/api/crew.ts` (nuevo) | `crewApi.get(cId)`, `crewApi.save(cId, body)`; F2: `getOrders`, `saveOrders` |
| `src/types/index.ts` | `CrewSheet`, `SaveCrewSheetRequest`; F2: `CrewOrder`, `SaveCrewOrderRequest` (espejo de los DTO C#) |
| `src/App.tsx` | ruta `banda` con `React.lazy` y `Suspense` |
| `src/components/Sidebar.tsx` | `SECTION_LABELS.banda = 'Banda'` y `PARENT_SECTION.banda = 'personajes'` |
| `src/pages/personajes/PersonajesPage.tsx` | pestaña «Banda» del director y tarjeta «La banda» del jugador, solo con `features.banda` |
| `src/pages/home/HomeCampaignPage.tsx` | tarjeta resumen de la banda (sin datos del mundo en el *chunk* principal) |
| `src/components/DiceRoller.tsx` | manejadores `CrewSheetUpdated` y `CrewOrdersUpdated` → eventos `window` `crewSheetUpdated` / `crewOrdersUpdated` |
| F3: `src/pages/pantalla/PanelGrupo.tsx`, `PanelBitacora.tsx`, `PanelGuion.tsx`, `guion.ts`, `estado.ts`, `exportar.ts`, `docs/pantalla-director/guion-formato.md` | §5, tareas B16-B19 |

**Reglas de código**: ningún componente compara ids de mundo (`grep -rnE "===\s*'(mistborn|stormlight)'" src` vacío); estilos en línea con los
tokens de `theme.ts` (leer `DESIGN.md`); superposiciones con `Sheet` y `ConfirmDialog`; toda eliminación pide confirmación; textos visibles en
español y código en inglés (los nombres del dominio, como en la pantalla del director, en español); los datos de Nacidos de la bruma nunca
entran en el *chunk* principal.

**Guardado** (distinto de la pantalla del director): la hoja cambia por **acciones**, no por escritura continua. Cada acción es una función
pura `(banda, ctx) => banda` de `operaciones.ts` que valida (lanza `ErrorBanda` con el texto de §4.1) y añade sus movimientos al registro.
`useBanda.aplicar(op)` la aplica de forma optimista y la pone en una **cola**: un solo `PUT` en vuelo y los siguientes esperan, como la cola
`mesa()` de `CharacterDetailPage` (si no, dos toques seguidos chocan entre sí con un 409). Ante un 409 de otro dispositivo, vuelve a aplicar la
misma operación sobre el documento guardado que devuelve el servidor y reintenta **una vez**; si la operación ya no es válida, deshace y
muestra el motivo.

## 5. Tareas

**Preparación** (antes de B1):
1. Esta propuesta y el `CLAUDE.md` de la web no están en `main` (sin seguimiento en git): o se suben a `main` con tu visto bueno, o los
   agentes los leen desde el árbol principal (`C:\Users\xavie\Documents\Repositories\personal\cosmere-web\docs\banda\propuesta.md`).
2. Rama `feature/banda` desde `main` (web b414cb1, API 2f1acfa) en los *worktrees* `cosmere-web-banda` y `cosmere-api-banda`; en el de la
   web, `npm ci`; en el de la API, `dotnet build` antes de la primera migración.
3. En `cosmere-web/.claude/launch.json` (árbol principal), copiar las entradas `guion-web` / `guion-api` como `banda-web` (5173) y
   `banda-api` (5200) apuntando a los *worktrees* nuevos, y parar antes los servidores que usen esos puertos.
4. Pruebas siempre en la campaña **«Bruma TEST»** (id 42, Era 1, seis PJ de prueba). Para probar como jugador, unir `nb-jugador` a la
   campaña como `player` (con el enlace de invitación o una fila en `CampaignMembers`); credenciales en
   `docs/nacidos-de-la-bruma/entorno-pruebas.md` (local, nunca al repositorio).
5. Antes de tocar nada, medir el *bundle* de arranque de `main` (`npm run build` y la suma de los *scripts* de `dist/index.html`, con el
   comando de `docs/nacidos-de-la-bruma/bundle-referencia.txt`): esa es la referencia de B12, porque el fichero es del 7 oct y `main` ya
   ha crecido desde entonces.

### F1 · Hoja de banda

**B1. API: entidad, contexto, DTO, servicio y controlador.** Copiar el patrón de `GmScreen` con nombres `Crew`:
`Messages/Database/Entities/CrewSheetEntity.cs` (`long CampaignId`, `CampaignEntity Campaign`, `string State = "{}"`, `string GmState = "{}"`,
`int Version`, `DateTime UpdatedAt`); en `Infrastructure/Data/CosmereContext.cs`: `DbSet<CrewSheetEntity> CrewSheets`, clave
`CampaignId`, FK en cascada, `HasColumnType("text")` y `HasDefaultValue("{}")` en `State` y `GmState`, `Version.IsConcurrencyToken()`;
`Messages/Crew/In/SaveCrewSheetRequest.cs` (`JsonElement State`, `JsonElement? GmState`, `int Version`);
`Messages/Crew/Out/CrewSheetResponse.cs` (`State`, `GmState` nulo para jugadores, `Version`, `UpdatedAt`);
`Services/Crew/{ICrewSheetService,CrewSheetService}.cs`: `SaveAsync` → `CrewSheetSaveResult(bool Saved, CrewSheetResponse Sheet)`, con
`EnsureGmAsync` y las validaciones copiadas de `GmScreenService`; `GetAsync` lee el rol del miembro
(`db.CampaignMembers.Where(m => m.CampaignId == id && m.UserId == userId).Select(m => m.Role).FirstOrDefaultAsync()`: `null` → 404;
distinto de `"gm"` → `GmState = null`). Registro en `Services/Bootstrap.cs`; `API/Controllers/CrewController.cs` en
`campaigns/{campaignId:long}/crew` (409 → `Conflict(guardado)`, como `GmScreenController`).
*Aceptación*: §4.4. *Verificación*: `dotnet build` sin errores ni avisos nuevos.

**B2. Migración `AddCrewSheets`** con la API parada (`dotnet ef migrations add AddCrewSheets --project Infrastructure --startup-project API`)
y los SQL idempotentes en el repositorio de la web, `docs/banda/sql/AddCrewSheets.up.sql` (con
`dotnet ef migrations script AddBookChapters AddCrewSheets --idempotent --project Infrastructure --startup-project API`) y `.down.sql` (los
mismos argumentos invertidos), como los de `docs/pantalla-director/sql/`.
*Aceptación*: solo `CREATE TABLE` / `DROP TABLE`, sin cambios pendientes en el modelo. *Verificación*: revisar la migración y
`dotnet ef migrations has-pending-model-changes --project Infrastructure --startup-project API`.

**B3. Evento en tiempo real.** `CrewController` inyecta `IHubContext<CampaignHub>` (como `DiceRollsController`) y, tras guardar, envía
`CrewSheetUpdated` `{ campaignId, version }` a `CampaignHub.CampaignGroup(id)`. En `DiceRoller.tsx`, el manejador vuelve a emitirlo como
evento `window` `crewSheetUpdated`. *Aceptación*: dos navegadores en la hoja; un cambio del director aparece en el otro sin recargar.
*Verificación*: `dotnet build`, `npx tsc -b` y la prueba con dos navegadores.

**B4. Backup de DEV y migración aplicada** (§4.4). *Verificación*: `\d "CrewSheets"` en psql y la fila `AddCrewSheets` en `__EFMigrationsHistory`.

**B5. Tipos y API web.** `src/types/index.ts` (`CrewSheet { state: unknown; gmState: unknown | null; version: number; updatedAt: string | null }`,
`SaveCrewSheetRequest { state: unknown; gmState?: unknown; version: number }`) y `src/api/crew.ts` (`crewApi.get`, `crewApi.save`; métodos que
devuelven `r.data`). *Verificación*: `npx tsc -b`.

**B6. Forma del catálogo y bandera del mundo.** `src/lib/banda/tipos.ts` (§4.3); `features.banda` en `src/worlds/types.ts`
(`stormlight.ts` false, `mistborn.ts` true); `WorldData.banda?: CatalogoBanda`. *Aceptación*: Stormlight compila sin catálogo.
*Verificación*: `npx tsc -b` y el `grep` de ids de mundo vacío.

**B7. Catálogo de Nacidos de la bruma** en `src/data/mistborn/banda/*` a partir del Anexo A: efectos oficiales **resumidos con palabras
propias** (nunca copiados) y con su `cita`; lo casero e inferido con su `origen`. Los valores intermedios por escala de los tipos de
organización se completan leyendo L.298-300 / PDF 304-306
(`bash docs/nacidos-de-la-bruma/fuentes/pg.sh ../cosmere-api/Resources/pdfextract/mistborn_flow.txt 304 306`). Conectarlo con
`banda: CATALOGO_BANDA_MISTBORN` dentro del literal `DATA` de `src/worlds/mistborn.data.ts`. *Aceptación*: todo elemento tiene `origen`; los oficiales tienen `cita`. *Verificación*:
`npx tsc -b`; tras `npm run build`, ningún texto del catálogo en los *scripts* que carga `dist/index.html` (comparar con
`docs/nacidos-de-la-bruma/bundle-referencia.txt`).

**B8. Lógica pura** en `src/pages/banda/`: `estado.ts` (§4.2, `normalizarBanda`, `bandaNueva(nombre, concepto, tipo)`), `economia.ts`
(`balanceSemanal(banda, catalogo, era, contexto)` → `{ ingresos, sueldos, mantenimiento, multiplicador, total }`; capacidad usada de cada
refugio; tope de trabajadores), `dados.ts` (`tirarExpresion('5d10')` con `rollDN` de `utils/dice.ts`) y `operaciones.ts`:
`renombrar`, `cambiarTipoOrganizacion`, `cambiarEscala`, `moverTesoreria`, `cambiarNotoriedad`, `cambiarReputacion`, `anadirRefugio`,
`editarRefugio`, `cambiarEstadoRefugio`, `trasladarRefugio` (Notoriedad −2), `quitarRefugio`, `construirMejora` (capacidad, requisitos, coste,
semanas; opción `gratis` con motivo), `danarMejora`, `repararMejora` (mitad del coste, 1 semana), `quitarMejora`, `contratar` (tope
3 × escala), `editarTrabajador`, `asignarPuesto`, `salirCon`, `cambiarLealtad`, `cambiarEstadoTrabajador`, `despedir` (estado `baja`),
`anadirContacto`, `editarContacto`, `quitarContacto`, `anadirMeta`, `marcarHito`, `concluirMeta` («Reclutamiento» sube la escala;
«Refugio» abre `construirMejora` gratis), `usarVentaja`, `reiniciarVentajas`. Cada operación devuelve un documento nuevo y añade su
`Movimiento`. *Aceptación*: sin React ni red; `normalizarBanda({})` devuelve un documento válido; el ejemplo de §2.6 da 42 ar/semana.
*Verificación*: `npx tsc -b`.

**B9. `useBanda(cId)`**: `useQuery(['crew', cId])`; `aplicar(op)` con actualización optimista, cola de `PUT` (uno en vuelo), reintento
único ante un 409 de otro dispositivo (§4.5) y mensajes de §4.1; escucha `crewSheetUpdated` e invalida `['crew', cId]` salvo que la versión
ya sea la suya; expone `esDirector`, `soloLectura`, `catalogo` (de `useWorldData()`) y `era` (`useEra()`). *Aceptación*: cinco toques
rápidos seguidos guardan los cinco cambios; con dos pestañas del director, los cambios de las dos se conservan. *Verificación*: red: los
`PUT` salen de uno en uno; con dos pestañas, `PUT` → 409 → `PUT` correcto.

**B10. `BandaPage` y paneles** (§4.1): cabecera, pestañas, hojas y confirmaciones; el director edita y el jugador solo lee (sin botones de
cambio). Hoja vacía con «Crear la hoja de banda». Para el aviso de «Sale con…», el rango del PJ sale de su nivel: rango 1 hasta el nivel 5,
2 del 6 al 10, y así cada cinco niveles (L.27 / PDF 33); el nivel 0 cuenta como rango 1. *Aceptación*: en «Bruma TEST», crear la banda, la barcaza, contratar 3 trabajadores,
construir la Despensa (la tesorería baja su coste y la mejora aparece «en obra»), despedir con confirmación; un jugador ve lo mismo sin
botones. *Verificación*: navegador a 390×844 y 1180×820, `read_console_messages` sin errores.

**B11. Accesos**: ruta en `App.tsx`; `Sidebar.tsx` (`SECTION_LABELS`, `PARENT_SECTION`); en `PersonajesPage.tsx`, la pestaña «Banda» del
director **pinta `BandaPage` dentro de la pestaña** (`<BandaPage incrustada />` importada con `lazy()` y envuelta en `Suspense`, sin su
cabecera de página, como las demás pestañas) y la
tarjeta «La banda» del jugador navega a la ruta `banda`; tarjeta en `HomeCampaignPage.tsx` que navega a la ruta; todo condicionado a
`features.banda`. *Aceptación*: en «Caminapiedras» (Stormlight) nada cambia. *Verificación*:
captura del DOM de Personajes e Inicio antes y después en la campaña 1.

**B12. Calidad**: `npx tsc -b`, `npm run lint`, `npm run build`, el `grep` de ids de mundo y la medida del *bundle* de arranque frente a la
referencia tomada en la preparación (paso 5): solo puede crecer lo de la ruta, la pestaña y la tarjeta (unos pocos kB); el catálogo de
Nacidos de la bruma y `BandaPage` van en *chunks* aparte.

### F2 · Fase de refugio

**B13. API `CrewOrders`**: entidad, migración `AddCrewOrders` (con su SQL up/down), DTO, servicio y controlador
`campaigns/{campaignId:long}/crew/orders` (§4.4), con el evento `CrewOrdersUpdated`; en la web, `crewApi.getOrders` / `saveOrders`, los tipos
y `PropuestaFase` (§4.4). *Verificación*: `dotnet build`, migración revisada, backup antes de aplicar.

**B14. `fase.ts` (puro)**: `abrirFase(dias, contexto)`, `adoptarPropuesta(propuesta)`, `asignarOrden`, `fijarActividad`, `calcularBalance`,
`pagarFase(impagados)` (−1 de lealtad a cada impagado, salvo un leal en su primera fase sin cobrar; actualiza `fasesSinCobrar`),
`resolverOrdenes(tirar)` (d20 + bono de rango + 2 si es afín, contra la CD;
`cdMasNotoriedad`), `aplicarResultado(i)`, `avanzarObras(semanas)` (el artesano en su puesto resta 1 semana), `tirarSuceso(tirar)`
(1d20 + Notoriedad − vigilancia), `aplicarSuceso()`, `cerrarFase()` (genera el resumen Markdown, lo pasa a `cronica` y reinicia ventajas).
*Aceptación*: con una tirada fija, el resultado se puede reproducir; el ejemplo de §2.6 da 126 ar en la fase. *Verificación*: `npx tsc -b`.

**B15. Interfaz de la fase**: `FaseRefugioSheet` (director: Cuentas · Órdenes · Actividades · Suceso · Cerrar, con las propuestas de los
jugadores y «Adoptar»), `PropuestaFase` (jugador: órdenes para los trabajadores y la actividad de su PJ; «Enviar propuesta») y el aviso de
fase abierta. *Aceptación*: una fase completa de 21 días en otoño en «Bruma TEST», con una propuesta enviada desde un jugador.
*Verificación*: dos navegadores (director y jugador).

### F3 · Integraciones

**B16. Pantalla del director**: tarjeta «Banda» en `PanelGrupo.tsx` (Notoriedad ±1, Tesorería ± con motivo, «Abrir la hoja»); al confirmar
«Terminar sesión» en `PanelBitacora.tsx`, ofrecer «Abrir fase de refugio» (navega a `banda?fase=nueva`) y reiniciar las ventajas de la sesión.
*Verificación*: `npx tsc -b`; flujo en una tablet de 1180×820.

**B17. Guion**: sección `### Banda` con líneas `- **Tesorería** +600 · motivo`, `**Notoriedad** +1`, `**Reputación** Facción +1`,
`**Contacto** Nombre · relación`, `**Trabajador** Nombre · oficio · rango` y `**Mejora** Nombre · gratis`.
- `guion.ts`: nueva `ClaseSeccion` `'banda'`; en `claseDe()`, un título que empieza por «Banda» (sin distinguir mayúsculas ni tildes)
  devuelve `'banda'`; un parser `lineasBanda(md)` → `{ clave, valor, motivo }[]`.
- `PanelGuion.tsx`: entrada `'banda'` en `SECCION_META` (es un `Record<ClaseSeccion, …>` y no compila sin ella) y, en `SeccionGuion`, cada
  línea con el botón «Aplicar a la banda» (acción explícita del director, nunca automática) que llama a la operación de `operaciones.ts`.
- La facción y el oficio se buscan por nombre en el catálogo y en `faccionesPropias` (sin mayúsculas ni tildes); si no hay coincidencia,
  la línea muestra un selector para elegirla en vez del botón.
- `estado.ts`: `PantallaEstado.bandaAplicada: Record<string, string>` (clave `escenaId|índice de línea` → fecha ISO), con `VERSION_ESTADO`
  subido y `normalizarEstado` actualizado.
- Documentarlo en `docs/pantalla-director/guion-formato.md` y en `FORMATO_GUION`.
*Verificación*: `npx tsc -b`; importar una escena de prueba en «Bruma TEST» y aplicar sus líneas una vez cada una.

**B18. Diario y guiones con IA**: `promptCronica` incluye las fases de refugio cerradas durante la sesión, y `promptSiguienteGuion` añade
«Estado de la banda» (escala, tesorería, notoriedad, refugios, trabajadores, metas). `promptSiguienteGuion` se llama desde `copiarPrompt`
(`PanelGuion.tsx`), que debe leer la hoja (`crewApi.get`, clave `['crew', cId]`) y pasarle el resumen; así los guiones generados cuentan con
la base. *Verificación*: copiar los dos *prompts* y revisar el bloque nuevo.

**B19. Aportar y repartir**: el director mueve dinero entre la tesorería y `recursos.arquillas` de los PJ con el `PATCH …/recursos`
existente (valor absoluto: leer el valor actual justo antes), un movimiento del registro por PJ y aviso si alguno falla.
*Verificación*: repartir 100 ar entre 4 PJ de «Bruma TEST» y comprobar sus bolsas.

**B20. Trabajador en un encuentro** (opcional): «Añadir al encuentro» en la tarjeta del trabajador con su `globalNpcId`, del lado de la banda.

### F4 · Proyectos y herencia

**B21. Proyectos**: pestaña o sección «Proyectos» con contadores (la cripta: planos, trabajadores, materiales y los extras de §2.8) y avance
por fase. *Verificación*: montar la cripta de prueba en «Bruma TEST».

**B22. Herencia**: «Cerrar la Era 1» genera `herencia.json` y un resumen Markdown (para la biblia); en una campaña de la Era 2, «Importar
herencia» crea la hoja inicial (Guardianes como patrocinador con su orientación, linajes como contactos y candidatos, la reliquia de la
barcaza, dos mejoras heredadas y la Notoriedad inicial de §2.9). Forma del fichero (`src/pages/banda/herencia.ts`):

```ts
export interface HerenciaBanda {
  version: 1
  banda: string                            // nombre de la banda de la Era 1
  escalaFinal: number
  notoriedadFinal: number
  orientacionGuardianes: 'industria' | 'sabiduria' | 'trabajo' | null   // según quién lidere Kandor (biblia)
  refugio: { nombre: string; tipo: string; mejoras: string[] }          // ids de mejora
  linajes: { nombre: string; oficio: string; origen: 'trabajador' | 'contacto' }[]   // leales
  contactosLeales: { nombre: string; faccion: string | null }[]
  notas: string
}
``` *Verificación*: exportar desde «Bruma TEST» e importar en una campaña
de pruebas de la Era 2 creada solo para eso (y borrada después, con tu permiso).

## 6. Preguntas para Xavi (con la opción por defecto)

1. **Refugio de la Era 1**: ¿la barcaza de Enge, con Enge (y después NeBaal) como patrocinadora? *(por defecto: sí; la alternativa es un
   sótano propio en los canales secos de Urteau y la barcaza robada al huir con el Clavo)*
2. **Escala**: ¿de 1 a 4 sin el tope oficial por rango del líder? *(por defecto: sí, como la biblia)*
3. **Cifras caseras** (sueldos, precios, mantenimiento, escasez, sucesos): ¿te valen para empezar y las ajustamos después de dos fases?
   *(por defecto: sí)*
4. **Quién toca la hoja**: F1 solo tú; F2 los jugadores proponen y tú adoptas. ¿Prefieres que todos editen todo, o que nadie más proponga?
   *(por defecto: proponen)*
5. **Notoriedad a la vista** de los jugadores *(por defecto: sí; lo que sabe cada enemigo va en tus notas secretas)*
6. **Tiradas de las órdenes**: ¿las hace la app o dados físicos? *(por defecto: la app, y puedes corregir cada resultado)*
7. **Era 2**: ¿otra campaña en la app con importación de la herencia? *(por defecto: sí)*
8. **Reservas de metal**: el texto impreso repite el de la Mesa de trabajo (errata); ¿te vale el efecto inferido del Anexo A.4? *(por defecto: sí)*
9. **Aplicar desde el guion**: ¿botón «Aplicar a la banda» por línea, o solo recomendación, como los avances? *(por defecto: botón explícito)*
10. **Orden de entrega**: ¿F1, prueba en mesa y luego F2, o F1 y F2 juntas antes del próximo reposo? *(por defecto: F1 primero)*
11. **Nombre**: ¿«La banda» y «Refugio», o «Base»? *(por defecto: La banda)*

## 7. Fuera de alcance

Un combate por el refugio con mapa propio (el asalto se juega como un encuentro normal de la pantalla del director); la economía personal
automática de los PJ (gastos de vida, sueldos propios); un editor del catálogo en la app (lo propio de la campaña se añade como mejora,
oficio o refugio «propio» en el documento); subir crónicas de banda generadas con IA (se puede añadir después con el formato del diario);
relojes de villanos (descartados en la biblia); notificaciones *push*.

---

## Anexo A. Catálogo de Nacidos de la bruma (borrador)

### A.1 Tipos de organización (oficial; L.298-300 / PDF 304-306)

Ventajas **una vez por sesión** salvo que se diga otra cosa; los valores intermedios por escala se transcriben (con palabras propias) en B7.

| Tipo | Ventajas |
|---|---|
| Empresa comercial | Beneficio mensual si el negocio se mantiene sano y protegido: 50 / 125 / 250 / 500 ar (Era 1) y 100 / 250 / 500 / 1000 ar (Era 2) en escala 1 / 2 / 3 / 4+. |
| Red criminal | «Huida limpia» (3 caballos; desde escala 3, también una diligencia de dos caballos con conductor); «Músculo prestado» (un miembro recibe tantos matones compañeros como la escala, durante una semana); «Servicio de mensajería» (pasar un objeto pequeño; mediano, grande y enorme en escala 3, 4 y 5). Abusar de ella hace que otras bandas pidan favores. |
| Grupo político | Acceso a una persona importante, un lugar seguro o un evento restringido: de un alcalde o una casa menor (escala 1) a un jefe de estado (3) y organizaciones secretas o potencias extranjeras (4+). |
| Célula de resistencia | Una vez por escena, acción de coste 2: cura de 1d4 de salud o 1 de concentración (escala 1) hasta 3d12 de salud, 1d6 de concentración y Resuelto o Concentrado (4+); cada PJ se beneficia una vez por sesión. |
| Club social | Difundir un rumor: el primer miembro que actúe con él tiene ventaja, y las defensas cognitiva y espiritual del objetivo bajan 1 / 2 / 3 / 4 según la escala. |

### A.2 Mejoras de organización (oficial; L.298 / PDF 304)

| Mejora | Efecto | Veces |
|---|---|---|
| Equipo avanzado | Objetos necesarios para la banda, incluidos los de recompensa si su rango no supera la escala. | 1 |
| Héroes del pueblo | Donde opera la banda, comida, cobijo modesto y gente que la esconde de las autoridades. | 1 |
| Reclutamiento | +1 a la escala. El libro permite elegirla cuatro veces con el tope del rango del líder; aquí, tres veces (hasta escala 4) y sin ese tope `[casero]`, D4. | 3 |
| Red de contactos ampliada | Una vez por sesión, un miembro recibe un compañero Especialista durante una semana. | 1 |
| Red de transporte | Barcos (Era 1), tren o aeronave: mover gente y mercancía rápido y seguro entre varios sitios. | 1 |
| Refugio | Un refugio nuevo o una mejora gratis en uno existente. | 1 |

Cuando ya no quede ninguna por elegir, un líder PJ puede crear con la DJ una mejora única (L.298 / PDF 304).

### A.3 Tipos de refugio `[casero]`

| Tipo | Era | Capacidad (mejoras) | Mantenimiento (ar/semana, Era 1 / Era 2) | Notas |
|---|---|---|---|---|
| Refugio básico | ambas | 2 | 1 / 2 | El oficial: escondite con alojamiento modesto. |
| Barcaza | 1 | 4 | 4 / — | Movilidad de serie; amarra en Urteau, Fellise y Luthadel. |
| Sótano en los canales secos | 1 | 3 | 1 / — | Urteau; vecinos de los Hijos de la Ceniza. |
| Taller o almacén | ambas | 5 | 3 / 6 | Almacén de Cynwise, serrería de Kandor, guarida de Camon; en la Era 2, el almacén portuario de los Guardianes. |
| Piso | 2 | 3 | — / 5 | Un piso en la calle Madion (tabla «Nuevo refugio»). |
| Local con negocio | 2 | 5 | — / 8 | Club, salón, bar, teatro o serrería de la tabla «Nuevo refugio» (Legado PDF 115-118). |
| Mansión | ambas | 8 | 10 / 20 | Notoriedad +1 al instalarse. |

### A.4 Mejoras de refugio

Oficiales (efectos resumidos de L.301 / PDF 307; precios y semanas `[casero]`, porque el libro los deja a la DJ):

| Mejora | Efecto | Coste Era 1 / Era 2 (ar) | Semanas |
|---|---|---|---|
| Almacén | Tras un descanso corto o largo, sacar un objeto que no sea un arma de hasta 10 ar (Era 1) o 50 ar (Era 2). | 150 / 750 | 2 |
| Armería | Reponer la munición estándar, o tomar un arma o armadura de hasta 25 ar (Era 1) o 150 ar (Era 2). | 250 / 1250 | 2 |
| Despensa | Raciones de comida callejera para un día. `[casero]` El mantenimiento no sufre la escasez. | 50 / 250 | 1 |
| Mesa de trabajo | Ventaja en las pruebas de Manufactura hechas allí. | 150 / 750 | 1 |
| Mobiliario selecto (3 niveles) | El alojamiento pasa a Confortable, Lujoso y Aristocrático. | 100 · 300 · 1000 / 500 · 1500 · 5000 | 1 por nivel |
| Movilidad | El refugio está en un vehículo o una embarcación y se mueve. | el vehículo (barcaza mercante 10 000 ar; coche 4000 ar en la Era 2, L.272 / PDF 278) | — |
| Reservas de metal | `[inferido: el texto impreso repite el de la Mesa de trabajo]` Tras un descanso largo, un vial de metal básico por nacido del metal de la banda; una vez por fase, un metal raro a mitad de precio. | 200 / 1000 | 1 |

Caseras:

| Mejora | Era | Efecto | Coste Era 1 / Era 2 (ar) | Semanas |
|---|---|---|---|---|
| Escondrijo | ambas | Compartimentos ocultos: el Clavo y el contrabando no aparecen en un registro; los sucesos de registro e inspección no comprometen el refugio. | 100 / 500 | 1 |
| Enfermería | ambas | Los trabajadores heridos sanan en una fase; con un sanador en su puesto, cada día de «Recuperación» de un PJ cuenta como 3. | 200 / 1000 | 2 |
| Nube de cobre | ambas | Requiere un ahumador en su puesto: el refugio no se detecta con bronce y se repite la tirada de cualquier suceso alomántico. | 100 / 500 | 1 |
| Red de vigías | ambas | −2 a la tirada de sucesos; una amenaza nunca coge a la banda por sorpresa. | 120 / 600 | 1 |
| Salida secreta | ambas | En un asalto, nadie es capturado; si hay que abandonar el refugio, el traslado se hace esa misma noche. | 150 / 750 | 2 |
| Tapadera | ambas | Requiere un administrador en su puesto: +10 ar/semana (Era 1) o +20 (Era 2); los sucesos de inspección se superan sin coste. | 300 / 1500 | 3 |
| Sala de mapas | ambas | Ventaja en la primera prueba del plan del siguiente encargo; +1 plano en la cripta. | 80 / 400 | 1 |
| Dormitorio de refugiados | 1 | Al terminarla, reputación +1 con los skaa; un candidato más por fase; mantenimiento +2 ar/semana. | 100 / — | 1 |
| Imprenta | 2 | Una vez por fase, anula el +1 de Notoriedad de un pasquín de Kwylliam; con un periodista en su puesto, «Rumores» da 3. | — / 1200 | 2 |
| Garaje | 2 | Guarda un coche (4000 ar, L.272 / PDF 278); si la banda es una Red criminal, su «Huida limpia» puede ser ese coche. | — / 800 (más el coche) | 1 |
| Laboratorio | 2 | Ventaja en Investigación sobre química, metales o fotografía. | — / 1000 | 2 |
| Archivo | 2 | La actividad «Investigación» tarda la mitad. | — / 900 | 2 |

### A.5 Oficios `[casero]`

Sueldo según el rango (§2.5). Perfiles de combate de la Guía del mundo cuando existen.

| Oficio | Era | Rango habitual | Puesto y ventaja | Órdenes afines | Perfil de PNJ |
|---|---|---|---|---|---|
| Barquero | 1 | secuaz | Barcaza: trasladarla no cuesta dinero y tarda la mitad. | Contrabando | Plebeyo |
| Cocinero | ambas | secuaz | Despensa: mantenimiento −25 %. | Abastecer | Plebeyo |
| Matón | ambas | rival | Guardia: en un asalto lucha con la banda y nadie es sorprendido. | Vigilar, Hostigar al enemigo | Matón (GM PDF 252) |
| Informante | ambas | rival | — (trabaja fuera) | Rumores, Borrar el rastro | Informador (GM PDF 240) |
| Falsificador | ambas | rival | Mesa de trabajo: papeles falsos, ventaja para pasar un control una vez por sesión. | Borrar el rastro, Sacar de prisión | Especialista |
| Sanador | ambas | rival | Enfermería (§A.4). | — | Especialista |
| Artesano (carpintero, herrero) | ambas | rival | Mesa de trabajo o Armería: las obras tardan 1 semana menos (mínimo 1). | Construir | Especialista |
| Contrabandista | ambas | rival | — | Contrabando, Abastecer | Forajido |
| Mensajero | ambas | secuaz | — | Rumores | Plebeyo |
| Administrador | ambas | rival | Tapadera (requisito); con una empresa comercial, su beneficio +50 %. | Trabajo honrado | Plebeyo |
| Ahumador (cobre) | ambas | rival | Nube de cobre (requisito). | Borrar el rastro | Especialista con alomancia |
| Buscador (bronce) | ambas | rival | — | Vigilar | Especialista con alomancia |
| Periodista | 2 | rival | Imprenta. | Rumores | Plebeyo |
| Mecánico | 2 | rival | Garaje: las obras de Garaje y Laboratorio tardan 1 semana menos. | Construir | Especialista |
| Abogado | 2 | rival | — | Borrar el rastro, Sacar de prisión | Plebeyo |

### A.6 Órdenes

| Orden | Era | Prueba | Éxito | Fallo | Origen |
|---|---|---|---|---|---|
| En su puesto | ambas | — | Aplica la ventaja del puesto. | — | casero |
| Trabajo honrado | ambas | — | 4d6 ar cada 5 días (Era 2: ×2). | — | Legado PDF 261, 264 |
| Contrabando | 1 | CD 12 | 5d10 ar cada 5 días. | Preso; Notoriedad +1. | Legado PDF 261 (para PJ; a trabajadores `[casero]`) |
| Recuperar objetos | 2 | CD 12 | 6d10 × 2 ar por objeto. | Preso; Notoriedad +1. | Legado PDF 264 (ídem) |
| Rumores | ambas | CD 12 | 2 rumores para el tablón. | 1 rumor. | Legado |
| Borrar el rastro | ambas | CD 12 + Notoriedad | Notoriedad −1. | Nada. | casero |
| Vigilar | ambas | — | −2 a la tirada de sucesos (tope de −4 en total, contando la Red de vigías). | — | casero |
| Reclutar | ambas | CD 12 (−2 con reputación +1 en la facción elegida) | Un candidato de esa facción. | Nada. | casero |
| Abastecer | 1 | CD 12 | Esta fase, la escasez no afecta a los sueldos. | Nada. | casero |
| Construir | ambas | — | La obra en curso avanza 1 semana más. | — | casero |
| Hostigar al enemigo | ambas | CD 15 | 1d6 × 10 ar o una ventaja contra el frente activo. | Herido; Notoriedad +1. | casero (la actividad existe en la aventura, sin cifras) |
| Sacar de prisión | ambas | CD 15 y 20 ar de soborno (Era 2: 50) | Un trabajador preso vuelve. | El soborno se pierde. | casero |
| Formar | ambas | — | Tras 3 fases formando a un secuaz, pasa a rival. | — | casero |

### A.7 Contextos de fase `[casero]`

Era 1: **Verano en Urteau** ×1 (acto 1) · **Otoño, asedio de Straff y Cett** ×1,5 (actos 2-3) · **Invierno, los koloss** ×2 (acto 4).
Era 2: sin contexto (×1).

### A.8 Sucesos (1d20 + Notoriedad − vigilancia) `[casero, con entradas de la aventura]`

| Total | Era 1 | Era 2 |
|---|---|---|
| 3 o menos | **Golpe de suerte**: +50 ar (Legado). | **Golpe de suerte**: +100 ar. |
| 4-5 | **Llaman a la puerta**: un candidato (oficio a elección del director, lealtad 1). | **Un patrocinador ofrece una meta** con un hito ya hecho (Legado). |
| 6-13 | **Calma**. Con 13, un trabajador pide algo personal (cumplirlo: +1 lealtad). | **Calma** (ídem). |
| 14 | **Escasez**: el mantenimiento de la fase se paga dos veces (la Despensa lo evita). | **Pasquín de Kwylliam**: Notoriedad +1 (la Imprenta lo evita). |
| 15 | **Pelea en la banda**: un trabajador pierde 1 de lealtad. | **Pelea en la banda** (ídem). |
| 16 | **Registro** de los soldados: refugio comprometido salvo prueba CD 15 (Legado); el Escondrijo lo evita. | **Inspección** de la policía de Elendel (ídem). |
| 17 | **Sabotaje**: la obra en curso pierde su avance o un trabajador queda herido (Legado). | **Sabotaje** de Industrias Conrad (ídem). |
| 18 | **Incriminación**: acusan a un PJ; otro gasta una semana en limpiar su nombre (Legado). | **Incriminación** (ídem). |
| 19 | **Mejor oferta**: un trabajador se va salvo que se le pague una semana extra. | **Mejor oferta** (ídem). |
| 20 | **Secuestro** `[casero]`: desaparece un aliado o un trabajador; 1d4 días para rescatarlo → encargo. | La **familia Morgenthax** secuestra a un aliado o un trabajador; 1d4 días para rescatarlo (Legado PDF 262) → encargo. |
| 21-22 | **El frente golpea** a un contacto (biblia). | **El Trío golpea** a un contacto. |
| 23 o más | **Asalto al refugio**: abre la próxima sesión; el refugio queda comprometido. | **Asalto al refugio** (con Notoriedad 3 o más, el del acto 6). |

### A.9 Facciones (de la biblia)

Era 1: Skaa de Urteau y refugiados · Construcciones Kandor y los obreros · Iglesia del Superviviente · Nobleza menor y circuito de bailes ·
Élite Dorada (enemiga) · Ejércitos del asedio · Gobierno de Elend y la Asamblea.
Era 2: Universidad de Elendel · Guardianes · Trío Dorado y la Élite (enemiga) · Industrias Conrad · Familia Morgenthax · Alta sociedad y
prensa · Los Áridos · Armonía.

### A.10 Actividades de reposo de los PJ (oficial)

| Actividad | Resumen | Fuente |
|---|---|---|
| Autorreflexión | 10 días o más, 5 ar/día: cambiar talentos o redistribuir rangos de habilidad. | L.308-309 / PDF 314-315 |
| Entrenamiento | 20 días o más, 5 ar/día, con mentor o libro: una pericia nueva. | ídem |
| Investigación | 10 días o más, 3 ar/día: información importante (Deducción, Saber, Persuasión). | ídem |
| Mentoría en artes metálicas | Cada día guarda una ventaja para ese poder, hasta tus rangos de Alomancia o Feruquimia. | L.309-310 / PDF 315-316 |
| Recuperación | Cada día cuenta como dos para curar heridas. | ídem |
| Trabajar en una profesión | Trabajos o la gestión de una hacienda; patrocinadores y organizaciones lo esperan. | ídem |
| Manufactura | Pericia y herramientas; materiales a mitad de precio; 50 ar de valor por día de trabajo. | L.273-274 / PDF 279-280 |
| Trabajo honrado, Contrabando (Era 1), Recuperar objetos (Era 2), Rumores, Educación superior, Hostigar al enemigo, Mejoras del refugio, Enmendar relaciones, Mantenimiento de la barcaza | Las de la aventura. | Legado PDF 259-264 |

### A.11 Candidatos del libro (papel sugerido; comprobarlo al preparar cada acto)

| Era | Candidato | Papel en la banda | Dónde aparece |
|---|---|---|---|
| 1 | Roben | Barquero (secuaz); se queda en la barcaza | Acto 2 (Legado PDF 261) |
| 1 | Pella y los Hijos de la Ceniza | Contacto aliado; informante | Sesión 0 y acto 1 |
| 1 | Tuss, Aime | Mensajeros de Cynwise | Acto 1 |
| 1 | Murn | Falsificador (legado del Funcionario) | Sesión 0 y acto 1 |
| 1 | Yannen, Amaranta | Sanadores | Actos 3 y 4 |
| 1 | Fadwal | Administrador | Acto 3 (Construcciones Kandor) |
| 1 | Bezryl | Artesana (y alomántica) | Acto 3 |
| 1 | Hilde | Contrabandista: pasos por las líneas del asedio | Acto 4 |
| 1 | Kliss | Informante en la nobleza | Acto 2 |
| 1 | Jedd, Saphee | Matones veteranos | Sesión 0 y actos 2-4 |
| 2 | Merid, K. T. Quiven, Marthis | Compañeros de rango 2 (Legado PDF 190) | Actos 6-8 |
| 2 | Legin | Artesano constructor | Tabla «Nuevo refugio» |
| 2 | Jaja | Artesana herrera | Acto 7 |
| 2 | Taxus | Informante | Acto 7 |
| 2 | Daryl Kant | Matón | Acto 7 |

## Anexo B. Fuentes

- Manual: `C:\Users\xavie\Downloads\Español\SPA_Mistborn_Handbook.pdf`; texto en `cosmere-api/Resources/pdfextract/mistborn_flow.txt` (local, nunca
  al repositorio). Organizaciones L.297-300 / PDF 303-306; refugios L.300-301 / PDF 306-307; compañeros L.286-287 / PDF 292-293;
  patrocinadores L.296 / PDF 302; reposo L.307-310 / PDF 313-316; Manufactura L.273-274 / PDF 279-280; precios L.272 / PDF 278; rangos de PNJ
  L.360 / PDF 366.
- *El legado*: `mistborn_legado_flow.txt` (página impresa = PDF − 3). Banda y barcaza PDF 22, 261; cripta PDF 77-78, 84-86, 250; refugio
  de la Era 2 y «Nuevo refugio» PDF 115-118; compañeros sugeridos PDF 190; reposos y actividades PDF 259-264; Guardianes PDF 265-266;
  legados de la Era 2 PDF 25-26; «Continuar la campaña» PDF 191.
- Guía del mundo: `mistborn_world_guide_flow.txt`. Facciones y patrocinadores, cap. 5 (aprox. GM PDF 120-160; la banda de Kelsier PDF 130,
  el taller de Ranette PDF 151); perfiles Guardaespaldas PDF 239, Informador PDF 240, Matón PDF 252, Planificador PDF 263.
- Biblia de campaña: https://claude.ai/code/artifact/ad3fde1d-0274-491d-b4ea-7981aaa2248f («La banda», «Los actos», «Frentes y
  relojes», «El puente entre eras»).
