# Calendario: ver las otras campañas para no solapar sesiones

> Propuesta del 19 oct 2026. Pendiente de aprobación (§6). Sin migraciones.

## 1. Objetivo

Como director, al planificar en el Calendario de una campaña necesito ver **todos mis días ocupados**: las sesiones y las franjas
propuestas de esta campaña (que gestiono como hasta ahora) **y** las de mis otras campañas, que solo se muestran, en modo lectura.
Así no programo dos sesiones el mismo día.

## 2. Estado actual

- `src/pages/sessions/SessionsPage.tsx` (pestaña «Calendario» de `HistoriaPage`) carga solo la campaña actual:
  `['sessions', cId]`, `['proposals', cId]`, `['locked-days', cId]`.
- Marcas de la cuadrícula: sesión = barra 8×4 (`c.brand`, o `--cuarzo` si ya pasó); franja propuesta = anillo hueco
  (`proposalMark`); días bloqueados = puntos de color por jugador (solo director) o candado (jugador).
- API: `GET /campaigns/{id}/sessions` y `GET /campaigns/{id}/proposals` exigen ser miembro de **esa** campaña. No hay forma de
  pedir las de varias campañas en una llamada.
- Las sesiones solo se crean y borran (no hay edición): para mover una sesión hay que borrarla y crearla de nuevo.
- Las campañas del usuario salen de `GET /campaigns` (`CampaignResponse`: `Id`, `Name`, `Role`, `World`, `Era`…).

## 3. Diseño

### 3.1 API: `GET /calendar/others?campaignId={id}`

Una sola llamada que devuelve lo que el usuario tiene en **sus otras campañas** (todas aquellas de las que es miembro, como
director o jugador, excepto `campaignId`):

- Sesiones (todas: son pocas y así se ven también los meses pasados).
- Franjas `Pending` de propuestas `Pending` cuya fecha no haya pasado (`ProposedDate >= UtcNow.Date`).
- Sin notas ni votos: solo lo necesario para pintar y avisar.

Seguridad: exige ser miembro de `campaignId` (si no, 404 como el resto). Solo devuelve datos de campañas en las que el usuario
ya es miembro, así que no expone nada que no pueda ver ya.

```csharp
// Messages/Calendar/Out/OtherCampaignEventResponse.cs
namespace Messages.Calendar.Out;

public class OtherCampaignEventResponse
{
    public long CampaignId { get; set; }
    public required string CampaignName { get; set; }
    public string World { get; set; } = WorldIds.Stormlight;
    /// <summary>Role of the user in that campaign: gm | player</summary>
    public required string Role { get; set; }
    /// <summary>session | proposal</summary>
    public required string Kind { get; set; }
    /// <summary>Session id, or proposal date id for a proposed slot</summary>
    public long Id { get; set; }
    /// <summary>Session title, or proposal title</summary>
    public required string Title { get; set; }
    public DateTime Date { get; set; }
    /// <summary>morning | afternoon | null (free time); always null for sessions</summary>
    public string? Slot { get; set; }
    public string Location { get; set; } = string.Empty;
}
```

Servicio `Services/Calendar/ICalendarService.cs` + `CalendarService.cs` (`GetOtherCampaignsAsync(long campaignId, long userId)`),
registrado donde se registran los demás servicios; controlador `API/Controllers/CalendarController.cs` con
`[Route("calendar")]`, `[Authorize]`, `[HttpGet("others")]`. Orden: por `Date`.

### 3.2 Web: capa «Otras campañas» en el calendario

- Tipo `OtherCampaignEvent` en `src/types/index.ts` (espejo del DTO, `kind: 'session' | 'proposal'`, `slot: ProposalSlot | null`).
- `src/api/calendar.ts`: `calendarApi.getOthers(campaignId)`.
- En `SessionsPage`: `useQuery({ queryKey: ['calendar-others', cId], queryFn: () => calendarApi.getOthers(cId), enabled: isGm })`
  (ver P1) y un `Map<dateKey, OtherCampaignEvent[]>` con `toDateKey(new Date(e.date))` (día local, como las propuestas).
