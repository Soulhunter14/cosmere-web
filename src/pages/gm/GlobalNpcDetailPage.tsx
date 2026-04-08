import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Save, X } from 'lucide-react'
import { globalNpcsApi } from '../../api/global-npcs'
import { useCampaignStore } from '../../store/campaignStore'
import { Input, Spinner } from '../../components/ui'
import type { GlobalNpc } from '../../types'

const SECTIONS = [
  {
    key: 'fisico', label: 'Físico', color: '#f87171', colorBg: 'rgba(248,113,113,0.08)', colorBorder: 'rgba(248,113,113,0.2)',
    attrs: [['fuerza', 'FUE'], ['velocidad', 'VEL']] as [string, string][],
    skills: [
      ['agilidad', 'Agilidad', 'velocidad', 'VEL'],
      ['armasLigeras', 'Armas ligeras', 'velocidad', 'VEL'],
      ['armasPesadas', 'Armas pesadas', 'fuerza', 'FUE'],
      ['atletismo', 'Atletismo', 'fuerza', 'FUE'],
      ['hurto', 'Hurto', 'velocidad', 'VEL'],
      ['sigilo', 'Sigilo', 'velocidad', 'VEL'],
    ] as [string, string, string, string][],
  },
  {
    key: 'cognitivo', label: 'Cognitivo', color: '#60a5fa', colorBg: 'rgba(96,165,250,0.08)', colorBorder: 'rgba(96,165,250,0.2)',
    attrs: [['intelecto', 'INT'], ['discernimiento', 'DIS']] as [string, string][],
    skills: [
      ['deduccion', 'Deducción', 'intelecto', 'INT'],
      ['disciplina', 'Disciplina', 'discernimiento', 'DIS'],
      ['intimidacion', 'Intimidación', 'discernimiento', 'DIS'],
      ['manufactura', 'Manufactura', 'intelecto', 'INT'],
      ['medicina', 'Medicina', 'intelecto', 'INT'],
      ['conocimiento', 'Conocimiento', 'intelecto', 'INT'],
    ] as [string, string, string, string][],
  },
  {
    key: 'espiritual', label: 'Espiritual', color: '#a78bfa', colorBg: 'rgba(167,139,250,0.08)', colorBorder: 'rgba(167,139,250,0.2)',
    attrs: [['voluntad', 'VOL'], ['presencia', 'PRE']] as [string, string][],
    skills: [
      ['engano', 'Engaño', 'presencia', 'PRE'],
      ['liderazgo', 'Liderazgo', 'presencia', 'PRE'],
      ['percepcion', 'Percepción', 'discernimiento', 'DIS'],
      ['perspicacia', 'Perspicacia', 'discernimiento', 'DIS'],
      ['persuasion', 'Persuasión', 'presencia', 'PRE'],
      ['supervivencia', 'Supervivencia', 'voluntad', 'VOL'],
    ] as [string, string, string, string][],
  },
]

const TEXT_FIELDS: [string, string][] = [
  ['apariencia', 'Apariencia'],
  ['notas', 'Notas'],
]

type Tab = 'stats' | 'lore'

