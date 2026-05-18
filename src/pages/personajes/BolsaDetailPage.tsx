import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Info, X } from 'lucide-react'
import { charactersApi } from '../../api/characters'
import { catalogApi } from '../../api/catalog'
import { Spinner } from '../../components/ui'
import type { Character, UpdateCharacterRequest, WeaponCatalog, ArmorCatalog, GearItem, CatalogOption } from '../../types'
import { HEROIC_PATHS } from '../../data/heroicPaths'
import { RADIANT_ORDERS } from '../../data/radiantOrders'
import { RadiantOrderIcon } from '../../components/RadiantOrderIcon'

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#7c3aed,#6366f1)',
  'linear-gradient(135deg,#0e7490,#0284c7)',
  'linear-gradient(135deg,#9d174d,#be185d)',
  'linear-gradient(135deg,#065f46,#0d9488)',
  'linear-gradient(135deg,#92400e,#b45309)',
  'linear-gradient(135deg,#4c1d95,#7c3aed)',
]

export function BolsaDetailPage() {
  const { campaignId, characterId } = useParams<{ campaignId: string; characterId: string }>()
  const cId = Number(campaignId)
  const charId = Number(characterId)
  const qc = useQueryClient()

  const [marcos, setMarcos] = useState({ infusas: 0, opacas: 0 })
  const [marcosDialog, setMarcosDialog] = useState<'add' | 'remove' | null>(null)
  const [marcosDelta, setMarcosDelta] = useState(1)
  const [itemPicker, setItemPicker] = useState<'weapon' | 'armor' | 'gear' | null>(null)
  const [confirmRemoveItem, setConfirmRemoveItem] = useState<{ type: 'weapon' | 'armor' | 'gear'; index: number; name: string } | null>(null)
  const [bolsaDetail, setBolsaDetail] = useState<{ kind: 'weapon' | 'armor' | 'gear'; name: string } | null>(null)

  const { data: character, isLoading } = useQuery<Character>({
    queryKey: ['character', cId, charId],
    queryFn: () => charactersApi.getById(cId, charId),
  })

  useEffect(() => {
    if (character) setMarcos({ infusas: character.marcosInfusas ?? 0, opacas: character.marcosOpacas ?? 0 })
  }, [character])

  const { data: catalogWeapons = [] } = useQuery<WeaponCatalog[]>({ queryKey: ['catalog', 'weapons'], queryFn: catalogApi.getWeapons })
  const { data: catalogArmor = [] }   = useQuery<ArmorCatalog[]>({  queryKey: ['catalog', 'armor'],   queryFn: catalogApi.getArmor })
  const { data: catalogGear = [] }    = useQuery<GearItem[]>({       queryKey: ['catalog', 'gear'],    queryFn: catalogApi.getGear })

  const { data: optWeaponType }  = useQuery<CatalogOption[]>({ queryKey: ['opts', 'WEAPON_TYPE'],  queryFn: () => catalogApi.getOptions('WEAPON_TYPE') })
  const { data: optSkill }       = useQuery<CatalogOption[]>({ queryKey: ['opts', 'SKILL'],        queryFn: () => catalogApi.getOptions('SKILL') })
  const { data: optDamageType }  = useQuery<CatalogOption[]>({ queryKey: ['opts', 'DAMAGE_TYPE'],  queryFn: () => catalogApi.getOptions('DAMAGE_TYPE') })
  const { data: optRange }       = useQuery<CatalogOption[]>({ queryKey: ['opts', 'RANGE'],        queryFn: () => catalogApi.getOptions('RANGE') })
  const { data: optWeaponTrait } = useQuery<CatalogOption[]>({ queryKey: ['opts', 'WEAPON_TRAIT'], queryFn: () => catalogApi.getOptions('WEAPON_TRAIT') })
  const { data: optArmorType }   = useQuery<CatalogOption[]>({ queryKey: ['opts', 'ARMOR_TYPE'],   queryFn: () => catalogApi.getOptions('ARMOR_TYPE') })
  const { data: optArmorTrait }  = useQuery<CatalogOption[]>({ queryKey: ['opts', 'ARMOR_TRAIT'],  queryFn: () => catalogApi.getOptions('ARMOR_TRAIT') })

  const buildOptMap     = (opts?: CatalogOption[]) => { const m = new Map<number, string>();        opts?.forEach((o) => m.set(o.id, o.name)); return m }
  const buildOptFullMap = (opts?: CatalogOption[]) => { const m = new Map<number, CatalogOption>(); opts?.forEach((o) => m.set(o.id, o));      return m }
  const wtMap  = buildOptMap(optWeaponType)
  const skMap  = buildOptMap(optSkill)
  const dtMap  = buildOptMap(optDamageType)
  const rMap   = buildOptMap(optRange)
  const atMap  = buildOptMap(optArmorType)
  const wtrMap = buildOptFullMap(optWeaponTrait)
  const atrMap = buildOptFullMap(optArmorTrait)

  const marcosMutation = useMutation({
    mutationFn: (m: { infusas: number; opacas: number }) =>
      charactersApi.update(cId, charId, { ...(character as UpdateCharacterRequest), marcosInfusas: m.infusas, marcosOpacas: m.opacas }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, charId] }),
  })

  const desvioMutation = useMutation({
    mutationFn: (patch: { equippedArmor: string; desvio: number }) =>
      charactersApi.update(cId, charId, { ...(character as UpdateCharacterRequest), ...patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, charId] }),
  })

  const itemsMutation = useMutation({
    mutationFn: (patch: { weapons?: string[]; armor?: string[]; equipment?: string[]; equippedArmor?: string; desvio?: number }) =>
      charactersApi.update(cId, charId, { ...(character as UpdateCharacterRequest), ...patch }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['character', cId, charId] }),
  })

  function applyMarcos(infusas: number, opacas: number) {
    const next = { infusas: Math.max(0, infusas), opacas: Math.max(0, opacas) }
    setMarcos(next)
    marcosMutation.mutate(next)
  }

  function addItem(type: 'weapon' | 'armor' | 'gear', name: string) {
    if (type === 'weapon') itemsMutation.mutate({ weapons: [...(character?.weapons ?? []), name] })
    else if (type === 'armor') itemsMutation.mutate({ armor: [...(character?.armor ?? []), name] })
    else itemsMutation.mutate({ equipment: [...(character?.equipment ?? []), name] })
    setItemPicker(null)
  }

  function removeItem(type: 'weapon' | 'armor' | 'gear', index: number) {
    if (type === 'weapon') {
      itemsMutation.mutate({ weapons: (character?.weapons ?? []).filter((_, i) => i !== index) })
    } else if (type === 'armor') {
      const removedName = (character?.armor ?? [])[index]
      const next = (character?.armor ?? []).filter((_, i) => i !== index)
      const wasEquipped = removedName && character?.equippedArmor === removedName
      itemsMutation.mutate({ armor: next, ...(wasEquipped ? { equippedArmor: '', desvio: 0 } : {}) })
    } else {
      itemsMutation.mutate({ equipment: (character?.equipment ?? []).filter((_, i) => i !== index) })
    }
    setConfirmRemoveItem(null)
  }

  if (isLoading || !character) return <Spinner />

  const gradient = AVATAR_GRADIENTS[character.id % AVATAR_GRADIENTS.length]
  const heroicPath = HEROIC_PATHS.find((p) => p.id === character.caminoHeroico)
  const radiantOrder = RADIANT_ORDERS.find((o) => o.id === character.caminoRadiante)
  const marcosTotal = marcos.infusas + marcos.opacas

  const getCapacity = (fuerza: number) => {
    if (fuerza === 0) return 22.5
    if (fuerza <= 2) return 45
    if (fuerza <= 4) return 112.5
    if (fuerza <= 6) return 225
    if (fuerza <= 8) return 1125
    return 2250
  }
  const capacity = getCapacity(character.fuerza ?? 0)
  const currentWeight =
    (character.weapons ?? []).reduce((sum, name) => sum + (catalogWeapons.find((w) => w.name === name)?.weight ?? 0), 0) +
    (character.armor ?? []).reduce((sum, name) => sum + (catalogArmor.find((a) => a.name === name)?.weight ?? 0), 0) +
    (character.equipment ?? []).reduce((sum, name) => sum + (catalogGear.find((g) => g.name === name)?.weight ?? 0), 0)
  const weightPct = Math.min(currentWeight / capacity, 1)
  const barColor = weightPct >= 1 ? '#f87171' : weightPct >= 0.75 ? '#fbbf24' : '#34d399'
  const weightLabel = Number.isInteger(currentWeight) ? `${currentWeight}` : currentWeight.toFixed(1)
  const capLabel = Number.isInteger(capacity) ? `${capacity}` : capacity.toFixed(1)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      {/* Hero header */}
      <div style={{ background: gradient, padding: '28px 20px 20px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.12, mixBlendMode: 'overlay', pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '200px',
        }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
              {character.name}
            </h1>
            <span style={{ fontSize: 10, fontWeight: 700, color: 'white', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 20, padding: '2px 8px', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
              Nv. {character.level}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 3 }}>
            {heroicPath && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}>
                {heroicPath.icon} {heroicPath.name}
              </span>
            )}
            {radiantOrder && (
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 7px', borderRadius: 20, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                <RadiantOrderIcon orderId={radiantOrder.id} size={10} />
                {radiantOrder.name}
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, margin: 0 }}>Bolsa</p>
        </div>
      </div>

      <div style={{ padding: '20px 16px 48px', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Marcos card */}
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
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
                <button onClick={() => applyMarcos(marcos.infusas - 1, marcos.opacas + 1)} disabled={marcos.infusas === 0 || marcosMutation.isPending}
                  style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 18, fontWeight: 700, cursor: (marcos.infusas === 0 || marcosMutation.isPending) ? 'not-allowed' : 'pointer', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (marcos.infusas === 0 || marcosMutation.isPending) ? 0.4 : 1 }}
                >{marcosMutation.isPending ? '…' : '−'}</button>
                <span style={{ fontSize: 28, fontWeight: 800, color: '#93c5fd', minWidth: 28 }}>{marcos.infusas}</span>
                <button onClick={() => applyMarcos(marcos.infusas + 1, marcos.opacas - 1)} disabled={marcos.opacas === 0 || marcosMutation.isPending}
                  style={{ width: 32, height: 32, borderRadius: '50%', fontSize: 18, fontWeight: 700, cursor: (marcos.opacas === 0 || marcosMutation.isPending) ? 'not-allowed' : 'pointer', background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: (marcos.opacas === 0 || marcosMutation.isPending) ? 0.4 : 1 }}
                >{marcosMutation.isPending ? '…' : '+'}</button>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 6 }}>brillantes</div>
            </div>
            <div style={{ flex: 1, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', letterSpacing: '0.08em', marginBottom: 8 }}>OPACAS</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-muted)', minWidth: 28 }}>{marcos.opacas}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-subtle)', marginTop: 6 }}>apagadas</div>
            </div>
          </div>
          {marcosTotal > 0 && (
            <div style={{ padding: '8px 16px 12px', fontSize: 11, color: 'var(--text-subtle)', textAlign: 'center' }}>
              Usa +/− en Infusas para cambiar el estado de un Marco
            </div>
          )}
        </div>

        {/* Weight capacity */}
        <div style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#34d399', letterSpacing: '0.08em' }}>CAPACIDAD DE CARGA</span>
            <span style={{ fontSize: 11, color: 'var(--text-subtle)' }}>Fuerza <strong style={{ color: 'var(--text)' }}>{character.fuerza ?? 0}</strong></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: barColor }}>{weightLabel}</span>
            <span style={{ fontSize: 13, color: 'var(--text-subtle)' }}>/ {capLabel} kg</span>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--surface-3)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${weightPct * 100}%`, borderRadius: 3, background: barColor, transition: 'width 0.3s, background 0.3s' }} />
          </div>
          {weightPct >= 1 && <div style={{ fontSize: 11, color: '#f87171', marginTop: 6, fontWeight: 600 }}>¡Sobrecargado!</div>}
        </div>

        {/* Item sections */}
        {([
          { type: 'weapon' as const, label: 'Armas',     items: character.weapons ?? [],   color: '#f87171', colorBg: 'rgba(239,68,68,0.1)',   colorBorder: 'rgba(239,68,68,0.25)' },
          { type: 'armor'  as const, label: 'Armaduras', items: character.armor ?? [],    color: '#fbbf24', colorBg: 'rgba(251,191,36,0.1)',  colorBorder: 'rgba(251,191,36,0.25)' },
          { type: 'gear'   as const, label: 'Equipo',    items: character.equipment ?? [], color: '#34d399', colorBg: 'rgba(52,211,153,0.1)', colorBorder: 'rgba(52,211,153,0.25)' },
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
            {items.map((name, idx) => {
              const equippedIndex = type === 'armor' ? items.findIndex((n) => n === character.equippedArmor) : -1
              const isEquipped = type === 'armor' && idx === equippedIndex
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderTop: idx > 0 ? '1px solid var(--border)' : 'none', background: isEquipped ? 'rgba(251,191,36,0.05)' : 'transparent' }}>
                  <span style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500, flex: 1 }}>{name}</span>
                  <button
                    onClick={() => setBolsaDetail({ kind: type, name })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)', display: 'flex', flexShrink: 0 }}
                  ><Info size={14} /></button>
                  {type === 'armor' && (
                    <button
                      onClick={() => {
                        const armorData = catalogArmor.find((a) => a.name === name)
                        desvioMutation.mutate(isEquipped ? { equippedArmor: '', desvio: 0 } : { equippedArmor: name, desvio: armorData?.desvio ?? 0 })
                      }}
                      style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 20, border: `1px solid ${isEquipped ? 'rgba(251,191,36,0.4)' : 'var(--border)'}`, background: isEquipped ? 'rgba(251,191,36,0.12)' : 'var(--surface-2)', color: isEquipped ? '#fbbf24' : 'var(--text-subtle)', cursor: 'pointer', flexShrink: 0 }}
                    >{isEquipped ? 'Equipada' : 'Equipar'}</button>
                  )}
                  <button
                    onClick={() => setConfirmRemoveItem({ type, index: idx, name })}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)', display: 'flex', flexShrink: 0 }}
                  ><Trash2 size={14} /></button>
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

      {/* Marcos dialog */}
      {marcosDialog && (
        <>
          <div onClick={() => setMarcosDialog(null)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71, background: 'var(--surface-1)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border-bright)', borderBottom: 'none', padding: '20px 20px calc(24px + var(--sab, 0px))' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>
              {marcosDialog === 'add' ? 'Añadir Marcos' : 'Gastar Marcos'}
            </div>
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
                  let toRemove = Math.min(marcosDelta, marcosTotal)
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

      {/* Item picker */}
      {itemPicker && (() => {
        const config = {
          weapon: { label: 'Armas',     items: catalogWeapons.map((w) => ({ id: w.name, label: w.name })) },
          armor:  { label: 'Armaduras', items: catalogArmor.map((a) => ({ id: a.name, label: a.name })) },
          gear:   { label: 'Equipo',    items: catalogGear.map((g) => ({ id: g.name, label: g.name })) },
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
                  <button key={item.id} onClick={() => addItem(itemPicker, item.id)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 12, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', textAlign: 'left', width: '100%' }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )
      })()}

      {/* Confirm remove */}
      {confirmRemoveItem && (
        <>
          <div onClick={() => setConfirmRemoveItem(null)} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} />
          <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71, background: 'var(--surface-1)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border-bright)', borderBottom: 'none', padding: '20px 20px calc(24px + var(--sab, 0px))' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
              <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>¿Retirar del inventario?</div>
            <div style={{ fontSize: 13, color: 'var(--text-subtle)', marginBottom: 24 }}>
              Se eliminará <strong style={{ color: 'var(--text)' }}>{confirmRemoveItem.name}</strong> del inventario de {character.name}.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmRemoveItem(null)} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}>Cancelar</button>
              <button onClick={() => removeItem(confirmRemoveItem.type, confirmRemoveItem.index)} style={{ flex: 1, padding: '12px', borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>Retirar</button>
            </div>
          </div>
        </>
      )}

      {/* Item detail sheet */}
      {bolsaDetail && (() => {
        const onClose = () => setBolsaDetail(null)
        const weapon = bolsaDetail.kind === 'weapon' ? catalogWeapons.find((w) => w.name === bolsaDetail.name) : null
        const armor  = bolsaDetail.kind === 'armor'  ? catalogArmor.find((a) => a.name === bolsaDetail.name)  : null
        const gear   = bolsaDetail.kind === 'gear'   ? catalogGear.find((g) => g.name === bolsaDetail.name)   : null
        const colors = {
          weapon: { accent: '#f87171', bg: 'rgba(239,68,68,0.1)',   bgHover: 'rgba(239,68,68,0.25)' },
          armor:  { accent: '#fbbf24', bg: 'rgba(251,191,36,0.1)',  bgHover: 'rgba(251,191,36,0.25)' },
          gear:   { accent: '#34d399', bg: 'rgba(52,211,153,0.1)',  bgHover: 'rgba(52,211,153,0.25)' },
        }[bolsaDetail.kind]
        return (
          <>
            <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 70, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }} />
            <div style={{ position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 71, background: 'var(--surface-1)', borderRadius: '20px 20px 0 0', border: '1px solid var(--border-bright)', borderBottom: 'none', padding: '20px 20px calc(20px + var(--sab, 0px))', maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>{bolsaDetail.name}</div>
                <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)' }}><X size={18} /></button>
              </div>

              {weapon && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Daño</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 20, fontWeight: 900, fontFamily: 'monospace', color: colors.accent, padding: '4px 14px', borderRadius: 10, background: colors.bg, border: `1px solid ${colors.bgHover}` }}>
                        {weapon.damageDiceCount}d{weapon.damageDiceValue}
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{dtMap.get(weapon.damageTypeId) ?? '—'}</span>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Estadísticas</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      {[{ label: 'Habilidad', value: skMap.get(weapon.skillId) ?? '—' }, { label: 'Tipo', value: wtMap.get(weapon.weaponTypeId) ?? '—' }, { label: 'Alcance', value: rMap.get(weapon.rangeId) ?? '—' }, { label: 'Peso', value: `${weapon.weight} kg` }].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '7px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(weapon.traitIds.length > 0 || weapon.expertTraitIds.length > 0) && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Rasgos</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {weapon.traitIds.map((id) => { const opt = wtrMap.get(id); return (
                          <div key={id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, marginTop: 1, flexShrink: 0, color: 'var(--text-subtle)' }}>·</span>
                            <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: opt?.description ? 2 : 0 }}>{opt?.name ?? id}</div>{opt?.description && <div style={{ fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.4 }}>{opt.description}</div>}</div>
                          </div>
                        )})}
                        {weapon.expertTraitIds.map((id) => { const opt = wtrMap.get(id); return (
                          <div key={`ex-${id}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, marginTop: 1, flexShrink: 0, color: '#fbbf24' }}>★</span>
                            <div><div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: opt?.description ? 2 : 0 }}>{opt?.name ?? id}</div>{opt?.description && <div style={{ fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.4 }}>{opt.description}</div>}</div>
                          </div>
                        )})}
                      </div>
                    </div>
                  )}
                  {weapon.description && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Descripción</div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{weapon.description}</p>
                    </div>
                  )}
                </div>
              )}

              {armor && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Defensa</div>
                    <span style={{ fontSize: 20, fontWeight: 900, color: colors.accent, padding: '4px 14px', borderRadius: 10, background: colors.bg, border: `1px solid ${colors.bgHover}` }}>+{armor.desvio} DEF</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Tipo</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
                      {[{ label: 'Tipo', value: atMap.get(armor.armorTypeId) ?? '—' }, { label: 'Peso', value: `${armor.weight} kg` }].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '7px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(armor.traitIds.length > 0 || armor.expertTraitIds.length > 0) && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Rasgos</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {armor.traitIds.map((id) => { const opt = atrMap.get(id); return (
                          <div key={id} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, marginTop: 1, flexShrink: 0, color: 'var(--text-subtle)' }}>·</span>
                            <div><div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: opt?.description ? 2 : 0 }}>{opt?.name ?? id}</div>{opt?.description && <div style={{ fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.4 }}>{opt.description}</div>}</div>
                          </div>
                        )})}
                        {armor.expertTraitIds.map((id) => { const opt = atrMap.get(id); return (
                          <div key={`ex-${id}`} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 12px', borderRadius: 10, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.2)' }}>
                            <span style={{ fontSize: 10, fontWeight: 700, marginTop: 1, flexShrink: 0, color: '#fbbf24' }}>★</span>
                            <div><div style={{ fontSize: 12, fontWeight: 700, color: '#fbbf24', marginBottom: opt?.description ? 2 : 0 }}>{opt?.name ?? id}</div>{opt?.description && <div style={{ fontSize: 11, color: 'var(--text-subtle)', lineHeight: 1.4 }}>{opt.description}</div>}</div>
                          </div>
                        )})}
                      </div>
                    </div>
                  )}
                  {armor.description && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Descripción</div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{armor.description}</p>
                    </div>
                  )}
                </div>
              )}

              {gear && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Detalles</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {[{ label: 'Peso', value: `${gear.weight} kg` }, { label: 'Precio', value: `${gear.price} mc` }].map(({ label, value }) => (
                        <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '7px 12px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                          <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {gear.description && (
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Descripción</div>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>{gear.description}</p>
                    </div>
                  )}
                </div>
              )}

              {!weapon && !armor && !gear && (
                <p style={{ fontSize: 13, color: 'var(--text-subtle)', textAlign: 'center', padding: '24px 0' }}>
                  No se encontró información en el catálogo.
                </p>
              )}
            </div>
          </>
        )
      })()}
    </div>
  )
}
