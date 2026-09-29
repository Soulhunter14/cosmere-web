import { useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { RADIANT_ORDERS, RADIANT_REGLAS, PRIMER_IDEAL, type RadiantOrder } from '../../data/radiantOrders'
import type { Talento } from '../../data/potencias'
import { RadiantOrderIcon, RadiantOrderPlacard } from '../../components/RadiantOrderIcon'
import { TalentActivation } from '../../components/TalentActivation'
import { SurgeIcon } from '../../components/GameIcons'
import { CosmereIcon } from '../../components/CosmereIcon'
import { Disclosure, IconButton, PageHeader, SectionTitle, Tabs, TabPanel, type TabItem } from '../../components/ui'
import { useDialogA11y } from '../../hooks/useDialogA11y'
import { hasCosmereIcon } from '../../lib/cosmereAssets'
import { c, eyebrow, font, fs, ink, page, pill, radius, shadow, tint, titleText, toneFrom } from '../../theme'

type TabId = 'reglas' | 'ordenes'
const TABS: TabItem<TabId>[] = [
  { id: 'reglas', label: 'Reglas' },
  { id: 'ordenes', label: 'Órdenes' },
]

const stack = (gap: number): CSSProperties => ({ display: 'flex', flexDirection: 'column', gap })

// ── Rule details (label + text, with the book's gold diamond bullet) ──
function RuleDetails({ details }: { details: { label: string; text: string }[] }) {
  return (
    <dl style={stack(0)}>
      {details.map((d, i) => (
        <div key={d.label} style={{ padding: '12px 0', borderTop: i === 0 ? 'none' : `1px solid ${c.border}`, paddingTop: i === 0 ? 0 : 12 }}>
          <dt style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: fs.base - 1, fontWeight: 650, color: c.text, lineHeight: 1.35, marginBottom: 4 }}>
            <CosmereIcon name="ornamento-rombo" size={8} style={{ color: 'var(--gold-ornament)' }} />
            {d.label}
          </dt>
          <dd style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6, paddingLeft: 16 }}>{d.text}</dd>
        </div>
      ))}
    </dl>
  )
}

