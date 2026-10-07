# cosmere-api: domain map for the "rule set" feature (read-only)

Repo root: `C:\Users\xavie\Documents\Repositories\personal\cosmere-api`. Solution projects: API, Cross, Infrastructure (EF Core + Npgsql/PostgreSQL), Messages (entities and DTOs), Services. There is no test project. Migrations auto-apply at startup (`API/Program.cs:93-94` → `Infrastructure/Bootstrap.cs:22-28`).

**Working tree is dirty and still being edited by someone else (another session).**
- `git status` shows modified `Messages/Characters/Out/CharacterResponse.cs`, `Services/Characters/CharacterService.cs`, `Services/Characters/TalentosReglas.cs`, and untracked `Services/Characters/FormasCantor.cs`.
- This is WIP for "singer forms" (Cantor). It adds a `DesvioCalculado` StatDesglose, new `TipoFormula.PorHabilidad`, new `CondicionRegla.InfusoAbrasion`, a `Rango()` helper, a "Mente ambiciosa" rule, and form bonuses applied to attributes before deriving stats.
- At my last check it did not compile: `CharacterService.cs:379` passes `situacionalBase:` to `TalentosReglas.Calcular` (def at ~line 170), which has no such parameter yet.
- Line numbers below are for the current working tree. Where HEAD differs I say so.

---

## 1. Campaign

**Entity** `Messages/Database/Entities/CampaignEntity.cs:3-17`
- `long Id`, `required string Name`, `long GmUserId`, `required string InviteCode`, `bool InviteActive = true`, `DateTime CreatedAt`.
- Navs: `GmUser`, `Members`, `Characters`, `Sessions`, `Proposals`.
- There is no rule-set, system, or settings field.

**Membership and role** `CampaignMemberEntity.cs:3-12`
- Composite key (`CampaignId`, `UserId`), set at `CosmereContext.cs:33-34`.
- `required string Role // "gm" | "player"` (line 7), plus `JoinedAt`.

**DTOs**
- `Messages/Campaigns/In/CreateCampaignRequest.cs`:
  - `CreateCampaignRequest { required string Name }` (3-6).
  - `JoinCampaignRequest { InviteCode }` (8-11).
  - `UpdateInviteRequest { bool InviteActive }` (13-16).
- `Messages/Campaigns/Out/CampaignResponse.cs`:
  - `CampaignResponse { Id, Name, Role, CreatedAt, DateTime? NextSessionDate, string? NextSessionTitle }` (3-11).
  - `CampaignDetailResponse { Id, Name, Role, string? InviteCode, bool InviteActive, CreatedAt, List<MemberResponse> Members }` (13-22).
  - `MemberResponse { UserId, DisplayName, Role }` (24-29).
- There is no update-campaign DTO.

**Controller** `API/Controllers/CampaignsController.cs` (route `/campaigns`, `[Authorize]`)

| Line | Endpoint |
|---|---|
| 15-17 | `GET /campaigns` |
| 19-21 | `GET /campaigns/{id}` |
| 23-25 | `POST /campaigns` (create) |
| 27-32 | `DELETE /campaigns/{id}` |
| 34-36 | `POST /campaigns/join` |
| 38-43 | `PATCH /campaigns/{id}/invite` |
| 45-47 | `POST /campaigns/{id}/invite/regenerate` |

There is no PUT or PATCH to edit or rename a campaign. The rule set would be set only at creation unless you add one.

**Service** `Services/Campaigns/CampaignService.cs`
- `GetUserCampaignsAsync` (11-35) projects the list directly from `CampaignMembers`; Role comes from `m.Role` (line 22).
- `GetCampaignDetailAsync` (37-63).
- `CreateCampaignAsync` (65-86): creates the campaign with `GmUserId = userId`, then adds a member with `Role = "gm"` (line 81).
- `JoinCampaignAsync` (97-116): adds a member with `Role = "player"` (line 110); builds a `CampaignResponse` by hand (line 115).
- GM-only checks use `GmUserId` (lines 90 and 135).
- `GenerateInviteCode` (140-141).

