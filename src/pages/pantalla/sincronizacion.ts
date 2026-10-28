/**
 * Keeps the API's record of answers (`PUT …/respuestas/decisiones`, one whole list per character) in step with what the screen
 * records in `estado.decisiones`: after a choice, a test or a removal the character's list is sent again (after a short pause, so
 * several taps go together), so its rows always equal the screen; sending twice changes nothing. The state of each send lives here,
 * an external store, so the record of decisions can show it and offer «Guardar en la creación» when a send failed. While the campaign's
 * creation session is running the API marks the rows as decisions of the creation (see `SesionCreacion`).
 */
import { useEffect, useRef, useSyncExternalStore } from 'react'
import axios from 'axios'
import { creacionApi } from '../../api/creacion'
import type { DecisionRespuestaRequest } from '../../types'
import { ahoraIso, type PantallaEstado } from './estado'
import { tituloSesion } from './exportar'

export interface EstadoEnvio {
  estado: 'pendiente' | 'guardando' | 'guardado' | 'error'
  /** ISO date of the change of state */
  en: string
  error?: string
}

const RETRASO = 800

let estados: Record<number, EstadoEnvio> = {}
const oyentes = new Set<() => void>()
const temporizadores = new Map<number, number>()

const poner = (characterId: number, e: EstadoEnvio) => {
  estados = { ...estados, [characterId]: e }
  for (const f of oyentes) f()
}
const suscribir = (f: () => void) => {
  oyentes.add(f)
  return () => { oyentes.delete(f) }
}
const leer = () => estados

/** The state of the last send of each character (by character id) */
export const useSincronizacion = () => useSyncExternalStore(suscribir, leer, leer)

/** A ref that holds the latest value once each render is committed, for the sends that run after a pause */
export function useUltimo<T>(valor: T): { readonly current: T } {
  const ref = useRef(valor)
  useEffect(() => { ref.current = valor })
  return ref
}

/** The screen keys a decision as `grupo|escena|pregunta|<characterId>` (`claveDecision`); the API wants it without the character */
const claveSinPersonaje = (clave: string) => clave.slice(0, clave.lastIndexOf('|'))

/** The character of a screen key (`null` for a choice recorded without one) */
export function personajeDeClave(clave: string): number | null {
  const s = clave.slice(clave.lastIndexOf('|') + 1)
  const n = Number(s)
  return s !== '' && s !== '-' && Number.isFinite(n) ? n : null
}

/** The decisions of a character as the API records them: the whole list, with what each option gives and how its test went */
export function decisionesDe(estado: PantallaEstado, characterId: number): DecisionRespuestaRequest[] {
  return Object.entries(estado.decisiones)
    .filter(([, e]) => e.characterId === characterId)
    .map(([k, e]) => ({
      clave: claveSinPersonaje(k),
      pregunta: e.pregunta,
      respuesta: e.opcion,
      tipoRespuesta: 'opcion' as const,
      detalle: { grupo: e.grupo, escena: e.escena, efectos: e.efectos, prueba: e.prueba, resultado: e.resultado, exito: e.exito, en: e.en },
    }))
}

/** Characters with at least one decision on the screen */
export const personajesConDecisiones = (estado: PantallaEstado): number[] =>
  [...new Set(Object.values(estado.decisiones).map((e) => e.characterId).filter((id): id is number => id !== null))]

/** The server's message of a refused request, or a generic one */
export function mensajeDe(e: unknown): string {
  if (axios.isAxiosError(e)) {
    const data = e.response?.data as { error?: unknown } | undefined
    if (typeof data?.error === 'string') return data.error
  }
  return e instanceof Error && e.message ? e.message : 'No se ha podido guardar.'
}

/** Sends a character's decisions now (`leerEstado` gives the screen's current document) */
export async function enviar(cId: number, characterId: number, leerEstado: () => PantallaEstado): Promise<void> {
  const t = temporizadores.get(characterId)
  if (t !== undefined) {
    window.clearTimeout(t)
    temporizadores.delete(characterId)
  }
  poner(characterId, { estado: 'guardando', en: ahoraIso() })
  try {
    const estado = leerEstado()
    const s = estado.sesion
    await creacionApi.putDecisiones(cId, characterId, {
      sesionId: s?.id ?? '',
      sesionTitulo: s ? tituloSesion(s) : '',
      decisiones: decisionesDe(estado, characterId),
    })
    poner(characterId, { estado: 'guardado', en: ahoraIso() })
  } catch (e) {
    poner(characterId, { estado: 'error', en: ahoraIso(), error: mensajeDe(e) })
  }
}

/** Sends a character's decisions after a short pause; a choice recorded without a character has nowhere to go */
export function programar(cId: number, characterId: number | null, leerEstado: () => PantallaEstado): void {
  if (characterId === null) return
  const t = temporizadores.get(characterId)
  if (t !== undefined) window.clearTimeout(t)
  poner(characterId, { estado: 'pendiente', en: ahoraIso() })
  temporizadores.set(characterId, window.setTimeout(() => { void enviar(cId, characterId, leerEstado) }, RETRASO))
}

/** Sends every character with decisions now, or only the ones not saved yet (before ending the creation session) */
export async function enviarTodos(cId: number, leerEstado: () => PantallaEstado, soloPendientes = false): Promise<void> {
  const ids = personajesConDecisiones(leerEstado())
  const lista = soloPendientes ? ids.filter((id) => estados[id] !== undefined && estados[id].estado !== 'guardado') : ids
  await Promise.all(lista.map((id) => enviar(cId, id, leerEstado)))
}
