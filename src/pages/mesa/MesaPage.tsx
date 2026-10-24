import { useState, type CSSProperties, type ReactNode } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CloudOff, ExternalLink, Maximize2, Minimize2, Projector, RefreshCw, Skull, Swords, Timer, TriangleAlert, Wifi, ZoomIn, ZoomOut } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useAuthStore } from '../../store/authStore'
import { useCampaignStore, useWorldConfig } from '../../store/campaignStore'
import { Button, Disclosure, EmptyState, ErrorMessage, Sheet, Spinner } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { StatIcons } from '../../lib/gameIcons'
import { miPersonaje } from '../../lib/personajes'
import { buttonReset, c, eyebrow, font, fs, numeral, page, pill, radius, shadow, titleText, tone, type Tone } from '../../theme'
import type { EstadoDef } from '../../worlds/types'
import { duracion, useAhora } from '../pantalla/contexto'
import { BotonEncendida, BotonPantallaCompleta } from '../pantalla/dispositivo'
import { FASES, FASE_INFO, marcaDe, type EstadoAplicado, type Fase, type Turno } from '../pantalla/estado'
import { BarraRecurso, Tesela } from '../pantalla/piezas'
import { CapaFichas } from './Fichas'
import { useImagenMesa } from './imagenes'
import { CapaNiebla } from './Niebla'
import { PISTA_LABEL, type AliadoMesa, type EncuentroMesa, type EnemigoMesa, type FichaMesa, type Niebla, type PistaSalud, type Proyeccion } from './publica'
import { useMesaEnVivo, type EstadoRed } from './useMesaEnVivo'

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }
const tarjeta: CSSProperties = { padding: 14, borderRadius: radius.lg, background: c.s1, border: `1px solid ${c.border}`, boxShadow: shadow[1] }

/** Official action glyph of each turn: a fast turn has 2 actions, a slow one 3 */
const ICONO_TURNO = { rapido: 'accion-2', lento: 'accion-3' } as const
const ETIQUETA_SALIDA = { derrotado: 'derrotado', huido: 'huye', rendido: 'se rinde' } as const
const PISTA_TONE: Record<PistaSalud, Tone> = { intacto: tone.esmeralda, herido: tone.topacio, malherido: tone.rubi, caido: tone.cuarzo }

// ── Route ────────────────────────────────────────────────────────────────────

/**
 * «La mesa»: what the director shows to the players, on their phones. The fights the director publishes (companions with their
 * health and conditions, enemies by name) and the image projected right now. It reads the public document and never writes.
 */
