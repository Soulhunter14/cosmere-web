import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Users, Sword, Shield, ScrollText, Library, LogOut, ChevronLeft, Settings2, BookMarked, CalendarDays } from 'lucide-react'
import { useCampaignStore } from '../store/campaignStore'
import { useAuthStore } from '../store/authStore'
import { cn } from '../lib/utils'

const navItems = [
  { to: 'characters', label: 'Personajes', icon: Users },
  { to: 'npcs', label: 'NPCs', icon: Shield },
  { to: 'sessions', label: 'Calendario', icon: CalendarDays },
  { to: 'diario', label: 'Diario', icon: BookMarked },
  { to: 'encyclopedia', label: 'Enciclopedia', icon: Library },
]

const gmNavItems = [
  { to: 'sidequests', label: 'Misiones', icon: ScrollText },
  { to: 'matches', label: 'Combates', icon: Sword },
]

const SECTION_LABELS: Record<string, string> = {
  characters: 'Personajes',
  npcs: 'NPCs',
  matches: 'Combates',
  sessions: 'Calendario',
  diario: 'Diario',
  sidequests: 'Misiones',
  catalog: 'Catálogo',
  encyclopedia: 'Enciclopedia',
  settings: 'Ajustes',
}

// Sections that should go back to a parent section instead of the campaign root
const PARENT_SECTION: Record<string, string> = {
  catalog: 'encyclopedia',
}

