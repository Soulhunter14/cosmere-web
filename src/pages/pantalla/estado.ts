/**
 * Document of the «Pantalla del director»: the whole table state of one campaign, stored by the API as ONE JSON object
 * (`GmScreens.State`, `GET|PUT /campaigns/{id}/gm-screen`). The web owns its shape: `version` lets a later release migrate it,
 * and `normalizarEstado` turns any stored document (older, partial or hand-edited) into a valid one, so the screen never breaks.
 * Everything here is pure (no React): the panels change the document through `usePantalla().actualizar(borrador => …)`.
 */
import type { AnyRollResult } from '../../utils/dice'

export const VERSION_ESTADO = 2
/** Closed sessions kept in the document (the oldest ones are dropped) */
const MAX_HISTORIAL = 30
const MAX_TIRADAS_PRIVADAS = 60
const MAX_CAMBIOS = 150
/** Quick taps on the same resource of the same combatant join one line of the record */
const UNIR_CAMBIOS_MS = 20_000
const MAX_EVENTOS = 400
/** Encounters open at the same time (the party split in two or three fights) */
export const MAX_ENCUENTROS = 4

export type TipoEscena = 'narrative' | 'social' | 'exploration' | 'combat' | 'choice'
export type Fase = 'pj-rapido' | 'pnj-rapido' | 'pj-lento' | 'pnj-lento'
export type Bando = 'pj' | 'pnj'
export type Turno = 'rapido' | 'lento'
/** Tier of an adversary (catalog `tipo`: «Secuaz Rango 1…», «Rival…», «Jefe…») */
export type Rango = 'secuaz' | 'rival' | 'jefe'
export type EstadoTrama = 'abierta' | 'en-curso' | 'resuelta'
export type TipoEvento = 'apunte' | 'escena' | 'combate' | 'avance' | 'meta' | 'trama'

const TIPOS_ESCENA: readonly TipoEscena[] = ['narrative', 'social', 'exploration', 'combat', 'choice']
const RANGOS: readonly Rango[] = ['secuaz', 'rival', 'jefe']
const ESTADOS_TRAMA: readonly EstadoTrama[] = ['abierta', 'en-curso', 'resuelta']
const TIPOS_EVENTO: readonly TipoEvento[] = ['apunte', 'escena', 'combate', 'avance', 'meta', 'trama']

/** Round order of the book (combatRules.ts, «Orden del combate»): PJ rápidos → PNJ rápidos → PJ lentos → PNJ lentos */
export const FASES: readonly Fase[] = ['pj-rapido', 'pnj-rapido', 'pj-lento', 'pnj-lento']
export const FASE_INFO: Record<Fase, { bando: Bando; turno: Turno; label: string }> = {
  'pj-rapido': { bando: 'pj', turno: 'rapido', label: 'PJ rápidos' },
  'pnj-rapido': { bando: 'pnj', turno: 'rapido', label: 'PNJ rápidos' },
  'pj-lento': { bando: 'pj', turno: 'lento', label: 'PJ lentos' },
  'pnj-lento': { bando: 'pnj', turno: 'lento', label: 'PNJ lentos' },
}

export interface Recurso { actual: number; max: number }
export interface DadoDano { dados: number; caras: number; mod: number }
/** An attack read from the adversary's notes («Acometida: Maza +2. Rasguño 3(1d6). Impacto 5(1d6+2).») */
export interface AtaqueDef {
  nombre: string
  bono: number
  impacto: DadoDano | null
  rasguno: DadoDano | null
  /** Damage-type suffix of the book («esp.») or '' */
  nota: string
}
/** A condition on a combatant: `id` of `WorldConfig.estados` (or a free one) and its value between brackets ('' = none) */
export interface EstadoAplicado { id: string; valor: string }
export interface Defensas { fisica: number; cognitiva: number; espiritual: number }

