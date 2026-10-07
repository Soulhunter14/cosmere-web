# Contrato del motor de reglas del servidor (cosmere-api) y puntos de enganche para un set de reglas

Lectura de solo lectura del repo `C:\Users\xavie\Documents\Repositories\personal\cosmere-api` (árbol de trabajo con WIP sin commitear).
Todas las rutas son relativas a ese repo salvo que se indique lo contrario. Formato de cita: `archivo:línea` para código y
`L.<página libro> / PDF <página>` para el manual de Nacidos de la Bruma (PDF = libro + 6).
Marca **[inferido]** = deducción mía, no verificada en código ni en libro. Sin marca = verificado leyendo el fichero citado.

---

## 0. Resumen ejecutivo (leer primero)

1. **Todo el cálculo de estadísticas derivadas vive en un único método estático**: `CharacterService.MapToResponse` (`Services/Characters/CharacterService.cs:310-407`)
   más el registro estático de talentos `TalentosReglas` (`Services/Characters/TalentosReglas.cs`). No hay tests, ni estrategia, ni nada por campaña.
2. **Las fórmulas base de Nacidos de la Bruma son idénticas a las de Archivo de las Tormentas** (verificado contra el manual):
   salud (tabla de progreso, L.29 / PDF 35), concentración `2 + Voluntad` (L.26 / PDF 32), defensas `10 + attr1 + attr2` (L.26 / PDF 32 y L.53 / PDF 59),
   Investidura `2 + max(Discernimiento, Presencia)` (L.26 / PDF 32), tabla de movimiento (L.51 / PDF 57), dado de recuperación (L.52 / PDF 58),
   rangos 1-5 por niveles 1-5/6-10/11-15/16-20/21+ (L.27 / PDF 33). **Lo único que cambia en el motor numérico es la CONDICIÓN para tener Investidura**
   (hoy `CaminoRadiante != ""`, en Nacidos de la Bruma "camino alomántico": brumoso, nacido de la bruma, nacidoble; L.26 / PDF 32).
3. Lo que SÍ difiere y requiere enganche por set: (a) listas de validación (`ValidCaminosHeroicos/Radiantes/Ascendencias`, `CharacterService.cs:12-33`),
   (b) registro de talentos con regla numérica (`TalentosReglas.Reglas`, `:56-162`), (c) la fuente de bonos de atributo temporales/permanentes
   (hoy formas de cantor `FormasCantor`; en Nacidos de la Bruma Bendiciones kandra y "Tamaño desmedido"), (d) bloque nuevo de derivados de artes metálicas
   (límite/dado/alcance por grados de Alomancia/Feruquimia, cargas máx. de mente de metal) que **no existe** en el motor.
4. **No hay patrón de "estrategia por campaña" en DI**: todo es `AddScoped<IX, X>` plano (`Services/Bootstrap.cs:19-35`); los servicios reciben `campaignId`/`userId`
   por parámetro y re-consultan la BD. La campaña **no tiene** campo de set de reglas (`Messages/Database/Entities/CampaignEntity.cs:3-17`).
5. **Estado del WIP (formas de cantor)**: toca exactamente 4 ficheros del motor; el contrato propuesto aquí se diseña con parámetros opcionales para no pisarlo (§1.9 y §5.5).
6. Mayor riesgo de migración: ninguno de datos (columna nueva con `DEFAULT 'stormlight'`); el riesgo real es de **regresión silenciosa** del cálculo de Tormentas
   (no hay tests) y de **colisión con el WIP** (§7).

---

## 1. Flujo completo de `MapToResponse`

### 1.1 Entrada, salida y llamadas

`internal static CharacterResponse MapToResponse(CharacterEntity c, ContextoJuego? ctx = null)` — `CharacterService.cs:310`. Se llama desde:

| Llamada | Línea | Contexto |
|---|---|---|
| `GetCharactersAsync` | `:47` | `entities.Select(c => MapToResponse(c, new ContextoJuego()))`; un `ContextoJuego` nuevo por personaje (siempre `EnCombate=false`) |
| `GetCharacterAsync` | `:63` | recibe `ctx` del controlador (`CharactersController.cs:24-26` crea `new ContextoJuego { EnCombate = enCombate }` desde `?enCombate=`) |
| `CreateCharacterAsync` | `:96` | sin `ctx` (cae a `new ContextoJuego()` en `:312`) |
| `UpdateCharacterAsync` | `:122` | sin `ctx` |
| `AssignCharacterAsync` | `:154` | sin `ctx` |

Nota: crear/actualizar/asignar **no** pasan `EnCombate`; la respuesta de un PUT siempre es "fuera de combate". No hay otra llamada a `MapToResponse` en todo el repo
(grep: solo `CharacterService.cs`; los demás `MapToResponse` de otros servicios son métodos privados homónimos sin relación).

### 1.2 Pasos, en orden (`CharacterService.cs:310-407`)

| # | Qué hace | Línea |
|---|---|---|
| 1 | `ctx ??= new ContextoJuego()` | `:312` |
| 2 | `talentos = ParseTalentos(c.Talentos)`: `Talentos` es un `text` con un array JSON de nombres; vacío/invalid → `[]` (el `catch` se traga cualquier error) | `:313`, `:303-308` |
| 3 | `forma = FormasCantor.EsCantor(c.Ascendencia) ? FormasCantor.FormaActiva(talentos) : null` (WIP) | `:314` |
| 4 | `fb = FormasCantor.BonosActivos(c.Ascendencia, talentos)` (WIP; `BonosForma` con 8 campos) | `:315` |
| 5 | `velEff = c.Velocidad + fb.Velocidad` | `:316` |
| 6 | `desvio = BuildDesvioLineas(c, fb, forma)` (WIP) | `:317`, `:288-301` |
| 7 | Copia directa de campos "no calculados" (identidad, atributos, `MaxHealth`, `Desvio`, `Marcos*`, 18 habilidades, 6 habilidades personalizadas, roleplay, equipo, metas, fechas) | `:321-333`, `:382-405` |
| 8 | Ocho llamadas a `TalentosReglas.Calcular(...)` (una por `StatDesglose`) | `:336-379` |

Los campos obsoletos `MaxConcentration`/`MaxInvestiture` se copian tal cual con `#pragma warning disable CS0618` (`:328-331`); **no intervienen en ningún cálculo**
(comentario `:203-204`).

### 1.3 Contrato de salida: los 8 `StatDesglose`

Tipos en `Messages/Characters/Out/StatDesglose.cs:3-16` y `CharacterResponse.cs:35-45`. JSON en camelCase (valor por defecto de ASP.NET; `Program.cs:67` no lo cambia).

```
StatLinea    { concepto: string, valor: number (double), descripcionCondicion: string|null }
StatDesglose { total: number, unidad: string|null ("m" en movimiento; null = entero), lineas: StatLinea[] (suman), situacional: StatLinea[] (NO suman) }
```
`Total = lineas.Sum(l => l.Valor)` (`TalentosReglas.cs:205`). Las líneas base van primero y después las de talentos (en el orden de inserción del
diccionario `Reglas`, **no** en el orden en que el personaje tiene los talentos; `TalentosReglas.cs:182`).

| Propiedad de respuesta | `StatAfectada` | Líneas base (de dónde salen) | Línea |
|---|---|---|---|
| `concentracion` | `MaxConcentracion` | `Base`=2; `Voluntad`=c.Voluntad; + línea "Forma: X" = `fb.Voluntad + fb.Concentracion` si ≠0 | `:224-235`, `:336-339` |
| `defensaFisica` | `DefensaFisica` | `Base`=10; `Fuerza`; `Velocidad`; + "Forma: X" = `fb.Fuerza + fb.Velocidad` si ≠0 | `:212-222`, `:341-344` |
| `defensaCognitiva` | `DefensaCognitiva` | `Base`=10; `Intelecto`; `Voluntad`; + forma `fb.Intelecto + fb.Voluntad` | `:346-349` |
| `defensaEspiritual` | `DefensaEspiritual` | `Base`=10; `Discernimiento`; `Presencia`; + forma `fb.Discernimiento + fb.Presencia` | `:351-354` |
| `salud` | `MaxSalud` | `Base`=tabla de progreso; `Fuerza` (o `Fuerza ×N`); + forma `fueCount × fb.Fuerza` | `:261-282`, `:356-359` |
| `investidura` | `MaxInvestidura` | si `CaminoRadiante` vacío → una línea `Base`=0; si no → `Base`=2 + atributo mayor (DIS si `disEff >= preEff`) + forma | `:237-253`, `:361-364` |
| `movimiento` | `Movimiento` | una línea `Velocidad (v)` (o `Velocidad (v + bono de forma)`) = `MovimientoBase(velEff)`; `unidad:"m"` | `:366-374` |
| `desvioCalculado` (WIP) | `Desvio` | `Armadura: X` o `Base` = `c.Desvio`, o la línea de forma si es mayor; la perdedora va a `situacional` | `:288-301`, `:376-379` |

