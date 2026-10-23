import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent, type ReactNode, type RefObject } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen, Check, ChevronLeft, CloudOff, Dices, LoaderCircle, NotebookPen, PanelRightClose, PanelRightOpen, Projector, RefreshCw,
  Swords, Timer, TriangleAlert, Users, type LucideIcon,
} from 'lucide-react'
import { gmScreenApi } from '../../api/gmScreen'
import type { DiceRollResponse } from '../../api/diceRolls'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import { Button, ConfirmDialog, ErrorMessage, IconButton, Spinner, Tabs, type TabItem } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { buttonReset, c, fs, radius, titleText, tone, type Tone } from '../../theme'
import { PantallaProvider } from './PantallaProvider'
import {
  PanelesContext, duracion, esperarGuardado, guardarPreferencia, leerPreferencia, useAhora, usePaneles, usePantalla, type EstadoGuardado,
  type PanelId,
} from './contexto'
import { FASE_INFO, type PantallaEstado } from './estado'
import { hora } from './exportar'
import { PanelEscena } from './PanelEscena'
import { PanelEncuentro } from './PanelEncuentro'
import { PanelGrupo } from './PanelGrupo'
import { PanelTiradas } from './PanelTiradas'
import { PanelBitacora } from './PanelBitacora'
import { PanelMesa } from './PanelMesa'
import { BotonEncendida, BotonPantallaCompleta } from './dispositivo'
import { tituloDe } from './guion'
import { useLibro } from './libro'
import type { LibroAventura } from '../../data/libros/tipos'

const PANELES: Record<PanelId, { label: string; icon: LucideIcon; render: () => ReactNode }> = {
  escena: { label: 'Escena', icon: BookOpen, render: () => <PanelEscena /> },
  encuentro: { label: 'Encuentro', icon: Swords, render: () => <PanelEncuentro /> },
  grupo: { label: 'Grupo', icon: Users, render: () => <PanelGrupo /> },
  tiradas: { label: 'Tiradas', icon: Dices, render: () => <PanelTiradas /> },
  bitacora: { label: 'Bitácora', icon: NotebookPen, render: () => <PanelBitacora /> },
  mesa: { label: 'Mesa', icon: Projector, render: () => <PanelMesa /> },
}
/** Left pane: what is happening (story, fight, party); right pane: what comes in, what is noted and what the players see */
const PANEL_A: PanelId[] = ['escena', 'encuentro', 'grupo']
const PANEL_B: PanelId[] = ['tiradas', 'bitacora', 'mesa']
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

/**
 * With two panes, the share of the width «Mesa» takes: the director drags the divider, and the device remembers it. «Registro»
 * folds into a strip of icons, also remembered (it often goes unused).
 */
const REPARTO = { inicial: 0.55, min: 0.3, max: 0.8 }
const PREF_REPARTO = 'cosmere-pantalla-reparto'
const PREF_PLEGADO = 'cosmere-pantalla-registro-plegado'
const esReparto = (v: unknown): v is number => typeof v === 'number' && v >= REPARTO.min && v <= REPARTO.max
const acotarReparto = (v: number) => Math.min(REPARTO.max, Math.max(REPARTO.min, v))

// ── Route ────────────────────────────────────────────────────────────────────

