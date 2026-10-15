# Almacén y mercado negro de la banda — propuesta v1

> Estado: **implementado (v1)** el 14 oct 2026 en la rama `feature/banda` (worktree `cosmere-web-banda`, sin commitear; la API no
> cambia). Se construye sobre las iteraciones 1 y 2 de «La banda». Todo lo que añade es **casero**: ni el Manual ni El legado tienen
> reglas para vender mercancía. Las cifras viven en el catálogo del mundo, así que se ajustan sin tocar la lógica.

## Decisiones de Xavi (14 oct 2026)

1. **Qué ven los jugadores:** ponen el precio y ven el **precio de mercado** (precio del libro × conservación). No ven el valor del
   mercado negro, ni el tramo, ni la probabilidad; cómo podrían estimarlo se verá más adelante. En la pestaña Almacén esas cuentas solo
   las ve el director: la línea de cada lote, el bloque de la hoja de precio y el desplegable «Cómo vende el mercado negro».
2. **«Pasar semanas»** solo lo ejecuta el director, así que enseña **todo** para comentarlo con los jugadores:
   - antes de confirmar, la probabilidad de cada lote semana a semana, la de venderse en el periodo, lo que suma la banda y el riesgo
     de soplo;
   - después, cada tirada.
3. **Trabajadores en el Almacén:** cada trabajador activo o herido en el puesto de la mejora **Almacén** de un refugio (lista, en un
   refugio que no esté perdido) suma **+10**, hasta +20.
4. **Lo demás va con la opción por defecto de §5:**
   - el dinero va a la tesorería;
   - lo usado vale el 50 %;
   - tramos y crecimiento como en §2.4;
   - Contrabandista +10, Red criminal +5 y Notoriedad 3 o más −10;
   - soplo con 96-100 y requisa si no hay Escondrijo;
   - la escasez sube el valor de todo;
   - la pestaña se llama «Almacén»;
   - no hay venta a un perista.
5. **Soplo a cualquier precio:** también se tira el soplo en el tramo «Nadie lo compra», aunque no pueda venderse. Tener algo en el
   mercado negro siempre tiene riesgo.
6. **El registro público** cuenta lo que pasó (entradas, precios, ventas, soplos, requisas), nunca las probabilidades ni las tiradas.
7. **Inventario ↔ almacén.** Implementado el 14 oct 2026.
   - **Meter:** los jugadores meten en el almacén lo que lleva su personaje (armas, armaduras o equipo, con cuántas unidades). Solo el
     director añade directamente desde la tabla de precios u «otra cosa», y además puede meter desde el inventario de cualquier PJ.
   - **Armadura puesta:** se puede meter; si no le queda otra igual, se le quita (desvío 0).
   - **Conservación:** nuevo o usado lo elige quien lo mete (por ahora).
   - **Sacar:** el lote va al inventario de quien lo saca, a la lista de la que vino. Si el director lo saca como «Director», solo sale
     del almacén.
   - **API:** lo hace el servidor en una sola transacción, como los aportes (`POST /campaigns/{id}/crew/almacen/entradas` y
     `POST /campaigns/{id}/crew/almacen/{loteId}/salida`), con el personaje y la hoja bloqueados. Si el personaje no lleva tantas
     unidades, responde 400 y no cambia nada. El lote guarda `lista` (de qué lista del inventario vino).

## 0. Resumen

| Pieza | Qué hace |
|---|---|
| **Almacén** (pestaña nueva de La banda) | Lo que la banda guarda: objetos de la tabla de precios del libro o cosas sueltas, con cantidad y **nuevo/usado**. Cada lote tiene su **valor** (precio del libro × conservación, o lo que tase la DJ). |
| **Poner a la venta** | Quien lo pone a la venta **fija el precio por unidad** (obligatorio). La hoja enseña al momento el tramo de precio («Justo», «Caro»…) y la probabilidad de venderse cada semana. |
| **Semanas a la venta** | Cada lote lleva la cuenta de las semanas que lleva en el mercado negro; cuantas más lleva, más fácil es venderlo (la voz corre). |
| **Pasar semanas** | Antes de confirmar, muestra la probabilidad de cada lote semana a semana y la de venderse en todo el periodo. Al confirmar se tira un d100 por lote y semana: se vende, no pasa nada o hay un **soplo** (Notoriedad +1 y, sin Escondrijo, la mercancía se pierde). Lo vendido entra en la tesorería y queda en el registro. |

Sin cambios en la API ni migraciones: el almacén vive en el documento de la banda (`CrewSheets.State`).

## 1. Qué dice el libro sobre ganar dinero (contexto)

### 1.1 Manual de Nacidos de la bruma

