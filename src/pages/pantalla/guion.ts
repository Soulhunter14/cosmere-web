/**
 * «Guion» of the director's screen: the scenes prepared for the next sessions, written in Markdown (usually by an AI from the
 * book and the campaign: `FORMATO_GUION`, `docs/pantalla-director/guion-formato.md`) and imported into the screen. Each scene is
 * stored as its own Markdown (`EscenaPropia.md`), so editing it is editing text and the format can grow without migrating the
 * document. This module reads that text into what the panels show, and splits, merges and writes whole scripts.
 * Pure functions, no React.
 */
import { foldText as normalizar } from '../../lib/catalogo'
import type { EnemigoEscena, EscenaPropia, ImagenEscena, TipoEscena } from './estado'
import { enemigosDeTexto } from './adversarios'

/** Sections the screen gives a behaviour to; any other `###` section is shown as written */
export type ClaseSeccion = 'pruebas' | 'pnj' | 'pj' | 'caminos' | 'reglas' | 'avances' | 'otra'

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
  /** Where it comes from («Caminapiedras L.78-79 / PDF 82-83») */
  fuente: string
  enemigos: EnemigoEscena[]
  empeno: Empeno | null
  contadores: string[]
  imagenes: ImagenEscena[]
  /** Text before the first `###` section */
  cuerpo: Bloque[]
  secciones: Seccion[]
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

const CLAVES_META = ['tipo', 'grupo', 'fuente', 'enemigos', 'empeno', 'contadores', 'contador', 'imagen', 'imagenes'] as const
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
    titulo, tipo: 'narrative', grupo: '', fuente: '', enemigos: [], empeno: null, contadores: [], imagenes: [], cuerpo: [], secciones: [],
  }
  // Metadata: «clave: valor» lines right under the title
  for (; i < ls.length; i++) {
    const m = claveMeta(ls[i])
    if (!m) break
    const [k, v] = m
    if (k === 'tipo') e.tipo = TIPOS[normalizar(v)] ?? e.tipo
    else if (k === 'grupo') e.grupo = v
    else if (k === 'fuente') e.fuente = v
    else if (k === 'enemigos') e.enemigos.push(...enemigosDeMeta(v))
    else if (k === 'empeno') e.empeno = empenoDeMeta(v)
    else if (k === 'contadores' || k === 'contador') e.contadores.push(...v.split(/[,;]/).map((s) => s.trim()).filter(Boolean))
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
export function fusionarGuion(actual: EscenaPropia[], mds: string[], modo: ModoImportar, nuevoId: () => string): ResultadoImportar {
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
  const escenas = [...actual.map((e) => porId.get(e.id) ?? e), ...importadas.filter((e) => !actual.some((a) => a.id === e.id))]
  return { escenas, nuevas, actualizadas, quitadas: [] }
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
- Cuerpo de la escena: párrafos para el director; las líneas que empiezan por \`> \` son el texto para leer en voz alta.
- Secciones \`### …\` con viñetas \`- \`. La pantalla da función a estas:
  - \`### Pruebas\`: \`- **Habilidad CD 14**: para qué sirve. Éxito: … Fallo: …\` o, si es enfrentada,
    \`- **Habilidad contra la Defensa espiritual**: …\` (se marcan como superadas o falladas).
  - \`### PNJ\`: \`- **Nombre** (pronombre · ficha: Adversario del catálogo): cómo interpretarlo.\` (la ficha permite añadirlo al encuentro)
  - \`### Para los PJ\`: \`- **Nombre del PJ**: su gancho en esta escena.\`
  - \`### Caminos\`: \`- **Si …**: qué ocurre.\`
  - \`### Reglas del combate\`: efectos del campo de batalla (se ven en el encuentro).
  - Cualquier otra sección (\`### Tabla de oportunidades\`, \`### Lo que saben\`…) se muestra tal cual.
  - \`### Avances\`: avances recomendados (\`- Los PJ suben a nivel 4\`, un hito de una meta, un Ideal…). La pantalla solo los
    recomienda: se aplican en la ficha de cada personaje.
- Negrita con \`**…**\` y cursiva con \`*…*\`. Nada de HTML, tablas ni enlaces.`