**Where role is computed**
- Role is stored in `CampaignMembers.Role`, not in the JWT.
  - JWT claims are only `sub`, `username`, `displayName`, `jti` (`Cross/Security/JwtHelper.cs:16-22`).
  - `GetUserId` is at `JwtHelper.cs:35-40`.
- `CampaignResponse.Role` and `CampaignDetailResponse.Role` are read from the member row (`CampaignService.cs:22, 52`).
- `InviteCode` is exposed only if role is `"gm"` (line 53).
- Each service re-queries the member table with its own copy of `Role == "gm"`:
  - `CharacterService.cs:157-158`
  - `MetaService.cs:90`
  - `NoteService.cs:83`
  - `NpcNoteService.cs:66`
  - `ProposalService.cs:150`
  - `SessionService.cs:55`
  - `LockedDayService.cs:75`
- There is no shared "campaign context" or "load campaign + rule set" helper; every service does `EnsureMember`/`IsGm` itself. Any rule-set lookup would need a similar hook in each service.

**Existing-data note:** `20260526130330_AddDiaryEntries.cs` seeds diary rows with a hard-coded `CampaignId = 1L`, so existing campaigns need a default of "stormlight" on migration.

---

## 2. Character

**Entity** `Messages/Database/Entities/CharacterEntity.cs:3-97` (unchanged in WIP). `HabilidadPersonalizada2..6` repeat the pattern of `1` exactly.

```csharp
public long Id { get; set; }
public long CampaignId { get; set; }
public long? OwnerId { get; set; }
public bool IsNpc { get; set; } = false;
public bool IsVisibleToPlayers { get; set; } = true;
// Identity
public required string Name { get; set; }
public string PlayerName { get; set; } = string.Empty;
// Progression
public int Level { get; set; } = 1;
public int Experience { get; set; } = 0;
public string CaminoHeroico { get; set; } = string.Empty;
public string CaminoRadiante { get; set; } = string.Empty;
public string Ascendencia { get; set; } = string.Empty;
public int IdealesJurados { get; set; } = 0;
// Core Attributes (0-5)
public int Fuerza { get; set; } = 0;
public int Velocidad { get; set; } = 0;
public int Intelecto { get; set; } = 0;
public int Voluntad { get; set; } = 0;
public int Discernimiento { get; set; } = 0;
public int Presencia { get; set; } = 0;
// Resources
public int MaxHealth { get; set; } = 10;
public int MaxConcentration { get; set; } = 0;
public int MaxInvestiture { get; set; } = 0;
public int Desvio { get; set; } = 0;
public int MarcosInfusas { get; set; } = 0;
public int MarcosOpacas { get; set; } = 0;
// Skills (18 ints, all = 0)
Agilidad, ArmasLigeras, ArmasPesadas, Atletismo, Hurto, Sigilo, Deduccion, Disciplina,
Intimidacion, Manufactura, Medicina, Conocimiento, Engano, Liderazgo, Percepcion,
Perspicacia, Persuasion, Supervivencia          // each: public int X { get; set; } = 0;
public string HabilidadPersonalizada1 { get; set; } = string.Empty;
public int HabilidadPersonalizada1Valor { get; set; } = 0;
public string HabilidadPersonalizada1Atributo { get; set; } = string.Empty;
// ... same triplet for 2,3,4,5,6 (lines 58-75)
// Roleplay
public string Proposito { get; set; } = string.Empty;
public string Obstaculo { get; set; } = string.Empty;
public string Talentos { get; set; } = string.Empty;
public string Apariencia { get; set; } = string.Empty;
public string Notas { get; set; } = string.Empty;
public string Conexiones { get; set; } = string.Empty;
// Equipment (stored as text arrays)
public List<string> Weapons { get; set; } = [];
public List<string> Armor { get; set; } = [];
public List<string> Spells { get; set; } = [];
public List<string> Equipment { get; set; } = [];
public string EquippedArmor { get; set; } = string.Empty;
public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
public CampaignEntity Campaign { get; set; } = null!;
public List<MetaEntity> Metas { get; set; } = [];
```