### 1.4 Fórmulas y tablas (todas verificadas en código)

**Salud máxima** — `BuildSaludLineas`, `CharacterService.cs:261-282`. Empieza `flat = 10`, `fueCount = 1`:

| Condición | Efecto | Línea |
|---|---|---|
| nivel ≥ 2 | `flat += (min(nivel,5) - 1) × 5` | `:269` |
| nivel ≥ 6 | `flat += (min(nivel,10) - 5) × 4`; `fueCount++` | `:270` |
| nivel ≥ 11 | `flat += (min(nivel,15) - 10) × 3`; `fueCount++` | `:271` |
| nivel ≥ 16 | `flat += (min(nivel,20) - 15) × 2`; `fueCount++` | `:272` |
| nivel ≥ 21 | `flat += nivel - 20` (sin Fuerza extra) | `:273` |

Líneas: `Base`=flat y `Fuerza` (o `Fuerza ×fueCount`) = `fueCount × Fuerza`. Coincide con la tabla "Progreso de los personajes" de Nacidos de la Bruma (L.29 / PDF 35):
nivel 1 `10+FUE`; niveles 2-5 `+5`; nivel 6 `+4+FUE`; 7-10 `+4`; 11 `+3+FUE`; 12-15 `+3`; 16 `+2+FUE`; 17-20 `+2`; 21+ `+1`. Ejemplo: nivel 6 → 34 + 2×FUE; nivel 21 → 76 + 4×FUE.
La columna `MaxHealth` (default 10, `CharacterEntity`) se guarda pero **no se usa** (la salud se recalcula siempre).

**Concentración máxima** — `Base 2 + Voluntad` (`:224-235`) + talentos. Idéntico en el libro (L.26 / PDF 32).

**Investidura máxima** — `BuildInvLineas` `:237-253`. Gate: `string.IsNullOrEmpty(c.CaminoRadiante)` (`:239`) → total 0. Si no: `2 + max(DIS, PRE)` con empate a Discernimiento (`:244`).
Mismo gate duplicado en `TalentosReglas.EsActiva` para `CondicionRegla.TieneInvestidura` (`TalentosReglas.cs:218`), que **hoy ninguna regla usa** (WIP cambió "Movimiento sin fricción" a `InfusoAbrasion`;
a HEAD sí la usaba). Investidura actual NO se persiste en el servidor (columnas retiradas por migraciones `DropConcentrationInvestiture` y `RemoveHealth`; ver `api_map.md` §2).
En el libro: Investidura máx. `2 + max(DIS,PRE)` solo con camino alomántico; **actual = 0 al crear** (L.26 / PDF 32).

**Defensas** — `10 + attr1 + attr2 [+ forma]` (`:212-222`); pares FUE+VEL, INT+VOL, DIS+PRE. Idéntico (L.26 / PDF 32).

**Movimiento** — `TalentosReglas.MovimientoBase(velocidad)` `TalentosReglas.cs:264-272` (metros por acción):

| Velocidad | 0 | 1-2 | 3-4 | 5-6 | 7-8 | 9+ |
|---|---|---|---|---|---|---|
| Metros | 6 | 7,5 | 9 | 12 | 18 | 24 |

Idéntica a la tabla de Nacidos de la Bruma (L.51 / PDF 57). Se evalúa con la **Velocidad efectiva** (`velEff`, incluye bono de forma).

**Desvío** (WIP) — `BuildDesvioLineas` `:288-301`: base = columna `Desvio` (la fija el cliente al equipar armadura; el servidor no la deriva del catálogo, `EquippedArmor` es solo un nombre).
Si la forma de cantor da `fb.Desvio > 0`, "no se acumula con la armadura: se usa el mayor" (comentario `:284-287`; Manual de Tormentas pp. 33-37).
**Esta regla "mayor de los dos" es específica de formas de cantor** y no debe generalizarse a Bendiciones kandra sin leer L.34-35 / PDF 40-41 [inferido que Fortaleza podría acumularse].

**Rango** — `TalentosReglas.Rango(level) = Clamp(ceil(level/5), 1, 5)` (`TalentosReglas.cs:237`, WIP; a HEAD era `Math.Ceiling(level/5.0)` sin clamp, así que a nivel 26 daba 6).
Mismo rango que el libro (niveles 21+ = rango 5; L.27 / PDF 33).

**Dado de recuperación, capacidad de levantamiento/carga, alcance de sentidos, conexiones**: **NO se calculan en el servidor**. El dado de recuperación está en el cliente
(`cosmere-web/src/utils/dice.ts:106-114`, tabla Voluntad → d4/d6/d8/d10/d12/d20, igual que L.52 / PDF 58) y el resto se pinta en `CharacterDetailPage.tsx` (~`:863-874`).
Las tablas de Nacidos de la Bruma de recuperación (L.52 / PDF 58), levantamiento (L.50 / PDF 56) y sentidos (L.52 / PDF 58) son las mismas que las de Tormentas [verificado para recuperación y movimiento; el resto no contrastado contra el código cliente].
Implicación: el set de reglas del servidor **no necesita** devolverlos; si se quisieran mover al servidor sería un cambio aparte.

### 1.5 `ContextoJuego` (`Services/Characters/ContextoJuego.cs`)

```csharp
public class ContextoJuego { public bool EnCombate { get; set; } = false; /* Futuro: PrimerRonda, PosturasActivas */ }
```
Solo se lee en `EsActiva` para `CondicionRegla.EnCombate` (`TalentosReglas.cs:222`). **Ninguna regla actual usa `EnCombate`.** Es el único canal "ambiental" hacia el motor.

### 1.6 Ejemplo trabajado (para validar una refactorización sin tests)

Personaje: nivel 7, FUE 2, VEL 3, INT 1, VOL 2, DIS 1, PRE 3, `CaminoRadiante="windrunners"`, talentos `["Robusto","Compostura","Investido"]`, sin armadura, sin forma.

| Stat | Líneas | Total |
|---|---|---|
| salud | Base 10+20+8=38; Fuerza ×2 = 4; Robusto (`PorNivel`×1) = 7 | **49** |
| concentracion | Base 2; Voluntad 2; Compostura (`PorRango`, rango=2) = 2 | **6** |
| defensaFisica / Cognitiva / Espiritual | 10+2+3 / 10+1+2 / 10+1+3 | **15 / 13 / 14** |
| investidura | Base 2; Presencia 3; Investido (`PorRango`) = 2 | **7** |
| movimiento | `Velocidad (3)` = 9 | **9 m** |
| desvioCalculado | Base = `c.Desvio` (0) | **0** |

Con el set Nacidos de la Bruma y `CaminoMetal="brumoso"` (decisión D1, §5.4) el resultado debe ser **idéntico**; con `CaminoMetal=""` la investidura sería 0 (+0 de "Investido" no aplicable si no se tiene el talento).

### 1.7 Cosas raras del flujo actual (a conservar o a saber)

