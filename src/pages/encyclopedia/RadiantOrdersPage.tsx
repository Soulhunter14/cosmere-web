import { useState } from 'react'
import { X, Zap } from 'lucide-react'
import { RADIANT_ORDERS, PRIMER_IDEAL, type RadiantOrder } from '../../data/radiantOrders'
import { RadiantOrderIcon, RadiantOrderPlacard } from '../../components/RadiantOrderIcon'

// ── Detail sheet ─────────────────────────────────────────────
function OrderDetailSheet({ order, onClose }: { order: RadiantOrder; onClose: () => void }) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 61,
        background: 'var(--surface-1)',
        borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border-bright)',
        borderBottom: 'none',
        maxHeight: '88vh',
        overflowY: 'auto',
        padding: `0 0 calc(24px + var(--sab, 0px))`,
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
        </div>

        {/* Hero header */}
        <div style={{
          padding: '20px 20px 24px',
          background: order.colorBg,
          borderBottom: `1px solid ${order.colorBorder}`,
          position: 'relative',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 6, color: 'var(--text-subtle)', borderRadius: 8,
            }}
          >
            <X size={18} />
          </button>

          <RadiantOrderPlacard orderId={order.id} maxWidth={400} />

          <div style={{ marginTop: 14 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 8 }}>
              {order.name}
            </h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {order.surges.map((s) => (
                <span key={s} style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: order.colorBg, border: `1px solid ${order.colorBorder}`,
                  color: order.color,
                }}>
                  <Zap size={8} style={{ display: 'inline', marginRight: 3 }} />{s}
                </span>
              ))}
            </div>
          </div>

          {/* Order motto */}
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 10,
            background: order.colorBg, border: `1px solid ${order.colorBorder}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: order.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Ideal de la orden
            </div>
            <p style={{ fontSize: 15, fontWeight: 800, fontStyle: 'italic', color: order.color, lineHeight: 1.4, margin: 0 }}>
              "{order.ideal}"
            </p>
          </div>

          {/* Primer Ideal (universal) */}
          <div style={{
            marginTop: 8, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(0,0,0,0.2)', border: `1px solid rgba(255,255,255,0.08)`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Primer Ideal (universal)
            </div>
            <p style={{ fontSize: 12, fontStyle: 'italic', color: 'var(--text-subtle)', lineHeight: 1.5, margin: 0 }}>
              "{PRIMER_IDEAL}"
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Descripción */}
          <Section label="Descripción de la orden" color={order.color}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {order.definition}
            </p>
          </Section>

          {/* Spren */}
          <Section label="Spren vinculado" color={order.color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <InfoRow label="Nombre" value={order.sprenName} />
              <InfoRow label="Forma" value={order.sprenForm} />
              <InfoRow label="Apariencia" value={order.sprenAppearance} />
              <InfoRow label="Comportamiento" value={order.sprenBehavior} />
              <InfoRow label="Filosofía" value={order.sprenPhilosophy} />
            </div>
          </Section>

          {/* Personalidad e ideales */}
          <Section label="Personalidad e ideales" color={order.color}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <InfoRow label="Personalidad" value={order.personality} />
              <InfoRow label="Ideales" value={order.ideals} />
            </div>
          </Section>
        </div>
      </div>
    </>
  )
}

function Section({ label, color, children }: { label: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
        color, marginBottom: 10,
      }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      padding: '10px 12px', borderRadius: 10,
      background: 'var(--surface-2)', border: '1px solid var(--border)',
    }}>
      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{value}</div>
    </div>
  )
}

// ── Order card ───────────────────────────────────────────────
function OrderCard({ order, onClick }: { order: RadiantOrder; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 14, textAlign: 'left', width: '100%',
        background: hovered ? order.colorBg : 'var(--surface-1)',
        border: `1px solid ${hovered ? order.colorBorder : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all 0.15s',
        transform: hovered ? 'translateX(3px)' : 'none',
      }}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 11, flexShrink: 0,
        background: order.colorBg, border: `1px solid ${order.colorBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: order.color,
      }}>
        <RadiantOrderIcon orderId={order.id} size={22} />
      </div>

      {/* Name + surges */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{order.name}</div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {order.surges.map((s) => (
            <span key={s} style={{
              fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
              background: order.colorBg, border: `1px solid ${order.colorBorder}`,
              color: order.color,
            }}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Chevron */}
      <div style={{ fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: hovered ? 1 : 0.4 }}>›</div>
    </button>
  )
}

// ── Main page ────────────────────────────────────────────────
export function RadiantOrdersPage() {
  const [selected, setSelected] = useState<RadiantOrder | null>(null)

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 48px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
        Órdenes Radiantes
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Las diez órdenes de los Caballeros Radiantes
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {RADIANT_ORDERS.map((order) => (
          <OrderCard key={order.id} order={order} onClick={() => setSelected(order)} />
        ))}
      </div>

      {selected && <OrderDetailSheet order={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
