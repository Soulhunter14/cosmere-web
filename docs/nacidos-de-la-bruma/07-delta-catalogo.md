# Delta de catálogo: Nacidos de la Bruma frente al seed actual (Archivo de las Tormentas)

Alcance: armas, armaduras, equipo, viales, divisa y equipo inicial del cap. 7 «Objetos» (L.253-279 / PDF 259-285), más el diseño para delimitar el catálogo por set de reglas.
Convenciones: `L.<libro> / PDF <pdf>` (PDF = libro + 6). `archivo:línea` para código. **[inferido]** = no está literal en el libro o en el código.
Fiabilidad: las tablas del texto extraído salen desordenadas, así que **todas las tablas de este informe se verificaron contra la página renderizada del PDF** (`SPA_Mistborn_Handbook.pdf`, PDF 264, 265, 266, 268, 271, 273, 275, 278, 282). Los valores de la sección 2 son los impresos en el libro.
Unidades: peso en kg (g/1000), precio en arquillas (`ar`). `Era` vacío = ambas eras.

---

## 0. Resumen ejecutivo y decisiones recomendadas

1. El cap. 7 aporta **35 armas** (8 ligeras, 10 pesadas, 5 especiales, 12 de fuego Era 2), **8 armaduras**, **71 objetos de equipo** y **13 viales/cuentas de metales raros** (84 filas de `GearItems` en total). El seed actual tiene 25 armas, 8 armaduras y 68 objetos de equipo.
2. **Decisión de modelo**: añadir una columna `RuleSet` a `WeaponCatalog`, `ArmorCatalog`, `GearItems` y `CatalogOptions` (no una categoría `rule_set`). Valores: `'stormlight'`, `'mistborn'`, y `'shared'` **solo en `CatalogOptions`**. Las filas de objetos se **duplican por set** (sección 8).
3. Además: `Era smallint NULL` (1, 2 o NULL = ambas), `Price double NULL` en armas y armaduras (hoy no existe), `IsRewardOnly bool` en armas, armaduras y equipo.
4. **Filtrado**: `GET /catalog/*?campaignId={id}`; el servidor deriva set y era de la campaña. Sin `campaignId` se devuelve `stormlight` (compatibilidad con el cliente actual).
5. IDs nuevos: opciones en los huecos libres (`weapon_type` 4, `damage_type` 33-34, `range` 47-49, `weapon_trait` 65-69, `armor_type` 78-79, `armor_trait` 86) y el resto en bloques 100+ (sección 5). Filas de objetos del seed: ids **1001+** con `setval` final (hay un riesgo real de secuencia, sección 1.4).
6. UI: precios en **arquillas** (sin esfera), no en `mc`; sección «Marcos» de la bolsa sustituida por «Arquillas» (un único número con decimales); capacidad de carga distinta (25/50/125/250/1250/2500 kg); picker con búsqueda; equipo inicial por paquetes (7).

---

## 1. Hechos verificados del código actual

### 1.1 Modelo y seed
- `Messages/Database/Entities/WeaponCatalogEntity.cs:3-18` `WeaponCatalogEntity`: `Id (long), Name, WeaponTypeId, SkillId, DamageDiceCount, DamageDiceValue, DamageTypeId, RangeId, TraitIds (List<int>), ExpertTraitIds, IsCustom, Description, Weight`. **No tiene `Price`.**
- Mismo fichero `:20-31` `ArmorCatalogEntity`: `Id, Name, ArmorTypeId, Desvio, TraitIds, ExpertTraitIds, IsCustom, Description, Weight`. **Sin `Price`.**
- Mismo fichero `:33-40` `GearItemEntity`: `Id, Name, Weight, Price (double, no nullable), Description`. **Sin `IsCustom`** (no hay alta/baja de equipo).
- Mismo fichero `:42-48` `CatalogOptionEntity`: `int Id, Category, Name, Description`. `Infrastructure/Data/CosmereContext.cs:167-169` solo indexa `Category`; el `Id` es PK global (único entre categorías).
- Seed `Infrastructure/Migrations/20260410143041_SeedCatalogData.cs`: `DELETE` de las 4 tablas y `INSERT` con ids explícitos. Opciones en `:21-81` (`weapon_type` 1-3, `skill` 10-27, `damage_type` 30-32, `range` 40-46, `weapon_trait` 50-64, `armor_type` 70-77, `armor_trait` 80-85). Armas `:86-111` (ids 1-25), armaduras `:116-124` (1-8), equipo `:129-197` (1-68). Pesos de armas y armaduras: `20260414125705_AddWeightToCatalog.cs` (`UPDATE ... CASE "Id"`).
- Los `TraitIds` son ids de `CatalogOptions`; los rasgos con parámetro son **opciones separadas por valor** («Voluminosa [3]/[4]/[5]», ids 81-83 y 63). Seguir esa convención para «Cargada [X]», «Explosiva [X]».

### 1.2 API
- `Services/Catalog/CatalogService.cs:11,21,29,35` `GetWeaponsAsync/GetArmorAsync/GetGearAsync/GetOptionsByCategory`: devuelven **todo**, sin filtro. Las opciones filtran solo por `Category` (comparación en minúsculas, por eso el front puede pedir `'WEAPON_TYPE'`).
- `API/Controllers/CatalogController.cs:11-13`: solo `[Authorize]`. **Cualquier usuario autenticado puede crear, borrar (si `IsCustom`) y editar descripciones** (`:30-85`). No hay comprobación de GM ni de campaña. El catálogo es global.
- Alta de arma/armadura (`CatalogService.cs:41,71`): pone `IsCustom = true`. Las tablas usan `IdentityByDefaultColumn` (`20260327145705_InitialCreate.cs:81-84`).

### 1.3 Frontend
- `src/api/catalog.ts:28-47` `catalogApi`: métodos sin parámetro de campaña. `CreateWeaponPayload/CreateArmorPayload` en `:4-26`.
- `src/types/index.ts:328-368`: `WeaponCatalog`, `ArmorCatalog`, `GearItem`, `CatalogOption` (sin precio en arma/armadura, sin set, sin era).
- `src/pages/catalog/CatalogPage.tsx`:
  - `:36` `SPHERE = cosmereImage('esfera-marco-diamante')` y `:150-157` `Price`: imprime `{value} mc` con la esfera marco **fija**. Solo el equipo muestra precio (`:384`, `:590`); armas y armaduras solo muestran peso (`:340`, `:364`).
  - `:881-892`: queries `['catalog-weapons']`, `['catalog-armor']`, `['catalog-gear']`, `['opts', 'WEAPON_TYPE']`... sin campaña en la clave.
  - `:204-224`: tras crear o borrar se invalida solo `['catalog-weapons']`/`['catalog-armor']`.
- `src/pages/personajes/BolsaDetailPage.tsx`:
  - `:160-170`: **otras** claves (`['catalog','weapons']`...) para los mismos datos; la invalidación de `CatalogPage` no las refresca (defecto previo).
  - `:157,182-203`: `marcosInfusas`/`marcosOpacas` (ints). Sección Marcos `:332-429`.
  - `:233-241` `getCapacity(fuerza)`: 22,5 / 45 / 112,5 / 225 / 1125 / 2250 kg. El peso se calcula buscando **por nombre** (`:243-245`) en los catálogos.
  - `:612-660` picker: lista `catalogWeapons/Armor/Gear` sin búsqueda ni filtros.
  - `:204-212` `addItem`: los inventarios del personaje son `text[]` **de nombres** (`weapons`, `armor`, `equipment`); `equippedArmor` es un nombre.
- Recursos oficiales: `src/assets/cosmere/img/` solo tiene `esfera-chip-zafiro`, `esfera-marco-diamante`, `esfera-broam-esmeralda`, `esferas-fila`, `dado-d20`, `dado-trama`. **No hay ilustración de arquillas.**
- El libro de Tormentas ya usa «mc» = marco (`Resources/CaminaPiedras/ch7_objetos_raw.txt:129`: «abreviado como "mc"»; 1 marco = 5 chips, 1 broam = 4 marcos, `:119-123`). Los precios de armas de Tormentas **existen en el libro** (p. ej. Ballesta 200 mc, `ch7_objetos_raw.txt:501`) pero la BD no los guarda.

### 1.4 Riesgo de secuencia (verificado en código)
No hay ningún `setval`/`RESTART` en las migraciones (`grep -i setval Infrastructure/Migrations/*.cs` sin resultados). Las tablas son `IDENTITY BY DEFAULT`; insertar ids explícitos **no avanza la secuencia**. Si la secuencia sigue en 1, el primer `POST /catalog/weapons` (id autogenerado) choca con el id 1 del seed. **[inferido]** depende del estado real de la BD de producción (puede haberse avanzado a mano o por inserciones previas al seed). La migración de Mistborn debe terminar con `setval` (sección 6.4) y de paso corrige el riesgo previo.

---

## 2. Datos del libro: tablas completas transcritas

### 2.1 Divisa (L.254 / PDF 260)
| Denominación | Valor | Notas |
|---|---|---|
| Óbolo | 0,01 ar | Metales comunes (hierro, estaño, bronce). Monedas de 1, 5, 10, 20 y 50 óbolos |
| Arquilla | 1 ar | Doble tamaño que el óbolo, metales preciosos (oro). Antes del Catacendro hubo piezas de 2 y 5; en la Era 2 más denominaciones |
| Nota (papel moneda) | 1 nota = 10 ar | Existen notas de 1, 5, 10, 20 y 50. En Era 1 circulan solo entre la nobleza |
- El libro **hace seguimiento con una sola moneda: la arquilla (`ar`)**; si recibes otra denominación, la DJ da el equivalente. Los precios valen para ambas eras salvo indicación.
- Dinero inicial: **Era 2 = 10 ×** los dados de Era 1.
- Ilustraciones oficiales en PDF 260: «Dinero de la Era 1» (bolsa de monedas, imagen 783x819, xref 9693, máscara 9692) y «Dinero de la Era 2» (cartera con billetes, 723x675, xref 9697, máscara 9696). Comprobado que PyMuPDF las extrae con transparencia (`Pixmap(doc, xref)` + `Pixmap(pix, Pixmap(doc, smask))`).

