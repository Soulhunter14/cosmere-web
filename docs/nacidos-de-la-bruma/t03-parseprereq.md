# T03 · Resultado de la prueba de humo de `parsePrereq` (entrada obligatoria de T35)

Ejecutado el 2026-10-04 desde `cosmere-web-nb` con `npx --yes tsx` contra `src/lib/talentGraph.ts` (sin cambios en el repo),
con `known = {Ruptura de brumoso, Ráfaga de monedas, Mentes de metal ampliadas}`.

| Texto | Cláusula | Resultado actual |
|---|---|---|
| `Alomancia 3 o más; talento principal Ruptura de brumoso` | `Alomancia 3 o más` | `skill` field null, min 3 (válido por diseño: se resuelve por nombre en los huecos personalizados) |
| | `talento principal Ruptura de brumoso` | `talent`, principal |
| `poder Alomancia de acero` | entera | `unknown` |
| `Armamento pesado 2 o más o Armamento ligero 2 o más; talento Ráfaga de monedas` | primera parte | UNA `skill` field null con nombre «Armamento pesado 2 o más o Armamento ligero», min 2 (bloquea para siempre) |
| | `talento Ráfaga de monedas` | `talent` |
| `Voluntad 4 o más; talento Mentes de metal ampliadas` | `Voluntad 4 o más` | `skill` field null; además hereda el tope de habilidad (`minLevel` 11, «máx. 3 hasta Nv 10») |
| | `talento Mentes de metal ampliadas` | `talent` |
| `ascendencia humana o de sangre koloss; no tener ningún otro talento de ruptura o herencia` | primera parte | `unknown` (solo `^ascendencia\s+cantor` es `ancestry`) |
| | segunda parte | `unknown` (sin el «no» sería `story`) |

Con el `known` por defecto (catálogo Stormlight, 233 nombres) las tres cláusulas `talent` pasan a `unknown`: el catálogo
de Mistborn debe llegar por `rules` (T34a) y las transcripciones de T16-T22/T38 deben coincidir carácter a carácter con
los prerrequisitos (mayúsculas y tildes; el punto final se tolera).

## Lo que T35 debe añadir (verificado por ejecución o lectura del código)
1. **`poder`**: probar antes del fallback de `parseClause` (`talentGraph.ts:269-271`), con y sin prefijo «poder », con
   bandera `i` o `norm()` (la regex de §7.7 #2 sin `i` no casa). **Los nombres de arte (`alomancia|feruquimia`) los
   aporta `rules`, nunca literales en `src/lib/` (P8, §7.7 #3); en Stormlight la lista es vacía y nada cambia (P1).**
2. **`skillAny`**: probar ANTES del paso `skill` (`:259`), cuya regex se traga el «o». `p.split(/(?<=o más)\s+o\s+/)` da
   las dos partes; cada una pasa por la regex de habilidad. `rules.skillNameMap` debe incluir «Armamento ligero» y
   «Armamento pesado» (hoy solo «Armas Ligeras/Pesadas», `:73-81`).
3. **`atributo`**: probar antes del paso `skill`, con `norm(nombre)` en los seis atributos. Su gate NO hereda
   `capLevel`/`maxRank`; `levelFloor` (`:824-831`) y `cheapestRoute` (`:996-1000`) solo conocen `skill`: `skillAny` aporta
   el menor `capLevel` de sus opciones y `atributo` nada.
4. **`ancestry: string[]`**: sustituir `^ascendencia\s+cantor` (`:240`); `replace(/^ascendencia\s+/i,'').split(/\s+o\s+(?:de\s+)?/)`
   da `["humana","sangre koloss"]`. Actualizar `gateFor` (`:729-732`), `Gate` (`:628`) y `PrereqClause` (`:218`). Ningún
   fichero de datos Stormlight contiene «ascendencia», así que el `snap` de T34a no cambia.
5. **`ignorarClausulas`**: filtrar cada parte ya separada por `[,;]` antes de `parseClause`;
   `/^no tener ning[uú]n otro talento de ruptura o herencia$/i` casa.
6. `poderes` (`mismoMetal`/`metalesDistintos`): hoy `unknown` (confirmado).
7. `known` de Mistborn = catálogo NdM (`catalog(rules)`, T34a).
8. `Alomancia 3 o más` sigue como `skill` con el tope estándar de habilidad (no verificado contra el libro).

Discrepancias anotadas: `allTalentNames` está en `talentGraph.ts:199-202` (no hacia la 251); el informe 05 §2.2 daba el
nombre de la `skill` de la fila «Armamento…» completo, pero el real termina en «Armamento ligero».
