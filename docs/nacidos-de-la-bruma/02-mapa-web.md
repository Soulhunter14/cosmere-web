# Rule-set map of cosmere-web (read-only exploration)

Paths are relative to ROOT = C:\Users\xavie\Documents\Repositories\personal\cosmere-web. The sibling API is at C:\Users\xavie\Documents\Repositories\personal\cosmere-api. Line numbers are from the current working tree.

**Headline:** nothing in the web app or the API knows about a "rule set" today. Stormlight is hard-wired in the data, the character sheet, the talent engine, the icons, the copy and the brand colour. The truly rule-agnostic parts are the app shell, the `ui.tsx` primitives, sessions/calendar/diary/notes/NPC-notes, auth and invites.

---

## 1. Campaign creation/edit flow

**Creation**
- `src/pages/campaigns/CampaignListPage.tsx` is the only place a campaign is created.
- `InlineForm` (L16-91) is a single text input plus a Crear button, shown when `mode === 'create'` (L122, L222-235).
- The only form field is `newName` (L120).
- `createMutation` (L131-138) calls `campaignsApi.create(newName)`. On success it calls `setCurrentCampaign(campaign)` and navigates to `/campaigns/:id/home`.
- Joining is `joinMutation` (L140-147), by invite code.
- Opening a campaign is `openCampaign` (L154-163): `getById`, then `setCurrentCampaign`.
- Cards (L343+) use `role` directly (`isGm = role === 'gm'`, L367). Only GMs get the delete button (L317).

**There is no edit flow.** There is no rename or update-campaign call. `src/pages/campaigns/CampaignSettingsPage.tsx` only has the invite code and toggle (L61-138), account and `ThemeSwitcher` (L141-163), a member list (L166-200), and logout. A rule set chosen at creation and immutable fits the current code.

**API** (`src/api/campaigns.ts`, L4-23):
- `getAll`: GET /campaigns
- `getById`: GET /campaigns/{id}
- `create(name)`: POST /campaigns `{name}`
- `delete`
- `join`
- `updateInvite` (PATCH /invite)
- `regenerateCode`

**Backend contract (checked):**
- `cosmere-api/Messages/Campaigns/In/CreateCampaignRequest.cs` has only `Name`.
- `cosmere-api/Messages/Campaigns/Out/CampaignResponse.cs` (`CampaignResponse`, `CampaignDetailResponse`) has Id, Name, Role, InviteCode, InviteActive, CreatedAt, Members, NextSession*.
- A grep for ruleset/Mistborn/Nacidos across the API `.cs` files found nothing.

**Types** (`src/types/index.ts`):
```ts
Campaign { id:number; name:string; role:'gm'|'player'; createdAt:string; nextSessionDate?:string; nextSessionTitle?:string }   // L14-21
CampaignDetail extends Campaign { inviteCode?:string; inviteActive:boolean; members:Member[] }                                  // L23-27
Member { userId:number; displayName:string; role:'gm'|'player' }                                                               // L29-33
```

**Store** (`src/store/campaignStore.ts`, 21 lines):
- Shape: `{ currentCampaign: CampaignDetail|null; setCurrentCampaign(c); isGm:boolean }`.
- It is persisted in localStorage under `cosmere-campaign` (partialize: `currentCampaign` and `isGm`).
- **`isGm` is derived at L17:** `set({ currentCampaign: campaign, isGm: campaign?.role === 'gm' })`. It is not computed on read.
- Old persisted `currentCampaign` objects will lack any new `ruleSet` field, so a default of stormlight is needed.

**Hydration** (`src/components/AppLayout.tsx`, L13-17):
- It runs `campaignsApi.getById(id).then(setCurrentCampaign)` whenever `:campaignId` changes.
- Nothing is gated on it and the store is not cleared. For a moment the previous campaign's persisted `currentCampaign` is still in the store, so rule-set-aware UI could flash the wrong rule set.

**`isGm` consumers:** 23 files. Examples are Sidebar, DiceRoller, PersonajesPage, CharacterDetailPage and CharacterListPage. `useCampaignStore` is already the natural place to expose `ruleSet`.

