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
