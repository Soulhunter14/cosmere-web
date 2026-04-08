import { useState } from 'react'
import { POTENCIAS, POTENCIAS_REGLAS } from '../../data/potencias'
import type { Potencia, Talento, PotenciaRegla } from '../../data/potencias'
import { TalentActivation } from '../../components/TalentActivation'

const TABS = [
  { id: 'reglas', label: 'Reglas' },
  { id: 'potencias', label: 'Potencias' },
]

const ATRIBUTO_COLOR: Record<string, string> = {
  Velocidad: '#60a5fa',
  Presencia: '#c084fc',
  Voluntad: '#f87171',
  Intelecto: '#fb923c',
  Discernimiento: '#34d399',
  Fuerza: '#fbbf24',
}

function ReglaCard({ regla }: { regla: PotenciaRegla }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', textAlign: 'left', width: '100%',
          background: 'var(--surface-1)', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>{regla.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{regla.summary}</div>
        </div>
        <div style={{
          fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: 0.6,
          transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s',
        }}>›</div>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
            {regla.details.map((d) => (
              <div key={d.label} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                  {d.label}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{d.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function TalentoRow({ talento }: { talento: Talento }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      onClick={() => setOpen(!open)}
      style={{
        display: 'flex', flexDirection: 'column',
        padding: '10px 12px', borderRadius: 10, textAlign: 'left', width: '100%',
        background: 'var(--surface-2)', border: '1px solid var(--border)',
        cursor: 'pointer', transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(180,190,254,0.25)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TalentActivation type={talento.cost} compact />
        <div style={{ fontSize: 12, fontWeight: 700, color: 'white', flex: 1 }}>{talento.name}</div>
        <div style={{ fontSize: 13, color: 'var(--text-subtle)', opacity: 0.6 }}>{open ? '▾' : '›'}</div>
      </div>
      {open && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {talento.prereq && (
            <div style={{ fontSize: 10, color: 'var(--text-subtle)', fontStyle: 'italic' }}>
              Prerrequisito: {talento.prereq}
            </div>
          )}
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {talento.description}
          </div>
        </div>
      )}
    </button>
  )
}

function PotenciaCard({ potencia }: { potencia: Potencia }) {
  const [open, setOpen] = useState(false)
  const color = ATRIBUTO_COLOR[potencia.atributo] ?? 'var(--brand-light)'
  const bg = `${color}14`
  const border = `${color}30`

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '14px 16px', textAlign: 'left', width: '100%',
          background: 'var(--surface-1)', border: 'none', cursor: 'pointer',
        }}
      >
        {/* Attribute pill */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
          flexShrink: 0, paddingTop: 2,
        }}>
          <div style={{
            padding: '3px 8px', borderRadius: 8,
            background: bg, border: `1px solid ${border}`,
            fontSize: 9, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
          }}>
            {potencia.atributo}
          </div>
          <TalentActivation type={potencia.costoBase} compact />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 3 }}>{potencia.name}</div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginBottom: 4 }}>
            {potencia.ordenes.join(' · ')}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{potencia.descripcion}</div>
        </div>

        <div style={{
          fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: 0.6,
          transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s',
        }}>›</div>
      </button>

      {/* Talents */}
      {open && (
        <div style={{ padding: '0 16px 16px', background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 0 8px' }}>
            Talentos
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {potencia.talentos.map((t) => (
              <TalentoRow key={t.name} talento={t} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function PotenciasPage() {
  const [tab, setTab] = useState('reglas')

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 48px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
        Potencias
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Las diez potencias Radiantes: reglas de infusión, escalado y talentos
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, padding: '4px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '8px', borderRadius: 9, fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
              background: tab === t.id ? 'var(--surface-3)' : 'transparent',
              border: `1px solid ${tab === t.id ? 'var(--border-bright)' : 'transparent'}`,
              color: tab === t.id ? 'white' : 'var(--text-muted)',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Reglas */}
      {tab === 'reglas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {POTENCIAS_REGLAS.map((r) => (
            <ReglaCard key={r.id} regla={r} />
          ))}

          {/* Scaling table */}
          <div style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Tabla de escalado de potencias
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 60px 1fr', background: 'var(--surface-2)', padding: '8px 14px', borderBottom: '1px solid var(--border)', gap: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Grados</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Dado</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tamaño máximo</div>
              </div>
              {[
                { g: '1', d: 'd4', t: 'Pequeño (0,75 m)' },
                { g: '2', d: 'd6', t: 'Mediano (1,5 m)' },
                { g: '3', d: 'd8', t: 'Grande (3 m)' },
                { g: '4', d: 'd10', t: 'Enorme (4,5 m)' },
                { g: '5', d: 'd12', t: 'Gargantuesco (6 m)' },
              ].map((row, i, arr) => (
                <div key={row.g} style={{
                  display: 'grid', gridTemplateColumns: '60px 60px 1fr',
                  padding: '10px 14px', background: 'var(--surface-1)',
                  borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  gap: 8,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--brand-light)' }}>{row.g}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{row.d}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.t}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Note about Transportación */}
          <div style={{ marginTop: 4, padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.5 }}>
            La décima potencia, <strong style={{ color: 'var(--text-muted)' }}>Transportación</strong> (Intelecto) — usada por Nominadores de lo Otro y Escultores de Voluntad — no está incluida en esta versión. Consúltala en el libro a partir de la página 240.
          </div>
        </div>
      )}

      {/* Potencias */}
      {tab === 'potencias' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {POTENCIAS.map((p) => (
            <PotenciaCard key={p.id} potencia={p} />
          ))}
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--text-muted)' }}>Transportación</strong> (Intelecto) — Nominador de lo Otro, Escultor de Voluntad — pendiente de añadir (pág. 240+).
          </div>
        </div>
      )}
    </div>
  )
}