- **Marca en la cuadrícula** (forma distinta, el color nunca es la única pista): rombo de 6×6 (cuadrado girado 45°) en
  `var(--cuarzo)`: **relleno** para una sesión de otra campaña y **hueco** para una franja propuesta de otra campaña. Va en la
  misma fila que las marcas propias, detrás de ellas. Si en total hay más de 4 marcas, se muestran las propias primero y «+N».
  La altura de la celda no cambia.
- **aria-label del día**: añade «1 sesión en otra campaña» / «N sesiones en otras campañas» y «N franjas propuestas en otras
  campañas».
- **Leyenda** (bajo la cuadrícula, solo si el mes tiene alguna): «◆ Sesión en otra campaña» y «◇ Propuesta en otra campaña».
- **Día seleccionado**: tras las sesiones y propuestas propias, una sección «En otras campañas» con una tarjeta por elemento,
  **sin acciones** (ni borrar, ni votar, ni promover):
  - eyebrow: nombre de la campaña · `getWorld(e.world).nombreCorto`;
  - título; insignia «SESIÓN» o «PROPUESTA»; hora (`HH:mm`) o franja (`slotLabel`: «Mañana · 10:00»); lugar si lo hay;
  - enlace «Abrir campaña» → `/campaigns/{campaignId}/historia` (abre en la pestaña Calendario, que es la inicial).
- Las listas inferiores («Propuestas abiertas», «Próximas sesiones», «Últimas sesiones») siguen siendo solo de esta campaña.
- Invalidación: toda mutación que cambie sesiones o propuestas (crear, borrar, editar sesión; crear, cerrar, promover,
  descartar propuesta) invalida también el prefijo `['calendar-others']`, para que las demás campañas lo vean al volver.

### 3.3 Avisos de solape (no bloquean)

Helper `dayConflicts(dateKey)` en `SessionsPage`: devuelve lo que ya hay ese día **en otras campañas** y las **sesiones de esta
campaña** (las propuestas propias no, para no avisar de la misma propuesta). Texto en tono aviso (`tone.heliodoro`, icono
`AlertTriangle`), uno por elemento:

> Ese día ya tienes «Título» en «Campaña» (18:00).
> Ese día ya tienes la propuesta «Título» en «Campaña» (Tarde · 15:00).

Se muestra en:
1. Hoja «Nueva sesión» (y «Editar sesión», P2): bajo los campos Fecha/Hora, al cambiar la fecha.
2. `CreateProposalSheet` (`ProposalsPage.tsx`): bajo cada día propuesto. Nueva prop opcional
   `dayNote?: (dateKey: string) => ReactNode`; sin ella el componente no cambia.
3. `PromoteDialog`: nueva prop opcional `warning?: ReactNode`, encima de los campos.

Solape = **mismo día local** (no se compara la hora: dos sesiones el mismo día ya es lo que se quiere evitar).

### 3.4 Gestión de las sesiones de esta campaña: editar (P2)

Hoy solo se pueden crear y borrar. Para recolocar una sesión sin perderla:

- API: `PUT /campaigns/{campaignId}/sessions/{sessionId}` con `UpdateSessionRequest` (mismos campos que
  `CreateSessionRequest`: `Title`, `Date`, `Location`, `Notes`), solo director, 404 si no es de la campaña. Devuelve
  `SessionResponse`. Sin cambios de esquema.
- Web: `sessionsApi.update`, botón lápiz «Editar sesión {título}» en `SessionCard` (solo director) que abre la misma hoja con
  los datos cargados; título «Editar sesión», botón «Guardar cambios». La papelera sigue pidiendo confirmación.

### 3.5 Votaciones: el director no vota y se ve cuánto falta por contestar