export function MesaPage() {
  const { campaignId } = useParams<{ campaignId: string }>()
  const cId = Number(campaignId)
  const { mesa, masNueva, red, leidoEn, error, reintentar } = useMesaEnVivo(cId)
  const campana = useCampaignStore((s) => s.currentCampaign)
  const userId = useAuthStore((s) => s.user?.id ?? null)
  // The player's own character, to put it first with «Tú» (the director has none)
  const { data: personajes = [] } = useQuery({ queryKey: ['characters', cId], queryFn: () => charactersApi.getAll(cId), enabled: cId > 0 })
  const mio = miPersonaje(personajes, userId)?.id ?? null

  return (
    <div style={page}>
      <header className="rise" style={{ ...stack(10), marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 200px', minWidth: 0 }}>
            <h1 style={{ ...titleText, fontSize: fs['2xl'], color: c.text }}>La mesa</h1>
            <p style={{ fontSize: fs.sm, color: c.muted, marginTop: 4 }}>{campana?.name ?? 'Campaña'}</p>
          </div>
          <BotonEncendida clave="cosmere-mesa-encendida" />
          <BotonPantallaCompleta orientacion={null} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <IndicadorRed red={red} leidoEn={leidoEn} />
          {mesa?.sesion && <ChipSesion numero={mesa.sesion.numero} iniciadaEn={mesa.sesion.iniciadaEn} />}
        </div>
      </header>

      {masNueva && (
        <div role="alert" style={{ ...tarjeta, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: tone.topacio.bg, borderColor: tone.topacio.border, marginBottom: 16 }}>
          <TriangleAlert size={18} aria-hidden style={{ color: tone.topacio.fg, flexShrink: 0 }} />
          <span style={{ flex: '1 1 220px', fontSize: fs.sm, color: c.text }}>La mesa se guardó con una versión más nueva de la aplicación. Recarga la página para verla entera.</span>
          <Button size="sm" variant="secondary" icon={<RefreshCw size={15} aria-hidden />} onClick={() => window.location.reload()}>Recargar</Button>
        </div>
      )}

      {error ? (
        <div style={stack(12)}>
          <ErrorMessage message="No se pudo cargar la mesa." />
          <Button onClick={reintentar} icon={<RefreshCw size={15} aria-hidden />} style={{ alignSelf: 'flex-start' }}>Reintentar</Button>
        </div>
      ) : !mesa ? (
        <Spinner label="Cargando la mesa…" />
      ) : (
        <Mesa mesa={mesa} cId={cId} mio={mio} />
      )}
    </div>
  )
}

function Mesa({ mesa, cId, mio }: { mesa: ReturnType<typeof useMesaEnVivo>['mesa'] & object; cId: number; mio: number | null }) {
  if (!mesa.proyeccion && mesa.encuentros.length === 0) {
    return (
      <EmptyState
        icon={<Projector size={22} aria-hidden />}
        title="La mesa está tranquila"
        description="Cuando el director muestre un combate o una imagen, aparecerá aquí al momento."
      />
    )
  }
  return (
    <div style={stack(24)}>
      {mesa.proyeccion && <EnLaMesa key={mesa.proyeccion.id} p={mesa.proyeccion} cId={cId} />}
      {mesa.encuentros.map((e) => <BloqueCombate key={e.id} e={e} cId={cId} mio={mio} varios={mesa.encuentros.length > 1} />)}
    </div>
  )
}

// ── Header pieces ────────────────────────────────────────────────────────────

function IndicadorRed({ red, leidoEn }: { red: EstadoRed; leidoEn: number }) {
  const ahora = useAhora()
  if (red === 'cargando') return null
  const sin = red === 'sin-conexion'
  const t = sin ? tone.topacio : tone.esmeralda
  const hace = leidoEn ? duracion(new Date(leidoEn).toISOString(), ahora) : ''
  return (
    <span role="status" aria-live="polite" style={{ ...pill(t), gap: 6 }}>
      {sin ? <CloudOff size={12} aria-hidden /> : <Wifi size={12} aria-hidden />}
      {sin ? `Sin conexión${hace ? ` · lo último, hace ${hace}` : ''}` : 'Al día'}
    </span>
  )
}

function ChipSesion({ numero, iniciadaEn }: { numero: number | null; iniciadaEn: string }) {
  const ahora = useAhora()
  return (
    <span style={pill(tone.cuarzo)}>
      <Timer size={12} aria-hidden />
      Sesión {numero ?? '¿?'}{iniciadaEn ? ` · ${duracion(iniciadaEn, ahora)}` : ''}
    </span>
  )
}

// ── What the director projects ───────────────────────────────────────────────

function EnLaMesa({ p, cId }: { p: Proyeccion; cId: number }) {
  const { url, cargando, fallo } = useImagenMesa(cId, p.imagen)
  const [abierta, setAbierta] = useState(false)
  return (
    <section aria-label="En la mesa" className="rise" style={{ ...tarjeta, ...stack(12), borderColor: tone.zafiro.border }}>
      <span style={{ ...pill(tone.zafiro), alignSelf: 'flex-start' }}><Projector size={12} aria-hidden />En la mesa</span>
      {cargando ? (
        <Spinner label="Cargando la imagen…" />
      ) : fallo || !url ? (
        <p style={{ fontSize: fs.sm, color: tone.rubi.fg }}>No se pudo cargar la imagen. Vuelve a intentarlo en un momento.</p>
      ) : (
        <button
          type="button"
          onClick={() => setAbierta(true)}
          aria-haspopup="dialog"
          aria-label={`Ampliar ${p.titulo || 'la imagen'}`}
          style={{ ...buttonReset, display: 'block', width: '100%', cursor: 'zoom-in', borderRadius: radius.md, overflow: 'hidden', border: `1px solid ${c.border}`, background: c.s2, textAlign: 'center', lineHeight: 0 }}
        >
          {/* The fog is laid over the image box itself, so the wrapper takes the image's size (no letterboxing to cover) */}
          <span style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
            <img src={url} alt={p.titulo || 'Imagen en la mesa'} decoding="async" style={{ display: 'block', maxWidth: '100%', maxHeight: '70vh', width: 'auto', height: 'auto' }} />
            <CapaNiebla niebla={p.niebla} opaca />
            <CapaFichas fichas={p.fichas} tamano={p.tamanoFicha} nombres={p.nombresFichas} cId={cId} />
          </span>
        </button>
      )}
      {p.niebla.activa && (
        <p style={{ fontSize: fs.xs, color: c.subtle }}>
          {p.niebla.zonas.length === 0 ? 'El director aún no ha destapado ninguna zona del mapa.' : 'El director va destapando el mapa.'}
        </p>
      )}
      {(p.titulo || p.pie) && (
        <div style={stack(4)}>
          {p.titulo && <h2 style={{ fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{p.titulo}</h2>}
          {p.pie && (
            <p style={{ fontSize: fs.base, lineHeight: 1.55, color: c.text, paddingLeft: 12, borderLeft: `3px solid ${tone.zafiro.fg}`, whiteSpace: 'pre-line' }}>
              {p.pie}
            </p>
          )}
        </div>
      )}
      {abierta && url && (
        <HojaImagen
          url={url} titulo={p.titulo} pie={p.pie} niebla={p.niebla} publica={p.imagen.tipo === 'publica' && !p.niebla.activa && p.fichas.length === 0}
          fichas={p.fichas} tamanoFicha={p.tamanoFicha} nombresFichas={p.nombresFichas} cId={cId} onClose={() => setAbierta(false)}
        />
      )}
    </section>
  )
}

const ZOOMS = [1, 1.5, 2, 3]

/**
 * The image full width with zoom steps (two fingers on a phone zoom the whole page; the buttons work everywhere). With the fog
 * or tokens on, «Abrir en pestaña nueva» is not offered: the bare file would show the whole map without them
 */
function HojaImagen({
  url, titulo, pie, niebla, publica, fichas = [], tamanoFicha = 0.05, nombresFichas = true, cId = 0, onClose,
}: {
  url: string; titulo: string; pie?: string; niebla?: Niebla; publica: boolean; fichas?: FichaMesa[]; tamanoFicha?: number; nombresFichas?: boolean; cId?: number; onClose: () => void
}) {
  const [zoom, setZoom] = useState(0)
  const escala = ZOOMS[zoom]
  return (
    <Sheet
      open
      onClose={onClose}
      title={titulo || 'Imagen'}
      description={pie || undefined}
      maxWidth={1200}
      footer={
        <>
          <Button variant="secondary" icon={<ZoomOut size={16} aria-hidden />} disabled={zoom === 0} onClick={() => setZoom((z) => Math.max(0, z - 1))} aria-label="Reducir">
            <span className="hide-mobile">Reducir</span>
          </Button>
          <Button variant="secondary" icon={<ZoomIn size={16} aria-hidden />} disabled={zoom === ZOOMS.length - 1} onClick={() => setZoom((z) => Math.min(ZOOMS.length - 1, z + 1))} aria-label="Ampliar">
            <span className="hide-mobile">Ampliar</span>
          </Button>
          <Button variant="secondary" icon={escala === 1 ? <Maximize2 size={16} aria-hidden /> : <Minimize2 size={16} aria-hidden />} onClick={() => setZoom(escala === 1 ? 1 : 0)} aria-label={escala === 1 ? 'Ampliar al doble' : 'Ajustar al ancho'}>
            <span className="hide-mobile">{escala === 1 ? 'Ampliar' : 'Ajustar'}</span>
          </Button>
          {publica && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="ui-btn ui-btn--secondary"
              aria-label="Abrir en pestaña nueva"
              style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, padding: '0 14px', borderRadius: radius.md, background: c.s2, color: c.text, border: `1px solid ${c.borderBright}`, fontSize: fs.base - 1, fontWeight: 650, textDecoration: 'none' }}
            >
              <ExternalLink size={16} aria-hidden />
            </a>
          )}
          <Button onClick={onClose} style={{ flex: 1 }}>Cerrar</Button>
        </>
      }
    >
      <div style={{ overflow: 'auto', maxHeight: '70vh', borderRadius: radius.md, border: `1px solid ${c.border}`, background: c.s2, touchAction: 'pan-x pan-y pinch-zoom', lineHeight: 0 }}>
        <span style={{ position: 'relative', display: 'inline-block', width: `${escala * 100}%`, verticalAlign: 'top' }}>
          <img src={url} alt={titulo || 'Imagen'} decoding="async" style={{ display: 'block', width: '100%', maxWidth: 'none', height: 'auto' }} />
          {niebla && <CapaNiebla niebla={niebla} opaca />}
          <CapaFichas fichas={fichas} tamano={tamanoFicha} nombres={nombresFichas} cId={cId} />
        </span>
      </div>
    </Sheet>
  )
}

// ── A fight ──────────────────────────────────────────────────────────────────

function BloqueCombate({ e, cId, mio, varios }: { e: EncuentroMesa; cId: number; mio: number | null; varios: boolean }) {
  const aliados = [...e.aliados.filter((a) => a.characterId === mio), ...e.aliados.filter((a) => a.characterId !== mio)]
  const enemigos = e.enemigos.filter((x) => !x.derrotado)
  const caidos = e.enemigos.filter((x) => x.derrotado)
  return (
    <section aria-label={e.titulo} style={stack(14)}>
      <div style={{ ...tarjeta, ...stack(10), borderColor: tone.rubi.border }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ ...eyebrow, color: tone.rubi.fg }}>Ronda</span>
            <span style={{ ...numeral, fontSize: fs['2xl'], color: c.text }}>{e.ronda}</span>
          </span>
          <h2 style={{ flex: 1, minWidth: 120, fontFamily: font.display, fontSize: fs.xl, fontWeight: 600, lineHeight: 1.2, color: c.text, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Swords size={18} aria-hidden style={{ color: tone.rubi.fg, flexShrink: 0 }} />
            {varios ? e.titulo : 'Combate'}
          </h2>
        </div>
        <TiraFases fase={e.fase} />
      </div>

      <div style={stack(8)}>
        <Subtitulo>Compañeros</Subtitulo>
        {aliados.length === 0 ? (
          <p style={{ fontSize: fs.sm, color: c.subtle }}>Nadie del grupo está en este combate.</p>
        ) : (
          <ul style={{ ...listReset, ...stack(10) }}>
            {aliados.map((a) => <li key={a.id}><TarjetaAliado a={a} fase={e.fase} tu={a.characterId !== null && a.characterId === mio} /></li>)}
          </ul>
        )}
      </div>

      <div style={stack(8)}>
        <Subtitulo>Enemigos</Subtitulo>
        {enemigos.length === 0 ? (
          <p style={{ fontSize: fs.sm, color: c.subtle }}>{caidos.length ? 'No queda ningún enemigo en pie.' : 'Aún no se ve a ningún enemigo.'}</p>
        ) : (
          <ul style={{ ...listReset, ...stack(8) }}>
            {enemigos.map((x) => <li key={x.id}><FilaEnemigo x={x} fase={e.fase} cId={cId} /></li>)}
          </ul>
        )}
        {caidos.length > 0 && (
          <Disclosure headingLevel={3} accent={tone.cuarzo.fg} icon={<Skull size={18} aria-hidden />} title={`Caídos (${caidos.length})`}>
            <ul style={{ ...listReset, ...stack(8) }}>
              {caidos.map((x) => <li key={x.id}><FilaEnemigo x={x} fase={null} cId={cId} /></li>)}
            </ul>
          </Disclosure>
        )}
        {e.retirados.length > 0 && (
          <p style={{ fontSize: fs.sm, color: c.subtle, lineHeight: 1.5 }}>
            Fuera del combate: {e.retirados.map((r) => `${r.nombre} (${ETIQUETA_SALIDA[r.motivo]})`).join(', ')}
          </p>
        )}
      </div>
    </section>
  )
}

function Subtitulo({ children }: { children: ReactNode }) {
  return (
    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontFamily: font.display, fontVariantCaps: 'all-small-caps', fontSize: fs.lg + 1, fontWeight: 600, letterSpacing: '0.05em', color: c.muted }}>
      {children}
      <span aria-hidden style={{ flex: 1, height: 1, background: 'var(--gold-rule)' }} />
    </h3>
  )
}

