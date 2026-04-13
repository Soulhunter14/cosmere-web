import { useState } from 'react'
import { X, Star } from 'lucide-react'
import { HEROIC_PATHS, type HeroicPath } from '../../data/heroicPaths'
import { TalentActivation } from '../../components/TalentActivation'

function PathDetailSheet({ path, onClose }: { path: HeroicPath; onClose: () => void }) {
  const [activeSpecialty, setActiveSpecialty] = useState(0)
  const specialty = path.specialties[activeSpecialty]

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
        maxHeight: '90vh',
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
          background: path.colorBg,
          borderBottom: `1px solid ${path.colorBorder}`,
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

          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', paddingRight: 32 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14, flexShrink: 0,
              background: path.colorBg, border: `2px solid ${path.colorBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24,
            }}>
              {path.icon}
            </div>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', marginBottom: 4 }}>
                {path.name}
              </h2>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: 'rgba(0,0,0,0.2)', border: `1px solid ${path.colorBorder}`,
                  color: path.color,
                }}>
                  <Star size={8} style={{ display: 'inline', marginRight: 3 }} />
                  Habilidad inicial: {path.initialSkill}
                </span>
              </div>
            </div>
          </div>

          {/* Main talent */}
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 10,
            background: 'rgba(0,0,0,0.2)', border: `1px solid ${path.colorBorder}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: path.color, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              Talento principal
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4 }}>{path.mainTalent}</div>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
              {path.mainTalentEffect}
            </p>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px 0', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Descripción */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: path.color, marginBottom: 8 }}>
              Descripción
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
              {path.definition}
            </p>
          </div>

          {/* Atributos y habilidades */}
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ flex: 1, padding: '12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Atributos</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {path.recommendedAttributes.map((a) => (
                  <span key={a} style={{ fontSize: 11, color: 'var(--text-muted)' }}>• {a}</span>
                ))}
              </div>
            </div>
            <div style={{ flex: 1.5, padding: '12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Habilidades clave</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {path.recommendedSkills.map((s) => (
                  <span key={s} style={{
                    fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 12,
                    background: path.colorBg, border: `1px solid ${path.colorBorder}`,
                    color: path.color,
                  }}>{s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Especialidades */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: path.color, marginBottom: 10 }}>
              Especialidades
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {path.specialties.map((s, i) => (
                <button
                  key={s.name}
                  onClick={() => setActiveSpecialty(i)}
                  style={{
                    flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                    cursor: 'pointer',
                    background: activeSpecialty === i ? path.colorBg : 'var(--surface-2)',
                    border: `1px solid ${activeSpecialty === i ? path.colorBorder : 'var(--border)'}`,
                    color: activeSpecialty === i ? path.color : 'var(--text-muted)',
                    transition: 'all 0.15s',
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>

            {/* Specialty content */}
            <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12, padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              {specialty.description}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {specialty.talentos.map((t) => (
                <div key={t.name} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <TalentActivation type={t.activation} compact />
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{t.name}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function PathCard({ path, onClick }: { path: HeroicPath; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px', borderRadius: 14, textAlign: 'left', width: '100%',
        background: hovered ? path.colorBg : 'var(--surface-1)',
        border: `1px solid ${hovered ? path.colorBorder : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all 0.15s',
        transform: hovered ? 'translateX(3px)' : 'none',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: path.colorBg, border: `1px solid ${path.colorBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20,
      }}>
        {path.icon}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{path.name}</div>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {path.specialties.map((s) => (
            <span key={s.name} style={{
              fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
              background: path.colorBg, border: `1px solid ${path.colorBorder}`,
              color: path.color,
            }}>
              {s.name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: hovered ? 1 : 0.4 }}>›</div>
    </button>
  )
}

export function HeroicPathsPage() {
  const [selected, setSelected] = useState<HeroicPath | null>(null)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 20px 48px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
        Caminos Heroicos
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Los seis caminos que definen las competencias mundanas de cada héroe en Roshar
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {HEROIC_PATHS.map((path) => (
          <PathCard key={path.id} path={path} onClick={() => setSelected(path)} />
        ))}
      </div>

      {selected && <PathDetailSheet path={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