### 2.2 Armas: armamento ligero (L.258 / PDF 264)
Habilidad: Armamento ligero (`SkillId` 11). Alcance cuerpo a cuerpo salvo indicación.
| Arma | Daño | Alcance | Rasgos | Rasgos de experto | kg | ar |
|---|---|---|---|---|---|---|
| Bastón de madera | 1d6 golpe | CC | Discreta, A dos manos | Defensiva | 2 | 5 |
| Cuchillo | 1d4 laceración | CC | Discreta | Mano secundaria, Arrojadiza [6/18] | 0,5 | 2 |
| Daga de cristal | 1d4 laceración | CC | Discreta, Frágil | Mano secundaria, Arrojadiza [6/18] | 0,25 | 50 |
| Espada lateral | 1d6 laceración | CC | Preparación rápida | Mano secundaria | 1 | 15 |
| Lanza corta | 1d8 laceración | CC | A dos manos | Única: pierde A dos manos | 1,5 | 5 |
| Maza | 1d6 golpe | CC | — | Inercia | 1,5 | 10 |
| Arco corto | 1d6 laceración | A distancia [24/96] | A dos manos | Preparación rápida | 1 | 40 |
| Honda | 1d4 golpe | A distancia [9/36] | Discreta | Indirecta | 0,5 | 1 |

### 2.3 Armas: armamento pesado (L.259 / PDF 265)
Habilidad: Armamento pesado (`SkillId` 12).
| Arma | Daño | Alcance | Rasgos | Rasgos de experto | kg | ar |
|---|---|---|---|---|---|---|
| Alabarda | 1d10 laceración | CC | A dos manos | Única: Cuerpo a cuerpo [+1,5] | 2,5 | 20 |
| Escudo | 1d4 golpe | CC | Defensiva | Mano secundaria | 1 | 5 |
| Escudo de madera | 1d6 golpe | CC | Defensiva, A dos manos | Única: pierde A dos manos | 2 | 50 |
| Espada larga | 1d8 laceración | CC | Preparación rápida, A dos manos | Única: pierde A dos manos | 1,5 | 30 |
| Hacha | 1d6 laceración | CC | Arrojadiza [6/18] | Mano secundaria | 1 | 10 |
| Hacha de obsidiana | 1d6 laceración | CC | Frágil | Mano secundaria | 0,5 | 100 |
| Lanza larga | 1d8 laceración | CC [+1,5] | A dos manos | Defensiva | 4,5 | 20 |
| Martillo | 1d10 golpe | CC | A dos manos | Inercia | 4 | 30 |
| Arco largo | 1d6 laceración | A distancia [45/180] | A dos manos | Indirecta | 1,5 | 75 |
| Ballesta | 1d8 laceración | A distancia [30/120] | Cargada [1], A dos manos | Mortífera | 3,5 | 100 |

### 2.4 Armas especiales (L.260 / PDF 266)
| Arma | Habilidad | Daño | Alcance | Rasgos | Rasgos de experto | kg | ar |
|---|---|---|---|---|---|---|---|
| Arma improvisada | La de un arma similar | El de un arma similar | CC | Frágil, Única | Única | — | — |
| Ataque sin armas | Atletismo | Única (tabla por Fuerza) | CC | Única | Inercia, Mano secundaria | no pesa | — |
| Bastón de duelo | Armamento pesado o ligero | 1d8 golpe | CC | Discreta, Única | Mano secundaria | 1,5 | 40 |
| Hoja koloss | Armamento pesado | 1d12 golpe | CC [+1,5] | Voluminosa [6], Peligrosa, Mortífera, A dos manos, Única | Única: pierde Peligrosa; el daño pasa a 1d20 golpe | 100 | **Solo recompensa** |
| Palo de ruido | Armamento ligero | 1d4 golpe | CC | Frágil, Única | Mano secundaria | 0,25 | 100 |

Reglas asociadas (L.260-261 / PDF 266-267):
- **Daño sin armas** por Fuerza: 0-2 → 1 golpe (sin tirada); 3-4 → 1d4; 5-6 → 1d8; 7-8 → 2d6; 9 o más → 2d10 golpe.
- **Nudilleras**: en una mano, suben un paso la magnitud del dado sin armas (1 → 1d4, 1d8 → 1d10).
- Pericias especializadas (solo por talento, recompensa o entrenamiento): ametralladora rotatoria, bastón de duelo, dinamita, gabán de bruma, hoja koloss, capa de bruma, palo de ruido.
- Arma improvisada: se trata como el arma ligera/pesada no especial más parecida, añadiendo Frágil. «A merced de otro»: matar a un enemigo indefenso no requiere tirada.

### 2.5 Armas de fuego, solo Era 2 (L.262 / PDF 268)
| Arma | Hab. | Daño | Alcance | Rasgos | Rasgos de experto | kg | ar |
|---|---|---|---|---|---|---|---|
| Granada de fragmentación | ligero | 2d4 lac. | [6/18] | Explosiva [5], Peligrosa, Perforante, Desechable, Arrojadiza [6/18] | Única: pierde Peligrosa | 0,25 | 75 |
| Fusil de caza | ligero | 1d8 lac. | [45/180] | Cargada [1], Perforante, A dos manos | Única: Cargada [3] en lugar de [1] | 2,5 | 400 |
| Pistola de bota | ligero | 1d4 lac. | [6/12] | Discreta, Cargada [1], Perforante | Preparación rápida | 0,25 | 125 |
| Pistola de cañón corto | ligero | 1d4 lac. | [6/18] | Cargada [6], Perforante | Discreta, Mano secundaria | 0,5 | 175 |
| Revólver | ligero | 1d6 lac. | [6/24] | Cargada [6], Perforante, A dos manos | Única: pierde A dos manos | 0,5 | 250 |
| Granada de conmoción | pesado | 2d6 golpe | [6/18] | Explosiva [10], Peligrosa, Desechable, Arrojadiza [6/18] | Única: pierde Peligrosa | 0,25 | 50 |
| Cañón de mano | pesado | 1d8 lac. | [6/24] | Cargada [6], Perforante, A dos manos | Única: pierde A dos manos | 1 | 300 |
| Carabina | pesado | 1d8 lac. | [24/96] | Cargada [4], Perforante, A dos manos | Única: Cargada [4] pasa a [8] | 3,5 | 750 |
| Escopeta | pesado | 1d10 lac. | [6/18] | Peligrosa, Cargada [2], Perforante, A dos manos | Explosiva [5] | 3,5 | 600 |
| Fusil de cerrojo | pesado | 1d10 lac. | [45/180] | Cargada [1], Perforante, A dos manos | Única: el alcance pasa a [75/300] | 4,5 | 600 |
| Dinamita (1 cartucho) | pesado | 4d6 golpe | CC | Explosiva [9], Peligrosa, Desechable, Arrojadiza [6/18], Única | Única | 0,25 | 100 |
| Ametralladora rotatoria | pesado | 3d4 lac. | [6/18] | Voluminosa [6], Peligrosa, Cargada [20], Perforante, A dos manos, Única | Única: pierde Peligrosa | 85 | 2500 |

- Dinamita y ametralladora: la DJ exige patrocinador para comprarlas o llevarlas (L.263-264 / PDF 269-270).
- Munición: con «Cargada» o «A distancia» no se compra ni se registra (salvo munición especial) (L.256 / PDF 262).
- Tabla propia **Oportunidades y Complicaciones de armas de fuego** (L.263 / PDF 269), 6 efectos: (O) el disparo sobresalta (−1d4 concentración, Aturdido si llega a 0); (O) destroza la cobertura (pierde Prevenirse); (O) rebote provechoso en el entorno; (C) fallo de ignición, todos a 1,5 m Desorientados; (C) atasco, no dispara hasta recargar; (C) grieta: gana Peligrosa hasta reparar con Manufactura CD 12 en descanso largo (si ya era Peligrosa, queda inutilizable). Contenido de **enciclopedia**, no de catálogo.
- Reglas únicas de dinamita («Detonación retardada», «Volátil») y ametralladora («Disparo rápido», «Peso engorroso») en L.264-265 / PDF 270-271: van al campo `Description` (sección 4.3).

### 2.6 Armaduras (L.265 / PDF 271; reglas L.266 / PDF 272)
| Armadura | Desvío | Rasgos | Rasgos de experto | kg | ar | Era |
|---|---|---|---|---|---|---|
| Uniforme | 0 | Presentable | — | 2,5 | 20 | |
| Capa de bruma | 0 | Única | Única | 2,5 | **Solo recompensa** | |
| Cuero | 1 | — | Presentable | 5 | 30 | |
| Gabán de bruma | 1 | Presentable | Única | 5 | **Solo recompensa** | 2 |
| Coraza | 2 | Voluminosa [3] | Presentable | 15 | 50 | |
| Coraza de cerámica | 2 | Voluminosa [3], Frágil | Única: Voluminosa [2] en lugar de [3] | 10 | 250 | |
| Armadura de placas y malla | 3 | Voluminosa [4] | Única: Voluminosa [3] en lugar de [4] | 20 | 200 | |
| Armadura de madera | 3 | Voluminosa [5], Frágil | Única: pierde Frágil | 15 | 1000 | |

- El desvío reduce daño por golpe, laceración y **energía** (no espiritual ni vital) (L.264 / PDF 270).
- Solo un tipo de armadura a la vez; no se pone ni se quita en combate. Llevar armadura llama la atención en sociedad salvo con Presentable (L.264 / PDF 270; L.266 / PDF 272).
- Únicas con texto (van a `Description`): **Flecos ondeantes** (capa y gabán): ventaja en Sigilo con visión ofuscada y desventaja a la Percepción de los demás. **Solemnidad de nacido de la bruma** (experto en Capa de bruma): ventaja en Intimidación contra quien no sea nacido de la bruma. «Capa/gabán de bruma» y «hoja koloss» **solo se obtienen por recompensa** (L.266 / PDF 272).
- Objetos alománticamente inertes (sin metal: cristal, madera, obsidiana, cerámica, aluminio) no se ven afectados por hierro/acero (L.256 / PDF 262). Marcar en `Description` de Daga de cristal, Hacha de obsidiana, Escudo de madera, Armadura de madera, Coraza de cerámica, Bastón de madera [inferido para los dos últimos: el nombre cita el material].

