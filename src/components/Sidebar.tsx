import { useState } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Users, Sword, LogOut, ChevronLeft, Settings2, House, BookOpen, Globe, Bell } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCampaignStore } from '../store/campaignStore'
import { useAuthStore } from '../store/authStore'
import { notesApi } from '../api/notes'
import { cn } from '../lib/utils'

const navItems = [
  { to: 'home', label: 'Inicio', icon: House },
  { to: 'personajes', label: 'Personajes', icon: Users },
  { to: 'historia', label: 'Historia', icon: BookOpen },
  { to: 'encyclopedia', label: 'Mundo', icon: Globe },
]

const gmNavItems = [
  { to: 'gm', label: 'GM', icon: Sword },
]

const SECTION_LABELS: Record<string, string> = {
  home: 'Inicio',
  personajes: 'Personajes',
  historia: 'Historia',
  encyclopedia: 'Mundo',
  gm: 'GM',
  characters: 'Personajes',
  npcs: 'Personajes',
  matches: 'Combates',
  sessions: 'Historia',
  diario: 'Historia',
  sidequests: 'Misiones',
  catalog: 'Catálogo',
  settings: 'Ajustes',
}

const PARENT_SECTION: Record<string, string> = {
  catalog: 'encyclopedia',
  characters: 'personajes',
  npcs: 'personajes',
  sessions: 'historia',
  diario: 'historia',
  sidequests: 'gm',
  matches: 'gm',
}

