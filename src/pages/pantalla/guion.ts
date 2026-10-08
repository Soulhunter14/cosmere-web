/**
 * «Guion» of the director's screen: the scenes prepared for the next sessions, written in Markdown (usually by an AI from the
 * book and the campaign: `FORMATO_GUION`, `docs/pantalla-director/guion-formato.md`) and imported into the screen. Each scene is
 * stored as its own Markdown (`EscenaPropia.md`), so editing it is editing text and the format can grow without migrating the
 * document. This module reads that text into what the panels show, and splits, merges and writes whole scripts.
 * Pure functions, no React.
 */
import { foldText as normalizar } from '../../lib/catalogo'
import type { AdventureChapter, Combat, Scene, SceneTable } from '../../data/libros/tipos'
import {
  CLAVES_EFECTO, claveContador, claveResultado, prefijoDecision, type ClaveEfecto, type Efecto, type EnemigoEscena, type EscenaArchivada,
  type EscenaPropia, type ImagenEscena, type PantallaEstado, type ProgresoEmpeno, type TipoEscena,
} from './estado'
import { cantidadDe, enemigosDeTexto } from './adversarios'

/** Sections the screen gives a behaviour to; any other `###` section is shown as written */
export type ClaseSeccion = 'pruebas' | 'pnj' | 'pj' | 'caminos' | 'decision' | 'reglas' | 'avances' | 'otra'

export type Bloque =
  | { tipo: 'parrafo'; texto: string }
  /** `- …` items (a `- [ ] …` checkbox of older scripts is read as a plain item: the screen only recommends advances) */
  | { tipo: 'lista'; items: string[] }
  /** `> …` lines: text to read aloud to the table */
  | { tipo: 'cita'; texto: string }

export interface Seccion {
  titulo: string
  clase: ClaseSeccion
  bloques: Bloque[]
}

/** «6 éxitos antes de 4 fallos» */
export interface Empeno {
  exitos: number
  fallos: number
}

export interface EscenaGuion {
  titulo: string
  tipo: TipoEscena
  /** Heading the scene is listed under («Capítulo 4 · Hacia el valle»); '' = none */
  grupo: string
  /** Top-level section of the book the scene belongs to (the original book uploaded to the Libro groups its index by it); '' = none */
  apartado: string
  /** Where it comes from («Caminapiedras L.78-79 / PDF 82-83») */
  fuente: string
  enemigos: EnemigoEscena[]
  empeno: Empeno | null
  contadores: string[]
  imagenes: ImagenEscena[]
  /** Who makes the decisions of the scene (`decide:`): «todos», a legacy («convicto») or a character's name; '' = all of them */
  decide: string
  /** Text before the first `###` section */
  cuerpo: Bloque[]
  secciones: Seccion[]
}

/** An option of a decision: what it says and what it gives («**Atributo** +1 Fuerza · **Camino** Guerrero · **Metal** Peltre») */
export interface OpcionDecision {
  texto: string
  efectos: Efecto[]
}

/**
 * A `### Decisión: <question>` section: the options the players choose from (one bullet each, with their effects), who chooses
 * and the test that may come with the choice. The screen marks what each character picked (`PantallaEstado.decisiones`).
 */
export interface Decision {
  pregunta: string
  /** Who picks (`decide:` of the section, or of the scene): «todos», a legacy or a character's name; '' = all of them */
  decide: string
  /** Test after the choice (`prueba: CD 10` or `prueba: Atletismo CD 12`); no skill = the skill of the chosen option */
  prueba: { habilidad: string; cd: number } | null
  /** What a passed test gives (`éxito:` «+1 al atributo de la habilidad») */
  exito: string
  opciones: OpcionDecision[]
  /** Paragraphs and read-aloud boxes of the section that are not its metadata */
  notas: Bloque[]
}

/** A test of a «Pruebas» item: «**Supervivencia CD 14**: guiar al grupo…» or «**Persuasión contra la Defensa espiritual**: …» */
export interface Prueba {
  habilidad: string
  cd: number | null
  /** What an opposed test goes against («Defensa espiritual», «Liderazgo de Ylt (+6)»); '' with a CD */
  contra: string
  texto: string
}

// ── Text helpers ─────────────────────────────────────────────────────────────

const lineas = (texto: string) => texto.replace(/\r\n?/g, '\n').split('\n')

const TIPOS: Record<string, TipoEscena> = {
  narrativa: 'narrative', narrative: 'narrative',
  social: 'social',
  exploracion: 'exploration', exploration: 'exploration',
  combate: 'combat', combat: 'combat',
  decision: 'choice', choice: 'choice',
}