- `Calcular` itera `Reglas` completo para cada una de las 8 stats y filtra `r.Stat == stat` (`TalentosReglas.cs:182-186`): coste O(8 × |Reglas|) por personaje; irrelevante a este tamaño.
- Coincidencia de talento = `talentos.Contains(nombre)` exacta, sensible a mayúsculas y tildes (`:184`). Los nombres de `Reglas` deben escribirse como en el libro.
- Los talentos que empiezan por `~forma~` se guardan en la misma lista (`FormasCantor.Prefijo`, `FormasCantor.cs:25`); `Calcular` los ignora porque no son claves de `Reglas`.
- `Presciencia` está registrada con lista vacía (`TalentosReglas.cs:98`): "no es numérico, se omite".
- `PorHabilidad` (WIP) lee solo las 18 habilidades fijas (`GradosDe`, `:240-261`) y **no** las 6 habilidades personalizadas; ver §2.5, importa para Alomancia/Feruquimia.
- Mapeo de nombres: `"Saber"` → `c.Conocimiento`, `"Armamento ligero"` → `c.ArmasLigeras`, `"Armamento pesado"` → `c.ArmasPesadas` (`:243-244, :253`). Mismos nombres que Nacidos de la Bruma (L.59-72 / PDF 65-78).

### 1.8 Quién lo consume (frontend)

El cliente recibe los 8 `StatDesglose` y los trata como solo lectura (`web_map.md` líneas 99, 205). `UpdateCharacterRequest` **no** contiene ninguno de los derivados (`CharacterRequest.cs:19-98`); por tanto cambiar su cálculo no rompe contrato de escritura.

### 1.9 Qué toca el WIP en esta zona (ver §8)

`MapToResponse` ya está modificado por el WIP (pasos 3-6 y 376-379). Cualquier cambio de este proyecto en `MapToResponse`, `Build*Lineas`, `TalentosReglas.Calcular` o `CharacterResponse`
choca con ese WIP salvo que se haga **después** de que se commitee o con cambios estrictamente aditivos (§5.5).

---

## 2. `TalentosReglas`: enums, `ReglaTalento`, `Calcular`, `EsActiva`, `ContextoJuego`

### 2.1 Enums (WIP; `TalentosReglas.cs:8-37`)

| Enum | Valores | Notas |
|---|---|---|
| `StatAfectada` | `MaxConcentracion, MaxInvestidura, MaxSalud, DefensaFisica, DefensaCognitiva, DefensaEspiritual, Desvio, Movimiento` | 8 valores = las 8 salidas de `MapToResponse`. `Desvio` lo añadió el WIP |
| `TipoFormula` | `Plana` (valor), `PorRango` (rango×valor), `PorNivel` (nivel×valor), `PorHabilidad` (grados×valor) | `PorHabilidad` lo añadió el WIP |
| `CondicionRegla` | `Siempre` (suma), `TieneInvestidura` (activa si `CaminoRadiante` ≠ ""), `LlevaArmaduraTipo` (activa si `EquippedArmor` contiene `TipoArmadura`, ignorando mayúsculas), `EnCombate` (activa con `ctx.EnCombate`), `EsPostura`, `EsReaccion`, `InfusoAbrasion` (WIP) | los tres últimos **siempre situacional** (no suman) |

### 2.2 `ReglaTalento` (`:41-50`)

```csharp
public class ReglaTalento {
    StatAfectada Stat; TipoFormula Formula; double Valor = 1; CondicionRegla Condicion = Siempre;
    string? TipoArmadura;           // para LlevaArmaduraTipo
    string? Habilidad;              // para PorHabilidad
    string? DescripcionCondicion;   // texto al jugador (campo descripcionCondicion de la línea)
}
```

### 2.3 Registro `TalentosReglas.Reglas` (`:56-162`)

`Dictionary<string, List<ReglaTalento>>` estático, clave = nombre del talento en español tal y como lo escribe el libro. 13 entradas:

| Talento | Efecto codificado | Líneas |
|---|---|---|
| Compostura | `MaxConcentracion` PorRango, Siempre | `:60-63` |
| Robusto | `MaxSalud` PorNivel, Siempre | `:65-68` |
| Serenidad | `DefensaCognitiva` y `DefensaEspiritual` +2, Siempre | `:70-74` |
| Paso firme | `Movimiento` +3, Siempre | `:76-79` |
| Vestimenta tradicional | Defensa física y espiritual +2 si lleva armadura "Presentable" | `:81-95` |
| Presciencia | vacía (no numérica) | `:98` |
| Mente ambiciosa (WIP) | `DefensaCognitiva` +2, Siempre | `:103-106` |
| Investido | `MaxInvestidura` PorRango, Siempre | `:110-113` |
| Movimiento sin fricción | `Movimiento` +3, `InfusoAbrasion` (siempre situacional) | `:119-127` |
| Posición de la enredadera | Def. física/cognitiva +1, `EsPostura` | `:131-135` |
| Posición de la sangre | Las 3 defensas −2, `EsPostura` | `:137-142` |
| Parada de tensión | Def. física +2, `EsReaccion` | `:146-149` |
| Réplica fulminante (WIP) | `Desvio` `PorHabilidad` "Disciplina", `EsReaccion` | `:153-161` |

Solapes con Nacidos de la Bruma (verificados contra el texto del manual):

| Talento | Texto en Nacidos de la Bruma | Cita |
|---|---|---|
| Robusto | "Obtienes +1 de salud máxima por nivel (incluyendo los niveles anteriores)" | L.80 / PDF 86 |
| Paso firme | "Tu valor de movimiento se incrementa en 3" | L.81 / PDF 87 |
| Serenidad | "Aumenta tus Defensas cognitiva y espiritual en 2" | L.89 / PDF 95 (también L.26 / PDF 32) |
| Compostura | concentración máx. y actual aumentan "en una cantidad equivalente a tu rango" | L.90 / PDF 96 |
| Investido | "tu Investidura máxima aumenta en el valor de tu rango" (talento propio de brumoso, nacido de la bruma y nacidoble, mismo texto) | L.136 / PDF 142 (brumoso); PDF 148 (nacido de la bruma); PDF 162 (nacidoble) |

Los números de página se calcularon contando saltos de página en `mistborn_flow.txt` (±1). "Vestimenta tradicional" no se ha buscado en el manual de Nacidos de la Bruma (en el texto solo aparece como descripción cultural terrisana, PDF ~71) [inferido que el talento homónimo es exclusivo de Tormentas].
El libro dice que los talentos homónimos de distintos caminos son el mismo talento (L.75 / PDF 81: "se considera que lo tienes en todos los caminos").
Por tanto el registro actual es **reutilizable tal cual** como núcleo común; solo hay que añadir entradas de Nacidos de la Bruma.

### 2.4 `Calcular` y `EsActiva` (`:170-224`)

```csharp
public static StatDesglose Calcular(StatAfectada stat, List<StatLinea> baseLineas, CharacterEntity c, ContextoJuego ctx,
                                    List<string> talentos, string? unidad = null, List<StatLinea>? situacionalBase = null)
```
Algoritmo: copia `baseLineas` a `lineas`; copia `situacionalBase` a `situacional`; para cada `(nombre, reglas)` de `Reglas` cuyo `nombre` esté en `talentos`, para cada regla con `Stat == stat`:
`valor = ComputeValor(regla, c)`; crea `StatLinea { Concepto = nombre, Valor = valor, DescripcionCondicion = regla.DescripcionCondicion }`; si `EsActiva` → `lineas`, si no → `situacional`. Devuelve `Total = lineas.Sum`.

`EsActiva` (`:214-224`): `Siempre`→true; `TieneInvestidura`→`CaminoRadiante` no vacío; `LlevaArmaduraTipo`→`EquippedArmor` contiene el tipo; `EnCombate`→`ctx.EnCombate`; resto→false.
`ComputeValor` (`:226-234`): `Plana`→Valor; `PorRango`→`Rango(c.Level)×Valor`; `PorNivel`→`c.Level×Valor`; `PorHabilidad`→`GradosDe(c, Habilidad)×Valor`.

### 2.5 Qué haría falta para añadir reglas de talentos de Nacidos de la Bruma

**Cabe en el modelo actual (sin cambiar enums), solo con entradas nuevas en un registro por set:**

