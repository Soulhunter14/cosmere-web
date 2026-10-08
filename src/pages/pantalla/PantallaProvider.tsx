import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { gmScreenApi } from '../../api/gmScreen'
import { diaryApi } from '../../api/diary'
import type { GmScreen } from '../../types'
import { VERSION_ESTADO, anotar as anotarEn, normalizarEstado, type PantallaEstado, type TipoEvento } from './estado'
import { PantallaContext, guardadosEnCurso, type EstadoGuardado, type PantallaCtx } from './contexto'

/** Quiet time after the last change before saving */
const DEBOUNCE_MS = 800
/** Retry after a failed save (no connection, server down) */
const REINTENTO_MS = 5000
/** A save with no answer by then is given up and retried (a half-open connection after the tablet wakes up) */
const TIEMPO_MAXIMO_MS = 15_000
/**
 * Largest document sent, in UTF-8 bytes: under nginx's 1 MiB body limit and the API's 1,000,000 characters. Over it, the oldest
 * closed sessions of the log are dropped (by then they should be in the diary).
 */
const LIMITE_BYTES = 900_000

/** Half an emoji (a lone UTF-16 surrogate) becomes U+FFFD: the server refuses text it cannot write back as JSON */
function bienFormada(s: string): string {
  if (!/[\ud800-\udfff]/.test(s)) return s
  let r = ''
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i)
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < s.length) {
      const d = s.charCodeAt(i + 1)
      if (d >= 0xdc00 && d <= 0xdfff) {
        r += s[i] + s[i + 1]
        i++
        continue
      }
    }
    r += c >= 0xd800 && c <= 0xdfff ? '�' : s[i]
  }
  return r
}

const aTexto = (estado: PantallaEstado) => JSON.stringify(estado, (_k, v: unknown) => (typeof v === 'string' ? bienFormada(v) : v))
const bytes = (s: string) => new TextEncoder().encode(s).length

/** The document as it is sent: well-formed text and, when too large, without its oldest closed sessions (newest first) */
function preparar(estado: PantallaEstado): { estado: PantallaEstado; texto: string; recortado: boolean } {
  let texto = aTexto(estado)
  if (bytes(texto) <= LIMITE_BYTES) return { estado, texto, recortado: false }
  const copia: PantallaEstado = { ...estado, historial: [...estado.historial] }
  while (copia.historial.length > 0 && bytes(texto) > LIMITE_BYTES) {
    copia.historial.pop()
    texto = aTexto(copia)
  }
  return { estado: copia, texto, recortado: true }
}

/** Why the server refused a save, in the director's words (the API answers `{ error }` in English) */
function motivoRechazo(status: number, data: unknown): string {
  const error = typeof data === 'object' && data !== null && 'error' in data ? String((data as { error: unknown }).error) : ''
  if (status === 413 || /too large/i.test(error)) return 'el documento es demasiado grande para el servidor.'
  if (/invalid text/i.test(error)) return 'hay un texto con caracteres no válidos.'
  if (status === 403) return 'esta cuenta ya no es la directora de la campaña.'
  if (status === 404) return 'la campaña ya no existe o ya no eres miembro.'
  return `el servidor lo rechazó (${status}).`
}

/**
 * Holds the screen document and saves it by itself: every change marks it pending and a save goes out 0.8 s after the last one,
 * with the version it read. A 409 means another device saved first: nothing is overwritten until the director chooses
 * (`resolverConflicto`). A refusal (400, 403, 413…) is shown with its reason and not retried in a loop; a network failure is.
 * Pending changes are also flushed when the page is hidden and when the screen is left (one last attempt, never a loop).
 */