const CLAVES_META = ['tipo', 'grupo', 'apartado', 'fuente', 'enemigos', 'empeno', 'contadores', 'contador', 'imagen', 'imagenes', 'decide'] as const
type ClaveMeta = (typeof CLAVES_META)[number]
const RE_META = /^([A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)\s*:\s*(.*)$/
const claveMeta = (linea: string): [ClaveMeta, string] | null => {
  const m = RE_META.exec(linea.trim())
  if (!m) return null
  const k = normalizar(m[1]) as ClaveMeta
  return CLAVES_META.includes(k) ? [k, m[2].trim()] : null
}

const RE_TITULO_ESCENA = /^#{1,3}\s+(.+)$/
const RE_SECCION = /^###\s+(.+)$/
const RE_CASILLA = /^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/
const RE_VINETA = /^\s*(?:[-*]|\d+[.)])\s+(.*)$/
const RE_CITA = /^\s*>\s?(.*)$/

function claseDe(titulo: string): ClaseSeccion {
  const t = normalizar(titulo)
  if (/^pruebas?\b/.test(t)) return 'pruebas'
  if (/^(pnj|personajes no jugadores|quien aparece)/.test(t)) return 'pnj'
  if (/^(para los pj|ganchos|los pj)/.test(t)) return 'pj'
  // «Decisión: …» (singular) is a choice the screen records; «Decisiones» (plural) stays the older name of «Caminos»
  if (/^decision\b/.test(t)) return 'decision'
  if (/^(caminos|decisiones|si los pj)/.test(t)) return 'caminos'
  if (/^(reglas|efectos del campo)/.test(t)) return 'reglas'
  if (/^avances?\b/.test(t)) return 'avances'
  return 'otra'
}

/** Paragraphs, bullet lists, checklists and quotes of a piece of Markdown, in order */
export function leerBloques(texto: string | string[]): Bloque[] {
  const ls = Array.isArray(texto) ? texto : lineas(texto)
  const bloques: Bloque[] = []
  const ultimo = () => bloques[bloques.length - 1]
  let abierto = false // the last block still takes lines (no blank line since)
  for (const l of ls) {
    if (!l.trim()) {
      // A blank line closes paragraphs and lists; inside a quote it separates its paragraphs
      const u = ultimo()
      if (abierto && u?.tipo === 'cita') u.texto += '\n'
      abierto = false
      continue
    }
    const cita = RE_CITA.exec(l)
    const casilla = RE_CASILLA.exec(l)
    const vineta = casilla ? [l, casilla[2]] : RE_VINETA.exec(l)
    const u = ultimo()
    if (cita) {
      const t = cita[1].trim()
      if (u?.tipo === 'cita' && (abierto || u.texto.endsWith('\n'))) {
        u.texto = t ? `${u.texto}${u.texto.endsWith('\n') ? '\n' : ' '}${t}` : `${u.texto}\n`
      } else if (t) {
        bloques.push({ tipo: 'cita', texto: t })
      }
      abierto = true
    } else if (vineta) {
      if (u?.tipo === 'lista' && abierto) u.items.push(vineta[1].trim())
      else bloques.push({ tipo: 'lista', items: [vineta[1].trim()] })
      abierto = true
    } else if (abierto && u && u.tipo !== 'cita') {
      // A wrapped line continues the paragraph or the last item
      if (u.tipo === 'parrafo') u.texto += ` ${l.trim()}`
      else u.items[u.items.length - 1] += ` ${l.trim()}`
    } else {
      bloques.push({ tipo: 'parrafo', texto: l.trim() })
      abierto = true
    }
  }
  // Quotes keep their blank lines as paragraph breaks («\n\n»), without trailing ones
  for (const b of bloques) if (b.tipo === 'cita') b.texto = b.texto.replace(/\n+$/, '').replace(/\n{2,}/g, '\n\n')
  return bloques
}

/** «2 Anguila aérea mayor, 2 Anguila aérea» (also «;» or one per line) */
const enemigosDeMeta = (valor: string): EnemigoEscena[] =>
  enemigosDeTexto(valor.split(/[,;]/).join('\n')).map((e) => ({ ...e, adversarioId: null }))

/** «6 éxitos antes de 4 fallos», «6/4» */
function empenoDeMeta(valor: string): Empeno | null {
  const n = (valor.match(/\d+/g) ?? []).map(Number).filter((x) => x > 0 && x < 100)
  if (n.length === 0) return null
  return { exitos: n[0], fallos: n[1] ?? 3 }
}

/** «/aventura/x.webp | Título» */
function imagenDeMeta(valor: string): ImagenEscena | null {
  const [url, ...titulo] = valor.split('|')
  return url.trim() ? { url: url.trim(), titulo: titulo.join('|').trim() } : null
}

