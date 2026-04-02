import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Sword, Shield, Package, RefreshCw, X } from 'lucide-react'
import { catalogApi } from '../../api/catalog'
import { Spinner, ConfirmDialog } from '../../components/ui'
import { useCampaignStore } from '../../store/campaignStore'
import type { WeaponCatalog, ArmorCatalog, GearItem, CatalogOption } from '../../types'

type Tab = 'weapons' | 'armor' | 'gear'

type SelectedItem =
  | { kind: 'weapon'; item: WeaponCatalog; typeName: string; skillName: string; damageTypeName: string; rangeName: string; traits: string[]; expertTraits: string[] }
  | { kind: 'armor';  item: ArmorCatalog;  typeName: string; traits: string[]; expertTraits: string[] }
  | { kind: 'gear';   item: GearItem }

const TABS = [
  { key: 'weapons' as Tab, label: 'Armas',     icon: Sword,   accent: '#fb7185', bg: 'rgba(251,113,133,0.1)',  bgHover: 'rgba(251,113,133,0.25)' },
  { key: 'armor'   as Tab, label: 'Armaduras', icon: Shield,  accent: '#67e8f9', bg: 'rgba(103,232,249,0.08)', bgHover: 'rgba(103,232,249,0.22)' },
  { key: 'gear'    as Tab, label: 'Equipo',    icon: Package, accent: '#a78bfa', bg: 'rgba(167,139,250,0.1)',  bgHover: 'rgba(167,139,250,0.25)' },
]

function buildMap(options?: CatalogOption[]): Map<number, string> {
  const m = new Map<number, string>()
  options?.forEach((o) => m.set(o.id, o.name))
  return m
}

function TraitChip({ label, expert }: { label: string; expert?: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
      background: expert ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.06)',
      border: expert ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(255,255,255,0.1)',
      color: expert ? '#fbbf24' : 'var(--text-muted)',
      whiteSpace: 'nowrap' as const,
    }}>
      {expert ? '★ ' : ''}{label}
    </span>
  )
}

function EmptyState({ label }: { label: string }) {
  return (
    <p style={{ textAlign: 'center', padding: '48px 16px', fontSize: 13, color: 'var(--text-subtle)' }}>
      Sin {label} en el catálogo
    </p>
  )
}

