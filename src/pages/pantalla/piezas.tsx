import { useState, type CSSProperties, type ReactNode } from 'react'
import { Check, Delete, ExternalLink, Pin, PinOff } from 'lucide-react'
import { Button, IconButton, Sheet } from '../../components/ui'
import { CosmereIcon } from '../../components/CosmereIcon'
import { PlotIcon } from '../../components/GameIcons'
import { buttonReset, c, eyebrow, font, fs, numeral, pill, radius, tint, tone, type Tone } from '../../theme'
import type { TramaDieResult } from '../../utils/dice'
import type { TipoEscena } from './estado'
import { ESCENA_META } from './meta'

/* Building blocks shared by the panels of the «Pantalla del director» (big touch targets, readable at arm's length). */

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })
const listReset: CSSProperties = { listStyle: 'none', margin: 0, padding: 0 }

/** `**negrita**` and `*cursiva*` of the script's Markdown, as text nodes (never HTML) */
export function EnLinea({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*)/g)
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') && p.length > 4 ? <strong key={i} style={{ fontWeight: 700, color: c.text }}>{p.slice(2, -2)}</strong>
          : p.startsWith('*') && p.endsWith('*') && p.length > 2 ? <em key={i}>{p.slice(1, -1)}</em>
            : p)}
    </>
  )
}

/** Resource bar with label and «actual / max» (salud, concentración, Investidura) */
export function BarraRecurso({
  etiqueta,
  icono,
  actual,
  max,
  t,
  alto = 8,
}: {
  etiqueta: string
  icono?: ReactNode
  actual: number
  max: number
  t: Tone
  alto?: number
}) {
  const pct = max > 0 ? Math.round((Math.min(actual, max) / max) * 100) : 0
  const critico = max > 0 && actual <= max / 4
  return (
    <div style={{ minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, ...eyebrow, color: t.fg }}>
          {icono}
          {etiqueta}
        </span>
        <span style={{ ...numeral, fontSize: fs.md, color: critico ? tone.rubi.fg : c.text }}>
          {actual}
          <span style={{ color: c.subtle, fontSize: fs.sm, fontWeight: 600 }}> / {max}</span>
        </span>
      </div>
      <div
        role="meter"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={actual}
        style={{ height: alto, borderRadius: alto, background: c.track, overflow: 'hidden' }}
      >
        <div style={{ width: `${pct}%`, height: '100%', borderRadius: alto, background: t.fg, transition: 'width var(--dur-2) var(--ease-out)' }} />
      </div>
    </div>
  )
}

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'] as const

/** Big numeric keypad for amounts typed with a finger (damage, healing) */
export function TecladoNumerico({ valor, onChange, etiqueta }: { valor: string; onChange: (v: string) => void; etiqueta: string }) {
  const pulsar = (k: (typeof TECLAS)[number]) => {
    if (k === '⌫') onChange(valor.slice(0, -1))
    else if (k === 'C') onChange('')
    else onChange(`${valor}${k}`.replace(/^0+(?=\d)/, '').slice(0, 3))
  }
  return (
    <div role="group" aria-label={etiqueta} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8 }}>
      {TECLAS.map((k) => (
        <button
          key={k}
          type="button"
          onClick={() => pulsar(k)}
          aria-label={k === '⌫' ? 'Borrar la última cifra' : k === 'C' ? 'Vaciar' : k}
          className="ui-btn ui-btn--secondary"
          style={{
            minHeight: 54, borderRadius: radius.md, cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: c.s2, border: `1px solid ${c.borderBright}`, color: k === 'C' ? c.muted : c.text,
            ...numeral, fontSize: k === 'C' ? fs.md : fs.xl,
          }}
        >
          {k === '⌫' ? <Delete size={20} aria-hidden /> : k}
        </button>
      ))}
    </div>
  )
}