- **Refugios** (Cap. 8 › Refugios, PDF 306-307): **ninguna mejora da dinero**. Almacén, Armería y Despensa dan bienes tras un descanso
  (un objeto que no sea arma de hasta 10 ar en la Era 1 / 50 ar en la Era 2; munición o un arma o armadura de hasta 25 / 150 ar; raciones
  para un día): ahorran gastos, no generan ingresos. La Mesa de trabajo da ventaja al fabricar.
- **Organizaciones** (Cap. 8 › Organizaciones › Ejemplo de organización: empresa comercial, PDF 304): la única fuente fija de dinero.
  «Margen de beneficio»: 50 / 125 / 250 / 500 ar al mes en la Era 1 y 100 / 250 / 500 / 1000 ar en la Era 2, según la escala, mientras el
  negocio se mantenga sano y protegido. Ya está en la app: «Pasar semanas» lo paga por semanas. Ninguna mejora de organización da dinero.
- **Reposo** (Cap. 9 › Aventuras › Reposo, PDF 314-316): «Trabajar en una profesión» existe, pero sin cifras; en general, el desenlace de
  una actividad de reposo puede incluir dinero si la DJ lo decide.
- **Manufactura** (Cap. 7 › Objetos › Manufactura, PDF 279-280): los materiales cuestan la mitad del precio del objeto. El libro no dice
  a cuánto se vende lo fabricado.
- **Pericia Bajos fondos** (Cap. 2 › Orígenes, PDF 53): a quien la tiene le cuesta poco encontrar un perista o un comprador para
  mercancía robada, con un riesgo a la altura de la ganancia. Es la idea de fondo de este sistema.

### 1.2 El legado de los nacidos de la bruma

- **Apéndice E: Reposo › Trabajar en una profesión** (PDF 261 y 264):
  - **Trabajo honrado**: 4d6 ar cada cinco días en la Era 1 (4d6 × 2 en la Era 2), +1d6 (+2d6) si tiene que ver con una pericia o se
    repite el mismo empleo.
  - **Contrabando** (Era 1): al menos dos PJ, cada uno una prueba CD 12 subiendo la apuesta; con éxito, 5d10 ar cada cinco días; quien
    falla es capturado, no gana nada y pasa 1d4 días con las consecuencias.
  - **Recuperación de objetos** (Era 2): igual, pero da un objeto de la Era 1 de 6d10 × 2 ar, para vender o quedárselo.
- Otras fuentes puntuales:
  - el legado del Emprendedor tiene una empresa que da 100 ar al mes;
  - el Pilluelo puede trabajar con Kandor por 5d10 ar a la semana;
  - en la cripta, los materiales que sobran se venden a 50 ar por unidad.

**Conclusión:** vender mercancía en el mercado negro es una regla nuestra. Se apoya en la tabla de precios del libro, en la pericia
Bajos fondos y en lo que ya tiene la banda (el oficio Contrabandista, la Red criminal, la Notoriedad, la Escasez y el Escondrijo).

### 1.3 La tabla de precios

Ya está en la app: es el **catálogo del mundo** (Manual, Cap. 7 › Objetos), servido por `/catalog/{weapons|armor|gear}?campaignId=`
y filtrado por la era de la campaña. En DEV, Nacidos de la bruma tiene:
- **32 armas** con precio (20 de las dos eras y 12 solo de la Era 2) y 3 sin precio (son recompensas);
- **6 armaduras** con precio y 2 sin precio;
- **84 objetos de equipo**, todos con precio, de ellos 13 viales de metal (`category = 'vial'`), con la cuenta de atium (150 ar).

Lo que no tiene precio (las recompensas, o algo que no está en la tabla) lo **tasa la DJ**.

## 2. Reglas `[casero]`

### 2.1 El almacén

- Un **lote** = una fila: nombre, cantidad, conservación (**nuevo** o **usado**), valor por unidad y notas («Botín del muelle de Kandor»).
  Las unidades de un lote se venden juntas; para vender una parte, se separa en otro lote.
- Se entra **desde la tabla de precios** (el valor sale solo) o como **otra cosa** (el valor lo pone la DJ: hasta entonces el lote está
  «Pendiente de tasar» y no se puede poner a la venta).
- **Valor por unidad** = precio del libro × conservación: nuevo 100 %, **usado 50 %**. Se fija al entrar: si luego cambia el catálogo, el
  lote no cambia.
- Queda anotado **quién lo trae** (un PJ, o el director).

### 2.2 Valor de mercado

**Valor de mercado** = valor × multiplicador de **escasez** (el mismo de «Pasar semanas»: sin escasez ×1, asedio ×1,5, invierno de los
koloss ×2). Con escasez todo vale más, así que el mismo precio resulta más barato y se vende antes. La banda guarda la última escasez
elegida (`escasez`), que es la que usan el almacén y la siguiente vez que se pasan semanas.