| Talento / efecto (libro) | Entrada | Fuente |
|---|---|---|
| Resistencia koloss: "tu salud máxima aumenta en 1 por cada nivel" | `MaxSalud` `PorNivel` 1, `Siempre` | L.32-39; texto en el extracto: "Durante la creación del personaje y cada vez que subes de nivel, tu salud máxima y actual aumentan en 1" |
| Investido (brumoso / nacido de la bruma / nacidoble) | ya existe | L.136 / PDF 142 |
| Compostura, Robusto, Serenidad, Paso firme, Vestimenta tradicional | ya existen (caminos heroicos compartidos) | L.19 / PDF 25 |

**No cabe sin ampliar el motor:**

| Necesidad | Por qué no cabe | Propuesta mínima |
|---|---|---|
| Habilidades Alomancia (Voluntad) y Feruquimia (Intelecto) para `PorHabilidad` y derivados | `GradosDe` (`:240-261`) solo mira las 18 habilidades fijas; Alomancia/Feruquimia viven en `HabilidadPersonalizadaN` (nombre + valor + atributo) [inferido por el libro: "habilidades extra" L.402-405 / PDF 408] | `GradosDe` debe buscar también en `HabilidadPersonalizada1..6` por nombre exacto |
| Límite / dado / alcance de artes metálicas; cargas máx. de mente de metal (`2 + grados de Feruquimia`) | No son una `StatAfectada` numérica única, son un bloque por arte | Bloque nuevo en la respuesta (§5.3) |
| Atributo +N permanente (Tamaño desmedido: Fuerza +1; Bendiciones kandra; clavos hemalúrgicos) | Las reglas solo modifican derivados, no atributos; los bonos de atributo hoy entran por `BonosForma` | Reutilizar el hook `BonosAtributos` (§5.2); `BonosForma` ya tiene los campos `Fuerza..Presencia`, `Desvio`, `Concentracion` |
| Defensa espiritual −2/−5 por clavo hemalúrgico (L.288-291 / PDF 294-297) | necesita saber qué clavos tiene | Convención de lista de talentos `~clavo~<metal>` (mismo patrón que `~forma~`) [inferido; decisión D5] |
| "Portentoso: +1 grado efectivo de Alomancia para alcance" | modifica un derivado nuevo, no existente | Aplicarlo dentro del derivado de artes metálicas |
| Savantismo: +2 Investidura de amplificación | no suma al máximo; es un modificador de gasto | situacional, texto libre [inferido] |

**Colisión de nombres entre sets**: hoy el registro es global y estático. Si un nombre existe en ambos libros con efecto distinto, una sola tabla no basta. Un registro por set (con el núcleo común compartido) evita el problema [inferido que no existe ninguna colisión real todavía; no se ha comparado talento a talento].

**Chequeo**: las reglas son datos puros (sin acceso a BD); `Calcular` no necesita servicios. Es seguro hacerlas instancia de un `IReglasSet`.

---

## 3. Validaciones cableadas y dónde se invocan

| Validación | Dónde está | Dónde se invoca | Comportamiento |
|---|---|---|---|
| `ValidCaminosHeroicos` = `agente, cazador, enviado, erudito, guerrero, lider` | `CharacterService.cs:12-15` | `ValidateCaminos` `:25-33` | vacío permitido; si no vacío y no en el set → `ArgumentException("Invalid CaminoHeroico: '…'.")` |
| `ValidCaminosRadiantes` = `windrunners, skybreakers, dustbringers, edgedancers, truthwatchers, lightweavers, elsecallers, willshapers, stonewards, bondsmiths` | `:17-21` | `:29-30` | idem para `CaminoRadiante` |
| `ValidAscendencias` = `Humano`, `Oyente` (comparación sensible a mayúsculas) | `:23` | `:31-32` | idem para `Ascendencia` |
| Invocaciones de `ValidateCaminos` | — | **crear** `:79` (antes de construir la entidad); **actualizar** `:118` (después del bloqueo de campos para no-GM `:111-116`) | — |
| Bloqueo no-GM | `:111-116` | solo en `UpdateCharacterAsync` | un jugador no-GM no puede cambiar `Name`, `CaminoHeroico`, `CaminoRadiante` (se sobrescriben con lo guardado). **No** protege `Ascendencia` |
| Autorización | `:157-170` | todos los métodos | `IsGmAsync`, `EnsureMemberAsync`, `EnsureGmAsync`: solo GM crea, borra, asigna; jugadores ven/editan solo su personaje |
| Metas: hitos 0..3 | `Services/Metas/MetaService.cs:42-43` | `UpdateMetaAsync` | `ArgumentException("Hitos must be between 0 and 3.")` |
| Metas: tipo de conclusión `exito`/`crecimiento`/`fracaso` | `MetaService.cs:57-59` | `ConcludeMetaAsync` | `ArgumentException` |
| Pertenencia del propietario | `CharacterService.cs:71-77` (crear) y `:143-149` (asignar) | — | `KeyNotFoundException` si el `OwnerId` no es miembro |

**Mapeo a HTTP** (`API/Internals/ExceptionMiddleware.cs:21-30`): `ArgumentException`→400, `UnauthorizedAccessException`→403, `KeyNotFoundException`→404, `InvalidOperationException`→409, resto→500. Los mensajes de validación están en inglés y exponen el valor recibido.

**Lo que NO se valida en el servidor** (importante para el set Nacidos de la Bruma, por si alguien asume que la API protege las reglas): nivel (puede ser 0 o negativo), rango de atributos (0-5), presupuesto de 12 puntos o 6 para kandra (L.20 / PDF 26),
máx. 3 por atributo al crear, grados máximos por rango, prerrequisitos de talentos, exclusividad de caminos de nacido del metal (L.127 / PDF 133), era, ni que `Talentos` contenga nombres reales.
Todo eso es hoy responsabilidad del cliente. Recomendación [inferido]: mantenerlo así (consejos en cliente) para no endurecer el contrato; solo validar identidad (caminos/ascendencia) por set.

**Metas**: el modelo de Nacidos de la Bruma es el mismo (3 hitos, conclusión por éxito, crecimiento o fracaso: L.282-284 / PDF 288-290), así que `MetaService` no necesita estrategia en la primera iteración.
La "meta de nacido del metal" (L.133 / PDF 139: casilla *completada* por poder) **no existe** en `MetaEntity` (`Messages/Database/Entities/MetaEntity.cs:3-16`: `Titulo, Descripcion, Hitos, Estado, TipoConclusion, NotasConclusion`).
Se puede aproximar con `Estado == "concluida"`; el vínculo meta↔poder necesitaría un campo (decisión de modelo de datos, fuera de este informe).

---

## 4. Registro de servicios (DI) y ausencia de patrón de estrategia por campaña

- `API/Program.cs:61` `AddInfrastructure(...)` (`Infrastructure/Bootstrap.cs:10-20`: `AddDbContext<CosmereContext>` scoped con Npgsql, `MigrationsAssembly("Infrastructure")`).
- `API/Program.cs:64` `AddServices()` → `Services/Bootstrap.cs:19-35`: 13 líneas `services.AddScoped<IX, X>()`:
  `IAuthService, ICampaignService, ICharacterService, IGlobalNpcService, INpcNoteService, ISessionService, IProposalService, ICatalogService, INoteService, IMetaService, ILockedDayService, IDiaryService, IDiceRollService`.
- No hay `AddSingleton`, `AddKeyed*`, factorías ni `IHttpContextAccessor`. `CharacterService` usa constructor primario `CharacterService(CosmereContext db)` (`CharacterService.cs:10`) y `FormasCantor`/`TalentosReglas` son **clases estáticas**.
- La identidad del usuario sale del JWT (`Cross/Security/JwtHelper.cs:35-40`), solo `sub`, `username`, `displayName`, `jti` (`:16-22`); **el rol y la campaña NO están en el token**. Cada petición re-consulta `CampaignMembers`.
- La campaña llega siempre como parámetro de ruta (`campaigns/{campaignId:long}/[controller]`, `CharactersController.cs:11`); no hay filtro/middleware que cargue la campaña ni un "contexto de campaña".
- Migraciones: `Program.cs:93-94` ejecuta `Infrastructure.Bootstrap.ApplyMigrations` (`Infrastructure/Bootstrap.cs:22-28`: `db.Database.Migrate(); SeedData.Seed(db);`) salvo que `AutoMigrate=false`. No aparece `AutoMigrate` en ningún `appsettings*.json`, así que por defecto es `true` (default del código `Program.cs:93`).
  `SeedData` solo siembra 7 usuarios y no llama a `SaveChanges` en lo leído (`api_map.md` §3).

