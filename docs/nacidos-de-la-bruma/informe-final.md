# Nacidos de la Bruma · Informe final para la puerta humana

7 de octubre de 2026. Orquestador: Opus 5.5.

## 1. Estado

- **Tareas:** las 65 de la especificación están fusionadas en las ramas de integración `nacidos-de-la-bruma` de `cosmere-web` y de `cosmere-api`.
- **Seguimientos:** F3-s1, T43-s1, T38b-s1, T46-s1 y T49b-s1.
- **Revisiones de fase:** todas aprobadas.
  - F0 a F3: aprobadas.
  - F4, F5 y F6: aprobadas con observaciones, en una sola revisión cruzada sobre un commit fijo.
  - F7: aprobada con observaciones.
- **Etiquetas:** `nb-f0` a `nb-f7`, en los dos repos.
- **Stormlight idéntico hasta F6:**
  - Los 11 JSON de referencia de T02 coinciden.
  - 509 capturas del DOM idénticas frente al cierre de F3.
  - El `snap` del motor de talentos es idéntico.
- **F7 cambia Stormlight a propósito con T50.** Trae las etiquetas del libro y los bonos de forma en el tirador, la ficha y la Bolsa (Q3, Q22).
- **Bundle:** la suma de chunks eager es 1 506 353 B. El chunk mayor pesa 1 031 458 B, el 49 % de 2 MiB. Ningún dato de Bruma está en los chunks eager.
- **Historial:** en `bitacora-ejecucion.md`, con una fila por tarea, revisión y decisión.

## 2. Migraciones

Se aplican solas al arrancar la API, en este orden:

| Orden | Migración | Qué hace |
|---|---|---|
| M1 | `20261004150721_AddCampaignWorld` | `World` y `Era` en campañas (`stormlight` por defecto) |
| M2 | `20261004200614_AddCharacterMistbornFields` | Camino de nacido del metal, camino inicial, poderes, recursos y Bendiciones en personajes |
| M3 | `20261004232351_AddWorldToCatalog` | Mundo, era, precio y categoría en el catálogo; 50 opciones pasan a `cosmere`; 4 `setval` |
| M5 | `20261004234124_AddWorldToGlobalNpcs` | `World` en PNJ globales |
| M4 | `20261005000352_SeedMistbornCatalog` | Catálogo de Bruma: 35 armas, 8 armaduras, 84 objetos y 23 opciones, con ids 1001+. Lleva una guarda que aborta si esos ids ya existen |
| M6 | `20261005085030_AddCharacterClavos` | Clavos hemalúrgicos en personajes |

## 3. Puerta humana, en orden