/** The four phases of the round, the current one lit (the director moves it) */
function TiraFases({ fase }: { fase: Fase }) {
  return (
    <ol aria-label="Fase de la ronda" style={{ ...listReset, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
      {FASES.map((f) => {
        const on = f === fase
        return (
          <li
            key={f}
            aria-current={on ? 'step' : undefined}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '6px 2px', borderRadius: radius.sm, textAlign: 'center',
              background: on ? tone.rubi.bg : c.s2, border: `1px solid ${on ? tone.rubi.border : c.border}`, color: on ? tone.rubi.fg : c.subtle,
              fontSize: fs.xs, fontWeight: on ? 700 : 600, boxShadow: on ? `inset 0 -2px 0 ${tone.rubi.fg}` : undefined,
            }}
          >
            <CosmereIcon name={ICONO_TURNO[FASE_INFO[f].turno]} size={14} />
            <span style={{ whiteSpace: 'nowrap' }}>{FASE_INFO[f].label}</span>
          </li>
        )
      })}
    </ol>
  )
}

const actuoEn = (x: { turno: Turno | null; actuoRapido: boolean; actuoLento: boolean }, fase: Fase | null) =>
  fase !== null && (FASE_INFO[fase].turno === 'rapido' ? x.actuoRapido : x.actuoLento)

