import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen, Check, ChevronLeft, CloudOff, Dices, Flag, LoaderCircle, Maximize2, Minimize2, NotebookPen, RefreshCw, Sun, SunDim, Swords,
  Timer, TriangleAlert, Users, type LucideIcon,
} from 'lucide-react'
import { gmScreenApi } from '../../api/gmScreen'
import type { DiceRollResponse } from '../../api/diceRolls'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import { Button, ErrorMessage, IconButton, Spinner, Tabs, type TabItem } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { CHAPTERS } from '../../data/caminapiedras'
import { buttonReset, c, fs, radius, titleText, tone, type Tone } from '../../theme'
import { PantallaProvider } from './PantallaProvider'
import {
  PanelesContext, duracion, guardarPreferencia, leerPreferencia, useAhora, usePaneles, usePantalla, type EstadoGuardado, type PanelId,
} from './contexto'
import { FASE_INFO, type PantallaEstado } from './estado'
import { hora } from './exportar'
import { PanelEscena } from './PanelEscena'
import { PanelEncuentro } from './PanelEncuentro'
import { PanelGrupo } from './PanelGrupo'
import { PanelTiradas } from './PanelTiradas'
import { PanelBitacora } from './PanelBitacora'
import { PanelAvances } from './PanelAvances'

const PANELES: Record<PanelId, { label: string; icon: LucideIcon; render: () => ReactNode }> = {
  escena: { label: 'Escena', icon: BookOpen, render: () => <PanelEscena /> },
  encuentro: { label: 'Encuentro', icon: Swords, render: () => <PanelEncuentro /> },
  grupo: { label: 'Grupo', icon: Users, render: () => <PanelGrupo /> },
  tiradas: { label: 'Tiradas', icon: Dices, render: () => <PanelTiradas /> },
  bitacora: { label: 'Bitácora', icon: NotebookPen, render: () => <PanelBitacora /> },
  avances: { label: 'Avances', icon: Flag, render: () => <PanelAvances /> },
}
/** Left pane: what is happening (story, fight, party); right pane: what comes in and what is noted */
const PANEL_A: PanelId[] = ['escena', 'encuentro', 'grupo']
const PANEL_B: PanelId[] = ['tiradas', 'bitacora', 'avances']
const TODOS: PanelId[] = [...PANEL_A, ...PANEL_B]

const esDe = (ids: PanelId[]) => (v: unknown): v is PanelId => typeof v === 'string' && ids.includes(v as PanelId)

/** Two panes on a landscape screen from 900 px (a tablet held sideways, a laptop); one pane otherwise */
const DOS_PANELES = '(min-width: 900px) and (orientation: landscape)'
const suscribirAncho = (cb: () => void) => {
  const m = window.matchMedia(DOS_PANELES)
  m.addEventListener('change', cb)
  return () => m.removeEventListener('change', cb)
}
const useDosPaneles = () => useSyncExternalStore(suscribirAncho, () => window.matchMedia(DOS_PANELES).matches, () => false)

// ── Route ────────────────────────────────────────────────────────────────────

export function PantallaPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const isGm = useCampaignStore((s) => s.isGm)

  // gcTime 0: every visit starts from the stored document, never from a cached copy older than the last save
  const { data, isError, refetch, isFetching } = useQuery({
    queryKey: ['gm-screen', cId],
    queryFn: () => gmScreenApi.get(cId),
    enabled: isGm,
    gcTime: 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  if (!isGm) return <Navigate to={`/campaigns/${cId}/home`} replace />
  if (isError && !data) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <ErrorMessage message="No se pudo cargar la pantalla del director." />
        <Button onClick={() => refetch()} loading={isFetching} icon={<RefreshCw size={15} aria-hidden />} style={{ alignSelf: 'flex-start' }}>
          Reintentar
        </Button>
      </div>
    )
  }
  if (!data) return <Spinner label="Cargando la pantalla del director…" />

  return (
    <PantallaProvider cId={cId} inicial={data}>
      <Pantalla />
    </PantallaProvider>
  )
}

// ── Layout ───────────────────────────────────────────────────────────────────

