import { useCallback } from 'react'
import type { OrigenImagen } from '../mesa/publica'
import { usePantalla } from './contexto'
import { mostrarEnMesa, nieblaInicial } from './mesa'

/**
 * «Mostrar a la mesa» from anywhere in the director's screen (a gallery, an adversary's portrait, the Mesa panel): one tap shows
 * the image on the players' phones; the caption can be added afterwards in the Mesa panel. A map starts covered by the fog
 * (`mapa`, or a title «Mapa…»); the director uncovers it from the Mesa panel
 */
export function useMostrarEnMesa() {
  const { actualizar, ultimoDiario } = usePantalla()
  return useCallback(
    (imagen: OrigenImagen, titulo: string, pie = '', opciones: { mapa?: boolean } = {}) =>
      actualizar((b) => { mostrarEnMesa(b, imagen, titulo, pie, ultimoDiario, nieblaInicial(titulo, opciones.mapa)) }),
    [actualizar, ultimoDiario],
  )
}
