import { useEffect, useState } from 'react'
import { useParams, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit2, Save, X, Heart, ChevronDown, Trash2, Plus } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { catalogApi } from '../../api/catalog'
import type { WeaponCatalog, ArmorCatalog, GearItem } from '../../types'
import { useCampaignStore } from '../../store/campaignStore'
import { Input, Spinner } from '../../components/ui'
import type { Character, UpdateCharacterRequest } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'
import { TalentActivation } from '../../components/TalentActivation'
import type { ActivationType } from '../../components/TalentActivation'

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
    customN: 1,
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
    customN: 2,
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
    customN: 3,
  },
]

const BACKGROUND_FIELDS = [
  ['proposito', 'Propósito'], ['obstaculo', 'Obstáculo'], ['metas', 'Metas'],
  ['apariencia', 'Apariencia'], ['notas', 'Notas'],
]

type Tab = 'stats' | 'background' | 'bolsa' | 'talentos'

export function CharacterDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId), chId = Number(characterId)
  const qc = useQueryClient()
  const location = useLocation()
  const { isGm, currentCampaign } = useCampaignStore()
  const [editing, setEditing] = useState(!!(location.state as any)?.editing)
  const [form, setForm] = useState<Character | null>(null)
  const [tab, setTab] = useState<Tab>('stats')
  const [picker, setPicker] = useState<'heroico' | 'radiante' | 'ascendencia' | null>(null)
  const [marcos, setMarcos] = useState({ infusas: 0, opacas: 0 })
  const [marcosDialog, setMarcosDialog] = useState<'add' | 'remove' | null>(null)
  const [marcosDelta, setMarcosDelta] = useState(1)
  const [itemPicker, setItemPicker] = useState<'weapon' | 'armor' | 'gear' | null>(null)
  const [confirmRemoveItem, setConfirmRemoveItem] = useState<{ type: 'weapon' | 'armor' | 'gear'; index: number; name: string } | null>(null)
  const [talentoPicker, setTalentoPicker] = useState(false)

  const { data: char, isLoading } = useQuery<Character>({
    queryKey: ['character', cId, chId],
    queryFn: () => charactersApi.getById(cId, chId),
  })

  useEffect(() => { if (char) setForm({ ...char }) }, [char])
  useEffect(() => {
    if (char) setMarcos({ infusas: char.marcosInfusas ?? 0, opacas: char.marcosOpacas ?? 0 })
  }, [char])

  const updateMutation = useMutation({
    mutationFn: () => charactersApi.update(cId, chId, (form ?? char) as UpdateCharacterRequest),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['character', cId, chId] })
      setEditing(false)
    },
  })

  const marcosMutation = useMutation({
    mutationFn: (m: { infusas: number; opacas: number }) =>
      charactersApi.update(cId, chId, { ...(char as UpdateCharacterRequest), marcosInfusas: m.infusas, marcosOpacas: m.opacas }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, chId] }),
  })

  function applyMarcos(infusas: number, opacas: number) {
    const next = { infusas: Math.max(0, infusas), opacas: Math.max(0, opacas) }
    setMarcos(next)
    marcosMutation.mutate(next)
  }

  const desvioMutation = useMutation({
    mutationFn: (patch: { equippedArmor: string; desvio: number }) =>
      charactersApi.update(cId, chId, { ...(char as UpdateCharacterRequest), ...patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, chId] }),
  })

  const { data: catalogWeapons = [] } = useQuery<WeaponCatalog[]>({
    queryKey: ['catalog', 'weapons'],
    queryFn: catalogApi.getWeapons,
    enabled: tab === 'bolsa',
  })
  const { data: catalogArmor = [] } = useQuery<ArmorCatalog[]>({
    queryKey: ['catalog', 'armor'],
    queryFn: catalogApi.getArmor,
    enabled: tab === 'bolsa' || tab === 'stats',
  })
  const { data: catalogGear = [] } = useQuery<GearItem[]>({
    queryKey: ['catalog', 'gear'],
    queryFn: catalogApi.getGear,
    enabled: tab === 'bolsa',
  })

  const talentosMutation = useMutation({
    mutationFn: (names: string[]) =>
      charactersApi.update(cId, chId, { ...(char as UpdateCharacterRequest), talentos: JSON.stringify(names) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, chId] }),
  })

  const itemsMutation = useMutation({
    mutationFn: (patch: { weapons?: string[]; armor?: string[]; equipment?: string[]; equippedArmor?: string; desvio?: number }) =>
      charactersApi.update(cId, chId, { ...(char as UpdateCharacterRequest), ...patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, chId] }),
  })

  function addItem(type: 'weapon' | 'armor' | 'gear', name: string) {
    if (type === 'weapon') itemsMutation.mutate({ weapons: [...(char?.weapons ?? []), name] })
    else if (type === 'armor') itemsMutation.mutate({ armor: [...(char?.armor ?? []), name] })
    else itemsMutation.mutate({ equipment: [...(char?.equipment ?? []), name] })
    setItemPicker(null)
  }

  function removeItem(type: 'weapon' | 'armor' | 'gear', index: number) {
    if (type === 'weapon') {
      const next = (char?.weapons ?? []).filter((_, i) => i !== index)
      itemsMutation.mutate({ weapons: next })
    } else if (type === 'armor') {
      const removedName = (char?.armor ?? [])[index]
      const next = (char?.armor ?? []).filter((_, i) => i !== index)
      const wasEquipped = removedName && char?.equippedArmor === removedName
      itemsMutation.mutate({
        armor: next,
        ...(wasEquipped ? { equippedArmor: '', desvio: 0 } : {}),
      })
    } else {
      const next = (char?.equipment ?? []).filter((_, i) => i !== index)
      itemsMutation.mutate({ equipment: next })
    }
    setConfirmRemoveItem(null)
  }

  if (isLoading || !char) return <Spinner />

  const f = (editing && form ? form : char) as Character
  const set = (k: keyof UpdateCharacterRequest) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => prev ? { ...prev, [k]: e.target.type === 'number' ? Number(e.target.value) : e.target.value } : prev)

  const gradient = AVATAR_GRADIENTS[char.id % AVATAR_GRADIENTS.length]
  const marcosTotal = marcos.infusas + marcos.opacas

  const heroicPath = HEROIC_PATHS.find((p) => p.id === f.caminoHeroico)
  const radiantOrder = RADIANT_ORDERS.find((o) => o.id === f.caminoRadiante)

  // All talentos available from the character's paths
  type AvailableTalento = { name: string; activation: ActivationType | null; description: string; source: string; sourceColor: string }
  const availableTalentos: AvailableTalento[] = []
  if (heroicPath) {
    availableTalentos.push({ name: heroicPath.mainTalent, activation: null, description: heroicPath.mainTalentEffect, source: heroicPath.name, sourceColor: heroicPath.color })
    for (const spec of heroicPath.specialties)
      for (const kt of spec.keyTalents)
        availableTalentos.push({ name: kt.name, activation: kt.activation, description: kt.description, source: `${heroicPath.name} · ${spec.name}`, sourceColor: heroicPath.color })
  }
  if (radiantOrder) {
    for (const t of radiantOrder.talentos)
      availableTalentos.push({ name: t.name, activation: t.cost, description: t.description, source: radiantOrder.name, sourceColor: radiantOrder.color })
  }

  const selectedTalentos: string[] = (() => { try { return JSON.parse(f.talentos || '[]') } catch { return [] } })()
  const talentosMap = new Map(availableTalentos.map((t) => [t.name, t]))

  const tabs: { key: Tab; label: string }[] = [
    { key: 'stats', label: 'Stats' },
    { key: 'background', label: 'Trasfondo' },
    { key: 'talentos', label: 'Talentos' },
    { key: 'bolsa', label: 'Bolsa' },
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
                  {editing ? (
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
          {isGm && (
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
                  {editing ? (
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
                  {editing ? (
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

            {/* Físico / Cognitivo / Espiritual sections */}
            {SECTIONS.map((section) => {
              const defValue = section.defense(f)
              const n = section.customN as 1 | 2 | 3
              const nameKey = `habilidadPersonalizada${n}` as keyof typeof f
              const valorKey = `habilidadPersonalizada${n}Valor` as keyof typeof f
              const attrKey = `habilidadPersonalizada${n}Atributo` as keyof typeof f
              const customName = (f as any)[nameKey] as string
              const customBase = (f as any)[valorKey] as number ?? 0
              const customAttrCode = ((f as any)[attrKey] as string ?? '').toUpperCase()
              const customBonus = customAttrCode && ATTR_MAP[customAttrCode] ? (f as any)[ATTR_MAP[customAttrCode]] ?? 0 : 0
              const customTotal = customBase + customBonus

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

                    {/* Custom skill for this section */}
                    {(editing || customName) && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '8px 14px',
                        borderTop: `1px dashed ${section.colorBorder}`,
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
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* BACKGROUND TAB */}
        {tab === 'background' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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

        {/* TALENTOS TAB */}
        {tab === 'talentos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Header with add button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>
                {selectedTalentos.length} TALENTO{selectedTalentos.length !== 1 ? 'S' : ''}
              </span>
              <button
                onClick={() => setTalentoPicker(true)}
                disabled={availableTalentos.filter((t) => !selectedTalentos.includes(t.name)).length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 20, border: 'none', cursor: 'pointer',
                  background: 'rgba(251,191,36,0.12)', color: '#fbbf24',
                  fontSize: 12, fontWeight: 700,
                  opacity: availableTalentos.filter((t) => !selectedTalentos.includes(t.name)).length === 0 ? 0.4 : 1,
                }}
              >
                <Plus size={12} /> Añadir talento
              </button>
            </div>

            {/* No paths selected */}
            {!heroicPath && !radiantOrder && (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-subtle)', lineHeight: 1.5 }}>
                  Asigna un Camino Heroico u Orden Radiante en la pestaña Stats para ver los talentos disponibles.
                </p>
              </div>
            )}

            {/* Selected talentos */}
            {selectedTalentos.length === 0 && (heroicPath || radiantOrder) && (
              <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 14, padding: '28px 20px', textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-subtle)' }}>Ningún talento aprendido aún.</p>
              </div>
            )}
            {selectedTalentos.map((name) => {
              const t = talentosMap.get(name)
              const isMainTalent = heroicPath?.mainTalent === name || radiantOrder?.talentos[0]?.name === name
              const mainPath = heroicPath?.mainTalent === name ? heroicPath : radiantOrder?.talentos[0]?.name === name ? radiantOrder : null
              return (
                <div key={name} style={{ background: 'var(--surface-1)', border: `1px solid ${isMainTalent ? (mainPath?.colorBorder ?? 'var(--border)') : 'var(--border)'}`, borderRadius: 14, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{name}</span>
                      {isMainTalent && mainPath && (
                        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', padding: '2px 6px', borderRadius: 20, background: mainPath.colorBg, border: `1px solid ${mainPath.colorBorder}`, color: mainPath.color }}>
                          PRINCIPAL
                        </span>
                      )}
                      {t?.activation && <TalentActivation type={t.activation} compact />}
                      {t && (
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                          padding: '2px 6px', borderRadius: 20,
                          background: `color-mix(in srgb, ${t.sourceColor} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${t.sourceColor} 30%, transparent)`,
                          color: t.sourceColor,
                        }}>{t.source.toUpperCase()}</span>
                      )}
                    </div>
                    {!isMainTalent && (
                      <button
                        onClick={() => talentosMutation.mutate(selectedTalentos.filter((n) => n !== name))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 3, color: 'var(--text-subtle)', flexShrink: 0 }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#fb7185')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-subtle)')}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {t && <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{t.description}</p>}
                  {!t && <p style={{ fontSize: 12, color: 'var(--text-subtle)', margin: 0, fontStyle: 'italic' }}>Talento personalizado</p>}
                </div>
              )
            })}
          </div>
        )}

        {/* BOLSA TAB */}
        {tab === 'bolsa' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Marcos card */}
            <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

              {/* Header */}
              <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em' }}>MARCOS</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: 'white', lineHeight: 1.1, marginTop: 2 }}>
                    {marcosTotal}
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-subtle)', marginLeft: 6 }}>total</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { setMarcosDelta(1); setMarcosDialog('add') }}
                    style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399',
                    }}
                  >
                    + Añadir
                  </button>
                  <button
                    onClick={() => { setMarcosDelta(1); setMarcosDialog('remove') }}
                    disabled={marcosTotal === 0}
                    style={{
                      padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, cursor: marcosTotal === 0 ? 'not-allowed' : 'pointer',
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: marcosTotal === 0 ? 'var(--text-subtle)' : '#f87171',
                      opacity: marcosTotal === 0 ? 0.5 : 1,
                    }}
                  >
                    − Gastar
                  </button>
                </div>
              </div>

              {/* State row */}
              <div style={{ display: 'flex' }}>

                {/* Infusas */}
                <div style={{ flex: 1, padding: '14px 16px', borderRight: '1px solid var(--border)', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#60a5fa', letterSpacing: '0.08em', marginBottom: 8 }}>INFUSAS</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <button
                      onClick={() => applyMarcos(marcos.infusas - 1, marcos.opacas + 1)}
                      disabled={marcos.infusas === 0 || marcosMutation.isPending}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', fontSize: 18, fontWeight: 700,
                        cursor: (marcos.infusas === 0 || marcosMutation.isPending) ? 'not-allowed' : 'pointer',
                        background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: (marcos.infusas === 0 || marcosMutation.isPending) ? 0.4 : 1,
                      }}
                    >{marcosMutation.isPending ? '…' : '−'}</button>
                    <span style={{ fontSize: 28, fontWeight: 800, color: '#93c5fd', minWidth: 28 }}>{marcos.infusas}</span>
                    <button
                      onClick={() => applyMarcos(marcos.infusas + 1, marcos.opacas - 1)}
                      disabled={marcos.opacas === 0 || marcosMutation.isPending}
                      style={{
                        width: 32, height: 32, borderRadius: '50%', fontSize: 18, fontWeight: 700,
                        cursor: (marcos.opacas === 0 || marcosMutation.isPending) ? 'not-allowed' : 'pointer',
                        background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        opacity: (marcos.opacas === 0 || marcosMutation.isPending) ? 0.4 : 1,
                      }}
                    >{marcosMutation.isPending ? '…' : '+'}</button>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 6 }}>brillantes</div>
                </div>

                {/* Opacas */}
                <div style={{ flex: 1, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>OPACAS</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-muted)', minWidth: 28 }}>{marcos.opacas}</span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 6 }}>apagadas</div>
                </div>

              </div>

              {/* Hint */}
              {marcosTotal > 0 && (
                <div style={{ padding: '8px 16px 12px', fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center' }}>
                  Usa +/− en Infusas para cambiar el estado de un Marco
                </div>
              )}
            </div>

            {/* Items sections */}
            {([
              { type: 'weapon' as const, label: 'Armas', items: char.weapons ?? [], color: '#f87171', colorBg: 'rgba(239,68,68,0.1)', colorBorder: 'rgba(239,68,68,0.25)' },
              { type: 'armor' as const, label: 'Armaduras', items: char.armor ?? [], color: '#fbbf24', colorBg: 'rgba(251,191,36,0.1)', colorBorder: 'rgba(251,191,36,0.25)' },
              { type: 'gear' as const, label: 'Equipo', items: char.equipment ?? [], color: '#34d399', colorBg: 'rgba(52,211,153,0.1)', colorBorder: 'rgba(52,211,153,0.25)' },
            ] as const).map(({ type, label, items, color, colorBg, colorBorder }) => (
              <div key={type} style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

                {/* Section header */}
                <div style={{ padding: '12px 16px', borderBottom: items.length > 0 ? '1px solid var(--border)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.08em' }}>{label.toUpperCase()}</span>
                  <button
                    onClick={() => setItemPicker(type)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px',
                      borderRadius: 20, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                      background: colorBg, border: `1px solid ${colorBorder}`, color,
                    }}
                  >
                    <Plus size={11} />Añadir
                  </button>
                </div>

                {/* Item list */}
                {items.map((name, idx) => {
                  const isEquipped = type === 'armor' && char.equippedArmor === name
                  return (
                    <div key={idx} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 16px',
                      borderTop: idx > 0 ? '1px solid var(--border)' : 'none',
                      background: isEquipped ? 'rgba(251,191,36,0.05)' : 'transparent',
                    }}>
                      <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, flex: 1 }}>{name}</span>
                      {type === 'armor' && (
                        <button
                          onClick={() => {
                            const armorData = catalogArmor.find((a) => a.name === name)
                            desvioMutation.mutate(
                              isEquipped
                                ? { equippedArmor: '', desvio: 0 }
                                : { equippedArmor: name, desvio: armorData?.desvio ?? 0 }
                            )
                          }}
                          style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20,
                            border: `1px solid ${isEquipped ? 'rgba(251,191,36,0.4)' : 'var(--border)'}`,
                            background: isEquipped ? 'rgba(251,191,36,0.12)' : 'var(--surface-2)',
                            color: isEquipped ? '#fbbf24' : 'var(--text-subtle)',
                            cursor: 'pointer', flexShrink: 0,
                          }}
                        >
                          {isEquipped ? 'Equipada' : 'Equipar'}
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmRemoveItem({ type, index: idx, name })}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)', display: 'flex', flexShrink: 0 }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )
                })}

                {items.length === 0 && (
                  <div style={{ padding: '14px 16px', fontSize: 12, color: 'var(--text-subtle)', textAlign: 'center' }}>
                    Sin {label.toLowerCase()} equipadas
                  </div>
                )}
              </div>
            ))}

          </div>
        )}
      </div>

      {/* Marcos add/remove dialog */}
      {marcosDialog && (
        <>
          <div onClick={() => setMarcosDialog(null)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
            background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
            border: '1px solid var(--border-bright)', borderBottom: 'none',
            padding: '20px 20px calc(24px + var(--sab, 0px))',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              {marcosDialog === 'add' ? 'Añadir Marcos' : 'Gastar Marcos'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-subtle)', marginBottom: 20 }}>
              {marcosDialog === 'add'
                ? 'Los Marcos se añaden como Infusas.'
                : `Tienes ${marcosTotal} Marco${marcosTotal !== 1 ? 's' : ''}. Se gastan primero las Opacas.`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 24, marginBottom: 24 }}>
              <button
                onClick={() => setMarcosDelta((d) => Math.max(1, d - 1))}
                style={{ width: 40, height: 40, borderRadius: '50%', fontSize: 20, fontWeight: 700, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >−</button>
              <span style={{ fontSize: 32, fontWeight: 800, color: 'white', minWidth: 40, textAlign: 'center' }}>{marcosDelta}</span>
              <button
                onClick={() => setMarcosDelta((d) => marcosDialog === 'remove' ? Math.min(marcosTotal, d + 1) : d + 1)}
                style={{ width: 40, height: 40, borderRadius: '50%', fontSize: 20, fontWeight: 700, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >+</button>
            </div>
            <button
              onClick={() => {
                if (marcosDialog === 'add') {
                  applyMarcos(marcos.infusas + marcosDelta, marcos.opacas)
                } else {
                  // remove from opacas first, then infusas
                  let toRemove = Math.min(marcosDelta, marcosTotal)
                  const newOpacas = Math.max(0, marcos.opacas - toRemove)
                  const removed = marcos.opacas - newOpacas
                  const newInfusas = Math.max(0, marcos.infusas - (toRemove - removed))
                  applyMarcos(newInfusas, newOpacas)
                }
                setMarcosDialog(null)
              }}
              style={{
                width: '100%', padding: '13px', borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none',
                background: marcosDialog === 'add' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                color: marcosDialog === 'add' ? '#34d399' : '#f87171',
              }}
            >
              {marcosDialog === 'add' ? `Añadir ${marcosDelta} Marco${marcosDelta !== 1 ? 's' : ''}` : `Gastar ${marcosDelta} Marco${marcosDelta !== 1 ? 's' : ''}`}
            </button>
          </div>
        </>
      )}

      {/* Catalog item picker */}
      {itemPicker && (() => {
        const config = {
          weapon: { label: 'Armas', color: '#f87171', items: catalogWeapons.map((w) => ({ id: w.name, label: w.name })) },
          armor:  { label: 'Armaduras', color: '#fbbf24', items: catalogArmor.map((a) => ({ id: a.name, label: a.name })) },
          gear:   { label: 'Equipo', color: '#34d399', items: catalogGear.map((g) => ({ id: g.name, label: g.name })) },
        }[itemPicker]
        return (
          <>
            <div onClick={() => setItemPicker(null)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
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
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Añadir {config.label}</span>
                <button onClick={() => setItemPicker(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {config.items.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', padding: '20px 0' }}>Cargando...</p>
                )}
                {config.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => addItem(itemPicker, item.id)}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 14px', borderRadius: 12, cursor: 'pointer',
                        background: 'var(--surface-2)', border: '1px solid var(--border)',
                        color: 'var(--text)', textAlign: 'left', width: '100%',
                      }}
                    >
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
          <div style={{
            position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
            background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
            border: '1px solid var(--border-bright)', borderBottom: 'none',
            padding: '20px 20px calc(24px + var(--sab, 0px))',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>¿Retirar del inventario?</div>
            <div style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 24 }}>
              Se eliminará <strong style={{ color: 'var(--text)' }}>{confirmRemoveItem.name}</strong> del inventario de {char.name}.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setConfirmRemoveItem(null)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
              >Cancelar</button>
              <button
                onClick={() => removeItem(confirmRemoveItem.type, confirmRemoveItem.index)}
                style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
              >Retirar</button>
            </div>
          </div>
        </>
      )}

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
            const oldNames = oldPath ? [oldPath.mainTalent, ...oldPath.specialties.flatMap((s) => s.keyTalents.map((kt) => kt.name))] : []
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
            const oldNames = oldOrder ? oldOrder.talentos.map((t) => t.name) : []
            const filtered = current.filter((n) => !oldNames.includes(n))
            const mainName = newOrder?.talentos[0]?.name
            const next = mainName ? [mainName, ...filtered.filter((n) => n !== mainName)] : filtered
            setForm((prev) => prev ? { ...prev, caminoRadiante: id, talentos: JSON.stringify(next) } : prev)
          }}
          onClose={() => setPicker(null)}
        />
      )}

      {/* Talento picker */}
      {talentoPicker && (() => {
        const unselected = availableTalentos.filter((t) => !selectedTalentos.includes(t.name) && t.name !== heroicPath?.mainTalent && t.name !== radiantOrder?.talentos[0]?.name)
        return (
          <>
            <div onClick={() => setTalentoPicker(false)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
            <div style={{
              position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71,
              background: 'var(--surface-1)', borderRadius: '20px 20px 0 0',
              border: '1px solid var(--border-bright)', borderBottom: 'none',
              maxHeight: '75vh', display: 'flex', flexDirection: 'column',
              paddingBottom: 'calc(16px + var(--sab, 0px))',
            }}>
              <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0', flexShrink: 0 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px 14px', flexShrink: 0 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>Añadir talento</span>
                <button onClick={() => setTalentoPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)' }}>
                  <X size={18} />
                </button>
              </div>
              <div style={{ overflowY: 'auto', padding: '0 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {unselected.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => { talentosMutation.mutate([...selectedTalentos, t.name]); setTalentoPicker(false) }}
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 14px',
                      borderRadius: 12, cursor: 'pointer', textAlign: 'left', width: '100%',
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{t.name}</span>
                      {t.activation && <TalentActivation type={t.activation} compact />}
                      <span style={{
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
                        padding: '2px 6px', borderRadius: 20,
                        background: `color-mix(in srgb, ${t.sourceColor} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${t.sourceColor} 30%, transparent)`,
                        color: t.sourceColor,
                      }}>{t.source.toUpperCase()}</span>
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{t.description}</p>
                  </button>
                ))}
                {unselected.length === 0 && (
                  <p style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', padding: '20px 0' }}>
                    Ya has aprendido todos los talentos disponibles.
                  </p>
                )}
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}