export interface Combatiente {
  id: string
  bando: Bando
  nombre: string
  /** Campaign character it comes from (PJ), or null */
  characterId: number | null
  /** Catalog adversary it comes from (`/global-npcs`), or null */
  adversarioId: number | null
  rango: Rango | null
  /** Turn chosen for this round; a Jefe plays both */
  turno: Turno
  actuoRapido: boolean
  actuoLento: boolean
  reaccionUsada: boolean
  salud: Recurso
  concentracion: Recurso
  investidura: Recurso
  defensas: Defensas
  desvio: number
  estados: EstadoAplicado[]
  /** Condition names the adversary ignores («Inmunidades: Aturdido…») */
  inmunidades: string[]
  ataques: AtaqueDef[]
  /** Skill field → total modifier (rank + attribute), snapshot taken when it joined */
  habilidades: Record<string, number>
  notas: string
  derrotado: boolean
}

/** Why a combatant left the fight before its end: it fell (or was beaten), it fled or it surrendered */
export type MotivoSalida = 'derrotado' | 'huido' | 'rendido'
const MOTIVOS_SALIDA: readonly MotivoSalida[] = ['derrotado', 'huido', 'rendido']

/** Who left the screen before the end of the fight: only the name and why, for the summary when the fight ends */
export interface Retirado { nombre: string; motivo: MotivoSalida }

export interface Encuentro {
  id: string
  titulo: string
  ronda: number
  fase: Fase
  iniciadoEn: string
  combatientes: Combatiente[]
  retirados: Retirado[]
}

export interface ImagenEscena { url: string; titulo: string }
export interface EnemigoEscena { nombre: string; cantidad: number; adversarioId: number | null }

/** A scene written by the director (any world): what the book's adventure gives, typed by hand */
export interface EscenaPropia {
  id: string
  titulo: string
  tipo: TipoEscena
  leerEnVozAlta: string
  notas: string
  imagenes: ImagenEscena[]
  enemigos: EnemigoEscena[]
}

export interface Trama { id: string; titulo: string; detalle: string; estado: EstadoTrama }

export interface EventoBitacora {
  id: string
  /** ISO date */
  en: string
  tipo: TipoEvento
  /** Tag of a note («Pista», «Decisión»…) or of an automatic event («Escena», «Combate»…) */
  etiqueta: string
  texto: string
}

/** A table session of the log: number of the diary session it will become, and its events */
export interface SesionMesa {
  id: string
  numero: number | null
  titulo: string
  iniciadaEn: string
  terminadaEn: string | null
  eventos: EventoBitacora[]
}

export interface TiradaPrivada {
  id: string
  en: string
  /** Who rolled: «Director» or the combatant's name */
  quien: string
  etiqueta: string
  resultado: AnyRollResult
}

/** What the director changed on a combatant (damage, healing, Focus, Investiture, conditions), for the record of the Tiradas panel */
export type TipoCambio = 'dano' | 'cura' | 'concentracion' | 'investidura' | 'estado'

export interface CambioCombate {
  id: string
  en: string
  tipo: TipoCambio
  /** Combatant's name and id (the id lets quick resource taps join one line) */
  quien: string
  combatienteId: string
  /** Encounter title when several were open, '' otherwise */
  encuentro: string
  texto: string
  /** Resource lines: change so far and value before it, to rewrite the joined line */
  delta: number
  desde: number
}

export interface EscenaRef {
  origen: 'aventura' | 'propia'
  /** Chapter of the book's adventure; null for an own scene */
  capituloId: string | null
  escenaId: string
}

export interface PantallaEstado {
  version: typeof VERSION_ESTADO
  /** Where the story is: shown in the top bar */
  escenaActual: EscenaRef | null
  escenasPropias: EscenaPropia[]
  /** Progress marks: key (`claveAventura`, `claveEscenaPropia`) → ISO date when it was marked */
  marcas: Record<string, string>
  tramas: Trama[]
  /** Open encounters, in the order they started: usually one, more when the fight happens in several places at once */
  encuentros: Encuentro[]
  /** The encounter on screen, which is also where the «Añadir al encuentro» of the other panels goes */
  encuentroActivo: string | null
  sesion: SesionMesa | null
  historial: SesionMesa[]
  tiradasPrivadas: TiradaPrivada[]
  /** Changes made in the encounters, newest first */
  cambios: CambioCombate[]
}

