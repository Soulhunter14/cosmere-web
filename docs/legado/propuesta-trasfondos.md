# Trasfondos de los legados: revisión y propuesta (v2)

24 de octubre de 2026. Revisión de los seis legados de la sesión 0 («La caída») contra la idea de campaña de la biblia y
contra *El legado de los nacidos de la bruma*. Los textos de los apartados 3, 4 y 5 están listos para pegar en la
pestaña «Sesión 0: La caída»; el apartado 8 dice cómo pasan de la biblia al guion de la app.

**Cambios de la v2** (tras la revisión de Xavi, el mismo día):

- En los legados no hay referencias a la Era 2, por ahora: se quitan las que había y no se añaden otras. El puente
  entre eras se queda en «Ecos de la caída» (apartado general) y en la pestaña principal.
- En los legados no se nombra a la banda de Enge: el trasfondo se crea antes de saber que habrá una banda. La banda
  nace al final de la sesión («Llegada a Urteau»), y solo allí se habla de ella.
- Dos preguntas de trasfondo, que cada jugador responde antes de jugar: **por qué eres de ese legado** (una formulación
  por legado, con respuestas posibles que den coherencia) y **si te unieras a una banda, qué buscarías en ella**. Las
  respuestas le sirven al máster para preparar la sesión 0 y para el cierre en Urteau.
- El trasfondo del legado es estático en la app (`src/data/mistborn/legados.ts`, pestaña «Trasfondo» de la hoja, con
  `LegadoCard` y `LegadoPicker`; las respuestas se guardan en `legadoRespuestas`, dos como mucho). Las dos preguntas
  sustituyen allí a las del libro (que la sesión 0 responde jugando), con los ejemplos como pista bajo cada pregunta; los
  resúmenes de la Era 1 dejan de nombrar la red de Enge y valen antes y después de la caída; la tarjeta y el selector de
  un legado de la Era 1 no muestran su conexión con la Era 2 por ahora. La biblia repite las preguntas para el máster.

Fuentes: biblia «Legado: biblia de campaña» (pestaña principal rev. 26, «Sesión 0: La caída» rev. 95, idéntica al guion
`docs/pantalla-director/guiones/legado/sesion-0.md`, e «Ideas de misiones» rev. 8); *El legado*, introducción (legados,
personajes principales y secundarios, hemalurgia, NeBaal) y los momentos de legado de los capítulos 1 a 4
(`docs/pantalla-director/guiones/libro/legado/cap1-4.md`).

## 1. Veredicto

Los seis trasfondos ya cumplen lo que pide el libro: cada legado responde a sus dos preguntas, da una de sus dos pericias
y tiene a sus PNJ de la Era 1 sembrados (Enge, Vadilek, Murn, Delina, Duvall, Cynwise, Tuss, Jedd, Bezryl). Lo que falla
es de coherencia entre documentos y de orden: la biblia promete unos textos hemalúrgicos que la sesión no entrega, los
legados hablan de la banda y de la Era 2 antes de tiempo, y falta la pregunta de origen de cada legado.

| Legado | Preguntas del libro | En la sesión 0 | Pericia |
|---|---|---|---|
| Convicto | ¿Qué delito? ¿Lo cometiste? · ¿Cómo escapaste? | Pregunta 1 (sin «¿lo cometiste?») · la fuga la hace Kelsier | Bajos fondos / Fuerzas del orden |
| Funcionario | ¿Qué cantón? ¿Tatuajes? · ¿Qué te hizo ver las injusticias? | Preguntas 1 y 2 | Ministerio de Acero / Dominios Interiores |
| Noble | ¿Apellido y por qué se la conocía? · ¿Por qué no puedes volver? | Preguntas 1 y 5 | Alta sociedad / Luthadel |
| Pilluelo | ¿Qué te hace indispensable? · ¿Élite o igualdad? | Preguntas 2 y 5 | Bajos fondos / Alta sociedad |
| Veterano | ¿Tu función? · ¿Cómo dejaste el ejército? | Pregunta 2 (prompt) · deserta esta noche | Vida militar / Dominios Exteriores |
| Cronista | ¿En qué se centran tus crónicas? · ¿Cómo llevas el registro? ¿Nombre? | Preguntas 1 y 2 | Peregrina / Dominio de Terris |