Hoy el director ve los botones «Puedo» / «No puedo» en cada franja, y la API acepta su voto y lo suma a los recuentos. Además,
el contador solo dice «2 sí · 1 no»: no se sabe cuántos jugadores faltan por contestar.

**API** (`Services/Proposals/ProposalService.cs`, `Messages/Proposals/Out/ProposalDateResponse.cs`, sin cambios de esquema):
- `CastVoteAsync`: si quien vota es el director → `UnauthorizedAccessException("The GM does not vote on proposals.")` (403 por
  `ExceptionMiddleware`).
- Los recuentos solo cuentan votos de **jugadores** (los votos antiguos del director, si existen, se ignoran sin borrarlos).
  `MapToResponse` recibe `IReadOnlyCollection<long> playerIds` (miembros con `Role == "player"`, cargados con un helper
  `LoadPlayerIdsAsync(campaignId)` en cada método que devuelve una propuesta).
- Campos nuevos en `ProposalDateResponse`:
  ```csharp
  /// <summary>Players of the campaign right now (the votes expected for this slot)</summary>
  public int PlayerCount { get; set; }
  /// <summary>Players who have not voted this slot yet</summary>
  public List<long> PendingUserIds { get; set; } = [];
  ```
  `CanCount`/`CannotCount` pasan a contar solo jugadores. Respondidos = `CanCount + CannotCount`;
  faltan = `PendingUserIds.Count`.

**Web** (`src/types/index.ts`: `playerCount: number`, `pendingUserIds: number[]` en `ProposalDateResponse`;
`src/pages/sessions/ProposalsPage.tsx`):
- `VoteBar` recibe `canVote: boolean` (`!isGm` desde `ProposalDates`): el director **no ve** «Puedo» / «No puedo»; sigue viendo
  la barra, «Promover» y «Descartar».
- Contador de cada franja abierta: «3 de 5 han respondido · faltan 2» (con todos: «5 de 5 han respondido»). En franjas ya
  resueltas o pasadas se mantiene «2 sí · 1 no». Visible para todos.
- Barra de votos: la parte sin contestar se ve como pista gris (`c.track`), es decir, la anchura se calcula sobre `playerCount`
  en lugar de sobre los votos emitidos.
- Solo el director, bajo el contador: «Faltan: Raito y Soul» (nombres de `currentCampaign.members` con `namesList`).
- Cabecera de la tarjeta de propuesta (`ProposalCalendarCard` y `ProposalCard`), solo director y propuesta abierta:
  insignia «FALTAN N» con el número de jugadores que tienen alguna franja abierta sin contestar; si no falta nadie,
  «TODOS HAN RESPONDIDO».
- Si una campaña no tiene jugadores (`playerCount === 0`): «Aún no hay jugadores» en lugar del contador.

## 4. Tareas

Rama `feature/calendario-otras-campanas` en worktrees `cosmere-web-calendario` y `cosmere-api-calendario` (el árbol principal de
web tiene trabajo sin confirmar de la enciclopedia).

