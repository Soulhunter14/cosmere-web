/**
 * Export of the log (bitácora) of a table session: the director's notes as Markdown, and the prompt that turns them into the
 * diary chronicle with the upload format of `docs/diario-formato.md` (front matter `numero`/`titulo`, mentions `[[PJ - Nombre]]`).
 * The chronicle is still written outside the app (usually with AI) and uploaded in Partida → Diario.
 */
import type { EventoBitacora, SesionMesa } from './estado'

export const hora = (iso: string) => new Date(iso).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
export const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })

export const lineaEvento = (e: EventoBitacora) => `- ${hora(e.en)} · ${e.etiqueta ? `${e.etiqueta}: ` : ''}${e.texto}`

export const tituloSesion = (s: SesionMesa) => `Sesión ${s.numero ?? '¿?'}${s.titulo ? ` - ${s.titulo}` : ''}`

export function notasMarkdown(s: SesionMesa, campana: string, mundo: string): string {
  const fin = s.terminadaEn ? `–${hora(s.terminadaEn)}` : ''
  return [
    `# ${tituloSesion(s)} (notas del director)`,
    '',
    `${campana} · ${mundo} · ${fecha(s.iniciadaEn)}, ${hora(s.iniciadaEn)}${fin}`,
    '',
    ...(s.eventos.length ? s.eventos.map(lineaEvento) : ['(sin notas)']),
    '',
  ].join('\n')
}

/** The prompt of `docs/diario-formato.md`, filled in with the session, the exact names to mention and the notes */
export function promptCronica(s: SesionMesa, o: { campana: string; mundo: string; pjs: string[]; pnjs: string[] }): string {
  const n = s.numero ?? '{N}'
  const nombres = [...o.pjs.map((p) => `[[PJ - ${p}]]`), ...o.pnjs.map((p) => `[[NPC - ${p}]]`)].join(', ')
  return [
    `Escribe la crónica de la sesión ${n} de nuestra campaña «${o.campana}» (${o.mundo}) a partir de estas notas del director.`,
    '',
    `Formato: un archivo Markdown que empiece con \`---\`, \`numero: ${n}\`, \`titulo: {título breve}\`, \`---\`. Después, de 4 a 8 párrafos ` +
      'en español, en pasado y tercera persona, con tono de crónica. La primera frase resume la sesión. Menciona a los personajes jugadores ' +
      'como `[[PJ - Nombre]]`, a los NPC como `[[NPC - Nombre]]` y a las facciones como `[[Facción - Nombre]]`' +
      (nombres ? `, con los nombres exactos de esta lista: ${nombres}` : '') +
      '. Si hay pistas o cabos sueltos, termina con una lista de viñetas `- ` con ellos. No uses otro Markdown.',
    '',
    `Notas de la sesión (${fecha(s.iniciadaEn)}):`,
    ...(s.eventos.length ? s.eventos.map(lineaEvento) : ['(sin notas)']),
  ].join('\n')
}

/** How a scene of the current script went, for the prompt of the next one */
export interface EscenaJugada {
  grupo: string
  titulo: string
  estado: 'jugada' | 'actual' | 'pendiente'
  /** «Supervivencia CD 14: superada», «Empeño: superado (6 éxitos, 2 fallos)», «Hecho: Los PJ suben a nivel 4» */
  detalles: string[]
}

const ESTADO_ESCENA: Record<EscenaJugada['estado'], string> = { jugada: 'jugada', actual: 'en juego', pendiente: 'sin jugar' }

/**
 * The prompt that asks an AI for the next draft of the script («Guion»): where the story is (last diary chronicle, what was
 * played of the current script, the director's notes), who the PJs are, and the import format. The loop is: draft → play →
 * upload the chronicle → this prompt → import the new draft.
 */
export function promptSiguienteGuion(o: {
  campana: string
  mundo: string
  pjs: string[]
  cronica: { numero: number; titulo: string; texto: string } | null
  guionTitulo: string
  escenas: EscenaJugada[]
  notas: EventoBitacora[]
  formato: string
}): string {
  const guion = o.escenas.map((e) => {
    const cabeza = `- [${ESTADO_ESCENA[e.estado]}] ${e.grupo ? `${e.grupo} · ` : ''}${e.titulo}`
    return e.detalles.length ? `${cabeza}. ${e.detalles.join('. ')}.` : cabeza
  })
  return [
    `Eres el ayudante de guion del director de nuestra campaña «${o.campana}» (${o.mundo}). Escribe el borrador de lo que debería ` +
      'suceder a partir de ahora: las escenas de la próxima sesión (y de la siguiente si la historia lo pide), para usarlo como guion ' +
      'en la mesa desde la pantalla del director.',
    '',
    'Cómo hacerlo:',
    '- Empieza en el punto exacto donde termina la última crónica. Lo que se jugó manda sobre lo previsto en el guion anterior: ' +
      'las escenas sin jugar se pueden reaprovechar, cambiar o descartar.',
    '- Si hay una aventura publicada, úsala como base y adáptala a lo que ya ha cambiado nuestra historia; cita la página en `fuente:`. ' +
      'Escribe con tus propias palabras: no copies párrafos del libro.',
    '- Cada escena debe servir para dirigir sin abrir el libro: qué pasa y cómo dirigirlo, texto para leer en voz alta, pruebas con su CD ' +
      'y qué ocurre si se superan o se fallan, PNJ con cómo interpretarlos, un gancho para cada PJ que esté presente, caminos según lo que ' +
      'decidan los jugadores y, en los combates, enemigos del catálogo de adversarios y reglas del campo de batalla.',
    '- Devuelve solo el guion, en un único bloque de Markdown con este formato:',
    '',
    o.formato,
    '',
    'Personajes jugadores:',
    ...(o.pjs.length ? o.pjs.map((p) => `- ${p}`) : ['(sin personajes)']),
    '',
    o.cronica ? `Última crónica del diario (sesión ${o.cronica.numero} · ${o.cronica.titulo}):` : 'Última crónica del diario: (todavía no hay ninguna)',
    ...(o.cronica ? [o.cronica.texto.trim()] : []),
    '',
    `Guion anterior${o.guionTitulo ? ` «${o.guionTitulo}»` : ''}:`,
    ...(guion.length ? guion : ['(vacío)']),
    '',
    'Notas del director de la última sesión:',
    ...(o.notas.length ? o.notas.map(lineaEvento) : ['(sin notas)']),
  ].join('\n')
}

/** Clipboard. `navigator.clipboard` only exists in a secure context: on http://<LAN ip> the old `execCommand` path copies instead */
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(texto)
      return true
    }
  } catch {
    /* falls back below */
  }
  const area = document.createElement('textarea')
  area.value = texto
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  area.remove()
  return ok
}

export function descargarTexto(nombreArchivo: string, texto: string) {
  const url = URL.createObjectURL(new Blob([texto], { type: 'text/markdown;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = nombreArchivo
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** «Sesión 07 - La fortaleza.md» (the Obsidian name the diary upload also understands) */
export const nombreArchivoSesion = (s: SesionMesa, sufijo = 'notas') =>
  `Sesión ${String(s.numero ?? 0).padStart(2, '0')}${s.titulo ? ` - ${s.titulo.replace(/[\\/:*?"<>|]/g, '')}` : ''} (${sufijo}).md`