---

## 2. Character sheet and character-related pages

**Page components**

| File | Lines | What it renders |
|---|---|---|
| `src/pages/personajes/PersonajesPage.tsx` | 292 | GM view: tabs Personajes / Metas / Talentos / Bolsa (L28-82). Player view: hero card plus 4 action cards (Mi ficha, Metas, Talentos, Bolsa) (L141-283). Hero pills for heroic path and radiant order (L250-261). Bolsa tile uses the `esfera-broam-esmeralda` sphere (L173, L208). |
| `src/pages/characters/CharacterListPage.tsx` | 426 | List cards with path and order pills (L133-148) and "Nv · ascendencia" (L155). Create sheet: name plus optional player (L320-382). `createMutation` sends `ascendencia:'', caminoHeroico:'', caminoRadiante:''` (L254-258), which are Stormlight fields. |
| `src/pages/characters/CharacterDetailPage.tsx` | 1329 | The main sheet (details below). |
| `src/pages/personajes/MetasPage.tsx` / `MetasDetailPage.tsx` | 136 / 493 | Goals with 3 hitos and conclusion (exito/crecimiento/fracaso). Only path and order pills are Stormlight-coupled (MetasPage L25-26, L71; MetasDetailPage L348, L377). |
| `src/pages/personajes/TalentosPage.tsx` / `TalentosDetailPage.tsx` | 163 / 802 | Talent budget chips (`talentBudget`), then the talent map, "Mis talentos", ideals counter, singer forms. Uses `lib/talentGraph.ts` and `components/talentos/*`. |
| `src/pages/personajes/BolsaPage.tsx` / `BolsaDetailPage.tsx` | 166 / 820 | Marcos (spheres) infusas/opacas (L333-429), carry capacity from FUE (L233-250), weapons/armor/gear from the API catalog, equipped armor sets desvío. |
| `src/components/CharacterHero.tsx` | 40 | Generic gem-gradient header by character id. Rule-agnostic. |

**`CharacterDetailPage.tsx` sections**
- **Hero (L528-636):**
  - name, "Nv.", "Rango" = ceil(level/5) (L607), ascendencia · player
  - Salud máx in the `marco-recurso` frame, computed client-side (L520, L616-635)
- **Tabs (L431-437):** `caracteristicas`, `atributos`, `background`.
- **Características (L655-881):**
  - combat toggle (L660)
  - Forma button, shown only if `ascendencia==='Oyente'` (L669-684)
  - **Identidad (L688-727):** Ascendencia, Camino (heroic path), Orden (radiant order)
  - **Estadísticas (L730-839):**
    - Concentración
    - Investidura (radiants only: `esRadiante = !!caminoRadiante` at L753, "Solo disponible para Radiantes" at L789)
    - Desvío, Movimiento
    - Dado de recuperación (L772)
    - Alcance de sentidos (L773)
  - **Defensas:** 3 shields (L841-878)
- **Atributos (L884-1160):**
  - Attribute-point warning (L888-922)
  - 3 cards, Físico/Cognitivo/Espiritual, each with 2 attributes, 6 skills, a defence shield, and 2 custom-skill slots (L1049-1130)
  - Situational bonuses (L1134-1155)
- **Trasfondo (L1163-1201):** propósito, obstáculo, apariencia, notas (L426-429).
- **Pickers (L1206-1316):** ascendencia, heroic path, forma, radiant order.
- **Not on the sheet:**
  - talents (own page)
  - metas (own page)
  - inventory (Bolsa)
  - ideales jurados (TalentosDetailPage L314, saved at L199)
  - `spells`, `conexiones` and `experience` exist on the `Character` type but are never rendered
- **Server-computed (read-only):** `concentracion`, `investidura`, `defensas*`, `movimiento` and `salud` come as `StatDesglose` from the backend rules engine (types L36-47, L75-81).