**Conclusión**: el patrón mínimo y consistente con el repo es (1) un `IReglasSetProvider` **singleton** sin estado que mapea `id → IReglasSet`, (2) inyectarlo en `CharacterService` (singleton→scoped es válido),
(3) resolver el `RuleSet` de la campaña **dentro de cada método** (una consulta) igual que hoy se resuelve `IsGm`. No hace falta middleware ni cambiar el JWT.
Alternativa equivalente con .NET 8: `AddKeyedSingleton<IReglasSet, StormlightReglas>("stormlight")` + `GetRequiredKeyedService<IReglasSet>(id)`; descartada como primera opción porque exige inyectar `IServiceProvider`/`[FromKeyedServices]` por parámetro y el repo no usa claves [inferido].

---

## 5. Diseño mínimo concreto de `IReglasSet`

### 5.1 Identificadores (capa `Messages`, la usan entidad y DTOs)

```csharp
// Messages/RuleSets/RuleSetIds.cs   (nuevo)
namespace Messages.RuleSets;
public static class RuleSetIds
{
    public const string Stormlight = "stormlight";   // Archivo de las Tormentas
    public const string Mistborn   = "mistborn";     // Nacidos de la Bruma
    public static readonly IReadOnlyList<string> Todos = [Stormlight, Mistborn];
    public static bool EsValido(string? id) => id is not null && Todos.Contains(id);
}
```
Capa correcta porque `Messages` no depende de nada y `Services`/`Infrastructure`/`API` la referencian (`API.csproj:4-6`, `Services.csproj:4-6`, `Infrastructure.csproj:4`).

### 5.2 Interfaz (capa `Services`, `Services/RuleSets/IReglasSet.cs`, nuevo)

```csharp
namespace Services.RuleSets;

public interface IReglasSet
{
    string Id { get; }                                        // RuleSetIds.*

    // ── Registro de talentos con regla numérica (sustituye al acceso directo a TalentosReglas.Reglas) ──
    IReadOnlyDictionary<string, List<ReglaTalento>> ReglasTalentos { get; }

    // ── Validación de identidad (sustituye ValidateCaminos, CharacterService.cs:25-33) ──
    // Lanza ArgumentException (→ 400). caminoEspecial = CaminoRadiante (Stormlight) o CaminoMetal (Mistborn, decisión D1).
    void ValidarIdentidad(string caminoHeroico, string caminoEspecial, string ascendencia);

    // ── ¿Tiene Investidura? (sustituye string.IsNullOrEmpty(c.CaminoRadiante) en :239 y TalentosReglas.cs:218) ──
    bool TieneInvestidura(CharacterEntity c, IReadOnlyList<string> talentos);

    // ── Bonos de atributo/desvío/concentración de la identidad (forma de cantor hoy; Bendición kandra mañana) ──
    BonosForma BonosAtributos(CharacterEntity c, IReadOnlyList<string> talentos, out string? origen);

    // ¿El desvío del bono se acumula con la armadura? (false = "se usa el mayor", regla de las formas de cantor)
    bool DesvioBonoSeAcumula { get; }

    // ── Derivados que solo existen en este set (null en Stormlight) ──
    DerivadosSet? Derivar(CharacterEntity c, IReadOnlyList<string> talentos);
}

public interface IReglasSetProvider
{
    IReglasSet Obtener(string? ruleSetId);   // null / vacío / desconocido → Stormlight (compatibilidad con campañas antiguas)
}
```

Tipos auxiliares:

```csharp
// Messages/Characters/Out/DerivadosSet.cs   (nuevo; null en campañas Stormlight → no aparece en JSON si se configura IgnoreNullValues, o llega "derivadosSet": null)
public class DerivadosSet { public ArteDerivada? Alomancia { get; set; } public ArteDerivada? Feruquimia { get; set; } }
public class ArteDerivada
{
    public int Grados { get; set; }          // grados de la habilidad Investida
    public int Modificador { get; set; }     // atributo (VOL/INT) + grados
    public int Limite { get; set; }          // tabla L.163 / PDF 169: grados 0-5 → 1,1,2,3,4,5 ; 6+ → rango
    public string Dado { get; set; } = "";   // "" (grado 0, sin tirada), d4,d6,d8,d10,d12,d20
    public int AlcanceMetros { get; set; }   // 3,6,12,24,48,96,192
    public int? CargasMaxMente { get; set; } // solo Feruquimia: 2 + grados (+rango si "Mentes de metal ampliadas"); L.131 / PDF 137
}
```
`BonosForma` (WIP, `FormasCantor.cs:7-20`) se **reutiliza sin renombrar** para no pisar el WIP; su nombre es engañoso para Bendiciones pero tiene los campos necesarios.

### 5.3 Implementaciones

| Clase | Contenido |
|---|---|
| `StormlightReglas : IReglasSet` | `ValidarIdentidad` = los tres `HashSet` de `CharacterService.cs:12-23` movidos tal cual; `TieneInvestidura` = `!string.IsNullOrEmpty(c.CaminoRadiante)`; `BonosAtributos` = `FormasCantor.BonosActivos(c.Ascendencia, talentos)` y `origen = FormasCantor.FormaActiva(...)` (solo si `EsCantor`); `DesvioBonoSeAcumula=false`; `ReglasTalentos = TalentosReglas.Reglas` (el diccionario actual); `Derivar` → `null` |
| `MistbornReglas : IReglasSet` | `ValidarIdentidad`: caminos heroicos = los mismos 6; camino de nacido del metal ∈ `brumoso, nacido-de-la-bruma, feruquimista, ferrin, nacidoble` [ids inferidos]; ascendencias `Humano, Kandra, Sangre koloss` [inferido]; `TieneInvestidura` = camino alomántico (`brumoso`, `nacido-de-la-bruma`, `nacidoble`; L.26 / PDF 32); `BonosAtributos` = Bendición kandra (convención `~bendicion~X` en `Talentos`, D5) + "Tamaño desmedido" +1 Fuerza; `ReglasTalentos` = núcleo común + "Resistencia koloss"; `Derivar` calcula los dos `ArteDerivada` |

Provider (singleton, sin estado):

```csharp
public sealed class ReglasSetProvider(IEnumerable<IReglasSet> sets) : IReglasSetProvider
{
    private readonly Dictionary<string, IReglasSet> _porId = sets.ToDictionary(s => s.Id);
    public IReglasSet Obtener(string? id) =>
        id is not null && _porId.TryGetValue(id, out var s) ? s : _porId[RuleSetIds.Stormlight];
}
```
Registro en `Services/Bootstrap.cs:19-35` (tres líneas nuevas):
```csharp
services.AddSingleton<IReglasSet, StormlightReglas>();
services.AddSingleton<IReglasSet, MistbornReglas>();
services.AddSingleton<IReglasSetProvider, ReglasSetProvider>();
```

### 5.4 Decisiones abiertas que la especificación final debe cerrar

| ID | Decisión | Recomendación |
|---|---|---|
| D1 | Dónde guardar el camino de nacido del metal | **Columna nueva** `CaminoMetal` (`text` NOT NULL default `''`) en `Characters` y en los DTOs; no reutilizar `CaminoRadiante` (semántica distinta, y en el libro el set permite mezcla: L.374-375 / PDF 380-381) |
| D2 | ¿`RuleSet` editable tras crear la campaña? | **No** (no hay endpoint de edición hoy: `CampaignsController.cs:15-93` solo tiene GET/POST/DELETE/PATCH invite); evita personajes con ascendencia/camino inválidos (p. ej. "Oyente" no existe en Mistborn) |
| D3 | ¿Bloqueo no-GM del camino de nacido del metal (`:111-116`)? | En el libro el camino de nacido del metal se adquiere **en cualquier nivel** tomando el talento principal (L.128 / PDF 134): bloquear al jugador sería una regla de mesa, no del libro. Decisión de producto |
| D4 | Mezcla de sets en una campaña (Tormentas + Nacidos de la Bruma) | El libro lo prevé con una única reserva de Investidura compartida y Desprovisto por fuente (L.374-375 / PDF 380-381). Con un único `RuleSet` string no se soporta; ampliable después con un tercer valor `"mixto"` cuyo set haga la unión (`TieneInvestidura` = radiante OR alomántico) |
| D5 | Dónde guardar Bendición kandra, clavos hemalúrgicos, poderes elegidos | Mismo patrón que `~forma~` (cadena con prefijo dentro de `Talentos`) = sin migración, pero acopla. Alternativa: columnas/tablas propias. Decisión de modelo de datos (otro informe) |