### 2.3 Poner a la venta

Quien lo pone a la venta **fija el precio por unidad**; es obligatorio. Ve el precio de mercado y, si el lote tiene varias unidades,
lo que vale el lote entero. Solo el director ve, mientras escribe el precio, el tramo, la probabilidad de esta semana y su desglose.
No hay botones de precio sugerido: delatarían los tramos.

### 2.4 Probabilidad de venta de cada semana

1. **Tramo de precio:** precio ÷ valor de mercado.

   | Precio respecto al valor de mercado | Tramo | Probabilidad base por semana |
   |---|---|---|
   | hasta el 50 % | Regalado | 80 % |
   | hasta el 80 % | Barato | 60 % |
   | hasta el 110 % | Justo | 40 % |
   | hasta el 140 % | Caro | 20 % |
   | hasta el 200 % | Abusivo | 5 % |
   | más del 200 % | Nadie lo compra | 0 % (nunca se vende, pero el soplo se tira igual) |

2. **Semanas a la venta:** cada semana que ya lleva suma un 25 % de la base, hasta 4 semanas (como mucho, el doble). Un lote «Caro»:
   20 % la primera semana, 25 %, 30 %, 35 % y 40 % desde la quinta.
3. **Modificadores** (puntos que se suman):

   | Modificador | Puntos |
   |---|---|
   | La banda tiene un trabajador **Contrabandista** con ella (activo o herido) | +10 |
   | Cada trabajador (activo o herido) en el puesto del **Almacén** de un refugio (la mejora, lista) | +10, hasta +20 |
   | La banda es una **Red criminal** | +5 |
   | **Notoriedad 3 o más** (los compradores tienen miedo) | −10 |

4. **Límites:** entre el 1 % y el **95 %**. Un tramo de 0 % se queda en 0.

**Probabilidad de venderse en 4 semanas, sin modificadores:**

| Tramo | Semana 1 | 2 | 3 | 4 | En 4 semanas |
|---|---|---|---|---|---|
| Regalado | 80 % | 95 % | 95 % | 95 % | ≈100 % |
| Barato | 60 % | 75 % | 90 % | 95 % | ≈100 % |
| Justo | 40 % | 50 % | 60 % | 70 % | 96 % |
| Caro | 20 % | 25 % | 30 % | 35 % | 73 % |
| Abusivo | 5 % | 6 % | 8 % | 9 % | 25 % |

**Ejemplos** (Era 1):

- **2 × Catalejo usado:** el libro dice 250 ar, así que vale 125 ar por unidad.
  - A 140 ar sin escasez es el 112 %: «Caro», 20 % la primera semana y 73 % en un mes.
  - Con un Contrabandista: 30 %, 35 %, 40 % y 45 %, es decir, 85 % en un mes.
  - Con el asedio el valor de mercado sube a 187,5 ar, y 140 ar es el 75 %: «Barato», 60 % la primera semana.
- **1 × Cuenta de atium nueva:** vale 150 ar. A 300 ar es el 200 %: «Abusivo», un 25 % en un mes, y cada semana sin vender es un 5 % de
  soplo.

### 2.5 La tirada, al pasar semanas

- Solo «Pasar semanas» mueve el reloj del mercado, igual que obras y sueldos. Por cada lote a la venta y cada semana se tira **1d100**:
  - **tirada ≤ probabilidad de esa semana**: se vende. La tesorería suma precio × cantidad, el registro lo anota (sin la tirada) y el
    lote se cierra.
  - **96-100**: **soplo**. Notoriedad +1, como mucho +1 por cada vez que se pasan semanas. Si la banda no tiene un **Escondrijo** listo
    en algún refugio, la mercancía se **requisa** y se pierde; con Escondrijo se salva y sigue a la venta. Como la probabilidad nunca
    pasa del 95 %, el riesgo es siempre del 5 % por semana sin vender: poner un precio alto expone más tiempo.
  - Cualquier otra tirada: no pasa nada. El lote suma una semana a la venta.
- El dinero de las ventas cuenta como ingreso del periodo, antes de pagar mantenimiento y sueldos, igual que el beneficio de la empresa.
- **Vista previa** (antes de confirmar): por cada lote, la probabilidad de cada semana y la de venderse en el periodo. Las ventas **no**
  cuentan en la tesorería prevista; la hoja lo dice («Las ventas se tiran al confirmar»).
- **Resultado** (después): lo vendido, en qué semana y con qué tirada, los soplos y lo requisado.

### 2.6 Otras acciones

