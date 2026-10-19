# Personaje muerto — plan de implementación

Estado: **implementado** en `feature/personaje-muerto` (cosmere-api y cosmere-web), sin fusionar. Fecha: 19 oct 2026.
Las desviaciones del plan están en «Notas de implementación», al final.

## Objetivo

El director puede marcar un personaje jugador como **Muerto**. Desde ese momento:

- la ficha (y sus pestañas Bolsa, Metas y Talentos) queda **de solo lectura** para todos, director incluido;
- **todo su equipo se pierde**: armas, armaduras, equipo, `spells`, armadura puesta y dinero, más lo que su mundo considere
  equipo (Mistborn: arquillas, cuentas de atium, viales y cargas de las mentes de metal);
- lo perdido se guarda como **copia de solo lectura** («Lo que llevaba»), para que el director pueda **devolverlo a la vida** si
  se equivocó: entonces el personaje recupera exactamente lo que llevaba.

## Decisiones tomadas (19 oct 2026)

| # | Decisión |
|---|----------|
| D1 | El equipo se retira de la ficha, pero se guarda una copia (`EquipoAlMorir`) visible en solo lectura. |
| D2 | El director puede deshacerlo («Devolver a la vida»), y el personaje recupera la copia. |
| D3 | El dinero cuenta como equipo: marcos (Stormlight) y arquillas (Mistborn). |
| D4 | Los clavos hemalúrgicos **no** son equipo: se quedan en la ficha, en solo lectura. |
| D5 | Solo el director marca la muerte y la deshace. El jugador sigue viendo su ficha, en solo lectura. |

Principio Cosmere: la muerte es una regla **común** (núcleo). El núcleo retira el equipo común; lo que es de un mundo lo retira y lo
devuelve **ese mundo** a través de `IWorldRules`. Ningún código compara ids de mundo.

## Inventario de lo que se retira

| Origen | Campo | Quién lo retira |
|---|---|---|
| `CharacterEntity` | `Weapons`, `Armor`, `Spells`, `Equipment` → `[]` | núcleo |
| `CharacterEntity` | `EquippedArmor` → `""`, `Desvio` → `0` | núcleo |
| `CharacterEntity` | `MarcosInfusas`, `MarcosOpacas` → `0` | núcleo (en Mistborn ya valen 0) |
| `Recursos` (JSON) | `arquillas`, `cuentasAtium` → se quitan | `MistbornRules` |
| `Poderes` (JSON) | `Viales` y `Cargas` de cada poder → `0` | `MistbornRules` |
| `Recursos` (JSON) | `investiduraActual` → `0` (es estado de mesa y no se guarda) | `MistbornRules` |
| `Clavos` | sin cambios (D4) | — |

---

## Tareas de la API (`cosmere-api`)

### T1. Entidad, Fluent y migración `AddCharacterMuerte`

**Archivos:** `Messages/Database/Entities/CharacterEntity.cs`, `Infrastructure/Data/CosmereContext.cs`, `Infrastructure/Migrations/*`.

```csharp
// CharacterEntity, after Legado/LegadoRespuestas
// Muerte (núcleo, ambos mundos). Defaults de BD declarados en CosmereContext.
public bool Muerto { get; set; } = false;
public DateTime? MuertoEn { get; set; }
public string CausaMuerte { get; set; } = string.Empty;
public string EquipoAlMorir { get; set; } = "{}";   // JSON (camelCase) de EquipoGuardado; "{}" = nada guardado
```

```csharp
// CosmereContext, next to the other CharacterEntity defaults
modelBuilder.Entity<CharacterEntity>().Property(c => c.Muerto).HasDefaultValue(false);
modelBuilder.Entity<CharacterEntity>().Property(c => c.CausaMuerte).HasDefaultValue("");
modelBuilder.Entity<CharacterEntity>().Property(c => c.EquipoAlMorir).HasDefaultValue("{}");
```

Migración (con la API parada):

```bash
dotnet build
dotnet ef migrations add AddCharacterMuerte --project Infrastructure --startup-project API
dotnet ef database update --project Infrastructure --startup-project API
```

**Aceptación:** la migración solo hace `AddColumn` (tres `NOT NULL` con default y `MuertoEn` nullable); no hay `DropColumn`
ni `RenameColumn`. Los personajes existentes quedan con `Muerto = false`.

