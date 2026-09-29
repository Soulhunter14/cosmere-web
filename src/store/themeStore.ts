import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 'system' follows prefers-color-scheme. index.html applies the stored choice before first paint. */
export type ThemeMode = 'system' | 'light' | 'dark'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

const THEME_BG = { light: '#e8ecf1', dark: '#0a0e15' } as const

function systemPrefersLight() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches
}

/** Applies the mode to <html data-theme> and keeps the browser/PWA chrome colour in sync. */
export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement
  if (mode === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', mode)
  const effective = mode === 'system' ? (systemPrefersLight() ? 'light' : 'dark') : mode
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    if (mode === 'system') {
      const media = m.getAttribute('media') ?? ''
      m.setAttribute('content', media.includes('light') ? THEME_BG.light : THEME_BG.dark)
    } else {
      m.setAttribute('content', THEME_BG[effective])
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