export function Sidebar() {
  const { currentCampaign, isGm } = useCampaignStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const segments = location.pathname.split('/').filter(Boolean)
  const isDetailPage = segments.length >= 4
  const currentSection = segments[2]
  const campaignBase = segments.slice(0, 2).join('/')

  const handleBack = () => {
    if (isDetailPage) {
      navigate(`/${segments.slice(0, 3).join('/')}`)
    } else if (PARENT_SECTION[currentSection]) {
      navigate(`/${campaignBase}/${PARENT_SECTION[currentSection]}`)
    } else {
      navigate('/campaigns')
    }
  }

  const showBack = isDetailPage || !!PARENT_SECTION[currentSection]

  const backLabel = isDetailPage
    ? (SECTION_LABELS[currentSection] ?? 'Atrás')
    : SECTION_LABELS[PARENT_SECTION[currentSection]] ?? 'Atrás'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const initials = user?.displayName
    ? user.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const linkTo = (to: string) =>
    currentCampaign ? `/campaigns/${currentCampaign.id}/${to}` : '#'

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', currentCampaign?.id],
    queryFn: () => notesApi.getAll(currentCampaign!.id),
    enabled: !!currentCampaign && !isGm,
  })
  const unreadCount = notes.filter((n) => !n.isRead).length

  return (
    <>
      {/* ─── Desktop sidebar (≥1024px) ──────────────────────── */}
      <aside
        className="hidden lg:flex flex-col shrink-0"
        style={{
          width: 220,
          minHeight: '100vh',
          background: 'var(--surface-1)',
          borderRight: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        {/* Subtle top gradient accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, var(--brand-dark), var(--brand-light), transparent)',
          opacity: 0.6,
        }} />

        {/* Campaign block */}
        <div style={{ padding: '20px 14px 14px', borderBottom: '1px solid var(--border)' }}>
          {showBack && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 transition-colors group"
              style={{ color: 'var(--text-subtle)', fontSize: 11, marginBottom: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              <ChevronLeft size={10} className="transition-transform group-hover:-translate-x-0.5" />
              {backLabel}
            </button>
          )}

          <p style={{ fontSize: 13, fontWeight: 700, color: 'white', lineHeight: 1.3, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentCampaign?.name ?? 'Cosmere'}
          </p>

          {currentCampaign && (
            <span
              className="inline-flex items-center gap-1.5 font-bold rounded-full uppercase tracking-wider"
              style={
                isGm
                  ? { fontSize: 10, padding: '3px 10px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.35)', color: '#f87171' }
                  : { fontSize: 9, padding: '2px 9px', background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--brand-light)' }
              }
            >
              <span style={{
                width: 5, height: 5, borderRadius: '50%', flexShrink: 0,
                background: isGm ? '#f87171' : 'var(--brand-light)',
                boxShadow: isGm ? '0 0 6px #f87171' : '0 0 6px var(--brand-light)',
              }} />
              {isGm ? 'Game Master' : 'Jugador'}
            </span>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={linkTo(to)}
              className={({ isActive }) =>
                cn('flex items-center gap-2.5 rounded-lg text-[13px] transition-all duration-150', isActive ? 'font-semibold' : 'font-medium')
              }
              style={({ isActive }) => isActive
                ? {
                    padding: '8px 10px',
                    background: 'rgba(180,190,254,0.08)',
                    border: '1px solid rgba(180,190,254,0.14)',
                    color: 'var(--brand-light)',
                    boxShadow: 'inset 3px 0 0 var(--brand-light)',
                  }
                : {
                    padding: '8px 10px',
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                  }
              }
              onMouseEnter={(e) => {
                if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text)'
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                  e.currentTarget.style.background = ''
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <Icon size={14} />
              {label}
            </NavLink>
          ))}

          {isGm && (
            <>
              <div style={{ margin: '10px 4px 6px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(239,68,68,0.18)' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(248,113,113,0.7)', letterSpacing: '0.12em' }}>GM</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(239,68,68,0.18)' }} />
              </div>
              {gmNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={linkTo(to)}
                  className={({ isActive }) =>
                    cn('flex items-center gap-2.5 rounded-lg text-[13px] transition-all duration-150', isActive ? 'font-semibold' : 'font-medium')
                  }
                  style={({ isActive }) => isActive
                    ? {
                        padding: '8px 10px',
                        background: 'rgba(239,68,68,0.08)',
                        border: '1px solid rgba(239,68,68,0.22)',
                        color: '#f87171',
                        boxShadow: 'inset 3px 0 0 #f87171',
                      }
                    : {
                        padding: '8px 10px',
                        color: 'var(--text-muted)',
                        border: '1px solid transparent',
                      }
                  }
                  onMouseEnter={(e) => {
                    if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                      e.currentTarget.style.background = 'rgba(239,68,68,0.05)'
                      e.currentTarget.style.color = '#fca5a5'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget.getAttribute('aria-current') !== 'page') {
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
          <div style={{ padding: '6px 8px', borderTop: '1px solid var(--border)' }}>
            <NavLink
              to={`/campaigns/${currentCampaign.id}/settings`}
              className={({ isActive }) =>
                cn('flex items-center gap-2.5 rounded-lg text-[13px] font-medium transition-all duration-150', isActive ? '' : '')
              }
              style={({ isActive }) => isActive
                ? {
                    padding: '8px 10px',
                    background: 'rgba(180,190,254,0.08)',
                    border: '1px solid rgba(180,190,254,0.14)',
                    color: 'var(--brand-light)',
                    boxShadow: 'inset 3px 0 0 var(--brand-light)',
                  }
                : {
                    padding: '8px 10px',
                    color: 'var(--text-muted)',
                    border: '1px solid transparent',
                  }
              }
              onMouseEnter={(e) => {
                if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.color = 'var(--text)'
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                  e.currentTarget.style.background = ''
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
            >
              <Settings2 size={14} />
              Ajustes
            </NavLink>
          </div>
        )}

        {/* User footer */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
              <div
                className="flex items-center justify-center text-white font-bold shrink-0 bg-gradient-to-br from-violet-500 to-indigo-600"
                style={{ width: 28, height: 28, borderRadius: '50%', fontSize: 10, border: '1.5px solid rgba(180,190,254,0.25)' }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.displayName}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{ padding: 6, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-subtle)', flexShrink: 0, display: 'flex', alignItems: 'center' }}
              title="Cerrar sesión"
              onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Tablet sidebar (640px–1023px) ──────────────────── */}
      <aside
        className="hidden sm:flex lg:hidden flex-col shrink-0 items-center"
        style={{
          width: 64,
          minHeight: '100vh',
          background: 'var(--surface-1)',
          borderRight: '1px solid var(--border)',
          position: 'relative',
        }}
      >
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: 'linear-gradient(90deg, var(--brand-dark), var(--brand-light))',
          opacity: 0.6,
        }} />

        {/* Role dot */}
        <div style={{ paddingTop: 20, paddingBottom: 14, display: 'flex', justifyContent: 'center', width: '100%', borderBottom: '1px solid var(--border)' }}>
          <div
            title={isGm ? 'Game Master' : 'Jugador'}
            style={{
              width: 10, height: 10, borderRadius: '50%',
              background: isGm ? '#f87171' : 'var(--brand-light)',
              boxShadow: isGm ? '0 0 8px #f87171' : '0 0 8px var(--brand-light)',
            }}
          />
        </div>

        {/* Nav icons */}
        <nav style={{ flex: 1, padding: '10px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={linkTo(to)}
              title={label}
              style={({ isActive }) => ({
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '10px 0',
                width: '100%',
                position: 'relative',
                textDecoration: 'none',
                color: isActive ? 'var(--brand-light)' : 'var(--text-subtle)',
                transition: 'color 0.15s',
              })}
              onMouseEnter={(e) => {
                if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                  e.currentTarget.style.color = 'var(--text-subtle)'
                }
              }}
            >
              {({ isActive }) => (
                <>
                  {/* Active left bar */}
                  {isActive && (
                    <div style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 24, borderRadius: '0 3px 3px 0',
                      background: 'var(--brand-light)',
                      boxShadow: '0 0 8px var(--brand-light)',
                    }} />
                  )}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 36, height: 32, borderRadius: 8,
                    background: isActive ? 'rgba(180,190,254,0.1)' : 'transparent',
                    transition: 'background 0.15s',
                  }}>
                    <Icon size={16} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1 }}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}

          {isGm && (
            <>
              <div style={{ width: 28, height: 1, background: 'rgba(239,68,68,0.2)', margin: '4px 0' }} />
              {gmNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={linkTo(to)}
                  title={label}
                  style={({ isActive }) => ({
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                    padding: '10px 0',
                    width: '100%',
                    position: 'relative',
                    textDecoration: 'none',
                    color: isActive ? '#f87171' : 'rgba(248,113,113,0.45)',
                    transition: 'color 0.15s',
                  })}
                  onMouseEnter={(e) => {
                    if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                      e.currentTarget.style.color = '#fca5a5'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                      e.currentTarget.style.color = 'rgba(248,113,113,0.45)'
                    }
                  }}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div style={{
                          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                          width: 3, height: 24, borderRadius: '0 3px 3px 0',
                          background: '#f87171',
                          boxShadow: '0 0 8px #f87171',
                        }} />
                      )}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 36, height: 32, borderRadius: 8,
                        background: isActive ? 'rgba(239,68,68,0.1)' : 'transparent',
                        transition: 'background 0.15s',
                      }}>
                        <Icon size={16} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.02em', lineHeight: 1 }}>
                        {label}
                      </span>
                    </>
                  )}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Settings icon */}
        {currentCampaign && (
          <div style={{ padding: '8px 0', borderTop: '1px solid var(--border)', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <NavLink
              to={`/campaigns/${currentCampaign.id}/settings`}
              title="Ajustes"
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 36, height: 32, borderRadius: 8,
                color: isActive ? 'var(--brand-light)' : 'var(--text-subtle)',
                background: isActive ? 'rgba(180,190,254,0.1)' : 'transparent',
                transition: 'color 0.15s, background 0.15s',
                textDecoration: 'none',
              })}
              onMouseEnter={(e) => {
                if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                  e.currentTarget.style.color = 'var(--text-muted)'
                }
              }}
              onMouseLeave={(e) => {
                if (e.currentTarget.getAttribute('aria-current') !== 'page') {
                  e.currentTarget.style.color = 'var(--text-subtle)'
                }
              }}
            >
              <Settings2 size={15} />
            </NavLink>
          </div>
        )}

        {/* User avatar button */}
        <div style={{ padding: '12px 0', borderTop: '1px solid var(--border)', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => setShowUserMenu(true)}
            title={user?.displayName}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div
              className="flex items-center justify-center text-white font-bold bg-gradient-to-br from-violet-500 to-indigo-600"
              style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 11, border: '2px solid rgba(180,190,254,0.25)' }}
            >
              {initials}
            </div>
          </button>
        </div>
      </aside>

      {/* ─── Mobile top bar (<640px) ────────────────────────── */}
      <div
        className="sm:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4"
        style={{
          height: 'calc(52px + var(--sat))',
          paddingTop: 'var(--sat)',
          background: 'rgba(30,30,46,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {currentCampaign ? (
          <span
            className="inline-flex items-center font-bold rounded-full uppercase tracking-wider"
            style={
              isGm
                ? { fontSize: 11, padding: '3px 10px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171' }
                : { fontSize: 9, padding: '2px 8px', background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--brand-light)' }
            }
          >
            {isGm ? 'GM' : 'Jugador'}
          </span>
        ) : <div />}

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {!isGm && currentCampaign && (
            <NavLink
              to={linkTo('historia')}
              style={{ position: 'relative', display: 'flex', alignItems: 'center', padding: '8px 6px' }}
            >
              <Bell
                size={18}
                style={{ color: unreadCount > 0 ? 'var(--brand-light)' : 'var(--text-subtle)', transition: 'color 0.15s' }}
              />
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute', top: 4, right: 2,
                  minWidth: 14, height: 14, borderRadius: 7,
                  background: 'var(--brand)', color: 'white',
                  fontSize: 8, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )}

          <button
            onClick={() => setShowUserMenu(true)}
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold bg-gradient-to-br from-violet-500 to-indigo-600"
              style={{ border: '2px solid rgba(180,190,254,0.3)' }}
            >
              {initials}
            </div>
          </button>
        </div>
      </div>

      {/* ─── User menu sheet (mobile + tablet) ──────────────── */}
      {showUserMenu && (
        <>
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={() => setShowUserMenu(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 z-50 rounded-t-2xl"
            style={{
              background: 'var(--surface-1)',
              border: '1px solid var(--border-bright)',
              borderBottom: 'none',
              paddingBottom: 'calc(16px + var(--sab))',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
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
            <div style={{ height: 1, background: 'var(--border)', margin: '0 20px 12px' }} />
            {currentCampaign && (
              <NavLink
                to={`/campaigns/${currentCampaign.id}/settings`}
                onClick={() => setShowUserMenu(false)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '12px 20px',
                  color: 'var(--text-muted)', fontSize: 14, fontWeight: 600,
                  textDecoration: 'none',
                }}
              >
                <Settings2 size={16} />
                Ajustes
              </NavLink>
            )}
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

      {/* ─── Mobile bottom nav (<640px) ─────────────────────── */}
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

        {isGm && (
          <NavLink
            to={linkTo('gm')}
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
                    width: 32, height: 28,
                    background: isActive ? 'rgba(239,68,68,0.12)' : 'transparent',
                  }}
                >
                  <Sword size={16} />
                </div>
                <span className="text-[9px] font-semibold leading-none" style={{ letterSpacing: '0.02em' }}>
                  GM
                </span>
              </>
            )}
          </NavLink>
        )}
      </nav>
    </>
  )
}