// ── Talent row (inside the order sheet): header button + sibling panel ──
function TalentoRow({ talento }: { talento: Talento }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div
      style={{
        borderRadius: radius.md,
        background: c.s2,
        border: `1px solid ${open ? c.borderBright : c.border}`,
        transition: 'border-color var(--dur-2)',
      }}
    >
      <h4 style={{ margin: 0, fontFamily: font.ui, fontSize: 'inherit', fontWeight: 'inherit', letterSpacing: 0 }}>
        <button
          type="button"
          id={`${id}-btn`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen(!open)}
          className="ui-row"
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10, minHeight: 48,
            padding: '10px 12px', background: 'none', border: 'none', borderRadius: radius.md,
            cursor: 'pointer', textAlign: 'left', color: c.text,
          }}
        >
          <TalentActivation type={talento.cost} compact />
          <span style={{ flex: 1, minWidth: 0, fontSize: fs.base - 1, fontWeight: 650, lineHeight: 1.3 }}>{talento.name}</span>
          <ChevronDown
            size={16}
            aria-hidden
            style={{ color: c.subtle, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform var(--dur-2) var(--ease-out)' }}
          />
        </button>
      </h4>
      {open && (
        <div id={`${id}-panel`} className="fade-in" style={{ padding: '0 12px 12px' }}>
          <div style={{ ...stack(6), paddingTop: 10, borderTop: `1px solid ${c.border}` }}>
            {talento.prereq && (
              <p style={{ fontSize: fs.sm, color: c.subtle, fontStyle: 'italic' }}>
                Prerrequisito: {talento.prereq}
              </p>
            )}
            <p style={{ fontSize: fs.base - 1, color: c.muted, lineHeight: 1.6 }}>
              {talento.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Local sheet with a hero header (dialog named by the visible title) ──
function HeroSheet({ open, onClose, labelledBy, children, maxWidth = 600 }: {
  open: boolean
  onClose: () => void
  labelledBy: string
  children: ReactNode
  maxWidth?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  useDialogA11y(ref, open, onClose)
  if (!open) return null
  return createPortal(
    <div className="ui-sheet-wrap">
      <div
        className="fade-in"
        onClick={onClose}
        aria-hidden
        style={{ position: 'absolute', inset: 0, background: c.overlay, backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className="ui-sheet"
        style={{ maxWidth, overflow: 'hidden' }}
      >
        <IconButton
          label="Cerrar"
          variant="surface"
          size={44}
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, zIndex: 1, borderRadius: radius.full }}
        >
          <X size={18} aria-hidden />
        </IconButton>
        {/* Focusable scroller: keyboard users can scroll a sheet that has no controls of its own */}
        <div
          role="region"
          aria-labelledby={labelledBy}
          tabIndex={0}
          style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingBottom: 'calc(24px + var(--sab))', outlineOffset: -3 }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

// ── Detail sheet content ─────────────────────────────────────
function InfoList({ rows }: { rows: { label: string; value: string }[] }) {
  return (
    <dl style={{ borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`, overflow: 'hidden' }}>
      {rows.map((r, i) => (
        <div key={r.label} style={{ padding: '12px 14px', borderTop: i === 0 ? 'none' : `1px solid ${c.border}` }}>
          <dt style={{ ...eyebrow, marginBottom: 4 }}>{r.label}</dt>
          <dd style={{ fontSize: fs.base - 1, color: c.text, lineHeight: 1.55 }}>{r.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function OrderDetail({ order, titleId }: { order: RadiantOrder; titleId: string }) {
  const t = toneFrom(order.color)

  return (
    <>
      {/* Hero */}
      <div
        style={{
          padding: '16px 20px 20px',
          background: `linear-gradient(180deg, ${tint(order.color, 18)}, ${tint(order.color, 4)})`,
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <div aria-hidden className="ui-sheet-handle" style={{ marginTop: -6 }} />
        <div style={{ paddingRight: 52 }}>
          {/* aspect-ratio reserves the placard's space (all placards are 850×300) so the title
              does not jump down when the lazy image arrives */}
          <div
            style={{
              maxWidth: 400, aspectRatio: '85 / 30', borderRadius: radius.md, overflow: 'hidden',
              border: '1px solid var(--gold-border)', boxShadow: shadow[1], background: c.s2,
            }}
          >
            <RadiantOrderPlacard orderId={order.id} maxWidth={400} />
          </div>
        </div>

        <h2 id={titleId} style={{ ...titleText, fontSize: fs['2xl'] - 2, color: c.text, marginTop: 18 }}>
          {order.name}
        </h2>
        <ul aria-label="Potencias" style={{ listStyle: 'none', display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
          {order.surges.map((s) => (
            <li key={s} style={{ ...pill(t), fontSize: fs.sm, padding: '4px 12px 4px 8px' }}>
              <SurgeIcon surge={s} size={16} />
              {s}
            </li>
          ))}
        </ul>

        {/* Order motto. figcaption stays the figure's first child (valid HTML); the grid puts the
            ornament on the left and the caption above the quote. */}
        <figure
          style={{
            display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', columnGap: 12, rowGap: 4, alignItems: 'start',
            marginTop: 18, padding: '14px 16px', borderRadius: radius.md,
            background: t.bg, border: `1px solid ${t.border}`,
          }}
        >
          <figcaption style={{ ...eyebrow, color: t.fg, gridColumn: 2, gridRow: 1 }}>Ideal de la orden</figcaption>
          <CosmereIcon name="ornamento-cita" size={44} style={{ color: 'var(--gold-ornament)', gridColumn: 1, gridRow: '1 / span 2' }} />
          <blockquote style={{ gridColumn: 2, gridRow: 2, fontFamily: font.display, fontSize: fs.lg + 1, fontWeight: 600, fontStyle: 'italic', color: t.fg, lineHeight: 1.35 }}>
            "{order.ideal}"
          </blockquote>
        </figure>

        {/* Primer Ideal (universal) */}
        <figure
          style={{
            marginTop: 8, padding: '12px 16px', borderRadius: radius.md,
            background: 'color-mix(in srgb, var(--surface-1) 72%, transparent)', border: `1px solid ${c.border}`,
          }}
        >
          <figcaption style={{ ...eyebrow, marginBottom: 4 }}>Primer Ideal (universal)</figcaption>
          <blockquote style={{ fontFamily: font.display, fontSize: fs.md, fontStyle: 'italic', color: c.muted, lineHeight: 1.5 }}>
            "{PRIMER_IDEAL}"
          </blockquote>
        </figure>
      </div>

      {/* Body */}
      <div style={{ ...stack(24), padding: '24px 20px 0' }}>
        <section>
          <SectionTitle as="h3">Descripción de la orden</SectionTitle>
          <p style={{ fontFamily: font.display, fontSize: fs.md + 1, color: c.muted, lineHeight: 1.6 }}>
            {order.definition}
          </p>
        </section>

        <section>
          <SectionTitle as="h3">Spren vinculado</SectionTitle>
          <InfoList
            rows={[
              { label: 'Nombre', value: order.sprenName },
              { label: 'Forma', value: order.sprenForm },
              { label: 'Apariencia', value: order.sprenAppearance },
              { label: 'Comportamiento', value: order.sprenBehavior },
              { label: 'Filosofía', value: order.sprenPhilosophy },
            ]}
          />
        </section>

        <section>
          <SectionTitle as="h3">Personalidad e ideales</SectionTitle>
          <InfoList
            rows={[
              { label: 'Personalidad', value: order.personality },
              { label: 'Ideales', value: order.ideals },
            ]}
          />
        </section>

        {order.talentos.length > 0 && (
          <section>
            <SectionTitle as="h3">Árbol de talentos</SectionTitle>
            <div style={stack(6)}>
              {order.talentos.map((tal) => (
                <TalentoRow key={tal.name} talento={tal} />
              ))}
            </div>
          </section>
        )}

        {order.talentos.length === 0 && (
          <section>
            <SectionTitle as="h3">Árbol de talentos</SectionTitle>
            <p style={{ padding: '12px 16px', borderRadius: radius.md, background: c.s2, border: `1px solid ${c.border}`, fontSize: fs.base - 1, color: c.muted, lineHeight: 1.55 }}>
              Los Forjadores de Vínculos tienen reglas únicas. Solo pueden existir tres simultáneamente. Consulta el capítulo 5 del libro para sus reglas completas.
            </p>
          </section>
        )}
      </div>
    </>
  )
}

/**
 * Official order glyph in its identity colour. Same look as the shared RadiantOrderIcon, but the colour
 * goes through ink() so the glyph stays readable on the light "pergamino" paper too
 * (RadiantOrderIcon paints the raw data colour). Falls back to RadiantOrderIcon (placard crop).
 */
function OrderGlyph({ order, size }: { order: RadiantOrder; size: number }) {
  const glyph = `orden-${order.id}`
  if (!hasCosmereIcon(glyph)) return <RadiantOrderIcon orderId={order.id} size={size} decorative />
  return (
    <span
      aria-hidden
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: `radial-gradient(circle at 50% 35%, ${tint(order.color, 26)}, ${tint(order.color, 8)})`,
        boxShadow: `inset 0 0 0 1px ${tint(ink(order.color), 40)}`,
        color: ink(order.color),
      }}
    >
      <CosmereIcon name={glyph} size={Math.round(size * 0.62)} square />
    </span>
  )
}

// ── Order card ───────────────────────────────────────────────
function OrderCard({ order, onClick }: { order: RadiantOrder; onClick: () => void }) {
  const t = toneFrom(order.color)

  return (
    <button
      type="button"
      onClick={onClick}
      aria-haspopup="dialog"
      className="ui-card ui-card--interactive"
      style={{
        width: '100%', height: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 14px 14px 16px', minHeight: 84, textAlign: 'left', cursor: 'pointer',
        background: c.s1, border: `1px solid ${c.border}`, borderRadius: radius.lg, boxShadow: shadow[1],
        color: c.text, font: 'inherit',
      }}
    >
      <OrderGlyph order={order} size={48} />

      <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontFamily: font.display, fontSize: fs.lg, fontWeight: 600, lineHeight: 1.2, color: c.text }}>
          {order.name}
        </span>
        <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {order.surges.map((s) => (
            <span key={s} style={{ ...pill(t), padding: '2px 9px 2px 6px', gap: 5 }}>
              <SurgeIcon surge={s} size={14} />
              {s}
            </span>
          ))}
        </span>
      </span>

      <ChevronRight size={18} aria-hidden style={{ color: c.subtle }} />
    </button>
  )
}

// ── Main page ────────────────────────────────────────────────
export function RadiantOrdersPage() {
  const [selected, setSelected] = useState<RadiantOrder | null>(null)
  const [tab, setTab] = useState<TabId>('reglas')
  const sheetTitleId = useId()

  return (
    <div style={page}>
      <PageHeader
        title="Órdenes Radiantes"
        subtitle="Las diez órdenes de los Caballeros Radiantes: reglas de Investidura e ideales"
      />

      <Tabs tabs={TABS} value={tab} onChange={setTab} ariaLabel="Secciones de Órdenes Radiantes" idPrefix="radiant" style={{ marginBottom: 20 }} />

      {tab === 'reglas' && (
        <TabPanel idPrefix="radiant" id="reglas">
          <div style={stack(10)}>
            {RADIANT_REGLAS.map((r, i) => (
              <div key={r.id} className="rise" style={{ '--i': i } as CSSProperties}>
                <Disclosure title={r.title} summary={r.summary} headingLevel={2} accent="var(--amatista)">
                  <RuleDetails details={r.details} />
                </Disclosure>
              </div>
            ))}
          </div>
        </TabPanel>
      )}

      {tab === 'ordenes' && (
        <TabPanel idPrefix="radiant" id="ordenes">
          <ul
            aria-label="Órdenes"
            style={{
              listStyle: 'none', display: 'grid', gap: 10,
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 290px), 1fr))',
            }}
          >
            {RADIANT_ORDERS.map((order, i) => (
              <li key={order.id} className="rise" style={{ '--i': i } as CSSProperties}>
                <OrderCard order={order} onClick={() => setSelected(order)} />
              </li>
            ))}
          </ul>
        </TabPanel>
      )}

      <HeroSheet open={!!selected} onClose={() => setSelected(null)} labelledBy={sheetTitleId}>
        {selected && <OrderDetail order={selected} titleId={sheetTitleId} />}
      </HeroSheet>
    </div>
  )
}