// ── Detail sheet ─────────────────────────────────────────────
function DetailSheet({ selected, onClose }: { selected: SelectedItem; onClose: () => void }) {
  const tab = TABS.find((t) => t.key === (selected.kind === 'weapon' ? 'weapons' : selected.kind === 'armor' ? 'armor' : 'gear'))!

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
      />

      {/* Sheet */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 61,
        background: 'var(--surface-1)',
        borderRadius: '20px 20px 0 0',
        border: '1px solid var(--border-bright)',
        borderBottom: 'none',
        padding: `20px 20px calc(20px + var(--sab, 0px))`,
        maxHeight: '85vh',
        overflowY: 'auto',
      }}>
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--surface-3)' }} />
        </div>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, flexShrink: 0,
              background: tab.bg, border: `1px solid ${tab.bgHover}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <tab.icon size={18} style={{ color: tab.accent }} />
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                {selected.kind === 'weapon' ? selected.item.name
                  : selected.kind === 'armor' ? selected.item.name
                  : selected.item.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-subtle)', marginTop: 1 }}>
                {selected.kind === 'weapon' ? `${selected.typeName} · ${selected.rangeName}`
                  : selected.kind === 'armor' ? selected.typeName
                  : 'Equipo'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-subtle)', flexShrink: 0 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Weapon detail */}
        {selected.kind === 'weapon' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Damage */}
            <Section label="Daño">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  fontSize: 20, fontWeight: 900, fontFamily: 'monospace',
                  color: tab.accent, padding: '4px 14px', borderRadius: 10,
                  background: tab.bg, border: `1px solid ${tab.bgHover}`,
                }}>
                  {selected.item.damageDiceCount}d{selected.item.damageDiceValue}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{selected.damageTypeName}</span>
              </div>
            </Section>

            {/* Stats row */}
            <Section label="Estadísticas">
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <StatPill label="Habilidad" value={selected.skillName} />
                <StatPill label="Tipo" value={selected.typeName} />
                <StatPill label="Alcance" value={selected.rangeName} />
              </div>
            </Section>

            {/* Traits */}
            {(selected.traits.length > 0 || selected.expertTraits.length > 0) && (
              <Section label="Rasgos">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selected.traits.map((t) => <TraitChip key={t} label={t} />)}
                  {selected.expertTraits.map((t) => <TraitChip key={t + '-ex'} label={t} expert />)}
                </div>
              </Section>
            )}
          </div>
        )}

        {/* Armor detail */}
        {selected.kind === 'armor' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section label="Defensa">
              <span style={{
                fontSize: 20, fontWeight: 900,
                color: tab.accent, padding: '4px 14px', borderRadius: 10,
                background: tab.bg, border: `1px solid ${tab.bgHover}`,
              }}>
                +{selected.item.desvio} DEF
              </span>
            </Section>

            <Section label="Tipo">
              <StatPill label="Tipo" value={selected.typeName} />
            </Section>

            {(selected.traits.length > 0 || selected.expertTraits.length > 0) && (
              <Section label="Rasgos">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selected.traits.map((t) => <TraitChip key={t} label={t} />)}
                  {selected.expertTraits.map((t) => <TraitChip key={t + '-ex'} label={t} expert />)}
                </div>
              </Section>
            )}
          </div>
        )}

        {/* Gear detail */}
        {selected.kind === 'gear' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Section label="Detalles">
              <div style={{ display: 'flex', gap: 8 }}>
                <StatPill label="Peso" value={`${selected.item.weight} kg`} />
                <StatPill label="Precio" value={`${selected.item.price} mc`} />
              </div>
            </Section>
            {selected.item.description && (
              <Section label="Descripción">
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                  {selected.item.description}
                </p>
              </Section>
            )}
          </div>
        )}
      </div>
    </>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '7px 12px', borderRadius: 10,
      background: 'var(--surface-2)', border: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 9, fontWeight: 600, color: 'var(--text-subtle)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{value}</span>
    </div>
  )
}

// ── Weapon card ─────────────────────────────────────────────
function WeaponCard({ weapon, typeName, skillName, damageTypeName, rangeName, traits, expertTraits, accent, bg, bgHover, onClick }: {
  weapon: WeaponCatalog
  typeName: string; skillName: string; damageTypeName: string; rangeName: string
  traits: string[]; expertTraits: string[]
  accent: string; bg: string; bgHover: string
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const hasTraits = traits.length > 0 || expertTraits.length > 0

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
        background: 'var(--surface-1)',
        border: `1px solid ${hovered ? bgHover : 'var(--border)'}`,
        transition: 'border-color 0.15s, transform 0.15s',
        transform: hovered ? 'translateX(3px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: bg, border: `1px solid ${bgHover}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sword size={15} style={{ color: accent }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2 }}>{weapon.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{typeName} · {rangeName}</div>
          </div>
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div style={{
            fontSize: 13, fontWeight: 800, fontFamily: 'monospace',
            padding: '3px 10px', borderRadius: 8,
            background: bg, color: accent, border: `1px solid ${bgHover}`,
            marginBottom: 3,
          }}>
            {weapon.damageDiceCount}d{weapon.damageDiceValue}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-subtle)' }}>{damageTypeName}</div>
        </div>
      </div>

      {hasTraits && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
          {traits.map((t) => <TraitChip key={t} label={t} />)}
          {expertTraits.map((t) => <TraitChip key={t + '-ex'} label={t} expert />)}
        </div>
      )}

      <div style={{ marginTop: hasTraits ? 7 : 9, fontSize: 10, color: 'var(--text-subtle)', display: 'flex', gap: 4 }}>
        <span style={{ opacity: 0.55 }}>Habilidad:</span>
        <span>{skillName}</span>
      </div>
    </div>
  )
}

// ── Armor card ──────────────────────────────────────────────
function ArmorCard({ armor, typeName, traits, expertTraits, accent, bg, bgHover, onClick }: {
  armor: ArmorCatalog
  typeName: string; traits: string[]; expertTraits: string[]
  accent: string; bg: string; bgHover: string
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const hasTraits = traits.length > 0 || expertTraits.length > 0

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
        background: 'var(--surface-1)',
        border: `1px solid ${hovered ? bgHover : 'var(--border)'}`,
        transition: 'border-color 0.15s, transform 0.15s',
        transform: hovered ? 'translateX(3px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: bg, border: `1px solid ${bgHover}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield size={15} style={{ color: accent }} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2 }}>{armor.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{typeName}</div>
          </div>
        </div>

        <div style={{
          fontSize: 13, fontWeight: 800,
          padding: '3px 10px', borderRadius: 8, flexShrink: 0,
          background: bg, color: accent, border: `1px solid ${bgHover}`,
        }}>
          +{armor.desvio} DEF
        </div>
      </div>

      {hasTraits && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
          {traits.map((t) => <TraitChip key={t} label={t} />)}
          {expertTraits.map((t) => <TraitChip key={t + '-ex'} label={t} expert />)}
        </div>
      )}
    </div>
  )
}

