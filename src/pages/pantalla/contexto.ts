import { createContext, useContext, useSyncExternalStore } from 'react'
import type { GmScreen } from '../../types'
import { anotar, marcar, type PantallaEstado, type TipoEvento } from './estado'

/** Saving state shown in the top bar: `error` is a network failure (retried), `rechazado` a refusal of the server (not retried) */
export type EstadoGuardado = 'guardado' | 'pendiente' | 'guardando' | 'error' | 'rechazado' | 'conflicto'

export interface PantallaCtx {
  cId: number
  estado: PantallaEstado
  /** Changes the document: the recipe mutates a copy (never the state itself); the save is automatic (0.8 s) */
  actualizar: (receta: (borrador: PantallaEstado) => void) => void
  /** Adds an event to the log; with no open session one is opened, numbered after the diary */
  anotar: (ev: { tipo: TipoEvento; texto: string; etiqueta?: string }) => void
  /** Highest session number of the diary (null when it has none or it has not loaded) */
  ultimoDiario: number | null
  guardado: EstadoGuardado
  /** Another device saved first: the stored document, until the director picks one */
  conflicto: GmScreen | null
  resolverConflicto: (usar: 'servidor' | 'mia') => void
  /** Why the server refused the last save (too large, invalid text, no longer the GM…), until a save goes through */
  rechazo: string | null
  /** The stored document comes from a newer release of the app: shown, never changed or saved, until the page reloads */
  soloLectura: boolean
  /** Sends the pending changes now (after a refusal) */
  reintentarGuardado: () => void
}

export const PantallaContext = createContext<PantallaCtx | null>(null)

/**
 * Saves still running per campaign, also after the screen was left: a new visit waits for them before reading the stored
 * document, so it never starts from the version before the last save (which would end in a false conflict).
 */
export const guardadosEnCurso = new Map<number, Promise<unknown>>()
export const esperarGuardado = (cId: number): Promise<unknown> => guardadosEnCurso.get(cId)?.catch(() => {}) ?? Promise.resolve()

export function usePantalla(): PantallaCtx {
  const ctx = useContext(PantallaContext)
  if (!ctx) throw new Error('usePantalla fuera de PantallaProvider')
  return ctx
}

/** Toggles a progress mark; marking it (not unmarking) also writes the log line «{etiqueta}: {texto}» */
export function useAlternarMarca() {
  const { estado, actualizar, ultimoDiario } = usePantalla()
  return (clave: string, texto: string, etiqueta: string) => {
    const marcada = !!estado.marcas[clave]
    actualizar((b) => {
      marcar(b, clave, !marcada)
      if (!marcada) anotar(b, { tipo: 'avance', etiqueta, texto }, ultimoDiario)
    })
  }
}

export type PanelId = 'escena' | 'encuentro' | 'grupo' | 'tiradas' | 'bitacora' | 'avances'

export interface PanelesCtx {
  /** Shows a panel: in two panes it selects the tab of its pane, in one pane the only tab strip */
  irA: (panel: PanelId) => void
}

export const PanelesContext = createContext<PanelesCtx>({ irA: () => {} })
export const usePaneles = () => useContext(PanelesContext)

// ── Clock: a pure way to read the time in render (react-hooks/purity) ──────────

let ahora = Date.now()
const oyentes = new Set<() => void>()
let reloj: number | undefined

function suscribirReloj(cb: () => void) {
  oyentes.add(cb)
  if (reloj === undefined) {
    // Back on the screen after a while: the time is the current one, not the one of the last tick
    ahora = Date.now()
    reloj = window.setInterval(() => {
      ahora = Date.now()
      oyentes.forEach((o) => o())
    }, 15_000)
  }
  return () => {
    oyentes.delete(cb)
    if (oyentes.size === 0) {
      window.clearInterval(reloj)
      reloj = undefined
    }
  }
}

/** Current time in ms, refreshed every 15 s (elapsed session time in the top bar and the log) */
export const useAhora = () => useSyncExternalStore(suscribirReloj, () => ahora)

/** «1 h 05 min» / «12 min» */
export function duracion(desdeIso: string, hastaMs: number): string {
  const min = Math.max(0, Math.floor((hastaMs - new Date(desdeIso).getTime()) / 60_000))
  return min >= 60 ? `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min` : `${min} min`
}

// ── Per-device preferences (tab of each pane, reading size…): localStorage, never required ──

export function leerPreferencia<T>(clave: string, def: T, valida: (v: unknown) => v is T): T {
  try {
    const raw = localStorage.getItem(clave)
    if (raw === null) return def
    const v: unknown = JSON.parse(raw)
    return valida(v) ? v : def
  } catch {
    return def
  }
}

export function guardarPreferencia(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    /* private mode or blocked storage: the preference just isn't remembered */
  }
}