## 2. Lo que no cuadra

1. **Los textos hemalúrgicos.** La pestaña principal dice que en la sesión 0 los PJs «roban unos textos hemalúrgicos que
   Vadilek quiere» (Los actos) y que Vadilek «busca los textos robados en la caída» (Frentes). «Ideas de misiones»
   apoya el arco «El primer clavo» en «la clave para descifrar los textos de la sesión 0». La sesión 0 solo deja que
   vean cómo se llevan los cofres.
2. **La banda antes de tiempo.** «Antes de jugar» pide «un trasfondo con motivos para la banda de Enge», y los ecos del
   Convicto, el Funcionario, el Veterano y el Cronista hablan de «su banda». El trasfondo se crea sin saber que habrá
   una.
3. **La Era 2 antes de tiempo.** Siete líneas de los legados miran a la Era 2 (metas del Funcionario, del Pilluelo y del
   Cronista; ecos del Funcionario y del Cronista; el momento del Convicto en la placita).
4. **Falta la pregunta de origen.** Ningún legado pregunta cómo se llegó a él: por qué entró en el Ministerio, por qué se
   unió al ejército, cómo acabó en la calle. Y nadie pregunta qué buscaría cada uno en una banda.
5. **Una decisión pendiente ya decidida.** «Por qué le importa a la banda que Enge desaparezca» sigue sin marcar en la
   pestaña principal, pero la sesión da el motivo; con la segunda pregunta del trasfondo queda escrito.
6. **Cynwise.** En la sesión 0 está en Luthadel con el Pilluelo; en el capítulo 1 es presa de Vadilek en Urteau y quiere
   «volver a Luthadel». Falta el puente.
7. **El Veterano «héroe de guerra».** El libro le da fama (Tuss le reconoce en el Crisol, Saphee le idolatra, Jedd
   defendió Luthadel con él). En la sesión es un guardia de los Haught sin hazaña conocida, y Tuss viaja en el convoy
   sin mirarle.
8. **La familia del Noble** se va al norte con Straff Venture, y Urteau, donde empieza el capítulo 1, es el bastión de
   Straff. La familia estaría a dos calles de la barcaza.
9. **El Cronista publicado.** En el capítulo 2, Guiverre tiene «una de sus obras» en la estantería; la sesión no
   pregunta qué ha escrito que circule. Y la guardadora del sótano «si el máster quiere, es Bezryl»: el capítulo 3
   pregunta si ya la conocía, así que conviene decidirlo.
10. **La galería del Convicto.** Cadme (cap. 2) y Preece (cap. 3) estuvieron en su prisión; la sesión no las siembra, y
    la pregunta del libro «¿llegaste a cometerlo?» no se hace.
11. **Pequeñas.** El apellido del Noble no puede ser el de una casa del libro; Jedd tiene que acabar en el ejército de
    Straff; el sello del ojo dorado aparece tres veces (lista, estuche, carros) y nadie lo une.

## 3. El trasfondo: dos preguntas antes de jugar

**Dónde:** «Cómo funciona», el párrafo «Un trasfondo con motivos para la banda» se sustituye por este, y detrás va un
apartado nuevo «El trasfondo: dos preguntas» (antes de «El tono»).

Párrafo que sustituye a «Un trasfondo con motivos para la banda»:

> **Un trasfondo antes de jugar.** Al elegir el legado, cada jugador responde por escrito a dos preguntas: por qué es de
> ese legado (cada legado tiene la suya) y qué buscaría en una banda si se uniera a una. Los personajes no saben que van
> a acabar en ninguna: lo que haya al final de la noche lo descubren jugando. Las respuestas le sirven al máster para
> preparar la sesión (cada escena dice cómo usarlas) y para el cierre en Urteau.

Apartado nuevo:

> ### El trasfondo: dos preguntas
>
> Se responden por escrito, en unas líneas, antes de la sesión. Las respuestas de ejemplo son para dar ideas y para que el
> origen encaje con el Imperio Final; el jugador puede inventar la suya.
>
> **1. ¿Por qué eres de este legado?** Una pregunta por legado:
>
> - **Convicto: ¿Cómo acabaste en una celda del Ministerio?** Nací en una plantación y me escapé: la celda fue donde
>   acabó la huida · Me vendió alguien de confianza: un socio, un pariente, mi propia red · Caí en una redada que no iba a
>   por mí; estaba donde no debía · Me entregué para que no se llevaran a otra persona.
> - **Funcionario: ¿Por qué entraste en el Ministerio de Acero?** Mi familia lleva generaciones dando obligadores al
>   Ministerio: no hubo elección · Era la única salida para una casa menor sin herencia que repartir · Creía de verdad en
>   el lord Legislador, y ya no · Alguien pagó mi puesto a cambio de un favor que todavía debo.
> - **Noble: ¿Qué lugar ocupas en tu casa, y por qué nunca encajaste en él?** Sin derecho a heredar: me educaron para
>   servir a quien hereda · Quien hace las preguntas que la casa no quiere oír · Quien pasa más tiempo con los criados que
>   en el salón · Moneda de cambio: me prometieron a otra casa para pagar una deuda.
> - **Pilluelo: ¿Cómo acabaste en la calle?** Nací en los Laberintos y no conocí a mis padres · A mi familia se la
>   llevaron (una redada, una deuda, un capricho noble) y yo me escondí · Huí de una plantación, o de la casa noble donde
>   servía · Me echaron de un taller o de un gremio, y la calle fue lo que quedó.
> - **Veterano: ¿Por qué te uniste al ejército?** La leva se llevó a los jóvenes de mi calle, y yo estaba en ella · Para
>   comer: era el uniforme o los Pozos · Mi casa, pequeña, debía soldados a los Haught, y me tocó a mí · Para huir de
>   algo, o de alguien, que la guerra tapó.
> - **Cronista: ¿Quién te puso una pluma en la mano, y por qué sigues escribiendo?** Un guardador terrisano me enseñó a
>   escondidas, y con la letra, lo prohibido · Mi señor necesitaba a alguien que anotara lo que él no quería recordar ·
>   Me formó el Ministerio, y me fui (o me echaron) con lo aprendido.
>
> **2. Si te unieras a una banda, ¿qué buscarías en ella?** La misma para todos:
>
> - Paga y techo: un trabajo que dé de comer y un sitio donde dormir sin cadenas.
> - Gente que no pregunte por mi pasado.
> - Una familia: alguien que note si no vuelvo.
> - Una causa: devolver el golpe a quien me hizo esto.
> - Protección: alguien entre quien me busca y yo.
> - Alguien a quien seguir, o gente a la que mandar.
>
> **Cómo las usa el máster.** La primera dice cómo leer al personaje en su escena de la mañana: cada escena lleva una línea
> «Del trasfondo» que la recoge. La segunda se guarda hasta el final: en «Llegada a Urteau» es lo que Enge le ofrece a
> cada uno, o lo que le falta por conseguir.

## 4. Cambios transversales

### 4.1 Las páginas del patio (resuelve el punto 1)

**Dónde:** «El Cantón» › «Momentos de cada legado en el patio», línea del Cronista; y un párrafo nuevo después de
«Hagáis lo que hagáis, es demasiado tarde…», antes de «Combate en el patio de carga».

Línea del Cronista (sustituye a la actual):

