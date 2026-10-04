import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './store/themeStore' // rehydrates and applies the saved theme
import App from './App.tsx'

/*
 * Stale chunks after a deploy (spec §7.1 «Chunks perezosos y PWA», risk 20). Lazy chunks have hashed names and the
 * service worker (autoUpdate + skipWaiting + clientsClaim) replaces its precache on every deploy, so a tab that was
 * open during the deploy asks for a chunk that no longer exists and nginx answers with index.html (SPA fallback):
 * «Failed to fetch dynamically imported module». Vite reports it as `vite:preloadError`: reload ONCE to pick up the
 * new build. The flag outlives the reload, so a chunk that is really gone cannot loop; it is cleared below once the
 * reloaded app has stayed up, so the next deploy can reload again.
 */
const RELOAD_KEY = 'cosmere-reload-once'

window.addEventListener('vite:preloadError', (e) => {
  try {
    if (sessionStorage.getItem(RELOAD_KEY)) return // already reloaded once: let the import error surface
    sessionStorage.setItem(RELOAD_KEY, '1')
  } catch {
    return // storage blocked (private mode…): without the flag a reload could loop forever
  }
  e.preventDefault() // otherwise Vite rethrows the import error
  window.location.reload()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// First correct render: re-arm the reload guard. Not before a grace period: a lazy chunk requested by the first
// render fails after render() returns, and a flag cleared by then would reload in a loop.
window.setTimeout(() => {
  try {
    sessionStorage.removeItem(RELOAD_KEY)
  } catch {
    /* storage blocked: nothing to clear */
  }
}, 10_000)

// Service Worker registrado automáticamente por vite-plugin-pwa (registerType: 'autoUpdate')
// Al detectar una nueva versión, se activa en cuanto el usuario recarga o reabre la app.