export function GlobalNpcDetailPage() {
  const { campaignId, npcId } = useParams<{ campaignId: string; npcId: string }>()
  const id = Number(npcId)
  const qc = useQueryClient()
  const location = useLocation()
  const { isGm } = useCampaignStore()
  const [editing, setEditing] = useState(!!(location.state as any)?.editing)
  const [form, setForm] = useState<GlobalNpc | null>(null)
  const [tab, setTab] = useState<Tab>('stats')

  const { data: npc, isLoading } = useQuery<GlobalNpc>({
    queryKey: ['global-npc', id],
    queryFn: () => globalNpcsApi.getById(id),
  })

  useEffect(() => { if (npc) setForm({ ...npc }) }, [npc])

  const updateMutation = useMutation({
    mutationFn: () => globalNpcsApi.update(id, form ?? {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['global-npc', id] }); qc.invalidateQueries({ queryKey: ['global-npcs'] }); setEditing(false) },
  })

  if (isLoading || !npc) return <Spinner />

  const f = (editing && form ? form : npc) as GlobalNpc
  const set = (k: keyof GlobalNpc) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => p ? { ...p, [k]: e.target.type === 'number' ? Number((e.target as HTMLInputElement).value) : e.target.value } : p)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(135deg,#7f1d1d,#991b1b)',
        padding: '28px 20px 20px', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.1, mixBlendMode: 'overlay', pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>

            {/* Avatar */}
            <div style={{
              width: 64, height: 64, borderRadius: 16, flexShrink: 0,
              background: npc.imageUrl ? 'transparent' : 'rgba(0,0,0,0.25)',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, fontWeight: 800, color: 'white',
              overflow: 'hidden',
            }}>
              {npc.imageUrl
                ? <img src={npc.imageUrl} alt={npc.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : npc.name[0].toUpperCase()
              }
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, marginBottom: 4 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                  {editing
                    ? <input value={form?.name ?? ''} onChange={(e) => setForm((p) => p ? { ...p, name: e.target.value } : p)}
                        style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, padding: '2px 8px', color: 'white', fontSize: 20, fontWeight: 800, outline: 'none', width: 180 }} />
                    : npc.name}
                </h1>
                {(f.tipo || editing) && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#fca5a5', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20, padding: '2px 8px', whiteSpace: 'nowrap' as const }}>
                    {editing
                      ? <input value={form?.tipo ?? ''} onChange={(e) => setForm((p) => p ? { ...p, tipo: e.target.value } : p)} placeholder="Tipo..." style={{ background: 'transparent', border: 'none', color: '#fca5a5', fontSize: 10, fontWeight: 700, width: 120, outline: 'none' }} />
                      : f.tipo}
                  </span>
                )}
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                {editing
                  ? <input value={form?.source ?? ''} onChange={(e) => setForm((p) => p ? { ...p, source: e.target.value } : p)} placeholder="Fuente..." style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 12, outline: 'none', width: 140 }} />
                  : f.source || 'Adversario'}
                {(f.ascendencia || editing) && ' · '}
                {editing
                  ? <input value={form?.ascendencia ?? ''} onChange={(e) => setForm((p) => p ? { ...p, ascendencia: e.target.value } : p)} placeholder="Ascendencia..." style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.55)', fontSize: 12, outline: 'none', width: 120 }} />
                  : f.ascendencia}
              </p>
            </div>
          </div>

          {/* Edit/Save actions */}
          {isGm && (
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button onClick={() => { setForm({ ...npc }); setEditing(false) }} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                    <X size={15} />
                  </button>
                  <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 10, padding: '8px 14px', cursor: 'pointer', color: 'white', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Save size={13} /> {updateMutation.isPending ? 'Guardando...' : 'Guardar'}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditing(true)} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 10, padding: '8px 10px', cursor: 'pointer', color: 'white', display: 'flex' }}>
                  <Edit2 size={15} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Resources row */}
        <div style={{ position: 'relative', display: 'flex', gap: 12, marginTop: 16 }}>
          {[
            { label: 'SALUD', key: 'maxHealth', color: 'linear-gradient(90deg,#f43f5e,#fb7185)' },
            { label: 'CONCENTRACIÓN', key: 'maxConcentration', color: 'linear-gradient(90deg,#3b82f6,#60a5fa)' },
            { label: 'INVESTIDURA', key: 'maxInvestiture', color: 'linear-gradient(90deg,#7c3aed,#a78bfa)' },
          ].map(({ label, key, color }) => (
            <div key={key} style={{ flex: 1, background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '8px 10px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
              {editing
                ? <Input type="number" min={0} value={(form as any)?.[key] ?? 0} onChange={set(key as keyof GlobalNpc)} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: 20, fontWeight: 800, padding: 0, width: '100%' }} />
                : <div style={{ fontSize: 20, fontWeight: 800, color: 'white' }}>{(f as any)[key] ?? 0}</div>
              }
              <div style={{ height: 3, borderRadius: 3, background: 'rgba(255,255,255,0.12)', marginTop: 4 }}>
                <div style={{ height: '100%', borderRadius: 3, background: color, width: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '14px 16px 0', borderBottom: '1px solid var(--border)' }}>
        {(['stats', 'lore'] as Tab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '7px 16px', borderRadius: '10px 10px 0 0', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
            background: tab === t ? 'var(--surface-1)' : 'transparent',
            color: tab === t ? '#f87171' : 'var(--text-subtle)',
            borderBottom: tab === t ? '2px solid #f87171' : '2px solid transparent',
          }}>
            {t === 'stats' ? 'Stats' : 'Lore'}
          </button>
        ))}
      </div>

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* STATS TAB */}
        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {SECTIONS.map((section) => {
              const defense = 10 + ((f as any)[section.attrs[0][0]] ?? 0) + ((f as any)[section.attrs[1][0]] ?? 0)
              return (
                <div key={section.key} style={{ background: 'var(--surface-1)', border: `1px solid ${section.colorBorder}`, borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: section.colorBg, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: section.color, letterSpacing: '0.1em' }}>{section.label.toUpperCase()}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)' }}>Def. <span style={{ color: section.color }}>{defense}</span></span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, padding: '12px 14px', borderBottom: `1px solid ${section.colorBorder}` }}>
                    {section.attrs.map(([k, label]) => (
                      <div key={k} style={{ textAlign: 'center' }}>
                        {editing
                          ? <Input type="number" min={0} max={5} value={(form as any)?.[k] ?? 0} onChange={set(k as keyof GlobalNpc)} style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, padding: '4px' }} />
                          : <div style={{ fontSize: 26, fontWeight: 800, color: 'white', lineHeight: 1 }}>{(f as any)[k] ?? 0}</div>
                        }
                        <div style={{ fontSize: 9, fontWeight: 700, color: section.color, marginTop: 4, letterSpacing: '0.08em' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {section.skills.map(([k, label, attrKey, attrLabel], idx) => {
                      const base = (f as any)[k] ?? 0
                      const bonus = (f as any)[attrKey] ?? 0
                      const total = base + bonus
                      const pct = Math.min(100, (base / 5) * 100)
                      return (
                        <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderTop: idx === 0 ? 'none' : '1px solid var(--border)' }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: section.color, background: section.colorBg, border: `1px solid ${section.colorBorder}`, borderRadius: 4, padding: '2px 5px', flexShrink: 0 }}>{attrLabel}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, flex: 1, minWidth: 0 }}>{label}</span>
                          {editing
                            ? <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                <Input type="number" min={0} max={10} value={base} onChange={set(k as keyof GlobalNpc)} style={{ width: 52, padding: '3px 6px', textAlign: 'center', fontSize: 13 }} />
                                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>+{bonus}</span>
                              </div>
                            : <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <div style={{ width: 50, height: 3, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                  <div style={{ height: '100%', borderRadius: 4, background: section.color, width: `${pct}%` }} />
                                </div>
                                <span style={{ fontSize: 11, color: 'var(--text-subtle)', minWidth: 28, textAlign: 'right' }}>{base}+{bonus}</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: total > 0 ? 'white' : 'var(--text-subtle)', minWidth: 20, textAlign: 'right' }}>{total}</span>
                              </div>
                          }
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {/* Talentos (traits) */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.06)', borderBottom: '1px solid rgba(251,191,36,0.15)' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.1em' }}>TALENTOS</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                {editing
                  ? <textarea
                      value={form?.talentos ?? ''}
                      onChange={(e) => setForm((p) => p ? { ...p, talentos: e.target.value } : p)}
                      placeholder="Rasgos especiales del adversario..."
                      rows={4}
                      style={{
                        width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 13,
                        resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const, lineHeight: 1.6,
                      }}
                    />
                  : <p style={{ fontSize: 13, color: f.talentos ? 'var(--text)' : 'var(--text-subtle)', lineHeight: 1.6, whiteSpace: 'pre-line' as const }}>
                      {f.talentos || '—'}
                    </p>
                }
              </div>
            </div>
          </div>
        )}

        {/* LORE TAB */}
        {tab === 'lore' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {TEXT_FIELDS.map(([k, label]) => (
              <div key={k} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {label.toUpperCase()}
                </div>
                {editing
                  ? <textarea
                      value={(form as any)?.[k] ?? ''}
                      onChange={(e) => setForm((p) => p ? { ...p, [k]: e.target.value } : p)}
                      placeholder={`${label}...`}
                      rows={4}
                      style={{
                        width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)',
                        borderRadius: 8, padding: '10px 12px', color: 'var(--text)', fontSize: 13,
                        resize: 'vertical' as const, outline: 'none', boxSizing: 'border-box' as const, lineHeight: 1.6,
                      }}
                    />
                  : (() => {
                      const text: string = (f as any)[k] || ''
                      if (!text) return <p style={{ fontSize: 14, color: 'var(--text-subtle)', lineHeight: 1.5 }}>—</p>
                      const paragraphs = text.split('\n').filter((line: string) => line.trim() !== '')
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {paragraphs.map((para: string, i: number) => (
                            <p key={i} style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.65, margin: 0, paddingLeft: 10, borderLeft: '2px solid var(--border)', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                              {para}
                            </p>
                          ))}
                        </div>
                      )
                    })()
                }
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
