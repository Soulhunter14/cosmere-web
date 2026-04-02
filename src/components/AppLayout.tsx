import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppLayout() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg)' }}>
      <Sidebar />
      {/*
        sm:pt-0      — desktop has no top bar
        pt-[52px]    — mobile: clear the fixed top bar (52px)
        sm:pb-0      — desktop: no bottom nav
        pb-[60px]    — mobile: clear the fixed bottom nav (60px)
      */}
      <main className="app-main flex-1 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