// ── One scene ────────────────────────────────────────────────────────────────

const cache = new Map<string, EscenaGuion>()
const MAX_CACHE = 300

/** Reads the Markdown of one scene (memoized by its text: the panels call it on every render) */
export function leerEscena(md: string): EscenaGuion {
  const hit = cache.get(md)
  if (hit) return hit
  const r = leerEscenaSinCache(md)
  if (cache.size >= MAX_CACHE) cache.clear()
  cache.set(md, r)
  return r
}

function leerEscenaSinCache(md: string): EscenaGuion {
  const ls = lineas(md)
  let i = 0
  while (i < ls.length && !ls[i].trim()) i++
  const cabecera = RE_TITULO_ESCENA.exec(ls[i] ?? '')
  const titulo = (cabecera ? cabecera[1] : ls[i] ?? '').trim() || 'Escena sin título'
  i++

  const e: EscenaGuion = {
    titulo, tipo: 'narrative', grupo: '', apartado: '', fuente: '', enemigos: [], empeno: null, contadores: [], imagenes: [], decide: '', cuerpo: [], secciones: [],
  }
  // Metadata: «clave: valor» lines right under the title
  for (; i < ls.length; i++) {
    const m = claveMeta(ls[i])
    if (!m) break
    const [k, v] = m
    if (k === 'tipo') e.tipo = TIPOS[normalizar(v)] ?? e.tipo
    else if (k === 'grupo') e.grupo = v
    else if (k === 'apartado') e.apartado = v
    else if (k === 'fuente') e.fuente = v
    else if (k === 'enemigos') e.enemigos.push(...enemigosDeMeta(v))
    else if (k === 'empeno') e.empeno = empenoDeMeta(v)
    else if (k === 'contadores' || k === 'contador') e.contadores.push(...v.split(/[,;]/).map((s) => s.trim()).filter(Boolean))
    else if (k === 'decide') e.decide = v
    else {
      const img = imagenDeMeta(v)
      if (img) e.imagenes.push(img)
    }
  }

  // Body until the first «###», then one section per «###»
  let actual: { titulo: string; ls: string[] } | null = null
  const cuerpo: string[] = []
  const secciones: { titulo: string; ls: string[] }[] = []
  for (; i < ls.length; i++) {
    const s = RE_SECCION.exec(ls[i])
    if (s) {
      actual = { titulo: s[1].trim(), ls: [] }
      secciones.push(actual)
    } else if (actual) actual.ls.push(ls[i])
    else cuerpo.push(ls[i])
  }
  e.cuerpo = leerBloques(cuerpo)
  e.secciones = secciones.map((s) => ({ titulo: s.titulo, clase: claseDe(s.titulo), bloques: leerBloques(s.ls) }))
  e.contadores = [...new Set(e.contadores)]
  return e
}

export const tituloDe = (esc: EscenaPropia) => leerEscena(esc.md).titulo

/** A «Pruebas» item: the skill(s) and the difficulty in front, what it is for after */
export function leerPrueba(item: string): Prueba {
  const limpio = item.replace(/\*\*/g, '').trim()
  const cd = /^(.{2,60}?)\s+CD\s*(\d{1,2})\b\s*[:.—–-]?\s*(.*)$/i.exec(limpio)
  if (cd) return { habilidad: cd[1].replace(/[:—–-]\s*$/, '').trim(), cd: Number(cd[2]), contra: '', texto: cd[3].trim() }
  const contra = /^(.{2,60}?)\s+contra\s+(?:la\s+|el\s+)?([^:—–]{3,60}?)\s*[:—–]\s*(.*)$/i.exec(limpio)
  if (contra) return { habilidad: contra[1].trim(), cd: null, contra: contra[2].trim(), texto: contra[3].trim() }
  return { habilidad: '', cd: null, contra: '', texto: limpio }
}

// ── Decisions ────────────────────────────────────────────────────────────────

const RE_EFECTO = new RegExp(`\\*\\*\\s*(${CLAVES_EFECTO.join('|')})\\s*\\*\\*`, 'gi')

/** An option of a decision: the text before its first «**Clave**», and each effect up to the next one (« · » separates them) */
export function leerOpcion(item: string): OpcionDecision {
  const marcas = [...item.matchAll(RE_EFECTO)]
  if (marcas.length === 0) return { texto: item.trim(), efectos: [] }
  const efectos = marcas
    .map((m, i): Efecto => {
      const desde = (m.index ?? 0) + m[0].length
      const hasta = marcas[i + 1]?.index ?? item.length
      return { clave: normalizar(m[1]) as ClaveEfecto, valor: item.slice(desde, hasta).replace(/^[\s:]+|[\s·]+$/g, '').trim() }
    })
    .filter((x) => x.valor)
  const texto = item.slice(0, marcas[0].index ?? 0).replace(/[\s·]+$/, '').trim()
  return { texto: texto || efectos.map((x) => x.valor).join(' · '), efectos }
}

