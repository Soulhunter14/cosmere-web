/**
 * «Aplicar a la ficha»: what the decisions of the script not applied yet give to a character, summed as the record of decisions does
 * (`registroDecisiones`) and turned into the request the API applies (`POST …/respuestas/aplicar`): attributes and skills by sheet
 * field, expertises, goals, items, and the recommended path and metal (the most marked, when alone at the top). The API writes it with
 * the creation caps and marks the rows as applied, so applying twice adds nothing.
 */
import { creacionApi } from '../../api/creacion'
import { foldText as normalizar } from '../../lib/catalogo'
import type { AplicarRespuestasRequest, AplicarRespuestasResponse, CreacionPersonaje, RespuestaPersonaje } from '../../types'
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
function eleccionDe(r: RespuestaPersonaje, p: CreacionPersonaje): Eleccion {
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

/** The most marked name when it is alone at the top; '' with a tie or nothing */
const recomendado = (sumas: Suma[]): string =>
  sumas.length > 0 && (sumas.length === 1 || sumas[0].total > sumas[1].total) ? sumas[0].nombre : ''

export interface PeticionAplicar {
  peticion: AplicarRespuestasRequest
  /** What the sheet has no field for (a skill not in the world's list goes by name: the API looks for a custom slot) */
  sinSitio: string[]
}

/** What the pending decisions give, as the API applies it */
export function peticionDe(p: CreacionPersonaje, pendientes: RespuestaPersonaje[], habilidades: HabilidadDef[]): PeticionAplicar {
  const decisiones = Object.fromEntries(pendientes.map((r) => [r.clave, eleccionDe(r, p)]))
  const [r] = registroDecisiones(decisiones, habilidades, [{ id: p.id, name: p.name }])
  const atributos: Record<string, number> = {}
  const hab: Record<string, number> = {}
  const sinSitio: string[] = []
  for (const s of r?.atributos ?? []) {
    const campo = ATRIBUTOS.find((a) => normalizar(a) === normalizar(s.nombre))
    if (campo) atributos[campo] = (atributos[campo] ?? 0) + s.total
    else sinSitio.push(`${s.nombre} +${s.total}`)
  }
  for (const s of r?.habilidades ?? []) {
    const def = habilidades.find((h) => normalizar(h.label) === normalizar(s.nombre))
    const campo = def?.field ?? s.nombre
    hab[campo] = (hab[campo] ?? 0) + s.total
    if (!def) sinSitio.push(`${s.nombre} +${s.total}`)
  }
  return {
    peticion: {
      claves: pendientes.map((x) => x.clave),
      atributos,
      habilidades: hab,
      pericias: r?.pericias ?? [],
      metas: r?.metas ?? [],
      objetos: r?.objetos ?? [],
      caminoRecomendado: recomendado(r?.caminos ?? []),
      metalRecomendado: recomendado(r?.metales ?? []),
    },
    sinSitio,
  }
}

/** Applies the character's pending decisions to its sheet */
export function aplicarAFicha(cId: number, p: CreacionPersonaje, habilidades: HabilidadDef[]): Promise<AplicarRespuestasResponse> {
  const { peticion } = peticionDe(p, decisionesPendientes(p), habilidades)
  return creacionApi.aplicar(cId, p.id, peticion)
}