> - **Cronista:** los cofres llevan el sello de la biblioteca del Cantón: son libros prohibidos, y se los están llevando,
>   no quemando. Uno se ha abierto al subirlo al carro, y por el suelo del patio hay páginas sueltas que nadie recoge.

Párrafo nuevo:

> **Las páginas del patio.** Entre las cajas quedan las hojas que cayeron del cofre: dibujos de cuerpos con clavos
> señalados en el cuello, el pecho y los ojos, columnas de cifras y una caligrafía esmerada con una tinta que brilla a la
> luz de las antorchas. Quien las recoja se las lleva; no hay tirada. Son los textos hemalúrgicos de la sesión 0: sin la
> clave de las celdas de Kredik Shaw (arco «El primer clavo», misión 2) no se entienden, pero Vadilek sabe que faltan.
> **Eco:** la banda tiene los textos de la caída.

También en «Lo que pasa siempre» › **La noche (parte 3)**, al final: «Un cofre se abre al cargarlo, y las páginas que
caen se las lleva la banda.» Y en «Ecos de la caída» › «Ecos de PNJ»:

> - **Las páginas del patio** · vuelve en Cap. 1 y arco «El primer clavo»: Vadilek las busca (su frente «desaparece gente
>   en Urteau» empieza por quien pregunta por ellas); la tinta es la misma del despacho de Vadilek (cap. 1), y la misión 2
>   del arco da la clave para leerlas

### 4.2 «Llegada a Urteau»: lo que cada uno buscaba (resuelve los puntos 2 y 5)

**Dónde:** «Llegada a Urteau», el párrafo «La banda de Enge.» se sustituye por este y la lista:

> **La banda de Enge.** Cada jugador decide cómo responde su personaje, pero todos acaban en la banda: es la premisa de la
> campaña. Aquí vuelve la segunda pregunta del trasfondo: lo que cada uno dijo que buscaría en una banda es lo que Enge le
> ofrece esta tarde, o lo que todavía le falta. Pide a cada jugador que diga, con sus palabras, qué le da Enge y qué no.
> Cada uno puede quedarse además con la meta **«Le devolveré el favor a Enge»**. Es el equivalente a la misión de Velin en
> *El primer paso*, y la razón por la que su desaparición en el capítulo 1 les importará.
>
> **Lo que la noche le ha dado a cada legado**, por si la respuesta del trasfondo no basta:
>
> - **Convicto:** amistad y un plan sin estrenar. Enge fue la primera en años que le trató como a alguien, y la fuga que
>   tramaron juntos todavía se la deben el uno al otro.
> - **Funcionario:** una huida que es una deuda. Le vieron con ella (o la reclamó como suya): para el Ministerio y para
>   Murn ya es de los de Enge. Y la segunda lista se fue a Urteau en tres carros.
> - **Noble:** no tiene casa, los Haught le buscan y Enge es la única persona de la barcaza que no le pregunta de qué
>   familia es.
> - **Pilluelo:** le pagan, le persiguen los Haught y Cynwise ha desaparecido: sin red, la barcaza es la red.
> - **Veterano:** una causa. Desertó sin saber por qué luchar, y la pelirroja se la dio la primera noche.
> - **Cronista:** la historia. La presa que sacó a cuatro desconocidos de la placita es la mejor que ha visto nunca, y los
>   libros del Cantón se fueron al norte.
>
> Es lo que responde, en el capítulo 1, a por qué le importa a la banda que Enge desaparezca: lo que cada uno buscaba y
> encontró, o aún espera encontrar.

### 4.3 PNJ del libro sembrados en la sesión 0

Nombres solo para el máster; los jugadores los descubren cuando el libro los trae.

