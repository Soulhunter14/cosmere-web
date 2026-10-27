# Propósito, obstáculo y primera meta desde las preguntas del legado: propuesta

Fecha: 27-10-2026. Pregunta de Xavi: «el propósito y el obstáculo podrían salir de las preguntas, ¿verdad?». Los jugadores aún no
han respondido ninguna pregunta, así que las preguntas pueden cambiar.

## 1. Lo que dicen los libros

- **Manual, paso 7 «Historia» (L.23 / PDF 29).** «Elige propósito y obstáculo»: el propósito es «lo que te impulsa, te define y te
  inspira»; el obstáculo, «lo que se interpone en el camino de tu propósito, una y otra vez» (orgullo, impulsividad, avaricia…).
  Después, «Elige tus metas»: objetivos tangibles, con hitos y recompensa.
- **Manual, capítulo 8 (L.281-282 / PDF 287-288).** El propósito es la necesidad principal, «una fuerza impulsora constante en tu
  vida, no una meta concreta y alcanzable», intrínseca e inmutable. Ejemplos: salvar a los demás, buscar la verdad, alcanzar nuevas
  cotas, encontrar la conexión, buscar justicia, preservar la vida. El obstáculo es un rasgo de toda la vida o algo surgido del pasado,
  también inmutable; ejemplos: arrepentimiento profundo, miedo específico, rencoroso, inseguridad, desconfianza. «Hay quienes ven en el
  propósito y el obstáculo las dos caras de la misma moneda»: qué pasa cuando llevas tu mejor rasgo al extremo. Las metas se eligen a
  partir de los dos.
- **El legado (L.19 / PDF 22 y L.25 / PDF 28).** Las preguntas de cada legado son hechos del pasado. El libro no las liga al propósito
  ni al obstáculo: pide que, a partir de las respuestas de legado y de vínculos, el director acuerde con cada jugador «al menos una meta
  personal con la que su PJ empiece la partida».

## 2. Diagnóstico de nuestras tres preguntas

| Pregunta de hoy | Guarda | Qué es según el manual |
|---|---|---|
| Origen («¿Por qué eres de este legado?») | `legadoRespuestas[0]` | Un hecho del pasado: queda como está |
| Impulso («¿Qué te empuja a dejar lo que eres e intentar cambiar las cosas?») | `legadoRespuestas[1]` | **El propósito**, palabra por palabra («lo que te impulsa»). Solo hay que pedir la respuesta en su registro: una fuerza constante, no un objetivo |
| Meta («¿Qué buscas cuando las cosas cambien?») | `legadoRespuestas[2]` | **Una meta** de la hoja (concreta y alcanzable), no el propósito. Es justo lo que El legado pide convertir en la primera meta |
| — | — | **El obstáculo no lo pregunta nadie.** El origen lo insinúa («me vendió alguien de confianza») pero no lo nombra |

Conclusión: el propósito sí sale de la segunda pregunta; el obstáculo necesita una pregunta propia; la tercera es la primera meta.

## 3. Qué se propone

Cuatro pasos de escritura en lugar de tres, y cada respuesta va donde la hoja ya la tiene:

| # | Paso | Pregunta (según el legado) | Guarda |
|---|---|---|---|
| 6 | Origen | Igual que hoy | `legadoRespuestas[0]` |
| 7 | Tu propósito | La pregunta del impulso de hoy, con los ejemplos reescritos como fuerzas constantes (§4) y, debajo, los seis del manual | `Character.proposito` (pestaña «Trasfondo» de la ficha) |
| 8 | Tu obstáculo | Nueva, una por legado («¿Qué te dejó la celda, que se te cruza una y otra vez?»…), con ejemplos por legado y, debajo, los cinco del manual | `Character.obstaculo` (ídem) |
| 9 | Tu primera meta | **Hecho el 27-10-2026 (aún como paso 8, `legadoRespuestas[2]`):** un logro, un misterio o una deuda, con una pregunta por legado (§4). Al marcar «Personaje creado» la API la convierte en la primera meta de la ficha | `legadoRespuestas[1]` cuando entren propósito y obstáculo, y una `Meta` al crear el personaje |