Line numbers in the entity file:
- 5-9 ids and flags.
- 12-13 identity.
- 16-21 progression.
- 24-29 attributes.
- 32-37 resources.
- 40-57 skills.
- 58-75 custom skills.
- 78-83 roleplay.
- 86-90 equipment.
- 92-93 timestamps.
- 95-96 navs.

**DTOs** (`Messages/Characters/...`)
- `In/CharacterRequest.cs:3-12` `CreateCharacterRequest`, verbatim:
  ```csharp
  public required string Name { get; set; }
  public string PlayerName { get; set; } = string.Empty;
  public int Level { get; set; } = 1;
  public string Ascendencia { get; set; } = string.Empty;
  public string CaminoHeroico { get; set; } = string.Empty;
  public string CaminoRadiante { get; set; } = string.Empty;
  public long? OwnerId { get; set; }
  ```
- `In/CharacterRequest.cs:14-17` `AssignCharacterRequest { long? OwnerId }`.
- `In/CharacterRequest.cs:19-98` `UpdateCharacterRequest`:
  - Same property names and types as the entity's lines 12-90, with no defaults on ints.
  - Excludes `Id`, `CampaignId`, `OwnerId`, `IsNpc`, `IsVisibleToPlayers`, `CreatedAt`, `UpdatedAt` and the navs.
  - Includes all 6 attributes, `MaxHealth`/`MaxConcentration`/`MaxInvestiture`/`Desvio`/`MarcosInfusas`/`MarcosOpacas`, 18 skills, 6 custom-skill triplets, roleplay strings, and the 4 lists + `EquippedArmor`.
- `Out/CharacterResponse.cs:5-100` (HEAD) has the same fields as `UpdateCharacterRequest` plus:
  - `Id`, `CampaignId`, `OwnerId`, `CreatedAt`, `UpdatedAt`, `List<MetaResponse> Metas`.
  - `MaxConcentration` and `MaxInvestiture` marked `[Obsolete]` (lines 27-32).
  - Computed stat block (lines 35-42 in HEAD):
    ```csharp
    public StatDesglose Concentracion    { get; set; } = new();
    public StatDesglose DefensaFisica    { get; set; } = new();
    public StatDesglose DefensaCognitiva { get; set; } = new();
    public StatDesglose DefensaEspiritual { get; set; } = new();
    public StatDesglose Salud            { get; set; } = new();
    public StatDesglose Investidura      { get; set; } = new();
    public StatDesglose Movimiento       { get; set; } = new();
    ```
  - WIP adds `public StatDesglose DesvioCalculado { get; set; } = new();` at line 44.
- `Out/StatDesglose.cs`:
  - `StatLinea { string Concepto; double Valor; string? DescripcionCondicion }` (3-8).
  - `StatDesglose { double Total; string? Unidad; List<StatLinea> Lineas; List<StatLinea> Situacional }` (10-16).

**Keying and related entities**
- All are `long` identity PKs. Character → Campaign is cascade; Character → Owner (`UserEntity`) is optional and `SetNull` (`CosmereContext.cs:56-61, 130-136`).
- **Goals ("metas")**: `MetaEntity` (`Messages/Database/Entities/MetaEntity.cs:3-16`), FK `CharacterId` with cascade (`CosmereContext.cs:63-68`).
  - Fields: `Titulo`, `Descripcion`, `int Hitos` (0), `Estado` "activa"|"concluida", `string? TipoConclusion` "exito"|"crecimiento"|"fracaso", `NotasConclusion`, `CreatedAt`.
  - Validation is hard-coded in `Services/Metas/MetaService.cs:42-43` (Hitos 0..3) and `57-59` (conclusion types).
  - DTOs are in `Messages/Metas/In|Out`.
  - Controller is `API/Controllers/MetasController.cs`, route `campaigns/{cid}/characters/{chid}/metas` (GET, POST, PUT `{id}`, POST `{id}/conclude`, DELETE).
