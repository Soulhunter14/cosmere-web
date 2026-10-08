import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import { useQuery } from '@tanstack/react-query'
import { gmScreenApi } from '../../api/gmScreen'
import { diaryApi } from '../../api/diary'
import type { GmScreen } from '../../types'
import { anotar as anotarEn, normalizarEstado, type PantallaEstado, type TipoEvento } from './estado'
import { PantallaContext, type EstadoGuardado, type PantallaCtx } from './contexto'

/** Quiet time after the last change before saving */
const DEBOUNCE_MS = 800
/** Retry after a failed save (no connection, server down) */
const REINTENTO_MS = 5000

/**
 * Holds the screen document and saves it by itself: every change marks it pending and a save goes out 0.8 s after the last one,
 * with the version it read. A 409 means another device saved first: nothing is overwritten until the director chooses
 * (`resolverConflicto`). Pending changes are also flushed when the page is hidden and when the screen is left.
 */
export function PantallaProvider({ cId, inicial, children }: { cId: number; inicial: GmScreen; children: ReactNode }) {
  const [estado, setEstado] = useState<PantallaEstado>(() => normalizarEstado(inicial.state))
  const [guardado, setGuardado] = useState<EstadoGuardado>('guardado')
  const [conflicto, setConflicto] = useState<GmScreen | null>(null)

  // The save loop lives in refs: the latest document, the version read, and whether something is pending or in flight
  const estadoRef = useRef(estado)
  const versionRef = useRef(inicial.version)
  const pendienteRef = useRef(false)
  const enVueloRef = useRef(false)
  const enConflictoRef = useRef(false)
  const temporizadorRef = useRef<number | undefined>(undefined)
  const guardarRef = useRef<() => void>(() => {})

  const programar = useCallback((ms: number) => {
    window.clearTimeout(temporizadorRef.current)
    temporizadorRef.current = window.setTimeout(() => guardarRef.current(), ms)
  }, [])

  const guardar = useCallback(async () => {
    window.clearTimeout(temporizadorRef.current)
    if (enVueloRef.current || enConflictoRef.current || !pendienteRef.current) return
    enVueloRef.current = true
    pendienteRef.current = false
    setGuardado('guardando')
    let fallo = false
    try {
      const r = await gmScreenApi.save(cId, { state: estadoRef.current, version: versionRef.current })
      versionRef.current = r.version
      setGuardado(pendienteRef.current ? 'pendiente' : 'guardado')
    } catch (e) {
      pendienteRef.current = true
      if (isAxiosError(e) && e.response?.status === 409 && e.response.data) {
        enConflictoRef.current = true
        setConflicto(e.response.data as GmScreen)
        setGuardado('conflicto')
      } else {
        fallo = true
        setGuardado('error')
      }
    } finally {
      enVueloRef.current = false
    }
    // Changes made while the request was in flight, or a retry after a failure
    if (pendienteRef.current && !enConflictoRef.current) programar(fallo ? REINTENTO_MS : DEBOUNCE_MS)
  }, [cId, programar])

  useEffect(() => {
    guardarRef.current = () => { void guardar() }
  }, [guardar])

  const actualizar = useCallback((receta: (b: PantallaEstado) => void) => {
    const siguiente = structuredClone(estadoRef.current)
    receta(siguiente)
    estadoRef.current = siguiente
    setEstado(siguiente)
    pendienteRef.current = true
    if (!enConflictoRef.current) {
      setGuardado('pendiente')
      programar(DEBOUNCE_MS)
    }
  }, [programar])

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

  // Flush when the tablet hides the page (screen off, app switch) and when the screen is left; warn before closing with changes
  useEffect(() => {
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
    () => ({ cId, estado, actualizar, anotar, ultimoDiario, guardado, conflicto, resolverConflicto }),
    [cId, estado, actualizar, anotar, ultimoDiario, guardado, conflicto, resolverConflicto],
  )

  return <PantallaContext.Provider value={valor}>{children}</PantallaContext.Provider>
}
