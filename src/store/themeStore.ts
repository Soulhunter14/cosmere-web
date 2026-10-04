import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getWorld } from '../worlds'

/** 'system' follows prefers-color-scheme. index.html applies the stored choice before first paint. */
export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

function systemPrefersLight() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches
}

/**
 * Applies the mode to <html data-theme> and keeps the browser/PWA chrome colour (meta theme-color) in sync.
 * The colour comes from the world (`getWorld(world).tema.themeBg`); `world` is the `data-world` of <html>, which only
 * exists inside a campaign of a world that has its own theme. Without it, `getWorld(undefined)` resolves to the default
 * world, whose colours are the ones this store used to hold: nothing changes for a campaign without a theme of its own
 * or for the pages outside a campaign.
 */
export function applyTheme(mode: ThemeMode, world: string | undefined = document.documentElement.dataset.world) {
  const root = document.documentElement
  if (mode === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', mode)
  const bg = getWorld(world).tema.themeBg
  const effective = mode === 'system' ? (systemPrefersLight() ? 'light' : 'dark') : mode
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    if (mode === 'system') {
      const media = m.getAttribute('media') ?? ''
      m.setAttribute('content', media.includes('light') ? bg.light : bg.dark)
    } else {
      m.setAttribute('content', bg[effective])
    }
  })
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      setMode: (mode) => {
        applyTheme(mode)
        set({ mode })
      },
    }),
    {
      name: 'cosmere-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.mode)
      },
    },
  ),
)