### 2.7 Equipo (L.269 / PDF 275, reglas L.267-271 / PDF 273-277)
`*` = «incluido con fines narrativos, sin reglas ni estadísticas» (el seed actual escribe `'Sin reglas específicas.'` en esos). Rangos de precio/peso: ver nota debajo. Id propuesto = ver 6.3 (1001+ en orden de tabla). «Descripción» = paráfrasis propuesta para el campo `Description` de los que tienen reglas.
| id | Nombre | kg | ar | Era | Descripción (resumen) |
|---|---|---|---|---|---|
| 1001 | Aceite (1 frasco) | 0,5 | 0,5 | | Combustible; terreno peligroso; como arma improvisada (honda) deja al objetivo cubierto de aceite y el frasco se rompe |
| 1002 | Alcohol (1 consumición) | 0,1 | 0,1 | | Precio 0,1-50 ar según calidad; la DJ puede dar efecto circunstancial a los caros |
| 1003 | Alcohol (botella) | 1 | 0,5 | | Peso 1-2 kg, precio 0,5-300 ar |
| 1004 | Anestésico (5 dosis) | 0,75 | 30 | | Tras descanso, una dosis en una lesión reduce 1d4 días la recuperación (1 vez al día por lesión) |
| 1005 | Antiséptico (débil, 5 dosis) | 0,5 | 10 | | Tras descanso corto, una dosis cura 1d6 de salud |
| 1006 | Antiséptico (potente, 5 dosis) | 0,5 | 25 | | Tras descanso corto, una dosis cura 2d6 de salud |
| 1007 | Arcón* | 12,5 | 30 | | Sin reglas específicas. |
| 1008 | Arena metálica (bolsa) | 0,15 | 5 | | Lanzada a 9 m (1 acción): nube de 3 m de lado hasta el final de tu siguiente turno; ofusca la visión y el sentido del metal; desventaja en Alomancia de hierro/acero con la nube en línea de efecto |
| 1009 | Balanza | 1,5 | 10 | | Pesa con precisión hasta 1 kg |
| 1010 | Barril* | 35 | 10 | | Sin reglas específicas. |
| 1011 | Bolsa* | 0,5 | 0,5 | | Sin reglas específicas. |
| 1012 | Botella (cerámica)* | 1,5 | 4 | | Sin reglas específicas. |
| 1013 | Botella (cristal)* | 1 | 8 | | Sin reglas específicas. |
| 1014 | Cadena (fina, 0,3 metros) | 0,25 | 10 | | Se rompe con Atletismo CD 20 o 5 de daño |
| 1015 | Cadena (gruesa, 3 metros) | 5 | 10 | | Se rompe con Atletismo CD 30 o 15 de daño |
| 1016 | Cálamo* | 0,05 | 0,05 | | Sin reglas específicas. |
| 1017 | Catalejo | 0,5 | 250 | | Lo lejano se percibe a la mitad de distancia |
| 1018 | Cera (1 bloque)* | 0,25 | 1 | | Sin reglas específicas. |
| 1019 | Cerradura y llave | 0,5 | 25 | | Se abre con la llave o Hurto CD 20 |
| 1020 | Comida (buena, 1 día) | 0,25 | 10 | | Comida de calidad (banquetes, restaurantes de lujo) |
| 1021 | Comida (callejera, 1 día) | 0,75 | 0,5 | | Comida de puestos callejeros |
| 1022 | Comida (ración, 1 día) | 0,25 | 0,1 | | Cecina o pan para viajes largos; dura indefinidamente seca |
| 1023 | Cubo* | 1 | 0,5 | | Sin reglas específicas. |
| 1024 | Cuerda (15 metros) | 2,5 | 15 | | Se corta con 2 de daño; se desgarra con Atletismo CD 20 |
| 1025 | Diapasón* | 0,25 | 25 | | Sin reglas específicas. |
| 1026 | Escalera de mano (3 metros)* | 10 | 10 | | Sin reglas específicas. |
| 1027 | Espejo (de mano)* | 1 | 15 | | Sin reglas específicas. |
| 1028 | Estuche (cuero) | 0,5 | 2 | | Guarda hasta 10 hojas protegidas del tiempo |
| 1029 | Frasco o tarro* | 0,5 | 0,5 | | Sin reglas específicas. |
| 1030 | Ganzúa | 0,25 | 2 | | Ventaja en Hurto para forzar cerraduras; la DJ puede gastar C para que se rompa |
| 1031 | Garfio de escalada | 2 | 5 | | Ventaja en Agilidad/Atletismo para trepar por la cuerda; se lanza a 6 m con prueba |
| 1032 | Grilletes | 3 | 5 | | Apresan a tamaño Grande o menor; escapar Agilidad CD 25, romper Atletismo CD 25 o 15 de daño, forzar Hurto CD 20 |
| 1033 | Instrumento musical | 0,25 | 5 | | Peso 250 g-10 kg, precio 5-100 ar; pericia en el instrumento da ventaja |
| 1034 | Jabón* | 0,05 | 0,5 | | Sin reglas específicas. |
| 1035 | Jarra o pichel* | 2 | 1 | | Sin reglas específicas. |
| 1036 | Libro (referencia) | 0,5 | 5 | | Peso 0,5-2,5 kg, precio 5-250 ar; con tiempo de consulta cuenta como pericia en ese tema en pruebas de Intelecto |
| 1037 | Linterna (aceite) | 1 | 10 | | Luz en radio de 9 m; 6 h por medio litro de aceite |
| 1038 | Lupa | 0,1 | 200 | | Ventaja al tasar o inspeccionar objetos pequeños. **Precio 200 ar tal como está impreso** (verificado en imagen; parece alto frente a otros objetos, ver sección 11) |
| 1039 | Manta* | 1 | 0,5 | | Sin reglas específicas. |
| 1040 | Martillo (de mano)* | 1,5 | 2 | | Sin reglas específicas. |
| 1041 | Mochila* | 2,5 | 4 | | Sin reglas específicas. |
| 1042 | Nudilleras | 0,25 | 5 | | Precio 5-10 ar. En una mano suben un paso el dado de daño sin armas |
| 1043 | Odre* | 0,5 | 0,5 | | Peso 500 g vacío. Sin reglas específicas. |
| 1044 | Olla (hierro)* | 5 | 4 | | Sin reglas específicas. |
| 1045 | Pala* | 2,5 | 8 | | Sin reglas específicas. |
| 1046 | Palanca | 1,5 | 5 | | Ventaja en Atletismo cuando aplica el efecto |
| 1047 | Papel o pergamino (1 hoja)* | 0,05 | 0,2 | | Sin reglas específicas. |
| 1048 | Pedernal y acero | 0,75 | 2 | | Prende combustible abundante cercano (1 acción); hoguera difícil, 1 min o más |
| 1049 | Perfume (1 vial)* | 0,25 | 10 | | Sin reglas específicas. |
| 1050 | Pico (minería)* | 5 | 10 | | Sin reglas específicas. |
| 1051 | Piedra de afilar* | 0,5 | 0,1 | | Sin reglas específicas. |
| 1052 | Red (de caza) | 2,5 | 2 | | Atletismo contra Defensa física (hasta 4,5 m, Grande o menor): Retenido y Tumbado; liberar con Atletismo CD 15 |
| 1053 | Red (de pesca) | 7,5 | 5 | | Ventaja en pruebas físicas de pesca |
| 1054 | Ropa (buena) | 3 | 25 | | Precio 25-100 ar. Ventaja en pruebas espirituales para pasar por clase alta |
| 1055 | Ropa (común) | 1,5 | 1 | | Ventaja en pruebas espirituales para pasar por clase trabajadora |
| 1056 | Ropa (de apertura rápida) | 2,5 | 120 | | Ocultan armas/armaduras (armadura Presentable, armas Discreta); quitarla cuesta 1 acción; desventaja en tus ataques y ventaja a los ataques contra ti |
| 1057 | Ropa (raída) | 0,75 | 0,2 | | Ventaja en pruebas espirituales para pasar por indigente |
| 1058 | Saco* | 0,25 | 0,1 | | Sin reglas específicas. |
| 1059 | Sillalibre | 6 | 500 | 2 | «Gratis o 500 ar»: gratis para personajes con diversidad funcional. Movilidad levitante con el mismo valor de movimiento; en Era 1 se usa silla de ruedas |
| 1060 | Sistema de poleas | 6 | 50 | | Montado antes de elevar, el objeto cuenta como la cuarta parte de su peso |
| 1061 | Suministros quirúrgicos | 1,5 | 20 | | 10 usos; consumir 1 da ventaja en Medicina para tratar heridas |
| 1062 | Tienda de campaña (dos personas)* | 10 | 5 | | Sin reglas específicas. |
| 1063 | Tinta (vial de 30 ml)* | 0,1 | 20 | | Sin reglas específicas. |
| 1064 | Tónica (1 dosis) | 0,1 | 2 | | Tras descanso corto: 1d4 salud y 1 concentración |
| 1065 | Tratamiento (médico, 1 dosis) | 0,1 | 5 | | Descanso corto: cura Desorientado, Agotado (−1 de penalización) o Aturdido si no es lesión permanente |
| 1066 | Trompetilla | 0,5 | 25 | | Los sonidos lejanos se perciben a la mitad de distancia |
| 1067 | Vela | 0,1 | 0,1 | | Luz en radio de 4,5 m; 6 h |
| 1068 | Veneno (débil, 1 dosis) | 0,1 | 10 | | Atletismo CD 12 o 1d6 de daño vital |
| 1069 | Veneno (efectivo, 1 dosis) | 0,1 | 25 | | Atletismo CD 14 o 2d8 vital y Aturdido 1 h |
| 1070 | Veneno (potente, 1 dosis) | 0,1 | 60 | | Atletismo CD 16 o 3d10 vital y Aturdido 1 h (además Inmovilizado) |
| 1071 | Vial (cristal)* | 0,1 | 2 | | Sin reglas específicas. |
- Convención del seed para rangos (ej. Alcohol, Instrumento, Libro; `SeedCatalogData.cs:131-132,162,165`): se guarda el **mínimo** en `Price`/`Weight` y el rango en `Description`. Mantenerla; opcionalmente añadir `PriceMax` (ver 5.4).
- Reglas generales de objetos (L.253 / PDF 259): rasgos de experto solo con pericia; cargas, recarga, objetos Investidos (clavos, mentes de metal con ≥1 carga). Son cuerpo de enciclopedia, no catálogo.