Los pasos 1 a 5 no cambian. La lista pasa de 8 a 9 pasos (el director libera uno más). La ficha sigue a la creación, como con la
alomancia: nada que copiar después, y el director lee las cuatro respuestas en su tabla para preparar la sesión 0.

### Reglas

- Las dos preguntas narrativas del legado (origen y meta) siguen en `LegadoDef.preguntas` y se ven en la tarjeta del legado de la ficha
  con sus respuestas, como hoy. Propósito y obstáculo son campos de la hoja: la ficha los muestra y edita en «Trasfondo» desde siempre.
- Un jugador solo puede escribir propósito y obstáculo con su paso liberado (400 si no), igual que el resto; con la campaña iniciada
  siguen cerrados para él (`CierreCampana.Campos` ya los incluye). Nada cambia para los personajes ya creados.
- **Primera meta.** Al marcar «Personaje creado», si la respuesta de la meta no está vacía y el personaje no tiene una meta activa con
  ese título, la API crea una `Meta` activa: título = la primera frase de la respuesta (hasta el primer punto, máximo 120 caracteres),
  descripción = la respuesta entera y la pregunta de la que viene. Deshacer «Personaje creado» no la borra (el director la quita en
  «Metas» si quiere) y volver a marcarlo no la duplica. Antes de ese momento el jugador puede reescribirla sin dejar rastro.
- Era 2: sus legados conservan las dos preguntas del libro; los pasos 7 y 8 muestran entonces la pregunta genérica («¿Qué te empuja a
  seguir adelante?», «¿Qué se te cruza una y otra vez?») con los ejemplos del manual.
- Los ejemplos son paráfrasis nuestras; de los del manual se toman los nombres cortos («Buscar justicia», «Desconfianza») con una
  línea propia, nunca el texto del libro.

## 4. Textos propuestos (Era 1)

El registro: el propósito es una fuerza que no se acaba (empieza por «Que…», «Proteger…», «Demostrar…»); el obstáculo es un rasgo o
una herida que vuelve, en primera persona.

**La meta (aprobada y aplicada el 27-10-2026).** Ayuda del paso: «Un logro, un misterio o una deuda: dilo como algo que se pueda tachar,
sabrás el día que lo consigas. Si quieres, añade por dónde empezarías. Al crear el personaje será tu primera meta.»
- Convicto. «¿Qué cuenta te llevas pendiente de la celda: una persona, un nombre, algo que recuperar?» · Encontrar a quien me vendió y
  mirarle a la cara · Sacar de dentro a quien entró conmigo · Recuperar lo que me quitaron al detenerme · Borrar mi número de los
  registros del Ministerio.
- Cronista. «¿Qué quieres terminar de escribir, encontrar o poner a salvo?» · Terminar la crónica que me hicieron tachar y esconderla
  donde el Ministerio no llegue · Recuperar el nombre que borraron y escribirlo donde alguien lo lea · Encontrar al guardador que me
  enseñó · Reunir en un solo registro lo que vi hoy, con nombres.
- Funcionario. «¿Qué expediente quieres cerrar: un papel que recuperar, un nombre que borrar, una verdad que sacar?» · Recuperar o
  destruir el expediente que firmé · Encontrar a la persona de la súplica que no atendí · Averiguar qué hace el Cantón de la
  Inquisición con los nombres de sus listas · Sacar mi nombre de los libros del Ministerio.
- Noble. «¿Qué quieres sacar de tu casa: una persona, un papel, una deuda?» · Leer el pacto que me enseñaron a no leer · Sacar de la
  fortaleza a la persona de abajo que me importa · Romper el compromiso con la casa a la que me prometieron · Poner lo que sé de mi
  casa en manos de quien pueda usarlo.
- Pilluelo. «¿Qué golpe, qué persona o qué deuda te sacaría de la calle?» · Encontrar al crío de la red que se llevaron · Saber quién
  era el noble que me pagó por lo que no era un robo, y por qué · Dar el golpe que me saque de los Laberintos para siempre · Reunir a
  los míos bajo un techo que no sea de nadie más.
- Veterano. «¿Qué cuenta te llevas pendiente del ejército: una persona, una orden, una deuda?» · Encontrar a quien me dio la orden que
  no cumplí · Volver al pueblo que quemamos y hacer algo por los que quedan · Sacar a mi camarada de la unidad antes de que lo manden
  al frente · Dejar escrito lo que hubo detrás de la victoria, con nombres.

