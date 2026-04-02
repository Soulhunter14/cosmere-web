import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Save, X, Plus, Trash2, Play, Pause } from 'lucide-react'
import { sideQuestsApi } from '../../api/sidequests'
import { useCampaignStore } from '../../store/campaignStore'
import { Input, Textarea, Spinner } from '../../components/ui'
import type { SideQuest } from '../../types'

const empty: SideQuest = {
  id: 0, campaignId: 0, name: '', summary: '', description: '',
  acts: [], rewards: [], benefits: [], notes: '', started: false, createdAt: '',
}

type Tab = 'info' | 'acts' | 'extras'

export function SideQuestDetailPage() {
  const { campaignId, sideQuestId } = useParams<{ campaignId: string; sideQuestId: string }>()
  const cId = Number(campaignId), sqId = Number(sideQuestId)
  const qc = useQueryClient()
  const location = useLocation()
  const { isGm } = useCampaignStore()
  const [editing, setEditing] = useState(!!(location.state as any)?.editing)
  const [form, setForm] = useState<SideQuest>(empty)
  const [tab, setTab] = useState<Tab>('info')
  const [newAct, setNewAct] = useState('')
  const [newReward, setNewReward] = useState('')

  const { data: quest, isLoading } = useQuery<SideQuest>({
    queryKey: ['sidequest', cId, sqId],
    queryFn: () => sideQuestsApi.getById(cId, sqId),
  })

  useEffect(() => { if (quest) setForm({ ...quest }) }, [quest])

  const updateMutation = useMutation({
    mutationFn: () => sideQuestsApi.update(cId, sqId, form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sidequest', cId, sqId] }); setEditing(false) },
  })

  const toggleStarted = useMutation({
    mutationFn: () => sideQuestsApi.update(cId, sqId, { ...quest, started: !quest?.started }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sidequest', cId, sqId] }),
  })

  if (isLoading || !quest) return <Spinner />

  const f: SideQuest = editing ? form : quest

  const addAct = () => {
    if (!newAct.trim()) return
    setForm((p) => ({ ...p, acts: [...p.acts, newAct.trim()] }))
    setNewAct('')
  }

  const addReward = () => {
    if (!newReward.trim()) return
    setForm((p) => ({ ...p, rewards: [...p.rewards, newReward.trim()] }))
    setNewReward('')
  }

  // Hero gradient based on status
  const heroGradient = quest.started
    ? 'linear-gradient(135deg,#065f46,#0d9488)'
    : 'linear-gradient(135deg,#4c1d95,#6d28d9)'

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info', label: 'Info' },
    { key: 'acts', label: `Actos${quest.acts.length ? ` (${quest.acts.length})` : ''}` },
    { key: 'extras', label: 'Extras' },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Hero header ───────────────────────────────── */}
      <div style={{ background: heroGradient, padding: '28px 20px 20px', position: 'relative', overflow: 'hidden', transition: 'background 0.4s ease' }}>
        {/* Noise overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />

        <div style={{ position: 'relative' }}>
          {/* Top row: name + actions */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Status badge */}
              <div style={{ marginBottom: 8 }}>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' as const,
                  padding: '3px 9px', borderRadius: 20,
                  ...(quest.started
                    ? { background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }
                    : { background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.6)' })
                }}>
                  <span style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: quest.started ? '#34d399' : 'rgba(255,255,255,0.4)',
                    boxShadow: quest.started ? '0 0 6px rgba(52,211,153,0.8)' : 'none',
                  }} />
                  {quest.started ? 'Misión activa' : 'Pendiente'}
                </span>
              </div>

              {editing ? (
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  style={{
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 8, padding: '4px 10px', color: 'white',
                    fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em',
                    outline: 'none', width: '100%',
                  }}
                />
              ) : (
                <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.25 }}>
                  {quest.name}
                </h1>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {isGm && (
                <button
                  onClick={() => toggleStarted.mutate()}
                  title={quest.started ? 'Pausar misión' : 'Activar misión'}
                  style={{
                    display: 'flex', alignItems: 'center',
                    background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)',
                    color: quest.started ? '#34d399' : 'rgba(255,255,255,0.6)',
                    borderRadius: 9, padding: '6px 8px', cursor: 'pointer',
                  }}
                >
                  {quest.started ? <Pause size={13} /> : <Play size={13} />}
                </button>
              )}
              {isGm && (
                editing ? (
                  <>
                    <button
                      onClick={() => updateMutation.mutate()}
                      disabled={updateMutation.isPending}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.25)',
                        backdropFilter: 'blur(8px)', color: 'white', borderRadius: 9,
                        padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                      }}
                    >
                      <Save size={12} />
                      {updateMutation.isPending ? '...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => { setEditing(false); setForm({ ...quest }) }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)',
                        color: 'rgba(255,255,255,0.7)', borderRadius: 9, padding: '6px 8px', cursor: 'pointer',
                      }}
                    >
                      <X size={13} />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setForm({ ...quest }); setEditing(true) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                      backdropFilter: 'blur(8px)', color: 'white', borderRadius: 9,
                      padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                )
              )}
            </div>
          </div>

          {/* Summary preview */}
          {!editing && quest.summary && (
            <p style={{
              fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5,
              background: 'rgba(0,0,0,0.15)', borderRadius: 10, padding: '10px 12px',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              {quest.summary}
            </p>
          )}
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────── */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)',
        background: 'var(--surface-1)', position: 'sticky', top: 52, zIndex: 10,
      }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: '12px 8px', fontSize: 12, fontWeight: 600,
            color: tab === t.key ? 'var(--brand-light)' : 'var(--text-subtle)',
            background: 'none', border: 'none',
            borderBottom: tab === t.key ? '2px solid var(--brand-light)' : '2px solid transparent',
            cursor: 'pointer', transition: 'color 0.15s', letterSpacing: '0.01em',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────── */}
      <div style={{ padding: '20px 16px 48px' }}>

        {/* INFO TAB */}
        {tab === 'info' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'summary', label: 'Resumen', multiline: false },
              { key: 'description', label: 'Descripción', multiline: true },
            ].map(({ key, label, multiline }) => (
              <div key={key} style={{
                background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '14px 16px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {label.toUpperCase()}
                </div>
                {editing ? (
                  multiline
                    ? <Textarea rows={4} value={(form as any)[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={`${label}...`} />
                    : <Input value={(form as any)[key]} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} placeholder={`${label}...`} />
                ) : (
                  <p style={{ fontSize: 14, color: (f as any)[key] ? 'var(--text)' : 'var(--text-subtle)', lineHeight: 1.6 }}>
                    {(f as any)[key] || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ACTS TAB */}
        {tab === 'acts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {f.acts.length === 0 && !editing && (
              <div style={{ textAlign: 'center', padding: '32px 16px' }}>
                <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Sin actos definidos todavía.</p>
              </div>
            )}
            {f.acts.map((act, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '13px 14px',
              }}>
                <span style={{
                  fontSize: 11, fontWeight: 800, color: 'var(--brand-light)',
                  background: 'rgba(180,190,254,0.1)', border: '1px solid rgba(180,190,254,0.15)',
                  borderRadius: 7, width: 24, height: 24, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, marginTop: 1,
                }}>
                  {i + 1}
                </span>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.5, flex: 1 }}>{act}</p>
                {editing && (
                  <button
                    onClick={() => setForm((p) => ({ ...p, acts: p.acts.filter((_, idx) => idx !== i) }))}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: '3px',
                      color: 'var(--text-subtle)', display: 'flex', flexShrink: 0,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <Input
                  placeholder="Nuevo acto... (Enter para añadir)"
                  value={newAct}
                  onChange={(e) => setNewAct(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAct()}
                />
                <button
                  onClick={addAct}
                  disabled={!newAct.trim()}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
                    color: 'var(--text-muted)', borderRadius: 10, padding: '0 14px',
                    cursor: 'pointer', flexShrink: 0,
                  }}
                >
                  <Plus size={15} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* EXTRAS TAB */}
        {tab === 'extras' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Rewards */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 12 }}>
                RECOMPENSAS
              </div>
              {f.rewards.length === 0 && !editing && (
                <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Sin recompensas definidas.</p>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {f.rewards.map((r, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: '#fbbf24', fontSize: 14, flexShrink: 0 }}>✦</span>
                    <span style={{ fontSize: 14, color: 'var(--text)', flex: 1 }}>{r}</span>
                    {editing && (
                      <button
                        onClick={() => setForm((p) => ({ ...p, rewards: p.rewards.filter((_, idx) => idx !== i) }))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '3px', color: 'var(--text-subtle)', display: 'flex' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
                {editing && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <Input
                      placeholder="Nueva recompensa..."
                      value={newReward}
                      onChange={(e) => setNewReward(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addReward()}
                    />
                    <button
                      onClick={addReward}
                      disabled={!newReward.trim()}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'var(--surface-2)', border: '1px solid var(--border-bright)',
                        color: 'var(--text-muted)', borderRadius: 10, padding: '0 14px',
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* GM Notes */}
            {isGm && (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>
                  NOTAS DEL GM
                </div>
                {editing ? (
                  <Textarea rows={3} value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Notas privadas..." />
                ) : (
                  <p style={{ fontSize: 14, color: quest.notes ? 'var(--text)' : 'var(--text-subtle)', lineHeight: 1.6 }}>
                    {quest.notes || '—'}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