/** The turn chip: the chosen one, or what is known of it (a companion still to declare, an enemy the director has not revealed) */
function ChipTurno({ turno, sinElegir }: { turno: Turno | null; sinElegir: string }) {
  if (turno === null) return <span style={pill(tone.topacio)}>{sinElegir}</span>
  return <span style={pill(tone.cuarzo)}><CosmereIcon name={ICONO_TURNO[turno]} size={12} />{turno === 'rapido' ? 'Rápido' : 'Lento'}</span>
}

function TarjetaAliado({ a, fase, tu }: { a: AliadoMesa; fase: Fase; tu: boolean }) {
  const cfg = useWorldConfig()
  const actuo = actuoEn(a, fase)
  const enJuego = FASE_INFO[fase].bando === 'pj' && a.turno === FASE_INFO[fase].turno && !a.derrotado
  const acento = tu ? tone.gold : tone.brand
  return (
    <article
      aria-label={a.nombre}
      style={{
        ...tarjeta, ...stack(10), borderColor: enJuego && !actuo ? acento.border : c.border,
        boxShadow: enJuego && !actuo ? `inset 3px 0 0 ${acento.fg}, ${shadow[1]}` : shadow[1], opacity: actuo ? 0.78 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Tesela t={acento} tam={34}><span style={{ fontFamily: font.title, fontSize: fs.md }}>{marcaDe({ nombre: a.nombre, bando: 'pj' })}</span></Tesela>
        <span style={{ flex: '1 1 120px', minWidth: 0, fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text, overflowWrap: 'anywhere' }}>
          {a.nombre}
        </span>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {tu && <span style={pill(tone.gold)}>Tú</span>}
          {a.characterId === null && <span style={pill(tone.brand)}>Aliado</span>}
          <ChipTurno turno={a.turno} sinElegir="Sin turno" />
          {actuo && <span style={pill(tone.esmeralda)}>Ha actuado</span>}
          {a.reaccionUsada && <span style={pill(tone.topacio)}><CosmereIcon name="reaccion" size={12} />Reacción usada</span>}
        </span>
      </div>
      <BarraRecurso etiqueta="Salud" icono={<StatIcons.salud size={13} aria-hidden />} actual={a.salud.actual} max={a.salud.max} t={tone.granate} alto={10} />
      {(a.concentracion.max > 0 || a.investidura.max > 0) && (
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
          {a.concentracion.max > 0 && <Recurso etiqueta="Concentración" icono={<StatIcons.concentracion size={13} aria-hidden />} actual={a.concentracion.actual} max={a.concentracion.max} t={tone.heliodoro} />}
          {a.investidura.max > 0 && <Recurso etiqueta="Investidura" icono={<cfg.iconos.investidura size={13} aria-hidden />} actual={a.investidura.actual} max={a.investidura.max} t={tone.amatista} />}
        </div>
      )}
      <Estados estados={a.estados} />
    </article>
  )
}

function Recurso({ etiqueta, icono, actual, max, t }: { etiqueta: string; icono: ReactNode; actual: number; max: number; t: Tone }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, ...eyebrow, color: t.fg }}>{icono}{etiqueta}</span>
      <span style={{ ...numeral, fontSize: fs.md, color: c.text }}>{actual}<span style={{ color: c.subtle, fontSize: fs.sm, fontWeight: 600 }}> / {max}</span></span>
    </span>
  )
}