| PNJ | En el libro | Dónde se siembra | ¿Se nombra en la mesa? |
|---|---|---|---|
| Cadme | cap. 2: presa fugada, intermediaria de Enge | Convicto, «Pregunta mucho» y PNJ | No |
| Preece | cap. 3: obrera de Kandor, presa con el Convicto | Convicto, PNJ | No |
| Tuss | cap. 1: preso del Crisol, reconoce al Veterano | Ya está (carro, jaulas); eco nuevo con el Veterano | Sí |
| Anastas Elariel | cap. 2: amigo de la infancia del Noble | Noble, «Pregunta mucho» | Sí |
| Saphee | cap. 2: recluta que idolatra al Veterano | Veterano, PNJ «La recluta» | No |
| Jedd | cap. 4: camarada, ahora con Straff | Ya está; puente a Straff en los ecos | No |
| Yannen | cap. 3: médico de la enfermería Haught | Funcionario, «Pregunta mucho» | No |
| Bezryl | cap. 3: guardadora que media en Kandor | El sótano: se decide que es ella | No (no se presenta) |
| Cynwise | cap. 1: presa del Crisol | Ya está; puente a Urteau en los ecos | Sí |
| Demoux | cap. 3: capitán de Elend | Ecos del Veterano y de quien liberó presos | No |

## 5. Cambios por legado

Cada escena gana una línea «Del trasfondo» (cómo usar las dos respuestas), amplía su «Pregunta mucho», y pierde las
referencias a la banda y a la Era 2 que tenía.

### 5.1 Convicto: «El cuarto nombre»

**«Pregunta mucho»** (sustituye):

> Pregunta mucho: qué hace al despertar en la celda, qué ruido de la cárcel no olvidará nunca, a quién echa de menos, si
> de verdad cometió el delito, y quién de su galería se fugó antes y quién sigue dentro.

**Del trasfondo** (párrafo nuevo, detrás de «Pregunta mucho»):

> **Del trasfondo.** Cómo acabó en la celda es lo que el obligador no lee en voz alta y lo que Pella percibe cuando se le
> arrima; úsalo cuando Enge pregunta «¿cuánto tiempo llevas pensando en salir de aquí?».

**PNJ** (añadir después del Carcelero):

> - **Los de la galería** (sin nombre): la presa que se fugó hace años, deslumbrante y con otro nombre cada vez, es Cadme
>   (cap. 2); la que sigue dentro y saldrá hoy con el caos es Preece, obrera (cap. 3). Si el jugador las describe,
>   apúntalas: el libro las trae de vuelta.

**Ecos para la campaña** (sustituye la frase «Enge no olvida a quien compartió celda y planes con ella: el Convicto es el
primero de su banda.» por «Enge no olvida a quien compartió celda y planes con ella.», y añade):

> - Tuss, el hombre callado de manos grandes, viaja en su carro y esa noche en las jaulas del Cantón; en el Crisol
>   (cap. 1) está entre los presos y le recuerda. Apunta la respuesta a «¿llegaste a cometerlo?»: es la que más pesa en
>   su historia.

**Parte 2 › «Momentos de cada legado en la placita» › Convicto:** quitar «Es la historia que contará el Narrador en la
Era 2.» (queda el eco «Me liberó el Superviviente»).

### 5.2 Funcionario: «La segunda lista»

**«Pregunta mucho»** (sustituye):

> Pregunta mucho: cuál fue su último tatuaje, a quién le debe el puesto, qué se lleva a casa en la cabeza cada noche, y
> qué médico de su cantón le debe un favor (sin nombre: es Yannen, que hoy trabaja en la enfermería de los Haught; cap. 3).

**Del trasfondo** (párrafo nuevo):

> **Del trasfondo.** Por qué entró en el Ministerio decide qué le pesa al firmar la segunda lista; Murn, que sabe
> demasiado, puede mencionarlo de pasada («Su familia estará orgullosa», «Un puesto caro, el suyo»).

**Pregunta 5, tercera respuesta**, el eco «su manera de entender la ley llegará al Vigilante de la ley de la Era 2» pasa a:

> **Eco** desde esta noche no firma nada sin leerlo, y Murn lo sabe (cap. 1)

**Ecos para la campaña** (sustituye «Lo que haga por la pelirroja en la placita decide cómo le trata Enge: es el segundo
en entrar en su banda. El libro de registro puede aparecer en los Archivos Nacionales en la Era 2 (cap. 5).» por «Lo que
haga por la pelirroja en la placita decide cómo le trata Enge.», y añade):

> - El sello del ojo dorado de la segunda lista vuelve en el lacre del estuche de los Haught y en los carros del Cantón:
>   es el de la Élite Dorada, y el Funcionario es quien primero lo ve.

### 5.3 Noble: «La última mañana de la casa»

**«Pregunta mucho»** (sustituye):

> Pregunta mucho: qué estancia de la fortaleza es la suya, qué criado le crio de verdad, qué mete en el baúl y qué deja
> atrás, y con quién jugaba de crío en las fortalezas (Delina Tekiel y Anastas Elariel, que vuelven en los capítulos 1 y 2).

**Del trasfondo** (párrafo nuevo):

> **Del trasfondo.** Su lugar en la casa decide quién le habla en el carruaje y por qué le encargan el estuche: a quien no
> hereda se le piden las cosas sucias, y a quien hace preguntas se le da una respuesta que no quería.

**Pregunta 1**, tras «El jugador dice además el apellido de su familia.» (añadir):

> Una casa menor, que la guerra ha dejado sin aliados; no una de las del libro (Elariel, Tekiel, Haught, Seeris, Hasting,
> Venture, Buvidas, Urbain, Habren).

**Después de «El encargo.»** (párrafo nuevo, solo para el máster):

> **Qué dice el contrato.** Hace años, con la casa arruinada, se firmó ante obligadores un acuerdo con «la sociedad del
> Ojo Dorado»: las barcazas, los almacenes o las cuadrillas de la casa (según la respuesta 1) moverían «mercancía» entre
> Luthadel y Urteau sin preguntar, y a cambio la sociedad pagaría sus deudas. La mercancía eran skaa para el laboratorio
> de Vadilek. Los Haught, de la Élite, guardan el contrato para tener a la casa cogida del cuello, y por eso la casa se
> va al norte: la Élite la reclama en Urteau. Leerlo (meta «Sacaré a la luz lo que firmó mi familia») es el primer hilo
> del Crisol (cap. 1). Si prefieres algo más pequeño, el contrato es una deuda de juego impagable: funciona igual, pero no
> lleva a Urteau.

**Ecos para la campaña** (añadir):

> - Su familia se ha ido al norte con Straff Venture: en el capítulo 1 está en Urteau, bajo su protección, y en el 4, en el
>   campamento Venture. «No puedes volver» se pone a prueba las dos veces. Enge huele que es noble y se lo echa en cara en
>   voz alta la primera semana de barcaza (humor, no castigo): es lo que ella dejó de ser.

### 5.4 Pilluelo: «Día de bolsillos llenos»

**«Pregunta mucho»** (sustituye):

> Pregunta mucho: dónde duerme, quién le enseñó el oficio y qué fue de esa persona, qué fue lo primero que robó.

**Del trasfondo** (párrafo nuevo):

> **Del trasfondo.** Cómo acabó en la calle es lo que Cynwise sabe y lo que el cliente noble ignora; si huyó de una casa
> noble, el cliente puede ser de esa casa, y los dos lo saben.

**Pregunta 5**, los ecos de las dos primeras respuestas pasan a:

> «Quiero sentarme a su mesa.» … **Eco** mira a la clase mercantil: Kandor le verá como a uno de los suyos (cap. 3)
> «Que todos jueguen con las mismas cartas.» … **Eco** la calle skaa confía en quien piensa así: la red de Cynwise (caps. 1 y 3)

**Ecos para la campaña** (añadir):