Propósito y obstáculo siguen pendientes de decisión; sus ejemplos de §4 no repiten ninguna meta.

**Convicto**
- Propósito. «¿Qué te empuja a querer cambiar las cosas, y no solo salir de aquí?» · Que nadie pague por lo que no hizo · Sacar a los
  míos de donde estén metidos · Cumplir lo que prometo, cueste lo que cueste · Que se sepa a quién encierran de verdad, y por qué.
- Obstáculo. «¿Qué te dejó la celda, que se te cruza una y otra vez?» · No me fío de nadie desde que me vendieron · Me pierde la rabia:
  cuando veo un uniforme no pienso · Un nombre que di para salir, y que me pesa · El miedo a volver dentro me hace callar cuando debería
  hablar.

**Cronista**
- Propósito. «¿Qué te empuja a escribir lo que pasa, y no lo que te mandan?» · Buscar la verdad y dejarla escrita · Que nadie borre un
  nombre sin que alguien lo recuerde · Entender lo que pasa antes de que lo cuenten los que mandan · Dar voz a quien no sabe escribir.
- Obstáculo. «¿Qué se interpone entre tú y lo que quieres contar?» · Miro y anoto, pero me cuesta actuar: la pluma me sirve de excusa ·
  Una crónica que taché por miedo, y que no me perdono · Desprecio a quien cuenta la historia de otra manera · Me cuesta confiar lo que
  sé a nadie: un papel es más seguro que una persona.

**Funcionario**
- Propósito. «¿Qué te empuja a dejar de servir al Ministerio e intentar cambiar las cosas?» · Que la ley valga igual para skaa y nobles ·
  Que ningún papel vuelva a costar una vida · Sacar a la luz lo que el Ministerio entierra · Proteger a quien el sistema ha decidido que
  no cuenta.
- Obstáculo. «¿Qué te dejó el Ministerio, que se te cruza una y otra vez?» · Un expediente que firmé y no debí firmar: me persigue ·
  Todavía pienso como un obligador: primero el papel, después la persona · El miedo a que el Cantón de la Inquisición sepa mi nombre ·
  Me creo mejor que la gente a la que digo querer ayudar.

**Noble**
- Propósito. «¿Qué te empuja a romper con tu casa e intentar cambiar las cosas?» · Que el apellido no decida quién manda ni quién sirve ·
  Encontrar a gente que me quiera por lo que hago, no por lo que heredé · Demostrar que valgo fuera de la fortaleza · Que los skaa de
  mi casa no vuelvan a pagar por nosotros.
- Obstáculo. «¿Qué te dejó la fortaleza, que se te cruza una y otra vez?» · El orgullo: me cuesta pedir ayuda y obedecer a quien no
  tiene apellido · No sé vivir sin criados: lo cotidiano me supera y me avergüenza · Lo que vi hacer a mi familia y callé · Desconfío de
  quien se me acerca: en la corte nadie se acerca gratis.

**Pilluelo**
- Propósito. «¿Qué te empuja a dejar de robar para otros e intentar cambiar las cosas?» · Que los míos estén bien, cueste lo que cueste
  · Que nadie tenga que robar para comer · Llegar más lejos de lo que nadie esperaba de un pilluelo · Que ningún crío pague por un
  encargo de un mayor.
- Obstáculo. «¿Qué te dejó la calle, que se te cruza una y otra vez?» · Primero cojo, luego pregunto: me puede la impulsividad · No me
  fío ni de mi sombra, y se nota · Me siento menos que cualquiera con zapatos y me escondo donde sé que destaco · Un crío de la red al
  que se llevaron por un encargo mío.

**Veterano**
- Propósito. «¿Qué te empuja a colgar la librea e intentar cambiar las cosas?» · Proteger a quien no pueda defenderse · Que nadie
  vuelva a decidir por mí contra quién cargo · Que nadie vuelva a mandar cargar contra gente desarmada · Que los míos vuelvan a casa:
  no dejo a nadie atrás.