| Acción | Efecto | Quién |
|---|---|---|
| Cambiar el precio | Nuevo precio; **conserva** las semanas a la venta | quien actúa como su PJ, o el director |
| Retirar de la venta | Vuelve a «Guardado»; las semanas vuelven a 0 | quien actúa como su PJ, o el director |
| Sacar del almacén | Un PJ se lo lleva (pide confirmación). El lote se cierra como «Retirado» | quien actúa como su PJ, o el director |
| Tasar | Fija el valor por unidad de un lote «Pendiente de tasar» o lo corrige | director |
| Vender en mano | Venta pactada en la partida, por el importe que diga la DJ; va a la tesorería | director |
| Requisada | Se pierde (un registro, un robo…); pide confirmación | director |
| Borrar | Quita un lote metido por error, sin registro de dinero; pide confirmación | director |

### 2.7 Quién ve qué

Quien tiene acceso a la banda ve los lotes, su precio de mercado, el precio pedido y las semanas a la venta. Las cuentas del mercado
negro (valor con escasez, tramo, probabilidad, modificadores y riesgo) solo las ve el director: en la pestaña Almacén y en «Pasar
semanas», que solo él ejecuta. Ver «Decisiones de Xavi».

## 3. La app

### 3.1 Experiencia y textos

**Pestaña «Almacén»** (icono `Package`), entre «Refugio» y «Trabajadores». Las pestañas ya se desplazan en horizontal en el móvil, así
que caben cinco.

- **Cabecera de la pestaña**
  - «A la venta: N lotes · X ar si se vende todo»
  - «Guardado: M lotes · valen Y ar»
  - Botón «Añadir mercancía» (si `puedeActuar`).
- **Desplegable** «Cómo funciona el mercado negro»: tramos, semanas, modificadores, soplo y escasez actual, con `TextoRegla`
  (`origen: 'casero'`).
- **Sección «A la venta»:** una tarjeta por lote.
  - Título: «2 × Catalejo».
  - Etiquetas: «Usado» y el tramo («Caro», con el tono de `tonoTramo`).
  - Precio: «140 ar por unidad · vale 125 ar (112 %)».
  - Estado: «Lleva 2 semanas a la venta · esta semana: 30 %».
  - «La puso a la venta Kelsier».
  - Botones: «Cambiar precio» y «Retirar de la venta»; el director, además, «Vender en mano» y «Requisada».
- **Sección «Guardado»:** tarjetas con «Poner a la venta» y «Sacar del almacén». Un lote sin valor muestra «Pendiente de tasar»: el
  director ve «Tasar» y el jugador lee «La DJ tiene que tasarlo».
- **Desplegable «Historial»** (lotes cerrados):
  - «Vendido por 280 ar · en 2 semanas · 14/10»
  - «Lo sacó Vin»
  - «Requisado tras un soplo»
- **Vacío:** «El almacén está vacío» · «Lo que la banda guarda o quiere colocar en el mercado negro».

**Hoja «Añadir mercancía»**

- Selector `Segmented` con dos opciones:
  - **«De la tabla de precios»**: un campo «Buscar» filtra un `Select` agrupado (Armas · Armaduras · Equipo · Viales de metal) cuyas
    opciones dicen «Catalejo · 250 ar»; lo que no tiene precio dice «(sin precio: lo tasa la DJ)».
  - **«Otra cosa»**: «Nombre», y para el director, «Valor por unidad».
- «Cantidad» (`Stepper` 1-999).
- «Conservación» (`Segmented` Nuevo / Usado, con la pista «Usado vale el 50 % del precio del libro»).
- Línea de valor: «Vale 125 ar por unidad (250 ar en el libro, usado)».
- «Notas»: «De dónde sale».
- `SelectorActor` «¿Quién lo trae?».
- `Switch` «Ponerlo a la venta ya», que abre el bloque de precio.

**Bloque de precio** (componente `PrecioVenta`, compartido por «Añadir mercancía», «Poner a la venta» y «Cambiar precio»):
- `CampoCantidad` «Precio por unidad»;
- botones de precio sugerido por tramo;
- línea en vivo, por ejemplo «Caro · 112 % del valor · esta semana 30 %, luego 35 %, 40 %, 45 %», con el desglose debajo;
- si no hay probabilidad: «A ese precio nadie lo compra».

**Hoja «Pasar semanas»**: un bloque nuevo, «Mercado negro».
- Una línea por lote: «2 × Catalejo · 280 ar · 30 % → 45 % · 85 % de venderse en 4 semanas».
- Nota: «Las ventas se tiran al confirmar: no cuentan en la tesorería de arriba».
- Al confirmar, la hoja no se cierra. Pasa al paso **«Resultado»**:
  - «Vendido: 2 × Catalejo por 280 ar (semana 2, tirada 31 de 35)»
  - «Soplo con 1 × Cuenta de atium (tirada 98): Notoriedad +1, requisada»
  - «Sigue a la venta: …»
  - Botón «Cerrar».

