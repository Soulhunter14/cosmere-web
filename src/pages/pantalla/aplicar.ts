/**
 * What a decision of the script gives to the sheet, by sheet field, summed as the record of decisions does (`registroDecisiones`):
 * attributes, skill ranks, expertises, goals and items, plus the test prize. It travels with every decision the screen sends
 * (`sincronizacion`), so the API writes it on the sheet as it comes during the creation session, and with the manual «Aplicar a la
 * ficha» (`POST …/respuestas/aplicar`) for the pending rows. The recommended path and metal are the most marked among every choice.
 */
import { creacionApi } from '../../api/creacion'
import { foldText as normalizar } from '../../lib/catalogo'
import type { AplicarRespuestasRequest, AplicarRespuestasResponse, CreacionPersonaje, EfectosFicha, RespuestaPersonaje } from '../../types'
import type { AttrField, HabilidadDef } from '../../worlds/types'
import { registroDecisiones, type Suma } from './decisiones'
import { CLAVES_EFECTO, type Efecto, type Eleccion } from './estado'

const ATRIBUTOS: AttrField[] = ['fuerza', 'velocidad', 'intelecto', 'voluntad', 'discernimiento', 'presencia']

/** The decisions of the script recorded for the character that nobody applied yet */
export const decisionesPendientes = (p: CreacionPersonaje): RespuestaPersonaje[] =>
  p.respuestas.filter((r) => r.tipoPregunta === 'decision' && !r.aplicadaEn)

export const decisionesAplicadas = (p: CreacionPersonaje): RespuestaPersonaje[] =>
  p.respuestas.filter((r) => r.tipoPregunta === 'decision' && !!r.aplicadaEn)

/** The record's key of a screen decision (`grupo|escena|pregunta|<characterId>`): `decision:grupo|escena|pregunta` */
export const claveRegistro = (claveDecision: string): string => `decision:${claveDecision.slice(0, claveDecision.lastIndexOf('|'))}`

const texto = (v: unknown): string => (typeof v === 'string' ? v : '')

/** A recorded decision as the screen's `Eleccion`, to sum it with the record's own logic */
export function eleccionDe(r: RespuestaPersonaje, p: CreacionPersonaje): Eleccion {
  const d = r.detalle
  const efectos: Efecto[] = Array.isArray(d.efectos)
    ? (d.efectos as unknown[]).flatMap((e) => {
        if (!e || typeof e !== 'object') return []
        const clave = texto((e as { clave?: unknown }).clave)
        const valor = texto((e as { valor?: unknown }).valor)
        return (CLAVES_EFECTO as readonly string[]).includes(clave) && valor ? [{ clave: clave as Efecto['clave'], valor }] : []
      })
    : []
  return {
    escena: texto(d.escena), grupo: texto(d.grupo), pregunta: r.pregunta, characterId: p.id, personaje: p.name, opcion: r.respuesta, efectos,
    prueba: texto(d.prueba), resultado: d.resultado === 'exito' || d.resultado === 'fallo' ? d.resultado : null, exito: texto(d.exito),
    en: texto(d.en) || r.respondidaEn,
  }
}

const sumar = (todas: Eleccion[], habilidades: HabilidadDef[]) =>
  registroDecisiones(Object.fromEntries(todas.map((e, i) => [String(i), e])), habilidades, [])[0]

/** What one choice gives to the sheet, by sheet field (a skill outside the world's list goes by name: the API looks for its custom slot) */
export function efectosDeEleccion(el: Eleccion, habilidades: HabilidadDef[]): EfectosFicha {
  const r = sumar([el], habilidades)
  const atributos: Record<string, number> = {}
  const hab: Record<string, number> = {}
  for (const s of r?.atributos ?? []) {
    const campo = ATRIBUTOS.find((a) => normalizar(a) === normalizar(s.nombre)) ?? s.nombre
    atributos[campo] = (atributos[campo] ?? 0) + s.total
  }
  for (const s of r?.habilidades ?? []) {
    const campo = habilidades.find((h) => normalizar(h.label) === normalizar(s.nombre))?.field ?? s.nombre
    hab[campo] = (hab[campo] ?? 0) + s.total
  }
  return { atributos, habilidades: hab, pericias: r?.pericias ?? [], metas: r?.metas ?? [], objetos: r?.objetos ?? [] }
}

/** The most marked name when it is alone at the top; '' with a tie or nothing */
const recomendado = (sumas: Suma[]): string =>
  sumas.length > 0 && (sumas.length === 1 || sumas[0].total > sumas[1].total) ? sumas[0].nombre : ''

/** The path and metal the night recommends: the most marked among every choice of the character */
export function recomendacionDe(todas: Eleccion[], habilidades: HabilidadDef[]): { camino: string; metal: string } {
  const r = todas.length ? sumar(todas, habilidades) : undefined
  return { camino: recomendado(r?.caminos ?? []), metal: recomendado(r?.metales ?? []) }
}

/** The manual «Aplicar a la ficha»: the pending rows, each with what it gives, and the recommendation from every decision */
export function peticionDe(p: CreacionPersonaje, pendientes: RespuestaPersonaje[], habilidades: HabilidadDef[]): AplicarRespuestasRequest {
  const todas = p.respuestas.filter((r) => r.tipoPregunta === 'decision').map((r) => eleccionDe(r, p))
  const { camino, metal } = recomendacionDe(todas, habilidades)
  return {
    filas: pendientes.map((r) => ({ clave: r.clave, efectos: efectosDeEleccion(eleccionDe(r, p), habilidades) })),
    caminoRecomendado: camino,
    metalRecomendado: metal,
  }
}

/** Applies the character's pending decisions to its sheet */
export function aplicarAFicha(cId: number, p: CreacionPersonaje, habilidades: HabilidadDef[]): Promise<AplicarRespuestasResponse> {
  return creacionApi.aplicar(cId, p.id, peticionDe(p, decisionesPendientes(p), habilidades))
}