- **Talents**: no entity or table. `Characters.Talentos` is a text column holding a JSON array of talent-name strings (`ParseTalentos` at `CharacterService.cs:303-308`).
  - Radiant order and heroic path "talents" are the same list.
  - A singer's active form is smuggled into the same list as `"~forma~<Nombre>"` (`FormasCantor.cs:25`, WIP).
- **Inventory ("bolsa")**: no entity.
  - `Weapons`, `Armor`, `Spells`, `Equipment` are `text[]` of free-text names, not FKs to the catalog.
  - `EquippedArmor` is a name; `ApplyUpdate` blanks it unless it is in `Armor` (`CharacterService.cs:198`).
  - Spheres are two ints, `MarcosInfusas`/`MarcosOpacas`.
- **Custom skills**: six flattened column triplets (name, value, attribute-name string), not a child table.
- **Concentration and investiture**
  - Max values are computed in `MapToResponse` from attributes, talents and camino.
  - The `MaxConcentration`/`MaxInvestiture` columns are deprecated.
  - Current Health, Concentration, Investiture and Mana were dropped from the DB (`20260413132616_RemoveHealth`, `20260408133329_DropConcentrationInvestiture`, `AddMarcos...` also dropped Mana). No current-value tracking is persisted server-side.
- **Camino/path**: `CaminoHeroico` and `CaminoRadiante` are strings. `Ascendencia` is a string. `IdealesJurados` is an int, added in the latest migration.
- `IsNpc` and `IsVisibleToPlayers` exist but are effectively dead:
  - Every query filters `!IsNpc` (`CharacterService.cs:40, 57, 104, 129, 140`; `MetaService.cs:93`).
  - Creation hard-codes `IsNpc=false` (line 91).
  - Nothing reads `IsVisibleToPlayers`.

**Controller** `API/Controllers/CharactersController.cs`, route `campaigns/{cid}/characters`:
- GET list.
- GET `{id}?enCombate=` (builds a `ContextoJuego`, see `Services/Characters/ContextoJuego.cs`).
- POST (GM only).
- PUT `{id}`.
- DELETE (GM only).
- PUT `{id}/assign` (GM only).

**Authorization in `CharacterService`**
- Players see and edit only their own character (`CharacterService.cs:35-64, 99-123`).
- For non-GM updates, `Name`, `CaminoHeroico` and `CaminoRadiante` are overwritten with the stored values (lines 111-116).

**Where the engine lives** (all computed server-side in `MapToResponse`, `CharacterService.cs:310` onward)
- Defenses are `10 + attr1 + attr2` for physical (FUE+VEL), cognitive (INT+VOL), spiritual (DIS+PRE).
- Health is a level table (`BuildSaludLineas`, 261+).
- Focus is `2 + VOL`.
- Investiture is `0` if no `CaminoRadiante`, otherwise `2 + max(DIS,PRE)` (`BuildInvLineas`, 237+).
- Movement comes from `TalentosReglas.MovimientoBase(vel)` (`TalentosReglas.cs:263`).
- Rank is `ceil(level/5)` (`Rango()` in WIP).

---

## 3. Stormlight-specific backend content

**Hard-coded validation** `Services/Characters/CharacterService.cs:12-33`
- `ValidCaminosHeroicos`: agente, cazador, enviado, erudito, guerrero, lider.
- `ValidCaminosRadiantes`: windrunners, skybreakers, dustbringers, edgedancers, truthwatchers, lightweavers, elsecallers, willshapers, stonewards, bondsmiths.
- `ValidAscendencias`: "Humano", "Oyente".
- `ValidateCaminos` is called on create (line 79) and update (line 118).
- Inconsistency: `FormasCantor.AscendenciasCantor` (WIP) also accepts "Cantor"/"Cantora", and the seeded NPCs use "Cantor", "Humano Alezi", "Fusionada (Cantor)", etc.