export function Sidebar() {
  const { currentCampaign, isGm } = useCampaignStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  // /campaigns/:id/:section/:detailId  → detail page (4 segments)
  // /campaigns/:id/:section            → list page   (3 segments)
  const segments = location.pathname.split('/').filter(Boolean)
  const isDetailPage = segments.length >= 4
  const currentSection = segments[2] // e.g. 'characters', 'npcs', …

  const campaignBase = segments.slice(0, 2).join('/') // campaigns/:id

  const handleBack = () => {
    if (isDetailPage) {
      navigate(`/${segments.slice(0, 3).join('/')}`)
    } else if (PARENT_SECTION[currentSection]) {
      navigate(`/${campaignBase}/${PARENT_SECTION[currentSection]}`)
    } else {
      navigate('/campaigns')
    }
  }

  const backLabel = isDetailPage
    ? (SECTION_LABELS[currentSection] ?? 'Atrás')
    : PARENT_SECTION[currentSection]
      ? (SECTION_LABELS[PARENT_SECTION[currentSection]] ?? 'Atrás')
      : 'Campañas'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const linkTo = (to: string) =>
    currentCampaign ? `/campaigns/${currentCampaign.id}/${to}` : '#'

  return (
    <>
      {/* ─── Desktop sidebar ────────────────────────────────── */}
      <aside
        className="hidden sm:flex flex-col shrink-0"
        style={{
          width: 200,
          minHeight: '100vh',
          background: 'var(--surface-1)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Campaign block */}
        <div className="px-3 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[11px] mb-3 transition-colors group"
            style={{ color: 'var(--text-subtle)' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
          >
            <ChevronLeft size={10} className="transition-transform group-hover:-translate-x-0.5" />
            {backLabel}
          </button>

          <p className="text-[13px] font-semibold text-white leading-tight truncate mb-1.5">
            {currentCampaign?.name ?? 'Cosmere'}
          </p>

          {currentCampaign && (
            <span
              className="inline-flex items-center gap-1 font-bold rounded-full uppercase tracking-wider"
              style={
                isGm
                  ? { fontSize: 10, padding: '3px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
                  : { fontSize: 9, padding: '2px 8px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--brand-light)' }
              }
            >
              <span style={{
                width: isGm ? 5 : 4, height: isGm ? 5 : 4, borderRadius: '50%', flexShrink: 0,
                background: isGm ? '#f87171' : 'var(--brand-light)',
              }} />
              {isGm ? 'Game Master' : 'Jugador'}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={linkTo(to)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150',
                  isActive ? 'text-[var(--brand-light)] font-semibold' : 'font-medium'
                )
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'rgba(180,190,254,0.08)', border: '1px solid rgba(180,190,254,0.15)' }
                  : { color: 'var(--text-muted)', border: '1px solid transparent' }
              }
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('text-[var(--brand-light)]')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text)'
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.classList.contains('text-[var(--brand-light)]')) {
                  e.currentTarget.style.background = ''
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}

          {/* GM-only section */}
          {isGm && (
            <>
              <div style={{ margin: '8px 4px 4px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(239,68,68,0.2)' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: '#f87171', letterSpacing: '0.1em' }}>GM</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(239,68,68,0.2)' }} />
              </div>
              {gmNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={linkTo(to)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150',
                      isActive ? 'font-semibold' : 'font-medium'
                    )
                  }
                  style={({ isActive }) =>
                    isActive
                      ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
                      : { color: 'var(--text-muted)', border: '1px solid transparent' }
                  }
                  onMouseEnter={(e) => {
                    const active = e.currentTarget.style.color === 'rgb(248, 113, 113)'
                    if (!active) {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.06)'
                      e.currentTarget.style.color = '#fca5a5'
                    }
                  }}
                  onMouseLeave={(e) => {
                    const active = e.currentTarget.getAttribute('aria-current') === 'page'
                    if (!active) {
                      e.currentTarget.style.background = ''
                      e.currentTarget.style.color = 'var(--text-muted)'
                    }
                  }}
                >
                  <Icon size={14} />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Settings */}
        {currentCampaign && (
          <div className="px-2 pb-1.5" style={{ borderTop: '1px solid var(--border)', paddingTop: '0.375rem' }}>
            <NavLink
              to={`/campaigns/${currentCampaign.id}/settings`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                  isActive ? 'text-[var(--brand-light)]' : ''
                )
              }
              style={({ isActive }) =>
                isActive
                  ? { background: 'rgba(180,190,254,0.08)', border: '1px solid rgba(180,190,254,0.15)' }
                  : { color: 'var(--text-muted)', border: '1px solid transparent' }
              }
            >
              <Settings2 size={14} />
              Ajustes
            </NavLink>
          </div>
        )}

        {/* User footer */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 bg-gradient-to-br from-violet-500 to-indigo-600">
                {initials}
              </div>
              <span className="text-[12px] truncate font-medium" style={{ color: 'var(--text-muted)' }}>
                {user?.displayName}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 rounded-md transition-colors shrink-0"
              title="Cerrar sesión"
              style={{ color: 'var(--text-subtle)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile top bar ─────────────────────────────────── */}
      <div
        className="sm:hidden fixed top-0 left-0 right-0 z-40 flex items-end justify-between px-4"
        style={{
          height: 'calc(52px + var(--sat))',
          paddingBottom: 10,
          background: 'rgba(30,30,46,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <button
          onClick={handleBack}
          className="flex items-center gap-1.5 text-[13px] font-medium"
          style={{
            color: 'var(--text-subtle)',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 8px 8px 0',
          }}
        >
          <ChevronLeft size={16} />
          <span className="truncate max-w-[140px]">
            {backLabel}
          </span>
        </button>

        {/* Right side: GM badge + avatar — whole area is one tap target */}
        <button
          onClick={() => setShowUserMenu(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 0 8px 8px',
          }}
        >
          {currentCampaign && (
            <span
              className="inline-flex items-center font-bold rounded-full uppercase tracking-wider"
              style={
                isGm
                  ? { fontSize: 11, padding: '3px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
                  : { fontSize: 9, padding: '2px 8px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--brand-light)' }
              }
            >
              {isGm ? 'GM' : 'Player'}
            </span>
          )}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-br from-violet-500 to-indigo-600"
            style={{ border: '2px solid rgba(180,190,254,0.3)' }}
          >
            {initials}
          </div>
        </button>
      </div>

      {/* ─── Mobile user menu sheet ──────────────────────────── */}
      {showUserMenu && (
        <>
          {/* Backdrop */}
          <div
            className="sm:hidden fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowUserMenu(false)}
          />
          {/* Sheet */}
          <div
            className="sm:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-bright)',
              borderBottom: 'none',
              paddingBottom: 'calc(16px + var(--sab))',
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
            {/* User info */}
            <div style={{ padding: '8px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br from-violet-500 to-indigo-600"
                style={{ flexShrink: 0 }}
              >
                {initials}
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{user?.displayName}</p>
                <p style={{ fontSize: 12, color: 'var(--text-subtle)' }}>@{user?.username}</p>
              </div>
            </div>
            {/* Divider */}
            <div style={{ height: 1, background: 'var(--border)', margin: '0 20px 12px' }} />
            {/* Logout */}
            <button
              onClick={() => { handleLogout(); setShowUserMenu(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                width: '100%', padding: '12px 20px',
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fb7185', fontSize: 14, fontWeight: 600,
                textAlign: 'left',
              }}
            >
              <LogOut size={16} />
              Cerrar sesión
            </button>
          </div>
        </>
      )}

      {/* ─── Mobile GM bottom bar ───────────────────────────── */}
      {isGm && (
        <nav
          className="sm:hidden fixed left-0 right-0 z-39 flex items-start justify-around px-2"
          style={{
            bottom: 'calc(60px + var(--sab, 0px))',
            height: 52,
            paddingTop: 6,
            background: 'rgba(30,18,18,0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(239,68,68,0.25)',
          }}
        >
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(239,68,68,0.4), transparent)',
          }} />
          <span style={{
            position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
            fontSize: 8, fontWeight: 800, color: '#f87171', letterSpacing: '0.12em',
            background: 'rgba(30,18,18,0.95)', padding: '1px 8px', borderRadius: 20,
            border: '1px solid rgba(239,68,68,0.3)',
          }}>GM</span>
          {gmNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={linkTo(to)}
              className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-all duration-150"
              style={({ isActive }) => ({
                color: isActive ? '#f87171' : 'rgba(248,113,113,0.5)',
              })}
            >
              {({ isActive }) => (
                <>
                  <div
                    className="flex items-center justify-center rounded-lg transition-all duration-150"
                    style={{
                      width: 32, height: 24,
                      background: isActive ? 'rgba(239,68,68,0.15)' : 'transparent',
                    }}
                  >
                    <Icon size={15} />
                  </div>
                  <span className="text-[9px] font-semibold leading-none" style={{ letterSpacing: '0.02em' }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}

      {/* ─── Mobile bottom nav ──────────────────────────────── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex items-start justify-around px-1"
        style={{
          height: 'calc(60px + var(--sab, 0px))',
          paddingTop: 8,
          background: 'rgba(30,30,46,0.92)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
        }}
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={linkTo(to)}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-all duration-150"
            style={({ isActive }) => ({
              color: isActive ? 'var(--brand-light)' : 'var(--text-subtle)',
            })}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex items-center justify-center rounded-lg transition-all duration-150"
                  style={{
                    width: 32, height: 28,
                    background: isActive ? 'rgba(180,190,254,0.12)' : 'transparent',
                  }}
                >
                  <Icon size={16} />
                </div>
                <span className="text-[9px] font-semibold leading-none" style={{ letterSpacing: '0.02em' }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}

        {currentCampaign && (
          <NavLink
            to={`/campaigns/${currentCampaign.id}/settings`}
            className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-all duration-150"
            style={({ isActive }) => ({
              color: isActive ? 'var(--brand-light)' : 'var(--text-subtle)',
            })}
          >
            {({ isActive }) => (
              <>
                <div
                  className="flex items-center justify-center rounded-lg transition-all duration-150"
                  style={{
                    width: 32, height: 28,
                    background: isActive ? 'rgba(180,190,254,0.12)' : 'transparent',
                  }}
                >
                  <Settings2 size={16} />
                </div>
                <span className="text-[9px] font-semibold leading-none" style={{ letterSpacing: '0.02em' }}>
                  Ajustes
                </span>
              </>
            )}
          </NavLink>
        )}
      </nav>
    </>
  )
}