**Stormlight hard-coding in the sheet**
- **Imports:** HEROIC_PATHS, RADIANT_ORDERS and POTENCIAS (L14-16); RadiantOrderIcon, HeroicPathIcon and SurgeIcon (L17, L20); cantores (L27-31, L76).
- **ASCENDENCIAS:** Humano and Oyente only (L421-424). `isCantor = ascendencia==='Oyente'` (L497).
- **Investidura card:** radiants only (L751-759, L785-791). `radiantOrder` is looked up at L507.
- **Surges stored as custom skills:**
  - `habilidadPersonalizada1..6` (name, valor, atributo) holds the surges.
  - `isPotencia = radiantOrder.surges.includes(customName)` (L1061).
  - `SurgeIcon` is rendered at L1088 and L1117.
  - Slot mapping `ATRIBUTO_SLOTS` (L362-364) and `ATRIBUTO_CODE` (L357-360).
- **Heroic path picker (L1214-1235):**
  - description text about several paths
  - auto-adds the path's `mainTalent`
- **Radiant picker (L1256-1316):**
  - removes the old spren-bond talents, potencia names and potencia sub-talents from `talentos` JSON
  - adds the new ones
  - writes surges into the custom skill slots with valor 1 (L1265-1313)
  - description "talentos y potencias de la orden anterior" (L1259)
- **Singer forms:** picker sublabel "vacíospren" (L1244).
- **Rules mirrored in the client (rule-set-specific numbers):**
  - `getSaludMaxima` (L332-341)
  - `getPuntosAtributoEsperados`: 12 points, +1 at levels 3, 6, 9, 12, 15 and 18 (L345-351)
  - recovery die and sense range tables (L772-773)
  - `ATTR_MAP`, `ATTR_NAMES` and the six codes FUE/VEL/INT/VOL/DIS/PRE (L353-369, L1083)
  - capacity by FUE (`BolsaDetailPage.tsx` L233-240)

**Beyond the sheet**
- `src/lib/talentGraph.ts` (1214 lines) is a generic talent-tree/prerequisite/budget engine fed entirely by Stormlight data.
  - `FORMAS_INICIALES` (L53), `IDEAL_NAMES` (L55), `SURGE_NAMES` (L60-63)
  - `isCantorAncestry` (L121-124)
  - `talentSlotsAt` (L1125-1146): human vs singer slots, levels 1/6/11/16/21
  - `rangoOf` (L102), `maxSkillRank` (L106)
- `src/components/talentos/*` is the UI for that engine: PathAtlas, TalentLamina, TalentSheet, MyTalents, BudgetSheet, FormaPicker, MapPieces, talentMap.ts (518 lines), talentStyle.ts. The geometry follows the printed Stormlight book diagrams.
- Diary: `DiaryMentionType` includes `'spren'` (types L173; `DiarioPage.tsx` L16, L21, L152, L259, L291).
- Global NPCs: `maxInvestiture` is in the GlobalNpc type (L223) and `GlobalNpcDetailPage.tsx` L64. The NPC detail page has its own skill table, with a different attribute grouping (L17-54).

---

## 3. Static data (`src/data/*.ts`)