function Pantalla() {
  const { cId, conflicto, resolverConflicto } = usePantalla()
  const qc = useQueryClient()
  const dos = useDosPaneles()
  const [tabA, setTabA] = useState<PanelId>(() => leerPreferencia('cosmere-pantalla-a', 'escena', esDe(PANEL_A)))
  const [tabB, setTabB] = useState<PanelId>(() => leerPreferencia('cosmere-pantalla-b', 'tiradas', esDe(PANEL_B)))
  const [tabUnico, setTabUnico] = useState<PanelId>(() => leerPreferencia('cosmere-pantalla-unica', 'escena', esDe(TODOS)))
  const [nuevas, setNuevas] = useState(0)

  const tiradasVisibles = dos ? tabB === 'tiradas' : tabUnico === 'tiradas'
  const visiblesRef = useRef(tiradasVisibles)
  useEffect(() => { visiblesRef.current = tiradasVisibles }, [tiradasVisibles])

  const elegir = (panel: PanelId) => {
    if (panel === 'tiradas') setNuevas(0)
    if (dos) {
      if (PANEL_A.includes(panel)) { setTabA(panel); guardarPreferencia('cosmere-pantalla-a', panel) }
      else { setTabB(panel); guardarPreferencia('cosmere-pantalla-b', panel) }
    } else {
      setTabUnico(panel)
      guardarPreferencia('cosmere-pantalla-unica', panel)
    }
  }

  // Live rolls of the table: the DiceRoller (still mounted on this route) re-dispatches every SignalR roll as `diceRollReceived`.
  // They join the log query of the Tiradas panel, and count as new while that panel is not on screen.
  useEffect(() => {
    const recibir = (e: Event) => {
      const tirada = (e as CustomEvent<DiceRollResponse>).detail
      qc.setQueryData<DiceRollResponse[]>(['dice-rolls', cId], (prev) =>
        prev && !prev.some((r) => r.id === tirada.id) ? [...prev, tirada].slice(-100) : prev)
      if (!visiblesRef.current) setNuevas((n) => n + 1)
    }
    window.addEventListener('diceRollReceived', recibir)
    return () => window.removeEventListener('diceRollReceived', recibir)
  }, [cId, qc])

  const badge = tiradasVisibles ? 0 : nuevas

  return (
    <PanelesContext.Provider value={{ irA: elegir }}>
      <div
        style={{
          height: '100dvh', display: 'flex', flexDirection: 'column',
          paddingTop: 'var(--sat)', paddingBottom: 'var(--sab)', paddingLeft: 'var(--sal)', paddingRight: 'var(--sar)',
        }}
      >
        <BarraSuperior />
        {conflicto && (
          <div
            role="alert"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '8px 12px 0', padding: '10px 14px', borderRadius: radius.md,
              background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`, color: c.text, fontSize: fs.sm,
            }}
          >
            <TriangleAlert size={18} aria-hidden style={{ color: tone.topacio.fg, flexShrink: 0 }} />
            <span style={{ flex: '1 1 260px' }}>
              La pantalla se guardó desde otro dispositivo{conflicto.updatedAt ? ` a las ${hora(conflicto.updatedAt)}` : ''}. Tus últimos cambios aún no están guardados.
            </span>
            <Button size="sm" variant="secondary" onClick={() => resolverConflicto('servidor')}>Usar la versión guardada</Button>
            <Button size="sm" onClick={() => resolverConflicto('mia')}>Guardar la mía encima</Button>
          </div>
        )}
        <div
          style={{
            flex: 1, minHeight: 0, display: 'grid', gap: 12, padding: dos ? 12 : 8,
            gridTemplateColumns: dos ? 'minmax(0, 1.2fr) minmax(0, 1fr)' : 'minmax(0, 1fr)',
          }}
        >
          {dos ? (
            <>
              <Panel prefijo="pantalla-a" etiqueta="Mesa" ids={PANEL_A} valor={tabA} onCambiar={elegir} badge={badge} />
              <Panel prefijo="pantalla-b" etiqueta="Registro" ids={PANEL_B} valor={tabB} onCambiar={elegir} badge={badge} />
            </>
          ) : (
            <Panel prefijo="pantalla-u" etiqueta="Pantalla del director" ids={TODOS} valor={tabUnico} onCambiar={elegir} badge={badge} />
          )}
        </div>
      </div>
    </PanelesContext.Provider>
  )
}

/** A pane: its tab strip and one scroll area per panel. A panel stays mounted once opened, so its scroll and form keep their place */
function Panel({
  prefijo, etiqueta, ids, valor, onCambiar, badge,
}: { prefijo: string; etiqueta: string; ids: PanelId[]; valor: PanelId; onCambiar: (p: PanelId) => void; badge: number }) {
  const [abiertos, setAbiertos] = useState<PanelId[]>([valor])
  const cambiar = (p: PanelId) => {
    setAbiertos((l) => (l.includes(p) ? l : [...l, p]))
    onCambiar(p)
  }
  const tabs: TabItem<PanelId>[] = ids.map((id) => {
    const Icon = PANELES[id].icon
    const conBadge = id === 'tiradas' && badge > 0 ? badge : undefined
    return {
      id,
      label: PANELES[id].label,
      icon: <Icon size={16} aria-hidden />,
      badge: conBadge,
      ariaLabel: conBadge ? `${PANELES[id].label}, ${conBadge} tiradas nuevas` : undefined,
    }
  })
  return (
    <section
      aria-label={etiqueta}
      style={{
        minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        borderRadius: radius.lg, border: `1px solid ${c.border}`, background: 'color-mix(in srgb, var(--surface-1) 55%, transparent)',
      }}
    >
      <div style={{ padding: 8, borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
        <Tabs<PanelId> idPrefix={prefijo} ariaLabel={etiqueta} tabs={tabs} value={valor} onChange={cambiar} stretch size="sm" tone="rubi" />
      </div>
      {ids.filter((id) => id === valor || abiertos.includes(id)).map((id) => (
        <div
          key={id}
          role="tabpanel"
          id={`${prefijo}-panel-${id}`}
          aria-labelledby={`${prefijo}-tab-${id}`}
          hidden={id !== valor}
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', overscrollBehavior: 'contain', padding: '16px 16px 96px' }}
        >
          {PANELES[id].render()}
        </div>
      ))}
    </section>
  )
}

// ── Top bar ──────────────────────────────────────────────────────────────────

function tituloEscenaActual(estado: PantallaEstado): string | null {
  const ref = estado.escenaActual
  if (!ref) return null
  if (ref.origen === 'propia') return estado.escenasPropias.find((e) => e.id === ref.escenaId)?.titulo ?? null
  return CHAPTERS.find((ch) => ch.id === ref.capituloId)?.scenes.find((s) => s.id === ref.escenaId)?.title ?? null
}

function BarraSuperior() {
  const navigate = useNavigate()
  const { cId, estado, guardado, actualizar } = usePantalla()
  // The top bar sits inside the panes' provider: the chips open their panel
  const { irA } = usePaneles()
  const cfg = useWorldConfig()
  const campana = useCampaignStore((s) => s.currentCampaign)
  const ahora = useAhora()
  const escena = tituloEscenaActual(estado)
  const varios = estado.encuentros.length > 1
  const sesion = estado.sesion

  return (
    <header
      className="glass"
      style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 56, padding: '6px 12px', borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}
    >
      <Button variant="ghost" size="sm" icon={<ChevronLeft size={18} aria-hidden />} onClick={() => navigate(`/campaigns/${cId}/gm`)} style={{ paddingLeft: 6 }}>
        Director
      </Button>
      <CosmereIcon name={cfg.emblema} size={26} style={{ color: c.goldOrnament }} />
      <div style={{ minWidth: 0, flexShrink: 1 }} className="hide-mobile">
        <h1 style={{ ...titleText, fontSize: fs.md, color: c.text, whiteSpace: 'nowrap' }}>Pantalla del director</h1>
        <p style={{ fontSize: fs.xs, color: c.subtle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{campana?.name}</p>
      </div>
      <h1 className="only-mobile sr-only">Pantalla del director</h1>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', padding: '2px 0' }}>
        {escena && <Chip icono={BookOpen} t={tone.gold} onClick={() => irA('escena')} etiqueta={`Escena actual: ${escena}`}>{escena}</Chip>}
        {/* One chip per open fight: it brings that one on screen */}
        {estado.encuentros.map((enc) => (
          <Chip
            key={enc.id}
            icono={Swords}
            t={tone.rubi}
            onClick={() => {
              if (varios) actualizar((b) => { b.encuentroActivo = enc.id })
              irA('encuentro')
            }}
            etiqueta={`${varios ? `«${enc.titulo}»` : 'Encuentro'}: ronda ${enc.ronda}, ${FASE_INFO[enc.fase].label}`}
          >
            {varios ? `${enc.titulo} · R${enc.ronda}` : `Ronda ${enc.ronda}`} · {FASE_INFO[enc.fase].label}
          </Chip>
        ))}
        {sesion && (
          <Chip icono={Timer} t={tone.cuarzo} onClick={() => irA('bitacora')} etiqueta={`Sesión ${sesion.numero ?? ''}: ${duracion(sesion.iniciadaEn, ahora)}`}>
            Sesión {sesion.numero ?? '¿?'} · {duracion(sesion.iniciadaEn, ahora)}
          </Chip>
        )}
      </div>

      <IndicadorGuardado guardado={guardado} />
      <BotonEncendida />
      <BotonPantallaCompleta />
    </header>
  )
}

function Chip({ icono: Icon, t, onClick, etiqueta, children }: { icono: LucideIcon; t: Tone; onClick: () => void; etiqueta: string; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      title={etiqueta}
      className="ui-btn"
      style={{
        ...buttonReset, display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, maxWidth: 260, minHeight: 34, padding: '0 12px',
        borderRadius: radius.full, background: t.bg, border: `1px solid ${t.border}`, color: t.fg, fontSize: fs.sm, fontWeight: 650,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}
    >
      <Icon size={14} aria-hidden style={{ flexShrink: 0 }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</span>
    </button>
  )
}

const GUARDADO: Record<EstadoGuardado, { texto: string; t: Tone; icon: LucideIcon; gira?: boolean }> = {
  guardado: { texto: 'Guardado', t: tone.cuarzo, icon: Check },
  pendiente: { texto: 'Guardando…', t: tone.cuarzo, icon: LoaderCircle, gira: true },
  guardando: { texto: 'Guardando…', t: tone.cuarzo, icon: LoaderCircle, gira: true },
  error: { texto: 'Sin conexión: reintentando', t: tone.topacio, icon: CloudOff },
  conflicto: { texto: 'Conflicto', t: tone.rubi, icon: TriangleAlert },
}

function IndicadorGuardado({ guardado }: { guardado: EstadoGuardado }) {
  const g = GUARDADO[guardado]
  const Icon = g.icon
  const estilo: CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0, fontSize: fs.xs, fontWeight: 650, color: g.t.fg, whiteSpace: 'nowrap' }
  return (
    <span role="status" aria-live="polite" style={estilo} title={g.texto}>
      <Icon size={14} aria-hidden style={g.gira ? { animation: 'spin 1s linear infinite' } : undefined} />
      <span className="hide-mobile">{g.texto}</span>
    </span>
  )
}

// ── Keep the screen on (Screen Wake Lock: needs https or localhost) ─────────

const esBool = (v: unknown): v is boolean => typeof v === 'boolean'

function BotonEncendida() {
  const soportado = typeof navigator !== 'undefined' && 'wakeLock' in navigator
  const [activo, setActivo] = useState(() => leerPreferencia('cosmere-pantalla-encendida', false, esBool))

  useEffect(() => {
    if (!soportado || !activo) return
    let centinela: WakeLockSentinel | null = null
    let cancelado = false
    const pedir = () => {
      navigator.wakeLock
        .request('screen')
        .then((s) => { if (cancelado) void s.release(); else centinela = s })
        .catch(() => {})
    }
    // The browser drops the lock whenever the page is hidden: ask again when it comes back
    const alVolver = () => { if (document.visibilityState === 'visible') pedir() }
    pedir()
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      cancelado = true
      document.removeEventListener('visibilitychange', alVolver)
      void centinela?.release().catch(() => {})
    }
  }, [soportado, activo])

  if (!soportado) return null
  const alternar = () => {
    setActivo(!activo)
    guardarPreferencia('cosmere-pantalla-encendida', !activo)
  }
  return (
    <IconButton
      label={activo ? 'Pantalla siempre encendida (activado)' : 'Mantener la pantalla encendida'}
      aria-pressed={activo}
      variant="surface"
      size={40}
      onClick={alternar}
      style={activo ? { color: tone.heliodoro.fg, borderColor: tone.heliodoro.border, background: tone.heliodoro.bg } : undefined}
    >
      {activo ? <Sun size={18} aria-hidden /> : <SunDim size={18} aria-hidden />}
    </IconButton>
  )
}

// ── Fullscreen (and landscape lock where the browser allows it) ─────────────

type DocWebkit = Document & { webkitFullscreenElement?: Element | null; webkitExitFullscreen?: () => Promise<void>; webkitFullscreenEnabled?: boolean }
type ElemWebkit = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }
type Orientacion = ScreenOrientation & { lock?: (o: string) => Promise<void>; unlock?: () => void }

const suscribirCompleta = (cb: () => void) => {
  document.addEventListener('fullscreenchange', cb)
  document.addEventListener('webkitfullscreenchange', cb)
  return () => {
    document.removeEventListener('fullscreenchange', cb)
    document.removeEventListener('webkitfullscreenchange', cb)
  }
}
const enCompleta = () => !!(document.fullscreenElement || (document as DocWebkit).webkitFullscreenElement)

function BotonPantallaCompleta() {
  const doc = document as DocWebkit
  const soportado = !!(document.fullscreenEnabled || doc.webkitFullscreenEnabled)
  const activo = useSyncExternalStore(suscribirCompleta, enCompleta, () => false)
  if (!soportado) return null

  const alternar = async () => {
    const orientacion = screen.orientation as Orientacion | undefined
    try {
      if (activo) {
        orientacion?.unlock?.()
        await (document.exitFullscreen ? document.exitFullscreen() : doc.webkitExitFullscreen?.())
      } else {
        const el = document.documentElement as ElemWebkit
        await (el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen?.())
        await orientacion?.lock?.('landscape').catch(() => {})
      }
    } catch {
      /* the browser refused (iframe, policy): nothing to do */
    }
  }

  return (
    <IconButton label={activo ? 'Salir de pantalla completa' : 'Pantalla completa'} aria-pressed={activo} variant="surface" size={40} onClick={() => void alternar()}>
      {activo ? <Minimize2 size={18} aria-hidden /> : <Maximize2 size={18} aria-hidden />}
    </IconButton>
  )
}