const RE_META_DECISION = /(prueba|[eé]xito|decide)\s*:\s*/gi

/** A `### Decisión: …` section: its question (the heading), its metadata lines, its options and any other text */
export function leerDecision(s: Seccion, decideEscena = ''): Decision {
  const pregunta = s.titulo.replace(/^decisi[oó]n\b\s*[:·.—–-]?\s*/i, '').trim() || 'Decisión'
  const d: Decision = { pregunta, decide: decideEscena, prueba: null, exito: '', opciones: [], notas: [] }
  for (const b of s.bloques) {
    if (b.tipo === 'lista') {
      d.opciones.push(...b.items.map(leerOpcion))
      continue
    }
    const t = b.tipo === 'parrafo' ? b.texto.trim() : ''
    if (!/^(prueba|[eé]xito|decide)\s*:/i.test(t)) {
      d.notas.push(b)
      continue
    }
    // Several «clave: valor» of one paragraph («prueba: CD 10 · éxito: +1 al atributo de la habilidad»)
    const marcas = [...t.matchAll(RE_META_DECISION)]
    marcas.forEach((m, i) => {
      const valor = t.slice((m.index ?? 0) + m[0].length, marcas[i + 1]?.index ?? t.length).replace(/[\s·]+$/, '').trim()
      const k = normalizar(m[1])
      if (k === 'prueba') {
        const p = /^(.*?)\s*CD\s*(\d{1,2})\b/i.exec(valor)
        if (p) d.prueba = { habilidad: p[1].replace(/[\s:·]+$/, '').trim(), cd: Number(p[2]) }
      } else if (k === 'exito') d.exito = valor
      else d.decide = valor
    })
  }
  return d
}

const RE_CANTIDAD = /([+-]\d+)\s+(.+?)(?=\s*(?:,|\by\b|\be\b)\s*[+-]\d|$)/g

/** «+1 Medicina y +1 Disciplina» → [{ 1, Medicina }, { 1, Disciplina }] (attributes and skills of an option) */
export const cantidadesDe = (valor: string): { cantidad: number; nombre: string }[] =>
  [...valor.matchAll(RE_CANTIDAD)]
    .map((m) => ({ cantidad: Number(m[1]), nombre: m[2].replace(/[\s.·;,]+$/, '').trim() }))
    .filter((x) => x.nombre && Number.isFinite(x.cantidad))

/** «Enviado y Líder» → [Enviado, Líder] (paths and metals of an option) */
export const nombresDe = (valor: string): string[] =>
  valor.split(/\s*(?:,|\by\b|\be\b)\s*/).map((s) => s.replace(/[\s.·;]+$/, '').trim()).filter(Boolean)

/** The test that comes with an option: the decision's own skill or the first skill the option gives («Atletismo CD 10»); '' = none */
export function pruebaDeOpcion(d: Decision, op: OpcionDecision): string {
  if (!d.prueba) return ''
  const habilidad = d.prueba.habilidad
    || op.efectos.filter((x) => x.clave === 'habilidad').flatMap((x) => cantidadesDe(x.valor))[0]?.nombre
    || 'Prueba'
  return `${habilidad} CD ${d.prueba.cd}`
}

// ── What the table noted on a scene, as text (log, prompts, archived scenes) ──

/** «Supervivencia CD 14» */
export const etiquetaPrueba = (p: Prueba) => `${p.habilidad || 'Prueba'}${p.cd !== null ? ` CD ${p.cd}` : p.contra ? ` contra ${p.contra}` : ''}`

/** First sentence of a text (without its full stop), short enough for a log line */
export const resumen = (texto: string, max = 90) => {
  const limpio = texto.replace(/\*\*/g, '').trim()
  const frase = (/^[^.]*/.exec(limpio)?.[0] ?? limpio).trim()
  return frase.length > max ? `${frase.slice(0, max - 1).trimEnd()}…` : frase
}

/** A short text kept whole (an option, a question), without bold: it is only cut when it is longer than `max` */
export const acortar = (texto: string, max = 90) => {
  const limpio = texto.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim()
  return limpio.length > max ? `${limpio.slice(0, max - 1).trimEnd()}…` : limpio
}