### 2.8 Viales de metales raros (L.267 / PDF 273)
Los 8 metales comunes son «económicos»: se supone suministro gratuito mezclable. Un vial de metal raro ya incluye los comunes que quiera el alomante. Se compran **por unidad** y se pueden mezclar o separar en descansos corto/largo. La alternativa es un suministro recurrente (recompensa, cap. 8).
| Metal | Era 1 | Era 2 |
|---|---|---|
| Aluminio | 25 ar/vial | 50 ar/vial |
| Atium | 150 ar/**cuenta** | No disponible |
| Bendaleo | No disponible | 500 ar/vial |
| Cadmio | No disponible | 50 ar/vial |
| Cromo | No disponible | 10 ar/vial |
| Duraluminio | 25 ar/vial | 50 ar/vial |
| Electro | 10 ar/vial | 50 ar/vial |
| Nicrosil | No disponible | 50 ar/vial |
| Oro | 5 ar/vial | 25 ar/vial |
Filas propuestas en `GearItems` (ids 1072-1084, `Weight` 0,1 [inferido: el libro no da peso; se iguala a «Vial (cristal)»]). Nombre con sufijo de era para que sea único por (`RuleSet`, `Name`):
| id | Nombre | Era | ar |
|---|---|---|---|
| 1072 | Vial de aluminio (Era 1) | 1 | 25 |
| 1073 | Vial de aluminio (Era 2) | 2 | 50 |
| 1074 | Cuenta de atium | 1 | 150 |
| 1075 | Vial de bendaleo | 2 | 500 |
| 1076 | Vial de cadmio | 2 | 50 |
| 1077 | Vial de cromo | 2 | 10 |
| 1078 | Vial de duraluminio (Era 1) | 1 | 25 |
| 1079 | Vial de duraluminio (Era 2) | 2 | 50 |
| 1080 | Vial de electro (Era 1) | 1 | 10 |
| 1081 | Vial de electro (Era 2) | 2 | 50 |
| 1082 | Vial de nicrosil | 2 | 50 |
| 1083 | Vial de oro (Era 1) | 1 | 5 |
| 1084 | Vial de oro (Era 2) | 2 | 25 |
- Descripción común: «Contiene el metal raro más los metales comunes que quieras. Se bebe con la acción Beber vial.» «Cuenta de atium»: unidad = una cuenta (no un vial); el atium se registra aparte de la Investidura (L.267 / PDF 273 y resumen de reglas).
- **Incoherencia del libro**: aluminio y duraluminio figuran «No disponible» en Era 1 en la tabla de costes de manufactura (L.273 / PDF 279) pero tienen precio de vial en Era 1 (nota al pie del cap. 6: «a finales de la Era 1, las propiedades del aluminio, el duraluminio...»). Se siguen los precios de la tabla de viales.
- El **registro individual de viales por personaje** (cuántos tiene de cada metal) es de la ficha, no del catálogo. Los viales del catálogo sirven para comprar y para el inventario por nombre.

### 2.9 Viajes (L.272 / PDF 278) y manufactura (L.273-279 / PDF 279-285)
No son objetos de inventario: **datos estáticos de enciclopedia** (`src/data/`), no filas de catálogo. Se transcriben por completitud.
| Alojamiento | ar por persona y noche |
|---|---|
| Pobre | 0,2 |
| Modesto | 1 |
| Confortable | 5 |
| Lujoso | 25 |
| Aristocrático | 40 |
| Montura | Velocidad de viaje | Capacidad de carga | Alquiler/día | Compra |
|---|---|---|---|---|
| Caballo | 6 km/h | 250 kg | 4 ar | 500 ar |
Unida a un vehículo, una montura mueve 5 veces su capacidad de carga (incluido el vehículo).
| Vehículo | Tipo | Velocidad | Alquiler/día | Compra | Era |
|---|---|---|---|---|---|
| Carro de caballos | Terrestre | 6 km/h | 5 ar | 500 ar | |
| Coche | Terrestre | 45 km/h | 200 ar | 4000 ar | 2 |
| Tren | Terrestre | 90 km/h | 25 ar por pasajero | 50 000 ar | 2 |
| Barca de remos | Acuático | 4,5 km/h río abajo, 1,5 km/h río arriba | 10 ar | 250 ar | |
| Barcaza mercante | Acuático | 7,5 km/h | 25 ar | 10 000 ar | |
| Barco de vapor | Acuático | 30 km/h | 100 ar | 75 000 ar | 2 |
| Aeronave | Aéreo | 30 km/h | Solo recompensa | Solo recompensa | 2 |
Manufactura (resumen): materiales = mitad del precio; 50 ar de trabajo por jornada; materiales no estándar (aluminio, madera, cristal, obsidiana, piedra, piel) = alománticamente inertes y suelen costar x10; costes de metales raros (L.273 / PDF 279, Era 1 / Era 2): aluminio no disp. / 500; atium 2500 / no disp.; bendaleo no disp. / 2500; cadmio no disp. / 1250; cromo no disp. / 500; duraluminio no disp. / 1250; electro 250 / 1250; nicrosil no disp. / 250; oro 125 / 500. Munición mataneblinos estándar (Era 2, L.276 / PDF 282): para atraedores (metal, cerámica, pólvora: explosiva [3] y daña al alomante), para brazos de peltre (Mermado [Fuerza −2] 1 ronda), para lanzamonedas (núcleo cerámico, inerte), para ojos de estaño (estruendo: −1 concentración); 50 proyectiles cuestan 20 ar de materiales.

---

## 3. Rasgos nuevos respecto al seed (ids 50-64 y 80-85)

### 3.1 Reutilizables tal cual (no crear ids nuevos)
Ya existen y su regla es la misma en ambos libros (L.257 / PDF 263; en Tormentas `ch7_objetos_raw.txt:362,428` repite el texto de Defensiva y Perforante):
`Discreta` 50, `A dos manos` 51, `Preparación rápida` 52, `Defensiva` 53, `Mano secundaria` 54, `Indirecta` 56, `Única` 57, `Inercia` 58, `Mortífera` 60, `Frágil` 61, `Perforante` 62, `Peligrosa` 64.
Armaduras: `Presentable` 80, `Voluminosa [3]` 81, `[4]` 82, `[5]` 83, `Única` 85.

### 3.2 Rasgos de arma NUEVOS (todos `RuleSet='mistborn'`)
| id | Nombre | Definición (paráfrasis) | Página | Usado en |
|---|---|---|---|---|
| 65 | Cargada [1] | Almacena 1 unidad de munición; cada ataque a distancia gasta 1; Interactuar (1) la recarga entera; la DJ puede gastar C para dejarla con un solo disparo | L.257 / PDF 263 | Ballesta, Fusil de caza, Pistola de bota, Fusil de cerrojo |
| 66 | Cargada [2] | Igual con 2 | idem | Escopeta |
| 67 | Cargada [4] | Igual con 4 | idem | Carabina |
| 68 | Cargada [6] | Igual con 6 | idem | Pistola de cañón corto, Revólver, Cañón de mano |
| 69 | Cargada [20] | Igual con 20 | idem | Ametralladora rotatoria |
| 110 | Explosiva [5] | Radio 5 m; tras impacto o rasguño, rasguño al resto del radio; con impacto se puede gastar O para impactarlos a todos | idem | Granada de fragmentación; experto de Escopeta |
| 111 | Explosiva [9] | Radio 9 m | idem | Dinamita |
| 112 | Explosiva [10] | Radio 10 m | idem | Granada de conmoción |
| 113 | Desechable | Tras usarla se consume de forma permanente | idem | Granadas, dinamita |
| 114 | Arrojadiza [6/18] | Se arroja como ataque a distancia, corto 6 m y largo 18 m (desventaja más allá del corto); se pierde hasta recuperarla | idem | Cuchillo, Daga de cristal, Hacha (y experto en cuchillo/daga), granadas, dinamita |
| 115 | Voluminosa [6] | Requiere Fuerza ≥ 6; si no, desventaja en todos los ataques y Ralentizado mientras la empuñas | idem | Hoja koloss, Ametralladora rotatoria |
Nota: la Voluminosa [5] del seed (63) es de Tormentas (Gran arco, Martillo de guerra) y se queda `stormlight`; no hay arma Mistborn con [5]. «Cargada» sin valor (59) y «Arrojadiza» genérica (55) también se quedan `stormlight`.

### 3.3 Rasgos de armadura NUEVOS
| id | Nombre | Definición | Página | Usado en |
|---|---|---|---|---|
| 86 | Frágil | Al recibir un impacto, la DJ puede gastar C para que la armadura se rompa tras resolver el ataque | L.266 / PDF 272 | Coraza de cerámica, Armadura de madera |
No hace falta «Voluminosa [2]» como opción: aparece solo dentro de un rasgo de experto «Única: Voluminosa [2] en lugar de [3]» (Coraza de cerámica), que se modela con `Única` (85) + texto en `Description`. Mismo criterio para «Cargada [3]/[8]» y «alcance [75/300]» de los expertos de arma de fuego.

### 3.4 Rasgos únicos con nombre propio (no son opciones: van al campo `Description`)
Se modelan con la opción `Única` (57 o 85) y su texto en `Description` (convención ya usada en el seed). Paráfrasis:
| Rasgo único | Objeto | Efecto | Página |
|---|---|---|---|
| Siempre disponible | Ataque sin armas | No cuenta como ataque con arma, no se puede desarmar ni exige empuñar nada; puede hacerse con las manos ocupadas | L.261 / PDF 267 |
| Entrenamiento de fuerza | Ataque sin armas | El dado de daño depende de Fuerza (tabla 2.4) | idem |
| Flexibilidad en combate | Bastón de duelo | Se usa con Armamento pesado o ligero | idem |
| Engorrosa | Hoja koloss | Sus ataques no pueden hacer rasguño | idem |
| Ensordecedora | Palo de ruido | 1 acción: Armamento ligero contra Defensa espiritual de los que te sientan; éxito = 1d6 vital + Desorientado; dos palos dan ventaja y Aturdido a quien tenga oído sobrenatural | idem |
| Detonación retardada | Dinamita | 2 acciones: mecha de 1 a 6 rondas; luego ataque de Manufactura contra Defensa física a 1,5 m | L.264 / PDF 270 |
| Volátil | Dinamita | Explota al impactar al arrojarla; la DJ puede gastar C para que un cartucho explote; sin riesgo con pericia Dinamita | idem |
| Disparo rápido | Ametralladora rotatoria | Sin límite de Acometidas por turno; cada ataque sufre tantas desventajas como ataques previos del turno | L.264-265 / PDF 270-271 |
| Peso engorroso | Ametralladora rotatoria | Voluminosa [6] hasta anclarla; cada Interactuar para anclarla resta 2 | idem |
| Flecos ondeantes | Capa y gabán de bruma | Ver 2.6 | L.266 / PDF 272 |
| Solemnidad de nacido de la bruma | Capa de bruma (experto, pericia especializada) | Ver 2.6 | idem |

---

## 4. Tipos de daño y alcances nuevos

### 4.1 Tipos de daño (L.312 / PDF 318 «Tipos de daño»)
El libro define 5: energía, espiritual, golpe, laceración, vital. El seed solo tiene 30 Laceración, 31 Golpe, 32 Espiritual. Ningún arma del cap. 7 usa energía ni vital, pero el formulario de arma propia y las descripciones sí los necesitan:
| id | Nombre | Descripción | RuleSet |
|---|---|---|---|
| 33 | Energía | Calor y energía (fuego, rayos). El desvío lo reduce | shared |
| 34 | Vital | Pone a prueba la constitución (venenos, asfixia, frío extremo). El desvío no lo reduce | shared |
`damage_type` 33-34 caen en el hueco libre 33-39. Prioridad baja: puede posponerse sin bloquear el seed de armas.

### 4.2 Alcances (L.256 / PDF 262)
Formato de seed: `'A Distancia 15/30'`. En el seed no existe ningún alcance de 6 m ni «Cuerpo a cuerpo [+X]».
| id | Nombre | Descripción | Uso |
|---|---|---|---|
| 47 | A Distancia 6/18 | Alcance corto 6 m / largo 18 m | Granadas, pistola cañón corto, escopeta... |
| 48 | A Distancia 6/24 | 6 m / 24 m | Revólver, cañón de mano |
| 49 | A Distancia 6/12 | 6 m / 12 m | Pistola de bota |
| 100 | Cuerpo a Cuerpo [+1,5] | Suma 1,5 m a tu cercanía para los ataques con el arma | Lanza larga, Hoja koloss (y experto de Alabarda) |
Existentes reutilizables: 40 Cuerpo a Cuerpo, 42 (24/96), 43 (9/36), 44 (30/120), 46 (45/180). Quedan solo `stormlight`: 41 (15/30) y 45 (60/240).
Regla del libro: ataque a distancia más allá del corto sufre desventaja; con un enemigo en tu cercanía también (L.256 / PDF 262).

### 4.3 Otros
- `weapon_type` (hoy 1 ligero, 2 pesado, 3 especiales): las tres tablas del libro los reutilizan. **Opcional**: id 4 `Armas de fuego` («Armas de fuego, Era 2») para filtrar en UI las 12 armas de pólvora [inferido: el libro solo las agrupa bajo el encabezado «Armas de fuego» con subtítulos ligeras/pesadas/especiales]. Si no se crea, usar `Era = 2` + `SkillId` como filtro.
- `skill`: las 18 habilidades del seed (ids 10-27) son las mismas de Mistborn. Alomancia (Voluntad) y Feruquimia (Intelecto) son habilidades nuevas pero **ningún objeto las usa** como habilidad de arma; reservar ids 28 y 29 (`RuleSet='mistborn'`) solo si el módulo de ficha/dados los necesita [inferido].
- `armor_type` nuevos (el seed nombra el tipo igual que la armadura): 78 `Capa de bruma`, 79 `Gabán de bruma`, 140 `Coraza de cerámica`, 141 `Armadura de madera`. Existentes reutilizables: 70 Uniforme, 71 Cuero, 73 Coraza, 74 Armadura de placas y malla.

---

## 5. Esquema propuesto

### 5.1 Columnas nuevas
| Tabla | Columna | Tipo | Default | Notas |
|---|---|---|---|---|
| `CatalogOptions` | `RuleSet` | text NOT NULL | `'stormlight'` | `'stormlight'`, `'mistborn'`, `'shared'` |
| `WeaponCatalog`, `ArmorCatalog`, `GearItems` | `RuleSet` | text NOT NULL | `'stormlight'` | sin `'shared'` (sección 8) |
| `WeaponCatalog`, `ArmorCatalog`, `GearItems` | `Era` | smallint NULL | NULL | NULL = ambas; 1 o 2 |
| `WeaponCatalog`, `ArmorCatalog` | `Price` | double precision NULL | NULL | en la divisa del set de la fila; NULL = sin precio / no aplica |
| `WeaponCatalog`, `ArmorCatalog`, `GearItems` | `IsRewardOnly` | boolean NOT NULL | false | «Solo recompensa»: no comprable |
| `GearItems` (opcional) | `Category` | text NULL | NULL | `'vial'`, para agrupar viales en la UI |
- Índice no único `(RuleSet)` en las tres tablas de objetos y en `CatalogOptions` (ya existe el de `Category`; ampliar a `(RuleSet, Category)`).
- **No** crear índice único `(RuleSet, Name)` en la migración: pueden existir armas/armaduras propias duplicadas en BD [inferido]. Validar unicidad en `CreateWeaponAsync/CreateArmorAsync`.
- Por qué columna y no categoría `rule_set`: una categoría en `CatalogOptions` solo serviría para listar sets; no filtra filas. La columna filtra con un `WHERE`.
- Entidades C#: añadir propiedades a `WeaponCatalogEntity`, `ArmorCatalogEntity`, `GearItemEntity`, `CatalogOptionEntity` y a los DTO `WeaponCatalogResponse`, `ArmorCatalogResponse`, `GearItemResponse`, `CatalogOptionResponse` (en `Messages/Catalog/Out`) y a `CreateWeaponRequest`/`CreateArmorRequest` (`Messages/Catalog/In/CreateCatalogRequests.cs`). TypeScript: `src/types/index.ts:328-368` y `src/api/catalog.ts:4-26`.

### 5.2 Mapa de `RuleSet` de las opciones existentes (UPDATE en la migración de esquema)
| Categoría | `shared` (usadas por ambos) | siguen `stormlight` |
|---|---|---|
| weapon_type | 1, 2, 3 | — |
| skill | 10-27 | — |
| damage_type | 30, 31, 32 | — |
| range | 40, 42, 43, 44, 46 | 41, 45 |
| weapon_trait | 50, 51, 52, 53, 54, 56, 57, 58, 60, 61, 62, 64 | 55, 59, 63 |
| armor_type | 70, 71, 73, 74 | 72, 75, 76, 77 |
| armor_trait | 80, 81, 82, 83, 85 | 84 |
Las opciones `shared` que el seed tiene con descripciones imprecisas (p. ej. Defensiva «Puede usarse para bloquear ataques», Frágil «Puede romperse con un uso brusco», Peligrosa «Puede causar daño al propio portador», Perforante «Ignora parte del desvío») pueden reescribirse con la regla literal del libro (L.257 / PDF 263), que coincide con el texto de Tormentas verificado para Defensiva y Perforante. Es opcional y mejora ambos sets.

### 5.3 Rangos de ids de `CatalogOptions` (PK global, por tanto únicos entre categorías)
Ocupados (seed): 1-3, 10-27, 30-32, 40-46, 50-64, 70-77, 80-85. Huecos reales: 4-9, 28-29, 33-39, 47-49, 65-69, 78-79, 86-99. El pedido de «weapon_trait 65+ y armor_trait 86+» **solo cabe parcialmente**: weapon_trait tiene 5 huecos (65-69) y necesito 11 ids, así que el resto va a 110+.
| Bloque | Categoría | Ids nuevos |
|---|---|---|
| 4 | weapon_type | 4 Armas de fuego (opcional) |
| 28-29 | skill | reservados Alomancia, Feruquimia (opcional) |
| 33-34 | damage_type | Energía, Vital |
| 47-49 | range | 6/18, 6/24, 6/12 |
| 65-69 | weapon_trait | Cargada [1], [2], [4], [6], [20] |
| 78-79 | armor_type | Capa de bruma, Gabán de bruma |
| 86 | armor_trait | Frágil |
| 100-109 | range (reservado Mistborn) | 100 Cuerpo a Cuerpo [+1,5] |
| 110-129 | weapon_trait (reservado Mistborn) | 110-115 (sección 3.2) |
| 140-149 | armor_type (reservado Mistborn) | 140, 141 |
Regla para futuros sets: bloques de 100 por set (Mistborn 100-199, siguiente set 200-299).

### 5.4 Precios con rango y moneda
- `Price`/`Weight` guardan el **mínimo**; el rango va a `Description` (convención del seed). Alternativa [inferido]: `PriceMax double NULL` y `WeightMax double NULL`; no es necesaria para el seed.
- La unidad de `Price` depende del set de la fila: `mc` (stormlight) o `ar` (mistborn). Sin conversión entre sets (los precios no son proporcionales: p. ej. Anestésico 75 mc vs 30 ar, Escalera 5 mc vs 10 ar).

---

## 6. Seed de Mistborn: contrato para la migración

### 6.1 Orden de migraciones
1. `AddRuleSetToCatalog` (esquema + `UPDATE CatalogOptions SET "RuleSet"='shared' WHERE "Id" IN (...)` de 5.2).
2. `SeedMistbornCatalog` (inserts, sección 6.2-6.4). **No** debe empezar con `DELETE FROM` como el seed original (borraría Tormentas y los objetos propios). `Down` borra solo `WHERE "RuleSet"='mistborn'`.
Hay trabajo sin commitear de otra sesión en `CharacterService.cs`, `TalentosReglas.cs`, `CharacterResponse.cs`, `FormasCantor.cs`: este catálogo es independiente, pero generar ambas migraciones con `dotnet ef migrations add` en orden y con la API parada para que el snapshot no se pise.

### 6.2 Opciones nuevas (`CatalogOptions`, `RuleSet` indicado)
```
(4,'weapon_type','Armas de fuego','Armas de pólvora de la Era 2','mistborn')            -- opcional
(33,'damage_type','Energía','Calor y energía. El desvío lo reduce','shared')
(34,'damage_type','Vital','Constitución: venenos, asfixia, frío. El desvío no lo reduce','shared')
(47,'range','A Distancia 6/18','Alcance corto 6 m / máximo 18 m','mistborn')
(48,'range','A Distancia 6/24','Alcance corto 6 m / máximo 24 m','mistborn')
(49,'range','A Distancia 6/12','Alcance corto 6 m / máximo 12 m','mistborn')
(100,'range','Cuerpo a Cuerpo [+1,5]','Suma 1,5 m a tu cercanía','mistborn')
(65..69,'weapon_trait','Cargada [1]|[2]|[4]|[6]|[20]', definición 3.2,'mistborn')
(110,'weapon_trait','Explosiva [5]',...) (111 [9]) (112 [10]) (113 'Desechable') (114 'Arrojadiza [6/18]') (115 'Voluminosa [6]')
(78,'armor_type','Capa de bruma','Capa característica de los nacidos de la bruma','mistborn')
(79,'armor_type','Gabán de bruma','Abrigo de la Era 2 en homenaje a la capa','mistborn')
(140,'armor_type','Coraza de cerámica','Coraza no metálica','mistborn')
(141,'armor_type','Armadura de madera','Armadura no metálica','mistborn')
(86,'armor_trait','Frágil','La DJ puede gastar C para que se rompa','mistborn')
```

### 6.3 Armas (`WeaponCatalog`; columnas `Id, Name, WeaponTypeId, SkillId, DamageDiceCount, DamageDiceValue, DamageTypeId, RangeId, TraitIds, ExpertTraitIds, IsCustom=false, Description, Weight, Price, Era, IsRewardOnly, RuleSet='mistborn'`)
Clave: tipo 1 ligero / 2 pesado / 3 especial / 4 fuego (o 3 si no se crea el 4); skill 11 ligero, 12 pesado, 13 Atletismo; daño 30 laceración / 31 golpe; alcance 40 CC, 100 CC[+1,5], 42 (24/96), 43 (9/36), 44 (30/120), 46 (45/180), 47 (6/18), 48 (6/24), 49 (6/12).
| id | Nombre | tipo | skill | dados | daño | alcance | TraitIds | ExpertTraitIds | kg | Price | Era |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1001 | Bastón de madera | 1 | 11 | 1d6 | 31 | 40 | 50,51 | 53 | 2 | 5 | |
| 1002 | Cuchillo | 1 | 11 | 1d4 | 30 | 40 | 50 | 54,114 | 0,5 | 2 | |
| 1003 | Daga de cristal | 1 | 11 | 1d4 | 30 | 40 | 50,61 | 54,114 | 0,25 | 50 | |
| 1004 | Espada lateral | 1 | 11 | 1d6 | 30 | 40 | 52 | 54 | 1 | 15 | |
| 1005 | Lanza corta | 1 | 11 | 1d8 | 30 | 40 | 51 | 57 | 1,5 | 5 | |
| 1006 | Maza | 1 | 11 | 1d6 | 31 | 40 | (vacío) | 58 | 1,5 | 10 | |
| 1007 | Arco corto | 1 | 11 | 1d6 | 30 | 42 | 51 | 52 | 1 | 40 | |
| 1008 | Honda | 1 | 11 | 1d4 | 31 | 43 | 50 | 56 | 0,5 | 1 | |
| 1009 | Alabarda | 2 | 12 | 1d10 | 30 | 40 | 51 | 57 | 2,5 | 20 | |
| 1010 | Escudo | 2 | 12 | 1d4 | 31 | 40 | 53 | 54 | 1 | 5 | |
| 1011 | Escudo de madera | 2 | 12 | 1d6 | 31 | 40 | 53,51 | 57 | 2 | 50 | |
| 1012 | Espada larga | 2 | 12 | 1d8 | 30 | 40 | 52,51 | 57 | 1,5 | 30 | |
| 1013 | Hacha | 2 | 12 | 1d6 | 30 | 40 | 114 | 54 | 1 | 10 | |
| 1014 | Hacha de obsidiana | 2 | 12 | 1d6 | 30 | 40 | 61 | 54 | 0,5 | 100 | |
| 1015 | Lanza larga | 2 | 12 | 1d8 | 30 | 100 | 51 | 53 | 4,5 | 20 | |
| 1016 | Martillo | 2 | 12 | 1d10 | 31 | 40 | 51 | 58 | 4 | 30 | |
| 1017 | Arco largo | 2 | 12 | 1d6 | 30 | 46 | 51 | 56 | 1,5 | 75 | |
| 1018 | Ballesta | 2 | 12 | 1d8 | 30 | 44 | 65,51 | 60 | 3,5 | 100 | |
| 1019 | Arma improvisada | 3 | 10 | 0d0 | 31 | 40 | 61,57 | 57 | 0 | NULL | |
| 1020 | Ataque sin armas | 3 | 13 | 0d0 | 31 | 40 | 57 | 58,54 | 0 | NULL | |
| 1021 | Bastón de duelo | 3 | 12 | 1d8 | 31 | 40 | 50,57 | 54 | 1,5 | 40 | |
| 1022 | Hoja koloss | 3 | 12 | 1d12 | 31 | 100 | 115,64,60,51,57 | 57 | 100 | NULL (IsRewardOnly) | |
| 1023 | Palo de ruido | 3 | 11 | 1d4 | 31 | 40 | 61,57 | 54 | 0,25 | 100 | |
| 1024 | Granada de fragmentación | 4 | 11 | 2d4 | 30 | 47 | 110,64,62,113,114 | 57 | 0,25 | 75 | 2 |
| 1025 | Fusil de caza | 4 | 11 | 1d8 | 30 | 46 | 65,62,51 | 57 | 2,5 | 400 | 2 |
| 1026 | Pistola de bota | 4 | 11 | 1d4 | 30 | 49 | 50,65,62 | 52 | 0,25 | 125 | 2 |
| 1027 | Pistola de cañón corto | 4 | 11 | 1d4 | 30 | 47 | 68,62 | 50,54 | 0,5 | 175 | 2 |
| 1028 | Revólver | 4 | 11 | 1d6 | 30 | 48 | 68,62,51 | 57 | 0,5 | 250 | 2 |
| 1029 | Granada de conmoción | 4 | 12 | 2d6 | 31 | 47 | 112,64,113,114 | 57 | 0,25 | 50 | 2 |
| 1030 | Cañón de mano | 4 | 12 | 1d8 | 30 | 48 | 68,62,51 | 57 | 1 | 300 | 2 |
| 1031 | Carabina | 4 | 12 | 1d8 | 30 | 42 | 67,62,51 | 57 | 3,5 | 750 | 2 |
| 1032 | Escopeta | 4 | 12 | 1d10 | 30 | 47 | 64,66,62,51 | 110 | 3,5 | 600 | 2 |
| 1033 | Fusil de cerrojo | 4 | 12 | 1d10 | 30 | 46 | 65,62,51 | 57 | 4,5 | 600 | 2 |
| 1034 | Dinamita (1 cartucho) | 4 | 12 | 4d6 | 31 | 40 | 111,64,113,114,57 | 57 | 0,25 | 100 | 2 |
| 1035 | Ametralladora rotatoria | 4 | 12 | 3d4 | 30 | 47 | 115,64,69,62,51,57 | 57 | 85 | 2500 | 2 |
Notas de modelado:
- «Arma improvisada» y «Ataque sin armas»: `0d0` y sin precio, igual que ids 19 y 20 del seed (`SeedCatalogData.cs:105-106`). `SkillId` 10 (Agilidad) es el marcador del seed para «misma que un arma similar» [inferido]; el daño real se explica en `Description`.
- «Bastón de duelo» usa 12 pero admite también Armamento ligero («Flexibilidad en combate»): decirlo en `Description` [inferido: un solo `SkillId` por fila].
- Los rasgos de experto «Única: ...» llevan 57 y el texto literal en `Description` (p. ej. Fusil de caza: «Con pericia, Cargada [3] en lugar de [1]»).
- Los precios de armas de fuego y de la daga/hacha de obsidiana son los impresos (la daga de cristal cuesta 50 ar, mucho más que el cuchillo, por ser inerte).
- `IsRewardOnly=true` solo en Hoja koloss (armas) y en Capa y Gabán de bruma (armaduras).

### 6.4 Armaduras (`ArmorCatalog`; ids 1001-1008)
| id | Nombre | ArmorTypeId | Desvío | TraitIds | ExpertTraitIds | kg | Price | Era |
|---|---|---|---|---|---|---|---|---|
| 1001 | Uniforme | 70 | 0 | 80 | (vacío) | 2,5 | 20 | |
| 1002 | Capa de bruma | 78 | 0 | 85 | 85 | 2,5 | NULL (reward) | |
| 1003 | Cuero | 71 | 1 | (vacío) | 80 | 5 | 30 | |
| 1004 | Gabán de bruma | 79 | 1 | 80,85 | 85 | 5 | NULL (reward) | 2 |
| 1005 | Coraza | 73 | 2 | 81 | 80 | 15 | 50 | |
| 1006 | Coraza de cerámica | 140 | 2 | 81,86 | 85 | 10 | 250 | |
| 1007 | Armadura de placas y malla | 74 | 3 | 82 | 85 | 20 | 200 | |
| 1008 | Armadura de madera | 141 | 3 | 83,86 | 85 | 15 | 1000 | |
Nota: el seed de Tormentas ya tiene Uniforme (1), Cuero (2), Coraza (4) y Placas y malla (5) con los mismos desvío, rasgos y pesos; no tiene Malla de Mistborn (Malla, Armadura completa y esquirladas son solo de Tormentas).

### 6.5 Equipo y viales (`GearItems`)
Columnas: `Id, Name, Weight, Price, Description, RuleSet='mistborn', Era, IsRewardOnly, Category`. Filas de las secciones 2.7 (1001-1071) y 2.8 (1072-1084, `Category='vial'`). Sillalibre (1059) y viales con `Era` indicado. Sin filas de «Gema infusa», «Linterna (esfera)» (son de Tormentas) ni de «Botella (crem)» (en Mistborn es «Botella (cerámica)»).

### 6.6 Final de la migración (secuencias)
```sql
SELECT setval(pg_get_serial_sequence('"WeaponCatalog"','Id'), (SELECT MAX("Id") FROM "WeaponCatalog"));
SELECT setval(pg_get_serial_sequence('"ArmorCatalog"','Id'),  (SELECT MAX("Id") FROM "ArmorCatalog"));
SELECT setval(pg_get_serial_sequence('"GearItems"','Id'),     (SELECT MAX("Id") FROM "GearItems"));
```
Con ids 1001+ y `setval` a MAX, los objetos propios nuevos nacen en 1085+ (equipo no admite alta) y se evita el choque de la sección 1.4.

---

## 7. Cómo filtrar `GET /catalog` por set de reglas

### 7.1 Contrato
- Nuevo parámetro `campaignId` en **todas** las rutas de `CatalogController`: `GET weapons|armor|gear|options/{category}`, `POST weapons|armor`, `DELETE weapons|armor/{id}`, `PUT {weapons|armor|gear}/{id}/description`.
- El servidor busca la campaña, comprueba pertenencia (el patrón `EnsureMember` ya existe en los demás servicios, sin helper común) y deriva `ruleSet` y `era`. No se acepta `ruleSet` del cliente (evita falsearlo).
- Sin `campaignId`: se asume `ruleSet='stormlight'` y no se filtra por era (el cliente actual sigue funcionando).
- Filtro de objetos: `RuleSet = @set AND (Era IS NULL OR @era IS NULL OR Era = @era)`. Con campaña «entre eras» o mixta, `@era = NULL` devuelve ambas.
- Filtro de opciones: `RuleSet IN ('shared', @set)`. Debe devolver **todas** las opciones que referencian los objetos devueltos (la UI resuelve id → nombre solo con ese listado).
- Respuestas: añadir `ruleSet`, `era` (number|null), `price` (number|null), `isRewardOnly`. `GearItem.price` sigue siendo número.
- Alta: `CreateWeaponRequest/CreateArmorRequest` ganan `campaignId`; el servidor fija `RuleSet` de la fila al de la campaña y `IsCustom=true`.
- **Autorización** (corregir de paso, defecto previo de `CatalogController.cs:11-13`): crear, borrar y editar descripciones debería exigir ser GM de esa campaña (`IsGm`), no solo `[Authorize]`. Hoy un jugador de otra campaña puede borrar un arma propia ajena.
- Mixto Tormentas + Nacidos de la Bruma (el libro lo permite, L.374-375 / PDF 380-381): fuera del alcance v1. Si se hace, devolver la unión con **deduplicación por nombre priorizando el set principal de la campaña**, porque los inventarios guardan nombres y los nombres coinciden entre sets («Cuchillo», «Arco corto»...).

### 7.2 Frontend
- `catalogApi.getWeapons/getArmor/getGear/getOptions` aceptan `campaignId` (de `campaignStore`).
- **Unificar las claves de caché** y meter la campaña: `['catalog','weapons',cId]`, `['catalog','armor',cId]`, `['catalog','gear',cId]`, `['catalog','opts',cId,category]`. Hoy `CatalogPage` (`:881-892`) y `BolsaDetailPage` (`:160-170`) usan claves distintas, y al cambiar de campaña de set las claves sin `cId` servirían datos del set anterior (`staleTime` 30 s).
- Invalidar `['catalog']` entero tras crear, borrar o editar descripción.
- Los `Map<id,nombre>` (`CatalogPage.tsx:38-48`) siguen valiendo porque la API ya filtra.
- `getOptions` pide hoy 7 categorías por pantalla; con el filtro por set no cambia, pero conviene un único endpoint `GET /catalog/options?campaignId=` que las devuelva agrupadas (optimización opcional [inferido]).

---

## 8. Objetos compartidos: duplicar por set o marcar «ambos»

**Recomendación: duplicar las filas de objetos por set; `'shared'` solo para opciones.**
Evidencia (comparación fila a fila con el seed de Tormentas):
- **Armas**: 16 de las 25 armas de Tormentas coinciden en daño, tipo, alcance, rasgos y peso con una de Mistborn (14 con nombre propio: Arco corto, Bastón≈Bastón de madera, Cuchillo, Espada lateral, Honda, Lanza corta, Maza, Alabarda, Arco largo, Ballesta, Escudo, Espada larga, Hacha, Martillo; más Arma improvisada y Ataque sin armas) y **los pesos coinciden en todas** (`AddWeightToCatalog.cs`). Pero: la Lanza larga difiere en alcance base (Mistborn `Cuerpo a Cuerpo [+1,5]`); los rasgos parametrizados son **ids distintos** (Ballesta: Tormentas `ARRAY[59,51]` con `Cargada` sin valor; Mistborn `[65,51]`; Cuchillo/Hacha: `Arrojadiza` 55 frente a `Arrojadiza [6/18]` 114); y Tormentas no tiene precio en BD. Solo en Tormentas (8): Espada ropera, Jabalina, Mandoble, Gran arco, Hoja esquirlada, Hoja esquirlada (Radiante), Martillo de guerra, Semiesquirla.
- **Armaduras**: Uniforme, Cuero, Coraza y Placas y malla coinciden (desvío, rasgos, pesos). No existen en Mistborn Malla, Armadura completa, Esquirladas. Mistborn añade 4.
- **Equipo**: de los 68 objetos del seed, 65 tienen un objeto del mismo nombre en Mistborn (faltan Gema infusa, Linterna (esfera) y Botella (crem), que en Mistborn es Botella (cerámica)); Mistborn añade 6 (Arena metálica, Botella (cerámica), Nudilleras, Ropa (de apertura rápida), Sillalibre, Tónica) y los 13 viales. **Solo 4 de esos 65 coinciden en peso y precio** (Arcón 12,5 kg/30, Pala 2,5/8, Pico 5/10, Suministros quirúrgicos 1,5/20). El resto difiere en precio, normalmente a la baja en arquillas (Aceite 1 mc → 0,5 ar, Anestésico 75 → 30), pero no de forma proporcional (Escalera 5 → 10, Lupa 5 → 200, Cera también cambia de peso, 0,1 → 0,25 kg).
- Moneda distinta por set: un `Price` único no sirve para filas compartidas.
- Descripciones editables por el GM: son por fila y globales hoy; compartir fila haría que un GM de Mistborn edite lo que ve Tormentas.
Por tanto: **duplicar** (coste ≈ 35 armas + 8 armaduras + 84 equipo de seed, nada de lógica nueva) y filtrar por `RuleSet`. Las opciones `shared` (5.2) evitan duplicar habilidades, tipos, alcances base y rasgos no parametrizados.
Alternativa descartada: columna `RuleSets text[]` con `'both'`: ahorra ~20 filas pero obliga a un `Price` por set (dos columnas) y acopla descripciones.

Consecuencia para inventarios: el personaje guarda **nombres**. Con un set por campaña, el nombre se resuelve dentro del catálogo filtrado y no hay ambigüedad. Aun así, si algún día se mezclan sets, la referencia por nombre debe migrar a id (fuera de este alcance).

---

## 9. Cambios de UI

### 9.1 Precios y moneda
- `CatalogPage.tsx:150-157` `Price`: recibir `currency: 'mc' | 'ar'` (del `ruleSet` de la campaña). Para `ar`: texto `0,05 ar` con coma decimal (`toLocaleString('es-ES', { maximumFractionDigits: 2 })`; hoy imprime `{value}` crudo, con punto) y **sin** la esfera marco. Ícono: ilustración oficial extraída del libro (2.1) o, mientras no exista el asset, `Coins` de Lucide (jerarquía del proyecto: libro > Lucide > nunca casero).
- Assets nuevos sugeridos en `src/assets/cosmere/img/`: `arquillas-era1.webp` (bolsa de monedas) y `arquillas-era2.webp` (cartera con billetes), recortados de PDF 260 con la transparencia del soft mask; registrar en `lib/cosmereAssets.ts` (comentario de nombres, `:37`). El fondo `SPHERE` de `:36` se usa solo si `currency==='mc'`.
- Mostrar precio también en **armas y armaduras** (hoy solo equipo): tile «Precio» en el detalle (`:340`, `:364`) y en la tarjeta. `price == null`: ocultar (Tormentas) o «Solo recompensa» si `isRewardOnly`. Usar chip de insignia para «Era 2» (el libro marca las filas con etiquetas ERA 1 / ERA 2) tanto en tarjetas como en el detalle.
- Rango de precio: el texto del rango está en `description`; mostrar «desde X ar» cuando la descripción lo indique no es necesario; basta con el mínimo.
- Alcance `Cuerpo a Cuerpo [+1,5]` y `A Distancia 6/18` se muestran con el nombre de la opción (sin cambios de código).
- Formulario de arma/armadura propia (`CatalogPage.tsx:686-870`): añadir campo `Precio` (y `Solo recompensa`), y reaprovechar las opciones filtradas por set. Pasar `campaignId`.
- Pestaña nueva opcional «Viajes» (alojamiento, monturas, vehículos): datos estáticos en `src/data/` (2.9), no en catálogo.
- Viales: agruparlos con `Category='vial'` en la pestaña Equipo (chip de filtro «Viales»).

### 9.2 Bolsa del personaje (`BolsaDetailPage.tsx`)
- Sustituir la sección «Marcos» (`:332-429`, infusas/opacas) por «**Arquillas**» cuando el set es Nacidos de la Bruma: un solo número (puede tener decimales: el óbolo vale 0,01), sin estado «infusa/apagada». Reutilizar `Stepper`. El campo de personaje (`arquillas`, decimal con 2 decimales) lo define el módulo de ficha; este informe solo exige que exista [contrato con el agente de ficha].
- `getCapacity` (`:233-241`): tabla por set. **Mistborn**: Fuerza 0 → 25 kg; 1-2 → 50; 3-4 → 125; 5-6 → 250; 7-8 → 1250; 9+ → 2500 (cap. 3, L.50 / PDF 56, «Capacidad de levantamiento y de carga»; capacidad de levantamiento 50/100/250/500/2500/5000 kg). Tormentas (actual): 22,5/45/112,5/225/1125/2250. Parametrizar por set.
- Picker (`:612-660`): con 35 armas y 84 objetos hace falta **búsqueda** (input) y chips de subcategoría: armas (ligeras, pesadas, especiales, fuego), equipo (viales, resto). Mostrar precio además del peso. Ocultar en el picker los `isRewardOnly` (se obtienen por recompensa; el GM podría añadirlos desde otra vía [inferido]).
- Detalle de objeto: mostrar precio y era.
- Peso: los viales (0,1 kg) cuentan; las arquillas **no** pesan (el libro no les da peso) [inferido].
- Voluminosa [X] (rasgo): la regla exige Fuerza ≥ X (arma: desventaja en ataques y Ralentizado; armadura: Ralentizado y desventaja en pruebas de Velocidad, L.266 / PDF 272). Mostrar aviso en el detalle comparando con `character.fuerza` es opcional y ya compatible con los nombres de rasgo.

### 9.3 Equipo inicial por paquetes
Hoy no existe equipo inicial en el frontend (grep de `equipo inicial`/`startingEquip` sin resultados). Propuesta: fichero estático `src/data/mistbornEquipoInicial.ts` (el dato es de reglas, igual que el resto de `src/data/*.ts`) con un tipo del estilo:
```
{ id, nombre, armas: [{ fijo?: nombreCatalogo, eleccion?: 'ligera'|'ligera-o-martillo'|'no-especial'|'bastón de duelo + ligera', era? }],
  armaduras: [nombre...], equipo: [{ nombre, cantidad }], dinero: { dados: '4d8', multiplicadorEra2: 10 } | null,
  beneficios: [{ tipo: 'meta'|'pericia'|'conexion'|'mente_de_metal', texto }] }
```
Flujo: al crear el personaje (paso 6), el jugador elige uno de los 7; el cliente tira los dados (usar el helper de `utils/dice.ts`), guarda el resultado en `arquillas` (x10 en Era 2) y añade los **nombres** a `weapons`, `armor` y `equipment` (los arrays son `text[]`: repetir el nombre N veces para cantidades; no hay campo de cantidad: limitación vigente, mejora futura). Las elecciones («arma ligera a tu elección») se resuelven con un picker filtrado por tipo y era. Los `beneficios` los consume el módulo de ficha (metas, pericias, conexiones). El catálogo solo debe garantizar que **todos los nombres existan** en el seed de Mistborn (sección 10 verifica cada uno).

---

## 10. Equipo inicial: las 7 opciones con contenido exacto (L.254-255 / PDF 260-261)
Paso 6 de la creación del personaje: se elige **uno**. Dinero en Era 1 = dados indicados; Era 2 = 10 x dados. Nombres entre `«»` = nombre exacto del catálogo propuesto (sección 6). **[inferido]** donde el libro usa una palabra distinta a la de la tabla.
| Paquete | Armas | Armadura | Equipo | Dinero (Era 1 / Era 2) | Beneficio |
|---|---|---|---|---|---|
| **Artesano** | «Martillo» **o** un arma ligera (a elección) | «Cuero» | «Arcón*» (el libro dice «cofre» [inferido]) con «Ropa (común)»; «Suministros quirúrgicos»; 5 dosis de antiséptico suave = «Antiséptico (débil, 5 dosis)» x1 [inferido]; «Cálamo»; «Tinta (vial de 30 ml)» ([inferido], el libro dice «frasco de tinta»); «Papel o pergamino (1 hoja)» x5; «Vela» x5; «Pedernal y acero»; «Botella (cristal)» x3 (vacías); «Diapasón»; «Instrumento musical» x1 (a elección); «Balanza» | 4d8 / 10 x 4d8 ar | — |
| **Bajos fondos** | dos armas ligeras | «Cuero» | «Mochila» con «Ropa (común)»; «Alcohol (botella)» (whisky); «Nudilleras»; «Palanca»; «Ganzúa»; «Cuerda (15 metros)»; «Pedernal y acero»; «Linterna (aceite)» ([inferido], el libro dice «lámpara de aceite»); «Aceite (1 frasco)»; «Comida (callejera, 1 día)» x5 | 1d20 / 10 x 1d20 ar | — |
| **Fugitivo** | ninguna | ninguna | «Ropa (raída)» | ninguno | **Ruptura**: sufriste la ruptura mucho antes; al adquirir el talento principal de un camino de nacido del metal con alomancia (nacido de la bruma, brumoso, nacidoble), en la creación o después, completas de inmediato su meta inicial «Entrenar tu(s) poder(es)» |
| **Guardador** | ninguna | ninguna | «Ropa (buena)» (túnica) | ninguno | **Mente de metal**: al adquirir el talento principal de un camino con feruquimia (ferrin, feruquimista, nacidoble) completas de inmediato su meta inicial «Fabricar tu(s) mente(s) de metal» |
| **Indagador** | «Cuchillo» (Era 1) **o** «Pistola de bota» (Era 2) | «Uniforme» | «Mochila» con «Ropa (común)»; «Cálamo»; «Tinta (vial de 30 ml)»; «Papel o pergamino (1 hoja)» x20 («hojas de papel» [inferido]); «Linterna (aceite)» ([inferido]); «Libro (referencia)» x1 (tema a elección, con visto bueno de la DJ); «Cerradura y llave» | 3d12 / 10 x 3d12 ar | **Pericia adicional**: obtienes la pericia de utilidad Literatura (si ya la tienes, otra cultural o de utilidad), adicional a las de la creación |
| **Mercenario** | un arma no especial ([inferido]: de las tablas ligero/pesado, sin las «Armas especiales») | «Uniforme» **y** «Coraza» | «Mochila» con «Ropa (común)»; «Odre»; «Lupa»; «Palanca»; «Grilletes»; «Comida (ración, 1 día)» x10 | 2d6 / 10 x 2d6 ar | — |
| **Noble** | «Bastón de duelo» y un arma ligera | ninguna | «Alcohol (botella)» (vino selecto o whisky); «Ropa (buena)» (ropa elegante [inferido]) | 4d20 / 10 x 4d20 ar | **Conexión**: patrocinador de tu casa noble (cap. 8 «Patrocinadores»): alojamiento y cierto nivel de vida |
Comprobación de nombres: todos los nombres de la tabla están en 2.2-2.7 y se insertan en el seed (sección 6), incluidos «Ropa (raída)», «Ropa (buena)», «Odre», «Grilletes», «Nudilleras» y «Libro (referencia)». «Bastón de duelo» (1021) es arma especial con pericia especializada; el paquete lo da sin pericia (la DJ decide, L.261 / PDF 267).
Dependencias de era: Indagador cambia de arma; el dinero se multiplica en Era 2; «Pistola de bota» solo existe en Era 2 (`Era=2`).
Esperanza matemática del dinero (útil para pruebas): Artesano 18, Bajos fondos 10,5, Indagador 19,5, Mercenario 7, Noble 42 (Era 1; x10 en Era 2).

---

## 11. Dudas, incoherencias del libro y riesgos

1. **Lupa 200 ar**: impreso así en PDF 275 (imagen verificada). El resto de precios de equipo son del orden de 0,1-50 ar; es posible una errata del libro. Se transcribe tal cual y se marca en `Description`.
2. **Secuencias de ids**: ver 1.4. El `setval` final de 6.6 es obligatorio. Verificar el estado real de la BD antes de aplicar.
3. **Duplicados de nombres con objetos propios**: no hay índice único; revisar si hay armas propias («IsCustom») con nombres de Mistborn (ej. «Revólver») antes de aplicar el seed [inferido].
4. **Mismo `Id` entre categorías**: `CatalogOptions.Id` es PK global; los bloques de 5.3 no colisionan con 1-85 (verificado contra el seed).
5. **`weapon_type` 4** y **ids 28-29 (Alomancia/Feruquimia)**: opcionales; decidir con el agente de ficha.
6. **«Un arma no especial»** (Mercenario): interpretación [inferido].
7. **Cofre / lámpara de aceite / frasco de tinta / antiséptico suave**: sin equivalente exacto de nombre en la tabla; mapeo [inferido] en la sección 10.
8. **Precio de aluminio/duraluminio en Era 1** (viales sí, manufactura «No disponible»): se sigue la tabla de viales.
9. **Peso de viales de metal**: no figura; 0,1 kg [inferido].
10. **Precios de armas de Tormentas** existen en el libro (mc) pero no en BD; tras añadir `Price` podrían rellenarse, fuera de este alcance.
11. **Descripciones de rasgos compartidos** (5.2): reescribirlas modifica también Tormentas; decisión del dueño del producto.
12. **Autorización del catálogo** (7.1) es un defecto previo; la corrección encaja con el filtro por campaña, pero cambia el comportamiento actual para jugadores no GM.
13. **Cantidades en inventario** (equipo inicial x5 velas): no hay campo; se repiten nombres. Mejora futura.
14. **Cap. 3 capacidad de carga**: el número de Mistborn (25/50/125/250/1250/2500) difiere del implementado (22,5/...); verificado en L.50 / PDF 56.
15. **Efigies/arte**: las ilustraciones de armas del libro (daga de cristal, honda...) no se usan hoy en la app (se usan íconos); fuera de alcance.
