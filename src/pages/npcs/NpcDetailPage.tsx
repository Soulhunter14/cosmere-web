import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Save, X, Heart, Zap, Sparkles, Eye, EyeOff, ChevronDown, Trash2, Plus } from 'lucide-react'
import { npcsApi } from '../../api/npcs'
import { catalogApi } from '../../api/catalog'
import { useCampaignStore } from '../../store/campaignStore'
import { Input, Spinner } from '../../components/ui'
import type { Npc, WeaponCatalog, ArmorCatalog, GearItem } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#374151,#1f2937)',
  'linear-gradient(135deg,#7f1d1d,#991b1b)',
  'linear-gradient(135deg,#1e3a5f,#1e40af)',
  'linear-gradient(135deg,#14532d,#166534)',
  'linear-gradient(135deg,#4a1d96,#5b21b6)',
  'linear-gradient(135deg,#713f12,#92400e)',
]

const SECTIONS = [
  {
    key: 'fisico', label: 'Físico', color: '#f87171', colorBg: 'rgba(248,113,113,0.08)', colorBorder: 'rgba(248,113,113,0.2)',
    attrs: [['fuerza', 'FUE'], ['velocidad', 'VEL']] as [string, string][],
    defenseKeys: ['fuerza', 'velocidad'] as [string, string],
    skills: [
      ['agilidad', 'Agilidad', 'velocidad', 'VEL'],
      ['armasLigeras', 'Armas ligeras', 'velocidad', 'VEL'],
      ['armasPesadas', 'Armas pesadas', 'fuerza', 'FUE'],
      ['atletismo', 'Atletismo', 'fuerza', 'FUE'],
      ['hurto', 'Hurto', 'velocidad', 'VEL'],
      ['sigilo', 'Sigilo', 'velocidad', 'VEL'],
    ] as [string, string, string, string][],
    customIdx: 1,
  },
  {
    key: 'cognitivo', label: 'Cognitivo', color: '#60a5fa', colorBg: 'rgba(96,165,250,0.08)', colorBorder: 'rgba(96,165,250,0.2)',
    attrs: [['intelecto', 'INT'], ['discernimiento', 'DIS']] as [string, string][],
    defenseKeys: ['intelecto', 'discernimiento'] as [string, string],
    skills: [
      ['deduccion', 'Deducción', 'intelecto', 'INT'],
      ['disciplina', 'Disciplina', 'discernimiento', 'DIS'],
      ['intimidacion', 'Intimidación', 'discernimiento', 'DIS'],
      ['manufactura', 'Manufactura', 'intelecto', 'INT'],
      ['medicina', 'Medicina', 'intelecto', 'INT'],
      ['conocimiento', 'Conocimiento', 'intelecto', 'INT'],
    ] as [string, string, string, string][],
    customIdx: 2,
  },
  {
    key: 'espiritual', label: 'Espiritual', color: '#a78bfa', colorBg: 'rgba(167,139,250,0.08)', colorBorder: 'rgba(167,139,250,0.2)',
    attrs: [['voluntad', 'VOL'], ['presencia', 'PRE']] as [string, string][],
    defenseKeys: ['voluntad', 'presencia'] as [string, string],
    skills: [
      ['engano', 'Engaño', 'presencia', 'PRE'],
      ['liderazgo', 'Liderazgo', 'presencia', 'PRE'],
      ['percepcion', 'Percepción', 'discernimiento', 'DIS'],
      ['perspicacia', 'Perspicacia', 'discernimiento', 'DIS'],
      ['persuasion', 'Persuasión', 'presencia', 'PRE'],
      ['supervivencia', 'Supervivencia', 'voluntad', 'VOL'],
    ] as [string, string, string, string][],
    customIdx: 3,
  },
]

const BACKGROUND_FIELDS: [string, string][] = [
  ['proposito', 'Propósito'], ['obstaculo', 'Obstáculo'], ['metas', 'Metas'],
  ['apariencia', 'Apariencia'], ['notas', 'Notas'],
]