// ── Ids and dates ────────────────────────────────────────────────────────────

let contador = 0
/** Unique enough for one document. `crypto.randomUUID` only exists in a secure context (not on http://<LAN ip>:5173) */
export const nuevoId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${(contador++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`

export const ahoraIso = () => new Date().toISOString()

export const estadoVacio = (): PantallaEstado => ({
  version: VERSION_ESTADO,
  escenaActual: null,
  escenasPropias: [],
  marcas: {},
  tramas: [],
  encuentros: [],
  encuentroActivo: null,
  sesion: null,
  historial: [],
  tiradasPrivadas: [],
  cambios: [],
})

// ── Normalization (any stored JSON → a valid document) ──────────────────────

type Obj = Record<string, unknown>
const esObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const texto = (v: unknown, def = ''): string => (typeof v === 'string' ? v : def)
const numero = (v: unknown, def = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : def)
const entero = (v: unknown, def = 0): number => Math.trunc(numero(v, def))
const logico = (v: unknown): boolean => v === true
const una = <T extends string>(v: unknown, opciones: readonly T[], def: T): T => (opciones.includes(v as T) ? (v as T) : def)
const lista = <T>(v: unknown, f: (x: unknown) => T | null): T[] =>
  Array.isArray(v) ? v.map(f).filter((x): x is T => x !== null) : []
const idDe = (v: unknown): string => (typeof v === 'string' && v ? v : nuevoId())

const recurso = (v: unknown): Recurso => {
  const o = esObj(v) ? v : {}
  const max = Math.max(0, entero(o.max))
  return { max, actual: Math.min(max, Math.max(0, entero(o.actual, max))) }
}

const dadoDano = (v: unknown): DadoDano | null =>
  esObj(v) && entero(v.dados) > 0 && entero(v.caras) > 0
    ? { dados: entero(v.dados), caras: entero(v.caras), mod: entero(v.mod) }
    : null

const ataque = (v: unknown): AtaqueDef | null =>
  esObj(v) && texto(v.nombre)
    ? { nombre: texto(v.nombre), bono: entero(v.bono), impacto: dadoDano(v.impacto), rasguno: dadoDano(v.rasguno), nota: texto(v.nota) }
    : null

const combatiente = (v: unknown): Combatiente | null => {
  if (!esObj(v) || !texto(v.nombre)) return null
  const d = esObj(v.defensas) ? v.defensas : {}
  const habilidades: Record<string, number> = {}
  if (esObj(v.habilidades)) for (const [k, n] of Object.entries(v.habilidades)) if (typeof n === 'number' && Number.isFinite(n)) habilidades[k] = Math.trunc(n)
  return {
    id: idDe(v.id),
    bando: una(v.bando, ['pj', 'pnj'] as const, 'pnj'),
    nombre: texto(v.nombre),
    characterId: typeof v.characterId === 'number' ? v.characterId : null,
    adversarioId: typeof v.adversarioId === 'number' ? v.adversarioId : null,
    rango: RANGOS.includes(v.rango as Rango) ? (v.rango as Rango) : null,
    turno: una(v.turno, ['rapido', 'lento'] as const, 'rapido'),
    actuoRapido: logico(v.actuoRapido),
    actuoLento: logico(v.actuoLento),
    reaccionUsada: logico(v.reaccionUsada),
    salud: recurso(v.salud),
    concentracion: recurso(v.concentracion),
    investidura: recurso(v.investidura),
    defensas: { fisica: entero(d.fisica, 10), cognitiva: entero(d.cognitiva, 10), espiritual: entero(d.espiritual, 10) },
    desvio: Math.max(0, entero(v.desvio)),
    estados: lista(v.estados, (e) => (esObj(e) && texto(e.id) ? { id: texto(e.id), valor: texto(e.valor) } : null)),
    inmunidades: lista(v.inmunidades, (s) => (typeof s === 'string' && s ? s : null)),
    ataques: lista(v.ataques, ataque),
    habilidades,
    notas: texto(v.notas),
    derrotado: logico(v.derrotado),
  }
}

const encuentro = (v: unknown): Encuentro | null =>
  esObj(v)
    ? {
        id: idDe(v.id),
        titulo: texto(v.titulo, 'Encuentro') || 'Encuentro',
        ronda: Math.max(1, entero(v.ronda, 1)),
        fase: una(v.fase, FASES, 'pj-rapido'),
        iniciadoEn: texto(v.iniciadoEn, ahoraIso()),
        combatientes: lista(v.combatientes, combatiente),
        // The first version kept only the names of the fallen enemies taken off the screen
        retirados: lista(v.retirados, (s): Retirado | null =>
          typeof s === 'string' && s ? { nombre: s, motivo: 'derrotado' }
            : esObj(s) && texto(s.nombre) ? { nombre: texto(s.nombre), motivo: una(s.motivo, MOTIVOS_SALIDA, 'derrotado') }
              : null),
      }
    : null

const escenaPropia = (v: unknown): EscenaPropia | null =>
  esObj(v) && texto(v.titulo)
    ? {
        id: idDe(v.id),
        titulo: texto(v.titulo),
        tipo: una(v.tipo, TIPOS_ESCENA, 'narrative'),
        leerEnVozAlta: texto(v.leerEnVozAlta),
        notas: texto(v.notas),
        imagenes: lista(v.imagenes, (i) => (esObj(i) && texto(i.url) ? { url: texto(i.url), titulo: texto(i.titulo) } : null)),
        enemigos: lista(v.enemigos, (e) =>
          esObj(e) && texto(e.nombre)
            ? { nombre: texto(e.nombre), cantidad: Math.max(1, entero(e.cantidad, 1)), adversarioId: typeof e.adversarioId === 'number' ? e.adversarioId : null }
            : null),
      }
    : null

const evento = (v: unknown): EventoBitacora | null =>
  esObj(v) && texto(v.texto)
    ? { id: idDe(v.id), en: texto(v.en, ahoraIso()), tipo: una(v.tipo, TIPOS_EVENTO, 'apunte'), etiqueta: texto(v.etiqueta), texto: texto(v.texto) }
    : null

const sesion = (v: unknown): SesionMesa | null =>
  esObj(v)
    ? {
        id: idDe(v.id),
        numero: typeof v.numero === 'number' && Number.isFinite(v.numero) ? Math.trunc(v.numero) : null,
        titulo: texto(v.titulo),
        iniciadaEn: texto(v.iniciadaEn, ahoraIso()),
        terminadaEn: typeof v.terminadaEn === 'string' ? v.terminadaEn : null,
        eventos: lista(v.eventos, evento),
      }
    : null

const TIPOS_CAMBIO: readonly TipoCambio[] = ['dano', 'cura', 'concentracion', 'investidura', 'estado']
const cambio = (v: unknown): CambioCombate | null =>
  esObj(v) && texto(v.texto) && TIPOS_CAMBIO.includes(v.tipo as TipoCambio)
    ? {
        id: idDe(v.id), en: texto(v.en, ahoraIso()), tipo: v.tipo as TipoCambio, quien: texto(v.quien), combatienteId: texto(v.combatienteId),
        encuentro: texto(v.encuentro), texto: texto(v.texto), delta: entero(v.delta), desde: entero(v.desde),
      }
    : null

const TIPOS_TIRADA = ['skill', 'damage', 'recovery', 'contested', 'free', 'combat']
const tiradaPrivada = (v: unknown): TiradaPrivada | null =>
  esObj(v) && esObj(v.resultado) && TIPOS_TIRADA.includes(texto(v.resultado.type))
    ? { id: idDe(v.id), en: texto(v.en, ahoraIso()), quien: texto(v.quien, 'Director'), etiqueta: texto(v.etiqueta), resultado: v.resultado as unknown as AnyRollResult }
    : null

export function normalizarEstado(raw: unknown): PantallaEstado {
  const o = esObj(raw) ? raw : {}
  const ref = esObj(o.escenaActual) && texto(o.escenaActual.escenaId) ? o.escenaActual : null
  const marcas: Record<string, string> = {}
  if (esObj(o.marcas)) for (const [k, f] of Object.entries(o.marcas)) if (typeof f === 'string') marcas[k] = f
  // Version 1 kept a single encounter in `encuentro`
  const encuentros = lista(Array.isArray(o.encuentros) ? o.encuentros : [o.encuentro], encuentro).slice(0, MAX_ENCUENTROS)
  const activo = encuentros.find((e) => e.id === o.encuentroActivo) ?? encuentros[0]
  return {
    version: VERSION_ESTADO,
    escenaActual: ref
      ? { origen: una(ref.origen, ['aventura', 'propia'] as const, 'aventura'), capituloId: typeof ref.capituloId === 'string' ? ref.capituloId : null, escenaId: texto(ref.escenaId) }
      : null,
    escenasPropias: lista(o.escenasPropias, escenaPropia),
    marcas,
    tramas: lista(o.tramas, (t) =>
      esObj(t) && texto(t.titulo) ? { id: idDe(t.id), titulo: texto(t.titulo), detalle: texto(t.detalle), estado: una(t.estado, ESTADOS_TRAMA, 'abierta') } : null),
    encuentros,
    encuentroActivo: activo?.id ?? null,
    sesion: sesion(o.sesion),
    historial: lista(o.historial, sesion).slice(0, MAX_HISTORIAL),
    tiradasPrivadas: lista(o.tiradasPrivadas, tiradaPrivada).slice(0, MAX_TIRADAS_PRIVADAS),
    cambios: lista(o.cambios, cambio).slice(0, MAX_CAMBIOS),
  }
}

// ── Progress marks ───────────────────────────────────────────────────────────

export type TipoMarcaAventura = 'lista' | 'progresion' | 'escena' | 'combate'
/** `aventura:cap1:escena:apertura`, `aventura:cap1:lista:0`… (checklist and progression items have no id: their index) */
export const claveAventura = (capituloId: string, tipo: TipoMarcaAventura, id: string | number) => `aventura:${capituloId}:${tipo}:${id}`
export const claveEscenaPropia = (escenaId: string) => `propia:escena:${escenaId}`

export function marcar(b: PantallaEstado, clave: string, valor: boolean) {
  if (valor) b.marcas[clave] = ahoraIso()
  else delete b.marcas[clave]
}

// ── Log (bitácora) ───────────────────────────────────────────────────────────

export function nuevaSesion(numero: number | null, titulo = ''): SesionMesa {
  return { id: nuevoId(), numero, titulo, iniciadaEn: ahoraIso(), terminadaEn: null, eventos: [] }
}

/** Number the next session gets: one more than the highest of the diary and the closed sessions */
export function numeroSiguiente(b: PantallaEstado, ultimoDiario: number | null): number {
  const usados = [ultimoDiario ?? 0, ...b.historial.map((s) => s.numero ?? 0)]
  return Math.max(...usados) + 1
}

/**
 * Adds an event to the open session. With none open, one is opened on the spot (numbered after the diary), so an event
 * the director produces before pressing «Empezar sesión» is never lost.
 */
export function anotar(b: PantallaEstado, ev: { tipo: TipoEvento; texto: string; etiqueta?: string }, ultimoDiario: number | null = null) {
  if (!b.sesion) b.sesion = nuevaSesion(numeroSiguiente(b, ultimoDiario))
  b.sesion.eventos.push({ id: nuevoId(), en: ahoraIso(), tipo: ev.tipo, etiqueta: ev.etiqueta ?? '', texto: ev.texto })
  if (b.sesion.eventos.length > MAX_EVENTOS) b.sesion.eventos.splice(0, b.sesion.eventos.length - MAX_EVENTOS)
}

export function terminarSesion(b: PantallaEstado) {
  if (!b.sesion) return
  b.historial.unshift({ ...b.sesion, terminadaEn: ahoraIso() })
  b.historial.splice(MAX_HISTORIAL)
  b.sesion = null
}

export function guardarTiradaPrivada(b: PantallaEstado, t: Omit<TiradaPrivada, 'id' | 'en'>) {
  b.tiradasPrivadas.unshift({ ...t, id: nuevoId(), en: ahoraIso() })
  b.tiradasPrivadas.splice(MAX_TIRADAS_PRIVADAS)
}

// ── Record of changes ────────────────────────────────────────────────────────

/** «Salud 12 → 5/14» */
export const tramo = (nombre: string, desde: number, hasta: number, max: number) => `${nombre} ${desde} → ${hasta}/${max}`

/** Adds a line to the record; `encuentro` is the title of the fight when more than one is open */
export function registrarCambio(b: PantallaEstado, c: Combatiente, tipo: TipoCambio, textoCambio: string, extra: { delta?: number; desde?: number } = {}) {
  const enc = b.encuentros.length > 1 ? encuentroDe(b, c.id)?.titulo ?? '' : ''
  b.cambios.unshift({ id: nuevoId(), en: ahoraIso(), tipo, quien: c.nombre, combatienteId: c.id, encuentro: enc, texto: textoCambio, delta: extra.delta ?? 0, desde: extra.desde ?? 0 })
  b.cambios.splice(MAX_CAMBIOS)
}

const NOMBRE_RECURSO = { concentracion: 'concentración', investidura: 'Investidura' } as const

/**
 * One step of Focus or Investiture (`paso` −1 spends, +1 recovers). Steps on the same resource of the same combatant within a
 * few seconds rewrite the last line («Gasta 3 de concentración · 4 → 1/4») instead of adding one per tap.
 */
export function pasoRecurso(b: PantallaEstado, c: Combatiente, clave: 'concentracion' | 'investidura', paso: number) {
  const r = c[clave]
  const antes = r.actual
  r.actual = Math.min(r.max, Math.max(0, antes + paso))
  if (r.actual === antes) return
  const ultimo = b.cambios[0]
  const unir = ultimo && ultimo.tipo === clave && ultimo.combatienteId === c.id && Date.now() - new Date(ultimo.en).getTime() < UNIR_CAMBIOS_MS
  const desde = unir ? ultimo.desde : antes
  const delta = (unir ? ultimo.delta : 0) + (r.actual - antes)
  const linea = delta === 0
    ? `Sin cambio de ${NOMBRE_RECURSO[clave]} · ${desde}/${r.max}`
    : `${delta < 0 ? 'Gasta' : 'Recupera'} ${Math.abs(delta)} de ${NOMBRE_RECURSO[clave]} · ${desde} → ${r.actual}/${r.max}`
  if (unir) {
    ultimo.texto = linea
    ultimo.delta = delta
    ultimo.en = ahoraIso()
  } else {
    registrarCambio(b, c, clave, linea, { delta, desde })
  }
}

// ── Encounter ────────────────────────────────────────────────────────────────

export function nuevoEncuentro(titulo = 'Encuentro'): Encuentro {
  return { id: nuevoId(), titulo, ronda: 1, fase: 'pj-rapido', iniciadoEn: ahoraIso(), combatientes: [], retirados: [] }
}

/** The encounter on screen: the active one or, if its id is stale, the first open one */
export const encuentroEnPantalla = (b: PantallaEstado): Encuentro | null =>
  b.encuentros.find((e) => e.id === b.encuentroActivo) ?? b.encuentros[0] ?? null

/** Encounter a combatant fights in (combatant ids are unique in the whole document) */
export const encuentroDe = (b: PantallaEstado, combatienteId: string): Encuentro | null =>
  b.encuentros.find((e) => e.combatientes.some((x) => x.id === combatienteId)) ?? null

/** Encounter a campaign character fights in, and its combatant there */
export function personajeEnCombate(b: PantallaEstado, characterId: number): { enc: Encuentro; cb: Combatiente } | null {
  for (const enc of b.encuentros) {
    const cb = enc.combatientes.find((x) => x.characterId === characterId)
    if (cb) return { enc, cb }
  }
  return null
}

/**
 * Moves a combatant to another open encounter with its health, resources and conditions. It has not acted yet in the other
 * fight's round; a namesake already there gives it the next number («Bandido 3»). Returns false when nothing moved.
 */
export function moverCombatiente(b: PantallaEstado, id: string, destinoId: string): boolean {
  const origen = encuentroDe(b, id)
  const destino = b.encuentros.find((e) => e.id === destinoId)
  const x = origen?.combatientes.find((y) => y.id === id)
  if (!origen || !destino || origen === destino || !x) return false
  origen.combatientes = origen.combatientes.filter((y) => y !== x)
  const nombres = destino.combatientes.map((y) => y.nombre)
  if (nombres.includes(x.nombre)) [x.nombre] = nombresNuevos(x.nombre.replace(/\s+\d+$/, ''), 1, nombres)
  x.actuoRapido = false
  x.actuoLento = false
  destino.combatientes.push(x)
  return true
}

/** The combatant plays in this phase: its side, and its chosen turn (a Jefe plays the fast and the slow one) */
export const juegaEnFase = (c: Combatiente, fase: Fase) =>
  c.bando === FASE_INFO[fase].bando && (c.rango === 'jefe' || c.turno === FASE_INFO[fase].turno)

export const actuoEnFase = (c: Combatiente, fase: Fase) => (FASE_INFO[fase].turno === 'rapido' ? c.actuoRapido : c.actuoLento)

/** Next phase; after «PNJ lentos» a new round starts. Returns true when it did */
export function avanzarFase(enc: Encuentro): boolean {
  const i = FASES.indexOf(enc.fase)
  if (i < FASES.length - 1) {
    enc.fase = FASES[i + 1]
    return false
  }
  nuevaRonda(enc)
  return true
}

/** New round: phase 1, and nobody has acted or used the reaction (each one gets a new reaction at the start of its turn) */
export function nuevaRonda(enc: Encuentro) {
  enc.ronda += 1
  enc.fase = 'pj-rapido'
  for (const c of enc.combatientes) {
    c.actuoRapido = false
    c.actuoLento = false
    c.reaccionUsada = false
  }
}

const tieneEstado = (c: Combatiente, id: string) => c.estados.some((e) => e.id === id)

/**
 * Damage taken, after deflect only when the director asks for it (`restarDesvio`). At 0 health a PNJ falls: it leaves the phases
 * and goes to «Caídos» (a Secuaz is «derrotado al sufrir una lesión»; a Rival or a Jefe is also Inconsciente, and comes back if
 * healed). A PJ stays in its phase, Inconsciente. Returns the damage taken and whether it dropped to 0 now.
 */
export function aplicarDano(c: Combatiente, cantidad: number, restarDesvio: boolean): { sufrido: number; cae: boolean } {
  const sufrido = Math.max(0, cantidad - (restarDesvio ? c.desvio : 0))
  const antes = c.salud.actual
  c.salud.actual = Math.max(0, antes - sufrido)
  const cae = antes > 0 && c.salud.actual === 0
  if (cae) {
    if (c.bando === 'pnj') c.derrotado = true
    if (c.rango !== 'secuaz' && !tieneEstado(c, 'inconsciente')) c.estados.push({ id: 'inconsciente', valor: '' })
  }
  return { sufrido, cae }
}

/** Straight to 0, whatever the deflect («Dejar a 0»): the same fall as a deadly blow */
export const dejarACero = (c: Combatiente) => aplicarDano(c, c.salud.actual, false)

/**
 * Healing up to the maximum. A PNJ wakes up as soon as it recovers health and, unless it is a Secuaz, it is back in the fight
 * (a PJ decides when it wakes: the director removes the condition)
 */
export function curar(c: Combatiente, cantidad: number) {
  c.salud.actual = Math.min(c.salud.max, c.salud.actual + Math.max(0, cantidad))
  if (c.salud.actual > 0 && c.bando === 'pnj') {
    c.estados = c.estados.filter((e) => e.id !== 'inconsciente')
    if (c.rango !== 'secuaz') c.derrotado = false
  }
}

/** Takes fallen enemies off the screen (all of them, or one): their names stay in `retirados` for the summary. Returns how many */
export function retirarCaidos(enc: Encuentro, id?: string): number {
  const fuera = enc.combatientes.filter((x) => x.derrotado && x.bando === 'pnj' && (id === undefined || x.id === id))
  enc.retirados.push(...fuera.map((x) => ({ nombre: x.nombre, motivo: 'derrotado' as const })))
  enc.combatientes = enc.combatientes.filter((x) => !fuera.includes(x))
  return fuera.length
}

/**
 * Takes a combatant out of the fight: with a reason it is remembered for the summary (a fallen one always counts as defeated);
 * with `null` it is simply removed (added by mistake). Returns the combatant, or null if it was not there.
 */
export function sacarDelCombate(enc: Encuentro, id: string, motivo: MotivoSalida | null): Combatiente | null {
  const x = enc.combatientes.find((y) => y.id === id)
  if (!x) return null
  enc.combatientes = enc.combatientes.filter((y) => y !== x)
  if (motivo) enc.retirados.push({ nombre: x.nombre, motivo: x.derrotado && x.bando === 'pnj' ? 'derrotado' : motivo })
  return x
}

/** Names of the enemies that fell in this fight (still on screen or taken off), for the summary of the log */
export const caidosDe = (enc: Encuentro) => [
  ...enc.combatientes.filter((x) => x.bando === 'pnj' && (x.derrotado || x.salud.actual === 0)).map((x) => x.nombre),
  ...salidasDe(enc, 'derrotado'),
]

/** Names of those who left the fight for one reason */
export const salidasDe = (enc: Encuentro, motivo: MotivoSalida) => enc.retirados.filter((r) => r.motivo === motivo).map((r) => r.nombre)

/**
 * Names for `cantidad` new combatants called `base` in `enc`, so a group reads «Guardia 1, Guardia 2, Guardia 3»: a namesake
 * without a number becomes «base 1» when another one arrives, and the new ones go on from the highest number.
 */
export function nombrarSerie(enc: Encuentro, base: string, cantidad: number): string[] {
  const solo = enc.combatientes.find((x) => x.nombre === base)
  if (solo && !enc.combatientes.some((x) => x.nombre === `${base} 1`)) solo.nombre = `${base} 1`
  return nombresNuevos(base, cantidad, enc.combatientes.map((x) => x.nombre))
}

/**
 * What the card's tile shows: the number of an enemy of a group («Guardia 2» → «2»), or the initial. A character's name is its own
 * («Nadia de la Era 1» is not number 1 of anything), so a PJ always shows its initial
 */
export const marcaDe = (c: Pick<Combatiente, 'nombre' | 'bando'>) =>
  (c.bando === 'pnj' ? /\s(\d{1,3})$/.exec(c.nombre.trim())?.[1] : undefined) ?? (c.nombre.trim()[0]?.toUpperCase() ?? '?')

/**
 * Names for `cantidad` new combatants called `base`, numbered after those already in the encounter («Bandido 3», «Bandido 4»).
 * A single one without namesakes keeps the plain name.
 */
export function nombresNuevos(base: string, cantidad: number, existentes: string[]): string[] {
  const patron = new RegExp(`^${base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?: (\\d+))?$`)
  const iguales = existentes.map((n) => patron.exec(n)).filter((m): m is RegExpExecArray => m !== null)
  if (cantidad === 1 && iguales.length === 0) return [base]
  let siguiente = Math.max(0, ...iguales.map((m) => (m[1] ? Number(m[1]) : 1))) + 1
  return Array.from({ length: cantidad }, () => `${base} ${siguiente++}`)
}