export function PantallaProvider({ cId, inicial, children }: { cId: number; inicial: GmScreen; children: ReactNode }) {
  // A document saved by a newer release (a deploy, before this tab reloads): shown, never changed or saved, so nothing is lost
  const [soloLectura] = useState(() => {
    const v = typeof inicial.state === 'object' && inicial.state !== null ? (inicial.state as { version?: unknown }).version : undefined
    return typeof v === 'number' && v > VERSION_ESTADO
  })
  const [estado, setEstado] = useState<PantallaEstado>(() => normalizarEstado(inicial.state))
  const [guardado, setGuardado] = useState<EstadoGuardado>('guardado')
  const [conflicto, setConflicto] = useState<GmScreen | null>(null)
  const [rechazo, setRechazo] = useState<string | null>(null)

  // The save loop lives in refs: the latest document, the version read, and whether something is pending or in flight
  const estadoRef = useRef(estado)
  const versionRef = useRef(inicial.version)
  const pendienteRef = useRef(false)
  const enVueloRef = useRef(false)
  const enConflictoRef = useRef(false)
  const montadoRef = useRef(true)
  const temporizadorRef = useRef<number | undefined>(undefined)
  const guardarRef = useRef<() => void>(() => {})

  const programar = useCallback((ms: number) => {
    window.clearTimeout(temporizadorRef.current)
    if (montadoRef.current) temporizadorRef.current = window.setTimeout(() => guardarRef.current(), ms)
  }, [])

  const guardar = useCallback(async () => {
    window.clearTimeout(temporizadorRef.current)
    if (soloLectura || enVueloRef.current || enConflictoRef.current || !pendienteRef.current) return
    enVueloRef.current = true
    pendienteRef.current = false
    setGuardado('guardando')
    const envio = preparar(estadoRef.current)
    if (envio.recortado) {
      estadoRef.current = envio.estado
      setEstado(envio.estado)
    }
    const peticion = gmScreenApi.saveJson(cId, `{"state":${envio.texto},"version":${versionRef.current}}`, TIEMPO_MAXIMO_MS)
    guardadosEnCurso.set(cId, peticion)
    let reintentar = false
    let rechazado = false
    try {
      const r = await peticion
      versionRef.current = r.version
      setRechazo(null)
      setGuardado(pendienteRef.current ? 'pendiente' : 'guardado')
    } catch (e) {
      // Changes made while the request was in flight are still pending, whatever happened to it
      const cambiosNuevos = pendienteRef.current
      pendienteRef.current = true
      const status = isAxiosError(e) ? e.response?.status : undefined
      const data: unknown = isAxiosError(e) ? e.response?.data : undefined
      const guardadoEnServidor = typeof data === 'object' && data !== null ? (data as Partial<GmScreen>) : null
      if (status === 409 && guardadoEnServidor && typeof guardadoEnServidor.version === 'number') {
        if (JSON.stringify(guardadoEnServidor.state) === envio.texto) {
          // Our own save, whose answer was lost (tablet Wi-Fi): the server holds this very document, so go on from its version
          versionRef.current = guardadoEnServidor.version
          pendienteRef.current = cambiosNuevos
          setGuardado(cambiosNuevos ? 'pendiente' : 'guardado')
        } else {
          enConflictoRef.current = true
          setConflicto(guardadoEnServidor as GmScreen)
          setGuardado('conflicto')
        }
      } else if (status !== undefined && status >= 400 && status < 500 && status !== 408 && status !== 429) {
        // Refused: retrying alone would fail again. It is tried again with the next change or with «Reintentar»
        rechazado = true
        setRechazo(motivoRechazo(status, data))
        setGuardado('rechazado')
      } else {
        reintentar = true
        setGuardado('error')
      }
    } finally {
      enVueloRef.current = false
      if (guardadosEnCurso.get(cId) === peticion) guardadosEnCurso.delete(cId)
    }
    if (!pendienteRef.current || enConflictoRef.current || rechazado) return
    // Changes made while the request was in flight, or a retry after a failure. Once the screen is closed: one more attempt
    // with the newer changes, never a retry loop
    if (montadoRef.current) programar(reintentar ? REINTENTO_MS : DEBOUNCE_MS)
    else if (!reintentar) guardarRef.current()
  }, [cId, programar, soloLectura])

  useEffect(() => {
    guardarRef.current = () => { void guardar() }
  }, [guardar])

  const actualizar = useCallback((receta: (b: PantallaEstado) => void) => {
    if (soloLectura) return
    const siguiente = structuredClone(estadoRef.current)
    receta(siguiente)
    estadoRef.current = siguiente
    setEstado(siguiente)
    pendienteRef.current = true
    if (!enConflictoRef.current) {
      setGuardado('pendiente')
      programar(DEBOUNCE_MS)
    }
  }, [programar, soloLectura])

  const resolverConflicto = useCallback((usar: 'servidor' | 'mia') => {
    if (!conflicto) return
    versionRef.current = conflicto.version
    enConflictoRef.current = false
    setConflicto(null)
    if (usar === 'servidor') {
      const doc = normalizarEstado(conflicto.state)
      estadoRef.current = doc
      setEstado(doc)
      pendienteRef.current = false
      setGuardado('guardado')
    } else {
      // Mine overwrites the stored one: saved on top of the version just read
      pendienteRef.current = true
      setGuardado('pendiente')
      guardarRef.current()
    }
  }, [conflicto])

  const reintentarGuardado = useCallback(() => {
    pendienteRef.current = true
    guardarRef.current()
  }, [])

  // Flush when the tablet hides the page (screen off, app switch) and when the screen is left; warn before closing with changes
  useEffect(() => {
    montadoRef.current = true
    const alOcultar = () => { if (document.visibilityState === 'hidden') guardarRef.current() }
    const antesDeSalir = (e: BeforeUnloadEvent) => {
      if (pendienteRef.current || enVueloRef.current) e.preventDefault()
    }
    document.addEventListener('visibilitychange', alOcultar)
    window.addEventListener('beforeunload', antesDeSalir)
    return () => {
      document.removeEventListener('visibilitychange', alOcultar)
      window.removeEventListener('beforeunload', antesDeSalir)
      window.clearTimeout(temporizadorRef.current)
      guardarRef.current()
      montadoRef.current = false
    }
  }, [])

  // The diary numbers the sessions of the log (same query and key as the Diario tab)
  const { data: diario } = useQuery({ queryKey: ['diary', cId], queryFn: () => diaryApi.getAll(cId) })
  const ultimoDiario = diario?.length ? Math.max(...diario.map((d) => d.number)) : null

  const anotar = useCallback(
    (ev: { tipo: TipoEvento; texto: string; etiqueta?: string }) => actualizar((b) => anotarEn(b, ev, ultimoDiario)),
    [actualizar, ultimoDiario],
  )

  const valor = useMemo<PantallaCtx>(
    () => ({ cId, estado, actualizar, anotar, ultimoDiario, guardado, conflicto, resolverConflicto, rechazo, soloLectura, reintentarGuardado }),
    [cId, estado, actualizar, anotar, ultimoDiario, guardado, conflicto, resolverConflicto, rechazo, soloLectura, reintentarGuardado],
  )

  return <PantallaContext.Provider value={valor}>{children}</PantallaContext.Provider>
}
