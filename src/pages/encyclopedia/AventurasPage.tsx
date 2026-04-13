import { useState } from 'react'
import {
  ESCENAS_SECTIONS,
  DESCANSOS,
  ACTIVIDADES_REPOSO,
  SUCESOS_SECTIONS,
  ESTADOS,
  TIPOS_DANO,
  DURACION_LESIONES,
  EFECTOS_LESIONES,
  DANO_SECTIONS,
} from '../../data/aventuras'
import type { AventuraSection, Estado, ActividadReposo, TipoDano } from '../../data/aventuras'

const TABS = [
  { id: 'escenas', label: 'Escenas' },
  { id: 'reposo', label: 'Reposo' },
  { id: 'sucesos', label: 'Sucesos' },
  { id: 'estados', label: 'Estados' },
  { id: 'dano', label: 'Daño' },
]

function SectionCard({ section }: { section: AventuraSection }) {
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
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>{section.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{section.summary}</div>
        </div>
        <div style={{
          fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: 0.6,
          transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s',
        }}>›</div>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 12 }}>
            {section.details.map((d) => (
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

function EstadoCard({ estado }: { estado: Estado }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      onClick={() => setOpen(!open)}
      style={{
        display: 'flex', flexDirection: 'column',
        padding: '12px 14px', borderRadius: 12, textAlign: 'left', width: '100%',
        background: 'var(--surface-1)', border: '1px solid var(--border)',
        cursor: 'pointer', transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(180,190,254,0.25)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'white', flex: 1 }}>{estado.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', flex: 2, textAlign: 'left' }}>{estado.summary}</div>
        <div style={{ fontSize: 14, color: 'var(--text-subtle)', opacity: 0.6 }}>{open ? '▾' : '›'}</div>
      </div>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{estado.details}</div>
          {estado.special && (
            <div style={{ fontSize: 11, color: 'var(--brand-light)', lineHeight: 1.5, padding: '6px 10px', borderRadius: 8, background: 'rgba(180,190,254,0.06)', border: '1px solid rgba(180,190,254,0.12)' }}>
              {estado.special}
            </div>
          )}
        </div>
      )}
    </button>
  )
}

function ActividadCard({ actividad }: { actividad: ActividadReposo }) {
  const [open, setOpen] = useState(false)

  return (
    <button
      onClick={() => setOpen(!open)}
      style={{
        display: 'flex', flexDirection: 'column',
        padding: '12px 14px', borderRadius: 12, textAlign: 'left', width: '100%',
        background: 'var(--surface-1)', border: '1px solid var(--border)',
        cursor: 'pointer', transition: 'border-color 0.15s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(52,211,153,0.25)')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'white', flex: 1 }}>{actividad.name}</div>
        <div style={{ fontSize: 14, color: 'var(--text-subtle)', opacity: 0.6 }}>{open ? '▾' : '›'}</div>
      </div>
      {open && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Duración: <span style={{ fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none' }}>{actividad.duration}</span>
            </div>
            {actividad.cost !== '—' && (
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Coste: <span style={{ fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none' }}>{actividad.cost}</span>
              </div>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>{actividad.description}</div>
        </div>
      )}
    </button>
  )
}

function DamageTypeBadge({ tipo }: { tipo: TipoDano }) {
  const color = tipo.reducedByDesvio ? '#fb923c' : '#f87171'
  const bg = tipo.reducedByDesvio ? 'rgba(251,146,60,0.08)' : 'rgba(248,113,113,0.08)'
  const border = tipo.reducedByDesvio ? 'rgba(251,146,60,0.2)' : 'rgba(248,113,113,0.2)'

  return (
    <div style={{ padding: '10px 14px', borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{tipo.name}</div>
        <div style={{ fontSize: 9, fontWeight: 700, color, background: bg, border: `1px solid ${border}`, borderRadius: 6, padding: '2px 6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {tipo.reducedByDesvio ? 'desvío' : 'no desvío'}
        </div>
      </div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{tipo.description}</div>
    </div>
  )
}

export function AventurasPage() {
  const [tab, setTab] = useState('escenas')

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px 48px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
        Aventuras
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Reglas de escenas, descanso, sucesos, estados y daño
      </p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '7px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
              cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
              background: tab === t.id ? 'rgba(180,190,254,0.12)' : 'transparent',
              outline: `1px solid ${tab === t.id ? 'rgba(180,190,254,0.2)' : 'transparent'}`,
              color: tab === t.id ? 'var(--brand-light)' : 'var(--text-subtle)',
              transition: 'all 0.15s',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Escenas */}
      {tab === 'escenas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {ESCENAS_SECTIONS.map((s) => (
            <SectionCard key={s.id} section={s} />
          ))}
        </div>
      )}

      {/* Reposo */}
      {tab === 'reposo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Tipos de descanso
            </div>
            {DESCANSOS.map((s) => (
              <SectionCard key={s.id} section={s} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Actividades durante el reposo
            </div>
            {ACTIVIDADES_REPOSO.map((a) => (
              <ActividadCard key={a.name} actividad={a} />
            ))}
          </div>
        </div>
      )}

      {/* Sucesos */}
      {tab === 'sucesos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SUCESOS_SECTIONS.map((s) => (
            <SectionCard key={s.id} section={s} />
          ))}
        </div>
      )}

      {/* Estados */}
      {tab === 'estados' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 10px', padding: '12px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            Los estados son condiciones que afectan temporalmente a los personajes. Salvo indicación contraria, una instancia de un estado no puede aplicarse varias veces al mismo objetivo.
          </p>
          {ESTADOS.map((e) => (
            <EstadoCard key={e.name} estado={e} />
          ))}
        </div>
      )}

      {/* Daño */}
      {tab === 'dano' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Reglas de daño */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DANO_SECTIONS.map((s) => (
              <SectionCard key={s.id} section={s} />
            ))}
          </div>

          {/* Tipos de daño */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Tipos de daño
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {TIPOS_DANO.map((t) => (
                <DamageTypeBadge key={t.name} tipo={t} />
              ))}
            </div>
          </div>

          {/* Tabla duración lesiones */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Tabla de lesiones — duración (d20 + modificadores)
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--surface-2)', padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resultado</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Duración</div>
              </div>
              {DURACION_LESIONES.map((row, i) => {
                const isLast = i === DURACION_LESIONES.length - 1
                const rowColor = row.tipo === 'muerte' ? '#f87171' : row.tipo === 'permanente' ? '#fb923c' : row.tipo === 'grave' ? '#fbbf24' : row.tipo === 'leve' ? '#a78bfa' : 'var(--text-muted)'
                return (
                  <div
                    key={row.tirada}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      padding: '10px 14px', background: 'var(--surface-1)',
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: rowColor }}>{row.tirada}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{row.duracion}</div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Tabla efectos lesiones */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Tabla de lesiones — efectos (d8)
            </div>
            <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 1fr', background: 'var(--surface-2)', padding: '8px 14px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>d8</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Efecto</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Narrativa</div>
              </div>
              {EFECTOS_LESIONES.map((row, i) => {
                const isLast = i === EFECTOS_LESIONES.length - 1
                return (
                  <div
                    key={row.d8}
                    style={{
                      display: 'grid', gridTemplateColumns: '40px 1fr 1fr',
                      padding: '10px 14px', background: 'var(--surface-1)',
                      borderBottom: isLast ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand-light)' }}>{row.d8}</div>
                    <div style={{ fontSize: 12, color: 'white', fontWeight: 600 }}>{row.efecto}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{row.narrativa}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
