import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types'

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        localStorage.setItem('token', token)
        set({ token, user, isAuthenticated: true })
      },
      logout: () => {
        localStorage.removeItem('token')
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    { name: 'cosmere-auth', partialize: (s) => ({ token: s.token, user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)

// Every tab shares localStorage: once another tab logs in as someone else (or logs out), this tab's requests already carry
// that token, so it reloads instead of mixing one user's screen with another's role (e.g. a player's tab showing the GM view)
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== 'cosmere-auth' && e.key !== null) return
    let otherId: number | null = null
    try {
      otherId = e.newValue ? (JSON.parse(e.newValue)?.state?.user?.id ?? null) : null
    } catch {
      otherId = null
    }
    if (otherId !== (useAuthStore.getState().user?.id ?? null)) window.location.reload()
  })
}