| File | Lines | Contents | Consumed by |
|---|---|---|---|
| `aventuras.ts` | 335 | Scenes, rests, events, 14 conditions, damage types, injury tables | `pages/encyclopedia/AventurasPage.tsx` |
| `caminapiedras.ts` | 1789 | The "Caminapiedras" adventure: 4 chapters of scenes, NPCs, combats, maps | `pages/gm/CaminapiedrasPage.tsx` (GM tab "Aventura") |
| `cantores.ts` | 356 | Singer (Oyente) talent tree, 14 forms with numeric bonuses, helpers `getFormaActiva` etc. | `CharacterDetailPage` (L27-31), `lib/talentGraph.ts` (L45), `MyTalents`, `FormaPicker`, `TalentosDetailPage` (L19) |
| `combatRules.ts` | 111 | Actions, reactions, free actions, combat sections | `pages/encyclopedia/CombatPage.tsx` |
| `heroicPaths.ts` | 1295 | The 6 heroic paths (Agente…Líder) with specialties and talents | `EncyclopediaPage`, `HeroicPathsPage`, `CharacterDetailPage`, `CharacterListPage`, `PersonajesPage`, `Metas*`, `Bolsa*`, `Talentos*`, `lib/talentGraph.ts` |
| `potencias.ts` | 271 | 10 surges: rules (`POTENCIAS_REGLAS`) plus talents (`POTENCIAS`); also exports the shared `Talento` type | `PotenciasPage`, `RadiantOrdersPage` (type), `CharacterDetailPage` (L1272-1306), `lib/talentGraph.ts`, `MyTalents`, `TalentLamina` |
| `radiantOrders.ts` | 523 | 10 orders (spren, surges, ideals, talents), `RADIANT_REGLAS` (Investidura, luz tormentosa), `PRIMER_IDEAL` | About 15 files: `RadiantOrdersPage`, `EncyclopediaPage`, `RadiantOrderIcon` and every character page |
| `sessions.ts` | 315 | Auto-generated diary sessions seed for one specific campaign | **Not imported anywhere** (dead; diary comes from the API) |
| `talentGrids.ts` | 611 | Book-diagram grid positions for every talent tree | `components/talentos/talentMap.ts` |
| `talentSummaries.ts` | 258 | Short card text per talent | `talentMap.ts`, `MyTalents` |

**Generic vs Stormlight content**
- Mostly core Cosmere-RPG rules, with Stormlight flavour sprinkled in: `combatRules.ts` and `aventuras.ts`. Examples: combatRules L103 (radiant powers), aventuras L148/L169 (alta tormenta), L206/L213 (Radiant states, "Absorber luz tormentosa"), L277 (hojas esquirladas).
- Purely Stormlight: everything else.
- Whether Mistborn shares the core engine (d20 + plot die, 6 attributes, 18 skills, actions/reactions) is not knowable from the code. The Mistborn rules are not in the repo.
- Weapons, armor and gear are not static data. They come from the API (`/catalog`, `src/api/catalog.ts`) and are Roshar-flavoured. `CatalogPage` shows prices as "N mc" with the sphere image (L150-157).

---

## 4. Dice roller

Files: `src/components/DiceRoller.tsx` (1695), `src/utils/dice.ts` (366), `src/api/diceRolls.ts`. The roller is mounted in `AppLayout` (L30).

**Skills and attributes**
- `SKILLS` (L25-31) has 18 UI labels: Agilidad, Armas ligeras, Armas pesadas, Atletismo, Deducción, Disciplina, Engaño, Hurto, Intimidación, Liderazgo, Manufactura, Medicina, Percepción, Perspicacia, Persuasión, **Saber**, Sigilo, Supervivencia.
- `SKILL_TO_FIELDS` (L36-55) maps each label to `[skillField, attributeField]` on `Character`. For example `'Saber' → ['conocimiento','intelecto']`.
- `ATTR_CODE_TO_FIELD` (L58-65) maps FUE/VEL/INT/VOL/DIS/PRE.
- `getCharMod` (L68-87) = skill + attribute. It falls back to the custom slots `habilidadPersonalizada1..6`, matching by name (this is how surges roll). `getCharSkills` (L90-97) = 18 skills + non-empty custom skills.

**Tabs (L1306-1316):** Combate, Habilidad, Daño, Recuperación, Enfrentada, Libre, Registro. Selected by `activeTab` (L1355). Registro receives rolls through SignalR (`useCampaignHub`) and a `diceRollReceived` window event.

**Stormlight-specific rules in the roller**
- **Plot die** (`utils/dice.ts` L81-90 `TRAMA_FACES`, `rollTrama`; DiceRoller L99-108 `TRAMA_STYLE`, `TramaToggle` L263-311, `TramaBadge`/`TramaResult`, `NaturalNote` L371-388; icons `PlotIcon` plus `dado-trama.webp`).
  - Faces are blank ×4, O ×3, C1, C2, C3, C4.
  - The Oportunidad (O) and Complicación (C) results are the rule.
  - A natural 20 forces O and a natural 1 forces C2 (`dice.ts` L137-147, repeated in `rollContested` and `rollCombat`).
  - Every skill, contested and combat roll can use the die. Damage, recovery and free rolls cannot.