**Registro**: tipos nuevos `almacen` («Almacén») y `mercado` («Mercado negro»).

### 3.2 Tipos

`src/lib/banda/tipos.ts` (núcleo Cosmere, se añaden líneas):

```ts
/** A price band of the black market: the asking price as a % of the market value, up to `hasta` (null = above the last one) */
export interface TramoPrecioDef {
  hasta: number | null
  etiqueta: string
  /** Chance of selling in one week, % (0 = nobody buys it, no roll) */
  prob: number
}

/** Black market of the crew's store (our rule): bands, how the weeks on sale help, modifiers and risk */
export interface MercadoNegroDef {
  /** Value of a used item, % of its book price */
  usadoPct: number
  tramos: TramoPrecioDef[]
  /** Each week already on sale adds this % of the band's chance, up to `semanasMax` weeks */
  crecimientoPorSemana: number
  semanasMax: number
  modificadores: {
    /** Points while the crew has a worker of this trade, active or wounded */
    oficio: { id: string; puntos: number }
    /** Points by organization type of the crew */
    organizacion: Record<string, number>
    notoriedad: { desde: number; puntos: number }
  }
  /** Top of the weekly chance, %; a d100 above 100 − riesgo is a tip-off */
  maximo: number
  riesgo: number
  /** Upgrade that hides the goods from a search: with it ready in a refuge, a tip-off does not cost them */
  mejoraEscondite: string | null
  /** The rule as the page shows it */
  regla: Definicion
}
```

and in `CatalogoBanda`: `mercadoNegro: MercadoNegroDef | null`.

`src/pages/banda/estado.ts`:

```ts
export type Conservacion = 'nuevo' | 'usado'
export type SituacionMercancia = 'guardada' | 'en-venta' | 'vendida' | 'retirada' | 'requisada'

/** A lot of the crew's store: its units are sold together */
export interface Mercancia {
  id: string
  nombre: string
  /** Price-table item it comes from (its book price gave the value); null = something else, valued by the director */
  deCatalogo: { tipo: 'arma' | 'armadura' | 'equipo'; id: number; precioLibro: number | null } | null
  cantidad: number
  conservacion: Conservacion
  /** Value of one unit in the world's money; null = waiting for the director to value it */
  valor: number | null
  /** Asking price of one unit while on sale; null = not on sale */
  precio: number | null
  /** Weeks on sale so far (each «Pasar semanas» adds the weeks it stays unsold) */
  semanasALaVenta: number
  situacion: SituacionMercancia
  traidaPor: Actor | null
  /** ISO date */
  entradaEn: string
  /** Who put it on sale and set the price */
  puestaPor: Actor | null
  /** ISO date it left the store (sold, taken out, seized) */
  cerradaEn: string | null
  /** What the whole lot was sold for */
  importeVenta: number | null
  notas: string
}
```

- **`BandaEstado`** gets:
  - `almacen: Mercancia[]`;
  - `escasez: string | null`: the last scarcity context chosen in «Pasar semanas».
- **`normalizarMercancia`**:
  - `cantidad` is an integer ≥ 1;
  - `valor` and `precio` are ≥ 0 with 2 decimals, or null;
  - `semanasALaVenta` is an integer ≥ 0;
  - `situacion` is one of the five, `guardada` by default.
- **`normalizarBanda`**: keeps every open lot and the **100** most recent closed ones.
- **`TipoMovimiento` / `TIPOS_MOVIMIENTO`**: add `'almacen' | 'mercado'`.
- **`VERSION_BANDA`**: raise it to 2 **only** if the crew sheet (iterations 1-2) is deployed before this feature. A client that does
  not know `almacen` would drop it on its next save; with version 2 it opens the sheet read-only. While the crew has not been deployed,
  it stays at 1.

### 3.3 Catálogo de Nacidos de la bruma (`src/data/mistborn/banda/index.ts`)