export type EstadoEmpeno = 'en curso' | 'superado' | 'fracasado'
/** «6 éxitos, 1 fallo» */
export const cuentaEmpeno = (p: ProgresoEmpeno) => `${p.exitos} éxito${p.exitos === 1 ? '' : 's'}, ${p.fallos} fallo${p.fallos === 1 ? '' : 's'}`

export const estadoEmpeno = (p: ProgresoEmpeno, objetivo: Empeno): EstadoEmpeno =>
  p.exitos >= objetivo.exitos ? 'superado' : p.fallos >= objetivo.fallos ? 'fracasado' : 'en curso'

/** What the table noted on a scene of the session: tests passed or failed, what each character decided, the endeavour and the counters */
export function detallesEscena(b: PantallaEstado, esc: EscenaPropia): string[] {
  const e = leerEscena(esc.md)
  const detalles: string[] = []
  for (const s of e.secciones.filter((x) => x.clase === 'pruebas')) {
    for (const item of s.bloques.flatMap((x) => (x.tipo === 'lista' ? x.items : []))) {
      const r = b.resultados[claveResultado(esc.id, item)]
      if (r) {
        const p = leerPrueba(item)
        detalles.push(`${etiquetaPrueba(p)} ${r === 'exito' ? 'superada' : 'fallada'} (${resumen(p.texto, 60)})`)
      }
    }
  }
  for (const s of e.secciones.filter((x) => x.clase === 'decision')) {
    const d = leerDecision(s, e.decide)
    const prefijo = prefijoDecision(e.grupo, e.titulo, d.pregunta)
    for (const [k, el] of Object.entries(b.decisiones)) {
      if (!k.startsWith(prefijo)) continue
      const prueba = el.prueba && el.resultado ? ` (${el.prueba} ${el.resultado === 'exito' ? 'superada' : 'fallada'})` : ''
      detalles.push(`${el.personaje}, ${acortar(d.pregunta, 70)}: ${acortar(el.opcion, 90)}${prueba}`)
    }
  }
  const prog = b.empenos[esc.id]
  if (e.empeno && prog) detalles.push(`Empeño ${estadoEmpeno(prog, e.empeno)} (${cuentaEmpeno(prog)})`)
  for (const n of e.contadores) {
    const v = b.contadores[claveContador(esc.id, n)]
    if (v) detalles.push(`${n}: ${v}`)
  }
  return detalles
}

/** A played scene as it goes with its session when the session closes (`terminarSesion`) */
export function archivarEscena(b: PantallaEstado, esc: EscenaPropia): EscenaArchivada {
  const e = leerEscena(esc.md)
  return { id: esc.id, grupo: e.grupo, titulo: e.titulo, md: esc.md, detalles: detallesEscena(b, esc) }
}


// ── Whole scripts: split an imported file, merge it, write it back ───────────

export interface GuionLeido {
  titulo: string
  /** Markdown of each scene, with its `grupo:` line */
  escenas: string[]
}

/**
 * Splits a script file: optional front matter (`guion:` or `titulo:`), `# Grupo` headings and one `## Escena` per scene (its
 * `###` sections belong to it). A scene without its own `grupo:` gets the heading it is under. Text with no `##` is one scene.
 */