function FilaEnemigo({ x, fase, cId }: { x: EnemigoMesa; fase: Fase | null; cId: number }) {
  const actuo = actuoEn(x, fase)
  const enJuego = fase !== null && FASE_INFO[fase].bando === 'pnj' && x.turno === FASE_INFO[fase].turno && !x.derrotado
  return (
    <article
      aria-label={x.nombre}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '8px 10px', borderRadius: radius.lg, background: c.s1,
        border: `1px solid ${enJuego && !actuo ? tone.rubi.border : c.border}`, boxShadow: enJuego && !actuo ? `inset 3px 0 0 ${tone.rubi.fg}, ${shadow[1]}` : shadow[1],
        opacity: x.derrotado || actuo ? 0.72 : 1,
      }}
    >
      <AvatarEnemigo x={x} cId={cId} />
      <span style={{ flex: '1 1 120px', minWidth: 0, fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text, overflowWrap: 'anywhere' }}>
        {x.nombre}
      </span>
      <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {x.derrotado ? (
          <span style={pill(tone.cuarzo)}><Skull size={12} aria-hidden />Caído</span>
        ) : (
          <>
            {x.pistaSalud && <span style={pill(PISTA_TONE[x.pistaSalud])}><StatIcons.salud size={12} aria-hidden />{PISTA_LABEL[x.pistaSalud]}</span>}
            <ChipTurno turno={x.turno} sinElegir="Turno por ver" />
            {actuo && <span style={pill(tone.esmeralda)}>Ha actuado</span>}
          </>
        )}
      </span>
      {x.estados.length > 0 && <div style={{ flexBasis: '100%' }}><Estados estados={x.estados} /></div>}
    </article>
  )
}

