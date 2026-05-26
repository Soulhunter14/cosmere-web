import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',

      // No activar el SW en desarrollo
      devOptions: {
        enabled: false,
      },

      // Nombre del archivo manifest generado
      manifestFilename: 'manifest.json',

      workbox: {
        // Toma control inmediato de todos los clientes al activarse
        clientsClaim: true,
        skipWaiting: true,

        // SPA fallback: cualquier navegación que no sea un asset devuelve index.html
        navigateFallback: 'index.html',

        // Las llamadas a API y SignalR nunca pasan por el SW
        navigateFallbackDenylist: [/^\/api/, /^\/hubs/],

        runtimeCaching: [
          {
            // API y hubs: siempre red, nunca cache
            urlPattern: ({ url }) =>
              url.pathname.startsWith('/api') || url.pathname.startsWith('/hubs'),
            handler: 'NetworkOnly',
          },
        ],
      },

      // Manifest generado por el plugin (elimina la necesidad de public/manifest.json)
      manifest: {
        name: 'Cosmere RPG',
        short_name: 'Cosmere',
        description: 'Cosmere RPG Companion — gestiona campañas, personajes y sesiones',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#1e1e2e',
        theme_color: '#1e1e2e',
        lang: 'es',
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any',
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
        categories: ['games', 'utilities'],
      },
    }),
  ],

  server: {
    port: 5173,
    host: true,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5200',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/hubs': {
        target: 'http://localhost:5200',
        changeOrigin: true,
        ws: true,
      },
    },
  },
})
