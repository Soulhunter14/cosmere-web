import { useEffect, useState, useSyncExternalStore } from 'react'
import { Maximize2, Minimize2, Sun, SunDim } from 'lucide-react'
import { IconButton } from '../../components/ui'
import { tone } from '../../theme'
import { guardarPreferencia, leerPreferencia } from './contexto'

/* Buttons for a device left on the table: the director's tablet («Pantalla del director») and the players' phones («La mesa»). */

const esBool = (v: unknown): v is boolean => typeof v === 'boolean'

// ── Keep the screen on (Screen Wake Lock: needs https or localhost) ─────────

/** `clave`: the per-device preference that remembers the choice (one per screen) */
export function BotonEncendida({ clave = 'cosmere-pantalla-encendida' }: { clave?: string }) {
  const soportado = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const [activo, setActivo] = useState(() => leerPreferencia(clave, false, esBool))

  useEffect(() => {
    if (!soportado || !activo) return
    let centinela: WakeLockSentinel | null = null
    let cancelado = false
    const pedir = () => {
      navigator.wakeLock
        .request('screen')
        .then((s) => { if (cancelado) void s.release(); else centinela = s })
        .catch(() => {})
    }
    // The browser drops the lock whenever the page is hidden: ask again when it comes back
    const alVolver = () => { if (document.visibilityState === 'visible') pedir() }
    pedir()
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      cancelado = true
      document.removeEventListener('visibilitychange', alVolver)
      void centinela?.release().catch(() => {})
    }
  }, [soportado, activo])

  if (!soportado) return null
  const alternar = () => {
    setActivo(!activo)
    guardarPreferencia(clave, !activo)
  }
  return (
    <IconButton
      label={activo ? 'Pantalla siempre encendida (activado)' : 'Mantener la pantalla encendida'}
      aria-pressed={activo}
      variant="surface"
      size={40}
      onClick={alternar}
      style={activo ? { color: tone.heliodoro.fg, borderColor: tone.heliodoro.border, background: tone.heliodoro.bg } : undefined}
    >
      {activo ? <Sun size={18} aria-hidden /> : <SunDim size={18} aria-hidden />}
    </IconButton>
  )
}

// ── Fullscreen (and an orientation lock where the browser allows it) ────────

type DocWebkit = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void>; webkitFullscreenEnabled?: boolean }
type ElemWebkit = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
type Orientacion = ScreenOrientation & { lock?: (o: string) => Promise<void>; unlock?: () => void }

const suscribirCompleta = (cb: () => void) => {
  document.addEventListener('fullscreenchange', cb)
  document.addEventListener('webkitfullscreenchange', cb)
  return () => {
    document.removeEventListener('fullscreenchange', cb)
    document.removeEventListener('webkitfullscreenchange', cb)
  }
}
const enCompleta = () => !!(document.fullscreenElement || (document as DocWebkit).webkitFullscreenElement)

/** `orientacion`: locked while in fullscreen (the tablet sideways); null leaves the device as it is (a phone held upright) */
export function BotonPantallaCompleta({ orientacion = 'landscape' }: { orientacion?: 'landscape' | null }) {
  const doc = document as DocWebkit
  const soportado = !!(document.fullscreenEnabled || doc.webkitFullscreenEnabled)
  const activo = useSyncExternalStore(suscribirCompleta, enCompleta, () => false)
  // Fullscreen and the orientation lock belong to this screen: leaving it gives the rest of the app its normal window back
  useEffect(() => () => {
    (screen.orientation as Orientacion | undefined)?.unlock?.()
    if (enCompleta()) void (document.exitFullscreen ? document.exitFullscreen() : (document as DocWebkit).webkitExitFullscreen?.())?.catch(() => {})
  }, [])
  if (!soportado) return null

  const alternar = async () => {
    const pantalla = screen.orientation as Orientacion | undefined
    try {
      if (activo) {
        pantalla?.unlock?.()
        await (document.exitFullscreen ? document.exitFullscreen() : doc.webkitExitFullscreen?.())
      } else {
        const el = document.documentElement as ElemWebkit
        await (el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.())
        if (orientacion) await pantalla?.lock?.(orientacion).catch(() => {})
      }
    } catch {
      /* the browser refused (iframe, policy): nothing to do */
    }
  }

  return (
    <IconButton label={activo ? 'Salir de pantalla completa' : 'Pantalla completa'} aria-pressed={activo} variant="surface" size={40} onClick={() => void alternar()}>
      {activo ? <Minimize2 size={18} aria-hidden /> : <Maximize2 size={18} aria-hidden />}
    </IconButton>
  )
}