```ts
mercadoNegro: {
  usadoPct: 50,
  tramos: [
    { hasta: 50, etiqueta: 'Regalado', prob: 80 },
    { hasta: 80, etiqueta: 'Barato', prob: 60 },
    { hasta: 110, etiqueta: 'Justo', prob: 40 },
    { hasta: 140, etiqueta: 'Caro', prob: 20 },
    { hasta: 200, etiqueta: 'Abusivo', prob: 5 },
    { hasta: null, etiqueta: 'Nadie lo compra', prob: 0 },
  ],
  crecimientoPorSemana: 25,
  semanasMax: 4,
  modificadores: {
    oficio: { id: 'contrabandista', puntos: 10 },
    organizacion: { 'red-criminal': 5 },
    notoriedad: { desde: 3, puntos: -10 },
  },
  maximo: 95,
  riesgo: 5,
  mejoraEscondite: 'escondrijo',
  regla: {
    titulo: 'El mercado negro', origen: 'casero',
    texto: 'Lo que la banda guarda se puede colocar en el mercado negro al precio que elija quien lo pone a la venta. Cada semana que pasa hay una probabilidad de venderlo, según el precio comparado con su valor de mercado (el del libro, la mitad si está usado, y más con escasez) y las semanas que lleve a la venta. Un 96-100 en la tirada es un soplo: Notoriedad +1, y sin Escondrijo la mercancía se pierde.',
  },
},
```

### 3.4 Lógica pura (`src/pages/banda/mercadoNegro.ts`, nuevo)

```ts
export interface ProbabilidadVenta {
  /** % for that week (0..maximo) */
  prob: number
  tramo: TramoPrecioDef
  /** Price ÷ market value, % */
  ratio: number
  /** Of one unit */
  valorMercado: number
  /** Lines the page shows: «Caro (112 % del valor) 20», «Lleva 2 semanas a la venta +10», «Contrabandista +10» */
  desglose: { concepto: string; puntos: number }[]
}

export const multiplicadorEscasez: (catalogo: CatalogoBanda, contextoId: string | null) => number
export const valorMercado: (m: Mercancia, multiplicador: number) => number | null
export const tramoDe: (ratio: number, def: MercadoNegroDef) => TramoPrecioDef
/** Chance of selling `m` at `precio` in a week that starts after `semanas` weeks on sale; null = no value or no market */
export function probabilidadVenta(m: Mercancia, precio: number, semanas: number, doc: DocBanda, ctx: CtxBanda, contextoId: string | null): ProbabilidadVenta | null
/** 1 − Π(1 − p), %, for the chances of consecutive weeks */
export const probabilidadAcumulada: (probs: number[]) => number
/** The highest price of each band with a chance (the suggested prices) */
export const preciosSugeridos: (valorMercado: number, def: MercadoNegroDef) => { etiqueta: string; precio: number }[]
/** `n` rolls of 1d100 with crypto.getRandomValues (only the page calls it, never an operation) */
export const tirarD100: (n: number) => number[]
```

- **Cálculo de la probabilidad**:
  1. `prob = tramo.prob × (1 + crecimientoPorSemana/100 × min(semanas, semanasMax))`.
  2. Se suman los modificadores.
  3. Se redondea y se limita a `[1, maximo]`.
  4. Si `tramo.prob === 0`, el resultado es 0 sin modificadores.
- **Contrabandista**: se cuenta con `privadoDe(t, doc.secretos, catalogo).estado` (activo o herido) para los trabajadores `enBanda`.
- **Escondite**: se mira si hay un refugio que no esté `perdido` con una mejora `mejoraEscondite` en estado `lista`.

### 3.5 «Pasar semanas» (`economia.ts` y `SemanasSheet.tsx`)

- **Firma nueva:**
  - `simularSemanas(doc, ctx, semanas, contextoId, tiradas?: Record<string, number[]>)`
  - `pasarSemanas(semanas, contexto, tiradas)`
  - Las tiradas se generan en la página (`tirarD100(semanas)` por cada lote `en-venta`) **al pulsar confirmar**, nunca dentro de la
    operación. Así la operación sigue siendo pura y, tras un 409, se vuelve a aplicar con las mismas tiradas.
  - Un lote puesto a la venta mientras tanto, sin tiradas, ni se vende ni suma semanas en esa pasada.
- **`ResumenSemanas.mercado`:**

  ```ts
  export interface LineaMercado {
    id: string
    nombre: string          // «2 × Catalejo»
    importe: number         // precio × cantidad
    probs: number[]         // % de cada semana del periodo
    acumulada: number       // % de venderse en el periodo
    resultado?: { vendida: boolean; semana: number | null; tiradas: number[]; soplo: boolean; requisada: boolean }
  }
  ```

- **Con tiradas:**
  - lo vendido entra en `ingresos` (concepto «Mercado negro · 2 × Catalejo») antes de pagar;
  - se cierra el lote (`vendida`, `importeVenta`, `cerradaEn`);
  - los soplos suben la Notoriedad como mucho en 1 y requisan sin escondite;
  - el resto suma `semanas` a `semanasALaVenta`;
  - se anota cada venta, soplo y requisa (`tipo: 'mercado'`, con `dinero` o `cantidad`).
- **Sin tiradas** (vista previa): solo `probs` y `acumulada`.
- **La pasada guarda la escasez:** `pasarSemanas` deja `banda.escasez = contexto`, y `SemanasSheet` la usa como valor inicial del
  selector de escasez.
