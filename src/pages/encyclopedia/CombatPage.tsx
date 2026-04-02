import { useState } from 'react'
import { COMBAT_ACTIONS, COMBAT_SECTIONS } from '../../data/combatRules'

const TABS = [
  { id: 'sections', label: 'Reglas' },
  { id: 'actions', label: 'Acciones' },
  { id: 'reactions', label: 'Reacciones' },
]

function ActionCard({ name, cost, description }: { name: string; cost: string; description: string }) {
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
        <div style={{
          fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, flexShrink: 0,
          background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.2)',
          color: 'var(--brand-light)',
        }}>
          {cost}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'white', flex: 1 }}>{name}</div>
        <div style={{ fontSize: 14, color: 'var(--text-subtle)', opacity: 0.6 }}>{open ? '▾' : '›'}</div>
      </div>
      {open && (
        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          {description}
        </div>
      )}
    </button>
  )
}

function SectionCard({ section }: { section: typeof COMBAT_SECTIONS[0] }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 16px', textAlign: 'left', width: '100%',
          background: 'var(--surface-1)', border: 'none',
          cursor: 'pointer',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 3 }}>{section.title}</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{section.summary}</div>
        </div>
        <div style={{ fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: 0.6, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }}>›</div>
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

export function CombatPage() {
  const [tab, setTab] = useState('sections')

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 48px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
        Combate
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
        Referencia rápida de reglas de combate del Archivo de las Tormentas
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

      {tab === 'sections' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMBAT_SECTIONS.map((s) => (
            <SectionCard key={s.id} section={s} />
          ))}
        </div>
      )}

      {tab === 'actions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
            Acciones estándar
          </div>
          {COMBAT_ACTIONS.actions.map((a) => (
            <ActionCard key={a.name} {...a} />
          ))}
          <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 8, marginBottom: 4 }}>
            Acciones gratuitas
          </div>
          {COMBAT_ACTIONS.freeActions.map((a) => (
            <ActionCard key={a.name} {...a} />
          ))}
        </div>
      )}

      {tab === 'reactions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: '0 0 12px', padding: '12px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            Las reacciones se activan en respuesta a un detonante específico. Solo puedes usar una reacción por detonante, aunque ciertos talentos pueden otorgarte reacciones adicionales.
          </p>
          {COMBAT_ACTIONS.reactions.map((a) => (
            <ActionCard key={a.name} {...a} />
          ))}
        </div>
      )}
    </div>
  )
}