- **Recovery tab** (`recoveryDieFaces` `dice.ts` L107-114; `VOLUNTAD_TABLE` DiceRoller L702-706): die size by Voluntad d4…d20; copy mentions Salud and Concentración (L773).
- **Combat tab** (L1012): attack skills are limited to Armas ligeras, Armas pesadas, Agilidad. Ventaja/desventaja applies to the d20 and to the damage dice set.
- **Damage dice** `DAMAGE_DICE = [4,6,8,10,12,20]` (L33).

**Shared with the character sheet?** No. There are four independent skill/attribute tables:
1. `CharacterDetailPage.tsx` `SECTIONS` L373-419: `[field, label, attrField, attrCode]` grouped Físico/Cognitivo/Espiritual.
2. `DiceRoller.tsx` L25-55: different labels ("Armas ligeras" vs "Armas Ligeras", "Saber" vs "Conocimiento").
3. `lib/talentGraph.ts` L65-81: `SKILL_FIELDS` and `SKILL_NAME_MAP`, no attributes.
4. `pages/gm/GlobalNpcDetailPage.tsx` L17-54: its own attribute grouping.

**Known inconsistencies:** per `docs/auditoria-reglas-2026-10-03.md`, the first three disagree on Atletismo (sheet VEL vs roller FUE) and Intimidación (sheet VOL vs roller PRE vs NPC DIS). The NPC page also differs on Disciplina and Supervivencia.

---

## 5. Types (`src/types/index.ts`)

There are **no enums or unions** for camino, orden, ascendencia, skill names or attribute codes. They are all plain `string` (`caminoHeroico`, `caminoRadiante`, `ascendencia`, `habilidadPersonalizadaNAtributo`). Existing unions: `role: 'gm'|'player'`, `Meta.estado`, `Meta.tipoConclusion`, `DiaryMentionType` (includes `'spren'`), `ProposalStatus`. Character, Campaign, CampaignDetail and Member are in L14-134 (see §1 for Campaign).

**`Character` (L50-134), grouped:**
- **Identity:** `id, campaignId, ownerId?, name, playerName, level, experience, caminoHeroico, caminoRadiante, ascendencia, idealesJurados`
- **Attributes:** `fuerza, velocidad, intelecto, voluntad, discernimiento, presencia`
- **Resources:**
  - `maxHealth`
  - `maxConcentration` (deprecated)
  - `maxInvestiture` (deprecated)
  - `desvio`
- **Computed `StatDesglose`:** `concentracion, defensaFisica, defensaCognitiva, defensaEspiritual, salud, investidura, movimiento`
- **Spheres:** `marcosInfusas, marcosOpacas`
- **18 skills:** `agilidad, armasLigeras, armasPesadas, atletismo, hurto, sigilo, deduccion, disciplina, intimidacion, manufactura, medicina, conocimiento, engano, liderazgo, percepcion, perspicacia, persuasion, supervivencia`
- **Custom skills:** `habilidadPersonalizadaN`, `…Valor`, `…Atributo` for N = 1..6 (name, number, attribute code string)
- **Narrative text:** `proposito, obstaculo, talentos` (a JSON string array), `metas: Meta[]`, `apariencia, notas, conexiones`
- **Inventory:** `weapons, armor, spells, equipment: string[]`, `equippedArmor`
- **Timestamps:** `createdAt, updatedAt`

**Request types:**
- `CreateCharacterRequest` (L136) is `Pick<Character,'name'|'playerName'|'level'|'ascendencia'|'caminoHeroico'|'caminoRadiante'> & {ownerId?}`.
- `UpdateCharacterRequest` (L137-141) is `Omit<Character, id|campaignId|createdAt|updatedAt|metas|concentracion|defensa*|salud|investidura|movimiento>`.

Related: `GlobalNpc` (L208-248) repeats the 6 attributes, 18 skills, `maxInvestiture` and `ascendencia`.