// ── Gear card ───────────────────────────────────────────────
function GearCard({ gear, accent, bg, bgHover, onClick }: {
  gear: GearItem; accent: string; bg: string; bgHover: string; onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '13px 16px', borderRadius: 14, cursor: 'pointer',
        background: 'var(--surface-1)',
        border: `1px solid ${hovered ? bgHover : 'var(--border)'}`,
        transition: 'border-color 0.15s, transform 0.15s',
        transform: hovered ? 'translateX(3px)' : 'none',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: bg, border: `1px solid ${bgHover}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Package size={15} style={{ color: accent }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 2 }}>{gear.name}</div>
          {gear.description && (
            <div style={{ fontSize: 11, color: 'var(--text-subtle)', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {gear.description}
            </div>
          )}
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>{gear.weight} kg</div>
        <div style={{ fontSize: 11, color: 'var(--text-subtle)' }}>{gear.price} mc</div>
      </div>
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────
export function CatalogPage() {
  const [tab, setTab] = useState<Tab>('weapons')
  const [selected, setSelected] = useState<SelectedItem | null>(null)
  const [confirmReimport, setConfirmReimport] = useState(false)
  const { isGm } = useCampaignStore()
  const queryClient = useQueryClient()

  const reimportMutation = useMutation({
    mutationFn: catalogApi.reimport,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalog-weapons'] })
      queryClient.invalidateQueries({ queryKey: ['catalog-armor'] })
      queryClient.invalidateQueries({ queryKey: ['catalog-gear'] })
      queryClient.invalidateQueries({ queryKey: ['opts'] })
    },
  })

  // Item data
  const { data: weapons, isLoading: wLoad } = useQuery({ queryKey: ['catalog-weapons'], queryFn: catalogApi.getWeapons })
  const { data: armor,   isLoading: aLoad } = useQuery({ queryKey: ['catalog-armor'],   queryFn: catalogApi.getArmor })
  const { data: gear,    isLoading: gLoad } = useQuery({ queryKey: ['catalog-gear'],     queryFn: catalogApi.getGear })

  // Lookup options
  const { data: optWeaponType }  = useQuery({ queryKey: ['opts', 'WEAPON_TYPE'],  queryFn: () => catalogApi.getOptions('WEAPON_TYPE') })
  const { data: optSkill }       = useQuery({ queryKey: ['opts', 'SKILL'],        queryFn: () => catalogApi.getOptions('SKILL') })
  const { data: optDamageType }  = useQuery({ queryKey: ['opts', 'DAMAGE_TYPE'],  queryFn: () => catalogApi.getOptions('DAMAGE_TYPE') })
  const { data: optRange }       = useQuery({ queryKey: ['opts', 'RANGE'],        queryFn: () => catalogApi.getOptions('RANGE') })
  const { data: optWeaponTrait } = useQuery({ queryKey: ['opts', 'WEAPON_TRAIT'], queryFn: () => catalogApi.getOptions('WEAPON_TRAIT') })
  const { data: optArmorType }   = useQuery({ queryKey: ['opts', 'ARMOR_TYPE'],   queryFn: () => catalogApi.getOptions('ARMOR_TYPE') })
  const { data: optArmorTrait }  = useQuery({ queryKey: ['opts', 'ARMOR_TRAIT'],  queryFn: () => catalogApi.getOptions('ARMOR_TRAIT') })

  const wtMap  = buildMap(optWeaponType)
  const skMap  = buildMap(optSkill)
  const dtMap  = buildMap(optDamageType)
  const rMap   = buildMap(optRange)
  const wtrMap = buildMap(optWeaponTrait)
  const atMap  = buildMap(optArmorType)
  const atrMap = buildMap(optArmorTrait)

  const isLoading = wLoad || aLoad || gLoad
  const activeTab = TABS.find((t) => t.key === tab)!

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* ── Header ──────────────────────────────────────── */}
      <div style={{ padding: '28px 20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)' }}>
            Catálogo
          </h1>
          {isGm && (
            <button
              onClick={() => setConfirmReimport(true)}
              title="Reimportar catálogo base"
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 10px', borderRadius: 8, marginTop: 2,
                fontSize: 11, fontWeight: 600, cursor: 'pointer',
                background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                color: '#a78bfa',
              }}
            >
              <RefreshCw size={11} />
              Reimportar
            </button>
          )}
        </div>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          Equipo disponible en el sistema
        </p>

        {/* Tab selector */}
        <div style={{
          display: 'flex', gap: 6,
          background: 'var(--surface-1)', border: '1px solid var(--border)',
          borderRadius: 14, padding: 5,
        }}>
          {TABS.map(({ key, label, icon: Icon, accent, bg }) => {
            const active = tab === key
            return (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 10px', borderRadius: 10,
                  fontSize: 12, fontWeight: 600,
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  ...(active
                    ? { background: bg, color: accent, boxShadow: `0 2px 8px ${bg}` }
                    : { background: 'transparent', color: 'var(--text-subtle)' })
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-muted)' }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.color = 'var(--text-subtle)' }}
              >
                <Icon size={13} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div style={{ padding: '16px 20px 48px' }}>
        {isLoading && <Spinner />}

        {/* WEAPONS */}
        {tab === 'weapons' && !wLoad && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {weapons?.length === 0 && <EmptyState label="armas" />}
            {weapons?.map((w) => {
              const typeName        = wtMap.get(w.weaponTypeId) ?? '—'
              const skillName       = skMap.get(w.skillId) ?? '—'
              const damageTypeName  = dtMap.get(w.damageTypeId) ?? '—'
              const rangeName       = rMap.get(w.rangeId) ?? '—'
              const traits          = w.traitIds.map((id) => wtrMap.get(id) ?? '?')
              const expertTraits    = w.expertTraitIds.map((id) => wtrMap.get(id) ?? '?')
              return (
                <WeaponCard
                  key={w.id} weapon={w}
                  typeName={typeName} skillName={skillName}
                  damageTypeName={damageTypeName} rangeName={rangeName}
                  traits={traits} expertTraits={expertTraits}
                  accent={activeTab.accent} bg={activeTab.bg} bgHover={activeTab.bgHover}
                  onClick={() => setSelected({ kind: 'weapon', item: w, typeName, skillName, damageTypeName, rangeName, traits, expertTraits })}
                />
              )
            })}
          </div>
        )}

        {/* ARMOR */}
        {tab === 'armor' && !aLoad && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {armor?.length === 0 && <EmptyState label="armaduras" />}
            {armor?.map((a) => {
              const typeName     = atMap.get(a.armorTypeId) ?? '—'
              const traits       = a.traitIds.map((id) => atrMap.get(id) ?? '?')
              const expertTraits = a.expertTraitIds.map((id) => atrMap.get(id) ?? '?')
              return (
                <ArmorCard
                  key={a.id} armor={a}
                  typeName={typeName} traits={traits} expertTraits={expertTraits}
                  accent={activeTab.accent} bg={activeTab.bg} bgHover={activeTab.bgHover}
                  onClick={() => setSelected({ kind: 'armor', item: a, typeName, traits, expertTraits })}
                />
              )
            })}
          </div>
        )}

        {/* GEAR */}
        {tab === 'gear' && !gLoad && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {gear?.length === 0 && <EmptyState label="equipo" />}
            {gear?.map((g) => (
              <GearCard
                key={g.id} gear={g}
                accent={activeTab.accent} bg={activeTab.bg} bgHover={activeTab.bgHover}
                onClick={() => setSelected({ kind: 'gear', item: g })}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail sheet ────────────────────────────────── */}
      {selected && <DetailSheet selected={selected} onClose={() => setSelected(null)} />}

      <ConfirmDialog
        open={confirmReimport}
        title="Reimportar catálogo"
        message="Esto reemplazará todas las armas, armaduras, equipo y opciones con los datos base del sistema. ¿Continuar?"
        confirmLabel="Reimportar"
        onConfirm={() => { setConfirmReimport(false); reimportMutation.mutate() }}
        onCancel={() => setConfirmReimport(false)}
      />
    </div>
  )
}