export function PantallaPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const isGm = useCampaignStore((s) => s.isGm)

  // gcTime 0: every visit starts from the stored document, never from a cached copy older than the last save; and it waits
  // for the save the previous visit sent on its way out («Ver ficha» and back), so it never reads the version before it
  const { data, isError, refetch, isFetching } = useQuery({
    queryKey: ['gm-screen', cId],
    queryFn: async () => {
      await esperarGuardado(cId)
      return gmScreenApi.get(cId)
    },
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
  const { cId, conflicto, resolverConflicto, rechazo, guardado, reintentarGuardado, soloLectura } = usePantalla()
  const qc = useQueryClient()
  const [eligiendo, setEligiendo] = useState<'servidor' | 'mia' | null>(null)
  const dos = useDosPaneles()
  const [tabA, setTabA] = useState<PanelId>(() => leerPreferencia('cosmere-pantalla-a', 'escena', esDe(PANEL_A)))
  const [tabB, setTabB] = useState<PanelId>(() => leerPreferencia('cosmere-pantalla-b', 'tiradas', esDe(PANEL_B)))
  const [tabUnico, setTabUnico] = useState<PanelId>(() => leerPreferencia('cosmere-pantalla-unica', 'escena', esDe(TODOS)))
  const [nuevas, setNuevas] = useState(0)
  const [reparto, setReparto] = useState(() => leerPreferencia(PREF_REPARTO, REPARTO.inicial, esReparto))
  const [plegado, setPlegado] = useState(() => leerPreferencia(PREF_PLEGADO, false, esBool))
  const zona = useRef<HTMLDivElement>(null)
  const plegar = (v: boolean) => {
    setPlegado(v)
    guardarPreferencia(PREF_PLEGADO, v)
  }

  const tiradasVisibles = dos ? tabB === 'tiradas' && !plegado : tabUnico === 'tiradas'
  const visiblesRef = useRef(tiradasVisibles)
  useEffect(() => { visiblesRef.current = tiradasVisibles }, [tiradasVisibles])

  const elegir = (panel: PanelId) => {
    if (panel === 'tiradas') setNuevas(0)
    if (dos) {
      if (PANEL_A.includes(panel)) { setTabA(panel); guardarPreferencia('cosmere-pantalla-a', panel) }
      else {
        setTabB(panel)
        guardarPreferencia('cosmere-pantalla-b', panel)
        // A panel of «Registro» opened from elsewhere (a chip of the top bar) unfolds it
        if (plegado) plegar(false)
      }
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
    // Back from sleep or a Wi-Fi drop the live connection may have missed rolls: read the log again
    const alVolver = () => { if (document.visibilityState === 'visible') void qc.invalidateQueries({ queryKey: ['dice-rolls', cId] }) }
    window.addEventListener('diceRollReceived', recibir)
    document.addEventListener('visibilitychange', alVolver)
    return () => {
      window.removeEventListener('diceRollReceived', recibir)
      document.removeEventListener('visibilitychange', alVolver)
    }
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
            <Button size="sm" variant="secondary" onClick={() => setEligiendo('servidor')}>Usar la versión guardada</Button>
            <Button size="sm" onClick={() => setEligiendo('mia')}>Guardar la mía encima</Button>
          </div>
        )}
        {rechazo && guardado === 'rechazado' && (
          <div
            role="alert"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '8px 12px 0', padding: '10px 14px', borderRadius: radius.md,
              background: tone.rubi.bg, border: `1px solid ${tone.rubi.border}`, color: c.text, fontSize: fs.sm,
            }}
          >
            <TriangleAlert size={18} aria-hidden style={{ color: tone.rubi.fg, flexShrink: 0 }} />
            <span style={{ flex: '1 1 260px' }}>
              No se pudo guardar: {rechazo} Tus cambios siguen en esta pantalla; no la cierres hasta que se guarden.
            </span>
            <Button size="sm" variant="secondary" icon={<RefreshCw size={15} aria-hidden />} onClick={reintentarGuardado}>Reintentar</Button>
          </div>
        )}
        {soloLectura && (
          <div
            role="alert"
            style={{
              display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', margin: '8px 12px 0', padding: '10px 14px', borderRadius: radius.md,
              background: tone.topacio.bg, border: `1px solid ${tone.topacio.border}`, color: c.text, fontSize: fs.sm,
            }}
          >
            <TriangleAlert size={18} aria-hidden style={{ color: tone.topacio.fg, flexShrink: 0 }} />
            <span style={{ flex: '1 1 260px' }}>
              Esta pantalla se guardó con una versión más nueva de la aplicación. Recarga la página para actualizarla; hasta entonces
              solo se puede consultar y no se guarda nada.
            </span>
            <Button size="sm" variant="secondary" icon={<RefreshCw size={15} aria-hidden />} onClick={() => window.location.reload()}>Recargar</Button>
          </div>
        )}
        <ConfirmDialog
          open={eligiendo !== null}
          tone={eligiendo === 'mia' ? 'brand' : undefined}
          icon="warning"
          title={eligiendo === 'mia' ? '¿Guardar tu versión encima?' : '¿Usar la versión guardada?'}
          message={eligiendo === 'mia'
            ? 'Lo que se guardó desde el otro dispositivo se sustituye por lo que tienes en esta pantalla.'
            : 'Los cambios de esta pantalla que aún no se habían guardado se descartan.'}
          confirmLabel={eligiendo === 'mia' ? 'Guardar la mía' : 'Usar la guardada'}
          onConfirm={() => {
            if (eligiendo) resolverConflicto(eligiendo)
            setEligiendo(null)
          }}
          onCancel={() => setEligiendo(null)}
        />
        <div
          ref={zona}
          style={dos
            ? { flex: 1, minHeight: 0, display: 'flex', padding: 12 }
            : { flex: 1, minHeight: 0, display: 'grid', gap: 12, padding: 8, gridTemplateColumns: 'minmax(0, 1fr)' }}
        >
          {dos ? (
            <>
              <Panel
                prefijo="pantalla-a" etiqueta="Mesa" ids={PANEL_A} valor={tabA} onCambiar={elegir} badge={badge}
                estilo={{ flex: plegado ? '1 1 0' : `${reparto} 1 0`, minWidth: 320 }}
              />
              {plegado ? (
                <RielRegistro ids={PANEL_B} badge={badge} onAbrir={(panel) => { plegar(false); if (panel) elegir(panel) }} />
              ) : (
                <>
                  <Divisor
                    zona={zona}
                    reparto={reparto}
                    onCambio={setReparto}
                    onSoltar={(v) => guardarPreferencia(PREF_REPARTO, v)}
                    onPlegar={() => plegar(true)}
                  />
                  <Panel
                    prefijo="pantalla-b" etiqueta="Registro" ids={PANEL_B} valor={tabB} onCambiar={elegir} badge={badge}
                    estilo={{ flex: `${1 - reparto} 1 0`, minWidth: 260 }}
                    accion={
                      <IconButton label="Plegar Registro" variant="surface" size={40} onClick={() => plegar(true)}>
                        <PanelRightClose size={18} aria-hidden />
                      </IconButton>
                    }
                  />
                </>
              )}
            </>
          ) : (
            <Panel prefijo="pantalla-u" etiqueta="Pantalla del director" ids={TODOS} valor={tabUnico} onCambiar={elegir} badge={badge} />
          )}
        </div>
      </div>
    </PanelesContext.Provider>
  )
}