1. **Validar en la vista previa** (http://localhost:5173).
   - Crea una campaña de Bruma de Era 1 y otra de Era 2.
   - Prueba la ficha: identidad, camino de nacido del metal, «Artes metálicas», viales, clavos, Bolsa y equipo inicial.
   - Revisa Talentos, Metas, el catálogo, los PNJ, el tirador y la enciclopedia.
   - En tu campaña de Tormentas, comprueba los cambios de T50 (apartado 4).
2. **Descartar el trabajo sin commitear** de tus árboles principales. Es idéntico a los commits de T01: lo he comprobado fichero a fichero.

   ```bash
   git -C cosmere-api checkout -- Messages/Characters/Out/CharacterResponse.cs Services/Characters/CharacterService.cs Services/Characters/TalentosReglas.cs
   rm cosmere-api/Services/Characters/FormasCantor.cs
   git -C cosmere-web checkout -- src/pages/characters/CharacterDetailPage.tsx src/types/index.ts
   rm -r cosmere-web/docs
   ```

   `cosmere-web/docs/` es la copia de trabajo de estos documentos. La rama de integración ya tiene la misma copia sincronizada.
3. **Fusionar** `nacidos-de-la-bruma` en `main` en los dos repos.
4. **En el servidor, antes de `deploy.sh`.** Entra con `ssh -p 2222 xpujol@83.51.10.55` y ejecuta:

   ```bash
   cd ~/cosmere && sudo docker exec cosmere-postgres pg_dump -U jira -d cosmere -Fc > backup-$(date +%F).dump && sudo docker tag cosmere-api:latest cosmere-api:prev && sudo docker tag cosmere-web:latest cosmere-web:prev
   ```

5. **Comprobaciones SQL en producción**, tras el `pg_dump` y antes del despliegue:
   - Consulta de T40. Los tres primeros máximos deben ser menores que 1001:

     ```bash
     sudo docker exec cosmere-postgres psql -U jira -d cosmere -c 'SELECT (SELECT MAX("Id") FROM "WeaponCatalog"), (SELECT MAX("Id") FROM "ArmorCatalog"), (SELECT MAX("Id") FROM "GearItems"), (SELECT MAX("Id") FROM "CatalogOptions");'
     ```

   - Ids de opción de T40. Debe devolver 0 filas:

     ```bash
     sudo docker exec cosmere-postgres psql -U jira -d cosmere -c 'SELECT "Id" FROM "CatalogOptions" WHERE "Id" IN (4,33,34,47,48,49,65,66,67,68,69,78,79,86,100,110,111,112,113,114,115,140,141);'
     ```

   - Si alguna de las dos falla, no despliegues y avísame: abro `T40-s1`, que renumera el seed a 2001+.
   - La consulta de T12 (especificación, §9 T12) va **después** del despliegue. Antes no existen las columnas `World` ni el camino de nacido del metal. Con un único despliegue final debe devolver 0 filas.
6. **Desplegar** con `deploy.sh`. Solo tú.
7. **Comprobar el arranque:**

   ```bash
   sudo docker compose logs api | grep -i "Applying migration"
   sudo docker compose ps
   ```

   El log debe listar las 6 migraciones, y `ps` debe mostrar `api` en `Up` sin reinicios.
8. **Vuelta atrás, si hiciera falta** (especificación, §4.3):
   - Primero, el `DELETE` del catálogo de Bruma con sus 4 `setval` («Rollback de F6»).
   - Después:

     ```bash
     sudo docker compose down && sudo docker tag cosmere-api:prev cosmere-api:latest && sudo docker tag cosmere-web:prev cosmere-web:latest && sudo docker compose up -d
     ```

## 4. Cambios visibles en Stormlight (T50, F7) que debes aceptar

- **Etiquetas del libro.** «Armamento ligero», «Armamento pesado» y «Saber» aparecen en la ficha, el tirador y los PNJ.
- **Atributos de habilidad.** Atletismo usa FUE e Intimidación usa VOL. Un humano tira Intimidación con VOL: en los Windrunner N7 baja de 3 a 2.
- **Bonos de forma.** El tirador, la ficha y la Bolsa suman el bono de forma que calcula el servidor.
  - Un cantor que solo tiene el marcador de forma, sin el talento, ve ahora el +1 que el servidor ya sumaba en salud y defensa.
  - La capacidad de carga de un cantor con bono de Fuerza puede subir de tramo.
- **Defensas de los PNJ.** La página de PNJ agrupa como el libro: Cognitivo es INT+VOL y Espiritual es DIS+PRE. Las defensas mostradas de los adversarios cambian.

## 5. Observaciones y propuestas para tareas aparte (ninguna bloquea)

**Interfaz**

- **Guardar en edición:** la ficha no avisa cuando el servidor responde 400, por ejemplo al pasar a Kandra un personaje con camino de nacido del metal.
- **«Mis talentos»:** con un solo personaje visible, la página puede quedarse en `Spinner`, porque `navigate()` se llama durante el render.
- **«Otros poderes»:** no ofrece «Ficha».
- **Mapa de talentos:** 5 requisitos se muestran como «también requiere…», y hay 3 uniones del libro que pasan por detrás de una carta.
- **«Herencia ferrin»:** a nivel 1, con camino inicial heroico, queda sin colocar y la ficha no avisa.
- **Botón de dados:** el d20 sigue azul con el tema de Bruma, porque es arte oficial.
- **Sin migrar a las etiquetas del libro:** «Armas Ligeras» y «Conocimiento» siguen en el mapa de prerrequisitos de talentos (`talentRules.ts`) y en textos de datos.

**Catálogo y Bolsa**

- **Objetos de recompensa:** con `isRewardOnly` oculto también al director, la Bolsa no puede conceder Hoja koloss, Capa de bruma ni Gabán de bruma. Propuesta: mostrárselos al director con un chip «Solo recompensa».
- **Chip «Viales»:** no se hizo en la pestaña Equipo del catálogo.
- **Orden de las listas:** las de armas, armaduras y objetos no llevan `ORDER BY`.

**Reglas**

- **Bendiciones kandra con otros clavos:** no se modelan en v1.
- **Poder feruquímico de clavo:** muestra cargas, aunque el libro dice que el clavo no es mente de metal salvo decisión de la DJ.
- **Paquetes de equipo inicial:** el libro cita «Cortesano» y «Prisionero», que no están entre los 7. «Militar» se trata como Mercenario `[inferido]`.

**API**

- **Escritura de PNJ:** cualquier miembro de la campaña puede escribir PNJ por API.
- **Respuesta a no miembros:** catálogo y PNJ dan 403, y los demás servicios dan 404.
- **Metas:** `ConcludeMetaAsync` sobrescribe una meta ya concluida.

**Documentación**

- **Temas por mundo:** `DESIGN.md` no los documenta.
- **Cabecera de `index.css`:** dice que todo token de texto pasa AA, y no es literal para `--text-disabled`.
- **Chevron de los selectores:** tiene un color fijo.

**Proceso**

- **Mensajes de merge:** llevan el sufijo en mayúsculas.
- **Bitácora:** la columna Commit no tiene hash.
- **Bundle:** F6 creció +9 556 B eager a nivel de fase; cada tarea cumplió su presupuesto.

## 6. Datos de prueba en la base local (no van a producción)

- **Usuarios y campañas de prueba:** los ids están en `entorno-pruebas.md`, que no tiene seguimiento.
- **Campañas desechables:** 20, 35 a 38 y otras.
- **Personajes desechables:** decenas, todos con «desechable» en el nombre. Uno, el 127, está en la campaña de referencia 3.

Nada de esto llega a producción.

## 7. Limpieza local tras fusionar

Los worktrees de integración `cosmere-web-nb` y `cosmere-api-nb`, y la configuración `nb-api` y `nb-web` de `.claude/launch.json`, se pueden borrar después de fusionar en `main`.