/** The book's portrait of the enemy when the catalog has it, else its number or initial */
function AvatarEnemigo({ x, cId }: { x: EnemigoMesa; cId: number }) {
  const { url } = useImagenMesa(cId, x.adversarioId !== null ? { tipo: 'retrato', adversarioId: x.adversarioId } : null)
  if (url) {
    return (
      <span aria-hidden style={{ width: 38, height: 38, flexShrink: 0, borderRadius: radius.sm, overflow: 'hidden', border: `1px solid ${tone.rubi.border}`, background: tone.rubi.bg }}>
        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
      </span>
    )
  }
  return <Tesela t={tone.rubi} tam={38}><span style={{ fontFamily: font.title, fontSize: fs.lg }}>{marcaDe({ nombre: x.nombre, bando: 'pnj' })}</span></Tesela>
}

// ── Conditions ───────────────────────────────────────────────────────────────

/** Condition pills; each opens the world's summary of the condition */
function Estados({ estados }: { estados: EstadoAplicado[] }) {
  const cfg = useWorldConfig()
  const [abierto, setAbierto] = useState<EstadoAplicado | null>(null)
  if (estados.length === 0) return null
  const defDe = (id: string): EstadoDef | undefined => cfg.estados.find((e) => e.id === id)
  return (
    <>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {estados.map((e, i) => (
          <button
            key={`${e.id}-${i}`}
            type="button"
            onClick={() => setAbierto(e)}
            aria-haspopup="dialog"
            aria-label={`Estado ${defDe(e.id)?.nombre ?? e.id}${e.valor ? ` ${e.valor}` : ''}: qué significa`}
            className="ui-btn"
            style={{ ...pill(tone.topacio), minHeight: 32, cursor: 'pointer', borderRadius: radius.sm }}
          >
            {defDe(e.id)?.nombre ?? e.id}{e.valor ? ` [${e.valor}]` : ''}
          </button>
        ))}
      </div>
      {abierto && (
        <Sheet open onClose={() => setAbierto(null)} title={defDe(abierto.id)?.nombre ?? abierto.id} maxWidth={420} footer={<Button size="lg" style={{ flex: 1 }} onClick={() => setAbierto(null)}>Cerrar</Button>}>
          <div style={stack(10)}>
            {abierto.valor && <p style={{ fontSize: fs.lg, fontWeight: 650, color: tone.topacio.fg }}>{abierto.valor}</p>}
            <p style={{ fontSize: fs.base, lineHeight: 1.55, color: c.text }}>{defDe(abierto.id)?.resumen ?? 'Un estado propio de esta mesa: pregunta al director qué supone.'}</p>
          </div>
        </Sheet>
      )}
    </>
  )
}