- **`SemanasSheet`:**
  - bloque «Mercado negro»;
  - al confirmar, `ejecutar(pasarSemanas(semanas, contexto, tiradas), () => setResultado(simularSemanas(doc, crearCtx(), semanas, contexto, tiradas).resumen))`;
  - paso «Resultado» con su botón «Cerrar».

### 3.6 Operaciones (`operaciones.ts`)

Mismo patrón que el resto: puras, con ids fijados al crear la operación, mensajes de `ErrorBanda` en castellano y un movimiento en el
registro con su `Actor`.

```ts
export interface DatosMercancia {
  nombre: string
  deCatalogo: Mercancia['deCatalogo']
  cantidad: number
  conservacion: Conservacion
  valor: number | null
  notas: string
}
export const entrarMercancia = (datos: DatosMercancia, actor: Actor | null, precio: number | null): OpBanda   // optional: on sale at once
export const editarMercancia = (id: string, datos: DatosMercancia): OpBanda                                  // only while 'guardada'
export const ponerALaVenta = (id: string, precio: number, actor: Actor | null): OpBanda
export const cambiarPrecio = (id: string, precio: number, actor: Actor | null): OpBanda
export const retirarDeLaVenta = (id: string, actor: Actor | null): OpBanda
export const sacarDelAlmacen = (id: string, actor: Actor | null, motivo: string): OpBanda
export const tasarMercancia = (id: string, valor: number): OpBanda                                          // director
export const venderEnMano = (id: string, importe: number, motivo: string): OpBanda                          // director
export const requisarMercancia = (id: string, motivo: string): OpBanda                                      // director
export const borrarMercancia = (id: string): OpBanda                                                        // director
```

**Validaciones:**
- La cantidad es un entero de 1 a 999.
- Precio, valor e importe son mayores que 0, con hasta 2 decimales (`CampoCantidad`).
- No se pone a la venta lo que no tiene valor: «Primero hay que tasarlo».
- No se toca un lote cerrado: «Ese lote ya no está en el almacén».
- Las acciones de jugador exigen actor: `exigirActor`.

**Textos del registro:**

| Tipo | Texto | Dato |
|---|---|---|
| `almacen` | «Entra en el almacén: 2 × Catalejo (usado), 125 ar por unidad» | |
| `almacen` | «A la venta: 2 × Catalejo a 140 ar por unidad» | |
| `almacen` | «Nuevo precio de 2 × Catalejo: 140 → 120 ar» | |
| `almacen` | «Retirado de la venta: …» | |
| `almacen` | «Sale del almacén: … (motivo)» | |
| `almacen` | «Tasado: … en 80 ar por unidad» | |
| `mercado` | «Vendido en el mercado negro: 2 × Catalejo por 280 ar (semana 2, tirada 31 de 35)» | `dinero` |
| `mercado` | «Soplo sobre 1 × Cuenta de atium (tirada 98)» | `cantidad` +1 de Notoriedad |
| `mercado` | «Requisado: …» | |
| `mercado` | «Vendido en mano: … por X ar» | `dinero` |

### 3.7 API

Nada. El almacén va en `State`. El aporte del servidor edita ese JSON en su sitio (`JsonNode`), así que respeta `almacen`. Los
jugadores con acceso ya pueden guardar `State`.

## 4. Tareas

Todas en `cosmere-web-banda` (rama `feature/banda`). Después de cada una: `npx tsc -b`, y
`npx eslint src/pages/banda src/lib/banda src/data/mistborn/banda`, sin errores ni avisos.

1. **T1 · Catálogo.**
   - Archivos: `src/lib/banda/tipos.ts` (`TramoPrecioDef`, `MercadoNegroDef`, `CatalogoBanda.mercadoNegro`) y
     `src/data/mistborn/banda/index.ts` (§3.3).
   - Acepta: compila y el catálogo de Nacidos de la bruma tiene `mercadoNegro`.
2. **T2 · Documento.**
   - Archivo: `src/pages/banda/estado.ts` (§3.2).
   - Acepta: `normalizarBanda({})` da `almacen: []` y `escasez: null`; un lote con campos raros sale válido; se conservan 100 lotes
     cerrados.
3. **T3 · Lógica del mercado.**
   - Archivo: `src/pages/banda/mercadoNegro.ts` (§3.4).
   - Acepta, en la consola del navegador con el servidor de desarrollo
     (`const mn = await import('/src/pages/banda/mercadoNegro.ts')`):
     - 2 × Catalejo usado (valor 125) a 140 sin escasez da «Caro» y 20 %; con 2 semanas, 30 %;
     - con el asedio da «Barato» y 60 %;
     - a 260 da 0 %;
     - `probabilidadAcumulada([20, 25, 30, 35])` da 73.