/**
 * A pane: its tab strip (with an optional action at its end, «Plegar Registro») and one scroll area per panel. A panel stays
 * mounted once opened, so its scroll and form keep their place
 */
function Panel({
  prefijo, etiqueta, ids, valor, onCambiar, badge, estilo, accion,
}: {
  prefijo: string
  etiqueta: string
  ids: PanelId[]
  valor: PanelId
  onCambiar: (p: PanelId) => void
  badge: number
  estilo?: CSSProperties
  accion?: ReactNode
}) {
  const [abiertos, setAbiertos] = useState<PanelId[]>([valor])
  // A panel opened from elsewhere (a chip of the top bar, «Al encuentro») stays mounted too, as one opened by its tab
  if (!abiertos.includes(valor)) setAbiertos([...abiertos, valor])
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
        ...estilo,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: 8, borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <Tabs<PanelId> idPrefix={prefijo} ariaLabel={etiqueta} tabs={tabs} value={valor} onChange={cambiar} stretch size="sm" tone="rubi" />
        </div>
        {accion}
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

/**
 * The divider between the two panes. Dragged (mouse, finger or pen) it shares the width out; taken almost to the right edge it
 * folds «Registro». With the keyboard: arrows move it, Home and End take it to its limits, Enter folds «Registro». A double
 * click puts it back where it started.
 */
function Divisor({
  zona, reparto, onCambio, onSoltar, onPlegar,
}: {
  zona: RefObject<HTMLDivElement | null>
  reparto: number
  onCambio: (v: number) => void
  onSoltar: (v: number) => void
  onPlegar: () => void
}) {
  const [arrastrando, setArrastrando] = useState(false)
  const fraccion = (x: number) => {
    const r = zona.current?.getBoundingClientRect()
    return r && r.width > 0 ? (x - r.left) / r.width : reparto
  }
  const empezar = (ev: PointerEvent<HTMLDivElement>) => {
    if (ev.button !== 0) return
    ev.preventDefault()
    ev.currentTarget.setPointerCapture(ev.pointerId)
    setArrastrando(true)
  }
  const mover = (ev: PointerEvent<HTMLDivElement>) => {
    if (arrastrando) onCambio(acotarReparto(fraccion(ev.clientX)))
  }
  const soltar = (ev: PointerEvent<HTMLDivElement>) => {
    if (!arrastrando) return
    setArrastrando(false)
    const f = fraccion(ev.clientX)
    if (f > 0.92) {
      onPlegar()
      return
    }
    onSoltar(acotarReparto(f))
  }
  const teclas = (ev: KeyboardEvent<HTMLDivElement>) => {
    if (ev.key === 'Enter') {
      ev.preventDefault()
      onPlegar()
      return
    }
    const destino = { ArrowLeft: reparto - 0.05, ArrowRight: reparto + 0.05, Home: REPARTO.min, End: REPARTO.max }[ev.key]
    if (destino === undefined) return
    ev.preventDefault()
    const v = acotarReparto(destino)
    onCambio(v)
    onSoltar(v)
  }
  const pct = Math.round(reparto * 100)
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Reparto entre Mesa y Registro"
      aria-valuemin={Math.round(REPARTO.min * 100)}
      aria-valuemax={Math.round(REPARTO.max * 100)}
      aria-valuenow={pct}
      aria-valuetext={`Mesa ${pct} %, Registro ${100 - pct} %`}
      title="Arrastra para repartir el ancho; hasta el borde, pliega Registro"
      tabIndex={0}
      className="ui-divisor"
      data-arrastrando={arrastrando || undefined}
      onPointerDown={empezar}
      onPointerMove={mover}
      onPointerUp={soltar}
      onPointerCancel={() => setArrastrando(false)}
      onDoubleClick={() => { onCambio(REPARTO.inicial); onSoltar(REPARTO.inicial) }}
      onKeyDown={teclas}
      style={{
        width: 14, flexShrink: 0, alignSelf: 'stretch', display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'col-resize', touchAction: 'none', userSelect: 'none', borderRadius: radius.sm,
      }}
    >
      <span aria-hidden style={{ width: 4, height: 56, borderRadius: radius.full, background: c.borderBright }} />
    </div>
  )
}