The doc comment says the file "must mirror the C# DTOs in `cosmere-api/Messages`". The Character API and its rules engine (`CharacterService.cs`, `TalentosReglas.cs`, per the audit doc) are Stormlight-specific on the server too.

---

## 6. Encyclopedia and reference pages

| Page (src/pages/...) | Content | Stormlight-only? |
|---|---|---|
| `encyclopedia/EncyclopediaPage.tsx` (280) | Hub with 6 topic tiles (`TOPICS` L109-197). Subtitle "mundo de Roshar" (L210); the catalog tile description mentions Roshar (L189). | Hub is generic, tiles are mostly Stormlight |
| `encyclopedia/RadiantOrdersPage.tsx` (400) | Orders, Investidura rules | Yes |
| `encyclopedia/PotenciasPage.tsx` (286) | 10 surges | Yes |
| `encyclopedia/HeroicPathsPage.tsx` (273) | 6 heroic paths; subtitle "en Roshar" (L250) | Stormlight handbook |
| `encyclopedia/CombatPage.tsx` (133) | Actions, reactions; subtitle "Archivo de las Tormentas" (L68) | Core rules (likely shareable), text from the Stormlight handbook |
| `encyclopedia/AventurasPage.tsx` (345) | Scenes, rests, events, conditions, damage | Core rules with Stormlight sprinkles |
| `catalog/CatalogPage.tsx` (1040) | Weapons/armor/gear from API, create/edit | Content is Roshar; the UI is generic |
| `gm/CaminapiedrasPage.tsx` (869) | The specific adventure (scenes, NPCs, combats, maps) | Yes (adventure-specific) |
| `gm/GlobalNpcListPage.tsx`, `GlobalNpcDetailPage.tsx` | NPC stat blocks with 6 attributes, 18 skills, Salud/Concentración/Investidura | Structure Stormlight; investidura label is rule-set-specific |
| `gm/GmMessagesPage.tsx`, `historia/*`, `diario/DiarioPage.tsx`, `sessions/*`, `npcs/NpcNotesPage.tsx`, `home/HomeCampaignPage.tsx` | Messages, calendar, diary, NPC notes, home | Generic. Exceptions: the diary `spren` mention type, the `archivo-tormentas` emblem (`DiarioPage.tsx` L390), and the `dado-d20` image on the Home card (`HomeCampaignPage.tsx` L100). |

Tab shells (not in `App.tsx`, just containers):
- `PersonajesPage` (Personajes/Metas/Talentos/Bolsa)
- `HistoriaPage` (Calendario/NPCs/Diario/Mensajes)
- `GmPage` (NPCs/Mensajes/Aventura)

---

## 7. Routing and navigation

**Routes** (`src/App.tsx`, L36-70):
- Public: `/login`, `/register`.
- Protected: `/campaigns`.
- Campaign routes under `/campaigns/:campaignId` (AppLayout):
  - `home`
  - `personajes`
  - `personajes/metas|talentos|bolsa/:characterId`
  - `historia`
  - `encyclopedia`
  - `encyclopedia/radiant-orders|heroic-paths|combat|aventuras|potencias`
  - `gm`
  - `settings`
  - `characters/:characterId`
  - `gm/characters|metas|talentos|bolsa/:characterId`
  - `global-npcs/:npcId`
  - `catalog`
- Fallback `*` redirects to `/campaigns`.

**Navigation** (`src/components/Sidebar.tsx`):
- Label maps L13-33.
- `navItems` (L38-49):
  - GM: Inicio (home), Partida (historia), Enciclopedia.
  - Player: Inicio (home), Personaje (personajes), Partida (historia), Enciclopedia.
- `gmNavItems` (L51-54): Personajes, Director (`gm`).
- Rendered three times with the same items (L172-195, L271-290, L461-473):
  - desktop 248px sidebar
  - tablet rail
  - mobile bottom nav
- Settings is a separate link (L198-205), and a mobile top bar is at L315-399.
- Brand text: `BrandMark subtitle="Compañero de mesa"` (L124).