### 5.5 Sitios exactos de llamada (archivo:línea actual → cambio)

Los cambios en `CharacterService.cs`, `TalentosReglas.cs` y `CharacterResponse.cs` pisan ficheros con WIP (ver §8). Se marca con **(WIP)** cada línea que el WIP ya ha modificado.

| # | Archivo:línea | Cambio |
|---|---|---|
| 1 | `Messages/Database/Entities/CampaignEntity.cs:3-17` | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` |
| 2 | `Messages/Campaigns/In/CreateCampaignRequest.cs` (clase `CreateCampaignRequest`) | `public string RuleSet { get; set; } = RuleSetIds.Stormlight;` (opcional: clientes antiguos siguen funcionando) |
| 3 | `Messages/Campaigns/Out/CampaignResponse.cs` (`CampaignResponse` y `CampaignDetailResponse`) | añadir `string RuleSet` |
| 4 | `Services/Campaigns/CampaignService.cs:65-72` (`CreateCampaignAsync`) | validar `RuleSetIds.EsValido(request.RuleSet)` → si no, `ArgumentException`; asignar `RuleSet = request.RuleSet` |
| 5 | `CampaignService.cs:17-33` (proyección de `GetUserCampaignsAsync`) | `RuleSet = m.Campaign.RuleSet` |
| 6 | `CampaignService.cs:48-62` (`GetCampaignDetailAsync`) | `RuleSet = campaign.RuleSet` |
| 7 | `CampaignService.cs:115` (`JoinCampaignAsync`, `CampaignResponse` construido a mano) | `RuleSet = campaign.RuleSet` |
| 8 | `Messages/Database/Entities/CharacterEntity.cs` | `CaminoMetal` (D1); también `CharacterRequest.cs:3-12` (`CreateCharacterRequest`), `:19-98` (`UpdateCharacterRequest`), `CharacterResponse.cs:5-100` |
| 9 | `Services/Bootstrap.cs:19-35` | 3 líneas `AddSingleton` (§5.3) |
| 10 | `CharacterService.cs:10` (ctor primario) | `CharacterService(CosmereContext db, IReglasSetProvider reglas)` |
| 11 | `CharacterService.cs:12-33` | borrar los 3 `HashSet` y `ValidateCaminos`; se mueven a `StormlightReglas.ValidarIdentidad` |
| 12 | `CharacterService.cs:35-48` (`GetCharactersAsync`) | tras `:37` resolver `var set = await ObtenerReglasAsync(campaignId);` una vez; `:47` → `MapToResponse(c, set, new ContextoJuego())` |
| 13 | `CharacterService.cs:50-64` (`GetCharacterAsync`) | tras `:52` resolver set; `:63` pasar `set` |
| 14 | `CharacterService.cs:66-97` (`CreateCharacterAsync`) | tras `:68` resolver set; `:79` → `set.ValidarIdentidad(...)`; `:96` pasar `set`; añadir `CaminoMetal` a `:81-92` |
| 15 | `CharacterService.cs:99-123` (`UpdateCharacterAsync`) | tras `:101` resolver set; `:111-116` revisar D3; `:118` → `set.ValidarIdentidad(...)`; `:122` pasar `set` |
| 16 | `CharacterService.cs:135-155` (`AssignCharacterAsync`) | resolver set; `:154` pasar `set` |
| 17 | `CharacterService.cs:172-199` (`ApplyUpdate`) | asignar `CaminoMetal` (`:175` es el sitio natural junto a `CaminoRadiante`) |
| 18 | `CharacterService.cs:237-253` (`BuildInvLineas`) | `:239` `string.IsNullOrEmpty(c.CaminoRadiante)` → parámetro `bool tieneInvestidura` calculado con `set.TieneInvestidura(c, talentos)`. **(WIP: firma ya lleva `fb, forma`)** |
| 19 | `CharacterService.cs:288-301` (`BuildDesvioLineas`) | usar `set.DesvioBonoSeAcumula` para elegir "mayor" vs "suma". **(WIP completo)** |
| 20 | `CharacterService.cs:310` (`MapToResponse`) | nueva firma `MapToResponse(CharacterEntity c, IReglasSet set, ContextoJuego? ctx = null)`; `:314-315` → `fb = set.BonosAtributos(c, talentos, out var forma)`. **(WIP)** |
| 21 | `CharacterService.cs:336-379` (8 llamadas a `Calcular`) | pasar `reglas: set.ReglasTalentos` y `tieneInvestidura` precalculado (§2.4) |
| 22 | `CharacterService.cs:381-406` | tras el último campo: `DerivadosSet = set.Derivar(c, talentos)` |
| 23 | `TalentosReglas.cs:170-177` (`Calcular`) | añadir **al final** dos parámetros opcionales: `IReadOnlyDictionary<string, List<ReglaTalento>>? reglas = null, bool? tieneInvestidura = null`; `null` ⇒ comportamiento actual (`Reglas`, `CaminoRadiante`). **(WIP: acaba de añadir `situacionalBase`)** |
| 24 | `TalentosReglas.cs:182` | `foreach (var (nombre, rs) in reglas ?? Reglas)` |
| 25 | `TalentosReglas.cs:214-224` (`EsActiva`) | `:218` usar `tieneInvestidura ?? !string.IsNullOrEmpty(c.CaminoRadiante)` |
| 26 | `TalentosReglas.cs:240-261` (`GradosDe`) | tras el `switch` por defecto (`_ => 0`) buscar en `HabilidadPersonalizada1..6` por nombre (necesario para Alomancia/Feruquimia) |
| 27 | `Messages/Characters/Out/CharacterResponse.cs:44` | `public DerivadosSet? DerivadosSet { get; set; }`. **(WIP: justo debajo de `DesvioCalculado`, `:43-44`)** |
| 28 | `CharactersController.cs:24-26` | sin cambios (el `ContextoJuego` es del cliente; el set sale de la campaña) |
| 29 | `Services/Metas/MetaService.cs:42-43, 57-59` | sin cambios en la v1 (reglas de metas idénticas; §3) |
| 30 | `Infrastructure/Data/CosmereContext.cs:28-213` | opcional: `HasMaxLength` / check constraint del `RuleSet`; nada obligatorio (la entidad se configura por convención, no hay bloque para `Character`; solo FKs en `:57-61, :131-136`) |
| 31 | Migración nueva tras `Infrastructure/Migrations/20260929110638_AddIdealesJurados.cs` | §7.1 |

Helper nuevo (en `CharacterService`):
```csharp
private async Task<IReglasSet> ObtenerReglasAsync(long campaignId)
{
    var id = await db.Campaigns.AsNoTracking().Where(c => c.Id == campaignId).Select(c => c.RuleSet).FirstOrDefaultAsync();
    return reglas.Obtener(id);   // id null (campaña inexistente ya filtrada por EnsureMember) → Stormlight
}
```
Coste: una consulta más por petición (el mismo orden que `IsGmAsync`/`EnsureMemberAsync`, `:157-164`). En `GetCharacterAsync`/`Update` se podría fusionar con la consulta del personaje con `Include(c => c.Campaign)`; no necesario.

---

## 6. Columnas del personaje y qué pasa con ellas en una campaña de Nacidos de la Bruma

Entidad: `Messages/Database/Entities/CharacterEntity.cs:3-97`. Columnas con significado Stormlight o dudoso:

| Columna | Uso hoy en servidor | En campaña Nacidos de la Bruma |
|---|---|---|
| `CaminoRadiante` (string) | valida (`:29-30`), bloquea al no-GM (`:115`), gate de Investidura (`:239`) y de `TieneInvestidura` (`TalentosReglas.cs:218`) | Queda vacío y sin efecto. **No reutilizar** (D1). Sigue en la BD y en el DTO |
| `IdealesJurados` (int, 0..5 en Tormentas) | solo se copia (`:176`, `:324`) | Sin equivalente: Nacidos de la Bruma no tiene Ideales; el progreso es por **metas de nacido del metal** (L.132-133 / PDF 138-139). Queda en 0 |
| `MarcosInfusas`, `MarcosOpacas` | solo se copian (`:182`, `:333`) | Sin equivalente: la moneda es la **arquilla** (L.254 / PDF 260), "no hay esferas infundidas" (L.253 / PDF 259). Hace falta un campo de arquillas (fuera de alcance) |
| `Ascendencia` ("Humano"/"Oyente") | validación `:31-32`; gate de formas de cantor (`FormasCantor.EsCantor`, `FormasCantor.cs:55-56`) | Nuevo vocabulario `Humano`, `Kandra`, `Sangre koloss` (L.32-39 / PDF 38-45). `Oyente` no aplica. En el set Mistborn `EsCantor` no se invoca |
| `Talentos` (JSON de nombres) | `ParseTalentos` (`:303-308`); `~forma~X` | Se reutiliza (incluye talentos de los árboles de poderes: ≈150-165 estimados [inferido, `mistborn_rules_summary.md` §4.3]); prefijos `~bendicion~`, `~clavo~` (D5) |
| `Spells` (`text[]`), `Equipment`, `Weapons`, `Armor`, `EquippedArmor` | solo copia; `ApplyUpdate` exige `EquippedArmor ∈ Armor` (`:198`) | Reutilizables. `Spells` [inferido] no tiene equivalente (en Tormentas lista potencias/Ideales) |
| `MaxHealth`, `MaxConcentration`, `MaxInvestiture` | **obsoletos**: se guardan, no se calculan (`:203-204`, `CharacterResponse.cs:27-32` `[Obsolete]`) | Igual: se ignoran. No eliminar en este cambio |
| `Desvio` (int) | base del desvío (`:290`), lo fija el cliente al equipar armadura | Reutilizable. Armaduras de Nacidos de la Bruma: 0-3 (L.264-266 / PDF 270-272, tabla **[inferido]** por extracción desordenada) |
| 18 habilidades fijas (`Agilidad … Supervivencia`) | copia + `GradosDe` | **Idénticas** en Nacidos de la Bruma (L.59-72 / PDF 65-78): `Saber` ↔ `Conocimiento`, `Armamento ligero/pesado` ↔ `ArmasLigeras/ArmasPesadas` |
| `HabilidadPersonalizada1..6` (nombre, valor, atributo) | copia | Alojan **Alomancia (VOL)** y **Feruquimia (INT)** (L.128 / PDF 134; hoja con una línea extra por columna, L.402-405 / PDF 408). Con 6 huecos sobran. Frágil: se identifican por nombre libre |
| `Proposito`, `Obstaculo`, `Apariencia`, `Notas`, `Conexiones` | copia | Idénticos (L.281-283 / PDF 287-289) |
| `Level`, `Experience`, atributos | copia | `Experience` no se usa (el libro no tiene XP: los hitos los marca la DJ; L.27 / PDF 33) |
| `IsNpc`, `IsVisibleToPlayers` | todas las consultas filtran `!IsNpc` (`:40, 57, 104, 129, 140`; `MetaService.cs:93`) | Sin cambio |

Columnas **nuevas** que el set Nacidos de la Bruma necesita y no existen (para la especificación de datos, no para este informe): camino de nacido del metal (D1), arquillas, poderes/metales elegidos y su estado naciente|completo,
viales, cuentas de atium, cargas de mentes de metal por metal, Desprovisto por poder (todo en L.128-133 / PDF 134-139). Como los valores *actuales* (Investidura actual, salud actual…) tampoco se persisten hoy, es coherente que viales/cargas actuales sean estado de cliente [inferido; decisión de producto].

---

## 7. Riesgos de migración

### 7.1 Migración mínima esperada

Campos: `Campaigns.RuleSet` (text, NOT NULL, default `'stormlight'`) y, si se acepta D1, `Characters.CaminoMetal` (text, NOT NULL, default `''`).
Patrón idéntico a la última migración (`20260929110638_AddIdealesJurados.cs:11-19`: `AddColumn<int>(... nullable:false, defaultValue:0)`):

```csharp
migrationBuilder.AddColumn<string>(name: "RuleSet", table: "Campaigns", type: "text", nullable: false, defaultValue: "stormlight");
migrationBuilder.AddColumn<string>(name: "CaminoMetal", table: "Characters", type: "text", nullable: false, defaultValue: "");
```
Nombre sugerido: `AddRuleSetAndCaminoMetal` (la marca de tiempo debe ser posterior a `20260929110638`). `Down` elimina ambas columnas (se pierde el set de la campaña).
Comandos del proyecto (`../CLAUDE.md`): `dotnet ef migrations add <Nombre> --project Infrastructure --startup-project API` y `dotnet ef database update …`, **con el proceso de la API parado**.

### 7.2 Riesgos y mitigaciones

| # | Riesgo | Gravedad | Detalle y mitigación |
|---|---|---|---|
| 1 | **Campañas existentes sin set** | Baja | `DEFAULT 'stormlight'` en la migración; además `ReglasSetProvider.Obtener` cae a Stormlight ante `null`/desconocido. Los diarios sembrados con `CampaignId = 1` (`20260526130330_AddDiaryEntries.cs`) quedan en Stormlight |
| 2 | **Regresión silenciosa del cálculo de Tormentas** al extraer `StormlightReglas` | **Alta** | No hay proyecto de tests (`api_map.md` cabecera). Mitigación: antes de refactorizar, guardar el JSON de `GET /campaigns/{id}/characters` de 3-4 personajes reales (con talentos, forma, armadura) y compararlo byte a byte después; el ejemplo de §1.6 sirve de caso base |
| 3 | **Colisión con el WIP** (formas de cantor) | **Alta** | Mismos ficheros y mismas líneas (§8). Mitigación: (a) implementar tras commitear el WIP; (b) si no, cambios aditivos con parámetros opcionales (§5.5 #23-25); (c) no renombrar `BonosForma` ni `FormasCantor` |
| 4 | **`dotnet ef` compila el proyecto de arranque**: si el árbol con WIP no compila, la migración no se genera (la lectura previa de `api_map.md` vio un desajuste de firma en `CharacterService.cs:379`) | Media | En la lectura actual la firma coincide (`Calcular` ya tiene `situacionalBase`, `TalentosReglas.cs:177`). No se ha compilado (solo lectura): **[inferido]** que compila. Verificar con `dotnet build` antes de `migrations add` |
| 5 | **Auto-migración al arrancar** (`Program.cs:93-94`, `AutoMigrate` por defecto `true`) | Baja | `ADD COLUMN ... NOT NULL DEFAULT constante` es solo metadatos en PostgreSQL ≥ 11 [inferido, no se ha comprobado la versión del servidor]; tablas pequeñas. El despliegue (`deploy.sh`) no se ha leído |
| 6 | **Snapshot de EF** | Baja | El default de C# (`= RuleSetIds.Stormlight`) no se refleja en el snapshot; el `defaultValue` de la migración sí vive en la BD. Un futuro `migrations add` no detectará diferencia (comportamiento EF normal) |
| 7 | **Cambiar el set tras crear personajes** deja datos inválidos (`Ascendencia="Oyente"` en Mistborn, `CaminoRadiante` ignorado) | Media | D2: no ofrecer edición del set. Si se añadiera, bloquearla cuando existan personajes |
| 8 | **Validación en lectura inexistente**: `GetCharacter*` no valida; solo se valida al escribir (`:79`, `:118`) | Baja | Personajes antiguos con valores que dejaran de ser válidos se leen bien y fallan al guardar (el PUT reenvía `Ascendencia`) |
| 9 | **Inconsistencia previa** ascendencia "Cantor/Cantora" | Baja | `FormasCantor.AscendenciasCantor` acepta `Oyente`, `Cantor`, `Cantora` (`FormasCantor.cs:27-28`) pero `ValidAscendencias` solo `Humano`, `Oyente` (`CharacterService.cs:23`): un PJ con "Cantor" no se puede guardar. No lo arregla este proyecto; la especificación de Tormentas debe conservarlo o decidir |
| 10 | **Columnas obsoletas** `MaxConcentration`/`MaxInvestiture` | Baja | No tocar. Eliminarlas sería una migración destructiva y fuera de alcance |
| 11 | **Catálogo y PNJ globales sin set** | Media (fuera de este informe) | `/catalog` (`CatalogController.cs`) y `GlobalNpcs` son globales, sin `CampaignId` ni set; `GlobalNpcEntity.Source` (string libre) sirve de discriminador provisional. Una campaña de Nacidos de la Bruma vería el catálogo de Tormentas (hojas esquirladas…) hasta que se filtre |
| 12 | **Mensajes de error en inglés** y valor expuesto | Baja | `ArgumentException($"Invalid CaminoHeroico: '{…}'")`; mantener estilo para no cambiar el contrato del cliente |
| 13 | **Contrato JSON** | Media | Añadir `ruleSet` (campañas) y `derivadosSet`/`caminoMetal` (personajes) es aditivo para lectura. Para escritura: `UpdateCharacterRequest` es un PUT completo (`ApplyUpdate` asigna todos los campos, `CharacterService.cs:172-199`); un cliente antiguo que no envíe `caminoMetal` dejaría `''` y **pisaría** el valor guardado. Mitigación [inferido]: propiedad `string? CaminoMetal` en el request y no asignar si es `null` |

---

## 8. Estado del WIP y cómo evitar colisiones

Comandos ejecutados (solo lectura): `git status --short` y `git diff --stat` sobre `cosmere-api`.

```
 M Messages/Characters/Out/CharacterResponse.cs     (+2)
 M Services/Characters/CharacterService.cs          (~105 líneas cambiadas)
 M Services/Characters/TalentosReglas.cs            (~77 líneas cambiadas)