- Obstáculo. «¿Qué te dejó la guerra, que se te cruza una y otra vez?» · Una orden que cumplí, y las caras de aquel pueblo · Obedezco
  antes de pensar: años de librea no se quitan en una noche · Me enciendo rápido y pego primero · Sin un mando encima me pierdo.

**Del manual, para todos (segundo grupo de ejemplos, L.281-282 / PDF 287-288).** Propósitos: Salvar a los demás · Buscar la verdad ·
Alcanzar nuevas cotas · Encontrar la conexión · Buscar justicia · Preservar la vida. Obstáculos: Arrepentimiento profundo · Miedo
específico · Rencoroso · Inseguridad · Desconfianza. Cada uno con una línea nuestra.

## 5. Cambios en la API (`cosmere-api`, rama `feature/creacion`)

Sin migración: `Characters.Proposito`, `Characters.Obstaculo` y `Metas` existen.

1. `Services/Campaigns/CreacionGuiada.cs`: ids `Proposito = "proposito"` y `Obstaculo = "obstaculo"`; en `ValidarCambios`, dos ramas
   más del `switch`: `(r.Proposito, c.Proposito)` y `(r.Obstaculo, c.Obstaculo)`. Doc del tipo al día.
2. `Services/Worlds/MistbornRules.cs`: `PasosCreacion = [Nombre, Legado, Ascendencia, DatoDe(alomante), DatoDe(alomancia), Respuesta(0),
   Proposito, Obstaculo, Respuesta(1)]`. `MistbornData.PreguntasLegado = 2`.
3. `Messages/Creacion/Out/CreacionResponse.cs`: `CreacionPersonajeResponse.Proposito` y `.Obstaculo`; `CreacionService.BuildAsync` los rellena.
4. Primera meta: `IWorldRules.MetaDeCreacion(IReadOnlyList<string> legadoRespuestas) → MetaCreacion?` (`MetaCreacion` ya existe:
   `Titulo`, `Descripcion`). Mistborn: respuesta `[1]` no vacía → título = primera frase (máx. 120), descripción = respuesta + «De la
   creación: ¿Qué buscas cuando las cosas cambien?». Stormlight: `null`. `CreacionService.CompletarAsync(completada: true)`: si hay meta
   dictada y no existe una activa del personaje con ese título, `db.Metas.Add(new MetaEntity { … Estado = "activa" })`.
5. Docs de `PasosCreacion` y `CLAUDE.md` del workspace (sección Worlds, pasos).

Verificación: `dotnet build`; con `urllib` y las credenciales de `entorno-pruebas.md` (nunca en el chat): jugador escribe `proposito`
con el paso 7 sin liberar → 400 que nombra el paso; liberado → 200 y `GET /creacion` lo trae; `completar` crea la meta
(`GET /characters/{id}/metas`), deshacer + completar no la duplica; director libre en todo.

## 6. Cambios en la web (`cosmere-web`, rama `feature/creacion`)

1. `src/worlds/types.ts`: `PasoCreacion` admite `{ id: 'proposito' }` y `{ id: 'obstaculo' }` (campos de texto de la ficha).
2. `src/types/index.ts`: `CreacionPersonaje.proposito` y `.obstaculo`.
3. `src/data/mistborn/legados.ts`: `LegadoDef.proposito?` y `.obstaculo?` de tipo `PreguntaLegadoDef { pregunta; ejemplos }`; Era 1 con
   los textos de §4; `preguntas` y `ejemplos` pasan a dos (origen, meta). Cabecera del archivo al día. Era 2 sin cambios.
4. `src/data/mistborn/creacion.ts`: `PROPOSITOS_MANUAL` y `OBSTACULOS_MANUAL` (nombre corto + línea nuestra) y las dos preguntas genéricas.
5. `src/worlds/mistborn.ts`: pasos 6 a 9 (`legadoRespuestas:0`, `proposito`, `obstaculo`, `legadoRespuestas:1`) con título y ayuda
   («Al crear el personaje, tu respuesta será su primera meta»); los cuatro con `cambiable: true` (el director permite o deniega).
6. `src/pages/creacion/pasos.ts`: `pasoHecho` para los dos ids.
7. `src/pages/creacion/CreacionJugador.tsx`: `Cambio` admite `proposito` y `obstaculo`; `ResumenPaso` y `CuerpoPaso` los tratan con un
   `PasoTexto` que reutiliza `PreguntaLegado` (pregunta del legado o la genérica; ejemplos = los del legado y, detrás, los del manual bajo
   el rótulo «Del manual»). Guardado con la misma mutación.