### T2. Copia del equipo y reglas de la muerte (núcleo)

**Archivo nuevo:** `Messages/Characters/EquipoGuardado.cs`

```csharp
namespace Messages.Characters;

/// <summary>Lo que llevaba un personaje al morir: se le retira de la ficha y se le devuelve si vuelve a la vida.</summary>
public sealed class EquipoGuardado
{
    public List<string> Weapons { get; set; } = [];
    public List<string> Armor { get; set; } = [];
    public List<string> Spells { get; set; } = [];
    public List<string> Equipment { get; set; } = [];
    public string EquippedArmor { get; set; } = string.Empty;
    public int Desvio { get; set; }
    public int MarcosInfusas { get; set; }
    public int MarcosOpacas { get; set; }
    /// <summary>Lo que el mundo retiró, con claves que solo el mundo entiende (p. ej. "arquillas", "viales:alomancia:hierro").</summary>
    public Dictionary<string, decimal> Mundo { get; set; } = [];
}
```

**`Services/Characters/CharacterJson.cs`:** `ParseEquipoGuardado(string?)` (`"{}"`, vacío o inválido → `null`) y
`SerializarEquipoGuardado(EquipoGuardado?)` (`null` → `"{}"`), con las mismas opciones camelCase que el resto.

**Archivo nuevo:** `Services/Characters/MuertePersonaje.cs` (static)

```csharp
public static class MuertePersonaje
{
    /// <summary>409 (InvalidOperationException) for any write on a dead character.</summary>
    public static void EnsureVivo(CharacterEntity c)
    {
        if (c.Muerto) throw new InvalidOperationException("This character is dead: their sheet is read-only.");
    }

    /// <summary>Takes the core gear off the sheet, asks the world for its own, and stores both as EquipoAlMorir.</summary>
    public static void Morir(CharacterEntity c, IWorldRules world, string? causa) { … }

    /// <summary>Gives back exactly what was stored (core + world) and clears the death fields.</summary>
    public static void Revivir(CharacterEntity c, IWorldRules world) { … }
}
```

- `Morir`: copia los campos de la tabla «Inventario» en un `EquipoGuardado`, los vacía, llama a
  `guardado.Mundo = world.RetirarEquipo(c)`, guarda `EquipoAlMorir`, `Muerto = true`, `MuertoEn = DateTime.UtcNow`,
  `CausaMuerte = (causa ?? "").Trim()` (máx. 300 caracteres; más → `ArgumentException`) y `UpdatedAt`.
- `Revivir`: con la copia (si existe) restaura las listas y el dinero, llama a `world.DevolverEquipo(c, guardado.Mundo)` y deja
  `Muerto = false`, `MuertoEn = null`, `CausaMuerte = ""`, `EquipoAlMorir = "{}"`.

### T3. `IWorldRules`: el equipo de cada mundo

**Archivos:** `Services/Worlds/IWorldRules.cs`, `StormlightRules.cs`, `MistbornRules.cs`.

```csharp
/// <summary>Al morir: retira de la ficha el equipo propio del mundo y lo devuelve como claves → valores (Stormlight: vacío).</summary>
Dictionary<string, decimal> RetirarEquipo(CharacterEntity c);

/// <summary>Al volver a la vida: devuelve lo que RetirarEquipo guardó (Stormlight: no-op).</summary>
void DevolverEquipo(CharacterEntity c, IReadOnlyDictionary<string, decimal> guardado);
```

- **Stormlight:** `RetirarEquipo` → `[]`; `DevolverEquipo` no hace nada.
- **Mistborn:**
  - `RetirarEquipo`: quita `arquillas` y `cuentasAtium` de `Recursos`, guardando su valor si es mayor que 0. Para cada poder
    con `Viales > 0` guarda `viales:<arte>:<metal>`, y con `Cargas > 0` guarda `cargas:<arte>:<metal>`, y deja ambos a 0.
    Pone `investiduraActual` a 0 (no se guarda). Reescribe `Recursos` y `Poderes` con `CharacterJson`.
  - `DevolverEquipo`: la operación inversa. Una clave cuyo poder ya no existe se ignora.

**Aceptación:** retirar y luego devolver deja `Recursos` y `Poderes` como estaban, salvo `investiduraActual`.

### T4. Endpoints de muerte (solo el director)