4. **T4 · Operaciones.**
   - Archivo: `src/pages/banda/operaciones.ts` (§3.6).
   - Acepta: cada operación deja su movimiento en el registro y rechaza los casos de §3.6 con su mensaje.
5. **T5 · Pasar semanas.**
   - Archivos: `src/pages/banda/economia.ts` y `src/pages/banda/SemanasSheet.tsx` (§3.5).
   - Acepta: la vista previa no cambia la tesorería prevista por las ventas. Con tiradas fijas por consola:
     - `[1, …]` vende en la semana 1 y suma el importe;
     - `[98, 98]` sube la Notoriedad solo 1 y requisa sin Escondrijo;
     - con Escondrijo listo, no requisa.
6. **T6 · Pestaña Almacén.**
   - Archivos: `src/pages/banda/PanelAlmacen.tsx` (nuevo: lista, `MercanciaSheet`, `PrecioVenta`, hojas de precio y tasación,
     `ConfirmDialog` para sacar, requisar y borrar) y `etiquetas.ts` (`SITUACION_MERCANCIA`, `tonoTramo(prob)`).
   - Precios con TanStack Query:
     - `['catalog', cId, 'weapons'|'armor'|'gear']` y `queryFn: () => catalogApi.getWeapons(cId)`;
     - mismas claves que `CatalogPage`;
     - con `enabled` solo mientras la hoja está abierta.
   - Acepta: textos de §3.1; el jugador no ve «Tasar», «Vender en mano», «Requisada» ni «Borrar».
7. **T7 · Página y registro.**
   - Archivos: `BandaPage.tsx` (pestaña «Almacén», con el icono `Package`, entre Refugio y Trabajadores) y `PanelRegistro.tsx`
     (etiquetas `almacen` y `mercado`).
   - Acepta: a 375 px las cinco pestañas se desplazan sin romper el diseño.
8. **T8 · Comprobación.**
   - `npm run build`: `BandaPage` y el catálogo siguen en trozos perezosos, sin importaciones nuevas en el código inicial.
   - En «Bruma TEST» (id 42), como director:
     1. entrar 2 × Catalejo usado;
     2. ponerlo a 140;
     3. pasar 4 semanas con asedio;
     4. revisar el resultado, la tesorería, el registro y las semanas del lote sin vender.
   - Como `nb-jugador`, con la banda compartida: entrar, poner a la venta y cambiar el precio; no ve las acciones del director.
   - Sin errores en la consola.

## 5. Preguntas para Xavi (con la opción por defecto)

> Respondidas el 14 oct 2026: van todas con la opción por defecto, más las decisiones del principio del documento.

1. **¿Adónde va el dinero de una venta?** Por defecto, a la **tesorería**. Que vaya a la bolsa de quien lo puso a la venta necesitaría
   un endpoint en la API, como los aportes.
2. **¿Cuánto vale lo usado?** Por defecto, el **50 %** del precio del libro. ¿Añadimos «Dañado» (25 %)?
3. **¿Te encajan los tramos y el crecimiento por semanas?** Por defecto, la tabla de §2.4: a precio justo se vende casi seguro en un
   mes; a precio abusivo, una vez de cada cuatro.
4. **¿Estos modificadores?** Por defecto: Contrabandista +10, Red criminal +5 y Notoriedad 3 o más −10. ¿Añadimos una casilla «Con
   contactos en los bajos fondos» (+10), por la pericia del Manual? La app no guarda las pericias de los PJ.
5. **¿Cómo funciona el soplo?** Por defecto: 96-100, Notoriedad +1 como mucho por pasada, y requisa si no hay Escondrijo. ¿O que la
   DJ decida la requisa a mano?
6. **¿La escasez sube el valor de todo?** Por defecto, **sí** (×1,5 o ×2). ¿O solo comida, metales y armas?
7. **¿Cómo se llama la pestaña?** Por defecto, «**Almacén**», como lo llamas. Pero coincide con la mejora oficial «Almacén» del
   refugio, que es otra cosa; la alternativa es «**Alijo**».
8. **¿Vender ya a un perista?** Por defecto, **no** en la v1. Sería una venta inmediata por el 40 % del valor (50 % con
   Contrabandista), sin esperar semanas.

## 6. Fuera de alcance

- ~~Mover objetos entre la bolsa de un PJ (su equipo) y el almacén~~: hecho; ver la decisión 7.
- Comprar en el mercado negro.
- El **Contrabando** de El legado como orden de los trabajadores (5d10 ar cada cinco días, con riesgo de captura): es una orden, no una
  venta, y va en la «Fase de refugio» (F2 de `propuesta.md`).