/** «Registro» folded: a strip with its panels as icons (Tiradas keeps its count of new rolls); any of them unfolds it */
function RielRegistro({ ids, badge, onAbrir }: { ids: PanelId[]; badge: number; onAbrir: (panel: PanelId | null) => void }) {
  return (
    <nav
      aria-label="Registro (plegado)"
      style={{
        marginLeft: 12, width: 56, flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '8px 0',
        borderRadius: radius.lg, border: `1px solid ${c.border}`, background: 'color-mix(in srgb, var(--surface-1) 55%, transparent)',
      }}
    >
      <IconButton label="Desplegar Registro" variant="surface" size={40} onClick={() => onAbrir(null)}>
        <PanelRightOpen size={18} aria-hidden />
      </IconButton>
      <span aria-hidden style={{ width: 28, height: 1, margin: '4px 0', background: c.border }} />
      {ids.map((id) => {
        const Icon = PANELES[id].icon
        const n = id === 'tiradas' ? badge : 0
        return (
          <span key={id} style={{ position: 'relative' }}>
            <IconButton label={n ? `${PANELES[id].label}, ${n} tiradas nuevas` : PANELES[id].label} variant="ghost" size={40} onClick={() => onAbrir(id)}>
              <Icon size={18} aria-hidden />
            </IconButton>
            {n > 0 && (
              <span
                aria-hidden
                style={{
                  position: 'absolute', top: 0, right: -2, minWidth: 18, height: 18, padding: '0 5px', borderRadius: radius.full,
                  background: c.brandFill, color: c.onBrand, fontSize: 11, fontWeight: 800, lineHeight: 1,
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none',
                }}
              >
                {n}
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}

// ── Top bar ──────────────────────────────────────────────────────────────────

/** Title of the current scene: one of the session, or one of the book (documents saved before the book became a static reference) */
function tituloEscenaActual(estado: PantallaEstado, libro: LibroAventura | null): string | null {
  const ref = estado.escenaActual
  if (!ref) return null
  if (ref.origen === 'propia') {
    const esc = estado.escenasPropias.find((e) => e.id === ref.escenaId)
    return esc ? tituloDe(esc) : null
  }
  return libro?.capitulos.find((ch) => ch.id === ref.capituloId)?.scenes.find((s) => s.id === ref.escenaId)?.title ?? null
}

function BarraSuperior() {
  const navigate = useNavigate()
  const { cId, estado, guardado, actualizar } = usePantalla()
  // The top bar sits inside the panes' provider: the chips open their panel
  const { irA } = usePaneles()
  const cfg = useWorldConfig()
  const campana = useCampaignStore((s) => s.currentCampaign)
  const ahora = useAhora()
  const libro = useLibro()
  const escena = tituloEscenaActual(estado, libro)
  const varios = estado.encuentros.length > 1
  const activo = estado.encuentros.find((e) => e.id === estado.encuentroActivo) ?? estado.encuentros[0]
  const sesion = estado.sesion
  const [saliendo, setSaliendo] = useState(false)
  // Leaving with changes the server has not taken (no connection, refused, in conflict) loses them: ask first. Pending or
  // in-flight changes are sent on the way out by themselves
  const sinGuardar = guardado === 'error' || guardado === 'rechazado' || guardado === 'conflicto'
  const volver = () => navigate(`/campaigns/${cId}/gm`)

  return (
    <header
      className="glass"
      style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 56, padding: '6px 12px', borderBottom: `1px solid ${c.border}`, flexShrink: 0 }}
    >
      <Button variant="ghost" size="sm" icon={<ChevronLeft size={18} aria-hidden />} onClick={() => (sinGuardar ? setSaliendo(true) : volver())} style={{ paddingLeft: 6 }}>
        Director
      </Button>
      <ConfirmDialog
        open={saliendo}
        icon="warning"
        title="¿Salir sin guardar?"
        message="Hay cambios de la pantalla que el servidor aún no tiene. Si sales ahora, se pierden."
        confirmLabel="Salir sin guardar"
        onConfirm={() => { setSaliendo(false); volver() }}
        onCancel={() => setSaliendo(false)}
      />
      <CosmereIcon name={cfg.emblema} size={26} style={{ color: c.goldOrnament }} />
      <div style={{ minWidth: 0, flexShrink: 1 }} className="hide-mobile">
        <h1 style={{ ...titleText, fontSize: fs.md, color: c.text, whiteSpace: 'nowrap' }}>Pantalla del director</h1>
        <p style={{ fontSize: fs.xs, color: c.subtle, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 220 }}>{campana?.name}</p>
      </div>
      <h1 className="only-mobile sr-only">Pantalla del director</h1>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none', padding: '2px 0' }}>
        {escena && <Chip icono={BookOpen} t={tone.gold} onClick={() => irA('escena')} etiqueta={`Escena actual: ${escena}`}>{escena}</Chip>}
        {/* One chip per open fight: it brings that one on screen */}
        {estado.encuentros.map((enc) => {
          const texto = `${varios ? `${enc.titulo} · R${enc.ronda}` : `Ronda ${enc.ronda}`} · ${FASE_INFO[enc.fase].label}`
          return (
            <Chip
              key={enc.id}
              icono={Swords}
              t={tone.rubi}
              actual={varios && enc === activo}
              onClick={() => {
                // Which fight is on screen is saved with the document: only when it really changes
                if (enc !== activo) actualizar((b) => { b.encuentroActivo = enc.id })
                irA('encuentro')
              }}
              etiqueta={`${texto} (${varios ? 'combate' : 'encuentro'} en curso)`}
            >
              {texto}
            </Chip>
          )
        })}
        {sesion && (
          <Chip icono={Timer} t={tone.cuarzo} onClick={() => irA('bitacora')} etiqueta={`Sesión ${sesion.numero ?? ''}: ${duracion(sesion.iniciadaEn, ahora)}`}>
            Sesión {sesion.numero ?? '¿?'} · {duracion(sesion.iniciadaEn, ahora)}
          </Chip>
        )}
        {/* What the players have on their phones right now */}
        {estado.mesa.proyeccion && (
          <Chip icono={Projector} t={tone.zafiro} onClick={() => irA('mesa')} etiqueta={`En la mesa: ${estado.mesa.proyeccion.titulo || 'una imagen'}`}>
            En la mesa: {estado.mesa.proyeccion.titulo || 'imagen'}
          </Chip>
        )}
      </div>

      <IndicadorGuardado guardado={guardado} />
      <BotonEncendida />
      <BotonPantallaCompleta />
    </header>
  )
}

function Chip({
  icono: Icon, t, onClick, etiqueta, actual = false, children,
}: { icono: LucideIcon; t: Tone; onClick: () => void; etiqueta: string; actual?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={etiqueta}
      aria-current={actual || undefined}
      title={etiqueta}
      className="ui-btn"
      style={{
        ...buttonReset, display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, maxWidth: 260, minHeight: 34, padding: '0 12px',
        borderRadius: radius.full, background: t.bg, border: `1px solid ${actual ? t.fg : t.border}`, color: t.fg, fontSize: fs.sm, fontWeight: 650,
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', boxShadow: actual ? `inset 0 -2px 0 ${t.fg}` : undefined,
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
  rechazado: { texto: 'Sin guardar: el servidor lo rechaza', t: tone.rubi, icon: TriangleAlert },
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

const esBool = (v: unknown): v is boolean => typeof v === 'boolean'