> - Cynwise desaparece esa noche con su secreto: lo que hizo en la placita le cierra los Laberintos, y acaba en Urteau,
>   donde los hombres de Murn le cogen. El Pilluelo le encuentra un año después en las celdas del Crisol (cap. 1),
>   queriendo «volver a Luthadel», como dice el libro; el secreto de la placita es su baza.

### 5.5 Veterano: «Un paseo»

**«Pregunta mucho»** (sustituye):

> Pregunta mucho: qué recuerda de su primera batalla, qué hace con las manos cuando espera órdenes, a quién escribiría si
> supiera escribir, y qué hazaña de su unidad se cuenta en los cuarteles (un paso que aguantaron, un pueblo que no
> quemaron, una retirada con todos vivos): es lo que le hace «héroe de guerra» para Tuss (cap. 1) y para su antigua
> recluta (cap. 2).

**Del trasfondo** (párrafo nuevo):

> **Del trasfondo.** Por qué se unió al ejército explica la hazaña de su unidad y lo que le une al camarada: quien entró a
> la fuerza o por hambre tiene en él a su única familia; quien entró por su casa tiene algo que demostrar.

**PNJ** (añadir después del Camarada):

> - **La recluta**: la más joven de la unidad; le mira como a quien le enseñó a seguir viva. No se nombra: en el capítulo
>   2 resultará ser Saphee, al servicio de los Seeris. Si el Veterano calma a su unidad o la hace retirarse, ella es la
>   primera en obedecer.

**Pregunta 5, primera respuesta**, el eco «busca una causa: la banda puede llegar a serlo» pasa a:

> **Eco** busca una causa: apunta cuál le ofrece la noche

**Ecos para la campaña** (añadir):

> - Tuss, desde la jaula del convoy, ve lo que el Veterano hace con la anciana y en la placita: en el Crisol (cap. 1) le
>   reconoce y le pide ayuda a gritos. Jedd se fue al norte con los Haught y acabó en el ejército de Straff (cap. 4). Lo
>   que la calle cuenta del soldado de los Haught llega a la Iglesia del Superviviente: Demoux (cap. 3) lo ha oído.

**«Cruces entre legados»** (parte 1, añadir una línea):

> - **Veterano y Convicto:** Tuss, en la jaula del Convicto, ve al soldado de los Haught; en el Crisol (cap. 1) los
>   reconoce a los dos.

### 5.6 Cronista: «Lo que se escribe y lo que pasó»

**«Pregunta mucho»** (sustituye):

> Pregunta mucho: quién le enseñó a escribir, qué página de su registro relee cuando no puede dormir, qué no se atreve a
> anotar, y qué escrito suyo circula copiado de mano en mano sin su permiso (Guiverre tiene una copia en Fellise: cap. 2).

**Del trasfondo** (párrafo nuevo):

> **Del trasfondo.** Quién le puso la pluma en la mano decide si entiende la lengua de la guardadora del sótano y cómo
> anota la palabra «Superviviente»: quien aprendió en el Ministerio sabe lo que cuesta escribirla.

**Pregunta 5, tercera respuesta**, el eco «el Explorador de la Era 2 encontrará su nombre en la primera página» pasa a:

> **Eco** firma la primera página con su nombre: su crónica está pensada para sobrevivirle

**«El sótano» › PNJ Guardadora**, el eco (sustituye a «Si el máster quiere, es Bezryl…»):

> **Eco:** es Bezryl, la guardadora que en el capítulo 3 media en Construcciones Kandor: recordará a quienes se refugiaron
> en su sótano y empieza como aliada. Si el Cronista es terrisano, le habla en su lengua y le pregunta si guarda mentes de
> cobre. Su hermano Fadwal, mayordomo, no ha vuelto esta noche; en el capítulo 3 sigue desaparecido.