**Archivos:** `ICharacterService.cs`, `CharacterService.cs`, `API/Controllers/CharactersController.cs`,
`Messages/Characters/In/MuerteRequest.cs` (nuevo).

```csharp
public class MuerteRequest { public string? Causa { get; set; } }
```

| Verbo | Ruta | Cuerpo | Respuesta | Errores |
|---|---|---|---|---|
| `POST` | `campaigns/{campaignId}/characters/{characterId}/muerte` | `MuerteRequest` | `CharacterResponse` | 403 si no es el director, 404, 409 si ya está muerto, 400 si la causa pasa de 300 caracteres |
| `DELETE` | `campaigns/{campaignId}/characters/{characterId}/muerte` | — | `CharacterResponse` | 403, 404, 409 si no está muerto |

En el servicio: `EnsureGmAsync`, la fila con `FOR UPDATE` dentro de una transacción (igual que `AplicarAccionMesaAsync`),
`MuertePersonaje.Morir` o `Revivir`, `SaveChanges`, commit, carga de `Metas` y `MapToResponse`.

### T5. Bloquear todas las escrituras sobre un muerto (409)

| Archivo | Método | Cambio |
|---|---|---|
| `CharacterService.cs` | `UpdateCharacterAsync` | `MuertePersonaje.EnsureVivo(character)` tras cargar la fila (también para el director). |
| `CharacterService.cs` | `AplicarAccionMesaAsync` | lo mismo, tras el `FOR UPDATE` (recursos, beber vial, inicio de escena). |
| `MetaService.cs` | `CreateMetaAsync`, `UpdateMetaAsync`, `ConcludeMetaAsync`, `DeleteMetaAsync` | un nuevo `EnsureVivoAsync(characterId)` tras `EnsureAccessAsync`/`GetMetaOrThrowAsync`; `GetMetasAsync` no cambia. |
| `CrewSheetService.cs` | `PersonajeBloqueadoAsync` | `MuertePersonaje.EnsureVivo(character)`: cubre aportar, meter y sacar del almacén. |

Se siguen permitiendo `GET`, `AssignCharacterAsync` (reasignar) y `DeleteCharacterAsync` (borrar con confirmación).

### T6. `CharacterResponse`

**Archivos:** `Messages/Characters/Out/CharacterResponse.cs`, `CharacterService.MapToResponse`.

```csharp
public bool Muerto { get; set; }
public DateTime? MuertoEn { get; set; }
public string CausaMuerte { get; set; } = string.Empty;
public EquipoGuardado? EquipoAlMorir { get; set; }   // null cuando no hay copia
```

**Verificación de la API:** `dotnet build` sin errores ni avisos nuevos. Con `API.http` o `curl`, en la campaña **Bruma TEST
(id 42)** y en una de Stormlight:

1. Un PJ con armas, armadura puesta, dinero y viales → `POST …/muerte` → 200 con listas vacías, `muerto: true` y la copia completa.
2. `PUT`, `PATCH …/recursos`, `POST …/beber-vial`, `POST /metas`, aportar a la banda → **409**.
3. `POST …/muerte` hecho por un jugador → 403; repetirlo sobre un muerto → 409.
4. `DELETE …/muerte` → 200, con el equipo, el dinero, los viales y las cargas como al principio; `equipoAlMorir: null`.

---

## Tareas de la web (`cosmere-web`)

### T7. Tipos, API y helpers