8. `src/pages/creacion/CreacionDirector.tsx`: «Ver respuestas» muestra también propósito y obstáculo.
9. Ficha: nada que tocar (`LegadoCard` y `LegadoPicker` pintan las preguntas que haya; «Trasfondo» ya edita los dos campos).
10. Sesión 0: `docs/pantalla-director/guiones/legado/sesion-0.md` («Un trasfondo antes de jugar», «El trasfondo: tres preguntas» → cuatro,
    «Cómo las usa el máster»: el obstáculo tensa la pregunta 4 de cada escena; «Llegada a Urteau»: «la tercera» → «la meta»), la biblia
    (pestaña «Sesión 0: La caída», con las herramientas de documentos) y volver a cargar el guion en Bruma TEST. Las escenas no cambian:
    «lo que le empuja» de cada «Del trasfondo» es el propósito.
11. `docs/creacion/propuesta.md` (filas 6-9 y estado), `cosmere-web/CLAUDE.md` (párrafo de Creación), bitácora.

Verificación: `npx tsc -b`, `npm run lint`, `grep -rnE "===\s*'(mistborn|stormlight)'" src` vacío; recorrido en Bruma TEST con
`nb-jugador`: los cuatro pasos, «Cambiar» solo con permiso, el director ve las respuestas, «Personaje creado» y la meta en «Metas»; la
ficha muestra propósito y obstáculo en «Trasfondo» y las dos preguntas en la tarjeta del legado; captura de «Personajes» en
Caminapiedras igual que antes. Medir los chunks eager de `dist/index.html` contra `docs/nacidos-de-la-bruma/bundle-referencia.txt`.

## 7. Datos existentes

Nadie ha respondido en producción. En local, `asda` (212) y «Spook de prueba» (214) tienen tres respuestas: una sentencia las recoloca
(`"Proposito" = respuesta 2`, `"LegadoRespuestas" = ARRAY[respuesta 1, respuesta 3]`); la misma valdría en producción si apareciera
alguna. Campañas con 8 pasos liberados: el 9 (la meta) lo libera el director.

## 8. Decisiones por defecto (dime si alguna no te encaja)

1. Propósito y obstáculo se escriben directamente en la ficha, no en `creacionDatos`.
2. Los cuatro pasos de texto son cambiables cuando el director lo permite (de inicio, denegado), como el trasfondo.
3. La meta se convierte en `Meta` al marcar «Personaje creado», no antes; deshacer no la borra; no se duplica por título.
4. Los ejemplos del legado van primero y los del manual detrás; el jugador puede escribir lo que quiera.
5. La meta está hecha (27-10-2026): pregunta y ejemplos nuevos por legado, y la `Meta` al marcar «Personaje creado».
6. `PreguntasLegado` pasa a 2 (la API rechaza una tercera respuesta).
7. Sesión 0: se actualizan la introducción y «Cómo las usa el máster»; las escenas quedan como están.

## 9. Entregas

1. **F1, API** (1-5 de §5), con sus pruebas.
2. **F2, web** (1-9 de §6), recorrido en Bruma TEST.
3. **F3, sesión 0 y docs** (10-11 de §6), bitácora y memoria. Integración en `main` cuando Xavi lo diga; despliegue suyo, sin migración.

## 10. Estado (27-10-2026)

- **Meta, hecho** en `feature/creacion`: `legados.ts` (tercera pregunta y ejemplos de los seis legados de la Era 1), `mistborn.ts` (título y
  ayuda del paso 8), API `IWorldRules.MetaInicial` (Mistborn: última respuesta del legado → título = primera frase, máx. 120; Stormlight:
  `null`) y `CreacionService.CompletarAsync` (crea la `Meta` activa una vez por título). Guion local de la sesión 0 al día (introducción,
  ejemplos por legado, «Cómo las usa el máster», «Llegada a Urteau»); la pestaña de la biblia y la copia cargada en Bruma TEST, pendientes.
- **Propósito y obstáculo:** pendientes de que Xavi decida los textos de §4.