**Ecos para la campaña** (sustituye «Lo que el Cronista escriba esta noche es el primer capítulo de la crónica que
estudiará el Explorador de la Era 2.» por «Lo que el Cronista escriba esta noche es el primer capítulo de su crónica de la
caída.», y «Ver escapar a la pelirroja es lo que le hace seguirla: así entra en la banda de Enge.» por «Ver escapar a la
pelirroja es lo que le hace seguirla.»; y añade):

> - Las páginas del patio son suyas si nadie más las quiere: su crónica de la caída empieza con un fajo que no entiende,
>   escrito con la misma tinta que encontrará en el despacho de Vadilek (cap. 1). El sótano ya responde a la pregunta del
>   capítulo 3: conocía a Bezryl de la noche de la caída.

## 6. Pestaña principal e «Ideas de misiones»

- **Los actos › Sesión 0 › Núcleo:** «Prólogos por legado; los PJs se cruzan en el Cantón de la Inquisición y se llevan
  unas páginas de los textos hemalúrgicos que Vadilek quiere». (Hoy dice «roban unos textos».) El frente de Vadilek
  («Busca los textos robados en la caída») queda como está: ahora es verdad.
- **Decisiones pendientes:** marcar «Por qué le importa a la banda que Enge desaparezca» y dejarla así: «Decidido en la
  sesión 0: lo que cada uno dijo que buscaría en una banda (segunda pregunta del trasfondo) es lo que Enge le dio, o lo
  que aún espera; ver «Llegada a Urteau».»
- **Ideas › El primer clavo › Preguntas abiertas › «¿Quién era la víctima del clavo?»:** candidatos que salen de los
  trasfondos, a elegir en la mesa: quien enseñó el oficio al Pilluelo (estaño: «ojos en todas partes»), el hijo de la madre
  skaa que suplicó al Funcionario, o alguien de la galería del Convicto.

## 7. Lo que no se toca

- Las mecánicas de la sesión (preguntas, +1, caminos, metales, puntos de control) quedan igual. Las dos preguntas del
  trasfondo no dan marcas ni números.
- «Ecos de la caída» (apartado general: «Mi legado», recuerdos de la caída) y el puente entre eras de la pestaña
  principal conservan sus referencias a la Era 2: la regla «sin Era 2» es para los legados.
- Pella y los Hijos de la Ceniza son invención nuestra (en el libro Pella es solo una presa del Crisol); encajan con el
  tablero de la Era 1 y se quedan.
- La pericia del Cronista se llama «Peregrina» en la app (`src/data/mistborn/legados.ts`) y «Peregrino» en el libro; se
  deja como está.
- Las fichas de Enge, Murn, Delina y Duvall coinciden con el libro y no cambian.

## 8. Cómo se aplica

Aplicado el 24 de octubre de 2026: biblia («Sesión 0: La caída» rev. 117, pestaña principal rev. 28, «Ideas de misiones»
rev. 9), `legados.ts` y las dos tarjetas, guion regenerado y cargado en «Bruma TEST» (25 escenas; las decisiones guardadas
se conservan).

1. Pestaña «Sesión 0: La caída» de la biblia: los textos de los apartados 3, 4 y 5, en los puntos indicados.
2. Regenerar el guion de la app desde la pestaña (el XML del documento):
   `python -I docs/pantalla-director/guiones/legado/biblia_a_guion.py <sesion0.xml> docs/pantalla-director/guiones/legado/sesion-0.md`
3. Recargar en «Bruma TEST» (campaña 42), con la API local en marcha y el token del director de `entorno-pruebas.md`:
   `node docs/pantalla-director/guiones/legado/vaciar_y_cargar.mjs <sesion-0.md> <token> 42 ensayo` y después sin
   `ensayo`. Vacía las escenas (se van marcas, resultados y contadores; las decisiones se quedan).
4. Pestaña principal e «Ideas de misiones»: apartado 6.
5. Commit de `docs/legado/propuesta-trasfondos.md` y del guion regenerado.
