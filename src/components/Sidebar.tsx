import { useState, type CSSProperties } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { Users, Sword, LogOut, ChevronLeft, Settings2, House, BookOpen, Globe, Bell, LayoutGrid } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useCampaignStore } from '../store/campaignStore'
import { useAuthStore } from '../store/authStore'
import { notesApi } from '../api/notes'
import { Avatar, IconButton, Sheet } from './ui'
import { BrandGlyph, BrandMark } from './BrandMark'
import { c, eyebrow, fs, pill, radius, semantic, titleText, tone, z } from '../theme'
import { ThemeSwitcher } from './ThemeSwitcher'

const SECTION_LABELS: Record<string, string> = {
  home: 'Inicio',
  personajes: 'Personajes',
  historia: 'Partida',
  encyclopedia: 'Enciclopedia',
  gm: 'Director',
  characters: 'Personajes',
  'global-npcs': 'NPCs',
  sessions: 'Partida',
  diario: 'Partida',
  catalog: 'Catálogo',
  settings: 'Ajustes',
}

const PARENT_SECTION: Record<string, string> = {
  catalog: 'encyclopedia',
  characters: 'personajes',
  sessions: 'historia',
  diario: 'historia',
  'global-npcs': 'gm',
}

export function Sidebar() {
  const { currentCampaign, isGm } = useCampaignStore()

  const navItems = isGm
    ? [
        { to: 'home', label: 'Inicio', icon: House },
        { to: 'historia', label: 'Partida', icon: BookOpen },
        { to: 'encyclopedia', label: 'Enciclopedia', icon: Globe },
      ]
    : [
        { to: 'home', label: 'Inicio', icon: House },
        { to: 'personajes', label: 'Personaje', icon: Users },
        { to: 'historia', label: 'Partida', icon: BookOpen },
        { to: 'encyclopedia', label: 'Enciclopedia', icon: Globe },
      ]

  const gmNavItems = [
    { to: 'personajes', label: 'Personajes', icon: Users },
    { to: 'gm', label: 'Director', icon: Sword },
  ]
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
      const parent = PARENT_SECTION[currentSection]
      navigate(`/${campaignBase}/${parent ?? currentSection}`)
    } else if (PARENT_SECTION[currentSection]) {
      navigate(`/${campaignBase}/${PARENT_SECTION[currentSection]}`)
    } else {
      navigate('/campaigns')
    }
  }

  const showBack = isDetailPage || !!PARENT_SECTION[currentSection]

  const resolveLabel = (key: string) => {
    if (!isGm && (key === 'personajes' || key === 'characters')) return 'Personaje'
    return SECTION_LABELS[key] ?? key
  }

  const backLabel = isDetailPage
    ? resolveLabel(currentSection)
    : resolveLabel(PARENT_SECTION[currentSection])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const linkTo = (to: string) =>
    currentCampaign ? `/campaigns/${currentCampaign.id}/${to}` : '#'

  const { data: notes = [] } = useQuery({
    queryKey: ['notes', currentCampaign?.id],
    queryFn: () => notesApi.getAll(currentCampaign!.id),
    enabled: !!currentCampaign && !isGm,
  })
  const unreadCount = notes.filter((n) => !n.isRead).length

  const roleTone = isGm ? semantic.gm : tone.brand
  const roleLabel = isGm ? 'Director de juego' : 'Jugador'

  return (
    <>
      {/* ─── Desktop sidebar (≥1024px) ──────────────────────── */}
      <aside
        className="only-desktop"
        aria-label="Navegación principal"
        style={{
          width: 248,
          flexDirection: 'column',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'color-mix(in srgb, var(--surface-1) 82%, transparent)',
          borderRight: `1px solid ${c.border}`,
        }}
      >
        {/* Brand */}
        <div style={{ padding: '22px 20px 18px' }}>
          <BrandMark size={28} subtitle="Compañero de mesa" />
        </div>

        {/* Campaign block */}
        <div style={{ padding: '0 12px 12px' }}>
          <div
            style={{
              padding: '14px 14px 14px',
              borderRadius: radius.md,
              background: 'linear-gradient(160deg, var(--surface-2), var(--surface-1))',
              border: `1px solid ${c.border}`,
            }}
          >
            {showBack && (
              <button
                type="button"
                onClick={handleBack}
                className="ui-icon-btn"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  color: c.muted, fontSize: fs.xs, fontWeight: 600,
                  marginBottom: 10, marginLeft: -6, padding: '4px 8px 4px 4px',
                  background: 'none', border: 'none', borderRadius: radius.xs, cursor: 'pointer',
                }}
              >
                <ChevronLeft size={14} aria-hidden />
                Volver a {backLabel}
              </button>
            )}
            <p style={{ ...eyebrow, marginBottom: 4 }}>Campaña</p>
            <p
              style={{
                ...titleText, fontSize: fs.lg, color: c.text, lineHeight: 1.25,
                marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}
              title={currentCampaign?.name}
            >
              {currentCampaign?.name ?? 'Cosmere'}
            </p>
            {currentCampaign && (
              <span style={pill(roleTone)}>
                <span aria-hidden style={{ width: 6, height: 6, borderRadius: '50%', background: roleTone.fg, boxShadow: `0 0 8px ${roleTone.fg}` }} />
                {roleLabel}
              </span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav aria-label="Secciones" style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={linkTo(to)} className="nav-link">
              <Icon size={18} aria-hidden />
              {label}
            </NavLink>
          ))}

          {isGm && (
            <>
              <div style={{ margin: '16px 4px 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ ...eyebrow, color: 'var(--rubi)' }}>Director</span>
                <div aria-hidden style={{ flex: 1, height: 1, background: 'var(--rubi-border)' }} />
              </div>
              {gmNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={linkTo(to)} className="nav-link nav-link--gm">
                  <Icon size={18} aria-hidden />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Settings */}
        {currentCampaign && (
          <div style={{ padding: '8px 12px' }}>
            <NavLink to={`/campaigns/${currentCampaign.id}/settings`} className="nav-link">
              <Settings2 size={18} aria-hidden />
              Ajustes
            </NavLink>
          </div>
        )}

        {/* Appearance */}
        <div style={{ padding: '4px 12px 12px' }}>
          <ThemeSwitcher size="sm" compact />
        </div>

        {/* User footer */}
        <div style={{ padding: '12px 16px 16px', borderTop: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
              <Avatar name={user?.displayName} size={34} tone={isGm ? 'rubi' : 'brand'} />
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: fs.sm, fontWeight: 650, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.displayName}
                </p>
                <p style={{ fontSize: fs.xs, color: c.subtle, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  @{user?.username}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <IconButton label="Volver a campañas" size={36} onClick={() => navigate('/campaigns')}>
                <LayoutGrid size={16} aria-hidden />
              </IconButton>
              <IconButton label="Cerrar sesión" size={36} variant="danger" onClick={handleLogout}>
                <LogOut size={16} aria-hidden />
              </IconButton>
            </div>
          </div>
        </div>
      </aside>

      {/* ─── Tablet rail (640px–1023px) ──────────────────── */}
      <aside
        className="only-tablet"
        aria-label="Navegación principal"
        style={{
          width: 80,
          flexDirection: 'column',
          alignItems: 'center',
          flexShrink: 0,
          height: '100vh',
          position: 'sticky',
          top: 0,
          background: 'color-mix(in srgb, var(--surface-1) 82%, transparent)',
          borderRight: `1px solid ${c.border}`,
        }}
      >
        <div style={{ padding: '18px 0 12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, width: '100%' }}>
          <BrandGlyph size={30} />
          {showBack && (
            <IconButton label={`Volver a ${backLabel}`} size={40} variant="surface" onClick={handleBack}>
              <ChevronLeft size={18} aria-hidden />
            </IconButton>
          )}
          {currentCampaign && (
            <span
              role="img"
              aria-label={roleLabel}
              title={roleLabel}
              style={{ width: 8, height: 8, borderRadius: '50%', background: roleTone.fg, boxShadow: `0 0 10px ${roleTone.fg}` }}
            />
          )}
        </div>

        <nav aria-label="Secciones" style={{ flex: 1, padding: '6px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: '100%', overflowY: 'auto' }}>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={linkTo(to)} className="rail-link">
              <span className="rail-icon"><Icon size={20} aria-hidden /></span>
              <span>{label}</span>
            </NavLink>
          ))}

          {isGm && (
            <>
              <div aria-hidden style={{ width: 32, height: 1, background: 'var(--rubi-border)', margin: '8px 0' }} />
              {gmNavItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={linkTo(to)} className="rail-link rail-link--gm">
                  <span className="rail-icon"><Icon size={20} aria-hidden /></span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {currentCampaign && (
          <div style={{ padding: '6px 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <NavLink to={`/campaigns/${currentCampaign.id}/settings`} className="rail-link">
              <span className="rail-icon"><Settings2 size={20} aria-hidden /></span>
              <span>Ajustes</span>
            </NavLink>
          </div>
        )}

        <div style={{ padding: '12px 0 16px', borderTop: `1px solid ${c.border}`, width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setShowUserMenu(true)}
            aria-label={`Menú de usuario: ${user?.displayName ?? ''}`}
            aria-haspopup="dialog"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: '50%' }}
          >
            <Avatar name={user?.displayName} size={36} tone={isGm ? 'rubi' : 'brand'} />
          </button>
        </div>
      </aside>

      {/* ─── Mobile top bar (<640px) ────────────────────────── */}
      <header
        className="only-mobile glass"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: z.nav,
          height: 'calc(var(--topbar-h) + var(--sat))',
          paddingTop: 'var(--sat)',
          paddingLeft: 'calc(8px + var(--sal))',
          paddingRight: 'calc(8px + var(--sar))',
          alignItems: 'center', justifyContent: 'space-between', gap: 8,
          borderBottom: `1px solid ${c.border}`,
        }}
      >
        {showBack ? (
          <button
            type="button"
            onClick={handleBack}
            className="ui-icon-btn"
            style={{
              display: 'flex', alignItems: 'center', gap: 2, minHeight: 44, padding: '0 12px 0 4px',
              background: 'none', border: 'none', borderRadius: radius.sm, cursor: 'pointer',
              color: c.text, fontSize: fs.base, fontWeight: 600,
            }}
          >
            <ChevronLeft size={22} aria-hidden />
            {backLabel}
          </button>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, paddingLeft: 6 }}>
            <BrandGlyph size={24} />
            <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  ...titleText, fontSize: fs.md, color: c.text, lineHeight: 1.2,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}
              >
                {currentCampaign?.name ?? 'Cosmere'}
              </span>
              {currentCampaign && (
                <span style={{ fontSize: fs.eyebrow, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: roleTone.fg, lineHeight: 1.4 }}>
                  {isGm ? 'Director' : 'Jugador'}
                </span>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexShrink: 0 }}>
          {!isGm && currentCampaign && (
            <NavLink
              to={linkTo('historia')}
              aria-label={unreadCount > 0 ? `Mensajes: ${unreadCount} sin leer` : 'Mensajes'}
              className="ui-icon-btn"
              style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: radius.sm }}
            >
              <Bell size={20} aria-hidden style={{ color: unreadCount > 0 ? c.brandLight : c.muted }} />
              {unreadCount > 0 && (
                <span
                  aria-hidden
                  style={{
                    position: 'absolute', top: 6, right: 5,
                    minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
                    background: c.brandFill, color: c.onBrand,
                    fontSize: 11, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 0 2px var(--bg)',
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </NavLink>
          )}

          <button
            type="button"
            onClick={() => setShowUserMenu(true)}
            aria-label={`Menú de usuario: ${user?.displayName ?? ''}`}
            aria-haspopup="dialog"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, background: 'none', border: 'none', cursor: 'pointer', borderRadius: '50%' }}
          >
            <Avatar name={user?.displayName} size={34} tone={isGm ? 'rubi' : 'brand'} />
          </button>
        </div>
      </header>

      {/* ─── User menu sheet (mobile + tablet) ──────────────── */}
      <Sheet open={showUserMenu} onClose={() => setShowUserMenu(false)} title="Tu cuenta" hideHeader maxWidth={440}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0 16px' }}>
          <Avatar name={user?.displayName} size={48} tone={isGm ? 'rubi' : 'brand'} />
          <div style={{ minWidth: 0 }}>
            <p style={{ ...titleText, fontSize: fs.lg, color: c.text }}>{user?.displayName}</p>
            <p style={{ fontSize: fs.sm, color: c.subtle }}>@{user?.username}</p>
          </div>
        </div>
        <div aria-hidden className="hairline" style={{ marginBottom: 14 }} />
        <p style={{ ...eyebrow, marginBottom: 8 }}>Apariencia</p>
        <ThemeSwitcher />
        <div aria-hidden className="hairline" style={{ margin: '16px 0 8px' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentCampaign && (
            <NavLink
              to={`/campaigns/${currentCampaign.id}/settings`}
              onClick={() => setShowUserMenu(false)}
              className="ui-row"
              style={menuRow}
            >
              <Settings2 size={20} aria-hidden />
              Ajustes
            </NavLink>
          )}
          <button
            type="button"
            onClick={() => { setShowUserMenu(false); navigate('/campaigns') }}
            className="ui-row"
            style={{ ...menuRow, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}
          >
            <LayoutGrid size={20} aria-hidden />
            Volver a campañas
          </button>
          <button
            type="button"
            onClick={() => { handleLogout(); setShowUserMenu(false) }}
            className="ui-row"
            style={{ ...menuRow, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', color: 'var(--rubi)' }}
          >
            <LogOut size={20} aria-hidden />
            Cerrar sesión
          </button>
        </div>
      </Sheet>

      {/* ─── Mobile bottom nav (<640px) ─────────────────────── */}
      <nav
        aria-label="Secciones"
        className="only-mobile glass"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: z.nav,
          height: 'calc(var(--bottomnav-h) + var(--sab))',
          paddingBottom: 'var(--sab)',
          paddingLeft: 'calc(4px + var(--sal))',
          paddingRight: 'calc(4px + var(--sar))',
          alignItems: 'center', justifyContent: 'space-around',
          borderTop: `1px solid ${c.border}`,
        }}
      >
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={linkTo(to)} className="tab-link">
            <span className="tab-icon"><Icon size={20} aria-hidden /></span>
            <span>{label}</span>
          </NavLink>
        ))}

        {isGm && gmNavItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={linkTo(to)} className="tab-link tab-link--gm">
            <span className="tab-icon"><Icon size={20} aria-hidden /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  )
}

const menuRow: CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 14,
  minHeight: 52, padding: '0 12px', borderRadius: radius.md,
  color: c.text, fontSize: fs.base, fontWeight: 600,
  textDecoration: 'none',
}