- `src/types/index.ts`: `EquipoGuardado` (espejo de C#; `mundo: Record<string, number>`) y, en `Character`,
  `muerto: boolean; muertoEn: string | null; causaMuerte: string; equipoAlMorir: EquipoGuardado | null`.
- `src/api/characters.ts`: añadir los cuatro campos a `MistbornFields`/`normalizeCharacter`
  (`muerto ?? false`, `muertoEn ?? null`, `causaMuerte ?? ''`, `equipoAlMorir ?? null`), más
  `morir(cId, chId, causa?)` → `POST …/muerte` y `revivir(cId, chId)` → `DELETE …/muerte`.
- **Archivo nuevo** `src/lib/personajes.ts`:
  - `vivos(list)`: los que no están muertos.
  - `vivosPrimero(list)`: un orden estable con los muertos al final.
  - `miPersonaje(list, userId)`: el vivo del jugador o, si no tiene ninguno, su muerto más reciente (`muertoEn`).
- Invalidar tras `morir` y `revivir`: `['characters', cId]`, `['character', cId, chId]` (prefijo) y `['crew', cId]` si existe.

### T8. Ficha (`CharacterDetailPage.tsx`)

- `const muerto = char.muerto`, `const canEdit = (isGm || isOwner) && !muerto` y `const gmActivo = isGm && !muerto`. Sustituir
  `isGm` por `gmActivo` en todo lo que **cambia** algo: los selectores de camino, orden y ascendencia, `onPick`, las acciones de
  mesa, «Añadir poder» y `ArtesMetalicasTab`/`puedeActuar`. Lo que solo **muestra** (desgloses, datos del director) sigue con `isGm`.
- **Franja de muerte**, bajo el héroe cuando `muerto`: icono `Skull` de Lucide (no hay un icono oficial equivalente), con tonos
  `--rubi-bg`/`--rubi-border`:
  - título «Muerto»;
  - subtítulo «Cayó el {fecha corta es-ES}» y, si hay causa, «· {causaMuerte}»;
  - texto «La ficha es de solo lectura.».
- **Acción del director**, junto a «Editar» (solo con `isGm`, fuera del modo edición):
  - vivo → botón «Marcar como muerto» que abre un `Sheet` con un `Textarea` «Causa (opcional)» (máx. 300) y el botón
    «Marcar como muerto»;
  - antes de enviar, un `ConfirmDialog` con el título «¿Marcar a {nombre} como muerto?» y el texto «Su ficha quedará de solo
    lectura y perderá todo su equipo y su dinero. Lo que llevaba se guarda por si lo devuelves a la vida.» Botón «Marcar como
    muerto» (tono peligro);
  - muerto → botón «Devolver a la vida» con un `ConfirmDialog` «¿Devolver a {nombre} a la vida?» y el texto «Recupera la
    ficha editable y todo lo que llevaba al morir.»
- **«Lo que llevaba»**, una sección de solo lectura cuando `muerto && equipoAlMorir` (en Características, tras los recursos):
  listas de armas, armaduras (marca «puesta» en `equippedArmor`) y equipo; dinero con `formatMoneda` (marcos o arquillas
  según el mundo); viales y cargas a partir de `mundo`, con el `MetalGlyph`, cargado de forma diferida. Una lista vacía no se
  muestra.

### T9. Bolsa, Metas y Talentos de solo lectura

- `BolsaDetailPage.tsx`: `const soloLectura = character.muerto`. Ocultar «Añadir», quitar, equipar, los `Stepper` de dinero y
  arquillas, «Equipo inicial» y los envíos a la banda; un retorno temprano en cada `mutate` como red. Encabezado: la misma franja
  de T8 (extraerla a `components/MuerteBanner.tsx`).
- `MetasDetailPage.tsx`: con `soloLectura` no se crean, editan, concluyen ni borran metas; se ven todas.
- `TalentosDetailPage.tsx`: `canEditIdeals && !muerto`, y el mapa de talentos sin poder elegir.

### T10. Listados

`CharacterListPage`, `BolsaPage`, `MetasPage` y `TalentosPage`: ordenar con `vivosPrimero`, y en la tarjeta de un muerto
`opacity: 0.6`, el nombre sin cambiar y una etiqueta «Muerto» (`Skull` de 12 px, tono rubí). Se sigue pudiendo abrir la ficha.

### T11. Elegir el personaje del jugador

- `DiceRoller.tsx:1433` y `PersonajesPage.tsx:154`: `miPersonaje(chars, user?.id)` en lugar de `find(ownerId === user)`.
- `DiceRoller`: el selector «Tirar como» del director lista `vivos(campaignChars)`. Un jugador cuyo único personaje está muerto
  no recibe el modificador rellenado (`playerCharacter = null` si `muerto`).

### T12. Pantalla del director y banda

| Archivo | Cambio |
|---|---|
| `pantalla/PanelGrupo.tsx` | Las tarjetas del grupo y `fuera` usan `vivos(personajes)`; `RegistroDecisiones` recibe **todos** (lo pasado se queda). |
| `pantalla/PanelEncuentro.tsx` (líneas 71, 395, 1318) | «Añadir personajes» y `sinCombate` usan `vivos`; un PJ que ya está en el encuentro sigue en él (es una copia). |
| `pantalla/DecisionGuion.tsx` | `quienesDeciden(d.decide, vivos(personajes))`; `RegistroDecisiones` sin cambios. |
| `pantalla/PanelGuion.tsx` | `pjs` del prompt con `vivos`. |
| `pantalla/PanelBitacora.tsx` | Sin cambios: la crónica nombra a todos los que jugaron. |
| `banda/useBanda.ts:246` | Actores `vivos(personajes)`. |
| `home/HomeCampaignPage.tsx:89` | «Personajes» cuenta `vivos(characters).length`. |

**Verificación de la web:**

```bash
npx tsc -b
npm run lint
npm run build
```

- `grep -rnE "===\s*'(mistborn|stormlight)'" src` sigue vacío.
- Bundle: la suma de los scripts de `dist/index.html` no crece más de 3 kB respecto a
  `docs/nacidos-de-la-bruma/bundle-referencia.txt` («Lo que llevaba» usa `MetalGlyph` de forma diferida).
- Stormlight sin cambios para los **vivos**: comparar el DOM de la ficha, la lista y la Bolsa de un PJ vivo antes y después.
- Manual en **Bruma TEST (id 42)**, con el Chrome de Xavi en solo lectura (el navegador integrado no puede iniciar sesión):
  1. Marcar como muerto con causa → franja, «Lo que llevaba» y ningún control de edición en la ficha, la Bolsa, las Metas ni los Talentos.
  2. Lista: al final, atenuado y con «Muerto».
  3. Pantalla: no sale en el grupo ni en «Añadir personajes»; el registro de decisiones conserva lo suyo.
  4. Devolver a la vida → todo como antes.

---

## Orden y reparto

1. **API:** T1 → T2 → T3 → T4 → T5 → T6 (una sola rama `feature/personaje-muerto` en `cosmere-api`, con la API parada para la migración).
2. **Web:** T7 primero (contrato); después T8–T9 (ficha y pestañas) y T10–T12 (listados y pantalla), que tocan archivos distintos
   y pueden ir en paralelo.
3. **Despliegue** (lo hace Xavi): incluye la migración `AddCharacterMuerte` → `pg_dump`, etiquetar `:prev`, `bash deploy.sh` y
   comprobar `Applying migration`.

## Notas de implementación (19 oct 2026)

- **Confirmación de la muerte:** el `Sheet` de la causa es el propio diálogo de confirmación. Explica lo que se pierde y tiene
  «Cancelar» y «Marcar como muerto», así que nunca actúa al primer toque. No hay un `ConfirmDialog` más encima.
- **Bolsa de un muerto:** en lugar de desactivar cada control, la Bolsa muestra la franja y «Lo que llevaba» (está vacía de todos modos).
- **Bundle:** la suma de los chunks iniciales pasa de 1 411 097 B (`main`) a 1 418 898 B (+7 801 B). Es más que los 3 kB de T7-T12,
  pero es solo interfaz de páginas que ya cargaban al inicio (ficha, Bolsa, Metas, Talentos, listados). No entra ningún dato de
  Bruma: `MetalGlyph` sigue siendo diferido y `ArteMetal` es un `import type`.
- **Verificado contra la API local en Bruma TEST:** morir (con la copia completa: armas, armadura puesta, desvío, equipo, marcos,
  arquillas y viales), 403 del jugador, 409 al repetir y en `PUT`, recursos, beber vial, inicio de escena, crear meta, aportar a la
  tesorería y meter en el almacén; lectura con 200, devolver a la vida con todo restaurado, 409 al repetirlo y 400 con una causa de
  301 caracteres. Los personajes temporales de la prueba se borraron.
- **Sin verificar en el navegador:** la sesión local del Chrome de Xavi había caducado (401 → `/login`). Hay que mirar la ficha,
  los listados y la pantalla del director con una sesión válida.
- Al enviar la causa con acentos desde Git Bash, `curl` no manda UTF-8 y la API responde 400. El navegador siempre manda UTF-8.

## Fuera de alcance

- Pasar el equipo del muerto al almacén de la banda («saquear el cuerpo»): hoy se pierde. Si se quiere, sería una acción aparte
  sobre `EquipoAlMorir`.
- Muerte de PNJ o de adversarios del encuentro (ya tienen su propio estado en la pantalla).
