# Pantalla del director: decisiones guardadas

Las escenas de la Sesión pueden llevar preguntas (`### Decisión: …`) cuya respuesta se guarda por personaje, con su prueba si la
tiene. Nació para jugar la sesión 0 de *El legado* («La caída») como *El primer paso*: las decisiones construyen la hoja y dejan
ecos para la campaña. El formato y el uso en la mesa están en `guion-formato.md` («Decisiones»); aquí, el diseño.

## Decisiones de diseño

| Decisión | Por qué |
|---|---|
| La pantalla **no cambia la ficha**: suma y recomienda. | Igual que los avances. La creación tiene topes (3 por atributo) y puntos de control que el director revisa con el jugador. |
| Las marcas de **camino y metal**, ocultas por defecto, con un interruptor por dispositivo (`localStorage` `cosmere-pantalla-marcas`). | Son el registro secreto que se revela al final; la tableta puede estar mirando a la mesa. |
| Clave estable grupo + título + pregunta + personaje (normalizada, `claveDecision`), no el id de la escena. | Sobrevive a reimportar, archivar y borrar escenas: los ecos se consultan en capítulos posteriores. |
| Cada elección guarda **una copia** de la opción (texto, efectos, prueba, éxito, escena, pregunta, personaje). | El registro no depende de que la escena siga en la sesión ni de que el Markdown no cambie. |
| `decide:` resuelve por **legado o nombre**; sin coincidencia, un hueco sin personaje. | Una sesión de prueba sin legados todavía, o un jugador invitado, también se pueden registrar. |
| `VERSION_ESTADO` pasa a **4**. | Un cliente antiguo abre el documento en solo lectura en lugar de guardarlo sin `decisiones`. |

## Archivos

- `src/pages/pantalla/estado.ts`: `Eleccion`, `Efecto`, `CLAVES_EFECTO`, `PantallaEstado.decisiones`, `claveDecision`,
  `prefijoDecision` y su validación en `normalizarEstado`. `quitarEscena` no toca `decisiones`.
- `src/pages/pantalla/guion.ts`: la clase de sección `decision`, la meta `decide:` de la escena, `leerDecision`, `leerOpcion`,
  `cantidadesDe`, `nombresDe`, `pruebaDeOpcion`; lo decidido entra en `detallesEscena` (bitácora de la escena archivada y
  *prompts*) y el formato en `FORMATO_GUION`.
- `src/pages/pantalla/decisiones.ts` (puro): `quienesDeciden` y `registroDecisiones` (sumas por personaje; un éxito con «+1 al
  atributo de la habilidad» suma al atributo de `HabilidadDef.atributo`).
- `src/pages/pantalla/DecisionGuion.tsx` (UI): `DecisionGuion` (la sección en la escena) y `RegistroDecisiones` (panel Grupo).
- `src/pages/pantalla/PanelGuion.tsx` y `PanelGrupo.tsx`: los conectan.

## Comprobación

1. `npx tsc -b` y `npm run lint` sin errores.
2. Importar un guion con `decide:` y dos `### Decisión` (una con `prueba:`) en una campaña de pruebas.
3. Marcar una opción: queda marcada, se anota «Decisión» en la bitácora y aparece en Grupo → «Registro de decisiones».
4. Marcar la prueba como superada: se anota «Prueba» y el registro suma 1 al atributo de la habilidad.
5. Con el ojo, mostrar y ocultar caminos y metales: cambian a la vez en la escena y en el registro.
6. Borrar la escena: el registro sigue. Quitar una decisión desde el registro pide confirmación.