export function dividirGuion(texto: string): GuionLeido {
  const ls = lineas(texto)
  let i = 0
  let titulo = ''
  while (i < ls.length && !ls[i].trim()) i++
  if (ls[i]?.trim() === '---') {
    const fin = ls.findIndex((l, j) => j > i && l.trim() === '---')
    if (fin > i) {
      for (const l of ls.slice(i + 1, fin)) {
        const m = /^(guion|titulo|título)\s*:\s*(.*)$/i.exec(l.trim())
        if (m) titulo = m[2].trim()
      }
      i = fin + 1
    }
  }
  const resto = ls.slice(i)
  if (!resto.some((l) => /^##\s+/.test(l))) {
    const md = resto.join('\n').trim()
    return { titulo, escenas: md ? [md] : [] }
  }
  const escenas: string[] = []
  let grupo = ''
  let actual: string[] | null = null
  const cerrar = () => {
    if (!actual) return
    const md = actual.join('\n').trim()
    const conGrupo = grupo && !leerEscena(md).grupo ? ponerMeta(md, 'grupo', grupo) : md
    escenas.push(conGrupo)
    actual = null
  }
  for (const l of resto) {
    const g = /^#\s+(.+)$/.exec(l)
    if (g) {
      cerrar()
      grupo = g[1].trim()
    } else if (/^##\s+/.test(l)) {
      cerrar()
      actual = [l]
    } else if (actual) actual.push(l)
  }
  cerrar()
  return { titulo, escenas }
}

/** Adds (or replaces) one `clave: valor` line under the title of a scene */
export function ponerMeta(md: string, clave: string, valor: string): string {
  const ls = lineas(md.trim())
  let fin = 1
  while (fin < ls.length && claveMeta(ls[fin])) fin++
  const existente = ls.slice(1, fin).findIndex((l) => claveMeta(l)?.[0] === normalizar(clave))
  if (existente >= 0) ls[existente + 1] = `${clave}: ${valor}`
  else ls.splice(fin, 0, `${clave}: ${valor}`)
  return ls.join('\n')
}

export type ModoImportar = 'fusionar' | 'reemplazar'

export interface ResultadoImportar {
  escenas: EscenaPropia[]
  nuevas: number
  actualizadas: number
  /** Scenes of the screen that are not in the file (removed when replacing) */
  quitadas: EscenaPropia[]
}

/**
 * Merges an imported script into the screen's one. A scene with the same title (and group) keeps its id, so its marks, results
 * and counters stay. `fusionar` updates those and adds the rest at the end; `reemplazar` leaves the file's scenes in its order.
 */
export function fusionarGuion(
  actual: EscenaPropia[], mds: string[], modo: ModoImportar, nuevoId: () => string, tras: string | null = null,
): ResultadoImportar {
  const clave = (md: string) => {
    const e = leerEscena(md)
    return `${normalizar(e.grupo)}|${normalizar(e.titulo)}`
  }
  const porClave = new Map(actual.map((e) => [clave(e.md), e]))
  let nuevas = 0
  let actualizadas = 0
  const usadas = new Set<string>()
  const importadas = mds.map((md) => {
    const previa = porClave.get(clave(md))
    if (previa && !usadas.has(previa.id)) {
      usadas.add(previa.id)
      actualizadas++
      return { id: previa.id, md }
    }
    nuevas++
    return { id: nuevoId(), md }
  })
  if (modo === 'reemplazar') {
    return { escenas: importadas, nuevas, actualizadas, quitadas: actual.filter((e) => !usadas.has(e.id)) }
  }
  const porId = new Map(importadas.map((e) => [e.id, e]))
  const escenas = actual.map((e) => porId.get(e.id) ?? e)
  // New scenes go after `tras` (the current scene) or, without it, at the end
  escenas.splice(posicionTras(escenas, tras), 0, ...importadas.filter((e) => !actual.some((a) => a.id === e.id)))
  return { escenas, nuevas, actualizadas, quitadas: [] }
}

/** Where a scene added during the session goes: right after `tras` (the current scene) or, without it, at the end */
export const posicionTras = (escenas: EscenaPropia[], tras: string | null) => {
  const i = tras ? escenas.findIndex((e) => e.id === tras) : -1
  return i >= 0 ? i + 1 : escenas.length
}

/** A scene of the session with the same group and title (an added book scene is not added twice) */
export const yaEnSesion = (escenas: EscenaPropia[], md: string) => {
  const e = leerEscena(md)
  return escenas.some((x) => {
    const y = leerEscena(x.md)
    return normalizar(y.titulo) === normalizar(e.titulo) && normalizar(y.grupo) === normalizar(e.grupo)
  })
}

/** The whole script as one Markdown file (the import format: re-importing it changes nothing) */
export function escribirGuion(titulo: string, escenas: EscenaPropia[]): string {
  const partes: string[] = []
  if (titulo) partes.push('---', `guion: ${titulo}`, '---', '')
  let grupo: string | null = null
  for (const esc of escenas) {
    const g = leerEscena(esc.md).grupo
    if (g && g !== grupo) partes.push(`# ${g}`, '')
    grupo = g
    const md = esc.md.trim()
    partes.push(/^##\s/.test(md) ? md : `## ${md.replace(/^#{1,3}\s+/, '')}`, '')
  }
  return partes.join('\n')
}

/** What «Nueva escena» opens */
export const PLANTILLA_ESCENA = [
  '## Nueva escena',
  'tipo: narrativa',
  '',
  '> Lo que lees en voz alta a la mesa.',
  '',
  'Qué pasa y cómo dirigirlo.',
  '',
  '### Pruebas',
  '- **Percepción CD 13**: qué descubren si la superan.',
  '',
  '### Para los PJ',
  '- **Nombre**: el gancho de este personaje.',
].join('\n')

/**
 * The format, as the AI must write it (also embedded in the prompt for the next script). Keep it in step with
 * `docs/pantalla-director/guion-formato.md`.
 */
export const FORMATO_GUION = `Formato del guion (Markdown):
- Opcional al principio: \`---\` / \`guion: Título del guion\` / \`---\`.
- \`# Grupo\`: agrupa las escenas que siguen (por ejemplo «# Capítulo 4 · Hacia el valle»).
- \`## Título de la escena\`: empieza una escena. Justo debajo, sin líneas en blanco, metadatos opcionales «clave: valor»:
  - \`tipo:\` narrativa | social | exploración | combate | decisión
  - \`fuente:\` de dónde sale (por ejemplo «Caminapiedras L.78 / PDF 82»)
  - \`imagen:\` /ruta-o-url.webp | Título  (una línea por imagen)
  - \`enemigos:\` 2 Anguila aérea mayor, 2 Anguila aérea  (nombres del catálogo de adversarios; prepara el encuentro)
  - \`empeño:\` 6 éxitos antes de 4 fallos
  - \`contadores:\` Daño del barco, Días en Karanak
  - \`decide:\` quién toma las decisiones de la escena: todos (por defecto), un legado (convicto) o el nombre de un PJ
- Cuerpo de la escena: párrafos para el director; las líneas que empiezan por \`> \` son el texto para leer en voz alta.
- Secciones \`### …\` con viñetas \`- \`. La pantalla da función a estas:
  - \`### Pruebas\`: \`- **Habilidad CD 14**: para qué sirve. Éxito: … Fallo: …\` o, si es enfrentada,
    \`- **Habilidad contra la Defensa espiritual**: …\` (se marcan como superadas o falladas).
  - \`### PNJ\`: \`- **Nombre** (pronombre · ficha: Adversario del catálogo): cómo interpretarlo.\` (la ficha permite añadirlo al encuentro)
  - \`### Para los PJ\`: \`- **Nombre del PJ**: su gancho en esta escena.\`
  - \`### Caminos\`: \`- **Si …**: qué ocurre.\`
  - \`### Decisión: ¿La pregunta?\`: una decisión que la pantalla guarda por personaje. Una viñeta por opción, con lo que da:
    \`- Lo que hace. **Atributo** +1 Fuerza · **Habilidad** +2 Atletismo · **Pericia** … · **Meta** … · **Objeto** … · **Camino** Guerrero · **Metal** Peltre · **Eco** lo que la historia recordará\`
    (todas las claves son opcionales; «**Habilidad** +1 Medicina y +1 Disciplina» reparte). Antes de las viñetas, líneas opcionales:
    \`decide:\` (como el de la escena), \`prueba: CD 10\` (con la habilidad de la opción elegida) o \`prueba: Atletismo CD 12\`, y
    \`éxito: +1 al atributo de la habilidad\`.
  - \`### Reglas del combate\`: efectos del campo de batalla (se ven en el encuentro).
  - Cualquier otra sección (\`### Tabla de oportunidades\`, \`### Lo que saben\`…) se muestra tal cual.
  - \`### Avances\`: avances recomendados (\`- Los PJ suben a nivel 4\`, un hito de una meta, un Ideal…). La pantalla solo los
    recomienda: se aplican en la ficha de cada personaje.
- Negrita con \`**…**\` y cursiva con \`*…*\`. Nada de HTML, tablas ni enlaces.`

// ── From the book to the session ─────────────────────────────────────────────

const NOMBRE_TIPO: Record<TipoEscena, string> = {
  narrative: 'narrativa', social: 'social', exploration: 'exploración', combat: 'combate', choice: 'decisión',
}

/** Text of the data as one Markdown line (no line breaks that would split it) */
const enLinea = (t: string) => t.replace(/\s*\n\s*/g, ' ').trim()

/** Paragraphs of a read-aloud text as `>` lines (a lone `>` separates them) */
const citaMd = (t: string) => t.trim().split(/\n\s*\n/).filter(Boolean).flatMap((p, i) => [...(i ? ['>'] : []), `> ${enLinea(p)}`])

const HABILIDAD = '[A-ZÁÉÍÓÚ][a-záéíóúñ]+(?: (?:ligero|pesado))?'
const RE_PRUEBA = new RegExp(`(${HABILIDAD}(?:(?:, | o | y )${HABILIDAD})*)\\s+CD\\s*(\\d{1,2})`, 'g')
const RE_PRUEBA_LIBRE = /prueba CD\s*(\d{1,2}) con una habilidad relevante/

/**
 * The tests of the book's text, as «Pruebas» items: «prueba de <Habilidad> CD n» explains itself with its whole sentence;
 * «… (Atletismo CD 13)» with the clause before it (several tests can share one sentence)
 */
function pruebasDe(textos: string[]): string[] {
  const items: string[] = []
  for (const t of textos) {
    for (const frase of t.match(/[^.!?]+[.!?]*/g) ?? []) {
      const entera = enLinea(frase)
      const libre = RE_PRUEBA_LIBRE.exec(entera)
      if (libre) items.push(`**Habilidad relevante CD ${libre[1]}**: ${entera}`)
      for (const m of entera.matchAll(RE_PRUEBA)) {
        const antes = entera.slice(0, m.index)
        const clausula = /pruebas?(?: enfrentada)? de\s*$/.test(antes)
          ? ''
          : (antes.replace(/\(\s*$/, '').split(/[:;,()]/).pop() ?? '').replace(/^\s*(?:o|y)\s+/, '').trim()
        items.push(`**${m[1]} CD ${m[2]}**: ${clausula.length >= 12 ? clausula : entera}`)
      }
    }
  }
  return [...new Set(items)]
}

function tablaMd(t: SceneTable): string[] {
  return ['', `### ${t.title}`, ...t.entries.map((e) => (e.roll ? `- **${e.roll}**: ${enLinea(e.text)}` : `- ${enLinea(e.text)}`))]
}

const grupoLibro = (cap: AdventureChapter) => `Capítulo ${cap.number} · ${cap.title}`
/** «Caminapiedras · capítulo 3 · Localizaciones de Rathalas (PDF 57-80)» */
const fuenteLibro = (libro: string, cap: AdventureChapter, apartado?: string) =>
  `${libro} · capítulo ${cap.number}${apartado ? ` · ${apartado}` : ''} (PDF ${cap.pdfPages.from}-${cap.pdfPages.to})`

/** A scene of the book (`libro`: its title) as a scene of the session (read-aloud, text, tests, paths, tips and tables) */
export function mdDesdeEscenaLibro(libro: string, cap: AdventureChapter, escena: Scene): string {
  const ls = [`## ${escena.title}`, `tipo: ${NOMBRE_TIPO[escena.type]}`, `grupo: ${grupoLibro(cap)}`, `fuente: ${fuenteLibro(libro, cap, escena.section)}`]
  if (escena.readAloud) ls.push('', ...citaMd(escena.readAloud))
  for (const p of escena.content) ls.push('', enLinea(p))
  const pruebas = pruebasDe(escena.content)
  if (pruebas.length) ls.push('', '### Pruebas', ...pruebas.map((x) => `- ${x}`))
  if (escena.branches?.length) ls.push('', '### Caminos', ...escena.branches.map((b) => `- **${enLinea(b.label)}**: ${enLinea(b.description)}`))
  if (escena.tips?.length) ls.push('', '### Consejos del libro', ...escena.tips.map((t) => `- ${enLinea(t)}`))
  for (const t of escena.tables ?? []) ls.push(...tablaMd(t))
  return ls.join('\n')
}

/** A combat of the book as a scene of the session: enemies (to prepare the encounter), rules, map and tables */
export function mdDesdeCombateLibro(libro: string, cap: AdventureChapter, combate: Combat): string {
  const mapa = combate.mapRef ? cap.maps.find((m) => m.id === combate.mapRef || m.id.endsWith(combate.mapRef ?? '')) : undefined
  const ls = [`## ${combate.title}`, 'tipo: combate', `grupo: ${grupoLibro(cap)}`, `fuente: ${fuenteLibro(libro, cap)}`]
  if (mapa?.imagePath) ls.push(`imagen: ${mapa.imagePath} | Mapa ${mapa.id}: ${mapa.title}`)
  ls.push(`enemigos: ${combate.enemies.map((e) => `${cantidadDe(e.count)} ${e.name}`).join(', ')}`)
  if (combate.duration) ls.push('', `Duración: ${enLinea(combate.duration)}`)
  const notas = combate.enemies.filter((e) => e.bonus || !/^\d+$/.test(e.count.trim()))
  ls.push('', '### Reglas del combate', ...combate.specialRules.map((r) => `- ${enLinea(r)}`))
  for (const e of notas) ls.push(`- **${e.name}** (${enLinea(e.count)})${e.bonus ? `: ${enLinea(e.bonus)}` : ''}`)
  if (combate.rewards) ls.push('', '### Recompensas', enLinea(combate.rewards))
  for (const t of combate.tables ?? []) ls.push(...tablaMd(t))
  return ls.join('\n')
}

/** A scene added in the middle of the game: title, type, what to read aloud and what happens */
export function mdEscenaRapida(o: { titulo: string; tipo: TipoEscena; grupo: string; leer: string; texto: string }): string {
  const ls = [`## ${o.titulo.trim()}`, `tipo: ${NOMBRE_TIPO[o.tipo]}`]
  if (o.grupo.trim()) ls.push(`grupo: ${o.grupo.trim()}`)
  if (o.leer.trim()) ls.push('', ...citaMd(o.leer))
  if (o.texto.trim()) ls.push('', o.texto.trim())
  return ls.join('\n')
}