/** «Leer en voz alta» box: the book's gold frame and quote ornament, serif italic sized for reading to the table */
export function LeerEnVozAlta({ texto, escala }: { texto: string; escala: number }) {
  const parrafos = texto.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  if (parrafos.length === 0) return null
  return (
    <div
      style={{
        display: 'flex', gap: 14, padding: '16px 18px 18px 12px', borderRadius: radius.md,
        background: tone.gold.bg, border: `1px solid ${tone.gold.border}`,
      }}
    >
      <span aria-hidden style={{ display: 'flex', color: c.goldOrnament, paddingTop: 2 }}>
        <CosmereIcon name="ornamento-cita" size={44} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ ...eyebrow, color: tone.gold.fg, marginBottom: 8 }}>Leer en voz alta</p>
        {parrafos.map((p, i) => (
          <p
            key={i}
            style={{
              fontFamily: font.display, fontStyle: 'italic', fontSize: Math.round(19 * escala), lineHeight: 1.6,
              color: c.text, margin: i ? '12px 0 0' : 0, whiteSpace: 'pre-line',
            }}
          >
            <EnLinea texto={p} />
          </p>
        ))}
      </div>
    </div>
  )
}

/** A− / A+ of the reading text (remembered on the device) */
export function ControlLetra({ escala, onChange }: { escala: number; onChange: (v: number) => void }) {
  const paso = (d: number) => onChange(Math.min(1.8, Math.max(0.8, Number((escala + d).toFixed(1)))))
  const letra: CSSProperties = { fontFamily: font.display, fontWeight: 700, lineHeight: 1 }
  return (
    <div role="group" aria-label="Tamaño del texto de lectura" style={{ display: 'inline-flex', gap: 4 }}>
      <IconButton label="Texto más pequeño" size={40} variant="surface" disabled={escala <= 0.8} onClick={() => paso(-0.1)}>
        <span aria-hidden style={{ ...letra, fontSize: fs.sm }}>A</span>
      </IconButton>
      <IconButton label="Texto más grande" size={40} variant="surface" disabled={escala >= 1.8} onClick={() => paso(0.1)}>
        <span aria-hidden style={{ ...letra, fontSize: fs.lg }}>A</span>
      </IconButton>
    </div>
  )
}

