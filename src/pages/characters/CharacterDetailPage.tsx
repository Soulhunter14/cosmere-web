import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Save, X, Heart, ChevronDown } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { useCampaignStore } from '../../store/campaignStore'
import { useAuthStore } from '../../store/authStore'
import { Input, Spinner } from '../../components/ui'
import type { Character, UpdateCharacterRequest } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { POTENCIAS } from '../../data/potencias'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'

interface PickerOption { id: string; label: string; sublabel?: string; color: string; colorBg: string; colorBorder: string; icon?: string }

function BottomSheetPicker({ title, options, value, onChange, onClose }: {
  title: string
  options: PickerOption[]
  value: string
  onChange: (id: string) => void
  onClose: () => void
}) {
  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      />
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
        background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border-bright)', borderBottom: 'none',
        maxHeight: '70vh', display: 'flex', flexDirection: 'column',
        paddingBottom: 'calc(16px + var(--sab, 0px))',
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px', flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{title}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)' }}>
            <X size={18} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={() => { onChange(''); onClose() }}
            style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
              borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%',
              background: value === '' ? 'rgba(255,255,255,0.05)' : 'var(--surface-2)',
              border: `1px solid ${value === '' ? 'rgba(255,255,255,0.15)' : 'var(--border)'}`,
              color: 'var(--text-subtle)', fontSize: 13,
            }}
          >
            — Sin selección —
          </button>
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { onChange(opt.id); onClose() }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
                borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%',
                background: value === opt.id ? opt.colorBg : 'var(--surface-2)',
                border: `1px solid ${value === opt.id ? opt.colorBorder : 'var(--border)'}`,
                color: value === opt.id ? opt.color : 'var(--text)',
              }}
            >
              {opt.icon && <span style={{ fontSize: 18, flexShrink: 0 }}>{opt.icon}</span>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{opt.label}</div>
                {opt.sublabel && <div style={{ fontSize: 11, opacity: 0.65, marginTop: 1 }}>{opt.sublabel}</div>}
              </div>
              {value === opt.id && <span style={{ fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#6366f1)',
  'linear-gradient(135deg,#0e7490,#0284c7)',
  'linear-gradient(135deg,#9d174d,#be185d)',
  'linear-gradient(135deg,#065f46,#0d9488)',
  'linear-gradient(135deg,#92400e,#b45309)',
  'linear-gradient(135deg,#4c1d95,#7c3aed)',
]

const ATTR_MAP: Record<string, string> = {
  VEL: 'velocidad', FUE: 'fuerza', INT: 'intelecto',
  VOL: 'voluntad', PRE: 'presencia', DIS: 'discernimiento',
}
const ATRIBUTO_CODE: Record<string, string> = {
  'Velocidad': 'VEL', 'Fuerza': 'FUE', 'Intelecto': 'INT',
  'Voluntad': 'VOL', 'Presencia': 'PRE', 'Discernimiento': 'DIS',
}
// Primary and secondary slots per attribute code (no cross-section fallback)
const ATRIBUTO_SLOTS: Record<string, [number, number]> = {
  VEL: [1, 4], FUE: [1, 4], INT: [2, 5], VOL: [2, 5], DIS: [3, 6], PRE: [3, 6],
}


const SECTIONS = [
  {
    key: 'fisico', label: 'Físico',
    color: '#fb7185', colorBg: 'rgba(251,113,133,0.08)', colorBorder: 'rgba(251,113,133,0.25)',
    attrs: [['fuerza', 'FUE'], ['velocidad', 'VEL']] as [string, string][],
    defense: (c: Character) => 10 + c.fuerza + c.velocidad,
    skills: [
      ['agilidad',    'Agilidad',     'velocidad', 'VEL'],
      ['armasLigeras','Armas Ligeras','velocidad', 'VEL'],
      ['armasPesadas','Armas Pesadas','fuerza',    'FUE'],
      ['atletismo',   'Atletismo',    'velocidad', 'VEL'],
      ['hurto',       'Hurto',        'velocidad', 'VEL'],
      ['sigilo',      'Sigilo',       'velocidad', 'VEL'],
    ] as [string, string, string, string][],
    customNs: [1, 4] as [number, number],
  },
  {
    key: 'cognitivo', label: 'Cognitivo',
    color: '#60a5fa', colorBg: 'rgba(96,165,250,0.08)', colorBorder: 'rgba(96,165,250,0.25)',
    attrs: [['intelecto', 'INT'], ['voluntad', 'VOL']] as [string, string][],
    defense: (c: Character) => 10 + c.intelecto + c.voluntad,
    skills: [
      ['deduccion',   'Deducción',   'intelecto', 'INT'],
      ['disciplina',  'Disciplina',  'voluntad',  'VOL'],
      ['intimidacion','Intimidación','voluntad',  'VOL'],
      ['manufactura', 'Manufactura', 'intelecto', 'INT'],
      ['medicina',    'Medicina',    'intelecto', 'INT'],
      ['conocimiento','Conocimiento','intelecto', 'INT'],
    ] as [string, string, string, string][],
    customNs: [2, 5] as [number, number],
  },
  {
    key: 'espiritual', label: 'Espiritual',
    color: '#a78bfa', colorBg: 'rgba(167,139,250,0.08)', colorBorder: 'rgba(167,139,250,0.25)',
    attrs: [['discernimiento', 'DIS'], ['presencia', 'PRE']] as [string, string][],
    defense: (c: Character) => 10 + c.discernimiento + c.presencia,
    skills: [
      ['engano',      'Engaño',      'presencia',      'PRE'],
      ['liderazgo',   'Liderazgo',   'presencia',      'PRE'],
      ['percepcion',  'Percepción',  'discernimiento', 'DIS'],
      ['perspicacia', 'Perspicacia', 'discernimiento', 'DIS'],
      ['persuasion',  'Persuasión',  'presencia',      'PRE'],
      ['supervivencia','Supervivencia','discernimiento','DIS'],
    ] as [string, string, string, string][],
    customNs: [3, 6] as [number, number],
  },
]

const BACKGROUND_FIELDS = [
  ['proposito', 'Propósito'], ['obstaculo', 'Obstáculo'],
  ['apariencia', 'Apariencia'], ['notas', 'Notas'],
]

type Tab = 'stats' | 'background'

export function CharacterDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId), chId = Number(characterId)
  const qc = useQueryClient()
  const location = useLocation()
  const { isGm, currentCampaign } = useCampaignStore()
  const { user: currentUser } = useAuthStore()
  const [editing, setEditing] = useState(!!(location.state as any)?.editing)
  const [form, setForm] = useState<Character | null>(null)
  const [tab, setTab] = useState<Tab>('stats')
  const [picker, setPicker] = useState<'heroico' | 'radiante' | 'ascendencia' | null>(null)

  const { data: char, isLoading } = useQuery<Character>({
    queryKey: ['character', cId, chId],
    queryFn: () => charactersApi.getById(cId, chId),
  })

  useEffect(() => { if (char) setForm({ ...char }) }, [char])
  const updateMutation = useMutation({
    mutationFn: () => charactersApi.update(cId, chId, (form ?? char) as UpdateCharacterRequest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['character', cId, chId] })
      setEditing(false)
    },
  })

  if (isLoading || !char) return <Spinner />

  const isOwner = char.ownerId === currentUser?.id
  const canEdit = isGm || isOwner

  const f = (editing && form ? form : char) as Character
  const set = (k: keyof UpdateCharacterRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => prev ? { ...prev, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value } : prev)

  const gradient = AVATAR_GRADIENTS[char.id % AVATAR_GRADIENTS.length]

  const radiantOrder = RADIANT_ORDERS.find((o) => o.id === f.caminoRadiante)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stats', label: 'Stats' },
    { key: 'background', label: 'Trasfondo' },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Hero header ───────────────────────────────── */}
      <div style={{
        background: gradient,
        padding: '28px 20px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Noise overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 0 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                  {editing && isGm ? (
                    <input
                      value={form?.name ?? ''}
                      onChange={set('name')}
                      style={{
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 8, padding: '2px 8px', color: 'white',
                        fontSize: 20, fontWeight: 800, letterSpacing: '-0.03em',
                        outline: 'none', width: '100%', maxWidth: 180,
                      }}
                    />
                  ) : char.name}
                </h1>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'white',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                }}>
                  {editing ? (
                    <>Nv. <input
                      type="number" min={1} max={20}
                      value={form?.level ?? 1}
                      onChange={set('level')}
                      style={{
                        background: 'transparent', border: 'none', color: 'white',
                        fontSize: 10, fontWeight: 700, width: 28, outline: 'none',
                      }}
                    /></>
                  ) : `Nv. ${char.level}`}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#fbbf24',
                  background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
                  borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap',
                }}>
                  {`Rango ${Math.ceil((editing ? (form?.level ?? 1) : char.level) / 5)}`}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginTop: 3, lineHeight: 1.4 }}>
                {char.ascendencia || 'Sin ascendencia'} · {
                  (currentCampaign as any)?.members?.find((m: any) => m.userId === char.ownerId)?.displayName
                  || char.playerName
                  || 'Sin jugador'
                }
              </p>
            </div>
          </div>

          {/* Edit / Save buttons */}
          {canEdit && (
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
              {editing ? (
                <>
                  <button
                    onClick={() => updateMutation.mutate()}
                    disabled={updateMutation.isPending}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5,
                      background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(8px)',
                      color: 'white', borderRadius: 9, padding: '6px 14px',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <Save size={12} />
                    {updateMutation.isPending ? '...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setForm({ ...char }) }}
                    style={{
                      display: 'flex', alignItems: 'center',
                      background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)',
                      color: 'rgba(255,255,255,0.7)', borderRadius: 9, padding: '6px 8px',
                      cursor: 'pointer',
                    }}
                  >
                    <X size={13} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setForm({ ...char }); setEditing(true) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)',
                    color: 'white', borderRadius: 9, padding: '6px 14px',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Edit2 size={12} />
                  Editar
                </button>
              )}
            </div>
          )}
        </div>

        {/* HP & Mana bars */}
        <div style={{
          display: 'flex', gap: 16, marginTop: 20,
          background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '12px 14px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {editing ? (
            <div style={{ display: 'flex', flex: 1, gap: 10, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 70 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginBottom: 4, fontWeight: 600 }}>HP Máx</div>
                <Input
                  type="number" min={0}
                  value={form?.maxHealth ?? 0}
                  onChange={set('maxHealth')}
                  style={{ padding: '4px 8px', fontSize: 13, textAlign: 'center' }}
                />
              </div>
            </div>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Heart size={14} style={{ color: '#fb7185', flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>SALUD</span>
              <span style={{ marginLeft: 'auto', fontSize: 20, fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums' }}>
                {f.maxHealth}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tab bar ───────────────────────────────────── */}
      <div style={{
        display: 'flex', borderBottom: '1px solid var(--border)',
        background: 'var(--surface-1)',
        position: 'sticky', top: 52, zIndex: 10,
      }}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '12px 8px',
              fontSize: 12, fontWeight: 600,
              color: tab === t.key ? 'var(--brand-light)' : 'var(--text-subtle)',
              background: 'none', border: 'none',
              borderBottom: tab === t.key ? '2px solid var(--brand-light)' : '2px solid transparent',
              cursor: 'pointer', transition: 'color 0.15s',
              letterSpacing: '0.01em',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ──────────────────────────────── */}
      <div style={{ padding: '20px 16px 48px' }}>

        {/* STATS TAB */}
        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Identity grid — Ascendencia · Camino Heroico · Camino Radiante */}
            {(() => {
              const ASCENDENCIAS = [
                { id: 'Humano', label: 'Humano', color: '#94a3b8', colorBg: 'rgba(148,163,184,0.1)', colorBorder: 'rgba(148,163,184,0.3)' },
                { id: 'Oyente', label: 'Oyente', color: '#a78bfa', colorBg: 'rgba(167,139,250,0.1)', colorBorder: 'rgba(167,139,250,0.3)' },
              ]
              const asc = ASCENDENCIAS.find((a) => a.id === f.ascendencia)
              const path = HEROIC_PATHS.find((p) => p.id === f.caminoHeroico)
              const order = RADIANT_ORDERS.find((o) => o.id === f.caminoRadiante)

              const cardStyle = () => ({
                background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '12px 14px',
                display: 'flex', flexDirection: 'column' as const, gap: 6,
              })

              return (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>

                  {/* Ascendencia */}
                  {editing ? (
                    <button onClick={() => setPicker('ascendencia')} style={{
                      ...cardStyle(), cursor: 'pointer', textAlign: 'left',
                      background: asc ? asc.colorBg : 'var(--surface-1)',
                      border: `1px solid ${asc ? asc.colorBorder : 'var(--border)'}`,
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>ASCENDENCIA</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: asc ? asc.color : 'var(--text-subtle)' }}>
                        {asc ? asc.label : '—'}
                      </div>
                      <ChevronDown size={11} style={{ color: 'var(--text-subtle)', opacity: 0.6, marginTop: 'auto' }} />
                    </button>
                  ) : (
                    <div style={cardStyle()}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>ASCENDENCIA</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: asc ? asc.color : 'var(--text-subtle)' }}>
                        {asc ? asc.label : '—'}
                      </div>
                    </div>
                  )}

                  {/* Camino Heroico */}
                  {editing && isGm ? (
                    <button onClick={() => setPicker('heroico')} style={{
                      ...cardStyle(), cursor: 'pointer', textAlign: 'left',
                      background: path ? path.colorBg : 'var(--surface-1)',
                      border: `1px solid ${path ? path.colorBorder : 'var(--border)'}`,
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>CAMINO</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: path ? path.color : 'var(--text-subtle)' }}>
                        {path ? <span>{path.icon} {path.name}</span> : '—'}
                      </div>
                      <ChevronDown size={11} style={{ color: 'var(--text-subtle)', opacity: 0.6, marginTop: 'auto' }} />
                    </button>
                  ) : (
                    <div style={cardStyle()}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>CAMINO</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: path ? path.color : 'var(--text-subtle)' }}>
                        {path ? <span>{path.icon} {path.name}</span> : '—'}
                      </div>
                    </div>
                  )}

                  {/* Camino Radiante */}
                  {editing && isGm ? (
                    <button onClick={() => setPicker('radiante')} style={{
                      ...cardStyle(), cursor: 'pointer', textAlign: 'left',
                      background: order ? order.colorBg : 'var(--surface-1)',
                      border: `1px solid ${order ? order.colorBorder : 'var(--border)'}`,
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>ORDEN</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: order ? order.color : 'var(--text-subtle)' }}>
                        {order ? <><RadiantOrderIcon orderId={order.id} size={12} />{order.name}</> : '—'}
                      </div>
                      <ChevronDown size={11} style={{ color: 'var(--text-subtle)', opacity: 0.6, marginTop: 'auto' }} />
                    </button>
                  ) : (
                    <div style={cardStyle()}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>ORDEN</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 700, color: order ? order.color : 'var(--text-subtle)' }}>
                        {order ? <><RadiantOrderIcon orderId={order.id} size={12} />{order.name}</> : '—'}
                      </div>
                    </div>
                  )}

                </div>
              )
            })()}

            {/* Concentración + Investidura + Desvío — one row */}
            {(() => {
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  {/* Concentración */}
                  {[
                    { maxKey: 'maxConcentration', label: 'Concentración', color: '#fb923c' },
                    { maxKey: 'maxInvestiture',   label: 'Investidura',   color: '#a78bfa' },
                  ].map(({ maxKey, label, color }) => (
                    <div key={maxKey} style={{
                      background: 'var(--surface-1)', border: '1px solid var(--border)',
                      borderRadius: 14, padding: '12px 14px',
                    }}>
                      <div style={{ marginBottom: 8 }}>
                        <span style={{ fontSize: 9, color: 'var(--text-subtle)', fontWeight: 700, letterSpacing: '0.06em' }}>
                          {label.toUpperCase()}
                        </span>
                      </div>
                      {editing ? (
                        <Input type="number" min={0} value={(form as any)?.[maxKey] ?? 0}
                          onChange={set(maxKey as keyof UpdateCharacterRequest)}
                          style={{ padding: '4px 6px', fontSize: 14, fontWeight: 700, textAlign: 'center', width: '100%' }} />
                      ) : (
                        <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>
                          {(f as any)[maxKey] ?? 0}
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Desvío */}
                  <div style={{
                    background: 'var(--surface-1)', border: '1px solid var(--border)',
                    borderRadius: 14, padding: '12px 14px',
                  }}>
                    <div style={{ marginBottom: 8 }}>
                      <span style={{ fontSize: 9, color: 'var(--text-subtle)', fontWeight: 700, letterSpacing: '0.06em' }}>DESVÍO</span>
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#fbbf24', lineHeight: 1 }}>
                      {f.desvio ?? 0}
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Movimiento + Dado de recuperación + Alcance de sentidos */}
            {(() => {
              const vel = f.velocidad ?? 0
              const vol = f.voluntad ?? 0
              const dis = f.discernimiento ?? 0
              const movimiento = vel === 0 ? '6 m' : vel <= 2 ? '7,5 m' : vel <= 4 ? '9 m' : vel <= 6 ? '12 m' : vel <= 8 ? '18 m' : '24 m'
              const dadoRec    = vol === 0 ? '1d4'  : vol <= 2 ? '1d6'  : vol <= 4 ? '1d8'  : vol <= 6 ? '1d10' : vol <= 8 ? '1d12' : '1d20'
              const alcance    = dis === 0 ? '1,5 m' : dis <= 2 ? '3 m' : dis <= 4 ? '6 m' : dis <= 6 ? '15 m' : dis <= 8 ? '30 m' : 'Sin límite'
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 9, color: 'var(--text-subtle)', fontWeight: 700, letterSpacing: '0.06em' }}>MOVIMIENTO</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#34d399', lineHeight: 1 }}>{movimiento}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-subtle)', marginTop: 4 }}>por acción · VEL {vel}</div>
                  </div>
                  <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 9, color: 'var(--text-subtle)', fontWeight: 700, letterSpacing: '0.06em' }}>DADO DE RECUPERACIÓN</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#c084fc', lineHeight: 1 }}>{dadoRec}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-subtle)', marginTop: 4 }}>VOL {vol}</div>
                  </div>
                  <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '12px 14px' }}>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 9, color: 'var(--text-subtle)', fontWeight: 700, letterSpacing: '0.06em' }}>ALCANCE SENTIDOS</span>
                    </div>
                    <div style={{ fontSize: dis >= 9 ? 12 : 18, fontWeight: 800, color: '#38bdf8', lineHeight: 1 }}>{alcance}</div>
                    <div style={{ fontSize: 9, color: 'var(--text-subtle)', marginTop: 4 }}>DIS {dis}</div>
                  </div>
                </div>
              )
            })()}

            {/* Físico / Cognitivo / Espiritual sections */}
            {SECTIONS.map((section) => {
              const defValue = section.defense(f)

              return (
                <div key={section.key} style={{
                  background: 'var(--surface-1)',
                  border: `1px solid ${section.colorBorder}`,
                  borderRadius: 16, overflow: 'hidden',
                }}>
                  {/* Section header */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px',
                    background: section.colorBg,
                    borderBottom: `1px solid ${section.colorBorder}`,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: section.color, letterSpacing: '0.08em' }}>
                      {section.label.toUpperCase()}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.06em' }}>DEFENSA</span>
                      <span style={{
                        fontSize: 15, fontWeight: 800, color: section.color,
                        background: 'rgba(0,0,0,0.2)', borderRadius: 8, padding: '2px 10px',
                        border: `1px solid ${section.colorBorder}`,
                      }}>{defValue}</span>
                    </div>
                  </div>

                  {/* Attributes row */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: 1, borderBottom: `1px solid var(--border)`,
                    background: 'var(--border)',
                  }}>
                    {section.attrs.map(([k, label]) => (
                      <div key={k} style={{ background: 'var(--surface-1)', padding: '10px 14px', textAlign: 'center' }}>
                        {editing ? (
                          <Input
                            type="number" min={0} max={5}
                            value={(form as any)?.[k] ?? 0}
                            onChange={set(k as keyof UpdateCharacterRequest)}
                            style={{ textAlign: 'center', fontSize: 20, fontWeight: 800, padding: '4px' }}
                          />
                        ) : (
                          <div style={{ fontSize: 26, fontWeight: 800, color: 'white', lineHeight: 1 }}>
                            {(f as any)[k] ?? 0}
                          </div>
                        )}
                        <div style={{ fontSize: 9, fontWeight: 700, color: section.color, marginTop: 4, letterSpacing: '0.08em' }}>
                          {label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Skills list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {section.skills.map(([k, label, attrKey2, attrLabel], idx) => {
                      const base = (f as any)[k] ?? 0
                      const bonus = (f as any)[attrKey2] ?? 0
                      const total = base + bonus
                      const pct = Math.min(100, (base / 5) * 100)
                      return (
                        <div key={k} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 14px',
                          borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
                        }}>
                          <span style={{
                            fontSize: 9, fontWeight: 700, color: section.color,
                            background: section.colorBg, border: `1px solid ${section.colorBorder}`,
                            borderRadius: 4, padding: '2px 5px', flexShrink: 0, letterSpacing: '0.04em',
                          }}>
                            {attrLabel}
                          </span>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, flex: 1, minWidth: 0 }}>
                            {label}
                          </span>
                          {editing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              <Input
                                type="number" min={0} max={10}
                                value={base}
                                onChange={set(k as keyof UpdateCharacterRequest)}
                                style={{ width: 52, padding: '3px 6px', textAlign: 'center', fontSize: 13 }}
                              />
                              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>+{bonus}</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <div style={{ width: 50, height: 3, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 4, background: section.color, width: `${pct}%` }} />
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-subtle)', minWidth: 28, textAlign: 'right' }}>
                                {base}+{bonus}
                              </span>
                              <span style={{
                                fontSize: 14, fontWeight: 700,
                                color: total > 0 ? 'white' : 'var(--text-subtle)',
                                minWidth: 20, textAlign: 'right',
                              }}>
                                {total}
                              </span>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Custom skills for this section (slots n1 and n2) */}
                    {section.customNs.map((n) => {
                      const nameKey = `habilidadPersonalizada${n}` as keyof typeof f
                      const valorKey = `habilidadPersonalizada${n}Valor` as keyof typeof f
                      const attrKey = `habilidadPersonalizada${n}Atributo` as keyof typeof f
                      const customName = (f as any)[nameKey] as string
                      const customBase = (f as any)[valorKey] as number ?? 0
                      const customAttrCode = ((f as any)[attrKey] as string ?? '').toUpperCase()
                      const customBonus = customAttrCode && ATTR_MAP[customAttrCode] ? (f as any)[ATTR_MAP[customAttrCode]] ?? 0 : 0
                      const customTotal = customBase + customBonus
                      const isPotencia = !!radiantOrder?.surges.includes(customName)

                      if (!editing && !customName) return null

                      return (
                        <div key={n} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '8px 14px',
                          borderTop: `1px dashed ${section.colorBorder}`,
                        }}>
                          {editing ? (
                            <>
                              {isPotencia ? (
                                <span style={{
                                  fontSize: 9, fontWeight: 700, color: section.color, flexShrink: 0,
                                  background: section.colorBg, border: `1px solid ${section.colorBorder}`,
                                  borderRadius: 4, padding: '2px 5px',
                                }}>{customAttrCode}</span>
                              ) : (
                                <select
                                  value={(form as any)?.[attrKey] ?? ''}
                                  onChange={(e) => setForm((prev) => prev ? { ...prev, [attrKey]: e.target.value } : prev)}
                                  style={{
                                    fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', flexShrink: 0,
                                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                                    borderRadius: 4, padding: '2px 4px', cursor: 'pointer',
                                  }}
                                >
                                  <option value="">—</option>
                                  {['VEL','FUE','INT','VOL','PRE','DIS'].map((a) => <option key={a} value={a}>{a}</option>)}
                                </select>
                              )}
                              {isPotencia ? (
                                <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{customName}</span>
                              ) : (
                                <Input
                                  value={(form as any)?.[nameKey] ?? ''}
                                  onChange={(e) => setForm((prev) => prev ? { ...prev, [nameKey]: e.target.value } : prev)}
                                  placeholder="Habilidad personalizada..."
                                  style={{ flex: 1, fontSize: 13 }}
                                />
                              )}
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                <Input
                                  type="number" min={0} max={10}
                                  value={customBase}
                                  onChange={set(valorKey as keyof UpdateCharacterRequest)}
                                  style={{ width: 52, padding: '3px 6px', textAlign: 'center', fontSize: 13 }}
                                />
                                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>+{customBonus}</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <span style={{
                                fontSize: 9, fontWeight: 700, color: section.color,
                                background: section.colorBg, border: `1px solid ${section.colorBorder}`,
                                borderRadius: 4, padding: '2px 5px', flexShrink: 0,
                              }}>
                                {customAttrCode || '—'}
                              </span>
                              <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, flex: 1 }}>{customName}</span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{customBase}+{customBonus}</span>
                                <span style={{ fontSize: 14, fontWeight: 700, color: customTotal > 0 ? 'white' : 'var(--text-subtle)', minWidth: 20, textAlign: 'right' }}>
                                  {customTotal}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* BACKGROUND TAB */}
        {tab === 'background' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {!editing && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setForm({ ...char }); setEditing(true) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'transparent', border: '1px solid var(--border-bright)',
                    color: 'var(--text-subtle)', borderRadius: 8, padding: '5px 12px',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--brand-light)'; e.currentTarget.style.borderColor = 'rgba(180,190,254,0.4)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-subtle)'; e.currentTarget.style.borderColor = 'var(--border-bright)' }}
                >
                  <Edit2 size={11} />
                  Editar trasfondo
                </button>
              </div>
            )}
            {BACKGROUND_FIELDS.map(([k, label]) => (
              <div key={k} style={{
                background: 'var(--surface-1)', border: '1px solid var(--border)',
                borderRadius: 14, padding: '14px 16px',
              }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {label.toUpperCase()}
                </div>
                {editing ? (
                  <Input
                    value={(form as any)?.[k] ?? ''}
                    onChange={set(k as keyof UpdateCharacterRequest)}
                    placeholder={`${label}...`}
                  />
                ) : (
                  <p style={{ fontSize: 14, color: (f as any)[k] ? 'var(--text)' : 'var(--text-subtle)', lineHeight: 1.5 }}>
                    {(f as any)[k] || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Path pickers */}
      {picker === 'ascendencia' && (
        <BottomSheetPicker
          title="Ascendencia"
          value={form?.ascendencia ?? ''}
          options={[
            { id: 'Humano', label: 'Humano', color: '#94a3b8', colorBg: 'rgba(148,163,184,0.1)', colorBorder: 'rgba(148,163,184,0.3)' },
            { id: 'Oyente', label: 'Oyente', color: '#a78bfa', colorBg: 'rgba(167,139,250,0.1)', colorBorder: 'rgba(167,139,250,0.3)' },
          ]}
          onChange={(id) => setForm((prev) => prev ? { ...prev, ascendencia: id } : prev)}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'heroico' && (
        <BottomSheetPicker
          title="Camino Heroico"
          value={form?.caminoHeroico ?? ''}
          options={HEROIC_PATHS.map((p) => ({
            id: p.id, label: p.name, color: p.color, colorBg: p.colorBg, colorBorder: p.colorBorder, icon: p.icon,
          }))}
          onChange={(id) => {
            const oldPath = HEROIC_PATHS.find((p) => p.id === (form?.caminoHeroico ?? char.caminoHeroico))
            const newPath = HEROIC_PATHS.find((p) => p.id === id)
            const current: string[] = (() => { try { return JSON.parse((form?.talentos ?? char.talentos) || '[]') } catch { return [] } })()
            const oldNames = oldPath ? [oldPath.mainTalent, ...oldPath.specialties.flatMap((s) => s.talentos.map((kt) => kt.name))] : []
            const filtered = current.filter((n) => !oldNames.includes(n))
            const next = newPath ? [newPath.mainTalent, ...filtered.filter((n) => n !== newPath.mainTalent)] : filtered
            setForm((prev) => prev ? { ...prev, caminoHeroico: id, talentos: JSON.stringify(next) } : prev)
          }}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'radiante' && (
        <BottomSheetPicker
          title="Camino Radiante"
          value={form?.caminoRadiante ?? ''}
          options={RADIANT_ORDERS.map((o) => ({
            id: o.id, label: o.name, sublabel: o.surges.join(' · '),
            color: o.color, colorBg: o.colorBg, colorBorder: o.colorBorder,
          }))}
          onChange={(id) => {
            const oldOrder = RADIANT_ORDERS.find((o) => o.id === (form?.caminoRadiante ?? char.caminoRadiante))
            const newOrder = RADIANT_ORDERS.find((o) => o.id === id)
            const current: string[] = (() => { try { return JSON.parse((form?.talentos ?? char.talentos) || '[]') } catch { return [] } })()
            // Remove old spren bond talentos + old potencia names + old potencia sub-talentos
            const oldSprenNames = oldOrder ? oldOrder.talentos.map((t) => t.name) : []
            const oldPotenciaNames = oldOrder
              ? oldOrder.surges.flatMap((s) => {
                  const p = POTENCIAS.find((p) => p.name === s)
                  if (!p) return []
                  return [p.name, ...p.talentos.map((t) => t.name)]
                })
              : []
            const filtered = current.filter((n) => !oldSprenNames.includes(n) && !oldPotenciaNames.includes(n))
            const mainName = newOrder?.talentos[0]?.name
            // Also auto-add the potencia name itself (base activation) for each surge
            const potenciaMainNames = (newOrder?.surges ?? []).filter((s): s is string => !!POTENCIAS.find((p) => p.name === s))
            const autoAdd = [mainName, ...potenciaMainNames].filter((n): n is string => !!n)
            const base = filtered.filter((n) => !autoAdd.includes(n))
            const next = [...autoAdd, ...base]
            // Update habilidadPersonalizada slots for new surges
            const surgeUpdates: Record<string, string | number> = {}
            const oldSurges = (oldOrder?.surges ?? []) as string[]
            // Clear old surge slots (check all 6 slots)
            for (let i = 1; i <= 6; i++) {
              const curName = ((form ?? char) as any)[`habilidadPersonalizada${i}`] as string
              if (oldSurges.includes(curName)) {
                surgeUpdates[`habilidadPersonalizada${i}`] = ''
                surgeUpdates[`habilidadPersonalizada${i}Valor`] = 0
                surgeUpdates[`habilidadPersonalizada${i}Atributo`] = ''
              }
            }
            // Assign each surge to its correct section slots (no cross-section fallback)
            for (const surge of newOrder?.surges ?? []) {
              const potencia = POTENCIAS.find((p) => p.name === surge)
              const code = potencia ? (ATRIBUTO_CODE[potencia.atributo] ?? '') : ''
              const sectionSlots: number[] = code ? (ATRIBUTO_SLOTS[code] ?? []) : []
              for (const slot of sectionSlots) {
                const curInSlot = (surgeUpdates[`habilidadPersonalizada${slot}`] as string | undefined)
                  ?? (((form ?? char) as any)[`habilidadPersonalizada${slot}`] as string)
                if (!curInSlot) {
                  surgeUpdates[`habilidadPersonalizada${slot}`] = surge
                  surgeUpdates[`habilidadPersonalizada${slot}Valor`] = 1
                  surgeUpdates[`habilidadPersonalizada${slot}Atributo`] = code
                  break
                }
              }
            }
            setForm((prev) => prev ? { ...prev, caminoRadiante: id, talentos: JSON.stringify(next), ...(surgeUpdates as any) } : prev)
          }}
          onClose={() => setPicker(null)}
        />
      )}

    </div>
  )
}
