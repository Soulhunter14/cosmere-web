import { useState } from 'react'
import { X } from 'lucide-react'
import { SESSIONS, type Session, type MentionType } from '../../data/sessions'

// ── Mention colours ────────────────────────────────────────────────────────

const MENTION_STYLE: Record<MentionType, { color: string; bg: string; border: string }> = {
  pj:      { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.3)' },
  npc:     { color: '#fb923c', bg: 'rgba(251,146,60,0.12)',  border: 'rgba(251,146,60,0.3)'  },
  spren:   { color: '#34d399', bg: 'rgba(52,211,153,0.12)',  border: 'rgba(52,211,153,0.3)'  },
  faction: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)' },
  unknown: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)',  border: 'rgba(148,163,184,0.2)' },
}

// ── Body renderer ──────────────────────────────────────────────────────────

function renderBody(body: string) {
  // Split on [[...]] preserving the delimiters
  const parts = body.split(/(\[\[[^\]]+\]\])/g)

  return parts.map((part, i) => {
    const match = part.match(/^\[\[([^\]]+)\]\]$/)
    if (!match) {
      // Plain text — render paragraphs and bullet lists
      return part.split('\n').map((line, j) => {
        if (line.startsWith('- ')) {
          return <li key={`${i}-${j}`} style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginLeft: 4 }}>{line.slice(2)}</li>
        }
        if (line.trim() === '') return <br key={`${i}-${j}`} />
        return <span key={`${i}-${j}`}>{line}</span>
      })
    }

    // Wiki-link
    const raw = match[1].trim()
    const lower = raw.toLowerCase()
    let type: MentionType = 'unknown'
    let display = raw

    if (lower.startsWith('pj -')) { type = 'pj'; display = raw.replace(/^pj\s*-\s*/i, '') }
    else if (lower.startsWith('npc -')) { type = 'npc'; display = raw.replace(/^npc\s*-\s*/i, '') }
    else if (lower.startsWith('spren -')) { type = 'spren'; display = raw.replace(/^spren\s*-\s*/i, '') }
    else if (/^facci[oó]n\s*-/i.test(lower)) { type = 'faction'; display = raw.replace(/^facci[oó]n\s*-\s*/i, '') }

    const s = MENTION_STYLE[type]
    return (
      <span key={i} style={{
        display: 'inline',
        padding: '1px 6px', borderRadius: 10,
        background: s.bg, border: `1px solid ${s.border}`, color: s.color,
        fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap',
        lineHeight: 1.8,
      }}>
        {display}
      </span>
    )
  })
}

// ── Session detail sheet ───────────────────────────────────────────────────

function SessionSheet({ session, onClose }: { session: Session; onClose: () => void }) {
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
        paddingBottom: 'calc(24px + var(--sab, 0px))',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
        </div>

        {/* Header */}
        <div style={{ padding: '16px 20px 20px', borderBottom: '1px solid var(--border)', position: 'relative' }}>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 16, background: 'none', border: 'none', cursor: 'pointer', padding: 6, color: 'var(--text-subtle)', borderRadius: 8 }}
          >
            <X size={18} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingRight: 32 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(180,190,254,0.08)', border: '1px solid rgba(180,190,254,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 800, color: 'var(--brand-light)', letterSpacing: '-0.02em',
            }}>
              {String(session.number).padStart(2, '0')}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 3 }}>
                SESIÓN {session.number}
              </p>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                {session.title}
              </h2>
            </div>
          </div>

          {/* Participants */}
          {session.participants.length > 0 && (
            <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 14 }}>
              {session.participants.map((p) => (
                <span key={p} style={{
                  fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                  background: MENTION_STYLE.pj.bg, border: `1px solid ${MENTION_STYLE.pj.border}`,
                  color: MENTION_STYLE.pj.color,
                }}>
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 20px 0' }}>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
            {renderBody(session.body)}
          </p>
        </div>

        {/* Mention legend */}
        {session.mentions.length > 0 && (
          <div style={{ margin: '20px 20px 0', padding: '14px', borderRadius: 12, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 10 }}>
              EN ESTA SESIÓN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {(['pj', 'npc', 'spren', 'faction'] as MentionType[]).map((type) => {
                const items = session.mentions.filter(m => m.type === type)
                if (items.length === 0) return null
                const labels: Record<string, string> = { pj: 'Personajes', npc: 'NPCs', spren: 'Spren', faction: 'Facciones' }
                const s = MENTION_STYLE[type]
                return (
                  <div key={type} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: s.color, minWidth: 72, paddingTop: 1 }}>
                      {labels[type]}
                    </span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {items.map(m => (
                        <span key={m.raw} style={{
                          fontSize: 10, fontWeight: 600, padding: '1px 7px', borderRadius: 20,
                          background: s.bg, border: `1px solid ${s.border}`, color: s.color,
                        }}>
                          {m.display}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </>
  )
}

// ── Session card ───────────────────────────────────────────────────────────

function SessionCard({ session, onClick }: { session: Session; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  // Strip wiki-links from preview for clean display
  const cleanPreview = session.preview.replace(/\[\[([^\]]+)\]\]/g, (_, raw) => {
    return raw.replace(/^(pj|npc|spren|facci[oó]n)\s*-\s*/i, '').trim()
  })

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px',
        borderRadius: 14, textAlign: 'left', width: '100%',
        background: hovered ? 'rgba(180,190,254,0.04)' : 'var(--surface-1)',
        border: `1px solid ${hovered ? 'rgba(180,190,254,0.2)' : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all 0.15s',
        transform: hovered ? 'translateX(3px)' : 'none',
      }}
    >
      {/* Number badge */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        background: 'rgba(180,190,254,0.08)', border: '1px solid rgba(180,190,254,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 800, color: 'var(--brand-light)', letterSpacing: '-0.02em',
      }}>
        {String(session.number).padStart(2, '0')}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>
          {session.title}
        </div>

        {/* Participants */}
        {session.participants.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
            {session.participants.slice(0, 5).map((p) => (
              <span key={p} style={{
                fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 20,
                background: MENTION_STYLE.pj.bg, border: `1px solid ${MENTION_STYLE.pj.border}`,
                color: MENTION_STYLE.pj.color,
              }}>
                {p}
              </span>
            ))}
            {session.participants.length > 5 && (
              <span style={{ fontSize: 9, color: 'var(--text-subtle)', alignSelf: 'center' }}>
                +{session.participants.length - 5}
              </span>
            )}
          </div>
        )}

        <p style={{
          fontSize: 12, color: 'var(--text-subtle)', lineHeight: 1.5,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}>
          {cleanPreview}
        </p>
      </div>

      <div style={{ fontSize: 16, color: hovered ? 'var(--brand-light)' : 'var(--text-subtle)', flexShrink: 0, opacity: hovered ? 1 : 0.4, alignSelf: 'center' }}>›</div>
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export function DiarioPage() {
  const [selected, setSelected] = useState<Session | null>(null)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '20px 16px 48px' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text)', marginBottom: 4 }}>
        Diario de campaña
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        {SESSIONS.length} sesiones — Caminapiedras
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SESSIONS.map((s) => (
          <SessionCard key={s.slug} session={s} onClick={() => setSelected(s)} />
        ))}
      </div>

      {selected && <SessionSheet session={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