?? Services/Characters/FormasCantor.cs              (nuevo, 69 líneas)
```
(Total diff tracked: 3 ficheros, 150 inserciones / 34 borrados. Avisos de `git` sobre LF→CRLF: irrelevantes.)

### 8.1 Qué cambia exactamente el WIP respecto a HEAD

| Fichero | Cambios del WIP |
|---|---|
| `FormasCantor.cs` (nuevo) | `record BonosForma(Fuerza, Velocidad, Intelecto, Voluntad, Discernimiento, Presencia, Desvio, Concentracion)`; `static class FormasCantor` con prefijo `~forma~`, conjunto `AscendenciasCantor {Oyente, Cantor, Cantora}`, diccionario `Bonos` de 14 formas (gris, carnal, artística, diestra, de guerra, de trabajo, de mediación, sabia, funesta, tormenta, emisaria, comunicadora, pútrida, nocturna), `EsCantor`, `FormaActiva`, `BonosActivos`. Comentario: espejo de `cosmere-web/src/data/cantores.ts` |
| `TalentosReglas.cs` | + `TipoFormula.PorHabilidad`; + `CondicionRegla.InfusoAbrasion`; + `ReglaTalento.Habilidad`; talento "Mente ambiciosa"; "Movimiento sin fricción" pasa de `TieneInvestidura` a `InfusoAbrasion`; "Réplica fulminante" pasa de `Plana 0` a `PorHabilidad "Disciplina"`; `Calcular` gana `situacionalBase`; `EsActiva` trata `InfusoAbrasion` como situacional; `Rango()` con clamp 1-5; `GradosDe()` |
| `CharacterService.cs` | `MapToResponse` ahora deriva `forma`, `fb`, `velEff`, `desvio`; `BuildConcLineas`, `BuildInvLineas`, `BuildSaludLineas` reciben `fb, forma`; `BuildDefensaLineas` recibe `bonoForma, forma`; nuevos `ConceptoForma` y `BuildDesvioLineas`; nueva llamada `DesvioCalculado = Calcular(StatAfectada.Desvio, …)`; movimiento con velocidad efectiva |
| `CharacterResponse.cs` | + `StatDesglose DesvioCalculado` (`:43-44`) |

Efecto lateral relevante: el WIP deja **sin ninguna regla** a `CondicionRegla.TieneInvestidura` y a `CondicionRegla.EnCombate` (ya no hay quien las use). El gate de Investidura sigue siendo `CaminoRadiante` (`CharacterService.cs:239`).
Estado de compilación: en lectura, la firma de `Calcular` (`TalentosReglas.cs:177`) coincide con la llamada (`CharacterService.cs:379`). **[inferido]** que compila; no se ha ejecutado `dotnet build` (regla de solo lectura).

### 8.2 Reglas para que la especificación no pise el WIP

1. **No reescribir** `FormasCantor.cs`, `BonosForma` ni los `Build*Lineas` del WIP; el set `StormlightReglas` los **envuelve** (§5.3).
2. Toda modificación de `Calcular`/`EsActiva`/`MapToResponse` se describe como **añadir parámetros opcionales al final** (§5.5 #23-25) o como cambio posterior al commit del WIP.
3. `CharacterResponse`: añadir propiedades **después** de `DesvioCalculado` y `Metas`; no reordenar.
4. La migración (§7) debe generarse con el árbol compilando; coordinar para que el WIP esté commiteado o al menos estable.
5. La especificación de Tormentas debe asumir **el comportamiento del WIP** (formas de cantor, desvío efectivo, rango con clamp) como línea base, no el de HEAD.
6. Contrato mirror con el cliente: `FormasCantor.cs` declara que espeja `cosmere-web/src/data/cantores.ts`; cualquier extracción a `StormlightReglas` debe conservar los mismos valores para no desincronizar.
7. En `cosmere-web` el árbol también tiene cambios sin commitear (`src/pages/characters/CharacterDetailPage.tsx`, `src/types/index.ts`, según `gitStatus` del contexto) que pueden corresponder al mismo trabajo; coordinar los tipos `StatDesglose`/`Character` antes de añadir `ruleSet`, `caminoMetal`, `derivadosSet`.

---

## 9. Recomendación de orden de implementación (mínimo riesgo)

1. Commitear (o dar por estable) el WIP de formas de cantor.
2. Migración `Campaigns.RuleSet` (+ `Characters.CaminoMetal` si D1) y DTOs de campaña/personaje (todo aditivo, el cliente puede ignorarlo).
3. Extraer `IReglasSet`/`StormlightReglas` **sin cambio de comportamiento**; verificar con el JSON de referencia (riesgo 2).
4. Añadir `MistbornReglas` (validación, `TieneInvestidura`, registro con "Resistencia koloss", `Derivar`, `GradosDe` con habilidades personalizadas).
5. Exponer `ruleSet` al cliente y diferenciar la ficha (otros informes).

---

## 10. Lo que NO he podido verificar

- Compilación y ejecución (solo lectura): el estado "compila" del WIP es una deducción.
- Versión de PostgreSQL en producción y contenido de `deploy.sh`/`docker-compose.yml` (no leídos), relevante para la migración automática.
- El texto íntegro de "Serenidad", "Compostura", "Robusto", "Paso firme" en Nacidos de la Bruma se comprobó por coincidencia de nombre y por las frases del extracto citadas, no talento a talento con el PDF original. Los números de página de los talentos comunes no se han fijado (se cita el extracto de texto).
- Tablas de armaduras/armas/metales de Nacidos de la Bruma: el extracto sale desordenado (marcadas [inferido] en `mistborn_rules_summary.md`).
- Si Bendiciones kandra (L.34-35 / PDF 40-41) son bonos temporales o aumentos permanentes de atributo: el resumen dice "+N (y su máximo +N)", lo que sugiere permanentes; esto condiciona si deben entrar por `BonosAtributos` o se editan directamente en el atributo.
- Si el desvío de la Bendición Fortaleza se acumula con armadura (§1.4).
