import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { sinNiebla, type OrigenImagen } from '../mesa/publica'
import { usePantalla } from './contexto'
import { mostrarEnMesa } from './mesa'

/** A book portrait waiting for the director's answer: whole or under the fog (`PreguntaNieblaRetrato` asks, once per screen) */
export interface RetratoPendiente { imagen: OrigenImagen; titulo: string; pie: string }

let pendiente: RetratoPendiente | null = null
const oyentes = new Set<() => void>()
const fijarPendiente = (r: RetratoPendiente | null) => {
  pendiente = r
  oyentes.forEach((avisar) => avisar())
}
const suscribir = (avisar: () => void) => {
  oyentes.add(avisar)
  return () => { oyentes.delete(avisar) }
}

/**
 * «Mostrar a la mesa» from anywhere in the director's screen (a gallery, an adversary's portrait, the Mesa panel): one tap shows
 * the image on the players' phones; the caption can be added afterwards in the Mesa panel. Every image starts covered by the fog
 * and the director uncovers it from the Mesa panel; a book portrait asks first whether it goes whole or covered
 */
export function useMostrarEnMesa() {
  const { actualizar, ultimoDiario } = usePantalla()
  return useCallback(
    (imagen: OrigenImagen, titulo: string, pie = '') => {
      if (imagen.tipo === 'retrato') fijarPendiente({ imagen, titulo, pie })
      else actualizar((b) => { mostrarEnMesa(b, imagen, titulo, pie, ultimoDiario) })
    },
    [actualizar, ultimoDiario],
  )
}

/** The portrait waiting for an answer, and the answer: `conNiebla` shows it (covered or whole), `null` drops it */
export function useRetratoPendiente() {
  const { actualizar, ultimoDiario } = usePantalla()
  const retrato = useSyncExternalStore(suscribir, () => pendiente, () => null)
  // A portrait left waiting when the screen closes is dropped, not asked about on the next visit
  useEffect(() => () => fijarPendiente(null), [])
  const responder = useCallback(
    (conNiebla: boolean | null) => {
      const r = pendiente
      fijarPendiente(null)
      if (!r || conNiebla === null) return
      actualizar((b) => { mostrarEnMesa(b, r.imagen, r.titulo, r.pie, ultimoDiario, conNiebla ? {} : { niebla: sinNiebla() }) })
    },
    [actualizar, ultimoDiario],
  )
  return { retrato, responder }
}