| Id | Tarea | Ficheros | Criterio de aceptación |
|----|-------|----------|------------------------|
| A1 | Endpoint `GET /calendar/others` | `Messages/Calendar/Out/OtherCampaignEventResponse.cs`, `Services/Calendar/*`, `API/Controllers/CalendarController.cs`, registro DI | Devuelve sesiones y franjas pendientes futuras de las demás campañas del usuario; excluye `campaignId`; 404 si no es miembro; `dotnet build` sin errores |
| A2 | `PUT` de sesión (P2) | `SessionsController.cs`, `ISessionService.cs`, `SessionService.cs`, `Messages/Sessions/In/SessionRequest.cs` | Solo director; actualiza y devuelve la sesión; 404 si no es de la campaña |
| W1 | Tipos y cliente | `src/types/index.ts`, `src/api/calendar.ts`, `src/api/sessions.ts` (A2) | `npx tsc -b` limpio |
| W2 | Capa en la cuadrícula, leyenda y aria-label | `src/pages/sessions/SessionsPage.tsx` | Rombos relleno/hueco visibles en móvil (375 px) sin crecer la celda; «+N» si no caben; leyenda solo si el mes tiene alguno |
| W3 | Sección «En otras campañas» del día | `SessionsPage.tsx` | Tarjetas sin botones de acción; «Abrir campaña» navega y cambia de mundo/tema |
| W4 | Avisos de solape | `SessionsPage.tsx`, `ProposalsPage.tsx` (`CreateProposalSheet.dayNote`, `PromoteDialog.warning`) | Aviso al elegir un día ocupado en las tres hojas; no impide guardar |
| W5 | Editar sesión (P2) | `SessionsPage.tsx` | Lápiz en `SessionCard` (director); la hoja carga los datos y guarda con `PUT`; invalida `['sessions', cId]` y `['calendar-others']` |
| A3 | Director sin voto y recuentos de jugadores | `ProposalService.cs`, `ProposalDateResponse.cs` | Voto del director → 403; recuentos solo de jugadores; `PlayerCount` y `PendingUserIds` correctos tras votar |
| W6 | Ocultar «Puedo»/«No puedo» al director | `ProposalsPage.tsx` (`VoteBar`, `ProposalDates`) | El director no ve los botones en el Calendario ni en ninguna tarjeta de propuesta; el jugador los sigue viendo |
| W7 | Contador de respondidos y pendientes | `src/types/index.ts`, `ProposalsPage.tsx`, `SessionsPage.tsx` (`ProposalCalendarCard`) | «N de M han respondido · faltan K» en cada franja abierta; «Faltan: …» e insignia «FALTAN N» solo para el director |
| V | Verificación | — | Ver §5 |

## 5. Verificación

- `dotnet build` en `cosmere-api` (sin migraciones: comprobar que `dotnet ef migrations has-pending-model-changes` no informa nada).
- En `cosmere-web`: `npx tsc -b`, `npm run lint`, y `grep -rnE "===\s*'(mistborn|stormlight)'" src` vacío.
- Prueba en local con «Bruma TEST» (id 42) y una segunda campaña de prueba donde el mismo usuario sea director, con una sesión y
  una propuesta en el mismo mes:
  - director en Bruma TEST: ve los rombos, la leyenda, la sección «En otras campañas» y los avisos;
  - jugador en Bruma TEST: no ve nada nuevo (P1);
  - crear/borrar una sesión en una campaña y volver a la otra: aparece/desaparece el rombo;
  - director: no ve «Puedo»/«No puedo»; ve «N de M han respondido · faltan K», «Faltan: …» y la insignia «FALTAN N»;
  - jugador: vota, el contador baja «faltan» en uno y el director lo ve al refrescar;
  - `PUT …/vote` con el token del director → 403.
- Stormlight: el calendario de una campaña Stormlight sin otras campañas se ve igual que antes (captura antes/después).

## 6. Decisiones de Xavi (19 oct 2026)

- **P1. ¿Quién ve las otras campañas?** **Solo el director** de la campaña actual.
- **P2. ¿«Editar sesión»?** Las sesiones de otras campañas **nunca** se editan (solo lectura). Pendiente de confirmar: el lápiz
  para editar las sesiones **de esta campaña** (A2 + W5). Si la respuesta es no, A2 y W5 salen del alcance.
- **P3. ¿Qué otras campañas cuentan?** **Todas en las que eres miembro**, también donde juegas como jugador.
- **P4. ¿Avisos de solape?** **Sí, informativos** (no bloquean).
- **P5 (nueva).** El director no vota: se le ocultan «Puedo» / «No puedo» (§3.5).
- **P6 (nueva).** Recuento de respondidos y pendientes en cada franja (§3.5). Los nombres de quién falta, solo para el director.

## 7. Fuera de alcance

- Días bloqueados de los jugadores en otras campañas (cada campaña tiene los suyos).
- Exportar a Google Calendar / iCal.
- Vista semanal o de agenda.