type Tab = 'stats' | 'background' | 'bolsa'

interface PickerOption { id: string; label: string; sublabel?: string; color: string; colorBg: string; colorBorder: string; icon?: string }

function BottomSheetPicker({ title, options, value, onChange, onClose }: {
  title: string; options: PickerOption[]; value: string; onChange: (id: string) => void; onClose: () => void
}) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
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
          >— Sin selección —</button>
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

function ResourceBar({ icon, label, value, max, color }: {
  icon: React.ReactNode; label: string; value: number; max: number; color: string
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {icon}
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.03em' }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>
          {value}<span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-subtle)' }}>/{max}</span>
        </span>
      </div>
      <div style={{ height: 5, borderRadius: 6, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 6, background: color, width: `${pct}%`, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  )
}

export function NpcDetailPage() {
  const { campaignId, npcId } = useParams<{ campaignId: string; npcId: string }>()
  const cId = Number(campaignId), nId = Number(npcId)
  const qc = useQueryClient()
  const location = useLocation()
  const { isGm } = useCampaignStore()
  const [editing, setEditing] = useState(!!(location.state as any)?.editing)
  const [form, setForm] = useState<Npc | null>(null)
  const [tab, setTab] = useState<Tab>('stats')
  const [picker, setPicker] = useState<'heroico' | 'radiante' | null>(null)
  const [marcos, setMarcos] = useState({ infusas: 0, opacas: 0 })
  const [marcosDialog, setMarcosDialog] = useState<'add' | 'remove' | null>(null)
  const [marcosDelta, setMarcosDelta] = useState(1)
  const [itemPicker, setItemPicker] = useState<'weapon' | 'armor' | 'gear' | null>(null)
  const [confirmRemoveItem, setConfirmRemoveItem] = useState<{ type: 'weapon' | 'armor' | 'gear'; index: number; name: string } | null>(null)
  const { data: npc, isLoading } = useQuery<Npc>({
    queryKey: ['npc', cId, nId],
    queryFn: () => npcsApi.getById(cId, nId),
  })

  useEffect(() => { if (npc) setForm({ ...npc }) }, [npc])
  useEffect(() => {
    if (npc) setMarcos({ infusas: npc.marcosInfusas ?? 0, opacas: npc.marcosOpacas ?? 0 })
  }, [npc])

  const updateMutation = useMutation({
    mutationFn: () => npcsApi.update(cId, nId, form ?? {}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['npc', cId, nId] }); setEditing(false) },
  })

  const toggleMutation = useMutation({
    mutationFn: (v: boolean) => npcsApi.toggleVisibility(cId, nId, v),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['npc', cId, nId] }),
  })

  const marcosMutation = useMutation({
    mutationFn: (m: { infusas: number; opacas: number }) =>
      npcsApi.update(cId, nId, { ...(npc as any), marcosInfusas: m.infusas, marcosOpacas: m.opacas }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['npc', cId, nId] }),
  })

  function applyMarcos(infusas: number, opacas: number) {
    const next = { infusas: Math.max(0, infusas), opacas: Math.max(0, opacas) }
    setMarcos(next)
    marcosMutation.mutate(next)
  }

  const { data: catalogWeapons = [] } = useQuery<WeaponCatalog[]>({
    queryKey: ['catalog', 'weapons'],
    queryFn: catalogApi.getWeapons,
    enabled: tab === 'bolsa',
  })
  const { data: catalogArmor = [] } = useQuery<ArmorCatalog[]>({
    queryKey: ['catalog', 'armor'],
    queryFn: catalogApi.getArmor,
    enabled: tab === 'bolsa',
  })
  const { data: catalogGear = [] } = useQuery<GearItem[]>({
    queryKey: ['catalog', 'gear'],
    queryFn: catalogApi.getGear,
    enabled: tab === 'bolsa',
  })

  const itemsMutation = useMutation({
    mutationFn: (patch: { weapons?: string[]; armor?: string[]; equipment?: string[] }) =>
      npcsApi.update(cId, nId, { ...(npc as any), ...patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['npc', cId, nId] }),
  })

  function addItem(type: 'weapon' | 'armor' | 'gear', name: string) {
    if (type === 'weapon') itemsMutation.mutate({ weapons: [...(npc!.weapons ?? []), name] })
    else if (type === 'armor') itemsMutation.mutate({ armor: [...(npc!.armor ?? []), name] })
    else itemsMutation.mutate({ equipment: [...(npc!.equipment ?? []), name] })
    setItemPicker(null)
  }

  function removeItem(type: 'weapon' | 'armor' | 'gear', index: number) {
    if (type === 'weapon') itemsMutation.mutate({ weapons: npc!.weapons.filter((_, i) => i !== index) })
    else if (type === 'armor') itemsMutation.mutate({ armor: npc!.armor.filter((_, i) => i !== index) })
    else itemsMutation.mutate({ equipment: npc!.equipment.filter((_, i) => i !== index) })
    setConfirmRemoveItem(null)
  }

  if (isLoading || !npc) return <Spinner />

  const f = (editing && form ? form : npc) as Npc
  const set = (k: keyof Npc) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => p ? { ...p, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value } : p)

  const gradient = npc.isVisibleToPlayers
    ? AVATAR_GRADIENTS[npc.id % AVATAR_GRADIENTS.length]
    : 'linear-gradient(135deg,#374151,#1f2937)'

  const marcosTotal = marcos.infusas + marcos.opacas

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stats', label: 'Stats' },
    { key: 'background', label: 'Trasfondo' },
    { key: 'bolsa', label: 'Bolsa' },
  ]

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>

      {/* ── Hero header ───────────────────────────────── */}
      <div style={{ background: gradient, padding: '28px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: 16, flexShrink: 0,
              background: 'rgba(0,0,0,0.25)',
              border: '2px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, fontWeight: 800, color: 'white',
              opacity: npc.isVisibleToPlayers ? 1 : 0.6,
            }}>
              {npc.name[0].toUpperCase()}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const, marginBottom: 4 }}>
                <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                  {editing ? (
                    <input
                      value={form?.name ?? ''}
                      onChange={(e) => setForm((p) => p ? { ...p, name: e.target.value } : p)}
                      style={{
                        background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.25)',
                        borderRadius: 8, padding: '2px 8px', color: 'white',
                        fontSize: 20, fontWeight: 800, outline: 'none', width: 180,
                      }}
                    />
                  ) : npc.name}
                </h1>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'white',
                  background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap' as const,
                }}>
                  {editing ? (
                    <>Nv. <input
                      type="number" min={1} max={20}
                      value={form?.level ?? 1}
                      onChange={set('level')}
                      style={{ background: 'transparent', border: 'none', color: 'white', fontSize: 10, fontWeight: 700, width: 28, outline: 'none' }}
                    /></>
                  ) : `Nv. ${npc.level}`}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#fbbf24',
                  background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
                  borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap' as const,
                }}>
                  {`Rango ${Math.ceil((editing ? (form?.level ?? 1) : npc.level) / 5)}`}
                </span>
                {/* Visibility badge */}
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                  padding: '2px 7px', borderRadius: 20,
                  ...(npc.isVisibleToPlayers
                    ? { background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }
                    : { background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' })
                }}>
                  {npc.isVisibleToPlayers ? 'Visible' : 'Oculto'}
                </span>
              </div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
                {f.ascendencia || 'NPC'}{f.caminoHeroico ? ` · ${f.caminoHeroico}` : ''}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' as const, justifyContent: 'flex-end' }}>
            {isGm && (
              <button
                onClick={() => toggleMutation.mutate(!npc.isVisibleToPlayers)}
                title={npc.isVisibleToPlayers ? 'Ocultar a jugadores' : 'Mostrar a jugadores'}
                style={{
                  display: 'flex', alignItems: 'center',
                  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.15)',
                  color: npc.isVisibleToPlayers ? '#67e8f9' : 'rgba(255,255,255,0.5)',
                  borderRadius: 9, padding: '6px 8px', cursor: 'pointer',
                }}
              >
                {npc.isVisibleToPlayers ? <EyeOff size={13} /> : <Eye size={13} />}
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
                      color: 'white', borderRadius: 9, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    <Save size={12} />{updateMutation.isPending ? '...' : 'Guardar'}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setForm({ ...npc }) }}
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
                  onClick={() => { setForm({ ...npc }); setEditing(true) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'white', borderRadius: 9, padding: '6px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  <Edit2 size={12} /> Editar
                </button>
              )
            )}
          </div>
        </div>

        {/* Resource bars */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' as const,
          background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '12px 14px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {editing ? (
            <div style={{ display: 'flex', flex: 1, gap: 10, flexWrap: 'wrap' as const }}>
              {[['health','Salud'],['maxHealth','Salud Máx'],['concentration','Concentración'],['maxConcentration','Conc. Máx'],['investiture','Investidura'],['maxInvestiture','Inv. Máx']].map(([k, label]) => (
                <div key={k} style={{ flex: 1, minWidth: 70 }}>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)', marginBottom: 4, fontWeight: 600 }}>{label}</div>
                  <Input type="number" min={0} value={(form as any)?.[k] ?? 0} onChange={set(k as keyof Npc)} style={{ padding: '4px 8px', fontSize: 13, textAlign: 'center' }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              <ResourceBar icon={<Heart size={12} style={{ color: '#fb7185' }} />} label="SALUD" value={f.health} max={f.maxHealth} color="linear-gradient(90deg,#f43f5e,#fb7185)" />
              {f.maxConcentration > 0 && (
                <ResourceBar icon={<Zap size={12} style={{ color: '#fbbf24' }} />} label="CONCENTRACIÓN" value={f.concentration} max={f.maxConcentration} color="linear-gradient(90deg,#d97706,#fbbf24)" />
              )}
              {f.maxInvestiture > 0 && (
                <ResourceBar icon={<Sparkles size={12} style={{ color: '#a78bfa' }} />} label="INVESTIDURA" value={f.investiture} max={f.maxInvestiture} color="linear-gradient(90deg,#7c3aed,#a78bfa)" />
              )}
            </>
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

        {/* STATS TAB */}
        {tab === 'stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Caminos */}
            {(() => {
              const path = HEROIC_PATHS.find((p) => p.id === f.caminoHeroico)
              const order = RADIANT_ORDERS.find((o) => o.id === f.caminoRadiante)
              return (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {/* Camino Heroico */}
                  {editing ? (
                    <button onClick={() => setPicker('heroico')} style={{
                      background: path ? path.colorBg : 'var(--surface-1)', border: `1px solid ${path ? path.colorBorder : 'var(--border)'}`,
                      borderRadius: 14, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', flexDirection: 'column' as const, gap: 6,
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>CAMINO HEROICO</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: path ? path.color : 'var(--text-subtle)' }}>
                          {path ? `${path.icon} ${path.name}` : '— Sin camino —'}
                        </span>
                        <ChevronDown size={12} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                      </div>
                    </button>
                  ) : (
                    <div style={{ background: path ? path.colorBg : 'var(--surface-1)', border: `1px solid ${path ? path.colorBorder : 'var(--border)'}`, borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>CAMINO HEROICO</div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: path ? path.color : 'var(--text-subtle)' }}>
                        {path ? `${path.icon} ${path.name}` : '—'}
                      </span>
                    </div>
                  )}

                  {/* Camino Radiante */}
                  {editing ? (
                    <button onClick={() => setPicker('radiante')} style={{
                      background: order ? order.colorBg : 'var(--surface-1)', border: `1px solid ${order ? order.colorBorder : 'var(--border)'}`,
                      borderRadius: 14, padding: '12px 14px', cursor: 'pointer', textAlign: 'left',
                      display: 'flex', flexDirection: 'column' as const, gap: 6,
                    }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>CAMINO RADIANTE</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        {order ? <RadiantOrderIcon orderId={order.id} size={20} /> : <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>— Sin orden —</span>}
                        <ChevronDown size={12} style={{ color: 'var(--text-subtle)', flexShrink: 0 }} />
                      </div>
                    </button>
                  ) : (
                    <div style={{ background: order ? order.colorBg : 'var(--surface-1)', border: `1px solid ${order ? order.colorBorder : 'var(--border)'}`, borderRadius: 14, padding: '12px 14px', display: 'flex', flexDirection: 'column' as const, gap: 6 }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>CAMINO RADIANTE</div>
                      {order ? <RadiantOrderIcon orderId={order.id} size={20} /> : <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>—</span>}
                    </div>
                  )}
                </div>
              )
            })()}

            {/* Sections: Físico / Cognitivo / Espiritual */}
            {SECTIONS.map((section) => {
              const customIdx = section.customIdx
              const nameKey = `habilidadPersonalizada${customIdx}` as keyof Npc
              const valorKey = `habilidadPersonalizada${customIdx}Valor` as keyof Npc
              const attrKey = `habilidadPersonalizada${customIdx}Atributo` as keyof Npc
              const customName = (f as any)[nameKey] as string
              const customVal = (f as any)[valorKey] as number
              const customAttr = (f as any)[attrKey] as string
              const customAttrVal = customAttr ? ((f as any)[customAttr.toLowerCase()] ?? 0) : 0
              const customTotal = customVal + customAttrVal

              const defense = 10 + ((f as any)[section.defenseKeys[0]] ?? 0) + ((f as any)[section.defenseKeys[1]] ?? 0)

              return (
                <div key={section.key} style={{
                  background: 'var(--surface-1)', border: `1px solid ${section.colorBorder}`,
                  borderRadius: 16, overflow: 'hidden',
                }}>
                  {/* Section header */}
                  <div style={{
                    padding: '10px 14px', background: section.colorBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: section.color, letterSpacing: '0.1em' }}>
                      {section.label.toUpperCase()}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)' }}>
                      Def. <span style={{ color: section.color }}>{defense}</span>
                    </span>
                  </div>

                  {/* Attributes */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1, padding: '12px 14px', borderBottom: `1px solid ${section.colorBorder}` }}>
                    {section.attrs.map(([k, label]) => (
                      <div key={k} style={{ textAlign: 'center' }}>
                        {editing ? (
                          <Input
                            type="number" min={0} max={5}
                            value={(form as any)?.[k] ?? 0}
                            onChange={set(k as keyof Npc)}
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

                  {/* Skills */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                    {section.skills.map(([k, label, attrKey2, attrLabel], idx) => {
                      const base = (f as any)[k] ?? 0
                      const bonus = (f as any)[attrKey2] ?? 0
                      const total = base + bonus
                      const pct = Math.min(100, (total / 15) * 100)
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
                          }}>{attrLabel}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, flex: 1, minWidth: 0 }}>{label}</span>
                          {editing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              <Input
                                type="number" min={0} max={10}
                                value={base}
                                onChange={set(k as keyof Npc)}
                                style={{ width: 52, padding: '3px 6px', textAlign: 'center', fontSize: 13 }}
                              />
                              <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>+{bonus}</span>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <div style={{ width: 50, height: 3, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                <div style={{ height: '100%', borderRadius: 4, background: section.color, width: `${pct}%` }} />
                              </div>
                              <span style={{ fontSize: 11, color: 'var(--text-subtle)', minWidth: 28, textAlign: 'right' }}>{base}+{bonus}</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: total > 0 ? 'white' : 'var(--text-subtle)', minWidth: 20, textAlign: 'right' }}>{total}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}

                    {/* Custom skill */}
                    {(editing || customName) && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 14px', borderTop: `1px dashed ${section.colorBorder}`,
                      }}>
                        {editing ? (
                          <>
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
                            <Input
                              value={(form as any)?.[nameKey] ?? ''}
                              onChange={(e) => setForm((prev) => prev ? { ...prev, [nameKey]: e.target.value } : prev)}
                              placeholder="Habilidad personalizada..."
                              style={{ flex: 1, fontSize: 13 }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                              <Input
                                type="number" min={0} max={10}
                                value={(form as any)?.[valorKey] ?? 0}
                                onChange={(e) => setForm((prev) => prev ? { ...prev, [valorKey]: Number(e.target.value) } : prev)}
                                style={{ width: 52, padding: '3px 6px', textAlign: 'center', fontSize: 13 }}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <span style={{
                              fontSize: 9, fontWeight: 700, color: section.color,
                              background: section.colorBg, border: `1px solid ${section.colorBorder}`,
                              borderRadius: 4, padding: '2px 5px', flexShrink: 0, letterSpacing: '0.04em',
                            }}>{customAttr || '—'}</span>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500, flex: 1 }}>{customName}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                              <span style={{ fontSize: 11, color: 'var(--text-subtle)', minWidth: 28, textAlign: 'right' }}>{customVal}+{customAttrVal}</span>
                              <span style={{ fontSize: 14, fontWeight: 700, color: customTotal > 0 ? 'white' : 'var(--text-subtle)', minWidth: 20, textAlign: 'right' }}>{customTotal}</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Talentos */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.06)', borderBottom: '1px solid rgba(251,191,36,0.15)' }}>
                <span style={{ fontSize: 11, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.1em' }}>TALENTOS</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                {editing
                  ? <Input value={form?.talentos ?? ''} onChange={set('talentos')} placeholder="Rasgos especiales..." />
                  : <p style={{ fontSize: 13, color: f.talentos ? 'var(--text)' : 'var(--text-subtle)', lineHeight: 1.6, whiteSpace: 'pre-line' as const }}>
                      {f.talentos || '—'}
                    </p>
                }
              </div>
            </div>
          </div>
        )}

        {/* BACKGROUND TAB */}
        {tab === 'background' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {BACKGROUND_FIELDS.map(([k, label]) => (
              <div key={k} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>
                  {label.toUpperCase()}
                </div>
                {editing ? (
                  <Input value={(form as any)?.[k] ?? ''} onChange={set(k as keyof Npc)} placeholder={`${label}...`} />
                ) : (
                  <p style={{ fontSize: 14, color: (f as any)[k] ? 'var(--text)' : 'var(--text-subtle)', lineHeight: 1.5 }}>
                    {(f as any)[k] || '—'}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* BOLSA TAB */}
        {tab === 'bolsa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Marcos */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>MARCOS</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.1, marginTop: 2 }}>
                    {marcosTotal}<span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-subtle)', marginLeft: 6 }}>total</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setMarcosDelta(1); setMarcosDialog('add') }}
                    style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}
                  >+ Añadir</button>
                  <button
                    onClick={() => { setMarcosDelta(1); setMarcosDialog('remove') }}
                    disabled={marcosTotal === 0}
                    style={{ padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: marcosTotal === 0 ? 'not-allowed' : 'pointer', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: marcosTotal === 0 ? 'var(--text-subtle)' : '#f87171', opacity: marcosTotal === 0 ? 0.5 : 1 }}
                  >− Gastar</button>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: 1, padding: '14px 16px', borderRight: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.08em', marginBottom: 8 }}>INFUSAS</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <button
                      onClick={() => applyMarcos(marcos.infusas - 1, marcos.opacas + 1)}
                      disabled={marcos.infusas === 0 || marcosMutation.isPending}
                      style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 18, fontWeight: 700, cursor: (marcos.infusas === 0 || marcosMutation.isPending) ? 'not-allowed' : 'pointer', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (marcos.infusas === 0 || marcosMutation.isPending) ? 0.4 : 1 }}
                    >{marcosMutation.isPending ? '…' : '−'}</button>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#93c5fd', minWidth: 28 }}>{marcos.infusas}</span>
                    <button
                      onClick={() => applyMarcos(marcos.infusas + 1, marcos.opacas - 1)}
                      disabled={marcos.opacas === 0 || marcosMutation.isPending}
                      style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 18, fontWeight: 700, cursor: (marcos.opacas === 0 || marcosMutation.isPending) ? 'not-allowed' : 'pointer', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (marcos.opacas === 0 || marcosMutation.isPending) ? 0.4 : 1 }}
                    >{marcosMutation.isPending ? '…' : '+'}</button>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 6 }}>brillantes</div>
                </div>
                <div style={{ flex: 1, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>OPACAS</div>
                  <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-muted)', minWidth: 28 }}>{marcos.opacas}</span>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 6 }}>apagadas</div>
                </div>
              </div>
              {marcosTotal > 0 && (
                <div style={{ padding: '8px 16px 12px', fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center' }}>
                  Usa +/− en Infusas para cambiar el estado de un Marco
                </div>
              )}
            </div>

            {/* Items */}
            {([
              { type: 'weapon' as const, label: 'Armas', items: npc.weapons ?? [], color: '#f87171', colorBg: 'rgba(239,68,68,0.1)', colorBorder: 'rgba(239,68,68,0.25)' },
              { type: 'armor' as const, label: 'Armaduras', items: npc.armor ?? [], color: '#fbbf24', colorBg: 'rgba(251,191,36,0.1)', colorBorder: 'rgba(251,191,36,0.25)' },
              { type: 'gear' as const, label: 'Equipo', items: npc.equipment ?? [], color: '#34d399', colorBg: 'rgba(52,211,153,0.1)', colorBorder: 'rgba(52,211,153,0.25)' },
            ] as const).map(({ type, label, items, color, colorBg, colorBorder }) => (
              <div key={type} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: items.length > 0 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.08em' }}>{label.toUpperCase()}</span>
                  <button
                    onClick={() => setItemPicker(type)}
                    style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer', background: colorBg, border: `1px solid ${colorBorder}`, color }}
                  >
                    <Plus size={11} />Añadir
                  </button>
                </div>
                {items.map((name, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: idx > 0 ? '1px solid var(--border)' : 'none' }}>
                    <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{name}</span>
                    <button onClick={() => setConfirmRemoveItem({ type, index: idx, name })} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)', display: 'flex' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {items.length === 0 && (
                  <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center' }}>Sin {label.toLowerCase()} equipadas</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Marcos dialog */}
      {marcosDialog && (
        <>
          <div onClick={() => setMarcosDialog(null)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71, background: 'var(--surface-1)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border-bright)', borderBottom: 'none', padding: '20px 20px calc(24px + var(--sab, 0px))' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>{marcosDialog === 'add' ? 'Añadir Marcos' : 'Gastar Marcos'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 20 }}>
              {marcosDialog === 'add' ? 'Los Marcos se añaden como Infusas.' : `Tienes ${marcosTotal} Marco${marcosTotal !== 1 ? 's' : ''}. Se gastan primero las Opacas.`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
              <button onClick={() => setMarcosDelta((d) => Math.max(1, d - 1))} style={{ width: 40, height: 40, borderRadius: '50%', fontSize: 20, fontWeight: 700, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
              <span style={{ fontSize: 32, fontWeight: 800, color: 'white', minWidth: 40, textAlign: 'center' }}>{marcosDelta}</span>
              <button onClick={() => setMarcosDelta((d) => marcosDialog === 'remove' ? Math.min(marcosTotal, d + 1) : d + 1)} style={{ width: 40, height: 40, borderRadius: '50%', fontSize: 20, fontWeight: 700, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
            </div>
            <button
              onClick={() => {
                if (marcosDialog === 'add') {
                  applyMarcos(marcos.infusas + marcosDelta, marcos.opacas)
                } else {
                  const toRemove = Math.min(marcosDelta, marcosTotal)
                  const newOpacas = Math.max(0, marcos.opacas - toRemove)
                  const removed = marcos.opacas - newOpacas
                  const newInfusas = Math.max(0, marcos.infusas - (toRemove - removed))
                  applyMarcos(newInfusas, newOpacas)
                }
                setMarcosDialog(null)
              }}
              style={{ width: '100%', padding: '13px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', background: marcosDialog === 'add' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: marcosDialog === 'add' ? '#34d399' : '#f87171' }}
            >
              {marcosDialog === 'add' ? `Añadir ${marcosDelta} Marco${marcosDelta !== 1 ? 's' : ''}` : `Gastar ${marcosDelta} Marco${marcosDelta !== 1 ? 's' : ''}`}
            </button>
          </div>
        </>
      )}

      {/* Catalog item picker */}
      {itemPicker && (() => {
        const config = {
          weapon: { label: 'Armas', items: catalogWeapons.map((w) => ({ id: w.name, label: w.name })) },
          armor:  { label: 'Armaduras', items: catalogArmor.map((a) => ({ id: a.name, label: a.name })) },
          gear:   { label: 'Equipo', items: catalogGear.map((g) => ({ id: g.name, label: g.name })) },
        }[itemPicker]
        return (
          <>
            <div onClick={() => setItemPicker(null)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71, background: 'var(--surface-1)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border-bright)', borderBottom: 'none', maxHeight: '70vh', display: 'flex', flexDirection: 'column', paddingBottom: 'calc(16px + var(--sab, 0px))' }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 16px', flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Añadir {config.label}</span>
                <button onClick={() => setItemPicker(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)' }}><X size={18} /></button>
              </div>
              <div style={{ overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {config.items.length === 0 && <p style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>}
                {config.items.map((item) => (
                  <button key={item.id} onClick={() => addItem(itemPicker, item.id)} style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', textAlign: 'left', width: '100%' }}>
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )
      })()}

      {/* Confirm remove item */}
      {confirmRemoveItem && (
        <>
          <div onClick={() => setConfirmRemoveItem(null)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71, background: 'var(--surface-1)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border-bright)', borderBottom: 'none', padding: '20px 20px calc(24px + var(--sab, 0px))' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>¿Retirar del inventario?</div>
            <div style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 24 }}>
              Se eliminará <strong style={{ color: 'var(--text)' }}>{confirmRemoveItem.name}</strong> del inventario de {npc.name}.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmRemoveItem(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancelar</button>
              <button onClick={() => removeItem(confirmRemoveItem.type, confirmRemoveItem.index)} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>Retirar</button>
            </div>
          </div>
        </>
      )}

      {/* Path pickers */}
      {picker === 'heroico' && (
        <BottomSheetPicker
          title="Camino Heroico"
          value={form?.caminoHeroico ?? ''}
          options={HEROIC_PATHS.map((p) => ({ id: p.id, label: p.name, color: p.color, colorBg: p.colorBg, colorBorder: p.colorBorder, icon: p.icon }))}
          onChange={(id) => setForm((prev) => prev ? { ...prev, caminoHeroico: id } : prev)}
          onClose={() => setPicker(null)}
        />
      )}
      {picker === 'radiante' && (
        <BottomSheetPicker
          title="Camino Radiante"
          value={form?.caminoRadiante ?? ''}
          options={RADIANT_ORDERS.map((o) => ({ id: o.id, label: o.name, sublabel: o.surges.join(' · '), color: o.color, colorBg: o.colorBg, colorBorder: o.colorBorder }))}
          onChange={(id) => setForm((prev) => prev ? { ...prev, caminoRadiante: id } : prev)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  )
}