**Talent rule engine** `Services/Characters/TalentosReglas.cs` (static C#)
- Enums `StatAfectada`, `TipoFormula`, `CondicionRegla`; class `ReglaTalento`.
- `Reglas` dictionary (line 56) is keyed by Spanish talent name. Entries: Compostura, Robusto, Serenidad, Paso firme, Vestimenta tradicional, Presciencia (empty), Mente ambiciosa (WIP), Investido, Movimiento sin fricción, Posición de la enredadera, Posición de la sangre, Parada de tensión, Réplica fulminante.
- `Calcular` (170+) and `EsActiva` (213+) hold the logic.
- WIP `GradosDe` maps Spanish skill names to character properties.

**Singer forms** `Services/Characters/FormasCantor.cs` (untracked WIP)
- `BonosForma` record (line 7).
- `Bonos` dictionary (line 30) with 14 forms: Forma gris, carnal, artística, diestra, de guerra, de trabajo, de mediación, sabia, funesta, tormenta, emisaria, comunicadora, pútrida, nocturna.
- The comment says it mirrors `cosmere-web/src/data/cantores.ts`.
- At HEAD nothing else used it; the WIP `MapToResponse` now does.

**Catalog (`/catalog`)**: it is DB data, seeded only by a migration, and global.
- Controller `API/Controllers/CatalogController.cs:14-85`:
  - GET `weapons`, `armor`, `gear`, `options/{category}`.
  - POST `weapons`, `armor`.
  - DELETE `weapons/{id}`, `armor/{id}` (only if `IsCustom`).
  - PUT `{weapons|armor|gear}/{id}/description`.
  - `[Authorize]` only: no campaign scope and no GM check.
- Service `Services/Catalog/CatalogService.cs`.
- Entities `Messages/Database/Entities/WeaponCatalogEntity.cs`:
  - `WeaponCatalogEntity` (3-18): `Name, WeaponTypeId, SkillId, DamageDiceCount, DamageDiceValue, DamageTypeId, RangeId, List<int> TraitIds, List<int> ExpertTraitIds, IsCustom, Description, Weight`.
  - `ArmorCatalogEntity` (20-31): `Name, ArmorTypeId, Desvio, TraitIds, ExpertTraitIds, IsCustom, Description, Weight`.
  - `GearItemEntity` (33-40): `Name, Weight, Price, Description`.
  - `CatalogOptionEntity` (42-48): `int Id, Category, Name, Description`.
- Seed: `Infrastructure/Migrations/20260410143041_SeedCatalogData.cs`, raw SQL with hard-coded IDs.
  - `CatalogOptions` (line 21):
    - weapon_type 1-3.
    - skill 10-27, the 18 Stormlight skills (note "Saber" in the catalog vs `Conocimiento` on the character).
    - damage_type 30-32 (Laceración, Golpe, Espiritual).
    - range 40-46.
    - weapon_trait 50-64.
    - armor_type 70-77.
    - armor_trait 80-85.
  - `WeaponCatalog` (line 86): 25 weapons. Includes Hoja esquirlada, Hoja esquirlada (Radiante), Gran arco, Semiesquirla.
  - `ArmorCatalog` (line 116): 8 armors, from Uniforme to Armadura esquirlada (Radiante).
  - `GearItems` (line 129): 68 items, with price in marks ("mc") per the descriptions.
- `Infrastructure/Data/SeedData.cs` only seeds 7 hard-coded users (soul, albert, guizmo, kaligula, hanol, raito, rocapequena). It never calls `SaveChanges`, so it is effectively a no-op.

**No other Stormlight content in C#.** I searched the C# code for surges/potencias, radiant orders (beyond the camino list) and ideals, and found nothing else. The grep for Mistborn/Nacidos/Bruma/Allomancy found none: no Mistborn material anywhere in the repo, only Stormlight.

---

## 4. NPCs and adversaries

- **Global NPC catalog** `Messages/Database/Entities/GlobalNpcEntity.cs:3-55`.
  - It is not campaign-scoped (no `CampaignId`).
  - Columns: `Name`, `Source` (free string, "Caminapiedras"), `Tipo` (e.g. "Secuaz Rango 1"), `Ascendencia`, `Level`, 6 attributes, `MaxHealth`/`MaxConcentration`/`MaxInvestiture`, 18 skills, `Talentos` (plain text of traits), `Apariencia`, `Notas` (free-text actions and tactics), `string? ImageUrl`, timestamps.
  - No defenses, movement or custom skills are stored; those live inside the `Notas` text.
  - Skill columns store the base rank (total minus attribute), per the comment at `20260408073708_SeedAllNpcs.cs:27-33`.
  - Request and response DTOs: `Messages/GlobalNpcs/In/GlobalNpcRequest.cs`, `Out/GlobalNpcResponse.cs`.
  - Controller `API/Controllers/GlobalNpcsController.cs` (route `/global-npcs`, GET, GET `{id}`, POST, PUT, DELETE) is `[Authorize]` only. Any user can edit or delete.
  - Service `Services/GlobalNpcs/GlobalNpcService.cs`.
- **Seed data**: 34 NPCs, all `Source = "Caminapiedras"`.
  - `20260407222403_SeedAnguilaAerea.cs`: Anguila Aérea.
  - `20260408073708_SeedAllNpcs.cs` (lines 35-421): 33 more. Examples: Anguila Aérea Mayor, Arquero, Axies, Bandido, Bersérker de la Emoción, Cantor en forma de guerra/diestra, Caparácaro, Chull, Espinablanca joven, Experto, Fanático (+ en forma sombría), Guardia, Kaiana, Khornak, Ladrón, Lancero, Maestro lancero, Lilinum, Agente/Vigía de los Ojos de Pala, Plebeyo, Portador de esquirlada duelista, Portador del Polvo del Segundo Ideal, Profundo, Regio en forma funesta/tormenta, Rompedor del Cielo del Segundo Ideal, Sabueso-hacha, Taszo, Veth, Ylt.
  - Image URLs are relative paths like `/api/gnpc-images/1.png` or `/npc-images/anguila-aerea.png`. `Program.cs` has no `UseStaticFiles`, so `API/wwwroot/{gnpc-images,npc-images}` is not served by this API as configured.
- **Per-campaign NPC notes** (a different concept): `NpcNoteEntity` (`NpcNoteEntity.cs`) has `CampaignId`, `AuthorId`, `NpcName`, `Notes`, `IsShared`, timestamps. Controller `NpcNotesController.cs` (`campaigns/{cid}/npc-notes`) with `NpcNoteService`. Free text, rule-agnostic.
- `CharacterEntity.IsNpc` is never set true (see §2).

---

## 5. Dice rolls

`Messages/Database/Entities/DiceRollEntity.cs:3-25`:
```csharp
long Id; long CampaignId; long UserId; string UserDisplayName;
string RollType   // "skill | damage | recovery | contested | free" (comment only, not validated)
string RollData = "{}"   // full JSON of the frontend's AnyRollResult, stored opaque
string RollLabel         // short summary generated by the frontend
string? CharacterName    // null = rolling as the user
DateTime CreatedAt; CampaignEntity Campaign
```
- There are no skill, attribute, modifier or plate columns. The server stores the frontend JSON blob as-is and does no dice logic.
- Index `(CampaignId, CreatedAt)` at `CosmereContext.cs:211-212`.
- DTOs: `Messages/DiceRolls/In/CreateDiceRollRequest.cs`, `Out/DiceRollResponse.cs`. Service `Services/DiceRolls/DiceRollService.cs` (limit clamped to 1-100).
- Controller `API/Controllers/DiceRollsController.cs`, route `campaigns/{cid}/dice-rolls`.
  - GET lists the most recent rolls.
  - POST saves the roll, then broadcasts `"DiceRollReceived"` via SignalR to group `campaign-{id}` (lines 37-39). Hub is `API/Hubs/CampaignHub.cs`.
- Backend is rule-agnostic for dice: the rule set only affects the frontend JSON.

---

## 6. Rule-agnostic areas (confirmed)

- **Sessions**: `SessionEntity` (title, date, location, notes). Campaign-scoped; GM creates and deletes. Rule-agnostic.
- **Session proposals, votes, locked days**: `SessionProposalEntity`, `ProposalDateEntity`, `ProposalVoteEntity`, `LockedDayEntity`. Pure scheduling. Rule-agnostic.
- **Diary**: `DiaryEntryEntity` (number, slug, body, participants, `MentionsJson`). Read-only API (GET list and GET by id). Rule-agnostic structure, but campaign 1's content is seeded in a migration and is Stormlight narrative.
- **Notes (GM → player messages)**: `NoteEntity` (`FromUserId`, `ToUserId`, `Content`, `IsRead`). GM creates, recipient marks read. Rule-agnostic.
- **Auth/users**: `UserEntity`, `AuthService`, JWT. Rule-agnostic.

---

## 7. Migrations and DbContext

DbContext: `Infrastructure/Data/CosmereContext.cs` (214 lines; DbSets at 8-26, `OnModelCreating` 28-213).

Snapshot: `Infrastructure/Migrations/CosmereContextModelSnapshot.cs`.

Migrations (names only, in order; each has a `.Designer.cs`):
1. 20260327145705_InitialCreate
2. 20260328153930_ReplaceEmailWithUsername
3. 20260328164827_AddCharacterOwner
4. 20260330150003_AddCharacterAttributes
5. 20260330152120_AddSessions
6. 20260331073807_AddMarcosToCharacter
7. 20260405150338_AddNotes
8. 20260407172642_AddNpcImageUrl
9. 20260407221753_RemoveMatchesAddGlobalNpcs
10. 20260407222403_SeedAnguilaAerea
11. 20260407223351_DropNpcImageUrlFixAnguilaUrl
12. 20260408073708_SeedAllNpcs
13. 20260408090217_DropSideQuests
14. 20260408111031_ReplaceNpcsWithNpcNotes
15. 20260408113458_AddEquippedArmor
16. 20260408133329_DropConcentrationInvestiture
17. 20260410071358_AddHabilidadPersonalizada456
18. 20260410143041_SeedCatalogData
19. 20260411081650_AddIsCustomToCatalog
20. 20260413071220_AddSessionProposals
21. 20260413131645_AddMetas
22. 20260413132616_RemoveHealth
23. 20260414075605_AddLockedDays
24. 20260414104044_AddDescriptionToCatalog
25. 20260414125705_AddWeightToCatalog
26. 20260526130330_AddDiaryEntries
27. 20260526143352_AddDiceRolls
28. 20260526152156_AddCharacterNameToDiceRolls
29. 20260929110638_AddIdealesJurados

---

## 8. Resources folder (names only)

- `Resources/CaminaPiedras/` (not in git; listed in `.gitignore`):
  - PDFs:
    - `ART0001_MdAdlT_ESP_high.pdf` (player manual, ~310 MB)
    - `ARTO002_GdM_AdlT_ESP_.pdf` (GM guide)
    - `ARTO007_Caminapiedras aventura_high.pdf`
    - `ARTO007_Caminapiedras_cover_ESP_high.pdf`
    - `ARTO008_Puente Nueve_ESP_high.pdf`
    - `ARTO008_Puente Nueve_cover_ESP_high.pdf`
    - `Archivo_de_las_Tormentas_Hoja_de_personaje.pdf`
  - Text extracts: `ch4_raw.txt`, `ch7_objetos_raw.txt`, `ch7_raw.txt` (3 bytes, empty), `chapter3.txt`, `manual_toc.txt`.
- `Resources/Parts/` (tracked, including `node_modules`):
  - Text: `cap5_raw.txt`, `ch8_extract.txt`, `heroic_paths_manual.txt`, `heroic_paths_raw.txt`, `lider_extra.txt`, `toc_raw.txt`.
  - Manual page-range extracts: `parsed_ART0001_MdAdlT_ESP_high_p123-208.txt`, `_p209-239.txt`, `_p287-300.txt`, `_p301-313.txt`.
  - Node files: `package.json`, `package-lock.json`.
  - Folders: `lider_pages/` (empty), `pdf_extractor/` (C# PdfPig tool), `pdf_image_extractor/` (C# tool).
- Other (not requested):
  - `Resources/pdfextract/` (gitignored): `caminapiedras.txt`, `ch10_combat.txt`, `ch3_chars.txt`, `ch4_full.txt`, `ch4_part1.txt`, `ch4_part2.txt`, `gm_1_70.txt`, `gm_71_140.txt`, `gm_141_210.txt`, `gm_211_280.txt`, `puente_nueve.txt`, `toc.txt`, `extract.mjs`, `extract_all.mjs`.
  - `Resources/parsed/` (gitignored): `README.md`, `player_manual_ch4_heroic_paths.md`, `player_manual_ch10_combat.md`.
  - `Resources/blason/`: 10 `.webp` radiant-order placards (01_windrunner … 10_bondsmith).
  - `Resources/npc_imgs/`: `map_p146.png`, `map_p155.png`, `map_p159.png`, `map_p167.png`.
  - Loose files: `Resources/npc_pages.txt`, `p159.txt`, `extract_ch3.mjs`, `obsidian/import_sessions.mjs`.
- `Resources/` is not referenced by any csproj and is not used at runtime. It is only research and extraction material for Stormlight. There is no Mistborn material.

---

## Coupling points to touch for a rule-set feature (summary)

1. **Campaign model**: add the rule-set field to `CampaignEntity` and `CreateCampaignRequest`, then expose it in `CampaignResponse` and `CampaignDetailResponse`. Set it in `CampaignService.CreateCampaignAsync` (65-86); also in the `GetUserCampaignsAsync` projection (11-35) and the hand-built `JoinCampaignAsync` response (115). Default existing rows to stormlight. There is no update endpoint.
2. **Character model**: `CharacterEntity`, the Create/Update/Response DTOs and `MapToResponse` are all Stormlight-shaped, with hard-coded columns and computed formulas:
   - Attributes: 6 fixed.
   - Skills: 18 fixed columns plus 6 custom-skill triplets.
   - Stormlight columns: `CaminoHeroico`/`CaminoRadiante`/`Ascendencia`, `IdealesJurados`, `Marcos*`, `Desvio`.
   - Talents: JSON string.
   - `Metas`: with 3 hitos.
   - No generic key/value stat storage exists.
3. **Validation and lists**: the hard-coded sets at `CharacterService.cs:12-33`.
4. **Engine**: `TalentosReglas.cs` plus the `MapToResponse` formulas (defenses, health table, movement table, investiture) and the WIP `FormasCantor`.
5. **Catalog and NPCs**: `Weapon/Armor/Gear/CatalogOption` tables and `GlobalNpcs` have no rule-set or source scoping. `GlobalNpcEntity.Source` is a free string that could serve as a discriminator.
6. **Meta rules**: `MetaService` has hard-coded Stormlight goal rules (hitos 0-3, conclusion types).
7. **Authorization duplication**: the `IsGm` check is repeated in 7 services (see §1).