**Items that need to become rule-set-aware:**
- Personaje(s) → everything under `personajes/*`, `characters/*`, `gm/characters|metas|talentos|bolsa/*` (the sheet, talents map, bolsa)
- Enciclopedia and its 5 children plus catalog (`TOPICS` in `EncyclopediaPage.tsx`)
- Director → `gm` tab "Aventura" and `global-npcs/:npcId`
- the dice-roller FAB (in `AppLayout`)
- Inicio, Partida and Ajustes are generic

---

## 8. Icons

**`src/components/CosmereIcon.tsx`** (65 lines) renders icons by name from the registry `src/lib/cosmereAssets.ts`, which globs `src/assets/cosmere/*.svg` and `img/*.webp`. `hasCosmereIcon(name)` is the lookup. The `mask/*.png` folder it mentions does not exist.

**`src/components/GameIcons.tsx`** (29 lines) wraps three things:
- `HeroicPathIcon`: Lucide icons from the `HEROIC_PATH_ICONS` map.
- `SurgeIcon`: `potencia-<slug>`, fallback Lucide `Zap`.
- `PlotIcon`: `trama-oportunidad|complicacion`.

**Assets in `src/assets/cosmere/`:**
- **Stormlight-only:**
  - `orden-*` ×10 (bondsmiths, dustbringers, edgedancers, elsecallers, lightweavers, skybreakers, stonewards, truthwatchers, willshapers, windrunners)
  - `potencia-*` ×10 (abrasion, adhesion, cohesion, division, gravitacion, iluminacion, progresion, tension, transformacion, transportacion)
  - `caballeros-radiantes` and `caballeros-radiantes-color`
  - `archivo-tormentas`, `puente-cuatro`
  - `img/esfera-broam-esmeralda`, `esfera-chip-zafiro`, `esfera-marco-diamante`, `esferas-fila` (Roshar spheres)
  - `public/blason/01-10_*_placard.webp` (radiant order placards, mapped in `RadiantOrderIcon.tsx` L11-22)
- **Core Cosmere RPG (probably reusable):**
  - `accion-1`, `accion-2`, `accion-3`, `accion-gratuita`, `reaccion`, `siempre-activo`, `activacion-especial`
  - `trama-oportunidad`, `trama-complicacion`
  - `img/dado-d20`, `img/dado-trama`
  - `marco-defensa`, `marco-desvio`, `marco-recurso`
- **Brand/generic:** `cosmere-emblem`, `cosmere-emblem-color`, `ornamento-banda`, `ornamento-cartela`, `ornamento-cita`, `ornamento-filete`, `ornamento-medallon`, `ornamento-rombo`.
- **Lucide maps** (`src/lib/gameIcons.ts`): `StatIcons`, with `investidura` as `Gem` (L25); `RollModeIcons`; `HEROIC_PATH_ICONS`.
- **No Mistborn assets at all** (no metals, allomancy, coins).

---

## 9. Design (DESIGN.md, 156 lines)

1. **Identity:** the visual language follows the Cosmere RPG rulebooks (navy ink, gold ornament, flared serif titles, official iconography).
2. **Themes:** two exist, light "Pergamino de tormenta" (`data-theme="light"`) and dark "Luz tormentosa" (`data-theme="dark"`).
   - They follow the system unless the user picks one in `themeStore.ts`, which persists `system | light | dark` under `cosmere-theme`.
   - They are applied on `<html data-theme>` before first paint by `index.html`.
3. **Tokens:** CSS variables in `src/index.css` (L13-298). `src/theme.ts` mirrors them for inline styles (`c`, `tone`, `fs`, `radius`, `font`, `ink`, `tint`, `toneFrom`).
   - Surfaces: `--bg`, `--surface-1..4`
   - Text: `--text*`
   - Accent: one only, `--brand*` (Stormlight blue; dark `#8fd4ff`, light `#1359ad`)
   - Gold: `--gold`, `--gold-ornament #d0a451`
   - Official navy: `--navy #1e3c60`
   - 10 gem tones: `rubi`, `granate`, `topacio`, `heliodoro`, `esmeralda`, `zafiro`, `amatista`, `circon`, `cuarzo`, plus `gold`
