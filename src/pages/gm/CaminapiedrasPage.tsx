import { useState } from 'react'
import {
  BookOpen, Swords, Compass, MessageCircle, GitFork,
  Map, ChevronLeft, Users, Shield, Star, Heart,
  CheckSquare, Zap, Info,
} from 'lucide-react'
import { CHAPTERS, type AdventureChapter, type Scene, type Npc, type Combat, type AdventureMap, type SceneType, type NpcRole } from '../../data/caminapiedras'

// ── Helpers ───────────────────────────────────────────────────

const SCENE_META: Record<SceneType, { label: string; color: string; bg: string }> = {
  narrative: { label: 'Narrativa', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)' },
  social: { label: 'Social', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)' },
  exploration: { label: 'Exploración', color: '#34d399', bg: 'rgba(52,211,153,0.12)' },
  combat: { label: 'Combate', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  choice: { label: 'Decisión', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' },
}

function SceneIcon({ type, size = 14 }: { type: SceneType; size?: number }) {
  const color = SCENE_META[type].color
  if (type === 'narrative') return <BookOpen size={size} style={{ color }} />
  if (type === 'social') return <MessageCircle size={size} style={{ color }} />
  if (type === 'exploration') return <Compass size={size} style={{ color }} />
  if (type === 'combat') return <Swords size={size} style={{ color }} />
  return <GitFork size={size} style={{ color }} />
}

function NpcRoleIcon({ role, size = 14 }: { role: NpcRole; size?: number }) {
  if (role === 'ally') return <Heart size={size} style={{ color: '#34d399' }} />
  if (role === 'villain') return <Shield size={size} style={{ color: '#f87171' }} />
  if (role === 'special') return <Star size={size} style={{ color: '#fbbf24' }} />
  return <Users size={size} style={{ color: '#94a3b8' }} />
}

const NPC_ROLE_LABEL: Record<NpcRole, string> = {
  ally: 'Aliado', neutral: 'Neutral', villain: 'Antagonista', special: 'Especial',
}
const NPC_ROLE_COLOR: Record<NpcRole, string> = {
  ally: '#34d399', neutral: '#94a3b8', villain: '#f87171', special: '#fbbf24',
}

const CHAPTER_ACCENT = '#d97706'
const CHAPTER_BG = 'rgba(217,119,6,0.1)'
const CHAPTER_BORDER = 'rgba(217,119,6,0.3)'

// ── Scene card ────────────────────────────────────────────────
function SceneCard({ scene }: { scene: Scene }) {
  const [open, setOpen] = useState(false)
  const meta = SCENE_META[scene.type]

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
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <SceneIcon type={scene.type} size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 3 }}>{scene.title}</div>
          <span style={{
            fontSize: 9, fontWeight: 700, color: meta.color, textTransform: 'uppercase',
            letterSpacing: '0.06em', background: meta.bg, padding: '2px 6px', borderRadius: 6,
          }}>
            {meta.label}
          </span>
        </div>
        <div style={{
          fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: 0.6,
          transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s',
        }}>›</div>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>

          {/* Read aloud */}
          {scene.readAloud && (
            <div style={{
              marginTop: 12, padding: '12px 14px', borderRadius: 10,
              background: 'rgba(217,119,6,0.07)', border: `1px solid ${CHAPTER_BORDER}`,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: CHAPTER_ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Leer en voz alta
              </div>
              {scene.readAloud.split('\n\n').map((p, i) => (
                <p key={i} style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65, fontStyle: 'italic', margin: i > 0 ? '8px 0 0' : 0 }}>
                  {p}
                </p>
              ))}
            </div>
          )}

          {/* Content */}
          {scene.content.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scene.content.map((p, i) => (
                <div key={i} style={{ padding: '8px 12px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>{p}</p>
                </div>
              ))}
            </div>
          )}

          {/* Branches */}
          {scene.branches && scene.branches.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Caminos posibles
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {scene.branches.map((b, i) => (
                  <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', marginBottom: 4 }}>{b.label}</div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{b.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* DM tips */}
          {scene.tips && scene.tips.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Notas para la DJ
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {scene.tips.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 10px', borderRadius: 8, background: 'var(--surface-2)' }}>
                    <span style={{ color: CHAPTER_ACCENT, flexShrink: 0, marginTop: 1 }}>◆</span>
                    <p style={{ fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.5, margin: 0 }}>{t}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tables */}
          {scene.tables && scene.tables.map((table, ti) => (
            <div key={ti} style={{ marginTop: 10 }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                {table.title}
              </div>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                {table.entries.map((e, ei) => (
                  <div key={ei} style={{
                    display: 'flex', gap: 10, padding: '8px 12px',
                    background: ei % 2 === 0 ? 'var(--surface-2)' : 'var(--surface-1)',
                    borderBottom: ei < table.entries.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    {e.roll && (
                      <div style={{ fontSize: 10, fontWeight: 700, color: CHAPTER_ACCENT, flexShrink: 0, minWidth: 60 }}>{e.roll}</div>
                    )}
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{e.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── NPC card ──────────────────────────────────────────────────
function NpcCard({ npc }: { npc: Npc }) {
  const [open, setOpen] = useState(false)
  const roleColor = NPC_ROLE_COLOR[npc.role]

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', textAlign: 'left', width: '100%',
          background: 'var(--surface-1)', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: `${roleColor}14`, border: `1px solid ${roleColor}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <NpcRoleIcon role={npc.role} size={16} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{npc.name}</span>
            <span style={{ fontSize: 9, color: 'var(--text-subtle)' }}>{npc.pronouns}</span>
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <span style={{
              fontSize: 9, fontWeight: 700, color: roleColor, textTransform: 'uppercase',
              letterSpacing: '0.06em', background: `${roleColor}14`, padding: '1px 6px', borderRadius: 6,
            }}>
              {NPC_ROLE_LABEL[npc.role]}
            </span>
            <span style={{
              fontSize: 9, color: 'var(--text-subtle)', background: 'var(--surface-2)',
              padding: '1px 6px', borderRadius: 6,
            }}>
              {npc.type}
            </span>
          </div>
        </div>
        <div style={{
          fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: 0.6,
          transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s',
        }}>›</div>
      </button>

      {open && (
        <div style={{ padding: '0 14px 14px', background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>

            {/* Traits */}
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {npc.traits.map((t) => (
                <span key={t} style={{
                  fontSize: 10, color: 'var(--text-muted)', background: 'var(--surface-2)',
                  border: '1px solid var(--border)', padding: '2px 8px', borderRadius: 20,
                }}>
                  {t}
                </span>
              ))}
            </div>

            {/* Goal */}
            <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Meta</div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{npc.goal}</p>
            </div>

            {/* Appearance */}
            <div style={{ padding: '8px 10px', borderRadius: 8, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Aspecto</div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{npc.appearance}</p>
            </div>

            {/* Notes */}
            {npc.notes && (
              <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(217,119,6,0.06)', border: `1px solid ${CHAPTER_BORDER}` }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: CHAPTER_ACCENT, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Notas DJ</div>
                <p style={{ fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.5, margin: 0 }}>{npc.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Combat card ───────────────────────────────────────────────
function CombatCard({ combat }: { combat: Combat }) {
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
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: 'rgba(248,113,113,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Swords size={16} style={{ color: '#f87171' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'white', marginBottom: 4 }}>{combat.title}</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {combat.enemies.map((e, i) => (
              <span key={i} style={{
                fontSize: 9, fontWeight: 700, color: '#f87171',
                background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)',
                padding: '1px 6px', borderRadius: 6,
              }}>
                {e.count} {e.name}
              </span>
            ))}
            {combat.mapRef && (
              <span style={{
                fontSize: 9, color: 'var(--text-subtle)', background: 'var(--surface-2)',
                padding: '1px 6px', borderRadius: 6,
              }}>
                Mapa {combat.mapRef}
              </span>
            )}
          </div>
        </div>
        <div style={{
          fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: 0.6,
          transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s',
        }}>›</div>
      </button>

      {open && (
        <div style={{ padding: '0 16px 16px', background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 10 }}>

            {combat.duration && (
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                Duración: {combat.duration}
              </div>
            )}

            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Reglas especiales
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {combat.specialRules.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 10px', borderRadius: 8, background: 'var(--surface-2)' }}>
                    <span style={{ color: '#f87171', flexShrink: 0 }}>◆</span>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{r}</p>
                  </div>
                ))}
              </div>
            </div>

            {combat.rewards && (
              <div style={{ padding: '8px 10px', borderRadius: 8, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Recompensas</div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{combat.rewards}</p>
              </div>
            )}

            {combat.tables && combat.tables.map((table, ti) => (
              <div key={ti}>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  {table.title}
                </div>
                <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                  {table.entries.map((e, ei) => (
                    <div key={ei} style={{
                      display: 'flex', gap: 10, padding: '8px 12px',
                      background: ei % 2 === 0 ? 'var(--surface-2)' : 'var(--surface-1)',
                      borderBottom: ei < table.entries.length - 1 ? '1px solid var(--border)' : 'none',
                    }}>
                      {e.roll && <div style={{ fontSize: 10, fontWeight: 700, color: '#f87171', flexShrink: 0, minWidth: 60 }}>{e.roll}</div>}
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{e.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Map card ──────────────────────────────────────────────────
function MapCard({ map }: { map: AdventureMap }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px', textAlign: 'left', width: '100%',
          background: 'var(--surface-1)', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{
          width: 34, height: 34, borderRadius: 10, flexShrink: 0,
          background: 'rgba(96,165,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Map size={16} style={{ color: '#60a5fa' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 2 }}>Mapa {map.id}: {map.title}</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{map.scale}</span>
            {map.pdfPage && (
              <span style={{ fontSize: 9, color: '#60a5fa', background: 'rgba(96,165,250,0.1)', padding: '1px 5px', borderRadius: 4 }}>
                pág. {map.pdfPage}
              </span>
            )}
          </div>
        </div>
        <div style={{
          fontSize: 16, color: 'var(--text-subtle)', opacity: 0.6,
          transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s',
        }}>›</div>
      </button>

      {open && (
        <div style={{ background: 'var(--surface-1)', borderTop: '1px solid var(--border)' }}>

          {/* Map image */}
          {map.imagePath && (
            <div style={{ padding: '12px 14px 0' }}>
              <img
                src={map.imagePath}
                alt={map.title}
                style={{
                  width: '100%', borderRadius: 10,
                  border: '1px solid rgba(96,165,250,0.3)',
                  display: 'block',
                }}
              />
            </div>
          )}

          <div style={{ padding: '10px 14px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                Ubicaciones clave
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {map.locations.map((loc, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 8px', borderRadius: 7, background: 'var(--surface-2)' }}>
                    <span style={{ color: '#60a5fa', flexShrink: 0, fontSize: 10 }}>▸</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{loc}</span>
                  </div>
                ))}
              </div>
            </div>
            {map.notes && (
              <p style={{ fontSize: 11, color: 'var(--text-subtle)', fontStyle: 'italic', lineHeight: 1.5, margin: 0 }}>{map.notes}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Chapter detail ────────────────────────────────────────────
type DetailTab = 'resumen' | 'escenas' | 'pnjs' | 'combates'
const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'escenas', label: 'Escenas' },
  { id: 'pnjs', label: 'PNJs' },
  { id: 'combates', label: 'Combates' },
]

function ChapterDetail({ chapter, onBack }: { chapter: AdventureChapter; onBack: () => void }) {
  const [tab, setTab] = useState<DetailTab>('resumen')

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* Sticky header */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--bg)', borderBottom: '1px solid var(--border)',
        padding: '12px 20px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <button
            onClick={onBack}
            style={{
              display: 'flex', alignItems: 'center', gap: 4, padding: '5px 10px',
              borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-1)',
              cursor: 'pointer', color: 'var(--text-muted)', fontSize: 12, fontWeight: 600,
            }}
          >
            <ChevronLeft size={14} />
            Volver
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: CHAPTER_ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Capítulo {chapter.number}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {chapter.title}
            </div>
          </div>
          <div style={{
            padding: '4px 10px', borderRadius: 20, flexShrink: 0,
            background: CHAPTER_BG, border: `1px solid ${CHAPTER_BORDER}`,
            fontSize: 10, fontWeight: 700, color: CHAPTER_ACCENT,
          }}>
            Nv. {chapter.levelFrom}→{chapter.levelTo}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {DETAIL_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '8px 4px', border: 'none', background: 'transparent',
                cursor: 'pointer', fontSize: 11, fontWeight: 700,
                color: tab === t.id ? CHAPTER_ACCENT : 'var(--text-muted)',
                borderBottom: `2px solid ${tab === t.id ? CHAPTER_ACCENT : 'transparent'}`,
                transition: 'all 0.15s',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div style={{ padding: '20px 20px 48px' }}>

        {/* ── Resumen ── */}
        {tab === 'resumen' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Summary */}
            <div style={{ padding: '14px 16px', borderRadius: 14, background: CHAPTER_BG, border: `1px solid ${CHAPTER_BORDER}` }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{chapter.summary}</p>
            </div>

            {/* Background */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: CHAPTER_ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Trasfondo del capítulo
              </div>
              <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--surface-1)', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{chapter.background}</p>
              </div>
            </div>

            {/* Prep checklist */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: CHAPTER_ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Lista de verificación DJ
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {chapter.prepChecklist.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                    padding: '10px 12px', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--border)',
                  }}>
                    <CheckSquare size={14} style={{ color: CHAPTER_ACCENT, flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progression */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: CHAPTER_ACCENT, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Progresión de personajes
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {chapter.progressionItems.map((item, i) => {
                  const color = item.type === 'key' ? '#fbbf24' : item.type === 'spren' ? '#a78bfa' : 'var(--text-subtle)'
                  const Icon = item.type === 'key' ? Zap : item.type === 'spren' ? Star : Info
                  return (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'flex-start',
                      padding: '9px 12px', borderRadius: 10, background: 'var(--surface-1)', border: '1px solid var(--border)',
                    }}>
                      <Icon size={13} style={{ color, flexShrink: 0, marginTop: 1 }} />
                      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* PDF reference */}
            <div style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.5 }}>
              Páginas del libro: {chapter.pdfPages.from}–{chapter.pdfPages.to}
            </div>
          </div>
        )}

        {/* ── Escenas ── */}
        {tab === 'escenas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Legend */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 4 }}>
              {(Object.entries(SCENE_META) as [SceneType, typeof SCENE_META[SceneType]][]).map(([type, meta]) => (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <SceneIcon type={type} size={10} />
                  <span style={{ fontSize: 9, color: 'var(--text-subtle)' }}>{meta.label}</span>
                </div>
              ))}
            </div>
            {chapter.scenes.map((scene) => (
              <SceneCard key={scene.id} scene={scene} />
            ))}
          </div>
        )}

        {/* ── PNJs ── */}
        {tab === 'pnjs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* Group by role */}
            {(['special', 'ally', 'villain', 'neutral'] as NpcRole[]).map((role) => {
              const group = chapter.npcs.filter((n) => n.role === role)
              if (group.length === 0) return null
              return (
                <div key={role}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                    <NpcRoleIcon role={role} size={12} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: NPC_ROLE_COLOR[role], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      {NPC_ROLE_LABEL[role]}s
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {group.map((npc) => <NpcCard key={npc.name} npc={npc} />)}
                  </div>
                  <div style={{ height: 10 }} />
                </div>
              )
            })}
          </div>
        )}

        {/* ── Combates ── */}
        {tab === 'combates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Encuentros de combate
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chapter.combats.map((c) => <CombatCard key={c.id} combat={c} />)}
              </div>
            </div>

            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Mapas del capítulo
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {chapter.maps.map((m) => <MapCard key={m.id} map={m} />)}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

// ── Chapter list card ─────────────────────────────────────────
function ChapterCard({ chapter, onClick }: { chapter: AdventureChapter; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '16px 18px', borderRadius: 16, textAlign: 'left', width: '100%',
        background: hovered ? CHAPTER_BG : 'var(--surface-1)',
        border: `1px solid ${hovered ? CHAPTER_BORDER : 'var(--border)'}`,
        cursor: 'pointer', transition: 'all 0.15s',
        transform: hovered ? 'translateX(3px)' : 'none',
      }}
    >
      {/* Chapter number badge */}
      <div style={{
        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
        background: CHAPTER_BG, border: `1px solid ${CHAPTER_BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 16, fontWeight: 900, color: CHAPTER_ACCENT, letterSpacing: '-0.04em' }}>
          {String(chapter.number).padStart(2, '0')}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Title */}
        <div style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 4, letterSpacing: '-0.02em' }}>
          {chapter.title}
        </div>

        {/* Summary */}
        <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 8,
          overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
        }}>
          {chapter.summary}
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{
            fontSize: 9, fontWeight: 700, color: CHAPTER_ACCENT, textTransform: 'uppercase',
            letterSpacing: '0.06em', background: CHAPTER_BG, border: `1px solid ${CHAPTER_BORDER}`,
            padding: '2px 7px', borderRadius: 20,
          }}>
            Nv. {chapter.levelFrom}→{chapter.levelTo}
          </span>
          {[
            { icon: BookOpen, count: chapter.scenes.length, label: 'escenas' },
            { icon: Users, count: chapter.npcs.length, label: 'PNJs' },
            { icon: Swords, count: chapter.combats.length, label: 'combates' },
            { icon: Map, count: chapter.maps.length, label: 'mapas' },
          ].map(({ icon: Icon, count, label }) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, color: 'var(--text-subtle)' }}>
              <Icon size={9} />
              {count} {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 16, color: 'var(--text-subtle)', flexShrink: 0, opacity: hovered ? 1 : 0.4, alignSelf: 'center' }}>›</div>
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────
export function CaminapiedrasPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected = selectedId ? CHAPTERS.find((c) => c.id === selectedId) : null

  if (selected) {
    return <ChapterDetail chapter={selected} onBack={() => setSelectedId(null)} />
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 20px 48px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', marginBottom: 4 }}>
        Caminapiedras
      </h1>
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>
        Escenario de campaña — Guía para la Directora de Juego
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {CHAPTERS.map((chapter) => (
          <ChapterCard key={chapter.id} chapter={chapter} onClick={() => setSelectedId(chapter.id)} />
        ))}

        {/* Placeholder for upcoming chapters */}
        {[2, 3, 4, 5, 6, 7].map((n) => (
          <div key={n} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px', borderRadius: 16,
            background: 'var(--surface-1)', border: '1px solid var(--border)',
            opacity: 0.4,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'var(--surface-2)', border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-subtle)', letterSpacing: '-0.04em' }}>
                {String(n).padStart(2, '0')}
              </span>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-muted)' }}>Capítulo {n}</div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Próximamente</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