/** Thumbnails that open full size (maps of the book, images of an own scene) */
export function Galeria({ imagenes }: { imagenes: { url: string; titulo: string }[] }) {
  const [abierta, setAbierta] = useState<number | null>(null)
  const actual = abierta !== null ? imagenes[abierta] : null
  return (
    <>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {imagenes.map((img, i) => (
          <li key={`${img.url}-${i}`}>
            <button
              type="button"
              onClick={() => setAbierta(i)}
              aria-haspopup="dialog"
              aria-label={`Ampliar ${img.titulo || `imagen ${i + 1}`}`}
              style={{
                ...buttonReset, display: 'block', width: '100%', borderRadius: radius.md, overflow: 'hidden',
                border: `1px solid ${c.border}`, background: c.s2, cursor: 'zoom-in',
              }}
            >
              <img src={img.url} alt="" loading="lazy" decoding="async" style={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }} />
              {img.titulo && (
                <span style={{ display: 'block', padding: '7px 10px', fontSize: fs.xs, fontWeight: 600, color: c.muted, textAlign: 'left', lineHeight: 1.35 }}>
                  {img.titulo}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
      <Sheet
        open={!!actual}
        onClose={() => setAbierta(null)}
        title={actual?.titulo || 'Imagen'}
        maxWidth={1200}
        footer={
          actual && (
            <>
              <a
                href={actual.url}
                target="_blank"
                rel="noopener noreferrer"
                className="ui-btn ui-btn--secondary"
                style={{
                  flex: '1 1 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44,
                  borderRadius: radius.md, background: c.s2, color: c.text, border: `1px solid ${c.borderBright}`,
                  fontSize: fs.base - 1, fontWeight: 650, textDecoration: 'none',
                }}
              >
                <ExternalLink size={16} aria-hidden />
                Abrir en pestaña nueva
              </a>
              <Button onClick={() => setAbierta(null)}>Cerrar</Button>
            </>
          )
        }
      >
        {actual && (
          <img src={actual.url} alt={actual.titulo || 'Imagen'} decoding="async" style={{ display: 'block', width: '100%', height: 'auto', borderRadius: radius.md, border: `1px solid ${c.border}` }} />
        )}
      </Sheet>
    </>
  )
}

const TRAMA_LABEL: Record<Exclude<TramaDieResult, 'blank'>, string> = {
  O: 'Oportunidad', C1: 'Complicación 1', C2: 'Complicación 2', C3: 'Complicación 3', C4: 'Complicación 4',
}

/** Plot-die result with the official symbol (nothing for a blank face) */
export function ChipTrama({ trama }: { trama: TramaDieResult | null | undefined }) {
  if (!trama || trama === 'blank') return null
  const op = trama === 'O'
  const t = op ? tone.brand : tone.rubi
  return (
    <span style={pill(t)}>
      <PlotIcon result={op ? 'oportunidad' : 'complicacion'} size={13} />
      {TRAMA_LABEL[trama]}
    </span>
  )
}

/** Square tinted tile that carries an icon */
export function Tesela({ t, children, tam = 36 }: { t: Tone; children: ReactNode; tam?: number }) {
  return (
    <span
      aria-hidden
      style={{
        width: tam, height: tam, flexShrink: 0, borderRadius: radius.sm,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: t.bg, border: `1px solid ${t.border}`, color: t.fg,
      }}
    >
      {children}
    </span>
  )
}

/** A progress mark: a big checkbox row (checklist item, scene played, combat won…) */
export function FilaMarca({
  marcada,
  onCambiar,
  children,
  extra,
}: {
  marcada: boolean
  onCambiar: (v: boolean) => void
  children: ReactNode
  /** Pill or detail after the text (type of progression item…) */
  extra?: ReactNode
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={marcada}
      onClick={() => onCambiar(!marcada)}
      className="ui-row"
      style={{
        ...buttonReset, width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, minHeight: 48, padding: '10px 12px',
        borderRadius: radius.md, background: marcada ? tone.esmeralda.bg : c.s1, border: `1px solid ${marcada ? tone.esmeralda.border : c.border}`,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 24, height: 24, flexShrink: 0, marginTop: 1, borderRadius: 7,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          background: marcada ? tone.esmeralda.fg : 'transparent', border: `1.5px solid ${marcada ? tone.esmeralda.fg : c.borderStrong}`,
          color: 'var(--bg)',
        }}
      >
        {marcada && <Check size={16} strokeWidth={3} />}
      </span>
      <span style={{ flex: 1, minWidth: 0, fontSize: fs.base - 1, lineHeight: 1.5, color: marcada ? c.muted : c.text, textDecoration: marcada ? 'line-through' : 'none', textDecorationColor: tone.esmeralda.border }}>
        {children}
      </span>
      {extra}
    </button>
  )
}

/** Toggle button with pressed state (Actuado, Reacción, Jugada, Escena actual…) */
export function Conmutador({
  activo,
  onClick,
  etiqueta,
  icono,
  t = tone.esmeralda,
  compacto = false,
  titulo,
}: {
  activo: boolean
  onClick: () => void
  etiqueta: ReactNode
  icono?: ReactNode
  t?: Tone
  compacto?: boolean
  /** Accessible name when the label is only an icon */
  titulo?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={activo}
      aria-label={titulo}
      title={titulo}
      onClick={onClick}
      className="ui-btn"
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        minHeight: compacto ? 36 : 44, padding: compacto ? '0 10px' : '0 14px', borderRadius: radius.sm,
        border: `1px solid ${activo ? t.border : c.borderBright}`,
        background: activo ? t.bg : c.s2,
        color: activo ? t.fg : c.muted,
        fontSize: fs.sm, fontWeight: activo ? 700 : 600, cursor: 'pointer', whiteSpace: 'nowrap',
        boxShadow: activo ? `inset 0 0 0 1px ${tint(t.fg, 18)}` : 'none',
      }}
    >
      {icono}
      {etiqueta}
    </button>
  )
}

// ── Shared scene header ──────────────────────────────────────────────────────

export function CabeceraEscena({
  titulo, tipo, kicker, actual, jugada, onActual, onJugada, escala, onEscala, acciones,
}: {
  titulo: string
  tipo: TipoEscena
  kicker?: string
  actual: boolean
  jugada: boolean
  onActual: () => void
  onJugada: () => void
  escala: number
  onEscala: (v: number) => void
  acciones?: ReactNode
}) {
  const meta = ESCENA_META[tipo]
  const Icon = meta.icon
  return (
    <header style={stack(10)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Tesela t={meta.tone} tam={40}><Icon size={19} /></Tesela>
        <div style={{ flex: 1, minWidth: 0 }}>
          {kicker && <p style={{ ...eyebrow, color: tone.gold.fg, marginBottom: 2 }}>{kicker}</p>}
          <h2 style={{ fontFamily: font.display, fontSize: fs.xl + 2, fontWeight: 600, lineHeight: 1.2, color: c.text }}>{titulo}</h2>
          <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            <span style={pill(meta.tone)}>{meta.label}</span>
            {actual && <span style={pill(tone.gold)}><Pin size={12} aria-hidden />Escena actual</span>}
            {jugada && <span style={pill(tone.esmeralda)}><Check size={12} aria-hidden />Jugada</span>}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Button size="sm" variant={actual ? 'gold' : 'secondary'} icon={actual ? <PinOff size={15} aria-hidden /> : <Pin size={15} aria-hidden />} onClick={onActual}>
          {actual ? 'Quitar de actual' : 'Escena actual'}
        </Button>
        <Button size="sm" variant="secondary" icon={<Check size={15} aria-hidden />} onClick={onJugada} aria-pressed={jugada}
          style={jugada ? { background: tone.esmeralda.bg, borderColor: tone.esmeralda.border, color: tone.esmeralda.fg } : undefined}>
          {jugada ? 'Jugada' : 'Marcar jugada'}
        </Button>
        {acciones}
        <span style={{ marginLeft: 'auto' }}>
          <ControlLetra escala={escala} onChange={onEscala} />
        </span>
      </div>
    </header>
  )
}

export function Apartado({ titulo, icono, color = c.subtle, children }: { titulo: string; icono?: ReactNode; color?: string; children: ReactNode }) {
  return (
    <section style={stack(8)}>
      <h3 style={{ ...eyebrow, color, display: 'flex', alignItems: 'center', gap: 6 }}>
        {icono}
        {titulo}
      </h3>
      {children}
    </section>
  )
}

export function Parrafos({ textos, escala }: { textos: string[]; escala: number }) {
  return (
    <div style={stack(10)}>
      {textos.map((p, i) => (
        <p key={i} style={{ fontSize: Math.round(16 * escala), color: c.text, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{p}</p>
      ))}
    </div>
  )
}

/** Chips to pick a scene: type glyph, title, played and current marks */
export function SelectorEscenas({
  escenas, seleccion, onElegir,
}: {
  escenas: { id: string; titulo: string; tipo: TipoEscena; jugada: boolean; actual: boolean }[]
  seleccion: string | null
  onElegir: (id: string) => void
}) {
  return (
    <ul aria-label="Escenas" style={{ ...listReset, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {escenas.map((e) => {
        const on = e.id === seleccion
        const meta = ESCENA_META[e.tipo]
        const Icon = meta.icon
        return (
          <li key={e.id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => onElegir(e.id)}
              className="ui-btn"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 38, padding: '0 12px', borderRadius: radius.full, cursor: 'pointer',
                background: on ? meta.tone.bg : c.s2, border: `1px solid ${on ? meta.tone.border : c.border}`,
                color: on ? c.text : c.muted, fontSize: fs.sm, fontWeight: on ? 700 : 550,
              }}
            >
              <Icon size={14} aria-hidden style={{ color: meta.tone.fg }} />
              {e.titulo}
              {e.actual && <><Pin size={12} aria-hidden style={{ color: tone.gold.fg }} /><span className="sr-only">, escena actual</span></>}
              {e.jugada && <><Check size={13} aria-hidden style={{ color: tone.esmeralda.fg }} /><span className="sr-only">, jugada</span></>}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
