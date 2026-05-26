import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Service Worker registrado automáticamente por vite-plugin-pwa (registerType: 'autoUpdate')
// Al detectar una nueva versión, se activa en cuanto el usuario recarga o reabre la app.
