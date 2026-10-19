import { flushSync } from 'react-dom'

/* Scrolling between the scenes of the «Escena» panel (book, original book and session). */

/** Where a scene card starts in its pane while the navigation row is stuck above it (the cards' `scrollMarginTop`) */
export const BAJO_LA_BARRA = 76

/**
 * The scene cards are at least this tall (set by `irAEscena`), so a short scene can still sit under the stuck navigation row
 * instead of letting the pane scroll back to its top
 */
export const ALTO_MIN_ESCENA = 'var(--escena-alto-min, auto)'

/**
 * Moves to another scene (`cambiar`) without the navigation row jumping under the finger. Only the panel scrolls, never the page.
 * - From the fixed row or the index: if the row is stuck to the top, the new scene starts right under it; if the top of the panel
 *   is in sight, nothing moves.
 * - `alPrincipio` (the buttons at the bottom of a scene): the new scene is shown from its top, under the stuck row.
 */
export function irAEscena(ancla: string, cambiar: () => void, alPrincipio = false) {
  const tarjeta = document.getElementById(ancla)
  const panel = tarjeta?.closest<HTMLElement>('[role="tabpanel"]')
  if (!tarjeta || !panel) {
    cambiar()
    return
  }
  const arriba = tarjeta.getBoundingClientRect().top - panel.getBoundingClientRect().top
  if (arriba > BAJO_LA_BARRA + 1 && !alPrincipio) {
    cambiar()
    return
  }
  const abajo = parseFloat(getComputedStyle(panel).paddingBottom) || 0
  panel.style.setProperty('--escena-alto-min', `${Math.max(0, panel.clientHeight - BAJO_LA_BARRA - abajo)}px`)
  const top = panel.scrollTop + arriba - BAJO_LA_BARRA
  // The new scene is rendered and placed in the same frame: no frame at the old position
  flushSync(cambiar)
  panel.scrollTo({ top })
}