4. **Data colours:** order and path hex colours live in the data files and go through `ink()`/`tint()`/`toneFrom()`. Character heroes use 6 fixed gem gradients (`lib/avatar.ts` L14-21).
5. **Multiple palettes?** The only axis is light/dark. There is no notion of multiple palettes or rule-set theming. Principle 2 says "One accent, Stormlight blue".
   - **Brand coupling:**
     - `var(--brand` appears 40 times and `tone.brand|c.brand` 93 times in `src/`, so retinting the accent is mostly one place.
     - `--atmo` (glows), `--glow-brand`, `--brand-glow` and `--selection` are Stormlight-tinted.
     - Unused keyframe `stormlight` (L722).
     - PWA colours are hard-coded in `index.html` (`theme-color`) and `vite.config.ts` (manifest `theme_color` and `background_color`).
   - A second `data-ruleset` attribute overriding `--brand*`, `--atmo`, `--navy` and `--gold-ornament` is the obvious seam. `index.html` and `vite.config.ts` are not runtime-themable per campaign.

---

## 10. Mistborn / bruma / alomancia / ferruquimia / hemalurgia / metal

**No real mentions anywhere in the repo.** `mistborn`, `alomancia`, `allomancy`, `ferruquimia`, `feruchemy`, `hemalurgia` and `Nacidos` have zero hits. Hits are false positives only:
- "abrumar/abrumador/abrumado" (substring "bruma"): `talentSummaries.ts` L35, `talentGrids.ts` L197, `heroicPaths.ts` L737, `aventuras.ts` L192/L299, `caminapiedras.ts` L1129 and `radiantOrders.ts` L277
- "brumaspren": `radiantOrders.ts` L338, L350-351, L367, `caminapiedras.ts` L1636, L1692, and `docs/auditoria-reglas-2026-10-03.md` L122. These are the Stormlight spren (mist spren)
- "metal": only `heroicPaths.ts` L685 ("carcasas de metal"); "acero" and "hierro" appear in Spanish idioms ("Posición de hierro" in `heroicPaths.ts` L925-933, `talentGrids.ts` L235, `talentSummaries.ts` L187; `heroicPaths.ts` L342, L1098)

---

## Seams a rule-set feature would have to touch

1. **Contract:** `CreateCampaignRequest`, `CampaignResponse` and `CampaignDetailResponse` in the API, and `Campaign`/`CampaignDetail` in `types/index.ts`, plus `campaignsApi.create`. Add a `ruleSet` field and default existing campaigns to stormlight.
2. **Creation UI:** only `InlineForm` in `CampaignListPage.tsx`, which currently has one text input.
3. **State:** `campaignStore.ts` for a derived rule-set value, with stale-persist handling and `AppLayout` hydration timing.
4. **Navigation and pages:** `Sidebar.tsx`, `EncyclopediaPage.tsx` `TOPICS`, the `App.tsx` encyclopedia/personajes routes, and the `GmPage` "Aventura" tab.
5. **Character:** `Character`/`CreateCharacterRequest` carry Stormlight-only fields (`caminoHeroico`, `caminoRadiante`, `ascendencia`, `idealesJurados`, `marcos*`, `maxInvestiture`, surge slots via `habilidadPersonalizadaN`). The server rules engine and `StatDesglose` are also Stormlight-only. Sheet logic that is rule-set-specific: `CharacterDetailPage.tsx`, `CharacterListPage.tsx`, `PersonajesPage.tsx`, the `Metas*`, `Talentos*` and `Bolsa*` pages, and `lib/talentGraph.ts`.
6. **Dice:** `utils/dice.ts` and `DiceRoller.tsx`, with `SKILLS`, `SKILL_TO_FIELDS` and `TRAMA_FACES`. The tabs and the plot die are Stormlight-core. Whether Mistborn shares them is unknown.
7. **Static content:** the 7 Stormlight-coupled `src/data/*.ts` files plus talent grids/summaries; `sessions.ts` is dead.
8. **Theme and brand:** the `--brand*` tokens, `--atmo`, PWA colours, and `BrandMark`/`BrandGlyph`.
